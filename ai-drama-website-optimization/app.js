const A = "./assets/";

const copy = {
  cn: {
    nav: [["home", "首页"], ["novels", "小说IP库"], ["scripts", "剧本库"], ["assets", "资产库"], ["agents", "Agent工具"]],
    studio: "漫剧制作",
    business: "商务合作",
    home: {
      banners: ["qa-banner-1.jpg", "qa-banner-2.jpg"],
      quick: [
        ["book-open-text", "小说创作", "从题材定位、故事大纲到章节续写，完成小说创作全流程。"],
        ["scroll-text", "AI 剧本", "输入创意或故事设定，智能生成大纲、角色与分集剧本。"],
        ["panels-top-left", "无限画布", "自由组织角色、场景、分镜与素材，全局掌控创作脉络。"]
      ],
      sloganTitle: "全链路智能化创作平台",
      sloganDesc: "以IP内容为源头，以AI生产为引擎，以全域发行为放大器，打造覆盖创作、生产、孵化与商业合作的全链路内容生态。",
      slogans: [
        ["notebook-pen", "AI剧本智能创制", "IP拆解、故事开发到分集剧本一体化，搭建短剧工业化创作通道"],
        ["atom", "OPC单人智能创作体系", "单人一站式AI创作，覆盖短剧创意到成片全流程闭环"],
        ["library-big", "智能IP资源库", "聚合优质IP，支撑改编、联合开发及多元商业合作"],
        ["lightbulb", "爆款项目智能孵化", "AI产能搭配全球发行，赋能潜力内容增值变现"],
        ["building-2", "政企智能内容解决方案", "提供政企全场景一站式AI内容创制与全域传播发行综合解决方案"]
      ],
      worksTitle: "优质作品",
      works: [
        ["二郎显圣真君在此，谁敢动我侄沉香！", "神话英雄重返人间，在信念与宿命之间开启热血征途。", "work-1.jpg"],
        ["MASK OF TUTANKHAMUN", "古老文明的秘密在现代世界逐层苏醒。", "work-2.jpg"],
        ["皇帝难逃，不是，妃嫔你不带走？", "现代少女误入古代权谋局，以智慧改写命运。", "work-3.jpg"],
        ["判出宗门，我无敌天下", "被逐出宗门的少年逆势成长，重建自己的修行之路。", "work-4.jpg"],
        ["抢我火锅店后，表妹一家后悔了", "烟火市井中的商业反击，讲述小人物的逆风翻盘。", "work-5.jpg"],
        ["摊牌了，我本女王", "身份错位与家族迷局交织，她亲手夺回人生主动权。", "work-6.jpg"],
        ["双颜策", "双生身份卷入朝堂暗局，展开东方奇谭。", "work-7.jpg"]
      ]
    },
    filters: { search: "搜索", length: ["全部篇幅", "短篇", "中篇"], channel: ["全部频道", "女频", "男频"], category: ["全部分类", "现代言情", "古代言情", "悬疑", "现实"] },
    agent: { title: "AI驱动的创作工具", sub: "AI驱动的漫剧创作工具集，让视频、图像与声音高效协同。", action: "去创作" }
  },
  global: {
    nav: [["home", "Home"], ["novels", "Novel IP Library"], ["scripts", "Script Library"], ["assets", "Creative Library"], ["agents", "Agent Tools"]],
    studio: "Animated Microdrama Production",
    business: "Business Partnership",
    home: {
      banners: ["qa-banner-1.jpg", "qa-banner-2.jpg"],
      quick: [
        ["book-open-text", "Novel Creation", "Develop genres, story outlines and complete chapters in one workflow."],
        ["scroll-text", "AI Script", "Turn an idea into a structured outline, characters and episodic scripts."],
        ["panels-top-left", "Infinite Canvas", "Organize characters, locations, shots and assets in one connected space."]
      ],
      sloganTitle: "End-to-End Creation",
      sloganDesc: "Powered by IP and AI, we build an end-to-end ecosystem spanning creation, production, incubation, and partnerships.",
      slogans: [
        ["notebook-pen", "AI Script Creation", "IP analysis, story development, and AI episode scripts"],
        ["atom", "OPC Creation System", "One-stop AI workflow from ideas to final videos"],
        ["library-big", "Vast IP Library", "Curated IP resources for adaptation and partnerships"],
        ["lightbulb", "Content Accelerator", "AI production with global distribution and monetization"],
        ["building-2", "Gov & Enterprise", "Full-service AI content solutions for Gov and Enterprise"]
      ],
      worksTitle: "Selected Productions",
      works: [
        ["The Return of Erlang", "A mythic hero returns to rewrite an ancient destiny.", "work-1.jpg"],
        ["MASK OF TUTANKHAMUN", "An ancient secret awakens in the modern world.", "work-2.jpg"],
        ["The Emperor's Escape", "A modern mind enters a dangerous imperial court.", "work-3.jpg"],
        ["Exiled, Then Invincible", "An outcast rebuilds his path against every doubt.", "work-4.jpg"],
        ["The Hotpot Counterattack", "A small business owner turns betrayal into victory.", "work-5.jpg"],
        ["The Heiress Revealed", "She reclaims her identity and takes control of her future.", "work-6.jpg"],
        ["Two Faces", "Twin identities collide in an eastern political mystery.", "work-7.jpg"]
      ]
    },
    filters: { search: "Search", length: ["All lengths", "Short", "Series"], channel: ["All audiences", "Female", "Male"], category: ["All genres", "Romance", "Historical", "Mystery", "Drama"] },
    agent: { title: "AI-Powered Creative Tools", sub: "An AI toolkit that brings video, image, and sound production together.", action: "Create" }
  }
};

