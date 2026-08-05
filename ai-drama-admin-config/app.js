const pages = {
  waterfall: { label: "瀑布流轮播图", group: "产品运营 / 内容运营", icon: "gallery-horizontal-end" },
  novels: { label: "小说IP库配置", group: "AI漫剧系统 / AI漫剧官网配置", icon: "book-open" },
  scripts: { label: "剧本库配置", group: "AI漫剧系统 / AI漫剧官网配置", icon: "scroll-text" },
  scriptDetail: { label: "剧本详情", group: "AI漫剧系统 / AI漫剧官网配置 / 剧本库配置", icon: "file-text" }
};

const novelRows = [
  ["694", "写尽温柔，落款不是我", "novel-1.jpg", "林晓", "内容一部", "虐恋情深", "8章", "29.90", "国内", true],
  ["693", "世事漫随流水，算来一梦浮生", "novel-2.jpg", "周宁", "内容二部", "都市情感", "10章", "39.90", "国内", true],
  ["692", "无法习惯的感情，我退出", "novel-3.jpg", "王欢", "IP运营部", "现实情感", "6章", "19.90", "海外", false],
  ["691", "男友为了他的前女友挤掉我的录取名额", "novel-4.jpg", "林晓", "内容一部", "逆袭爽文", "12章", "49.90", "国内", true],
  ["690", "把我父母扔到国外后，总裁妻子我不要了", "novel-5.jpg", "周宁", "内容二部", "都市逆袭", "5章", "25.00", "海外", false]
];
const scriptRows = [
  ["10086", "归来仍是掌心月", "work-1.jpg", "夏月儿", "女频", "都市,重生", "3集", "99.00", "国内", true],
  ["10085", "霓虹余烬", "work-2.jpg", "Maya", "女频", "科幻,悬疑", "5集", "129.00", "海外", true],
  ["10084", "判出宗门后我立地成神", "work-4.jpg", "楚玄", "男频", "玄幻,逆袭", "4集", "89.00", "国内", true],
  ["10083", "双颜策", "work-7.jpg", "迟月", "女频", "古风,权谋", "3集", "69.00", "国内", false],
  ["10082", "Mask of the Pharaoh", "work-3.jpg", "Jon Bell", "男频", "悬疑,冒险", "6集", "149.00", "海外", true]
];
const waterfallRows = [
  ["10915", "Seedance 2.5｜动态叙事，再进化", "图片", "banner-seedance-2-5.png", "不跳转", "2026-08-04 18:00", "2026-10-31 23:59", "国内"],
  ["10914", "无限画布｜已上线", "图片", "banner-infinite-canvas.png", "https://aiqa.weiduanju.com/drama-studio", "2026-08-04 18:00", "2026-12-31 23:59", "国内"],
  ["10911", "全产业链驱动，让好故事走向全球", "图片", "hero-cn.jpg", "不跳转", "2026-08-01 00:00", "2026-12-31 23:59", "国内"],
  ["10912", "Create locally. Scale stories globally.", "视频", "hero-global.jpg", "https://aiqa.weiduanju.com/", "2026-08-01 00:00", "2026-12-31 23:59", "海外"],
  ["10913", "优质作品：二郎显圣真君", "图片", "work-1.jpg", "https://aiqa.weiduanju.com/script/10086", "2026-08-04 12:00", "2026-10-01 00:00", "国内"]
];

const state = { page: location.hash.slice(1) || "novels", detailTab: "roles", contentVersion: "国内", checked: new Set(), waterfallType: "首页轮播" };
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
function asset(name) { return `../ai-drama-website-optimization/assets/${name}`; }
function showToast(message) { toast.textContent = message; toast.classList.add("show"); clearTimeout(showToast.timer); showToast.timer = setTimeout(() => toast.classList.remove("show"), 2100); }

