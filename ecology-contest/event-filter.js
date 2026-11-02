// 赛道按类型匹配；多个所选类型为并集，与关键词和状态取交集。
export function filterAdminEvents(events,filters={}){
 const tracks=Array.isArray(filters.tracks)?filters.tracks:[];
 return events.filter(e=>(!filters.q||(e.title+e.host).includes(filters.q))&&(!filters.status||e.status===filters.status)&&(!tracks.length||e.tracks.some(t=>tracks.includes(t.name))));
}
export function eventTrackFilter(tracks,label,selected=[],esc){
 const chosen=Array.isArray(selected)?selected:[];
 const text=chosen.length===1?label(chosen[0]):chosen.length?'已选 '+chosen.length+' 项':'全部赛道';
 return `<div class="field event-track-field"><span id="event-track-label">赛道</span><details class="event-track-select"><summary aria-labelledby="event-track-label event-track-value"><span id="event-track-value" title="${esc(chosen.map(label).join('、')||'全部赛道')}">${esc(text)}</span><span class="select-chevron" aria-hidden="true">⌄</span></summary><div class="event-track-options" role="group" aria-label="赛道选项">${tracks.map(t=>`<label><input type="checkbox" name="tracks" value="${esc(t)}" ${chosen.includes(t)?'checked':''}><span>${esc(label(t))}</span></label>`).join('')}<button type="button" class="event-track-clear">清空选择</button></div></details></div>`;
}
export function bindEventTrackFilter(form,label){
 const details=form?.querySelector('.event-track-select');if(!details)return;
 const update=()=>{const values=[...details.querySelectorAll('input:checked')].map(x=>x.value),summary=details.querySelector('#event-track-value');summary.textContent=values.length===1?label(values[0]):values.length?'已选 '+values.length+' 项':'全部赛道';summary.title=values.map(label).join('、')||'全部赛道';};
 details.addEventListener('change',update);
 details.querySelector('.event-track-clear').onclick=()=>{details.querySelectorAll('input').forEach(x=>{x.checked=false;});update();};
 details.addEventListener('keydown',e=>{if(e.key==='Escape'){e.preventDefault();e.stopPropagation();details.open=false;details.querySelector('summary').focus();}});
 details.addEventListener('focusout',e=>{if(!details.contains(e.relatedTarget))details.open=false;});
}
