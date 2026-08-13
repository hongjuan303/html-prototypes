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
let editingId = null;
let deletingId = null;

function populateCollections() {
  $("#collectionSelect").innerHTML = '<option value="">请选择合集</option>' + collections.map((item) => `<option value="${item.id}">${item.id}｜${item.name}</option>`).join("");
}

function getFilteredRecords() {
  const name = $("#filterName").value.trim().toLowerCase();
  const collectionId = $("#filterCollectionId").value.trim();
  const externalId = $("#filterExternalId").value.trim().toLowerCase();
  return records.filter((record) => (!name || record.collectionName.toLowerCase().includes(name)) && (!collectionId || record.collectionId.includes(collectionId)) && (!externalId || record.externalId.toLowerCase().includes(externalId)));
}

function renderRows() {
  const visible = getFilteredRecords();
  $("#recordRows").innerHTML = visible.map((record) => `
    <tr>
      <td>${record.id}</td><td>${record.collectionId}</td><td title="${record.collectionName}">${record.collectionName}</td>
      <td title="${record.externalId}">${record.externalId}</td><td>${record.createdAt}</td>
      <td><div class="row-actions"><button class="link-button" data-edit="${record.id}">编辑</button><button class="link-button delete" data-delete="${record.id}">删除</button></div></td>
    </tr>`).join("");
  $("#emptyState").hidden = visible.length !== 0;
  $("#countText").textContent = `共 ${visible.length} 条`;
  $("#totalText").textContent = `共 ${visible.length} 条`;
}

function showToast(message) {
  const toast = $("#toast");
  toast.textContent = message;
  toast.hidden = false;
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => { toast.hidden = true; }, 2200);
}

function openRecordModal(record = null) {
  editingId = record ? record.id : null;
  $("#dialogTitle").textContent = record ? "编辑微信外部剧授权" : "新增微信外部剧授权";
  $("#collectionSelect").value = record ? record.collectionId : "";
  $("#externalIdInput").value = record ? record.externalId : "";
  $("#formError").hidden = true;
  recordModal.hidden = false;
  document.body.style.overflow = "hidden";
}

function closeRecordModal() {
  recordModal.hidden = true;
  document.body.style.overflow = "";
}

function saveRecord() {
  const collectionId = $("#collectionSelect").value;
  const externalId = $("#externalIdInput").value.trim();
  const error = $("#formError");
  if (!collectionId || !externalId) {
    error.textContent = "请选择合集并填写外部剧目ID";
    error.hidden = false;
    return;
  }
  const duplicated = records.some((record) => record.externalId === externalId && record.id !== editingId);
  if (duplicated) {
    error.textContent = "该外部剧目ID已存在，请检查后重新填写";
    error.hidden = false;
    return;
  }
  const collection = collections.find((item) => item.id === collectionId);
  if (editingId) {
    const record = records.find((item) => item.id === editingId);
    Object.assign(record, { collectionId, collectionName: collection.name, externalId });
  } else {
    const newId = records.length ? Math.max(...records.map((item) => item.id)) + 1 : 1001;
    records.unshift({ id: newId, collectionId, collectionName: collection.name, externalId, createdAt: "2026-08-13 15:30:00" });
  }
  closeRecordModal();
  renderRows();
  showToast(editingId ? "授权记录编辑成功" : "授权记录新增成功");
}

function openDeleteModal(record) {
  deletingId = record.id;
  $("#deleteDescription").textContent = `${record.collectionName}（外部剧目ID：${record.externalId}）`;
  deleteModal.hidden = false;
  document.body.style.overflow = "hidden";
}

function closeDeleteModal() {
  deletingId = null;
  deleteModal.hidden = true;
  document.body.style.overflow = "";
}

$("#queryButton").addEventListener("click", () => { renderRows(); showToast("筛选条件已应用"); });
$("#resetButton").addEventListener("click", () => {
  $("#filterName").value = ""; $("#filterCollectionId").value = ""; $("#filterExternalId").value = ""; renderRows();
});
$("#createButton").addEventListener("click", () => openRecordModal());
$("#closeRecordModal").addEventListener("click", closeRecordModal);
$("#cancelRecordModal").addEventListener("click", closeRecordModal);
$("#saveRecordButton").addEventListener("click", saveRecord);
$("#closeDeleteModal").addEventListener("click", closeDeleteModal);
$("#cancelDeleteButton").addEventListener("click", closeDeleteModal);
$("#confirmDeleteButton").addEventListener("click", () => {
  records = records.filter((record) => record.id !== deletingId);
  closeDeleteModal(); renderRows(); showToast("授权记录已删除");
});
$("#recordRows").addEventListener("click", (event) => {
  const edit = event.target.closest("[data-edit]");
  const remove = event.target.closest("[data-delete]");
  if (edit) openRecordModal(records.find((record) => record.id === Number(edit.dataset.edit)));
  if (remove) openDeleteModal(records.find((record) => record.id === Number(remove.dataset.delete)));
});
[recordModal, deleteModal].forEach((modal) => modal.addEventListener("click", (event) => { if (event.target !== modal) return; modal === recordModal ? closeRecordModal() : closeDeleteModal(); }));
document.addEventListener("keydown", (event) => { if (event.key !== "Escape") return; if (!deleteModal.hidden) closeDeleteModal(); else if (!recordModal.hidden) closeRecordModal(); });

populateCollections();
renderRows();
