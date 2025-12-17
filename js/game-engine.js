// ============================================================================
// 游戏引擎模块 - 核心游戏逻辑
// ============================================================================

let sprintTimer = null;
window.sprintTimer = null;

function initDataReferences() {
    const gameState = window.GameState;
    const gameData = window.GameData;
    
    if (!gameState || !gameData) {
        return null;
    }
    
    // 确保 questionPool 是数组
    const questionPool = (gameState.questionPool && Array.isArray(gameState.questionPool)) 
        ? gameState.questionPool 
        : [];
    
    return {
        dbWorld: gameData.dbWorld,
        dbPlates: gameData.dbPlates,
        dbF1Tracks: gameData.dbF1Tracks,
        dbFootballClubs: gameData.dbFootballClubs,
        dbCityNetworks: gameData.dbCityNetworks,
        worldNameMap: gameData.worldNameMap,
        currentScope: gameState.currentScope || 'world',
        gameMode: gameState.gameMode || '',
        questionPool: questionPool,
        currentQ: gameState.currentQ || null,
        score: gameState.score || 0,
        totalQs: gameState.totalQs || 0,
        isProcessing: gameState.isProcessing || false,
        footballDifficulty: gameState.footballDifficulty || 'easy',
        cityNetworkFillMode: gameState.cityNetworkFillMode || false
    };
}

function syncStateToGameState(data) {
    if (!window.GameState) {
        return;
    }
    window.GameState.currentScope = data.currentScope;
    window.GameState.gameMode = data.gameMode;
    // 确保 questionPool 是数组
    window.GameState.questionPool = (data.questionPool && Array.isArray(data.questionPool)) ? data.questionPool : [];
    window.GameState.currentQ = data.currentQ;
    window.GameState.score = data.score;
    window.GameState.totalQs = data.totalQs;
    window.GameState.isProcessing = data.isProcessing;
    window.GameState.footballDifficulty = data.footballDifficulty;
    if (data.cityNetworkFillMode !== undefined) {
        window.GameState.cityNetworkFillMode = data.cityNetworkFillMode;
    }
}

