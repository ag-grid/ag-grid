/**
 * ag-grid - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v9.0.3
 * @link http://www.ag-grid.com/
 * @license MIT
 */
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
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
var beanStub_1 = require("../context/beanStub");
var eventService_1 = require("../eventService");
var events_1 = require("../events");
var utils_1 = require("../utils");
var context_1 = require("../context/context");
var gridOptionsWrapper_1 = require("../gridOptionsWrapper");
var gridPanel_1 = require("../gridPanel/gridPanel");
var scrollVisibleService_1 = require("../gridPanel/scrollVisibleService");
var RowBounds = (function () {
    function RowBounds() {
    }
    return RowBounds;
}());
exports.RowBounds = RowBounds;
var PaginationAutoPageSizeService = (function (_super) {
    __extends(PaginationAutoPageSizeService, _super);
    function PaginationAutoPageSizeService() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    PaginationAutoPageSizeService.prototype.notActive = function () {
        return !this.gridOptionsWrapper.isPaginationAutoPageSize();
    };
    PaginationAutoPageSizeService.prototype.postConstruct = function () {
        this.addDestroyableEventListener(this.eventService, events_1.Events.EVENT_BODY_HEIGHT_CHANGED, this.onBodyHeightChanged.bind(this));
        this.addDestroyableEventListener(this.eventService, events_1.Events.EVENT_SCROLL_VISIBILITY_CHANGED, this.onScrollVisibilityChanged.bind(this));
        this.checkPageSize();
    };
    PaginationAutoPageSizeService.prototype.onScrollVisibilityChanged = function () {
        this.checkPageSize();
    };
    PaginationAutoPageSizeService.prototype.onBodyHeightChanged = function () {
        this.checkPageSize();
    };
    PaginationAutoPageSizeService.prototype.checkPageSize = function () {
        if (this.notActive()) {
            return;
        }
        var rowHeight = this.gridOptionsWrapper.getRowHeightAsNumber();
        var bodyHeight = this.gridPanel.getBodyHeight();
        if (this.scrollVisibleService.isHBodyShowing()) {
            bodyHeight = bodyHeight - this.gridOptionsWrapper.getScrollbarWidth();
        }
        if (bodyHeight > 0) {
            var newPageSize = Math.floor(bodyHeight / rowHeight);
            this.gridOptionsWrapper.setProperty('paginationPageSize', newPageSize);
        }
    };
    return PaginationAutoPageSizeService;
}(beanStub_1.BeanStub));
__decorate([
    context_1.Autowired('gridPanel'),
    __metadata("design:type", gridPanel_1.GridPanel)
], PaginationAutoPageSizeService.prototype, "gridPanel", void 0);
__decorate([
    context_1.Autowired('eventService'),
    __metadata("design:type", eventService_1.EventService)
], PaginationAutoPageSizeService.prototype, "eventService", void 0);
__decorate([
    context_1.Autowired('gridOptionsWrapper'),
    __metadata("design:type", gridOptionsWrapper_1.GridOptionsWrapper)
], PaginationAutoPageSizeService.prototype, "gridOptionsWrapper", void 0);
__decorate([
    context_1.Autowired('scrollVisibleService'),
    __metadata("design:type", scrollVisibleService_1.ScrollVisibleService)
], PaginationAutoPageSizeService.prototype, "scrollVisibleService", void 0);
__decorate([
    context_1.PostConstruct,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], PaginationAutoPageSizeService.prototype, "postConstruct", null);
