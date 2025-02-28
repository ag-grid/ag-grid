import type { BeanCollection } from '../context/context';
import { _isGroupRowsSticky } from '../gridOptionsUtils';
import type { CellPosition } from '../interfaces/iCellPosition';
import type { RowPinnedType } from '../interfaces/iRowNode';
import type { RowPosition } from '../interfaces/iRowPosition';
import type { CellCtrl } from '../rendering/cell/cellCtrl';
import type { RowCtrl } from '../rendering/row/rowCtrl';
import { _exists } from '../utils/generic';
import type { AgColumn } from './agColumn';
import type { RowNode } from './rowNode';

export function _createCellId(cellPosition: CellPosition): string {
    const { rowIndex, rowPinned, column } = cellPosition;
    return `${rowIndex}.${rowPinned == null ? 'null' : rowPinned}.${column.getId()}`;
}

export function _areCellsEqual(cellA: CellPosition, cellB: CellPosition): boolean {
    const colsMatch = cellA.column === cellB.column;
    const floatingMatch = cellA.rowPinned === cellB.rowPinned;
    const indexMatch = cellA.rowIndex === cellB.rowIndex;
    return colsMatch && floatingMatch && indexMatch;
}

// tests if this row selection is before the other row selection
export function _isRowBefore(rowA: RowPosition, rowB: RowPosition): boolean {
    switch (rowA.rowPinned) {
        case 'top':
            // we we are floating top, and other isn't, then we are always before
            if (rowB.rowPinned !== 'top') {
                return true;
            }
            break;
        case 'bottom':
            // if we are floating bottom, and the other isn't, then we are never before
            if (rowB.rowPinned !== 'bottom') {
                return false;
            }
            break;
        default:
            // if we are not floating, but the other one is floating...
            if (_exists(rowB.rowPinned)) {
                return rowB.rowPinned !== 'top';
            }
            break;
    }
    return rowA.rowIndex < rowB.rowIndex;
}

export function _isSameRow(rowA: RowPosition | undefined, rowB: RowPosition | undefined): boolean {
    // if both missing
    if (!rowA && !rowB) {
        return true;
    }
    // if only one missing
    if ((rowA && !rowB) || (!rowA && rowB)) {
        return false;
    }
    // otherwise compare (use == to compare rowPinned because it can be null or undefined)
    return rowA!.rowIndex === rowB!.rowIndex && rowA!.rowPinned == rowB!.rowPinned;
}

export function _getFirstRow(beans: BeanCollection): RowPosition | null {
    let rowIndex = 0;
    let rowPinned: RowPinnedType;

    const { pinnedRowModel, rowModel, pageBounds } = beans;

    if (pinnedRowModel?.getPinnedTopRowCount()) {
        rowPinned = 'top';
    } else if (rowModel.getRowCount()) {
        rowPinned = null;
        rowIndex = pageBounds.getFirstRow();
    } else if (pinnedRowModel?.getPinnedBottomRowCount()) {
        rowPinned = 'bottom';
    }

    return rowPinned === undefined ? null : { rowIndex, rowPinned };
}

export function _getLastRow(beans: BeanCollection): RowPosition | null {
    let rowIndex;
    let rowPinned: RowPinnedType = null;

    const { pinnedRowModel, pageBounds } = beans;

    const pinnedBottomCount = pinnedRowModel?.getPinnedBottomRowCount();
    const pinnedTopCount = pinnedRowModel?.getPinnedTopRowCount();

    if (pinnedBottomCount) {
        rowPinned = 'bottom';
        rowIndex = pinnedBottomCount - 1;
    } else if (beans.rowModel.getRowCount()) {
        rowPinned = null;
        rowIndex = pageBounds.getLastRow();
    } else if (pinnedTopCount) {
        rowPinned = 'top';
        rowIndex = pinnedTopCount - 1;
    }

    return rowIndex === undefined ? null : { rowIndex, rowPinned };
}

export function _getRowNode(beans: BeanCollection, gridRow: RowPosition): RowNode | undefined {
    switch (gridRow.rowPinned) {
        case 'top':
            return beans.pinnedRowModel?.getPinnedTopRow(gridRow.rowIndex);
        case 'bottom':
            return beans.pinnedRowModel?.getPinnedBottomRow(gridRow.rowIndex);
        default:
            return beans.rowModel.getRow(gridRow.rowIndex);
    }
}

export function _getCellByPosition(beans: BeanCollection, cellPosition: CellPosition): CellCtrl | null {
    // if spanned, return cell ctrl from spanned renderer
    const spannedCellCtrl = beans.spannedRowRenderer?.getCellByPosition(cellPosition);
    if (spannedCellCtrl) {
        return spannedCellCtrl;
    }

    const rowCtrl = beans.rowRenderer.getRowByPosition(cellPosition);
    if (!rowCtrl) {
        return null;
    }

    return rowCtrl.getCellCtrl(cellPosition.column as AgColumn);
}

