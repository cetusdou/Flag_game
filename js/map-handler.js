// 地图处理模块
import { getWorldData, getWorldNameMap } from './data-manager.js';

let myChart = null;

/**
 * 初始化ECharts地图
 * @param {string} code - 国家代码（大写）
 */
export function initEChartsMap(code) {
    const dom = document.getElementById("echarts-map-container");
    if (myChart) myChart.dispose();
    myChart = echarts.init(dom);
    
    const dbWorld = getWorldData();
    const worldNameMap = getWorldNameMap();
    
    const option = {
        backgroundColor: '#100C2A',
        tooltip: { 
            trigger: 'item', 
            formatter: function(p){
                const found = dbWorld.find(c => c.id.toUpperCase() === p.name);
                return found ? found.name : p.name;
            }
        },
        geo: {
            map: 'world', 
            roam: true, 
            zoom: 1.2,
            itemStyle: { 
                normal: { areaColor: '#323c48', borderColor: '#111' }, 
                emphasis: { areaColor: '#2a333d' } 
            },
            nameMap: worldNameMap,
            regions: [{ 
                name: code, 
                itemStyle: { areaColor: '#ff4444', opacity: 1 } 
            }]
        }
    };
    myChart.setOption(option);
    window.addEventListener('resize', () => myChart.resize());
}

/**
 * 打开地图
 * @param {Object} item - 国家数据
 */
export function openMap(item) {
    document.getElementById('info-modal').style.display = 'none';
    document.getElementById('map-modal').style.display = 'flex';
    setTimeout(() => { 
        initEChartsMap(item.id.toUpperCase());
    }, 100);
}

/**
 * 关闭地图
 */
export function closeMap() {
    document.getElementById('map-modal').style.display = 'none';
}

