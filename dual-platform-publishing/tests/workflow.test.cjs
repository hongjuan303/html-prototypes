const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),path=require('node:path');
const base=path.join(__dirname,'..');const nodes=new Map();const node=s=>{if(!nodes.has(s))nodes.set(s,{textContent:'',value:'',checked:false,innerHTML:'',classList:{add(){},toggle(){}},focus(){},scrollIntoView(){},setAttribute(){},removeAttribute(){}});return nodes.get(s)};
const context=vm.createContext({assert,console,Intl,Date,localStorage:{getItem:()=>null,setItem(){}},setTimeout(){},clearTimeout(){},document:{querySelector:node,querySelectorAll:()=>[],addEventListener(){}},window:{},location:{origin:'http://localhost'},parent:{postMessage(){}}});
vm.runInContext(fs.readFileSync(path.join(base,'app.js'),'utf8').split("document.addEventListener('click'")[0],context);
vm.runInContext(`render=()=>{};toast=()=>{};closeModal=()=>{};let captured='';modal=(title,body)=>{captured=body};`,context);
vm.runInContext(`
// Douyin filters: OR within each multi-select, AND across fields, inclusive optional dates.
{
 const previousRows=rows,previousPlatform=state.platform,previousFilters=state.filters;
 const sample=(id,account,status,time,extra={})=>({id,platform:'抖音',account,status,time,name:'10086_片段.mp4',title:'长街重逢',targetName:'长街有月',...extra});
 rows=[sample('a','dy01','待发布','2026-10-19 00:00'),sample('b','dy02','已发布','2026-10-19 23:59'),sample('c','dy03','发布失败','2026-10-20 18:00'),sample('d','dy01','已发布','2026-10-18 23:59'),sample('e','dy01','发布失败','2026-10-21 00:00',{name:'10087_花絮.mp4',title:'春风归来',targetName:'春风知我意'}),sample('wx','wx01','已发布','2026-10-19 18:00',{platform:'视频号'})];
 state.platform='抖音';state.filters={account:[],status:[]};assert.equal(filtered().length,5);
 state.filters={account:['dy01','dy02'],status:['待发布','已发布'],publishStart:'2026-10-19',publishEnd:'2026-10-19'};assert.equal(filtered().map(r=>r.id).join(','),'a,b');
 state.filters={status:['发布失败'],account:['dy03']};assert.equal(filtered()[0].id,'c');assert(douyinFilterAccounts().some(a=>a.id==='dy03'&&!a.ok));assert(douyinFilterAccounts().every(a=>a.platform==='抖音'));
 state.filters={publishStart:'2026-10-20'};assert.equal(filtered().map(r=>r.id).join(','),'c,e');
 state.filters={publishEnd:'2026-10-19'};assert.equal(filtered().map(r=>r.id).join(','),'a,b,d');
 state.filters={title:'归来',material:'花絮',dramaName:'春风'};assert.equal(filtered()[0].id,'e');state.filters.material='片段';assert.equal(filtered().length,0);
 assert(listFilterError({publishStart:'2026-10-21',publishEnd:'2026-10-19'}));assert.equal(listFilterError({publishStart:'2026-10-19',publishEnd:'2026-10-19'}),'');assert.equal(listFilterError({publishEnd:'2026-10-19'}),'');
 const data=[['account','dy01'],['account','dy03'],['status','待发布'],['status','发布失败'],['title',' 重逢 '],['description','旧筛选']];data.getAll=key=>data.filter(pair=>pair[0]===key).map(pair=>pair[1]);
 const values=readListFilters(data,'抖音');assert.equal(values.account.join(','),'dy01,dy03');assert.equal(values.status.join(','),'待发布,发布失败');assert.equal(values.title,'重逢');assert.equal(values.description,undefined);
 state.platform='视频号';state.filters={account:'星河',status:'已发布'};assert.equal(filtered()[0].id,'wx');state.filters.status='待发布';assert.equal(filtered().length,0);
 assert.equal(LIST_SCHEMAS['抖音'].filters.map(f=>f[1]).join(','),'抖音号名称,作品标题,发布状态,预约发布时间,端上合集名称,素材名');assert(LIST_SCHEMAS['抖音'].columns.some(c=>c[0]==='desc'));
 rows=previousRows;state.platform=previousPlatform;state.filters=previousFilters;
 console.log('PASS: Douyin account/status multi-selection, complete account source, six filters, fuzzy text AND matching, inclusive/single-ended dates, validation and unchanged WeChat filters.');
}
`,context);
for(const f of ['workflow-v2.js','copyright.js'])vm.runInContext(fs.readFileSync(path.join(base,f),'utf8'),context);
vm.runInContext(`
const asset={...OSS_FILES[0]}, second={...OSS_FILES[3]}, third={...OSS_FILES[5]};
assert.equal(materialDrama(asset).id,'10086');assert(materialDrama({name:'片段.mp4'}).error);assert(materialDrama({name:'10086_10087.mp4'}).error);assert(materialDrama({name:'99999_clip.mp4'}).error);
let w=newWizard();w.assets=[asset,second,third];w.platforms=['抖音'];state.wizard=w;
applyAssetTitles(w,{[asset.id]:'生成标题',[second.id]:'另一标题'});assert.equal(w.assets[0].name,asset.name);assert.equal(assetConfig(w,'抖音',asset.id,'dy01').title,'生成标题');assert.equal(assetConfig(w,'视频号',asset.id,'wx01').title,undefined);
setAssignments(w,'抖音',asset.id,['dy01']);setAssignments(w,'抖音',second.id,['dy01']);setAssignments(w,'抖音',third.id,['dy01']);
let matches=nativeMatches(w);assert.equal(matches[0].options[0].id,'DY01-N-10086');assert(matches[2].error.includes('没有'));setAssignments(w,'抖音',third.id,['dy02']);assert.equal(nativeMatches(w)[2].options[0].account,'dy02');
const future=localDateTime(new Date(Date.now()+86400000));for(const a of w.assets){const id=w.assignments['抖音'+a.id][0],key=targetKey(a.id,id),t=availableTargets(w,id,a.id).find(t=>t.drama===materialDrama(a).id);w.targets[key]=t.id;w.materialAccountConfigs[key]={title:'行标题',text:'这是单独的作品简介',coverUrl:demoCover(t.name),mode:'定时发布',time:future,interval:15};}
w.publishInterval=30;let units=makeUnits(w);assert.equal(units.filter(u=>u.error).length,0);assert.equal(publishTimestamp(units[1].time)-publishTimestamp(units[0].time),1800000);assert.equal(units[2].time,units[0].time);
const k=targetKey(asset.id,'dy01');w.materialAccountConfigs[k].title='手动覆盖';applyAssetTitles(w,{[asset.id]:'再次生成'});assert.equal(assetConfig(w,'抖音',asset.id,'dy01').title,'手动覆盖');
let sync=applyMaterialSync(w,'抖音',asset.id,'dy01',[{assetId:second.id,accountId:'dy01'}]);assert.equal(sync.count,1);assert.equal(assetConfig(w,'抖音',second.id,'dy01').title,'手动覆盖');assert.equal(assetConfig(w,'抖音',second.id,'dy01').text,'这是单独的作品简介');
openNativeMaterialEditor('抖音',asset.id,'dy01');assert.equal([...captured.matchAll(/data-native-field="([^"]*)"/g)].map(m=>m[1]).filter(Boolean).join(','),'添加标签,视频封面,作品标题,作品简介,发布时间');assert.equal(materialEditor.working.materialAccountConfigs[k].title,'手动覆盖');assert(!captured.includes('maxlength="100"'));materialEditor=null;
assert.equal(nativeEditorError(w,'抖音',asset.id,'dy01'),'');w.materialAccountConfigs[k].title='';assert.equal(nativeEditorError(w,'抖音',asset.id,'dy01'),'请输入作品标题');w.materialAccountConfigs[k].title='标题';
setAssignments(w,'抖音',asset.id,['dy02']);assert.equal(w.targets[k],undefined);assert.equal(w.materialAccountConfigs[k],undefined);
for(const p of ['抖音','快手']){assert.equal(recordEditRestriction({platform:p,status:'待发布',time:future}),'');assert(recordEditRestriction({platform:p,status:'已发布',time:future}));assert(recordEditRestriction({platform:p,status:'待发布',time:'2000-01-01 10:00:00'}));}
assert(platformListAction({platform:'视频号',status:'已发布',id:'wx'}).includes('delete-video-record'));
// Preserve all four WeChat forms and Kuaishou's five confirmed fields.
const wxw=newWizard();wxw.assets=[asset];state.wizard=wxw;setAssignments(wxw,'视频号',asset.id,['wx01']);openNativeMaterialEditor('视频号',asset.id,'wx01');
const wxExpected={自营小程序:'挂链类型,关联合集,视频标注,标题,关联小程序,视频封面,描述,发布时间',自营端原生:'挂链类型,关联合集,视频标注,标题,视频封面,描述,发布时间',外部小程序:'挂链类型,关联合集,视频标注,视频封面,视频描述,发布时间',外部端原生:'挂链类型,关联合集,视频标注,视频封面,视频描述,发布时间'};
for(const type of HANGS){materialEditor.working.materialTypes[targetKey(asset.id,'wx01')]=type;renderNativeMaterialEditor();assert.equal([...captured.matchAll(/data-native-field="([^"]*)"/g)].map(m=>m[1]).filter(Boolean).join(','),wxExpected[type]);}
setAssignments(wxw,'快手',asset.id,['ks01']);openMaterialEditor('快手',asset.id,'ks01');assert.equal([...captured.matchAll(/data-native-field="([^"]*)"/g)].map(m=>m[1]).filter(Boolean).join(','),'作品描述,封面设置,挂链类型,作者声明,发布时间');materialEditor=null;
// Copyright permissions, immutable associations, status-specific editing and quota.
const originalRows=cpRows.slice(),r=cpRows.find(r=>r.id==='CP-DEMO-1'),deleted=cpRows.find(r=>r.id==='CP-DEMO-3');assert(cpEditReason(r));assert(cpEditReason({...r,dyStatus:'审核中'}));assert(cpEditReason({...r,edits:5}));assert(cpEditReason({...r,dyStatus:'待投稿',hgStatus:'审核不通过'}));assert(cpEditReason(deleted));assert.equal(cpQuotaUsed(deleted.content),1);
cpState.role='成员';assert(!cpCanSee(deleted));assert(cpCanSee(r));cpState.identity='版权个人';assert(!cpCanSee(r));cpState.identity='版权机构';cpState.role='管理员';
const pending={...r,id:'TEST',asset:{...OSS_FILES[1]},dyStatus:'待分发',hgStatus:'待分发',counted:false};assert.equal(cpDistributionError([pending]),'');assert(cpDistributionError([r]).includes('避免重复'));
const c=cpContent(pending),oldDY=c.dyOnline,oldHG=c.hgOnline;c.dyOnline=false;c.hgOnline=false;assert(cpDistributionError([pending]).includes('均未上架'));c.dyOnline=oldDY;c.hgOnline=oldHG;
cpRows=Array.from({length:30},(_,i)=>({...r,id:'quota-'+i,dyStatus:'已删除',hgStatus:'已删除',counted:true}));assert(cpDistributionError([pending]).includes('超过'));cpRows=originalRows;
// Copyright follows material selection -> per-material editing; changes are isolated until confirmed.
const d=cpNewDraft();cpState.draft=d;cpState.mode='upload';
assert.equal(d.step,1);cpNextStep();assert.equal(d.step,1);assert($('#cpError').textContent.includes('先从 OSS'));
assert.equal(cpAddDraftAssets(d,[asset.id,second.id]),2);assert.equal(cpAddDraftAssets(d,[asset.id]),0);
let stageHTML=renderCPUpload();assert(!stageHTML.includes('data-cp-editor='));assert(stageHTML.includes('下一步'));assert(!stageHTML.includes('cp-edit-draft'));
cpNextStep();assert.equal(d.step,2);stageHTML=renderCPUpload();assert(stageHTML.includes('cp-edit-draft'));assert(stageHTML.includes('未提审'));assert(cpDraftError(d).includes('关联账号'));
cpOpenDraftEditor(asset.id);assert(captured.includes('抖音视频标题'));assert(captured.includes('红果视频标题'));
cpEditorChange({dataset:{cpEditor:'linkedAccount'},value:'cp01'});cpEditorChange({dataset:{cpEditor:'content'},value:'FILM-10086'});assert.equal(cpMaterialEditor.item.dyAccount,'dy01');
Object.assign(cpMaterialEditor.item,{hgAccount:'hg01',dyTitle:'抖音标题',hgTitle:'红果标题',ai:false,anchor:false});
closeModal();assert.equal(cpMaterialEditor,null);assert.equal(d.items[asset.id].content,'');
cpOpenDraftEditor(asset.id);cpSaveDraftEditor();assert.equal(d.items[asset.id].configured,false);assert($('#modalError').textContent);
Object.assign(cpMaterialEditor.item,{linkedAccount:'cp01',content:'FILM-10086',dyAccount:'dy02',hgAccount:'hg01',dyTitle:'抖音标题',hgTitle:'红果标题',ai:false,anchor:false});
assert(cpItemError(asset,cpMaterialEditor.item).includes('不可更换'));cpMaterialEditor.item.dyAccount='dy01';assert.equal(cpItemError(asset,cpMaterialEditor.item),'');
cpMaterialEditor.item.hgTitle='#自造话题';assert(cpItemError(asset,cpMaterialEditor.item).includes('已有话题'));cpMaterialEditor.item.hgTitle='红果标题';
assert(cpItemError(r.asset,cpMaterialEditor.item).includes('重复上传'));cpSaveDraftEditor();assert.equal(cpMaterialEditor,null);assert.equal(d.items[asset.id].configured,true);assert.equal(d.items[second.id].content,'');
actions['cp-previous-step']();assert.equal(d.step,1);const savedItem=JSON.stringify(d.items[asset.id]);
cpAddDraftAssets(d,[asset.id,third.id]);assert.equal(d.assets.length,3);assert.equal(JSON.stringify(d.items[asset.id]),savedItem);
cpRemoveDraftAsset(d,third.id);assert.equal(d.items[third.id],undefined);assert.equal(JSON.stringify(d.items[asset.id]),savedItem);cpNextStep();
const beforeSave=cpRows.length;cpSaveUpload();assert.equal(cpRows.length,beforeSave);assert.equal(cpState.draft,d);assert($('#cpError').textContent.includes(second.name));
cpOpenDraftEditor(second.id);cpEditorChange({dataset:{cpEditor:'type'},value:'线索'});assert.equal(cpMaterialEditor.item.content,'');assert.equal(cpMaterialEditor.item.materialType,'预告片');
Object.assign(cpMaterialEditor.item,{linkedAccount:'cp01',content:'CLUE-10087',dyAccount:'dy02',hgAccount:'hg02',dyTitle:'另一份抖音标题',hgTitle:'另一份红果标题',ai:true,anchor:true});cpSaveDraftEditor();
assert.equal(cpDraftError(d),'');cpSaveUpload();assert.equal(cpRows.length,beforeSave+2);assert.equal(cpState.mode,'list');assert.equal(cpState.draft,null);
const firstSaved=cpRows.find(x=>x.asset.id===asset.id),secondSaved=cpRows.find(x=>x.asset.id===second.id);assert.equal(firstSaved.content,'FILM-10086');assert.equal(firstSaved.dyAccount,'dy01');assert.equal(firstSaved.dyTitle,'抖音标题');assert.equal(secondSaved.content,'CLUE-10087');assert.equal(secondSaved.dyAccount,'dy02');assert.equal(secondSaved.hgAccount,'hg02');assert.equal(secondSaved.materialType,'预告片');assert.equal(secondSaved.dyTitle,'另一份抖音标题');assert(secondSaved.ai);assert(secondSaved.anchor);assert.equal(secondSaved.dyStatus,'审核中');cpRows=originalRows;
const emptyAgain=cpNewDraft();cpAddDraftAssets(emptyAgain,[asset.id]);emptyAgain.step=2;cpRemoveDraftAsset(emptyAgain,asset.id);assert.equal(emptyAgain.step,1);assert.equal(emptyAgain.assets.length,0);
const actor={id:'ks-test',name:'新账号',platform:'快手',entry:'operator',ok:true};accounts.push(actor);ensureKSTasks(actor);assert.equal(ksCandidates(actor.id,'author').length,3);ensureKSTasks(actor);assert.equal(ksCandidates(actor.id,'author').length,3);
console.log('PASS: collection parsing, separate title/intro, manual overrides, account-scoped drama matching, sync, original forms and list actions, explicit-time spacing, copyright selection-first flow/per-material edit isolation/back navigation/validation/persistence/role isolation/edit locks/duplicate detection/dual-platform availability/quotas, and Kuaishou account catalogs.');
`,context);
for(const f of ['multi-platform.js','platform-ai.js'])vm.runInContext(fs.readFileSync(path.join(base,f),'utf8'),context);
vm.runInContext(`
// One material can be configured for all four destinations without crossing field ownership.
actions['cp-upload']();assert.equal(state.page,'wizard');assert.equal(state.step,1);assert.equal(state.wizard.platforms.join(','),CP_PLATFORM);
let mixed=state.wizard;mixed.assets=[asset,second];mixed.platforms=['抖音','视频号','快手',CP_PLATFORM];state.step=2;
assert.equal(makeUnits().length,8);assert.equal((renderAssign().match(/data-wizard-platform=/g)||[]).length,5);assert.equal((renderAssign().match(/data-platform-section=/g)||[]).length,4);
const cd=copyrightDraft(mixed);Object.assign(cd.items[asset.id],{linkedAccount:'cp01',content:'CLUE-10086',type:'\u7ebf\u7d22',materialType:'\u9884\u544a\u7247',dyAccount:'dy01',hgAccount:'hg01',dyTitle:'版权标题',hgTitle:'红果标题',ai:false,anchor:false,configured:true});
setAssignments(mixed,'抖音',asset.id,['dy01']);const mk=targetKey(asset.id,'dy01');mixed.targets[mk]='DY01-N-10086';mixed.materialAccountConfigs[mk]={title:'普通抖音标题',text:'普通抖音简介',coverUrl:demoCover('长街有月'),mode:'立即发布',interval:15};
assert.equal(makeUnits().filter(u=>!u.error).length,2,JSON.stringify(makeUnits().map(u=>({p:u.platform,e:u.error}))));actions['cp-edit-draft']({dataset:{id:asset.id}});cpMaterialEditor.item.dyTitle='版权标题独立更新';cpSaveDraftEditor();assert.equal(assetConfig(mixed,'抖音',asset.id,'dy01').title,'普通抖音标题');
mixed.platforms=['抖音'];assert.equal(makeUnits().some(u=>u.platform===CP_PLATFORM),false);mixed.platforms.push(CP_PLATFORM);assert.equal(copyrightDraft(mixed).items[asset.id].dyTitle,'版权标题独立更新');
// Removing a copyright reference keeps the source and ordinary platform assignment.
actions['cp-remove-asset']({dataset:{id:second.id}});assert(mixed.assets.some(a=>a.id===second.id));assert(platformAssets(mixed,'抖音').some(a=>a.id===second.id));assert(!copyrightUnits(mixed).some(u=>u.asset.id===second.id));
// Adding a new material within one platform does not add it to other destinations.
openLibrary('抖音');library.selected.add(third.id);$('#addLibraryAssets').onclick();assert(platformAssets(mixed,'抖音').some(a=>a.id===third.id));assert(!platformAssets(mixed,CP_PLATFORM).some(a=>a.id===third.id));
openLibrary(CP_PLATFORM);library.selected.add(second.id);$('#addLibraryAssets').onclick();assert(copyrightUnits(mixed).some(u=>u.asset.id===second.id));
const checkHTML=renderConfirm();assert(checkHTML.includes('红果标题'));assert(checkHTML.includes('提交审核'));
// Partial submission keeps only failed platform-material pairs, excluding accepted copyright records.
const allMixed=makeUnits(mixed),badMixed=allMixed.filter(u=>u.error),remaining=mixedPendingDraft(mixed,badMixed);assert(remaining);assert(!copyrightUnits(remaining).some(u=>u.asset.id===asset.id));assert(copyrightUnits(remaining).some(u=>u.asset.id===second.id));
const rowsBefore=rows.length,cpBefore=cpRows.length;mixed.onlyValid=false;submitTask();assert.equal(rows.length,rowsBefore);assert.equal(cpRows.length,cpBefore);
mixed.onlyValid=true;submitTask();assert.equal(rows.length,rowsBefore+1);assert.equal(cpRows.length,cpBefore+1);assert.equal(cpRows[0].dyTitle,'版权标题独立更新');assert.equal(cpRows[0].batch,state.batch);assert.equal(cpRows[0].dyStatus,'审核中');assert(draft.platforms.includes(CP_PLATFORM));assert(!copyrightUnits(draft).some(u=>u.asset.id===asset.id));assert(renderBatch().includes('前往版权中台'));
// Saving and normalizing a draft preserves independent copyright fields.
const roundtrip=normalizeDraft(draft);assert.equal(roundtrip.copyright.identity,'版权机构');assert(roundtrip.copyright.items[second.id]);
// Copyright-only submission never creates an ordinary account publishing row.
actions['cp-upload']();const cpOnly=state.wizard;cpOnly.assets=[third];Object.assign(copyrightDraft(cpOnly).items[third.id],{linkedAccount:'cp02',content:'CLUE-10088',type:'线索',materialType:'预告片',dyAccount:'dy02',hgAccount:'hg02',dyTitle:'版权单平台',hgTitle:'红果单平台',ai:false,anchor:false,configured:true});const beforeOnly=rows.length;submitTask();assert.equal(rows.length,beforeOnly);assert.equal(state.page,'list');assert.equal(state.platform,CP_PLATFORM);assert.equal(cpRows[0].dyTitle,'版权单平台');
console.log('PASS: four-platform entry/selection/independent fields/toggle retention/platform-only material scopes/mixed validation and submission/pending draft exclusion/copyright-only save.');
`,context);
vm.runInContext(`
// V2.3: filters use content IDs, required booleans distinguish unset from false, and failed-end retry is isolated.
const filteredRecord=cpRows.find(r=>r.id==='CP-V23-FAILED');
assert(cpMatches(filteredRecord,{...emptyCPFilters(),asset:'片段12',drama:'逆光',contentId:'CLUE-10088',type:'线索',materialType:'剧情解析',dyAccount:'dy02',hgAccount:'hg02',audit:'审核失败'}));
assert(cpMatches(filteredRecord,{...emptyCPFilters(),contentId:'10088'}));assert(!cpMatches(filteredRecord,{...emptyCPFilters(),contentId:'1008'}));assert(!cpMatches(filteredRecord,{...emptyCPFilters(),dyAccount:'dy01'}));
let boolItem={...cpNewMaterialInfo(),linkedAccount:'cp01',content:'FILM-10086',dyAccount:'dy01',hgAccount:'hg01',dyTitle:'标题',hgTitle:'标题'};
assert(cpItemError(OSS_FILES[4],boolItem).includes('是否AI作品'));boolItem.ai=false;assert.equal(cpItemError(OSS_FILES[4],boolItem),'');
boolItem={...boolItem,type:'线索',linkedAccount:'cp01',content:'CLUE-10086'};assert(cpItemError(OSS_FILES[4],boolItem).includes('是否挂载锚点'));boolItem.anchor=false;assert.equal(cpItemError(OSS_FILES[4],boolItem),'');
const isolated={...filteredRecord,id:'RETRY-TEST',dyAudit:'审核成功',dyStatus:'已发布',hgAudit:'审核失败',hgStatus:'审核不通过',dyTitle:'成功端不能改',anchor:false,ai:false,edits:0};cpRows.push(isolated);
assert.equal(cpResubmit(isolated,{dyTitle:'不应写入',hgTitle:'失败端新标题',anchor:true,ai:true}),'');assert.equal(isolated.dyTitle,'成功端不能改');assert.equal(isolated.dyAudit,'审核成功');assert.equal(isolated.hgAudit,'审核中');assert.equal(isolated.anchor,false);assert.equal(isolated.ai,false);assert(cpEditReason(isolated).includes('审核中'));
isolated.reviewDue=Date.now()-1;cpFinishReviews();assert.equal(isolated.hgAudit,'审核成功');assert(cpEditReason(isolated).includes('审核成功'));cpRows=cpRows.filter(r=>r!==isolated);
// V2.3.1: management follows the reference platform; configuration keeps the existing eleven fields.
const headers=html=>[...html.matchAll(/<th(?: [^>]*)?>([^<]+)<\\/th>/g)].map(m=>m[1]);
cpState.draft={step:2,identity:'版权机构',assets:[OSS_FILES[4]],items:{[OSS_FILES[4].id]:boolItem}};
assert.equal(headers(renderCPTable([filteredRecord])).join(','),'素材信息,关联内容,素材类型,抖音审核状态,抖音发布状态,抖音发布账号,红果审核状态,红果发布状态,红果发布账号,提审时间,操作');
assert.equal(headers(renderCPMaterialList()).join(','),CP_COLUMNS.map(c=>c[1]).concat('操作').join(','));
const awaiting={...filteredRecord,dyAudit:'审核成功',dyStatus:'待投稿',hgAudit:'审核中',hgStatus:'审核中'};
assert(cpEndAuditCell(awaiting,'dy').includes('审核成功'));assert.equal(cpPublishState(awaiting,'dy'),'待发布');assert.equal(cpPublishState(awaiting,'hg'),'待发布');assert.equal(cpPublishState(filteredRecord,'dy'),'未发布');
assert(cpEndAuditCell({dyStatus:'待投稿'},'dy').includes('待投稿'));assert(!cpEndAuditCell({dyStatus:'待投稿'},'dy').includes('审核失败'));
assert.equal(cpSubmittedAt({id:'LEGACY',created:'2026-10-15 10:00'}),'');assert.equal(cpSubmittedAt({id:'NEW',submittedAt:'2026-10-16 10:30',created:'2026-10-15 10:00'}),'2026-10-16 10:30');
const postRecord={id:'SUBMIT-TIME',submittedAt:'2026-10-16 09:00'};cpBeginReview([postRecord]);assert.equal(postRecord.submittedAt,'2026-10-16 09:00');
assert(!renderCopyright().includes('查看角色'));assert(!renderCopyright().includes('cp-distribute'));assert(!renderCopyright().includes('本期按已公开'));assert.equal(CP_COLUMNS.length,11);
// AI applications never cross platform boundaries and protect explicit edits unless overwrite is chosen.
const aiw=newWizard();aiw.assets=[asset,second];aiw.platforms=['抖音','视频号','快手',CP_PLATFORM];state.wizard=aiw;
setAssignments(aiw,'抖音',asset.id,['dy01','dy02']);aiw.materialAccountConfigs[targetKey(asset.id,'dy01')]={title:'人工标题',text:'人工简介'};
const result={asset,field:{key:'title'},text:'生成的新标题',info:{}};let applied=applyPlatformCopies(aiw,'抖音',[result],false);assert.equal(applied.applied,1);assert.equal(applied.skipped,1);assert.equal(assetConfig(aiw,'抖音',asset.id,'dy01').title,'人工标题');assert.equal(assetConfig(aiw,'抖音',asset.id,'dy02').title,'生成的新标题');assert.equal(assetConfig(aiw,'抖音',asset.id,'dy01').text,'人工简介');
applyPlatformCopies(aiw,CP_PLATFORM,[{...result,field:{key:'hgTitle'},text:'独立红果标题'}]);assert.equal(copyrightDraft(aiw).items[asset.id].hgTitle,'独立红果标题');assert.equal(copyrightDraft(aiw).items[asset.id].dyTitle,'');assert.equal(assetConfig(aiw,'抖音',asset.id,'dy01').title,'人工标题');
applyPlatformCopies(aiw,'视频号',[{...result,field:{key:'text'},text:'视频号描述'}]);assert.equal(assetConfig(aiw,'视频号',asset.id,'wx01').text,'视频号描述');assert.equal(assetConfig(aiw,'快手',asset.id,'ks01').text,aiw.configs['快手'].text);assert.equal(aiw.assets[0].name,asset.name);
setAssignments(aiw,'视频号',asset.id,['wx01']);aiw.materialTypes[targetKey(asset.id,'wx01')]='外部小程序';assert.equal(aiFieldLimit(aiw,'视频号',asset,'text'),100);assert.equal(aiFieldLimit(aiw,'抖音',asset,'title'),null);
assert(platformAIError({enabled:['title'],limits:{title:0}}));assert.equal(platformAIError({enabled:['title'],limits:{title:50}}),'');
aiw.aiSelections={抖音:[asset.id],视频号:[second.id]};assert.equal(aiSelectedAssets(aiw,'抖音')[0].id,asset.id);assert.equal(aiSelectedAssets(aiw,'视频号')[0].id,second.id);assert(!renderImport().includes('AI生成'));
console.log('PASS: nine filters, platform-reference management columns, separate audit/publishing states, stable submission time, unchanged configuration columns, required true/false states, failed-end-only resubmission, immutable successful fields, platform AI isolation, explicit overwrite, independent selections and field-specific limits.');
`,context);

