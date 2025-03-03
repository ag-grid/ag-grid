import { KeyCode } from '../constants/keyCode';
import type { NamedBean } from '../context/bean';
import { BeanStub } from '../context/beanStub';
import type { BeanCollection } from '../context/context';
import type { AgColumn } from '../entities/agColumn';
import { _getRowAbove, _getRowBelow } from '../entities/positionUtils';
import type { RowNode } from '../entities/rowNode';
import type { CellPosition } from '../interfaces/iCellPosition';
import type { IRowNode } from '../interfaces/iRowNode';
import type { RowSpanService } from '../rendering/spanning/rowSpanService';
import { _last } from '../utils/array';
import { _missing } from '../utils/generic';
import { _warn } from '../validation/logging';

export class CellNavigationService extends BeanStub implements NamedBean {
    beanName = 'cellNavigation' as const;

    private rowSpanSvc: RowSpanService | undefined;

    public wireBeans(beans: BeanCollection) {
        this.rowSpanSvc = beans.rowSpanSvc;
    }

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

        const { pageBounds, gos, visibleCols } = this.beans;
        if (upKey || downKey) {
            rowIndex = upKey ? pageBounds.getFirstRow() : pageBounds.getLastRow();
            column = focusedCell.column as AgColumn;
        } else {
            const isRtl = gos.get('enableRtl');
            rowIndex = focusedCell.rowIndex;
            const allColumns = leftKey !== isRtl ? visibleCols.allCols : [...visibleCols.allCols].reverse();

            column = allColumns.find((col) =>
                this.isCellGoodToFocusOn({
                    rowIndex,
                    rowPinned: null,
                    column: col,
                })
            );
        }

        return column
            ? {
                  rowIndex,
                  rowPinned: null,
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
                    _warn(8, { key });
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
        const column = gridCell.column as AgColumn;
        let rowNode: RowNode | undefined;
        const { pinnedRowModel, rowModel } = this.beans;

        switch (gridCell.rowPinned) {
            case 'top':
                rowNode = pinnedRowModel?.getPinnedTopRow(gridCell.rowIndex);
                break;
            case 'bottom':
                rowNode = pinnedRowModel?.getPinnedBottomRow(gridCell.rowIndex);
                break;
            default:
                rowNode = rowModel.getRow(gridCell.rowIndex);
                break;
        }

        if (!rowNode) {
            return false;
        }

        const suppressNavigable = this.isSuppressNavigable(column, rowNode);
        return !suppressNavigable;
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

        // adjust spanned cell so when moving down asserts use of last row in cell
        const adjustedLastCell = this.rowSpanSvc?.getCellEnd(lastCell) ?? lastCell;

        const rowBelow = _getRowBelow(this.beans, adjustedLastCell);
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

        // adjust spanned cell so when moving up asserts use of first row in cell
        const adjustedLastCell = this.rowSpanSvc?.getCellStart(lastCell) ?? lastCell;

        const rowAbove = _getRowAbove(this.beans, {
            rowIndex: adjustedLastCell.rowIndex,
            rowPinned: adjustedLastCell.rowPinned,
        });

        if (rowAbove) {
            return {
                rowIndex: rowAbove.rowIndex,
                column: lastCell.column,
                rowPinned: rowAbove.rowPinned,
            } as CellPosition;
        }

        return null;
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

            const rowBelow = _getRowBelow(this.beans, gridCell);
            if (_missing(rowBelow)) {
                return null;
            }

            if (!rowBelow.rowPinned && !(pagination?.isRowInPage(rowBelow.rowIndex!) ?? true)) {
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

            const rowAbove = _getRowAbove(beans, { rowIndex: gridCell.rowIndex, rowPinned: gridCell.rowPinned });

            if (_missing(rowAbove)) {
                return null;
            }

            // If we are tabbing and there is a paging panel present, tabbing should go
            // to the paging panel instead of loading the next page.
            if (!rowAbove.rowPinned && !(pagination?.isRowInPage(rowAbove.rowIndex!) ?? true)) {
                return null;
            }

            newRowIndex = rowAbove ? rowAbove.rowIndex : null;
            newFloating = rowAbove ? rowAbove.rowPinned : null;
        }

        return { rowIndex: newRowIndex, column: newColumn, rowPinned: newFloating } as CellPosition;
    }

    public isSuppressNavigable(column: AgColumn, rowNode: IRowNode): boolean {
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
