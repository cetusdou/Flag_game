// ============================================================================
// 🌍 地理大师 - 主程序文件
// 架构：模块化设计，功能清晰分离
// ============================================================================

// --- 模块1: 数据存储 ---
let dbWorld = [], dbPlates = [];
let worldNameMap = {};
let currentScope = 'world'; 
let gameMode = '', questionPool = [], currentQ = null, score = 0, totalQs = 0, isProcessing = false, myChart = null;

// --- 模块2: 配置数据 ---
// 所有翻译数据已直接存储在 countries.json 中，不再需要单独的翻译文件

// --- 模块3: 工具函数 ---
// 注意：capital_cn 字段现在直接从 countries.json 读取，无需翻译函数

// ============================================================================
// --- 模块4: 数据初始化 ---
// ============================================================================
async function initGame() {
    try {
        const [res1, res2, res3] = await Promise.all([
            fetch('./data/countries.json'),
            fetch('./data/china_plates.json'),
            fetch('./data/world_name_map.json')
        ]);
        
        if (res1.ok) {
            dbWorld = await res1.json();
            // capital_cn 字段已直接从 countries.json 读取，无需额外处理
            
            // 调试信息：检查数据完整性
            const translatedCount = dbWorld.filter(c => c.capital_cn && c.capital_cn !== c.capital && c.capital_cn !== "").length;
            const sovereignWithCapital = dbWorld.filter(c => 
                c.sovereign === true && 
                c.capital_cn && 
                c.capital_cn !== "无" && 
                c.capital_cn !== null &&
                c.capital_cn !== "" &&
                c.capital && 
                c.capital !== "无"
            ).length;
            console.log(`✅ 数据加载完成: 共${dbWorld.length}个国家, ${translatedCount}个有中文翻译, ${sovereignWithCapital}个主权国家有有效首都`);
        }
        if (res2.ok) dbPlates = await res2.json();
        if (res3.ok) worldNameMap = await res3.json();
        
        document.getElementById('loading-screen').style.display = 'none';
        showView('view-landing');
    } catch (e) {
        alert("⚠️ 数据加载错误: " + e.message);
    }
}
// 确保在DOM加载完成后初始化
if (document.readyState === 'loading') {
    window.addEventListener('DOMContentLoaded', initGame);
} else {
    window.onload = initGame;
}

// ============================================================================
// --- 模块5: UI视图控制 ---
// ============================================================================
function showView(id) {
    document.querySelectorAll('.container').forEach(d => d.classList.remove('active'));
    const el = document.getElementById(id);
    if (el) {
        el.classList.add('active');
    } else {
        console.error("找不到视图 ID:", id); // 方便调试
    }
}
function goHome() { isProcessing = false; closeMap(); showView('view-menu'); }

// --- 模块5.1: 游戏范围选择 ---
function enterGameScope(scope) {
    currentScope = scope;
    const isWorld = (scope === 'world');
    
    document.getElementById('menu-title').textContent = isWorld ? "🌍 世界挑战" : "🇨🇳 车牌挑战";
    document.getElementById('menu-subtitle').textContent = isWorld ? `收录 ${dbWorld.length} 个国家` : `收录 ${dbPlates.length} 个区域`;

    if (isWorld) {
        enableBtn('btn-mode-1', 'mode_1', '📅', '每日挑战', '看国旗，猜首都', '20');
        enableBtn('btn-mode-2', 'mode_2', '🧩', '形状挑战', '看剪影，猜国家', '30');
        enableBtn('btn-mode-3', 'mode_3', '⚡', '极速冲刺', '快速问答', '50');
        enableBtn('btn-mode-all', 'all', '♾️', '全图鉴', '不重复，死磕到底', 'All');
    } else {
        enableBtn('btn-mode-1', 'mode_1', '🚗', '简单模式', '地级市 & 省会', '20');
        enableBtn('btn-mode-2', 'mode_2', '🔥', '困难模式', '含县级市/稀有', '30');
        enableBtn('btn-mode-3', 'mode_3', '🏙️', '反向挑战', '看城市，猜车牌', '50');
        disableBtn('btn-mode-all');
    }

    showView('view-menu');
}