function renderNav() {
  document.getElementById("sideNav").innerHTML = `
    <section class="menu-group"><div class="menu-title">${icon("sparkles")}AI漫剧系统${icon("chevron-up").replace('<i ','<i class="chevron" ')}</div><div class="submenu-title">AI漫剧官网配置</div><button class="menu-item ${state.page === "novels" ? "active" : ""}" data-page="novels">小说IP库配置</button><button class="menu-item ${["scripts","scriptDetail"].includes(state.page) ? "active" : ""}" data-page="scripts">剧本库配置</button></section>
    <section class="menu-group"><div class="menu-title">${icon("briefcase-business")}产品运营${icon("chevron-up").replace('<i ','<i class="chevron" ')}</div><div class="submenu-title">内容运营</div><button class="menu-item ${state.page === "waterfall" ? "active" : ""}" data-page="waterfall">瀑布流轮播图</button></section>`;
  document.getElementById("breadcrumb").innerHTML = `${pages[state.page].group.replaceAll(" / ", " <span>/</span> ")} <span>/</span> <strong>${pages[state.page].label}</strong>`;
  document.getElementById("tabbar").innerHTML = ["novels", "scripts", ...(state.page === "scriptDetail" ? ["scriptDetail"] : []), "waterfall"].map(page => `<button class="page-tab ${state.page === page ? "active" : ""}" data-page="${page}"><span>${pages[page].label}</span><span>×</span></button>`).join("");
}

function filterPanel(fields) {
  return `<section class="content-card"><div class="filter-panel">${fields.map(field => `<div class="field-inline"><label>${field[0]}</label>${field[1] === "select" ? `<select class="control" data-filter-key="${field[0]}"><option>全部</option>${field[2].map(item => `<option ${field[3] === item ? "selected" : ""}>${item}</option>`).join("")}</select>` : `<input class="control" type="text" placeholder="${field[2]}">`}</div>`).join("")}</div><div class="filter-actions"><button class="button primary" type="button" data-search>${icon("search")}查询</button><button class="button" type="button" data-reset>重置</button></div></section>`;
}

function contentVersionTabs() {
  return `<div class="content-version-tabs" role="tablist" aria-label="内容版本"><span class="content-version-label">内容版本</span>${["国内", "海外"].map(version => `<button class="content-version-tab ${state.contentVersion === version ? "active" : ""}" type="button" role="tab" aria-selected="${state.contentVersion === version}" data-content-version="${version}">${version}</button>`).join("")}</div>`;
}

function pagination(total) {
  return `<div class="pagination"><span>共 ${total} 条</span><select class="page-size"><option>10条/页</option><option>20条/页</option></select><button>‹</button><button class="active">1</button><button>2</button><button>3</button><span>…</span><button>13</button><button>›</button><span>前往</span><input class="jump-input" value="1" aria-label="页码"><span>页</span></div>`;
}

function switchButton(on, id, type) { return `<button class="status-switch ${on ? "on" : ""}" type="button" data-status-id="${id}" data-status-type="${type}" data-current="${on ? "on" : "off"}" aria-label="${on ? "下架" : "上架"}"></button>`; }
function versionTag(version) { return `<span class="tag ${version === "海外" ? "global" : ""}">${version}</span>`; }

function novelsPage() {
  const rows = novelRows.filter(row => row[8] === state.contentVersion);
  const total = state.contentVersion === "国内" ? 125 : 36;
  return `${contentVersionTabs()}${filterPanel([["小说ID","input","请输入小说ID"],["小说名称","input","请输入小说名称"],["责编","select",["取小说管理责编枚举"]],["部门","select",["内容一部","内容二部","IP运营部"]],["状态","select",["上架","下架"]]])}
  <section class="content-card"><div class="toolbar"><button class="button primary" data-action="novel-add">${icon("plus")}新增小说</button><button class="button danger" data-action="batch-delete" ${state.checked.size ? "" : "disabled"}>${icon("trash-2")}批量删除</button><span class="spacer"></span><span>已选 ${state.checked.size} 项</span></div><div class="table-wrap"><table><colgroup><col style="width:42px"><col style="width:72px"><col style="width:170px"><col style="width:70px"><col style="width:76px"><col style="width:90px"><col style="width:110px"><col style="width:82px"><col style="width:72px"><col style="width:72px"><col style="width:110px"></colgroup><thead><tr><th><input type="checkbox" data-check-all></th><th>小说ID</th><th>小说名称</th><th>封面</th><th>责编</th><th>部门</th><th>标签</th><th>试读章节</th><th>定价</th><th>状态</th><th>操作</th></tr></thead><tbody>${rows.map(row => `<tr><td><input type="checkbox" data-row-check="${row[0]}" ${state.checked.has(row[0]) ? "checked" : ""}></td><td>${row[0]}</td><td class="ellipsis" title="${row[1]}">${row[1]}</td><td class="cover-cell"><img src="${asset(row[2])}" alt=""></td><td>${row[3]}</td><td>${row[4]}</td><td><span class="tag">${row[5]}</span></td><td>${row[6]}</td><td>¥${row[7]}</td><td>${switchButton(row[9], row[0], "小说")}</td><td><div class="operations"><button class="button text" data-action="novel-edit" data-id="${row[0]}">编辑</button><button class="button text danger-link" data-delete="小说" data-id="${row[0]}">删除</button></div></td></tr>`).join("")}</tbody></table></div>${pagination(total)}</section>`;
}

