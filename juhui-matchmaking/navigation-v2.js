import {overviewScope,overviewProjectRows,overviewCrossRows} from './overview-v16.js?v=20261109-channels';
import * as A from './access-v3.js?v=20261109-channels';
import * as M from './model-v2.js?v=20261109-channels';
import {projectTasks,taskDetailTab} from './tasks-v7.js?v=20261109-channels';

export const info={dashboard:['撮合看板','grid'],'dist-evaluation':['内容评估','file'],'dist-projects':['发行项目','folder'],'dist-data':['短剧数据','grid'],intake:['剧本评估','file'],library:['剧本库','folder'],projects:['撮合管理','grid'],content:['内容管理','folder'],data:['短剧数据','grid'],permissions:['用户权限分配','users'],suppliers:['供应商管理','users'],personal:['个人中心','users'],flow:['流程总览','flow']};
export const existing=['personal'];
export const settings=['permissions','suppliers'];
export const menus=A.menus;
export const title=id=>info[id]?.[0]||id;
export function tabs(s){
 const u=s.ui;
 if(overviewScope(s))return [];
 if(u.view==='library')return [['all','全部剧本'],...Object.entries(M.libraryStatuses)];
 if(u.view==='intake'){
  if(u.system==='supplier'&&u.identity==='maker')return [['all','全部剧本'],['pending','待反馈'],['selected','已选中'],['unavailable','不可再选']];
  if(u.system==='supplier')return [['pending','待评估'],['approved','已通过'],['ended','已终止']];
  return [['pending','待评估'],['ended','已终止']];
 }
 if(['projects','content'].includes(u.view))return [['all','全部项目'],...(u.view==='content'&&u.identity==='script'?[['matching','待匹配']]:[]),['production','制作中'],['release','待发行'],['online','已上线'],['ended','已终止']];
 return [];
}
export function normalize(s){
 const u=s.ui,platform=u.system==='platform';
 if(u.view==='dashboard'&&u.business==='matching'){u.view=platform?(menus(s).includes('projects')?'projects':menus(s)[0]):'content';u.id=null;u.overviewMetric=!platform&&u.identity==='maker'&&u.dashboardMetric==='awaiting'?'developing':['developing','unscheduled','scheduled','online','ongoing','ended',...(!platform&&u.identity==='script'?['unassigned','awaiting']:[])].includes(u.dashboardMetric)?u.dashboardMetric:'all';u.keyword=u.dashboardKeyword||'';u.source=platform?u.dashboardSource||'':'';u.page=1;}
 if(overviewScope(s)){u.overviewMetric??=({production:'developing',online:'online',ended:'ended'})[u.listTab]||'all';if(!['all','ongoing','ended','unassigned','awaiting','developing','unscheduled','scheduled','online'].includes(u.overviewMetric))u.overviewMetric='all';if(platform&&['unassigned','awaiting'].includes(u.overviewMetric)||!platform&&u.identity==='maker'&&['unassigned','awaiting'].includes(u.overviewMetric))u.overviewMetric='all';u.listTab='all';u.stage='';}
 const available=A.available(s);if(!available.includes(u.business))u.business=available[0]||'matching';
 u.role=A.isAdmin(s)?'admin':A.getRoles(s)[0]||'unassigned';
 const legacy={review:['intake',platform&&['safety','safetyLead'].includes(u.role)?'safety':'full'],matching:[platform?'library':'intake',platform?'matching':'all'],production:[platform?'projects':'content','production'],release:[platform?'projects':'content','release']};
 if(legacy[u.view])[u.view,u.listTab]=legacy[u.view];
 if(!platform&&u.view==='projects'){u.view='content';u.listTab='all';}
 if(u.view!=='flow'&&!menus(s).includes(u.view)){u.view=menus(s)[0]||'no-access';u.id=null;u.stage='';u.keyword='';u.source='';u.listTab='';}
 if(platform&&u.view==='projects'&&u.id){const p=s.projects.find(x=>x.id===u.id);if(p&&!p.selected){if(canOpenLibrary(s,p)){u.view='library';u.tab=p.grade?'match':'archive';}else u.id=null;}}
 if(u.view==='library'&&u.listTab==='unassigned')u.listTab='unrated';
 if(u.view==='intake'&&(platform||u.identity==='script')&&['ended','rejected'].includes(u.stage)){u.listTab='ended';u.stage='';}
 if(!platform&&u.view==='intake'&&u.identity==='script'&&u.stage==='approved'){u.listTab='approved';u.stage='';}
 const choices=tabs(s);
 if(!overviewScope(s)&&!choices.some(([k])=>k===u.listTab))u.listTab=choices[0]?.[0]||'';
 if(u.view==='intake'&&(platform||u.identity==='script')){if(u.stage==='ended')u.stage='rejected';if(!['',...Object.keys(M.scriptAudits)].includes(u.stage))u.stage='';}
 // Old project phase filters become tabs; no business records or saved drafts change.
 if(!u.menuVersion&&['projects','content'].includes(u.view)&&u.stage){u.listTab=['release','scheduling'].includes(u.stage)?'release':choices.some(([k])=>k===u.stage)?u.stage:'all';u.stage='';}
 if(u.view==='library')u.stage='';
 u.menuVersion=1;u.page=Math.max(1,u.page||1);
}
export function baseRows(s){
 const u=s.ui,platform=u.system==='platform';
 const available=A.available(s);if(!available.includes(u.business))u.business=available[0]||'matching';
 u.role=A.isAdmin(s)?'admin':A.getRoles(s)[0]||'unassigned';
 let rows=M.visible(s);
 if(u.view==='intake'){
  if(platform)rows=rows.filter(p=>!p.grade&&!M.isAwaitingRating(p)&&(['intake','full','review'].includes(p.stage)||p.stage==='ended'&&isEvaluationTerminated(p)));
  return rows;
 }
 if(u.view==='library')return rows.filter(p=>canOpenLibrary(s,p));
 if(u.view==='projects')return rows.filter(p=>!!p.selected);
 if(u.view==='content')return u.identity==='script'?rows:rows.filter(p=>p.selected===u.supplier);
 return rows;
}
export function inTab(s,p,key){
 const u=s.ui;
 if(overviewScope(s))return true;
 if(u.view==='library')return key==='all'||!key||M.libraryStatus(p)===key;
 if(u.view==='intake'){
  if(u.system==='platform')return key==='ended'?isEvaluationTerminated(p):key==='pending'?!isEvaluationTerminated(p):true;
  if(u.system==='supplier'&&u.identity==='maker'){
   const offer=M.latestOffer(p,u.supplier),mine=p.selected===u.supplier;
   if(key==='pending')return !p.selected&&offer?.status==='pending';
   if(key==='selected')return mine;
   if(key==='unavailable')return !mine&&(!!p.selected||['expired','withdrawn','locked','declined'].includes(offer?.status));
   return true;
  }
  if(u.system==='supplier'&&u.identity==='script'){
   const ended=p.stage==='ended'||isEvaluationTerminated(p),approved=!ended&&(!!p.grade||!!p.selected||M.isAwaitingRating(p)||p.quality?.status==='approved'&&p.safety?.status==='approved');
   return key==='ended'?ended:key==='approved'?approved:key==='pending'?!ended&&!approved:true;
  }
  return true;
 }
 if(key==='all'||!key)return true;
 return key==='release'?['release','scheduling'].includes(p.stage):p.stage===key;
}
export function rows(s){
 const evaluation=s.ui.view==='intake'&&(s.ui.system==='platform'||s.ui.identity==='script');
 const taskOnly=s.ui.system==='platform'&&['intake','projects'].includes(s.ui.view)&&s.ui.taskOnly;
 const candidates=overviewScope(s)?overviewProjectRows(s,baseRows(s)):overviewCrossRows(s,baseRows(s));
 return candidates.filter(p=>inTab(s,p,s.ui.listTab)&&(!taskOnly||projectTasks(s,p).length)&&(!s.ui.keyword||(p.name+p.id+(s.ui.view==='projects'||s.ui.view==='content'?M.projectName(p):'')).toLowerCase().includes(s.ui.keyword.trim().toLowerCase()))&&(!s.ui.stage||(evaluation?M.evaluationStatuses(p).includes(s.ui.stage):p.stage===s.ui.stage))&&(!s.ui.source||p.source===s.ui.source));
}
export function detailTab(s,p){
 const u=s.ui;
 if(u.view==='library')return 'archive';
 if(u.view==='intake'&&(u.system==='platform'||u.identity==='script'))return 'script';
 if(u.system==='supplier'&&u.identity==='maker'&&(u.view==='intake'||p.selected!==u.supplier))return 'match';
 if(u.system==='supplier'&&u.identity==='script')return u.view==='content'?'materials':'script';
 if(u.system==='platform'){
  const taskTab=taskDetailTab(projectTasks(s,p)[0]);if(taskTab)return taskTab;
 }
 if(p.stage==='ended')return 'history';
 if(p.stage==='matching')return 'match';
 if(p.stage==='production')return 'production';
 return ['scheduling','online'].includes(p.stage)?'channels':p.stage==='release'?(p.film?.status==='approved'?'release':'safety'):'script';
}

