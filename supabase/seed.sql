insert into services(id,code,name,owner,policy,review_due,retention_purpose,retention_review) values
('10000000-0000-4000-8000-000000000001','CHECKOUT','Order checkout','Aroha','Hold feature releases when the error budget is exhausted. Escalate exceptions to the service owner.',current_date+14,'Accountability for reliability decisions',current_date+90),
('10000000-0000-4000-8000-000000000002','PORTAL','Customer portal','Ben','Review a full week before approving a release.',current_date+14,'Accountability for reliability decisions',current_date+90),
('10000000-0000-4000-8000-000000000003','SYNC','Warehouse sync','','',current_date-7,'',current_date-3)
on conflict do nothing;
insert into objectives(id,service_id,code,name,mode,target,window_days) values
('20000000-0000-4000-8000-000000000001','10000000-0000-4000-8000-000000000001','CHECKOUT-OK','Successful checkout requests','daily-counts',0.99,7),
('20000000-0000-4000-8000-000000000002','10000000-0000-4000-8000-000000000002','PORTAL-OK','Successful portal requests','daily-counts',0.99,7),
('20000000-0000-4000-8000-000000000003','10000000-0000-4000-8000-000000000003','SYNC-OK','Successful sync jobs','daily-counts',0.99,7)
on conflict do nothing;
insert into daily_counts(objective_id,day,good,total,source)
select o.id,(now() at time zone 'UTC')::date-d,
 case o.code when 'CHECKOUT-OK' then 980 when 'PORTAL-OK' then 998 else 99 end,
 case when o.code='SYNC-OK' then 100 else 1000 end,'Fictional demo count export'
from objectives o cross join generate_series(1,7) d
where o.id::text like '20000000-%' and (o.code<>'SYNC-OK' or d>3)
on conflict do nothing;
insert into actions(id,service_id,title,owner,due) values
('30000000-0000-4000-8000-000000000001','10000000-0000-4000-8000-000000000001','Investigate checkout timeout pattern','Aroha',current_date-2),
('30000000-0000-4000-8000-000000000002','10000000-0000-4000-8000-000000000003','Restore daily count evidence','Ben',current_date+1)
on conflict do nothing;
