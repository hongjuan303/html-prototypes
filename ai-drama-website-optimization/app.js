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
        { image: "./assets/banner-infinite-canvas.png", theme: "cool", baked: true, badge: "已上线", eyebrow: "INFINITE CANVAS", title: "无限画布", copy: "让灵感无限延展，让创作全局尽在掌控。", proof: ["自由编排", "全局联动", "多人协作"] },
        { image: "./assets/banner-seedance-2-5.png", theme: "warm", baked: true, badge: "即将上线", eyebrow: "SEEDANCE 2.5", title: "动态叙事，再进化", copy: "更强角色一致性、镜头连续性与运动表现，高品质漫剧视频生成能力即将抵达。", proof: ["角色更稳定", "镜头更连贯", "动态更自然"] },
        { image: "./assets/hero-cn.jpg", theme: "brand", badge: "国内内容生态", eyebrow: "AI DRAMA PRODUCTION PLATFORM", title: "全产业链驱动，让好故事走向全球", copy: "从优质IP、智能创作到全域发行，为专业内容团队提供一站式漫剧生产能力。", proof: ["IP内容供给", "AI规模生产", "全域发行增长"] }
      ],
      creationTitle: "多能力创作入口",
      creationIntro: "从灵感、小说到剧本与成片，在同一套工作流中完成专业创作。",
      creation: [
        { icon: "scroll-text", title: "AI剧本", desc: "输入故事设定，智能完成大纲、角色与分集剧本创作。", action: "开始剧本创作", tab: "script" },
        { icon: "book-open-text", title: "小说创作", desc: "从题材定位到章节续写，让创意快速成长为完整故事。", action: "开始小说创作", tab: "novel" },
        { icon: "panels-top-left", title: "无限画布", desc: "在同一画布组织角色、场景、分镜与素材，让创作全局清晰可控。", action: "进入无限画布", tab: "canvas" }
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
      channels: ["全部频道", "女频", "男频"],
      categories: ["全部分类", "都市", "古风", "悬疑", "玄幻"],
      placeholder: "搜索剧本名称、作者",
      cards: [
        ["诊室全程录音后，她慌了", "佚名", "一段被完整保留的诊室录音，揭开了精心掩饰多年的真相。", "work-6.jpg", "女频", "都市", "24集"],
        ["满级福星驾到", "夏月儿", "天降福星卷入家族纷争，用好运与智慧改写所有人的命运。", "work-3.jpg", "女频", "古风", "36集"],
        ["重生之我不是软柿子", "林见", "重来一次，她不再退让，要把失去的人生主动权全部夺回。", "work-5.jpg", "女频", "都市", "30集"],
        ["二十年终得昭雪", "陆川", "沉寂二十年的旧案重启，所有证词都指向最不可能的人。", "work-2.jpg", "男频", "悬疑", "28集"],
        ["掌心焰", "云回", "少年身负异火踏上修行路，在追杀与背叛中寻找身世答案。", "work-4.jpg", "男频", "玄幻", "40集"],
        ["归来仍是少年", "夏月儿", "离乡多年后重返故城，他必须直面未完成的约定与选择。", "work-1.jpg", "男频", "都市", "32集"],
        ["双颜策", "顾辞", "双生身份卷入朝堂暗局，一场关于选择与守护的东方奇谭。", "work-7.jpg", "女频", "古风", "24集"],
        ["误入旧时光", "温言", "一封来自旧时光的信，让两个年代的人生轨迹产生交集。", "novel-5.jpg", "女频", "悬疑", "30集"]
      ]
    },
    agents: {
      eyebrow: "AI CREATIVE TOOLKIT",
      title: "Agent工具，让创作更快一步",
      copy: "覆盖画面增强、多语本地化与声音塑造，把重复工作交给AI，把时间留给创意。",
      features: [
        ["视频创作", "生成、剪辑与镜头优化一体化，快速完成可用视频内容。", "agent-1.png", "clapperboard"],
        ["图片创作", "从角色设定到场景生成，保持视觉风格与人物形象一致。", "agent-2.png", "image"],
        ["音频创作", "智能配音、音效与背景音乐协同生成，构建沉浸式声音体验。", "agent-3.png", "audio-lines"],
        ["AI超分", "智能增强画面分辨率、纹理与边缘细节，低清素材也能清晰呈现。", null, "scan-search"],
        ["音色塑造", "克隆、设计并锁定角色音色，让多集配音保持统一且富有情绪。", null, "mic-2"]
      ],
      groups: [
        ["sparkles", "画面增强", [["AI超分", "2K/4K"], ["智能擦除", "画面修复"], ["视频补帧", "流畅增强"]]],
        ["languages", "多语本地化", [["多语翻译", "40+语言"], ["智能字幕", "自动校对"], ["口型同步", "自然适配"]]],
        ["mic-2", "声音塑造", [["音色克隆", "角色一致"], ["智能配音", "情绪可控"], ["音效生成", "场景匹配"]]]
      ]
    },
    assets: {
      tabs: [["characters", "角色库"], ["scenes", "场景库"], ["props", "道具库"]],
      search: "搜索资产名称",
      filterGroups: [["风格", ["全部", "2D风格", "游戏CG风格", "3D风格", "仿真人风格"]], ["性别", ["全部", "男", "女"]], ["年代", ["全部", "民国", "未来科技感", "现代", "古代", "架空/异世界"]], ["国别", ["全部", "国内", "海外"]]],
      items: {
        characters: [
          ["古代红发狐狸", "asset-character-01.png", "2D风格", "女", "古代", "国内"], ["天使女神", "asset-character-02.png", "3D风格", "女", "架空/异世界", "海外"],
          ["森林精灵", "asset-character-03.png", "3D风格", "女", "架空/异世界", "海外"], ["半兽人猎人", "asset-character-04.png", "游戏CG风格", "男", "架空/异世界", "海外"],
          ["光之守护者", "asset-character-05.png", "游戏CG风格", "女", "未来科技感", "海外"], ["矮人铁匠", "asset-character-06.png", "3D风格", "男", "架空/异世界", "海外"],
          ["战国武士", "asset-character-07.png", "仿真人风格", "男", "古代", "国内"], ["北欧设计师", "asset-character-08.png", "仿真人风格", "男", "现代", "海外"],
          ["阿拉伯学者", "asset-character-09.png", "仿真人风格", "男", "现代", "海外"], ["未来战士", "asset-character-10.png", "游戏CG风格", "女", "未来科技感", "海外"],
          ["锦衣卫", "asset-character-11.png", "仿真人风格", "男", "古代", "国内"], ["唐朝皇后", "asset-character-12.png", "2D风格", "女", "古代", "国内"]
        ],
        scenes: [["云端之城", "work-2.jpg"], ["未来都市", "work-7.jpg"], ["古代皇城", "work-3.jpg"], ["末日废墟", "work-5.jpg"], ["雪原秘境", "work-4.jpg"], ["旧城街巷", "novel-5.jpg"]],
        props: [["秘银面具", "work-2.jpg"], ["未来装甲", "work-5.jpg"], ["古典折扇", "novel-4.jpg"], ["王室冠冕", "work-3.jpg"], ["能量核心", "work-7.jpg"], ["战术装备", "work-4.jpg"]]
      }
    },
    studio: {
      title: "漫剧创作工作台", tabs: [["script", "AI剧本", "scroll-text"], ["novel", "小说创作", "book-open-text"], ["canvas", "无限画布", "panels-top-left"], ["drama", "漫剧制作", "clapperboard"]],
      panels: {
        script: ["AI剧本创作", "描述故事设定、人物关系或核心冲突，生成结构化漫剧剧本。", "例如：一位失去记忆的刑警，在追查连环案件时发现嫌疑人正是过去的自己……", ["题材", "目标集数", "受众"], ["悬疑", "24集", "男频"]],
        novel: ["小说智能创作", "输入主题与灵感，完成世界观、大纲及章节内容。", "例如：现代都市，女主继承一家濒临倒闭的老书店，却发现每本书都连接着一段真实人生……", ["篇幅", "叙事视角", "风格"], ["短篇", "第三人称", "治愈"]],
        canvas: ["无限画布", "自由组织角色、场景、分镜与素材，在同一视图掌控完整创作脉络。", "描述你的故事目标，或从左侧资产库拖入角色、场景与已有分镜……", ["画布模板", "协作方式", "默认比例"], ["漫剧项目", "团队协作", "9:16"]],
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
        { image: "./assets/banner-infinite-canvas-bg.png", theme: "cool", badge: "NOW LIVE", eyebrow: "INFINITE CANVAS", title: "One canvas. No creative boundaries.", copy: "Arrange characters, scenes, shots and assets freely, then move from first idea to final episode in one connected workspace.", proof: ["Free-form layout", "Connected workflow", "Team collaboration"] },
        { image: "./assets/banner-seedance-2-5-bg.png", theme: "warm", badge: "COMING SOON", eyebrow: "SEEDANCE 2.5", title: "A new generation of motion storytelling", copy: "Stronger character consistency, shot continuity and natural motion for production-ready AI drama video.", proof: ["Stable characters", "Continuous shots", "Natural motion"] },
        { image: "./assets/hero-global.jpg", theme: "brand", badge: "Global Content Edition", eyebrow: "GLOBAL AI DRAMA STUDIO", title: "Create locally. Scale stories globally.", copy: "An end-to-end AI drama platform for international studios, covering story development, production, localization and global distribution.", proof: ["Global IP sourcing", "AI-native production", "Multi-market distribution"] }
      ],
      creationTitle: "Create for every market",
      creationIntro: "Move from concept to localized episodes in one production-ready workflow.",
      creation: [
        { icon: "scroll-text", title: "AI Script Studio", desc: "Turn an idea into structured outlines, characters and episodic scripts.", action: "Create a script", tab: "script" },
        { icon: "book-open-text", title: "Story Development", desc: "Develop original stories with market-aware genres and narrative structures.", action: "Develop a story", tab: "novel" },
        { icon: "panels-top-left", title: "Infinite Canvas", desc: "Organize characters, locations, shots and assets in one connected creative workspace.", action: "Open canvas", tab: "canvas" }
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
      channels: ["All audiences", "Female", "Male"], categories: ["All genres", "Drama", "Fantasy", "Mystery", "Sci-Fi"], placeholder: "Search script or creator",
      cards: [
        ["Neon Afterlight", "Maya Lin", "A courier discovers that every delivery rewrites a stranger's memory in a near-future megacity.", "work-2.jpg", "Female", "Sci-Fi", "24 eps"],
        ["The Last Oracle", "D. K. Rowan", "An exiled guardian races across a fractured kingdom to stop a prophecy becoming history.", "work-4.jpg", "Male", "Fantasy", "30 eps"],
        ["Borrowed Name", "Elena Park", "A hidden identity pulls two rival families into a romance built on carefully guarded secrets.", "work-6.jpg", "Female", "Drama", "24 eps"],
        ["Mask of the Pharaoh", "Noa Santos", "A restoration team awakens an ancient intelligence buried beneath a forgotten tomb.", "work-3.jpg", "Male", "Mystery", "18 eps"],
        ["Second Life Protocol", "Jon Bell", "A disgraced engineer wakes inside the simulation she was blamed for destroying.", "work-1.jpg", "Female", "Sci-Fi", "32 eps"],
        ["House of Paper Suns", "Noa Santos", "Three sisters inherit a print shop that can reproduce moments from forgotten lives.", "novel-4.jpg", "Female", "Fantasy", "20 eps"],
        ["Monsoon Frequency", "Asha Mehta", "A radio signal crossing decades reconnects a family with a future they never expected.", "novel-6.jpg", "Female", "Drama", "24 eps"],
        ["Glass Harbor", "Maya Levin", "An island tide reveals memories instead of wreckage, forcing a scientist to face her past.", "novel-2.jpg", "Male", "Mystery", "28 eps"]
      ]
    },
    agents: {
      eyebrow: "AI CREATIVE TOOLKIT", title: "Production intelligence for every market", copy: "Enhance visuals, localize dialogue and shape distinctive voices with AI tools built for global drama teams.",
      features: [["Video production", "Generate, edit and enhance shots in one production workflow.", "agent-1.png", "clapperboard"], ["Image production", "Create consistent characters, locations and visual styles.", "agent-2.png", "image"], ["Voice production", "Build multilingual voices, dialogue and scene-aware sound.", "agent-3.png", "audio-lines"], ["AI Upscale", "Restore resolution, textures and edge detail for production-ready visual output.", null, "scan-search"], ["Voice Design", "Clone, shape and lock character voices across every localized episode.", null, "mic-2"]],
      groups: [["sparkles", "Visual enhancement", [["AI upscale", "2K/4K"], ["Smart erase", "Inpainting"], ["Frame interpolation", "Smooth motion"]]], ["languages", "Localization", [["Translation", "40+ languages"], ["Smart subtitles", "Auto review"], ["Lip sync", "Natural timing"]]], ["mic-2", "Voice design", [["Voice cloning", "Character lock"], ["AI dubbing", "Emotion control"], ["Sound generation", "Scene aware"]]]]
    },
    assets: {
      tabs: [["characters", "Character Library"], ["scenes", "Scene Library"], ["props", "Prop Library"]],
      search: "Search assets",
      filterGroups: [["Style", ["All", "2D", "Game CG", "3D", "Semi-realistic"]], ["Gender", ["All", "Male", "Female"]], ["Era", ["All", "Republican", "Futuristic", "Modern", "Ancient", "Fantasy"]], ["Region", ["All", "China", "International"]]],
      items: {
        characters: [["Crimson Fox", "asset-character-01.png", "2D", "Female", "Ancient", "China"], ["Celestial Guardian", "asset-character-02.png", "3D", "Female", "Fantasy", "International"], ["Forest Elf", "asset-character-03.png", "3D", "Female", "Fantasy", "International"], ["Orc Hunter", "asset-character-04.png", "Game CG", "Male", "Fantasy", "International"], ["Light Sentinel", "asset-character-05.png", "Game CG", "Female", "Futuristic", "International"], ["Dwarf Smith", "asset-character-06.png", "3D", "Male", "Fantasy", "International"], ["Ancient Warrior", "asset-character-07.png", "Semi-realistic", "Male", "Ancient", "China"], ["Nordic Designer", "asset-character-08.png", "Semi-realistic", "Male", "Modern", "International"], ["Desert Scholar", "asset-character-09.png", "Semi-realistic", "Male", "Modern", "International"], ["Future Ranger", "asset-character-10.png", "Game CG", "Female", "Futuristic", "International"], ["Imperial Guard", "asset-character-11.png", "Semi-realistic", "Male", "Ancient", "China"], ["Tang Empress", "asset-character-12.png", "2D", "Female", "Ancient", "China"]],
        scenes: [["City in the Clouds", "work-2.jpg"], ["Neon Metropolis", "work-7.jpg"], ["Ancient Palace", "work-3.jpg"], ["Aftermath District", "work-5.jpg"], ["Frozen Realm", "work-4.jpg"], ["Old City Street", "novel-5.jpg"]],
        props: [["Silver Mask", "work-2.jpg"], ["Future Armor", "work-5.jpg"], ["Folding Fan", "novel-4.jpg"], ["Royal Crown", "work-3.jpg"], ["Energy Core", "work-7.jpg"], ["Tactical Kit", "work-4.jpg"]]
      }
    },
    studio: {
      title: "Global Drama Studio", tabs: [["script", "AI Script", "scroll-text"], ["novel", "Story", "book-open-text"], ["canvas", "Infinite Canvas", "panels-top-left"], ["drama", "Production", "clapperboard"]],
      panels: {
        script: ["AI script development", "Describe your concept, characters or central conflict to create a structured episodic script.", "Example: A memory investigator discovers that the suspect in a series of impossible crimes is her future self...", ["Genre", "Episodes", "Market"], ["Thriller", "24 episodes", "Global"]],
        novel: ["Original story development", "Develop the world, outline and chapters from a single idea.", "Example: A radio host receives calls from listeners living exactly twenty years in the future...", ["Length", "Point of view", "Tone"], ["Short form", "Third person", "Cinematic"]],
        canvas: ["Infinite Canvas", "Arrange characters, locations, shots and assets in one connected view.", "Describe your production goal, or bring characters, locations and storyboards onto the canvas...", ["Template", "Collaboration", "Aspect ratio"], ["Drama project", "Team", "9:16"]],
        drama: ["Localized drama production", "Import a script, define the visual direction and create a localized episode package.", "Paste a script or describe your characters and visual direction...", ["Aspect ratio", "Visual style", "Output"], ["9:16", "Cinematic", "1080P"]]
      },
      generate: "Generate with AI"
    }
  }
};

