const rows = [...document.querySelectorAll('#tableBody tr')];
const checks = [...document.querySelectorAll('.row-check')];
const selectAll = document.querySelector('#selectAll');
const selectedCount = document.querySelector('#selectedCount');
const batchHint = document.querySelector('#batchHint');
const batchMenuBtn = document.querySelector('#batchMenuBtn');
const batchMenu = document.querySelector('#batchMenu');
const batchMenuHint = document.querySelector('#batchMenuHint');
const batchActions = [...document.querySelectorAll('.batch-action')];
const modalBackdrop = document.querySelector('#modalBackdrop');
const modal = modalBackdrop.querySelector('.modal');
const modalTitle = document.querySelector('#modalTitle');
const modalBody = document.querySelector('#modalBody');
const modalFooter = document.querySelector('#modalFooter');
const toast = document.querySelector('#toast');
let activeSingleRow = rows[0];

function selectedRows() {
  return rows.filter((row) => row.querySelector('.row-check').checked && !row.classList.contains('filtered'));
}

function updateBatchState() {
  const selected = selectedRows();
  const ids = [...new Set(selected.map((row) => row.dataset.cid))];
  const hasSelection = selected.length > 0;
  const sameCollection = hasSelection && ids.length === 1;

  rows.forEach((row) => row.classList.toggle('selected', row.querySelector('.row-check').checked));
  selectedCount.textContent = `已选择 ${selected.length} 条`;
  batchMenuBtn.disabled = !hasSelection;
  batchActions.forEach((button) => {
    button.disabled = button.classList.contains('same-collection') ? !sameCollection : !hasSelection;
  });

  batchHint.classList.remove('same', 'mixed');
  if (!hasSelection) {
    batchHint.textContent = '请选择需要批量处理的记录';
    batchMenuHint.textContent = '请先勾选送审记录';
    batchMenu.classList.remove('open');
  } else if (sameCollection) {
    batchHint.classList.add('same');
    batchHint.textContent = `合集ID ${ids[0]}，全部批量操作可用`;
    batchMenuHint.textContent = `合集ID ${ids[0]} 校验通过`;
  } else {
    batchHint.classList.add('mixed');
    batchHint.textContent = '已跨合集选择，修改/替换不可用';
    batchMenuHint.textContent = '修改剧目信息、替换剧集仅支持同一合集ID';
  }

  const visibleChecks = checks.filter((check) => !check.closest('tr').classList.contains('filtered'));
  selectAll.checked = visibleChecks.length > 0 && visibleChecks.every((check) => check.checked);
  selectAll.indeterminate = visibleChecks.some((check) => check.checked) && !selectAll.checked;
}

checks.forEach((check) => check.addEventListener('change', updateBatchState));
selectAll.addEventListener('change', () => {
  checks.forEach((check) => {
    if (!check.closest('tr').classList.contains('filtered')) check.checked = selectAll.checked;
  });
  updateBatchState();
});

batchMenuBtn.addEventListener('click', (event) => {
  event.stopPropagation();
  if (!batchMenuBtn.disabled) batchMenu.classList.toggle('open');
});
batchMenu.addEventListener('click', (event) => event.stopPropagation());

function showToast(message) {
  toast.textContent = message;
  toast.classList.add('show');
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => toast.classList.remove('show'), 2200);
}

function closeModal() {
  modalBackdrop.classList.remove('open');
  modalBackdrop.setAttribute('aria-hidden', 'true');
  modal.className = 'modal';
}

function bindModalControls(title) {
  modalFooter.querySelectorAll('[data-close]').forEach((button) => button.addEventListener('click', closeModal));
  modalFooter.querySelectorAll('[data-confirm]').forEach((button) => button.addEventListener('click', () => {
    closeModal();
    showToast(`${title}已提交`);
  }));
}

function openModal({ title, body, footer = 'default', size = '' }) {
  modalTitle.textContent = title;
  modalBody.innerHTML = body;
  modal.className = `modal ${size}`.trim();
  modalFooter.hidden = footer === null;
  if (footer === 'default') modalFooter.innerHTML = '<button class="btn" data-close>取消</button><button class="btn primary" data-confirm>确定</button>';
  else if (footer === false) modalFooter.innerHTML = '<button class="btn primary" data-close>关闭</button>';
  else if (typeof footer === 'string') modalFooter.innerHTML = footer;
  else modalFooter.innerHTML = '';
  modalBackdrop.classList.add('open');
  modalBackdrop.setAttribute('aria-hidden', 'false');
  bindModalControls(title);
}

