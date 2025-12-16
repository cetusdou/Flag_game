# 代码组织结构文档

## 项目结构

```
Flag_Game/
├── index.html              # 主HTML文件
├── script.js              # 已废弃（仅保留文档说明）
├── style.css              # 已废弃（样式已模块化）
│
├── js/                     # JavaScript模块
│   ├── main.js            # 应用入口
│   ├── data-manager.js    # 数据加载和管理
│   ├── game-state.js      # 游戏状态管理
│   ├── game-engine.js     # 游戏核心逻辑
│   ├── option-generator.js # 选项生成
│   ├── ui-controller.js   # UI控制
│   ├── compendium.js      # 知识图鉴
│   ├── map-handler.js     # 地图功能
│   ├── leaderboard.js     # 排行榜
│   ├── modal-handler.js   # 弹窗处理
│   ├── share-card.js      # 分享卡片
│   ├── random-utils.js    # 随机数工具
│   └── text-utils.js      # 文本处理工具
│
├── css/                    # 样式模块
│   ├── base.css           # 基础样式、全局设置、动画
│   ├── components.css     # 组件样式（卡片、按钮、布局）
│   ├── game.css           # 游戏界面样式
│   ├── compendium.css     # 图鉴样式
│   └── modal.css          # 弹窗样式
│
├── data/                   # 数据文件
│   ├── countries.json
│   ├── china_plates.json
│   ├── china_city_networks.json
│   ├── f1_tracks_final.json
│   ├── football_clubs_hardcore.json
│   ├── world_name_map.json
│   └── countries_wiki_extra.json
│
├── assets/                 # 资源文件
│   ├── flags/             # 国旗图片
│   ├── shapes/            # 国家形状SVG
│   ├── f1_tracks/         # F1赛道SVG
│   ├── football_clubs_png/ # 足球俱乐部Logo
│   ├── city_networks/     # 城市路网图片
│   └── libs/              # 第三方库和资源
│
└── utils/                  # 工具文件（部分已废弃）
    ├── random.js          # 已废弃（功能已合并到 js/random-utils.js）
    └── translations.js   # 已废弃（翻译已合并到 countries.json）
```

## 模块说明

### 核心模块

#### `js/data-manager.js`
- **职责**: 数据加载和存储
- **功能**: 
  - 加载所有JSON数据文件
  - 管理 `window.GameData` 全局数据对象
  - 提供 `initGameData()` 初始化函数

#### `js/game-state.js`
- **职责**: 游戏状态管理
- **功能**:
  - 管理 `window.GameState` 全局状态对象
  - 存储当前游戏范围、模式、题目池、分数等

#### `js/game-engine.js`
- **职责**: 游戏核心逻辑
- **功能**:
  - `startGame()`: 开始游戏
  - `nextRound()`: 下一题
  - `checkAnswer()`: 检查答案
  - `startSprintCountdown()`: 极速冲刺倒计时
  - `initDataReferences()`: 初始化数据引用
  - `syncStateToGameState()`: 同步状态到GameState

#### `js/option-generator.js`
- **职责**: 选项生成逻辑
- **功能**:
  - `generateOptions()`: 根据游戏模式生成选项
  - `getOptionDisplayText()`: 获取选项显示文本

### UI模块

#### `js/ui-controller.js`
- **职责**: 界面切换和菜单控制
- **功能**:
  - `showView()`: 切换视图
  - `enterGameScope()`: 进入游戏范围（世界/中国/体育）
  - `enterFootballSubMenu()`: 进入足球子菜单
  - `enterSprintSubMenu()`: 进入极速冲刺子菜单
  - `enableBtn()` / `disableBtn()`: 启用/禁用按钮

#### `js/modal-handler.js`
- **职责**: 弹窗处理
- **功能**:
  - PK模式种子输入弹窗
  - 错误提示弹窗
  - 图片放大弹窗

#### `js/compendium.js`
- **职责**: 知识图鉴功能
- **功能**:
  - `openCompendium()`: 打开图鉴
  - `filterCompendium()`: 过滤图鉴
  - `showDetail()`: 显示详情
  - `toggleWikiInfo()`: 切换Wiki信息

