import requests
from PIL import Image, ImageEnhance, ImageOps, ImageFilter
from io import BytesIO
import math
import os
import json
import numpy as np

# --- ⚙️ 配置区域 ---
# 1. 文件路径
IMG_DIR = "./assets/city_networks_custom_v8" # 新文件夹
DATA_DIR = "./data"
os.makedirs(IMG_DIR, exist_ok=True)
os.makedirs(DATA_DIR, exist_ok=True)
JSON_NAME = "china_city_networks_v8.json"

# 2. 🎨 你的调色板 (RGBA) - 请确保这些颜色是你想要的
PALETTE = {
    'bg':    (255, 255, 255, 255), # 背景：纯白
    'road':  (0, 77, 127, 255),    # 道路：深蓝
    'water': (160, 223, 247, 255), # 水体：浅蓝
    'green': (212, 225, 164, 255), # 绿地：浅绿
    # 铁路颜色 (如果你还需要叠加铁路的话)
    'rail':  (168, 49, 36, 255)    # 铁路：深红
}

# 3. 开关：是否需要叠加顶层铁路？
# 如果设为 False，就只输出你调试好的底图
Generate_Railway_Layer = False

# 4. 源地址 (保持不变)
URL_VOYAGER = "https://a.basemaps.cartocdn.com/rastertiles/voyager_nolabels/{z}/{x}/{y}@2x.png"
URL_DARK = "https://a.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}@2x.png"
URL_ORM = "https://a.tiles.openrailwaymap.org/signals/{z}/{x}/{y}.png"

