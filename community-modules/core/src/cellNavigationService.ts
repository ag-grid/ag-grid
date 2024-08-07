import type { VisibleColsService } from './columns/visibleColsService';
import { KeyCode } from './constants/keyCode';
import type { NamedBean } from './context/bean';
import { BeanStub } from './context/beanStub';
import type { BeanCollection } from './context/context';
import type { AgColumn } from './entities/agColumn';
import type { CellPosition } from './entities/cellPositionUtils';
import type { RowNode } from './entities/rowNode';
import type { RowPosition } from './entities/rowPositionUtils';
import { isGroupRowsSticky } from './gridOptionsUtils';
import type { IRowModel } from './interfaces/iRowModel';
import type { PageBoundsService } from './pagination/pageBoundsService';
import type { PaginationService } from './pagination/paginationService';
import type { PinnedRowModel } from './pinnedRowModel/pinnedRowModel';
import type { RowCtrl } from './rendering/row/rowCtrl';
import type { RowRenderer } from './rendering/rowRenderer';
import { _last } from './utils/array';
import { _warnOnce } from './utils/function';
import { _missing } from './utils/generic';

export class CellNavigationService extends BeanStub implements NamedBean {
    beanName = 'cellNavigationService' as const;

    private visibleColsService: VisibleColsService;
    private rowModel: IRowModel;
    private rowRenderer: RowRenderer;
    private pinnedRowModel: PinnedRowModel;
    private paginationService?: PaginationService;
    private pageBoundsService: PageBoundsService;