function enableBtn(btnId, modeKey, icon, title, desc, count) {
    const btn = document.getElementById(btnId);
    if (!btn) return;
    btn.onclick = function() { startGame(modeKey); };
    btn.style.cursor = "pointer";
    btn.className = "game-card"; 

    if(btnId.includes('1')) btn.classList.add('card-blue');
    if(btnId.includes('2')) btn.classList.add('card-purple');
    if(btnId.includes('3')) btn.classList.add('card-orange');
    if(btnId.includes('all')) btn.classList.add('card-green');

    document.getElementById(btnId.replace('btn-', 'txt-') + '-icon').textContent = icon;
    document.getElementById(btnId.replace('btn-', 'txt-') + '-title').textContent = title;
    document.getElementById(btnId.replace('btn-', 'txt-') + '-desc').textContent = desc;
    
    const tag = document.getElementById(btnId.replace('btn-', 'txt-') + '-count');
    if(tag) { tag.textContent = count; tag.style.display = 'block'; }
}

function disableBtn(btnId) {
    const btn = document.getElementById(btnId);
    if (!btn) return;
    btn.onclick = null;
    btn.className = "game-card card-gray"; 
    
    document.getElementById(btnId.replace('btn-', 'txt-') + '-title').textContent = "敬请期待";
    document.getElementById(btnId.replace('btn-', 'txt-') + '-desc').textContent = "Coming Soon";
    document.getElementById(btnId.replace('btn-', 'txt-') + '-icon').textContent = "🔒";
    const tag = document.getElementById(btnId.replace('btn-', 'txt-') + '-count');
    if(tag) tag.style.display = 'none';
}

// ============================================================================
// --- 模块6: 游戏引擎 ---
// ============================================================================
function startGame(modeKey) {
    gameMode = modeKey; 
    score = 0; isProcessing = false;
    window.currentGameSeed = null; // 重置种子
    
    // 重置UI状态
    document.getElementById('answer-feedback').style.display = 'none';
    document.getElementById('game-map-btn').style.display = 'none';
    document.getElementById('next-btn').style.display = 'none';

    // 1. 准备题库
    if (currentScope === 'world') {
        let pool = [...dbWorld];
        let sovereignPool = dbWorld.filter(c => c.sovereign === true);

        if (modeKey === 'mode_1') { // 每日 - 猜首都
            // 🔥 过滤掉首都为"无"或无效的国家
            let validPool = sovereignPool.filter(c => {
                // 确保有capital_cn字段且不为空
                return c.capital_cn && 
                       c.capital_cn !== "无" && 
                       c.capital_cn !== null &&
                       c.capital && 
                       c.capital !== "无";
            });
            
            // 调试信息：检查validPool是否为空
            if (validPool.length === 0) {
                console.error("每日挑战：有效题库为空！", {
                    sovereignCount: sovereignPool.length,
                    sample: sovereignPool.slice(0, 5).map(c => ({
                        name: c.name,
                        capital: c.capital,
                        capital_cn: c.capital_cn
                    }))
                });
                alert("⚠️ 每日挑战题库为空，可能是数据加载问题。请刷新页面重试。");
                return;
            }
            
            const today = new Date();
            const seed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
            const rng = mulberry32(seed);
            
            // 确保rng是一个函数
            if (typeof rng !== 'function') {
                console.error("mulberry32返回的不是函数！", rng);
                // 使用普通随机数作为后备
                questionPool = validPool.sort(() => Math.random() - 0.5).slice(0, 20);
            } else {
                let temp = [...validPool];
                for (let i = temp.length - 1; i > 0; i--) { 
                    const j = Math.floor(rng() * (i + 1)); 
                    [temp[i], temp[j]] = [temp[j], temp[i]]; 
                }
                questionPool = temp.slice(0, 20);
            }
        }
        else if (modeKey === 'mode_2') questionPool = sovereignPool.sort(()=>Math.random()-0.5).slice(0, 30);
        else if (modeKey === 'mode_3') questionPool = pool.sort(()=>Math.random()-0.5).slice(0, 50);
        else if (modeKey === 'pk') {
            // PK模式：需要输入种子 - 使用自定义弹窗
            showPKSeedModal();
            return; // 等待用户输入
        } else {
            questionPool = pool.sort(()=>Math.random()-0.5);
        }
    } else {
        // 中国模式
        let pool = [];
        if (modeKey === 'mode_1') pool = dbPlates.filter(i => i.type === 'prefecture');
        else if (modeKey === 'mode_2') pool = dbPlates.filter(i => i.type === 'county');
        else pool = [...dbPlates]; 
        questionPool = pool.sort(()=>Math.random()-0.5).slice(0, (modeKey==='mode_3'?50:20));
        if (modeKey === 'mode_2') questionPool = questionPool.slice(0, 30);
    }
    
    totalQs = questionPool.length;
    if(totalQs === 0) { alert("题库为空！"); return; }

    let prefix = (currentScope === 'world') ? '🌍 ' : '🇨🇳 ';
    let modeLabel = "挑战中";
    if (gameMode === 'pk') {
        modeLabel = `PK模式 (种子: ${window.currentGameSeed})`;
    }
    document.getElementById('game-mode-label').textContent = prefix + modeLabel;
    
    // 🔥 修复：统一使用 view-game
    showView('view-game');
    nextRound();
}

