// ============================================================================
// 按钮渲染模块 - 负责按钮的样式、图片叠加、拨动开关等渲染逻辑
// ============================================================================

/**
 * 清除按钮的所有叠加元素和样式
 * @param {HTMLElement} btn - 按钮元素
 */
function clearButtonOverlays(btn) {
    if (!btn) return;
    
    // 移除图片叠加
    const existingImgs = btn.querySelectorAll('.game-card-overlay-image');
    existingImgs.forEach(img => img.remove());
    
    // 移除所有类型的选择器
    const toggleContainer = btn.querySelector('.city-network-toggle-container');
    if (toggleContainer) toggleContainer.remove();
    
    const footballSelector = btn.querySelector('.football-difficulty-selector-container');
    if (footballSelector) footballSelector.remove();
    
    const sprintSelector = btn.querySelector('.sprint-difficulty-selector-container');
    if (sprintSelector) sprintSelector.remove();
    
    const flagGuessSelector = btn.querySelector('.flag-guess-mode-selector-container');
    if (flagGuessSelector) flagGuessSelector.remove();
    
    // 移除所有叠加相关的类名
    const overlayClasses = [
        'card-daily', 'daily-card-overlay',
        'card-sprint', 'sprint-card-overlay',
        'card-shape', 'shape-card-overlay',
        'card-city-network', 'city-network-card-overlay',
        'card-football', 'football-card-overlay',
        'card-f1', 'f1-card-overlay',
        'card-all-compendium', 'all-compendium-card-overlay'
    ];
    btn.classList.remove(...overlayClasses);
    
    // 重置布局样式
    btn.style.display = '';
    btn.style.flexDirection = '';
    btn.style.justifyContent = '';
    btn.style.padding = '';
    btn.style.minHeight = '';
    
    // 重置文字定位和样式
    const cardContent = btn.querySelector('.card-content');
    if (cardContent) {
        cardContent.style.position = '';
        cardContent.style.top = '';
        cardContent.style.left = '';
        cardContent.style.zIndex = '';
        cardContent.style.width = '';
        cardContent.style.maxWidth = '';
        
        // 重置文字样式
        const titleEl = cardContent.querySelector('b');
        const descEl = cardContent.querySelector('small');
        if (titleEl) {
            titleEl.style.color = '';
            titleEl.style.textShadow = '';
        }
        if (descEl) {
            descEl.style.color = '';
            descEl.style.textShadow = '';
        }
    }
    
    // 重置图标和标签显示
    const iconEl = btn.querySelector('.card-icon');
    if (iconEl) iconEl.style.display = '';
    const tagEl = btn.querySelector('.card-tag');
    if (tagEl) tagEl.style.display = '';
}

/**
 * 生成渐变字符串
 * @param {object} gradientConfig - 渐变配置
 * @returns {string} CSS渐变字符串
 */
function generateGradientString(gradientConfig) {
    if (!gradientConfig || !gradientConfig.stops) return '';
    
    const stops = gradientConfig.stops.map(stop => 
        `${stop.color} ${stop.offset}`
    ).join(', ');
    
    return `linear-gradient(${gradientConfig.direction}, ${stops})`;
}

/**
 * 应用布局样式
 * @param {HTMLElement} btn - 按钮元素
 * @param {object} layoutConfig - 布局配置
 */
function applyLayoutStyles(btn, layoutConfig) {
    if (!layoutConfig) return;
    
    if (layoutConfig.display) btn.style.display = layoutConfig.display;
    if (layoutConfig.flexDirection) btn.style.flexDirection = layoutConfig.flexDirection;
    if (layoutConfig.justifyContent) btn.style.justifyContent = layoutConfig.justifyContent;
    if (layoutConfig.padding) btn.style.padding = layoutConfig.padding;
    if (layoutConfig.minHeight) btn.style.minHeight = layoutConfig.minHeight;
}

