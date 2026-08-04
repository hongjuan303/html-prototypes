const editions = {
  cn: {
    lang: "zh-CN",
    nav: [
      ["home", "首页"], ["novels", "小说IP库"], ["scripts", "剧本库"],
      ["assets", "资产库"], ["agents", "Agent工具"], ["studio", "漫剧制作"]
    ],
    business: "商务合作",
    privacy: "隐私政策",
    footer: "让好故事被看见，让优质内容走向更广阔的市场。",
    home: {
      badge: "国内内容生态",
      heroImage: "./assets/hero-cn.jpg",
      eyebrow: "AI DRAMA PRODUCTION PLATFORM",
      title: "全产业链驱动，让好故事走向全球",
      copy: "从优质IP、智能创作到全域发行，为专业内容团队提供一站式漫剧生产能力。",
      proof: ["IP内容供给", "AI规模生产", "全域发行增长"],
      banners: [
        { image: "./assets/banner-infinite-canvas.png", theme: "cool", badge: "已上线", eyebrow: "INFINITE CANVAS", title: "无限画布，让创作从此没有边界", copy: "角色、场景、分镜与素材自由编排，在同一画布中完成创意到成片的全流程协作。", proof: ["自由编排", "全局联动", "多人协作"] },
        { image: "./assets/banner-seedance-2-5.png", theme: "warm", badge: "即将上线", eyebrow: "SEEDANCE 2.5", title: "Seedance 2.5，重新定义动态叙事", copy: "更强的角色一致性、镜头连续性与运动表现，让高品质漫剧视频生成再进一步。", proof: ["角色更稳定", "镜头更连贯", "动态更自然"] },
        { image: "./assets/hero-cn.jpg", theme: "brand", badge: "国内内容生态", eyebrow: "AI DRAMA PRODUCTION PLATFORM", title: "全产业链驱动，让好故事走向全球", copy: "从优质IP、智能创作到全域发行，为专业内容团队提供一站式漫剧生产能力。", proof: ["IP内容供给", "AI规模生产", "全域发行增长"] }
      ],
      creationTitle: "多能力创作入口",
      creationIntro: "从灵感、小说到剧本与成片，在同一套工作流中完成专业创作。",
      creation: [
        { icon: "scroll-text", title: "AI剧本", desc: "输入故事设定，智能完成大纲、角色与分集剧本创作。", action: "开始剧本创作", tab: "script" },
        { icon: "book-open-text", title: "小说创作", desc: "从题材定位到章节续写，让创意快速成长为完整故事。", action: "开始小说创作", tab: "novel" },
        { icon: "clapperboard", title: "漫剧制作", desc: "拆解剧本、生成分镜与视听内容，贯通从文本到成片。", action: "进入制作平台", tab: "drama" }
      ],
      worksTitle: "优质作品",
      worksIntro: "精选剪辑后的高光片段，以更完整的故事信息呈现内容价值与制作水准。",
      works: [
        ["二郎显圣真君", "神话英雄重返人间，在信念与宿命之间开启一场跨越千年的热血征途。", "work-1.jpg", "玄幻", "28.5k"],
        ["图坦卡蒙的面具", "考古队意外唤醒沉睡诅咒，古老文明的秘密在现代都市逐层揭开。", "work-2.jpg", "悬疑", "19.8k"],
        ["皇帝难逃我的手掌心", "现代少女误入古代权谋局，以智慧改写命运，也重新定义彼此的选择。", "work-3.jpg", "古风", "31.2k"],
        ["判出宗门后我立地成神", "被逐出宗门的少年逆势成长，在众生质疑中重建属于自己的修行之路。", "work-4.jpg", "热血", "42.6k"],
        ["抢我火锅店？我让你倾家荡产", "烟火市井中的商业反击，用爽快节奏讲述小人物的逆风翻盘。", "work-5.jpg", "都市", "17.3k"],
        ["摊牌了，我就是首富千金", "身份错位与家族迷局交织，她不再隐藏锋芒，亲手夺回人生主动权。", "work-6.jpg", "都市", "23.9k"],
        ["双颜策", "双生身份卷入朝堂暗局，一场关于选择、信任与守护的东方奇谭。", "work-7.jpg", "古风", "15.6k"]
      ],
      lifecycleTitle: "一体化内容生态",
      lifecycleIntro: "以优质IP为源头，以AI生产为引擎，以全域发行放大内容价值。",
      lifecycle: [
        ["01", "前端 · 内容供给", "聚合短篇小说与优质IP，为创作提供可持续的故事源头。"],
        ["02", "中端 · 智能生产", "AI贯通剧本、角色、分镜、画面与声音，提升规模化生产效率。"],
        ["03", "后端 · 全域发行", "覆盖投流、端上、平台与海外渠道，让优质内容触达更广阔市场。"]
      ]
    },
    novels: {
      eyebrow: "IP CONTENT ENGINE",
      title: "从好故事开始，共创下一个优质IP",
      copy: "发现、评估并连接优质小说内容，为作者、版权方与制作团队提供高效合作入口。",
      actions: ["提交作品", "机构入驻"],
      capabilities: [
        ["sparkles", "IP价值评估", "从题材、情节与改编潜力多维分析内容价值。"],
        ["scan-text", "智能内容拆解", "提炼人物关系、核心冲突与高光情节。"],
        ["handshake", "联合开发", "连接版权、制作与发行资源，推进IP商业化。"],
        ["file-up", "投稿与入驻", "面向作者及内容机构开放便捷合作通道。"]
      ],
      segments: ["全部", "女频", "男频", "已签约"],
      placeholder: "搜索小说名称、作者",
      cards: [
        ["孤舟不系", "苏霁", "在失去与重逢之间，她终于学会为自己选择一次。", "novel-1.jpg", ["现代言情", "成长"]],
        ["他到死才懂我的爱", "沈南枝", "一场迟到的真相，让两个家庭重新面对被掩埋多年的情感。", "novel-2.jpg", ["都市", "情感"]],
        ["冲掉心中爱的余味", "林晚", "告别并不意味着遗忘，而是终于敢于开始新的生活。", "novel-3.jpg", ["现实", "女性"]],
        ["人见不相逢", "迟月", "命运让他们数次擦肩，真相却将所有选择重新串联。", "novel-4.jpg", ["悬疑", "爱情"]],
        ["山河不斜，故人归", "云川", "山河动荡之中，少年将军与旧友共同守住家国与信念。", "novel-5.jpg", ["古风", "权谋"]],
        ["恨一场桂花雨落", "温言", "旧城桂花再开时，一段被误解的往事终于迎来答案。", "novel-6.jpg", ["年代", "情感"]]
      ]
    },
    scripts: {
      eyebrow: "SCRIPT DEVELOPMENT",
      title: "让每一个故事，都具备走向成片的可能",
      copy: "围绕专业漫剧生产提供标准化、可改编、可发行的剧本内容。",
      capabilities: [
        ["01", "小说智能改编", "提炼小说情节与角色，快速生成结构清晰的标准化漫剧剧本。"],
        ["02", "AI原创剧本", "输入创意或故事设定，智能完成大纲、角色与分集剧本创作。"],
        ["03", "漫剧制作与出海", "AI驱动剧本快速成片，贯通本地化适配与海外发行。"]
      ],
      segments: ["全部", "女频", "男频", "独家"],
      placeholder: "搜索剧本名称、作者",
      cards: [
        ["诊室全程录音后，她慌了", "24集", "work-6.jpg"], ["满级福星驾到", "36集", "work-3.jpg"],
        ["重生之我不是软柿子", "30集", "work-5.jpg"], ["二十年终得昭雪", "28集", "work-2.jpg"],
        ["掌心焰", "40集", "work-4.jpg"], ["归来仍是少年", "32集", "work-1.jpg"],
        ["双颜策", "24集", "work-7.jpg"], ["误入旧时光", "30集", "novel-5.jpg"]
      ]
    },
    agents: {
      eyebrow: "AI CREATIVE TOOLKIT",
      title: "Agent工具，让创作更快一步",
      copy: "覆盖画面增强、多语本地化与声音塑造，把重复工作交给AI，把时间留给创意。",
      features: [
        ["视频创作", "生成、剪辑与镜头优化一体化，快速完成可用视频内容。", "agent-1.png", "clapperboard"],
        ["图片创作", "从角色设定到场景生成，保持视觉风格与人物形象一致。", "agent-2.png", "image"],
        ["音频创作", "智能配音、音色塑造与音效生成，让每个角色拥有鲜明声音。", "agent-3.png", "audio-lines"]
      ],
      groups: [
        ["sparkles", "画面增强", [["AI超分", "2K/4K"], ["智能擦除", "画面修复"], ["视频补帧", "流畅增强"]]],
        ["languages", "多语本地化", [["多语翻译", "40+语言"], ["智能字幕", "自动校对"], ["口型同步", "自然适配"]]],
        ["mic-2", "声音塑造", [["音色克隆", "角色一致"], ["智能配音", "情绪可控"], ["音效生成", "场景匹配"]]]
      ]
    },
    assets: {
      eyebrow: "CREATIVE ASSET HUB", title: "生产资产，集中沉淀与高效复用", copy: "统一管理角色、场景、镜头与声音资产，为规模化漫剧生产建立可复用的内容基础。",
      cards: [["user-round", "角色资产", "人物形象、表情、服装与姿态设定"], ["landmark", "场景资产", "室内外场景与世界观环境"], ["camera", "镜头资产", "分镜模板、运镜与视觉特效"], ["audio-waveform", "声音资产", "角色音色、背景音乐与环境音效"]]
    },
    studio: {
      title: "漫剧创作工作台", tabs: [["script", "AI剧本", "scroll-text"], ["novel", "小说创作", "book-open-text"], ["drama", "漫剧制作", "clapperboard"]],
      panels: {
        script: ["AI剧本创作", "描述故事设定、人物关系或核心冲突，生成结构化漫剧剧本。", "例如：一位失去记忆的刑警，在追查连环案件时发现嫌疑人正是过去的自己……", ["题材", "目标集数", "受众"], ["悬疑", "24集", "男频"]],
        novel: ["小说智能创作", "输入主题与灵感，完成世界观、大纲及章节内容。", "例如：现代都市，女主继承一家濒临倒闭的老书店，却发现每本书都连接着一段真实人生……", ["篇幅", "叙事视角", "风格"], ["短篇", "第三人称", "治愈"]],
        drama: ["漫剧智能制作", "导入剧本或描述画面风格，创建角色、分镜并生成成片。", "粘贴剧本内容，或描述期望的角色与画面风格……", ["画面比例", "视觉风格", "清晰度"], ["9:16", "都市电影感", "1080P"]]
      },
      generate: "智能生成"
    }
  },
  global: {
    lang: "en",
    nav: [["home", "Home"], ["novels", "IP Library"], ["scripts", "Scripts"], ["assets", "Assets"], ["agents", "AI Tools"], ["studio", "Drama Studio"]],
    business: "Partnership",
    privacy: "Privacy",
    footer: "Made for stories that travel beyond borders.",
    home: {
      badge: "Global Content Edition",
      heroImage: "./assets/hero-global.jpg",
      eyebrow: "GLOBAL AI DRAMA STUDIO",
      title: "Create locally. Scale stories globally.",
      copy: "An end-to-end AI drama platform for international studios, covering story development, production, localization and global distribution.",
      proof: ["Global IP sourcing", "AI-native production", "Multi-market distribution"],
      banners: [
        { image: "./assets/banner-infinite-canvas.png", theme: "cool", badge: "NOW LIVE", eyebrow: "INFINITE CANVAS", title: "One canvas. No creative boundaries.", copy: "Arrange characters, scenes, shots and assets freely, then move from first idea to final episode in one connected workspace.", proof: ["Free-form layout", "Connected workflow", "Team collaboration"] },
        { image: "./assets/banner-seedance-2-5.png", theme: "warm", badge: "COMING SOON", eyebrow: "SEEDANCE 2.5", title: "A new generation of motion storytelling", copy: "Stronger character consistency, shot continuity and natural motion for production-ready AI drama video.", proof: ["Stable characters", "Continuous shots", "Natural motion"] },
        { image: "./assets/hero-global.jpg", theme: "brand", badge: "Global Content Edition", eyebrow: "GLOBAL AI DRAMA STUDIO", title: "Create locally. Scale stories globally.", copy: "An end-to-end AI drama platform for international studios, covering story development, production, localization and global distribution.", proof: ["Global IP sourcing", "AI-native production", "Multi-market distribution"] }
      ],
      creationTitle: "Create for every market",
      creationIntro: "Move from concept to localized episodes in one production-ready workflow.",
      creation: [
        { icon: "scroll-text", title: "AI Script Studio", desc: "Turn an idea into structured outlines, characters and episodic scripts.", action: "Create a script", tab: "script" },
        { icon: "book-open-text", title: "Story Development", desc: "Develop original stories with market-aware genres and narrative structures.", action: "Develop a story", tab: "novel" },
        { icon: "clapperboard", title: "Drama Production", desc: "Build consistent characters, shots, voices and localized final episodes.", action: "Enter studio", tab: "drama" }
      ],
      worksTitle: "Global selections",
      worksIntro: "Curated highlight reels developed for international audiences, with localized storytelling and market-ready production.",
      works: [
        ["Neon Afterlight", "A courier discovers that every delivery rewrites a stranger's memory in a near-future megacity.", "work-2.jpg", "Sci-Fi", "34.8k"],
        ["The Last Oracle", "An exiled guardian races across a fractured kingdom to stop a prophecy from becoming history.", "work-4.jpg", "Fantasy", "51.2k"],
        ["Borrowed Name", "A hidden identity pulls two rival families into a high-stakes romance built on secrets.", "work-6.jpg", "Romance", "29.4k"],
        ["Mask of the Pharaoh", "A restoration team awakens an ancient intelligence buried beneath a forgotten tomb.", "work-3.jpg", "Mystery", "22.7k"],
        ["Second Life Protocol", "A disgraced engineer wakes inside the simulation she was blamed for destroying.", "work-1.jpg", "Thriller", "41.6k"]
      ],
      lifecycleTitle: "One platform. Every stage.",
      lifecycleIntro: "Source stories, produce at scale and distribute across markets with one connected content pipeline.",
      lifecycle: [
        ["01", "Source · Global stories", "Discover adaptable stories and partner with creators across regions."],
        ["02", "Produce · AI workflow", "Build scripts, characters, shots, visuals and voices at production scale."],
        ["03", "Distribute · Worldwide", "Localize and deliver content across platforms, regions and languages."]
      ]
    },
    novels: {
      eyebrow: "GLOBAL IP DISCOVERY", title: "Stories with global adaptation potential", copy: "A curated selection of international story IP, evaluated for format, audience and market fit.", actions: ["Submit a story", "Partner with us"],
      capabilities: [["globe-2", "Market fit", "Evaluate genre and audience signals across regions."], ["scan-text", "Story intelligence", "Extract characters, conflicts and adaptation highlights."], ["languages", "Localization ready", "Plan cultural adaptation from the first draft."], ["handshake", "Co-development", "Connect rights, production and distribution partners."]],
      segments: ["All", "Romance", "Fantasy", "Mystery"], placeholder: "Search title or creator",
      cards: [["Glass Harbor", "Maya Levin", "A marine biologist returns to an island where the tide reveals memories instead of wreckage.", "novel-2.jpg", ["Mystery", "EU"]], ["The Crownless City", "D. K. Rowan", "Every citizen wears a borrowed identity until one archivist discovers her own name.", "novel-5.jpg", ["Fantasy", "Global"]], ["Letters from Mars", "Elena Park", "A delayed message from the first Mars colony changes one family's past and Earth's future.", "novel-1.jpg", ["Sci-Fi", "NA"]], ["When Monsoon Ends", "Asha Mehta", "Two former friends rebuild a community radio station and the trust they lost years ago.", "novel-6.jpg", ["Romance", "SEA"]], ["The Quiet Algorithm", "Jon Bell", "A predictive model goes silent only hours before each impossible crime.", "novel-3.jpg", ["Thriller", "Global"]], ["House of Paper Suns", "Noa Santos", "Three sisters inherit a print shop that can reproduce moments from forgotten lives.", "novel-4.jpg", ["Drama", "LATAM"]]]
    },
    scripts: {
      eyebrow: "MARKET-READY SCRIPTS", title: "Scripts built to cross languages and borders", copy: "Discover production-ready episodic scripts designed for localization, adaptation and worldwide distribution.",
      capabilities: [["01", "IP adaptation", "Convert licensed stories into structured, episodic drama scripts."], ["02", "Original development", "Create original outlines, characters and episodes with AI support."], ["03", "Localization & launch", "Adapt scripts for local culture, produce faster and distribute globally."]],
      segments: ["All", "Romance", "Fantasy", "Thriller"], placeholder: "Search script or creator",
      cards: [["Neon Afterlight", "24 eps", "work-2.jpg"], ["The Last Oracle", "30 eps", "work-4.jpg"], ["Borrowed Name", "24 eps", "work-6.jpg"], ["Mask of the Pharaoh", "18 eps", "work-3.jpg"], ["Second Life Protocol", "32 eps", "work-1.jpg"], ["House of Paper Suns", "20 eps", "novel-4.jpg"], ["Monsoon Frequency", "24 eps", "novel-6.jpg"], ["Glass Harbor", "28 eps", "novel-2.jpg"]]
    },
    agents: {
      eyebrow: "AI CREATIVE TOOLKIT", title: "Production intelligence for every market", copy: "Enhance visuals, localize dialogue and shape distinctive voices with AI tools built for global drama teams.",
      features: [["Video production", "Generate, edit and enhance shots in one production workflow.", "agent-1.png", "clapperboard"], ["Image production", "Create consistent characters, locations and visual styles.", "agent-2.png", "image"], ["Voice production", "Build multilingual voices, dialogue and scene-aware sound.", "agent-3.png", "audio-lines"]],
      groups: [["sparkles", "Visual enhancement", [["AI upscale", "2K/4K"], ["Smart erase", "Inpainting"], ["Frame interpolation", "Smooth motion"]]], ["languages", "Localization", [["Translation", "40+ languages"], ["Smart subtitles", "Auto review"], ["Lip sync", "Natural timing"]]], ["mic-2", "Voice design", [["Voice cloning", "Character lock"], ["AI dubbing", "Emotion control"], ["Sound generation", "Scene aware"]]]]
    },
    assets: {
      eyebrow: "GLOBAL ASSET HUB", title: "Reusable assets for international production", copy: "Manage consistent characters, locations, shots and voices for multi-market drama production.",
      cards: [["user-round", "Characters", "Identity, wardrobe, expressions and poses"], ["landmark", "Locations", "Worlds, environments and local variants"], ["camera", "Shots", "Shot templates, camera motion and effects"], ["audio-waveform", "Audio", "Voices, music and environmental sound"]]
    },
    studio: {
      title: "Global Drama Studio", tabs: [["script", "AI Script", "scroll-text"], ["novel", "Story", "book-open-text"], ["drama", "Production", "clapperboard"]],
      panels: {
        script: ["AI script development", "Describe your concept, characters or central conflict to create a structured episodic script.", "Example: A memory investigator discovers that the suspect in a series of impossible crimes is her future self...", ["Genre", "Episodes", "Market"], ["Thriller", "24 episodes", "Global"]],
        novel: ["Original story development", "Develop the world, outline and chapters from a single idea.", "Example: A radio host receives calls from listeners living exactly twenty years in the future...", ["Length", "Point of view", "Tone"], ["Short form", "Third person", "Cinematic"]],
        drama: ["Localized drama production", "Import a script, define the visual direction and create a localized episode package.", "Paste a script or describe your characters and visual direction...", ["Aspect ratio", "Visual style", "Output"], ["9:16", "Cinematic", "1080P"]]
      },
      generate: "Generate with AI"
    }
  }
};

