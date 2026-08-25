const records = [
  { id: 1, month: "07月", type: "高消费短剧激励活动", allocations: [{ owner: "番茄", ratio: 50 }, { owner: "抖音原生", ratio: 50 }] },
  { id: 2, month: "07月", type: "重点品类激励活动", allocations: [{ owner: "番茄", ratio: 100 }] },
  { id: 3, month: "07月", type: "抖音端原生品类激励活动", allocations: [{ owner: "抖音原生", ratio: 100 }] },
  { id: 4, month: "07月", type: "合作机构新增短剧激励", allocations: [{ owner: "番茄", ratio: 60 }, { owner: "抖音原生", ratio: 40 }] },
  { id: 5, month: "06月", type: "系列剧激励活动", allocations: [{ owner: "番茄", ratio: 100 }] },
  { id: 6, month: "06月", type: "高消费短剧激励活动", allocations: [{ owner: "番茄", ratio: 100 }] },
  { id: 7, month: "06月", type: "重点品类激励活动", allocations: [{ owner: "番茄", ratio: 50 }, { owner: "抖音原生", ratio: 50 }] },
  { id: 8, month: "06月", type: "抖音端原生品类激励活动", allocations: [{ owner: "抖音原生", ratio: 100 }] },
  { id: 9, month: "06月", type: "合作机构新增短剧激励", allocations: [{ owner: "番茄", ratio: 100 }] },
  { id: 10, month: "05月", type: "重点品类激励活动", allocations: [{ owner: "番茄", ratio: 100 }] }
];

const rows = document.querySelector("#incentiveRows");
const emptyState = document.querySelector("#emptyState");
const totalText = document.querySelector("#totalText");
const monthFilter = document.querySelector("#monthFilter");
const typeFilter = document.querySelector("#typeFilter");
const ownerFilter = document.querySelector("#ownerFilter");
const editModal = document.querySelector("#editModal");
const confirmModal = document.querySelector("#confirmModal");
const allocationList = document.querySelector("#allocationList");
const addAllocationButton = document.querySelector("#addAllocationButton");
const formError = document.querySelector("#formError");
const totalBadge = document.querySelector("#totalBadge");
const toast = document.querySelector("#toast");

let activeRecord = null;
let draftAllocations = [];
let visibleRecords = records.filter((record) => record.month === "07月");
let toastTimer = null;

function formatRatio(value) {
  const number = Number(value);
  return Number.isInteger(number) ? String(number) : number.toFixed(2).replace(/0+$/, "").replace(/\.$/, "");
}

function allocationMarkup(allocations) {
  return `<div class="allocation-display">${allocations.map((item, index) => `${index ? '<span class="split-mark">/</span>' : ''}<span class="owner-chip"><b>${item.owner}</b>${formatRatio(item.ratio)}%</span>`).join("")}</div>`;
}

function renderTable(data = visibleRecords) {
  rows.innerHTML = data.map((record) => `<tr>
    <td>${record.month}</td>
    <td title="${record.type}">${record.type}</td>
    <td>${allocationMarkup(record.allocations)}</td>
    <td><button class="link-button edit-button" data-id="${record.id}">编辑</button></td>
  </tr>`).join("");
  emptyState.hidden = data.length > 0;
  totalText.textContent = `共 ${data.length} 条`;
  document.querySelectorAll(".edit-button").forEach((button) => button.addEventListener("click", () => openEdit(Number(button.dataset.id))));
}

function applyFilters() {
  visibleRecords = records.filter((record) => {
    const monthMatch = !monthFilter.value || record.month === monthFilter.value;
    const typeMatch = !typeFilter.value || record.type === typeFilter.value;
    const ownerMatch = !ownerFilter.value || record.allocations.some((item) => item.owner === ownerFilter.value);
    return monthMatch && typeMatch && ownerMatch;
  });
  renderTable();
  showToast(`已查询到 ${visibleRecords.length} 条配置`);
}

function resetFilters() {
  monthFilter.value = "";
  typeFilter.value = "";
  ownerFilter.value = "";
  visibleRecords = [...records];
  renderTable();
}

function openEdit(id) {
  activeRecord = records.find((record) => record.id === id);
  draftAllocations = activeRecord.allocations.map((item) => ({ ...item }));
  document.querySelector("#dialogMonth").textContent = `2026年${activeRecord.month}`;
  document.querySelector("#dialogType").textContent = activeRecord.type;
  formError.hidden = true;
  renderAllocationRows();
  editModal.hidden = false;
}

function closeEdit() {
  editModal.hidden = true;
  activeRecord = null;
}

function renderAllocationRows() {
  allocationList.innerHTML = draftAllocations.map((item, index) => `<div class="allocation-row" data-index="${index}">
    <span class="allocation-index">${index + 1}</span>
    <div class="allocation-field"><label>收益归属方</label><select class="owner-select" data-index="${index}"><option value="">请选择</option><option value="番茄" ${item.owner === "番茄" ? "selected" : ""}>番茄</option><option value="抖音原生" ${item.owner === "抖音原生" ? "selected" : ""}>抖音原生</option></select></div>
    <div class="allocation-field"><label>分成比例</label><div class="ratio-control"><input class="ratio-input" data-index="${index}" type="number" min="0.01" max="100" step="0.01" value="${item.ratio}" /><span>%</span></div></div>
    <button class="remove-allocation" data-index="${index}" ${draftAllocations.length === 1 ? "disabled" : ""} title="删除收益归属" aria-label="删除收益归属">×</button>
  </div>`).join("");

  document.querySelectorAll(".owner-select").forEach((select) => select.addEventListener("change", (event) => {
    draftAllocations[Number(event.target.dataset.index)].owner = event.target.value;
    clearError();
  }));
  document.querySelectorAll(".ratio-input").forEach((input) => input.addEventListener("input", (event) => {
    draftAllocations[Number(event.target.dataset.index)].ratio = event.target.value;
    clearError();
    updateTotal();
  }));
  document.querySelectorAll(".remove-allocation").forEach((button) => button.addEventListener("click", () => {
    if (draftAllocations.length === 1) return;
    draftAllocations.splice(Number(button.dataset.index), 1);
    draftAllocations[0].ratio = 100;
    clearError();
    renderAllocationRows();
  }));
  addAllocationButton.disabled = draftAllocations.length >= 2;
  updateTotal();
}

