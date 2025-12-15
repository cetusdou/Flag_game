// ============================================================================
// 主入口文件 - 初始化游戏
// ============================================================================

async function initGame() {
    try {
        // 加载数据
        if (window.initGameData) {
            const success = await window.initGameData();
            if (!success) {
                alert("⚠️ 数据加载错误，请刷新页面重试");
                return;
            }
        } else {
            // 如果模块未加载，使用 script.js 中的 initGame（向后兼容）
            console.warn("数据管理模块未加载，使用 script.js 中的初始化");
            return; // script.js 会自己初始化
        }
        
        // 隐藏加载屏幕
        document.getElementById('loading-screen').style.display = 'none';
        
        // 显示主界面
        if (window.showView) {
            window.showView('view-landing');
        }
    } catch (e) {
        console.error("初始化错误:", e);
        alert("⚠️ 初始化错误: " + e.message);
    }
}

// 确保在DOM加载完成后初始化
// 使用标志防止重复初始化
let isInitialized = false;
function doInit() {
    if (isInitialized) {
        console.warn('initGame 已被调用，跳过重复初始化');
        return;
    }
    isInitialized = true;
    initGame();
}

if (document.readyState === 'loading') {
    window.addEventListener('DOMContentLoaded', function() {
        // 延迟执行，确保 script.js 中的 initGame 不会冲突
        setTimeout(doInit, 100);
    });
} else {
    setTimeout(doInit, 100);
}