const state = { edition: localStorage.getItem("rlwx-edition") || "cn", route: location.hash.slice(1) || "home", studioTab: "script", bannerIndex: 0, assetTab: "characters" };
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

function pageShell(content) { return `<div class="page">${content}</div>`; }

function homePage() {
  const d = editions[state.edition].home;
  const config = state.edition === "cn"
    ? "首页轮播按“国内 / 海外”独立配置；无限画布已更新为上线状态，新增 Seedance 2.5 即将上线 Banner。优质作品、小说IP与剧本继续读取对应版本内容池。"
    : "Hero banners are managed in separate Domestic / Global pools. Infinite Canvas is now live and a Seedance 2.5 coming-soon banner has been added.";
  return pageShell(`
    <section class="hero hero-carousel" aria-label="首页功能轮播">
      ${d.banners.map((banner, bannerIndex) => `<article class="hero-slide theme-${banner.theme} ${banner.baked ? "baked" : ""} ${bannerIndex === state.bannerIndex ? "active" : ""}" data-banner-slide="${bannerIndex}" aria-hidden="${bannerIndex === state.bannerIndex ? "false" : "true"}" aria-label="${banner.badge}：${banner.title}">
        <img class="hero-media" src="${banner.image}" alt="">
        ${banner.baked ? `<div class="sr-only"><p>${banner.eyebrow}</p><h1>${banner.title}</h1><p>${banner.badge}</p><p>${banner.copy}</p></div>` : `
          <span class="edition-badge">${banner.badge}</span>
          <div class="hero-content">
            <p class="eyebrow">${banner.eyebrow}</p>
            <h1>${banner.title}</h1>
            <p class="hero-copy">${banner.copy}</p>
            <div class="hero-proof">${banner.proof.map((item, index) => `<span>${icon(["panels-top-left", "sparkles", "users-round"][index])}${item}</span>`).join("")}</div>
          </div>`}
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

function libraryFilterBar(groups, placeholder) {
  return `<div class="filter-bar library-filter-bar"><div class="library-selects">${groups.map(group => `<label class="library-select"><span class="sr-only">${group.name}</span><select data-library-filter="${group.key}" aria-label="${group.name}">${group.options.map(option => `<option value="${option}">${option}</option>`).join("")}</select>${icon("chevron-down")}</label>`).join("")}</div><label class="search-field">${icon("search")}<input type="search" placeholder="${placeholder}" aria-label="${placeholder}" data-library-search></label></div>`;
}

function novelsPage() {
  const d = editions[state.edition].novels;
  const actions = `<div class="page-hero-actions"><button class="button primary" type="button" data-lead="${d.actions[0]}">${d.actions[0]}</button><button class="button ghost" type="button" data-lead="${d.actions[1]}">${d.actions[1]}</button></div>`;
  const config = state.edition === "cn" ? "绿台小说IP配置新增必填字段“类型”，枚举为“国内、海外”；筛选、列表及新增/编辑弹窗同步展示，两个内容池独立排序与上下架。" : "The admin Novel IP module requires a Domestic / Global type on filters, lists and create/edit forms. Both pools have independent ordering and publishing states.";
  const groups = state.edition === "cn"
    ? [{ name: "篇幅", key: "length", options: ["全部篇幅", "短篇", "中篇"] }, { name: "频道", key: "channel", options: ["全部频道", "女频", "男频"] }, { name: "分类", key: "category", options: ["全部分类", "现代言情", "古代言情", "悬疑", "现实"] }]
    : [{ name: "Length", key: "length", options: ["All lengths", "Short form", "Series"] }, { name: "Audience", key: "channel", options: ["All audiences", "Female", "Male"] }, { name: "Genre", key: "category", options: ["All genres", "Romance", "Fantasy", "Mystery", "Drama"] }];
  return pageShell(`${pageHero(d, actions)}${capabilityBand(d.capabilities)}${libraryFilterBar(groups, d.placeholder)}<div class="novel-grid" data-library-grid>${d.cards.map((card, index) => {
    const channel = state.edition === "cn" ? (index % 3 === 1 ? "男频" : "女频") : (index % 3 === 1 ? "Male" : "Female");
    const length = state.edition === "cn" ? "短篇" : "Short form";
    const category = card[4][0];
    return `<article class="novel-card" data-library-card data-title="${esc(card[0] + " " + card[1])}" data-length="${length}" data-channel="${channel}" data-category="${category}"><img class="novel-cover" src="./assets/${card[3]}" alt="${esc(card[0])}" loading="lazy"><div class="novel-body"><h3>${card[0]}</h3><div class="novel-labels compact"><span class="pill">${category}</span><span class="pill">${channel}</span><span class="pill">${length}</span></div><p>${card[2]}</p><div class="novel-author">${state.edition === "cn" ? "作者" : "Creator"}：${card[1]}</div></div></article>`;
  }).join("")}</div>`, config);
}

function scriptsPage() {
  const d = editions[state.edition].scripts;
  const config = state.edition === "cn" ? "绿台剧本配置新增必填字段“类型”，枚举为“国内、海外”；筛选、列表及新增/编辑弹窗同步展示，官网仅展示当前版本对应内容。" : "The admin Script module requires a Domestic / Global type on filters, lists and create/edit forms. The website only reads the active edition's content.";
  const groups = [{ name: state.edition === "cn" ? "频道" : "Audience", key: "channel", options: d.channels }, { name: state.edition === "cn" ? "分类" : "Genre", key: "category", options: d.categories }];
  return pageShell(`${pageHero(d)}<div class="script-capabilities">${d.capabilities.map(item => `<article class="script-capability" tabindex="0" data-capability-coming><strong>${item[0]}</strong><h3>${item[1]}</h3><p>${item[2]}</p><span class="capability-action">${state.edition === "cn" ? "了解能力" : "Explore capability"}${icon("arrow-up-right")}</span></article>`).join("")}</div>${libraryFilterBar(groups, d.placeholder)}<div class="novel-grid script-list-grid" data-library-grid>${d.cards.map((card, index) => `<article class="novel-card script-card" data-library-card data-script-index="${index}" data-title="${esc(card[0] + " " + card[1])}" data-channel="${card[4]}" data-category="${card[5]}" tabindex="0"><img class="novel-cover" src="./assets/${card[3]}" alt="${esc(card[0])}" loading="lazy"><div class="novel-body"><h3>${card[0]}</h3><div class="novel-labels compact"><span class="pill">${card[4]}</span><span class="pill">${card[5]}</span><span class="pill">${card[6]}</span></div><p>${card[2]}</p><div class="novel-author">${state.edition === "cn" ? "作者" : "Creator"}：${card[1]}</div></div></article>`).join("")}</div>`, config);
}

function agentsPage() {
  const d = editions[state.edition].agents;
  const config = state.edition === "cn" ? "海外版Agent入口、能力介绍和推荐顺序按海外业务独立配置；工具功能本身可复用，展示内容与市场入口不共用。" : "Global tool entry points, descriptions and recommendations are configured independently for overseas operations; core tools may be shared.";
  return pageShell(`${pageHero(d)}<div class="agent-feature-grid">${d.features.map(item => `<article class="agent-feature"><div><h3>${item[0]}</h3><p>${item[1]}</p><button class="button small" type="button" data-agent="${item[0]}">${icon(item[3])}${state.edition === "cn" ? "去创作" : "Open tool"}</button></div>${item[2] ? `<img src="./assets/${item[2]}" alt="" loading="lazy">` : `<div class="agent-visual-icon">${icon(item[3])}</div>`}</article>`).join("")}</div><section class="section"><div class="section-heading"><div><p class="section-kicker">PRODUCTION UTILITIES</p><h2>${state.edition === "cn" ? "专业能力矩阵" : "Production utility matrix"}</h2></div></div><div class="tool-groups">${d.groups.map(group => `<article class="tool-group"><div class="tool-group-heading">${icon(group[0])}<h3>${group[1]}</h3></div><ul class="tool-list">${group[2].map(tool => `<li><button type="button" data-agent="${tool[0]}" class="text-link">${tool[0]}</button><span>${tool[1]}</span></li>`).join("")}</ul></article>`).join("")}</div></section>`, config);
}

function assetsPage() {
  const d = editions[state.edition].assets;
  const items = d.items[state.assetTab] || d.items.characters;
  const characterMode = state.assetTab === "characters";
  return pageShell(`<div class="asset-toolbar"><div class="asset-tabs" role="tablist">${d.tabs.map(tab => `<button class="asset-tab ${state.assetTab === tab[0] ? "active" : ""}" type="button" data-asset-tab="${tab[0]}" role="tab" aria-selected="${state.assetTab === tab[0]}">${tab[1]}</button>`).join("")}</div><label class="search-field">${icon("search")}<input type="search" placeholder="${d.search}" aria-label="${d.search}" data-asset-search></label></div><div class="asset-browser">${characterMode ? `<aside class="asset-filters">${d.filterGroups.map((group, groupIndex) => `<div class="asset-filter-group"><strong>${group[0]}</strong><div>${group[1].map((option, index) => `<button class="asset-filter-tag ${index === 0 ? "active" : ""}" type="button" data-asset-filter-group="${groupIndex}" data-asset-filter-value="${option}">${option}</button>`).join("")}</div></div>`).join("")}</aside>` : ""}<div class="asset-library-grid ${characterMode ? "characters" : "landscape"}" data-asset-grid>${items.map((item, index) => `<article class="asset-library-card" data-asset-card data-asset-index="${index}" data-title="${esc(item[0])}" ${characterMode ? `data-style="${item[2] || ""}" data-gender="${item[3] || ""}" data-era="${item[4] || ""}" data-region="${item[5] || ""}"` : ""} tabindex="0"><div class="asset-library-media"><img src="./assets/${item[1]}" alt="${esc(item[0])}" loading="lazy"><span class="asset-preview">${icon("maximize-2")}</span></div><h3>${item[0]}</h3></article>`).join("")}</div></div>`);
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
  document.querySelectorAll("[data-library-filter]").forEach(select => select.addEventListener("change", applyLibraryFilters));
  document.querySelectorAll("[data-library-search]").forEach(input => input.addEventListener("input", applyLibraryFilters));
  document.querySelectorAll("[data-studio-tab]").forEach(button => button.addEventListener("click", () => { state.studioTab = button.dataset.studioTab; render(); }));
  document.querySelectorAll("[data-work]").forEach(card => {
    const open = () => openWorkDialog(Number(card.dataset.work));
    card.addEventListener("click", open);
    card.addEventListener("keydown", event => { if (event.key === "Enter" || event.key === " ") open(); });
  });
  document.querySelectorAll("[data-lead]").forEach(button => button.addEventListener("click", () => showToast(state.edition === "cn" ? `${button.dataset.lead}入口已打开` : `${button.dataset.lead} form opened`)));
  document.querySelectorAll("[data-agent]").forEach(button => button.addEventListener("click", () => showToast(state.edition === "cn" ? `${button.dataset.agent}工具即将打开` : `Opening ${button.dataset.agent}`)));
  document.querySelectorAll("[data-capability-coming]").forEach(card => {
    const notify = () => showToast(state.edition === "cn" ? "该能力入口本期暂未开放" : "This capability entry is not available in this release");
    card.addEventListener("click", notify);
    card.addEventListener("keydown", event => { if (event.key === "Enter" || event.key === " ") notify(); });
  });
  document.querySelectorAll("[data-script-index]").forEach(card => {
    const open = () => openScriptDialog(Number(card.dataset.scriptIndex));
    card.addEventListener("click", open);
    card.addEventListener("keydown", event => { if (event.key === "Enter" || event.key === " ") open(); });
  });
  document.querySelectorAll("[data-asset-tab]").forEach(button => button.addEventListener("click", () => { state.assetTab = button.dataset.assetTab; render(); }));
  document.querySelectorAll("[data-asset-filter-value]").forEach(button => button.addEventListener("click", () => {
    const group = button.closest(".asset-filter-group");
    group.querySelectorAll("[data-asset-filter-value]").forEach(item => item.classList.remove("active"));
    button.classList.add("active");
    applyAssetFilters();
  }));
  const assetSearch = document.querySelector("[data-asset-search]");
  if (assetSearch) assetSearch.addEventListener("input", applyAssetFilters);
  document.querySelectorAll("[data-asset-index]").forEach(card => {
    const open = () => openAssetDialog(Number(card.dataset.assetIndex));
    card.addEventListener("click", open);
    card.addEventListener("keydown", event => { if (event.key === "Enter" || event.key === " ") open(); });
  });
  const generate = document.getElementById("generateButton");
  if (generate) generate.addEventListener("click", () => {
    const input = document.getElementById("promptInput");
    if (!input.value.trim()) { input.focus(); showToast(state.edition === "cn" ? "请先输入创作描述" : "Add a creative brief first"); return; }
    showToast(state.edition === "cn" ? "创作任务已生成，正在进入下一步" : "Task created. Moving to the next step.");
  });
}

function applyLibraryFilters() {
  const grid = document.querySelector("[data-library-grid]");
  if (!grid) return;
  const query = (document.querySelector("[data-library-search]")?.value || "").trim().toLowerCase();
  const filters = [...document.querySelectorAll("[data-library-filter]")].map(select => ({ key: select.dataset.libraryFilter, value: select.value }));
  grid.querySelectorAll("[data-library-card]").forEach(card => {
    const matchesQuery = card.dataset.title.toLowerCase().includes(query);
    const matchesFilters = filters.every(filter => filter.value.startsWith("全部") || filter.value.startsWith("All ") || card.dataset[filter.key] === filter.value);
    card.hidden = !(matchesQuery && matchesFilters);
  });
}

function applyAssetFilters() {
  const grid = document.querySelector("[data-asset-grid]");
  if (!grid) return;
  const query = (document.querySelector("[data-asset-search]")?.value || "").trim().toLowerCase();
  const keys = ["style", "gender", "era", "region"];
  const filters = [...document.querySelectorAll(".asset-filter-group")].map((group, index) => ({ key: keys[index], value: group.querySelector(".asset-filter-tag.active")?.dataset.assetFilterValue || "全部" }));
  grid.querySelectorAll("[data-asset-card]").forEach(card => {
    const matchesQuery = card.dataset.title.toLowerCase().includes(query);
    const matchesFilters = filters.every(filter => ["全部", "All"].includes(filter.value) || card.dataset[filter.key] === filter.value);
    card.hidden = !(matchesQuery && matchesFilters);
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

function openScriptDialog(index) {
  const script = editions[state.edition].scripts.cards[index];
  dialogContent.innerHTML = `<div class="content-dialog-layout"><img class="content-dialog-cover" src="./assets/${script[3]}" alt="${esc(script[0])}"><div><p class="section-kicker">${state.edition === "cn" ? "剧本详情" : "SCRIPT DETAILS"}</p><h2 id="dialogTitle">${script[0]}</h2><div class="novel-labels"><span class="pill">${script[4]}</span><span class="pill">${script[5]}</span><span class="pill">${script[6]}</span></div><p>${script[2]}</p><p class="content-dialog-author">${state.edition === "cn" ? "作者" : "Creator"}：${script[1]}</p><div class="dialog-actions"><button class="button ghost" type="button" data-dialog-cancel>${state.edition === "cn" ? "关闭" : "Close"}</button><button class="button primary" type="button" data-agent="${script[0]}">${state.edition === "cn" ? "查看试读" : "Preview script"}</button></div></div></div>`;
  modalBackdrop.hidden = false;
  document.body.style.overflow = "hidden";
  dialogContent.querySelector("[data-dialog-cancel]").addEventListener("click", closeDialog);
  dialogContent.querySelector("[data-agent]").addEventListener("click", () => showToast(state.edition === "cn" ? "试读内容正在准备中" : "Preview content is being prepared"));
  refreshIcons();
}

function openAssetDialog(index) {
  const item = editions[state.edition].assets.items[state.assetTab][index];
  dialogContent.innerHTML = `<p class="section-kicker">${state.edition === "cn" ? "资产预览" : "ASSET PREVIEW"}</p><h2 id="dialogTitle">${item[0]}</h2><div class="asset-dialog-media"><img src="./assets/${item[1]}" alt="${esc(item[0])}"></div><div class="dialog-actions"><button class="button ghost" type="button" data-dialog-cancel>${state.edition === "cn" ? "关闭" : "Close"}</button><button class="button primary" type="button" data-agent="${item[0]}">${state.edition === "cn" ? "使用资产" : "Use asset"}</button></div>`;
  modalBackdrop.hidden = false;
  document.body.style.overflow = "hidden";
  dialogContent.querySelector("[data-dialog-cancel]").addEventListener("click", closeDialog);
  dialogContent.querySelector("[data-agent]").addEventListener("click", () => showToast(state.edition === "cn" ? "资产已加入当前项目" : "Asset added to the current project"));
  refreshIcons();
}

function openBusinessDialog() {
  const cn = state.edition === "cn";
  const directions = cn ? ["IP版权合作", "漫剧制作", "AI工具 / 平台合作", "内容发行与投流", "海外发行", "政企项目"] : ["IP licensing", "Drama production", "AI platform", "Distribution", "Global release", "Enterprise project"];
  modalBackdrop.querySelector(".dialog").classList.add("business-dialog");
  dialogContent.innerHTML = `<form id="businessForm"><div class="business-dialog-heading"><p class="section-kicker">BUSINESS PARTNERSHIP</p><h2 id="dialogTitle">${cn ? "商务合作" : "Business Inquiries"}</h2><p>${cn ? "请留下合作需求，我们将在 1 个工作日内与您联系。" : "Tell us about your project. We will respond within one business day."}</p></div><div class="business-form-grid"><label class="business-field"><span>${cn ? "姓名" : "Full name"}<b>*</b></span><input class="form-control" name="name" maxlength="20" required placeholder="${cn ? "请输入您的姓名" : "Enter your full name"}"></label><label class="business-field"><span>${cn ? "公司 / 机构名称" : "Company / organization"}<b>*</b></span><input class="form-control" name="company" maxlength="50" required placeholder="${cn ? "请输入公司或机构名称" : "Enter your organization"}"></label><label class="business-field"><span>${cn ? "联系方式" : "Phone number"}<b>*</b></span><input class="form-control" name="contact" maxlength="40" required placeholder="${cn ? "请输入手机号、微信或邮箱" : "Enter phone, email or WhatsApp"}"></label><label class="business-field"><span>${cn ? "职位 / 角色" : "Position / role"}</span><select class="form-control" name="role"><option value="">${cn ? "请选择" : "Select"}</option><option>${cn ? "企业负责人" : "Business owner"}</option><option>${cn ? "内容负责人" : "Content lead"}</option><option>${cn ? "制片人 / 导演" : "Producer / director"}</option><option>${cn ? "政府或事业单位" : "Government / public sector"}</option></select></label><fieldset class="business-field business-field-full"><legend>${cn ? "合作方向" : "Areas of interest"}<b>*</b></legend><div class="interest-options">${directions.map(direction => `<label><input type="checkbox" name="direction" value="${direction}"><span>${direction}</span></label>`).join("")}</div></fieldset><label class="business-field business-field-full"><span>${cn ? "合作需求" : "Project details"}<b>*</b></span><textarea class="prompt-box business-textarea" name="details" minlength="10" maxlength="500" required placeholder="${cn ? "请简要描述项目背景、内容体量、合作目标等信息" : "Describe the project background, content scale and cooperation goals"}"></textarea><small data-business-count>0 / 500</small></label><label class="business-consent business-field-full"><input type="checkbox" name="consent" required><span>${cn ? "我已阅读并同意" : "I have read and agree to the"} <a href="../business-cooperation/privacy.html" target="_blank" rel="noopener">${cn ? "《隐私政策》" : "Privacy Policy"}</a>${cn ? "，同意平台为商务合作目的联系我。" : " and consent to being contacted for business purposes."}</span></label></div><div class="dialog-actions"><button class="button ghost" type="button" data-dialog-cancel>${cn ? "取消" : "Cancel"}</button><button class="button primary" type="submit">${cn ? "提交合作意向" : "Submit"}</button></div></form>`;
  modalBackdrop.hidden = false;
  document.body.style.overflow = "hidden";
  const form = document.getElementById("businessForm");
  const details = form.elements.details;
  details.addEventListener("input", () => { form.querySelector("[data-business-count]").textContent = `${details.value.length} / 500`; });
  form.querySelector("[data-dialog-cancel]").addEventListener("click", closeDialog);
  form.addEventListener("submit", event => {
    event.preventDefault();
    if (!form.querySelector('input[name="direction"]:checked')) { showToast(cn ? "请至少选择一个合作方向" : "Select at least one area of interest"); return; }
    dialogContent.innerHTML = `<div class="business-success">${icon("circle-check-big")}<h2 id="dialogTitle">${cn ? "提交成功" : "Request submitted"}</h2><p>${cn ? "合作顾问将在 1 个工作日内与您联系，请保持联系方式畅通。" : "A partnership advisor will contact you within one business day."}</p><button class="button primary" type="button" data-dialog-cancel>${cn ? "知道了" : "Done"}</button></div>`;
    dialogContent.querySelector("[data-dialog-cancel]").addEventListener("click", closeDialog);
    refreshIcons();
  });
  refreshIcons();
}

function closeDialog() { modalBackdrop.hidden = true; document.body.style.overflow = ""; modalBackdrop.querySelector(".dialog").classList.remove("business-dialog"); }

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
document.getElementById("businessButton").addEventListener("click", openBusinessDialog);
document.getElementById("dialogClose").addEventListener("click", closeDialog);
modalBackdrop.addEventListener("click", event => { if (event.target === modalBackdrop) closeDialog(); });
document.addEventListener("keydown", event => { if (event.key === "Escape" && !modalBackdrop.hidden) closeDialog(); });
window.addEventListener("hashchange", () => { const route = location.hash.slice(1); if (route && route !== state.route) { state.route = route; render(); } });

render();
