// ============================================================================
// 游戏状态管理模块 - 管理游戏状态变量
// ============================================================================

window.GameState = {
    currentScope: 'world',
    gameMode: '',
    questionPool: [],
    currentQ: null,
    score: 0,
    totalQs: 0,
    isProcessing: false,
    myChart: null,
    footballDifficulty: 'easy',
    isFootballSubMenu: false,
    isSprintSubMenu: false
};

// 获取数据引用（简化访问）
window.GameState.getData = function() {
    return window.GameData;
};

