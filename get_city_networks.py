import requests
from PIL import Image, ImageEnhance, ImageOps
from io import BytesIO
import math
import os
import json

# --- ⚙️ 配置 ---
IMG_DIR = "./assets/city_networks"
DATA_DIR = "./data"
os.makedirs(IMG_DIR, exist_ok=True)
os.makedirs(DATA_DIR, exist_ok=True)

# 🇨🇳 50个中国城市清单 (名称, 中文名, 纬度, 经度, 缩放级别)
# 缩放 12 = 看宏观轮廓 (适合北京/西安这种大格局)
# 缩放 13 = 看街道细节 (适合苏州/澳门这种小尺度)
targets = [
    # --- 直辖市 ---
    ("beijing", "北京", 39.9042, 116.4074, 12),
    ("shanghai", "上海", 31.2304, 121.4737, 12),
    ("tianjin", "天津", 39.0842, 117.2009, 12),
    ("chongqing", "重庆", 29.5630, 106.5516, 13), # 山城看细节

    # --- 华南 (珠三角/海岛) ---
    ("guangzhou", "广州", 23.1291, 113.2644, 12),
    ("shenzhen", "深圳", 22.5431, 114.0579, 12),
    ("hong_kong", "香港", 22.3193, 114.1694, 13),
    ("macau", "澳门", 22.1987, 113.5439, 14), # 澳门很小，放大
    ("zhuhai", "珠海", 22.2707, 113.5767, 13),
    ("haikou", "海口", 20.0440, 110.1999, 13),
    ("sanya", "三亚", 18.2528, 109.5120, 13),
    ("nanning", "南宁", 22.8170, 108.3665, 12),
    ("guilin", "桂林", 25.2345, 110.1800, 13),

    # --- 华东 (长三角/沿海) ---
    ("nanjing", "南京", 32.0603, 118.7969, 12),
    ("suzhou", "苏州", 31.2989, 120.5853, 13), # 水城
    ("hangzhou", "杭州", 30.2741, 120.1551, 12),
    ("ningbo", "宁波", 29.8683, 121.5440, 12),
    ("hefei", "合肥", 31.8206, 117.2272, 12),
    ("fuzhou", "福州", 26.0745, 119.2965, 12),
    ("xiamen", "厦门", 24.4798, 118.0894, 13), # 岛屿
    ("nanchang", "南昌", 28.6820, 115.8579, 12),
    ("jinan", "济南", 36.6512, 117.1201, 12),
    ("qingdao", "青岛", 36.0671, 120.3826, 13), # 沿海

    # --- 华中 ---
    ("wuhan", "武汉", 30.5928, 114.3055, 12), # 江城
    ("changsha", "长沙", 28.2282, 112.9388, 12),
    ("zhengzhou", "郑州", 34.7466, 113.6253, 12),
    ("luoyang", "洛阳", 34.6181, 112.4540, 13),

    # --- 西南 ---
    ("chengdu", "成都", 30.5728, 104.0668, 12),
    ("kunming", "昆明", 24.8801, 102.8329, 12),
    ("dali", "大理", 25.6065, 100.2676, 13),
    ("guiyang", "贵阳", 26.6470, 106.6302, 13),
    ("lhasa", "拉萨", 29.6525, 91.1721, 13),

    # --- 西北 ---
    ("xi_an", "西安", 34.3416, 108.9398, 12), # 方正
    ("lanzhou", "兰州", 36.0611, 103.8343, 12), # 条状
    ("xining", "西宁", 36.6171, 101.7782, 13),
    ("yinchuan", "银川", 38.4872, 106.2309, 12),
    ("urumqi", "乌鲁木齐", 43.8256, 87.6168, 12),
    ("kashgar", "喀什", 39.4704, 75.9898, 14), # 老城纹理
    ("dunhuang", "敦煌", 40.1421, 94.6620, 13),

    # --- 华北/东北 ---
    ("shijiazhuang", "石家庄", 38.0428, 114.5149, 12),
    ("taiyuan", "太原", 37.8706, 112.5489, 12),
    ("hohhot", "呼和浩特", 40.8415, 111.7492, 12),
    ("shenyang", "沈阳", 41.8057, 123.4315, 12),
    ("dalian", "大连", 38.9140, 121.6147, 13), # 广场放射
    ("changchun", "长春", 43.8171, 125.3235, 12),
    ("harbin", "哈尔滨", 45.8038, 126.5350, 12),

    # --- 港澳台 (补充) ---
    ("taipei", "台北", 25.0330, 121.5654, 13),
    ("kaohsiung", "高雄", 22.6273, 120.3014, 13),
]

