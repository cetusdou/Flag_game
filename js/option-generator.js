// ============================================================================
// 选项生成模块
// ============================================================================

function generateOptions(currentQ, currentScope, gameMode, sourceDB) {
    let opts = [currentQ];
    let optionTexts = new Set();
    
    if (currentScope === 'world' && gameMode === 'mode_1') {
        // 猜首都模式：只选择有有效中文首都的国家作为干扰项
        let validDB = sourceDB.filter(c => c.capital_cn && c.capital_cn !== "无" && c.capital !== "无");
        
        const currentCapital = currentQ.capital_cn || currentQ.capital;
        const currentLargestCity = currentQ.largestCity_cn || currentQ.largestCity;
        if (currentLargestCity && 
            currentLargestCity !== "" && 
            currentLargestCity !== currentCapital &&
            currentLargestCity !== "无") {
            const largestCityOption = {
                ...currentQ,
                _isLargestCity: true,
                _displayText: currentLargestCity
            };
            opts.push(largestCityOption);
            optionTexts.add(currentLargestCity);
        }
        
        optionTexts.add(currentCapital);
        
        while(opts.length < 4) {
            let r = validDB[Math.floor(Math.random() * validDB.length)];
            if (!opts.includes(r)) {
                const rCapital = r.capital_cn || r.capital;
                if (!optionTexts.has(rCapital) && rCapital !== currentCapital && rCapital !== currentLargestCity) {
                    opts.push(r);
                    optionTexts.add(rCapital);
                }
            }
        }
    } else if (currentScope === 'china') {
        if (gameMode === 'city_network') {
            // 路网挑战模式：随机选择3个其他城市
            while(opts.length < 4) {
                let r = sourceDB[Math.floor(Math.random() * sourceDB.length)];
                if (!opts.includes(r) && r.id !== currentQ.id && !optionTexts.has(r.name)) {
                    opts.push(r);
                    optionTexts.add(r.name);
                }
            }
        } else {
            // 车牌挑战模式
            const provinceCode = currentQ.plate.charAt(0);
            const sameProvinceCities = sourceDB.filter(item => {
                const itemProvinceCode = item.plate.charAt(0);
                return itemProvinceCode === provinceCode && 
                       item.name !== currentQ.name && 
                       !opts.includes(item);
            });
            
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
            
            while (opts.length < 4) {
                let r = sourceDB[Math.floor(Math.random() * sourceDB.length)];
                const rProvinceCode = r.plate.charAt(0);
                if (rProvinceCode !== provinceCode && 
                    r.name !== currentQ.name && 
                    !opts.includes(r) &&
                    !optionTexts.has(r.name)) {
                    opts.push(r);
                    optionTexts.add(r.name);
                }
            }
        }
    } else if (currentScope === 'sports') {
        if (gameMode === 'f1') {
            while(opts.length < 4) {
                let r = sourceDB[Math.floor(Math.random() * sourceDB.length)];
                if (!opts.includes(r) && r.id !== currentQ.id) {
                    opts.push(r);
                }
            }
        } else if (gameMode.startsWith('football_') || gameMode.startsWith('pk_football_')) {
            // 从 gameMode 中提取难度
            let difficulty = 'easy';
            if (gameMode.startsWith('football_')) {
                difficulty = gameMode.split('_')[1];
            } else if (gameMode.startsWith('pk_football_')) {
                difficulty = gameMode.replace('pk_football_', '');
            }
            const topFiveLeagues = ['Premier League', 'La Liga', 'Serie A', 'Bundesliga', 'Ligue 1'];
            const currentLeague = currentQ.league || '';
            
            // 获取同联赛的其他球队
            const sameLeagueClubs = sourceDB.filter(club => 
                club.league === currentLeague && 
                club.id !== currentQ.id && 
                !opts.includes(club)
            );
            
            // 获取五大联赛的其他球队（不包括正确答案的联赛）
            const topFiveLeagueClubs = sourceDB.filter(club => 
                topFiveLeagues.includes(club.league) && 
                club.league !== currentLeague && 
                club.id !== currentQ.id && 
                !opts.includes(club)
            );
            
            let targetCount = 4; // 默认4个选项
            if (difficulty === 'medium' || difficulty === 'hard') {
                targetCount = 5;
            } else if (difficulty === 'hell') {
                targetCount = 6;
            }
            
            // 添加1个同联赛的球队
            if (sameLeagueClubs.length > 0) {
                const sameLeagueClub = sameLeagueClubs[Math.floor(Math.random() * sameLeagueClubs.length)];
                opts.push(sameLeagueClub);
                optionTexts.add(sameLeagueClub.name_zh || sameLeagueClub.name);
            }
            
            // 添加1个五大联赛的球队（如果当前答案不是五大联赛，或者需要更多选项）
            if (topFiveLeagueClubs.length > 0 && (difficulty === 'medium' || difficulty === 'hard' || difficulty === 'hell')) {
                const topFiveClub = topFiveLeagueClubs[Math.floor(Math.random() * topFiveLeagueClubs.length)];
                if (!opts.includes(topFiveClub)) {
                    opts.push(topFiveClub);
                    optionTexts.add(topFiveClub.name_zh || topFiveClub.name);
                }
            }
            
            // 填充剩余选项
            while(opts.length < targetCount) {
                let r = sourceDB[Math.floor(Math.random() * sourceDB.length)];
                if (!opts.includes(r) && r.id !== currentQ.id && !optionTexts.has(r.name_zh || r.name)) {
                    opts.push(r);
                    optionTexts.add(r.name_zh || r.name);
                }
            }
        }
    } else if (currentScope === 'world' && (gameMode === 'mode_3a' || gameMode === 'mode_3b')) {
        const targetCount = gameMode === 'mode_3a' ? 4 : 6;
        const currentRegion = currentQ.region || '';
        const sameRegionCountries = sourceDB.filter(c => 
            c.region === currentRegion && 
            c.id !== currentQ.id && 
            !opts.includes(c)
        );
        
        if (sameRegionCountries.length > 0) {
            const sameRegionCountry = sameRegionCountries[Math.floor(Math.random() * sameRegionCountries.length)];
            opts.push(sameRegionCountry);
            optionTexts.add(sameRegionCountry.name);
        }
        
        while(opts.length < targetCount) {
            let r = sourceDB[Math.floor(Math.random() * sourceDB.length)];
            if (!opts.includes(r) && r.id !== currentQ.id && !optionTexts.has(r.name)) {
                opts.push(r);
                optionTexts.add(r.name);
            }
        }
    } else if (currentScope === 'world' && gameMode === 'airport') {
        // 猜机场模式：随机选择3个其他机场
        optionTexts.add(currentQ.name);
        while(opts.length < 4) {
            let r = sourceDB[Math.floor(Math.random() * sourceDB.length)];
            if (!opts.includes(r) && r.code !== currentQ.code && !optionTexts.has(r.name)) {
                opts.push(r);
                optionTexts.add(r.name);
            }
        }
    } else if (currentScope === 'pokemon') {
        // 宝可梦模式：随机选择3个其他宝可梦，使用name_cn作为显示文本
        const currentNameCn = currentQ.name_cn || currentQ.name;
        optionTexts.add(currentNameCn);
        while(opts.length < 4) {
            let r = sourceDB[Math.floor(Math.random() * sourceDB.length)];
            const rNameCn = r.name_cn || r.name;
            if (!opts.includes(r) && r.id !== currentQ.id && !optionTexts.has(rNameCn)) {
                opts.push(r);
                optionTexts.add(rNameCn);
            }
        }
    } else {
        while(opts.length < 4) {
            let r = sourceDB[Math.floor(Math.random() * sourceDB.length)];
            if (!opts.includes(r)) opts.push(r);
        }
    }
    
    return opts.sort(() => Math.random() - 0.5);
}

function getOptionDisplayText(opt, currentScope, gameMode) {
    if (currentScope === 'world' && gameMode === 'airport') {
        return opt.name;
    }
    if (currentScope === 'world') {
        if (gameMode === 'mode_1') {
            if (opt._isLargestCity && opt._displayText) {
                return opt._displayText;
            }
            return opt.capital_cn || opt.capital;
        }
        return opt.name;
    } else if (currentScope === 'china') {
        return opt.name;
    } else if (currentScope === 'sports') {
        if (gameMode && (gameMode.startsWith('football_') || gameMode.startsWith('pk_football_'))) {
            // 足球模式使用中文名
            return opt.name_zh || opt.name;
        }
        return opt.name;
    } else if (currentScope === 'pokemon') {
        // 宝可梦模式使用中文名
        return opt.name_cn || opt.name;
    }
    return opt.name;
}

window.generateOptions = generateOptions;
window.getOptionDisplayText = getOptionDisplayText;

