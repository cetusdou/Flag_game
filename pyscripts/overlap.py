from PIL import Image, ImageFilter
import os
import sys
import time

# --- ⚙️ 全局配置 (请在此处修改) ---

# 1. 输入文件夹路径
# 底图文件夹 (例如: 极简白水版)
BASE_DIR = "assets\city_networks" 
# 铁路图层文件夹 (纯铁路层)
RAIL_DIR = "./assets/railway_layers_only"

# 2. 输出文件夹路径
OUTPUT_DIR = "assets/city_networks_final_merged"

# 3. 处理参数
THIN_LEVEL = 3            # 腐蚀力度 (奇数: 3, 5, 7...)，越大越细
OPACITY = 0.5            # 透明度 (0.0 ~ 1.0)，越小越透
BASE_COLOR_RGB = (158, 39, 26) # 铁路颜色 (深红)

# ----------------------------------------

def process_single_pair(base_path, rail_path, output_path, filename):
    """
    处理单对图片：变细 -> 透明化 -> 叠加
    """
    try:
        # 1. 加载图片
        img_base = Image.open(base_path).convert("RGBA")
        img_rail = Image.open(rail_path).convert("RGBA")

        # 2. 尺寸对齐 (以底图为准)
        if img_base.size != img_rail.size:
            img_rail = img_rail.resize(img_base.size, Image.Resampling.LANCZOS)

        # 3. 🔥 核心处理：变细 + 半透明 + 上色 🔥
        
        # A. 提取 Alpha 通道 (形状)
        alpha = img_rail.getchannel('A')
        
        # B. 腐蚀变细 (MinFilter)
        thinned_alpha = alpha.filter(ImageFilter.MinFilter(THIN_LEVEL))
        
        # C. 应用透明度
        # 将 Alpha 值乘以 OPACITY 系数
        transparent_alpha = thinned_alpha.point(lambda p: int(p * OPACITY))
        
        # D. 创建新的彩色图层
        # 创建一个全透明底
        new_rail_layer = Image.new("RGBA", img_base.size, (*BASE_COLOR_RGB, 0))
        # 创建纯色填充层
        solid_color = Image.new("RGBA", img_base.size, (*BASE_COLOR_RGB, 255))
        # 使用处理好的 Alpha 通道作为蒙版进行填充
        new_rail_layer.paste(solid_color, (0, 0), mask=transparent_alpha)

        # 4. 合成
        final_img = Image.alpha_composite(img_base, new_rail_layer)

        # 5. 保存
        final_img.save(output_path)
        print(f"  ✅ 成功: {filename}")
        return True

    except Exception as e:
        print(f"  ❌ 失败 {filename}: {e}")
        return False

def main():
    # 1. 创建输出目录
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    
    print(f"🚀 启动批量混合引擎")
    print(f"📂 底图目录: {BASE_DIR}")
    print(f"📂 铁路目录: {RAIL_DIR}")
    print(f"⚙️ 参数: 变细={THIN_LEVEL} | 透明度={OPACITY} | 颜色={BASE_COLOR_RGB}")
    print("-" * 50)

    # 2. 获取所有底图文件
    if not os.path.exists(BASE_DIR):
        print("❌ 错误: 底图目录不存在")
        return

    base_files = [f for f in os.listdir(BASE_DIR) if f.endswith(".png")]
    
    success_count = 0
    skip_count = 0

    # 3. 遍历处理
    for filename in base_files:
        # 假设文件名是 "beijing.png"
        city_id = os.path.splitext(filename)[0] # 获取 "beijing"
        
        # 构建路径
        base_path = os.path.join(BASE_DIR, filename)
        
        # 假设铁路图层的命名规则是 "{city_id}_rail.png" (例如 "beijing_rail.png")
        rail_filename = f"{city_id}_rail.png"
        rail_path = os.path.join(RAIL_DIR, rail_filename)
        
        output_path = os.path.join(OUTPUT_DIR, filename)

        # 检查对应的铁路文件是否存在
        if os.path.exists(rail_path):
            if process_single_pair(base_path, rail_path, output_path, filename):
                success_count += 1
        else:
            print(f"  ⚠️ 跳过: 找不到对应的铁路文件 ({rail_filename})")
            skip_count += 1

    print("-" * 50)
    print(f"🎉 批量处理完成！")
    print(f"✅ 成功: {success_count} 张")
    print(f"⏩ 跳过: {skip_count} 张")
    print(f"📂 结果保存在: {OUTPUT_DIR}")

if __name__ == "__main__":
    main()