function startGame(modeKey) {
    const refs = initDataReferences();
    if (!refs) return;
    if (refs.isProcessing) return;
    
    // 如果 currentScope 未设置，根据 modeKey 推断
    let currentScope = refs.currentScope;
    if (!currentScope || currentScope === 'undefined') {
        // 根据 modeKey 推断 currentScope
        if (modeKey === 'f1' || modeKey === 'football_menu' || modeKey.startsWith('football_')) {
            currentScope = 'sports';
        } else if (modeKey === 'mode_1' && refs.dbPlates && refs.dbPlates.length > 0 && (!refs.dbWorld || refs.dbWorld.length === 0)) {
            // 如果只有车牌数据，可能是中国模式
            currentScope = 'china';
        } else {
            // 默认使用 world
            currentScope = 'world';
        }
        // 更新 GameState
        if (window.GameState) {
            window.GameState.currentScope = currentScope;
        }
    }
    
    if (modeKey === 'football_menu' && currentScope === 'sports') {
        if (window.enterFootballSubMenu) {
            window.enterFootballSubMenu();
        }
        return;
    }
    if (modeKey === 'sprint_menu' && currentScope === 'world') {
        if (window.enterSprintSubMenu) {
            window.enterSprintSubMenu();
        }
        return;
    }
    
    // 创建 gameState，确保 questionPool 始终是数组
    let gameState = {
        currentScope: currentScope,
        gameMode: modeKey,
        score: 0,
        isProcessing: false,
        questionPool: [], // 初始化为空数组，后续会被正确设置
        currentQ: null,
        totalQs: 0,
        footballDifficulty: refs.footballDifficulty || 'easy',
        // 复制数据引用
        dbWorld: refs.dbWorld,
        dbPlates: refs.dbPlates,
        dbF1Tracks: refs.dbF1Tracks,
        dbFootballClubs: refs.dbFootballClubs,
        worldNameMap: refs.worldNameMap
    };
    window.currentGameSeed = null;
    
    if (modeKey === 'pk' && currentScope === 'china') {
        alert('中国模式下暂时不提供PK模式功能');
        return;
    }
    
    // 清除自动跳转定时器（如果存在）
    if (window.autoNextTimer) {
        clearTimeout(window.autoNextTimer);
        window.autoNextTimer = null;
    }
    document.getElementById('game-map-btn').style.display = 'none';
    
    if (currentScope === 'world') {
        if (!refs.dbWorld || refs.dbWorld.length === 0) {
            alert("⚠️ 世界国家数据未加载，请刷新页面重试。");
            return;
        }
        const pool = [...refs.dbWorld];
        const sovereignPool = refs.dbWorld.filter(c => c.sovereign === true);

        if (modeKey === 'mode_1') {
            const validPool = sovereignPool.filter(c => 
                c.capital_cn && c.capital_cn !== "无" && c.capital_cn !== null &&
                c.capital && c.capital !== "无"
            );
            
            if (validPool.length === 0) {
                alert("⚠️ 每日挑战题库为空，可能是数据加载问题。请刷新页面重试。");
                return;
            }
            
            // 使用每日种子生成题目（使用UTC日期，确保全球用户同一天看到相同题目）
            const seed = window.getTodaySeed();
            const rng = window.mulberry32(seed);
            
            let temp = [...validPool];
            for (let i = temp.length - 1; i > 0; i--) { 
                const j = Math.floor(rng() * (i + 1)); 
                [temp[i], temp[j]] = [temp[j], temp[i]]; 
            }
            gameState.questionPool = temp.slice(0, 20);
        }
        else if (modeKey === 'mode_2') {
            gameState.questionPool = sovereignPool.sort(() => Math.random() - 0.5).slice(0, 30);
        }
        else if (modeKey === 'mode_3a' || modeKey === 'mode_3b') {
            gameState.questionPool = pool.sort(() => Math.random() - 0.5).slice(0, 50);
        }
        else if (modeKey === 'pk') {
            window.showPKSeedModal();
            return;
        } else {
            gameState.questionPool = pool.sort(() => Math.random() - 0.5);
        }
    } else if (currentScope === 'china') {
        if (modeKey === 'city_network') {
            // 路网挑战模式
            if (!refs.dbCityNetworks || refs.dbCityNetworks.length === 0) {
                alert("⚠️ 城市路网数据未加载，请刷新页面重试。");
                return;
            }
            // 使用数组副本，避免修改原始数据（影响每日挑战的种子结果）
            gameState.questionPool = [...refs.dbCityNetworks].sort(() => Math.random() - 0.5).slice(0, 10);
            // 题目数量
            gameState.gameMode = 'city_network';
            // 使用GameState中已设置的模式（在入口按钮上已设置）
            gameState.cityNetworkFillMode = window.GameState ? (window.GameState.cityNetworkFillMode || false) : false;
        } else if (modeKey === 'china_daily_network') {
            // 中国模式每日挑战（路网图）
            if (!refs.dbCityNetworks || refs.dbCityNetworks.length === 0) {
                alert("⚠️ 城市路网数据未加载，请刷新页面重试。");
                return;
            }
            
            // 使用每日种子生成题目（使用UTC日期，确保全球用户同一天看到相同题目）
            const seed = window.getTodaySeed();
            const rng = window.mulberry32(seed);
            
            let temp = [...refs.dbCityNetworks];
            for (let i = temp.length - 1; i > 0; i--) { 
                const j = Math.floor(rng() * (i + 1)); 
                [temp[i], temp[j]] = [temp[j], temp[i]]; 
            }
            gameState.questionPool = temp.slice(0, 3);
            gameState.gameMode = 'china_daily_network';
            gameState.cityNetworkFillMode = true; // 强制填空题模式
            
            // 输出调试信息：显示今日的三个城市和种子值
            const todayCities = gameState.questionPool.map(q => q.name).join('、');
            console.log(`📅 今日挑战种子：${seed}，三个城市：${todayCities}`);
        } else {
            // 车牌挑战模式
            if (!refs.dbPlates || refs.dbPlates.length === 0) {
                alert("⚠️ 中国车牌数据未加载，请刷新页面重试。");
                return;
            }
            gameState.questionPool = refs.dbPlates.sort(() => Math.random() - 0.5).slice(0, 50);
            gameState.gameMode = 'mode_1'; // 明确设置游戏模式
            gameState.cityNetworkFillMode = false; // 车牌挑战不使用填空题模式
        }
    } else if (currentScope === 'sports') {
        if (modeKey === 'pk') {
            window.showPKSeedModal();
            return;
        } else if (gameState.gameMode === 'f1') {
            if (!refs.dbF1Tracks || refs.dbF1Tracks.length === 0) {
                alert("⚠️ F1赛道数据未加载，请刷新页面重试。");
                return;
            }
            gameState.questionPool = refs.dbF1Tracks.sort(() => Math.random() - 0.5).slice(0, 20);
        } else if (gameState.gameMode && (gameState.gameMode.startsWith('football_') || gameState.gameMode.startsWith('pk_football_'))) {
            if (!refs.dbFootballClubs || refs.dbFootballClubs.length === 0) {
                alert("⚠️ 足球俱乐部数据未加载，请刷新页面重试。");
                return;
            }
            // 从 gameMode 中提取难度
            if (gameState.gameMode.startsWith('football_')) {
                gameState.footballDifficulty = gameState.gameMode.split('_')[1];
            } else if (gameState.gameMode.startsWith('pk_football_')) {
                gameState.footballDifficulty = gameState.gameMode.replace('pk_football_', '');
            }
            
            // 简单模式：只使用五大联赛的球队（仅对非PK模式，PK模式的题库已在confirmPKSeed中设置）
            if (!gameState.gameMode.startsWith('pk_')) {
                if (gameState.footballDifficulty === 'easy') {
                    const topFiveLeagues = ['Premier League', 'La Liga', 'Serie A', 'Bundesliga', 'Ligue 1'];
                    const topFiveLeagueClubs = refs.dbFootballClubs.filter(club => 
                        topFiveLeagues.includes(club.league)
                    );
                    if (topFiveLeagueClubs.length === 0) {
                        alert("⚠️ 五大联赛数据未找到，请检查数据文件。");
                        return;
                    }
                    gameState.questionPool = topFiveLeagueClubs.sort(() => Math.random() - 0.5).slice(0, 20);
                } else {
                    gameState.questionPool = refs.dbFootballClubs.sort(() => Math.random() - 0.5).slice(0, 20);
                }
            }
              // PK模式的 questionPool 已经在 confirmPKSeed 中设置，这里不需要重新设置
        } else {
            alert("⚠️ 未知的体育模式：" + gameState.gameMode);
            return;
        }
    } else {
        alert("⚠️ 未知的游戏范围：" + currentScope);
        return;
    }
    
    // 确保 questionPool 已设置
    if (!gameState.questionPool || !Array.isArray(gameState.questionPool)) {
        alert("⚠️ 题库初始化失败，请刷新页面重试。");
        return;
    }
    
    gameState.totalQs = gameState.questionPool.length;
    if (gameState.totalQs === 0) {
        alert("题库为空！");
        return;
    }

    document.getElementById('remaining-questions').textContent = gameState.totalQs;

    let prefix = '';
    if (currentScope === 'world') prefix = '🌍 ';
    else if (currentScope === 'china') prefix = '🇨🇳 ';
    else if (currentScope === 'sports') {
        if (gameState.gameMode === 'f1') prefix = '🏎️ ';
        else if (gameState.gameMode.startsWith('football_')) prefix = '⚽ ';
    }
    
    let modeLabel = "挑战中";
    if (gameState.gameMode === 'pk' || gameState.gameMode.startsWith('pk_football_')) {
        modeLabel = `PK模式 (种子: ${window.currentGameSeed})`;
    }
    document.getElementById('game-mode-label').textContent = prefix + modeLabel;
    
    syncStateToGameState(gameState);
    
    // 同步后再次确认
    if (!window.GameState.questionPool || !Array.isArray(window.GameState.questionPool)) {
        alert("⚠️ 状态同步失败，请刷新页面重试。");
        return;
    }
    
    window.showView('view-game');
    nextRound();
}

