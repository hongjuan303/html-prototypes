(() => {
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

  const icon = (id) => `<svg class="icon"><use href="#${id}"></use></svg>`;
  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  const state = {
    currentStep: 1,
    unlockedStep: 1,
    analyzed: false,
    selectedPlan: 'conflict',
    selectedClipId: 'c1',
    playingSource: false,
    sourceTimer: null,
    finalPlaying: false,
    finalSecond: 0,
    finalTimer: null,
    modalConfirm: null,
  };

  const clips = [
    {
      id: 'c1', stage: '钩子', stageNo: '01', source: '第 1 集 · 04:12–04:21', duration: 9,
      title: '妻子带情人进入家中', reason: '关系明确、冲突直接，首秒即可理解', quote: '“他今晚不会回来。”',
      evidence: ['ASR 对白', '连续画面', '人物识别'], content: 91, ad: 95, confidence: 97, strong: true,
      scene: 'scene-a', color: '#8b5cf6', selected: true,
      alternate: { source: '第 1 集 · 03:58–04:07', title: '妻子确认丈夫行程后开门', quote: '“航班已经起飞了。”' },
    },
    {
      id: 'c2', stage: '推进', stageNo: '02', source: '第 1 集 · 04:26–04:39', duration: 13,
      title: '两人谈及丈夫与股份', reason: '利益冲突清楚，为丈夫反击提供动机', quote: '“等股份到手，一切都结束了。”',
      evidence: ['ASR 对白', 'OCR 字幕'], content: 84, ad: 87, confidence: 94, strong: true,
      scene: 'scene-b', color: '#3979dc', selected: true,
      alternate: { source: '第 1 集 · 05:03–05:15', title: '情人催促妻子推进计划', quote: '“你不能再心软了。”' },
    },
    {
      id: 'c3', stage: '反转', stageNo: '03', source: '第 2 集 · 07:03–07:15', duration: 12,
      title: '丈夫通过监控掌握证据', reason: '建立上帝视角，受害者转为局势掌控者', quote: '沈聿注视监控墙，将录像保存。',
      evidence: ['多帧画面', '人脸聚类'], content: 90, ad: 89, confidence: 96, strong: true,
      scene: 'scene-c', color: '#6366f1', selected: true,
      alternate: { source: '第 2 集 · 07:18–07:30', title: '丈夫将监控证据备份', quote: '沈聿拔出存储盘，拨通电话。' },
    },
    {
      id: 'c4', stage: '爽点', stageNo: '04', source: '第 3 集 · 02:11–02:28', duration: 17,
      title: '丈夫带媒体进入别墅', reason: '行动升级明显，画面规模与情绪同时提升', quote: '“直播不要停，跟我上楼。”',
      evidence: ['ASR 对白', '动作识别', '连续画面'], content: 88, ad: 90, confidence: 95, strong: true,
      scene: 'scene-a', color: '#ed942a', selected: true,
      alternate: { source: '第 3 集 · 02:29–02:44', title: '媒体镜头同步开启直播', quote: '多台摄影机亮起红色录制灯。' },
    },
    {
      id: 'c5', stage: '断点', stageNo: '05', source: '第 3 集 · 03:04–03:13', duration: 9,
      title: '媒体抵达卧室门外', reason: '真相揭晓前停止，悬念完整且不透支结局', quote: '急促敲门声响起，门把手转动。',
      evidence: ['音频事件', '连续画面'], content: 90, ad: 96, confidence: 98, strong: true,
      scene: 'scene-b', color: '#dc4961', selected: true,
      alternate: { source: '第 3 集 · 02:56–03:05', title: '脚步声逼近二楼房门', quote: '走廊尽头，媒体快速靠近。' },
    },
    {
      id: 'c6', stage: '候选', stageNo: '06', source: '第 2 集 · 08:42–08:54', duration: 12,
      title: '画外音暗示股份将被转移', reason: '信息有价值，但说话人身份尚未完全确认', quote: '“明天签完字，公司就是我们的。”',
      evidence: ['ASR 对白', '说话人待确认'], content: 76, ad: 71, confidence: 72, strong: false,
      scene: 'scene-c', color: '#a1a6b4', selected: false,
      alternate: { source: '第 1 集 · 04:26–04:39', title: '使用已有强证据股份对白', quote: '“等股份到手，一切都结束了。”' },
    },
  ];

  const plans = {
    conflict: {
      title: '冲突开场 · 冷静反击',
      subtitle: '用直接背叛建立仇恨，再以丈夫掌控全局完成反转',
      score: 92,
      order: ['c1', 'c2', 'c3', 'c4', 'c5'],
      narrations: [
        ['c1', '她以为丈夫仍在出差，于是把情人带回了两人的家。'],
        ['c2', '两人甚至已经算好，等股份到手便让沈聿彻底出局。'],
        ['c3', '可他们不知道，沈聿早已通过隐藏摄像头看清一切。'],
        ['c4', '他没有当场质问，而是借慈善直播之名带媒体赶到现场。'],
        ['c5', '当所有镜头停在卧室门外，这场公开审判才刚刚开始。'],
      ],
    },
    reversal: {
      title: '反转前置 · 猎人视角',
      subtitle: '先展示丈夫掌握监控证据，再回看背叛如何发生',
      score: 89,
      order: ['c3', 'c1', 'c2', 'c4', 'c5'],
      narrations: [
        ['c3', '监控屏幕前的沈聿异常冷静，因为他终于等到了完整证据。'],
        ['c1', '几个小时前，苏棠刚把周越带进家门，自信丈夫毫不知情。'],
        ['c2', '一句“股份到手”，也让这次私会暴露出更大的计划。'],
        ['c4', '沈聿没有给他们解释的机会，而是让媒体全程跟拍。'],
        ['c5', '就在卧室门即将打开时，所有人的呼吸都停了一秒。'],
      ],
    },
    suspense: {
      title: '悬念倒叙 · 破门前一秒',
      subtitle: '用媒体抵达制造疑问，再倒叙补齐背叛与复仇因果',
      score: 90,
      order: ['c5', 'c1', 'c2', 'c3', 'c4'],
      narrations: [
        ['c5', '几十台镜头为何会在深夜堵住这扇卧室门？'],
        ['c1', '一切要从苏棠把情人带回家说起。'],
        ['c2', '她不仅背叛婚姻，还和周越密谋拿走丈夫的股份。'],
        ['c3', '只是他们的每句话，都被另一端的沈聿完整保存。'],
        ['c4', '当沈聿带着直播媒体出现，猎人与猎物已经交换位置。'],
      ],
    },
  };

  function showToast(message, type = 'success') {
    const region = $('#toastRegion');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `${icon(type === 'warning' ? 'i-info' : 'i-check')}<span></span>`;
    $('span', toast).textContent = message;
    region.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(10px)';
      setTimeout(() => toast.remove(), 180);
    }, 2600);
  }

  function openModal({ title, subtitle = '', body = '', confirmText = '确认', cancelText = '取消', hideCancel = false, onConfirm = null }) {
    $('#modalTitle').textContent = title;
    $('#modalSubtitle').textContent = subtitle;
    $('#modalBody').innerHTML = body;
    $('#modalConfirmBtn').textContent = confirmText;
    $('#modalCancelBtn').textContent = cancelText;
    $('#modalCancelBtn').style.display = hideCancel ? 'none' : '';
    state.modalConfirm = onConfirm;
    $('#modalBackdrop').hidden = false;
    document.body.style.overflow = 'hidden';
    requestAnimationFrame(() => $('#closeModalBtn').focus());
  }

  function closeModal() {
    $('#modalBackdrop').hidden = true;
    document.body.style.overflow = '';
    state.modalConfirm = null;
  }

  $('#closeModalBtn').addEventListener('click', closeModal);
  $('#modalCancelBtn').addEventListener('click', closeModal);
  $('#modalBackdrop').addEventListener('click', (event) => {
    if (event.target === $('#modalBackdrop')) closeModal();
  });
  $('#modalConfirmBtn').addEventListener('click', () => {
    const action = state.modalConfirm;
    if (action) action();
    closeModal();
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && !$('#modalBackdrop').hidden) closeModal();
  });

  function updateStepper() {
    $$('.step').forEach((step) => {
      const number = Number(step.dataset.step);
      step.classList.toggle('active', number === state.currentStep);
      step.classList.toggle('complete', number < state.currentStep || (number < state.unlockedStep && number !== state.currentStep));
      step.disabled = number > state.unlockedStep;
    });
  }

  function goToStep(step, allowLocked = false) {
    if (!allowLocked && step > state.unlockedStep) {
      showToast('请先完成当前步骤', 'warning');
      return;
    }
    stopSourcePreview();
    stopFinalPlayback();
    state.currentStep = step;
    $$('.stage').forEach((stage) => stage.classList.remove('active'));
    $(`#stage${step}`).classList.add('active');
    updateStepper();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  $$('.step').forEach((button) => button.addEventListener('click', () => goToStep(Number(button.dataset.step))));
  $$('[data-back]').forEach((button) => button.addEventListener('click', () => goToStep(Number(button.dataset.back))));

  // Stage 1 interactions
  $$('#editMode button').forEach((button) => button.addEventListener('click', () => {
    $$('#editMode button').forEach((item) => item.classList.remove('active'));
    button.classList.add('active');
    const isNarrated = button.dataset.value === '解说混剪';
    $('#originalAudio').value = isNarrated ? '25' : '40';
    updateRange($('#originalAudio'), $('#audioOutput'));
  }));

  $$('#highlightPreferences button').forEach((button) => button.addEventListener('click', () => {
    button.classList.toggle('active');
    if (!$('#highlightPreferences .active')) {
      button.classList.add('active');
      showToast('至少保留一个高光偏好', 'warning');
    }
  }));

  function updateRange(input, output, suffix = '%') {
    const min = Number(input.min || 0);
    const max = Number(input.max || 100);
    const value = Number(input.value);
    const pct = ((value - min) / (max - min)) * 100;
    input.style.background = `linear-gradient(90deg, var(--primary) 0 ${pct}%, #e4e6ed ${pct}%)`;
    if (output) output.textContent = `${value}${suffix}`;
  }

  $('#originalAudio').addEventListener('input', () => updateRange($('#originalAudio'), $('#audioOutput')));
  $('#advancedToggle').addEventListener('click', () => {
    const open = $('#advancedToggle').getAttribute('aria-expanded') === 'true';
    $('#advancedToggle').setAttribute('aria-expanded', String(!open));
    $('#advancedFields').classList.toggle('open', !open);
  });

  function updateEpisodeSummary() {
    const count = $$('.episode-row').length;
    $('#episodeCount').textContent = String(count);
    const seconds = count === 3 ? 1902 : Math.max(0, count * 634);
    $('#episodeDuration').textContent = `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;
    $('#startAnalysisBtn').disabled = count === 0;
  }

  function bindEpisodeRemove(button) {
    button.addEventListener('click', () => {
      button.closest('.episode-row').remove();
      updateEpisodeSummary();
      showToast('素材已从当前任务移除');
    });
  }
  $$('.remove-episode').forEach(bindEpisodeRemove);

  function addFiles(fileList) {
    const files = [...fileList].filter((file) => /\.(mp4|mov)$/i.test(file.name));
    if (!files.length) {
      showToast('仅支持 MP4 或 MOV 文件', 'warning');
      return;
    }
    const list = $('#episodeList');
    files.forEach((file, index) => {
      const episodeNumber = $$('.episode-row').length + 1;
      const row = document.createElement('div');
      row.className = 'episode-row';
      row.dataset.episode = String(episodeNumber);
      row.innerHTML = `<button class="drag-handle" aria-label="拖动排序">⋮⋮</button><div class="episode-thumb scene-${['a','b','c'][index % 3]}"><span>${String(episodeNumber).padStart(2, '0')}</span>${icon('i-play')}</div><div class="episode-meta"><strong></strong><span>${(file.size / 1024 / 1024).toFixed(1)}MB · 待读取时长 · 本地文件</span></div><span class="status success">${icon('i-check')}就绪</span><button class="icon-button remove-episode" aria-label="移除素材">${icon('i-close')}</button>`;
      $('.episode-meta strong', row).textContent = file.name;
      bindEpisodeRemove($('.remove-episode', row));
      list.appendChild(row);
    });
    updateEpisodeSummary();
    showToast(`已添加 ${files.length} 个本地素材，仅用于当前页面演示`);
  }

  $('#fileInput').addEventListener('change', (event) => {
    addFiles(event.target.files);
    event.target.value = '';
  });
  ['dragenter', 'dragover'].forEach((name) => $('#uploader').addEventListener(name, (event) => {
    event.preventDefault();
    $('#uploader').classList.add('dragover');
  }));
  ['dragleave', 'drop'].forEach((name) => $('#uploader').addEventListener(name, (event) => {
    event.preventDefault();
    $('#uploader').classList.remove('dragover');
  }));
  $('#uploader').addEventListener('drop', (event) => addFiles(event.dataTransfer.files));
  $('#sortBtn').addEventListener('click', () => {
    const rows = $$('.episode-row').sort((a, b) => a.dataset.episode.localeCompare(b.dataset.episode, undefined, { numeric: true }));
    rows.forEach((row) => $('#episodeList').appendChild(row));
    showToast('已按文件名中的集数重新排序');
  });

  $('#startAnalysisBtn').addEventListener('click', async () => {
    state.unlockedStep = Math.max(state.unlockedStep, 2);
    goToStep(2, true);
    $('#analysisRunning').style.display = '';
    $('#analysisResult').classList.remove('visible');
    state.analyzed = false;
    const statuses = [
      [18, '正在进行语音识别与字幕校正…', '预计还需 2 分钟'],
      [38, '正在切分镜头并聚类主要人物…', '预计还需 1 分钟'],
      [63, '正在建立人物关系与事件时间线…', '预计还需 48 秒'],
      [84, '正在召回高光候选并复核事实…', '预计还需 18 秒'],
      [100, '分析完成，正在整理结果…', '即将完成'],
    ];
    for (let i = 0; i < statuses.length; i += 1) {
      const [percent, text, eta] = statuses[i];
      $('#analysisProgress').style.width = `${percent}%`;
      $('#analysisPercent').textContent = `${percent}%`;
      $('#analysisStatusText').textContent = text;
      $('#analysisEta').textContent = eta;
      $$('.pipeline-item').forEach((item, itemIndex) => {
        item.classList.toggle('done', itemIndex < i);
        item.classList.toggle('running', itemIndex === Math.min(i, 3));
        $('b', item).textContent = itemIndex < i ? '已完成' : itemIndex === Math.min(i, 3) ? '处理中' : '等待';
      });
      await sleep(i === statuses.length - 1 ? 420 : 520);
    }
    $$('.pipeline-item').forEach((item) => {
      item.classList.remove('running');
      item.classList.add('done');
      $('b', item).textContent = '已完成';
    });
    state.analyzed = true;
    $('#analysisRunning').style.display = 'none';
    $('#analysisResult').classList.add('visible');
    showToast('理解分析完成，已建立原片证据链');
  });

  // Stage 2 interactions
  function previewEvidence(clip) {
    state.selectedClipId = clip.id;
    openModal({
      title: '原片证据预览',
      subtitle: clip.source,
      hideCancel: true,
      confirmText: '知道了',
      body: `<div class="modal-preview"><img src="/html-prototypes/ai-smart-mixed-cut/assets/drama-confrontation.jpg" alt="原片证据画面"><div class="modal-evidence"><div><label>剧情事件</label><strong>${clip.title}</strong></div><div><label>对白 / 画面证据</label><p>${clip.quote}</p></div><div><label>入选理由</label><p>${clip.reason}</p></div><div class="proof"><label>可信度</label><strong>${clip.confidence}% · ${clip.strong ? '强证据，可用于自动成片' : '待人工确认，不会自动写成事实'}</strong></div></div></div>`,
    });
  }

  $$('.event-card').forEach((card, index) => card.addEventListener('click', () => {
    $$('.event-card').forEach((item) => item.classList.remove('selected'));
    card.classList.add('selected');
    previewEvidence(clips[[0, 1, 2, 4][index]]);
  }));

  $('#editStoryBtn').addEventListener('click', () => {
    openModal({
      title: '校正剧情理解',
      subtitle: '修改内容将参与后续高光判断',
      confirmText: '保存校正',
      body: `<div class="modal-form"><label>题材标签<input id="storyTagsInput" value="都市 / 情感 / 复仇"></label><label>剧情概览<textarea id="storySummaryInput">${$('#storySummary').textContent}</textarea></label></div>`,
      onConfirm: () => {
        const value = $('#storySummaryInput')?.value.trim();
        if (value) $('#storySummary').textContent = value;
        showToast('剧情理解已校正');
      },
    });
  });

  $('#editRelationBtn').addEventListener('click', () => {
    openModal({
      title: '编辑主要人物',
      subtitle: '用于跨集人物识别与解说称谓',
      confirmText: '保存人物',
      body: `<div class="modal-form"><label>丈夫 / 主角<input value="沈聿"></label><label>妻子<input value="苏棠"></label><label>第三人物<input value="周越"></label></div>`,
      onConfirm: () => showToast('人物信息已保存，相关证据已重新关联'),
    });
  });

  $('#reviewIssueBtn').addEventListener('click', () => {
    const issue = clips[5];
    openModal({
      title: '确认低置信度事件',
      subtitle: issue.source,
      confirmText: '保留为候选',
      cancelText: '忽略此事件',
      body: `<div class="modal-preview"><img src="/html-prototypes/ai-smart-mixed-cut/assets/drama-confrontation.jpg" alt="待确认剧情画面"><div class="modal-evidence"><div><label>识别内容</label><strong>${issue.title}</strong></div><div><label>检测到的画外音</label><p>${issue.quote}</p></div><div><label>不确定原因</label><p>角色未出现在画面中，说话人分离结果与上一镜头存在冲突。</p></div><div class="proof" style="color:#9a6c18;background:#fff6e5"><label>处理规则</label><strong>不会自动写入解说，仅进入备选池</strong></div></div></div>`,
      onConfirm: () => showToast('已保留为待核验候选', 'warning'),
    });
  });

  $('#createPlansBtn').addEventListener('click', () => {
    state.unlockedStep = Math.max(state.unlockedStep, 3);
    renderPlan();
    goToStep(3, true);
    showToast('已生成 3 个基于原片证据的高光方案');
  });

  // Stage 3
  function currentPlan() { return plans[state.selectedPlan]; }
  function orderedClips() { return currentPlan().order.map((id) => clips.find((clip) => clip.id === id)).filter(Boolean); }
  function selectedOrderedClips() { return orderedClips().filter((clip) => clip.selected); }

  function outputTime(seconds) {
    return `00:${String(seconds).padStart(2, '0')}`;
  }

  function renderStructure() {
    let start = 0;
    const html = selectedOrderedClips().map((clip) => {
      const end = start + clip.duration;
      const result = `<button class="structure-node ${clip.id === state.selectedClipId ? 'active' : ''}" style="--node-color:${clip.color}" data-clip-id="${clip.id}"><span>${clip.stageNo}</span><strong>${clip.stage} · ${clip.title}</strong><small>${clip.source} · ${clip.reason}</small><em>${outputTime(start)}–${outputTime(end)}</em></button>`;
      start = end;
      return result;
    }).join('');
    $('#structureList').innerHTML = html || '<div class="asset-footnote">请至少选择一个高光片段。</div>';
    $$('.structure-node').forEach((button) => button.addEventListener('click', () => selectClip(button.dataset.clipId)));
  }

  function renderHighlights() {
    const orderIndex = new Map(currentPlan().order.map((id, index) => [id, index]));
    const sorted = [...clips].sort((a, b) => (orderIndex.get(a.id) ?? 99) - (orderIndex.get(b.id) ?? 99));
    $('#highlightList').innerHTML = sorted.map((clip) => `
      <div class="highlight-card ${clip.id === state.selectedClipId ? 'active' : ''} ${$('#strongEvidenceOnly').checked && !clip.strong ? 'muted' : ''}" data-clip-id="${clip.id}">
        <button class="select-box ${clip.selected ? 'selected' : ''}" aria-label="${clip.selected ? '取消选择' : '选择'} ${clip.title}">${icon('i-check')}</button>
        <button class="clip-thumb ${clip.scene} preview-clip" aria-label="预览 ${clip.title}"><span>${clip.duration}秒</span></button>
        <div class="clip-main"><div><span class="clip-kind" style="--kind:${clip.color}">${clip.stage}</span><span class="clip-source">${clip.source}</span>${!clip.strong ? '<span class="status warning">待核验</span>' : ''}</div><strong>${clip.title}</strong><p>${clip.reason}</p><div class="evidence-chips">${clip.evidence.map((item) => `<span>${item}</span>`).join('')}</div></div>
        <div class="score-stack"><div class="mini-score"><span>高光潜力</span><i><b style="--value:${clip.content}"></b></i><strong>${clip.content}</strong></div><div class="mini-score"><span>投放适配</span><i><b style="--value:${clip.ad};--bar:#8b5cf6"></b></i><strong>${clip.ad}</strong></div><div class="mini-score"><span>证据置信</span><i><b style="--value:${clip.confidence};--bar:${clip.strong ? '#16a36a' : '#d97706'}"></b></i><strong>${clip.confidence}</strong></div></div>
        <div class="clip-actions"><button class="preview-evidence">查看证据</button><button class="swap-clip">${icon('i-swap')}换一段</button></div>
      </div>`).join('');

    $$('.highlight-card').forEach((card) => {
      const clip = clips.find((item) => item.id === card.dataset.clipId);
      $('.select-box', card).addEventListener('click', (event) => {
        event.stopPropagation();
        clip.selected = !clip.selected;
        if (!clips.some((item) => item.selected)) {
          clip.selected = true;
          showToast('至少保留一个高光片段', 'warning');
        }
        renderPlanParts();
      });
      $('.preview-clip', card).addEventListener('click', () => selectClip(clip.id));
      $('.preview-evidence', card).addEventListener('click', () => previewEvidence(clip));
      $('.swap-clip', card).addEventListener('click', () => {
        const old = { source: clip.source, title: clip.title, quote: clip.quote };
        clip.source = clip.alternate.source;
        clip.title = clip.alternate.title;
        clip.quote = clip.alternate.quote;
        clip.alternate = old;
        showToast(`已替换“${clip.stage}”片段，事实证据仍有效`);
        renderPlanParts();
      });
    });
  }

  function renderNarration() {
    const plan = currentPlan();
    const visibleNarrations = plan.narrations.filter(([clipId]) => clips.find((clip) => clip.id === clipId)?.selected);
    $('#narrationList').innerHTML = visibleNarrations.map(([clipId, text], index) => {
      const clip = clips.find((item) => item.id === clipId);
      const estimate = Math.max(1.8, text.length / 4.5).toFixed(1);
      return `<div class="narration-item" data-clip-id="${clipId}"><div><label><span>${index + 1}</span>${clip.stage} · ${clip.source}</label><em class="verified">${icon('i-shield')}原片可支持</em></div><textarea aria-label="第${index + 1}段解说">${text}</textarea><div class="narration-meta"><span>对应：${clip.title}</span><span><b>${text.length}</b> 字 · 约 <b>${estimate}</b> 秒</span></div></div>`;
    }).join('');
    $$('.narration-item textarea').forEach((textarea) => textarea.addEventListener('input', () => {
      const meta = textarea.nextElementSibling.lastElementChild;
      const text = textarea.value.trim();
      meta.innerHTML = `<b>${text.length}</b> 字 · 约 <b>${Math.max(1, text.length / 4.5).toFixed(1)}</b> 秒`;
      const unsupported = /(入狱|亲子鉴定|白月光|孩子)/.test(text);
      const badge = $('.verified', textarea.closest('.narration-item'));
      badge.innerHTML = unsupported ? `${icon('i-info')}待核验` : `${icon('i-shield')}原片可支持`;
      badge.style.color = unsupported ? 'var(--amber)' : '';
      if (unsupported) showToast('检测到原片未支持的新事实，请修改或补充证据', 'warning');
      updateNarrationDuration();
    }));
    updateNarrationDuration();
  }

  function updateNarrationDuration() {
    const chars = $$('.narration-item textarea').reduce((sum, item) => sum + item.value.trim().length, 0);
    $('#narrationDuration').textContent = `${Math.max(0, chars / 4.5).toFixed(1)} 秒`;
  }

  function updatePlanMetrics() {
    const total = selectedOrderedClips().reduce((sum, clip) => sum + clip.duration, 0);
    $('#planDuration').textContent = total > 60 ? `01:${String(total - 60).padStart(2, '0')}` : `00:${String(total).padStart(2, '0')}`;
    $('#planCoverage').textContent = clips.filter((clip) => clip.selected).every((clip) => clip.strong) ? '100%' : '92%';
    $('#selectedSummary').textContent = `已选 ${clips.filter((clip) => clip.selected).length} 段 · 原片 ${total} 秒 · 目标 60 秒`;
  }

  function renderPlanParts() {
    renderStructure();
    renderHighlights();
    renderNarration();
    updatePlanMetrics();
  }

  function renderPlan() {
    const plan = currentPlan();
    $('#planTitle').textContent = plan.title;
    $('#planSubtitle').textContent = plan.subtitle;
    $('#planScore').textContent = plan.score;
    $$('#planTabs button').forEach((button) => button.classList.toggle('active', button.dataset.plan === state.selectedPlan));
    state.selectedClipId = plan.order.find((id) => clips.find((clip) => clip.id === id)?.selected) || plan.order[0];
    renderPlanParts();
    selectClip(state.selectedClipId, false);
  }

  $$('#planTabs button').forEach((button) => button.addEventListener('click', () => {
    state.selectedPlan = button.dataset.plan;
    renderPlan();
  }));

  function selectClip(id, rerender = true) {
    const clip = clips.find((item) => item.id === id);
    if (!clip) return;
    state.selectedClipId = id;
    $('#playerSource').textContent = clip.source;
    $('#playerCaption').textContent = clip.quote;
    $('#playerTime').textContent = clip.source.match(/\d{2}:\d{2}/)?.[0] ? `00:${clip.source.match(/\d{2}:\d{2}/)[0]}` : '00:00:00';
    const img = $('#sourcePlayer img');
    img.style.objectPosition = clip.scene === 'scene-a' ? '35% 25%' : clip.scene === 'scene-b' ? '66% 43%' : '50% 63%';
    if (rerender) {
      $$('.structure-node').forEach((item) => item.classList.toggle('active', item.dataset.clipId === id));
      $$('.highlight-card').forEach((item) => item.classList.toggle('active', item.dataset.clipId === id));
    }
    stopSourcePreview();
  }

  function stopSourcePreview() {
    state.playingSource = false;
    clearInterval(state.sourceTimer);
    state.sourceTimer = null;
    const use = $('#sourcePlayBtn use');
    if (use) use.setAttribute('href', '#i-play');
  }

  $('#sourcePlayBtn').addEventListener('click', () => {
    if (state.playingSource) {
      stopSourcePreview();
      return;
    }
    state.playingSource = true;
    $('#sourcePlayBtn use').setAttribute('href', '#i-pause');
    let progress = 26;
    state.sourceTimer = setInterval(() => {
      progress += 7;
      $('.player-bottom i b').style.width = `${Math.min(progress, 100)}%`;
      if (progress >= 100) {
        progress = 0;
        stopSourcePreview();
      }
    }, 180);
  });

  $('#strongEvidenceOnly').addEventListener('change', renderHighlights);
  $('#searchClipBtn').addEventListener('click', () => {
    openModal({
      title: '搜索原片剧情',
      subtitle: '通过人物、台词或事件查找替换片段',
      confirmText: '搜索',
      body: `<div class="modal-form"><label>描述你想找的剧情<input id="clipSearchInput" value="丈夫发现监控证据" placeholder="例如：女主发现身份被冒充"></label><div class="asset-footnote">搜索结果会同时匹配 ASR 对白、OCR 字幕和画面描述。</div></div>`,
      onConfirm: () => showToast('找到 3 个相关片段，已按证据置信度排序'),
    });
  });
  $('#rewriteAllBtn').addEventListener('click', () => {
    $$('.narration-item textarea').forEach((textarea, index) => {
      if (index === 0 && !textarea.value.startsWith('谁也没想到')) textarea.value = `谁也没想到，${textarea.value}`;
      textarea.dispatchEvent(new Event('input'));
    });
    showToast('已加强开场钩子，并完成原片事实复核');
  });
  $('#changeVoiceBtn').addEventListener('click', () => {
    openModal({
      title: '选择解说音色',
      subtitle: '试听不会消耗积分',
      confirmText: '使用该音色',
      body: `<div class="modal-form"><label><input type="radio" name="voice" checked> 云舒 · 知性女声 · 克制</label><label><input type="radio" name="voice"> 沉川 · 磁性男声 · 冷静</label><label><input type="radio" name="voice"> 南乔 · 情绪女声 · 强烈</label></div>`,
      onConfirm: () => showToast('解说音色已更新'),
    });
  });

  $('#generateVideoBtn').addEventListener('click', async () => {
    const unsupported = $$('.narration-item .verified').some((badge) => badge.textContent.includes('待核验'));
    if (unsupported) {
      showToast('存在无原片证据的解说，请先修正', 'warning');
      return;
    }
    state.unlockedStep = Math.max(state.unlockedStep, 4);
    goToStep(4, true);
    $('#generationOverlay').style.display = '';
    $('#finalContent').classList.remove('visible');
    const progressItems = [
      [18, '正在匹配解说与原片片段…', 0],
      [39, '正在生成解说配音与停顿…', 1],
      [66, '正在添加字幕与关键词强调…', 2],
      [88, '正在检查事实、音画与安全区…', 3],
      [100, '生成完成', 3],
    ];
    for (const [progress, status, active] of progressItems) {
      $('#renderProgress').style.width = `${progress}%`;
      $('#renderPercent').textContent = `${progress}%`;
      $('#renderStatus').textContent = status;
      $$('.render-steps span').forEach((item, index) => item.classList.toggle('active', index <= active));
      await sleep(500);
    }
    $('#generationOverlay').style.display = 'none';
    $('#finalContent').classList.add('visible');
    showToast('视频已生成，6 项质检全部通过');
  });

  // Stage 4
  function updateFinalPlayer() {
    const pct = (state.finalSecond / 60) * 100;
    $('#finalCurrentTime').textContent = `00:${String(Math.floor(state.finalSecond)).padStart(2, '0')}`;
    $('#scrubberFill').style.width = `${pct}%`;
    $('#scrubberHandle').style.left = `${pct}%`;
    $('#timelinePlayhead').style.left = `calc(54px + (100% - 54px) * ${pct / 100})`;
    const captionIndex = Math.min(4, Math.floor(state.finalSecond / 12));
    const captions = [
      '苏棠带情人回家，却不知道丈夫早已看清一切。',
      '两人甚至已经算好，等股份到手便让沈聿彻底出局。',
      '可他们的每句话，都被隐藏摄像头完整记录。',
      '沈聿没有争吵，而是让所有镜头跟他一起上楼。',
      '房门即将打开，这场公开审判才刚刚开始。',
    ];
    $('#previewSubtitle').textContent = captions[captionIndex];
  }

  function setFinalPlayIcon(id, playing) {
    const use = $(`#${id} use`);
    if (use) use.setAttribute('href', playing ? '#i-pause' : '#i-play');
  }
  function stopFinalPlayback() {
    state.finalPlaying = false;
    clearInterval(state.finalTimer);
    state.finalTimer = null;
    setFinalPlayIcon('finalPlayBtn', false);
    setFinalPlayIcon('bottomPlayBtn', false);
  }
  function toggleFinalPlayback() {
    if (state.finalPlaying) {
      stopFinalPlayback();
      return;
    }
    state.finalPlaying = true;
    setFinalPlayIcon('finalPlayBtn', true);
    setFinalPlayIcon('bottomPlayBtn', true);
    state.finalTimer = setInterval(() => {
      state.finalSecond += 1;
      if (state.finalSecond > 60) state.finalSecond = 0;
      updateFinalPlayer();
      if (state.finalSecond === 60) stopFinalPlayback();
    }, 320);
  }
  $('#finalPlayBtn').addEventListener('click', toggleFinalPlayback);
  $('#bottomPlayBtn').addEventListener('click', toggleFinalPlayback);
  $('#scrubber').addEventListener('click', (event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    state.finalSecond = Math.max(0, Math.min(60, ((event.clientX - rect.left) / rect.width) * 60));
    updateFinalPlayer();
  });

  $$('.inspector-tabs button').forEach((button) => button.addEventListener('click', () => {
    $$('.inspector-tabs button').forEach((item) => item.classList.remove('active'));
    button.classList.add('active');
    $$('.inspector-content').forEach((content) => content.classList.add('hidden'));
    $(`#${button.dataset.inspector}Inspector`).classList.remove('hidden');
  }));

  ['subtitleSize', 'voiceVolume', 'bgmVolume'].forEach((id) => {
    const input = $(`#${id}`);
    const output = input.closest('.control-group').querySelector('output');
    input.addEventListener('input', () => updateRange(input, output, id === 'subtitleSize' ? '' : '%'));
    updateRange(input, output, id === 'subtitleSize' ? '' : '%');
  });
  $$('.segmented.compact button, .style-swatches button').forEach((button) => button.addEventListener('click', () => {
    $$('button', button.parentElement).forEach((item) => item.classList.remove('active'));
    button.classList.add('active');
    showToast('预览样式已更新');
  }));

  $$('#videoTrack button').forEach((button, index) => button.addEventListener('click', () => {
    $$('#videoTrack button').forEach((item) => item.classList.remove('active'));
    button.classList.add('active');
    $('#timelineSelection').textContent = button.dataset.title;
    state.finalSecond = [0, 9, 22, 34, 51][index];
    updateFinalPlayer();
  }));

  $('#trimBtn').addEventListener('click', () => {
    if (!$('#videoTrack button.active')) {
      showToast('请先选择一个时间线片段', 'warning');
      return;
    }
    openModal({
      title: '调整片段边界',
      subtitle: $('#timelineSelection').textContent,
      confirmText: '应用裁剪',
      body: `<div class="modal-form"><label>入点<input type="text" value="00:00:00.0"></label><label>出点<input type="text" value="00:00:09.0"></label><div class="asset-footnote">调整后会重新检测对白是否被截断，并同步更新总时长。</div></div>`,
      onConfirm: () => showToast('片段边界已调整，未发现对白截断'),
    });
  });
  $('#replaceTimelineBtn').addEventListener('click', () => {
    if (!$('#videoTrack button.active')) {
      showToast('请先选择要替换的时间线片段', 'warning');
      return;
    }
    openModal({
      title: '替换时间线片段',
      subtitle: $('#timelineSelection').textContent,
      confirmText: '使用推荐片段',
      body: `<div class="modal-evidence"><div><label>推荐替换</label><strong>第 1 集 · 03:58–04:07</strong><p>妻子确认丈夫航班已经起飞后打开房门。</p></div><div class="proof"><label>匹配理由</label><strong>同一事件、相似时长、证据置信度 95%</strong></div></div>`,
      onConfirm: () => showToast('时间线片段已替换，解说与字幕已自动对齐'),
    });
  });

  $('#createVariantBtn').addEventListener('click', () => {
    state.selectedPlan = state.selectedPlan === 'conflict' ? 'reversal' : 'suspense';
    renderPlan();
    goToStep(3);
    showToast('已复制为新版本，并切换至差异化开头');
  });
  $('#exportBtn').addEventListener('click', () => {
    openModal({
      title: '导出投放成片',
      subtitle: '质检已通过 · 本页为交互原型，不生成真实视频',
      confirmText: '确认模拟导出',
      body: `<div class="export-summary"><div class="export-card"><span></span><div><strong>${currentPlan().title}</strong><small>MP4 · 1080 × 1920 · 60 秒 · 预计 48MB</small></div><b>可导出</b></div><div class="export-options"><label><input type="checkbox" checked> MP4 成片</label><label><input type="checkbox" checked> SRT 字幕</label><label><input type="checkbox"> 片段清单 JSON</label></div></div>`,
      onConfirm: () => showToast('模拟导出任务已创建，可在成片记录中查看'),
    });
  });

  // Header and utility actions
  $('#guideBtn').addEventListener('click', () => openModal({
    title: '如何体验优化版混剪',
    subtitle: '完整流程约 1 分钟',
    hideCancel: true,
    confirmText: '开始体验',
    body: `<div class="modal-evidence"><div><label>1 · 素材配置</label><p>使用预置剧集，选择时长、高光偏好与原声比例。</p></div><div><label>2 · 理解校对</label><p>检查人物、剧情与原片时间码证据，处理低置信结果。</p></div><div><label>3 · 高光方案</label><p>切换三种真实可实现的故事结构，选段、换段并修改解说。</p></div><div><label>4 · 成片质检</label><p>体验预览、时间线、事实检查与模拟导出。</p></div></div>`,
  }));
  $('#resetDemoBtn').addEventListener('click', () => window.location.reload());
  $$('.rail-item:not(.active)').forEach((button) => button.addEventListener('click', () => showToast('本次 Demo 仅展示【混剪剧情】模块', 'warning')));
  $('.avatar-button').addEventListener('click', () => showToast('本次 Demo 不包含用户中心'));
  $('.mini-avatar').addEventListener('click', () => showToast('本次 Demo 不包含用户中心'));

  // Initial state
  updateRange($('#originalAudio'), $('#audioOutput'));
  updateStepper();
  renderPlan();
  updateFinalPlayer();
})();
