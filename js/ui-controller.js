// ============================================================================
// UI视图控制模块 - 负责界面切换和菜单控制
// ============================================================================

function showView(id) {
    document.querySelectorAll('.container').forEach(d => d.classList.remove('active'));
    const el = document.getElementById(id);
    if (el) {
        el.classList.add('active');
    }
    
    // 记录视图变化到触摸手势管理器
    if (window.touchGestureManager && window.touchGestureManager.recordViewChange) {
        window.touchGestureManager.recordViewChange(id);
    }
}

function goHome() { 
    window.GameState.isProcessing = false; 
    if (window.closeMap) window.closeMap(); 
    
    // 清除极速冲刺倒计时
    if (window.sprintTimer) {
        clearInterval(window.sprintTimer);
        window.sprintTimer = null;
    }
    const countdownDisplay = document.getElementById('countdown-display');
    if (countdownDisplay) {
        countdownDisplay.style.display = 'none';
    }
    
    showView('view-menu');
}

// 游戏范围选择
function enterGameScope(scope) {
    window.GameState.currentScope = scope;
    const isWorld = (scope === 'world');
    const isChina = (scope === 'china');
    const isSports = (scope === 'sports');
    const isPokemon = (scope === 'pokemon');
    
    // 移除所有模式特定的class
    const viewMenu = document.getElementById('view-menu');
    if (viewMenu) viewMenu.classList.remove('china-mode');
    
    if (isWorld) {
        document.getElementById('menu-title').textContent = "🌍 世界挑战";
        document.getElementById('menu-subtitle').textContent = `收录 ${window.GameData.dbWorld.length} 个国家`;
        enableBtn('btn-mode-1', 'mode_1', '📅', '每日挑战', '看国旗，猜首都', '20');
        enableBtn('btn-mode-2', 'flag_guess', '🏳️', '猜国旗', '选择模式开始挑战', '--');
        enableBtn('btn-mode-3', 'mode_2', '🧩', '形状挑战', '看剪影，猜国家', '30');
        enableBtn('btn-mode-all', 'airport', '✈️', '猜机场', '看机场图，猜名称', '10');
        const compendiumBtn = document.getElementById('compendium-btn');
        const pkModeBtn = document.getElementById('pk-mode-btn');
        if (compendiumBtn) compendiumBtn.style.display = 'flex';
        if (pkModeBtn) pkModeBtn.style.display = 'flex';
    } else if (isChina) {
        document.getElementById('menu-title').textContent = "🇨🇳 中国挑战";
        const cityNetworksCount = window.GameData.dbCityNetworks ? window.GameData.dbCityNetworks.length : 0;
        document.getElementById('menu-subtitle').textContent = `车牌 ${window.GameData.dbPlates.length} 个 | 路网 ${cityNetworksCount} 个城市`;
        // 添加中国模式的class以应用特殊布局
        if (viewMenu) viewMenu.classList.add('china-mode');
        enableBtn('btn-mode-1', 'mode_1', '🚗', '车牌挑战', '看车牌，猜地名', '50');
        enableBtn('btn-mode-2', 'city_network', '🗺️', '路网挑战', '看路网，猜城市', '10');
        enableBtn('btn-mode-3', 'china_daily_network', '📅', '每日挑战', '部分路网，填空题', '3');
        disableBtn('btn-mode-all');
        const compendiumBtn = document.getElementById('compendium-btn');
        const pkModeBtn = document.getElementById('pk-mode-btn');
        if (compendiumBtn) compendiumBtn.style.display = 'none';
        if (pkModeBtn) pkModeBtn.style.display = 'none';
    } else if (isSports) {
        window.GameState.isFootballSubMenu = false;
        document.getElementById('menu-title').textContent = "⚽ 体育挑战";
        document.getElementById('menu-subtitle').textContent = `F1赛道 ${window.GameData.dbF1Tracks.length} 条 | 足球俱乐部 ${window.GameData.dbFootballClubs.length} 个`;
        enableBtn('btn-mode-1', 'f1', '🏎️', 'F1赛道挑战', '看赛道图，猜赛道名', '20');
        enableBtn('btn-mode-2', 'football_menu', '⚽', '足球俱乐部挑战', '选择难度开始挑战', '20');
        disableBtn('btn-mode-3');
        disableBtn('btn-mode-all');
        const compendiumBtn = document.getElementById('compendium-btn');
        const pkModeBtn = document.getElementById('pk-mode-btn');
        if (compendiumBtn) compendiumBtn.style.display = 'flex';
        if (pkModeBtn) pkModeBtn.style.display = 'flex';
    } else if (isPokemon) {
        document.getElementById('menu-title').textContent = "👾 异世界挑战";
        const pokemonCount = window.GameData.dbPokemon ? window.GameData.dbPokemon.length : 0;
        document.getElementById('menu-subtitle').textContent = `收录 ${pokemonCount} 个宝可梦`;
        enableBtn('btn-mode-1', 'pokemon', '⚡', '猜宝可梦', '看剪影，猜宝可梦', '20');
        disableBtn('btn-mode-2');
        disableBtn('btn-mode-3');
        disableBtn('btn-mode-all');
        const compendiumBtn = document.getElementById('compendium-btn');
        const pkModeBtn = document.getElementById('pk-mode-btn');
        if (compendiumBtn) compendiumBtn.style.display = 'none';
        if (pkModeBtn) pkModeBtn.style.display = 'none';
    }

    showView('view-menu');
    updateBackButton();
}

