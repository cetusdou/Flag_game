// 数据管理模块
import { translateCapital } from '../utils/translations.js';

// 全局数据存储
let dbWorld = [];
let dbPlates = [];
let worldNameMap = {};

/**
 * 初始化游戏数据
 */
export async function initData() {
    try {
        const [res1, res2, res3] = await Promise.all([
            fetch('./data/countries.json'),
            fetch('./data/china_plates.json'),
            fetch('./data/world_name_map.json')
        ]);
        
        if (res1.ok) {
            dbWorld = await res1.json();
            // 为每个国家添加中文首都字段
            dbWorld.forEach(country => {
                country.capital_cn = translateCapital(country.capital);
            });
        }
        if (res2.ok) dbPlates = await res2.json();
        if (res3.ok) worldNameMap = await res3.json();
        
        return { dbWorld, dbPlates, worldNameMap };
    } catch (e) {
        throw new Error("数据加载错误: " + e.message);
    }
}

/**
 * 获取世界国家数据
 */
export function getWorldData() {
    return dbWorld;
}

/**
 * 获取中国车牌数据
 */
export function getPlatesData() {
    return dbPlates;
}

/**
 * 获取世界名称映射
 */
export function getWorldNameMap() {
    return worldNameMap;
}

