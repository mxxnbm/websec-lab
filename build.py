#!/usr/bin/env python3
"""Assemble the single-file course from src/ parts."""
import os, sys, glob, re

ROOT = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(ROOT, 'src')
OUT = os.path.join(ROOT, 'out', 'index.html')

def read(p):
    with open(p, 'r', encoding='utf-8') as f:
        return f.read()

parts = []
parts.append(read(os.path.join(SRC, '00_head.html')))
parts.append(read(os.path.join(SRC, '10_core.js')))

for p in sorted(glob.glob(os.path.join(SRC, 'views', '*.js'))):
    parts.append('\n/* ==== ' + os.path.basename(p) + ' ==== */\n' + read(p))

for name in ['50_quizzes.js', '55_cards.js']:
    p = os.path.join(SRC, name)
    if os.path.exists(p):
        parts.append('\n/* ==== ' + name + ' ==== */\n' + read(p))

parts.append('\n' + read(os.path.join(SRC, '90_glue.js')))

for p in sorted(glob.glob(os.path.join(SRC, 'labs', '*.js'))):
    parts.append('\n/* ==== ' + os.path.basename(p) + ' ==== */\n' + read(p))

parts.append('\n</script>\n</body>\n</html>\n')

html = ''.join(parts)

with open(OUT, 'w', encoding='utf-8') as f:
    f.write(html)

print('built:', OUT, len(html), 'bytes')

# quick sanity: no stray backslash-backslash-quote artifacts
bad = html.count("\\\\'")
if bad:
    print('WARN: found', bad, 'occurrences of double-backslash-quote')
