// UI控制器模块
import { getWorldData, getPlatesData } from './data-manager.js';
import { getWorldNameMap } from './data-manager.js';

/**
 * 显示指定视图
 * @param {string} id - 视图ID
 */
export function showView(id) {
    document.querySelectorAll('.container').forEach(d => d.classList.remove('active'));
    const el = document.getElementById(id);
    if (el) {
        el.classList.add('active');
    } else {
        console.error("找不到视图 ID:", id);
    }
}

/**
 * 返回主菜单
 */
export function goHome() {
    showView('view-menu');
}

/**
 * 进入游戏范围选择
 * @param {string} scope - 'world' 或 'china'
 */
export function enterGameScope(scope) {
    const isWorld = (scope === 'world');
    const dbWorld = getWorldData();
    const dbPlates = getPlatesData();
    
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
    btn.onclick = function() { 
        if (window.startGameHandler) window.startGameHandler(modeKey);
    };
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

/**
 * 更新游戏界面
 * @param {Object} question - 当前问题
 * @param {string} gameMode - 游戏模式
 * @param {string} scope - 游戏范围
 */
export function updateGameUI(question, gameMode, scope) {
    const img = document.getElementById('flag-img');
    const plate = document.getElementById('plate-display');
    const city = document.getElementById('city-display');
    const badge = document.getElementById('question-type-badge');

    // 默认全隐藏
    img.style.display = 'none';
    plate.style.display = 'none';
    city.style.display = 'none';
    img.classList.remove('silhouette');

    if (scope === 'world') {
        img.style.display = 'block';
        if (gameMode === 'mode_2') {
            if(question.hasShape) { 
                img.classList.add('silhouette'); 
                img.src = `./assets/shapes/${question.id}.svg`; 
                badge.textContent = "🗺️ 猜形状"; 
            } else { 
                img.src = `./assets/flags/${question.id}.png`; 
                badge.textContent = "🚩 猜国家 (无剪影)"; 
            }
        } else {
            img.src = `./assets/flags/${question.id}.png`;
            badge.textContent = (gameMode === 'mode_1') ? "🚩 猜首都" : "🚩 猜国家";
        }
    } else {
        if (gameMode === 'mode_3') {
            city.style.display = 'block';
            city.textContent = question.name;
            badge.textContent = "🏙️ 猜车牌";
        } else {
            plate.style.display = 'inline-block';
            plate.textContent = question.plate;
            badge.textContent = (question.type === 'county') ? "🏡 猜县级市" : "🏙️ 猜城市";
        }
    }
}

/**
 * 渲染选项按钮
 * @param {Array} options - 选项数组
 * @param {string} gameMode - 游戏模式
 * @param {string} scope - 游戏范围
 * @param {Function} onSelect - 选择回调函数
 */
export function renderOptions(options, gameMode, scope, onSelect) {
    const area = document.getElementById('options-area');
    area.innerHTML = '';
    
    options.forEach(opt => {
        const btn = document.createElement('button');
        btn.className = 'game-opt-btn';
        
        if (scope === 'world') {
            btn.textContent = (gameMode === 'mode_1') ? (opt.capital_cn || opt.capital) : opt.name; 
        } else {
            if (gameMode === 'mode_3') btn.textContent = opt.plate;
            else btn.textContent = opt.name;
        }
        btn.onclick = () => onSelect(opt, btn);
        area.appendChild(btn);
    });
}

/**
 * 显示答案反馈
 * @param {boolean} isCorrect - 是否正确
 * @param {string} correctText - 正确答案文本
 * @param {Object} question - 当前问题
 * @param {string} scope - 游戏范围
 */
export function showAnswerFeedback(isCorrect, correctText, question, scope) {
    const allBtns = document.getElementById('options-area').querySelectorAll('button');
    allBtns.forEach(b => { 
        if (b.textContent === correctText) b.classList.add('correct');
    });
    
    if (!isCorrect) {
        const fb = document.getElementById('answer-feedback');
        fb.style.display = 'block';
        if (scope === 'world') {
            fb.innerHTML = `正确答案: <b>${question.name}</b>`;
        } else {
            fb.innerHTML = `正确答案: <b>${question.name}</b> (${question.plate})`;
        }
    }
}

/**
 * 更新得分显示
 * @param {number} score - 当前得分
 */
export function updateScore(score) {
    document.getElementById('score-display').textContent = score;
}

/**
 * 更新进度条
 * @param {number} progress - 进度百分比 (0-100)
 */
export function updateProgress(progress) {
    document.getElementById('progress-fill').style.width = progress + '%';
}

/**
 * 显示结果页面
 * @param {number} score - 得分
 * @param {number} total - 总题数
 */
export function showResult(score, total) {
    showView('view-result');
    document.getElementById('result-score').textContent = score + " / " + total;
    document.getElementById('result-title').textContent = "🎉 挑战完成!";
    const percentage = Math.round((score / total) * 100);
    let detail = `正确率: ${percentage}%`;
    if (percentage === 100) detail += " 🌟 完美！";
    else if (percentage >= 80) detail += " 👍 很棒！";
    else if (percentage >= 60) detail += " 💪 继续加油！";
    document.getElementById('result-detail').textContent = detail;
}

/**
 * 打开图鉴
 */
export function openCompendium() {
    showView('view-compendium');
    const grid = document.getElementById('compendium-grid');
    grid.innerHTML = '';
    const scope = window.getCurrentScope ? window.getCurrentScope() : 'world';
    const sourceDB = (scope === 'world') ? getWorldData() : getPlatesData();
    
    sourceDB.forEach(c => {
        const div = document.createElement('div');
        div.className = 'compendium-item';
        let searchKey = scope==='world' ? c.name : c.name+c.plate;
        div.setAttribute('data-search', searchKey.toLowerCase());
        
        if (scope === 'world') {
            div.innerHTML = `<img src="./assets/flags/${c.id}.png" loading="lazy"><span>${c.name}</span>`;
        } else {
            div.innerHTML = `<div style="background:#00479d;color:white;padding:2px;font-size:10px;border-radius:4px;margin-bottom:5px">${c.plate}</div><span>${c.name}</span>`;
        }
        div.onclick = () => {
            if (window.showDetailHandler) window.showDetailHandler(c);
        };
        grid.appendChild(div);
    });
    document.getElementById('search-input').value = '';
    filterCompendium();
}

/**
 * 过滤图鉴
 */
export function filterCompendium() {
    const input = document.getElementById('search-input').value.toLowerCase();
    document.querySelectorAll('.compendium-item').forEach(item => {
        item.style.display = item.getAttribute('data-search').includes(input) ? 'flex' : 'none';
    });
}

/**
 * 显示详情
 * @param {Object} item - 项目数据
 */
export function showDetail(item) {
    const modal = document.getElementById('info-modal');
    const img = document.getElementById('modal-img');
    const plate = document.getElementById('modal-plate');
    const scope = window.getCurrentScope ? window.getCurrentScope() : 'world';
    
    if (scope === 'world') {
        img.style.display = 'block'; plate.style.display = 'none';
        img.src = `./assets/flags/${item.id}.png`;
        document.getElementById('modal-name').textContent = item.name;
        document.getElementById('modal-en-name').textContent = item.fullName;
        const capitalDisplay = item.capital_cn || item.capital || "无";
        document.querySelector('.info-grid').innerHTML = `
            <div class="info-row"><span class="info-label">首都</span><span class="info-val">${capitalDisplay}</span></div>
            <div class="info-row"><span class="info-label">区域</span><span class="info-val">${item.region}</span></div>
            <div class="info-row"><span class="info-label">货币</span><span class="info-val">${item.currency}</span></div>
        `;
        document.getElementById('modal-map-btn').style.display = 'block';
        document.getElementById('modal-map-btn').onclick = () => {
            if (window.openMapHandler) window.openMapHandler(item);
        };
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

/**
 * 关闭模态框
 */
export function closeModal(e) {
    if (e.target.id === 'info-modal' || e.target.classList.contains('btn-close')) {
        document.getElementById('info-modal').style.display = 'none';
    }
}

/**
 * 显示排行榜
 */
export function showRank() {
    showView('view-rank');
}

