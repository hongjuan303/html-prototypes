const pages = {
  applications: { label: "生态合作申请", group: "生态创新中心 / 申请管理" },
  waterfall: { label: "瀑布流轮播图", group: "产品运营 / 内容运营" }
};

const applicationRows = [
  {
    id: "260821001", type: "OPC社区", subject: "杭州OPC社区", organization: "杭州云栖影业有限公司",
    contact: "陈澈", phone: "138****5621", submitTime: "2026-08-21 09:42", review: "待审核", follow: "未跟进", reviewer: "-",
    city: "杭州", teamSize: "12人", model: "收益分成", scope: "AI漫剧制作、分镜生成、短剧后期与联合发行",
    portfolio: "https://example.com/portfolio/hzyq", source: "OPC社区-申请加入", consent: "已同意"
  },
  {
    id: "260820018", type: "精品短剧", subject: "《山海有信》文旅短剧", organization: "新疆远山文旅发展有限公司",
    contact: "赵宁", phone: "186****0912", submitTime: "2026-08-20 16:18", review: "无需审核", follow: "跟进中", reviewer: "-",
    city: "乌鲁木齐", teamSize: "8人", model: "联合制作", scope: "文旅内容策划、景区取景协调及本地宣发资源",
    portfolio: "项目策划案、版权证明、主创团队介绍", source: "精品短剧-我要合作", consent: "已同意"
  },
  {
    id: "260820011", type: "产业空间", subject: "永嘉人工智能创新应用中心", organization: "温州瓯越数字产业园",
    contact: "叶倩", phone: "159****7710", submitTime: "2026-08-20 11:06", review: "无需审核", follow: "未跟进", reviewer: "-",
    city: "温州·永嘉", teamSize: "30-50个工位", model: "产业共建", scope: "提供办公空间、政策对接、产业项目与本地文旅资源",
    portfolio: "园区介绍及场地照片", source: "产业空间-我要加入", consent: "已同意"
  },
  {
    id: "260819026", type: "校企合作", subject: "人工智能影视实践专班", organization: "浙江传媒学院动画与数字艺术学院",
    contact: "徐老师", phone: "137****2236", submitTime: "2026-08-19 15:31", review: "无需审核", follow: "已转化", reviewer: "-",
    city: "杭州", teamSize: "首期60人", model: "课程共建", scope: "联合课程、真实项目进课堂、师资与算力支持",
    portfolio: "学院介绍、课程方案", source: "校企合作-我要合作", consent: "已同意"
  },
  {
    id: "260818036", type: "OPC社区", subject: "成都OPC社区", organization: "拾光像素工作室",
    contact: "宋言", phone: "177****8455", submitTime: "2026-08-18 18:05", review: "审核通过", follow: "未跟进", reviewer: "林楠",
    city: "成都", teamSize: "6人", model: "暂不确定", scope: "AI短剧制作、角色资产管理、后期包装",
    portfolio: "https://example.com/portfolio/cd", source: "OPC社区-申请创建", consent: "已同意"
  }
];

const waterfallRows = [
  {
    id: "10918", application: "容量万相", type: "生态创新中心", title: "容量短剧产业协同网络",
    mediaType: "图片", image: "../ecology-map-redesign/assets/ecosystem-hero.jpg",
    jump: "https://hongjuan303.github.io/html-prototypes/ecology-map-redesign/", start: "2026-08-22 00:00", end: "2026-12-31 23:59", version: "国内"
  },
  {
    id: "10917", application: "容量万相", type: "生态创新中心", title: "雁荡山杯文旅OPC技能大赛",
    mediaType: "图片", image: "../ecology-innovation-center-v2/assets/banner-yandang-competition-v2.png",
    jump: "https://www.data0086.com", start: "2026-08-22 00:00", end: "2026-10-31 23:59", version: "国内"
  },
  {
    id: "10915", application: "AI漫剧", type: "首页轮播", title: "Seedance 2.5｜动态叙事，再进化",
    mediaType: "图片", image: "../ai-drama-website-optimization/assets/banner-seedance-2-5.png",
    jump: "不跳转", start: "2026-08-04 18:00", end: "2026-10-31 23:59", version: "国内"
  }
];

