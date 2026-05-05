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
    
    # In doc: "1.ISTJ\nISTJ型的人是..."
    for line in lines:
        match = re.match(r"^(\d+)[.、]\s*([A-Z]{4})\b", line)
        if match:
            if current_type:
                detailed_results[current_type] = "\n".join(current_content).strip()
            current_type = match.group(2)
            current_content = [line]
        elif current_type:
            current_content.append(line)
            
    if current_type:
        detailed_results[current_type] = "\n".join(current_content).strip()
        
    return detailed_results

try:
    mbti = extract_mbti(r"c:\Users\24014\Desktop\code development\psychological\MBTI职业性格测试21000字-93题.docx")
    
    with open("parsed_details.json", "r", encoding="utf-8") as f:
        data = json.load(f)
        
    data["mbti"] = mbti
    
    with open("parsed_details.json", "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    print("Extracted types:", list(mbti.keys()))
except Exception as e:
    import traceback
    traceback.print_exc()
