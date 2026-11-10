"use strict";

const $ = (selector) => document.querySelector(selector);
const escape = (value) => String(value ?? "").replace(/[&<>"']/g, (char) =>
  ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]
);

const sources = [
  { id: "wxaaaabbbbccccdddd", name: "容量阅读" },
  { id: "wxeeeeffff00001111", name: "果读小说" },
];
const demoTarget = "wx1122334455667788";
const titles = [
  "红线尽头是归舟", "等一场迟来的雪", "旧巷里最后一盏灯", "山海有归期",
  "消失的那封信", "风起时再见", "红线尽头是归舟", "月光漫过窗台",
  "仍有回声", "候鸟经过的夏天", "写给远方的信",
];
const books = titles.map((name, index) => ({
  key: String(580 - index),
  id: String(index === 6 ? 596 : 596 - index),
  name,
  bookId: index === 10 ? "" : "book_" + (836755 + index),
  source: sources[index === 6 ? 1 : index % 2],
  review: index === 2 || index === 8 ? "审核中" : index === 9 ? "审核不通过" : index === 10 ? "未提审" : "审核通过",
  release: index < 8,
  removed: index === 7,
  editor: ["安净", "林舟", "江岚"][index % 3],
  department: index % 2 ? "编辑五部" : "内容运营",
}));
const eligible = (book) => book.review === "审核通过" && book.release && !book.removed && Boolean(book.bookId);
const bookByKey = (key) => books.find((book) => book.key === key);
const chinaTime = (ms) => new Date(ms + 8 * 3600 * 1000).toISOString().slice(0, 19).replace("T", " ");
const relation = (book, target, expires) => ({ key: book.key, target, expires });
const relationKey = ({ key, target }) => key + "|" + target;
const active = (record) => record.expires > Date.now();
const day = 86400000;
const storageKey = "wechat-novel-authorization-v1";
const maxDate = 2147483646 * 1000;
const pageSize = 5;
let records = [
  relation(books[0], demoTarget, Date.now() + 180 * day),
  relation(books[1], "wx8899aabbccddeeff", Date.now() + 90 * day),
  relation(books[4], demoTarget, Date.now() - 7 * day),
];
let pending = [];

try {
  const saved = JSON.parse(localStorage.getItem(storageKey));
  if (Array.isArray(saved?.records) && Array.isArray(saved.pending)) {
    records = saved.records.filter((item) => bookByKey(item.key) && Number.isFinite(item.expires));
    pending = saved.pending.filter((item) => bookByKey(item.record.key));
  }
} catch {
  // The prototype also works in a browser that blocks local storage.
}

function save() {
  try {
    localStorage.setItem(storageKey, JSON.stringify({ records, pending }));
  } catch {
    // Keep the current session usable when browser storage is unavailable.
  }
}

const filter = { base: {}, manage: { status: "有效" } };
const page = { manage: 1 };
let view = "base";
const listSelection = new Set();
let selected = [];
let grantReturn = "base";
let visibleBooks = [];
let draft = {};
let revoke = null;
let notice = [];
let timer;

const modes = () => $("#mode").value;
const option = (value, label, current) =>
  `<option value="${escape(value)}"${current === value ? " selected" : ""}>${escape(label)}</option>`;
const field = (key, label, value = "", options = null, placeholder = "请输入") =>
  `<label class="field"><span>${label}</span>${options
    ? `<select name="${key}">${options.map(([id, name]) => option(id, name, value)).join("")}</select>`
    : `<input name="${key}" value="${escape(value)}" placeholder="${placeholder}" autocomplete="off">`}</label>`;
