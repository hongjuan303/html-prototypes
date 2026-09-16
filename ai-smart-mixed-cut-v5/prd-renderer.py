"""Shared Markdown renderer and reader assets for the V5 PRD.
Extracted from the existing prototype document renderer; no build side effects.
"""
from __future__ import annotations
import html
import re
from html.parser import HTMLParser

def safe_url(value: str) -> str:
    value = html.unescape(value.strip().strip("<>"))
    if re.match(r"^(?:javascript|data|vbscript):", value, re.I):
        return "#"
    return html.escape(value, quote=True)


def inline(value: str) -> str:
    tokens: list[str] = []

    def stash(markup: str) -> str:
        tokens.append(markup)
        return f"\x00{len(tokens) - 1}\x00"

    value = re.sub(r"(`+)(.+?)\1", lambda m: stash("<code>" + html.escape(m.group(2).strip()) + "</code>"), value)
    value = re.sub(r"<br\s*/?>", lambda m: stash("<br>"), value, flags=re.I)
    value = re.sub(r"!\[([^\]]*)\]\((<[^>]*>|[^\s)]+)(?:\s+\"[^\"]*\")?\)",
                   lambda m: stash(f'<img src="{safe_url(m.group(2))}" alt="{html.escape(m.group(1), quote=True)}" loading="lazy">'), value)
    value = re.sub(r"\[([^\]]+)\]\((<[^>]*>|[^\s)]+)(?:\s+\"[^\"]*\")?\)",
                   lambda m: stash(f'<a href="{safe_url(m.group(2))}">{html.escape(m.group(1))}</a>'), value)
    value = re.sub(r"<(https?://[^>]+)>", lambda m: stash(f'<a href="{safe_url(m.group(1))}">{html.escape(m.group(1))}</a>'), value)
    value = html.escape(value)
    # These documents use ** for emphasis and __ as business-response blanks.
    # Keep underscores literal so two separate blanks cannot become emphasis.
    value = re.sub(r"\*\*(.+?)\*\*", r"<strong>\1</strong>", value)
    value = re.sub(r"(?<!\*)\*([^*\n]+)\*(?!\*)", r"<em>\1</em>", value)
    value = re.sub(r"~~(.+?)~~", r"<del>\1</del>", value)
    value = re.sub(r" {2,}\n", "<br>\n", value).replace("\n", " ")
    # Code tokens may appear inside link labels; restore from outer to inner.
    while re.search(r"\x00(\d+)\x00", value):
        value = re.sub(r"\x00(\d+)\x00", lambda m: tokens[int(m.group(1))], value)
    return value


def split_cells(line: str) -> list[str]:
    line = line.strip()
    if line.startswith("|"):
        line = line[1:]
    if line.endswith("|") and not line.endswith("\\|"):
        line = line[:-1]
    cells, current, in_code, escaped = [], [], False, False
    for char in line:
        if char == "|" and not in_code and not escaped:
            cells.append("".join(current).strip())
            current = []
        else:
            if char == "`" and not escaped:
                in_code = not in_code
            current.append(char)
        escaped = char == "\\" and not escaped
    cells.append("".join(current).strip())
    return [cell.replace("\\|", "|") for cell in cells]


class TextOnly(HTMLParser):
    def __init__(self):
        super().__init__()
        self.parts = []

    def handle_data(self, value):
        self.parts.append(value)


def plain(markup: str) -> str:
    parser = TextOnly()
    parser.feed(markup)
    return re.sub(r"\s+", " ", " ".join(parser.parts)).strip()