const state = {
  page: location.hash.slice(1) || "applications",
  applicationType: "全部",
  waterfallApplication: "容量万相",
  waterfallType: "生态创新中心",
  contentVersion: "国内"
};

const prototype = document.getElementById("prototype");
const docsPanel = document.getElementById("docsPanel");
const modalLayer = document.getElementById("modalLayer");
const modal = modalLayer.querySelector(".modal");
const modalTitle = document.getElementById("modalTitle");
const modalBody = document.getElementById("modalBody");
const modalFooter = document.getElementById("modalFooter");
const toast = document.getElementById("toast");

function icon(name) { return `<i data-lucide="${name}" aria-hidden="true"></i>`; }
function refreshIcons() { if (window.lucide) window.lucide.createIcons({ attrs: { "stroke-width": 1.8 } }); }
function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => toast.classList.remove("show"), 2100);
}

function renderNav() {
  document.getElementById("sideNav").innerHTML = `
    <section class="menu-group">
      <div class="menu-title">${icon("network")}生态创新中心${icon("chevron-up").replace('<i ','<i class="chevron" ')}</div>
      <div class="submenu-title">申请管理</div>
      <button class="menu-item ${state.page === "applications" ? "active" : ""}" data-page="applications">生态合作申请</button>
    </section>
    <section class="menu-group">
      <div class="menu-title">${icon("briefcase-business")}产品运营${icon("chevron-up").replace('<i ','<i class="chevron" ')}</div>
      <div class="submenu-title">内容运营</div>
      <button class="menu-item ${state.page === "waterfall" ? "active" : ""}" data-page="waterfall">瀑布流轮播图</button>
    </section>`;

  const page = pages[state.page];
  document.getElementById("breadcrumb").innerHTML = `${page.group.replaceAll(" / ", " <span>/</span> ")} <span>/</span> <strong>${page.label}</strong>`;
  document.getElementById("tabbar").innerHTML = ["applications", "waterfall"].map(key => `<button class="page-tab ${state.page === key ? "active" : ""}" data-page="${key}"><span>${pages[key].label}</span><span>×</span></button>`).join("");
}

function selectControl(label, options, selected, data = "") {
  return `<div class="field-inline"><label>${label}</label><select class="control" ${data}>${options.map(item => `<option ${selected === item ? "selected" : ""}>${item}</option>`).join("")}</select></div>`;
}

function inputControl(label, placeholder, exact = false) {
  return `<div class="field-inline"><label>${label}</label><input class="control" type="text" placeholder="${placeholder}" ${exact ? "inputmode=\"numeric\"" : ""}></div>`;
}

function filterPanel(content) {
  return `<section class="content-card filter-card"><div class="filter-panel">${content}</div><div class="filter-actions"><button class="button primary" type="button" data-search>${icon("search")}查询</button><button class="button" type="button" data-reset>重置</button></div></section>`;
}

function pagination(total) {
  const pages = Math.max(1, Math.ceil(total / 10));
  const pageButtons = pages <= 3
    ? Array.from({ length: pages }, (_, index) => `<button class="${index === 0 ? "active" : ""}">${index + 1}</button>`).join("")
    : `<button class="active">1</button><button>2</button><button>3</button><span>…</span><button>${pages}</button>`;
  return `<div class="pagination"><span>共 ${total} 条</span><select class="page-size"><option>10条/页</option><option>20条/页</option></select><button>‹</button>${pageButtons}<button>›</button><span>前往</span><input class="jump-input" value="1" aria-label="页码"><span>页</span></div>`;
}

function statusTag(value, type) {
  const map = {
    "待审核": "warning", "审核通过": "success", "审核拒绝": "danger", "无需审核": "neutral",
    "未跟进": "neutral", "跟进中": "processing", "已转化": "success", "无效": "neutral"
  };
  return `<span class="status-tag ${map[value] || type || "neutral"}">${value}</span>`;
}

function applicationTabs() {
  const items = ["全部", "OPC社区", "精品短剧", "产业空间", "校企合作"];
  return `<div class="section-tabs">${items.map(item => `<button class="section-tab ${state.applicationType === item ? "active" : ""}" type="button" data-application-type="${item}">${item}</button>`).join("")}</div>`;
}

