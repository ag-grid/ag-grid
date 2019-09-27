// ag-grid-enterprise v21.2.2
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
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
var ag_grid_community_1 = require("ag-grid-community");
var abstractSelectionHandle_1 = require("./abstractSelectionHandle");
var RangeHandle = /** @class */ (function (_super) {
    __extends(RangeHandle, _super);
    function RangeHandle() {
        var _this = _super.call(this, RangeHandle.TEMPLATE) || this;
        _this.type = 'range';
        _this.rangeFixed = false;
        return _this;
    }
    RangeHandle.prototype.onDrag = function (e) {
        var lastCellHovered = this.getLastCellHovered();
        if (!lastCellHovered) {
            return;
        }
        var cellRanges = this.rangeController.getCellRanges();
        var lastRange = ag_grid_community_1._.last(cellRanges);
        if (!this.rangeFixed) {
            this.fixRangeStartEnd(lastRange);
            this.rangeFixed = true;
        }
        var newEndRow = {
            rowIndex: lastCellHovered.rowIndex,
            rowPinned: lastCellHovered.rowPinned,
        };
        var rowChanged = !this.rowPositionUtils.sameRow(newEndRow, this.rangeController.getRangeEndRow(lastRange));
        if (cellRanges.length === 2 && rowChanged) {
            this.rangeController.updateRangeEnd({
                cellRange: cellRanges[0],
                cellPosition: __assign({}, newEndRow, { column: cellRanges[0].columns[0] })
            });
        }
        this.endPosition = __assign({}, newEndRow, { column: lastCellHovered.column });
        this.rangeController.extendLatestRangeToCell(this.endPosition);
    };
    RangeHandle.prototype.onDragEnd = function (e) {
        var cellRange = ag_grid_community_1._.last(this.rangeController.getCellRanges());
        this.fixRangeStartEnd(cellRange);
        this.rangeFixed = false;
    };
    RangeHandle.prototype.fixRangeStartEnd = function (cellRange) {
        var startRow = this.rangeController.getRangeStartRow(cellRange);
        var endRow = this.rangeController.getRangeEndRow(cellRange);
        var column = cellRange.columns[0];
        cellRange.startRow = startRow;
        cellRange.endRow = endRow;
        cellRange.startColumn = column;
    };
    RangeHandle.TEMPLATE = '<div class="ag-range-handle"></div>';
    return RangeHandle;
}(abstractSelectionHandle_1.AbstractSelectionHandle));
exports.RangeHandle = RangeHandle;