function scriptsPage() {
  const rows = scriptRows.filter(row => row[8] === state.contentVersion);
  const total = state.contentVersion === "国内" ? 48 : 18;
  return `${contentVersionTabs()}${filterPanel([["剧本ID","input","请输入剧本ID"],["剧本名称","input","请输入剧本名称"],["作者","input","请输入作者名称"],["状态","select",["上架","下架"]]])}
  <section class="content-card"><div class="toolbar"><button class="button primary" data-action="script-add">${icon("plus")}新增剧本</button></div><div class="table-wrap"><table><colgroup><col style="width:75px"><col style="width:170px"><col style="width:72px"><col style="width:84px"><col style="width:76px"><col style="width:110px"><col style="width:82px"><col style="width:76px"><col style="width:72px"><col style="width:120px"></colgroup><thead><tr><th>剧本ID</th><th>剧本名称</th><th>封面</th><th>作者</th><th>男女频</th><th>标签</th><th>试读集数</th><th>定价</th><th>状态</th><th>操作</th></tr></thead><tbody>${rows.map(row => `<tr><td>${row[0]}</td><td><button class="button text title-link" data-page="scriptDetail">${row[1]}</button></td><td class="cover-cell"><img src="${asset(row[2])}" alt=""></td><td>${row[3]}</td><td>${row[4]}</td><td>${row[5].split(",").map(tag => `<span class="tag">${tag}</span>`).join("")}</td><td>${row[6]}</td><td>¥${row[7]}</td><td>${switchButton(row[9], row[0], "剧本")}</td><td><div class="operations"><button class="button text" data-action="script-edit" data-id="${row[0]}">编辑</button><button class="button text danger-link" data-delete="剧本" data-id="${row[0]}">删除</button></div></td></tr>`).join("")}</tbody></table></div>${pagination(total)}</section>`;
}

function waterfallPage() {
  return `${filterPanel([["选择应用","select",["AI漫剧","其他"],"AI漫剧"],["类型","select",["其他","首页轮播","优质作品","素材展览"],state.waterfallType],["内容版本","select",["国内","海外"],"国内"]])}
  <section class="content-card"><div class="toolbar"><button class="button primary" data-action="banner-add">${icon("plus")}添加</button><button class="button" data-action="refresh">${icon("refresh-cw")}刷新缓存</button><button class="button" data-action="sort">${icon("arrow-up-down")}排序</button></div><div class="table-wrap"><table><colgroup><col style="width:72px"><col style="width:180px"><col style="width:86px"><col style="width:120px"><col style="width:180px"><col style="width:125px"><col style="width:125px"><col style="width:82px"><col style="width:110px"></colgroup><thead><tr><th>ID</th><th>标题</th><th>素材类型</th><th>素材</th><th>跳转方式</th><th>开始时间</th><th>结束时间</th><th>内容版本</th><th>操作</th></tr></thead><tbody>${waterfallRows.map(row => `<tr><td>${row[0]}</td><td class="ellipsis" title="${row[1]}">${row[1]}</td><td>${row[2]}</td><td><div class="media-thumb"><img src="${asset(row[3])}" alt="">${row[2] === "视频" ? `<span class="play">${icon("play")}</span>` : ""}</div></td><td class="ellipsis" title="${row[4]}">${row[4]}</td><td>${row[5]}</td><td>${row[6]}</td><td>${versionTag(row[7])}</td><td><div class="operations"><button class="button text" data-action="banner-edit" data-id="${row[0]}">修改</button><button class="button text danger-link" data-delete="轮播图配置" data-id="${row[0]}">删除</button></div></td></tr>`).join("")}</tbody></table></div>${pagination(12)}</section>`;
}