function applicationsPage() {
  const rows = applicationRows.filter(row => state.applicationType === "全部" || row.type === state.applicationType);
  const filterItems = [
    inputControl("申请ID", "请输入申请ID", true),
    selectControl("申请类型", ["全部", "OPC社区", "精品短剧", "产业空间", "校企合作"], state.applicationType, "data-application-filter"),
    inputControl("申请对象", "项目/城市/院校，模糊搜索"),
    inputControl("联系人", "请输入联系人或手机号")
  ];
  if (["全部", "OPC社区"].includes(state.applicationType)) filterItems.push(selectControl("OPC审核状态", ["全部", "待审核", "审核通过", "审核拒绝"], "全部"));
  filterItems.push(selectControl("跟进状态", ["全部", "未跟进", "跟进中", "已转化", "无效"], "全部"));
  filterItems.push(`<div class="field-inline date-field"><label>提交时间</label><div class="date-range"><input class="control" type="text" placeholder="开始日期"><span>至</span><input class="control" type="text" placeholder="结束日期"></div></div>`);
  const filter = filterItems.join("");

  return `${applicationTabs()}
    ${filterPanel(filter)}
    <section class="content-card">
      <div class="toolbar"><button class="button" type="button" data-action="export">${icon("download")}导出</button><span class="toolbar-note">手机号默认脱敏，查看完整信息需进入详情</span></div>
      <div class="table-wrap application-table"><table>
        <colgroup><col style="width:104px"><col style="width:110px"><col style="width:190px"><col style="width:170px"><col style="width:82px"><col style="width:112px"><col style="width:136px"><col style="width:92px"><col style="width:88px"><col style="width:74px"><col style="width:158px"></colgroup>
        <thead><tr><th>申请ID</th><th>申请类型</th><th>申请对象</th><th>团队/公司</th><th>联系人</th><th>联系电话</th><th>提交时间</th><th>审核状态</th><th>跟进状态</th><th>审核人</th><th class="sticky-operation">操作</th></tr></thead>
        <tbody>${rows.map(row => `<tr>
          <td>${row.id}</td><td><span class="type-tag">${row.type}</span></td><td class="text-left ellipsis" title="${row.subject}">${row.subject}</td><td class="text-left ellipsis" title="${row.organization}">${row.organization}</td><td>${row.contact}</td><td>${row.phone}</td><td>${row.submitTime}</td><td>${statusTag(row.review)}</td><td>${statusTag(row.follow)}</td><td>${row.reviewer}</td>
          <td class="sticky-operation"><div class="operations"><button class="button text" data-action="application-detail" data-id="${row.id}">详情</button>${row.type === "OPC社区" && row.review === "待审核" ? `<button class="button text" data-action="application-review" data-id="${row.id}">审核</button>` : ""}</div></td>
        </tr>`).join("")}</tbody>
      </table></div>${pagination(state.applicationType === "全部" ? 64 : Math.max(rows.length, 8))}
    </section>`;
}

function contentVersionTabs() {
  return `<div class="content-version-tabs" role="tablist">${["国内", "海外"].map(version => `<button class="content-version-tab ${state.contentVersion === version ? "active" : ""}" data-content-version="${version}" type="button">${version}</button>`).join("")}</div>`;
}