const state = { edition: localStorage.getItem("rlwx-edition") || "cn", route: location.hash.slice(1) || "home", studioTab: "script", bannerIndex: 0 };
let bannerTimer;
const app = document.getElementById("app");
const primaryNav = document.getElementById("primaryNav");
const toast = document.getElementById("toast");
const modalBackdrop = document.getElementById("modalBackdrop");
const dialogContent = document.getElementById("dialogContent");

function icon(name) { return `<i data-lucide="${name}" aria-hidden="true"></i>`; }
function esc(value) { return String(value).replace(/[&<>"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"})[c]); }
function refreshIcons() { if (window.lucide) window.lucide.createIcons({ attrs: { "stroke-width": 1.8 } }); }
function showToast(message) { toast.textContent = message; toast.classList.add("show"); clearTimeout(showToast.timer); showToast.timer = setTimeout(() => toast.classList.remove("show"), 2200); }

function renderNav() {
  const data = editions[state.edition];
  document.documentElement.lang = data.lang;
  primaryNav.innerHTML = data.nav.map(([route, label]) => `<a class="nav-link ${state.route === route ? "active" : ""}" href="#${route}" data-route="${route}">${label}</a>`).join("");
  document.querySelector("[data-i18n='business']").textContent = data.business;
  document.getElementById("footerStatement").textContent = data.footer;
  document.getElementById("privacyLink").textContent = data.privacy;
  document.querySelectorAll(".edition-option").forEach(button => button.classList.toggle("active", button.dataset.edition === state.edition));
}

