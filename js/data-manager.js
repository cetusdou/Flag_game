// ============================================================================
// 数据管理模块 - 负责数据加载和存储
// ============================================================================

// 数据存储（全局变量，通过 window 暴露）
window.GameData = {
    dbWorld: [],
    dbPlates: [],
    dbF1Tracks: [],
    dbFootballClubs: [],
    worldNameMap: {},
    wikiExtraData: {}
};

// 初始化数据加载
async function initGameData() {
    try {
        const [res1, res2, res3, res4, res5, res6] = await Promise.all([
            fetch('./data/countries.json'),
            fetch('./data/china_plates.json'),
            fetch('./data/world_name_map.json'),
            fetch('./data/countries_wiki_extra.json'),
            fetch('./data/f1_tracks_final.json'),
            fetch('./data/football_clubs_europe.json')
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
            console.log(`✅ 数据加载完成: 共${window.GameData.dbWorld.length}个国家, ${translatedCount}个有中文翻译, ${sovereignWithCapital}个主权国家有有效首都`);
        }
        if (res2.ok) window.GameData.dbPlates = await res2.json();
        if (res3.ok) window.GameData.worldNameMap = await res3.json();
        if (res4.ok) window.GameData.wikiExtraData = await res4.json();
        if (res5.ok) {
            const f1Data = await res5.json();
            window.GameData.dbF1Tracks = f1Data.circuits || [];
            console.log(`✅ F1赛道数据加载完成: 共${window.GameData.dbF1Tracks.length}条赛道`);
        }
        if (res6.ok) {
            window.GameData.dbFootballClubs = await res6.json();
            console.log(`✅ 足球俱乐部数据加载完成: 共${window.GameData.dbFootballClubs.length}个俱乐部`);
        }
        
        return true;
    } catch (e) {
        console.error("数据加载错误:", e);
        return false;
    }
}

// 暴露到全局
window.initGameData = initGameData;