function waterfallPage() {
  const rows = waterfallRows.filter(row => row.version === state.contentVersion && row.type === state.waterfallType && (state.waterfallApplication === "全部" || row.application === state.waterfallApplication));
  const filter = selectControl("选择应用", ["全部", "AI漫剧", "容量万相", "其他"], state.waterfallApplication, "data-waterfall-application") + selectControl("类型", ["其他", "首页轮播", "优质作品", "素材展览", "生态创新中心"], state.waterfallType, "data-waterfall-type");
  return `${filterPanel(filter)}${contentVersionTabs()}
    <section class="content-card">
      <div class="toolbar"><button class="button primary" data-action="banner-add">${icon("plus")}添加</button><button class="button" data-action="refresh">${icon("refresh-cw")}刷新缓存</button><button class="button" data-action="sort">${icon("arrow-up-down")}排序</button></div>
      <div class="table-wrap"><table class="banner-table"><colgroup><col style="width:72px"><col style="width:105px"><col style="width:138px"><col style="width:220px"><col style="width:86px"><col style="width:130px"><col style="width:220px"><col style="width:140px"><col style="width:140px"><col style="width:115px"></colgroup>
      <thead><tr><th>ID</th><th>选择应用</th><th>类型</th><th>标题</th><th>素材类型</th><th>素材</th><th>跳转方式</th><th>开始时间</th><th>结束时间</th><th>操作</th></tr></thead>
      <tbody>${rows.length ? rows.map(row => `<tr><td>${row.id}</td><td>${row.application}</td><td><span class="type-tag ecology">${row.type}</span></td><td class="text-left ellipsis" title="${row.title}">${row.title}</td><td>${row.mediaType}</td><td><div class="media-thumb wide-thumb"><img src="${row.image}" alt="${row.title}"></div></td><td class="text-left ellipsis" title="${row.jump}">${row.jump}</td><td>${row.start}</td><td>${row.end}</td><td><div class="operations"><button class="button text" data-action="banner-edit" data-id="${row.id}">修改</button><button class="button text danger-link" data-action="banner-delete" data-id="${row.id}">删除</button></div></td></tr>`).join("") : `<tr><td colspan="10"><div class="empty-state">${icon("inbox")}<span>当前类型暂无配置</span></div></td></tr>`}</tbody></table></div>${pagination(rows.length || 0)}
    </section>`;
}

const docs = {
  applications: `<h2>#页面说明</h2>
    <ul><li><b>菜单路径：</b>绿台 &gt; 生态创新中心 &gt; 申请管理 &gt; 生态合作申请。</li><li><b>使用对象：</b>内容业务、生态合作运营及审核人员。</li><li>承接生态创新中心前台产生的OPC社区、精品短剧、产业空间及校企合作申请。</li></ul>
    <h3>#原型说明</h3>
    <h4>● 业务规则</h4><ul><li>用户提交成功后，绿台自动生成唯一申请ID，跟进状态默认为“未跟进”。</li><li>仅OPC社区申请需要审核，初始审核状态为“待审核”；审核操作记录审核人、审核时间、审核结论和备注。</li><li>精品短剧、产业空间、校企合作无需审核，审核状态展示“无需审核”，提交后直接进入业务跟进。</li><li>OPC社区审核通过后仍需业务人员发起合作跟进。</li></ul>
    <h4>○ 申请类型</h4><ul><li><code>OPC社区</code>：申请加入或创建城市社区，展示团队、城市、人数、业务范围和代表作品。</li><li><code>精品短剧</code>：承接精准项目“我要合作”，展示项目名称、合作主体、项目介绍及合作诉求。</li><li><code>产业空间</code>：展示空间名称、城市、可承载规模和产业资源。</li><li><code>校企合作</code>：展示院校、合作方向、覆盖人数及课程/项目诉求。</li></ul>
    <h4>○ 筛选项</h4><ul><li>申请ID为精确搜索；申请对象为模糊搜索。</li><li>申请类型、OPC审核状态、跟进状态均为下拉单选。</li><li>OPC审核状态仅在“全部、OPC社区”视图展示；切换至其他申请类型时隐藏。</li><li>提交时间支持开始日期与结束日期组合查询。</li></ul>
    <h4>○ 列表项</h4><ul><li>列表展示申请ID、申请类型、申请对象、团队/公司、联系人、联系电话、提交时间、审核状态、跟进状态和审核人。</li><li>联系电话默认脱敏，进入详情且具备权限后才展示完整号码。</li></ul>
    <h4>○ 操作项</h4><ul><li><code>详情</code>：展示本次提交的完整信息、来源入口及隐私授权状态。</li><li><code>审核</code>：仅OPC社区的待审核记录展示；支持审核通过或拒绝，拒绝时必填原因。</li><li><code>导出</code>：按当前筛选结果导出，需校验导出权限并记录操作日志。</li></ul>
    <h4>○ 数据与权限</h4><ul><li>申请数据写入后台数据库，不以浏览器缓存作为正式数据源。</li><li>详情、审核、导出分开配置权限；手机号等个人信息应脱敏展示、加密存储。</li><li>记录查看、审核、导出等关键操作日志，便于问题追溯。</li></ul>`,
  waterfall: `<h2>#页面说明</h2>
    <ul><li><b>菜单路径：</b>绿台 &gt; 产品运营 &gt; 内容运营 &gt; 瀑布流轮播图。</li><li><b>使用对象：</b>内容业务及产品运营。</li><li>本次在现有页面增加生态创新中心Banner配置能力，不新增独立Banner菜单。</li></ul>
    <h3>#原型说明</h3>
    <h4>● 修改记录</h4><p><span class="change-date">2026-08-21</span> <span class="change-copy">“类型”新增枚举“生态创新中心”，用于配置容量万相生态创新中心前台Banner。</span></p>
    <h4>○ 筛选项</h4><ul><li><code>选择应用</code>：选择“容量万相”。</li><li><code>类型</code>：原枚举“其他、首页轮播、优质作品、素材展览”基础上新增“生态创新中心”。</li><li><code>国内/海外</code>：按内容版本分别维护；本期生态创新中心仅使用国内配置。</li></ul>
    <h4>○ 配置字段</h4><ul><li>标题：必填，最多100字符。</li><li>素材类型：图片或视频；图片建议1920×560，视频需上传可播放文件。</li><li>跳转方式：不跳转或跳转网页；跳转网页时必填完整链接。</li><li>开始时间、结束时间：必填，精确到分钟；结束时间必须晚于开始时间。</li></ul>
    <h4>○ 操作项</h4><ul><li><code>添加/修改</code>：打开轮播配置弹窗，保存后进入当前类型列表。</li><li><code>刷新缓存</code>：配置生效后刷新前台缓存。</li><li><code>排序</code>：调整同类型Banner的轮播顺序。</li><li><code>删除</code>：二次确认后删除，不可恢复。</li></ul>`
};

