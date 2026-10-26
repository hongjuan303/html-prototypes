const frame=document.querySelector('#prototype'),panel=document.querySelector('#notes'),content=document.querySelector('#notes-content');
const query=new URLSearchParams(location.search);query.delete('standalone');query.set('embedded','1');
frame.src='./index.html?'+query+(location.hash||'#/events');
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const item=v=>{const at=v.indexOf('：');return at<0?esc(v):'<b>'+esc(v.slice(0,at))+'：</b>'+esc(v.slice(at+1));};
let key='';
window.addEventListener('message',event=>{
  if(event.origin!==location.origin||event.source!==frame.contentWindow||event.data?.source!=='contest-review')return;
  const {type,document:doc,number,hash}=event.data;
  if(type==='document'){
    const next=JSON.stringify(doc);if(next!==key){key=next;content.innerHTML='<h1>#页面说明</h1><ul><li>'+esc(doc.page)+'</li></ul><h1>#原型说明</h1><ul><li><b>背景：</b>'+esc(doc.background)+'</li><li><b>需求：</b>'+esc(doc.need)+'</li></ul>'+(doc.source?'<p class="notes-source">数据源：'+esc(doc.source)+'</p>':'')+doc.sections.map((s,i)=>'<section class="note-section" id="note-'+(i+1)+'"><h2><span class="note-number">'+(i+1)+'</span>'+esc(s.title)+'</h2><ul>'+s.items.map(v=>'<li>'+item(v)+'</li>').join('')+'</ul>'+(s.risk?'<p class="note-risk">'+esc(s.risk)+'</p>':'')+'</section>').join('')+(doc.risks?.length?'<h2 style="margin-top:24px">待确认</h2><ul class="note-risk">'+doc.risks.map(v=>'<li>'+esc(v)+'</li>').join('')+'</ul>':'')+'<h2 style="margin-top:28px">变更日志</h2><table class="change-log"><thead><tr><th>版本</th><th>日期</th><th>变更内容</th></tr></thead><tbody><tr><td>V1.2</td><td>2026-10-26</td><td>参赛信息新增选填联系微信，位于联系邮箱前；同步草稿回填、本人及绿台详情与说明，不对外公示。</td></tr><tr><td>V1.1</td><td>2026-10-26</td><td>样片、成片恢复外部作品上传，保留万相平台作品选择；增加积分扶持咨询提示及商务入口，同步材料来源说明。</td></tr><tr><td>V1.0</td><td>2026-10-23</td><td>初始原型</td></tr></tbody></table>';panel.scrollTop=0;document.title=doc.title+' · 原型与说明';}
    if(hash&&location.hash!==hash)history.replaceState(null,'',location.pathname+location.search+hash);
  }
  if(type==='locate'){
    window.scrollTo({left:panel.offsetLeft+panel.offsetWidth-innerWidth+24,behavior:'auto'});
    content.querySelectorAll('.is-focused').forEach(x=>x.classList.remove('is-focused'));
    const target=content.querySelector('#note-'+number);if(target){target.classList.add('is-focused');panel.scrollTo({top:target.offsetTop-content.offsetTop+content.offsetTop-70,behavior:'auto'});}
  }
  if(type==='show')window.scrollTo({left:panel.offsetLeft+panel.offsetWidth-innerWidth+24,behavior:'auto'});
});
document.querySelector('#return-prototype').onclick=()=>window.scrollTo({left:0,behavior:'auto'});
window.addEventListener('hashchange',()=>{frame.contentWindow?.postMessage({source:'contest-review-parent',type:'navigate',hash:location.hash},location.origin);window.scrollTo({left:0,behavior:'auto'});});
