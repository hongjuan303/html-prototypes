const pages = {
  applications: { label: "生态创新中心", group: "产品运营 / 内容运营 / AI漫剧官网配置" },
  waterfall: { label: "瀑布流轮播图", group: "产品运营 / 内容运营" }
};

const applicationSchema = window.APPLICATION_SCHEMA;
const applicationContract = window.ApplicationContract;
// Independent, fictional snapshots. No data is read from the public website or sent to a server.
const applicationRows = [
  { id: "260911001", formType: "opc", direction: "杭州OPC社区", submittedAt: "2026-09-11 10:26", review: "待审核", fields: { identity: "个人创作者", name: "林小禾（演示）", phone: "13800000001", wechat: "demo_lin", bio: "关注城市生活题材，擅长 AI 分镜与短剧剪辑。", opcRegistration: "需要协助咨询注册", plannedTeamSize: "1人（独立个人创作）", physicalSpace: "是", workstations: "1", expertise: ["AI漫剧", "译配出海"], hasWorks: "有", portfolioLink: "https://example.com/demo-portfolio", portfolioFile: "个人作品集（演示）.pdf", projectTypes: ["精品项目", "赛事创作任务"], resources: ["IP授权", "工商注册咨询"] } },
  { id: "260911002", formType: "opc", direction: "永嘉人工智能创新应用中心", submittedAt: "2026-09-11 09:40", review: "待审核", fields: { identity: "创作团队 / 企业", company: "星禾创作工作室（演示）", contact: "陈小舟", phone: "13800000002", wechat: "demo_xinghe", creditCode: "DEMO-仅用于原型展示", teamSize: "8", capability: "分镜、角色资产、AI 漫剧制作与后期合成全流程协作。", portfolioLink: "https://example.com/demo-team", portfolioFile: "团队能力介绍（演示）.pdf", expertise: ["AI漫剧", "精品剧"], projectTypes: ["产业订单", "IP联合开发"], resources: ["IP素材授权", "场地工位"], physicalSpace: "是", workstations: "8" } },
  { id: "260910003", formType: "opc", direction: "成都OPC社区", submittedAt: "2026-09-10 17:15", review: "审核通过", reviewer: "演示审核员", reviewedAt: "2026-09-10 18:30", reviewNote: "资料核对完成，进入后续对接。", fields: { identity: "个人创作者", name: "顾小雨（演示）", phone: "13800000003", wechat: "demo_gu", bio: "", opcRegistration: "暂不需要，以个人身份参与", plannedTeamSize: "2-3人（小型协作小组）", physicalSpace: "否，仅线上参与生态", expertise: ["运营", "培训教育"], hasWorks: "无", projectTypes: ["产业订单"], resources: [] } },
  { id: "260910004", formType: "opc", direction: "上海OPC社区", submittedAt: "2026-09-10 15:48", review: "审核拒绝", reviewer: "演示审核员", reviewedAt: "2026-09-10 16:10", rejectReason: "申请资料不完整", reviewNote: "请补充可评估的核心能力介绍后重新申请。", fields: { identity: "创作团队 / 企业", company: "青岸影像团队（演示）", contact: "周小言", phone: "13800000004", wechat: "demo_qingan", creditCode: "DEMO-示例代码", teamSize: "5", capability: "正在组建 AI 内容团队。", portfolioLink: "", portfolioFile: "", expertise: ["教育培训"], projectTypes: [], resources: [], physicalSpace: "否，仅线上参与生态" } },
  { id: "260910005", formType: "opc", direction: "", submittedAt: "2026-09-10 13:02", review: "待审核", fields: { identity: "个人创作者", name: "叶小川（演示）", phone: "13800000005", wechat: "demo_ye", bio: "数字媒体艺术毕业，计划参加短剧项目。", opcRegistration: "暂不需要，以个人身份参与", plannedTeamSize: "1人（独立个人创作）", physicalSpace: "否，仅线上参与生态", expertise: ["精品剧"], hasWorks: "有", portfolioLink: "", portfolioFile: "", projectTypes: [], resources: ["订单对接"] } },
  { id: "260909006", formType: "opc", direction: "深圳OPC社区", submittedAt: "2026-09-09 11:20", review: "待审核", fields: { identity: "创作团队 / 企业", company: "南风内容工作室（演示）", contact: "韩小宁", phone: "13800000006", wechat: "demo_nanfeng", creditCode: "DEMO-示例代码", teamSize: "12", capability: "聚焦 AI 仿真人剧制作与海外发行。", portfolioLink: "", portfolioFile: "发行作品目录（演示）.pdf", expertise: ["AI仿真人剧", "发行"], projectTypes: ["产业订单", "赛事创作"], resources: ["发行推广"], physicalSpace: "是", workstations: "" } },
  { id: "260911007", formType: "drama", direction: "《山海有信》文旅短剧", submittedAt: "2026-09-11 10:08", fields: { entityType: "地方文旅/事业单位", entityName: "山海文旅中心（演示）", contact: "赵小宁", phone: "13800000007", email: "demo-tourism@example.com", wechat: "demo_tourism", cooperationTypes: ["文旅定制", "城市形象宣传"], region: "浙江省温州市永嘉县", intent: "以本地山水、传统村落为背景，共创城市文旅微短剧。\n希望对接内容策划与联合制作团队。", cases: "往期文旅宣传短片合作（演示说明）" } },
  { id: "260910008", formType: "drama", direction: "精品内容合作", submittedAt: "2026-09-10 14:30", fields: { entityType: "创作团队", entityName: "纸鸢内容团队（演示）", contact: "方小知", phone: "13800000008", email: "demo-kite@example.com", wechat: "", cooperationTypes: ["非遗主题", "IP联合开发共创"], region: "江苏省苏州市", intent: "围绕传统手艺，开发年轻化非遗主题内容。", cases: "" } },
  { id: "260911009", formType: "school", direction: "人工智能影视实践专班", submittedAt: "2026-09-11 08:50", fields: { school: "星海传媒学院（演示）", department: "动画与数字艺术学院", contact: "徐老师", position: "实践教学负责人", phone: "13800000009", email: "demo-academy@example.com", wechat: "demo_teacher", cooperationModes: ["共建AI影视项目实践班", "联合开发课程/教学案例库"], studentMajors: "数字媒体艺术，本科大二至大四", studentScale: "120", foundation: "已配备数字影像实验室，希望引入真实产业项目和行业导师。", resources: ["产业项目订单供给", "行业导师进课堂"], attachment: "院系实践教学介绍（演示）.pdf" } },
  { id: "260909010", formType: "school", direction: "校企合作", submittedAt: "2026-09-09 15:12", fields: { school: "云岭数字艺术学院（演示）", department: "影视创作系", contact: "唐老师", position: "系主任", phone: "13800000010", email: "demo-art@example.com", wechat: "", cooperationModes: ["学生实训实习、团队接单通道"], studentMajors: "", studentScale: "", foundation: "", resources: ["AI智能体/算力资源开放"], attachment: "" } }
];

