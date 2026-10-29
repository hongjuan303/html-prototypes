import {sourcePermissionError} from './source-access.js?v=20261029-update21e';
import {listDramas} from './dramas.js?v=20261029-update21e';
import {importSummary,importSelectionError,renderImportStatus} from './import-state.js?v=20261029-update21e';
export const sourceName=d=>['green','cloud'].includes(d.config.source?.kind)?(d.config.source.market==='domestic'?'国内合集':'海外合集'):'本地上传';
export function filteredDramas(state,filters){const query=filters.query.trim().toLowerCase();return listDramas(state).filter(d=>(filters.market==='all'||d.source.market===filters.market)&&(!query||d.title.toLowerCase().includes(query)));}
export function renderLibrary(state,filters,h,draft=filters){
 const {heading,button,esc,option}=h,list=filteredDramas(state,filters);
 const cover=d=>d.source.cover?`<img class="drama-cover" src="${esc(d.source.cover)}" alt="剧目封面">`:'<span class="drama-cover drama-cover-local" aria-hidden="true">▹</span>';
 const actions=d=>{
  const attrs=`data-id="${esc(d.id)}"`,error=sourcePermissionError(state,d.config)||importSelectionError(d.source);
  return importSummary(d.source).status==='failed'
   ?button('重试','retry-import-drama','text-btn',attrs)+button('删除','delete-import-drama','text-btn danger',attrs)
   :button('查看','open-drama','text-btn',attrs)+button('新建剪辑','make-drama','text-btn',`${attrs} ${error?`disabled title="${esc(error)}"`:''}`)+button('重命名','rename-drama','text-btn',attrs);
 };
 return heading('剧目管理','')+`<div class="library-filters" id="dramaFilters"><input id="dramaSearch" aria-label="搜索剧目" placeholder="剧目名称" value="${esc(draft.query)}"><select id="dramaMarket" aria-label="业务类型">${[['all','全部业务类型'],['domestic','国内短剧'],['overseas','海外短剧']].map(([v,l])=>option(v,l,draft.market)).join('')}</select><div class="filter-actions">${button('查询','query-dramas','primary')}${button('导出','export-dramas','secondary',list.length?'':'disabled')}${button('重置','clear-drama-filters','secondary')}</div></div>
 <div class="library-list-tools">${button('新增短剧','new-drama','primary')}</div>
 <div class="table-wrap"><table class="drama-table"><thead><tr><th>剧目名称</th><th>导入状态</th><th>集数</th><th>制作任务</th><th>成片数量</th><th><span id="dramaActionsHeading">操作</span></th></tr></thead><tbody>${list.map(d=>`<tr data-drama-id="${esc(d.id)}"><td><div class="drama-name">${cover(d)}<div><strong title="${esc(d.title)}">${esc(d.title)}</strong><p>${sourceName(d)}</p></div></div></td><td>${renderImportStatus(d.source,esc)}</td><td>${d.totalEpisodes??'—'}</td><td>${d.taskCount}</td><td>${d.generatedCount}</td><td><div class="row-actions">${actions(d)}</div></td></tr>`).join('')||'<tr><td colspan="6" class="task-empty-row">没有符合条件的剧目</td></tr>'}</tbody></table></div><div class="table-footer"><span></span><span>共 ${list.length} 部</span></div>`;
}