function pageShell(content, configText) {
  const configLabel = state.edition === "cn" ? "配置口径" : "Configuration rule";
  return `<div class="page">${content}<aside class="config-note"><div><strong>${configLabel}</strong><p>${configText}</p></div>${icon("database")}</aside></div>`;
}

function homePage() {
  const d = editions[state.edition].home;
  const config = state.edition === "cn"
    ? "首页轮播按“国内 / 海外”独立配置；无限画布已更新为上线状态，新增 Seedance 2.5 即将上线 Banner。优质作品、小说IP与剧本继续读取对应版本内容池。"
    : "Hero banners are managed in separate Domestic / Global pools. Infinite Canvas is now live and a Seedance 2.5 coming-soon banner has been added.";
  return pageShell(`
    <section class="hero hero-carousel" aria-label="首页功能轮播">
      ${d.banners.map((banner, bannerIndex) => `<article class="hero-slide theme-${banner.theme} ${bannerIndex === state.bannerIndex ? "active" : ""}" data-banner-slide="${bannerIndex}" aria-hidden="${bannerIndex === state.bannerIndex ? "false" : "true"}">
        <img class="hero-media" src="${banner.image}" alt="">
        <span class="edition-badge">${banner.badge}</span>
        <div class="hero-content">
          <p class="eyebrow">${banner.eyebrow}</p>
          <h1>${banner.title}</h1>
          <p class="hero-copy">${banner.copy}</p>
          <div class="hero-proof">${banner.proof.map((item, index) => `<span>${icon(["panels-top-left", "sparkles", "users-round"][index])}${item}</span>`).join("")}</div>
        </div>
      </article>`).join("")}
      <button class="banner-arrow previous" type="button" data-banner-direction="-1" aria-label="上一张">${icon("chevron-left")}</button>
      <button class="banner-arrow next" type="button" data-banner-direction="1" aria-label="下一张">${icon("chevron-right")}</button>
      <div class="banner-dots" role="tablist" aria-label="选择Banner">${d.banners.map((_, index) => `<button class="banner-dot ${index === state.bannerIndex ? "active" : ""}" type="button" data-banner-index="${index}" aria-label="第${index + 1}张"></button>`).join("")}</div>
    </section>
    <section class="section">
      <div class="section-heading"><div><p class="section-kicker">QUICK CREATE</p><h2>${d.creationTitle}</h2><p class="section-intro">${d.creationIntro}</p></div></div>
      <div class="creation-grid">${d.creation.map(item => `<article class="creation-card" data-go-studio="${item.tab}" tabindex="0"><div class="creation-icon">${icon(item.icon)}</div><h3>${item.title}</h3><p>${item.desc}</p><div class="card-action"><span>${item.action}</span>${icon("arrow-right")}</div></article>`).join("")}</div>
    </section>
    <section class="section">
      <div class="section-heading"><div><p class="section-kicker">CURATED HIGHLIGHTS</p><h2>${d.worksTitle}</h2><p class="section-intro">${d.worksIntro}</p></div><a class="text-link" href="#scripts" data-route="scripts">${state.edition === "cn" ? "查看全部" : "View all"}${icon("arrow-right")}</a></div>
      <div class="works-grid">${d.works.map((work, index) => workCard(work, index)).join("")}</div>
    </section>
    <section class="section">
      <div class="section-heading"><div><p class="section-kicker">END-TO-END ECOSYSTEM</p><h2>${d.lifecycleTitle}</h2><p class="section-intro">${d.lifecycleIntro}</p></div></div>
      <div class="lifecycle">${d.lifecycle.map(item => `<article class="lifecycle-item"><span class="lifecycle-no">${item[0]}</span><h3>${item[1]}</h3><p>${item[2]}</p></article>`).join("")}</div>
    </section>`, config);
}

