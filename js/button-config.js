// ============================================================================
// 按钮配置模块 - 集中管理所有按钮的样式、图片、图标等配置
// ============================================================================

/**
 * 基础卡片样式配置
 * 用于生成基础样式类的背景和阴影
 */
const BASE_CARD_STYLES = {
    // 基础蓝色 - 简洁风格
    'card-blue': {
        background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
        boxShadow: '0 4px 12px rgba(79, 172, 254, 0.5), 0 2px 6px rgba(0, 242, 254, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.25), inset 0 -1px 0 rgba(0, 0, 0, 0.2)'
    },
    // 每日挑战专用 - 深蓝色渐变，更丰富的层次
    'card-daily-blue': {
        background: 'linear-gradient(to bottom, rgba(33, 150, 243, 0.95) 0%, rgba(25, 118, 210, 0.9) 30%, rgba(21, 102, 182, 0.85) 50%, rgba(25, 118, 210, 0.75) 70%, rgba(33, 150, 243, 0.65) 100%), linear-gradient(135deg, rgba(33, 150, 243, 0.3) 0%, rgba(25, 118, 210, 0.2) 50%, rgba(13, 71, 161, 0.15) 100%)',
        boxShadow: '0 4px 12px rgba(25, 118, 210, 0.5), 0 2px 6px rgba(13, 71, 161, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.25), inset 0 -1px 0 rgba(0, 0, 0, 0.2)'
    },
    // 基础紫色 - 简洁风格
    'card-purple': {
        background: 'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)',
        boxShadow: '0 4px 12px rgba(161, 140, 209, 0.5), 0 2px 6px rgba(251, 194, 235, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.25), inset 0 -1px 0 rgba(0, 0, 0, 0.2)'
    },
    // 形状挑战专用 - 深紫色渐变，更丰富的层次
    'card-shape-purple': {
        background: 'linear-gradient(to bottom, rgba(156, 39, 176, 0.95) 0%, rgba(142, 36, 170, 0.92) 20%, rgba(123, 31, 162, 0.88) 40%, rgba(142, 36, 170, 0.82) 60%, rgba(156, 39, 176, 0.75) 80%, rgba(171, 71, 188, 0.68) 100%), linear-gradient(135deg, rgba(156, 39, 176, 0.25) 0%, rgba(171, 71, 188, 0.18) 50%, rgba(186, 104, 200, 0.12) 100%)',
        boxShadow: '0 4px 12px rgba(156, 39, 176, 0.5), 0 2px 6px rgba(123, 31, 162, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.25), inset 0 -1px 0 rgba(0, 0, 0, 0.2)'
    },
    // 基础橙色 - 简洁风格
    'card-orange': {
        background: 'linear-gradient(135deg, #f6d365 0%, #fda085 100%)',
        boxShadow: '0 4px 12px rgba(246, 211, 101, 0.5), 0 2px 6px rgba(253, 160, 133, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.25), inset 0 -1px 0 rgba(0, 0, 0, 0.2)'
    },
    // 极速冲刺专用 - 橙红色渐变，更动感
    'card-sprint-orange': {
        background: 'linear-gradient(to bottom, rgba(255, 87, 34, 0.95) 0%, rgba(255, 111, 66, 0.92) 20%, rgba(255, 152, 0, 0.88) 40%, rgba(255, 167, 38, 0.82) 60%, rgba(255, 183, 77, 0.75) 80%, rgba(255, 193, 107, 0.68) 100%), linear-gradient(135deg, rgba(255, 87, 34, 0.25) 0%, rgba(255, 152, 0, 0.18) 50%, rgba(255, 183, 77, 0.12) 100%)',
        boxShadow: '0 4px 12px rgba(255, 87, 34, 0.5), 0 2px 6px rgba(255, 111, 66, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.25), inset 0 -1px 0 rgba(0, 0, 0, 0.2)'
    },
    // 基础绿色 - 简洁风格
    'card-green': {
        background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
        boxShadow: '0 4px 12px rgba(67, 233, 123, 0.5), 0 2px 6px rgba(56, 249, 215, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.25), inset 0 -1px 0 rgba(0, 0, 0, 0.2)'
    },
    // 足球俱乐部专用 - 深绿色渐变，更运动感
    'card-football-green': {
        background: 'linear-gradient(to bottom, rgba(56, 142, 60, 0.9) 0%, rgba(56, 142, 60, 0.85) 45%, rgba(67, 160, 71, 0.7) 50%, rgba(76, 175, 80, 0.6) 100%), linear-gradient(135deg, rgba(67, 160, 71, 0.4), rgba(56, 142, 60, 0.3))',
        boxShadow: '0 2px 8px rgba(67, 160, 71, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2), inset 0 -1px 0 rgba(0, 0, 0, 0.2)'
    },
    // 全图鉴专用 - 青绿色渐变
    'card-compendium-green': {
        background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
        boxShadow: '0 2px 8px rgba(56, 249, 215, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.25), inset 0 -1px 0 rgba(0, 0, 0, 0.2)'
    },
    // 基础红色
    'card-red': {
        background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%)',
        boxShadow: '0 2px 8px rgba(238, 90, 111, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.25), inset 0 -1px 0 rgba(0, 0, 0, 0.2)'
    },
    // 基础黄色
    'card-yellow': {
        background: 'linear-gradient(135deg, #ffd54f 0%, #ffb74d 100%)',
        boxShadow: '0 4px 12px rgba(255, 213, 79, 0.5), 0 2px 6px rgba(255, 183, 77, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.25), inset 0 -1px 0 rgba(0, 0, 0, 0.2)'
    },
    // 路网挑战专用 - 金黄色渐变
    'card-network-yellow': {
        background: 'linear-gradient(to bottom, rgba(255, 193, 7, 0.95) 0%, rgba(255, 183, 0, 0.92) 20%, rgba(255, 152, 0, 0.88) 40%, rgba(255, 183, 0, 0.82) 60%, rgba(255, 193, 7, 0.75) 80%, rgba(255, 202, 40, 0.68) 100%), linear-gradient(135deg, rgba(255, 193, 7, 0.25) 0%, rgba(255, 202, 40, 0.18) 50%, rgba(255, 213, 79, 0.12) 100%)',
        boxShadow: '0 4px 12px rgba(255, 193, 7, 0.5), 0 2px 6px rgba(255, 152, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.25), inset 0 -1px 0 rgba(0, 0, 0, 0.2)'
    },
    // F1赛道专用 - 深灰紫色渐变
    'card-grey': {
        background: 'linear-gradient(to bottom, rgba(101, 80, 154, 0.95) 0%, rgba(89, 70, 138, 0.9) 30%, rgba(97, 77, 143, 0.85) 50%, rgba(120, 95, 170, 0.75) 70%, rgba(140, 115, 190, 0.65) 100%), linear-gradient(135deg, rgba(101, 80, 154, 0.3) 0%, rgba(120, 95, 170, 0.2) 50%, rgba(140, 115, 190, 0.15) 100%)',
        boxShadow: '0 2px 8px rgba(89, 70, 138, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.25), inset 0 -1px 0 rgba(0, 0, 0, 0.2)'
    }
};

