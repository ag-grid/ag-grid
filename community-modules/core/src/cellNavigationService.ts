import { KeyCode } from './constants/keyCode';
import { BeanStub } from "./context/beanStub";
import { Bean } from "./context/context";
import { CellPosition } from "./entities/cellPositionUtils";
import { Column } from "./entities/column";
import { RowNode } from "./entities/rowNode";
import { RowPosition } from "./entities/rowPositionUtils";
import { last } from "./utils/array";
import { missing } from "./utils/generic";

@Bean('cellNavigationService')
export class CellNavigationService extends BeanStub {

    // returns null if no cell to focus on, ie at the end of the grid
    public getNextCellToFocus(key: string, focusedCell: CellPosition, ctrlPressed: boolean = false): CellPosition | null {
        if (ctrlPressed) {
            return this.getNextCellToFocusWithCtrlPressed(key, focusedCell);
        }

        return this.getNextCellToFocusWithoutCtrlPressed(key, focusedCell);
    }

    private getNextCellToFocusWithCtrlPressed(key: string, focusedCell: CellPosition): CellPosition | null {
        const upKey = key === KeyCode.UP;
        const downKey = key === KeyCode.DOWN;
        const leftKey = key === KeyCode.LEFT;

        let column: Column;
        let rowIndex: number;

        if (upKey || downKey) {
            rowIndex = upKey ? this.beans.paginationProxy.getPageFirstRow() : this.beans.paginationProxy.getPageLastRow();
            column = focusedCell.column;
        } else {
            const allColumns: Column[] = this.beans.columnModel.getAllDisplayedColumns();
            const isRtl = this.beans.gos.get('enableRtl');
            rowIndex = focusedCell.rowIndex;
            column = leftKey !== isRtl ? allColumns[0] : last(allColumns);
        }

        return {
            rowIndex,
            rowPinned: null,
            column
        };
    }

