import {ensureDemoScenarios} from './demo-scenarios-v8.js?v=20261106-test-scenarios';
import * as A from './access-v3.js?v=20261106-test-scenarios';
import * as B from './business-v3.js?v=20261106-test-scenarios';
export const KEY='juhui-matchmaking-20261102-v2';
export const stages={review:'剧本审核',rating:'待定稿评级',matching:'匹配承制方',production:'制作中',release:'物料与正片安审',scheduling:'待排期',online:'已上线',ended:'已终止'};
export const audits={none:'待提交',pending:'待审核',approved:'已通过',revision:'退回修改',resubmit:'待修改重审',waiting:'待制作终审',rejected:'不通过'};
export const scriptAudits={pending:'待审核',revision:'审核驳回',rejected:'不通过',approved:'审核通过'};
export const scriptAuditStatus=status=>status==='resubmit'?'revision':status==='none'?'pending':status;
export const evaluationStatuses=p=>p.stage==='ended'&&p.intake?.status==='rejected'?['rejected']:[p.quality,p.safety].map(x=>scriptAuditStatus(x.status));
export const evaluationStatus=p=>{const statuses=evaluationStatuses(p);return statuses.includes('rejected')?'rejected':statuses.includes('revision')?'revision':statuses.every(x=>x==='approved')?'approved':'pending';};
export const productionNames=['人物及场景资产','一卡 DEMO（1—10集）','全集初稿','全集终版'];
export const roles={admin:'管理员 · 全部操作权限',business:'剧本商务 · 张桂铭',prodBusiness:'承制商务 · 林婷婷',content:'剧本评估 · 刘雪莲',safety:'剧本安审 · 胡昊言',editor:'总编 / 项目负责人',dispatcher:'剧本分配 · 刘雪莲 / 陈真',producer:'项目制片 · 尹伟',film:'正片安审 · 宋家吉',ops:'排播 / 渠道运营'};
export const tags=['都市','逆袭','年代','创业','古装','情感','悬疑','玄幻'];
export const supplierBusinessOptions={script:['张桂铭','黄娇娇'],maker:['林婷婷','吴俊谊']};
const checked=()=>({status:'none',opinion:'',version:1,files:[]});
const file=(name)=>({name,size:245760,version:1,at:'2026-11-02 10:00',demo:true});
export function seed(){
 const suppliers=[{id:'s1',name:'星河内容工作室',roles:['script','maker'],scriptBusiness:'张桂铭',productionBusiness:'林婷婷',tags:['都市','逆袭','情感']}, {id:'s2',name:'青木动画',roles:['maker'],scriptBusiness:'',productionBusiness:'林婷婷',tags:['都市','古装','玄幻']}, {id:'s3',name:'云帆制作',roles:['maker'],scriptBusiness:'',productionBusiness:'吴俊谊',tags:['逆袭','年代','创业','悬疑']}, {id:'s4',name:'拾光剧本社',roles:['script'],scriptBusiness:'黄娇娇',productionBusiness:'',tags:[]}];
 const make=(id,name,stage,extra={})=>({id,name,stage,source:'external',supplier:'s1',business:'张桂铭',alias:'桂铭',producer:'',productionBusiness:'林婷婷',episodes:60,category:'女频',writer:'林予',intro:'一段从低谷重新出发的成长故事，以人物选择推动情节，兼具情感张力与逆袭爽点。',alternates:['逆光的她','向晴而生','等风也等你','',''],deliveryDate:'2026-11-02',tags:['都市','逆袭'],grade:'',card:file(name+'_一卡.docx'),full:file(name+'_全集.docx'),intake:{...checked(),status:'approved'},quality:checked(),safety:checked(),film:checked(),selected:null,offers:[],production:productionNames.map(checked),step:0,scriptMaterial:{status:'none',values:{}},makerMaterial:{status:'none',values:{},files:[]},contracts:{},history:[{at:'2026-11-02 10:00',text:'剧本资料已提交',actor:'剧本供应商'}],termination:null,channel:{status:'none',opinion:'',file:null},...extra});
 const projects=[
 make('JH110201','晨光照进旧书店','review',{quality:{...checked(),status:'pending'},safety:{...checked(),status:'pending'},intake:checked(),category:'男频'}),
 make('JH110202','逆光向晴','review',{quality:{...checked(),status:'pending'},safety:{...checked(),status:'pending'}}),
 make('JH110203','她在星河尽头','review',{quality:{...checked(),status:'approved',opinion:'人物动机与叙事节奏符合要求。'},safety:{...checked(),status:'revision',opinion:'第12集危险动作请弱化，避免模仿风险。'}}),
 make('JH110204','长安雪落时','matching',{producer:'尹伟',grade:'A',tags:['古装','情感'],quality:{...checked(),status:'approved'},safety:{...checked(),status:'approved'},offers:[{supplier:'s1',status:'pending',sent:Date.now()-3600000,expires:Date.now()+82800000},{supplier:'s2',status:'pending',sent:Date.now()-3600000,expires:Date.now()+82800000}]}),
 make('JH110205','重返九零当厂长','matching',{grade:'B',category:'男频',tags:['年代','创业','都市'],producer:'',quality:{...checked(),status:'approved'},safety:{...checked(),status:'approved'}}),
 make('JH110206','重生后我开了家面馆','production',{grade:'A',producer:'尹伟',selected:'s1',quality:{...checked(),status:'approved'},safety:{...checked(),status:'approved'},step:1,production:productionNames.map((n,i)=>({...checked(),status:i===0?'approved':i===1?'pending':'none',files:i<2?[file(n+(i===0?'.zip':'.mp4'))]:[]}))}),
 make('JH110207','九号事务所','release',{grade:'A',producer:'尹伟',selected:'s1',quality:{...checked(),status:'approved'},safety:{...checked(),status:'approved'},step:3,production:productionNames.map(n=>({...checked(),status:'approved',files:[file(n+'.mp4')]})),film:{...checked(),status:'pending'},scriptMaterial:{status:'approved',values:{shortIntro:'迷雾之中追寻真相'}},makerMaterial:{status:'pending',values:{company:'星河内容工作室',dramaType:'2D动态漫',episodes:60},files:[file('发行物料.zip')]},contracts:{script:file('九号事务所_剧本合同.pdf'),production:file('九号事务所_制作合同.pdf')}}),
 make('JH110208','山海入梦','release',{source:'internal',supplier:null,business:'总编示例',createdBy:'editor',createdByName:'总编示例',scriptBusinessId:'editor',grade:'S',producer:'尹伟',selected:'s2',tags:['玄幻'],quality:{...checked(),status:'approved'},safety:{...checked(),status:'approved'},step:3,production:productionNames.map(n=>({...checked(),status:'approved',files:[file(n+'.mp4')]})),film:{...checked(),status:'approved'},scriptMaterial:{status:'approved',values:{}},makerMaterial:{status:'approved',values:{company:'青木动画'},files:[]}}),
 make('JH110209','春风有信','scheduling',{grade:'A',producer:'尹伟',selected:'s1',quality:{...checked(),status:'approved'},safety:{...checked(),status:'approved'},step:3,production:productionNames.map(n=>({...checked(),status:'approved',files:[file(n+'.mp4')]})),film:{...checked(),status:'approved'},scriptMaterial:{status:'approved',values:{}},makerMaterial:{status:'approved',values:{},files:[]},contracts:{script:file('剧本合同.pdf'),production:file('制作合同.pdf')}}),
 make('JH110210','雾城来信','review',{source:'internal',supplier:null,business:'总编示例',createdBy:'editor',createdByName:'总编示例',scriptBusinessId:'editor',tags:['悬疑'],quality:{...checked(),status:'pending'},safety:{...checked(),status:'pending'}})
 ];
 return withSupplierAccounts(ensureDemoScenarios(withSupplierAccounts({version:2,projects,suppliers,clockOffset:0,ui:{system:'platform',role:'admin',supplier:'s1',identity:'script',view:'projects',id:null,tab:'script',keyword:'',stage:'',source:'',page:1}})));
}
export function withSupplierAccounts(s){
 const accounts={s1:'xinghe_demo',s2:'qingmu_demo',s3:'yunfan_demo',s4:'shiguang_demo'};
 for(const x of s.suppliers){x.account??=accounts[x.id]||('supplier_'+x.id);x.createdAt??='2026-10-27 14:20:00';x.status??='active';x.scriptBusiness??='';x.productionBusiness??='';}
 return applyInternalBusiness(B.init(applyMaterialVersions(applyCooperationArchiveRules(applySafetyRecheckRules(applyParallelProductionRules(applyScriptReviewRules(s)))))));
}
function materialSnapshot(material){
 const {history,draft,confirmedSnapshot,...snapshot}=material;
 return structuredClone(snapshot);
}
export function applyMaterialVersions(s){
 for(const p of s.projects)for(const key of ['scriptMaterial','makerMaterial']){
  const material=p[key];if(!material)continue;
  material.history??=[];material.files??=[];
  material.version??=['none','draft'].includes(material.status)?0:1;
  if(material.status==='approved'&&!material.confirmedSnapshot)material.confirmedSnapshot=materialSnapshot(material);
 }
 return s;
}
export function materialForEdit(material={}){
 const source=material.draft||material;
 return {values:structuredClone(source.values||{}),files:structuredClone(source.files||[])};
}
function mergeMaterialFiles(existing=[],incoming=[]){
 const slots=new Set(incoming.map(f=>f.slot).filter(Boolean));
 const result=existing.filter(f=>!f.slot||!slots.has(f.slot)).map(f=>structuredClone(f));
 for(const file of incoming){
  const key=file.previewId||[file.slot||'',file.name,file.size||'',file.at||''].join('|');
  const index=result.findIndex(x=>(x.previewId||[x.slot||'',x.name,x.size||'',x.at||''].join('|'))===key);
  if(index===-1)result.push(structuredClone(file));else result[index]=structuredClone(file);
 }
 return result;
}
function saveMaterial(s,p,key,v){
 const previous=p[key],source=materialForEdit(previous),version=(previous.version||(['none','draft'].includes(previous.status)?0:1))+1;
 const values={...source.values,...v.values},files=mergeMaterialFiles(source.files,v.files||[]);
 const at=new Date(now(s)).toLocaleString('zh-CN'),actor=s.ui.system==='platform'?A.current(s)?.name:nameOf(s,s.ui.supplier);
 const history=previous.history||[],confirmedSnapshot=previous.confirmedSnapshot||(previous.status==='approved'?materialSnapshot(previous):undefined);
 if(v.draft){
  const draft={values,files,version,savedAt:at,savedBy:actor};
  p[key]=['none','draft'].includes(previous.status)?{...previous,status:'draft',values,files,draft,history,...(confirmedSnapshot?{confirmedSnapshot}:{})}:{...previous,draft,history,...(confirmedSnapshot?{confirmedSnapshot}:{})};return;
 }
 p[key]={status:'pending',values,files,version,submittedAt:at,submittedBy:actor,history:['none','draft'].includes(previous.status)?history:[...history,materialSnapshot(previous)],...(confirmedSnapshot?{confirmedSnapshot}:{} )};
}
// Recover obsolete channel work from old rematches without inventing task or approval data.
export function applyCooperationArchiveRules(s){
 for(const p of s.projects){
  const stale=(p.stage==='ended'||(p.previousProduction?.length||p.previousCooperations?.length)&&['matching','production','release'].includes(p.stage))&&(p.schedule||p.channelTasks?.length);
  if(!stale||p.stage==='online'||p.channelTasks?.some(t=>t.status==='online'))continue;
  p.legacyReleaseArchives??=[];
  p.legacyReleaseArchives.push({reason:'旧合作遗留的排期与渠道记录',schedule:p.schedule||null,channel:structuredClone(p.channel||null),channelTasks:structuredClone(p.channelTasks||[])});
  delete p.schedule;p.channelTasks=[];p.channel={status:'none',opinion:'',file:null};
 }
 return s;
}
function archiveCooperation(s,p){
 const archivedAt=new Date(now(s)).toLocaleString('zh-CN');
 p.previousCooperations??=[];
 p.previousCooperations.push({maker:p.selected,productionBusiness:p.productionBusiness,producer:p.producer,projectName:projectName(p),stage:p.stage,grade:p.grade,tags:structuredClone(p.tags),offers:structuredClone(p.offers),scriptCard:structuredClone(p.card),scriptFull:structuredClone(p.full),production:structuredClone(p.production),film:structuredClone(p.film),makerMaterial:structuredClone(p.makerMaterial),productionContract:structuredClone(p.contracts.production||null),contractHistory:structuredClone(p.contractHistory?.production||[]),termination:structuredClone(p.termination),schedule:p.schedule||null,channel:structuredClone(p.channel||null),channelTasks:structuredClone(p.channelTasks||[]),archivedAt,archivedBy:A.current(s)?.name});
}
// Bind the first submitter, never the current viewer or the user uploading a later revision.
export function applyInternalBusiness(s){
 for(const p of s.projects.filter(x=>x.source==='internal')){
  const first=(p.history||[]).findLast(x=>/^内部剧本提交/.test(x.text));
  let creator=s.users.find(u=>u.id===p.createdBy)||s.users.find(u=>u.name===first?.actor);
  if(!creator&&['JH110208','JH110210'].includes(p.id)&&p.full?.demo&&p.business==='内部总编'&&!first)creator=s.users.find(u=>u.id==='editor');
  if(creator){p.createdBy??=creator.id;p.createdByName??=creator.name;p.scriptBusinessId??=creator.id;p.business=p.createdByName;}
 }
 return s;
}
// Old incomplete demo records are retained outside the active workflow; never fabricate a file.
export function applyScriptReviewRules(s){
 const incomplete=p=>!p.grade&&['intake','full','review'].includes(p.stage)&&(!p.full||p.source==='external'&&!p.card);
 const obsolete=s.projects.filter(incomplete);
 if(obsolete.length){
  s.legacyIncompleteProjects??=[];
  for(const p of obsolete)if(!s.legacyIncompleteProjects.some(x=>x.id===p.id))s.legacyIncompleteProjects.push(structuredClone(p));
  s.projects=s.projects.filter(p=>!incomplete(p));
  if(obsolete.some(p=>p.id===s.ui.id))s.ui.id=null;
 }
 for(const p of s.projects){
  if(!p.grade&&!p.selected&&['intake','full','review','ended'].includes(p.stage)&&[p.quality,p.safety].some(x=>x?.status==='rejected')){p.stage='ended';p.endedReason='script-rejected';}
  if(['intake','full'].includes(p.stage)&&!p.grade){
   p.stage='review';
   for(const key of ['quality','safety'])if(p[key].status==='none')p[key].status='pending';
   if(p.quality.status==='approved'&&p.safety.status==='approved')p.stage='rating';
  }
 }
 return s;
}
// Keep legacy fourth-step files/results, then treat the reviewed full delivery as the final version.
export function applyParallelProductionRules(s){
 for(const p of s.projects){
  if(p.productionWorkflowVersion===2)continue;
  p.production??=productionNames.map(checked);
  while(p.production.length<4)p.production.push(checked());
  if(p.production.some(x=>x.status!=='none'||x.files?.length)){
   p.productionLegacy??={step:p.step,items:structuredClone(p.production)};
   const final=p.production[3];
   if(final.files?.length&&final.status!=='none'){
    const prior=structuredClone(p.production[2]);
    p.production[2]={...structuredClone(final),previousResults:[...(final.previousResults||[]),prior],migratedFromFinal:true};
   }
  }
  deriveFinal(p);
  if(p.stage==='production'&&p.production.slice(0,3).every(x=>x.status==='approved')){
   p.stage='release';p.film={...p.film,status:'pending',files:structuredClone(p.production[3].files),version:p.production[3].version};
  }
  if(['release','scheduling','online'].includes(p.stage)&&p.production[3].status==='approved'&&!p.film.files?.length){p.film.files=structuredClone(p.production[3].files);p.film.version=p.production[3].version;}
  p.step=nextProductionStep(p);p.productionWorkflowVersion=2;
 }
 return s;
}
function nextProductionStep(p){
 const pending=p.production.slice(0,3).findIndex(x=>x.status==='pending');
 if(pending!==-1)return pending;
 const unfinished=p.production.slice(0,3).findIndex(x=>x.status!=='approved');
 return unfinished===-1?3:unfinished;
}
function deriveFinal(p){
 const full=p.production[2],prior=p.production[3]||checked();
 if(full.status!=='approved'){
  p.production[3]={...prior,status:full.status==='none'?'none':full.status==='resubmit'?'resubmit':'waiting',derivedFrom:2};return;
 }
 const changed=prior.version!==full.version||JSON.stringify(prior.files)!==JSON.stringify(full.files);
 const {previousResults=[],...old}=prior;
 p.production[3]={...structuredClone(full),status:'approved',derivedFrom:2,previousResults:changed&&old.files?.length?[...previousResults,structuredClone(old)]:previousResults};
}
export const canSubmitProduction=(s,p,index)=>Number.isInteger(index)&&index>=0&&index<3&&!!p&&isMaker(s,p)&&A.visible(s,p,'matching')&&
 ((p.stage==='production'&&['none','revision','resubmit'].includes(p.production[index].status))||(index===2&&p.stage==='release'&&p.film.status==='revision'));
