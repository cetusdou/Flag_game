// ============================================================================
// 弹窗处理模块 - PK模式弹窗和错误提示弹窗
// ============================================================================

let pendingPKMode = null; // 存储待处理的PK模式

// 显示PK种子输入弹窗
function showPKSeedModal() {
    pendingPKMode = 'pk'; // 标记为PK模式
    const modal = document.getElementById('pk-seed-modal');
    const input = document.getElementById('pk-seed-input');
    const difficultySelector = document.getElementById('pk-difficulty-selector');
    if (!modal || !input) {
        return;
    }
    
    // 检查当前模式，如果是体育模式则显示难度选择
    const currentScope = window.GameState ? window.GameState.currentScope : 'world';
    if (currentScope === 'sports' && difficultySelector) {
        difficultySelector.style.display = 'block';
        // 默认选择简单难度
        selectPKDifficulty('easy');
    } else if (difficultySelector) {
        difficultySelector.style.display = 'none';
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

// 选择PK难度
function selectPKDifficulty(difficulty) {
    // 移除所有按钮的选中状态
    document.querySelectorAll('.pk-difficulty-btn').forEach(btn => {
        btn.classList.remove('selected');
    });
    
    // 添加选中状态到当前按钮
    const selectedBtn = document.querySelector(`.pk-difficulty-btn[data-difficulty="${difficulty}"]`);
    if (selectedBtn) {
        selectedBtn.classList.add('selected');
    }
    
    // 保存选中的难度
    window.selectedPKDifficulty = difficulty;
}

// 暴露到全局
window.selectPKDifficulty = selectPKDifficulty;

// 打开图片放大模态框
function openImageZoom(imageSrc, applyMask = false) {
    const modal = document.getElementById('image-zoom-modal');
    const zoomedImg = document.getElementById('zoomed-image');
    if (!modal || !zoomedImg) {
        return;
    }
    zoomedImg.src = imageSrc;
    // 如果 applyMask 为 true，应用遮罩样式（用于每日挑战）
    if (applyMask) {
        zoomedImg.classList.add('city-network-daily-mask');
    } else {
        zoomedImg.classList.remove('city-network-daily-mask');
    }
    modal.style.display = 'flex';
}

// 关闭图片放大模态框
function closeImageZoom(e) {
    if (e && e.target.id !== 'image-zoom-modal' && !e.target.closest('.image-zoom-content') && e.target.id !== 'image-zoom-modal' && e.target.className !== 'image-zoom-close') {
        return;
    }
    const modal = document.getElementById('image-zoom-modal');
    const zoomedImg = document.getElementById('zoomed-image');
    if (modal) {
        modal.style.display = 'none';
    }
    // 清除遮罩样式，避免影响下次打开
    if (zoomedImg) {
        zoomedImg.classList.remove('city-network-daily-mask');
    }
}

window.openImageZoom = openImageZoom;
window.closeImageZoom = closeImageZoom;

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
    window.selectedPKDifficulty = null; // 清除选中的难度
}

// 确认PK种子并开始游戏
function confirmPKSeed() {
    // 获取当前游戏状态
    const currentScope = window.GameState ? window.GameState.currentScope : 'world';
    
    const input = document.getElementById('pk-seed-input');
    if (!input) {
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
    
    // 先保存选中的难度（在关闭弹窗前）
    const selectedDifficulty = window.selectedPKDifficulty || 'easy';
    
    // 关闭弹窗
    closePKSeedModal();
    
    // 继续PK模式的游戏逻辑
    window.currentGameSeed = seed;
    
    // 获取数据引用
    let questionPool = [];
    let gameMode = 'pk';
    
    if (currentScope === 'world') {
        const dbWorld = window.GameData ? window.GameData.dbWorld : [];
        if (dbWorld.length > 0) {
            const sovereignPool = dbWorld.filter(c => c.sovereign === true);
            const rng = window.mulberry32 ? window.mulberry32(seed) : Math.random;
            const shuffled = window.shuffleArray ? window.shuffleArray(sovereignPool, rng) : sovereignPool.sort(() => Math.random() - 0.5);
            questionPool = shuffled.slice(0, 50);
        }
    } else if (currentScope === 'sports') {
        // 体育模式PK：使用足球俱乐部
        const dbFootballClubs = window.GameData ? window.GameData.dbFootballClubs : [];
        if (dbFootballClubs.length > 0) {
            // 使用保存的难度
            const difficulty = selectedDifficulty;
            
            // 简单模式：只使用五大联赛的球队
            let pool = [];
            if (difficulty === 'easy') {
                const topFiveLeagues = ['Premier League', 'La Liga', 'Serie A', 'Bundesliga', 'Ligue 1'];
                pool = dbFootballClubs.filter(club => topFiveLeagues.includes(club.league));
            } else {
                pool = [...dbFootballClubs];
            }
            
            if (pool.length === 0) {
                showErrorModal('题库为空！');
                return;
            }
            
            const rng = window.mulberry32 ? window.mulberry32(seed) : Math.random;
            const shuffled = window.shuffleArray ? window.shuffleArray(pool, rng) : pool.sort(() => Math.random() - 0.5);
            questionPool = shuffled.slice(0, 20);
            gameMode = `pk_football_${difficulty}`;
        }
    }
    
    // 直接设置状态并调用 nextRound
    if (questionPool.length === 0) {
        if (currentScope === 'china') {
            showErrorModal('PK模式目前不支持中国模式！');
        } else {
            showErrorModal('题库为空！');
        }
        return;
    }
    
    // 更新游戏状态（通过调用 syncStateToGameState）
    if (window.syncStateToGameState) {
        window.syncStateToGameState({
            currentScope: currentScope,
            gameMode: gameMode,
            questionPool: questionPool,
            currentQ: null,
            score: 0,
            totalQs: questionPool.length,
            isProcessing: false,
            footballDifficulty: (currentScope === 'sports') ? selectedDifficulty : 'easy'
        });
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
        let prefix = '';
        if (currentScope === 'world') prefix = '🌍 ';
        else if (currentScope === 'sports') prefix = '⚽ ';
        let modeLabel = `PK模式 (种子: ${window.currentGameSeed})`;
        gameModeLabel.textContent = prefix + modeLabel;
    }
    
    if (window.showView) {
        window.showView('view-game');
    }
    
    // 调用 nextRound
    if (window.nextRound) {
        window.nextRound();
    } else {
        showErrorModal('游戏引擎未初始化！请确保 script.js 已加载。');
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

