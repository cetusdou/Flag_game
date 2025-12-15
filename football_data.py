# import json
# import os
# import requests
# import re
# from bs4 import BeautifulSoup
# import urllib3
# import time

# urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

# # --- ⚙️ 配置 ---
# DATA_DIR = "./data"
# IMG_DIR = "./assets/football_clubs_png"
# # 🔥 存到一个新文件，或者覆盖原来的
# JSON_FILE = f"{DATA_DIR}/football_clubs_hardcore.json" 
# HEADERS = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'}

# PROXY_PORT = 7890
# PROXIES = {
#     "http": f"http://127.0.0.1:{PROXY_PORT}",
#     "https": f"http://127.0.0.1:{PROXY_PORT}"
# } if PROXY_PORT else None

# os.makedirs(DATA_DIR, exist_ok=True)
# os.makedirs(IMG_DIR, exist_ok=True)

# # 🏆 硬核赛季源 (全球覆盖)
# SEASONS_URLS = [
#     # --- 五大联赛 (Tier 1) ---
#     ("Premier League", "https://en.wikipedia.org/wiki/2024%E2%80%9325_Premier_League"),
#     ("La Liga", "https://en.wikipedia.org/wiki/2024%E2%80%9325_La_Liga"),
#     ("Bundesliga", "https://en.wikipedia.org/wiki/2024%E2%80%9325_Bundesliga"),
#     ("Serie A", "https://en.wikipedia.org/wiki/2024%E2%80%9325_Serie_A"),
#     ("Ligue 1", "https://en.wikipedia.org/wiki/2024%E2%80%9325_Ligue_1"),
    
#     # --- 次级联赛 (The Grinder) ---
#     ("EFL Championship", "https://en.wikipedia.org/wiki/2024%E2%80%9325_EFL_Championship"), # 英冠
#     ("2. Bundesliga", "https://en.wikipedia.org/wiki/2024%E2%80%9325_2._Bundesliga"),       # 德乙
#     ("Serie B", "https://en.wikipedia.org/wiki/2024%E2%80%9325_Serie_B"),                   # 意乙
#     ("Segunda División", "https://en.wikipedia.org/wiki/2024%E2%80%9325_Segunda_Divisi%C3%B3n"), # 西乙

#     # --- 欧洲劲旅 (Tier 2) ---
#     ("Eredivisie", "https://en.wikipedia.org/wiki/2024%E2%80%9325_Eredivisie"),             # 荷甲
#     ("Primeira Liga", "https://en.wikipedia.org/wiki/2024%E2%80%9325_Primeira_Liga"),       # 葡超
#     ("Süper Lig", "https://en.wikipedia.org/wiki/2024%E2%80%9325_S%C3%BCper_Lig"),          # 土超
#     ("Scottish Premiership", "https://en.wikipedia.org/wiki/2024%E2%80%9325_Scottish_Premiership"), # 苏超

#     # --- 南美 (Passion) ---
#     # 注意：南美赛季通常是自然年 (2024)
#     # ("Brasileirão", "https://en.wikipedia.org/wiki/2024_Campeonato_Brasileiro_S%C3%A9rie_A"), # 巴甲
#     # ("Argentine Primera", "https://en.wikipedia.org/wiki/2024_Argentine_Primera_Divisi%C3%B3n"), # 阿甲

#     # --- 金元/其他 ---
#     ("MLS", "https://en.wikipedia.org/wiki/2024_Major_League_Soccer_season"),               # 美职联
#     ("Saudi Pro League", "https://en.wikipedia.org/wiki/2024%E2%80%9325_Saudi_Pro_League"), # 沙特联
# ]

# def get_teams_from_season_page(league_name, url):
#     """ (通用列表解析逻辑) """
#     print(f"🔍 扫描: {league_name} ...", end="")
#     teams = []
#     try:
#         r = requests.get(url, headers=HEADERS, proxies=PROXIES, verify=False, timeout=20)
#         soup = BeautifulSoup(r.content, 'html.parser')
#         tables = soup.find_all("table", {"class": "wikitable"})
        
