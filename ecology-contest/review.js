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
    const next=JSON.stringify(doc);if(next!==key){key=next;content.innerHTML='<h1>#页面说明</h1><ul><li>'+esc(doc.page)+'</li></ul><h1>#原型说明</h1><ul><li><b>背景：</b>'+esc(doc.background)+'</li><li><b>需求：</b>'+esc(doc.need)+'</li></ul>'+(doc.source?'<p class="notes-source">数据源：'+esc(doc.source)+'</p>':'')+doc.sections.map((s,i)=>'<section class="note-section" id="note-'+(i+1)+'"><h2><span class="note-number">'+(i+1)+'</span>'+esc(s.title)+'</h2><ul>'+s.items.map(v=>'<li>'+item(v)+'</li>').join('')+'</ul>'+(s.risk?'<p class="note-risk">'+esc(s.risk)+'</p>':'')+'</section>').join('')+(doc.risks?.length?'<h2 style="margin-top:24px">待确认</h2><ul class="note-risk">'+doc.risks.map(v=>'<li>'+esc(v)+'</li>').join('')+'</ul>':'')+'<h2 style="margin-top:28px">变更日志</h2><table class="change-log"><thead><tr><th>版本</th><th>日期</th><th>变更内容</th></tr></thead><tbody><tr><td>V1.10</td><td>2026-11-03</td><td>人工调整积分仅支持赠送，删除调整类型与扣回入口，提交文案改为确认赠送，弹窗不展示用户可用积分；同步默认自发放日起有效 1 年的规则说明，消费扣分顺序待确认。</td></tr><tr><td>V1.9</td><td>2026-11-03</td><td>奖励配置仅在选中对应类型后显示；删除录入时的主办方确认勾选，线下确认记录选填，发布仍需统一核对名单；删除获奖名单列表的未发布提示文案。</td></tr><tr><td>V1.8</td><td>2026-11-03</td><td>录入及编辑获奖作品增加奖励类型多选；勾选后启用对应配置，至少选择一种，保存仅保留所选奖励。</td></tr><tr><td>V1.7</td><td>2026-11-03</td><td>赛事管理－获奖名单列表移除主办方确认列；录入与发布确认规则不变。</td></tr><tr><td>V1.6</td><td>2026-11-02</td><td>外部视频默认本地上传，关闭新网盘入口并保留历史材料；赛事封面与二维码改为图片上传，城市/地区选填；赛事名称、主办单位分别模糊筛选；积分列表移除变动类型，人工调整按参赛用户选择；赛事内更名获奖名单，发布后可直达对应赛事的奖励发放。</td></tr><tr><td>V1.5</td><td>2026-10-28</td><td>样片、成片外部作品支持网盘链接导入或本地上传；服务端生成视频文件列表供运营在线预览，导入状态与审核状态分开，未导入完成不可审核。</td></tr><tr><td>V1.4</td><td>2026-10-28</td><td>剧本连续滚动阅读，精简列表与预览文案；参赛作品可导出列表及投稿附件。赛事管理内录入并发布获奖名单，奖励发放独立汇总全部赛事；赛事管理移除顶部汇总，增加赛道多选筛选，作品数更名为参赛作品数。我的赛事移除可用积分汇总，删除官网页脚演示说明；赛事广场取消顶部 Banner，保留赛事卡片图片与详情封面；列表仅展示具体赛道标签，不重复显示赛道数量。</td></tr><tr><td>V1.3</td><td>2026-10-27</td><td>作品改为单次审核，记录审核人及时间；支持在线预览、成片选集及顺序播放。奖励页汇总全部赛事，按单场发布名单，明确奖励发放状态；同步投稿集数与数据来源。</td></tr><tr><td>V1.2</td><td>2026-10-26</td><td>参赛信息新增选填联系微信，位于联系邮箱前；同步草稿回填、本人及绿台详情与说明，不对外公示。</td></tr><tr><td>V1.1</td><td>2026-10-26</td><td>样片、成片恢复外部作品上传，保留万相平台作品选择；增加积分扶持咨询提示及商务入口，同步材料来源说明。</td></tr><tr><td>V1.0</td><td>2026-10-23</td><td>初始原型</td></tr></tbody></table>';panel.scrollTop=0;document.title=doc.title+' · 原型与说明';}
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
