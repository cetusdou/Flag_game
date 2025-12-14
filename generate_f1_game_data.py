# import json
# import os
# import sys
# import re

# # 修复 Windows 控制台编码问题
# if sys.platform == 'win32':
#     sys.stdout.reconfigure(encoding='utf-8')

# # 读取 f1_data.json
# data_file = "./data/f1_data.json"
# output_file = "./data/f1_tracks.json"

# print("正在读取 f1_data.json...")

# with open(data_file, 'r', encoding='utf-8') as f:
#     data = json.load(f)

# circuits = data.get('circuits', [])

# # 按赛道名称分组，保留编号最大的
# track_dict = {}

# for circuit in circuits:
#     track_id = circuit.get('id', '')
#     track_name = circuit.get('name', '')
#     track_img = circuit.get('img', '')
    
#     # 检查是否有编号（格式：name-number）
#     if '-' in track_id:
#         parts = track_id.rsplit('-', 1)  # 从右边分割，只分割一次
#         base_name = parts[0]
#         number_str = parts[1]
        
#         # 检查最后一部分是否是数字
#         if number_str.isdigit():
#             number = int(number_str)
            
#             # 如果这个赛道还没有记录，或者当前编号更大，则更新
#             if base_name not in track_dict:
#                 track_dict[base_name] = {
#                     'id': track_id,
#                     'name': track_name,
#                     'img': track_img,
#                     'number': number
#                 }
#             else:
#                 if number > track_dict[base_name]['number']:
#                     track_dict[base_name] = {
#                         'id': track_id,
#                         'name': track_name,
#                         'img': track_img,
#                         'number': number
#                     }
#         else:
#             # 如果没有数字编号，直接添加
#             track_dict[track_id] = {
#                 'id': track_id,
#                 'name': track_name,
#                 'img': track_img,
#                 'number': 0
#             }
#     else:
#         # 如果没有编号，直接添加
#         track_dict[track_id] = {
#             'id': track_id,
#             'name': track_name,
#             'img': track_img,
#             'number': 0
#         }

# # 转换为列表并按名称排序
# tracks_list = []
# for base_name, track_info in sorted(track_dict.items(), key=lambda x: x[1]['name']):
#     # 清理名称：去掉 "-数字" 后缀（如 "Adelaide-1" -> "Adelaide"）
#     clean_name = track_info['name']
#     # 匹配名称末尾的 "-数字" 模式并删除
#     import re
#     clean_name = re.sub(r'-\d+$', '', clean_name)
    
#     # 移除内部使用的 number 字段，只保留游戏需要的字段
#     track_entry = {
#         'id': track_info['id'],
#         'name': clean_name,
#         'img': track_info['img']
#     }
#     tracks_list.append(track_entry)

# # 生成游戏数据 JSON
# game_data = {
#     'version': '1.0',
#     'total': len(tracks_list),
#     'tracks': tracks_list
# }

# # 保存 JSON 文件
# with open(output_file, 'w', encoding='utf-8') as f:
#     json.dump(game_data, f, ensure_ascii=False, indent=2)

# print(f"\n成功生成 F1 赛道数据！")
# print(f"共 {len(tracks_list)} 个赛道")
# print(f"数据已保存至: {output_file}")

# # 显示前几个赛道作为示例
# print("\n前 10 个赛道示例：")
# for i, track in enumerate(tracks_list[:10], 1):
#     print(f"  {i}. {track['name']} ({track['id']})")

import json
import os
from openai import OpenAI
import time

# --- ⚙️ 配置 ---
# 🔥 填入你的 DeepSeek API Key
API_KEY = "sk-e30c53b48e4d4da1ae7055862bdade06" 
BASE_URL = "https://api.deepseek.com"

INPUT_FILE = "./data/f1_tracks_real_data.json"       # 你的原始数据(含图片)
OUTPUT_FILE = "./data/f1_tracks_final.json" # 补全后的最终数据

# --- ⚙️ 配置 ---
# 🔥 填入你的 DeepSeek API Key
API_KEY = "sk-e30c53b48e4d4da1ae7055862bdade06" 
BASE_URL = "https://api.deepseek.com"

# 输入和输出可以是同一个文件，实现“原地更新”


client = OpenAI(api_key=API_KEY, base_url=BASE_URL)

def get_track_details(track_id, track_name):
    """
    调用 DeepSeek 补全赛道地理信息
    """
    print(f"  🤖 AI 正在分析: {track_name} ({track_id}) ...", end="")
    
    prompt = f"""
    你是一个 F1 赛道数据专家。请根据赛道 ID "{track_id}" 和名称 "{track_name}"，提供以下详细信息。
    
    请严格返回 JSON 格式，包含以下字段：
    1. "name_zh": 赛道的中文标准全称 (例如 "上海国际赛车场")
    2. "country": 赛道所在的国家中文名 (例如 "中国")
    3. "city": 赛道所在的城市或地区中文名 (例如 "上海")
    4. "length": 赛道长度 (例如 "5.451 km")
    5. "corners": 弯道数量 (数字)
    6. "desc": 一句简短的中文介绍 (30字以内，描述其特点)

    如果该赛道是历史赛道或不再使用，请提供其历史上最著名版本的数据。
    """

    try:
        response = client.chat.completions.create(
            model="deepseek-chat",
            messages=[
                {"role": "system", "content": "You are a helpful F1 assistant. Output JSON only."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.1,
            response_format={ "type": "json_object" }
        )
        content = response.choices[0].message.content
        data = json.loads(content)
        print(" ✅")
        return data
    except Exception as e:
        print(f" ❌ {e}")
        return None

# --- 主程序 ---
if __name__ == "__main__":
    if not os.path.exists(INPUT_FILE):
        print(f"❌ 找不到文件: {INPUT_FILE}")
        exit()

    # 1. 读取数据
    # 优先读取 OUTPUT_FILE (如果上次跑了一半)，否则读取 INPUT_FILE
    source_file = OUTPUT_FILE if os.path.exists(OUTPUT_FILE) else INPUT_FILE
    
    with open(source_file, 'r', encoding='utf-8') as f:
        raw_data = json.load(f)

    circuits = raw_data.get("circuits", [])
    print(f"🚀 开始检查 {len(circuits)} 条赛道数据...")
    
    updated_circuits = []
    need_save = False
    
    for i, track in enumerate(circuits):
        # 🔥🔥🔥 核心判断：增量补全 🔥🔥🔥
        # 只要有 "country" 字段且不为空，就视为已完成，直接跳过
        if "country" in track and track["country"]:
            # print(f"  ⏩ 跳过已存在: {track.get('name_zh', track['name'])}")
            updated_circuits.append(track)
            continue
            
        # 只有缺失数据才请求 AI
        info = get_track_details(track['id'], track['name'])
        
        if info:
            # 更新数据
            track.update(info)
            
            # 特殊处理：保留英文名为 english_name，把 name 换成中文
            if 'english_name' not in track:
                track['english_name'] = track['name']
            track['name'] = info['name_zh']
            
            need_save = True
        
        updated_circuits.append(track)
        
        # 每处理 3 个保存一次，防止网络中断白跑
        if need_save and i % 3 == 0:
            raw_data["circuits"] = updated_circuits + circuits[i+1:] # 拼接剩余未处理的
            with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
                json.dump(raw_data, f, ensure_ascii=False, indent=2)
            print("  💾 进度已保存")

    # 最终保存
    raw_data["circuits"] = updated_circuits
    with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
        json.dump(raw_data, f, ensure_ascii=False, indent=2)

    print(f"\n🎉 补全工作结束！数据已保存至: {OUTPUT_FILE}")