class Markdown:
    heading = re.compile(r"^ {0,3}(#{1,6})\s+(.+?)\s*#*\s*$")
    list_item = re.compile(r"^( {0,3})([-+*]|\d+[.)])\s+(.*)$")
    fence = re.compile(r"^ {0,3}(`{3,}|~{3,})(.*)$")

    def __init__(self, prefix: str):
        self.prefix = prefix
        self.headings = []
        self.ids = {}

    def heading_html(self, level: int, title: str) -> str:
        label = plain(inline(title))
        slug = re.sub(r"[^\w\u3400-\u9fff-]+", "-", label, flags=re.UNICODE).strip("-").lower() or "section"
        base = f"{self.prefix}-{slug}"
        count = self.ids.get(base, 0)
        self.ids[base] = count + 1
        anchor = base if count == 0 else f"{base}-{count + 1}"
        self.headings.append({"level": level, "title": label, "id": anchor})
        return f'<h{level} id="{anchor}">{inline(title)}<a class="anchor" href="#{anchor}" aria-label="链接到此章节">#</a></h{level}>'

    @staticmethod
    def separator(line: str) -> bool:
        cells = split_cells(line)
        return bool(cells) and all(re.fullmatch(r":?-{3,}:?", cell.replace(" ", "")) for cell in cells)

    def starts_block(self, lines: list[str], i: int) -> bool:
        text = lines[i]
        return bool(self.heading.match(text) or self.fence.match(text) or self.list_item.match(text)
                    or text.lstrip().startswith(">") or re.fullmatch(r" {0,3}(?:-{3,}|\*{3,}|_{3,})\s*", text)
                    or (i + 1 < len(lines) and "|" in text and self.separator(lines[i + 1])))

    def render(self, source: str) -> str:
        return self.blocks(source.replace("\r\n", "\n").expandtabs(4).splitlines())

    def blocks(self, lines: list[str]) -> str:
        result, i = [], 0
        while i < len(lines):
            line = lines[i]
            if not line.strip():
                i += 1
                continue
            match = self.fence.match(line)
            if match:
                marker, lang = match.group(1), match.group(2).strip().split(" ")[0]
                body, i = [], i + 1
                while i < len(lines) and not re.fullmatch(r" {0,3}" + re.escape(marker[0]) + "{" + str(len(marker)) + r",}\s*", lines[i]):
                    body.append(lines[i])
                    i += 1
                if i < len(lines):
                    i += 1
                result.append(f'<pre><code class="language-{html.escape(lang, quote=True)}">{html.escape(chr(10).join(body))}</code></pre>')
                continue
            match = self.heading.match(line)
            if match:
                result.append(self.heading_html(len(match.group(1)), match.group(2)))
                i += 1
                continue
            if i + 1 < len(lines) and re.fullmatch(r" {0,3}(?:={3,}|-{3,})\s*", lines[i + 1]) and not self.starts_block(lines, i):
                result.append(self.heading_html(1 if "=" in lines[i + 1] else 2, line.strip()))
                i += 2
                continue
            if re.fullmatch(r" {0,3}(?:-{3,}|\*{3,}|_{3,})\s*", line):
                result.append("<hr>")
                i += 1
                continue
            if i + 1 < len(lines) and "|" in line and self.separator(lines[i + 1]):
                headers, alignment = split_cells(line), split_cells(lines[i + 1])
                rows, i = [], i + 2
                while i < len(lines) and lines[i].strip() and "|" in lines[i] and not self.heading.match(lines[i]):
                    rows.append(split_cells(lines[i]))
                    i += 1
                def cell_html(cell, index, tag):
                    spec = alignment[index] if index < len(alignment) else "---"
                    align = "center" if spec.startswith(":") and spec.endswith(":") else "right" if spec.endswith(":") else "left"
                    return f'<{tag} style="text-align:{align}">{inline(cell)}</{tag}>'
                head = "".join(cell_html(cell, n, "th") for n, cell in enumerate(headers))
                body = "".join("<tr>" + "".join(cell_html(cell, n, "td") for n, cell in enumerate(row)) + "</tr>" for row in rows)
                result.append(f'<div class="table-scroll" role="region" aria-label="数据表格，可横向滚动" tabindex="0"><table><thead><tr>{head}</tr></thead><tbody>{body}</tbody></table></div>')
                continue
            if line.lstrip().startswith(">"):
                quote = []
                while i < len(lines) and (lines[i].lstrip().startswith(">") or (not lines[i].strip() and i + 1 < len(lines) and lines[i + 1].lstrip().startswith(">"))):
                    quote.append(re.sub(r"^\s*> ?", "", lines[i]))
                    i += 1
                result.append("<blockquote>" + self.blocks(quote) + "</blockquote>")
                continue
            match = self.list_item.match(line)
            if match:
                ordered = match.group(2)[0].isdigit()
                tag = "ol" if ordered else "ul"
                start = int(re.match(r"\d+", match.group(2)).group()) if ordered else 1
                items = []
                while i < len(lines):
                    item = self.list_item.match(lines[i])
                    if not item or item.group(2)[0].isdigit() != ordered:
                        break
                    indent = len(item.group(1))
                    content_indent = len(item.group(0)) - len(item.group(3))
                    content, i = [item.group(3)], i + 1
                    while i < len(lines):
                        next_item = self.list_item.match(lines[i])
                        if next_item and len(next_item.group(1)) <= indent:
                            break
                        if not lines[i].strip():
                            if i + 1 >= len(lines) or (lines[i + 1].strip() and len(lines[i + 1]) - len(lines[i + 1].lstrip()) <= indent):
                                i += 1
                                break
                            content.append("")
                            i += 1
                            continue
                        leading = len(lines[i]) - len(lines[i].lstrip())
                        if leading <= indent and self.starts_block(lines, i):
                            break
                        if leading < content_indent and leading <= indent:
                            # A non-indented line is a lazy continuation only without a blank.
                            content.append(lines[i])
                        else:
                            content.append(lines[i][min(content_indent, leading):])
                        i += 1
                    items.append("<li>" + self.blocks(content) + "</li>")
                attrs = f' start="{start}"' if ordered and start != 1 else ""
                result.append(f"<{tag}{attrs}>" + "".join(items) + f"</{tag}>")
                continue
            if line.startswith("    "):
                code = []
                while i < len(lines) and (lines[i].startswith("    ") or not lines[i].strip()):
                    code.append(lines[i][4:] if lines[i].startswith("    ") else "")
                    i += 1
                result.append("<pre><code>" + html.escape("\n".join(code).rstrip()) + "</code></pre>")
                continue
            paragraph, i = [line], i + 1
            while i < len(lines) and lines[i].strip() and not self.starts_block(lines, i):
                paragraph.append(lines[i])
                i += 1
            result.append("<p>" + inline("\n".join(paragraph)) + "</p>")
        return "\n".join(result)


