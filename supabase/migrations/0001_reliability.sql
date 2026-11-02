create function touch_updated_at() returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;

create table services (
 id uuid primary key default gen_random_uuid(), code text unique not null, name text not null,
 owner text not null default '', policy text not null default '', review_due date,
 retention_purpose text not null default '', retention_review date,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table objectives (
 id uuid primary key default gen_random_uuid(), service_id uuid not null references services,
 code text unique not null, name text not null, mode text not null check(mode in ('daily-counts','nobl9')),
 target numeric not null check(target>0 and target<1), window_days integer check(window_days between 1 and 366),
 source_key text unique, source_config jsonb not null default '{}',
 created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
 check(mode<>'daily-counts' or window_days is not null)
);
create table daily_counts (
 id uuid primary key default gen_random_uuid(), objective_id uuid not null references objectives,
 day date not null, good bigint not null check(good>=0), total bigint not null check(total>=good),
 source text not null check(length(trim(source))>0), unique(objective_id,day),
 created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table measurements (
 id uuid primary key default gen_random_uuid(), objective_id uuid not null references objectives,
 observed_at timestamptz not null, measurement text not null, value numeric not null,
 window_start timestamptz not null, window_end timestamptz not null check(window_end>=window_start),
 original jsonb not null, source text not null,
 unique(objective_id,observed_at,measurement,window_start,window_end),
 created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table actions (
 id uuid primary key default gen_random_uuid(), service_id uuid not null references services,
 title text not null, owner text not null, due date not null,
 status text not null default 'open' check(status in ('open','closed')), resolution text,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
 check(status<>'closed' or length(trim(resolution))>0)
);
create table decisions (
 id uuid primary key default gen_random_uuid(), service_id uuid not null references services,
 decision text not null check(decision in ('hold','proceed')), note text not null, actor text not null,
 evidence jsonb not null, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table audit (
 id uuid primary key default gen_random_uuid(), actor text not null, command text not null,
 detail jsonb not null, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
do $$ declare t text; begin
 foreach t in array array['services','objectives','daily_counts','measurements','actions','decisions','audit'] loop
 execute format('create trigger touch before update on %I for each row execute function touch_updated_at()',t);
 execute format('alter table %I enable row level security',t);
 execute format('revoke all on %I from public',t);
 end loop;
end $$;

-- Native windows contain complete UTC days ending yesterday. Missing days never count as good.
create view daily_budgets as
select o.id, o.service_id, o.code, o.name, o.target, o.window_days,
 count(c.id)::integer as covered_days, max(c.day) as latest_day,
 coalesce(sum(c.total),0)::numeric as total_events,
 coalesce(sum(c.total-c.good),0)::numeric as bad_events,
 round(100*sum(c.good)::numeric/nullif(sum(c.total),0),4) as reliability_pct,
 round(sum(c.total)*(1-o.target),4) as allowed_bad,
 round(100*(1-sum(c.total-c.good)::numeric/nullif(sum(c.total)*(1-o.target),0)),2) as remaining_pct,
 count(c.id)=o.window_days and coalesce(sum(c.total),0)>0 as complete
from objectives o left join daily_counts c on c.objective_id=o.id
 and c.day >= (now() at time zone 'UTC')::date-o.window_days and c.day < (now() at time zone 'UTC')::date
where o.mode='daily-counts' group by o.id;

create view imported_budgets as
select o.id,o.service_id,o.code,o.name,o.target,
 m.observed_at,m.window_start,m.window_end,round(m.value*100,2) as remaining_pct,
 coalesce((o.source_config->>'composite')::boolean,false) as composite,
 m.observed_at >= now()-interval '24 hours' and m.observed_at <= now()
 and m.window_end >= now()-interval '24 hours'
 and not coalesce((o.source_config->>'composite')::boolean,false) as fresh
from objectives o left join lateral (
 select * from measurements where objective_id=o.id and measurement='remaining_budget'
 order by observed_at desc,window_end desc limit 1
) m on true where o.mode='nobl9';

create view budget_status as
select id,service_id,code,name,'daily-counts'::text as basis,remaining_pct,
 case when not complete then 'incomplete' when remaining_pct<0 then 'exhausted' else 'within budget' end as state
from daily_budgets
union all
select id,service_id,code,name,'nobl9-export',remaining_pct,
 case when composite then 'unsupported composite' when not coalesce(fresh,false) then 'stale or missing' when remaining_pct<0 then 'exhausted' else 'within budget' end
from imported_budgets;

create view service_readiness as
select s.id,s.code,s.name,s.owner,
 (select count(*)::int from objectives where service_id=s.id) as objectives,
 (select count(*)::int from budget_status where service_id=s.id and state<>'within budget') as blocked_objectives,
 (select count(*)::int from actions where service_id=s.id and status='open' and due<(now() at time zone 'UTC')::date) as overdue_actions,
 case when trim(s.owner)='' or trim(s.policy)='' or s.review_due is null or s.review_due<(now() at time zone 'UTC')::date then 'review policy'
 when not exists(select 1 from objectives where service_id=s.id) then 'no objectives'
 when exists(select 1 from budget_status where service_id=s.id and state<>'within budget') then 'hold for evidence'
 when exists(select 1 from actions where service_id=s.id and status='open' and due<(now() at time zone 'UTC')::date) then 'overdue actions'
 else 'ready for decision' end as readiness
from services s;

create view attention as
select s.code as service,b.code as record,b.state as reason from budget_status b join services s on s.id=b.service_id where b.state<>'within budget'
union all select s.code,a.title,'overdue action' from actions a join services s on s.id=a.service_id where a.status='open' and a.due<(now() at time zone 'UTC')::date
union all select code,name,'policy review due' from services where review_due is null or review_due<(now() at time zone 'UTC')::date or trim(owner)='' or trim(policy)='';

create view compliance_checks as
select code as service,'REL-01'::text as rule,'Record an accountable owner and error-budget policy'::text as finding from services where trim(owner)='' or trim(policy)=''
union all select code,'REL-02','Review the service policy' from services where review_due is null or review_due<(now() at time zone 'UTC')::date
union all select code,'NZ-IPP9','Review purpose and retention of names and decision notes' from services where trim(retention_purpose)='' or retention_review is null or retention_review<(now() at time zone 'UTC')::date;
