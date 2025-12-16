// ============================================================================
// UI视图控制模块 - 负责界面切换和菜单控制
// ============================================================================

function showView(id) {
    document.querySelectorAll('.container').forEach(d => d.classList.remove('active'));
    const el = document.getElementById(id);
    if (el) {
        el.classList.add('active');
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
    
    // 如果在足球子菜单中，返回体育模式主菜单
    if (window.GameState.isFootballSubMenu && window.GameState.currentScope === 'sports') {
        enterGameScope('sports');
    } else {
        showView('view-menu'); 
    }
}

// 游戏范围选择
function enterGameScope(scope) {
    window.GameState.currentScope = scope;
    const isWorld = (scope === 'world');
    const isChina = (scope === 'china');
    const isSports = (scope === 'sports');
    
    if (isWorld) {
        document.getElementById('menu-title').textContent = "🌍 世界挑战";
        document.getElementById('menu-subtitle').textContent = `收录 ${window.GameData.dbWorld.length} 个国家`;
        enableBtn('btn-mode-1', 'mode_1', '📅', '每日挑战', '看国旗，猜首都', '20');
        enableBtn('btn-mode-2', 'mode_2', '🧩', '形状挑战', '看剪影，猜国家', '30');
        enableBtn('btn-mode-3', 'sprint_menu', '⚡', '极速冲刺', '选择难度开始挑战', '--');
        enableBtn('btn-mode-all', 'all', '♾️', '全图鉴', '不重复，死磕到底', 'All');
        const compendiumBtn = document.getElementById('compendium-btn');
        const pkModeBtn = document.getElementById('pk-mode-btn');
        if (compendiumBtn) compendiumBtn.style.display = 'flex';
        if (pkModeBtn) pkModeBtn.style.display = 'flex';
    } else if (isChina) {
        document.getElementById('menu-title').textContent = "🇨🇳 中国挑战";
        const cityNetworksCount = window.GameData.dbCityNetworks ? window.GameData.dbCityNetworks.length : 0;
        document.getElementById('menu-subtitle').textContent = `车牌 ${window.GameData.dbPlates.length} 个 | 路网 ${cityNetworksCount} 个城市`;
        enableBtn('btn-mode-1', 'mode_1', '🚗', '车牌挑战', '看车牌，猜地名', '50');
        enableBtn('btn-mode-2', 'city_network', '🗺️', '路网挑战', '看路网，猜城市', '10');
        disableBtn('btn-mode-3');
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
        enableBtn('btn-mode-2', 'football_menu', '⚽', '足球俱乐部挑战', '选择难度开始挑战', '--');
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

// 足球子菜单
function enterFootballSubMenu() {
    window.GameState.isFootballSubMenu = true;
    document.getElementById('menu-title').textContent = "⚽ 足球俱乐部挑战";
    document.getElementById('menu-subtitle').textContent = `收录 ${window.GameData.dbFootballClubs.length} 个俱乐部`;
    enableBtn('btn-mode-1', 'football_easy', '⚽', '简单难度', '可见范围较大', '20');
    enableBtn('btn-mode-2', 'football_medium', '⚽', '中等难度', '可见范围适中', '20');
    enableBtn('btn-mode-3', 'football_hard', '⚽', '困难难度', '仅显示中心', '20');
    enableBtn('btn-mode-all', 'football_hell', '🔥', '地狱难度', '随机旋转', '20');
    const compendiumBtn = document.getElementById('compendium-btn');
    const pkModeBtn = document.getElementById('pk-mode-btn');
    if (compendiumBtn) compendiumBtn.style.display = 'flex';
    if (pkModeBtn) pkModeBtn.style.display = 'flex';
    showView('view-menu');
    updateBackButton();
}

// 极速冲刺子菜单
function enterSprintSubMenu() {
    window.GameState.isSprintSubMenu = true;
    document.getElementById('menu-title').textContent = "⚡ 极速冲刺";
    document.getElementById('menu-subtitle').textContent = `选择难度开始挑战`;
    enableBtn('btn-mode-1', 'mode_3a', '⚡', '简单难度', '4选项，快速问答', '50');
    enableBtn('btn-mode-2', 'mode_3b', '⚡', '困难难度', '6选项，同区域干扰', '50');
    disableBtn('btn-mode-3');
    disableBtn('btn-mode-all');
    const compendiumBtn = document.getElementById('compendium-btn');
    const pkModeBtn = document.getElementById('pk-mode-btn');
    if (compendiumBtn) compendiumBtn.style.display = 'none';
    if (pkModeBtn) pkModeBtn.style.display = 'none';
    showView('view-menu');
    updateBackButton();
}

// 返回按钮处理
function handleBackBtn() {
    if (window.GameState.isFootballSubMenu && window.GameState.currentScope === 'sports') {
        enterGameScope('sports');
    } else if (window.GameState.isSprintSubMenu && window.GameState.currentScope === 'world') {
        enterGameScope('world');
    } else {
        showView('view-landing');
    }
}

// 更新返回按钮文本
function updateBackButton() {
    const backBtnText = document.getElementById('back-btn-text');
    if (backBtnText) {
        if (window.GameState.isFootballSubMenu && window.GameState.currentScope === 'sports') {
            backBtnText.textContent = '返回';
        } else if (window.GameState.isSprintSubMenu && window.GameState.currentScope === 'world') {
            backBtnText.textContent = '返回';
        } else {
            backBtnText.textContent = '返回';
        }
    }
}

function enableBtn(btnId, modeKey, icon, title, desc, count) {
    const btn = document.getElementById(btnId);
    if (!btn) return;
    btn.onclick = function() { window.startGame(modeKey); };
    btn.style.cursor = "pointer";
    btn.className = "game-card"; 

    // 移除之前的图片叠加（如果存在）
    const existingImgs = btn.querySelectorAll('.game-card-overlay-image');
    existingImgs.forEach(img => img.remove());
    
    // 移除所有可能的叠加类
    btn.classList.remove('card-daily', 'daily-card-overlay', 'card-sprint', 'sprint-card-overlay', 
                         'card-shape', 'shape-card-overlay', 'card-city-network', 'city-network-card-overlay',
                         'card-football', 'football-card-overlay', 'card-f1', 'f1-card-overlay');

    if(btnId.includes('1')) {
        // 如果是F1赛道挑战，使用特殊设计并添加图片
        if (modeKey === 'f1') {
            btn.classList.add('card-f1');
            btn.classList.add('f1-card-overlay');
            // 添加图片元素
            const img = document.createElement('img');
            img.src = 'assets/libs/Brazil.avif';
            img.alt = 'F1 Track';
            img.className = 'game-card-overlay-image';
            btn.appendChild(img);
            // 隐藏emoji图标
            const iconEl = document.getElementById(btnId.replace('btn-', 'txt-') + '-icon');
            if (iconEl) iconEl.style.display = 'none';
        } else if (modeKey === 'mode_1') {
            // 每日挑战，只在世界模式下添加图片叠加
            const currentScope = window.GameState ? window.GameState.currentScope : 'world';
            if (currentScope === 'world') {
                btn.classList.add('card-daily');
                btn.classList.add('daily-card-overlay');
                // 添加图片元素
                const img = document.createElement('img');
                img.src = 'assets/libs/taili.png';
                img.alt = 'Daily Challenge';
                img.className = 'game-card-overlay-image';
                btn.appendChild(img);
                // 隐藏emoji图标
                const iconEl = document.getElementById(btnId.replace('btn-', 'txt-') + '-icon');
                if (iconEl) iconEl.style.display = 'none';
            } else {
                // 中国模式下的车牌挑战，不添加图片
                btn.classList.add('card-blue');
            }
        } else {
            btn.classList.add('card-blue');
        }
    }
    if(btnId.includes('2')) {
        // 如果是足球菜单入口，使用绿色并添加图片
        if (modeKey === 'football_menu') {
            btn.classList.add('card-football');
            btn.classList.add('football-card-overlay');
            // 添加图片元素
            const img = document.createElement('img');
            img.src = 'assets/libs/Football.jpeg';
            img.alt = 'Football';
            img.className = 'game-card-overlay-image';
            btn.appendChild(img);
            // 隐藏emoji图标
            const iconEl = document.getElementById(btnId.replace('btn-', 'txt-') + '-icon');
            if (iconEl) iconEl.style.display = 'none';
        } else if (modeKey === 'mode_2') {
            // 形状挑战，添加图片叠加
            btn.classList.add('card-shape');
            btn.classList.add('shape-card-overlay');
            // 添加图片元素
            const img = document.createElement('img');
            img.src = 'assets/libs/VCG211437531476.jpg';
            img.alt = 'Shape Challenge';
            img.className = 'game-card-overlay-image';
            btn.appendChild(img);
            // 隐藏emoji图标
            const iconEl = document.getElementById(btnId.replace('btn-', 'txt-') + '-icon');
            if (iconEl) iconEl.style.display = 'none';
        } else if (modeKey === 'city_network') {
            // 路网挑战，添加图片叠加
            btn.classList.add('card-city-network');
            btn.classList.add('city-network-card-overlay');
            // 添加图片元素
            const img = document.createElement('img');
            img.src = 'assets/libs/VCG211331711418.jpg';
            img.alt = 'City Network Challenge';
            img.className = 'game-card-overlay-image';
            btn.appendChild(img);
            // 隐藏emoji图标
            const iconEl = document.getElementById(btnId.replace('btn-', 'txt-') + '-icon');
            if (iconEl) iconEl.style.display = 'none';
        } else {
            btn.classList.add('card-purple');
        }
    }
    if(btnId.includes('3')) {
        // 如果是极速冲刺入口，添加图片叠加
        if (modeKey === 'sprint_menu') {
            btn.classList.add('card-sprint');
            btn.classList.add('sprint-card-overlay');
            // 添加图片元素
            const img = document.createElement('img');
            img.src = 'assets/libs/clock.png';
            img.alt = 'Sprint Challenge';
            img.className = 'game-card-overlay-image';
            btn.appendChild(img);
            // 隐藏emoji图标
            const iconEl = document.getElementById(btnId.replace('btn-', 'txt-') + '-icon');
            if (iconEl) iconEl.style.display = 'none';
        } else {
            btn.classList.add('card-orange');
        }
    }
    if(btnId.includes('all')) {
        // 如果是足球模式的地狱难度，使用红色主题
        if (modeKey === 'football_hell') {
            btn.classList.add('card-red');
        } else {
            btn.classList.add('card-green');
        }
        // 如果是"敬请期待"模式，隐藏图标
        if (modeKey === 'all') {
            const iconEl = document.getElementById(btnId.replace('btn-', 'txt-') + '-icon');
            if (iconEl) iconEl.style.display = 'none';
        }
    }

    document.getElementById(btnId.replace('btn-', 'txt-') + '-title').textContent = title;
    document.getElementById(btnId.replace('btn-', 'txt-') + '-desc').textContent = desc;
    const iconEl = document.getElementById(btnId.replace('btn-', 'txt-') + '-icon');
    if (iconEl && modeKey !== 'all') {
        iconEl.textContent = icon;
    }
    const tag = document.getElementById(btnId.replace('btn-', 'txt-') + '-count');
    if (tag) {
        tag.textContent = count;
        tag.style.display = count === '--' ? 'none' : 'inline-block';
    }
}

function disableBtn(btnId) {
    const btn = document.getElementById(btnId);
    if (!btn) return;
    btn.onclick = null;
    btn.style.cursor = "not-allowed";
    btn.className = "game-card card-gray";
    
    // 清除所有图片叠加元素
    const existingImgs = btn.querySelectorAll('.game-card-overlay-image');
    existingImgs.forEach(img => img.remove());
    
    // 移除所有与图片叠加相关的类名
    btn.classList.remove('card-daily', 'daily-card-overlay', 'card-sprint', 'sprint-card-overlay', 
                         'card-shape', 'shape-card-overlay', 'card-city-network', 'city-network-card-overlay',
                         'card-football', 'football-card-overlay', 'card-f1', 'f1-card-overlay');
    
    document.getElementById(btnId.replace('btn-', 'txt-') + '-title').textContent = "敬请期待";
    document.getElementById(btnId.replace('btn-', 'txt-') + '-desc').textContent = "Coming Soon";
    // 隐藏图标，不显示任何图标
    const iconEl = document.getElementById(btnId.replace('btn-', 'txt-') + '-icon');
    if (iconEl) iconEl.style.display = 'none';
    const tag = document.getElementById(btnId.replace('btn-', 'txt-') + '-count');
    if (tag) tag.style.display = 'none';
}

// 暴露到全局
window.showView = showView;
window.goHome = goHome;
window.enterGameScope = enterGameScope;
window.enterFootballSubMenu = enterFootballSubMenu;
window.enterSprintSubMenu = enterSprintSubMenu;
window.handleBackBtn = handleBackBtn;
window.updateBackButton = updateBackButton;
window.enableBtn = enableBtn;
window.disableBtn = disableBtn;
