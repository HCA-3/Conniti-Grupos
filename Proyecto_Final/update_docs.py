import os
import glob

docs_dir = r'C:\Users\dsant\Desktop\Coniiti\Proyecto_Final\frontend\Docs'
replacements = {
    "role='staff'": "role='ADMIN'",
    "role='superuser'": "role='SUPER_ADMIN'",
    "'staff'": "'ADMIN', 'CONTENT_MANAGER', 'VIEWER'",
    "'superuser'": "'SUPER_ADMIN'",
    "'normal'": "'USER', 'ESTUDIANTE', 'EXTERNO'",
    "admin@coniiti.edu.co": "admin@coniiti.com",
    "Comunidad Interna": "Estudiante / Docente",
    "role: 'staff' | 'normal' | null": "role: 'SUPER_ADMIN' | 'ADMIN' | 'CONTENT_MANAGER' | 'VIEWER' | 'ESTUDIANTE' | 'DOCENTE' | 'EXTERNO' | 'USER' | null"
}

for md_file in glob.glob(os.path.join(docs_dir, '*.md')):
    with open(md_file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    original = content
    for old, new in replacements.items():
        content = content.replace(old, new)
    
    if original != content:
        with open(md_file, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f'Updated {md_file}')