vm.runInContext(fs.readFileSync(path.join(base,'kuaishou-operator.js'),'utf8'),context);
vm.runInContext(`
{
 const w=newWizard();w.assets=[asset,second];w.platforms=[KM_PLATFORM,'抖音','快手'];state.wizard=w;
 w.aiSelections={[KM_PLATFORM]:[asset.id],'抖音':[second.id]};
 assert.equal(aiSelectedAssets(w,KM_PLATFORM).length,1);
 assert.equal(aiFieldLimit(w,KM_PLATFORM,asset,'title'),20);
 assert.equal(platformAIError({p:KM_PLATFORM,enabled:['title'],limits:{title:20}}),'');
 for(const value of [0,21,1.5])assert(platformAIError({p:KM_PLATFORM,enabled:['title'],limits:{title:value}}));
 openPlatformAI(KM_PLATFORM);assert.equal(platformAISession.limits.title,20);
 assert(captured.includes('20字内'));assert(!captured.includes('30字内'));assert(captured.includes('剪辑标题'));
 generatePlatformAI();assert(platformAISession.results.every(r=>[...r.text].length<=20));
 assert.equal(kmConfig(w,asset.id,null).title,''); // Preview does not mutate the draft.
 const result={asset,field:{key:'title'},text:'预生成的剪辑标题',info:{}};
 assert.equal(applyPlatformCopies(w,KM_PLATFORM,[result]).applied,1);
 const restored=normalizeDraft(w);kmSetAccounts(restored,asset.id,['km01','km02']);
 assert.equal(kmConfig(restored,asset.id,'km01').title,result.text);
 assert.equal(kmConfig(restored,asset.id,'km02').title,result.text);
 kmSetAccounts(w,asset.id,['km01','km02']);
 kmDraft(w).configs[kmKey(asset.id,'km01')]={title:'人工标题',clipType:'花絮',declaration:1};
 kmDraft(w).configs[kmKey(asset.id,'km02')]={title:'',clipType:'高光',declaration:0};
 const otherBefore=JSON.stringify([w.assets,w.configs,w.materialConfigs,w.materialAccountConfigs]);
 const applied=applyPlatformCopies(w,KM_PLATFORM,[result]);assert.equal(applied.applied,1);assert.equal(applied.skipped,1);
 assert.equal(kmConfig(w,asset.id,'km01').title,'人工标题');assert.equal(kmConfig(w,asset.id,'km02').title,result.text);
 applyPlatformCopies(w,KM_PLATFORM,[{...result,text:'覆盖后的标题'}],true);
 assert.equal(kmConfig(w,asset.id,'km01').title,'覆盖后的标题');assert.equal(kmConfig(w,asset.id,'km01').clipType,'花絮');assert.equal(kmConfig(w,asset.id,'km01').declaration,1);
 assert.equal(kmConfig(w,second.id,null).title,'');assert.equal(JSON.stringify([w.assets,w.configs,w.materialConfigs,w.materialAccountConfigs]),otherBefore);
 for(const text of ['字'.repeat(21),'   '])assert.equal(applyPlatformCopies(w,KM_PLATFORM,[{...result,text}],true).applied,0);
 assert.equal(applyPlatformCopies(w,KM_PLATFORM,[{...result,info:{error:'未识别合集ID'}}],true).applied,0);
 assert.equal(applyPlatformCopies(w,KM_PLATFORM,[{...result,text:'😀'.repeat(20)}],true).applied,2);
 const html=renderKMSection();assert(html.includes('data-ai-all="'+KM_PLATFORM+'"'));assert.equal((html.match(/data-ai-asset=/g)||[]).length,2);assert(html.includes('rowspan="2"'));assert(html.includes('AI生成标题'));assert(html.includes('已勾选 1 份'));
 kmClearAsset(w,asset.id);assert.equal(aiSelectedAssets(w,KM_PLATFORM).length,0);assert.equal(kmConfig(w,asset.id,null).title,'');assert(w.aiSelections['抖音'].includes(second.id));
 console.log('PASS: operator AI selection, 20-character limits, preview isolation, deferred account assignment, draft recovery, per-account overwrite protection, metadata preservation and cleanup.');
}
`,context);
vm.runInContext(`
// Operator validation counts code points and keeps creator-platform settings independent.
assert.equal(PUBLISH_PLATFORMS.join(','),'抖音,视频号,快手,快手经管平台,抖音版权中台');
assert.equal(kmConfigError({dramaId:'78645000001',title:'字'.repeat(20),clipType:'高光',declaration:0}),'');
assert(kmConfigError({dramaId:'78645000001',title:'字'.repeat(21),clipType:'高光',declaration:0}).includes('20'));
assert.equal(kmConfigError({dramaId:'78645000001',title:'😀'.repeat(20),clipType:'花絮',declaration:1}),'');
assert(kmConfigError({dramaId:'78645000001',title:'标题',clipType:'高光',declaration:null}).includes('声明'));
assert(kmConfigError({dramaId:'78645000001',title:'标题',clipType:'素材',declaration:0}).includes('类型'));
const kw=newWizard();kw.platforms=[KM_PLATFORM,'快手'];kw.assets=[asset,third];state.wizard=kw;
kmSetAccounts(kw,asset.id,['km01','km02']);kmDraft(kw).configs[kmKey(asset.id,'km01')]={dramaId:kmTarget(asset,'km01').id,title:'标题一',clipType:'高光',declaration:0};kmDraft(kw).configs[kmKey(asset.id,'km02')]={dramaId:kmTarget(asset,'km02').id,title:'标题二',clipType:'花絮',declaration:1};
assert.equal(kmUnits(kw).filter(u=>!u.error).length,2);assert.equal(makeUnits(kw).filter(u=>u.platform==='快手').length,2);
assert.notEqual(kmTarget(asset,'km01').id,kmTarget(asset,'km02').id);assert.notEqual(kmTarget(asset,'km01').id,materialDrama(asset).id);
kmSetAccounts(kw,third.id,['km02']);assert(kmUnits(kw).find(u=>u.asset.id===third.id).error.includes('短剧'));
assert.equal(normalizeDraft(kw).kuaishouOperator.configs[kmKey(asset.id,'km02')].title,'标题二');
kmSetAccounts(kw,asset.id,['km01']);assert.equal(kmDraft(kw).configs[kmKey(asset.id,'km02')],undefined);
assert.equal(kmSubmittedAt({submittedAt:'2026-10-19 09:00:00',created:'2026-10-18 08:00:00',publishedAt:'2026-10-19 10:00:00'}),'2026-10-19 09:00:00');
assert.equal(kmSubmittedAt({created:'2026-10-19 09:00:00'}),'2026-10-19 09:00:00');
assert.equal(kmSubmittedAt({publishedAt:'2026-10-19 10:00:00'}),'');
const frow=kmRows[0];assert(kmMatches(frow,{...emptyKMFilters(),dramaId:frow.dramaId}));assert(!kmMatches(frow,{...emptyKMFilters(),dramaId:frow.dramaId.slice(0,-1)}));assert(!kmMatches(frow,{...emptyKMFilters(),status:'发布失败'}));
assert(!kmMatches({...frow,publishedAt:''},{...emptyKMFilters(),start:'2026-10-19'}));
// Partial mixed submission keeps only failed account-material pairs in the remaining draft.
kw.platforms=[KM_PLATFORM];kmSetAccounts(kw,asset.id,['km01','km02']);
const beforeKM=kmRows.length;kw.onlyValid=true;state.wizard=kw;submitTask();assert.equal(kmRows.length,beforeKM+1);assert.equal(kmRows[0].title,'标题一');
const submittedTime=kmRows[0].submittedAt;assert(submittedTime);assert.equal(kmRows[0].publishedAt,'');
kmRows[0].due=0;kmFinishPublishing();assert.equal(kmRows[0].status,'已发布');assert(kmRows[0].publishedAt);assert.equal(kmRows[0].submittedAt,submittedTime);
assert(draft);assert.equal(kmUnits(draft).some(u=>u.asset.id===asset.id&&u.account==='km01'),false);assert(kmUnits(draft).some(u=>u.account==='km02'));
const mixedKM=newWizard();mixedKM.assets=[second];mixedKM.platforms=[KM_PLATFORM,'抖音'];state.wizard=mixedKM;
kmSetAccounts(mixedKM,second.id,['km01']);kmDraft(mixedKM).configs[kmKey(second.id,'km01')]={dramaId:kmTarget(second,'km01').id,title:'经管标题',clipType:'花絮',declaration:1};
setAssignments(mixedKM,'抖音',second.id,['dy01']);mixedKM.targets[targetKey(second.id,'dy01')]='DY01-N-10086';mixedKM.materialAccountConfigs[targetKey(second.id,'dy01')]={title:'抖音标题',text:'抖音简介',coverUrl:demoCover('长街有月'),mode:'立即发布',interval:15};
assert.equal(makeUnits(mixedKM).filter(u=>!u.error).length,2);const normalBefore=rows.length,operatorBefore=kmRows.length;submitTask();assert.equal(rows.length,normalBefore+1);assert.equal(kmRows.length,operatorBefore+1);assert.equal(kmRows[0].batch,rows[0].batch);assert.equal(rows[0].title,'抖音标题');assert.equal(kmRows[0].title,'经管标题');assert.equal(draft,null);
console.log('PASS: operator title boundaries, explicit declarations, account-scoped platform IDs, independent drafts, seven filters, partial submission and mixed-platform storage.');
`,context);
vm.runInContext(`
const cpMix=newWizard();const cpMixAsset={...OSS_FILES[10]};cpMix.assets=[cpMixAsset];cpMix.platforms=[CP_PLATFORM,KM_PLATFORM];state.wizard=cpMix;state.batch='OLDER-BATCH';
const cpMixInfo=copyrightDraft(cpMix).items[cpMixAsset.id];Object.assign(cpMixInfo,{type:'线索',linkedAccount:'cp01',content:'CLUE-10086',materialType:'花絮',dyAccount:'dy01',hgAccount:'hg01',dyTitle:'版权素材标题',hgTitle:'红果素材标题',ai:false,anchor:false,configured:true});
kmSetAccounts(cpMix,cpMixAsset.id,['km01']);kmDraft(cpMix).configs[kmKey(cpMixAsset.id,'km01')]={dramaId:kmAvailableDramas('km01')[0].id,title:'经管素材标题',clipType:'高光',declaration:0};
assert.equal(makeUnits(cpMix).filter(u=>!u.error).length,2);submitTask();assert.equal(kmRows[0].batch,cpRows[0].batch);assert.notEqual(kmRows[0].batch,'OLDER-BATCH');assert.equal(state.batch,kmRows[0].batch);
console.log('PASS: operator and copyright-only mixed submissions share the new batch, independent of prior navigation.');
`,context);