function nextRound() {
    if (questionPool.length === 0) {
        // 游戏结束，保存记录
        saveGameRecord();
        showView('view-result');
        document.getElementById('result-score').textContent = score + " / " + totalQs;
        document.getElementById('result-title').textContent = "🎉 挑战完成!";
        const percentage = Math.round((score / totalQs) * 100);
        let detail = `正确率: ${percentage}%`;
        if (percentage === 100) detail += " 🌟 完美！";
        else if (percentage >= 80) detail += " 👍 很棒！";
        else if (percentage >= 60) detail += " 💪 继续加油！";
        
        // PK模式显示种子信息
        if (gameMode === 'pk' && window.currentGameSeed) {
            detail += `\n\n⚔️ PK种子: ${window.currentGameSeed}\n与朋友输入相同种子可进行PK！`;
        }
        
        document.getElementById('result-detail').textContent = detail;
        return;
    }

    isProcessing = false;
    // 重置按钮显示
    document.getElementById('next-btn').style.display = 'none';
    document.getElementById('answer-feedback').style.display = 'none';
    document.getElementById('game-map-btn').style.display = 'none';
    
    document.getElementById('score-display').textContent = score;
    document.getElementById('progress-fill').style.width = ((totalQs - questionPool.length)/totalQs*100) + '%';

    currentQ = questionPool.shift();
    window.currentQ = currentQ; // 暴露到全局，供HTML调用
    
    const img = document.getElementById('flag-img');
    const plate = document.getElementById('plate-display');
    const city = document.getElementById('city-display');
    const badge = document.getElementById('question-type-badge');

    // 默认全隐藏
    img.style.display = 'none';
    plate.style.display = 'none';
    city.style.display = 'none';
    img.classList.remove('silhouette');

    if (currentScope === 'world') {
        img.style.display = 'block';
        if (gameMode === 'mode_2') {
            if(currentQ.hasShape) { 
                img.classList.add('silhouette'); 
                img.src = `./assets/shapes/${currentQ.id}.svg`; 
                badge.textContent = "🗺️ 猜形状"; 
            } else { 
                img.src = `./assets/flags/${currentQ.id}.png`; 
                badge.textContent = "🚩 猜国家 (无剪影)"; 
            }
        } else {
            img.src = `./assets/flags/${currentQ.id}.png`;
            badge.textContent = (gameMode === 'mode_1') ? "🚩 猜首都" : "🚩 猜国家";
        }
    } else {
        if (gameMode === 'mode_3') {
            city.style.display = 'block';
            city.textContent = currentQ.name;
            badge.textContent = "🏙️ 猜车牌";
        } else {
            plate.style.display = 'inline-block';
            plate.textContent = currentQ.plate;
            badge.textContent = (currentQ.type === 'county') ? "🏡 猜县级市" : "🏙️ 猜城市";
        }
    }

    // 生成选项
    let sourceDB = (currentScope === 'world') ? dbWorld : dbPlates;
    let opts = [currentQ];
    let optionTexts = new Set(); // 用于跟踪已使用的选项文本，避免重复
    
    if (currentScope === 'world' && gameMode === 'mode_1') {
        // 🔥 猜首都模式：只选择有有效中文首都的国家作为干扰项
        let validDB = sourceDB.filter(c => c.capital_cn && c.capital_cn !== "无" && c.capital !== "无");
        
        // 如果当前国家有最大城市且与首都不一样，将最大城市也加入选项
        const currentCapital = currentQ.capital_cn || currentQ.capital;
        const currentLargestCity = currentQ.largestCity_cn || currentQ.largestCity;
        if (currentLargestCity && 
            currentLargestCity !== "" && 
            currentLargestCity !== currentCapital &&
            currentLargestCity !== "无") {
            // 创建一个虚拟选项对象，用于显示最大城市
            const largestCityOption = {
                ...currentQ,
                _isLargestCity: true, // 标记这是最大城市选项
                _displayText: currentLargestCity
            };
            opts.push(largestCityOption);
            optionTexts.add(currentLargestCity);
        }
        
        // 添加正确答案的首都到已使用文本集合
        optionTexts.add(currentCapital);
        
        // 继续添加其他国家的首都作为干扰项
        while(opts.length < 4) {
            let r = validDB[Math.floor(Math.random() * validDB.length)];
            if (!opts.includes(r)) {
                const rCapital = r.capital_cn || r.capital;
                // 确保不重复，且不与当前国家的首都或最大城市重复
                if (!optionTexts.has(rCapital) && rCapital !== currentCapital && rCapital !== currentLargestCity) {
                    opts.push(r);
                    optionTexts.add(rCapital);
                }
            }
        }
    } else {
        while(opts.length < 4) {
            let r = sourceDB[Math.floor(Math.random() * sourceDB.length)];
            if (!opts.includes(r)) opts.push(r);
        }
    }
    opts.sort(() => Math.random() - 0.5);

    const area = document.getElementById('options-area');
    area.innerHTML = '';
    opts.forEach(opt => {
        const btn = document.createElement('button');
        btn.className = 'game-opt-btn';
        
        if (currentScope === 'world') {
            // 🔥 猜首都模式使用中文首都
            if (gameMode === 'mode_1') {
                // 如果是标记的最大城市选项，显示最大城市
                if (opt._isLargestCity && opt._displayText) {
                    btn.textContent = opt._displayText;
                } else {
                    btn.textContent = opt.capital_cn || opt.capital;
                }
            } else {
                btn.textContent = opt.name;
            }
        } else {
            if (gameMode === 'mode_3') btn.textContent = opt.plate;
            else btn.textContent = opt.name;
        }
        btn.onclick = () => checkAnswer(opt, btn);
        area.appendChild(btn);
    });
}

