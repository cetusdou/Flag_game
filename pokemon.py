import json
import requests
from PIL import Image
from io import BytesIO
import os
from collections import Counter

# --- ⚙️ 配置 ---
# 读取你刚刚生成的带中文的 JSON
INPUT_JSON = "./data/pokemon_data.json"
# 保存回同一个文件（覆盖更新）
OUTPUT_JSON = "./data/pokemon_data.json"
# 图片目录 (需要重新生成图片，因为旧的可能是黑的)
IMG_DIR = "./assets/pokemon_200_silhouettes"

# API 地址
URL_API = "https://pokeapi.co/api/v2/pokemon/{id}"

# --- 🎨 升级版颜色算法 (V2) ---

def get_dominant_color_v2(img_rgba):
    """
    V2 算法特点：
    1. 忽略透明像素
    2. 忽略接近黑色的像素 (描边)
    3. 忽略接近白色的像素 (高光/背景)
    4. 颜色“分桶” (Binning): 把相近颜色归为一类，防止渐变色分散权重
    """
    # 缩略图加速处理 (100x100 足够分析颜色)
    img_small = img_rgba.resize((100, 100), Image.Resampling.NEAREST)
    pixels = img_small.getdata()
    
    valid_colors = []
    
    for r, g, b, a in pixels:
        # 1. 忽略透明
        if a < 200: continue
        
        # 2. 忽略深色/黑色描边 (RGB均小于50)
        if r < 50 and g < 50 and b < 50: continue
        
        # 3. 忽略亮白/高光 (RGB均大于240)
        if r > 240 and g > 240 and b > 240: continue
        
        # 4. 颜色分桶 (关键步骤)
        # 将 RGB 值除以 10 取整，忽略细微的渐变差异
        # 例如 (105, 200, 55) 和 (109, 202, 58) 都会变成 (10, 20, 5)
        bin_r = (r // 10) * 10
        bin_g = (g // 10) * 10
        bin_b = (b // 10) * 10
        
        valid_colors.append((bin_r, bin_g, bin_b))
            
    if not valid_colors:
        # 如果过滤完没剩啥颜色了（极其罕见），返回个默认灰
        return (100, 100, 100)
        
    # 统计出现最多的“颜色桶”
    most_common_bin = Counter(valid_colors).most_common(1)[0][0]
    
    # 为了颜色更好看，稍微提亮一点点 (可选)
    final_color = (
        min(most_common_bin[0] + 5, 255),
        min(most_common_bin[1] + 5, 255),
        min(most_common_bin[2] + 5, 255)
    )
    
    return final_color

# --- 🚀 主逻辑 ---

def process_fix():
    print("🚀 启动颜色修复程序 (去除黑色描边干扰)...")
    
    if not os.path.exists(INPUT_JSON):
        print("❌ 找不到 JSON 文件")
        return

    with open(INPUT_JSON, "r", encoding='utf-8') as f:
        data_list = json.load(f)
        
    print(f"📊 正在重新扫描 {len(data_list)} 只宝可梦...")

    # 使用 session 复用连接
    with requests.Session() as session:
        for p in data_list:
            poke_id = p['id']
            name = p.get('name_cn', p['name']) # 优先显示中文名用于日志
            
            # 为了准确，我们需要重新下载原图来分析颜色
            # (因为之前的脚本没有保存原图，只保存了剪影)
            try:
                # 1. 重新获取图片 URL
                # 这里为了快，直接拼 URL 规则，不调 API 查 URL 了
                img_url = f"https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/{poke_id}.png"
                
                r = session.get(img_url, timeout=5)
                if r.status_code != 200:
                    print(f"⚠️ ID {poke_id} 图片下载失败")
                    continue
                
                img_original = Image.open(BytesIO(r.content)).convert("RGBA")
                
                # 2. 🔥重新计算颜色
                new_rgb = get_dominant_color_v2(img_original)
                new_hex = '#{:02x}{:02x}{:02x}'.format(*new_rgb)
                
                # 检查是否变了
                old_hex = p.get('color_hex', '#000000')
                if old_hex != new_hex:
                    print(f"🔧 修复 [{poke_id:03d}] {name}: {old_hex} -> {new_hex}")
                else:
                    # print(f"✅ [{poke_id:03d}] {name} 颜色无变化")
                    pass
                
                # 3. 更新 JSON 数据
                p['color_rgb'] = new_rgb
                p['color_hex'] = new_hex
                
                # 4. 🔥重新生成剪影图 (覆盖旧的)
                # 因为旧的可能是黑色的，必须重画
                alpha = img_original.getchannel('A')
                silhouette = Image.new("RGBA", img_original.size, (*new_rgb, 255))
                silhouette.putalpha(alpha)
                
                # 保存覆盖
                filename = f"{poke_id:03d}.png"
                save_path = f"{IMG_DIR}/{filename}"
                silhouette.save(save_path)
                
            except Exception as e:
                print(f"❌ 处理出错 ID {poke_id}: {e}")

    # 保存新的 JSON
    with open(OUTPUT_JSON, "w", encoding='utf-8') as f:
        json.dump(data_list, f, ensure_ascii=False, indent=2)
        
    print("-" * 30)
    print(f"🎉 颜色修复完成！JSON 已更新。")
    print(f"📂 请检查 {IMG_DIR} 下的图片是否变成了彩色。")

if __name__ == "__main__":
    process_fix()

# import json
# import requests
# import os
# import time

# # --- ⚙️ 配置 ---
# JSON_PATH = "./data/pokemon_data.json"
# OUTPUT_PATH = "./data/pokemon_data_cn.json" # 为了安全，我们存个新文件，你也可以覆盖原文件

# # API: 获取物种信息 (包含多语言名字)
# URL_SPECIES = "https://pokeapi.co/api/v2/pokemon-species/{id}"

# def fetch_chinese_name(poke_id):
#     """
#     访问 Species API 获取 zh-Hans (简体中文) 名字
#     """
#     try:
#         r = requests.get(URL_SPECIES.format(id=poke_id), timeout=5)
#         if r.status_code != 200:
#             return None
        
#         data = r.json()
#         names = data['names']
        
#         # 遍历名字列表，找到中文
#         for entry in names:
#             if entry['language']['name'] == 'zh-Hans': # 简体中文
#                 return entry['name']
            
#     except Exception as e:
#         print(f"  ❌ API 请求错误: {e}")
    
#     return None

# def main():
#     print("🚀 启动中文名翻译补全程序...")
    
#     # 1. 读取现有的 JSON 数据
#     if not os.path.exists(JSON_PATH):
#         print(f"❌ 找不到文件: {JSON_PATH}")
#         return

#     with open(JSON_PATH, "r", encoding='utf-8') as f:
#         pokemon_list = json.load(f)
    
#     print(f"📊 读取到 {len(pokemon_list)} 条数据，准备开始翻译...")
    
#     # 2. 遍历并翻译
#     # 使用 Session 可以稍微提高频繁请求的速度
#     with requests.Session() as session:
#         for index, p in enumerate(pokemon_list):
#             poke_id = p['id']
#             en_name = p['name']
            
#             # 如果已经有中文名了，跳过 (方便断点续传)
#             if 'name_cn' in p:
#                 continue

#             print(f"[{index+1}/{len(pokemon_list)}] 正在翻译 ID:{poke_id} {en_name} ...", end="")
            
#             cn_name = fetch_chinese_name(poke_id)
            
#             if cn_name:
#                 p['name_cn'] = cn_name
#                 print(f" ✅ -> {cn_name}")
#             else:
#                 p['name_cn'] = en_name # 如果找不到，暂存英文名
#                 print(f" ⚠️ 未找到中文，保留英文")
            
#             # 礼貌延时，防止触发 API 速率限制
#             # time.sleep(0.1)

#     # 3. 保存结果
#     with open(OUTPUT_PATH, "w", encoding='utf-8') as f:
#         json.dump(pokemon_list, f, ensure_ascii=False, indent=2)

#     print("-" * 30)
#     print(f"🎉 翻译完成！")
#     print(f"📄 新文件已保存: {OUTPUT_PATH}")
    
#     # 打印前几个看看效果
#     print("\n👀 数据预览:")
#     print(json.dumps(pokemon_list[:3], ensure_ascii=False, indent=2))

# if __name__ == "__main__":
#     main()