function render() {
  if (!pages[state.page]) state.page = "applications";
  renderNav();
  prototype.innerHTML = state.page === "applications" ? applicationsPage() : waterfallPage();
  docsPanel.innerHTML = docs[state.page];
  bindInteractions();
  refreshIcons();
  window.scrollTo({ top: 0, behavior: "instant" });
}

function bindInteractions() {
  document.querySelectorAll("[data-page]").forEach(button => button.addEventListener("click", () => {
    state.page = button.dataset.page;
    location.hash = state.page;
    render();
  }));
  document.querySelectorAll("[data-application-type]").forEach(button => button.addEventListener("click", () => {
    state.applicationType = button.dataset.applicationType;
    render();
  }));
  const applicationFilter = document.querySelector("[data-application-filter]");
  if (applicationFilter) applicationFilter.addEventListener("change", () => {
    state.applicationType = applicationFilter.value;
    render();
  });
  const waterfallType = document.querySelector("[data-waterfall-type]");
  if (waterfallType) waterfallType.addEventListener("change", () => {
    state.waterfallType = waterfallType.value;
    render();
  });
  const waterfallApplication = document.querySelector("[data-waterfall-application]");
  if (waterfallApplication) waterfallApplication.addEventListener("change", () => {
    state.waterfallApplication = waterfallApplication.value;
    render();
  });
  document.querySelectorAll("[data-content-version]").forEach(button => button.addEventListener("click", () => {
    state.contentVersion = button.dataset.contentVersion;
    render();
    showToast(`已切换至${state.contentVersion}内容`);
  }));
  document.querySelectorAll("[data-search]").forEach(button => button.addEventListener("click", () => showToast("查询完成，列表已更新")));
  document.querySelectorAll("[data-reset]").forEach(button => button.addEventListener("click", () => {
    if (state.page === "applications") state.applicationType = "全部";
    if (state.page === "waterfall") {
      state.waterfallApplication = "容量万相";
      state.waterfallType = "生态创新中心";
    }
    render();
    showToast("筛选条件已重置");
  }));
  document.querySelectorAll("[data-action]").forEach(button => button.addEventListener("click", () => handleAction(button.dataset.action, button.dataset.id)));
}

function handleAction(action, id) {
  const row = applicationRows.find(item => item.id === id);
  if (action === "application-detail") return openApplicationDetail(row);
  if (action === "application-review") return openReview(row);
  if (action === "export") return showToast("已按当前筛选条件生成导出任务");
  if (action === "banner-add" || action === "banner-edit") return openBannerForm(action === "banner-edit", id);
  if (action === "banner-delete") return confirmModal("删除轮播图配置", `确认删除ID ${id} 的轮播图配置？删除后不可恢复。`, "danger", () => showToast("删除成功"));
  if (action === "refresh") return showToast("缓存刷新成功");
  if (action === "sort") return showToast("已进入拖拽排序模式");
}

