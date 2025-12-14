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
# JSON_FILE = f"{DATA_DIR}/football_clubs_europe.json"
# HEADERS = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'}

# PROXY_PORT = 7890
# PROXIES = {
#     "http": f"http://127.0.0.1:{PROXY_PORT}",
#     "https": f"http://127.0.0.1:{PROXY_PORT}"
# } if PROXY_PORT else None

# os.makedirs(DATA_DIR, exist_ok=True)
# os.makedirs(IMG_DIR, exist_ok=True)

# # 🏆 赛季页面源
# SEASONS_URLS = [
#     ("Premier League", "https://en.wikipedia.org/wiki/2024%E2%80%9325_Premier_League"),
#     ("La Liga", "https://en.wikipedia.org/wiki/2024%E2%80%9325_La_Liga"),
#     ("Bundesliga", "https://en.wikipedia.org/wiki/2024%E2%80%9325_Bundesliga"),
#     ("Serie A", "https://en.wikipedia.org/wiki/2024%E2%80%9325_Serie_A"),
#     ("Ligue 1", "https://en.wikipedia.org/wiki/2024%E2%80%9325_Ligue_1"),
#     ("UEFA", "https://en.wikipedia.org/wiki/2024%E2%80%9325_UEFA_Champions_League"),
#     ("Europa", "https://en.wikipedia.org/wiki/2024%E2%80%9325_UEFA_Europa_League") # 新增欧联
# ]

# def get_teams_from_season_page(league_name, url):
#     """ (保持之前的增强版逻辑，此处省略重复代码，直接使用核心逻辑) """
#     print(f"🔍 正在扫描联赛: {league_name} ...")
#     teams = []
#     try:
#         r = requests.get(url, headers=HEADERS, proxies=PROXIES, verify=False, timeout=20)
#         soup = BeautifulSoup(r.content, 'html.parser')
#         tables = soup.find_all("table", {"class": "wikitable"})
#         valid_tables = []
#         for tb in tables:
#             headers = [th.get_text().strip() for th in tb.find_all("th")]
#             has_team_col = any(h in headers for h in ["Team", "Club", "Teams"])
#             has_feature_col = any(h in headers for h in ["Stadium", "Location", "Venue", "Association", "City", "Ground"])
#             if has_team_col and has_feature_col: valid_tables.append(tb)

#         for target_table in valid_tables:
#             headers = [th.get_text().strip() for th in target_table.find_all("th")]
#             team_col_index = -1
#             for idx, h in enumerate(headers):
#                 if h in ["Team", "Club", "Teams"]:
#                     team_col_index = idx; break
#             if team_col_index == -1: team_col_index = 0

#             for tr in target_table.find_all("tr")[1:]:
#                 cols = tr.find_all(["th", "td"])
#                 if len(cols) <= team_col_index: continue
#                 link = cols[team_col_index].find("a")
#                 if link and "href" in link.attrs:
#                     title = link.get("title")
#                     if not title or "List of" in title or "Stadium" in title: continue
#                     teams.append({"title": title, "league": league_name})
#     except Exception as e:
#         print(f"   ❌ 扫描失败: {e}")
#     print(f"   ✅ 发现 {len(teams)} 支球队")
#     return teams

# def get_club_details(page_title):
#     """ (保持之前的全能抓取逻辑) """
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
#                 elif "nickname" in key: info["nickname"] = val
#                 elif "founded" in key: 
#                     yr = re.search(r'\d{4}', val)
#                     info["founded"] = yr.group(0) if yr else val
#                 elif "ground" in key or "stadium" in key: info["ground"] = val
#                 elif "capacity" in key: info["capacity"] = val
#         return img_url, info
#     except: return None, {}

# # --- 🔥 增量更新主程序 🔥 ---

# print("🚀 第一阶段：自动发现球队名单...")
# all_teams_map = {}
# for league_name, url in SEASONS_URLS:
#     teams = get_teams_from_season_page(league_name, url)
#     for t in teams:
#         if t['title'] not in all_teams_map:
#             all_teams_map[t['title']] = t

# target_list = list(all_teams_map.values())
# print(f"\n📋 总计需处理: {len(target_list)} 支球队")

# # 1. 读取现有数据
# existing_db = []
# processed_ids = set()