const waterfallRows = [
  {
    id: "10918", application: "AI漫剧", type: "生态创新中心", title: "容量短剧产业协同网络",
    mediaType: "图片", image: "../ecology-map-redesign/assets/ecosystem-hero.jpg",
    jump: "https://hongjuan303.github.io/html-prototypes/ecology-map-redesign/", start: "2026-08-22 00:00", end: "2026-12-31 23:59", version: "国内"
  },
  {
    id: "10917", application: "AI漫剧", type: "生态创新中心", title: "雁荡山杯文旅OPC技能大赛",
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
  applicationType: "opc",
  applicationFilters: {},
  applicationPage: 1,
  applicationPageSize: 5,
  waterfallApplication: "AI漫剧",
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
function escapeHtml(value) { return String(value ?? "").replace(/[&<>"']/g, character => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[character])); }
function numbered(value) { return `<span class="prototype-number">${value}</span>`; }
function valueText(value, fallback = "—") { return value === undefined || value === null || value === "" || (Array.isArray(value) && !value.length) ? fallback : Array.isArray(value) ? value.join("、") : String(value); }
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
      <div class="menu-title">${icon("briefcase-business")}产品运营${icon("chevron-up").replace('<i ','<i class="chevron" ')}</div>
      <div class="submenu-title">内容运营</div>
      <button class="menu-item ${state.page === "waterfall" ? "active" : ""}" data-page="waterfall">瀑布流轮播图</button>
      <div class="submenu-title nested">AI漫剧官网配置</div>
      <button class="menu-item deep ${state.page === "applications" ? "active" : ""}" data-page="applications">生态创新中心</button>
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
  return `<div class="section-tabs application-tabs" role="tablist" aria-label="申请类型">${numbered(1)}${Object.entries(applicationSchema).map(([key, item]) => `<button class="section-tab ${state.applicationType === key ? "active" : ""}" role="tab" aria-selected="${state.applicationType === key}" type="button" data-application-type="${key}">${item.label}<span class="tab-count">${applicationRows.filter(row => row.formType === key).length}</span></button>`).join("")}</div>`;
}

function matchingApplications() {
  const schema = applicationSchema[state.applicationType];
  return applicationRows.filter(row => row.formType === state.applicationType && schema.filters.every(item => {
    if (item.control === "date-range") {
      const day = row.submittedAt.slice(0, 10);
      return (!state.applicationFilters.startDate || day >= state.applicationFilters.startDate) && (!state.applicationFilters.endDate || day <= state.applicationFilters.endDate);
    }
    const query = state.applicationFilters[item.key];
    if (!query) return true;
    const value = applicationContract.getValue(row, item.sourceKey);
    if (item.match === "includes") return Array.isArray(value) && value.includes(query);
    if (item.match === "exact") return String(value ?? "") === query;
    return valueText(value, "").toLocaleLowerCase().includes(query.toLocaleLowerCase());
  })).sort((a, b) => b.submittedAt.localeCompare(a.submittedAt) || b.id.localeCompare(a.id));
}

function applicationFilterControl(item) {
  const selected = state.applicationFilters[item.key] || "";
  if (item.control === "date-range") return `<div class="field-inline application-date-field"><label>提交时间</label><div class="date-range"><input class="control" type="date" name="startDate" aria-label="提交开始日期" value="${escapeHtml(state.applicationFilters.startDate || "")}"><span>至</span><input class="control" type="date" name="endDate" aria-label="提交结束日期" value="${escapeHtml(state.applicationFilters.endDate || "")}"></div></div>`;
  const id = `filter-${item.key}`;
  return `<div class="field-inline"><label for="${id}">${item.label}</label>${item.control === "select" ? `<select class="control" id="${id}" name="${item.key}"><option value="">全部</option>${item.options.map(option => `<option value="${escapeHtml(option)}" ${option === selected ? "selected" : ""}>${escapeHtml(option)}</option>`).join("")}</select>` : `<input class="control" id="${id}" name="${item.key}" type="${item.control}" value="${escapeHtml(selected)}" placeholder="${item.control === "tel" ? "完整11位手机号" : `请输入${item.label}`}" ${item.control === "tel" ? 'inputmode="numeric" maxlength="11"' : 'maxlength="100"'}>`}</div>`;
}

function applicationPagination(total) {
  const pageCount = Math.max(1, Math.ceil(total / state.applicationPageSize));
  return `<div class="pagination application-pagination"><span>共 ${total} 条</span><select class="page-size" data-application-page-size aria-label="每页条数">${[5, 10, 20].map(size => `<option value="${size}" ${size === state.applicationPageSize ? "selected" : ""}>${size} 条/页</option>`).join("")}</select><button type="button" data-application-page="${state.applicationPage - 1}" aria-label="上一页" ${state.applicationPage === 1 ? "disabled" : ""}>‹</button>${Array.from({ length: pageCount }, (_, index) => `<button type="button" data-application-page="${index + 1}" class="${state.applicationPage === index + 1 ? "active" : ""}" aria-label="第 ${index + 1} 页">${index + 1}</button>`).join("")}<button type="button" data-application-page="${state.applicationPage + 1}" aria-label="下一页" ${state.applicationPage === pageCount ? "disabled" : ""}>›</button></div>`;
}

function applicationsPage() {
  const schema = applicationSchema[state.applicationType];
  const allRows = matchingApplications();
  state.applicationPage = Math.min(state.applicationPage, Math.max(1, Math.ceil(allRows.length / state.applicationPageSize)));
  const rows = allRows.slice((state.applicationPage - 1) * state.applicationPageSize, state.applicationPage * state.applicationPageSize);
  const isOpc = state.applicationType === "opc";
  const tableWidth = schema.columns.reduce((sum, item) => sum + item.width, 132);
  return `<div class="application-page">${applicationTabs()}
    <form class="content-card filter-card" id="applicationFilters" novalidate><div class="section-heading">${numbered(2)}<h2>筛选项</h2></div><div class="filter-panel application-filter-panel">${schema.filters.map(applicationFilterControl).join("")}</div><p class="filter-error" id="applicationFilterError" role="alert" hidden></p><div class="filter-actions"><button class="button primary" type="submit">${icon("search")}查询</button><button class="button" type="button" data-application-reset>重置</button></div></form>
    <section class="content-card application-results"><div class="section-heading">${numbered(3)}<h2>${schema.label}申请</h2><span class="result-count">${allRows.length} 条结果</span><span class="demo-note">演示数据 · 未接入官网提交</span></div>
      <div class="table-wrap application-table" tabindex="0" aria-label="${schema.label}申请列表，可横向滚动"><table style="min-width:${tableWidth}px"><colgroup>${schema.columns.map(item => `<col style="width:${item.width}px">`).join("")}<col style="width:132px"></colgroup>
      <thead><tr>${schema.columns.map(item => `<th title="${escapeHtml(applicationContract.sourceLabel(item.key, item.source, state.applicationType))}">${item.label}</th>`).join("")}<th class="sticky-operation">${numbered(4)} 操作</th></tr></thead>
      <tbody>${rows.length ? rows.map(row => `<tr>${schema.columns.map(item => {
        const value = applicationContract.getValue(row, item.key, item.source);
        const formatted = item.format === "phone" ? String(value || "").replace(/^(\d{3})\d{4}(\d{4})$/, "$1****$2") : valueText(value);
        return `<td class="text-left ellipsis" title="${escapeHtml(formatted)}">${item.key === "review" ? statusTag(value) : escapeHtml(formatted)}</td>`;
      }).join("")}<td class="sticky-operation"><div class="operations"><button class="button text" type="button" data-action="application-detail" data-id="${row.id}" aria-label="查看申请 ${row.id} 详情">详情</button>${isOpc && row.review === "待审核" ? `<button class="button text" type="button" data-action="application-review" data-id="${row.id}" aria-label="审核申请 ${row.id}">审核</button>` : ""}</div></td></tr>`).join("") : `<tr><td colspan="${schema.columns.length + 1}"><div class="empty-state">${icon("search-x")}<strong>暂无匹配的申请</strong><span>请调整筛选条件后重试</span><button class="button text" type="button" data-application-reset>清空筛选</button></div></td></tr>`}</tbody></table></div>${applicationPagination(allRows.length)}</section></div>`;
}

function contentVersionTabs() {
  return `<div class="content-version-tabs" role="tablist">${["国内", "海外"].map(version => `<button class="content-version-tab ${state.contentVersion === version ? "active" : ""}" data-content-version="${version}" type="button">${version}</button>`).join("")}</div>`;
}

function waterfallPage() {
  const hideVersionTabs = state.waterfallApplication === "AI漫剧" && state.waterfallType === "生态创新中心";
  const rows = waterfallRows.filter(row => (hideVersionTabs || row.version === state.contentVersion) && row.type === state.waterfallType && (state.waterfallApplication === "全部" || row.application === state.waterfallApplication));
  const filter = selectControl("选择应用", ["全部", "AI漫剧", "容量万相", "其他"], state.waterfallApplication, "data-waterfall-application") + selectControl("类型", ["其他", "首页轮播", "优质作品", "素材展览", "生态创新中心"], state.waterfallType, "data-waterfall-type");
  return `${filterPanel(filter)}${hideVersionTabs ? "" : contentVersionTabs()}
    <section class="content-card">
      <div class="toolbar"><button class="button primary" data-action="banner-add">${icon("plus")}添加</button><button class="button" data-action="refresh">${icon("refresh-cw")}刷新缓存</button><button class="button" data-action="sort">${icon("arrow-up-down")}排序</button></div>
      <div class="table-wrap"><table class="banner-table"><colgroup><col style="width:72px"><col style="width:105px"><col style="width:138px"><col style="width:220px"><col style="width:86px"><col style="width:130px"><col style="width:220px"><col style="width:140px"><col style="width:140px"><col style="width:115px"></colgroup>
      <thead><tr><th>ID</th><th>选择应用</th><th>类型</th><th>标题</th><th>素材类型</th><th>素材</th><th>跳转方式</th><th>开始时间</th><th>结束时间</th><th>操作</th></tr></thead>
      <tbody>${rows.length ? rows.map(row => `<tr><td>${row.id}</td><td>${row.application}</td><td><span class="type-tag ecology">${row.type}</span></td><td class="text-left ellipsis" title="${row.title}">${row.title}</td><td>${row.mediaType}</td><td><div class="media-thumb wide-thumb"><img src="${row.image}" alt="${row.title}"></div></td><td class="text-left ellipsis" title="${row.jump}">${row.jump}</td><td>${row.start}</td><td>${row.end}</td><td><div class="operations"><button class="button text" data-action="banner-edit" data-id="${row.id}">修改</button><button class="button text danger-link" data-action="banner-delete" data-id="${row.id}">删除</button></div></td></tr>`).join("") : `<tr><td colspan="10"><div class="empty-state">${icon("inbox")}<span>当前类型暂无配置</span></div></td></tr>`}</tbody></table></div>${pagination(rows.length || 0)}
    </section>`;
}

const docs = {
  applications: window.APPLICATION_PRD_HTML,
  waterfall: `<h2>#页面说明</h2>
    <ul><li><b>菜单路径：</b>绿台 &gt; 产品运营 &gt; 内容运营 &gt; 瀑布流轮播图。</li><li><b>使用对象：</b>内容业务及产品运营。</li><li>本次在现有页面增加生态创新中心Banner配置能力，不新增独立Banner菜单。</li></ul>
    <h3>#原型说明</h3>
    <h4>● 修改记录</h4><p><span class="change-date">2026-08-24</span> <span class="change-copy">选择应用为“AI漫剧”且类型为“生态创新中心”时，隐藏“国内、海外”内容版本Tab。</span></p><p><span class="change-date">2026-08-21</span> <span class="change-copy">类型新增枚举“生态创新中心”。</span></p>
    <h4>○ 筛选项</h4><ul><li><code>选择应用</code>：选择“AI漫剧”。</li><li><code>类型</code>：选择“生态创新中心”。</li><li>满足以上组合时，配置内容不区分国内和海外，页面不展示内容版本Tab。</li><li>切换为其他应用或类型时，仍按原规则展示国内、海外Tab。</li></ul>
    <h4>○ 配置字段</h4><ul><li>标题：必填，最多100字符。</li><li>素材类型：图片或视频；图片建议1920×560，视频需上传可播放文件。</li><li>跳转方式：不跳转或跳转网页；跳转网页时必填完整链接。</li><li>开始时间、结束时间：必填，精确到分钟；结束时间必须晚于开始时间。</li></ul>
    <h4>○ 操作项</h4><ul><li><code>添加/修改</code>：打开轮播配置弹窗，保存后进入当前类型列表。</li><li><code>刷新缓存</code>：配置生效后刷新前台缓存。</li><li><code>排序</code>：调整同类型Banner的轮播顺序。</li><li><code>删除</code>：二次确认后删除，不可恢复。</li></ul>`
};

function render() {
  if (!pages[state.page]) state.page = "applications";
  renderNav();
  prototype.innerHTML = state.page === "applications" ? applicationsPage() : waterfallPage();
  document.body.classList.toggle("application-view", state.page === "applications");
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
    state.applicationFilters = {};
    state.applicationPage = 1;
    render();
  }));
  const applicationFilters = document.getElementById("applicationFilters");
  if (applicationFilters) applicationFilters.addEventListener("submit", event => {
    event.preventDefault();
    const values = Object.fromEntries(Array.from(new FormData(applicationFilters), ([key, value]) => [key, String(value).trim()]));
    const error = document.getElementById("applicationFilterError");
    let message = "";
    if (values.phone && !/^1[3-9]\d{9}$/.test(values.phone)) message = "请输入完整的 11 位中国大陆手机号后查询。";
    if (values.startDate && values.endDate && values.startDate > values.endDate) message = "开始日期不能晚于结束日期，请调整后查询。";
    if (message) { error.hidden = false; error.textContent = message; return; }
    state.applicationFilters = values;
    state.applicationPage = 1;
    render();
    showToast(`查询完成，共 ${matchingApplications().length} 条结果`);
  });
  document.querySelectorAll("[data-application-reset]").forEach(button => button.addEventListener("click", () => {
    state.applicationFilters = {};
    state.applicationPage = 1;
    render();
    showToast("筛选条件已重置");
  }));
  document.querySelectorAll("[data-application-page]").forEach(button => button.addEventListener("click", () => {
    state.applicationPage = Number(button.dataset.applicationPage);
    render();
  }));
  const applicationPageSize = document.querySelector("[data-application-page-size]");
  if (applicationPageSize) applicationPageSize.addEventListener("change", () => {
    state.applicationPageSize = Number(applicationPageSize.value);
    state.applicationPage = 1;
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
    if (state.page === "waterfall") {
      state.waterfallApplication = "AI漫剧";
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
  if (action === "banner-add" || action === "banner-edit") return openBannerForm(action === "banner-edit", id);
  if (action === "banner-delete") return confirmModal("删除轮播图配置", `确认删除ID ${id} 的轮播图配置？删除后不可恢复。`, "danger", () => showToast("删除成功"));
  if (action === "refresh") return showToast("缓存刷新成功");
  if (action === "sort") return showToast("已进入拖拽排序模式");
}

function displayItem(label, value, full = false, html = false) {
  return `<div class="detail-field ${full ? "full" : ""}"><span>${escapeHtml(label)}</span><strong>${html ? value : escapeHtml(valueText(value, "未填写"))}</strong></div>`;
}

function openApplicationDetail(row) {
  if (!row) return;
  const isOpc = row.formType === "opc";
  const schema = applicationSchema[row.formType];
  const fields = applicationContract.getFields(row).filter(item => applicationContract.isApplicable(row, item));
  const groups = [...new Set(fields.map(item => item.group))];
  const detailGroups = groups.map(group => `<section class="detail-section"><h3>${group}<small>官网填写</small></h3><div class="detail-grid">${fields.filter(item => item.group === group).map(item => {
    const value = row.fields[item.key];
    let html = escapeHtml(valueText(value, "未填写"));
    if (item.control === "附件" && value) html = `${escapeHtml(value)}<small class="attachment-note">演示文件名 · 未接入文件存储</small>`;
    if (["portfolioLink", "cases"].includes(item.key) && typeof value === "string" && /^https?:\/\//i.test(value)) html = `<a class="detail-link" href="${escapeHtml(value)}" target="_blank" rel="noopener noreferrer">${escapeHtml(value)} ↗</a>`;
    return `<div class="detail-field ${["多行文本", "多选", "附件"].includes(item.control) || ["portfolioLink", "cases"].includes(item.key) ? "full" : ""}" data-source-field="${item.key}"><span>${item.label}</span><strong>${html}</strong></div>`;
  }).join("")}</div></section>`).join("");
  const reviewDetails = isOpc ? `<section class="detail-section"><h3>审核记录<small>运营填写</small></h3><div class="detail-grid">${displayItem("审核状态", row.review)}${displayItem("审核人", row.reviewer || "尚未审核")}${displayItem("审核时间", row.reviewedAt || "尚未审核")}${displayItem("拒绝原因", row.review === "审核拒绝" ? row.rejectReason : "不适用")}${displayItem("审核备注", row.review === "待审核" ? "尚未审核" : row.reviewNote, true)}</div></section>` : "";
  const body = `<div class="detail-status-line"><div><span>申请 ID</span><strong>${row.id}</strong></div><div>${isOpc ? statusTag(row.review) : `<span>${schema.label}</span>`}</div></div><p class="application-detail-note">以下均为演示资料，非官网真实提交。${isOpc ? "未触发的条件字段不展示；来源社区不等于申请人所在地。" : "仅展示本类申请字段，不设置审核流程。"}</p>
    ${isOpc ? `<section class="detail-section"><h3>申请身份<small>官网填写</small></h3><div class="detail-grid">${displayItem("申请身份", row.fields.identity)}</div></section>` : ""}${detailGroups}
    <section class="detail-section"><h3>来源与提交信息<small>自动带入 / 系统生成</small></h3><div class="detail-grid">${displayItem("申请类型", schema.label)}${displayItem("提交时间", row.submittedAt)}${displayItem("来源对象 / 合作方向", row.direction || "未提供", true)}</div></section>${reviewDetails}`;
  openModal(`${schema.label}申请详情`, body, `<button class="button" data-modal-cancel>关闭</button>${isOpc && row.review === "待审核" ? `<button class="button primary" data-detail-review="${row.id}">审核</button>` : ""}`, "extra-wide application-detail-modal");
  const reviewButton = modalFooter.querySelector("[data-detail-review]");
  if (reviewButton) reviewButton.addEventListener("click", () => openReview(row));
}

function openReview(row) {
  if (!row || row.formType !== "opc" || row.review !== "待审核") return;
  const subject = applicationContract.getValue(row, applicationSchema.opc.columns[2].key);
  const body = `<div class="review-subject"><span>OPC社区</span><strong>${escapeHtml(subject)}</strong><small>申请 ID：${row.id} · ${escapeHtml(row.fields.identity)}</small></div>
    <div class="form-grid single-form">
      <fieldset class="form-item full review-result"><legend class="required">审核结果</legend><div class="radio-row"><label><input type="radio" name="reviewResult" value="审核通过" checked> 审核通过</label><label><input type="radio" name="reviewResult" value="审核拒绝"> 审核拒绝</label></div></fieldset>
      <div class="form-item full" data-reject-field hidden><label for="rejectReason" class="required">拒绝原因</label><select class="control" id="rejectReason"><option value="">请选择拒绝原因</option><option>申请资料不完整</option><option>联系方式无效</option><option>不符合当前合作范围</option><option>其他</option></select></div>
      <div class="form-item full"><label for="reviewNote">审核备注</label><textarea class="control" id="reviewNote" maxlength="500" placeholder="请输入审核备注；拒绝原因选“其他”时必填，最多500字"></textarea><p class="hint">仅保存在当前原型页面，刷新后恢复演示样例；不发送真实审核通知。</p></div>
      <p class="review-error" role="alert" data-review-error hidden></p>
    </div>`;
  openModal("审核 OPC 社区申请", body, `<button class="button" data-modal-cancel>取消</button><button class="button primary" data-review-submit>确认审核</button>`, "wide");
  const rejectField = modalBody.querySelector("[data-reject-field]");
  modalBody.querySelectorAll("input[name=reviewResult]").forEach(input => input.addEventListener("change", () => {
    rejectField.hidden = modalBody.querySelector("input[name=reviewResult]:checked").value !== "审核拒绝";
    modalBody.querySelector("[data-review-error]").hidden = true;
  }));
  modalFooter.querySelector("[data-review-submit]").addEventListener("click", () => {
    const result = modalBody.querySelector("input[name=reviewResult]:checked").value;
    const reason = result === "审核拒绝" ? modalBody.querySelector("#rejectReason").value : "";
    const note = modalBody.querySelector("#reviewNote").value.trim();
    const error = modalBody.querySelector("[data-review-error]");
    if (result === "审核拒绝" && (!reason || (reason === "其他" && !note))) {
      error.hidden = false;
      error.textContent = !reason ? "请选择拒绝原因。" : "拒绝原因选择“其他”时，请填写审核备注。";
      return;
    }
    const confirmation = document.createElement("div");
    confirmation.className = "review-confirmation";
    confirmation.innerHTML = `<p>确认对 <strong>${escapeHtml(subject)}</strong> 作出「${result}」处理？</p><p>${result === "审核拒绝" ? `拒绝原因：${escapeHtml(reason)}` : "审核通过后，该演示记录不再展示审核入口。"}</p><p class="hint">仅当前页面演示，不影响真实申请。</p><div><button class="button" type="button" data-review-back>返回修改</button><button class="button primary" type="button" data-review-final>确认并保存</button></div>`;
    modalBody.append(confirmation);
    modalBody.querySelector(".form-grid").hidden = true;
    modalFooter.hidden = true;
    confirmation.querySelector("[data-review-back]").addEventListener("click", () => {
      confirmation.remove();
      modalBody.querySelector(".form-grid").hidden = false;
      modalFooter.hidden = false;
    });
    confirmation.querySelector("[data-review-final]").addEventListener("click", () => {
      row.review = result;
      row.reviewer = "当前演示审核员";
      const now = new Date();
      row.reviewedAt = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")} ${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
      row.rejectReason = reason;
      row.reviewNote = note;
      closeModal();
      render();
      showToast("审核记录已保存，仅本地演示");
    });
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
  modalFooter.hidden = false;
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
  modalFooter.hidden = false;
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
