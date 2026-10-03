import os
import re

directory = '/home/abdul-jabbar/Desktop/dymmy_civic_rights/client/src'
changed_files = 0

# Match typical Tailwind color classes like bg-blue-600, text-blue-500, border-blue-400/50, etc.
# Including pseudo-classes (hover:, focus:, etc) since they prefix the class.
pattern = re.compile(r'([a-z:-]*(?:bg|text|border|ring|fill|stroke|from|to|via))-blue-(\d{2,3}(?:/\d{1,3})?)')

for root, _, files in os.walk(directory):
    for file in files:
        if file.endswith('.tsx') or file.endswith('.ts'):
            filepath = os.path.join(root, file)
            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()
            
            new_content = pattern.sub(r'\1-slate-\2', content)
            
            if content != new_content:
                with open(filepath, 'w', encoding='utf-8') as f:
                    f.write(new_content)
                changed_files += 1
                print(f"Updated: {filepath}")

print(f"Total files updated: {changed_files}")
