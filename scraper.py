import requests
import json
import os

# --- 配置 ---
DATA_DIR = "./data"
FLAG_DIR = "./assets/flags"
SHAPE_DIR = "./assets/shapes"
HEADERS = {'User-Agent': 'Mozilla/5.0'}

for d in [DATA_DIR, FLAG_DIR, SHAPE_DIR]:
    os.makedirs(d, exist_ok=True)

print("🚀 开始爬取全量数据 (并区分主权国家)...")

try:
    URL = "https://cdn.jsdelivr.net/gh/mledoze/countries@master/countries.json"
    response = requests.get(URL, headers=HEADERS, timeout=20)
    raw_data = response.json()
    print(f"✅ 获取源数据成功: {len(raw_data)} 条目")
except Exception as e:
    print(f"❌ 网络错误: {e}")
    exit()

final_db = []
count = 0

# ECharts 名称修正
name_fix_map = {
    "United States": "United States of America", "Russia": "Russian Federation", "Brunei": "Brunei Darussalam",
    "Vietnam": "Viet Nam", "Syria": "Syrian Arab Republic", "Laos": "Lao People's Democratic Republic",
    "Iran": "Iran (Islamic Republic of)", "South Korea": "Korea, Republic of", "North Korea": "Korea (Democratic People's Republic of)",
    "Moldova": "Moldova (Republic of)", "Tanzania": "Tanzania, United Republic of", "Bolivia": "Bolivia (Plurinational State of)",
    "Venezuela": "Venezuela (Bolivarian Republic of)", "Taiwan": "Taiwan, Province of China"
}
reverse_name_fix = {v: k for k, v in name_fix_map.items()}

# 特殊保留列表（虽然不是主权国家，但通常被视为主要地区）
# tw: 台湾, hk: 香港, mo: 澳门, ps: 巴勒斯坦, xk: 科索沃
special_regions = ['tw', 'hk', 'mo', 'ps', 'xk']

print("⚙️ 开始清洗与下载...")

for item in raw_data:
    try:
        cca2 = item.get('cca2', '').lower()
        if not cca2: continue

        # --- 🔥 核心修改：判定是否为主权国家/主要地区 ---
        # independent: 独立主权
        # unMember: 联合国成员
        is_independent = item.get('independent', False)
        is_special = cca2 in special_regions
        
        # 标记：如果是独立国家 或 特殊保留地区，则 sovereign = True
        is_sovereign = is_independent or is_special

        # 1. 基础信息
        translations = item.get('translations', {})
        cn_name = translations.get('zho', {}).get('common', item['name']['common'])
        full_name = translations.get('zho', {}).get('official', item['name']['official'])
        
        capital = item.get('capital', [])
        capital_str = capital[0] if capital else "无"

        # 英文名
        name_en = item['name']['common']
        if name_en in reverse_name_fix: name_en = reverse_name_fix[name_en]
        if cca2 == 'cn': name_en = "China"

        # 详情
        region = item.get('region', '未知')
        subregion = item.get('subregion', '')
        pop = item.get('population', 0)
        area = item.get('area', 0)
        
        langs = list(item.get('languages', {}).values())
        langs_str = "、".join(langs[:3]) if langs else "通用"
        currencies = [v.get('name', k) for k, v in item.get('currencies', {}).items()]
        curr_str = "、".join(currencies) if currencies else "通用"

        # --- 下载资源 ---
        flag_path = f"{FLAG_DIR}/{cca2}.png"
        if not os.path.exists(flag_path):
            try:
                r = requests.get(f"https://flagcdn.com/w320/{cca2}.png", headers=HEADERS, timeout=5)
                if r.status_code == 200: 
                    with open(flag_path, 'wb') as f: 
                        f.write(r.content)
            except: pass

        shape_path = f"{SHAPE_DIR}/{cca2}.svg"
        has_shape = os.path.exists(shape_path)
        if not has_shape:
            try:
                url = f"https://cdn.jsdelivr.net/gh/djaiss/mapsicon@master/all/{cca2}/vector.svg"
                r = requests.get(url, headers=HEADERS, timeout=5)
                if r.status_code == 200:
                    with open(shape_path, 'wb') as f: f.write(r.content)
                    has_shape = True
            except: pass

        # --- 构建数据 ---
        entry = {
            "id": cca2,
            "name": cn_name,
            "name_en": name_en,
            "fullName": full_name,
            "capital": capital_str,
            "region": region,
            "subregion": subregion,
            "population": pop,
            "area": area,
            "languages": langs_str,
            "currency": curr_str,
            "hasShape": has_shape,
            "sovereign": is_sovereign # 🔥 这个字段决定了它是否出现在简化模式里
        }
        final_db.append(entry)
        
        count += 1
        if count % 50 == 0: print(f"  已处理 {count} ...")

    except Exception as e:
        print(f"❌ 出错 ({item.get('cca2')}): {e}")

# 保存
with open(f"{DATA_DIR}/countries.json", "w", encoding='utf-8') as f:
    json.dump(final_db, f, ensure_ascii=False, indent=2)

print("\n🎉 更新完成！")
sovereign_count = len([x for x in final_db if x['sovereign']])
print(f"🌍 总收录: {len(final_db)} 个")
print(f"👑 主权/主要: {sovereign_count} 个 (用于形状/首都挑战)")