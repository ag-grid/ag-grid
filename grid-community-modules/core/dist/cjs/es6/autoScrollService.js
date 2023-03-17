/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / Typescript / React / Angular / Vue
 * @version v29.2.0
 * @link https://www.ag-grid.com/
 * @license MIT
 */
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AutoScrollService = void 0;
class AutoScrollService {
    constructor(params) {
        this.tickingInterval = null;
        this.onScrollCallback = null;
        this.scrollContainer = params.scrollContainer;
        this.scrollHorizontally = params.scrollAxis.indexOf('x') !== -1;
        this.scrollVertically = params.scrollAxis.indexOf('y') !== -1;
        this.scrollByTick = params.scrollByTick != null ? params.scrollByTick : 20;
        if (params.onScrollCallback) {
            this.onScrollCallback = params.onScrollCallback;
        }
        if (this.scrollVertically) {
            this.getVerticalPosition = params.getVerticalPosition;
            this.setVerticalPosition = params.setVerticalPosition;
        }
        if (this.scrollHorizontally) {
            this.getHorizontalPosition = params.getHorizontalPosition;
            this.setHorizontalPosition = params.setHorizontalPosition;
        }
        this.shouldSkipVerticalScroll = params.shouldSkipVerticalScroll || (() => false);
        this.shouldSkipHorizontalScroll = params.shouldSkipHorizontalScroll || (() => false);
    }
    check(mouseEvent, forceSkipVerticalScroll = false) {
        const skipVerticalScroll = forceSkipVerticalScroll || this.shouldSkipVerticalScroll();
        if (skipVerticalScroll && this.shouldSkipHorizontalScroll()) {
            return;
        }
        const rect = this.scrollContainer.getBoundingClientRect();
        const scrollTick = this.scrollByTick;
        this.tickLeft = mouseEvent.clientX < (rect.left + scrollTick);
        this.tickRight = mouseEvent.clientX > (rect.right - scrollTick);
        this.tickUp = mouseEvent.clientY < (rect.top + scrollTick) && !skipVerticalScroll;
        this.tickDown = mouseEvent.clientY > (rect.bottom - scrollTick) && !skipVerticalScroll;
        if (this.tickLeft || this.tickRight || this.tickUp || this.tickDown) {
            this.ensureTickingStarted();
        }
        else {
            this.ensureCleared();
        }
    }
    ensureTickingStarted() {
        if (this.tickingInterval === null) {
            this.tickingInterval = window.setInterval(this.doTick.bind(this), 100);
            this.tickCount = 0;
        }
    }
    doTick() {
        this.tickCount++;
        let tickAmount;
        tickAmount = this.tickCount > 20 ? 200 : (this.tickCount > 10 ? 80 : 40);
        if (this.scrollVertically) {
            const vScrollPosition = this.getVerticalPosition();
            if (this.tickUp) {
                this.setVerticalPosition(vScrollPosition - tickAmount);
            }
            if (this.tickDown) {
                this.setVerticalPosition(vScrollPosition + tickAmount);
            }
        }
        if (this.scrollHorizontally) {
            const hScrollPosition = this.getHorizontalPosition();
            if (this.tickLeft) {
                this.setHorizontalPosition(hScrollPosition - tickAmount);
            }
            if (this.tickRight) {
                this.setHorizontalPosition(hScrollPosition + tickAmount);
            }
        }
        if (this.onScrollCallback) {
            this.onScrollCallback();
        }
    }
    ensureCleared() {
        if (this.tickingInterval) {
            window.clearInterval(this.tickingInterval);
            this.tickingInterval = null;
        }
    }
}
exports.AutoScrollService = AutoScrollService;
