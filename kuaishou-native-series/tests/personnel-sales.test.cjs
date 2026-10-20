const fs=require('fs'),vm=require('vm'),assert=require('node:assert/strict'),path=require('path');
const ctx={window:{}};vm.createContext(ctx);
for(const f of ['data.js','model.js','upload-model.js'])vm.runInContext(fs.readFileSync(path.join(__dirname,'..',f),'utf8'),ctx);
const {KSData:D,KSModel:M,KSUpload:U}=ctx.window;
const base=M.clone(D.records[4].config),plain=x=>JSON.parse(JSON.stringify(x));
for(const sale of ['0','2','3']){const d={...base,sale,price:'1',unlock:'2',smallFree:'false'};assert.equal(M.validate(d).length,0);}
const mixed=M.clone(base);mixed.sale='2';mixed.price='1';mixed.episodes[0].free=false;mixed.episodes[0].price='';
assert.ok(M.validate(mixed).some(x=>x.field==='episode-price-1'));
for(const price of ['0','100.01','1.001']){mixed.episodes[0].price=price;assert.ok(M.validate(mixed).some(x=>x.field==='episode-price-1'));}
mixed.episodes[0].price='.1';assert.ok(M.validate(mixed).some(x=>x.field==='episode-price-1'));
mixed.episodes[0].price='0.10';assert.equal(M.validate(mixed).length,0);
mixed.episodes[0].price='';mixed.sale='0';assert.equal(M.validate(mixed).length,0);
const legacy={actors:'张三、李四',directors:'甲，乙',directorGender:'女'};const before=JSON.stringify(legacy);
assert.deepEqual(plain(M.personnel(legacy,'actors').map(p=>p.name)),['张三','李四']);
assert.equal(M.personnel(legacy,'actors')[0].role,'');assert.equal(M.personnel(legacy,'directors')[0].gender,'女');assert.equal(M.personnel(legacy,'directors')[1].gender,'');assert.equal(JSON.stringify(legacy),before);
const d=M.clone(base);d.filing='false';d.people={};
for(const [key,g] of Object.entries(M.peopleGroups))M.setPersonnel(d,key,Array.from({length:g.min},(_,i)=>({...M.blankPerson(),name:g.label+i,gender:'女',role:g.role?'角色'+i:''})));
assert.equal(M.validate(d).filter(x=>x.field.startsWith('people-')).length,0);
d.people.actors[0].gender='';d.people.actors[1].role='';assert.ok(M.validate(d).some(x=>x.field==='people-actors-0-gender'));assert.ok(M.validate(d).some(x=>x.field==='people-actors-1-role'));
d.people.actors[0].birthday='2026-02-30';assert.ok(M.validate(d).some(x=>x.field==='people-actors-0-birthday'));
d.filing='true';assert.equal(M.validate(d).filter(x=>x.field.startsWith('people-')).length,0);
const source=D.collections[0],config=M.clone(source);Object.assign(config,{sale:'2',price:'3',declaration:'0'});config.episodes[0].free=false;config.episodes[0].price='0.50';config.episodes[0].url='changed-not-a-video-source';
const result=U.createRecords({selected:[config.id],targets:{[config.id]:D.accounts.filter(a=>a.valid).map(a=>a.id)},configs:{[config.id]:config},records:[],accounts:D.accounts,batch:'TEST',date:'2026-10-19'});
assert.equal(result.errors.length,0);assert.equal(result.records.length,2);
for(const row of result.records){assert.equal(row.config.episodes[0].price,'0.50');assert.equal(row.config.episodes[0].free,false);assert.equal(row.config.episodes[0].url,source.episodes[0].url);assert.equal(row.config.episodes.length,source.total);}
result.records[0].config.episodes[0].price='1';assert.equal(result.records[1].config.episodes[0].price,'0.50');
console.log('PASS: 3 sale modes, conditional episode pricing, source video integrity, legacy personnel migration and per-field required validation');
// Production agency fields are optional except the company; producer count is exactly one.
const production=M.clone(base);production.filing='false';production.productionCompany='测试制作机构';production.people={};
for(const [key,g] of Object.entries(M.peopleGroups))production.people[key]=Array.from({length:g.min},()=>({...M.blankPerson(),name:'演示姓名',gender:'女',role:g.role?'演示角色':''}));
assert.equal(M.peopleGroups.producers.label,'制片人');assert.equal(M.peopleGroups.producers.max,1);
assert.equal(M.validate(production).filter(x=>['productionCompany','productionMonths','productionLicense','producers'].includes(x.field)).length,0);
production.people.producers.push({...M.blankPerson(),name:'另一位',gender:'男'});assert.ok(M.validate(production).some(x=>x.field==='producers'));
production.productionMonths='0';production.productionLicensePrefix='浙';assert.ok(M.validate(production).some(x=>x.field==='productionMonths'));assert.ok(M.validate(production).some(x=>x.field==='productionLicense'));
production.productionMonths='2.5';production.productionLicenseNumber='示例';assert.equal(M.validate(production).filter(x=>['productionMonths','productionLicense'].includes(x.field)).length,0);
console.log('PASS: single producer constraint and conditional production agency validation');
// Repeatable platform records retain legacy values and validate each card independently.
const oldBroadcast={displayPlatform:'已有平台',displayChannel:'小屏APP',displayDate:'2026-10-19T18:30'};
const oldSnapshot=JSON.stringify(oldBroadcast);
assert.deepEqual(plain(M.broadcastPlatforms(oldBroadcast)),[{name:'已有平台',channel:'小屏APP',date:'2026-10-19'}]);assert.equal(JSON.stringify(oldBroadcast),oldSnapshot);
const broadcast=M.clone(base);broadcast.filing='false';broadcast.broadcastPlatforms=[{name:'平台甲',channel:'小屏APP',date:'2026-10-19'},{name:'平台乙',channel:'PC端',date:''}];
const broadcastErrors=()=>M.validate(broadcast).filter(x=>x.field.startsWith('broadcast-'));
assert.deepEqual(plain(broadcastErrors().map(x=>x.field)),['broadcast-1-date']);
broadcast.broadcastPlatforms[1].date='2026-02-30';assert.equal(broadcastErrors().length,1);
broadcast.broadcastPlatforms[1].date='2026-10-20';assert.equal(broadcastErrors().length,0);
broadcast.broadcastPlatforms=[];assert.equal(broadcastErrors().length,3);
broadcast.filing='true';assert.equal(broadcastErrors().length,0);
console.log('PASS: legacy platform migration, per-card validation, valid calendar date and minimum platform requirement');
