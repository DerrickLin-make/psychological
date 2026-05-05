import json

with open('parsed_details.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

with open(r'src\data\scales\mbti.ts', 'r', encoding='utf-8') as f:
    lines = f.readlines()

out = []
for line in lines:
    replaced = False
    for mbti_type, details in data['mbti'].items():
        if f'code: "{mbti_type}"' in line:
            safe_details = details.replace('`', '\\`').replace('$', '\\$')
            parts = line.split('suitableFields:')
            if len(parts) == 2:
                new_line = parts[0] + f'detailedDescription: `\\n{safe_details}\\n`, suitableFields:' + parts[1]
                out.append(new_line)
                replaced = True
                break
    if not replaced:
        out.append(line)

with open(r'src\data\scales\mbti.ts', 'w', encoding='utf-8') as f:
    f.writelines(out)
print('Done!')