const values = (items) => [["", "全部"], ...items.map((item) => [item, item])];
const sourceOptions = [["", "全部"], ...sources.map(({ id, name }) => [id, name])];
const marker = (number) => `<button type="button" class="marker" data-note="${number}" aria-label="查看说明 ${number}">${number}</button>`;
const btn = (label, action, css = "") => `<button type="button" class="${css}" data-action="${action}">${label}</button>`;
const heading = (label, number) => `<h2 class="region-head">${marker(number)} ${label}</h2>`;
const sourceCell = ({ id, name }) => `${name}<span class="appid">${id}</span>`;
const status = (label, cls) => `<span class="status ${cls}">${label}</span>`;
const empty = (title, hint = "") => `<div class="empty"><strong>${title}</strong>${hint ? `<span>${hint}</span>` : ""}</div>`;

function fields(scope) {
  const f = filter[scope];
  const isManage = scope === "manage";
  const items = scope === "base" ? "" : field("source", "授权方小程序", f.source, sourceOptions);
  const title = field("name", "小说名称", f.name);
  const id = field("id", "小说 ID", f.id);
  const bookId = field("bookId", "微信作品 ID", f.bookId);
  const actions = `<div class="filter-actions"><button class="primary" type="submit">查询</button>${btn("重置", "reset")}</div>`;
  if (isManage) {
    return items + field("target", "被授权小程序 AppID", f.target) + title + bookId
      + field("status", "授权状态", f.status, values(["有效", "已到期"])) + actions;
  }
  return id + title + bookId
    + field("review", "作品审核状态", f.review, values(["未提审", "审核中", "审核通过", "审核不通过"]))
    + field("upload", "上传状态", f.upload, values(["待上传", "上传中", "上传成功", "上传失败"]))
    + field("shelf", "上架状态", f.shelf, values(["上架", "下架"]))
    + field("period", "最近送审时间", f.period, null, "YYYY-MM-DD")
    + field("editor", "责编", f.editor, values([...new Set(books.map((b) => b.editor))]))
    + field("department", "部门", f.department, values([...new Set(books.map((b) => b.department))]))
    + actions;
}

function commonMatch(book, f) {
  return (!f.source || book.source.id === f.source)
    && (!f.id || book.id === f.id)
    && (!f.name || book.name.includes(f.name))
    && (!f.bookId || book.bookId === f.bookId);
}

function renderBase() {
  $("#baseFilters").innerHTML = fields("base");
  const f = filter.base;
  const upload = (book) => book.bookId ? "上传成功" : "上传失败";
  const shelf = (book) => book.bookId ? book.removed ? "下架" : "上架" : "—";
  const submitted = (book) => book.bookId ? "2026-11-09 16:30:00" : "—";
  const list = books.filter((book) => commonMatch(book, f)
    && (!f.review || f.review === book.review) && (!f.upload || f.upload === upload(book))
    && (!f.shelf || f.shelf === shelf(book)) && (!f.period || submitted(book).includes(f.period))
    && (!f.editor || f.editor === book.editor) && (!f.department || f.department === book.department));
  visibleBooks = list.filter(eligible);
  const labels = ["ID", "小说 ID", "小说名称", "微信作品 ID", "作品审核状态", "章节审核状态", "上传状态", "上架状态", "失败原因", "责编", "部门", "最近送审时间", "操作"];
  $("#baseHead").innerHTML = '<tr><th class="selection-col"><input id="selectVisible" type="checkbox" aria-label="选择当前列表中可授权的小说"> '
    + marker(2) + '</th>' + labels.map((label) => `<th>${label}</th>`).join("") + "</tr>";
  $("#baseRows").innerHTML = list.map((book) => `<tr>
    <td><input type="checkbox" data-select-book="${book.key}" aria-label="选择 ${book.name} ${book.source.name}"${eligible(book)
      ? "" : ' disabled title="仅审核通过且未下架的微信作品可授权"'}></td>
    <td>${book.key}</td><td>${book.id}</td><td>${book.name}</td><td>${book.bookId || "—"}</td>
    <td>${status(book.review, { 审核通过: "good", 审核中: "wait", 审核不通过: "bad", 未提审: "inactive" }[book.review])}</td>
    <td>${book.review === "未提审" ? "全部未提审" : book.review === "审核中" ? "存在审核中" : "全部审核通过"}</td>
    <td>${upload(book)}</td><td>${shelf(book)}</td><td>${book.bookId ? "—" : "封面上传失败"}</td>
    <td>${book.editor}</td><td>${book.department}</td><td>${submitted(book)}</td><td class="muted">修改小说信息</td></tr>`).join("")
    || '<tr><td colspan="14">暂无符合条件的小说</td></tr>';
  $("#baseCount").textContent = `共 ${list.length} 条`;
  syncSelection();
}

