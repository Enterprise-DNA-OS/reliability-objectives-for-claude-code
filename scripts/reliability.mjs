import fs from 'node:fs';
import path from 'node:path';
import {gunzipSync} from 'node:zlib';
import {createHash} from 'node:crypto';
import {pathToFileURL} from 'node:url';
import {getDb,REPO_ROOT} from './lib/db.mjs';
import {parseCsv} from './lib/csv.mjs';
import {table} from './lib/format.mjs';
import {page,table as htmlTable,writeOut} from './lib/render.mjs';

const reads={
 services:'select code,name,owner,review_due from services order by code',
 objectives:'select code,name,mode,target,window_days from objectives order by code',
 'error-budgets':'select code,name,basis,remaining_pct,state from budget_status order by code',
 coverage:'select code,window_days,covered_days,latest_day,total_events,bad_events,reliability_pct,allowed_bad,complete from daily_budgets order by code',
 'import-health':'select code,observed_at,window_start,window_end,remaining_pct,composite,fresh from imported_budgets order by code',
 'release-readiness':'select code,owner,objectives,blocked_objectives,overdue_actions,readiness from service_readiness order by code',
 attention:'select * from attention order by service,record',
 actions:'select a.id,s.code as service,a.title,a.owner,a.due,a.status,a.resolution from actions a join services s on s.id=a.service_id order by a.due,a.id',
 'owner-load':"select owner,count(*)::int as open_actions,count(*) filter(where due<current_date)::int as overdue_actions from actions where status='open' group by owner order by owner",
 compliance:'select * from compliance_checks order by service,rule',
 decisions:'select s.code as service,d.decision,d.note,d.actor,d.created_at from decisions d join services s on s.id=d.service_id order by d.created_at,d.id',
 activity:'select actor,command,detail,created_at from audit order by created_at desc,id limit 100'
};
const mutations=['add-service','add-objective','log-count','add-action','close-action','review-service','decide','import'];
export const commands=[...Object.keys(reads),'weekly-review','service','export','draft-review','draft-policy',...mutations,'help'];
const businessTables=['services','objectives','daily_counts','measurements','actions','decisions','audit'];
export function parseArgs(args){const opts={},pos=[];for(const a of args){if(a.startsWith('--')){const i=a.indexOf('=');const k=a.slice(2,i<0?undefined:i);if(k in opts)throw Error('Duplicate option: '+k);opts[k]=i<0?true:a.slice(i+1);}else pos.push(a);}return {cmd:pos.shift()||'help',pos,opts};}
function required(o,k){if(typeof o[k]!=='string'||!o[k].trim())throw Error('Required --'+k+'=<value>');return o[k].trim();}
function number(o,k,{min=0,max=Number.MAX_SAFE_INTEGER,integer=false}={}){const raw=required(o,k),v=Number(raw);if(!Number.isFinite(v)||v<min||v>max||(integer&&!Number.isSafeInteger(v)))throw Error('Invalid --'+k);return v;}
const dayNow=()=>new Date().toISOString().slice(0,10);
function date(v){if(!/^\d{4}-\d{2}-\d{2}$/.test(v)||!Number.isFinite(Date.parse(v))||new Date(v).toISOString().slice(0,10)!==v)throw Error('Invalid date: '+v);return v;}
function stamp(v){if(!/^\d{4}-\d{2}-\d{2}[T ]\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:?\d{2})?$/.test(v))throw Error('Invalid timestamp: '+v);const s=v.replace(' ','T');const d=new Date(/Z$|[+-]\d{2}:?\d{2}$/.test(s)?s:s+'Z');if(!Number.isFinite(+d)||d.toISOString().slice(0,10)!==v.slice(0,10))throw Error('Invalid timestamp: '+v);return d.toISOString();}
const digest=x=>createHash('sha256').update(JSON.stringify(x)).digest('hex');
const coded=o=>{const v=required(o,'code').toUpperCase();if(!/^[A-Z0-9][A-Z0-9-]{1,63}$/.test(v))throw Error('Code needs 2-64 letters, digits or hyphens');return v;};
export async function resolve(db,kind,value){
 if(!['services','objectives','actions'].includes(kind))throw Error('Invalid record type');
 if(!value||typeof value!=='string')throw Error('Provide a record code, name or id');
 const name=kind==='actions'?'title':'name';
 const rows=await db.query(`select * from ${kind} order by id`);
 const exact=rows.filter(r=>r.id===value||String(r.code||'').toLowerCase()===value.toLowerCase());
 const hits=exact.length?exact:rows.filter(r=>r.id.startsWith(value.toLowerCase())||r[name].toLowerCase().includes(value.toLowerCase()));
 if(hits.length!==1){const e=Error(hits.length?'Ambiguous record: '+value:'No matching record: '+value);e.candidates=hits.map(r=>({id:r.id,code:r.code,name:r[name]}));throw e;}return hits[0];
}

