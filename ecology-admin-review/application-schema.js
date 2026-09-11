/* Application field contract shared by the prototype and both PRD surfaces.
 * Keys match the current website form control names; records below are demo data only.
 */
(() => {
  const field = (key, label, group, control, rule, when) => ({ key, label, group, control, rule, when });
  const text = (key, label, group = "基础与联系信息", rule = "必填；按提交内容展示") => field(key, label, group, key === "phone" ? "手机号输入" : "文本输入", rule);
  const multi = (key, label, group, rule) => field(key, label, group, "多选", rule);
  const space = field("physicalSpace", "是否有意向入驻 OPC 实体空间", "空间与资源", "单选", "必填；是 / 否，仅线上参与生态");
  const stations = field("workstations", "意向工位数", "空间与资源", "数字输入", "实体空间意向为“是”时展示；正整数。业务要求必填，官网当前缺少必填校验，缺失时显示未填写", { key: "physicalSpace", value: "是" });
  const personal = [
    text("name", "姓名"), text("phone", "联系手机号", undefined, "必填；11 位中国大陆手机号"), text("wechat", "微信/企业微信"),
    field("bio", "个人简介", "创作能力与作品", "多行文本", "选填；保留换行"),
    field("opcRegistration", "是否需要协助注册 OPC 一人公司", "空间与资源", "单选", "必填；需要协助咨询注册 / 暂不需要，以个人身份参与"),
    field("plannedTeamSize", "意向团队规模", "创作能力与作品", "下拉单选", "必填；1人（独立个人创作） / 2-3人（小型协作小组） / 4-6人 / 7人以上，10人以下"),
    space, stations,
    multi("expertise", "擅长方向", "创作能力与作品", "必填，至少一项；AI漫剧 / AI仿真人剧 / 精品剧 / 运营 / 发行 / 译配出海 / 培训教育 / 版权营销 / 其他"),
    field("hasWorks", "是否有过往短剧作品", "创作能力与作品", "单选", "必填；有 / 无"),
    field("portfolioLink", "作品链接", "创作能力与作品", "文本输入", "有过往作品时展示，选填；仅有效 http/https 链接可打开", { key: "hasWorks", value: "有" }),
    field("portfolioFile", "作品附件", "创作能力与作品", "附件", "有过往作品时展示，选填；展示提交的文件名，本原型无真实文件下载", { key: "hasWorks", value: "有" }),
    multi("projectTypes", "可承接的项目类型", "空间与资源", "选填；产业订单 / 精品项目 / 赛事创作任务 / IP联合开发"),
    multi("resources", "意向资源诉求", "空间与资源", "选填；IP授权 / 场地工位 / 订单对接 / 发行推广 / 工商注册咨询 / 创业政策辅导 / 其他")
  ];
  const team = [
    text("company", "团队/企业名称"), text("contact", "对接人姓名"), text("phone", "联系手机号", undefined, "必填；11 位中国大陆手机号"), text("wechat", "微信/企业微信"), text("creditCode", "企业统一社会信用代码"),
    field("teamSize", "现有团队总人数", "创作能力与作品", "数字输入", "必填；正整数，单位人"),
    field("capability", "团队简介与核心能力", "创作能力与作品", "多行文本", "必填；保留换行"),
    field("portfolioLink", "过往作品链接", "创作能力与作品", "文本输入", "选填；团队始终展示，不受个人「是否有过往短剧作品」选项影响"),
    field("portfolioFile", "过往作品附件", "创作能力与作品", "附件", "选填；团队始终展示，原型仅展示演示文件名"),
    multi("expertise", "擅长方向", "创作能力与作品", "选填；AI漫剧 / AI仿真人剧 / 精品剧 / 运营 / 发行 / 译配出海 / 教育培训 / 版权营销 / 其他"),
    multi("projectTypes", "可承接项目类型", "空间与资源", "选填；产业订单 / 精品项目 / 赛事创作 / IP联合开发"),
    multi("resources", "意向资源诉求", "空间与资源", "选填；IP素材授权 / 场地工位 / 订单对接 / 发行推广 / 工商注册咨询 / 创业政策辅导 / 其他"), space, stations
  ];
  const school = [
    text("school", "学校全称"), text("department", "二级院系/部门"), text("contact", "对接负责人"), text("position", "职务"), text("phone", "联系手机号码", undefined, "必填；11 位中国大陆手机号"), field("email", "对接邮箱", "基础与联系信息", "邮箱输入", "必填；邮箱格式"), text("wechat", "微信", undefined, "选填"),
    multi("cooperationModes", "意向合作模式", "合作需求与条件", "必填，至少一项；共建AI影视项目实践班 / 共建产教融合实训实践基地 / 学生实训实习、团队接单通道 / 联合开发课程/教学案例库 / 联合承办微短剧、AI创作类赛事 / IP联合共创、师生联合内容开发 / 其他"),
    field("studentMajors", "可参与的学生专业/年级", "合作需求与条件", "多行文本", "选填"), field("studentScale", "预估每年可参与学生规模", "合作需求与条件", "数字输入", "选填；正整数，单位人/年"), field("foundation", "学校现有基础条件与合作设想", "合作需求与条件", "多行文本", "选填；保留换行"),
    multi("resources", "希望获取平台配套资源", "合作需求与条件", "必填，至少一项；AI智能体/算力资源开放 / 产业项目订单供给 / 行业导师进课堂 / IP素材库开放使用 / 作品出海发行、成果展示渠道 / 创业孵化、政策申报辅导 / 其他"), field("attachment", "附件上传", "合作需求与条件", "附件", "选填；展示提交的文件名，本原型无真实文件下载")
  ];
  const drama = [
    field("entityType", "主体类型", "基础与联系信息", "单选", "必填；个人创作者 / 创作团队 / 企业单位 / 地方文旅/事业单位"), text("entityName", "主体名称"), text("contact", "对接人"), text("phone", "联系手机号", undefined, "必填；11 位中国大陆手机号"), field("email", "对接邮箱", "基础与联系信息", "邮箱输入", "必填；邮箱格式"), text("wechat", "微信/企业微信", undefined, "选填"),
    multi("cooperationTypes", "合作类型", "合作意向与项目", "必填，至少一项；文旅定制 / 非遗主题 / 城市形象宣传 / IP联合开发共创 / 其他"), text("region", "项目属地地区", "合作意向与项目", "必填；原文展示省/市/区县，不推导为主体所在地"), field("intent", "已有 IP/文旅素材及合作意向", "合作意向与项目", "多行文本", "必填；保留换行"), text("cases", "过往同类项目案例", "合作意向与项目", "选填；链接或简要说明")
  ];
  const formColumn = (label, key, width = 150, options = {}) => ({ label, key, width, source: "form", ...options });
  const systemColumn = (label, key, width = 150) => ({ label, key, width, source: "system" });
  const id = systemColumn("申请 ID", "id", 122);
  const time = systemColumn("提交时间", "submittedAt", 164);
  const phone = formColumn("联系电话", "phone", 132, { format: "phone" });
  const opcSubject = { "个人创作者": "name", "创作团队 / 企业": "company" };
  const opcContact = { "个人创作者": "name", "创作团队 / 企业": "contact" };
  const filter = (key, label, control, sourceKey, options = [], match = "contains") => ({ key, label, control, sourceKey, options, match });
  const dates = filter("dates", "提交时间", "date-range", "submittedAt", [], "date");
  const phoneFilter = filter("phone", "联系电话", "tel", "phone", [], "exact");
  const schema = {
    opc: { label: "OPC社区", fullLabel: "OPC 社区入驻", fields: { personal, team },
      columns: [id, formColumn("申请身份", "identity", 148), formColumn("申请人 / 团队", opcSubject, 190), formColumn("对接人", opcContact, 100), phone, formColumn("擅长方向", "expertise", 182), formColumn("实体空间意向", "physicalSpace", 180), time, systemColumn("审核状态", "review", 112)],
      filters: [filter("subject", "申请人/团队", "text", opcSubject), filter("contact", "对接人", "text", opcContact), phoneFilter, filter("identity", "申请身份", "select", "identity", ["个人创作者", "创作团队 / 企业"], "exact"), filter("review", "审核状态", "select", "review", ["待审核", "审核通过", "审核拒绝"], "exact"), filter("physicalSpace", "实体空间意向", "select", "physicalSpace", ["是", "否，仅线上参与生态"], "exact"), dates]
    },
    drama: { label: "精品短剧", fullLabel: "“微短剧+”精品内容合作", fields: { all: drama },
      columns: [id, formColumn("主体类型", "entityType", 152), formColumn("主体名称", "entityName", 200), formColumn("对接人", "contact", 100), phone, formColumn("合作类型", "cooperationTypes", 186), formColumn("项目属地地区", "region", 180), time],
      filters: [filter("subject", "主体名称", "text", "entityName"), filter("contact", "对接人", "text", "contact"), phoneFilter, filter("entityType", "主体类型", "select", "entityType", ["个人创作者", "创作团队", "企业单位", "地方文旅/事业单位"], "exact"), filter("cooperationTypes", "合作类型", "select", "cooperationTypes", ["文旅定制", "非遗主题", "城市形象宣传", "IP联合开发共创", "其他"], "includes"), filter("region", "项目属地地区", "text", "region"), dates]
    },
    school: { label: "校企合作", fullLabel: "校企合作", fields: { all: school },
      columns: [id, formColumn("学校全称", "school", 200), formColumn("二级院系/部门", "department", 180), formColumn("对接负责人", "contact", 110), phone, formColumn("意向合作模式", "cooperationModes", 230), formColumn("学生规模（人/年）", "studentScale", 150), time],
      filters: [filter("school", "学校全称", "text", "school"), filter("department", "二级院系/部门", "text", "department"), filter("contact", "对接负责人", "text", "contact"), phoneFilter, filter("cooperationModes", "意向合作模式", "select", "cooperationModes", ["共建AI影视项目实践班", "共建产教融合实训实践基地", "学生实训实习、团队接单通道", "联合开发课程/教学案例库", "联合承办微短剧、AI创作类赛事", "IP联合共创、师生联合内容开发", "其他"], "includes"), dates]
    }
  };
  const getValue = (row, key, source = "form") => {
    const resolved = typeof key === "object" ? key[row.fields.identity] : key;
    return source === "system" || resolved === "review" || resolved === "submittedAt" ? row[resolved] : row.fields[resolved];
  };
  const getFields = row => schema[row.formType].fields[row.formType === "opc" ? (row.fields.identity === "个人创作者" ? "personal" : "team") : "all"];
  const isApplicable = (row, descriptor) => !descriptor.when || row.fields[descriptor.when.key] === descriptor.when.value;
  // Parameter keys remain internal; review copy uses the website's business labels.
  const systemLabels = { id: "申请 ID", submittedAt: "提交时间", review: "审核状态" };
  const sourceLabel = (key, source = "form", type) => {
    if (source === "system" || key === "review" || key === "submittedAt") {
      if (!systemLabels[key]) throw new Error("Missing system field label");
      return `系统字段：「${systemLabels[key]}」`;
    }
    const websiteLabel = (fieldKey, identity) => {
      if (fieldKey === "identity") return "申请身份";
      const branches = identity ? [schema[type].fields[identity === "个人创作者" ? "personal" : "team"]] : Object.values(schema[type].fields);
      const labels = [...new Set(branches.flat().filter(item => item.key === fieldKey).map(item => item.label))];
      if (!labels.length) throw new Error("Missing website field label");
      return labels.join(" / ");
    };
    return typeof key === "object"
      ? Object.entries(key).map(([identity, fieldKey]) => `${identity} → 官网「${websiteLabel(fieldKey, identity)}」`).join("；")
      : `官网字段：「${websiteLabel(key)}」`;
  };
  window.APPLICATION_SCHEMA = schema;
  window.ApplicationContract = { getValue, getFields, isApplicable, sourceLabel };
})();