function scriptDetailPage() {
  const roleRows = [["R1001","温眠","品牌继承人，冷静果断，在家族危机中逐步学会信任与合作。"],["R1002","陆沉","危机顾问，表面疏离，实际长期守护温眠并协助查明真相。"],["R1003","陈砚","竞争品牌负责人，推动核心商业冲突的重要角色。"]];
  const episodeRows = [["10001","第1集"],["10002","第2集"],["10003","第3集"],["10004","第4集"],["10005","第5集"]];
  const table = state.detailTab === "roles" ? `<div class="toolbar"><button class="button primary" data-action="role-add">${icon("plus")}新增角色</button></div><div class="table-wrap"><table><colgroup><col style="width:120px"><col style="width:160px"><col><col style="width:140px"></colgroup><thead><tr><th>ID</th><th>角色名称</th><th>角色信息</th><th>操作</th></tr></thead><tbody>${roleRows.map(row => `<tr><td>${row[0]}</td><td>${row[1]}</td><td style="text-align:left">${row[2]}</td><td><div class="operations"><button class="button text" data-action="role-edit">编辑</button><button class="button text danger-link" data-delete="角色" data-id="${row[0]}">删除</button></div></td></tr>`).join("")}</tbody></table></div>${pagination(3)}` : `<div class="toolbar"><button class="button primary" data-action="import-script">${icon("file-up")}导入剧本</button><button class="button" data-action="episode-add">${icon("plus")}新增集数</button></div><div class="table-wrap"><table><colgroup><col style="width:180px"><col><col style="width:180px"></colgroup><thead><tr><th>ID</th><th>集数</th><th>操作</th></tr></thead><tbody>${episodeRows.map(row => `<tr><td>${row[0]}</td><td>${row[1]}</td><td><div class="operations"><button class="button text" data-action="episode-edit">编辑</button><button class="button text danger-link" data-delete="剧集" data-id="${row[0]}">删除</button></div></td></tr>`).join("")}</tbody></table></div>${pagination(24)}`;
  return `<section class="content-card"><div class="detail-summary"><img class="detail-cover" src="${asset("work-1.jpg")}" alt=""><div class="detail-info"><h1>归来仍是掌心月</h1><div class="detail-meta"><span>${versionTag(state.contentVersion)}</span><span>作者：夏月儿</span><span>女频</span><span>试读集数：3集</span><span>定价：99.00元</span></div><div class="outline"><strong>大纲</strong><br>温眠在家族品牌濒临破产时重逢旧爱陆沉。二人围绕投资协议、旧日误会与品牌发布会展开拉扯，逐步揭开当年分手真相，并在共同解决商业危机的过程中重新建立信任。</div></div><div class="detail-actions"><button class="button primary" data-action="import-script">导入剧本</button><button class="button">下载</button></div></div><div class="subtabs"><button class="subtab ${state.detailTab === "roles" ? "active" : ""}" data-detail-tab="roles">角色信息</button><button class="subtab ${state.detailTab === "episodes" ? "active" : ""}" data-detail-tab="episodes">剧集信息</button></div>${table}</section>`;
}

