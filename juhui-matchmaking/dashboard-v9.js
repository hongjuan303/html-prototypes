import * as A from './access-v3.js?v=20261109-overview-merge';
import * as M from './model-v2.js?v=20261109-overview-merge';

const maker=s=>s.ui.system==='supplier'&&s.ui.identity==='maker';
const platform=s=>s.ui.system==='platform';
const phaseKeys=s=>dashboardMetrics(s).map(([key])=>key).filter(key=>!['ongoing','ended'].includes(key));
export function dashboardMetrics(s){return [
 ['unassigned',maker(s)?'待筛选剧本':'待分配剧本'],...(!maker(s)?[['awaiting','待立项剧本']]:[]),
 ['developing','开发中剧集'],['unscheduled','待排期剧集'],['scheduled','已排期剧集'],['online','已上线剧集'],['ongoing','项目进行中'],['ended','项目已终止']
];}
export const effectiveMetric=s=>maker(s)&&s.ui.dashboardMetric==='awaiting'?'developing':s.ui.dashboardMetric||'ongoing';
const onlineChannels=p=>(p.channelTasks||[]).filter(t=>t.status==='online');
const allOnline=p=>p.channelTasks?.length?p.channelTasks.every(t=>t.status==='online'):p.stage==='online';
const activeOffer=(s,p,supplier)=>{const offers=p.offers||[],o=supplier?M.latestOffer(p,supplier):null;return supplier?o?.status==='pending'&&(!o.expires||o.expires>M.now(s)):offers.some(o=>o.status==='pending'&&(!o.expires||o.expires>M.now(s)));};
const reviewed=p=>['rating','matching'].includes(p.stage)||!!p.grade||p.quality?.status==='approved'&&p.safety?.status==='approved';

function currentPhase(s,p){
 if(p.stage==='ended')return 'ended';
 if(!p.selected){
  if(maker(s))return activeOffer(s,p,s.ui.supplier)?'unassigned':null;
  if(!reviewed(p))return 'reviewing';
  return activeOffer(s,p)?'awaiting':'unassigned';
 }
 if(onlineChannels(p).length||p.stage==='online')return 'online';
 if(p.schedule)return 'scheduled';
 if(p.stage==='scheduling')return 'unscheduled';
 return 'developing';
}
function archiveVisible(s,p,a){
 if(s.ui.business!=='matching')return false;
 if(!platform(s)){
  const supplier=s.suppliers.find(x=>x.id===s.ui.supplier);
  return maker(s)&&supplier?.status!=='frozen'&&supplier?.businesses?.includes('matching')&&supplier?.roles?.includes('maker')&&a.maker===supplier.id;
 }
 // Script ownership continues across rematches; production assignments do not.
 // A new contractor's reviewers or channel tasks cannot grant access to old work.
 const historical={
  id:p.id,source:a.source??p.source,supplier:a.supplier??p.supplier,
  stage:'ended',selected:a.maker??null,
  producer:a.producer??'',productionBusiness:a.productionBusiness??'',
  business:a.business??p.business??'',
  scriptBusinessId:a.scriptBusinessId??(a.business!=null?'':p.scriptBusinessId??''),
  filmAssignee:a.filmAssignee??'',safetyAssignee:a.safetyAssignee??'',
  grade:a.grade??'',intake:a.intake,quality:a.quality,safety:a.safety,
  offers:a.offers||[],channelTasks:a.channelTasks||[]
 };
 return A.visible(s,historical,'matching');
}
function makeRow(s,p,phase){
 return {key:p.id,id:p.id,kind:'project',archiveIndex:null,project:p,title:p.selected?M.projectName(p):p.name,source:p.source,phase,ongoing:phase!=='ended'&&!allOnline(p),ended:phase==='ended',onlineCount:onlineChannels(p).length,channelCount:p.channelTasks?.length||0};
}
export function dashboardRows(s){
 if(s.ui.business!=='matching'||!A.available(s).includes('matching'))return [];
 if(!platform(s)&&!s.suppliers.find(x=>x.id===s.ui.supplier)?.roles?.includes(s.ui.identity))return [];
 const rows=[];
 for(const p of s.projects){
  if(A.visible(s,p,'matching')){
   const owned=!maker(s)||p.selected===s.ui.supplier;
   const phase=currentPhase(s,p);
   if(phase&&(owned||phase==='unassigned'))rows.push(makeRow(s,p,phase));
  }
  // An ended cooperation is a historical record; it does not end its source script.
  if(platform(s)||maker(s))for(const [index,a] of (p.previousCooperations||[]).entries()){
   if(!archiveVisible(s,p,a)||p.stage==='ended'&&p.selected===a.maker&&index===p.previousCooperations.length-1)continue;
   rows.push({key:`${p.id}:cooperation:${index}`,id:p.id,kind:'cooperation',archiveIndex:index,project:p,archive:a,title:a.projectName||p.name,source:p.source,phase:'ended',ongoing:false,ended:true,onlineCount:0,channelCount:0});
  }
 }
 return rows;
}
export function dashboardCounts(s,rows=dashboardRows(s)){
 return Object.fromEntries(dashboardMetrics(s).map(([key])=>[key,rows.filter(r=>key==='ongoing'?r.ongoing:key==='ended'?r.ended:r.phase===key).length]));
}
export function dashboardFilteredRows(s,rows=dashboardRows(s)){
 const key=effectiveMetric(s),source=platform(s)?s.ui.dashboardSource||'':'',query=(s.ui.dashboardKeyword||'').trim().toLowerCase();
 return rows.filter(r=>(!source||r.source===source)&&(!query||(r.title+' '+r.id).toLowerCase().includes(query))&&(key==='all'||(key==='ongoing'?r.ongoing:key==='ended'?r.ended:r.phase===key)));
}
export function dashboardTarget(s,row){
 if(!row)return null;
 if(row.kind==='cooperation')return {action:'dashboard-archive',id:row.id,value:String(row.archiveIndex)};
 const p=row.project,menus=A.menus(s);
 if(!platform(s))return {view:maker(s)?p.selected===s.ui.supplier?'content':'intake':reviewed(p)||p.selected?'content':'intake',id:p.id};
 const preferred=p.selected?'projects':reviewed(p)?'library':'intake';
 if(menus.includes(preferred))return {view:preferred,id:p.id};
 if(menus.includes('intake')&&!reviewed(p))return {view:'intake',id:p.id};
 return null;
}
export function dashboardArchiveBody(s,id,index,h){
 const row=dashboardRows(s).find(r=>r.kind==='cooperation'&&r.id===id&&r.archiveIndex===Number(index));
 if(!row)return null;
 const {E,fileList,badge}=h,a=row.archive;
 return `<div class="review-project"><strong>${E(row.title)}</strong><small>${E(id)} · 已终止的承制合作</small></div><p class="dashboard-archive-reason"><b>终止原因：</b>${E(a.termination?.reason||'历史记录未填写原因')}</p><p class="subtle">终止时间：${E(a.archivedAt||'未记录')}${platform(s)?' · 承制方：'+E(M.nameOf(s,a.maker)):''}</p><div class="dashboard-archive-deliveries">${(a.production||[]).slice(0,3).map((x,i)=>`<section><h3>${E(['人物及场景资产','一卡demo','全集初稿'][i])} ${badge(M.audits[x.status]||x.status)}</h3>${x.opinion?`<p>${E(x.opinion)}</p>`:''}${fileList(x.files||[])}</section>`).join('')}</div><p class="subtle">此处保留该次合作的交付与意见，不再提交或审核。</p>`;
}

