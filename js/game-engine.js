// 游戏引擎模块
import { getWorldData, getPlatesData } from './data-manager.js';
import { mulberry32, shuffleArray } from '../utils/random.js';

// 游戏状态
let currentScope = 'world';
let gameMode = '';
let questionPool = [];
let currentQ = null;
let score = 0;
let totalQs = 0;
let isProcessing = false;

/**
 * 设置游戏范围（世界/中国）
 */
export function setScope(scope) {
    currentScope = scope;
}

/**
 * 获取当前游戏范围
 */
export function getScope() {
    return currentScope;
}

/**
 * 开始游戏
 * @param {string} modeKey - 游戏模式键
 */
export function startGame(modeKey) {
    gameMode = modeKey;
    score = 0;
    isProcessing = false;
    
    const dbWorld = getWorldData();
    const dbPlates = getPlatesData();
    
    // 准备题库
    if (currentScope === 'world') {
        let pool = [...dbWorld];
        let sovereignPool = dbWorld.filter(c => c.sovereign === true);

        if (modeKey === 'mode_1') { // 每日 - 猜首都
            // 过滤掉首都为"无"或无效的国家
            let validPool = sovereignPool.filter(c => c.capital_cn && c.capital_cn !== "无" && c.capital !== "无");
            const today = new Date();
            const seed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
            const rng = mulberry32(seed);
            questionPool = shuffleArray(validPool, rng).slice(0, 20);
        }
        else if (modeKey === 'mode_2') {
            questionPool = shuffleArray(sovereignPool).slice(0, 30);
        }
        else if (modeKey === 'mode_3') {
            questionPool = shuffleArray(pool).slice(0, 50);
        }
        else {
            questionPool = shuffleArray(pool);
        }
    } else {
        // 中国模式
        let pool = [];
        if (modeKey === 'mode_1') pool = dbPlates.filter(i => i.type === 'prefecture');
        else if (modeKey === 'mode_2') pool = dbPlates.filter(i => i.type === 'county');
        else pool = [...dbPlates]; 
        
        questionPool = shuffleArray(pool).slice(0, (modeKey==='mode_3'?50:20));
        if (modeKey === 'mode_2') questionPool = questionPool.slice(0, 30);
    }
    
    totalQs = questionPool.length;
    return totalQs > 0;
}

/**
 * 获取下一题
 */
export function getNextQuestion() {
    if (questionPool.length === 0) {
        return null; // 游戏结束
    }
    
    isProcessing = false;
    currentQ = questionPool.shift();
    return currentQ;
}

/**
 * 生成选项（4个选项）
 */
export function generateOptions() {
    const dbWorld = getWorldData();
    const dbPlates = getPlatesData();
    const sourceDB = (currentScope === 'world') ? dbWorld : dbPlates;
    
    let opts = [currentQ];
    
    if (currentScope === 'world' && gameMode === 'mode_1') {
        // 猜首都模式：只选择有有效中文首都的国家作为干扰项
        let validDB = sourceDB.filter(c => c.capital_cn && c.capital_cn !== "无" && c.capital !== "无");
        while(opts.length < 4) {
            let r = validDB[Math.floor(Math.random() * validDB.length)];
            if (!opts.includes(r)) opts.push(r);
        }
    } else {
        while(opts.length < 4) {
            let r = sourceDB[Math.floor(Math.random() * sourceDB.length)];
            if (!opts.includes(r)) opts.push(r);
        }
    }
    
    return shuffleArray(opts);
}

/**
 * 检查答案
 * @param {Object} choice - 用户选择
 */
export function checkAnswer(choice) {
    if (isProcessing) return null;
    isProcessing = true;
    
    let isCorrect = false;
    let correctText = "";
    
    if (currentScope === 'world') {
        isCorrect = (choice.id === currentQ.id);
        correctText = (gameMode === 'mode_1') ? (currentQ.capital_cn || currentQ.capital) : currentQ.name;
    } else {
        isCorrect = (choice.plate === currentQ.plate);
        correctText = (gameMode === 'mode_3') ? currentQ.plate : currentQ.name;
    }
    
    if (isCorrect) {
        score++;
    }
    
    return {
        isCorrect,
        correctText,
        currentQ,
        score
    };
}

/**
 * 获取当前问题
 */
export function getCurrentQuestion() {
    return currentQ;
}

/**
 * 获取游戏模式
 */
export function getGameMode() {
    return gameMode;
}

/**
 * 获取得分
 */
export function getScore() {
    return score;
}

/**
 * 获取总题数
 */
export function getTotalQuestions() {
    return totalQs;
}

/**
 * 获取剩余题数
 */
export function getRemainingQuestions() {
    return questionPool.length;
}

/**
 * 获取进度百分比
 */
export function getProgress() {
    return totalQs > 0 ? ((totalQs - questionPool.length) / totalQs * 100) : 0;
}

/**
 * 重置处理状态
 */
export function resetProcessing() {
    isProcessing = false;
}

