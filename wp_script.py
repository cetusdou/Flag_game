import requests
from bs4 import BeautifulSoup
import json
import os
import re
import time
import urllib3

# 禁用 SSL 警告
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

# --- ⚙️ 配置 ---
# 🔥🔥🔥 请务必修改为你的 VPN 端口 (如 7890, 1080) 🔥🔥🔥
PROXY_PORT = 7890 
PROXIES = {
    "http": f"http://127.0.0.1:{PROXY_PORT}",
    "https": f"http://127.0.0.1:{PROXY_PORT}"
}

INPUT_FILE = "./data/countries.json"
OUTPUT_FILE = "./data/countries_wiki_extra.json"
HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
}

# --- 🛠️ 辅助函数 ---
def clean_text(text):
    if not text: return "N/A"
    # 去除引用标签 [1][a]
    text = re.sub(r'\[.*?\]', '', text)
    # 去除多余空白
    text = re.sub(r'\s+', ' ', text).strip()
    return text

def get_wiki_data(country_name, cca2):
    url = f"https://en.wikipedia.org/wiki/{country_name}"
    print(f"  🌐 正在抓取: {country_name} ({url})...")
    
    try:
        response = requests.get(url, headers=HEADERS, proxies=PROXIES, verify=False, timeout=15)
        if response.status_code != 200:
            print(f"  ❌ 无法访问页面 (Code: {response.status_code})")
            return None
            
        soup = BeautifulSoup(response.content, 'html.parser')
        infobox = soup.find('table', {'class': 'infobox'})
        
        if not infobox:
            print("  ⚠️ 未找到 Infobox")
            return None

        # 待提取的字段字典
        data = {
            "id": cca2, # 关联键
            "capital": "N/A",
            "largest_city": "N/A",
            "official_languages": "N/A",
            "official_script": "N/A",
            "demonym": "N/A",
            "area_total": "N/A",
            "population_estimate": "N/A",
            "population_density": "N/A",
            "gdp_ppp_total": "N/A",
            "gdp_ppp_per_capita": "N/A",
            "gdp_nominal_total": "N/A",
            "gdp_nominal_per_capita": "N/A",
            "gini": "N/A",
            "currency": "N/A"
        }

        # 遍历表格行
        rows = infobox.find_all('tr')
        current_header = "" # 用于记录当前的二级标题（如 Area, Population）

        for tr in rows:
            th = tr.find('th')
            td = tr.find('td')
            
            # 1. 提取纯文本用于判断
            header_text = clean_text(th.get_text()) if th else ""
            value_text = clean_text(td.get_text()) if td else ""
            
            # 2. 处理分节标题 (如 --- Area ---)
            if th and not td: 
                # 这种通常是分类标题
                current_header = header_text.lower()
                continue

            if not th or not td: continue

            # 3. 匹配字段 (使用关键词模糊匹配)
            # --- Capital ---
            if "capital" in header_text.lower():
                data["capital"] = value_text
            
            # --- Largest City ---
            elif "largest city" in header_text.lower():
                data["largest_city"] = value_text
            
            # --- Language ---
            elif "official language" in header_text.lower():
                data["official_languages"] = value_text
            
            # --- Script ---
            elif "official script" in header_text.lower():
                data["official_script"] = value_text

            # --- Demonym ---
            elif "demonym" in header_text.lower():
                data["demonym"] = value_text

            # --- Area ---
            elif "area" in current_header or "area" in header_text.lower():
                if "total" in header_text.lower() or data["area_total"] == "N/A":
                    data["area_total"] = value_text

            # --- Population ---
            elif "population" in current_header or "population" in header_text.lower():
                if "estimate" in header_text.lower() or "census" in header_text.lower():
                    data["population_estimate"] = value_text
                elif "density" in header_text.lower():
                    data["population_density"] = value_text

            # --- GDP (PPP) ---
            elif "gdp" in header_text.lower() and "ppp" in header_text.lower():
                current_header = "gdp_ppp" # 标记进入 GDP PPP 区域
            elif current_header == "gdp_ppp":
                if "total" in header_text.lower(): data["gdp_ppp_total"] = value_text
                elif "per capita" in header_text.lower(): data["gdp_ppp_per_capita"] = value_text

            # --- GDP (Nominal) ---
            elif "gdp" in header_text.lower() and "nominal" in header_text.lower():
                current_header = "gdp_nominal"
            elif current_header == "gdp_nominal":
                if "total" in header_text.lower(): data["gdp_nominal_total"] = value_text
                elif "per capita" in header_text.lower(): data["gdp_nominal_per_capita"] = value_text

            # --- Gini ---
            elif "gini" in header_text.lower():
                data["gini"] = value_text

            # --- Currency ---
            elif "currency" in header_text.lower():
                data["currency"] = value_text

        print(f"  ✅ 解析成功! (GDP: {data['gdp_nominal_total']})")
        return data

    except Exception as e:
        print(f"  ❌ 发生错误: {e}")
        return None

# --- 主程序 ---
if __name__ == "__main__":
    if not os.path.exists(INPUT_FILE):
        print("❌ 请先运行之前的脚本生成 countries.json")
        exit()

    with open(INPUT_FILE, 'r', encoding='utf-8') as f:
        countries = json.load(f)

    # 如果有旧的扩展数据，读取它以免重复爬取 (断点续传)
    wiki_db = {}
    if os.path.exists(OUTPUT_FILE):
        with open(OUTPUT_FILE, 'r', encoding='utf-8') as f:
            try:
                # 转换成字典方便索引: {'cn': {...}, 'us': {...}}
                existing_list = json.load(f)
                if isinstance(existing_list, dict): wiki_db = existing_list # 兼容旧格式
                else: wiki_db = {item['id']: item for item in existing_list}
            except: pass

    print(f"🚀 开始爬取 {len(countries)} 个国家的 Wiki 扩展信息...")
    
    count = 0
    for c in countries:
        cid = c['id']
        name_en = c.get('name_en', c.get('id').upper()) # 优先用英文名，没有则用代码
        
        # 特殊处理：ECharts映射表里的名字可能和Wiki不一致，优先用 name_en (我们在scraper_pro_v2里已经清洗过了)
        # 如果爬取失败，可以尝试用 c['fullName']
        
        if cid in wiki_db and wiki_db[cid].get('capital') != "N/A":
            # print(f"⏩ 跳过 {name_en} (已存在)")
            continue

        wiki_data = get_wiki_data(name_en, cid)
        
        if wiki_data:
            wiki_db[cid] = wiki_data
            count += 1
            
            # 每爬5个保存一次，防止程序崩溃白跑
            if count % 5 == 0:
                with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
                    json.dump(wiki_db, f, ensure_ascii=False, indent=2)
                print("💾 临时保存成功")
            
            # 礼貌延时，防封IP
            # time.sleep(1) 

    # 最终保存 (保存为字典格式，方便前端通过 ID 查找)
    with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
        json.dump(wiki_db, f, ensure_ascii=False, indent=2)

    print("\n🎉 全部完成！")
    print(f"📂 扩展数据已保存至: {OUTPUT_FILE}")
    print("💡 这是一个独立的 JSON 文件，你可以通过 fetch('./data/countries_wiki_extra.json') 来加载它。")