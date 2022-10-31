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
var __spread = (this && this.__spread) || function () {
    for (var ar = [], i = 0; i < arguments.length; i++) ar = ar.concat(__read(arguments[i]));
    return ar;
};
import { Autowired, Events, SelectionHandleType, _ } from '@ag-grid-community/core';
import { AbstractSelectionHandle } from "./abstractSelectionHandle";
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
        var allowedDirection = this.gridOptionsWrapper.getFillHandleDirection();
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
        if (this.isReduce && !this.gridOptionsWrapper.isSuppressClearOnFillReduction()) {
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
            var currentValue;
            var skipValue = false;
            if (withinInitialRange) {
                currentValue = _this.getValueFromObject(_this.valueService.getValue(col, rowNode));
                initialValues.push(currentValue);
                withinInitialRange = updateInitialSet();
            }
            else {
                var _a = _this.processValues(e, currentValues, initialValues, col, rowNode, idx++), value = _a.value, fromUserFunction = _a.fromUserFunction;
                currentValue = value;
                if (col.isCellEditable(rowNode)) {
                    var cellValue = _this.getValueFromObject(_this.valueService.getValue(col, rowNode));
                    if (!fromUserFunction || cellValue !== currentValue) {
                        rowNode.setDataValue(col, currentValue, 'rangeService');
                    }
                    else {
                        skipValue = true;
                    }
                }
            }
            if (!skipValue) {
                currentValues.push(currentValue);
            }
        };
        if (isVertical) {
            initialRange.columns.forEach(function (col) {
                iterateAcrossCells(col);
            });
        }
        else {
            var columns = this.isLeft ? __spread(finalRange.columns).reverse() : finalRange.columns;
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
        this.rangeService.clearCellRangeCellValues([cellRange]);
    };
    FillHandle.prototype.processValues = function (event, values, initialValues, col, rowNode, idx) {
        var userFillOperation = this.gridOptionsWrapper.getFillOperation();
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
                values: values,
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
        var processedValues = values.map(this.getValueFromObject);
        var allNumbers = !processedValues.some(function (val) {
            var asFloat = parseFloat(val);
            return isNaN(asFloat) || asFloat.toString() !== val.toString();
        });
        // values should be copied in order if the alt key is pressed
        // or if the values contain strings and numbers
        // However, if we only have one initial value selected, and that
        // value is a number and we are also pressing alt, then we should
        // increment or decrement the value by 1 based on direction.
        if (event.altKey || !allNumbers) {
            if (allNumbers && initialValues.length === 1) {
                var multiplier = (this.isUp || this.isLeft) ? -1 : 1;
                return { value: parseFloat(_.last(processedValues)) + 1 * multiplier, fromUserFunction: false };
            }
            return { value: processedValues[idx % processedValues.length], fromUserFunction: false };
        }
        return { value: _.last(_.findLineByLeastSquares(processedValues.map(Number))), fromUserFunction: false };
    };
    FillHandle.prototype.getValueFromObject = function (val) {
        if (val != null && typeof val === 'object') {
            // @ts-ignore
            return val.toString();
        }
        return val;
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
    return FillHandle;
}(AbstractSelectionHandle));
export { FillHandle };