# 免费源：CartoDB Dark No-Labels
TILE_URL = "https://a.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}.png"

def latlon_to_tile(lat, lon, zoom):
    n = 2.0 ** zoom
    xtile = int((lon + 180.0) / 360.0 * n)
    ytile = int((1.0 - math.log(math.tan(math.radians(lat)) + (1 / math.cos(math.radians(lat)))) / math.pi) / 2.0 * n)
    return xtile, ytile

def process_image(img):
    """🎨 图像增强：让路网更清晰"""
    img = img.convert("L") # 转灰度
    
    # 暴力拉高对比度 (黑的更黑，白的更白)
    enhancer = ImageEnhance.Contrast(img)
    img = enhancer.enhance(5.0) 
    
    # 提高亮度 (让细路显现)
    enhancer = ImageEnhance.Brightness(img)
    img = enhancer.enhance(1.6)
    
    # 上色 (黑底白线)
    img = ImageOps.colorize(img, black="black", white="white")
    return img

def download_merged_image(name_id, lat, lon, zoom):
    center_x, center_y = latlon_to_tile(lat, lon, zoom)
    
    # 下载 3x3 范围 (768x768像素)
    range_offset = 1 
    tile_size = 256
    width = tile_size * (range_offset * 2 + 1)
    height = tile_size * (range_offset * 2 + 1)
    
    merged_img = Image.new('RGB', (width, height))
    
    print(f"🖼️ [{zoom}] 拼图: {name_id} ...", end="")
    
    for dx in range(-range_offset, range_offset + 1):
        for dy in range(-range_offset, range_offset + 1):
            xtile = center_x + dx
            ytile = center_y + dy
            
            url = TILE_URL.format(z=zoom, x=xtile, y=ytile)
            
            try:
                headers = {'User-Agent': 'Mozilla/5.0'}
                r = requests.get(url, headers=headers, timeout=5)
                if r.status_code == 200:
                    tile_img = Image.open(BytesIO(r.content))
                    paste_x = (dx + range_offset) * tile_size
                    paste_y = (dy + range_offset) * tile_size
                    merged_img.paste(tile_img, (paste_x, paste_y))
            except:
                print("x", end="")

    # 视觉增强
    final_img = process_image(merged_img)

    # 保存
    save_path = f"{IMG_DIR}/{name_id}.png"
    final_img.save(save_path)
    print(" ✅ 完成")

# --- 主程序 ---
print(f"🚀 开始生成 50 城中华路网 (CartoDB 增强版)...")

json_data = []

for i, item in enumerate(targets):
    cid, name, lat, lon, zoom = item
    
    # 检查是否已存在，增量更新
    if os.path.exists(f"{IMG_DIR}/{cid}.png"):
        print(f"⏩ 跳过: {name}")
    else:
        download_merged_image(cid, lat, lon, zoom)
    
    json_data.append({
        "id": cid,
        "name": name,
        "img": f"./assets/city_networks/{cid}.png"
    })

# 生成 json
with open(f"{DATA_DIR}/china_city_networks.json", "w", encoding='utf-8') as f:
    json.dump(json_data, f, ensure_ascii=False, indent=2)

print(f"\n🎉 50 城路网生成完毕！数据已保存至 {DATA_DIR}/china_city_networks.json")