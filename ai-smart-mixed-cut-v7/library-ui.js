import {sourceAccess,sourcePermissionError} from './source-access.js?v=20261009-update11';
import {listDramas} from './dramas.js?v=20261009-update11';

const marketOf=d=>d.config.source?.kind==='green'?d.config.source.market:'manual';
export function renderLibrary(state,filters,h){
 const {heading,button,esc,option}=h;
 const all=listDramas(state),query=filters.query.trim().toLowerCase(),access=sourceAccess(state);
 const list=all.filter(d=>(filters.market==='all'||marketOf(d)===filters.market)&&(!query||(d.title+' '+d.id).toLowerCase().includes(query)));
 const cover=d=>{
  const local=d.source.kind==='manual',allowed=!sourcePermissionError(state,d.config),url=allowed?(d.source.cover||(!local?'./assets/drama-confrontation.jpg':'')):'';
  return url?`<img class="drama-cover" src="${esc(url)}" alt="${esc(d.title)}封面">`:`<span class="drama-cover drama-cover-local" aria-label="剧目封面未展示"><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="3" width="16" height="18" rx="2"/><path d="m10 9 5 3-5 3Z"/><path d="M4 7h16M4 17h16"/></svg></span>`;
 };
 const label=d=>marketOf(d)==='domestic'?'国内短剧':marketOf(d)==='overseas'?'海外短剧':'本地上传';
 return heading('剧目管理','',button('新增剧目','add-drama','primary'))+
 `<div class="library-filters"><input id="dramaSearch" aria-label="搜索剧目" placeholder="搜索剧名" value="${esc(filters.query)}"><select id="dramaMarket" aria-label="剧目来源">${[['all','全部来源'],...(access.markets.includes('domestic')?[['domestic','国内短剧']]:[]),...(access.markets.includes('overseas')?[['overseas','海外短剧']]:[]),['manual','本地上传']].map(([v,l])=>option(v,l,filters.market)).join('')}</select>${button('清空筛选','clear-drama-filters','text-btn')}</div>
 ${list.length?`<div class="table-wrap"><table class="drama-table"><thead><tr><th>剧目名称</th><th>集数</th><th>制作任务</th><th>成片数量</th><th>操作</th></tr></thead><tbody>${list.map(d=>`<tr><td><div class="drama-name">${cover(d)}<div><strong>${esc(d.title)}</strong><p>${label(d)}</p></div></div></td><td><b>${d.totalEpisodes}</b> 集</td><td><b>${d.batches.length}</b> 个</td><td><b>${d.generatedCount}</b> 条</td><td><div class="row-actions">${button('查看','open-drama','text-btn',`data-id="${esc(d.id)}"`)}${button('新建剪辑','make-drama','secondary',`data-id="${esc(d.id)}" ${sourcePermissionError(state,d.config)?'disabled title="暂无此合集权限"':''}`)}${d.source.kind==='manual'?button('重命名','rename-drama','text-btn',`data-id="${esc(d.id)}"`):''}</div></td></tr>`).join('')}</tbody></table></div>`:`<div class="empty"><h2>没有符合条件的剧目</h2><p>可以清空筛选，或新增剧目。</p>${button('清空筛选','clear-drama-filters','secondary')}${button('新增剧目','add-drama','primary')}</div>`}
 <div class="table-footer"><span></span><span>显示 ${list.length} / ${all.length} 部</span></div>`;
}
