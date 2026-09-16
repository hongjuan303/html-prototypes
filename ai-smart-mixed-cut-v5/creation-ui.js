import {MODES,CREATION_MODES,RANGES,analysisInfo,estimate,isFullNarration,validate} from './engine.js?v=20260916-publish1';
import {resolveSource} from './sources.js?v=20260916-publish1';

export const BGM_MOODS=[{id:'tension',name:'悬念推进'},{id:'rise',name:'逆袭时刻'},{id:'soft',name:'情感叙事'}];
export const BGM_TRACKS=[{id:'auto',name:'自动匹配',mood:null},{id:'tension-01',name:'暗涌',mood:'tension'},{id:'rise-01',name:'破局',mood:'rise'},{id:'soft-01',name:'心事',mood:'soft'}];
export function bgmSelectionLabel(c){
 const mood=BGM_MOODS.find(item=>item.id===c.music)?.name||'悬念推进';
 const track=BGM_TRACKS.find(item=>item.id===(c.bgmTrack||'auto'))||BGM_TRACKS[0];
 return track.id==='auto'?mood+' · 自动匹配':track.name+' · '+(BGM_MOODS.find(item=>item.id===track.mood)?.name||mood);
}
export function durationLabel(value){
 if(!value)return '待选择时长';
 if(value.endsWith('s'))return '约 '+value.slice(0,-1)+' 秒';
 return value.includes('-')?value.replace('-','–')+' 分钟':'约 '+value+' 分钟';
}
export function renderCreationPreview(c,{esc}){
 const narrated=c.mode==='narrated',full=isFullNarration(c),chosen=!narrated||['mixed','full'].includes(c.narrationStructure);
 const speed=c.narrationSpeed||1,narrationLength=c.narrationSeconds?c.narrationSeconds+' 秒解说':'待选解说时长';
 const flow=!narrated?[
  '高光开场 · 原片 '+c.speed+'×','完整对白推进','悬念收尾'
 ]:full?[
  '完整剧情解说 · '+speed+'×','匹配原片画面 · 人声关闭'
 ]:chosen?(c.position==='middle'?[
  '高光原片开场 · '+c.speed+'×',narrationLength+'承接 · '+speed+'×','原片原声推进 · '+c.speed+'×','悬念收尾'
 ]:[narrationLength+'引入 · '+speed+'×','原片原声推进 · '+c.speed+'×','悬念收尾']):['待选择解说结构'];
 const title=String(c.titleText||'').trim();
 const modeLabel=!narrated?'高光混剪':full?'全解说':chosen?'解说＋原片':'AI 解说 · 待选择结构';
 return `<div class="preview-heading"><h2>成片结构</h2><span class="tag">${esc(c.count)} 条</span></div><div class="preview-cover configuration-cover"><img src="./assets/drama-confrontation.jpg" alt="虚构剧情人物示意"><span class="tag">虚构剧照 · 9:16</span>${c.title?`<div class="preview-title-overlay">${esc(title||'待输入引流小标题')}</div>`:''}${chosen&&(c.subtitles||!full)?`<div class="preview-subtitle-overlay">${full?'解说字幕':narrated&&c.subtitles?'解说与原片字幕':'原片字幕'}</div>`:''}</div><h3>${modeLabel}</h3><p class="preview-duration">${chosen?esc(durationLabel(c.duration)):'待设置时长'} · 第 ${esc(c.start)}–${esc(c.end)} 集</p><ol class="flow-list">${flow.map((text,i)=>`<li><span>${i+1}</span><div>${esc(text)}</div></li>`).join('')}</ol><div class="audio-structure" ${!chosen?'hidden':''}>${narrated&&chosen&&!full&&c.position==='middle'?'<span class="original-band">原片原声</span>':''}<span class="voice-band">${full?'全篇解说':narrated?'解说音轨':'剧情原声'}</span>${narrated&&chosen&&!full?'<span class="original-band">原片原声</span>':''}</div><dl class="preview-settings"><div><dt>字幕</dt><dd>${c.subtitles?'开启':full?'关闭':'保留原片字幕'}</dd></div><div><dt>BGM</dt><dd>${c.bgm?esc(bgmSelectionLabel(c)):'关闭'}</dd></div><div><dt>引流小标题</dt><dd>${c.title?esc(title||'待输入'):'关闭'}</dd></div></dl>`;
}
export function createForm(state,{busy},h){
 const {heading,button,esc,tag,option,field,footer,stepper,sourceLabel}=h;
 const c=state.config,info=analysisInfo(state,c),q=estimate(state,c,c.count),s=resolveSource(c);
 const narrated=c.mode==='narrated',full=isFullNarration(c),chosen=!narrated||['mixed','full'].includes(c.narrationStructure),error=validate(c);
 const blocked=busy||Boolean(error);
 footer(error?'<strong>待完成设置</strong>':`<span>预计最高</span><strong>${q.total}</strong><span>积分</span>${tag('示例计费','orange')}<small>≈ ¥${(q.total/100).toFixed(2)}</small>`,error||`新增分析 ${q.analysis} 分 + 制作 ${q.production} 分 · 正式费率待核定`,button('费用明细','quote','text-btn',error?'disabled':'')+button('直接生成','direct','secondary',blocked?'disabled':'')+button(busy?'正在整理…':'查看内容方案 →','prepare','primary',blocked?'disabled':''));
 const durations=full?['30s','60s','90s','120s','3','5','3-5','5-7','10']:Object.keys(RANGES).filter(k=>!k.endsWith('s'));
 return heading('制作素材','','','SMART MIX · V5')+stepper(0)+`
 <div class="create-grid"><div>
 <section class="section"><div class="section-heading"><h2><span class="number">1</span>片源与选集</h2><div class="actions">${button('绿台合集','source-picker','text-btn')}${button('本地上传','upload','text-btn')}</div></div>
 <div class="source-card"><img class="poster" src="./assets/drama-confrontation.jpg" alt="虚构剧目封面"><div class="source-info"><strong>${esc(s?.title||'请选择片源')}</strong><p>${esc(s?.description||'')}</p>${tag(sourceLabel())} ${tag('原片 V'+(c.source.fileVersion||1))}</div>${button('更换','source-picker','text-btn')}</div>
 <div class="range-row"><label>本次选集</label><div class="pills">${[10,20,30].map(n=>button('前 '+n+' 集','range',c.start===1&&c.end===n?'active':'','data-value="'+n+'"')).join('')}</div><label>第 <input type="number" min="1" max="40" data-config="start" aria-label="起始集数" value="${c.start}"> — <input type="number" min="1" max="40" data-config="end" aria-label="结束集数" value="${c.end}"> 集</label></div>
 <div class="analysis-bar"><span>已分析可复用 <b>${info.reused.length}</b> 集 · 本次新增 <b>${info.pending.length}</b> 集</span>${button('查看剧情','current-drama','text-btn')}</div></section>
 <section class="section"><div class="section-heading"><h2><span class="number">2</span>制作方式</h2></div>
 <div class="mode-grid two-modes">${CREATION_MODES.map((id,i)=>`<button class="mode-card ${id===c.mode?'active':''}" data-action="mode" data-value="${id}" aria-pressed="${id===c.mode}"><span class="mode-icon">${i?'≋':'✧'}</span><strong>${MODES[id].name}</strong><p>${i?'用解说讲述剧情，支持混合与全解说结构':'提炼剧情高光，保留人物原声与完整对白'}</p></button>`).join('')}</div>
 ${narrated?`<div class="narration-choice"><div class="structure-heading"><b>解说结构 <span class="required">*</span></b></div><div class="structure-options" role="group" aria-label="解说结构">${[['mixed','解说＋原片','解说与原片原声衔接，可前置或穿插'],['full','全解说','全篇解说承担叙事，原片提供对应画面']].map(([id,title,desc])=>`<button class="structure-option ${c.narrationStructure===id?'selected':''}" data-action="narration-structure" data-value="${id}" aria-pressed="${c.narrationStructure===id}"><span class="radio-dot"></span><div><b>${title}</b><p>${desc}</p></div></button>`).join('')}</div>${!chosen?'<p class="structure-hint">请选择解说结构</p>':full?'<p class="helper">全篇解说配原片画面，原片人声关闭。</p>':''}</div>`:''}
 <div class="fields">
 ${field('生成条数',`<div class="count-field">${button('−','count-minus','', 'aria-label="减少条数"')}<input aria-label="生成条数" type="number" min="1" max="20" data-config="count" value="${c.count}">${button('+','count-plus','','aria-label="增加条数"')}<div class="shortcut">${[5,10,20].map(n=>button(n+'条','count','',`data-value="${n}"`)).join('')}</div></div>`,'最多 20 条')}
 ${chosen?field(full?'全解说成片时长':'最终成片时长',`<select aria-label="最终成片时长" data-config="duration">${durations.includes(c.duration)?'':option('','请选择成片时长',c.duration)}${durations.map(d=>option(d,durationLabel(d),c.duration)).join('')}</select>`,full?'':narrated?'包含变速后的原片与解说':'按变速后的成片计算'):''}
 ${full||!chosen?'':field('原片速度',`<div class="pills">${[1,1.1,1.2,1.5].map(n=>button(n+'×','speed',n===c.speed?'active':'',`data-value="${n}"`)).join('')}</div>`)}
 ${narrated?field('解说语速',`<select aria-label="解说语速" data-config="narrationSpeed">${[0.8,1,1.1,1.2,1.5].map(n=>option(n,n+'×'+(n===1?' · 自然语速':''),c.narrationSpeed||1)).join('')}</select>`):''}
 ${narrated&&c.narrationStructure==='mixed'?field('每条解说总时长',`<select aria-label="解说总时长" data-config="narrationSeconds">${option('','请选择解说时长',c.narrationSeconds??'')}${[5,10,15,17,30,60,90,120].map(n=>option(n,n+' 秒',c.narrationSeconds)).join('')}</select>`,'按所选语速计算，不含原片原声'):''}
 ${narrated&&c.narrationStructure==='mixed'?field('解说位置',`<select aria-label="解说位置" data-config="position">${option('intro','开头引入',c.position)}${option('middle','剧情中承接',c.position)}</select>`):''}
 </div></section>
 <section class="section"><div class="section-heading"><h2><span class="number">3</span>字幕与包装</h2></div><div class="packaging">${[['subtitles',full?'解说字幕':'字幕'],['bgm','BGM'],['title','引流小标题']].map(([k,l])=>`<label class="check-label"><input type="checkbox" data-config="${k}" ${c[k]?'checked':''}>${l}</label>`).join('')}</div>${c.bgm?`<div class="bgm-selection"><div><span class="muted">BGM</span><b>${esc(bgmSelectionLabel(c))}</b></div>${button('更换BGM','bgm-picker','text-btn')}</div>`:''}${c.title?`<div class="inline-title-field">${field('引流小标题',`<input type="text" data-config="titleText" aria-label="引流小标题" maxlength="24" placeholder="输入引流小标题，最多24字" value="${esc(c.titleText||'')}">`)}</div>`:''}</section>
 </div><aside class="preview-panel" aria-live="polite">${renderCreationPreview(c,h)}</aside></div>`;
}