const novels = [
  ["孤舟不系", "溪午", "发小又一次拿着我的手机发了婚礼取消的消息后，我终于发现婚戒尺寸不对，真正不对的是人。", "qa-novel-1.jpg", "现代言情", "短篇", "1.01万字", "女频"],
  ["他到死才懂，我是他唯一的解药", "招财猫很招财", "谢衡在求婚现场抛下我去救另一个攻略者，却不知道任务失败真正会死的人是他。", "qa-novel-2.jpg", "现代言情", "短篇", "9220字", "女频"],
  ["冲掉心中爱的馀味再活一遍", "竹官", "我只希望自己能幸运一点，却亲眼看着男友把唯一的幸运送给闺蜜。", "qa-novel-3.jpg", "现代言情", "短篇", "8234字", "女频"],
  ["人见不相逢", "大捷", "结婚前一天，一条勒索短信揭开了未婚夫与养妹共同掩埋多年的真相。", "qa-novel-4.jpg", "现代言情", "短篇", "9240字", "女频"],
  ["山河不斜，我自归平", "没感情的毒妇", "我刷到附近妻子劝丈夫净身出户的帖子，弹幕却告诉我真正的小丑是自己。", "qa-novel-5.jpg", "现代言情", "短篇", "1.08万字", "女频"],
  ["恨一场桂花雨落", "吉吉", "沈邺带兵杀入皇都后的第一件事，是悬赏捉拿早已化作龙椅基石的我。", "qa-novel-6.jpg", "古代言情", "短篇", "9949字", "女频"],
  ["未婚夫的洁癖，总是因人而异", "乌龟蛋花汤", "我一直相信未婚夫能处理好疯狂的跟踪者，直到他故意醉倒在她怀里。", "qa-novel-7.jpg", "现代言情", "短篇", "8922字", "女频"],
  ["傻子皇后和亲后，皇帝悔疯了", "吉吉", "疯子皇帝让我永远消失，傻子皇后便真的答应远嫁千里之外。", "qa-novel-8.jpg", "古代言情", "短篇", "1.02万字", "女频"],
  ["不再困于曾经相爱的牢笼", "蛋炒饭", "男友对白月光始终克制，直到他说出为什么生病的人不是你。", "qa-novel-9.jpg", "现代言情", "短篇", "9696字", "女频"],
  ["明明是你不要我啊，怎么你疯了？", "招财猫很招财", "我从植物人状态苏醒，未婚夫第一句话却是要和肇事者的姐姐结婚。", "qa-novel-10.jpg", "现代言情", "短篇", "9696字", "女频"],
  ["假冒真千金到将军府认亲后，全家听到了她的心声！", "没感情的毒妇", "假千金闯入将军府认亲，却不知道全家都能听见她谋划复仇的心声。", "qa-novel-11.jpg", "古代言情", "短篇", "1.01万字", "女频"],
  ["月光照旧，人已非昨", "岁岁", "被男友和闺蜜丢在服务区后，我终于决定接受他死对头一直保留的职位。", "qa-novel-12.jpg", "现代言情", "短篇", "8614字", "女频"]
];

const scripts = [
  ["《诊室全程录音后，她慌了》", "佚名", "qa-script-1.jpg", "34集", "女频", "都市", "一段被完整保留的诊室录音，揭开精心掩饰的谎言与利益纠葛。"],
  ["《满级福星驾到》", "佚名", "qa-script-2.jpg", "36集", "女频", "古风", "身负福运的少女意外卷入家族纷争，用智慧改写所有人的命运。"],
  ["《重生之我不是软柿子》", "佚名", "qa-script-3.jpg", "40集", "女频", "都市", "重来一次，她不再忍让，在亲情、事业与爱情中夺回人生主动权。"],
  ["《二十年终得昭雪》", "佚名", "qa-script-4.jpg", "34集", "男频", "悬疑", "沉寂二十年的旧案再起波澜，当事人沿着线索追寻迟来的真相。"],
  ["《我花三万请月嫂，她全家搬进来》", "佚名", "qa-script-5.jpg", "37集", "女频", "都市", "高价聘请的月嫂竟将全家带进雇主家，一场家庭边界保卫战由此展开。"],
  ["《妈妈捡了四个爹》", "佚名", "qa-script-6.jpg", "39集", "女频", "都市", "四位身份迥异的男人突然出现，母女平静的生活迎来连续反转。"],
  ["《保洁阿姨让我嫁给她弟弟》", "佚名", "qa-script-7.jpg", "32集", "女频", "都市", "一次看似荒唐的介绍，意外牵出隐藏身份与跨越阶层的真心。"],
  ["《八零甜宠：谁动了我夫人》", "佚名", "qa-script-8.jpg", "40集", "女频", "年代", "重回八零年代，她在烟火生活中创业成长，也收获坚定守护。"],
  ["《他救白月光，我嫁摄政王》", "佚名", "qa-script-9.jpg", "39集", "女频", "古风", "被弃婚后她转身嫁入王府，在朝堂暗局中与摄政王并肩破局。"],
  ["《我的陪嫁房，成了小叔子婚房》", "佚名", "qa-script-10.jpg", "40集", "女频", "都市", "陪嫁房被婆家私自占用，她不再妥协，决心守住自己的尊严与权益。"],
  ["《老厂房的风》", "佚名", "qa-script-11.jpg", "40集", "男频", "现实", "老厂改制浪潮中，两代产业工人在选择与坚守间寻找新的方向。"],
  ["《离婚当天，我入职前夫对家公司当副总裁》", "佚名", "qa-script-12.jpg", "40集", "女频", "都市", "婚姻结束当天，她转身进入竞争公司，用实力完成事业与人生逆袭。"]
];