function nextRound() {
    const refs = initDataReferences();
    if (!refs) {
        return;
    }
    
    // 确保 questionPool 存在且为数组
    if (!refs.questionPool || !Array.isArray(refs.questionPool)) {
        alert("⚠️ 游戏题库未初始化，请重新开始游戏。");
        if (window.goHome) window.goHome();
        return;
    }
    
    if (sprintTimer) {
        clearInterval(sprintTimer);
        sprintTimer = null;
        window.sprintTimer = null;
    }
    const countdownDisplay = document.getElementById('countdown-display');
    if (countdownDisplay) {
        countdownDisplay.style.display = 'none';
    }
    
    if (refs.questionPool.length === 0) {
        if (window.saveGameRecord) window.saveGameRecord();
        window.showView('view-result');
        document.getElementById('result-score').textContent = refs.score + " / " + refs.totalQs;
        document.getElementById('result-title').textContent = "🎉 挑战完成!";
        const percentage = Math.round((refs.score / refs.totalQs) * 100);
        let detail = `正确率: ${percentage}%`;
        if (percentage === 100) detail += " 🌟 完美！";
        else if (percentage >= 80) detail += " 👍 很棒！";
        else if (percentage >= 60) detail += " 💪 继续加油！";
        
        if ((refs.gameMode === 'pk' || refs.gameMode.startsWith('pk_football_')) && window.currentGameSeed) {
            detail += `\n\n⚔️ PK种子: ${window.currentGameSeed}\n与朋友输入相同种子可进行PK！`;
        }
        
        document.getElementById('result-detail').textContent = detail;
        return;
    }

    let gameState = {
        ...refs,
        isProcessing: false
    };
    
    // 清除自动跳转定时器（如果存在）
    if (window.autoNextTimer) {
        clearTimeout(window.autoNextTimer);
        window.autoNextTimer = null;
    }
    document.getElementById('game-map-btn').style.display = 'none';
    
    document.getElementById('score-display').textContent = gameState.score;
    document.getElementById('remaining-questions').textContent = gameState.questionPool.length;
    document.getElementById('progress-fill').style.width = ((gameState.totalQs - gameState.questionPool.length) / gameState.totalQs * 100) + '%';

    gameState.currentQ = gameState.questionPool.shift();
    window.currentQ = gameState.currentQ;
    syncStateToGameState(gameState);
    
    const img = document.getElementById('flag-img');
    const plate = document.getElementById('plate-display');
    const city = document.getElementById('city-display');
    const badge = document.getElementById('question-type-badge');
    const flagBox = document.querySelector('.flag-box');
    
    // 清除flag-box中可能存在的Canvas（每日挑战模式）
    const existingCanvas = flagBox ? flagBox.querySelector('canvas.masked-image-canvas') : null;
    if (existingCanvas) {
        existingCanvas.remove();
    }

    img.style.display = 'none';
    plate.style.display = 'none';
    city.style.display = 'none';
    img.classList.remove('silhouette', 'city-network-daily-mask');
    img.classList.remove('football-mask-easy', 'football-mask-medium', 'football-mask-hard', 'football-mask-hell');
    img.style.opacity = '1';
    img.style.transition = '';
    img.style.cursor = '';
    img.onclick = null;
    badge.textContent = '';
    
    // 清除 flag-box 的足球模式类
    if (flagBox) {
        flagBox.classList.remove('football-mode', 'football-mode-medium', 'football-mode-hard', 'football-mode-hell');
    }

    if (gameState.currentScope === 'world') {
        img.style.display = 'block';
        if (gameState.gameMode === 'mode_2') {
            if (gameState.currentQ.hasShape) { 
                img.classList.add('silhouette'); 
                img.src = `./assets/shapes/${gameState.currentQ.id}.svg`; 
                badge.textContent = "🗺️ 猜形状"; 
            } else { 
                img.src = `./assets/flags/${gameState.currentQ.id}.png`; 
                badge.textContent = "🚩 猜国家 (无剪影)"; 
            }
        } else {
            img.src = `./assets/flags/${gameState.currentQ.id}.png`;
            badge.textContent = (gameState.gameMode === 'mode_1') ? "🚩 猜首都" : "🚩 猜国家";
        }
    } else if (gameState.currentScope === 'china') {
        if (gameState.gameMode === 'city_network' || gameState.gameMode === 'china_daily_network') {
            // 路网挑战模式或中国每日挑战
            img.classList.remove('silhouette', 'city-network-daily-mask');
            
            // 中国每日挑战：使用Canvas实现遮罩，防止用户下载原始图片
            if (gameState.gameMode === 'china_daily_network') {
                // 隐藏原始img标签
                img.style.display = 'none';
                
                // 清除flag-box中可能存在的Canvas
                const flagBox = document.querySelector('.flag-box');
                const existingCanvas = flagBox.querySelector('canvas.masked-image-canvas');
                if (existingCanvas) {
                    existingCanvas.remove();
                }
                
                // 创建Canvas并应用遮罩（25%遮罩 = 显示中间50%区域）
                window.createMaskedCanvas(gameState.currentQ.img, 25).then((canvas) => {
                    canvas.className = 'flag-img masked-image-canvas';
                    canvas.style.display = 'block';
                    canvas.style.opacity = '0';
                    canvas.style.transition = 'opacity 0.3s';
                    canvas.style.cursor = 'zoom-in';
                    canvas.style.maxWidth = '100%';
                    canvas.style.maxHeight = '100%';
                    canvas.style.width = '100%';
                    canvas.style.height = '100%';
                    canvas.style.objectFit = 'cover';
                    
                    // 添加下载保护，确保使用通用文件名
                    window.protectCanvasDownload(canvas, 'daily-challenge.png');
                    
                    // 添加点击放大功能
                    canvas.onclick = function() {
                        openImageZoom(gameState.currentQ.img, true); // 传入 true 表示应用遮罩
                    };
                    
                    // 插入Canvas到flag-box
                    if (flagBox) {
                        flagBox.appendChild(canvas);
                        // 淡入效果
                        setTimeout(() => {
                            canvas.style.opacity = '1';
                        }, 10);
                    }
                }).catch((error) => {
                    console.error('创建遮罩Canvas失败:', error);
                    // 如果Canvas创建失败，回退到原始img标签
                    img.style.display = 'block';
                    img.classList.add('city-network-daily-mask');
                    img.style.cursor = 'zoom-in';
                    img.src = gameState.currentQ.img;
                    img.onclick = function() {
                        openImageZoom(gameState.currentQ.img, true);
                    };
                });
                
                badge.textContent = "📅 每日挑战：看路网中间区域，猜城市（点击图片放大）";
            } else {
                // 普通路网挑战：使用原始img标签
                img.style.display = 'block';
                img.style.opacity = '0';
                img.style.transition = 'opacity 0.3s';
                img.style.cursor = 'zoom-in';
                img.onload = function() {
                    this.style.opacity = '1';
                };
                img.onerror = function() {
                    this.style.opacity = '1';
                };
                img.src = gameState.currentQ.img;
                img.onclick = function() {
                    openImageZoom(gameState.currentQ.img);
                };
                badge.textContent = "🗺️ 看路网，猜城市（点击图片放大）";
            }
        } else if (gameState.gameMode === 'mode_3a' || gameState.gameMode === 'mode_3b') {
            city.style.display = 'block';
            city.textContent = gameState.currentQ.name;
            badge.textContent = "🏙️ 猜车牌";
        } else {
            plate.style.display = 'inline-block';
            plate.textContent = gameState.currentQ.plate;
            badge.textContent = "看车牌，猜地名";
        }
    } else if (gameState.currentScope === 'sports') {
        if (gameState.gameMode === 'f1') {
            img.style.display = 'block';
            img.src = gameState.currentQ.img;
            img.classList.add('silhouette');
            img.classList.remove('football-mask-easy', 'football-mask-medium', 'football-mask-hard', 'football-mask-hell');
            badge.textContent = "🏎️ 猜赛道";
        } else if (gameState.gameMode.startsWith('football_') || gameState.gameMode.startsWith('pk_football_')) {
            img.style.display = 'block';
            img.style.opacity = '0';
            img.style.transition = 'opacity 0.3s';
            img.onload = function() {
                this.style.opacity = '1';
            };
            img.onerror = function() {
                this.style.opacity = '1';
            };
            img.src = gameState.currentQ.img;
            img.classList.remove('silhouette');
            img.classList.remove('football-mask-easy', 'football-mask-medium', 'football-mask-hard', 'football-mask-hell');
            img.style.removeProperty('--football-rotation');
            img.style.removeProperty('transform');
            
            // 从 gameMode 中提取难度（pk_football_easy -> easy）
            let difficulty = gameState.footballDifficulty;
            if (!difficulty && gameState.gameMode.startsWith('pk_football_')) {
                difficulty = gameState.gameMode.replace('pk_football_', '');
            } else if (!difficulty && gameState.gameMode.startsWith('football_')) {
                difficulty = gameState.gameMode.split('_')[1];
            }
            // 如果还是没有难度，默认使用 easy
            if (!difficulty) {
                difficulty = 'easy';
            }
            
            // 为 flag-box 添加对应的足球模式类，用于显示白色圆形背景和边框
            if (flagBox) {
                flagBox.classList.add('football-mode');
                if (difficulty === 'medium') {
                    flagBox.classList.add('football-mode-medium');
                } else if (difficulty === 'hard') {
                    flagBox.classList.add('football-mode-hard');
                } else if (difficulty === 'hell') {
                    flagBox.classList.add('football-mode-hell');
                }
            }
            
            if (difficulty === 'easy') {
                img.classList.add('football-mask-easy');
                badge.textContent = "⚽ 猜俱乐部 (简单)";
            } else if (difficulty === 'medium') {
                img.classList.add('football-mask-medium');
                badge.textContent = "⚽ 猜俱乐部 (中等)";
            } else if (difficulty === 'hard') {
                img.classList.add('football-mask-hard');
                badge.textContent = "⚽ 猜俱乐部 (困难)";
            } else if (difficulty === 'hell') {
                const rotationAngle = Math.floor(Math.random() * 361) - 180;
                img.classList.add('football-mask-hell');
                img.style.setProperty('--football-rotation', `${rotationAngle}deg`);
                img.style.transform = `rotate(${rotationAngle}deg)`;
                badge.textContent = "🔥 猜俱乐部 (地狱)";
            }
        }
    }

    let sourceDB;
    if (gameState.currentScope === 'world') sourceDB = refs.dbWorld;
    else if (gameState.currentScope === 'china') {
        if (gameState.gameMode === 'city_network' || gameState.gameMode === 'china_daily_network') sourceDB = refs.dbCityNetworks;
        else sourceDB = refs.dbPlates;
    } else if (gameState.currentScope === 'sports') {
        if (gameState.gameMode === 'f1') sourceDB = refs.dbF1Tracks;
        else if (gameState.gameMode.startsWith('football_') || gameState.gameMode.startsWith('pk_football_')) sourceDB = refs.dbFootballClubs;
        else sourceDB = [];
    } else sourceDB = [];
    
    // 路网模式：根据模式显示选项或输入框
    const optionsArea = document.getElementById('options-area');
    const fillAnswerArea = document.getElementById('fill-answer-area');
    const fillAnswerInput = document.getElementById('fill-answer-input');
    const toggleContainer = document.querySelector('.city-network-toggle-container');
    
    if (gameState.gameMode === 'city_network' || gameState.gameMode === 'china_daily_network') {
        // 根据模式显示选项或输入框
        // 中国每日挑战强制使用填空题模式
        const useFillMode = gameState.gameMode === 'china_daily_network' ? true : gameState.cityNetworkFillMode;
        if (useFillMode) {
            // 填空题模式
            if (optionsArea) optionsArea.style.display = 'none';
            if (fillAnswerArea) fillAnswerArea.style.display = 'block';
            if (fillAnswerInput) {
                fillAnswerInput.value = '';
                fillAnswerInput.disabled = false;
                fillAnswerInput.style.borderColor = 'rgba(255, 255, 255, 0.3)';
                fillAnswerInput.style.background = 'rgba(255, 255, 255, 0.1)';
                fillAnswerInput.focus();
                // 支持回车提交
                fillAnswerInput.onkeypress = function(e) {
                    if (e.key === 'Enter') {
                        submitFillAnswer();
                    }
                };
            }
        } else {
            // 选择题模式
            if (optionsArea) optionsArea.style.display = 'grid';
            if (fillAnswerArea) fillAnswerArea.style.display = 'none';
            
            const opts = window.generateOptions(gameState.currentQ, gameState.currentScope, gameState.gameMode, sourceDB);
            optionsArea.innerHTML = '';
            opts.forEach(opt => {
                const btn = document.createElement('button');
                btn.className = 'game-opt-btn';
                btn.textContent = window.getOptionDisplayText(opt, gameState.currentScope, gameState.gameMode);
                btn.onclick = () => checkAnswer(opt, btn);
                optionsArea.appendChild(btn);
            });
        }
    } else {
        // 非路网模式，隐藏拨动开关和输入框
        if (toggleContainer) toggleContainer.style.display = 'none';
        if (fillAnswerArea) fillAnswerArea.style.display = 'none';
        if (optionsArea) optionsArea.style.display = 'grid';
        
        const opts = window.generateOptions(gameState.currentQ, gameState.currentScope, gameState.gameMode, sourceDB);
        optionsArea.innerHTML = '';
        opts.forEach(opt => {
            const btn = document.createElement('button');
            btn.className = 'game-opt-btn';
            btn.textContent = window.getOptionDisplayText(opt, gameState.currentScope, gameState.gameMode);
            btn.onclick = () => checkAnswer(opt, btn);
            optionsArea.appendChild(btn);
        });
    }
    
    if ((gameState.gameMode === 'mode_3a' || gameState.gameMode === 'mode_3b') && gameState.currentScope === 'world') {
        startSprintCountdown();
    }
}