function checkAnswer(choice, btn) {
    if (isProcessing) return; isProcessing = true;
    
    let isCorrect = false;
    let correctText = "";
    
    if (currentScope === 'world') {
        // 🔥 猜首都模式：只有选择当前国家且不是最大城市选项才算正确
        if (gameMode === 'mode_1') {
            isCorrect = (choice.id === currentQ.id && !choice._isLargestCity);
            correctText = currentQ.capital_cn || currentQ.capital;
        } else {
            isCorrect = (choice.id === currentQ.id);
            correctText = currentQ.name;
        }
    } else {
        isCorrect = (choice.plate === currentQ.plate);
        correctText = (gameMode === 'mode_3') ? currentQ.plate : currentQ.name;
    }

    if (isCorrect) { btn.classList.add('correct'); score++; }
    else {
        btn.classList.add('wrong');
        // 标绿正确项
        const allBtns = document.getElementById('options-area').querySelectorAll('button');
        allBtns.forEach(b => { if (b.textContent === correctText) b.classList.add('correct'); });
        
        // 显示反馈
        const fb = document.getElementById('answer-feedback');
        fb.style.display = 'block';
        if (currentScope === 'world') fb.innerHTML = `正确答案: <b>${currentQ.name}</b>`;
        else fb.innerHTML = `正确答案: <b>${currentQ.name}</b> (${currentQ.plate})`;
    }
    
    document.getElementById('score-display').textContent = score;
    document.getElementById('next-btn').style.display = 'block';
    
    if (currentScope === 'world') {
        document.getElementById('game-map-btn').style.display = 'block';
        if (gameMode === 'mode_2') document.getElementById('flag-img').classList.remove('silhouette');
    }
}

