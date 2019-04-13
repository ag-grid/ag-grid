import {
    CellComp,
    CellPosition,
    RowPosition,
    RowPositionUtils,
    _,
} from 'ag-grid-community';

import { AbstractSelectionHandle } from "./abstractSelectionHandle";

export class FillHandle extends AbstractSelectionHandle {

    static TEMPLATE = '<div class="ag-fill-handle"></div>';

    private lastCellMarked: CellPosition | undefined;
    private markedCellComps: CellComp[] = [];
    private dragAxis: 'x' | 'y';
    private isUp: boolean = false;
    private isLeft: boolean = false;

    protected type = 'fill';

    constructor() {
        super(FillHandle.TEMPLATE);
    }

    protected onDrag(e: MouseEvent) {
        const { x, y } = this.getGui().getBoundingClientRect() as DOMRect;
        const diffX = Math.abs(x - e.clientX);
        const diffY = Math.abs(y - e.clientY);
        const direction: 'x' | 'y' = diffX > diffY ? 'x' : 'y';

        if (direction !== this.dragAxis) {
            this.dragAxis = direction;
        }

        const cellComp = this.getCellComp();
        const lastCellHovered = this.getLastCellHovered();

        if (lastCellHovered && lastCellHovered !== this.lastCellMarked) {
            this.lastCellMarked = lastCellHovered;
            this.markPathFrom(cellComp!.getCellPosition(), lastCellHovered);
        }
    }

    protected onDragEnd(e: MouseEvent) {
        if (this.markedCellComps.length) {
            const isX = this.dragAxis === 'x';
            const cellRange = this.getCellRange();
            const colLen = cellRange.columns.length;
            const rangeStartRow = this.getRangeStartRow();
            const rangeEndRow = this.getRangeEndRow();

            if (!this.isUp && !this.isLeft) {
                const startPosition = {
                    rowIndex: rangeStartRow.rowIndex,
                    rowPinned: rangeStartRow.rowPinned,
                    column: cellRange.columns[0]
                }
                this.rangeController.setRangeToCell(startPosition);
                this.rangeController.extendLatestRangeToCell({
                    rowIndex: isX ? rangeEndRow.rowIndex : this.lastCellMarked!.rowIndex,
                    rowPinned: isX ? rangeEndRow.rowPinned : this.lastCellMarked!.rowPinned,
                    column: isX ? this.lastCellMarked!.column : cellRange.columns[colLen - 1]
                });
            }
            else {
                const startRow = isX ? rangeStartRow: this.lastCellMarked!;
                const startPosition = {
                    rowIndex: startRow.rowIndex,
                    rowPinned: startRow.rowPinned,
                    column: isX ? this.lastCellMarked!.column : cellRange.columns[0]
                }
                this.rangeController.setRangeToCell(startPosition);

                this.rangeController.extendLatestRangeToCell({
                    rowIndex: rangeEndRow.rowIndex,
                    rowPinned: rangeEndRow.rowPinned,
                    column: cellRange.columns[colLen - 1]
                });
            }
        }

        this.clearValues();
    }

    protected clearValues() {
        this.clearMarkedPath();
        this.lastCellMarked = undefined;

        super.clearValues();
    }