const docs = {
  novels: `<h2>#页面说明</h2><ul><li>本页是绿台-AI漫剧系统-AI漫剧官网配置-小说IP库配置页。</li><li>配置内容应用于官网对应的国内版或海外版小说IP库。</li></ul><h3>#原型说明</h3><p>支持按内容版本切换小说配置，维护试读章节、定价和上下架状态。</p><h4>● 修改记录</h4><p><span class="change-date">2026-08-05</span> <span class="change-copy">内容版本由筛选项、列表字段和弹窗字段调整为页面Tab；新增及上下架均作用于当前Tab对应的内容池。</span></p><p><span class="change-date">2026-08-04</span> <span class="change-copy">新增国内、海外两个独立内容池。</span></p><h4>○ 内容版本Tab</h4><ul><li><code>国内</code>：展示并维护国内版官网的小说IP内容，默认选中。</li><li><code>海外</code>：展示并维护海外版官网的小说IP内容。</li><li>切换Tab后清空当前勾选项，并按对应内容池刷新列表和分页总数。</li></ul><h4>○ 筛选项</h4><ul><li><code>小说ID</code>：文本输入，精确搜索，仅支持正整数。</li><li><code>小说名称</code>：文本输入，模糊搜索，最多100字符。</li><li><code>责编</code>：下拉单选，枚举实时取小说管理的责编数据，不写死。</li><li><code>部门</code>：下拉单选，枚举取组织架构部门。</li><li><code>状态</code>：下拉单选，枚举“上架、下架”。</li></ul><h4>○ 列表项</h4><ul><li>小说ID、小说名称、封面、责编、部门、标签来自小说库。</li><li>试读章节：官网允许免费试读的章节数，单位“章”。</li><li>定价：小说IP展示定价，单位“元”，保留2位小数。</li><li>状态：点击开关后弹出上架/下架二次确认。</li></ul><h4>○ 操作项</h4><ul><li>新增小说：打开居中弹窗，新增内容自动归属当前版本Tab。</li><li>编辑：打开居中弹窗，仅维护试读章节和定价，不展示内容版本字段。</li><li>删除/批量删除：弹出二次确认，确认后删除且不可恢复。</li></ul>`,
  scripts: `<h2>#页面说明</h2><ul><li>本页是绿台-AI漫剧系统-AI漫剧官网配置-剧本库配置页。</li><li>配置内容应用于官网对应的国内版或海外版剧本库。</li></ul><h3>#原型说明</h3><p>支持按内容版本切换剧本配置，维护基础资料、试读集数、定价及状态。</p><h4>● 修改记录</h4><p><span class="change-date">2026-08-05</span> <span class="change-copy">内容版本由筛选项、列表字段和弹窗字段调整为页面Tab；新增及上下架均作用于当前Tab对应的内容池。</span></p><p><span class="change-date">2026-08-04</span> <span class="change-copy">新增男女频、标签字段；角色信息调整至剧本详情维护。</span></p><h4>○ 内容版本Tab</h4><ul><li><code>国内</code>：展示并维护国内版官网的剧本内容，默认选中。</li><li><code>海外</code>：展示并维护海外版官网的剧本内容。</li><li>切换Tab后按对应内容池刷新列表和分页总数。</li></ul><h4>○ 筛选项</h4><ul><li><code>剧本ID</code>：文本输入，精确搜索，仅支持数字。</li><li><code>剧本名称、作者</code>：文本输入，模糊搜索，最多100字符。</li><li><code>状态</code>：下拉单选，枚举“上架、下架”。</li></ul><h4>○ 列表项</h4><ul><li>剧本ID为系统生成的纯数字唯一ID。</li><li>剧本名称以蓝字展示，点击进入剧本详情。</li><li>男女频枚举“男频、女频”；标签支持多选。</li><li>试读集数单位“集”；定价单位“元”，保留2位小数。</li><li>状态开关需二次确认。</li></ul><h4>○ 操作项</h4><ul><li>新增/编辑剧本：打开居中弹窗，内容自动归属当前版本Tab，不展示内容版本字段。</li><li>删除：弹出二次确认，确认后删除且不可恢复。</li></ul>`,
  scriptDetail: `<h2>#页面说明</h2><ul><li>本页是剧本库配置的二级页面，用于维护剧本大纲、角色与全部剧集。</li></ul><h3>#原型说明</h3><p>大纲下方按“角色信息、剧集信息”两个Tab组织内容。</p><h4>● 修改记录</h4><p><span class="change-date">2026-08-04</span> <span class="change-copy">角色信息从新增剧本弹窗迁移至剧本详情；新增角色列表及新增、编辑、删除交互。</span></p><h4>○ 角色信息</h4><ul><li>列表字段：ID、角色名称、角色信息。</li><li>角色名称必填，最多100字符。</li><li>角色信息为大段文本，必填，最多1000字符。</li><li>单个剧本至少维护2个角色，最多100个角色。</li><li>删除角色需二次确认。</li></ul><h4>○ 剧集信息</h4><ul><li>支持导入剧本并自动解析全部集数。</li><li>列表字段：ID、集数、操作。</li><li>编辑打开居中弹窗；删除需二次确认。</li></ul>`,
  waterfall: `<h2>#页面说明</h2><ul><li>本页是绿台-产品运营-内容运营-瀑布流轮播图配置页。</li><li>统一配置官网首页轮播、优质作品及素材展览。</li></ul><h3>#原型说明</h3><p>支持图片与视频素材，并按国内版、海外版分别配置。</p><h4>● 修改记录</h4><p><span class="change-date">2026-08-04</span> <span class="change-copy">无限画布 Banner 沿用原视觉与说明文案，仅将状态更新为“已上线”；新增 Seedance 2.5“即将上线”Banner；两张图内文案素材已同步至首页轮播列表。</span></p><p><span class="change-date">2026-08-04</span> <span class="change-copy">“爆款作品”统一调整为“优质作品”；新增国内/海外内容版本配置；类型新增“素材展览”。</span></p><h4>○ 筛选项</h4><ul><li><code>选择应用</code>：下拉单选，枚举“AI漫剧、其他”。</li><li><code>类型</code>：下拉单选，枚举“其他、首页轮播、优质作品、素材展览”。</li><li><code>内容版本</code>：下拉单选，枚举“国内、海外”。</li></ul><h4>○ 列表项</h4><ul><li>ID：添加素材后系统自动生成的唯一数字ID。</li><li>素材类型：图片或视频；视频展示第一帧及播放图标。</li><li>跳转方式：展示“不跳转”或网页链接。</li><li>开始时间、结束时间精确到分钟。</li><li>内容版本决定素材展示在国内版或海外版。</li></ul><h4>○ 操作项</h4><ul><li>添加/修改：打开居中弹窗。类型继承页面当前选择，不在弹窗重复填写。</li><li>选择优质作品时，额外展示“封面、热度”；热度用于官网热度值展示。</li><li>删除：弹出二次确认弹窗，确认后不可恢复。</li></ul>`
};