/**
 * 按钮元数据配置
 * 用于简化 enableBtn 调用，统一管理按钮的显示文本和图标
 */
const BUTTON_METADATA = {
    'world': {
        'mode_1': { icon: '📅', title: '每日挑战', desc: '看国旗，猜首都', count: '20' },
        'mode_2': { icon: '🧩', title: '形状挑战', desc: '看剪影，猜国家', count: '30' },
        'sprint_menu': { icon: '⚡', title: '极速冲刺', desc: '选择难度开始挑战', count: '--' },
        'all': { icon: '♾️', title: '全图鉴', desc: '不重复，死磕到底', count: 'All' }
    },
    'china': {
        'mode_1': { icon: '🚗', title: '车牌挑战', desc: '看车牌，猜地名', count: '50' },
        'city_network': { icon: '🗺️', title: '路网挑战', desc: '看路网，猜城市', count: '10' },
        'china_daily_network': { icon: '📅', title: '每日挑战', desc: '部分路网，填空题', count: '3' }
    },
    'sports': {
        'f1': { icon: '🏎️', title: 'F1赛道挑战', desc: '看赛道图，猜赛道名', count: '20' },
        'football_menu': { icon: '⚽', title: '足球俱乐部挑战', desc: '选择难度开始挑战', count: '--' },
        'football_easy': { icon: '⚽', title: '简单难度', desc: '可见范围较大', count: '20' },
        'football_medium': { icon: '⚽', title: '中等难度', desc: '可见范围适中', count: '20' },
        'football_hard': { icon: '⚽', title: '困难难度', desc: '可见范围较小', count: '20' },
        'football_hell': { icon: '🔥', title: '地狱难度', desc: '可见范围极小', count: '20' }
    },
    'sprint': {
        'mode_3a': { icon: '⚡', title: '简单难度', desc: '30秒挑战', count: '30' },
        'mode_3b': { icon: '⚡', title: '困难难度', desc: '15秒挑战', count: '15' }
    }
};