const assets = {
  characters: [
    ["天使女神", "asset-character-02.png", "3D风格", "女", "架空/异世界", "海外"], ["古代红发狐狸", "asset-character-01.png", "2D风格", "女", "古代", "国内"],
    ["女半兽人萨满祭司", "asset-character-03.png", "游戏CG风格", "女", "架空/异世界", "海外"], ["半兽人猎人战士", "asset-character-04.png", "游戏CG风格", "男", "架空/异世界", "海外"],
    ["光之守护者女英雄", "asset-character-05.png", "3D风格", "女", "未来科技感", "海外"], ["矮人铁匠", "asset-character-06.png", "3D风格", "男", "架空/异世界", "海外"],
    ["森林精灵", "asset-character-07.png", "2D风格", "女", "架空/异世界", "海外"], ["阿拉伯学者", "asset-character-09.png", "仿真人风格", "男", "现代", "海外"],
    ["北欧设计师", "asset-character-08.png", "仿真人风格", "男", "现代", "海外"], ["未来战士", "asset-character-10.png", "游戏CG风格", "女", "未来科技感", "海外"],
    ["锦衣卫", "asset-character-11.png", "仿真人风格", "男", "古代", "国内"], ["唐朝皇后", "asset-character-12.png", "2D风格", "女", "古代", "国内"]
  ],
  scenes: [["云端之城", "work-2.jpg"], ["未来都市", "work-7.jpg"], ["古代皇城", "work-3.jpg"], ["末日废墟", "work-5.jpg"], ["雪原秘境", "work-4.jpg"], ["旧城街巷", "qa-novel-5.jpg"]],
  props: [["秘银面具", "work-2.jpg"], ["未来装甲", "work-5.jpg"], ["古典折扇", "qa-novel-4.jpg"], ["王室冠冕", "work-3.jpg"], ["能量核心", "work-7.jpg"], ["战术装备", "work-4.jpg"]]
};

const agentTools = [
  ["视频创作", "支持视频生成、智能剪辑与镜头编辑，高效完成漫剧成片。", "qa-agent-1.png", "video"],
  ["图片创作", "支持角色、场景与分镜图生成，保持作品视觉风格统一。", "qa-agent-2.png", "image"],
  ["音频创作", "智能生成角色配音、环境音效与背景音乐，构建沉浸式声音体验。", "qa-agent-3.png", "audio-lines"],
  ["AI超分", "智能增强画面分辨率与纹理细节，让低清素材清晰呈现。", null, "scan-search"],
  ["音色塑造", "生成并锁定角色专属音色，让多集配音保持统一与鲜明。", null, "mic-2"]
];

const state = {
  edition: localStorage.getItem("rlwx-edition") || "cn",
  route: location.hash.slice(1) || "home",
  banner: 0,
  assetTab: "characters",
  assetFilters: ["全部", "全部", "全部", "全部"]
};

const app = document.getElementById("app");
const nav = document.getElementById("primaryNav");
const toast = document.getElementById("toast");
const modal = document.getElementById("modalBackdrop");
const modalPanel = modal.querySelector(".modal-panel");
const dialogContent = document.getElementById("dialogContent");
let bannerTimer;

function icon(name) { return `<i data-lucide="${name}" aria-hidden="true"></i>`; }
function esc(value) { return String(value).replace(/[&<>\"]/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;" })[char]); }
function refreshIcons() { if (window.lucide) window.lucide.createIcons({ attrs: { "stroke-width": 1.7 } }); }
function showToast(message) { toast.textContent = message; toast.classList.add("show"); clearTimeout(showToast.timer); showToast.timer = setTimeout(() => toast.classList.remove("show"), 2200); }

function renderNav() {
  const t = copy[state.edition];
  nav.innerHTML = `${t.nav.map(([route, label]) => `<a class="navbar-item ${state.route === route ? "is-active" : ""}" href="#${route}" data-route="${route}">${label}</a>`).join("")}<span class="navbar-line"></span><button class="navbar-item navbar-studio" type="button" data-studio-launch>${t.studio}</button>`;
  document.documentElement.lang = state.edition === "cn" ? "zh-CN" : "en";
  document.getElementById("businessButton").textContent = t.business;
  document.querySelectorAll("[data-edition]").forEach(button => {
    const active = button.dataset.edition === state.edition;
    button.textContent = state.edition === "cn"
      ? (button.dataset.edition === "cn" ? "国内" : "海外")
      : (button.dataset.edition === "cn" ? "Domestic" : "Overseas");
    button.classList.toggle("is-active", active);
    button.setAttribute("aria-pressed", String(active));
  });
}

