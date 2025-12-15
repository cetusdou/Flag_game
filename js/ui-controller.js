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
        document.getElementById('menu-title').textContent = "🇨🇳 车牌挑战";
        document.getElementById('menu-subtitle').textContent = `收录 ${window.GameData.dbPlates.length} 个区域`;
        enableBtn('btn-mode-1', 'mode_1', '🚗', '车牌挑战', '看车牌，猜地名', '50');
        disableBtn('btn-mode-2');
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
    enableBtn('btn-mode-1', 'football_easy', '⚽', '简单难度', '遮罩30%，可见范围较大', '20');
    enableBtn('btn-mode-2', 'football_medium', '⚽', '中等难度', '遮罩20%，可见范围适中', '20');
    enableBtn('btn-mode-3', 'football_hard', '⚽', '困难难度', '遮罩10%，仅显示中心', '20');
    enableBtn('btn-mode-all', 'football_hell', '🔥', '地狱难度', '随机旋转+遮罩10%', '20');
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

    if(btnId.includes('1')) btn.classList.add('card-blue');
    if(btnId.includes('2')) btn.classList.add('card-purple');
    if(btnId.includes('3')) btn.classList.add('card-orange');
    if(btnId.includes('all')) {
        // 如果是足球模式的地狱难度，使用红色主题
        if (modeKey === 'football_hell') {
            btn.classList.add('card-red');
        } else {
            btn.classList.add('card-green');
        }
    }

    document.getElementById(btnId.replace('btn-', 'txt-') + '-title').textContent = title;
    document.getElementById(btnId.replace('btn-', 'txt-') + '-desc').textContent = desc;
    document.getElementById(btnId.replace('btn-', 'txt-') + '-icon').textContent = icon;
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
    document.getElementById(btnId.replace('btn-', 'txt-') + '-title').textContent = "敬请期待";
    document.getElementById(btnId.replace('btn-', 'txt-') + '-desc').textContent = "Coming Soon";
    document.getElementById(btnId.replace('btn-', 'txt-') + '-icon').textContent = "🔒";
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