export function _getRowAbove(beans: BeanCollection, rowPosition: RowPosition): RowPosition | null {
    // if already on top row, do nothing
    const index = rowPosition.rowIndex;
    const pinned = rowPosition.rowPinned;
    const { pageBounds, pinnedRowModel, rowModel } = beans;
    const isFirstRow = pinned ? index === 0 : index === pageBounds.getFirstRow();
    let ignoreSticky = false;

    const getLastFloatingTopRow = (): RowPosition => {
        const lastFloatingRow = pinnedRowModel?.getPinnedTopRowCount() ?? 0 - 1;

        return { rowIndex: lastFloatingRow, rowPinned: 'top' } as RowPosition;
    };

    // if already on top row, do nothing
    if (isFirstRow) {
        if (pinned === 'top') {
            return null;
        }

        if (!pinned) {
            if (pinnedRowModel?.isRowsToRender('top')) {
                return getLastFloatingTopRow();
            }
            return null;
        }

        // last floating bottom
        if (rowModel.isRowsToRender()) {
            const lastBodyRow = pageBounds.getLastRow();
            return { rowIndex: lastBodyRow, rowPinned: null } as RowPosition;
        }

        if (pinnedRowModel?.isRowsToRender('top')) {
            return getLastFloatingTopRow();
        }

        return null;
    } else if (pinned) {
        // if more pinned rows, should always navigate there
        ignoreSticky = true;
    }

    const rowNode = rowModel.getRow(rowPosition.rowIndex);
    const nextStickyPosition = ignoreSticky ? undefined : getNextStickyPosition(beans, rowNode, true);

    if (nextStickyPosition) {
        return nextStickyPosition;
    }

    return { rowIndex: index - 1, rowPinned: pinned } as RowPosition;
}

export function _getRowBelow(beans: BeanCollection, rowPosition: RowPosition): RowPosition | null {
    // if already on top row, do nothing
    const index = rowPosition.rowIndex;
    const pinned = rowPosition.rowPinned;
    let ignoreSticky = false;

    const { pageBounds, pinnedRowModel, rowModel } = beans;

    if (isLastRowInContainer(beans, rowPosition)) {
        switch (pinned) {
            case 'bottom':
                // never any rows after pinned bottom
                return null;
            case 'top':
                // if on last row of pinned top, then next row is main body (if rows exist),
                // otherwise it's the pinned bottom
                if (rowModel.isRowsToRender()) {
                    return { rowIndex: pageBounds.getFirstRow(), rowPinned: null } as RowPosition;
                }

                if (pinnedRowModel?.isRowsToRender('bottom')) {
                    return { rowIndex: 0, rowPinned: 'bottom' } as RowPosition;
                }

                return null;
            default:
                // if in the main body, then try pinned bottom, otherwise return nothing
                if (pinnedRowModel?.isRowsToRender('bottom')) {
                    return { rowIndex: 0, rowPinned: 'bottom' } as RowPosition;
                }
                return null;
        }
    } else if (pinned) {
        // if more pinned rows, should always navigate there
        ignoreSticky = true;
    }

    const rowNode = rowModel.getRow(rowPosition.rowIndex);
    const nextStickyPosition = ignoreSticky ? undefined : getNextStickyPosition(beans, rowNode);

    if (nextStickyPosition) {
        return nextStickyPosition;
    }

    return { rowIndex: index + 1, rowPinned: pinned } as RowPosition;
}

function getNextStickyPosition(beans: BeanCollection, rowNode?: RowNode, up?: boolean): RowPosition | undefined {
    const { gos, rowRenderer } = beans;
    if (!_isGroupRowsSticky(gos) || !rowNode || !rowNode.sticky) {
        return;
    }

    const isTopCtrls = rowRenderer.getStickyTopRowCtrls().some((ctrl) => ctrl.rowNode.rowIndex === rowNode.rowIndex);

    let stickyRowCtrls: RowCtrl[] = [];
    if (isTopCtrls) {
        stickyRowCtrls = [...rowRenderer.getStickyTopRowCtrls()].sort(
            (a, b) => a.rowNode.rowIndex! - b.rowNode.rowIndex!
        );
    } else {
        stickyRowCtrls = [...rowRenderer.getStickyBottomRowCtrls()].sort(
            (a, b) => b.rowNode.rowIndex! - a.rowNode.rowIndex!
        );
    }

    const diff = up ? -1 : 1;
    const idx = stickyRowCtrls.findIndex((ctrl) => ctrl.rowNode.rowIndex === rowNode.rowIndex);
    const nextCtrl = stickyRowCtrls[idx + diff];

    if (nextCtrl) {
        return { rowIndex: nextCtrl.rowNode.rowIndex!, rowPinned: null };
    }
}

function isLastRowInContainer(beans: BeanCollection, rowPosition: RowPosition): boolean {
    const pinned = rowPosition.rowPinned;
    const index = rowPosition.rowIndex;

    const { pinnedRowModel, pageBounds } = beans;

    if (pinned === 'top') {
        const lastTopIndex = pinnedRowModel?.getPinnedTopRowCount() ?? 0 - 1;
        return lastTopIndex <= index;
    }

    if (pinned === 'bottom') {
        const lastBottomIndex = pinnedRowModel?.getPinnedBottomRowCount() ?? 0 - 1;
        return lastBottomIndex <= index;
    }

    const lastBodyIndex = pageBounds.getLastRow();
    return lastBodyIndex <= index;
}