function homePage() {
  const d = copy[state.edition].home;
  return `<div class="home-container"><div class="home-main">
    <section class="hero-carousel home-carousel" aria-label="首页轮播图">
      <div class="viewport">${d.banners.map((image, index) => `<div class="slide ${slideClass(index)}" data-banner-slide="${index}"><img class="slide-media" src="${A}${image}" alt=""></div>`).join("")}</div>
      <button class="arrow arrow-prev" type="button" data-banner-dir="-1" aria-label="上一张">${icon("chevron-left")}</button>
      <button class="arrow arrow-next" type="button" data-banner-dir="1" aria-label="下一张">${icon("chevron-right")}</button>
      <div class="indicators">${d.banners.map((_, index) => `<button class="dot ${index === state.banner ? "active" : ""}" type="button" data-banner-index="${index}" aria-label="第 ${index + 1} 张"></button>`).join("")}</div>
    </section>
    <div class="home-top-section">
      <section class="quick-create-section">
        <div class="quick-create-heading"><h2>${state.edition === "cn" ? "开启新的AI故事灵感" : "Unlock New AI-Powered Story Inspiration"}</h2></div>
        <div class="quick-create-grid">${d.quick.map((item, index) => `<button class="quick-create-card" type="button" data-quick="${index}"><span class="quick-create-icon">${icon(item[0])}</span><span><strong>${item[1]}</strong><small>${item[2]}</small></span><i data-lucide="arrow-right"></i></button>`).join("")}</div>
      </section>
      <section class="home-slogan"><div class="home-slogan__header"><h2 class="home-slogan__title">${d.sloganTitle}</h2><p class="home-slogan__desc">${d.sloganDesc}</p></div><div class="home-slogan__cards">${d.slogans.map(item => `<article class="slogan-card"><span class="slogan-card__icon">${icon(item[0])}</span><h3 class="slogan-card__title">${item[1]}</h3><p class="slogan-card__desc">${item[2]}</p></article>`).join("")}</div></section>
      <section class="home-hot"><h2 class="home-hot-title">${d.worksTitle}</h2><div class="home-hot-list">${d.works.map((item, index) => `<article class="home-hot-item" tabindex="0" data-work="${index}"><div class="home-hot-cover"><img src="${A}${item[2]}" alt="${esc(item[0])}"></div><div class="home-hot-copy"><h3>${item[0]}</h3></div></article>`).join("")}</div></section>
      <section class="home-creation"><div class="home-creation__left"><h2>${state.edition === "cn" ? "全业态一体化创作" : "All-in-One Content Creation"}</h2><div>${d.slogans.map(item => `<span>${item[1]}</span>`).join("")}</div></div><button type="button" data-studio-launch>${state.edition === "cn" ? "快速创作" : "Try Now"}${icon("arrow-right")}</button></section>
    </div>
    ${homeFooter()}
  </div></div>`;
}

function slideClass(index) {
  if (index === state.banner) return "is-current";
  const total = copy[state.edition].home.banners.length;
  if (total === 2) return "is-prev";
  if (index === (state.banner + 1) % total) return "is-next";
  return "is-prev";
}

function homeFooter() {
  const cn = state.edition === "cn";
  return `<footer class="home-footer"><div class="home-footer__top"><div><strong>${cn ? "容量万相" : "WanXiang"}</strong><p>${cn ? "让优质内容被看见，让好故事走向全球。" : "Made for stories that travel beyond borders."}</p></div></div><div class="home-footer__bottom"><span>${cn ? "本网站发布的所有内容，其知识产权归容量互娱所有，未经授权任何个人和组织不得转载或使用" : "All content is protected. Unauthorized reproduction is prohibited."}</span><div><span>Copyright © 2026 Hangzhou Rongliang Interactive Entertainment Technology Co., Ltd.</span><a href="../business-cooperation/privacy.html" target="_blank" rel="noopener">${cn ? "隐私政策" : "Privacy Policy"}</a></div></div></footer>`;
}

function filterSelect(key, options) {
  return `<div class="filter-select" data-filter-select="${key}" data-value="${options[0]}"><button class="filter-select__trigger" type="button" aria-expanded="false"><span class="filter-select__label">${options[0]}</span>${icon("chevron-down")}</button><div class="filter-select__menu" hidden>${options.map((option, index) => `<button type="button" data-filter-value="${option}" class="${index === 0 ? "is-active" : ""}">${option}${icon("check")}</button>`).join("")}</div></div>`;
}

function searchBox(placeholder, attr = "data-library-search") {
  return `<label class="search-input">${icon("search")}<input type="search" placeholder="${placeholder}" ${attr}></label>`;
}