function startSprintCountdown() {
    const refs = initDataReferences();
    if (!refs) return;
    
    const countdownDisplay = document.getElementById('countdown-display');
    if (!countdownDisplay) return;
    
    let timeLeft = 15;
    countdownDisplay.style.display = 'inline';
    countdownDisplay.textContent = timeLeft;
    countdownDisplay.style.color = '#FF6B6B';
    
    sprintTimer = setInterval(() => {
        window.sprintTimer = sprintTimer;
        timeLeft--;
        countdownDisplay.textContent = timeLeft;
        
        if (timeLeft <= 5) {
            countdownDisplay.style.color = '#FF0000';
        }
        
        if (timeLeft <= 0) {
            clearInterval(sprintTimer);
            sprintTimer = null;
            window.sprintTimer = null;
            countdownDisplay.style.display = 'none';
            
            const currentRefs = initDataReferences();
            if (!currentRefs.isProcessing && currentRefs.questionPool.length > 0) {
                let gameState = {
                    ...currentRefs,
                    isProcessing: true
                };
                syncStateToGameState(gameState);
                
                const allBtns = document.getElementById('options-area').querySelectorAll('button');
                const correctText = currentRefs.currentQ.name;
                allBtns.forEach(b => { 
                    if (b.textContent === correctText) b.classList.add('correct'); 
                });
                
                allBtns.forEach(b => b.disabled = true);
                if (currentRefs.currentScope === 'world') {
                    document.getElementById('game-map-btn').style.display = 'block';
                }
                
                // 清除之前的自动跳转定时器（如果存在）
                if (window.autoNextTimer) {
                    clearTimeout(window.autoNextTimer);
                    window.autoNextTimer = null;
                }
                
                // 设置1秒后自动跳转下一题
                window.autoNextTimer = setTimeout(() => {
                    window.autoNextTimer = null;
                    const finalRefs = initDataReferences();
                    if (finalRefs.questionPool.length > 0) {
                        let gameState = {
                            ...finalRefs,
                            isProcessing: false
                        };
                        syncStateToGameState(gameState);
                        nextRound();
                    } else {
                        let gameState = {
                            ...finalRefs,
                            isProcessing: false
                        };
                        syncStateToGameState(gameState);
                        if (window.saveGameRecord) window.saveGameRecord();
                        window.showView('view-result');
                        document.getElementById('result-score').textContent = finalRefs.score + " / " + finalRefs.totalQs;
                        document.getElementById('result-title').textContent = "🎉 挑战完成!";
                        const percentage = Math.round((finalRefs.score / finalRefs.totalQs) * 100);
                        let detail = `正确率: ${percentage}%`;
                        if (percentage === 100) detail += " 🌟 完美！";
                        else if (percentage >= 80) detail += " 👍 很棒！";
                        else if (percentage >= 60) detail += " 💪 继续加油！";
                        document.getElementById('result-detail').textContent = detail;
                    }
                }, 1500);
            } else if (currentRefs.questionPool.length === 0) {
                if (window.saveGameRecord) window.saveGameRecord();
                window.showView('view-result');
                document.getElementById('result-score').textContent = currentRefs.score + " / " + currentRefs.totalQs;
                document.getElementById('result-title').textContent = "🎉 挑战完成!";
                const percentage = Math.round((currentRefs.score / currentRefs.totalQs) * 100);
                let detail = `正确率: ${percentage}%`;
                if (percentage === 100) detail += " 🌟 完美！";
                else if (percentage >= 80) detail += " 👍 很棒！";
                else if (percentage >= 60) detail += " 💪 继续加油！";
                document.getElementById('result-detail').textContent = detail;
            }
        }
    }, 1000);
}

