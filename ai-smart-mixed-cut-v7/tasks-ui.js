import {reviewable} from './workflow-model.js?v=20261008-interaction1';
import {modeLabel,isFullNarration,outputCost,speedSummary} from './engine.js?v=20261008-interaction1';

export function renderTaskCards(batches,currentBatch,expanded,h,renderOutputs){
 const {button,esc,tag,sourceLabel}=h;
 if(!batches.length)return `<div class="empty"><h2>暂无符合条件的制作任务</h2><p>选择片源和制作方式，开始制作素材。</p>${button('制作素材','create','primary')}</div>`;
 return `<div class="task-list">${batches.map(b=>{
  const open=expanded&&b.id===currentBatch,cost=outputCost(b),generated=b.outputs.filter(o=>['ready','issue'].includes(o.status)).length,failed=b.outputs.filter(o=>o.status==='failed').length;
  const running=['running','checking'].includes(b.status)||b.outputs.some(o=>['pending','checking'].includes(o.status)||o.reworkPending||o.repairing),rework=b.outputs.some(o=>o.reworkPending),checking=b.outputs.some(o=>['checking','repairing'].includes(o.quality?.status));
  const status=rework?'单条重做中':checking?'自动质检中':running?'制作中':failed?'部分未完成':'已完成';
  const actual=Math.max(0,(Number(b.cost.analysis)||0)+(Number(b.cost.production)||0)-(Number(b.cost.refunded)||0)),frozen=Number(b.cost.frozen)||0;

  return `<section class="task-card ${open?'is-open':''}" data-task-id="${esc(b.id)}"><div class="task-card-head"><button type="button" class="task-toggle" data-action="toggle-task" data-id="${esc(b.id)}" aria-expanded="${open}" aria-controls="outputs-${esc(b.id)}" title="批次：${esc(b.id)}"><span class="task-chevron" aria-hidden="true">${open?'▾':'▸'}</span><span class="task-card-name"><strong>${esc(b.sourceTitle)}</strong><small>${modeLabel(b.config)} · 第 ${b.config.start}–${b.config.end} 集 · ${speedSummary(b.config)}</small><small>${sourceLabel(b.config)} · ${new Date(b.created).toLocaleString('zh-CN',{month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit'})}</small></span><span class="task-card-status">${tag(status,running||failed?'orange':'green')}<small>已生成 ${generated}/${b.outputs.length} · 已确认 ${cost.accepted}${failed?' · 失败 '+failed:''}</small><small>实际扣除 ${actual} 积分${frozen?' · 冻结 '+frozen+' 积分':''}</small></span></button>${button('费用明细','batch-cost','text-btn',`data-id="${esc(b.id)}"`)}${(()=>{const next=b.outputs.find(o=>reviewable(o)&&(!o.confirmed||o.confirmedVersion!==o.contentVersion));return next?button('继续预览','review-item','secondary task-quick-review',`data-batch="${esc(b.id)}" data-id="${esc(next.id)}"`):'';})()}${button('再做一批','repeat-batch','text-btn',`data-id="${esc(b.id)}"`)}</div>${open?`<div class="task-outputs" id="outputs-${esc(b.id)}">${renderOutputs(b)}</div>`:''}</section>`;
 }).join('')}</div>`;
}