function workCard(work, index) {
  return `<article class="work-card" data-work="${index}" tabindex="0"><div class="work-media"><img src="./assets/${work[2]}" alt="${esc(work[0])}" loading="lazy"><span class="work-tag">${work[3]}</span><span class="play-button">${icon("play")}</span></div><div class="work-meta"><h3 class="work-title" title="${esc(work[0])}">${work[0]}</h3><p class="work-description">${work[1]}</p><div class="work-stats"><span>${icon("play")}${work[4]}</span><span>${icon("badge-check")}${state.edition === "cn" ? "精选" : "Curated"}</span></div></div></article>`;
}

function pageHero(data, actions = "") {
  return `<section class="page-hero"><div class="page-hero-content"><p class="eyebrow">${data.eyebrow}</p><h1>${data.title}</h1><p>${data.copy}</p>${actions}</div></section>`;
}

function capabilityBand(items) {
  return `<div class="capability-band">${items.map(item => `<article class="capability-item">${icon(item[0])}<h3>${item[1]}</h3><p>${item[2]}</p></article>`).join("")}</div>`;
}

function filterBar(segments, placeholder) {
  return `<div class="filter-bar"><div class="segmented" role="group">${segments.map((item, index) => `<button class="segment ${index === 0 ? "active" : ""}" type="button">${item}</button>`).join("")}</div><label class="search-field">${icon("search")}<input type="search" placeholder="${placeholder}" aria-label="${placeholder}"></label></div>`;
}

