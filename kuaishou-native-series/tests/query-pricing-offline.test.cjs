const fs=require('fs'),vm=require('vm'),assert=require('node:assert/strict'),path=require('path');
const ctx={window:{}};vm.createContext(ctx);
for(const f of ['data.js','model.js','record-model.js'])vm.runInContext(fs.readFileSync(path.join(__dirname,'..',f),'utf8'),ctx);
const {KSData:D,KSModel:M,KSRecords:R}=ctx.window,plain=x=>JSON.parse(JSON.stringify(x));
const samples=Object.keys(M.sourceContentTypes).map((sourceType,i)=>({id:String(100+i),name:i%2?'雨 夜':'长街'+i,sourceType}));
assert.equal(M.queryCollections(samples,null).length,0);
assert.equal(M.queryCollections(samples,{}).length,6);
assert.deepEqual(plain(M.collectionTerms('长街，雨 夜\n长街；  ')),['长街','雨 夜']);
assert.deepEqual(plain(M.queryCollections(samples,{names:'长街,雨 夜',ids:'100 101\n105 100',types:['真人剧','漫剧']})).map(x=>x.id),['100','101']);
assert.equal(M.queryCollections(samples,{ids:'10'}).length,0);
for(const type of Object.keys(M.sourceContentTypes))assert.equal(M.queryCollections(samples,{types:[type]}).length,1);
assert.equal(M.queryCollections(samples,{names:'不存在'}).length,0);

const d=M.clone(D.collections[0]);d.sale='2';d.price='3.00';const before=JSON.stringify(d);
for(const cut of ['',0,-1,'1.5',d.total,'1e1']){assert.ok(M.batchEpisodePricing(d,cut,'1').length);assert.equal(JSON.stringify(d),before);}
for(const price of ['',0,'0.09','100.01','1.234','1e1']){assert.ok(M.batchEpisodePricing(d,3,price).length);assert.equal(JSON.stringify(d),before);}
assert.equal(M.batchEpisodePricing(d,3,'1.2').length,0);
assert.ok(d.episodes.slice(0,2).every(e=>e.free&&e.price===''));
assert.ok(d.episodes.slice(2).every(e=>!e.free&&e.price==='1.20'));
assert.ok(D.collections[0].episodes.every(e=>e.free),'Never mutate source collection');
assert.equal(M.batchEpisodePricing(d,1,'100').length,0);assert.ok(d.episodes.every(e=>!e.free&&e.price==='100.00'));
assert.equal(M.batchEpisodePricing(d,d.total-1,'0.10').length,0);assert.equal(d.episodes.filter(e=>!e.free).length,2);
d.sale='3';const switched=JSON.stringify(d);assert.ok(M.batchEpisodePricing(d,3,'1').length);assert.equal(JSON.stringify(d),switched);

const now=Date.parse('2026-10-20T10:00:00+08:00');
const fresh=()=>R.normalize(M.clone(D.records[0]),D.collections,D.records);
let r=fresh();const untouched=JSON.stringify(r);
for(const value of ['','2026-10-20T09:59:59','2026-02-30T12:00:00']){assert.ok(R.apply(r,'schedule-offline',{time:now,value}));assert.equal(JSON.stringify(r),untouched);}
assert.equal(R.apply(r,'schedule-offline',{time:now,value:'2026-10-20T10:01:00'}),'');assert.equal(r.saleState,'online');assert.equal(r.offlineAt,'');
assert.equal(R.apply(r,'schedule-offline',{time:now,value:'2026-10-20T10:02:00'}),'');
const modified=r.modifiedAt,operator=r.modifiedBy;assert.equal(R.executeOfflineDue(r,true,now+60000),false);
assert.equal(R.executeOfflineDue(r,true,now+120000),true);assert.equal(r.saleState,'offline');assert.equal(r.offlineAt,'2026-10-20 10:02:00');assert.equal(r.offlineSchedule.status,'success');assert.equal(r.modifiedAt,modified);assert.equal(r.modifiedBy,operator);assert.equal(R.executeOfflineDue(r,true,now+121000),false);
r=fresh();R.apply(r,'schedule-offline',{time:now,value:'2026-10-20T10:01:00'});assert.equal(R.executeOfflineDue(r,false,now+60000),true);assert.equal(r.saleState,'online');assert.equal(r.offlineAt,'');assert.equal(r.offlineSchedule.status,'failed');
r=fresh();R.apply(r,'schedule-offline',{time:now,value:'2026-10-20T10:01:00'});R.apply(r,'offline',{time:now+1000});R.apply(r,'online',{time:now+2000});assert.equal(r.offlineSchedule.status,'cancelled');assert.equal(R.executeOfflineDue(r,true,now+60000),false);assert.equal(r.saleState,'online');
for(const patch of [{saleState:'offline'},{miniId:''}]){r=Object.assign(fresh(),patch);const old=JSON.stringify(r);assert.ok(R.apply(r,'schedule-offline',{time:now,value:'2026-10-20T10:01:00'}));assert.equal(JSON.stringify(r),old);}
console.log('PASS: query-gated collections, multi-term/type matching, atomic bulk pricing and scheduled offline lifecycle');
