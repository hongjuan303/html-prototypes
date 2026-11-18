// 静态来源快照：由已登录正式页面的可见DOM读取，不连接正式写入接口。
// 未读取的信息保留为“未读取”；附件不含原件或下载地址。
const V2_ONLINE_SOURCE_40 = {
  id: 40, name: '寒门帝师', episodes: 55, submitted: '2026-11-04 15:07:32', capturedDate: '2026-11-16',
  sourceUrl: 'https://copyright-service.hzrlhy.com/#/platform/collection-detail?id=40&compilationChannelId=241&returnPath=/platform/channel-management',
  supplier: '江西比芯互娱科技有限公司', supplierSource: '用户提供的线上渠道负责人列表截图',
  materialStatus: '通过', filmStatus: '通过', contract: '有', aigcTool: 'ziptop',
  readSections: ['合集概要', '剧集管理', '合规文件'],
  channels: [
    ['字节系', '字节系（红果和抖音）', '大夏帝师录', '李婧、王少琴、王雯丽、唐怡梦、李俊蓉'],
    ['拼多多', '拼多多', '寒门帝师', '吴美玲、柏雪'],
    ['美团', '美团', '寒门帝师', '邱娟'],
    ['爱奇艺', '爱奇艺', '寒门帝师', '马诗语'],
    ['优酷视频', '优酷视频', '寒门帝师', '吴美玲'],
    ['腾讯视频', '腾讯视频', '寒门帝师', '马诗语'],
    ['芒果TV', '芒果TV', '寒门帝师', '邱娟'],
    ['支付宝', '支付宝', '寒门帝师', '杨晓钰'],
    ['咪咕', '咪咕', '寒门帝师', '马诗语'],
    ['搜狐', '搜狐', '寒门帝师', '柏雪'],
    ['UC浏览器', 'UC浏览器', '寒门帝师', '吴美玲'],
    ['小米', '小米', '寒门帝师', '马诗语'],
    ['淘宝', '淘宝', '寒门帝师', '邱娟'],
    ['微博', '微博', '寒门帝师', '邱娟'],
    ['快手', '快手', '寒门帝师', '李佳晨、菅婷婷、涂碧焜'],
    ['全民K歌（全民短剧）', '全民K歌（全民短剧）', '寒门帝师', '邱娟'],
    ['微信视频号', '微信视频号', '寒门帝师', '唐金娇、谢益文、陈巍波、金茹霞、吴琦、王程昱、毛锦涛、邹竣宇、武潇嘉、马钐源、许鑫、王宁、李扬、郭芳辉、廖浩、袁跃宇'],
    ['版权代售', '版权代售', '寒门帝师', '林婷婷、汪盼'],
    ['河马APP', '河马APP', '寒门帝师', '邱娟'],
    ['百家号', '百家号', '寒门帝师', '邱娟'],
    ['B站', 'B站', '寒门帝师', '邱娟'],
    ['华为', '华为', '寒门帝师', '柏雪'],
    ['海外 YouTube', '海外YouTube', '寒门帝师', '谢悦鑫'],
    ['海外 TikTok 端原生', '海外Tiktok端原生', '寒门帝师', '谢益文、王雨阳']
  ].map(([key, label, workName, operator]) => ({ key, label, workName, operator, status: '未上线', launch: '2026-11-19', contentId: '—' })),
  fileGroups: [
    ['片酬承诺书', ['b10c9e0584994c2ab289ce348a749096.pdf', '5b7ae20d20534914b56672e517262df3.pdf']],
    ['版权文件', ['01411b129d0641059b5aa1446355771f.pdf', '6c06135bb387440e8b432a0a496f43c9.pdf', '6135802824404e14a169e5369a13867f.pdf', '336fac70877849bcb556394b934012c2.pdf', '5f482a7e4965437f927240b1aca8e9fc.pdf', 'c9e487f296b14d078c0b4366a76c684a.pdf', '9f22a0759e284334898b2c6b733194e5.pdf', '7e9a9bd967894fa685dd80ee3d6a3393.pdf']],
    ['微信视频端成本配置文件', ['e1acdef7bef2407f9e744a1efec88a2d.pdf']],
    ['河马专属权利声明+成本文件', ['8e2de3ce76f540b39db8a406a45339f9.pdf', '578e91933a3e4310854ba821b9b40d0d.pdf', '727029aee1394ec0a112512f1c7ab404.pdf']],
    ['权利声明及不侵权承诺（微信模板）', ['c3c580de05e1401aa783fc41ddaf89db.pdf']],
    ['权利声明及不侵权承诺函（红果模板）', ['b011690711f842ffa1790c7fa00032fd.pdf']],
    ['支付宝承诺函', ['0c40acf283b14f95a29f1981b2fa1f6e.pdf']],
    ['快手自建站授权书', ['232e805b09e24f4585b51a492872add1.pdf']],
    ['腾讯火龙漫剧配套文件', ['f423464de6674327867ecdad24ecfc18.pdf', '5bfd36b8bf7d46ee9457058405de36be.pdf', 'b25fb7b7d32c41be9ce9dc000d0756c6.pdf']]
  ]
};
if (!records.some(r => r.id === V2_ONLINE_SOURCE_40.id)) {
  const source = structuredClone(V2_ONLINE_SOURCE_40);
  records.push(newRecord(source.id, {
    name: source.name, episodes: source.episodes, submitted: source.submitted, supplier: source.supplier, supplierId: 'online-supplier-40',
    link: '', type: '未读取', round: '未读取', quality: '未读取', groups: ['未读取', '未读取', '未读取'], intent: [], exclude: [],
    release: source.channels.map(c => c.key), contact: '未读取', contract: source.contract,
    materialStatus: source.materialStatus, filmStatus: source.filmStatus, stage: STAGES[2], launch: '2026-11-19', freeTime: '',
    assignment: Object.fromEntries(source.channels.map(c => [c.key, c.operator])),
    qualityTasks: [], qualityHistory: [], qualityFinal: null, episodeFiles: [], channelReturns: {}, channelMaterialReturns: {}, customMaterials: {},
    onlineSnapshot: source
  }));
}
function v2SnapshotArea(label, content = '') {
  return '<section class="editor-section v2-snapshot-section"><h2>' + esc(label) + '</h2>' +
    (content || '<p class="v2-snapshot-empty">尚未读取此页签的线上资料。</p>') + '</section>';
}
const v2BeforeSnapshotAreas = collectionMaterialAreas;
collectionMaterialAreas = function (r, ...args) {
  if (!r.onlineSnapshot) return v2BeforeSnapshotAreas(r, ...args);
  const source = r.onlineSnapshot;
  const basics = '<dl class="bordered-descriptions">' + detailField('合集名称', esc(r.name)) + detailField('集数', r.episodes + ' 集') + detailField('供应商', esc(r.supplier)) + '</dl><p class="muted">其余基础字段尚未读取。</p>';
  const files = '<dl class="bordered-descriptions">' + detailField('制作合同（有或无）', esc(source.contract)) +
    source.fileGroups.map(([label, names]) => detailField(label, '<ul class="v2-snapshot-files">' + names.map(name => '<li>' + esc(name) + '</li>').join('') + '</ul>')).join('') + detailField('关联 AIGC 工具', esc(source.aigcTool)) + '</dl><p class="muted">文件名为线上当前显示值；未读取到原始文件名映射，未导入附件原件。</p>';
  return { 基础信息: v2SnapshotArea('基础信息', basics), 剧情文案: v2SnapshotArea('剧情文案'), 备案信息: v2SnapshotArea('备案信息'), 角色资料: v2SnapshotArea('角色资料'), 主创团队: v2SnapshotArea('主创团队'), 成片素材: v2SnapshotArea('成片素材'), 合规文件: v2SnapshotArea('合规文件', files), 授权书: v2SnapshotArea('授权书') };
};
const v2BeforeSnapshotDetail = views.detail;
views.detail = function () {
  const html = v2BeforeSnapshotDetail(), r = val(ui.selected);
  if (!r?.onlineSnapshot) return html;
  const source = r.onlineSnapshot;
  return '<div class="v2-source-notice"><div><strong>线上真实数据快照 · ' + esc(source.capturedDate) + '</strong><span>已读取合集概要、24个渠道及合规文件。其他资料标记为未读取，本地演示操作不会回写正式系统。</span></div><a class="link" href="' + esc(source.sourceUrl) + '" target="_blank" rel="noopener">查看线上原记录</a></div>' + html;
};
const v2BeforeSnapshotDialog = dialogBody;
dialogBody = function (modal) {
  const r = val(modal.id);
  if (!r?.onlineSnapshot || modal.type !== 'collection-info') return v2BeforeSnapshotDialog(modal);
  const areas = collectionMaterialAreas(r), data = modal.draft;
  const sourceChannel = r.onlineSnapshot.channels.find(c => c.key === modal.channel);
  const body = data.tab === '物料详情' ? '<div class="v2-snapshot-inspection">' + MATERIAL_SECTIONS.map(([, label]) => areas[label]).join('') + '</div>' : '<div class="v2-snapshot-empty">线上合集为 ' + r.episodes + ' 集；尚未读取分集视频清单，未导入正片原件。</div>';
  return [(sourceChannel ? sourceChannel.label + ' · ' + sourceChannel.workName : r.name) + '详情', '<p class="muted">线上读取快照 · ' + esc(r.onlineSnapshot.capturedDate) + ' ' + mark(1) + '</p>' + tabs([['物料详情', '物料详情'], ['正片详情', '正片详情']], data.tab, 'inspect-tab') + body];
};
const v2BeforeSnapshotNotes = noteInfo;
noteInfo = function () {
  const r = val(ui.modal?.id || ui.selected), rules = v2BeforeSnapshotNotes();
  if (!r?.onlineSnapshot || ui.view !== 'detail') return rules;
  const sourceFields = [
    ['数据来源', '2026-11-16从已登录正式页面只读取得【寒门帝师】概要、24个渠道及合规文件；供应商名称取用户提供的线上列表截图。'],
    ['真实与未读取', '保留各渠道自己的作品名、状态、日期和运营；字节系作品名为【大夏帝师录】。未读取的类型、评估、转免时间、资料页签和正片清单不补造。'],
    ['使用范围', '当前为V2本地快照，非实时接口。保留既有演示记录及用户修改，附件仅保留线上显示名称，不含原件或下载地址。']
  ];
  if (ui.modal?.type === 'collection-info') return v2Note('线上快照详情', '查看已核实的资料，未读取页签明确提示。', [['列表项', sourceFields]]);
  if (ui.modal) return rules;
  if (ui.detailTab === '合规文件') return { ...rules, sections: [[rules.sections[0][0], [...sourceFields, ...rules.sections[0][1]]], ['列表项（已读取合规资料）', [
    ['制作合同（有或无）', '线上当前值为“有”。'], ['文件名', '保留页面显示的21个PDF名称，未读取到原名映射时不猜造；不导入合同原件或下载地址。'], ['关联 AIGC 工具', '线上当前显示ziptop。']
  ]]] };
  return { ...rules, sections: [[rules.sections[0][0], [...sourceFields, ...rules.sections[0][1]]], ...rules.sections.slice(1)] };
};
const v2BeforeSnapshotDownload = clickActions['v2-download-films'];
clickActions['v2-download-films'] = r => r.onlineSnapshot && !r.episodeFiles.length ? announce('当前快照未导入正片原件。') : v2BeforeSnapshotDownload(r);
const v2BeforeSnapshotReject = clickActions['v2-channel-reject'];
clickActions['v2-channel-reject'] = r => r.onlineSnapshot && !r.episodeFiles.length ? announce('当前快照尚未读取分集视频清单。') : v2BeforeSnapshotReject(r);
if (location.hash === '#detail' && Number(previewParams.get('id')) === V2_ONLINE_SOURCE_40.id && val(V2_ONLINE_SOURCE_40.id)?.onlineSnapshot) {
  ui.selected = V2_ONLINE_SOURCE_40.id; ui.view = 'detail'; ui.side = 'platform';
}
render();