function checkAnswer(choice, btn) {
    const refs = initDataReferences();
    if (!refs) return;
    if (refs.isProcessing) return;
    
    let gameState = {
        ...refs,
        isProcessing: true
    };
    
    if (sprintTimer) {
        clearInterval(sprintTimer);
        sprintTimer = null;
        window.sprintTimer = null;
        const countdownDisplay = document.getElementById('countdown-display');
        if (countdownDisplay) {
            countdownDisplay.style.display = 'none';
        }
    }
    
    let isCorrect = false;
    let correctText = "";
    
    if (gameState.currentScope === 'world') {
        if (gameState.gameMode === 'mode_1') {
            isCorrect = (choice.id === gameState.currentQ.id && !choice._isLargestCity);
            correctText = gameState.currentQ.capital_cn || gameState.currentQ.capital;
        } else {
            isCorrect = (choice.id === gameState.currentQ.id);
            correctText = gameState.currentQ.name;
        }
    } else if (gameState.currentScope === 'china') {
        if (gameState.gameMode === 'city_network' || gameState.gameMode === 'china_daily_network') {
            isCorrect = (choice.id === gameState.currentQ.id);
            correctText = gameState.currentQ.name;
        } else {
            isCorrect = (choice.name === gameState.currentQ.name);
            correctText = gameState.currentQ.name;
        }
    } else if (gameState.currentScope === 'sports') {
        if (gameState.gameMode === 'f1') {
            isCorrect = (choice.id === gameState.currentQ.id);
            correctText = gameState.currentQ.name;
        } else if (gameState.gameMode.startsWith('football_') || gameState.gameMode.startsWith('pk_football_')) {
            isCorrect = (choice.id === gameState.currentQ.id);
            correctText = gameState.currentQ.name_zh || gameState.currentQ.name;
        }
    }

    // 禁用所有选项按钮
    const allBtns = document.getElementById('options-area').querySelectorAll('button');
    allBtns.forEach(b => b.disabled = true);
    
    if (isCorrect) {
        btn.classList.add('correct');
        gameState.score++;
    } else {
        btn.classList.add('wrong');
        // 找到正确答案对应的按钮并高亮
        const correctDisplayText = gameState.currentScope === 'sports' && (gameState.gameMode.startsWith('football_') || gameState.gameMode.startsWith('pk_football_'))
            ? (gameState.currentQ.name_zh || gameState.currentQ.name)
            : correctText;
        allBtns.forEach(b => { 
            if (b.textContent === correctDisplayText || b.textContent.trim() === correctDisplayText) {
                b.classList.add('correct'); 
            }
        });
    }
    
    document.getElementById('score-display').textContent = gameState.score;
    syncStateToGameState(gameState);
    
    if (gameState.currentScope === 'world') {
        document.getElementById('game-map-btn').style.display = 'block';
        if (gameState.gameMode === 'mode_2') {
            document.getElementById('flag-img').classList.remove('silhouette');
        }
    }
    
    // 清除之前的自动跳转定时器（如果存在）
    if (window.autoNextTimer) {
        clearTimeout(window.autoNextTimer);
        window.autoNextTimer = null;
    }
    
    // 设置1.5秒后自动跳转下一题
    window.autoNextTimer = setTimeout(() => {
        window.autoNextTimer = null;
        const currentRefs = initDataReferences();
        if (currentRefs && currentRefs.questionPool.length > 0) {
            let nextGameState = {
                ...currentRefs,
                isProcessing: false
            };
            syncStateToGameState(nextGameState);
            nextRound();
        } else if (currentRefs && currentRefs.questionPool.length === 0) {
            // 题目已全部完成
            let finalGameState = {
                ...currentRefs,
                isProcessing: false
            };
            syncStateToGameState(finalGameState);
            if (window.saveGameRecord) window.saveGameRecord();
            window.showView('view-result');
            document.getElementById('result-score').textContent = currentRefs.score + " / " + currentRefs.totalQs;
            document.getElementById('result-title').textContent = "🎉 挑战完成!";
            const percentage = Math.round((currentRefs.score / currentRefs.totalQs) * 100);
            let detail = `正确率: ${percentage}%`;
            if (percentage === 100) detail += " 🌟 完美！";
            else if (percentage >= 80) detail += " 👍 很棒！";
            else if (percentage >= 60) detail += " 💪 继续加油！";
            document.getElementById('result-detail').textContent = detail;
        }
    }, 1000);
}