function novelsPage() {
  const d = editions[state.edition].novels;
  const actions = `<div class="page-hero-actions"><button class="button primary" type="button" data-lead="${d.actions[0]}">${d.actions[0]}</button><button class="button ghost" type="button" data-lead="${d.actions[1]}">${d.actions[1]}</button></div>`;
  const config = state.edition === "cn" ? "绿台小说IP配置新增必填字段“类型”，枚举为“国内、海外”；筛选、列表及新增/编辑弹窗同步展示，两个内容池独立排序与上下架。" : "The admin Novel IP module requires a Domestic / Global type on filters, lists and create/edit forms. Both pools have independent ordering and publishing states.";
  return pageShell(`${pageHero(d, actions)}${capabilityBand(d.capabilities)}${filterBar(d.segments, d.placeholder)}<div class="novel-grid" data-filter-grid>${d.cards.map(card => `<article class="novel-card" data-title="${esc(card[0] + " " + card[1])}"><img class="novel-cover" src="./assets/${card[3]}" alt="${esc(card[0])}" loading="lazy"><div class="novel-body"><h3>${card[0]}</h3><p>${card[2]}</p><div class="novel-labels"><span class="pill">${card[1]}</span>${card[4].map(tag => `<span class="pill">${tag}</span>`).join("")}</div></div></article>`).join("")}</div>`, config);
}

