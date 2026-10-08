// V7 field-level product and test specifications. Context numbers/anchors stay stable.
export const REVIEW_NOTES = {
 "session-unavailable": {
  "title": "多页面接续",
  "page": "原型演示边界",
  "background": "",
  "need": "新页面自动接续",
  "sections": [
   {
    "number": 1,
    "title": "页面接续状态",
    "bullets": [
     "新页自动接续，忙时完成当前操作再移交；不创建任务/扣费。正式后台任务见 R-10。"
    ],
    "anchor": {
     "selector": ".session-unavailable",
     "index": 0,
     "placement": "left"
    },
    "items": [
     {
      "name": "页面接续状态",
      "kind": "status",
      "definition": "本机演示多页互斥编辑状态；不创建任务/费用",
      "source": "V7本机演示配置、页面编辑会话与保存记录；不属于正式业务系统数据源或权限机制。",
      "values": [
       {
        "value": "opening",
        "label": "正在打开智能混剪",
        "meaning": "正在读取当前设置与任务记录。"
       },
       {
        "value": "waiting",
        "label": "正在接续当前任务",
        "meaning": "原页面有任务正在处理时，完成后将自动进入。"
       },
       {
        "value": "paused",
        "label": "已在新页面继续",
        "meaning": "当前设置与任务记录已保留。"
       },
       {
        "value": "load-failed",
        "label": "页面加载未完成",
        "meaning": "请重新进入，已有记录会继续保留。"
       },
       {
        "value": "unavailable",
        "label": "暂时无法接续页面",
        "meaning": "请重新进入，已有记录会继续保留。"
       }
      ],
      "behavior": "等待/暂停/失败时隐藏workspaceNav与演示设置；页面role=status；获锁才加载app",
      "implementation": "platform-bootstrap.js:showSession；demo-session.js:claimEditingSession"
     },
     {
      "name": "在此继续",
      "kind": "action",
      "definition": "paused/加载失败/无法接续时提供重新进入按钮",
      "source": "V7本机演示配置、页面编辑会话与保存记录；不属于正式业务系统数据源或权限机制。",
      "behavior": "删除URL session参数并location.replace；重新排队申请会话；等待与opening不显示按钮",
      "implementation": "platform-bootstrap.js:showSession"
     },
     {
      "name": "移交条件",
      "kind": "text",
      "definition": "Web Locks exclusive守护同源编辑；新页排队；BroadcastChannel每秒请求旧页安全移交",
      "source": "V7本机演示配置、页面编辑会话与保存记录；不属于正式业务系统数据源或权限机制。",
      "behavior": "旧页busy、生成/同步计时或pending/repairing/reworkPending时继续持锁；工作结束才inert禁止旧页写入并导航paused；无锁API时可写但无并发保护",
      "implementation": "demo-session.js:claimEditingSession；app.js:relinquishEditingSession"
     },
     {
      "name": "正式后台边界",
      "kind": "text",
      "definition": "仅本机演示协调；正式任务应在平台后台持续执行，页面关闭/切换不是正式取消",
      "source": "V7本机演示配置、页面编辑会话与保存记录；不属于正式业务系统数据源或权限机制。",
      "behavior": "产品要求：正式任务在后台持续，关闭/切换页面不自动取消。演示实际：新页等待忙操作完成后接续；直接刷新/关闭中断时app初始化会把pending制作置失败并释放冻结额，返工按失败收尾；同步pending/processing变待核实。接续提示本身无新增任务/费用",
      "implementation": "demo-session.js模块注释；review-notes.js:session-unavailable/R-10"
     }
    ],
    "checks": [
     "正常：空闲编辑页遇新页请求先禁用旧页写入并导航paused，新页随后获锁读取已有记录。",
     "边界：正在分析/生成/同步/修复/返工时新页等待，完成当前操作再接续；等待不创建新任务/费用。",
     "边界：待核实但无在途计时允许移交，记录与锁定内容状态继续保留；多个新页按浏览器锁队列依次接续。",
     "边界：获锁失败/加载异常显示保留记录及在此继续入口；不把无WebLocks的降级当已具并发保护。",
     "演示边界：直接刷新中断制作时旧pending释放冻结并变failed，不能伪造成功；同步中断变unknown等待查询。正式后台续跑不得照搬此本机计时降级。"
    ]
   }
  ]
 },
 "toolbox": {
  "title": "工具箱 · 智能混剪入口",
  "page": "平台入口与账户",
  "background": "",
  "need": "在现有工具箱增加一个入口，新页面承载完整混剪流程，统一视觉与操作。",
  "sections": [
   {
    "number": 1,
    "title": "工具箱模块",
    "bullets": [
     "沿用平台工具箱及样式，新增智能混剪卡片。"
    ],
    "anchor": {
     "selector": ".tool-grid",
     "index": 0,
     "placement": "left"
    },
    "items": [
     {
      "name": "工具箱卡片",
      "kind": "text",
      "definition": "平台工具入口网格；保留现有工具并新增智能混剪。",
      "source": "容量万相主平台工具目录、账户身份与权限；原型展示示例身份，未接真实鉴权接口。",
      "values": [
       {
        "value": "voice",
        "label": "配音创作",
        "meaning": "现有平台能力的展示卡片"
       },
       {
        "value": "image",
        "label": "图片创作",
        "meaning": "现有平台能力的展示卡片"
       },
       {
        "value": "video",
        "label": "视频创作",
        "meaning": "现有平台能力的展示卡片"
       },
       {
        "value": "canvas",
        "label": "创建/进入无限画布",
        "meaning": "现有平台能力的展示卡片"
       },
       {
        "value": "mixed-cut",
        "label": "智能混剪",
        "meaning": "新增可点击入口，副标题高光混剪 · AI 解说"
       }
      ],
      "behavior": "演示实际：前四项是静态占位，提示沿用平台现有功能；只有新增智能混剪卡片有本版跳转。产品要求沿用原平台对应功能，不能将静态占位当成正式禁用功能。",
      "implementation": "platform-shell.js renderToolbox"
     },
     {
      "name": "平台左侧导航与工具箱状态",
      "kind": "text",
      "definition": "工作台、工具箱、音色库、视频超分、资产库的现有平台结构；工具箱高亮。",
      "source": "容量万相主平台工具目录、账户身份与权限；原型展示示例身份，未接真实鉴权接口。",
      "values": [
       {
        "value": "dashboard",
        "label": "工作台",
        "meaning": "现有平台入口占位"
       },
       {
        "value": "toolbox",
        "label": "工具箱",
        "meaning": "当前高亮，可进入本版工具箱"
       },
       {
        "value": "music",
        "label": "音色库",
        "meaning": "现有平台入口占位"
       },
       {
        "value": "video",
        "label": "视频超分",
        "meaning": "现有平台入口占位"
       },
       {
        "value": "asset",
        "label": "资产库",
        "meaning": "现有平台入口占位"
       }
      ],
      "behavior": "Logo与工具箱导航进入工具箱。当前演示其他导航为静态展示，正式沿用平台实际跳转。顶部显示「V7 · 交互演示」。",
      "implementation": "platform-shell.js mountPlatformShell"
     }
    ],
    "checks": [
     "工具箱完整显示五个卡片，智能混剪有高光混剪 · AI解说副标题及新开标识。",
     "工具箱导航高亮；Logo/工具箱进入本版工具箱，已有能力不据占位状态新增产品限制。"
    ]
   },
   {
    "number": 2,
    "title": "智能混剪入口",
    "bullets": [
     "点击新开制作页，保留工具箱；使用平台账户/积分（R-09）。"
    ],
    "anchor": {
     "selector": ".tool-card.mixed-cut-entry",
     "index": 0,
     "placement": "left"
    },
    "items": [
     {
      "name": "智能混剪",
      "kind": "action",
      "definition": "从工具箱新开完整混剪制作页，工具箱原页保留。",
      "source": "容量万相主平台工具目录、账户身份与权限；原型展示示例身份，未接真实鉴权接口。",
      "behavior": "独立工具箱打开index.html；评审内嵌工具箱打开review.html，均新页面。继承主平台身份与积分，无另行注册、登录或混剪钱包（R-09）。演示本机新页读取共用记录；多编辑页接续按本版演示会话规则，不等于正式任务锁。",
      "implementation": "platform-shell.js renderToolbox"
     }
    ],
    "checks": [
     "点击智能混剪新增页面，原工具箱页面仍保留，新页进入制作素材。",
     "由评审内嵌工具箱进入的是并排评审页；独立工具箱进入产品制作页。",
     "新页显示相同演示账户与可用积分，不重置余额或另建钱包。"
    ]
   },
   {
    "number": 3,
    "title": "平台账户与积分",
    "bullets": [
     "积分/头像沿用主平台入口；实际扣费主体与权限待平台确认。"
    ],
    "anchor": {
     "selector": ".platform-account-controls",
     "index": 0,
     "placement": "left"
    },
    "items": [
     {
      "name": "积分入口",
      "kind": "action",
      "definition": "左下只读积分数与可点击的积分明细入口。",
      "source": "主平台账户余额/费率及本任务分析、制作、返工、冻结/结算/释放/退款记录；原型读取V7本机演示流水。",
      "default": "初始10000演示积分；已有演示余额优先。",
      "behavior": "显示可用余额，点击打开积分明细。相同浏览器同源其他页记录变动或窗口重新聚焦时刷新余额；这只是演示共用存储，未连接真实钱包。产品要求余额、冻结、结算接主平台（R-09）。",
      "implementation": "platform-context.js本地共用记录；platform-shell.js"
     },
     {
      "name": "账户头像入口",
      "kind": "action",
      "definition": "左下头像显示账户名首字，点击查看账户信息。",
      "source": "容量万相主平台工具目录、账户身份与权限；原型展示示例身份，未接真实鉴权接口。",
      "default": "头像「陈」，账户陈剪辑。",
      "behavior": "打开只读账户信息；当前没有注册、登录、充值或修改账户操作。实际扣费主体、角色权限与资产范围由平台确认（R-09）。",
      "implementation": "platform-context.js固定演示账户"
     }
    ],
    "checks": [
     "点击积分打开当前余额/冻结/结算与流水；点击头像显示相同账户与团队。",
     "新页制作扣演示积分后，工具箱聚焦或收到共享记录变动时余额更新。",
     "入口不创建独立钱包，不把陈剪辑或10000分当真实账号/额度。"
    ]
   }
  ]
 },
 "create": {
  "title": "制作素材",
  "page": "制作素材",
  "background": "",
  "need": "选片源、设参数后直接生成视频。",
  "sections": [
   {
    "number": 1,
    "title": "片源与选集",
    "bullets": [
     "国内/海外各自合集或本地片源；选集正整数、不越界、不含缺集，取消保留原配置。"
    ],
    "anchor": {
     "selector": ".create-grid > div > .section:first-child",
     "index": 0,
     "placement": "left"
    },
    "items": [
     {
      "name": "绿台合集 / 更换",
      "kind": "action",
      "definition": "打开选择合集弹窗；两个按钮作用相同。",
      "source": "当前片源选择记录；选择合集后从对应国内/海外绿台列表取数，原型用示例合集。",
      "behavior": "以当前来源、合集与起止集数初始化弹窗草稿；确认才写回制作配置，取消不覆盖。",
      "implementation": "creation-ui.js、app.js"
     },
     {
      "name": "本地上传",
      "kind": "action",
      "definition": "打开本地视频选择弹窗。",
      "source": "用户本机视频；正式从上传资产服务取得已导入片源，原型只播放本机预览。",
      "behavior": "当前原型只播放本机文件，未上传、未建立真实资产；正式批量导入按R-01。",
      "implementation": "app.js"
     },
     {
      "name": "片源名称、介绍、封面",
      "kind": "text",
      "definition": "只读展示当前片源的剧名与说明；封面为统一虚构剧照。",
      "source": "所选国内/海外合集元数据，或本地导入后登记的剧目信息；原型封面是统一虚构图。",
      "default": "初始国内「重逢时，她已是王牌（虚构示例）」；本地已有配置优先。",
      "behavior": "未解析到片源显示「请选择片源」，禁止生成并提示片源失效；合集确认后名称与介绍同步更新。",
      "implementation": "sources.js所选合集或手动示例"
     },
     {
      "name": "来源类型与原片版本",
      "kind": "status",
      "definition": "片源标签标识国内/海外/未知手动类型，版本标签标识原片文件版本。",
      "source": "用户选中的片源分类与资产版本；绿台区分国内/海外，本地类型未知；原型版本号为示例字段。",
      "default": "国内短剧、原片 V1。",
      "values": [
       {
        "value": "domestic",
        "label": "国内短剧",
        "meaning": "仅加载国内绿台合集；同步路由为国内系统"
       },
       {
        "value": "overseas",
        "label": "海外短剧",
        "meaning": "仅加载海外绿台合集；同步路由为海外系统"
       },
       {
        "value": "manual",
        "label": "手动片源 · 类型未确定",
        "meaning": "演示设置可切换的虚构手动片源；真实本地预览不会自动转换成该类型"
       }
      ],
      "behavior": "来源、资产、原片版本、语言共同决定分析复用范围；国内/海外同名或同ID不合并（R-11）。",
      "implementation": "当前片源配置"
     },
     {
      "name": "前 10 集 / 前 20 集 / 前 30 集",
      "kind": "action",
      "definition": "将本次选集快捷设为从第1集到第10/20/30集。",
      "source": "用户本次选集配置，以及所选绿台合集或本地资产的总集数、可用/缺失集列表。",
      "default": "初始选中前30集。",
      "values": [
       {
        "value": 10,
        "label": "前 10 集",
        "meaning": "起始1、结束10"
       },
       {
        "value": 20,
        "label": "前 20 集",
        "meaning": "起始1、结束20"
       },
       {
        "value": 30,
        "label": "前 30 集",
        "meaning": "起始1、结束30"
       }
      ],
      "behavior": "直接改变制作页配置并刷新预览、复用数量与报价；不自动截断到合集总集数。",
      "validation": "快捷项也必须通过总集数与缺集校验；短合集点前30集会成为无效配置。",
      "implementation": "固定快捷项"
     },
     {
      "name": "起始集数",
      "kind": "field",
      "definition": "数值输入；本次取材范围的第一集。",
      "source": "用户本次选集配置，以及所选绿台合集或本地资产的总集数、可用/缺失集列表。",
      "default": "1。",
      "behavior": "与结束集数共同定义包含首尾的连续范围；输入即本地暂存并刷新预览与报价，无需另点保存。",
      "validation": "必填正整数，起始≤结束；HTML展示1–40边界，实际有效上界以当前合集总集数为准。",
      "implementation": "当前制作配置"
     },
     {
      "name": "结束集数",
      "kind": "field",
      "definition": "数值输入；本次取材范围的最后一集。",
      "source": "用户本次选集配置，以及所选绿台合集或本地资产的总集数、可用/缺失集列表。",
      "default": "30。",
      "behavior": "范围变更只重算本次范围，不清除范围外已完成分析。",
      "validation": "必填正整数，不超过当前合集总集数；范围内每一集必须可用，缺集/未准备集均禁止提交。",
      "copy": [
       "请填写有效的起止集数",
       "所选第 X 集暂无片源，请调整范围"
      ],
      "implementation": "当前制作配置"
     },
     {
      "name": "已分析可复用 / 本次新增",
      "kind": "text",
      "definition": "只读集数；在所选连续范围内，已有有效分析与尚未分析的集数。",
      "source": "当前资产、原片版本、语言下的有效分析记录，与本次选集范围比对；原型使用本机分析缓存。",
      "default": "初始前30集：已分析可复用10集、本次新增20集。",
      "behavior": "换来源、版本或范围实时重算；新增数量用于演示分析费，复用不重复收费。",
      "implementation": "同来源、资产、原片版本、语言的分析缓存"
     },
     {
      "name": "查看剧目",
      "kind": "action",
      "definition": "进入当前剧目详情的制作任务页签。",
      "source": "当前片源选择记录；选择合集后从对应国内/海外绿台列表取数，原型用示例合集。",
      "behavior": "保留制作配置，不开始分析或生成。",
      "implementation": "当前片源与剧目归集"
     }
    ],
    "checks": [
     "初始配置显示国内剧名、原片V1、前30集、复用10集/新增20集。",
     "起始为0、小数、起始大于结束、结束越界均提示有效起止集数且禁用生成。",
     "国内第三合集选择1–8集，提示第4集缺片源；改1–3集可通过选集校验。",
     "前10集快捷项用于总集数8的合集不会自动截断，提交仍被拦截。",
     "国内/海外同ID合集分别计算缓存，海外前30集不复用国内前10集分析。"
    ]
   },
   {
    "number": 2,
    "title": "制作方式与解说结构",
    "bullets": [
     "高光保留原声；AI首次选混合或全解说，不默认短解说。"
    ],
    "anchor": {
     "selector": ".mode-grid",
     "index": 0,
     "placement": "left"
    },
    "items": [
     {
      "name": "制作方式",
      "kind": "field",
      "definition": "卡片单选；决定生成策略。",
      "source": "用户制作配置与产品固定可选枚举；初次使用默认值，之后读取已保存配置。",
      "default": "高光混剪。",
      "values": [
       {
        "value": "highlight",
        "label": "高光混剪",
        "meaning": "提炼剧情冲突，保留人物原声、完整对白、必要铺垫和悬念"
       },
       {
        "value": "narrated",
        "label": "AI 解说",
        "meaning": "用解说讲述剧情，需继续选择解说＋原片或全解说结构"
       }
      ],
      "behavior": "点击即切换并更新字段、结构预览与报价。切到高光清空当前解说结构；再进入AI解说需重新选择结构。旧任务的原片混剪仅历史兼容，不能作为新建入口。",
      "implementation": "creation-ui.js、engine.js"
     },
     {
      "name": "解说结构",
      "kind": "field",
      "definition": "仅AI解说出现的必选卡片单选。",
      "source": "用户制作配置与产品固定可选枚举；初次使用默认值，之后读取已保存配置。",
      "default": "首次未选；不默认混合、全解说或短解说。",
      "values": [
       {
        "value": "mixed",
        "label": "解说＋原片",
        "meaning": "解说引入或承接原片；原片段保留人声，以原片为主"
       },
       {
        "value": "full",
        "label": "全解说",
        "meaning": "解说承担整条叙事；原片仅提供对应画面，原片整轨静音"
       }
      ],
      "behavior": "未选时隐藏最终时长与位置等依赖字段，预览显示待选择结构，生成/费用明细禁用。切换结构分别记住混合与全解说的最终时长；全解说首次没有时长默认值。",
      "validation": "仅允许两项；缺失时提示选择解说结构。",
      "copy": [
       "请选择解说结构",
       "请选择解说结构：解说＋原片或全解说",
       "全篇解说配原片画面，原片人声关闭。"
      ],
      "implementation": "creation-ui.js、engine.js"
     }
    ],
    "checks": [
     "从初始高光切到AI解说，结构不自动选中，最终时长不展示，生成被禁用。",
     "选择混合展示时长、位置及语速覆盖；选择全解说隐藏位置与覆盖开关，并提示原片人声关闭。",
     "混合设5–7分钟、全解说设60秒，往返切结构恢复各自时长。",
     "切到高光再返回AI解说，需要重新选结构，不能沿用隐含的旧结构。"
    ]
   },
   {
    "number": 3,
    "title": "条数、时长与速度",
    "bullets": [
     "1–20条；只设最终时长和成片速度，混合可展开口播覆盖；解说长度自动安排（R-03）。"
    ],
    "anchor": {
     "selector": ".create-grid .fields",
     "index": 0,
     "placement": "left"
    },
    "items": [
     {
      "name": "生成条数",
      "kind": "field",
      "definition": "数值输入；本次计划生成的成片数量。",
      "source": "用户制作配置与产品固定可选枚举；初次使用默认值，之后读取已保存配置。",
      "default": "10。",
      "behavior": "输入即本地暂存，预览数量与最高报价实时变化。计划数不代表一定能生成足数；数量不足在分析后确认，不能用重复内容补数。",
      "values": [
       {
        "value": 5,
        "label": "5条",
        "meaning": "快捷设为5条"
       },
       {
        "value": 10,
        "label": "10条",
        "meaning": "快捷设为10条"
       },
       {
        "value": 20,
        "label": "20条",
        "meaning": "快捷设为20条"
       }
      ],
      "validation": "必填整数1–20；输入空值在原型中按0处理并提示「每批支持 1–20 条」。数量不足由分析后确认，不用重复内容补数。",
      "copy": [
       "最多 20 条",
       "每批支持 1–20 条"
      ],
      "implementation": "当前制作配置"
     },
     {
      "name": "减少条数 / 增加条数",
      "kind": "action",
      "definition": "生成条数两侧的−/+按钮，每次减少或增加1条。",
      "source": "用户制作配置与产品固定可选枚举；初次使用默认值，之后读取已保存配置。",
      "behavior": "直接写回数量、刷新预览和报价；下限1、上限20，边界再次点击数值保持；不分析、不创建任务、不扣费。",
      "validation": "按钮动作按1–20封顶，文本输入仍独立做整数校验。",
      "implementation": "app.js条数加减动作"
     },
     {
      "name": "5条 / 10条 / 20条",
      "kind": "action",
      "definition": "生成条数的三项快捷按钮。",
      "source": "用户制作配置与产品固定可选枚举；初次使用默认值，之后读取已保存配置。",
      "values": [
       {
        "value": 5,
        "label": "5条",
        "meaning": "直接设置计划生成5条"
       },
       {
        "value": 10,
        "label": "10条",
        "meaning": "直接设置计划生成10条"
       },
       {
        "value": 20,
        "label": "20条",
        "meaning": "直接设置计划生成20条"
       }
      ],
      "behavior": "点击替换当前数量并立即更新预览/最高报价；不代表内容容量足够，足数校验在编排后处理。",
      "implementation": "creation-ui.js固定快捷项"
     },
     {
      "name": "最终成片时长（高光 / 解说＋原片）",
      "kind": "field",
      "definition": "下拉单选；按速度处理后的整条成片总长，混合包含解说和原片。",
      "source": "用户制作配置与产品固定可选枚举；初次使用默认值，之后读取已保存配置。",
      "default": "3–5分钟；已有配置或结构记忆值优先。",
      "values": [
       {
        "value": "1",
        "label": "约 1 分钟",
        "meaning": "约1分钟目标；当前演示编排区间45–80秒"
       },
       {
        "value": "3",
        "label": "约 3 分钟",
        "meaning": "约3分钟目标；当前演示编排区间150–210秒"
       },
       {
        "value": "5",
        "label": "约 5 分钟",
        "meaning": "约5分钟目标；当前演示编排区间270–330秒"
       },
       {
        "value": "10",
        "label": "约 10 分钟",
        "meaning": "约10分钟目标；当前演示编排区间540–660秒"
       },
       {
        "value": "3-5",
        "label": "3–5 分钟",
        "meaning": "目标区间180–300秒"
       },
       {
        "value": "5-7",
        "label": "5–7 分钟",
        "meaning": "目标区间300–420秒"
       }
      ],
      "behavior": "只在高光或已选混合结构时出现；变更实时更新预览与报价。解说长度由编排自动安排，没有口播时长输入。",
      "validation": "必须是当前方式可选值；秒级项只适用于全解说。演示范围不等于正式时长容差，正式按R-03和样片锁定。",
      "copy": [
       "按变速后的成片计算",
       "包含变速后的原片与解说"
      ],
      "implementation": "creation-ui.js、engine.js"
     },
     {
      "name": "最终成片时长（全解说）",
      "kind": "field",
      "definition": "下拉单选；完整口播承担整条成片目标总长。",
      "source": "用户制作配置与产品固定可选枚举；初次使用默认值，之后读取已保存配置。",
      "default": "首次提示「请选择成片时长」，不自动选首项；后续恢复全解说记忆值。",
      "values": [
       {
        "value": "30s",
        "label": "约 30 秒",
        "meaning": "全解说目标30秒；当前演示区间27–35秒"
       },
       {
        "value": "60s",
        "label": "约 60 秒",
        "meaning": "全解说目标60秒；当前演示区间55–65秒"
       },
       {
        "value": "90s",
        "label": "约 90 秒",
        "meaning": "全解说目标90秒；当前演示区间85–95秒"
       },
       {
        "value": "120s",
        "label": "约 120 秒",
        "meaning": "全解说目标120秒；当前演示区间110–130秒"
       },
       {
        "value": "3",
        "label": "约 3 分钟",
        "meaning": "约3分钟目标；当前演示编排区间150–210秒"
       },
       {
        "value": "5",
        "label": "约 5 分钟",
        "meaning": "约5分钟目标；当前演示编排区间270–330秒"
       },
       {
        "value": "3-5",
        "label": "3–5 分钟",
        "meaning": "目标区间180–300秒"
       },
       {
        "value": "5-7",
        "label": "5–7 分钟",
        "meaning": "目标区间300–420秒"
       },
       {
        "value": "10",
        "label": "约 10 分钟",
        "meaning": "约10分钟目标；当前演示编排区间540–660秒"
       }
      ],
      "behavior": "仅全解说出现；按目标时长与语速自动规划文案、画面、字幕与BGM。当前全解说菜单没有「约1分钟」项，可用「约60秒」。",
      "validation": "未选不允许报价或生成；内容不足允许提示调整片源/时长，不截断句子或重复凑长（R-03）。",
      "implementation": "creation-ui.js、engine.js"
     },
     {
      "name": "成片速度",
      "kind": "field",
      "definition": "下拉单选；高光控制原片速度，全解说控制口播速度，混合默认共同控制原片与解说。",
      "source": "用户制作配置与产品固定可选枚举；初次使用默认值，之后读取已保存配置。",
      "default": "1.5×；已有配置优先。",
      "values": [
       {
        "value": 0.8,
        "label": "0.8×",
        "meaning": "较自然速度放慢"
       },
       {
        "value": 1,
        "label": "1×",
        "meaning": "自然速度"
       },
       {
        "value": 1.1,
        "label": "1.1×",
        "meaning": "轻度加快"
       },
       {
        "value": 1.2,
        "label": "1.2×",
        "meaning": "加快节奏"
       },
       {
        "value": 1.5,
        "label": "1.5×",
        "meaning": "明显加快"
       }
      ],
      "behavior": "改变后按最终总长重新编排，不在达标成片上再次整体变速。混合开启单独解说语速时，仅原片沿用成片速度；全解说始终使用成片速度作为解说语速。",
      "validation": "仅允许0.8/1/1.1/1.2/1.5×；必须满足当前方式速度校验。",
      "implementation": "engine.js固定选项"
     },
     {
      "name": "单独调整解说语速",
      "kind": "field",
      "definition": "复选开关；仅解说＋原片结构显示，控制是否单独覆盖口播速度。",
      "source": "用户制作配置与产品固定可选枚举；初次使用默认值，之后读取已保存配置。",
      "default": "关闭；首次开启使用1×。",
      "values": [
       {
        "value": false,
        "label": "未勾选",
        "meaning": "原片与解说使用相同的成片速度"
       },
       {
        "value": true,
        "label": "已勾选",
        "meaning": "展示解说语速下拉框，原片与解说分别设置"
       }
      ],
      "behavior": "关闭后口播恢复成片速度，但覆盖值保留；再次开启恢复上次覆盖值。切换全解说时不展示且不生效；切回混合可恢复覆盖状态和值。",
      "implementation": "当前配置与保留的覆盖值"
     },
     {
      "name": "解说语速",
      "kind": "field",
      "definition": "仅混合开启覆盖后显示的下拉单选，控制解说音轨速度。",
      "source": "用户制作配置与产品固定可选枚举；初次使用默认值，之后读取已保存配置。",
      "default": "首次1× · 自然语速。",
      "values": [
       {
        "value": 0.8,
        "label": "0.8×",
        "meaning": "较自然速度放慢"
       },
       {
        "value": 1,
        "label": "1×",
        "meaning": "自然速度"
       },
       {
        "value": 1.1,
        "label": "1.1×",
        "meaning": "轻度加快"
       },
       {
        "value": 1.2,
        "label": "1.2×",
        "meaning": "加快节奏"
       },
       {
        "value": 1.5,
        "label": "1.5×",
        "meaning": "明显加快"
       }
      ],
      "behavior": "改变只更新口播速度与规划，不改变原片成片速度；保留覆盖值供关闭后再次开启。",
      "validation": "仅允许列出的五档速度。",
      "implementation": "当前配置的独立覆盖值"
     },
     {
      "name": "解说位置",
      "kind": "field",
      "definition": "仅解说＋原片显示的下拉单选；决定解说与原片衔接方式。",
      "source": "用户制作配置与产品固定可选枚举；初次使用默认值，之后读取已保存配置。",
      "default": "开头引入。",
      "values": [
       {
        "value": "intro",
        "label": "开头引入",
        "meaning": "先用解说引入，随后原片原声推进，悬念收尾"
       },
       {
        "value": "middle",
        "label": "剧情中承接",
        "meaning": "先高光原片开场，再解说承接，随后原片原声推进"
       }
      ],
      "behavior": "变更实时更新预计结构，生成时据此插入解说。全解说不使用此项。",
      "implementation": "当前制作配置"
     }
    ],
    "checks": [
     "条数1点−仍为1、20点+仍为20；输入0/21/小数禁用生成并显示条数错误。",
     "高光时长菜单完整展示约1/3/5/10分钟与3–5/5–7分钟，没有秒级项。",
     "全解说菜单展示30/60/90/120秒与3/5/3–5/5–7/10分钟；首次空值被拦截。",
     "混合成片1.5×，首次开启独立语速得到1×；设1.2×后关闭恢复1.5×，再开启恢复1.2×。",
     "混合独立1.2×切全解说1.5×，全篇口播使用1.5×；切回混合恢复独立1.2×。",
     "修改位置为剧情中承接，预览顺序改为高光原片→解说→原片→悬念。"
    ]
   },
   {
    "number": 4,
    "title": "字幕与包装",
    "bullets": [
     "勾选BGM即选曲，确认才开启；标题勾选即输入，必填≤24字；字幕随结构生效。"
    ],
    "anchor": {
     "selector": ".packaging",
     "index": 0,
     "placement": "left"
    },
    "items": [
     {
      "name": "字幕 / 解说字幕",
      "kind": "field",
      "definition": "复选开关；高光/混合控制新增字幕，全解说控制新增解说字幕。",
      "source": "用户新增字幕开关与所选结构；原片已有字幕正式从片源读取，原型仅展示配置示意。",
      "default": "开启。",
      "values": [
       {
        "value": true,
        "label": "已勾选",
        "meaning": "高光/混合开启对白与解说字幕；全解说开启解说字幕"
       },
       {
        "value": false,
        "label": "未勾选",
        "meaning": "高光/混合保留原片已有字幕；全解说不新增解说字幕"
       }
      ],
      "behavior": "全解说标签改为「解说字幕」。原片烧录字幕按R-05保留；不承诺能自动擦除；字幕与最终人声对齐属于正式验收。",
      "implementation": "当前制作配置"
     },
     {
      "name": "BGM",
      "kind": "field",
      "definition": "复选开关；是否添加配乐。",
      "source": "用户配乐开关、所选情绪与曲库候选；正式曲目来自投放可用曲库，原型为虚构示例。",
      "default": "开启，悬念推进 · 自动匹配。",
      "values": [
       {
        "value": true,
        "label": "已勾选",
        "meaning": "添加所选情绪/曲目；有人声时避让人声"
       },
       {
        "value": false,
        "label": "未勾选",
        "meaning": "不添加BGM，保留上次曲目与情绪配置"
       }
      ],
      "behavior": "从关闭勾选时先打开选择BGM，确认后才真正开启；取消或×保持关闭。主动取消勾选立即关闭；AI解说允许关闭是当前原型行为，正式例外规则待确认（R-05）。",
      "implementation": "当前配置"
     },
     {
      "name": "当前BGM",
      "kind": "text",
      "definition": "BGM开启才展示的只读曲目与情绪摘要。",
      "source": "用户配乐开关、所选情绪与曲库候选；正式曲目来自投放可用曲库，原型为虚构示例。",
      "behavior": "自动匹配显示「情绪 · 自动匹配」；固定曲显示「曲名 · 固定曲情绪」。关闭时整段隐藏，保留已保存选择。",
      "implementation": "creation-ui.js情绪及虚构曲目字典"
     },
     {
      "name": "更换BGM",
      "kind": "action",
      "definition": "BGM开启时展示的更换曲目按钮。",
      "source": "用户配乐开关、所选情绪与曲库候选；正式曲目来自投放可用曲库，原型为虚构示例。",
      "behavior": "打开选择BGM；确认才更新曲目与情绪并刷新预览，取消保留原开关、曲目与情绪；不生成、不扣费。",
      "implementation": "app.js openBgmPicker"
     },
     {
      "name": "引流小标题",
      "kind": "field",
      "definition": "复选开关；是否在成片添加引流标题。",
      "source": "用户输入的小标题文字和使用开关，读取当前制作配置；没有自动标题接口。",
      "default": "关闭。",
      "values": [
       {
        "value": true,
        "label": "已勾选",
        "meaning": "展示标题输入框并在预计封面显示标题"
       },
       {
        "value": false,
        "label": "未勾选",
        "meaning": "隐藏输入框且不用于成片；保留上次文字"
       }
      ],
      "behavior": "开启自动聚焦输入；关闭保留文字与配置，重新开启恢复；变更不创建制作任务。",
      "implementation": "当前制作配置"
     },
     {
      "name": "引流小标题文字",
      "kind": "field",
      "definition": "标题开关开启才出现的单行输入。",
      "source": "用户输入的小标题文字和使用开关，读取当前制作配置；没有自动标题接口。",
      "default": "空；已有文字优先。",
      "behavior": "输入即暂存并刷新封面标题。预览使用去首尾空格后的文字，空值显示待输入。",
      "validation": "开启时去首尾空格后必填，最多24个Unicode字符；HTML maxlength也为24，浏览器长度与Unicode字符计数可能对emoji产生差异。关闭时不校验、不用于生成。",
      "copy": [
       "输入引流小标题，最多24字",
       "请输入引流小标题",
       "引流小标题最多 24 字"
      ],
      "implementation": "用户输入"
     }
    ],
    "checks": [
     "字幕关闭后，高光/混合预览仍显示原片字幕；全解说预览移除新增解说字幕。",
     "BGM关闭后再次勾选，未点使用BGM前不会保存开启；取消仍保持关闭。",
     "已开启BGM更换曲目后取消，原曲目及开关保持；直接取消BGM勾选只关闭且保留选择。",
     "标题开启后空值或全空格阻止生成；24个普通字符通过，25个字符被限制或拦截。",
     "关闭标题后文字仍保存，预览不显示；重开恢复文字。"
    ]
   },
   {
    "number": 5,
    "title": "预计成片结构",
    "bullets": [
     "随配置更新结构、实际速度和包装；具体片段生成后查看。"
    ],
    "anchor": {
     "selector": ".preview-panel",
     "index": 0,
     "placement": "left"
    },
    "items": [
     {
      "name": "预计条数、结构名称、时长与选集",
      "kind": "text",
      "definition": "当前配置的只读即时摘要，作为生成前理解成片结构的参考。",
      "source": "当前制作配置的实时计算结果；封面为虚构示意，未生成时不代表已完成选段或成片。",
      "default": "10条、高光混剪、3–5分钟、第1–30集。",
      "behavior": "跟随条数、方式/结构、时长及集数更新。AI未选结构显示「AI 解说 · 待选择结构」「待设置时长」。不是已生成素材，也不承诺所有请求条数都可生成。",
      "implementation": "renderCreationPreview读取当前配置"
     },
     {
      "name": "预计封面、标题、字幕",
      "kind": "text",
      "definition": "固定虚构剧照及9:16标识，叠加当前标题与字幕方案。",
      "source": "当前制作配置的实时计算结果；封面为虚构示意，未生成时不代表已完成选段或成片。",
      "behavior": "开启标题显示去首尾空格文字，空值显示「待输入引流小标题」。全解说仅字幕开启时显示解说字幕；高光/混合字幕关闭仍显示原片字幕。原型9:16示意不等于正式强制裁切；正式画幅按R-01。",
      "implementation": "本地虚构剧照与当前包装设置"
     },
     {
      "name": "编排流程与声音结构",
      "kind": "text",
      "definition": "只读顺序示意；显示高光/混合/全解说及实际速度。",
      "source": "当前制作配置的实时计算结果；封面为虚构示意，未生成时不代表已完成选段或成片。",
      "behavior": [
       "高光：高光开场×成片速度→完整对白推进→悬念收尾，声音为剧情原声。",
       "混合开头：解说引入×解说语速→原片原声推进×成片速度→悬念收尾。",
       "混合中段：高光原片开场×成片速度→解说承接×解说语速→原片原声推进×成片速度→悬念收尾。",
       "全解说：完整剧情解说×成片速度→匹配原片画面，人声关闭，声音为全篇解说。",
       "未选AI结构只显示待选择，隐藏声音结构。"
      ],
      "implementation": "当前制作方式、位置、成片速度与解说覆盖速度"
     },
     {
      "name": "字幕、BGM、引流小标题摘要",
      "kind": "text",
      "definition": "只读列出当前包装开启状态与文字/曲目。",
      "source": "当前制作配置的实时计算结果；封面为虚构示意，未生成时不代表已完成选段或成片。",
      "behavior": "字幕关闭时高光/混合显示「保留原片字幕」，全解说显示「关闭」；BGM关闭显示关闭，开启显示曲目；标题开启但未填显示待输入。",
      "copy": "按当前设置展示，具体片段生成后查看。",
      "implementation": "当前配置"
     }
    ],
    "checks": [
     "输入条数、集数、标题无需失焦，右侧摘要及底部报价立即更新。",
     "混合关闭共同语速并设独立1×，右侧分别显示原片1.5×和解说1×。",
     "AI未选结构时流程只有待选择，声音结构隐藏，不能误显示完整片段。",
     "右侧统一使用虚构剧照，不能当作已接入真实片源/视频预览。"
    ]
   },
   {
    "number": 6,
    "title": "报价与制作入口",
    "bullets": [
     "校验配置/片源/余额后生成，自动分析并编排；充足直接制作，不足确认实际数量（R-04/R-08）。"
    ],
    "anchor": {
     "selector": "#actionBar",
     "index": 0,
     "placement": "left"
    },
    "items": [
     {
      "name": "预计最高积分",
      "kind": "text",
      "definition": "有效配置下本次请求条数对应的最高演示估算，新增分析费与制作费分开。",
      "source": "当前制作配置、有效分析复用量及主平台费率/积分余额；原型用本机缓存与示例费率计算。",
      "default": "初始新增分析20分＋高光10条×32分＝340积分。",
      "behavior": "参数、选集与缓存改变重新报价；标记示例计费，沿用平台积分。未完成配置显示「待完成设置」和首个校验错误，不显示有效价格。",
      "validation": "正式费率、分析单位与兑换比例由平台确认；不能把演示数值当正式收费。",
      "implementation": "engine.js estimate：新增集数×1分＋请求条数×方式单价"
     },
     {
      "name": "费用明细",
      "kind": "action",
      "definition": "打开当前配置的费用拆分与收费节点说明。",
      "source": "当前制作配置、有效分析复用量及主平台费率/积分余额；原型用本机缓存与示例费率计算。",
      "behavior": "配置有效时可用；存在配置校验错误时禁用；只查看、不分析、不冻结或扣费。",
      "implementation": "app.js quoteDialog"
     },
     {
      "name": "生成视频",
      "kind": "action",
      "definition": "提交当前配置，自动分析、排重编排及按实际数量创建制作任务。",
      "source": "当前制作配置、有效分析复用量及主平台费率/积分余额；原型用本机缓存与示例费率计算。",
      "default": "配置有效且未处理时可点击；分析中显示「正在处理…」。",
      "behavior": [
       "先拦截本地预览状态与配置错误，再按请求条数的最高估算核对可用余额。",
       "分析完成后，数量充足直接进入成片管理；不足打开可生成数量确认，确认才建任务。",
       "演示实际：按实际条数冻结示例积分、逐条模拟检查后结算/失败释放，无真实MP4。产品要求：真实输出及结算按R-01/R-08/R-10。",
       "演示实际：配置输入自动存本机，无制作配置保存草稿按钮；其他工作区的文案保存模拟应用。产品要求：媒体草稿暂存与应用修改分开，按R-06。",
       "演示实际：刷新将未完成本地输出标失败并释放。产品要求：正式任务关页/熄屏仍由后台持续执行，按R-10。"
      ],
      "validation": "存在配置错误或分析处理中按钮禁用；余额不足点击时提示，当前按钮不会因余额不足预先禁用。不能重复提交分析操作。",
      "copy": [
       "积分不足，请减少条数或调整时长",
       "当前文件仅供本地预览，请先选择片源"
      ],
      "implementation": "app.js prepare / generate / createBatch"
     }
    ],
    "checks": [
     "有效初始配置最高340分；只打开费用明细余额和任务数不变。",
     "初始余额339时点生成被余额拦截，既不分析也不冻结；余额340时允许开始。",
     "分析中重复点击不会创建重复分析或任务。",
     "数量充足完成分析后自动创建任务，制作冻结为实际条数×单价并进入成片管理。",
     "数量不足先确认；返回调整不收制作费，已完成分析仍可复用。",
     "关闭本地预览后点生成仍提示先选择片源，不能将本地视频当已导入。"
    ]
   }
  ]
 },
 "modal-capacity": {
  "title": "可生成数量不足",
  "page": "分析与自动编排",
  "background": "",
  "need": "生成前明确计划数与可生成数，用户可按实际数量制作或返回调整，不以重复素材补数。",
  "sections": [
   {
    "number": 1,
    "title": "数量、原因与排重",
    "bullets": [
     "请求N/可生成M及不足原因；可调整片源、时长或数量，不能重复凑数（R-04）。"
    ],
    "anchor": {
     "selector": "#dialogBody > .capacity-summary",
     "index": 0,
     "placement": "left"
    },
    "items": [
     {
      "name": "计划 N 条，可生成 M 条",
      "kind": "text",
      "definition": "N为提交时请求数；M为本次规划可用且未使用方向数与N取较小值。",
      "source": "当前片源/选集、有效分析缓存、标准版本和内部候选编排结果；原型按虚构剧情模拟，真实分析/候选来自制作服务。",
      "behavior": "仅M<N时出现；M可为0。演示使用虚构剧情和排重逻辑，不能据此确认真实容量、每批可用率或正式产量。产品要求不足按实际数量确认，不重复素材或文案凑数（R-03/R-04）。",
      "implementation": "分析/编排后的计划快照与剩余候选"
     },
     {
      "name": "不足原因",
      "kind": "text",
      "definition": "只读说明为何当前集数、时长或差异要求无法满足请求数。",
      "source": "当前片源/选集、有效分析缓存、标准版本和内部候选编排结果；原型按虚构剧情模拟，真实分析/候选来自制作服务。",
      "behavior": "高光有限/过度相似提示增加片源或调时长；无可用方向提示无法满足制作时长；全解说不足提示无法支撑完整解说或不同画面方案。",
      "implementation": "编排返回原因；没有专属原因时按M是否为0生成提示"
     },
     {
      "name": "已排除 X 个方向",
      "kind": "text",
      "definition": "本次编排因原片区间重合或内容重复而剔除的候选数量。",
      "source": "当前片源/选集、有效分析缓存、标准版本和内部候选编排结果；原型按虚构剧情模拟，真实分析/候选来自制作服务。",
      "behavior": "仅排除数量>0出现。演示阈值包括原片重合>85%、同事件同首尾且重合>60%、全文同解说或完全重复；历史范围限同来源/资产/原片版本/语言的非失败项。以上是演示算法，正式阈值与历史范围待确认。",
      "implementation": "engine.js同批区间排重＋content-model.js内容/历史排重"
     }
    ],
    "checks": [
     "M≥N时不出现数量不足弹窗而直接生成N条；M<N时显示准确计划数与实际可生成数。",
     "M=0时明确不能生成，不用重复片段凑时长或凑条数。",
     "有排除项才显示排除数量；修改BGM/标题/速度不能作为新的内容方向绕过历史完全重复。"
    ]
   },
   {
    "number": 2,
    "title": "分析结算与本次制作费",
    "bullets": [
     "已分析费单列；制作费按M条，返回不收制作费，有效分析保留（R-08）。"
    ],
    "anchor": {
     "selector": "#dialogBody .cost-breakdown",
     "index": 0,
     "placement": "left"
    },
    "items": [
     {
      "name": "已完成分析 / 积分",
      "kind": "text",
      "definition": "此次提交已完成并结算的新增分析费，不是所有历史分析费用。",
      "source": "当前片源/选集、有效分析缓存、标准版本和内部候选编排结果；原型按虚构剧情模拟，真实分析/候选来自制作服务。",
      "default": "全量复用时0积分。",
      "behavior": "该费已在分析完成时扣除；弹窗确认或返回不会再次扣；有效缓存保留（R-08/R-11）。",
      "implementation": "此次计划的新增分析费用快照"
     },
     {
      "name": "本次制作 · M 条 / 积分",
      "kind": "text",
      "definition": "按实际可生成M条的制作预算。",
      "source": "当前片源/选集、有效分析缓存、标准版本和内部候选编排结果；原型按虚构剧情模拟，真实分析/候选来自制作服务。",
      "behavior": "未确认前尚未冻结制作费。M=0为0分；不是原请求N条预算。全解说单价沿用当前计划时长估算。",
      "implementation": "M×提交时方式演示单价"
     },
     {
      "name": "实际数量计费提示",
      "kind": "text",
      "definition": "说明退回调整和分析复用结果。",
      "source": "当前片源/选集、有效分析缓存、标准版本和内部候选编排结果；原型按虚构剧情模拟，真实分析/候选来自制作服务。",
      "copy": "按实际生成条数计费；返回调整不收制作费，已完成分析可复用。",
      "implementation": "app.js showCapacityDialog"
     }
    ],
    "checks": [
     "分析费已扣20分、M=3高光时展示已分析20与制作96；未点击生成不冻结96。",
     "返回调整后制作费为0、已分析20仍扣且缓存保留；再次同范围生成分析为0。",
     "全部复用并M=0时两行都为0，不建空任务。"
    ]
   },
   {
    "number": 3,
    "title": "返回调整或生成现有条数",
    "bullets": [
     "返回保留配置；M>0可生成M条，M=0不建空任务；提交前复核依据版本。"
    ],
    "anchor": {
     "selector": "#dialogActions",
     "index": 0,
     "placement": "left"
    },
    "items": [
     {
      "name": "返回调整 / 右上角关闭",
      "kind": "action",
      "definition": "放弃当前实际数量提交。",
      "source": "当前片源/选集、有效分析缓存、标准版本和内部候选编排结果；原型按虚构剧情模拟，真实分析/候选来自制作服务。",
      "behavior": "返回调整关闭弹窗并进入制作页，保留配置；×仅收起弹窗停留原页面。两者均不建制作任务，不冻结制作费，保留已有效分析。",
      "implementation": "app.js create及通用关闭"
     },
     {
      "name": "生成 M 条",
      "kind": "action",
      "definition": "接受实际可生成数量并创建任务。",
      "source": "当前片源/选集、有效分析缓存、标准版本和内部候选编排结果；原型按虚构剧情模拟，真实分析/候选来自制作服务。",
      "default": "仅M>0显示；M=0无此按钮。",
      "behavior": "提交时重新取当前剩余方案，复核片源有效、分析修订与当前标准标识，再按实际条数冻结；成功进入成片管理。制作配置快照仍保留原请求N，实际输出数量为M。",
      "validation": "无剩余候选提示调整片源/时长；依据更新转制作依据已更新弹窗，不开工。余额不足不创建任务，显示演示积分不足。",
      "implementation": "app.js generate-available / generate"
     }
    ],
    "checks": [
     "返回调整不新建任务，集数/时长/数量不被自动改为M。",
     "M=0没有生成按钮，只能返回或关闭；不会创建0条任务。",
     "M=3点生成只创建3个输出，冻结3×单价，不按N冻结。",
     "在确认前分析版本更新，提交被依据过期拦截；已完成分析费不重复收，未冻制作费。"
    ]
   }
  ]
 },
 "assets": {
  "title": "剧目管理 · 剧目列表",
  "page": "剧目管理",
  "background": "",
  "need": "以剧目聚合片源、分析和交付进度，让同剧多任务可追溯且不同来源不混淆。",
  "sections": [
   {
    "number": 1,
    "title": "新增剧目与总览",
    "bullets": [
     "新增剧目选合集/本地上传；同源同合集聚合，不按同名跨来源合并。"
    ],
    "anchor": {
     "selector": ".page-head",
     "index": 0,
     "placement": "left"
    },
    "items": [
     {
      "name": "新增剧目",
      "kind": "action",
      "definition": "打开片源选择弹窗；入口复用合集选择及本地文件预览",
      "source": "当前账户可见的剧目、制作批次、成片版本/确认记录和同步回执聚合；原型为V7本机记录。",
      "behavior": "选合集且确认后登记剧目；取消保留原配置",
      "copy": "新增剧目",
      "implementation": "library-ui.js:renderLibrary；app.js:add-drama/openPicker"
     },
     {
      "name": "剧目总览",
      "kind": "text",
      "definition": "共剧数、制作中任务数、待检查条数、当前版本已同步条数；总览基于全库，不随筛选缩小",
      "source": "当前账户可见的剧目、制作批次、成片版本/确认记录和同步回执聚合；原型为V7本机记录。",
      "behavior": "纯投影读取；不分析、不创建任务、不扣积分",
      "implementation": "library-ui.js:renderLibrary；dramas.js:listDramas"
     },
     {
      "name": "剧目身份",
      "kind": "text",
      "definition": "green 按 [kind,market,collectionId] 聚合；manual 按 assetId；sample 按 assetId/default；原片版本与分析语言不参与身份",
      "source": "当前账户可见的剧目、制作批次、成片版本/确认记录和同步回执聚合；原型为V7本机记录。",
      "behavior": "同源同合集的多个批次归同剧；同名跨来源/跨市场保持独立；选中当前配置也会入库",
      "copy": "不显示内部分析编号",
      "implementation": "dramas.js:dramaKey/registerDrama"
     },
     {
      "name": "本地上传边界",
      "kind": "text",
      "definition": "原型只打开 video/* 文件预览，不完成本地文件导入或真实分析",
      "source": "当前账户可见的剧目、制作批次、成片版本/确认记录和同步回执聚合；原型为V7本机记录。",
      "copy": "文件仅在本机预览，尚未导入。",
      "implementation": "app.js:upload/localFile；sources.js:resolveSource"
     }
    ],
    "checks": [
     "正常：同市场同合集创建两批后只显示一部剧，批次数为2。",
     "边界：国内/海外相同 collection-001 或同名剧保持两行；fileVersion/language 变化不新建剧目。",
     "边界：只进入剧目管理不新增任务/分析/费用；本地文件预览不能宣称已导入。"
    ]
   },
   {
    "number": 2,
    "title": "搜索与筛选",
    "bullets": [
     "剧名/合集ID搜索，可组合来源与状态；空结果可清空筛选。"
    ],
    "anchor": {
     "selector": ".library-filters",
     "index": 0,
     "placement": "left"
    },
    "items": [
     {
      "name": "剧名/合集ID搜索",
      "kind": "field",
      "definition": "大小写不敏感子串匹配 title + drama.id；关键字 trim",
      "source": "当前账户可见的剧目、制作批次、成片版本/确认记录和同步回执聚合；原型为V7本机记录。",
      "default": "空字符串",
      "behavior": "输入即时筛选，保留输入光标",
      "copy": "搜索剧名",
      "implementation": "library-ui.js:renderLibrary；app.js:dramaSearch"
     },
     {
      "name": "剧目来源",
      "kind": "field",
      "definition": "按来源组合筛选",
      "source": "已登记片源的国内/海外/手动类型；同源合集或独立手动资产形成剧目身份。",
      "default": "all",
      "values": [
       {
        "value": "all",
        "label": "全部来源",
        "meaning": "不限制来源"
       },
       {
        "value": "domestic",
        "label": "国内短剧",
        "meaning": "green + market=domestic"
       },
       {
        "value": "overseas",
        "label": "海外短剧",
        "meaning": "green + market=overseas"
       },
       {
        "value": "manual",
        "label": "手动片源",
        "meaning": "非 green 来源；含历史 sample"
       }
      ],
      "implementation": "library-ui.js:marketOf/renderLibrary"
     },
     {
      "name": "剧目工作状态",
      "kind": "field",
      "definition": "按剧目聚合工作状态筛选",
      "source": "当前账户可见的剧目、制作批次、成片版本/确认记录和同步回执聚合；原型为V7本机记录。",
      "default": "all",
      "values": [
       {
        "value": "all",
        "label": "全部状态",
        "meaning": "不限制"
       },
       {
        "value": "running",
        "label": "制作中",
        "meaning": "runningCount>0"
       },
       {
        "value": "review",
        "label": "有待检查成片",
        "meaning": "reviewCount>0"
       },
       {
        "value": "empty",
        "label": "尚未制作",
        "meaning": "没有制作批次"
       }
      ],
      "implementation": "library-ui.js:renderLibrary；dramas.js:listDramas"
     },
     {
      "name": "清空筛选",
      "kind": "action",
      "definition": "同时清空关键字、来源和状态",
      "source": "当前账户可见的剧目/任务记录及产品固定筛选枚举；原型从V7本机记录筛选。",
      "behavior": "query=\"\"；market/status=all；仅影响本页筛选",
      "implementation": "app.js:clear-drama-filters"
     },
     {
      "name": "空结果",
      "kind": "text",
      "definition": "没有满足组合条件的剧目",
      "source": "当前账户可见的剧目、制作批次、成片版本/确认记录和同步回执聚合；原型为V7本机记录。",
      "behavior": "显示清空筛选、新增剧目两入口",
      "copy": [
       "没有符合条件的剧目",
       "可以清空筛选，或从合集新增一部剧。"
      ],
      "implementation": "library-ui.js:renderLibrary"
     }
    ],
    "checks": [
     "正常：关键字+来源+状态同时满足时返回匹配剧目；总览仍显示全库统计。",
     "边界：空格关键字等于空搜索；不存在的合集ID显示空结果，清空后恢复全部。"
    ]
   },
   {
    "number": 3,
    "title": "剧目、片源与分析",
    "bullets": [
     "显示可用集数、制作批次及生成/确认/同步数，隐藏内部分析编号。"
    ],
    "anchor": {
     "selector": ".drama-table, .empty",
     "index": 0,
     "placement": "left"
    },
    "items": [
     {
      "name": "剧目 / 来源列",
      "kind": "text",
      "definition": "剧名、来源文案及国/海/本标识；不展示分析缓存编号",
      "source": "已登记片源的国内/海外/手动类型；同源合集或独立手动资产形成剧目身份。",
      "values": [
       {
        "value": "green/domestic",
        "label": "国内短剧",
        "meaning": "国内绿台合集"
       },
       {
        "value": "green/overseas",
        "label": "海外短剧",
        "meaning": "海外绿台合集"
       },
       {
        "value": "manual|sample",
        "label": "手动片源 · 类型未确定",
        "meaning": "手动示例或历史 sample；同步时显式选系统"
       }
      ],
      "implementation": "library-ui.js:renderLibrary；app.js:sourceLabel"
     },
     {
      "name": "片源列",
      "kind": "text",
      "definition": "去重有效可用集数 / 总集数；可用数不足显示橙色提示",
      "source": "当前账户可见的剧目、制作批次、成片版本/确认记录和同步回执聚合；原型为V7本机记录。",
      "copy": "部分剧集待准备",
      "implementation": "dramas.js:sourceFor/listDramas；library-ui.js:renderLibrary"
     },
     {
      "name": "制作任务列",
      "kind": "text",
      "definition": "批次数；有 runningCount 时显示制作中N个，否则有批次显示已完成N个；有 failedCount 显示N个任务需补生成",
      "source": "当前账户可见的剧目、制作批次、成片版本/确认记录和同步回执聚合；原型为V7本机记录。",
      "behavior": "runningCount 原型只计批次 running 或 pending/reworkPending；failedCount 按失败批次计，不按失败条数",
      "copy": "还没有制作任务",
      "implementation": "dramas.js:listDramas；library-ui.js:renderLibrary"
     },
     {
      "name": "成片与交付列",
      "kind": "text",
      "definition": "生成=ready/issue；确认=ready且 confirmedVersion 等于当前有效版本；同步=当前内容版本有 success 回执",
      "source": "当前账户可见的剧目、制作批次、成片版本/确认记录和同步回执聚合；原型为V7本机记录。",
      "behavior": "旧版成功不增加当前版本同步数；聚合确认口径未排除 narrationDraft/repairing/reworkPending，与可交付口径有差异需联调统一",
      "implementation": "dramas.js:listDramas；sync-model.js:getOutputSync"
     },
     {
      "name": "显示数量",
      "kind": "text",
      "definition": "显示筛选后的剧数 / 全库剧数；按最近活动时间降序，时间相同按身份排序",
      "source": "当前账户可见的剧目、制作批次、成片版本/确认记录和同步回执聚合；原型为V7本机记录。",
      "copy": "显示 N / M 部",
      "implementation": "dramas.js:listDramas；library-ui.js:renderLibrary"
     }
    ],
    "checks": [
     "正常：ready与issue计已生成；failed/pending不计；确认当前版后已确认+1。",
     "边界：旧版同步成功后升版，当前版已同步计数归零但旧记录保留。",
     "边界：部分缺集显示实际可用数和待准备提示；内部分析ID不出现。"
    ]
   },
   {
    "number": 4,
    "title": "进入单剧工作区",
    "bullets": [
     "详情默认制作任务；继续制作带入该剧配置，仅两个页签。"
    ],
    "anchor": {
     "selector": "[data-action=\"open-drama\"], .empty [data-action=\"add-drama\"]",
     "index": 0,
     "placement": "left"
    },
    "items": [
     {
      "name": "查看剧目",
      "kind": "action",
      "definition": "进入单剧工作区并默认制作任务页签",
      "source": "当前账户可见的剧目、制作批次、成片版本/确认记录和同步回执聚合；原型为V7本机记录。",
      "behavior": "复制该剧已保存配置到当前制作配置；重置单剧成片筛选为all；释放本地预览URL",
      "validation": "失效身份不导航，提示“剧目已失效，请重新选择”",
      "implementation": "app.js:open-drama/openDrama"
     },
     {
      "name": "继续制作",
      "kind": "action",
      "definition": "进入制作页并带入该剧配置",
      "source": "当前账户可见的剧目、制作批次、成片版本/确认记录和同步回执聚合；原型为V7本机记录。",
      "behavior": "不自动分析/生成/扣费；继续提交时重新校验",
      "copy": "继续制作",
      "implementation": "app.js:make-drama/openDrama"
     },
     {
      "name": "详情页签",
      "kind": "field",
      "definition": "只提供制作任务与成片与交付",
      "source": "当前账户可见的剧目、制作批次、成片版本/确认记录和同步回执聚合；原型为V7本机记录。",
      "default": "tasks",
      "values": [
       {
        "value": "tasks",
        "label": "制作任务 · N",
        "meaning": "当前剧的批次"
       },
       {
        "value": "outputs",
        "label": "成片与交付 · N",
        "meaning": "当前剧已生成成片汇总"
       }
      ],
      "implementation": "library-ui.js:renderDrama"
     }
    ],
    "checks": [
     "正常：查看剧目打开当前剧制作任务；继续制作的剧名、来源、集数和制作方式来自该剧配置。",
     "边界：无批次剧仍可进入详情；配置复制不改变已有批次快照。"
    ]
   }
  ]
 },
 "tasks": {
  "title": "成片管理",
  "page": "成片管理",
  "background": "",
  "need": "集中查看进度，预览、确认及同步成片。",
  "sections": [
   {
    "number": 1,
    "title": "任务筛选",
    "bullets": [
     "按剧目/方式/状态组合筛选；方式只有高光、AI，历史原片归入高光结果。"
    ],
    "anchor": {
     "selector": ".library-filters",
     "index": 0,
     "placement": "left"
    },
    "items": [
     {
      "name": "按剧目筛选任务",
      "kind": "field",
      "definition": "选项由 listDramas 动态生成；每项=剧名 · 来源，以 dramaKey 区分",
      "source": "当前账户可见的剧目/任务记录及产品固定筛选枚举；原型从V7本机记录筛选。",
      "default": "all",
      "values": [
       {
        "value": "all",
        "label": "全部剧目",
        "meaning": "所有任务"
       },
       {
        "value": "dramaKey(config)",
        "label": "剧名 · 来源",
        "meaning": "只显示该来源身份的任务"
       }
      ],
      "implementation": "app.js:tasksView"
     },
     {
      "name": "按制作方式筛选",
      "kind": "field",
      "definition": "新筛选只提供高光与AI；历史 original 归入 highlight 结果",
      "source": "当前账户可见的剧目/任务记录及产品固定筛选枚举；原型从V7本机记录筛选。",
      "default": "all",
      "values": [
       {
        "value": "all",
        "label": "全部制作方式",
        "meaning": "不限制方式"
       },
       {
        "value": "highlight",
        "label": "高光混剪",
        "meaning": "高光任务及历史 original 任务"
       },
       {
        "value": "narrated",
        "label": "AI 解说",
        "meaning": "解说＋原片、全解说及历史解说任务"
       }
      ],
      "behavior": "历史任务显示“原片混剪（历史任务）”，保留旧快照；新制作归一化为高光",
      "implementation": "app.js:tasksView；engine.js:MODES/modeLabel"
     },
     {
      "name": "按任务状态筛选",
      "kind": "field",
      "definition": "状态可和剧目、方式组合",
      "source": "当前账户可见的剧目/任务记录及产品固定筛选枚举；原型从V7本机记录筛选。",
      "default": "all",
      "values": [
       {
        "value": "all",
        "label": "全部状态",
        "meaning": "不限制任务"
       },
       {
        "value": "running",
        "label": "制作中",
        "meaning": "批次 running/checking，或有 pending/checking/返工/修复成片"
       },
       {
        "value": "review",
        "label": "有待检查成片",
        "meaning": "有 ready/issue 且当前版本未确认、未返工、未修复的成片"
       },
       {
        "value": "failed",
        "label": "需补生成",
        "meaning": "至少一条 output.status=failed"
       }
      ],
      "implementation": "app.js:tasksView；library-ui.js:taskMatches"
     },
     {
      "name": "清空筛选",
      "kind": "action",
      "definition": "恢复全部剧目、全部方式、全部状态",
      "source": "当前账户可见的剧目/任务记录及产品固定筛选枚举；原型从V7本机记录筛选。",
      "behavior": "三个筛选均归all；新生成、查看成片或返回成片管理也清空任务筛选",
      "implementation": "app.js:clear-task-filters"
     },
     {
      "name": "制作素材",
      "kind": "action",
      "definition": "进入制作页",
      "source": "当前账户可见的剧目、制作批次、成片版本/确认记录和同步回执聚合；原型为V7本机记录。",
      "behavior": "仅导航，不自动提交",
      "implementation": "app.js:nav/create；tasks-ui.js:renderTaskCards"
     },
     {
      "name": "空结果",
      "kind": "text",
      "definition": "无满足条件的任务",
      "source": "当前账户可见的剧目、制作批次、成片版本/确认记录和同步回执聚合；原型为V7本机记录。",
      "copy": [
       "暂无符合条件的制作任务",
       "选择片源和制作方式，开始制作素材。"
      ],
      "implementation": "tasks-ui.js:renderTaskCards"
     }
    ],
    "checks": [
     "正常：三个筛选取交集；筛掉当前批次后自动展开首个匹配批次并清空已选。",
     "边界：选择高光仍能找到历史 original 任务；筛选下拉没有原片混剪选项。",
     "边界：空结果保留筛选和制作素材入口；清空后恢复。"
    ]
   },
   {
    "number": 2,
    "title": "制作任务与展开",
    "bullets": [
     "一次展开一批；继续预览从可预览待确认项开始，再做一批只复制配置。"
    ],
    "anchor": {
     "selector": ".task-list, .empty",
     "index": 0,
     "placement": "left"
    },
    "items": [
     {
      "name": "任务卡头",
      "kind": "text",
      "definition": "剧名、方式/解说结构、取材范围、实际速度、来源、制作时间、生成/确认/失败数、实际扣除/冻结费用",
      "source": "当前账户可见的剧目、制作批次、成片版本/确认记录和同步回执聚合；原型为V7本机记录。",
      "behavior": "生成数计ready/issue；batch.id保留在title悬停信息",
      "implementation": "tasks-ui.js:renderTaskCards；engine.js:modeLabel/speedSummary"
     },
     {
      "name": "任务状态",
      "kind": "status",
      "definition": "依优先级计算可见批次状态",
      "source": "当前账户可见的剧目、制作批次、成片版本/确认记录和同步回执聚合；原型为V7本机记录。",
      "values": [
       {
        "value": "reworkPending",
        "label": "单条重做中",
        "meaning": "优先级最高；有单条正在返工"
       },
       {
        "value": "quality.checking|quality.repairing",
        "label": "自动质检中",
        "meaning": "有条目自动检查或自动修复"
       },
       {
        "value": "running",
        "label": "制作中",
        "meaning": "任务或成片仍处理中"
       },
       {
        "value": "failed",
        "label": "部分未完成",
        "meaning": "无处理中条目且有失败项"
       },
       {
        "value": "complete",
        "label": "已完成",
        "meaning": "以上条件都不满足；不表示人工验收完成"
       }
      ],
      "implementation": "tasks-ui.js:renderTaskCards"
     },
     {
      "name": "展开/收起任务",
      "kind": "action",
      "definition": "一次最多展开一个批次",
      "source": "当前账户可见的剧目、制作批次、成片版本/确认记录和同步回执聚合；原型为V7本机记录。",
      "behavior": "同批次点击切换折叠；切换批次清空选中；折叠同批次保留选中",
      "implementation": "app.js:toggle-task；tasks-ui.js:renderTaskCards"
     },
     {
      "name": "继续预览",
      "kind": "action",
      "definition": "从同批首个可预览且当前版未确认项开始",
      "source": "当前账户可见的剧目、制作批次、成片版本/确认记录和同步回执聚合；原型为V7本机记录。",
      "behavior": "只有存在此项才显示；队列固定为进入时的可预览同批项，不跨批次",
      "validation": "ready/issue且未repairing/reworkPending；待制作或失败项不可预览",
      "implementation": "tasks-ui.js:renderTaskCards；app.js:startReview"
     },
     {
      "name": "再做一批",
      "kind": "action",
      "definition": "复制该批配置到制作页",
      "source": "当前账户可见的剧目、制作批次、成片版本/确认记录和同步回执聚合；原型为V7本机记录。",
      "behavior": "重新分析复用判断、校验、报价与生成；保留原批内容/规则/分析快照，不直接复制成片",
      "implementation": "app.js:repeat-batch"
     },
     {
      "name": "费用明细",
      "kind": "action",
      "definition": "打开此批费用说明",
      "source": "主平台账户余额/费率及本任务分析、制作、返工、冻结/结算/释放/退款记录；原型读取V7本机演示流水。",
      "behavior": "只读，不新增费用",
      "implementation": "app.js:batch-cost；workflow-model.js:costSummary"
     }
    ],
    "checks": [
     "正常：切换第二批时第一批收起且选中清零；继续预览从最早可预览待确认项开始。",
     "边界：全已确认或尚无可预览成片时不显示继续预览；再做一批不修改历史任务。"
    ]
   },
   {
    "number": 3,
    "title": "制作进度与费用入口",
    "bullets": [
     "逐条进度及费用明细；取消保留成功项，失败仅补失败项（R-08/R-10）。"
    ],
    "anchor": {
     "selector": ".task-output-summary",
     "index": 0,
     "placement": "left"
    },
    "items": [
     {
      "name": "制作汇总",
      "kind": "text",
      "definition": "已生成ready/issue数/计划条数；已确认数；实际扣除、冻结、释放积分；冻结/释放仅非零显示",
      "source": "当前账户可见的剧目、制作批次、成片版本/确认记录和同步回执聚合；原型为V7本机记录。",
      "behavior": "当前版确认数排除草稿、返工、修复；实际扣除=max(0,分析+已结算制作-已扣退回)",
      "implementation": "app.js:batchOutputsView；workflow-model.js:costSummary"
     },
     {
      "name": "制作提示及进度",
      "kind": "status",
      "definition": "有pending条目时展示制作与自动检查提示及示意进度条",
      "source": "当前账户可见的剧目、制作批次、成片版本/确认记录和同步回执聚合；原型为V7本机记录。",
      "behavior": "原型计时模拟；不是渲染真实视频或真实百分比",
      "copy": "正在制作并自动检查素材",
      "implementation": "app.js:batchOutputsView/scheduleGenerated"
     },
     {
      "name": "取消未完成",
      "kind": "action",
      "definition": "只取消当前批仍为pending的条目",
      "source": "当前账户可见的剧目、制作批次、成片版本/确认记录和同步回执聚合；原型为V7本机记录。",
      "behavior": "失效当前尝试，条目变failed并释放其冻结额度；已成功、已确认或同步记录保留",
      "copy": "未完成条目的冻结积分已释放",
      "implementation": "app.js:cancel-generation；engine.js:settleOutput"
     },
     {
      "name": "费用明细",
      "kind": "action",
      "definition": "展示预计/授权上限、实际扣除、分析、已结算制作、冻结、失败/取消释放、已扣退回、平均消费",
      "source": "主平台账户余额/费率及本任务分析、制作、返工、冻结/结算/释放/退款记录；原型读取V7本机演示流水。",
      "behavior": "平均消费=净实际消费/当前版已确认数量；无确认项不计算；原型示例积分/费率不是真实账户配置",
      "copy": [
       "冻结是暂占额度；释放回到可用余额，不属于已扣费用的退款。",
       "暂无已确认素材，暂不计算平均消费。"
      ],
      "implementation": "workflow-ui.js:costBreakdown；workflow-model.js:costSummary"
     }
    ],
    "checks": [
     "正常：处理中冻结随逐条成功转入已结算制作，失败或取消释放回可用余额。",
     "边界：取消只处理pending，成功项仍能预览；取消后晚到的计时回调不能改回成功。",
     "边界：无已确认项显示不计算平均消费；关闭费用详情不扣费。"
    ]
   },
   {
    "number": 4,
    "title": "选择与批量操作",
    "bullets": [
     "选择只作用当前任务；快捷选已确认未同步不隐藏行，批量确认需人工勾选。"
    ],
    "anchor": {
     "selector": ".task-outputs .toolbar",
     "index": 0,
     "placement": "left"
    },
    "items": [
     {
      "name": "行复选框/全选",
      "kind": "field",
      "definition": "只选当前展开批次 ready 且可预览、无未保存文案、未被同步锁定的条目",
      "source": "当前账户可见的剧目、制作批次、成片版本/确认记录和同步回执聚合；原型为V7本机记录。",
      "default": "初始未选；切批/导航清空",
      "behavior": "全选覆盖当前批全部符合条件项，不隐藏不符合条件行；无可选项时全选禁用",
      "copy": "全选已生成素材",
      "implementation": "workflow-ui.js:outputTable；app.js:select-all"
     },
     {
      "name": "选已确认未同步",
      "kind": "action",
      "definition": "替换当前批次选中集合为 canSync 成片",
      "source": "当前账户可见的剧目、制作批次、成片版本/确认记录和同步回执聚合；原型为V7本机记录。",
      "behavior": "包含明确同步失败的可重试当前版；排除待确认、草稿、返工、修复、同步中、待核实及成功项",
      "implementation": "app.js:select-syncable；sync-ui.js:canSync"
     },
     {
      "name": "确认选中可用",
      "kind": "action",
      "definition": "对当前已选打开人工确认弹窗",
      "source": "当前账户可见的剧目、制作批次、成片版本/确认记录和同步回执聚合；原型为V7本机记录。",
      "behavior": "必须勾选“已检查所选素材，确认当前版本可以使用”；提交时复核所选版本、ready、问题/草稿/锁",
      "validation": "无选中禁用；未勾选不确认；状态变化拒绝整批确认",
      "copy": [
       "已检查所选素材，确认当前版本可以使用",
       "素材状态已变化，请重新检查"
      ],
      "implementation": "app.js:confirm-selected/confirmModal/apply-confirm"
     },
     {
      "name": "同步选中素材",
      "kind": "action",
      "definition": "将当前批次已选传入上传表单",
      "source": "当前账户可见的剧目、制作批次、成片版本/确认记录和同步回执聚合；原型为V7本机记录。",
      "behavior": "只有非空且全部canSync才启用；使用原选中集合，不自动增加成片",
      "validation": "打开及提交再校验当前确认与同步状态",
      "implementation": "app.js:batchOutputsView；sync-ui.js:open"
     },
     {
      "name": "已选条数",
      "kind": "text",
      "definition": "当前批次选中集合大小",
      "source": "当前账户可见的剧目、制作批次、成片版本/确认记录和同步回执聚合；原型为V7本机记录。",
      "copy": "已选 N 条",
      "implementation": "app.js:batchOutputsView"
     }
    ],
    "checks": [
     "正常：手动选择两条后确认需人工勾选，完成后仅这两条当前版变已确认。",
     "边界：全选不选失败/issue/草稿/锁定项，其他行仍显示；无选中确认、同步禁用。",
     "边界：快捷选择包含明确失败可重试项，但不含unknown/success；切批后不跨任务保留选择。"
    ]
   },
   {
    "number": 5,
    "title": "成片预览与失败处理",
    "bullets": [
     "封面/名称进入预览；无检查按钮/状态列，异常短提示，确认和同步仍校验内部条件。"
    ],
    "anchor": {
     "selector": ".task-outputs .table-wrap",
     "index": 0,
     "placement": "left"
    },
    "items": [
     {
      "name": "素材列",
      "kind": "text",
      "definition": "封面、名称、方式/结构、制作时间；“详细信息”内任务ID、素材ID、内容V、取材集数",
      "source": "当前账户可见的剧目、制作批次、成片版本/确认记录和同步回执聚合；原型为V7本机记录。",
      "behavior": "正常ready行不另显示检查状态；异常在名称下短提示；封面为虚构故事板静态图",
      "implementation": "workflow-ui.js:outputTable；engine.js:modeLabel"
     },
     {
      "name": "时长列",
      "kind": "text",
      "definition": "当前成片 duration 转为m:ss",
      "source": "当前账户可见的剧目、制作批次、成片版本/确认记录和同步回执聚合；原型为V7本机记录。",
      "behavior": "示例故事板时长；不是实际媒体测量值",
      "implementation": "workflow-ui.js:outputTable；app.js:fmt"
     },
     {
      "name": "素材同步列",
      "kind": "status",
      "definition": "当前版本同步状态、目标国内/海外和版本号；无当前记录时显示待确认/待同步",
      "source": "当前账户可见的剧目、制作批次、成片版本/确认记录和同步回执聚合；原型为V7本机记录。",
      "values": [
       {
        "value": "pending",
        "label": "等待同步",
        "meaning": "排队且锁定当前版本"
       },
       {
        "value": "processing",
        "label": "同步中",
        "meaning": "传输处理中且锁定当前版本"
       },
       {
        "value": "success",
        "label": "已同步",
        "meaning": "保留素材回执；禁止同版本重复上传"
       },
       {
        "value": "failed",
        "label": "同步失败",
        "meaning": "明确失败；当前版本仍确认可用时允许失败重试"
       },
       {
        "value": "unknown",
        "label": "待核实结果",
        "meaning": "结果不明；必须先查询，锁定当前版本"
       },
       {
        "value": "none-confirmed",
        "label": "待同步",
        "meaning": "无当前版回执且当前版本已确认"
       },
       {
        "value": "none-unconfirmed",
        "label": "待确认",
        "meaning": "无当前版回执且当前版本未确认"
       }
      ],
      "behavior": "只有旧版成功时补“旧版本已同步”；回执以当前版本查询，晚失败不能掩盖成功/未决尝试",
      "implementation": "sync-ui.js:badgeFor；sync-model.js:getOutputSync"
     },
     {
      "name": "异常短提示",
      "kind": "status",
      "definition": "名称下展示处理中、失败、需处理或创作建议；无独立检查状态列/检查按钮",
      "source": "当前账户可见的剧目、制作批次、成片版本/确认记录和同步回执聚合；原型为V7本机记录。",
      "values": [
       {
        "value": "reworkPending",
        "label": "重新制作中",
        "meaning": "单条返工"
       },
       {
        "value": "repairing",
        "label": "修复中",
        "meaning": "局部修复"
       },
       {
        "value": "pending+quality.repairing",
        "label": "自动修复中",
        "meaning": "生成自动补救"
       },
       {
        "value": "pending+quality.checking",
        "label": "自动检查中",
        "meaning": "自动质检"
       },
       {
        "value": "pending",
        "label": "制作中",
        "meaning": "生成中"
       },
       {
        "value": "failed+quality.failed",
        "label": "检查未通过",
        "meaning": "质量失败；原型partial也赋quality.failed"
       },
       {
        "value": "failed",
        "label": "制作失败",
        "meaning": "失败但未标quality.failed"
       },
       {
        "value": "issue",
        "label": "N 项质量问题待处理",
        "meaning": "待处理质量问题"
       },
       {
        "value": "creative-preferences",
        "label": "有创作调整建议",
        "meaning": "存在创作偏好待采用"
       }
      ],
      "implementation": "workflow-ui.js:outputStatus/outputTable"
     },
     {
      "name": "封面/名称预览",
      "kind": "action",
      "definition": "打开被点击批次的被点击成片",
      "source": "当前账户可见的剧目、制作批次、成片版本/确认记录和同步回执聚合；原型为V7本机记录。",
      "behavior": "ready/issue且未修复/返工可打开；失败或处理中禁用",
      "implementation": "workflow-ui.js:outputTable；app.js:startReview"
     },
     {
      "name": "补生成 / 单条返工",
      "kind": "action",
      "definition": "失败行显示补生成，其他行显示单条返工",
      "source": "当前账户可见的剧目、制作批次、成片版本/确认记录和同步回执聚合；原型为V7本机记录。",
      "behavior": "补生成仅当前失败项，重新冻结该条单位费用；不足提示示例积分不足；返工只影响这一条，受可预览与同步锁限制",
      "implementation": "workflow-ui.js:outputTable；app.js:retry-output/openRework"
     },
     {
      "name": "同步行操作",
      "kind": "action",
      "definition": "依据当前版本回执切换入口",
      "source": "当前账户可见的剧目、制作批次、成片版本/确认记录和同步回执聚合；原型为V7本机记录。",
      "behavior": [
       "success：同步记录",
       "pending/processing/unknown：查看同步",
       "failed：重试同步，打开失败任务详情",
       "无记录：同步素材；未确认禁用"
      ],
      "validation": "不绕过当前版人工确认、内部质量/草稿及锁校验",
      "implementation": "sync-ui.js:rowAction/open"
     }
    ],
    "checks": [
     "正常：可预览行点击封面和名称都进入该条；表头仅选择(全局)、素材、时长、素材同步、操作。",
     "边界：失败行补生成只重试这一条且重新检查，不重做成功项；余额不足不扣费、不建尝试。",
     "边界：同步中/待核实项预览可读，编辑/确认/重复上传锁定；旧版成功不显示当前版已同步。"
    ]
   },
   {
    "number": 6,
    "title": "导出已选方案",
    "bullets": [
     "方案为辅助文件；正式MP4下载，无未应用草稿才可交付（R-01/R-06）。"
    ],
    "anchor": {
     "selector": ".task-outputs .table-footer",
     "index": 0,
     "placement": "left"
    },
    "items": [
     {
      "name": "更多",
      "kind": "action",
      "definition": "展开辅助导出入口",
      "source": "当前账户可见的剧目、制作批次、成片版本/确认记录和同步回执聚合；原型为V7本机记录。",
      "behavior": "折叠展开不改变选择或状态",
      "implementation": "app.js:batchOutputsView"
     },
     {
      "name": "导出选中方案",
      "kind": "action",
      "definition": "下载当前批选中输出的 JSON 剪辑方案",
      "source": "当前账户可见的剧目、制作批次、成片版本/确认记录和同步回执聚合；原型为V7本机记录。",
      "behavior": "包含 demo=true、来源、配置、标准、分析快照、成片与版本；文件名mixed-cut-v7-批次ID.json",
      "validation": "无选中禁用；任一未保存文案阻止导出并提示先保存/放弃",
      "copy": "故事板方案，非真实视频",
      "implementation": "app.js:exportPlans"
     },
     {
      "name": "正式交付边界",
      "kind": "text",
      "definition": "方案JSON为辅助文件；正式需求交付可播放下载MP4；原型没有真实视频生成/MP4下载",
      "source": "当前账户可见的剧目、制作批次、成片版本/确认记录和同步回执聚合；原型为V7本机记录。",
      "behavior": "正式交付应复核无未应用草稿；不能把导出方案当已同步或真实媒体",
      "implementation": "app.js:exportPlans；review-notes.js:tasks[6]/R-01/R-06"
     }
    ],
    "checks": [
     "正常：选择两条导出只含该两条与来源/版本，导出不改变确认/同步/费用。",
     "边界：未保存草稿阻止导出；导出JSON不得声称真实MP4已交付。"
    ]
   }
  ]
 },
 "drama-tasks": {
  "title": "剧目详情 · 制作任务",
  "page": "剧目管理",
  "background": "",
  "need": "在剧目内集中查看批次及结果，保留每次制作的配置、消费和状态。",
  "sections": [
   {
    "number": 1,
    "title": "当前剧与工作区",
    "bullets": [
     "仅当前剧统计；默认任务页，继续制作带入该剧配置。"
    ],
    "anchor": {
     "selector": ".library-overview",
     "index": 0,
     "placement": "left"
    },
    "items": [
     {
      "name": "当前剧标题与来源",
      "kind": "text",
      "definition": "当前剧名、来源、可用/总集数；只统计此dramaKey",
      "source": "已登记片源的国内/海外/手动类型；同源合集或独立手动资产形成剧目身份。",
      "values": [
       {
        "value": "green/domestic",
        "label": "国内短剧",
        "meaning": "国内绿台合集"
       },
       {
        "value": "green/overseas",
        "label": "海外短剧",
        "meaning": "海外绿台合集"
       },
       {
        "value": "manual|sample",
        "label": "手动片源 · 类型未确定",
        "meaning": "手动示例或历史 sample；同步时显式选系统"
       }
      ],
      "implementation": "library-ui.js:renderDrama；dramas.js:findDrama"
     },
     {
      "name": "工作区汇总",
      "kind": "text",
      "definition": "制作任务数、待检查条数、当前版已确认数、当前版已同步数",
      "source": "当前账户可见的剧目、制作批次、成片版本/确认记录和同步回执聚合；原型为V7本机记录。",
      "behavior": "与剧目列表共享聚合口径；不会因切页签增加任务或费用",
      "implementation": "library-ui.js:renderDrama；dramas.js:listDramas"
     },
     {
      "name": "剧目详情页签",
      "kind": "field",
      "definition": "两页签附各自计数",
      "source": "当前账户可见的剧目、制作批次、成片版本/确认记录和同步回执聚合；原型为V7本机记录。",
      "default": "tasks",
      "values": [
       {
        "value": "tasks",
        "label": "制作任务 · N",
        "meaning": "此剧全部批次"
       },
       {
        "value": "outputs",
        "label": "成片与交付 · N",
        "meaning": "此剧生成条数"
       }
      ],
      "implementation": "library-ui.js:renderDrama；app.js:openDrama/drama-tab"
     },
     {
      "name": "返回剧目列表",
      "kind": "action",
      "definition": "返回剧目管理列表",
      "source": "当前账户可见的剧目、制作批次、成片版本/确认记录和同步回执聚合；原型为V7本机记录。",
      "behavior": "保持当前库数据",
      "implementation": "library-ui.js:renderDrama；app.js:nav"
     },
     {
      "name": "继续制作",
      "kind": "action",
      "definition": "复制当前剧保存配置到制作页",
      "source": "当前账户可见的剧目、制作批次、成片版本/确认记录和同步回执聚合；原型为V7本机记录。",
      "behavior": "不复制结果，不直接生成；单剧成片筛选重置all",
      "implementation": "app.js:make-drama/openDrama"
     }
    ],
    "checks": [
     "正常：进入剧目默认制作任务，标题、来源和汇总只属于当前剧。",
     "边界：国内海外同ID不串批次；无批次剧统计全零并可继续制作。"
    ]
   },
   {
    "number": 2,
    "title": "制作批次与状态",
    "bullets": [
     "各批展示配置、速度、进度和费用；生成完成不等于人工确认。"
    ],
    "anchor": {
     "selector": ".library-task-table, .empty",
     "index": 0,
     "placement": "left"
    },
    "items": [
     {
      "name": "剧目 / 制作时间列",
      "kind": "text",
      "definition": "剧名；批次ID在title；月日时分；来源",
      "source": "当前账户可见的剧目、制作批次、成片版本/确认记录和同步回执聚合；原型为V7本机记录。",
      "behavior": "数据来自不可变批次快照，不随当前制作配置覆盖",
      "implementation": "library-ui.js:renderTaskTable"
     },
     {
      "name": "制作方式列",
      "kind": "text",
      "definition": "方式/解说结构、起止集数、实际成片速度与独立解说语速",
      "source": "当前账户可见的剧目、制作批次、成片版本/确认记录和同步回执聚合；原型为V7本机记录。",
      "values": [
       {
        "value": "highlight",
        "label": "高光混剪",
        "meaning": "高光保留原声"
       },
       {
        "value": "narrated/mixed",
        "label": "AI 解说 · 解说＋原片",
        "meaning": "混合"
       },
       {
        "value": "narrated/full",
        "label": "AI 解说 · 全解说",
        "meaning": "全篇解说"
       },
       {
        "value": "original",
        "label": "原片混剪（历史任务）",
        "meaning": "历史快照"
       },
       {
        "value": "narrated/legacy",
        "label": "AI 解说＋原片（历史任务）",
        "meaning": "缺结构旧解说快照"
       }
      ],
      "implementation": "library-ui.js:renderTaskTable；engine.js:modeLabel/speedSummary"
     },
     {
      "name": "生成 / 已确认列",
      "kind": "text",
      "definition": "ready/issue数 / 当前版ready已确认数；附待检查N条或当前无待检查成片",
      "source": "当前账户可见的剧目、制作批次、成片版本/确认记录和同步回执聚合；原型为V7本机记录。",
      "behavior": "生成完成不等于人工确认；此页已确认口径未显式排除草稿/返工，正式需与交付口径统一",
      "implementation": "library-ui.js:renderTaskTable；engine.js:outputCost"
     },
     {
      "name": "积分消耗列",
      "kind": "text",
      "definition": "实际扣除=max(0,分析+已结算制作-已扣退回)；非零冻结/退回；费用明细入口",
      "source": "主平台账户余额/费率及本任务分析、制作、返工、冻结/结算/释放/退款记录；原型读取V7本机演示流水。",
      "behavior": "原型示例积分；未连接真实平台钱包",
      "implementation": "library-ui.js:renderTaskTable"
     },
     {
      "name": "状态列",
      "kind": "status",
      "definition": "批次处理状态，不是成片检查状态列",
      "source": "当前账户可见的剧目、制作批次、成片版本/确认记录和同步回执聚合；原型为V7本机记录。",
      "values": [
       {
        "value": "reworkPending",
        "label": "单条重做中",
        "meaning": "优先级最高；有单条正在返工"
       },
       {
        "value": "quality.checking|quality.repairing",
        "label": "自动质检中",
        "meaning": "有条目自动检查或自动修复"
       },
       {
        "value": "running",
        "label": "制作中",
        "meaning": "任务或成片仍处理中"
       },
       {
        "value": "failed",
        "label": "部分未完成",
        "meaning": "无处理中条目且有失败项"
       },
       {
        "value": "complete",
        "label": "已完成",
        "meaning": "以上条件都不满足；不表示人工验收完成"
       }
      ],
      "copy": "N 条需补生成",
      "implementation": "library-ui.js:renderTaskTable"
     },
     {
      "name": "任务空态",
      "kind": "text",
      "definition": "无此剧制作批次",
      "source": "当前账户可见的剧目、制作批次、成片版本/确认记录和同步回执聚合；原型为V7本机记录。",
      "copy": [
       "暂无符合条件的制作任务",
       "选择制作方式与集数，即可开始新的一批。"
      ],
      "implementation": "library-ui.js:renderTaskTable"
     }
    ],
    "checks": [
     "正常：相同剧多批分别显示原配置、制作时间、进度和费用；已生成而未确认仍显示待检查。",
     "边界：返工优先于自动质检/制作中，失败批标部分未完成与失败数；无批次显示制作素材入口。"
    ]
   },
   {
    "number": 3,
    "title": "查看成片与再次制作",
    "bullets": [
     "查看成片展开该批；再做一批重新校验/报价，旧快照保留（R-11）。"
    ],
    "anchor": {
     "selector": "[data-action=\"open-task\"], .empty [data-action=\"create\"]",
     "index": 0,
     "placement": "left"
    },
    "items": [
     {
      "name": "查看成片",
      "kind": "action",
      "definition": "打开全局成片管理并展开这批",
      "source": "当前账户可见的剧目、制作批次、成片版本/确认记录和同步回执聚合；原型为V7本机记录。",
      "behavior": "currentBatch=该批；taskExpanded=true；清空任务筛选，导航时清空选择",
      "implementation": "app.js:open-task"
     },
     {
      "name": "再做一批",
      "kind": "action",
      "definition": "只复制历史批次配置进入制作页",
      "source": "当前账户可见的剧目、制作批次、成片版本/确认记录和同步回执聚合；原型为V7本机记录。",
      "behavior": "再次提交重新校验有效来源、时长、容量、分析/规则版本及余额；历史分析/规则/费用/成片快照保留",
      "implementation": "app.js:repeat-batch"
     },
     {
      "name": "费用明细",
      "kind": "action",
      "definition": "打开对应批费用只读弹窗",
      "source": "主平台账户余额/费率及本任务分析、制作、返工、冻结/结算/释放/退款记录；原型读取V7本机演示流水。",
      "behavior": "无确认量时不显示数值平均消费",
      "implementation": "app.js:batch-cost；workflow-ui.js:costBreakdown"
     },
     {
      "name": "制作素材（空态）",
      "kind": "action",
      "definition": "进入制作页",
      "source": "当前账户可见的剧目、制作批次、成片版本/确认记录和同步回执聚合；原型为V7本机记录。",
      "behavior": "不自动创建空任务",
      "implementation": "library-ui.js:renderTaskTable；app.js:nav"
     }
    ],
    "checks": [
     "正常：查看成片准确展开被点击批次；再做一批带入该批配置。",
     "边界：旧原片/旧标准已失效时再次提交应重新校验，不依旧任务跳过报价或覆盖历史。"
    ]
   }
  ]
 },
 "drama-outputs": {
  "title": "剧目详情 · 成片与交付",
  "page": "剧目管理",
  "background": "",
  "need": "按当前内容版本展示确认与同步，避免将旧版本成功回执当作新版本已经交付。",
  "sections": [
   {
    "number": 1,
    "title": "当前剧与汇总",
    "bullets": [
     "聚合当前剧各批成片及交付数量。"
    ],
    "anchor": {
     "selector": ".library-overview",
     "index": 0,
     "placement": "left"
    },
    "items": [
     {
      "name": "当前剧与来源",
      "kind": "text",
      "definition": "剧名、来源、可用/总集数；当前剧全部批次的成片汇总",
      "source": "已登记片源的国内/海外/手动类型；同源合集或独立手动资产形成剧目身份。",
      "behavior": "当前版已同步数只认当前版本成功回执",
      "implementation": "library-ui.js:renderDrama；dramas.js:listDramas"
     },
     {
      "name": "工作区汇总",
      "kind": "text",
      "definition": "制作任务、待检查、已确认、已同步；与制作任务页相同",
      "source": "当前账户可见的剧目、制作批次、成片版本/确认记录和同步回执聚合；原型为V7本机记录。",
      "implementation": "library-ui.js:renderDrama"
     },
     {
      "name": "继续制作 / 返回剧目列表",
      "kind": "action",
      "definition": "公共页头操作",
      "source": "当前账户可见的剧目、制作批次、成片版本/确认记录和同步回执聚合；原型为V7本机记录。",
      "behavior": "继续制作带入当前剧配置；返回列表不改历史",
      "implementation": "library-ui.js:renderDrama；app.js:openDrama/nav"
     }
    ],
    "checks": [
     "正常：此剧多批成片均汇入列表、数量汇总；跨市场同ID不纳入。",
     "边界：升版后汇总撤销新版本确认与同步，旧交付记录继续可查。"
    ]
   },
   {
    "number": 2,
    "title": "成片状态筛选",
    "bullets": [
     "全部/待检查/已确认/当前版已同步；空结果可回任务。"
    ],
    "anchor": {
     "selector": "#dramaOutputFilter",
     "index": 0,
     "placement": "left"
    },
    "items": [
     {
      "name": "成片状态",
      "kind": "field",
      "definition": "按此剧全部批次条目筛选",
      "source": "当前账户可见的剧目、制作批次、成片版本/确认记录和同步回执聚合；原型为V7本机记录。",
      "default": "all（进入剧目重置）",
      "values": [
       {
        "value": "all",
        "label": "全部成片",
        "meaning": "所有条目，含pending/failed，不仅ready"
       },
       {
        "value": "review",
        "label": "待检查",
        "meaning": "ready/issue、当前版未确认、未修复/返工"
       },
       {
        "value": "confirmed",
        "label": "已确认可用",
        "meaning": "ready且currentConfirmed；该函数未排除文案草稿"
       },
       {
        "value": "synced",
        "label": "当前版本已同步",
        "meaning": "getOutputSync当前版status=success"
       }
      ],
      "implementation": "library-ui.js:renderDramaOutputs；app.js:dramaOutputFilter"
     },
     {
      "name": "结果空态",
      "kind": "text",
      "definition": "无符合所选状态的条目",
      "source": "当前账户可见的剧目、制作批次、成片版本/确认记录和同步回执聚合；原型为V7本机记录。",
      "copy": [
       "暂无符合条件的成片",
       "制作完成后，可在这里集中检查并同步成片。"
      ],
      "implementation": "library-ui.js:renderDramaOutputs"
     },
     {
      "name": "查看制作任务",
      "kind": "action",
      "definition": "空态回当前剧任务页签",
      "source": "当前账户可见的剧目、制作批次、成片版本/确认记录和同步回执聚合；原型为V7本机记录。",
      "behavior": "保留剧目身份；不创建任务",
      "implementation": "library-ui.js:renderDramaOutputs；app.js:drama-tab"
     }
    ],
    "checks": [
     "正常：待检查/已确认/当前版已同步分别按当前版本口径命中。",
     "边界：旧版成功的新版本不命中synced；全部成片含未完成/失败项；空态能回任务页。"
    ]
   },
   {
    "number": 3,
    "title": "内容版本与交付列表",
    "bullets": [
     "与全局共用成片行；旧版成功不算新版已同步（R-09）。"
    ],
    "anchor": {
     "selector": "[role=\"tabpanel\"] .output-table, [role=\"tabpanel\"] .empty",
     "index": 0,
     "placement": "left"
    },
    "items": [
     {
      "name": "该剧全部成片",
      "kind": "text",
      "definition": "跨此剧批次聚合；同全局复用outputTable，保持批次顺序与批内顺序",
      "source": "当前账户可见的剧目、制作批次、成片版本/确认记录和同步回执聚合；原型为V7本机记录。",
      "behavior": "此页没有复选框、全选或批量确认/同步工具栏",
      "implementation": "library-ui.js:renderDramaOutputs；workflow-ui.js:outputTable"
     },
     {
      "name": "素材列",
      "kind": "text",
      "definition": "封面、标题、方式/结构、制作时间；详细信息内任务ID/素材ID/V/取材集数；异常短提示",
      "source": "当前账户可见的剧目、制作批次、成片版本/确认记录和同步回执聚合；原型为V7本机记录。",
      "copy": "详细信息",
      "implementation": "workflow-ui.js:outputTable"
     },
     {
      "name": "时长列",
      "kind": "text",
      "definition": "duration显示m:ss；原型示例时长",
      "source": "当前账户可见的剧目、制作批次、成片版本/确认记录和同步回执聚合；原型为V7本机记录。",
      "implementation": "workflow-ui.js:outputTable"
     },
     {
      "name": "素材同步列",
      "kind": "status",
      "definition": "当前版同步状态、目标与V；只旧版成功时附旧版本已同步",
      "source": "当前账户可见的剧目、制作批次、成片版本/确认记录和同步回执聚合；原型为V7本机记录。",
      "values": [
       {
        "value": "pending",
        "label": "等待同步",
        "meaning": "排队且锁定当前版本"
       },
       {
        "value": "processing",
        "label": "同步中",
        "meaning": "传输处理中且锁定当前版本"
       },
       {
        "value": "success",
        "label": "已同步",
        "meaning": "保留素材回执；禁止同版本重复上传"
       },
       {
        "value": "failed",
        "label": "同步失败",
        "meaning": "明确失败；当前版本仍确认可用时允许失败重试"
       },
       {
        "value": "unknown",
        "label": "待核实结果",
        "meaning": "结果不明；必须先查询，锁定当前版本"
       },
       {
        "value": "none-confirmed",
        "label": "待同步",
        "meaning": "无当前版回执且当前版本已确认"
       },
       {
        "value": "none-unconfirmed",
        "label": "待确认",
        "meaning": "无当前版回执且当前版本未确认"
       }
      ],
      "implementation": "sync-ui.js:badgeFor；sync-model.js:getOutputSync"
     },
     {
      "name": "可见列边界",
      "kind": "text",
      "definition": "表头固定素材、时长、素材同步、操作；检查状态列已删除，自动检查仍在内部与预览页执行",
      "source": "当前账户可见的剧目、制作批次、成片版本/确认记录和同步回执聚合；原型为V7本机记录。",
      "behavior": "不得重新加独立检查按钮或检查状态列",
      "implementation": "workflow-ui.js:outputTable"
     }
    ],
    "checks": [
     "正常：全局与单剧同条目显示相同内容版本、时长和同步状态。",
     "边界：历史同步成功保留可查；修复升版后的新条不沿用旧成功标签；此页无批量选择。"
    ]
   },
   {
    "number": 4,
    "title": "成片行操作",
    "bullets": [
     "封面/名称预览、返工/失败处理及同步条件与全局一致。"
    ],
    "anchor": {
     "selector": "[role=\"tabpanel\"] .output-table .result-actions, [role=\"tabpanel\"] .empty",
     "index": 0,
     "placement": "left"
    },
    "items": [
     {
      "name": "封面/名称预览",
      "kind": "action",
      "definition": "从当前剧任意批次打开成片预览",
      "source": "当前账户可见的剧目、制作批次、成片版本/确认记录和同步回执聚合；原型为V7本机记录。",
      "behavior": "使用行data-batch/data-id，正确切换到该批；ready/issue且未修复/返工可预览",
      "implementation": "workflow-ui.js:outputTable；app.js:startReview"
     },
     {
      "name": "单条返工 / 补生成",
      "kind": "action",
      "definition": "同全局共享行操作",
      "source": "当前账户可见的剧目、制作批次、成片版本/确认记录和同步回执聚合；原型为V7本机记录。",
      "behavior": "失败仅补该条；非失败只允许可预览未同步锁定条返工；成功返工升版重新确认",
      "implementation": "workflow-ui.js:outputTable；app.js:openRework/retry-output"
     },
     {
      "name": "同步素材 / 重试同步 / 查看同步 / 同步记录",
      "kind": "action",
      "definition": "同全局按当前版本状态切换",
      "source": "当前账户可见的剧目、制作批次、成片版本/确认记录和同步回执聚合；原型为V7本机记录。",
      "behavior": "无记录且确认可用→填表；失败→原记录详情；处理中/未知→查看；成功→记录",
      "validation": "未确认、草稿、修复、返工不能提交；同版本不能重复上传",
      "implementation": "sync-ui.js:rowAction/open"
     },
     {
      "name": "无可操作状态",
      "kind": "text",
      "definition": "行可读但处理期间编辑与确认禁用；预览入口对未完成/失败禁用",
      "source": "当前账户可见的剧目、制作批次、成片版本/确认记录和同步回执聚合；原型为V7本机记录。",
      "copy": "请先确认当前成片可用",
      "implementation": "workflow-ui.js:outputTable；sync-ui.js:locked/canSync"
     }
    ],
    "checks": [
     "正常：点击第2批成片不会误操作当前第1批；同步记录限定被点击素材所属批。",
     "边界：待核实必须查询而不能重传；失败补生成不影响同剧其他批。"
    ]
   }
  ]
 },
 "review-junction": {
  "title": "成片预览 · 接点检查",
  "page": "成片检查与局部修复",
  "background": "",
  "need": "预览当前版本，处理问题后人工确认，再交付。",
  "sections": [
   {
    "number": 1,
    "title": "当前成片与人工确认",
    "bullets": [
     "显示结构、最终时长、实际速度及内容版本；确认需人工勾选且满足 R-06。"
    ],
    "anchor": {
     "selector": ".page-head",
     "index": 0,
     "placement": "left"
    },
    "items": [
     {
      "name": "成片名称",
      "kind": "text",
      "definition": "当前成片的只读标题",
      "source": "当前批次成片的内容版本、片段/文案、制作配置与确认/修改/同步记录；原型保存在V7本机状态。",
      "implementation": "app.js:reviewView；o.title"
     },
     {
      "name": "制作结构、最终时长、实际速度、内容版本",
      "kind": "text",
      "definition": "当前任务配置及成片版本的只读摘要",
      "source": "当前批次成片的内容版本、片段/文案、制作配置与确认/修改/同步记录；原型保存在V7本机状态。",
      "behavior": [
       "结构区分高光、解说＋原片、全解说及历史原片任务",
       "时长按分钟:秒向下取整显示；内容显示 Vn",
       "实际成片速度取 outputSpeed，混合独立语速开启时附解说速度",
       "全解说额外显示原片人声关闭"
      ],
      "implementation": "app.js:reviewView；engine.js:modeLabel/speedSummary；b.config、o.duration、o.contentVersion"
     },
     {
      "name": "返回成片管理",
      "kind": "action",
      "source": "当前批次成片的内容版本、片段/文案、制作配置与确认/修改/同步记录；原型保存在V7本机状态。",
      "behavior": "关闭弹窗、展开原任务，清空任务筛选，回成片管理；停止播放并将进度归零",
      "implementation": "app.js:back-tasks"
     },
     {
      "name": "单条返工",
      "kind": "action",
      "definition": "只对本条当前版本发起质量补救或创作重做",
      "source": "当前批次成片的内容版本、片段/文案、制作配置与确认/修改/同步记录；原型保存在V7本机状态。",
      "behavior": "无同步锁、修复、返工时可点击；有草稿先保存或放弃；打开 rework 弹窗",
      "validation": [
       "待制作/失败/修复/返工不满足 reviewable",
       "同步 pending/processing/unknown 禁操作"
      ],
      "copy": [
       "当前素材正在处理或同步，请稍后操作",
       "请先保存或放弃文案修改"
      ],
      "implementation": "app.js:reviewView/openRework"
     }
    ],
    "checks": [
     "打开可检查成片：标题、结构、时长、速度和 Vn 与本条/原任务快照一致。",
     "进入返工中的成片：展示原版本及返工状态，单条返工禁用；返回管理不创建任务或扣费。"
    ]
   },
   {
    "number": 2,
    "title": "连续检查",
    "bullets": [
     "固定同批队列，从点击条开始；切换保留草稿，稍后处理不确认，后续完成项不插队。",
     "确认后可到下一条或打开同步；取消上传保留确认，队尾显示待处理数。"
    ],
    "anchor": {
     "selector": ".review-queue",
     "index": 0,
     "placement": "left"
    },
    "items": [
     {
      "name": "检查序号与固定队列",
      "kind": "status",
      "definition": "同任务一次连续检查的快照队列",
      "source": "当前批次成片的内容版本、片段/文案、制作配置与确认/修改/同步记录；原型保存在V7本机状态。",
      "default": "从点击成片开始；队列取当时 reviewable 成片，后半段后接前半段",
      "behavior": [
       "显示检查 i / N；后续生成完成项不插入当前队列",
       "切换条目回 junction 页签，播放进度归零；各条 narrationDraft 继续保留",
       "跳过已不再 reviewable 或已不存在的队列条目"
      ],
      "implementation": "app.js:startReview/reviewQueueBar/moveReview；reviewQueue.ids/index"
     },
     {
      "name": "上一条",
      "kind": "action",
      "source": "当前批次成片的内容版本、片段/文案、制作配置与确认/修改/同步记录；原型保存在V7本机状态。",
      "behavior": "第1条禁用；其余向前查找可检查成片，不确认当前条",
      "implementation": "app.js:review-prev/moveReview"
     },
     {
      "name": "稍后处理，下一条／完成本轮",
      "kind": "action",
      "source": "当前批次成片的内容版本、片段/文案、制作配置与确认/修改/同步记录；原型保存在V7本机状态。",
      "behavior": "写当前条 deferredAt 时间并前进；末条显示完成本轮，打开本轮结果；不改 confirmed",
      "implementation": "app.js:review-defer/moveReview"
     },
     {
      "name": "确认并同步",
      "kind": "action",
      "source": "当前批次成片的内容版本、片段/文案、制作配置与确认/修改/同步记录；原型保存在V7本机状态。",
      "behavior": "未确认且 ready、无草稿、reviewable、无同步锁时显示可用；人工确认后打开上传信息",
      "implementation": "app.js:reviewQueueBar/confirm-sync/confirmModal"
     },
     {
      "name": "确认并下一条／确认并完成",
      "kind": "action",
      "source": "当前批次成片的内容版本、片段/文案、制作配置与确认/修改/同步记录；原型保存在V7本机状态。",
      "behavior": "未确认且可确认时打开人工确认；成功后下一条或本轮结果；已确认时文案变为已确认，下一条／查看检查结果并直接前进",
      "implementation": "app.js:reviewQueueBar/confirm-next"
     },
     {
      "name": "取消确认",
      "kind": "action",
      "source": "当前批次成片的内容版本、片段/文案、制作配置与确认/修改/同步记录；原型保存在V7本机状态。",
      "behavior": "当前版本已确认时显示；无锁才可操作；清 confirmed 和 confirmedVersion，保留旧同步记录",
      "implementation": "app.js:confirm-output"
     },
     {
      "name": "草稿与处理锁提示",
      "kind": "status",
      "source": "当前批次成片的内容版本、片段/文案、制作配置与确认/修改/同步记录；原型保存在V7本机状态。",
      "behavior": "草稿、质量问题、修复/返工或当前版同步 pending/processing/unknown 禁确认；定位和继续浏览仍可用",
      "copy": [
       "请先保存或放弃文案修改",
       "当前版本同步中或待核实，请先查询同步结果"
      ],
      "implementation": "app.js:click guard；reviewQueueBar"
     }
    ],
    "checks": [
     "同批 A/B/C 点击 B：固定顺序 B、C、A；后完成 D 不插队，上一条在首条禁用。",
     "B 有草稿时稍后处理：B 不被确认、草稿保留；到 C 从0开始，回 B仍保留草稿。",
     "确认后选择同步再取消上传：保留当前版确认；质量问题或处理锁下确认按钮禁用。"
    ]
   },
   {
    "number": 3,
    "title": "自动检查结果",
    "bullets": [
     "生成后先检查/补救，不确定项交人工；自动通过不等于可用，不合格不结算成功（R-02/R-10）。"
    ],
    "anchor": {
     "selector": ".qc-status",
     "index": 0,
     "placement": "left"
    },
    "items": [
     {
      "name": "自动检查摘要",
      "kind": "status",
      "definition": "流程演示的检查状态，不能替代人工验收",
      "source": "制作质量检查结果与人工质量问题；原型从演示场景构造，未检测真实视频。",
      "values": [
       {
        "value": "attention",
        "label": "有待人工核对的位置／需核对",
        "meaning": "质量问题待处理"
       },
       {
        "value": "passed",
        "label": "自动检查完成／待人工确认",
        "meaning": "自动流程通过，尚须人工确认"
       },
       {
        "value": "confirmed",
        "label": "已人工确认",
        "meaning": "confirmedVersion 等于 contentVersion"
       },
       {
        "value": "reworkPending",
        "label": "正在重新制作这一条",
        "meaning": "原版本持续展示，新版完成后重新检查"
       }
      ],
      "behavior": [
       "无 quality 时不显示摘要",
       "repaired 为真显示已完成问题修复；repairType=music 额外显示已降低伴奏音量",
       "系统未检测真实视频；剧情和图文对应仍需人工检查"
      ],
      "copy": "当前为流程演示，未检测真实视频；剧情连贯与图文对应仍需人工检查。",
      "implementation": "workflow-ui.js:qualitySummary；app.js:scheduleGenerated"
     },
     {
      "name": "检查记录",
      "kind": "action",
      "definition": "折叠只读基础检查及问题位置",
      "source": "制作质量检查结果与人工质量问题；原型从演示场景构造，未检测真实视频。",
      "default": "折叠",
      "behavior": "展开显示画面连续性、声音与句子边界、字幕包装及所有质量问题；点击定位设置 playerAt=item.at 并停止播放",
      "implementation": "workflow-ui.js:qualitySummary"
     }
    ],
    "checks": [
     "quality=attention：显示需核对及问题定位；自动通过但未人工确认显示待人工确认。",
     "返工期间优先显示正在重新制作这一条且仍展示原版；无 quality 的旧数据不显示空摘要。"
    ]
   },
   {
    "number": 4,
    "title": "播放、定位与导出",
    "bullets": [
     "播放/拖动/点击片段定位；换成片从0开始，同片换页签保留进度。",
     "“这里有问题”带入起始时间；真实MP4为主交付，JSON/SRT辅助（R-01）。"
    ],
    "anchor": {
     "selector": ".player",
     "index": 0,
     "placement": "left"
    },
    "items": [
     {
      "name": "故事板与来源提示",
      "kind": "text",
      "definition": "虚构画面和文本时间轴示意",
      "source": "当前成片文件、片段时间线与来源时间码；原型以故事板/虚构剧照展示，无真实视频音轨。",
      "behavior": [
       "固定示例封面，标注故事板 · 无真实音轨",
       "按当前时间取 start≤t<end 的片段；总时长端点回退末片段",
       "显示片段 text、来源集数、原片 sourceStart 及 label"
      ],
      "copy": "正式主交付为真实 MP4；本 Demo 只有故事板和辅助 JSON/SRT（R-01）",
      "implementation": "app.js:reviewView/locate"
     },
     {
      "name": "播放／暂停",
      "kind": "action",
      "source": "当前成片文件、片段时间线与来源时间码；原型以故事板/虚构剧照展示，无真实视频音轨。",
      "default": "暂停，按钮 ▶",
      "behavior": "每秒进度加1直至总时长并停止；再次播放总时长端点从0开始；按钮切换 ▶/Ⅱ",
      "implementation": "app.js:play/stopPlayer"
     },
     {
      "name": "故事板进度",
      "kind": "field",
      "source": "当前成片文件、片段时间线与来源时间码；原型以故事板/虚构剧照展示，无真实视频音轨。",
      "default": "新条0；同条换页签保留 playerAt",
      "definition": "范围控件，min=0，max=o.duration，默认步长1秒",
      "behavior": "拖动停止播放并定位；显示分:秒 / 总时长；刷新渲染将超出时长的旧进度截到总时长",
      "implementation": "app.js:reviewView/input scrubber"
     },
     {
      "name": "这里有问题",
      "kind": "action",
      "source": "当前批次成片的内容版本、片段/文案、制作配置与确认/修改/同步记录；原型保存在V7本机状态。",
      "behavior": "停止播放并打开反馈弹窗；将当前 playerAt 带入起始；同步/修复/返工锁时禁用；有草稿时提示先处理",
      "implementation": "app.js:report-issue"
     },
     {
      "name": "包装状态",
      "kind": "text",
      "source": "当前批次成片的内容版本、片段/文案、制作配置与确认/修改/同步记录；原型保存在V7本机状态。",
      "values": [
       {
        "value": "bgm=true/false",
        "label": "BGM 开启／未加配乐",
        "meaning": "沿用本任务配乐开关"
       },
       {
        "value": "full=true/false",
        "label": "原片人声关闭／原片原声保留",
        "meaning": "全解说关闭原片人声，其他结构保留"
       },
       {
        "value": "subtitles=true/false",
        "label": "字幕开启／未加解说字幕或保留原字幕",
        "meaning": "关闭新增字幕时按结构显示"
       },
       {
        "value": "title=true/false",
        "label": "小标题开启／无小标题",
        "meaning": "沿用本任务小标题开关"
       }
      ],
      "definition": "当前包装状态的展示值及含义如下；从对应数据源读取，不是可直接编辑的配置。",
      "implementation": "app.js:reviewView；b.config"
     },
     {
      "name": "辅助文件",
      "kind": "action",
      "definition": "展开导出剪辑方案和示例字幕",
      "source": "当前批次成片的内容版本、片段/文案、制作配置与确认/修改/同步记录；原型保存在V7本机状态。",
      "default": "折叠",
      "behavior": [
       "剪辑方案下载 mixed-cut-v7-任务ID.json，含 demo、notice、片源、配置、规则、分析快照及输出",
       "示例字幕下载 成片ID-Vn-示例.srt，时间和文案来自已保存 segments",
       "有未应用草稿禁导出；不扣费或创建任务"
      ],
      "validation": "空导出列表提示请先选择素材；JSON 有草稿提示先保存或放弃再导出",
      "copy": [
       "故事板方案，非真实视频",
       "字幕时间按故事板示意，不能作为实际口播对齐结果"
      ],
      "implementation": "app.js:exportPlans/export-srt"
     }
    ],
    "checks": [
     "播放到结尾停止，再点播放从0开始；拖动至总时长显示末片段且暂停。",
     "同条换页签保留进度；换条或返回管理归零；反馈起始等于打开时进度。",
     "无草稿下载 JSON/SRT：文件含当前已保存版本及示意标记；有草稿时不下载且提示处理草稿。"
    ]
   },
   {
    "number": 5,
    "title": "选取依据与内容差异",
    "bullets": [
     "默认折叠原片依据及相似项，点击定位；对比仅限同来源/资产/版本/语言（R-04）。"
    ],
    "anchor": {
     "selector": ".content-evidence",
     "index": 0,
     "placement": "left"
    },
    "items": [
     {
      "name": "选取依据与内容差异",
      "kind": "action",
      "definition": "查看只读选材证据和已有成片差异",
      "source": "所选原片的剧情事实/事件和候选来源，以及同源历史成片；原型从虚构事实和规则计算。",
      "default": "折叠",
      "behavior": "展开依据及差异；展开不新增步骤、任务或积分",
      "implementation": "content-ui.js:contentEvidence；content-model.js:evidenceFor"
     },
     {
      "name": "内容标签与依据",
      "kind": "text",
      "source": "所选原片的剧情事实/事件和候选来源，以及同源历史成片；原型从虚构事实和规则计算。",
      "definition": "从片段 fact/evidence 关键词提取并去重，最多3个标签",
      "values": [
       {
        "value": "冲突",
        "label": "冲突",
        "meaning": "质疑、阻止、指控、拒绝、不利、对抗"
       },
       {
        "value": "信息揭露",
        "label": "信息揭露",
        "meaning": "证明、暴露、被替换、发现、找回、记录、证据、秘密"
       },
       {
        "value": "反转",
        "label": "反转",
        "meaning": "恢复、更正、反击、认可、让位、撤回"
       },
       {
        "value": "关系变化",
        "label": "关系变化",
        "meaning": "邀请、支持、合作条件、道歉、工作室、独立"
       },
       {
        "value": "人物情绪",
        "label": "人物情绪",
        "meaning": "不愿、离开、道歉、误会"
       },
       {
        "value": "剧情推进",
        "label": "剧情推进",
        "meaning": "无上述命中时的回退标签"
       }
      ],
      "behavior": [
       "高光显示开场/结尾依据；混合增加解说承接；全解说显示叙述起点、可用时的故事推进和叙述终点",
       "依据取 evidence→fact→text；显示来源集数及区间",
       "定位成片按钮停止播放并定位到该片段 start"
      ],
      "implementation": "content-model.js:contentTags/evidenceFor"
     },
     {
      "name": "相似成片提示",
      "kind": "text",
      "source": "所选原片的剧情事实/事件和候选来源，以及同源历史成片；原型从虚构事实和规则计算。",
      "definition": "同片源 kind、market、资产/合集ID、fileVersion、language 的已有 ready/issue 成片，排除本条",
      "behavior": [
       "只要有相似理由即列入提示，按本批优先再按相似优先级排序，最多3条",
       "理由包括同剧情事件、相同开场、相同结尾、全篇解说相同或原片区间重合≥50%",
       "同事件显示开场/结尾是否相同；允许不同剪法供比较",
       "无提示显示当前没有达到提示条件的相似素材，不代表没有重复风险"
      ],
      "validation": "重复规则：exact，或全篇解说归一化后相同，或同事件＋同开场＋同结尾＋原片重合>60%；提示不自动拒绝成片",
      "implementation": "content-model.js:relatedContent/compareContent；engine.js:assetKey/overlap"
     },
     {
      "name": "对比",
      "kind": "action",
      "source": "当前批次成片的内容版本、片段/文案、制作配置与确认/修改/同步记录；原型保存在V7本机状态。",
      "behavior": "打开当前与选中已有成片的双列对比；停止播放、保留当前成片/进度，无内容改写或扣费",
      "implementation": "app.js:compare-content；content-ui.js:compareContentDialog"
     },
     {
      "name": "依据边界",
      "kind": "text",
      "source": "所选原片的剧情事实/事件和候选来源，以及同源历史成片；原型从虚构事实和规则计算。",
      "copy": "依据与区间来自虚构故事板，不是投放效果预测。",
      "implementation": "content-ui.js:contentEvidence"
     }
    ],
    "checks": [
     "同资产版本与语言、开场相同的 ready 成片出现对比提示；其他资产版本或语言及失败/制作中条目不出现。",
     "相似理由超过3条时本批优先且只显示3条；没有提示显示风险边界文案，不宣称无重复。",
     "点击证据定位更新当前故事板；打开对比不生成任务、不变内容版本、不扣积分。"
    ]
   },
   {
    "number": 6,
    "title": "接点列表与连续查看",
    "bullets": [
     "显示上一段结尾、接入完整句及来源时间；定位/连续看接点检查吞字和承接。"
    ],
    "anchor": {
     "selector": ".review-grid > div > .section:not(.issue-section)",
     "index": 0,
     "placement": "left"
    },
    "items": [
     {
      "name": "检查页签",
      "kind": "action",
      "source": "当前批次成片的内容版本、片段/文案、制作配置与确认/修改/同步记录；原型保存在V7本机状态。",
      "default": "junction",
      "values": [
       {
        "value": "junction",
        "label": "接点检查",
        "meaning": "相邻片段交界核对"
       },
       {
        "value": "timeline",
        "label": "完整结构",
        "meaning": "成片顺序时间线"
       },
       {
        "value": "narration",
        "label": "解说与包装／字幕与配乐",
        "meaning": "按结构显示文案编辑或只读包装"
       }
      ],
      "behavior": "切页签停止播放，保留同条 playerAt 和草稿；不升版、不扣费",
      "implementation": "app.js:review-tab；narration-ui.js:fullNarrationPanel"
     },
     {
      "name": "衔接点数量",
      "kind": "text",
      "definition": "相邻片段交界数=segments.length−1",
      "source": "当前批次成片的内容版本、片段/文案、制作配置与确认/修改/同步记录；原型保存在V7本机状态。",
      "implementation": "app.js:reviewView；junctions"
     },
     {
      "name": "接点条目",
      "kind": "text",
      "source": "当前批次成片的内容版本、片段/文案、制作配置与确认/修改/同步记录；原型保存在V7本机状态。",
      "definition": "交界 start 时间、转接类型、前段 text、后段完整句及来源集数/sourceStart",
      "values": [
       {
        "value": "left=narration",
        "label": "解说 → 原片",
        "meaning": "上一段为解说时优先显示"
       },
       {
        "value": "right=narration",
        "label": "原片 → 解说",
        "meaning": "上一段非解说且下一段是解说"
       },
       {
        "value": "else",
        "label": "原片 → 原片",
        "meaning": "两段均为原片"
       }
      ],
      "behavior": "只有左段为解说时额外提供剧情依据 details，取 evidence 或 fact；默认折叠",
      "implementation": "app.js:reviewView"
     },
     {
      "name": "定位",
      "kind": "action",
      "source": "当前批次成片的内容版本、片段/文案、制作配置与确认/修改/同步记录；原型保存在V7本机状态。",
      "behavior": "定位后段 start；更新故事板文字、来源和时间；此按钮源码没有 stopPlayer，原计时器继续运行",
      "implementation": "app.js:junction/locate"
     },
     {
      "name": "连续看接点",
      "kind": "action",
      "source": "当前批次成片的内容版本、片段/文案、制作配置与确认/修改/同步记录；原型保存在V7本机状态。",
      "behavior": "先停止普通播放，从首接点前3秒开始，每秒推进到接点后3秒再跳下一接点前3秒；首部下限0；全部结束停止",
      "validation": "无接点时按钮禁用；若仍触发则提示当前只有一个完整片段，没有衔接点",
      "implementation": "app.js:play-junctions"
     }
    ],
    "checks": [
     "3个片段显示2个接点；逐条前后句、接点时间和原片来源与 segments 相符。",
     "点击定位从后段 start 展示；连续看接点从 max(0,start−3) 开始，最后完成停止。",
     "仅1个片段时显示0接点、连续看接点禁用；左段非解说不显示其剧情依据。"
    ]
   },
   {
    "number": 7,
    "title": "检查清单、问题与修复",
    "bullets": [
     "质量问题阻止交付，创作调整可确认采用或报价重做；范围与费用见 R-07。",
     "记录不改媒体、不升版；实际修复成功升版，失败保留旧片（R-06）。"
    ],
    "anchor": {
     "selector": ".issue-section",
     "index": 0,
     "placement": "left"
    },
    "items": [
     {
      "name": "检查清单",
      "kind": "text",
      "source": "当前批次成片的内容版本、片段/文案、制作配置与确认/修改/同步记录；原型保存在V7本机状态。",
      "definition": "只读检查重点，非多选表单",
      "behavior": [
       "高光/混合：完整对白（首尾字与句子边界）、剧情可理解（前因、冲突与承接）",
       "共用音乐与字幕（不压人声、不遮对白）、画面异常（黑屏、卡帧）"
      ],
      "implementation": "app.js:reviewView"
     },
     {
      "name": "反馈问题",
      "kind": "action",
      "source": "当前批次成片的内容版本、片段/文案、制作配置与确认/修改/同步记录；原型保存在V7本机状态。",
      "behavior": "与左侧这里有问题同入口；无同步/修复/返工锁、无草稿时打开 issue",
      "implementation": "app.js:report-issue；feedback-ui.js:feedbackForm"
     },
     {
      "name": "反馈记录",
      "kind": "text",
      "source": "当前批次成片的内容版本、片段/文案、制作配置与确认/修改/同步记录；原型保存在V7本机状态。",
      "definition": "展示全部 o.issues 质量记录及仅当前 contentVersion 的 preferences 创作建议",
      "behavior": [
       "显示类型、质量/创作分类、整条或起止时间、非空补充说明",
       "局部无结束显示 起；整条显示整条素材",
       "质量记录状态 issue 阻确认；创作建议不变 ready，但撤销已有确认后可人工采用当前版"
      ],
      "implementation": "feedback-ui.js:feedbackItems；feedback-model.js:currentPreferences/issueRangeLabel"
     },
     {
      "name": "定位",
      "kind": "action",
      "source": "当前批次成片的内容版本、片段/文案、制作配置与确认/修改/同步记录；原型保存在V7本机状态。",
      "behavior": "定位 item.at 并停止播放；整条定位0；处理锁下仍可用于查看",
      "implementation": "feedback-ui.js:feedbackItems；app.js:quality-locate"
     },
     {
      "name": "局部修复／整条修复",
      "kind": "action",
      "source": "当前批次成片的内容版本、片段/文案、制作配置与确认/修改/同步记录；原型保存在V7本机状态。",
      "behavior": [
       "质量 scope=all 或自动 continuity 类型显示整条修复并打开免费返工；其他显示局部修复",
       "同步/修复/返工锁禁用；草稿先处理",
       "Demo 局部修复900ms后移除该问题、按剩余问题设 issue/ready、revise 升版及清确认，免费并记录 remedy",
       "Demo 没有真实画面/音频修复；正式实际修复成功才升媒体版本，失败保留原片（R-06/R-07）"
      ],
      "implementation": "feedback-ui.js:feedbackItems；app.js:repair/openRework"
     },
     {
      "name": "调整这一条",
      "kind": "action",
      "source": "当前批次成片的内容版本、片段/文案、制作配置与确认/修改/同步记录；原型保存在V7本机状态。",
      "behavior": "创作建议打开付费返工，预填其 direction/reason/detail；opening→opening，其他多数→angle；锁与草稿限制同返工",
      "implementation": "feedback-ui.js:feedbackItems；app.js:openRework"
     },
     {
      "name": "版本修改记录",
      "kind": "action",
      "source": "当前批次成片的内容版本、片段/文案、制作配置与确认/修改/同步记录；原型保存在V7本机状态。",
      "default": "折叠；无 revisions 不显示",
      "behavior": "展开当前及既往 Vn、description；实际反馈记录不升版，Demo保存/修复/返工成功才记修改",
      "implementation": "app.js:reviewView；o.revisions"
     }
    ],
    "checks": [
     "记录质量问题后出现类型/范围/说明，状态需处理，确认禁用；记录创作建议后显示创作调整，当前仍可人工重新确认。",
     "局部质量点击免费修复：仅删除该问题，其他问题保留，版本+1并撤销确认；Demo仅状态模拟，不能验收真实媒体修复。",
     "scope=all 或 continuity 点击整条修复走返工；锁定期间修复/调整禁用而定位仍可查看。"
    ]
   },
   {
    "number": 8,
    "title": "版本交付状态",
    "bullets": [
     "仅当前已确认版本可同步；成功版本不重复上传，旧回执保留，新版另行确认（R-09）。"
    ],
    "anchor": {
     "selector": ".sync-review-notice, .review-queue",
     "index": 0,
     "placement": "left"
    },
    "items": [
     {
      "name": "当前版本交付摘要",
      "kind": "status",
      "source": "当前批次成片的内容版本、片段/文案、制作配置与确认/修改/同步记录；原型保存在V7本机状态。",
      "definition": "当前成片版本和对应同步状态；仅有历史同步任务才显示 notice",
      "values": [
       {
        "value": "none",
        "label": "待确认／待同步",
        "meaning": "无当前版本同步记录；已确认显示待同步"
       },
       {
        "value": "pending",
        "label": "等待同步",
        "meaning": "当前版本请求已创建，锁内容和确认"
       },
       {
        "value": "processing",
        "label": "同步中",
        "meaning": "当前版本传输进行中，锁内容和确认"
       },
       {
        "value": "unknown",
        "label": "待核实结果",
        "meaning": "结果不明确，先查询，禁重复上传和内容修改"
       },
       {
        "value": "success",
        "label": "已同步",
        "meaning": "当前版本成功，禁重复上传"
       },
       {
        "value": "failed",
        "label": "同步失败",
        "meaning": "明确失败，允许按原记录重试"
       }
      ],
      "behavior": "显示目标系统及记录版本；旧成功版本不能代表新版本已同步",
      "implementation": "sync-ui.js:reviewNotice/badgeFor；sync-model.js:getOutputSync/outputVersion"
     },
     {
      "name": "同步到素材管理",
      "kind": "action",
      "source": "当前批次成片的内容版本、片段/文案、制作配置与确认/修改/同步记录；原型保存在V7本机状态。",
      "behavior": "仅 confirmed、ready、无草稿/返工/修复且当前版本无 pending/processing/unknown/success 时可用；打开上传信息，不直接上传",
      "validation": "成功版本不可重传；unknown 先查询；确认必须对应当前版本",
      "implementation": "app.js:reviewView；sync-ui.js:reviewActions/canSync/open"
     },
     {
      "name": "同步记录",
      "kind": "action",
      "source": "当前批次成片的内容版本、片段/文案、制作配置与确认/修改/同步记录；原型保存在V7本机状态。",
      "behavior": "有历史任务时可看按提交时版本保留的同步记录；不改内容或扣费",
      "implementation": "sync-ui.js:reviewActions/records"
     },
     {
      "name": "旧版保留提示",
      "kind": "text",
      "source": "当前批次成片的内容版本、片段/文案、制作配置与确认/修改/同步记录；原型保存在V7本机状态。",
      "behavior": "存在任意旧成功记录时显示已同步版本保留提示；新版变更或取消确认不能自动覆盖、撤回旧素材",
      "copy": "已同步版本保留在素材管理中。此处修改、退款或取消确认不会自动替换或撤回旧素材。（R-09）",
      "implementation": "sync-ui.js:reviewNotice"
     }
    ],
    "checks": [
     "当前V1同步成功：显示已同步且同步按钮禁用；V2产生后需重新确认，旧V1记录保留。",
     "当前版本为pending/processing/unknown：返工、编辑、反馈和确认禁用，查询/查看记录可用；明确失败可按记录重试。"
    ]
   }
  ]
 },
 "review-timeline": {
  "title": "成片预览 · 完整结构",
  "page": "成片检查与局部修复",
  "background": "",
  "need": "预览当前版本，处理问题后人工确认，再交付。",
  "sections": [
   {
    "number": 1,
    "title": "当前成片与人工确认",
    "bullets": [
     "显示结构、最终时长、实际速度及内容版本；确认需人工勾选且满足 R-06。"
    ],
    "anchor": {
     "selector": ".page-head",
     "index": 0,
     "placement": "left"
    },
    "items": [
     {
      "name": "成片名称",
      "kind": "text",
      "definition": "当前成片的只读标题",
      "source": "当前批次成片的内容版本、片段/文案、制作配置与确认/修改/同步记录；原型保存在V7本机状态。",
      "implementation": "app.js:reviewView；o.title"
     },
     {
      "name": "制作结构、最终时长、实际速度、内容版本",
      "kind": "text",
      "definition": "当前任务配置及成片版本的只读摘要",
      "source": "当前批次成片的内容版本、片段/文案、制作配置与确认/修改/同步记录；原型保存在V7本机状态。",
      "behavior": [
       "结构区分高光、解说＋原片、全解说及历史原片任务",
       "时长按分钟:秒向下取整显示；内容显示 Vn",
       "实际成片速度取 outputSpeed，混合独立语速开启时附解说速度",
       "全解说额外显示原片人声关闭"
      ],
      "implementation": "app.js:reviewView；engine.js:modeLabel/speedSummary；b.config、o.duration、o.contentVersion"
     },
     {
      "name": "返回成片管理",
      "kind": "action",
      "source": "当前批次成片的内容版本、片段/文案、制作配置与确认/修改/同步记录；原型保存在V7本机状态。",
      "behavior": "关闭弹窗、展开原任务，清空任务筛选，回成片管理；停止播放并将进度归零",
      "implementation": "app.js:back-tasks"
     },
     {
      "name": "单条返工",
      "kind": "action",
      "definition": "只对本条当前版本发起质量补救或创作重做",
      "source": "当前批次成片的内容版本、片段/文案、制作配置与确认/修改/同步记录；原型保存在V7本机状态。",
      "behavior": "无同步锁、修复、返工时可点击；有草稿先保存或放弃；打开 rework 弹窗",
      "validation": [
       "待制作/失败/修复/返工不满足 reviewable",
       "同步 pending/processing/unknown 禁操作"
      ],
      "copy": [
       "当前素材正在处理或同步，请稍后操作",
       "请先保存或放弃文案修改"
      ],
      "implementation": "app.js:reviewView/openRework"
     }
    ],
    "checks": [
     "打开可检查成片：标题、结构、时长、速度和 Vn 与本条/原任务快照一致。",
     "进入返工中的成片：展示原版本及返工状态，单条返工禁用；返回管理不创建任务或扣费。"
    ]
   },
   {
    "number": 2,
    "title": "连续检查",
    "bullets": [
     "固定同批队列，从点击条开始；切换保留草稿，稍后处理不确认，后续完成项不插队。",
     "确认后可到下一条或打开同步；取消上传保留确认，队尾显示待处理数。"
    ],
    "anchor": {
     "selector": ".review-queue",
     "index": 0,
     "placement": "left"
    },
    "items": [
     {
      "name": "检查序号与固定队列",
      "kind": "status",
      "definition": "同任务一次连续检查的快照队列",
      "source": "当前批次成片的内容版本、片段/文案、制作配置与确认/修改/同步记录；原型保存在V7本机状态。",
      "default": "从点击成片开始；队列取当时 reviewable 成片，后半段后接前半段",
      "behavior": [
       "显示检查 i / N；后续生成完成项不插入当前队列",
       "切换条目回 junction 页签，播放进度归零；各条 narrationDraft 继续保留",
       "跳过已不再 reviewable 或已不存在的队列条目"
      ],
      "implementation": "app.js:startReview/reviewQueueBar/moveReview；reviewQueue.ids/index"
     },
     {
      "name": "上一条",
      "kind": "action",
      "source": "当前批次成片的内容版本、片段/文案、制作配置与确认/修改/同步记录；原型保存在V7本机状态。",
      "behavior": "第1条禁用；其余向前查找可检查成片，不确认当前条",
      "implementation": "app.js:review-prev/moveReview"
     },
     {
      "name": "稍后处理，下一条／完成本轮",
      "kind": "action",
      "source": "当前批次成片的内容版本、片段/文案、制作配置与确认/修改/同步记录；原型保存在V7本机状态。",
      "behavior": "写当前条 deferredAt 时间并前进；末条显示完成本轮，打开本轮结果；不改 confirmed",
      "implementation": "app.js:review-defer/moveReview"
     },
     {
      "name": "确认并同步",
      "kind": "action",
      "source": "当前批次成片的内容版本、片段/文案、制作配置与确认/修改/同步记录；原型保存在V7本机状态。",
      "behavior": "未确认且 ready、无草稿、reviewable、无同步锁时显示可用；人工确认后打开上传信息",
      "implementation": "app.js:reviewQueueBar/confirm-sync/confirmModal"
     },
     {
      "name": "确认并下一条／确认并完成",
      "kind": "action",
      "source": "当前批次成片的内容版本、片段/文案、制作配置与确认/修改/同步记录；原型保存在V7本机状态。",
      "behavior": "未确认且可确认时打开人工确认；成功后下一条或本轮结果；已确认时文案变为已确认，下一条／查看检查结果并直接前进",
      "implementation": "app.js:reviewQueueBar/confirm-next"
     },
     {
      "name": "取消确认",
      "kind": "action",
      "source": "当前批次成片的内容版本、片段/文案、制作配置与确认/修改/同步记录；原型保存在V7本机状态。",
      "behavior": "当前版本已确认时显示；无锁才可操作；清 confirmed 和 confirmedVersion，保留旧同步记录",
      "implementation": "app.js:confirm-output"
     },
     {
      "name": "草稿与处理锁提示",
      "kind": "status",
      "source": "当前批次成片的内容版本、片段/文案、制作配置与确认/修改/同步记录；原型保存在V7本机状态。",
      "behavior": "草稿、质量问题、修复/返工或当前版同步 pending/processing/unknown 禁确认；定位和继续浏览仍可用",
      "copy": [
       "请先保存或放弃文案修改",
       "当前版本同步中或待核实，请先查询同步结果"
      ],
      "implementation": "app.js:click guard；reviewQueueBar"
     }
    ],
    "checks": [
     "同批 A/B/C 点击 B：固定顺序 B、C、A；后完成 D 不插队，上一条在首条禁用。",
     "B 有草稿时稍后处理：B 不被确认、草稿保留；到 C 从0开始，回 B仍保留草稿。",
     "确认后选择同步再取消上传：保留当前版确认；质量问题或处理锁下确认按钮禁用。"
    ]
   },
   {
    "number": 3,
    "title": "自动检查结果",
    "bullets": [
     "生成后先检查/补救，不确定项交人工；自动通过不等于可用，不合格不结算成功（R-02/R-10）。"
    ],
    "anchor": {
     "selector": ".qc-status",
     "index": 0,
     "placement": "left"
    },
    "items": [
     {
      "name": "自动检查摘要",
      "kind": "status",
      "definition": "流程演示的检查状态，不能替代人工验收",
      "source": "制作质量检查结果与人工质量问题；原型从演示场景构造，未检测真实视频。",
      "values": [
       {
        "value": "attention",
        "label": "有待人工核对的位置／需核对",
        "meaning": "质量问题待处理"
       },
       {
        "value": "passed",
        "label": "自动检查完成／待人工确认",
        "meaning": "自动流程通过，尚须人工确认"
       },
       {
        "value": "confirmed",
        "label": "已人工确认",
        "meaning": "confirmedVersion 等于 contentVersion"
       },
       {
        "value": "reworkPending",
        "label": "正在重新制作这一条",
        "meaning": "原版本持续展示，新版完成后重新检查"
       }
      ],
      "behavior": [
       "无 quality 时不显示摘要",
       "repaired 为真显示已完成问题修复；repairType=music 额外显示已降低伴奏音量",
       "系统未检测真实视频；剧情和图文对应仍需人工检查"
      ],
      "copy": "当前为流程演示，未检测真实视频；剧情连贯与图文对应仍需人工检查。",
      "implementation": "workflow-ui.js:qualitySummary；app.js:scheduleGenerated"
     },
     {
      "name": "检查记录",
      "kind": "action",
      "definition": "折叠只读基础检查及问题位置",
      "source": "制作质量检查结果与人工质量问题；原型从演示场景构造，未检测真实视频。",
      "default": "折叠",
      "behavior": "展开显示画面连续性、声音与句子边界、字幕包装及所有质量问题；点击定位设置 playerAt=item.at 并停止播放",
      "implementation": "workflow-ui.js:qualitySummary"
     }
    ],
    "checks": [
     "quality=attention：显示需核对及问题定位；自动通过但未人工确认显示待人工确认。",
     "返工期间优先显示正在重新制作这一条且仍展示原版；无 quality 的旧数据不显示空摘要。"
    ]
   },
   {
    "number": 4,
    "title": "播放、定位与导出",
    "bullets": [
     "播放/拖动/点击片段定位；换成片从0开始，同片换页签保留进度。",
     "“这里有问题”带入起始时间；真实MP4为主交付，JSON/SRT辅助（R-01）。"
    ],
    "anchor": {
     "selector": ".player",
     "index": 0,
     "placement": "left"
    },
    "items": [
     {
      "name": "故事板与来源提示",
      "kind": "text",
      "definition": "虚构画面和文本时间轴示意",
      "source": "当前成片文件、片段时间线与来源时间码；原型以故事板/虚构剧照展示，无真实视频音轨。",
      "behavior": [
       "固定示例封面，标注故事板 · 无真实音轨",
       "按当前时间取 start≤t<end 的片段；总时长端点回退末片段",
       "显示片段 text、来源集数、原片 sourceStart 及 label"
      ],
      "copy": "正式主交付为真实 MP4；本 Demo 只有故事板和辅助 JSON/SRT（R-01）",
      "implementation": "app.js:reviewView/locate"
     },
     {
      "name": "播放／暂停",
      "kind": "action",
      "source": "当前成片文件、片段时间线与来源时间码；原型以故事板/虚构剧照展示，无真实视频音轨。",
      "default": "暂停，按钮 ▶",
      "behavior": "每秒进度加1直至总时长并停止；再次播放总时长端点从0开始；按钮切换 ▶/Ⅱ",
      "implementation": "app.js:play/stopPlayer"
     },
     {
      "name": "故事板进度",
      "kind": "field",
      "source": "当前成片文件、片段时间线与来源时间码；原型以故事板/虚构剧照展示，无真实视频音轨。",
      "default": "新条0；同条换页签保留 playerAt",
      "definition": "范围控件，min=0，max=o.duration，默认步长1秒",
      "behavior": "拖动停止播放并定位；显示分:秒 / 总时长；刷新渲染将超出时长的旧进度截到总时长",
      "implementation": "app.js:reviewView/input scrubber"
     },
     {
      "name": "这里有问题",
      "kind": "action",
      "source": "当前批次成片的内容版本、片段/文案、制作配置与确认/修改/同步记录；原型保存在V7本机状态。",
      "behavior": "停止播放并打开反馈弹窗；将当前 playerAt 带入起始；同步/修复/返工锁时禁用；有草稿时提示先处理",
      "implementation": "app.js:report-issue"
     },
     {
      "name": "包装状态",
      "kind": "text",
      "source": "当前批次成片的内容版本、片段/文案、制作配置与确认/修改/同步记录；原型保存在V7本机状态。",
      "values": [
       {
        "value": "bgm=true/false",
        "label": "BGM 开启／未加配乐",
        "meaning": "沿用本任务配乐开关"
       },
       {
        "value": "full=true/false",
        "label": "原片人声关闭／原片原声保留",
        "meaning": "全解说关闭原片人声，其他结构保留"
       },
       {
        "value": "subtitles=true/false",
        "label": "字幕开启／未加解说字幕或保留原字幕",
        "meaning": "关闭新增字幕时按结构显示"
       },
       {
        "value": "title=true/false",
        "label": "小标题开启／无小标题",
        "meaning": "沿用本任务小标题开关"
       }
      ],
      "definition": "当前包装状态的展示值及含义如下；从对应数据源读取，不是可直接编辑的配置。",
      "implementation": "app.js:reviewView；b.config"
     },
     {
      "name": "辅助文件",
      "kind": "action",
      "definition": "展开导出剪辑方案和示例字幕",
      "source": "当前批次成片的内容版本、片段/文案、制作配置与确认/修改/同步记录；原型保存在V7本机状态。",
      "default": "折叠",
      "behavior": [
       "剪辑方案下载 mixed-cut-v7-任务ID.json，含 demo、notice、片源、配置、规则、分析快照及输出",
       "示例字幕下载 成片ID-Vn-示例.srt，时间和文案来自已保存 segments",
       "有未应用草稿禁导出；不扣费或创建任务"
      ],
      "validation": "空导出列表提示请先选择素材；JSON 有草稿提示先保存或放弃再导出",
      "copy": [
       "故事板方案，非真实视频",
       "字幕时间按故事板示意，不能作为实际口播对齐结果"
      ],
      "implementation": "app.js:exportPlans/export-srt"
     }
    ],
    "checks": [
     "播放到结尾停止，再点播放从0开始；拖动至总时长显示末片段且暂停。",
     "同条换页签保留进度；换条或返回管理归零；反馈起始等于打开时进度。",
     "无草稿下载 JSON/SRT：文件含当前已保存版本及示意标记；有草稿时不下载且提示处理草稿。"
    ]
   },
   {
    "number": 5,
    "title": "选取依据与内容差异",
    "bullets": [
     "默认折叠原片依据及相似项，点击定位；对比仅限同来源/资产/版本/语言（R-04）。"
    ],
    "anchor": {
     "selector": ".content-evidence",
     "index": 0,
     "placement": "left"
    },
    "items": [
     {
      "name": "选取依据与内容差异",
      "kind": "action",
      "definition": "查看只读选材证据和已有成片差异",
      "source": "所选原片的剧情事实/事件和候选来源，以及同源历史成片；原型从虚构事实和规则计算。",
      "default": "折叠",
      "behavior": "展开依据及差异；展开不新增步骤、任务或积分",
      "implementation": "content-ui.js:contentEvidence；content-model.js:evidenceFor"
     },
     {
      "name": "内容标签与依据",
      "kind": "text",
      "source": "所选原片的剧情事实/事件和候选来源，以及同源历史成片；原型从虚构事实和规则计算。",
      "definition": "从片段 fact/evidence 关键词提取并去重，最多3个标签",
      "values": [
       {
        "value": "冲突",
        "label": "冲突",
        "meaning": "质疑、阻止、指控、拒绝、不利、对抗"
       },
       {
        "value": "信息揭露",
        "label": "信息揭露",
        "meaning": "证明、暴露、被替换、发现、找回、记录、证据、秘密"
       },
       {
        "value": "反转",
        "label": "反转",
        "meaning": "恢复、更正、反击、认可、让位、撤回"
       },
       {
        "value": "关系变化",
        "label": "关系变化",
        "meaning": "邀请、支持、合作条件、道歉、工作室、独立"
       },
       {
        "value": "人物情绪",
        "label": "人物情绪",
        "meaning": "不愿、离开、道歉、误会"
       },
       {
        "value": "剧情推进",
        "label": "剧情推进",
        "meaning": "无上述命中时的回退标签"
       }
      ],
      "behavior": [
       "高光显示开场/结尾依据；混合增加解说承接；全解说显示叙述起点、可用时的故事推进和叙述终点",
       "依据取 evidence→fact→text；显示来源集数及区间",
       "定位成片按钮停止播放并定位到该片段 start"
      ],
      "implementation": "content-model.js:contentTags/evidenceFor"
     },
     {
      "name": "相似成片提示",
      "kind": "text",
      "source": "所选原片的剧情事实/事件和候选来源，以及同源历史成片；原型从虚构事实和规则计算。",
      "definition": "同片源 kind、market、资产/合集ID、fileVersion、language 的已有 ready/issue 成片，排除本条",
      "behavior": [
       "只要有相似理由即列入提示，按本批优先再按相似优先级排序，最多3条",
       "理由包括同剧情事件、相同开场、相同结尾、全篇解说相同或原片区间重合≥50%",
       "同事件显示开场/结尾是否相同；允许不同剪法供比较",
       "无提示显示当前没有达到提示条件的相似素材，不代表没有重复风险"
      ],
      "validation": "重复规则：exact，或全篇解说归一化后相同，或同事件＋同开场＋同结尾＋原片重合>60%；提示不自动拒绝成片",
      "implementation": "content-model.js:relatedContent/compareContent；engine.js:assetKey/overlap"
     },
     {
      "name": "对比",
      "kind": "action",
      "source": "当前批次成片的内容版本、片段/文案、制作配置与确认/修改/同步记录；原型保存在V7本机状态。",
      "behavior": "打开当前与选中已有成片的双列对比；停止播放、保留当前成片/进度，无内容改写或扣费",
      "implementation": "app.js:compare-content；content-ui.js:compareContentDialog"
     },
     {
      "name": "依据边界",
      "kind": "text",
      "source": "所选原片的剧情事实/事件和候选来源，以及同源历史成片；原型从虚构事实和规则计算。",
      "copy": "依据与区间来自虚构故事板，不是投放效果预测。",
      "implementation": "content-ui.js:contentEvidence"
     }
    ],
    "checks": [
     "同资产版本与语言、开场相同的 ready 成片出现对比提示；其他资产版本或语言及失败/制作中条目不出现。",
     "相似理由超过3条时本批优先且只显示3条；没有提示显示风险边界文案，不宣称无重复。",
     "点击证据定位更新当前故事板；打开对比不生成任务、不变内容版本、不扣积分。"
    ]
   },
   {
    "number": 6,
    "title": "完整时间线",
    "bullets": [
     "按成片顺序展示对白/解说、时间及原片来源，点击定位；核对开场、因果和结尾。"
    ],
    "anchor": {
     "selector": ".timeline-list",
     "index": 0,
     "placement": "left"
    },
    "items": [
     {
      "name": "检查页签",
      "kind": "action",
      "source": "当前批次成片的内容版本、片段/文案、制作配置与确认/修改/同步记录；原型保存在V7本机状态。",
      "default": "junction",
      "values": [
       {
        "value": "junction",
        "label": "接点检查",
        "meaning": "相邻片段交界核对"
       },
       {
        "value": "timeline",
        "label": "完整结构",
        "meaning": "成片顺序时间线"
       },
       {
        "value": "narration",
        "label": "解说与包装／字幕与配乐",
        "meaning": "按结构显示文案编辑或只读包装"
       }
      ],
      "behavior": "切页签停止播放，保留同条 playerAt 和草稿；不升版、不扣费",
      "implementation": "app.js:review-tab；narration-ui.js:fullNarrationPanel"
     },
     {
      "name": "选取与删减原因",
      "kind": "text",
      "source": "当前批次成片的内容版本、片段/文案、制作配置与确认/修改/同步记录；原型保存在V7本机状态。",
      "behavior": "仅 timeline 展示只读 reason。removed",
      "implementation": "app.js:reviewView；o.reason/o.removed"
     },
     {
      "name": "完整时间线片段",
      "kind": "text",
      "source": "当前成片文件、片段时间线与来源时间码；原型以故事板/虚构剧照展示，无真实视频音轨。",
      "definition": "按数组顺序显示成片 start/end、type、label、text、来源集数及 sourceStart/sourceEnd、reason",
      "behavior": "原片/解说采用对应样式；不提供排序、删段或裁切",
      "implementation": "app.js:segmentHTML；o.segments"
     },
     {
      "name": "点击片段定位",
      "kind": "action",
      "source": "当前批次成片的内容版本、片段/文案、制作配置与确认/修改/同步记录；原型保存在V7本机状态。",
      "behavior": "定位该段 start；同条版本/确认不变；源码不停止既有播放计时器",
      "implementation": "app.js:segment/locate"
     }
    ],
    "checks": [
     "混合时间线按成片顺序展示原片和解说，原片区间与成片时长分别显示；点第N段定位其start。",
     "换 timeline 页签保留当前进度并暂停；时间线字段只读，不能拖动改变片段顺序。"
    ]
   },
   {
    "number": 7,
    "title": "检查清单、问题与修复",
    "bullets": [
     "质量问题阻止交付，创作调整可确认采用或报价重做；范围与费用见 R-07。",
     "记录不改媒体、不升版；实际修复成功升版，失败保留旧片（R-06）。"
    ],
    "anchor": {
     "selector": ".issue-section",
     "index": 0,
     "placement": "left"
    },
    "items": [
     {
      "name": "检查清单",
      "kind": "text",
      "source": "当前批次成片的内容版本、片段/文案、制作配置与确认/修改/同步记录；原型保存在V7本机状态。",
      "definition": "只读检查重点，非多选表单",
      "behavior": [
       "高光/混合：完整对白（首尾字与句子边界）、剧情可理解（前因、冲突与承接）",
       "共用音乐与字幕（不压人声、不遮对白）、画面异常（黑屏、卡帧）"
      ],
      "implementation": "app.js:reviewView"
     },
     {
      "name": "反馈问题",
      "kind": "action",
      "source": "当前批次成片的内容版本、片段/文案、制作配置与确认/修改/同步记录；原型保存在V7本机状态。",
      "behavior": "与左侧这里有问题同入口；无同步/修复/返工锁、无草稿时打开 issue",
      "implementation": "app.js:report-issue；feedback-ui.js:feedbackForm"
     },
     {
      "name": "反馈记录",
      "kind": "text",
      "source": "当前批次成片的内容版本、片段/文案、制作配置与确认/修改/同步记录；原型保存在V7本机状态。",
      "definition": "展示全部 o.issues 质量记录及仅当前 contentVersion 的 preferences 创作建议",
      "behavior": [
       "显示类型、质量/创作分类、整条或起止时间、非空补充说明",
       "局部无结束显示 起；整条显示整条素材",
       "质量记录状态 issue 阻确认；创作建议不变 ready，但撤销已有确认后可人工采用当前版"
      ],
      "implementation": "feedback-ui.js:feedbackItems；feedback-model.js:currentPreferences/issueRangeLabel"
     },
     {
      "name": "定位",
      "kind": "action",
      "source": "当前批次成片的内容版本、片段/文案、制作配置与确认/修改/同步记录；原型保存在V7本机状态。",
      "behavior": "定位 item.at 并停止播放；整条定位0；处理锁下仍可用于查看",
      "implementation": "feedback-ui.js:feedbackItems；app.js:quality-locate"
     },
     {
      "name": "局部修复／整条修复",
      "kind": "action",
      "source": "当前批次成片的内容版本、片段/文案、制作配置与确认/修改/同步记录；原型保存在V7本机状态。",
      "behavior": [
       "质量 scope=all 或自动 continuity 类型显示整条修复并打开免费返工；其他显示局部修复",
       "同步/修复/返工锁禁用；草稿先处理",
       "Demo 局部修复900ms后移除该问题、按剩余问题设 issue/ready、revise 升版及清确认，免费并记录 remedy",
       "Demo 没有真实画面/音频修复；正式实际修复成功才升媒体版本，失败保留原片（R-06/R-07）"
      ],
      "implementation": "feedback-ui.js:feedbackItems；app.js:repair/openRework"
     },
     {
      "name": "调整这一条",
      "kind": "action",
      "source": "当前批次成片的内容版本、片段/文案、制作配置与确认/修改/同步记录；原型保存在V7本机状态。",
      "behavior": "创作建议打开付费返工，预填其 direction/reason/detail；opening→opening，其他多数→angle；锁与草稿限制同返工",
      "implementation": "feedback-ui.js:feedbackItems；app.js:openRework"
     },
     {
      "name": "版本修改记录",
      "kind": "action",
      "source": "当前批次成片的内容版本、片段/文案、制作配置与确认/修改/同步记录；原型保存在V7本机状态。",
      "default": "折叠；无 revisions 不显示",
      "behavior": "展开当前及既往 Vn、description；实际反馈记录不升版，Demo保存/修复/返工成功才记修改",
      "implementation": "app.js:reviewView；o.revisions"
     }
    ],
    "checks": [
     "记录质量问题后出现类型/范围/说明，状态需处理，确认禁用；记录创作建议后显示创作调整，当前仍可人工重新确认。",
     "局部质量点击免费修复：仅删除该问题，其他问题保留，版本+1并撤销确认；Demo仅状态模拟，不能验收真实媒体修复。",
     "scope=all 或 continuity 点击整条修复走返工；锁定期间修复/调整禁用而定位仍可查看。"
    ]
   },
   {
    "number": 8,
    "title": "版本交付状态",
    "bullets": [
     "仅当前已确认版本可同步；成功版本不重复上传，旧回执保留，新版另行确认（R-09）。"
    ],
    "anchor": {
     "selector": ".sync-review-notice, .review-queue",
     "index": 0,
     "placement": "left"
    },
    "items": [
     {
      "name": "当前版本交付摘要",
      "kind": "status",
      "source": "当前批次成片的内容版本、片段/文案、制作配置与确认/修改/同步记录；原型保存在V7本机状态。",
      "definition": "当前成片版本和对应同步状态；仅有历史同步任务才显示 notice",
      "values": [
       {
        "value": "none",
        "label": "待确认／待同步",
        "meaning": "无当前版本同步记录；已确认显示待同步"
       },
       {
        "value": "pending",
        "label": "等待同步",
        "meaning": "当前版本请求已创建，锁内容和确认"
       },
       {
        "value": "processing",
        "label": "同步中",
        "meaning": "当前版本传输进行中，锁内容和确认"
       },
       {
        "value": "unknown",
        "label": "待核实结果",
        "meaning": "结果不明确，先查询，禁重复上传和内容修改"
       },
       {
        "value": "success",
        "label": "已同步",
        "meaning": "当前版本成功，禁重复上传"
       },
       {
        "value": "failed",
        "label": "同步失败",
        "meaning": "明确失败，允许按原记录重试"
       }
      ],
      "behavior": "显示目标系统及记录版本；旧成功版本不能代表新版本已同步",
      "implementation": "sync-ui.js:reviewNotice/badgeFor；sync-model.js:getOutputSync/outputVersion"
     },
     {
      "name": "同步到素材管理",
      "kind": "action",
      "source": "当前批次成片的内容版本、片段/文案、制作配置与确认/修改/同步记录；原型保存在V7本机状态。",
      "behavior": "仅 confirmed、ready、无草稿/返工/修复且当前版本无 pending/processing/unknown/success 时可用；打开上传信息，不直接上传",
      "validation": "成功版本不可重传；unknown 先查询；确认必须对应当前版本",
      "implementation": "app.js:reviewView；sync-ui.js:reviewActions/canSync/open"
     },
     {
      "name": "同步记录",
      "kind": "action",
      "source": "当前批次成片的内容版本、片段/文案、制作配置与确认/修改/同步记录；原型保存在V7本机状态。",
      "behavior": "有历史任务时可看按提交时版本保留的同步记录；不改内容或扣费",
      "implementation": "sync-ui.js:reviewActions/records"
     },
     {
      "name": "旧版保留提示",
      "kind": "text",
      "source": "当前批次成片的内容版本、片段/文案、制作配置与确认/修改/同步记录；原型保存在V7本机状态。",
      "behavior": "存在任意旧成功记录时显示已同步版本保留提示；新版变更或取消确认不能自动覆盖、撤回旧素材",
      "copy": "已同步版本保留在素材管理中。此处修改、退款或取消确认不会自动替换或撤回旧素材。（R-09）",
      "implementation": "sync-ui.js:reviewNotice"
     }
    ],
    "checks": [
     "当前V1同步成功：显示已同步且同步按钮禁用；V2产生后需重新确认，旧V1记录保留。",
     "当前版本为pending/processing/unknown：返工、编辑、反馈和确认禁用，查询/查看记录可用；明确失败可按记录重试。"
    ]
   }
  ]
 },
 "review-narration": {
  "title": "成片预览 · 解说与包装",
  "page": "成片检查与局部修复",
  "background": "",
  "need": "预览当前版本，处理问题后人工确认，再交付。",
  "sections": [
   {
    "number": 1,
    "title": "当前成片与人工确认",
    "bullets": [
     "显示结构、最终时长、实际速度及内容版本；确认需人工勾选且满足 R-06。"
    ],
    "anchor": {
     "selector": ".page-head",
     "index": 0,
     "placement": "left"
    },
    "items": [
     {
      "name": "成片名称",
      "kind": "text",
      "definition": "当前成片的只读标题",
      "source": "当前批次成片的内容版本、片段/文案、制作配置与确认/修改/同步记录；原型保存在V7本机状态。",
      "implementation": "app.js:reviewView；o.title"
     },
     {
      "name": "制作结构、最终时长、实际速度、内容版本",
      "kind": "text",
      "definition": "当前任务配置及成片版本的只读摘要",
      "source": "当前批次成片的内容版本、片段/文案、制作配置与确认/修改/同步记录；原型保存在V7本机状态。",
      "behavior": [
       "结构区分高光、解说＋原片、全解说及历史原片任务",
       "时长按分钟:秒向下取整显示；内容显示 Vn",
       "实际成片速度取 outputSpeed，混合独立语速开启时附解说速度",
       "全解说额外显示原片人声关闭"
      ],
      "implementation": "app.js:reviewView；engine.js:modeLabel/speedSummary；b.config、o.duration、o.contentVersion"
     },
     {
      "name": "返回成片管理",
      "kind": "action",
      "source": "当前批次成片的内容版本、片段/文案、制作配置与确认/修改/同步记录；原型保存在V7本机状态。",
      "behavior": "关闭弹窗、展开原任务，清空任务筛选，回成片管理；停止播放并将进度归零",
      "implementation": "app.js:back-tasks"
     },
     {
      "name": "单条返工",
      "kind": "action",
      "definition": "只对本条当前版本发起质量补救或创作重做",
      "source": "当前批次成片的内容版本、片段/文案、制作配置与确认/修改/同步记录；原型保存在V7本机状态。",
      "behavior": "无同步锁、修复、返工时可点击；有草稿先保存或放弃；打开 rework 弹窗",
      "validation": [
       "待制作/失败/修复/返工不满足 reviewable",
       "同步 pending/processing/unknown 禁操作"
      ],
      "copy": [
       "当前素材正在处理或同步，请稍后操作",
       "请先保存或放弃文案修改"
      ],
      "implementation": "app.js:reviewView/openRework"
     }
    ],
    "checks": [
     "打开可检查成片：标题、结构、时长、速度和 Vn 与本条/原任务快照一致。",
     "进入返工中的成片：展示原版本及返工状态，单条返工禁用；返回管理不创建任务或扣费。"
    ]
   },
   {
    "number": 2,
    "title": "连续检查",
    "bullets": [
     "固定同批队列，从点击条开始；切换保留草稿，稍后处理不确认，后续完成项不插队。",
     "确认后可到下一条或打开同步；取消上传保留确认，队尾显示待处理数。"
    ],
    "anchor": {
     "selector": ".review-queue",
     "index": 0,
     "placement": "left"
    },
    "items": [
     {
      "name": "检查序号与固定队列",
      "kind": "status",
      "definition": "同任务一次连续检查的快照队列",
      "source": "当前批次成片的内容版本、片段/文案、制作配置与确认/修改/同步记录；原型保存在V7本机状态。",
      "default": "从点击成片开始；队列取当时 reviewable 成片，后半段后接前半段",
      "behavior": [
       "显示检查 i / N；后续生成完成项不插入当前队列",
       "切换条目回 junction 页签，播放进度归零；各条 narrationDraft 继续保留",
       "跳过已不再 reviewable 或已不存在的队列条目"
      ],
      "implementation": "app.js:startReview/reviewQueueBar/moveReview；reviewQueue.ids/index"
     },
     {
      "name": "上一条",
      "kind": "action",
      "source": "当前批次成片的内容版本、片段/文案、制作配置与确认/修改/同步记录；原型保存在V7本机状态。",
      "behavior": "第1条禁用；其余向前查找可检查成片，不确认当前条",
      "implementation": "app.js:review-prev/moveReview"
     },
     {
      "name": "稍后处理，下一条／完成本轮",
      "kind": "action",
      "source": "当前批次成片的内容版本、片段/文案、制作配置与确认/修改/同步记录；原型保存在V7本机状态。",
      "behavior": "写当前条 deferredAt 时间并前进；末条显示完成本轮，打开本轮结果；不改 confirmed",
      "implementation": "app.js:review-defer/moveReview"
     },
     {
      "name": "确认并同步",
      "kind": "action",
      "source": "当前批次成片的内容版本、片段/文案、制作配置与确认/修改/同步记录；原型保存在V7本机状态。",
      "behavior": "未确认且 ready、无草稿、reviewable、无同步锁时显示可用；人工确认后打开上传信息",
      "implementation": "app.js:reviewQueueBar/confirm-sync/confirmModal"
     },
     {
      "name": "确认并下一条／确认并完成",
      "kind": "action",
      "source": "当前批次成片的内容版本、片段/文案、制作配置与确认/修改/同步记录；原型保存在V7本机状态。",
      "behavior": "未确认且可确认时打开人工确认；成功后下一条或本轮结果；已确认时文案变为已确认，下一条／查看检查结果并直接前进",
      "implementation": "app.js:reviewQueueBar/confirm-next"
     },
     {
      "name": "取消确认",
      "kind": "action",
      "source": "当前批次成片的内容版本、片段/文案、制作配置与确认/修改/同步记录；原型保存在V7本机状态。",
      "behavior": "当前版本已确认时显示；无锁才可操作；清 confirmed 和 confirmedVersion，保留旧同步记录",
      "implementation": "app.js:confirm-output"
     },
     {
      "name": "草稿与处理锁提示",
      "kind": "status",
      "source": "当前批次成片的内容版本、片段/文案、制作配置与确认/修改/同步记录；原型保存在V7本机状态。",
      "behavior": "草稿、质量问题、修复/返工或当前版同步 pending/processing/unknown 禁确认；定位和继续浏览仍可用",
      "copy": [
       "请先保存或放弃文案修改",
       "当前版本同步中或待核实，请先查询同步结果"
      ],
      "implementation": "app.js:click guard；reviewQueueBar"
     }
    ],
    "checks": [
     "同批 A/B/C 点击 B：固定顺序 B、C、A；后完成 D 不插队，上一条在首条禁用。",
     "B 有草稿时稍后处理：B 不被确认、草稿保留；到 C 从0开始，回 B仍保留草稿。",
     "确认后选择同步再取消上传：保留当前版确认；质量问题或处理锁下确认按钮禁用。"
    ]
   },
   {
    "number": 3,
    "title": "自动检查结果",
    "bullets": [
     "生成后先检查/补救，不确定项交人工；自动通过不等于可用，不合格不结算成功（R-02/R-10）。"
    ],
    "anchor": {
     "selector": ".qc-status",
     "index": 0,
     "placement": "left"
    },
    "items": [
     {
      "name": "自动检查摘要",
      "kind": "status",
      "definition": "流程演示的检查状态，不能替代人工验收",
      "source": "制作质量检查结果与人工质量问题；原型从演示场景构造，未检测真实视频。",
      "values": [
       {
        "value": "attention",
        "label": "有待人工核对的位置／需核对",
        "meaning": "质量问题待处理"
       },
       {
        "value": "passed",
        "label": "自动检查完成／待人工确认",
        "meaning": "自动流程通过，尚须人工确认"
       },
       {
        "value": "confirmed",
        "label": "已人工确认",
        "meaning": "confirmedVersion 等于 contentVersion"
       },
       {
        "value": "reworkPending",
        "label": "正在重新制作这一条",
        "meaning": "原版本持续展示，新版完成后重新检查"
       }
      ],
      "behavior": [
       "无 quality 时不显示摘要",
       "repaired 为真显示已完成问题修复；repairType=music 额外显示已降低伴奏音量",
       "系统未检测真实视频；剧情和图文对应仍需人工检查"
      ],
      "copy": "当前为流程演示，未检测真实视频；剧情连贯与图文对应仍需人工检查。",
      "implementation": "workflow-ui.js:qualitySummary；app.js:scheduleGenerated"
     },
     {
      "name": "检查记录",
      "kind": "action",
      "definition": "折叠只读基础检查及问题位置",
      "source": "制作质量检查结果与人工质量问题；原型从演示场景构造，未检测真实视频。",
      "default": "折叠",
      "behavior": "展开显示画面连续性、声音与句子边界、字幕包装及所有质量问题；点击定位设置 playerAt=item.at 并停止播放",
      "implementation": "workflow-ui.js:qualitySummary"
     }
    ],
    "checks": [
     "quality=attention：显示需核对及问题定位；自动通过但未人工确认显示待人工确认。",
     "返工期间优先显示正在重新制作这一条且仍展示原版；无 quality 的旧数据不显示空摘要。"
    ]
   },
   {
    "number": 4,
    "title": "播放、定位与导出",
    "bullets": [
     "播放/拖动/点击片段定位；换成片从0开始，同片换页签保留进度。",
     "“这里有问题”带入起始时间；真实MP4为主交付，JSON/SRT辅助（R-01）。"
    ],
    "anchor": {
     "selector": ".player",
     "index": 0,
     "placement": "left"
    },
    "items": [
     {
      "name": "故事板与来源提示",
      "kind": "text",
      "definition": "虚构画面和文本时间轴示意",
      "source": "当前成片文件、片段时间线与来源时间码；原型以故事板/虚构剧照展示，无真实视频音轨。",
      "behavior": [
       "固定示例封面，标注故事板 · 无真实音轨",
       "按当前时间取 start≤t<end 的片段；总时长端点回退末片段",
       "显示片段 text、来源集数、原片 sourceStart 及 label"
      ],
      "copy": "正式主交付为真实 MP4；本 Demo 只有故事板和辅助 JSON/SRT（R-01）",
      "implementation": "app.js:reviewView/locate"
     },
     {
      "name": "播放／暂停",
      "kind": "action",
      "source": "当前成片文件、片段时间线与来源时间码；原型以故事板/虚构剧照展示，无真实视频音轨。",
      "default": "暂停，按钮 ▶",
      "behavior": "每秒进度加1直至总时长并停止；再次播放总时长端点从0开始；按钮切换 ▶/Ⅱ",
      "implementation": "app.js:play/stopPlayer"
     },
     {
      "name": "故事板进度",
      "kind": "field",
      "source": "当前成片文件、片段时间线与来源时间码；原型以故事板/虚构剧照展示，无真实视频音轨。",
      "default": "新条0；同条换页签保留 playerAt",
      "definition": "范围控件，min=0，max=o.duration，默认步长1秒",
      "behavior": "拖动停止播放并定位；显示分:秒 / 总时长；刷新渲染将超出时长的旧进度截到总时长",
      "implementation": "app.js:reviewView/input scrubber"
     },
     {
      "name": "这里有问题",
      "kind": "action",
      "source": "当前批次成片的内容版本、片段/文案、制作配置与确认/修改/同步记录；原型保存在V7本机状态。",
      "behavior": "停止播放并打开反馈弹窗；将当前 playerAt 带入起始；同步/修复/返工锁时禁用；有草稿时提示先处理",
      "implementation": "app.js:report-issue"
     },
     {
      "name": "包装状态",
      "kind": "text",
      "source": "当前批次成片的内容版本、片段/文案、制作配置与确认/修改/同步记录；原型保存在V7本机状态。",
      "values": [
       {
        "value": "bgm=true/false",
        "label": "BGM 开启／未加配乐",
        "meaning": "沿用本任务配乐开关"
       },
       {
        "value": "full=true/false",
        "label": "原片人声关闭／原片原声保留",
        "meaning": "全解说关闭原片人声，其他结构保留"
       },
       {
        "value": "subtitles=true/false",
        "label": "字幕开启／未加解说字幕或保留原字幕",
        "meaning": "关闭新增字幕时按结构显示"
       },
       {
        "value": "title=true/false",
        "label": "小标题开启／无小标题",
        "meaning": "沿用本任务小标题开关"
       }
      ],
      "definition": "当前包装状态的展示值及含义如下；从对应数据源读取，不是可直接编辑的配置。",
      "implementation": "app.js:reviewView；b.config"
     },
     {
      "name": "辅助文件",
      "kind": "action",
      "definition": "展开导出剪辑方案和示例字幕",
      "source": "当前批次成片的内容版本、片段/文案、制作配置与确认/修改/同步记录；原型保存在V7本机状态。",
      "default": "折叠",
      "behavior": [
       "剪辑方案下载 mixed-cut-v7-任务ID.json，含 demo、notice、片源、配置、规则、分析快照及输出",
       "示例字幕下载 成片ID-Vn-示例.srt，时间和文案来自已保存 segments",
       "有未应用草稿禁导出；不扣费或创建任务"
      ],
      "validation": "空导出列表提示请先选择素材；JSON 有草稿提示先保存或放弃再导出",
      "copy": [
       "故事板方案，非真实视频",
       "字幕时间按故事板示意，不能作为实际口播对齐结果"
      ],
      "implementation": "app.js:exportPlans/export-srt"
     }
    ],
    "checks": [
     "播放到结尾停止，再点播放从0开始；拖动至总时长显示末片段且暂停。",
     "同条换页签保留进度；换条或返回管理归零；反馈起始等于打开时进度。",
     "无草稿下载 JSON/SRT：文件含当前已保存版本及示意标记；有草稿时不下载且提示处理草稿。"
    ]
   },
   {
    "number": 5,
    "title": "选取依据与内容差异",
    "bullets": [
     "默认折叠原片依据及相似项，点击定位；对比仅限同来源/资产/版本/语言（R-04）。"
    ],
    "anchor": {
     "selector": ".content-evidence",
     "index": 0,
     "placement": "left"
    },
    "items": [
     {
      "name": "选取依据与内容差异",
      "kind": "action",
      "definition": "查看只读选材证据和已有成片差异",
      "source": "所选原片的剧情事实/事件和候选来源，以及同源历史成片；原型从虚构事实和规则计算。",
      "default": "折叠",
      "behavior": "展开依据及差异；展开不新增步骤、任务或积分",
      "implementation": "content-ui.js:contentEvidence；content-model.js:evidenceFor"
     },
     {
      "name": "内容标签与依据",
      "kind": "text",
      "source": "所选原片的剧情事实/事件和候选来源，以及同源历史成片；原型从虚构事实和规则计算。",
      "definition": "从片段 fact/evidence 关键词提取并去重，最多3个标签",
      "values": [
       {
        "value": "冲突",
        "label": "冲突",
        "meaning": "质疑、阻止、指控、拒绝、不利、对抗"
       },
       {
        "value": "信息揭露",
        "label": "信息揭露",
        "meaning": "证明、暴露、被替换、发现、找回、记录、证据、秘密"
       },
       {
        "value": "反转",
        "label": "反转",
        "meaning": "恢复、更正、反击、认可、让位、撤回"
       },
       {
        "value": "关系变化",
        "label": "关系变化",
        "meaning": "邀请、支持、合作条件、道歉、工作室、独立"
       },
       {
        "value": "人物情绪",
        "label": "人物情绪",
        "meaning": "不愿、离开、道歉、误会"
       },
       {
        "value": "剧情推进",
        "label": "剧情推进",
        "meaning": "无上述命中时的回退标签"
       }
      ],
      "behavior": [
       "高光显示开场/结尾依据；混合增加解说承接；全解说显示叙述起点、可用时的故事推进和叙述终点",
       "依据取 evidence→fact→text；显示来源集数及区间",
       "定位成片按钮停止播放并定位到该片段 start"
      ],
      "implementation": "content-model.js:contentTags/evidenceFor"
     },
     {
      "name": "相似成片提示",
      "kind": "text",
      "source": "所选原片的剧情事实/事件和候选来源，以及同源历史成片；原型从虚构事实和规则计算。",
      "definition": "同片源 kind、market、资产/合集ID、fileVersion、language 的已有 ready/issue 成片，排除本条",
      "behavior": [
       "只要有相似理由即列入提示，按本批优先再按相似优先级排序，最多3条",
       "理由包括同剧情事件、相同开场、相同结尾、全篇解说相同或原片区间重合≥50%",
       "同事件显示开场/结尾是否相同；允许不同剪法供比较",
       "无提示显示当前没有达到提示条件的相似素材，不代表没有重复风险"
      ],
      "validation": "重复规则：exact，或全篇解说归一化后相同，或同事件＋同开场＋同结尾＋原片重合>60%；提示不自动拒绝成片",
      "implementation": "content-model.js:relatedContent/compareContent；engine.js:assetKey/overlap"
     },
     {
      "name": "对比",
      "kind": "action",
      "source": "当前批次成片的内容版本、片段/文案、制作配置与确认/修改/同步记录；原型保存在V7本机状态。",
      "behavior": "打开当前与选中已有成片的双列对比；停止播放、保留当前成片/进度，无内容改写或扣费",
      "implementation": "app.js:compare-content；content-ui.js:compareContentDialog"
     },
     {
      "name": "依据边界",
      "kind": "text",
      "source": "所选原片的剧情事实/事件和候选来源，以及同源历史成片；原型从虚构事实和规则计算。",
      "copy": "依据与区间来自虚构故事板，不是投放效果预测。",
      "implementation": "content-ui.js:contentEvidence"
     }
    ],
    "checks": [
     "同资产版本与语言、开场相同的 ready 成片出现对比提示；其他资产版本或语言及失败/制作中条目不出现。",
     "相似理由超过3条时本批优先且只显示3条；没有提示显示风险边界文案，不宣称无重复。",
     "点击证据定位更新当前故事板；打开对比不生成任务、不变内容版本、不扣积分。"
    ]
   },
   {
    "number": 6,
    "title": "解说文案与草稿",
    "bullets": [
     "混合可改文案；正式保存只暂存，应用修改后重制、升版并重确认（R-06）。",
     "草稿跨页保留，未应用不得交付；Demo“保存”模拟应用，试听为示例。"
    ],
    "anchor": {
     "selector": ".review-grid > div > .section:not(.issue-section)",
     "index": 0,
     "placement": "left"
    },
    "items": [
     {
      "name": "检查页签",
      "kind": "action",
      "source": "当前批次成片的内容版本、片段/文案、制作配置与确认/修改/同步记录；原型保存在V7本机状态。",
      "default": "junction",
      "values": [
       {
        "value": "junction",
        "label": "接点检查",
        "meaning": "相邻片段交界核对"
       },
       {
        "value": "timeline",
        "label": "完整结构",
        "meaning": "成片顺序时间线"
       },
       {
        "value": "narration",
        "label": "解说与包装／字幕与配乐",
        "meaning": "按结构显示文案编辑或只读包装"
       }
      ],
      "behavior": "切页签停止播放，保留同条 playerAt 和草稿；不升版、不扣费",
      "implementation": "app.js:review-tab；narration-ui.js:fullNarrationPanel"
     },
     {
      "name": "解说文案 · 依据已选原片",
      "kind": "field",
      "source": "所选原片的剧情事实/事件和候选来源，以及同源历史成片；原型从虚构事实和规则计算。",
      "default": "narrationDraft[0] 优先，否则 narrationText，否则空字符串",
      "definition": "仅 narrated 非 full 的单框文案；rows=5，源码无 maxlength",
      "behavior": "无锁可编辑；同步/修复/返工时 disabled；每次输入记录草稿，不直接改已保存 narrationText",
      "implementation": "app.js:reviewView；input narrationEdit"
     },
     {
      "name": "未保存文案提示与草稿",
      "kind": "status",
      "source": "当前批次成片的内容版本、片段/文案、制作配置与确认/修改/同步记录；原型保存在V7本机状态。",
      "default": "输入值与已保存原文不同才创建 narrationDraft；没有差异不显示提示",
      "behavior": [
       "草稿按原始输入比较，含空格差异；本机保存到输出，跨页签/成片保留",
       "出现文案修改尚未保存，查看并保存切 narration；放弃修改删除草稿并恢复已保存文本",
       "有草稿禁止确认、同步、试听、反馈、修复、返工和辅助文件导出",
       "演示实际：草稿输入本身不升版、不生成媒体；产品要求：正式保存草稿不升媒体版本，需应用修改后重制成功才升版（R-06）"
      ],
      "copy": [
       "文案修改尚未保存。",
       "已恢复保存的文案",
       "请先保存或放弃文案修改"
      ],
      "implementation": "app.js:input narrationEdit/data-full-narration；reviewView"
     },
     {
      "name": "保存文案",
      "kind": "action",
      "source": "当前批次成片的内容版本、片段/文案、制作配置与确认/修改/同步记录；原型保存在V7本机状态。",
      "behavior": [
       "演示实际：trim后与原稿不同，改 narrationText 及所有 narration 段 text，清草稿，narrationTimingDirty=true，revise版本+1并撤销确认、同步质量基线文案",
       "演示实际：不重配音、不改时间线/时长、不生成视频；保存提示已保存到方案，未生成真实配音",
       "产品要求：保存只暂存草稿，不升媒体版本；应用修改须校验完整性/事实/时长，重配音与合成成功后升版并重确认（R-06）"
      ],
      "validation": [
       "trim为空：文案不能为空，保留草稿和版本",
       "trim后与已保存相同：清草稿、文案没有变化，不升版",
       "当前锁或修复/返工禁止保存"
      ],
      "copy": [
       "文案不能为空",
       "文案没有变化",
       "已保存到方案，未生成真实配音"
      ],
      "implementation": "app.js:save-narration；engine.js:revise；app.js:updateQualityBaselineText"
     },
     {
      "name": "试听文案",
      "kind": "action",
      "definition": "浏览器播放已保存文案的语音示例",
      "source": "当前批次成片的内容版本、片段/文案、制作配置与确认/修改/同步记录；原型保存在V7本机状态。",
      "behavior": [
       "播放 o.narrationText，不读未保存草稿；先取消既有浏览器语音",
       "rate=b.config.narrationSpeed 或1；language=en 用 en-US，其他用 zh-CN",
       "有草稿先保存/放弃；支持时不生成生产配音或扣费"
      ],
      "validation": "无 speechSynthesis 时提示当前浏览器不支持试听",
      "copy": [
       "试听已保存文案 · 浏览器音色示例",
       "浏览器语音示例，不代表生产音色"
      ],
      "implementation": "app.js:speak"
     },
     {
      "name": "人声与配乐",
      "kind": "text",
      "source": "当前批次成片的内容版本、片段/文案、制作配置与确认/修改/同步记录；原型保存在V7本机状态。",
      "behavior": "有人声时自动降低BGM音量；BGM开启显示配乐方案开启 · 接入原声时降低伴奏，关闭显示未添加BGM",
      "copy": "混音示意",
      "implementation": "narration-ui.js:fullNarrationPanel；app.js:reviewView；b.config.bgm"
     },
     {
      "name": "字幕与小标题",
      "kind": "text",
      "source": "当前批次成片的内容版本、片段/文案、制作配置与确认/修改/同步记录；原型保存在V7本机状态。",
      "behavior": "字幕开启显示对白与口播分别对齐，关闭显示保留原片字幕；小标题开启显示避开字幕区，关闭显示不添加小标题；均为只读，不在预览改开关（R-05）",
      "implementation": "narration-ui.js:fullNarrationPanel；app.js:reviewView；b.config.subtitles/title"
     }
    ],
    "checks": [
     "演示：输入不同文案产生草稿，切页签再回来保留；保存后版本+1、草稿清除且需重确认，时长/音频未生成。",
     "空白稿保存提示文案不能为空；只有首尾空白差异保存提示文案没有变化且不升版。",
     "产品要求：保存草稿维持已交付媒体版本，应用成功才升版；任何未应用草稿均不可确认/同步。",
     "有草稿试听被拦截；无草稿试听使用已保存文本、任务语速与语言；不支持语音时只显示提示。"
    ]
   },
   {
    "number": 7,
    "title": "检查清单、问题与修复",
    "bullets": [
     "质量问题阻止交付，创作调整可确认采用或报价重做；范围与费用见 R-07。",
     "记录不改媒体、不升版；实际修复成功升版，失败保留旧片（R-06）。"
    ],
    "anchor": {
     "selector": ".issue-section",
     "index": 0,
     "placement": "left"
    },
    "items": [
     {
      "name": "检查清单",
      "kind": "text",
      "source": "当前批次成片的内容版本、片段/文案、制作配置与确认/修改/同步记录；原型保存在V7本机状态。",
      "definition": "只读检查重点，非多选表单",
      "behavior": [
       "高光/混合：完整对白（首尾字与句子边界）、剧情可理解（前因、冲突与承接）",
       "共用音乐与字幕（不压人声、不遮对白）、画面异常（黑屏、卡帧）"
      ],
      "implementation": "app.js:reviewView"
     },
     {
      "name": "反馈问题",
      "kind": "action",
      "source": "当前批次成片的内容版本、片段/文案、制作配置与确认/修改/同步记录；原型保存在V7本机状态。",
      "behavior": "与左侧这里有问题同入口；无同步/修复/返工锁、无草稿时打开 issue",
      "implementation": "app.js:report-issue；feedback-ui.js:feedbackForm"
     },
     {
      "name": "反馈记录",
      "kind": "text",
      "source": "当前批次成片的内容版本、片段/文案、制作配置与确认/修改/同步记录；原型保存在V7本机状态。",
      "definition": "展示全部 o.issues 质量记录及仅当前 contentVersion 的 preferences 创作建议",
      "behavior": [
       "显示类型、质量/创作分类、整条或起止时间、非空补充说明",
       "局部无结束显示 起；整条显示整条素材",
       "质量记录状态 issue 阻确认；创作建议不变 ready，但撤销已有确认后可人工采用当前版"
      ],
      "implementation": "feedback-ui.js:feedbackItems；feedback-model.js:currentPreferences/issueRangeLabel"
     },
     {
      "name": "定位",
      "kind": "action",
      "source": "当前批次成片的内容版本、片段/文案、制作配置与确认/修改/同步记录；原型保存在V7本机状态。",
      "behavior": "定位 item.at 并停止播放；整条定位0；处理锁下仍可用于查看",
      "implementation": "feedback-ui.js:feedbackItems；app.js:quality-locate"
     },
     {
      "name": "局部修复／整条修复",
      "kind": "action",
      "source": "当前批次成片的内容版本、片段/文案、制作配置与确认/修改/同步记录；原型保存在V7本机状态。",
      "behavior": [
       "质量 scope=all 或自动 continuity 类型显示整条修复并打开免费返工；其他显示局部修复",
       "同步/修复/返工锁禁用；草稿先处理",
       "Demo 局部修复900ms后移除该问题、按剩余问题设 issue/ready、revise 升版及清确认，免费并记录 remedy",
       "Demo 没有真实画面/音频修复；正式实际修复成功才升媒体版本，失败保留原片（R-06/R-07）"
      ],
      "implementation": "feedback-ui.js:feedbackItems；app.js:repair/openRework"
     },
     {
      "name": "调整这一条",
      "kind": "action",
      "source": "当前批次成片的内容版本、片段/文案、制作配置与确认/修改/同步记录；原型保存在V7本机状态。",
      "behavior": "创作建议打开付费返工，预填其 direction/reason/detail；opening→opening，其他多数→angle；锁与草稿限制同返工",
      "implementation": "feedback-ui.js:feedbackItems；app.js:openRework"
     },
     {
      "name": "版本修改记录",
      "kind": "action",
      "source": "当前批次成片的内容版本、片段/文案、制作配置与确认/修改/同步记录；原型保存在V7本机状态。",
      "default": "折叠；无 revisions 不显示",
      "behavior": "展开当前及既往 Vn、description；实际反馈记录不升版，Demo保存/修复/返工成功才记修改",
      "implementation": "app.js:reviewView；o.revisions"
     }
    ],
    "checks": [
     "记录质量问题后出现类型/范围/说明，状态需处理，确认禁用；记录创作建议后显示创作调整，当前仍可人工重新确认。",
     "局部质量点击免费修复：仅删除该问题，其他问题保留，版本+1并撤销确认；Demo仅状态模拟，不能验收真实媒体修复。",
     "scope=all 或 continuity 点击整条修复走返工；锁定期间修复/调整禁用而定位仍可查看。"
    ]
   },
   {
    "number": 8,
    "title": "版本交付状态",
    "bullets": [
     "仅当前已确认版本可同步；成功版本不重复上传，旧回执保留，新版另行确认（R-09）。"
    ],
    "anchor": {
     "selector": ".sync-review-notice, .review-queue",
     "index": 0,
     "placement": "left"
    },
    "items": [
     {
      "name": "当前版本交付摘要",
      "kind": "status",
      "source": "当前批次成片的内容版本、片段/文案、制作配置与确认/修改/同步记录；原型保存在V7本机状态。",
      "definition": "当前成片版本和对应同步状态；仅有历史同步任务才显示 notice",
      "values": [
       {
        "value": "none",
        "label": "待确认／待同步",
        "meaning": "无当前版本同步记录；已确认显示待同步"
       },
       {
        "value": "pending",
        "label": "等待同步",
        "meaning": "当前版本请求已创建，锁内容和确认"
       },
       {
        "value": "processing",
        "label": "同步中",
        "meaning": "当前版本传输进行中，锁内容和确认"
       },
       {
        "value": "unknown",
        "label": "待核实结果",
        "meaning": "结果不明确，先查询，禁重复上传和内容修改"
       },
       {
        "value": "success",
        "label": "已同步",
        "meaning": "当前版本成功，禁重复上传"
       },
       {
        "value": "failed",
        "label": "同步失败",
        "meaning": "明确失败，允许按原记录重试"
       }
      ],
      "behavior": "显示目标系统及记录版本；旧成功版本不能代表新版本已同步",
      "implementation": "sync-ui.js:reviewNotice/badgeFor；sync-model.js:getOutputSync/outputVersion"
     },
     {
      "name": "同步到素材管理",
      "kind": "action",
      "source": "当前批次成片的内容版本、片段/文案、制作配置与确认/修改/同步记录；原型保存在V7本机状态。",
      "behavior": "仅 confirmed、ready、无草稿/返工/修复且当前版本无 pending/processing/unknown/success 时可用；打开上传信息，不直接上传",
      "validation": "成功版本不可重传；unknown 先查询；确认必须对应当前版本",
      "implementation": "app.js:reviewView；sync-ui.js:reviewActions/canSync/open"
     },
     {
      "name": "同步记录",
      "kind": "action",
      "source": "当前批次成片的内容版本、片段/文案、制作配置与确认/修改/同步记录；原型保存在V7本机状态。",
      "behavior": "有历史任务时可看按提交时版本保留的同步记录；不改内容或扣费",
      "implementation": "sync-ui.js:reviewActions/records"
     },
     {
      "name": "旧版保留提示",
      "kind": "text",
      "source": "当前批次成片的内容版本、片段/文案、制作配置与确认/修改/同步记录；原型保存在V7本机状态。",
      "behavior": "存在任意旧成功记录时显示已同步版本保留提示；新版变更或取消确认不能自动覆盖、撤回旧素材",
      "copy": "已同步版本保留在素材管理中。此处修改、退款或取消确认不会自动替换或撤回旧素材。（R-09）",
      "implementation": "sync-ui.js:reviewNotice"
     }
    ],
    "checks": [
     "当前V1同步成功：显示已同步且同步按钮禁用；V2产生后需重新确认，旧V1记录保留。",
     "当前版本为pending/processing/unknown：返工、编辑、反馈和确认禁用，查询/查看记录可用；明确失败可按记录重试。"
    ]
   }
  ]
 },
 "review-highlight-narration": {
  "title": "成片预览 · 字幕与配乐",
  "page": "成片检查与局部修复",
  "background": "",
  "need": "预览当前版本，处理问题后人工确认，再交付。",
  "sections": [
   {
    "number": 1,
    "title": "当前成片与人工确认",
    "bullets": [
     "显示结构、最终时长、实际速度及内容版本；确认需人工勾选且满足 R-06。"
    ],
    "anchor": {
     "selector": ".page-head",
     "index": 0,
     "placement": "left"
    },
    "items": [
     {
      "name": "成片名称",
      "kind": "text",
      "definition": "当前成片的只读标题",
      "source": "当前批次成片的内容版本、片段/文案、制作配置与确认/修改/同步记录；原型保存在V7本机状态。",
      "implementation": "app.js:reviewView；o.title"
     },
     {
      "name": "制作结构、最终时长、实际速度、内容版本",
      "kind": "text",
      "definition": "当前任务配置及成片版本的只读摘要",
      "source": "当前批次成片的内容版本、片段/文案、制作配置与确认/修改/同步记录；原型保存在V7本机状态。",
      "behavior": [
       "结构区分高光、解说＋原片、全解说及历史原片任务",
       "时长按分钟:秒向下取整显示；内容显示 Vn",
       "实际成片速度取 outputSpeed，混合独立语速开启时附解说速度",
       "全解说额外显示原片人声关闭"
      ],
      "implementation": "app.js:reviewView；engine.js:modeLabel/speedSummary；b.config、o.duration、o.contentVersion"
     },
     {
      "name": "返回成片管理",
      "kind": "action",
      "source": "当前批次成片的内容版本、片段/文案、制作配置与确认/修改/同步记录；原型保存在V7本机状态。",
      "behavior": "关闭弹窗、展开原任务，清空任务筛选，回成片管理；停止播放并将进度归零",
      "implementation": "app.js:back-tasks"
     },
     {
      "name": "单条返工",
      "kind": "action",
      "definition": "只对本条当前版本发起质量补救或创作重做",
      "source": "当前批次成片的内容版本、片段/文案、制作配置与确认/修改/同步记录；原型保存在V7本机状态。",
      "behavior": "无同步锁、修复、返工时可点击；有草稿先保存或放弃；打开 rework 弹窗",
      "validation": [
       "待制作/失败/修复/返工不满足 reviewable",
       "同步 pending/processing/unknown 禁操作"
      ],
      "copy": [
       "当前素材正在处理或同步，请稍后操作",
       "请先保存或放弃文案修改"
      ],
      "implementation": "app.js:reviewView/openRework"
     }
    ],
    "checks": [
     "打开可检查成片：标题、结构、时长、速度和 Vn 与本条/原任务快照一致。",
     "进入返工中的成片：展示原版本及返工状态，单条返工禁用；返回管理不创建任务或扣费。"
    ]
   },
   {
    "number": 2,
    "title": "连续检查",
    "bullets": [
     "固定同批队列，从点击条开始；切换保留草稿，稍后处理不确认，后续完成项不插队。",
     "确认后可到下一条或打开同步；取消上传保留确认，队尾显示待处理数。"
    ],
    "anchor": {
     "selector": ".review-queue",
     "index": 0,
     "placement": "left"
    },
    "items": [
     {
      "name": "检查序号与固定队列",
      "kind": "status",
      "definition": "同任务一次连续检查的快照队列",
      "source": "当前批次成片的内容版本、片段/文案、制作配置与确认/修改/同步记录；原型保存在V7本机状态。",
      "default": "从点击成片开始；队列取当时 reviewable 成片，后半段后接前半段",
      "behavior": [
       "显示检查 i / N；后续生成完成项不插入当前队列",
       "切换条目回 junction 页签，播放进度归零；各条 narrationDraft 继续保留",
       "跳过已不再 reviewable 或已不存在的队列条目"
      ],
      "implementation": "app.js:startReview/reviewQueueBar/moveReview；reviewQueue.ids/index"
     },
     {
      "name": "上一条",
      "kind": "action",
      "source": "当前批次成片的内容版本、片段/文案、制作配置与确认/修改/同步记录；原型保存在V7本机状态。",
      "behavior": "第1条禁用；其余向前查找可检查成片，不确认当前条",
      "implementation": "app.js:review-prev/moveReview"
     },
     {
      "name": "稍后处理，下一条／完成本轮",
      "kind": "action",
      "source": "当前批次成片的内容版本、片段/文案、制作配置与确认/修改/同步记录；原型保存在V7本机状态。",
      "behavior": "写当前条 deferredAt 时间并前进；末条显示完成本轮，打开本轮结果；不改 confirmed",
      "implementation": "app.js:review-defer/moveReview"
     },
     {
      "name": "确认并同步",
      "kind": "action",
      "source": "当前批次成片的内容版本、片段/文案、制作配置与确认/修改/同步记录；原型保存在V7本机状态。",
      "behavior": "未确认且 ready、无草稿、reviewable、无同步锁时显示可用；人工确认后打开上传信息",
      "implementation": "app.js:reviewQueueBar/confirm-sync/confirmModal"
     },
     {
      "name": "确认并下一条／确认并完成",
      "kind": "action",
      "source": "当前批次成片的内容版本、片段/文案、制作配置与确认/修改/同步记录；原型保存在V7本机状态。",
      "behavior": "未确认且可确认时打开人工确认；成功后下一条或本轮结果；已确认时文案变为已确认，下一条／查看检查结果并直接前进",
      "implementation": "app.js:reviewQueueBar/confirm-next"
     },
     {
      "name": "取消确认",
      "kind": "action",
      "source": "当前批次成片的内容版本、片段/文案、制作配置与确认/修改/同步记录；原型保存在V7本机状态。",
      "behavior": "当前版本已确认时显示；无锁才可操作；清 confirmed 和 confirmedVersion，保留旧同步记录",
      "implementation": "app.js:confirm-output"
     },
     {
      "name": "草稿与处理锁提示",
      "kind": "status",
      "source": "当前批次成片的内容版本、片段/文案、制作配置与确认/修改/同步记录；原型保存在V7本机状态。",
      "behavior": "草稿、质量问题、修复/返工或当前版同步 pending/processing/unknown 禁确认；定位和继续浏览仍可用",
      "copy": [
       "请先保存或放弃文案修改",
       "当前版本同步中或待核实，请先查询同步结果"
      ],
      "implementation": "app.js:click guard；reviewQueueBar"
     }
    ],
    "checks": [
     "同批 A/B/C 点击 B：固定顺序 B、C、A；后完成 D 不插队，上一条在首条禁用。",
     "B 有草稿时稍后处理：B 不被确认、草稿保留；到 C 从0开始，回 B仍保留草稿。",
     "确认后选择同步再取消上传：保留当前版确认；质量问题或处理锁下确认按钮禁用。"
    ]
   },
   {
    "number": 3,
    "title": "自动检查结果",
    "bullets": [
     "生成后先检查/补救，不确定项交人工；自动通过不等于可用，不合格不结算成功（R-02/R-10）。"
    ],
    "anchor": {
     "selector": ".qc-status",
     "index": 0,
     "placement": "left"
    },
    "items": [
     {
      "name": "自动检查摘要",
      "kind": "status",
      "definition": "流程演示的检查状态，不能替代人工验收",
      "source": "制作质量检查结果与人工质量问题；原型从演示场景构造，未检测真实视频。",
      "values": [
       {
        "value": "attention",
        "label": "有待人工核对的位置／需核对",
        "meaning": "质量问题待处理"
       },
       {
        "value": "passed",
        "label": "自动检查完成／待人工确认",
        "meaning": "自动流程通过，尚须人工确认"
       },
       {
        "value": "confirmed",
        "label": "已人工确认",
        "meaning": "confirmedVersion 等于 contentVersion"
       },
       {
        "value": "reworkPending",
        "label": "正在重新制作这一条",
        "meaning": "原版本持续展示，新版完成后重新检查"
       }
      ],
      "behavior": [
       "无 quality 时不显示摘要",
       "repaired 为真显示已完成问题修复；repairType=music 额外显示已降低伴奏音量",
       "系统未检测真实视频；剧情和图文对应仍需人工检查"
      ],
      "copy": "当前为流程演示，未检测真实视频；剧情连贯与图文对应仍需人工检查。",
      "implementation": "workflow-ui.js:qualitySummary；app.js:scheduleGenerated"
     },
     {
      "name": "检查记录",
      "kind": "action",
      "definition": "折叠只读基础检查及问题位置",
      "source": "制作质量检查结果与人工质量问题；原型从演示场景构造，未检测真实视频。",
      "default": "折叠",
      "behavior": "展开显示画面连续性、声音与句子边界、字幕包装及所有质量问题；点击定位设置 playerAt=item.at 并停止播放",
      "implementation": "workflow-ui.js:qualitySummary"
     }
    ],
    "checks": [
     "quality=attention：显示需核对及问题定位；自动通过但未人工确认显示待人工确认。",
     "返工期间优先显示正在重新制作这一条且仍展示原版；无 quality 的旧数据不显示空摘要。"
    ]
   },
   {
    "number": 4,
    "title": "播放、定位与导出",
    "bullets": [
     "播放/拖动/点击片段定位；换成片从0开始，同片换页签保留进度。",
     "“这里有问题”带入起始时间；真实MP4为主交付，JSON/SRT辅助（R-01）。"
    ],
    "anchor": {
     "selector": ".player",
     "index": 0,
     "placement": "left"
    },
    "items": [
     {
      "name": "故事板与来源提示",
      "kind": "text",
      "definition": "虚构画面和文本时间轴示意",
      "source": "当前成片文件、片段时间线与来源时间码；原型以故事板/虚构剧照展示，无真实视频音轨。",
      "behavior": [
       "固定示例封面，标注故事板 · 无真实音轨",
       "按当前时间取 start≤t<end 的片段；总时长端点回退末片段",
       "显示片段 text、来源集数、原片 sourceStart 及 label"
      ],
      "copy": "正式主交付为真实 MP4；本 Demo 只有故事板和辅助 JSON/SRT（R-01）",
      "implementation": "app.js:reviewView/locate"
     },
     {
      "name": "播放／暂停",
      "kind": "action",
      "source": "当前成片文件、片段时间线与来源时间码；原型以故事板/虚构剧照展示，无真实视频音轨。",
      "default": "暂停，按钮 ▶",
      "behavior": "每秒进度加1直至总时长并停止；再次播放总时长端点从0开始；按钮切换 ▶/Ⅱ",
      "implementation": "app.js:play/stopPlayer"
     },
     {
      "name": "故事板进度",
      "kind": "field",
      "source": "当前成片文件、片段时间线与来源时间码；原型以故事板/虚构剧照展示，无真实视频音轨。",
      "default": "新条0；同条换页签保留 playerAt",
      "definition": "范围控件，min=0，max=o.duration，默认步长1秒",
      "behavior": "拖动停止播放并定位；显示分:秒 / 总时长；刷新渲染将超出时长的旧进度截到总时长",
      "implementation": "app.js:reviewView/input scrubber"
     },
     {
      "name": "这里有问题",
      "kind": "action",
      "source": "当前批次成片的内容版本、片段/文案、制作配置与确认/修改/同步记录；原型保存在V7本机状态。",
      "behavior": "停止播放并打开反馈弹窗；将当前 playerAt 带入起始；同步/修复/返工锁时禁用；有草稿时提示先处理",
      "implementation": "app.js:report-issue"
     },
     {
      "name": "包装状态",
      "kind": "text",
      "source": "当前批次成片的内容版本、片段/文案、制作配置与确认/修改/同步记录；原型保存在V7本机状态。",
      "values": [
       {
        "value": "bgm=true/false",
        "label": "BGM 开启／未加配乐",
        "meaning": "沿用本任务配乐开关"
       },
       {
        "value": "full=true/false",
        "label": "原片人声关闭／原片原声保留",
        "meaning": "全解说关闭原片人声，其他结构保留"
       },
       {
        "value": "subtitles=true/false",
        "label": "字幕开启／未加解说字幕或保留原字幕",
        "meaning": "关闭新增字幕时按结构显示"
       },
       {
        "value": "title=true/false",
        "label": "小标题开启／无小标题",
        "meaning": "沿用本任务小标题开关"
       }
      ],
      "definition": "当前包装状态的展示值及含义如下；从对应数据源读取，不是可直接编辑的配置。",
      "implementation": "app.js:reviewView；b.config"
     },
     {
      "name": "辅助文件",
      "kind": "action",
      "definition": "展开导出剪辑方案和示例字幕",
      "source": "当前批次成片的内容版本、片段/文案、制作配置与确认/修改/同步记录；原型保存在V7本机状态。",
      "default": "折叠",
      "behavior": [
       "剪辑方案下载 mixed-cut-v7-任务ID.json，含 demo、notice、片源、配置、规则、分析快照及输出",
       "示例字幕下载 成片ID-Vn-示例.srt，时间和文案来自已保存 segments",
       "有未应用草稿禁导出；不扣费或创建任务"
      ],
      "validation": "空导出列表提示请先选择素材；JSON 有草稿提示先保存或放弃再导出",
      "copy": [
       "故事板方案，非真实视频",
       "字幕时间按故事板示意，不能作为实际口播对齐结果"
      ],
      "implementation": "app.js:exportPlans/export-srt"
     }
    ],
    "checks": [
     "播放到结尾停止，再点播放从0开始；拖动至总时长显示末片段且暂停。",
     "同条换页签保留进度；换条或返回管理归零；反馈起始等于打开时进度。",
     "无草稿下载 JSON/SRT：文件含当前已保存版本及示意标记；有草稿时不下载且提示处理草稿。"
    ]
   },
   {
    "number": 5,
    "title": "选取依据与内容差异",
    "bullets": [
     "默认折叠原片依据及相似项，点击定位；对比仅限同来源/资产/版本/语言（R-04）。"
    ],
    "anchor": {
     "selector": ".content-evidence",
     "index": 0,
     "placement": "left"
    },
    "items": [
     {
      "name": "选取依据与内容差异",
      "kind": "action",
      "definition": "查看只读选材证据和已有成片差异",
      "source": "所选原片的剧情事实/事件和候选来源，以及同源历史成片；原型从虚构事实和规则计算。",
      "default": "折叠",
      "behavior": "展开依据及差异；展开不新增步骤、任务或积分",
      "implementation": "content-ui.js:contentEvidence；content-model.js:evidenceFor"
     },
     {
      "name": "内容标签与依据",
      "kind": "text",
      "source": "所选原片的剧情事实/事件和候选来源，以及同源历史成片；原型从虚构事实和规则计算。",
      "definition": "从片段 fact/evidence 关键词提取并去重，最多3个标签",
      "values": [
       {
        "value": "冲突",
        "label": "冲突",
        "meaning": "质疑、阻止、指控、拒绝、不利、对抗"
       },
       {
        "value": "信息揭露",
        "label": "信息揭露",
        "meaning": "证明、暴露、被替换、发现、找回、记录、证据、秘密"
       },
       {
        "value": "反转",
        "label": "反转",
        "meaning": "恢复、更正、反击、认可、让位、撤回"
       },
       {
        "value": "关系变化",
        "label": "关系变化",
        "meaning": "邀请、支持、合作条件、道歉、工作室、独立"
       },
       {
        "value": "人物情绪",
        "label": "人物情绪",
        "meaning": "不愿、离开、道歉、误会"
       },
       {
        "value": "剧情推进",
        "label": "剧情推进",
        "meaning": "无上述命中时的回退标签"
       }
      ],
      "behavior": [
       "高光显示开场/结尾依据；混合增加解说承接；全解说显示叙述起点、可用时的故事推进和叙述终点",
       "依据取 evidence→fact→text；显示来源集数及区间",
       "定位成片按钮停止播放并定位到该片段 start"
      ],
      "implementation": "content-model.js:contentTags/evidenceFor"
     },
     {
      "name": "相似成片提示",
      "kind": "text",
      "source": "所选原片的剧情事实/事件和候选来源，以及同源历史成片；原型从虚构事实和规则计算。",
      "definition": "同片源 kind、market、资产/合集ID、fileVersion、language 的已有 ready/issue 成片，排除本条",
      "behavior": [
       "只要有相似理由即列入提示，按本批优先再按相似优先级排序，最多3条",
       "理由包括同剧情事件、相同开场、相同结尾、全篇解说相同或原片区间重合≥50%",
       "同事件显示开场/结尾是否相同；允许不同剪法供比较",
       "无提示显示当前没有达到提示条件的相似素材，不代表没有重复风险"
      ],
      "validation": "重复规则：exact，或全篇解说归一化后相同，或同事件＋同开场＋同结尾＋原片重合>60%；提示不自动拒绝成片",
      "implementation": "content-model.js:relatedContent/compareContent；engine.js:assetKey/overlap"
     },
     {
      "name": "对比",
      "kind": "action",
      "source": "当前批次成片的内容版本、片段/文案、制作配置与确认/修改/同步记录；原型保存在V7本机状态。",
      "behavior": "打开当前与选中已有成片的双列对比；停止播放、保留当前成片/进度，无内容改写或扣费",
      "implementation": "app.js:compare-content；content-ui.js:compareContentDialog"
     },
     {
      "name": "依据边界",
      "kind": "text",
      "source": "所选原片的剧情事实/事件和候选来源，以及同源历史成片；原型从虚构事实和规则计算。",
      "copy": "依据与区间来自虚构故事板，不是投放效果预测。",
      "implementation": "content-ui.js:contentEvidence"
     }
    ],
    "checks": [
     "同资产版本与语言、开场相同的 ready 成片出现对比提示；其他资产版本或语言及失败/制作中条目不出现。",
     "相似理由超过3条时本批优先且只显示3条；没有提示显示风险边界文案，不宣称无重复。",
     "点击证据定位更新当前故事板；打开对比不生成任务、不变内容版本、不扣积分。"
    ]
   },
   {
    "number": 6,
    "title": "字幕、配乐与小标题",
    "bullets": [
     "核对原声、字幕、BGM避让及标题位置；包装在制作前设置，问题从反馈入口处理。"
    ],
    "anchor": {
     "selector": ".review-grid > div > .section:not(.issue-section)",
     "index": 0,
     "placement": "left"
    },
    "items": [
     {
      "name": "检查页签",
      "kind": "action",
      "source": "当前批次成片的内容版本、片段/文案、制作配置与确认/修改/同步记录；原型保存在V7本机状态。",
      "default": "junction",
      "values": [
       {
        "value": "junction",
        "label": "接点检查",
        "meaning": "相邻片段交界核对"
       },
       {
        "value": "timeline",
        "label": "完整结构",
        "meaning": "成片顺序时间线"
       },
       {
        "value": "narration",
        "label": "解说与包装／字幕与配乐",
        "meaning": "按结构显示文案编辑或只读包装"
       }
      ],
      "behavior": "切页签停止播放，保留同条 playerAt 和草稿；不升版、不扣费",
      "implementation": "app.js:review-tab；narration-ui.js:fullNarrationPanel"
     },
     {
      "name": "人声与配乐",
      "kind": "text",
      "source": "当前批次成片的内容版本、片段/文案、制作配置与确认/修改/同步记录；原型保存在V7本机状态。",
      "behavior": "有人声时自动降低BGM音量；BGM开启显示配乐方案开启 · 接入原声时降低伴奏，关闭显示未添加BGM",
      "copy": "混音示意",
      "implementation": "narration-ui.js:fullNarrationPanel；app.js:reviewView；b.config.bgm"
     },
     {
      "name": "字幕与小标题",
      "kind": "text",
      "source": "当前批次成片的内容版本、片段/文案、制作配置与确认/修改/同步记录；原型保存在V7本机状态。",
      "behavior": "字幕开启显示对白与口播分别对齐，关闭显示保留原片字幕；小标题开启显示避开字幕区，关闭显示不添加小标题；均为只读，不在预览改开关（R-05）",
      "implementation": "narration-ui.js:fullNarrationPanel；app.js:reviewView；b.config.subtitles/title"
     },
     {
      "name": "高光包装边界",
      "kind": "text",
      "source": "当前批次成片的内容版本、片段/文案、制作配置与确认/修改/同步记录；原型保存在V7本机状态。",
      "behavior": "高光此页签不出现解说文本框、保存或试听；包装由制作前配置决定，问题走反馈",
      "implementation": "app.js:reviewView"
     }
    ],
    "checks": [
     "高光切到字幕与配乐页：无解说编辑、保存或试听，仅显示BGM/字幕/标题方案。",
     "关闭BGM/字幕/标题的任务分别显示未添加BGM、保留原片字幕、不添加小标题；不出现预览内包装开关。"
    ]
   },
   {
    "number": 7,
    "title": "检查清单、问题与修复",
    "bullets": [
     "质量问题阻止交付，创作调整可确认采用或报价重做；范围与费用见 R-07。",
     "记录不改媒体、不升版；实际修复成功升版，失败保留旧片（R-06）。"
    ],
    "anchor": {
     "selector": ".issue-section",
     "index": 0,
     "placement": "left"
    },
    "items": [
     {
      "name": "检查清单",
      "kind": "text",
      "source": "当前批次成片的内容版本、片段/文案、制作配置与确认/修改/同步记录；原型保存在V7本机状态。",
      "definition": "只读检查重点，非多选表单",
      "behavior": [
       "高光/混合：完整对白（首尾字与句子边界）、剧情可理解（前因、冲突与承接）",
       "共用音乐与字幕（不压人声、不遮对白）、画面异常（黑屏、卡帧）"
      ],
      "implementation": "app.js:reviewView"
     },
     {
      "name": "反馈问题",
      "kind": "action",
      "source": "当前批次成片的内容版本、片段/文案、制作配置与确认/修改/同步记录；原型保存在V7本机状态。",
      "behavior": "与左侧这里有问题同入口；无同步/修复/返工锁、无草稿时打开 issue",
      "implementation": "app.js:report-issue；feedback-ui.js:feedbackForm"
     },
     {
      "name": "反馈记录",
      "kind": "text",
      "source": "当前批次成片的内容版本、片段/文案、制作配置与确认/修改/同步记录；原型保存在V7本机状态。",
      "definition": "展示全部 o.issues 质量记录及仅当前 contentVersion 的 preferences 创作建议",
      "behavior": [
       "显示类型、质量/创作分类、整条或起止时间、非空补充说明",
       "局部无结束显示 起；整条显示整条素材",
       "质量记录状态 issue 阻确认；创作建议不变 ready，但撤销已有确认后可人工采用当前版"
      ],
      "implementation": "feedback-ui.js:feedbackItems；feedback-model.js:currentPreferences/issueRangeLabel"
     },
     {
      "name": "定位",
      "kind": "action",
      "source": "当前批次成片的内容版本、片段/文案、制作配置与确认/修改/同步记录；原型保存在V7本机状态。",
      "behavior": "定位 item.at 并停止播放；整条定位0；处理锁下仍可用于查看",
      "implementation": "feedback-ui.js:feedbackItems；app.js:quality-locate"
     },
     {
      "name": "局部修复／整条修复",
      "kind": "action",
      "source": "当前批次成片的内容版本、片段/文案、制作配置与确认/修改/同步记录；原型保存在V7本机状态。",
      "behavior": [
       "质量 scope=all 或自动 continuity 类型显示整条修复并打开免费返工；其他显示局部修复",
       "同步/修复/返工锁禁用；草稿先处理",
       "Demo 局部修复900ms后移除该问题、按剩余问题设 issue/ready、revise 升版及清确认，免费并记录 remedy",
       "Demo 没有真实画面/音频修复；正式实际修复成功才升媒体版本，失败保留原片（R-06/R-07）"
      ],
      "implementation": "feedback-ui.js:feedbackItems；app.js:repair/openRework"
     },
     {
      "name": "调整这一条",
      "kind": "action",
      "source": "当前批次成片的内容版本、片段/文案、制作配置与确认/修改/同步记录；原型保存在V7本机状态。",
      "behavior": "创作建议打开付费返工，预填其 direction/reason/detail；opening→opening，其他多数→angle；锁与草稿限制同返工",
      "implementation": "feedback-ui.js:feedbackItems；app.js:openRework"
     },
     {
      "name": "版本修改记录",
      "kind": "action",
      "source": "当前批次成片的内容版本、片段/文案、制作配置与确认/修改/同步记录；原型保存在V7本机状态。",
      "default": "折叠；无 revisions 不显示",
      "behavior": "展开当前及既往 Vn、description；实际反馈记录不升版，Demo保存/修复/返工成功才记修改",
      "implementation": "app.js:reviewView；o.revisions"
     }
    ],
    "checks": [
     "记录质量问题后出现类型/范围/说明，状态需处理，确认禁用；记录创作建议后显示创作调整，当前仍可人工重新确认。",
     "局部质量点击免费修复：仅删除该问题，其他问题保留，版本+1并撤销确认；Demo仅状态模拟，不能验收真实媒体修复。",
     "scope=all 或 continuity 点击整条修复走返工；锁定期间修复/调整禁用而定位仍可查看。"
    ]
   },
   {
    "number": 8,
    "title": "版本交付状态",
    "bullets": [
     "仅当前已确认版本可同步；成功版本不重复上传，旧回执保留，新版另行确认（R-09）。"
    ],
    "anchor": {
     "selector": ".sync-review-notice, .review-queue",
     "index": 0,
     "placement": "left"
    },
    "items": [
     {
      "name": "当前版本交付摘要",
      "kind": "status",
      "source": "当前批次成片的内容版本、片段/文案、制作配置与确认/修改/同步记录；原型保存在V7本机状态。",
      "definition": "当前成片版本和对应同步状态；仅有历史同步任务才显示 notice",
      "values": [
       {
        "value": "none",
        "label": "待确认／待同步",
        "meaning": "无当前版本同步记录；已确认显示待同步"
       },
       {
        "value": "pending",
        "label": "等待同步",
        "meaning": "当前版本请求已创建，锁内容和确认"
       },
       {
        "value": "processing",
        "label": "同步中",
        "meaning": "当前版本传输进行中，锁内容和确认"
       },
       {
        "value": "unknown",
        "label": "待核实结果",
        "meaning": "结果不明确，先查询，禁重复上传和内容修改"
       },
       {
        "value": "success",
        "label": "已同步",
        "meaning": "当前版本成功，禁重复上传"
       },
       {
        "value": "failed",
        "label": "同步失败",
        "meaning": "明确失败，允许按原记录重试"
       }
      ],
      "behavior": "显示目标系统及记录版本；旧成功版本不能代表新版本已同步",
      "implementation": "sync-ui.js:reviewNotice/badgeFor；sync-model.js:getOutputSync/outputVersion"
     },
     {
      "name": "同步到素材管理",
      "kind": "action",
      "source": "当前批次成片的内容版本、片段/文案、制作配置与确认/修改/同步记录；原型保存在V7本机状态。",
      "behavior": "仅 confirmed、ready、无草稿/返工/修复且当前版本无 pending/processing/unknown/success 时可用；打开上传信息，不直接上传",
      "validation": "成功版本不可重传；unknown 先查询；确认必须对应当前版本",
      "implementation": "app.js:reviewView；sync-ui.js:reviewActions/canSync/open"
     },
     {
      "name": "同步记录",
      "kind": "action",
      "source": "当前批次成片的内容版本、片段/文案、制作配置与确认/修改/同步记录；原型保存在V7本机状态。",
      "behavior": "有历史任务时可看按提交时版本保留的同步记录；不改内容或扣费",
      "implementation": "sync-ui.js:reviewActions/records"
     },
     {
      "name": "旧版保留提示",
      "kind": "text",
      "source": "当前批次成片的内容版本、片段/文案、制作配置与确认/修改/同步记录；原型保存在V7本机状态。",
      "behavior": "存在任意旧成功记录时显示已同步版本保留提示；新版变更或取消确认不能自动覆盖、撤回旧素材",
      "copy": "已同步版本保留在素材管理中。此处修改、退款或取消确认不会自动替换或撤回旧素材。（R-09）",
      "implementation": "sync-ui.js:reviewNotice"
     }
    ],
    "checks": [
     "当前V1同步成功：显示已同步且同步按钮禁用；V2产生后需重新确认，旧V1记录保留。",
     "当前版本为pending/processing/unknown：返工、编辑、反馈和确认禁用，查询/查看记录可用；明确失败可按记录重试。"
    ]
   }
  ]
 },
 "review-full-junction": {
  "title": "全解说预览 · 图文对应",
  "page": "成片检查与局部修复",
  "background": "",
  "need": "预览当前版本，处理问题后人工确认，再交付。",
  "sections": [
   {
    "number": 1,
    "title": "当前成片与人工确认",
    "bullets": [
     "显示结构、最终时长、实际速度及内容版本；确认需人工勾选且满足 R-06。"
    ],
    "anchor": {
     "selector": ".page-head",
     "index": 0,
     "placement": "left"
    },
    "items": [
     {
      "name": "成片名称",
      "kind": "text",
      "definition": "当前成片的只读标题",
      "source": "当前批次成片的内容版本、片段/文案、制作配置与确认/修改/同步记录；原型保存在V7本机状态。",
      "implementation": "app.js:reviewView；o.title"
     },
     {
      "name": "制作结构、最终时长、实际速度、内容版本",
      "kind": "text",
      "definition": "当前任务配置及成片版本的只读摘要",
      "source": "当前批次成片的内容版本、片段/文案、制作配置与确认/修改/同步记录；原型保存在V7本机状态。",
      "behavior": [
       "结构区分高光、解说＋原片、全解说及历史原片任务",
       "时长按分钟:秒向下取整显示；内容显示 Vn",
       "实际成片速度取 outputSpeed，混合独立语速开启时附解说速度",
       "全解说额外显示原片人声关闭"
      ],
      "implementation": "app.js:reviewView；engine.js:modeLabel/speedSummary；b.config、o.duration、o.contentVersion"
     },
     {
      "name": "返回成片管理",
      "kind": "action",
      "source": "当前批次成片的内容版本、片段/文案、制作配置与确认/修改/同步记录；原型保存在V7本机状态。",
      "behavior": "关闭弹窗、展开原任务，清空任务筛选，回成片管理；停止播放并将进度归零",
      "implementation": "app.js:back-tasks"
     },
     {
      "name": "单条返工",
      "kind": "action",
      "definition": "只对本条当前版本发起质量补救或创作重做",
      "source": "当前批次成片的内容版本、片段/文案、制作配置与确认/修改/同步记录；原型保存在V7本机状态。",
      "behavior": "无同步锁、修复、返工时可点击；有草稿先保存或放弃；打开 rework 弹窗",
      "validation": [
       "待制作/失败/修复/返工不满足 reviewable",
       "同步 pending/processing/unknown 禁操作"
      ],
      "copy": [
       "当前素材正在处理或同步，请稍后操作",
       "请先保存或放弃文案修改"
      ],
      "implementation": "app.js:reviewView/openRework"
     }
    ],
    "checks": [
     "打开可检查成片：标题、结构、时长、速度和 Vn 与本条/原任务快照一致。",
     "进入返工中的成片：展示原版本及返工状态，单条返工禁用；返回管理不创建任务或扣费。"
    ]
   },
   {
    "number": 2,
    "title": "连续检查",
    "bullets": [
     "固定同批队列，从点击条开始；切换保留草稿，稍后处理不确认，后续完成项不插队。",
     "确认后可到下一条或打开同步；取消上传保留确认，队尾显示待处理数。"
    ],
    "anchor": {
     "selector": ".review-queue",
     "index": 0,
     "placement": "left"
    },
    "items": [
     {
      "name": "检查序号与固定队列",
      "kind": "status",
      "definition": "同任务一次连续检查的快照队列",
      "source": "当前批次成片的内容版本、片段/文案、制作配置与确认/修改/同步记录；原型保存在V7本机状态。",
      "default": "从点击成片开始；队列取当时 reviewable 成片，后半段后接前半段",
      "behavior": [
       "显示检查 i / N；后续生成完成项不插入当前队列",
       "切换条目回 junction 页签，播放进度归零；各条 narrationDraft 继续保留",
       "跳过已不再 reviewable 或已不存在的队列条目"
      ],
      "implementation": "app.js:startReview/reviewQueueBar/moveReview；reviewQueue.ids/index"
     },
     {
      "name": "上一条",
      "kind": "action",
      "source": "当前批次成片的内容版本、片段/文案、制作配置与确认/修改/同步记录；原型保存在V7本机状态。",
      "behavior": "第1条禁用；其余向前查找可检查成片，不确认当前条",
      "implementation": "app.js:review-prev/moveReview"
     },
     {
      "name": "稍后处理，下一条／完成本轮",
      "kind": "action",
      "source": "当前批次成片的内容版本、片段/文案、制作配置与确认/修改/同步记录；原型保存在V7本机状态。",
      "behavior": "写当前条 deferredAt 时间并前进；末条显示完成本轮，打开本轮结果；不改 confirmed",
      "implementation": "app.js:review-defer/moveReview"
     },
     {
      "name": "确认并同步",
      "kind": "action",
      "source": "当前批次成片的内容版本、片段/文案、制作配置与确认/修改/同步记录；原型保存在V7本机状态。",
      "behavior": "未确认且 ready、无草稿、reviewable、无同步锁时显示可用；人工确认后打开上传信息",
      "implementation": "app.js:reviewQueueBar/confirm-sync/confirmModal"
     },
     {
      "name": "确认并下一条／确认并完成",
      "kind": "action",
      "source": "当前批次成片的内容版本、片段/文案、制作配置与确认/修改/同步记录；原型保存在V7本机状态。",
      "behavior": "未确认且可确认时打开人工确认；成功后下一条或本轮结果；已确认时文案变为已确认，下一条／查看检查结果并直接前进",
      "implementation": "app.js:reviewQueueBar/confirm-next"
     },
     {
      "name": "取消确认",
      "kind": "action",
      "source": "当前批次成片的内容版本、片段/文案、制作配置与确认/修改/同步记录；原型保存在V7本机状态。",
      "behavior": "当前版本已确认时显示；无锁才可操作；清 confirmed 和 confirmedVersion，保留旧同步记录",
      "implementation": "app.js:confirm-output"
     },
     {
      "name": "草稿与处理锁提示",
      "kind": "status",
      "source": "当前批次成片的内容版本、片段/文案、制作配置与确认/修改/同步记录；原型保存在V7本机状态。",
      "behavior": "草稿、质量问题、修复/返工或当前版同步 pending/processing/unknown 禁确认；定位和继续浏览仍可用",
      "copy": [
       "请先保存或放弃文案修改",
       "当前版本同步中或待核实，请先查询同步结果"
      ],
      "implementation": "app.js:click guard；reviewQueueBar"
     }
    ],
    "checks": [
     "同批 A/B/C 点击 B：固定顺序 B、C、A；后完成 D 不插队，上一条在首条禁用。",
     "B 有草稿时稍后处理：B 不被确认、草稿保留；到 C 从0开始，回 B仍保留草稿。",
     "确认后选择同步再取消上传：保留当前版确认；质量问题或处理锁下确认按钮禁用。"
    ]
   },
   {
    "number": 3,
    "title": "自动检查结果",
    "bullets": [
     "生成后先检查/补救，不确定项交人工；自动通过不等于可用，不合格不结算成功（R-02/R-10）。"
    ],
    "anchor": {
     "selector": ".qc-status",
     "index": 0,
     "placement": "left"
    },
    "items": [
     {
      "name": "自动检查摘要",
      "kind": "status",
      "definition": "流程演示的检查状态，不能替代人工验收",
      "source": "制作质量检查结果与人工质量问题；原型从演示场景构造，未检测真实视频。",
      "values": [
       {
        "value": "attention",
        "label": "有待人工核对的位置／需核对",
        "meaning": "质量问题待处理"
       },
       {
        "value": "passed",
        "label": "自动检查完成／待人工确认",
        "meaning": "自动流程通过，尚须人工确认"
       },
       {
        "value": "confirmed",
        "label": "已人工确认",
        "meaning": "confirmedVersion 等于 contentVersion"
       },
       {
        "value": "reworkPending",
        "label": "正在重新制作这一条",
        "meaning": "原版本持续展示，新版完成后重新检查"
       }
      ],
      "behavior": [
       "无 quality 时不显示摘要",
       "repaired 为真显示已完成问题修复；repairType=music 额外显示已降低伴奏音量",
       "系统未检测真实视频；剧情和图文对应仍需人工检查"
      ],
      "copy": "当前为流程演示，未检测真实视频；剧情连贯与图文对应仍需人工检查。",
      "implementation": "workflow-ui.js:qualitySummary；app.js:scheduleGenerated"
     },
     {
      "name": "检查记录",
      "kind": "action",
      "definition": "折叠只读基础检查及问题位置",
      "source": "制作质量检查结果与人工质量问题；原型从演示场景构造，未检测真实视频。",
      "default": "折叠",
      "behavior": "展开显示画面连续性、声音与句子边界、字幕包装及所有质量问题；点击定位设置 playerAt=item.at 并停止播放",
      "implementation": "workflow-ui.js:qualitySummary"
     }
    ],
    "checks": [
     "quality=attention：显示需核对及问题定位；自动通过但未人工确认显示待人工确认。",
     "返工期间优先显示正在重新制作这一条且仍展示原版；无 quality 的旧数据不显示空摘要。"
    ]
   },
   {
    "number": 4,
    "title": "播放、定位与导出",
    "bullets": [
     "播放/拖动/点击片段定位；换成片从0开始，同片换页签保留进度。",
     "“这里有问题”带入起始时间；真实MP4为主交付，JSON/SRT辅助（R-01）。"
    ],
    "anchor": {
     "selector": ".player",
     "index": 0,
     "placement": "left"
    },
    "items": [
     {
      "name": "故事板与来源提示",
      "kind": "text",
      "definition": "虚构画面和文本时间轴示意",
      "source": "当前成片文件、片段时间线与来源时间码；原型以故事板/虚构剧照展示，无真实视频音轨。",
      "behavior": [
       "固定示例封面，标注故事板 · 无真实音轨",
       "按当前时间取 start≤t<end 的片段；总时长端点回退末片段",
       "显示片段 text、来源集数、原片 sourceStart 及 label"
      ],
      "copy": "正式主交付为真实 MP4；本 Demo 只有故事板和辅助 JSON/SRT（R-01）",
      "implementation": "app.js:reviewView/locate"
     },
     {
      "name": "播放／暂停",
      "kind": "action",
      "source": "当前成片文件、片段时间线与来源时间码；原型以故事板/虚构剧照展示，无真实视频音轨。",
      "default": "暂停，按钮 ▶",
      "behavior": "每秒进度加1直至总时长并停止；再次播放总时长端点从0开始；按钮切换 ▶/Ⅱ",
      "implementation": "app.js:play/stopPlayer"
     },
     {
      "name": "故事板进度",
      "kind": "field",
      "source": "当前成片文件、片段时间线与来源时间码；原型以故事板/虚构剧照展示，无真实视频音轨。",
      "default": "新条0；同条换页签保留 playerAt",
      "definition": "范围控件，min=0，max=o.duration，默认步长1秒",
      "behavior": "拖动停止播放并定位；显示分:秒 / 总时长；刷新渲染将超出时长的旧进度截到总时长",
      "implementation": "app.js:reviewView/input scrubber"
     },
     {
      "name": "这里有问题",
      "kind": "action",
      "source": "当前批次成片的内容版本、片段/文案、制作配置与确认/修改/同步记录；原型保存在V7本机状态。",
      "behavior": "停止播放并打开反馈弹窗；将当前 playerAt 带入起始；同步/修复/返工锁时禁用；有草稿时提示先处理",
      "implementation": "app.js:report-issue"
     },
     {
      "name": "包装状态",
      "kind": "text",
      "source": "当前批次成片的内容版本、片段/文案、制作配置与确认/修改/同步记录；原型保存在V7本机状态。",
      "values": [
       {
        "value": "bgm=true/false",
        "label": "BGM 开启／未加配乐",
        "meaning": "沿用本任务配乐开关"
       },
       {
        "value": "full=true/false",
        "label": "原片人声关闭／原片原声保留",
        "meaning": "全解说关闭原片人声，其他结构保留"
       },
       {
        "value": "subtitles=true/false",
        "label": "字幕开启／未加解说字幕或保留原字幕",
        "meaning": "关闭新增字幕时按结构显示"
       },
       {
        "value": "title=true/false",
        "label": "小标题开启／无小标题",
        "meaning": "沿用本任务小标题开关"
       }
      ],
      "definition": "当前包装状态的展示值及含义如下；从对应数据源读取，不是可直接编辑的配置。",
      "implementation": "app.js:reviewView；b.config"
     },
     {
      "name": "辅助文件",
      "kind": "action",
      "definition": "展开导出剪辑方案和示例字幕",
      "source": "当前批次成片的内容版本、片段/文案、制作配置与确认/修改/同步记录；原型保存在V7本机状态。",
      "default": "折叠",
      "behavior": [
       "剪辑方案下载 mixed-cut-v7-任务ID.json，含 demo、notice、片源、配置、规则、分析快照及输出",
       "示例字幕下载 成片ID-Vn-示例.srt，时间和文案来自已保存 segments",
       "有未应用草稿禁导出；不扣费或创建任务"
      ],
      "validation": "空导出列表提示请先选择素材；JSON 有草稿提示先保存或放弃再导出",
      "copy": [
       "故事板方案，非真实视频",
       "字幕时间按故事板示意，不能作为实际口播对齐结果"
      ],
      "implementation": "app.js:exportPlans/export-srt"
     }
    ],
    "checks": [
     "播放到结尾停止，再点播放从0开始；拖动至总时长显示末片段且暂停。",
     "同条换页签保留进度；换条或返回管理归零；反馈起始等于打开时进度。",
     "无草稿下载 JSON/SRT：文件含当前已保存版本及示意标记；有草稿时不下载且提示处理草稿。"
    ]
   },
   {
    "number": 5,
    "title": "选取依据与内容差异",
    "bullets": [
     "默认折叠原片依据及相似项，点击定位；对比仅限同来源/资产/版本/语言（R-04）。"
    ],
    "anchor": {
     "selector": ".content-evidence",
     "index": 0,
     "placement": "left"
    },
    "items": [
     {
      "name": "选取依据与内容差异",
      "kind": "action",
      "definition": "查看只读选材证据和已有成片差异",
      "source": "所选原片的剧情事实/事件和候选来源，以及同源历史成片；原型从虚构事实和规则计算。",
      "default": "折叠",
      "behavior": "展开依据及差异；展开不新增步骤、任务或积分",
      "implementation": "content-ui.js:contentEvidence；content-model.js:evidenceFor"
     },
     {
      "name": "内容标签与依据",
      "kind": "text",
      "source": "所选原片的剧情事实/事件和候选来源，以及同源历史成片；原型从虚构事实和规则计算。",
      "definition": "从片段 fact/evidence 关键词提取并去重，最多3个标签",
      "values": [
       {
        "value": "冲突",
        "label": "冲突",
        "meaning": "质疑、阻止、指控、拒绝、不利、对抗"
       },
       {
        "value": "信息揭露",
        "label": "信息揭露",
        "meaning": "证明、暴露、被替换、发现、找回、记录、证据、秘密"
       },
       {
        "value": "反转",
        "label": "反转",
        "meaning": "恢复、更正、反击、认可、让位、撤回"
       },
       {
        "value": "关系变化",
        "label": "关系变化",
        "meaning": "邀请、支持、合作条件、道歉、工作室、独立"
       },
       {
        "value": "人物情绪",
        "label": "人物情绪",
        "meaning": "不愿、离开、道歉、误会"
       },
       {
        "value": "剧情推进",
        "label": "剧情推进",
        "meaning": "无上述命中时的回退标签"
       }
      ],
      "behavior": [
       "高光显示开场/结尾依据；混合增加解说承接；全解说显示叙述起点、可用时的故事推进和叙述终点",
       "依据取 evidence→fact→text；显示来源集数及区间",
       "定位成片按钮停止播放并定位到该片段 start"
      ],
      "implementation": "content-model.js:contentTags/evidenceFor"
     },
     {
      "name": "相似成片提示",
      "kind": "text",
      "source": "所选原片的剧情事实/事件和候选来源，以及同源历史成片；原型从虚构事实和规则计算。",
      "definition": "同片源 kind、market、资产/合集ID、fileVersion、language 的已有 ready/issue 成片，排除本条",
      "behavior": [
       "只要有相似理由即列入提示，按本批优先再按相似优先级排序，最多3条",
       "理由包括同剧情事件、相同开场、相同结尾、全篇解说相同或原片区间重合≥50%",
       "同事件显示开场/结尾是否相同；允许不同剪法供比较",
       "无提示显示当前没有达到提示条件的相似素材，不代表没有重复风险"
      ],
      "validation": "重复规则：exact，或全篇解说归一化后相同，或同事件＋同开场＋同结尾＋原片重合>60%；提示不自动拒绝成片",
      "implementation": "content-model.js:relatedContent/compareContent；engine.js:assetKey/overlap"
     },
     {
      "name": "对比",
      "kind": "action",
      "source": "当前批次成片的内容版本、片段/文案、制作配置与确认/修改/同步记录；原型保存在V7本机状态。",
      "behavior": "打开当前与选中已有成片的双列对比；停止播放、保留当前成片/进度，无内容改写或扣费",
      "implementation": "app.js:compare-content；content-ui.js:compareContentDialog"
     },
     {
      "name": "依据边界",
      "kind": "text",
      "source": "所选原片的剧情事实/事件和候选来源，以及同源历史成片；原型从虚构事实和规则计算。",
      "copy": "依据与区间来自虚构故事板，不是投放效果预测。",
      "implementation": "content-ui.js:contentEvidence"
     }
    ],
    "checks": [
     "同资产版本与语言、开场相同的 ready 成片出现对比提示；其他资产版本或语言及失败/制作中条目不出现。",
     "相似理由超过3条时本批优先且只显示3条；没有提示显示风险边界文案，不宣称无重复。",
     "点击证据定位更新当前故事板；打开对比不生成任务、不变内容版本、不扣积分。"
    ]
   },
   {
    "number": 6,
    "title": "逐段图文对应",
    "bullets": [
     "逐段核对解说、原片集数/区间及事实依据；定位画面，全解说关闭原片音轨。"
    ],
    "anchor": {
     "selector": ".narration-source-list",
     "index": 0,
     "placement": "left"
    },
    "items": [
     {
      "name": "检查页签",
      "kind": "action",
      "source": "当前批次成片的内容版本、片段/文案、制作配置与确认/修改/同步记录；原型保存在V7本机状态。",
      "default": "junction",
      "values": [
       {
        "value": "junction",
        "label": "图文对应",
        "meaning": "全解说逐段图文核对"
       },
       {
        "value": "timeline",
        "label": "完整结构",
        "meaning": "成片顺序时间线"
       },
       {
        "value": "narration",
        "label": "全文与包装",
        "meaning": "按结构显示文案编辑或只读包装"
       }
      ],
      "behavior": "切页签停止播放，保留同条 playerAt 和草稿；不升版、不扣费",
      "implementation": "app.js:review-tab；narration-ui.js:fullNarrationPanel"
     },
     {
      "name": "全解说与目标时长",
      "kind": "text",
      "source": "当前批次成片的内容版本、片段/文案、制作配置与确认/修改/同步记录；原型保存在V7本机状态。",
      "definition": "全解说标识、制作配置的成片目标时长区间与当前故事板总时长",
      "behavior": "目标时长与故事板时长分别显示；无 segments 时提示暂无解说片段／请返回内容方案重新整理。",
      "implementation": "narration-ui.js:fullNarrationPanel；creation-ui.js:durationLabel；b.config.duration/o.duration"
     },
     {
      "name": "逐段图文对应",
      "kind": "text",
      "source": "当前批次成片的内容版本、片段/文案、制作配置与确认/修改/同步记录；原型保存在V7本机状态。",
      "definition": "每段 start/end、label或第n段、本段 text、对应画面 sourceEp/sourceStart/sourceEnd",
      "behavior": "标题显示n段图文对应；全部解说段对应画面，原片人声关闭",
      "implementation": "narration-ui.js:fullNarrationPanel；o.segments"
     },
     {
      "name": "剧情依据",
      "kind": "action",
      "source": "所选原片的剧情事实/事件和候选来源，以及同源历史成片；原型从虚构事实和规则计算。",
      "default": "逐段折叠",
      "behavior": "展开 evidence，缺失取 fact，再缺失提示请对照原片检查这段解说的事实依据。",
      "implementation": "narration-ui.js:evidence"
     },
     {
      "name": "定位画面",
      "kind": "action",
      "source": "当前成片文件、片段时间线与来源时间码；原型以故事板/虚构剧照展示，无真实视频音轨。",
      "behavior": "定位本段 start；全解说索引从0开始，首段可定位0；不改变文案或版本；源码不停止既有播放计时器",
      "implementation": "app.js:junction/locate；narration-ui.js:fullNarrationPanel"
     }
    ],
    "checks": [
     "全解说n段显示n张图文卡及n段标识；第一卡定位到segments[0].start，来源集数/区间与文案对应。",
     "缺evidence但有fact显示fact；两者皆无显示对照原片提示；组件级fullNarrationPanel传空segments显示暂无解说片段。"
    ]
   },
   {
    "number": 7,
    "title": "检查清单、问题与修复",
    "bullets": [
     "质量问题阻止交付，创作调整可确认采用或报价重做；范围与费用见 R-07。",
     "记录不改媒体、不升版；实际修复成功升版，失败保留旧片（R-06）。"
    ],
    "anchor": {
     "selector": ".issue-section",
     "index": 0,
     "placement": "left"
    },
    "items": [
     {
      "name": "检查清单",
      "kind": "text",
      "source": "当前批次成片的内容版本、片段/文案、制作配置与确认/修改/同步记录；原型保存在V7本机状态。",
      "definition": "只读检查重点，非多选表单",
      "behavior": [
       "全解说：解说完整（全文与逐段配音边界）、图文对应（文案事实与画面一致）",
       "共用音乐与字幕（不压人声、不遮对白）、画面异常（黑屏、卡帧）"
      ],
      "implementation": "app.js:reviewView"
     },
     {
      "name": "反馈问题",
      "kind": "action",
      "source": "当前批次成片的内容版本、片段/文案、制作配置与确认/修改/同步记录；原型保存在V7本机状态。",
      "behavior": "与左侧这里有问题同入口；无同步/修复/返工锁、无草稿时打开 issue-full",
      "implementation": "app.js:report-issue；feedback-ui.js:feedbackForm"
     },
     {
      "name": "反馈记录",
      "kind": "text",
      "source": "当前批次成片的内容版本、片段/文案、制作配置与确认/修改/同步记录；原型保存在V7本机状态。",
      "definition": "展示全部 o.issues 质量记录及仅当前 contentVersion 的 preferences 创作建议",
      "behavior": [
       "显示类型、质量/创作分类、整条或起止时间、非空补充说明",
       "局部无结束显示 起；整条显示整条素材",
       "质量记录状态 issue 阻确认；创作建议不变 ready，但撤销已有确认后可人工采用当前版"
      ],
      "implementation": "feedback-ui.js:feedbackItems；feedback-model.js:currentPreferences/issueRangeLabel"
     },
     {
      "name": "定位",
      "kind": "action",
      "source": "当前批次成片的内容版本、片段/文案、制作配置与确认/修改/同步记录；原型保存在V7本机状态。",
      "behavior": "定位 item.at 并停止播放；整条定位0；处理锁下仍可用于查看",
      "implementation": "feedback-ui.js:feedbackItems；app.js:quality-locate"
     },
     {
      "name": "局部修复／整条修复",
      "kind": "action",
      "source": "当前批次成片的内容版本、片段/文案、制作配置与确认/修改/同步记录；原型保存在V7本机状态。",
      "behavior": [
       "质量 scope=all 或自动 continuity 类型显示整条修复并打开免费返工；其他显示局部修复",
       "同步/修复/返工锁禁用；草稿先处理",
       "Demo 局部修复900ms后移除该问题、按剩余问题设 issue/ready、revise 升版及清确认，免费并记录 remedy",
       "Demo 没有真实画面/音频修复；正式实际修复成功才升媒体版本，失败保留原片（R-06/R-07）"
      ],
      "implementation": "feedback-ui.js:feedbackItems；app.js:repair/openRework"
     },
     {
      "name": "调整这一条",
      "kind": "action",
      "source": "当前批次成片的内容版本、片段/文案、制作配置与确认/修改/同步记录；原型保存在V7本机状态。",
      "behavior": "创作建议打开付费返工，预填其 direction/reason/detail；opening→opening，其他多数→angle；锁与草稿限制同返工",
      "implementation": "feedback-ui.js:feedbackItems；app.js:openRework"
     },
     {
      "name": "版本修改记录",
      "kind": "action",
      "source": "当前批次成片的内容版本、片段/文案、制作配置与确认/修改/同步记录；原型保存在V7本机状态。",
      "default": "折叠；无 revisions 不显示",
      "behavior": "展开当前及既往 Vn、description；实际反馈记录不升版，Demo保存/修复/返工成功才记修改",
      "implementation": "app.js:reviewView；o.revisions"
     }
    ],
    "checks": [
     "记录质量问题后出现类型/范围/说明，状态需处理，确认禁用；记录创作建议后显示创作调整，当前仍可人工重新确认。",
     "局部质量点击免费修复：仅删除该问题，其他问题保留，版本+1并撤销确认；Demo仅状态模拟，不能验收真实媒体修复。",
     "scope=all 或 continuity 点击整条修复走返工；锁定期间修复/调整禁用而定位仍可查看。"
    ]
   },
   {
    "number": 8,
    "title": "版本交付状态",
    "bullets": [
     "仅当前已确认版本可同步；成功版本不重复上传，旧回执保留，新版另行确认（R-09）。"
    ],
    "anchor": {
     "selector": ".sync-review-notice, .review-queue",
     "index": 0,
     "placement": "left"
    },
    "items": [
     {
      "name": "当前版本交付摘要",
      "kind": "status",
      "source": "当前批次成片的内容版本、片段/文案、制作配置与确认/修改/同步记录；原型保存在V7本机状态。",
      "definition": "当前成片版本和对应同步状态；仅有历史同步任务才显示 notice",
      "values": [
       {
        "value": "none",
        "label": "待确认／待同步",
        "meaning": "无当前版本同步记录；已确认显示待同步"
       },
       {
        "value": "pending",
        "label": "等待同步",
        "meaning": "当前版本请求已创建，锁内容和确认"
       },
       {
        "value": "processing",
        "label": "同步中",
        "meaning": "当前版本传输进行中，锁内容和确认"
       },
       {
        "value": "unknown",
        "label": "待核实结果",
        "meaning": "结果不明确，先查询，禁重复上传和内容修改"
       },
       {
        "value": "success",
        "label": "已同步",
        "meaning": "当前版本成功，禁重复上传"
       },
       {
        "value": "failed",
        "label": "同步失败",
        "meaning": "明确失败，允许按原记录重试"
       }
      ],
      "behavior": "显示目标系统及记录版本；旧成功版本不能代表新版本已同步",
      "implementation": "sync-ui.js:reviewNotice/badgeFor；sync-model.js:getOutputSync/outputVersion"
     },
     {
      "name": "同步到素材管理",
      "kind": "action",
      "source": "当前批次成片的内容版本、片段/文案、制作配置与确认/修改/同步记录；原型保存在V7本机状态。",
      "behavior": "仅 confirmed、ready、无草稿/返工/修复且当前版本无 pending/processing/unknown/success 时可用；打开上传信息，不直接上传",
      "validation": "成功版本不可重传；unknown 先查询；确认必须对应当前版本",
      "implementation": "app.js:reviewView；sync-ui.js:reviewActions/canSync/open"
     },
     {
      "name": "同步记录",
      "kind": "action",
      "source": "当前批次成片的内容版本、片段/文案、制作配置与确认/修改/同步记录；原型保存在V7本机状态。",
      "behavior": "有历史任务时可看按提交时版本保留的同步记录；不改内容或扣费",
      "implementation": "sync-ui.js:reviewActions/records"
     },
     {
      "name": "旧版保留提示",
      "kind": "text",
      "source": "当前批次成片的内容版本、片段/文案、制作配置与确认/修改/同步记录；原型保存在V7本机状态。",
      "behavior": "存在任意旧成功记录时显示已同步版本保留提示；新版变更或取消确认不能自动覆盖、撤回旧素材",
      "copy": "已同步版本保留在素材管理中。此处修改、退款或取消确认不会自动替换或撤回旧素材。（R-09）",
      "implementation": "sync-ui.js:reviewNotice"
     }
    ],
    "checks": [
     "当前V1同步成功：显示已同步且同步按钮禁用；V2产生后需重新确认，旧V1记录保留。",
     "当前版本为pending/processing/unknown：返工、编辑、反馈和确认禁用，查询/查看记录可用；明确失败可按记录重试。"
    ]
   }
  ]
 },
 "review-full-timeline": {
  "title": "全解说预览 · 完整结构",
  "page": "成片检查与局部修复",
  "background": "",
  "need": "预览当前版本，处理问题后人工确认，再交付。",
  "sections": [
   {
    "number": 1,
    "title": "当前成片与人工确认",
    "bullets": [
     "显示结构、最终时长、实际速度及内容版本；确认需人工勾选且满足 R-06。"
    ],
    "anchor": {
     "selector": ".page-head",
     "index": 0,
     "placement": "left"
    },
    "items": [
     {
      "name": "成片名称",
      "kind": "text",
      "definition": "当前成片的只读标题",
      "source": "当前批次成片的内容版本、片段/文案、制作配置与确认/修改/同步记录；原型保存在V7本机状态。",
      "implementation": "app.js:reviewView；o.title"
     },
     {
      "name": "制作结构、最终时长、实际速度、内容版本",
      "kind": "text",
      "definition": "当前任务配置及成片版本的只读摘要",
      "source": "当前批次成片的内容版本、片段/文案、制作配置与确认/修改/同步记录；原型保存在V7本机状态。",
      "behavior": [
       "结构区分高光、解说＋原片、全解说及历史原片任务",
       "时长按分钟:秒向下取整显示；内容显示 Vn",
       "实际成片速度取 outputSpeed，混合独立语速开启时附解说速度",
       "全解说额外显示原片人声关闭"
      ],
      "implementation": "app.js:reviewView；engine.js:modeLabel/speedSummary；b.config、o.duration、o.contentVersion"
     },
     {
      "name": "返回成片管理",
      "kind": "action",
      "source": "当前批次成片的内容版本、片段/文案、制作配置与确认/修改/同步记录；原型保存在V7本机状态。",
      "behavior": "关闭弹窗、展开原任务，清空任务筛选，回成片管理；停止播放并将进度归零",
      "implementation": "app.js:back-tasks"
     },
     {
      "name": "单条返工",
      "kind": "action",
      "definition": "只对本条当前版本发起质量补救或创作重做",
      "source": "当前批次成片的内容版本、片段/文案、制作配置与确认/修改/同步记录；原型保存在V7本机状态。",
      "behavior": "无同步锁、修复、返工时可点击；有草稿先保存或放弃；打开 rework 弹窗",
      "validation": [
       "待制作/失败/修复/返工不满足 reviewable",
       "同步 pending/processing/unknown 禁操作"
      ],
      "copy": [
       "当前素材正在处理或同步，请稍后操作",
       "请先保存或放弃文案修改"
      ],
      "implementation": "app.js:reviewView/openRework"
     }
    ],
    "checks": [
     "打开可检查成片：标题、结构、时长、速度和 Vn 与本条/原任务快照一致。",
     "进入返工中的成片：展示原版本及返工状态，单条返工禁用；返回管理不创建任务或扣费。"
    ]
   },
   {
    "number": 2,
    "title": "连续检查",
    "bullets": [
     "固定同批队列，从点击条开始；切换保留草稿，稍后处理不确认，后续完成项不插队。",
     "确认后可到下一条或打开同步；取消上传保留确认，队尾显示待处理数。"
    ],
    "anchor": {
     "selector": ".review-queue",
     "index": 0,
     "placement": "left"
    },
    "items": [
     {
      "name": "检查序号与固定队列",
      "kind": "status",
      "definition": "同任务一次连续检查的快照队列",
      "source": "当前批次成片的内容版本、片段/文案、制作配置与确认/修改/同步记录；原型保存在V7本机状态。",
      "default": "从点击成片开始；队列取当时 reviewable 成片，后半段后接前半段",
      "behavior": [
       "显示检查 i / N；后续生成完成项不插入当前队列",
       "切换条目回 junction 页签，播放进度归零；各条 narrationDraft 继续保留",
       "跳过已不再 reviewable 或已不存在的队列条目"
      ],
      "implementation": "app.js:startReview/reviewQueueBar/moveReview；reviewQueue.ids/index"
     },
     {
      "name": "上一条",
      "kind": "action",
      "source": "当前批次成片的内容版本、片段/文案、制作配置与确认/修改/同步记录；原型保存在V7本机状态。",
      "behavior": "第1条禁用；其余向前查找可检查成片，不确认当前条",
      "implementation": "app.js:review-prev/moveReview"
     },
     {
      "name": "稍后处理，下一条／完成本轮",
      "kind": "action",
      "source": "当前批次成片的内容版本、片段/文案、制作配置与确认/修改/同步记录；原型保存在V7本机状态。",
      "behavior": "写当前条 deferredAt 时间并前进；末条显示完成本轮，打开本轮结果；不改 confirmed",
      "implementation": "app.js:review-defer/moveReview"
     },
     {
      "name": "确认并同步",
      "kind": "action",
      "source": "当前批次成片的内容版本、片段/文案、制作配置与确认/修改/同步记录；原型保存在V7本机状态。",
      "behavior": "未确认且 ready、无草稿、reviewable、无同步锁时显示可用；人工确认后打开上传信息",
      "implementation": "app.js:reviewQueueBar/confirm-sync/confirmModal"
     },
     {
      "name": "确认并下一条／确认并完成",
      "kind": "action",
      "source": "当前批次成片的内容版本、片段/文案、制作配置与确认/修改/同步记录；原型保存在V7本机状态。",
      "behavior": "未确认且可确认时打开人工确认；成功后下一条或本轮结果；已确认时文案变为已确认，下一条／查看检查结果并直接前进",
      "implementation": "app.js:reviewQueueBar/confirm-next"
     },
     {
      "name": "取消确认",
      "kind": "action",
      "source": "当前批次成片的内容版本、片段/文案、制作配置与确认/修改/同步记录；原型保存在V7本机状态。",
      "behavior": "当前版本已确认时显示；无锁才可操作；清 confirmed 和 confirmedVersion，保留旧同步记录",
      "implementation": "app.js:confirm-output"
     },
     {
      "name": "草稿与处理锁提示",
      "kind": "status",
      "source": "当前批次成片的内容版本、片段/文案、制作配置与确认/修改/同步记录；原型保存在V7本机状态。",
      "behavior": "草稿、质量问题、修复/返工或当前版同步 pending/processing/unknown 禁确认；定位和继续浏览仍可用",
      "copy": [
       "请先保存或放弃文案修改",
       "当前版本同步中或待核实，请先查询同步结果"
      ],
      "implementation": "app.js:click guard；reviewQueueBar"
     }
    ],
    "checks": [
     "同批 A/B/C 点击 B：固定顺序 B、C、A；后完成 D 不插队，上一条在首条禁用。",
     "B 有草稿时稍后处理：B 不被确认、草稿保留；到 C 从0开始，回 B仍保留草稿。",
     "确认后选择同步再取消上传：保留当前版确认；质量问题或处理锁下确认按钮禁用。"
    ]
   },
   {
    "number": 3,
    "title": "自动检查结果",
    "bullets": [
     "生成后先检查/补救，不确定项交人工；自动通过不等于可用，不合格不结算成功（R-02/R-10）。"
    ],
    "anchor": {
     "selector": ".qc-status",
     "index": 0,
     "placement": "left"
    },
    "items": [
     {
      "name": "自动检查摘要",
      "kind": "status",
      "definition": "流程演示的检查状态，不能替代人工验收",
      "source": "制作质量检查结果与人工质量问题；原型从演示场景构造，未检测真实视频。",
      "values": [
       {
        "value": "attention",
        "label": "有待人工核对的位置／需核对",
        "meaning": "质量问题待处理"
       },
       {
        "value": "passed",
        "label": "自动检查完成／待人工确认",
        "meaning": "自动流程通过，尚须人工确认"
       },
       {
        "value": "confirmed",
        "label": "已人工确认",
        "meaning": "confirmedVersion 等于 contentVersion"
       },
       {
        "value": "reworkPending",
        "label": "正在重新制作这一条",
        "meaning": "原版本持续展示，新版完成后重新检查"
       }
      ],
      "behavior": [
       "无 quality 时不显示摘要",
       "repaired 为真显示已完成问题修复；repairType=music 额外显示已降低伴奏音量",
       "系统未检测真实视频；剧情和图文对应仍需人工检查"
      ],
      "copy": "当前为流程演示，未检测真实视频；剧情连贯与图文对应仍需人工检查。",
      "implementation": "workflow-ui.js:qualitySummary；app.js:scheduleGenerated"
     },
     {
      "name": "检查记录",
      "kind": "action",
      "definition": "折叠只读基础检查及问题位置",
      "source": "制作质量检查结果与人工质量问题；原型从演示场景构造，未检测真实视频。",
      "default": "折叠",
      "behavior": "展开显示画面连续性、声音与句子边界、字幕包装及所有质量问题；点击定位设置 playerAt=item.at 并停止播放",
      "implementation": "workflow-ui.js:qualitySummary"
     }
    ],
    "checks": [
     "quality=attention：显示需核对及问题定位；自动通过但未人工确认显示待人工确认。",
     "返工期间优先显示正在重新制作这一条且仍展示原版；无 quality 的旧数据不显示空摘要。"
    ]
   },
   {
    "number": 4,
    "title": "播放、定位与导出",
    "bullets": [
     "播放/拖动/点击片段定位；换成片从0开始，同片换页签保留进度。",
     "“这里有问题”带入起始时间；真实MP4为主交付，JSON/SRT辅助（R-01）。"
    ],
    "anchor": {
     "selector": ".player",
     "index": 0,
     "placement": "left"
    },
    "items": [
     {
      "name": "故事板与来源提示",
      "kind": "text",
      "definition": "虚构画面和文本时间轴示意",
      "source": "当前成片文件、片段时间线与来源时间码；原型以故事板/虚构剧照展示，无真实视频音轨。",
      "behavior": [
       "固定示例封面，标注故事板 · 无真实音轨",
       "按当前时间取 start≤t<end 的片段；总时长端点回退末片段",
       "显示片段 text、来源集数、原片 sourceStart 及 label"
      ],
      "copy": "正式主交付为真实 MP4；本 Demo 只有故事板和辅助 JSON/SRT（R-01）",
      "implementation": "app.js:reviewView/locate"
     },
     {
      "name": "播放／暂停",
      "kind": "action",
      "source": "当前成片文件、片段时间线与来源时间码；原型以故事板/虚构剧照展示，无真实视频音轨。",
      "default": "暂停，按钮 ▶",
      "behavior": "每秒进度加1直至总时长并停止；再次播放总时长端点从0开始；按钮切换 ▶/Ⅱ",
      "implementation": "app.js:play/stopPlayer"
     },
     {
      "name": "故事板进度",
      "kind": "field",
      "source": "当前成片文件、片段时间线与来源时间码；原型以故事板/虚构剧照展示，无真实视频音轨。",
      "default": "新条0；同条换页签保留 playerAt",
      "definition": "范围控件，min=0，max=o.duration，默认步长1秒",
      "behavior": "拖动停止播放并定位；显示分:秒 / 总时长；刷新渲染将超出时长的旧进度截到总时长",
      "implementation": "app.js:reviewView/input scrubber"
     },
     {
      "name": "这里有问题",
      "kind": "action",
      "source": "当前批次成片的内容版本、片段/文案、制作配置与确认/修改/同步记录；原型保存在V7本机状态。",
      "behavior": "停止播放并打开反馈弹窗；将当前 playerAt 带入起始；同步/修复/返工锁时禁用；有草稿时提示先处理",
      "implementation": "app.js:report-issue"
     },
     {
      "name": "包装状态",
      "kind": "text",
      "source": "当前批次成片的内容版本、片段/文案、制作配置与确认/修改/同步记录；原型保存在V7本机状态。",
      "values": [
       {
        "value": "bgm=true/false",
        "label": "BGM 开启／未加配乐",
        "meaning": "沿用本任务配乐开关"
       },
       {
        "value": "full=true/false",
        "label": "原片人声关闭／原片原声保留",
        "meaning": "全解说关闭原片人声，其他结构保留"
       },
       {
        "value": "subtitles=true/false",
        "label": "字幕开启／未加解说字幕或保留原字幕",
        "meaning": "关闭新增字幕时按结构显示"
       },
       {
        "value": "title=true/false",
        "label": "小标题开启／无小标题",
        "meaning": "沿用本任务小标题开关"
       }
      ],
      "definition": "当前包装状态的展示值及含义如下；从对应数据源读取，不是可直接编辑的配置。",
      "implementation": "app.js:reviewView；b.config"
     },
     {
      "name": "辅助文件",
      "kind": "action",
      "definition": "展开导出剪辑方案和示例字幕",
      "source": "当前批次成片的内容版本、片段/文案、制作配置与确认/修改/同步记录；原型保存在V7本机状态。",
      "default": "折叠",
      "behavior": [
       "剪辑方案下载 mixed-cut-v7-任务ID.json，含 demo、notice、片源、配置、规则、分析快照及输出",
       "示例字幕下载 成片ID-Vn-示例.srt，时间和文案来自已保存 segments",
       "有未应用草稿禁导出；不扣费或创建任务"
      ],
      "validation": "空导出列表提示请先选择素材；JSON 有草稿提示先保存或放弃再导出",
      "copy": [
       "故事板方案，非真实视频",
       "字幕时间按故事板示意，不能作为实际口播对齐结果"
      ],
      "implementation": "app.js:exportPlans/export-srt"
     }
    ],
    "checks": [
     "播放到结尾停止，再点播放从0开始；拖动至总时长显示末片段且暂停。",
     "同条换页签保留进度；换条或返回管理归零；反馈起始等于打开时进度。",
     "无草稿下载 JSON/SRT：文件含当前已保存版本及示意标记；有草稿时不下载且提示处理草稿。"
    ]
   },
   {
    "number": 5,
    "title": "选取依据与内容差异",
    "bullets": [
     "默认折叠原片依据及相似项，点击定位；对比仅限同来源/资产/版本/语言（R-04）。"
    ],
    "anchor": {
     "selector": ".content-evidence",
     "index": 0,
     "placement": "left"
    },
    "items": [
     {
      "name": "选取依据与内容差异",
      "kind": "action",
      "definition": "查看只读选材证据和已有成片差异",
      "source": "所选原片的剧情事实/事件和候选来源，以及同源历史成片；原型从虚构事实和规则计算。",
      "default": "折叠",
      "behavior": "展开依据及差异；展开不新增步骤、任务或积分",
      "implementation": "content-ui.js:contentEvidence；content-model.js:evidenceFor"
     },
     {
      "name": "内容标签与依据",
      "kind": "text",
      "source": "所选原片的剧情事实/事件和候选来源，以及同源历史成片；原型从虚构事实和规则计算。",
      "definition": "从片段 fact/evidence 关键词提取并去重，最多3个标签",
      "values": [
       {
        "value": "冲突",
        "label": "冲突",
        "meaning": "质疑、阻止、指控、拒绝、不利、对抗"
       },
       {
        "value": "信息揭露",
        "label": "信息揭露",
        "meaning": "证明、暴露、被替换、发现、找回、记录、证据、秘密"
       },
       {
        "value": "反转",
        "label": "反转",
        "meaning": "恢复、更正、反击、认可、让位、撤回"
       },
       {
        "value": "关系变化",
        "label": "关系变化",
        "meaning": "邀请、支持、合作条件、道歉、工作室、独立"
       },
       {
        "value": "人物情绪",
        "label": "人物情绪",
        "meaning": "不愿、离开、道歉、误会"
       },
       {
        "value": "剧情推进",
        "label": "剧情推进",
        "meaning": "无上述命中时的回退标签"
       }
      ],
      "behavior": [
       "高光显示开场/结尾依据；混合增加解说承接；全解说显示叙述起点、可用时的故事推进和叙述终点",
       "依据取 evidence→fact→text；显示来源集数及区间",
       "定位成片按钮停止播放并定位到该片段 start"
      ],
      "implementation": "content-model.js:contentTags/evidenceFor"
     },
     {
      "name": "相似成片提示",
      "kind": "text",
      "source": "所选原片的剧情事实/事件和候选来源，以及同源历史成片；原型从虚构事实和规则计算。",
      "definition": "同片源 kind、market、资产/合集ID、fileVersion、language 的已有 ready/issue 成片，排除本条",
      "behavior": [
       "只要有相似理由即列入提示，按本批优先再按相似优先级排序，最多3条",
       "理由包括同剧情事件、相同开场、相同结尾、全篇解说相同或原片区间重合≥50%",
       "同事件显示开场/结尾是否相同；允许不同剪法供比较",
       "无提示显示当前没有达到提示条件的相似素材，不代表没有重复风险"
      ],
      "validation": "重复规则：exact，或全篇解说归一化后相同，或同事件＋同开场＋同结尾＋原片重合>60%；提示不自动拒绝成片",
      "implementation": "content-model.js:relatedContent/compareContent；engine.js:assetKey/overlap"
     },
     {
      "name": "对比",
      "kind": "action",
      "source": "当前批次成片的内容版本、片段/文案、制作配置与确认/修改/同步记录；原型保存在V7本机状态。",
      "behavior": "打开当前与选中已有成片的双列对比；停止播放、保留当前成片/进度，无内容改写或扣费",
      "implementation": "app.js:compare-content；content-ui.js:compareContentDialog"
     },
     {
      "name": "依据边界",
      "kind": "text",
      "source": "所选原片的剧情事实/事件和候选来源，以及同源历史成片；原型从虚构事实和规则计算。",
      "copy": "依据与区间来自虚构故事板，不是投放效果预测。",
      "implementation": "content-ui.js:contentEvidence"
     }
    ],
    "checks": [
     "同资产版本与语言、开场相同的 ready 成片出现对比提示；其他资产版本或语言及失败/制作中条目不出现。",
     "相似理由超过3条时本批优先且只显示3条；没有提示显示风险边界文案，不宣称无重复。",
     "点击证据定位更新当前故事板；打开对比不生成任务、不变内容版本、不扣积分。"
    ]
   },
   {
    "number": 6,
    "title": "完整解说时间线",
    "bullets": [
     "解说连续覆盖全片，逐段带画面来源；核对人物、事件顺序和声音时长，不附加原声尾段。"
    ],
    "anchor": {
     "selector": ".full-narration-timeline",
     "index": 0,
     "placement": "left"
    },
    "items": [
     {
      "name": "检查页签",
      "kind": "action",
      "source": "当前批次成片的内容版本、片段/文案、制作配置与确认/修改/同步记录；原型保存在V7本机状态。",
      "default": "junction",
      "values": [
       {
        "value": "junction",
        "label": "图文对应",
        "meaning": "全解说逐段图文核对"
       },
       {
        "value": "timeline",
        "label": "完整结构",
        "meaning": "成片顺序时间线"
       },
       {
        "value": "narration",
        "label": "全文与包装",
        "meaning": "按结构显示文案编辑或只读包装"
       }
      ],
      "behavior": "切页签停止播放，保留同条 playerAt 和草稿；不升版、不扣费",
      "implementation": "app.js:review-tab；narration-ui.js:fullNarrationPanel"
     },
     {
      "name": "全解说与目标时长",
      "kind": "text",
      "source": "当前批次成片的内容版本、片段/文案、制作配置与确认/修改/同步记录；原型保存在V7本机状态。",
      "definition": "全解说标识、制作配置的成片目标时长区间与当前故事板总时长",
      "behavior": "目标时长与故事板时长分别显示；无 segments 时提示暂无解说片段／请返回内容方案重新整理。",
      "implementation": "narration-ui.js:fullNarrationPanel；creation-ui.js:durationLabel；b.config.duration/o.duration"
     },
     {
      "name": "完整解说时间线",
      "kind": "text",
      "source": "当前成片文件、片段时间线与来源时间码；原型以故事板/虚构剧照展示，无真实视频音轨。",
      "definition": "逐段成片start/end、label/text、原片画面来源以及音轨方案",
      "behavior": "每段音轨显示解说覆盖本段 · 原片人声关闭，BGM开启时附BGM配乐；按配音时长检查画面和段落；不附加原声尾段",
      "implementation": "narration-ui.js:fullNarrationPanel"
     },
     {
      "name": "点击解说段定位",
      "kind": "action",
      "source": "当前批次成片的内容版本、片段/文案、制作配置与确认/修改/同步记录；原型保存在V7本机状态。",
      "behavior": "定位本段start，保留当前版本及确认；源码不停止既有播放计时器",
      "implementation": "app.js:junction/locate"
     },
     {
      "name": "连贯检查提示",
      "kind": "text",
      "source": "当前批次成片的内容版本、片段/文案、制作配置与确认/修改/同步记录；原型保存在V7本机状态。",
      "copy": "检查转折、人物称呼和事件顺序是否连贯。",
      "implementation": "narration-ui.js:fullNarrationPanel"
     }
    ],
    "checks": [
     "全解说时间线每段显示解说覆盖、原片人声关闭；BGM开关只影响BGM文案，不出现原声尾段。",
     "点击最后一段定位其start；组件级fullNarrationPanel传空segments显示空态且不渲染段落。"
    ]
   },
   {
    "number": 7,
    "title": "检查清单、问题与修复",
    "bullets": [
     "质量问题阻止交付，创作调整可确认采用或报价重做；范围与费用见 R-07。",
     "记录不改媒体、不升版；实际修复成功升版，失败保留旧片（R-06）。"
    ],
    "anchor": {
     "selector": ".issue-section",
     "index": 0,
     "placement": "left"
    },
    "items": [
     {
      "name": "检查清单",
      "kind": "text",
      "source": "当前批次成片的内容版本、片段/文案、制作配置与确认/修改/同步记录；原型保存在V7本机状态。",
      "definition": "只读检查重点，非多选表单",
      "behavior": [
       "全解说：解说完整（全文与逐段配音边界）、图文对应（文案事实与画面一致）",
       "共用音乐与字幕（不压人声、不遮对白）、画面异常（黑屏、卡帧）"
      ],
      "implementation": "app.js:reviewView"
     },
     {
      "name": "反馈问题",
      "kind": "action",
      "source": "当前批次成片的内容版本、片段/文案、制作配置与确认/修改/同步记录；原型保存在V7本机状态。",
      "behavior": "与左侧这里有问题同入口；无同步/修复/返工锁、无草稿时打开 issue-full",
      "implementation": "app.js:report-issue；feedback-ui.js:feedbackForm"
     },
     {
      "name": "反馈记录",
      "kind": "text",
      "source": "当前批次成片的内容版本、片段/文案、制作配置与确认/修改/同步记录；原型保存在V7本机状态。",
      "definition": "展示全部 o.issues 质量记录及仅当前 contentVersion 的 preferences 创作建议",
      "behavior": [
       "显示类型、质量/创作分类、整条或起止时间、非空补充说明",
       "局部无结束显示 起；整条显示整条素材",
       "质量记录状态 issue 阻确认；创作建议不变 ready，但撤销已有确认后可人工采用当前版"
      ],
      "implementation": "feedback-ui.js:feedbackItems；feedback-model.js:currentPreferences/issueRangeLabel"
     },
     {
      "name": "定位",
      "kind": "action",
      "source": "当前批次成片的内容版本、片段/文案、制作配置与确认/修改/同步记录；原型保存在V7本机状态。",
      "behavior": "定位 item.at 并停止播放；整条定位0；处理锁下仍可用于查看",
      "implementation": "feedback-ui.js:feedbackItems；app.js:quality-locate"
     },
     {
      "name": "局部修复／整条修复",
      "kind": "action",
      "source": "当前批次成片的内容版本、片段/文案、制作配置与确认/修改/同步记录；原型保存在V7本机状态。",
      "behavior": [
       "质量 scope=all 或自动 continuity 类型显示整条修复并打开免费返工；其他显示局部修复",
       "同步/修复/返工锁禁用；草稿先处理",
       "Demo 局部修复900ms后移除该问题、按剩余问题设 issue/ready、revise 升版及清确认，免费并记录 remedy",
       "Demo 没有真实画面/音频修复；正式实际修复成功才升媒体版本，失败保留原片（R-06/R-07）"
      ],
      "implementation": "feedback-ui.js:feedbackItems；app.js:repair/openRework"
     },
     {
      "name": "调整这一条",
      "kind": "action",
      "source": "当前批次成片的内容版本、片段/文案、制作配置与确认/修改/同步记录；原型保存在V7本机状态。",
      "behavior": "创作建议打开付费返工，预填其 direction/reason/detail；opening→opening，其他多数→angle；锁与草稿限制同返工",
      "implementation": "feedback-ui.js:feedbackItems；app.js:openRework"
     },
     {
      "name": "版本修改记录",
      "kind": "action",
      "source": "当前批次成片的内容版本、片段/文案、制作配置与确认/修改/同步记录；原型保存在V7本机状态。",
      "default": "折叠；无 revisions 不显示",
      "behavior": "展开当前及既往 Vn、description；实际反馈记录不升版，Demo保存/修复/返工成功才记修改",
      "implementation": "app.js:reviewView；o.revisions"
     }
    ],
    "checks": [
     "记录质量问题后出现类型/范围/说明，状态需处理，确认禁用；记录创作建议后显示创作调整，当前仍可人工重新确认。",
     "局部质量点击免费修复：仅删除该问题，其他问题保留，版本+1并撤销确认；Demo仅状态模拟，不能验收真实媒体修复。",
     "scope=all 或 continuity 点击整条修复走返工；锁定期间修复/调整禁用而定位仍可查看。"
    ]
   },
   {
    "number": 8,
    "title": "版本交付状态",
    "bullets": [
     "仅当前已确认版本可同步；成功版本不重复上传，旧回执保留，新版另行确认（R-09）。"
    ],
    "anchor": {
     "selector": ".sync-review-notice, .review-queue",
     "index": 0,
     "placement": "left"
    },
    "items": [
     {
      "name": "当前版本交付摘要",
      "kind": "status",
      "source": "当前批次成片的内容版本、片段/文案、制作配置与确认/修改/同步记录；原型保存在V7本机状态。",
      "definition": "当前成片版本和对应同步状态；仅有历史同步任务才显示 notice",
      "values": [
       {
        "value": "none",
        "label": "待确认／待同步",
        "meaning": "无当前版本同步记录；已确认显示待同步"
       },
       {
        "value": "pending",
        "label": "等待同步",
        "meaning": "当前版本请求已创建，锁内容和确认"
       },
       {
        "value": "processing",
        "label": "同步中",
        "meaning": "当前版本传输进行中，锁内容和确认"
       },
       {
        "value": "unknown",
        "label": "待核实结果",
        "meaning": "结果不明确，先查询，禁重复上传和内容修改"
       },
       {
        "value": "success",
        "label": "已同步",
        "meaning": "当前版本成功，禁重复上传"
       },
       {
        "value": "failed",
        "label": "同步失败",
        "meaning": "明确失败，允许按原记录重试"
       }
      ],
      "behavior": "显示目标系统及记录版本；旧成功版本不能代表新版本已同步",
      "implementation": "sync-ui.js:reviewNotice/badgeFor；sync-model.js:getOutputSync/outputVersion"
     },
     {
      "name": "同步到素材管理",
      "kind": "action",
      "source": "当前批次成片的内容版本、片段/文案、制作配置与确认/修改/同步记录；原型保存在V7本机状态。",
      "behavior": "仅 confirmed、ready、无草稿/返工/修复且当前版本无 pending/processing/unknown/success 时可用；打开上传信息，不直接上传",
      "validation": "成功版本不可重传；unknown 先查询；确认必须对应当前版本",
      "implementation": "app.js:reviewView；sync-ui.js:reviewActions/canSync/open"
     },
     {
      "name": "同步记录",
      "kind": "action",
      "source": "当前批次成片的内容版本、片段/文案、制作配置与确认/修改/同步记录；原型保存在V7本机状态。",
      "behavior": "有历史任务时可看按提交时版本保留的同步记录；不改内容或扣费",
      "implementation": "sync-ui.js:reviewActions/records"
     },
     {
      "name": "旧版保留提示",
      "kind": "text",
      "source": "当前批次成片的内容版本、片段/文案、制作配置与确认/修改/同步记录；原型保存在V7本机状态。",
      "behavior": "存在任意旧成功记录时显示已同步版本保留提示；新版变更或取消确认不能自动覆盖、撤回旧素材",
      "copy": "已同步版本保留在素材管理中。此处修改、退款或取消确认不会自动替换或撤回旧素材。（R-09）",
      "implementation": "sync-ui.js:reviewNotice"
     }
    ],
    "checks": [
     "当前V1同步成功：显示已同步且同步按钮禁用；V2产生后需重新确认，旧V1记录保留。",
     "当前版本为pending/processing/unknown：返工、编辑、反馈和确认禁用，查询/查看记录可用；明确失败可按记录重试。"
    ]
   }
  ]
 },
 "review-full-narration": {
  "title": "全解说预览 · 全文与包装",
  "page": "成片检查与局部修复",
  "background": "",
  "need": "预览当前版本，处理问题后人工确认，再交付。",
  "sections": [
   {
    "number": 1,
    "title": "当前成片与人工确认",
    "bullets": [
     "显示结构、最终时长、实际速度及内容版本；确认需人工勾选且满足 R-06。"
    ],
    "anchor": {
     "selector": ".page-head",
     "index": 0,
     "placement": "left"
    },
    "items": [
     {
      "name": "成片名称",
      "kind": "text",
      "definition": "当前成片的只读标题",
      "source": "当前批次成片的内容版本、片段/文案、制作配置与确认/修改/同步记录；原型保存在V7本机状态。",
      "implementation": "app.js:reviewView；o.title"
     },
     {
      "name": "制作结构、最终时长、实际速度、内容版本",
      "kind": "text",
      "definition": "当前任务配置及成片版本的只读摘要",
      "source": "当前批次成片的内容版本、片段/文案、制作配置与确认/修改/同步记录；原型保存在V7本机状态。",
      "behavior": [
       "结构区分高光、解说＋原片、全解说及历史原片任务",
       "时长按分钟:秒向下取整显示；内容显示 Vn",
       "实际成片速度取 outputSpeed，混合独立语速开启时附解说速度",
       "全解说额外显示原片人声关闭"
      ],
      "implementation": "app.js:reviewView；engine.js:modeLabel/speedSummary；b.config、o.duration、o.contentVersion"
     },
     {
      "name": "返回成片管理",
      "kind": "action",
      "source": "当前批次成片的内容版本、片段/文案、制作配置与确认/修改/同步记录；原型保存在V7本机状态。",
      "behavior": "关闭弹窗、展开原任务，清空任务筛选，回成片管理；停止播放并将进度归零",
      "implementation": "app.js:back-tasks"
     },
     {
      "name": "单条返工",
      "kind": "action",
      "definition": "只对本条当前版本发起质量补救或创作重做",
      "source": "当前批次成片的内容版本、片段/文案、制作配置与确认/修改/同步记录；原型保存在V7本机状态。",
      "behavior": "无同步锁、修复、返工时可点击；有草稿先保存或放弃；打开 rework 弹窗",
      "validation": [
       "待制作/失败/修复/返工不满足 reviewable",
       "同步 pending/processing/unknown 禁操作"
      ],
      "copy": [
       "当前素材正在处理或同步，请稍后操作",
       "请先保存或放弃文案修改"
      ],
      "implementation": "app.js:reviewView/openRework"
     }
    ],
    "checks": [
     "打开可检查成片：标题、结构、时长、速度和 Vn 与本条/原任务快照一致。",
     "进入返工中的成片：展示原版本及返工状态，单条返工禁用；返回管理不创建任务或扣费。"
    ]
   },
   {
    "number": 2,
    "title": "连续检查",
    "bullets": [
     "固定同批队列，从点击条开始；切换保留草稿，稍后处理不确认，后续完成项不插队。",
     "确认后可到下一条或打开同步；取消上传保留确认，队尾显示待处理数。"
    ],
    "anchor": {
     "selector": ".review-queue",
     "index": 0,
     "placement": "left"
    },
    "items": [
     {
      "name": "检查序号与固定队列",
      "kind": "status",
      "definition": "同任务一次连续检查的快照队列",
      "source": "当前批次成片的内容版本、片段/文案、制作配置与确认/修改/同步记录；原型保存在V7本机状态。",
      "default": "从点击成片开始；队列取当时 reviewable 成片，后半段后接前半段",
      "behavior": [
       "显示检查 i / N；后续生成完成项不插入当前队列",
       "切换条目回 junction 页签，播放进度归零；各条 narrationDraft 继续保留",
       "跳过已不再 reviewable 或已不存在的队列条目"
      ],
      "implementation": "app.js:startReview/reviewQueueBar/moveReview；reviewQueue.ids/index"
     },
     {
      "name": "上一条",
      "kind": "action",
      "source": "当前批次成片的内容版本、片段/文案、制作配置与确认/修改/同步记录；原型保存在V7本机状态。",
      "behavior": "第1条禁用；其余向前查找可检查成片，不确认当前条",
      "implementation": "app.js:review-prev/moveReview"
     },
     {
      "name": "稍后处理，下一条／完成本轮",
      "kind": "action",
      "source": "当前批次成片的内容版本、片段/文案、制作配置与确认/修改/同步记录；原型保存在V7本机状态。",
      "behavior": "写当前条 deferredAt 时间并前进；末条显示完成本轮，打开本轮结果；不改 confirmed",
      "implementation": "app.js:review-defer/moveReview"
     },
     {
      "name": "确认并同步",
      "kind": "action",
      "source": "当前批次成片的内容版本、片段/文案、制作配置与确认/修改/同步记录；原型保存在V7本机状态。",
      "behavior": "未确认且 ready、无草稿、reviewable、无同步锁时显示可用；人工确认后打开上传信息",
      "implementation": "app.js:reviewQueueBar/confirm-sync/confirmModal"
     },
     {
      "name": "确认并下一条／确认并完成",
      "kind": "action",
      "source": "当前批次成片的内容版本、片段/文案、制作配置与确认/修改/同步记录；原型保存在V7本机状态。",
      "behavior": "未确认且可确认时打开人工确认；成功后下一条或本轮结果；已确认时文案变为已确认，下一条／查看检查结果并直接前进",
      "implementation": "app.js:reviewQueueBar/confirm-next"
     },
     {
      "name": "取消确认",
      "kind": "action",
      "source": "当前批次成片的内容版本、片段/文案、制作配置与确认/修改/同步记录；原型保存在V7本机状态。",
      "behavior": "当前版本已确认时显示；无锁才可操作；清 confirmed 和 confirmedVersion，保留旧同步记录",
      "implementation": "app.js:confirm-output"
     },
     {
      "name": "草稿与处理锁提示",
      "kind": "status",
      "source": "当前批次成片的内容版本、片段/文案、制作配置与确认/修改/同步记录；原型保存在V7本机状态。",
      "behavior": "草稿、质量问题、修复/返工或当前版同步 pending/processing/unknown 禁确认；定位和继续浏览仍可用",
      "copy": [
       "请先保存或放弃文案修改",
       "当前版本同步中或待核实，请先查询同步结果"
      ],
      "implementation": "app.js:click guard；reviewQueueBar"
     }
    ],
    "checks": [
     "同批 A/B/C 点击 B：固定顺序 B、C、A；后完成 D 不插队，上一条在首条禁用。",
     "B 有草稿时稍后处理：B 不被确认、草稿保留；到 C 从0开始，回 B仍保留草稿。",
     "确认后选择同步再取消上传：保留当前版确认；质量问题或处理锁下确认按钮禁用。"
    ]
   },
   {
    "number": 3,
    "title": "自动检查结果",
    "bullets": [
     "生成后先检查/补救，不确定项交人工；自动通过不等于可用，不合格不结算成功（R-02/R-10）。"
    ],
    "anchor": {
     "selector": ".qc-status",
     "index": 0,
     "placement": "left"
    },
    "items": [
     {
      "name": "自动检查摘要",
      "kind": "status",
      "definition": "流程演示的检查状态，不能替代人工验收",
      "source": "制作质量检查结果与人工质量问题；原型从演示场景构造，未检测真实视频。",
      "values": [
       {
        "value": "attention",
        "label": "有待人工核对的位置／需核对",
        "meaning": "质量问题待处理"
       },
       {
        "value": "passed",
        "label": "自动检查完成／待人工确认",
        "meaning": "自动流程通过，尚须人工确认"
       },
       {
        "value": "confirmed",
        "label": "已人工确认",
        "meaning": "confirmedVersion 等于 contentVersion"
       },
       {
        "value": "reworkPending",
        "label": "正在重新制作这一条",
        "meaning": "原版本持续展示，新版完成后重新检查"
       }
      ],
      "behavior": [
       "无 quality 时不显示摘要",
       "repaired 为真显示已完成问题修复；repairType=music 额外显示已降低伴奏音量",
       "系统未检测真实视频；剧情和图文对应仍需人工检查"
      ],
      "copy": "当前为流程演示，未检测真实视频；剧情连贯与图文对应仍需人工检查。",
      "implementation": "workflow-ui.js:qualitySummary；app.js:scheduleGenerated"
     },
     {
      "name": "检查记录",
      "kind": "action",
      "definition": "折叠只读基础检查及问题位置",
      "source": "制作质量检查结果与人工质量问题；原型从演示场景构造，未检测真实视频。",
      "default": "折叠",
      "behavior": "展开显示画面连续性、声音与句子边界、字幕包装及所有质量问题；点击定位设置 playerAt=item.at 并停止播放",
      "implementation": "workflow-ui.js:qualitySummary"
     }
    ],
    "checks": [
     "quality=attention：显示需核对及问题定位；自动通过但未人工确认显示待人工确认。",
     "返工期间优先显示正在重新制作这一条且仍展示原版；无 quality 的旧数据不显示空摘要。"
    ]
   },
   {
    "number": 4,
    "title": "播放、定位与导出",
    "bullets": [
     "播放/拖动/点击片段定位；换成片从0开始，同片换页签保留进度。",
     "“这里有问题”带入起始时间；真实MP4为主交付，JSON/SRT辅助（R-01）。"
    ],
    "anchor": {
     "selector": ".player",
     "index": 0,
     "placement": "left"
    },
    "items": [
     {
      "name": "故事板与来源提示",
      "kind": "text",
      "definition": "虚构画面和文本时间轴示意",
      "source": "当前成片文件、片段时间线与来源时间码；原型以故事板/虚构剧照展示，无真实视频音轨。",
      "behavior": [
       "固定示例封面，标注故事板 · 无真实音轨",
       "按当前时间取 start≤t<end 的片段；总时长端点回退末片段",
       "显示片段 text、来源集数、原片 sourceStart 及 label"
      ],
      "copy": "正式主交付为真实 MP4；本 Demo 只有故事板和辅助 JSON/SRT（R-01）",
      "implementation": "app.js:reviewView/locate"
     },
     {
      "name": "播放／暂停",
      "kind": "action",
      "source": "当前成片文件、片段时间线与来源时间码；原型以故事板/虚构剧照展示，无真实视频音轨。",
      "default": "暂停，按钮 ▶",
      "behavior": "每秒进度加1直至总时长并停止；再次播放总时长端点从0开始；按钮切换 ▶/Ⅱ",
      "implementation": "app.js:play/stopPlayer"
     },
     {
      "name": "故事板进度",
      "kind": "field",
      "source": "当前成片文件、片段时间线与来源时间码；原型以故事板/虚构剧照展示，无真实视频音轨。",
      "default": "新条0；同条换页签保留 playerAt",
      "definition": "范围控件，min=0，max=o.duration，默认步长1秒",
      "behavior": "拖动停止播放并定位；显示分:秒 / 总时长；刷新渲染将超出时长的旧进度截到总时长",
      "implementation": "app.js:reviewView/input scrubber"
     },
     {
      "name": "这里有问题",
      "kind": "action",
      "source": "当前批次成片的内容版本、片段/文案、制作配置与确认/修改/同步记录；原型保存在V7本机状态。",
      "behavior": "停止播放并打开反馈弹窗；将当前 playerAt 带入起始；同步/修复/返工锁时禁用；有草稿时提示先处理",
      "implementation": "app.js:report-issue"
     },
     {
      "name": "包装状态",
      "kind": "text",
      "source": "当前批次成片的内容版本、片段/文案、制作配置与确认/修改/同步记录；原型保存在V7本机状态。",
      "values": [
       {
        "value": "bgm=true/false",
        "label": "BGM 开启／未加配乐",
        "meaning": "沿用本任务配乐开关"
       },
       {
        "value": "full=true/false",
        "label": "原片人声关闭／原片原声保留",
        "meaning": "全解说关闭原片人声，其他结构保留"
       },
       {
        "value": "subtitles=true/false",
        "label": "字幕开启／未加解说字幕或保留原字幕",
        "meaning": "关闭新增字幕时按结构显示"
       },
       {
        "value": "title=true/false",
        "label": "小标题开启／无小标题",
        "meaning": "沿用本任务小标题开关"
       }
      ],
      "definition": "当前包装状态的展示值及含义如下；从对应数据源读取，不是可直接编辑的配置。",
      "implementation": "app.js:reviewView；b.config"
     },
     {
      "name": "辅助文件",
      "kind": "action",
      "definition": "展开导出剪辑方案和示例字幕",
      "source": "当前批次成片的内容版本、片段/文案、制作配置与确认/修改/同步记录；原型保存在V7本机状态。",
      "default": "折叠",
      "behavior": [
       "剪辑方案下载 mixed-cut-v7-任务ID.json，含 demo、notice、片源、配置、规则、分析快照及输出",
       "示例字幕下载 成片ID-Vn-示例.srt，时间和文案来自已保存 segments",
       "有未应用草稿禁导出；不扣费或创建任务"
      ],
      "validation": "空导出列表提示请先选择素材；JSON 有草稿提示先保存或放弃再导出",
      "copy": [
       "故事板方案，非真实视频",
       "字幕时间按故事板示意，不能作为实际口播对齐结果"
      ],
      "implementation": "app.js:exportPlans/export-srt"
     }
    ],
    "checks": [
     "播放到结尾停止，再点播放从0开始；拖动至总时长显示末片段且暂停。",
     "同条换页签保留进度；换条或返回管理归零；反馈起始等于打开时进度。",
     "无草稿下载 JSON/SRT：文件含当前已保存版本及示意标记；有草稿时不下载且提示处理草稿。"
    ]
   },
   {
    "number": 5,
    "title": "选取依据与内容差异",
    "bullets": [
     "默认折叠原片依据及相似项，点击定位；对比仅限同来源/资产/版本/语言（R-04）。"
    ],
    "anchor": {
     "selector": ".content-evidence",
     "index": 0,
     "placement": "left"
    },
    "items": [
     {
      "name": "选取依据与内容差异",
      "kind": "action",
      "definition": "查看只读选材证据和已有成片差异",
      "source": "所选原片的剧情事实/事件和候选来源，以及同源历史成片；原型从虚构事实和规则计算。",
      "default": "折叠",
      "behavior": "展开依据及差异；展开不新增步骤、任务或积分",
      "implementation": "content-ui.js:contentEvidence；content-model.js:evidenceFor"
     },
     {
      "name": "内容标签与依据",
      "kind": "text",
      "source": "所选原片的剧情事实/事件和候选来源，以及同源历史成片；原型从虚构事实和规则计算。",
      "definition": "从片段 fact/evidence 关键词提取并去重，最多3个标签",
      "values": [
       {
        "value": "冲突",
        "label": "冲突",
        "meaning": "质疑、阻止、指控、拒绝、不利、对抗"
       },
       {
        "value": "信息揭露",
        "label": "信息揭露",
        "meaning": "证明、暴露、被替换、发现、找回、记录、证据、秘密"
       },
       {
        "value": "反转",
        "label": "反转",
        "meaning": "恢复、更正、反击、认可、让位、撤回"
       },
       {
        "value": "关系变化",
        "label": "关系变化",
        "meaning": "邀请、支持、合作条件、道歉、工作室、独立"
       },
       {
        "value": "人物情绪",
        "label": "人物情绪",
        "meaning": "不愿、离开、道歉、误会"
       },
       {
        "value": "剧情推进",
        "label": "剧情推进",
        "meaning": "无上述命中时的回退标签"
       }
      ],
      "behavior": [
       "高光显示开场/结尾依据；混合增加解说承接；全解说显示叙述起点、可用时的故事推进和叙述终点",
       "依据取 evidence→fact→text；显示来源集数及区间",
       "定位成片按钮停止播放并定位到该片段 start"
      ],
      "implementation": "content-model.js:contentTags/evidenceFor"
     },
     {
      "name": "相似成片提示",
      "kind": "text",
      "source": "所选原片的剧情事实/事件和候选来源，以及同源历史成片；原型从虚构事实和规则计算。",
      "definition": "同片源 kind、market、资产/合集ID、fileVersion、language 的已有 ready/issue 成片，排除本条",
      "behavior": [
       "只要有相似理由即列入提示，按本批优先再按相似优先级排序，最多3条",
       "理由包括同剧情事件、相同开场、相同结尾、全篇解说相同或原片区间重合≥50%",
       "同事件显示开场/结尾是否相同；允许不同剪法供比较",
       "无提示显示当前没有达到提示条件的相似素材，不代表没有重复风险"
      ],
      "validation": "重复规则：exact，或全篇解说归一化后相同，或同事件＋同开场＋同结尾＋原片重合>60%；提示不自动拒绝成片",
      "implementation": "content-model.js:relatedContent/compareContent；engine.js:assetKey/overlap"
     },
     {
      "name": "对比",
      "kind": "action",
      "source": "当前批次成片的内容版本、片段/文案、制作配置与确认/修改/同步记录；原型保存在V7本机状态。",
      "behavior": "打开当前与选中已有成片的双列对比；停止播放、保留当前成片/进度，无内容改写或扣费",
      "implementation": "app.js:compare-content；content-ui.js:compareContentDialog"
     },
     {
      "name": "依据边界",
      "kind": "text",
      "source": "所选原片的剧情事实/事件和候选来源，以及同源历史成片；原型从虚构事实和规则计算。",
      "copy": "依据与区间来自虚构故事板，不是投放效果预测。",
      "implementation": "content-ui.js:contentEvidence"
     }
    ],
    "checks": [
     "同资产版本与语言、开场相同的 ready 成片出现对比提示；其他资产版本或语言及失败/制作中条目不出现。",
     "相似理由超过3条时本批优先且只显示3条；没有提示显示风险边界文案，不宣称无重复。",
     "点击证据定位更新当前故事板；打开对比不生成任务、不变内容版本、不扣积分。"
    ]
   },
   {
    "number": 6,
    "title": "全文分段编辑",
    "bullets": [
     "逐段改稿并保留草稿；正式应用前校验完整和时长，未应用不得确认/同步（R-06）。"
    ],
    "anchor": {
     "selector": ".full-narration-editor",
     "index": 0,
     "placement": "left"
    },
    "items": [
     {
      "name": "检查页签",
      "kind": "action",
      "source": "当前批次成片的内容版本、片段/文案、制作配置与确认/修改/同步记录；原型保存在V7本机状态。",
      "default": "junction",
      "values": [
       {
        "value": "junction",
        "label": "图文对应",
        "meaning": "全解说逐段图文核对"
       },
       {
        "value": "timeline",
        "label": "完整结构",
        "meaning": "成片顺序时间线"
       },
       {
        "value": "narration",
        "label": "全文与包装",
        "meaning": "按结构显示文案编辑或只读包装"
       }
      ],
      "behavior": "切页签停止播放，保留同条 playerAt 和草稿；不升版、不扣费",
      "implementation": "app.js:review-tab；narration-ui.js:fullNarrationPanel"
     },
     {
      "name": "全解说与目标时长",
      "kind": "text",
      "source": "当前批次成片的内容版本、片段/文案、制作配置与确认/修改/同步记录；原型保存在V7本机状态。",
      "definition": "全解说标识、制作配置的成片目标时长区间与当前故事板总时长",
      "behavior": "目标时长与故事板时长分别显示；无 segments 时提示暂无解说片段／请返回内容方案重新整理。",
      "implementation": "narration-ui.js:fullNarrationPanel；creation-ui.js:durationLabel；b.config.duration/o.duration"
     },
     {
      "name": "已保存字数与段数",
      "kind": "text",
      "source": "当前批次成片的内容版本、片段/文案、制作配置与确认/修改/同步记录；原型保存在V7本机状态。",
      "definition": "累计已保存 segments.text 去全部空白后的 Unicode 字符数；段数=segments.length",
      "behavior": "显示已保存X字 · Y段；不随未保存草稿字数变化",
      "implementation": "narration-ui.js:fullNarrationPanel"
     },
     {
      "name": "第n段解说文案",
      "kind": "field",
      "source": "当前批次成片的内容版本、片段/文案、制作配置与确认/修改/同步记录；原型保存在V7本机状态。",
      "default": "对应 narrationDraft[n] 优先，否则 segments[n].text",
      "definition": "每段独立textarea，无maxlength；行数 min(10,max(4,ceil(已保存字数/32)))",
      "behavior": "段标题/时间及画面来源只读；无锁可编辑；锁为同步、修复、返工；输入形成整组草稿，不即时改已保存段文本",
      "implementation": "narration-ui.js:fullNarrationPanel；app.js:input data-full-narration"
     },
     {
      "name": "未保存文案提示与草稿",
      "kind": "status",
      "source": "当前批次成片的内容版本、片段/文案、制作配置与确认/修改/同步记录；原型保存在V7本机状态。",
      "default": "输入值与已保存原文不同才创建 narrationDraft；没有差异不显示提示",
      "behavior": [
       "草稿按原始输入比较，含空格差异；本机保存到输出，跨页签/成片保留",
       "出现文案修改尚未保存，查看并保存切 narration；放弃修改删除草稿并恢复已保存文本",
       "有草稿禁止确认、同步、试听、反馈、修复、返工和辅助文件导出",
       "演示实际：草稿输入本身不升版、不生成媒体；产品要求：正式保存草稿不升媒体版本，需应用修改后重制成功才升版（R-06）"
      ],
      "copy": [
       "文案修改尚未保存。",
       "已恢复保存的文案",
       "请先保存或放弃文案修改"
      ],
      "implementation": "app.js:input narrationEdit/data-full-narration；reviewView"
     }
    ],
    "checks": [
     "修改第2段：整组草稿保留未改段原文，已保存字数维持原值；切页签/条目后回来仍是草稿。",
     "全部输入恢复原始内容：删除草稿并隐藏提示；同步/修复/返工时所有段文本框禁用。",
     "产品要求：未应用草稿不得确认/同步，应用前须校验每段完整、整体时长、事实与画面；Demo未执行真实配音时长校验。"
    ]
   },
   {
    "number": 7,
    "title": "保存、试听与包装",
    "bullets": [
     "正式保存只暂存；应用成功才重配音/合成并升版，Demo保存模拟应用。",
     "试听按任务语速；BGM避让口播，解说字幕与人声对齐（R-05）。"
    ],
    "anchor": {
     "selector": ".full-narration-actions",
     "index": 0,
     "placement": "left"
    },
    "items": [
     {
      "name": "保存全文",
      "kind": "action",
      "source": "当前批次成片的内容版本、片段/文案、制作配置与确认/修改/同步记录；原型保存在V7本机状态。",
      "behavior": [
       "演示实际：逐段trim后有变化，写全部段文本并以双换行合并 narrationText；清草稿，narrationTimingDirty=true，版本+1并撤销确认",
       "演示实际：只移除发生文案变化段的 narration 类型质量问题，其他问题保留，按剩余问题设issue/ready；不生成真实音频/视频或改段时长",
       "产品要求：正式保存只暂存草稿不升媒体版本；应用修改通过校验且配音/字幕/画面重制成功才升版，失败保留旧版本（R-06）"
      ],
      "validation": [
       "任何段trim为空：每段解说都需要完整文案，不保存、不升版",
       "全部段trim后相同：清草稿并提示文案没有变化，不升版",
       "同步、修复或返工锁禁保存"
      ],
      "copy": [
       "每段解说都需要完整文案",
       "文案没有变化",
       "全文已保存到故事板，配音时长需重新检查"
      ],
      "implementation": "app.js:save-full-narration；engine.js:revise；app.js:updateQualityBaselineText"
     },
     {
      "name": "试听全文",
      "kind": "action",
      "definition": "浏览器播放已保存文案的语音示例",
      "source": "当前批次成片的内容版本、片段/文案、制作配置与确认/修改/同步记录；原型保存在V7本机状态。",
      "behavior": [
       "播放 o.narrationText，不读未保存草稿；先取消既有浏览器语音",
       "rate=b.config.narrationSpeed 或1；language=en 用 en-US，其他用 zh-CN",
       "有草稿先保存/放弃；支持时不生成生产配音或扣费"
      ],
      "validation": "无 speechSynthesis 时提示当前浏览器不支持试听",
      "copy": [
       "试听已保存文案 · 浏览器音色示例",
       "浏览器语音示例，不代表生产音色"
      ],
      "implementation": "app.js:speak"
     },
     {
      "name": "人声与配乐",
      "kind": "text",
      "source": "当前批次成片的内容版本、片段/文案、制作配置与确认/修改/同步记录；原型保存在V7本机状态。",
      "behavior": "解说为主要人声、原片人声关闭；BGM开启显示按叙事情绪编排并避让解说，关闭显示当前未添加BGM",
      "copy": "混音方案示意",
      "implementation": "narration-ui.js:fullNarrationPanel；app.js:reviewView；b.config.bgm"
     },
     {
      "name": "字幕与小标题",
      "kind": "text",
      "source": "当前批次成片的内容版本、片段/文案、制作配置与确认/修改/同步记录；原型保存在V7本机状态。",
      "behavior": "字幕开启显示按全篇解说生成，需实际配音后对齐；关闭显示当前未开启新增解说字幕；小标题开启显示避开字幕区，关闭显示不添加小标题；均为只读，不在预览改开关（R-05）",
      "implementation": "narration-ui.js:fullNarrationPanel；app.js:reviewView；b.config.subtitles/title"
     }
    ],
    "checks": [
     "演示：改1段保存，版本+1并撤销确认；仅该段narration问题消失，其他类型/其他段问题保留。",
     "任一段为空：所有已保存段保持原文，版本不变、草稿保留；完全无变化保存不升版。",
     "试听使用保存后的完整narrationText及任务语速；有草稿被拦截；包装文案随原任务开关显示。",
     "产品要求：草稿保存不生成媒体，应用成功后重新验配音/字幕/画面并确认；Demo的narrationTimingDirty不代表已经重制成功。"
    ]
   },
   {
    "number": 8,
    "title": "检查清单、问题与修复",
    "bullets": [
     "质量问题阻止交付，创作调整可确认采用或报价重做；范围与费用见 R-07。",
     "记录不改媒体、不升版；实际修复成功升版，失败保留旧片（R-06）。"
    ],
    "anchor": {
     "selector": ".issue-section",
     "index": 0,
     "placement": "left"
    },
    "items": [
     {
      "name": "检查清单",
      "kind": "text",
      "source": "当前批次成片的内容版本、片段/文案、制作配置与确认/修改/同步记录；原型保存在V7本机状态。",
      "definition": "只读检查重点，非多选表单",
      "behavior": [
       "全解说：解说完整（全文与逐段配音边界）、图文对应（文案事实与画面一致）",
       "共用音乐与字幕（不压人声、不遮对白）、画面异常（黑屏、卡帧）"
      ],
      "implementation": "app.js:reviewView"
     },
     {
      "name": "反馈问题",
      "kind": "action",
      "source": "当前批次成片的内容版本、片段/文案、制作配置与确认/修改/同步记录；原型保存在V7本机状态。",
      "behavior": "与左侧这里有问题同入口；无同步/修复/返工锁、无草稿时打开 issue-full",
      "implementation": "app.js:report-issue；feedback-ui.js:feedbackForm"
     },
     {
      "name": "反馈记录",
      "kind": "text",
      "source": "当前批次成片的内容版本、片段/文案、制作配置与确认/修改/同步记录；原型保存在V7本机状态。",
      "definition": "展示全部 o.issues 质量记录及仅当前 contentVersion 的 preferences 创作建议",
      "behavior": [
       "显示类型、质量/创作分类、整条或起止时间、非空补充说明",
       "局部无结束显示 起；整条显示整条素材",
       "质量记录状态 issue 阻确认；创作建议不变 ready，但撤销已有确认后可人工采用当前版"
      ],
      "implementation": "feedback-ui.js:feedbackItems；feedback-model.js:currentPreferences/issueRangeLabel"
     },
     {
      "name": "定位",
      "kind": "action",
      "source": "当前批次成片的内容版本、片段/文案、制作配置与确认/修改/同步记录；原型保存在V7本机状态。",
      "behavior": "定位 item.at 并停止播放；整条定位0；处理锁下仍可用于查看",
      "implementation": "feedback-ui.js:feedbackItems；app.js:quality-locate"
     },
     {
      "name": "局部修复／整条修复",
      "kind": "action",
      "source": "当前批次成片的内容版本、片段/文案、制作配置与确认/修改/同步记录；原型保存在V7本机状态。",
      "behavior": [
       "质量 scope=all 或自动 continuity 类型显示整条修复并打开免费返工；其他显示局部修复",
       "同步/修复/返工锁禁用；草稿先处理",
       "Demo 局部修复900ms后移除该问题、按剩余问题设 issue/ready、revise 升版及清确认，免费并记录 remedy",
       "Demo 没有真实画面/音频修复；正式实际修复成功才升媒体版本，失败保留原片（R-06/R-07）"
      ],
      "implementation": "feedback-ui.js:feedbackItems；app.js:repair/openRework"
     },
     {
      "name": "调整这一条",
      "kind": "action",
      "source": "当前批次成片的内容版本、片段/文案、制作配置与确认/修改/同步记录；原型保存在V7本机状态。",
      "behavior": "创作建议打开付费返工，预填其 direction/reason/detail；opening→opening，其他多数→angle；锁与草稿限制同返工",
      "implementation": "feedback-ui.js:feedbackItems；app.js:openRework"
     },
     {
      "name": "版本修改记录",
      "kind": "action",
      "source": "当前批次成片的内容版本、片段/文案、制作配置与确认/修改/同步记录；原型保存在V7本机状态。",
      "default": "折叠；无 revisions 不显示",
      "behavior": "展开当前及既往 Vn、description；实际反馈记录不升版，Demo保存/修复/返工成功才记修改",
      "implementation": "app.js:reviewView；o.revisions"
     }
    ],
    "checks": [
     "记录质量问题后出现类型/范围/说明，状态需处理，确认禁用；记录创作建议后显示创作调整，当前仍可人工重新确认。",
     "局部质量点击免费修复：仅删除该问题，其他问题保留，版本+1并撤销确认；Demo仅状态模拟，不能验收真实媒体修复。",
     "scope=all 或 continuity 点击整条修复走返工；锁定期间修复/调整禁用而定位仍可查看。"
    ]
   },
   {
    "number": 9,
    "title": "版本交付状态",
    "bullets": [
     "仅当前已确认版本可同步；成功版本不重复上传，旧回执保留，新版另行确认（R-09）。"
    ],
    "anchor": {
     "selector": ".sync-review-notice, .review-queue",
     "index": 0,
     "placement": "left"
    },
    "items": [
     {
      "name": "当前版本交付摘要",
      "kind": "status",
      "source": "当前批次成片的内容版本、片段/文案、制作配置与确认/修改/同步记录；原型保存在V7本机状态。",
      "definition": "当前成片版本和对应同步状态；仅有历史同步任务才显示 notice",
      "values": [
       {
        "value": "none",
        "label": "待确认／待同步",
        "meaning": "无当前版本同步记录；已确认显示待同步"
       },
       {
        "value": "pending",
        "label": "等待同步",
        "meaning": "当前版本请求已创建，锁内容和确认"
       },
       {
        "value": "processing",
        "label": "同步中",
        "meaning": "当前版本传输进行中，锁内容和确认"
       },
       {
        "value": "unknown",
        "label": "待核实结果",
        "meaning": "结果不明确，先查询，禁重复上传和内容修改"
       },
       {
        "value": "success",
        "label": "已同步",
        "meaning": "当前版本成功，禁重复上传"
       },
       {
        "value": "failed",
        "label": "同步失败",
        "meaning": "明确失败，允许按原记录重试"
       }
      ],
      "behavior": "显示目标系统及记录版本；旧成功版本不能代表新版本已同步",
      "implementation": "sync-ui.js:reviewNotice/badgeFor；sync-model.js:getOutputSync/outputVersion"
     },
     {
      "name": "同步到素材管理",
      "kind": "action",
      "source": "当前批次成片的内容版本、片段/文案、制作配置与确认/修改/同步记录；原型保存在V7本机状态。",
      "behavior": "仅 confirmed、ready、无草稿/返工/修复且当前版本无 pending/processing/unknown/success 时可用；打开上传信息，不直接上传",
      "validation": "成功版本不可重传；unknown 先查询；确认必须对应当前版本",
      "implementation": "app.js:reviewView；sync-ui.js:reviewActions/canSync/open"
     },
     {
      "name": "同步记录",
      "kind": "action",
      "source": "当前批次成片的内容版本、片段/文案、制作配置与确认/修改/同步记录；原型保存在V7本机状态。",
      "behavior": "有历史任务时可看按提交时版本保留的同步记录；不改内容或扣费",
      "implementation": "sync-ui.js:reviewActions/records"
     },
     {
      "name": "旧版保留提示",
      "kind": "text",
      "source": "当前批次成片的内容版本、片段/文案、制作配置与确认/修改/同步记录；原型保存在V7本机状态。",
      "behavior": "存在任意旧成功记录时显示已同步版本保留提示；新版变更或取消确认不能自动覆盖、撤回旧素材",
      "copy": "已同步版本保留在素材管理中。此处修改、退款或取消确认不会自动替换或撤回旧素材。（R-09）",
      "implementation": "sync-ui.js:reviewNotice"
     }
    ],
    "checks": [
     "当前V1同步成功：显示已同步且同步按钮禁用；V2产生后需重新确认，旧V1记录保留。",
     "当前版本为pending/processing/unknown：返工、编辑、反馈和确认禁用，查询/查看记录可用；明确失败可按记录重试。"
    ]
   }
  ]
 },
 "platform-points": {
  "title": "积分明细",
  "page": "平台积分与制作计费",
  "background": "",
  "need": "在平台积分入口核对余额和消费记录，制作报价与结算继续可追溯。",
  "sections": [
   {
    "number": 1,
    "title": "平台积分概览",
    "bullets": [
     "查看主平台可用积分、冻结及消费；不新建混剪钱包。"
    ],
    "anchor": {
     "selector": ".platform-balance-summary",
     "index": 0,
     "placement": "left"
    },
    "items": [
     {
      "name": "可用积分",
      "kind": "text",
      "definition": "当前可继续提交的积分余额，冻结时已经从可用额扣除。",
      "source": "主平台账户余额/费率及本任务分析、制作、返工、冻结/结算/释放/退款记录；原型读取V7本机演示流水。",
      "default": "无记录/损坏或无效余额时10000演示积分；正常沿用已有非负有限余额。",
      "behavior": "同源共享记录更新及窗口聚焦刷新；明细打开时快照变化重绘。正式接主平台余额，不另建混剪钱包。",
      "implementation": "platform-context.js读取本机共用演示记录"
     },
     {
      "name": "冻结积分",
      "kind": "text",
      "definition": "当前批次尚未结算或释放的制作/创作重做额度合计。",
      "source": "主平台账户余额/费率及本任务分析、制作、返工、冻结/结算/释放/退款记录；原型读取V7本机演示流水。",
      "default": "无任务0。",
      "behavior": "开工时增加；成功从冻结结算，失败/取消释放并加回可用余额；不把冻结额当最终已扣消费（R-08）。",
      "implementation": "所有演示批次的非负冻结费用之和"
     },
     {
      "name": "混剪已结算",
      "kind": "text",
      "definition": "混剪制作成功与有效新增分析的已结算消费汇总。",
      "source": "主平台账户余额/费率及本任务分析、制作、返工、冻结/结算/释放/退款记录；原型读取V7本机演示流水。",
      "default": "0。",
      "behavior": "演示实际按该累计公式，不从此卡展示平均单价，不代表主平台其他工具全部消费；当前公式未减退款。产品要求退款与净扣除可核对，净费用口径见R-08，正式平台账本应提供一致结果。",
      "implementation": "所有批次制作费用（含成功创作重做）＋「新增剧集分析」负流水绝对值"
     },
     {
      "name": "平台账户共用积分 · 当前为演示数据",
      "kind": "text",
      "definition": "余额及流水的演示边界声明。",
      "source": "主平台账户余额/费率及本任务分析、制作、返工、冻结/结算/释放/退款记录；原型读取V7本机演示流水。",
      "copy": "平台账户共用积分 · 当前为演示数据",
      "implementation": "platform-shell.js showPoints"
     },
     {
      "name": "关闭 / 右上角关闭",
      "kind": "action",
      "definition": "退出积分明细。",
      "source": "主平台账户余额/费率及本任务分析、制作、返工、冻结/结算/释放/退款记录；原型读取V7本机演示流水。",
      "behavior": "只读退出，不改余额、费用或任务。",
      "implementation": "通用关闭动作"
     }
    ],
    "checks": [
     "初始可用10000、冻结0、已结算0；开工冻结制作额时可用下降但已结算尚不增加。",
     "制作成功冻结减少、已结算增加，可用余额不会第二次下降；失败冻结减少、可用回升。",
     "分析成功扣20积分后已结算增加20；全部复用时不增加。",
     "新页记录变化使打开的积分明细更新；关闭明细不改变任何账务。"
    ]
   },
   {
    "number": 2,
    "title": "积分流水",
    "bullets": [
     "分析/制作/返工流水可核对，冻结结算不重复扣余额，释放与退款分开（R-08）。"
    ],
    "anchor": {
     "selector": ".platform-ledger-table",
     "index": 0,
     "placement": "left"
    },
    "items": [
     {
      "name": "时间",
      "kind": "text",
      "definition": "每条流水的发生时间。",
      "source": "主平台账户余额/费率及本任务分析、制作、返工、冻结/结算/释放/退款记录；原型读取V7本机演示流水。",
      "behavior": "只读；当前展示最新30条，记录按演示写入顺序新记录在前，无筛选、分页或导出入口。",
      "implementation": "流水记录时间戳，按浏览器zh-CN本地日期时间格式显示"
     },
     {
      "name": "功能 / 项目",
      "kind": "text",
      "definition": "固定功能「智能混剪」及流水类型。",
      "source": "主平台账户余额/费率及本任务分析、制作、返工、冻结/结算/释放/退款记录；原型读取V7本机演示流水。",
      "values": [
       {
        "value": "analysis",
        "label": "新增剧集分析",
        "meaning": "有效新增分析完成后实际扣除"
       },
       {
        "value": "freeze",
        "label": "冻结制作额度",
        "meaning": "首次制作开工预扣可用额、进入冻结"
       },
       {
        "value": "settled",
        "label": "制作已结算（从冻结扣除）",
        "meaning": "成功制作从冻结确认消费，不再次扣可用额"
       },
       {
        "value": "release",
        "label": "生成失败 · 释放额度",
        "meaning": "未成功生成释放冻结并恢复可用额"
       },
       {
        "value": "retry",
        "label": "补生成冻结",
        "meaning": "失败项补生成开工再次冻结该条额"
       },
       {
        "value": "creative-freeze",
        "label": "创作重做 · 冻结制作额度",
        "meaning": "收费创作重做开始冻结"
       },
       {
        "value": "creative-release",
        "label": "重做失败 · 释放额度",
        "meaning": "收费重做失败释放"
       },
       {
        "value": "creative-settled",
        "label": "创作重做已结算（从冻结扣除）",
        "meaning": "收费重做成功从冻结结算"
       }
      ],
      "behavior": "以上为当前源码可产生的显示类型；没有退款专用演示流水，正式退款不能混写释放。取消未完成输出在演示复用生成失败释放类型，正式应可追溯实际原因。",
      "implementation": "本机积分流水"
     },
     {
      "name": "积分变化",
      "kind": "text",
      "definition": "流水对可用余额的本次数值变化。",
      "source": "主平台账户余额/费率及本任务分析、制作、返工、冻结/结算/释放/退款记录；原型读取V7本机演示流水。",
      "behavior": "负数表示分析扣费或冻结减少可用额，正数加「+」表示释放恢复可用额；结算从冻结扣除显示0，而结算金额在说明列，不重复扣可用余额。",
      "implementation": "流水积分变化值"
     },
     {
      "name": "说明",
      "kind": "text",
      "definition": "结算额或关联批次标识。",
      "source": "主平台账户余额/费率及本任务分析、制作、返工、冻结/结算/释放/退款记录；原型读取V7本机演示流水。",
      "behavior": "只读用于核对，演示不展示真实平台交易号、扣费主体或退款明细；正式要求分析/制作/返工可追溯并防重复结算（R-08）。",
      "implementation": "有结算额时显示「从冻结额度结算 X 积分」；否则批次标识，未关联批次回退「剧集分析」"
     },
     {
      "name": "暂无消费记录",
      "kind": "status",
      "definition": "无有效流水时整行空态。",
      "source": "主平台账户余额/费率及本任务分析、制作、返工、冻结/结算/释放/退款记录；原型读取V7本机演示流水。",
      "behavior": "不代表余额为0；初始演示余额仍10000。",
      "implementation": "当前流水记录为空"
     }
    ],
    "checks": [
     "无记录显示暂无消费记录；有记录显示时间、智能混剪/类型、积分变化、说明四列。",
     "冻结流水显示负制作额；结算流水积分变化0且说明列有结算金额；释放流水正数带+。",
     "创作重做的冻结、结算或失败释放能在本入口核对；免费质量修复没有新增消费。",
     "超过30条只显示最近30条，不能把界面截断当账务记录已被删除。"
    ]
   }
  ]
 },
 "platform-account": {
  "title": "账户信息",
  "page": "平台入口与账户",
  "background": "",
  "need": "统一展示账户信息，不要求剪辑再次注册或登录。",
  "sections": [
   {
    "number": 1,
    "title": "当前平台账户",
    "bullets": [
     "沿用主平台身份、角色和数据范围；账户管理由平台提供（R-09）。"
    ],
    "anchor": {
     "selector": ".platform-account-info",
     "index": 0,
     "placement": "left"
    },
    "items": [
     {
      "name": "平台账户",
      "kind": "text",
      "definition": "当前平台用户身份名称，只读。",
      "source": "容量万相主平台工具目录、账户身份与权限；原型展示示例身份，未接真实鉴权接口。",
      "default": "陈剪辑。",
      "behavior": "制作页与工具箱共用身份，无混剪独立注册或登录；正式身份接主平台（R-09）。",
      "implementation": "platform-context.js固定演示账户"
     },
     {
      "name": "所属团队",
      "kind": "text",
      "definition": "当前账户所属团队，只读。",
      "source": "容量万相主平台工具目录、账户身份与权限；原型展示示例身份，未接真实鉴权接口。",
      "default": "内容创作团队。",
      "behavior": "当前原型未展示真实角色、资产权限或扣费主体，不以示例团队名推断权限。产品要求沿用并校验主平台角色与数据范围。",
      "implementation": "platform-context.js固定演示账户"
     },
     {
      "name": "当前工具",
      "kind": "text",
      "definition": "说明打开账户弹窗的工作区。",
      "source": "容量万相主平台工具目录、账户身份与权限；原型展示示例身份，未接真实鉴权接口。",
      "values": [
       {
        "value": "toolbox",
        "label": "工具箱",
        "meaning": "从工具箱页的账户入口打开"
       },
       {
        "value": "mixed-cut",
        "label": "智能混剪",
        "meaning": "从混剪工作区的账户入口打开"
       }
      ],
      "behavior": "仅工作区名称变化，账户与团队不变化。",
      "implementation": "platform-shell.js是否工具箱页面"
     },
     {
      "name": "账户继承说明",
      "kind": "text",
      "definition": "只读声明沿用平台账户、目前使用演示账号。",
      "source": "容量万相主平台工具目录、账户身份与权限；原型展示示例身份，未接真实鉴权接口。",
      "copy": "沿用容量万相账户 · 当前为演示账号",
      "implementation": "platform-shell.js账户弹窗"
     },
     {
      "name": "关闭 / 右上角关闭",
      "kind": "action",
      "definition": "退出只读账户弹窗。",
      "source": "容量万相主平台工具目录、账户身份与权限；原型展示示例身份，未接真实鉴权接口。",
      "behavior": "不切换身份、不退出登录、不修改团队或数据；实际账户管理由主平台提供。",
      "implementation": "通用关闭动作"
     }
    ],
    "checks": [
     "工具箱和混剪分别打开账户，用户名与团队相同，当前工具分别为工具箱/智能混剪。",
     "弹窗不存在编辑、注册、充值等新账号流程；关闭不影响现有配置与任务。",
     "正式权限验收按主平台角色和片源范围执行，固定演示账户不能证明权限通过。"
    ]
   }
  ]
 },
 "source-picker": {
  "title": "选择合集",
  "page": "片源与选集",
  "background": "",
  "need": "国内、海外合集和本地上传入口放在同一行",
  "sections": [
   {
    "number": 1,
    "title": "片源入口",
    "bullets": [
     "国内/海外切换各自数据源，清空弹窗搜索和选择；本地上传打开导入。"
    ],
    "anchor": {
     "selector": "#dialogBody > .pills",
     "index": 0,
     "placement": "left"
    },
    "items": [
     {
      "name": "国内短剧 / 海外短剧",
      "kind": "field",
      "definition": "并列来源按钮，单选当前要查询的绿台。",
      "source": "固定片源分类枚举，分别对应国内绿台和海外绿台的合集列表；原型以两组示例合集模拟。",
      "default": "打开时沿用当前片源市场；未知手动片源默认国内。",
      "values": [
       {
        "value": "domestic",
        "label": "国内短剧",
        "meaning": "仅加载国内绿台合集；同步路由为国内系统"
       },
       {
        "value": "overseas",
        "label": "海外短剧",
        "meaning": "仅加载海外绿台合集；同步路由为海外系统"
       }
      ],
      "behavior": "切换清空弹窗搜索词与已选合集，保留制作页原片源直至确认；即使两来源存在相同合集ID也独立处理。",
      "implementation": "sources.js：两套独立虚构合集目录；未调用真实接口"
     },
     {
      "name": "本地上传",
      "kind": "action",
      "definition": "与国内/海外并列的文件导入入口。",
      "source": "用户本机视频文件；正式导入通过上传资产服务创建片源（R-01）。",
      "behavior": "替换选择合集弹窗为本地文件选择；不自动确认当前暂选合集，未写回制作页配置。演示实际仅本机预览；产品要求按R-01支持按剧目批量导入。",
      "implementation": "app.js upload"
     }
    ],
    "checks": [
     "从国内暂选另一合集并输入搜索词，再切海外，搜索清空、无选中合集、提交按钮禁用，制作页原配置仍保留。",
     "国内/海外同ID分别展示各自剧名及可用集数，不混合搜索结果。",
     "点本地上传进入文件选择，并未自动应用弹窗草稿合集。"
    ]
   },
   {
    "number": 2,
    "title": "搜索合集",
    "bullets": [
     "按当前来源的名称/合集ID搜索，不跨数据源。"
    ],
    "anchor": {
     "selector": "#collectionSearch",
     "index": 0,
     "placement": "left"
    },
    "items": [
     {
      "name": "搜索合集",
      "kind": "field",
      "definition": "单行文本搜索；仅过滤当前来源的合集。",
      "source": "当前国内或海外绿台的合集元数据（合集ID、名称、可用/总集数）；原型为示例列表，真实接口地址待对接。",
      "default": "每次打开或切来源时空值。",
      "behavior": "输入立即刷新列表，去首尾空格、忽略大小写做包含匹配。演示实际同时匹配名称、介绍和合集ID；产品文档明确名称/ID可搜，是否保留介绍匹配由实现对齐。搜索不清空已有暂选合集，暂选项即使被过滤隐藏仍可确认。",
      "validation": "无最小长度/最大长度或精确ID限制；空词展示当前来源全部合集。",
      "copy": "搜索合集名称或 ID",
      "implementation": "sources.js listCollections"
     },
     {
      "name": "没有找到合集",
      "kind": "status",
      "definition": "当前来源和搜索词下无结果的列表空态。",
      "source": "当前国内或海外绿台的合集元数据（合集ID、名称、可用/总集数）；原型为示例列表，真实接口地址待对接。",
      "behavior": "仅表示当前搜索无匹配，不代表真实绿台无合集；清空词恢复列表。无暂选合集时提交禁用，已有暂选仍保留。",
      "implementation": "本次搜索结果"
     }
    ],
    "checks": [
     "国内搜collection-003仅得到国内第三合集；海外同ID不会混入。",
     "搜索前后空格及英文字母大小写不影响包含匹配。",
     "搜索介绍中的「职场成长」当前演示可匹配；空词恢复所有三项。",
     "先选合集再输入无匹配词，列表为空但配置框及提交仍保留暂选；取消不会写回。"
    ]
   },
   {
    "number": 3,
    "title": "合集列表",
    "bullets": [
     "剧名、合集ID、可用/总集数及选中状态。"
    ],
    "anchor": {
     "selector": ".collection-list",
     "index": 0,
     "placement": "left"
    },
    "items": [
     {
      "name": "合集卡片",
      "kind": "field",
      "definition": "列表卡片单选；当前来源内的一个剧目合集。",
      "source": "当前国内或海外绿台的合集元数据（合集ID、名称、可用/总集数）；原型为示例列表，真实接口地址待对接。",
      "default": "当前片源为绿台时初始暂选该合集；切来源后无选中。",
      "values": [
       {
        "value": "domestic:collection-001",
        "label": "重逢时，她已是王牌（虚构示例）",
        "meaning": "国内；总30、可用30，所有集可用"
       },
       {
        "value": "domestic:collection-002",
        "label": "她的第二次选择（虚构示例）",
        "meaning": "国内；总40、可用30，第31–40集未准备"
       },
       {
        "value": "domestic:collection-003",
        "label": "签约前的秘密（虚构示例）",
        "meaning": "国内；总8、可用7，第4集不可用"
       },
       {
        "value": "overseas:collection-001",
        "label": "归来后的新身份（虚构示例）",
        "meaning": "海外；总30、可用30，所有集可用"
       },
       {
        "value": "overseas:collection-002",
        "label": "最后一页合约（虚构示例）",
        "meaning": "海外；总40、可用30，第31–40集未准备"
       },
       {
        "value": "overseas:collection-003",
        "label": "再次相遇之前（虚构示例）",
        "meaning": "海外；总18、可用0，片源准备中"
       }
      ],
      "behavior": "点击仅暂选并高亮；重置弹窗选集为1至min(30,总集数)，即使点当前合集也会重置。卡片可选但不能保证其所有集可用。",
      "implementation": "sources.js虚构目录"
     },
     {
      "name": "剧名、合集ID、可用/总集数、封面",
      "kind": "text",
      "definition": "合集卡片只读字段；可用为已准备片源数量，总数为剧目总集数。",
      "source": "当前国内或海外绿台的合集元数据（合集ID、名称、可用/总集数）；原型为示例列表，真实接口地址待对接。",
      "behavior": "显示「合集ID · 可用 X / Y 集」；统一示例封面，不是已读取真实剧集缩略图。总集数不等于全部可以提交。",
      "implementation": "当前来源的目录记录"
     }
    ],
    "checks": [
     "点击国内40集合集默认1–30集，卡片显示可用30/40；选第31集仍被提交校验拦截。",
     "国内8集合集默认1–8集但第4集缺失，因此默认范围仍不允许提交。",
     "海外无可用集合集仍可暂选、显示0/18；任何范围提交均提示缺片源。",
     "重新点已选合集会恢复1至min(30,总集数)，不会保留刚输入的自定义范围。"
    ]
   },
   {
    "number": 4,
    "title": "配置混剪集数",
    "bullets": [
     "起止有效、不缺集；支持前10/20/30集，未选合集不能提交。"
    ],
    "anchor": {
     "selector": ".source-picker > .subtle-box",
     "index": 0,
     "placement": "left"
    },
    "items": [
     {
      "name": "配置混剪集数与介绍",
      "kind": "text",
      "definition": "已选合集出现集数配置与该合集说明；未选只提示先选择。",
      "source": "用户选中的合集、本次起止集数及该合集的可用/缺失集列表。",
      "behavior": "未选隐藏集数输入与快捷项，提示国内/海外分别读各自来源；已选展示缺集/准备状态说明。",
      "copy": [
       "先选择一个合集",
       "未准备和缺失的剧集不能提交。"
      ],
      "implementation": "暂选合集"
     },
     {
      "name": "起始集数 / 结束集数",
      "kind": "field",
      "definition": "两项数值输入；暂选合集的连续取材范围，包含首尾。",
      "source": "用户选中的合集、本次起止集数及该合集的可用/缺失集列表。",
      "default": "选新合集时1至min(30,总集数)。",
      "behavior": "弹窗输入不写回制作页；点使用时读取两项最终值。",
      "validation": "必填正整数，起始≤结束，结束≤当前合集总集数，所选范围内每一集可用。验证仅针对片源/选集，不被制作页尚未选AI结构或标题空值影响。",
      "implementation": "弹窗独立草稿；打开复制当前配置，选新合集重置"
     },
     {
      "name": "前10集 / 前20集 / 前30集",
      "kind": "action",
      "definition": "弹窗选集快捷项。",
      "source": "用户选中的合集、本次起止集数及该合集的可用/缺失集列表。",
      "values": [
       {
        "value": 10,
        "label": "前10集",
        "meaning": "第1–10集"
       },
       {
        "value": 20,
        "label": "前20集",
        "meaning": "第1–20集"
       },
       {
        "value": 30,
        "label": "前30集",
        "meaning": "第1–30集"
       }
      ],
      "behavior": "只更新弹窗草稿，不自动按合集总数截短；确认时继续校验越界与缺集。",
      "implementation": "固定三个快捷值"
     }
    ],
    "checks": [
     "起始2、结束3在有片源的合集确认通过并带回2–3集。",
     "空值、0、小数、起始大于结束、越界、缺集均不关闭弹窗且显示对应提示。",
     "制作页AI结构未选时，合法合集/选集仍可使用；回制作页后AI结构错误仍待补齐。",
     "短合集点前20集后提交越界被拦截，不静默改为总集数。"
    ]
   },
   {
    "number": 5,
    "title": "确认与取消",
    "bullets": [
     "使用后带入合集/集数；取消保留原配置，绿台来源决定同步路由。"
    ],
    "anchor": {
     "selector": "#dialogActions",
     "index": 0,
     "placement": "left"
    },
    "items": [
     {
      "name": "取消 / 右上角关闭",
      "kind": "action",
      "definition": "关闭弹窗并放弃本次暂选来源、合集、搜索与选集。",
      "source": "用户选中的合集、本次起止集数及该合集的可用/缺失集列表。",
      "behavior": "制作页原片源、集数及其他配置不变，不分析、不扣费；再打开重新由制作页配置初始化。",
      "implementation": "app.js closeModal"
     },
     {
      "name": "使用合集与选集",
      "kind": "action",
      "definition": "确认暂选绿台来源、合集与起止集数，写回制作配置。",
      "source": "当前国内或海外绿台的合集元数据（合集ID、名称、可用/总集数）；原型为示例列表，真实接口地址待对接。",
      "default": "未选合集禁用；暂选后可点击，校验失败仍停留弹窗。",
      "behavior": "成功写回来源、合集、原片V1及选集；清除本地预览拦截状态，并按来源决定后续同步系统。保留条数、方式、包装等其他配置。由制作页打开时回制作；由剧目管理/详情打开时进入对应剧目任务页。",
      "validation": "确认前重新校验合集存在、整数边界与缺集；源失效提示重新选择。",
      "copy": [
       "片源已失效，请重新选择合集",
       "请填写有效的起止集数",
       "所选第 X 集暂无片源，请调整范围"
      ],
      "implementation": "app.js apply-source"
     }
    ],
    "checks": [
     "暂选海外合集后取消，原国内配置及报价保持，分析缓存和余额不变。",
     "未选合集提交按钮禁用；缺集提交弹窗保留且不改制作页。",
     "成功确认海外合集后标签为海外短剧、原片V1，交付按海外路由。",
     "成功使用绿台合集解除本地预览拦截；相同合集再次确认也恢复原片V1。"
    ]
   }
  ]
 },
 "upload": {
  "title": "导入本地原片",
  "page": "片源与选集",
  "background": "",
  "need": "弹窗只展示导入引导、文件选择与关闭操作",
  "sections": [
   {
    "number": 1,
    "title": "选择本地视频",
    "bullets": [
     "按剧目导入并核对集数（R-01）；当前演示只作本机预览。"
    ],
    "anchor": {
     "selector": "#localFile",
     "index": 0,
     "placement": "left"
    },
    "items": [
     {
      "name": "导入引导",
      "kind": "text",
      "definition": "提示选择需要导入的原片视频。",
      "source": "用户通过本机文件选择器选中的视频；当前演示只读本地文件，不调用上传服务或真实视频分析。正式批量导入见R-01。",
      "copy": "请选择需要导入的原片视频。",
      "behavior": "产品引导只描述导入操作；演示实际与正式能力差异在需求说明标注。",
      "implementation": "app.js upload"
     },
     {
      "name": "选择原片视频",
      "kind": "field",
      "definition": "本地文件选择控件。",
      "source": "用户通过本机文件选择器选中的视频；当前演示只读本地文件，不调用上传服务或真实视频分析。正式批量导入见R-01。",
      "default": "未选择文件。",
      "behavior": "演示实际：单文件选择，接受video/*，读取第一个文件并创建本机播放地址，立即替换弹窗为本地原片预览；不上传、不分析、不建真实资产、不改当前绿台配置。产品要求：按R-01支持剧目批量导入并核对文件与集数，提示重复、缺集、无法识别项。",
      "validation": "演示实际仅设置文件类型提示，未实现MIME、编码、大小、时长、重复或批量集数校验；正式输入容量与格式规则待验证，不能以单文件演示限制作为产品上限。",
      "implementation": "浏览器本机文件选择器"
     }
    ],
    "checks": [
     "未选文件取消，当前片源及余额不变。",
     "选择一个本机视频后进入预览，文件不上传到服务器，当前配置仍为之前片源。",
     "打开文件选择器后取消不进入预览、不创建任务。",
     "正式验收另用批量视频、重复文件、缺集与无法识别文件验证R-01；此原型不能证明通过。"
    ]
   },
   {
    "number": 2,
    "title": "退出导入",
    "bullets": [
     "取消保留原片源，不将本地视频自动归为国内或海外。"
    ],
    "anchor": {
     "selector": "#dialogActions",
     "index": 0,
     "placement": "left"
    },
    "items": [
     {
      "name": "取消 / 右上角关闭",
      "kind": "action",
      "definition": "退出尚未选文件的导入弹窗。",
      "source": "用户通过本机文件选择器选中的视频；当前演示只读本地文件，不调用上传服务或真实视频分析。正式批量导入见R-01。",
      "behavior": "保留原片源和其他配置，不将文件自动归到国内/海外，不收费。选择文件后将进入另一个本地预览弹窗，关闭结果见本地原片预览说明。",
      "implementation": "app.js closeModal"
     }
    ],
    "checks": [
     "未选择文件点取消或×，回到原页面，原片源/选集/报价不变。",
     "导入入口不自动修改来源类型，不产生真实资产或费用。"
    ]
   }
  ]
 },
 "local-preview": {
  "title": "本地原片预览",
  "page": "片源与选集",
  "background": "",
  "need": "展示当前本机视频的预览状态，产品弹窗不引导切换虚构样例。",
  "sections": [
   {
    "number": 1,
    "title": "视频播放",
    "bullets": [
     "播放/暂停/拖动原片，仅预览当前本地文件。"
    ],
    "anchor": {
     "selector": ".source-preview-video",
     "index": 0,
     "placement": "left"
    },
    "items": [
     {
      "name": "本地原片播放器",
      "kind": "action",
      "definition": "带浏览器原生controls的视频播放器，仅播放刚选择的本机文件。",
      "source": "用户通过本机文件选择器选中的视频；当前演示只读本地文件，不调用上传服务或真实视频分析。正式批量导入见R-01。",
      "behavior": "由浏览器提供播放/暂停、进度拖动等控制；更换文件先释放之前临时地址。未提供混剪故事板、分析结果或真实输出。",
      "validation": "不能播放的文件由浏览器播放器呈现异常；源码未提供独立错误提示、格式兼容或元数据校验。",
      "implementation": "本机文件创建的临时播放地址"
     }
    ],
    "checks": [
     "可播放文件能够播放/暂停及拖动，显示的是所选本机视频而非虚构剧照。",
     "更换本机文件后播放器只使用新文件；不能把播放器可播放等同于已完成导入或生成。"
    ]
   },
   {
    "number": 2,
    "title": "预览状态",
    "bullets": [
     "未完成导入，不分析、制作或扣费。"
    ],
    "anchor": {
     "selector": "#dialogBody > .helper",
     "index": 0,
     "placement": "left"
    },
    "items": [
     {
      "name": "本机预览状态",
      "kind": "status",
      "definition": "明确当前文件只是本机预览，尚未导入。",
      "source": "用户通过本机文件选择器选中的视频；当前演示只读本地文件，不调用上传服务或真实视频分析。正式批量导入见R-01。",
      "copy": "文件仅在本机预览，尚未导入。",
      "behavior": "演示实际：没有上传成功、集数关联、剧情分析、制作任务或积分结算。产品要求：正式批量导入完成后才成为可分析/制作片源，按R-01；容量与真实接口仍待确认。",
      "implementation": "app.js文件选择事件"
     }
    ],
    "checks": [
     "选择/播放本地文件后，任务数、分析缓存、余额及积分流水均不增加。",
     "说明明确区分本机预览和正式导入，不能写成产品不支持真实本地视频。"
    ]
   },
   {
    "number": 3,
    "title": "关闭预览",
    "bullets": [
     "关闭回制作，不将预览文件当作已上传成功。"
    ],
    "anchor": {
     "selector": "#dialogActions",
     "index": 0,
     "placement": "left"
    },
    "items": [
     {
      "name": "关闭 / 右上角关闭",
      "kind": "action",
      "definition": "收起本地播放器，返回打开入口所在页面。",
      "source": "用户通过本机文件选择器选中的视频；当前演示只读本地文件，不调用上传服务或真实视频分析。正式批量导入见R-01。",
      "behavior": "演示实际：关闭只收起弹窗，不清除本地预览状态；当前制作页仍显示旧片源，但点生成会提示先选择片源。重新确认绿台合集、进入剧目配置或重置演示等清除本地状态后才可恢复虚构生成。关闭本地预览不代表导入成功。产品要求：取消导入应保留原可用片源并可继续制作，正式导入成功才替换片源；当前演示关闭后的拦截差异需研发对齐。",
      "copy": "当前文件仅供本地预览，请先选择片源",
      "implementation": "app.js closeModal与本地视频状态"
     }
    ],
    "checks": [
     "关闭后制作页原绿台配置仍显示；点生成被本地预览状态拦截，余额不变。",
     "重新打开合集并成功使用合法范围后本地拦截清除，可进入虚构分析流程。",
     "正式取消导入是否继续使用旧片源需按产品规则验收，不能复制原型临时状态当正式逻辑。"
    ]
   }
  ]
 },
 "analysis": {
  "title": "整理所选剧情",
  "page": "分析与复用",
  "background": "",
  "need": "明确本次新增分析量、计费时点和取消结果，避免重复分析收费。",
  "sections": [
   {
    "number": 1,
    "title": "复用与新增范围",
    "bullets": [
     "同来源/资产/版本/语言复用，新选集补缺失分析（R-11）。"
    ],
    "anchor": {
     "selector": "#dialogBody > h3",
     "index": 0,
     "placement": "left"
    },
    "items": [
     {
      "name": "补分析 X 集 / 复用已有剧情分析",
      "kind": "text",
      "definition": "只读说明当前所选范围需要新增分析还是全部复用。",
      "source": "当前片源/选集、有效分析缓存、标准版本和内部候选编排结果；原型按虚构剧情模拟，真实分析/候选来自制作服务。",
      "default": "初始前30集补分析20集；已有1–10集可复用。",
      "behavior": "同来源、资产、原片版本及语言复用有效缓存；新选集仅补缺失分析。生成流程内部完成分析，不需要用户查看分析编号或选择候选片段（R-11）。",
      "implementation": "提交时制作配置快照及分析缓存"
     },
     {
      "name": "复用与新增集数",
      "kind": "text",
      "definition": "只读分列复用集数及本次新增分析集数。",
      "source": "当前片源/选集、有效分析缓存、标准版本和内部候选编排结果；原型按虚构剧情模拟，真实分析/候选来自制作服务。",
      "behavior": "不把不同来源相同合集ID或不同原片版本当成同份分析。范围外缓存保留，后续可再次复用。",
      "implementation": "提交瞬间所选范围与缓存快照"
     }
    ],
    "checks": [
     "初始1–30集提示复用10、新增20；已全部分析后同范围提示复用已有剧情分析、新增0。",
     "扩大选集只收缺失部分；缩小范围不删除已有有效分析。",
     "切海外同ID或新原片版本，不能复用国内旧版缓存。"
    ]
   },
   {
    "number": 2,
    "title": "分析进度与费用",
    "bullets": [
     "新增有效分析完成结算；复用不重复收，完成后自动编排（R-08）。"
    ],
    "anchor": {
     "selector": "#dialogBody > .helper",
     "index": 0,
     "placement": "left"
    },
    "items": [
     {
      "name": "分析进度条",
      "kind": "status",
      "definition": "分析进行中的视觉进度提示。",
      "source": "当前片源/选集、有效分析缓存、标准版本和内部候选编排结果；原型按虚构剧情模拟，真实分析/候选来自制作服务。",
      "behavior": "演示实际：无百分比、无逐集真实状态，约1.1秒后统一完成；按钮处理中防止重复提交。产品要求：真实后台任务与进度、异常处理按R-10，不能把本地延迟当正式耗时承诺。",
      "implementation": "app.js模拟异步操作"
     },
     {
      "name": "分析完成扣 X 积分",
      "kind": "text",
      "definition": "本次新增有效分析的结算额；复用不收费。",
      "source": "当前片源/选集、有效分析缓存、标准版本和内部候选编排结果；原型按虚构剧情模拟，真实分析/候选来自制作服务。",
      "default": "初始20积分；全部复用为0积分。",
      "behavior": "演示实际统一完成时扣新增集数积分并记「新增剧集分析」流水，缓存保存；然后自动编排，数量充足直接制作，不足确认实际条数。产品要求有效新增分析完成结算，复用不重复收，正式费率由平台提供（R-08）。",
      "copy": "复用 X 集 · 新增 Y 集，分析完成扣 Y 积分。",
      "implementation": "演示单价1分/新增集"
     }
    ],
    "checks": [
     "分析完成时只结算新增分析费，随后冻结实际制作费，两项费用和流水分开。",
     "完全复用时不产生新增分析扣费流水，仍进入编排/数量确认流程。",
     "内容不足且返回调整，已扣有效分析费与缓存保留，不收制作费。"
    ]
   },
   {
    "number": 3,
    "title": "取消分析",
    "bullets": [
     "正式取消结算有效完成部分；Demo本次完成前取消不扣费。"
    ],
    "anchor": {
     "selector": "#dialogActions [data-action=\"cancel-analysis\"]",
     "index": 0,
     "placement": "left"
    },
    "items": [
     {
      "name": "取消分析",
      "kind": "action",
      "definition": "在本次分析完成前终止此次演示操作。",
      "source": "当前片源/选集、有效分析缓存、标准版本和内部候选编排结果；原型按虚构剧情模拟，真实分析/候选来自制作服务。",
      "behavior": "演示实际：使待完成操作失效，恢复制作页，无新增缓存、无扣费、无任务；提示「已取消本次模拟分析，未扣积分」。产品要求：正式取消结算已有效完成部分，未完成部分不收；有效分析保留（R-08/R-10）。",
      "implementation": "app.js取消操作令牌"
     },
     {
      "name": "右上角关闭 / Esc",
      "kind": "action",
      "definition": "仅收起分析弹窗，不等于取消分析。",
      "source": "当前片源/选集、有效分析缓存、标准版本和内部候选编排结果；原型按虚构剧情模拟，真实分析/候选来自制作服务。",
      "behavior": "演示实际：关闭未清除分析操作，完成后仍扣新增分析费并自动编排/生成或弹出数量确认；与「取消分析」不同。产品要求：关页/关闭弹窗不应误取消后台任务；需要取消应使用明确的取消动作（R-10）。",
      "implementation": "通用dialog关闭处理"
     }
    ],
    "checks": [
     "在约1.1秒完成前点取消分析，等待后余额、缓存、任务数均保持，不能随后自动生成。",
     "点×收起弹窗后等待，演示继续完成；不能断言关闭就是取消。",
     "正式后端取消遇到部分有效完成时仅结算有效部分，未完成部分不收；原型统一完成无法验证部分结算。"
    ]
   }
  ]
 },
 "quote": {
  "title": "费用明细",
  "page": "制作前报价",
  "background": "",
  "need": "给出当前配置的最高估算及收费节点，制作费和分析费分开。",
  "sections": [
   {
    "number": 1,
    "title": "示例费率与计费方式",
    "bullets": [
     "费率由平台提供，画面上的数值为演示费率。"
    ],
    "anchor": {
     "selector": "#dialogBody > p:first-child",
     "index": 0,
     "placement": "left"
    },
    "items": [
     {
      "name": "平台结算与示例费率声明",
      "kind": "text",
      "definition": "说明统一使用平台积分，当前价格是演示费率。",
      "source": "主平台账户余额/费率及本任务分析、制作、返工、冻结/结算/释放/退款记录；原型读取V7本机演示流水。",
      "copy": "由平台积分账户结算。当前展示演示费率，正式费率沿用平台配置。",
      "behavior": "不新建混剪钱包；积分与人民币兑换、正式费率、分析单位均未核定。",
      "implementation": "app.js quoteDialog与engine.js"
     },
     {
      "name": "制作方式单价",
      "kind": "text",
      "definition": "只读当前方式演示单条价格。",
      "source": "主平台账户余额/费率及本任务分析、制作、返工、冻结/结算/释放/退款记录；原型读取V7本机演示流水。",
      "values": [
       {
        "value": "highlight",
        "label": "高光混剪：32分/条",
        "meaning": "固定演示制作价，不随当前分钟时长变化"
       },
       {
        "value": "narrated-mixed",
        "label": "解说＋原片：50分/条",
        "meaning": "固定演示制作价"
       },
       {
        "value": "narrated-full",
        "label": "全解说：32＋ceil(目标秒数÷30)×18分/条",
        "meaning": "32分基础制作＋每30秒一档18分，向上取整；正式价由平台提供"
       }
      ],
      "behavior": "全解说才显示「计划解说约X秒；每条制作32分＋解说Y档×18分」补充块。精确秒项按该秒数；分钟区间按演示区间中值估算，如3–5分钟按240秒。",
      "implementation": "engine.js productionRate"
     }
    ],
    "checks": [
     "高光报价显示32分/条、混合50分/条；全解说60秒显示32＋2×18＝68分/条。",
     "全解说3–5分钟按240秒、8档解说展示176分/条，标明演示估算。",
     "报价不会出现人民币换算或已确认正式价格。"
    ]
   },
   {
    "number": 2,
    "title": "当前费用拆分",
    "bullets": [
     "显示新增分析、按条制作及最高预计额度；参数变化重新报价。"
    ],
    "anchor": {
     "selector": "#dialogBody .cost-breakdown",
     "index": 0,
     "placement": "left"
    },
    "items": [
     {
      "name": "新增分析：集数 × 单价 / 积分",
      "kind": "text",
      "definition": "所选范围内缺失有效分析的集数与费用。",
      "source": "主平台账户余额/费率及本任务分析、制作、返工、冻结/结算/释放/退款记录；原型读取V7本机演示流水。",
      "behavior": "已复用部分不重复收费，参数与片源变化重新计算。",
      "implementation": "当前配置与有效缓存；演示1分/集"
     },
     {
      "name": "方式、条数 × 单价 / 制作积分",
      "kind": "text",
      "definition": "当前请求条数的制作估算，不是已经生成条数。",
      "source": "主平台账户余额/费率及本任务分析、制作、返工、冻结/结算/释放/退款记录；原型读取V7本机演示流水。",
      "behavior": "全解说随目标时长改变单价；数量不足确认另按可生成条数计算，不在本弹窗承诺一定足数。",
      "implementation": "当前方式演示单价×当前生成条数"
     },
     {
      "name": "预计最高消耗",
      "kind": "text",
      "definition": "新增分析费＋请求条数制作估算的授权上限参考。",
      "source": "主平台账户余额/费率及本任务分析、制作、返工、冻结/结算/释放/退款记录；原型读取V7本机演示流水。",
      "default": "初始340积分。",
      "behavior": "报价只读、不扣费、不创建任务；生成前按此最高额校验余额。实际不超过授权上限，正式按R-08。",
      "implementation": "engine.js estimate"
     }
    ],
    "checks": [
     "初始20新增集、10条高光，三行分别20/320/340积分。",
     "改成5条高光后制作160、合计180；分析全部缓存时合计仅160。",
     "只打开/关闭费用明细，不增流水、不冻余额、不分析。"
    ]
   },
   {
    "number": 3,
    "title": "扣费、失败和免费操作",
    "bullets": [
     "先冻结后结算，失败/取消释放；质量补救与创作收费分开（R-07/R-08）。"
    ],
    "anchor": {
     "selector": "#dialogBody .info",
     "index": 0,
     "placement": "left"
    },
    "items": [
     {
      "name": "收费时点与数量不足规则",
      "kind": "text",
      "definition": "展示分析结算、制作冻结、成功结算、失败释放及返回调整的规则。",
      "source": "主平台账户余额/费率及本任务分析、制作、返工、冻结/结算/释放/退款记录；原型读取V7本机演示流水。",
      "behavior": "提交后先分析新增集，有效完成才扣分析；实际开工条数冻结制作额度，成功从冻结结算，失败/取消释放未结算额度。数量不足先确认实际数量，返回调整不收制作费；已完成有效分析可复用。",
      "implementation": "app.js收费说明；正式R-08"
     },
     {
      "name": "系统修复与素材同步",
      "kind": "text",
      "definition": "说明系统质量补救与同步不重复收制作费。",
      "source": "主平台账户余额/费率及本任务分析、制作、返工、冻结/结算/释放/退款记录；原型读取V7本机演示流水。",
      "behavior": "核验为系统质量问题的修复免费；创作重做另行报价确认。正式草稿暂存、有效分析复用、同步不收制作费；演示“保存文案”模拟应用不代表正式草稿已实现（R-06）。",
      "copy": "系统问题修复与素材同步不重复收费。",
      "implementation": "R-07/R-08及原型提示"
     },
     {
      "name": "关闭 / 右上角关闭",
      "kind": "action",
      "definition": "退出费用明细。",
      "source": "主平台账户余额/费率及本任务分析、制作、返工、冻结/结算/释放/退款记录；原型读取V7本机演示流水。",
      "behavior": "保留当前配置与余额，不提交生成。",
      "implementation": "通用关闭动作"
     }
    ],
    "checks": [
     "成功结算不再次从可用余额扣同一笔冻结额；失败释放与已扣退款区分。",
     "系统质量补救不新增制作费；创作调整不能凭选择质量类型获得免费制作。",
     "关闭报价回制作配置，所有输入保持且任务数不变。"
    ]
   }
  ]
 },
 "bgm-picker": {
  "title": "选择BGM",
  "page": "字幕与包装",
  "background": "",
  "need": "将选择与开关合并，确认后回填制作页并实时更新成片结构预览。",
  "sections": [
   {
    "number": 1,
    "title": "BGM 情绪",
    "bullets": [
     "自动匹配使用所选情绪；选固定曲目时使用曲目情绪。"
    ],
    "anchor": {
     "selector": "#bgmMood",
     "index": 0,
     "placement": "left"
    },
    "items": [
     {
      "name": "剧情情绪",
      "kind": "field",
      "definition": "下拉单选；自动匹配时决定配乐情绪。",
      "source": "情绪为产品固定枚举；曲目正式来自可用于投放的BGM曲库，原型为自动匹配项与三首虚构示例曲目。",
      "default": "当前已保存情绪；初始悬念推进。",
      "values": [
       {
        "value": "tension",
        "label": "悬念推进",
        "meaning": "偏悬念、紧张推进的配乐方向"
       },
       {
        "value": "rise",
        "label": "逆袭时刻",
        "meaning": "偏反击、逆袭推进的配乐方向"
       },
       {
        "value": "soft",
        "label": "情感叙事",
        "meaning": "偏情感、柔和叙事的配乐方向"
       }
      ],
      "behavior": "自动匹配时可改；固定曲目时下拉禁用，并使用该曲固定情绪。弹窗情绪暂选不改制作页，使用BGM才提交。",
      "validation": "确认时必须是字典中的有效情绪；缺失提示「请选择剧情情绪」。",
      "implementation": "creation-ui.js BGM情绪字典"
     }
    ],
    "checks": [
     "选自动匹配时三种情绪都可选；选暗涌/破局/心事后情绪分别为悬念推进/逆袭时刻/情感叙事且禁用。",
     "切回自动匹配后下拉解除禁用，沿用此时情绪并允许修改。",
     "改情绪后取消，制作页原情绪与报价/配置保持。"
    ]
   },
   {
    "number": 2,
    "title": "选择曲目",
    "bullets": [
     "单选自动匹配或曲目；暂选未确认不保存。"
    ],
    "anchor": {
     "selector": ".bgm-options",
     "index": 0,
     "placement": "left"
    },
    "items": [
     {
      "name": "BGM曲目",
      "kind": "field",
      "definition": "单选列表；选择自动匹配或固定示例曲目。",
      "source": "情绪为产品固定枚举；曲目正式来自可用于投放的BGM曲库，原型为自动匹配项与三首虚构示例曲目。",
      "default": "当前保存曲目；初始自动匹配，无效旧值回退自动匹配。",
      "values": [
       {
        "value": "auto",
        "label": "自动匹配",
        "meaning": "按所选剧情情绪匹配"
       },
       {
        "value": "tension-01",
        "label": "暗涌",
        "meaning": "固定悬念推进情绪的虚构示例BGM"
       },
       {
        "value": "rise-01",
        "label": "破局",
        "meaning": "固定逆袭时刻情绪的虚构示例BGM"
       },
       {
        "value": "soft-01",
        "label": "心事",
        "meaning": "固定情感叙事情绪的虚构示例BGM"
       }
      ],
      "behavior": "选择只影响弹窗草稿；固定曲目自动锁定情绪；无试听或真实音乐播放能力。正式广告可用曲库与授权规则待确认（R-05）。",
      "validation": "必须选择列表中有效曲目；确认缺失提示「请选择BGM」。",
      "implementation": "creation-ui.js虚构曲目字典"
     },
     {
      "name": "示例曲库说明",
      "kind": "text",
      "definition": "只读声明曲目是虚构示例。",
      "source": "情绪为产品固定枚举；曲目正式来自可用于投放的BGM曲库，原型为自动匹配项与三首虚构示例曲目。",
      "copy": "曲目为虚构示例，未接入真实曲库。",
      "behavior": "不把四个示例项当作正式曲库容量或真实已授权音乐。",
      "implementation": "app.js openBgmPicker"
     }
    ],
    "checks": [
     "单选一条曲目时其余取消选中；不允许同时使用多首。",
     "固定曲目显示曲名与情绪，当前原型不提供真实音频试听。",
     "选破局后未确认直接关闭，不改变旧曲目。"
    ]
   },
   {
    "number": 3,
    "title": "确认与取消",
    "bullets": [
     "确认才保存并开启；取消恢复原开关与曲目。"
    ],
    "anchor": {
     "selector": "#dialogActions",
     "index": 0,
     "placement": "left"
    },
    "items": [
     {
      "name": "取消 / 右上角关闭",
      "kind": "action",
      "definition": "放弃本次曲目及情绪暂选。",
      "source": "情绪为产品固定枚举；曲目正式来自可用于投放的BGM曲库，原型为自动匹配项与三首虚构示例曲目。",
      "behavior": "从关闭状态勾选BGM后取消仍关闭；从已有配乐点更换后取消保留原开启状态、曲目与情绪。",
      "implementation": "通用关闭动作；弹窗尚未写回配置"
     },
     {
      "name": "使用BGM",
      "kind": "action",
      "definition": "确认曲目与情绪，并开启BGM。",
      "source": "情绪为产品固定枚举；曲目正式来自可用于投放的BGM曲库，原型为自动匹配项与三首虚构示例曲目。",
      "behavior": "自动匹配使用所选情绪；固定曲使用曲目情绪。校验通过保存并关闭弹窗，回填制作页摘要，实时更新结构预览。",
      "validation": "无有效曲目或情绪时不关闭、不写回，提示补选。",
      "implementation": "app.js applyBgm"
     }
    ],
    "checks": [
     "从未开启BGM进入选曲，点使用后才开启，制作页与预览同步显示新选择。",
     "已有暗涌，改选心事后取消，仍是暗涌；确认后显示心事 · 情感叙事。",
     "取消不会产生任务、积分流水或真实合成。"
    ]
   }
  ]
 },
 "review-complete": {
  "title": "本轮检查完成",
  "page": "连续检查",
  "background": "",
  "need": "预览当前版本，处理问题后人工确认，再交付。",
  "sections": [
   {
    "number": 1,
    "title": "本轮结果",
    "bullets": [
     "仅统计本轮队列确认/待处理数，浏览完不等于全部可用。"
    ],
    "anchor": {
     "selector": "#reviewCompletion",
     "index": 0,
     "placement": "left"
    },
    "items": [
     {
      "name": "本轮检查已结束",
      "kind": "status",
      "source": "当前批次成片的内容版本、片段/文案、制作配置与确认/修改/同步记录；原型保存在V7本机状态。",
      "definition": "向前越过固定队列末尾后打开的结果弹窗；只统计本轮，不统计全任务",
      "implementation": "app.js:moveReview"
     },
     {
      "name": "本轮素材／已确认／待处理",
      "kind": "text",
      "source": "当前批次成片的内容版本、片段/文案、制作配置与确认/修改/同步记录；原型保存在V7本机状态。",
      "definition": "本轮素材=队列中仍存在的输出数；已确认=confirmed 且 confirmedVersion=contentVersion；待处理=前者−后者",
      "behavior": "不以浏览过、跳过或自动通过当作人工确认；源码完成计数未额外过滤ready/草稿/处理状态",
      "implementation": "app.js:moveReview；reviewQueue.ids"
     }
    ],
    "checks": [
     "固定队列3条、当前版确认2条：显示本轮素材3、已确认2、待处理1；稍后处理的条目不增加确认数。",
     "后生成成片不在本轮统计；队列条目已不存在时不计总数。"
    ]
   },
   {
    "number": 2,
    "title": "返回或继续",
    "bullets": [
     "返回展开原任务，或继续本轮待处理；不建任务、不扣费。"
    ],
    "anchor": {
     "selector": "#dialogActions",
     "index": 0,
     "placement": "left"
    },
    "items": [
     {
      "name": "返回成片管理",
      "kind": "action",
      "source": "当前批次成片的内容版本、片段/文案、制作配置与确认/修改/同步记录；原型保存在V7本机状态。",
      "behavior": "关闭结果，回原任务并展开，清空任务筛选；不创建任务/扣费",
      "implementation": "app.js:back-tasks"
     },
     {
      "name": "查看待处理素材",
      "kind": "action",
      "source": "当前批次成片的内容版本、片段/文案、制作配置与确认/修改/同步记录；原型保存在V7本机状态。",
      "behavior": "仅本轮总数>确认数时显示；取原队列未确认当前版且reviewable项，创建新的检查队列并从第一项开始；无可检查剩余项则回管理",
      "implementation": "app.js:review-remaining/startReview"
     }
    ],
    "checks": [
     "有1条可检查待处理项：按钮出现并打开该条，进度0、junction页签，新队列只含剩余项。",
     "全部当前版已确认：不显示查看待处理素材；只有处理中的未确认项时按钮点击回管理，不重复生成或扣费。"
    ]
   }
  ]
 },
 "rework": {
  "title": "单条返工",
  "page": "单条返工与版本",
  "background": "",
  "need": "只重做当前条目，原因、积分及失败后的旧片保留规则明确。",
  "sections": [
   {
    "number": 1,
    "title": "返工原因",
    "bullets": [
     "有质量问题才可补救；创作重做单独报价，草稿/锁定先处理（R-07）。"
    ],
    "anchor": {
     "selector": "#reworkKind",
     "index": 0,
     "placement": "left"
    },
    "items": [
     {
      "name": "返工对象",
      "kind": "text",
      "source": "当前成片/问题/创作反馈、原批次片源与配置/标准快照及该条制作费率；原型候选与补救为模拟。",
      "definition": "弹窗显示当前条title；以batchId/outputId绑定本条，沿用任务片源范围、配置、分析快照和规则快照",
      "implementation": "app.js:showRework/openRework"
     },
     {
      "name": "返工方式",
      "kind": "field",
      "source": "当前成片/问题/创作反馈、原批次片源与配置/标准快照及该条制作费率；原型候选与补救为模拟。",
      "default": "有质量问题选quality；无质量问题选creative；反馈按钮可指定category",
      "values": [
       {
        "value": "quality",
        "label": "修复质量问题",
        "meaning": "已有质量问题的免费补救，不承诺创作差异"
       },
       {
        "value": "creative",
        "label": "更换创作方向",
        "meaning": "选择差异内容方案的付费重做"
       }
      ],
      "behavior": "quality无issues时禁用并提示先记录需要修复的问题；切换方式保留创作草稿且更新字段/报价",
      "validation": [
       "必须reviewable：ready/issue 且无repairing/reworkPending",
       "同步pending/processing/unknown或草稿阻止打开",
       "模型只接受quality/creative；quality无问题抛请先标记质量问题，再进行免费修复"
      ],
      "copy": [
       "当前素材正在处理或同步，请稍后操作",
       "请先保存或放弃文案修改",
       "先记录需要修复的问题"
      ],
      "implementation": "app.js:openRework/showRework；workflow-model.js:beginRework"
     },
     {
      "name": "待修复问题列表",
      "kind": "text",
      "source": "当前成片/问题/创作反馈、原批次片源与配置/标准快照及该条制作费率；原型候选与补救为模拟。",
      "behavior": "quality时显示全部质量问题的label与范围；局部或整条均列示，列表不含创作preferences",
      "implementation": "app.js:showRework；o.issues"
     }
    ],
    "checks": [
     "有质量问题从单条返工进入：默认quality，显示全部问题；无质量问题：默认creative且quality按钮禁用。",
     "同步锁/草稿/处理中的条目不能打开返工；质量方式无issues时模型拒绝且无费用/内容写入。"
    ]
   },
   {
    "number": 2,
    "title": "创作要求",
    "bullets": [
     "选调整原因/方向，补充≤200字；仅本条、所选范围内，不自动改团队标准。"
    ],
    "anchor": {
     "selector": "#reworkFeedback, .rework-options, #reworkReason",
     "index": 0,
     "placement": "left"
    },
    "items": [
     {
      "name": "调整原因",
      "kind": "field",
      "source": "当前成片/问题/创作反馈、原批次片源与配置/标准快照及该条制作费率；原型候选与补救为模拟。",
      "default": "opening；从创作反馈进入可预填其reason",
      "values": [
       {
        "value": "opening",
        "label": "开场不够吸引",
        "meaning": "记录希望改善开场的原因"
       },
       {
        "value": "slow",
        "label": "铺垫太长",
        "meaning": "记录节奏/铺垫建议"
       },
       {
        "value": "similar",
        "label": "与已有素材相似",
        "meaning": "记录相似建议"
       },
       {
        "value": "angle",
        "label": "想尝试其他方向",
        "meaning": "记录创作风格或切入建议"
       }
      ],
      "behavior": "仅creative显示；用于recordFeedback日志，不自动改变希望优先调整radio",
      "implementation": "app.js:showRework/change reworkFeedback/submitRework"
     },
     {
      "name": "希望优先调整",
      "kind": "field",
      "source": "当前成片/问题/创作反馈、原批次片源与配置/标准快照及该条制作费率；原型候选与补救为模拟。",
      "default": "opening；从创作反馈进入预填definition.direction",
      "values": [
       {
        "value": "opening",
        "label": "强化开头",
        "meaning": "优先同事件且不同开场，倾向同来源集合"
       },
       {
        "value": "context",
        "label": "补足铺垫",
        "meaning": "优先同事件、chronological组织及不同来源集合"
       },
       {
        "value": "angle",
        "label": "更换剧情切入",
        "meaning": "优先不同angle，并考虑同事件/不同来源"
       }
      ],
      "behavior": "creative必选一项；只用本任务片源范围和分析快照选择可用差异候选，排除已有/历史/待返工候选重复；不保证用户任意文本要求被执行",
      "validation": "只接受opening/context/angle；否则请选择调整方向",
      "implementation": "app.js:showRework/change reworkDirection；workflow-model.js:creativeCandidate"
     },
     {
      "name": "补充要求（选填）",
      "kind": "field",
      "source": "当前成片/问题/创作反馈、原批次片源与配置/标准快照及该条制作费率；原型候选与补救为模拟。",
      "default": "空；从创作反馈进入预填其detail",
      "definition": "UI maxlength=200，提交trim；模型最多保留500个UTF-16码元",
      "behavior": [
       "仅creative显示；切换quality/creative保留输入",
       "仅本条记录，不修改其他成片或团队标准",
       "演示实际：creationRequests记录instruction且instructionApplied=false；候选只由方向选取，不把文本当已执行修复（R-07）"
      ],
      "implementation": "app.js:showRework/input reworkReason/submitRework；workflow-model.js:beginRework/finishRework"
     }
    ],
    "checks": [
     "选择slow原因再选择context方向：日志记铺垫太长，候选按context优先级选择；原因不自动改radio。",
     "空补充要求可提交；UI最多200；切换方式再回creative保留输入；补充文字保留日志而instructionApplied=false。",
     "当前片源无差异候选：提示增加集数或调整配置，本次未扣费，旧内容保留。"
    ]
   },
   {
    "number": 3,
    "title": "费用与处理范围",
    "bullets": [
     "质量补救免费，创作先报价/冻结；复用不重复收分析费（R-08）。"
    ],
    "anchor": {
     "selector": "#reworkQuote",
     "index": 0,
     "placement": "left"
    },
    "items": [
     {
      "name": "本条返工报价",
      "kind": "text",
      "source": "主平台账户余额/费率及本任务分析、制作、返工、冻结/结算/释放/退款记录；原型读取V7本机演示流水。",
      "definition": "quality=0积分；creative=b.cost.unit，即原任务本条制作费快照",
      "behavior": [
       "质量显示系统质量补救／不新增积分消耗；创作显示重新制作这一条／开始时冻结，成功后扣除；失败释放",
       "复用原任务分析，无新增分析收费；报价不随当前制作页设置更改",
       "已同步旧版本不会被替换（R-08/R-09）"
      ],
      "validation": "候选与余额等全部校验完成后才冻结，不可只因打开报价扣费",
      "implementation": "app.js:showRework；workflow-model.js:beginRework"
     },
     {
      "name": "费用口径",
      "kind": "text",
      "source": "主平台账户余额/费率及本任务分析、制作、返工、冻结/结算/释放/退款记录；原型读取V7本机演示流水。",
      "behavior": [
       "creative开始：balance−cost，frozen+cost，quoted+cost，记冻结流水",
       "成功：frozen−cost，production+cost；从冻结结算不再扣balance",
       "失败：frozen−cost，balance+cost，released+cost；不是refunded",
       "quality不新增费用或冻结"
      ],
      "implementation": "workflow-model.js:costSummary/beginRework/finishRework"
     }
    ],
    "checks": [
     "免费质量返工打开及提交都不减少余额，不新增分析费；创作报价取原任务unit。",
     "创作成功时余额只在冻结阶段减一次；失败释放全额回可用余额且净制作费用不增加，不把released算退款。"
    ]
   },
   {
    "number": 4,
    "title": "提交与保留旧片",
    "bullets": [
     "成功升版重确认；不足/失败保留旧片，失败释放本次冻结，不改其他成片/旧同步。"
    ],
    "anchor": {
     "selector": "#dialogActions",
     "index": 0,
     "placement": "left"
    },
    "items": [
     {
      "name": "取消",
      "kind": "action",
      "source": "当前成片/问题/创作反馈、原批次片源与配置/标准快照及该条制作费率；原型候选与补救为模拟。",
      "behavior": "关闭弹窗；未提交不创建返工操作，不写费用/版本；旧片保留",
      "implementation": "app.js:close"
     },
     {
      "name": "免费修复这一条／确认重做 · N积分",
      "kind": "action",
      "source": "主平台账户余额/费率及本任务分析、制作、返工、冻结/结算/释放/退款记录；原型读取V7本机演示流水。",
      "behavior": [
       "提交时再次检查对象/同步锁，调用模型校验草稿、reviewable、分类、方向、issues、余额、候选",
       "成功创建operationId及reworkPending；演示1300ms异步完成，期间展示旧版并锁内容/确认",
       "演示实际质量恢复qualityBaseline或原plan；创作选择差异候选；不是实际媒体修复或生产生成",
       "成功仅替换本条内容，version+1，旧版存versionHistory，清issues/草稿/修复标识/确认，更新revisions，需重检查；旧同步任务保留原id/version",
       "失败或完成时版本与fromVersion不同：保留当前旧片内容、版本和确认状态，释放本次创作冻结；新请求内容不覆盖"
      ],
      "validation": [
       "积分不足：积分不足，请减少制作数量或补充积分",
       "无差异候选：当前片源没有可用的差异方案，请增加集数或调整制作配置；本次未扣费",
       "质量原方案失效：原制作方案已失效，请返回制作素材重新生成",
       "重复beginRework已有pending时复用同job；重复finish无pending不再次结算"
      ],
      "copy": [
       "正在重新制作这一条",
       "新版本已完成，请重新检查",
       "重做未完成，已保留原片并释放新增冻结积分"
      ],
      "implementation": "app.js:submitRework；workflow-model.js:beginRework/finishRework"
     }
    ],
    "checks": [
     "演示创作成功：只有本条Vn→Vn+1且确认撤销，旧片入历史，兄弟成片及旧同步回执不变。",
     "余额不足或无候选：返工不启动，无冻结/版本写入；失败场景旧片/版本保持且新增冻结释放。",
     "重入同pending或重复finish：不生成第二job、不重复扣款；完成时fromVersion不匹配不覆盖新内容。"
    ]
   }
  ]
 },
 "content-compare": {
  "title": "成片内容对比",
  "page": "选取依据与内容差异",
  "background": "",
  "need": "按需对比当前与同片源已有成片，不增加主流程步骤或积分。",
  "sections": [
   {
    "number": 1,
    "title": "对比已有内容",
    "bullets": [
     "对比已有成片开场/结尾/来源/版本，解说可展开全文；不改内容或收积分。"
    ],
    "anchor": {
     "selector": ".content-comparison",
     "index": 0,
     "placement": "left"
    },
    "items": [
     {
      "name": "当前与已有成片",
      "kind": "text",
      "source": "当前成片与同来源、同资产版本/语言的同批或历史成片内容；原型比较虚构片段/文本。",
      "definition": "双列只读比较；每列title、同批/历史批次、duration、contentVersion、开场text、结尾text、episodes",
      "behavior": "对比入口由同assetKey相似项生成；左侧当前，右侧所选；本批判断比较batch.id，文本均来自已保存输出",
      "implementation": "content-ui.js:compareContentDialog；app.js:compare-content"
     },
     {
      "name": "解说全文",
      "kind": "action",
      "source": "当前成片与同来源、同资产版本/语言的同批或历史成片内容；原型比较虚构片段/文本。",
      "default": "折叠；仅item.narrationText非空时出现",
      "behavior": "展开该列已保存解说全文；高光或无文案列不出现解说全文",
      "implementation": "content-ui.js:compareContentDialog"
     },
     {
      "name": "对比边界",
      "kind": "text",
      "source": "当前成片与同来源、同资产版本/语言的同批或历史成片内容；原型比较虚构片段/文本。",
      "copy": "用于检查已有成片差异，不新增制作任务或积分消耗。",
      "implementation": "content-ui.js:compareContentDialog"
     }
    ],
    "checks": [
     "同批相似项双列均显示本批、正确版本、时长、开结尾与取材集数；历史右列显示历史批次。",
     "只有有narrationText的列提供全文展开；展开不修改内容、不升版、不扣费。"
    ]
   },
   {
    "number": 2,
    "title": "返回当前检查",
    "bullets": [
     "关闭回原成片及进度，不创建任务。"
    ],
    "anchor": {
     "selector": "#dialogActions",
     "index": 0,
     "placement": "left"
    },
    "items": [
     {
      "name": "关闭",
      "kind": "action",
      "source": "当前成片与同来源、同资产版本/语言的同批或历史成片内容；原型比较虚构片段/文本。",
      "behavior": "关闭回原预览条目/页签/playerAt；打开对比时已暂停播放，不自动继续；不创建任务",
      "implementation": "app.js:close；compare-content"
     }
    ],
    "checks": [
     "定位到t秒后开对比再关闭：仍是原成片与页签，进度t且暂停。",
     "对比目标已不存在时不会打开弹窗，也不创建任务或扣费。"
    ]
   }
  ]
 },
 "batch-cost": {
  "title": "任务费用明细",
  "page": "任务费用与可用消费",
  "background": "",
  "need": "把预计、扣除、冻结、释放和退款分开，平均消费集中放在明细中解释。",
  "sections": [
   {
    "number": 1,
    "title": "费用组成",
    "bullets": [
     "预计、净扣除、冻结、释放、退款分别列示；释放不再计退款（R-08）。"
    ],
    "anchor": {
     "selector": "#dialogBody .cost-breakdown",
     "index": 0,
     "placement": "left"
    },
    "items": [
     {
      "name": "本次预计消耗（授权上限）",
      "kind": "text",
      "source": "主平台账户余额/费率及本任务分析、制作、返工、冻结/结算/释放/退款记录；原型读取V7本机演示流水。",
      "definition": "优先cost.quoted；缺失时analysis+production+frozen+released，金额非有限/负数按0",
      "behavior": "quoted>analysis+production 时标题附授权上限；包含授权返工额度，非本次已扣总额",
      "implementation": "workflow-model.js:costSummary；workflow-ui.js:costBreakdown"
     },
     {
      "name": "实际扣除",
      "kind": "text",
      "source": "主平台账户余额/费率及本任务分析、制作、返工、冻结/结算/释放/退款记录；原型读取V7本机演示流水。",
      "definition": "net=round(max(0,analysis+production−refunded),2)，不包含未结算冻结或释放",
      "implementation": "workflow-model.js:costSummary"
     },
     {
      "name": "剧情分析",
      "kind": "text",
      "source": "主平台账户余额/费率及本任务分析、制作、返工、冻结/结算/释放/退款记录；原型读取V7本机演示流水。",
      "definition": "本任务分摊的已结算有效分析积分，复用不重复收取",
      "implementation": "workflow-model.js:costSummary；b.cost.analysis"
     },
     {
      "name": "已结算制作",
      "kind": "text",
      "source": "主平台账户余额/费率及本任务分析、制作、返工、冻结/结算/释放/退款记录；原型读取V7本机演示流水。",
      "definition": "已成功结算的生成/创作重做积分；从冻结结算不再次扣可用余额",
      "implementation": "workflow-model.js:costSummary；b.cost.production"
     },
     {
      "name": "处理中冻结",
      "kind": "text",
      "source": "主平台账户余额/费率及本任务分析、制作、返工、冻结/结算/释放/退款记录；原型读取V7本机演示流水。",
      "definition": "处理中暂占的制作额度，尚不算实际扣费",
      "implementation": "workflow-model.js:costSummary；b.cost.frozen"
     },
     {
      "name": "失败／取消释放",
      "kind": "text",
      "source": "主平台账户余额/费率及本任务分析、制作、返工、冻结/结算/释放/退款记录；原型读取V7本机演示流水。",
      "definition": "优先cost.released；缺失时汇总本任务type含释放的ledger正积分",
      "behavior": "回可用余额的未结算冻结，不再计为已扣费用退款",
      "implementation": "workflow-model.js:costSummary"
     },
     {
      "name": "已扣费用退回",
      "kind": "text",
      "source": "主平台账户余额/费率及本任务分析、制作、返工、冻结/结算/释放/退款记录；原型读取V7本机演示流水。",
      "definition": "退款只反转已结算费用；单列显示并从实际扣除减去",
      "implementation": "workflow-model.js:costSummary；b.cost.refunded"
     },
     {
      "name": "冻结、释放提示",
      "kind": "text",
      "source": "主平台账户余额/费率及本任务分析、制作、返工、冻结/结算/释放/退款记录；原型读取V7本机演示流水。",
      "copy": "冻结是暂占额度；释放回到可用余额，不属于已扣费用的退款。（R-08）",
      "implementation": "workflow-ui.js:costBreakdown"
     }
    ],
    "checks": [
     "analysis=10、production=100、frozen=50、released=20、refunded=5：实际扣除105，冻结50/释放20/退款5单列，未quoted时预计180。",
     "有quoted时按其显示；负数/非有限金额按0；释放不减net，退款不计两次。"
    ]
   },
   {
    "number": 2,
    "title": "平均可用费用",
    "bullets": [
     "净扣除÷当前版确认条数；含分摊分析/返工，零条不计算，不等于单条售价。"
    ],
    "anchor": {
     "selector": "#dialogBody .cost-average",
     "index": 0,
     "placement": "left"
    },
    "items": [
     {
      "name": "每条可用素材的平均消费",
      "kind": "action",
      "source": "主平台账户余额/费率及本任务分析、制作、返工、冻结/结算/释放/退款记录；原型读取V7本机演示流水。",
      "default": "折叠",
      "behavior": "展开分子/分母与说明；不作售价或再次结算",
      "implementation": "workflow-ui.js:costBreakdown"
     },
     {
      "name": "已确认可用条数",
      "kind": "text",
      "source": "主平台账户余额/费率及本任务分析、制作、返工、冻结/结算/释放/退款记录；原型读取V7本机演示流水。",
      "definition": "ready且reviewable、confirmed且confirmedVersion=contentVersion、无narrationDraft的当前输出数",
      "behavior": "排除质量问题、草稿、修复/返工、失败/制作中和旧版确认；源码不额外排除同步锁",
      "implementation": "workflow-model.js:costSummary"
     },
     {
      "name": "平均消费",
      "kind": "text",
      "source": "主平台账户余额/费率及本任务分析、制作、返工、冻结/结算/释放/退款记录；原型读取V7本机演示流水。",
      "definition": "accepted>0：net/accepted四舍五入到2位；accepted=0：不计算",
      "behavior": "分子含任务分析费、已结算生成及创作返工费用、减退款；不是单条制作售价",
      "copy": [
       "暂无已确认素材，暂不计算平均消费。",
       "按当前版本已确认数量计算，包含本任务分摊的分析费和重做费用，不是单条制作售价。"
      ],
      "implementation": "workflow-model.js:costSummary；workflow-ui.js:costBreakdown"
     }
    ],
    "checks": [
     "net=105、2条当前版确认且可用：显示105÷2=52.5积分/条。",
     "零条可用显示暂不计算，避免除零；有草稿或返工的已确认条不计分母，旧版确认不计分母。"
    ]
   },
   {
    "number": 3,
    "title": "返回",
    "bullets": [
     "关闭回原任务，不新增扣费。"
    ],
    "anchor": {
     "selector": "#dialogActions",
     "index": 0,
     "placement": "left"
    },
    "items": [
     {
      "name": "关闭",
      "kind": "action",
      "source": "主平台账户余额/费率及本任务分析、制作、返工、冻结/结算/释放/退款记录；原型读取V7本机演示流水。",
      "behavior": "回原任务视图，不新增费用或制作任务",
      "implementation": "app.js:close"
     }
    ],
    "checks": [
     "查看明细并关闭：余额、ledger、任务及版本均不变。",
     "无可用条数也可正常关闭，无结算动作。"
    ]
   }
  ]
 },
 "confirm": {
  "title": "确认当前版本可用",
  "page": "人工确认与版本",
  "background": "",
  "need": "以明确勾选的人工确认作为交付前置条件，并绑定当前版本。",
  "sections": [
   {
    "number": 1,
    "title": "本次确认范围",
    "bullets": [
     "确认当前内容版本；无质量问题/未应用草稿/处理及同步锁定（R-06）。"
    ],
    "anchor": {
     "selector": "#dialogTitle",
     "index": 0,
     "placement": "left"
    },
    "items": [
     {
      "name": "确认N条素材可用",
      "kind": "text",
      "source": "所选成片当前版本、人工确认勾选、质量问题、草稿及修复/返工/同步锁定状态。",
      "definition": "当前任务所选可用输出集合，单条预览N=1；提交按钮绑定[{id,version}]快照",
      "behavior": "确认绑定当前内容版本，不代表任何未来修改版；有创作preferences可确认沿用",
      "implementation": "app.js:confirmModal"
     },
     {
      "name": "确认前资格",
      "kind": "status",
      "source": "所选成片当前版本、人工确认勾选、质量问题、草稿及修复/返工/同步锁定状态。",
      "definition": "每条ready、无repairing/reworkPending、无narrationDraft且当前版无同步pending/processing/unknown",
      "validation": [
       "空集合或任一不合格：请选择已生成且无待处理问题的当前版本",
       "任一草稿：所选素材有未保存的文案，请先保存或放弃修改",
       "提交复核对象存在、ready、reviewable、无草稿、版本等于快照且无锁；失败提示素材状态已变化，请重新检查"
      ],
      "copy": [
       "请选择已生成且无待处理问题的当前版本",
       "素材状态已变化，请重新检查"
      ],
      "implementation": "app.js:confirmModal/apply-confirm；workflow-model.js:reviewable"
     }
    ],
    "checks": [
     "选择2条ready无锁无草稿：显示确认2条并快照两条各自版本。",
     "任一quality issue、草稿、处理锁或空集合：不打开确认；弹窗后版本变化则提交拒绝，确认字段不写。"
    ]
   },
   {
    "number": 2,
    "title": "按结构检查重点",
    "bullets": [
     "高光/混合核对白与承接；全解说核对全文、画面、配音和字幕（R-02）。"
    ],
    "anchor": {
     "selector": "#dialogBody > p",
     "index": 0,
     "placement": "left"
    },
    "items": [
     {
      "name": "按结构人工检查提示",
      "kind": "text",
      "source": "所选成片当前版本、人工确认勾选、质量问题、草稿及修复/返工/同步锁定状态。",
      "values": [
       {
        "value": "highlight/mixed",
        "label": "请检查剧情是否连贯、对白是否完整、字幕与 BGM 是否合适。",
        "meaning": "高光/解说＋原片及历史原片提示"
       },
       {
        "value": "full",
        "label": "请检查全文解说是否完整、文案与画面是否对应、配音时长和字幕是否合适，原片人声是否关闭。",
        "meaning": "全解说特有验收"
       }
      ],
      "copy": "系统检查通过不等于已经人工验收。（R-02）",
      "implementation": "app.js:confirmModal；engine.js:isFullNarration"
     }
    ],
    "checks": [
     "高光/混合显示对白与剧情验收，full显示全文、图文、配音时长、字幕及原片人声关闭。",
     "自动检查passed仍保留人工验收提示，不自动勾选或完成确认。"
    ]
   },
   {
    "number": 3,
    "title": "勾选并确认",
    "bullets": [
     "必须人工勾选；确认后继续或开同步，取消上传保留确认；内容变更撤销确认。"
    ],
    "anchor": {
     "selector": "#dialogBody .check-confirm",
     "index": 0,
     "placement": "left"
    },
    "items": [
     {
      "name": "已检查所选素材，确认当前版本可以使用",
      "kind": "field",
      "source": "所选成片当前版本、人工确认勾选、质量问题、草稿及修复/返工/同步锁定状态。",
      "default": "未勾选",
      "definition": "人工验收checkbox confirmCheck，必须显式勾选",
      "validation": "未勾选点击提交只提示请先确认检查完成；按钮源码不预先禁用",
      "copy": "请先确认检查完成",
      "implementation": "app.js:confirmModal/apply-confirm"
     },
     {
      "name": "返回检查",
      "kind": "action",
      "source": "所选成片当前版本、人工确认勾选、质量问题、草稿及修复/返工/同步锁定状态。",
      "behavior": "关闭确认，不写确认/费用/版本",
      "implementation": "app.js:close"
     },
     {
      "name": "确认可用／确认并继续／确认并填写上传信息",
      "kind": "action",
      "source": "所选成片当前版本、人工确认勾选、质量问题、草稿及修复/返工/同步锁定状态。",
      "behavior": [
       "勾选且复核通过：逐条recordFeedback acceptance，confirmed=true、confirmedVersion=contentVersion、confirmedAt=当前时间，删deferredAt；不升版、不扣费",
       "普通确认提示当前版本已确认，可同步到素材管理",
       "next后续前进下一条或结果；sync后续打开上传信息，取消上传保留确认",
       "内容修改、实际修复/重做成功或记录反馈撤销确认；仅当前确认版可交付（R-06/R-09）"
      ],
      "implementation": "app.js:apply-confirm"
     }
    ],
    "checks": [
     "未勾选提交：显示请先确认检查完成，素材保持未确认；勾选通过后绑定当前版本并记录acceptance。",
     "确认并填写上传信息后取消上传：保留当前版确认且没有同步job；取消返回检查不写确认。",
     "确认后变更内容/记录反馈：确认撤销，后续交付必须重新确认；旧成功同步记录仍保留。"
    ]
   }
  ]
 },
 "issue": {
  "title": "记录成片问题",
  "page": "时间段反馈与修复",
  "background": "",
  "need": "记录质量或创作问题，标记局部范围或整条素材。",
  "sections": [
   {
    "number": 1,
    "title": "问题类型",
    "bullets": [
     "18质量/6创作，按结构和包装显示；类别决定补救或报价重做（R-07）。"
    ],
    "anchor": {
     "selector": "#issueType",
     "index": 0,
     "placement": "left"
    },
    "items": [
     {
      "name": "问题类型",
      "kind": "field",
      "source": "产品维护的问题类型字典；按制作结构、BGM与小标题开关筛选，不来自投放评分。",
      "default": "首个适用类型；高光/混合=dialogue，全解说=context",
      "definition": "24种枚举全集：18质量、6创作；下拉按quality/creative两个optgroup展示，实际选项按结构、BGM、小标题过滤",
      "values": [
       {
        "value": "dialogue",
        "label": "对白吞字 / 断句",
        "meaning": "质量问题，按 R-07 核验后补救；适用 highlight、mixed；对白首尾字、句子边界有缺失或切断"
       },
       {
        "value": "context",
        "label": "剧情不连贯 / 缺少铺垫",
        "meaning": "质量问题，按 R-07 核验后补救；适用 highlight、mixed、full；前因、事件顺序、承接有质量问题"
       },
       {
        "value": "duplicate",
        "label": "成片内片段重复",
        "meaning": "质量问题，按 R-07 核验后补救；适用 highlight、mixed、full；同一成片内重复片段"
       },
       {
        "value": "narration",
        "label": "解说句子不完整",
        "meaning": "质量问题，按 R-07 核验后补救；适用 mixed、full；已保存解说句子不完整"
       },
       {
        "value": "narration-fact",
        "label": "解说事实错误",
        "meaning": "质量问题，按 R-07 核验后补救；适用 mixed、full；解说内容与原片事实不一致"
       },
       {
        "value": "character",
        "label": "人物称呼 / 关系错误",
        "meaning": "质量问题，按 R-07 核验后补救；适用 mixed、full；解说的人物称呼或人物关系错误"
       },
       {
        "value": "narration-join",
        "label": "解说与原片衔接不自然",
        "meaning": "质量问题，按 R-07 核验后补救；适用 mixed；解说与保留原声交界不自然"
       },
       {
        "value": "alignment",
        "label": "解说与画面不对应",
        "meaning": "质量问题，按 R-07 核验后补救；适用 mixed、full；解说段与其原片画面不对应"
       },
       {
        "value": "subtitle-text",
        "label": "字幕错字 / 漏字",
        "meaning": "质量问题，按 R-07 核验后补救；适用 highlight、mixed、full；字幕文字错误或缺字"
       },
       {
        "value": "subtitle",
        "label": "字幕缺失 / 不同步",
        "meaning": "质量问题，按 R-07 核验后补救；适用 highlight、mixed、full；字幕缺失或与声音/画面时间不对应"
       },
       {
        "value": "subtitle-layout",
        "label": "字幕遮挡 / 超出画面",
        "meaning": "质量问题，按 R-07 核验后补救；适用 highlight、mixed、full；字幕版式遮内容或越界"
       },
       {
        "value": "voice-pronunciation",
        "label": "配音读音错误",
        "meaning": "质量问题，按 R-07 核验后补救；适用 mixed、full；解说配音读音错误"
       },
       {
        "value": "voice-audio",
        "label": "人声缺失 / 爆音 / 音量异常",
        "meaning": "质量问题，按 R-07 核验后补救；适用 highlight、mixed、full；原声或配音缺失、爆音或音量异常"
       },
       {
        "value": "music",
        "label": "BGM 压住人声",
        "meaning": "质量问题，按 R-07 核验后补救；适用 highlight、mixed、full；仅bgm=true；配乐妨碍听清人声"
       },
       {
        "value": "music-missing",
        "label": "BGM 缺失",
        "meaning": "质量问题，按 R-07 核验后补救；适用 highlight、mixed、full；仅bgm=true；已开启BGM但实际缺失"
       },
       {
        "value": "black",
        "label": "黑屏 / 画面缺失",
        "meaning": "质量问题，按 R-07 核验后补救；适用 highlight、mixed、full；应有画面处黑屏或缺失"
       },
       {
        "value": "freeze",
        "label": "卡帧 / 闪帧",
        "meaning": "质量问题，按 R-07 核验后补救；适用 highlight、mixed、full；画面卡顿帧或异常闪帧"
       },
       {
        "value": "title-layout",
        "label": "小标题遮挡内容",
        "meaning": "质量问题，按 R-07 核验后补救；适用 highlight、mixed、full；仅title=true；已开启小标题但遮挡内容"
       },
       {
        "value": "opening",
        "label": "开场不够吸引",
        "meaning": "创作调整，重做前报价；适用 highlight、mixed、full；对开场的创作偏好；direction=opening；reason=opening"
       },
       {
        "value": "pacing",
        "label": "节奏拖沓 / 速度不合适",
        "meaning": "创作调整，重做前报价；适用 highlight、mixed、full；对节奏或速度的创作偏好，不自动改播放倍率；direction=angle；reason=slow"
       },
       {
        "value": "ending",
        "label": "结尾悬念不足",
        "meaning": "创作调整，重做前报价；适用 highlight、mixed、full；对结尾悬念的创作偏好；direction=angle；reason=angle"
       },
       {
        "value": "narration-style",
        "label": "解说表达 / 风格不合适",
        "meaning": "创作调整，重做前报价；适用 mixed、full；对解说表达或风格的创作偏好；direction=angle；reason=angle"
       },
       {
        "value": "bgm-mood",
        "label": "BGM 情绪不合适",
        "meaning": "创作调整，重做前报价；适用 highlight、mixed、full；仅bgm=true；对已开配乐情绪的创作偏好；direction=angle；reason=angle"
       },
       {
        "value": "similar",
        "label": "与其他成片过于相似",
        "meaning": "创作调整，重做前报价；适用 highlight、mixed、full；对已有成片内容差异的创作偏好；direction=angle；reason=similar"
       }
      ],
      "behavior": [
       "模式映射：isFullNarration→full；其他narrated→mixed；其余含历史original→highlight",
       "无modes限制的项三结构共用；bgm项仅bgm=true，title项仅title=true；subtitle项未按subtitles开关过滤",
       "全解说不显示对白吞字/断句、解说与原片衔接不自然；高光不显示解说/人物/图文/配音读音及解说风格专属项",
       "BGM和小标题全开：混合18质量+6创作，高光12质量+5创作，全解说16质量+6创作；关闭BGM减少2质量+1创作，关闭小标题减少1质量"
      ],
      "validation": "保存时仍调用issueTypes验证当前适用；非法/不可见类型提示请选择适用于当前素材的问题类型",
      "implementation": "feedback-model.js:ISSUE_TYPES/issueTypes；feedback-ui.js:feedbackForm"
     },
     {
      "name": "类别说明",
      "kind": "text",
      "source": "产品维护的问题类型字典；按制作结构、BGM与小标题开关筛选，不来自投放评分。",
      "default": "质量问题按修复流程处理。",
      "behavior": "选creative后显示创作调整将在重做前确认费用；切回quality恢复质量问题按修复流程处理；不因选类型即时修改成片",
      "copy": [
       "质量问题按修复流程处理。",
       "创作调整将在重做前确认费用。"
      ],
      "implementation": "feedback-ui.js:feedbackForm；app.js:change issueType"
     }
    ],
    "checks": [
     "混合且BGM/小标题开：按分类显示18质量+6创作且默认dialogue；全解说默认context且无对白/混合衔接项。",
     "BGM关时music/music-missing/bgm-mood不可选，title关时title-layout不可选；字幕关仍保留字幕质量项。",
     "切creative类别提示报价，切quality提示修复；伪造不适用类型提交拒绝且无记录/版本/费用写入。"
    ]
   },
   {
    "number": 2,
    "title": "反馈范围",
    "bullets": [
     "默认局部，可整条；整条隐藏时间，切回保留输入。"
    ],
    "anchor": {
     "selector": ".feedback-scope",
     "index": 0,
     "placement": "left"
    },
    "items": [
     {
      "name": "问题时间段／反馈范围",
      "kind": "field",
      "source": "当前成片总时长、播放器进度及用户输入的局部区间或整条选择。",
      "default": "segment（局部片段）",
      "values": [
       {
        "value": "segment",
        "label": "局部片段",
        "meaning": "按起始及选填结束记录局部范围"
       },
       {
        "value": "all",
        "label": "整条素材",
        "meaning": "记录scope=all、at=0、endAt=duration，不读取时间输入"
       }
      ],
      "behavior": "按钮active/aria-pressed随选择切换；all隐藏issueTimeRange；切回segment显示并保留原输入；不自动提交",
      "validation": "scope非segment/all提示请选择反馈范围",
      "implementation": "feedback-ui.js:feedbackForm；app.js:issue-scope；feedback-model.js:feedbackRange"
     }
    ],
    "checks": [
     "默认局部显示带入的起始和空结束；切整条隐藏时间，再切回保留起始/结束文本。",
     "整条时即使隐藏时间输入无效也按0—duration保存；未知scope提交拒绝，不记问题。"
    ]
   },
   {
    "number": 3,
    "title": "起始与结束时间",
    "bullets": [
     "起始默认当前进度且必填，结束选填且>起始、≤总时长；同类同范围不重复。"
    ],
    "anchor": {
     "selector": "#issueTimeRange",
     "index": 0,
     "placement": "left"
    },
    "items": [
     {
      "name": "起始时间",
      "kind": "field",
      "source": "当前成片总时长、播放器进度及用户输入的局部区间或整条选择。",
      "default": "打开弹窗时playerAt格式化到0.1秒，带入当前播放位置",
      "definition": "segment必填；接受非负纯秒数含小数、分:秒、时:分:秒；允许首尾空白；冒号后分/秒<60",
      "behavior": "在局部显示；整条隐藏且忽略；最小0、最大o.duration，源码允许start=duration且结束空",
      "validation": "空、负值、格式错误、非有限或超出duration：请填写成片范围内的起始时间",
      "copy": [
       "已带入当前播放位置",
       "请填写成片范围内的起始时间"
      ],
      "implementation": "feedback-ui.js:feedbackForm；feedback-model.js:parseTimeCode/feedbackRange/formatTimeCode"
     },
     {
      "name": "结束时间（选填）",
      "kind": "field",
      "source": "当前成片总时长、播放器进度及用户输入的局部区间或整条选择。",
      "default": "空，保存endAt=null",
      "definition": "局部选填；非空时格式同起始，且endAt>at、endAt≤duration",
      "behavior": "未填显示起始时间 起；已填显示起始–结束；helper展示素材时长",
      "validation": "格式错、非有限、≤起始或超时长：结束时间需晚于起始时间，且不超过成片时长",
      "implementation": "feedback-ui.js:feedbackForm；feedback-model.js:parseTimeCode/feedbackRange"
     },
     {
      "name": "同类同范围判重",
      "kind": "status",
      "source": "当前成片总时长、播放器进度及用户输入的局部区间或整条选择。",
      "definition": "同type且同scope，|start差|<0.5秒，且两者结束同为空或两者非空且|end差|<0.5秒，视为重复",
      "behavior": [
       "恰好0.5秒差不视为重复；有结束和无结束不相同；all和segment即便0—duration也不同",
       "质量在全部o.issues判重，创作只在当前contentVersion的preferences判重",
       "同类型不同范围可重复记录；不同类型同范围可分别记录；detail差异不绕过判重"
      ],
      "validation": "重复提示这段的问题已记录，不新增反馈、不撤销额外状态、不扣费",
      "implementation": "feedback-model.js:duplicateFeedback/recordOutputIssue/currentPreferences"
     }
    ],
    "checks": [
     "播放35秒打开：start=0:35，end空；保存局部范围at=35、endAt=null并显示0:35 起。",
     "start=0/end=duration正常；start=duration且end空源码允许；空起始、1:60或start>duration拒绝。",
     "end=start、end<start或end>duration拒绝；60.5纯秒、1:00.5、0:01:00.5按合法时间解析。",
     "同类型同范围start/end差<0.5秒拒绝；差=0.5秒允许；不同类型、scope或结束空/非空分别允许。"
    ]
   },
   {
    "number": 4,
    "title": "补充说明",
    "bullets": [
     "选填≤200字，关联范围及内容版本；取消不保存。"
    ],
    "anchor": {
     "selector": "#issueDetail",
     "index": 0,
     "placement": "left"
    },
    "items": [
     {
      "name": "补充说明（选填）",
      "kind": "field",
      "source": "当前成片版本、用户问题描述及本次反馈记录；演示记录保存在V7本机状态。",
      "default": "空",
      "definition": "textarea rows=3、maxlength=200；保存String(detail).trim().slice(0,200)，按UTF-16码元计",
      "behavior": "非空展示在反馈卡；空说明省略；说明关联type/range/segmentId和记录时contentVersion，不参与判重",
      "implementation": "feedback-ui.js:feedbackForm；feedback-model.js:recordOutputIssue"
     },
     {
      "name": "问题定位与版本归属",
      "kind": "text",
      "source": "当前成片版本、用户问题描述及本次反馈记录；演示记录保存在V7本机状态。",
      "definition": "segmentId取首个end>at片段，超尾时回退末段；记录id/type/label/category/scope/at/endAt/detail/recordOnly/version",
      "behavior": "审计反馈另存sourceKey、analysisVersion、policyVersion、ruleId/version、batch/output/version与createdAt；整条at=0关联首段；时间恰逢片段end则归下一段",
      "implementation": "feedback-model.js:recordOutputIssue；content-model.js:recordFeedback"
     }
    ],
    "checks": [
     "空说明可提交且反馈卡不出现空段落；输入首尾空白被trim，最多保留200码元。",
     "start恰等片段end关联下一段；start=总时长回退末段；审计记录绑定当前输出、分析/规则及内容版本。"
    ]
   },
   {
    "number": 5,
    "title": "提交与后续",
    "bullets": [
     "质量阻止交付，创作可确认采用或报价调整；记录不改媒体/升版，锁定禁反馈（R-06/R-07）。"
    ],
    "anchor": {
     "selector": "#dialogActions",
     "index": 0,
     "placement": "left"
    },
    "items": [
     {
      "name": "取消",
      "kind": "action",
      "source": "当前成片版本、用户问题描述及本次反馈记录；演示记录保存在V7本机状态。",
      "behavior": "关闭弹窗，不记录反馈、不改确认/状态/版本或积分；再次打开范围恢复局部、结束/说明为空，起始重新取当前进度",
      "implementation": "app.js:close"
     },
     {
      "name": "记录问题",
      "kind": "action",
      "source": "当前成片版本、用户问题描述及本次反馈记录；演示记录保存在V7本机状态。",
      "behavior": [
       "先校验范围、适用类型与判重，成功保存后关弹窗并刷新本条",
       "quality写o.issues、status=issue、quality.status=attention，阻确认/同步；creative写preferences，保留原status，但撤销已确认，仍可人工接受现有创作",
       "两类均清confirmed/confirmedVersion/confirmedAt并写version和recordOnly=true；不改媒体/故事板文本、不升版、不扣积分",
       "审计kind：quality或creative-preference；后续质量走免费局部/整条补救，创作调整走报价返工（R-06/R-07）"
      ],
      "validation": "打开反馈入口在草稿或同步/修复/返工锁下拦截；演示提交apply-issue未再次复核锁/版本，正式需提交时复核当前版本及锁",
      "copy": [
       "请选择适用于当前素材的问题类型",
       "这段的问题已记录"
      ],
      "implementation": "app.js:apply-issue/apply-full-issue；feedback-model.js:recordOutputIssue；content-model.js:recordFeedback"
     },
     {
      "name": "后续处理入口",
      "kind": "text",
      "source": "当前成片版本、用户问题描述及本次反馈记录；演示记录保存在V7本机状态。",
      "behavior": "质量 scope=all 或自动continuity显示整条修复，其他局部修复；创作显示调整这一条；定位始终取记录at；演示修复/重做仅状态/故事板模拟，真实媒体修复成功后才应升版并重确认",
      "implementation": "feedback-ui.js:feedbackItems"
     }
    ],
    "checks": [
     "记录质量后：新增质量卡和审计记录，状态issue，确认撤销而版本不变且余额不变；创作记录不改ready但撤销确认。",
     "验证失败时弹窗保留且无记录/版本/费用写入；取消不保存任何字段，下次打开重新初始化。",
     "同步/修复/返工锁或草稿时反馈入口禁用/拦截；正式在提交时状态变化必须拒绝，本Demo提交缺少此复核。"
    ]
   }
  ]
 },
 "issue-full": {
  "title": "记录全解说问题",
  "page": "全解说时间段反馈",
  "background": "",
  "need": "记录质量或创作问题，标记局部范围或整条素材。",
  "sections": [
   {
    "number": 1,
    "title": "全解说问题类型",
    "bullets": [
     "只显示全解说适用项：事实/人物/图文、字幕声音画面及创作风格等。"
    ],
    "anchor": {
     "selector": "#issueType",
     "index": 0,
     "placement": "left"
    },
    "items": [
     {
      "name": "问题类型",
      "kind": "field",
      "source": "产品维护的问题类型字典；按制作结构、BGM与小标题开关筛选，不来自投放评分。",
      "default": "首个适用类型；高光/混合=dialogue，全解说=context",
      "definition": "24种枚举全集：18质量、6创作；下拉按quality/creative两个optgroup展示，实际选项按结构、BGM、小标题过滤",
      "values": [
       {
        "value": "dialogue",
        "label": "对白吞字 / 断句",
        "meaning": "质量问题，按 R-07 核验后补救；适用 highlight、mixed；对白首尾字、句子边界有缺失或切断"
       },
       {
        "value": "context",
        "label": "剧情不连贯 / 缺少铺垫",
        "meaning": "质量问题，按 R-07 核验后补救；适用 highlight、mixed、full；前因、事件顺序、承接有质量问题"
       },
       {
        "value": "duplicate",
        "label": "成片内片段重复",
        "meaning": "质量问题，按 R-07 核验后补救；适用 highlight、mixed、full；同一成片内重复片段"
       },
       {
        "value": "narration",
        "label": "解说句子不完整",
        "meaning": "质量问题，按 R-07 核验后补救；适用 mixed、full；已保存解说句子不完整"
       },
       {
        "value": "narration-fact",
        "label": "解说事实错误",
        "meaning": "质量问题，按 R-07 核验后补救；适用 mixed、full；解说内容与原片事实不一致"
       },
       {
        "value": "character",
        "label": "人物称呼 / 关系错误",
        "meaning": "质量问题，按 R-07 核验后补救；适用 mixed、full；解说的人物称呼或人物关系错误"
       },
       {
        "value": "narration-join",
        "label": "解说与原片衔接不自然",
        "meaning": "质量问题，按 R-07 核验后补救；适用 mixed；解说与保留原声交界不自然"
       },
       {
        "value": "alignment",
        "label": "解说与画面不对应",
        "meaning": "质量问题，按 R-07 核验后补救；适用 mixed、full；解说段与其原片画面不对应"
       },
       {
        "value": "subtitle-text",
        "label": "字幕错字 / 漏字",
        "meaning": "质量问题，按 R-07 核验后补救；适用 highlight、mixed、full；字幕文字错误或缺字"
       },
       {
        "value": "subtitle",
        "label": "字幕缺失 / 不同步",
        "meaning": "质量问题，按 R-07 核验后补救；适用 highlight、mixed、full；字幕缺失或与声音/画面时间不对应"
       },
       {
        "value": "subtitle-layout",
        "label": "字幕遮挡 / 超出画面",
        "meaning": "质量问题，按 R-07 核验后补救；适用 highlight、mixed、full；字幕版式遮内容或越界"
       },
       {
        "value": "voice-pronunciation",
        "label": "配音读音错误",
        "meaning": "质量问题，按 R-07 核验后补救；适用 mixed、full；解说配音读音错误"
       },
       {
        "value": "voice-audio",
        "label": "人声缺失 / 爆音 / 音量异常",
        "meaning": "质量问题，按 R-07 核验后补救；适用 highlight、mixed、full；原声或配音缺失、爆音或音量异常"
       },
       {
        "value": "music",
        "label": "BGM 压住人声",
        "meaning": "质量问题，按 R-07 核验后补救；适用 highlight、mixed、full；仅bgm=true；配乐妨碍听清人声"
       },
       {
        "value": "music-missing",
        "label": "BGM 缺失",
        "meaning": "质量问题，按 R-07 核验后补救；适用 highlight、mixed、full；仅bgm=true；已开启BGM但实际缺失"
       },
       {
        "value": "black",
        "label": "黑屏 / 画面缺失",
        "meaning": "质量问题，按 R-07 核验后补救；适用 highlight、mixed、full；应有画面处黑屏或缺失"
       },
       {
        "value": "freeze",
        "label": "卡帧 / 闪帧",
        "meaning": "质量问题，按 R-07 核验后补救；适用 highlight、mixed、full；画面卡顿帧或异常闪帧"
       },
       {
        "value": "title-layout",
        "label": "小标题遮挡内容",
        "meaning": "质量问题，按 R-07 核验后补救；适用 highlight、mixed、full；仅title=true；已开启小标题但遮挡内容"
       },
       {
        "value": "opening",
        "label": "开场不够吸引",
        "meaning": "创作调整，重做前报价；适用 highlight、mixed、full；对开场的创作偏好；direction=opening；reason=opening"
       },
       {
        "value": "pacing",
        "label": "节奏拖沓 / 速度不合适",
        "meaning": "创作调整，重做前报价；适用 highlight、mixed、full；对节奏或速度的创作偏好，不自动改播放倍率；direction=angle；reason=slow"
       },
       {
        "value": "ending",
        "label": "结尾悬念不足",
        "meaning": "创作调整，重做前报价；适用 highlight、mixed、full；对结尾悬念的创作偏好；direction=angle；reason=angle"
       },
       {
        "value": "narration-style",
        "label": "解说表达 / 风格不合适",
        "meaning": "创作调整，重做前报价；适用 mixed、full；对解说表达或风格的创作偏好；direction=angle；reason=angle"
       },
       {
        "value": "bgm-mood",
        "label": "BGM 情绪不合适",
        "meaning": "创作调整，重做前报价；适用 highlight、mixed、full；仅bgm=true；对已开配乐情绪的创作偏好；direction=angle；reason=angle"
       },
       {
        "value": "similar",
        "label": "与其他成片过于相似",
        "meaning": "创作调整，重做前报价；适用 highlight、mixed、full；对已有成片内容差异的创作偏好；direction=angle；reason=similar"
       }
      ],
      "behavior": [
       "模式映射：isFullNarration→full；其他narrated→mixed；其余含历史original→highlight",
       "无modes限制的项三结构共用；bgm项仅bgm=true，title项仅title=true；subtitle项未按subtitles开关过滤",
       "全解说不显示对白吞字/断句、解说与原片衔接不自然；高光不显示解说/人物/图文/配音读音及解说风格专属项",
       "BGM和小标题全开：混合18质量+6创作，高光12质量+5创作，全解说16质量+6创作；关闭BGM减少2质量+1创作，关闭小标题减少1质量"
      ],
      "validation": "保存时仍调用issueTypes验证当前适用；非法/不可见类型提示请选择适用于当前素材的问题类型",
      "implementation": "feedback-model.js:ISSUE_TYPES/issueTypes；feedback-ui.js:feedbackForm"
     },
     {
      "name": "类别说明",
      "kind": "text",
      "source": "产品维护的问题类型字典；按制作结构、BGM与小标题开关筛选，不来自投放评分。",
      "default": "质量问题按修复流程处理。",
      "behavior": "选creative后显示创作调整将在重做前确认费用；切回quality恢复质量问题按修复流程处理；不因选类型即时修改成片",
      "copy": [
       "质量问题按修复流程处理。",
       "创作调整将在重做前确认费用。"
      ],
      "implementation": "feedback-ui.js:feedbackForm；app.js:change issueType"
     }
    ],
    "checks": [
     "混合且BGM/小标题开：按分类显示18质量+6创作且默认dialogue；全解说默认context且无对白/混合衔接项。",
     "BGM关时music/music-missing/bgm-mood不可选，title关时title-layout不可选；字幕关仍保留字幕质量项。",
     "切creative类别提示报价，切quality提示修复；伪造不适用类型提交拒绝且无记录/版本/费用写入。"
    ]
   },
   {
    "number": 2,
    "title": "反馈范围",
    "bullets": [
     "默认局部，也可整条；切换保留输入。"
    ],
    "anchor": {
     "selector": ".feedback-scope",
     "index": 0,
     "placement": "left"
    },
    "items": [
     {
      "name": "问题时间段／反馈范围",
      "kind": "field",
      "source": "当前成片总时长、播放器进度及用户输入的局部区间或整条选择。",
      "default": "segment（局部片段）",
      "values": [
       {
        "value": "segment",
        "label": "局部片段",
        "meaning": "按起始及选填结束记录局部范围"
       },
       {
        "value": "all",
        "label": "整条素材",
        "meaning": "记录scope=all、at=0、endAt=duration，不读取时间输入"
       }
      ],
      "behavior": "按钮active/aria-pressed随选择切换；all隐藏issueTimeRange；切回segment显示并保留原输入；不自动提交",
      "validation": "scope非segment/all提示请选择反馈范围",
      "implementation": "feedback-ui.js:feedbackForm；app.js:issue-scope；feedback-model.js:feedbackRange"
     }
    ],
    "checks": [
     "默认局部显示带入的起始和空结束；切整条隐藏时间，再切回保留起始/结束文本。",
     "整条时即使隐藏时间输入无效也按0—duration保存；未知scope提交拒绝，不记问题。"
    ]
   },
   {
    "number": 3,
    "title": "起止时间",
    "bullets": [
     "起始自动带入且必填；结束选填，须晚于起始、不越界。"
    ],
    "anchor": {
     "selector": "#issueTimeRange",
     "index": 0,
     "placement": "left"
    },
    "items": [
     {
      "name": "起始时间",
      "kind": "field",
      "source": "当前成片总时长、播放器进度及用户输入的局部区间或整条选择。",
      "default": "打开弹窗时playerAt格式化到0.1秒，带入当前播放位置",
      "definition": "segment必填；接受非负纯秒数含小数、分:秒、时:分:秒；允许首尾空白；冒号后分/秒<60",
      "behavior": "在局部显示；整条隐藏且忽略；最小0、最大o.duration，源码允许start=duration且结束空",
      "validation": "空、负值、格式错误、非有限或超出duration：请填写成片范围内的起始时间",
      "copy": [
       "已带入当前播放位置",
       "请填写成片范围内的起始时间"
      ],
      "implementation": "feedback-ui.js:feedbackForm；feedback-model.js:parseTimeCode/feedbackRange/formatTimeCode"
     },
     {
      "name": "结束时间（选填）",
      "kind": "field",
      "source": "当前成片总时长、播放器进度及用户输入的局部区间或整条选择。",
      "default": "空，保存endAt=null",
      "definition": "局部选填；非空时格式同起始，且endAt>at、endAt≤duration",
      "behavior": "未填显示起始时间 起；已填显示起始–结束；helper展示素材时长",
      "validation": "格式错、非有限、≤起始或超时长：结束时间需晚于起始时间，且不超过成片时长",
      "implementation": "feedback-ui.js:feedbackForm；feedback-model.js:parseTimeCode/feedbackRange"
     },
     {
      "name": "同类同范围判重",
      "kind": "status",
      "source": "当前成片总时长、播放器进度及用户输入的局部区间或整条选择。",
      "definition": "同type且同scope，|start差|<0.5秒，且两者结束同为空或两者非空且|end差|<0.5秒，视为重复",
      "behavior": [
       "恰好0.5秒差不视为重复；有结束和无结束不相同；all和segment即便0—duration也不同",
       "质量在全部o.issues判重，创作只在当前contentVersion的preferences判重",
       "同类型不同范围可重复记录；不同类型同范围可分别记录；detail差异不绕过判重"
      ],
      "validation": "重复提示这段的问题已记录，不新增反馈、不撤销额外状态、不扣费",
      "implementation": "feedback-model.js:duplicateFeedback/recordOutputIssue/currentPreferences"
     }
    ],
    "checks": [
     "播放35秒打开：start=0:35，end空；保存局部范围at=35、endAt=null并显示0:35 起。",
     "start=0/end=duration正常；start=duration且end空源码允许；空起始、1:60或start>duration拒绝。",
     "end=start、end<start或end>duration拒绝；60.5纯秒、1:00.5、0:01:00.5按合法时间解析。",
     "同类型同范围start/end差<0.5秒拒绝；差=0.5秒允许；不同类型、scope或结束空/非空分别允许。"
    ]
   },
   {
    "number": 4,
    "title": "补充说明",
    "bullets": [
     "选填≤200字，绑定版本及范围；取消不保存。"
    ],
    "anchor": {
     "selector": "#issueDetail",
     "index": 0,
     "placement": "left"
    },
    "items": [
     {
      "name": "补充说明（选填）",
      "kind": "field",
      "source": "当前成片版本、用户问题描述及本次反馈记录；演示记录保存在V7本机状态。",
      "default": "空",
      "definition": "textarea rows=3、maxlength=200；保存String(detail).trim().slice(0,200)，按UTF-16码元计",
      "behavior": "非空展示在反馈卡；空说明省略；说明关联type/range/segmentId和记录时contentVersion，不参与判重",
      "implementation": "feedback-ui.js:feedbackForm；feedback-model.js:recordOutputIssue"
     },
     {
      "name": "问题定位与版本归属",
      "kind": "text",
      "source": "当前成片版本、用户问题描述及本次反馈记录；演示记录保存在V7本机状态。",
      "definition": "segmentId取首个end>at片段，超尾时回退末段；记录id/type/label/category/scope/at/endAt/detail/recordOnly/version",
      "behavior": "审计反馈另存sourceKey、analysisVersion、policyVersion、ruleId/version、batch/output/version与createdAt；整条at=0关联首段；时间恰逢片段end则归下一段",
      "implementation": "feedback-model.js:recordOutputIssue；content-model.js:recordFeedback"
     }
    ],
    "checks": [
     "空说明可提交且反馈卡不出现空段落；输入首尾空白被trim，最多保留200码元。",
     "start恰等片段end关联下一段；start=总时长回退末段；审计记录绑定当前输出、分析/规则及内容版本。"
    ]
   },
   {
    "number": 5,
    "title": "提交与处理",
    "bullets": [
     "质量补救与创作报价分开；记录不升版，实际修复成功后重确认（R-06/R-07）。"
    ],
    "anchor": {
     "selector": "#dialogActions",
     "index": 0,
     "placement": "left"
    },
    "items": [
     {
      "name": "取消",
      "kind": "action",
      "source": "当前成片版本、用户问题描述及本次反馈记录；演示记录保存在V7本机状态。",
      "behavior": "关闭弹窗，不记录反馈、不改确认/状态/版本或积分；再次打开范围恢复局部、结束/说明为空，起始重新取当前进度",
      "implementation": "app.js:close"
     },
     {
      "name": "记录问题",
      "kind": "action",
      "source": "当前成片版本、用户问题描述及本次反馈记录；演示记录保存在V7本机状态。",
      "behavior": [
       "先校验范围、适用类型与判重，成功保存后关弹窗并刷新本条",
       "quality写o.issues、status=issue、quality.status=attention，阻确认/同步；creative写preferences，保留原status，但撤销已确认，仍可人工接受现有创作",
       "两类均清confirmed/confirmedVersion/confirmedAt并写version和recordOnly=true；不改媒体/故事板文本、不升版、不扣积分",
       "审计kind：quality或creative-preference；后续质量走免费局部/整条补救，创作调整走报价返工（R-06/R-07）"
      ],
      "validation": "打开反馈入口在草稿或同步/修复/返工锁下拦截；演示提交apply-issue未再次复核锁/版本，正式需提交时复核当前版本及锁",
      "copy": [
       "请选择适用于当前素材的问题类型",
       "这段的问题已记录"
      ],
      "implementation": "app.js:apply-issue/apply-full-issue；feedback-model.js:recordOutputIssue；content-model.js:recordFeedback"
     },
     {
      "name": "后续处理入口",
      "kind": "text",
      "source": "当前成片版本、用户问题描述及本次反馈记录；演示记录保存在V7本机状态。",
      "behavior": "质量 scope=all 或自动continuity显示整条修复，其他局部修复；创作显示调整这一条；定位始终取记录at；演示修复/重做仅状态/故事板模拟，真实媒体修复成功后才应升版并重确认",
      "implementation": "feedback-ui.js:feedbackItems"
     }
    ],
    "checks": [
     "记录质量后：新增质量卡和审计记录，状态issue，确认撤销而版本不变且余额不变；创作记录不改ready但撤销确认。",
     "验证失败时弹窗保留且无记录/版本/费用写入；取消不保存任何字段，下次打开重新初始化。",
     "同步/修复/返工锁或草稿时反馈入口禁用/拦截；正式在提交时状态变化必须拒绝，本Demo提交缺少此复核。"
    ]
   }
  ]
 },
 "sync-target": {
  "title": "选择同步目标",
  "page": "素材同步目标",
  "background": "",
  "need": "交付时显式选择目标，不根据语言猜测",
  "sections": [
   {
    "number": 1,
    "title": "类型未知的处理",
    "bullets": [
     "仅手动类型未知时选择；已确定绿台来源自动路由。"
    ],
    "anchor": {
     "selector": "#dialogBody > p",
     "index": 0,
     "placement": "left"
    },
    "items": [
     {
      "name": "类型未知说明",
      "kind": "text",
      "definition": "目标只由来源market路由；不根据语言或同名剧猜测",
      "source": "固定目标枚举：国内素材、海外素材；已知绿台分类自动路由，手动未知来源由用户选择。",
      "copy": "当前片源未确定国内或海外类型，请选择目标投放系统。",
      "implementation": "sync-model.js:targetForBatch；sync-ui.js:open/showTarget"
     },
     {
      "name": "路由条件",
      "kind": "status",
      "definition": "green且market合法则直达对应表单；manual/sample/无已知类型才出现选择页",
      "source": "固定目标枚举：国内素材、海外素材；已知绿台分类自动路由，手动未知来源由用户选择。",
      "values": [
       {
        "value": "green/domestic",
        "label": "国内自动匹配",
        "meaning": "直达国内表单"
       },
       {
        "value": "green/overseas",
        "label": "海外自动匹配",
        "meaning": "直达海外表单"
       },
       {
        "value": "manual|sample|unknown",
        "label": "手动选择",
        "meaning": "等待明确目标"
       }
      ],
      "implementation": "sync-model.js:targetForBatch"
     },
     {
      "name": "取消",
      "kind": "action",
      "definition": "关闭目标选择，不创建同步任务",
      "source": "固定目标枚举：国内素材、海外素材；已知绿台分类自动路由，手动未知来源由用户选择。",
      "behavior": "保留已确认成片与历史；不记忆新的上传表单字段",
      "implementation": "sync-ui.js:showTarget；app.js:closeModal"
     }
    ],
    "checks": [
     "正常：国内/海外已知合集直接进入各自表单；手动片源显示两个目标。",
     "边界：中文海外片源仍自动海外；英语国内片源仍国内；取消不新增记录/费用。"
    ]
   },
   {
    "number": 2,
    "title": "国内素材",
    "bullets": [
     "打开国内上传表单，使用国内字典。"
    ],
    "anchor": {
     "selector": ".sync-target-card[data-target=\"domestic\"]",
     "index": 0,
     "placement": "left"
    },
    "items": [
     {
      "name": "国内素材",
      "kind": "action",
      "definition": "选择domestic并打开国内表单",
      "source": "固定目标枚举：国内素材、海外素材；已知绿台分类自动路由，手动未知来源由用户选择。",
      "behavior": "使用国内独立目录/人员/剧集/标签字典；同批同目标恢复有效偏好，上线日期空白",
      "copy": [
       "国内素材",
       "国内投放系统 · 素材管理"
      ],
      "implementation": "sync-ui.js:setTarget/showTarget；sync-model.js:TARGETS/TARGET_DATA"
     },
     {
      "name": "国内目标值",
      "kind": "field",
      "definition": "内部target=domestic；不是语言枚举",
      "source": "固定目标枚举：国内素材、海外素材；已知绿台分类自动路由，手动未知来源由用户选择。",
      "values": [
       {
        "value": "domestic",
        "label": "国内素材",
        "meaning": "国内投放系统"
       }
      ],
      "implementation": "sync-model.js:TARGETS"
     }
    ],
    "checks": [
     "正常：点击国内卡后系统栏国内，所有选择ID属domestic。",
     "边界：不按绿台collectionId直接当素材系统dramaId，手动片源不自动关联剧集。"
    ]
   },
   {
    "number": 3,
    "title": "海外素材",
    "bullets": [
     "打开海外上传表单，清空旧系统字段；取消不建同步任务。"
    ],
    "anchor": {
     "selector": ".sync-target-card[data-target=\"overseas\"]",
     "index": 0,
     "placement": "left"
    },
    "items": [
     {
      "name": "海外素材",
      "kind": "action",
      "definition": "选择overseas并打开海外表单",
      "source": "固定目标枚举：国内素材、海外素材；已知绿台分类自动路由，手动未知来源由用户选择。",
      "behavior": "切目标重建form；清掉上个目标当前草稿，恢复同批海外有效偏好；日期始终空",
      "copy": [
       "海外素材",
       "海外投放系统 · 素材管理"
      ],
      "implementation": "sync-ui.js:setTarget/showTarget；sync-model.js:TARGETS/TARGET_DATA"
     },
     {
      "name": "海外目标值",
      "kind": "field",
      "definition": "内部target=overseas；与国内ID各自独立",
      "source": "固定目标枚举：国内素材、海外素材；已知绿台分类自动路由，手动未知来源由用户选择。",
      "values": [
       {
        "value": "overseas",
        "label": "海外素材",
        "meaning": "海外投放系统"
       }
      ],
      "implementation": "sync-model.js:TARGETS"
     },
     {
      "name": "取消",
      "kind": "action",
      "definition": "关闭，不创建同步记录或上传",
      "source": "固定目标枚举：国内素材、海外素材；已知绿台分类自动路由，手动未知来源由用户选择。",
      "behavior": "不丢失已确认状态",
      "implementation": "sync-ui.js:showTarget"
     }
    ],
    "checks": [
     "正常：国内填表后更换海外，国内选择不能串入海外；日期清空。",
     "边界：即使标签/人员名称相同，也必须用overseas ID；取消不建同步任务。"
    ]
   }
  ]
 },
 "sync-form": {
  "title": "上传素材到投放系统",
  "page": "上传素材弹窗",
  "background": "",
  "need": "单条入口默认上传当前成片，批量入口沿用已选成片",
  "sections": [
   {
    "number": 1,
    "title": "目标系统",
    "bullets": [
     "带入当前/选中成片，无上传区域；目标按来源或手动选择。"
    ],
    "anchor": {
     "selector": ".sync-route-band",
     "index": 0,
     "placement": "left"
    },
    "items": [
     {
      "name": "目标系统栏",
      "kind": "text",
      "definition": "国内/海外投放系统 · 素材管理；自动来源或手动选择说明",
      "source": "绿台片源的国内/海外分类，或手动片源用户明确选择的同步目标。",
      "values": [
       {
        "value": "domestic",
        "label": "国内投放系统 · 素材管理",
        "meaning": "国内字典"
       },
       {
        "value": "overseas",
        "label": "海外投放系统 · 素材管理",
        "meaning": "海外字典"
       }
      ],
      "copy": [
       "已根据国内短剧自动匹配",
       "已根据海外短剧自动匹配",
       "已选择国内素材",
       "已选择海外素材"
      ],
      "implementation": "sync-ui.js:showForm"
     },
     {
      "name": "成片范围",
      "kind": "text",
      "definition": "单条入口传当前行；批量入口传当前批已选ID；没有文件上传区域",
      "source": "本次选中成片的当前版本/确认状态、五项表单、目标系统字典及本次同步任务。原型任务/回执为模拟。",
      "behavior": "提交对象来自任务内的当前版本成片，不可自行上传替换文件",
      "implementation": "sync-ui.js:open/showForm"
     },
     {
      "name": "更换系统",
      "kind": "action",
      "definition": "仅手动目标表单显示",
      "source": "绿台片源的国内/海外分类，或手动片源用户明确选择的同步目标。",
      "behavior": "清除当前target/form并回选择页，重选时重新构建字典与默认值",
      "implementation": "sync-ui.js:sync-change-target"
     },
     {
      "name": "素材基本信息",
      "kind": "action",
      "definition": "可折叠五必填表单",
      "source": "本次选中成片的当前版本/确认状态、五项表单、目标系统字典及本次同步任务。原型任务/回执为模拟。",
      "behavior": "默认展开；提交错误时重新展开并滚动至错误提示",
      "implementation": "sync-ui.js:showForm"
     },
     {
      "name": "同步费用说明",
      "kind": "text",
      "definition": "只用于原型示例结算边界；未接实际目标API或真实钱包",
      "source": "本次选中成片的当前版本/确认状态、五项表单、目标系统字典及本次同步任务。原型任务/回执为模拟。",
      "copy": "本次同步不新增示例积分消耗",
      "implementation": "sync-ui.js:showForm；sync-model.js模块注释"
     }
    ],
    "checks": [
     "正常：单条显示确定同步1条；批量显示实际选中条数；表单五项带必填星号。",
     "边界：来源固定时没有更换系统入口且跨目标提交被拒绝；语言不改变自动路由。"
    ]
   },
   {
    "number": 2,
    "title": "上传目录 · 必填",
    "bullets": [
     "目标系统有效目录；仅同任务同目标复用成功字段。"
    ],
    "anchor": {
     "selector": ".sync-field:has(#syncDirectory)",
     "index": 0,
     "placement": "left"
    },
    "items": [
     {
      "name": "上传目录",
      "kind": "field",
      "definition": "必填单选，ID必须属于当前目标有效目录",
      "source": "当前目标投放系统的上传目录列表；本任务/本目标已通过提交校验的目录偏好。原型为国内或海外示例目录。",
      "default": "同批同目标有有效syncPreferences目录则复用，否则空",
      "values": [
       {
        "value": "",
        "label": "选择上传目录",
        "meaning": "未选择，不能提交"
       },
       {
        "value": "domestic-dir-001",
        "label": "国内投放 / 短剧混剪",
        "meaning": "虚构示例；仅国内目标可用"
       },
       {
        "value": "domestic-dir-002",
        "label": "国内投放 / AI 解说",
        "meaning": "虚构示例；仅国内目标可用"
       },
       {
        "value": "domestic-dir-003",
        "label": "国内投放 / 测试素材",
        "meaning": "虚构示例；仅国内目标可用"
       },
       {
        "value": "overseas-dir-001",
        "label": "海外投放 / 短剧混剪",
        "meaning": "虚构示例；仅海外目标可用"
       },
       {
        "value": "overseas-dir-002",
        "label": "海外投放 / AI 解说",
        "meaning": "虚构示例；仅海外目标可用"
       },
       {
        "value": "overseas-dir-003",
        "label": "海外投放 / 测试素材",
        "meaning": "虚构示例；仅海外目标可用"
       }
      ],
      "validation": "trim后非空且在当前目标directories中；原型未接真实目录权限/失效接口",
      "implementation": "sync-model.js:TARGET_DATA/validateSyncForm；sync-ui.js:setTarget"
     },
     {
      "name": "目录记忆",
      "kind": "text",
      "definition": "目录、人员、标签只记当前批次、当前目标；提交校验通过且发起请求时记忆",
      "source": "当前目标投放系统的上传目录列表；本任务/本目标已通过提交校验的目录偏好。原型为国内或海外示例目录。",
      "behavior": "产品规则：提交校验通过且发起请求时记忆；演示实际：prepareSync通过后、创建本地job时写syncPreferences，不等待传输成功；取消不保存本次目录修改",
      "implementation": "sync-ui.js:submit/setTarget"
     }
    ],
    "checks": [
     "正常：当前目标选有效目录通过；同批同目标再次提交前恢复此值。",
     "边界：空目录提示请选择上传目录；海外表单注入国内ID提示上传目录不属于当前投放系统，请重新选择；失效偏好恢复空。",
     "边界：仅取消填表不记忆目录；传输失败后的已提交目录仍被复用（当前原型实现）。"
    ]
   },
   {
    "number": 3,
    "title": "设计师（剪辑） · 必填",
    "bullets": [
     "目标系统有效且有权限的剪辑人员。"
    ],
    "anchor": {
     "selector": ".sync-field:has(#syncDesigner)",
     "index": 0,
     "placement": "left"
    },
    "items": [
     {
      "name": "设计师（剪辑）",
      "kind": "field",
      "definition": "必填单选；目标系统有效剪辑人员ID",
      "source": "当前目标投放系统的剪辑人员列表及可用人员ID；原型按目标系统使用示例人员，真实账号映射待对接。",
      "default": "同批同目标有效偏好，否则该目标designers[0]（陈剪辑）",
      "values": [
       {
        "value": "",
        "label": "请选择",
        "meaning": "未选择，不能提交"
       },
       {
        "value": "domestic-designer-001",
        "label": "陈剪辑（当前用户）",
        "meaning": "虚构国内人员；不代表真实权限"
       },
       {
        "value": "domestic-designer-002",
        "label": "李剪辑",
        "meaning": "虚构国内人员；不代表真实权限"
       },
       {
        "value": "overseas-designer-001",
        "label": "陈剪辑（当前用户）",
        "meaning": "虚构海外人员；不代表真实权限"
       },
       {
        "value": "overseas-designer-002",
        "label": "周剪辑",
        "meaning": "虚构海外人员；不代表真实权限"
       }
      ],
      "validation": "非空且属于目标designers；正式还须校验有权限，原型没有鉴权",
      "implementation": "sync-model.js:TARGET_DATA/validateSyncForm；sync-ui.js:setTarget"
     },
     {
      "name": "人员记忆",
      "kind": "text",
      "definition": "人员偏好于提交校验通过且发起请求时记忆；按当前批次、当前目标隔离",
      "source": "当前目标投放系统的剪辑人员列表及可用人员ID；原型按目标系统使用示例人员，真实账号映射待对接。",
      "behavior": "演示实际为创建本地同步job时记忆，不等待成功回执；取消不记忆修改；有效偏好失效时回当前目标首位人员",
      "implementation": "sync-ui.js:submit/setTarget"
     }
    ],
    "checks": [
     "正常：初次表单默认陈剪辑；修改后有效提交，再次同批同目标复用。",
     "边界：空值或跨目标人员ID不能提交；取消修改后再次进入仍取原偏好；同名当前用户仍有两套ID。"
    ]
   },
   {
    "number": 4,
    "title": "关联剧集 · 必填",
    "bullets": [
     "能映射则自动带入，否则显式选择目标剧集。"
    ],
    "anchor": {
     "selector": ".sync-field:has(#syncDramaSearch)",
     "index": 0,
     "placement": "left"
    },
    "items": [
     {
      "name": "关联剧集",
      "kind": "field",
      "definition": "必填搜索选择器；提交dramaId而非显示名称",
      "source": "当前目标投放系统的剧集列表；已知绿台合集ID与目标剧集ID的映射。原型使用示例映射，手动来源不自动推断。",
      "default": "已知green来源按当前目标+greenCollectionId映射；无映射/手动源为空",
      "values": [
       {
        "value": "",
        "label": "输入剧集名称搜索并选择",
        "meaning": "未选ID，不能提交"
       },
       {
        "value": "domestic-drama-001",
        "label": "重逢时，她已是王牌（虚构示例）",
        "meaning": "国内 collection-001 映射"
       },
       {
        "value": "domestic-drama-002",
        "label": "她的第二次选择（虚构示例）",
        "meaning": "国内 collection-002 映射"
       },
       {
        "value": "domestic-drama-004",
        "label": "回到相逢那天（虚构示例）",
        "meaning": "无绿台映射，必须显式选择"
       },
       {
        "value": "overseas-drama-001",
        "label": "归来后的新身份（虚构示例）",
        "meaning": "海外 collection-001 映射"
       },
       {
        "value": "overseas-drama-002",
        "label": "最后一页合约（虚构示例）",
        "meaning": "海外 collection-002 映射"
       },
       {
        "value": "overseas-drama-004",
        "label": "重逢的季节（虚构示例）",
        "meaning": "无绿台映射，必须显式选择"
       }
      ],
      "behavior": "聚焦打开列表；trim/忽略大小写按名称子串筛选；键入任意文字立即清空dramaId；点击选项写ID和名称；点外部收起",
      "validation": "不能只输入名称；ID需存在当前目标dramas；collectionId不是目标dramaId",
      "implementation": "sync-model.js:TARGET_DATA/validateSyncForm；sync-ui.js:setTarget/showDramaOptions"
     },
     {
      "name": "映射帮助",
      "kind": "text",
      "definition": "映射时可人工改；未映射时要求显式选择",
      "source": "本次选中成片的当前版本/确认状态、五项表单、目标系统字典及本次同步任务。原型任务/回执为模拟。",
      "copy": [
       "已自动关联，可修改。",
       "请从国内投放系统的剧集列表中选择，不能只输入名称。",
       "请从海外投放系统的剧集列表中选择，不能只输入名称。"
      ],
      "implementation": "sync-ui.js:showForm"
     },
     {
      "name": "搜索无结果",
      "kind": "text",
      "definition": "不自动创建剧集，不提供任意文本提交",
      "source": "本次选中成片的当前版本/确认状态、五项表单、目标系统字典及本次同步任务。原型任务/回执为模拟。",
      "copy": "未找到剧集，请调整关键词或到投放系统维护剧集。",
      "implementation": "sync-ui.js:showDramaOptions"
     },
     {
      "name": "关联剧集复用规则",
      "kind": "text",
      "definition": "不是syncPreferences记忆字段；每次重新根据来源映射或显式选择",
      "source": "当前目标投放系统的剧集列表；已知绿台合集ID与目标剧集ID的映射。原型使用示例映射，手动来源不自动推断。",
      "behavior": "同名/同collectionId跨市场不能串映射；collection-003未配置映射",
      "implementation": "sync-ui.js:setTarget/submit"
     }
    ],
    "checks": [
     "正常：国内collection-001自动domestic-drama-001，海外同ID自动overseas-drama-001。",
     "边界：collection-003或手动示例关联字段空；仅输入完整剧名不算选中，提交提示请选择关联剧集。",
     "边界：修改已映射名称会清空ID；跨目标dramaId被拒绝；无结果文案引导维护目标剧集。"
    ]
   },
   {
    "number": 5,
    "title": "素材标签 · 必填",
    "bullets": [
     "至少一个有效标签；管理沿用目标系统。"
    ],
    "anchor": {
     "selector": ".sync-field:has(.sync-tags-row)",
     "index": 0,
     "placement": "left"
    },
    "items": [
     {
      "name": "素材标签",
      "kind": "field",
      "definition": "必填多选；当前目标固定标签+本机当前目标自定义标签",
      "source": "当前目标投放系统的标签字典及独立保存的新增标签；原型标签按国内/海外隔离。",
      "default": "同批同目标偏好中仍有效的去重标签；否则空数组",
      "values": [
       {
        "value": "domestic-tag-001",
        "label": "原片混剪",
        "meaning": "虚构国内标签"
       },
       {
        "value": "domestic-tag-002",
        "label": "AI 解说",
        "meaning": "虚构国内标签"
       },
       {
        "value": "domestic-tag-003",
        "label": "剧情反转",
        "meaning": "虚构国内标签"
       },
       {
        "value": "domestic-tag-004",
        "label": "女性成长",
        "meaning": "虚构国内标签"
       },
       {
        "value": "overseas-tag-001",
        "label": "原片混剪",
        "meaning": "虚构海外标签"
       },
       {
        "value": "overseas-tag-002",
        "label": "AI 解说",
        "meaning": "虚构海外标签"
       },
       {
        "value": "overseas-tag-003",
        "label": "身份反转",
        "meaning": "虚构海外标签"
       },
       {
        "value": "overseas-tag-004",
        "label": "都市情感",
        "meaning": "虚构海外标签"
       },
       {
        "value": "目标-custom-时间戳",
        "label": "用户新增名称",
        "meaning": "本机Demo当前目标自定义标签"
       }
      ],
      "behavior": "勾选增删并去重，汇总按标签字典顺序用顿号显示",
      "validation": "至少一个；必须字符串且属于当前目标有效标签；无效/跨目标ID拒绝",
      "copy": "请选择标签（可多选）",
      "implementation": "sync-model.js:TARGET_DATA/validateSyncForm；sync-ui.js:tags/tagsHTML"
     },
     {
      "name": "标签管理",
      "kind": "action",
      "definition": "展开/收起本地标签新增区域",
      "source": "当前目标投放系统的标签字典及独立保存的新增标签；原型标签按国内/海外隔离。",
      "behavior": "正式沿用目标系统管理；原型只新增本机示例标签",
      "copy": "新增国内/海外素材标签 · 仅在本 Demo 生效",
      "implementation": "sync-ui.js:sync-tag-manager"
     },
     {
      "name": "新标签名称",
      "kind": "field",
      "definition": "文本输入；前后空格trim；页面maxlength=20",
      "source": "当前目标投放系统的标签字典及独立保存的新增标签；原型标签按国内/海外隔离。",
      "default": "空",
      "validation": "空名称拒绝；同目标完全同名拒绝；原型JS新增路径未二次限制20字",
      "copy": "输入标签名称",
      "implementation": "sync-ui.js:showForm/sync-add-tag"
     },
     {
      "name": "新增",
      "kind": "action",
      "definition": "创建当前目标自定义标签并立即选中",
      "source": "本次选中成片的当前版本/确认状态、五项表单、目标系统字典及本次同步任务。原型任务/回执为模拟。",
      "behavior": "即时写state.customTags和localStorage，清空输入；即使随后取消同步表单，自定义标签仍保留",
      "validation": "空值提示请输入标签名称；重名提示该标签已存在，请直接选择",
      "copy": "已新增示例标签并选中",
      "implementation": "sync-ui.js:sync-add-tag"
     },
     {
      "name": "标签记忆",
      "kind": "text",
      "definition": "标签选择集合于提交校验通过且发起请求时记忆；取消不记忆本次选中修改",
      "source": "当前目标投放系统的标签字典及独立保存的新增标签；原型标签按国内/海外隔离。",
      "behavior": "演示实际为创建本地同步job时记忆；无效偏好ID过滤；新增标签目录本身即时保存，与表单选择偏好记忆不同",
      "implementation": "sync-ui.js:submit/setTarget"
     }
    ],
    "checks": [
     "正常：多选有效标签提交通过，重复选择规范化为唯一ID；新增即选中。",
     "边界：零标签提示至少选择一个；跨系统ID拒绝；取消不记忆新选中集合但已新增的自定义标签仍存在。",
     "边界：空白名称或当前目标同名新增失败；另一个目标不会出现此新增标签。"
    ]
   },
   {
    "number": 6,
    "title": "上线时间 · 必填",
    "bullets": [
     "每次明确填写，不自动填当天/沿用上次；影响保护规则。"
    ],
    "anchor": {
     "selector": ".sync-field:has(#syncOnlineDate)",
     "index": 0,
     "placement": "left"
    },
    "items": [
     {
      "name": "上线时间",
      "kind": "field",
      "definition": "必填日期，标准YYYY-MM-DD真实日历日期",
      "source": "用户本次填写的上线日期；已提交请求重试读取原日期快照。目标系统保护规则用于提示，具体期限待确认。",
      "default": "每次新开/重选目标均为空；不自动当天，不取偏好",
      "validation": "年≥1，月1–12，日按月份/闰年校验；源码没有过去/未来区间限制",
      "copy": "该时间设置后会影响素材保护规则，请谨慎设置！",
      "implementation": "sync-model.js:isCalendarDate/validateSyncForm；sync-ui.js:setTarget/showForm"
     },
     {
      "name": "日期边界",
      "kind": "text",
      "definition": "日期不参与目录/人员/标签偏好记忆；已提交任务的成功记录、结果查询及失败重试均沿用提交快照日期",
      "source": "用户本次填写的上线日期；已提交请求重试读取原日期快照。目标系统保护规则用于提示，具体期限待确认。",
      "behavior": "产品规则：新上传表单每次明确填写，记录/失败重试保留原提交日期不视为新上传记忆；演示实际符合此区别；目标保护期/时区/允许日期范围未实现",
      "implementation": "sync-ui.js:setTarget/submit/retry；sync-model.js:validateSyncForm"
     }
    ],
    "checks": [
     "正常：填写有效日期通过；同批同目标新同步表单仍要求重新填日期。",
     "边界：空日期提示请选择上线时间，2026-02-29/2026-04-31拒绝；2028-02-29通过。",
     "边界：失败重试保持原提交日期，区别于新表单日期不复用；源码无禁止历史或远期日期。"
    ]
   },
   {
    "number": 7,
    "title": "提交校验与取消",
    "bullets": [
     "复核必填、权限及当前版本；提交才创建任务，取消不记忆字段（R-09）。"
    ],
    "anchor": {
     "selector": "#dialogActions",
     "index": 0,
     "placement": "left"
    },
    "items": [
     {
      "name": "确定同步 N 条",
      "kind": "action",
      "definition": "提交校验后创建本地演示job及pending条目，再逐条模拟同步",
      "source": "本次选中成片的当前版本/确认状态、五项表单、目标系统字典及本次同步任务。原型任务/回执为模拟。",
      "behavior": "产品规则：所有项目通过后才发起请求，并记忆当前批次/目标的目录、人员、标签；演示实际：创建本地job，无真实网络请求；保存五字段/目标/来源/成片版本快照，日期不加入偏好",
      "implementation": "sync-ui.js:submit/createJob/runJob；sync-model.js:prepareSync"
     },
     {
      "name": "五必填校验",
      "kind": "text",
      "definition": "目录、设计师、关联剧集、至少1标签、上线日期全部必填；只显示首个校验错误",
      "source": "本次选中成片的当前版本/确认状态、五项表单、目标系统字典及本次同步任务。原型任务/回执为模拟。",
      "copy": [
       "请选择上传目录",
       "请选择设计师（剪辑）",
       "请选择关联剧集",
       "请至少选择一个素材标签",
       "请选择上线时间"
      ],
      "implementation": "sync-model.js:validateSyncForm；sync-ui.js:errors"
     },
     {
      "name": "当前版本与幂等校验",
      "kind": "text",
      "definition": "必须ready+人工确认当前版；不允许草稿/返工/修复；目标按来源一致；同批+素材+V+目标幂等，跨系统也禁止同版重复上传",
      "source": "本次选中成片的当前版本/确认状态、五项表单、目标系统字典及本次同步任务。原型任务/回执为模拟。",
      "behavior": "pending/processing/unknown/success禁止再传；只有明确failed可重试；异常未知状态不能授权重试",
      "validation": "正式权限复核未接入；prepareSync底层未显式检查草稿/返工/修复，当前通过UI前置条件保护，正式提交接口须完整复核",
      "implementation": "sync-ui.js:open/confirmed/canSync；sync-model.js:prepareSync/syncKey"
     },
     {
      "name": "表单错误区域",
      "kind": "text",
      "definition": "role=alert；显示首条错误、展开基本信息并滚动到提示",
      "source": "本次选中成片的当前版本/确认状态、五项表单、目标系统字典及本次同步任务。原型任务/回执为模拟。",
      "default": "hidden",
      "implementation": "sync-ui.js:errors"
     },
     {
      "name": "取消",
      "kind": "action",
      "definition": "关闭表单，不创建job、不新增同步示例消耗",
      "source": "本次选中成片的当前版本/确认状态、五项表单、目标系统字典及本次同步任务。原型任务/回执为模拟。",
      "behavior": "保留已确认状态；本次未提交字段不记忆；已即时新增的自定义标签保留",
      "implementation": "sync-ui.js:showForm；app.js:closeModal"
     }
    ],
    "checks": [
     "正常：五项有效且所选当前版已确认，恰好创建1次job、N条项；费用与钱包不因同步变动。",
     "边界：任一必填/字典/日期/版本非法不建job、不保存本次偏好；全部所选校验通过才提交。",
     "边界：同版本success/pending/processing/unknown或另一系统未决/成功均拒绝重复；failed可单独重试；取消不撤销确认。"
    ]
   }
  ]
 },
 "sync-records": {
  "title": "同步记录列表",
  "page": "同步记录与版本",
  "background": "",
  "need": "按提交时版本保留历史，定位每次目标系统和素材回执。",
  "sections": [
   {
    "number": 1,
    "title": "记录范围",
    "bullets": [
     "查看本批提交历史，保留目标、版本与回执。"
    ],
    "anchor": {
     "selector": "#dialogBody > .sync-modal-note, #dialogBody > .empty",
     "index": 0,
     "placement": "left"
    },
    "items": [
     {
      "name": "记录范围",
      "kind": "text",
      "definition": "默认当前批所有提交；成片行入口额外限定包含该outputId的提交；保留所有内容版本",
      "source": "同步任务的提交字段/版本快照、逐条目标系统回执和错误信息；原型由模拟任务生成，真实素材ID来自对应投放系统。",
      "behavior": "记录是提交历史，不是当前版同步状态列表",
      "copy": "按提交时版本保留记录；修改成片不会覆盖原同步记录。",
      "implementation": "sync-ui.js:records/history"
     },
     {
      "name": "空记录",
      "kind": "text",
      "definition": "当前批/当前素材从未提交过同步",
      "source": "同步任务的提交字段/版本快照、逐条目标系统回执和错误信息；原型由模拟任务生成，真实素材ID来自对应投放系统。",
      "copy": [
       "还没有同步记录",
       "检查并确认成片后，即可同步到素材管理。"
      ],
      "implementation": "sync-ui.js:records"
     }
    ],
    "checks": [
     "正常：当前批列表含全部历史版本，单行入口只列包含此素材的提交。",
     "边界：另一批或同剧另一素材的记录不误入；无记录只展示提示与关闭。"
    ]
   },
   {
    "number": 2,
    "title": "历史提交列表",
    "bullets": [
     "各次提交独立留存，后续编辑不改旧记录。"
    ],
    "anchor": {
     "selector": ".sync-job-items",
     "index": 0,
     "placement": "left"
    },
    "items": [
     {
      "name": "目标与条数",
      "kind": "text",
      "definition": "国内/海外素材 · 本job全部条数",
      "source": "同步任务的提交字段/版本快照、逐条目标系统回执和错误信息；原型由模拟任务生成，真实素材ID来自对应投放系统。",
      "values": [
       {
        "value": "domestic",
        "label": "国内素材",
        "meaning": "国内投放系统提交"
       },
       {
        "value": "overseas",
        "label": "海外素材",
        "meaning": "海外投放系统提交"
       }
      ],
      "implementation": "sync-ui.js:records；sync-model.js:TARGETS"
     },
     {
      "name": "关联剧集与提交时间",
      "kind": "text",
      "definition": "提交时labels.drama与createdAt本地zh-CN时间",
      "source": "同步任务的提交字段/版本快照、逐条目标系统回执和错误信息；原型由模拟任务生成，真实素材ID来自对应投放系统。",
      "behavior": "来源、标签、名称等后续变动不覆写提交快照；新job通过unshift最新在前",
      "implementation": "sync-ui.js:records/createJob"
     },
     {
      "name": "同步统计与重试标记",
      "kind": "text",
      "definition": "此job成功条数；有retryOf时显示失败重试",
      "source": "同步任务的提交字段/版本快照、逐条目标系统回执和错误信息；原型由模拟任务生成，真实素材ID来自对应投放系统。",
      "copy": [
       "N 条已同步",
       "失败重试"
      ],
      "implementation": "sync-ui.js:records"
     },
     {
      "name": "历史保留",
      "kind": "text",
      "definition": "每次提交或失败重试独立job；修改成片/退款/取消确认不自动撤回目标旧素材",
      "source": "同步任务的提交字段/版本快照、逐条目标系统回执和错误信息；原型由模拟任务生成，真实素材ID来自对应投放系统。",
      "behavior": "仅明确重置V7示例会清本机演示记录",
      "implementation": "sync-ui.js:createJob/records/reviewNotice"
     }
    ],
    "checks": [
     "正常：失败重试后保留原job和retry job，成功数各自独立，新的排前。",
     "边界：单素材筛选命中的多素材job仍显示job总条数；原回执不得被新版本覆盖。"
    ]
   },
   {
    "number": 3,
    "title": "查看详情或返回",
    "bullets": [
     "打开单次详情或关闭返回，不再次上传。"
    ],
    "anchor": {
     "selector": "#dialogBody [data-action=\"sync-job-detail\"], #dialogActions",
     "index": 0,
     "placement": "left"
    },
    "items": [
     {
      "name": "查看详情",
      "kind": "action",
      "definition": "只读打开指定job同步详情",
      "source": "同步任务的提交字段/版本快照、逐条目标系统回执和错误信息；原型由模拟任务生成，真实素材ID来自对应投放系统。",
      "behavior": "按job.id定位；不会自动再次上传或修改状态",
      "implementation": "sync-ui.js:sync-job-detail/showJob"
     },
     {
      "name": "关闭",
      "kind": "action",
      "definition": "关闭记录弹窗回原页面",
      "source": "同步任务的提交字段/版本快照、逐条目标系统回执和错误信息；原型由模拟任务生成，真实素材ID来自对应投放系统。",
      "behavior": "保留查询、选择和历史；关闭不是取消正在同步的任务",
      "implementation": "sync-ui.js:records；app.js:closeModal"
     }
    ],
    "checks": [
     "正常：查看详情展示被点击提交的目标/字段/版本，而非当前表单值。",
     "边界：关闭处理中弹窗仍让原型计时任务继续；关闭不删记录或重复上传。"
    ]
   }
  ]
 },
 "sync-detail": {
  "title": "单次素材同步详情",
  "page": "同步结果、查询与重试",
  "background": "",
  "need": "成功保留回执，明确失败才重试，待核实先查询以避免重复上传。",
  "sections": [
   {
    "number": 1,
    "title": "目标与本次汇总",
    "bullets": [
     "区分成功/失败/待核实，显示目标及各条汇总。"
    ],
    "anchor": {
     "selector": ".sync-route-band",
     "index": 0,
     "placement": "left"
    },
    "items": [
     {
      "name": "目标系统与演示标识",
      "kind": "text",
      "definition": "国内/海外投放系统 · 素材管理 + 同步演示",
      "source": "同步任务的提交字段/版本快照、逐条目标系统回执和错误信息；原型由模拟任务生成，真实素材ID来自对应投放系统。",
      "copy": "同步演示",
      "implementation": "sync-ui.js:renderJobBody"
     },
     {
      "name": "本次状态标题",
      "kind": "status",
      "definition": "按job当前汇总状态显示",
      "source": "同步任务的提交字段/版本快照、逐条目标系统回执和错误信息；原型由模拟任务生成，真实素材ID来自对应投放系统。",
      "values": [
       {
        "value": "processing",
        "label": "正在同步",
        "meaning": "存在pending/processing项"
       },
       {
        "value": "success",
        "label": "同步完成",
        "meaning": "全部success"
       },
       {
        "value": "unknown",
        "label": "同步结果待核实",
        "meaning": "无处理中且至少一条unknown"
       },
       {
        "value": "partial",
        "label": "部分素材未同步",
        "meaning": "无处理中/unknown，存在failed；全失败也用partial"
       }
      ],
      "implementation": "sync-ui.js:updateJob/renderJobBody"
     },
     {
      "name": "结果计数",
      "kind": "text",
      "definition": "成功数 / 总条数；失败数、待核实数非零追加",
      "source": "同步任务的提交字段/版本快照、逐条目标系统回执和错误信息；原型由模拟任务生成，真实素材ID来自对应投放系统。",
      "copy": "成功 N / M 条 · 失败 F 条 · 待核实 U 条",
      "implementation": "sync-ui.js:renderJobBody"
     }
    ],
    "checks": [
     "正常：正常场景全success后标题同步完成；partial最后一条失败显示部分素材未同步。",
     "边界：只有一条且失败仍job.status=partial；混有unknown时整体待核实而非当失败重试。"
    ]
   },
   {
    "number": 2,
    "title": "提交时字段",
    "bullets": [
     "保留提交时的五项字段和内容版本快照。"
    ],
    "anchor": {
     "selector": ".sync-record-meta",
     "index": 0,
     "placement": "left"
    },
    "items": [
     {
      "name": "上传目录（只读）",
      "kind": "text",
      "definition": "提交时labels.directory",
      "source": "同步任务的提交字段/版本快照、逐条目标系统回执和错误信息；原型由模拟任务生成，真实素材ID来自对应投放系统。",
      "implementation": "sync-ui.js:createJob/renderJobBody"
     },
     {
      "name": "设计师（剪辑）（只读）",
      "kind": "text",
      "definition": "提交时labels.designer",
      "source": "同步任务的提交字段/版本快照、逐条目标系统回执和错误信息；原型由模拟任务生成，真实素材ID来自对应投放系统。",
      "implementation": "sync-ui.js:createJob/renderJobBody"
     },
     {
      "name": "关联剧集（只读）",
      "kind": "text",
      "definition": "提交时labels.drama；不跟随后续目标剧目映射变化",
      "source": "同步任务的提交字段/版本快照、逐条目标系统回执和错误信息；原型由模拟任务生成，真实素材ID来自对应投放系统。",
      "implementation": "sync-ui.js:createJob/renderJobBody"
     },
     {
      "name": "素材标签（只读）",
      "kind": "text",
      "definition": "提交时labels.tags快照，用顿号展示",
      "source": "同步任务的提交字段/版本快照、逐条目标系统回执和错误信息；原型由模拟任务生成，真实素材ID来自对应投放系统。",
      "implementation": "sync-ui.js:createJob/renderJobBody"
     },
     {
      "name": "上线时间（只读）",
      "kind": "text",
      "definition": "提交时form.onlineDate；YYYY-MM-DD",
      "source": "同步任务的提交字段/版本快照、逐条目标系统回执和错误信息；原型由模拟任务生成，真实素材ID来自对应投放系统。",
      "implementation": "sync-ui.js:createJob/renderJobBody"
     },
     {
      "name": "版本快照说明",
      "kind": "text",
      "definition": "每条标题附提交时V；job另留source、form、文件名与确认时间快照",
      "source": "同步任务的提交字段/版本快照、逐条目标系统回执和错误信息；原型由模拟任务生成，真实素材ID来自对应投放系统。",
      "copy": "记录对应提交时的成片版本。",
      "implementation": "sync-ui.js:createJob/renderJobBody"
     }
    ],
    "checks": [
     "正常：详情五字段与原提交相同，标签为当时文本，不展示编辑控件。",
     "边界：当前成片升版、改配置或标签目录变化，旧详情的字段/版本不变。"
    ]
   },
   {
    "number": 3,
    "title": "逐条回执与错误",
    "bullets": [
     "成功留素材ID/时间，失败或未知显示原因；成功项不重传。"
    ],
    "anchor": {
     "selector": ".sync-job-items",
     "index": 0,
     "placement": "left"
    },
    "items": [
     {
      "name": "逐条名称与版本",
      "kind": "text",
      "definition": "title + Vitem.version；不以当前内容版本替代历史",
      "source": "同步任务的提交字段/版本快照、逐条目标系统回执和错误信息；原型由模拟任务生成，真实素材ID来自对应投放系统。",
      "implementation": "sync-ui.js:renderJobBody"
     },
     {
      "name": "逐条同步状态",
      "kind": "status",
      "definition": "排队/处理中/成功/失败/结果未知分开显示",
      "source": "同步任务的提交字段/版本快照、逐条目标系统回执和错误信息；原型由模拟任务生成，真实素材ID来自对应投放系统。",
      "values": [
       {
        "value": "pending",
        "label": "等待同步",
        "meaning": "排队且锁定当前版本"
       },
       {
        "value": "processing",
        "label": "同步中",
        "meaning": "传输处理中且锁定当前版本"
       },
       {
        "value": "success",
        "label": "已同步",
        "meaning": "保留素材回执；禁止同版本重复上传"
       },
       {
        "value": "failed",
        "label": "同步失败",
        "meaning": "明确失败；当前版本仍确认可用时允许失败重试"
       },
       {
        "value": "unknown",
        "label": "待核实结果",
        "meaning": "结果不明；必须先查询，锁定当前版本"
       }
      ],
      "implementation": "sync-ui.js:statusName/renderJobBody"
     },
     {
      "name": "成功回执",
      "kind": "text",
      "definition": "materialId与syncedAt zh-CN时间；成功清error",
      "source": "同步任务的提交字段/版本快照、逐条目标系统回执和错误信息；原型由模拟任务生成，真实素材ID来自对应投放系统。",
      "behavior": "原型素材ID为CN-DEMO-/OS-DEMO-开头虚构标识，不是真实接口回执",
      "implementation": "sync-ui.js:completeItem/renderJobBody"
     },
     {
      "name": "失败/未知原因",
      "kind": "text",
      "definition": "error短文案，待核实不能当明确失败",
      "source": "同步任务的提交字段/版本快照、逐条目标系统回执和错误信息；原型由模拟任务生成，真实素材ID来自对应投放系统。",
      "copy": [
       "示例：素材传输失败，可只重试该条",
       "示例：请求超时，需查询目标系统结果后再决定是否重试",
       "页面刷新中断演示，请先查询结果，避免重复上传"
      ],
      "implementation": "sync-ui.js:runJob/initialize/renderJobBody"
     }
    ],
    "checks": [
     "正常：成功项有ID/时间且无error；失败/unknown有原因且不伪造成功回执。",
     "边界：刷新把遗留pending/processing标unknown，保留原条目与版本；已成功项不改unknown且不重传。"
    ]
   },
   {
    "number": 4,
    "title": "查询、重试与返回",
    "bullets": [
     "未知先查询，明确失败仅重试失败项；同步中/待核实锁定内容与确认（R-09）。"
    ],
    "anchor": {
     "selector": "#dialogActions",
     "index": 0,
     "placement": "left"
    },
    "items": [
     {
      "name": "全部同步记录",
      "kind": "action",
      "definition": "回当前批记录列表",
      "source": "同步任务的提交字段/版本快照、逐条目标系统回执和错误信息；原型由模拟任务生成，真实素材ID来自对应投放系统。",
      "behavior": "只导航，不上传",
      "implementation": "sync-ui.js:renderJobBody/records"
     },
     {
      "name": "查询同步结果",
      "kind": "action",
      "definition": "仅有unknown项时显示",
      "source": "同步任务的提交字段/版本快照、逐条目标系统回执和错误信息；原型由模拟任务生成，真实素材ID来自对应投放系统。",
      "behavior": "点击按钮禁用且显示查询中…；原型600ms后把该job未知项模拟为success，不重复上传",
      "validation": "正式应查询目标真实结果并记录success/failed/仍unknown；不能把演示默认成功当接口行为",
      "copy": "已核实示例结果，未重复上传素材",
      "implementation": "sync-ui.js:query/renderJobBody"
     },
     {
      "name": "仅重试失败 N 条",
      "kind": "action",
      "definition": "只有明确failed才显示",
      "source": "同步任务的提交字段/版本快照、逐条目标系统回执和错误信息；原型由模拟任务生成，真实素材ID来自对应投放系统。",
      "behavior": "仅failed候选；复用原目标和五字段，创建retryOf新job；正常场景模拟，成功/待核实项不传",
      "validation": "当前内容版本必须与失败提交一致并保持确认；变版拒绝并要求从成片列表重新确认同步",
      "copy": "失败素材的内容版本已变化，请重新确认并从成片列表同步新版本",
      "implementation": "sync-ui.js:retry；sync-model.js:prepareSync"
     },
     {
      "name": "关闭",
      "kind": "action",
      "definition": "关闭详情不取消在途任务",
      "source": "同步任务的提交字段/版本快照、逐条目标系统回执和错误信息；原型由模拟任务生成，真实素材ID来自对应投放系统。",
      "behavior": "成功/失败/未知及回执继续保存",
      "implementation": "sync-ui.js:renderJobBody；app.js:closeModal"
     },
     {
      "name": "同步锁与解锁",
      "kind": "status",
      "definition": "当前版pending/processing/unknown锁定编辑、修复、返工及确认；success只禁同版重复上传，failed允许重试",
      "source": "同步任务的提交字段/版本快照、逐条目标系统回执和错误信息；原型由模拟任务生成，真实素材ID来自对应投放系统。",
      "behavior": "查询确认成功/失败后解除未决锁；实际编辑成功升版后需重新人工确认；旧成功素材不会自动替换/撤回",
      "implementation": "sync-ui.js:locked/canSync；app.js:reviewView/confirmModal/openRework"
     }
    ],
    "checks": [
     "正常：partial只重试最后失败条；原成功项ID/时间保持，新增job只含失败条。",
     "边界：unknown只有查询无重试；查询期间禁用防重复，未知变success后可查记录且不再允许同版同步。",
     "边界：失败条已升版则拒绝旧job重试；关闭弹窗不解除锁；刷新未知锁仍保留。"
    ]
   }
  ]
 },
 "demo-tools": {
  "title": "演示设置",
  "page": "原型演示辅助",
  "background": "",
  "need": "使用独立演示入口制造测试条件，不作为剪辑日常参数或实际生产能力。",
  "sections": [
   {
    "number": 1,
    "title": "生成场景",
    "bullets": [
     "预设成功/失败/补救场景，仅作用下一批，未检测真实视频。"
    ],
    "anchor": {
     "selector": "#generationScenario",
     "index": 0,
     "placement": "left"
    },
    "items": [
     {
      "name": "生成场景",
      "kind": "field",
      "definition": "只供原型流程条件测试，不检测真实媒体",
      "source": "V7本机演示配置、页面编辑会话与保存记录；不属于正式业务系统数据源或权限机制。",
      "default": "toolsScenario=normal；此变量不随state保存，刷新恢复normal",
      "values": [
       {
        "value": "normal",
        "label": "全部成功",
        "meaning": "全部模拟自动检查通过"
       },
       {
        "value": "partial",
        "label": "最后一条制作失败",
        "meaning": "最后/唯一条制作失败，释放其冻结额；原型quality.status同样设failed"
       },
       {
        "value": "qc-repair",
        "label": "自动修复后通过",
        "meaning": "最后/唯一条模拟检查→自动修复→通过"
       },
       {
        "value": "qc-attention",
        "label": "一条需人工核对",
        "meaning": "最后/唯一条生成后status=issue，含剧情衔接需核对问题"
       },
       {
        "value": "qc-fail",
        "label": "一条检查失败释放积分",
        "meaning": "最后/唯一条质检失败，冻结额度释放"
       }
      ],
      "behavior": "产品要求：场景仅作用下一批。演示实际：保存后toolsScenario没有消费后复位，持续影响后续新批；刷新恢复normal。此矛盾见discrepancies，不能当正式目标行为",
      "copy": "仅影响下一批",
      "implementation": "app.js:demo-tools/save-tools/scheduleGenerated"
     },
     {
      "name": "单条返工场景",
      "kind": "field",
      "definition": "只供被操作单条的返工演示",
      "source": "V7本机演示配置、页面编辑会话与保存记录；不属于正式业务系统数据源或权限机制。",
      "default": "state.reworkScenario || normal",
      "values": [
       {
        "value": "normal",
        "label": "成功生成新版本",
        "meaning": "返工成功应用新内容V、重新确认"
       },
       {
        "value": "failed",
        "label": "失败保留原片",
        "meaning": "返工失败保留旧内容/旧版本，处理该次冻结额"
       }
      ],
      "copy": "不影响其他成片",
      "implementation": "app.js:demo-tools/save-tools/submitRework"
     }
    ],
    "checks": [
     "正常：每种场景只把最后/唯一条设特殊结果；其他成片不被一起失败。",
     "边界：qc-attention不得自动确认或同步；qc-fail释放示例冻结积分；原型没有真实视频检测。",
     "产品边界验收：若遵循“仅影响下一批”，首批消费场景后后续新批应恢复正常；当前演示没有复位，需修正文案或实现，不把现状写成目标行为。"
    ]
   },
   {
    "number": 2,
    "title": "素材同步场景",
    "bullets": [
     "演示正常/失败/待核实流程，未提交真实系统。"
    ],
    "anchor": {
     "selector": "#syncScenario",
     "index": 0,
     "placement": "left"
    },
    "items": [
     {
      "name": "素材同步场景",
      "kind": "field",
      "definition": "仅本地模拟，不请求国内/海外真实素材系统",
      "source": "V7本机演示配置、页面编辑会话与保存记录；不属于正式业务系统数据源或权限机制。",
      "default": "state.syncScenario=normal",
      "values": [
       {
        "value": "normal",
        "label": "全部成功",
        "meaning": "所有项产生虚构素材ID和回执时间"
       },
       {
        "value": "partial",
        "label": "最后一条失败",
        "meaning": "最后/唯一项failed，其他success"
       },
       {
        "value": "unknown",
        "label": "结果待核实",
        "meaning": "最后/唯一项unknown，其他success，必须先查询"
       }
      ],
      "behavior": "保存入state并本机持久化；创建job时保存场景；改变设置不回溯旧job",
      "copy": "同步为本地模拟",
      "implementation": "app.js:demo-tools/save-tools；sync-ui.js:runJob"
     }
    ],
    "checks": [
     "正常：normal/partial/unknown分别走成功、失败重试、查询流程。",
     "边界：单条partial显示部分素材未同步且允许只重试1条；unknown不自动重试；无真实外部提交/扣费。"
    ]
   },
   {
    "number": 3,
    "title": "原片版本与手动片源",
    "bullets": [
     "更换原片版本验证新分析；手动示例同步时选目标。"
    ],
    "anchor": {
     "selector": "#dialogBody [data-action=\"new-source-version\"]",
     "index": 0,
     "placement": "left"
    },
    "items": [
     {
      "name": "更换原片版本",
      "kind": "action",
      "definition": "当前source.fileVersion加1，演示新版本分析隔离",
      "source": "V7本机演示配置、页面编辑会话与保存记录；不属于正式业务系统数据源或权限机制。",
      "behavior": "关闭设置弹窗并保存；提示需重新分析；同dramaKey，不新增剧目身份；旧资产/批次快照保留",
      "copy": "已切换新的示例原片版本，需要重新分析",
      "implementation": "app.js:new-source-version；engine.js:assetKey"
     },
     {
      "name": "手动片源示例 · 切换",
      "kind": "action",
      "definition": "新建simulated manual资产身份",
      "source": "V7本机演示配置、页面编辑会话与保存记录；不属于正式业务系统数据源或权限机制。",
      "behavior": "assetId=manual-UUID；fileVersion=1；取材1–30；保存后进入制作页；类型未定，同步显式选目标",
      "copy": "同步时选择国内或海外",
      "implementation": "app.js:manual-source；sources.js:resolveSource"
     },
     {
      "name": "版本/手动边界",
      "kind": "text",
      "definition": "都是虚构30集示例，不上传真实媒体、不替换旧成片",
      "source": "V7本机演示配置、页面编辑会话与保存记录；不属于正式业务系统数据源或权限机制。",
      "behavior": "新版本/语言对应独立分析缓存；手动每次切换assetId不同",
      "implementation": "sources.js:resolveSource；engine.js:assetKey"
     }
    ],
    "checks": [
     "正常：更换版本后复用分析按新assetKey重算；旧批仍保留旧原片版本。",
     "边界：相同剧fileVersion+1仍同剧；手动切换不直接创建任务，同步不按语言猜目标。"
    ]
   },
   {
    "number": 4,
    "title": "重置与保存",
    "bullets": [
     "保存演示配置，重置另行确认；正式后台/取消规则见 R-10。"
    ],
    "anchor": {
     "selector": "#dialogActions",
     "index": 0,
     "placement": "left"
    },
    "items": [
     {
      "name": "保存设置",
      "kind": "action",
      "definition": "读取生成/同步/单条返工三个当前选择",
      "source": "V7本机演示配置、页面编辑会话与保存记录；不属于正式业务系统数据源或权限机制。",
      "behavior": "保存sync/rework到state；generation保存运行时toolsScenario；关闭弹窗，提示演示设置已保存",
      "implementation": "app.js:save-tools"
     },
     {
      "name": "重置",
      "kind": "action",
      "definition": "先打开最终重置确认弹窗",
      "source": "V7本机演示配置、页面编辑会话与保存记录；不属于正式业务系统数据源或权限机制。",
      "behavior": "不在本入口直接清数据；最终确认见reset",
      "copy": "只清除 V7 本机示例记录",
      "implementation": "app.js:reset-prompt"
     },
     {
      "name": "演示与正式边界",
      "kind": "text",
      "definition": "演示设置不属于剪辑日常生成参数；真实后台任务/暂停取消/断网重启见R-10",
      "source": "V7本机演示配置、页面编辑会话与保存记录；不属于正式业务系统数据源或权限机制。",
      "behavior": "当前原型计时状态只在持有编辑会话的页面运行，不能据此承诺后台处理能力",
      "implementation": "review-notes.js:demo-tools；demo-session.js模块注释"
     }
    ],
    "checks": [
     "正常：保存后新建任务使用所选演示条件，不回改已有成片/同步回执。",
     "边界：打开重置提示后取消，全部任务/分析/规则/积分保留；未点保存的选择不写入state。"
    ]
   }
  ]
 },
 "reset": {
  "title": "重置 V7 演示",
  "page": "原型演示辅助",
  "background": "",
  "need": "明确重置范围并要求最终确认，避免误删本版测试记录。",
  "sections": [
   {
    "number": 1,
    "title": "重置范围",
    "bullets": [
     "只清V7本机示例，V6数据与锁独立。"
    ],
    "anchor": {
     "selector": "#dialogBody",
     "index": 0,
     "placement": "left"
    },
    "items": [
     {
      "name": "重置范围说明",
      "kind": "text",
      "definition": "清除本机V7示例任务、分析、标准和积分记录；其他版本独立",
      "source": "V7本机演示配置、页面编辑会话与保存记录；不属于正式业务系统数据源或权限机制。",
      "copy": "清除本机 V7 示例任务、分析、标准与积分记录。其他版本不受影响。",
      "implementation": "app.js:reset-prompt/reset；platform-context.js:MIXED_CUT_STORAGE_KEY"
     },
     {
      "name": "数据边界",
      "kind": "text",
      "definition": "KEY=mixed-cut-v7-demo；编辑锁mixed-cut-v7-editor；恢复initialState，包含空批次/同步记录/自定义标签/反馈及默认规则/分析和10000示例余额",
      "source": "V7本机演示配置、页面编辑会话与保存记录；不属于正式业务系统数据源或权限机制。",
      "behavior": "覆盖V7单一storage记录而非清空全部localStorage；不接真实系统，不撤回真实素材",
      "implementation": "engine.js:initialState；demo-session.js:EDITOR_LOCK；app.js:reset"
     }
    ],
    "checks": [
     "正常：提示明确V7本机与数据类型，没有暗示能删除真实账号记录。",
     "边界：V6/其他localStorage数据与锁不被清空；关闭提示不重置。"
    ]
   },
   {
    "number": 2,
    "title": "取消保留",
    "bullets": [
     "取消保留记录。"
    ],
    "anchor": {
     "selector": "#dialogActions [data-action=\"close\"]",
     "index": 0,
     "placement": "left"
    },
    "items": [
     {
      "name": "取消",
      "kind": "action",
      "definition": "关闭确认弹窗",
      "source": "V7本机演示配置、页面编辑会话与保存记录；不属于正式业务系统数据源或权限机制。",
      "behavior": "保留当前state、任务、分析、标准、费用及同步记录",
      "copy": "取消",
      "implementation": "app.js:reset-prompt/closeModal"
     }
    ],
    "checks": [
     "正常：取消后回原页面，记录/余额完全保留。",
     "边界：处理中取消重置弹窗不会取消原任务或解除同步未知锁。"
    ]
   },
   {
    "number": 3,
    "title": "确认重置",
    "bullets": [
     "终止本版未完成演示并恢复初始页，不操作真实系统。"
    ],
    "anchor": {
     "selector": "#dialogActions [data-action=\"reset\"]",
     "index": 0,
     "placement": "left"
    },
    "items": [
     {
      "name": "重置示例",
      "kind": "action",
      "definition": "最终确认后立即恢复V7初始数据与制作页",
      "source": "V7本机演示配置、页面编辑会话与保存记录；不属于正式业务系统数据源或权限机制。",
      "behavior": "清生成/同步定时器、作废分析operation；重置批次/当前成片/队列/返工草稿/筛选/演示场景；保存初始state；关闭弹窗",
      "copy": "重置示例",
      "implementation": "app.js:reset；engine.js:initialState；sync-ui.js:reset"
     },
     {
      "name": "初始恢复结果",
      "kind": "text",
      "definition": "国内collection-001、1–30集、高光10条、3–5分钟、1.5×；默认规则与前10集示例分析；任务/同步/账本为空，余额10000",
      "source": "V7本机演示配置、页面编辑会话与保存记录；不属于正式业务系统数据源或权限机制。",
      "behavior": "恢复制作素材页；初始来源、规则、前10集已分析均为虚构演示数据；正式重置范围应按平台权限与记录策略另行定义",
      "implementation": "engine.js:DEFAULT/initialState"
     }
    ],
    "checks": [
     "正常：确认后制作页显示默认配置，旧V7任务/同步记录/自定义标签清空，示例余额10000。",
     "边界：旧计时回调不能重建已清任务或晚扣费；V6数据保留；真实系统无任何删除请求。"
    ]
   }
  ]
 },
 "generation-stale": {
  "title": "制作依据已更新",
  "page": "分析与自动编排",
  "background": "",
  "need": "依据更新时返回调整并重新提交，不允许绕过更新沿用旧内容。",
  "sections": [
   {
    "number": 1,
    "title": "依据更新提示",
    "bullets": [
     "依据更新后旧未开工规划不再提交，历史/进行中保留快照（R-11）。"
    ],
    "anchor": {
     "selector": "#dialogBody",
     "index": 0,
     "placement": "left"
    },
    "items": [
     {
      "name": "制作依据已更新提示",
      "kind": "status",
      "definition": "旧规划的分析或制作标准与当前生效依据不一致，阻止旧规划开始制作。",
      "source": "当前片源/选集、有效分析缓存、标准版本和内部候选编排结果；原型按虚构剧情模拟，真实分析/候选来自制作服务。",
      "copy": "剧情分析或制作标准已更新，请重新提交生成。",
      "behavior": "演示实际：比较当前资产分析修订与计划分析修订、计划标准ID与当前标准ID；没有比较同一标准ID下的版本号。产品要求：任何分析/标准版本更新都使未开工规划重新计算，进行中与历史任务保留快照，失败补生成沿原批依据（R-11）。旧规划拦截不冻结、不结算制作费，已完成分析不回滚。",
      "implementation": "app.js generate的提交前复核"
     }
    ],
    "checks": [
     "计划后修改对应分析修订或切换当前标准ID，再提交显示更新提示且不建任务。",
     "同标准ID只改版本当前演示不会触发此检查；作为正式版本复核待实现差异记录。",
     "提示出现后历史批次内容、快照、费用及确认不受影响。"
    ]
   },
   {
    "number": 2,
    "title": "返回调整",
    "bullets": [
     "回配置重新生成，有效分析继续复用。"
    ],
    "anchor": {
     "selector": "#dialogActions [data-action=\"create\"]",
     "index": 0,
     "placement": "left"
    },
    "items": [
     {
      "name": "返回调整",
      "kind": "action",
      "definition": "关闭过期提示并回制作配置页。",
      "source": "当前片源/选集、有效分析缓存、标准版本和内部候选编排结果；原型按虚构剧情模拟，真实分析/候选来自制作服务。",
      "behavior": "保留当前配置，不自动绕过过期校验。重新点生成按当前依据分析/复用与编排；仍有效的同片源分析继续复用，报价重新计算。",
      "implementation": "app.js create"
     },
     {
      "name": "右上角关闭",
      "kind": "action",
      "definition": "仅收起更新提示。",
      "source": "当前片源/选集、有效分析缓存、标准版本和内部候选编排结果；原型按虚构剧情模拟，真实分析/候选来自制作服务。",
      "behavior": "不重新生成、不授权旧规划开工；仍需重新提交。",
      "implementation": "通用关闭动作"
     }
    ],
    "checks": [
     "点返回调整回制作页，已有配置保留；重新生成用当前依据建立新规划。",
     "点×不会自动继续旧计划或扣制作费。",
     "新规划仅补有效缓存缺失部分，不能重复收同份分析费。"
    ]
   }
  ]
 }
};
