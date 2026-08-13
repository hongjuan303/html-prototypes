const collections = [
  { id: "43429", name: "那年那月的秘密第1季" },
  { id: "43321", name: "老公的工资，婆婆的算盘" },
  { id: "43392", name: "从此，我只做自己的光" },
  { id: "43346", name: "槐树下的1989，爸妈的青春" },
  { id: "43298", name: "重回八零，我带全家奔小康" },
  { id: "43187", name: "她从风雨中归来" },
  { id: "43066", name: "错位婚姻的真相" },
];

let records = [
  { id: 1006, collectionId: "43429", collectionName: "那年那月的秘密第1季", externalId: "wx_drama_76733328851646236297", createdAt: "2026-08-13 10:26:42" },
  { id: 1005, collectionId: "43321", collectionName: "老公的工资，婆婆的算盘", externalId: "wx_drama_7672282651775992329", createdAt: "2026-08-12 18:58:16" },
  { id: 1004, collectionId: "43392", collectionName: "从此，我只做自己的光", externalId: "wx_drama_7672717986980954624", createdAt: "2026-08-11 18:36:08" },
  { id: 1003, collectionId: "43346", collectionName: "槐树下的1989，爸妈的青春", externalId: "wx_drama_7672251345101029940", createdAt: "2026-08-10 12:25:51" },
  { id: 1002, collectionId: "43298", collectionName: "重回八零，我带全家奔小康", externalId: "wx_drama_7669437720887212841", createdAt: "2026-08-09 16:43:27" },
  { id: 1001, collectionId: "43187", collectionName: "她从风雨中归来", externalId: "wx_drama_7668913027845190036", createdAt: "2026-08-08 11:14:09" },
];

const $ = (selector) => document.querySelector(selector);
const recordModal = $("#recordModal");
const deleteModal = $("#deleteModal");
const collectionModal = $("#collectionModal");
const importModal = $("#importModal");
let editingId = null;
let deletingId = null;
let selectedCollectionId = "";
let pendingCollectionId = "";
let importedRows = [];

function getFilteredRecords() {
  const name = $("#filterName").value.trim().toLowerCase();
  const collectionId = $("#filterCollectionId").value.trim();
  const externalId = $("#filterExternalId").value.trim().toLowerCase();
  return records.filter((record) => (!name || record.collectionName.toLowerCase().includes(name)) && (!collectionId || record.collectionId === collectionId) && (!externalId || record.externalId.toLowerCase() === externalId));
}

function renderRows() {
  const visible = getFilteredRecords();
  $("#recordRows").innerHTML = visible.map((record) => `
    <tr><td>${record.id}</td><td>${record.collectionId}</td><td title="${record.collectionName}">${record.collectionName}</td>
      <td title="${record.externalId}">${record.externalId}</td><td>${record.createdAt}</td>
      <td><div class="row-actions"><button class="link-button" data-edit="${record.id}">编辑</button><button class="link-button delete" data-delete="${record.id}">删除</button></div></td></tr>`).join("");
  $("#emptyState").hidden = visible.length !== 0;
  $("#countText").textContent = `共 ${visible.length} 条`;
  $("#totalText").textContent = `共 ${visible.length} 条`;
}

function showToast(message) {
  const toast = $("#toast"); toast.textContent = message; toast.hidden = false;
  clearTimeout(showToast.timer); showToast.timer = setTimeout(() => { toast.hidden = true; }, 2200);
}

function openRecordModal(record = null) {
  editingId = record ? record.id : null;
  selectedCollectionId = record ? record.collectionId : "";
  $("#dialogTitle").textContent = record ? "编辑微信外部剧授权" : "新增微信外部剧授权";
  $("#newCollectionControl").hidden = Boolean(record);
  $("#editCollectionControl").hidden = !record;
  $("#editCollectionText").textContent = record ? `${record.collectionName}（合集ID：${record.collectionId}）` : "";
  $("#selectedCollectionText").textContent = "请选择合集";
  $("#openCollectionPicker").classList.remove("has-value");
  $("#externalIdInput").value = record ? record.externalId : "";
  $("#formError").hidden = true;
  recordModal.hidden = false; document.body.style.overflow = "hidden";
}

function closeRecordModal() { recordModal.hidden = true; document.body.style.overflow = ""; }

function saveRecord() {
  const collectionId = selectedCollectionId;
  const externalId = $("#externalIdInput").value.trim();
  const error = $("#formError");
  if (!collectionId || !externalId) { error.textContent = "请选择合集并填写外部剧目ID"; error.hidden = false; return; }
  if (records.some((record) => record.externalId === externalId && record.id !== editingId)) { error.textContent = "该外部剧目ID已存在，请检查后重新填写"; error.hidden = false; return; }
  const collection = collections.find((item) => item.id === collectionId);
  if (editingId) records.find((item) => item.id === editingId).externalId = externalId;
  else records.unshift({ id: Math.max(...records.map((item) => item.id), 1000) + 1, collectionId, collectionName: collection.name, externalId, createdAt: "2026-08-13 17:40:00" });
  closeRecordModal(); renderRows(); showToast(editingId ? "授权记录编辑成功" : "授权记录新增成功");
}

