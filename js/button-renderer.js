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
    
    // 移除拨动开关
    const toggleContainer = btn.querySelector('.city-network-toggle-container');
    if (toggleContainer) toggleContainer.remove();
    
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
    
    // 应用基础样式（background和boxShadow）
    // 如果配置中指定了style，从BASE_CARD_STYLES中获取基础样式
    if (config.style) {
        const baseStyle = window.getBaseCardStyle(config.style);
        if (baseStyle.background && !config.background) {
            btn.style.background = baseStyle.background;
        }
        if (baseStyle.boxShadow && !config.boxShadow) {
            btn.style.boxShadow = baseStyle.boxShadow;
        }
    }
    
    // 应用配置中直接指定的背景和阴影（优先级更高）
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
 * 创建拨动开关
 * @param {HTMLElement} btn - 按钮元素
 * @returns {HTMLElement} 拨动开关容器
 */
function createToggleSwitch(btn) {
    const toggleContainer = document.createElement('div');
    toggleContainer.className = 'city-network-toggle-container';
    
    // 阻止事件冒泡
    ['click', 'mousedown', 'touchstart'].forEach(eventType => {
        toggleContainer.addEventListener(eventType, (e) => {
            e.stopPropagation();
        });
    });
    
    const toggleLabel = document.createElement('label');
    toggleLabel.className = 'city-network-toggle-label';
    
    const span1 = document.createElement('span');
    span1.className = 'toggle-label-text';
    span1.textContent = '选择题';
    
    const toggleSwitch = document.createElement('div');
    toggleSwitch.className = 'toggle-switch';
    
    const toggleInput = document.createElement('input');
    toggleInput.type = 'checkbox';
    toggleInput.id = 'city-network-fill-mode-toggle';
    toggleInput.checked = window.GameState ? (window.GameState.cityNetworkFillMode || false) : false;
    
    const toggleSlider = document.createElement('span');
    toggleSlider.className = 'toggle-slider';
    
    toggleSwitch.appendChild(toggleInput);
    toggleSwitch.appendChild(toggleSlider);
    
    const span2 = document.createElement('span');
    span2.className = 'toggle-label-text';
    span2.textContent = '填空题';
    
    toggleLabel.appendChild(span1);
    toggleLabel.appendChild(toggleSwitch);
    toggleLabel.appendChild(span2);
    toggleContainer.appendChild(toggleLabel);
    
    // 更新拨动开关状态
    toggleInput.onchange = function() {
        if (window.GameState) {
            window.GameState.cityNetworkFillMode = toggleInput.checked;
            updateToggleLabels(span1, span2, toggleInput.checked);
        }
    };
    
    // 初始化标签颜色
    updateToggleLabels(span1, span2, toggleInput.checked);
    
    return toggleContainer;
}

/**
 * 更新拨动开关标签样式
 * @param {HTMLElement} span1 - 第一个标签
 * @param {HTMLElement} span2 - 第二个标签
 * @param {boolean} isChecked - 是否选中
 */
function updateToggleLabels(span1, span2, isChecked) {
    if (isChecked) {
        span1.style.opacity = '0.5';
        span2.style.opacity = '1';
        span2.style.fontWeight = '600';
        span1.style.fontWeight = '400';
    } else {
        span1.style.opacity = '1';
        span2.style.opacity = '0.5';
        span1.style.fontWeight = '600';
        span2.style.fontWeight = '400';
    }
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

window.clearButtonOverlays = clearButtonOverlays;
window.addImageOverlay = addImageOverlay;
window.createToggleSwitch = createToggleSwitch;
window.updateToggleLabels = updateToggleLabels;
window.setButtonIcon = setButtonIcon;
window.applyButtonConfig = applyButtonConfig;
window.setIconAndTagVisibility = setIconAndTagVisibility;