#         valid_tables = []
#         for tb in tables:
#             headers = [th.get_text().strip() for th in tb.find_all("th")]
#             # 兼容各种表头写法
#             has_team = any(h in headers for h in ["Team", "Club", "Equipe"])
#             has_feat = any(h in headers for h in ["Stadium", "Location", "Venue", "City", "Home city"])
#             if has_team and has_feat: valid_tables.append(tb)

#         if not valid_tables:
#             print(" ⚠️ 未找到表格")
#             return []

#         # 通常第一个符合条件的表格就是球队列表
#         target_table = valid_tables[0]
        
#         # 找球队名字在哪一列
#         headers = [th.get_text().strip() for th in target_table.find_all("th")]
#         col_idx = 0
#         for i, h in enumerate(headers):
#             if h in ["Team", "Club", "Equipe"]: col_idx = i; break
            
#         rows = target_table.find_all("tr")
#         for tr in rows[1:]:
#             cols = tr.find_all(["th", "td"])
#             if len(cols) <= col_idx: continue
            
#             link = cols[col_idx].find("a")
#             if link and "href" in link.attrs:
#                 title = link.get("title")
#                 if not title or "List of" in title or "Stadium" in title: continue
#                 teams.append({"title": title, "league": league_name})
                
#     except Exception as e:
#         print(f" ❌ {e}")
        
#     print(f" ✅ {len(teams)} 队")
#     return teams

# def get_club_details(page_title):
#     """ (暴力解析 Infobox) """
#     api_url = "https://en.wikipedia.org/w/api.php"
#     params = { "action": "parse", "page": page_title, "prop": "text", "format": "json", "redirects": 1 }
#     try:
#         r = requests.get(api_url, params=params, headers=HEADERS, proxies=PROXIES, verify=False, timeout=15)
#         data = r.json()
#         if "error" in data: return None, {}
#         soup = BeautifulSoup(data["parse"]["text"]["*"], 'html.parser')
#         infobox = soup.find("table", {"class": "infobox"})
#         if not infobox: return None, {}

#         img_url = None
#         img_tag = infobox.find("img")
#         if img_tag:
#             src = img_tag.get("src")
#             if src:
#                 if src.startswith("//"): src = "https:" + src
#                 if "/thumb/" in src: src = re.sub(r'/\d+px-', '/500px-', src)
#                 img_url = src

#         info = {}
#         for tr in infobox.find_all("tr"):
#             th = tr.find("th"); td = tr.find("td")
#             if th and td:
#                 key = th.get_text().strip().lower()
#                 val = td.get_text(", ", strip=True)
#                 val = re.sub(r'\[.*?\]', '', val)
#                 if "full name" in key: info["full_name"] = val
#                 elif "founded" in key: 
#                     yr = re.search(r'\d{4}', val)
#                     info["founded"] = yr.group(0) if yr else val
#                 elif "ground" in key or "stadium" in key: info["ground"] = val
#         return img_url, info
#     except: return None, {}

# # --- 🔥 主程序 🔥 ---
# print("🚀 [硬核模式] 启动全球球队扫描...")

# # 1. 发现球队
# all_teams_map = {}
# for league_name, url in SEASONS_URLS:
#     teams = get_teams_from_season_page(league_name, url)
#     for t in teams:
#         # 去重：如果球队已存在，跳过（或者保留第一次出现的联赛）
#         if t['title'] not in all_teams_map:
#             all_teams_map[t['title']] = t

# target_list = list(all_teams_map.values())
# print(f"\n📋 去重后总目标: {len(target_list)} 支球队")

# # 2. 读取/初始化数据库
# existing_db = []
# processed_ids = set()
# if os.path.exists(JSON_FILE):
#     with open(JSON_FILE, 'r', encoding='utf-8') as f:
#         try:
#             existing_db = json.load(f)
#             for item in existing_db: processed_ids.add(item['id'])
#             print(f"📂 读取现有数据: {len(existing_db)} 条")
#         except: pass

# # 3. 抓取
# print("🚀 开始抓取详细数据...")
# count_new = 0
# for i, item in enumerate(target_list):
#     title = item['title']
    