async function importNobl9(db,o){
 const file=path.resolve(required(o,'file'));const source=required(o,'source');
 const data=fs.readFileSync(file);const rows=parseCsv((file.endsWith('.gz')?gunzipSync(data):data).toString('utf8'));
 if(!rows.length)throw Error('Export contains no data rows');
 const header=['timestamp','organization','project','measurement','value','time_window_start','time_window_end','slo_name','error_budgeting_method','budget_target','objective_value','service','slo_time_window_type','slo_time_window_duration_unit','slo_time_window_duration_count','composite','objective_name'];
 const allowed=['raw_metric','good_total_ratio','instantaneous_burn_rate','burn_rate','good_count_metric','bad_count_metric','total_count_metric','remaining_budget_duration','remaining_budget','ratio_extrapolation_window'];
 const summary={rows:rows.length,inserted:0,unchanged:0,objectives:0};
 for(const [i,r] of rows.entries()){
  for(const k of header)if(!(k in r)||!String(r[k]).trim())throw Error(`Row ${i+2}: missing ${k}`);
  if(!allowed.includes(r.measurement))throw Error(`Row ${i+2}: unsupported measurement ${r.measurement}`);
  const value=Number(r.value),target=Number(r.budget_target),objectiveValue=Number(r.objective_value);
  if(!Number.isFinite(value)||!Number.isFinite(target)||target<=0||target>=1||!Number.isFinite(objectiveValue))throw Error(`Row ${i+2}: invalid numeric value`);
  if(!/^(true|false)$/i.test(r.composite))throw Error(`Row ${i+2}: composite must be true or false`);
  const timestamp=stamp(r.timestamp),start=stamp(r.time_window_start),end=stamp(r.time_window_end);
  if(start>end||Date.parse(timestamp)>Date.now())throw Error(`Row ${i+2}: invalid window or future observation`);
  if(r.measurement==='remaining_budget'&&value>1)throw Error('Remaining budget must be a fraction no greater than 1');
  const serviceKey=digest([r.organization,r.project,r.service]);
  const scode='N9-S-'+serviceKey.slice(0,20).toUpperCase();
  await db.query('insert into services(code,name) values($1,$2) on conflict(code) do nothing',[scode,r.service_display_name||r.service]);
  const [service]=await db.query('select * from services where code=$1',[scode]);
  const key=digest([r.organization,r.project,r.slo_name,r.objective_name]);
  const config={organization:r.organization,project:r.project,slo:r.slo_name,objective:r.objective_name,service:r.service,method:r.error_budgeting_method,target,objective_value:objectiveValue,operator:r.objective_operator||'',window_type:r.slo_time_window_type,window_unit:r.slo_time_window_duration_unit,window_count:r.slo_time_window_duration_count,composite:r.composite.toLowerCase()==='true'};
  let [objective]=await db.query('select * from objectives where source_key=$1',[key]);
  if(objective){if(JSON.stringify(Object.entries(objective.source_config).sort())!==JSON.stringify(Object.entries(config).sort()))throw Error(`Row ${i+2}: objective definition changed. Split and review history before importing.`);}
  else{[objective]=await db.query("insert into objectives(service_id,code,name,mode,target,source_key,source_config) values($1,$2,$3,'nobl9',$4,$5,$6) returning *",[service.id,'N9-O-'+key.slice(0,20).toUpperCase(),r.objective_display_name||r.objective_name,target,key,JSON.stringify(config)]);summary.objectives++;}
  const params=[objective.id,timestamp,r.measurement,start,end];
  const [existing]=await db.query('select * from measurements where objective_id=$1 and observed_at=$2 and measurement=$3 and window_start=$4 and window_end=$5',params);
  if(existing){if(Number(existing.value)!==value||JSON.stringify(Object.entries(existing.original).sort())!==JSON.stringify(Object.entries(r).sort()))throw Error(`Row ${i+2}: changed duplicate measurement. Reconcile the export first.`);summary.unchanged++;}
  else{await db.query('insert into measurements(objective_id,observed_at,measurement,window_start,window_end,value,original,source) values($1,$2,$3,$4,$5,$6,$7,$8)',[...params,value,JSON.stringify(r),source]);summary.inserted++;}
 }return summary;
}

