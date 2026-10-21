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
const assigned=U.assign(selected,[a,b,bad],{},D.accounts);
assert.deepEqual(plain(assigned.targets),{'new-1':[a,b],'new-2':[a,b]});assert.equal(assigned.skipped.length,2);
assert.equal(U.createRecords({...input,targets:assigned.targets,records:[dup]}).records.length,4);
for(const patch of [{targets:{'new-1':[],'new-2':[a]}},{targets:{'new-1':[bad],'new-2':[a]}}]){
  const before=JSON.stringify(input),failed=U.createRecords({...input,...patch});assert.ok(failed.errors.length);assert.equal(failed.records.length,0);assert.equal(JSON.stringify(input),before);
}
// Re-upload the same collection/account under a fresh submission, including the same title.
for(const stage of ['queued','uploading','failed','complete']){
  const old=M.clone(result.records);old[0].stage=stage;old[0].miniId='KS-EXISTING';old[0].uploaded=20;
  old[0].schedule={status:'pending',time:'2026-11-01 12:00:00'};
  const snapshot=JSON.stringify(old);
  const repeated=U.createRecords({...input,batch:'B-REPEAT-'+stage,records:old});
  assert.equal(repeated.errors.length,0);assert.equal(repeated.records.length,4);
  assert.equal(new Set([...old,...repeated.records].map(r=>r.id)).size,8);
  assert.ok(repeated.records.every(r=>r.miniId===''&&r.uploaded===0&&r.schedule.status==='none'));
  repeated.records[0].config.title='仅新任务修改';repeated.records[0].uploaded=10;
  assert.equal(JSON.stringify(old),snapshot,'History and other uploads stay independent');
  const replay=U.createRecords({...input,batch:'B-REPEAT-'+stage,records:[...old,...repeated.records]});
  assert.ok(replay.errors.length);assert.equal(replay.records.length,0,'Same submission cannot create duplicate tasks');
}
assert.equal(M.titleConflict([{id:'history',collectionId:'new-1',account:a,title:configs['new-1'].title}],[a],configs['new-1']),false);
const otherTitle={id:'other',collectionId:'other-collection',account:a,title:configs['new-1'].title};
assert.equal(M.titleConflict([otherTitle],[a],configs['new-1']),true);
assert.equal(M.titleConflict([otherTitle],[b],configs['new-1']),false);
assert.equal(M.titleConflict([otherTitle],[a],configs['new-1'],'other'),false);
assert.ok(U.createRecords({...input,records:[otherTitle]}).errors.length);
console.log('PASS: repeated collection/account uploads, original titles, independent history and submission replay protection');

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
console.log('PASS: multi-account fan-out, per-account isolation, repeat-upload authorization guards, scoped title checks, draft migration and multi-account filtering');

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