    private markPathFrom(initialPosition: CellPosition, currentPosition: CellPosition) {
        this.clearMarkedPath();
        if (this.dragAxis === 'y') {
            if (RowPositionUtils.sameRow(currentPosition, initialPosition)) { return; }

            const isBefore = RowPositionUtils.before(currentPosition, initialPosition);
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
            }
            else {
                this.extendVertical(initialPosition, currentPosition, isBefore);
            }
        }
        else {
            const initialColumn = initialPosition.column;
            const currentColumn = currentPosition.column;

            if (initialColumn === currentColumn) { return; }

            const displayedColumns = this.columnController.getAllDisplayedColumns();
            const initialIndex = displayedColumns.indexOf(initialColumn)
            const currentIndex = displayedColumns.indexOf(currentColumn);

            if (currentIndex <= initialIndex && currentIndex >= displayedColumns.indexOf(this.getCellRange().columns[0])) {
                this.reduceHorizontal(initialPosition, currentPosition)
            } 
            else {
                this.extendHorizontal(initialPosition, currentPosition, currentIndex < initialIndex);
            }
        }
    }

    private extendVertical(initialPosition: CellPosition, endPosition: CellPosition, isMovingUp?: boolean) {
        let row: RowPosition | null = initialPosition;

        while(
            row = isMovingUp ? 
                this.cellNavigationService.getRowAbove(row.rowIndex, row.rowPinned as string) : 
                this.cellNavigationService.getRowBelow(row)
        ) {
            const cellRange = this.getCellRange();
            const colLen = cellRange.columns.length;
            for (let i = 0; i < colLen; i++) {
                const cellComp = this.rowRenderer.getComponentForCell({
                    rowIndex: row.rowIndex,
                    rowPinned: row.rowPinned,
                    column: cellRange.columns[i]
                });

                if (!cellComp) { continue; }
                this.markedCellComps.push(cellComp);

                const eGui = cellComp.getGui();

                _.addOrRemoveCssClass(eGui, 'ag-selection-fill-left', i === 0);
                _.addOrRemoveCssClass(eGui, 'ag-selection-fill-right', i === colLen - 1);

                _.addOrRemoveCssClass(
                    eGui, 
                    isMovingUp ? 'ag-selection-fill-top' : 'ag-selection-fill-bottom',
                    RowPositionUtils.sameRow(row, endPosition)
                );

                if (isMovingUp) { this.isUp = true; }
            }

            if (RowPositionUtils.sameRow(row, endPosition)) { break; }
        }
    }

    private reduceVertical(initialPosition: CellPosition, endPosition: CellPosition) {
        let row: RowPosition | null = initialPosition;

        while(row = this.cellNavigationService.getRowAbove(row.rowIndex, row.rowPinned as string)) {
            const cellRange = this.getCellRange();
            const colLen = cellRange.columns.length;
            for (let i = 0; i < colLen; i++) {
                const cellComp = this.rowRenderer.getComponentForCell({
                    rowIndex: row.rowIndex,
                    rowPinned: row.rowPinned,
                    column: cellRange.columns[i]
                });

                if (!cellComp) { continue; }

                this.markedCellComps.push(cellComp);

                const eGui = cellComp.getGui();
        
                _.addOrRemoveCssClass(
                    eGui, 
                    'ag-selection-fill-bottom',
                    RowPositionUtils.sameRow(row, endPosition)
                );
            }

            if (RowPositionUtils.sameRow(row, endPosition)) { break; }
        }
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
            let isLastRow: boolean = false;

            do {
                isLastRow = RowPositionUtils.sameRow(row, rangeEndRow);
                const cellComp = this.rowRenderer.getComponentForCell({
                    rowIndex: row.rowIndex,
                    rowPinned: row.rowPinned,
                    column: column
                });

                if (cellComp) {
                    this.markedCellComps.push(cellComp);
                    const eGui = cellComp.getGui();

                    _.addOrRemoveCssClass(eGui, 'ag-selection-fill-top', RowPositionUtils.sameRow(row, rangeStartRow));
                    _.addOrRemoveCssClass(eGui, 'ag-selection-fill-bottom', RowPositionUtils.sameRow(row, rangeEndRow));
                    if (isMovingLeft) {
                        this.isLeft = true;
                        _.addOrRemoveCssClass(eGui, 'ag-selection-fill-left', column === colsToMark[0]);
                    }
                    else {
                        _.addOrRemoveCssClass(eGui, 'ag-selection-fill-right', column === _.last(colsToMark));
                    }
                }

                row = this.cellNavigationService.getRowBelow(row) as RowPosition;
            }
            while(!isLastRow)
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
                isLastRow = RowPositionUtils.sameRow(row, rangeEndRow);
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
            while(!isLastRow)
        });
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