function updateTotal() {
  const total = draftAllocations.reduce((sum, item) => sum + (Number(item.ratio) || 0), 0);
  totalBadge.textContent = `合计 ${formatRatio(total)}%`;
  totalBadge.classList.toggle("invalid", Math.abs(total - 100) > 0.0001);
}

function clearError() {
  formError.hidden = true;
  allocationList.querySelectorAll(".allocation-row").forEach((row) => row.classList.remove("invalid"));
}

function showError(message, rowIndexes = []) {
  formError.textContent = message;
  formError.hidden = false;
  rowIndexes.forEach((index) => allocationList.querySelector(`[data-index="${index}"]`)?.classList.add("invalid"));
}

function validateDraft() {
  clearError();
  const missingOwner = draftAllocations.findIndex((item) => !item.owner);
  if (missingOwner >= 0) return showError("请选择收益归属方", [missingOwner]), false;
  const invalidRatio = draftAllocations.findIndex((item) => !Number(item.ratio) || Number(item.ratio) <= 0 || Number(item.ratio) > 100 || !/^\d+(\.\d{1,2})?$/.test(String(item.ratio)));
  if (invalidRatio >= 0) return showError("分成比例须大于0、不超过100%，且最多保留2位小数", [invalidRatio]), false;
  if (new Set(draftAllocations.map((item) => item.owner)).size !== draftAllocations.length) return showError("同一收益归属方不可重复添加", draftAllocations.map((_, index) => index)), false;
  const total = draftAllocations.reduce((sum, item) => sum + Number(item.ratio), 0);
  if (Math.abs(total - 100) > 0.0001) return showError(`分成比例合计必须等于100%，当前合计为${formatRatio(total)}%`, draftAllocations.map((_, index) => index)), false;
  return true;
}

function addAllocation() {
  if (draftAllocations.length >= 2) return;
  const existingOwner = draftAllocations[0]?.owner;
  draftAllocations[0].ratio = 50;
  draftAllocations.push({ owner: existingOwner === "番茄" ? "抖音原生" : "番茄", ratio: 50 });
  clearError();
  renderAllocationRows();
}

function openConfirm() {
  if (!validateDraft()) return;
  document.querySelector("#confirmMeta").textContent = `${document.querySelector("#dialogMonth").textContent} · ${activeRecord.type}`;
  document.querySelector("#confirmAllocation").innerHTML = draftAllocations.map((item) => `<span>${item.owner} ${formatRatio(item.ratio)}%</span>`).join("");
  confirmModal.hidden = false;
}

function saveAllocations() {
  activeRecord.allocations = draftAllocations.map((item) => ({ owner: item.owner, ratio: Number(item.ratio) }));
  confirmModal.hidden = true;
  editModal.hidden = true;
  activeRecord = null;
  applyFiltersSilently();
  showToast("收益分配已保存");
}

function applyFiltersSilently() {
  visibleRecords = records.filter((record) => (!monthFilter.value || record.month === monthFilter.value) && (!typeFilter.value || record.type === typeFilter.value) && (!ownerFilter.value || record.allocations.some((item) => item.owner === ownerFilter.value)));
  renderTable();
}

function exportCsv() {
  const header = "账期,激励类型,收益分配明细\n";
  const body = visibleRecords.map((record) => `${record.month},${record.type},${record.allocations.map((item) => `${item.owner}:${formatRatio(item.ratio)}%`).join(";")}`).join("\n");
  const blob = new Blob(["\ufeff" + header + body], { type: "text/csv;charset=utf-8" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "专项激励收益分配.csv";
  link.click();
  URL.revokeObjectURL(link.href);
  showToast("已导出当前查询结果");
}

function showToast(message) {
  clearTimeout(toastTimer);
  toast.textContent = message;
  toast.hidden = false;
  toastTimer = setTimeout(() => { toast.hidden = true; }, 1800);
}

document.querySelector("#queryButton").addEventListener("click", applyFilters);
document.querySelector("#resetButton").addEventListener("click", resetFilters);
document.querySelector("#exportButton").addEventListener("click", exportCsv);
document.querySelector("#closeEditModal").addEventListener("click", closeEdit);
document.querySelector("#cancelEditModal").addEventListener("click", closeEdit);
document.querySelector("#addAllocationButton").addEventListener("click", addAllocation);
document.querySelector("#openConfirmButton").addEventListener("click", openConfirm);
document.querySelector("#closeConfirmModal").addEventListener("click", () => { confirmModal.hidden = true; });
document.querySelector("#cancelConfirmButton").addEventListener("click", () => { confirmModal.hidden = true; });
document.querySelector("#saveButton").addEventListener("click", saveAllocations);
editModal.addEventListener("click", (event) => { if (event.target === editModal) closeEdit(); });
confirmModal.addEventListener("click", (event) => { if (event.target === confirmModal) confirmModal.hidden = true; });
document.addEventListener("keydown", (event) => {
  if (event.key !== "Escape") return;
  if (!confirmModal.hidden) confirmModal.hidden = true;
  else if (!editModal.hidden) closeEdit();
});

renderTable();
