/**
 * ag-grid - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v5.0.4
 * @link http://www.ag-grid.com/
 * @license MIT
 */
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var gridOptionsWrapper_1 = require("../gridOptionsWrapper");
var columnController_1 = require("../columnController/columnController");
var gridPanel_1 = require("../gridPanel/gridPanel");
var column_1 = require("../entities/column");
var context_1 = require("../context/context");
var headerContainer_1 = require("./headerContainer");
var eventService_1 = require("../eventService");
var events_1 = require("../events");
var HeaderRenderer = (function () {
    function HeaderRenderer() {
    }
    HeaderRenderer.prototype.init = function () {
        var _this = this;
        this.eHeaderViewport = this.gridPanel.getHeaderViewport();
        this.eRoot = this.gridPanel.getRoot();
        this.eHeaderOverlay = this.gridPanel.getHeaderOverlay();
        this.centerContainer = new headerContainer_1.HeaderContainer(this.gridPanel.getHeaderContainer(), this.gridPanel.getHeaderViewport(), this.eRoot, null);
        this.childContainers = [this.centerContainer];
        if (!this.gridOptionsWrapper.isForPrint()) {
            this.pinnedLeftContainer = new headerContainer_1.HeaderContainer(this.gridPanel.getPinnedLeftHeader(), null, this.eRoot, column_1.Column.PINNED_LEFT);
            this.pinnedRightContainer = new headerContainer_1.HeaderContainer(this.gridPanel.getPinnedRightHeader(), null, this.eRoot, column_1.Column.PINNED_RIGHT);
            this.childContainers.push(this.pinnedLeftContainer);
            this.childContainers.push(this.pinnedRightContainer);
        }
        this.childContainers.forEach(function (container) { return _this.context.wireBean(container); });
        // when grid columns change, it means the number of rows in the header has changed and it's all new columns
        this.eventService.addEventListener(events_1.Events.EVENT_GRID_COLUMNS_CHANGED, this.onGridColumnsChanged.bind(this));
        // shotgun way to get labels to change, eg from sum(amount) to avg(amount)
        this.eventService.addEventListener(events_1.Events.EVENT_COLUMN_VALUE_CHANGED, this.refreshHeader.bind(this));
        // for resized, the individual cells take care of this, so don't need to refresh everything
        this.eventService.addEventListener(events_1.Events.EVENT_COLUMN_RESIZED, this.setPinnedColContainerWidth.bind(this));
        this.eventService.addEventListener(events_1.Events.EVENT_DISPLAYED_COLUMNS_CHANGED, this.setPinnedColContainerWidth.bind(this));
        if (this.columnController.isReady()) {
            this.refreshHeader();
        }
    };
    HeaderRenderer.prototype.forEachHeaderElement = function (callback) {
        this.childContainers.forEach(function (childContainer) { return childContainer.forEachHeaderElement(callback); });
    };
    HeaderRenderer.prototype.destroy = function () {
        this.childContainers.forEach(function (container) { return container.destroy(); });
    };
    HeaderRenderer.prototype.onGridColumnsChanged = function () {
        this.setHeight();
    };
    // this is called from the API and refreshes everything, should be broken out
    // into refresh everything vs just something changed
    HeaderRenderer.prototype.refreshHeader = function () {
        this.setHeight();
        this.childContainers.forEach(function (container) { return container.refresh(); });
        this.setPinnedColContainerWidth();
    };
    HeaderRenderer.prototype.setHeight = function () {
        // if forPrint, overlay is missing
        if (this.eHeaderOverlay) {
            var rowHeight = this.gridOptionsWrapper.getHeaderHeight();
            // we can probably get rid of this when we no longer need the overlay
            var dept = this.columnController.getHeaderRowCount();
            this.eHeaderOverlay.style.height = rowHeight + 'px';
            this.eHeaderOverlay.style.top = ((dept - 1) * rowHeight) + 'px';
        }
    };
    HeaderRenderer.prototype.setPinnedColContainerWidth = function () {
        // pinned col doesn't exist when doing forPrint
        if (this.gridOptionsWrapper.isForPrint()) {
            return;
        }
        var pinnedLeftWidth = this.columnController.getPinnedLeftContainerWidth();
        this.eHeaderViewport.style.marginLeft = pinnedLeftWidth + 'px';
        this.pinnedLeftContainer.setWidth(pinnedLeftWidth);
        var pinnedRightWidth = this.columnController.getPinnedRightContainerWidth();
        this.eHeaderViewport.style.marginRight = pinnedRightWidth + 'px';
        this.pinnedRightContainer.setWidth(pinnedRightWidth);
    };
    __decorate([
        context_1.Autowired('gridOptionsWrapper'), 
        __metadata('design:type', gridOptionsWrapper_1.GridOptionsWrapper)
    ], HeaderRenderer.prototype, "gridOptionsWrapper", void 0);
    __decorate([
        context_1.Autowired('columnController'), 
        __metadata('design:type', columnController_1.ColumnController)
    ], HeaderRenderer.prototype, "columnController", void 0);
    __decorate([
        context_1.Autowired('gridPanel'), 
        __metadata('design:type', gridPanel_1.GridPanel)
    ], HeaderRenderer.prototype, "gridPanel", void 0);
    __decorate([
        context_1.Autowired('context'), 
        __metadata('design:type', context_1.Context)
    ], HeaderRenderer.prototype, "context", void 0);
    __decorate([
        context_1.Autowired('eventService'), 
        __metadata('design:type', eventService_1.EventService)
    ], HeaderRenderer.prototype, "eventService", void 0);
    __decorate([
        context_1.PostConstruct, 
        __metadata('design:type', Function), 
        __metadata('design:paramtypes', []), 
        __metadata('design:returntype', void 0)
    ], HeaderRenderer.prototype, "init", null);
    __decorate([
        context_1.PreDestroy, 
        __metadata('design:type', Function), 
        __metadata('design:paramtypes', []), 
        __metadata('design:returntype', void 0)
    ], HeaderRenderer.prototype, "destroy", null);
    HeaderRenderer = __decorate([
        context_1.Bean('headerRenderer'), 
        __metadata('design:paramtypes', [])
    ], HeaderRenderer);
    return HeaderRenderer;
})();
exports.HeaderRenderer = HeaderRenderer;