# 5. 🇨🇳 数据源 (把你想跑的城市都加进来)
DATA_SOURCE = {
    # "直辖市": [
        # ("beijing", "北京", 39.9042, 116.4074, 12),
    #     ("shanghai", "上海", 31.2304, 121.4737, 12),
    #     ("tianjin", "天津", 39.14, 117.21, 12),
    #     ("chongqing", "重庆", 29.5630, 106.5516, 12),
    # ],
    # "特别行政区": [
    #     ("hong_kong", "香港", 22.3193, 114.1694, 13),
    #     ("macau", "澳门", 22.1987, 113.5439, 14),
    # ],
    # "河北省": [
    #     ("shijiazhuang", "石家庄", 38.0428, 114.5149, 12),
    #     ("tangshan", "唐山", 39.64, 118.15, 13),
    #     ("qinhuangdao", "秦皇岛", 39.9617, 119.6005, 13),
    #     ("handan", "邯郸", 36.61, 114.49, 12),
    #     ("baoding", "保定", 38.8738, 115.4648, 13),
    #     ("zhangjiakou", "张家口", 40.8183, 114.8859, 13),
    #     ("chengde", "承德", 40.9762, 117.9624, 13),
    #     ("cangzhou", "沧州", 38.3045, 116.8388, 13),
    #     ("langfang", "廊坊", 39.51, 116.70, 13),
    #     ("hengshui", "衡水", 37.7390, 115.6744, 13),
    # ],
    # "山西省": [
    #     ("taiyuan", "太原", 37.86, 112.56, 12),
    #     ("datong", "大同", 40.0768, 113.3001, 13),
    #     ("yuncheng", "运城", 35.05, 111.00, 13),
    #     ("linfen", "临汾", 36.0880, 111.5189, 13),
    #     ("changzhi", "长治", 36.1954, 113.1163, 13),
    # ],
    # "内蒙古自治区": [
    #     ("hohhot", "呼和浩特", 40.82, 111.67, 12),
    #     ("baotou", "包头", 40.6579, 109.8404, 13),
    #     ("ordos", "鄂尔多斯", 39.6083, 109.7816, 13),
    #     ("chifeng", "赤峰", 42.27, 118.92, 13),
    #     ("tongliao", "通辽", 43.6137, 122.2433, 13),
    #     ("hulunbuir", "呼伦贝尔", 49.2116, 119.7658, 13),
    # ],
    # "辽宁省": [
    #     ("shenyang", "沈阳", 41.8057, 123.4315, 12),
    #     ("dalian", "大连", 38.9140, 121.6147, 13),
    #     ("anshan", "鞍山", 41.1075, 122.9944, 13),
    #     ("fushun", "抚顺", 41.8655, 123.9572, 13),
    #     ("benxi", "本溪", 41.3005, 123.7716, 13),
    #     ("dandong", "丹东", 40.1242, 124.3830, 13),
    #     ("jinzhou", "锦州", 41.0951, 121.1270, 13),
    #     ("yingkou", "营口", 40.63, 122.22, 13),
    # ],
    # "吉林省": [
    #     ("changchun", "长春", 43.8671, 125.3235, 12),
    #     ("jilin", "吉林市", 43.8378, 126.5496, 13),
    #     ("siping", "四平", 43.1664, 124.3504, 13),
    #     ("yanbian", "延边(延吉)", 42.9068, 129.5076, 13), # 州府所在地
    # ],
    # "黑龙江省": [
    #     ("harbin", "哈尔滨", 45.76, 126.64, 12),
    #     ("daqing", "大庆", 46.5845, 125.1037, 13),
    #     ("qiqihar", "齐齐哈尔", 47.3543, 123.96, 13),
    #     ("mudanjiang", "牡丹江", 44.5768, 129.6331, 13),
    #     ("jiamusi", "佳木斯", 46.81, 130.36, 13),
    #     ("heihe", "黑河", 50.2443, 127.5276, 14),
    # ],
    # "江苏省": [
    #     ("nanjing", "南京", 32.0603, 118.7969, 12),
    #     ("suzhou", "苏州", 31.2989, 120.5853, 12),
    #     ("wuxi", "无锡", 31.5412, 120.3419, 12),
    #     ("xuzhou", "徐州", 34.26, 117.19, 12),
    #     ("changzhou", "常州", 31.77, 119.96, 12),
    #     ("nantong", "南通", 31.9802, 120.8943, 13),
    #     ("lianyungang", "连云港", 34.5967, 119.2215, 13),
    #     ("huai_an", "淮安", 33.6104, 119.0153, 13),
    #     ("yancheng", "盐城", 33.37, 120.18, 13),
    #     ("yangzhou", "扬州", 32.3942, 119.4129, 13),
    #     ("zhenjiang", "镇江", 32.1878, 119.4252, 13),
    #     ("taizhou_js", "泰州", 32.4555, 119.9246, 13),
    #     ("suqian", "宿迁", 33.9630, 118.2752, 13),
    # ],
    # "浙江省": [
    #     ("hangzhou", "杭州", 30.2741, 120.1551, 12),
    #     ("ningbo", "宁波", 29.8683, 121.5440, 12),
    #     ("wenzhou", "温州", 27.9943, 120.6994, 13),
    #     ("jiaxing", "嘉兴", 30.7539, 120.7522, 13),
    #     ("huzhou", "湖州", 30.8930, 120.0873, 13),
    #     ("shaoxing", "绍兴", 30.0024, 120.5861, 13),
    #     ("jinhua", "金华", 29.0790, 119.6474, 13),
    #     ("quzhou", "衢州", 28.9701, 118.8593, 13),
    #     ("zhoushan", "舟山", 29.9855, 122.2066, 13),
    #     ("taizhou_zj", "台州", 28.6564, 121.4208, 13),
    #     ("lishui", "丽水", 28.4676, 119.9218, 13),
    # ],
    # "安徽省": [
    #     ("hefei", "合肥", 31.8206, 117.2272, 12),
    #     ("wuhu", "芜湖", 31.35, 118.41, 13),
    #     ("bengbu", "蚌埠", 32.9363, 117.3397, 13),
    #     ("huainan", "淮南", 32.6255, 116.9965, 13),
    #     ("maanshan", "马鞍山", 31.6700, 118.5067, 13),
    #     ("anqing", "安庆", 30.5248, 117.0428, 13),
    #     ("huangshan", "黄山", 29.7147, 118.3375, 13),
    #     ("fuyang", "阜阳", 32.8901, 115.8142, 13),
    # ],
    # "福建省": [
    #     ("fuzhou", "福州", 26.0745, 119.2965, 12),
    #     ("xiamen", "厦门", 24.47, 118.11, 12),
    #     ("putian", "莆田", 25.4541, 119.0078, 13),
    #     ("sanming", "三明", 26.2634, 117.6386, 13),
    #     ("quanzhou", "泉州", 24.8741, 118.6757, 12),
    #     ("zhangzhou", "漳州", 24.5130, 117.6473, 13),
    #     ("nanping", "南平", 27.37, 118.07, 13),
    #     ("longyan", "龙岩", 25.0916, 117.0298, 13),
    #     ("ningde", "宁德", 26.6656, 119.5479, 13),
    # ],
    # "江西省": [
    #     ("nanchang", "南昌", 28.6820, 115.8579, 12),
    #     ("jingdezhen", "景德镇", 29.2690, 117.1782, 13),
    #     ("jiujiang", "九江", 29.7051, 116.0019, 13),
    #     ("ganzhou", "赣州", 25.8311, 114.9347, 13),
    #     ("yichun", "宜春", 27.82, 114.42, 13),
    #     ("shangrao", "上饶", 28.4548, 117.9436, 13),
    # ],
    "山东省": [
    #     ("jinan", "济南", 36.68, 117.03, 12),
    #     ("qingdao", "青岛", 36.06, 120.31, 12),
    #     ("zibo", "淄博", 36.8135, 118.0550, 12),
    #     ("zaozhuang", "枣庄", 34.8105, 117.3230, 13),
    #     ("dongying", "东营", 37.4341, 118.6747, 13),
    #     ("yantai", "烟台", 37.4638, 121.4479, 13),
    #     ("weifang", "潍坊", 36.7072, 119.1617, 12),
    #     ("jining", "济宁", 35.4149, 116.5872, 13),
    #     ("taian", "泰安", 36.2002, 117.0877, 13),
    #     ("weihai", "威海", 37.5130, 122.1204, 13),
    #     ("rizhao", "日照", 35.4164, 119.5270, 13),
    #     ("linyi", "临沂", 35.0518, 118.3119, 13),
    #     ("dezhou", "德州", 37.4370, 116.370, 12),
        ("dezhou", "德州", 37.4340, 116.3574, 13),
    #     ("liaocheng", "聊城", 36.4567, 115.9855, 13),
    #     ("binzhou", "滨州", 37.3820, 117.9707, 13),
    #     ("heze", "菏泽", 35.2338, 115.4807, 13),
    ],
    # "河南省": [
    #     ("zhengzhou", "郑州", 34.75, 113.66, 12),
    #     ("kaifeng", "开封", 34.7972, 114.3076, 13),
    #     ("luoyang", "洛阳", 34.66, 112.45, 13),
    #     ("anyang", "安阳", 36.0975, 114.3925, 13),
    #     ("xinxiang", "新乡", 35.3026, 113.9268, 13),
    #     ("jiaozuo", "焦作", 35.2158, 113.2418, 13),
    #     ("xuchang", "许昌", 34.0355, 113.8526, 13),
    #     ("nanyang", "南阳", 32.9908, 112.5283, 13),
    #     ("shangqiu", "商丘", 34.4134, 115.6563, 13),
    #     ("xinyang", "信阳", 32.1469, 114.0912, 13),
    #     ("zhoukou", "周口", 33.6251, 114.6973, 13),
    # ],
    # "湖北省": [
    #     ("wuhan", "武汉", 30.5928, 114.3055, 12),
    #     ("huangshi", "黄石", 30.2007, 115.0441, 13),
    #     ("shiyan", "十堰", 32.6475, 110.7993, 13),
    #     ("yichang", "宜昌", 30.6920, 111.2865, 13),
    #     ("xiangyang", "襄阳", 32.05, 112.16, 13),
    #     ("jingmen", "荆门", 31.00, 112.17, 13),
    #     ("jingzhou", "荆州", 30.34, 112.24, 13),
    #     ("huanggang", "黄冈", 30.45, 114.89, 13),
    #     ("xianning", "咸宁", 29.8414, 114.3225, 13),
    #     ("enshi", "恩施", 30.2728, 109.4869, 13), # 州
    # ],
    # "湖南省": [
    #     ("changsha", "长沙", 28.2282, 112.9388, 12),
    #     ("zhuzhou", "株洲", 27.8274, 113.1338, 13),
    #     ("xiangtan", "湘潭", 27.8297, 112.9440, 13),
    #     ("hengyang", "衡阳", 26.8968, 112.5725, 13),
    #     ("shaoyang", "邵阳", 27.2389, 111.4693, 13),
    #     ("yueyang", "岳阳", 29.3567, 113.1289, 13),
    #     ("changde", "常德", 29.0317, 111.6985, 13),
    #     ("zhangjiajie", "张家界", 29.1170, 110.4792, 14),
    #     ("yiyang", "益阳", 28.5880, 112.3550, 13),
    #     ("chenzhou", "郴州", 25.7705, 113.0145, 13),
    #     ("huaihua", "怀化", 27.54, 109.99, 13),
    # ],
    # "广东省": [
    #     ("guangzhou", "广州", 23.1291, 113.2644, 12),
    #     ("shenzhen", "深圳", 22.5431, 114.0579, 12),
    #     ("zhuhai", "珠海", 22.2707, 113.5767, 13),
    #     ("shantou", "汕头", 23.3517, 116.6787, 13),
    #     ("foshan", "佛山", 23.0215, 113.1214, 13),
    #     ("shaoguan", "韶关", 24.8104, 113.5975, 13),
    #     ("zhanjiang", "湛江", 21.2707, 110.3594, 13),
    #     ("maoming", "茂名", 21.6620, 110.9254, 14),
    #     ("zhaoqing", "肇庆", 23.0472, 112.4651, 13),
    #     ("huizhou", "惠州", 23.1115, 114.4161, 13),
    #     ("meizhou", "梅州", 24.2886, 116.1228, 13),
    #     ("dongguan", "东莞", 23.0205, 113.7518, 12),
    #     ("zhongshan", "中山", 22.5170, 113.3928, 13),
    #     ("jiangmen", "江门", 22.5787, 113.0819, 13),
    #     ("yangjiang", "阳江", 21.8569, 111.9827, 13),
    #     ("qingyuan", "清远", 23.70, 113.04, 13),
    #     ("chaozhou", "潮州", 23.6669, 116.6300, 13),
    #     ("jieyang", "揭阳", 23.5253, 116.3725, 13),
    # ],
    # "广西壮族自治区": [
    #     ("nanning", "南宁", 22.8170, 108.3665, 12),
    #     ("liuzhou", "柳州", 24.3255, 109.4126, 13),
    #     ("guilin", "桂林", 25.2345, 110.1800, 13),
    #     ("wuzhou", "梧州", 23.4769, 111.2791, 13),
    #     ("beihai", "北海", 21.4812, 109.1192, 13),
    #     ("fangchenggang", "防城港", 21.6865, 108.3538, 13),
    #     ("yulin_gx", "玉林", 22.6372, 110.1652, 13),
    # ],
    # "海南省": [
    #     ("haikou", "海口", 19.99, 110.28, 12),
    #     ("sanya", "三亚", 18.2528, 109.5120, 13),
    #     ("sansha", "三沙(永兴岛)", 16.8377, 112.3386, 15),
    #     ("danzhou", "儋州", 19.5225, 109.5768, 13),
    # ],
    # "四川省": [
    #     ("chengdu", "成都", 30.6579, 104.0668, 12),
    #     ("zigong", "自贡", 29.3392, 104.7784, 13),
    #     ("panzhihua", "攀枝花", 26.5823, 101.7186, 13),
    #     ("luzhou", "泸州", 28.87, 105.44, 13),
    #     ("deyang", "德阳", 31.1279, 104.3986, 13),
    #     ("mianyang", "绵阳", 31.4674, 104.7578, 13),
    #     ("guangyuan", "广元", 32.4417, 105.8433, 13),
    #     ("suining", "遂宁", 30.5328, 105.5929, 13),
    #     ("neijiang", "内江", 29.5802, 105.0584, 13),
    #     ("leshan", "乐山", 29.56, 103.76, 13),
    #     ("nanchong", "南充", 30.81, 106.12, 13),
    #     ("yibin", "宜宾", 28.7525, 104.6432, 13),
    #     ("dazhou", "达州", 31.2096, 107.4680, 13),
    #     ("xichang", "西昌(凉山)", 27.8932, 102.2662, 13),
    # ],
    # "贵州省": [
    #     ("guiyang", "贵阳", 26.58, 106.70, 12),
    #     ("liupanshui", "六盘水", 26.5926, 104.8302, 13),
    #     ("zunyi", "遵义", 27.7050, 106.9270, 13),
    #     ("anshun", "安顺", 26.2530, 105.9462, 13),
    #     ("bijie", "毕节", 27.3019, 105.2863, 13),
    #     ("tongren", "铜仁", 27.7172, 109.1899, 13),
    # ],
    # "云南省": [
    #     ("kunming", "昆明", 25.04, 102.72, 12),
    #     ("qujing", "曲靖", 25.4899, 103.7978, 13),
    #     ("yuxi", "玉溪", 24.3520, 102.5439, 13),
    #     ("baoshan", "保山", 25.1118, 99.1618, 13),
    #     ("lijiang", "丽江", 26.8550, 100.2277, 14),
    #     ("jinghong", "景洪(西双版纳)", 22.0017, 100.7979, 14),
    #     ("dali", "大理", 25.6065, 100.2676, 13),
    #     ("ruili", "瑞丽(德宏)", 24.0125, 97.8519, 14),
    #     ("shangrila", "香格里拉(迪庆)", 27.8288, 99.7072, 14),
    # ],
    # "西藏自治区": [
    #     ("lhasa", "拉萨", 29.6525, 91.13, 13),
    #     ("shigatse", "日喀则", 29.2675, 88.8752, 14),
    #     ("nyingchi", "林芝", 29.6453, 94.3615, 14),
    # ],
    # "陕西省": [
    #     ("xi_an", "西安", 34.3416, 108.9398, 12),
    #     ("tongchuan", "铜川", 34.90, 108.90, 13),
    #     ("baoji", "宝鸡", 34.3619, 107.2373, 13),
    #     ("xianyang", "咸阳", 34.3296, 108.7089, 13),
    #     ("weinan", "渭南", 34.4994, 109.5089, 13),
    #     ("yanan", "延安", 36.5854, 109.4897, 14),
    #     ("hanzhong", "汉中", 33.0676, 107.0236, 13),
    #     ("yulin_sx", "榆林", 38.2853, 109.7347, 13),
    #     ("ankang", "安康", 32.6847, 109.0292, 13),
    # ],
    # "甘肃省": [
    #     ("lanzhou", "兰州", 36.0611, 103.8343, 12),
    #     ("jiayuguan", "嘉峪关", 39.7731, 98.2891, 13),
    #     ("tianshui", "天水", 34.5808, 105.7249, 13),
    #     ("wuwei", "武威", 37.9283, 102.6371, 13),
    #     ("zhangye", "张掖", 38.9259, 100.4498, 13),
    #     ("jiuquan", "酒泉", 39.7321, 98.4942, 13),
    #     ("qingyang", "庆阳", 35.7383, 107.6326, 13),
    # ],
    # "青海省": [
    #     ("xining", "西宁", 36.64, 101.76, 13),
    #     ("haidong", "海东", 36.5029, 102.1033, 13),
    #     ("golmud", "格尔木", 36.4023, 94.9032, 13),
    # ],
    # "宁夏回族自治区": [
    #     ("yinchuan", "银川", 38.4872, 106.2309, 12),
    #     ("shizuishan", "石嘴山", 39.0131, 106.3830, 13),
    #     ("wuzhong", "吴忠", 37.9975, 106.1982, 13),
    #     ("zhongwei", "中卫", 37.5136, 105.1896, 13),
    # ],
    # "新疆维吾尔自治区": [
    #     ("urumqi", "乌鲁木齐", 43.8256, 87.6168, 12),
    #     ("karamay", "克拉玛依", 45.6032, 84.8694, 13),
    #     ("turpan", "吐鲁番", 42.97, 89.25, 14),
    #     ("hami", "哈密", 42.8185, 93.5151, 13),
    #     ("changji", "昌吉", 44.0131, 87.3040, 13),
    #     ("korla", "库尔勒", 41.7641, 86.1453, 13),
    #     ("aksu", "阿克苏", 41.1687, 80.2606, 13),
    #     ("kashgar", "喀什", 39.4704, 75.9898, 14),
    #     ("hotan", "和田", 37.1141, 79.9222, 13),
    #     ("yining", "伊宁", 43.91, 81.28, 13),
    # ],
    # "台湾省": [
    #     ("taipei", "台北", 25.05, 121.52, 13),
    #     ("kaohsiung", "高雄", 22.6273, 120.3014, 13),
    #     ("taichung", "台中", 24.1477, 120.6736, 13),
    #     ("tainan", "台南", 22.9997, 120.2270, 13),
    #     ("hualien", "花莲", 23.9769, 121.6068, 13),
    # ],
}

