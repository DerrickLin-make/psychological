import json
import os
import re
import shutil
import tempfile

SOURCE_PATH = r'src\data\scales\mbti.ts'
DETAILS_PATH = 'parsed_details.json'

with open(DETAILS_PATH, 'r', encoding='utf-8') as f:
    data = json.load(f)

with open(SOURCE_PATH, 'r', encoding='utf-8') as f:
    content = f.read()

# Remove all existing detailedDescription fields
content = re.sub(r'detailedDescription:\s*`.*?`,\s*', '', content, flags=re.DOTALL)

# Re-inject
missing = []
for mbti_type, details in data['mbti'].items():
    if not mbti_type or not details:
        continue

    # We want to match: code: "ISTJ", nickname: "...", summary: "..."
    # The string might look like `summary: "...", suitableFields: "..."`
    # We will inject `detailedDescription` right before `suitableFields:`

    # pattern to find the exact line/block for this mbti_type up to suitableFields:
    pattern = re.compile(r'(code:\s*"' + re.escape(mbti_type) + r'".*?)(suitableFields:)', re.DOTALL)

    safe_details = details.replace('`', '\\`').replace('$', '\\$')

    def replacement(match):
        return f'{match.group(1)}detailedDescription: `\\n{safe_details}\\n`, {match.group(2)}'

    content, count = pattern.subn(replacement, content, count=1)
    if count != 1:
        missing.append(mbti_type)

if missing:
    raise RuntimeError(f'Could not inject details for: {", ".join(missing)}')

backup_path = SOURCE_PATH + '.bak'
shutil.copy2(SOURCE_PATH, backup_path)

directory = os.path.dirname(SOURCE_PATH) or '.'
with tempfile.NamedTemporaryFile('w', encoding='utf-8', dir=directory, delete=False) as f:
    temp_path = f.name
    f.write(content)

os.replace(temp_path, SOURCE_PATH)

print(f'Done reinjecting; backup written to {backup_path}')