function novelsPage() {
  const f = copy[state.edition].filters;
  const features = state.edition === "cn" ? [
    ["file-up", "小说投稿入库", "提交原创小说与版权资料，完成内容审核与IP入库。", "blue"],
    ["sparkles", "IP智能评估", "AI分析题材、角色与剧情，快速评估改编潜力与市场价值。", "purple"],
    ["handshake", "小说改编合作", "发起IP改编与联合开发，连接漫剧制作及全域发行资源。", "orange"]
  ] : [
    ["file-up", "Novel Submission", "Submit original stories and rights information for IP onboarding.", "blue"],
    ["sparkles", "AI IP Evaluation", "Assess genre, characters, plot and adaptation potential with AI.", "purple"],
    ["handshake", "Adaptation Partnership", "Connect premium IP with production and global distribution.", "orange"]
  ];
  return `<div class="novel-page"><div class="novel-content">${featureCards(features)}<div class="filter-bar"><div class="filter-group">${filterSelect("length", f.length)}${filterSelect("channel", f.channel)}${filterSelect("category", f.category)}</div>${searchBox(f.search)}</div><div class="novel-card-grid" data-library-grid>${novels.map((item, index) => novelCard(item, index)).join("")}</div></div></div>`;
}

function novelCard(item, index) {
  return `<article class="novel-card" tabindex="0" data-novel="${index}" data-library-card data-title="${esc(item[0] + item[1])}" data-length="${item[5]}" data-channel="${item[7]}" data-category="${item[4]}"><div class="card-cover"><img class="cover-img" src="${A}${item[3]}" alt="${esc(item[0])}"></div><div class="card-content"><h3 class="card-title">${item[0]}</h3><div class="card-tags"><span class="tag tag-source">${item[4]}</span><span class="tag tag-type">${item[5]}</span><span class="tag tag-count">${item[6]}</span></div><p class="card-desc">${item[2]}</p><p class="card-author">${state.edition === "cn" ? "作者" : "Author"}：${item[1]}</p></div></article>`;
}

function scriptsPage() {
  const f = copy[state.edition].filters;
  const features = state.edition === "cn" ? [
    ["book-copy", "小说智能改编", "基于优质小说IP，提炼情节与角色，快速生成标准化漫剧剧本。", "blue"],
    ["wand-sparkles", "AI原创剧本", "输入创意或故事设定，智能完成大纲、角色与分集剧本创作。", "purple"],
    ["rocket", "剧本全球化", "AI驱动剧本快速成片，贯通本地化适配与海外发行。", "orange"]
  ] : [
    ["book-copy", "Novel Adaptation", "Turn premium IP into production-ready episodic scripts.", "blue"],
    ["wand-sparkles", "AI Original Scripts", "Generate outlines, characters and episode scripts from an idea.", "purple"],
    ["rocket", "Global Production", "Move from script to localized production and global distribution.", "orange"]
  ];
  const categories = state.edition === "cn" ? ["全部分类", "都市", "古风", "悬疑", "现实", "年代"] : ["All genres", "Urban", "Historical", "Mystery", "Drama"];
  return `<div class="script-page"><div class="script-content">${featureCards(features)}<div class="filter-bar"><div class="filter-group">${filterSelect("channel", f.channel)}${filterSelect("category", categories)}</div>${searchBox(f.search)}</div><div class="novel-card-grid script-library-grid" data-library-grid>${scripts.map((item, index) => scriptLibraryCard(item, index)).join("")}</div></div></div>`;
}

function scriptLibraryCard(item, index) {
  return `<article class="novel-card script-library-card" tabindex="0" data-script="${index}" data-library-card data-title="${esc(item[0] + item[1])}" data-channel="${item[4]}" data-category="${item[5]}"><div class="card-cover"><img class="cover-img" src="${A}${item[2]}" alt="${esc(item[0])}"></div><div class="card-content"><h3 class="card-title">${item[0]}</h3><div class="card-tags"><span class="tag tag-source">${item[4]}</span><span class="tag tag-type">${item[5]}</span><span class="tag tag-count">${item[3]}</span></div><p class="card-desc">${item[6]}</p><p class="card-author">${state.edition === "cn" ? "作者" : "Author"}：${item[1]}</p></div></article>`;
}

function featureCards(features) {
  const cta = state.edition === "cn" ? "立即体验" : "Explore now";
  return `<div class="feature-cards">${features.map(item => `<button class="feature-card feature-card--${item[3]}" type="button" data-capability="${esc(item[1])}"><span class="feature-icon">${icon(item[0])}</span><strong>${item[1]}</strong><small>${item[2]}</small><em>${cta}${icon("arrow-up-right")}</em></button>`).join("")}</div>`;
}