vm.runInContext(`
// Sync only selected, active materials within the current platform.
{
 const w=newWizard();w.platforms=[KM_PLATFORM,CP_PLATFORM,'抖音'];w.assets=OSS_FILES.slice(0,4).map(a=>({...a}));state.wizard=w;state.page='wizard';state.step=2;
 const [source,destination,unselected,removed]=w.assets;
 w.excluded[KM_PLATFORM]=[removed.id];w.excluded[CP_PLATFORM]=[removed.id];
 kmSetAccounts(w,source.id,['km01']);kmSetAccounts(w,destination.id,['km02']);
 kmDraft(w).configs[kmKey(source.id,'km01')]={title:'同步后的剪辑标题',clipType:'花絮',declaration:0};
 kmDraft(w).configs[kmKey(destination.id,'km02')]={title:'原标题',clipType:'高光',declaration:1};
 const assignments=JSON.stringify(kmDraft(w).assignments),targetId=kmTarget(destination,'km02').id,other=JSON.stringify([w.assets,w.materialAccountConfigs,w.materialConfigs]);
 assert.equal(applyKMMaterialSync(w,source.id,'km01',new Set([destination.id,removed.id,'missing'])),1);
 assert.equal(kmConfig(w,destination.id,'km02').title,'同步后的剪辑标题');assert.equal(kmConfig(w,destination.id,'km02').declaration,0);
 assert.equal(kmTarget(destination,'km02').id,targetId);assert.equal(JSON.stringify(kmDraft(w).assignments),assignments);
 assert.equal(kmConfig(w,unselected.id,null).title,'');assert.equal(kmConfig(w,removed.id,null).title,'');
 assert.equal(JSON.stringify([w.assets,w.materialAccountConfigs,w.materialConfigs]),other);
 const beforeEmpty=JSON.stringify(w);assert.equal(applyKMMaterialSync(w,source.id,'km01',new Set()),0);assert.equal(JSON.stringify(w),beforeEmpty);
 assert.equal(applyKMMaterialSync(w,source.id,'km02',new Set([destination.id])),0);
 applyKMMaterialSync(w,source.id,'km01',new Set([unselected.id]));assert.equal(kmConfig(w,unselected.id,null).declaration,0);
 const restored=normalizeDraft(w);kmSetAccounts(restored,unselected.id,['km01']);assert.equal(kmConfig(restored,unselected.id,'km01').clipType,'花絮');
 kmClearAsset(restored,unselected.id);assert.equal(kmConfig(restored,unselected.id,null).clipType,'');
 const d=copyrightDraft(w);cpState.draft=d;
 Object.assign(d.items[source.id],{type:'线索',linkedAccount:'cp01',content:'CLUE-10086',materialType:'花絮',dyAccount:'dy01',hgAccount:'hg01',dyTitle:'抖音同步标题',hgTitle:'红果同步标题',topics:['剧情解读'],ai:false,anchor:false,configured:true});
 Object.assign(d.items[destination.id],{dyAccount:'dy02',hgAccount:'hg02',dyTitle:'原抖音标题'});
 const cpBefore=JSON.stringify(d.items[unselected.id]),kmBefore=JSON.stringify(w.kuaishouOperator),rowsBefore=JSON.stringify(cpRows);
 assert.equal(applyCPMaterialSync(w,source.id,new Set([source.id,destination.id,removed.id,'missing'])),2);
 assert.equal(d.items[destination.id].dyAccount,'dy01');assert.equal(d.items[destination.id].hgAccount,'hg01');assert.equal(d.items[destination.id].dyTitle,'抖音同步标题');assert.equal(d.items[destination.id].ai,false);assert.equal(d.items[destination.id].anchor,false);
 assert.equal(JSON.stringify(d.items[unselected.id]),cpBefore);assert.equal(JSON.stringify(w.kuaishouOperator),kmBefore);assert.equal(JSON.stringify(cpRows),rowsBefore);
 d.items[destination.id].topics.push('一起追好剧');assert.equal(d.items[source.id].topics.length,1);
 const snapshot=JSON.stringify(w);assert.equal(applyCPMaterialSync(w,source.id,new Set()),0);assert.equal(JSON.stringify(w),snapshot);
 assert.equal(applyCPMaterialSync(w,unselected.id,new Set([destination.id])),0);
 Object.assign(d.items[source.id],{type:'正片',linkedAccount:'cp01',content:'FILM-10086',anchor:true});applyCPMaterialSync(w,source.id,new Set([destination.id]));assert.equal(d.items[destination.id].anchor,null);
 assert.equal(cpBooleanField('anchor','是否挂载锚点',d.items[destination.id]),'');assert.equal(cpTableCell('anchor',{...d.items[destination.id],asset:destination},true),'—');
 assert(cpBooleanField('ai','是否AI作品',d.items[destination.id]).includes('是否AI作品'));assert(!cpBooleanField('ai','是否AI作品',d.items[destination.id]).includes('作品声明'));
 cpOpenDraftEditor(source.id);assert(!captured.includes('data-cp-boolean="anchor"'));
 cpEditorChange({type:'radio',checked:true,value:'线索',dataset:{cpEditor:'type'}});assert.equal(cpMaterialEditor.item.anchor,null);assert(captured.includes('data-cp-boolean="anchor"'));assert(!captured.includes('短剧锚点'));
 cpMaterialEditor.item.anchor=true;cpEditorChange({type:'radio',checked:true,value:'正片',dataset:{cpEditor:'type'}});assert.equal(cpMaterialEditor.item.anchor,null);assert(!captured.includes('data-cp-boolean="anchor"'));cpMaterialEditor=null;
 openKMMaterialSync(source.id,'km01');assert.equal((captured.match(/name="syncMaterial"/g)||[]).length,3);assert(captured.includes('value="'+source.id+'" checked'));
 openCPMaterialSync(source.id);assert.equal((captured.match(/name="syncMaterial"/g)||[]).length,3);assert(captured.includes('value="'+source.id+'" checked'));
 console.log('PASS: operator/copyright sync selection, defaults before account assignment, field and platform isolation, nested-copy safety, shared sync modal, and clue-only anchor visibility/validation.');
}
`,context);

