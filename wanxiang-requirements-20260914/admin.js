import { readUsers, updateUser, subscribeUsers, formatTime } from './store.js';

const $ = (selector) => document.querySelector(selector);
const escapeHtml = (value) => String(value ?? '').replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
const statusNames = { pending: '待审核', approved: '已通过', rejected: '已拒绝' };
const state = { filters: { phone: '', status: '', start: '', end: '' }, page: 1, size: 10, dialog: null, saving: false };
let returnFocus = null;
let toastTimer;
let savedOverflow = '';

function displayTime(value) {
  if (!value) return '—';
  try { return formatTime(value); } catch { return '—'; }
}

function localDate(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function filteredUsers() {
  const { phone, status, start, end } = state.filters;
  return readUsers().filter((user) => {
    const date = localDate(user.createdAt);
    return (!phone || String(user.phone).includes(phone)) && (!status || user.status === status) && (!start || (date && date >= start)) && (!end || (date && date <= end));
  }).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

function statusBadge(user) {
  return `<span class="status-tag ${Object.hasOwn(statusNames, user.status) ? user.status : 'pending'}">${escapeHtml(statusNames[user.status] || '待审核')}</span>`;
}

function noticeLabel(user) {
  if (user.noticeStatus === 'sent') return '<span class="notice sent">已发送<small>模拟短信</small></span>';
  if (user.noticeStatus === 'failed') return '<span class="notice failed">发送失败<small>模拟短信</small></span>';
  return `<span class="notice">${user.status === 'rejected' ? '无需发送' : '未发送'}</span>`;
}

function renderList() {
  const users = filteredUsers();
  const pageCount = Math.max(1, Math.ceil(users.length / state.size));
  state.page = Math.max(1, Math.min(pageCount, state.page));
  const rows = users.slice((state.page - 1) * state.size, state.page * state.size);
  $('#listCount').textContent = users.length;
  $('#totalCount').textContent = `共 ${users.length} 条 · 第 ${state.page} / ${pageCount} 页`;
  $('#previousPage').disabled = state.page === 1;
  $('#nextPage').disabled = state.page >= pageCount;
  $('#userRows').innerHTML = rows.length ? rows.map((user) => `<tr>
    <td class="phone-cell">${escapeHtml(user.phone)}</td>
    <td>${escapeHtml(user.source || '—')}</td>
    <td class="cell-time">${escapeHtml(displayTime(user.createdAt))}</td>
    <td>${statusBadge(user)}</td>
    <td>${noticeLabel(user)}</td>
    <td class="sticky-operation"><div class="operations"><button class="text-button" data-action="detail" data-id="${escapeHtml(user.id)}" aria-label="查看 ${escapeHtml(user.phone)} 详情">详情</button>${user.status === 'pending' ? `<button class="text-button" data-action="review" data-id="${escapeHtml(user.id)}" aria-label="审核 ${escapeHtml(user.phone)} 的申请">审核</button>` : ''}</div></td>
  </tr>`).join('') : '<tr><td class="empty-cell" colspan="6"><div class="empty-state"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m8 3-5 6v11h18V9l-5-6zM3 9h6l1 3h4l1-3h6"/></svg><strong>暂无符合条件的用户</strong><p>请调整筛选条件后重新查询</p><button class="text-button" data-action="reset">重置筛选</button></div></td></tr>';
  const pages = [...new Set([1, state.page - 1, state.page, state.page + 1, pageCount])].filter((page) => page >= 1 && page <= pageCount).sort((a, b) => a - b);
  $('#pageNumbers').innerHTML = pages.map((page, index) => `${index && page - pages[index - 1] > 1 ? '<span class="ellipsis">…</span>' : ''}<button type="button" data-page="${page}" class="${page === state.page ? 'active' : ''}" ${page === state.page ? 'aria-current="page"' : ''} aria-label="第 ${page} 页">${page}</button>`).join('');
}

function toast(message) {
  clearTimeout(toastTimer);
  $('#toast').textContent = message;
  $('#toast').classList.add('show');
  toastTimer = setTimeout(() => $('#toast').classList.remove('show'), 4000);
}

function openDialog(title, body, footer, type = 'detail') {
  const wasOpen = !$('#modalLayer').hidden;
  if (!wasOpen) {
    returnFocus = document.activeElement;
    savedOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
  }
  $('#modalTitle').textContent = title;
  const annotationNumber = type === 'detail' ? 2 : 3;
  $('#modalTitle').insertAdjacentHTML('beforeend', `<span class="prd-pin" data-prd-number="${annotationNumber}" aria-hidden="true" title="PRD 5 / ${annotationNumber}">${annotationNumber}</span>`);
  $('#modalClose').disabled = false;
  $('#modalLayer').removeAttribute('aria-busy');
  $('#modalBody').innerHTML = body;
  $('#modalFooter').innerHTML = footer;
  $('#modal').classList.toggle('confirm', type !== 'detail');
  $('#modalLayer').hidden = false;
  $('#pageSurface').inert = true;
  $('#modalBody').scrollTop = 0;
  requestAnimationFrame(() => $('#modalClose').focus({preventScroll:true}));
}

function closeDialog() {
  if (state.saving) return;
  $('#modalLayer').hidden = true;
  $('#pageSurface').inert = false;
  document.body.style.overflow = savedOverflow;
  state.dialog = null;
  if (returnFocus?.isConnected) returnFocus.focus({preventScroll:true});
  else $('#listTitle').focus?.({ preventScroll: true });
}

function detailField(label, value, full = false) {
  const text = Array.isArray(value) ? value.filter(Boolean).join('、') : String(value ?? '').trim();
  return `<div class="detail-field${full ? ' full' : ''}"><dt>${escapeHtml(label)}</dt><dd>${escapeHtml(text || '—')}</dd></div>`;
}

function openDetail(id) {
  const user = readUsers().find((item) => String(item.id) === String(id));
  if (!user) return toast('该用户记录已更新，请重新查询。');
  state.dialog = { type: 'detail', id: user.id };
  const business = user.business || {};
  const contact = String(business.contact ?? '').trim() || user.phone;
  openDialog('用户申请详情', `<dl class="detail-grid business-detail">${detailField('姓名', business.name)}${detailField('公司 / 机构名称', business.company)}${detailField('联系方式', contact)}${detailField('职位 / 角色', business.role)}${detailField('合作方向', business.direction, true)}${detailField('合作需求', business.needs, true)}</dl>`, '<button class="button" data-dialog-action="close">关闭</button>');
}

function openReview(id) {
  const user = readUsers().find((item) => String(item.id) === String(id));
  if (!user) return toast('该用户记录已更新，请重新查询。');
  if (user.status !== 'pending') {
    toast('该申请已完成审核，不能重复操作。');
    return openDetail(id);
  }
  state.dialog = { type: 'review', id: user.id };
  openDialog('审核申请', `<div class="confirm-copy"><p>请选择审核结果，确认提交后不可修改。</p></div><div class="review-subject"><span>申请手机号</span><strong>${escapeHtml(user.phone)}</strong></div><fieldset class="review-result" aria-describedby="selectionError"><legend>审核结果 <span aria-hidden="true">*</span></legend><div class="radio-options"><label><input type="radio" name="reviewResult" value="approved" required>审核通过</label><label><input type="radio" name="reviewResult" value="rejected" required>拒绝</label></div><p class="selection-error" id="selectionError" role="alert" hidden></p></fieldset><p class="inline-note">审核通过后可登录，并模拟发送短信通知；拒绝后仍不可登录，不发送通过通知。</p><p class="modal-error" id="saveError" role="alert" hidden></p>`, '<button class="button" data-dialog-action="cancel">取消</button><button class="button primary" id="confirmReview" data-dialog-action="confirm">确认提交</button>', 'review');
}

async function saveReview() {
  if (state.saving || state.dialog?.type !== 'review') return;
  const { id } = state.dialog;
  const user = readUsers().find((item) => String(item.id) === String(id));
  if (!user || user.status !== 'pending') {
    toast('该申请已在其他页面更新，请查看最新审核结果。');
    return user ? openDetail(id) : closeDialog();
  }
  const result = $('#modalBody input[name="reviewResult"]:checked')?.value;
  if (!['approved', 'rejected'].includes(result)) {
    $('#selectionError').textContent = '请选择审核结果。';
    $('#selectionError').hidden = false;
    $('#modalBody input[name="reviewResult"]').focus({ preventScroll: true });
    return;
  }
  state.saving = true;
  $('#selectionError').hidden = true;
  $('#saveError').hidden = true;
  $('#modalLayer').setAttribute('aria-busy', 'true');
  $('#modalLayer').querySelectorAll('button,input').forEach((element) => { element.disabled = true; });
  $('#confirmReview').textContent = '保存中…';
  try {
    await new Promise((resolve) => setTimeout(resolve, 380));
    if ($('#failNextSave').checked) {
      $('#failNextSave').checked = false;
      throw new Error('DEMO_SAVE_FAILURE');
    }
    const latest = readUsers().find((item) => String(item.id) === String(id));
    if (!latest || latest.status !== 'pending') throw new Error('ALREADY_REVIEWED');
    await updateUser(id, { status: result, reviewer: '演示审核员', reviewedAt: new Date().toISOString(), noticeStatus: result === 'approved' ? 'sent' : 'not-sent' });
    state.saving = false;
    $('#modalLayer').removeAttribute('aria-busy');
    closeDialog();
    renderList();
    toast(result === 'approved' ? '审核通过，短信通知已模拟发送。' : '申请已拒绝，审核结果已保存。');
  } catch (error) {
    state.saving = false;
    $('#modalLayer').removeAttribute('aria-busy');
    if (error?.message === 'ALREADY_REVIEWED') {
      toast('该申请已在其他页面完成审核，请查看最新结果。');
      return readUsers().some((item) => String(item.id) === String(id)) ? openDetail(id) : closeDialog();
    }
    $('#modalLayer').querySelectorAll('button,input').forEach((element) => { element.disabled = false; });
    $('#saveError').hidden = false;
    $('#saveError').textContent = '保存失败，审核结果未修改。请重试；已选择的结果为你保留。';
    $('#confirmReview').textContent = '重试保存';
    $('#confirmReview').focus({preventScroll:true});
  }
}

function resetFilters() {
  $('#filterForm').reset();
  $('#filterError').hidden = true;
  state.filters = { phone: '', status: '', start: '', end: '' };
  state.page = 1;
  renderList();
}

$('#filterForm').addEventListener('submit', (event) => {
  event.preventDefault();
  const form = new FormData(event.currentTarget);
  const filters = Object.fromEntries([...form.entries()].map(([key, value]) => [key, value.trim()]));
  if (filters.start && filters.end && filters.start > filters.end) {
    $('#filterError').textContent = '申请开始日期不能晚于结束日期，请调整后查询。';
    $('#filterError').hidden = false;
    return $('#endDate').focus({preventScroll:true});
  }
  $('#filterError').hidden = true;
  state.filters = filters;
  state.page = 1;
  renderList();
});
$('#resetFilters').addEventListener('click', resetFilters);
$('#pageSize').addEventListener('change', (event) => { state.size = Number(event.target.value); state.page = 1; renderList(); });
$('#previousPage').addEventListener('click', () => { state.page--; renderList(); });
$('#nextPage').addEventListener('click', () => { state.page++; renderList(); });
$('#pageNumbers').addEventListener('click', (event) => { const button = event.target.closest('[data-page]'); if (button) { state.page = Number(button.dataset.page); renderList(); } });
$('#userRows').addEventListener('click', (event) => {
  const button = event.target.closest('[data-action]');
  if (!button) return;
  if (button.dataset.action === 'reset') return resetFilters();
  if (button.dataset.action === 'detail') openDetail(button.dataset.id);
  else if (button.dataset.action === 'review') openReview(button.dataset.id);
});
$('#modalFooter').addEventListener('click', (event) => {
  const button = event.target.closest('[data-dialog-action]');
  if (!button || state.saving) return;
  const action = button.dataset.dialogAction;
  if (action === 'close' || action === 'cancel') closeDialog();
  else if (action === 'confirm') saveReview();
});
$('#modalBody').addEventListener('change', (event) => {
  if (event.target.name !== 'reviewResult' || state.saving) return;
  $('#selectionError').hidden = true;
  $('#saveError').hidden = true;
  $('#confirmReview').textContent = '确认提交';
});
$('#modalClose').addEventListener('click', closeDialog);
$('#modalLayer').addEventListener('click', (event) => { if (event.target === event.currentTarget) closeDialog(); });
document.addEventListener('keydown', (event) => {
  if ($('#modalLayer').hidden) return;
  if (event.key === 'Escape') { event.preventDefault(); closeDialog(); }
  if (event.key !== 'Tab') return;
  const focusable = [...$('#modal').querySelectorAll('button:not(:disabled),input:not(:disabled),textarea:not(:disabled),a[href],[tabindex="0"]')].filter((element) => element.getClientRects().length);
  if (!focusable.length) { event.preventDefault(); return $('#modal').focus({preventScroll:true}); }
  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  if (event.shiftKey && (document.activeElement === first || document.activeElement === $('#modal'))) { event.preventDefault(); last.focus({preventScroll:true}); }
  else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus({preventScroll:true}); }
});
$('#toggleSidebar').addEventListener('click', () => {
  const collapsed = $('#appShell').classList.toggle('is-collapsed');
  const expanded = window.matchMedia('(max-width:760px)').matches ? collapsed : !collapsed;
  $('#toggleSidebar').setAttribute('aria-expanded', String(expanded));
  $('#toggleSidebar').setAttribute('aria-label', expanded ? '折叠菜单' : '展开菜单');
});
if (window.matchMedia('(max-width:760px)').matches) {
  $('#toggleSidebar').setAttribute('aria-expanded', 'false');
  $('#toggleSidebar').setAttribute('aria-label', '展开菜单');
}

subscribeUsers(() => {
  renderList();
  if (state.dialog?.type === 'detail' && !state.saving) openDetail(state.dialog.id);
  else if (state.dialog && !state.saving) {
    const current = readUsers().find((user) => String(user.id) === String(state.dialog.id));
    if (current && current.status !== 'pending') {
      toast('该申请已完成审核，已为你更新详情。');
      openDetail(current.id);
    }
  }
});
renderList();
if(window.parent!==window)window.parent.postMessage({type:'wanxiang-prd-section',section:'admin'},location.origin);
