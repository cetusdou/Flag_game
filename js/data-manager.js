// ============================================================================
// 数据管理模块 - 负责数据加载和存储
// ============================================================================

// 数据存储（全局变量，通过 window 暴露）
window.GameData = {
    dbWorld: [],
    dbPlates: [],
    dbF1Tracks: [],
    dbFootballClubs: [],
    dbCityNetworks: [],
    worldNameMap: {},
    wikiExtraData: {}
};

// 初始化数据加载
async function initGameData() {
    try {
        const [res1, res2, res3, res4, res5, res6, res7] = await Promise.all([
            fetch('./data/countries.json'),
            fetch('./data/china_plates.json'),
            fetch('./data/world_name_map.json'),
            fetch('./data/countries_wiki_extra.json'),
            fetch('./data/f1_tracks_final.json'),
            fetch('./data/football_clubs_hardcore.json'),
            fetch('./data/china_city_networks.json')
        ]);
        
        if (res1.ok) {
            window.GameData.dbWorld = await res1.json();
            const translatedCount = window.GameData.dbWorld.filter(c => c.capital_cn && c.capital_cn !== c.capital && c.capital_cn !== "").length;
            const sovereignWithCapital = window.GameData.dbWorld.filter(c => 
                c.sovereign === true && 
                c.capital_cn && 
                c.capital_cn !== "无" && 
                c.capital_cn !== null &&
                c.capital_cn !== "" &&
                c.capital && 
                c.capital !== "无"
            ).length;
        }
        if (res2.ok) window.GameData.dbPlates = await res2.json();
        if (res3.ok) window.GameData.worldNameMap = await res3.json();
        if (res4.ok) window.GameData.wikiExtraData = await res4.json();
        if (res5.ok) {
            const f1Data = await res5.json();
            window.GameData.dbF1Tracks = f1Data.circuits || [];
        }
        if (res6.ok) {
            window.GameData.dbFootballClubs = await res6.json();
        }
        if (res7.ok) {
            window.GameData.dbCityNetworks = await res7.json();
        }
        
        return true;
    } catch (e) {
        return false;
    }
}

// 暴露到全局
window.initGameData = initGameData;
