// ============================================================================
// 触摸手势处理模块 - 支持左右滑动快捷操作
// ============================================================================

/**
 * 触摸手势管理器
 */
class TouchGestureManager {
    constructor() {
        this.touchStartX = 0;
        this.touchStartY = 0;
        this.touchEndX = 0;
        this.touchEndY = 0;
        this.minSwipeDistance = 50; // 最小滑动距离（像素）
        this.maxVerticalDistance = 100; // 最大垂直偏移（防止误触）
        this.isEnabled = true;
        
        // 视图导航历史栈
        this.viewHistory = [];
        
        this.init();
    }
    
    /**
     * 初始化触摸事件监听
     */
    init() {
        // 只在触摸设备上启用
        if ('ontouchstart' in window || navigator.maxTouchPoints > 0) {
            document.addEventListener('touchstart', this.handleTouchStart.bind(this), { passive: true });
            document.addEventListener('touchmove', this.handleTouchMove.bind(this), { passive: true });
            document.addEventListener('touchend', this.handleTouchEnd.bind(this), { passive: true });
            
            // 记录视图历史
            this.trackViewChanges();
        }
    }
    
    /**
     * 跟踪视图变化，维护导航历史
     */
    trackViewChanges() {
        // 使用MutationObserver监听容器active类的变化
        const observer = new MutationObserver(() => {
            const activeView = this.getCurrentView();
            if (activeView) {
                // 如果当前视图不在历史栈顶部，则添加到历史栈
                if (this.viewHistory.length === 0 || this.viewHistory[this.viewHistory.length - 1] !== activeView) {
                    this.viewHistory.push(activeView);
                    // 限制历史栈长度，避免内存泄漏
                    if (this.viewHistory.length > 10) {
                        this.viewHistory.shift();
                    }
                }
            }
        });
        
        // 观察所有容器的class变化
        const containers = document.querySelectorAll('.container');
        containers.forEach(container => {
            observer.observe(container, { attributes: true, attributeFilter: ['class'] });
        });
        
        // 初始化当前视图
        const currentView = this.getCurrentView();
        if (currentView) {
            this.viewHistory.push(currentView);
        }
    }
    
    /**
     * 记录视图变化（由外部调用，更可靠）
     */
    recordViewChange(viewId) {
        if (viewId && (this.viewHistory.length === 0 || this.viewHistory[this.viewHistory.length - 1] !== viewId)) {
            this.viewHistory.push(viewId);
            // 限制历史栈长度
            if (this.viewHistory.length > 10) {
                this.viewHistory.shift();
            }
        }
    }
    
    /**
     * 获取当前活动的视图ID
     */
    getCurrentView() {
        const activeContainer = document.querySelector('.container.active');
        return activeContainer ? activeContainer.id : null;
    }
    
    /**
     * 检查是否有模态框打开
     */
    isModalOpen() {
        const modals = document.querySelectorAll('.modal-overlay');
        for (const modal of modals) {
            const style = window.getComputedStyle(modal);
            if (style.display !== 'none' && style.display !== '') {
                return true;
            }
        }
        return false;
    }
    
    /**
     * 检查是否应该忽略触摸事件
     */
    shouldIgnoreTouch(e) {
        // 检查是否有模态框打开
        if (this.isModalOpen()) {
            return true;
        }
        
        // 检查是否在可滚动元素内（如选项列表、排行榜等）
        const scrollable = e.target.closest('.options-grid, .rank-list, .compendium-grid, .compendium-content');
        if (scrollable) {
            // 检查元素是否可以滚动
            const element = scrollable;
            if (element.scrollHeight > element.clientHeight) {
                return true;
            }
        }
        
        // 检查是否在输入框内
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
            return true;
        }
        
        // 检查是否在可交互的选择器内（如难度选择器、模式选择器等）
        const selector = e.target.closest('.football-difficulty-selector-container, .sprint-difficulty-selector-container, .flag-guess-mode-selector-container, .city-network-toggle-container');
        if (selector) {
            return true;
        }
        