// Each platform entry opens a view shaped around its own task.
export function detailKind(s){
 if(s.ui.system!=='platform')return 'supplier';
 return ({intake:'evaluation',library:'library',projects:'project'})[s.ui.view]||'project';
}
export function detailTabs(s,p){
 if(detailKind(s)==='evaluation')return [];
 if(detailKind(s)==='library')return [];
 if(detailKind(s)==='project')return [['production','制作审核'],['safety','安全审核'],['release','物料与合同'],...(['scheduling','online'].includes(p.stage)?[['channels','排播与渠道'],['data','渠道数据']]:[]),['script','剧本资料'],['history','流转记录']];
 return [['match','承制方匹配'],...(p.selected?[['production','制作交付']]:[]),['release','发行准备'],...(['scheduling','online'].includes(p.stage)?[['channels','排播与渠道'],['data','渠道数据']]:[]),['script','剧本资料'],['history','流转记录']];
}
export function canOpenProject(s,p){return s.ui.system==='platform'&&s.ui.business==='matching'&&menus(s).includes('projects')&&!!p&&!!p.selected&&M.visible(s).some(x=>x.id===p.id);}

export function canOpenLibrary(s,p){return s.ui.system==='platform'&&s.ui.business==='matching'&&menus(s).includes('library')&&!!p&&(!!p.grade||M.isAwaitingRating(p))&&(A.isAdmin(s)||A.canFor(s,p,'businessLead','business','editor','dispatcher','producer'))&&M.visible(s).some(x=>x.id===p.id);}

export function isEvaluationTerminated(p){return !p.grade&&(p.intake?.status==='rejected'||[p.quality?.status,p.safety?.status].includes('rejected'));}
