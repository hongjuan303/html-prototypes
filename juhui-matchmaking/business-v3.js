import * as A from './access-v3.js?v=20261109-channels';
export const distStages={evaluation:'内容评估',revision:'评估待修改',delivery:'待提交正片与物料',film:'正片安审',materials:'物料确认',business:'商务留档',scheduling:'待排期 / 渠道发行',online:'已上线'};
const record=(status='none')=>({status,opinion:''});
export function init(s){
 A.init(s);
 if(!s.distribution){
  const make=(id,name,stage,extra={})=>({id,name,supplier:'s1',business:'张桂铭',episodes:60,stage,preview:'https://example.com/demo-preview',quality:record('approved'),groups:{groupA:record('approved'),groupB:record('approved'),groupC:record('approved')},film:record('approved'),material:record('approved'),filmAssignee:'film',materialAssignee:'distMaterial',materials:'示例：海报、简介、演员资料、版权证明等全量物料',delivery:'示例：60集正片文件',contract:null,history:[],channelTasks:[],...extra});
  s.distribution=[make('DF110401','此心向月','evaluation',{quality:record('pending'),groups:{groupA:record('none'),groupB:record('none'),groupC:record('none')},film:record(),material:record(),materials:'',delivery:''}),make('DF110402','时光有回声','film',{film:record('pending'),material:record('waiting')}),make('DF110403','微光向暖','materials',{material:record('pending')}),make('DF110404','拾光与你','business'),make('DF110405','风起长街','scheduling',{contract:{name:'风起长街_合同授权.pdf',demo:true}})];
 }
 for(const p of [...s.projects,...s.distribution]){
  p.channelTasks??=[];
  const matching=s.projects.includes(p);
  if(p.schedule&&!p.channelTasks.length&&['scheduling','online'].includes(p.stage)&&(!matching||p.selected)&&!p.previousCooperations?.length&&!p.legacyReleaseArchives?.length){const channel=A.permissionRecords(s).some(g=>g.business===(matching?'matching':'distribution')&&(g.channels||[]).includes('红果'))?'红果':'字节系（红果和抖音）';const operator=s.users.find(u=>A.roleChannels(s,u,matching?'matching':'distribution','channelOps').includes(channel))?.id||'';p.channelTasks.push({channel,operator,status:({approved:'online',pending:'submitted',revision:'revision',confirm:'confirm',resubmit:'resubmit'})[p.channel?.status]||'preparing',material:'',materialNote:'',opinion:p.channel?.opinion||'',legacy:true});}
 }
 return s;
}
const ensure=(v,m)=>{if(!v)throw Error(m);};
export const log=(s,p,text)=>{p.history.unshift({at:new Date().toLocaleString('zh-CN'),actor:s.ui.system==='platform'?A.current(s)?.name:s.suppliers.find(x=>x.id===s.ui.supplier)?.name,text});};
export function channelVisible(s,p){return (p.channelTasks||[]).filter(t=>s.ui.system==='supplier'||A.isAdmin(s)||A.getRoles(s).some(r=>!['channelLead','channelOps'].includes(r)&&A.relevant(s,p,r))||channelCan(s,t,'channelLead')||channelCan(s,t,'channelOps'));}
export function channelCan(s,t,role){return !!t&&(A.isAdmin(s)||A.has(s,role)&&A.roleChannels(s,A.current(s),s.ui.business,role).includes(t.channel)&&(role==='channelLead'||t.operator===s.ui.user));}
export const channelProjectActive=(s,p)=>!!p&&['scheduling','online'].includes(p.stage)&&(s.ui.business!=='matching'||!!p.selected);
export function channelAction(s,p,action,v){
 ensure(A.visible(s,p),'当前账号无权查看此项目');
 ensure(channelProjectActive(s,p),'当前项目尚未进入发行或合作已结束，不可操作旧渠道任务');
 if(action==='release-schedule'){
  ensure(A.canFor(s,p,'schedule')&&['scheduling','online'].includes(p.stage),'当前不可设置排期');ensure(v.date&&Array.isArray(v.channels)&&(v.channels.length||p.channelTasks.length),'请设置排期并选择至少一个渠道');
  ensure(v.channels.every(channel=>A.channels.includes(channel)),'无效渠道');
  p.schedule=v.date;
  for(const channel of v.channels){ensure(A.channels.includes(channel),'无效渠道');if(!p.channelTasks.some(t=>t.channel===channel)){const ops=s.users.find(u=>u[s.ui.business].roles.includes('channelOps')&&A.roleChannels(s,u,s.ui.business,'channelOps').includes(channel));p.channelTasks.push({channel,operator:ops?.id||'',status:'preparing',material:'',materialNote:'',opinion:'',...(s.ui.business==='matching'?{maker:p.selected,cooperationRound:(p.previousCooperations?.length||0)+(p.previousProduction?.length||0)}:{})});}}
  log(s,p,'设置排期并创建渠道任务；各渠道独立准备上剧材料');return;
 }
 const t=p.channelTasks.find(t=>t.channel===v.channel);ensure(t,'未找到渠道任务');
 ensure(s.ui.business!=='matching'||(!t.maker||t.maker===p.selected)&&(t.cooperationRound===undefined||t.cooperationRound===(p.previousCooperations?.length||0)+(p.previousProduction?.length||0)),'该渠道任务属于已结束的合作，不可继续操作');
 const {history=[],...prior}=structuredClone(t);
 const operator=channelCan(s,t,'channelOps'),lead=channelCan(s,t,'channelLead'),producer=A.canFor(s,p,'producer'),maker=s.ui.business==='matching'&&s.ui.system==='supplier'&&s.ui.identity==='maker'&&p.selected===s.ui.supplier;
 if(action==='channel-assign'){ensure(lead,'仅关联渠道负责人可分配运营');ensure(s.users.some(u=>u.id===v.operator&&u[s.ui.business].roles.includes('channelOps')&&A.roleChannels(s,u,s.ui.business,'channelOps').includes(t.channel)),'请选择具有本业务及本渠道权限的运营');t.operator=v.operator;}
 else if(action==='channel-material'){ensure(operator,'仅本渠道对应运营可准备材料');ensure(['preparing','resubmit','revision'].includes(t.status),'当前渠道状态不可修改上剧资料');ensure(v.material?.trim(),'请填写上剧材料地址');ensure(/^https?:\/\//i.test(v.material),'材料地址需以 http:// 或 https:// 开头');t.material=v.material.trim();t.materialNote=v.materialNote||'';t.needsMaterials=false;}
 else if(action==='channel-submit'){ensure(operator&&['preparing','resubmit'].includes(t.status),'当前不可送审');ensure(t.material&&p.schedule&&!t.needsMaterials,'请先完成本渠道上剧材料及排期');t.status='submitted';}
 else if(action==='channel-return'){ensure(operator&&t.status==='submitted','当前不可登记退回');ensure(v.opinion?.trim(),'请填写渠道退回意见');t.status='revision';t.opinion=v.opinion;t.returnType=v.returnType||'content';if(t.returnType==='material'){t.status='resubmit';t.needsMaterials=true;}}
 else if(action==='channel-fix'){ensure(t.status==='revision'&&(s.ui.business==='matching'?(maker||producer):s.ui.system==='supplier'&&p.supplier===s.ui.supplier),'当前不可提交内容修改');ensure(v.files?.length,'请上传修改文件');t.files=v.files;t.status=s.ui.business==='matching'?'confirm':'resubmit';}
 else if(action==='channel-confirm'){ensure(s.ui.business==='matching'&&producer&&t.status==='confirm','仅项目制片可确认修改');t.status='resubmit';}
 else if(action==='channel-online'){ensure(operator&&t.status==='submitted','请先完成渠道送审');ensure(v.actual&&v.url&&/^https?:\/\//i.test(v.url),'请填写实际上线时间与有效链接');t.status='online';t.actual=v.actual;t.url=v.url;p.stage='online';}
 else throw Error('未知渠道操作');
 t.history=[...history,{...prior,archivedAt:new Date().toLocaleString('zh-CN'),action,actor:s.ui.system==='platform'?A.current(s)?.name:s.suppliers.find(x=>x.id===s.ui.supplier)?.name}];
 log(s,p,t.channel+'：'+({'channel-assign':'分配运营','channel-material':'保存上剧材料','channel-submit':'提交渠道审核','channel-return':'登记渠道退回','channel-fix':'提交内容修改','channel-confirm':'制片确认渠道修改','channel-online':'登记实际上线结果'}[action]));
}
export function distVisible(s){return s.distribution.filter(p=>A.visible(s,p,'distribution'));}
export function distAction(s,p,action,v){
 ensure(s.ui.business==='distribution','请切换代发行业务');
 const supplier=s.ui.system==='supplier'&&s.suppliers.find(x=>x.id===s.ui.supplier)?.businesses.includes('distribution');
 if(action==='dist-new'){
  ensure(supplier,'仅版权方可提交内容');ensure(v.name?.trim()&&v.preview&&/^https?:\/\//.test(v.preview),'请填写内容名称与试看链接');
  const sp=s.suppliers.find(x=>x.id===s.ui.supplier);ensure(sp.status!=='frozen'&&sp.distributionBusiness,'供应商未启用或未配置代发行商务');
  p={id:'DF'+Date.now(),name:v.name.trim(),episodes:Number(v.episodes)||60,supplier:sp.id,business:sp.distributionBusiness,preview:v.preview,stage:'evaluation',quality:record('pending'),groups:{groupA:record(),groupB:record(),groupC:record()},film:record(),material:record(),filmAssignee:A.options(s,'distribution','film')[0]?.[0]||'',materialAssignee:A.options(s,'distribution','material')[0]?.[0]||'',materials:'',delivery:'',contract:null,history:[],channelTasks:[]};s.distribution.unshift(p);log(s,p,'版权方提交内容评估');return p;
 }
 ensure(p&&A.visible(s,p),'无权处理此代发行项目');
 const own=supplier&&p.supplier===s.ui.supplier;
 if(action==='dist-evaluate'){
  const key=v.key;ensure(['quality','groupA','groupB','groupC'].includes(key)&&A.canFor(s,p,key)&&p.stage==='evaluation','当前无权处理内容评估');
  const target=key==='quality'?p.quality:p.groups[key];ensure(target.status==='pending','此项不在待评估状态');ensure(['approved','revision'].includes(v.result),'无效评估结果');ensure(v.result==='approved'||v.opinion?.trim(),'退回意见必填');Object.assign(target,{status:v.result,opinion:v.opinion});
  if(v.result==='revision')p.stage='revision';else if(key==='quality')Object.values(p.groups).forEach(x=>x.status='pending');else if(Object.values(p.groups).every(x=>x.status==='approved'))p.stage='delivery';
 }else if(action==='dist-resubmit'){
  ensure(own&&p.stage==='revision','当前不可重提');ensure(/^https?:\/\//.test(v.preview),'请填写有效试看地址');p.preview=v.preview;p.stage='evaluation';p.quality=record('pending');Object.keys(p.groups).forEach(k=>p.groups[k]=record());
 }else if(action==='dist-delivery'){
  ensure(own&&['delivery','film','materials'].includes(p.stage),'当前不可补交资料');ensure(['delivery'].includes(p.stage)||p.film.status==='revision'||p.material.status==='revision','请等待审核结果');
  ensure(v.delivery?.trim()&&v.materials?.trim(),'请同时填写正片与全量物料资料');
  const delivery=v.delivery.trim(),materials=v.materials.trim(),changed=delivery!==(p.delivery||'').trim(),materialOnly=p.stage==='materials'&&p.material.status==='revision'&&!changed;
  if(p.delivery)(p.deliveryHistory??=[]).push({version:p.deliveryVersion||1,materialsVersion:p.materialsVersion||1,delivery:p.delivery,materials:p.materials,film:structuredClone(p.film),material:structuredClone(p.material),archivedAt:new Date().toLocaleString('zh-CN'),archivedBy:s.suppliers.find(x=>x.id===s.ui.supplier)?.name});
  p.deliveryVersion=(p.deliveryVersion||(p.delivery?1:0))+(changed?1:0);p.materialsVersion=(p.materialsVersion||(p.materials?1:0))+(materials!==(p.materials||'').trim()?1:0);p.delivery=delivery;p.materials=materials;
  if(materialOnly)p.material={...record('pending'),version:p.materialsVersion};
  else{p.stage='film';p.film={...record('pending'),version:p.deliveryVersion};p.material={...record('waiting'),version:p.materialsVersion};}
 }else if(action==='dist-review'){
  const key=v.key;ensure(['film','material'].includes(key)&&A.canFor(s,p,key),'无权处理该审核');ensure((key==='film'?p.stage==='film':p.stage==='materials')&&p[key].status==='pending','当前无待审任务');ensure(['approved','revision'].includes(v.result),'无效审核结果');ensure(v.result==='approved'||v.opinion?.trim(),'退回意见必填');Object.assign(p[key],{status:v.result,opinion:v.opinion||'',reviewedBy:A.current(s)?.name,reviewedAt:new Date().toLocaleString('zh-CN'),version:key==='film'?(p.deliveryVersion||1):(p.materialsVersion||1)});
  if(v.result==='approved'){if(key==='film'){p.stage='materials';p.material.status='pending';}else p.stage='business';}
 }else if(action==='dist-assign'){
  const key=v.key;ensure(['film','material','business'].includes(key),'分配类型无效');ensure(A.has(s,key==='film'?'filmLead':key==='material'?'materialLead':'businessLead'),'仅对应负责人可分配');ensure(A.options(s,'distribution',key).some(([id])=>id===v.assignee),'请选择已授权人员');p[key==='business'?'business':key+'Assignee']=key==='business'?s.users.find(x=>x.id===v.assignee).name:v.assignee;
 }else if(action==='dist-contract'){
  ensure(A.canFor(s,p,'business','businessLead')&&p.stage==='business','仅对应商务可留档');ensure(v.file,'请选择已签合同或授权文件');ensure(/\.(doc|docx|pdf)$/i.test(v.file.name),'请上传Word或PDF留档文件');p.contract=v.file;p.contractFiles=v.files||[v.file];p.stage='scheduling';
 }else throw Error('未知代发行操作');
 log(s,p,{'dist-evaluate':'内容评估：'+(v.key||''),'dist-resubmit':'修改后重新提交内容评估','dist-delivery':'版权方提交正片及全量物料','dist-review':'处理'+(v.key==='film'?'正片安审':'物料确认'),'dist-assign':'调整项目负责人','dist-contract':'已签合同 / 授权文件留档，进入排播'}[action]);return p;
}