document.querySelector('#modalClose').addEventListener('click', closeModal);
modalBackdrop.addEventListener('click', (event) => { if (event.target === modalBackdrop) closeModal(); });

function recordContext(single) {
  const selected = single ? [activeSingleRow] : selectedRows();
  const first = selected[0] || rows[0];
  return {
    count: selected.length,
    cid: first.dataset.cid,
    name: first.children[3].textContent.trim(),
    dramaId: first.children[4].textContent.trim()
  };
}

function proofThumbs() {
  return '<div class="upload-thumbs"><span class="upload-thumb">证明1</span><span class="upload-thumb">证明2</span><span class="upload-thumb">证明3</span><span class="upload-thumb">证明4</span><span class="upload-thumb">证明5</span></div>';
}

function openModifyModal(single = false) {
  const ctx = recordContext(single);
  const selectedText = single ? `已选择《${ctx.name}》 id:${ctx.cid}` : `已选择《${ctx.name}》 id:${ctx.cid}（共${ctx.count}条送审记录）`;
  openModal({
    title: '修改剧目信息',
    size: 'wide',
    footer: '<button class="btn" data-close>取消</button><button class="btn primary" data-confirm>确定</button><button class="btn primary" data-confirm>确定修改剧目基本信息</button>',
    body: `
      <div class="online-form">
        <div class="form-row"><div class="form-label"><i class="required">*</i> 选择合集</div><div class="form-control"><button class="btn primary" disabled>选择合集</button><span>${selectedText}</span></div></div>
        <div class="form-row"><div class="form-label">备用片名</div><div class="form-control"><input type="text" placeholder="请填写备用片名" maxlength="50"><span class="text-counter">0/50</span></div></div>
        <div class="form-row"><div class="form-label">送审小程序</div><div class="form-control"><select disabled><option>蜻蜓剧场</option></select></div></div>
        <div class="form-row"><div class="form-label">剧目制作方</div><div class="form-control inline-fields"><select><option>剧目制作方</option></select><input type="text" value="杭州容量互娱科技有限公司"></div></div>
        <div class="form-row"><div class="form-label"><i class="required">*</i> 版权保护</div><div class="form-control radio-line"><label><input type="radio" name="copyright" disabled>不申请</label><label><input type="radio" name="copyright" checked>申请</label></div></div>
        <div class="form-row"><div class="form-label"><i class="required">*</i> 版权验证方式</div><div class="form-control radio-line"><label><input type="radio" name="verify" checked>基于版权证明材料</label><label><input type="radio" name="verify">基于版权授权关系</label></div></div>
        <div class="form-row"><div class="form-label"><i class="required">*</i> 剧目制作证明材料</div><div class="form-control"><button class="btn primary">选择图片</button>${proofThumbs()}</div></div>
        <div class="form-row"><div class="form-label"><i class="required">*</i> 编剧</div><div class="form-control"><input type="text" value="宾世强"></div></div>
        <div class="form-row"><div class="form-label"><i class="required">*</i> 描述</div><div class="form-control"><textarea>她从一次意外中醒来，重新面对亲情、事业与命运的选择，并在改变人生的过程中找到真正重要的人。</textarea></div></div>
        <div class="form-row"><div class="form-label"><i class="required">*</i> 剧目资质</div><div class="form-control radio-line"><label><input type="radio" name="qualification" checked>制作成本100万内</label><label><input type="radio" name="qualification">网络剧片发行许可证</label><input type="text" value="11" placeholder="请填写制作成本,1-99的整数"></div></div>
        <div class="form-row"><div class="form-label"><i class="required">*</i> 版权声明/播放授权材料</div><div class="form-control"><button class="btn primary">选择图片</button><span class="upload-thumb">授权材料</span></div></div>
        <div class="form-row"><div class="form-label"><i class="required">*</i> 内容声明</div><div class="form-control"><button type="button" class="switch-control on" data-toggle-ai aria-label="内容声明开关"></button><span>“开启”后表示上传的视频包含AI生成的内容</span></div></div>
        <div class="form-row ai-proof-row"><div class="form-label"><i class="required">*</i> AI制作证明</div><div class="form-control"><button class="btn primary">选择图片</button><span class="upload-thumb">AI证明</span></div></div>
        <div class="form-row"><div class="form-label">其他平台发布证明</div><div class="form-control"><button class="btn primary">选择图片</button><span class="helper">0/4　如剧目已在抖音、快手等平台发布，请上传作品管理界面截图或版权中心登记截图，最多4张</span></div></div>
        <div class="form-row"><div class="form-label"><i class="required">*</i> 剧目类型</div><div class="form-control radio-line"><label><input type="radio" name="dramaType">真人</label><label><input type="radio" name="dramaType">动漫</label><label><input type="radio" name="dramaType" checked>数字真人</label></div></div>
        <div class="form-row"><div class="form-label">加急审核</div><div class="form-control"><button type="button" class="switch-control" aria-label="加急审核开关"></button><span class="helper">今日加急次数：5次</span></div></div>
        <div class="form-row"><div class="form-label"><i class="required">*</i> 授权范围</div><div class="form-control radio-line"><label><input type="radio" name="scope" checked>全部小程序授权</label><label><input type="radio" name="scope">全部小程序取消授权</label><label><input type="radio" name="scope">部分小程序取消授权</label></div></div>
      </div>`
  });

  document.querySelectorAll('.switch-control').forEach((control) => control.addEventListener('click', () => {
    control.classList.toggle('on');
    if (control.hasAttribute('data-toggle-ai')) {
      const proofRow = document.querySelector('.ai-proof-row');
      proofRow.style.display = control.classList.contains('on') ? 'grid' : 'none';
    }
  }));
}

