const novels = [
  { id: "1165", name: "雨停之后的答案", review: "已送审", author: "南乔", editor: "君一", owner: "梁洁敏", channel: "女频", type: "短篇", tags: "追妻火葬场、打脸", clone: "原小说", checkpoint: 5, chapters: 10, words: 10208, listing: "签约", cost: "12,000.00", tomato: true, exclusive: true, copyright: "自有版权", file: "版权文件-1165.pdf", department: "七月工作室", status: "上架", createdAt: "2026-07-29 10:50:18", cover: "blue" },
  { id: "1164", name: "月光落在旧站台", review: "已送审", author: "苏木", editor: "眠羊", owner: "严润璐", channel: "女频", type: "短篇", tags: "虐恋情深、情感", clone: "原小说", checkpoint: 5, chapters: 10, words: 10538, listing: "签约", cost: "8,600.00", tomato: false, exclusive: false, copyright: "自有版权", file: "版权文件-1164.pdf", department: "七月工作室", status: "上架", createdAt: "2026-07-29 10:47:19", cover: "rose" },
  { id: "1163", name: "雾港来信", review: "已送审", author: "溪源", editor: "君一", owner: "梁洁敏", channel: "女频", type: "短篇", tags: "家庭、情感", clone: "原小说", checkpoint: 5, chapters: 9, words: 9355, listing: "签约", cost: "", tomato: true, exclusive: false, copyright: "自有版权", file: "-", department: "钱行工作室", status: "上架", createdAt: "2026-07-29 10:40:33", cover: "green" },
  { id: "1162", name: "第七封信", review: "未送审", author: "南乔", editor: "毛球", owner: "蔡兴达", channel: "男频", type: "短篇", tags: "家庭、爽文", clone: "原小说", checkpoint: 5, chapters: 9, words: 8896, listing: "精修", cost: "", tomato: false, exclusive: false, copyright: "自有版权", file: "-", department: "七月工作室", status: "上架", createdAt: "2026-07-29 10:06:09", cover: "gold" },
  { id: "1161", name: "潮水退去以后", review: "未送审", author: "林深", editor: "毛球", owner: "蔡兴达", channel: "女频", type: "短篇", tags: "婚恋现实、打脸", clone: "原小说", checkpoint: 5, chapters: 8, words: 8728, listing: "签约", cost: "9,800.00", tomato: false, exclusive: false, copyright: "自有版权", file: "版权文件-1161.pdf", department: "钱行工作室", status: "上架", createdAt: "2026-07-29 09:50:49", cover: "violet" },
];

const $ = (selector) => document.querySelector(selector);
const modal = $("#novelModal");
const form = $("#novelForm");
let editingId = null;

function renderRows() {
  const tomatoValue = $("#tomatoFilter").value;
  const exclusiveValue = $("#exclusiveFilter").value;
  const visible = novels.filter((novel) => {
    const tomatoMatch = tomatoValue === "全部" || (tomatoValue === "是" ? novel.tomato : !novel.tomato);
    const exclusiveMatch = tomatoValue !== "是" || exclusiveValue === "全部" || (exclusiveValue === "是" ? novel.exclusive : !novel.exclusive);
    return tomatoMatch && exclusiveMatch;
  });

  $("#novelRows").innerHTML = visible.map((novel) => `
    <tr>
      <td class="checkbox-cell"><input type="checkbox" aria-label="选择 ${novel.name}" /></td>
      <td>${novel.id}</td><td>${novel.name}</td><td class="${novel.review === "已送审" ? "status-sent" : "status-unsent"}">${novel.review}</td>
      <td><span class="cover ${novel.cover}">${novel.name.slice(0, 4)}</span></td><td>${novel.author}</td><td>${novel.editor}</td><td>${novel.owner}</td>
      <td>${novel.channel}</td><td>${novel.type}</td><td>${novel.tags}</td><td>${novel.clone}</td><td>${novel.checkpoint}</td><td>${novel.chapters}</td><td>${novel.words}</td>
      <td>${novel.listing}</td><td>${novel.cost ? `¥${novel.cost}` : "-"}</td><td>${novel.tomato ? "是" : "否"}</td><td>${novel.copyright}</td><td>${novel.file}</td>
      <td>${novel.department}</td><td>${novel.status}</td><td>${novel.createdAt}</td>
      <td class="sticky-action"><div class="row-actions"><button type="button" data-edit="${novel.id}">修改</button><button type="button">克隆</button><button type="button">下架</button></div></td>
    </tr>
  `).join("");
  $("#resultCount").textContent = `共 ${visible.length} 条`;
}

function setRadio(name, value) {
  const input = form.querySelector(`input[name="${name}"][value="${value}"]`);
  if (input) input.checked = true;
}

function updateConditionalFields() {
  const listing = form.querySelector('input[name="listingType"]:checked').value;
  const tomato = form.querySelector('input[name="tomatoAuthorized"]:checked').value;
  $("#costRow").hidden = listing !== "签约";
  if (listing !== "签约") $("#costInput").value = "";
  $("#exclusiveRow").hidden = tomato !== "是";
  if (tomato !== "是") setRadio("exclusive", "否");
}

