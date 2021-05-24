/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v25.3.0
 * @link http://www.ag-grid.com/
 * @license MIT
 */
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
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
Object.defineProperty(exports, "__esModule", { value: true });
var context_1 = require("../context/context");
var column_1 = require("../entities/column");
var beanStub_1 = require("../context/beanStub");
var eventKeys_1 = require("../eventKeys");
var HeadlessService = /** @class */ (function (_super) {
    __extends(HeadlessService, _super);
    function HeadlessService() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    HeadlessService_1 = HeadlessService;
    HeadlessService.prototype.getHeaderRows = function () {
        return this.headerRows;
    };
    HeadlessService.prototype.getRows = function () {
        return this.rows;
    };
    HeadlessService.prototype.getCenterRowContainer = function () {
        return this.centerRowContainer;
    };
    HeadlessService.prototype.postConstruct = function () {
        var _this = this;
        this.createHeaderRows();
        this.onPageLoaded();
        this.addManagedListener(this.eventService, eventKeys_1.Events.EVENT_PAGINATION_CHANGED, this.onPageLoaded.bind(this));
        this.addManagedListener(this.eventService, eventKeys_1.Events.EVENT_DISPLAYED_COLUMNS_CHANGED, function () {
            _this.createHeaderRows();
            _this.onPageLoaded();
        });
    };
    HeadlessService.prototype.createHeaderRows = function () {
        this.headerRows = [];
        var headerRowCount = this.columnController.getHeaderRowCount();
        for (var i = 0; i < headerRowCount; i++) {
            var groupLevel = i === (headerRowCount - 1);
            this.headerRows.push(this.createHeaderRow(i, groupLevel));
        }
        this.dispatchEvent({ type: HeadlessService_1.EVENT_HEADERS_UPDATED });
    };
    HeadlessService.prototype.onPageLoaded = function () {
        var _this = this;
        this.rows = [];
        var firstRow = this.paginationProxy.getPageFirstRow();
        var lastRow = this.paginationProxy.getPageLastRow();
        // first and last rows are -1 if no rows to display
        if (firstRow < 0 || lastRow < 0) {
            return;
        }
        var displayedColumns = this.columnController.getDisplayedColumns(null);
        var _loop_1 = function (rowIndex) {
            var rowNode = this_1.paginationProxy.getRow(rowIndex);
            if (!rowNode) {
                return "continue";
            }
            var cells = [];
            var rowVo = {
                cells: cells,
                index: rowIndex,
                id: rowNode.id,
                height: rowNode.rowHeight,
                top: rowNode.rowTop
            };
            displayedColumns.forEach(function (col) {
                cells.push({
                    value: _this.valueService.getValue(col, rowNode),
                    colId: col.getId(),
                    width: col.getActualWidth(),
                    left: col.getLeft()
                });
            });
            this_1.rows.push(rowVo);
        };
        var this_1 = this;
        for (var rowIndex = firstRow; rowIndex <= lastRow; rowIndex++) {
            _loop_1(rowIndex);
        }
        this.dispatchEvent({ type: HeadlessService_1.EVENT_ROWS_UPDATED });
        this.centerRowContainer = {
            height: Math.max(this.paginationProxy.getCurrentPageHeight(), 1),
            width: this.columnController.getBodyContainerWidth()
        };
        this.dispatchEvent({ type: HeadlessService_1.EVENT_ROW_CONTAINER_UPDATED });
    };
    HeadlessService.prototype.createHeaderRow = function (depth, groupLevel) {
        var _this = this;
        var items = this.columnController.getVirtualHeaderGroupRow(null, depth);
        var mapColumn = function (item) {
            var isCol = item instanceof column_1.Column;
            var name = isCol
                ? _this.columnController.getDisplayNameForColumn(item, 'header')
                : _this.columnController.getDisplayNameForColumnGroup(item, 'header');
            var res = {
                name: name,
                id: item.getUniqueId()
            };
            return res;
        };
        var res = {
            headerRowIndex: depth,
            groupLevel: groupLevel,
            columns: items.map(mapColumn)
        };
        return res;
    };
    var HeadlessService_1;
    HeadlessService.EVENT_ROWS_UPDATED = 'rowsUpdated';
    HeadlessService.EVENT_HEADERS_UPDATED = 'headersUpdated';
    HeadlessService.EVENT_ROW_CONTAINER_UPDATED = 'rowContainerUpdated';
    __decorate([
        context_1.Autowired('columnController')
    ], HeadlessService.prototype, "columnController", void 0);
    __decorate([
        context_1.Autowired('paginationProxy')
    ], HeadlessService.prototype, "paginationProxy", void 0);
    __decorate([
        context_1.Autowired('valueService')
    ], HeadlessService.prototype, "valueService", void 0);
    __decorate([
        context_1.PostConstruct
    ], HeadlessService.prototype, "postConstruct", null);
    HeadlessService = HeadlessService_1 = __decorate([
        context_1.Bean('headlessService')
    ], HeadlessService);
    return HeadlessService;
}(beanStub_1.BeanStub));
exports.HeadlessService = HeadlessService;

//# sourceMappingURL=headlessService.js.map