function render() {
  if (!pages[state.page]) state.page = "novels";
  renderNav();
  prototype.innerHTML = ({novels: novelsPage, scripts: scriptsPage, waterfall: waterfallPage, scriptDetail: scriptDetailPage})[state.page]();
  docsPanel.innerHTML = docs[state.page];
  bindInteractions();
  refreshIcons();
  window.scrollTo({top:0,behavior:"instant"});
}

function bindInteractions() {
  document.querySelectorAll("[data-page]").forEach(el => el.addEventListener("click", () => { state.page = el.dataset.page; location.hash = state.page; state.checked.clear(); render(); }));
  document.querySelectorAll("[data-content-version]").forEach(button => button.addEventListener("click", () => { if (state.contentVersion === button.dataset.contentVersion) return; state.contentVersion = button.dataset.contentVersion; state.checked.clear(); render(); showToast(`已切换至${state.contentVersion}内容`); }));
  document.querySelectorAll("[data-search]").forEach(el => el.addEventListener("click", () => showToast("查询完成，列表已更新")));
  document.querySelectorAll("[data-filter-key='类型']").forEach(select => select.addEventListener("change", () => { state.waterfallType = select.value; }));
  document.querySelectorAll("[data-reset]").forEach(el => el.addEventListener("click", () => { el.closest(".content-card").querySelectorAll("input").forEach(i => i.value = ""); el.closest(".content-card").querySelectorAll("select").forEach(s => s.selectedIndex = 0); showToast("筛选条件已重置"); }));
  document.querySelectorAll("[data-row-check]").forEach(input => input.addEventListener("change", () => { input.checked ? state.checked.add(input.dataset.rowCheck) : state.checked.delete(input.dataset.rowCheck); render(); }));
  document.querySelectorAll("[data-check-all]").forEach(input => input.addEventListener("change", () => { state.checked.clear(); if (input.checked) novelRows.filter(row => row[8] === state.contentVersion).forEach(row => state.checked.add(row[0])); render(); }));
  document.querySelectorAll("[data-status-id]").forEach(button => button.addEventListener("click", () => confirmStatus(button)));
  document.querySelectorAll("[data-delete]").forEach(button => button.addEventListener("click", () => confirmDelete(button.dataset.delete, button.dataset.id)));
  document.querySelectorAll("[data-detail-tab]").forEach(button => button.addEventListener("click", () => { state.detailTab = button.dataset.detailTab; render(); }));
  document.querySelectorAll("[data-action]").forEach(button => button.addEventListener("click", () => handleAction(button.dataset.action, button.dataset.id)));
}