vm.runInContext(`
{
 const a={...OSS_FILES[0]}, w=newWizard();w.platforms=[KM_PLATFORM,CP_PLATFORM];w.assets=[a,{...OSS_FILES[1]}];state.wizard=w;
 kmSetAccounts(w,a.id,['km01','km02']);
 const c={title:'宣发素材',clipType:'高光',declaration:0,mode:'立即发布',time:''};
 assert(kmConfigError(c,'km01').includes('原生短剧'));
 const chosen=kmAvailableDramas('km01')[1];assert.notEqual(chosen.collectionId,kmSourceDrama(a).id);
 kmDraft(w).configs[kmKey(a.id,'km01')]={...c,dramaId:chosen.id};
 assert.equal(kmUnits(w).find(u=>u.account==='km01').target.id,chosen.id);
 assert.equal(kmUnits(w).find(u=>u.account==='km01').error,'');
 assert(kmConfigError({...c,dramaId:chosen.id},'km02').includes('不属于'));
 assert(kmConfigError({...c,dramaId:'78645000999'},'km01').includes('已下架'));
 assert(!kmAvailableDramas('km01').some(t=>t.status!=='已上架'));
 assert(publishingTimeError({mode:'定时发布',time:''}).includes('请选择'));
 assert(publishingTimeError({mode:'定时发布',time:'2000-01-01T10:00'}).includes('晚于'));
 assert.equal(publishingTimeError({mode:'定时发布',time:future}),'');
 const unit=kmUnits(w).find(u=>u.account==='km01');unit.config={...unit.config,mode:'定时发布',time:future};
 const result=kmSaveUnits([unit],'SCHEDULE-CHECK')[0];assert.equal(result.status,'待发布');assert.equal(result.publishedAt,'');kmFinishPublishing();assert.equal(result.status,'待发布');
 result.time='2000-01-01T10:00';kmFinishPublishing();assert.equal(result.status,'发布中');result.due=0;kmFinishPublishing();assert.equal(result.status,'已发布');
 const d=copyrightDraft(w);cpState.draft=d;cpOpenDraftEditor(a.id);
 assert.equal(cpMaterialEditor.item.linkedAccount,'');assert.equal(cpPickerCandidates().length,0);
 cpEditorChange({dataset:{cpEditor:'linkedAccount'},value:'cp01'});assert(cpPickerCandidates().every(c=>c.linkedAccount==='cp01'));
 cpMaterialEditor.query='长街';assert.equal(cpPickerCandidates().length,1);cpMaterialEditor.query='没有这部剧';assert.equal(cpPickerCandidates().length,0);
 cpEditorChange({dataset:{cpEditor:'content'},value:'FILM-10086'});assert.equal(cpMaterialEditor.item.dyAccount,'dy01');
 cpEditorChange({dataset:{cpEditor:'linkedAccount'},value:'cp02'});assert.equal(cpMaterialEditor.item.content,'');assert.equal(cpMaterialEditor.item.dyAccount,'');assert(cpPickerCandidates().every(c=>c.linkedAccount==='cp02'));
 cpMaterialEditor.item.content='FILM-10086';assert(cpAssociationError(cpMaterialEditor.item).includes('不属于'));
 cpEditorChange({dataset:{cpEditor:'linkedAccount'},value:'cp03'});assert.equal(cpPickerCandidates().length,0);closeModal();assert.equal(d.items[a.id].linkedAccount,'');
 Object.assign(d.items[a.id],{linkedAccount:'cp01',content:'FILM-10086',configured:true,mode:'定时发布',time:future});
 applyCPMaterialSync(w,a.id,new Set([w.assets[1].id]));assert.equal(d.items[w.assets[1].id].linkedAccount,'cp01');assert.equal(d.items[w.assets[1].id].time,future);
 console.log('PASS: explicit operator drama, account ownership and shelf status, copyright account-dependent fuzzy candidates/reset/cancel/sync, and scheduling validation/lifecycle.');
}
`,context);

