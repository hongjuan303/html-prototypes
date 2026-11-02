# 本地预览依赖

- `pdf.min.mjs`、`pdf.worker.min.mjs`、`cmaps/`、`standard_fonts/`：Mozilla PDF.js 4.10.38，Apache-2.0，许可见 `pdfjs-LICENSE`。官方项目 https://github.com/mozilla/pdf.js ，发行包 https://www.npmjs.com/package/pdfjs-dist/v/4.10.38 。用于本地 PDF 翻页/缩放渲染，不上传文档；关闭动态代码求值。

- `mammoth.browser.min.js`：Mammoth.js 1.13.0，BSD-2-Clause，完整许可见 `mammoth-LICENSE`。
- 官方项目：https://github.com/mwilliamson/mammoth.js
- 来源：https://cdn.jsdelivr.net/npm/mammoth@1.13.0/mammoth.browser.min.js
- 仅在用户预览 DOCX 时加载，提取纯文本并转义后展示；不直接注入转换后的 HTML，不将文档上传外部服务。
- DOCX 为阅读分页，不保持原文档页码/版式；旧版 DOC 及其他不支持文档需正式转换服务。
- `../assets/preview-sample.webm` 为本次用 Canvas 和 MediaRecorder 生成的 6 秒山海主题动画，仅演示播放器与选集，不代表实际参赛作品。生成源位于本地验证目录 `output/playwright/ecology-contest/generate-preview.html`。