PaginationAutoPageSizeService = __decorate([
    context_1.Bean('paginationAutoPageSizeService')
], PaginationAutoPageSizeService);
exports.PaginationAutoPageSizeService = PaginationAutoPageSizeService;
var PaginationProxy = (function (_super) {
    __extends(PaginationProxy, _super);
    function PaginationProxy() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.currentPage = 0;
        _this.topRowIndex = 0;
        _this.bottomRowIndex = 0;
        _this.pixelOffset = 0;
        return _this;
    }
    PaginationProxy.prototype.postConstruct = function () {
        this.active = this.gridOptionsWrapper.isPagination();
        this.addDestroyableEventListener(this.eventService, events_1.Events.EVENT_MODEL_UPDATED, this.onModelUpdated.bind(this));
        this.addDestroyableEventListener(this.gridOptionsWrapper, 'paginationPageSize', this.onModelUpdated.bind(this));
        this.onModelUpdated();
        var paginationStartPage = this.gridOptionsWrapper.getPaginationStartPage();
        this.currentPage = paginationStartPage ? paginationStartPage : 0;
    };
    PaginationProxy.prototype.isLastRowFound = function () {
        return this.rowModel.isLastRowFound();
    };
    PaginationProxy.prototype.onModelUpdated = function (refreshEvent) {
        this.setIndexesAndBounds();
        this.eventService.dispatchEvent(events_1.Events.EVENT_PAGINATION_CHANGED, refreshEvent);
    };
    PaginationProxy.prototype.goToPage = function (page) {
        if (!this.active) {
            return;
        }
        if (this.currentPage === page) {
            return;
        }
        this.currentPage = page;
        var event = { animate: false, keepRenderedRows: false, newData: false, newPage: true };
        this.onModelUpdated(event);
    };
    PaginationProxy.prototype.getPixelOffset = function () {
        return this.pixelOffset;
    };
    PaginationProxy.prototype.getRow = function (index) {
        return this.rowModel.getRow(index);
    };
    PaginationProxy.prototype.getRowIndexAtPixel = function (pixel) {
        return this.rowModel.getRowIndexAtPixel(pixel);
    };
    PaginationProxy.prototype.getCurrentPageHeight = function () {
        if (utils_1._.missing(this.topRowBounds) || utils_1._.missing(this.bottomRowBounds)) {
            return 0;
        }
        return this.bottomRowBounds.rowTop + this.bottomRowBounds.rowHeight - this.topRowBounds.rowTop;
    };
    PaginationProxy.prototype.isRowPresent = function (rowNode) {
        return this.isRowInPage(rowNode);
    };
    PaginationProxy.prototype.isRowInPage = function (rowNode) {
        if (!this.rowModel.isRowPresent(rowNode)) {
            return false;
        }
        var nodeIsInPage = rowNode.rowIndex >= this.topRowIndex && rowNode.rowIndex <= this.bottomRowIndex;
        return nodeIsInPage;
    };
    PaginationProxy.prototype.insertItemsAtIndex = function (index, items, skipRefresh) {
        return this.rowModel.insertItemsAtIndex(index, items, skipRefresh);
    };
    PaginationProxy.prototype.removeItems = function (rowNodes, skipRefresh) {
        this.rowModel.removeItems(rowNodes, skipRefresh);
    };
    PaginationProxy.prototype.addItems = function (items, skipRefresh) {
        this.rowModel.addItems(items, skipRefresh);
    };
    PaginationProxy.prototype.isEmpty = function () {
        return this.rowModel.isEmpty();
    };
    PaginationProxy.prototype.isRowsToRender = function () {
        return this.rowModel.isRowsToRender();
    };
    PaginationProxy.prototype.forEachNode = function (callback) {
        return this.rowModel.forEachNode(callback);
    };
    PaginationProxy.prototype.getType = function () {
        return this.rowModel.getType();
    };
    PaginationProxy.prototype.getRowBounds = function (index) {
        return this.rowModel.getRowBounds(index);
    };
    PaginationProxy.prototype.getPageFirstRow = function () {
        return this.pageSize * this.currentPage;
    };
    PaginationProxy.prototype.getPageLastRow = function () {
        var totalLastRow = (this.pageSize * (this.currentPage + 1)) - 1;
        var pageLastRow = this.rowModel.getPageLastRow();
        if (pageLastRow > totalLastRow) {
            return totalLastRow;
        }
        else {
            return pageLastRow;
        }
    };
    PaginationProxy.prototype.getRowCount = function () {
        return this.rowModel.getRowCount();
    };
    PaginationProxy.prototype.goToPageWithIndex = function (index) {
        if (!this.active) {
            return;
        }
        var pageNumber = Math.floor(index / this.pageSize);
        this.goToPage(pageNumber);
    };
    PaginationProxy.prototype.getTotalRowCount = function () {
        return this.rowModel.getPageLastRow() + 1;
    };
    PaginationProxy.prototype.isLastPageFound = function () {
        return this.rowModel.isLastRowFound();
    };
    PaginationProxy.prototype.getCurrentPage = function () {
        return this.currentPage;
    };
    PaginationProxy.prototype.goToNextPage = function () {
        this.goToPage(this.currentPage + 1);
    };
    PaginationProxy.prototype.goToPreviousPage = function () {
        this.goToPage(this.currentPage - 1);
    };
    PaginationProxy.prototype.goToFirstPage = function () {
        this.goToPage(0);
    };
    PaginationProxy.prototype.goToLastPage = function () {
        var rowCount = this.rowModel.getPageLastRow() + 1;
        var lastPage = Math.floor(rowCount / this.pageSize);
        this.goToPage(lastPage);
    };
    PaginationProxy.prototype.getPageSize = function () {
        return this.pageSize;
    };
    PaginationProxy.prototype.getTotalPages = function () {
        return this.totalPages;
    };
    PaginationProxy.prototype.setPageSize = function () {
        // show put this into super class
        this.pageSize = this.gridOptionsWrapper.getPaginationPageSize();
        if (!(this.pageSize >= 1)) {
            this.pageSize = 100;
        }
    };
    PaginationProxy.prototype.setIndexesAndBounds = function () {
        if (this.active) {
            this.setPageSize();
            var totalRowCount = this.getTotalRowCount();
            this.totalPages = Math.floor((totalRowCount - 1) / this.pageSize) + 1;
            if (this.currentPage >= this.totalPages) {
                this.currentPage = this.totalPages - 1;
            }
            if (!utils_1._.isNumeric(this.currentPage) || this.currentPage < 0) {
                this.currentPage = 0;
            }
            this.topRowIndex = this.pageSize * this.currentPage;
            this.bottomRowIndex = (this.pageSize * (this.currentPage + 1)) - 1;
            var maxRowAllowed = this.rowModel.getPageLastRow();
            if (this.bottomRowIndex > maxRowAllowed) {
                this.bottomRowIndex = maxRowAllowed;
            }
        }
        else {
            this.pageSize = this.rowModel.getPageLastRow() + 1;
            this.totalPages = 1;
            this.currentPage = 0;
            this.topRowIndex = 0;
            this.bottomRowIndex = this.rowModel.getPageLastRow();
        }
        this.topRowBounds = this.rowModel.getRowBounds(this.topRowIndex);
        this.bottomRowBounds = this.rowModel.getRowBounds(this.bottomRowIndex);
        this.pixelOffset = utils_1._.exists(this.topRowBounds) ? this.topRowBounds.rowTop : 0;
    };
    return PaginationProxy;
}(beanStub_1.BeanStub));
__decorate([
    context_1.Autowired('rowModel'),
    __metadata("design:type", Object)
], PaginationProxy.prototype, "rowModel", void 0);
__decorate([
    context_1.Autowired('gridPanel'),
    __metadata("design:type", gridPanel_1.GridPanel)
], PaginationProxy.prototype, "gridPanel", void 0);
__decorate([
    context_1.Autowired('eventService'),
    __metadata("design:type", eventService_1.EventService)
], PaginationProxy.prototype, "eventService", void 0);
__decorate([
    context_1.Autowired('gridOptionsWrapper'),
    __metadata("design:type", gridOptionsWrapper_1.GridOptionsWrapper)
], PaginationProxy.prototype, "gridOptionsWrapper", void 0);
__decorate([
    context_1.PostConstruct,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], PaginationProxy.prototype, "postConstruct", null);
PaginationProxy = __decorate([
    context_1.Bean('paginationProxy')
], PaginationProxy);
exports.PaginationProxy = PaginationProxy;
