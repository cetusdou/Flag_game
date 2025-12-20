// ============================================================================
// 地图处理模块
// ============================================================================

let myChart = null;

function initMapDataReferences() {
    const gameState = window.GameState;
    const gameData = window.GameData;
    
    if (!gameState || !gameData) {
        return null;
    }
    
    return {
        dbWorld: gameData.dbWorld,
        worldNameMap: gameData.worldNameMap,
        myChart: gameState.myChart || null
    };
}

function initEChartsMap(code) {
    const refs = initMapDataReferences();
    if (!refs) return;
    
    const dom = document.getElementById("echarts-map-container");
    if (myChart) myChart.dispose();
    myChart = echarts.init(dom);
    
    if (window.GameState) {
        window.GameState.myChart = myChart;
    }
    
    const option = {
        backgroundColor: '#100C2A',
        tooltip: { 
            trigger: 'item', 
            formatter: function(p){
                const found = refs.dbWorld.find(c => c.id.toUpperCase() === p.name);
                return found ? found.name : p.name;
            }
        },
        geo: {
            map: 'world', 
            roam: true, 
            zoom: 1.2,
            itemStyle: { 
                normal: { areaColor: '#323c48', borderColor: '#111' }, 
                emphasis: { areaColor: '#2a333d' } 
            },
            nameMap: refs.worldNameMap,
            regions: [{ 
                name: code, 
                itemStyle: { 
                    areaColor: '#00ff88',
                    opacity: 1,
                    borderColor: '#00ff88',
                    borderWidth: 2
                },
                emphasis: {
                    areaColor: '#00ff88',
                    borderColor: '#00ff88',
                    borderWidth: 3
                }
            }]
        }
    };
    myChart.setOption(option);
    window.addEventListener('resize', () => myChart.resize());
}

function openMap(item) {
    // 安全检查：确保 item 存在且有 id 字段
    if (!item || !item.id) {
        console.error('无法打开地图：缺少必要的数据字段', item);
        return;
    }
    
    // 清除自动跳转定时器（如果存在）
    if (window.autoNextTimer) {
        clearTimeout(window.autoNextTimer);
        window.autoNextTimer = null;
    }
    document.getElementById('info-modal').style.display = 'none';
    document.getElementById('map-modal').style.display = 'flex';
    setTimeout(() => { 
        window.initEChartsMap(item.id.toUpperCase());
    }, 100);
}

function closeMap() {
    document.getElementById('map-modal').style.display = 'none';
    
    // 关闭地图后，如果还有题目，恢复自动跳转
    const refs = window.initDataReferences ? window.initDataReferences() : null;
    if (refs && refs.questionPool && refs.questionPool.length > 0 && refs.isProcessing) {
        // 清除之前的自动跳转定时器（如果存在）
        if (window.autoNextTimer) {
            clearTimeout(window.autoNextTimer);
            window.autoNextTimer = null;
        }
        
        // 设置1.5秒后自动跳转下一题
        window.autoNextTimer = setTimeout(() => {
            window.autoNextTimer = null;
            const currentRefs = window.initDataReferences ? window.initDataReferences() : null;
            if (currentRefs && currentRefs.questionPool.length > 0) {
                let nextGameState = {
                    ...currentRefs,
                    isProcessing: false
                };
                if (window.syncStateToGameState) {
                    window.syncStateToGameState(nextGameState);
                }
                if (window.nextRound) {
                    window.nextRound();
                }
            } else if (currentRefs && currentRefs.questionPool.length === 0) {
                // 题目已全部完成
                let finalGameState = {
                    ...currentRefs,
                    isProcessing: false
                };
                if (window.syncStateToGameState) {
                    window.syncStateToGameState(finalGameState);
                }
                if (window.saveGameRecord) window.saveGameRecord();
                if (window.showView) window.showView('view-result');
                const resultScore = document.getElementById('result-score');
                const resultTitle = document.getElementById('result-title');
                const resultDetail = document.getElementById('result-detail');
                if (resultScore) resultScore.textContent = currentRefs.score + " / " + currentRefs.totalQs;
                if (resultTitle) resultTitle.textContent = "🎉 挑战完成!";
                const percentage = Math.round((currentRefs.score / currentRefs.totalQs) * 100);
                let detail = `正确率: ${percentage}%`;
                if (percentage === 100) detail += " 🌟 完美！";
                else if (percentage >= 80) detail += " 👍 很棒！";
                else if (percentage >= 60) detail += " 💪 继续加油！";
                if (resultDetail) resultDetail.textContent = detail;
            }
        }, 1500);
    }
}

window.initEChartsMap = initEChartsMap;
window.openMap = openMap;
window.closeMap = closeMap;