function displayItem(label, value, full = false, html = false) {
  return `<div class="detail-field ${full ? "full" : ""}"><span>${label}</span><strong>${html ? value : String(value)}</strong></div>`;
}

function openApplicationDetail(row) {
  const isOpc = row.type === "OPC社区";
  const body = `<div class="detail-status-line"><div><span>申请ID</span><strong>${row.id}</strong></div><div>${statusTag(row.review)} ${statusTag(row.follow)}</div></div>
    <section class="detail-section"><h3>基础信息</h3><div class="detail-grid">
      ${displayItem("申请类型", row.type)}${displayItem("申请对象", row.subject)}${displayItem("团队/公司", row.organization)}${displayItem("所在城市", row.city)}
      ${displayItem("联系人", row.contact)}${displayItem("联系电话", row.phone.replace("****", "2865"))}${displayItem("团队/承载规模", row.teamSize)}${displayItem("意向合作模式", row.model)}
      ${displayItem("业务范围 / 合作诉求", row.scope, true)}${displayItem("代表作品 / 附件", `<a class="detail-link" href="#">${row.portfolio}</a>`, true, true)}
    </div></section>
    <section class="detail-section"><h3>${isOpc ? "提交与审核" : "提交信息"}</h3><div class="detail-grid">
      ${displayItem("提交入口", row.source)}${displayItem("提交时间", row.submitTime)}${displayItem("隐私授权", row.consent)}${isOpc ? displayItem("审核人", row.reviewer) : ""}
    </div></section>`;
  openModal("生态合作申请详情", body, `<button class="button" data-modal-cancel>关闭</button>${isOpc && row.review === "待审核" ? `<button class="button primary" data-detail-review="${row.id}">审核</button>` : ""}`, "extra-wide");
  const reviewButton = modalFooter.querySelector("[data-detail-review]");
  if (reviewButton) reviewButton.addEventListener("click", () => openReview(row));
}

function openReview(row) {
  if (row.type !== "OPC社区") return;
  const body = `<div class="review-subject"><span>${row.type}</span><strong>${row.subject}</strong><small>申请ID：${row.id} · ${row.organization}</small></div>
    <div class="form-grid single-form">
      <div class="form-item full"><label class="required">审核结果</label><div class="radio-row"><label><input type="radio" name="reviewResult" value="审核通过" checked> 审核通过</label><label><input type="radio" name="reviewResult" value="审核拒绝"> 审核拒绝</label></div></div>
      <div class="form-item full" data-reject-field hidden><label class="required">拒绝原因</label><select class="control"><option>申请资料不完整</option><option>联系方式无效</option><option>不符合当前合作范围</option><option>其他</option></select></div>
      <div class="form-item full"><label>审核备注</label><textarea class="control" maxlength="500" placeholder="请输入审核备注，最多500字"></textarea><p class="hint">审核记录保存后不可删除</p></div>
    </div>`;
  openModal("审核OPC社区申请", body, `<button class="button" data-modal-cancel>取消</button><button class="button primary" data-review-submit>确认审核</button>`, "wide");
  const rejectField = modalBody.querySelector("[data-reject-field]");
  modalBody.querySelectorAll("input[name=reviewResult]").forEach(input => input.addEventListener("change", () => { rejectField.hidden = input.value !== "审核拒绝"; }));
  modalFooter.querySelector("[data-review-submit]").addEventListener("click", () => {
    const result = modalBody.querySelector("input[name=reviewResult]:checked").value;
    row.review = result;
    row.reviewer = "洪娟";
    closeModal();
    render();
    showToast(`申请已${result === "审核通过" ? "通过" : "拒绝"}`);
  });
}

function formItem(label, content, full = false, required = true) {
  return `<div class="form-item ${full ? "full" : ""}"><label class="${required ? "required" : ""}">${label}</label>${content}</div>`;
}