// 足球子菜单（已废弃，现在使用难度选择器）
// function enterFootballSubMenu() {
//     // 此函数已不再使用，足球挑战现在通过难度选择器直接进入游戏
// }

// 极速冲刺子菜单（已废弃，现在使用难度选择器）
// function enterSprintSubMenu() {
//     // 此函数已不再使用，极速冲刺现在通过难度选择器直接进入游戏
// }

// 返回按钮处理
function handleBackBtn() {
    if (window.GameState.isFootballSubMenu && window.GameState.currentScope === 'sports') {
        enterGameScope('sports');
    } else {
        showView('view-landing');
    }
}

// 更新返回按钮文本
function updateBackButton() {
    const backBtnText = document.getElementById('back-btn-text');
    if (backBtnText) {
        {
            backBtnText.textContent = '返回';
        }
    }
}

/**
 * 启用按钮
 * @param {string} btnId - 按钮ID
 * @param {string} modeKey - 模式键
 * @param {string} icon - 图标（可选，如果未提供则从元数据中获取）
 * @param {string} title - 标题（可选，如果未提供则从元数据中获取）
 * @param {string} desc - 描述（可选，如果未提供则从元数据中获取）
 * @param {string} count - 数量（可选，如果未提供则从元数据中获取）
 */
function enableBtn(btnId, modeKey, icon, title, desc, count) {
    const btn = document.getElementById(btnId);
    if (!btn) return;
    
    // 获取当前范围
    const scope = window.GameState ? window.GameState.currentScope : 'world';
    
    // 获取按钮配置
    const config = window.getButtonConfig(modeKey, scope);
    
    // 获取按钮元数据（如果参数未提供）
    const metadata = window.getButtonMetadata(modeKey, scope);
    const finalIcon = icon !== undefined ? icon : metadata.icon;
    const finalTitle = title !== undefined ? title : metadata.title;
    const finalDesc = desc !== undefined ? desc : metadata.desc;
    const finalCount = count !== undefined ? count : metadata.count;
    
    // 基础设置
    btn.onclick = function() { window.startGame(modeKey); };
    btn.style.cursor = "pointer";
    btn.className = "game-card";
    
    // 清除之前的叠加元素
    window.clearButtonOverlays(btn);
    
    // 应用基础样式类
    if (config.style) {
        btn.classList.add(config.style);
    }
    
    // 应用按钮配置（布局、文字样式、图标/标签显示等）
    window.applyButtonConfig(btn, config);
    
    // 添加图片叠加
    if (config.image) {
        window.addImageOverlay(btn, config.image, scope);
    }
    
    // 添加拨动开关
    if (config.toggle) {
        const toggleContainer = window.createToggleSwitch(btn);
        btn.appendChild(toggleContainer);
    }
    
    // 添加足球难度选择器
    if (config.footballDifficulty) {
        const selectorContainer = window.createFootballDifficultySelector(btn);
        btn.appendChild(selectorContainer);
    }
    
    // 添加极速冲刺难度选择器
    if (config.sprintDifficulty) {
        const selectorContainer = window.createSprintDifficultySelector(btn);
        btn.appendChild(selectorContainer);
    }
    
    // 添加猜国旗模式选择器
    if (config.flagGuessMode) {
        const selectorContainer = window.createFlagGuessModeSelector(btn);
        btn.appendChild(selectorContainer);
    }
    
    // 设置文本内容
    document.getElementById(btnId.replace('btn-', 'txt-') + '-title').textContent = finalTitle;
    document.getElementById(btnId.replace('btn-', 'txt-') + '-desc').textContent = finalDesc;
    
    // 设置数量标签
    const tag = document.getElementById(btnId.replace('btn-', 'txt-') + '-count');
    if (tag) {
        tag.textContent = finalCount;
        // 标签显示逻辑：如果配置了hideTag为true，或者count为'--'，则隐藏
        if (config.hideTag === true || finalCount === '--') {
            tag.style.display = 'none';
        } else {
            tag.style.display = 'inline-block';
        }
    }
}

/**
 * 禁用按钮
 * @param {string} btnId - 按钮ID
 */
function disableBtn(btnId) {
    const btn = document.getElementById(btnId);
    if (!btn) return;
    
    // 基础设置
    btn.onclick = null;
    btn.className = "game-card card-gray";
    
    // 清除所有叠加元素
    window.clearButtonOverlays(btn);
    
    // 设置文本内容
    document.getElementById(btnId.replace('btn-', 'txt-') + '-title').textContent = "敬请期待";
    document.getElementById(btnId.replace('btn-', 'txt-') + '-desc').textContent = "Coming Soon";
    
    // 隐藏图标和数量标签
    const iconEl = document.getElementById(btnId.replace('btn-', 'txt-') + '-icon');
    if (iconEl) iconEl.style.display = 'none';
    const tag = document.getElementById(btnId.replace('btn-', 'txt-') + '-count');
    if (tag) tag.style.display = 'none';
}

// 暴露到全局
window.showView = showView;
window.goHome = goHome;
window.enterGameScope = enterGameScope;
// window.enterFootballSubMenu = enterFootballSubMenu; // 已废弃
// window.enterSprintSubMenu = enterSprintSubMenu; // 已废弃
window.handleBackBtn = handleBackBtn;
window.updateBackButton = updateBackButton;
window.enableBtn = enableBtn;
window.disableBtn = disableBtn;
