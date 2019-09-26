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
var ag_grid_community_1 = require("ag-grid-community");
var abstractSelectionHandle_1 = require("./abstractSelectionHandle");
var FillHandle = /** @class */ (function (_super) {
    __extends(FillHandle, _super);
    function FillHandle() {
        var _this = _super.call(this, FillHandle.TEMPLATE) || this;
        _this.markedCellComps = [];
        _this.cellValues = [];
        _this.isUp = false;
        _this.isLeft = false;
        _this.isReduce = false;
        _this.type = 'fill';
        return _this;
    }
    FillHandle.prototype.onDrag = function (e) {
        if (!this.initialXY) {
            var _a = this.getGui().getBoundingClientRect(), x_1 = _a.x, y_1 = _a.y;
            this.initialXY = { x: x_1, y: y_1 };
        }
        var _b = this.initialXY, x = _b.x, y = _b.y;
        var diffX = Math.abs(x - e.clientX);
        var diffY = Math.abs(y - e.clientY);
        var direction = diffX > diffY ? 'x' : 'y';
        if (direction !== this.dragAxis) {
            this.dragAxis = direction;
        }
        if (!this.initialPosition) {
            var cellComp = this.getCellComp();
            if (!cellComp) {
                return;
            }
            this.initialPosition = cellComp.getCellPosition();
        }
        var lastCellHovered = this.getLastCellHovered();
        if (lastCellHovered && lastCellHovered !== this.lastCellMarked) {
            this.lastCellMarked = lastCellHovered;
            this.markPathFrom(this.initialPosition, lastCellHovered);
        }
    };
    FillHandle.prototype.onDragEnd = function (e) {
        if (!this.markedCellComps.length) {
            return;
        }
        var isX = this.dragAxis === 'x';
        var initialRange = this.getCellRange();
        var colLen = initialRange.columns.length;
        var rangeStartRow = this.getRangeStartRow();
        var rangeEndRow = this.getRangeEndRow();
        var finalRange;
        if (!this.isUp && !this.isLeft) {
            finalRange = this.rangeController.createCellRangeFromCellRangeParams({
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
            finalRange = this.rangeController.createCellRangeFromCellRangeParams({
                rowStartIndex: startRow.rowIndex,
                rowStartPinned: startRow.rowPinned,
                columnStart: isX ? this.lastCellMarked.column : initialRange.columns[0],
                rowEndIndex: rangeEndRow.rowIndex,
                rowEndPinned: rangeEndRow.rowPinned,
                columnEnd: initialRange.columns[colLen - 1]
            });
        }
        if (finalRange) {
            this.handleValueChanged(initialRange, finalRange, e.altKey);
            this.rangeController.setCellRanges([finalRange]);
        }
    };
    FillHandle.prototype.handleValueChanged = function (initialRange, finalRange, altKey) {
        var _this = this;
        var initialRangeEndRow = this.rangeController.getRangeEndRow(initialRange);
        var initialRangeStartRow = this.rangeController.getRangeStartRow(initialRange);
        var finalRangeEndRow = this.rangeController.getRangeEndRow(finalRange);
        var finalRangeStartRow = this.rangeController.getRangeStartRow(finalRange);
        var isVertical = this.dragAxis === 'y';
        // if the range is being reduced in size, all we need to do is
        // clear the cells that are no longer part of the range
        if (this.isReduce) {
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
        var resetValues = function () {
            values.length = 0;
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
                    ag_grid_community_1._.forEach(columns, (function (col) { return fillValues(values, col, rowNode, function () {
                        return _this.isLeft ? col !== initialRange.columns[0] : col !== ag_grid_community_1._.last(initialRange.columns);
                    }); }));
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
        var fillValues = function (values, col, rowNode, updateInitialSet) {
            var currentValue;
            if (withinInitialRange) {
                currentValue = _this.valueService.getValue(col, rowNode);
                withinInitialRange = updateInitialSet();
            }
            else {
                currentValue = _this.processValues(values, altKey);
                _this.valueService.setValue(rowNode, col, currentValue);
            }
            values.push(currentValue);
        };
        if (isVertical) {
            initialRange.columns.forEach(function (col) {
                iterateAcrossCells(col);
            });
        }
        else {
            var columns = this.isLeft ? finalRange.columns.slice().reverse() : finalRange.columns;
            iterateAcrossCells(undefined, columns);
        }
    };
    FillHandle.prototype.clearCellsInRange = function (startRow, endRow, columns) {
        var _this = this;
        var currentRow = startRow;
        var finished = false;
        var _loop_2 = function () {
            var rowNode = this_1.rowPositionUtils.getRowNode(currentRow);
            // should never happen, defensive programming
            if (!rowNode) {
                return "break";
            }
            columns.forEach(function (col) {
                _this.valueService.setValue(rowNode, col, null);
            });
            finished = this_1.rowPositionUtils.sameRow(currentRow, endRow);
            currentRow = this_1.cellNavigationService.getRowBelow(currentRow);
        };
        var this_1 = this;
        while (!finished && currentRow) {
            var state_2 = _loop_2();
            if (state_2 === "break")
                break;
        }
    };
    FillHandle.prototype.processValues = function (values, altKey) {
        return 10;
    };
    FillHandle.prototype.clearValues = function () {
        this.clearMarkedPath();
        this.clearCellValues();
        this.lastCellMarked = undefined;
        _super.prototype.clearValues.call(this);
    };
    FillHandle.prototype.clearMarkedPath = function () {
        this.markedCellComps.forEach(function (cellComp) {
            var eGui = cellComp.getGui();
            ag_grid_community_1._.removeCssClass(eGui, 'ag-selection-fill-top');
            ag_grid_community_1._.removeCssClass(eGui, 'ag-selection-fill-right');
            ag_grid_community_1._.removeCssClass(eGui, 'ag-selection-fill-bottom');
            ag_grid_community_1._.removeCssClass(eGui, 'ag-selection-fill-left');
        });
        this.markedCellComps.length = 0;
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
            var displayedColumns = this.columnController.getAllDisplayedColumns();
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
    };
    FillHandle.prototype.extendVertical = function (initialPosition, endPosition, isMovingUp) {
        var _a = this, rowRenderer = _a.rowRenderer, rangeController = _a.rangeController;
        var row = initialPosition;
        do {
            var cellRange = this.getCellRange();
            var colLen = cellRange.columns.length;
            for (var i = 0; i < colLen; i++) {
                var column = cellRange.columns[i];
                var rowPos = { rowIndex: row.rowIndex, rowPinned: row.rowPinned };
                var cellPos = __assign({}, rowPos, { column: column });
                var cellInRange = rangeController.isCellInSpecificRange(cellPos, cellRange);
                var isInitialRow = this.rowPositionUtils.sameRow(row, initialPosition);
                if (isMovingUp) {
                    this.isUp = true;
                }
                if (!isInitialRow) {
                    var cellComp = rowRenderer.getComponentForCell(cellPos);
                    if (cellComp) {
                        this.markedCellComps.push(cellComp);
                        var eGui = cellComp.getGui();
                        if (!cellInRange) {
                            ag_grid_community_1._.addOrRemoveCssClass(eGui, 'ag-selection-fill-left', i === 0);
                            ag_grid_community_1._.addOrRemoveCssClass(eGui, 'ag-selection-fill-right', i === colLen - 1);
                        }
                        ag_grid_community_1._.addOrRemoveCssClass(eGui, isMovingUp ? 'ag-selection-fill-top' : 'ag-selection-fill-bottom', this.rowPositionUtils.sameRow(row, endPosition));
                    }
                }
            }
            if (this.rowPositionUtils.sameRow(row, endPosition)) {
                break;
            }
        } while (row = isMovingUp ?
            this.cellNavigationService.getRowAbove(row) :
            this.cellNavigationService.getRowBelow(row));
    };
    FillHandle.prototype.reduceVertical = function (initialPosition, endPosition) {
        var row = initialPosition;
        do {
            var cellRange = this.getCellRange();
            var colLen = cellRange.columns.length;
            var isLastRow = this.rowPositionUtils.sameRow(row, endPosition);
            for (var i = 0; i < colLen; i++) {
                var rowPos = { rowIndex: row.rowIndex, rowPinned: row.rowPinned };
                var celPos = __assign({}, rowPos, { column: cellRange.columns[i] });
                var cellComp = this.rowRenderer.getComponentForCell(celPos);
                if (cellComp) {
                    this.markedCellComps.push(cellComp);
                    var eGui = cellComp.getGui();
                    ag_grid_community_1._.addOrRemoveCssClass(eGui, 'ag-selection-fill-bottom', this.rowPositionUtils.sameRow(row, endPosition));
                }
            }
            if (isLastRow) {
                break;
            }
        } while (row = this.cellNavigationService.getRowAbove(row));
    };
    FillHandle.prototype.extendHorizontal = function (initialPosition, endPosition, isMovingLeft) {
        var _this = this;
        var allCols = this.columnController.getAllDisplayedColumns();
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
                var cellComp = _this.rowRenderer.getComponentForCell({
                    rowIndex: row.rowIndex,
                    rowPinned: row.rowPinned,
                    column: column
                });
                if (cellComp) {
                    _this.markedCellComps.push(cellComp);
                    var eGui = cellComp.getGui();
                    ag_grid_community_1._.addOrRemoveCssClass(eGui, 'ag-selection-fill-top', _this.rowPositionUtils.sameRow(row, rangeStartRow));
                    ag_grid_community_1._.addOrRemoveCssClass(eGui, 'ag-selection-fill-bottom', _this.rowPositionUtils.sameRow(row, rangeEndRow));
                    if (isMovingLeft) {
                        _this.isLeft = true;
                        ag_grid_community_1._.addOrRemoveCssClass(eGui, 'ag-selection-fill-left', column === colsToMark[0]);
                    }
                    else {
                        ag_grid_community_1._.addOrRemoveCssClass(eGui, 'ag-selection-fill-right', column === ag_grid_community_1._.last(colsToMark));
                    }
                }
                row = _this.cellNavigationService.getRowBelow(row);
            } while (!isLastRow);
        });
    };
    FillHandle.prototype.reduceHorizontal = function (initialPosition, endPosition) {
        var _this = this;
        var allCols = this.columnController.getAllDisplayedColumns();
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
                var cellComp = _this.rowRenderer.getComponentForCell({
                    rowIndex: row.rowIndex,
                    rowPinned: row.rowPinned,
                    column: column
                });
                if (cellComp) {
                    _this.markedCellComps.push(cellComp);
                    var eGui = cellComp.getGui();
                    ag_grid_community_1._.addOrRemoveCssClass(eGui, 'ag-selection-fill-right', column === colsToMark[0]);
                }
                row = _this.cellNavigationService.getRowBelow(row);
            } while (!isLastRow);
        });
    };
    FillHandle.prototype.refresh = function (cellComp) {
        var cellRange = this.rangeController.getCellRanges()[0];
        var isColumnRange = !cellRange.startRow || !cellRange.endRow;
        if (isColumnRange) {
            this.destroy();
            return;
        }
        _super.prototype.refresh.call(this, cellComp);
    };
    FillHandle.TEMPLATE = '<div class="ag-fill-handle"></div>';
    __decorate([
        ag_grid_community_1.Autowired('valueService'),
        __metadata("design:type", ag_grid_community_1.ValueService)
    ], FillHandle.prototype, "valueService", void 0);
    return FillHandle;
}(abstractSelectionHandle_1.AbstractSelectionHandle));
exports.FillHandle = FillHandle;
