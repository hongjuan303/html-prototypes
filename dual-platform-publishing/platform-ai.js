'use strict';
// All copies remain owned by their destination and field; the OSS name is never changed.
const PLATFORM_COPY_FIELDS={
 '抖音':[{key:'title',label:'作品标题'}],
 '视频号':[{key:'text',label:'素材描述'}],
 '快手':[{key:'text',label:'作品描述'}],
 '快手经管平台':[{key:'title',label:'剪辑标题'}],
 '抖音版权中台':[{key:'dyTitle',label:'抖音视频标题'},{key:'hgTitle',label:'红果视频标题'}]
};
function aiSelectedAssets(w,p){return selectedPlatformAssets(w,p)}
function aiFieldLimit(w,p,asset,field){
 if(p===KM_PLATFORM&&field==='title')return 20;
 // Verified production limits belong in an adapter. Keep unknown limits unset.
 // WeChat external-description 100 is an existing green-admin form constraint.
 if(p==='视频号'&&(w.assignments[p+asset.id]||[]).some(id=>assetConfig(w,p,asset.id,id).hang?.startsWith('外部')||accountType(w,id,asset.id)?.startsWith('外部')))return 100;
 return null;
}
function aiExplicitCopy(w,p,id,field,accountId){
 if(p===CP_PLATFORM)return copyrightDraft(w).items[id]?.[field]||'';
 if(p===KM_PLATFORM)return kmConfig(w,id,accountId).title;
 return w.materialAccountConfigs?.[targetKey(id,accountId)]?.[field]??w.materialConfigs?.[p+'::'+id]?.[field]??(p==='抖音'&&field==='title'?w.assetTitles?.[id]||'':'');
}
function applyPlatformCopies(w,p,results,overwrite=false){
 let applied=0,skipped=0;
 for(const result of results){if(result.info?.error||!platformAssets(w,p).some(a=>a.id===result.asset.id))continue;
  const id=result.asset.id,field=result.field.key,text=result.text.trim();
  if(p===KM_PLATFORM){
   if(field!=='title'||!text||[...text].length>20){skipped++;continue}
   const d=kmDraft(w),ids=d.assignments[id]||[];
   for(const accountId of (ids.length?ids:[null])){
    if(!overwrite&&aiExplicitCopy(w,p,id,field,accountId).trim()){skipped++;continue}
    if(accountId)d.configs[kmKey(id,accountId)]={...kmConfig(w,id,accountId),title:text};
    else d.assetTitles[id]=text;
    applied++;
   }
   continue;
  }
  if(p===CP_PLATFORM){const item=copyrightDraft(w).items[id];if(!overwrite&&item[field]?.trim()){skipped++;continue}item[field]=text;applied++;continue}
  const ids=w.assignments[p+id]||[];
  const write=(accountId)=>{if(!overwrite&&aiExplicitCopy(w,p,id,field,accountId).trim()){skipped++;return}if(accountId){const key=targetKey(id,accountId);w.materialAccountConfigs[key]={...assetConfig(w,p,id,accountId),[field]:text}}else {const key=p+'::'+id;w.materialConfigs[key]={...w.materialConfigs[key],[field]:text}}applied++};
  if(ids.length){for(const accountId of ids)write(accountId)}else write(null);
 }
 return {applied,skipped};
}
let platformAISession=null;
function openPlatformAI(p){
 const w=state.wizard,assets=aiSelectedAssets(w,p);if(!assets.length)return toast('请先勾选当前平台需要生成的素材',true);
 const fields=PLATFORM_COPY_FIELDS[p];platformAISession={w,p,assets,fields,enabled:fields.map(f=>f.key),limits:Object.fromEntries(fields.map(f=>[f.key,p===KM_PLATFORM?Math.min(w.aiLimits?.[p]?.[f.key]||20,20):w.aiLimits?.[p]?.[f.key]||30])),overwrite:false,results:[],generated:false};renderPlatformAI();
}
function platformAIError(x=platformAISession){if(!x.enabled.length)return '请至少选择一个生成字段';const max=x.p===KM_PLATFORM?20:200;for(const key of x.enabled){const n=Number(x.limits[key]);if(!Number.isInteger(n)||n<1||n>max)return `请填写1～${max}的整数字数上限`}return ''}
function generatePlatformAI(onlyKey){
 const x=platformAISession,error=platformAIError(x);if(error){$('#modalError').textContent=error;return}
 const previous=x.results;x.results=x.assets.flatMap((asset,i)=>x.fields.filter(f=>x.enabled.includes(f.key)).map(field=>{
  const info=materialDrama(asset),key=asset.id+'::'+field.key,old=previous.find(r=>r.key===key),limit=Math.min(x.limits[field.key],aiFieldLimit(x.w,x.p,asset,field.key)||Infinity);
  if(onlyKey&&onlyKey!==key&&old)return old;
  const version=(old?.version??i)+1;
  const text=info.error?'':[...info.titles[(version+(field.key==='hgTitle'?1:0))%info.titles.length]].slice(0,limit).join('');
  return {asset,field,info,key,version,limit,text};
 }));x.generated=true;renderPlatformAI();
}
function renderPlatformAI(){
 const x=platformAISession,isTitle=['抖音',CP_PLATFORM,KM_PLATFORM].includes(x.p),valid=x.results.filter(r=>!r.info.error),presets=x.p===KM_PLATFORM?[20]:[30,50],max=x.p===KM_PLATFORM?20:200;
 modal(isTitle?'AI生成标题':'AI生成文案',`<div class="platform-ai-heading">${platformBadge(x.p)}<span>已勾选 ${x.assets.length} 份素材</span></div><p class="inline-note">按素材名称中的合集ID，读取绿台短剧简介生成。预览确认后仅应用到当前平台。</p><div class="platform-ai-settings">${x.fields.map(f=>`<div class="ai-field-setting"><label class="check-summary"><input type="checkbox" data-ai-field="${f.key}" ${x.enabled.includes(f.key)?'checked':''}>${f.label}</label><label>字数上限 <select data-ai-preset="${f.key}" aria-label="${f.label}字数预设">${presets.map(n=>`<option value="${n}" ${x.limits[f.key]===n?'selected':''}>${n}字内</option>`).join('')}<option value="custom" ${!presets.includes(x.limits[f.key])?'selected':''}>自定义</option></select></label><input type="number" min="1" max="${max}" data-ai-limit="${f.key}" aria-label="${f.label}字数上限" value="${x.limits[f.key]}" ${presets.includes(x.limits[f.key])?'disabled':''}></div>`).join('')}<div class="ai-apply-settings"><label class="radio-label"><input type="radio" name="aiOverwrite" value="false" ${x.overwrite?'':'checked'}>仅填充空白内容</label><label class="radio-label"><input type="radio" name="aiOverwrite" value="true" ${x.overwrite?'checked':''}>覆盖已有内容</label><button class="btn primary" id="platformAIGenerate">${x.generated?'重新生成':'生成预览'}</button></div></div>${x.generated?`<div class="table-wrap"><table class="data-table compact platform-ai-table"><thead><tr><th>素材 / 目标字段</th><th>绿台短剧简介</th><th>生成结果（可编辑）</th></tr></thead><tbody>${x.results.map(r=>`<tr><td><div class="list-text">${esc(r.asset.name)}</div><span class="cell-sub">${r.field.label}</span><span class="cell-sub">${esc(r.info.drama?.name||'未识别')} ${esc(r.info.id||'')}</span></td><td class="synopsis">${esc(r.info.synopsis||r.info.error)}</td><td>${r.info.error?'<span class="status red">无法生成</span>':`<textarea data-ai-result="${r.key}" aria-label="${esc(r.asset.name)} ${r.field.label}生成结果">${esc(r.text)}</textarea><div class="ai-result-foot"><span data-ai-length="${r.key}">${[...r.text].length} / ${r.limit} 字</span><button class="link-button" data-ai-regenerate="${r.key}">重新生成</button></div>`}</td></tr>`).join('')}</tbody></table></div>`:'<div class="ai-preview-empty">设置生成字段和字数上限，点击「生成预览」查看结果</div>'}<div id="modalError" class="inline-error" role="alert"></div>`,`<span class="subtle">${x.generated?`${valid.length} 项可应用 · ${x.results.length-valid.length} 项无法生成`:''}</span><button class="btn" data-action="close-modal">取消</button><button class="btn primary" id="platformAIApply" ${valid.length?'':'disabled'}>确认应用</button>`,'ai-title-modal');
 $$('[data-ai-field]').forEach(el=>el.onchange=()=>{x.enabled=el.checked?[...x.enabled,el.dataset.aiField]:x.enabled.filter(k=>k!==el.dataset.aiField);x.generated=false;x.results=[];renderPlatformAI()});
 $$('[data-ai-preset]').forEach(el=>el.onchange=()=>{x.limits[el.dataset.aiPreset]=el.value==='custom'?(x.p===KM_PLATFORM?15:40):+el.value;x.generated=false;x.results=[];renderPlatformAI()});
 $$('[data-ai-limit]').forEach(el=>el.oninput=()=>{x.limits[el.dataset.aiLimit]=+el.value;for(const r of x.results.filter(r=>r.field.key===el.dataset.aiLimit)){r.limit=Math.min(+el.value,aiFieldLimit(x.w,x.p,r.asset,r.field.key)||Infinity);const counter=$(`[data-ai-length="${r.key}"]`);if(counter)counter.textContent=`${[...r.text].length} / ${r.limit} 字`}});
 $$('[name="aiOverwrite"]').forEach(el=>el.onchange=()=>{x.overwrite=el.value==='true'});
 $('#platformAIGenerate').onclick=()=>generatePlatformAI();
 $$('[data-ai-result]').forEach(el=>el.oninput=()=>{const r=x.results.find(r=>r.key===el.dataset.aiResult);r.text=el.value;$(`[data-ai-length="${r.key}"]`).textContent=`${[...r.text].length} / ${r.limit} 字`});
 $$('[data-ai-regenerate]').forEach(el=>el.onclick=()=>generatePlatformAI(el.dataset.aiRegenerate));
 $('#platformAIApply').onclick=()=>{
  const error=platformAIError(x)||(x.w!==state.wizard?'任务已变化，请重新打开生成窗口':valid.some(r=>!r.text.trim())?'请填写生成内容':valid.some(r=>[...r.text].length>r.limit)?'内容超过字数上限，请修改或重新生成':'');
  if(error){$('#modalError').textContent=error;return}
  const result=applyPlatformCopies(x.w,x.p,valid,x.overwrite);x.w.aiLimits ||= {};x.w.aiLimits[x.p]={...x.limits};closeModal();render();toast(result.applied?`已应用 ${result.applied} 项${result.skipped?'；保留 '+result.skipped+' 项已有内容':''}`:'所选字段已有内容，已保留；可选择覆盖后重新应用');
 };
}
const platformSectionBeforeAI=renderPlatformSection;
function renderPlatformAIControls(p){
 const count=aiSelectedAssets(state.wizard,p).length;
 return `<div class="platform-ai-actions"><span class="ai-selection-count">已勾选 ${count} 份</span><button class="btn small" data-action="platform-ai" data-platform="${p}" ${count?'':'disabled'}>✧ ${['抖音',CP_PLATFORM,KM_PLATFORM].includes(p)?'AI生成标题':'AI生成文案'}</button></div>`;
}
renderPlatformSection=function(p){
 const html=platformSectionBeforeAI(p),controls=renderPlatformAIControls(p);
 return html.replace('<div class="config-toolbar">','<div class="config-toolbar">'+controls);
};
Object.assign(actions,{'platform-ai':el=>openPlatformAI(el.dataset.platform)});
document.addEventListener('change',e=>{const t=e.target,w=state.wizard;if(!w)return;if(t.dataset.aiAll){const p=t.dataset.aiAll;w.aiSelections ||= {};w.aiSelections[p]=t.checked?platformAssets(w,p).map(a=>a.id):[];render()}if(t.dataset.aiAsset){const p=t.dataset.aiPlatform;w.aiSelections ||= {};const selected=new Set(w.aiSelections[p]||[]);t.checked?selected.add(t.dataset.aiAsset):selected.delete(t.dataset.aiAsset);w.aiSelections[p]=[...selected];render()}});
render();