function scriptsPage() {
  const d = editions[state.edition].scripts;
  const config = state.edition === "cn" ? "绿台剧本配置新增必填字段“类型”，枚举为“国内、海外”；筛选、列表及新增/编辑弹窗同步展示，官网仅展示当前版本对应内容。" : "The admin Script module requires a Domestic / Global type on filters, lists and create/edit forms. The website only reads the active edition's content.";
  return pageShell(`${pageHero(d)}<div class="script-capabilities">${d.capabilities.map(item => `<article class="script-capability"><strong>${item[0]}</strong><h3>${item[1]}</h3><p>${item[2]}</p></article>`).join("")}</div>${filterBar(d.segments, d.placeholder)}<div class="script-grid" data-filter-grid>${d.cards.map(card => `<article class="poster-card" data-title="${esc(card[0])}" tabindex="0"><div class="poster-media"><img src="./assets/${card[2]}" alt="${esc(card[0])}" loading="lazy"></div><div class="poster-meta"><h3>${card[0]}</h3><span>${card[1]}</span></div></article>`).join("")}</div>`, config);
}

function agentsPage() {
  const d = editions[state.edition].agents;
  const config = state.edition === "cn" ? "海外版Agent入口、能力介绍和推荐顺序按海外业务独立配置；工具功能本身可复用，展示内容与市场入口不共用。" : "Global tool entry points, descriptions and recommendations are configured independently for overseas operations; core tools may be shared.";
  return pageShell(`${pageHero(d)}<div class="agent-feature-grid">${d.features.map(item => `<article class="agent-feature"><div><h3>${item[0]}</h3><p>${item[1]}</p><button class="button small" type="button" data-agent="${item[0]}">${icon(item[3])}${state.edition === "cn" ? "去创作" : "Open tool"}</button></div><img src="./assets/${item[2]}" alt="" loading="lazy"></article>`).join("")}</div><section class="section"><div class="section-heading"><div><p class="section-kicker">PRODUCTION UTILITIES</p><h2>${state.edition === "cn" ? "专业能力矩阵" : "Production utility matrix"}</h2></div></div><div class="tool-groups">${d.groups.map(group => `<article class="tool-group"><div class="tool-group-heading">${icon(group[0])}<h3>${group[1]}</h3></div><ul class="tool-list">${group[2].map(tool => `<li><button type="button" data-agent="${tool[0]}" class="text-link">${tool[0]}</button><span>${tool[1]}</span></li>`).join("")}</ul></article>`).join("")}</div></section>`, config);
}

