// ============================================================================
// 弹窗处理模块 - PK模式弹窗和错误提示弹窗
// ============================================================================

let pendingPKMode = null; // 存储待处理的PK模式

// 显示PK种子输入弹窗
function showPKSeedModal() {
    pendingPKMode = 'pk'; // 标记为PK模式
    const modal = document.getElementById('pk-seed-modal');
    const input = document.getElementById('pk-seed-input');
    if (!modal || !input) {
        console.error('PK种子弹窗元素未找到');
        return;
    }
    
    modal.style.display = 'flex';
    input.value = ''; // 清空输入
    input.focus(); // 自动聚焦
    
    // 监听回车键
    input.onkeydown = function(e) {
        if (e.key === 'Enter') {
            confirmPKSeed();
        } else if (e.key === 'Escape') {
            closePKSeedModal();
        }
    };
}

// 关闭PK种子输入弹窗
function closePKSeedModal(e) {
    if (e && e.target.id !== 'pk-seed-modal' && !e.target.closest('.pk-seed-card')) {
        return; // 点击弹窗内容时不关闭
    }
    const modal = document.getElementById('pk-seed-modal');
    if (modal) {
        modal.style.display = 'none';
    }
    pendingPKMode = null;
}

// 确认PK种子并开始游戏
function confirmPKSeed() {
    // 获取当前游戏状态
    const currentScope = window.GameState ? window.GameState.currentScope : 'world';
    
    const input = document.getElementById('pk-seed-input');
    if (!input) {
        console.error('PK种子输入框未找到');
        return;
    }
    
    const seedValue = input.value.trim();
    
    if (!seedValue) {
        showErrorModal('请输入一个数字种子！');
        return;
    }
    
    const seed = parseInt(seedValue);
    if (isNaN(seed)) {
        showErrorModal('请输入有效的数字！');
        return;
    }
    
    // 关闭弹窗
    closePKSeedModal();
    
    // 继续PK模式的游戏逻辑
    window.currentGameSeed = seed;
    
    // 获取数据引用
    const dbWorld = window.GameData ? window.GameData.dbWorld : [];
    
    if (currentScope === 'world' && dbWorld.length > 0) {
        const sovereignPool = dbWorld.filter(c => c.sovereign === true);
        const rng = window.mulberry32 ? window.mulberry32(seed) : Math.random;
        const shuffled = window.shuffleArray ? window.shuffleArray(sovereignPool, rng) : sovereignPool.sort(() => Math.random() - 0.5);
        const questionPool = shuffled.slice(0, 50);
        
        // 更新游戏状态
        if (window.GameState) {
            window.GameState.gameMode = 'pk';
            window.GameState.questionPool = questionPool;
            window.GameState.totalQs = questionPool.length;
            window.GameState.score = 0;
            window.GameState.isProcessing = false;
        }
        
        // 更新 GameState
        if (window.GameState) {
            window.GameState.gameMode = 'pk';
            window.GameState.questionPool = questionPool;
            window.GameState.totalQs = questionPool.length;
            window.GameState.score = 0;
            window.GameState.isProcessing = false;
        }
        
        // 直接设置状态并调用 nextRound
        if (questionPool.length === 0) {
            showErrorModal('题库为空！');
            return;
        }
        
        // 更新 script.js 中的局部变量（通过调用 initDataReferences 和 syncStateToGameState）
        // 注意：这些函数在 script.js 中定义，用于同步状态
        if (window.initDataReferences) {
            window.initDataReferences();
        }
        if (window.syncStateToGameState) {
            window.syncStateToGameState();
        }
        
        // 重置UI状态
        const answerFeedback = document.getElementById('answer-feedback');
        const gameMapBtn = document.getElementById('game-map-btn');
        const nextBtn = document.getElementById('next-btn');
        if (answerFeedback) answerFeedback.style.display = 'none';
        if (gameMapBtn) gameMapBtn.style.display = 'none';
        if (nextBtn) nextBtn.style.display = 'none';
        
        const gameModeLabel = document.getElementById('game-mode-label');
        if (gameModeLabel) {
            let prefix = (currentScope === 'world') ? '🌍 ' : '🇨🇳 ';
            let modeLabel = `PK模式 (种子: ${window.currentGameSeed})`;
            gameModeLabel.textContent = prefix + modeLabel;
        }
        
        if (window.showView) {
            window.showView('view-game');
        }
        
        // 调用 script.js 中的 nextRound
        if (window.nextRound) {
            window.nextRound();
        } else {
            showErrorModal('游戏引擎未初始化！请确保 script.js 已加载。');
        }
    } else {
        // 中国模式不支持PK
        showErrorModal('PK模式目前仅支持世界模式！');
    }
}

// 显示错误提示弹窗
function showErrorModal(message) {
    const modal = document.getElementById('error-modal');
    const messageEl = document.getElementById('error-message');
    if (!modal || !messageEl) {
        // 如果弹窗元素不存在，使用 alert 作为后备
        alert(message);
        return;
    }
    messageEl.textContent = message;
    modal.style.display = 'flex';
}

// 关闭错误提示弹窗
function closeErrorModal(e) {
    if (e && e.target.id !== 'error-modal' && !e.target.closest('.error-card')) {
        return;
    }
    const modal = document.getElementById('error-modal');
    if (modal) {
        modal.style.display = 'none';
    }
    // 如果是在PK模式输入时出错，返回菜单
    if (pendingPKMode === 'pk') {
        if (window.goHome) {
            window.goHome();
        }
        pendingPKMode = null;
    }
}

// 暴露到全局
window.showPKSeedModal = showPKSeedModal;
window.closePKSeedModal = closePKSeedModal;
window.confirmPKSeed = confirmPKSeed;
window.showErrorModal = showErrorModal;
window.closeErrorModal = closeErrorModal;

