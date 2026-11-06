export const lines={matching:'撮合业务',distribution:'代发行业务'};
export const channels=['红果','抖音','番茄'];
// Menus describe work; roles determine actions and related records.
export const definitions={
 matching:{businessLead:['撮合商务负责人',['intake','library','projects'],'撮合商务项目统筹查看'],business:['剧本商务',['intake','library','projects'],'本人对接的剧本'],prodBusiness:['承制商务',['projects'],'本人对接的承制项目'],content:['剧本评估',['intake'],'内容组待办'],safetyLead:['剧本安审负责人',['intake'],'剧本安审分配'],safety:['剧本安审',['intake'],'本人安审任务'],editor:['总编 / 项目负责人',['intake','library','projects'],'评级并分配制片、内部本及撮合项目名称维护'],dispatcher:['剧本评级',['library'],'评级、题材与项目制片的统一维护'],producer:['项目制片',['library','projects'],'本人负责剧本的承制匹配及项目执行、名称维护'],manager:['合作终止 / 解锁确认',['projects'],'合作异常项目'],filmLead:['正片安审负责人',['projects'],'正片安审分配'],film:['正片安审人员',['projects'],'本人正片任务'],schedule:['排播上线负责人',['projects'],'满足排播条件的项目'],channelLead:['渠道负责人',['projects'],'关联渠道任务'],channelOps:['渠道运营',['projects'],'本人负责的渠道任务']},
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
 for(const x of s.suppliers){x.businesses??=['matching'];x.distributionBusiness??='';}
 if(!s.architectureVersion){const first=s.suppliers.find(x=>x.id==='s1');if(first){first.businesses=[...new Set([...first.businesses,'distribution'])];first.distributionBusiness||='张桂铭';}s.architectureVersion=1;}
 for(const p of s.projects){p.safetyAssignee??='safety2';p.filmAssignee??='film';}
 return s;
}
export const current=s=>s.users.find(x=>x.id===s.ui.user);
export const isAdmin=s=>s.ui.system==='platform'&&!!current(s)?.admin;
export const getRoles=(s,line=s.ui.business)=>current(s)?.[line]?.roles||[];
export const label=(key,line)=>definitions[line]?.[key]?.[0]||key;
// Prototype administrator can exercise every platform role without changing assignments.
export function has(s,...rs){return s.ui.system==='platform'&&(isAdmin(s)||rs.some(r=>getRoles(s).includes(r)));}
// Internal submissions retain their business and stage requirements.
export const canCreateInternal=s=>s.ui.business==='matching'&&has(s,'admin','editor');
export function available(s){return s.ui.system==='platform'?Object.keys(lines).filter(k=>isAdmin(s)||getRoles(s,k).length):Object.keys(lines).filter(k=>s.suppliers.find(x=>x.id===s.ui.supplier)?.businesses?.includes(k));}
export function menus(s){
 if(s.ui.system==='supplier')return s.ui.business==='distribution'?['dist-evaluation','dist-projects']:['intake','content'];
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
 if(['channelLead','channelOps'].includes(r))return (p.channelTasks||[]).some(t=>u[s.ui.business].channels.includes(t.channel)&&(r==='channelLead'||t.operator===u.id));
 return true;
}
export function canFor(s,p,...rs){return has(s,...rs)&&(isAdmin(s)||!p||rs.some(r=>getRoles(s).includes(r)&&relevant(s,p,r)));}
export function visible(s,p,line=s.ui.business){
 if(line!==s.ui.business)return false;
 if(s.ui.system==='supplier'){
  const supplier=s.suppliers.find(x=>x.id===s.ui.supplier);if(supplier?.status==='frozen'||!supplier?.businesses.includes(line))return false;
  return line==='distribution'?p.supplier===s.ui.supplier:s.ui.identity==='script'?p.supplier===s.ui.supplier:p.selected===s.ui.supplier||p.offers.some(o=>o.supplier===s.ui.supplier);
 }
 return isAdmin(s)||getRoles(s).some(r=>relevant(s,p,r));
}
export const options=(s,line,role)=>s.users.filter(u=>!u.admin&&u[line]?.roles.includes(role)).map(u=>[u.id,u.name]);
export function saveUser(s,id,v){
 if(!isAdmin(s))throw Error('仅管理员可以配置权限');
 const u=s.users.find(x=>x.id===id);if(!u)throw Error('请选择已有账号');
 for(const line of Object.keys(lines)){
  const roles=v[line]?.roles||[],chs=v[line]?.channels||[];
  if(roles.some(r=>!definitions[line][r]))throw Error('存在无效角色');
  if(v.admin&&roles.length)throw Error('管理员与业务角色互斥，请先取消业务角色');
  if(line==='distribution'&&roles.filter(r=>['groupA','groupB','groupC'].includes(r)).length>1)throw Error('审核组、红果、运营三类评估角色互斥');
  if(roles.some(r=>['channelLead','channelOps'].includes(r))&&!chs.length)throw Error(lines[line]+'的渠道角色必须关联至少一个渠道');
 }
 if(u.admin&&!v.admin&&!s.users.some(x=>x.id!==id&&x.admin))throw Error('至少保留一个管理员账号');
 Object.assign(u,{admin:!!v.admin,alias:v.alias||'',matching:v.matching,distribution:v.distribution});
 s.permissionHistory??=[];s.permissionHistory.unshift({user:u.name,actor:current(s)?.name,at:new Date().toLocaleString('zh-CN'),text:'更新两条业务授权'});
}
