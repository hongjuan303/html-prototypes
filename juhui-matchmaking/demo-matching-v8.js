// Isolated, original demo records. No runtime workflow or permission rules are changed.
const PREFIX='demo-matching-v8:';
const DAY=86400000;
const deliveryNames=['人物及场景资产','一卡演示片','全集初稿','全集终版'];
const definitions=[];
const add=(key,label,group,build)=>definitions.push({id:String(definitions.length+1).padStart(3,'0'),key,label,group,build});
const clone=value=>structuredClone(value);
const blank=()=>({status:'none',opinion:'',version:1,files:[]});
const emptyMaterial=()=>({status:'none',values:{},files:[],version:0,history:[]});
const stamp=ms=>new Date(ms).toLocaleString('zh-CN',{hour12:false});
const localInput=ms=>{const d=new Date(ms);return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}T${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;};
function fixture(s,scene,copy,now){
 const suffix=copy===1?'青禾巷的灯':'听风邮局',name=`【${scene.label}】${suffix}`;
 const scriptSupplier=s.suppliers.find(x=>x.id===(copy===1?'s1':'s4'))||s.suppliers.find(x=>x.roles?.includes('script'));
 const maker=s.suppliers.find(x=>x.id===(copy===1?'s1':'s2'))||s.suppliers.find(x=>x.roles?.includes('maker'));
 const producer=s.users.find(x=>x.id===(copy===1?'producer':'producer2'))||s.users.find(x=>x.matching?.roles.includes('producer'));
 const context={s,scene,copy,now,maker,producer,at:stamp(now-DAY),time:days=>stamp(now-days*DAY)};
 context.file=(label,extension='docx',version=1,extra={})=>({name:`${name}_${label}_V${version}.${extension}`,size:245760,version,at:context.at,demo:true,...extra});
 const p={id:`DEMO-M-${scene.id}-${copy}`,sceneId:`${PREFIX}${scene.id}:${copy}`,demoScenario:{id:scene.id,key:scene.key,label:scene.label,group:scene.group,copy},name,stage:'review',source:'external',supplier:scriptSupplier?.id,business:scriptSupplier?.scriptBusiness||'张桂铭',alias:copy===1?'桂铭':'乔乔',producer:'',productionBusiness:'',episodes:60,category:copy===1?'女频':'男频',writer:'演示编剧'+copy,intro:'一位修复旧物的年轻人回到故乡，与伙伴共同经营街角工作室，在日常合作中重新理解亲情与理想。此段为原创测试简介。',alternates:[suffix+'之约',suffix+'来信',suffix+'向晨',suffix+'拾光',suffix+'新章'],deliveryDate:localInput(now-5*DAY).slice(0,10),tags:['都市','情感'],grade:'',card:context.file('剧本一卡'),full:context.file('剧本全集'),intake:{...blank(),status:'approved'},quality:{...blank(),status:'pending'},safety:{...blank(),status:'pending'},safetyAssignee:'safety2',filmAssignee:'film',film:blank(),selected:null,offers:[],production:deliveryNames.map(blank),productionWorkflowVersion:2,step:0,scriptMaterial:emptyMaterial(),makerMaterial:emptyMaterial(),contracts:{},contractHistory:{},scriptVersions:[],previousCooperations:[],termination:null,channel:{status:'none',opinion:'',file:null},channelTasks:[],history:[{at:context.time(5),actor:scriptSupplier?.name||'剧本供应商',text:'演示场景：剧本一卡与全集已提交；'+scene.label}]};
 return {p,c:context};
}
function review(c,status,kind='内容',version=1){
 const result={...blank(),status,version};
 if(['approved','revision','rejected'].includes(status))Object.assign(result,{opinion:status==='approved'?`${kind}核对通过。`:status==='revision'?`请完善第6集人物动机，并修正第12集不恰当的行为表现。`:'当前故事与目标受众不匹配，确认终止本次评估。',reviewedBy:kind==='安全'?'李犇犇':'刘雪莲',reviewedAt:c.time(4)});
 if(['revision','rejected'].includes(status))result.files=[c.file(kind+'审核批注','docx',version,{reviewAttachment:true})];
 return result;
}
function internal(p,c){p.source='internal';p.supplier=null;p.business='总编示例';p.createdBy='editor';p.createdByName='总编示例';p.scriptBusinessId='editor';p.alias='';p.history[0]={at:c.time(5),actor:'总编示例',text:'内部剧本提交 · 演示场景：'+c.scene.label};}
function dual(p,c,quality='pending',safety='pending'){
 p.quality=review(c,quality);p.safety=review(c,safety,'安全');
 if(safety==='revision'){
  p.quality.recheckReason='剧本安审退回，修改版需重新进行内容审核和安全审核。';
  if(quality==='approved'){p.quality.previousResults=[clone(p.quality)];delete p.quality.previousResults[0].recheckReason;p.quality.status='resubmit';}
 }
 p.stage=[quality,safety].includes('rejected')?'ended':quality==='approved'&&safety==='approved'?'rating':'review';
 if(p.stage==='ended')p.endedReason='script-rejected';
}
function matching(p,c){dual(p,c,'approved','approved');p.stage='matching';p.grade=c.copy===1?'A':'S';p.producer=c.producer?.name||'尹伟';p.rating={by:'总编示例',at:c.time(3)};}
function offer(p,c,supplier,status='pending',extra={}){
 const sent=status==='expired'?c.now-2*DAY:c.now-3600000;
 return {supplier,status,sent,expires:p.grade==='B'?null:sent+DAY,...(status==='withdrawn'?{withdrawnAt:c.now-1800000}:{}),...extra};
}
function selected(p,c){matching(p,c);p.stage='production';p.selected=c.maker.id;p.productionBusiness=c.maker.productionBusiness;p.offers=[offer(p,c,c.maker.id,'selected',{sent:c.now-3*DAY,expires:c.now-2*DAY})];}
function productionItem(p,c,index,status,version=1){
 const item={...blank(),status,version};
 if(status!=='none')Object.assign(item,{files:[c.file(deliveryNames[index],index===0?'zip':'mp4',version,{productionAttachment:true})],submittedAt:c.time(2)});
 if(['approved','revision'].includes(status))Object.assign(item,{opinion:status==='approved'?'交付内容与制作要求一致。':'请补充场景细节并统一人物表现后重新提交。',reviewedBy:p.producer,reviewedAt:c.time(1.5)});
 return item;
}
function production(p,c,statuses=['none','none','none']){
 selected(p,c);p.production=statuses.map((status,i)=>productionItem(p,c,i,status));
 const full=p.production[2];p.production.push(full.status==='approved'?{...clone(full),derivedFrom:2}:{...blank(),status:full.status==='none'?'none':full.status==='resubmit'?'resubmit':'waiting',derivedFrom:2});
 const pending=statuses.indexOf('pending'),unfinished=statuses.findIndex(x=>x!=='approved');p.step=pending!==-1?pending:unfinished===-1?3:unfinished;
 if(statuses.every(x=>x==='approved')){p.stage='release';p.film={...blank(),status:'pending',files:clone(p.production[3].files),version:p.production[3].version};}
}
function film(p,c,status='pending'){
 production(p,c,['approved','approved','approved']);
 p.film.status=status;
 if(['approved','revision'].includes(status))Object.assign(p.film,{opinion:status==='approved'?'成片安全审核通过。':'请修改第12集危险动作表现，修改版先交项目制片复审。',reviewedAt:c.time(1),reviewedBy:'宋家吉'});
 if(['revision','waiting'].includes(status)){
  const prior=clone(p.production[2]);p.production[2].previousResults=[prior];p.production[2].status='resubmit';p.production[2].recheckReason='正片安审退回，修改版需先重新通过制片终审，再进入安审。';p.production[3].status='resubmit';p.production[3].recheckReason=p.production[2].recheckReason;
  if(status==='waiting'){
   p.film.opinion='请修改第12集危险动作表现，修改版先交项目制片复审。';p.film.previousResults=[{...clone(p.film),status:'revision',reviewedBy:'宋家吉',reviewedAt:c.time(1)}];
   p.production[2]={...productionItem(p,c,2,'pending',2),previousResults:[prior,clone(p.production[2])]};p.production[3].status='waiting';p.stage='production';p.step=2;
  }
 }
}
function material(p,c,kind,status='approved',withDraft=false){
 const script=kind==='scriptMaterial',values=script?(p.source==='internal'?{}:{shortIntro:'街角工作室的故事',writerName:'演示编剧'+c.copy,provider:'原创测试剧本方'}):{company:c.maker.name,dramaType:'2D动态漫',episodes:60,directorName:'演示导演',producerName:'演示制作人'};
 const files=status==='none'?[]:[c.file(script?'剧本物料说明':'海报','pdf',1,script?{materialAttachment:true}:{materialAttachment:true,slot:'poster'})];
 const item={status,values:status==='none'?{}:values,files,version:['none','draft'].includes(status)?0:1,history:[]};
 if(!['none','draft'].includes(status))Object.assign(item,{submittedAt:c.time(2),submittedBy:script?p.source==='internal'?'总编示例':'剧本供应商':c.maker.name});
 if(['approved','revision'].includes(status))Object.assign(item,{opinion:status==='approved'?'物料信息与附件核验通过。':'请补充清晰的物料附件并核对资料一致性。',reviewedAt:c.time(1.5),reviewedBy:script?p.source==='internal'?'总编示例':p.business:p.producer});
 if(status==='approved')item.confirmedSnapshot=clone(item);
 if(status==='draft'||withDraft)item.draft={values:{...values,...(script?{shortIntro:'草稿中的新版简介'}:{directorName:'草稿导演名'})},files:[c.file(script?'补充物料草稿':'海报修改稿','pdf',2,script?{materialAttachment:true}:{materialAttachment:true,slot:'poster'})],version:status==='draft'?1:2,savedAt:c.at,savedBy:script?'剧本供应商':c.maker.name};
 if(status==='draft'){item.values=clone(item.draft.values);item.files=clone(item.draft.files);}
 p[kind]=item;
}
function contracts(p,c,{script=p.source==='external',production:maker=true}={}){p.contracts={};if(script&&p.source==='external')p.contracts.script=c.file('剧本合同','pdf');if(maker)p.contracts.production=c.file('制作合同','pdf');}
function releaseReady(p,c,internalSource=false){if(internalSource)internal(p,c);film(p,c,'approved');material(p,c,'scriptMaterial');material(p,c,'makerMaterial');contracts(p,c);p.stage='scheduling';}
function channelTask(p,c,status='preparing',channel='红果',extra={}){
 const task={channel,operator:channel==='抖音'?'channelOps2':'channelOps',status,material:status==='preparing'?'':`https://example.com/demo/${p.id}/${encodeURIComponent(channel)}/materials`,materialNote:'演示材料地址，不连接真实发行系统。',opinion:'',maker:p.selected,cooperationRound:p.previousCooperations.length,history:[]};
 if(['revision','confirm','resubmit'].includes(status))Object.assign(task,{opinion:'请调整第8集字幕并补充对应画面说明。',returnType:'content'});
 if(['confirm','resubmit'].includes(status))task.files=[c.file(channel+'内容修改','mp4',2,{productionAttachment:true})];
 if(status==='online')Object.assign(task,{actual:localInput(c.now-DAY/2),url:`https://example.com/demo/${p.id}/${encodeURIComponent(channel)}/online`});
 return {...task,...extra};
}
function scheduled(p,c,status='preparing',extra={}){releaseReady(p,c);p.schedule=localInput(c.now+DAY);p.channelTasks=[channelTask(p,c,status,'红果',extra)];if(status==='online')p.stage='online';}
function termination(p,c,roles=['business'],mode='rematch'){
 p.termination={mode,reason:mode==='rematch'?'双方档期不匹配，协商更换承制方。':'评估当前项目已无继续制作价值。',confirmations:[...roles],confirmationDetails:roles.map(role=>({role,userId:role==='business'?'prodBusiness':'manager',name:role==='business'?p.productionBusiness:'陈真',mode,opinion:mode==='rematch'?'同意更换承制方并保留既有合作记录。':'同意结束项目并保留已有资料。',at:c.at})),createdAt:c.at,createdBy:roles[0]==='manager'?'陈真':p.productionBusiness};
}
function archive(p,c){
 const t={...clone(p.termination),completedAt:c.at,completedBy:'陈真'};p.termination=t;
 p.previousCooperations.push({maker:p.selected,productionBusiness:p.productionBusiness,producer:p.producer,projectName:p.projectName||p.name,stage:p.stage,grade:p.grade,tags:clone(p.tags),offers:clone(p.offers),scriptCard:clone(p.card),scriptFull:clone(p.full),production:clone(p.production),film:clone(p.film),makerMaterial:clone(p.makerMaterial),productionContract:clone(p.contracts.production||null),contractHistory:clone(p.contractHistory.production||[]),termination:clone(t),schedule:p.schedule||null,channel:clone(p.channel),channelTasks:clone(p.channelTasks),archivedAt:c.at,archivedBy:'陈真'});
 delete p.schedule;p.channelTasks=[];p.channel={status:'none',opinion:'',file:null};
}
function rematch(p,c){
 scheduled(p,c,'submitted');termination(p,c,['business','manager']);archive(p,c);
 p.stage='matching';p.selected=null;p.production=deliveryNames.map(blank);p.production[3].derivedFrom=2;p.film=blank();p.step=0;p.makerMaterial=emptyMaterial();delete p.contracts.production;p.productionBusiness='';p.termination=null;
 p.offers=p.offers.map(x=>({...x,status:'withdrawn',withdrawnAt:c.now}));
}
function revisedScript(p,c){
 dual(p,c,'approved','revision');const prior={version:1,full:clone(p.full),quality:clone(p.quality),safety:clone(p.safety),info:Object.fromEntries(['name','deliveryDate','category','episodes','intro','writer','alternates'].map(k=>[k,clone(p[k])])),archivedAt:c.at,archivedBy:p.source==='internal'?'总编示例':'剧本供应商'};
 p.scriptVersions=[prior];p.full=c.file('修改后剧本全集','docx',2);p.quality={...review(c,'pending','内容',2),previousResults:clone(prior.quality.previousResults)};p.safety={...review(c,'pending','安全',2),previousResults:[clone(prior.safety)]};
}

