import { Autowired, Bean } from "./context/context";
import { Constants } from "./constants";
import { ColumnController } from "./columnController/columnController";
import { IRowModel } from "./interfaces/iRowModel";
import { CellPosition } from "./entities/gridCell";
import { GridOptionsWrapper } from "./gridOptionsWrapper";
import { PinnedRowModel } from "./rowModels/pinnedRowModel";
import { RowNode } from "./entities/rowNode";
import { Column } from "./entities/column";
import { _ } from "./utils";
import {RowPosition} from "./interfaces/iRangeController";

@Bean('cellNavigationService')
export class CellNavigationService {

    @Autowired('columnController') private columnController: ColumnController;
    @Autowired('rowModel') private rowModel: IRowModel;
    @Autowired('pinnedRowModel') private pinnedRowModel: PinnedRowModel;
    @Autowired('gridOptionsWrapper') private gridOptionsWrapper: GridOptionsWrapper;

    // returns null if no cell to focus on, ie at the end of the grid
    public getNextCellToFocus(key: any, lastCellToFocus: CellPosition): CellPosition | null {

        // starting with the provided cell, we keep moving until we find a cell we can
        // focus on.
        let pointer: CellPosition | null = lastCellToFocus;
        let finished = false;

        // finished will be true when either:
        // a) cell found that we can focus on
        // b) run out of cells (ie the method returns null)
        while (!finished) {

            switch (key) {
                case Constants.KEY_UP :
                    pointer = this.getCellAbove(pointer);
                    break;
                case Constants.KEY_DOWN :
                    pointer = this.getCellBelow(pointer);
                    break;
                case Constants.KEY_RIGHT :
                    if (this.gridOptionsWrapper.isEnableRtl()) {
                        pointer = this.getCellToLeft(pointer);
                    } else {
                        pointer = this.getCellToRight(pointer);
                    }
                    break;
                case Constants.KEY_LEFT :
                    if (this.gridOptionsWrapper.isEnableRtl()) {
                        pointer = this.getCellToRight(pointer);
                    } else {
                        pointer = this.getCellToLeft(pointer);
                    }
                    break;
                default :
                    pointer = null;
                    console.warn('ag-Grid: unknown key for navigation ' + key);
                    break;
            }

            if (pointer) {
                finished = this.isCellGoodToFocusOn(pointer);
            } else {
                finished = true;
            }
        }

        return pointer;
    }

    private isCellGoodToFocusOn(gridCell: CellPosition): boolean {
        const column: Column = gridCell.column;
        let rowNode: RowNode;

        switch (gridCell.floating) {
            case Constants.PINNED_TOP:
                rowNode = this.pinnedRowModel.getPinnedTopRow(gridCell.rowIndex);
                break;
            case Constants.PINNED_BOTTOM:
                rowNode = this.pinnedRowModel.getPinnedBottomRow(gridCell.rowIndex);
                break;
            default:
                rowNode = this.rowModel.getRow(gridCell.rowIndex);
                break;
        }

        const suppressNavigable = column.isSuppressNavigable(rowNode);
        return !suppressNavigable;
    }

    private getCellToLeft(lastCell: CellPosition | null): CellPosition | null {
        if (!lastCell) {
            return null;
        }

        const colToLeft = this.columnController.getDisplayedColBefore(lastCell.column);
        if (!colToLeft) {
            return null;
        } else {
            return {
                rowIndex: lastCell.rowIndex,
                column: colToLeft,
                floating: lastCell.floating
            } as CellPosition;
        }
    }

    private getCellToRight(lastCell: CellPosition | null): CellPosition | null {
        if (!lastCell) {
            return null;
        }

        const colToRight = this.columnController.getDisplayedColAfter(lastCell.column);
        // if already on right, do nothing
        if (!colToRight) {
            return null;
        } else {
            return {
                rowIndex: lastCell.rowIndex,
                column: colToRight,
                floating: lastCell.floating
            } as CellPosition;
        }
    }

    public getRowBelow(rowPosition: RowPosition): RowPosition | null {
        // if already on top row, do nothing
        const index = rowPosition.rowIndex;
        const pinned = rowPosition.floating;
        if (this.isLastRowInContainer(rowPosition)) {
            if (pinned===Constants.PINNED_TOP) {
                return null;
            } else if (!pinned) {
                if (this.pinnedRowModel.isRowsToRender(Constants.PINNED_BOTTOM)) {
                    return {rowIndex: 0, floating: Constants.PINNED_BOTTOM} as RowPosition;
                } else {
                    return null;
                }
            } else {
                if (this.rowModel.isRowsToRender()) {
                    return {rowIndex: 0, floating: null} as RowPosition;
                } else if (this.pinnedRowModel.isRowsToRender(Constants.PINNED_BOTTOM)) {
                    return {rowIndex: 0, floating: Constants.PINNED_BOTTOM} as RowPosition;
                } else {
                    return null;
                }
            }
        } else {
            return {rowIndex: index + 1, floating: pinned} as RowPosition;
        }
    }

