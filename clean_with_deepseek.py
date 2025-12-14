import json
import os
from openai import OpenAI

# --- ⚙️ 配置 ---
# 请替换为你的 DeepSeek API Key
API_KEY = "sk-e30c53b48e4d4da1ae7055862bdade06" 
BASE_URL = "https://api.deepseek.com" # DeepSeek 官方地址

# 输入文件 (我们之前爬到的原始数据，或者你可以把爬虫改造成只抓生文本)
# 这里假设我们直接读取之前生成的 countries.json 和 countries_wiki_extra.json
INPUT_FILE_BASIC = "./data/countries.json"
INPUT_FILE_EXTRA = "./data/countries_wiki_extra.json"
OUTPUT_FILE = "./data/countries_final_llm.json"

# 初始化客户端
client = OpenAI(api_key=API_KEY, base_url=BASE_URL)

def clean_data_with_llm(country_name, raw_data_str, mode="infobox"):
    """
    mode="infobox": 从杂乱文本中提取 GDP、人口等
    mode="landmarks": 从一堆图片标题中筛选出真正的景点
    """
    
    if mode == "infobox":
        system_prompt = """
        你是一个数据提取专家。我将给你一段关于某个国家的维基百科原始文本（Infobox部分）。
        请提取以下字段，并严格以 JSON 格式返回，不要包含 markdown 代码块。
        如果找不到某个字段，请填 "N/A"。
        
        需要提取的字段：
        - capital (首都)
        - gdp_nominal_total (名义GDP总量，保留数字和单位，如 "$18 trillion")
        - population (人口，保留数字和单位)
        - currency (货币名称，如 "Euro (€)")
        - area (国土面积)
        - official_languages (官方语言)
        
        注意：
        1. 去除所有引用标签如 [1][a]。
        2. 只要最新的数据。
        """
    else: # landmarks
        system_prompt = f"""
        你是一个地理旅游专家。我将给你一个关于 {country_name} 的图片标题列表。
        请从中筛选出最著名的 4-6 个**旅游景点**或**地标建筑**。
        
        规则：
        1. **反剧透**：绝对不要包含 "{country_name}" 这个国家的名字。如果标题是 "View of {country_name}"，请直接丢弃。
        2. **排除干扰**：不要包含地图(Map)、国旗(Flag)、国徽、人物(President)、军事(Army)相关的条目。
        3. **格式化**：只保留景点的名字，去掉 "View of", "in [City]" 等修饰语。
        4. 返回格式：一个纯 JSON 字符串数组，如 ["Eiffel Tower", "Louvre Museum"]。
        """

    try:
        response = client.chat.completions.create(
            model="deepseek-chat", # 或 deepseek-v3
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": f"Raw Data: {raw_data_str}"}
            ],
            temperature=0.1, # 低温度保证数据准确
            response_format={ "type": "json_object" } # 强制 JSON (如果模型支持)
        )
        return response.choices[0].message.content
    except Exception as e:
        print(f"❌ LLM 调用失败: {e}")
        return None

# --- 主程序逻辑 ---
# 1. 读取我们之前爬到的 "脏数据" (或者重新爬取 raw text)
# 为了演示，我们假设你已经有了一些数据，或者我们现场构造一些
# 实际使用时，你可以修改之前的爬虫，把 soup.get_text() 直接存下来，然后用这个脚本跑

print("🚀 开始 AI 清洗...")

# 读取现有数据
with open(INPUT_FILE_EXTRA, 'r', encoding='utf-8') as f:
    wiki_db = json.load(f)

with open(INPUT_FILE_BASIC, 'r', encoding='utf-8') as f:
    basic_db = json.load(f)

# 创建结果字典
final_db = {}

# 限制测试数量，以免消耗太多 token (正式跑时去掉 [:5])
test_countries = basic_db[:3] 

for c in test_countries:
    cid = c['id']
    name = c['name_en']
    
    print(f"🤖 处理: {name} ...")
    
    # 获取之前爬到的 raw landmarks (假设你存了，或者我们现在模拟一下脏数据)
    # 如果你之前的 json 里有 'landmarks' 字段且很脏
    raw_landmarks = wiki_db.get(cid, {}).get('landmarks', [])
    
    # 如果列表为空，或者太脏，我们可以跳过
    if not raw_landmarks:
        print("  ⚠️ 无原始景点数据，跳过景点清洗")
        clean_landmarks = []
    else:
        # 调用 LLM 清洗景点
        print("  🧹 清洗景点列表...")
        landmarks_json = clean_data_with_llm(name, str(raw_landmarks), mode="landmarks")
        try:
            clean_landmarks = json.loads(landmarks_json).get('landmarks', []) 
            # 注意：LLM返回的JSON结构可能不固定，最好在 prompt 里指定 key 名，或者解析 list
            if isinstance(json.loads(landmarks_json), list):
                clean_landmarks = json.loads(landmarks_json)
            else:
                # 尝试获取 values
                data = json.loads(landmarks_json)
                clean_landmarks = list(data.values())[0] if data else []
                
            print(f"  ✅ 结果: {clean_landmarks}")
        except:
            print(f"  ❌ JSON 解析失败: {landmarks_json}")
            clean_landmarks = []

    # 保存结果
    if cid not in final_db: final_db[cid] = {}
    final_db[cid]['landmarks'] = clean_landmarks
    
    # 你也可以在这里加 Infobox 的清洗逻辑
    # clean_info = clean_data_with_llm(name, raw_infobox_text, mode="infobox")

# 保存
with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
    json.dump(final_db, f, ensure_ascii=False, indent=2)

print("\n🎉 清洗完成！")