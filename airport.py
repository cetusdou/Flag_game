import requests
from PIL import Image
from io import BytesIO
import math
import os
import json
import time

# --- ⚙️ 配置 ---
IMG_DIR = "./assets/airports_satellite"
DATA_DIR = "./data"
os.makedirs(IMG_DIR, exist_ok=True)
os.makedirs(DATA_DIR, exist_ok=True)
JSON_NAME = "airport_game_data.json"

# Esri World Imagery (无标注高清卫星图)
URL_SATELLITE = "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"

# --- ✈️ 全球标志性机场列表 (IATA, Name, Lat, Lon, Recommended Zoom) ---
# Zoom 13: 看全貌 (适合超大机场如 DEN, DFW)
# Zoom 14: 看细节 (适合大多数机场)
AIRPORT_DB = [
    # --- 亚洲 ---
    ("PEK", "北京首都国际机场", 40.0801, 116.5846, 14),
    ("PKX", "北京大兴国际机场", 39.5092, 116.4134, 14), # 海星造型
    ("PVG", "上海浦东国际机场", 31.1434, 121.8053, 13),
    ("HKG", "香港国际机场", 22.3089, 113.9146, 14), # 人工岛
    ("HND", "东京羽田机场", 35.5484, 139.7849, 14),
    ("NRT", "东京成田机场", 35.7658, 140.3863, 14),
    ("ICN", "仁川国际机场", 37.4625, 126.4392, 13),
    ("SIN", "新加坡樟宜机场", 1.3592, 103.9893, 14),
    ("DXB", "迪拜国际机场", 25.2528, 55.3644, 14),
    ("KIX", "大阪关西机场", 34.4273, 135.2443, 14), # 完全在海上

    # --- 北美 ---
    ("ATL", "亚特兰大哈兹菲尔德-杰克逊", 33.6367, -84.4281, 14), # 全球最忙
    ("ORD", "芝加哥奥黑尔", 41.9742, -87.9073, 13), # 跑道迷宫
    ("LAX", "洛杉矶国际机场", 33.9425, -118.4081, 14),
    ("JFK", "纽约肯尼迪机场", 40.6398, -73.7789, 13),
    ("SFO", "旧金山国际机场", 37.6213, -122.3790, 14),
    ("DEN", "丹佛国际机场", 39.8617, -104.6731, 13), # 极其巨大，像风车
    ("DFW", "达拉斯-沃思堡", 32.8968, -97.0380, 13),
    ("YVR", "温哥华国际机场", 49.1939, -123.1844, 14),

    # --- 欧洲 ---
    ("LHR", "伦敦希思罗机场", 51.4712, -0.4593, 14),
    ("CDG", "巴黎戴高乐机场", 49.0097, 2.5478, 13), # 复杂的滑行道
    ("FRA", "法兰克福机场", 50.0333, 8.5706, 14),
    ("AMS", "阿姆斯特丹史基浦", 52.3086, 4.7639, 13),
    ("MAD", "马德里巴拉哈斯", 40.4936, -3.5668, 13),

    # --- 其他 ---
    ("SYD", "悉尼金斯福德·史密斯", -33.9461, 151.1772, 14),
    ("JNB", "约翰内斯堡坦博国际", -26.1392, 28.2460, 14),
    ("GRU", "圣保罗瓜鲁柳斯", -23.4323, -46.4695, 14),
    ("SXM", "朱莉安娜公主机场", 18.0425, -63.1130, 15), # 著名的海滩剃头降落
]

# --- 🧮 工具函数 ---
def latlon_to_tile(lat, lon, zoom):
    n = 2.0 ** zoom
    xtile = int((lon + 180.0) / 360.0 * n)
    ytile = int((1.0 - math.log(math.tan(math.radians(lat)) + (1 / math.cos(math.radians(lat)))) / math.pi) / 2.0 * n)
    return xtile, ytile

def download_tile(url):
    try:
        headers = {'User-Agent': 'Mozilla/5.0'}
        r = requests.get(url, headers=headers, timeout=10)
        if r.status_code == 200:
            return Image.open(BytesIO(r.content)).convert("RGB")
    except:
        pass
    return None

def generate_airport_image(code, name, lat, lon, zoom):
    # 扩大拼图范围：2 = 5x5网格 (1280x1280)，保证能把大机场看全
    range_offset = 2 
    
    xtile_center, ytile_center = latlon_to_tile(lat, lon, zoom)
    TILE_SIZE = 256
    
    width = TILE_SIZE * (range_offset * 2 + 1)
    height = TILE_SIZE * (range_offset * 2 + 1)
    
    full_img = Image.new('RGB', (width, height), (0,0,0))
    
    print(f"🛰️ 下载中: {code} - {name} (z{zoom})...", end="")
    success_tiles = 0
    total_tiles = (range_offset * 2 + 1) ** 2

    for dx in range(-range_offset, range_offset + 1):
        for dy in range(-range_offset, range_offset + 1):
            xtile = xtile_center + dx
            ytile = ytile_center + dy
            
            px = (dx + range_offset) * TILE_SIZE
            py = (dy + range_offset) * TILE_SIZE
            
            tile = download_tile(URL_SATELLITE.format(z=zoom, x=xtile, y=ytile))
            if tile:
                full_img.paste(tile, (px, py))
                success_tiles += 1
            
            # 礼貌延时，防止封IP
            # time.sleep(0.05) 

    # 缩放保存 (限制最大尺寸，方便游戏加载)
    if full_img.width > 1024:
        full_img = full_img.resize((1024, 1024), Image.LANCZOS)
        
    filename = f"{code}.jpg"
    save_path = f"{IMG_DIR}/{filename}"
    full_img.save(save_path, quality=85) # JPG 质量85足够了
    
    if success_tiles > total_tiles // 2:
        print(" ✅ 完成")
        return filename
    else:
        print(" ❌ 失败 (瓦片缺失)")
        return None

# --- 🚀 主程序 ---
print(f"🚀 启动“机场猜猜看”素材下载器...")
game_data = []

for item in AIRPORT_DB:
    code, name, lat, lon, zoom = item
    
    # 下载图片
    if os.path.exists(f"{IMG_DIR}/{code}.jpg"):
        continue
    else:
        filename = generate_airport_image(code, name, lat, lon, zoom)
        
        if filename:
            # 存入游戏数据
            game_data.append({
                "code": code,
                "name": name,
                "image": f"{IMG_DIR}/{filename}",
                "lat": lat,
                "lon": lon,
                "difficulty": "Hard" if zoom > 14 else "Medium" # 简单逻辑
            })

    # # 保存题目数据 (JSON)
    # with open(f"{DATA_DIR}/{JSON_NAME}", "w", encoding='utf-8') as f:
    #     json.dump(game_data, f, ensure_ascii=False, indent=2)

    print(f"\n🎉 素材下载完成！")
    print(f"📂 图片目录: {IMG_DIR}")
    print(f"📄 题目数据: {DATA_DIR}/{JSON_NAME}")
    print("👉 现在你可以写一个简单的网页或程序来读取 json 并显示图片了！")