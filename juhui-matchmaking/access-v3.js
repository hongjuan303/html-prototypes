export const lines={matching:'撮合业务',distribution:'代发行业务'};
export const channels=['红果','抖音','番茄'];
// Menus describe work; roles determine actions and related records.
export const definitions={
 matching:{businessLead:['撮合商务负责人',['intake','library','projects'],'撮合商务项目统筹查看'],business:['剧本商务',['intake','library','projects'],'本人对接的剧本'],prodBusiness:['承制商务',['projects'],'本人对接的承制项目'],content:['剧本评估',['intake'],'内容组待办'],safetyLead:['剧本安审负责人',['intake'],'剧本安审分配'],safety:['剧本安审',['intake'],'本人安审任务'],editor:['总编 / 项目负责人',['intake','library','projects'],'评级并分配制片、内部本及撮合项目名称维护'],dispatcher:['剧本评级',['library'],'评级、题材与项目制片的统一维护'],producer:['项目制片',['library','projects'],'本人负责剧本的承制匹配及项目执行、名称维护'],manager:['承制合作终止',['projects'],'制作阶段的承制合作终止'],filmLead:['正片安审负责人',['projects'],'正片安审分配'],film:['正片安审人员',['projects'],'本人正片任务'],schedule:['排播上线负责人',['projects'],'满足排播条件的项目'],channelLead:['渠道负责人',['projects'],'关联渠道任务'],channelOps:['渠道运营',['projects'],'本人负责的渠道任务']},
 distribution:{quality:['内容质量评估',['dist-evaluation'],'内容初评待办'],groupA:['审核组评估',['dist-evaluation'],'审核组评估待办'],groupB:['红果评估',['dist-evaluation'],'红果评估待办'],groupC:['运营评估',['dist-evaluation'],'运营评估待办'],filmLead:['正片审核负责人',['dist-projects'],'正片分配'],film:['正片审核人员',['dist-projects'],'本人正片任务'],materialLead:['物料审核负责人',['dist-projects'],'物料分配'],material:['物料审核人员',['dist-projects'],'本人物料任务'],businessLead:['商务负责人',['dist-projects'],'全量商务项目及改派'],business:['商务',['dist-projects'],'本人对接项目'],schedule:['排播上线负责人',['dist-projects'],'待排期项目'],channelLead:['渠道负责人',['dist-projects','dist-data'],'关联渠道任务'],channelOps:['渠道运营',['dist-projects','dist-data'],'本人负责的渠道任务']}
};
const grant=(roles=[],chs=[])=>({roles,channels:chs});
const user=(id,name,m=[],d=[],chs=[])=>({id,name,account:id,admin:false,matching:grant(m,chs),distribution:grant(d,chs)});
export function usersSeed(){return [
 {...user('admin','管理员'),admin:true},user('matchingLead','徐德智',['businessLead']),user('business','张桂铭',['business'],['business']),user('business2','黄娇娇',['business']),user('prodBusiness','林婷婷',['prodBusiness']),user('prodBusiness2','吴俊谊',['prodBusiness']),
 user('content','刘雪莲',['content','dispatcher']),user('content2','何晓玲',['content']),user('content3','汪禹',['content']),user('safety','胡昊言',['safetyLead','filmLead'],['filmLead']),user('safety2','李犇犇',['safety']),user('editor','总编示例',['editor']),user('manager','陈真',['manager','dispatcher','producer']),user('producer','尹伟',['producer']),user('producer2','李涵',['producer']),user('producer3','陈辛欣',['producer']),user('film','宋家吉',['film'],['film']),user('film2','凌苏徽',['film'],['film']),user('schedule','排播示例',['schedule'],['schedule']),user('channelLead','渠道负责人示例',['channelLead'],['channelLead'],channels),user('channelOps','红果运营示例',['channelOps'],['channelOps'],['红果']),user('channelOps2','抖音运营示例',['channelOps'],['channelOps'],['抖音']),
 user('distQuality','质量评估示例',[],['quality']),user('distA','审核组示例',[],['groupA']),user('distB','红果评估示例',[],['groupB']),user('distC','运营评估示例',[],['groupC']),user('distMaterialLead','物料负责人示例',[],['materialLead']),user('distMaterial','物料审核示例',[],['material']),user('distBusinessLead','商务负责人示例',[],['businessLead']),user('unassigned','待授权示例')
 ];}