// 切换路网模式（选择题/填空题）
// 切换路网模式（选择题/填空题）- 已移至入口按钮，此函数保留用于兼容
function toggleCityNetworkMode() {
    // 此函数已不再使用，拨动开关已移至入口按钮
    // 拨动开关现在在入口按钮上，切换时会自动更新 GameState.cityNetworkFillMode
}

// 提交填空题答案
function submitFillAnswer() {
    const refs = initDataReferences();
    if (!refs) return;
    if (refs.isProcessing) return;
    
    const input = document.getElementById('fill-answer-input');
    if (!input || !input.value.trim()) {
        return;
    }
    
    const userAnswer = input.value.trim();
    const correctAnswer = refs.currentQ.name;
    
    // 检查答案
    checkFillAnswer(userAnswer, correctAnswer, input);
}

// 检查填空题答案
function checkFillAnswer(userAnswer, correctAnswer, input) {
    const refs = initDataReferences();
    if (!refs) return;
    if (refs.isProcessing) return;
    
    let gameState = {
        ...refs,
        isProcessing: true
    };
    
    // 答案匹配（忽略大小写和空格）
    const normalizedUser = userAnswer.toLowerCase().replace(/\s+/g, '');
    const normalizedCorrect = correctAnswer.toLowerCase().replace(/\s+/g, '');
    const isCorrect = normalizedUser === normalizedCorrect;
    
    // 更新UI
    if (input) {
        input.disabled = true;
        if (isCorrect) {
            input.style.borderColor = '#4CAF50';
            input.style.background = 'rgba(76, 175, 80, 0.2)';
        } else {
            input.style.borderColor = '#ff5252';
            input.style.background = 'rgba(255, 82, 82, 0.2)';
        }
    }
    
    if (isCorrect) {
        gameState.score++;
    }
    
    syncStateToGameState(gameState);
    
    // 更新进度
    const progressFill = document.getElementById('progress-fill');
    const scoreDisplay = document.getElementById('score-display');
    const remainingDisplay = document.getElementById('remaining-questions');
    if (progressFill) {
        const progress = ((gameState.totalQs - gameState.questionPool.length) / gameState.totalQs) * 100;
        progressFill.style.width = progress + '%';
    }
    if (scoreDisplay) scoreDisplay.textContent = gameState.score;
    if (remainingDisplay) remainingDisplay.textContent = gameState.questionPool.length;
    
    // 每日挑战模式：不显示正确答案，除非全部答对
    const isDailyChallenge = refs.gameMode === 'china_daily_network';
    if (isDailyChallenge) {
        // 检查是否全部答对
        const allAnswered = refs.questionPool.length === 0;
        if (allAnswered && refs.score === refs.totalQs) {
            // 全部答对，显示正确答案
            if (!isCorrect && input) {
                input.value = `${userAnswer} → ${correctAnswer}`;
            }
        } else {
            // 未全部答对，只显示对错，不显示正确答案
            if (!isCorrect && input) {
                input.value = userAnswer; // 保持用户输入，不显示正确答案
            }
        }
    } else {
        // 非每日挑战模式：正常显示正确答案
        if (!isCorrect && input) {
            input.value = `${userAnswer} → ${correctAnswer}`;
        }
    }
    
    // 自动跳转下一题
    window.autoNextTimer = setTimeout(() => {
        window.autoNextTimer = null;
        const finalRefs = initDataReferences();
        if (finalRefs.questionPool.length > 0) {
            let nextGameState = {
                ...finalRefs,
                isProcessing: false
            };
            syncStateToGameState(nextGameState);
            nextRound();
        } else {
            let finalGameState = {
                ...finalRefs,
                isProcessing: false
            };
            syncStateToGameState(finalGameState);
            if (window.saveGameRecord) window.saveGameRecord();
            window.showView('view-result');
            document.getElementById('result-score').textContent = finalRefs.score + " / " + finalRefs.totalQs;
            document.getElementById('result-title').textContent = "🎉 挑战完成!";
            const percentage = Math.round((finalRefs.score / finalRefs.totalQs) * 100);
            let detail = `正确率: ${percentage}%`;
            if (percentage === 100) detail += " 🌟 完美！";
            else if (percentage >= 80) detail += " 👍 很棒！";
            else if (percentage >= 60) detail += " 💪 继续加油！";
            document.getElementById('result-detail').textContent = detail;
        }
    }, 1500);
}

// 暴露到全局
window.startGame = startGame;
window.nextRound = nextRound;
window.checkAnswer = checkAnswer;
window.startSprintCountdown = startSprintCountdown;
window.initDataReferences = initDataReferences;
window.syncStateToGameState = syncStateToGameState;
window.toggleCityNetworkMode = toggleCityNetworkMode;
window.submitFillAnswer = submitFillAnswer;