/**
 * 应用文字样式
 * @param {HTMLElement} btn - 按钮元素
 * @param {object} textStyleConfig - 文字样式配置
 */
function applyTextStyles(btn, textStyleConfig) {
    if (!textStyleConfig) return;
    
    const cardContent = btn.querySelector('.card-content');
    if (!cardContent) return;
    
    const titleEl = cardContent.querySelector('b');
    const descEl = cardContent.querySelector('small');
    
    if (titleEl) {
        if (textStyleConfig.color) titleEl.style.color = textStyleConfig.color;
        if (textStyleConfig.textShadow) titleEl.style.textShadow = textStyleConfig.textShadow;
    }
    
    if (descEl) {
        if (textStyleConfig.color) descEl.style.color = textStyleConfig.color;
        if (textStyleConfig.textShadow) descEl.style.textShadow = textStyleConfig.textShadow;
    }
}

/**
 * 应用图片样式
 * @param {HTMLElement} img - 图片元素
 * @param {object} positionConfig - 位置配置
 */
function applyImageStyles(img, positionConfig) {
    if (!positionConfig) return;
    
    // 基础定位
    img.style.position = 'absolute';
    img.style.zIndex = '0';
    img.style.pointerEvents = 'none';
    img.style.borderRadius = '0 0 20px 20px';
    
    // 位置
    if (positionConfig.top !== undefined) img.style.top = positionConfig.top;
    if (positionConfig.bottom !== undefined) img.style.bottom = positionConfig.bottom;
    if (positionConfig.left !== undefined) img.style.left = positionConfig.left;
    if (positionConfig.right !== undefined) img.style.right = positionConfig.right;
    
    // 尺寸
    if (positionConfig.width !== undefined) img.style.width = positionConfig.width;
    if (positionConfig.height !== undefined) img.style.height = positionConfig.height;
    
    // Transform
    if (positionConfig.transform !== undefined) img.style.transform = positionConfig.transform;
    
    // Object fit和position
    if (positionConfig.objectFit !== undefined) img.style.objectFit = positionConfig.objectFit;
    if (positionConfig.objectPosition !== undefined) img.style.objectPosition = positionConfig.objectPosition;
    
    // 蒙版渐变
    if (positionConfig.maskGradient) {
        const maskGradient = generateGradientString(positionConfig.maskGradient);
        img.style.maskImage = maskGradient;
        img.style.webkitMaskImage = maskGradient;
    }
}

/**
 * 创建渐变蒙版叠加层
 * @param {HTMLElement} btn - 按钮元素
 * @param {object} overlayConfig - 叠加层配置
 */
function createOverlayGradient(btn, overlayConfig) {
    if (!overlayConfig) return;
    
    // 创建::after伪元素的样式
    // 由于无法直接创建::after伪元素，我们通过动态添加style标签来实现
    const overlayId = `overlay-${btn.id || 'btn'}`;
    let styleEl = document.getElementById(overlayId);
    
    if (!styleEl) {
        styleEl = document.createElement('style');
        styleEl.id = overlayId;
        document.head.appendChild(styleEl);
    }
    
    // 生成CSS规则
    const selector = `.${overlayConfig.className}::after`;
    const pos = overlayConfig.position || {};
    const gradient = generateGradientString(overlayConfig.gradient);
    
    let css = `${selector} {\n`;
    css += `    content: '';\n`;
    css += `    position: absolute;\n`;
    if (pos.top !== undefined) css += `    top: ${pos.top};\n`;
    if (pos.bottom !== undefined) css += `    bottom: ${pos.bottom};\n`;
    if (pos.left !== undefined) css += `    left: ${pos.left};\n`;
    if (pos.right !== undefined) css += `    right: ${pos.right};\n`;
    if (pos.width !== undefined) css += `    width: ${pos.width};\n`;
    if (pos.height !== undefined) css += `    height: ${pos.height};\n`;
    css += `    background: ${gradient};\n`;
    css += `    z-index: 1;\n`;
    css += `    pointer-events: none;\n`;
    css += `    border-radius: 0 0 20px 20px;\n`;
    if (overlayConfig.mixBlendMode) css += `    mix-blend-mode: ${overlayConfig.mixBlendMode};\n`;
    css += `}\n`;
    
    styleEl.textContent = css;
}

