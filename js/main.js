// 主入口文件 - 整合所有模块
// 注意：由于浏览器ES6模块限制，这里使用全局命名空间方式
// 各模块通过 window 对象暴露接口

// 全局状态
let isProcessing = false;

/**
 * 初始化游戏
 */
async function initGame() {
    try {
        await initData();
        document.getElementById('loading-screen').style.display = 'none';
        showView('view-landing');
    } catch (e) {
        alert("⚠️ 数据加载错误: " + e.message);
    }
}

/**
 * 开始游戏处理函数
 */
async function handleStartGame(modeKey) {
    const scope = getScope();
    const success = startGame(modeKey);
    
    if (!success) {
        alert("题库为空！");
        return;
    }
    
    // 重置UI状态
    document.getElementById('answer-feedback').style.display = 'none';
    document.getElementById('game-map-btn').style.display = 'none';
    document.getElementById('next-btn').style.display = 'none';
    
    const prefix = (scope === 'world') ? '🌍 ' : '🇨🇳 ';
    document.getElementById('game-mode-label').textContent = prefix + "挑战中";
    
    showView('view-game');
    nextRound();
}

/**
 * 下一题
 */
function nextRound() {
    const question = getNextQuestion();
    
    if (!question) {
        // 游戏结束
        const score = getScore();
        const total = getTotalQuestions();
        showResult(score, total);
        return;
    }
    
    resetProcessing();
    
    // 重置按钮显示
    document.getElementById('next-btn').style.display = 'none';
    document.getElementById('answer-feedback').style.display = 'none';
    document.getElementById('game-map-btn').style.display = 'none';
    
    // 更新UI
    const score = getScore();
    const progress = getProgress();
    updateScore(score);
    updateProgress(progress);
    
    // 更新题目显示
    const gameMode = getGameMode();
    const scope = getScope();
    updateGameUI(question, gameMode, scope);
    
    // 生成并渲染选项
    const options = generateOptions();
    renderOptions(options, gameMode, scope, handleAnswer);
}

/**
 * 处理答案选择
 */
function handleAnswer(choice, btn) {
    if (isProcessing) return;
    isProcessing = true;
    
    const result = checkAnswer(choice);
    const scope = getScope();
    const gameMode = getGameMode();
    
    if (result.isCorrect) {
        btn.classList.add('correct');
    } else {
        btn.classList.add('wrong');
        showAnswerFeedback(result.isCorrect, result.correctText, result.currentQ, scope);
    }
    
    updateScore(result.score);
    document.getElementById('next-btn').style.display = 'block';
    
    if (scope === 'world') {
        document.getElementById('game-map-btn').style.display = 'block';
        if (gameMode === 'mode_2') {
            document.getElementById('flag-img').classList.remove('silhouette');
        }
    }
}

/**
 * 处理地图按钮点击
 */
function handleMapClick() {
    const question = getCurrentQuestion();
    if (question) {
        openMap(question);
    }
}

// 暴露全局函数供HTML调用
window.showView = showView;
window.goHome = function() {
    isProcessing = false;
    closeMap();
    uiGoHome();
};
window.enterGameScope = function(scope) {
    setScope(scope);
    enterGameScope(scope);
};
window.startGameHandler = handleStartGame;
window.nextRound = nextRound;
window.openCompendium = openCompendium;
window.filterCompendium = filterCompendium;
window.showDetailHandler = showDetail;
window.closeModal = closeModal;
window.showRank = showRank;
window.openMapHandler = openMap;
window.closeMap = closeMap;
window.getCurrentScope = getScope;
window.initEChartsMap = function(code) {
    const { initEChartsMap: initMap } = require('./map-handler.js');
    initMap(code);
};

// 游戏地图按钮
window.openMap = handleMapClick;

// 初始化
window.onload = initGame;