/**
 * 获取按钮元数据
 * @param {string} modeKey - 模式键
 * @param {string} scope - 当前范围（world/china/sports/sprint）
 * @returns {object} 按钮元数据对象 {icon, title, desc, count}
 */
function getButtonMetadata(modeKey, scope) {
    return BUTTON_METADATA[scope]?.[modeKey] || {
        icon: '📅',
        title: '加载中',
        desc: '...',
        count: '--'
    };
}

/**
 * 按钮配置映射表
 * 
 * 配置结构说明：
 * - style: CSS基础样式类名（如 'card-blue', 'card-purple'）
 * - background: 背景渐变配置（可选，覆盖CSS中的background）
 * - boxShadow: 阴影配置（可选，覆盖CSS中的box-shadow）
 * - layout: 布局配置
 *   - display: 'flex' | 'block' 等
 *   - flexDirection: 'column' | 'row'
 *   - justifyContent: 'flex-start' | 'center' | 'space-between'
 *   - padding: 内边距（如 '15px'）
 *   - minHeight: 最小高度（如 '130px'）
 * - textStyle: 文字样式配置
 *   - color: 文字颜色（如 '#ffffff'）
 *   - textShadow: 文字阴影（如 '0 2px 8px rgba(0, 0, 0, 0.5)'）
 * - hideIcon: 是否隐藏图标（默认true）
 * - hideTag: 是否隐藏标签（默认false）
 * - image: 图片叠加配置
 *   - src: 图片路径
 *   - alt: 图片alt文本
 *   - classes: CSS类名数组（用于应用基础样式）
 *   - condition: 条件函数，决定是否显示图片
 *   - position: 图片位置配置
 *   - overlayGradient: 渐变蒙版叠加层配置
 *   - textPosition: 文字定位配置
 * - toggle: 是否显示拨动开关（默认false）
 */
