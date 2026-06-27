import os
import re

src_dir = r'd:\Clone\El-Arbol\Frutos-Django-Next\frontend\src'

patterns = [
    (r"process\.env\.NEXT_PUBLIC_API_URL\s*\|\|\s*['\"]http://127\.0\.0\.1:8000/api['\"]",
     r"process.env.NEXT_PUBLIC_API_URL"),

    (r"\(\s*process\.env\.NEXT_PUBLIC_API_URL\s*\|\|\s*['\"]http://127\.0\.0\.1:8000/api['\"]\s*\)",
     r"process.env.NEXT_PUBLIC_API_URL"),

    (r"process\.env\.NEXT_PUBLIC_API_URL\s*\|\|\s*\(\s*process\.env\.NODE_ENV\s*===\s*['\"]development['\"]\s*\?\s*['\"]http://127\.0\.0\.1:8000/api['\"]\s*:\s*['\"]https://elarbol\.icommerce\.com\.bd/api['\"]\s*\)",
     r"process.env.NEXT_PUBLIC_API_URL"),

    (r"process\.env\.API_URL\s*\|\|\s*process\.env\.NEXT_PUBLIC_API_URL\s*\|\|\s*['\"]http://127\.0\.0\.1:8000/api['\"]",
     r"process.env.NEXT_PUBLIC_API_URL"),
     
    (r"process\.env\.NEXT_PUBLIC_WS_URL\s*\|\|\s*['\"]localhost:8000['\"]",
     r"process.env.NEXT_PUBLIC_WS_URL"),

    (r"process\.env\.NEXT_PUBLIC_WS_URL\s*\|\|\s*window\.location\.host",
     r"process.env.NEXT_PUBLIC_WS_URL"),

    (r"process\.env\.NEXT_PUBLIC_API_URL\s*\?\s*(process\.env\.NEXT_PUBLIC_API_URL\.replace\([^)]+\))\s*:\s*['\"]http://127\.0\.0\.1:8000['\"]",
     r"\1"),
     
    (r"process\.env\.NEXT_PUBLIC_API_URL\s*\?\s*(new URL\(process\.env\.NEXT_PUBLIC_API_URL\)\.host)\s*:\s*['\"]127\.0\.0\.1:8000['\"]",
     r"\1"),
]

changed_files = []

for root, dirs, files in os.walk(src_dir):
    for file in files:
        if file.endswith('.js') or file.endswith('.jsx'):
            filepath = os.path.join(root, file)
            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()
            
            orig_content = content
            for pat, repl in patterns:
                content = re.sub(pat, repl, content)
            
            if content != orig_content:
                with open(filepath, 'w', encoding='utf-8') as f:
                    f.write(content)
                changed_files.append(filepath)

print('Modified files:')
for f in changed_files:
    print(f)