export function init(s){
 s.users??=usersSeed();s.ui.business??='matching';s.ui.user??=({ops:'schedule',dispatcher:'content'}[s.ui.role]||s.ui.role||'admin');
 if(!s.users.some(x=>x.id===s.ui.user))s.ui.user='admin';
 permissionRecords(s);projectPermissions(s);
 for(const x of s.suppliers){x.businesses??=['matching'];x.distributionBusiness??='';}
 if(!s.architectureVersion){const first=s.suppliers.find(x=>x.id==='s1');if(first){first.businesses=[...new Set([...first.businesses,'distribution'])];first.distributionBusiness||='张桂铭';}s.architectureVersion=1;}
 for(const p of s.projects){p.safetyAssignee??='safety2';p.filmAssignee??='film';}
 return s;
}
export const current=s=>s.users.find(x=>x.id===s.ui.user);
export const isAdmin=s=>s.ui.system==='platform'&&permissionRecords(s).some(g=>g.userId===s.ui.user&&g.business==='shared'&&g.role==='admin');
export const getRoles=(s,line=s.ui.business)=>permissionRecords(s).filter(g=>g.userId===s.ui.user&&g.business===line).map(g=>g.role);
export const label=(key,line)=>definitions[line]?.[key]?.[0]||key;
// Prototype administrator can exercise every platform role without changing assignments.
export function has(s,...rs){return s.ui.system==='platform'&&(isAdmin(s)||rs.some(r=>getRoles(s).includes(r)));}
// Internal submissions retain their business and stage requirements.
export const canCreateInternal=s=>s.ui.business==='matching'&&has(s,'admin','editor');
export function available(s){return s.ui.system==='platform'?Object.keys(lines).filter(k=>isAdmin(s)||getRoles(s,k).length):Object.keys(lines).filter(k=>s.suppliers.find(x=>x.id===s.ui.supplier)?.businesses?.includes(k));}
export function menus(s){
 if(s.ui.system==='supplier'){const sp=s.suppliers.find(x=>x.id===s.ui.supplier);if(!sp?.businesses?.includes(s.ui.business))return [];return s.ui.business==='distribution'?['dist-evaluation','dist-projects']:sp.roles?.includes(s.ui.identity)?['content','intake']:[];}
 if(isAdmin(s))return [...(s.ui.business==='matching'?['intake','library','projects']:['dist-evaluation','dist-projects','dist-data']),'permissions','suppliers'];
 const granted=new Set(getRoles(s).flatMap(r=>definitions[s.ui.business]?.[r]?.[1]||[]));
 return (s.ui.business==='matching'?['intake','library','projects']:['dist-evaluation','dist-projects','dist-data']).filter(id=>granted.has(id));
}
export function relevant(s,p,r){
 const u=current(s);if(!u)return false;
 if(s.ui.business==='distribution'){
  if(r==='business')return p.business===u.name;
  if(r==='film')return p.filmAssignee===u.id;
  if(r==='material')return p.materialAssignee===u.id;
  if(['quality','groupA','groupB','groupC'].includes(r))return ['evaluation','revision'].includes(p.stage);
 }else{
  if(r==='business')return p.scriptBusinessId?p.scriptBusinessId===u.id:p.business===u.name;
  if(r==='prodBusiness')return !!p.selected&&p.productionBusiness===u.name;
  if(r==='producer')return p.producer===u.name;
  const terminatedReview=p.stage==='ended'&&!p.grade&&[p.intake,p.quality,p.safety].some(x=>x?.status==='rejected');
  if(r==='safetyLead')return ['review','rating'].includes(p.stage)||terminatedReview;
  if(r==='safety')return p.safetyAssignee===u.id&&(['review','rating'].includes(p.stage)||terminatedReview);
  if(r==='film')return p.filmAssignee===u.id;
  if(r==='dispatcher')return ['rating','matching'].includes(p.stage)||!!p.grade;
  if(r==='manager')return !!p.selected;
  if(r==='content')return ['review','rating'].includes(p.stage)||terminatedReview;
 }
 if(r==='filmLead')return ['release','delivery','production','materials'].includes(p.stage);
 if(r==='schedule')return ['scheduling','online'].includes(p.stage);
 if(['channelLead','channelOps'].includes(r))return (p.channelTasks||[]).some(t=>roleChannels(s,u,s.ui.business,r).includes(t.channel)&&(r==='channelLead'||t.operator===u.id));
 return true;
}
export function canFor(s,p,...rs){return has(s,...rs)&&(isAdmin(s)||!p||rs.some(r=>getRoles(s).includes(r)&&relevant(s,p,r)));}
export function visible(s,p,line=s.ui.business){
 if(line!==s.ui.business)return false;
 if(s.ui.system==='supplier'){
  const supplier=s.suppliers.find(x=>x.id===s.ui.supplier);if(supplier?.status==='frozen'||!supplier?.businesses.includes(line))return false;
  if(line==='matching'&&!supplier.roles?.includes(s.ui.identity))return false;
  return line==='distribution'?p.supplier===s.ui.supplier:s.ui.identity==='script'?p.supplier===s.ui.supplier:p.selected===s.ui.supplier||p.offers.some(o=>o.supplier===s.ui.supplier);
 }
 return isAdmin(s)||getRoles(s).some(r=>relevant(s,p,r));
}
export const options=(s,line,role)=>s.users.filter(u=>!u.admin&&u[line]?.roles.includes(role)).map(u=>[u.id,u.name]);
const channelRoles=['channelLead','channelOps'];
const aliasRoles=['business','prodBusiness'];
const ensure=(condition,message)=>{if(!condition)throw Error(message);};

