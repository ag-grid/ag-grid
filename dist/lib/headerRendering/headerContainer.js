/**
 * ag-grid - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v9.0.3
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
var utils_1 = require("../utils");
var gridOptionsWrapper_1 = require("../gridOptionsWrapper");
var context_1 = require("../context/context");
var dragAndDropService_1 = require("../dragAndDrop/dragAndDropService");
var columnController_1 = require("../columnController/columnController");
var gridPanel_1 = require("../gridPanel/gridPanel");
var eventService_1 = require("../eventService");
var events_1 = require("../events");
var headerRowComp_1 = require("./headerRowComp");
var bodyDropTarget_1 = require("./bodyDropTarget");
var column_1 = require("../entities/column");
var scrollVisibleService_1 = require("../gridPanel/scrollVisibleService");
var HeaderContainer = (function () {
    function HeaderContainer(eContainer, eViewport, eRoot, pinned) {
        this.headerRowComps = [];
        this.eContainer = eContainer;
        this.eRoot = eRoot;
        this.pinned = pinned;
        this.eViewport = eViewport;
    }
    HeaderContainer.prototype.forEachHeaderElement = function (callback) {
        this.headerRowComps.forEach(function (headerRowComp) { return headerRowComp.forEachHeaderElement(callback); });
    };
    HeaderContainer.prototype.init = function () {
        this.setupDragAndDrop();
        // if value changes, then if not pivoting, we at least need to change the label eg from sum() to avg(),
        // if pivoting, then the columns have changed
        this.eventService.addEventListener(events_1.Events.EVENT_COLUMN_VALUE_CHANGED, this.onColumnValueChanged.bind(this));
        this.eventService.addEventListener(events_1.Events.EVENT_COLUMN_ROW_GROUP_CHANGED, this.onColumnRowGroupChanged.bind(this));
        this.eventService.addEventListener(events_1.Events.EVENT_GRID_COLUMNS_CHANGED, this.onGridColumnsChanged.bind(this));
        this.eventService.addEventListener(events_1.Events.EVENT_SCROLL_VISIBILITY_CHANGED, this.onScrollVisibilityChanged.bind(this));
        this.eventService.addEventListener(events_1.Events.EVENT_COLUMN_RESIZED, this.onColumnResized.bind(this));
        this.eventService.addEventListener(events_1.Events.EVENT_DISPLAYED_COLUMNS_CHANGED, this.onDisplayedColumnsChanged.bind(this));
    };
    // if row group changes, that means we may need to add aggFunc's to the column headers,
    // if the grid goes from no aggregation (ie no grouping) to grouping
    HeaderContainer.prototype.onColumnRowGroupChanged = function () {
        this.onGridColumnsChanged();
    };
    // if the agg func of a column changes, then we may need to update the agg func in columns header
    HeaderContainer.prototype.onColumnValueChanged = function () {
        this.onGridColumnsChanged();
    };
    HeaderContainer.prototype.onColumnResized = function () {
        this.setWidthIfPinnedContainer();
    };
    HeaderContainer.prototype.onDisplayedColumnsChanged = function () {
        this.setWidthIfPinnedContainer();
    };
    HeaderContainer.prototype.onScrollVisibilityChanged = function () {
        this.setWidthIfPinnedContainer();
    };
    HeaderContainer.prototype.setWidthIfPinnedContainer = function () {
        if (this.pinned === column_1.Column.PINNED_LEFT) {
            var pinnedLeftWidthWithScroll = this.scrollVisibleService.getPinnedLeftWithScrollWidth();
            this.eContainer.style.width = pinnedLeftWidthWithScroll + 'px';
        }
        else if (this.pinned === column_1.Column.PINNED_RIGHT) {
            var pinnedRightWidthWithScroll = this.scrollVisibleService.getPinnedRightWithScrollWidth();
            this.eContainer.style.width = pinnedRightWidthWithScroll + 'px';
        }
    };
    HeaderContainer.prototype.destroy = function () {
        this.removeHeaderRowComps();
    };
    // grid cols have changed - this also means the number of rows in the header can have
    // changed. so we remove all the old rows and insert new ones for a complete refresh
    HeaderContainer.prototype.onGridColumnsChanged = function () {
        this.removeHeaderRowComps();
        this.createHeaderRowComps();
    };
    // we expose this for gridOptions.api.refreshHeader() to call
    HeaderContainer.prototype.refresh = function () {
        this.onGridColumnsChanged();
    };
    HeaderContainer.prototype.setupDragAndDrop = function () {
        var dropContainer = this.eViewport ? this.eViewport : this.eContainer;
        var bodyDropTarget = new bodyDropTarget_1.BodyDropTarget(this.pinned, dropContainer);
        this.context.wireBean(bodyDropTarget);
    };
    HeaderContainer.prototype.removeHeaderRowComps = function () {
        this.headerRowComps.forEach(function (headerRowComp) {
            headerRowComp.destroy();
        });
        this.headerRowComps.length = 0;
        utils_1.Utils.removeAllChildren(this.eContainer);
    };
    HeaderContainer.prototype.createHeaderRowComps = function () {
        // if we are displaying header groups, then we have many rows here.
        // go through each row of the header, one by one.
        var rowCount = this.columnController.getHeaderRowCount();
        for (var dept = 0; dept < rowCount; dept++) {
            var groupRow = dept !== (rowCount - 1);
            var type = groupRow ? headerRowComp_1.HeaderRowType.COLUMN_GROUP : headerRowComp_1.HeaderRowType.COLUMN;
            var headerRowComp = new headerRowComp_1.HeaderRowComp(dept, type, this.pinned, this.eRoot, this.dropTarget);
            this.context.wireBean(headerRowComp);
            this.headerRowComps.push(headerRowComp);
            this.eContainer.appendChild(headerRowComp.getGui());
        }
        var includeFloatingFilterRow = this.gridOptionsWrapper.isFloatingFilter() && !this.columnController.isPivotMode();
        if (includeFloatingFilterRow) {
            var headerRowComp = new headerRowComp_1.HeaderRowComp(rowCount, headerRowComp_1.HeaderRowType.FLOATING_FILTER, this.pinned, this.eRoot, this.dropTarget);
            this.context.wireBean(headerRowComp);
            this.headerRowComps.push(headerRowComp);
            this.eContainer.appendChild(headerRowComp.getGui());
        }
    };
    return HeaderContainer;
}());
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
    context_1.Autowired('gridPanel'),
    __metadata("design:type", gridPanel_1.GridPanel)
], HeaderContainer.prototype, "gridPanel", void 0);
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
exports.HeaderContainer = HeaderContainer;
