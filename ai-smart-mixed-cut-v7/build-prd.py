#!/usr/bin/env python3
"""Build the V7 development PRD reader from Markdown.

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
parser = shared['Markdown']('v7')
body = parser.render(source)
chapter_count = sum(item['level'] == 2 for item in parser.headings)
navigation = ''.join(
    f'<a class="nav-link level-{item["level"]}" href="#{item["id"]}">{html.escape(item["title"])}</a>'
    for item in parser.headings if item['level'] in (2, 3)
)
search_data = []
matches = list(re.finditer(r'<h([123]) id="([^"]+)">(.*?)</h\1>', body, re.S))
for index, match in enumerate(matches):
    end = matches[index+1].start() if index+1 < len(matches) else len(body)
    title = re.sub(r'<a class="anchor".*?</a>', '', match.group(3), flags=re.S)
    search_data.append({'id':match.group(2), 'title':shared['plain'](title), 'group':'V7 开发需求', 'text':shared['plain'](body[match.end():end])})
script = shared['JS'].replace('试试「积分」「模型」或「业务」。','试试「选集」「解说」或「同步」。').replace('__SEARCH_DATA__', json.dumps(search_data, ensure_ascii=False).replace('<', '\\u003c'))
# Keep the review core visible; dependencies and demo assumptions are optional.
appendix = re.search(r'(<h2 id="[^"]+">08\. 待确认与演示边界.*?</h2>)(.*)$', body, re.S)
if appendix:
    body = body[:appendix.start()] + appendix.group(1) + '<details class="doc-appendix" id="reviewAppendix"><summary>展开接口、参数与原型边界</summary><div class="appendix-content">' + appendix.group(2) + '</div></details>'
body = body.replace('<img src="./assets/highlight-workflow-v7.svg"', '<img class="business-flow" src="./assets/highlight-workflow-v7.svg"')
script = script.replace('for(const h of headings){', 'for(const h of headings){if(!h.getClientRects().length)continue;')
script += r"""
function openTargetDetails(target){for(let node=target;node;node=node.parentElement)if(node.tagName==='DETAILS')node.open=true;}
document.addEventListener('click',event=>{const link=event.target.closest('a[href^="#"]');if(!link)return;const target=document.getElementById(decodeURIComponent(link.hash.slice(1)));if(target)openTargetDetails(target);},true);
addEventListener('hashchange',()=>{const target=document.getElementById(decodeURIComponent(location.hash.slice(1)));if(target){openTargetDetails(target);target.scrollIntoView({block:'start'});}});
if(location.hash){const target=document.getElementById(decodeURIComponent(location.hash.slice(1)));if(target)openTargetDetails(target);}
let beforePrintDetails=[];
addEventListener('beforeprint',()=>{beforePrintDetails=[...document.querySelectorAll('.doc details')].map(node=>[node,node.open]);beforePrintDetails.forEach(([node])=>node.open=true);});
addEventListener('afterprint',()=>beforePrintDetails.forEach(([node,open])=>node.open=open));
"""
style = shared['CSS'] + '''
html{scroll-padding-top:0}
:root{--orange:#087f8c;--orange-soft:#e8f4f5;--ink:#23373b;--line:#e0e8e9}
.brand-icon{border-radius:6px}.nav-link.active{color:#087f8c;border-color:#087f8c;background:#e8f4f5}
.nav-link:hover,.result:hover{color:#086b75;background:#edf6f7}.review-tag{color:#087f8c;background:#edf6f7;border-color:#d5e7e9}
.doc-meta strong{color:#087f8c}.doc blockquote{border-color:#90b8bd;background:#f3f8f9;color:#4a6366}
.doc li::marker{color:#4b7880}.result mark{color:#086b75;background:#dcecef}.button:hover{border-color:#93b8bd;background:#f3f8f9}
.button.primary:hover{background:#076773;color:#fff}.search-wrap input{padding-left:12px}.doc td:first-child{min-width:110px;font-weight:500}.business-flow{display:block;width:100%;height:auto;border:1px solid #e0e8e9;border-radius:6px}.doc-appendix{border:1px solid #d6e6e7;border-radius:6px;background:#f7fafb;padding:16px 18px;margin:16px 0}.doc-appendix>summary{cursor:pointer;font-size:14px;font-weight:600;color:#087f8c}.appendix-content{padding-top:14px}
@media print{.doc h2{color:#14545b!important}}
'''
document = '''<!doctype html>
<html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="light"><title>短剧混剪与 AI 解说 · V7 PRD</title><style>__CSS__</style></head>
<body>
<header class="topbar"><a class="brand" href="./"><span class="brand-icon" aria-hidden="true">▧</span>短剧混剪与 AI 解说 <small>V7 · 评审版</small></a><div class="top-actions"><button class="button menu-button" id="menu-button" type="button" aria-controls="sidebar" aria-expanded="false">目录</button><button class="button print-button" id="print-button" type="button">打印 / 保存 PDF</button><a class="button primary" href="./review.html">原型与说明对照 ↗</a></div></header>
<aside class="sidebar" id="sidebar" aria-label="文档目录"><div class="sidebar-label">产品需求说明</div><div class="search-wrap"><input id="search" type="search" placeholder="搜索页面、R/T/D 编号或规则" aria-label="搜索文档全文" autocomplete="off"><kbd>/</kbd></div><nav class="nav-scroll" id="navigation">__NAV__</nav><div class="search-results" id="search-results" aria-live="polite"></div><div class="sidebar-footer">2026.10.08 · 需求评审版<br>页面规则 / 共用规则 / 验收<br><a href="./PRD.md" download>下载 Markdown 源文档 ↗</a></div></aside><div class="scrim" aria-hidden="true"></div>
<main class="reader"><div class="reader-intro"><span><strong>V7 产品需求 · 业务流程与操作规则</strong>　__CHAPTER_COUNT__ 个章节 · 全文可搜索</span><span class="review-tag">精简评审版</span></div><article class="doc" id="v7"><div class="doc-meta"><strong>PRD</strong><span>业务流程 · 页面规则 · 验收</span><a href="./PRD.md" download>下载 Markdown ↗</a></div>__BODY__</article><footer class="page-footer">序号定位原型，R 编号查规则，T 编号验收；待确认项按需展开。</footer></main><button class="back-to-top" id="back-to-top" type="button" aria-label="返回文档顶部">↑ 返回顶部</button><script>__JS__</script>
</body></html>'''
for key, value in [('__CSS__',style),('__NAV__',navigation),('__BODY__',body),('__JS__',script),('__CHAPTER_COUNT__',str(chapter_count))]:
    document = document.replace(key,value)
(ROOT/'PRD.md').write_text(source,encoding='utf-8')
(ROOT/'prd.html').write_text(document,encoding='utf-8')
print(f'Built V7 PRD: {len(parser.headings)} headings, {len(search_data)} search entries, {len(document):,} characters')
