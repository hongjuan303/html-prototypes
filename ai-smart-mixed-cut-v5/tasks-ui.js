import {modeLabel,isFullNarration,outputCost} from './engine.js?v=20260916-publish1';

export function renderTaskCards(batches,currentBatch,expanded,h,renderOutputs){
 const {button,esc,tag,sourceLabel}=h;
 if(!batches.length)return `<div class="empty"><h2>暂无符合条件的制作任务</h2><p>选择片源和制作方式，开始制作素材。</p>${button('制作素材','create','primary')}</div>`;
 return `<div class="task-list">${batches.map(b=>{
  const open=expanded&&b.id===currentBatch,cost=outputCost(b),generated=b.outputs.filter(o=>['ready','issue'].includes(o.status)).length,failed=b.outputs.filter(o=>o.status==='failed').length;
  const voice=b.config.mode==='narrated'?` · 解说 ${b.config.narrationSpeed||1}×`:'';
  return `<section class="task-card ${open?'is-open':''}" data-task-id="${esc(b.id)}"><div class="task-card-head"><button type="button" class="task-toggle" data-action="toggle-task" data-id="${esc(b.id)}" aria-expanded="${open}" aria-controls="outputs-${esc(b.id)}"><span class="task-chevron" aria-hidden="true">${open?'▾':'▸'}</span><span class="task-card-name"><strong>${esc(b.sourceTitle)}</strong><small>${modeLabel(b.config)} · 第 ${b.config.start}–${b.config.end} 集${isFullNarration(b.config)?'':' · 原片 '+b.config.speed+'×'}${voice}</small><small>${sourceLabel(b.config)} · ${new Date(b.created).toLocaleString('zh-CN',{month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit'})} · ${esc(b.id)}</small></span><span class="task-card-status">${tag(b.status==='running'?'制作中':failed?'部分未完成':'已完成',b.status==='running'||failed?'orange':'green')}<small>已生成 ${generated}/${b.outputs.length} · 已确认 ${cost.accepted}${failed?' · 失败 '+failed:''}</small></span></button>${button('再做一批','repeat-batch','text-btn',`data-id="${esc(b.id)}"`)}</div>${open?`<div class="task-outputs" id="outputs-${esc(b.id)}">${renderOutputs(b)}</div>`:''}</section>`;
 }).join('')}</div>`;
}
