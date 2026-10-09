import {compareContent} from './content-model.js?v=20261009-update11';
import {assetKey} from './engine.js?v=20261009-update11';

// Expose only actionable high similarity. Sharing one event alone is common
// for drama creatives and does not meet the model's duplicate condition.
export function similarMaterials(state,b,o){
 const source=assetKey(b.config),items=[];
 for(const otherBatch of state.batches||[]){
  if(assetKey(otherBatch.config)!==source)continue;
  for(const other of otherBatch.outputs||[]){
   if(otherBatch.id===b.id&&other.id===o.id||!['ready','issue'].includes(other.status))continue;
   const comparison=compareContent(o,other);
   if(comparison.duplicate)items.push({batch:otherBatch,output:other,...comparison});
  }
 }
 return items.sort((a,b)=>b.priority-a.priority);
}
export function contentSimilarity(state,b,o,{esc,button}){
 const related=similarMaterials(state,b,o);
 if(!related.length)return '';
 return `<details class="related-materials"><summary><span>与 ${related.length} 条素材内容相似</span><span>查看相关素材</span></summary><div class="related-material-list">${related.map(item=>`<div class="related-material-row"><span>${esc(item.output.title)}</span>${button('查看成片','review-related','text-btn',`data-batch="${esc(item.batch.id)}" data-id="${esc(item.output.id)}"`)}</div>`).join('')}</div></details>`;
}
