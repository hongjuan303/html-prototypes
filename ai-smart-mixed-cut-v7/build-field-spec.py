#!/usr/bin/env python3
"""Build the compact field guide from the same notes used by review.html."""
from pathlib import Path
import argparse
import json

root = Path(__file__).resolve().parent
parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('--mirror', type=Path)
args = parser.parse_args()
source = (root / 'review-notes.js').read_text()
notes = json.loads(source[source.index('= ') + 2:source.rindex(';')])


def text(value):
    return '；'.join(map(text, value)) if isinstance(value, list) else str(value)


def group(item, section, context):
    if section.get('category'):
        return section['category']
    if item['kind'] == 'action' or any(word in item['name'] for word in ['勾选', '全选']):
        return '操作项'
    if item['kind'] == 'field':
        return '筛选项' if any(word in section['title'] for word in ['筛选', '查询', '搜索']) or context == 'source-picker' and section['title'] == '数据源' else '配置项'
    return '列表项' if any(word in section['title'] for word in ['列表', '任务进度']) else '说明'


def processing(steps):
    result = []
    for index, step in enumerate(steps or [], 1):
        result.append(f"**{index}. {step['name']}**")
        for key, label in [('role', '执行'), ('input', '输入'), ('process', '处理'), ('output', '输出'), ('acceptance', '验收')]:
            if step.get(key):
                result.append(f"- **{label}：** {text(step[key])}")
    return result


body = ['# 智能混剪 V7 字段交互与测试说明', '2026-10-29', '按页面、原型序号及筛选项、列表项、操作项查阅。']
for context, note in notes.items():
    body += ['## ' + note['title'], '### 页面说明', '**页面路径：** ' + note['path'], '**功能作用：** ' + note['purpose']]
    for path in dict.fromkeys(note.get('pathByOwner', {}).values()):
        if path != note['path']:
            body.append('**其他入口：** ' + path)
    body += ['### 原型说明', '**背景：** ' + note.get('background',''), '**需求：** ' + note['purpose']]
    previous_category = None
    for section in note['sections']:
        if section['category'] != previous_category:
            body.append('#### ' + section['category'])
            previous_category = section['category']
        body.append(f"##### {section['number']} {section['title']}")
        if section.get('source'):
            body.append('**数据源：** ' + section['source'])
        ordinal = 0
        for category in ['筛选项', '配置项', '列表项', '操作项', '说明']:
            items = [item for item in section.get('items', []) if group(item, section, context) == category]
            if not items:
                continue
            # Category heading is shared across related numbered regions.
            for item in items:
                ordinal += 1
                main = [text(item[key]) for key in ['definition'] if item.get(key)]
                if item.get('default') is not None and item.get('default') != '' and ('默认' + text(item['default'])) not in item.get('definition', '').replace('：', '').replace(':', '').replace(' ', ''):
                    main.append('默认：' + text(item['default']))
                main += [text(item[key]) for key in ['behavior', 'copy'] if item.get(key)]
                body.append((f"- **{item['name']}：** " + ' '.join(main)).rstrip())
                for state in item.get('states', []):
                    label = f"**{state['name']}：** " if state.get('name') else ''
                    body.append(f"  - {label}{text(state['definition'])}")
                if item.get('values'):
                    body.append('  枚举：' + '；'.join(f"**{value['label']}**（{text(value.get('meaning', ''))}）" for value in item['values']) + '。')
                for key, label in [('source', '数据源'), ('validation', '校验')]:
                    if item.get(key):
                        body.append(f"  **{label}：** {text(item[key])}")
                body += processing(item.get('processing'))
        if section.get('checks'):
            body += ['**测试关注：**'] + ['- ' + text(check) for check in section['checks']]
    if note.get('systemLogic'):
        body += ['### 系统处理逻辑'] + processing(note['systemLogic'])
result = '\n\n'.join(body) + '\n'
(root / 'FIELD-SPEC.md').write_text(result)
if args.mirror:
    args.mirror.write_text(result)
print(json.dumps({'contexts': len(notes), 'characters': len(result)}, ensure_ascii=False))