# --- 🧮 工具函数 ---
def latlon_to_tile(lat, lon, zoom):
    n = 2.0 ** zoom
    xtile = int((lon + 180.0) / 360.0 * n)
    ytile = int((1.0 - math.log(math.tan(math.radians(lat)) + (1 / math.cos(math.radians(lat)))) / math.pi) / 2.0 * n)
    return xtile, ytile

def download_image(url):
    try:
        headers = {'User-Agent': 'Mozilla/5.0'}
        if "openrailwaymap" in url: headers['Referer'] = 'https://www.openrailwaymap.org/'
        r = requests.get(url, headers=headers, timeout=10)
        if r.status_code == 200: return Image.open(BytesIO(r.content)).convert("RGBA")
    except: pass
    return None

# ==========================================
# 🔥🔥🔥 核心：你的定制合成算法 🔥🔥🔥
# ==========================================
def composite_user_map(img_voyager, img_dark):
    """
    完全使用用户提供的 Numpy 阈值逻辑进行底图合成
    """
    # 准备工作
    full_dark = img_dark
    full_voyager = img_voyager
    width, height = full_dark.size
    
    # --- 你的代码开始 ---
    
    # 1. 增强 Dark Map 对比度
    enhancer = ImageEnhance.Contrast(full_dark)
    enhanced_full_dark = enhancer.enhance(10)

    # 2. 准备数组
    arr_v = np.array(full_voyager) # 全彩源
    # arr_d = np.array(full_dark)  # 原代码没用这个，注释掉

    # 🔥 第一步：创建画布，默认全涂成道路颜色 (深蓝)
    # 使用 uint8 类型以匹配图像数据
    final_arr = np.full((height, width, 4), PALETTE['road'], dtype=np.uint8)

    # 🔥 第二步：利用 Dark Map 挖出背景
    # 阈值 80
    array_img_d = np.array(enhanced_full_dark)
    brightness_d = np.mean(array_img_d[:,:,:3], axis=2)
    mask_bg = (brightness_d < 80)
    final_arr[mask_bg] = PALETTE['bg']

    # 🔥 第三步：利用 Voyager Map 覆盖绿地 (你的定制阈值)
    mask_green = (arr_v[:,:,1] > 170)&(arr_v[:,:,1] < 250) &(arr_v[:,:,0] < 240)&(arr_v[:,:,0] > 170) & (arr_v[:,:,2] < 240)& (arr_v[:,:,2] > 150)&(arr_v[:,:,0]<arr_v[:,:,1])
    final_arr[mask_green] = PALETTE['green']

    # 🔥 第四步：利用 Voyager Map 覆盖水体 (你的定制阈值)
    mask_water = (arr_v[:,:,0] > 190)&(arr_v[:,:,0]<220) & (arr_v[:,:,1] > 210) & (arr_v[:,:,1] < 240)&(arr_v[:,:,2] > 220)&(arr_v[:,:,2]<250)
    final_arr[mask_water] = PALETTE['water']

    # 转回 PIL 图片
    base_map = Image.fromarray(final_arr)
    
    # --- 你的代码结束 ---
    
    return base_map