// --- 模块6.1: 随机数生成器（用于每日挑战的固定随机序列） ---
// 使用标志避免递归调用
let _usingGlobalMulberry32 = false;

function mulberry32(a) { 
    // 如果正在使用全局函数，直接使用本地实现避免递归
    if (_usingGlobalMulberry32) {
        return function() { 
            var t = a += 0x6D2B79F5; 
            t = Math.imul(t ^ t >>> 15, t | 1); 
            t ^= t + Math.imul(t ^ t >>> 7, t | 61); 
            return ((t ^ t >>> 14) >>> 0) / 4294967296; 
        };
    }
    
    // 检查是否有全局函数可用
    if (window.mulberry32 && typeof window.mulberry32 === 'function') {
        _usingGlobalMulberry32 = true;
        try {
            const result = window.mulberry32(a);
            _usingGlobalMulberry32 = false;
            return result;
        } catch (e) {
            _usingGlobalMulberry32 = false;
            console.warn("使用全局mulberry32失败，回退到本地实现", e);
        }
    }
    
    // 使用本地实现
    return function() { 
        var t = a += 0x6D2B79F5; 
        t = Math.imul(t ^ t >>> 15, t | 1); 
        t ^= t + Math.imul(t ^ t >>> 7, t | 61); 
        return ((t ^ t >>> 14) >>> 0) / 4294967296; 
    }; 
}

// ============================================================================
// --- 模块7: 图鉴功能 ---
// ============================================================================
function openCompendium() {
    showView('view-compendium');
    const grid = document.getElementById('compendium-grid');
    grid.innerHTML = '';
    let sourceDB = (currentScope === 'world') ? dbWorld : dbPlates;
    sourceDB.forEach(c => {
        const div = document.createElement('div');
        div.className = 'compendium-item';
        let searchKey = currentScope==='world' ? c.name : c.name+c.plate;
        div.setAttribute('data-search', searchKey.toLowerCase());
        
        if (currentScope === 'world') {
            div.innerHTML = `<img src="./assets/flags/${c.id}.png" loading="lazy"><span>${c.name}</span>`;
        } else {
            div.innerHTML = `<div style="background:#00479d;color:white;padding:2px;font-size:10px;border-radius:4px;margin-bottom:5px">${c.plate}</div><span>${c.name}</span>`;
        }
        div.onclick = () => showDetail(c);
        grid.appendChild(div);
    });
    document.getElementById('search-input').value = '';
    filterCompendium();
}

function filterCompendium() {
    const input = document.getElementById('search-input').value.toLowerCase();
    document.querySelectorAll('.compendium-item').forEach(item => {
        item.style.display = item.getAttribute('data-search').includes(input) ? 'flex' : 'none';
    });
}

