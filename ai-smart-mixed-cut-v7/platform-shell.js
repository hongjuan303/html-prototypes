import {platformAccount,readPlatformUsage,subscribePlatformUsage} from './platform-context.js?v=20261009-update10';
const $=s=>document.querySelector(s);
const escape=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const paths={
 dashboard:'<rect x="4" y="4" width="16" height="16" rx="3"/><path d="M8 15v-3m4 3V8m4 7v-5"/>',
 toolbox:'<rect x="6" y="3" width="13" height="16" rx="2"/><path d="M6 16h13M4 7v14h12"/>',
 music:'<path d="M9 18V7l11-3v12M9 10l11-3"/><ellipse cx="6" cy="18" rx="3" ry="2.5"/><ellipse cx="17" cy="15" rx="3" ry="2.5"/>',
 video:'<rect x="3" y="6" width="13" height="12" rx="3"/><path d="m16 10 5-3v10l-5-3M7 9v6m4-5v4"/>',
 asset:'<path d="m12 3 8 4.5v9L12 21l-8-4.5v-9L12 3Z"/><path d="m4 7.5 8 5 8-5M12 12.5V21"/>',
 spark:'<path d="m10 2 2.5 6.5L19 11l-6.5 2.5L10 20l-2.5-6.5L1 11l6.5-2.5L10 2Zm9 13 1.2 3.2L23 19.5l-2.8 1.3L19 24l-1.2-3.2-2.8-1.3 2.8-1.3L19 15Z"/>',
 canvas:'<rect x="3" y="3" width="14" height="14" rx="3"/><rect x="8" y="8" width="13" height="13" rx="3"/>',
 cut:'<path d="m10 9 10 11M10 15 20 4M14 12l6 7"/><circle cx="6.5" cy="6.5" r="3.5"/><circle cx="6.5" cy="17.5" r="3.5"/>'
};
export const platformIcon=name=>`<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name]||paths.toolbox}</svg>`;
let pointsSignature='';
const usageSignature=u=>JSON.stringify([u.balance,u.frozen,u.settled,u.ledger.length,u.ledger[0]]);
export function updatePlatformBalance(balance=readPlatformUsage().balance){
 const el=$('#walletTop');if(el&&el.dataset.balance!==String(balance)){el.dataset.balance=String(balance);el.innerHTML=`<small>积分</small><span>${Number(balance).toLocaleString()}</span>`;}
 if($('#dialog')?.open&&$('#dialogTitle').textContent==='积分明细'&&pointsSignature!==usageSignature(readPlatformUsage()))showPoints();
}
function showPlatformDialog(title,body){
 const dialog=$('#dialog');dialog.className='platform-dialog';delete dialog.dataset.syncJob;
 $('#dialogTitle').textContent=title;$('#dialogBody').innerHTML=body;
 $('#dialogActions').innerHTML='<button type="button" data-action="close">关闭</button>';
 if(!dialog.open)dialog.showModal();
}
function showPoints(){
 const u=readPlatformUsage();pointsSignature=usageSignature(u);
 const spent=u.settled;
 showPlatformDialog('积分明细',`<div class="platform-balance-summary"><div class="stat"><strong>${u.balance.toLocaleString()}</strong><span>可用积分</span></div><div class="stat"><strong>${u.frozen}</strong><span>冻结积分</span></div><div class="stat"><strong>${spent}</strong><span>混剪已结算</span></div></div><div class="table-wrap"><table class="platform-ledger-table"><thead><tr><th>时间</th><th>功能 / 项目</th><th>积分变化</th><th>说明</th></tr></thead><tbody>${u.ledger.length?u.ledger.slice(0,30).map(l=>`<tr><td>${escape(new Date(l.at).toLocaleString('zh-CN'))}</td><td>智能混剪<p>${escape(l.type)}</p></td><td>${l.points>0?'+':''}${l.points}</td><td>${l.settled?'从冻结额度结算 '+l.settled+' 积分':escape(l.batch||'剧集分析')}</td></tr>`).join(''):'<tr><td colspan="4" class="muted">暂无消费记录</td></tr>'}</tbody></table></div><p class="helper">平台账户共用积分 · 当前为演示数据</p>`);
}
export function mountPlatformShell(toolbox=false){
 const review=new URLSearchParams(location.search).get('review')==='1'&&window.parent!==window;
 const toolboxUrl='./toolbox.html'+(review?'?review=1':'');
 $('#platformSidebar').innerHTML=`<a class="brand" href="${toolboxUrl}" aria-label="容量万相工具箱"><img src="./assets/wanxiang-logo.png" alt="容量万相"></a><nav class="platform-nav" aria-label="平台导航">${[['dashboard','工作台'],['toolbox','工具箱'],['music','音色库'],['video','视频超分'],['asset','资产库']].map(([icon,label])=>icon==='toolbox'?`<a href="${toolboxUrl}" class="active" aria-current="page">${platformIcon(icon)}<span>${label}</span></a>`:`<div class="platform-nav-item" title="沿用平台现有功能">${platformIcon(icon)}<span>${label}</span></div>`).join('')}</nav><div class="side-bottom platform-account-controls"><button id="walletTop" type="button" aria-label="查看平台积分明细"></button><button id="accountTop" type="button" class="profile" aria-label="查看平台账户">${escape(platformAccount.name.slice(0,1))}</button></div>`;
 $('#platformHeader').innerHTML=toolbox?'<div id="breadcrumb"><b>工具箱</b></div><span class="platform-demo-label">V7 · 交互演示</span>':`<div id="breadcrumb"></div><nav id="workspaceNav" aria-label="混剪功能"><button data-nav="create">制作素材</button><button data-nav="assets">剧目管理</button><button data-nav="tasks">成片管理</button></nav><div class="platform-header-actions"><span class="platform-demo-label" title="生成、计费与同步均为本地模拟，不处理真实视频">V7 · 交互演示</span><button data-action="demo-tools" class="text-btn">演示设置</button></div>`;
 updatePlatformBalance();
 $('#walletTop').addEventListener('click',showPoints);
 $('#accountTop').addEventListener('click',()=>showPlatformDialog('账户信息',`<div class="platform-account-info"><div class="list-row"><b>平台账户</b><span>${escape(platformAccount.name)}</span></div><div class="list-row"><b>所属团队</b><span>${escape(platformAccount.team)}</span></div><div class="list-row"><b>当前工具</b><span>${toolbox?'工具箱':'智能混剪'}</span></div><p class="helper">沿用容量万相账户 · 当前为演示账号</p></div>`));
 document.addEventListener('click',e=>{if(e.target.closest('[data-action="close"]'))$('#dialog').close();});
 subscribePlatformUsage(u=>updatePlatformBalance(u.balance));
}
export function renderToolbox(){
 const review=new URLSearchParams(location.search).get('review')==='1'&&window.parent!==window;
 const entry=review?'./review.html':'./index.html';
 $('#app').classList.add('platform-toolbox');
 $('#app').innerHTML=`<div class="tool-grid" aria-label="工具箱">${[['music','配音创作'],['spark','图片创作'],['video','视频创作'],['canvas','创建/进入无限画布']].map(([icon,label])=>`<div class="tool-card" title="沿用平台现有功能"><span class="tool-icon">${platformIcon(icon)}</span><span class="tool-name">${label}</span></div>`).join('')}<a class="tool-card mixed-cut-entry" href="${entry}" target="_blank" rel="noopener" aria-label="智能混剪，在新页面打开"><span class="tool-icon">${platformIcon('cut')}</span><span class="tool-name">智能混剪 <small aria-hidden="true">↗</small></span><span class="tool-description">高光混剪 · AI 解说</span></a></div>`;
}
