# 代码重构说明

## 重构目标
解决按钮位置不断挪动、图片叠加逻辑混乱、代码可读性差的问题。

## 重构内容

### 1. 新增模块文件

#### `js/button-config.js` - 按钮配置模块
- **职责**：集中管理所有按钮的配置信息
- **内容**：
  - `BUTTON_CONFIGS` 对象：存储所有模式的按钮配置（样式、图片、图标等）
  - `getButtonConfig()` 函数：根据模式键和范围获取配置
- **优势**：
  - 配置集中管理，易于维护
  - 新增按钮只需添加配置，无需修改渲染逻辑
  - 支持条件渲染（如世界模式下的每日挑战图片）

#### `js/button-renderer.js` - 按钮渲染模块
- **职责**：负责按钮的渲染逻辑
- **函数**：
  - `clearButtonOverlays()` - 清除按钮的所有叠加元素
  - `addImageOverlay()` - 添加图片叠加
  - `createToggleSwitch()` - 创建拨动开关
  - `updateToggleLabels()` - 更新拨动开关标签样式
  - `setButtonIcon()` - 设置按钮图标
- **优势**：
  - 渲染逻辑模块化，职责清晰
  - 可复用性强
  - 易于测试和维护

### 2. 重构 `js/ui-controller.js`

#### 简化 `enableBtn()` 函数
- **之前**：200+ 行，包含大量条件判断和DOM操作
- **现在**：约30行，使用配置驱动的方式
- **改进**：
  - 从配置对象获取样式和图片信息
  - 调用渲染模块的函数处理具体逻辑
  - 代码清晰易读

#### 简化 `disableBtn()` 函数
- **之前**：20+ 行，手动清除各种元素
- **现在**：约15行，调用统一的清除函数
- **改进**：
  - 使用 `clearButtonOverlays()` 统一清除
  - 代码更简洁

### 3. 更新 `index.html`
- 添加新模块的加载顺序：
  ```html
  <script src="js/button-config.js"></script>
  <script src="js/button-renderer.js"></script>
  <script src="js/ui-controller.js"></script>
  ```

## 重构优势

### 1. 可维护性提升
- 配置与逻辑分离，修改按钮样式只需修改配置
- 代码结构清晰，易于理解

### 2. 可扩展性提升
- 新增按钮模式只需在 `BUTTON_CONFIGS` 中添加配置
- 无需修改渲染逻辑

### 3. 可读性提升
- `enableBtn()` 函数从200+行缩减到30行
- 逻辑清晰，一目了然

### 4. 代码复用
- 渲染函数可在多处复用
- 减少重复代码

## 使用示例

### 添加新按钮配置
在 `js/button-config.js` 的 `BUTTON_CONFIGS` 中添加：
```javascript
'new_mode': {
    style: 'card-blue',
    image: {
        src: 'assets/libs/new-image.jpg',
        alt: 'New Mode',
        classes: ['card-new', 'new-card-overlay']
    },
    icon: '🆕',
    hideIcon: true
}
```

### 使用配置
在 `js/ui-controller.js` 中调用：
```javascript
enableBtn('btn-mode-1', 'new_mode', '🆕', '新模式', '新模式描述', '10');
```

## 注意事项

1. **加载顺序**：确保 `button-config.js` 和 `button-renderer.js` 在 `ui-controller.js` 之前加载
2. **配置完整性**：新增模式时确保配置完整，否则会使用默认配置
3. **范围处理**：中国模式下的 `mode_1` 使用特殊配置 `mode_1_china`

## 后续优化建议

1. 可以考虑将按钮布局配置也提取到配置文件中
2. 可以添加配置验证机制，确保配置正确
3. 可以考虑使用 TypeScript 增强类型安全