function showDetail(item) {
    const modal = document.getElementById('info-modal');
    const img = document.getElementById('modal-img');
    const plate = document.getElementById('modal-plate');
    
    if (currentScope === 'world') {
        img.style.display = 'block'; plate.style.display = 'none';
        img.src = `./assets/flags/${item.id}.png`;
        // 显示中英文国家名
        document.getElementById('modal-name').textContent = item.name;
        document.getElementById('modal-en-name').textContent = `${item.name_en} / ${item.fullName}`;
        
        // 构建信息网格
        let infoHTML = '';
        
        // 首都（中英文）
        const capitalDisplay = item.capital_cn || item.capital || "无";
        const capitalEn = item.capital && item.capital !== "无" ? item.capital : "";
        const capitalText = capitalEn && capitalDisplay !== capitalEn ? `${capitalDisplay} (${capitalEn})` : capitalDisplay;
        infoHTML += `<div class="info-row"><span class="info-label">首都</span><span class="info-val">${capitalText}</span></div>`;
        
        // 面积
        if (item.area && item.area > 0) {
            const areaText = item.area >= 1000000 
                ? `${(item.area / 1000000).toFixed(2)} 万 km²` 
                : `${item.area.toLocaleString()} km²`;
            infoHTML += `<div class="info-row"><span class="info-label">面积</span><span class="info-val">${areaText}</span></div>`;
        }
        
        // 语言
        if (item.languages && item.languages !== "通用") {
            infoHTML += `<div class="info-row"><span class="info-label">语言</span><span class="info-val">${item.languages}</span></div>`;
        }
        
        // 货币
        if (item.currency && item.currency !== "通用") {
            infoHTML += `<div class="info-row"><span class="info-label">货币</span><span class="info-val">${item.currency}</span></div>`;
        }
        
        // 最大城市（如果有）
        if (item.largestCity && item.largestCity !== "") {
            const largestCityText = item.largestCity_cn 
                ? `${item.largestCity_cn} (${item.largestCity})` 
                : item.largestCity;
            infoHTML += `<div class="info-row"><span class="info-label">其他主要城市</span><span class="info-val">${largestCityText}</span></div>`;
        }
        
        document.querySelector('.info-grid').innerHTML = infoHTML;
        document.getElementById('modal-map-btn').style.display = 'block';
        document.getElementById('modal-map-btn').onclick = () => openMap(item);
    } else {
        img.style.display = 'none'; plate.style.display = 'inline-block';
        plate.textContent = item.plate;
        document.getElementById('modal-name').textContent = item.name;
        document.getElementById('modal-en-name').textContent = item.type==='prefecture'?'地级市':'县级市';
        document.querySelector('.info-grid').innerHTML = ``;
        document.getElementById('modal-map-btn').style.display = 'none';
    }
    modal.style.display = 'flex';
}

function closeModal(e) { if (e.target.id === 'info-modal' || e.target.classList.contains('btn-close')) document.getElementById('info-modal').style.display = 'none'; }

