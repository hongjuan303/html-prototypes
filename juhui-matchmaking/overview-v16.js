import * as A from './access-v3.js?v=20261109-channels';
import * as M from './model-v2.js?v=20261109-channels';
import {dashboardRows,dashboardMetrics} from './dashboard-v9.js?v=20261109-channels';
import {overviewMarker} from './overview-notes-v16.js?v=20261109-channels';

const platform=s=>s.ui.system==='platform';
const maker=s=>!platform(s)&&s.ui.identity==='maker';
export const overviewScope=s=>s.ui.business==='matching'&&(platform(s)?s.ui.view==='projects':s.ui.view==='content');
export const overviewMetric=s=>s.ui.overviewMetric||'all';
export function overviewData(s){
 const rows=dashboardRows(s),source=platform(s)?s.ui.source||'':'';
 const all=rows.filter(r=>!source||r.source===source);
 const current=all.filter(r=>r.kind==='project'&&(platform(s)?!!r.project.selected:maker(s)?r.project.selected===s.ui.supplier:true));
 const ended=all.filter(r=>r.ended&&(r.kind==='cooperation'||current.includes(r)));
 return {all,current,ended};
}
export function overviewProjectRows(s,rows){
 const key=overviewMetric(s),data=overviewData(s),ids=new Set(data.current.filter(r=>key==='all'||(key==='ongoing'?r.ongoing:r.phase===key)).map(r=>r.id));
 return rows.filter(p=>ids.has(p.id));
}
export function overviewCrossRows(s,rows){
 const phase=s.ui.view==='library'?s.ui.overviewLibraryPhase:s.ui.view==='intake'&&maker(s)&&s.ui.overviewSelection?'unassigned':'';
 if(!phase)return rows;
 const ids=new Set(dashboardRows(s).filter(r=>r.kind==='project'&&r.phase===phase).map(r=>r.id));
 return rows.filter(p=>ids.has(p.id));
}
export function overviewHeader(s,h){
 if(!overviewScope(s))return '';
 const {E,button}=h,{all,current,ended}=overviewData(s),metric=overviewMetric(s),labels=dashboardMetrics(s);
 const phaseButton=([key,label])=>{
  const cross=platform(s)&&['unassigned','awaiting'].includes(key)||maker(s)&&key==='unassigned',target=platform(s)?'library':'intake';
  const disabled=cross&&!A.menus(s).includes(target),count=(cross?all:current).filter(r=>r.kind==='project'&&r.phase===key).length;
  return `<button type="button" class="overview-state ${!cross&&metric===key?'active':''}" data-action="overview-filter" data-value="${key}" aria-pressed="${!cross&&metric===key}" ${disabled?'disabled title="当前账号无对应菜单权限"':''}><span>${label}${cross?'<i aria-hidden="true">↗</i>':''}</span><strong>${count}<small>${['unassigned','awaiting'].includes(key)?'本':'部'}</small></strong>${cross?`<em>去${platform(s)?'剧本库':'剧本评估'}</em>`:''}</button>`;
 };
 const overall=[['all','全部记录',current.length],['ongoing','项目进行中',current.filter(r=>r.ongoing).length],['ended','项目已终止',ended.length]];
 const title=labels.find(([key])=>key===metric)?.[1]||'全部记录';
 return `<section class="overview-panel" aria-label="撮合状态概览"><div class="overview-heading"><h2>撮合概览 ${overviewMarker(1)}</h2><div class="overview-overall" aria-label="总体状态">${overall.map(([key,label,count])=>button(`${label}<b>${count}</b>`,'overview-filter','',metric===key?'active':'',`data-value="${key}" aria-pressed="${metric===key}"`)).join('')}</div></div><div class="overview-state-grid" style="--overview-columns:${labels.length-2}">${labels.filter(([key])=>!['ongoing','ended'].includes(key)).map(phaseButton).join('')}</div></section><div class="overview-list-scope"><span>当前列表：<strong>${E(title)}</strong></span><span>${platform(s)?'已确定承制方的项目':maker(s)?'本人承制的项目':'本人提交的剧本与剧集'} ${overviewMarker(2)}</span></div>`;
}
export function overviewBridge(s,h){
 const phase=s.ui.view==='library'?s.ui.overviewLibraryPhase:s.ui.view==='intake'&&maker(s)&&s.ui.overviewSelection?'unassigned':'';
 if(!phase)return '';
 const {button}=h,label=platform(s)?phase==='awaiting'?'待立项剧本':'待分配剧本':'待筛选剧本';
 return `<div class="overview-bridge"><span>${overviewMarker(1)} 正在查看：<strong>${label}</strong></span><div class="actions">${button('查看全部剧本','overview-cross-clear')}${button(platform(s)?'返回撮合管理':'返回内容管理','overview-return')}</div></div>`;
}
export function chooseOverview(s,key){
 const keys=['all',...dashboardMetrics(s).map(([k])=>k)];if(!keys.includes(key))return false;
 const cross=platform(s)&&['unassigned','awaiting'].includes(key)||maker(s)&&key==='unassigned';
 if(cross){
  const view=platform(s)?'library':'intake';if(!A.menus(s).includes(view))return false;
  const fields=['view','listTab','keyword','stage','source','page','taskOnly','overviewMetric'];
  s.ui.overviewReturn={...Object.fromEntries(fields.map(k=>[k,s.ui[k]])),supplier:s.ui.supplier,identity:s.ui.identity,user:s.ui.user,system:s.ui.system};
  Object.assign(s.ui,{view,id:null,keyword:'',stage:'',page:1,taskOnly:false,listTab:platform(s)?'all':'pending',overviewLibraryPhase:platform(s)?key:'',overviewSelection:!platform(s),batchIds:[]});
 }else Object.assign(s.ui,{overviewMetric:key,listTab:'all',page:1,batchIds:[]});
 return true;
}
export function returnOverview(s){
 const saved=s.ui.overviewReturn;
 if(saved&&saved.system===s.ui.system&&(platform(s)?saved.user===s.ui.user:saved.supplier===s.ui.supplier&&saved.identity===s.ui.identity)){
  const {supplier,identity,user,system,...fields}=saved;Object.assign(s.ui,fields,{id:null});
 }else Object.assign(s.ui,{view:platform(s)?'projects':'content',id:null,listTab:'all',overviewMetric:'all',keyword:'',source:'',page:1});
 clearOverviewCross(s);
}
export function clearOverviewCross(s){Object.assign(s.ui,{overviewLibraryPhase:'',overviewSelection:false,overviewReturn:null});}
export function overviewEndedTable(s,h){
 if(!overviewScope(s)||overviewMetric(s)!=='ended')return null;
 const {E,button,badge,empty}=h,q=(s.ui.keyword||'').trim().toLowerCase();
 const rows=overviewData(s).ended.filter(r=>!q||(r.title+' '+r.id).toLowerCase().includes(q));
 s.ui.page=Math.min(Math.max(1,s.ui.page||1),Math.max(1,Math.ceil(rows.length/8)));
 const body=rows.slice((s.ui.page-1)*8,s.ui.page*8).map(r=>{
  const old=r.kind==='cooperation',item=old?r.archive:r.project,termination=item.termination||{};
  const reason=termination.reason||item.quality?.opinion||item.safety?.opinion||'未记录',at=old?item.archivedAt:termination.at||item.quality?.reviewedAt||'';
  return `<tr><td><strong>${E(r.title)}</strong><small>${E(r.id)}</small></td><td>${badge(old?'已终止的承制合作':platform(s)||maker(s)?'已终止项目':'已终止剧本','red')}</td>${platform(s)?`<td>${E(M.nameOf(s,old?item.maker:item.selected)||'—')}</td>`:''}<td>${E(at||'未记录')}</td><td class="overview-ended-reason">${E(reason)}</td><td>${button(old?'查看终止记录':'查看详情',old?'dashboard-archive':'detail',r.id,'link',old?`data-value="${r.archiveIndex}"`:'')}</td></tr>`;
 }).join('');
 return `<section class="panel"><div class="table-toolbar"><h3>已终止记录 <span>${rows.length} 项</span> ${overviewMarker(3)}</h3></div><div class="table-wrap"><table class="overview-ended-table"><thead><tr><th>项目 / 剧本名称</th><th>记录类型</th>${platform(s)?'<th>承制方</th>':''}<th>终止时间</th><th>终止原因</th><th>操作</th></tr></thead><tbody>${body}</tbody></table>${rows.length?'':empty('暂无已终止记录')}</div><div class="pagination"><span>共 ${rows.length} 条 · 每页 8 条</span>${button('‹','page','','',`data-page="${s.ui.page-1}" ${s.ui.page===1?'disabled':''}`)}<span class="current-page">${s.ui.page}</span>${button('›','page','','',`data-page="${s.ui.page+1}" ${s.ui.page*8>=rows.length?'disabled':''}`)}</div></section>`;
}