function assetsPage() {
  const cn = state.edition === "cn";
  const tabs = [["characters", cn ? "角色库" : "Characters"], ["scenes", cn ? "场景库" : "Scenes"], ["props", cn ? "道具库" : "Props"]];
  const groups = [[cn ? "风格" : "Style", ["全部", "2D风格", "游戏CG风格", "3D风格", "仿真人风格"]], [cn ? "性别" : "Gender", ["全部", "男", "女"]], [cn ? "年代" : "Era", ["全部", "民国", "未来科技感", "现代", "古代", "架空/异世界"]], [cn ? "国别" : "Region", ["全部", "国内", "海外"]]];
  const items = assets[state.assetTab];
  const vertical = state.assetTab === "characters";
  return `<div class="asset-page"><div class="asset-main"><div class="asset-topbar"><div class="asset-tabs">${tabs.map(([key, label]) => `<button class="asset-tab ${state.assetTab === key ? "is-active" : ""}" type="button" data-asset-tab="${key}">${label}</button>`).join("")}</div>${searchBox(cn ? "搜索" : "Search", "data-asset-search")}</div><div class="asset-card-container">${vertical ? `<aside class="asset-tag-panel">${groups.map((group, groupIndex) => `<section class="tag-group"><h3>${group[0]}</h3><div>${group[1].map((label, index) => `<button class="tag-item ${index === 0 ? "is-active" : ""}" type="button" data-asset-group="${groupIndex}" data-asset-filter="${label}">${label}</button>`).join("")}</div></section>`).join("")}</aside>` : ""}<div class="asset-content"><div class="asset-grid ${vertical ? "is-vertical" : "is-horizontal"}" data-asset-grid>${items.map((item, index) => `<article class="asset-card ${vertical ? "is-vertical" : "is-horizontal"}" tabindex="0" data-asset="${index}" data-title="${esc(item[0])}" data-style="${item[2] || ""}" data-gender="${item[3] || ""}" data-era="${item[4] || ""}" data-region="${item[5] || ""}"><div class="asset-card__image ${vertical ? "asset-card__image-vertical" : "asset-card__image-horizontal"}"><img src="${A}${item[1]}" alt="${esc(item[0])}"></div><div class="asset-card__info"><strong>${item[0]}</strong></div></article>`).join("")}</div></div></div></div></div>`;
}

function agentsPage() {
  const t = copy[state.edition].agent;
  return `<div class="tools-page"><div class="tools-content"><header class="tools-header"><h1>${t.title}<span class="title-glow glow-left"></span><span class="title-glow glow-right"></span></h1><p><span>${state.edition === "cn" ? "AI驱动" : "AI-powered"}</span>${t.sub.replace(state.edition === "cn" ? "AI驱动" : "AI-powered", "")}</p></header><div class="tool-cards">${agentTools.map((item, index) => `<article class="tool-card"><div class="tool-cover">${item[2] ? `<img src="${A}${item[2]}" alt="">` : `<span class="tool-placeholder tool-placeholder-${index}">${icon(item[3])}</span>`}</div><div class="tool-body"><h2>${item[0]}</h2><p>${item[1]}</p><button type="button" data-agent="${item[0]}">${icon(item[3])}<span>${t.action}</span></button></div></article>`).join("")}</div></div></div>`;
}

function render() {
  clearInterval(bannerTimer);
  if (!["home", "novels", "scripts", "assets", "agents"].includes(state.route)) state.route = "home";
  renderNav();
  app.innerHTML = ({ home: homePage, novels: novelsPage, scripts: scriptsPage, assets: assetsPage, agents: agentsPage })[state.route]();
  bindPage();
  refreshIcons();
  window.scrollTo(0, 0);
}

function bindPage() {
  document.querySelectorAll("[data-route]").forEach(link => link.addEventListener("click", event => { event.preventDefault(); state.route = link.dataset.route; location.hash = state.route; render(); }));
  document.querySelectorAll("[data-studio-launch]").forEach(button => button.addEventListener("click", () => showToast(state.edition === "cn" ? "漫剧制作平台即将打开" : "Opening the production studio")));
  document.querySelectorAll("[data-quick]").forEach(button => button.addEventListener("click", () => showToast(`${button.querySelector("strong").textContent}${state.edition === "cn" ? "入口已打开" : " opened"}`)));
  bindCarousel();
  bindFilterSelects();
  document.querySelectorAll("[data-library-search]").forEach(input => input.addEventListener("input", applyLibraryFilters));
  document.querySelectorAll("[data-work]").forEach(card => bindKeyboardClick(card, () => openWork(Number(card.dataset.work))));
  document.querySelectorAll("[data-novel]").forEach(card => bindKeyboardClick(card, () => openNovel(Number(card.dataset.novel))));
  document.querySelectorAll("[data-script]").forEach(card => bindKeyboardClick(card, () => openScript(Number(card.dataset.script))));
  document.querySelectorAll("[data-capability]").forEach(card => card.addEventListener("click", () => showToast(state.edition === "cn" ? `正在进入「${card.dataset.capability}」` : `Opening ${card.dataset.capability}`)));
  document.querySelectorAll("[data-agent]").forEach(button => button.addEventListener("click", () => showToast(state.edition === "cn" ? `${button.dataset.agent}工具已打开` : `Opening ${button.dataset.agent}`)));
  document.querySelectorAll("[data-asset-tab]").forEach(button => button.addEventListener("click", () => { state.assetTab = button.dataset.assetTab; state.assetFilters = ["全部", "全部", "全部", "全部"]; render(); }));
  document.querySelectorAll("[data-asset-filter]").forEach(button => button.addEventListener("click", () => { const group = Number(button.dataset.assetGroup); state.assetFilters[group] = button.dataset.assetFilter; button.parentElement.querySelectorAll("button").forEach(item => item.classList.toggle("is-active", item === button)); applyAssetFilters(); }));
  const assetSearch = document.querySelector("[data-asset-search]");
  if (assetSearch) assetSearch.addEventListener("input", applyAssetFilters);
  document.querySelectorAll("[data-asset]").forEach(card => bindKeyboardClick(card, () => openAsset(Number(card.dataset.asset))));
}

function bindKeyboardClick(element, handler) {
  element.addEventListener("click", handler);
  element.addEventListener("keydown", event => { if (event.key === "Enter" || event.key === " ") handler(); });
}