// ============================================================================
// --- 模块9: 历史记录和排行榜 ---
// ============================================================================
function saveGameRecord() {
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

function showRank() {
    showView('view-rank');
    const records = JSON.parse(localStorage.getItem('gameRecords') || '[]');
    const rankList = document.getElementById('rank-list');
    
    if (records.length === 0) {
        rankList.innerHTML = '<p style="color:#aaa; text-align:center; padding:20px;">暂无历史记录</p>';
        return;
    }
    
    // 按分数和正确率排序
    const sorted = records.sort((a, b) => {
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
            'mode_3': '极速冲刺',
            'all': '♾️ 全图鉴',
            'pk': '⚔️ PK模式'
        };
        const scopeName = r.scope === 'world' ? '🌍' : '🇨🇳';
        const modeName = modeNames[r.mode] || r.mode;
        
        html += `
            <div style="background:rgba(255,255,255,0.05); padding:12px; border-radius:8px; display:flex; justify-content:space-between; align-items:center;">
                <div>
                    <span style="color:#4CAF50; font-weight:bold; margin-right:10px;">#${idx+1}</span>
                    <span style="color:#fff;">${scopeName} ${modeName}</span>
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

function clearRecords() {
    if (confirm('确定要清空所有历史记录吗？此操作不可恢复！')) {
        localStorage.removeItem('gameRecords');
        showRank(); // 刷新显示
    }
}

// ============================================================================
// --- 模块8: 地图功能 ---
// ============================================================================
function openMap(item) {
    document.getElementById('info-modal').style.display = 'none';
    document.getElementById('map-modal').style.display = 'flex';
    setTimeout(() => { 
        initEChartsMap(item.id.toUpperCase());
    }, 100);
}

function initEChartsMap(code) {
    const dom = document.getElementById("echarts-map-container");
    if (myChart) myChart.dispose();
    myChart = echarts.init(dom);
    const option = {
        backgroundColor: '#100C2A',
        tooltip: { trigger: 'item', formatter: function(p){
            const found = dbWorld.find(c => c.id.toUpperCase() === p.name);
            return found ? found.name : p.name;
        }},
        geo: {
            map: 'world', roam: true, zoom: 1.2,
            itemStyle: { normal: { areaColor: '#323c48', borderColor: '#111' }, emphasis: { areaColor: '#2a333d' } },
            nameMap: worldNameMap,
            regions: [{ 
                name: code, 
                itemStyle: { 
                    areaColor: '#00ff88',  // 荧光绿色
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
// 将函数暴露到 window 对象，以便在 openMap 中调用
window.initEChartsMap = initEChartsMap;
function closeMap() { document.getElementById('map-modal').style.display = 'none'; }

// ============================================================================
// --- PK模式弹窗处理 ---
// ============================================================================
let pendingPKMode = null; // 存储待处理的PK模式

function showPKSeedModal() {
    pendingPKMode = 'pk'; // 标记为PK模式
    const modal = document.getElementById('pk-seed-modal');
    const input = document.getElementById('pk-seed-input');
    modal.style.display = 'flex';
    input.value = ''; // 清空输入
    input.focus(); // 自动聚焦
    
    // 监听回车键
    input.onkeydown = function(e) {
        if (e.key === 'Enter') {
            confirmPKSeed();
        } else if (e.key === 'Escape') {
            closePKSeedModal();
        }
    };
}

function closePKSeedModal(e) {
    if (e && e.target.id !== 'pk-seed-modal' && !e.target.closest('.pk-seed-card')) {
        return; // 点击弹窗内容时不关闭
    }
    document.getElementById('pk-seed-modal').style.display = 'none';
    pendingPKMode = null;
}

function confirmPKSeed() {
    const input = document.getElementById('pk-seed-input');
    const seedValue = input.value.trim();
    
    if (!seedValue) {
        showErrorModal('请输入一个数字种子！');
        return;
    }
    
    const seed = parseInt(seedValue);
    if (isNaN(seed)) {
        showErrorModal('请输入有效的数字！');
        return;
    }
    
    // 关闭弹窗
    closePKSeedModal();
    
    // 继续PK模式的游戏逻辑
    window.currentGameSeed = seed;
    if (currentScope === 'world') {
        const sovereignPool = dbWorld.filter(c => c.sovereign === true);
        const rng = window.mulberry32(seed);
        questionPool = window.shuffleArray(sovereignPool, rng).slice(0, 50);
    } else {
        // 中国模式不支持PK
        showErrorModal('PK模式目前仅支持世界模式！');
        return;
    }
    
    // 继续游戏流程
    gameMode = 'pk';
    totalQs = questionPool.length;
    if(totalQs === 0) { 
        showErrorModal('题库为空！'); 
        return; 
    }

    score = 0;
    isProcessing = false;
    
    // 重置UI状态
    document.getElementById('answer-feedback').style.display = 'none';
    document.getElementById('game-map-btn').style.display = 'none';
    document.getElementById('next-btn').style.display = 'none';

    let prefix = (currentScope === 'world') ? '🌍 ' : '🇨🇳 ';
    let modeLabel = `PK模式 (种子: ${window.currentGameSeed})`;
    document.getElementById('game-mode-label').textContent = prefix + modeLabel;
    
    showView('view-game');
    nextRound();
}

function showErrorModal(message) {
    const modal = document.getElementById('error-modal');
    const messageEl = document.getElementById('error-message');
    messageEl.textContent = message;
    modal.style.display = 'flex';
}

function closeErrorModal(e) {
    if (e && e.target.id !== 'error-modal' && !e.target.closest('.error-card')) {
        return;
    }
    document.getElementById('error-modal').style.display = 'none';
    // 如果是在PK模式输入时出错，返回菜单
    if (pendingPKMode === 'pk') {
        goHome();
        pendingPKMode = null;
    }
}