import zipfile
import xml.etree.ElementTree as ET
import json
import re

def extract_text(path):
    docx = zipfile.ZipFile(path, 'r')
    content = docx.read('word/document.xml')
    root = ET.fromstring(content)
    ns = {'w': 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'}
    return [''.join([t.text for run in para.findall('.//w:r', ns) for t in run.findall('w:t', ns) if t.text]) for para in root.findall('.//w:p', ns)]

def extract_mbti(path):
    lines = [line.strip() for line in extract_text(path) if line.strip()]
    
    detailed_results = {}
    current_type = None
    current_content = []
    
    for line in lines:
        if re.match(r"^\d+、.*?([A-Z]{4})", line):
            match = re.search(r"([A-Z]{4})\b", line)
            if match:
                if current_type:
                    detailed_results[current_type] = "\n".join(current_content).strip()
                current_type = match.group(1)
                current_content = [line]
        elif current_type:
            current_content.append(line)
    if current_type:
        detailed_results[current_type] = "\n".join(current_content).strip()
        
    return detailed_results

def extract_temp(path):
    lines = [line.strip() for line in extract_text(path) if line.strip()]
    
    results = {}
    current_type = None
    current_content = []
    
    types = ["胆汁质", "多血质", "粘液质", "抑郁质"]
    
    for line in lines:
        if any(line.startswith(t) for t in types) and "：" not in line and len(line) < 15:
            if current_type:
                results[current_type] = "\n".join(current_content).strip()
            current_type = next(t for t in types if line.startswith(t))
            current_content = [line]
        elif current_type:
            if "五、相关职业选择参考" in line or "（四）气质的职业选择指导" in line:
                break
            current_content.append(line)
    if current_type:
        results[current_type] = "\n".join(current_content).strip()
        
    return results

try:
    mbti = extract_mbti(r"c:\Users\24014\Desktop\code development\psychological\MBTI职业性格测试21000字-93题.docx")
    temp = extract_temp(r"c:\Users\24014\Desktop\code development\psychological\气质测试5000字-60题.docx")
    
    with open("parsed_details.json", "w", encoding="utf-8") as f:
        json.dump({"mbti": mbti, "temp": temp}, f, ensure_ascii=False, indent=2)
    print("Success")
except Exception as e:
    import traceback
    traceback.print_exc()