/**
 * 应用文字定位样式
 * @param {HTMLElement} btn - 按钮元素
 * @param {object} textPositionConfig - 文字定位配置
 */
function applyTextPosition(btn, textPositionConfig) {
    if (!textPositionConfig) return;
    
    const cardContent = btn.querySelector('.card-content');
    if (!cardContent) return;
    
    if (textPositionConfig.position) cardContent.style.position = textPositionConfig.position;
    if (textPositionConfig.top !== undefined) cardContent.style.top = textPositionConfig.top;
    if (textPositionConfig.left !== undefined) cardContent.style.left = textPositionConfig.left;
    if (textPositionConfig.zIndex !== undefined) cardContent.style.zIndex = textPositionConfig.zIndex;
    if (textPositionConfig.width !== undefined) cardContent.style.width = textPositionConfig.width;
    if (textPositionConfig.maxWidth !== undefined) cardContent.style.maxWidth = textPositionConfig.maxWidth;
}

/**
 * 设置图标和标签的显示状态
 * @param {HTMLElement} btn - 按钮元素
 * @param {boolean} hideIcon - 是否隐藏图标
 * @param {boolean} hideTag - 是否隐藏标签
 */
function setIconAndTagVisibility(btn, hideIcon, hideTag) {
    const iconEl = btn.querySelector('.card-icon');
    if (iconEl) {
        iconEl.style.display = hideIcon ? 'none' : '';
    }
    
    const tagEl = btn.querySelector('.card-tag');
    if (tagEl) {
        tagEl.style.display = hideTag ? 'none' : '';
    }
}

/**
 * 添加图片叠加
 * @param {HTMLElement} btn - 按钮元素
 * @param {object} imageConfig - 图片配置对象
 * @param {string} scope - 当前范围
 */
function addImageOverlay(btn, imageConfig, scope) {
    if (!imageConfig) return;
    
    // 检查条件
    if (imageConfig.condition && !imageConfig.condition(scope)) {
        return;
    }
    
    // 添加样式类（用于基础布局和CSS样式）
    if (imageConfig.classes) {
        btn.classList.add(...imageConfig.classes);
    }
    
    // 创建图片元素
    const img = document.createElement('img');
    img.src = imageConfig.src;
    img.alt = imageConfig.alt || '';
    img.className = 'game-card-overlay-image';
    
    // 应用图片样式
    if (imageConfig.position) {
        applyImageStyles(img, imageConfig.position);
    }
    
    btn.appendChild(img);
    
    // 创建渐变蒙版叠加层
    if (imageConfig.overlayGradient) {
        // 找到第一个overlay类名作为选择器
        const overlayClass = imageConfig.classes?.find(cls => cls.includes('overlay'));
        if (overlayClass) {
            createOverlayGradient(btn, {
                ...imageConfig.overlayGradient,
                className: overlayClass
            });
        }
    }
    
    // 应用文字定位
    if (imageConfig.textPosition) {
        applyTextPosition(btn, imageConfig.textPosition);
    }
}

/**
 * 应用按钮配置
 * @param {HTMLElement} btn - 按钮元素
 * @param {object} config - 按钮配置对象
 */