function assetsPage() {
  const d = editions[state.edition].assets;
  const config = state.edition === "cn" ? "资产内容根据当前版本读取国内或海外资产池，海外资产应包含本地化命名、语言及区域适用范围。" : "The active edition reads from its own asset pool. Global assets include localized naming, languages and market availability.";
  return pageShell(`${pageHero(d)}<div class="asset-grid">${d.cards.map(card => `<article class="asset-card">${icon(card[0])}<h3>${card[1]}</h3><p>${card[2]}</p></article>`).join("")}</div>`, config);
}

function studioPage() {
  const d = editions[state.edition].studio;
  const panel = d.panels[state.studioTab];
  const config = state.edition === "cn" ? "创作工作台随版本自动切换默认市场、语言与内容推荐；国内项目与海外项目的数据、草稿和生成记录独立保存。" : "The studio switches default market, language and recommendations with the edition. Domestic and Global projects, drafts and generation history are stored independently.";
  return pageShell(`<section class="studio-shell"><aside class="studio-sidebar"><p class="section-kicker">AI WORKSPACE</p><h1>${d.title}</h1><div class="studio-tabs">${d.tabs.map(tab => `<button class="studio-tab ${state.studioTab === tab[0] ? "active" : ""}" type="button" data-studio-tab="${tab[0]}">${icon(tab[2])}${tab[1]}</button>`).join("")}</div><p class="studio-note">${state.edition === "cn" ? "当前项目将创建在国内内容空间。切换版本后，项目与素材不会混用。" : "This project will be created in the Global workspace. Edition data is kept separate."}</p></aside><div class="studio-main"><h2>${panel[0]}</h2><p>${panel[1]}</p><label class="form-label" for="promptInput">${state.edition === "cn" ? "创作描述" : "Creative brief"}</label><textarea class="prompt-box" id="promptInput" placeholder="${panel[2]}"></textarea><div class="studio-options">${panel[3].map((label, index) => `<label class="option-field"><span class="form-label">${label}</span><select class="form-control"><option>${panel[4][index]}</option></select></label>`).join("")}</div><div class="studio-footer"><div class="studio-steps"><span class="active"></span><span></span><span></span>${state.edition === "cn" ? "描述 · 设定 · 生成" : "Brief · Setup · Generate"}</div><button class="button primary large" type="button" id="generateButton">${icon("sparkles")}${d.generate}</button></div></div></section>`, config);
}

function render() {
  clearInterval(bannerTimer);
  const validRoutes = ["home", "novels", "scripts", "assets", "agents", "studio"];
  if (!validRoutes.includes(state.route)) state.route = "home";
  renderNav();
  const pages = { home: homePage, novels: novelsPage, scripts: scriptsPage, assets: assetsPage, agents: agentsPage, studio: studioPage };
  app.innerHTML = pages[state.route]();
  bindPageInteractions();
  refreshIcons();
  window.scrollTo({ top: 0, behavior: "instant" });
}