CSS = r"""
:root{--ink:#25282e;--muted:#636a74;--line:#e6e8ec;--paper:#fff;--orange:#b94b16;--orange-soft:#fff2e9;--sidebar:272px;--header:70px;--sans:Inter,-apple-system,BlinkMacSystemFont,"PingFang SC","Microsoft YaHei",sans-serif}
*{box-sizing:border-box}html{scroll-behavior:smooth;scroll-padding-top:96px}body{margin:0;color:var(--ink);background:var(--paper);font:15px/1.85 var(--sans)}button,input{font:inherit}a{color:var(--orange);text-decoration:none}a:hover{text-decoration:underline}button,a,input{outline-offset:4px}:focus-visible{outline:2px solid var(--orange)}
.topbar{height:var(--header);position:fixed;inset:0 0 auto;z-index:30;display:flex;align-items:center;justify-content:space-between;gap:20px;padding:0 32px;background:rgba(255,255,255,.97);border-bottom:1px solid var(--line)}.brand{display:flex;align-items:center;gap:12px;color:var(--ink);text-decoration:none!important;font-size:16px;font-weight:700;white-space:nowrap}.brand-icon{display:grid;place-items:center;width:32px;height:32px;background:var(--orange);color:#fff;border-radius:8px;font-size:18px}.brand small{font-size:12px;font-weight:500;color:var(--muted);border-left:1px solid #d5d8dd;margin-left:2px;padding-left:14px}.top-actions{display:flex;align-items:center;gap:12px}.button{display:inline-flex;align-items:center;justify-content:center;min-height:36px;padding:5px 12px;border:1px solid #dfe2e7;background:#fff;border-radius:6px;color:#41464f;cursor:pointer;font-size:13px;text-decoration:none!important}.button:hover{border-color:#be7149;background:#fffaf7}.button.primary{background:var(--orange);color:white;border-color:var(--orange)}.menu-button{display:none}.sidebar{position:fixed;left:0;top:var(--header);bottom:0;width:var(--sidebar);padding:25px 20px 24px 24px;border-right:1px solid var(--line);background:#fafbfc;z-index:20;display:flex;flex-direction:column}.sidebar-label{font-size:11px;letter-spacing:1.4px;color:#6a7078;font-weight:700;margin-bottom:13px}.search-wrap{position:relative;flex-shrink:0}.search-wrap svg{position:absolute;left:11px;top:13px;color:#7a818c}.search-wrap input{width:100%;height:41px;background:white;border:1px solid #dce0e6;border-radius:6px;padding:8px 30px 8px 35px;font-size:13px;color:#25282e}.search-wrap kbd{position:absolute;right:10px;top:12px;border:1px solid #e4e6e9;border-radius:3px;font:11px var(--sans);padding:0 3px;color:#878d96}.search-wrap:focus-within kbd{display:none}.nav-scroll{overflow:auto;overscroll-behavior:contain;flex:1;margin:18px -8px 0;padding:0 8px 16px;scrollbar-width:thin}.nav-group{margin:0 0 22px}.nav-group-title{display:block;padding:7px 8px;color:#3b4149;font-size:13px;font-weight:700}.nav-group-title span{display:block;font-size:10px;font-weight:600;letter-spacing:1px;color:#9298a1;margin-bottom:1px}.nav-link{display:block;padding:5px 8px;margin:1px 0;color:#666e79;line-height:1.6;font-size:12px;border-left:2px solid transparent}.nav-link.level-3{padding-left:19px;font-size:11.5px}.nav-link:hover{color:#9d4014;text-decoration:none;background:#fff7f1}.nav-link.active{color:#a54113;background:var(--orange-soft);border-color:#d36730;font-weight:600}.sidebar-footer{padding-top:15px;border-top:1px solid var(--line);font-size:11px;color:#7c838d;line-height:1.8}.sidebar-footer a{color:#636b76}.reader{margin:var(--header) 0 0 var(--sidebar);padding:36px 54px 84px;max-width:calc(1170px + var(--sidebar));min-width:0}.reader-intro{display:flex;align-items:center;justify-content:space-between;gap:16px;font-size:12px;color:#737b86;border-bottom:1px solid var(--line);padding:0 0 22px;margin-bottom:25px}.reader-intro strong{font-weight:600;color:#414954}.review-tag{display:inline-block;color:#a5481d;background:#fff3e9;border:1px solid #f0d7c7;border-radius:4px;padding:1px 8px;font-size:11px}.doc{max-width:1100px}.doc+.doc{border-top:2px solid #e7e9ed;margin-top:72px;padding-top:24px}.doc-meta{display:flex;gap:10px;align-items:center;margin:10px 0 6px;font-size:11px;color:#818892}.doc-meta strong{font-weight:700;color:#a74b23;text-transform:uppercase;letter-spacing:1px}.doc-meta a{margin-left:auto;font-size:11px;color:#737b87}.doc h1{font-size:29px;line-height:1.4;letter-spacing:-.5px;color:#282c33;margin:12px 0 21px;font-weight:720}.doc h2{font-size:21px;line-height:1.55;color:var(--orange);margin:44px 0 16px;padding-top:4px;font-weight:700}.doc h3{font-size:17px;line-height:1.6;color:#353b43;margin:28px 0 12px;font-weight:650}.doc h4,.doc h5,.doc h6{font-size:15px;color:#3e444d;line-height:1.7;margin:23px 0 10px}.doc h1,.doc h2,.doc h3,.doc h4{scroll-margin-top:92px}.doc p{margin:0 0 15px;overflow-wrap:anywhere}.doc strong{font-weight:650;color:#262c33}.doc ul,.doc ol{padding-left:24px;margin:12px 0 21px}.doc li{padding-left:3px;margin:7px 0}.doc li p{margin:0 0 6px}.doc li::marker{color:#8b542f;font-weight:550}.doc blockquote{margin:20px 0;padding:15px 19px;border-left:3px solid #d5743f;background:#fff7f1;color:#60564c}.doc blockquote p:last-child{margin-bottom:0}.doc code{font:12px/1.7 ui-monospace,SFMono-Regular,Consolas,monospace;background:#f3f4f6;color:#615245;border-radius:3px;padding:2px 5px;overflow-wrap:anywhere}.doc pre{padding:18px 21px;border:1px solid #e5e7eb;border-radius:7px;background:#f7f8fa;margin:18px 0 24px;overflow:auto;line-height:1.7}.doc pre code{background:none;color:#485362;padding:0;white-space:pre;overflow-wrap:normal;font-size:12px}.doc hr{margin:27px 0;border:0;border-top:1px solid var(--line)}.doc img{max-width:100%;height:auto}.table-scroll{width:100%;overflow-x:auto;scrollbar-width:thin;margin:18px 0 27px;border:1px solid #e0e4e9;border-radius:6px}.doc table{width:100%;border-collapse:collapse;table-layout:auto;font-size:12.5px;line-height:1.75}.doc th{background:#f5f6f8;color:#454d57;font-weight:650;vertical-align:top;padding:12px 13px;border-bottom:1px solid #dfe3e9}.doc td{padding:12px 13px;vertical-align:top;border-bottom:1px solid #e8ebef;min-width:110px;overflow-wrap:anywhere}.doc td+td,.doc th+th{border-left:1px solid #eef0f3}.doc tr:last-child td{border-bottom:0}.doc tr:nth-child(even) td{background:#fcfcfd}.doc td code{font-size:11px}.anchor{opacity:0;padding-left:9px;font-size:16px;color:#b5a193;text-decoration:none!important}.doc :is(h1,h2,h3,h4):hover .anchor,.anchor:focus{opacity:1}.search-results{display:none;flex:1;overflow:auto;margin:16px -7px 0;padding:0 7px}.search-results.visible{display:block}.search-meta{font-size:11px;color:#7a818b;margin:0 0 9px}.result{display:block;padding:12px 8px;border-bottom:1px solid #e3e6eb;color:#555e69;text-decoration:none!important}.result:hover{background:#fff7f1}.result small{display:block;font-size:10px;color:#8f7769;margin-bottom:3px}.result strong{display:block;font-size:12px;color:#4a4140;line-height:1.6}.result p{font-size:11px;color:#707985;line-height:1.65;margin:5px 0 0}.result mark{color:#944017;background:#ffe0c9;padding:0 1px}.no-results{padding:12px 7px;font-size:12px;color:#747c87}.search-clear{padding:6px 8px;margin-top:12px;width:100%;border:1px solid #dfe3e9;border-radius:5px;background:white;color:#606873;font-size:12px;cursor:pointer}.back-to-top{position:fixed;bottom:22px;right:24px;background:#fff;border:1px solid #dfe3e8;border-radius:6px;padding:8px 13px;color:#666f7a;font-size:12px;box-shadow:0 3px 12px #2630470a;cursor:pointer}.page-footer{border-top:1px solid var(--line);margin-top:55px;padding-top:20px;font-size:12px;color:#808792}.scrim{display:none}.focus-highlight{animation:focusfade 2s ease-out}@keyframes focusfade{from{background:#fff0dd}to{background:transparent}}
@media(min-width:1700px){.reader{padding-left:78px;padding-right:78px}.doc{max-width:1080px}}
@media(max-width:1100px){:root{--sidebar:238px}.reader{padding:30px 30px 70px}.topbar{padding:0 24px}.sidebar{padding-left:18px;padding-right:15px}.doc h1{font-size:26px}}
@media(max-width:760px){:root{--header:64px}.topbar{padding:0 16px;gap:8px}.brand{font-size:14px;gap:8px}.brand small{display:none}.brand-icon{width:28px;height:28px}.top-actions{gap:7px}.top-actions .print-button{display:none}.button{font-size:12px;padding:4px 9px}.menu-button{display:inline-flex}.sidebar{width:288px;transform:translateX(-100%);transition:transform .18s}.sidebar.open{transform:translateX(0)}.scrim.open{display:block;position:fixed;inset:var(--header) 0 0;background:#20263055;z-index:19}.reader{margin-left:0;padding:25px 20px 64px}.reader-intro{align-items:flex-start;font-size:11px;gap:8px;margin-bottom:18px;padding-bottom:17px}.doc h1{font-size:24px}.doc h2{font-size:19px;margin-top:36px}.doc h3{font-size:16px}body{font-size:14px}.doc-meta a{font-size:10px}.doc table{font-size:12px;min-width:560px}.doc th,.doc td{padding:10px 11px}.doc pre{padding:14px}.back-to-top{bottom:15px;right:15px;padding:7px 10px}.reader-intro strong{display:block}.doc+.doc{margin-top:52px}}
@media(prefers-reduced-motion:reduce){html{scroll-behavior:auto}.sidebar{transition:none}.focus-highlight{animation:none}}
@media print{@page{size:A4;margin:17mm 14mm}html{scroll-behavior:auto}body{font-size:10pt;line-height:1.65}.topbar,.sidebar,.back-to-top,.scrim,.anchor,.doc-meta a,.reader-intro{display:none!important}.reader{margin:0;padding:0;max-width:none}.doc{max-width:none}.doc h1{font-size:22pt}.doc h2{font-size:16pt;margin-top:25px;color:#97431d!important}.doc h3{font-size:12pt}.doc h1,.doc h2,.doc h3{break-after:avoid}.doc+.doc{break-before:page;border:0;padding:0;margin-top:0}.doc table{font-size:8pt;min-width:0}.table-scroll{overflow:visible;width:auto;break-inside:auto}.doc th,.doc td{padding:6px;min-width:0}.doc tr{break-inside:avoid}.doc thead{display:table-header-group}.doc pre{white-space:pre-wrap;break-inside:avoid}.doc pre code{white-space:pre-wrap;font-size:8pt;overflow-wrap:anywhere}.doc a{color:#654c39;text-decoration:underline}.doc p,.doc li{orphans:3;widows:3}.page-footer{font-size:8pt}}
"""


