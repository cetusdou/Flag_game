// ============================================================================
// 图片遮罩工具模块 - 使用Canvas实现遮罩，防止用户下载原始图片
// ============================================================================

/**
 * 将图片转换为带遮罩的Canvas（只显示中间50%区域）
 * @param {string} imageSrc - 图片URL
 * @param {number} maskPercent - 遮罩百分比（默认25%，即显示中间50%区域）
 * @returns {Promise<HTMLCanvasElement>} 返回Canvas元素
 */
async function createMaskedCanvas(imageSrc, maskPercent = 25) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'anonymous'; // 允许跨域（如果图片支持）
        
        img.onload = function() {
            // 创建Canvas
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            // 设置Canvas尺寸
            canvas.width = img.width;
            canvas.height = img.height;
            
            // 计算遮罩区域（只显示中间部分）
            // maskPercent = 25 表示上下左右各遮罩25%，显示中间50%
            const maskLeft = (img.width * maskPercent) / 100;
            const maskTop = (img.height * maskPercent) / 100;
            const maskRight = img.width - maskLeft;
            const maskBottom = img.height - maskTop;
            const visibleWidth = maskRight - maskLeft;
            const visibleHeight = maskBottom - maskTop;
            
            // 先绘制黑色背景（遮罩部分）
            ctx.fillStyle = '#000000';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            // 绘制可见区域（中间部分）
            ctx.drawImage(
                img,
                maskLeft, maskTop, visibleWidth, visibleHeight,  // 源图片裁剪区域
                maskLeft, maskTop, visibleWidth, visibleHeight  // Canvas绘制区域
            );
            
            resolve(canvas);
        };
        
        img.onerror = function() {
            reject(new Error('图片加载失败'));
        };
        
        img.src = imageSrc;
    });
}

/**
 * 将Canvas转换为DataURL（用于显示）
 * @param {HTMLCanvasElement} canvas - Canvas元素
 * @returns {string} DataURL字符串
 */
function canvasToDataURL(canvas) {
    return canvas.toDataURL('image/png');
}

/**
 * 将Canvas转换为Blob（用于下载）
 * @param {HTMLCanvasElement} canvas - Canvas元素
 * @returns {Promise<Blob>} Blob对象
 */
function canvasToBlob(canvas) {
    return new Promise((resolve) => {
        canvas.toBlob((blob) => {
            resolve(blob);
        }, 'image/png');
    });
}

/**
 * 下载带遮罩的Canvas（使用通用文件名）
 * @param {HTMLCanvasElement} canvas - Canvas元素
 * @param {string} filename - 文件名（默认：daily-challenge.png）
 */
function downloadMaskedCanvas(canvas, filename = 'daily-challenge.png') {
    canvas.toBlob((blob) => {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        // 延迟释放URL，确保下载完成
        setTimeout(() => {
            URL.revokeObjectURL(url);
        }, 100);
    }, 'image/png');
}

/**
 * 为Canvas添加下载保护，确保使用通用文件名
 * @param {HTMLCanvasElement} canvas - Canvas元素
 * @param {string} filename - 文件名（默认：daily-challenge.png）
 */
function protectCanvasDownload(canvas, filename = 'daily-challenge.png') {
    // 设置data属性
    canvas.setAttribute('data-filename', filename);
    
    // 拦截右键菜单（不自动下载，只是禁用右键菜单）
    canvas.addEventListener('contextmenu', function(e) {
        e.preventDefault();
        return false;
    }, true);
    
    // 拦截拖拽
    canvas.addEventListener('dragstart', function(e) {
        e.preventDefault();
        return false;
    }, true);
    
    // 拦截复制操作（防止通过复制粘贴获取图片）
    canvas.addEventListener('copy', function(e) {
        e.preventDefault();
        return false;
    }, true);
    
    // 拦截选择操作（防止通过选择获取图片）
    canvas.addEventListener('selectstart', function(e) {
        e.preventDefault();
        return false;
    }, true);
}

// 暴露到全局
window.createMaskedCanvas = createMaskedCanvas;
window.canvasToDataURL = canvasToDataURL;
window.canvasToBlob = canvasToBlob;
window.downloadMaskedCanvas = downloadMaskedCanvas;
window.protectCanvasDownload = protectCanvasDownload;

