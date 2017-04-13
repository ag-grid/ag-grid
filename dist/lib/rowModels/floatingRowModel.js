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
var gridOptionsWrapper_1 = require("../gridOptionsWrapper");
var rowNode_1 = require("../entities/rowNode");
var context_1 = require("../context/context");
var eventService_1 = require("../eventService");
var context_2 = require("../context/context");
var events_1 = require("../events");
var context_3 = require("../context/context");
var constants_1 = require("../constants");
var utils_1 = require("../utils");
var FloatingRowModel = (function () {
    function FloatingRowModel() {
    }
    FloatingRowModel.prototype.init = function () {
        this.setFloatingTopRowData(this.gridOptionsWrapper.getFloatingTopRowData());
        this.setFloatingBottomRowData(this.gridOptionsWrapper.getFloatingBottomRowData());
    };
    FloatingRowModel.prototype.isEmpty = function (floating) {
        var rows = floating === constants_1.Constants.FLOATING_TOP ? this.floatingTopRows : this.floatingBottomRows;
        return utils_1.Utils.missingOrEmpty(rows);
    };
    FloatingRowModel.prototype.isRowsToRender = function (floating) {
        return !this.isEmpty(floating);
    };
    FloatingRowModel.prototype.getRowAtPixel = function (pixel, floating) {
        var rows = floating === constants_1.Constants.FLOATING_TOP ? this.floatingTopRows : this.floatingBottomRows;
        if (utils_1.Utils.missingOrEmpty(rows)) {
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
    FloatingRowModel.prototype.setFloatingTopRowData = function (rowData) {
        this.floatingTopRows = this.createNodesFromData(rowData, true);
        this.eventService.dispatchEvent(events_1.Events.EVENT_FLOATING_ROW_DATA_CHANGED);
    };
    FloatingRowModel.prototype.setFloatingBottomRowData = function (rowData) {
        this.floatingBottomRows = this.createNodesFromData(rowData, false);
        this.eventService.dispatchEvent(events_1.Events.EVENT_FLOATING_ROW_DATA_CHANGED);
    };
    FloatingRowModel.prototype.createNodesFromData = function (allData, isTop) {
        var _this = this;
        var rowNodes = [];
        if (allData) {
            var nextRowTop = 0;
            allData.forEach(function (dataItem, index) {
                var rowNode = new rowNode_1.RowNode();
                _this.context.wireBean(rowNode);
                rowNode.data = dataItem;
                rowNode.floating = isTop ? constants_1.Constants.FLOATING_TOP : constants_1.Constants.FLOATING_BOTTOM;
                rowNode.setRowTop(nextRowTop);
                rowNode.setRowHeight(_this.gridOptionsWrapper.getRowHeightForNode(rowNode));
                rowNode.setRowIndex(index);
                nextRowTop += rowNode.rowHeight;
                rowNodes.push(rowNode);
            });
        }
        return rowNodes;
    };
    FloatingRowModel.prototype.getFloatingTopRowData = function () {
        return this.floatingTopRows;
    };
    FloatingRowModel.prototype.getFloatingBottomRowData = function () {
        return this.floatingBottomRows;
    };
    FloatingRowModel.prototype.getFloatingTopTotalHeight = function () {
        return this.getTotalHeight(this.floatingTopRows);
    };
    FloatingRowModel.prototype.getFloatingTopRowCount = function () {
        return this.floatingTopRows ? this.floatingTopRows.length : 0;
    };
    FloatingRowModel.prototype.getFloatingBottomRowCount = function () {
        return this.floatingBottomRows ? this.floatingBottomRows.length : 0;
    };
    FloatingRowModel.prototype.getFloatingTopRow = function (index) {
        return this.floatingTopRows[index];
    };
    FloatingRowModel.prototype.getFloatingBottomRow = function (index) {
        return this.floatingBottomRows[index];
    };
    FloatingRowModel.prototype.forEachFloatingTopRow = function (callback) {
        if (utils_1.Utils.missingOrEmpty(this.floatingTopRows)) {
            return;
        }
        this.floatingTopRows.forEach(callback);
    };
    FloatingRowModel.prototype.forEachFloatingBottomRow = function (callback) {
        if (utils_1.Utils.missingOrEmpty(this.floatingBottomRows)) {
            return;
        }
        this.floatingBottomRows.forEach(callback);
    };
    FloatingRowModel.prototype.getFloatingBottomTotalHeight = function () {
        return this.getTotalHeight(this.floatingBottomRows);
    };
    FloatingRowModel.prototype.getTotalHeight = function (rowNodes) {
        if (!rowNodes || rowNodes.length === 0) {
            return 0;
        }
        else {
            var lastNode = rowNodes[rowNodes.length - 1];
            return lastNode.rowTop + lastNode.rowHeight;
        }
    };
    return FloatingRowModel;
}());
__decorate([
    context_2.Autowired('gridOptionsWrapper'),
    __metadata("design:type", gridOptionsWrapper_1.GridOptionsWrapper)
], FloatingRowModel.prototype, "gridOptionsWrapper", void 0);
__decorate([
    context_2.Autowired('eventService'),
    __metadata("design:type", eventService_1.EventService)
], FloatingRowModel.prototype, "eventService", void 0);
__decorate([
    context_2.Autowired('context'),
    __metadata("design:type", context_1.Context)
], FloatingRowModel.prototype, "context", void 0);
__decorate([
    context_3.PostConstruct,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], FloatingRowModel.prototype, "init", null);
FloatingRowModel = __decorate([
    context_1.Bean('floatingRowModel')
], FloatingRowModel);
exports.FloatingRowModel = FloatingRowModel;
