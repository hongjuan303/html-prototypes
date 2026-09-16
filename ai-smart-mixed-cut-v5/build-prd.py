#!/usr/bin/env python3
"""Build the V5 prototype PRD reader from Markdown.

Usage: python3 build-prd.py [--source /path/to/canonical.md]
Defaults to PRD.md beside this script. All build dependencies are local.
An explicit source also updates the downloadable PRD.md copy.
"""
from pathlib import Path
import html
import json
import re
import runpy
import argparse

ROOT = Path(__file__).resolve().parent
cli = argparse.ArgumentParser(description=__doc__)
cli.add_argument('--source', type=Path, default=ROOT / 'PRD.md')
SOURCE = cli.parse_args().source
shared = runpy.run_path(str(ROOT / 'prd-renderer.py'))
source = SOURCE.read_text(encoding='utf-8')
parser = shared['Markdown']('v5')
body = parser.render(source)
navigation = ''.join(
    f'<a class="nav-link level-{item["level"]}" href="#{item["id"]}">{html.escape(item["title"])}</a>'
    for item in parser.headings if item['level'] in (2, 3)
)
search_data = []
matches = list(re.finditer(r'<h([123]) id="([^"]+)">(.*?)</h\1>', body, re.S))
for index, match in enumerate(matches):
    end = matches[index+1].start() if index+1 < len(matches) else len(body)
    title = re.sub(r'<a class="anchor".*?</a>', '', match.group(3), flags=re.S)
    search_data.append({'id':match.group(2), 'title':shared['plain'](title), 'group':'V5 原型说明', 'text':shared['plain'](body[match.end():end])})
script = shared['JS'].replace('试试「积分」「模型」或「业务」。','试试「选集」「解说」或「同步」。').replace('__SEARCH_DATA__', json.dumps(search_data, ensure_ascii=False).replace('<', '\\u003c'))
style = shared['CSS'] + '''
html{scroll-padding-top:0}
:root{--orange:#137d65;--orange-soft:#e9f4ef;--ink:#233b33;--line:#e0e8e2}
.brand-icon{border-radius:6px}.nav-link.active{color:#137d65;border-color:#137d65;background:#e9f4ef}
.nav-link:hover,.result:hover{color:#12644f;background:#edf6f1}.review-tag{color:#137d65;background:#edf6f1;border-color:#d5e7dc}
.doc-meta strong{color:#137d65}.doc blockquote{border-color:#90bba8;background:#f3f8f5;color:#4a6659}
.doc li::marker{color:#4b8068}.result mark{color:#12644f;background:#dcefe5}.button:hover{border-color:#93bda9;background:#f3f8f5}
.button.primary:hover{background:#116950;color:#fff}.search-wrap input{padding-left:12px}.doc td:first-child{min-width:120px;font-weight:500}
@media print{.doc h2{color:#245847!important}}
'''
document = '''<!doctype html>
<html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="light"><title>短剧混剪与 AI 解说 · V5 PRD</title><style>__CSS__</style></head>
<body>
<header class="topbar"><a class="brand" href="./"><span class="brand-icon" aria-hidden="true">▧</span>短剧混剪与 AI 解说 <small>V5 · PRD</small></a><div class="top-actions"><button class="button menu-button" id="menu-button" type="button" aria-controls="sidebar" aria-expanded="false">目录</button><button class="button print-button" id="print-button" type="button">打印 / 保存 PDF</button><a class="button primary" href="./review.html">原型与说明对照 ↗</a></div></header>
<aside class="sidebar" id="sidebar" aria-label="文档目录"><div class="sidebar-label">产品需求说明</div><div class="search-wrap"><input id="search" type="search" placeholder="搜索页面、字段或规则" aria-label="搜索文档全文" autocomplete="off"><kbd>/</kbd></div><nav class="nav-scroll" id="navigation">__NAV__</nav><div class="search-results" id="search-results" aria-live="polite"></div><div class="sidebar-footer">2026.09.16 · 当前原型说明<br>仅覆盖当前 Demo 演示的功能<br><a href="./PRD.md" download>下载 Markdown 源文档 ↗</a></div></aside><div class="scrim" aria-hidden="true"></div>
<main class="reader"><div class="reader-intro"><span><strong>V5 产品原型 · 功能与交互说明</strong>　12 个章节 · 全文可搜索</span><span class="review-tag">原型说明版</span></div><article class="doc" id="v5"><div class="doc-meta"><strong>PRD</strong><span>页面 · 字段 · 流程 · 状态</span><a href="./PRD.md" download>下载 Markdown ↗</a></div>__BODY__</article><footer class="page-footer">按当前 V5 Demo 编写。正文之外不扩展模型选型、技术架构或未展示功能；投放回传评分不属于本版。阅读页由 Markdown 生成。</footer></main><button class="back-to-top" id="back-to-top" type="button" aria-label="返回文档顶部">↑ 返回顶部</button><script>__JS__</script>
</body></html>'''
for key, value in [('__CSS__',style),('__NAV__',navigation),('__BODY__',body),('__JS__',script)]:
    document = document.replace(key,value)
(ROOT/'PRD.md').write_text(source,encoding='utf-8')
(ROOT/'prd.html').write_text(document,encoding='utf-8')
print(f'Built V5 PRD: {len(parser.headings)} headings, {len(search_data)} search entries, {len(document):,} characters')
