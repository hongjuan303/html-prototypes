# 小说管理 · 批量上传小说

2026-11-23 交互原型，使用演示数据、未接入生产后台。

预览地址：https://hongjuan303.github.io/html-prototypes/novel-batch-upload/

- 用户已确认：Excel填写小说信息，再匹配正文文件。
- 入口：小说管理列表工具栏“批量上传小说”；直接打开页面默认展示上传弹窗，`?view=list`展示列表。
- 流程：下载真实Excel模板 → 选择Excel与多份Word文档 → 校验和逐行修改 → 确认上传；全部成功后关闭弹窗、刷新列表并toast“新建小说成功”。存在失败时保留失败明细与失败项重试。
- 顶部提供正常样例、校验异常、提交失败三个演示入口；刷新清空内存示例数据。
- 用户要求移除上传区域的样例下载及填写预览，现只保留下载空白模板。试传Excel与4份Word文档仅作为页面外配套文件。
- 小说管理背景来自独立字段原型，既有成本/番茄规则沿用。此目录独立，不修改旧原型、不合并电子签。
- 本地服务根目录应为工作区，路径为 `/html-prototypes/novel-batch-upload/`。资源路径已包含GitHub Pages仓库及独立子目录。
- 右侧说明随步骤切换，桌面520px、窄窗440px；原型保持1440px，允许整体横向滚动。序号点击定位说明。

## 待确认方案

Word格式、完整文件名精确匹配及Word文件名（不含后缀）须与小说名称一致已确认。同名同作者拦截、整批校验后提交、默认下架仍为草案；数量/大小上限、章节拆分、封面和版权附件、权限待确认。

## 验证

真实Excel模板下载、Excel/TXT导入、字段缺失、成本精度、番茄联动、正文歧义/空文件、重名记录、坏Excel保留草稿、关闭恢复草稿、成功回流示例列表、部分失败与重试通过。1280×800、1440×900、2240×1080截图已检查。浏览器错误及资源失败均为0。

证据：`../../output/playwright/novel-batch-upload/verification.json`及同目录截图。业务背景与进度在工作区 `02-项目与任务/小说管理批量上传*.md`。

Excel解析复用已有SheetJS CE 0.20.3，来源与许可证保留于vendor目录，无远程CDN依赖。

2026-11-20样例补充：4本真实文件导入通过，日期无偏移；3个下载入口与草稿保留验证通过，三种桌面尺寸截图通过。证据在`../../output/playwright/novel-batch-upload/samples/verification.json`。

2026-11-23必填字段展示：页面样例从7列补充为完整16列，逐列注明填写要求并支持横向滚动；Excel说明新增“是否必填”列，主表内容及导入兼容保持。已逐项核对新建表单的必填/条件必填字段，真实下载后的4本样例导入通过。证据在`../../output/playwright/novel-batch-upload/required-fields-20261123/verification.json`。

2026-11-23替换正文：校验列表每行增加“替换正文”，打开本地TXT选择器；通过后更新该行正文和文件名并重新校验。取消/错误保留原正文，同名冲突不覆盖其他行。同名再次替换、缺失正文补齐、最终提交正文内容及三尺寸布局均验证通过，见`../../output/playwright/novel-batch-upload/replace-body-20261123/verification.json`。

2026-11-23成功反馈：移除成功结果弹窗与“完成”步骤，全部成功直接关闭并toast“新建小说成功”；重试后全部成功同样处理。成功列表回流、重新打开空批次、失败反馈及重试去重验证通过，见`../../output/playwright/novel-batch-upload/success-toast-20261123/verification.json`。此前输出目录内的历史验证脚本/截图记录当时版本，以本次成功toast验证为最新口径。

2026-11-23最新口径：正文上传/替换均为Word（.doc/.docx），TXT不再支持；业务弹窗与右侧说明已删除样例下载、填写预览，只保留空白模板。真实DOC/DOCX文件、伪Word/空文档、替换、成功toast及三尺寸界面均验证通过。旧DOC内容解析及字数需服务端提供，原型不推测。最新证据为`../../output/playwright/novel-batch-upload/word-documents-20261123/verification.json`。

2026-11-23上传页说明：按用户文案保留三个编号区与正文文件的三条子说明，不再额外展示注意备注。Word去掉.doc/.docx后缀后须与小说名称一致，不匹配不参与导入；匹配计数、校验、替换、空白模板及配套Excel说明同步更新。额外Word忽略、不匹配行拦截与修正、替换保留原稿、最终4本成功toast及三尺寸布局验证通过，证据为`../../output/playwright/novel-batch-upload/upload-notes-name-match-20261123/verification.json`。本条替代此前允许任意新文件名的草案。
