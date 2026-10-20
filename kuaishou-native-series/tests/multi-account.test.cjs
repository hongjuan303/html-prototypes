const fs=require('fs'),vm=require('vm'),assert=require('node:assert/strict'),path=require('path');
const ctx={window:{}};vm.createContext(ctx);
for(const file of ['data.js','model.js','record-model.js','upload-model.js'])vm.runInContext(fs.readFileSync(path.join(__dirname,'..',file),'utf8'),ctx);
const {KSData:D,KSModel:M,KSRecords:R,KSUpload:U}=ctx.window;
const plain=x=>JSON.parse(JSON.stringify(x)),a=D.accounts[0].id,b=D.accounts[1].id,bad=D.accounts[2].id;
const configs=Object.fromEntries(['new-1','new-2'].map((id,i)=>{const d=M.clone(D.records[4].config);Object.assign(d,{id,name:'来源'+i,title:'目标短剧'+i});return [id,d]}));
const selected=Object.keys(configs),targets={'new-1':[a,b,a],'new-2':[a,b]};
const input={selected,targets,configs,records:[],accounts:D.accounts,batch:'B-TEST',date:'2026-10-19 16:00'};
const result=U.createRecords(input);
assert.equal(result.errors.length,0);assert.equal(result.records.length,4);
assert.equal(new Set(result.records.map(r=>r.id)).size,4);
assert.deepEqual(plain(result.records.map(r=>[r.collectionId,r.account])),[['new-1',a],['new-1',b],['new-2',a],['new-2',b]]);
result.records[0].uploaded=20;result.records[0].config.episodes[0].title='改动';
assert.equal(result.records[1].uploaded,0);assert.notEqual(result.records[1].config.episodes[0].title,'改动');assert.notEqual(configs['new-1'].episodes[0].title,'改动');
const dup={account:a,collectionId:'new-1',title:'已上传'};
const assigned=U.assign(selected,[a,b,bad],{},[dup],D.accounts);
assert.deepEqual(plain(assigned.targets),{'new-1':[b],'new-2':[a,b]});assert.equal(assigned.skipped.length,3);
assert.equal(U.createRecords({...input,targets:assigned.targets,records:[dup]}).records.length,3);
for(const patch of [{targets:{'new-1':[],'new-2':[a]}},{targets:{'new-1':[bad],'new-2':[a]}},{records:[dup]}]){
  const before=JSON.stringify(input),failed=U.createRecords({...input,...patch});assert.ok(failed.errors.length);assert.equal(failed.records.length,0);assert.equal(JSON.stringify(input),before);
}
const sameTitles=M.clone(configs);sameTitles['new-2'].title=sameTitles['new-1'].title;
assert.equal(U.createRecords({...input,configs:sameTitles}).records.length,0);
assert.equal(U.createRecords({...input,configs:sameTitles,targets:{'new-1':[a],'new-2':[b]}}).records.length,2);
const legacy={account:a,selected,configs};const legacyBefore=JSON.stringify(legacy);
assert.deepEqual(plain(U.migrateTargets(legacy)),{'new-1':[a],'new-2':[a]});assert.equal(JSON.stringify(legacy),legacyBefore);
const saved={selected,targets:{'new-1':[a,b],'new-2':[]},account:a};assert.deepEqual(plain(U.migrateTargets(JSON.parse(JSON.stringify(saved)))),saved.targets);
const independent={selected:['new-1'],targets:{'new-1':[a],'new-2':[a,b]}};
assert.deepEqual(plain(U.migrateTargets(JSON.parse(JSON.stringify(independent)))),independent.targets);
assert.deepEqual(plain(U.plan(independent.selected,U.migrateTargets(independent))),[{collectionId:'new-1',account:a}]);
const f=R.defaultFilters(),r={account:a,title:'测试',collectionName:'合集',collectionId:'1',miniId:'2',date:'2026-10-19',schedule:{status:'none'}};
assert.equal(R.matches(r,{...f,account:[]}),true);assert.equal(R.matches(r,{...f,account:[a,b]}),true);assert.equal(R.matches(r,{...f,account:[b]}),false);assert.equal(R.matches(r,{...f,account:a}),true);
console.log('PASS: multi-account fan-out, per-account isolation, duplicate/authorization guards, scoped title checks, draft migration and multi-account filtering');

// Operators configure metadata; the worker resolves the entire source collection.
const source=D.collections[2],metadata=M.clone(source);
Object.assign(metadata,{title:'后台全集测试',declaration:'0',sale:'0',price:'1'});
assert.equal(M.validate(metadata).length,0);
assert.ok(M.videoIssues(metadata).some(x=>x.seq===12));
metadata.episodes=metadata.episodes.slice(0,2);metadata.total=2;
const automatic=U.createRecords({selected:[source.id],targets:{[source.id]:[a,b]},configs:{[source.id]:metadata},records:[],accounts:D.accounts,batch:'B-AUTO',date:'2026-10-19 18:00'});
assert.equal(automatic.errors.length,0);assert.equal(automatic.records.length,2);
for(const row of automatic.records){assert.equal(row.total,source.total);assert.equal(row.config.episodes.length,source.total);assert.deepEqual(plain(row.config.episodes),plain(source.episodes));}
assert.equal(metadata.episodes.length,2);
assert.ok(M.videoIssues(automatic.records[0].config).some(x=>x.seq===12));
const complete=M.clone(automatic.records[0].config);complete.episodes.find(e=>e.seq===12).ready=true;
assert.equal(M.videoIssues(complete).length,0);
complete.episodes[0].seq=2;assert.ok(M.videoIssues(complete).some(x=>x.message.includes('集序')));
console.log('PASS: metadata-only setup, source-driven full-series upload and worker video validation');