function renderCollectionRows() {
  const keyword = $("#collectionKeyword").value.trim().toLowerCase();
  const visible = collections.filter((item) => !keyword || item.id.includes(keyword) || item.name.toLowerCase().includes(keyword));
  $("#collectionRows").innerHTML = visible.map((item) => `<tr class="${pendingCollectionId === item.id ? "selected" : ""}" data-collection-row="${item.id}"><td><input type="radio" name="collectionChoice" value="${item.id}" ${pendingCollectionId === item.id ? "checked" : ""} aria-label="选择${item.name}" /></td><td>${item.id}</td><td>${item.name}</td></tr>`).join("");
}

function openCollectionModal() { pendingCollectionId = selectedCollectionId; $("#collectionKeyword").value = ""; renderCollectionRows(); collectionModal.hidden = false; }
function closeCollectionModal() { collectionModal.hidden = true; }
function confirmCollection() {
  if (!pendingCollectionId) { showToast("请先选择一个合集"); return; }
  selectedCollectionId = pendingCollectionId;
  const collection = collections.find((item) => item.id === selectedCollectionId);
  $("#selectedCollectionText").textContent = `${collection.name}（合集ID：${collection.id}）`;
  $("#openCollectionPicker").classList.add("has-value"); closeCollectionModal();
}

function openDeleteModal(record) {
  deletingId = record.id; $("#deleteDescription").textContent = `${record.collectionName}（外部剧目ID：${record.externalId}）`;
  deleteModal.hidden = false; document.body.style.overflow = "hidden";
}
function closeDeleteModal() { deletingId = null; deleteModal.hidden = true; document.body.style.overflow = ""; }

function resetImport() {
  importedRows = []; $("#excelFileInput").value = ""; $("#fileCard").hidden = true; $("#importResult").hidden = true;
  $("#importResult").classList.remove("success"); $("#errorTable").hidden = true; $("#confirmImportButton").disabled = true;
}
function openImportModal() { resetImport(); importModal.hidden = false; document.body.style.overflow = "hidden"; }
function closeImportModal() { importModal.hidden = true; document.body.style.overflow = ""; }

function downloadTemplate() {
  if (!window.XLSX) { showToast("模板组件加载失败，请刷新后重试"); return; }
  const sheet = XLSX.utils.aoa_to_sheet([["合集ID", "外部剧目ID"], ["43066", "wx_drama_xxxxxxxxx"]]);
  const workbook = XLSX.utils.book_new(); XLSX.utils.book_append_sheet(workbook, sheet, "导入模板");
  XLSX.writeFile(workbook, "微信外部剧授权导入模板.xlsx");
}

function validateImport(rows) {
  const errors = [];
  const seen = new Set();
  const existingIds = new Set(records.map((item) => item.collectionId));
  rows.forEach((row, index) => {
    const collectionId = String(row["合集ID"] ?? "").trim();
    const externalId = String(row["外部剧目ID"] ?? "").trim();
    let reason = "";
    if (!collectionId || !externalId) reason = "合集ID或外部剧目ID为空";
    else if (!collections.some((item) => item.id === collectionId)) reason = "合集ID不存在";
    else if (seen.has(collectionId)) reason = "导入文件中存在重复的合集ID";
    else if (existingIds.has(collectionId)) reason = "合集ID已存在授权记录";
    seen.add(collectionId);
    if (reason) errors.push({ row: index + 2, collectionId: collectionId || "-", reason });
  });
  return errors;
}

function showImportResult(errors, total) {
  const result = $("#importResult"); result.hidden = false;
  if (errors.length) {
    result.classList.remove("success"); $("#resultIcon").textContent = "!"; $("#resultHeading").textContent = "导入校验失败";
    $("#resultSummary").textContent = `共读取 ${total} 条数据，发现 ${errors.length} 条错误，本次数据不会导入。`;
    $("#errorRows").innerHTML = errors.map((error) => `<tr><td>${error.row}</td><td>${error.collectionId}</td><td>${error.reason}</td></tr>`).join("");
    $("#errorTable").hidden = false; $("#confirmImportButton").disabled = true;
  } else {
    result.classList.add("success"); $("#resultIcon").textContent = "✓"; $("#resultHeading").textContent = "校验通过";
    $("#resultSummary").textContent = `共读取 ${total} 条数据，可以导入。`; $("#errorTable").hidden = true; $("#confirmImportButton").disabled = false;
  }
}

