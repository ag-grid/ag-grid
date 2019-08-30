import {
    Autowired,
    CellComp,
    CellPosition,
    CellRange,
    Column,
    RowNode,
    RowPosition,
    ValueService,
    _
} from 'ag-grid-community';
import { AbstractSelectionHandle } from "./abstractSelectionHandle";

interface FillValues {
    position: CellPosition;
    value: any;
}

type Direction = 'x' | 'y';

export class FillHandle extends AbstractSelectionHandle {

    @Autowired('valueService') private valueService: ValueService;

    static TEMPLATE = '<div class="ag-fill-handle"></div>';

    private initialPosition: CellPosition | undefined;
    private initialXY: { x: number, y: number };
    private lastCellMarked: CellPosition | undefined;
    private markedCellComps: CellComp[] = [];
    private cellValues: FillValues[][] = [];

    private dragAxis: Direction;
    private isUp: boolean = false;
    private isLeft: boolean = false;
    private isReduce: boolean = false;

    protected type = 'fill';

    constructor() {
        super(FillHandle.TEMPLATE);
    }

    protected onDrag(e: MouseEvent) {
        if (!this.initialXY) {
           const { x, y } = this.getGui().getBoundingClientRect() as DOMRect;
           this.initialXY = { x, y };
        }

        const { x, y } = this.initialXY;
        const diffX = Math.abs(x - e.clientX);
        const diffY = Math.abs(y - e.clientY);
        const direction: Direction = diffX > diffY ? 'x' : 'y';

        if (direction !== this.dragAxis) {
            this.dragAxis = direction;
        }

        if (!this.initialPosition) {
            const cellComp = this.getCellComp();
            if (!cellComp) { return; }

            this.initialPosition = cellComp.getCellPosition();
        }

        const lastCellHovered = this.getLastCellHovered();

        if (lastCellHovered && lastCellHovered !== this.lastCellMarked) {
            this.lastCellMarked = lastCellHovered;
            this.markPathFrom(this.initialPosition, lastCellHovered);
        }
    }

    protected onDragEnd(e: MouseEvent) {
        if (!this.markedCellComps.length) { return; }

        const isX = this.dragAxis === 'x';
        const initialRange = this.getCellRange();
        const colLen = initialRange.columns.length;
        const rangeStartRow = this.getRangeStartRow();
        const rangeEndRow = this.getRangeEndRow();
        
        let finalRange: CellRange | undefined;

        if (!this.isUp && !this.isLeft) {
            finalRange = this.rangeController.createCellRangeFromCellRangeParams({
                rowStartIndex: rangeStartRow.rowIndex,
                rowStartPinned: rangeStartRow.rowPinned,
                columnStart: initialRange.columns[0],
                rowEndIndex: isX ? rangeEndRow.rowIndex : this.lastCellMarked!.rowIndex,
                rowEndPinned: isX ? rangeEndRow.rowPinned : this.lastCellMarked!.rowPinned,
                columnEnd: isX ? this.lastCellMarked!.column : initialRange.columns[colLen - 1]
            });
        } else {
            const startRow = isX ? rangeStartRow : this.lastCellMarked!;

            finalRange = this.rangeController.createCellRangeFromCellRangeParams({
                rowStartIndex: startRow.rowIndex,
                rowStartPinned: startRow.rowPinned,
                columnStart: isX ? this.lastCellMarked!.column : initialRange.columns[0],
                rowEndIndex: rangeEndRow.rowIndex,
                rowEndPinned: rangeEndRow.rowPinned,
                columnEnd: initialRange.columns[colLen - 1]
            });
        }

        if (finalRange) {
            this.handleValueChanged(initialRange, finalRange, e.altKey);
            this.rangeController.setCellRanges([finalRange]);
        }
    }