function episodeRows() {
  const statuses = [
    ['上传完成', '审核通过', '未同步'], ['上传完成', '审核中', '-'], ['-', '-', '-'], ['上传完成', '审核失败', '-'],
    ['-', '-', '-'], ['上传完成', '审核通过', '已同步'], ['-', '-', '-'], ['上传完成', '审核通过', '未同步']
  ];
  return statuses.map((status, index) => `
    <tr>
      <td><input class="episode-check" type="checkbox" aria-label="选择第${index + 1}集"></td>
      <td class="episode-name">她从山海归来-第${index + 1}集</td>
      <td>${status[0]}</td><td>${status[0] === '-' ? '-' : `2026-08-${18 - (index % 3)} 10:2${index}`}</td>
      <td>${status[0] === '-' ? '-' : '2026-08-25 23:59'}</td>
      <td><span class="status ${status[1] === '审核通过' ? 'green' : status[1] === '审核失败' ? 'red' : status[1] === '审核中' ? 'orange' : 'gray'}">${status[1]}</span></td>
      <td>${status[1] === '审核失败' ? '视频内容需调整' : '-'}</td><td>-</td><td>${status[2]}</td>
      <td class="episode-operation"><button class="link-btn episode-replace">替换过审剧集</button><button class="link-btn episode-sync" ${status[1] !== '审核通过' ? 'disabled' : ''}>同步线上</button></td>
    </tr>`).join('');
}

function bindReplacementControls() {
  const episodeChecks = [...document.querySelectorAll('.episode-check')];
  const episodeSelectAll = document.querySelector('#episodeSelectAll');
  const replaceButton = document.querySelector('#modalReplaceBtn');
  const syncButton = document.querySelector('#modalSyncBtn');
  const update = () => {
    const count = episodeChecks.filter((check) => check.checked).length;
    replaceButton.disabled = count === 0;
    syncButton.disabled = count === 0;
    episodeSelectAll.checked = count === episodeChecks.length;
    episodeSelectAll.indeterminate = count > 0 && count < episodeChecks.length;
  };
  episodeChecks.forEach((check) => check.addEventListener('change', update));
  episodeSelectAll.addEventListener('change', () => {
    episodeChecks.forEach((check) => { check.checked = episodeSelectAll.checked; });
    update();
  });
  document.querySelectorAll('.episode-replace').forEach((button) => button.addEventListener('click', () => showToast('已进入剧集文件替换流程')));
  document.querySelectorAll('.episode-sync:not(:disabled)').forEach((button) => button.addEventListener('click', () => showToast('已提交同步线上')));
  replaceButton.addEventListener('click', () => showToast('已进入批量替换过审剧集流程'));
  syncButton.addEventListener('click', () => showToast('已提交所选剧集同步线上'));
  document.querySelector('#quickReviewBtn').addEventListener('click', () => showToast('已发起快速提审'));
}