// Migrate the prototype's already-scoped grants once. Do not reinterpret its
// matching grants as legacy production grants or copy grants to another line.
export function permissionRecords(s){
 if(!Array.isArray(s.permissionRecords)){
  s.users??=usersSeed();const records=[];
  for(const u of s.users){
   if(u.admin)records.push({id:'permission-'+encodeURIComponent(u.id)+'-shared-admin',userId:u.id,business:'shared',role:'admin',channels:[],alias:'',createdAt:''});
   for(const business of Object.keys(lines))for(const role of new Set(u[business]?.roles||[])){
    records.push({id:'permission-'+encodeURIComponent(u.id)+'-'+business+'-'+role,userId:u.id,business,role,channels:channelRoles.includes(role)?[...new Set(u[business]?.channels||[])]:[],alias:aliasRoles.includes(role)?u.alias||'':'',createdAt:''});
   }
  }
  s.permissionRecords=records;s.permissionRecordVersion=1;
 }
 return s.permissionRecords;
}

// User objects remain a compatibility projection for existing selectors.
// Channels in this projection must never be used to authorize an operation.
function projectPermissions(s){
 for(const u of s.users){
  const records=s.permissionRecords.filter(g=>g.userId===u.id);
  u.admin=records.some(g=>g.business==='shared'&&g.role==='admin');
  for(const business of Object.keys(lines)){
   const scoped=records.filter(g=>g.business===business);
   u[business]={roles:scoped.map(g=>g.role),channels:[...new Set(scoped.flatMap(g=>g.channels||[]))]};
  }
  // Aliases belong to one grant; new consumers use roleAlias().
  if(Object.hasOwn(u,'alias'))u.legacyAlias??=u.alias;
  delete u.alias;
 }
}
export function roleChannels(s,userOrId,business,role){
 const userId=typeof userOrId==='string'?userOrId:userOrId?.id;
 return [...(permissionRecords(s).find(g=>g.userId===userId&&g.business===business&&g.role===role)?.channels||[])];
}
export function roleAlias(s,userOrId,business,role){
 const userId=typeof userOrId==='string'?userOrId:userOrId?.id;
 return permissionRecords(s).find(g=>g.userId===userId&&g.business===business&&g.role===role)?.alias||'';
}
function normalizedRecord(s,value,role,existing){
 const {userId,business}=value;
 ensure(s.users.some(u=>u.id===userId),'请选择已有账号');
 ensure(business==='shared'||Object.hasOwn(lines,business),'请选择有效业务类型');
 ensure(business==='shared'?role==='admin':Object.hasOwn(definitions[business],role),'请选择当前业务下的有效角色');
 const selectedChannels=channelRoles.includes(role)?value.channels||[]:[];
 ensure(Array.isArray(selectedChannels)&&selectedChannels.every(c=>channels.includes(c)),'存在无效渠道');
 ensure(!channelRoles.includes(role)||selectedChannels.length,'渠道角色必须关联至少一个渠道');
 const alias=aliasRoles.includes(role)?String(value.alias||'').trim():'';
 ensure(Array.from(alias).length<=20,'化名最多20个字符');
 return {id:existing?.id||'permission-'+(globalThis.crypto?.randomUUID?.()||Date.now().toString(36)+'-'+Math.random().toString(36).slice(2)),userId,business,role,channels:[...new Set(selectedChannels)],alias,createdAt:existing?.createdAt??new Date().toISOString()};
}
function validateRecords(s,records){
 const keys=new Set();
 for(const g of records){
  const key=JSON.stringify([g.userId,g.business,g.role]);
  ensure(!keys.has(key),'该用户已拥有此业务角色，请勿重复授权');keys.add(key);
 }
 for(const u of s.users){
  const own=records.filter(g=>g.userId===u.id),admin=own.some(g=>g.business==='shared'&&g.role==='admin');
  ensure(!admin||!own.some(g=>g.business!=='shared'),'管理员与业务角色互斥，请先移除该用户的其他授权');
  ensure(own.filter(g=>g.business==='distribution'&&['groupA','groupB','groupC'].includes(g.role)).length<=1,'审核组、红果、运营三类评估角色互斥');
 }
 ensure(records.some(g=>g.business==='shared'&&g.role==='admin'),'至少保留一个管理员账号');
}
function commitPermissions(s,records,action,changed,before=[]){
 validateRecords(s,records);
 const actor=current(s)?.name,users=[...new Set(changed.map(g=>s.users.find(u=>u.id===g.userId)?.name||g.userId))];
 s.permissionRecords=records;projectPermissions(s);
 s.permissionHistory??=[];s.permissionHistory.unshift({user:users.join('、'),actor,at:new Date().toLocaleString('zh-CN'),text:action+'：'+changed.map(g=>(lines[g.business]||'共用管理')+' / '+(g.role==='admin'?'管理员':label(g.role,g.business))).join('、'),before:structuredClone(before),after:action==='删除权限'?[]:structuredClone(changed)});
}
export function addPermission(s,value){
 ensure(isAdmin(s),'仅管理员可以配置权限');
 ensure(Array.isArray(value.roles)&&value.roles.length,'请至少选择一个角色');
 const added=value.roles.map(role=>normalizedRecord(s,value,role));
 commitPermissions(s,[...permissionRecords(s),...added],'新增权限',added);return added;
}
export function editPermission(s,id,value){
 ensure(isAdmin(s),'仅管理员可以配置权限');
 const records=permissionRecords(s),previous=records.find(g=>g.id===id);ensure(previous,'此权限记录已不存在');
 ensure(!value.business||value.business===previous.business,'编辑时业务类型不可更改，请新增对应业务授权');
 const changed=normalizedRecord(s,{...value,business:previous.business},value.role,previous);
 commitPermissions(s,records.map(g=>g.id===id?changed:g),'编辑权限',[changed],[previous]);return changed;
}
export function deletePermission(s,id){
 ensure(isAdmin(s),'仅管理员可以配置权限');
 const records=permissionRecords(s),previous=records.find(g=>g.id===id);ensure(previous,'此权限记录已不存在');
 commitPermissions(s,records.filter(g=>g.id!==id),'删除权限',[previous],[previous]);return previous;
}