    private handleValueChanged(initialRange: CellRange, finalRange: CellRange, altKey: boolean) {
        const initialRangeEndRow = this.rangeController.getRangeEndRow(initialRange);
        const initialRangeStartRow = this.rangeController.getRangeStartRow(initialRange);
        const finalRangeEndRow = this.rangeController.getRangeEndRow(finalRange);
        const finalRangeStartRow = this.rangeController.getRangeStartRow(finalRange);
        const isVertical = this.dragAxis === 'y';

        // if the range is being reduced in size, all we need to do is
        // clear the cells that are no longer part of the range
        if (this.isReduce) {
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
        const values: any[] = [];

        const resetValues = () => {
            values.length = 0;
        };

        const iterateAcrossCells = (column?: Column, columns?: Column[]) => {
            let currentRow: RowPosition | undefined | null = this.isUp ? initialRangeEndRow : initialRangeStartRow;
            let finished = false;

            if (isVertical) {
                withinInitialRange = true;
                resetValues();
            }

            while (!finished && currentRow) {
                const rowNode = this.rowPositionUtils.getRowNode(currentRow);
                if (!rowNode) { break; }

                if (isVertical && column) {
                    fillValues(values, column, rowNode, () => {
                        return !this.rowPositionUtils.sameRow(currentRow!, this.isUp ? initialRangeStartRow : initialRangeEndRow);
                    });
                } else if (columns) {
                    withinInitialRange = true;
                    resetValues();
                    _.forEach(columns, (col => fillValues(values, col, rowNode, () => {
                        return this.isLeft ? col !== initialRange.columns[0] : col !== _.last(initialRange.columns);
                    })));
                }

                finished = this.rowPositionUtils.sameRow(currentRow, this.isUp ? finalRangeStartRow : finalRangeEndRow);

                currentRow = this.isUp 
                    ? this.cellNavigationService.getRowAbove(currentRow)
                    : this.cellNavigationService.getRowBelow(currentRow);
            }
        };

        const fillValues = (values: any[], col: Column, rowNode: RowNode, updateInitialSet: () => boolean) => {
            let currentValue: any;

            if (withinInitialRange) {
                currentValue = this.valueService.getValue(col, rowNode);
                withinInitialRange = updateInitialSet();
            } else {
                currentValue = this.processValues(values, altKey);
                this.valueService.setValue(rowNode, col, currentValue);
            }
            
            values.push(currentValue);
        };

        if (isVertical) {
            initialRange.columns.forEach(col => {
                iterateAcrossCells(col);
            });
        } else {
            const columns = this.isLeft ? [...finalRange.columns].reverse() : finalRange.columns;
            iterateAcrossCells(undefined, columns);
        }
    }

    private clearCellsInRange(startRow: RowPosition, endRow: RowPosition, columns: Column[]) {
        let currentRow: RowPosition | null | undefined = startRow;

        let finished = false;

        while (!finished && currentRow) {
            const rowNode = this.rowPositionUtils.getRowNode(currentRow);

            // should never happen, defensive programming
            if (!rowNode) { break; }

            columns.forEach((col: Column) => {
                this.valueService.setValue(rowNode, col, null);
            });

            finished = this.rowPositionUtils.sameRow(currentRow, endRow);
            currentRow = this.cellNavigationService.getRowBelow(currentRow);
        }
    }

    private processValues(values: any[], altKey: boolean): any {
        return 10;
    }

    protected clearValues() {
        this.clearMarkedPath();
        this.clearCellValues();

        this.lastCellMarked = undefined;

        super.clearValues();
    }

    private clearMarkedPath() {
        this.markedCellComps.forEach(cellComp => {
            const eGui = cellComp.getGui();
            _.removeCssClass(eGui, 'ag-selection-fill-top');
            _.removeCssClass(eGui, 'ag-selection-fill-right');
            _.removeCssClass(eGui, 'ag-selection-fill-bottom');
            _.removeCssClass(eGui, 'ag-selection-fill-left');
        });

        this.markedCellComps.length = 0;

        this.isUp = false;
        this.isLeft = false;
        this.isReduce = false;
    }

    private clearCellValues() {
        this.cellValues.length = 0;
    }

    private markPathFrom(initialPosition: CellPosition, currentPosition: CellPosition) {
        this.clearMarkedPath();
        this.clearCellValues();

        if (this.dragAxis === 'y') {
            if (this.rowPositionUtils.sameRow(currentPosition, initialPosition)) { return; }

            const isBefore = this.rowPositionUtils.before(currentPosition, initialPosition);
            const rangeStartRow = this.getRangeStartRow();
            const rangeEndRow = this.getRangeEndRow();

            if (isBefore && (
                    (
                        currentPosition.rowPinned == rangeStartRow.rowPinned &&
                        currentPosition.rowIndex >= rangeStartRow.rowIndex
                    ) ||
                    (
                        rangeStartRow.rowPinned != rangeEndRow.rowPinned &&
                        currentPosition.rowPinned == rangeEndRow.rowPinned &&
                        currentPosition.rowIndex <= rangeEndRow.rowIndex
                    )
                )
            ) {
                this.reduceVertical(initialPosition, currentPosition);
                this.isReduce = true;
            } else {
                this.extendVertical(initialPosition, currentPosition, isBefore);
                this.isReduce = false;
            }
        } else {
            const initialColumn = initialPosition.column;
            const currentColumn = currentPosition.column;

            if (initialColumn === currentColumn) { return; }

            const displayedColumns = this.columnController.getAllDisplayedColumns();
            const initialIndex = displayedColumns.indexOf(initialColumn);
            const currentIndex = displayedColumns.indexOf(currentColumn);

            if (currentIndex <= initialIndex && currentIndex >= displayedColumns.indexOf(this.getCellRange().columns[0])) {
                this.reduceHorizontal(initialPosition, currentPosition);
                this.isReduce = true;
            } else {
                this.extendHorizontal(initialPosition, currentPosition, currentIndex < initialIndex);
                this.isReduce = false;
            }
        }
    }

    private extendVertical(initialPosition: CellPosition, endPosition: CellPosition, isMovingUp?: boolean) {
        const { rowRenderer, rangeController } = this;
        let row: RowPosition | null = initialPosition;

        do {
            const cellRange = this.getCellRange();
            const colLen = cellRange.columns.length;

            for (let i = 0; i < colLen; i++) {
                const column = cellRange.columns[i];
                const rowPos = { rowIndex: row.rowIndex, rowPinned: row.rowPinned };
                const cellPos = { ...rowPos, column };
                const cellInRange = rangeController.isCellInSpecificRange(cellPos, cellRange);
                const isInitialRow = this.rowPositionUtils.sameRow(row, initialPosition);

                if (isMovingUp) { this.isUp = true; }

                if (!isInitialRow) {
                    const cellComp = rowRenderer.getComponentForCell(cellPos);

                    if (cellComp) {
                        this.markedCellComps.push(cellComp);
                        const eGui = cellComp.getGui();

                        if (!cellInRange) {
                            _.addOrRemoveCssClass(eGui, 'ag-selection-fill-left', i === 0);
                            _.addOrRemoveCssClass(eGui, 'ag-selection-fill-right', i === colLen - 1);
                        }

                        _.addOrRemoveCssClass(
                            eGui,
                            isMovingUp ? 'ag-selection-fill-top' : 'ag-selection-fill-bottom',
                            this.rowPositionUtils.sameRow(row, endPosition)
                        );
                    }
                }
            }

            if (this.rowPositionUtils.sameRow(row, endPosition)) { break; }
        } while (
            row = isMovingUp ?
                this.cellNavigationService.getRowAbove(row) :
                this.cellNavigationService.getRowBelow(row)
        );
    }

    private reduceVertical(initialPosition: CellPosition, endPosition: CellPosition) {
        let row: RowPosition | null = initialPosition;

        do {
            const cellRange = this.getCellRange();
            const colLen = cellRange.columns.length;
            const isLastRow = this.rowPositionUtils.sameRow(row, endPosition);

            for (let i = 0; i < colLen; i++) {
                const rowPos = { rowIndex: row.rowIndex, rowPinned: row.rowPinned };
                const celPos = { ...rowPos, column: cellRange.columns[i] };
                const cellComp = this.rowRenderer.getComponentForCell(celPos);

                if (cellComp) {
                    this.markedCellComps.push(cellComp);

                    const eGui = cellComp.getGui();

                    _.addOrRemoveCssClass(
                        eGui,
                        'ag-selection-fill-bottom',
                        this.rowPositionUtils.sameRow(row, endPosition)
                    );
                }
            }
            if (isLastRow) { break; }
        } while (row = this.cellNavigationService.getRowAbove(row));
    }

    private extendHorizontal(initialPosition: CellPosition, endPosition: CellPosition, isMovingLeft?: boolean) {
        const allCols = this.columnController.getAllDisplayedColumns();
        const startCol = allCols.indexOf(isMovingLeft ? endPosition.column : initialPosition.column);
        const endCol = allCols.indexOf(isMovingLeft ? this.getCellRange().columns[0] : endPosition.column);
        const offset = isMovingLeft ? 0 : 1;

        const colsToMark = allCols.slice(startCol + offset, endCol + offset);
        const rangeStartRow = this.getRangeStartRow();
        const rangeEndRow = this.getRangeEndRow();

        colsToMark.forEach(column => {
            let row: RowPosition = rangeStartRow;
            let isLastRow = false;

            do {
                isLastRow = this.rowPositionUtils.sameRow(row, rangeEndRow);
                const cellComp = this.rowRenderer.getComponentForCell({
                    rowIndex: row.rowIndex,
                    rowPinned: row.rowPinned,
                    column: column
                });

                if (cellComp) {
                    this.markedCellComps.push(cellComp);
                    const eGui = cellComp.getGui();

                    _.addOrRemoveCssClass(eGui, 'ag-selection-fill-top', this.rowPositionUtils.sameRow(row, rangeStartRow));
                    _.addOrRemoveCssClass(eGui, 'ag-selection-fill-bottom', this.rowPositionUtils.sameRow(row, rangeEndRow));
                    if (isMovingLeft) {
                        this.isLeft = true;
                        _.addOrRemoveCssClass(eGui, 'ag-selection-fill-left', column === colsToMark[0]);
                    } else {
                        _.addOrRemoveCssClass(eGui, 'ag-selection-fill-right', column === _.last(colsToMark));
                    }
                }

                row = this.cellNavigationService.getRowBelow(row) as RowPosition;
            } while (!isLastRow);
        });
    }

    private reduceHorizontal(initialPosition: CellPosition, endPosition: CellPosition) {
        const allCols = this.columnController.getAllDisplayedColumns();
        const startCol = allCols.indexOf(endPosition.column);
        const endCol = allCols.indexOf(initialPosition.column);

        const colsToMark = allCols.slice(startCol, endCol);
        const rangeStartRow = this.getRangeStartRow();
        const rangeEndRow = this.getRangeEndRow();

        colsToMark.forEach(column => {
            let row: RowPosition = rangeStartRow;
            let isLastRow: boolean = false;

            do {
                isLastRow = this.rowPositionUtils.sameRow(row, rangeEndRow);
                const cellComp = this.rowRenderer.getComponentForCell({
                    rowIndex: row.rowIndex,
                    rowPinned: row.rowPinned,
                    column: column
                });

                if (cellComp) {
                    this.markedCellComps.push(cellComp);
                    const eGui = cellComp.getGui();
                    _.addOrRemoveCssClass(eGui, 'ag-selection-fill-right', column === colsToMark[0]);
                }

                row = this.cellNavigationService.getRowBelow(row) as RowPosition;
            }
            while (!isLastRow);
        });
    }

    public refresh(cellComp: CellComp) {
        const cellRange = this.rangeController.getCellRanges()[0];
        const isColumnRange = !cellRange.startRow || !cellRange.endRow;

        if (isColumnRange) {
            this.destroy();
            return;
        }

        super.refresh(cellComp);
    }
}
