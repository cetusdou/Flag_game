// 随机数工具函数
(function() {
    'use strict';
    
    /**
     * Mulberry32 伪随机数生成器（用于可重复的随机序列）
     * @param {number} a - 种子值
     * @returns {Function} - 返回随机数生成函数
     */
    window.mulberry32 = function(a) {
        return function() {
            var t = a += 0x6D2B79F5;
            t = Math.imul(t ^ t >>> 15, t | 1);
            t ^= t + Math.imul(t ^ t >>> 7, t | 61);
            return ((t ^ t >>> 14) >>> 0) / 4294967296;
        };
    };
    
    /**
     * 打乱数组（Fisher-Yates洗牌算法）
     * @param {Array} array - 要打乱的数组
     * @param {Function} rng - 随机数生成函数（可选）
     * @returns {Array} - 打乱后的新数组
     */
    window.shuffleArray = function(array, rng) {
        if (!rng) rng = Math.random;
        const result = [...array];
        for (let i = result.length - 1; i > 0; i--) {
            const j = Math.floor(rng() * (i + 1));
            [result[i], result[j]] = [result[j], result[i]];
        }
        return result;
    };
})();