#     # ID 生成
#     safe_id = re.sub(r'[^a-zA-Z0-9]', '_', title).lower().strip('_')
#     if len(safe_id) > 25: safe_id = safe_id[:25]
#     if safe_id in processed_ids: continue # 跳过已存在

#     print(f"[{i+1}/{len(target_list)}] ⚽ {title[:20]}...", end="")
    
#     img_url, details = get_club_details(title)
    
#     filename = f"{safe_id}.png"
#     save_path = os.path.join(IMG_DIR, filename)
#     local_ref = f"./assets/football_clubs_png/{filename}"
    
#     entry = {
#         "id": safe_id,
#         "name": title.split(" F.C.")[0].split(" CF")[0],
#         "league": item['league'],
#         "img": local_ref,
#         **details
#     }
    
#     # 下载图片
#     has_img = False
#     if img_url and not os.path.exists(save_path):
#         try:
#             content = requests.get(img_url, headers=HEADERS, proxies=PROXIES, verify=False, timeout=10).content
#             with open(save_path, 'wb') as f: f.write(content)
#             has_img = True
#             print(" 📸", end="")
#         except: print(" ❌", end="")
#     elif os.path.exists(save_path):
#         has_img = True
#         print(" ⏩", end="")
#     else:
#         print(" ⚠️ 无图", end="")
        
#     print("") 
    
#     # 只有抓到数据才存 (防止空条目)
#     existing_db.append(entry)
#     processed_ids.add(safe_id)
#     count_new += 1
    
#     if count_new % 10 == 0:
#         with open(JSON_FILE, 'w', encoding='utf-8') as f:
#             json.dump(existing_db, f, ensure_ascii=False, indent=2)

# with open(JSON_FILE, 'w', encoding='utf-8') as f:
#     json.dump(existing_db, f, ensure_ascii=False, indent=2)

# print(f"\n🎉 硬核抓取完成！共收录 {len(existing_db)} 支球队。")
# print(f"📂 数据位置: {JSON_FILE}")
# # import json
# # import os

# # # --- ⚙️ 配置 ---
# # FILE_PATH = "./data/football_clubs_europe.json"

# # def remove_duplicates():
# #     if not os.path.exists(FILE_PATH):
# #         print(f"❌ 找不到文件: {FILE_PATH}")
# #         return

# #     print(f"📂 正在读取: {FILE_PATH} ...")
    
# #     with open(FILE_PATH, 'r', encoding='utf-8') as f:
# #         try:
# #             data = json.load(f)
# #         except json.JSONDecodeError:
# #             print("❌ JSON 格式错误，无法解析")
# #             return

# #     original_count = len(data)
# #     unique_data = []
# #     seen_names = set()
    
# #     # 统计重复来源（可选，看看哪些联赛重复了）
# #     duplicates_found = []

# #     for item in data:
# #         # 获取名字，去除首尾空格，统一转小写进行比较（防止 Arsenal 和 arsenal 被当成两个）
# #         # 但保存时保留原格式
# #         raw_name = item.get('name', '').strip()
# #         compare_name = raw_name.lower()
        
# #         if not compare_name:
# #             continue

# #         if compare_name not in seen_names:
# #             unique_data.append(item)
# #             seen_names.add(compare_name)
# #         else:
# #             # 发现重复
# #             duplicates_found.append(f"{raw_name} ({item.get('league', '未知')})")

# #     new_count = len(unique_data)
# #     removed_count = original_count - new_count

# #     # --- 保存回原文件 ---
# #     with open(FILE_PATH, 'w', encoding='utf-8') as f:
# #         json.dump(unique_data, f, ensure_ascii=False, indent=2)

# #     print("-" * 40)
# #     print(f"🎉 去重完成！")
# #     print(f"🔴 原有数量: {original_count}")
# #     print(f"🟢 现有数量: {new_count}")
# #     print(f"🗑️ 移除重复: {removed_count} 条")
    
# #     if removed_count > 0:
# #         print("\n👇 被移除的重复项示例 (前5个):")
# #         for d in duplicates_found[:5]:
# #             print(f"   - {d}")

