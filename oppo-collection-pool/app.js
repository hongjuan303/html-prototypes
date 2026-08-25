const pools = [
  { id: 26, name: "OPPO精品短剧推送池", count: 86, status: "启用", type: "OPPO" },
  { id: 1, name: "推广合集池", count: 124, status: "启用", type: "抖音" },
  { id: 2, name: "H5-推广合计池", count: 58, status: "启用", type: "未知" },
  { id: 3, name: "公号CPS跑单合集池", count: 37, status: "启用", type: "未知" },
  { id: 5, name: "公号CPS低配", count: 19, status: "停用", type: "未知" },
  { id: 13, name: "测试合集池", count: 8, status: "启用", type: "未知" },
  { id: 14, name: "邹佳志", count: 21, status: "启用", type: "未知" }
];

const elements = [
  { id: 88421, name: "她从深渊归来", total: 80, validate: "可推送", push: "已推送", time: "2026-08-21 11:23" },
  { id: 88436, name: "闪婚后，傅先生马甲藏不住了", total: 72, validate: "可推送", push: "未推送", time: "-" },
  { id: 88452, name: "重生后我在豪门杀疯了", total: 68, validate: "校验失败", push: "未推送", time: "-", issues: ["导演字段为空", "第12集视频分辨率低于720p", "剧集ID包含特殊符号"] },
  { id: 88477, name: "离婚后，前夫追悔莫及", total: 64, validate: "可推送", push: "推送失败", time: "2026-08-21 11:25" },
  { id: 88503, name: "掌心玫瑰", total: 75, validate: "校验失败", push: "未推送", time: "-", issues: ["短剧ID长度超过16位", "封面比例不是3:4", "总集数75与有效剧集74不一致"] }
];

const poolRows = document.querySelector("#poolRows");
const typeMenu = document.querySelector("#typeMenu");
const typeSelectButton = document.querySelector("#typeSelectButton");
const typeSelectText = document.querySelector("#typeSelectText");
const idFilter = document.querySelector("#idFilter");
const nameFilter = document.querySelector("#nameFilter");
const statusFilter = document.querySelector("#statusFilter");
const totalText = document.querySelector("#totalText");
const emptyState = document.querySelector("#emptyState");
const toast = document.querySelector("#toast");
let selectedType = "";
let toastTimer = null;

function renderPools(data = pools) {
  poolRows.innerHTML = data.map((pool) => `<tr>
    <td><input type="checkbox" aria-label="选择${pool.name}" /></td><td>${pool.id}</td><td title="${pool.name}">${pool.name}</td><td>${pool.count}</td><td><span class="status-dot ${pool.status === "停用" ? "off" : ""}">${pool.status}</span></td><td><span class="pool-type ${pool.type === "OPPO" ? "oppo" : ""}">${pool.type}</span></td>
    <td><div class="row-actions"><button class="link-button feedback-button" data-message="已打开修改名称弹窗（原型示意）">修改名称</button><button class="link-button elements-button" data-id="${pool.id}">修改池元素</button>${pool.type === "OPPO" ? `<button class="link-button strong push-button" data-id="${pool.id}">OPPO推送</button><button class="link-button records-button">推送记录</button>` : `<button class="link-button feedback-button" data-message="已开始自动添加池元素（原型示意）">自动添加元素</button><span class="more-wrap"><button class="link-button more-button" data-id="${pool.id}">更多⌄</button><span class="more-menu" data-menu="${pool.id}" hidden><button class="feedback-button" data-message="已打开状态设置（原型示意）">修改状态</button><button class="feedback-button" data-message="删除操作需二次确认（原型示意）">删除合集池</button></span></span>`}</div></td>
  </tr>`).join("");
  emptyState.hidden = data.length > 0;
  totalText.textContent = `共 ${data.length} 条`;
  document.querySelectorAll(".elements-button").forEach((button) => button.addEventListener("click", () => openElements(Number(button.dataset.id))));
  document.querySelectorAll(".push-button").forEach((button) => button.addEventListener("click", openPush));
  document.querySelectorAll(".records-button").forEach((button) => button.addEventListener("click", openRecords));
  document.querySelectorAll(".feedback-button").forEach((button) => button.addEventListener("click", () => showToast(button.dataset.message)));
  document.querySelectorAll(".more-button").forEach((button) => button.addEventListener("click", () => {
    const menu = document.querySelector(`[data-menu="${button.dataset.id}"]`);
    document.querySelectorAll(".more-menu").forEach((item) => { if (item !== menu) item.hidden = true; });
    menu.hidden = !menu.hidden;
  }));
}