export const canReviewProduction=(s,p,index)=>Number.isInteger(index)&&index>=0&&index<3&&!!p&&s.ui.business==='matching'&&A.canFor(s,p,'producer')&&p.stage==='production'&&p.production[index].status==='pending';
function submitProduction(s,p,deliveries){
 assert(Array.isArray(deliveries)&&deliveries.length,'请选择要提交的制作交付');
 const indexes=deliveries.map(x=>Number(x.index));
 assert(new Set(indexes).size===indexes.length,'同一项制作交付不能重复提交');
 deliveries.forEach((entry,i)=>{assert(canSubmitProduction(s,p,indexes[i]),'当前不可提交'+(productionNames[indexes[i]]||'该项制作交付'));assert(entry.files?.length,'请上传'+productionNames[indexes[i]]+'文件');});
 const safetyRevision=p.stage==='release'&&p.film.status==='revision';
 if(safetyRevision){const {previousResults=[],...old}=p.film;p.film={...p.film,status:'waiting',previousResults:[...previousResults,structuredClone(old)]};}
 deliveries.forEach((entry,i)=>{
  const index=indexes[i],{previousResults=[],...old}=p.production[index];
  p.production[index]={...checked(),status:'pending',files:structuredClone(entry.files),version:old.status==='none'&&!old.files?.length?1:(old.version||1)+1,previousResults:old.status==='none'&&!old.files?.length?previousResults:[...previousResults,structuredClone(old)],submittedAt:new Date(now(s)).toLocaleString('zh-CN')};
  if(index===2)deriveFinal(p);
  log(s,p,'提交'+productionNames[index]+' · V'+p.production[index].version+(safetyRevision?' · 正片安审修改版，重新进行制片审核':''));
 });
 p.stage='production';p.step=nextProductionStep(p);
}
function reopenAfterSafety(p,kind){
 const review=kind==='script'?p.quality:p.production[2];
 if(kind==='script'&&['none','pending','revision','rejected'].includes(review.status))return;
 if(review.status==='resubmit')return;
 const {previousResults=[],...previous}=review;
 review.previousResults=[...previousResults,structuredClone(previous)];
 review.status='resubmit';
 if(kind==='script')review.recheckReason='剧本安审退回，修改版需重新进行内容审核和安全审核。';
 else {review.recheckReason='正片安审退回，修改版需先重新通过制片终审，再进入安审。';p.production[3]={...p.production[3],status:'resubmit',recheckReason:review.recheckReason};}
}
export function applySafetyRecheckRules(s){
 for(const p of s.projects){
  if(p.stage==='review'&&p.safety.status==='revision'){
   reopenAfterSafety(p,'script');
   p.quality.recheckReason='剧本安审退回，修改版需重新进行内容审核和安全审核。';
   if(p.quality.opinion==='剧本安审退回，修改版需重新进行剧本评估和安审。')p.quality.opinion=p.quality.previousResults?.at(-1)?.opinion||'';
  }
  if(p.stage==='release'&&p.film.status==='revision')reopenAfterSafety(p,'film');
 }
 return s;
}
export function load(){try{const s=JSON.parse(localStorage.getItem(KEY));if(s?.version===2)return withSupplierAccounts(ensureDemoScenarios(withSupplierAccounts(s)));}catch{}return withSupplierAccounts(seed());}
export function save(s){localStorage.setItem(KEY,JSON.stringify(s));}
export const nameOf=(s,id)=>s.suppliers.find(x=>x.id===id)?.name||'内部自有剧本';
export const projectName=p=>p.projectName?.trim()||p.name;
export const canRenameProject=(s,p)=>s.ui.system==='platform'&&s.ui.business==='matching'&&!!p?.selected&&A.canFor(s,p,'editor','producer');
export const libraryStatus=p=>p.stage==='ended'?'ended':p.selected?'matched':!p.grade||!p.producer?'unrated':'matching';
export const libraryStatuses={unrated:'待评级',matching:'待匹配承制方',matched:'已匹配',ended:'已终止'};
export const now=s=>Date.now()+s.clockOffset;
export const assert=(ok,message)=>{if(!ok)throw Error(message);};
export function log(s,p,text){p.history.unshift({at:new Date(now(s)).toLocaleString('zh-CN',{hour12:false}),text,actor:s.ui.system==='platform'?A.current(s)?.name:nameOf(s,s.ui.supplier)});}
export function can(s,...rs){return A.has(s,...rs);}
export const isWriter=(s,p)=>s.ui.business==='matching'&&s.ui.system==='supplier'&&s.ui.identity==='script'&&p.supplier===s.ui.supplier;
export const isMaker=(s,p)=>s.ui.business==='matching'&&s.ui.system==='supplier'&&s.ui.identity==='maker'&&p.selected===s.ui.supplier;
export function visible(s){return s.projects.filter(p=>A.visible(s,p,'matching'));}
export function ready(p){return [{label:'三项制作交付审核通过',ok:p.production.slice(0,3).every(x=>x.status==='approved')&&p.production[3].status==='approved'},{label:'正片安审通过',ok:p.film.status==='approved'},{label:'剧本物料已确认',ok:p.scriptMaterial.status==='approved'},{label:'制作物料已确认',ok:p.makerMaterial.status==='approved'},...(p.source==='external'?[{label:'剧本合同已留档',ok:!!p.contracts.script}]:[]),{label:'制作合同已留档',ok:!!p.contracts.production}];}
export const isAwaitingRating=p=>!!p&&p.stage==='rating'&&!p.grade&&!!p.full&&p.quality.status==='approved'&&p.safety.status==='approved';
export const canRate=(s,p)=>s.ui.business==='matching'&&!!p&&(isAwaitingRating(p)||!!p.grade)&&A.canFor(s,p,'editor','dispatcher');
export const canReviseInternal=(s,p)=>A.canCreateInternal(s)&&p?.source==='internal'&&p.stage==='review'&&!p.grade&&[p.quality.status,p.safety.status].some(x=>x==='revision');
export const canUploadInternalMaterials=(s,p)=>A.canCreateInternal(s)&&p?.source==='internal';
export const canManageCard=(s,p)=>!!p&&s.ui.business==='matching'&&
 (isWriter(s,p)||p.source==='internal'&&A.canCreateInternal(s))&&
 ['review','rating','matching'].includes(p.stage)&&!p.selected&&!p.offers.some(o=>o.status==='pending');
