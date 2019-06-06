// ag-grid-enterprise v21.0.1
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
        var cellRange = this.getCellRange();
        var colLen = cellRange.columns.length;
        var rangeStartRow = this.getRangeStartRow();
        var rangeEndRow = this.getRangeEndRow();
        if (!this.isUp && !this.isLeft) {
            var startPosition = {
                rowIndex: rangeStartRow.rowIndex,
                rowPinned: rangeStartRow.rowPinned,
                column: cellRange.columns[0]
            };
            this.rangeController.setRangeToCell(startPosition);
            this.rangeController.extendLatestRangeToCell({
                rowIndex: isX ? rangeEndRow.rowIndex : this.lastCellMarked.rowIndex,
                rowPinned: isX ? rangeEndRow.rowPinned : this.lastCellMarked.rowPinned,
                column: isX ? this.lastCellMarked.column : cellRange.columns[colLen - 1]
            });
        }
        else {
            var startRow = isX ? rangeStartRow : this.lastCellMarked;
            var startPosition = {
                rowIndex: startRow.rowIndex,
                rowPinned: startRow.rowPinned,
                column: isX ? this.lastCellMarked.column : cellRange.columns[0]
            };
            this.rangeController.setRangeToCell(startPosition);
            this.rangeController.extendLatestRangeToCell({
                rowIndex: rangeEndRow.rowIndex,
                rowPinned: rangeEndRow.rowPinned,
                column: cellRange.columns[colLen - 1]
            });
        }
        if (this.cellValues.length) {
            this.runReducers();
        }
    };
    FillHandle.prototype.runReducers = function () {
        var _this = this;
        if (!this.isReduce && !this.extendFunction) {
            return;
        }
        this.cellValues.forEach(function (column) {
            var values = column.map(function (fillValue) { return fillValue.value; });
            var initial = [];
            if (!_this.isReduce) {
                initial.push(values[0]);
            }
            var startAt = initial.length;
            values.slice(startAt).reduce(function (prev, cur, idx) {
                var val = _this.isReduce ? null : _this.extendFunction(prev, cur);
                var position = column[idx + startAt].position;
                var rowNode = _this.rowRenderer.getRowNode({
                    rowIndex: position.rowIndex,
                    rowPinned: position.rowPinned
                });
                _this.valueService.setValue(rowNode, position.column, val);
                return val;
            }, initial);
        });
    };
    FillHandle.prototype.clearValues = function () {
        this.clearMarkedPath();
        this.cellValues.length = 0;
        this.lastCellMarked = undefined;
        _super.prototype.clearValues.call(this);
    };
    FillHandle.prototype.markPathFrom = function (initialPosition, currentPosition) {
        this.clearMarkedPath();
        this.cellValues.length = 0;
        if (this.dragAxis === 'y') {
            if (ag_grid_community_1.RowPositionUtils.sameRow(currentPosition, initialPosition)) {
                return;
            }
            var isBefore = ag_grid_community_1.RowPositionUtils.before(currentPosition, initialPosition);
            var rangeStartRow = this.getRangeStartRow();
            var rangeEndRow = this.getRangeEndRow();
            if (isBefore && ((currentPosition.rowPinned == rangeStartRow.rowPinned &&
                currentPosition.rowIndex >= rangeStartRow.rowIndex) ||
                (rangeStartRow.rowPinned != rangeEndRow.rowPinned &&
                    currentPosition.rowPinned == rangeEndRow.rowPinned &&
                    currentPosition.rowIndex <= rangeEndRow.rowIndex))) {
                this.reduceVertical(initialPosition, currentPosition);
            }
            else {
                this.extendVertical(initialPosition, currentPosition, isBefore);
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
            }
            else {
                this.extendHorizontal(initialPosition, currentPosition, currentIndex < initialIndex);
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
                var isInitialRow = ag_grid_community_1.RowPositionUtils.sameRow(row, initialPosition);
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
                        ag_grid_community_1._.addOrRemoveCssClass(eGui, isMovingUp ? 'ag-selection-fill-top' : 'ag-selection-fill-bottom', ag_grid_community_1.RowPositionUtils.sameRow(row, endPosition));
                    }
                }
                var shouldAddValue = !cellInRange;
                if (!shouldAddValue) {
                    shouldAddValue = isMovingUp ?
                        ag_grid_community_1.RowPositionUtils.sameRow(rowPos, rangeController.getRangeStartRow(cellRange)) :
                        isInitialRow;
                }
                if (shouldAddValue) {
                    if (!this.cellValues[i]) {
                        this.cellValues[i] = [];
                    }
                    var node = this.rowRenderer.getRowNode(rowPos);
                    var value = this.valueService.getValue(column, node);
                    this.cellValues[i].push({ position: cellPos, value: value });
                }
            }
            if (ag_grid_community_1.RowPositionUtils.sameRow(row, endPosition)) {
                break;
            }
        } while (row = isMovingUp ?
            this.cellNavigationService.getRowAbove(row.rowIndex, row.rowPinned) :
            this.cellNavigationService.getRowBelow(row));
        this.isReduce = false;
    };
    FillHandle.prototype.reduceVertical = function (initialPosition, endPosition) {
        var row = initialPosition;
        do {
            var cellRange = this.getCellRange();
            var colLen = cellRange.columns.length;
            var isLastRow = ag_grid_community_1.RowPositionUtils.sameRow(row, endPosition);
            for (var i = 0; i < colLen; i++) {
                var column = cellRange.columns[i];
                var rowPos = { rowIndex: row.rowIndex, rowPinned: row.rowPinned };
                var celPos = __assign({}, rowPos, { column: cellRange.columns[i] });
                var cellComp = this.rowRenderer.getComponentForCell(celPos);
                if (cellComp) {
                    this.markedCellComps.push(cellComp);
                    var eGui = cellComp.getGui();
                    ag_grid_community_1._.addOrRemoveCssClass(eGui, 'ag-selection-fill-bottom', ag_grid_community_1.RowPositionUtils.sameRow(row, endPosition));
                }
                if (!isLastRow) {
                    if (!this.cellValues[i]) {
                        this.cellValues[i] = [];
                    }
                    var node = this.rowRenderer.getRowNode(rowPos);
                    var value = this.valueService.getValue(column, node);
                    this.cellValues[i].push({ position: celPos, value: value });
                }
            }
            if (isLastRow) {
                break;
            }
        } while (row = this.cellNavigationService.getRowAbove(row.rowIndex, row.rowPinned));
        this.isReduce = true;
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
                isLastRow = ag_grid_community_1.RowPositionUtils.sameRow(row, rangeEndRow);
                var cellComp = _this.rowRenderer.getComponentForCell({
                    rowIndex: row.rowIndex,
                    rowPinned: row.rowPinned,
                    column: column
                });
                if (cellComp) {
                    _this.markedCellComps.push(cellComp);
                    var eGui = cellComp.getGui();
                    ag_grid_community_1._.addOrRemoveCssClass(eGui, 'ag-selection-fill-top', ag_grid_community_1.RowPositionUtils.sameRow(row, rangeStartRow));
                    ag_grid_community_1._.addOrRemoveCssClass(eGui, 'ag-selection-fill-bottom', ag_grid_community_1.RowPositionUtils.sameRow(row, rangeEndRow));
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
        this.isReduce = false;
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
                isLastRow = ag_grid_community_1.RowPositionUtils.sameRow(row, rangeEndRow);
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
        this.isReduce = true;
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