function applyFilters() {
  const data = pools.filter((pool) => (!idFilter.value || String(pool.id) === idFilter.value.trim()) && (!nameFilter.value || pool.name.includes(nameFilter.value.trim())) && (!selectedType || pool.type === selectedType) && (!statusFilter.value || pool.status === statusFilter.value));
  renderPools(data);
  showToast(`已查询到 ${data.length} 个合集池`);
}

function resetFilters() {
  idFilter.value = "";
  nameFilter.value = "";
  statusFilter.value = "";
  selectedType = "";
  typeSelectText.textContent = "全部";
  typeMenu.querySelectorAll("button").forEach((button) => button.classList.toggle("selected", !button.dataset.value));
  typeMenu.hidden = true;
  typeSelectButton.setAttribute("aria-expanded", "false");
  renderPools();
}

typeSelectButton.addEventListener("click", () => {
  typeMenu.hidden = !typeMenu.hidden;
  typeSelectButton.setAttribute("aria-expanded", String(!typeMenu.hidden));
  typeSelectButton.querySelector("i").textContent = typeMenu.hidden ? "⌄" : "⌃";
});
typeMenu.querySelectorAll("button").forEach((button) => button.addEventListener("click", () => {
  selectedType = button.dataset.value;
  typeSelectText.textContent = button.dataset.value || "全部";
  typeMenu.querySelectorAll("button").forEach((item) => item.classList.toggle("selected", item === button));
  typeMenu.hidden = true;
  typeSelectButton.setAttribute("aria-expanded", "false");
  typeSelectButton.querySelector("i").textContent = "⌄";
}));

function openModal(id) { document.querySelector(`#${id}`).hidden = false; }
function closeModal(id) { document.querySelector(`#${id}`).hidden = true; }
document.querySelectorAll("[data-close]").forEach((button) => button.addEventListener("click", () => closeModal(button.dataset.close)));

function showToast(message) {
  clearTimeout(toastTimer);
  toast.textContent = message;
  toast.hidden = false;
  toastTimer = setTimeout(() => { toast.hidden = true; }, 1800);
}

document.querySelector("#queryButton").addEventListener("click", applyFilters);
document.querySelector("#resetButton").addEventListener("click", resetFilters);
document.querySelector("#createPoolButton").addEventListener("click", () => {
  document.querySelector("#newPoolName").value = "";
  document.querySelector("#newPoolType").value = "";
  document.querySelector("#oppoTip").hidden = true;
  document.querySelector("#createError").hidden = true;
  openModal("createModal");
});
document.querySelector("#newPoolType").addEventListener("change", (event) => { document.querySelector("#oppoTip").hidden = event.target.value !== "OPPO"; });
document.querySelector("#savePoolButton").addEventListener("click", () => {
  const name = document.querySelector("#newPoolName").value.trim();
  const type = document.querySelector("#newPoolType").value;
  const error = document.querySelector("#createError");
  if (!name || !type) { error.textContent = !name ? "请输入池名称" : "请选择池类型"; error.hidden = false; return; }
  const status = document.querySelector('input[name="newStatus"]:checked').value;
  pools.unshift({ id: 27, name, count: 0, status, type });
  closeModal("createModal");
  renderPools();
  showToast("合集池已创建");
});

function statusMarkup(value, kind) {
  const className = value === "可推送" ? "valid" : value === "校验失败" ? "invalid" : value === "已推送" ? "sent" : value === "推送失败" ? "invalid" : "";
  return `<span class="status-tag ${className}">${value}</span>`;
}

