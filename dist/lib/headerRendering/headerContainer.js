/**
 * ag-grid-community - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v21.2.1
 * @link http://www.ag-grid.com/
 * @license MIT
 */
"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
var gridOptionsWrapper_1 = require("../gridOptionsWrapper");
var context_1 = require("../context/context");
var dragAndDropService_1 = require("../dragAndDrop/dragAndDropService");
var columnController_1 = require("../columnController/columnController");
var eventService_1 = require("../eventService");
var events_1 = require("../events");
var headerRowComp_1 = require("./headerRowComp");
var bodyDropTarget_1 = require("./bodyDropTarget");
var column_1 = require("../entities/column");
var scrollVisibleService_1 = require("../gridPanel/scrollVisibleService");
var utils_1 = require("../utils");
var HeaderContainer = /** @class */ (function () {
    function HeaderContainer(eContainer, eViewport, pinned) {
        this.headerRowComps = [];
        this.eContainer = eContainer;
        this.pinned = pinned;
        this.eViewport = eViewport;
    }
    HeaderContainer.prototype.registerGridComp = function (gridPanel) {
        this.setupDragAndDrop(gridPanel);
    };
    HeaderContainer.prototype.forEachHeaderElement = function (callback) {
        this.headerRowComps.forEach(function (headerRowComp) { return headerRowComp.forEachHeaderElement(callback); });
    };
    HeaderContainer.prototype.init = function () {
        this.scrollWidth = this.gridOptionsWrapper.getScrollbarWidth();
        // if value changes, then if not pivoting, we at least need to change the label eg from sum() to avg(),
        // if pivoting, then the columns have changed
        this.eventService.addEventListener(events_1.Events.EVENT_COLUMN_VALUE_CHANGED, this.onColumnValueChanged.bind(this));
        this.eventService.addEventListener(events_1.Events.EVENT_COLUMN_ROW_GROUP_CHANGED, this.onColumnRowGroupChanged.bind(this));
        this.eventService.addEventListener(events_1.Events.EVENT_GRID_COLUMNS_CHANGED, this.onGridColumnsChanged.bind(this));
        this.eventService.addEventListener(events_1.Events.EVENT_SCROLL_VISIBILITY_CHANGED, this.onScrollVisibilityChanged.bind(this));
        this.eventService.addEventListener(events_1.Events.EVENT_COLUMN_RESIZED, this.onColumnResized.bind(this));
        this.eventService.addEventListener(events_1.Events.EVENT_DISPLAYED_COLUMNS_CHANGED, this.onDisplayedColumnsChanged.bind(this));
    };
    // if row group changes, that means we may need to add aggFuncs to the column headers,
    // if the grid goes from no aggregation (ie no grouping) to grouping
    HeaderContainer.prototype.onColumnRowGroupChanged = function () {
        this.onGridColumnsChanged();
    };
    // if the agg func of a column changes, then we may need to update the agg func in columns header
    HeaderContainer.prototype.onColumnValueChanged = function () {
        this.onGridColumnsChanged();
    };
    HeaderContainer.prototype.onColumnResized = function () {
        this.setWidthOfPinnedContainer();
    };
    HeaderContainer.prototype.onDisplayedColumnsChanged = function () {
        this.setWidthOfPinnedContainer();
    };
    HeaderContainer.prototype.onScrollVisibilityChanged = function () {
        this.setWidthOfPinnedContainer();
    };
    HeaderContainer.prototype.setWidthOfPinnedContainer = function () {
        var pinningLeft = this.pinned === column_1.Column.PINNED_LEFT;
        var pinningRight = this.pinned === column_1.Column.PINNED_RIGHT;
        var controller = this.columnController;
        var isRtl = this.gridOptionsWrapper.isEnableRtl();
        if (pinningLeft || pinningRight) {
            // size to fit all columns
            var width = controller[pinningLeft ? 'getPinnedLeftContainerWidth' : 'getPinnedRightContainerWidth']();
            // if there is a scroll showing (and taking up space, so Windows, and not iOS)
            // in the body, then we add extra space to keep header aligned with the body,
            // as body width fits the cols and the scrollbar
            var addPaddingForScrollbar = this.scrollVisibleService.isVerticalScrollShowing() && ((isRtl && pinningLeft) || (!isRtl && pinningRight));
            if (addPaddingForScrollbar) {
                width += this.scrollWidth;
            }
            utils_1._.setFixedWidth(this.eContainer, width);
        }
    };
    HeaderContainer.prototype.destroy = function () {
        this.removeHeaderRowComps();
    };
    HeaderContainer.prototype.getRowComps = function () {
        return this.headerRowComps;
    };
    // grid cols have changed - this also means the number of rows in the header can have
    // changed. so we remove all the old rows and insert new ones for a complete refresh
    HeaderContainer.prototype.onGridColumnsChanged = function () {
        this.removeAndCreateAllRowComps();
    };
    HeaderContainer.prototype.removeAndCreateAllRowComps = function () {
        this.removeHeaderRowComps();
        this.createHeaderRowComps();
    };
    // we expose this for gridOptions.api.refreshHeader() to call
    HeaderContainer.prototype.refresh = function () {
        this.removeAndCreateAllRowComps();
    };
    HeaderContainer.prototype.setupDragAndDrop = function (gridComp) {
        var dropContainer = this.eViewport ? this.eViewport : this.eContainer;
        var bodyDropTarget = new bodyDropTarget_1.BodyDropTarget(this.pinned, dropContainer);
        this.context.wireBean(bodyDropTarget);
        bodyDropTarget.registerGridComp(gridComp);
    };
    HeaderContainer.prototype.removeHeaderRowComps = function () {
        this.headerRowComps.forEach(function (headerRowComp) {
            headerRowComp.destroy();
        });
        this.headerRowComps.length = 0;
        utils_1._.clearElement(this.eContainer);
    };
    HeaderContainer.prototype.createHeaderRowComps = function () {
        // if we are displaying header groups, then we have many rows here.
        // go through each row of the header, one by one.
        var rowCount = this.columnController.getHeaderRowCount();
        for (var dept = 0; dept < rowCount; dept++) {
            var groupRow = dept !== (rowCount - 1);
            var type = groupRow ? headerRowComp_1.HeaderRowType.COLUMN_GROUP : headerRowComp_1.HeaderRowType.COLUMN;
            var headerRowComp = new headerRowComp_1.HeaderRowComp(dept, type, this.pinned, this.dropTarget);
            this.context.wireBean(headerRowComp);
            this.headerRowComps.push(headerRowComp);
            headerRowComp.getGui().setAttribute('aria-rowindex', this.headerRowComps.length.toString());
            this.eContainer.appendChild(headerRowComp.getGui());
        }
        var includeFloatingFilterRow = this.gridOptionsWrapper.isFloatingFilter() && !this.columnController.isPivotMode();
        if (includeFloatingFilterRow) {
            var headerRowComp = new headerRowComp_1.HeaderRowComp(rowCount, headerRowComp_1.HeaderRowType.FLOATING_FILTER, this.pinned, this.dropTarget);
            this.context.wireBean(headerRowComp);
            this.headerRowComps.push(headerRowComp);
            headerRowComp.getGui().setAttribute('aria-rowindex', this.headerRowComps.length.toString());
            this.eContainer.appendChild(headerRowComp.getGui());
        }
    };
    __decorate([
        context_1.Autowired('gridOptionsWrapper'),
        __metadata("design:type", gridOptionsWrapper_1.GridOptionsWrapper)
    ], HeaderContainer.prototype, "gridOptionsWrapper", void 0);
    __decorate([
        context_1.Autowired('context'),
        __metadata("design:type", context_1.Context)
    ], HeaderContainer.prototype, "context", void 0);
    __decorate([
        context_1.Autowired('$scope'),
        __metadata("design:type", Object)
    ], HeaderContainer.prototype, "$scope", void 0);
    __decorate([
        context_1.Autowired('dragAndDropService'),
        __metadata("design:type", dragAndDropService_1.DragAndDropService)
    ], HeaderContainer.prototype, "dragAndDropService", void 0);
    __decorate([
        context_1.Autowired('columnController'),
        __metadata("design:type", columnController_1.ColumnController)
    ], HeaderContainer.prototype, "columnController", void 0);
    __decorate([
        context_1.Autowired('eventService'),
        __metadata("design:type", eventService_1.EventService)
    ], HeaderContainer.prototype, "eventService", void 0);
    __decorate([
        context_1.Autowired('scrollVisibleService'),
        __metadata("design:type", scrollVisibleService_1.ScrollVisibleService)
    ], HeaderContainer.prototype, "scrollVisibleService", void 0);
    __decorate([
        context_1.PostConstruct,
        __metadata("design:type", Function),
        __metadata("design:paramtypes", []),
        __metadata("design:returntype", void 0)
    ], HeaderContainer.prototype, "init", null);
    return HeaderContainer;
}());
exports.HeaderContainer = HeaderContainer;