function syncSelection() {
  const visibleCount = visibleBooks.filter(({ key }) => listSelection.has(key)).length;
  const outsideCount = listSelection.size - visibleCount;
  const selectAll = $("#selectVisible");
  selectAll.disabled = visibleBooks.length === 0;
  selectAll.checked = visibleCount > 0 && visibleCount === visibleBooks.length;
  selectAll.indeterminate = visibleCount > 0 && !selectAll.checked;
  document.querySelectorAll("[data-select-book]").forEach((checkbox) => {
    checkbox.checked = listSelection.has(checkbox.dataset.selectBook);
  });
  $("#openGrant").disabled = listSelection.size === 0;
  $("#clearSelection").hidden = listSelection.size === 0;
  $("#selectionSummary").textContent = listSelection.size
    ? `已选 ${listSelection.size} 本${outsideCount ? `（${outsideCount} 本在当前筛选结果外）` : ""}`
    : "勾选审核通过且未下架的小说";
}

function show(viewName, focus = true) {
  const changed = view !== viewName;
  view = viewName;
  if (changed && view !== "manage") {
    clearTimeout(timer);
    $("#toast").hidden = true;
  }
  $("#overlay").hidden = view === "base";
  $("#shell").inert = view !== "base";
  if (changed || view === "base") renderNotes(view);
  if (view === "base") {
    if (focus) $("#openManage").focus({ preventScroll: true });
    return;
  }
  const dialog = $("#dialog");
  const scrollTop = $("#dialogBody").scrollTop;
  dialog.dataset.view = view;
  if (view === "manage") renderManage();
  if (view === "settings") renderSettings();
  if (view === "revoke") renderRevoke();
  $("#dialogBody").scrollTop = changed ? 0 : scrollTop;
  if (focus) (view === "settings" ? $('#grantForm input[name="target"]') : $("#dialogTitle")).focus({ preventScroll: true });
}

function dialog(title, body, footer) {
  $("#dialogTitle").textContent = title;
  $("#dialogTitle").tabIndex = -1;
  $("#dialogBody").innerHTML = body;
  $("#dialogFooter").innerHTML = footer;
}

function pageRows(list, scope) {
  page[scope] = Math.min(page[scope], Math.max(1, Math.ceil(list.length / pageSize)));
  return list.slice((page[scope] - 1) * pageSize, page[scope] * pageSize);
}

function pager(list, scope) {
  const current = page[scope];
  const pages = Math.max(1, Math.ceil(list.length / pageSize));
  return `<div class="table-footer"><div class="toolbar"><span>共 ${list.length} 条</span>
    <button type="button" data-action="previous-page"${current <= 1 ? " disabled" : ""}>上一页</button>
    <span>${current} / ${pages}</span>
    <button type="button" data-action="next-page"${current >= pages ? " disabled" : ""}>下一页</button>
  </div></div>`;
}