export function readableScriptFiles(s,p){
 if(!p||!A.visible(s,p,'matching'))return [];
 return s.ui.system==='supplier'&&s.ui.identity==='maker'&&p.selected!==s.ui.supplier?[p.card].filter(Boolean):[p.card,p.full].filter(Boolean);
}
function reviseInternal(s,p,v){
 assert(canReviseInternal(s,p),'内部剧本退回后，管理员或总编可编辑并重新提交');
 const keys=['name','deliveryDate','category','episodes','intro','writer','alternates'];
 const next=Object.fromEntries(keys.map(k=>[k,v[k]??p[k]]));
 assert(next.name?.trim()&&next.name.length<=50&&Number.isInteger(+next.episodes)&&+next.episodes>0,'请填写剧本名称与有效集数');
 assert(next.deliveryDate&&next.intro?.trim()&&next.writer?.trim(),'请补齐交付日期、剧本简介和编剧名称');
 assert(next.alternates?.slice(0,3).length===3&&next.alternates.slice(0,3).every(x=>x.trim()),'前三个备选剧名必填');
 assert(new Set([next.name,...next.alternates.filter(Boolean)]).size===1+next.alternates.filter(Boolean).length,'剧名与备选名不能重复');
 assert(v.file&&/\.(doc|docx)$/i.test(v.file.name),'请上传修改后的 Word 全集剧本');
 replaceFull(s,p,v.file,next);
}
function replaceFull(s,p,file,info={}){
 const keys=['name','deliveryDate','category','episodes','intro','writer','alternates'];
 const version=(p.full?.version||1)+1;
 p.scriptVersions??=[];
 p.scriptVersions.push(structuredClone({version:p.full?.version||1,full:p.full,quality:p.quality,safety:p.safety,info:Object.fromEntries(keys.map(k=>[k,p[k]])),archivedBy:s.ui.system==='platform'?A.current(s)?.name:nameOf(s,s.ui.supplier),archivedAt:new Date(now(s)).toLocaleString('zh-CN')}));
 for(const key of ['quality','safety']){
  const {previousResults=[],...previous}=p[key];
  p[key]={...checked(),status:'pending',version,previousResults:previous.status==='resubmit'?previousResults:[...previousResults,{...previous,version:p.full?.version||1}]};
 }
 Object.assign(p,info,{episodes:+(info.episodes??p.episodes),full:{...file,version},stage:'review'});
}
export function sync(s,p){
 if(p.stage==='review'&&[p.quality,p.safety].some(x=>x.status==='rejected')){p.stage='ended';p.endedReason='script-rejected';log(s,p,'剧本审核不通过，评估已终止');}
 if(p.stage==='review'&&p.quality.status==='approved'&&p.safety.status==='approved'){p.stage='rating';log(s,p,'全集两项审核均通过，进入剧本库待总编评级');}
 if(p.stage==='release'&&p.production.slice(0,3).every(x=>x.status==='approved')&&ready(p).every(x=>x.ok)){p.stage='scheduling';log(s,p,'排播条件齐全，系统自动移交排播');}
}
export function expire(s){for(const p of s.projects)for(const o of p.offers)if(o.status==='pending'&&o.expires&&o.expires<=now(s)){o.status='expired';log(s,p,'24小时未反馈，系统收回推送；等待人工改推');}}
export function latestOffer(p,sid){return [...p.offers].reverse().find(o=>o.supplier===sid);}
export async function validateWord(f){
 assert(/\.(doc|docx)$/i.test(f.name),'请上传 .doc 或 .docx 格式的 Word 文件');
 const b=new Uint8Array(await f.arrayBuffer());
 if(/\.docx$/i.test(f.name))assert(b[0]===80&&b[1]===75&&new TextDecoder().decode(b).includes('word/document.xml'),'文件内容不是有效的 Word 文档，请勿仅修改后缀');
 else assert([208,207,17,224,161,177,26,225].every((n,i)=>b[i]===n)&&new TextDecoder('utf-16le').decode(b).includes('WordDocument'),'文件内容不是有效的 Word 文档，请上传原始 .doc 文件');
 return {name:f.name,size:f.size,at:new Date().toLocaleString('zh-CN'),version:1};
}
export function mutate(s,p,action,v={}){
 expire(s);assert(visible(s).some(x=>x.id===p.id),'当前角色无权查看该项目');
 const supplierOwn=isWriter(s,p),makerOwn=isMaker(s,p);const allowed=(...rs)=>A.canFor(s,p,...rs);
 switch(action){
 case 'intake':throw Error('一卡仅用于承制方选本，不再进行一卡评估');
 case 'full':
 if(p.source==='internal'){reviseInternal(s,p,v);break;}
 assert(supplierOwn&&p.stage==='review','当前账号不可提交修改剧本');
 assert(p.safety.status==='revision'||p.quality.status==='revision','没有待修改的审核项');
 assert(v.file&&/\.(doc|docx)$/i.test(v.file.name),'请上传修改后的 Word 全集');
 replaceFull(s,p,v.file);break;
 case 'internal-revise':reviseInternal(s,p,v);break;
 case 'card':
 assert(canManageCard(s,p),'当前不可修改选本一卡，请先收回待反馈推送');
 assert(v.file&&/\.(doc|docx)$/i.test(v.file.name),'请上传 Word 格式的剧本一卡');
 if(p.card)(p.cardVersions??=[]).push(structuredClone(p.card));
 p.card={...v.file,version:(p.card?.version||0)+1};
 if(p.stage==='matching'&&p.grade==='B'&&p.producer){const ids=s.suppliers.filter(x=>x.businesses.includes('matching')&&x.status==='active'&&x.roles.includes('maker')&&x.tags.some(t=>p.tags.includes(t))).map(x=>x.id);if(ids.length)push(s,p,ids,true);}break;
 case 'quality':case 'safety':
 assert(allowed(action==='quality'?'content':'safety')&&p.stage==='review'&&p.full&&p[action].status==='pending'&&![p.quality,p.safety].some(x=>x.status==='rejected'),'当前无可处理的审核任务');assert(['approved','revision','rejected'].includes(v.result),'请选择有效审核结果');assert(v.result==='approved'||v.opinion?.trim(),'审核驳回或不通过时请填写审核意见');p[action]={...p[action],status:v.result,opinion:v.opinion||'',files:structuredClone(v.files||[]),version:p.full.version||1,reviewedBy:A.current(s)?.name,reviewedAt:new Date(now(s)).toLocaleString('zh-CN')};if(p.safety.status==='revision')reopenAfterSafety(p,'script');break;
 case 'rename-project':{
 assert(canRenameProject(s,p),'仅总编 / 项目负责人或本项目制片可修改项目名称');
 const name=(v.projectName||'').trim();assert(name&&name.length<=50,'请填写1至50字的项目名称');
 const previous=projectName(p);p.projectName=name;log(s,p,'项目名称由「'+previous+'」修改为「'+name+'」');return;
 }
 case 'grade':{
 assert(canRate(s,p),'当前不可评级');assert(['S','A','B'].includes(v.grade),'请选择剧本评级');assert(v.tags?.length>0&&v.tags.length<=3&&v.tags.every(t=>tags.includes(t)),'请选择1至3个有效题材标签');assert(A.options(s,'matching','producer').some(([,name])=>name===v.producer),'请选择已授权的项目制片');
 const initial=isAwaitingRating(p),before={grade:p.grade,tags:[...p.tags],producer:p.producer,rating:p.rating?structuredClone(p.rating):null};
 if(!initial)(p.ratingHistory??=[]).push(before);
 p.grade=v.grade;p.tags=[...v.tags];p.producer=v.producer;p.rating={by:A.current(s)?.name,at:new Date(now(s)).toLocaleString('zh-CN')};
 if(initial)p.stage='matching';
 const matchChanged=initial||!before.producer||before.grade!==p.grade||before.tags.slice().sort().join('|')!==p.tags.slice().sort().join('|');
 if(p.stage==='matching'&&!p.selected&&matchChanged)autoPushMatching(s,p);
 log(s,p,(initial?'完成剧本评级':'调整剧本评级')+'：'+(before.grade||'未评级')+'→'+p.grade+'；题材：'+(before.tags.join('、')||'未确认')+'→'+p.tags.join('、')+'；项目制片：'+(before.producer||'未分配')+'→'+p.producer);return;
 }
 case 'push':
 assert(allowed('producer')&&p.stage==='matching'&&p.producer&&!p.selected,'请先完成定稿评级和制片分配');push(s,p,v.suppliers);break;
 case 'safetyAssign': assert(allowed('safetyLead'),'仅剧本安审负责人可分配');assert(A.options(s,'matching','safety').some(([id])=>id===v.assignee),'请选择剧本安审人员');p.safetyAssignee=v.assignee;break;
 case 'reviewAssign': assert(allowed('filmLead'),'仅正片安审负责人可分配');assert(A.options(s,'matching','film').some(([id])=>id===v.assignee),'请选择正片安审人员');p.filmAssignee=v.assignee;break;
 case 'withdraw':
 assert(allowed('producer')&&!p.selected,'已选中后不可撤回');{const o=p.offers.find(x=>x.supplier===v.supplier&&x.status==='pending');assert(o,'该推送已结束');o.status='withdrawn';o.withdrawnAt=now(s);}break;
 case 'select':case 'decline':{
 assert(s.ui.system==='supplier'&&s.ui.identity==='maker','请使用承制方身份');const o=latestOffer(p,s.ui.supplier);assert(p.stage==='matching'&&!p.selected&&o?.status==='pending','该剧本已不可选择');
 if(action==='select'){assert(p.card&&p.full&&p.quality.status==='approved'&&p.safety.status==='approved','一卡与已通过双审的全集齐备后才可选中');assert(p.producer,'请先为项目分配制片');assert(s.suppliers.find(x=>x.id===s.ui.supplier)?.productionBusiness,'请管理员先配置本供应商的承制商务');}
 o.status=action==='select'?'selected':'declined';o.reason=v.opinion||'';
 if(action==='select'){p.projectName??=p.name;p.selected=s.ui.supplier;p.productionBusiness=s.suppliers.find(x=>x.id===s.ui.supplier).productionBusiness;p.stage='production';log(s,p,'剧本全集已同步至选中承制方 · V'+p.full.version);p.offers.forEach(x=>{if(x!==o&&x.status==='pending')x.status='locked';});}break;}
 case 'deliver':{
 const deliveries=v.deliveries||[{index:v.index,files:v.files}];
 submitProduction(s,p,deliveries);return;}
 case 'production':{
 const index=Number(v.index);assert(Number.isInteger(index)&&canReviewProduction(s,p,index),'当前无待审核制作交付');
 assert(['approved','revision'].includes(v.result),'请选择审核通过或审核驳回');assert(v.result==='approved'||v.opinion?.trim(),'审核驳回时请填写修改意见');
 const item=p.production[index];item.status=v.result;item.opinion=v.opinion||'';item.reviewedBy=A.current(s)?.name;item.reviewedAt=new Date(now(s)).toLocaleString('zh-CN');
 if(index===2)deriveFinal(p);
 if(p.production.slice(0,3).every(x=>x.status==='approved')){
  deriveFinal(p);p.stage='release';p.step=3;
  const {previousResults=[],...oldFilm}=p.film;
  p.film={...checked(),status:'pending',files:structuredClone(p.production[3].files),version:p.production[3].version,previousResults:oldFilm.status==='none'?previousResults:[...previousResults,structuredClone(oldFilm)]};
  log(s,p,'三项制作交付均审核通过，全集终版进入正片安全审核');
 }else p.step=nextProductionStep(p);
 log(s,p,'制片审核'+productionNames[index]+' · '+(v.result==='approved'?'审核通过':'审核驳回')+(v.opinion?' · '+v.opinion:''));sync(s,p);return;}
 case 'film':
 assert(allowed('film')&&p.stage==='release'&&p.film.status==='pending'&&p.production[3].status==='approved'&&p.production.slice(0,3).every(x=>x.status==='approved'),'当前无待审正片');
 assert(['approved','revision'].includes(v.result),'请选择审核通过或审核驳回');assert(v.result==='approved'||v.opinion?.trim(),'审核驳回时请填写修改意见');
 p.film.status=v.result;p.film.opinion=v.opinion||'';p.film.reviewedBy=A.current(s)?.name;p.film.reviewedAt=new Date(now(s)).toLocaleString('zh-CN');if(v.result==='revision')reopenAfterSafety(p,'film');break;
 case 'filmResubmit':
 assert(makerOwn&&p.stage==='release'&&p.film.status==='revision','当前无需提交修改正片');submitProduction(s,p,[{index:2,files:v.files}]);return;
 case 'scriptMaterial':case 'makerMaterial':{
 const script=action==='scriptMaterial';assert(script?(supplierOwn||canUploadInternalMaterials(s,p)):makerOwn,'当前身份不可提交此物料');
 // Material preparation is independent of project stage; ownership still applies.
 saveMaterial(s,p,action,v);break;}
 case 'confirmScript':case 'confirmMaker':{
 const script=action==='confirmScript',key=script?'scriptMaterial':'makerMaterial';assert(allowed(script?(p.source==='internal'?'editor':'business'):'producer')&&p[key].status==='pending','当前无可核验物料');assert(['approved','revision'].includes(v.result),'请选择通过或退回修改');assert(v.result==='approved'||v.opinion?.trim(),'退回时请填写修改意见');p[key].status=v.result;p[key].opinion=v.opinion||'';p[key].reviewedBy=A.current(s)?.name;p[key].reviewedAt=new Date(now(s)).toLocaleString('zh-CN');if(v.result==='approved')p[key].confirmedSnapshot=materialSnapshot(p[key]);break;}
 case 'contract':
 assert(['script','production'].includes(v.kind),'请选择有效合同类型');assert(allowed(v.kind==='script'?'business':'prodBusiness'),'当前角色不可上传此合同');assert(v.kind==='production'||p.source==='external','内部自有剧本无需剧本合同');assert(v.file,'请选择已签合同');if(p.contracts[v.kind]){p.contractHistory??={};(p.contractHistory[v.kind]??=[]).push({file:structuredClone(p.contracts[v.kind]),archivedAt:new Date(now(s)).toLocaleString('zh-CN'),archivedBy:A.current(s)?.name});}p.contracts[v.kind]=structuredClone(v.file);break;
 case 'terminate':{
 assert(allowed('prodBusiness','manager')&&p.selected&&!['online','ended'].includes(p.stage)&&!p.channelTasks?.some(t=>t.status==='online'),'当前不支持终止申请');assert(v.opinion?.trim(),'请填写原因');assert(['rematch','end'].includes(v.mode),'请选择有效处理方向');
 assert(!p.termination||p.termination.mode===v.mode,'已有确认方案为'+(p.termination?.mode==='rematch'?'更换承制方，重新匹配':'结束项目')+'，请确认同一处理方案');
 const role=allowed('prodBusiness')&&!p.termination?.confirmations.includes('business')?'business':allowed('manager')&&!p.termination?.confirmations.includes('manager')?'manager':null;
 assert(role,'你已确认过本次处理方案');
 if(!p.termination)p.termination={reason:v.opinion.trim(),mode:v.mode,confirmations:[],confirmationDetails:[],createdAt:new Date(now(s)).toLocaleString('zh-CN'),createdBy:A.current(s)?.name};
 p.termination.confirmations.push(role);(p.termination.confirmationDetails??=[]).push({role,userId:A.current(s)?.id,name:A.current(s)?.name,mode:v.mode,opinion:v.opinion.trim(),at:new Date(now(s)).toLocaleString('zh-CN')});break;}
 case 'unlock':{
 assert(allowed('manager')&&p.selected&&!['online','ended'].includes(p.stage)&&!p.channelTasks?.some(t=>t.status==='online')&&p.termination?.confirmations.includes('business')&&p.termination?.confirmations.includes('manager'),'需承制商务和陈真共同确认，已上线或已结束项目不可解除');
 assert(['rematch','end'].includes(p.termination.mode),'终止方案无效');p.termination.completedAt=new Date(now(s)).toLocaleString('zh-CN');p.termination.completedBy=A.current(s)?.name;
 archiveCooperation(s,p);delete p.schedule;p.channelTasks=[];p.channel={status:'none',opinion:'',file:null};
 if(p.termination.mode==='rematch'){
  p.selected=null;p.offers.forEach(o=>{if(o.status!=='withdrawn'){o.status='withdrawn';o.withdrawnAt=now(s);}});p.stage='matching';p.production=productionNames.map(checked);p.step=0;p.film=checked();p.makerMaterial={status:'none',values:{},files:[],version:0,history:[]};delete p.contracts.production;if(p.contractHistory)delete p.contractHistory.production;p.productionBusiness='';p.termination=null;
 }else p.stage='ended';break;}
 default:throw Error('未定义的操作');
 }
 if(['intake','quality','safety','production','film','confirmScript','confirmMaker'].includes(action))assert(v.result==='approved'||v.opinion?.trim(),'退回时请填写修改意见');
 log(s,p,({safetyAssign:'分配剧本安审人员',reviewAssign:'分配正片安审人员',intake:'一卡评估',full:'上传全集 / 修改版','internal-revise':'内部剧本修改重提，重新进入全集评估与剧本安审',card:'保存承制方选本一卡',quality:'剧本内容审核',safety:'剧本安审',grade:'总编定稿评级',assign:'分配制片',push:'人工推送承制方',withdraw:'撤回推送',select:'承制方确认选中',decline:'承制方未选中',deliver:'提交制作交付',production:'制片审核交付',film:'正片安审',filmResubmit:'提交安审修改版，重新进行制作终审',scriptMaterial:'保存剧本物料',makerMaterial:'保存制作物料',confirmScript:'确认剧本物料',confirmMaker:'制片核验制作物料',contract:'已签合同上传留档',terminate:'确认合作终止',unlock:'解除合作锁定',schedule:'排播时间已登记',channelReturn:'渠道退回修改',channelFix:'提交渠道修改',channelConfirm:'制片确认修改内容',channelResubmit:'渠道运营重新送审',online:'现有发行流程同步：已上线'}[action])+(v.result?' · '+(['quality','safety'].includes(action)?scriptAudits[v.result]:audits[v.result]):'')+(v.opinion?' · '+v.opinion:''));sync(s,p);
}
function autoPushMatching(s,p){
 if(p.grade!=='B'||!p.card||!p.producer)return;
 const matched=s.suppliers.filter(x=>x.businesses.includes('matching')&&x.status==='active'&&x.roles.includes('maker')&&x.tags.some(t=>p.tags.includes(t))).map(x=>x.id);
 if(matched.length)push(s,p,matched,true);else log(s,p,'暂无题材匹配承制方，可人工补推');
}
export function push(s,p,ids,automatic=false){
 assert(p.stage==='matching'&&p.grade&&!p.selected&&p.full&&p.quality.status==='approved'&&p.safety.status==='approved','双审通过并完成评级后才可推送');
 assert(p.card,'请先补充供承制方预览的剧本一卡');
 assert(ids?.length,automatic?'没有题材匹配的承制方，请完善标签或人工改推':'请至少选择一家承制方');
 const unique=[...new Set(ids)];assert(unique.every(id=>s.suppliers.some(x=>x.id===id&&x.businesses.includes('matching')&&x.status==='active'&&x.roles.includes('maker'))),'请选择承制供应商');
 let count=0;for(const id of unique){if(latestOffer(p,id)?.status==='pending')continue;p.offers.push({supplier:id,status:'pending',sent:now(s),expires:p.grade==='B'?null:now(s)+86400000});count++;}
 if(!automatic)assert(count,'所选承制方均已有待反馈推送');if(!count)return;log(s,p,automatic?'B级自动推送全部匹配承制方':'推送承制方');
}
export function batchPush(s,ids,supplierId){
 assert(s.ui.system==='platform'&&s.ui.business==='matching','请使用平台端撮合业务');
 assert(Array.isArray(ids)&&ids.length,'请勾选待匹配的剧本');
 assert(typeof supplierId==='string'&&s.suppliers.some(x=>x.id===supplierId&&x.businesses.includes('matching')&&x.status==='active'&&x.roles.includes('maker')),'请选择一家有效的承制供应商');
 const unique=[...new Set(ids)],draft=structuredClone(s);expire(draft);
 const projects=unique.map(id=>draft.projects.find(p=>p.id===id));
 for(const p of projects){
  assert(p&&A.visible(draft,p,'matching')&&A.canFor(draft,p,'producer'),'所选剧本中存在无权匹配的记录');
  assert(p.stage==='matching'&&p.grade&&p.producer&&!p.selected&&p.full&&p.quality.status==='approved'&&p.safety.status==='approved','仅可批量匹配已评级并分配制片的待匹配剧本');
  assert(p.card,'所选剧本中存在未上传一卡的记录，请先补充一卡');
 }
 const pending=projects.filter(p=>latestOffer(p,supplierId)?.status!=='pending');
 assert(pending.length,'所选剧本均已推送给该承制方且待反馈');
 for(const p of pending)push(draft,p,[supplierId]);
 for(const p of projects){const original=s.projects.find(x=>x.id===p.id);original.offers=p.offers;original.history=p.history;}
 return {count:pending.length,skipped:projects.length-pending.length};
}
export function create(s,v,card,full){
 const internal=s.ui.system==='platform';assert(s.ui.business==='matching','请切换撮合业务');if(!internal)assert(s.suppliers.find(x=>x.id===s.ui.supplier)?.status==='active','当前供应商账号不可提交');assert(internal?A.canCreateInternal(s):s.ui.identity==='script','当前身份不可提交剧本');assert(v.name?.trim()&&Number.isInteger(+v.episodes)&&+v.episodes>0,'请填写名称与有效集数');if(!internal)assert(card,'请上传剧本一卡');assert(full,'请上传剧本全集');assert(v.alternates.slice(0,3).every(x=>x.trim()),'前三个备选剧名必填');assert(new Set([v.name,...v.alternates.filter(Boolean)]).size===1+v.alternates.filter(Boolean).length,'剧名与备选名不能重复');
 const p=structuredClone(seed().projects[0]);Object.assign(p,{...v,id:'JH'+Date.now().toString().slice(-10),episodes:+v.episodes,source:internal?'internal':'external',supplier:internal?null:s.ui.supplier,business:internal?A.current(s).name:s.suppliers.find(x=>x.id===s.ui.supplier).scriptBusiness,...(internal?{createdBy:A.current(s).id,createdByName:A.current(s).name,scriptBusinessId:A.current(s).id}:{}),card:card||null,full:full||null,stage:'review',history:[],intake:checked(),quality:{...checked(),status:'pending'},safety:{...checked(),status:'pending'}});s.projects.unshift(p);log(s,p,internal?'内部剧本提交全集审核':'供应商提交剧本内容与安全审核');return p;
}