function bindCarousel() {
  const slides = [...document.querySelectorAll("[data-banner-slide]")];
  if (!slides.length) return;
  const dots = [...document.querySelectorAll("[data-banner-index]")];
  const activate = index => {
    state.banner = (index + slides.length) % slides.length;
    slides.forEach((slide, slideIndex) => {
      slide.classList.remove("is-current", "is-prev", "is-next");
      slide.classList.add(slideClass(slideIndex));
    });
    dots.forEach((dot, dotIndex) => dot.classList.toggle("active", dotIndex === state.banner));
  };
  document.querySelectorAll("[data-banner-dir]").forEach(button => button.addEventListener("click", () => activate(state.banner + Number(button.dataset.bannerDir))));
  dots.forEach(button => button.addEventListener("click", () => activate(Number(button.dataset.bannerIndex))));
  bannerTimer = setInterval(() => activate(state.banner + 1), 6500);
}

function bindFilterSelects() {
  document.querySelectorAll("[data-filter-select]").forEach(select => {
    const trigger = select.querySelector(".filter-select__trigger");
    const menu = select.querySelector(".filter-select__menu");
    trigger.addEventListener("click", event => { event.stopPropagation(); document.querySelectorAll(".filter-select__menu").forEach(item => { if (item !== menu) item.hidden = true; }); menu.hidden = !menu.hidden; trigger.setAttribute("aria-expanded", String(!menu.hidden)); });
    menu.querySelectorAll("[data-filter-value]").forEach(option => option.addEventListener("click", () => { select.dataset.value = option.dataset.filterValue; select.querySelector(".filter-select__label").textContent = option.dataset.filterValue; menu.querySelectorAll("button").forEach(item => item.classList.toggle("is-active", item === option)); menu.hidden = true; trigger.setAttribute("aria-expanded", "false"); applyLibraryFilters(); }));
  });
}

function applyLibraryFilters() {
  const grid = document.querySelector("[data-library-grid]");
  if (!grid) return;
  const query = (document.querySelector("[data-library-search]")?.value || "").trim().toLowerCase();
  const selected = [...document.querySelectorAll("[data-filter-select]")].map(item => [item.dataset.filterSelect, item.dataset.value]);
  grid.querySelectorAll("[data-library-card]").forEach(card => {
    const matchesText = card.dataset.title.toLowerCase().includes(query);
    const matchesFilters = selected.every(([key, value]) => value.startsWith("全部") || value.startsWith("All ") || card.dataset[key] === value);
    card.hidden = !(matchesText && matchesFilters);
  });
}

function applyAssetFilters() {
  const query = (document.querySelector("[data-asset-search]")?.value || "").trim().toLowerCase();
  const keys = ["style", "gender", "era", "region"];
  document.querySelectorAll("[data-asset]").forEach(card => { const matchText = card.dataset.title.toLowerCase().includes(query); const matchFilters = state.assetFilters.every((value, index) => value === "全部" || card.dataset[keys[index]] === value); card.hidden = !(matchText && matchFilters); });
}

function openWork(index) {
  const item = copy[state.edition].home.works[index];
  openModal(`<div class="media-dialog"><img src="${A}${item[2]}" alt="${esc(item[0])}"><div><p class="modal-kicker">${state.edition === "cn" ? "优质作品" : "SELECTED PRODUCTION"}</p><h2 id="dialogTitle">${item[0]}</h2><p>${item[1]}</p><button type="button" class="modal-primary" data-modal-close>${state.edition === "cn" ? "关闭" : "Close"}</button></div></div>`, "wide");
}

function openNovel(index) {
  const item = novels[index];
  openModal(`<div class="media-dialog"><img src="${A}${item[3]}" alt="${esc(item[0])}"><div><p class="modal-kicker">NOVEL IP</p><h2 id="dialogTitle">${item[0]}</h2><div class="modal-tags"><span>${item[4]}</span><span>${item[5]}</span><span>${item[6]}</span></div><p>${item[2]}</p><small>${state.edition === "cn" ? "作者" : "Author"}：${item[1]}</small><button type="button" class="modal-primary" data-modal-action>${state.edition === "cn" ? "阅读试读章节" : "Read preview"}</button></div></div>`, "wide");
}

function openScript(index) {
  const item = scripts[index];
  openModal(`<div class="media-dialog"><img src="${A}${item[2]}" alt="${esc(item[0])}"><div><p class="modal-kicker">SCRIPT</p><h2 id="dialogTitle">${item[0]}</h2><div class="modal-tags"><span>${item[4]}</span><span>${item[5]}</span><span>${item[3]}</span></div><p>${state.edition === "cn" ? "围绕完整漫剧生产流程构建的标准化分集剧本，可用于角色、分镜和成片制作。" : "A structured episodic script ready for character, storyboard and production workflows."}</p><small>${state.edition === "cn" ? "作者" : "Author"}：${item[1]}</small><button type="button" class="modal-primary" data-modal-action>${state.edition === "cn" ? "查看试读" : "Preview script"}</button></div></div>`, "wide");
}

function openAsset(index) {
  const item = assets[state.assetTab][index];
  openModal(`<div class="asset-dialog"><img src="${A}${item[1]}" alt="${esc(item[0])}"><div><p class="modal-kicker">ASSET PREVIEW</p><h2 id="dialogTitle">${item[0]}</h2><p>${state.edition === "cn" ? "点击图片可查看完整素材，支持在漫剧创作项目中调用。" : "Preview and use this asset in a production project."}</p><button type="button" class="modal-primary" data-modal-action>${state.edition === "cn" ? "使用资产" : "Use asset"}</button></div></div>`, "asset");
}

