/* V2 · supplier film upload: batch selection, episode mapping and validation. */
function filmReleasePicker(selected, fixed = false) {
  if (!fixed) return '<div class="film-release-select">' + livePicker('filmRelease', '实际发行渠道', V13_RELEASE_OPTIONS, v13ReleaseSelection(selected), true) + '</div>';
  const tags = v13ReleaseSelection(selected).map(value => '<span class="live-select-tag">' + esc(V13_RELEASE_OPTIONS.find(([key]) => key === value)?.[1] || value) + '</span>').join('');
  return '<div class="film-release-select"><button type="button" class="film-release-readonly" disabled aria-label="实际发行渠道，商务已确认"><span class="live-selected">' + (tags || '—') + '</span><span class="chevron">⌄</span></button></div>';
}
(() => {
  const previousBody = dialogBody, previousDialog = dialog, previousSubmit = submitDialog;
  const current = () => ui.modal?.type === 'v2-film-upload' ? ui.modal : null;
  const locked = (r, index) => r.filmStatus === '驳回' && r.episodeFiles.some(e => e.index === index && e.result === '通过');
  function state(m) {
    const d = m.draft;
    d.release = v13ReleaseSelection(d.release || val(m.id).release);
    d.uploadRows ||= (d.files || []).map(meta => ({ key: crypto.randomUUID(), index: meta.index, name: meta.name, size: meta.size, meta, status: 'ready' }));
    return d;
  }
  function problem(row, rows, r) {
    if (row.status === 'checking') return '正在读取视频信息';
    if (row.status === 'failed') return row.error;
    if (!row.index || row.index < 1 || row.index > r.episodes) return '视频数量超出合集总集数，请移除多余视频';
    if (locked(r, row.index)) return '该集已审核通过，无需重新上传';
    if (rows.filter(e => e.index === row.index).length > 1) return '集序重复，请调整集序或移除重复文件';
    return '';
  }
  function sync(m) {
    const d = state(m), r = val(m.id);
    d.files = d.uploadRows.filter(e => !problem(e, d.uploadRows, r)).map(e => ({ ...e.meta, index: e.index, version: (r.episodeFiles.find(old => old.index === e.index)?.version || 0) + 1 }));
    return d;
  }
  function facts(m) {
    const d = sync(m), r = val(m.id);
    const effective = Array.from({ length: r.episodes }, (_, i) => d.files.find(e => e.index === i + 1) || r.episodeFiles.find(e => e.index === i + 1));
    const ready = effective.filter(e => e && e.result !== '驳回');
    return { r, d, ready: ready.length, duration: ready.reduce((sum, e) => sum + (Number(e.duration) || 0), 0), errors: d.uploadRows.filter(e => e.status !== 'checking' && problem(e, d.uploadRows, r)).length, checking: d.uploadRows.filter(e => e.status === 'checking').length };
  }
  function refresh(m, focus) {
    if (ui.modal !== m) return;
    const scroll = root.querySelector('.dialog-body')?.scrollTop || 0;
    state(m).sampleOpen = !!root.querySelector('.film-upload-samples')?.open;
    sync(m); render();
    root.querySelector('.dialog-body').scrollTop = scroll;
    if (focus) root.querySelector(focus)?.focus({ preventScroll: true });
  }
  function episodeFromName(name) {
    const base = name.replace(/\.[^.]+$/, '');
    const match = base.match(/第\s*(\d+)\s*[集话]/) || base.match(/(?:^|[^a-z])(?:ep|e|episode)[\s._-]*(\d+)(?:\D|$)/i) || base.match(/^(\d+)(?:$|[\s._-])/);
    return match ? Number(match[1]) : 0;
  }
  async function addFiles(files, targetKey = '', targetIndex = 0) {
    const m = current(); if (!m || m.draft.channelsOnly || !files.length) return;
    const d = state(m), r = val(m.id), target = d.uploadRows.find(e => e.key === targetKey);
    if (targetKey && !target || targetIndex && locked(r, targetIndex)) return;
    const ordered = [...files].sort((a, b) => (episodeFromName(a.name) && episodeFromName(b.name) ? episodeFromName(a.name) - episodeFromName(b.name) : 0) || a.name.localeCompare(b.name, 'zh-CN', { numeric: true }));
    const added = [];
    for (const file of targetKey || targetIndex ? ordered.slice(0, 1) : ordered) {
      const explicit = target?.index || targetIndex;
      const available = Array.from({ length: r.episodes }, (_, i) => i + 1).find(index => !locked(r, index) && !d.uploadRows.some(e => e.index === index) && !r.episodeFiles.some(e => e.index === index && e.result !== '驳回')) || 0;
      const overflow = Math.max(r.episodes, ...d.uploadRows.map(e => e.index)) + 1;
      const row = { key: crypto.randomUUID(), index: explicit || available || overflow, name: file.name, size: file.size, status: 'checking' };
      // Keep the previous selection until its replacement validates successfully.
      if (target) row.replaces = target.key;
      d.uploadRows.push(row); added.push([row, file]);
    }
    refresh(m);
    for (const [row, file] of added) {
      if (ui.modal !== m) return;
      try {
        const metadata = await v2VideoMetadata(file);
        if (ui.modal !== m || !d.uploadRows.includes(row)) continue;
        const meta = await v2Remember(file, { ...metadata, index: row.index, result: '', opinion: '' });
        if (ui.modal !== m || !d.uploadRows.includes(row)) continue;
        Object.assign(row, { meta, status: 'ready' });
        if (row.replaces) d.uploadRows = d.uploadRows.filter(e => e.key !== row.replaces);
      } catch (e) {
        if (ui.modal !== m) return;
        Object.assign(row, { status: 'failed', error: e.message });
      }
      refresh(m);
    }
    if (ui.modal === m) { const f = facts(m); announce(f.errors ? '视频已读取，请处理列表中标出的异常' : '视频已添加，请核对集序和总集数'); }
  }
  const sizeText = bytes => Number.isFinite(bytes) ? bytes < 1024 * 1024 ? Math.max(1, Math.round(bytes / 1024)) + ' KB' : (bytes / 1024 / 1024).toFixed(1) + ' MB' : '—';
  function orderedRows(m) {
    const d = state(m), r = val(m.id);
    return [...r.episodeFiles.filter(e => !d.uploadRows.some(row => row.index === e.index)).map(meta => ({ key: 'old-' + meta.index, index: meta.index, name: meta.name, size: meta.size, meta, existing: true })), ...d.uploadRows].sort((a, b) => (a.index || Infinity) - (b.index || Infinity));
  }
  function movable(m, rows, position, step) {
    const row = rows[position], other = rows[position + step], r = val(m.id);
    return !m.draft.channelsOnly && !m.draft.uploadRows.some(e => e.status === 'checking') && row && other && !row.existing && !other.existing && !locked(r, row.index) && !locked(r, other.index) && rows.filter(e => e.index === row.index).length === 1 && rows.filter(e => e.index === other.index).length === 1;
  }
  function moveButtons(m, rows, position) {
    return '<span class="film-order-actions">' + [-1, 1].map(step => {
      const label = step < 0 ? '上移' : '下移', row = rows[position];
      return '<button type="button" class="film-order-button" data-act="film-upload-move" data-id="' + row.key + '|' + step + '" aria-label="' + label + esc(row.name) + '" title="' + label + '"' + (movable(m, rows, position, step) ? '' : ' disabled') + '><svg viewBox="0 0 20 20" width="18" height="18" fill="none" aria-hidden="true"><path d="' + (step < 0 ? 'M10 16V4m-4 4 4-4 4 4' : 'M10 4v12m-4-4 4 4 4-4') + '" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg></button>';
    }).join('') + '</span>';
  }
  function fileInput(label, key = '', index = 0) {
    return '<label class="film-file-action">' + label + '<input type="file" accept="video/*" data-film-files data-film-replace="' + key + '" data-film-target="' + index + '" aria-label="' + label + '视频' + (index ? '第' + index + '集' : '') + '"></label>';
  }
  function uploadRows(m) {
    const d = state(m), r = val(m.id);
    const rows = orderedRows(m);
    return rows.map((row, position) => {
      const issue = row.existing ? row.meta.result === '驳回' ? row.meta.opinion || '审核驳回，请替换视频' : '' : problem(row, d.uploadRows, r);
      const checking = row.status === 'checking', readonly = row.existing && (d.channelsOnly || locked(r, row.index));
      const status = checking ? '校验中' : issue ? row.existing ? '待替换' : '校验未通过' : row.existing && locked(r, row.index) ? '审核通过' : row.existing ? '已上传' : '可提交';
      return '<tr data-film-row="' + row.key + '" class="' + (issue && !checking ? 'film-row-error' : '') + '"><td><strong>第' + row.index + '集</strong></td><td><div class="film-file-name">' + esc(row.name) + '</div>' + (issue && !checking ? '<p class="film-row-message" role="status">' + esc(issue) + '</p>' : '') + '</td><td><span>' + sizeText(row.size) + (row.meta ? ' · ' + v2Duration(row.meta.duration || 0) : '') + '</span>' + (row.meta?.width ? '<small>' + row.meta.width + ' × ' + row.meta.height + '</small>' : '') + '</td><td><span class="tag ' + (checking ? 'blue' : issue ? 'red' : 'green') + '">' + status + '</span></td><td>' + (readonly ? '<span class="muted">保留原视频</span>' : '<div class="film-row-actions">' + (!row.existing ? moveButtons(m, rows, position) : '') + fileInput(row.existing ? '替换' : '重选', row.existing ? '' : row.key, row.existing ? row.index : 0) + (!row.existing ? act('移除', 'film-upload-remove', row.key) : '') + '</div>') + '</td></tr>';
    }).join('') || '<tr><td colspan="5" class="film-upload-empty">暂无视频，请将正片拖入上方区域或批量选择文件</td></tr>';
  }
  function supporting(m) {
    const { r, d } = facts(m);
    const fixed = v13BusinessConfirmed(r);
    const selected = fixed ? r.release : d.release;
    const rows = opinionQualityRows(r).map(html => { const row = document.createElement('tbody'); row.innerHTML = html; row.querySelector('tr')?.lastElementChild?.remove(); return row.innerHTML; }).join('');
    const compact = '<table><thead><tr><th>评估渠道／角色</th><th>审核结果</th><th>审核备注</th></tr></thead><tbody>' + rows + '</tbody></table>';
    const hint = fixed ? '商务已确认，发行渠道不可修改' : v13DeliveryExists(r) ? '待商务核对确认，确认前可修改' : '支持多选，提交后由商务核对确认';
    return '<section class="film-upload-context"><div class="film-channel-toolbar"><h3 class="changed-field">发行渠道 ' + mark(3) + '</h3><button type="button" class="btn film-opinion-toggle" data-act="film-upload-opinions" aria-expanded="' + !!d.opinionOpen + '" aria-controls="film-channel-opinions">查看渠道与商务意见<span class="film-disclosure" aria-hidden="true">⌄</span></button></div><div id="film-channel-opinions" class="film-opinion-content"' + (d.opinionOpen ? '' : ' hidden') + '>' + compact + '</div><div class="film-channel-heading"><strong class="changed-field"><b class="required">*</b> 实际发行渠道</strong><span class="muted">' + hint + '</span></div>' + filmReleasePicker(selected, fixed) + '</section>';
  }
  function body(m) {
    const f = facts(m), { r, d } = f;
    const samples = r.demoScenario?.startsWith('v24-film-') ? '<details class="film-upload-samples"' + (d.sampleOpen ? ' open' : '') + '><summary>演示素材</summary><div>' + act('填入合格样片', 'v24-fill-film-sample', r.id) + '<a href="./assets/review-demo-720p.webm" download="第1集.webm">下载合格样片</a><a href="./assets/demo-360p.webm" download="第1集-不合格.webm">下载不合格样片</a></div></details>' : '';
    return '<section class="film-upload-main"><div class="film-section-heading"><h3 class="changed-field">批量上传正片 ' + mark(1) + '</h3><span>合集总集数 <strong>' + r.episodes + '</strong> 集</span></div><label class="film-dropzone" data-film-drop><input type="file" accept="video/*" multiple data-film-files aria-label="批量选择正片视频"><svg viewBox="0 0 32 32" width="32" height="32" fill="none" aria-hidden="true"><path d="M8 20H6a4 4 0 0 1-1-7.9A10 10 0 0 1 24 10a5 5 0 0 1 2 9.6h-2M16 25V12m-5 5 5-5 5 5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg><div><strong>将视频拖拽到此处，或<span>点击批量选择</span></strong><p>支持一次选择多个视频 · 视频短边不低于 720 像素</p></div></label><div class="film-upload-toolbar"><h3 class="changed-field">视频列表 ' + mark(2) + '</h3><div class="film-upload-count" aria-live="polite">已就绪 <strong>' + f.ready + ' / ' + r.episodes + '</strong> 集<span>总时长 ' + v2Duration(f.duration) + '</span>' + (f.checking ? '<span>校验中 ' + f.checking + ' 个</span>' : f.errors ? '<span class="error">异常 ' + f.errors + ' 个</span>' : '') + '</div>' + samples + '</div><p class="film-order-hint">视频按列表顺序确定集序，可通过操作列的 ↑ ↓ 调整顺序。' + (r.filmStatus === '驳回' ? '已通过分集保留，仅需替换驳回分集。' : '') + '</p><div class="film-upload-table-wrap"><table class="film-upload-table"><colgroup><col style="width:76px"><col><col style="width:135px"><col style="width:110px"><col style="width:170px"></colgroup><thead><tr><th><span class="changed-field">集序</span></th><th>视频文件</th><th>大小 / 时长</th><th>校验状态</th><th>操作</th></tr></thead><tbody>' + uploadRows(m) + '</tbody></table></div></section>' + supporting(m);
  }
  dialogBody = m => {
    if (m.type === 'v2-auth') {
      m.draft.release = v13ReleaseSelection(m.draft.release || val(m.id).release);
      const content = previousBody(m);
      const field = '<div class="field"><span><b class="required">*</b> <span class="changed-field">发行渠道</span> ' + mark(1) + '</span>' + filmReleasePicker(m.draft.release) + '</div>';
      content[0] = '授权书上传 · ' + val(m.id).name;
      content[1] = field + content[1].replace(mark(1), '');
      return content;
    }
    if (m.type === 'v13-business-confirm') {
      m.draft.release = v13ReleaseSelection(m.draft.release);
      const content = previousBody(m), dom = document.createElement('div'); dom.innerHTML = content[1];
      const checks = dom.querySelector('[name="v13release"]')?.closest('.check-list');
      if (checks) checks.outerHTML = filmReleasePicker(m.draft.release);
      content[1] = dom.innerHTML; return content;
    }
    if (m.type !== 'v2-film-upload') return previousBody(m);
    let content = body(m);
    if (m.draft.channelsOnly) {
      const dom = document.createElement('div'); dom.innerHTML = content;
      dom.querySelector('.film-dropzone')?.remove(); dom.querySelector('.film-upload-samples')?.remove(); dom.querySelector('.film-order-hint')?.remove();
      dom.querySelector('.film-section-heading h3').innerHTML = '已提交正片 ' + mark(1);
      content = dom.innerHTML;
    }
    return [(m.draft.channelsOnly ? '修改发行渠道 · ' : '上传正片 · ') + val(m.id).name, content, m.draft.channelsOnly ? '保存发行渠道' : '提交正片审核', 4];
  };
  dialog = m => {
    let html = previousDialog(m);
    if (m.type !== 'v2-film-upload') return html;
    const f = facts(m);
    html = html.replace('class="dialog ', 'class="dialog film-upload-dialog ');
    return html.replace('<footer>', '<footer><span class="film-upload-footer-state" aria-live="polite">' + (m.draft.channelsOnly ? '仅修改待确认渠道，正片审核继续进行' : f.checking ? '正在校验视频，请稍候' : f.errors ? '请处理 ' + f.errors + ' 个异常文件' : f.ready < f.r.episodes ? '还需补齐 ' + (f.r.episodes - f.ready) + ' 集合格视频' : '已就绪 ' + f.ready + ' 集，请核对后提交') + '</span>');
  };
  const previousUploadAction = clickActions['v2-film-upload'];
  clickActions['v2-film-upload'] = r => {
    if (v13DeliveryExists(r) && !v13BusinessConfirmed(r) && ['审核中', '通过'].includes(r.filmStatus)) return openModal('v2-film-upload', r.id, { files: [], release: [...r.release], channelsOnly: true });
    previousUploadAction(r);
  };
  clickActions['film-upload-opinions'] = () => { const m = current(); if (!m) return; m.draft.opinionOpen = !m.draft.opinionOpen; refresh(m, '[data-act="film-upload-opinions"]'); };
  const previousPick = clickActions['live-pick'];
  clickActions['live-pick'] = (_, id) => {
    const [key, encoded] = id.split('|'), m = ui.modal;
    if (key !== 'filmRelease' || !['v2-film-upload', 'v13-business-confirm', 'v2-auth'].includes(m?.type)) return previousPick(_, id);
    if (m.type === 'v2-film-upload' && v13BusinessConfirmed(val(m.id))) return announce('商务已确认，发行渠道不可修改');
    const value = decodeURIComponent(encoded), d = m.draft;
    d.release = v13ReleaseSelection(d.release);
    if (!v2Release().includes(value) && !d.release.includes(value)) return;
    const picker = root.querySelector('[data-picker="filmRelease"]'), opened = picker?.open;
    const keyword = picker?.querySelector('[data-live-search]')?.value || '';
    d.release = d.release.includes(value) ? d.release.filter(v => v !== value) : [...d.release, value];
    if (m.type === 'v2-film-upload') refresh(m); else render();
    const next = root.querySelector('[data-picker="filmRelease"]');
    if (opened && next) { next.open = true; livePositionPicker(next); const search = next.querySelector('[data-live-search]'); search.value = keyword; search.dispatchEvent(new Event('input', { bubbles: true })); search.focus({ preventScroll: true }); }
  };
  clickActions['film-upload-move'] = (_, id) => {
    const m = current(); if (!m) return;
    const [key, direction] = id.split('|'), step = Number(direction), rows = orderedRows(m), position = rows.findIndex(e => e.key === key);
    if (![-1, 1].includes(step) || !movable(m, rows, position, step)) return;
    const row = rows[position], other = rows[position + step];
    [row.index, other.index] = [other.index, row.index];
    refresh(m, '[data-film-row="' + key + '"] .film-order-button:not(:disabled)');
    announce('已调整为第' + row.index + '集');
  };
  clickActions['film-upload-remove'] = (_, key) => {
    const m = current(); if (!m || m.draft.channelsOnly) return;
    const d = state(m); d.uploadRows = d.uploadRows.filter(e => e.key !== key);
    if (!val(m.id).episodeFiles.length) {
      const positions = [...new Set(d.uploadRows.map(e => e.index))].sort((a, b) => a - b);
      d.uploadRows.forEach(e => { e.index = positions.indexOf(e.index) + 1; });
    }
    refresh(m);
  };
  clickActions['v24-fill-film-sample'] = async r => {
    const m = current(); if (!m || !r.demoScenario?.startsWith('v24-film-') || m.fillingSample) return;
    m.fillingSample = true;
    try {
      const response = await fetch(V24_SAMPLE.url); if (!response.ok) throw Error('样片加载失败，请重试');
      const blob = await response.blob(); if (ui.modal !== m) return;
      const rows = state(m).uploadRows, files = [];
      for (let index = 1; index <= r.episodes; index++) if (!locked(r, index) && !rows.some(row => row.index === index) && !r.episodeFiles.some(e => e.index === index && e.result !== '驳回')) files.push(new File([blob], '演示正片-第' + index + '集.webm', { type: blob.type }));
      if (files.length) await addFiles(files); else announce('当前分集已齐备，请核对列表');
    } catch (e) { if (ui.modal === m) announce(e.message); }
    finally { m.fillingSample = false; }
  };
  root.addEventListener('change', event => {
    if (!current()) return;
    const input = event.target;
    if (input.hasAttribute('data-film-files')) { event.stopImmediatePropagation(); addFiles([...input.files], input.dataset.filmReplace, Number(input.dataset.filmTarget || 0)); input.value = ''; }
  }, true);
  ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(type => root.addEventListener(type, event => {
    if (!current() || !event.dataTransfer?.types.includes('Files')) return;
    event.preventDefault();
    const zone = event.target.closest('[data-film-drop]'); if (!zone) return;
    if (type === 'dragenter' || type === 'dragover') { zone.classList.add('is-dragging'); event.dataTransfer.dropEffect = 'copy'; }
    if (type === 'dragleave' && !zone.contains(event.relatedTarget)) zone.classList.remove('is-dragging');
    if (type === 'drop') { zone.classList.remove('is-dragging'); addFiles([...event.dataTransfer.files]); }
  }));
  submitDialog = form => {
    const m = current(); if (!m) return previousSubmit(form);
    const r = val(m.id), d = state(m);
    if (d.channelsOnly) {
      if (v13BusinessConfirmed(r)) { render(); return error('商务已确认，发行渠道不可修改。'); }
      if (!v13DeliveryExists(r)) return error('请先提交正片和发行渠道。');
      if (!d.release.length || d.release.some(c => !v2Release().includes(c))) return error('请至少选择一个有效发行渠道。');
      r.release = [...d.release]; recordLog(r, '供应商修改待商务确认的发行渠道：' + r.release.join('、')); persist(); closeModal(); announce('发行渠道已更新，待商务核对确认'); return;
    }
    const f = facts(m);
    let message = f.checking ? '视频正在校验，请稍候再提交。' : f.errors ? '请先处理视频列表中的异常文件或重复集序。' : f.ready !== f.r.episodes ? '视频数量与合集总集数不一致：需要 ' + f.r.episodes + ' 集，当前已就绪 ' + f.ready + ' 集，请补齐或调整。' : '';
    if (message) { error(message); root.querySelector('#dialog-error')?.scrollIntoView({ block: 'nearest' }); return; }
    previousSubmit(form);
  };
  V2_NOTES['v2-film-upload'] = v13Note('供应商上传正片', '批量上传视频，核对集序、视频数量与校验结果后提交审核。', [
    ['配置项', [['批量上传正片', '支持拖拽多个视频或点击批量选择；读取真实视频尺寸与时长，短边须≥720像素。每个文件独立校验，失败不会丢弃同批其他文件。']]],
    ['列表项', [['集序', '集序只读展示为第X集，删除下拉选择。首次上传按文件名数字自然排序依次编号；操作列上移／下移箭头交换相邻本次视频，集序同步更新，首行上移、末行下移置灰。校验期间不可调整；已提交或已通过分集不参与换位。'], ['视频文件', '上传后逐行展示原文件名、大小、时长、分辨率、校验状态及异常原因。可重选或移除本次文件；首次上传移除后连续编号，多余视频标错并阻止提交。驳回复审时保留已通过分集及集序。'], ['总集数', '显示合集总集数、已就绪视频集数和总时长；校验中或不合格视频不计入已就绪，数量必须与合集总集数一致。']]],
    ['配置项', [['查看渠道与商务意见', '以明显按钮展示，点击向下展开、再次点击收起；逐渠道及商务展示审核结果和完整备注，无分页，不显示审核人员，不打开新弹窗。'], ['实际发行渠道', '下拉多选，沿用用户截图中的26项线上渠道名称及顺序；支持搜索、已选标签回显与移除，至少选择一项。与平台商务核对使用同一枚举，不使用意向渠道或全渠道汇总选项。商务确认后回显并锁定，不可修改。']]],
    ['操作项', [['提交正片审核', '校验数量、集序、视频规格及渠道；首次补齐全部分集，复审替换全部驳回分集。提交后正片审核与商务渠道确认并行，不因正片提交自动确认渠道。'], ['修改发行渠道', '正片已提交且商务未确认时允许只修改渠道；已提交视频只读，不重提正片或改变审核轮次。保存及正片重提时均再次校验商务确认状态。'], ['取消', '不改已提交视频、渠道或审核结果；正在读取的文件不写入业务记录。']]]
  ]);
  V2_NOTES['v2-film-upload'].caution = '11.18 更新。';
  const previousNote = noteInfo;
  noteInfo = () => {
    if (!current()?.draft.channelsOnly) return previousNote();
    const base = V2_NOTES['v2-film-upload'];
    return { ...base, page: '代理发行 V2 · 修改发行渠道', goal: '商务确认前维护发行渠道，已提交正片保持原审核流程。', sections: [
      ['列表项', [['已提交正片', '展示合集总集数，当前入口不上传或替换视频。']]],
      ['列表项', [['视频列表', '回显已提交视频、集序及文件信息，只读查看，保持已有正片审核状态与轮次。']]],
      base.sections[2],
      ['操作项', [['保存发行渠道', '至少选择一个实际渠道，保存后供商务核对确认；保存时再次校验尚未确认，已确认则提示不可修改。'], ['取消', '放弃本次渠道修改，保留此前提交。']]]
    ] };
  };
})();
