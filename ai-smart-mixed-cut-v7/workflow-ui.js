import {currentPreferences} from './feedback-model.js?v=20261009-update10';
import {modeLabel} from './engine.js?v=20261009-update10';
import {reviewable} from './workflow-model.js?v=20261009-update10';

export function outputStatus(o){
 if(o.reworkPending)return ['重新制作中','orange'];
 if(o.repairing)return ['修复中','orange'];
 if(['pending','checking'].includes(o.status))return [o.quality?.status==='repairing'?'自动修复中':o.quality?.status==='checking'?'自动检查中':'制作中','orange'];
 if(o.status==='failed')return [o.cancelled?'已取消':o.quality?.status==='failed'?'检查未通过':'制作失败','red'];
 if(o.status==='issue')return ['需处理','orange'];
 if(o.narrationDraft)return ['文案未应用',''];
 return o.confirmed&&o.confirmedVersion===o.contentVersion?['已确认','green']:['待确认',''];
}

export function outputTable(rows,{h,syncUI,selected=new Set(),selectionBatchId=null,operationId=null,selectable=false}){
 const {button,esc,tag,fmt}=h;
 const canSelect=(b,o)=>o.status==='ready'&&reviewable(o)&&!o.narrationDraft&&!syncUI.locked(b,o);
 const eligible=rows.filter(({b,o})=>b.id===operationId&&canSelect(b,o));
 const head=selectable?`<th class="select-col"><input type="checkbox" aria-label="全选当前制作任务在筛选结果内可选的素材" title="仅选择当前操作任务在筛选结果内的素材" data-action="select-all" ${operationId?`data-batch="${esc(operationId)}"`:''} ${eligible.length?'':'disabled'} ${eligible.length&&eligible.every(({o})=>selected.has(o.id))?'checked':''}></th>`:'';
 return `<div class="table-wrap output-table" id="materialsTable"><table class="materials-table"><thead><tr>${head}<th>素材</th><th>剧目名称</th><th>时长</th><th>素材同步</th><th>操作</th></tr></thead><tbody>${rows.map(({b,o,drama})=>{
  const [label,color]=outputStatus(o),attrs=`data-batch="${esc(b.id)}" data-id="${esc(o.id)}"`;
  const checkable=reviewable(o),confirmed=o.confirmed&&o.confirmedVersion===o.contentVersion,confirmable=canSelect(b,o)&&!confirmed;
  const title=drama?.title||b.sourceTitle,cover=drama?.source?.cover||'./assets/drama-confrontation.jpg';
  const primary=o.status==='failed'?button('补生成','retry-output','text-btn',attrs):o.status==='pending'?'':button('单条返工','rework','text-btn',attrs+(checkable&&!syncUI.locked(b,o)&&!o.narrationDraft?'':' disabled'));
  const cancel=o.status==='pending'?button('取消这条制作','cancel-one-generation','text-btn danger',attrs):'';
  return `<tr data-batch="${esc(b.id)}" data-output-id="${esc(o.id)}">${selectable?`<td class="select-col"><input type="checkbox" aria-label="选择素材 ${esc(o.title)}" data-batch="${esc(b.id)}" data-output="${esc(o.id)}" ${selectionBatchId===b.id&&selected.has(o.id)?'checked':''} ${canSelect(b,o)?'':'disabled'}></td>`:''}<td class="output-name"><div class="output-identity"><button class="output-thumb" data-action="review-item" ${attrs} aria-label="快速预览 ${esc(o.title)}" ${checkable?'':'disabled'}><img src="${esc(cover)}" alt="素材封面"><span>▶</span></button><div>${button(esc(o.title),'review-item','output-title',attrs+(checkable?'':' disabled'))}<p>${modeLabel({...b.config,mode:o.mode||b.config.mode})} · ${new Date(b.created).toLocaleString('zh-CN',{month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit'})}</p><details class="output-meta"><summary>详细信息</summary><p>任务 ${esc(b.id)}<br>素材 ${esc(o.id)} · V${o.contentVersion}<br>取材第 ${esc((o.episodes||[]).join('、'))} 集</p></details>${o.status==='failed'||o.status==='pending'||o.status==='issue'||o.repairing||o.reworkPending?`<small class="output-alert ${o.status==='failed'?'danger':''}">${esc(o.status==='issue'?(o.issues||[]).length+' 项质量问题待处理':label)}</small>`:`${o.narrationDraft?'<small class="output-alert">文案未应用</small>':''}${currentPreferences(o).length?'<small class="output-alert">有创作调整建议</small>':''}`}</div></div></td><td class="material-drama-name"><strong>${esc(title)}</strong></td><td class="mono">${fmt(o.duration)}</td><td>${syncUI.badgeFor(b,o)}</td><td><div class="result-actions">${confirmable?button('确认可用','confirm-row','text-btn',attrs):''}${primary}${syncUI.rowAction(b,o).replace('data-id=',`data-batch="${esc(b.id)}" data-id=`)}${cancel}</div></td></tr>`;
 }).join('')||`<tr><td colspan="${selectable?6:5}" class="task-empty-row">暂无符合条件的素材</td></tr>`}</tbody></table></div>`;
}

export function qualitySummary(o){
 const q=o.quality||{};
 const text=o.reworkPending?.kind==='narration'?'正在应用文案修改':o.reworkPending?'正在重新制作这一条':o.repairing||q.status==='repairing'?'正在修复':q.status==='checking'?'正在检查':q.status==='generating'?'正在制作':o.status==='issue'||q.status==='attention'?'有问题需处理':o.status==='failed'||q.status==='failed'?'制作未完成':'';
 return text?`<div class="qc-status" role="status"><strong>${text}</strong></div>`:'';
}
