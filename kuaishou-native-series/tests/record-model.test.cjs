const fs=require('fs'),vm=require('vm'),assert=require('node:assert/strict'),path=require('path');
const ctx={window:{}};vm.createContext(ctx);for(const f of ['data.js','model.js','record-model.js'])vm.runInContext(fs.readFileSync(path.join(__dirname,'..',f),'utf8'),ctx);
const {KSData:D,KSModel:M,KSRecords:R}=ctx.window;
const time=Date.parse('2026-10-19T12:00:00+08:00');const fresh=()=>R.normalize(M.clone(D.records[4]),D.collections,D.records);
let r=fresh();const id=r.miniId,created=r.date;
assert.equal(R.apply(r,'online',{time}), '');assert.equal(r.saleState,'online');assert.equal(R.apply(r,'schedule',{time,value:'2026-10-20T10:00:00'}),'短剧已上架');assert.equal(R.apply(r,'offline',{time}), '');assert.equal(r.miniId,id);assert.equal(r.date,created);
for(const value of ['','2026-10-18T12:00:00','2026-10-19T12:00:00','2026-02-30T12:00:00']){r=fresh();assert.ok(R.apply(r,'schedule',{time,value}));assert.equal(r.schedule.status,'none');}
r=fresh();assert.equal(R.apply(r,'schedule',{time,value:'2026-10-19T12:01:00'}),'');assert.ok(R.apply(r,'online',{time}));assert.ok(R.apply(r,'schedule',{time,value:'2026-10-20T12:00:00'}));assert.equal(R.apply(r,'modify-schedule',{time,value:'2026-10-19T12:02:00'}),'');const modified=r.modifiedAt;assert.equal(R.executeDue(r,true,time+60000),false);assert.equal(R.executeDue(r,true,time+120000),true);assert.equal(r.saleState,'online');assert.equal(r.schedule.status,'success');assert.equal(r.modifiedAt,modified);
r=fresh();R.apply(r,'schedule',{time,value:'2026-10-19T12:01:00'});R.apply(r,'cancel-schedule',{time});assert.equal(R.executeDue(r,true,time+120000),false);assert.equal(r.saleState,'offline');
r=fresh();R.apply(r,'schedule',{time,value:'2026-10-19T12:01:00'});assert.equal(R.executeDue(r,false,time+60000),true);assert.equal(r.schedule.status,'failed');assert.equal(r.saleState,'offline');assert.match(r.schedule.reason,/授权/);
for(const patch of [{audit:'pending'},{audit:'publishing'},{stage:'uploading'},{platformRestricted:true},{uploaded:1}]){r=Object.assign(fresh(),patch);assert.ok(R.apply(r,'online',{time}));assert.ok(R.apply(r,'schedule',{time,value:'2026-10-20T12:00:00'}));}
assert.deepEqual(Array.from(Object.values(M.audits),x=>x[0]),['待提交','审核中','发布中','审核未通过','发布成功']);
assert.deepEqual(Array.from(Object.values(R.selling)),['已上架','已下架']);
for(const audit of ['unsubmitted','pending','publishing','rejected','approved'])for(const saleState of ['offline','online'])for(const action of ['online','schedule']){
  r=Object.assign(fresh(),{audit,saleState});const before=JSON.stringify(r),eligible=audit==='approved'&&saleState==='offline';
  const error=R.apply(r,action,{time,value:'2026-10-20T12:00:00'});
  assert.equal(error==='',eligible,`${audit}/${saleState}/${action}`);
  if(!eligible)assert.equal(JSON.stringify(r),before,'Blocked actions must leave the record unchanged');
}
for(const patch of [{audit:'pending'},{audit:'publishing'},{platformRestricted:true}]){
  r=fresh();R.apply(r,'schedule',{time,value:'2026-10-19T12:01:00'});Object.assign(r,patch);
  assert.equal(R.executeDue(r,true,time+60000),true);assert.equal(r.schedule.status,'failed');assert.notEqual(r.saleState,'online');
}
r=fresh();assert.ok(R.reason(r,'edit'));r.audit='rejected';assert.equal(R.reason(r,'edit'),'');r.audit='unsubmitted';assert.equal(R.reason(r,'edit'),'');assert.ok(R.reason(r,'edit',false));
r=fresh();r.title='快手渠道新标题';r.collectionName='原始绿台合集';const f=R.defaultFilters();assert.equal(R.matches(r,{...f,title:'渠道',collectionName:'绿台',miniId:r.miniId,start:r.date.slice(0,10),end:r.date.slice(0,10)}),true);assert.equal(R.matches(r,{...f,collectionName:'渠道'}),false);assert.equal(R.matches(r,{...f,miniId:'KS-DEMO'}),false);
for(const seed of D.records){r=R.normalize(M.clone(seed),D.collections,D.records);assert.deepEqual(Array.from(M.validate(r.config)),[],seed.title+' fixture must have editable complete metadata');}
const old={id:'old',collectionId:D.collections[0].id,title:'渠道改名',date:'2026-10-16 00:00',audit:'pending',stage:'complete'};R.normalize(old,D.collections,D.records);assert.equal(old.collectionName,'长街有月');assert.equal(old.modifiedBy,'');assert.equal(old.title,'渠道改名');

const legacy=Object.assign(fresh(),{saleState:'forced_offline',disposeReason:'需核验版权'}),legacyId=legacy.miniId;
R.normalize(legacy,D.collections,D.records);assert.equal(legacy.saleState,'offline');assert.equal(legacy.platformRestricted,true);assert.equal(legacy.disposeReason,'需核验版权');assert.equal(legacy.miniId,legacyId);
assert.ok(R.reason(legacy,'online'));assert.ok(R.reason(legacy,'schedule'));assert.equal(R.matches(legacy,{...R.defaultFilters(),saleState:'offline'}),true);
const migrated=JSON.stringify(legacy);R.normalize(legacy,D.collections,D.records);assert.equal(JSON.stringify(legacy),migrated,'Migration is idempotent');
assert.equal('scheduleStatus' in R.defaultFilters(),false);
for(const audit of Object.keys(M.audits)){r=Object.assign(fresh(),{audit});assert.equal(R.matches(r,{...R.defaultFilters(),audit}),true);}

console.log('PASS: state guards, scheduling/modification/cancellation/failure, Beijing time, record identity, independent name filters, seed metadata and migration');