function openReplaceModal(single = false) {
  const ctx = recordContext(single);
  openModal({
    title: '剧集替换详情',
    size: 'xwide',
    footer: null,
    body: `
      <div class="modal-note">合集：${ctx.name}（${ctx.cid}）${single ? '' : `　已选择 ${ctx.count} 条送审记录`}</div>
      <div class="replace-toolbar">
        <div class="replace-filters">
          <label>上传状态<select><option>请选择</option><option>上传完成</option></select></label>
          <label>审核状态<select><option>请选择</option><option>审核中</option><option>审核通过</option><option>审核失败</option></select></label>
          <label>线上同步状态<select><option>请选择</option><option>已同步</option><option>未同步</option></select></label>
          <button class="btn primary">查询</button><button class="btn">重置</button><button class="btn light">导出</button>
        </div>
      </div>
      <div class="replace-actions"><button class="btn primary" id="quickReviewBtn">快速提审⌄</button><button class="btn" id="modalReplaceBtn" disabled>替换过审剧集</button><button class="btn" id="modalSyncBtn" disabled>同步线上</button></div>
      <div class="replace-table-wrap"><table class="replace-table"><thead><tr><th><input id="episodeSelectAll" type="checkbox" aria-label="全选剧集"></th><th class="episode-name">名称</th><th>上传状态</th><th>替换送审时间</th><th>替换过期时间</th><th>替换审核状态</th><th>审核备注</th><th>审核证据截图</th><th>线上同步状态</th><th class="episode-operation">操作</th></tr></thead><tbody>${episodeRows()}</tbody></table></div>
      <div class="replace-footer"><span>共 70 条</span><span>100条/页　1 / 1</span></div>`
  });
  bindReplacementControls();
}

function openDeleteModal(single = false) {
  const ctx = recordContext(single);
  openModal({
    title: single ? '删除确认' : '批量删除确认',
    size: 'small',
    body: `<p>删除后将无法恢复，确认删除${single ? '当前记录' : `所选 ${ctx.count} 条记录`}吗？</p><p class="status red">该操作仅删除绿台送审记录，不会撤回微信侧已完成的审核。</p>`
  });
}

function openSyncModal(single = false) {
  const ctx = recordContext(single);
  openModal({
    title: single ? '同步状态' : '批量同步状态',
    size: 'small',
    body: `<div class="modal-note">${single ? '当前记录' : `已选择 ${ctx.count} 条记录`}</div><p>将从微信侧拉取最新剧目审核、媒资审核、剧目信息修改审核的状态</p>`
  });
}

batchActions.forEach((button) => button.addEventListener('click', () => {
  if (button.disabled) return;
  batchMenu.classList.remove('open');
  const handlers = { modify: openModifyModal, replace: openReplaceModal, delete: openDeleteModal, sync: openSyncModal };
  handlers[button.dataset.action]();
}));

function historyTable() {
  return `
    <p class="modal-note">合集：她从山海归来（42879）　剧目ID：6227994627813402</p>
    <table class="history-table">
      <thead><tr><th>日期</th><th>修改类型</th><th>状态</th><th>操作</th></tr></thead>
      <tbody>
        <tr><td>2026-08-18 16:24</td><td>剧目基础信息</td><td><span class="status orange">审核中</span></td><td><button class="link-btn history-detail" data-state="审核中">详情</button></td></tr>
        <tr><td>2026-08-15 11:06</td><td>简介、推荐语</td><td><span class="status red">审核失败</span></td><td><button class="link-btn history-detail" data-state="审核失败">详情</button></td></tr>
        <tr><td>2026-08-10 09:38</td><td>剧名、总集数</td><td><span class="status green">审核通过</span></td><td><button class="link-btn history-detail" data-state="审核通过">详情</button></td></tr>
      </tbody>
    </table>`;
}

function bindHistoryDetails() {
  document.querySelectorAll('.history-detail').forEach((button) => button.addEventListener('click', () => {
    const state = button.dataset.state;
    modalTitle.textContent = '剧目信息修改详情';
    modalBody.innerHTML = `
      <dl class="detail-grid">
        <dt>剧名</dt><dd>她从山海归来</dd><dt>剧目ID</dt><dd>6227994627813402</dd><dt>总集数</dt><dd>80集</dd>
        <dt>提审时间</dt><dd>2026-08-15 11:06:28</dd>
        <dt>状态</dt><dd><span class="status ${state === '审核失败' ? 'red' : state === '审核通过' ? 'green' : 'orange'}">${state}</span></dd>
        <dt>审核反馈</dt><dd>${state === '审核失败' ? '短剧简介包含未经备案的宣传用语，请修改后重新提交。' : state === '审核通过' ? '审核通过，无需处理。' : '微信侧审核中，请耐心等待。'}</dd>
      </dl>`;
    modalFooter.hidden = false;
    modalFooter.innerHTML = '<button class="btn" id="backHistory">返回历史</button><button class="btn primary" data-close>关闭</button>';
    document.querySelector('#backHistory').addEventListener('click', openHistoryModal);
    modalFooter.querySelector('[data-close]').addEventListener('click', closeModal);
  }));
}

