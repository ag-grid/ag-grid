import { KeyCode, _last, _missing } from 'ag-stack';

import { isRowNumberCol } from '../columns/columnUtils';
import type { NamedBean } from '../context/bean';
import { BeanStub } from '../context/beanStub';
import type { AgColumn } from '../entities/agColumn';
import { _getFocusColumn, _getRowAbove, _getRowBelow, _getRowNode } from '../entities/positionUtils';
import { _isClientSideLoadingRow } from '../gridOptionsUtils';
import type { CellPosition } from '../interfaces/iCellPosition';
import type { IRowNode, RowPinnedType } from '../interfaces/iRowNode';

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export class CellNavigationService extends BeanStub implements NamedBean {
    beanName = 'cellNavigation' as const;

    // returns null if no cell to focus on, ie at the end of the grid
    public getNextCellToFocus(
        key: string,
        focusedCell: CellPosition,
        ctrlPressed: boolean = false
    ): CellPosition | null {
        if (ctrlPressed) {
            return this.getNextCellToFocusWithCtrlPressed(key, focusedCell);
        }

        return this.getNextCellToFocusWithoutCtrlPressed(key, focusedCell);
    }

    private getNextCellToFocusWithCtrlPressed(key: string, focusedCell: CellPosition): CellPosition | null {
        const upKey = key === KeyCode.UP;
        const downKey = key === KeyCode.DOWN;
        const leftKey = key === KeyCode.LEFT;

        let column: AgColumn | undefined;
        let rowIndex: number;

        const { pageBounds, gos, pinnedRowModel } = this.beans;
        const { rowPinned } = focusedCell;
        if (upKey || downKey) {
            if (rowPinned && pinnedRowModel) {
                if (upKey) {
                    rowIndex = 0;
                } else {
                    rowIndex =
                        rowPinned === 'top'
                            ? pinnedRowModel.getPinnedTopRowCount() - 1
                            : pinnedRowModel.getPinnedBottomRowCount() - 1;
                }
            } else {
                rowIndex = upKey ? pageBounds.getFirstRow() : pageBounds.getLastRow();
            }
            column = focusedCell.column as AgColumn;
        } else {
            rowIndex = focusedCell.rowIndex;
            column = this.getRowEdgeCol(rowIndex, rowPinned, leftKey === gos.get('enableRtl'));
        }

        return column
            ? {
                  rowIndex,
                  rowPinned,
                  column,
              }
            : null;
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
                    pointer = this.gos.get('enableRtl') ? this.getCellToLeft(pointer) : this.getCellToRight(pointer);
                    break;
                case KeyCode.LEFT:
                    pointer = this.gos.get('enableRtl') ? this.getCellToRight(pointer) : this.getCellToLeft(pointer);
                    break;
                default:
                    pointer = null;
                    // unknown key, do nothing
                    this.warn(8, { key });
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

    /** The first column from one end of the row, row numbers aside, whose cell can take focus. */
    public getRowEdgeCol(rowIndex: number, rowPinned: RowPinnedType, fromEnd: boolean): AgColumn | undefined {
        const allCols = this.beans.visibleCols.allCols;
        for (let i = 0, len = allCols.length; i < len; ++i) {
            const column = allCols[fromEnd ? len - 1 - i : i];
            if (!isRowNumberCol(column) && this.isCellGoodToFocusOn({ rowIndex, rowPinned, column })) {
                return column;
            }
        }
        return undefined;
    }

    public isCellGoodToFocusOn(gridCell: CellPosition): boolean {
        const rowNode = _getRowNode(this.beans, gridCell);
        return !!rowNode && !this.isSuppressNavigable(_getFocusColumn(this.beans, gridCell), rowNode);
    }

    private getCellToLeft(lastCell: CellPosition | null): CellPosition | null {
        if (!lastCell) {
            return null;
        }

        const colToLeft = this.beans.visibleCols.getColBefore(lastCell.column as AgColumn);
        if (!colToLeft) {
            return null;
        }

        return {
            rowIndex: lastCell.rowIndex,
            column: colToLeft,
            rowPinned: lastCell.rowPinned,
        } as CellPosition;
    }

    private getCellToRight(lastCell: CellPosition | null): CellPosition | null {
        if (!lastCell) {
            return null;
        }

        const colToRight = this.beans.visibleCols.getColAfter(lastCell.column as AgColumn);
        // if already on right, do nothing
        if (!colToRight) {
            return null;
        }

        return {
            rowIndex: lastCell.rowIndex,
            column: colToRight,
            rowPinned: lastCell.rowPinned,
        } as CellPosition;
    }

    private getCellBelow(lastCell: CellPosition | null): CellPosition | null {
        if (!lastCell) {
            return null;
        }

        const { beans } = this;
        // adjust spanned cell so when moving down asserts use of last row in cell
        const adjustedLastCell = beans.rowSpanSvc?.getCellEnd(lastCell) ?? lastCell;

        const rowBelow = _getRowBelow(beans, adjustedLastCell, true);
        if (rowBelow) {
            return {
                rowIndex: rowBelow.rowIndex,
                column: lastCell.column,
                rowPinned: rowBelow.rowPinned,
            } as CellPosition;
        }

        return null;
    }

    private getCellAbove(lastCell: CellPosition | null): CellPosition | null {
        if (!lastCell) {
            return null;
        }

        const { beans } = this;
        // adjust spanned cell so when moving up asserts use of first row in cell
        const adjustedLastCell = beans.rowSpanSvc?.getCellStart(lastCell) ?? lastCell;

        const rowAbove = _getRowAbove(
            beans,
            {
                rowIndex: adjustedLastCell.rowIndex,
                rowPinned: adjustedLastCell.rowPinned,
            },
            true
        );

        if (rowAbove) {
            return {
                rowIndex: rowAbove.rowIndex,
                column: lastCell.column,
                rowPinned: rowAbove.rowPinned,
            } as CellPosition;
        }

        return null;
    }

    /** The next cell in tab order, across rows, that can take focus; null past the last one on the page. */
    public getNextTabStop(gridCell: CellPosition, backwards: boolean): CellPosition | null {
        let next = this.getNextTabbedCell(gridCell, backwards);
        while (next && !this.isCellGoodToFocusOn(next)) {
            next = this.getNextTabbedCell(next, backwards);
        }
        return next;
    }

    public getNextTabbedCell(gridCell: CellPosition, backwards: boolean): CellPosition | null {
        if (backwards) {
            return this.getNextTabbedCellBackwards(gridCell);
        }

        return this.getNextTabbedCellForwards(gridCell);
    }

    public getNextTabbedCellForwards(gridCell: CellPosition): CellPosition | null {
        const { visibleCols, pagination } = this.beans;
        const displayedColumns = visibleCols.allCols;

        let newRowIndex: number | null = gridCell.rowIndex;
        let newFloating: string | null | undefined = gridCell.rowPinned;

        // move along to the next cell
        let newColumn = visibleCols.getColAfter(gridCell.column as AgColumn);

        // check if end of the row, and if so, go forward a row
        if (!newColumn) {
            newColumn = displayedColumns[0];

            const rowBelow = _getRowBelow(this.beans, gridCell, true);
            if (_missing(rowBelow)) {
                return null;
            }

            if (!rowBelow.rowPinned && !(pagination?.isRowInPage(rowBelow.rowIndex) ?? true)) {
                return null;
            }

            newRowIndex = rowBelow ? rowBelow.rowIndex : null;
            newFloating = rowBelow ? rowBelow.rowPinned : null;
        }

        return { rowIndex: newRowIndex, column: newColumn, rowPinned: newFloating } as CellPosition;
    }

    public getNextTabbedCellBackwards(gridCell: CellPosition): CellPosition | null {
        const { beans } = this;
        const { visibleCols, pagination } = beans;
        const displayedColumns = visibleCols.allCols;

        let newRowIndex: number | null = gridCell.rowIndex;
        let newFloating: string | null | undefined = gridCell.rowPinned;

        // move along to the next cell
        let newColumn = visibleCols.getColBefore(gridCell.column as AgColumn);

        // check if end of the row, and if so, go forward a row
        if (!newColumn) {
            newColumn = _last(displayedColumns);

            const rowAbove = _getRowAbove(beans, { rowIndex: gridCell.rowIndex, rowPinned: gridCell.rowPinned }, true);

            if (_missing(rowAbove)) {
                return null;
            }

            // If we are tabbing and there is a paging panel present, tabbing should go
            // to the paging panel instead of loading the next page.
            if (!rowAbove.rowPinned && !(pagination?.isRowInPage(rowAbove.rowIndex) ?? true)) {
                return null;
            }

            newRowIndex = rowAbove ? rowAbove.rowIndex : null;
            newFloating = rowAbove ? rowAbove.rowPinned : null;
        }

        return { rowIndex: newRowIndex, column: newColumn, rowPinned: newFloating } as CellPosition;
    }

    public isSuppressNavigable(column: AgColumn, rowNode: IRowNode): boolean {
        if (_isClientSideLoadingRow(this.gos, rowNode)) {
            return true;
        }
        const { suppressNavigable } = column.colDef;
        // if boolean set, then just use it
        if (typeof suppressNavigable === 'boolean') {
            return suppressNavigable;
        }

        // if function, then call the function to find out
        if (typeof suppressNavigable === 'function') {
            const params = column.createColumnFunctionCallbackParams(rowNode);
            const userFunc = suppressNavigable;
            return userFunc(params);
        }

        return false;
    }
}
