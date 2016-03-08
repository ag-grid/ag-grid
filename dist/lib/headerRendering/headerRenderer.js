/**
 * ag-grid - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v4.0.0
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
var context_2 = require("../context/context");
var context_3 = require("../context/context");
var headerContainer_1 = require("./headerContainer");
var eventService_1 = require("../eventService");
var events_1 = require("../events");
var context_4 = require("../context/context");
var HeaderRenderer = (function () {
    function HeaderRenderer() {
    }
    HeaderRenderer.prototype.init = function () {
        this.eHeaderViewport = this.gridPanel.getHeaderViewport();
        this.eRoot = this.gridPanel.getRoot();
        this.eHeaderOverlay = this.gridPanel.getHeaderOverlay();
        this.pinnedLeftContainer = new headerContainer_1.HeaderContainer(this.gridPanel.getPinnedLeftHeader(), null, this.eRoot, column_1.Column.PINNED_LEFT);
        this.pinnedRightContainer = new headerContainer_1.HeaderContainer(this.gridPanel.getPinnedRightHeader(), null, this.eRoot, column_1.Column.PINNED_RIGHT);
        this.centerContainer = new headerContainer_1.HeaderContainer(this.gridPanel.getHeaderContainer(), this.gridPanel.getHeaderViewport(), this.eRoot, null);
        this.context.wireBean(this.pinnedLeftContainer);
        this.context.wireBean(this.pinnedRightContainer);
        this.context.wireBean(this.centerContainer);
        // unlike the table data, the header more often 'refreshes everything' as a way to redraw, rather than
        // do delta changes based on the event. this is because groups have bigger impacts, eg a column move
        // can end up in a group splitting into two, or joining into one. this complexity makes the job much
        // harder to do delta updates. instead we just shotgun - which is fine, as the header is relatively
        // small compared to the body, so the cpu cost is low in comparison. it does mean we don't get any
        // animations.
        this.eventService.addEventListener(events_1.Events.EVENT_COLUMN_EVERYTHING_CHANGED, this.refreshHeader.bind(this));
        this.eventService.addEventListener(events_1.Events.EVENT_COLUMN_ROW_GROUP_CHANGE, this.refreshHeader.bind(this));
        this.eventService.addEventListener(events_1.Events.EVENT_COLUMN_MOVED, this.refreshHeader.bind(this));
        this.eventService.addEventListener(events_1.Events.EVENT_COLUMN_VISIBLE, this.refreshHeader.bind(this));
        this.eventService.addEventListener(events_1.Events.EVENT_COLUMN_GROUP_OPENED, this.refreshHeader.bind(this));
        this.eventService.addEventListener(events_1.Events.EVENT_COLUMN_PINNED, this.refreshHeader.bind(this));
        this.eventService.addEventListener(events_1.Events.EVENT_HEADER_HEIGHT_CHANGED, this.refreshHeader.bind(this));
        // for resized, the individual cells take care of this, so don't need to refresh everything
        this.eventService.addEventListener(events_1.Events.EVENT_COLUMN_RESIZED, this.setPinnedColContainerWidth.bind(this));
        if (this.columnController.isReady()) {
            this.refreshHeader();
        }
    };
    // this is called from the API and refreshes everything, should be broken out
    // into refresh everything vs just something changed
    HeaderRenderer.prototype.refreshHeader = function () {
        this.pinnedLeftContainer.removeAllChildren();
        this.pinnedRightContainer.removeAllChildren();
        this.centerContainer.removeAllChildren();
        this.pinnedLeftContainer.insertHeaderRowsIntoContainer();
        this.pinnedRightContainer.insertHeaderRowsIntoContainer();
        this.centerContainer.insertHeaderRowsIntoContainer();
        // if forPrint, overlay is missing
        var rowHeight = this.gridOptionsWrapper.getHeaderHeight();
        // we can probably get rid of this when we no longer need the overlay
        var dept = this.columnController.getColumnDept();
        if (this.eHeaderOverlay) {
            this.eHeaderOverlay.style.height = rowHeight + 'px';
            this.eHeaderOverlay.style.top = ((dept - 1) * rowHeight) + 'px';
        }
        this.setPinnedColContainerWidth();
    };
    HeaderRenderer.prototype.setPinnedColContainerWidth = function () {
        if (this.gridOptionsWrapper.isForPrint()) {
            // pinned col doesn't exist when doing forPrint
            return;
        }
        var pinnedLeftWidth = this.columnController.getPinnedLeftContainerWidth() + 'px';
        this.eHeaderViewport.style.marginLeft = pinnedLeftWidth;
        var pinnedRightWidth = this.columnController.getPinnedRightContainerWidth() + 'px';
        this.eHeaderViewport.style.marginRight = pinnedRightWidth;
    };
    HeaderRenderer.prototype.onIndividualColumnResized = function (column) {
        this.pinnedLeftContainer.onIndividualColumnResized(column);
        this.pinnedRightContainer.onIndividualColumnResized(column);
        this.centerContainer.onIndividualColumnResized(column);
    };
    __decorate([
        context_2.Autowired('gridOptionsWrapper'), 
        __metadata('design:type', gridOptionsWrapper_1.GridOptionsWrapper)
    ], HeaderRenderer.prototype, "gridOptionsWrapper", void 0);
    __decorate([
        context_2.Autowired('columnController'), 
        __metadata('design:type', columnController_1.ColumnController)
    ], HeaderRenderer.prototype, "columnController", void 0);
    __decorate([
        context_2.Autowired('gridPanel'), 
        __metadata('design:type', gridPanel_1.GridPanel)
    ], HeaderRenderer.prototype, "gridPanel", void 0);
    __decorate([
        context_2.Autowired('context'), 
        __metadata('design:type', context_3.Context)
    ], HeaderRenderer.prototype, "context", void 0);
    __decorate([
        context_2.Autowired('eventService'), 
        __metadata('design:type', eventService_1.EventService)
    ], HeaderRenderer.prototype, "eventService", void 0);
    __decorate([
        context_4.PostConstruct, 
        __metadata('design:type', Function), 
        __metadata('design:paramtypes', []), 
        __metadata('design:returntype', void 0)
    ], HeaderRenderer.prototype, "init", null);
    HeaderRenderer = __decorate([
        context_1.Bean('headerRenderer'), 
        __metadata('design:paramtypes', [])
    ], HeaderRenderer);
    return HeaderRenderer;
})();
exports.HeaderRenderer = HeaderRenderer;