function applyButtonConfig(btn, config) {
    if (!config) return;
    
    // 应用基础样式类（background和boxShadow现在在CSS中定义）
    // 如果配置中指定了style，添加对应的CSS类
    if (config.style) {
        // 移除所有可能的基础样式类（包括所有颜色变体）
        const allCardStyles = [
            // 蓝色系
            'card-blue', 'card-daily-blue', 'card-blue-light', 'card-blue-dark', 'card-blue-cyan',
            // 紫色系
            'card-purple', 'card-shape-purple', 'card-purple-light', 'card-purple-dark', 'card-purple-pink',
            // 绿色系
            'card-green', 'card-football-green', 'card-compendium-green', 'card-green-light', 'card-green-dark', 'card-green-teal',
            // 橙色系
            'card-orange', 'card-sprint-orange', 'card-orange-light', 'card-orange-dark', 'card-orange-red',
            // 红色系
            'card-red', 'card-red-light', 'card-red-dark', 'card-red-pink',
            // 黄色系
            'card-yellow', 'card-network-yellow', 'card-yellow-light', 'card-yellow-dark', 'card-yellow-amber',
            // 其他
            'card-grey', 'card-pink', 'card-cyan', 'card-indigo', 'card-teal', 'card-brown', 'card-lime'
        ];
        btn.classList.remove(...allCardStyles);
        // 添加新的样式类
        btn.classList.add(config.style);
    }
    
    // 如果配置中直接指定了background或boxShadow，使用内联样式覆盖CSS类
    if (config.background) {
        btn.style.background = config.background;
    }
    if (config.boxShadow) {
        btn.style.boxShadow = config.boxShadow;
    }
    
    // 应用布局样式
    if (config.layout) {
        applyLayoutStyles(btn, config.layout);
    }
    
    // 应用文字样式
    if (config.textStyle) {
        applyTextStyles(btn, config.textStyle);
    }
    
    // 设置图标和标签显示状态
    setIconAndTagVisibility(btn, config.hideIcon !== false, config.hideTag === true);
}

/**
 * 创建路网挑战题型选择器（2个选项：选择题、填空题）
 * @param {HTMLElement} btn - 按钮元素
 * @returns {HTMLElement} 题型选择器容器
 */
function createToggleSwitch(btn) {
    const selectorContainer = document.createElement('div');
    selectorContainer.className = 'city-network-toggle-container';
    
    // 阻止事件冒泡
    ['click', 'mousedown', 'touchstart'].forEach(eventType => {
        selectorContainer.addEventListener(eventType, (e) => {
            e.stopPropagation();
        });
    });
    
    const selectorLabel = document.createElement('div');
    selectorLabel.className = 'city-network-toggle-label';
    
    const questionTypes = [
        { key: false, label: '选择题', icon: '📝' },
        { key: true, label: '填空题', icon: '✏️' }
    ];
    
    const currentFillMode = window.GameState ? (window.GameState.cityNetworkFillMode || false) : false;
    
    questionTypes.forEach((type) => {
        const option = document.createElement('button');
        option.type = 'button';
        option.className = 'city-network-toggle-option';
        option.dataset.fillMode = type.key;
        option.innerHTML = `<span class="toggle-icon">${type.icon}</span><span class="toggle-label">${type.label}</span>`;
        
        if (type.key === currentFillMode) {
            option.classList.add('active');
        }
        
        option.onclick = function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            // 移除所有active状态
            selectorContainer.querySelectorAll('.city-network-toggle-option').forEach(opt => {
                opt.classList.remove('active');
            });
            
            // 添加active状态
            option.classList.add('active');
            
            // 更新GameState
            if (window.GameState) {
                window.GameState.cityNetworkFillMode = type.key;
            }
        };
        
        selectorLabel.appendChild(option);
    });
    
    selectorContainer.appendChild(selectorLabel);
    
    return selectorContainer;
}

/**
 * 更新拨动开关标签样式（已废弃）
 * @param {HTMLElement} span1 - 第一个标签
 * @param {HTMLElement} span2 - 第二个标签
 * @param {boolean} isChecked - 是否选中
 * @deprecated 此函数已不再使用，题型选择器现在使用按钮点击切换，通过CSS的active类自动处理样式
 */
function updateToggleLabels(span1, span2, isChecked) {
    // 此函数已废弃，保留仅为兼容性
    // 新的实现使用按钮点击切换，通过CSS的active类自动处理样式
}

