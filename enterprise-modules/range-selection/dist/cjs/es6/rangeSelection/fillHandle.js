"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@ag-grid-community/core");
const abstractSelectionHandle_1 = require("./abstractSelectionHandle");
class FillHandle extends abstractSelectionHandle_1.AbstractSelectionHandle {
    constructor() {
        super(FillHandle.TEMPLATE);
        this.markedCells = [];
        this.cellValues = [];
        this.isUp = false;
        this.isLeft = false;
        this.isReduce = false;
        this.type = core_1.SelectionHandleType.FILL;
    }
    updateValuesOnMove(e) {
        super.updateValuesOnMove(e);
        if (!this.initialXY) {
            this.initialXY = this.mouseEventService.getNormalisedPosition(e);
        }
        const { x, y } = this.initialXY;
        const { x: newX, y: newY } = this.mouseEventService.getNormalisedPosition(e);
        const diffX = Math.abs(x - newX);
        const diffY = Math.abs(y - newY);
        const allowedDirection = this.gridOptionsWrapper.getFillHandleDirection();
        let direction;
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
    }
    onDrag(e) {
        if (!this.initialPosition) {
            const cellCtrl = this.getCellCtrl();
            if (!cellCtrl) {
                return;
            }
            this.initialPosition = cellCtrl.getCellPosition();
        }
        const lastCellHovered = this.getLastCellHovered();
        if (lastCellHovered) {
            this.markPathFrom(this.initialPosition, lastCellHovered);
        }
    }
    onDragEnd(e) {
        this.initialXY = null;
        if (!this.markedCells.length) {
            return;
        }
        const isX = this.dragAxis === 'x';
        const initialRange = this.getCellRange();
        const colLen = initialRange.columns.length;
        const rangeStartRow = this.getRangeStartRow();
        const rangeEndRow = this.getRangeEndRow();
        let finalRange;
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
            const startRow = isX ? rangeStartRow : this.lastCellMarked;
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
    }
    raiseFillStartEvent() {
        const fillStartEvent = {
            type: core_1.Events.EVENT_FILL_START
        };
        this.eventService.dispatchEvent(fillStartEvent);
    }
    raiseFillEndEvent(initialRange, finalRange) {
        const fillEndEvent = {
            type: core_1.Events.EVENT_FILL_END,
            initialRange: initialRange,
            finalRange: finalRange
        };
        this.eventService.dispatchEvent(fillEndEvent);
    }
    handleValueChanged(initialRange, finalRange, e) {
        const initialRangeEndRow = this.rangeService.getRangeEndRow(initialRange);
        const initialRangeStartRow = this.rangeService.getRangeStartRow(initialRange);
        const finalRangeEndRow = this.rangeService.getRangeEndRow(finalRange);
        const finalRangeStartRow = this.rangeService.getRangeStartRow(finalRange);
        const isVertical = this.dragAxis === 'y';
        // if the range is being reduced in size, all we need to do is
        // clear the cells that are no longer part of the range
        if (this.isReduce && !this.gridOptionsWrapper.isSuppressClearOnFillReduction()) {
            const columns = isVertical
                ? initialRange.columns
                : initialRange.columns.filter(col => finalRange.columns.indexOf(col) < 0);
            const startRow = isVertical ? this.cellNavigationService.getRowBelow(finalRangeEndRow) : finalRangeStartRow;
            if (startRow) {
                this.clearCellsInRange(startRow, initialRangeEndRow, columns);
            }
            return;
        }
        let withinInitialRange = true;
        const values = [];
        const initialValues = [];
        let idx = 0;
        const resetValues = () => {
            values.length = 0;
            initialValues.length = 0;
            idx = 0;
        };
        const iterateAcrossCells = (column, columns) => {
            let currentRow = this.isUp ? initialRangeEndRow : initialRangeStartRow;
            let finished = false;
            if (isVertical) {
                withinInitialRange = true;
                resetValues();
            }
            while (!finished && currentRow) {
                const rowNode = this.rowPositionUtils.getRowNode(currentRow);
                if (!rowNode) {
                    break;
                }
                if (isVertical && column) {
                    fillValues(values, column, rowNode, () => {
                        return !this.rowPositionUtils.sameRow(currentRow, this.isUp ? initialRangeStartRow : initialRangeEndRow);
                    });
                }
                else if (columns) {
                    withinInitialRange = true;
                    resetValues();
                    columns.forEach(col => fillValues(values, col, rowNode, () => col !== (this.isLeft ? initialRange.columns[0] : core_1._.last(initialRange.columns))));
                }
                finished = this.rowPositionUtils.sameRow(currentRow, this.isUp ? finalRangeStartRow : finalRangeEndRow);
                currentRow = this.isUp
                    ? this.cellNavigationService.getRowAbove(currentRow)
                    : this.cellNavigationService.getRowBelow(currentRow);
            }
        };
        const fillValues = (currentValues, col, rowNode, updateInitialSet) => {
            let currentValue;
            let skipValue = false;
            if (withinInitialRange) {
                currentValue = this.valueService.getValue(col, rowNode);
                initialValues.push(currentValue);
                withinInitialRange = updateInitialSet();
            }
            else {
                const { value, fromUserFunction } = this.processValues(e, currentValues, initialValues, col, rowNode, idx++);
                currentValue = value;
                if (col.isCellEditable(rowNode)) {
                    const cellValue = this.valueService.getValue(col, rowNode);
                    if (!fromUserFunction || cellValue !== currentValue) {
                        rowNode.setDataValue(col, currentValue);
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
            initialRange.columns.forEach(col => {
                iterateAcrossCells(col);
            });
        }
        else {
            const columns = this.isLeft ? [...finalRange.columns].reverse() : finalRange.columns;
            iterateAcrossCells(undefined, columns);
        }
    }
    clearCellsInRange(startRow, endRow, columns) {
        let currentRow = startRow;
        let finished = false;
        while (!finished && currentRow) {
            const rowNode = this.rowPositionUtils.getRowNode(currentRow);
            // should never happen, defensive programming
            if (!rowNode) {
                break;
            }
            columns.forEach((col) => {
                if (col.isCellEditable(rowNode)) {
                    rowNode.setDataValue(col, null);
                }
            });
            finished = this.rowPositionUtils.sameRow(currentRow, endRow);
            currentRow = this.cellNavigationService.getRowBelow(currentRow);
        }
    }
    processValues(event, values, initialValues, col, rowNode, idx) {
        const userFillOperation = this.gridOptionsWrapper.getFillOperation();
        const isVertical = this.dragAxis === 'y';
        let direction;
        if (isVertical) {
            direction = this.isUp ? 'up' : 'down';
        }
        else {
            direction = this.isLeft ? 'left' : 'right';
        }
        if (userFillOperation) {
            const params = {
                event,
                values,
                initialValues,
                currentIndex: idx,
                currentCellValue: this.valueService.getValue(col, rowNode),
                direction,
                column: col,
                rowNode: rowNode
            };
            const userResult = userFillOperation(params);
            if (userResult !== false) {
                return { value: userResult, fromUserFunction: true };
            }
        }
        const allNumbers = !values.some(val => {
            const asFloat = parseFloat(val);
            return isNaN(asFloat) || asFloat.toString() !== val.toString();
        });
        // values should be copied in order if the alt key is pressed
        // or if the values contain strings and numbers
        // However, if we only have one initial value selected, and that
        // value is a number and we are also pressing alt, then we should
        // increment or decrement the value by 1 based on direction.
        if (event.altKey || !allNumbers) {
            if (allNumbers && initialValues.length === 1) {
                const multiplier = (this.isUp || this.isLeft) ? -1 : 1;
                return { value: parseFloat(core_1._.last(values)) + 1 * multiplier, fromUserFunction: false };
            }
            return { value: values[idx % values.length], fromUserFunction: false };
        }
        return { value: core_1._.last(core_1._.findLineByLeastSquares(values.map(Number))), fromUserFunction: false };
    }
    clearValues() {
        this.clearMarkedPath();
        this.clearCellValues();
        this.lastCellMarked = undefined;
        super.clearValues();
    }
    clearMarkedPath() {
        this.markedCells.forEach(cell => {
            if (!cell.isAlive()) {
                return;
            }
            const comp = cell.getComp();
            comp.addOrRemoveCssClass('ag-selection-fill-top', false);
            comp.addOrRemoveCssClass('ag-selection-fill-right', false);
            comp.addOrRemoveCssClass('ag-selection-fill-bottom', false);
            comp.addOrRemoveCssClass('ag-selection-fill-left', false);
        });
        this.markedCells.length = 0;
        this.isUp = false;
        this.isLeft = false;
        this.isReduce = false;
    }
    clearCellValues() {
        this.cellValues.length = 0;
    }
    markPathFrom(initialPosition, currentPosition) {
        this.clearMarkedPath();
        this.clearCellValues();
        if (this.dragAxis === 'y') {
            if (this.rowPositionUtils.sameRow(currentPosition, initialPosition)) {
                return;
            }
            const isBefore = this.rowPositionUtils.before(currentPosition, initialPosition);
            const rangeStartRow = this.getRangeStartRow();
            const rangeEndRow = this.getRangeEndRow();
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
            const initialColumn = initialPosition.column;
            const currentColumn = currentPosition.column;
            if (initialColumn === currentColumn) {
                return;
            }
            const displayedColumns = this.columnModel.getAllDisplayedColumns();
            const initialIndex = displayedColumns.indexOf(initialColumn);
            const currentIndex = displayedColumns.indexOf(currentColumn);
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
    }
    extendVertical(initialPosition, endPosition, isMovingUp) {
        const { navigationService, rangeService } = this;
        let row = initialPosition;
        do {
            const cellRange = this.getCellRange();
            const colLen = cellRange.columns.length;
            for (let i = 0; i < colLen; i++) {
                const column = cellRange.columns[i];
                const rowPos = { rowIndex: row.rowIndex, rowPinned: row.rowPinned };
                const cellPos = Object.assign(Object.assign({}, rowPos), { column });
                const cellInRange = rangeService.isCellInSpecificRange(cellPos, cellRange);
                const isInitialRow = this.rowPositionUtils.sameRow(row, initialPosition);
                if (isMovingUp) {
                    this.isUp = true;
                }
                if (!isInitialRow) {
                    const cell = navigationService.getCellByPosition(cellPos);
                    if (cell) {
                        this.markedCells.push(cell);
                        const cellCtrl = cell.getComp();
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
    }
    reduceVertical(initialPosition, endPosition) {
        let row = initialPosition;
        do {
            const cellRange = this.getCellRange();
            const colLen = cellRange.columns.length;
            const isLastRow = this.rowPositionUtils.sameRow(row, endPosition);
            for (let i = 0; i < colLen; i++) {
                const rowPos = { rowIndex: row.rowIndex, rowPinned: row.rowPinned };
                const celPos = Object.assign(Object.assign({}, rowPos), { column: cellRange.columns[i] });
                const cell = this.navigationService.getCellByPosition(celPos);
                if (cell) {
                    this.markedCells.push(cell);
                    const cellComp = cell.getComp();
                    cellComp.addOrRemoveCssClass('ag-selection-fill-bottom', this.rowPositionUtils.sameRow(row, endPosition));
                }
            }
            if (isLastRow) {
                break;
            }
            // tslint:disable-next-line
        } while (row = this.cellNavigationService.getRowAbove(row));
    }
    extendHorizontal(initialPosition, endPosition, isMovingLeft) {
        const allCols = this.columnModel.getAllDisplayedColumns();
        const startCol = allCols.indexOf(isMovingLeft ? endPosition.column : initialPosition.column);
        const endCol = allCols.indexOf(isMovingLeft ? this.getCellRange().columns[0] : endPosition.column);
        const offset = isMovingLeft ? 0 : 1;
        const colsToMark = allCols.slice(startCol + offset, endCol + offset);
        const rangeStartRow = this.getRangeStartRow();
        const rangeEndRow = this.getRangeEndRow();
        colsToMark.forEach(column => {
            let row = rangeStartRow;
            let isLastRow = false;
            do {
                isLastRow = this.rowPositionUtils.sameRow(row, rangeEndRow);
                const cell = this.navigationService.getCellByPosition({
                    rowIndex: row.rowIndex,
                    rowPinned: row.rowPinned,
                    column: column
                });
                if (cell) {
                    this.markedCells.push(cell);
                    const cellComp = cell.getComp();
                    cellComp.addOrRemoveCssClass('ag-selection-fill-top', this.rowPositionUtils.sameRow(row, rangeStartRow));
                    cellComp.addOrRemoveCssClass('ag-selection-fill-bottom', this.rowPositionUtils.sameRow(row, rangeEndRow));
                    if (isMovingLeft) {
                        this.isLeft = true;
                        cellComp.addOrRemoveCssClass('ag-selection-fill-left', column === colsToMark[0]);
                    }
                    else {
                        cellComp.addOrRemoveCssClass('ag-selection-fill-right', column === core_1._.last(colsToMark));
                    }
                }
                row = this.cellNavigationService.getRowBelow(row);
            } while (!isLastRow);
        });
    }
    reduceHorizontal(initialPosition, endPosition) {
        const allCols = this.columnModel.getAllDisplayedColumns();
        const startCol = allCols.indexOf(endPosition.column);
        const endCol = allCols.indexOf(initialPosition.column);
        const colsToMark = allCols.slice(startCol, endCol);
        const rangeStartRow = this.getRangeStartRow();
        const rangeEndRow = this.getRangeEndRow();
        colsToMark.forEach(column => {
            let row = rangeStartRow;
            let isLastRow = false;
            do {
                isLastRow = this.rowPositionUtils.sameRow(row, rangeEndRow);
                const cell = this.navigationService.getCellByPosition({
                    rowIndex: row.rowIndex,
                    rowPinned: row.rowPinned,
                    column: column
                });
                if (cell) {
                    this.markedCells.push(cell);
                    const cellComp = cell.getComp();
                    cellComp.addOrRemoveCssClass('ag-selection-fill-right', column === colsToMark[0]);
                }
                row = this.cellNavigationService.getRowBelow(row);
            } while (!isLastRow);
        });
    }
    refresh(cellCtrl) {
        const cellRange = this.rangeService.getCellRanges()[0];
        const isColumnRange = !cellRange.startRow || !cellRange.endRow;
        if (isColumnRange) {
            this.destroy();
            return;
        }
        super.refresh(cellCtrl);
    }
}
FillHandle.TEMPLATE = `<div class="ag-fill-handle"></div>`;
__decorate([
    core_1.Autowired('valueService')
], FillHandle.prototype, "valueService", void 0);
exports.FillHandle = FillHandle;
