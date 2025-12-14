import requests
import json
import os
import time

# --- ⚙️ 配置 ---
REPO_OWNER = "julesr0y"
REPO_NAME = "f1-circuits-svg"
# 🔥 目标路径改为 circuits/black
API_URL = f"https://api.github.com/repos/{REPO_OWNER}/{REPO_NAME}/contents/circuits/black"
RAW_BASE_URL = f"https://raw.githubusercontent.com/{REPO_OWNER}/{REPO_NAME}/master/circuits/black"

DATA_DIR = "./data"
IMG_DIR = "./assets/f1_tracks"
HEADERS = {'User-Agent': 'Mozilla/5.0'}

os.makedirs(DATA_DIR, exist_ok=True)
os.makedirs(IMG_DIR, exist_ok=True)

print(f"🚀 正在扫描 GitHub 仓库: {REPO_OWNER}/{REPO_NAME} (black folder) ...")

try:
    # 1. 调用 GitHub API 获取文件列表
    response = requests.get(API_URL, headers=HEADERS, timeout=20)
    
    if response.status_code == 403:
        print("❌ API 请求受限 (Rate Limit)。请稍后再试，或使用 VPN。")
        exit()
    elif response.status_code != 200:
        print(f"❌ 无法连接 GitHub API: {response.status_code}")
        exit()
        
    files = response.json()
    track_entries = []
    
    print(f"📋 发现 {len(files)} 个赛道文件，准备下载...")
    
    count = 0
    for file in files:
        filename = file['name']
        
        # 只处理 svg 文件
        if not filename.endswith(".svg"):
            continue
            
        # 构建下载链接
        download_url = f"{RAW_BASE_URL}/{filename}"
        save_path = os.path.join(IMG_DIR, filename)
        local_ref = f"./assets/f1_tracks/{filename}"
        
        # 简单的名字清洗
        # 例子: "monaco_1929.svg" -> "Monaco 1929"
        track_id = filename.replace(".svg", "")
        track_name = track_id.replace("_", " ").title()
        
        # 尝试下载
        if not os.path.exists(save_path):
            print(f"  ⬇️ [{count+1}/{len(files)}] 下载: {track_name} ...", end="")
            try:
                r = requests.get(download_url, headers=HEADERS, timeout=15)
                if r.status_code == 200:
                    with open(save_path, 'wb') as f:
                        f.write(r.content)
                    print(" OK")
                else:
                    print(f" ❌ 失败 {r.status_code}")
            except Exception as e:
                print(f" ❌ 出错: {e}")
        else:
            # print(f"  ⏩ 已存在: {track_name}")
            pass
            
        # 加入数据库
        track_entries.append({
            "id": track_id,
            "name": track_name,
            "img": local_ref,
            "desc": "F1 Historical Circuit" 
        })
        
        count += 1

    # --- 保存 JSON ---
    # 读取旧文件以保留车队/车手信息
    old_data = {}
    if os.path.exists(f"{DATA_DIR}/f1_data.json"):
        with open(f"{DATA_DIR}/f1_data.json", "r", encoding='utf-8') as f:
            try: old_data = json.load(f)
            except: pass
            
    final_data = {
        "circuits": track_entries,
        "teams": old_data.get("teams", []),
        "drivers": old_data.get("drivers", [])
    }
    
    with open(f"{DATA_DIR}/f1_data.json", "w", encoding='utf-8') as f:
        json.dump(final_data, f, ensure_ascii=False, indent=2)
        
    print(f"\n🎉 大功告成！共收录 {len(track_entries)} 条赛道。")
    print(f"📂 数据已保存至: {DATA_DIR}/f1_data.json")

except Exception as e:
    print(f"\n❌ 发生错误: {e}")