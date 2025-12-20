import requests
from PIL import Image
from io import BytesIO
import os
import json
import time
from collections import Counter

# --- ⚙️ 配置 ---
# 图片保存目录
IMG_DIR = "./assets/pokemon_200_silhouettes"
# 数据保存目录
DATA_DIR = "./data"
os.makedirs(IMG_DIR, exist_ok=True)
os.makedirs(DATA_DIR, exist_ok=True)

# 目标数量：前 200 只 (最经典的范围)
TARGET_COUNT = 200

# API 设置
URL_API = "https://pokeapi.co/api/v2/pokemon/{id}"
IMG_SOURCE_KEY = "official-artwork"

# --- 🎨 智能颜色算法 (复用之前的逻辑) ---

def is_whiteish(rgb, threshold=240):
    """判断颜色是否太接近白色 (阈值调高到240，过滤掉浅灰)"""
    r, g, b = rgb
    return r > threshold and g > threshold and b > threshold

def get_dominant_color_smart(img_rgba):
    """提取主色调，智能跳过白色背景/身体"""
    pixels = img_rgba.getdata()
    valid_colors = []
    
    for r, g, b, a in pixels:
        # 严格过滤半透明像素
        if a > 220: 
            valid_colors.append((r, g, b))
            
    if not valid_colors:
        return (0, 0, 0) # 兜底黑
        
    # 取前 10 名候选色
    top_candidates = Counter(valid_colors).most_common(10)
    
    final_color = (30, 30, 30) # 默认深灰，比纯黑好看一点
    
    for color, count in top_candidates:
        if not is_whiteish(color):
            final_color = color
            break
            
    return final_color

# --- 🦕 核心处理逻辑 ---

def process_pokemon(poke_id):
    """下载 -> 提取颜色 -> 生成剪影 -> 返回数据字典"""
    try:
        # 1. 请求 API
        r = requests.get(URL_API.format(id=poke_id), timeout=5)
        if r.status_code != 200:
            print(f"⚠️ ID {poke_id} API 请求失败")
            return None
            
        data = r.json()
        name = data['name']
        img_url = data['sprites']['other']['official-artwork']['front_default']
        
        if not img_url:
            return None

        # 2. 下载图片
        r_img = requests.get(img_url, timeout=10)
        img_original = Image.open(BytesIO(r_img.content)).convert("RGBA")
        
        # 3. 计算颜色
        dominant_rgb = get_dominant_color_smart(img_original)
        
        # 4. 生成剪影
        alpha = img_original.getchannel('A')
        # 创建纯色剪影
        silhouette = Image.new("RGBA", img_original.size, (*dominant_rgb, 255))
        silhouette.putalpha(alpha)
        
        # 5. 保存图片
        # 文件名格式: 001.png, 025.png (保持短小，方便前端调用)
        filename = f"{poke_id:03d}.png"
        save_path = f"{IMG_DIR}/{filename}"
        silhouette.save(save_path)
        
        print(f"✅ [{poke_id:03d}] {name:<12} -> Color: {dominant_rgb}")
        
        # 6. 返回数据结构
        return {
            "id": poke_id,
            "name": name, # 英文名 (前端可以用映射表转中文)
            "img": f"assets/pokemon_200_silhouettes/{filename}",
            "color_rgb": dominant_rgb,
            "color_hex": '#{:02x}{:02x}{:02x}'.format(*dominant_rgb) # 顺便生成 HEX 颜色码
        }

    except Exception as e:
        print(f"❌ ID {poke_id} 处理出错: {e}")
        return None

# --- 🚀 主程序 ---
if __name__ == "__main__":
    print(f"🚀 开始生成前 {TARGET_COUNT} 只宝可梦的智能剪影...")
    
    all_pokemon_data = []
    
    for pid in range(1, TARGET_COUNT + 1):
        result = process_pokemon(pid)
        if result:
            all_pokemon_data.append(result)
        
        # 稍微延时，避免 API 限制
        # time.sleep(0.05)

    # 保存 JSON 索引文件
    json_path = f"{DATA_DIR}/pokemon_data.json"
    with open(json_path, "w", encoding='utf-8') as f:
        json.dump(all_pokemon_data, f, ensure_ascii=False, indent=2)
        
    print("-" * 30)
    print(f"🎉 任务完成！")
    print(f"📂 图片位置: {IMG_DIR}")
    print(f"📄 数据文件: {json_path}")
    print(f"📊 共生成: {len(all_pokemon_data)} 条数据")