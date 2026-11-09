import * as A from './access-v3.js?v=20261109-overview-merge';
// Synthetic distribution records. Existing records, matching projects and permissions are never replaced.
const scenarios=[
 ['quality-pending','质量待评','内容评估',['雾桥来信','月光候车室']],
 ['quality-revision','质量退回','内容评估',['雨停见你','旧巷拾春']],
 ['groups-pending','三组待评','内容评估',['南街有晴','星河小卖部']],
 ['groupa-pending','审核组待评','内容评估',['海风翻页','归途有灯']],
 ['groupb-pending','红果待评','内容评估',['山城余温','晚风记事簿']],
 ['groupc-pending','运营待评','内容评估',['借一束晨光','落日邮局']],
 ['groupa-approved','审核组已过','内容评估',['纸船渡长夜','白露归航']],
 ['groupb-approved','红果已过','内容评估',['石阶上的春天','听见旧时光']],
 ['groupc-approved','运营已过','内容评估',['下一站有你','沿河慢行']],
 ['groupa-revision','审核组退回','内容评估',['小院迎风','转角见山海']],
 ['groupb-revision','红果退回','内容评估',['夏末便利店','春日入画']],
 ['groupc-revision','运营退回','内容评估',['长街拾星','第七封回信']],
 ['delivery-pending','三组全过待交付','正片与物料',['浅巷灯未眠','逆风送花人']],
 ['film-pending','正片待安审','正片与物料',['云边照相馆','竹影知归处']],
 ['film-revision','正片安审退回','正片与物料',['与你守晨光','故城新雨']],
 ['material-pending','物料待核验','正片与物料',['一窗春色','晚钟未远']],
 ['material-revision','物料核验退回','正片与物料',['石桥听雨','灯下慢慢说']],
 ['business-pending','物料已过待留档','商务与排播',['清风寄南城','拾起晴天']],
 ['schedule-pending','已留档待排期','商务与排播',['有信过长安','暮色开花']],
 ['channel-material-missing','渠道待备资料','渠道发行',['花店的约定','风中来客']],
 ['channel-ready','资料齐待送审','渠道发行',['雪落有回声','春山可望']],
 ['channel-submitted','渠道审核中','渠道发行',['旧码头的月亮','微雨遇晴']],
 ['channel-content-revision','渠道内容退回','渠道发行',['橘灯照归人','第二次晴空']],
 ['channel-material-revision','渠道资料退回','渠道发行',['海棠街往事','一路生花来']],
 ['channel-content-resubmit','内容已改待重送','渠道发行',['向晚的答案','山间有书声']],
 ['online-unsynced','已上线未拉取','上线与数据',['北窗见初雪','风过石榴巷']],
 ['online-synced','已上线已拉取','上线与数据',['听风等花开','月落长桥']],
 ['partial-online-unsynced','部分上线未拉取','上线与数据',['朝雾里的承诺','街角时光店']],
 ['partial-online-synced','部分上线已拉取','上线与数据',['星光归旧巷','春水映长灯']]
];

export const distributionScenarioCatalog=scenarios.map(([id,label,group])=>({id,label,group}));

const audit=(status='none',opinion='')=>({status,opinion});
const demoFile=(name)=>({name,size:1024,version:1,at:'2026-11-06 09:00',demo:true});
const assigned=(s,role,channel)=>s.users.find(u=>!u.admin&&u.distribution?.roles?.includes(role)&&(!channel||A.roleChannels(s,u,'distribution',role).includes(channel)))?.id||'';
const demoUrl=(p,part)=>'https://example.com/juhui-demo/'+encodeURIComponent(p.id)+'/'+part;

function qualityPassed(p){p.quality=audit('approved');p.groups={groupA:audit('pending'),groupB:audit('pending'),groupC:audit('pending')};}
function evaluationPassed(p){qualityPassed(p);Object.values(p.groups).forEach(x=>x.status='approved');p.stage='delivery';}
function delivered(p){
 evaluationPassed(p);p.stage='film';p.delivery='演示正片交付：60集，'+demoUrl(p,'episodes');p.materials='演示全量物料：海报、简介、演员资料、版权证明与授权清单，'+demoUrl(p,'materials');
 p.deliveryVersion=1;p.materialsVersion=1;p.film={...audit('pending'),version:1};p.material={...audit('waiting'),version:1};
}
function filmPassed(p){delivered(p);p.film.status='approved';p.material.status='pending';p.stage='materials';}
function materialPassed(p){filmPassed(p);p.material.status='approved';p.stage='business';}
function archived(p){materialPassed(p);p.contract=demoFile(p.name+'_已签发行合同.pdf');p.contractFiles=[p.contract,demoFile(p.name+'_发行授权书.pdf')];p.stage='scheduling';}
function scheduled(s,p){archived(p);p.schedule='2026-11-05T10:00';p.channelTasks=[channelTask(s,'红果')];}
function channelTask(s,channel){return {channel,operator:assigned(s,'channelOps',channel),status:'preparing',material:'',materialNote:'',opinion:'',history:[]};}
function readyTask(p,t){t.material=demoUrl(p,encodeURIComponent(t.channel)+'-materials');t.materialNote='演示渠道材料：授权、海报、简介与上剧信息';}
function onlineTask(p,t,synced){readyTask(p,t);t.status='online';t.actual='2026-11-05T10:00';t.url=demoUrl(p,encodeURIComponent(t.channel)+'-online');if(synced)t.syncedAt='2026-11-06 10:30（演示同步）';p.stage='online';}

