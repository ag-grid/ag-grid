/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / Typescript / React / Angular / Vue
 * @version v28.2.0
 * @link https://www.ag-grid.com/
 * @license MIT
 */
import { includes, last } from "../../utils/array";
import { CellRangeType, SelectionHandleType } from "../../interfaces/IRangeService";
import { missing } from "../../utils/generic";
import { setAriaSelected } from "../../utils/aria";
var CSS_CELL_RANGE_SELECTED = 'ag-cell-range-selected';
var CSS_CELL_RANGE_CHART = 'ag-cell-range-chart';
var CSS_CELL_RANGE_SINGLE_CELL = 'ag-cell-range-single-cell';
var CSS_CELL_RANGE_CHART_CATEGORY = 'ag-cell-range-chart-category';
var CSS_CELL_RANGE_HANDLE = 'ag-cell-range-handle';
var CSS_CELL_RANGE_TOP = 'ag-cell-range-top';
var CSS_CELL_RANGE_RIGHT = 'ag-cell-range-right';
var CSS_CELL_RANGE_BOTTOM = 'ag-cell-range-bottom';
var CSS_CELL_RANGE_LEFT = 'ag-cell-range-left';
var CellRangeFeature = /** @class */ (function () {
    function CellRangeFeature(beans, ctrl) {
        this.beans = beans;
        this.cellCtrl = ctrl;
    }
    CellRangeFeature.prototype.setComp = function (cellComp, eGui) {
        this.cellComp = cellComp;
        this.eGui = eGui;
        this.onRangeSelectionChanged();
    };
    CellRangeFeature.prototype.onRangeSelectionChanged = function () {
        // when using reactUi, given UI is async, it's possible this method is called before the comp is registered
        if (!this.cellComp) {
            return;
        }
        this.rangeCount = this.beans.rangeService.getCellRangeCount(this.cellCtrl.getCellPosition());
        this.hasChartRange = this.getHasChartRange();
        this.cellComp.addOrRemoveCssClass(CSS_CELL_RANGE_SELECTED, this.rangeCount !== 0);
        this.cellComp.addOrRemoveCssClass(CSS_CELL_RANGE_SELECTED + "-1", this.rangeCount === 1);
        this.cellComp.addOrRemoveCssClass(CSS_CELL_RANGE_SELECTED + "-2", this.rangeCount === 2);
        this.cellComp.addOrRemoveCssClass(CSS_CELL_RANGE_SELECTED + "-3", this.rangeCount === 3);
        this.cellComp.addOrRemoveCssClass(CSS_CELL_RANGE_SELECTED + "-4", this.rangeCount >= 4);
        this.cellComp.addOrRemoveCssClass(CSS_CELL_RANGE_CHART, this.hasChartRange);
        setAriaSelected(this.eGui, this.rangeCount > 0 ? true : undefined);
        this.cellComp.addOrRemoveCssClass(CSS_CELL_RANGE_SINGLE_CELL, this.isSingleCell());
        this.updateRangeBorders();
        this.refreshHandle();
    };
    CellRangeFeature.prototype.updateRangeBorders = function () {
        var rangeBorders = this.getRangeBorders();
        var isSingleCell = this.isSingleCell();
        var isTop = !isSingleCell && rangeBorders.top;
        var isRight = !isSingleCell && rangeBorders.right;
        var isBottom = !isSingleCell && rangeBorders.bottom;
        var isLeft = !isSingleCell && rangeBorders.left;
        this.cellComp.addOrRemoveCssClass(CSS_CELL_RANGE_TOP, isTop);
        this.cellComp.addOrRemoveCssClass(CSS_CELL_RANGE_RIGHT, isRight);
        this.cellComp.addOrRemoveCssClass(CSS_CELL_RANGE_BOTTOM, isBottom);
        this.cellComp.addOrRemoveCssClass(CSS_CELL_RANGE_LEFT, isLeft);
    };
    CellRangeFeature.prototype.isSingleCell = function () {
        var rangeService = this.beans.rangeService;
        return this.rangeCount === 1 && rangeService && !rangeService.isMoreThanOneCell();
    };
    CellRangeFeature.prototype.getHasChartRange = function () {
        var rangeService = this.beans.rangeService;
        if (!this.rangeCount || !rangeService) {
            return false;
        }
        var cellRanges = rangeService.getCellRanges();
        return cellRanges.length > 0 && cellRanges.every(function (range) { return includes([CellRangeType.DIMENSION, CellRangeType.VALUE], range.type); });
    };
    CellRangeFeature.prototype.updateRangeBordersIfRangeCount = function () {
        // we only need to update range borders if we are in a range
        if (this.rangeCount > 0) {
            this.updateRangeBorders();
            this.refreshHandle();
        }
    };
    CellRangeFeature.prototype.getRangeBorders = function () {
        var _this = this;
        var isRtl = this.beans.gridOptionsWrapper.isEnableRtl();
        var top = false;
        var right = false;
        var bottom = false;
        var left = false;
        var thisCol = this.cellCtrl.getCellPosition().column;
        var _a = this.beans, rangeService = _a.rangeService, columnModel = _a.columnModel;
        var leftCol;
        var rightCol;
        if (isRtl) {
            leftCol = columnModel.getDisplayedColAfter(thisCol);
            rightCol = columnModel.getDisplayedColBefore(thisCol);
        }
        else {
            leftCol = columnModel.getDisplayedColBefore(thisCol);
            rightCol = columnModel.getDisplayedColAfter(thisCol);
        }
        var ranges = rangeService.getCellRanges().filter(function (range) { return rangeService.isCellInSpecificRange(_this.cellCtrl.getCellPosition(), range); });
        // this means we are the first column in the grid
        if (!leftCol) {
            left = true;
        }
        // this means we are the last column in the grid
        if (!rightCol) {
            right = true;
        }
        for (var i = 0; i < ranges.length; i++) {
            if (top && right && bottom && left) {
                break;
            }
            var range = ranges[i];
            var startRow = rangeService.getRangeStartRow(range);
            var endRow = rangeService.getRangeEndRow(range);
            if (!top && this.beans.rowPositionUtils.sameRow(startRow, this.cellCtrl.getCellPosition())) {
                top = true;
            }
            if (!bottom && this.beans.rowPositionUtils.sameRow(endRow, this.cellCtrl.getCellPosition())) {
                bottom = true;
            }
            if (!left && leftCol && range.columns.indexOf(leftCol) < 0) {
                left = true;
            }
            if (!right && rightCol && range.columns.indexOf(rightCol) < 0) {
                right = true;
            }
        }
        return { top: top, right: right, bottom: bottom, left: left };
    };
    CellRangeFeature.prototype.refreshHandle = function () {
        if (!this.beans.rangeService) {
            return;
        }
        var shouldHaveSelectionHandle = this.shouldHaveSelectionHandle();
        if (this.selectionHandle && !shouldHaveSelectionHandle) {
            this.selectionHandle = this.beans.context.destroyBean(this.selectionHandle);
        }
        if (shouldHaveSelectionHandle) {
            this.addSelectionHandle();
        }
        this.cellComp.addOrRemoveCssClass(CSS_CELL_RANGE_HANDLE, !!this.selectionHandle);
    };
    CellRangeFeature.prototype.shouldHaveSelectionHandle = function () {
        var _a = this.beans, gridOptionsWrapper = _a.gridOptionsWrapper, rangeService = _a.rangeService;
        var cellRanges = rangeService.getCellRanges();
        var rangesLen = cellRanges.length;
        if (this.rangeCount < 1 || rangesLen < 1) {
            return false;
        }
        var cellRange = last(cellRanges);
        var cellPosition = this.cellCtrl.getCellPosition();
        var isFillHandleAvailable = gridOptionsWrapper.isEnableFillHandle() && !this.cellCtrl.isSuppressFillHandle();
        var isRangeHandleAvailable = gridOptionsWrapper.isEnableRangeHandle();
        var handleIsAvailable = rangesLen === 1 && !this.cellCtrl.isEditing() && (isFillHandleAvailable || isRangeHandleAvailable);
        if (this.hasChartRange) {
            var hasCategoryRange = cellRanges[0].type === CellRangeType.DIMENSION;
            var isCategoryCell = hasCategoryRange && rangeService.isCellInSpecificRange(cellPosition, cellRanges[0]);
            this.cellComp.addOrRemoveCssClass(CSS_CELL_RANGE_CHART_CATEGORY, isCategoryCell);
            handleIsAvailable = cellRange.type === CellRangeType.VALUE;
        }
        return handleIsAvailable &&
            cellRange.endRow != null &&
            rangeService.isContiguousRange(cellRange) &&
            rangeService.isBottomRightCell(cellRange, cellPosition);
    };
    CellRangeFeature.prototype.addSelectionHandle = function () {
        var _a = this.beans, gridOptionsWrapper = _a.gridOptionsWrapper, rangeService = _a.rangeService;
        var cellRangeType = last(rangeService.getCellRanges()).type;
        var selectionHandleFill = gridOptionsWrapper.isEnableFillHandle() && missing(cellRangeType);
        var type = selectionHandleFill ? SelectionHandleType.FILL : SelectionHandleType.RANGE;
        if (this.selectionHandle && this.selectionHandle.getType() !== type) {
            this.selectionHandle = this.beans.context.destroyBean(this.selectionHandle);
        }
        if (!this.selectionHandle) {
            this.selectionHandle = this.beans.selectionHandleFactory.createSelectionHandle(type);
        }
        this.selectionHandle.refresh(this.cellCtrl);
    };
    CellRangeFeature.prototype.destroy = function () {
        this.beans.context.destroyBean(this.selectionHandle);
    };
    return CellRangeFeature;
}());
export { CellRangeFeature };
