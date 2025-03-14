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
    const { rowIndex: index, rowPinned: pinned } = rowPosition;
    const { pageBounds, pinnedRowModel, rowModel } = beans;

    if (index === 0) {
        if (pinned === 'top') {
            return null;
        }

        if (pinned === 'bottom' && rowModel.isRowsToRender()) {
            return { rowIndex: pageBounds.getLastRow(), rowPinned: null };
        }

        return pinnedRowModel?.isRowsToRender('top')
            ? { rowIndex: pinnedRowModel.getPinnedTopRowCount() - 1, rowPinned: 'top' }
            : null;
    }

    const rowNode = pinned ? undefined : rowModel.getRow(index);
    return getNextStickyPosition(beans, rowNode, true) ?? { rowIndex: index - 1, rowPinned: pinned };
}

export function _getRowBelow(beans: BeanCollection, rowPosition: RowPosition): RowPosition | null {
    const { rowIndex: index, rowPinned: pinned } = rowPosition;
    const { pageBounds, pinnedRowModel, rowModel } = beans;

    if (isLastRowInContainer(beans, rowPosition)) {
        if (pinned === 'bottom') {
            return null;
        }

        if (pinned === 'top' && rowModel.isRowsToRender()) {
            return { rowIndex: pageBounds.getFirstRow(), rowPinned: null };
        }

        return pinnedRowModel?.isRowsToRender('bottom') ? { rowIndex: 0, rowPinned: 'bottom' } : null;
    }

    const rowNode = pinned ? undefined : rowModel.getRow(index);
    return getNextStickyPosition(beans, rowNode) ?? { rowIndex: index + 1, rowPinned: pinned };
}

function getNextStickyPosition(beans: BeanCollection, rowNode?: RowNode, up?: boolean): RowPosition | undefined {
    const { gos, rowRenderer } = beans;

    if (!rowNode?.sticky || !_isGroupRowsSticky(gos)) {
        return;
    }

    const stickyRowCtrls = up ? rowRenderer.getStickyTopRowCtrls() : rowRenderer.getStickyBottomRowCtrls();

    let nextCtrl: RowCtrl | undefined;
    for (let i = 0; i < stickyRowCtrls.length; i++) {
        if (stickyRowCtrls[i].rowNode.rowIndex === rowNode.rowIndex) {
            nextCtrl = stickyRowCtrls[i + (up ? -1 : 1)];
            break;
        }
    }

    return nextCtrl ? { rowIndex: nextCtrl.rowNode.rowIndex!, rowPinned: null } : undefined;
}

function isLastRowInContainer(beans: BeanCollection, rowPosition: RowPosition): boolean {
    const { rowPinned, rowIndex } = rowPosition;
    const { pinnedRowModel, pageBounds } = beans;

    if (rowPinned === 'top') {
        const lastTopIndex = (pinnedRowModel?.getPinnedTopRowCount() ?? 0) - 1;
        return lastTopIndex <= rowIndex;
    }

    if (rowPinned === 'bottom') {
        const lastBottomIndex = (pinnedRowModel?.getPinnedBottomRowCount() ?? 0) - 1;
        return lastBottomIndex <= rowIndex;
    }

    const lastBodyIndex = pageBounds.getLastRow();
    return lastBodyIndex <= rowIndex;
}
