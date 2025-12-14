import json
import os
import re
import time
import wikipediaapi

# --- ⚙️ 配置 ---
INPUT_FILE = "./data/f1_tracks.json"
OUTPUT_FILE = "./data/f1_tracks_real_data.json"

# 初始化 Wikipedia API (必须设置 User-Agent，否则会被封)
wiki_wiki = wikipediaapi.Wikipedia(
    user_agent='F1TrackGame/1.0 (contact: your_email@example.com)',
    language='en',
    extract_format=wikipediaapi.ExtractFormat.WIKI
)

# 赛道名称映射修正 (帮助 Wiki 搜得更准)
# ID -> Wiki 页面标题
NAME_MAPPING = {
    "interlagos": "Interlagos Circuit",
    "mexico-city": "Autódromo Hermanos Rodríguez",
    "red-bull-ring": "Red Bull Ring",
    "shanghai": "Shanghai International Circuit",
    "suzuka": "Suzuka Circuit",
    "zandvoort": "Circuit Zandvoort",
    "monaco": "Circuit de Monaco",
    "silverstone": "Silverstone Circuit",
    "spa": "Circuit de Spa-Francorchamps",
    "nurburgring": "Nürburgring",
    "hockenheimring": "Hockenheimring",
    "imola": "Imola Circuit",
    "baku": "Baku City Circuit",
    "miami": "Miami International Autodrome",
    "las-vegas": "Las Vegas Strip Circuit",
    "jeddah": "Jeddah Corniche Circuit",
    "bahrain": "Bahrain International Circuit",
    "yas-marina": "Yas Marina Circuit",
    "albert-park": "Albert Park Circuit",
    "gilles-villeneuve": "Circuit Gilles Villeneuve",
    "hungaroring": "Hungaroring",
    "sepang": "Sepang International Circuit",
    "istanbul": "Istanbul Park",
    "fuji": "Fuji Speedway",
    "adelaide": "Adelaide Street Circuit",
    "kyalami": "Kyalami",
    "estoril": "Circuito do Estoril",
    "jerez": "Circuito de Jerez",
    "magny-cours": "Circuit de Nevers Magny-Cours",
    "paul-ricard": "Circuit Paul Ricard",
    "dijon": "Dijon-Prenois",
    "brands-hatch": "Brands Hatch",
    "donington": "Donington Park",
    "watkins-glen": "Watkins Glen International",
    "indianapolis": "Indianapolis Motor Speedway",
    "long-beach": "Long Beach Grand Prix Circuit",
    "detroit": "Detroit street circuit",
    "dallas": "Fair Park", # Dallas GP location
    "phoenix": "Phoenix street circuit",
    "caesars-palace": "Caesars Palace Grand Prix",
    "korea": "Korean International Circuit",
    "buddh": "Buddh International Circuit",
    "valencia": "Valencia Street Circuit",
    "sochi": "Sochi Autodrom",
    "portimao": "Algarve International Circuit",
    "zeltweg": "Zeltweg Airfield",
    "avus": "AVUS",
    "montjuic": "Montjuïc circuit",
    "jarama": "Circuito del Jarama",
    "pedralbes": "Circuit de Pedralbes",
    "monsanto": "Monsanto Park",
    "ain-diab": "Ain-Diab Circuit",
    "pescara": "Pescara Circuit",
    "nivelles": "Nivelles-Baulers",
    "zolder": "Circuit Zolder",
    "anderstorp": "Scandinavian Raceway",
    "mosport": "Mosport Park",
    "tremblant": "Circuit Mont-Tremblant",
    "rio": "Autódromo Internacional Nelson Piquet",
    "buenos-aires": "Autódromo Juan y Oscar Gálvez",
    "aida": "Okayama International Circuit"
}

def extract_data_from_text(text):
    """
    使用正则从全文中提取核心数据
    """
    data = {"length": "N/A", "corners": "N/A"}
    
    # 1. 提取长度 (通常格式: 5.891 km 或 5.891km)
    # 优先找 "Length: 5.xxx km" 这种 Infobox 格式
    len_match = re.search(r'Length[:\s]+([\d\.]+)\s*km', text, re.IGNORECASE)
    if not len_match:
        # 备选：找正文中出现的 "x.xxx km"
        len_match = re.search(r'([\d\.]+)\s*km', text)
    if len_match:
        data["length"] = f"{len_match.group(1)} km"

    # 2. 提取弯道数 (通常格式: 18 turns 或 Turns: 18)
    turns_match = re.search(r'Turns[:\s]+(\d+)', text, re.IGNORECASE)
    if not turns_match:
        turns_match = re.search(r'(\d+)\s+turns', text, re.IGNORECASE)
    if turns_match:
        data["corners"] = turns_match.group(1)
        
    return data

# --- 主程序 ---
if not os.path.exists(INPUT_FILE):
    print(f"❌ 找不到 {INPUT_FILE}")
    exit()

with open(INPUT_FILE, 'r', encoding='utf-8') as f:
    raw_json = json.load(f)

# 处理结构兼容性
track_list = []
if isinstance(raw_json, dict) and "circuits" in raw_json:
    track_list = raw_json["circuits"]
elif isinstance(raw_json, dict) and "tracks" in raw_json:
    track_list = raw_json["tracks"]
else:
    track_list = raw_json

print(f"🚀 开始通过 Wikipedia API 补全 {len(track_list)} 条赛道数据...")

enriched_tracks = []
count = 0

for track in track_list:
    track_id = track['id']
    # 尝试从 ID 解析基础名字 (去掉数字后缀，如 silverstone-8 -> silverstone)
    base_name = track_id.split('-')[0]
    
    # 获取搜索关键词
    search_query = NAME_MAPPING.get(base_name, track['name'])
    
    print(f"🔍 [{count+1}/{len(track_list)}] 搜索: {search_query} ...", end="")
    
    # 1. 获取页面
    page = wiki_wiki.page(search_query)
    
    if page.exists():
        # 2. 获取摘要 (Description)
        # 只取前两句话，防止太长
        summary = page.summary.split('. ')
        short_desc = ". ".join(summary[:2]) + "." if len(summary) > 0 else "F1 Circuit."
        
        # 3. 使用正则从页面内容提取数据
        facts = extract_data_from_text(page.text)
        
        # 4. 更新数据
        track['desc'] = short_desc
        track['length'] = facts['length']
        track['corners'] = facts['corners']
        track['location'] = search_query # 暂时用Wiki标题作为地点名
        
        print(f" ✅ 长:{track['length']} | 弯:{track['corners']}")
    else:
        print(" ❌ 未找到页面")
        # 保持默认值或 N/A
        track['desc'] = "Historic Formula 1 Circuit."
        track['length'] = "Unknown"
        track['corners'] = "??"

    enriched_tracks.append(track)
    count += 1
    # time.sleep(0.5) # API 礼貌延时

# 保存
final_data = {
    "circuits": enriched_tracks,
    # 如果原文件有 teams/drivers，记得保留。这里假设我们需要保留。
    "teams": raw_json.get("teams", []),
    "drivers": raw_json.get("drivers", [])
}

with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
    json.dump(final_data, f, ensure_ascii=False, indent=2)

print(f"\n🎉 真实数据补全完成！保存至 {OUTPUT_FILE}")