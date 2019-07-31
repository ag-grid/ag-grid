/**
 * ag-grid-community - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v21.1.1
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
var rowNode_1 = require("../entities/rowNode");
var context_1 = require("../context/context");
var eventService_1 = require("../eventService");
var events_1 = require("../events");
var constants_1 = require("../constants");
var columnApi_1 = require("../columnController/columnApi");
var gridApi_1 = require("../gridApi");
var utils_1 = require("../utils");
var PinnedRowModel = /** @class */ (function () {
    function PinnedRowModel() {
    }
    PinnedRowModel.prototype.init = function () {
        this.setPinnedTopRowData(this.gridOptionsWrapper.getPinnedTopRowData());
        this.setPinnedBottomRowData(this.gridOptionsWrapper.getPinnedBottomRowData());
    };
    PinnedRowModel.prototype.isEmpty = function (floating) {
        var rows = floating === constants_1.Constants.PINNED_TOP ? this.pinnedTopRows : this.pinnedBottomRows;
        return utils_1._.missingOrEmpty(rows);
    };
    PinnedRowModel.prototype.isRowsToRender = function (floating) {
        return !this.isEmpty(floating);
    };
    PinnedRowModel.prototype.getRowAtPixel = function (pixel, floating) {
        var rows = floating === constants_1.Constants.PINNED_TOP ? this.pinnedTopRows : this.pinnedBottomRows;
        if (utils_1._.missingOrEmpty(rows)) {
            return 0; // this should never happen, just in case, 0 is graceful failure
        }
        for (var i = 0; i < rows.length; i++) {
            var rowNode = rows[i];
            var rowTopPixel = rowNode.rowTop + rowNode.rowHeight - 1;
            // only need to range check against the top pixel, as we are going through the list
            // in order, first row to hit the pixel wins
            if (rowTopPixel >= pixel) {
                return i;
            }
        }
        return rows.length - 1;
    };
    PinnedRowModel.prototype.setPinnedTopRowData = function (rowData) {
        this.pinnedTopRows = this.createNodesFromData(rowData, true);
        var event = {
            type: events_1.Events.EVENT_PINNED_ROW_DATA_CHANGED,
            api: this.gridApi,
            columnApi: this.columnApi
        };
        this.eventService.dispatchEvent(event);
    };
    PinnedRowModel.prototype.setPinnedBottomRowData = function (rowData) {
        this.pinnedBottomRows = this.createNodesFromData(rowData, false);
        var event = {
            type: events_1.Events.EVENT_PINNED_ROW_DATA_CHANGED,
            api: this.gridApi,
            columnApi: this.columnApi
        };
        this.eventService.dispatchEvent(event);
    };
    PinnedRowModel.prototype.createNodesFromData = function (allData, isTop) {
        var _this = this;
        var rowNodes = [];
        if (allData) {
            var nextRowTop_1 = 0;
            allData.forEach(function (dataItem, index) {
                var rowNode = new rowNode_1.RowNode();
                _this.context.wireBean(rowNode);
                rowNode.data = dataItem;
                rowNode.rowPinned = isTop ? constants_1.Constants.PINNED_TOP : constants_1.Constants.PINNED_BOTTOM;
                rowNode.setRowTop(nextRowTop_1);
                rowNode.setRowHeight(_this.gridOptionsWrapper.getRowHeightForNode(rowNode).height);
                rowNode.setRowIndex(index);
                nextRowTop_1 += rowNode.rowHeight;
                rowNodes.push(rowNode);
            });
        }
        return rowNodes;
    };
    PinnedRowModel.prototype.getPinnedTopRowData = function () {
        return this.pinnedTopRows;
    };
    PinnedRowModel.prototype.getPinnedBottomRowData = function () {
        return this.pinnedBottomRows;
    };
    PinnedRowModel.prototype.getPinnedTopTotalHeight = function () {
        return this.getTotalHeight(this.pinnedTopRows);
    };
    PinnedRowModel.prototype.getPinnedTopRowCount = function () {
        return this.pinnedTopRows ? this.pinnedTopRows.length : 0;
    };
    PinnedRowModel.prototype.getPinnedBottomRowCount = function () {
        return this.pinnedBottomRows ? this.pinnedBottomRows.length : 0;
    };
    PinnedRowModel.prototype.getPinnedTopRow = function (index) {
        return this.pinnedTopRows[index];
    };
    PinnedRowModel.prototype.getPinnedBottomRow = function (index) {
        return this.pinnedBottomRows[index];
    };
    PinnedRowModel.prototype.forEachPinnedTopRow = function (callback) {
        if (utils_1._.missingOrEmpty(this.pinnedTopRows)) {
            return;
        }
        this.pinnedTopRows.forEach(callback);
    };
    PinnedRowModel.prototype.forEachPinnedBottomRow = function (callback) {
        if (utils_1._.missingOrEmpty(this.pinnedBottomRows)) {
            return;
        }
        this.pinnedBottomRows.forEach(callback);
    };
    PinnedRowModel.prototype.getPinnedBottomTotalHeight = function () {
        return this.getTotalHeight(this.pinnedBottomRows);
    };
    PinnedRowModel.prototype.getTotalHeight = function (rowNodes) {
        if (!rowNodes || rowNodes.length === 0) {
            return 0;
        }
        else {
            var lastNode = utils_1._.last(rowNodes);
            return lastNode.rowTop + lastNode.rowHeight;
        }
    };
    __decorate([
        context_1.Autowired('gridOptionsWrapper'),
        __metadata("design:type", gridOptionsWrapper_1.GridOptionsWrapper)
    ], PinnedRowModel.prototype, "gridOptionsWrapper", void 0);
    __decorate([
        context_1.Autowired('eventService'),
        __metadata("design:type", eventService_1.EventService)
    ], PinnedRowModel.prototype, "eventService", void 0);
    __decorate([
        context_1.Autowired('context'),
        __metadata("design:type", context_1.Context)
    ], PinnedRowModel.prototype, "context", void 0);
    __decorate([
        context_1.Autowired('columnApi'),
        __metadata("design:type", columnApi_1.ColumnApi)
    ], PinnedRowModel.prototype, "columnApi", void 0);
    __decorate([
        context_1.Autowired('gridApi'),
        __metadata("design:type", gridApi_1.GridApi)
    ], PinnedRowModel.prototype, "gridApi", void 0);
    __decorate([
        context_1.PostConstruct,
        __metadata("design:type", Function),
        __metadata("design:paramtypes", []),
        __metadata("design:returntype", void 0)
    ], PinnedRowModel.prototype, "init", null);
    PinnedRowModel = __decorate([
        context_1.Bean('pinnedRowModel')
    ], PinnedRowModel);
    return PinnedRowModel;
}());
exports.PinnedRowModel = PinnedRowModel;