function input(value = "", placeholder = "请输入") { return `<input class="control" value="${value}" placeholder="${placeholder}">`; }

function openBannerForm(edit, id) {
  const row = waterfallRows.find(item => item.id === id) || {};
  const selectedApplication = row.application || state.waterfallApplication;
  const selectedType = row.type || state.waterfallType;
  const body = `${formItem("选择应用", `<select class="control">${["容量万相", "AI漫剧", "其他"].map(item => `<option ${item === selectedApplication ? "selected" : ""}>${item}</option>`).join("")}</select>`)}
    ${formItem("类型", `<select class="control">${["生态创新中心", "首页轮播", "优质作品", "素材展览", "其他"].map(item => `<option ${item === selectedType ? "selected" : ""}>${item}</option>`).join("")}</select>`)}
    ${formItem("标题", input(edit ? row.title : "", "最多100字符"), true)}
    ${formItem("素材类型", `<div class="radio-row"><label><input type="radio" name="media" checked> 图片</label><label><input type="radio" name="media"> 视频</label></div>`)}
    ${formItem("素材", `<button class="upload-box" type="button">${icon("image-up")}<span>上传Banner素材</span><small>图片建议尺寸 1920×560</small></button>`)}
    ${formItem("跳转方式", `<select class="control" data-jump><option ${row.jump === "不跳转" ? "selected" : ""}>不跳转</option><option ${row.jump && row.jump !== "不跳转" ? "selected" : ""}>跳转网页</option></select>`)}
    <div class="form-item" data-jump-url ${row.jump && row.jump !== "不跳转" ? "" : "hidden"}><label class="required">网页链接</label>${input(row.jump && row.jump !== "不跳转" ? row.jump : "", "请输入完整网页链接")}</div>
    ${formItem("开始时间", `<input class="control" type="datetime-local" value="2026-08-22T00:00">`)}
    ${formItem("结束时间", `<input class="control" type="datetime-local" value="2026-12-31T23:59">`)}`;
  openModal(edit ? "修改轮播图配置" : "添加轮播图配置", `<div class="form-grid">${body}</div>`, `<button class="button" data-modal-cancel>取消</button><button class="button primary" data-banner-submit>确定</button>`, "extra-wide");
  const jumpSelect = modalBody.querySelector("[data-jump]");
  const jumpField = modalBody.querySelector("[data-jump-url]");
  jumpSelect.addEventListener("change", () => { jumpField.hidden = jumpSelect.value !== "跳转网页"; });
  modalFooter.querySelector("[data-banner-submit]").addEventListener("click", () => { closeModal(); showToast("轮播图配置保存成功"); });
}

function openModal(title, body, footer, size = "") {
  modal.className = `modal ${size}`.trim();
  modalTitle.textContent = title;
  modalBody.innerHTML = body;
  modalFooter.innerHTML = footer;
  modalLayer.hidden = false;
  document.body.style.overflow = "hidden";
  modalFooter.querySelectorAll("[data-modal-cancel]").forEach(button => button.addEventListener("click", closeModal));
  refreshIcons();
}

function confirmModal(title, copy, kind, onConfirm) {
  const body = `<div class="confirm-copy"><span class="confirm-icon ${kind === "danger" ? "danger" : ""}">${icon(kind === "danger" ? "trash-2" : "circle-alert")}</span><h3>${title}</h3><p>${copy}</p></div>`;
  const footer = `<button class="button" data-modal-cancel>取消</button><button class="button ${kind === "danger" ? "danger" : "primary"}" data-modal-confirm>${kind === "danger" ? "删除" : "确认"}</button>`;
  openModal(title, body, footer);
  modalFooter.querySelector("[data-modal-confirm]").addEventListener("click", () => { closeModal(); onConfirm(); });
}

function closeModal() {
  modalLayer.hidden = true;
  document.body.style.overflow = "";
}

document.getElementById("modalClose").addEventListener("click", closeModal);
modalLayer.addEventListener("click", event => { if (event.target === modalLayer) closeModal(); });
document.addEventListener("keydown", event => { if (event.key === "Escape" && !modalLayer.hidden) closeModal(); });
window.addEventListener("hashchange", () => {
  const page = location.hash.slice(1);
  if (pages[page] && page !== state.page) { state.page = page; render(); }
});

render();