    private getNextCellToFocusWithoutCtrlPressed(key: string, focusedCell: CellPosition): CellPosition | null {
        // starting with the provided cell, we keep moving until we find a cell we can
        // focus on.
        let pointer: CellPosition | null = focusedCell;
        let finished = false;

        // finished will be true when either:
        // a) cell found that we can focus on
        // b) run out of cells (ie the method returns null)
        while (!finished) {

            switch (key) {
                case KeyCode.UP:
                    pointer = this.getCellAbove(pointer);
                    break;
                case KeyCode.DOWN:
                    pointer = this.getCellBelow(pointer);
                    break;
                case KeyCode.RIGHT:
                    if (this.beans.gos.get('enableRtl')) {
                        pointer = this.getCellToLeft(pointer);
                    } else {
                        pointer = this.getCellToRight(pointer);
                    }
                    break;
                case KeyCode.LEFT:
                    if (this.beans.gos.get('enableRtl')) {
                        pointer = this.getCellToRight(pointer);
                    } else {
                        pointer = this.getCellToLeft(pointer);
                    }
                    break;
                default:
                    pointer = null;
                    console.warn('AG Grid: unknown key for navigation ' + key);
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
        let rowNode: RowNode | undefined;

        switch (gridCell.rowPinned) {
            case 'top':
                rowNode = this.beans.pinnedRowModel.getPinnedTopRow(gridCell.rowIndex);
                break;
            case 'bottom':
                rowNode = this.beans.pinnedRowModel.getPinnedBottomRow(gridCell.rowIndex);
                break;
            default:
                rowNode = this.beans.rowModel.getRow(gridCell.rowIndex);
                break;
        }

        if (!rowNode) { return false; }

        const suppressNavigable = column.isSuppressNavigable(rowNode);
        return !suppressNavigable;
    }

    private getCellToLeft(lastCell: CellPosition | null): CellPosition | null {
        if (!lastCell) { return null; }

        const colToLeft = this.beans.columnModel.getDisplayedColBefore(lastCell.column);
        if (!colToLeft) { return null; }

        return {
            rowIndex: lastCell.rowIndex,
            column: colToLeft,
            rowPinned: lastCell.rowPinned
        } as CellPosition;
    }

    private getCellToRight(lastCell: CellPosition | null): CellPosition | null {
        if (!lastCell) { return null; }

        const colToRight = this.beans.columnModel.getDisplayedColAfter(lastCell.column);
        // if already on right, do nothing
        if (!colToRight) { return null; }

        return {
            rowIndex: lastCell.rowIndex,
            column: colToRight,
            rowPinned: lastCell.rowPinned
        } as CellPosition;
    }

    public getRowBelow(rowPosition: RowPosition): RowPosition | null {
        // if already on top row, do nothing
        const index = rowPosition.rowIndex;
        const pinned = rowPosition.rowPinned;
        if (this.isLastRowInContainer(rowPosition)) {
            switch (pinned) {
                case 'bottom':
                    // never any rows after pinned bottom
                    return null;
                case 'top':
                    // if on last row of pinned top, then next row is main body (if rows exist),
                    // otherwise it's the pinned bottom
                    if (this.beans.rowModel.isRowsToRender()) {
                        return { rowIndex: this.beans.paginationProxy.getPageFirstRow(), rowPinned: null } as RowPosition;
                    }

                    if (this.beans.pinnedRowModel.isRowsToRender('bottom')) {
                        return { rowIndex: 0, rowPinned: 'bottom' } as RowPosition;
                    }

                    return null;
                default:
                    // if in the main body, then try pinned bottom, otherwise return nothing
                    if (this.beans.pinnedRowModel.isRowsToRender('bottom')) {
                        return { rowIndex: 0, rowPinned: 'bottom' } as RowPosition;
                    }
                    return null;
            }
        }

        const rowNode = this.beans.rowModel.getRow(rowPosition.rowIndex);
        const nextStickyPosition = this.getNextStickyPosition(rowNode);

        if (nextStickyPosition) {
            return nextStickyPosition;
        }

        return { rowIndex: index + 1, rowPinned: pinned } as RowPosition;
    }

    private getNextStickyPosition(rowNode?: RowNode, up?: boolean): RowPosition | undefined {
        if (!this.beans.gos.isGroupRowsSticky() || !rowNode || !rowNode.sticky) { return; }

        const stickyRowCtrls = [...this.beans.rowRenderer.getStickyTopRowCtrls()].sort(
            (a, b) => a.getRowNode().rowIndex! - b.getRowNode().rowIndex!
        );

        const diff = up ? -1 : 1;
        const idx = stickyRowCtrls.findIndex(ctrl => ctrl.getRowNode().rowIndex === rowNode.rowIndex);
        const nextCtrl = stickyRowCtrls[idx + diff];

        if (nextCtrl) {
            return { rowIndex: nextCtrl.getRowNode().rowIndex!, rowPinned: null };
        }
    }

    private getCellBelow(lastCell: CellPosition | null): CellPosition | null {
        if (!lastCell) { return null; }

        const rowBelow = this.getRowBelow(lastCell);
        if (rowBelow) {
            return {
                rowIndex: rowBelow.rowIndex,
                column: lastCell.column,
                rowPinned: rowBelow.rowPinned
            } as CellPosition;
        }

        return null;
    }

    private isLastRowInContainer(rowPosition: RowPosition): boolean {
        const pinned = rowPosition.rowPinned;
        const index = rowPosition.rowIndex;

        if (pinned === 'top') {
            const lastTopIndex = this.beans.pinnedRowModel.getPinnedTopRowData().length - 1;
            return lastTopIndex <= index;
        }

        if (pinned === 'bottom') {
            const lastBottomIndex = this.beans.pinnedRowModel.getPinnedBottomRowData().length - 1;
            return lastBottomIndex <= index;
        }

        const lastBodyIndex = this.beans.paginationProxy.getPageLastRow();
        return lastBodyIndex <= index;
    }

    public getRowAbove(rowPosition: RowPosition): RowPosition | null {
        // if already on top row, do nothing
        const index = rowPosition.rowIndex;
        const pinned = rowPosition.rowPinned;
        const isFirstRow = pinned ? index === 0 : index === this.beans.paginationProxy.getPageFirstRow();

        // if already on top row, do nothing
        if (isFirstRow) {
            if (pinned === 'top') { return null; }

            if (!pinned) {
                if (this.beans.pinnedRowModel.isRowsToRender('top')) {
                    return this.getLastFloatingTopRow();
                }
                return null;
            }

            // last floating bottom
            if (this.beans.rowModel.isRowsToRender()) {
                return this.getLastBodyCell();
            }

            if (this.beans.pinnedRowModel.isRowsToRender('top')) {
                return this.getLastFloatingTopRow();
            }

            return null;
        }

        const rowNode = this.beans.rowModel.getRow(rowPosition.rowIndex);
        const nextStickyPosition = this.getNextStickyPosition(rowNode, true);

        if (nextStickyPosition) {
            return nextStickyPosition;
        }

        return { rowIndex: index - 1, rowPinned: pinned } as RowPosition;
    }

    private getCellAbove(lastCell: CellPosition | null): CellPosition | null {
        if (!lastCell) { return null; }

        const rowAbove = this.getRowAbove({ rowIndex: lastCell.rowIndex, rowPinned: lastCell.rowPinned });

        if (rowAbove) {
            return {
                rowIndex: rowAbove.rowIndex,
                column: lastCell.column,
                rowPinned: rowAbove.rowPinned
            } as CellPosition;
        }

        return null;
    }

    private getLastBodyCell(): RowPosition {
        const lastBodyRow = this.beans.paginationProxy.getPageLastRow();

        return { rowIndex: lastBodyRow, rowPinned: null } as RowPosition;
    }

    private getLastFloatingTopRow(): RowPosition {
        const lastFloatingRow = this.beans.pinnedRowModel.getPinnedTopRowData().length - 1;

        return { rowIndex: lastFloatingRow, rowPinned: 'top' } as RowPosition;
    }

    public getNextTabbedCell(gridCell: CellPosition, backwards: boolean): CellPosition | null {
        if (backwards) {
            return this.getNextTabbedCellBackwards(gridCell);
        }

        return this.getNextTabbedCellForwards(gridCell);
    }

    public getNextTabbedCellForwards(gridCell: CellPosition): CellPosition | null {
        const displayedColumns = this.beans.columnModel.getAllDisplayedColumns();

        let newRowIndex: number | null = gridCell.rowIndex;
        let newFloating: string | null | undefined = gridCell.rowPinned;

        // move along to the next cell
        let newColumn = this.beans.columnModel.getDisplayedColAfter(gridCell.column);

        // check if end of the row, and if so, go forward a row
        if (!newColumn) {
            newColumn = displayedColumns[0];

            const rowBelow = this.getRowBelow(gridCell);
            if (missing(rowBelow)) { return null; }

            // If we are tabbing and there is a paging panel present, tabbing should go
            // to the paging panel instead of loading the next page.
            if (!rowBelow.rowPinned && !this.beans.paginationProxy.isRowInPage(rowBelow)) {
                return null;
            }

            newRowIndex = rowBelow ? rowBelow.rowIndex : null;
            newFloating = rowBelow ? rowBelow.rowPinned : null;
        }

        return { rowIndex: newRowIndex, column: newColumn, rowPinned: newFloating } as CellPosition;
    }

    public getNextTabbedCellBackwards(gridCell: CellPosition): CellPosition | null {

        const displayedColumns = this.beans.columnModel.getAllDisplayedColumns();

        let newRowIndex: number | null = gridCell.rowIndex;
        let newFloating: string | null | undefined = gridCell.rowPinned;

        // move along to the next cell
        let newColumn = this.beans.columnModel.getDisplayedColBefore(gridCell.column);

        // check if end of the row, and if so, go forward a row
        if (!newColumn) {
            newColumn = last(displayedColumns);

            const rowAbove = this.getRowAbove({ rowIndex: gridCell.rowIndex, rowPinned: gridCell.rowPinned });

            if (missing(rowAbove)) { return null; }

            // If we are tabbing and there is a paging panel present, tabbing should go
            // to the paging panel instead of loading the next page.
            if (!rowAbove.rowPinned && !this.beans.paginationProxy.isRowInPage(rowAbove)) {
                return null;
            }

            newRowIndex = rowAbove ? rowAbove.rowIndex : null;
            newFloating = rowAbove ? rowAbove.rowPinned : null;
        }

        return { rowIndex: newRowIndex, column: newColumn, rowPinned: newFloating } as CellPosition;
    }

}
