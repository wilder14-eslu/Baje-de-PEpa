import json
import os

os.makedirs('js', exist_ok=True)
os.makedirs('css', exist_ok=True)

with open('levels.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

with open('js/levels.js', 'w', encoding='utf-8') as f:
    f.write('// 50 Handcrafted and verified solvable levels for Longcat\n')
    f.write('const LEVELS = ')
    json.dump(data, f, indent=2)
    f.write(';\n\nif (typeof window !== "undefined") { window.LEVELS = LEVELS; }\n')

print(f'Wrote js/levels.js successfully, total levels: {len(data)}')
