/* One date-range control; existing start/end values remain the saved data shape. */
window.KSAuthRange = (() => {
  let getValue, onChange, active=null;
  const $=s=>document.querySelector(s),pad=n=>String(n).padStart(2,'0');
  const esc=s=>String(s||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const today=()=>new Intl.DateTimeFormat('sv-SE',{timeZone:'Asia/Shanghai',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
  function monthDate(year,month){const d=new Date(0);d.setUTCHours(0,0,0,0);d.setUTCFullYear(year,month,1);return d;}
  function html(d){
    active=null;
    const value=d.authStart||d.authEnd?`${d.authStart||'开始日期'} ～ ${d.authEnd||'结束日期'}`:'';
    return `<div class="auth-range"><div class="auth-range-control"><input id="f-authRange" type="text" readonly value="${esc(value)}" placeholder="开始日期 ～ 结束日期" role="combobox" aria-haspopup="dialog" aria-expanded="false" aria-controls="authRangePicker" data-range-action="open">${value?'<button type="button" class="auth-range-clear" data-range-action="clear" aria-label="清空授权有效期">×</button>':''}<button type="button" class="auth-range-icon" data-range-action="open" aria-label="选择授权有效期"><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M7 3v4m10-4v4M3 10h18"/></svg></button></div><div id="authRangePicker" class="auth-range-picker" role="dialog" aria-label="选择授权有效期" hidden></div></div>`;
  }
  function close(focus=false){
    active=null;const panel=$('#authRangePicker'),input=$('#f-authRange');if(panel)panel.hidden=true;
    input?.setAttribute('aria-expanded','false');if(focus)input?.focus({preventScroll:true});
  }
  function reveal(){
    const panel=$('#authRangePicker'),viewport=$('#prototypeViewport'),footer=document.querySelector('.workflow-footer');
    if(!active||!panel||!viewport)return;
    const bounds=viewport.getBoundingClientRect(),rect=panel.getBoundingClientRect();
    const bottom=Math.min(bounds.bottom,footer?.getBoundingClientRect().top||bounds.bottom)-12;
    const zoom=parseFloat(getComputedStyle(viewport).zoom)||1;
    if(rect.bottom>bottom)viewport.scrollTop+=(rect.bottom-bottom)/zoom;
  }
  function monthMarkup(date){
    const year=date.getUTCFullYear(),month=date.getUTCMonth(),prefix=`${String(year).padStart(4,'0')}-${pad(month+1)}`;
    const last=monthDate(year,month+1);last.setUTCDate(0);
    const offset=(date.getUTCDay()+6)%7;
    return `<section class="range-month"><h4>${year}年${month+1}月</h4><div class="range-week">${['一','二','三','四','五','六','日'].map(day=>`<span>${day}</span>`).join('')}</div><div class="range-days">${'<span></span>'.repeat(offset)}${Array.from({length:last.getUTCDate()},(_,i)=>{
      const value=prefix+'-'+pad(i+1),edge=value===active.start||value===active.end,between=active.start&&active.end&&value>active.start&&value<active.end;
      return `<button type="button" class="${edge?'range-edge':between?'range-between':''} ${value===today()?'range-today':''}" data-range-action="day" data-range-date="${value}" aria-label="${value}" aria-pressed="${edge}">${i+1}</button>`;
    }).join('')}</div></section>`;
  }
  function draw(){
    const panel=$('#authRangePicker');if(!panel||!active)return;
    const left=monthDate(active.year,active.month),right=monthDate(active.year,active.month+1);
    panel.innerHTML=`<div class="range-toolbar"><button type="button" data-range-action="previous" aria-label="上个月">‹</button><label>年份<input type="number" min="1" max="9998" value="${active.year}" data-range-year aria-label="授权日历年份"></label><select data-range-month aria-label="授权日历月份">${Array.from({length:12},(_,i)=>`<option value="${i}" ${i===active.month?'selected':''}>${i+1}月</option>`).join('')}</select><button type="button" data-range-action="next" aria-label="下个月">›</button></div><div class="range-months">${monthMarkup(left)}${monthMarkup(right)}</div><div class="range-footer"><span aria-live="polite">${active.start&&!active.end?'请选择结束日期':'请选择开始日期，再选择结束日期'}</span><button type="button" class="link" data-range-action="cancel">取消</button></div>`;
    panel.hidden=false;$('#f-authRange')?.setAttribute('aria-expanded','true');reveal();
  }
  function open(){
    if(active){close();return;}
    const d=getValue();if(!d)return;
    const value=/^\d{4}-\d{2}-\d{2}$/.test(d.authStart||'')?d.authStart:today();
    active={id:d.id,year:Number(value.slice(0,4)),month:Number(value.slice(5,7))-1,start:d.authStart||'',end:d.authEnd||''};draw();
    const first=$(`[data-range-date="${active.start||today()}"]`)||$('#authRangePicker [data-range-date]');first?.focus({preventScroll:true});
  }
  function commit(start,end){const d=getValue();if(!d||active&&active.id!==d.id){close();return;}close();onChange(start,end);$('#f-authRange')?.focus({preventScroll:true});}
  function bind(getter,change){
    getValue=getter;onChange=change;
    window.addEventListener('resize',reveal);
    document.addEventListener('click',e=>{
      const button=e.target.closest('[data-range-action]');
      if(!button){if(active&&!e.target.closest('.auth-range'))close();return;}
      const action=button.dataset.rangeAction;
      if(action==='open')return open();
      if(action==='clear')return commit('','');
      if(action==='cancel')return close(true);
      if(!active)return;
      if(action==='previous'||action==='next'){
        const date=monthDate(active.year,active.month+(action==='next'?1:-1));
        if(date.getUTCFullYear()<1||date.getUTCFullYear()>9998)return;
        active.year=date.getUTCFullYear();active.month=date.getUTCMonth();draw();$(`[data-range-action="${action}"]`)?.focus({preventScroll:true});return;
      }
      if(action==='day'){
        const date=button.dataset.rangeDate;
        if(!active.start||active.end||date<active.start){active.start=date;active.end='';draw();$(`[data-range-date="${date}"]`)?.focus({preventScroll:true});}
        else commit(active.start,date);
      }
    });
    document.addEventListener('change',e=>{
      if(!active)return;
      if(e.target.hasAttribute('data-range-month')){active.month=Number(e.target.value);draw();$('[data-range-month]')?.focus({preventScroll:true});}
      if(e.target.hasAttribute('data-range-year')){const year=Number(e.target.value);if(Number.isInteger(year)&&year>=1&&year<=9998)active.year=year;draw();$('[data-range-year]')?.focus({preventScroll:true});}
    });
    document.addEventListener('keydown',e=>{
      if(e.key==='Escape'&&active){e.preventDefault();e.stopImmediatePropagation();close(true);return;}
      if(e.target.id==='f-authRange'&&['Enter',' ','ArrowDown'].includes(e.key)){e.preventDefault();open();}
    },true);
  }
  return {html,bind};
})();
