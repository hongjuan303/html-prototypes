const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),path=require('node:path');
const ctx={window:{}};vm.createContext(ctx);
for(const f of ['data.js','model.js'])vm.runInContext(fs.readFileSync(path.join(__dirname,'..',f),'utf8'),ctx);
const {KSModel:M,KSData:D}=ctx.window;
const base=M.clone(D.collections[0]);
for(const [sourceType,type,declaration] of [['真人剧','1','0'],['漫剧','2','1'],['AI剧','2','1'],['解说剧','2','1'],['沙雕漫','2','1'],['演绎剧','2','1']]){
  const source={...base,sourceType,type:'stale',declaration:'',completed:'false',filing:false,filingNo:'源备案号'};
  const before=JSON.stringify(source),d=M.createConfig(source);
  assert.equal(d.type,type);assert.equal(d.declaration,declaration);assert.equal(d.completed,'true');
  assert.equal(d.filing,'false');assert.equal(d.filingNo,'源备案号');assert.equal(JSON.stringify(source),before);
  d.tags.push('测试');assert.equal(source.tags.includes('测试'),false);
}
for(const filing of [true,'true',false,'false','',undefined]){
  const d=M.createConfig({...base,filing});
  assert.equal(d.filing,filing==null?'':String(filing));
}
const unknown=M.createConfig({...base,sourceType:'未知类型',type:'1',method:'',copyrightType:'',filing:''});
assert.equal(unknown.type,'');assert.equal(unknown.declaration,'');assert.equal(unknown.filing,'');
assert.equal(unknown.method,'');assert.equal(unknown.copyrightType,'');
assert.ok(M.validate(unknown).some(x=>x.field==='type'));
assert.ok(M.validate(unknown).some(x=>x.field==='filing'));
const d=M.createConfig(base);d.method='3';
M.setContentType(d,'1');assert.equal(d.declaration,'0');assert.equal(d.method,'3');
M.setContentType(d,'2');assert.equal(d.declaration,'1');assert.equal(d.method,'3');
for(const field of ['type','declaration','completed','copyrightType']){
  const invalid={...d,[field]:undefined};assert.ok(M.validate(invalid).some(x=>x.field===field));
}
assert.equal(M.validate({...d,completed:'false'}).some(x=>x.field==='completed'),false);
const longTitle='剧'.repeat(21),longDesc='🙂'.repeat(401);
const imported=M.createConfig({...base,title:longTitle,desc:'  '+longDesc+'  '});
assert.equal(imported.title,longTitle);assert.ok(M.validate(imported).some(x=>x.field==='title'));
assert.equal([...imported.desc].length,400);assert.equal(imported.desc,'🙂'.repeat(400));
for(const [n,invalid] of [[99,true],[100,false],[400,false],[401,true]]){
  assert.equal(M.validate({...d,desc:'  '+'文'.repeat(n)+'  '}).some(x=>x.field==='desc'),invalid);
}
assert.equal(M.limitDescription('  简介\n正文  '),'简介\n正文');
const saved={...base,type:'2',declaration:'0',completed:'false',filing:'false',title:'手动标题'},before=JSON.stringify(saved);
const restored=M.restoreConfig(saved,{...base,filing:true});
assert.equal(JSON.stringify(restored),before);assert.equal(JSON.stringify(saved),before);
const missing=M.restoreConfig({...base,declaration:'',completed:'',filing:''},{...base,filing:false});
assert.equal(missing.declaration,'1');assert.equal(missing.completed,'true');assert.equal(missing.filing,'false');
assert.equal(JSON.stringify(base),JSON.stringify(D.collections[0]));
console.log('PASS: six source types, declaration defaults/switching, completed default, filing source/unknowns, immutable source, title validation and Unicode description limits');