    public wireBeans(beans: BeanCollection): void {
        this.visibleColsService = beans.visibleColsService;
        this.rowModel = beans.rowModel;
        this.rowRenderer = beans.rowRenderer;
        this.pinnedRowModel = beans.pinnedRowModel;
        this.paginationService = beans.paginationService;
        this.pageBoundsService = beans.pageBoundsService;
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

        let column: AgColumn;
        let rowIndex: number;

        if (upKey || downKey) {
            rowIndex = upKey ? this.pageBoundsService.getFirstRow() : this.pageBoundsService.getLastRow();
            column = focusedCell.column as AgColumn;
        } else {
            const allColumns = this.visibleColsService.getAllCols();
            const isRtl = this.gos.get('enableRtl');
            rowIndex = focusedCell.rowIndex;
            column = leftKey !== isRtl ? allColumns[0] : _last(allColumns);
        }

        return {
            rowIndex,
            rowPinned: null,
            column,
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
                    if (this.gos.get('enableRtl')) {
                        pointer = this.getCellToLeft(pointer);
                    } else {
                        pointer = this.getCellToRight(pointer);
                    }
                    break;
                case KeyCode.LEFT:
                    if (this.gos.get('enableRtl')) {
                        pointer = this.getCellToRight(pointer);
                    } else {
                        pointer = this.getCellToLeft(pointer);
                    }
                    break;
                default:
                    pointer = null;
                    _warnOnce('unknown key for navigation ', key);
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

        switch (gridCell.rowPinned) {
            case 'top':
                rowNode = this.pinnedRowModel.getPinnedTopRow(gridCell.rowIndex);
                break;
            case 'bottom':
                rowNode = this.pinnedRowModel.getPinnedBottomRow(gridCell.rowIndex);
                break;
            default:
                rowNode = this.rowModel.getRow(gridCell.rowIndex);
                break;
        }

        if (!rowNode) {
            return false;
        }

        const suppressNavigable = column.isSuppressNavigable(rowNode);
        return !suppressNavigable;
    }

    private getCellToLeft(lastCell: CellPosition | null): CellPosition | null {
        if (!lastCell) {
            return null;
        }

        const colToLeft = this.visibleColsService.getColBefore(lastCell.column as AgColumn);
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

        const colToRight = this.visibleColsService.getColAfter(lastCell.column as AgColumn);
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

    public getRowBelow(rowPosition: RowPosition): RowPosition | null {
        // if already on top row, do nothing
        const index = rowPosition.rowIndex;
        const pinned = rowPosition.rowPinned;
        let ignoreSticky = false;
        if (this.isLastRowInContainer(rowPosition)) {
            switch (pinned) {
                case 'bottom':
                    // never any rows after pinned bottom
                    return null;
                case 'top':
                    // if on last row of pinned top, then next row is main body (if rows exist),
                    // otherwise it's the pinned bottom
                    if (this.rowModel.isRowsToRender()) {
                        return { rowIndex: this.pageBoundsService.getFirstRow(), rowPinned: null } as RowPosition;
                    }

                    if (this.pinnedRowModel.isRowsToRender('bottom')) {
                        return { rowIndex: 0, rowPinned: 'bottom' } as RowPosition;
                    }

                    return null;
                default:
                    // if in the main body, then try pinned bottom, otherwise return nothing
                    if (this.pinnedRowModel.isRowsToRender('bottom')) {
                        return { rowIndex: 0, rowPinned: 'bottom' } as RowPosition;
                    }
                    return null;
            }
        } else if (pinned) {
            // if more pinned rows, should always navigate there
            ignoreSticky = true;
        }

        const rowNode = this.rowModel.getRow(rowPosition.rowIndex);
        const nextStickyPosition = ignoreSticky ? undefined : this.getNextStickyPosition(rowNode);

        if (nextStickyPosition) {
            return nextStickyPosition;
        }

        return { rowIndex: index + 1, rowPinned: pinned } as RowPosition;
    }

    private getNextStickyPosition(rowNode?: RowNode, up?: boolean): RowPosition | undefined {
        if (!isGroupRowsSticky(this.gos) || !rowNode || !rowNode.sticky) {
            return;
        }

        const isTopCtrls = this.rowRenderer
            .getStickyTopRowCtrls()
            .some((ctrl) => ctrl.getRowNode().rowIndex === rowNode.rowIndex);

        let stickyRowCtrls: RowCtrl[] = [];
        if (isTopCtrls) {
            stickyRowCtrls = [...this.rowRenderer.getStickyTopRowCtrls()].sort(
                (a, b) => a.getRowNode().rowIndex! - b.getRowNode().rowIndex!
            );
        } else {
            stickyRowCtrls = [...this.rowRenderer.getStickyBottomRowCtrls()].sort(
                (a, b) => b.getRowNode().rowIndex! - a.getRowNode().rowIndex!
            );
        }

        const diff = up ? -1 : 1;
        const idx = stickyRowCtrls.findIndex((ctrl) => ctrl.getRowNode().rowIndex === rowNode.rowIndex);
        const nextCtrl = stickyRowCtrls[idx + diff];

        if (nextCtrl) {
            return { rowIndex: nextCtrl.getRowNode().rowIndex!, rowPinned: null };
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
                rowPinned: rowBelow.rowPinned,
            } as CellPosition;
        }

        return null;
    }

    private isLastRowInContainer(rowPosition: RowPosition): boolean {
        const pinned = rowPosition.rowPinned;
        const index = rowPosition.rowIndex;

        if (pinned === 'top') {
            const lastTopIndex = this.pinnedRowModel.getPinnedTopRowCount() - 1;
            return lastTopIndex <= index;
        }

        if (pinned === 'bottom') {
            const lastBottomIndex = this.pinnedRowModel.getPinnedBottomRowCount() - 1;
            return lastBottomIndex <= index;
        }

        const lastBodyIndex = this.pageBoundsService.getLastRow();
        return lastBodyIndex <= index;
    }

    public getRowAbove(rowPosition: RowPosition): RowPosition | null {
        // if already on top row, do nothing
        const index = rowPosition.rowIndex;
        const pinned = rowPosition.rowPinned;
        const isFirstRow = pinned ? index === 0 : index === this.pageBoundsService.getFirstRow();
        let ignoreSticky = false;

        // if already on top row, do nothing
        if (isFirstRow) {
            if (pinned === 'top') {
                return null;
            }

            if (!pinned) {
                if (this.pinnedRowModel.isRowsToRender('top')) {
                    return this.getLastFloatingTopRow();
                }
                return null;
            }

            // last floating bottom
            if (this.rowModel.isRowsToRender()) {
                return this.getLastBodyCell();
            }

            if (this.pinnedRowModel.isRowsToRender('top')) {
                return this.getLastFloatingTopRow();
            }

            return null;
        } else if (pinned) {
            // if more pinned rows, should always navigate there
            ignoreSticky = true;
        }

        const rowNode = this.rowModel.getRow(rowPosition.rowIndex);
        const nextStickyPosition = ignoreSticky ? undefined : this.getNextStickyPosition(rowNode, true);

        if (nextStickyPosition) {
            return nextStickyPosition;
        }

        return { rowIndex: index - 1, rowPinned: pinned } as RowPosition;
    }

    private getCellAbove(lastCell: CellPosition | null): CellPosition | null {
        if (!lastCell) {
            return null;
        }

        const rowAbove = this.getRowAbove({ rowIndex: lastCell.rowIndex, rowPinned: lastCell.rowPinned });

        if (rowAbove) {
            return {
                rowIndex: rowAbove.rowIndex,
                column: lastCell.column,
                rowPinned: rowAbove.rowPinned,
            } as CellPosition;
        }

        return null;
    }

    private getLastBodyCell(): RowPosition {
        const lastBodyRow = this.pageBoundsService.getLastRow();

        return { rowIndex: lastBodyRow, rowPinned: null } as RowPosition;
    }

    private getLastFloatingTopRow(): RowPosition {
        const lastFloatingRow = this.pinnedRowModel.getPinnedTopRowCount() - 1;

        return { rowIndex: lastFloatingRow, rowPinned: 'top' } as RowPosition;
    }

    public getNextTabbedCell(gridCell: CellPosition, backwards: boolean): CellPosition | null {
        if (backwards) {
            return this.getNextTabbedCellBackwards(gridCell);
        }

        return this.getNextTabbedCellForwards(gridCell);
    }

    public getNextTabbedCellForwards(gridCell: CellPosition): CellPosition | null {
        const displayedColumns = this.visibleColsService.getAllCols();

        let newRowIndex: number | null = gridCell.rowIndex;
        let newFloating: string | null | undefined = gridCell.rowPinned;

        // move along to the next cell
        let newColumn = this.visibleColsService.getColAfter(gridCell.column as AgColumn);

        // check if end of the row, and if so, go forward a row
        if (!newColumn) {
            newColumn = displayedColumns[0];

            const rowBelow = this.getRowBelow(gridCell);
            if (_missing(rowBelow)) {
                return null;
            }

            // If we are tabbing and there is a paging panel present, tabbing should go
            // to the paging panel instead of loading the next page.
            if (!rowBelow.rowPinned && !(this.paginationService?.isRowInPage(rowBelow) ?? true)) {
                return null;
            }

            newRowIndex = rowBelow ? rowBelow.rowIndex : null;
            newFloating = rowBelow ? rowBelow.rowPinned : null;
        }

        return { rowIndex: newRowIndex, column: newColumn, rowPinned: newFloating } as CellPosition;
    }

    public getNextTabbedCellBackwards(gridCell: CellPosition): CellPosition | null {
        const displayedColumns = this.visibleColsService.getAllCols();

        let newRowIndex: number | null = gridCell.rowIndex;
        let newFloating: string | null | undefined = gridCell.rowPinned;

        // move along to the next cell
        let newColumn = this.visibleColsService.getColBefore(gridCell.column as AgColumn);

        // check if end of the row, and if so, go forward a row
        if (!newColumn) {
            newColumn = _last(displayedColumns);

            const rowAbove = this.getRowAbove({ rowIndex: gridCell.rowIndex, rowPinned: gridCell.rowPinned });

            if (_missing(rowAbove)) {
                return null;
            }

            // If we are tabbing and there is a paging panel present, tabbing should go
            // to the paging panel instead of loading the next page.
            if (!rowAbove.rowPinned && !(this.paginationService?.isRowInPage(rowAbove) ?? true)) {
                return null;
            }

            newRowIndex = rowAbove ? rowAbove.rowIndex : null;
            newFloating = rowAbove ? rowAbove.rowPinned : null;
        }

        return { rowIndex: newRowIndex, column: newColumn, rowPinned: newFloating } as CellPosition;
    }
}
