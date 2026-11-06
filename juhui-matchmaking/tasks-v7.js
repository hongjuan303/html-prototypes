import * as A from './access-v3.js?v=20261106-test-scenarios';
import * as M from './model-v2.js?v=20261106-test-scenarios';
import * as B from './business-v3.js?v=20261106-test-scenarios';

// A task is an available action on this record, not every remaining project gate.
export function projectTasks(s,p){
 if(s.ui.system!=='platform'||s.ui.business!=='matching'||!p||p.stage==='ended'||!A.visible(s,p,'matching'))return [];
 const tasks=[],can=(...roles)=>A.canFor(s,p,...roles);
 const add=(action,label,value,hint)=>tasks.push({key:value===undefined?action:action+':'+value,label,action,...(value===undefined?{}:{value}),...(hint?{hint}:{})});
 const assigned=(id,role,channel)=>s.users.some(u=>u.id===id&&!u.admin&&u.matching?.roles.includes(role)&&(!channel||u.matching.channels.includes(channel)));
 if(p.stage==='review'&&p.full&&![p.quality,p.safety].some(x=>x?.status==='rejected')){
  if(p.quality?.status==='pending'&&can('content'))add('quality','内容审核',undefined,'剧本全集 V'+(p.full.version||1));
  if(p.safety?.status==='pending'&&can('safety'))add('safety','剧本安全审核',undefined,'剧本全集 V'+(p.full.version||1));
  if(p.safety?.status==='pending'&&can('safetyLead')&&!assigned(p.safetyAssignee,'safety'))add('match-safety-assign','分配剧本安审');
 }
 for(let index=0;index<3;index++)if(M.canReviewProduction(s,p,index))add('production','审核'+['人物及场景资产','一卡demo','全集初稿'][index],index,'制作交付 V'+(p.production[index].version||1));
 const filmReady=p.stage==='release'&&p.film?.status==='pending'&&p.production?.slice(0,3).length===3&&p.production.slice(0,3).every(x=>x.status==='approved')&&p.production[3]?.status==='approved';
 if(filmReady&&can('film'))add('film','正片安全审核',undefined,'全集终版 V'+(p.film.version||p.production[3].version||1));
 if(filmReady&&can('filmLead')&&!assigned(p.filmAssignee,'film'))add('match-review-assign','分配正片安审');
 if(p.scriptMaterial?.status==='pending'&&can(p.source==='internal'?'editor':'business'))add('confirmScript','核验剧本物料',undefined,'核对本次提交的物料与附件');
 if(p.makerMaterial?.status==='pending'&&can('producer'))add('confirmMaker','核验制作物料',undefined,'核对本次提交的物料与附件');
 if(p.grade&&p.source==='external'&&!p.contracts?.script&&can('business'))add('contract','上传剧本合同','script','已签合同上传留档');
 if(p.selected&&!p.contracts?.production&&can('prodBusiness'))add('contract','上传制作合同','production','已签合同上传留档');
 if(['scheduling','online'].includes(p.stage)){
  if(!p.schedule&&can('schedule'))add('release-schedule','设置排期');
  for(const t of B.channelVisible(s,p)){
   const operator=B.channelCan(s,t,'channelOps'),lead=B.channelCan(s,t,'channelLead'),channel=t.channel;
   if(lead&&!assigned(t.operator,'channelOps',channel))add('channel-assign','分配'+channel+'运营',channel);
   if(operator&&['preparing','resubmit','revision'].includes(t.status)&&(!t.material||t.needsMaterials))add('channel-material','准备'+channel+'材料',channel);
   if(operator&&['preparing','resubmit'].includes(t.status)&&t.material&&p.schedule&&!t.needsMaterials)add('channel-submit',t.status==='resubmit'?'重新送审'+channel:'提交'+channel+'送审',channel);
   if(operator&&t.status==='submitted')add('channel-feedback','登记'+channel+'反馈',channel,'登记渠道审核退回或实际上线');
   if(can('producer')&&t.status==='revision'&&t.returnType!=='material')add('channel-fix','提交'+channel+'修改',channel,t.opinion);
   if(can('producer')&&t.status==='confirm')add('channel-confirm','确认'+channel+'修改',channel);
  }
 }
 return tasks;
}

export function taskDetailTab(task){
 if(!task)return '';
 if(['quality','safety','match-safety-assign'].includes(task.action))return 'script';
 if(task.action==='production')return 'production';
 if(['film','match-review-assign'].includes(task.action))return 'safety';
 if(['confirmScript','confirmMaker','contract'].includes(task.action))return 'release';
 if(task.action==='release-schedule'||task.action.startsWith('channel-'))return 'channels';
 return '';
}
