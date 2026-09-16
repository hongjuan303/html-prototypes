import {durationLabel} from './creation-ui.js?v=20260916-publish1';
// Full narration uses one continuous spoken story; source clips supply the visuals.
// The parent review screen owns playback, saving, versioning and issue feedback.
export function fullNarrationPanel(b, o, {reviewTab = 'junction', locked = false} = {}, h) {
  const {button, esc, tag, fmt} = h;
  const segments = o.segments || [];
  const count = text => [...String(text || '').replace(/\s/g, '')].length;
  const totalCharacters = segments.reduce((sum, s) => sum + count(s.text), 0);
  const rangeLabel = durationLabel(String(b.config.duration||''));
  const source = s => `第 ${esc(s.sourceEp)} 集 · ${fmt(s.sourceStart)}–${fmt(s.sourceEnd)}`;
  const evidence = s => esc(s.evidence || s.fact || '请对照原片检查这段解说的事实依据。');
  const label = (s, i) => esc(s.label || `第 ${i + 1} 段`);
  const tabs = `<div class="tabs">${[
    ['junction', '图文对应'], ['timeline', '完整结构'], ['narration', '全文与包装']
  ].map(([id, title]) => button(title, 'review-tab', reviewTab === id ? 'active' : '', `data-value="${id}"`)).join('')}</div>`;
  const overview = `<div class="full-narration-meta">${tag('全解说', 'green')}<span>成片目标 ${esc(rangeLabel)} · 故事板 ${fmt(o.duration)}</span></div>`;

  if (!segments.length) return tabs + overview + '<div class="empty"><h2>暂无解说片段</h2><p>请返回内容方案重新整理。</p></div>';

  if (reviewTab === 'timeline') {
    return tabs + overview + `<p class="helper full-narration-intro">按配音时长检查段落与画面衔接。</p>
      <div class="timeline-list full-narration-timeline">${segments.map((s, i) => `<button type="button" class="segment narration" data-action="junction" data-index="${i}">
        <span class="time-label">${fmt(s.start)}<br>— ${fmt(s.end)}</span>
        <span><strong>${label(s, i)}</strong><p>${esc(s.text)}</p><small>画面来源：${source(s)}</small><small>音轨：解说覆盖本段 · 原片人声关闭${b.config.bgm ? ' · BGM 配乐' : ''}</small></span>
      </button>`).join('')}</div>
      <p class="helper">检查转折、人物称呼和事件顺序是否连贯。</p>`;
  }

  if (reviewTab === 'narration') {
    return tabs + overview + `<div class="toolbar full-narration-script-head"><h2>完整解说文案</h2><span class="muted" data-full-narration-count>已保存 ${totalCharacters} 字 · ${segments.length} 段</span></div>
      <p class="helper full-narration-intro">修改后需重新检查配音时长、字幕和画面，并重新确认。</p>
      <div class="full-narration-editor">${segments.map((s, i) => `<div class="full-narration-script">
        <div class="section-heading"><label for="fullNarration${i}"><strong>第 ${i + 1} 段 · ${label(s, i)}</strong></label><span class="time-label">${fmt(s.start)}–${fmt(s.end)}</span></div>
        <textarea id="fullNarration${i}" data-full-narration="${i}" aria-label="第${i + 1}段解说文案" rows="${Math.min(10, Math.max(4, Math.ceil(count(s.text) / 32)))}" ${locked ? 'disabled' : ''}>${esc(o.narrationDraft?.[i]??s.text)}</textarea>
        <p class="helper">画面来源：${source(s)}</p>
      </div>`).join('')}</div>
      <div class="actions full-narration-actions">${button('保存全文', 'save-full-narration', 'secondary', locked ? 'disabled' : '')}${button('试听全文', 'speak', 'text-btn')}</div>
      <p class="helper">试听已保存文案 · 浏览器音色示例</p>
      <div class="list-row"><div><b>人声与配乐</b><p>解说作为主要人声，原片人声关闭。${b.config.bgm ? 'BGM 按叙事情绪编排，并避让解说。' : '当前未添加 BGM。'}</p></div>${tag('混音方案示意')}</div>
      <div class="list-row"><div><b>字幕与小标题</b><p>${b.config.subtitles ? '字幕按全篇解说生成，需在实际配音后对齐' : '当前未开启新增解说字幕'} · ${b.config.title ? '小标题避开字幕区' : '不添加小标题'}</p></div></div>`;
  }

  return tabs + overview + `<div class="toolbar full-narration-script-head"><h2>${segments.length} 段图文对应</h2></div>
    <p class="helper full-narration-intro">检查解说与画面是否对应，点击定位查看片段。</p>
    <div class="narration-source-list">${segments.map((s, i) => `<article class="junction narration-map-card">
      <div class="inline-row"><strong>${fmt(s.start)}–${fmt(s.end)} · ${label(s, i)}</strong>${button('定位画面', 'junction', 'text-btn', `data-index="${i}"`)}</div>
      <div class="from">本段解说</div><blockquote>${esc(s.text)}</blockquote>
      <div class="to">对应原片画面 · ${source(s)}</div>
      <details class="source-evidence"><summary>剧情依据</summary><p class="full-narration-evidence">${evidence(s)}</p></details>

    </article>`).join('')}</div>`;
}
