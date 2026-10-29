import {titleStyleControls} from './title-style-ui.js?v=20261029-update21c';
import {creationQuote} from './creation-cost.js?v=20261029-update21c';
import {validate,outputSpeed,OUTPUT_SPEEDS} from './engine.js?v=20261029-update21c';
import {resolveSource} from './sources.js?v=20261029-update21c';
import {sourcePermissionError,isConfiguredSource} from './source-access.js?v=20261029-update21c';
import {bgmSelectionLabel} from './bgm-model.js?v=20261029-update21c';
import {durationRange,durationRangeLabel,durationDisplay,durationError,DURATION_PRESETS,secondsLabel} from './duration-range.js?v=20261029-update21c';
import {titlePreviewStyle,bgmVolumeError} from './packaging.js?v=20261029-update21c';
const requiredMark='<span class="required" aria-hidden="true">*</span>';
export const durationLabel=value=>durationRangeLabel(typeof value==='object'?value:{duration:value});
export function renderCreationPreview(c,{esc}){
 if(!isConfiguredSource(c))return '<div class="preview-heading"><h2>预计成片结构</h2></div><p class="helper">请先选择片源</p>';
 const source=resolveSource(c);if(!source?.totalEpisodes&&source?.importStatus!=='pending')return '<div class="preview-heading"><h2>预计成片结构</h2></div><p class="helper">请先添加视频</p>';
 const title=String(c.titleText||'').trim();
 return `<div class="preview-heading"><h2>预计成片结构</h2><span class="tag">${esc(c.count)} 条</span></div><div class="preview-cover configuration-cover ${c.title?'with-title-preview':''}">${source.cover?`<img src="${esc(source.cover)}" alt="当前片源封面">`:''}${c.title?`<div class="title-preview-safe"><div class="preview-title-overlay" style="${titlePreviewStyle(c)}">${esc(title||'待输入引流小标题')}</div></div>`:''}</div><h3>高光顺剪</h3><p class="preview-duration">${esc(durationRangeLabel(c))} · 第 ${esc(c.start)}–${esc(c.end)} 集</p><ol class="flow-list">${['高光开场'+(c.outputSpeed===null?'':' · '+outputSpeed(c)+'×'),'按剧情顺序推进','悬念收尾'].map((text,i)=>`<li><span>${i+1}</span><div>${esc(text)}</div></li>`).join('')}</ol><dl class="preview-settings"><div><dt>BGM</dt><dd>${c.bgm?esc(bgmSelectionLabel(c))+' · '+(bgmVolumeError(c)?'待设置音量':esc(c.bgmVolume)+'%'):'关闭'}</dd></div><div><dt>引流小标题</dt><dd>${c.title?esc(title||'待输入'):'关闭'}</dd></div></dl>`;
}
export function durationControl(c,{button,option,esc}){
 const [min,max]=durationRange(c),error=durationError(c);
 const bound=(side,label,seconds)=>{const unit=c['duration'+side+'Unit']||'m';return `<div class="duration-bound"><label for="duration${side}">${requiredMark}${label}</label><div class="duration-stepper">${button('−','duration-step','',`data-side="${side}" data-step="-1" aria-label="减少${label}"`)}<input id="duration${side}" type="number" inputmode="decimal" min="${unit==='s'?10:0.167}" max="${unit==='s'?1200:20}" step="${unit==='s'?1:'any'}" required aria-required="true" aria-label="${label}" aria-describedby="durationError" data-duration-bound="${side}" value="${esc(durationDisplay(seconds,unit))}"><select data-duration-unit="${side}" aria-label="${label}单位">${option('s','秒',unit)}${option('m','分',unit)}</select>${button('+','duration-step','',`data-side="${side}" data-step="1" aria-label="增加${label}"`)}</div></div>`;};
 return `<div class="duration-config" id="durationConfig"><label class="duration-label">最终成片时长</label><div class="duration-slider" style="--range-start:${((min||10)-10)/1190*100}%;--range-end:${((max||10)-10)/1190*100}%"><div class="duration-track"></div><input id="durationMinSlider" type="range" min="10" max="1200" step="1" value="${min||10}" data-duration-slider="Min" aria-label="最短时长滑块"><input id="durationMaxSlider" type="range" min="10" max="1200" step="1" value="${max||1200}" data-duration-slider="Max" aria-label="最长时长滑块"></div><div class="duration-scale"><span>10秒</span><span>20分钟</span></div><div class="duration-presets">${DURATION_PRESETS.map(([a,b])=>button(secondsLabel(a)+'–'+secondsLabel(b),'duration-preset',min===a&&max===b?'active':'',`data-min="${a}" data-max="${b}"`)).join('')}</div><div class="duration-bounds">${bound('Min','最短',min)}${bound('Max','最长',max)}</div><p class="duration-error" id="durationError" role="status" ${error?'':'hidden'}>${esc(error)}</p><small>按变速后的成片计算</small></div>`;
}
export function createForm(state,{busy},h){
 const {heading,button,esc,tag,option,field,footer,sourceLabel}=h,c=state.config,permissionError=sourcePermissionError(state,c),configured=isConfiguredSource(c)&&!permissionError,s=configured?resolveSource(c):null;
 const error=permissionError||validate(c),blocked=busy||Boolean(error);
 const quote=configured?creationQuote(state,c):{status:'empty'};
 let price='<strong class="cost-notice-title">待导入合集</strong>',help='';
 if(quote.status==='quoted'){
  price=`<span>预估积分消耗</span><strong class="estimated-points">${quote.total.toLocaleString()} 积分</strong>`;
 }else if(configured){
  price='<strong class="cost-notice-title">积分消耗提示</strong>';
  help=quote.status==='unknown'&&quote.cloud?`当前未拿到原片总时长，所以积分预估不准，预计原片分析成本0.5元/分钟，具体积分消耗以平台实际扣费记录为准。`:quote.status==='unknown'?`原片信息暂未完整，暂无法预估积分。`:`完善制作配置后展示预估积分。`;
 }
 footer(price,`<span id="creationCostNotice">${help}</span>${configured&&error?`<span class="creation-error">${esc(error)}</span>`:''}`,button(busy?'正在处理…':'生成视频','direct','primary',blocked?'disabled':''));

 return heading('制作素材','')+`<div class="create-grid"><div>
 <section class="section"><div class="section-heading"><h2>${requiredMark}片源与选集</h2><div class="actions">${button('导入合集','import-collection','text-btn')}</div></div>
 <div class="source-card">${s?.cover?`<img class="poster" src="${esc(s.cover)}" alt="剧目封面">`:`<span class="poster source-local-placeholder" aria-hidden="true">▹</span>`}<div class="source-info"><strong>${esc(s?.title||'请选择片源')}</strong>${configured?tag(sourceLabel().replace('国内短剧','国内合集').replace('海外短剧','海外合集')):''}</div><div class="source-card-actions">${configured?button('更换','import-collection','text-btn'):''}${c.source?.kind==='manual'&&c.source.simulated!==true&&Array.isArray(c.source.files)?button('添加视频','append-local-source','text-btn'):''}</div></div>
 ${configured&&(s.totalEpisodes>0||s.importStatus==='pending')?` <div class="range-row"><label>${requiredMark}本次选集</label><div class="pills">${[10,20,30].map(n=>button('前 '+n+' 集','range',c.start===1&&c.end===n?'active':'','data-value="'+n+'"')).join('')}</div><label>第 <input type="number" min="1" max="${s?.totalEpisodes||s?.requestedRange?.end||1}" data-config="start" required aria-required="true" aria-label="起始集数" value="${c.start}"> — <input type="number" min="1" max="${s?.totalEpisodes||s?.requestedRange?.end||1}" data-config="end" required aria-required="true" aria-label="结束集数" value="${c.end}"> 集</label></div>`:''}</section>
 <section class="section" id="creationSettings"><div class="section-heading"><h2>制作设置</h2><span class="tag">高光顺剪</span></div><div class="fields">
 ${field(requiredMark+'生成条数',`<div class="count-field">${button('−','count-minus','','aria-label="减少条数"')}<input required aria-required="true" aria-label="生成条数" type="number" min="1" max="20" data-config="count" value="${esc(c.count)}" placeholder="填写条数">${button('+','count-plus','','aria-label="增加条数"')}<div class="shortcut">${[5,10,20].map(n=>button(n+'条','count','',`data-value="${n}"`)).join('')}</div></div>`,'最多20条')}
 ${field(requiredMark+'成片速度',`<select required aria-required="true" aria-label="成片速度" data-config="outputSpeed">${option('','请选择速度',c.outputSpeed===null?'':c.outputSpeed)}${OUTPUT_SPEEDS.map(n=>option(n,n+'×',c.outputSpeed)).join('')}</select>`)}
 ${durationControl(c,h)}
 </div></section>
 <section class="section" id="packagingSettings"><div class="section-heading"><h2>包装设置</h2></div><div class="packaging">${[['bgm','BGM'],['title','引流小标题']].map(([k,l])=>`<label class="check-label"><input type="checkbox" data-config="${k}" ${c[k]?'checked':''}>${l}</label>`).join('')}</div>${c.bgm?`<div class="bgm-selection"><div><span class="muted">BGM</span><b>${esc(bgmSelectionLabel(c))}</b></div>${button('更换BGM','bgm-picker','text-btn')}</div><div class="bgm-volume-field"><label for="bgmVolumeSlider">${requiredMark}BGM音量</label><div class="bgm-volume-control"><input id="bgmVolumeSlider" data-bgm-volume type="range" min="0" max="100" step="1" value="${c.bgmVolume??20}" aria-label="BGM音量滑块"><div class="volume-number"><input id="bgmVolumeNumber" data-bgm-volume type="number" min="0" max="100" step="1" value="${c.bgmVolume??''}" required aria-required="true" aria-label="BGM音量百分比" aria-invalid="${Boolean(bgmVolumeError(c))}" aria-describedby="bgmVolumeError"><span>%</span></div></div><small id="bgmVolumeError" class="packaging-error" role="status" ${bgmVolumeError(c)?'':'hidden'}>${esc(bgmVolumeError(c)||'')}</small></div>`:''}${c.title?`<div class="inline-title-field">${field(requiredMark+'引流小标题',`<input type="text" data-config="titleText" required aria-required="true" aria-label="引流小标题" maxlength="24" placeholder="输入引流小标题，最多24字" value="${esc(c.titleText||'')}">`)}${titleStyleControls(c,h)}</div>`:''}</section>
 </div><aside class="preview-panel" aria-live="polite">${renderCreationPreview(c,h)}</aside></div>`;
}
