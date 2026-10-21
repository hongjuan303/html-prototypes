import {dramaKey} from './dramas.js?v=20261021-update14s';
import {clone,modeLabel} from './engine.js?v=20261021-update14s';
import {resolveSource} from './sources.js?v=20261021-update14s';
import {nextTaskNumber,productionTime} from './material-identity.js?v=20261021-update14s';
export const JOB_STAGES={analyzing:'分析片源',planning:'编排内容',waiting:'待确认条数',generating:'制作中',failed:'已失败',cancelled:'已取消',done:'已完成'};
export const FAILURE_TYPES={
 timeout:{label:'生成服务暂时异常',action:'重试',retryable:true,help:'服务暂时异常，可按原参数重试。'},
 source:{label:'片源无法读取',action:'处理片源',retryable:false,help:'核对问题剧集及访问权限，修正后只重做失败项。'},
 config:{label:'BGM或配音配置不可用',action:'修改配置',retryable:false,help:'更换不可用的BGM或配音后，只重做失败项。'},
 content:{label:'剧情不足以完成制作',action:'调整制作',retryable:false,help:'增加取材剧集，或缩短成片、解说时长。'},
 quality:{label:'自动修复后仍未通过',action:'重试修复',retryable:true,help:'重新处理此条，其他成片不受影响。'}
};
export function failureOf(o){const kind=o.failure?.kind||'timeout';return {...FAILURE_TYPES[kind],...o.failure,kind};}
export const failedOutputs=b=>(b?.outputs||[]).filter(o=>o.status==='failed'&&!o.cancelled);
export function failedRevision(o){if(o.reworkPending||o.repairing)return null;const failures=[['narration',o.lastNarrationResult],['rework',o.lastReworkResult]].filter(([,r])=>r?.success===false&&r.version===o.contentVersion&&!(o.dismissedRevisionFailures||[]).includes(r.operationId));return failures[0]?.[0]||null;}
export function newJob(state,config,scenario='normal',replacement=null){
 const number=nextTaskNumber(state),j={id:number,number,config:clone(config),created:new Date().toISOString(),sourceTitle:resolveSource(config)?.title||'本地剧目',requestedCount:config.count,stage:'analyzing',scenario,analysisSettled:false,replacement:replacement?clone(replacement):null};
 j.taskVersion=Math.max(0,...taskEntries(state).filter(x=>dramaKey(x.config)===dramaKey(config)).map(x=>x.taskVersion||1))+1;
 (state.productionJobs||=[]).unshift(j);return j;
}
export function jobForBatch(state,b){return (state.productionJobs||[]).find(j=>j.batchId===b.id);}
export function taskEntries(state){
 const fromBatch=(b,j)=>{const outputs=b.outputs,failed=failedOutputs(b),outstanding=failed.filter(o=>!o.replacementJobId&&!o.failureDismissed),reworkFailed=outputs.filter(failedRevision),running=outputs.filter(o=>o.status==='pending'||o.reworkPending||o.repairing);return {...j,id:j?.id||b.id,number:j?.number||b.taskNumber,taskVersion:j?.taskVersion||b.taskVersion,completedAt:j?.completedAt||b.completedAt,batchId:b.id,config:b.config,sourceTitle:b.sourceTitle,created:j?.created||b.productionCreatedAt||b.created,requestedCount:j?.requestedCount||b.config.count,actualCount:outputs.length,success:outputs.filter(o=>['ready','issue'].includes(o.status)).length,failed:failed.length,unhandled:outstanding.length,reworkFailed:reworkFailed.length,cancelled:outputs.filter(o=>o.cancelled).length,running:running.length,generatingCount:outputs.filter(o=>o.status==='pending').length,revisionRunning:outputs.filter(o=>o.reworkPending||o.repairing).length,stage:running.length?'generating':outstanding.length||reworkFailed.length?'failed':'done',needsAttention:outstanding.length+reworkFailed.length>0};};
 const jobs=(state.productionJobs||[]).map(j=>{const b=state.batches.find(b=>b.id===j.batchId);return b?fromBatch(b,j):{...j,actualCount:0,success:0,failed:0,unhandled:0,reworkFailed:0,running:['analyzing','planning'].includes(j.stage)?1:0,needsAttention:['failed','waiting'].includes(j.stage)&&!j.dismissed&&!j.replacementJobId};});
 return [...jobs,...state.batches.filter(b=>!jobs.some(j=>j.batchId===b.id)).map(b=>fromBatch(b))].sort((a,b)=>b.created.localeCompare(a.created)||Number(b.number)-Number(a.number));
}
const isActiveTask=j=>!j.dismissed&&!j.replacementJobId&&(j.running>0||j.needsAttention);
export const activeTasks=state=>taskEntries(state).filter(isActiveTask);
export function taskLabel(j){
 if(j.running)return JOB_STAGES[j.stage]||'制作中';
 if(j.stage==='waiting')return JOB_STAGES.waiting;
 if(j.stage==='cancelled'||(j.actualCount>0&&j.cancelled===j.actualCount))return '已取消';
 if(j.reworkFailed)return '重做失败';
 if(j.failed||j.stage==='failed')return j.success?'部分失败':'已失败';
 if(j.replacementJobId)return '已发起重做';
 if(j.cancelled)return '部分取消';
 return JOB_STAGES[j.stage]||'状态待更新';
}
export const PROGRESS_PAGE_SIZES=[10,20,50];
export function progressPage(state,{page=1,pageSize=10}={}){
 pageSize=PROGRESS_PAGE_SIZES.includes(Number(pageSize))?Number(pageSize):10;
 const entries=taskEntries(state),active=entries.filter(isActiveTask),history=entries.filter(j=>!isActiveTask(j)),ordered=[...active,...history];
 const total=ordered.length,pages=Math.max(1,Math.ceil(total/pageSize));
 page=Math.max(1,Math.min(pages,Number.isInteger(Number(page))?Number(page):1));
 const items=ordered.slice((page-1)*pageSize,page*pageSize);
 return {page,pageSize,total,pages,activeCount:active.length,historyCount:history.length,items,ordered};
}
export function progressPagination(p,{button}){
 if(!p.total)return button('关闭','close');
 return `<nav id="progressPagination" class="progress-pagination" aria-label="制作进度分页"><div class="progress-page-meta"><span>共 ${p.total} 个任务</span><select id="progressPageSize" aria-label="每页任务数">${PROGRESS_PAGE_SIZES.map(n=>`<option value="${n}" ${n===p.pageSize?'selected':''}>${n} 条/页</option>`).join('')}</select></div><div class="progress-page-controls">${button('上一页','progress-page','secondary',`data-page="${p.page-1}" ${p.page===1?'disabled':''}`)}<label>第 <input id="progressPageNumber" type="number" min="1" max="${p.pages}" step="1" value="${p.page}" aria-label="跳转到第几页"> / ${p.pages} 页</label>${button('下一页','progress-page','secondary',`data-page="${p.page+1}" ${p.page===p.pages?'disabled':''}`)}</div></nav>`;
}
export function progressLine(state,id,{button,esc}){
 const j=taskEntries(state).find(j=>j.id===id||j.batchId===id);if(!j)return '';
 return `<div class="task-progress-line" id="taskProgressLine"><div><span>任务 ${esc(j.number)} 的成片</span></div>${button('清除任务筛选','clear-task-scope','text-btn')}</div>`;
}
export function progressDrawer(state,h,p=progressPage(state)){
 const {button,esc}=h,active=p.items.filter(isActiveTask),recent=p.items.filter(j=>!isActiveTask(j));
 const card=j=>`<article class="production-job" data-job-id="${esc(j.id)}"><div class="production-job-heading"><strong>${esc(j.sourceTitle)}</strong><span class="tag ${isActiveTask(j)&&j.needsAttention?'orange':''}">${taskLabel(j)}</span></div><p>任务 ${esc(j.number)} · ${esc(modeLabel(j.config))}</p><small>${esc(productionTime(j.created))}</small><div class="job-counts">${j.actualCount?`成功 <b>${j.success}</b> / ${j.actualCount} 条${j.failed?' · 失败 '+j.failed:''}${j.generatingCount?' · 制作中 '+j.generatingCount:''}${j.revisionRunning?' · 重做中 '+j.revisionRunning:''}${j.cancelled?' · 已取消 '+j.cancelled:''}${j.reworkFailed?' · 重做失败 '+j.reworkFailed:''}`:`计划 ${j.requestedCount} 条`}</div>${j.error?`<p class="error-text">${esc(j.error)}</p>`:''}<div class="production-job-actions">${j.success?button('查看成片','view-job','text-btn',`data-job="${esc(j.id)}"`):''}${j.actualCount&&(j.failed||j.reworkFailed)?button(isActiveTask(j)&&(j.unhandled+j.reworkFailed)>0?'处理失败（'+(j.unhandled+j.reworkFailed)+'）':'查看失败记录','handle-failures','secondary',`data-job="${j.id}"`):''}${isActiveTask(j)?`${j.stage==='waiting'?button('确认条数','job-capacity','primary',`data-job="${j.id}"`):''}${j.needsAttention&&!j.batchId&&j.stage!=='waiting'?button('处理失败','job-error','secondary',`data-job="${j.id}"`):''}${!j.running&&j.stage==='waiting'?button('取消任务','cancel-job-prompt','text-btn danger',`data-job="${j.id}"`):!j.running&&j.needsAttention?button('不再处理','dismiss-job-prompt','text-btn',`data-job="${j.id}"`):''}`:''}</div></article>`;
 const group=(title,jobs)=>jobs.length?`<section class="production-group"><h3>${title}</h3>${jobs.map(card).join('')}</section>`:'';
 return `<div id="productionProgressList">${group('制作中 / 需处理',active)}${group('历史任务',recent)}${p.total?'':`<div class="empty"><h2>暂无制作任务</h2><p>提交生成视频后，在这里查看进度和结果。</p>${button('制作素材','create','primary')}</div>`}</div>`;
}
