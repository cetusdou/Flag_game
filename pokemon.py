# import requests
# from PIL import Image
# from io import BytesIO
# import os
# import json
# import time
# from collections import Counter

# # --- ⚙️ 配置 ---
# # 图片保存目录
# IMG_DIR = "./assets/pokemon_200_silhouettes"
# # 数据保存目录
# DATA_DIR = "./data"
# os.makedirs(IMG_DIR, exist_ok=True)
# os.makedirs(DATA_DIR, exist_ok=True)

# # 目标数量：前 200 只 (最经典的范围)
# TARGET_COUNT = 200

# # API 设置
# URL_API = "https://pokeapi.co/api/v2/pokemon/{id}"
# IMG_SOURCE_KEY = "official-artwork"

# # --- 🎨 智能颜色算法 (复用之前的逻辑) ---

# def is_whiteish(rgb, threshold=240):
#     """判断颜色是否太接近白色 (阈值调高到240，过滤掉浅灰)"""
#     r, g, b = rgb
#     return r > threshold and g > threshold and b > threshold

# def get_dominant_color_smart(img_rgba):
#     """提取主色调，智能跳过白色背景/身体"""
#     pixels = img_rgba.getdata()
#     valid_colors = []
    
#     for r, g, b, a in pixels:
#         # 严格过滤半透明像素
#         if a > 220: 
#             valid_colors.append((r, g, b))
            
#     if not valid_colors:
#         return (30, 30, 30) # 兜底黑
        
#     # 取前 10 名候选色
#     top_candidates = Counter(valid_colors).most_common(10)
    
#     final_color = (30, 30, 30) # 默认深灰，比纯黑好看一点
    
#     for color, count in top_candidates:
#         if not is_whiteish(color):
#             final_color = color
#             break
            
#     return final_color

# # --- 🦕 核心处理逻辑 ---

# def process_pokemon(poke_id):
#     """下载 -> 提取颜色 -> 生成剪影 -> 返回数据字典"""
#     try:
#         # 1. 请求 API
#         r = requests.get(URL_API.format(id=poke_id), timeout=5)
#         if r.status_code != 200:
#             print(f"⚠️ ID {poke_id} API 请求失败")
#             return None
            
#         data = r.json()
#         name = data['name']
#         img_url = data['sprites']['other']['official-artwork']['front_default']
        
#         if not img_url:
#             return None

#         # 2. 下载图片
#         r_img = requests.get(img_url, timeout=10)
#         img_original = Image.open(BytesIO(r_img.content)).convert("RGBA")
        
#         # 3. 计算颜色
#         dominant_rgb = get_dominant_color_smart(img_original)
        
#         # 4. 生成剪影
#         alpha = img_original.getchannel('A')
#         # 创建纯色剪影
#         silhouette = Image.new("RGBA", img_original.size, (*dominant_rgb, 255))
#         silhouette.putalpha(alpha)
        
#         # 5. 保存图片
#         # 文件名格式: 001.png, 025.png (保持短小，方便前端调用)
#         filename = f"{poke_id:03d}.png"
#         save_path = f"{IMG_DIR}/{filename}"
#         silhouette.save(save_path)
        
#         print(f"✅ [{poke_id:03d}] {name:<12} -> Color: {dominant_rgb}")
        
#         # 6. 返回数据结构
#         return {
#             "id": poke_id,
#             "name": name, # 英文名 (前端可以用映射表转中文)
#             "img": f"assets/pokemon_200_silhouettes/{filename}",
#             "color_rgb": dominant_rgb,
#             "color_hex": '#{:02x}{:02x}{:02x}'.format(*dominant_rgb) # 顺便生成 HEX 颜色码
#         }

#     except Exception as e:
#         print(f"❌ ID {poke_id} 处理出错: {e}")
#         return None

# # --- 🚀 主程序 ---
# if __name__ == "__main__":
#     print(f"🚀 开始生成前 {TARGET_COUNT} 只宝可梦的智能剪影...")
    
#     all_pokemon_data = []
    
#     for pid in range(1, TARGET_COUNT + 1):
#         result = process_pokemon(pid)
#         if result:
#             all_pokemon_data.append(result)
        
#         # 稍微延时，避免 API 限制
#         # time.sleep(0.05)

#     # 保存 JSON 索引文件
#     json_path = f"{DATA_DIR}/pokemon_data.json"
#     with open(json_path, "w", encoding='utf-8') as f:
#         json.dump(all_pokemon_data, f, ensure_ascii=False, indent=2)
        
#     print("-" * 30)
#     print(f"🎉 任务完成！")
#     print(f"📂 图片位置: {IMG_DIR}")
#     print(f"📄 数据文件: {json_path}")
#     print(f"📊 共生成: {len(all_pokemon_data)} 条数据")

import json
import requests
import os
import time

# --- ⚙️ 配置 ---
JSON_PATH = "./data/pokemon_data.json"
OUTPUT_PATH = "./data/pokemon_data_cn.json" # 为了安全，我们存个新文件，你也可以覆盖原文件

# API: 获取物种信息 (包含多语言名字)
URL_SPECIES = "https://pokeapi.co/api/v2/pokemon-species/{id}"

def fetch_chinese_name(poke_id):
    """
    访问 Species API 获取 zh-Hans (简体中文) 名字
    """
    try:
        r = requests.get(URL_SPECIES.format(id=poke_id), timeout=5)
        if r.status_code != 200:
            return None
        
        data = r.json()
        names = data['names']
        
        # 遍历名字列表，找到中文
        for entry in names:
            if entry['language']['name'] == 'zh-Hans': # 简体中文
                return entry['name']
            
    except Exception as e:
        print(f"  ❌ API 请求错误: {e}")
    
    return None

def main():
    print("🚀 启动中文名翻译补全程序...")
    
    # 1. 读取现有的 JSON 数据
    if not os.path.exists(JSON_PATH):
        print(f"❌ 找不到文件: {JSON_PATH}")
        return

    with open(JSON_PATH, "r", encoding='utf-8') as f:
        pokemon_list = json.load(f)
    
    print(f"📊 读取到 {len(pokemon_list)} 条数据，准备开始翻译...")
    
    # 2. 遍历并翻译
    # 使用 Session 可以稍微提高频繁请求的速度
    with requests.Session() as session:
        for index, p in enumerate(pokemon_list):
            poke_id = p['id']
            en_name = p['name']
            
            # 如果已经有中文名了，跳过 (方便断点续传)
            if 'name_cn' in p:
                continue

            print(f"[{index+1}/{len(pokemon_list)}] 正在翻译 ID:{poke_id} {en_name} ...", end="")
            
            cn_name = fetch_chinese_name(poke_id)
            
            if cn_name:
                p['name_cn'] = cn_name
                print(f" ✅ -> {cn_name}")
            else:
                p['name_cn'] = en_name # 如果找不到，暂存英文名
                print(f" ⚠️ 未找到中文，保留英文")
            
            # 礼貌延时，防止触发 API 速率限制
            # time.sleep(0.1)

    # 3. 保存结果
    with open(OUTPUT_PATH, "w", encoding='utf-8') as f:
        json.dump(pokemon_list, f, ensure_ascii=False, indent=2)

    print("-" * 30)
    print(f"🎉 翻译完成！")
    print(f"📄 新文件已保存: {OUTPUT_PATH}")
    
    # 打印前几个看看效果
    print("\n👀 数据预览:")
    print(json.dumps(pokemon_list[:3], ensure_ascii=False, indent=2))

if __name__ == "__main__":
    main()