/**
 * 设置按钮图标显示状态（已废弃，使用 setIconAndTagVisibility）
 * @param {HTMLElement} btn - 按钮元素
 * @param {string} btnId - 按钮ID
 * @param {string} icon - 图标文本（已废弃，保留参数以兼容）
 * @param {boolean} showIcon - 是否显示图标（默认false，即隐藏）
 */
function setButtonIcon(btn, btnId, icon, showIcon) {
    const iconEl = document.getElementById(btnId.replace('btn-', 'txt-') + '-icon');
    if (iconEl) {
        // 默认隐藏icon，只有明确设置showIcon为true时才显示
        if (showIcon) {
            iconEl.style.display = '';
            if (icon) iconEl.textContent = icon;
        } else {
            iconEl.style.display = 'none';
        }
    }
}

/**
 * 创建足球难度选择器（4个选项：简单、中等、困难、地狱）
 * @param {HTMLElement} btn - 按钮元素
 * @returns {HTMLElement} 难度选择器容器
 */
function createFootballDifficultySelector(btn) {
    const selectorContainer = document.createElement('div');
    selectorContainer.className = 'football-difficulty-selector-container';
    
    // 阻止事件冒泡
    ['click', 'mousedown', 'touchstart'].forEach(eventType => {
        selectorContainer.addEventListener(eventType, (e) => {
            e.stopPropagation();
        });
    });
    
    const selectorLabel = document.createElement('div');
    selectorLabel.className = 'football-difficulty-selector-label';
    
    const difficulties = [
        { key: 'easy', label: '简单', icon: '⚽' },
        { key: 'medium', label: '中等', icon: '⚽' },
        { key: 'hard', label: '困难', icon: '⚽' },
        { key: 'hell', label: '地狱', icon: '🔥' }
    ];
    
    const currentDifficulty = window.GameState ? (window.GameState.footballDifficulty || 'easy') : 'easy';
    
    difficulties.forEach((diff) => {
        const option = document.createElement('button');
        option.type = 'button';
        option.className = 'football-difficulty-option';
        option.dataset.difficulty = diff.key;
        option.innerHTML = `<span class="difficulty-icon">${diff.icon}</span><span class="difficulty-label">${diff.label}</span>`;
        
        if (diff.key === currentDifficulty) {
            option.classList.add('active');
        }
        
        option.onclick = function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            // 移除所有active状态
            selectorContainer.querySelectorAll('.football-difficulty-option').forEach(opt => {
                opt.classList.remove('active');
            });
            
            // 添加active状态
            option.classList.add('active');
            
            // 更新GameState
            if (window.GameState) {
                window.GameState.footballDifficulty = diff.key;
            }
        };
        
        selectorLabel.appendChild(option);
    });
    
    selectorContainer.appendChild(selectorLabel);
    
    return selectorContainer;
}

/**
 * 创建极速冲刺难度选择器（2个选项：简单、困难）
 * @param {HTMLElement} btn - 按钮元素
 * @returns {HTMLElement} 难度选择器容器
 */
