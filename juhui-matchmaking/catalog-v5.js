import * as M from './model-v2.js?v=20261106-test-scenarios';
import * as A from './access-v3.js?v=20261106-test-scenarios';
import * as N from './navigation-v2.js?v=20261106-test-scenarios';
import {projectTasks} from './tasks-v7.js?v=20261106-test-scenarios';

export function canBatchMatch(s,p){
 return s.ui.system==='platform'&&s.ui.business==='matching'&&!!p&&p.stage==='matching'&&!!p.grade&&!!p.producer&&!!p.card&&!!p.full&&!p.selected&&p.quality?.status==='approved'&&p.safety?.status==='approved'&&A.canFor(s,p,'producer');
}

export function catalog(s,h){
 const {E,heading,field,button,link,badge,stage,listNavigation,empty}=h;
 const library=s.ui.view==='library',rows=N.rows(s),batch=library&&s.ui.listTab==='matching';
 const eligible=batch?rows.filter(p=>canBatchMatch(s,p)):[],selected=new Set((s.ui.batchIds||[]).filter(id=>eligible.some(p=>p.id===id)));
 s.ui.page=Math.min(s.ui.page,Math.max(1,Math.ceil(rows.length/8)));
 const status=p=>badge(M.libraryStatuses[M.libraryStatus(p)],p.selected?'green':p.stage==='ended'?'red':'orange');
 const matchSummary=p=>p.selected?M.nameOf(s,p.selected):!p.grade?'评级后匹配':!p.producer?'评级时补充制片':p.offers.some(o=>o.status==='pending')?'已推送 '+p.offers.filter(o=>o.status==='pending').length+' 家 · 待选本':p.offers.length?'暂无有效推送 · 待重新匹配':'尚未推送';
 const libraryActions=p=>[
  M.canRate(s,p)?link('评级','grade',p.id):'',
  p.stage==='matching'&&p.producer&&A.canFor(s,p,'producer')?link('匹配承制方','library-match',p.id):'',
  p.stage==='matching'&&p.producer&&!A.canFor(s,p,'producer')?link('匹配进度','library-match',p.id):'',
  p.selected&&N.canOpenProject(s,p)?link('查看撮合项目','open-matching-project',p.id):''
 ].join('');
 const rowTasks=new Map(rows.map(p=>[p.id,projectTasks(s,p)]));
 const productionLabels=['人物及场景资产','一卡demo','全集初稿'];
 const productionStatuses={none:['待提交',''],pending:['待审核','blue'],approved:['审核通过','green'],revision:['审核驳回','orange'],resubmit:['待修改','orange'],waiting:['待制片复审','orange']};
 const materialStatuses={none:['待上传',''],draft:['草稿',''],pending:['待核验','blue'],approved:['已确认','green'],revision:['待修改','orange']};
 const progressBadge=(statuses,status)=>{const [label,color]=Object.hasOwn(statuses,status)?statuses[status]:['状态待确认','orange'];return badge(label,color);};
 const productionProgress=p=>`<div class="project-production-progress">${stage(p)}<div class="production-status-list">${productionLabels.map((name,index)=>{
  const item=p.production?.[index]||{status:'none'},task=(rowTasks.get(p.id)||[]).find(t=>t.action==='production'&&Number(t.value)===index),state=progressBadge(productionStatuses,item.status);
  return `<div class="project-status-row"><span>${name}</span>${task?button(state,'task-work',p.id,'link project-status-link',`data-value="${E(task.key)}" aria-label="${E(task.label)}"`):state}</div>`;
 }).join('')}</div></div>`;
 const materialProgress=p=>`<div class="project-material-progress">${[['scriptMaterial','剧本物料','confirmScript'],['makerMaterial','制作物料','confirmMaker']].map(([key,name,action])=>{
  const material=p[key]||{status:'none'},task=material.status==='pending'?(rowTasks.get(p.id)||[]).find(t=>t.action===action):null,state=progressBadge(materialStatuses,material.status);
  return `<div class="project-status-row"><span>${name}</span>${button(state,task?'task-work':'material-view',p.id,'link project-status-link',`data-value="${E(task?task.key:key)}" aria-label="${E((task?'核验':'查看')+name)}"`)}</div>`;
 }).join('')}</div>`;
 const pending=p=>{const tasks=rowTasks.get(p.id)||[];return tasks.length?`<strong>${tasks.length} 项待办</strong><small>${E(tasks[0].label)}${tasks.length>1?' 等':''}</small>`:'<span class="muted">暂无我的待办</span>';};
 const projectActions=p=>{
  const tasks=rowTasks.get(p.id)||[],productionTasks=tasks.filter(t=>t.action==='production'),first=productionTasks[0]||tasks[0],extra=[];
  if(M.canRenameProject(s,p))extra.push(link('修改项目名称','rename-project',p.id));
  if(!['online','ended'].includes(p.stage)){
   const confirmations=p.termination?.confirmations||[];
   if(A.canFor(s,p,'prodBusiness')&&!confirmations.includes('business')||A.canFor(s,p,'manager')&&!confirmations.includes('manager'))extra.push(link('终止合作确认','terminate',p.id));
   if(A.canFor(s,p,'manager')&&confirmations.includes('business')&&confirmations.includes('manager'))extra.push(link('完成合作处理','unlock',p.id));
  }
  if(A.canFor(s,p,'schedule')&&['scheduling','online'].includes(p.stage)&&p.schedule)extra.push(link('调整排期 / 增加渠道','release-schedule',p.id));
  const more=extra.length?`<details class="row-menu"><summary>更多</summary><div class="row-menu-items">${extra.join('')}</div></details>`:'';
  const primaryLabel=productionTasks.length?`制作审核（${productionTasks.length}）`:tasks.length===1?E(first.label):`处理待办（${tasks.length}）`;
  return (first?button(primaryLabel,'task-work',p.id,'link primary-task',`data-value="${E(first.key)}"`):'')+more||'<span class="muted">—</span>';
 };
 const title=library?'剧本库':'撮合管理';
 let html=heading(title,library?'评级时确定题材与项目制片，再匹配承制方。已匹配剧本保留档案并关联撮合项目。':'管理已确定承制方的项目，跟进制作交付、发行准备与排播上线。');
 html+=listNavigation();
 html+=`<section class="panel filter-panel"><form id="filters">${field(library?'剧本名称 / ID':'项目名称 / 原剧本名称 / ID','keyword',s.ui.keyword)}${field('剧本来源','source',s.ui.source,{select:[['','全部来源'],['external','外部剧本'],['internal','内部自有剧本']],placeholder:false})}<div class="filter-actions"><button class="btn primary">搜索</button>${button('重置','clear')}</div></form></section>`;
 const headers=library?['剧本名称','来源 / 剧本方','评级 / 题材','入库进度','项目制片','承制方 / 匹配情况','剧本商务','操作']:['项目名称','承制方','项目制片','制作进度','物料进度','我的待办','操作'];
 const batchTools=batch?`<div class="actions batch-actions"><span class="muted">已选 ${selected.size} 项</span>${selected.size?button('取消选择','batch-clear','','text'):''}${button('匹配承制方','batch-match','','primary',selected.size?'':'disabled')}</div>`:'';
 const batchHeader=batch?`<th class="batch-select-col"><input type="checkbox" data-batch-all aria-label="选择当前筛选的全部可匹配剧本" ${eligible.length&&selected.size===eligible.length?'checked':''} ${selected.size&&selected.size<eligible.length?'data-batch-partial="true"':''} ${eligible.length?'':'disabled'}></th>`:'';
 const taskFilter=!library?`<label class="task-only"><input type="checkbox" data-task-only ${s.ui.taskOnly?'checked':''}>只看我的待办</label>`:'';
 html+=`<section class="panel"><div class="table-toolbar"><h3>${library?'剧本列表':'项目列表'} <span>${rows.length} 项</span></h3>${batchTools}${taskFilter}</div><div class="table-wrap"><table class="catalog-table ${library?'library-table':'management-table'}${batch?' has-batch':''}"><thead><tr>${batchHeader}${headers.map(t=>`<th>${t}</th>`).join('')}</tr></thead><tbody>`;
 html+=rows.slice((s.ui.page-1)*8,s.ui.page*8).map(p=>library?`<tr>${batch?`<td class="batch-select-col"><input type="checkbox" data-batch-project="${E(p.id)}" aria-label="选择剧本 ${E(p.name)}" ${selected.has(p.id)?'checked':''} ${canBatchMatch(s,p)?'':'disabled'}></td>`:''}<td><button class="title-link" data-action="detail" data-id="${E(p.id)}">${E(p.name)}</button><small>${E(p.id)} · ${p.episodes}集</small></td><td>${badge(p.source==='internal'?'内部自有':'外部剧本')}<small>${E(M.nameOf(s,p.supplier))}</small></td><td>${p.grade?badge(p.grade,'grade'):badge('待评级')}<small>${p.grade?E(p.tags.join(' / ')):'评级时确认题材'}</small></td><td>${status(p)}</td><td>${E(p.producer||'待分配')}</td><td>${E(matchSummary(p))}</td><td>${E(p.business||'—')}</td><td><div class="catalog-actions">${libraryActions(p)}</div></td></tr>`:`<tr><td><button class="title-link" data-action="detail" data-id="${E(p.id)}">${E(M.projectName(p))}</button><small>${E(p.id)}</small>${M.projectName(p)!==p.name?`<small>原剧本：${E(p.name)}</small>`:''}</td><td>${E(M.nameOf(s,p.selected))}</td><td>${E(p.producer||'待分配')}</td><td>${productionProgress(p)}</td><td>${materialProgress(p)}</td><td class="project-pending">${pending(p)}</td><td><div class="catalog-actions">${projectActions(p)}</div></td></tr>`).join('');
 html+=`</tbody></table>${rows.length?'':empty(library?'暂无符合条件的剧本':'暂无符合条件的撮合项目')}</div><div class="pagination"><span>共 ${rows.length} 条 · 每页 8 条</span>${button('‹','page','','',`data-page="${Math.max(1,s.ui.page-1)}" ${s.ui.page===1?'disabled':''}`)}<span class="current-page">${s.ui.page}</span>${button('›','page','','',`data-page="${s.ui.page+1}" ${s.ui.page*8>=rows.length?'disabled':''}`)}</div></section>`;
 return html;
}