JS = r"""
const entries = __SEARCH_DATA__;
const input = document.querySelector('#search');
const results = document.querySelector('#search-results');
const nav = document.querySelector('#navigation');
const sidebar = document.querySelector('.sidebar');
const menu = document.querySelector('#menu-button');
const scrim = document.querySelector('.scrim');
const escapeHtml = text => text.replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function toggleMenu(open){ sidebar.classList.toggle('open',open);scrim.classList.toggle('open',open);menu.setAttribute('aria-expanded',String(open)); }
menu.addEventListener('click',()=>toggleMenu(!sidebar.classList.contains('open')));
scrim.addEventListener('click',()=>toggleMenu(false));
function resetSearch(){input.value='';results.classList.remove('visible');results.replaceChildren();nav.hidden=false;}
function highlight(text,query){const at=text.toLowerCase().indexOf(query.toLowerCase());return at<0?escapeHtml(text):escapeHtml(text.slice(0,at))+'<mark>'+escapeHtml(text.slice(at,at+query.length))+'</mark>'+escapeHtml(text.slice(at+query.length));}
input.addEventListener('input',()=>{
  const q=input.value.trim();if(!q){resetSearch();return;}
  nav.hidden=true;results.classList.add('visible');
  const matches=entries.map(e=>({...e,score:e.title.toLowerCase().includes(q.toLowerCase())?2:e.text.toLowerCase().includes(q.toLowerCase())?1:0})).filter(e=>e.score).sort((a,b)=>b.score-a.score);
  results.innerHTML='<p class="search-meta">'+matches.length+' 个相关章节 · 点击定位全文</p>'+matches.map(e=>{const at=Math.max(0,e.text.toLowerCase().indexOf(q.toLowerCase()));const start=Math.max(0,at-23);const snippet=(start?'…':'')+e.text.slice(start,start+95)+(e.text.length>start+95?'…':'');return '<a class="result" href="#'+e.id+'"><small>'+escapeHtml(e.group)+'</small><strong>'+highlight(e.title,q)+'</strong><p>'+highlight(snippet,q)+'</p></a>';}).join('')+(matches.length?'':'<p class="no-results">未找到相关内容。试试「积分」「模型」或「业务」。</p>')+'<button class="search-clear" type="button">清空搜索，浏览目录</button>';
  results.querySelector('.search-clear').addEventListener('click',()=>{resetSearch();input.focus();});
});
document.addEventListener('keydown',event=>{if(event.key==='/'&&!['INPUT','TEXTAREA'].includes(document.activeElement.tagName)){event.preventDefault();if(innerWidth<=760)toggleMenu(true);input.focus();}if(event.key==='Escape'){resetSearch();toggleMenu(false);input.blur();}});
sidebar.addEventListener('click',event=>{const link=event.target.closest('a[href^="#"]');if(!link)return;const id=decodeURIComponent(link.hash.slice(1));if(link.classList.contains('result'))resetSearch();toggleMenu(false);const target=document.getElementById(id);if(target){target.classList.remove('focus-highlight');requestAnimationFrame(()=>target.classList.add('focus-highlight'));}});
document.querySelector('#print-button').addEventListener('click',()=>window.print());
document.querySelector('#back-to-top').addEventListener('click',()=>window.scrollTo({top:0,behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'}));
const headings=[...document.querySelectorAll('.doc h1,.doc h2,.doc h3')];
const links=[...nav.querySelectorAll('a')];let lastId='';
function markActive(){let current=headings[0];for(const h of headings){if(h.getBoundingClientRect().top<=120)current=h;else break;}if(!current||current.id===lastId)return;lastId=current.id;links.forEach(a=>{const on=decodeURIComponent(a.hash.slice(1))===lastId;a.classList.toggle('active',on);if(on)a.setAttribute('aria-current','location');else a.removeAttribute('aria-current');});}
let pending=false;addEventListener('scroll',()=>{if(!pending){pending=true;requestAnimationFrame(()=>{markActive();pending=false;});}},{passive:true});markActive();
"""
