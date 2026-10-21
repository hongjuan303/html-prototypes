import {taskEntries} from './production-tasks.js?v=20261021-update14s';
import {dramaKey} from './dramas.js?v=20261021-update14s';
import {productionTime} from './material-identity.js?v=20261021-update14s';
import {modeLabel,normalizeCreationConfig} from './engine.js?v=20261021-update14s';

export const TASK_STATUS={running:'剪辑中',done:'已完成',partial:'部分失败',failed:'已失败'};
export const GENERATION_ERROR='生成异常，请联系技术排查';
export const taskFailureMessage=j=>j.status==='failed'?GENERATION_ERROR:'部分生成异常，请联系技术排查';
export function emptyCreationConfig(){return normalizeCreationConfig({source:{kind:'empty'},start:null,end:null,count:null,outputSpeed:null,speed:null,durationMinSeconds:null,durationMaxSeconds:null,bgm:false,bgmSource:'smart',bgmTrack:'auto',bgmLocal:null,title:false,titleText:''});}
export function ensureTaskVersions(state){
 const counters=new Map();
 for(const j of [...taskEntries(state)].reverse()){
  const key=dramaKey(j.config),version=Number.isInteger(j.taskVersion)&&j.taskVersion>0?j.taskVersion:(counters.get(key)||0)+1;
  counters.set(key,Math.max(counters.get(key)||0,version));
  const job=(state.productionJobs||[]).find(x=>x.id===j.id),batch=state.batches.find(x=>x.id===j.batchId);
  if(job)job.taskVersion=version;if(batch)batch.taskVersion=version;
 }
}
export function taskCards(state){
 return taskEntries(state).map(j=>{
  const batch=state.batches.find(b=>b.id===j.batchId),requested=Number(j.requestedCount)||0;
  const running=Boolean(j.running),success=j.success||0;
  const status=running?'running':success>=requested&&requested>0?'done':success?'partial':'failed';
  const times=[j.completedAt,batch?.completedAt,...(batch?.outputs||[]).flatMap(o=>[o.generatedAt,o.quality?.checkedAt]),...(state.ledger||[]).filter(x=>x.batch===batch?.id&&x.id===batch?.id+'-settled').map(x=>x.at)].filter(Boolean).sort();
  return {...j,success,requestedCount:requested,status,label:TASK_STATUS[status],taskVersion:j.taskVersion||batch?.taskVersion||1,completedAt:running?'':times.at(-1)||'',batch};
 });
}
export function taskListPage(state,filters,{page=1,pageSize=10}={}){
 const all=taskCards(state).filter(j=>(filters.drama==='all'||dramaKey(j.config)===filters.drama)&&(filters.mode==='all'||j.config.mode===filters.mode)&&(filters.status==='all'||j.status===filters.status));
 pageSize=[10,20,50].includes(Number(pageSize))?Number(pageSize):10;
 const pages=Math.max(1,Math.ceil(all.length/pageSize));page=Math.max(1,Math.min(pages,Number(page)||1));
 return {items:all.slice((page-1)*pageSize,page*pageSize),total:all.length,page,pageSize,pages};
}
export function renderTaskCards(p,h){
 const {esc,button}=h;
 const card=j=>`<article class="task-card" data-task-id="${esc(j.id)}"><div class="task-card-content"><div class="task-card-title"><h2 title="${esc(j.sourceTitle)}">${esc(j.sourceTitle)}</h2><span class="task-version">V${j.taskVersion}</span><span class="tag">${esc(modeLabel(j.config))}</span><span class="task-status ${j.status}">${j.label}</span></div><div class="task-card-meta"><span>第 ${j.config.start}～${j.config.end} 集</span><span>创建：${esc(productionTime(j.created))}</span><span>完成：${j.completedAt?esc(productionTime(j.completedAt)):'—'}</span></div>${['partial','failed'].includes(j.status)?`<p class="task-error">${taskFailureMessage(j)}</p>`:''}</div><div class="task-card-actions"><span class="task-count">已完成 <b>${j.success}/${j.requestedCount}</b> 条</span>${button('查看详情','task-detail','text-btn',`data-job="${esc(j.id)}"`)}</div></article>`;
 const pagination=p.total?`<nav class="task-pagination" id="taskPagination" aria-label="剪辑任务分页"><span>共 ${p.total} 个任务</span><select id="taskPageSize" aria-label="每页任务数">${[10,20,50].map(n=>`<option value="${n}" ${n===p.pageSize?'selected':''}>${n} 条/页</option>`).join('')}</select><div>${button('上一页','task-page','secondary',`data-page="${p.page-1}" ${p.page===1?'disabled':''}`)}<span>${p.page} / ${p.pages}</span>${button('下一页','task-page','secondary',`data-page="${p.page+1}" ${p.page===p.pages?'disabled':''}`)}</div></nav>`:'';
 return `<section class="task-card-list" id="taskCardList">${p.items.map(card).join('')||'<div class="empty"><h2>暂无符合条件的任务</h2><p>提交剪辑后，可在这里查看任务进度。</p></div>'}</section>`+pagination;
}
export function renderTaskDetail(j,h){
 const {esc,button,heading,fmt}=h;
 const outputs=(j.batch?.outputs||[]).filter(o=>['ready','issue'].includes(o.status));
 return heading(j.sourceTitle,'',button('返回任务列表','back-tasks'))+`<section class="task-detail-summary" id="taskSummary"><div class="task-card-title"><span class="task-version">V${j.taskVersion}</span><span class="tag">${esc(modeLabel(j.config))}</span><span class="task-status ${j.status}">${j.label}</span><span class="task-count">已完成 <b>${j.success}/${j.requestedCount}</b> 条</span></div><div class="task-card-meta"><span>第 ${j.config.start}～${j.config.end} 集</span><span>创建：${esc(productionTime(j.created))}</span><span>完成：${j.completedAt?esc(productionTime(j.completedAt)):'—'}</span></div>${j.failed||['partial','failed'].includes(j.status)?`<p class="task-error" role="status">${taskFailureMessage(j)}</p>`:''}</section><section id="taskMaterials"><div class="section-heading"><h2>成片素材</h2></div>${outputs.length?`<div class="table-wrap"><table class="task-material-table"><thead><tr><th>素材名称</th><th>时长</th><th>操作</th></tr></thead><tbody>${outputs.map(o=>`<tr><td>${button(esc(o.title),'review-item','text-btn material-name-link',`data-batch="${esc(j.batchId)}" data-id="${esc(o.id)}" title="${esc(o.title)}"`)}</td><td>${fmt(o.duration)}</td><td><div class="row-actions">${button('下载','download-one','text-btn',`data-batch="${esc(j.batchId)}" data-id="${esc(o.id)}"`)}</div></td></tr>`).join('')}</tbody></table></div>`:`<div class="empty">${j.status==='running'?'视频生成中，成功素材将显示在这里。':'暂无成功素材'}</div>`}</section>`;
}
