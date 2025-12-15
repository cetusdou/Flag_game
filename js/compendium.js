// ============================================================================
// 图鉴功能模块
// ============================================================================

function initCompendiumDataReferences() {
    const gameState = window.GameState;
    const gameData = window.GameData;
    
    if (!gameState || !gameData) {
        return null;
    }
    
    return {
        dbWorld: gameData.dbWorld,
        dbPlates: gameData.dbPlates,
        dbF1Tracks: gameData.dbF1Tracks,
        dbFootballClubs: gameData.dbFootballClubs,
        wikiExtraData: gameData.wikiExtraData,
        currentScope: gameState.currentScope || 'world'
    };
}

function openCompendium() {
    const refs = initCompendiumDataReferences();
    if (!refs) return;
    
    if (refs.currentScope === 'china') {
        alert('中国模式下暂时不提供知识图鉴功能');
        return;
    }
    
    window.showView('view-compendium');
    
    // 更新页面标题
    const compendiumTitle = document.querySelector('#view-compendium h2');
    if (compendiumTitle) {
        if (refs.currentScope === 'sports') {
            compendiumTitle.textContent = '⚽ 足球俱乐部图鉴';
        } else if (refs.currentScope === 'world') {
            compendiumTitle.textContent = '📖 知识图鉴';
        } else {
            compendiumTitle.textContent = '📖 知识图鉴';
        }
    }
    
    const grid = document.getElementById('compendium-grid');
    grid.innerHTML = '';
    
    let sourceDB = [];
    if (refs.currentScope === 'world') {
        sourceDB = refs.dbWorld;
    } else if (refs.currentScope === 'sports') {
        // 体育模式：显示足球俱乐部
        sourceDB = refs.dbFootballClubs || [];
    } else {
        sourceDB = refs.dbPlates;
    }
    
    sourceDB.forEach(c => {
        const div = document.createElement('div');
        div.className = 'compendium-item';
        
        let searchKey = '';
        if (refs.currentScope === 'world') {
            searchKey = `${c.name} ${c.name_en} ${c.fullName} ${c.capital} ${c.capital_cn || ''} ${c.id} ${c.largestCity || ''} ${c.largestCity_cn || ''}`.toLowerCase();
        } else if (refs.currentScope === 'sports') {
            searchKey = `${c.name} ${c.name_zh || ''} ${c.league || ''} ${c.full_name || ''} ${c.id}`.toLowerCase();
        } else {
            searchKey = `${c.name} ${c.plate}`.toLowerCase();
        }
        
        div.setAttribute('data-search', searchKey);
        
        if (refs.currentScope === 'world') {
            div.innerHTML = `<img src="./assets/flags/${c.id}.png" loading="lazy"><span>${c.name}</span>`;
        } else if (refs.currentScope === 'sports') {
            div.innerHTML = `<img src="${c.img}" loading="lazy" style="object-fit: contain;"><span>${c.name_zh || c.name}</span>`;
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
    const refs = initCompendiumDataReferences();
    if (!refs) return;
    
    const modal = document.getElementById('info-modal');
    const img = document.getElementById('modal-img');
    const plate = document.getElementById('modal-plate');
    
    if (refs.currentScope === 'sports') {
        // 足球俱乐部详情
        img.style.display = 'block';
        plate.style.display = 'none';
        img.src = item.img;
        img.style.objectFit = 'contain';
        document.getElementById('modal-name').textContent = item.name_zh || item.name;
        document.getElementById('modal-en-name').textContent = item.name || '';
        
        let infoHTML = '';
        if (item.league) {
            infoHTML += `<div class="info-row"><span class="info-label">联赛</span><span class="info-val">${item.league}</span></div>`;
        }
        if (item.full_name) {
            infoHTML += `<div class="info-row"><span class="info-label">全称</span><span class="info-val">${item.full_name}</span></div>`;
        }
        if (item.founded) {
            infoHTML += `<div class="info-row"><span class="info-label">成立年份</span><span class="info-val">${item.founded}</span></div>`;
        }
        if (item.ground) {
            infoHTML += `<div class="info-row"><span class="info-label">主场</span><span class="info-val">${item.ground}</span></div>`;
        }
        
        document.querySelector('.info-grid').innerHTML = infoHTML;
        
        // 隐藏 Wiki 信息（足球俱乐部没有 Wiki 信息）
        const wikiContainer = document.getElementById('wiki-info-container');
        if (wikiContainer) {
            wikiContainer.style.display = 'none';
        }
        
        // 隐藏地图按钮（足球俱乐部不需要地图）
        const mapBtn = document.getElementById('modal-map-btn');
        if (mapBtn) {
            mapBtn.style.display = 'none';
        }
        
        modal.style.display = 'flex';
        return;
    } else if (refs.currentScope === 'world') {
        img.style.display = 'block';
        plate.style.display = 'none';
        img.src = `./assets/flags/${item.id}.png`;
        document.getElementById('modal-name').textContent = item.name;
        document.getElementById('modal-en-name').textContent = `${item.name_en} / ${item.fullName}`;
        
        let infoHTML = '';
        
        const capitalDisplay = item.capital_cn || item.capital || "无";
        const capitalEn = item.capital && item.capital !== "无" ? item.capital : "";
        const capitalText = capitalEn && capitalDisplay !== capitalEn ? `${capitalDisplay} (${capitalEn})` : capitalDisplay;
        infoHTML += `<div class="info-row"><span class="info-label">首都</span><span class="info-val">${capitalText}</span></div>`;
        
        if (item.area && item.area > 0) {
            const areaText = item.area >= 1000000 
                ? `${(item.area / 1000000).toFixed(2)} 万 km²` 
                : `${item.area.toLocaleString()} km²`;
            infoHTML += `<div class="info-row"><span class="info-label">面积</span><span class="info-val">${areaText}</span></div>`;
        }
        
        if (item.languages && item.languages !== "通用") {
            infoHTML += `<div class="info-row"><span class="info-label">语言</span><span class="info-val">${item.languages}</span></div>`;
        }
        
        if (item.currency && item.currency !== "通用") {
            infoHTML += `<div class="info-row"><span class="info-label">货币</span><span class="info-val">${item.currency}</span></div>`;
        }
        
        if (item.largestCity && item.largestCity !== "") {
            const largestCityText = item.largestCity_cn 
                ? `${item.largestCity_cn} (${item.largestCity})` 
                : item.largestCity;
            infoHTML += `<div class="info-row"><span class="info-label">其他主要城市</span><span class="info-val">${largestCityText}</span></div>`;
        }
        
        document.querySelector('.info-grid').innerHTML = infoHTML;
        
        const wikiInfo = refs.wikiExtraData[item.id.toLowerCase()];
        const wikiContainer = document.getElementById('wiki-info-container');
        const wikiContent = document.getElementById('wiki-info-content');
        
        if (wikiInfo) {
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
            
            if (wikiInfo.capital && wikiInfo.capital !== 'N/A' && wikiInfo.capital !== '') {
                const capitalValue = wikiInfo.capital;
                let coordText = '';
                
                const decimalMatch = capitalValue.match(/([\d\.\-]+);\s*([\d\.\-]+)/);
                if (decimalMatch) {
                    const lat = parseFloat(decimalMatch[1]);
                    const lon = parseFloat(decimalMatch[2]);
                    const latDir = lat >= 0 ? 'N' : 'S';
                    const lonDir = lon >= 0 ? 'E' : 'W';
                    coordText = `${Math.abs(lat).toFixed(4)}°${latDir}, ${Math.abs(lon).toFixed(4)}°${lonDir}`;
                } else {
                    const dmsMatch = capitalValue.match(/(\d+°\d+′[NS])\s+(\d+°\d+′[EW])/);
                    if (dmsMatch) {
                        coordText = `${dmsMatch[1]} ${dmsMatch[2]}`;
                    } else {
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
            
            if (wikiInfo.currency && wikiInfo.currency !== 'N/A' && wikiInfo.currency !== '') {
                wikiHTML += `<div class="info-row"><span class="info-label">货币</span><span class="info-val">${wikiInfo.currency}</span></div>`;
                hasValidData = true;
            }
            
            for (const [key, value] of Object.entries(wikiInfo)) {
                if (key === 'id' || !value || value === 'N/A' || value === '' || value === null) {
                    continue;
                }
                
                if (key === 'capital' || key === 'area' || key === 'currency') {
                    continue;
                }
                
                const label = fieldLabels[key] || key;
                let displayValue = value;
                
                if (key === 'official_languages') {
                    displayValue = window.separateLanguages ? window.separateLanguages(value) : value;
                } else if (key === 'largest_city') {
                    displayValue = window.separateCities ? window.separateCities(value) : value;
                } else if (key === 'official_script') {
                    displayValue = window.separateScripts ? window.separateScripts(value) : value;
                }
                
                wikiHTML += `<div class="info-row"><span class="info-label">${label}</span><span class="info-val">${displayValue}</span></div>`;
                hasValidData = true;
            }
            
            if (hasValidData) {
                wikiContainer.style.display = 'block';
                wikiContent.innerHTML = wikiHTML;
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
        document.getElementById('modal-map-btn').onclick = () => window.openMap(item);
    } else {
        img.style.display = 'none';
        plate.style.display = 'inline-block';
        plate.textContent = item.plate;
        document.getElementById('modal-name').textContent = item.name;
        document.getElementById('modal-en-name').textContent = item.type === 'prefecture' ? '地级市' : '县级市';
        document.querySelector('.info-grid').innerHTML = ``;
        document.getElementById('modal-map-btn').style.display = 'none';
    }
    modal.style.display = 'flex';
}

function closeModal(e) { 
    if (e.target.id === 'info-modal' || e.target.classList.contains('btn-close')) {
        document.getElementById('info-modal').style.display = 'none';
        const wikiContent = document.getElementById('wiki-info-content');
        const wikiArrow = document.querySelector('.wiki-arrow');
        if (wikiContent) wikiContent.style.display = 'none';
        if (wikiArrow) wikiArrow.textContent = '▼';
        
        // 重置地图按钮显示状态（世界模式默认显示）
        const mapBtn = document.getElementById('modal-map-btn');
        if (mapBtn) {
            const refs = initCompendiumDataReferences();
            if (refs && refs.currentScope === 'world') {
                mapBtn.style.display = 'block';
            }
        }
    }
}

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

window.openCompendium = openCompendium;
window.filterCompendium = filterCompendium;
window.showDetail = showDetail;
window.closeModal = closeModal;
window.toggleWikiInfo = toggleWikiInfo;