        return false;
    }
    
    /**
     * 处理触摸开始事件
     */
    handleTouchStart(e) {
        if (!this.isEnabled) return;
        
        // 检查是否应该忽略
        if (this.shouldIgnoreTouch(e)) {
            return;
        }
        
        const touch = e.touches[0];
        this.touchStartX = touch.clientX;
        this.touchStartY = touch.clientY;
    }
    
    /**
     * 处理触摸移动事件
     */
    handleTouchMove(e) {
        // 可以在这里添加视觉反馈（如显示滑动指示器）
        // 暂时不实现，避免影响性能
    }
    
    /**
     * 处理触摸结束事件
     */
    handleTouchEnd(e) {
        if (!this.isEnabled) return;
        
        // 如果触摸开始被忽略，这里也忽略
        if (this.touchStartX === 0 && this.touchStartY === 0) {
            return;
        }
        
        const touch = e.changedTouches[0];
        this.touchEndX = touch.clientX;
        this.touchEndY = touch.clientY;
        
        this.processSwipe();
        
        // 重置触摸位置
        this.touchStartX = 0;
        this.touchStartY = 0;
    }
    
    /**
     * 处理滑动手势
     */
    processSwipe() {
        const deltaX = this.touchEndX - this.touchStartX;
        const deltaY = this.touchEndY - this.touchStartY;
        const absDeltaX = Math.abs(deltaX);
        const absDeltaY = Math.abs(deltaY);
        
        // 检查是否为水平滑动（水平距离大于垂直距离）
        if (absDeltaX > absDeltaY && absDeltaX > this.minSwipeDistance && absDeltaY < this.maxVerticalDistance) {
            if (deltaX > 0) {
                // 向右滑动 - 返回上一界面
                this.handleSwipeRight();
            } else {
                // 向左滑动 - 可以添加前进功能（如果需要）
                this.handleSwipeLeft();
            }
        }
    }
    
    /**
     * 处理向右滑动（返回上一界面）
     */
    handleSwipeRight() {
        const currentView = this.getCurrentView();
        
        // 根据当前视图决定返回操作
        switch (currentView) {
            case 'view-menu':
                // 从菜单返回主界面
                if (window.showView) {
                    window.showView('view-landing');
                    // 更新历史栈
                    this.viewHistory.push('view-landing');
                }
                break;
                
            case 'view-game':
                // 从游戏返回菜单
                if (window.goHome) {
                    window.goHome();
                    // goHome已经会切换到view-menu，历史栈会自动更新
                }
                break;
                
            case 'view-result':
                // 从结果页返回菜单
                if (window.goHome) {
                    window.goHome();
                }
                break;
                
            case 'view-rank':
                // 从排行榜返回菜单或主界面
                if (window.goHome) {
                    window.goHome();
                }
                break;
                
            case 'view-compendium':
                // 从图鉴返回菜单
                if (window.goHome) {
                    window.goHome();
                }
                break;
                
            default:
                // 其他情况，尝试使用历史栈返回
                if (this.viewHistory.length > 1) {
                    // 移除当前视图
                    this.viewHistory.pop();
                    // 获取上一个视图
                    const previousView = this.viewHistory[this.viewHistory.length - 1];
                    if (previousView && window.showView) {
                        window.showView(previousView);
                    }
                } else if (window.showView) {
                    // 如果没有历史，返回主界面
                    window.showView('view-landing');
                }
                break;
        }
    }
    
    /**
     * 处理向左滑动（前进，可选功能）
     */
    handleSwipeLeft() {
        // 暂时不实现前进功能，因为应用主要是层级导航
        // 如果需要，可以在这里添加逻辑
    }
    
    /**
     * 启用/禁用触摸手势
     */
    setEnabled(enabled) {
        this.isEnabled = enabled;
    }
    
    /**
     * 清除历史栈
     */
    clearHistory() {
        this.viewHistory = [];
        const currentView = this.getCurrentView();
        if (currentView) {
            this.viewHistory.push(currentView);
        }
    }
}

// 创建全局实例
window.touchGestureManager = new TouchGestureManager();

// 暴露到全局
window.TouchGestureManager = TouchGestureManager;