function applyScenario(s,p,id){
 if(id==='quality-pending')return;
 if(id==='quality-revision'){p.quality=audit('revision','演示意见：请补充主线冲突，并提供调整后的完整试看版本。');p.stage='revision';return;}
 if(id==='groups-pending'){qualityPassed(p);return;}
 const group=id.match(/^group([abc])-(pending|approved|revision)$/);
 if(group){
  qualityPassed(p);const key='group'+group[1].toUpperCase(),status=group[2];
  if(status==='pending')Object.entries(p.groups).forEach(([k,x])=>{x.status=k===key?'pending':'approved';});
  else p.groups[key]=audit(status,status==='revision'?'演示意见：请调整前两集叙事节奏后重新提交试看。':'');
  if(status==='revision')p.stage='revision';return;
 }
 if(id==='delivery-pending'){evaluationPassed(p);return;}
 if(id==='film-pending'||id==='film-revision'){delivered(p);if(id==='film-revision')p.film=audit('revision','演示意见：请弱化第18集危险动作展示，并同步修改版正片。');return;}
 if(id==='material-pending'||id==='material-revision'){filmPassed(p);if(id==='material-revision')p.material=audit('revision','演示意见：请补充横版海报和完整版权证明；正片文件保持原版本。');return;}
 if(id==='business-pending'){materialPassed(p);return;}
 if(id==='schedule-pending'){archived(p);return;}
 scheduled(s,p);const t=p.channelTasks[0];
 if(id==='channel-material-missing')return;
 readyTask(p,t);
 if(id==='channel-ready')return;
 if(id==='channel-submitted'){t.status='submitted';return;}
 if(id==='channel-content-revision'){t.status='revision';t.returnType='content';t.opinion='演示渠道意见：请调整第8集对白并上传修改后的正片。';return;}
 if(id==='channel-material-revision'){t.status='resubmit';t.returnType='material';t.opinion='演示渠道意见：请补充渠道专用授权书及竖版封面。';t.needsMaterials=true;return;}
 if(id==='channel-content-resubmit'){t.status='resubmit';t.returnType='content';t.opinion='演示渠道意见：第8集对白需调整。';t.files=[demoFile(p.name+'_第8集修改版.mp4')];return;}
 const partial=id.startsWith('partial-online-'),synced=id.endsWith('-synced');
 onlineTask(p,t,synced);
 if(partial){const next=channelTask(s,'抖音');readyTask(p,next);next.status='submitted';p.channelTasks.push(next);}
}

export function appendDistributionScenarios(s){
 // Honour existing supplier setup; do not enable a supplier or grant a role for demo data.
 const supplier=s.suppliers?.find(x=>x.status!=='frozen'&&x.businesses?.includes('distribution')&&x.distributionBusiness);
 if(!supplier)return s;
 s.distribution??=[];const existing=new Set(s.distribution.map(p=>p.id));
 for(const [scenario,label,group,names] of scenarios)for(let copy=1;copy<=2;copy++){
  const id=`DEMO-D-${scenario}-${copy}`;if(existing.has(id))continue;
  const p={id,name:`【${label}】${names[copy-1]}`,supplier:supplier.id,business:supplier.distributionBusiness,episodes:60,stage:'evaluation',preview:'',quality:audit('pending'),groups:{groupA:audit(),groupB:audit(),groupC:audit()},film:audit(),material:audit(),filmAssignee:assigned(s,'film'),materialAssignee:assigned(s,'material'),materials:'',delivery:'',contract:null,history:[],channelTasks:[],demoScenario:{id:scenario,label,group,copy}};
  p.preview=demoUrl(p,'preview');applyScenario(s,p,scenario);
  p.history.push({at:'2026-11-06 09:00',actor:'演示数据',text:'演示场景：'+label+'；仅供流程与权限验证。'});
  s.distribution.push(p);existing.add(id);
 }
 return s;
}
