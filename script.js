// ============================================================================
// 🌍 地理大师 - 主程序文件
// 架构：模块化设计，功能清晰分离
// ============================================================================

// --- 模块1: 数据存储 ---
let dbWorld = [], dbPlates = [], dbF1Tracks = [];
let worldNameMap = {};
let wikiExtraData = {}; // Wiki额外信息数据
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
        const [res1, res2, res3, res4, res5] = await Promise.all([
            fetch('./data/countries.json'),
            fetch('./data/china_plates.json'),
            fetch('./data/world_name_map.json'),
            fetch('./data/countries_wiki_extra.json'),
            fetch('./data/f1_tracks_final.json')
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
        if (res4.ok) wikiExtraData = await res4.json();
        if (res5.ok) {
            const f1Data = await res5.json();
            dbF1Tracks = f1Data.circuits || [];
            console.log(`✅ F1赛道数据加载完成: 共${dbF1Tracks.length}条赛道`);
        }
        
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
    const isChina = (scope === 'china');
    const isF1 = (scope === 'f1');
    
    if (isWorld) {
        document.getElementById('menu-title').textContent = "🌍 世界挑战";
        document.getElementById('menu-subtitle').textContent = `收录 ${dbWorld.length} 个国家`;
        enableBtn('btn-mode-1', 'mode_1', '📅', '每日挑战', '看国旗，猜首都', '20');
        enableBtn('btn-mode-2', 'mode_2', '🧩', '形状挑战', '看剪影，猜国家', '30');
        enableBtn('btn-mode-3', 'mode_3', '⚡', '极速冲刺', '快速问答', '50');
        enableBtn('btn-mode-all', 'all', '♾️', '全图鉴', '不重复，死磕到底', 'All');
        // 显示知识图鉴和PK模式按钮
        const compendiumBtn = document.getElementById('compendium-btn');
        const pkModeBtn = document.getElementById('pk-mode-btn');
        if (compendiumBtn) compendiumBtn.style.display = 'flex';
        if (pkModeBtn) pkModeBtn.style.display = 'flex';
    } else if (isChina) {
        document.getElementById('menu-title').textContent = "🇨🇳 车牌挑战";
        document.getElementById('menu-subtitle').textContent = `收录 ${dbPlates.length} 个区域`;
        // 中国模式下只显示一个游戏模式：看车牌猜地名
        enableBtn('btn-mode-1', 'mode_1', '🚗', '车牌挑战', '看车牌，猜地名', '50');
        disableBtn('btn-mode-2');
        disableBtn('btn-mode-3');
        disableBtn('btn-mode-all');
        // 隐藏知识图鉴和PK模式按钮
        const compendiumBtn = document.getElementById('compendium-btn');
        const pkModeBtn = document.getElementById('pk-mode-btn');
        if (compendiumBtn) compendiumBtn.style.display = 'none';
        if (pkModeBtn) pkModeBtn.style.display = 'none';
    } else if (isF1) {
        document.getElementById('menu-title').textContent = "🏎️ F1赛道挑战";
        document.getElementById('menu-subtitle').textContent = `收录 ${dbF1Tracks.length} 条赛道`;
        // F1模式下只显示一个游戏模式：看赛道图猜赛道名
        enableBtn('btn-mode-1', 'mode_1', '🏎️', '赛道挑战', '看赛道图，猜赛道名', '20');
        disableBtn('btn-mode-2');
        disableBtn('btn-mode-3');
        disableBtn('btn-mode-all');
        // 隐藏知识图鉴和PK模式按钮（暂时不提供）
        const compendiumBtn = document.getElementById('compendium-btn');
        const pkModeBtn = document.getElementById('pk-mode-btn');
        if (compendiumBtn) compendiumBtn.style.display = 'none';
        if (pkModeBtn) pkModeBtn.style.display = 'none';
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
    
    // 中国模式下暂时不提供PK模式
    if (modeKey === 'pk' && currentScope === 'china') {
        alert('中国模式下暂时不提供PK模式功能');
        return;
    }
    
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
    } else if (currentScope === 'china') {
        // 中国模式：看车牌猜地名
        // 使用所有车牌数据，随机选择50题
        questionPool = dbPlates.sort(()=>Math.random()-0.5).slice(0, 50);
    } else if (currentScope === 'f1') {
        // F1模式：看赛道图猜赛道名
        // 使用所有F1赛道数据，随机选择20题
        questionPool = dbF1Tracks.sort(()=>Math.random()-0.5).slice(0, 20);
    }
    
    totalQs = questionPool.length;
    if(totalQs === 0) { alert("题库为空！"); return; }

    // 初始化剩余题目显示
    document.getElementById('remaining-questions').textContent = totalQs;

    let prefix = '';
    if (currentScope === 'world') prefix = '🌍 ';
    else if (currentScope === 'china') prefix = '🇨🇳 ';
    else if (currentScope === 'f1') prefix = '🏎️ ';
    
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
    document.getElementById('remaining-questions').textContent = questionPool.length;
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
    } else if (currentScope === 'china') {
        if (gameMode === 'mode_3') {
            city.style.display = 'block';
            city.textContent = currentQ.name;
            badge.textContent = "🏙️ 猜车牌";
        } else {
            // 中国模式：显示车牌，猜地名
            plate.style.display = 'inline-block';
            plate.textContent = currentQ.plate;
            badge.textContent = "看车牌，猜地名";
        }
    } else if (currentScope === 'f1') {
        // F1模式：显示赛道图，猜赛道名
        img.style.display = 'block';
        img.src = currentQ.img;
        // 为F1赛道图添加荧光效果（类似国家轮廓）
        img.classList.add('silhouette');
        badge.textContent = "🏎️ 猜赛道";
    }

    // 生成选项
    let sourceDB = (currentScope === 'world') ? dbWorld : (currentScope === 'china') ? dbPlates : dbF1Tracks;
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
    } else if (currentScope === 'china') {
        // 中国模式：看车牌猜地名
        // 从车牌中提取省份代码（第一个字符）
        const provinceCode = currentQ.plate.charAt(0);
        
        // 找到同省的其他城市（排除当前城市）
        const sameProvinceCities = sourceDB.filter(item => {
            // 提取省份代码
            const itemProvinceCode = item.plate.charAt(0);
            // 同省且不是当前城市（注意：一个城市可能对应多个车牌）
            return itemProvinceCode === provinceCode && 
                   item.name !== currentQ.name &&
                   !opts.includes(item);
        });
        
        // 添加两个同省城市作为干扰项
        let sameProvinceAdded = 0;
        while (sameProvinceAdded < 2 && sameProvinceCities.length > 0) {
            const randomIndex = Math.floor(Math.random() * sameProvinceCities.length);
            const city = sameProvinceCities.splice(randomIndex, 1)[0];
            if (city && !opts.includes(city)) {
                opts.push(city);
                optionTexts.add(city.name);
                sameProvinceAdded++;
            }
        }
        
        // 添加一个随机城市（不同省的）
        while (opts.length < 4) {
            let r = sourceDB[Math.floor(Math.random() * sourceDB.length)];
            const rProvinceCode = r.plate.charAt(0);
            // 确保不是同省，且不是当前城市，且名称不重复
            if (rProvinceCode !== provinceCode && 
                r.name !== currentQ.name && 
                !opts.includes(r) &&
                !optionTexts.has(r.name)) {
                opts.push(r);
                optionTexts.add(r.name);
            }
        }
    } else if (currentScope === 'f1') {
        // F1模式：看赛道图猜赛道名
        // 随机选择3个其他赛道作为干扰项
        while(opts.length < 4) {
            let r = sourceDB[Math.floor(Math.random() * sourceDB.length)];
            if (!opts.includes(r) && r.id !== currentQ.id) {
                opts.push(r);
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
        } else if (currentScope === 'china') {
            // 中国模式：显示地名（看车牌猜地名）
            btn.textContent = opt.name;
        } else if (currentScope === 'f1') {
            // F1模式：显示赛道名（看赛道图猜赛道名）
            btn.textContent = opt.name;
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
    } else if (currentScope === 'china') {
        // 中国模式：看车牌猜地名
        // 注意：一个城市可能对应多个车牌（如北京有京A、京C等）
        // 只要选择的地名与当前车牌对应的地名相同，就算正确
        isCorrect = (choice.name === currentQ.name);
        correctText = currentQ.name;
    } else if (currentScope === 'f1') {
        // F1模式：看赛道图猜赛道名
        isCorrect = (choice.id === currentQ.id);
        correctText = currentQ.name;
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
        if (currentScope === 'world') {
            fb.innerHTML = `正确答案: <b>${currentQ.name}</b>`;
        } else if (currentScope === 'china') {
            fb.innerHTML = `正确答案: <b>${currentQ.name}</b> (${currentQ.plate})`;
        } else if (currentScope === 'f1') {
            fb.innerHTML = `正确答案: <b>${currentQ.name}</b>`;
        }
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
    // 中国模式下暂时不提供知识图鉴
    if (currentScope === 'china') {
        alert('中国模式下暂时不提供知识图鉴功能');
        return;
    }
    
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
        
        // 检查并添加Wiki额外信息（默认隐藏，需要点击展开）
        const wikiInfo = wikiExtraData[item.id.toLowerCase()];
        const wikiContainer = document.getElementById('wiki-info-container');
        const wikiContent = document.getElementById('wiki-info-content');
        
        if (wikiInfo) {
            // 字段标签映射（中文）
            const fieldLabels = {
                'official_languages': '官方语言',
                'official_script': '官方文字',
                'demonym': '居民称谓',
                'area_total': '总面积',
                'population_estimate': '人口估计',
                'population_density': '人口密度',
                'gdp_ppp_total': 'GDP (PPP)',
                'gdp_ppp_per_capita': '人均GDP (PPP)',
                'gdp_nominal_total': 'GDP (名义)',
                'gdp_nominal_per_capita': '人均GDP (名义)',
                'gini': '基尼系数',
                'largest_city': '最大城市',
                'currency': '货币'
            };
            
            let wikiHTML = '';
            let hasValidData = false;
            
            // 处理首都经纬度（优先显示）
            if (wikiInfo.capital && wikiInfo.capital !== 'N/A' && wikiInfo.capital !== '') {
                // 提取经纬度信息（格式：城市名+经纬度，例如 "Kabul34°31′N 69°11′E / 34.517°N 69.183°E / 34.517; 69.183"）
                const capitalValue = wikiInfo.capital;
                let coordText = '';
                
                // 优先提取十进制坐标（格式：34.517; 69.183 或 12.51861; -70.03583）
                const decimalMatch = capitalValue.match(/([\d\.\-]+);\s*([\d\.\-]+)/);
                if (decimalMatch) {
                    const lat = parseFloat(decimalMatch[1]);
                    const lon = parseFloat(decimalMatch[2]);
                    // 判断南北纬和东西经
                    const latDir = lat >= 0 ? 'N' : 'S';
                    const lonDir = lon >= 0 ? 'E' : 'W';
                    coordText = `${Math.abs(lat).toFixed(4)}°${latDir}, ${Math.abs(lon).toFixed(4)}°${lonDir}`;
                } else {
                    // 如果没有十进制坐标，尝试提取度分秒格式
                    const dmsMatch = capitalValue.match(/(\d+°\d+′[NS])\s+(\d+°\d+′[EW])/);
                    if (dmsMatch) {
                        coordText = `${dmsMatch[1]} ${dmsMatch[2]}`;
                    } else {
                        // 尝试提取度格式（例如：34.517°N 69.183°E）
                        const degMatch = capitalValue.match(/([\d\.]+)°([NS])\s+([\d\.]+)°([EW])/);
                        if (degMatch) {
                            coordText = `${degMatch[1]}°${degMatch[2]} ${degMatch[3]}°${degMatch[4]}`;
                        }
                    }
                }
                
                if (coordText) {
                    wikiHTML += `<div class="info-row"><span class="info-label">首都经纬度</span><span class="info-val">${coordText}</span></div>`;
                    hasValidData = true;
                }
            }
            
            // 处理货币（显示在Wiki信息中）
            if (wikiInfo.currency && wikiInfo.currency !== 'N/A' && wikiInfo.currency !== '') {
                wikiHTML += `<div class="info-row"><span class="info-label">货币</span><span class="info-val">${wikiInfo.currency}</span></div>`;
                hasValidData = true;
            }
            
            // 遍历其他字段，只显示有数据且不是 "N/A" 的字段
            for (const [key, value] of Object.entries(wikiInfo)) {
                // 跳过 id 字段，以及值为 "N/A" 或空值的字段
                if (key === 'id' || !value || value === 'N/A' || value === '' || value === null) {
                    continue;
                }
                
                // 跳过 capital、area 和 currency（已单独处理）
                if (key === 'capital' || key === 'area' || key === 'currency') {
                    continue;
                }
                
                const label = fieldLabels[key] || key;
                let displayValue = value;
                
                // 如果是官方语言字段，尝试分离连在一起的语言
                if (key === 'official_languages') {
                    displayValue = separateLanguages(value);
                }
                // 如果是最大城市字段，处理括号后直接跟城市名的情况（如 "Sydney (metropolitan)Melbourne (urban)"）
                else if (key === 'largest_city') {
                    displayValue = separateCities(value);
                }
                
                wikiHTML += `<div class="info-row"><span class="info-label">${label}</span><span class="info-val">${displayValue}</span></div>`;
                hasValidData = true;
            }
            
            // 如果有有效数据，显示容器并设置内容
            if (hasValidData) {
                wikiContainer.style.display = 'block';
                wikiContent.innerHTML = wikiHTML;
                // 重置展开状态
                wikiContent.style.display = 'none';
                const wikiArrow = document.querySelector('.wiki-arrow');
                if (wikiArrow) wikiArrow.textContent = '▼';
            } else {
                wikiContainer.style.display = 'none';
            }
        } else {
            wikiContainer.style.display = 'none';
        }
        
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

function closeModal(e) { 
    if (e.target.id === 'info-modal' || e.target.classList.contains('btn-close')) {
        document.getElementById('info-modal').style.display = 'none';
        // 重置Wiki信息展开状态
        const wikiContent = document.getElementById('wiki-info-content');
        const wikiArrow = document.querySelector('.wiki-arrow');
        if (wikiContent) wikiContent.style.display = 'none';
        if (wikiArrow) wikiArrow.textContent = '▼';
    }
}

// 切换Wiki信息展开/收起
function toggleWikiInfo() {
    const wikiContent = document.getElementById('wiki-info-content');
    const wikiArrow = document.querySelector('.wiki-arrow');
    const isExpanded = wikiContent.style.display === 'block';
    
    if (isExpanded) {
        wikiContent.style.display = 'none';
        if (wikiArrow) wikiArrow.textContent = '▼';
    } else {
        wikiContent.style.display = 'block';
        if (wikiArrow) wikiArrow.textContent = '▲';
    }
}

// 分离连在一起的语言名称
function separateLanguages(langStr) {
    if (!langStr || typeof langStr !== 'string') return langStr;
    
    // 常见语言名称列表（按长度从长到短排序，优先匹配长名称）
    const commonLanguages = [
        'Cook Islands Māori', 'New Zealand', 'Sign Language', 'Jersey Legal', 'Carolinian',
        'Papiamento', 'Papiamentu', 'Gilbertese', 'Chamorro', 'Marshallese', 'Palauan',
        'Tokelauan', 'Tuvaluan', 'Seychellois', 'Uruguayan', 'IsiXhosa', 'SiPhuthi',
        'Kinyarwanda', 'Samoan', 'English', 'French', 'German', 'Spanish', 'Italian',
        'Portuguese', 'Dutch', 'Russian', 'Arabic', 'Chinese', 'Japanese', 'Korean',
        'Hindi', 'Turkish', 'Greek', 'Swedish', 'Norwegian', 'Danish', 'Finnish',
        'Icelandic', 'Polish', 'Czech', 'Romanian', 'Bulgarian', 'Serbian', 'Croatian',
        'Slovak', 'Slovenian', 'Hungarian', 'Estonian', 'Latvian', 'Lithuanian',
        'Belarusian', 'Ukrainian', 'Georgian', 'Armenian', 'Azerbaijani', 'Kazakh',
        'Uzbek', 'Turkmen', 'Kyrgyz', 'Tajik', 'Mongolian', 'Vietnamese', 'Thai',
        'Burmese', 'Khmer', 'Lao', 'Malay', 'Indonesian', 'Filipino', 'Tagalog',
        'Swahili', 'Hausa', 'Yoruba', 'Igbo', 'Zulu', 'Xhosa', 'Afrikaans',
        'Amharic', 'Somali', 'Kurdish', 'Persian', 'Pashto', 'Dari', 'Urdu',
        'Bengali', 'Tamil', 'Telugu', 'Malayalam', 'Kannada', 'Gujarati', 'Punjabi',
        'Marathi', 'Nepali', 'Sinhala', 'Hebrew', 'Yiddish', 'Basque', 'Catalan',
        'Galician', 'Welsh', 'Irish', 'Scottish', 'Manx', 'Breton', 'Corsican',
        'Luxembourgish', 'Romansh', 'Faroese', 'Greenlandic', 'Sámi', 'Māori',
        'Guaraní', 'Quechua', 'Aymara', 'Nahuatl', 'Inuktitut', 'Cree', 'Ojibwe',
        'Hawaiian', 'Tahitian', 'Tongan', 'Fijian', 'Malagasy', 'Comorian', 'Kirundi',
        'Luganda', 'Wolof', 'Fulani', 'Tamazight', 'Berber', 'Tigrinya', 'Oromo',
        'Sesotho', 'Setswana', 'Chichewa', 'Lingala', 'Kikongo', 'Tshiluba', 'Sango',
        'Dyula', 'Baoulé', 'Mandinka', 'Fula', 'Norfuk', 'Pitkern', 'Tok Pisin',
        'Hiri Motu', 'PNG Sign', 'NZ Sign', 'Jèrriais', 'Pukapukan', 'Qom', 'Mocoví', 'Wichí'
    ];
    
    // 处理包含 "in 地名" 的模式（如 "Guaraní in Corrientes"）
    // 改进：匹配可能包含逗号和 "and" 的语言列表，如 "Qom, Mocoví, and Wichí in Chaco"
    // 匹配模式：语言名（可能包含逗号和and）+ " in " + 地名
    const inPattern = /((?:[A-ZÁÉÍÓÚÑ][a-záéíóúñí]+(?:\s+[A-ZÁÉÍÓÚÑ][a-záéíóúñí]+)*)(?:\s*,\s*[A-ZÁÉÍÓÚÑ][a-záéíóúñí]+(?:\s+[A-ZÁÉÍÓÚÑ][a-záéíóúñí]+)*)*(?:\s*,\s*and\s+[A-ZÁÉÍÓÚÑ][a-záéíóúñí]+(?:\s+[A-ZÁÉÍÓÚÑ][a-záéíóúñí]+)*)?)\s+in\s+([A-Z][a-z]+(?:\s+[a-z]+)*(?:\s+(?:del|de|la|le|les|du|des)\s+[A-Z][a-z]+)?)/g;
    const inMatches = [];
    let match;
    
    // 收集所有 "语言 in 地名" 的匹配（包括包含逗号和and的情况）
    while ((match = inPattern.exec(langStr)) !== null) {
        inMatches.push({
            full: match[0],
            language: match[1].trim(),
            place: match[2],
            index: match.index
        });
    }
    
    // 如果有 "in 地名" 模式，先处理这些
    if (inMatches.length > 0) {
        const result = [];
        let lastIndex = 0;
        
        for (const inMatch of inMatches) {
            // 添加 "in 地名" 之前的部分
            if (inMatch.index > lastIndex) {
                const before = langStr.substring(lastIndex, inMatch.index).trim();
                if (before) {
                    // 处理前面的部分（可能包含连在一起的语言）
                    const beforeParts = processLanguageString(before, commonLanguages);
                    result.push(...beforeParts);
                }
            }
            
            // 添加 "语言 in 地名" 组合（语言部分可能包含逗号和and，需要清理空格）
            const cleanLanguage = inMatch.language.replace(/\s+/g, ' ').trim();
            result.push(`${cleanLanguage} (in ${inMatch.place})`);
            lastIndex = inMatch.index + inMatch.full.length;
        }
        
        // 添加剩余部分
        if (lastIndex < langStr.length) {
            const after = langStr.substring(lastIndex).trim();
            if (after) {
                const afterParts = processLanguageString(after, commonLanguages);
                result.push(...afterParts);
            }
        }
        
        // 使用 <br> 换行显示，而不是顿号
        return result.filter(p => p.trim()).join('<br>');
    }
    
    // 如果没有 "in 地名" 模式，使用常规处理
    return processLanguageString(langStr, commonLanguages).join('<br>');
}

// 处理语言字符串（处理连在一起的语言，但保留已有分隔符和介词）
function processLanguageString(langStr, commonLanguages) {
    if (!langStr || typeof langStr !== 'string') return [langStr];
    
    // 如果已经包含分隔符（逗号、分号等），按分隔符分割
    if (/[,;、，；]/.test(langStr)) {
        const parts = langStr.split(/[,;、，；]+/);
        const result = [];
        
        for (let i = 0; i < parts.length; i++) {
            const part = parts[i];
            const trimmed = part.trim();
            if (!trimmed) continue;
            
            // 检查是否包含 "and"（如 "and Wichí"）
            if (/\band\b/i.test(trimmed)) {
                // 如果前一个部分存在，将 "and" 合并到前一个部分
                if (result.length > 0) {
                    result[result.length - 1] += ', ' + trimmed;
                } else {
                    result.push(trimmed);
                }
            } else if (/^[A-Z][a-z]+[A-Z]/.test(trimmed)) {
                // 连在一起的语言，尝试分离
                const separated = separateCamelCase(trimmed, commonLanguages);
                result.push(...separated.split('、'));
            } else {
                result.push(trimmed);
            }
        }
        
        return result.filter(p => p.trim());
    }
    
    // 如果没有分隔符，尝试分离驼峰命名
    if (/^[A-Z][a-z]+[A-Z]/.test(langStr)) {
        const separated = separateCamelCase(langStr, commonLanguages);
        return separated.split('、').filter(p => p.trim());
    }
    
    return [langStr];
}

// 分离驼峰命名格式的语言名称
function separateCamelCase(text, languageList) {
    if (!text || typeof text !== 'string') return text;
    
    // 先尝试匹配已知语言名称（从长到短）
    const sortedLanguages = [...languageList].sort((a, b) => b.length - a.length);
    const result = [];
    let remaining = text;
    
    // 尝试匹配已知语言（贪心匹配）
    while (remaining.length > 0) {
        let matched = false;
        for (const lang of sortedLanguages) {
            if (remaining.startsWith(lang)) {
                result.push(lang);
                remaining = remaining.substring(lang.length);
                matched = true;
                break;
            }
        }
        
        if (!matched) {
            // 如果没有匹配到已知语言，使用正则表达式在大写字母前分割
            const match = remaining.match(/^([a-z]+)([A-Z][a-z]*)/);
            if (match) {
                result.push(match[1]);
                remaining = remaining.substring(match[1].length);
            } else {
                // 如果开头就是大写字母，提取整个单词
                const match2 = remaining.match(/^([A-Z][a-z]*)/);
                if (match2) {
                    result.push(match2[1]);
                    remaining = remaining.substring(match2[1].length);
                } else {
                    // 无法匹配，保留剩余部分
                    if (remaining.trim()) result.push(remaining);
                    break;
                }
            }
        }
    }
    
    // 如果没有任何匹配，使用正则表达式按大写字母分割
    if (result.length === 0) {
        const separated = text.replace(/([a-z])([A-Z])/g, '$1、$2');
        return separated;
    }
    
    return result.filter(p => p.trim()).join('、');
}

// 分离连在一起的城市名称（处理括号后直接跟城市名的情况）
function separateCities(cityStr) {
    if (!cityStr || typeof cityStr !== 'string') return cityStr;
    
    // 检测是否有括号后直接跟大写字母的情况（如 "Sydney (metropolitan)Melbourne (urban)"）
    if (/\)[A-ZÁÉÍÓÚÑ]/.test(cityStr)) {
        // 在 ")" 和大写字母之间插入分隔符
        const separated = cityStr.replace(/\)([A-ZÁÉÍÓÚÑ])/g, ')<br>$1');
        // 返回HTML格式，每个城市单独一行
        return separated;
    }
    
    return cityStr;
}

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