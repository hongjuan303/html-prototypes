(function () {
  const state = {
    batchIds: { collection: [], drama: [] },
    entryType: null,
    currentRows: []
  };

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));
  const tableBody = $('#tableBody');
  const entryPopover = $('#entryPopover');
  const modalBackdrop = $('#modalBackdrop');
  const modal = $('.modal', modalBackdrop);
  const modalTitle = $('#modalTitle');
  const modalBody = $('#modalBody');
  const modalFooter = $('#modalFooter');

  function parseIds(value) {
    return Array.from(new Set(value.split(/[\s,，]+/).map((item) => item.trim()).filter(Boolean))).slice(0, 100);
  }

  function formatNow() {
    const now = new Date();
    const pad = (value) => String(value).padStart(2, '0');
    return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}`;
  }

  function showToast(message) {
    const toast = $('#toast');
    toast.textContent = message;
    toast.classList.add('show');
    clearTimeout(showToast.timer);
    showToast.timer = setTimeout(() => toast.classList.remove('show'), 2300);
  }

  function visibleRows() {
    return $$('tr', tableBody).filter((row) => !row.classList.contains('filtered'));
  }

  function actionableRows() {
    return visibleRows().filter((row) => {
      const checkbox = $('.row-check', row);
      return checkbox && !checkbox.disabled;
    });
  }

  function selectedRows() {
    return $$('.row-check:checked', tableBody).map((checkbox) => checkbox.closest('tr'));
  }

  function updateSelection() {
    const rows = selectedRows();
    $('#selectedCount').textContent = `已选择 ${rows.length} 条`;
    $('#batchJoinBtn').disabled = rows.length === 0;
    const available = actionableRows();
    $('#selectAll').checked = available.length > 0 && available.every((row) => $('.row-check', row).checked);
    $('#selectAll').indeterminate = rows.length > 0 && !$('#selectAll').checked;
    $$('tr', tableBody).forEach((row) => row.classList.toggle('selected', Boolean($('.row-check:checked', row))));
  }

  function applyFilters() {
    const name = $('#collectionName').value.trim().toLowerCase();
    const app = $('#miniProgram').value;
    const status = $('#promotionStatus').value;
    const cids = state.batchIds.collection;
    const dids = state.batchIds.drama;
    let count = 0;

    $$('tr', tableBody).forEach((row) => {
      const matches = (!name || row.dataset.name.toLowerCase().includes(name))
        && (!app || row.dataset.app === app)
        && (!status || row.dataset.status === status)
        && (!cids.length || cids.includes(row.dataset.cid))
        && (!dids.length || dids.includes(row.dataset.did));
      row.classList.toggle('filtered', !matches);
      if (!matches) $('.row-check', row).checked = false;
      if (matches) count += 1;
    });

    $('#filterResult').textContent = `共 ${count} 条`;
    $('#paginationTotal').textContent = `共 ${count} 条`;
    updateSelection();
  }

  function resetFilters() {
    $('#collectionName').value = '';
    $('#miniProgram').value = '';
    $('#promotionStatus').value = '';
    state.batchIds = { collection: [], drama: [] };
    updateEntryControl('collection');
    updateEntryControl('drama');
    applyFilters();
    showToast('筛选条件已重置');
  }

  function updateEntryControl(type) {
    const button = $(`[data-entry="${type}"]`);
    const text = $(`#${type}EntryText`);
    const count = state.batchIds[type].length;
    button.classList.toggle('has-values', count > 0);
    text.textContent = count ? `已录入 ${count} 个` : '录入';
  }

  function openEntry(type, anchor) {
    state.entryType = type;
    const isCollection = type === 'collection';
    $('#entryTitle').textContent = `批量录入${isCollection ? '合集' : '剧目'}ID`;
    $('#entryTextarea').placeholder = `请输入${isCollection ? '合集' : '剧目'}ID，多个ID回车换行展示`;
    $('#entryTextarea').value = state.batchIds[type].join('\n');
    const rect = anchor.getBoundingClientRect();
    entryPopover.hidden = false;
    const left = Math.min(rect.left, window.innerWidth - 410);
    entryPopover.style.left = `${Math.max(12, left)}px`;
    entryPopover.style.top = `${rect.bottom + 8}px`;
    $('#entryTextarea').focus();
  }

  function closeEntry() {
    entryPopover.hidden = true;
    state.entryType = null;
  }

  function closeModal() {
    modalBackdrop.classList.remove('open');
    modalBackdrop.setAttribute('aria-hidden', 'true');
    modal.classList.remove('wide');
    state.currentRows = [];
  }

  function openModal(title, body, confirmLabel, onConfirm, wide = false) {
    modalTitle.textContent = title;
    modalBody.innerHTML = body;
    modalFooter.innerHTML = '';
    modal.classList.toggle('wide', wide);

    const cancel = document.createElement('button');
    cancel.className = 'btn';
    cancel.textContent = '取消';
    cancel.addEventListener('click', closeModal);

    const confirm = document.createElement('button');
    confirm.className = 'btn primary';
    confirm.textContent = confirmLabel;
    confirm.addEventListener('click', onConfirm);

    modalFooter.append(cancel, confirm);
    modalBackdrop.classList.add('open');
    modalBackdrop.setAttribute('aria-hidden', 'false');
  }

  function confirmationBody(row, action) {
    const joining = action === 'join';
    const currentStatus = row.dataset.status === '1' ? '已加入计划（status=1）' : '未加入计划（status=0）';
    return `
      <dl class="confirm-summary">
        <dt>合集ID</dt><dd>${row.dataset.cid}</dd>
        <dt>合集名称</dt><dd>${row.dataset.name}</dd>
        <dt>剧目ID</dt><dd>${row.dataset.did}</dd>
        <dt>小程序</dt><dd>${row.dataset.app}</dd>
        <dt>当前状态</dt><dd>${currentStatus}</dd>
      </dl>
      <div class="modal-note">${joining ? '系统将在提交前再次校验媒资审核与剧目审核状态。' : '确认退出后仍展示“已加入计划（status=1）”，批查询确认 status=0 后才更新为“未加入计划”。'}</div>`;
  }

  function renderRowStatus(row, status, remark) {
    delete row.dataset.pending;
    const statusValue = status === '已加入计划' ? '1' : '0';
    row.dataset.status = statusValue;
    const className = statusValue === '1' ? 'blue' : 'gray';
    $('.promotion-cell', row).innerHTML = `<span class="status ${className}">${status}</span>`;
    $('.remark-cell', row).textContent = remark;
    $('.operator-cell', row).textContent = '洪娟';
    $('.time-cell', row).textContent = formatNow();
    const checkbox = $('.row-check', row);
    const operation = $('.operation-col', row);

    if (status === '已加入计划') {
      checkbox.checked = false;
      checkbox.disabled = true;
      operation.innerHTML = '<button class="link-btn exit-btn">退出计划</button>';
    } else {
      checkbox.disabled = false;
      operation.innerHTML = '<button class="link-btn join-btn">加入计划</button>';
    }
  }

  function renderJoinPending(row) {
    row.dataset.pending = 'join';
    row.dataset.status = '0';
    $('.promotion-cell', row).innerHTML = '<span class="status gray">未加入计划</span>';
    $('.remark-cell', row).textContent = '请求已受理，批查询状态中';
    $('.operator-cell', row).textContent = '洪娟';
    $('.time-cell', row).textContent = formatNow();
    const checkbox = $('.row-check', row);
    checkbox.checked = false;
    checkbox.disabled = true;
    $('.operation-col', row).innerHTML = '<button class="link-btn disabled" disabled>状态查询中</button>';
  }

  function renderExitPending(row) {
    row.dataset.pending = 'exit';
    row.dataset.status = '1';
    $('.promotion-cell', row).innerHTML = '<span class="status blue">已加入计划</span>';
    $('.remark-cell', row).textContent = '退出请求已受理，批查询状态中';
    $('.operator-cell', row).textContent = '洪娟';
    $('.time-cell', row).textContent = formatNow();
    const checkbox = $('.row-check', row);
    checkbox.checked = false;
    checkbox.disabled = true;
    $('.operation-col', row).innerHTML = '<button class="link-btn disabled" disabled>状态查询中</button>';
  }

  function queryPromotionStatus(rows, batch) {
    setTimeout(() => {
      rows.forEach((row) => renderRowStatus(row, '已加入计划', 'action_type=2 查询：已加入'));
      applyFilters();
      showToast(batch ? '批查询完成，本批短剧均已加入计划' : '状态查询完成，短剧已加入计划');
    }, 1200);
  }

  function queryExitStatus(row) {
    setTimeout(() => {
      renderRowStatus(row, '未加入计划', 'action_type=2 查询：未加入');
      applyFilters();
      showToast('状态查询完成，短剧已退出推广计划');
    }, 1200);
  }

  function openSingleAction(row, action) {
    const joining = action === 'join';
    state.currentRows = [row];
    openModal(
      joining ? '确认加入推广计划' : '确认退出推广计划',
      confirmationBody(row, action),
      joining ? '确认加入' : '确认退出',
      () => {
        if (joining) renderJoinPending(row);
        else renderExitPending(row);
        closeModal();
        applyFilters();
        if (joining) {
          showToast('加入请求已受理，正在通过 action_type=2 查询状态');
          queryPromotionStatus([row], false);
        } else {
          showToast('退出请求已受理，正在通过 action_type=2 查询状态');
          queryExitStatus(row);
        }
      }
    );
  }

  function openBatchJoin() {
    const rows = selectedRows();
    if (!rows.length) return;
    state.currentRows = rows;
    const body = `
      <div class="modal-note" style="margin-top:0">共选择 ${rows.length} 个合集，系统将按小程序拆分微信批量请求。每个请求均为整批成败：任一短剧不符合条件，该请求内全部短剧加入失败。</div>
      <table class="batch-table">
        <thead><tr><th>合集ID</th><th>合集名称</th><th>小程序</th><th>准入校验</th></tr></thead>
        <tbody>${rows.map((row) => `<tr><td>${row.dataset.cid}</td><td>${row.dataset.name}</td><td>${row.dataset.app}</td><td><span class="status green">双审核通过</span></td></tr>`).join('')}</tbody>
      </table>`;
    openModal('批量加入推广计划', body, '确认批量加入', () => {
      rows.forEach(renderJoinPending);
      closeModal();
      applyFilters();
      showToast(`已提交 ${rows.length} 条加入任务，正在批查询短剧状态`);
      queryPromotionStatus(rows, true);
    }, true);
  }

  $$('[data-entry]').forEach((button) => button.addEventListener('click', (event) => {
    event.stopPropagation();
    openEntry(button.dataset.entry, button);
  }));

  $('#entryClose').addEventListener('click', closeEntry);
  $('#entryClear').addEventListener('click', () => { $('#entryTextarea').value = ''; });
  $('#entryConfirm').addEventListener('click', () => {
    const type = state.entryType;
    if (!type) return;
    state.batchIds[type] = parseIds($('#entryTextarea').value);
    updateEntryControl(type);
    closeEntry();
    showToast(state.batchIds[type].length ? `已录入 ${state.batchIds[type].length} 个ID` : '已清空批量ID');
  });

  document.addEventListener('click', (event) => {
    if (!entryPopover.hidden && !entryPopover.contains(event.target) && !event.target.closest('[data-entry]')) closeEntry();
  });

  $('#queryBtn').addEventListener('click', () => { applyFilters(); showToast('查询完成'); });
  $('#resetBtn').addEventListener('click', resetFilters);
  $('#exportBtn').addEventListener('click', () => showToast(`已导出当前 ${visibleRows().length} 条数据`));
  $('#selectAll').addEventListener('change', (event) => {
    actionableRows().forEach((row) => { $('.row-check', row).checked = event.target.checked; });
    updateSelection();
  });
  tableBody.addEventListener('change', (event) => {
    if (event.target.classList.contains('row-check')) updateSelection();
  });
  tableBody.addEventListener('click', (event) => {
    const row = event.target.closest('tr');
    if (!row) return;
    if (event.target.classList.contains('join-btn')) openSingleAction(row, 'join');
    if (event.target.classList.contains('exit-btn')) openSingleAction(row, 'exit');
  });
  $('#batchJoinBtn').addEventListener('click', openBatchJoin);
  $('#modalClose').addEventListener('click', closeModal);
  modalBackdrop.addEventListener('click', (event) => { if (event.target === modalBackdrop) closeModal(); });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      closeEntry();
      closeModal();
    }
  });

  updateSelection();
})();