add('script-pending','外部剧本双审待审','剧本评估',(p,c)=>dual(p,c));
add('script-internal','内部剧本双审待审','剧本评估',(p,c)=>{internal(p,c);dual(p,c);});
add('quality-approved','内容通过安审待审','剧本评估',(p,c)=>dual(p,c,'approved','pending'));
add('safety-approved','安审通过内容待审','剧本评估',(p,c)=>dual(p,c,'pending','approved'));
add('quality-revision','内容驳回安审待审','剧本评估',(p,c)=>dual(p,c,'revision','pending'));
add('quality-revision-safe','内容驳回安审通过','剧本评估',(p,c)=>dual(p,c,'revision','approved'));
add('safety-revision','安审驳回内容待审','剧本评估',(p,c)=>dual(p,c,'pending','revision'));
add('safety-reopens-quality','安审驳回内容待重审','剧本评估',(p,c)=>dual(p,c,'approved','revision'));
add('both-revision','双审均驳回','剧本评估',(p,c)=>dual(p,c,'revision','revision'));
add('quality-rejected','内容不通过已终止','剧本评估',(p,c)=>dual(p,c,'rejected','pending'));
add('safety-rejected','安审不通过已终止','剧本评估',(p,c)=>dual(p,c,'approved','rejected'));
add('script-resubmitted','外部修改版重新待审','剧本评估',revisedScript);
add('internal-resubmitted','内部修改版重新待审','剧本评估',(p,c)=>{internal(p,c);revisedScript(p,c);});
add('rating-external','外部双审通过待评级','剧本库',(p,c)=>dual(p,c,'approved','approved'));
add('rating-internal','内部双审通过待评级','剧本库',(p,c)=>{internal(p,c);dual(p,c,'approved','approved');});
add('legacy-producer-missing','历史评级待补制片','剧本库',(p,c)=>{matching(p,c);p.producer='';delete p.rating;p.demoScenario.compatibility='历史存量缺少制片；当前新评级仍要求同时选择制片。';});
add('matching-idle','已评级待匹配承制方','剧本库',matching);
add('matching-card-missing','内部选本一卡待补','剧本库',(p,c)=>{internal(p,c);matching(p,c);p.card=null;});
add('offer-pending','单家推送待反馈','承制匹配',(p,c)=>{matching(p,c);p.offers=[offer(p,c,c.maker.id)];});
add('offer-multiple','多家推送待反馈','承制匹配',(p,c)=>{matching(p,c);p.offers=c.s.suppliers.filter(x=>x.roles?.includes('maker')&&x.status==='active').map(x=>offer(p,c,x.id));});
add('offer-auto','B级全部匹配方待反馈','承制匹配',(p,c)=>{matching(p,c);p.grade='B';p.tags=['都市'];p.offers=c.s.suppliers.filter(x=>x.roles?.includes('maker')&&x.status==='active'&&x.tags.some(t=>p.tags.includes(t))).map(x=>offer(p,c,x.id));});
add('offer-selected-locked','首家选中其他置灰','承制匹配',(p,c)=>{selected(p,c);p.offers=c.s.suppliers.filter(x=>x.roles?.includes('maker')&&x.status==='active').map(x=>offer(p,c,x.id,x.id===p.selected?'selected':'locked'));});
add('offer-declined','承制方未选中','承制匹配',(p,c)=>{matching(p,c);p.offers=[offer(p,c,c.maker.id,'declined')];});
add('offer-expired','24小时超时待人工改推','承制匹配',(p,c)=>{matching(p,c);p.offers=[offer(p,c,c.maker.id,'expired')];});
add('offer-withdrawn','已撤回待重新匹配','承制匹配',(p,c)=>{matching(p,c);p.offers=[offer(p,c,c.maker.id,'withdrawn')];});
add('offer-repushed','收回后人工重新推送','承制匹配',(p,c)=>{matching(p,c);p.offers=[offer(p,c,c.maker.id,'expired'),offer(p,c,c.maker.id)];});
add('production-none','三项制作均待提交','制作审核',(p,c)=>production(p,c));
add('production-pending','三项制作同时待审核','制作审核',(p,c)=>production(p,c,['pending','pending','pending']));
add('production-revision','三项制作分别驳回','制作审核',(p,c)=>production(p,c,['revision','revision','revision']));
add('production-approved','三项全部通过进入安审','制作审核',(p,c)=>production(p,c,['approved','approved','approved']));
for(const [index,label]of ['人物资产','一卡demo','全集初稿'].entries())add('production-'+index+'-pending',label+'单项待审核','制作审核',(p,c)=>production(p,c,[0,1,2].map(i=>i===index?'pending':'none')));
for(const [index,label]of ['人物资产','一卡demo','全集初稿'].entries())add('production-'+index+'-revision',label+'退回其他已通过','制作审核',(p,c)=>production(p,c,[0,1,2].map(i=>i===index?'revision':'approved')));
for(const [index,label]of ['人物资产','一卡demo','全集初稿'].entries())add('production-'+index+'-approved',label+'已通过其他待提交','制作审核',(p,c)=>production(p,c,[0,1,2].map(i=>i===index?'approved':'none')));
add('production-mixed','通过待审驳回并行','制作审核',(p,c)=>production(p,c,['approved','pending','revision']));
add('film-pending','全集终版待安全审核','正片安审',(p,c)=>film(p,c));
add('film-revision','正片安审驳回待修改','正片安审',(p,c)=>film(p,c,'revision'));
add('film-producer-recheck','正片修改版待制片复审','正片安审',(p,c)=>film(p,c,'waiting'));
add('film-approved','正片安审通过待齐资料','正片安审',(p,c)=>film(p,c,'approved'));
add('film-second-pending','制片复审通过再次安审','正片安审',(p,c)=>{film(p,c,'revision');const previous=clone(p.film);p.production[2]=productionItem(p,c,2,'approved',2);p.production[3]={...clone(p.production[2]),derivedFrom:2};p.film={...blank(),status:'pending',version:2,files:clone(p.production[3].files),previousResults:[previous]};});
for(const [kind,label]of [['scriptMaterial','剧本物料'],['makerMaterial','制作物料']]){
 for(const [status,suffix]of [['none','待上传'],['draft','草稿'],['pending','待核验'],['revision','待修改'],['approved','已确认']])add(kind+'-'+status,label+suffix,'物料准备',(p,c)=>{production(p,c);material(p,c,kind,status);});
 add(kind+'-approved-draft',label+'已确认另有草稿','物料准备',(p,c)=>{production(p,c);material(p,c,kind,'approved',true);});
}
add('internal-material-pending','内部剧本物料待总编核验','物料准备',(p,c)=>{internal(p,c);production(p,c);material(p,c,'scriptMaterial','pending');});
for(const [kind,label]of [['scriptMaterial','剧本物料'],['makerMaterial','制作物料']])add(kind+'-second-version',label+'新版待核验旧版留存','物料准备',(p,c)=>{production(p,c);material(p,c,kind,'approved');const old=clone(p[kind]);material(p,c,kind,'pending');p[kind].version=2;p[kind].files=p[kind].files.map(x=>({...x,version:2}));p[kind].history=[old];p[kind].confirmedSnapshot=clone(old.confirmedSnapshot);});
add('contracts-both-missing','外部两类合同均待留档','合同留档',(p,c)=>{releaseReady(p,c);p.contracts={};p.stage='release';});
add('contract-script-missing','外部剧本合同待留档','合同留档',(p,c)=>{releaseReady(p,c);delete p.contracts.script;p.stage='release';});
add('contract-maker-missing','外部制作合同待留档','合同留档',(p,c)=>{releaseReady(p,c);delete p.contracts.production;p.stage='release';});
add('contracts-complete','合同已留档等待正片安审','合同留档',(p,c)=>{releaseReady(p,c);p.stage='release';p.film={...blank(),status:'pending',files:clone(p.production[3].files)};});
add('internal-contract-missing','内部仅制作合同待留档','合同留档',(p,c)=>{releaseReady(p,c,true);delete p.contracts.production;p.stage='release';});
add('internal-contract-complete','内部制作合同齐全待排期','合同留档',(p,c)=>releaseReady(p,c,true));
add('schedule-pending','排播条件齐全待排期','排播渠道',releaseReady);
add('schedule-created','已排期各渠道准备材料','排播渠道',(p,c)=>{scheduled(p,c);p.channelTasks.push(channelTask(p,c,'preparing','抖音'));});
add('channel-unassigned','渠道任务待分配运营','排播渠道',(p,c)=>scheduled(p,c,'preparing',{operator:''}));
add('channel-preparing','渠道上剧材料待准备','排播渠道',(p,c)=>scheduled(p,c));
add('channel-ready','渠道材料齐全待送审','排播渠道',(p,c)=>scheduled(p,c,'preparing',{material:`https://example.com/demo/${p.id}/materials`}));
add('channel-submitted','渠道审核中待登记反馈','排播渠道',(p,c)=>scheduled(p,c,'submitted'));
add('channel-content-revision','渠道内容退回待修改','排播渠道',(p,c)=>scheduled(p,c,'revision'));
add('channel-material-revision','渠道资料退回待补充','排播渠道',(p,c)=>scheduled(p,c,'resubmit',{returnType:'material',needsMaterials:true,files:[],opinion:'请补充本渠道需要的盖章授权说明。'}));
add('channel-confirm','渠道修改待制片确认','排播渠道',(p,c)=>scheduled(p,c,'confirm'));
add('channel-resubmit','渠道修改已确认待重送','排播渠道',(p,c)=>scheduled(p,c,'resubmit'));
add('channel-online','单渠道已上线待拉取','排播渠道',(p,c)=>scheduled(p,c,'online'));
add('channel-partial-online','多渠道部分上线','排播渠道',(p,c)=>{scheduled(p,c,'online');p.channelTasks.push(channelTask(p,c,'submitted','抖音'));});
add('channel-all-online','多渠道均上线已同步','排播渠道',(p,c)=>{scheduled(p,c,'online');p.channelTasks.push(channelTask(p,c,'online','抖音'));p.channelTasks.forEach(t=>t.syncedAt=c.at+'（演示）');});
add('termination-not-started','合作异常待发起共同确认','合作异常',(p,c)=>production(p,c,['approved','revision','none']));
add('termination-business','商务已确认待陈真确认','合作异常',(p,c)=>{production(p,c,['approved','revision','none']);termination(p,c,['business']);});
add('termination-manager','陈真已确认待商务确认','合作异常',(p,c)=>{production(p,c,['approved','revision','none']);termination(p,c,['manager']);});
add('termination-rematch-ready','双方同意重配待解锁','合作异常',(p,c)=>{production(p,c,['approved','revision','none']);termination(p,c,['business','manager']);});
add('termination-end-ready','双方同意终止待结束','合作异常',(p,c)=>{production(p,c,['approved','revision','none']);termination(p,c,['business','manager'],'end');});
add('termination-ended','合作已终止资料已归档','合作异常',(p,c)=>{production(p,c,['approved','revision','none']);material(p,c,'makerMaterial','approved');contracts(p,c);termination(p,c,['business','manager'],'end');archive(p,c);p.stage='ended';});
add('rematch-history','已解锁待重配保留历史','合作异常',rematch);
add('rematch-selected','新承制方开工旧合作归档','合作异常',(p,c)=>{rematch(p,c);const next=c.s.suppliers.find(x=>x.roles?.includes('maker')&&x.id!==c.maker.id&&x.status==='active');p.selected=next.id;p.productionBusiness=next.productionBusiness;p.stage='production';p.offers.push(offer(p,c,next.id,'selected'));});