function openHistoryModal() {
  openModal({ title: '修改历史', body: historyTable(), footer: false, size: 'wide' });
  bindHistoryDetails();
}

document.querySelectorAll('.more-btn').forEach((button) => button.addEventListener('click', (event) => {
  event.stopPropagation();
  activeSingleRow = button.closest('tr');
  const operationCell = button.closest('.operation-col');
  const menu = button.nextElementSibling;
  document.querySelectorAll('.more-menu.open').forEach((item) => {
    if (item !== menu) item.classList.remove('open');
  });
  document.querySelectorAll('.operation-col.menu-open-cell').forEach((cell) => {
    if (cell !== operationCell) cell.classList.remove('menu-open-cell');
  });
  const opening = !menu.classList.contains('open');
  menu.classList.toggle('open', opening);
  operationCell.classList.toggle('menu-open-cell', opening);
  if (opening) {
    const rect = button.getBoundingClientRect();
    const menuHeight = 232;
    const top = Math.min(rect.bottom + 4, window.innerHeight - menuHeight - 8);
    const left = Math.max(8, Math.min(rect.right - 150, window.innerWidth - 158));
    menu.style.top = `${top}px`;
    menu.style.left = `${left}px`;
  }
}));

document.querySelectorAll('.more-menu').forEach((menu) => menu.addEventListener('click', (event) => event.stopPropagation()));
document.addEventListener('click', () => {
  batchMenu.classList.remove('open');
  document.querySelectorAll('.more-menu.open').forEach((menu) => menu.classList.remove('open'));
  document.querySelectorAll('.operation-col.menu-open-cell').forEach((cell) => cell.classList.remove('menu-open-cell'));
});

document.querySelectorAll('.more-menu button').forEach((button) => button.addEventListener('click', () => {
  button.closest('.more-menu').classList.remove('open');
  button.closest('.operation-col').classList.remove('menu-open-cell');
  const actions = {
    'single-modify': () => openModifyModal(true), 'single-replace': () => openReplaceModal(true),
    'single-delete': () => openDeleteModal(true), 'single-sync': () => openSyncModal(true), history: openHistoryModal
  };
  if (actions[button.dataset.action]) actions[button.dataset.action]();
  else showToast('功能示意：已进入授权小程序配置');
}));

document.querySelectorAll('[data-detail]').forEach((button) => button.addEventListener('click', () => {
  openModal({
    title: '审核详情', footer: false,
    body: `<dl class="detail-grid"><dt>送审记录ID</dt><dd>${button.dataset.detail}</dd><dt>剧目审核</dt><dd><span class="status green">审核通过</span></dd><dt>媒资审核</dt><dd><span class="status green">审核通过</span></dd><dt>最近同步时间</dt><dd>2026-08-20 10:30:18</dd></dl>`
  });
}));

document.querySelector('#queryBtn').addEventListener('click', () => {
  const producer = document.querySelector('#producerSearch').value.trim().toLowerCase();
  const collectionName = document.querySelector('#collectionName').value.trim().toLowerCase();
  const collectionId = document.querySelector('#collectionId').value.trim();
  const dramaId = document.querySelector('#dramaId').value.trim();
  const modify = document.querySelector('#modifyStatusFilter').value;
  const copyright = document.querySelector('#copyrightFilter').value;
  let visible = 0;
  rows.forEach((row) => {
    const cells = row.children;
    const match = (!producer || row.dataset.producer.toLowerCase().includes(producer))
      && (!collectionName || cells[3].textContent.toLowerCase().includes(collectionName))
      && (!collectionId || row.dataset.cid === collectionId) && (!dramaId || cells[4].textContent.trim() === dramaId)
      && (modify === '全部' || row.dataset.modify === modify) && (copyright === '全部' || row.dataset.copyright === copyright);
    row.classList.toggle('filtered', !match);
    if (match) visible += 1;
  });
  document.querySelector('#filterResult').textContent = `已筛选出 ${visible} 条记录`;
  updateBatchState();
});

document.querySelector('#resetBtn').addEventListener('click', () => {
  document.querySelectorAll('.filters input').forEach((input) => { input.value = ''; });
  document.querySelectorAll('.filters select').forEach((select) => { select.selectedIndex = 0; });
  rows.forEach((row) => row.classList.remove('filtered'));
  document.querySelector('#filterResult').textContent = '';
  updateBatchState();
});

updateBatchState();