# if os.path.exists(JSON_FILE):
#     with open(JSON_FILE, 'r', encoding='utf-8') as f:
#         try:
#             existing_db = json.load(f)
#             # 建立索引：哪些 ID 已经有了？
#             for item in existing_db:
#                 processed_ids.add(item['id'])
#             print(f"📂 已加载现有数据: {len(existing_db)} 条")
#         except:
#             print("⚠️ JSON文件损坏或为空，将重新开始")

# print("🚀 第二阶段：增量抓取...")

# count_new = 0
# count_skip = 0

# for item in target_list:
#     title = item['title']
    
#     # ID 生成逻辑 (必须与之前保持一致)
#     safe_id = re.sub(r'[^a-zA-Z0-9]', '_', title).lower().strip('_')
#     if len(safe_id) > 25: safe_id = safe_id[:25]
    
#     # 🔥 核心判断：如果 ID 已存在，直接跳过
#     if safe_id in processed_ids:
#         # print(f"⏩ 跳过: {safe_id}")
#         count_skip += 1
#         continue

#     # 开始抓取新数据
#     print(f"[{count_new+1} new] ⚽ 抓取: {title[:15]}... ", end="")
    
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
#     if img_url and not os.path.exists(save_path):
#         try:
#             content = requests.get(img_url, headers=HEADERS, proxies=PROXIES, verify=False, timeout=10).content
#             with open(save_path, 'wb') as f: f.write(content)
#             print("📸", end="")
#         except:
#             print("❌", end="")
#     else:
#         print("⏩", end="")
        
#     print("") # 换行
    
#     # 加入数据库
#     existing_db.append(entry)
#     processed_ids.add(safe_id) # 标记为已处理
#     count_new += 1
    
#     # 每 5 个新数据保存一次
#     if count_new % 5 == 0:
#         with open(JSON_FILE, 'w', encoding='utf-8') as f:
#             json.dump(existing_db, f, ensure_ascii=False, indent=2)

# # 最终保存
# with open(JSON_FILE, 'w', encoding='utf-8') as f:
#     json.dump(existing_db, f, ensure_ascii=False, indent=2)

# print(f"\n🎉 任务结束！")
# print(f"   ⏩ 跳过: {count_skip} (已存在)")
# print(f"   ✅ 新增: {count_new}")
# print(f"   📂 总计: {len(existing_db)} (保存至 {JSON_FILE})")

import json
import os

# --- ⚙️ 配置 ---
FILE_PATH = "./data/football_clubs_europe.json"

def remove_duplicates():
    if not os.path.exists(FILE_PATH):
        print(f"❌ 找不到文件: {FILE_PATH}")
        return

    print(f"📂 正在读取: {FILE_PATH} ...")
    
    with open(FILE_PATH, 'r', encoding='utf-8') as f:
        try:
            data = json.load(f)
        except json.JSONDecodeError:
            print("❌ JSON 格式错误，无法解析")
            return

    original_count = len(data)
    unique_data = []
    seen_names = set()
    
    # 统计重复来源（可选，看看哪些联赛重复了）
    duplicates_found = []

    for item in data:
        # 获取名字，去除首尾空格，统一转小写进行比较（防止 Arsenal 和 arsenal 被当成两个）
        # 但保存时保留原格式
        raw_name = item.get('name', '').strip()
        compare_name = raw_name.lower()
        
        if not compare_name:
            continue

        if compare_name not in seen_names:
            unique_data.append(item)
            seen_names.add(compare_name)
        else:
            # 发现重复
            duplicates_found.append(f"{raw_name} ({item.get('league', '未知')})")

    new_count = len(unique_data)
    removed_count = original_count - new_count

    # --- 保存回原文件 ---
    with open(FILE_PATH, 'w', encoding='utf-8') as f:
        json.dump(unique_data, f, ensure_ascii=False, indent=2)

    print("-" * 40)
    print(f"🎉 去重完成！")
    print(f"🔴 原有数量: {original_count}")
    print(f"🟢 现有数量: {new_count}")
    print(f"🗑️ 移除重复: {removed_count} 条")
    
    if removed_count > 0:
        print("\n👇 被移除的重复项示例 (前5个):")
        for d in duplicates_found[:5]:
            print(f"   - {d}")

if __name__ == "__main__":
    remove_duplicates()