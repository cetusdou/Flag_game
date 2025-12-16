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
        'city_network': '路网挑战',
        'china_daily_network': '每日挑战(路网)'
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

// 存储当前生成的卡片数据URL
let currentShareCardDataURL = null;
let currentShareCardFileName = '';

// 关闭分享卡片模态框
function closeShareCardModal(event) {
    if (event) {
        event.stopPropagation();
    }
    const modal = document.getElementById('share-card-modal');
    if (modal) {
        modal.style.display = 'none';
    }
    // 重置状态
    const previewContainer = document.getElementById('share-card-preview-container');
    const loadingDiv = document.getElementById('share-card-loading');
    if (previewContainer) previewContainer.style.display = 'none';
    if (loadingDiv) loadingDiv.style.display = 'block';
    currentShareCardDataURL = null;
    currentShareCardFileName = '';
}

// 下载分享卡片
function downloadShareCard() {
    if (!currentShareCardDataURL) {
        alert('分享卡片未生成，请重试');
        return;
    }
    const link = document.createElement('a');
    link.download = currentShareCardFileName;
    link.href = currentShareCardDataURL;
    link.click();
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
    
    // 显示模态框
    const modal = document.getElementById('share-card-modal');
    const previewContainer = document.getElementById('share-card-preview-container');
    const loadingDiv = document.getElementById('share-card-loading');
    if (modal) {
        modal.style.display = 'flex';
        if (previewContainer) previewContainer.style.display = 'none';
        if (loadingDiv) loadingDiv.style.display = 'block';
    }
    
    // 更新分享卡片内容
    const shareCard = document.getElementById('share-card');
    const shareCardMode = document.getElementById('share-card-mode');
    const shareCardScore = document.getElementById('share-card-score');
    const shareCardDetail = document.getElementById('share-card-detail');
    const shareCardDate = document.getElementById('share-card-date');
    
    if (!shareCard || !shareCardMode || !shareCardScore || !shareCardDetail || !shareCardDate) {
        alert('分享卡片元素未找到');
        if (modal) modal.style.display = 'none';
        return;
    }
    
    // 设置模式名称
    const scopeName = getScopeDisplayName(currentScope);
    const modeName = getModeDisplayName(gameMode);
    shareCardMode.textContent = scopeName ? `${scopeName} - ${modeName}` : modeName;
    
    // 设置分数
    shareCardScore.textContent = `${score}/${totalQs}`;
    
    // 设置详情，根据分数添加不同的评价和样式
    let detailText = `正确率: ${percentage}%`;
    let detailStyle = '';
    if (percentage === 100) {
        detailText += " 完美！";
        detailStyle = 'text-shadow: 0 0 20px rgba(255,255,255,0.5), 0 4px 15px rgba(0,0,0,0.3);';
    } else if (percentage >= 80) {
        detailText += " 很棒！";
        detailStyle = 'text-shadow: 0 0 15px rgba(255,255,255,0.3), 0 3px 12px rgba(0,0,0,0.3);';
    } else if (percentage >= 60) {
        detailText += " 继续加油！";
        detailStyle = 'text-shadow: 0 2px 10px rgba(0,0,0,0.3);';
    } else {
        detailText += " 再接再厉！";
        detailStyle = 'text-shadow: 0 2px 10px rgba(0,0,0,0.3);';
    }
    shareCardDetail.textContent = detailText;
    shareCardDetail.setAttribute('style', shareCardDetail.getAttribute('style') + detailStyle);
    
    // 设置日期
    const now = new Date();
    const dateStr = `${now.getFullYear()}年${now.getMonth()+1}月${now.getDate()}日 ${now.getHours().toString().padStart(2,'0')}:${now.getMinutes().toString().padStart(2,'0')}`;
    shareCardDate.textContent = dateStr;
    
    // 根据范围设置不同的渐变背景，使用更丰富的渐变
    if (currentScope === 'world') {
        shareCard.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #667eea 100%)';
        shareCard.style.boxShadow = '0 20px 60px rgba(102, 126, 234, 0.5), inset 0 1px 0 rgba(255,255,255,0.2)';
    } else if (currentScope === 'china') {
        shareCard.style.background = 'linear-gradient(135deg, #f093fb 0%, #f5576c 50%, #f093fb 100%)';
        shareCard.style.boxShadow = '0 20px 60px rgba(240, 147, 251, 0.5), inset 0 1px 0 rgba(255,255,255,0.2)';
    } else if (currentScope === 'sports') {
        shareCard.style.background = 'linear-gradient(135deg, #fa709a 0%, #fee140 50%, #fa709a 100%)';
        shareCard.style.boxShadow = '0 20px 60px rgba(250, 112, 154, 0.5), inset 0 1px 0 rgba(255,255,255,0.2)';
    }
    
    // 生成图片
    html2canvas(shareCard, {
        backgroundColor: null,
        scale: 2,
        width: 800,
        height: 600,
        useCORS: true,
        logging: false
    }).then(canvas => {
        const dataURL = canvas.toDataURL('image/png');
        currentShareCardDataURL = dataURL;
        currentShareCardFileName = `答题大师_${scopeName}_${modeName}_${score}_${totalQs}_${Date.now()}.png`;
        
        // 显示图片
        const shareCardImage = document.getElementById('share-card-image');
        if (shareCardImage) {
            shareCardImage.src = dataURL;
            // 确保图片加载完成后再显示
            shareCardImage.onload = function() {
                // 隐藏加载提示，显示预览
                if (loadingDiv) loadingDiv.style.display = 'none';
                if (previewContainer) previewContainer.style.display = 'block';
            };
            // 如果图片已经缓存，立即显示
            if (shareCardImage.complete) {
                if (loadingDiv) loadingDiv.style.display = 'none';
                if (previewContainer) previewContainer.style.display = 'block';
            }
        } else {
            // 如果找不到图片元素，仍然显示预览容器
            if (loadingDiv) loadingDiv.style.display = 'none';
            if (previewContainer) previewContainer.style.display = 'block';
        }
    }).catch(err => {
        console.error('生成分享卡片失败:', err);
        alert('生成分享卡片失败，请重试');
        if (modal) modal.style.display = 'none';
    });
}

// 暴露到全局
window.generateShareCard = generateShareCard;
window.closeShareCardModal = closeShareCardModal;
window.downloadShareCard = downloadShareCard;

