"use strict";
const $ = (selector) => document.querySelector(selector);
const esc = (value) => String(value ?? "").replace(/[&<>"']/g, (s) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[s]));
const sources = [{ id: "wxaaaabbbbccccdddd", name: "容量剧场" }, { id: "wxeeeeffff00001111", name: "来看短剧" }];
const sourceA = sources[0].id, sourceB = sources[1].id;
const pools = [
  { id: 32, name: "微信外部分销合集池", type: "微信", collections: ["43429", "43321", "43392", "43346", "43298"] },
  { id: 28, name: "AI漫剧合作分销池", type: "微信", collections: ["43429", "43066", "43187"] },
  { id: 13, name: "测试合集池", type: "未知", collections: [] },
];
// 示例送审库，选择弹窗仅返回当前池内审核通过的记录。
const submissions = [
  { id: "audit-1", collectionId: "43429", name: "那年那月的秘密第1季", dramaId: "100200", sourceId: sourceA, approved: true },
  { id: "audit-2", collectionId: "43321", name: "老公的工资，婆婆的算盘", dramaId: "100205", sourceId: sourceA, approved: true },
  { id: "audit-3", collectionId: "43392", name: "从此，我只做自己的光", dramaId: "100210", sourceId: sourceA, approved: true },
  { id: "audit-4", collectionId: "43346", name: "槐树下的1989，爸妈的青春", dramaId: "100215", sourceId: sourceA, approved: true },
  { id: "audit-5", collectionId: "43298", name: "重回八零，我带全家奔小康", dramaId: "100218", sourceId: sourceA, approved: false },
  { id: "audit-6", collectionId: "43429", name: "那年那月的秘密第1季", dramaId: "200200", sourceId: sourceB, approved: true },
  { id: "audit-7", collectionId: "43392", name: "从此，我只做自己的光", dramaId: "200210", sourceId: sourceB, approved: true },
  { id: "audit-8", collectionId: "43066", name: "错位婚姻的真相", dramaId: "200220", sourceId: sourceB, approved: true },
  { id: "audit-9", collectionId: "43187", name: "她从风雨中归来", dramaId: "200225", sourceId: sourceB, approved: false },
];
const getSource = (id) => sources.find((s) => s.id === id);
const getSubmission = (id) => submissions.find((s) => s.id === id);
let records = [];
let activePool = null;
let selected = new Set();
let poolFilters = { id: "", name: "", type: "" };
let pickerFilters = { keyword: "", source: "" };
let dialogStack = [];
let busy = false;
let revokeRecord = null;
let legacyPool = null;
let legacyAction = "";
let toastTimer;
const poolNotices = new Map();
const operationLog = [];
function keyOf(s, target) { return `${s.sourceId}|${s.dramaId}|${target}`; }
function toast(message) { $("#toast").textContent = message; $("#toast").hidden = false; clearTimeout(toastTimer); toastTimer = setTimeout(() => $("#toast").hidden = true, 2700); }
function poolCandidates() { return submissions.filter((s) => activePool.collections.includes(s.collectionId) && s.approved); }
function candidateRows() { return poolCandidates().filter((s) => (!pickerFilters.keyword || s.name.includes(pickerFilters.keyword) || s.collectionId === pickerFilters.keyword || s.dramaId === pickerFilters.keyword) && (!pickerFilters.source || s.sourceId === pickerFilters.source)); }
function activeRecords() { return records.filter((r) => r.poolId === activePool.id && r.permission === "active"); }
function positionDialogs() {
  const stage = $(".prototype-stage").getBoundingClientRect();
  const backdrop = $("#stageBackdrop");
  Object.assign(backdrop.style, { left: `${stage.left}px`, top: `${stage.top}px`, width: `${stage.width}px`, height: `${stage.height}px` });
  const widths = { manageDialog: 1040, pickDialog: 1000, appidDialog: 640, revokeDialog: 590, legacyDialog: 570 };
  dialogStack.forEach((id, index) => {
    const dialog = $("#" + id), width = Math.min(widths[id], stage.width - 32);
    dialog.style.width = `${width}px`;
    dialog.style.left = `${stage.left + (stage.width - width) / 2}px`;
    dialog.style.zIndex = 45 + index * 5;
    dialog.style.maxHeight = `${stage.height - 36}px`;
    dialog.style.top = `${stage.top + Math.max(18, (stage.height - dialog.offsetHeight) / 2)}px`;
  });
}
function updateDialogState() {
  const top = dialogStack.at(-1);
  $("#stageBackdrop").hidden = !top;
  $("#appShell").inert = Boolean(top);
  document.querySelectorAll("dialog").forEach((dialog) => dialog.inert = dialog.id !== top);
  updatePrd(top || "pool"); positionDialogs();
}
function openDialog(id) {
  if (!dialogStack.includes(id)) { dialogStack.push(id); $("#" + id).show(); }
  updateDialogState();
  requestAnimationFrame(() => { positionDialogs(); const target = $("#" + id).querySelector("input:not([type=checkbox]), button"); target?.focus({ preventScroll: true }); });
}
function closeDialog(id, force = false) {
  if (busy && !force) return;
  const index = dialogStack.indexOf(id); if (index === -1) return;
  const closing = dialogStack.splice(index);
  closing.forEach((name) => $("#" + name).close());
  updateDialogState();
  const focusTarget = dialogStack.at(-1) === "manageDialog" ? $("#authorizeButton") : dialogStack.at(-1) === "pickDialog" ? $("#nextStep") : $("[data-more]");
  focusTarget?.focus({ preventScroll: true });
}
function renderPools() {
  const list = pools.filter((p) => (!poolFilters.id || String(p.id) === poolFilters.id) && (!poolFilters.name || p.name.includes(poolFilters.name)) && (!poolFilters.type || p.type === poolFilters.type));
  $("#poolRows").innerHTML = list.map((p) => `<tr><td>${p.id}</td><td>${esc(p.name)}</td><td>${p.collections.length}</td><td><span class="status-dot">启用</span></td><td>${esc(p.type)}</td><td><div class="row-actions"><button class="link-button" data-legacy="rename" data-pool="${p.id}">修改名称</button><button class="link-button" data-legacy="elements" data-pool="${p.id}">修改池元素</button><button class="link-button" data-legacy="auto" data-pool="${p.id}">自动添加元素</button><button class="link-button" data-more="${p.id}" aria-expanded="false"><span class="annotation">1</span>更多⌄</button></div></td></tr>`).join("");
  $("#poolCount").textContent = `共 ${list.length} 条`;
  $("#poolEmpty").hidden = list.length > 0;
}
function closeMoreMenu() { $(".more-menu")?.remove(); document.querySelectorAll("[data-more]").forEach((button) => button.setAttribute("aria-expanded", "false")); }
function openMoreMenu(button) {
  const same = $(".more-menu")?.dataset.pool === button.dataset.more;
  closeMoreMenu(); if (same) return;
  const rect = button.getBoundingClientRect(), stage = $(".prototype-stage").getBoundingClientRect();
  const menu = document.createElement("div"); menu.className = "more-menu"; menu.dataset.pool = button.dataset.more; menu.setAttribute("role", "menu");
  menu.innerHTML = `<button role="menuitem" class="new-action" data-open-authorization="${button.dataset.more}"><span class="annotation">1</span>小程序剧目授权</button>`;
  menu.style.left = `${Math.max(stage.left + 10, Math.min(rect.right - 200, stage.right - 210))}px`;
  menu.style.top = `${rect.bottom + 6}px`;
  document.body.append(menu); button.setAttribute("aria-expanded", "true"); menu.querySelector("button").focus();
}
function renderNotice() {
  const saved = poolNotices.get(activePool.id);
  const pending = records.filter((r) => r.poolId === activePool.id && r.pendingAction);
  const unresolved = pending.map((r) => ({ key: r.key, submission: getSubmission(r.submissionId), outcome: "unknown", message: r.pendingAction === "grant" ? "授权结果待核实" : "取消结果待核实" }));
  const notice = saved ? { ...saved, results: saved.results.filter((r) => r.outcome !== "unknown" || pending.some((p) => p.key === r.key)) } : unresolved.length ? { action: "grant", results: [] } : null;
  if (notice) unresolved.forEach((r) => { if (!notice.results.some((item) => item.key === r.key)) notice.results.push(r); });
  $("#operationNotice").hidden = !notice;
  if (!notice) return;
  const success = notice.results.filter((r) => r.outcome === "success"), failed = notice.results.filter((r) => r.outcome === "failed"), unknown = notice.results.filter((r) => r.outcome === "unknown");
  $("#operationNotice").className = "operation-notice" + (unknown.length || (success.length && failed.length) ? " warning" : failed.length ? " error" : "");
  $("#noticeTitle").textContent = unknown.length ? "请求超时，授权结果待核实" : failed.length && success.length ? "部分操作成功" : failed.length ? "操作失败" : notice.action === "grant" ? "剧目授权成功" : notice.action === "verify" ? "授权状态已核实" : "取消授权成功";
  $("#noticeSummary").textContent = `共 ${notice.results.length} 条记录：成功 ${success.length}，失败 ${failed.length}${unknown.length ? `，待核实 ${unknown.length}` : ""}。${failed.length && notice.action === "revoke" ? "取消失败，原授权仍保留。" : failed.length ? "失败项未加入授权列表，可单独重试。" : ""}`;
  $("#noticeDetails").innerHTML = [...failed, ...unknown].map((r) => `<div class="notice-detail"><span>${esc(r.submission.name)}（剧目ID：${r.submission.dramaId}，${esc(getSource(r.submission.sourceId).name)}）</span><span>${esc(r.message)}</span></div>`).join("");
  $("#verifyNotice").hidden = unknown.length === 0;
  $("#retryFailures").hidden = notice.action !== "grant" || failed.length === 0;
  $("#dismissNotice").hidden = unknown.length > 0;
}
function renderAuthorizations() {
  const list = activeRecords();
  $("#authorizationRows").innerHTML = list.map((r) => {
    const source = getSource(r.sourceId);
    return `<tr><td class="mono">${r.collectionId}</td><td class="mono">${r.dramaId}</td><td><span class="cell-main">${esc(source.name)}</span><span class="cell-sub mono">${esc(r.sourceId)}</span></td><td class="mono">${esc(r.targetId)}</td><td>${r.pendingAction ? `<span class="cell-sub record-pending">取消结果待核实</span><button class="link-button" data-verify="${esc(r.key)}">核实结果</button>` : `<button class="link-button red" data-revoke="${esc(r.key)}"><span class="annotation">10</span>取消授权</button>`}${r.lastError ? `<span class="cell-sub record-error" title="${esc(r.lastError)}">${esc(r.lastError)}</span>` : ""}</td></tr>`;
  }).join("");
  $("#authorizationEmpty").hidden = list.length > 0;
  $("#authorizationCount").textContent = `共 ${list.length} 条授权关系`;
  renderNotice(); positionDialogs();
}
function openManagement(poolId) {
  activePool = pools.find((p) => p.id === poolId); closeMoreMenu();
  $("#currentPoolText").textContent = `${activePool.name}（池ID：${activePool.id}）`;
  renderAuthorizations(); openDialog("manageDialog");
}
function renderPicker() {
  const list = candidateRows();
  $("#pickerRows").innerHTML = list.map((s) => `<tr class="${selected.has(s.id) ? "selected" : ""}"><td><input type="checkbox" data-pick="${s.id}" aria-label="选择${esc(s.name)} · ${esc(getSource(s.sourceId).name)}" ${selected.has(s.id) ? "checked" : ""} /></td><td class="mono">${s.collectionId}</td><td><span class="cell-main" title="${esc(s.name)}">${esc(s.name)}</span></td><td class="mono">${s.dramaId}</td><td><span class="cell-main">${esc(getSource(s.sourceId).name)}</span><span class="cell-sub mono">${esc(s.sourceId)}</span></td><td><span class="approval-tag">审核通过</span></td></tr>`).join("");
  $("#selectedCount").textContent = selected.size;
  $("#pickerEmpty").hidden = list.length > 0;
  $("#pickerSelectAll").checked = list.length > 0 && list.every((s) => selected.has(s.id));
  $("#pickerSelectAll").indeterminate = list.some((s) => selected.has(s.id)) && !$("#pickerSelectAll").checked;
  $("#pickerSelectAll").disabled = list.length === 0;
  positionDialogs();
}
function startGrant(retry = false) {
  selected.clear();
  $("#targetAppid").value = "";
  if (retry) { const notice = poolNotices.get(activePool.id); notice.results.filter((r) => r.outcome === "failed").forEach((r) => selected.add(r.submission.id)); $("#targetAppid").value = notice.targetId; }
  pickerFilters = { keyword: "", source: "" };
  $("#pickerKeyword").value = ""; $("#pickerSource").value = "";
  $("#pickerError").hidden = true; $("#appidError").hidden = true;
  $("#scopeText").textContent = `当前合集池：${activePool.name}；池内无过审记录的合集不展示。`;
  renderPicker(); openDialog("pickDialog");
}
function nextStep() {
  if (!selected.size) { $("#pickerError").textContent = "请至少选择一条审核通过的剧目记录。"; $("#pickerError").hidden = false; positionDialogs(); return; }
  $("#pickerError").hidden = true;
  $("#finalSelectedCount").textContent = selected.size;
  $("#selectedPreview").innerHTML = [...selected].map(getSubmission).map((s) => `<div><span>${esc(s.name)} <span class="mono">${s.dramaId}</span></span><span>${esc(getSource(s.sourceId).name)}</span></div>`).join("");
  $("#appidError").hidden = true; openDialog("appidDialog");
  $("#targetAppid").focus({ preventScroll: true });
}
function formError(message) { $("#appidError").textContent = message; $("#appidError").hidden = false; positionDialogs(); }
function setBusy(value, label) {
  busy = value;
  document.querySelectorAll("dialog[open] button, dialog[open] input, dialog[open] select").forEach((control) => control.disabled = value);
  $("#submitGrant").innerHTML = value ? label || "授权中…" : `<span class="annotation">8</span>确认授权`;
  $("#submitRevoke").textContent = value ? label || "取消中…" : "确认取消授权";
}
async function submitGrant() {
  if (busy) return;
  const targetId = $("#targetAppid").value.trim();
  if (!targetId) return formError("请输入授权小程序AppID，不能为空。");
  if (!/^wx[a-zA-Z0-9]{16}$/.test(targetId)) return formError("AppID格式不正确，请输入wx开头、共18位的小程序AppID。");
  const chosen = [...selected].map(getSubmission);
  if (!chosen.length || chosen.some((s) => !poolCandidates().some((c) => c.id === s.id))) return formError("所选记录已不满足过审或当前池条件，请返回重新选择。");
  if (chosen.some((s) => s.sourceId === targetId)) return formError("授权小程序不能与所选剧目的送审小程序相同。");
  const duplicate = chosen.filter((s) => records.some((r) => r.key === keyOf(s, targetId) && (r.permission === "active" || r.pendingAction)));
  if (duplicate.length) return formError(`有 ${duplicate.length} 条关系已授权或结果待核实（剧目ID：${duplicate.map((s) => s.dramaId).join("、")}），请返回移除这些记录后提交。`);
  const request = { poolId: activePool.id, targetId, chosen, mode: $("#demoMode").value };
  $("#appidError").hidden = true; setBusy(true, "授权中…");
  // 真实接入应按送审小程序分组，各自使用对应小程序凭证；此处仅模拟结果。
  await new Promise((resolve) => setTimeout(resolve, 650));
  const groups = [...new Set(chosen.map((s) => s.sourceId))];
  const results = chosen.map((s, index) => {
    const outcome = request.mode === "timeout" ? "unknown" : request.mode === "failure" || (request.mode === "partial" && index === chosen.length - 1) ? "failed" : "success";
    const message = outcome === "failed" ? request.mode === "failure" ? "请求失败，系统错误（-1）" : "获取剧目失败（10093030）" : outcome === "unknown" ? "请求超时，结果未知" : "授权成功";
    const key = keyOf(s, targetId);
    if (outcome !== "failed") {
      let record = records.find((r) => r.key === key);
      if (!record) { record = { key, poolId: request.poolId, submissionId: s.id, collectionId: s.collectionId, dramaId: s.dramaId, sourceId: s.sourceId, targetId, permission: "none", pendingAction: null, lastError: "" }; records.push(record); }
      record.poolId = request.poolId; record.permission = outcome === "success" ? "active" : "none"; record.pendingAction = outcome === "unknown" ? "grant" : null; record.lastError = "";
    }
    operationLog.push({ action: "grant", sourceId: s.sourceId, dramaId: s.dramaId, targetId, outcome, message, operator: "洪娟", timestamp: Date.now() });
    return { key, submission: s, outcome, message };
  });
  setBusy(false);
  if (request.mode === "failure") return formError("微信请求失败，系统错误（-1）。未新增授权关系，请稍后重试；所选剧目和AppID已保留。");
  poolNotices.set(request.poolId, { action: "grant", targetId, results, groupCount: groups.length });
  closeDialog("pickDialog"); renderAuthorizations();
  if (results.every((r) => r.outcome === "success")) toast(`已成功授权 ${results.length} 条剧目记录。`);
}
function openRevoke(key) {
  revokeRecord = records.find((r) => r.key === key);
  if (!revokeRecord || revokeRecord.pendingAction || revokeRecord.permission !== "active") return;
  $("#revokeSummary").innerHTML = `<dt>合集ID</dt><dd>${revokeRecord.collectionId}</dd><dt>剧目ID</dt><dd>${revokeRecord.dramaId}</dd><dt>送审小程序</dt><dd>${esc(getSource(revokeRecord.sourceId).name)}<br><span class="mono">${esc(revokeRecord.sourceId)}</span></dd><dt>授权小程序</dt><dd class="mono">${esc(revokeRecord.targetId)}</dd>`;
  $("#revokeError").hidden = true; openDialog("revokeDialog");
}
async function submitRevoke() {
  if (busy || !revokeRecord) return;
  const record = revokeRecord, mode = $("#demoMode").value;
  setBusy(true, "取消中…"); await new Promise((resolve) => setTimeout(resolve, 550));
  const outcome = mode === "timeout" ? "unknown" : ["failure", "partial"].includes(mode) ? "failed" : "success";
  const message = outcome === "failed" ? "取消失败，操作过于频繁（10093023）" : outcome === "unknown" ? "请求超时，取消结果待核实" : "取消成功";
  if (outcome === "success") record.permission = "revoked";
  record.pendingAction = outcome === "unknown" ? "revoke" : null;
  record.lastError = outcome === "failed" ? message : "";
  operationLog.push({ action: "revoke", sourceId: record.sourceId, dramaId: record.dramaId, targetId: record.targetId, outcome, message, operator: "洪娟", timestamp: Date.now() });
  poolNotices.set(activePool.id, { action: "revoke", results: [{ key: record.key, submission: getSubmission(record.submissionId), outcome, message }] });
  setBusy(false); closeDialog("revokeDialog"); renderAuthorizations();
  if (outcome === "success") toast("取消授权成功，已移除该条授权关系。");
}
async function verifyAuthorization(keys = null) {
  if (busy) return;
  const pending = records.filter((r) => r.poolId === activePool.id && r.pendingAction && (!keys || keys.includes(r.key)));
  if (!pending.length) return;
  setBusy(true, "查询中…");
  await new Promise((resolve) => setTimeout(resolve, 500));
  // 演示完整查询后确认原请求已成功；真实服务端必须完整分页并检查查询是否成功。
  const results = pending.map((r) => {
    const cancel = r.pendingAction === "revoke";
    r.permission = cancel ? "revoked" : "active"; r.pendingAction = null; r.lastError = "";
    const message = cancel ? "微信查询确认授权已解除" : "微信查询确认授权已生效";
    operationLog.push({ action: "verify", key: r.key, message, operator: "洪娟", timestamp: Date.now() });
    return { key: r.key, submission: getSubmission(r.submissionId), outcome: "success", message };
  });
  poolNotices.set(activePool.id, { action: "verify", results }); setBusy(false); renderAuthorizations(); toast("已核实微信授权状态。");
}
function openLegacy(action, poolId) {
  legacyPool = pools.find((p) => p.id === poolId); legacyAction = action;
  $("#legacyTitle").textContent = action === "rename" ? "修改名称" : action === "elements" ? "当前池元素" : "自动添加元素";
  $("#saveLegacy").hidden = action !== "rename";
  $("#legacyContent").innerHTML = action === "rename" ? `<label>池名称<input id="legacyName" maxlength="40" value="${esc(legacyPool.name)}" /></label>` : action === "elements" ? `<ul class="legacy-list">${legacyPool.collections.map((id) => `<li>${id} · ${esc(submissions.find((s) => s.collectionId === id)?.name || "合集")}</li>`).join("") || "暂无池元素"}</ul>` : `<p>此处沿用合集池原有的自动添加规则。本次新增操作位于「更多 → 小程序剧目授权」。</p>`;
  openDialog("legacyDialog");
}
function updatePrd(context = "pool") {
  const names = { pool: "① 合集池入口", manageDialog: "② 授权管理弹窗", pickDialog: "④ 选择过审剧目", appidDialog: "⑦ 填写授权AppID", revokeDialog: "⑩ 取消授权确认", legacyDialog: "合集池原有操作" };
  const currentNumbers = context === "pool" ? [1] : context === "manageDialog" ? [2, 3, 9, 10] : context === "pickDialog" ? [4, 5, 6] : context === "appidDialog" ? [7, 8] : context === "revokeDialog" ? [10] : [];
  const heading = (n, title) => `<h3 class="${currentNumbers.includes(n) ? "current" : ""}"><span class="annotation">${n}</span>${title}</h3>`;
  $("#prdPanel").innerHTML = `<div class="prd-heading"><span>PRD</span><div><strong>小程序剧目授权</strong><small>合集池管理 · V1.0 · 2026-10-13</small></div></div><div class="context-note">当前画面：${names[context] || names.pool}；编号与左侧对应。</div>
  <section><h2># 页面说明</h2><ul><li>本页是绿台「产品运营 ＞ 内容运营 ＞ 合集池管理」新增的授权操作。</li><li><b>背景：</b>容量与外部分销商合作，对方提供小程序AppID，我方提供已过审的微信剧目ID并授权播放。</li><li><b>需求：</b>在合集池内完成选剧、填写AppID、查看授权关系及取消授权。</li></ul></section>
  <section><h2># 原型说明</h2>${heading(1, "入口：更多 → 小程序剧目授权")}<ul><li>合集池行操作「更多」新增「小程序剧目授权」，点击打开当前池的授权管理弹窗。</li><li>其他行操作沿用现有布局；本次新增不改变池类型。</li></ul>
  ${heading(2, "授权管理弹窗")}<ul><li>标题「小程序剧目授权」，展示池名称和池ID。</li><li>首次无授权记录时为空；关闭、重新打开后读取已成功授权的记录。</li><li>关闭弹窗不取消已生效的授权。</li></ul>
  ${heading(3, "剧目授权按钮")}<ul><li>点击「剧目授权」，打开选择剧目弹窗，默认未勾选。</li><li>授权管理弹窗保留在后层，完成后返回此处。</li></ul>
  ${heading(4, "数据源与筛选")}<ul><li>数据源取「内容审核库 → 微信送审库」<b>审核通过</b>记录。剧目ID和送审小程序均直接取源记录，不手工填写。</li><li><b>补充约定：</b>默认只选择当前合集池内的合集；无过审记录的合集不展示。此范围为产品建议，待业务确认。</li><li>合集名称模糊匹配；合集ID、剧目ID精确匹配；可按送审小程序筛选。查询应用条件，重置恢复当前池全部过审记录。</li></ul>
  ${heading(5, "多选剧目")}<ul><li>支持单条、多条、当前筛选全选；筛选后保留已选项，可清空选择。</li><li>同一合集在不同送审小程序有不同过审记录，须分别展示、选择；不能只按合集ID去重。</li></ul>
  ${heading(6, "下一步")}<ul><li>至少选择1条记录；未选择时提示并停留。</li><li>下一步进入填写AppID；「上一步」返回时保留所选记录和已输入AppID。</li><li>取消或关闭新增流程，不创建授权关系。</li></ul>
  ${heading(7, "授权小程序AppID")}<ul><li><b>必填：</b>输入外部分销商提供的小程序AppID；清除首尾空格，校验基础格式。</li><li>一次向同一个AppID授权所选全部记录；不同外部AppID分别发起。</li><li><b>补充约定：</b>本期默认永久授权，接口有效期传0，暂不增加到期时间输入。</li></ul>
  ${heading(8, "确认授权与结果")}<ul><li>提交前再次核验过审状态、当前池范围和重复关系；同一「送审小程序＋剧目ID＋目标AppID」有效授权或结果待核实时，阻止重复提交。</li><li>跨送审小程序按账号拆分请求，使用各自对应凭证；微信接口接收的剧目ID不使用内部合集ID替代。</li><li>提交中禁用重复操作；按请求级和逐剧返回分别处理。全部成功或部分成功后关闭新增弹窗，返回管理列表；<b>仅成功项入列表</b>，失败项展示错误码、原因并可单独重试。</li><li>请求级明确失败时保留输入和选择，可重试。超时或缺失单项结果进入待核实，先查询微信实际关系，不能直接判失败或重复提交。</li></ul>
  ${heading(9, "授权列表")}<ul><li><b>合集ID：</b>源送审记录关联的内部合集ID。</li><li><b>剧目ID：</b>已成功授权的微信剧目ID。</li><li><b>送审小程序：</b>展示我方送审小程序名称和AppID，用于识别授权方。</li><li><b>授权小程序：</b>展示外部分销商填写的目标AppID；本期不依赖微信查询名称。</li><li><b>操作：</b>取消授权。一个剧目授权给多个目标时，分别展示多条关系。</li></ul>
  ${heading(10, "取消授权")}<ul><li>点击后展示二次确认，核对合集ID、剧目ID、送审小程序及目标AppID；「返回」不调用接口。</li><li>确认后由对应送审小程序调用解除接口，仅解除这一剧目与这一目标小程序的关系。</li><li><b>成功：</b>移除该行，并提示取消成功。</li><li><b>失败：</b>保留原授权行，展示原因，允许重试。</li><li><b>超时：</b>保留原行并标记待核实，核实前禁用重复取消；完整查询确认解除后再移除。</li></ul></section>
  <section><h2># 补充规则与接口依据</h2><ul><li>双方需具备「文娱-微短剧」类目，剧目须过审；AppID格式正确不代表微信权限校验已通过。</li><li>本次授予剧目播放权限，不等同于版权转让。取消授权不删除送审库数据，也不删除池元素。</li><li>服务端记录授权关系与操作日志：双方AppID、剧目ID、操作人、时间、逐剧结果。关闭页面后数据仍应保存。</li><li>接口由服务端调用；凭证不交给浏览器。新增、解除、查询以微信结果为准，查询需完整分页，查询失败不能当作无授权。</li><li><a href="https://developers.weixin.qq.com/miniprogram/dev/server/API/minidrama/authorizedrama/api_authorizedrama.html" target="_blank" rel="noopener">增加剧目授权</a> · <a href="https://developers.weixin.qq.com/miniprogram/dev/server/API/minidrama/authorizedrama/api_deauthorizedrama.html" target="_blank" rel="noopener">解除剧目授权</a> · <a href="https://developers.weixin.qq.com/miniprogram/dev/server/API/minidrama/authorizedrama/api_getauthorizeobjects.html" target="_blank" rel="noopener">查询授权信息</a></li><li class="remark"><b>研发联调待核实：</b>新增授权文档的调用方式写GET、错误码要求POST；参数表写authorized、示例写authorized_appid。需微信确认或联调后统一，不能直接照冲突内容上线。</li></ul></section><div class="prd-note">左侧编号与本说明对应，弹窗打开时右侧说明仍可阅读。此原型仅模拟授权、取消及核实结果；演示数据保留在当前页面内存中，刷新回到初始空列表。</div>`;
}

// 切换画面时把对应编号带入右侧首屏，完整说明仍可上下滚动。
const renderPrd = updatePrd;
updatePrd = function(context = "pool") {
  renderPrd(context);
  const panel = $("#prdPanel"), heading = panel.querySelector("h3.current");
  const sticky = document.createElement("div"); sticky.className = "prd-sticky";
  sticky.append(panel.querySelector(".prd-heading"), panel.querySelector(".context-note")); panel.prepend(sticky);
  panel.scrollTop = context === "pool" ? 0 : Math.max(0, (heading?.offsetTop || 0) - sticky.offsetHeight - 25);
};
$("#pickerSource").innerHTML += sources.map((s) => `<option value="${s.id}">${esc(s.name)}</option>`).join("");
$("#queryButton").addEventListener("click", () => { poolFilters = { id: $("#idFilter").value.trim(), name: $("#nameFilter").value.trim(), type: $("#typeFilter").value }; closeMoreMenu(); renderPools(); });
$("#resetButton").addEventListener("click", () => { $("#idFilter").value = ""; $("#nameFilter").value = ""; $("#typeFilter").value = ""; poolFilters = { id: "", name: "", type: "" }; closeMoreMenu(); renderPools(); });
$("#poolRows").addEventListener("click", (event) => { const button = event.target.closest("button"); if (!button) return; if (button.dataset.more) openMoreMenu(button); else if (button.dataset.legacy) openLegacy(button.dataset.legacy, Number(button.dataset.pool)); });
document.addEventListener("click", (event) => { const entry = event.target.closest("[data-open-authorization]"); if (entry) return openManagement(Number(entry.dataset.openAuthorization)); if (!event.target.closest(".more-menu, [data-more]")) closeMoreMenu(); });
$("#authorizeButton").addEventListener("click", () => startGrant());
$("#retryFailures").addEventListener("click", () => startGrant(true));
$("#pickerRows").addEventListener("change", (event) => { const id = event.target.dataset.pick; if (!id) return; event.target.checked ? selected.add(id) : selected.delete(id); renderPicker(); });
$("#pickerSelectAll").addEventListener("change", (event) => { candidateRows().forEach((s) => event.target.checked ? selected.add(s.id) : selected.delete(s.id)); renderPicker(); });
$("#pickerQuery").addEventListener("click", () => { pickerFilters = { keyword: $("#pickerKeyword").value.trim(), source: $("#pickerSource").value }; renderPicker(); });
$("#pickerReset").addEventListener("click", () => { $("#pickerKeyword").value = ""; $("#pickerSource").value = ""; pickerFilters = { keyword: "", source: "" }; renderPicker(); });
$("#clearSelection").addEventListener("click", () => { selected.clear(); renderPicker(); });
$("#nextStep").addEventListener("click", nextStep);
$("#previousStep").addEventListener("click", () => closeDialog("appidDialog"));
$("#submitGrant").addEventListener("click", submitGrant);
$("#submitRevoke").addEventListener("click", submitRevoke);
$("#authorizationRows").addEventListener("click", (event) => { const button = event.target.closest("button"); if (button?.dataset.revoke) openRevoke(button.dataset.revoke); else if (button?.dataset.verify) verifyAuthorization([button.dataset.verify]); });
$("#verifyNotice").addEventListener("click", () => verifyAuthorization());
$("#dismissNotice").addEventListener("click", () => { poolNotices.delete(activePool.id); renderNotice(); positionDialogs(); });
document.querySelectorAll("[data-close]").forEach((button) => button.addEventListener("click", () => closeDialog(button.dataset.close === "appidDialog" ? "pickDialog" : button.dataset.close)));
$("#saveLegacy").addEventListener("click", () => { if (legacyAction === "rename" && $("#legacyName").value.trim()) { legacyPool.name = $("#legacyName").value.trim(); closeDialog("legacyDialog"); renderPools(); toast("池名称已更新。"); } });
$("#toggleNav").addEventListener("click", () => { const hidden = $("#appShell").classList.toggle("nav-hidden"); $("#toggleNav").setAttribute("aria-label", hidden ? "展开导航" : "收起导航"); });
$("#showAnnotations").addEventListener("change", (event) => document.body.classList.toggle("annotations-off", !event.target.checked));
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") { if (busy) { event.preventDefault(); return; } const top = dialogStack.at(-1); if (top) { event.preventDefault(); closeDialog(top === "appidDialog" ? "pickDialog" : top); } else closeMoreMenu(); }
  if (event.key === "Tab" && dialogStack.length) { const dialog = $("#" + dialogStack.at(-1)); const controls = [...dialog.querySelectorAll("button:not(:disabled), input:not(:disabled), select:not(:disabled)")].filter((control) => control.getClientRects().length); if (!controls.length) return; const first = controls[0], last = controls.at(-1); if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); } else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); } }
});
window.addEventListener("resize", () => { closeMoreMenu(); positionDialogs(); });
$(".pool-table-wrap").addEventListener("scroll", closeMoreMenu);
renderPools(); updatePrd();
