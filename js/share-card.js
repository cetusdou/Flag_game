// ============================================================================
// 分享卡片模块 - 生成游戏结果分享卡片
// ============================================================================

// 获取模式名称
function getModeDisplayName(mode) {
    const modeNames = {
        'mode_1': '每日挑战',
        'mode_2': '形状挑战',
        'mode_3a': '极速冲刺(简单)',
        'mode_3b': '极速冲刺(困难)',
        'all': '全图鉴',
        'pk': 'PK模式',
        'f1': 'F1赛道',
        'football_easy': '足球(简单)',
        'football_medium': '足球(中等)',
        'football_hard': '足球(困难)',
        'football_hell': '足球(地狱)',
        'pk_football_easy': '足球PK(简单)',
        'pk_football_medium': '足球PK(中等)',
        'pk_football_hard': '足球PK(困难)',
        'pk_football_hell': '足球PK(地狱)',
        'city_network': '路网挑战'
    };
    return modeNames[mode] || mode;
}

// 获取范围名称
function getScopeDisplayName(scope) {
    const scopeNames = {
        'world': '世界模式',
        'china': '中国模式',
        'sports': '体育模式'
    };
    return scopeNames[scope] || '';
}

// 生成分享卡片
function generateShareCard() {
    if (typeof html2canvas === 'undefined') {
        alert('分享功能加载失败，请刷新页面重试');
        return;
    }
    
    const refs = window.initDataReferences ? window.initDataReferences() : null;
    if (!refs) {
        alert('无法获取游戏数据');
        return;
    }
    
    const score = refs.score || 0;
    const totalQs = refs.totalQs || 0;
    const gameMode = refs.gameMode || '';
    const currentScope = refs.currentScope || 'world';
    const percentage = totalQs > 0 ? Math.round((score / totalQs) * 100) : 0;
    
    // 更新分享卡片内容
    const shareCard = document.getElementById('share-card');
    const shareCardMode = document.getElementById('share-card-mode');
    const shareCardScore = document.getElementById('share-card-score');
    const shareCardDetail = document.getElementById('share-card-detail');
    const shareCardDate = document.getElementById('share-card-date');
    
    if (!shareCard || !shareCardMode || !shareCardScore || !shareCardDetail || !shareCardDate) {
        alert('分享卡片元素未找到');
        return;
    }
    
    // 设置模式名称
    const scopeName = getScopeDisplayName(currentScope);
    const modeName = getModeDisplayName(gameMode);
    shareCardMode.textContent = scopeName ? `${scopeName} - ${modeName}` : modeName;
    
    // 设置分数
    shareCardScore.textContent = `${score}/${totalQs}`;
    
    // 设置详情
    let detailText = `正确率: ${percentage}%`;
    if (percentage === 100) detailText += " 完美！";
    else if (percentage >= 80) detailText += " 很棒！";
    else if (percentage >= 60) detailText += " 继续加油！";
    shareCardDetail.textContent = detailText;
    
    // 设置日期
    const now = new Date();
    const dateStr = `${now.getFullYear()}年${now.getMonth()+1}月${now.getDate()}日 ${now.getHours().toString().padStart(2,'0')}:${now.getMinutes().toString().padStart(2,'0')}`;
    shareCardDate.textContent = dateStr;
    
    // 根据范围设置不同的渐变背景
    if (currentScope === 'world') {
        shareCard.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
    } else if (currentScope === 'china') {
        shareCard.style.background = 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)';
    } else if (currentScope === 'sports') {
        shareCard.style.background = 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)';
    }
    
    // 生成图片
    const container = document.getElementById('share-card-container');
    html2canvas(shareCard, {
        backgroundColor: null,
        scale: 2,
        width: 800,
        height: 600,
        useCORS: true
    }).then(canvas => {
        // 创建下载链接
        const link = document.createElement('a');
        link.download = `答题大师_${scopeName}_${modeName}_${score}_${totalQs}_${Date.now()}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
    }).catch(err => {
        console.error('生成分享卡片失败:', err);
        alert('生成分享卡片失败，请重试');
    });
}

// 暴露到全局
window.generateShareCard = generateShareCard;