function handleAction(action, id) {
  if (action === "novel-add" || action === "novel-edit") return openNovelForm(action === "novel-edit", id);
  if (action === "script-add" || action === "script-edit") return openScriptForm(action === "script-edit", id);
  if (action === "banner-add" || action === "banner-edit") return openBannerForm(action === "banner-edit", id);
  if (action === "role-add" || action === "role-edit") return openRoleForm(action === "role-edit");
  if (action === "episode-add" || action === "episode-edit") return openEpisodeForm(action === "episode-edit");
  if (action === "batch-delete") return confirmDelete(`已选中的 ${state.checked.size} 部小说`, "");
  if (action === "import-script") return showToast("已打开剧本文件选择器，支持自动解析大纲与全部集数");
  if (action === "refresh") return showToast("缓存刷新成功");
  if (action === "sort") return showToast("已进入当前内容版本的拖拽排序模式");
}

function formItem(label, content, full = false) { return `<div class="form-item ${full ? "full" : ""}"><label class="required">${label}</label>${content}</div>`; }
function versionSelect(value = "国内") { return `<select class="control"><option ${value === "国内" ? "selected" : ""}>国内</option><option ${value === "海外" ? "selected" : ""}>海外</option></select>`; }
function input(value = "", placeholder = "请输入") { return `<input class="control" value="${value}" placeholder="${placeholder}">`; }
function openForm(title, body, wide = false) {
  modal.classList.toggle("wide", wide); modalTitle.textContent = title; modalBody.innerHTML = `<div class="form-grid">${body}</div>`; modalFooter.innerHTML = `<button class="button" type="button" data-modal-cancel>取消</button><button class="button primary" type="button" data-modal-submit>确定</button>`; modalLayer.hidden = false; document.body.style.overflow = "hidden";
  modalFooter.querySelector("[data-modal-cancel]").addEventListener("click", closeModal);
  modalFooter.querySelector("[data-modal-submit]").addEventListener("click", () => { closeModal(); showToast(`${title.replace("新增","").replace("编辑","")}保存成功`); });
  refreshIcons();
}

function openNovelForm(edit, id) {
  const body = `${formItem("选择小说",`<button class="upload-box" type="button" data-select-novel>${icon("book-plus")}从小说库选择</button>`)}${formItem("试读章节",`<div class="input-with-unit">${input(edit ? "8" : "","请输入正整数")}<span>章</span></div>`)}${formItem("定价",`<div class="input-with-unit">${input(edit ? "29.90" : "","保留2位小数")}<span>元</span></div>`)}`;
  openForm(`${edit ? "编辑小说" : "新增小说"}（${state.contentVersion}）`, body);
  const selector = modalBody.querySelector("[data-select-novel]");
  if (selector) selector.addEventListener("click", () => showToast("已打开小说库选择列表"));
}
function openScriptForm(edit, id) {
  const overseas = state.contentVersion === "海外";
  const body = `${formItem("剧本名称",input(edit ? (overseas ? "霓虹余烬" : "归来仍是掌心月") : "","最多100字符"))}${formItem("作者",input(edit ? (overseas ? "Maya" : "夏月儿") : "","请输入作者"))}${formItem("封面",`<button class="upload-box" type="button">${icon("upload")}上传封面</button>`)}${formItem("男女频",`<select class="control"><option>女频</option><option>男频</option></select>`)}${formItem("标签",`<select class="control"><option>${overseas ? "科幻、悬疑" : "都市、重生"}</option><option>玄幻、逆袭</option><option>悬疑、冒险</option></select>`)}${formItem("试读集数",`<div class="input-with-unit">${input(edit ? (overseas ? "5" : "3") : "","请输入正整数")}<span>集</span></div>`)}${formItem("定价",`<div class="input-with-unit">${input(edit ? (overseas ? "129.00" : "99.00") : "","保留2位小数")}<span>元</span></div>`)}`;
  openForm(`${edit ? "编辑剧本" : "新增剧本"}（${state.contentVersion}）`, body, true);
}
function openBannerForm(edit, id) {
  const premiumFields = state.waterfallType === "优质作品" ? `${formItem("优质作品封面",`<button class="upload-box" type="button">${icon("image-up")}上传封面</button>`)}${formItem("热度",`${input("","请输入基础数字")}<p class="hint">用于官网的热度值展示</p>`)}` : "";
  const jumpUrl = `<div class="form-item" data-jump-url hidden><label class="required">网页链接</label>${input("","请输入完整网页链接")}</div>`;
  const body = `${formItem("内容版本",versionSelect(edit && id === "10912" ? "海外" : "国内"))}${formItem("标题",input(edit ? "全产业链驱动，让好故事走向全球" : "","最多100字符"))}${formItem("素材类型",`<div class="radio-row"><label><input type="radio" name="media" checked> 图片</label><label><input type="radio" name="media"> 视频</label></div>`)}${formItem("素材",`<button class="upload-box" type="button">${icon("upload")}上传图片或视频</button>`)}${formItem("跳转方式",`<select class="control" data-jump><option>不跳转</option><option>跳转网页</option></select>`)}${jumpUrl}${formItem("开始时间",`<input class="control" type="datetime-local">`)}${formItem("结束时间",`<input class="control" type="datetime-local">`)}${premiumFields}`;
  openForm(edit ? "修改轮播图配置" : "添加轮播图配置", body, true);
  const jumpSelect = modalBody.querySelector("[data-jump]");
  const jumpField = modalBody.querySelector("[data-jump-url]");
  jumpSelect.addEventListener("change", () => { jumpField.hidden = jumpSelect.value !== "跳转网页"; });
}
function openRoleForm(edit) { openForm(edit ? "编辑角色" : "新增角色", `${formItem("角色名称",input(edit ? "温眠" : "","最多100字符"),true)}${formItem("角色信息",`<textarea class="control" maxlength="1000" placeholder="请输入角色背景、性格、关系及关键设定，最多1000字">${edit ? "品牌继承人，冷静果断，在家族危机中逐步学会信任与合作。" : ""}</textarea><p class="hint">0 / 1000</p>`,true)}`); }
function openEpisodeForm(edit) { openForm(edit ? "编辑剧集" : "新增集数", `${formItem("集数名称",input(edit ? "第1集" : "","例如：第1集"),true)}${formItem("剧集内容",`<textarea class="control" placeholder="请输入本集剧本内容"></textarea>`,true)}`); }

