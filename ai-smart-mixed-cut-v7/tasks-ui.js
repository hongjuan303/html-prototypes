import {outputTable} from './workflow-ui.js?v=20261027-update18a';
import {failureOf} from './production-tasks.js?v=20261027-update18a';
const confirmed=o=>o.status==='ready'&&o.confirmed&&o.confirmedVersion===o.contentVersion&&!o.narrationDraft;
export function materialMatches(o,c,f){
 if(!['ready','issue'].includes(o.status))return false;
 const mode=(o.mode||c.mode)==='original'?'highlight':(o.mode||c.mode),structure=o.narrationStructure||c.narrationStructure;
 if(f.mode==='highlight'&&mode!=='highlight')return false;if(f.mode==='narrated'&&mode!=='narrated')return false;if(['mixed','full'].includes(f.mode)&&(mode!=='narrated'||structure!==f.mode))return false;
 const running=o.status==='pending'||o.reworkPending||o.repairing;
 if(f.status==='running')return !!running;if(f.status==='review')return ['ready','issue'].includes(o.status)&&!confirmed(o);if(f.status==='confirmed')return confirmed(o);if(f.status==='failed')return o.status==='failed'&&!o.cancelled;if(f.status==='cancelled')return !!o.cancelled;return true;
}
export function renderMaterials(rows,{h,syncUI,selected,selectionBatchId,selectedRows,canSelect}){
 const {button,esc}=h,operationId=selectionBatchId||rows.find(({b,o})=>canSelect(b,o))?.b.id,b=rows.find(row=>row.b.id===selectionBatchId)?.b,attrs=b?`data-batch="${esc(b.id)}"`:'';
 const confirmable=selectedRows.length&&selectedRows.every(o=>o.status==='ready'&&!o.narrationDraft&&!o.reworkPending&&!o.repairing),syncable=b&&selectedRows.length&&selectedRows.every(o=>syncUI.canSync(b,o)),retryable=selectedRows.length&&selectedRows.every(o=>o.status==='failed'&&!o.cancelled&&!o.replacementJobId&&failureOf(o).retryable);
 const tools=selectedRows.length?`<div class="materials-selection" id="materialsToolbar"><span>已选 <b>${selectedRows.length}</b> 条 · 同一任务</span><div class="actions">${button('确认可用','confirm-selected','secondary',attrs+(confirmable?'':' disabled'))}${button('同步 '+selectedRows.length+' 条','sync-open-selected','primary',attrs+(syncable?'':' disabled'))}${button('下载','download-selected','secondary',attrs+(confirmable?'':' disabled'))}${button('取消选择','clear-selection','text-btn')}</div></div>`:'';
 return tools+outputTable(rows,{h,syncUI,selected,selectionBatchId,operationId,selectable:true})+`<div class="table-footer" id="materialsFooter"><span>共 ${rows.length} 条素材</span></div>`;
}