function bindPageInteractions() {
  document.querySelectorAll("[data-route]").forEach(link => link.addEventListener("click", event => {
    event.preventDefault();
    state.route = link.dataset.route;
    location.hash = state.route;
    document.getElementById("mobileMenu").setAttribute("aria-expanded", "false");
    primaryNav.classList.remove("open");
    render();
  }));
  document.querySelectorAll("[data-go-studio]").forEach(item => {
    const go = () => { state.studioTab = item.dataset.goStudio; state.route = "studio"; location.hash = "studio"; render(); };
    item.addEventListener("click", go);
    item.addEventListener("keydown", event => { if (event.key === "Enter" || event.key === " ") go(); });
  });
  bindBannerInteractions();
  document.querySelectorAll(".segment").forEach(button => button.addEventListener("click", () => {
    button.closest(".segmented").querySelectorAll(".segment").forEach(item => item.classList.remove("active"));
    button.classList.add("active");
    showToast(state.edition === "cn" ? `已筛选：${button.textContent}` : `Filtered: ${button.textContent}`);
  }));
  document.querySelectorAll(".search-field input").forEach(input => input.addEventListener("input", () => {
    const query = input.value.trim().toLowerCase();
    const grid = input.closest(".filter-bar").nextElementSibling;
    if (!grid) return;
    grid.querySelectorAll("[data-title]").forEach(card => { card.style.display = card.dataset.title.toLowerCase().includes(query) ? "" : "none"; });
  }));
  document.querySelectorAll("[data-studio-tab]").forEach(button => button.addEventListener("click", () => { state.studioTab = button.dataset.studioTab; render(); }));
  document.querySelectorAll("[data-work]").forEach(card => {
    const open = () => openWorkDialog(Number(card.dataset.work));
    card.addEventListener("click", open);
    card.addEventListener("keydown", event => { if (event.key === "Enter" || event.key === " ") open(); });
  });
  document.querySelectorAll("[data-lead]").forEach(button => button.addEventListener("click", () => showToast(state.edition === "cn" ? `${button.dataset.lead}入口已打开` : `${button.dataset.lead} form opened`)));
  document.querySelectorAll("[data-agent]").forEach(button => button.addEventListener("click", () => showToast(state.edition === "cn" ? `${button.dataset.agent}工具即将打开` : `Opening ${button.dataset.agent}`)));
  const generate = document.getElementById("generateButton");
  if (generate) generate.addEventListener("click", () => {
    const input = document.getElementById("promptInput");
    if (!input.value.trim()) { input.focus(); showToast(state.edition === "cn" ? "请先输入创作描述" : "Add a creative brief first"); return; }
    showToast(state.edition === "cn" ? "创作任务已生成，正在进入下一步" : "Task created. Moving to the next step.");
  });
}

function bindBannerInteractions() {
  clearInterval(bannerTimer);
  const slides = [...document.querySelectorAll("[data-banner-slide]")];
  if (!slides.length) return;
  const activate = index => {
    state.bannerIndex = (index + slides.length) % slides.length;
    slides.forEach((slide, slideIndex) => {
      const active = slideIndex === state.bannerIndex;
      slide.classList.toggle("active", active);
      slide.setAttribute("aria-hidden", String(!active));
    });
    document.querySelectorAll("[data-banner-index]").forEach((dot, dotIndex) => dot.classList.toggle("active", dotIndex === state.bannerIndex));
  };
  document.querySelectorAll("[data-banner-direction]").forEach(button => button.addEventListener("click", () => activate(state.bannerIndex + Number(button.dataset.bannerDirection))));
  document.querySelectorAll("[data-banner-index]").forEach(button => button.addEventListener("click", () => activate(Number(button.dataset.bannerIndex))));
  bannerTimer = setInterval(() => activate(state.bannerIndex + 1), 6500);
}

function openWorkDialog(index) {
  const work = editions[state.edition].home.works[index];
  dialogContent.innerHTML = `<h2>${work[0]}</h2><p>${work[1]}</p><div class="dialog-video"><img src="./assets/${work[2]}" alt="${esc(work[0])}"></div><div class="dialog-actions"><button class="button ghost" type="button" data-dialog-cancel>${state.edition === "cn" ? "关闭" : "Close"}</button><button class="button primary" type="button" data-route-dialog="scripts">${state.edition === "cn" ? "查看剧本" : "View script"}</button></div>`;
  modalBackdrop.hidden = false;
  document.body.style.overflow = "hidden";
  dialogContent.querySelector("[data-dialog-cancel]").addEventListener("click", closeDialog);
  dialogContent.querySelector("[data-route-dialog]").addEventListener("click", () => { closeDialog(); state.route = "scripts"; location.hash = "scripts"; render(); });
  refreshIcons();
}

function closeDialog() { modalBackdrop.hidden = true; document.body.style.overflow = ""; }

document.querySelectorAll(".edition-option").forEach(button => button.addEventListener("click", () => {
  if (state.edition === button.dataset.edition) return;
  state.edition = button.dataset.edition;
  state.bannerIndex = 0;
  localStorage.setItem("rlwx-edition", state.edition);
  render();
  showToast(state.edition === "cn" ? "已切换至国内版内容" : "Global content loaded");
}));
document.getElementById("mobileMenu").addEventListener("click", event => {
  const expanded = event.currentTarget.getAttribute("aria-expanded") === "true";
  event.currentTarget.setAttribute("aria-expanded", String(!expanded));
  primaryNav.classList.toggle("open", !expanded);
});
document.getElementById("dialogClose").addEventListener("click", closeDialog);
modalBackdrop.addEventListener("click", event => { if (event.target === modalBackdrop) closeDialog(); });
document.addEventListener("keydown", event => { if (event.key === "Escape" && !modalBackdrop.hidden) closeDialog(); });
window.addEventListener("hashchange", () => { const route = location.hash.slice(1); if (route && route !== state.route) { state.route = route; render(); } });

render();