function showNotice() {
  if (!notice.length && !pending.length) return "";
  const successes = notice.filter(({ type }) => type === "success").length;
  const failures = notice.filter(({ type }) => type === "failed");
  const skipped = notice.filter(({ type }) => type === "skipped");
  const retry = failures.some(({ retryable }) => retryable);
  const totals = [`成功 ${successes}`, `失败 ${failures.length}`, `待核实 ${pending.length}`];
  if (skipped.length) totals.push(`已跳过 ${skipped.length}`);
  const details = [...failures, ...skipped, ...pending.map(({ record, action }) => ({
    record, message: action === "grant" ? "授权结果待核实" : "取消结果待核实",
  }))];
  return `<div class="callout ${details.length ? "warn" : ""}" role="status"><strong>${totals.join(" · ")}</strong>
    ${details.length ? `<ul class="result-items">${details.map(({ record, message }) => {
      const b = bookByKey(record.key);
      return `<li>${b.name} · ${b.bookId} · ${b.source.name}：${escape(message)}</li>`;
    }).join("")}</ul>` : ""}
    <div class="result-actions">${retry ? btn("重试失败项", "retry", "link") : ""}${pending.length ? btn("核实结果", "verify", "link") : ""}</div>
  </div>`;
}

function renderManage() {
  const f = filter.manage;
  const list = records.filter((item) => commonMatch(bookByKey(item.key), f)
    && (!f.target || item.target === f.target)
    && (!f.status || (active(item) ? "有效" : "已到期") === f.status));
  const visible = pageRows(list, "manage");
  const error = modes() === "query-error";
  const results = error
    ? `<div class="callout error" role="alert">授权列表读取失败，请重试。${btn("重试读取", "refresh", "link")}</div>`
    : `<div class="table-wrap data">
      <table class="manage-table"><thead><tr><th>小说 ID</th><th class="title-col">小说名称</th><th>微信作品 ID</th><th>授权方小程序</th>
        <th>被授权小程序 AppID</th><th class="date-col">到期时间</th><th>授权状态</th><th>操作 ${marker(4)}</th></tr></thead>
        <tbody>${visible.map((r) => {
          const book = bookByKey(r.key);
          const id = relationKey(r);
          const waiting = pending.some((item) => relationKey(item.record) === id);
          const action = waiting ? "待核实" : active(r) ? `<button type="button" class="link" data-revoke="${escape(id)}">取消授权</button>` : "—";
          return `<tr><td>${book.id}</td><td>${book.name}</td><td>${book.bookId}</td><td>${sourceCell(book.source)}</td>
            <td><span class="appid">${escape(r.target)}</span></td><td>${chinaTime(r.expires)}</td><td>${status(active(r) ? "有效" : "已到期", active(r) ? "good" : "inactive")}</td><td>${action}</td></tr>`;
        }).join("")}</tbody></table>
      ${visible.length ? "" : empty("暂无符合条件的授权", "可以调整筛选条件，或回送审库勾选小说发起授权。")}
      </div>${pager(list, "manage")}`;
  dialog("授权管理 · 单本授权",
    `<section class="region">${heading("筛选项", 1)}<form class="filters" id="manageFilters">${fields("manage")}</form></section>
     <div class="toolbar manage-toolbar"><div>${marker(3)} 授权列表</div><div>${marker(2)} 结果与重试</div></div>
     ${showNotice()}${results}`, btn("关闭", "close"));
}

function renderSettings() {
  dialog("小说媒资授权",
    `<form id="grantForm" novalidate>
      ${heading("配置项", 1)}
      <div class="settings-grid">
        <label class="field"><span><span class="required">*</span> 被授权小程序 AppID</span>
          <input name="target" value="${escape(draft.target)}" placeholder="请输入合作方提供的微信小程序 AppID" autocomplete="off" spellcheck="false" required>
        </label>
        <label class="field"><span><span class="required">*</span> 到期时间（北京时间）</span>
          <input type="datetime-local" name="date" value="${escape(draft.date)}" step="1" max="2038-01-19T11:14:06" required>
        </label>
        <div><p class="region-head">已选小说（${selected.length} 本）</p><ul class="selected-preview">
          ${selected.map((key) => {
            const book = bookByKey(key);
            return `<li>${book.name} · ${book.bookId} · ${book.source.name}</li>`;
          }).join("")}
        </ul></div>
      </div>
      <p class="form-error" id="grantError" role="alert" hidden></p>
    </form>`, `<span class="footer-copy">${marker(2)} 授权操作</span>${btn("取消", "close")}
      <button type="submit" class="primary" form="grantForm">确认授权</button>`);
}