async function mutate(db,cmd,pos,o){
 if(cmd==='add-service')return (await db.query('insert into services(code,name,owner) values($1,$2,$3) returning *',[coded(o),required(o,'name'),required(o,'owner')]))[0];
 if(cmd==='add-objective'){
  const s=await resolve(db,'services',required(o,'service'));const target=number(o,'target',{min:0.000001,max:0.999999});
  return (await db.query("insert into objectives(service_id,code,name,mode,target,window_days) values($1,$2,$3,'daily-counts',$4,$5) returning *",[s.id,coded(o),required(o,'name'),target,number(o,'days',{min:1,max:366,integer:true})]))[0];
 }
 if(cmd==='log-count'){
  const obj=await resolve(db,'objectives',required(o,'objective'));if(obj.mode!=='daily-counts')throw Error('Imported objectives cannot receive daily counts');
  const d=date(required(o,'day'));if(d>=dayNow())throw Error('Only complete UTC days before today are accepted');
  const good=number(o,'good',{integer:true}),total=number(o,'total',{integer:true});if(good>total)throw Error('Good count exceeds total');
  return (await db.query('insert into daily_counts(objective_id,day,good,total,source) values($1,$2,$3,$4,$5) returning *',[obj.id,d,good,total,required(o,'source')]))[0];
 }
 if(cmd==='add-action'){
  const s=await resolve(db,'services',required(o,'service'));
  return (await db.query('insert into actions(service_id,title,owner,due) values($1,$2,$3,$4) returning *',[s.id,required(o,'title'),required(o,'owner'),date(required(o,'due'))]))[0];
 }
 if(cmd==='close-action'){
  const a=await resolve(db,'actions',pos[0]);if(a.status==='closed')throw Error('Action is already closed');
  return {before:a,after:(await db.query("update actions set status='closed',resolution=$2 where id=$1 returning *",[a.id,required(o,'resolution')]))[0]};
 }
 if(cmd==='review-service'){
  const s=await resolve(db,'services',pos[0]);const due=date(required(o,'due')),ret=date(required(o,'retention-review'));if(due<dayNow()||ret<dayNow())throw Error('Next review dates cannot be in the past');
  return {before:s,after:(await db.query('update services set owner=$2,policy=$3,review_due=$4,retention_purpose=$5,retention_review=$6 where id=$1 returning *',[s.id,required(o,'owner'),required(o,'policy'),due,required(o,'purpose'),ret]))[0]};
 }
 if(cmd==='decide'){
  const s=await resolve(db,'services',pos[0]);const decision=required(o,'decision');if(!['hold','proceed'].includes(decision))throw Error('Decision must be hold or proceed');
  const [readiness]=await db.query('select * from service_readiness where id=$1',[s.id]);
  if(decision==='proceed'&&readiness.readiness!=='ready for decision')throw Error('Cannot record proceed: '+readiness.readiness);
  const evidence={readiness,budgets:await db.query('select * from budget_status where service_id=$1',[s.id]),daily_counts:await db.query('select * from daily_budgets where service_id=$1',[s.id]),imported_snapshots:await db.query('select * from imported_budgets where service_id=$1',[s.id]),policy:s.policy};
  return (await db.query('insert into decisions(service_id,decision,note,actor,evidence) values($1,$2,$3,$4,$5) returning *',[s.id,decision,required(o,'note'),required(o,'actor'),JSON.stringify(evidence)]))[0];
 }
 if(cmd==='import'){if(pos[0]!=='nobl9')throw Error('Use import nobl9');return importNobl9(db,o);}
 throw Error('Unknown mutation');
}

