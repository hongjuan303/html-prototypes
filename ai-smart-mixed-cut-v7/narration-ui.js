// Narration editing is optional during preview; the player remains the main
// workspace. Timing buttons refer to the finished material, not source footage.
export function narrationActions(b,o,locked,{button}){
 const full=b.config.narrationStructure==='full',media=full?(o.segments||[]).filter(s=>s.type==='narration').map(s=>s.text):[o.narrationText||''];
 const draft=Array.isArray(o.narrationDraft)?o.narrationDraft:null,texts=(draft||media).map(text=>String(text).trim());
 const valid=texts.length===media.length&&texts.length>0&&texts.every(Boolean),saved=!!draft&&valid&&JSON.stringify(texts)===JSON.stringify(o.narrationSavedDraft);
 return `<div class="narration-actions">${button('试听文案','speak','text-btn',locked||!valid?'disabled':'')}<div class="actions narration-edit-actions" role="group" aria-label="处理文案修改">${button('放弃修改','discard-narration','text-btn',locked||!draft?'disabled':'')}${button('保存草稿',full?'save-full-narration':'save-narration','secondary',locked||!draft||!valid||saved?'disabled':'')}${button('应用修改','apply-narration','primary',locked||!saved?'disabled':'')}</div></div>`;
}
export function fullNarrationPanel(b,o,{open=false,locked=false}={},h){
 const {button,esc,fmt}=h,segments=(o.segments||[]).filter(s=>s.type==='narration');
 return `<details class="section narration-panel" id="narrationScript" ${open||o.narrationDraft?'open':''}><summary>解说文案</summary><div class="narration-panel-body"><div class="full-narration-editor">${segments.map((s,i)=>`<div class="full-narration-script"><div class="section-heading"><label for="fullNarration${i}">第 ${i+1} 段</label>${button(fmt(s.start)+'–'+fmt(s.end),'narration-locate','text-btn time-label',`data-at="${s.start}" aria-label="定位第 ${i+1} 段解说"`)}</div><textarea id="fullNarration${i}" data-full-narration="${i}" aria-label="第${i+1}段解说文案" rows="${Math.min(8,Math.max(3,Math.ceil([...String(s.text||'')].length/36)))}" ${locked?'disabled':''}>${esc(o.narrationDraft?.[i]??s.text)}</textarea></div>`).join('')}</div>${narrationActions(b,o,locked,h)}</div></details>`;
}
export function mixedNarrationPanel(b,o,{open=false,locked=false}={},h){
 const {button,esc,fmt}=h,segments=(o.segments||[]).filter(s=>s.type==='narration');
 return `<details class="section narration-panel" id="narrationScript" ${open||o.narrationDraft?'open':''}><summary>解说文案</summary><div class="narration-panel-body"><div class="narration-time-nav">${segments.map((s,i)=>button(fmt(s.start)+'–'+fmt(s.end),'narration-locate','text-btn time-label',`data-at="${s.start}" aria-label="定位第 ${i+1} 段解说"`)).join('')}</div><label class="sr-only" for="narrationEdit">解说文案</label><textarea id="narrationEdit" aria-label="解说文案" rows="6" ${locked?'disabled':''}>${esc(o.narrationDraft?.[0]??o.narrationText??'')}</textarea>${narrationActions(b,o,locked,h)}</div></details>`;
}