function openBusiness() {
  const cn = state.edition === "cn";
  const directions = cn ? ["IP版权合作", "漫剧制作", "AI工具 / 平台合作", "内容发行与投流", "海外发行", "政企项目"] : ["IP licensing", "Drama production", "AI platform", "Distribution", "Global release", "Enterprise project"];
  openModal(`<form id="businessForm" class="business-form"><div class="business-heading"><p class="modal-kicker">BUSINESS PARTNERSHIP</p><h2 id="dialogTitle">${cn ? "商务合作" : "Business Partnership"}</h2><p>${cn ? "请留下合作需求，我们将在 1 个工作日内与您联系。" : "Tell us about your project. We will respond within one business day."}</p></div><div class="business-grid"><label><span>${cn ? "姓名" : "Full name"}<b>*</b></span><input name="name" maxlength="20" required placeholder="${cn ? "请输入您的姓名" : "Enter your full name"}"></label><label><span>${cn ? "公司 / 机构名称" : "Company / organization"}<b>*</b></span><input name="company" maxlength="50" required placeholder="${cn ? "请输入公司或机构名称" : "Enter your organization"}"></label><label><span>${cn ? "联系方式" : "Contact"}<b>*</b></span><input name="contact" maxlength="40" required placeholder="${cn ? "请输入手机号、微信或邮箱" : "Phone, email or WhatsApp"}"></label><label><span>${cn ? "职位 / 角色" : "Position / role"}</span><select name="role"><option>${cn ? "请选择" : "Select"}</option><option>${cn ? "企业负责人" : "Business owner"}</option><option>${cn ? "内容负责人" : "Content lead"}</option><option>${cn ? "制片人 / 导演" : "Producer / director"}</option></select></label><fieldset><legend>${cn ? "合作方向" : "Areas of interest"}<b>*</b></legend><div class="business-options">${directions.map(item => `<label><input type="checkbox" name="direction" value="${item}"><span>${item}</span></label>`).join("")}</div></fieldset><label class="business-details"><span>${cn ? "合作需求" : "Project details"}<b>*</b></span><textarea name="details" minlength="10" maxlength="500" required placeholder="${cn ? "请简要描述项目背景、内容体量、合作目标等信息" : "Describe the project background, content scale and goals"}"></textarea></label><label class="business-consent"><input type="checkbox" name="consent" required><span>${cn ? "我已阅读并同意" : "I agree to the"}<a href="../business-cooperation/privacy.html" target="_blank" rel="noopener">${cn ? "《隐私政策》" : " Privacy Policy"}</a></span></label></div><div class="business-actions"><button type="button" data-modal-close>${cn ? "取消" : "Cancel"}</button><button class="modal-primary" type="submit">${cn ? "提交合作意向" : "Submit"}</button></div></form>`, "business");
  const form = document.getElementById("businessForm");
  form.addEventListener("submit", event => { event.preventDefault(); if (!form.querySelector('input[name="direction"]:checked')) { showToast(cn ? "请至少选择一个合作方向" : "Select at least one area"); return; } dialogContent.innerHTML = `<div class="success-state">${icon("circle-check-big")}<h2 id="dialogTitle">${cn ? "提交成功" : "Request submitted"}</h2><p>${cn ? "合作顾问将在 1 个工作日内与您联系。" : "A partnership advisor will contact you soon."}</p><button class="modal-primary" type="button" data-modal-close>${cn ? "知道了" : "Done"}</button></div>`; bindModalButtons(); refreshIcons(); });
}

function openModal(html, variant = "") {
  modalPanel.className = `modal-panel ${variant}`;
  dialogContent.innerHTML = html;
  modal.hidden = false;
  document.body.style.overflow = "hidden";
  bindModalButtons();
  refreshIcons();
}

function bindModalButtons() {
  dialogContent.querySelectorAll("[data-modal-close]").forEach(button => button.addEventListener("click", closeModal));
  dialogContent.querySelectorAll("[data-modal-action]").forEach(button => button.addEventListener("click", () => showToast(state.edition === "cn" ? "功能已打开" : "Opened")));
}

function closeModal() { modal.hidden = true; document.body.style.overflow = ""; }

document.addEventListener("click", event => {
  if (!event.target.closest(".filter-select")) document.querySelectorAll(".filter-select__menu").forEach(menu => { menu.hidden = true; });
});
document.querySelectorAll("[data-edition]").forEach(button => button.addEventListener("click", () => { state.edition = button.dataset.edition; localStorage.setItem("rlwx-edition", state.edition); state.banner = 0; render(); }));
document.getElementById("businessButton").addEventListener("click", openBusiness);
document.getElementById("dialogClose").addEventListener("click", closeModal);
modal.addEventListener("click", event => { if (event.target === modal) closeModal(); });
document.addEventListener("keydown", event => { if (event.key === "Escape" && !modal.hidden) closeModal(); });
window.addEventListener("hashchange", () => { const route = location.hash.slice(1); if (route && route !== state.route) { state.route = route; render(); } });

render();
