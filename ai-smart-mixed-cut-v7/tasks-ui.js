import {outputTable} from './workflow-ui.js?v=20261009-update11';

const currentConfirmed=o=>o.status==='ready'&&o.confirmed&&o.confirmedVersion===o.contentVersion&&!o.narrationDraft;
export function materialMatches(o,config,filters){
 const mode=o.mode||config.mode,normalized=mode==='original'?'highlight':mode;
 if(filters.mode!=='all'&&normalized!==filters.mode)return false;
 const running=['pending','checking'].includes(o.status)||o.reworkPending||o.repairing;
 if(filters.status==='running')return Boolean(running);
 if(filters.status==='review')return ['ready','issue'].includes(o.status)&&!currentConfirmed(o)&&!running;
 if(filters.status==='failed')return o.status==='failed';
 return true;
}

export function renderMaterials(rows,{h,syncUI,selected,selectionBatchId,selectedRows,canSelect}){
 const {button,esc}=h;
 const operationId=selectionBatchId||rows.find(({b,o})=>canSelect(b,o))?.b.id;
 const visibleSyncable=rows.some(({b,o})=>(!selectionBatchId||b.id===selectionBatchId)&&syncUI.canSync(b,o));
 const attrs=selectionBatchId?`data-batch="${esc(selectionBatchId)}"`:'';
 const confirmable=selectedRows.length&&selectedRows.every(o=>o.status==='ready');
 const selectedBatch=rows.find(({b})=>b.id===selectionBatchId)?.b;
 const syncable=selectedBatch&&selectedRows.length&&selectedRows.every(o=>syncUI.canSync(selectedBatch,o));
 return `<div class="toolbar materials-toolbar" id="materialsToolbar"><div class="actions">${button('选已确认未同步','select-syncable','text-btn',attrs+(visibleSyncable?'':' disabled'))}${button('确认选中可用','confirm-selected','secondary',attrs+(confirmable?'':' disabled'))}${button('同步选中素材','sync-open-selected','primary',attrs+(syncable?'':' disabled'))}</div></div>`
 +outputTable(rows,{h,syncUI,selected,selectionBatchId,operationId,selectable:true})
 +`<div class="table-footer" id="materialsFooter"><span>已选 ${selected.size} 条${selected.size?' · 同一制作任务':''}</span><details class="workflow-more"><summary>更多</summary>${button('导出选中方案','export-selected','text-btn',attrs+(selectedRows.length?'':' disabled'))}</details></div>`;
}