async function handleExcelFile(file) {
  resetImport();
  if (!file) return;
  if (!/\.(xlsx|xls)$/i.test(file.name)) { showToast("请上传 .xlsx 或 .xls 文件"); return; }
  if (file.size > 10 * 1024 * 1024) { showToast("文件大小不能超过10MB"); return; }
  $("#fileName").textContent = file.name; $("#fileSize").textContent = `${(file.size / 1024).toFixed(1)} KB`; $("#fileCard").hidden = false;
  if (!window.XLSX) { showImportResult([{ row: "-", collectionId: "-", reason: "Excel解析组件加载失败" }], 0); return; }
  try {
    const workbook = XLSX.read(await file.arrayBuffer(), { type: "array" });
    importedRows = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]], { defval: "" });
    const headers = importedRows.length ? Object.keys(importedRows[0]) : [];
    if (!headers.includes("合集ID") || !headers.includes("外部剧目ID")) { showImportResult([{ row: 1, collectionId: "-", reason: "模板表头不正确" }], importedRows.length); return; }
    showImportResult(validateImport(importedRows), importedRows.length);
  } catch { showImportResult([{ row: "-", collectionId: "-", reason: "文件无法解析，请使用下载的模板" }], 0); }
}

function confirmImport() {
  importedRows.forEach((row) => {
    const collectionId = String(row["合集ID"]).trim(); const collection = collections.find((item) => item.id === collectionId);
    records.unshift({ id: Math.max(...records.map((item) => item.id), 1000) + 1, collectionId, collectionName: collection.name, externalId: String(row["外部剧目ID"]).trim(), createdAt: "2026-08-13 17:40:00" });
  });
  const count = importedRows.length; closeImportModal(); renderRows(); showToast(`成功导入 ${count} 条授权记录`);
}

$("#queryButton").addEventListener("click", () => { renderRows(); showToast("筛选条件已应用"); });
$("#resetButton").addEventListener("click", () => { $("#filterName").value = ""; $("#filterCollectionId").value = ""; $("#filterExternalId").value = ""; renderRows(); });
$("#createButton").addEventListener("click", () => openRecordModal());
$("#importButton").addEventListener("click", openImportModal);
$("#openCollectionPicker").addEventListener("click", openCollectionModal);
$("#closeCollectionModal").addEventListener("click", closeCollectionModal);
$("#cancelCollectionModal").addEventListener("click", closeCollectionModal);
$("#confirmCollectionButton").addEventListener("click", confirmCollection);
$("#collectionQueryButton").addEventListener("click", renderCollectionRows);
$("#collectionResetButton").addEventListener("click", () => { $("#collectionKeyword").value = ""; renderCollectionRows(); });
$("#collectionRows").addEventListener("click", (event) => { const row = event.target.closest("[data-collection-row]"); if (!row) return; pendingCollectionId = row.dataset.collectionRow; renderCollectionRows(); });
$("#closeRecordModal").addEventListener("click", closeRecordModal);
$("#cancelRecordModal").addEventListener("click", closeRecordModal);
$("#saveRecordButton").addEventListener("click", saveRecord);
$("#closeDeleteModal").addEventListener("click", closeDeleteModal);
$("#cancelDeleteButton").addEventListener("click", closeDeleteModal);
$("#confirmDeleteButton").addEventListener("click", () => { records = records.filter((record) => record.id !== deletingId); closeDeleteModal(); renderRows(); showToast("授权记录已删除"); });
$("#closeImportModal").addEventListener("click", closeImportModal);
$("#cancelImportModal").addEventListener("click", closeImportModal);
$("#downloadTemplateButton").addEventListener("click", downloadTemplate);
$("#excelFileInput").addEventListener("change", (event) => handleExcelFile(event.target.files[0]));
$("#removeFileButton").addEventListener("click", resetImport);
$("#confirmImportButton").addEventListener("click", confirmImport);
$("#uploadZone").addEventListener("dragover", (event) => { event.preventDefault(); event.currentTarget.classList.add("dragging"); });
$("#uploadZone").addEventListener("dragleave", (event) => event.currentTarget.classList.remove("dragging"));
$("#uploadZone").addEventListener("drop", (event) => { event.preventDefault(); event.currentTarget.classList.remove("dragging"); handleExcelFile(event.dataTransfer.files[0]); });
$("#recordRows").addEventListener("click", (event) => {
  const edit = event.target.closest("[data-edit]"); const remove = event.target.closest("[data-delete]");
  if (edit) openRecordModal(records.find((record) => record.id === Number(edit.dataset.edit)));
  if (remove) openDeleteModal(records.find((record) => record.id === Number(remove.dataset.delete)));
});
[recordModal, deleteModal, collectionModal, importModal].forEach((modal) => modal.addEventListener("click", (event) => {
  if (event.target !== modal) return;
  if (modal === recordModal) closeRecordModal(); else if (modal === deleteModal) closeDeleteModal(); else if (modal === collectionModal) closeCollectionModal(); else closeImportModal();
}));
document.addEventListener("keydown", (event) => {
  if (event.key !== "Escape") return;
  if (!collectionModal.hidden) closeCollectionModal(); else if (!importModal.hidden) closeImportModal(); else if (!deleteModal.hidden) closeDeleteModal(); else if (!recordModal.hidden) closeRecordModal();
});

renderRows();
