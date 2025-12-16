// ============================================================================
// 随机数工具模块
// ============================================================================

/**
 * Mulberry32 伪随机数生成器（用于可重复的随机序列）
 * @param {number} seed - 种子值
 * @returns {Function} - 返回随机数生成函数（0-1之间的浮点数）
 */
function mulberry32(seed) {
    return function() {
        let t = seed += 0x6D2B79F5;
        t = Math.imul(t ^ t >>> 15, t | 1);
        t ^= t + Math.imul(t ^ t >>> 7, t | 61);
        return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
}

/**
 * 获取今日的日期种子（使用中国时区UTC+8作为基准，确保所有用户在同一天看到相同题目）
 * @returns {number} 日期种子，格式：YYYYMMDD（例如：20241215）
 */
function getTodaySeed() {
    const today = new Date();
    // 使用中国时区（UTC+8）作为基准，确保所有用户在同一天看到相同的题目
    // 格式：YYYYMMDD，例如 20241215
    // 将UTC时间转换为中国时区（UTC+8）
    const chinaTime = new Date(today.getTime() + (8 * 60 * 60 * 1000));
    const year = chinaTime.getUTCFullYear();
    const month = chinaTime.getUTCMonth() + 1; // getUTCMonth() 返回 0-11
    const date = chinaTime.getUTCDate();
    return year * 10000 + month * 100 + date;
}

/**
 * 打乱数组（Fisher-Yates洗牌算法）
 * @param {Array} array - 要打乱的数组
 * @param {Function} rng - 随机数生成函数（可选，默认使用Math.random）
 * @returns {Array} - 打乱后的新数组（不修改原数组）
 */
function shuffleArray(array, rng) {
    if (!rng) rng = Math.random;
    const result = [...array];
    for (let i = result.length - 1; i > 0; i--) {
        const j = Math.floor(rng() * (i + 1));
        [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
}

// 暴露到全局
window.mulberry32 = mulberry32;
window.shuffleArray = shuffleArray;
window.getTodaySeed = getTodaySeed;