# # if __name__ == "__main__":
# #     remove_duplicates()

import json
import os
from openai import OpenAI
import time

# --- ⚙️ 配置 ---
API_KEY = "sk-e30c53b48e4d4da1ae7055862bdade06" # 🔥 替换你的 DeepSeek Key
BASE_URL = "https://api.deepseek.com"

# 既是输入也是输出，实现“原地合并”
TARGET_FILE = "./data/football_clubs_hardcore.json"

client = OpenAI(api_key=API_KEY, base_url=BASE_URL)

def translate_batch(names_list):
    """
    批量翻译函数
    """
    prompt = f"""
    请将以下足球俱乐部名称翻译成**中国大陆通用中文译名**。
    
    输入列表：
    {json.dumps(names_list, ensure_ascii=False)}
    
    要求：
    1. 返回一个严格的 JSON 对象，Key 是英文原名，Value 是中文译名。
    2. 示例：{{"Arsenal": "阿森纳", "Inter Miami CF": "迈阿密国际"}}
    3. 只返回 JSON，不要 Markdown。
    """

    try:
        response = client.chat.completions.create(
            model="deepseek-chat",
            messages=[
                {"role": "system", "content": "You are a football translator."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.1,
            response_format={ "type": "json_object" }
        )
        content = response.choices[0].message.content
        content = content.replace("```json", "").replace("```", "").strip()
        return json.loads(content)
    except Exception as e:
        print(f"❌ API 调用失败: {e}")
        return {}

# --- 主程序 ---
if not os.path.exists(TARGET_FILE):
    print(f"❌ 找不到文件: {TARGET_FILE}")
    exit()

print(f"📂 读取数据: {TARGET_FILE} ...")
with open(TARGET_FILE, 'r', encoding='utf-8') as f:
    clubs_data = json.load(f)

# 统计
total_clubs = len(clubs_data)
# 筛选出没有 name_zh 字段的球队
needs_translation = [c for c in clubs_data]

print(f"📊 总球队数: {total_clubs}")
print(f"📝 待翻译数: {len(needs_translation)}")

if len(needs_translation) == 0:
    print("🎉 所有球队都已有中文名，无需处理！")
    exit()

# 分批处理
BATCH_SIZE = 30
current_batch_objs = [] # 存对象引用，方便直接修改
current_batch_names = [] # 存名字发给API

processed_count = 0

print("🚀 开始批量翻译并合并...")

for i, club in enumerate(needs_translation):
    current_batch_objs.append(club)
    current_batch_names.append(club['name'])
    
    # 当批次满，或者到达最后一个
    if len(current_batch_names) >= BATCH_SIZE or i == len(needs_translation) - 1:
        
        print(f"🤖 正在翻译 {len(current_batch_names)} 个球队...", end="")
        
        # 调用 API
        translations = translate_batch(current_batch_names)
        
        # 🔥 核心步骤：直接修改原对象，追加新字段
        success_count = 0
        for obj in current_batch_objs:
            eng_name = obj['name']
            if eng_name in translations:
                # 这一步就是“合并到原本的json中，成为新的字段”
                obj['name_zh'] = translations[eng_name]
                success_count += 1
            else:
                # 如果翻译失败，暂时填英文，防止下次重复请求
                obj['name_zh'] = eng_name
        
        print(f" ✅ 成功写入 {success_count} 条")
        
        # 清空缓冲区
        current_batch_objs = []
        current_batch_names = []
        processed_count += success_count
        
        # 实时保存回原文件 (覆盖写入)
        if processed_count % (BATCH_SIZE * 2) == 0:
            with open(TARGET_FILE, 'w', encoding='utf-8') as f:
                json.dump(clubs_data, f, ensure_ascii=False, indent=2)
            print("💾 进度已保存")

# 最终保存
with open(TARGET_FILE, 'w', encoding='utf-8') as f:
    json.dump(clubs_data, f, ensure_ascii=False, indent=2)

print(f"\n🎉 全部完成！中文名已合并至 {TARGET_FILE}")