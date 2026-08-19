const rows = [...document.querySelectorAll('#tableBody tr')];
const checks = [...document.querySelectorAll('.row-check')];
const selectAll = document.querySelector('#selectAll');
const batchBar = document.querySelector('#batchBar');
const selectedCount = document.querySelector('#selectedCount');
const batchHint = document.querySelector('#batchHint');
const batchButtons = [...document.querySelectorAll('.batch-action')];
const modalBackdrop = document.querySelector('#modalBackdrop');
const modal = modalBackdrop.querySelector('.modal');
const modalTitle = document.querySelector('#modalTitle');
const modalBody = document.querySelector('#modalBody');
const modalFooter = document.querySelector('#modalFooter');
const toast = document.querySelector('#toast');

function selectedRows() {
  return rows.filter((row) => row.querySelector('.row-check').checked && !row.classList.contains('filtered'));
}

function updateBatchState() {
  const selected = selectedRows();
  const ids = [...new Set(selected.map((row) => row.dataset.cid))];
  const valid = selected.length > 0 && ids.length === 1;

  rows.forEach((row) => row.classList.toggle('selected', row.querySelector('.row-check').checked));
  selectedCount.textContent = `已选择 ${selected.length} 条`;
  batchBar.classList.toggle('ready', valid);
  batchBar.classList.toggle('invalid', selected.length > 0 && !valid);
  batchButtons.forEach((button) => { button.disabled = !valid; });

  if (!selected.length) batchHint.textContent = '请选择需要批量处理的记录';
  else if (valid) batchHint.textContent = `合集ID ${ids[0]} 校验通过，可执行批量操作`;
  else batchHint.textContent = '所选记录合集ID不一致，无法执行批量操作';

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

function openModal({ title, body, footer = true, size = '' }) {
  modalTitle.textContent = title;
  modalBody.innerHTML = body;
  modalFooter.innerHTML = footer ? '<button class="btn" data-close>取消</button><button class="btn primary" data-confirm>确定</button>' : '<button class="btn primary" data-close>关闭</button>';
  modal.className = `modal ${size}`.trim();
  modalBackdrop.classList.add('open');
  modalBackdrop.setAttribute('aria-hidden', 'false');
  modalFooter.querySelectorAll('[data-close]').forEach((button) => button.addEventListener('click', closeModal));
  const confirm = modalFooter.querySelector('[data-confirm]');
  if (confirm) confirm.addEventListener('click', () => { closeModal(); showToast(`${title}已提交`); });
}

document.querySelector('#modalClose').addEventListener('click', closeModal);
modalBackdrop.addEventListener('click', (event) => { if (event.target === modalBackdrop) closeModal(); });

function batchContext() {
  const selected = selectedRows();
  return { count: selected.length, cid: selected[0]?.dataset.cid || '-' };
}

function openModifyModal(single = false) {
  const ctx = batchContext();
  openModal({
    title: single ? '修改剧目信息' : '批量修改剧目信息',
    size: 'wide',
    body: `
      <div class="modal-note">${single ? '当前记录' : `已选择 ${ctx.count} 条记录，合集ID：${ctx.cid}`}。提交后将同步更新所选送审记录。</div>
      <div class="modal-form">
        <label>选择合集<input value="她从山海归来 / 42879" disabled></label>
        <label>短剧更新状态<select><option>已完结</option><option>连载中</option></select></label>
        <label class="full"><span><i class="required">*</i> 短剧推荐语</span><input value="重回十八岁，她决定改写所有遗憾"></label>
        <label class="full"><span><i class="required">*</i> 短剧简介</span><textarea rows="3">一次意外让她重回十八岁，面对命运的分岔路，她重新作出选择。</textarea></label>
        <label class="full"><span><i class="required">*</i> 内容梗概</span><textarea rows="4">女主回到关键人生节点，在亲情、友情与事业中修正遗憾，并发现改变命运的真正代价。</textarea></label>
        <label>制作机构<input value="果然映像"></label>
        <label>总集数<input value="80"></label>
      </div>`
  });
}

function openReplaceModal(single = false) {
  const ctx = batchContext();
  openModal({
    title: single ? '替换剧集' : '批量替换剧集',
    body: `<div class="modal-note">${single ? '当前记录' : `已选择 ${ctx.count} 条记录，合集ID：${ctx.cid}`}。请上传与原剧集序号一致的视频文件。</div><div class="upload-zone"><strong>点击或拖拽上传剧集文件</strong><p>支持 MP4；系统将按剧集序号校验并替换</p><button class="btn light">选择文件</button></div>`
  });
}

function openDeleteModal(single = false) {
  const ctx = batchContext();
  openModal({
    title: single ? '删除确认' : '批量删除确认',
    size: 'small',
    body: `<p>删除后将无法恢复，确认删除${single ? '当前记录' : `所选 ${ctx.count} 条记录`}吗？</p><p class="status red">该操作仅删除绿台送审记录，不会撤回微信侧已完成的审核。</p>`
  });
}

function openSyncModal(single = false) {
  const ctx = batchContext();
  openModal({
    title: single ? '同步状态' : '批量同步状态',
    size: 'small',
    body: `<div class="modal-note">${single ? '当前记录' : `已选择 ${ctx.count} 条记录，合集ID：${ctx.cid}`}</div><p>将从微信侧拉取最新剧目审核、媒资审核、剧目信息修改及版权保护状态。</p>`
  });
}

batchButtons.forEach((button) => button.addEventListener('click', () => {
  if (button.disabled) return;
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
        <dt>剧名</dt><dd>她从山海归来</dd>
        <dt>剧目ID</dt><dd>6227994627813402</dd>
        <dt>总集数</dt><dd>80集</dd>
        <dt>提审时间</dt><dd>2026-08-15 11:06:28</dd>
        <dt>状态</dt><dd><span class="status ${state === '审核失败' ? 'red' : state === '审核通过' ? 'green' : 'orange'}">${state}</span></dd>
        <dt>审核反馈</dt><dd>${state === '审核失败' ? '短剧简介包含未经备案的宣传用语，请修改后重新提交。' : state === '审核通过' ? '审核通过，无需处理。' : '微信侧审核中，请耐心等待。'}</dd>
      </dl>`;
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
  const menu = button.nextElementSibling;
  document.querySelectorAll('.more-menu.open').forEach((item) => { if (item !== menu) item.classList.remove('open'); });
  menu.classList.toggle('open');
}));

document.addEventListener('click', () => document.querySelectorAll('.more-menu.open').forEach((menu) => menu.classList.remove('open')));
document.querySelectorAll('.more-menu').forEach((menu) => menu.addEventListener('click', (event) => event.stopPropagation()));

document.querySelectorAll('.more-menu button').forEach((button) => button.addEventListener('click', () => {
  button.closest('.more-menu').classList.remove('open');
  const actions = {
    'single-modify': () => openModifyModal(true),
    'single-replace': () => openReplaceModal(true),
    'single-delete': () => openDeleteModal(true),
    'single-sync': () => openSyncModal(true),
    history: openHistoryModal
  };
  if (actions[button.dataset.action]) actions[button.dataset.action]();
  else showToast('功能示意：已进入授权小程序配置');
}));

document.querySelectorAll('[data-detail]').forEach((button) => button.addEventListener('click', () => {
  openModal({
    title: '审核详情',
    footer: false,
    body: `<dl class="detail-grid"><dt>送审记录ID</dt><dd>${button.dataset.detail}</dd><dt>剧目审核</dt><dd><span class="status green">审核通过</span></dd><dt>媒资审核</dt><dd><span class="status green">审核通过</span></dd><dt>最近同步时间</dt><dd>2026-08-19 10:30:18</dd></dl>`
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
      && (!collectionId || row.dataset.cid === collectionId)
      && (!dramaId || cells[4].textContent.trim() === dramaId)
      && (modify === '全部' || row.dataset.modify === modify)
      && (copyright === '全部' || row.dataset.copyright === copyright);
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
