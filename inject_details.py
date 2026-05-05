import json
import re
import os

with open("parsed_details.json", "r", encoding="utf-8") as f:
    data = json.load(f)

mbti_path = r"src\data\scales\mbti.ts"
temp_path = r"src\data\scales\temperament.ts"

# 1. Update MBTI
with open(mbti_path, "r", encoding="utf-8") as f:
    mbti_content = f.read()

for mbti_type, details in data["mbti"].items():
    if not mbti_type or not details: continue
    # Look for code: "ISTJ", ... }
    # We need to insert detailedDescription: `...` inside the object.
    
    # regex to find the object for this type
    pattern = r'(code:\s*"' + mbti_type + r'".*?summary:\s*".*?",)'
    
    # Escape backticks and dollars in details to safely put it in a TS template string
    safe_details = details.replace("`", "\\`").replace("$", "\\$")
    replacement = r'\1\n    detailedDescription: `\n' + safe_details + r'\n`,'
    
    mbti_content = re.sub(pattern, replacement, mbti_content, flags=re.DOTALL)

with open(mbti_path, "w", encoding="utf-8") as f:
    f.write(mbti_content)

print("Updated mbti.ts")

# 2. Update Temperament
with open(temp_path, "r", encoding="utf-8") as f:
    temp_content = f.read()

for temp_type, details in data["temp"].items():
    if not temp_type or not details: continue
    
    # We need to parse details into 4 parts:
    neural = re.search(r"神经特点[：:]\s*(.*?)(?=心理特点|典型表现|适合职业|$)", details, re.DOTALL)
    psych = re.search(r"心理特点[：:]\s*(.*?)(?=典型表现|适合职业|神经特点|$)", details, re.DOTALL)
    typical = re.search(r"典型表现[：:]\s*(.*?)(?=适合职业|神经特点|心理特点|$)", details, re.DOTALL)
    careers = re.search(r"适合职业[：:]\s*(.*?)(?=神经特点|心理特点|典型表现|$)", details, re.DOTALL)
    
    n_str = neural.group(1).strip() if neural else ""
    p_str = psych.group(1).strip() if psych else ""
    t_str = typical.group(1).strip() if typical else ""
    c_str = careers.group(1).strip() if careers else ""
    
    key_map = {
        "胆汁质": "choleric",
        "多血质": "sanguine",
        "粘液质": "phlegmatic",
        "抑郁质": "melancholic"
    }
    key = key_map.get(temp_type)
    if not key: continue

    # insert details into dimension object
    pattern = r'(key:\s*"' + key + r'",\s*name:\s*".*?",\s*description:\s*".*?",)'
    
    details_ts = f"""\\1
    details: {{
      neuralTraits: `{n_str.replace('`', '\\`').replace('$', '\\$')}`,
      psychologicalTraits: `{p_str.replace('`', '\\`').replace('$', '\\$')}`,
      typicalBehavior: `{t_str.replace('`', '\\`').replace('$', '\\$')}`,
      suitableCareers: `{c_str.replace('`', '\\`').replace('$', '\\$')}`
    }},"""
    
    temp_content = re.sub(pattern, details_ts, temp_content)

with open(temp_path, "w", encoding="utf-8") as f:
    f.write(temp_content)

print("Updated temperament.ts")
