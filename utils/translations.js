// 翻译工具函数
(function() {
    'use strict';
    
    /**
     * 翻译首都名称（英文 -> 中文）
     * @param {string} capitalEn - 英文首都名称
     * @returns {string|null} - 中文首都名称，如果无效则返回null
     */
    window.translateCapital = function(capitalEn) {
        if (!capitalEn || capitalEn === "无" || capitalEn.trim() === "") {
            return null; // 返回null表示无有效首都
        }
        // 如果映射表中有，直接返回
        if (window.CapitalTranslations && window.CapitalTranslations[capitalEn]) {
            return window.CapitalTranslations[capitalEn];
        }
        // 如果没有找到，尝试一些常见模式
        // 对于复合名称，尝试拆分翻译
        if (capitalEn.includes(" ")) {
            const parts = capitalEn.split(" ");
            // 如果第一部分在映射中，使用它
            if (window.CapitalTranslations && window.CapitalTranslations[parts[0]]) {
                return window.CapitalTranslations[parts[0]] + capitalEn.substring(parts[0].length);
            }
        }
        // 如果都找不到，返回原英文（可以后续手动添加）
        return capitalEn;
    };
})();
