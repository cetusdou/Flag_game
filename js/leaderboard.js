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

// 切换标签页
function switchRankTab(scope) {
    // 更新标签按钮状态
    document.querySelectorAll('.rank-tab').forEach(tab => {
        tab.classList.remove('active');
        if (tab.dataset.tab === scope) {
            tab.classList.add('active');
        }
    });
    
    // 更新内容显示
    document.querySelectorAll('.rank-list').forEach(list => {
        list.classList.remove('active');
    });
    const activeList = document.getElementById(`rank-list-${scope}`);
    if (activeList) {
        activeList.classList.add('active');
    }
    
    // 渲染对应范围的数据
    renderRankList(scope);
}

// 渲染指定范围的排行榜
function renderRankList(scope) {
    const records = JSON.parse(localStorage.getItem('gameRecords') || '[]');
    const rankList = document.getElementById(`rank-list-${scope}`);
    
    if (!rankList) return;
    
    // 筛选对应范围的记录
    const filteredRecords = records.filter(r => r.scope === scope);
    
    if (filteredRecords.length === 0) {
        rankList.innerHTML = '<p style="color:#aaa; text-align:center; padding:20px;">暂无历史记录</p>';
        return;
    }
    
    // 按分数和正确率排序
    const sorted = filteredRecords.sort((a, b) => {
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
            'mode_3a': '极速冲刺(简单)',
            'mode_3b': '极速冲刺(困难)',
            'all': '♾️ 全图鉴',
            'airport': '✈️ 猜机场',
            'pokemon': '⚡ 猜宝可梦',
            'pk': '⚔️ PK模式',
            'f1': '🏎️ F1赛道',
            'football_easy': '⚽ 足球(简单)',
            'football_medium': '⚽ 足球(中等)',
            'football_hard': '⚽ 足球(困难)',
            'football_hell': '⚽ 足球(地狱)',
            'pk_football_easy': '⚔️ 足球PK(简单)',
            'pk_football_medium': '⚔️ 足球PK(中等)',
            'pk_football_hard': '⚔️ 足球PK(困难)',
            'pk_football_hell': '⚔️ 足球PK(地狱)',
            'city_network': '🗺️ 路网挑战',
            'china_daily_network': '📅 每日挑战(路网)'
        };
        const modeName = modeNames[r.mode] || r.mode;
        
        html += `
            <div style="background:rgba(255,255,255,0.05); padding:12px; border-radius:8px; display:flex; justify-content:space-between; align-items:center;">
                <div>
                    <span style="color:#4CAF50; font-weight:bold; margin-right:10px;">#${idx+1}</span>
                    <span style="color:#fff;">${modeName}</span>
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

// 显示排行榜
function showRank() {
    if (window.showView) {
        window.showView('view-rank');
    }
    // 默认显示世界模式
    switchRankTab('world');
}

// 清空记录
function clearRecords() {
    if (confirm('确定要清空所有历史记录吗？此操作不可恢复！')) {
        localStorage.removeItem('gameRecords');
        // 刷新所有标签页
        const activeTab = document.querySelector('.rank-tab.active');
        if (activeTab) {
            switchRankTab(activeTab.dataset.tab);
        } else {
            switchRankTab('world');
        }
    }
}

// 暴露到全局
window.saveGameRecord = saveGameRecord;
window.showRank = showRank;
window.clearRecords = clearRecords;
window.switchRankTab = switchRankTab;

