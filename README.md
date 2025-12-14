# 🌍 地理大师 - 项目结构说明

## 📁 项目目录结构

```
Flag_Game/
├── index.html              # 主HTML文件
├── style.css              # 样式文件
├── script.js              # 主JavaScript文件（已模块化重构）
│
├── assets/                # 静态资源
│   ├── flags/            # 国旗图片
│   ├── shapes/           # 国家版图SVG
│   └── libs/             # 第三方库（ECharts等）
│
├── data/                  # 数据文件
│   ├── countries.json    # 国家数据
│   ├── china_plates.json # 中国车牌数据
│   └── world_name_map.json # 世界名称映射
│
├── config/                # 配置文件
│   └── capital-translations.js # 首都翻译映射表
│
├── utils/                 # 工具函数
│   ├── translations.js   # 翻译工具
│   └── random.js        # 随机数工具
│
├── js/                    # JavaScript模块（可选，用于未来扩展）
│   ├── data-manager.js  # 数据管理模块
│   ├── game-engine.js   # 游戏引擎模块
│   ├── ui-controller.js  # UI控制器模块
│   ├── map-handler.js    # 地图处理模块
│   └── main.js          # 主入口文件
│
└── scraper.py            # Python数据抓取脚本
```

## 🏗️ 代码架构

### 核心模块划分

1. **数据层** (`data/`)
   - 存储所有游戏数据（国家、车牌等）
   - JSON格式，便于维护和扩展

2. **配置层** (`config/`)
   - 首都翻译映射表
   - 游戏配置参数

3. **工具层** (`utils/`)
   - 翻译工具函数
   - 随机数生成工具
   - 通用工具函数

4. **业务逻辑层** (`script.js` 内部模块)
   - 数据管理：加载和处理游戏数据
   - 游戏引擎：游戏逻辑、题目生成、答案检查
   - UI控制：视图切换、界面更新
   - 地图功能：ECharts地图集成

## 🔧 主要功能模块

### 1. 数据管理
- `initGame()`: 初始化游戏数据
- 数据加载和预处理
- 首都翻译处理

### 2. 游戏引擎
- `startGame()`: 开始游戏
- `nextRound()`: 下一题
- `checkAnswer()`: 检查答案
- 题目池生成和管理

### 3. UI控制
- `showView()`: 视图切换
- `enterGameScope()`: 进入游戏范围选择
- `updateGameUI()`: 更新游戏界面
- `renderOptions()`: 渲染选项按钮

### 4. 地图功能
- `initEChartsMap()`: 初始化地图
- `openMap()`: 打开地图
- `closeMap()`: 关闭地图

## 📝 代码组织原则

1. **模块化**: 功能按模块划分，职责清晰
2. **可维护性**: 代码结构清晰，易于理解和修改
3. **可扩展性**: 便于添加新功能和新模式
4. **性能优化**: 数据预加载，减少运行时计算

## 🚀 使用说明

1. 使用本地服务器打开（推荐使用 Live Server 或 Python HTTP Server）
2. 确保所有资源文件路径正确
3. 浏览器控制台查看错误信息（如有）

## 🔄 未来优化方向

1. 使用 ES6 模块系统（需要构建工具）
2. 添加单元测试
3. 性能监控和优化
4. 国际化支持
5. 数据缓存机制

## 📄 许可证

本项目仅供学习和研究使用。