function renderRevoke() {
  const book = bookByKey(revoke.key);
  const covered = book.source.id === sources[0].id && revoke.target === demoTarget;
  const message = modes() === "coverage-error" ? "账号授权状态暂未核实。"
    : covered ? "取消单本授权后，对方仍可通过账号授权使用该作品。" : "";
  dialog("取消单本授权", `${heading("关系确认", 1)}
    <p>确认解除以下单本授权关系？</p>
    <dl class="revoke-details"><dt>小说名称</dt><dd>${book.name}</dd><dt>微信作品 ID</dt><dd>${book.bookId}</dd>
      <dt>授权方小程序</dt><dd>${sourceCell(book.source)}</dd><dt>被授权小程序 AppID</dt><dd>${escape(revoke.target)}</dd></dl>
    ${message ? `<p class="callout warn">${message}</p>` : ""}
    <p id="revokeError" class="form-error" role="alert" hidden></p>`,
    `<span class="footer-copy">${marker(2)} 取消授权操作</span>${btn("返回", "back-manage")}${btn("确认取消授权", "submit-revoke", "danger")}`);
}

function toast(message) {
  clearTimeout(timer);
  const item = $("#toast");
  item.textContent = message;
  item.hidden = false;
  timer = setTimeout(() => { item.hidden = true; }, 3500);
}

function errorText(id, message) {
  const item = $("#" + id);
  item.textContent = message;
  item.hidden = !message;
}

function storeDraft() {
  draft = Object.fromEntries(new FormData($("#grantForm")));
}

function applyGrant(record) {
  const id = relationKey(record);
  records = [record, ...records.filter((item) => relationKey(item) !== id)];
}

function submitGrant() {
  storeDraft();
  const target = draft.target.trim();
  const expires = Date.parse(draft.date + "+08:00");
  if (!/^wx[a-f\d]{16}$/i.test(target)) {
    return errorText("grantError", "请输入有效的小程序 AppID，例如 wx1122334455667788。");
  }
  if (!Number.isFinite(expires) || expires <= Date.now() || expires > maxDate) {
    return errorText("grantError", "到期时间须晚于当前时间，最晚为北京时间 2038-01-19 11:14:06。");
  }

  const mode = modes();
  notice = [];
  let submitted = 0;
  for (const key of selected) {
    const book = bookByKey(key);
    const record = relation(book, target, expires);
    const id = relationKey(record);
    const previous = records.find((item) => relationKey(item) === id && active(item));
    if (pending.some((item) => relationKey(item.record) === id)) {
      notice.push({ record, type: "skipped", message: "已有待核实操作，请先核实结果。" });
      listSelection.delete(key);
    } else if (previous) {
      notice.push({ record, type: "skipped", message: "已有有效授权，到期时间 " + chinaTime(previous.expires) + "。" });
      listSelection.delete(key);
    } else if (!eligible(book) || target.toLowerCase() === book.source.id) {
      notice.push({ record, type: "failed", message: !eligible(book) ? "作品当前不可授权。" : "授权方和被授权方 AppID 不能相同。" });
    } else {
      submitted += 1;
      if (mode === "timeout") {
        pending.push({ record, action: "grant" });
        listSelection.delete(key);
      } else if (mode === "failure" || (mode === "partial" && submitted % 2 === 0)) {
        notice.push({ record, type: "failed", message: "微信接口返回失败。", retryable: true });
      } else {
        applyGrant(record);
        notice.push({ record, type: "success" });
        listSelection.delete(key);
      }
    }
  }
  save();
  syncSelection();
  if (notice.some(({ type }) => type === "success")) {
    filter.manage = { status: "有效" };
    page.manage = 1;
  }
  show("manage");
  if (notice.length && notice.every(({ type }) => type === "success") && !pending.length) toast("单本授权成功");
}