function resetForm() {
  form.reset();
  editingId = null;
  $("#dialogTitle").textContent = "新建小说";
  $("#nameCount").textContent = "0";
  $("#introCount").textContent = "0";
  $("#formError").hidden = true;
  setRadio("listingType", "签约");
  setRadio("tomatoAuthorized", "否");
  setRadio("exclusive", "否");
  updateConditionalFields();
}

function openModal(novel = null) {
  resetForm();
  if (novel) {
    editingId = novel.id;
    $("#dialogTitle").textContent = "编辑小说";
    $("#novelName").value = novel.name;
    $("#novelIntro").value = "一段关于选择、成长与重逢的短篇故事。";
    $("#finishDate").value = "2026-07-28";
    $("#authorName").value = novel.author;
    $("#editorName").value = novel.editor;
    $("#ownerName").value = novel.owner;
    setRadio("channel", novel.channel);
    setRadio("novelType", novel.type);
    setRadio("listingType", novel.listing);
    $("#costInput").value = novel.cost ? novel.cost.replaceAll(",", "") : "";
    setRadio("tomatoAuthorized", novel.tomato ? "是" : "否");
    setRadio("exclusive", novel.exclusive ? "是" : "否");
    $("#nameCount").textContent = String(novel.name.length);
    $("#introCount").textContent = String($("#novelIntro").value.length);
    updateConditionalFields();
  }
  modal.hidden = false;
  document.body.style.overflow = "hidden";
}

function closeModal() {
  modal.hidden = true;
  document.body.style.overflow = "";
}

function showToast(message) {
  const toast = $("#toast");
  toast.textContent = message;
  toast.hidden = false;
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => { toast.hidden = true; }, 2400);
}

function saveNovel() {
  const name = $("#novelName").value.trim();
  const intro = $("#novelIntro").value.trim();
  const finishDate = $("#finishDate").value;
  const author = $("#authorName").value.trim();
  const listing = form.querySelector('input[name="listingType"]:checked').value;
  const cost = $("#costInput").value;
  const error = $("#formError");
  if (!name || !intro || !finishDate || !author) {
    error.textContent = "请完整填写小说名称、简介、完结日期和作者笔名";
    error.hidden = false;
    return;
  }
  if (listing === "签约" && (cost === "" || Number(cost) < 0)) {
    error.textContent = "上架类型为「签约」时，请填写有效的成本";
    error.hidden = false;
    return;
  }
  closeModal();
  showToast(editingId ? "小说信息修改成功" : "小说新增成功");
}

$("#tomatoFilter").addEventListener("change", (event) => {
  const showExclusive = event.target.value === "是";
  $("#exclusiveFilterWrap").hidden = !showExclusive;
  if (!showExclusive) $("#exclusiveFilter").value = "全部";
  renderRows();
});
$("#exclusiveFilter").addEventListener("change", renderRows);
$("#queryButton").addEventListener("click", () => { renderRows(); showToast("筛选条件已应用"); });
$("#resetButton").addEventListener("click", () => {
  $("#tomatoFilter").value = "全部";
  $("#exclusiveFilter").value = "全部";
  $("#exclusiveFilterWrap").hidden = true;
  renderRows();
});
$("#exportButton").addEventListener("click", () => showToast("已生成当前筛选结果的导出任务"));
$("#createButton").addEventListener("click", () => openModal());
$("#closeButton").addEventListener("click", closeModal);
$("#cancelButton").addEventListener("click", closeModal);
$("#saveButton").addEventListener("click", saveNovel);
modal.addEventListener("click", (event) => { if (event.target === modal) closeModal(); });
$("#novelRows").addEventListener("click", (event) => {
  const editButton = event.target.closest("[data-edit]");
  if (!editButton) return;
  openModal(novels.find((novel) => novel.id === editButton.dataset.edit));
});
form.addEventListener("change", (event) => {
  if (event.target.matches('input[name="listingType"], input[name="tomatoAuthorized"]')) updateConditionalFields();
});
$("#costInput").addEventListener("input", (event) => {
  const value = event.target.value;
  if (!/^\d*(\.\d{0,2})?$/.test(value)) event.target.value = value.slice(0, -1);
});
$("#costInput").addEventListener("blur", (event) => {
  if (event.target.value !== "" && Number.isFinite(Number(event.target.value))) event.target.value = Number(event.target.value).toFixed(2);
});
$("#novelName").addEventListener("input", (event) => { $("#nameCount").textContent = String(event.target.value.length); });
$("#novelIntro").addEventListener("input", (event) => { $("#introCount").textContent = String(event.target.value.length); });
$("#coverUpload").addEventListener("click", () => showToast("原型示意：选择封面文件"));
document.addEventListener("keydown", (event) => { if (event.key === "Escape" && !modal.hidden) closeModal(); });

renderRows();