    private getCellBelow(lastCell: CellPosition | null): CellPosition | null {
        if (!lastCell) {
            return null;
        }

        const rowBelow = this.getRowBelow(lastCell);
        if (rowBelow) {
            return {
                rowIndex: rowBelow.rowIndex,
                column: lastCell.column,
                floating: rowBelow.floating
            } as CellPosition;
        } else {
            return null;
        }
    }

    private isLastRowInContainer(rowPosition: RowPosition): boolean {
        const pinned = rowPosition.floating;
        const index = rowPosition.rowIndex;
        if (pinned===Constants.PINNED_TOP) {
            const lastTopIndex = this.pinnedRowModel.getPinnedTopRowData().length - 1;
            return lastTopIndex <= index;
        } else if (pinned===Constants.PINNED_BOTTOM) {
            const lastBottomIndex = this.pinnedRowModel.getPinnedBottomRowData().length - 1;
            return lastBottomIndex <= index;
        } else {
            const lastBodyIndex = this.rowModel.getPageLastRow();
            return lastBodyIndex <= index;
        }
    }

    private getRowAbove(rowIndex: number, pinned: string): RowPosition | null {
        // if already on top row, do nothing
        if (rowIndex === 0) {
            if (pinned === Constants.PINNED_TOP) {
                return null;
            } else if (!pinned) {
                if (this.pinnedRowModel.isRowsToRender(Constants.PINNED_TOP)) {
                    return this.getLastFloatingTopRow();
                } else {
                    return null;
                }
            } else {
                // last floating bottom
                if (this.rowModel.isRowsToRender()) {
                    return this.getLastBodyCell();
                } else if (this.pinnedRowModel.isRowsToRender(Constants.PINNED_TOP)) {
                    return this.getLastFloatingTopRow();
                } else {
                    return null;
                }
            }
        } else {
            return {rowIndex: rowIndex - 1, floating: pinned} as RowPosition;
        }

    }

    private getCellAbove(lastCell: CellPosition | null): CellPosition | null {
        if (!lastCell) {
            return null;
        }

        const rowAbove = this.getRowAbove(lastCell.rowIndex, lastCell.floating);
        if (rowAbove) {
            return {
                rowIndex: rowAbove.rowIndex,
                column: lastCell.column,
                floating: rowAbove.floating
            } as CellPosition;
        } else {
            return null;
        }
    }

    private getLastBodyCell(): RowPosition {
        const lastBodyRow = this.rowModel.getPageLastRow();
        return {rowIndex: lastBodyRow, floating: null} as RowPosition;
    }

    private getLastFloatingTopRow(): RowPosition {
        const lastFloatingRow = this.pinnedRowModel.getPinnedTopRowData().length - 1;
        return {rowIndex: lastFloatingRow, floating: Constants.PINNED_TOP} as RowPosition;
    }

    public getNextTabbedCell(gridCell: CellPosition, backwards: boolean): CellPosition | null {
        if (backwards) {
            return this.getNextTabbedCellBackwards(gridCell);
        } else {
            return this.getNextTabbedCellForwards(gridCell);
        }
    }

    public getNextTabbedCellForwards(gridCell: CellPosition): CellPosition | null {

        const displayedColumns = this.columnController.getAllDisplayedColumns();

        let newRowIndex: number | null = gridCell.rowIndex;
        let newFloating: string | null = gridCell.floating;

        // move along to the next cell
        let newColumn = this.columnController.getDisplayedColAfter(gridCell.column);

        // check if end of the row, and if so, go forward a row
        if (!newColumn) {
            newColumn = displayedColumns[0];

            const rowBelow = this.getRowBelow(gridCell);
            if (_.missing(rowBelow)) {
                return null;
            }
            newRowIndex = rowBelow ? rowBelow.rowIndex : null;
            newFloating = rowBelow ? rowBelow.floating : null;
        }

        return {rowIndex: newRowIndex, column: newColumn, floating: newFloating} as CellPosition;
    }

    public getNextTabbedCellBackwards(gridCell: CellPosition): CellPosition | null {

        const displayedColumns = this.columnController.getAllDisplayedColumns();

        let newRowIndex: number | null = gridCell.rowIndex;
        let newFloating: string | null = gridCell.floating;

        // move along to the next cell
        let newColumn = this.columnController.getDisplayedColBefore(gridCell.column);

        // check if end of the row, and if so, go forward a row
        if (!newColumn) {
            newColumn = displayedColumns[displayedColumns.length - 1];

            const rowAbove = this.getRowAbove(gridCell.rowIndex, gridCell.floating);
            if (_.missing(rowAbove)) {
                return null;
            }
            newRowIndex = rowAbove ? rowAbove.rowIndex : null;
            newFloating = rowAbove ? rowAbove.floating : null;
        }

        return {rowIndex: newRowIndex, column: newColumn, floating: newFloating} as CellPosition;
    }

}