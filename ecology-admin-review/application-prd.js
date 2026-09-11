/* One source of truth for the standalone admin PRD and the V3 review-page PRD. */
(() => {
  const schemas = window.APPLICATION_SCHEMA;
  const contract = window.ApplicationContract;
  const escape = value => String(value).replace(/[&<>"']/g, character => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[character]));
  const table = (head, rows) => `<table><thead><tr>${head.map(label => `<th>${label}</th>`).join("")}</tr></thead><tbody>${rows.map(cells => `<tr>${cells.map(cell => `<td>${cell}</td>`).join("")}</tr>`).join("")}</tbody></table>`;
  const number = value => `<span class="prd-number">${value}</span>`;
  const filterTables = Object.entries(schemas).map(([type, schema]) => `<h4>${schema.label}</h4>${table(["筛选项 / 控件", "字段来源与查询规则"], schema.filters.map(item => [escape(item.label) + `<small>${{ text: "文本输入", tel: "手机号输入", select: "下拉单选", "date-range": "起止日期选择" }[item.control]}</small>`, `${escape(contract.sourceLabel(item.sourceKey, "form", type))}<br>${item.match === "date" ? "按提交日筛选，含开始及结束日期；任一边界可不填；开始日期不可晚于结束日期" : item.match === "includes" ? "匹配该申请已勾选的选项" : item.match === "exact" ? (item.sourceKey === "phone" ? "精确匹配；使用完整 11 位中国大陆手机号查询" : "精确匹配") : "去除首尾空格，包含式模糊匹配，英文不区分大小写"}${item.options.length ? `<br>枚举：全部 / ${escape(item.options.join(" / "))}` : ""}`]))}`).join("");
  const columnTables = Object.entries(schemas).map(([type, schema]) => `<h4>${schema.label}</h4>${table(["列表项", "官网字段 / 系统字段映射"], [...schema.columns.map(item => [escape(item.label), `${escape(contract.sourceLabel(item.key, item.source, type))}${item.format === "phone" ? "；列表中间四位脱敏，详情按权限查看完整值" : ""}${["expertise", "cooperationTypes", "cooperationModes"].includes(item.key) ? "；多选按提交顺序以“、”分隔" : ""}`]), ["操作", type === "opc" ? "详情；仅待审核记录提供审核" : "仅详情；不展示审核状态或审核操作"]])}`).join("");
  const detailTables = Object.entries(schemas).map(([type, schema]) => Object.entries(schema.fields).map(([branch, fields]) => `<h4>${schema.label}${type === "opc" ? ` · ${branch === "personal" ? "个人创作者" : "创作团队 / 企业"}` : ""}详情</h4>${table(["字段 / 分组", "官网字段与展示规则"], fields.map(item => [`${escape(item.label)}<small>${escape(item.group)} · ${escape(item.control)}</small>`, `官网「${escape(item.label)}」<br>${escape(item.rule)}`]))}`).join("")).join("");
  window.APPLICATION_PRD_HTML = `<div class="application-prd">
    <style>
      .application-prd { color:#34404c; line-height:1.75; }
      .application-prd h2,.application-prd h3,.application-prd h4 { color:#f28c18; }
      .application-prd h2 { margin:0 0 12px; font-size:24px; }
      .application-prd h3 { margin:28px 0 12px; font-size:19px; display:flex; align-items:center; gap:9px; }
      .application-prd h4 { margin:22px 0 10px; font-size:16px; }
      .application-prd .prd-number { display:inline-grid; place-items:center; flex:none; width:24px; height:24px; border-radius:50%; color:#fff; background:#f28c18; font-size:14px; font-weight:700; line-height:1; }
      .application-prd table { width:100%; min-width:0; table-layout:fixed; margin:10px 0 20px; border-collapse:collapse; font-size:13px; }
      .application-prd th,.application-prd td { height:auto; padding:10px 12px; text-align:left; vertical-align:top; border:1px solid #dce3eb; color:#34404c; overflow-wrap:anywhere; white-space:normal; }
      .application-prd th { background:#f4f6f9; font-weight:600; }
      .application-prd th:first-child { width:31%; }
      .application-prd .prd-changelog-title { margin-top:28px; }
      .application-prd .prd-changelog th:first-child { width:12%; }
      .application-prd .prd-changelog th:nth-child(2) { width:18%; }
      .application-prd small { display:block; margin-top:4px; color:#687481; font-size:12px; }
      .application-prd code { color:#9a4200; background:#fff4e8; overflow-wrap:anywhere; }
      .application-prd .prd-date { color:#cf1322; }
      .application-prd .prd-note { padding:12px 14px; border-left:3px solid #c95700; background:#fff7ed; }
    </style>
    <h2># 页面说明</h2><p>本页是绿台「产品运营 → 内容运营 → AI漫剧官网配置 → 生态创新中心」申请管理页，供生态合作运营及审核人员使用。</p>
    <h2 class="prd-changelog-title"># 变更日志</h2>
    <table class="prd-changelog">
      <thead><tr><th>版本</th><th>日期</th><th>变更内容</th></tr></thead>
      <tbody>
        <tr><td>V1.2</td><td class="prd-date">2026-09-11</td><td>申请管理保留 OPC社区、精品短剧、校企合作三个 Tab，删除产业空间 Tab。<br>筛选、列表及详情按官网表单类型和 OPC 申请身份映射，统一使用官网中文字段名，不约定技术参数；个人申请不再包含所在城市，区分用户填写项与系统字段，补充审核交互说明。<br>PRD 按 Tab项、筛选项、列表项、操作项组织；序号统一圆形橙底白字，标题及序号背景统一为 #F28C18；补充本变更日志。</td></tr>
        <tr><td>V1.0</td><td class="prd-date">2026-08-25</td><td>初始原型</td></tr>
      </tbody>
    </table>
    <h2># 原型说明</h2>
    <p><b>背景：</b>官网申请已拆分为 OPC 社区入驻、精品内容合作、校企合作，不同表单的主体、联系方式和合作需求不同。</p>
    <p><b>需求：</b>按实际表单归集并展示对应字段，列表便于筛查，详情保留完整提交快照；删除「产业空间」Tab，不把来源社区当作用户所在地。</p>
    <p><b>字段映射口径：</b>下文以官网弹窗展示的中文字段名说明业务对应关系；同类字段按实际表单及申请身份区分。接口参数和数据库字段由研发设计，本文不作命名约定。</p>
    <h3>${number(1)} Tab 项</h3>
    ${table(["Tab 项", "数据范围"], [["OPC社区", "官网 OPC 个人与团队/企业入驻申请；从产业空间入口打开的 OPC 申请也归入此 Tab。"], ["精品短剧", "官网“微短剧+”精品内容合作申请。"], ["校企合作", "官网高校院系负责人提交的校企合作申请。"]])}
    <p>默认 OPC社区；无「全部」「产业空间」或大赛申报 Tab。切换类型时清空筛选、返回第 1 页；每个 Tab 仅使用本类表单字段。「申请身份」为 OPC 个人/团队共用的用户填写字段，不属于系统自动字段。</p>
    <h3>${number(2)} 筛选项</h3>
    <p>条件之间按“且”组合；输入后点击「查询」或回车生效；空值不限制。「重置」清空当前 Tab 全部条件并立即展示该类型全部记录。结果数量、分页均按实际匹配记录计算；无匹配结果展示空态并提供清空筛选。</p>
    ${filterTables}
    <h3>${number(3)} 列表项</h3>
    <p>按提交时间倒序，时间相同时按申请 ID 倒序；未填写的选填项展示「—」，不补造公司、城市或团队规模。长内容省略并可悬浮查看全文；表格有意横向滚动，右侧操作列固定。学校及精品合作无需审核，不展示无业务意义的「无需审核」状态列。</p>
    ${columnTables}
    <p>「申请 ID」「提交时间」「审核状态」为系统生成或运营更新的信息，不能映射成官网用户填写项。本原型使用固定演示编号、时间及审核样例；正式提交应由后台生成申请编号与提交时间，OPC 初始状态为待审核。</p>
    <h3>${number(4)} 操作项</h3>
    <h4>详情</h4><p>打开只读详情，按「申请类型」与 OPC「申请身份」展示对应字段，不混用通用「公司 / 城市 / 规模」。基础联系、创作/合作需求、空间资源分组展示；条件不适用字段不展示，适用但未填显示「未填写」。关闭、遮罩或 Esc 返回原筛选结果，不改申请内容。</p>
    <p>OPC 个人/团队详情另展示共用「申请身份」。个人无「所在城市」及省市字段；团队不展示个人注册咨询、个人简介、意向团队规模等字段。个人「作品链接」「作品附件」仅在「是否有过往短剧作品」选择「有」时展示；团队作品字段始终展示。「意向工位数」仅在「是否有意向入驻 OPC 实体空间」选择「是」时展示。多选原样保留，个人与团队的枚举文案不自动合并。</p>
    ${detailTables}
    <h4>来源与系统字段（全部类型）</h4>
    ${table(["字段", "来源 / 口径"], [["申请类型", "官网根据打开的申请表单自动带入，区分 OPC 社区入驻、精品内容合作、校企合作；用于三类独立归集，不由用户填写或运营随意改类。"], ["来源对象 / 合作方向", "官网根据触发弹窗的城市社区、产业空间或项目入口自动带入，不由用户填写；无来源时展示未提供。不是申请人所在城市，不能据此补出所在地或省市。"], ["申请 ID / 提交时间", "正式提交由系统生成；当前为演示样例，时间精确到分钟。"], ["审核状态 / 审核人 / 审核时间", "仅 OPC，由审核操作写入，不是官网表单字段。"], ["拒绝原因 / 审核备注", "仅 OPC，由审核人员填写；在详情中回看，不覆盖官网原始申请资料。"]])}
    <h4>OPC 审核</h4><ul><li>仅 OPC 待审核记录展示「审核」。选择审核通过 / 审核拒绝；拒绝时必须选择原因：申请资料不完整、联系方式无效、不符合当前合作范围、其他。选择其他时必须填写备注；备注最多 500 字。</li><li>「取消」、关闭、Esc 不保存。提交前校验必填项，失败时停留弹窗并显示错误；确认弹窗展示申请人与最终审核结果，二次确认后保存状态、审核人、时间、拒绝原因及备注。</li><li>演示保存仅在当前页面会话内生效，可在详情回看；刷新页面恢复样例。审核完成后移除审核入口；若筛选条件已不匹配，该记录从当前结果中移除。成功提示明确标注“仅本地演示”。</li></ul>
    <div class="prd-note"><b>数据与权限边界：</b>官网目前仅模拟提交，绿台样例不是前台真实提交数据，也未接入接口、文件上传/下载、数据库、权限、自动通知或正式审核日志。生产应以官网成功提交快照为数据源，后台校验条件字段与必填项，配置详情/审核权限并记录操作日志；接口失败保留表单内容、允许重试，避免重复提交。完整手机号仅授权人员可查看，当前详情使用演示号码。PDF 的后台提取建议不能用来新增官网未填写的字段。</div>
  </div>`;
})();