function renderElements(keyword = "") {
  const data = elements.filter((item) => !keyword || String(item.id).includes(keyword) || item.name.includes(keyword));
  document.querySelector("#elementRows").innerHTML = data.map((item) => `<tr><td>${item.id}</td><td title="${item.name}">${item.name}</td><td>${item.total}</td><td>${statusMarkup(item.validate)}</td><td>${statusMarkup(item.push)}</td><td>${item.time}</td><td>${item.issues ? `<button class="link-button issue-button" data-id="${item.id}">查看问题</button>` : `<button class="link-button element-detail-button">查看详情</button>`}</td></tr>`).join("");
  document.querySelectorAll(".issue-button").forEach((button) => button.addEventListener("click", () => openIssue(Number(button.dataset.id))));
  document.querySelectorAll(".element-detail-button").forEach((button) => button.addEventListener("click", () => showToast("当前合集已通过OPPO字段校验")));
}

function openElements(poolId) {
  if (poolId !== 26) { showToast("原型重点展示OPPO合集池"); return; }
  renderElements();
  document.querySelector("#elementKeyword").value = "";
  openModal("elementsModal");
}
document.querySelector("#elementQueryButton").addEventListener("click", () => renderElements(document.querySelector("#elementKeyword").value.trim()));
document.querySelector("#validateButton").addEventListener("click", () => showToast("校验完成：82部可推送，4部需修正"));
document.querySelector("#addElementButton").addEventListener("click", () => showToast("已打开合集选择器（原型示意）"));

function openIssue(id) {
  const item = elements.find((element) => element.id === id);
  document.querySelector("#issueDramaName").textContent = item.name;
  document.querySelector("#issueDramaId").textContent = `合集ID：${item.id}`;
  document.querySelector("#issueList").innerHTML = item.issues.map((issue) => `<li>${issue}</li>`).join("");
  openModal("issueModal");
}

function openPush() {
  document.querySelector("#pushConfirmCheck").checked = false;
  document.querySelector("#pushError").hidden = true;
  openModal("pushModal");
}
document.querySelector("#pushFromElementsButton").addEventListener("click", openPush);
document.querySelector("#confirmPushButton").addEventListener("click", () => {
  if (!document.querySelector("#pushConfirmCheck").checked) { const error = document.querySelector("#pushError"); error.textContent = "请先确认池内内容及校验结果"; error.hidden = false; return; }
  document.querySelector("#confirmPushButton").textContent = "推送中...";
  document.querySelector("#confirmPushButton").disabled = true;
  setTimeout(() => {
    closeModal("pushModal");
    document.querySelector("#confirmPushButton").textContent = "开始推送";
    document.querySelector("#confirmPushButton").disabled = false;
    openModal("pushResultModal");
  }, 650);
});

function openRecords() { openModal("recordsModal"); }
document.querySelector("#viewRecordsFromResult").addEventListener("click", () => { closeModal("pushResultModal"); openRecords(); });
document.querySelector("#batchAddButton").addEventListener("click", () => showToast("请选择合集池后批量添加元素"));
document.querySelector("#importButton").addEventListener("click", () => showToast("批量导入沿用现有合集池模板"));
document.querySelector(".danger-light").addEventListener("click", () => showToast("请先勾选需要删除的合集池"));
document.querySelectorAll(".records-body .link-button").forEach((button) => button.addEventListener("click", () => showToast(button.textContent.includes("重试") ? "已重新提交失败项" : "已打开本批次推送详情（原型示意）")));
document.addEventListener("click", (event) => {
  if (!event.target.closest(".select-field")) { typeMenu.hidden = true; typeSelectButton.setAttribute("aria-expanded", "false"); typeSelectButton.querySelector("i").textContent = "⌄"; }
  if (!event.target.closest(".more-wrap")) document.querySelectorAll(".more-menu").forEach((menu) => { menu.hidden = true; });
});
document.querySelectorAll(".overlay").forEach((overlay) => overlay.addEventListener("click", (event) => { if (event.target === overlay) overlay.hidden = true; }));
document.addEventListener("keydown", (event) => {
  if (event.key !== "Escape") return;
  ["issueModal", "pushResultModal", "recordsModal", "pushModal", "elementsModal", "createModal"].some((id) => { const modal = document.querySelector(`#${id}`); if (!modal.hidden) { modal.hidden = true; return true; } return false; });
});

renderPools();
