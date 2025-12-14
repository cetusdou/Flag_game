import requests
from bs4 import BeautifulSoup
import json
import os
import time
import random
import re

# --- 配置 ---
DATA_DIR = "./data"
IMG_DIR = "./assets/scenic"
HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
}

os.makedirs(DATA_DIR, exist_ok=True)
os.makedirs(IMG_DIR, exist_ok=True)

# 🎯 核心题库：景点名 - 对应城市
# 手动维护这份列表能保证游戏质量，图片和简介则自动爬取
targets = {
    "故宫": "北京", "八达岭长城": "北京", "天坛": "北京", "颐和园": "北京",
    "外滩": "上海", "东方明珠": "上海", "豫园": "上海",
    "兵马俑": "西安", "大雁塔": "西安", "大唐不夜城": "西安", "华清池": "西安",
    "西湖": "杭州", "雷峰塔": "杭州", "千岛湖": "杭州",
    "拙政园": "苏州", "周庄古镇": "苏州", "寒山寺": "苏州",
    "夫子庙": "南京", "中山陵": "南京",
    "广州塔": "广州", "长隆野生动物世界": "广州",
    "洪崖洞": "重庆", "磁器口古镇": "重庆",
    "都江堰": "成都", "宽窄巷子": "成都", "武侯祠": "成都",
    "大熊猫繁育研究基地": "成都", "乐山大佛": "乐山",
    "黄山风景区": "黄山", "宏村": "黄山",
    "泰山": "泰安", "趵突泉": "济南",
    "鼓浪屿": "厦门", "武夷山": "南平",
    "漓江": "桂林", "象山景区": "桂林",
    "张家界国家森林公园": "张家界", "天门山": "张家界", "凤凰古城": "湘西",
    "布达拉宫": "拉萨", "大昭寺": "拉萨",
    "莫高窟": "酒泉", "鸣沙山月牙泉": "酒泉",
    "九寨沟": "阿坝", "黄龙风景区": "阿坝",
    "平遥古城": "晋中", "云冈石窟": "大同",
    "龙门石窟": "洛阳", "少林寺": "郑州",
    "圣索菲亚大教堂": "哈尔滨", "中央大街": "哈尔滨",
    "大巴扎": "乌鲁木齐", "喀纳斯": "阿勒泰"
}

final_db = []
count = 0

print(f"🚀 开始抓取 {len(targets)} 个著名景点...")

for name, city in targets.items():
    # 检查本地是否已有图片
    # 我们用 md5 或简单替换来命名图片，这里简单用名字
    file_name = name + ".jpg"
    save_path = os.path.join(IMG_DIR, file_name)
    
    # 构造数据条目
    entry = {
        "id": name,          # ID
        "name": name,        # 题目(景点名)
        "city": city,        # 答案(城市名)
        "desc": "暂无简介",   # 简介
        "img": f"./assets/scenic/{file_name}"
    }

    # 如果图片已存在，跳过下载，但要确保数据在json里
    if os.path.exists(save_path):
        # print(f"⏩ {name} 已存在")
        final_db.append(entry)
        continue

    try:
        url = f"https://baike.baidu.com/item/{name}"
        # print(f"🌐 正在抓取: {name} ...")
        
        time.sleep(random.uniform(0.5, 1.5)) # 礼貌延时
        
        resp = requests.get(url, headers=HEADERS, timeout=10)
        if resp.status_code != 200: continue
        
        soup = BeautifulSoup(resp.content, 'html.parser')
        
        # 1. 抓取简介 (meta description 通常最干净)
        desc_meta = soup.find('meta', attrs={'name': 'description'})
        if desc_meta:
            entry['desc'] = desc_meta['content']

        # 2. 抓取封面图
        # 百度百科的封面图通常在 .summary-pic img 里
        pic_div = soup.find('div', class_='summary-pic')
        img_url = ""
        
        if pic_div:
            img_tag = pic_div.find('img')
            if img_tag:
                img_url = img_tag.get('src')
        
        # 如果 summary-pic 没找到，尝试找 og:image
        if not img_url:
            og_img = soup.find('meta', property='og:image')
            if og_img: img_url = og_img['content']

        if img_url:
            # 下载图片
            img_resp = requests.get(img_url, headers=HEADERS, timeout=10)
            with open(save_path, 'wb') as f:
                f.write(img_resp.content)
            print(f"✅ 下载成功: {name}")
        else:
            print(f"⚠️ 未找到图片: {name}")
            # 使用默认图或跳过? 暂且保留条目
            
        final_db.append(entry)
        count += 1

    except Exception as e:
        print(f"❌ 失败 {name}: {e}")

# 保存数据库
with open(f"{DATA_DIR}/scenic_spots.json", "w", encoding='utf-8') as f:
    json.dump(final_db, f, ensure_ascii=False, indent=2)

print(f"\n🎉 抓取完成！图片保存在 {IMG_DIR}")
print(f"💾 数据保存在 {DATA_DIR}/scenic_spots.json")