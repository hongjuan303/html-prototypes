/* Field-by-field product specification, keyed to the rendered prototype. */
window.KSPrototypeNotes = (() => {
  const list=xs=>`<ul>${xs.map(x=>`<li>${x}</li>`).join('')}</ul>`;
  const E=(selector,label,...rules)=>({selector,label,rules});
  const A=(action,label,...rules)=>E(`[data-action="${action}"]`,label,...rules);
  const F=(key,label,...rules)=>E(`#field-${key}>label`,label,...rules);
  const T=(table,n,label,...rules)=>E(`${table} th:nth-child(${n})`,label,...rules);
  const group=(title,entries)=>({title,entries});
  const filter=(key,label,...rules)=>E(`[data-record-filter="${key}"]`,label,...rules);
  const queryActions=()=>[
    A('search-collections','查询','按搜索框与短剧类型组合查询；搜索框按回车也可查询。筛选后保留此前勾选的合集与账号配置。'),
    A('reset-collections','重置','清空关键词，短剧类型恢复“全部短剧类型”；保留已选合集和账号配置。')
  ];
  const pickerFilters=()=>[
    E('#collectionSearch','搜索合集名称 / 合集ID','单个搜索框；默认空。按合集名称或合集ID包含关键词匹配。此处与上传记录页的“合集ID精确匹配”筛选不同。'),
    E('#collectionType','短剧类型','单选：全部短剧类型、AI剧、真人剧；默认全部。这里展示绿台源合集类型，快手渠道的内容类型在配置资料中单独核对。')
  ];
  const pickerColumns=source=>[
    T('.picker-table',1,'勾选 / 全选当前筛选合集','勾选决定本次上传范围。全选只作用于当前筛选结果；取消勾选不清除该合集已有的目标账号配置。'),
    T('.picker-table',2,'合集信息','同一列展示封面、合集名称、合集ID，均来自绿台源合集。'),
    T('.picker-table',3,'短剧类型','展示源合集的AI剧或真人剧；与上方“短剧类型”筛选一致。'),
    T('.picker-table',4,'可用 / 总集数','展示已关联可用源视频的集数 / 合集总集数；下方展示已完结或连载中。可用数不足总集数时突出提示。'),
    T('.picker-table',5,'内容标签','展示绿台合集现有标签；快手分类在配置资料中继续核对。'),
    T('.picker-table',6,'更新时间','展示绿台源合集的最近更新时间。'),
    T('.picker-table',7,source?'快手上传记录':'目标快手账号（可多选）',source?'该合集存在任一上传记录时显示“已关联快手”，否则显示“可新建”；是否可上传到某个账号仍按“合集＋账号”查重。':'按账号名称逐个显示标签；未配置时显示“未设置目标账号”，失效账号用红色提示。未勾选合集仍保留并展示配置。'),
    E('.selection-count','已选择合集 / 集数','按全部已勾选合集统计合集数、源分集总数，不受当前筛选是否显示该合集影响。'),
    ...(!source?[E('.target-toolbar>span','已配置账号 / 将生成上传记录','已配置数按选中合集是否有账号统计；上传记录数为选中合集的目标账号数量之和。无效或重复组合在进入下一步时拦截。')]:[]),
    E('.pagination','合集数量 / 分页','展示当前筛选结果总数及“10条 / 页”。当前示例共8部合集，展示第1页。')
  ];
  const accountRules=[
    '弹窗内“搜索快手账号名称或ID”按包含关键词筛选；账号列表支持多选，展示账号名称、ID、授权及已有记录情况。搜索不清除已勾选账号。',
    '授权失效账号不可选；所有目标合集均已有记录的账号不可选，部分重复的组合在确认时跳过。',
    '确认设置：用弹窗所选账号覆盖作用范围内的原配置；允许清空，后续进入配置资料前需为每部已选合集至少设置一个有效账号。成功提示更新合集数及跳过组合数。取消或关闭不应用修改。'
  ];
  const saveEntry=editing=>A('save-draft',editing?'保存编辑草稿':'保存草稿',editing?'仅保存当前记录的编辑资料，不覆盖新增上传草稿。':'至少已选一部合集时可用；保存已选合集、所有已配置目标账号、资料及当前步骤，提示保存结果；上传记录页可继续编辑。');
  const exitEntry=editing=>A('exit-flow',editing?'取消 / 返回短剧列表':'取消 / 返回上传记录','打开离开确认：继续编辑留在当前页；不保存离开返回列表，不更新已保存草稿；保存草稿并离开先保存再返回。'+(editing?'编辑草稿与新增上传草稿分别保存。':''));
  const records=()=>({
    title:'上传记录',intro:'本页是绿台 → 版权管理 → 快手原生上剧的上传记录页。',background:'同一合集可上传到多个快手账号，需要分别跟进上传、审核与售卖结果。',requirement:'按“合集＋快手账号”管理独立记录，并提供查询、编辑、重试、上下架与预约操作。',groups:[
      group('筛选项',[
        E('.account-filter>.filter-label','快手号','支持多选；默认全部快手号。同一账号组内满足任一已选账号即可，与其他筛选条件同时匹配。'),
        filter('title','快手短剧名称','输入框；默认空，按快手短剧名称模糊匹配。'),
        filter('collectionName','合集名称','输入框；默认空，按绿台合集名称模糊匹配。'),
        filter('collectionId','合集ID','输入框；默认空，按完整绿台合集ID精确匹配。'),
        filter('audit','审核状态','单选，默认全部；枚举：待提交、审核中、发布中、审核未通过、发布成功。'),
        filter('type','内容类型','单选，默认全部；枚举：真人剧、漫剧。'),
        filter('sale','售卖方式','单选，默认全部；枚举：全剧付费、单集+全剧付费、观看广告解锁。'),
        filter('saleState','售卖状态','单选，默认全部；仅已上架、已下架。'),
        filter('miniId','快手短剧ID','输入框；默认空，按完整快手短剧ID精确匹配。'),
        E('.date-range>span','创建时间','开始、结束日期可分别填写，边界包含当天，按北京时间查询。开始晚于结束时阻止查询并提示。全部筛选常驻展示。')
      ]),
      group('列表项',[
        T('.management-table',1,'勾选 / 全选当前页上传记录','用于批量重试；全选只作用于当前页。查询后清空已选记录。'),
        T('.management-table',2,'快手号','展示目标快手账号名称及账号ID。每个“合集＋账号”组合单独一条记录。'),
        T('.management-table',3,'快手短剧名称 / 封面','同列展示渠道短剧名称、整剧封面与快手短剧ID；尚未创建平台短剧时ID显示“待创建”，已生成ID可复制。存在编辑草稿时显示“有编辑草稿”。'),
        T('.management-table',4,'绿台合集名称 / 合集ID','同列展示来源合集名称及可复制的绿台合集ID；与可编辑的快手短剧名称分别保存。'),
        T('.management-table',5,'售卖方式','展示全剧付费、单集+全剧付费或观看广告解锁，未知值显示“—”。'),
        T('.management-table',6,'内容类型','展示真人剧或漫剧。'),
        T('.management-table',7,'上传进度','展示等待上传、创建短剧、上传中、提交中、上传完成或上传失败，以及已上传集数 / 总集数和进度条。失败时提供“查看上传失败原因”，打开仅展示失败原因文案的独立弹窗。'),
        T('.management-table',8,'审核状态','展示待提交、审核中、发布中、审核未通过、发布成功；与上传进度、售卖状态分别记录。'),
        T('.management-table',9,'审核原因','展示平台返回的审核原因，空值显示“—”；长文可悬浮查看，点击“展开”进入详情查看完整内容。'),
        T('.management-table',10,'售卖状态','展示已上架或已下架；有平台处置原因时在下方展示。预约状态、预约时间不作为列表列。'),
        T('.management-table',11,'操作人','仅展示最近一次人工操作人；无后续人工操作时展示创建人，未知值显示“—”。'),
        T('.management-table',12,'创建时间','绿台上传记录的创建时间；日期、时刻分行，按北京时间展示。'),
        T('.management-table',13,'修改时间','最近一次人工修改、重试或上下架操作时间；空值显示“—”。系统执行预约不替换人工操作人及修改时间。'),
        T('.management-table',14,'操作','右侧固定列；具体入口随记录状态变化，条件见下方同名操作说明。')
      ]),
      group('操作项',[
        A('reset-filter','重置','清空全部筛选及本批次限定，返回第1页。'),
        A('query','查询','应用当前筛选并返回第1页；输入框支持回车查询。无匹配结果时展示空状态。'),
        A('new','＋ 新增批量上传','位于筛选区下方、表格上方的列表操作栏。进入选择合集。有未提交草稿时可选继续草稿、新建上传或取消；新建会替换原新增上传草稿。'),
        A('refresh','刷新状态','位于列表操作栏。刷新上传、审核、售卖及到期预约结果，提示刷新完成。正式接入时读取快手平台返回结果。'),
        A('resume','继续编辑','有新增上传草稿时展示；恢复合集、目标账号及资料，从保存位置继续（最晚恢复到配置资料）。'),
        A('delete-draft','删除草稿','有草稿时展示；二次确认后删除新增上传草稿，上传记录不受影响；取消保留草稿。'),
        A('clear-batch','查看全部记录','刚提交批次后展示；清除本批次限定，保留其他筛选条件。'),
        A('batch-retry','重试失败任务','已选记录包含上传失败任务时可用；确认后只重试其中失败且授权有效的记录，保留原短剧ID和已成功分集。取消不执行；不可重试时提示原因。'),
        A('export','导出记录','导出当前筛选及批次范围内全部记录为CSV，不仅当前页或已选行。包含列表信息，以及账号ID、平台ID、上传/总集数、预约状态与时间、失败原因、创建人及最近修改人等明细；提示导出数量。'),
        A('upload-failure','查看上传失败原因','打开“上传失败原因”弹窗，正文仅展示该条记录的失败原因文案；保留换行，长文自动换行并可滚动查看。原因缺失时显示“暂无上传失败原因”；点击关闭、右上角关闭或按Esc返回列表。'),
        A('detail','详情','展示封面、短剧名称、快手号/ID、快手短剧ID和三类状态；逐项展示绿台合集名称、合集ID、上传集数/总集数、售卖方式、内容类型、创建人/时间、最近修改人/时间。',
          '按有值情况展示审核原因、上传失败原因、平台处置原因；预约区展示预约状态、北京时间、实际执行时间及失败原因。',
          '分集上传结果：绿色已上传、红色失败、灰色待上传。操作记录显示最近20次的时间、动作、操作人、详情；底部操作与列表条件一致，关闭返回列表。'),
        A('edit-record','编辑 / 继续编辑','仅上传完整、审核为待提交或审核未通过、售卖已下架、无待执行预约、账号授权有效且无平台限制时可用，需有完整历史资料；不满足时置灰并提示原因。存在本条编辑草稿时名称为“继续编辑”。'),
        A('retry','重试上传','仅上传失败记录出现；授权有效时重试失败部分，保留平台短剧ID及成功分集。再次失败仍保留具体原因。'),
        E('[data-kind="online"]','上架','仅售卖已下架、审核发布成功、全部分集上传完整且有平台ID、授权有效、无平台限制、无待执行预约时出现；确认后变为已上架，记录操作人和时间。取消不修改；条件变化时提示并阻止。'),
        E('[data-kind="offline"]','下架','已上架记录展示；授权有效时可用。确认后变为已下架并记录操作信息，取消不修改。'),
        E('[data-kind="schedule"], [data-kind="modify-schedule"]','预约上架','仅已下架且发布成功、上传完整、有平台ID、授权有效且无平台限制时可操作。只保留“预约上架”一个按钮；已有待执行预约时回显并更新原预约。',
          '弹窗展示快手号、快手短剧名称、快手短剧ID；预约上架时间为北京时间，精确到秒，必填且晚于当前时刻。确认前再次校验，失败保留输入并提示，成功提示预约结果；取消不修改。',
          '到期重新检查账号、审核、上传、售卖及限制；执行成功上架，失败保留原因，在详情查看。'),
        E('.pagination','上一页 / 下一页','每页10条，展示总数和当前页；首尾页对应按钮不可用。表格可横向滚动查看全部字段。'),
        A('copy-id','复制ID','快手短剧ID与合集ID分别复制；成功提示“ID已复制”，复制失败弹窗展示只读ID供手动复制。')
      ])
    ]
  });
  const picker=source=>({
    title:source?'合集列表':'选择合集',intro:source?'本页是绿台 → 内容管理 → 合集列表页。':'本页是绿台 → 版权管理 → 快手原生上剧 → 新增批量上传 → 选择合集页。',background:'上传内容来源于绿台已有合集与分集，一部合集可同时上传至多个快手账号。',requirement:source?'选取源合集，进入快手上传流程。':'分别确定本次上传范围及各合集的目标账号。',groups:[
      group('筛选项',pickerFilters()),group('列表项',pickerColumns(source)),
      group('操作项',[
        ...queryActions(),
        ...(source?[A('source-upload','上传到快手','至少选择一部合集后可用；带入所选合集进入选择合集步骤，继续设置目标快手账号。')]:[
          A('set-targets','选择快手号 / 调整账号','无需勾选合集，直接操作对应行。初次配置显示“选择快手号”，已有配置显示“调整账号”。只更新当前合集，不自动勾选合集。',...accountRules),
          A('bulk-targets','批量设置快手账号','至少勾选一部合集后可用，只覆盖勾选合集。弹窗初始选中各合集共同的有效账号；不同合集的独有账号需在本次覆盖时重新选择。',...accountRules),
          saveEntry(false),exitEntry(false),
          A('next','下一步：配置资料','至少已选一部合集；每部已选合集需有至少一个有效目标账号，重复组合、授权失效或未配置时列出问题并返回设置。校验通过进入配置资料，未勾选合集不进入本次上传。')
        ])
      ])
    ]
  });
  const baseFields=()=>[
    F('title','短剧标题','必填；默认带入合集标题，可修改为本次快手短剧标题。按1～20字符校验，不自动截断。同一账号下已有同名短剧或本批同账号同名时阻止提交。'),
    F('cover','短剧封面','必填；带入合集封面。要求8:5、JPG/PNG/BMP/JPEG、10M以内。点击“更换封面”或“选择合规封面”可选示例封面或本地封面；格式、大小、比例不符时保留原封面并提示，成功更新本次上传封面。'),
    F('desc','短剧简介','必填；带入合集简介，可编辑；去除首尾空白后100～400字符，展示字符计数，超过400字符即截断。'),
    F('tags','短剧分类','下拉多选，必选1～3项；带入源标签并在收起状态展示已选分类。选满3项后其他选项禁选，取消任一已选项后可继续选择；点击外部或按Esc收起。候选：脑洞、甜宠、逆袭、热血、复仇、家庭、乡村、古风、年代、穿越、悬疑、武侠、校园、搞笑、都市。分类映射由内容同学提供。'),
    F('type','内容类型','必选真人剧或漫剧；绿台短剧类型“真人剧”映射为真人剧，“漫剧、AI剧、解说剧、沙雕漫、演绎剧”映射为漫剧。选择漫剧时出现漫剧制作方式，真人剧不展示该字段。'),
    F('method','漫剧制作方式','仅漫剧显示且必填；枚举：简笔动画、小说剧、AIGC剧、沙雕动画、3D动画、2D动画。枚举映射由内容同学提供。'),
    F('declaration','作者声明','必选；枚举：内容无需添加声明、含AI生成内容。内容类型为真人剧时默认“内容无需添加声明”，漫剧时默认“含AI生成内容”；切换内容类型时同步默认值，可再手动调整，未填时显示请选择。'),
    F('completed','是否完结','必选是或否，新建配置默认是；“否”为有效选择。')
  ];
  const rightsFields=()=>[
    F('copyrightType','版权证明类型','必选：自有版权、授权版权；授权版权需补授权推广文件、授权有效期、是否具有转授权权利。版权证明类型的映射枚举由内容同学提供。'),
    F('authorization','授权推广文件','选择授权版权时必填，在版权证明类型下方独立展示上传区。需同时提供至少一种下方版权证明材料。支持多文件上传、图片/PDF切换及删除；文件应包含授权双方、有效期、短剧名称，被授权主体应与入驻经营者一致。'),
    F('copyrightMaterial','版权证明材料','下拉多选，至少选择1种：作品登记证书、短剧制作协议、承诺函+现场拍摄图/短剧工程文件、承诺函+可信时间戳认证。多种材料可同时选择，按选中顺序展开独立上传区。取消后隐藏该区并保留附件，再选可恢复。',
      '“查看要求”打开各类材料要求弹窗；选项标签的×可取消该类材料。已选的每一种材料均需补齐，不能用一份附件代替所有类型。'),
    F('proof-registration','作品登记证书','必填；图片模式为1～2张JPEG/JPG/PNG，每张不超过5M。支持一次选择多张；超出格式、大小或数量时整次选择不加入，已有文件保留。可切换PDF；主体不一致时需提供授权书。'),
    F('proof-agreement','短剧制作协议/权属声明','必填；支持JPEG/JPG/PNG，每张不超过5M，可多选上传或切换PDF。著作权归属方与入驻主体不一致时需提供授权书。'),
    F('proof-shootPromise','承诺函（现场拍摄图/工程文件）','必填，独立上传已填写的承诺函；图片每张不超过5M，可切换PDF。与下方现场拍摄图/工程文件分别校验。'),
    F('proof-shoot','现场拍摄图/短剧工程文件','必填；图片模式不少于4张JPEG/JPG/PNG，每张不超过5M，支持一次多选。可切换PDF。'),
    F('proof-timePromise','承诺函（可信时间戳认证）','必填，独立上传已填写的承诺函；图片每张不超过5M，可切换PDF，与认证证书分别校验。'),
    F('proof-timestamp','可信时间戳认证证书','必填；图片每张不超过5M，可切换PDF；保护类型为视听作品，认证主体与入驻经营者主体不一致时需补充授权书。'),
    E('.copyright-upload','证明附件操作','每个上传区分别保存文件列表，支持多文件选择、逐个删除。切换图片/PDF保留两种附件，仅校验并提交当前模式；取消文件选择不修改。草稿和每个目标账号分别保存所选材料及附件。',
      '原型只记录文件名、类型和大小，不实际上传。旧单类型证明仅归入原类型对应区，不复制到新选类型。PDF数量/大小、授权文件图片数量/大小上限及平台承诺函模板链接待核验；当前PDF仅校验扩展名及非空，不推定平台上限。'),
    F('authRange','授权有效期','授权版权时必填，使用一个日期范围输入框，按“开始日期 ～ 结束日期”展示。点击输入框或日历图标打开双月日历，先选开始、再选结束，选完自动回填；支持跨月、跨年和同一天。', '年份、月份及前后月按钮用于定位日期；选择早于开始的日期时改为新的开始日期，继续选择结束。取消、Escape或点外部关闭时保留原范围；×一次清空整个范围。校验与错误提示统一定位到本字段，结束不得早于开始。已有草稿的开始/结束日期合并回显，数据保存兼容原结构。'),
    F('subAuth','是否具有转授权权利','授权版权时必选是或否；当前原型只校验已选择，是否可分发需按实际授权核验。'),
    F('filing','是否有备案号','必选是或否，默认值取合集列表的“是否备案”字段；源值缺失时不预选。“是”展示备案号类型、备案号；“否”展示下方制作与播放资料，必填项随选择切换。'),
    F('filingType','备案号类型','有备案号时必选：重点备案号、普通备案号。历史无效类型显示“请选择”，需重新选择，不自动改为其他类型。'),
    F('filingNo','备案号','有备案号时必填；带入合集备案号后需核对平台与类型。'),
    F('productionCost','制作成本（万元）','无备案号时必填；大于0，最多一位小数。超过30万元时提示核对备案要求并选择有备案号。'),
    F('avgMinutes','单集时长（分钟）','无备案号时必填；数值大于0。'),
    F('productionForm','制作形式','无备案号时必选横屏或竖屏。'),
    F('productionYear','出品年份','无备案号时必填；四位年份，当前校验范围1900～2099。'),
    E('.production-info-group>h4','制作信息','按平台截图合并展示在同一浅灰区域：第一行制作机构、制作机构税号、制作许可证编号；第二行制作方国别、制作机构归属省份、制作周期；第三行许可证附件。只制作机构必填。'),
    F('productionCompany','制作机构','无备案号时必填；沿用原制作单位的数据，不清空既有草稿；可编辑文本。'),
    F('productionTaxId','制作机构税号','选填文本；为空不拦截，具体税号规则待接口核对，不猜测格式。'),
    F('productionLicense','制作许可证编号','选填；两个输入框按“前缀＋字第＋号码＋号”组合展示。都为空可继续，只填一部分时提示补齐；不预设编号内容。'),
    F('productionCountry','制作方国别','选填文本，默认空。'),
    F('productionProvince','制作机构归属省份','选填文本，默认空。'),
    F('productionMonths','制作周期','选填数值，右侧固定单位“月”；填写时须大于0，允许小数，空值不拦截。'),
    F('productionPermit','广播电视节目制作经营许可证','选填附件，默认不生成示例文件。点击上传进入现有材料选择弹窗，可选示例材料或本地PDF/PNG/JPG/JPEG文件；已选在下方显示文件名，可更换。取消不修改；本地原型仅记录文件名，不实际上传。'),
    F('actors','演员信息','按平台截图展示独立卡片，至少2名，当前沿用接口原型上限5名。默认展示2张空卡片；可新增，达到最少人数时删除置灰，达到上限时新增置灰。删除后重新连续编号，不改变其他人员已填内容。',
      '每张演员卡片第一行：演员姓名（必填，文本框）、演员性别（必选男或女）、演员角色（必填角色名）；第二行：出生日期（选填日期）、演员国籍（选填文本）、所属公司（选填文本）。出生日期填写时校验有效日期。姓名、性别和角色分别校验并定位缺项。',
      '已有顿号或逗号分隔的人员姓名带入对应卡片，性别和角色缺失时留空待补充，不推测填写；编辑保存在本次渠道配置及草稿。'),
    F('directors','导演信息','使用独立人员卡片，默认至少1名。导演姓名、导演性别必填；出生日期、导演国籍、所属公司选填；不显示演员角色。可新增，剩1名时删除置灰；各字段按三列排列。其他人员表单尚未取得完整平台截图，当前沿用演员卡片样式，字段及人数限制待核对。'),
    F('screenwriters','编剧信息','使用独立人员卡片，默认至少1名。编剧姓名、编剧性别必填；出生日期、编剧国籍、所属公司选填；支持新增和删除，剩1名时删除置灰。其他人员表单字段及人数限制待平台核对。'),
    F('producers','制片人信息','只允许1名，固定单张卡片，无新增或删除入口。制片人姓名、制片人性别必填；出生日期、制片人国籍、所属公司选填。沿用原制作人姓名及性别；若历史草稿存在多人，先提示选择保留1名，选定前阻止提交。其他人员表单完整字段仍待平台核对。'),
    F('broadcastPlatforms','播出平台卡片组','无备案号时展示且至少1个。每个播出平台独立卡片，卡片内一行三列；标题按播出平台1、2……连续编号，三项均必填。'),
    E('[data-broadcast-field="name"]','播出平台','必填文本，默认带入原播放平台字段；源值为空则留空，截图中的“快手”不作为所有合集默认值。每张卡片独立填写，不影响其他卡片或源合集。'),
    E('[data-broadcast-field="channel"]','播出途径','必选下拉：大屏有线电视APP、大屏有线电视SDK、大屏IPTV APP、大屏IPTV SDK、大屏OTT APP、大屏OTT SDK、小屏小程序、小屏APP、PC端；默认带入已有途径，无值显示请选择。'),
    E('[data-broadcast-field="date"]','播出时间','必填日期，按截图使用日期选择器，不再填写时分。原草稿日期时间带入日期部分；缺失或无效日期在资料检查时提示，并定位到对应卡片字段。'),
    E('.add-card','新增演员 / 新增导演 / 新增编剧 / 新增播出平台','所有新增入口统一为卡片组下方左对齐的蓝色“＋ 新增…”文字按钮。点击在末尾追加一张空卡片，并将焦点定位到新卡片第一个输入框；保留原卡片内容。', '演员达到5名时新增置灰；制片人仅1名，无新增入口。删除后保持连续编号，人数/平台最小数量限制沿用各字段规则；草稿保留所有卡片。'),
    A('delete-broadcast','删除播出平台','多于1张时可用，删除当前卡片并重新连续编号，其他卡片内容不变。仅剩1张时删除置灰，校验始终要求至少1组完整资料。'),
    F('specialTheme','是否涉及特殊题材','无备案号时必选；否、是（需核对平台专项资料）。选择是时当前原型阻止提交，需确认专项资料及接入方式。')
  ];
  const saleFields=()=>[
    E('.sale-options','售卖方式','三选一：全剧付费、单集+全剧付费、观看广告解锁。沿用平台名称及说明；默认取合集列表的锁列表中“客户端＝快手小程序”的锁信息。切换后保留之前输入，只校验当前方式字段。锁信息缺失或尚未明确映射时保持未选，由业务选择。'),
    F('price','全剧价格（元）','全剧付费、单集+全剧付费时必填；0.10～99999元，最多两位小数。'),
    F('episodePrices','单集价格设置','仅单集+全剧付费时显示，按原集序展示每集免费/付费，带入已有价格；付费时显示单集价格（元），必填0.10～100元、最多两位小数。免费时隐藏价格且不校验，切回付费保留原输入。单集价格用于本次上传，不覆盖源合集；不提供视频、集序或标题修改。'),
    F('unlock','每次观看广告解锁','观看广告解锁（IAA）时必选1～8集。'),
    F('smallFree','是否支持小额免广','观看广告解锁（IAA）时必选是或否；不套用付费方式的单集价格。')
  ];
  const visible=entries=>entries.filter(e=>document.querySelector('#main '+e.selector));
  function configuration(state){
    const editing=!!state.editingId;
    const common=[
      A('validate-all','检查全部资料','校验本次所有合集的基础信息、版权与备案、售卖信息。通过时提示；有问题时按合集列出字段与原因，点击“去补齐”定位到对应合集的具体字段。视频由后台自动处理，不纳入业务填写项。'),
      ...(!editing?[A('edit-collection','切换合集','点击左侧合集切换编辑对象，保留其他合集已填写资料；同一合集的多个目标账号复用本份配置。'),
      ]:[]),
      saveEntry(editing),exitEntry(editing),
      ...(editing?[A('submit-record','保存并提交审核','再次校验编辑资格及三部分资料；存在错误时阻止并定位。通过后弹窗确认提交修改，返回修改保留输入；确认后更新原记录并进入审核中，保留原平台ID、账号、合集关联及已上传视频，清除本条编辑草稿。')]:[
        A('prev','上一步 / 返回选择合集','返回选择合集，保留已填资料与目标账号。'),
        A('next','下一步：确认上传','再次检查所有合集目标账号及全部资料；存在资料缺项或同账号同名时阻止进入确认页，列出问题；通过后进入确认上传。')
      ])
    ];
    return {title:editing?'编辑短剧':'配置资料',intro:`本页是绿台 → 快手原生上剧 → ${editing?'编辑短剧':'新增批量上传 → 配置资料'}页。`,background:editing?'已有短剧需补齐或修正资料后重新提审。':'绿台合集资料需要补齐快手渠道字段，视频由后台读取并上传。',requirement:'基础信息、版权与备案、售卖信息在同一页面按顺序完整展示，普通字段独占一行，制作信息、人员及播出平台卡片内部按平台分组排版，向下滚动填写；修改不覆盖源合集。'+(editing?'已上传视频保持不变。':'后台按原集序上传合集全部视频，无需业务选择、编辑或上传分集视频。'),groups:[
      group('基础信息',visible(baseFields())),
      group('版权与备案',visible(rightsFields())),
      group('售卖信息',visible(saleFields())),
      group('列表项',[
        ...(!editing?[E('.collection-nav-head','本次上传合集','左侧展示本次合集数量；各合集显示封面、名称、总集数、源类型及资料待处理项数量/资料完整。')]:[]),
        E('.editor-head h2','当前合集信息','展示当前短剧标题、合集ID、总集数'+(editing?'；顶部保留目标快手号和快手短剧ID。':'及目标快手号。')),
        E('.footer-summary','资料检查汇总',editing?'展示待处理项数量或资料已完整提示，原短剧ID保留。':'展示已选合集数、全集数量、上传记录数、资料完整合集数及待处理项数量；资料完整表示三部分配置校验通过，视频上传结果以后台任务为准。')
      ]),group('操作项',common),group('其他注意说明',[
        E('.editor-panel','后台上传全集视频',editing?'已上传视频保持不变，本页不提供分集操作。':'提交后后台读取绿台合集全部分集、沿用原集序及已有单集资料，为每个目标账号上传全集。业务无需配置分集视频；单集+全剧付费仅在售卖信息中设置单集价格；缺失或异常视频在上传记录中展示失败原因，后台源资料修复后可重试，保留成功分集与原短剧ID。')
      ])
    ],pending:'分类映射、漫剧制作方式枚举映射、版权证明类型映射由内容同学提供；未提供前不自动推定。快手小程序锁信息的实际字段与三种售卖方式的对应关系待提供，默认回填待接入。演员截图已核对；导演、编剧、制片人的完整平台字段仍待核对，制片人仅1名已由用户明确。未备案字段、专项资料及接口枚举值需平台联调确认。'};
  }
  const confirm=()=>({title:'确认上传',intro:'本页是绿台 → 快手原生上剧 → 新增批量上传 → 确认上传页。',background:'一部合集可能生成多条账号上传记录，提交前需核对最终范围。',requirement:'核对合集、账号及短剧资料后，创建后台自动上传全集的独立任务。',groups:[
    group('配置项',[E('.confirm-check','确认上传并提交审核','默认未勾选；核对各合集目标快手账号与短剧资料，确认后台上传全集视频后勾选，确认并开始上传才可用。')]),
    group('列表项',[
      E('.confirm-grid>div:nth-child(1)','合集 / 目标账号','显示合集数及去重后的目标账号数。'),
      E('.confirm-grid>div:nth-child(2)','上传记录','按“合集＋账号”组合数统计；如2部合集各选2个账号，生成4条记录。'),
      E('.confirm-grid>div:nth-child(3)','分集上传总次数','按每条上传记录的分集数累加；同一合集传到多个账号时分别计入。'),
      T('.data-table',1,'短剧信息','展示封面、快手短剧标题与源合集ID。'),
      T('.data-table',2,'目标快手账号','逐个展示该合集的目标账号标签。'),
      T('.data-table',3,'分集数量','展示该合集总集数。'),
      T('.data-table',4,'内容类型','展示真人剧或漫剧。'),
      T('.data-table',5,'售卖方式','展示三种售卖方式；全剧付费及单集+全剧付费显示全剧价格，后者提示单集价格已配置；观看广告解锁显示每次解锁集数。'),
      T('.data-table',6,'上传记录数','展示该合集的目标账号数量。'),
      T('.data-table',7,'操作','修改本行对应合集的上传资料。')
    ]),
    group('操作项',[
      A('confirm-edit','修改','返回对应合集的配置资料页，滚动回基础信息区域。'),saveEntry(false),exitEntry(false),
      A('prev','上一步','返回配置资料，保留当前配置；再次进入确认页需重新勾选确认。'),
      A('submit','确认并开始上传','勾选确认后可用；提交前再次校验账号授权、重复合集账号组合、同账号同名及三部分配置资料。失败保留配置并提示，修正后可重试。',
        '通过后按合集＋账号创建独立记录，清除新增上传草稿，跳转本批次上传记录；后台分别创建平台短剧、读取绿台合集全部视频并按原集序上传、提交审核，记录平台ID、进度与结果。源视频缺失或上传异常在记录中反馈。失败可在上传记录中重试，保留成功分集。')
    ])
  ]});
  const accountManagement=()=>({title:'快手号管理',intro:'本页是绿台 → 版权管理 → 快手号管理页，菜单位于快手原生上剧下方。',background:'原生上剧需要使用已授权的快手号，并明确各账号的运营人员。',requirement:'添加快手号、维护授权状态及运营人员，供上传流程选择目标账号。',groups:[
    group('筛选项',[
      E('#accountSearch','快手号','按快手号名称或ID关键词筛选；默认空，支持回车搜索。'),
      E('#accountOperatorFilter','运营人员','下拉单选，枚举取容量员工账号；默认全部运营人员。'),
      E('#accountStatusFilter','授权状态','下拉单选：全部、正常、失效；默认全部。多个条件同时生效。')
    ]),
    group('列表项',[
      T('.account-management-table',1,'快手号名称','展示授权后获取的快手号名称，不在编辑弹窗手动修改。'),
      T('.account-management-table',2,'快手号ID','展示授权账号唯一ID；重新授权保持同一账号及已有上传记录关联。'),
      T('.account-management-table',3,'运营人员','展示当前分配的容量员工名称；历史未分配时显示“—”。'),
      T('.account-management-table',4,'授权状态','仅正常、失效。授权成功后为正常；失效账号不可作为新增上传的目标账号。'),
      T('.account-management-table',5,'最近更新时间','展示最近新增、重新授权成功或编辑运营人员的时间；失败、取消不更新时间，缺失显示“—”。')
    ]),
    group('操作项',[
      A('account-add','新增快手号','位于筛选区下方、表格上方的列表操作栏。点击打开快手号授权弹窗，居中展示二维码、有效期提示及授权步骤：打开快手App → 扫一扫 → 确认授权。',
        '<strong>二维码：</strong>过期或授权失败时展示刷新入口；刷新后重新扫码。关闭或按Esc退出不新增账号。',
        '<strong>授权成功：</strong>自动获取快手号名称与ID，新增一条正常账号记录并刷新列表；运营人员默认当前容量登录员工，后续可编辑。已有同ID账号不重复新增，提示在列表重新授权。'),
      A('account-reauth','重新授权','正常、失效账号均可操作；打开同样的授权弹窗，展示当前快手号名称及ID。成功后更新原账号授权状态、名称与最近更新时间，保留运营人员、账号ID及上传记录关联；扫码账号不一致时阻止更新并提示。失败或关闭保留原状态。'),
      A('account-edit','编辑','打开编辑快手号弹窗。<strong>快手号名称：</strong>只读。<strong>快手号ID：</strong>只读。<strong>运营人员：</strong>必选、下拉单选，候选枚举取容量员工账号，默认当前值；原型使用示例员工。',
        '<strong>保存：</strong>未选择有效员工时提示并保留弹窗；成功后更新运营人员与最近更新时间，提示保存成功。取消、关闭或Esc不应用修改。')
    ])],pending:'授权二维码及扫码结果需接快手正式授权服务；本原型使用明确标注的示例码，通过“演示授权结果”体验成功、失败、过期，不发起真实授权。二维码两分钟有效沿用本次参考截图，正式有效期及登录步骤以接入接口为准。'});
  // Documentation is exhaustive; annotations identify regions and primary actions only.
  const primaryActions=new Set(['refresh','new','batch-retry','edit-record','retry','source-upload','set-targets','bulk-targets','validate-all','confirm-edit','next','submit','submit-record','account-add','account-reauth','account-edit']);
  const numberHTML=n=>n?`<span class="prototype-note-number">${n}</span>`:'';
  const findTarget=selector=>[...document.querySelectorAll(`#main :is(${selector})`)].find(n=>n.getClientRects().length);
  let lastSignature='';
  function annotate(content,page,state){
    document.querySelectorAll('#main .prototype-marker, #main .prototype-area-caption').forEach(n=>n.remove());
    document.querySelectorAll('#main .prototype-action-anchor').forEach(n=>n.replaceWith(...n.childNodes));
    const regions=page==='accounts'?[['.account-management-filters',true],['.toolbar>strong']]:page==='records'?[['.management-filters',true],['.toolbar>strong']]
      :page==='collections'||page==='select'?[['.search-inline'],['.picker-table th:nth-child(2)']]
      :page==='confirm'?[['.confirm-check'],['.panel-head h2']]
      :[['#config-base>h3'],['#config-rights>h3'],['#config-sale>h3'],['.collection-nav-head>b, .editor-head h2']];
    let n=0;
    const add=(item,selector,label,caption=false)=>{
      const target=findTarget(selector);if(!target)return;
      item.noteNumber=++n;
      const marker=document.createElement('button');marker.type='button';marker.className='prototype-marker';marker.textContent=n;marker.dataset.noteTarget=String(n);marker.setAttribute('aria-label',`查看说明${n}：${label}`);marker.title=label;
      if(caption){
        const heading=document.createElement('div');heading.className='prototype-area-caption';heading.append(marker,label);target.prepend(heading);
      }else if(target.matches('button,input,select,textarea')){
        const wrap=document.createElement('span');wrap.className='prototype-action-anchor';target.before(wrap);wrap.append(marker,target);
      }else target.prepend(marker);
    };
    content.groups.forEach((g,i)=>{
      if(g.title!=='操作项'){
        if(g.entries.length&&regions[i])add(g,regions[i][0],g.title,regions[i][1]);
        return;
      }
      g.entries.forEach(e=>{
        const action=e.selector.match(/^\[data-action="([^"]+)"\]$/)?.[1];
        if(primaryActions.has(action)||e.selector.includes('[data-kind='))add(e,e.selector,e.label);
      });
    });
  }
  function render(state){
    const page=state.editingId?'edit':state.view==='workflow'?({1:'select',2:'configure',3:'confirm'}[state.step]||'select'):state.view;
    const content=page==='accounts'?accountManagement():page==='records'?records():page==='collections'?picker(true):page==='select'?picker(false):page==='confirm'?confirm():configuration(state);
    const panel=document.getElementById('prototypeNotes');
    annotate(content,page,state);
    const signature=JSON.stringify([page,content]);if(signature===lastSignature)return;lastSignature=signature;
    panel.dataset.context=page;
    const source=page==='accounts'?'快手授权服务返回的账号名称、ID与授权状态；运营人员枚举取容量员工账号。账号管理与上传目标账号选择使用同一账号数据。':page==='records'?'绿台上传记录及快手平台返回结果；正式接入后刷新平台状态。':'绿台合集、分集视频及已授权快手账号；配置只写入本次渠道资料。';
    const targetId=item=>item.noteNumber?`id="prototype-note-${item.noteNumber}"`:'';
    const renderEntry=(entry,inline)=>`<li class="prototype-spec-entry${inline?' prototype-inline-entry':''}" ${targetId(entry)} data-note-label="${entry.label}">${inline?`<strong>${entry.label}：</strong><span>${entry.rules.join(' ')}</span>`:`<div class="prototype-entry-title">${numberHTML(entry.noteNumber)}<strong>${entry.label}</strong></div>${list(entry.rules)}`}</li>`;
    panel.innerHTML=`<div class="prototype-notes-head"><span>说明文档</span></div><div class="prototype-notes-body" tabindex="0" aria-label="原型说明内容，可滚动">
      <h2 class="prototype-spec-title">#页面说明</h2>${list([content.intro,`<strong>页面作用：</strong>${content.requirement}`])}
      <h2 class="prototype-spec-title prototype-spec-divider">#原型说明</h2>${list([`<strong>背景：</strong>${content.background}`,`<strong>需求：</strong>${content.requirement}`,`<strong>数据源：</strong>${source}`])}
      ${content.groups.map(g=>{const inline=g.title!=='操作项';return `<section class="prototype-notes-group" ${targetId(g)}><h3>${numberHTML(g.noteNumber)}${g.title}</h3><ul class="prototype-entry-list${inline?' prototype-inline-list':''}">${g.entries.map(e=>renderEntry(e,inline)).join('')}</ul></section>`;}).join('')}
      ${content.pending?`<p class="prototype-spec-pending"><strong>待确认：</strong>${content.pending}</p>`:''}</div>`;
  }
  document.addEventListener('click',e=>{
    const marker=e.target.closest('[data-note-target]');if(!marker)return;
    e.preventDefault();e.stopImmediatePropagation();
    const entry=document.getElementById('prototype-note-'+marker.dataset.noteTarget),body=document.querySelector('.prototype-notes-body');if(!entry||!body)return;
    document.querySelectorAll('.prototype-spec-entry.highlight, .prototype-notes-group.highlight').forEach(n=>n.classList.remove('highlight'));entry.classList.add('highlight');
    body.scrollTo({top:body.scrollTop+entry.getBoundingClientRect().top-body.getBoundingClientRect().top-16,behavior:'smooth'});
    show();
  },true);
  function show(){
    const canvas=document.getElementById('prototypeCanvas'),panel=document.getElementById('prototypeNotes');
    canvas.scrollTo({left:canvas.scrollLeft+panel.getBoundingClientRect().right-canvas.getBoundingClientRect().right,behavior:'smooth'});
  }
  return {render,show};
})();