function createSprintDifficultySelector(btn) {
    const selectorContainer = document.createElement('div');
    selectorContainer.className = 'sprint-difficulty-selector-container';
    
    // 阻止事件冒泡
    ['click', 'mousedown', 'touchstart'].forEach(eventType => {
        selectorContainer.addEventListener(eventType, (e) => {
            e.stopPropagation();
        });
    });
    
    const selectorLabel = document.createElement('div');
    selectorLabel.className = 'sprint-difficulty-selector-label';
    
    const difficulties = [
        { key: 'mode_3a', label: '简单', desc: '4选项', icon: '⚡' },
        { key: 'mode_3b', label: '困难', desc: '6选项', icon: '⚡' }
    ];
    
    // 从 GameState 获取当前难度，默认为 mode_3a
    const currentDifficulty = window.GameState ? (window.GameState.sprintDifficulty || 'mode_3a') : 'mode_3a';
    
    difficulties.forEach((diff) => {
        const option = document.createElement('button');
        option.type = 'button';
        option.className = 'sprint-difficulty-option';
        option.dataset.difficulty = diff.key;
        option.innerHTML = `
            <span class="difficulty-icon">${diff.icon}</span>
            <span class="difficulty-label">${diff.label}</span>
            <span class="difficulty-desc">${diff.desc}</span>
        `;
        
        if (diff.key === currentDifficulty) {
            option.classList.add('active');
        }
        
        option.onclick = function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            // 移除所有active状态
            selectorContainer.querySelectorAll('.sprint-difficulty-option').forEach(opt => {
                opt.classList.remove('active');
            });
            
            // 添加active状态
            option.classList.add('active');
            
            // 更新GameState
            if (window.GameState) {
                window.GameState.sprintDifficulty = diff.key;
            }
        };
        
        selectorLabel.appendChild(option);
    });
    
    selectorContainer.appendChild(selectorLabel);
    
    return selectorContainer;
}

/**
 * 创建猜国旗模式选择器（3个选项：极速冲刺简单、极速冲刺困难、全图鉴）
 * @param {HTMLElement} btn - 按钮元素
 * @returns {HTMLElement} 模式选择器容器
 */
function createFlagGuessModeSelector(btn) {
    const selectorContainer = document.createElement('div');
    selectorContainer.className = 'flag-guess-mode-selector-container';
    
    // 阻止事件冒泡
    ['click', 'mousedown', 'touchstart'].forEach(eventType => {
        selectorContainer.addEventListener(eventType, (e) => {
            e.stopPropagation();
        });
    });
    
    const selectorLabel = document.createElement('div');
    selectorLabel.className = 'flag-guess-mode-selector-label';
    
    const modes = [
        { key: 'mode_3a', label: '极速', desc: '4选项', icon: '⚡' },
        { key: 'mode_3b', label: '极速', desc: '6选项', icon: '⚡' },
        { key: 'all', label: '全图鉴', desc: '全部', icon: '♾️' }
    ];
    
    // 从 GameState 获取当前模式，默认为 mode_3a
    const currentMode = window.GameState ? (window.GameState.flagGuessMode || 'mode_3a') : 'mode_3a';
    
    modes.forEach((mode) => {
        const option = document.createElement('button');
        option.type = 'button';
        option.className = 'flag-guess-mode-option';
        option.dataset.mode = mode.key;
        option.innerHTML = `
            <span class="mode-icon">${mode.icon}</span>
            <span class="mode-label">${mode.label}</span>
            <span class="mode-desc">${mode.desc}</span>
        `;
        
        if (mode.key === currentMode) {
            option.classList.add('active');
        }
        
        option.onclick = function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            // 移除所有active状态
            selectorContainer.querySelectorAll('.flag-guess-mode-option').forEach(opt => {
                opt.classList.remove('active');
            });
            
            // 添加active状态
            option.classList.add('active');
            
            // 更新GameState
            if (window.GameState) {
                window.GameState.flagGuessMode = mode.key;
            }
        };
        
        selectorLabel.appendChild(option);
    });
    
    selectorContainer.appendChild(selectorLabel);
    
    return selectorContainer;
}

window.clearButtonOverlays = clearButtonOverlays;
window.addImageOverlay = addImageOverlay;
window.createToggleSwitch = createToggleSwitch;
window.createFootballDifficultySelector = createFootballDifficultySelector;
window.createSprintDifficultySelector = createSprintDifficultySelector;
window.createFlagGuessModeSelector = createFlagGuessModeSelector;
window.updateToggleLabels = updateToggleLabels;
window.setButtonIcon = setButtonIcon;
window.applyButtonConfig = applyButtonConfig;
window.setIconAndTagVisibility = setIconAndTagVisibility;
