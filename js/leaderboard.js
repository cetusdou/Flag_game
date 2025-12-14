// ============================================================================
// 排行榜模块 - 历史记录和排行榜功能
// ============================================================================

// 保存游戏记录
function saveGameRecord() {
    // 获取当前游戏状态
    const currentScope = window.GameState ? window.GameState.currentScope : 'world';
    const gameMode = window.GameState ? window.GameState.gameMode : '';
    const score = window.GameState ? window.GameState.score : 0;
    const totalQs = window.GameState ? window.GameState.totalQs : 0;
    
    const record = {
        scope: currentScope,
        mode: gameMode,
        score: score,
        total: totalQs,
        percentage: Math.round((score / totalQs) * 100),
        date: new Date().toISOString(),
        seed: window.currentGameSeed || null // PK模式的种子
    };
    
    let records = JSON.parse(localStorage.getItem('gameRecords') || '[]');
    records.push(record);
    
    // 只保留最近100条记录
    if (records.length > 100) {
        records = records.slice(-100);
    }
    
    localStorage.setItem('gameRecords', JSON.stringify(records));
}

// 显示排行榜
function showRank() {
    if (window.showView) {
        window.showView('view-rank');
    }
    const records = JSON.parse(localStorage.getItem('gameRecords') || '[]');
    const rankList = document.getElementById('rank-list');
    
    if (records.length === 0) {
        rankList.innerHTML = '<p style="color:#aaa; text-align:center; padding:20px;">暂无历史记录</p>';
        return;
    }
    
    // 按分数和正确率排序
    const sorted = records.sort((a, b) => {
        if (b.percentage !== a.percentage) return b.percentage - a.percentage;
        if (b.score !== a.score) return b.score - a.score;
        return new Date(b.date) - new Date(a.date);
    });
    
    let html = '<div style="display:grid; gap:10px;">';
    sorted.slice(0, 20).forEach((r, idx) => {
        const date = new Date(r.date);
        const dateStr = `${date.getMonth()+1}/${date.getDate()} ${date.getHours().toString().padStart(2,'0')}:${date.getMinutes().toString().padStart(2,'0')}`;
        const modeNames = {
            'mode_1': '每日挑战',
            'mode_2': '形状挑战',
            'mode_3': '极速冲刺',
            'all': '♾️ 全图鉴',
            'pk': '⚔️ PK模式'
        };
        const scopeName = r.scope === 'world' ? '🌍' : '🇨🇳';
        const modeName = modeNames[r.mode] || r.mode;
        
        html += `
            <div style="background:rgba(255,255,255,0.05); padding:12px; border-radius:8px; display:flex; justify-content:space-between; align-items:center;">
                <div>
                    <span style="color:#4CAF50; font-weight:bold; margin-right:10px;">#${idx+1}</span>
                    <span style="color:#fff;">${scopeName} ${modeName}</span>
                    ${r.seed ? `<span style="color:#FF9800; margin-left:8px; font-size:0.85em;">种子:${r.seed}</span>` : ''}
                    <span style="color:#4CAF50; margin-left:10px; font-weight:bold;">${r.score}/${r.total}</span>
                    <span style="color:#aaa; margin-left:10px;">(${r.percentage}%)</span>
                </div>
                <span style="color:#888; font-size:0.9em;">${dateStr}</span>
            </div>
        `;
    });
    html += '</div>';
    rankList.innerHTML = html;
}

// 清空记录
function clearRecords() {
    if (confirm('确定要清空所有历史记录吗？此操作不可恢复！')) {
        localStorage.removeItem('gameRecords');
        showRank(); // 刷新显示
    }
}

// 暴露到全局
window.saveGameRecord = saveGameRecord;
window.showRank = showRank;
window.clearRecords = clearRecords;