export function dashboardPage(s,h){
 const metric=effectiveMetric(s);
 // Migrate the active view after any saved supplier context is restored.
 if(maker(s)&&s.ui.dashboardMetric==='awaiting'){s.ui.dashboardMetric=metric;s.ui.dashboardPage=1;}
 const {E,heading,button,badge}=h,rows=dashboardRows(s),source=platform(s)?s.ui.dashboardSource||'':'',scoped=rows.filter(r=>!source||r.source===source),counts=dashboardCounts(s,scoped),labels=Object.fromEntries(dashboardMetrics(s));
 const list=dashboardFilteredRows(s,rows),pageSize=10,page=Math.min(Math.max(1,s.ui.dashboardPage||1),Math.max(1,Math.ceil(list.length/pageSize))),slice=list.slice((page-1)*pageSize,page*pageSize);
 const sourceCurrent=rows.filter(r=>r.kind==='project');
 const metricButton=key=>`<button type="button" data-action="dashboard-filter" data-value="${key}" aria-pressed="${metric===key}" class="dashboard-metric ${metric===key?'active':''}"><span>${labels[key]}</span><strong>${counts[key]}<small>${['unassigned','awaiting'].includes(key)?'本':'项'}</small></strong>${metric===key?'<em>查看中</em>':'<i aria-hidden="true">↗</i>'}</button>`;
 const ongoingReview=scoped.filter(r=>r.phase==='reviewing').length;
 const scope=platform(s)?'当前账号可见范围':maker(s)?'推送给你的剧本与承制合作':'你提交的剧本与项目';
 return heading('撮合状态看板',scope+'，点击指标查看对应明细。')+`<div class="dashboard-layout"><section class="dashboard-overview" aria-label="项目总体状态"><div class="dashboard-section-title"><h2>项目总览</h2><span>总体状态</span></div><div class="dashboard-overall">${metricButton('ongoing')}${metricButton('ended')}</div></section>${platform(s)?`<section class="dashboard-source" aria-label="剧本来源"><div class="dashboard-section-title"><h2>剧本来源</h2><span>当前剧本 · 去重统计</span></div><div class="dashboard-source-options">${[['','全部剧本'],['internal','内部剧本'],['external','外部剧本']].map(([key,label])=>`<button type="button" data-action="dashboard-source" data-value="${key}" aria-pressed="${source===key}" class="${source===key?'active':''}"><span>${label}</span><strong>${sourceCurrent.filter(r=>!key||r.source===key).length}</strong></button>`).join('')}</div></section>`:''}</div><section class="dashboard-phases" aria-label="业务阶段"><div class="dashboard-section-title"><h2>阶段进度</h2><span>按当前阶段统计</span></div><div class="dashboard-phase-grid" style="--dashboard-phase-columns:${phaseKeys(s).length}">${phaseKeys(s).map(metricButton).join('')}</div></section><details class="dashboard-counting"><summary>统计口径${ongoingReview?' · '+ongoingReview+' 本剧本审核中':''}</summary><div><p>${maker(s)?'待筛选：收到有效推送，尚未反馈。确认选中后即进入开发中，可直接提交制作交付。':'待分配：剧本审核完成，尚无有效的待反馈推送。待立项：已推送承制方，等待确认选中；不新增立项审批。'}</p><p>开发中包含制作、正片安审和发行资料准备；满足排期条件后计入待排期，平台设置计划上线时间及发行渠道后计入已排期。至少一个渠道实际上线即计入已上线，尚有渠道未上线时，项目仍计入进行中。</p><p>审核中的剧本计入项目进行中；阶段指标与总体状态不可相加。${platform(s)||maker(s)?'已终止包括当前终止记录与已终止的承制合作；回库重新匹配的剧本仍按当前阶段统计，历史合作单独留档。':'承制合作终止并回库后，剧本继续按待分配／待立项统计，不计为剧本终止。'}拒选、超时及撤回不计为项目终止。</p></div></details><section class="panel dashboard-details"><div class="table-toolbar"><h3>${E(labels[metric]||'全部记录')} <span>${list.length} 项</span></h3><form id="dashboard-filters" class="dashboard-search"><input name="dashboardKeyword" aria-label="搜索看板剧名或编号" placeholder="搜索剧名 / 编号" value="${E(s.ui.dashboardKeyword||'')}"><button class="btn primary" type="submit">搜索</button>${button('重置','dashboard-clear')}</form></div><div class="table-wrap"><table><thead><tr><th>剧本 / 项目名称</th><th>当前进度</th>${platform(s)?'<th>剧本来源</th>':''}<th>操作</th></tr></thead><tbody>${slice.map(r=>{const target=dashboardTarget(s,r),phaseName=r.phase==='reviewing'?'剧本审核中':labels[r.phase],extra=r.kind==='cooperation'?'承制合作已终止 · '+(r.archive.archivedAt||'时间未记录'):r.phase==='online'&&r.channelCount?`${r.onlineCount}/${r.channelCount} 个渠道已上线${r.onlineCount<r.channelCount?' · 其余渠道继续推进':''}`:r.phase==='scheduled'?'计划上线：'+r.project.schedule:r.phase==='developing'&&r.project.stage==='release'?'正片安审 / 物料与合同准备':'';return `<tr><td><strong>${E(r.title)}</strong><small>${E(r.id)}${r.kind==='cooperation'?' · 历史合作':''}</small></td><td>${badge(phaseName,r.ended?'red':r.phase==='online'?'green':'blue')}${extra?`<small>${E(extra)}</small>`:''}</td>${platform(s)?`<td>${r.source==='internal'?'内部剧本':'外部剧本'}</td>`:''}<td>${target?button(r.kind==='cooperation'?'查看终止记录':'查看详情',r.kind==='cooperation'?'dashboard-archive':'dashboard-open',r.id,'link',`data-value="${r.kind==='cooperation'?r.archiveIndex:''}"`):'<span class="muted">当前账号仅可查看进度</span>'}</td></tr>`;}).join('')}</tbody></table>${!slice.length?'<div class="empty"><span>▤</span><strong>暂无对应记录</strong><small>可切换指标或调整搜索条件</small></div>':''}</div><div class="pagination"><span>共 ${list.length} 项 · 每页 ${pageSize} 项</span>${button('‹','dashboard-page','','',`data-value="${page-1}" ${page===1?'disabled':''}`)}<span class="current-page">${page}</span>${button('›','dashboard-page','','',`data-value="${page+1}" ${page*pageSize>=list.length?'disabled':''}`)}</div></section>`;
}
