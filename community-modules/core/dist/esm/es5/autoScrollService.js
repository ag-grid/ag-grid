/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / Typescript / React / Angular / Vue
 * @version v28.2.0
 * @link https://www.ag-grid.com/
 * @license MIT
 */
var AutoScrollService = /** @class */ (function () {
    function AutoScrollService(params) {
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
        this.shouldSkipVerticalScroll = params.shouldSkipVerticalScroll || (function () { return false; });
        this.shouldSkipHorizontalScroll = params.shouldSkipHorizontalScroll || (function () { return false; });
    }
    AutoScrollService.prototype.check = function (mouseEvent, forceSkipVerticalScroll) {
        if (forceSkipVerticalScroll === void 0) { forceSkipVerticalScroll = false; }
        var skipVerticalScroll = forceSkipVerticalScroll || this.shouldSkipVerticalScroll();
        if (skipVerticalScroll && this.shouldSkipHorizontalScroll()) {
            return;
        }
        var rect = this.scrollContainer.getBoundingClientRect();
        var scrollTick = this.scrollByTick;
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
    };
    AutoScrollService.prototype.ensureTickingStarted = function () {
        if (this.tickingInterval === null) {
            this.tickingInterval = window.setInterval(this.doTick.bind(this), 100);
            this.tickCount = 0;
        }
    };
    AutoScrollService.prototype.doTick = function () {
        this.tickCount++;
        var tickAmount;
        tickAmount = this.tickCount > 20 ? 200 : (this.tickCount > 10 ? 80 : 40);
        if (this.scrollVertically) {
            var vScrollPosition = this.getVerticalPosition();
            if (this.tickUp) {
                this.setVerticalPosition(vScrollPosition - tickAmount);
            }
            if (this.tickDown) {
                this.setVerticalPosition(vScrollPosition + tickAmount);
            }
        }
        if (this.scrollHorizontally) {
            var hScrollPosition = this.getHorizontalPosition();
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
    };
    AutoScrollService.prototype.ensureCleared = function () {
        if (this.tickingInterval) {
            window.clearInterval(this.tickingInterval);
            this.tickingInterval = null;
        }
    };
    return AutoScrollService;
}());
export { AutoScrollService };