# --- 🚂 铁路叠加层 ---
def overlay_railway(base_map, img_rail):
    if img_rail and Generate_Railway_Layer:
        # 尺寸对齐
        if img_rail.size != base_map.size:
            img_rail = img_rail.resize(base_map.size, Image.LANCZOS)
        # 腐蚀变细
        alpha = img_rail.getchannel('A')
        thinned_alpha = alpha.filter(ImageFilter.MinFilter(3))
        # 染色
        rail_layer = Image.new("RGBA", base_map.size, PALETTE['rail'])
        rail_layer.putalpha(thinned_alpha)
        # 合成
        base_map = Image.alpha_composite(base_map, rail_layer)
    return base_map

# --- 🔄 批量生成主函数 ---
def generate_map(cid, name, lat, lon, zoom):
    # 强制 Zoom 策略 (保证ORM有数据，且视野够大)
    final_zoom = zoom
    range_offset = 1
    
    center_x, center_y = latlon_to_tile(lat, lon, final_zoom)
    TILE_SIZE = 512
    width = TILE_SIZE * (range_offset * 2 + 1)
    height = TILE_SIZE * (range_offset * 2 + 1)
    
    # 创建大画布
    full_voyager = Image.new('RGBA', (width, height))
    full_dark = Image.new('RGBA', (width, height))
    full_rail = Image.new('RGBA', (width, height)) if Generate_Railway_Layer else None
    
    print(f"🎨 [V8.0] 正在使用定制阈值渲染: {name} (z{final_zoom})...", end="")
    
    # 下载循环
    for dx in range(-range_offset, range_offset + 1):
        for dy in range(-range_offset, range_offset + 1):
            xtile = center_x + dx
            ytile = center_y + dy
            px = (dx + range_offset) * TILE_SIZE
            py = (dy + range_offset) * TILE_SIZE
            
            # 下载 Voyager
            img_v = download_image(URL_VOYAGER.format(z=final_zoom, x=xtile, y=ytile))
            if img_v:
                if img_v.size != (TILE_SIZE, TILE_SIZE): img_v = img_v.resize((TILE_SIZE, TILE_SIZE), Image.LANCZOS)
                full_voyager.paste(img_v, (px, py))
            
            # 下载 Dark
            img_d = download_image(URL_DARK.format(z=final_zoom, x=xtile, y=ytile))
            if img_d:
                if img_d.size != (TILE_SIZE, TILE_SIZE): img_d = img_d.resize((TILE_SIZE, TILE_SIZE), Image.LANCZOS)
                full_dark.paste(img_d, (px, py))

            # 下载 Rail (如果需要)
            if Generate_Railway_Layer:
                img_r = download_image(URL_ORM.format(z=final_zoom, x=xtile, y=ytile))
                if img_r:
                     if img_r.size != (TILE_SIZE, TILE_SIZE): img_r = img_r.resize((TILE_SIZE, TILE_SIZE), Image.LANCZOS)
                     full_rail.paste(img_r, (px, py))

    # 🔥 1. 调用你的定制合成算法生成底图
    final_image = composite_user_map(full_voyager, full_dark)
    
    # 🔥 2. (可选) 叠加铁路层
    if Generate_Railway_Layer:
        final_image = overlay_railway(final_image, full_rail)
    
    # 缩放保存 (防止图片过大)
    if final_image.width > 1600:
        final_image = final_image.resize((1536, 1536), Image.LANCZOS)
        
    save_path = f"{IMG_DIR}/{cid}.png"
    final_image.convert("RGB").save(save_path, quality=95)
    print(" ✅ 完成")
    return final_zoom

# --- 主程序 ---
print(f"🚀 启动 V8.0 用户定制阈值版引擎...")
json_output = []

for group_name, cities in DATA_SOURCE.items():
    print(f"\n📂 处理组: {group_name}")
    for item in cities:
        cid, name, lat, lon, initial_zoom = item
        if os.path.exists(f"{IMG_DIR}/{cid}.png"):
            continue
        else:
            used_zoom = generate_map(cid, name, lat, lon, initial_zoom)
            json_output.append({
                "id": cid, "name": name, 
                "img": f"{IMG_DIR}/{cid}.png",
                "lat": lat, "lon": lon, "zoom": used_zoom
            })
            with open(f"{DATA_DIR}/{JSON_NAME}", "w", encoding='utf-8') as f:
                json.dump(json_output, f, ensure_ascii=False, indent=2)
    
print(f"\n🎉 全部完成！输出目录: {IMG_DIR}")