function confirmStatus(button) {
  const toOn = button.dataset.current !== "on";
  confirmModal(`${toOn ? "确认上架" : "确认下架"}${button.dataset.statusType}？`, `${toOn ? "上架后将在对应版本官网展示" : "下架后官网将不再展示"}，是否继续？`, "warning", () => { button.classList.toggle("on", toOn); button.dataset.current = toOn ? "on" : "off"; showToast(`${button.dataset.statusType}已${toOn ? "上架" : "下架"}`); });
}
function confirmDelete(type, id) { confirmModal(`删除${type}`, `确认删除${id ? `ID ${id} 的` : ""}${type}？删除后不可恢复。`, "danger", () => { if (type.includes("已选中")) state.checked.clear(); showToast("删除成功"); render(); }); }
function confirmModal(title, copy, kind, onConfirm) {
  modal.classList.remove("wide"); modalTitle.textContent = title; modalBody.innerHTML = `<div class="confirm-copy"><span class="confirm-icon ${kind === "danger" ? "danger" : ""}">${icon(kind === "danger" ? "trash-2" : "circle-alert")}</span><h3>${title}</h3><p>${copy}</p></div>`; modalFooter.innerHTML = `<button class="button" type="button" data-modal-cancel>取消</button><button class="button ${kind === "danger" ? "danger" : "primary"}" type="button" data-modal-confirm>${kind === "danger" ? "删除" : "确认"}</button>`; modalLayer.hidden = false; document.body.style.overflow = "hidden";
  modalFooter.querySelector("[data-modal-cancel]").addEventListener("click", closeModal);
  modalFooter.querySelector("[data-modal-confirm]").addEventListener("click", () => { closeModal(); onConfirm(); }); refreshIcons();
}
function closeModal() { modalLayer.hidden = true; document.body.style.overflow = ""; }

document.getElementById("modalClose").addEventListener("click", closeModal);
modalLayer.addEventListener("click", event => { if (event.target === modalLayer) closeModal(); });
document.addEventListener("keydown", event => { if (event.key === "Escape" && !modalLayer.hidden) closeModal(); });
window.addEventListener("hashchange", () => { const page = location.hash.slice(1); if (pages[page] && page !== state.page) { state.page = page; render(); } });
render();