#### `js/map-handler.js`
- **职责**: 地图显示和交互
- **功能**:
  - `initEChartsMap()`: 初始化ECharts地图
  - `openMap()`: 打开地图
  - `closeMap()`: 关闭地图

#### `js/share-card.js`
- **职责**: 分享卡片生成
- **功能**:
  - `generateShareCard()`: 生成分享卡片
  - `downloadShareCard()`: 下载分享卡片

### 工具模块

#### `js/random-utils.js`
- **职责**: 随机数生成和数组打乱
- **功能**:
  - `mulberry32()`: Mulberry32伪随机数生成器（用于可重复随机序列）
  - `shuffleArray()`: Fisher-Yates洗牌算法

#### `js/text-utils.js`
- **职责**: 文本处理工具
- **功能**:
  - `separateLanguages()`: 分离连在一起的语言名称
  - `separateCities()`: 分离城市名称
  - `separateScripts()`: 分离文字系统

#### `js/leaderboard.js`
- **职责**: 排行榜和历史记录
- **功能**:
  - `saveGameRecord()`: 保存游戏记录
  - `showRank()`: 显示排行榜
  - `clearRecords()`: 清除记录
  - `switchRankTab()`: 切换排行榜标签页

### 入口模块

#### `js/main.js`
- **职责**: 应用初始化入口
- **功能**:
  - `initGame()`: 初始化游戏
  - 防止重复初始化

## 代码规范

### 命名规范
- **函数**: 驼峰命名（camelCase），如 `startGame`, `checkAnswer`
- **变量**: 驼峰命名（camelCase），如 `currentScope`, `questionPool`
- **常量**: 全大写下划线（UPPER_SNAKE_CASE），如 `MAX_QUESTIONS`
- **全局对象**: 首字母大写（PascalCase），如 `GameState`, `GameData`

### 注释规范
- 每个模块文件顶部使用 `// ============================================================================` 分隔符
- 每个函数使用 JSDoc 风格注释（`@param`, `@returns`）
- 复杂逻辑添加行内注释说明

### 模块暴露
- 所有需要跨模块使用的函数/变量通过 `window` 对象暴露
- 例如: `window.startGame = startGame;`

## 已废弃文件

### `script.js`
- **状态**: 已废弃
- **说明**: 所有功能已迁移到独立模块，保留此文件仅用于文档说明

### `style.css`
- **状态**: 已废弃
- **说明**: 所有样式已迁移到模块化CSS文件（`css/base.css`, `css/components.css` 等）

### `utils/random.js`
- **状态**: 已废弃
- **说明**: 功能已合并到 `js/random-utils.js`

### `utils/translations.js`
- **状态**: 已废弃
- **说明**: 翻译数据已合并到 `data/countries.json` 中的 `capital_cn` 字段

## 数据流

```
用户操作
  ↓
UI Controller (ui-controller.js)
  ↓
Game Engine (game-engine.js)
  ↓
Option Generator (option-generator.js)
  ↓
Game State (game-state.js)
  ↓
Data Manager (data-manager.js)
  ↓
GameData / GameState (全局对象)
```

## 依赖关系

```
main.js
  ↓
data-manager.js → GameData
  ↓
game-state.js → GameState
  ↓
ui-controller.js
  ↓
game-engine.js → 依赖 GameData, GameState
  ↓
option-generator.js → 依赖 GameData, GameState
  ↓
compendium.js → 依赖 GameData, GameState
  ↓
map-handler.js → 依赖 GameData, GameState
  ↓
leaderboard.js → 依赖 GameState
  ↓
modal-handler.js → 依赖 GameState
  ↓
share-card.js → 依赖 GameState
```

## 维护建议

1. **新增功能**: 优先考虑在现有模块中添加，避免创建新文件
2. **代码复用**: 公共功能提取到工具模块（`random-utils.js`, `text-utils.js`）
3. **状态管理**: 所有游戏状态统一通过 `GameState` 管理
4. **数据访问**: 所有数据统一通过 `GameData` 访问
5. **模块通信**: 通过 `window` 对象暴露的函数进行跨模块通信

