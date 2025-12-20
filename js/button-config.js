// ============================================================================
// 按钮配置模块 - 集中管理所有按钮的样式、图片、图标等配置
// ============================================================================

/**
 * 基础卡片样式配置
 * 注意：样式已迁移到 components.css 中作为 CSS 类定义
 * 这里保留此注释作为参考，实际样式在 CSS 中定义
 * 
 * 可用的样式类（在 components.css 中定义）：
 * 
 * 蓝色系：card-blue, card-daily-blue, card-blue-light, card-blue-dark, card-blue-cyan
 * 紫色系：card-purple, card-shape-purple, card-purple-light, card-purple-dark, card-purple-pink
 * 绿色系：card-green, card-football-green, card-compendium-green, card-green-light, card-green-dark, card-green-teal
 * 橙色系：card-orange, card-sprint-orange, card-orange-light, card-orange-dark, card-orange-red
 * 红色系：card-red, card-red-light, card-red-dark, card-red-pink
 * 黄色系：card-yellow, card-network-yellow, card-yellow-light, card-yellow-dark, card-yellow-amber
 * 其他：card-grey, card-pink, card-cyan, card-indigo, card-teal, card-brown, card-lime
 */

/**
 * 按钮元数据配置
 * 用于简化 enableBtn 调用，统一管理按钮的显示文本和图标
 */
const BUTTON_METADATA = {
    'world': {
        'mode_1': { icon: '📅', title: '每日挑战', desc: '看国旗，猜首都', count: '20' },
        'flag_guess': { icon: '🏳️', title: '猜国旗', desc: '选择模式开始挑战', count: '--' },
        'mode_2': { icon: '🧩', title: '形状挑战', desc: '看剪影，猜国家', count: '30' },
        'airport': { icon: '✈️', title: '猜机场', desc: '看机场图，猜名称', count: '20' },
        'airport': { icon: '✈️', title: '猜机场', desc: '看机场图，猜名称', count: '20' },
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
    },
    'pokemon': {
        'pokemon': { icon: '⚡', title: '猜宝可梦', desc: '看剪影，猜宝可梦', count: '20' }
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
        },
        sprintDifficulty: true
    },
    'flag_guess': {
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
            src: 'assets/libs/VCG211280932652.jpg',
            alt: 'Flag Guess',
            classes: ['card-flag-guess', 'flag-guess-card-overlay'],
            position: {
                bottom: '0',
                left: '0',
                width: '100%',
                height: '100%',
                transform: 'translateY(35%)',
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
        },
        flagGuessMode: true
    },
    'airport': {
        style: 'card-blue-cyan',
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
            src: 'assets/libs/VCG211345194167.jpg',
            alt: 'Airport',
            classes: ['card-airport', 'airport-card-overlay'],
            position: {
                bottom: '0',
                left: '0',
                width: '100%',
                height: '100%',
                transform: 'translateY(35%) translateX(0%)',
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
                        { offset: '0%', color: 'rgba(0, 188, 212, 0.55)' },
                        { offset: '20%', color: 'rgba(0, 188, 212, 0.45)' },
                        { offset: '40%', color: 'rgba(0, 172, 193, 0.35)' },
                        { offset: '60%', color: 'rgba(0, 151, 167, 0.25)' },
                        { offset: '80%', color: 'rgba(0, 131, 143, 0.15)' },
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
        style: 'card-purple',
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
            src: 'assets/libs/VCG41N1786112896.jpg',
            alt: 'License Plate Challenge',
            classes: ['card-license-plate', 'license-plate-card-overlay'],
            condition: (scope) => scope === 'china',
            position: {
                right: '0',
                top: '0%',
                transform: 'translateY(0%) translateX(20%)',
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
                        { offset: '20%', color: 'rgba(79, 172, 254, 0.2)' },
                        { offset: '50%', color: 'rgba(79, 172, 254, 0.4)' },
                        { offset: '80%', color: 'rgba(0, 242, 254, 0.6)' },
                        { offset: '100%', color: 'rgba(0, 242, 254, 0.8)' }
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
            src: 'assets/libs/taili2.png',
            alt: 'Daily Challenge',
            classes: ['card-daily', 'daily-card-overlay'],
            condition: (scope) => scope === 'china',
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
                        { offset: '20%', color: 'rgba(33, 150, 243, 0.2)' },
                        { offset: '50%', color: 'rgba(25, 118, 210, 0.4)' },
                        { offset: '80%', color: 'rgba(13, 71, 161, 0.6)' },
                        { offset: '100%', color: 'rgba(13, 71, 161, 0.8)' }
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
        },
        footballDifficulty: true
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
    },
    
    // 宝可梦模式
    'pokemon': {
        style: 'card-orange',
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
            src: 'assets/libs/R.jpg',
            alt: 'Pokemon',
            classes: ['card-pokemon', 'pokemon-card-overlay'],
            position: {
                bottom: '0',
                left: '0',
                width: '100%',
                height: '100%',
                transform: 'translateY(35%) translateX(0%)',
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
                        { offset: '0%', color: 'rgba(255, 152, 0, 0.55)' },
                        { offset: '30%', color: 'rgba(255, 193, 7, 0.4)' },
                        { offset: '60%', color: 'rgba(255, 235, 59, 0.25)' },
                        { offset: '100%', color: 'transparent' }
                    ]
                },
                mixBlendMode: 'multiply'
            },
            textPosition: {
                position: 'absolute',
                top: '15px',
                left: '15px',
                zIndex: 2,
                width: 'calc(100% - 30px)',
                maxWidth: 'calc(100% - 30px)'
            }
        }
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
 * 获取基础卡片样式（已废弃）
 * 样式已迁移到 components.css 中，此函数保留仅为兼容性
 * @param {string} styleName - 样式名称（如 'card-blue'）
 * @returns {object} 空对象（样式现在通过CSS类应用）
 * @deprecated 使用 CSS 类而不是此函数
 */
function getBaseCardStyle(styleName) {
    // 样式已迁移到 CSS，返回空对象
    return {};
}

window.BUTTON_CONFIGS = BUTTON_CONFIGS;
window.BUTTON_METADATA = BUTTON_METADATA;
window.getButtonConfig = getButtonConfig;
window.getBaseCardStyle = getBaseCardStyle; // 保留为兼容性
window.getButtonMetadata = getButtonMetadata;