export const matchingScenarioCatalog=definitions.map(({id,key,label,group})=>Object.freeze({id,key,label,group,copies:2}));

// Never overwrite an existing example: a reviewer may already have advanced it.
export function appendMatchingScenarios(s){
 if(!Array.isArray(s.projects)||!Array.isArray(s.suppliers)||!Array.isArray(s.users))throw Error('请先规范化剧汇示例账号与项目数据。');
 const present=new Set(s.projects.flatMap(p=>[p.id,p.sceneId]).filter(Boolean));
 const now=Date.now()+(Number(s.clockOffset)||0);
 for(const scene of definitions)for(const copy of [1,2]){
  const id=`DEMO-M-${scene.id}-${copy}`,sceneId=`${PREFIX}${scene.id}:${copy}`;
  if(present.has(id)||present.has(sceneId))continue;
  const {p,c}=fixture(s,scene,copy,now);scene.build(p,c);
  const makerId=scene.key==='offer-selected-locked'?p.offers.find(x=>x.status==='locked')?.supplier:p.selected||p.offers[0]?.supplier;
  if(makerId)p.demoScenario.makerId=makerId;
  p.history.unshift({at:c.at,actor:'演示数据',text:`${scene.group} · ${scene.label} · 第${copy}条，所有附件均为原创测试占位。`});
  s.projects.push(p);present.add(id);present.add(sceneId);
 }
 return s;
}