export async function run(db,args){
 const {cmd,pos,opts:o}=parseArgs(args);
 if(!commands.includes(cmd))throw Error('Unknown command: '+cmd);
 if(cmd==='help')return commands.map(command=>({command,changes_records:mutations.includes(command)}));
 if(reads[cmd])return db.query(reads[cmd]);
 if(cmd==='weekly-review')return {readiness:await db.query(reads['release-readiness']),budgets:await db.query(reads['error-budgets']),attention:await db.query(reads.attention),owner_load:await db.query(reads['owner-load']),compliance:await db.query(reads.compliance)};
 if(cmd==='service'){
  const s=await resolve(db,'services',pos[0]);return {service:s,objectives:await db.query('select * from budget_status where service_id=$1 order by code',[s.id]),actions:await db.query('select * from actions where service_id=$1 order by due',[s.id]),decisions:await db.query('select * from decisions where service_id=$1 order by created_at',[s.id])};
 }
 if(cmd==='export'){
  const out={format:'reliability-objectives-v1',exported_at:new Date().toISOString()};
  for(const t of businessTables)out[t]=await db.query(`select * from ${t} order by id`);
  if(o.file){const file=path.resolve(required(o,'file'));fs.mkdirSync(path.dirname(file),{recursive:true,mode:0o700});fs.writeFileSync(file,JSON.stringify(out,null,2)+'\n',{flag:'wx',mode:0o600});return {file,counts:Object.fromEntries(businessTables.map(t=>[t,out[t].length]))};}return out;
 }
 if(cmd.startsWith('draft-')){
  const s=await resolve(db,'services',pos[0]);const budgets=await db.query('select code,basis,remaining_pct,state from budget_status where service_id=$1',[s.id]);
  const sections=cmd==='draft-policy'?[{title:'Policy for review',html:htmlTable([{owner:s.owner,policy:s.policy,review_due:s.review_due}])}]:[{title:'Budget evidence',html:htmlTable(budgets)},{title:'Open actions',html:htmlTable(await db.query("select title,owner,due from actions where service_id=$1 and status='open' order by due",[s.id]))}];
  const file=writeOut('drafts',`${cmd}-${s.code}-${Date.now()}`,page({title:cmd==='draft-policy'?'Draft error-budget policy':'Draft service reliability review',subtitle:s.name+'. Draft for human review. No release or message is sent.',sections}));return {file};
 }
 required(o,'actor');
 // Serialize changes with policy decisions, including across multiple Postgres clients.
 await db.exec('BEGIN');
 try{
  await db.exec('LOCK TABLE services,objectives,daily_counts,measurements,actions,decisions,audit IN SHARE ROW EXCLUSIVE MODE');
  const result=await mutate(db,cmd,pos,o);
  await db.query('insert into audit(actor,command,detail) values($1,$2,$3)',[o.actor,cmd,JSON.stringify(result)]);
  await db.exec(o['dry-run']?'ROLLBACK':'COMMIT');return {dry_run:Boolean(o['dry-run']),result};
 }catch(e){await db.exec('ROLLBACK');throw e;}
}
export function human(data){
 if(Array.isArray(data)){if(!data.length)return '(none)';return table(data,Object.keys(data[0]).map(key=>({key,label:key.replaceAll('_',' '),format:v=>v instanceof Date?v.toISOString().slice(0,10):v&&typeof v==='object'?JSON.stringify(v):v,width:60})));}
 if(data&&typeof data==='object')return Object.entries(data).map(([k,v])=>`${k.replaceAll('_',' ')}\n${Array.isArray(v)?human(v):v&&typeof v==='object'?JSON.stringify(v,null,2):v}`).join('\n\n');return String(data);
}
if(process.argv[1]&&import.meta.url===pathToFileURL(path.resolve(process.argv[1])).href){
 let db;const args=process.argv.slice(2);try{db=await getDb();await db.exec("SET TIME ZONE 'UTC'");const out=await run(db,args);console.log(args.includes('--json')?JSON.stringify(out,null,2):human(out));}
 catch(e){const out={error:e.message,...(e.candidates?{candidates:e.candidates}:{})};console.error(args.includes('--json')?JSON.stringify(out):human(out));process.exitCode=1;}finally{if(db)await db.close();}
}