function removeRelation(record) {
  records = records.filter((item) => relationKey(item) !== relationKey(record));
}

function submitRevoke() {
  if (["failure", "partial"].includes(modes())) {
    return errorText("revokeError", "取消失败，原授权仍保留。请重试。");
  }
  if (modes() === "timeout") {
    pending.push({ record: revoke, action: "revoke" });
    notice = [];
  } else {
    removeRelation(revoke);
    notice = [{ type: "success", record: revoke }];
  }
  save();
  show("manage");
  if (modes() !== "timeout") toast("已取消单本授权");
}

function verify() {
  if (["timeout", "failure", "query-error"].includes(modes())) {
    return toast("暂未核实结果，请稍后重试。");
  }
  notice = pending.map(({ record, action }) => {
    if (action === "grant") applyGrant(record);
    else removeRelation(record);
    return { type: "success", record };
  });
  pending = [];
  save();
  show("manage");
  toast("微信授权结果已核实");
}

function newGrant(retry = false) {
  const items = retry ? notice.filter(({ retryable }) => retryable) : [];
  selected = retry ? items.map(({ record }) => record.key) : [...listSelection];
  if (!selected.length) return;
  grantReturn = retry ? "manage" : "base";
  draft = items.length ? {
    target: items[0].record.target,
    date: chinaTime(items[0].record.expires).replace(" ", "T"),
  } : {};
  show("settings");
}

function close() {
  const from = view;
  show(from === "settings" ? grantReturn : from === "manage" ? "base" : "manage");
  if (from === "settings" && grantReturn === "base") $("#openGrant").focus({ preventScroll: true });
}

const actions = {
  retry: () => newGrant(true),
  verify,
  refresh: () => show("manage"),
  close,
  "back-manage": () => show("manage"),
  clear: () => { listSelection.clear(); syncSelection(); },
  reset: () => {
    filter[view] = view === "manage" ? { status: "有效" } : {};
    page[view] = 1;
    if (view === "base") renderBase();
    else show(view, false);
  },
  "previous-page": () => { page[view] -= 1; show(view, false); },
  "next-page": () => { page[view] += 1; show(view, false); },
  "submit-revoke": submitRevoke,
};

document.addEventListener("click", (event) => {
  const note = event.target.closest("[data-note]");
  if (note) return locateNote(note.dataset.note);
  const action = event.target.closest("[data-action]");
  if (action) return actions[action.dataset.action]();
  const button = event.target.closest("[data-revoke]");
  if (button) {
    revoke = records.find((item) => relationKey(item) === button.dataset.revoke);
    if (revoke) show("revoke");
  }
});

document.addEventListener("submit", (event) => {
  event.preventDefault();
  const formId = event.target.getAttribute("id");
  if (formId === "grantForm") return submitGrant();
  if (formId === view + "Filters") {
    filter[view] = Object.fromEntries([...new FormData(event.target)].map(([key, value]) => [key, value.trim()]));
    page[view] = 1;
    if (view === "base") renderBase();
    else show(view, false);
  }
});

document.addEventListener("change", (event) => {
  const control = event.target;
  if (control.id === "mode" && ["manage", "revoke"].includes(view)) show(view, false);
  if (view !== "base") return;
  const toggle = (key) => control.checked ? listSelection.add(key) : listSelection.delete(key);
  if (control.id === "selectVisible") visibleBooks.forEach(({ key }) => toggle(key));
  else if (control.dataset.selectBook && !control.disabled) toggle(control.dataset.selectBook);
  else return;
  syncSelection();
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && view !== "base") close();
});
$("#openManage").addEventListener("click", () => show("manage"));
$("#openGrant").addEventListener("click", () => newGrant());
renderBase();
renderNotes("base");
