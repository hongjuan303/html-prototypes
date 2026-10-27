import {collectionNumber} from './sources.js?v=20261027-update18a';
import {productionTime} from './material-identity.js?v=20261027-update18a';
import {failureOf} from './production-tasks.js?v=20261027-update18a';
import {currentPreferences} from './feedback-model.js?v=20261027-update18a';
import {modeLabel} from './engine.js?v=20261027-update18a';
import {reviewable} from './workflow-model.js?v=20261027-update18a';

export function outputStatus(o){
 if(o.status==='pending')return ['制作中','orange'];
 if(o.cancelled)return ['已取消',''];if(o.status==='failed')return ['失败','red'];
 return o.confirmed&&o.confirmedVersion===o.contentVersion&&!o.narrationDraft&&o.status==='ready'?['已确认','green']:['待确认',''];
}
export function outputTable(rows,{h,syncUI,selected=new Set(),selectionBatchId=null,operationId=null,selectable=false}){
 const {button,esc,tag,fmt}=h;
 const canSelect=(b,o)=>(o.status==='failed'&&!o.cancelled&&!o.replacementJobId)||(o.status==='ready'&&reviewable(o)&&!o.narrationDraft&&!syncUI.locked(b,o));
 const eligible=rows.filter(({b,o})=>b.id===operationId&&canSelect(b,o));
 return `<div class="table-wrap output-table" id="materialsTable"><table class="materials-table"><thead><tr><th class="select-col"><input type="checkbox" aria-label="全选当前任务可选素材" data-action="select-all" ${operationId?`data-batch="${esc(operationId)}"`:''} ${eligible.length?'':'disabled'} ${eligible.length&&eligible.every(({o})=>selected.has(o.id))?'checked':''}></th><th>素材名称</th><th>剧目名称</th><th>制作时间</th><th>时长</th><th>状态</th><th>操作</th></tr></thead><tbody>${rows.map(({b,o,drama})=>{
 const [label,color]=outputStatus(o),attrs=`data-batch="${esc(b.id)}" data-id="${esc(o.id)}"`,checkable=reviewable(o),confirmed=o.confirmed&&o.confirmedVersion===o.contentVersion;
 const available=canSelect(b,o)&&o.status==='ready',failed=o.status==='failed'&&!o.cancelled,f=failureOf(o);
 let actions='';
 if(failed)actions=button('查看原因','failure-detail','text-btn',attrs)+(o.replacementJobId?button('查看重做任务','view-job','text-btn',`data-job="${o.replacementJobId}"`):button(f.action,f.retryable?'retry-output':'adjust-failed','text-btn',attrs));
 else if(o.status==='pending')actions='';
 else if(o.cancelled)actions=button('重新制作','adjust-failed','text-btn',attrs);
 else actions=button('预览','review-item','text-btn',attrs+(checkable?'':' disabled'))+button('下载','download-one','text-btn',attrs+(checkable?'':' disabled'));
 const source=drama?.config.source||b.config.source,title=drama?.title||b.sourceTitle;
 const note=failed?f.label:o.cancelled?'':o.narrationDraft?'文案未应用':o.status==='issue'?'有质量问题待处理':o.reworkPending?'正在重新制作':o.repairing?'正在修复':'';
 return `<tr data-batch="${esc(b.id)}" data-output-id="${esc(o.id)}"><td class="select-col"><input type="checkbox" aria-label="选择素材 ${esc(o.title)}" data-batch="${esc(b.id)}" data-output="${esc(o.id)}" ${selectionBatchId===b.id&&selected.has(o.id)?'checked':''} ${canSelect(b,o)?'':'disabled'}></td><td class="output-name"><div class="output-identity"><button class="output-thumb" data-action="review-item" ${attrs} aria-label="预览 ${esc(o.title)}" ${checkable?'':'disabled'}>${checkable?`<img src="${esc(drama?.source.cover||'./assets/drama-confrontation.jpg')}" alt="素材封面"><span>▶</span>`:'<span class="pending-thumb">▹</span>'}</button><div>${button(esc(o.title),'review-item','output-title',attrs+(checkable?'':' disabled'))}</div></div></td><td class="material-drama-name"><strong>${esc(title)}</strong><small>${source.kind==='green'?(source.market==='domestic'?'国内合集':'海外合集')+' · '+esc(collectionNumber(source.collectionId)):'本地上传'}</small></td><td class="production-time">${esc(productionTime(b.productionCreatedAt||b.created))}</td><td class="mono">${['ready','issue'].includes(o.status)?fmt(o.duration):'—'}</td><td class="material-status">${tag(label,color)}${note?`<small>${esc(note)}</small>`:''}</td><td><div class="result-actions">${actions}</div></td></tr>`;
 }).join('')}</tbody></table></div>`;
}

export function qualitySummary(o){
 const q=o.quality||{};
 const text=o.reworkPending?.kind==='narration'?'正在应用文案修改':o.reworkPending?'正在重新制作这一条':o.repairing||q.status==='repairing'?'正在修复':q.status==='checking'?'正在检查':q.status==='generating'?'正在制作':o.status==='issue'||q.status==='attention'?'有问题需处理':o.status==='failed'||q.status==='failed'?'制作未完成':'';
 return text?`<div class="qc-status" role="status"><strong>${text}</strong></div>`:'';
}
