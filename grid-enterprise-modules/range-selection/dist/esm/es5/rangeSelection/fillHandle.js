var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
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
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __spreadArray = (this && this.__spreadArray) || function (to, from) {
    for (var i = 0, il = from.length, j = to.length; i < il; i++, j++)
        to[j] = from[i];
    return to;
};
import { Autowired, Events, SelectionHandleType, _ } from '@ag-grid-community/core';
import { AbstractSelectionHandle } from "./abstractSelectionHandle";
import { findLineByLeastSquares } from './utils';
var FillHandle = /** @class */ (function (_super) {
    __extends(FillHandle, _super);
    function FillHandle() {
        var _this = _super.call(this, FillHandle.TEMPLATE) || this;
        _this.markedCells = [];
        _this.cellValues = [];
        _this.isUp = false;
        _this.isLeft = false;
        _this.isReduce = false;
        _this.type = SelectionHandleType.FILL;
        return _this;
    }
    FillHandle.prototype.updateValuesOnMove = function (e) {
        _super.prototype.updateValuesOnMove.call(this, e);
        if (!this.initialXY) {
            this.initialXY = this.mouseEventService.getNormalisedPosition(e);
        }
        var _a = this.initialXY, x = _a.x, y = _a.y;
        var _b = this.mouseEventService.getNormalisedPosition(e), newX = _b.x, newY = _b.y;
        var diffX = Math.abs(x - newX);
        var diffY = Math.abs(y - newY);
        var allowedDirection = this.getFillHandleDirection();
        var direction;
        if (allowedDirection === 'xy') {
            direction = diffX > diffY ? 'x' : 'y';
        }
        else {
            direction = allowedDirection;
        }
        if (direction !== this.dragAxis) {
            this.dragAxis = direction;
            this.changedCalculatedValues = true;
        }
    };
    FillHandle.prototype.onDrag = function (e) {
        if (!this.initialPosition) {
            var cellCtrl = this.getCellCtrl();
            if (!cellCtrl) {
                return;
            }
            this.initialPosition = cellCtrl.getCellPosition();
        }
        var lastCellHovered = this.getLastCellHovered();
        if (lastCellHovered) {
            this.markPathFrom(this.initialPosition, lastCellHovered);
        }
    };
    FillHandle.prototype.onDragEnd = function (e) {
        this.initialXY = null;
        if (!this.markedCells.length) {
            return;
        }
        var isX = this.dragAxis === 'x';
        var initialRange = this.getCellRange();
        var colLen = initialRange.columns.length;
        var rangeStartRow = this.getRangeStartRow();
        var rangeEndRow = this.getRangeEndRow();
        var finalRange;
        if (!this.isUp && !this.isLeft) {
            finalRange = this.rangeService.createCellRangeFromCellRangeParams({
                rowStartIndex: rangeStartRow.rowIndex,
                rowStartPinned: rangeStartRow.rowPinned,
                columnStart: initialRange.columns[0],
                rowEndIndex: isX ? rangeEndRow.rowIndex : this.lastCellMarked.rowIndex,
                rowEndPinned: isX ? rangeEndRow.rowPinned : this.lastCellMarked.rowPinned,
                columnEnd: isX ? this.lastCellMarked.column : initialRange.columns[colLen - 1]
            });
        }
        else {
            var startRow = isX ? rangeStartRow : this.lastCellMarked;
            finalRange = this.rangeService.createCellRangeFromCellRangeParams({
                rowStartIndex: startRow.rowIndex,
                rowStartPinned: startRow.rowPinned,
                columnStart: isX ? this.lastCellMarked.column : initialRange.columns[0],
                rowEndIndex: rangeEndRow.rowIndex,
                rowEndPinned: rangeEndRow.rowPinned,
                columnEnd: initialRange.columns[colLen - 1]
            });
        }
        if (finalRange) {
            // raising fill events for undo / redo
            this.raiseFillStartEvent();
            this.handleValueChanged(initialRange, finalRange, e);
            this.rangeService.setCellRanges([finalRange]);
            this.raiseFillEndEvent(initialRange, finalRange);
        }
    };
    FillHandle.prototype.getFillHandleDirection = function () {
        var direction = this.gridOptionsService.get('fillHandleDirection');
        if (!direction) {
            return 'xy';
        }
        if (direction !== 'x' && direction !== 'y' && direction !== 'xy') {
            _.doOnce(function () { return console.warn("AG Grid: valid values for fillHandleDirection are 'x', 'y' and 'xy'. Default to 'xy'."); }, 'warn invalid fill direction');
            return 'xy';
        }
        return direction;
    };
    FillHandle.prototype.raiseFillStartEvent = function () {
        var fillStartEvent = {
            type: Events.EVENT_FILL_START
        };
        this.eventService.dispatchEvent(fillStartEvent);
    };
    FillHandle.prototype.raiseFillEndEvent = function (initialRange, finalRange) {
        var fillEndEvent = {
            type: Events.EVENT_FILL_END,
            initialRange: initialRange,
            finalRange: finalRange
        };
        this.eventService.dispatchEvent(fillEndEvent);
    };
    FillHandle.prototype.handleValueChanged = function (initialRange, finalRange, e) {
        var _this = this;
        var initialRangeEndRow = this.rangeService.getRangeEndRow(initialRange);
        var initialRangeStartRow = this.rangeService.getRangeStartRow(initialRange);
        var finalRangeEndRow = this.rangeService.getRangeEndRow(finalRange);
        var finalRangeStartRow = this.rangeService.getRangeStartRow(finalRange);
        var isVertical = this.dragAxis === 'y';
        // if the range is being reduced in size, all we need to do is
        // clear the cells that are no longer part of the range
        if (this.isReduce && !this.gridOptionsService.is('suppressClearOnFillReduction')) {
            var columns = isVertical
                ? initialRange.columns
                : initialRange.columns.filter(function (col) { return finalRange.columns.indexOf(col) < 0; });
            var startRow = isVertical ? this.cellNavigationService.getRowBelow(finalRangeEndRow) : finalRangeStartRow;
            if (startRow) {
                this.clearCellsInRange(startRow, initialRangeEndRow, columns);
            }
            return;
        }
        var withinInitialRange = true;
        var values = [];
        var initialValues = [];
        var idx = 0;
        var resetValues = function () {
            values.length = 0;
            initialValues.length = 0;
            idx = 0;
        };
        var iterateAcrossCells = function (column, columns) {
            var currentRow = _this.isUp ? initialRangeEndRow : initialRangeStartRow;
            var finished = false;
            if (isVertical) {
                withinInitialRange = true;
                resetValues();
            }
            var _loop_1 = function () {
                var rowNode = _this.rowPositionUtils.getRowNode(currentRow);
                if (!rowNode) {
                    return "break";
                }
                if (isVertical && column) {
                    fillValues(values, column, rowNode, function () {
                        return !_this.rowPositionUtils.sameRow(currentRow, _this.isUp ? initialRangeStartRow : initialRangeEndRow);
                    });
                }
                else if (columns) {
                    withinInitialRange = true;
                    resetValues();
                    columns.forEach(function (col) { return fillValues(values, col, rowNode, function () { return col !== (_this.isLeft ? initialRange.columns[0] : _.last(initialRange.columns)); }); });
                }
                finished = _this.rowPositionUtils.sameRow(currentRow, _this.isUp ? finalRangeStartRow : finalRangeEndRow);
                currentRow = _this.isUp
                    ? _this.cellNavigationService.getRowAbove(currentRow)
                    : _this.cellNavigationService.getRowBelow(currentRow);
            };
            while (!finished && currentRow) {
                var state_1 = _loop_1();
                if (state_1 === "break")
                    break;
            }
        };
        var fillValues = function (currentValues, col, rowNode, updateInitialSet) {
            var _a, _b;
            var currentValue;
            var skipValue = false;
            if (withinInitialRange) {
                currentValue = _this.valueService.getValue(col, rowNode);
                initialValues.push(currentValue);
                withinInitialRange = updateInitialSet();
            }
            else {
                var _c = _this.processValues(e, currentValues, initialValues, col, rowNode, idx++), value = _c.value, fromUserFunction = _c.fromUserFunction, sourceCol = _c.sourceCol, sourceRowNode = _c.sourceRowNode;
                currentValue = value;
                if (col.isCellEditable(rowNode)) {
                    var cellValue = _this.valueService.getValue(col, rowNode);
                    if (!fromUserFunction) {
                        if ((_a = sourceCol === null || sourceCol === void 0 ? void 0 : sourceCol.getColDef()) === null || _a === void 0 ? void 0 : _a.useValueFormatterForExport) {
                            currentValue = (_b = _this.valueFormatterService.formatValue(sourceCol, sourceRowNode, currentValue)) !== null && _b !== void 0 ? _b : currentValue;
                        }
                        if (col.getColDef().useValueParserForImport) {
                            currentValue = _this.valueParserService.parseValue(col, rowNode, 
                            // if no sourceCol, then currentValue is a number
                            sourceCol ? currentValue : _.toStringOrNull(currentValue), cellValue);
                        }
                    }
                    if (!fromUserFunction || cellValue !== currentValue) {
                        rowNode.setDataValue(col, currentValue, 'rangeService');
                    }
                    else {
                        skipValue = true;
                    }
                }
            }
            if (!skipValue) {
                currentValues.push({
                    value: currentValue,
                    column: col,
                    rowNode: rowNode
                });
            }
        };
        if (isVertical) {
            initialRange.columns.forEach(function (col) {
                iterateAcrossCells(col);
            });
        }
        else {
            var columns = this.isLeft ? __spreadArray([], __read(finalRange.columns)).reverse() : finalRange.columns;
            iterateAcrossCells(undefined, columns);
        }
    };
    FillHandle.prototype.clearCellsInRange = function (startRow, endRow, columns) {
        var cellRange = {
            startRow: startRow,
            endRow: endRow,
            columns: columns,
            startColumn: columns[0]
        };
        this.rangeService.clearCellRangeCellValues({ cellRanges: [cellRange] });
    };
    FillHandle.prototype.processValues = function (event, values, initialValues, col, rowNode, idx) {
        var userFillOperation = this.gridOptionsService.getCallback('fillOperation');
        var isVertical = this.dragAxis === 'y';
        var direction;
        if (isVertical) {
            direction = this.isUp ? 'up' : 'down';
        }
        else {
            direction = this.isLeft ? 'left' : 'right';
        }
        if (userFillOperation) {
            var params = {
                event: event,
                values: values.map(function (_a) {
                    var value = _a.value;
                    return value;
                }),
                initialValues: initialValues,
                currentIndex: idx,
                currentCellValue: this.valueService.getValue(col, rowNode),
                direction: direction,
                column: col,
                rowNode: rowNode
            };
            var userResult = userFillOperation(params);
            if (userResult !== false) {
                return { value: userResult, fromUserFunction: true };
            }
        }
        var allNumbers = !values.some(function (_a) {
            var value = _a.value;
            var asFloat = parseFloat(value);
            return isNaN(asFloat) || asFloat.toString() !== value.toString();
        });
        // values should be copied in order if the alt key is pressed
        // or if the values contain strings and numbers
        // However, if we only have one initial value selected, and that
        // value is a number and we are also pressing alt, then we should
        // increment or decrement the value by 1 based on direction.
        if (event.altKey || !allNumbers) {
            if (allNumbers && initialValues.length === 1) {
                var multiplier = (this.isUp || this.isLeft) ? -1 : 1;
                return { value: parseFloat(_.last(values).value) + 1 * multiplier, fromUserFunction: false };
            }
            var _a = values[idx % values.length], value = _a.value, sourceCol = _a.column, sourceRowNode = _a.rowNode;
            return { value: value, fromUserFunction: false, sourceCol: sourceCol, sourceRowNode: sourceRowNode };
        }
        return { value: _.last(findLineByLeastSquares(values.map(function (_a) {
                var value = _a.value;
                return Number(value);
            }))), fromUserFunction: false };
    };
    FillHandle.prototype.clearValues = function () {
        this.clearMarkedPath();
        this.clearCellValues();
        this.lastCellMarked = undefined;
        _super.prototype.clearValues.call(this);
    };
    FillHandle.prototype.clearMarkedPath = function () {
        this.markedCells.forEach(function (cell) {
            if (!cell.isAlive()) {
                return;
            }
            var comp = cell.getComp();
            comp.addOrRemoveCssClass('ag-selection-fill-top', false);
            comp.addOrRemoveCssClass('ag-selection-fill-right', false);
            comp.addOrRemoveCssClass('ag-selection-fill-bottom', false);
            comp.addOrRemoveCssClass('ag-selection-fill-left', false);
        });
        this.markedCells.length = 0;
        this.isUp = false;
        this.isLeft = false;
        this.isReduce = false;
    };
    FillHandle.prototype.clearCellValues = function () {
        this.cellValues.length = 0;
    };
    FillHandle.prototype.markPathFrom = function (initialPosition, currentPosition) {
        this.clearMarkedPath();
        this.clearCellValues();
        if (this.dragAxis === 'y') {
            if (this.rowPositionUtils.sameRow(currentPosition, initialPosition)) {
                return;
            }
            var isBefore = this.rowPositionUtils.before(currentPosition, initialPosition);
            var rangeStartRow = this.getRangeStartRow();
            var rangeEndRow = this.getRangeEndRow();
            if (isBefore && ((currentPosition.rowPinned == rangeStartRow.rowPinned &&
                currentPosition.rowIndex >= rangeStartRow.rowIndex) ||
                (rangeStartRow.rowPinned != rangeEndRow.rowPinned &&
                    currentPosition.rowPinned == rangeEndRow.rowPinned &&
                    currentPosition.rowIndex <= rangeEndRow.rowIndex))) {
                this.reduceVertical(initialPosition, currentPosition);
                this.isReduce = true;
            }
            else {
                this.extendVertical(initialPosition, currentPosition, isBefore);
                this.isReduce = false;
            }
        }
        else {
            var initialColumn = initialPosition.column;
            var currentColumn = currentPosition.column;
            if (initialColumn === currentColumn) {
                return;
            }
            var displayedColumns = this.columnModel.getAllDisplayedColumns();
            var initialIndex = displayedColumns.indexOf(initialColumn);
            var currentIndex = displayedColumns.indexOf(currentColumn);
            if (currentIndex <= initialIndex && currentIndex >= displayedColumns.indexOf(this.getCellRange().columns[0])) {
                this.reduceHorizontal(initialPosition, currentPosition);
                this.isReduce = true;
            }
            else {
                this.extendHorizontal(initialPosition, currentPosition, currentIndex < initialIndex);
                this.isReduce = false;
            }
        }
        this.lastCellMarked = currentPosition;
    };
    FillHandle.prototype.extendVertical = function (initialPosition, endPosition, isMovingUp) {
        var _a = this, navigationService = _a.navigationService, rangeService = _a.rangeService;
        var row = initialPosition;
        do {
            var cellRange = this.getCellRange();
            var colLen = cellRange.columns.length;
            for (var i = 0; i < colLen; i++) {
                var column = cellRange.columns[i];
                var rowPos = { rowIndex: row.rowIndex, rowPinned: row.rowPinned };
                var cellPos = __assign(__assign({}, rowPos), { column: column });
                var cellInRange = rangeService.isCellInSpecificRange(cellPos, cellRange);
                var isInitialRow = this.rowPositionUtils.sameRow(row, initialPosition);
                if (isMovingUp) {
                    this.isUp = true;
                }
                if (!isInitialRow) {
                    var cell = navigationService.getCellByPosition(cellPos);
                    if (cell) {
                        this.markedCells.push(cell);
                        var cellCtrl = cell.getComp();
                        if (!cellInRange) {
                            cellCtrl.addOrRemoveCssClass('ag-selection-fill-left', i === 0);
                            cellCtrl.addOrRemoveCssClass('ag-selection-fill-right', i === colLen - 1);
                        }
                        cellCtrl.addOrRemoveCssClass(isMovingUp ? 'ag-selection-fill-top' : 'ag-selection-fill-bottom', this.rowPositionUtils.sameRow(row, endPosition));
                    }
                }
            }
            if (this.rowPositionUtils.sameRow(row, endPosition)) {
                break;
            }
        } while (
        // tslint:disable-next-line
        row = isMovingUp
            ? this.cellNavigationService.getRowAbove(row)
            : this.cellNavigationService.getRowBelow(row));
    };
    FillHandle.prototype.reduceVertical = function (initialPosition, endPosition) {
        var row = initialPosition;
        do {
            var cellRange = this.getCellRange();
            var colLen = cellRange.columns.length;
            var isLastRow = this.rowPositionUtils.sameRow(row, endPosition);
            for (var i = 0; i < colLen; i++) {
                var rowPos = { rowIndex: row.rowIndex, rowPinned: row.rowPinned };
                var celPos = __assign(__assign({}, rowPos), { column: cellRange.columns[i] });
                var cell = this.navigationService.getCellByPosition(celPos);
                if (cell) {
                    this.markedCells.push(cell);
                    var cellComp = cell.getComp();
                    cellComp.addOrRemoveCssClass('ag-selection-fill-bottom', this.rowPositionUtils.sameRow(row, endPosition));
                }
            }
            if (isLastRow) {
                break;
            }
            // tslint:disable-next-line
        } while (row = this.cellNavigationService.getRowAbove(row));
    };
    FillHandle.prototype.extendHorizontal = function (initialPosition, endPosition, isMovingLeft) {
        var _this = this;
        var allCols = this.columnModel.getAllDisplayedColumns();
        var startCol = allCols.indexOf(isMovingLeft ? endPosition.column : initialPosition.column);
        var endCol = allCols.indexOf(isMovingLeft ? this.getCellRange().columns[0] : endPosition.column);
        var offset = isMovingLeft ? 0 : 1;
        var colsToMark = allCols.slice(startCol + offset, endCol + offset);
        var rangeStartRow = this.getRangeStartRow();
        var rangeEndRow = this.getRangeEndRow();
        colsToMark.forEach(function (column) {
            var row = rangeStartRow;
            var isLastRow = false;
            do {
                isLastRow = _this.rowPositionUtils.sameRow(row, rangeEndRow);
                var cell = _this.navigationService.getCellByPosition({
                    rowIndex: row.rowIndex,
                    rowPinned: row.rowPinned,
                    column: column
                });
                if (cell) {
                    _this.markedCells.push(cell);
                    var cellComp = cell.getComp();
                    cellComp.addOrRemoveCssClass('ag-selection-fill-top', _this.rowPositionUtils.sameRow(row, rangeStartRow));
                    cellComp.addOrRemoveCssClass('ag-selection-fill-bottom', _this.rowPositionUtils.sameRow(row, rangeEndRow));
                    if (isMovingLeft) {
                        _this.isLeft = true;
                        cellComp.addOrRemoveCssClass('ag-selection-fill-left', column === colsToMark[0]);
                    }
                    else {
                        cellComp.addOrRemoveCssClass('ag-selection-fill-right', column === _.last(colsToMark));
                    }
                }
                row = _this.cellNavigationService.getRowBelow(row);
            } while (!isLastRow);
        });
    };
    FillHandle.prototype.reduceHorizontal = function (initialPosition, endPosition) {
        var _this = this;
        var allCols = this.columnModel.getAllDisplayedColumns();
        var startCol = allCols.indexOf(endPosition.column);
        var endCol = allCols.indexOf(initialPosition.column);
        var colsToMark = allCols.slice(startCol, endCol);
        var rangeStartRow = this.getRangeStartRow();
        var rangeEndRow = this.getRangeEndRow();
        colsToMark.forEach(function (column) {
            var row = rangeStartRow;
            var isLastRow = false;
            do {
                isLastRow = _this.rowPositionUtils.sameRow(row, rangeEndRow);
                var cell = _this.navigationService.getCellByPosition({
                    rowIndex: row.rowIndex,
                    rowPinned: row.rowPinned,
                    column: column
                });
                if (cell) {
                    _this.markedCells.push(cell);
                    var cellComp = cell.getComp();
                    cellComp.addOrRemoveCssClass('ag-selection-fill-right', column === colsToMark[0]);
                }
                row = _this.cellNavigationService.getRowBelow(row);
            } while (!isLastRow);
        });
    };
    FillHandle.prototype.refresh = function (cellCtrl) {
        var cellRange = this.rangeService.getCellRanges()[0];
        var isColumnRange = !cellRange.startRow || !cellRange.endRow;
        if (isColumnRange) {
            this.destroy();
            return;
        }
        _super.prototype.refresh.call(this, cellCtrl);
    };
    FillHandle.TEMPLATE = "<div class=\"ag-fill-handle\"></div>";
    __decorate([
        Autowired('valueService')
    ], FillHandle.prototype, "valueService", void 0);
    __decorate([
        Autowired('valueParserService')
    ], FillHandle.prototype, "valueParserService", void 0);
    __decorate([
        Autowired('valueFormatterService')
    ], FillHandle.prototype, "valueFormatterService", void 0);
    return FillHandle;
}(AbstractSelectionHandle));
export { FillHandle };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmlsbEhhbmRsZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9yYW5nZVNlbGVjdGlvbi9maWxsSGFuZGxlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUEsT0FBTyxFQUNILFNBQVMsRUFPVCxNQUFNLEVBR04sbUJBQW1CLEVBQ25CLENBQUMsRUFLSixNQUFNLHlCQUF5QixDQUFDO0FBQ2pDLE9BQU8sRUFBRSx1QkFBdUIsRUFBRSxNQUFNLDJCQUEyQixDQUFDO0FBQ3BFLE9BQU8sRUFBRSxzQkFBc0IsRUFBRSxNQUFNLFNBQVMsQ0FBQztBQWVqRDtJQUFnQyw4QkFBdUI7SUFxQm5EO1FBQUEsWUFDSSxrQkFBTSxVQUFVLENBQUMsUUFBUSxDQUFDLFNBQzdCO1FBWk8saUJBQVcsR0FBZSxFQUFFLENBQUM7UUFDN0IsZ0JBQVUsR0FBbUIsRUFBRSxDQUFDO1FBR2hDLFVBQUksR0FBWSxLQUFLLENBQUM7UUFDdEIsWUFBTSxHQUFZLEtBQUssQ0FBQztRQUN4QixjQUFRLEdBQVksS0FBSyxDQUFDO1FBRXhCLFVBQUksR0FBRyxtQkFBbUIsQ0FBQyxJQUFJLENBQUM7O0lBSTFDLENBQUM7SUFFUyx1Q0FBa0IsR0FBNUIsVUFBNkIsQ0FBYTtRQUN0QyxpQkFBTSxrQkFBa0IsWUFBQyxDQUFDLENBQUMsQ0FBQztRQUU1QixJQUFJLENBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRTtZQUNqQixJQUFJLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDLENBQUMsQ0FBQztTQUNwRTtRQUVLLElBQUEsS0FBVyxJQUFJLENBQUMsU0FBUyxFQUF2QixDQUFDLE9BQUEsRUFBRSxDQUFDLE9BQW1CLENBQUM7UUFDMUIsSUFBQSxLQUF1QixJQUFJLENBQUMsaUJBQWlCLENBQUMscUJBQXFCLENBQUMsQ0FBQyxDQUFDLEVBQWpFLElBQUksT0FBQSxFQUFLLElBQUksT0FBb0QsQ0FBQztRQUM3RSxJQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQztRQUNqQyxJQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQztRQUNqQyxJQUFNLGdCQUFnQixHQUFHLElBQUksQ0FBQyxzQkFBc0IsRUFBRSxDQUFDO1FBQ3ZELElBQUksU0FBb0IsQ0FBQztRQUV6QixJQUFJLGdCQUFnQixLQUFLLElBQUksRUFBRTtZQUMzQixTQUFTLEdBQUcsS0FBSyxHQUFHLEtBQUssQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUM7U0FDekM7YUFBTTtZQUNILFNBQVMsR0FBRyxnQkFBZ0IsQ0FBQztTQUNoQztRQUVELElBQUksU0FBUyxLQUFLLElBQUksQ0FBQyxRQUFRLEVBQUU7WUFDN0IsSUFBSSxDQUFDLFFBQVEsR0FBRyxTQUFTLENBQUM7WUFDMUIsSUFBSSxDQUFDLHVCQUF1QixHQUFHLElBQUksQ0FBQztTQUN2QztJQUNMLENBQUM7SUFFUywyQkFBTSxHQUFoQixVQUFpQixDQUFhO1FBQzFCLElBQUksQ0FBQyxJQUFJLENBQUMsZUFBZSxFQUFFO1lBQ3ZCLElBQU0sUUFBUSxHQUFHLElBQUksQ0FBQyxXQUFXLEVBQUUsQ0FBQztZQUNwQyxJQUFJLENBQUMsUUFBUSxFQUFFO2dCQUFFLE9BQU87YUFBRTtZQUUxQixJQUFJLENBQUMsZUFBZSxHQUFHLFFBQVEsQ0FBQyxlQUFlLEVBQUUsQ0FBQztTQUNyRDtRQUVELElBQU0sZUFBZSxHQUFHLElBQUksQ0FBQyxrQkFBa0IsRUFBRSxDQUFDO1FBRWxELElBQUksZUFBZSxFQUFFO1lBQ2pCLElBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLGVBQWUsRUFBRSxlQUFlLENBQUMsQ0FBQztTQUM1RDtJQUNMLENBQUM7SUFFUyw4QkFBUyxHQUFuQixVQUFvQixDQUFhO1FBQzdCLElBQUksQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFDO1FBQ3RCLElBQUksQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLE1BQU0sRUFBRTtZQUFFLE9BQU87U0FBRTtRQUV6QyxJQUFNLEdBQUcsR0FBRyxJQUFJLENBQUMsUUFBUSxLQUFLLEdBQUcsQ0FBQztRQUNsQyxJQUFNLFlBQVksR0FBRyxJQUFJLENBQUMsWUFBWSxFQUFFLENBQUM7UUFDekMsSUFBTSxNQUFNLEdBQUcsWUFBWSxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUM7UUFDM0MsSUFBTSxhQUFhLEdBQUcsSUFBSSxDQUFDLGdCQUFnQixFQUFFLENBQUM7UUFDOUMsSUFBTSxXQUFXLEdBQUcsSUFBSSxDQUFDLGNBQWMsRUFBRSxDQUFDO1FBRTFDLElBQUksVUFBaUMsQ0FBQztRQUV0QyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUU7WUFDNUIsVUFBVSxHQUFHLElBQUksQ0FBQyxZQUFZLENBQUMsa0NBQWtDLENBQUM7Z0JBQzlELGFBQWEsRUFBRSxhQUFhLENBQUMsUUFBUTtnQkFDckMsY0FBYyxFQUFFLGFBQWEsQ0FBQyxTQUFTO2dCQUN2QyxXQUFXLEVBQUUsWUFBWSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUM7Z0JBQ3BDLFdBQVcsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLFdBQVcsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxjQUFlLENBQUMsUUFBUTtnQkFDdkUsWUFBWSxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsV0FBVyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLGNBQWUsQ0FBQyxTQUFTO2dCQUMxRSxTQUFTLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsY0FBZSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsWUFBWSxDQUFDLE9BQU8sQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDO2FBQ2xGLENBQUMsQ0FBQztTQUNOO2FBQU07WUFDSCxJQUFNLFFBQVEsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLGFBQWEsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQztZQUUzRCxVQUFVLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQyxrQ0FBa0MsQ0FBQztnQkFDOUQsYUFBYSxFQUFFLFFBQVMsQ0FBQyxRQUFRO2dCQUNqQyxjQUFjLEVBQUUsUUFBUyxDQUFDLFNBQVM7Z0JBQ25DLFdBQVcsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxjQUFlLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxZQUFZLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQztnQkFDeEUsV0FBVyxFQUFFLFdBQVcsQ0FBQyxRQUFRO2dCQUNqQyxZQUFZLEVBQUUsV0FBVyxDQUFDLFNBQVM7Z0JBQ25DLFNBQVMsRUFBRSxZQUFZLENBQUMsT0FBTyxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUM7YUFDOUMsQ0FBQyxDQUFDO1NBQ047UUFFRCxJQUFJLFVBQVUsRUFBRTtZQUNaLHNDQUFzQztZQUN0QyxJQUFJLENBQUMsbUJBQW1CLEVBQUUsQ0FBQztZQUUzQixJQUFJLENBQUMsa0JBQWtCLENBQUMsWUFBWSxFQUFFLFVBQVUsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUNyRCxJQUFJLENBQUMsWUFBWSxDQUFDLGFBQWEsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUM7WUFFOUMsSUFBSSxDQUFDLGlCQUFpQixDQUFDLFlBQVksRUFBRSxVQUFVLENBQUMsQ0FBQztTQUNwRDtJQUNMLENBQUM7SUFFTywyQ0FBc0IsR0FBOUI7UUFDSSxJQUFNLFNBQVMsR0FBRyxJQUFJLENBQUMsa0JBQWtCLENBQUMsR0FBRyxDQUFDLHFCQUFxQixDQUFDLENBQUM7UUFFckUsSUFBSSxDQUFDLFNBQVMsRUFBRTtZQUFFLE9BQU8sSUFBSSxDQUFDO1NBQUU7UUFFaEMsSUFBSSxTQUFTLEtBQUssR0FBRyxJQUFJLFNBQVMsS0FBSyxHQUFHLElBQUksU0FBUyxLQUFLLElBQUksRUFBRTtZQUM5RCxDQUFDLENBQUMsTUFBTSxDQUFDLGNBQU0sT0FBQSxPQUFPLENBQUMsSUFBSSxDQUFDLHVGQUF1RixDQUFDLEVBQXJHLENBQXFHLEVBQUUsNkJBQTZCLENBQUMsQ0FBQztZQUNySixPQUFPLElBQUksQ0FBQztTQUNmO1FBRUQsT0FBTyxTQUFTLENBQUM7SUFDckIsQ0FBQztJQUVPLHdDQUFtQixHQUEzQjtRQUNJLElBQU0sY0FBYyxHQUFzQztZQUN0RCxJQUFJLEVBQUUsTUFBTSxDQUFDLGdCQUFnQjtTQUNoQyxDQUFDO1FBQ0YsSUFBSSxDQUFDLFlBQVksQ0FBQyxhQUFhLENBQUMsY0FBYyxDQUFDLENBQUM7SUFDcEQsQ0FBQztJQUVPLHNDQUFpQixHQUF6QixVQUEwQixZQUF1QixFQUFFLFVBQXFCO1FBQ3BFLElBQU0sWUFBWSxHQUFvQztZQUNsRCxJQUFJLEVBQUUsTUFBTSxDQUFDLGNBQWM7WUFDM0IsWUFBWSxFQUFFLFlBQVk7WUFDMUIsVUFBVSxFQUFFLFVBQVU7U0FDekIsQ0FBQztRQUNGLElBQUksQ0FBQyxZQUFZLENBQUMsYUFBYSxDQUFDLFlBQVksQ0FBQyxDQUFDO0lBQ2xELENBQUM7SUFFTyx1Q0FBa0IsR0FBMUIsVUFBMkIsWUFBdUIsRUFBRSxVQUFxQixFQUFFLENBQWE7UUFBeEYsaUJBc0hDO1FBckhHLElBQU0sa0JBQWtCLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQyxjQUFjLENBQUMsWUFBWSxDQUFDLENBQUM7UUFDMUUsSUFBTSxvQkFBb0IsR0FBRyxJQUFJLENBQUMsWUFBWSxDQUFDLGdCQUFnQixDQUFDLFlBQVksQ0FBQyxDQUFDO1FBQzlFLElBQU0sZ0JBQWdCLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQyxjQUFjLENBQUMsVUFBVSxDQUFDLENBQUM7UUFDdEUsSUFBTSxrQkFBa0IsR0FBRyxJQUFJLENBQUMsWUFBWSxDQUFDLGdCQUFnQixDQUFDLFVBQVUsQ0FBQyxDQUFDO1FBQzFFLElBQU0sVUFBVSxHQUFHLElBQUksQ0FBQyxRQUFRLEtBQUssR0FBRyxDQUFDO1FBRXpDLDhEQUE4RDtRQUM5RCx1REFBdUQ7UUFDdkQsSUFBSSxJQUFJLENBQUMsUUFBUSxJQUFJLENBQUMsSUFBSSxDQUFDLGtCQUFrQixDQUFDLEVBQUUsQ0FBQyw4QkFBOEIsQ0FBQyxFQUFFO1lBQzlFLElBQU0sT0FBTyxHQUFHLFVBQVU7Z0JBQ3RCLENBQUMsQ0FBQyxZQUFZLENBQUMsT0FBTztnQkFDdEIsQ0FBQyxDQUFDLFlBQVksQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLFVBQUEsR0FBRyxJQUFJLE9BQUEsVUFBVSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxFQUFuQyxDQUFtQyxDQUFDLENBQUM7WUFFOUUsSUFBTSxRQUFRLEdBQUcsVUFBVSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMscUJBQXFCLENBQUMsV0FBVyxDQUFDLGdCQUFnQixDQUFDLENBQUMsQ0FBQyxDQUFDLGtCQUFrQixDQUFDO1lBRTVHLElBQUksUUFBUSxFQUFFO2dCQUNWLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxRQUFRLEVBQUUsa0JBQWtCLEVBQUUsT0FBTyxDQUFDLENBQUM7YUFDakU7WUFDRCxPQUFPO1NBQ1Y7UUFFRCxJQUFJLGtCQUFrQixHQUFHLElBQUksQ0FBQztRQUM5QixJQUFNLE1BQU0sR0FBbUIsRUFBRSxDQUFDO1FBQ2xDLElBQU0sYUFBYSxHQUFVLEVBQUUsQ0FBQztRQUNoQyxJQUFJLEdBQUcsR0FBRyxDQUFDLENBQUM7UUFFWixJQUFNLFdBQVcsR0FBRztZQUNoQixNQUFNLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQztZQUNsQixhQUFhLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQztZQUN6QixHQUFHLEdBQUcsQ0FBQyxDQUFDO1FBQ1osQ0FBQyxDQUFDO1FBRUYsSUFBTSxrQkFBa0IsR0FBRyxVQUFDLE1BQWUsRUFBRSxPQUFrQjtZQUMzRCxJQUFJLFVBQVUsR0FBbUMsS0FBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsa0JBQWtCLENBQUMsQ0FBQyxDQUFDLG9CQUFvQixDQUFDO1lBQ3ZHLElBQUksUUFBUSxHQUFHLEtBQUssQ0FBQztZQUVyQixJQUFJLFVBQVUsRUFBRTtnQkFDWixrQkFBa0IsR0FBRyxJQUFJLENBQUM7Z0JBQzFCLFdBQVcsRUFBRSxDQUFDO2FBQ2pCOztnQkFHRyxJQUFNLE9BQU8sR0FBRyxLQUFJLENBQUMsZ0JBQWdCLENBQUMsVUFBVSxDQUFDLFVBQVUsQ0FBQyxDQUFDO2dCQUM3RCxJQUFJLENBQUMsT0FBTyxFQUFFOztpQkFBVTtnQkFFeEIsSUFBSSxVQUFVLElBQUksTUFBTSxFQUFFO29CQUN0QixVQUFVLENBQUMsTUFBTSxFQUFFLE1BQU0sRUFBRSxPQUFPLEVBQUU7d0JBQ2hDLE9BQU8sQ0FBQyxLQUFJLENBQUMsZ0JBQWdCLENBQUMsT0FBTyxDQUFDLFVBQVcsRUFBRSxLQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDLENBQUMsa0JBQWtCLENBQUMsQ0FBQztvQkFDOUcsQ0FBQyxDQUFDLENBQUM7aUJBQ047cUJBQU0sSUFBSSxPQUFPLEVBQUU7b0JBQ2hCLGtCQUFrQixHQUFHLElBQUksQ0FBQztvQkFDMUIsV0FBVyxFQUFFLENBQUM7b0JBQ2QsT0FBTyxDQUFDLE9BQU8sQ0FBQyxVQUFBLEdBQUcsSUFBSSxPQUFBLFVBQVUsQ0FDN0IsTUFBTSxFQUFFLEdBQUcsRUFBRSxPQUFPLEVBQUUsY0FBTSxPQUFBLEdBQUcsS0FBSyxDQUFDLEtBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLFlBQVksQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLE9BQU8sQ0FBQyxDQUFDLEVBQTlFLENBQThFLENBQUMsRUFEeEYsQ0FDd0YsQ0FBQyxDQUFDO2lCQUNwSDtnQkFFRCxRQUFRLEdBQUcsS0FBSSxDQUFDLGdCQUFnQixDQUFDLE9BQU8sQ0FBQyxVQUFVLEVBQUUsS0FBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsa0JBQWtCLENBQUMsQ0FBQyxDQUFDLGdCQUFnQixDQUFDLENBQUM7Z0JBRXhHLFVBQVUsR0FBRyxLQUFJLENBQUMsSUFBSTtvQkFDbEIsQ0FBQyxDQUFDLEtBQUksQ0FBQyxxQkFBcUIsQ0FBQyxXQUFXLENBQUMsVUFBVSxDQUFDO29CQUNwRCxDQUFDLENBQUMsS0FBSSxDQUFDLHFCQUFxQixDQUFDLFdBQVcsQ0FBQyxVQUFVLENBQUMsQ0FBQzs7WUFuQjdELE9BQU8sQ0FBQyxRQUFRLElBQUksVUFBVTs7OzthQW9CN0I7UUFDTCxDQUFDLENBQUM7UUFFRixJQUFNLFVBQVUsR0FBRyxVQUFDLGFBQTZCLEVBQUUsR0FBVyxFQUFFLE9BQWdCLEVBQUUsZ0JBQStCOztZQUM3RyxJQUFJLFlBQWlCLENBQUM7WUFDdEIsSUFBSSxTQUFTLEdBQVksS0FBSyxDQUFDO1lBRS9CLElBQUksa0JBQWtCLEVBQUU7Z0JBQ3BCLFlBQVksR0FBRyxLQUFJLENBQUMsWUFBWSxDQUFDLFFBQVEsQ0FBQyxHQUFHLEVBQUUsT0FBTyxDQUFDLENBQUM7Z0JBQ3hELGFBQWEsQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUM7Z0JBQ2pDLGtCQUFrQixHQUFHLGdCQUFnQixFQUFFLENBQUM7YUFDM0M7aUJBQU07Z0JBQ0csSUFBQSxLQUF3RCxLQUFJLENBQUMsYUFBYSxDQUFDLENBQUMsRUFBRSxhQUFhLEVBQUUsYUFBYSxFQUFFLEdBQUcsRUFBRSxPQUFPLEVBQUUsR0FBRyxFQUFFLENBQUMsRUFBOUgsS0FBSyxXQUFBLEVBQUUsZ0JBQWdCLHNCQUFBLEVBQUUsU0FBUyxlQUFBLEVBQUUsYUFBYSxtQkFBNkUsQ0FBQztnQkFDdkksWUFBWSxHQUFHLEtBQUssQ0FBQztnQkFDckIsSUFBSSxHQUFHLENBQUMsY0FBYyxDQUFDLE9BQU8sQ0FBQyxFQUFFO29CQUM3QixJQUFNLFNBQVMsR0FBRyxLQUFJLENBQUMsWUFBWSxDQUFDLFFBQVEsQ0FBQyxHQUFHLEVBQUUsT0FBTyxDQUFDLENBQUM7b0JBRTNELElBQUksQ0FBQyxnQkFBZ0IsRUFBRTt3QkFDbkIsSUFBSSxNQUFBLFNBQVMsYUFBVCxTQUFTLHVCQUFULFNBQVMsQ0FBRSxTQUFTLEVBQUUsMENBQUUsMEJBQTBCLEVBQUU7NEJBQ3BELFlBQVksR0FBRyxNQUFBLEtBQUksQ0FBQyxxQkFBcUIsQ0FBQyxXQUFXLENBQUMsU0FBUyxFQUFFLGFBQWMsRUFBRSxZQUFZLENBQUMsbUNBQUksWUFBWSxDQUFDO3lCQUNsSDt3QkFDRCxJQUFJLEdBQUcsQ0FBQyxTQUFTLEVBQUUsQ0FBQyx1QkFBdUIsRUFBRTs0QkFDekMsWUFBWSxHQUFHLEtBQUksQ0FBQyxrQkFBa0IsQ0FBQyxVQUFVLENBQzdDLEdBQUcsRUFDSCxPQUFPOzRCQUNQLGlEQUFpRDs0QkFDakQsU0FBUyxDQUFDLENBQUMsQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxjQUFjLENBQUMsWUFBWSxDQUFDLEVBQ3pELFNBQVMsQ0FDWixDQUFDO3lCQUNMO3FCQUNKO29CQUNELElBQUksQ0FBQyxnQkFBZ0IsSUFBSSxTQUFTLEtBQUssWUFBWSxFQUFFO3dCQUNqRCxPQUFPLENBQUMsWUFBWSxDQUFDLEdBQUcsRUFBRSxZQUFZLEVBQUUsY0FBYyxDQUFDLENBQUM7cUJBQzNEO3lCQUFNO3dCQUNILFNBQVMsR0FBRyxJQUFJLENBQUM7cUJBQ3BCO2lCQUNKO2FBQ0o7WUFFRCxJQUFJLENBQUMsU0FBUyxFQUFFO2dCQUNaLGFBQWEsQ0FBQyxJQUFJLENBQUM7b0JBQ2YsS0FBSyxFQUFFLFlBQVk7b0JBQ25CLE1BQU0sRUFBRSxHQUFHO29CQUNYLE9BQU8sU0FBQTtpQkFDVixDQUFDLENBQUM7YUFDTjtRQUNMLENBQUMsQ0FBQztRQUVGLElBQUksVUFBVSxFQUFFO1lBQ1osWUFBWSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsVUFBQSxHQUFHO2dCQUM1QixrQkFBa0IsQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUM1QixDQUFDLENBQUMsQ0FBQztTQUNOO2FBQU07WUFDSCxJQUFNLE9BQU8sR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyx5QkFBSSxVQUFVLENBQUMsT0FBTyxHQUFFLE9BQU8sRUFBRSxDQUFDLENBQUMsQ0FBQyxVQUFVLENBQUMsT0FBTyxDQUFDO1lBQ3JGLGtCQUFrQixDQUFDLFNBQVMsRUFBRSxPQUFPLENBQUMsQ0FBQztTQUMxQztJQUNMLENBQUM7SUFFTyxzQ0FBaUIsR0FBekIsVUFBMEIsUUFBcUIsRUFBRSxNQUFtQixFQUFFLE9BQWlCO1FBQ25GLElBQU0sU0FBUyxHQUFjO1lBQ3pCLFFBQVEsVUFBQTtZQUNSLE1BQU0sUUFBQTtZQUNOLE9BQU8sU0FBQTtZQUNQLFdBQVcsRUFBRSxPQUFPLENBQUMsQ0FBQyxDQUFDO1NBQzFCLENBQUM7UUFDRixJQUFJLENBQUMsWUFBWSxDQUFDLHdCQUF3QixDQUFDLEVBQUUsVUFBVSxFQUFFLENBQUMsU0FBUyxDQUFDLEVBQUUsQ0FBQyxDQUFDO0lBQzVFLENBQUM7SUFFTyxrQ0FBYSxHQUFyQixVQUNJLEtBQWlCLEVBQ2pCLE1BQXNCLEVBQ3RCLGFBQW9CLEVBQ3BCLEdBQVcsRUFDWCxPQUFnQixFQUNoQixHQUFXO1FBRVgsSUFBTSxpQkFBaUIsR0FBRyxJQUFJLENBQUMsa0JBQWtCLENBQUMsV0FBVyxDQUFDLGVBQWUsQ0FBQyxDQUFDO1FBQy9FLElBQU0sVUFBVSxHQUFHLElBQUksQ0FBQyxRQUFRLEtBQUssR0FBRyxDQUFDO1FBQ3pDLElBQUksU0FBMkMsQ0FBQztRQUVoRCxJQUFJLFVBQVUsRUFBRTtZQUNaLFNBQVMsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQztTQUN6QzthQUFNO1lBQ0gsU0FBUyxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDO1NBQzlDO1FBRUQsSUFBSSxpQkFBaUIsRUFBRTtZQUNuQixJQUFNLE1BQU0sR0FBMkM7Z0JBQ25ELEtBQUssT0FBQTtnQkFDTCxNQUFNLEVBQUUsTUFBTSxDQUFDLEdBQUcsQ0FBQyxVQUFDLEVBQVM7d0JBQVAsS0FBSyxXQUFBO29CQUFPLE9BQUEsS0FBSztnQkFBTCxDQUFLLENBQUM7Z0JBQ3hDLGFBQWEsZUFBQTtnQkFDYixZQUFZLEVBQUUsR0FBRztnQkFDakIsZ0JBQWdCLEVBQUUsSUFBSSxDQUFDLFlBQVksQ0FBQyxRQUFRLENBQUMsR0FBRyxFQUFFLE9BQU8sQ0FBQztnQkFDMUQsU0FBUyxXQUFBO2dCQUNULE1BQU0sRUFBRSxHQUFHO2dCQUNYLE9BQU8sRUFBRSxPQUFPO2FBQ25CLENBQUM7WUFDRixJQUFNLFVBQVUsR0FBRyxpQkFBaUIsQ0FBQyxNQUFNLENBQUMsQ0FBQTtZQUM1QyxJQUFJLFVBQVUsS0FBSyxLQUFLLEVBQUU7Z0JBQ3RCLE9BQU8sRUFBRSxLQUFLLEVBQUUsVUFBVSxFQUFFLGdCQUFnQixFQUFFLElBQUksRUFBRSxDQUFDO2FBQ3hEO1NBQ0o7UUFFRCxJQUFNLFVBQVUsR0FBRyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsVUFBQyxFQUFTO2dCQUFQLEtBQUssV0FBQTtZQUNwQyxJQUFNLE9BQU8sR0FBRyxVQUFVLENBQUMsS0FBSyxDQUFDLENBQUM7WUFDbEMsT0FBTyxLQUFLLENBQUMsT0FBTyxDQUFDLElBQUksT0FBTyxDQUFDLFFBQVEsRUFBRSxLQUFLLEtBQUssQ0FBQyxRQUFRLEVBQUUsQ0FBQztRQUNyRSxDQUFDLENBQUMsQ0FBQztRQUVILDZEQUE2RDtRQUM3RCwrQ0FBK0M7UUFDL0MsZ0VBQWdFO1FBQ2hFLGlFQUFpRTtRQUNqRSw0REFBNEQ7UUFDNUQsSUFBSSxLQUFLLENBQUMsTUFBTSxJQUFJLENBQUMsVUFBVSxFQUFFO1lBQzdCLElBQUksVUFBVSxJQUFJLGFBQWEsQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFO2dCQUMxQyxJQUFNLFVBQVUsR0FBRyxDQUFDLElBQUksQ0FBQyxJQUFJLElBQUksSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUN2RCxPQUFPLEVBQUUsS0FBSyxFQUFFLFVBQVUsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsR0FBRyxVQUFVLEVBQUUsZ0JBQWdCLEVBQUUsS0FBSyxFQUFFLENBQUM7YUFDaEc7WUFDSyxJQUFBLEtBQXVELE1BQU0sQ0FBQyxHQUFHLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBQyxFQUFoRixLQUFLLFdBQUEsRUFBVSxTQUFTLFlBQUEsRUFBVyxhQUFhLGFBQWdDLENBQUM7WUFDekYsT0FBTyxFQUFFLEtBQUssT0FBQSxFQUFFLGdCQUFnQixFQUFFLEtBQUssRUFBRSxTQUFTLFdBQUEsRUFBRSxhQUFhLGVBQUEsRUFBRSxDQUFDO1NBQ3ZFO1FBRUQsT0FBTyxFQUFFLEtBQUssRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLHNCQUFzQixDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsVUFBQyxFQUFTO29CQUFQLEtBQUssV0FBQTtnQkFBTyxPQUFBLE1BQU0sQ0FBQyxLQUFLLENBQUM7WUFBYixDQUFhLENBQUMsQ0FBQyxDQUFDLEVBQUUsZ0JBQWdCLEVBQUUsS0FBSyxFQUFFLENBQUM7SUFFeEgsQ0FBQztJQUVTLGdDQUFXLEdBQXJCO1FBQ0ksSUFBSSxDQUFDLGVBQWUsRUFBRSxDQUFDO1FBQ3ZCLElBQUksQ0FBQyxlQUFlLEVBQUUsQ0FBQztRQUV2QixJQUFJLENBQUMsY0FBYyxHQUFHLFNBQVMsQ0FBQztRQUVoQyxpQkFBTSxXQUFXLFdBQUUsQ0FBQztJQUN4QixDQUFDO0lBRU8sb0NBQWUsR0FBdkI7UUFDSSxJQUFJLENBQUMsV0FBVyxDQUFDLE9BQU8sQ0FBQyxVQUFBLElBQUk7WUFDekIsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsRUFBRTtnQkFBRSxPQUFPO2FBQUU7WUFDaEMsSUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDO1lBQzVCLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyx1QkFBdUIsRUFBRSxLQUFLLENBQUMsQ0FBQztZQUN6RCxJQUFJLENBQUMsbUJBQW1CLENBQUMseUJBQXlCLEVBQUUsS0FBSyxDQUFDLENBQUM7WUFDM0QsSUFBSSxDQUFDLG1CQUFtQixDQUFDLDBCQUEwQixFQUFFLEtBQUssQ0FBQyxDQUFDO1lBQzVELElBQUksQ0FBQyxtQkFBbUIsQ0FBQyx3QkFBd0IsRUFBRSxLQUFLLENBQUMsQ0FBQztRQUM5RCxDQUFDLENBQUMsQ0FBQztRQUVILElBQUksQ0FBQyxXQUFXLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQztRQUU1QixJQUFJLENBQUMsSUFBSSxHQUFHLEtBQUssQ0FBQztRQUNsQixJQUFJLENBQUMsTUFBTSxHQUFHLEtBQUssQ0FBQztRQUNwQixJQUFJLENBQUMsUUFBUSxHQUFHLEtBQUssQ0FBQztJQUMxQixDQUFDO0lBRU8sb0NBQWUsR0FBdkI7UUFDSSxJQUFJLENBQUMsVUFBVSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUM7SUFDL0IsQ0FBQztJQUVPLGlDQUFZLEdBQXBCLFVBQXFCLGVBQTZCLEVBQUUsZUFBNkI7UUFDN0UsSUFBSSxDQUFDLGVBQWUsRUFBRSxDQUFDO1FBQ3ZCLElBQUksQ0FBQyxlQUFlLEVBQUUsQ0FBQztRQUV2QixJQUFJLElBQUksQ0FBQyxRQUFRLEtBQUssR0FBRyxFQUFFO1lBQ3ZCLElBQUksSUFBSSxDQUFDLGdCQUFnQixDQUFDLE9BQU8sQ0FBQyxlQUFlLEVBQUUsZUFBZSxDQUFDLEVBQUU7Z0JBQUUsT0FBTzthQUFFO1lBRWhGLElBQU0sUUFBUSxHQUFHLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxNQUFNLENBQUMsZUFBZSxFQUFFLGVBQWUsQ0FBQyxDQUFDO1lBQ2hGLElBQU0sYUFBYSxHQUFHLElBQUksQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDO1lBQzlDLElBQU0sV0FBVyxHQUFHLElBQUksQ0FBQyxjQUFjLEVBQUUsQ0FBQztZQUUxQyxJQUFJLFFBQVEsSUFBSSxDQUNaLENBQ0ksZUFBZSxDQUFDLFNBQVMsSUFBSSxhQUFhLENBQUMsU0FBUztnQkFDcEQsZUFBZSxDQUFDLFFBQVEsSUFBSSxhQUFhLENBQUMsUUFBUSxDQUNyRDtnQkFDRCxDQUNJLGFBQWEsQ0FBQyxTQUFTLElBQUksV0FBVyxDQUFDLFNBQVM7b0JBQ2hELGVBQWUsQ0FBQyxTQUFTLElBQUksV0FBVyxDQUFDLFNBQVM7b0JBQ2xELGVBQWUsQ0FBQyxRQUFRLElBQUksV0FBVyxDQUFDLFFBQVEsQ0FDbkQsQ0FDSixFQUFFO2dCQUNDLElBQUksQ0FBQyxjQUFjLENBQUMsZUFBZSxFQUFFLGVBQWUsQ0FBQyxDQUFDO2dCQUN0RCxJQUFJLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQzthQUN4QjtpQkFBTTtnQkFDSCxJQUFJLENBQUMsY0FBYyxDQUFDLGVBQWUsRUFBRSxlQUFlLEVBQUUsUUFBUSxDQUFDLENBQUM7Z0JBQ2hFLElBQUksQ0FBQyxRQUFRLEdBQUcsS0FBSyxDQUFDO2FBQ3pCO1NBQ0o7YUFBTTtZQUNILElBQU0sYUFBYSxHQUFHLGVBQWUsQ0FBQyxNQUFNLENBQUM7WUFDN0MsSUFBTSxhQUFhLEdBQUcsZUFBZSxDQUFDLE1BQU0sQ0FBQztZQUU3QyxJQUFJLGFBQWEsS0FBSyxhQUFhLEVBQUU7Z0JBQUUsT0FBTzthQUFFO1lBQ2hELElBQU0sZ0JBQWdCLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQyxzQkFBc0IsRUFBRSxDQUFDO1lBQ25FLElBQU0sWUFBWSxHQUFHLGdCQUFnQixDQUFDLE9BQU8sQ0FBQyxhQUFhLENBQUMsQ0FBQztZQUM3RCxJQUFNLFlBQVksR0FBRyxnQkFBZ0IsQ0FBQyxPQUFPLENBQUMsYUFBYSxDQUFDLENBQUM7WUFFN0QsSUFBSSxZQUFZLElBQUksWUFBWSxJQUFJLFlBQVksSUFBSSxnQkFBZ0IsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLFlBQVksRUFBRSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFO2dCQUMxRyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsZUFBZSxFQUFFLGVBQWUsQ0FBQyxDQUFDO2dCQUN4RCxJQUFJLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQzthQUN4QjtpQkFBTTtnQkFDSCxJQUFJLENBQUMsZ0JBQWdCLENBQUMsZUFBZSxFQUFFLGVBQWUsRUFBRSxZQUFZLEdBQUcsWUFBWSxDQUFDLENBQUM7Z0JBQ3JGLElBQUksQ0FBQyxRQUFRLEdBQUcsS0FBSyxDQUFDO2FBQ3pCO1NBQ0o7UUFDRCxJQUFJLENBQUMsY0FBYyxHQUFHLGVBQWUsQ0FBQztJQUMxQyxDQUFDO0lBRU8sbUNBQWMsR0FBdEIsVUFBdUIsZUFBNkIsRUFBRSxXQUF5QixFQUFFLFVBQW9CO1FBQzNGLElBQUEsS0FBc0MsSUFBSSxFQUF4QyxpQkFBaUIsdUJBQUEsRUFBRSxZQUFZLGtCQUFTLENBQUM7UUFDakQsSUFBSSxHQUFHLEdBQXVCLGVBQWUsQ0FBQztRQUU5QyxHQUFHO1lBQ0MsSUFBTSxTQUFTLEdBQUcsSUFBSSxDQUFDLFlBQVksRUFBRSxDQUFDO1lBQ3RDLElBQU0sTUFBTSxHQUFHLFNBQVMsQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDO1lBRXhDLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUU7Z0JBQzdCLElBQU0sTUFBTSxHQUFHLFNBQVMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ3BDLElBQU0sTUFBTSxHQUFHLEVBQUUsUUFBUSxFQUFFLEdBQUcsQ0FBQyxRQUFRLEVBQUUsU0FBUyxFQUFFLEdBQUcsQ0FBQyxTQUFTLEVBQUUsQ0FBQztnQkFDcEUsSUFBTSxPQUFPLHlCQUFRLE1BQU0sS0FBRSxNQUFNLFFBQUEsR0FBRSxDQUFDO2dCQUN0QyxJQUFNLFdBQVcsR0FBRyxZQUFZLENBQUMscUJBQXFCLENBQUMsT0FBTyxFQUFFLFNBQVMsQ0FBQyxDQUFDO2dCQUMzRSxJQUFNLFlBQVksR0FBRyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsT0FBTyxDQUFDLEdBQUcsRUFBRSxlQUFlLENBQUMsQ0FBQztnQkFFekUsSUFBSSxVQUFVLEVBQUU7b0JBQUUsSUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUM7aUJBQUU7Z0JBRXJDLElBQUksQ0FBQyxZQUFZLEVBQUU7b0JBQ2YsSUFBTSxJQUFJLEdBQUcsaUJBQWlCLENBQUMsaUJBQWlCLENBQUMsT0FBTyxDQUFDLENBQUM7b0JBRTFELElBQUksSUFBSSxFQUFFO3dCQUNOLElBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO3dCQUM1QixJQUFNLFFBQVEsR0FBRyxJQUFJLENBQUMsT0FBTyxFQUFFLENBQUM7d0JBRWhDLElBQUksQ0FBQyxXQUFXLEVBQUU7NEJBQ2QsUUFBUSxDQUFDLG1CQUFtQixDQUFDLHdCQUF3QixFQUFFLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQzs0QkFDaEUsUUFBUSxDQUFDLG1CQUFtQixDQUFDLHlCQUF5QixFQUFFLENBQUMsS0FBSyxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUM7eUJBQzdFO3dCQUVELFFBQVEsQ0FBQyxtQkFBbUIsQ0FDeEIsVUFBVSxDQUFDLENBQUMsQ0FBQyx1QkFBdUIsQ0FBQyxDQUFDLENBQUMsMEJBQTBCLEVBQ2pFLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxPQUFPLENBQUMsR0FBRyxFQUFFLFdBQVcsQ0FBQyxDQUNsRCxDQUFDO3FCQUNMO2lCQUNKO2FBQ0o7WUFFRCxJQUFJLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxPQUFPLENBQUMsR0FBRyxFQUFFLFdBQVcsQ0FBQyxFQUFFO2dCQUFFLE1BQU07YUFBRTtTQUNsRTtRQUNHLDJCQUEyQjtRQUMzQixHQUFHLEdBQUcsVUFBVTtZQUNaLENBQUMsQ0FBQyxJQUFJLENBQUMscUJBQXFCLENBQUMsV0FBVyxDQUFDLEdBQUcsQ0FBQztZQUM3QyxDQUFDLENBQUMsSUFBSSxDQUFDLHFCQUFxQixDQUFDLFdBQVcsQ0FBQyxHQUFHLENBQUMsRUFDbkQ7SUFDTixDQUFDO0lBRU8sbUNBQWMsR0FBdEIsVUFBdUIsZUFBNkIsRUFBRSxXQUF5QjtRQUMzRSxJQUFJLEdBQUcsR0FBdUIsZUFBZSxDQUFDO1FBRTlDLEdBQUc7WUFDQyxJQUFNLFNBQVMsR0FBRyxJQUFJLENBQUMsWUFBWSxFQUFFLENBQUM7WUFDdEMsSUFBTSxNQUFNLEdBQUcsU0FBUyxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUM7WUFDeEMsSUFBTSxTQUFTLEdBQUcsSUFBSSxDQUFDLGdCQUFnQixDQUFDLE9BQU8sQ0FBQyxHQUFHLEVBQUUsV0FBVyxDQUFDLENBQUM7WUFFbEUsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRTtnQkFDN0IsSUFBTSxNQUFNLEdBQUcsRUFBRSxRQUFRLEVBQUUsR0FBRyxDQUFDLFFBQVEsRUFBRSxTQUFTLEVBQUUsR0FBRyxDQUFDLFNBQVMsRUFBRSxDQUFDO2dCQUNwRSxJQUFNLE1BQU0seUJBQVEsTUFBTSxLQUFFLE1BQU0sRUFBRSxTQUFTLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxHQUFFLENBQUM7Z0JBQzNELElBQU0sSUFBSSxHQUFHLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxpQkFBaUIsQ0FBQyxNQUFNLENBQUMsQ0FBQztnQkFFOUQsSUFBSSxJQUFJLEVBQUU7b0JBQ04sSUFBSSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7b0JBRTVCLElBQU0sUUFBUSxHQUFHLElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQztvQkFFaEMsUUFBUSxDQUFDLG1CQUFtQixDQUN4QiwwQkFBMEIsRUFDMUIsSUFBSSxDQUFDLGdCQUFnQixDQUFDLE9BQU8sQ0FBQyxHQUFHLEVBQUUsV0FBVyxDQUFDLENBQ2xELENBQUM7aUJBQ0w7YUFDSjtZQUNELElBQUksU0FBUyxFQUFFO2dCQUFFLE1BQU07YUFBRTtZQUN6QiwyQkFBMkI7U0FDOUIsUUFBUSxHQUFHLEdBQUcsSUFBSSxDQUFDLHFCQUFxQixDQUFDLFdBQVcsQ0FBQyxHQUFHLENBQUMsRUFBRTtJQUNoRSxDQUFDO0lBRU8scUNBQWdCLEdBQXhCLFVBQXlCLGVBQTZCLEVBQUUsV0FBeUIsRUFBRSxZQUFzQjtRQUF6RyxpQkF1Q0M7UUF0Q0csSUFBTSxPQUFPLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQyxzQkFBc0IsRUFBRSxDQUFDO1FBQzFELElBQU0sUUFBUSxHQUFHLE9BQU8sQ0FBQyxPQUFPLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxXQUFXLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxlQUFlLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDN0YsSUFBTSxNQUFNLEdBQUcsT0FBTyxDQUFDLE9BQU8sQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxZQUFZLEVBQUUsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFdBQVcsQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUNuRyxJQUFNLE1BQU0sR0FBRyxZQUFZLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBRXBDLElBQU0sVUFBVSxHQUFHLE9BQU8sQ0FBQyxLQUFLLENBQUMsUUFBUSxHQUFHLE1BQU0sRUFBRSxNQUFNLEdBQUcsTUFBTSxDQUFDLENBQUM7UUFDckUsSUFBTSxhQUFhLEdBQUcsSUFBSSxDQUFDLGdCQUFnQixFQUFFLENBQUM7UUFDOUMsSUFBTSxXQUFXLEdBQUcsSUFBSSxDQUFDLGNBQWMsRUFBRSxDQUFDO1FBRTFDLFVBQVUsQ0FBQyxPQUFPLENBQUMsVUFBQSxNQUFNO1lBQ3JCLElBQUksR0FBRyxHQUFnQixhQUFhLENBQUM7WUFDckMsSUFBSSxTQUFTLEdBQUcsS0FBSyxDQUFDO1lBRXRCLEdBQUc7Z0JBQ0MsU0FBUyxHQUFHLEtBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxPQUFPLENBQUMsR0FBRyxFQUFFLFdBQVcsQ0FBQyxDQUFDO2dCQUM1RCxJQUFNLElBQUksR0FBRyxLQUFJLENBQUMsaUJBQWlCLENBQUMsaUJBQWlCLENBQUM7b0JBQ2xELFFBQVEsRUFBRSxHQUFHLENBQUMsUUFBUTtvQkFDdEIsU0FBUyxFQUFFLEdBQUcsQ0FBQyxTQUFTO29CQUN4QixNQUFNLEVBQUUsTUFBTTtpQkFDakIsQ0FBQyxDQUFDO2dCQUVILElBQUksSUFBSSxFQUFFO29CQUNOLEtBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO29CQUM1QixJQUFNLFFBQVEsR0FBRyxJQUFJLENBQUMsT0FBTyxFQUFFLENBQUM7b0JBRWhDLFFBQVEsQ0FBQyxtQkFBbUIsQ0FBQyx1QkFBdUIsRUFBRSxLQUFJLENBQUMsZ0JBQWdCLENBQUMsT0FBTyxDQUFDLEdBQUcsRUFBRSxhQUFhLENBQUMsQ0FBQyxDQUFDO29CQUN6RyxRQUFRLENBQUMsbUJBQW1CLENBQUMsMEJBQTBCLEVBQUUsS0FBSSxDQUFDLGdCQUFnQixDQUFDLE9BQU8sQ0FBQyxHQUFHLEVBQUUsV0FBVyxDQUFDLENBQUMsQ0FBQztvQkFDMUcsSUFBSSxZQUFZLEVBQUU7d0JBQ2QsS0FBSSxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUM7d0JBQ25CLFFBQVEsQ0FBQyxtQkFBbUIsQ0FBQyx3QkFBd0IsRUFBRSxNQUFNLEtBQUssVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7cUJBQ3BGO3lCQUFNO3dCQUNILFFBQVEsQ0FBQyxtQkFBbUIsQ0FBQyx5QkFBeUIsRUFBRSxNQUFNLEtBQUssQ0FBQyxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDO3FCQUMxRjtpQkFDSjtnQkFFRCxHQUFHLEdBQUcsS0FBSSxDQUFDLHFCQUFxQixDQUFDLFdBQVcsQ0FBQyxHQUFHLENBQUUsQ0FBQzthQUN0RCxRQUFRLENBQUMsU0FBUyxFQUFFO1FBQ3pCLENBQUMsQ0FBQyxDQUFDO0lBQ1AsQ0FBQztJQUVPLHFDQUFnQixHQUF4QixVQUF5QixlQUE2QixFQUFFLFdBQXlCO1FBQWpGLGlCQStCQztRQTlCRyxJQUFNLE9BQU8sR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDLHNCQUFzQixFQUFFLENBQUM7UUFDMUQsSUFBTSxRQUFRLEdBQUcsT0FBTyxDQUFDLE9BQU8sQ0FBQyxXQUFXLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDckQsSUFBTSxNQUFNLEdBQUcsT0FBTyxDQUFDLE9BQU8sQ0FBQyxlQUFlLENBQUMsTUFBTSxDQUFDLENBQUM7UUFFdkQsSUFBTSxVQUFVLEdBQUcsT0FBTyxDQUFDLEtBQUssQ0FBQyxRQUFRLEVBQUUsTUFBTSxDQUFDLENBQUM7UUFDbkQsSUFBTSxhQUFhLEdBQUcsSUFBSSxDQUFDLGdCQUFnQixFQUFFLENBQUM7UUFDOUMsSUFBTSxXQUFXLEdBQUcsSUFBSSxDQUFDLGNBQWMsRUFBRSxDQUFDO1FBRTFDLFVBQVUsQ0FBQyxPQUFPLENBQUMsVUFBQSxNQUFNO1lBQ3JCLElBQUksR0FBRyxHQUFnQixhQUFhLENBQUM7WUFDckMsSUFBSSxTQUFTLEdBQVksS0FBSyxDQUFDO1lBRS9CLEdBQUc7Z0JBQ0MsU0FBUyxHQUFHLEtBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxPQUFPLENBQUMsR0FBRyxFQUFFLFdBQVcsQ0FBQyxDQUFDO2dCQUM1RCxJQUFNLElBQUksR0FBRyxLQUFJLENBQUMsaUJBQWlCLENBQUMsaUJBQWlCLENBQUM7b0JBQ2xELFFBQVEsRUFBRSxHQUFHLENBQUMsUUFBUTtvQkFDdEIsU0FBUyxFQUFFLEdBQUcsQ0FBQyxTQUFTO29CQUN4QixNQUFNLEVBQUUsTUFBTTtpQkFDakIsQ0FBQyxDQUFDO2dCQUVILElBQUksSUFBSSxFQUFFO29CQUNOLEtBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO29CQUM1QixJQUFNLFFBQVEsR0FBRyxJQUFJLENBQUMsT0FBTyxFQUFFLENBQUM7b0JBQ2hDLFFBQVEsQ0FBQyxtQkFBbUIsQ0FBQyx5QkFBeUIsRUFBRSxNQUFNLEtBQUssVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7aUJBQ3JGO2dCQUVELEdBQUcsR0FBRyxLQUFJLENBQUMscUJBQXFCLENBQUMsV0FBVyxDQUFDLEdBQUcsQ0FBRSxDQUFDO2FBQ3RELFFBQ00sQ0FBQyxTQUFTLEVBQUU7UUFDdkIsQ0FBQyxDQUFDLENBQUM7SUFDUCxDQUFDO0lBRU0sNEJBQU8sR0FBZCxVQUFlLFFBQWtCO1FBQzdCLElBQU0sU0FBUyxHQUFHLElBQUksQ0FBQyxZQUFZLENBQUMsYUFBYSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDdkQsSUFBTSxhQUFhLEdBQUcsQ0FBQyxTQUFTLENBQUMsUUFBUSxJQUFJLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQztRQUUvRCxJQUFJLGFBQWEsRUFBRTtZQUNmLElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQztZQUNmLE9BQU87U0FDVjtRQUVELGlCQUFNLE9BQU8sWUFBQyxRQUFRLENBQUMsQ0FBQztJQUM1QixDQUFDO0lBL2lCTSxtQkFBUSxHQUFjLHNDQUFvQyxDQUFDO0lBSnZDO1FBQTFCLFNBQVMsQ0FBQyxjQUFjLENBQUM7b0RBQW9DO0lBQzdCO1FBQWhDLFNBQVMsQ0FBQyxvQkFBb0IsQ0FBQzswREFBZ0Q7SUFDNUM7UUFBbkMsU0FBUyxDQUFDLHVCQUF1QixDQUFDOzZEQUFzRDtJQWtqQjdGLGlCQUFDO0NBQUEsQUF0akJELENBQWdDLHVCQUF1QixHQXNqQnREO1NBdGpCWSxVQUFVIn0=