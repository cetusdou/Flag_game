import requests
from bs4 import BeautifulSoup
import json
import os
from openai import OpenAI
import urllib3

# 禁用 SSL 警告
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

# --- ⚙️ 配置中心 ---
# 🔥 1. 填入你的 DeepSeek API Key
API_KEY = "sk-e30c53b48e4d4da1ae7055862bdade06" 
# DeepSeek 官方 Base URL
BASE_URL = "https://api.deepseek.com"

# 🔥 2. 你的本地代理端口
PROXY_PORT = 7890 
PROXIES = {
    "http": f"http://127.0.0.1:{PROXY_PORT}",
    "https": f"http://127.0.0.1:{PROXY_PORT}"
}

# 🔥 3. 测试目标 (使用 ISO 二位码)
# 我们先测这 10 个大国，看效果如何

INPUT_FILE = "./data/countries_wiki_extra.json"
OUTPUT_FILE = "./data/wiki_llm_test.json"
client = OpenAI(api_key=API_KEY, base_url=BASE_URL)

def clean_entry_with_llm(country_id, raw_data):
    """
    将脏字典转为干净字典
    """
    # 构造 Prompt，明确清洗规则
    system_prompt = """
    你是一个数据清洗专家。我给你一段包含噪音的 JSON 数据。
    请按以下严格规则清洗，并返回标准的 JSON：

    1. **capital**: 只保留城市名，去除坐标（如 34°S...）、中文翻译或其他描述。
    2. **area_total**: 只保留数字和公制单位（km²），去除英制单位（sq mi）和排名（Xth）。例如 "2,780,085 km²"。
    3. **population_estimate**: 只保留纯数字（可带逗号），去除排名（Xth）和年份。
    4. **population_density**: 只保留 "/km²" 部分，去除 "/sq mi"。
    5. **gdp_xxx**: 只保留金额（如 "$1.493 trillion"），去除排名和年份。
    6. **gini**: 只保留数字，去除 "medium/high inequality" 等文字。
    7. **official_languages**: 如果太长，只保留前 3 个主要语言。
    8. **currency**: 只保留货币名称和代码，如 "Argentine peso (ARS)"。
    9. **landmarks**: 这是一个列表，保持原样或清洗掉无关词汇。
    
    必须包含以下所有字段（如果原数据缺失，填 "N/A"）：
    id, capital, largest_city, official_languages, official_script, demonym, 
    area_total, population_estimate, population_density, 
    gdp_ppp_total, gdp_ppp_per_capita, gdp_nominal_total, gdp_nominal_per_capita, 
    gini, currency, landmarks
    """

    user_content = json.dumps(raw_data, ensure_ascii=False)

    try:
        response = client.chat.completions.create(
            model="deepseek-chat",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_content}
            ],
            temperature=0.1, # 低温，保证严谨
            response_format={ "type": "json_object" }
        )
        return response.choices[0].message.content
    except Exception as e:
        print(f"❌ LLM 调用失败 ({country_id}): {e}")
        return None

# --- 主程序 ---
if __name__ == "__main__":
    if not os.path.exists(INPUT_FILE):
        print("❌ 找不到输入文件，请确认文件名")
        exit()

    with open(INPUT_FILE, 'r', encoding='utf-8') as f:
        raw_db = json.load(f) # 这是一个字典 {'cn': {...}, 'ar': {...}}

    # 读取已有的清洗结果（断点续传）
    if os.path.exists(OUTPUT_FILE):
        with open(OUTPUT_FILE, 'r', encoding='utf-8') as f:
            clean_db = json.load(f)
    else:
        clean_db = {}

    print(f"🚀 开始清洗 {len(raw_db)} 条数据...")
    
    count = 0
    total = len(raw_db)
    
    for cid, data in raw_db.items():
        # 如果已经清洗过且数据完整，跳过
        if cid in clean_db and clean_db[cid].get('capital', 'N/A') != 'N/A':
            continue
            
        print(f"[{count+1}/{total}] 🧹 清洗: {cid} ...", end="")
        
        # 为了节省 token，我们只把关键字段发给 LLM，不要发整段 HTML
        # 这里假设 raw_db 已经是 key-value 形式（哪怕 value 很脏）
        # 如果 raw_db 是 raw text，请直接发 raw text
        
        # 补全 ID，确保 LLM 知道它是谁
        data['id'] = cid 
        
        clean_json_str = clean_entry_with_llm(cid, data)
        
        if clean_json_str:
            try:
                clean_data = json.loads(clean_json_str)
                clean_db[cid] = clean_data
                print(" ✅")
            except:
                print(" ❌ JSON 解析失败")
        
        count += 1
        
        # 每 5 条保存一次
        if count % 5 == 0:
            with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
                json.dump(clean_db, f, ensure_ascii=False, indent=2)

    # 最终保存
    with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
        json.dump(clean_db, f, ensure_ascii=False, indent=2)

    print(f"\n🎉 所有数据清洗完毕！已保存至 {OUTPUT_FILE}")