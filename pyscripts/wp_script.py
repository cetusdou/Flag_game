import requests
from bs4 import BeautifulSoup
import json
import os
import re
import urllib3
import time

# 禁用 SSL 警告
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

# --- ⚙️ 配置 ---
# 🔥 请确保端口正确 🔥
PROXY_PORT = 7890 
PROXIES = {
    "http": f"http://127.0.0.1:{PROXY_PORT}",
    "https": f"http://127.0.0.1:{PROXY_PORT}"
}

INPUT_FILE = "./data/countries.json"
OUTPUT_FILE = "./data/countries_wiki_extra.json"
HEADERS = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'}

def clean_text(text):
    if not text: return ""
    text = re.sub(r'\[.*?\]', '', text)
    text = re.sub(r'\s+', ' ', text).strip()
    return text

def get_wiki_data(country_name, cca2):
    url = f"https://en.wikipedia.org/wiki/{country_name}"
    print(f"  🌐 补全中: {country_name} ...", end="")
    
    try:
        response = requests.get(url, headers=HEADERS, proxies=PROXIES, verify=False, timeout=15)
        soup = BeautifulSoup(response.content, 'html.parser')
        infobox = soup.find('table', {'class': 'infobox'})
        
        if not infobox:
            print(" [⚠️ 无 Infobox]")
            return None

        # 待提取的字段
        data = {
            "id": cca2,
            "capital": "N/A",
            "gdp_ppp_total": "N/A",
            "gdp_ppp_per_capita": "N/A",
            "gdp_nominal_total": "N/A",
            "gdp_nominal_per_capita": "N/A",
            "population": "N/A",
            "area": "N/A",
            "gini": "N/A",
            "currency": "N/A"
        }

        rows = infobox.find_all('tr')
        current_context = "" 

        for tr in rows:
            text_all = tr.get_text(" ", strip=True).lower()
            
            # 上下文切换
            if "gdp" in text_all and "ppp" in text_all: current_context = "gdp_ppp"
            elif "gdp" in text_all and "nominal" in text_all: current_context = "gdp_nominal"
            elif "population" in text_all and ("census" in text_all or "estimate" in text_all): current_context = "population"
            elif "area" in text_all: current_context = "area"
            
            th = tr.find('th')
            td = tr.find('td')
            key = clean_text(th.get_text()) if th else ""
            val = clean_text(td.get_text()) if td else ""
            full_row_text = (key + " " + val).lower()

            # --- 匹配逻辑 ---
            if "currency" in key.lower() and val: data["currency"] = val
            if "gini" in key.lower() and val: data["gini"] = val
            if "capital" in key.lower() and val: data["capital"] = val

            if current_context == "gdp_ppp":
                if "total" in full_row_text and data["gdp_ppp_total"] == "N/A": data["gdp_ppp_total"] = val
                elif "per capita" in full_row_text: data["gdp_ppp_per_capita"] = val
            
            elif current_context == "gdp_nominal":
                if "total" in full_row_text and data["gdp_nominal_total"] == "N/A": data["gdp_nominal_total"] = val
                elif "per capita" in full_row_text: data["gdp_nominal_per_capita"] = val

            elif current_context == "population":
                if val and (any(x in key.lower() for x in ['estimate', 'census']) or "total" in key.lower()):
                    data["population"] = val

            elif current_context == "area":
                if "total" in key.lower() and val: data["area"] = val

        # 简单清洗
        for k, v in data.items():
            if k != "id" and v != "N/A" and "(" in v:
                data[k] = v.split("(")[0].strip()

        print(f" [✅ 抓取到: GDP={data['gdp_nominal_total']} | 币={data['currency']}]")
        return data

    except Exception as e:
        print(f" [❌ Error: {e}]")
        return None

# --- 主程序 ---
if __name__ == "__main__":
    if not os.path.exists(INPUT_FILE):
        print("❌ 找不到 data/countries.json")
        exit()

    with open(INPUT_FILE, 'r', encoding='utf-8') as f:
        countries = json.load(f)

    # 1. 读取现有的扩展数据
    wiki_db = {}
    if os.path.exists(OUTPUT_FILE):
        with open(OUTPUT_FILE, 'r', encoding='utf-8') as f:
            try:
                raw = json.load(f)
                if isinstance(raw, dict): wiki_db = raw
            except: pass
            
    print(f"📂 读取到 {len(wiki_db)} 条现有数据，开始检查缺失项...")

    count_updated = 0
    
    for c in countries:
        cid = c['id']
        name_en = c.get('name_en', c.get('id').upper())
        
        # 获取旧条目（如果不存在则为空字典）
        old_entry = wiki_db.get(cid, {})
        
        # 🔥 核心检查逻辑：
        # 如果旧数据里 关键字段 已经是有效的，就直接跳过，绝对不覆盖！
        has_gdp = old_entry.get('gdp_nominal_total', 'N/A') != 'N/A'
        has_currency = old_entry.get('currency', 'N/A') != 'N/A'
        
        if has_gdp and has_currency:
            # print(f"⏩ {name_en} 数据完整，跳过") 
            continue

        # 只要缺一样，就去爬
        new_entry = get_wiki_data(name_en, cid)
        
        if new_entry:
            # 🔥 智能合并：只填补 N/A 的空缺
            # 只有当 old 是 N/A 而 new 有值时，才更新
            merged_entry = old_entry.copy()
            if not merged_entry: merged_entry = {"id": cid} # 初始化

            for k, v in new_entry.items():
                old_val = merged_entry.get(k, 'N/A')
                if old_val == 'N/A' and v != 'N/A':
                    merged_entry[k] = v
            
            # 保存回大字典
            wiki_db[cid] = merged_entry
            count_updated += 1
            
            # 实时保存（防崩）
            if count_updated % 5 == 0:
                with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
                    json.dump(wiki_db, f, ensure_ascii=False, indent=2)

    # 最终保存
    with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
        json.dump(wiki_db, f, ensure_ascii=False, indent=2)

    print(f"\n🎉 补全完成！共更新了 {count_updated} 个国家的数据。")