vm.runInContext(`
{
 const previous=cpRows;cpRows=[];
 const item={...cpNewMaterialInfo(),linkedAccount:'cp01',content:'FILM-10086',dyAccount:'dy01',hgAccount:'hg01',dyTitle:'预约提审测试',hgTitle:'预约提审测试',ai:false,configured:true,mode:'定时发布',time:future};
 const saved=saveCopyrightUnits([{cpItem:item,asset:{...OSS_FILES[1]},identity:'版权机构'}],'CP-SCHEDULE');const r=saved[0];
 assert.equal(r.linkedAccount,'cp01');assert.equal(r.dyStatus,'待提审');assert.equal(r.hgStatus,'待提审');assert.equal(cpSubmittedAt(r),'');assert(!r.reviewDue);
 assert.equal(cpPublishState(r,'dy'),'待发布');assert(cpEndAuditCell(r,'dy').includes('待提审'));assert(cpAuditCell(r).includes('待提审'));
 cpFinishReviews();assert.equal(r.dyStatus,'待提审');r.scheduledSubmitAt=Date.now()-1;cpFinishReviews();assert.equal(r.dyStatus,'审核中');assert(cpSubmittedAt(r));assert(r.reviewDue);const submitted=r.submittedAt;
 r.reviewDue=Date.now()-1;cpFinishReviews();assert.equal(r.dyStatus,'已发布');assert.equal(cpAudit(r,'dy'),'审核成功');assert.equal(r.submittedAt,submitted);
 const bad=saveCopyrightUnits([{cpItem:item,asset:{...OSS_FILES[2]},identity:'版权机构'}],'CP-SCHEDULE-INVALID')[0];bad.linkedAccount='cp02';bad.scheduledSubmitAt=Date.now()-1;cpFinishReviews();assert.equal(bad.dyStatus,'提审失败');assert.equal(cpSubmittedAt(bad),'');assert(bad.dyReason.includes('不属于'));assert(cpEndAuditCell(bad,'dy').includes('失败原因'));assert(cpAuditCell(bad).includes('失败原因'));
 cpRows=previous;
 console.log('PASS: copyright schedules wait before review, retain association/time, start review only at due time, publish after approval, and revalidate account ownership on execution.');
}
`,context);
