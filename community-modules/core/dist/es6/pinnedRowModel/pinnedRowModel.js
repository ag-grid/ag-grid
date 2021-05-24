/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v25.3.0
 * @link http://www.ag-grid.com/
 * @license MIT
 */
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
import { RowNode } from "../entities/rowNode";
import { Autowired, Bean, PostConstruct } from "../context/context";
import { Events } from "../events";
import { Constants } from "../constants/constants";
import { BeanStub } from "../context/beanStub";
import { missingOrEmpty } from "../utils/generic";
import { last } from "../utils/array";
var PinnedRowModel = /** @class */ (function (_super) {
    __extends(PinnedRowModel, _super);
    function PinnedRowModel() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    PinnedRowModel.prototype.init = function () {
        this.setPinnedTopRowData(this.gridOptionsWrapper.getPinnedTopRowData());
        this.setPinnedBottomRowData(this.gridOptionsWrapper.getPinnedBottomRowData());
    };
    PinnedRowModel.prototype.isEmpty = function (floating) {
        var rows = floating === Constants.PINNED_TOP ? this.pinnedTopRows : this.pinnedBottomRows;
        return missingOrEmpty(rows);
    };
    PinnedRowModel.prototype.isRowsToRender = function (floating) {
        return !this.isEmpty(floating);
    };
    PinnedRowModel.prototype.getRowAtPixel = function (pixel, floating) {
        var rows = floating === Constants.PINNED_TOP ? this.pinnedTopRows : this.pinnedBottomRows;
        if (missingOrEmpty(rows)) {
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
            type: Events.EVENT_PINNED_ROW_DATA_CHANGED,
            api: this.gridApi,
            columnApi: this.columnApi
        };
        this.eventService.dispatchEvent(event);
    };
    PinnedRowModel.prototype.setPinnedBottomRowData = function (rowData) {
        this.pinnedBottomRows = this.createNodesFromData(rowData, false);
        var event = {
            type: Events.EVENT_PINNED_ROW_DATA_CHANGED,
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
                var rowNode = new RowNode();
                _this.context.createBean(rowNode);
                rowNode.data = dataItem;
                var idPrefix = isTop ? RowNode.ID_PREFIX_TOP_PINNED : RowNode.ID_PREFIX_BOTTOM_PINNED;
                rowNode.id = idPrefix + index;
                rowNode.rowPinned = isTop ? Constants.PINNED_TOP : Constants.PINNED_BOTTOM;
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
        if (missingOrEmpty(this.pinnedTopRows)) {
            return;
        }
        this.pinnedTopRows.forEach(callback);
    };
    PinnedRowModel.prototype.forEachPinnedBottomRow = function (callback) {
        if (missingOrEmpty(this.pinnedBottomRows)) {
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
        var lastNode = last(rowNodes);
        return lastNode.rowTop + lastNode.rowHeight;
    };
    __decorate([
        Autowired('columnApi')
    ], PinnedRowModel.prototype, "columnApi", void 0);
    __decorate([
        Autowired('gridApi')
    ], PinnedRowModel.prototype, "gridApi", void 0);
    __decorate([
        PostConstruct
    ], PinnedRowModel.prototype, "init", null);
    PinnedRowModel = __decorate([
        Bean('pinnedRowModel')
    ], PinnedRowModel);
    return PinnedRowModel;
}(BeanStub));
export { PinnedRowModel };