const BUTTON_CONFIGS = {
    // 世界模式
    'mode_1': {
        style: 'card-daily-blue',
        layout: {
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-start',
            padding: '15px',
            minHeight: '130px'
        },
        textStyle: {
            color: '#ffffff',
            textShadow: '0 2px 8px rgba(0, 0, 0, 0.5)'
        },
        hideIcon: true,
        hideTag: true,
        image: {
            src: 'assets/libs/taili.png',
            alt: 'Daily Challenge',
            classes: ['card-daily', 'daily-card-overlay'],
            condition: (scope) => scope === 'world',
            position: {
                right: '0',
                top: '50%',
                transform: 'translateY(-30%) translateX(20%)',
                width: '80%',
                height: '120%',
                objectFit: 'cover',
                objectPosition: 'left center',
                maskGradient: {
                    direction: 'to right',
                    stops: [
                        { offset: '0%', color: 'transparent' },
                        { offset: '30%', color: 'rgba(0,0,0,0.3)' },
                        { offset: '60%', color: 'rgba(0,0,0,0.7)' },
                        { offset: '100%', color: 'rgba(0,0,0,1)' }
                    ]
                }
            },
            overlayGradient: {
                position: {
                    right: '0',
                    top: '0',
                    width: '50%',
                    height: '100%'
                },
                gradient: {
                    direction: 'to right',
                    stops: [
                        { offset: '0%', color: 'transparent' },
                        { offset: '20%', color: 'rgba(25, 118, 210, 0.2)' },
                        { offset: '50%', color: 'rgba(25, 118, 210, 0.4)' },
                        { offset: '80%', color: 'rgba(33, 150, 243, 0.6)' },
                        { offset: '100%', color: 'rgba(33, 150, 243, 0.8)' }
                    ]
                },
                mixBlendMode: 'overlay'
            },
            textPosition: {
                position: 'absolute',
                top: '15px',
                left: '15px',
                zIndex: 2
            }
        }
    },
    'mode_2': {
        style: 'card-shape-purple',
        layout: {
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-start',
            padding: '15px',
            minHeight: '130px'
        },
        textStyle: {
            color: '#ffffff',
            textShadow: '0 2px 8px rgba(0, 0, 0, 0.5)'
        },
        hideIcon: true,
        hideTag: true,
        image: {
            src: 'assets/libs/VCG211437531476.jpg',
            alt: 'Shape Challenge',
            classes: ['card-shape', 'shape-card-overlay'],
            position: {
                bottom: '0',
                left: '0',
                width: '125%',
                height: '130%',
                transform: 'translateY(40%) translateX(0%)',
                objectFit: 'cover',
                objectPosition: 'center top',
                maskGradient: {
                    direction: 'to top',
                    stops: [
                        { offset: '0%', color: 'rgba(0,0,0,1)' },
                        { offset: '15%', color: 'rgba(0,0,0,0.95)' },
                        { offset: '30%', color: 'rgba(0,0,0,0.85)' },
                        { offset: '50%', color: 'rgba(0,0,0,0.65)' },
                        { offset: '70%', color: 'rgba(0,0,0,0.4)' },
                        { offset: '85%', color: 'rgba(0,0,0,0.15)' },
                        { offset: '100%', color: 'transparent' }
                    ]
                }
            },
            overlayGradient: {
                position: {
                    bottom: '0',
                    left: '0',
                    width: '100%',
                    height: '90%'
                },
                gradient: {
                    direction: 'to top',
                    stops: [
                        { offset: '0%', color: 'rgba(156, 39, 176, 0.55)' },
                        { offset: '20%', color: 'rgba(156, 39, 176, 0.45)' },
                        { offset: '40%', color: 'rgba(142, 36, 170, 0.35)' },
                        { offset: '60%', color: 'rgba(171, 71, 188, 0.25)' },
                        { offset: '80%', color: 'rgba(186, 104, 200, 0.15)' },
                        { offset: '100%', color: 'transparent' }
                    ]
                },
                mixBlendMode: 'overlay'
            },
            textPosition: {
                position: 'absolute',
                top: '15px',
                left: '15px',
                zIndex: 2
            }
        }
    },
    'sprint_menu': {
        style: 'card-sprint-orange',
        layout: {
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-start',
            padding: '15px',
            minHeight: '130px'
        },
        textStyle: {
            color: '#ffffff',
            textShadow: '0 2px 8px rgba(0, 0, 0, 0.5)'
        },
        hideIcon: true,
        hideTag: true,
        image: {
            src: 'assets/libs/clock.png',
            alt: 'Sprint Challenge',
            classes: ['card-sprint', 'sprint-card-overlay'],
            position: {
                bottom: '0',
                left: '0',
                width: '100%',
                height: '90%',
                transform: 'translateY(-0%)',
                objectFit: 'cover',
                objectPosition: 'center top',
                maskGradient: {
                    direction: 'to top',
                    stops: [
                        { offset: '0%', color: 'rgba(0,0,0,1)' },
                        { offset: '15%', color: 'rgba(0,0,0,0.95)' },
                        { offset: '30%', color: 'rgba(0,0,0,0.85)' },
                        { offset: '50%', color: 'rgba(0,0,0,0.65)' },
                        { offset: '70%', color: 'rgba(0,0,0,0.4)' },
                        { offset: '85%', color: 'rgba(0,0,0,0.15)' },
                        { offset: '100%', color: 'transparent' }
                    ]
                }
            },
            overlayGradient: {
                position: {
                    bottom: '0',
                    left: '0',
                    width: '100%',
                    height: '90%'
                },
                gradient: {
                    direction: 'to top',
                    stops: [
                        { offset: '0%', color: 'rgba(255, 87, 34, 0.55)' },
                        { offset: '20%', color: 'rgba(255, 87, 34, 0.45)' },
                        { offset: '40%', color: 'rgba(255, 111, 66, 0.35)' },
                        { offset: '60%', color: 'rgba(255, 152, 0, 0.25)' },
                        { offset: '80%', color: 'rgba(255, 167, 38, 0.15)' },
                        { offset: '100%', color: 'transparent' }
                    ]
                },
                mixBlendMode: 'overlay'
            },
            textPosition: {
                position: 'absolute',
                top: '15px',
                left: '15px',
                zIndex: 2
            }
        }
    },
    'all': {
        style: 'card-compendium-green',
        layout: {
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-start',
            padding: '15px',
            minHeight: '130px'
        },
        textStyle: {
            color: '#ffffff',
            textShadow: '0 2px 8px rgba(0, 0, 0, 0.5)'
        },
        hideIcon: true,
        hideTag: true,
        image: {
            src: 'assets/libs/VCG211280932652.jpg',
            alt: 'All Compendium',
            classes: ['card-all-compendium', 'all-compendium-card-overlay'],
            position: {
                bottom: '0',
                left: '0',
                width: '100%',
                height: '90%',
                transform: 'translateY(40%) translateX(0%)',
                objectFit: 'cover',
                objectPosition: 'center top',
                maskGradient: {
                    direction: 'to top',
                    stops: [
                        { offset: '0%', color: 'rgba(0,0,0,1)' },
                        { offset: '15%', color: 'rgba(0,0,0,0.95)' },
                        { offset: '30%', color: 'rgba(0,0,0,0.85)' },
                        { offset: '50%', color: 'rgba(0,0,0,0.65)' },
                        { offset: '70%', color: 'rgba(0,0,0,0.4)' },
                        { offset: '85%', color: 'rgba(0,0,0,0.15)' },
                        { offset: '100%', color: 'transparent' }
                    ]
                }
            },
            overlayGradient: {
                position: {
                    bottom: '0',
                    left: '0',
                    width: '100%',
                    height: '90%'
                },
                gradient: {
                    direction: 'to top',
                    stops: [
                        { offset: '0%', color: 'rgba(67, 233, 123, 0.55)' },
                        { offset: '20%', color: 'rgba(67, 233, 123, 0.45)' },
                        { offset: '40%', color: 'rgba(56, 249, 215, 0.35)' },
                        { offset: '60%', color: 'rgba(56, 249, 215, 0.25)' },
                        { offset: '80%', color: 'rgba(76, 255, 225, 0.15)' },
                        { offset: '100%', color: 'transparent' }
                    ]
                },
                mixBlendMode: 'overlay'
            },
            textPosition: {
                position: 'absolute',
                top: '15px',
                left: '15px',
                zIndex: 2
            }
        }
    },
    
    // 中国模式
    'mode_1_china': {
        style: 'card-blue'
    },
    'city_network': {
        style: 'card-network-yellow',
        layout: {
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-start',
            padding: '15px',
            minHeight: '130px'
        },
        textStyle: {
            color: '#ffffff',
            textShadow: '0 2px 8px rgba(0, 0, 0, 0.5)'
        },
        hideIcon: true,
        hideTag: true,
        image: {
            src: 'assets/libs/VCG211331711418.jpg',
            alt: 'City Network Challenge',
            classes: ['card-city-network', 'city-network-card-overlay'],
            position: {
                bottom: '0',
                left: '0',
                width: '125%',
                height: '130%',
                transform: 'translateY(40%) translateX(0%)',
                objectFit: 'cover',
                objectPosition: 'center top',
                maskGradient: {
                    direction: 'to top',
                    stops: [
                        { offset: '0%', color: 'rgba(0,0,0,1)' },
                        { offset: '15%', color: 'rgba(0,0,0,0.95)' },
                        { offset: '30%', color: 'rgba(0,0,0,0.85)' },
                        { offset: '50%', color: 'rgba(0,0,0,0.65)' },
                        { offset: '70%', color: 'rgba(0,0,0,0.4)' },
                        { offset: '85%', color: 'rgba(0,0,0,0.15)' },
                        { offset: '100%', color: 'transparent' }
                    ]
                }
            },
            overlayGradient: {
                position: {
                    bottom: '0',
                    left: '0',
                    width: '100%',
                    height: '90%'
                },
                gradient: {
                    direction: 'to top',
                    stops: [
                        { offset: '0%', color: 'rgba(255, 193, 7, 0.55)' },
                        { offset: '20%', color: 'rgba(255, 193, 7, 0.45)' },
                        { offset: '40%', color: 'rgba(255, 183, 0, 0.35)' },
                        { offset: '60%', color: 'rgba(255, 202, 40, 0.25)' },
                        { offset: '80%', color: 'rgba(255, 213, 79, 0.15)' },
                        { offset: '100%', color: 'transparent' }
                    ]
                },
                mixBlendMode: 'overlay'
            },
            textPosition: {
                position: 'absolute',
                top: '15px',
                left: '15px',
                zIndex: 2
            }
        },
        toggle: true
    },
    'china_daily_network': {
        style: 'card-orange'
    },
    
    // 体育模式
    'f1': {
        style: 'card-grey',
        layout: {
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-start',
            padding: '15px',
            minHeight: '130px'
        },
        textStyle: {
            color: '#ffffff',
            textShadow: '0 2px 8px rgba(0, 0, 0, 0.5)'
        },
        hideIcon: true,
        hideTag: true,
        image: {
            src: 'assets/libs/Brazil.avif',
            alt: 'F1 Track',
            classes: ['card-f1', 'f1-card-overlay'],
            position: {
                bottom: '0',
                left: '0',
                width: '100%',
                height: '90%',
                transform: 'translateY(20%)',
                objectFit: 'cover',
                objectPosition: 'center top',
                maskGradient: {
                    direction: 'to top',
                    stops: [
                        { offset: '0%', color: 'rgba(0,0,0,1)' },
                        { offset: '15%', color: 'rgba(0,0,0,0.95)' },
                        { offset: '30%', color: 'rgba(0,0,0,0.85)' },
                        { offset: '50%', color: 'rgba(0,0,0,0.65)' },
                        { offset: '70%', color: 'rgba(0,0,0,0.4)' },
                        { offset: '85%', color: 'rgba(0,0,0,0.15)' },
                        { offset: '100%', color: 'transparent' }
                    ]
                }
            },
            overlayGradient: {
                position: {
                    bottom: '0',
                    left: '0',
                    width: '100%',
                    height: '90%'
                },
                gradient: {
                    direction: 'to top',
                    stops: [
                        { offset: '0%', color: 'rgba(101, 80, 154, 0.55)' },
                        { offset: '20%', color: 'rgba(101, 80, 154, 0.45)' },
                        { offset: '40%', color: 'rgba(120, 95, 170, 0.35)' },
                        { offset: '60%', color: 'rgba(140, 115, 190, 0.25)' },
                        { offset: '80%', color: 'rgba(160, 135, 210, 0.15)' },
                        { offset: '100%', color: 'transparent' }
                    ]
                },
                mixBlendMode: 'overlay'
            },
            textPosition: {
                position: 'absolute',
                top: '15px',
                left: '15px',
                zIndex: 2
            }
        }
    },
    'football_menu': {
        style: 'card-football-green',
        layout: {
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-start',
            padding: '15px',
            minHeight: '130px'
        },
        textStyle: {
            color: '#ffffff',
            textShadow: '0 2px 8px rgba(0, 0, 0, 0.5)'
        },
        hideIcon: true,
        hideTag: true,
        image: {
            src: 'assets/libs/Football.jpeg',
            alt: 'Football',
            classes: ['card-football', 'football-card-overlay'],
            position: {
                bottom: '0',
                left: '0',
                width: '100%',
                height: '90%',
                objectFit: 'cover',
                objectPosition: 'center top',
                maskGradient: {
                    direction: 'to top',
                    stops: [
                        { offset: '0%', color: 'rgb(85, 62, 128)' },
                        { offset: '30%', color: 'rgb(85, 62, 128)' },
                        { offset: '60%', color: 'rgb(85, 62, 128)' },
                        { offset: '100%', color: 'transparent' }
                    ]
                }
            },
            overlayGradient: {
                position: {
                    bottom: '0',
                    left: '0',
                    width: '100%',
                    height: '90%'
                },
                gradient: {
                    direction: 'to top',
                    stops: [
                        { offset: '0%', color: 'rgba(67, 160, 71, 0.4)' },
                        { offset: '30%', color: 'rgba(67, 160, 71, 0.3)' },
                        { offset: '60%', color: 'rgba(67, 160, 71, 0.15)' },
                        { offset: '100%', color: 'transparent' }
                    ]
                }
            },
            textPosition: {
                position: 'absolute',
                top: '15px',
                left: '15px',
                zIndex: 2
            }
        }
    },
    
    // 足球难度
    'football_easy': {
        style: 'card-orange'
    },
    'football_medium': {
        style: 'card-green'
    },
    'football_hard': {
        style: 'card-blue'
    },
    'football_hell': {
        style: 'card-red'
    },
    
    // 极速冲刺难度
    'mode_3a': {
        style: 'card-orange'
    },
    'mode_3b': {
        style: 'card-orange'
    }
};

/**
 * 获取按钮配置
 * @param {string} modeKey - 模式键
 * @param {string} scope - 当前范围（world/china/sports）
 * @returns {object} 按钮配置对象
 */
function getButtonConfig(modeKey, scope) {
    // 特殊处理：中国模式下的 mode_1 使用不同配置
    if (modeKey === 'mode_1' && scope === 'china') {
        return BUTTON_CONFIGS['mode_1_china'] || {};
    }
    
    return BUTTON_CONFIGS[modeKey] || {
        style: 'card-blue'
    };
}

/**
 * 获取基础卡片样式
 * @param {string} styleName - 样式名称（如 'card-blue'）
 * @returns {object} 包含background和boxShadow的对象
 */
function getBaseCardStyle(styleName) {
    return BASE_CARD_STYLES[styleName] || {};
}

window.BUTTON_CONFIGS = BUTTON_CONFIGS;
window.BASE_CARD_STYLES = BASE_CARD_STYLES;
window.BUTTON_METADATA = BUTTON_METADATA;
window.getButtonConfig = getButtonConfig;
window.getBaseCardStyle = getBaseCardStyle;
window.getButtonMetadata = getButtonMetadata;
