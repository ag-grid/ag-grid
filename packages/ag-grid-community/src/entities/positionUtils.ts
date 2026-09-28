import { _exists } from 'ag-stack';

import type { BeanCollection } from '../context/context';
import { _getRowType, _isGroupRowsSticky } from '../gridOptionsUtils';
import type { CellPosition } from '../interfaces/iCellPosition';
import type { RowPinnedType } from '../interfaces/iRowNode';
import type { RowPosition } from '../interfaces/iRowPosition';
import type { CellCtrl } from '../rendering/cell/cellCtrl';
import type { RowCtrl } from '../rendering/row/rowCtrl';
import type { AgColumn } from './agColumn';
import type { RowNode } from './rowNode';

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export function _createCellId(cellPosition: CellPosition): string {
    const { rowIndex, rowPinned, column } = cellPosition;
    return `${rowIndex}.${rowPinned == null ? 'null' : rowPinned}.${column.getId()}`;
}

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export function _areCellsEqual(cellA: CellPosition, cellB: CellPosition): boolean {
    const colsMatch = cellA.column === cellB.column;
    const floatingMatch = cellA.rowPinned === cellB.rowPinned;
    const indexMatch = cellA.rowIndex === cellB.rowIndex;
    return colsMatch && floatingMatch && indexMatch;
}

/**
 * True if `rowA` appears before `rowB`
 * @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time.
 */
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

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export function _isSameRow(rowA: RowPosition | undefined, rowB: RowPosition | undefined): boolean {
    // if both missing
    if (!rowA && !rowB) {
        return true;
    }
    // if only one missing
    if (!rowA || !rowB) {
        return false;
    }
    // otherwise compare (use == to compare rowPinned because it can be null or undefined)
    return rowA.rowIndex === rowB.rowIndex && rowA.rowPinned == rowB.rowPinned;
}

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
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

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
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
        rowIndex = pageBounds.getLastRow();
    } else if (pinnedTopCount) {
        rowPinned = 'top';
        rowIndex = pinnedTopCount - 1;
    }

    return rowIndex === undefined ? null : { rowIndex, rowPinned };
}

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
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

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
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

/**
 * Judges cells row by row, so a walk runs a row's `isFullWidthRow` and colSpan callbacks once however many of its
 * cells it judges. Holds only the row it is on: one per walk, dropped with it, so nothing carries into the next.
 */
export class RowFocusResolver {
    private rowIndex = -1;
    private rowPinned: RowPinnedType = null;
    private rowNode: RowNode | undefined = undefined;
    private fullWidth: boolean | null = null;
    private spanEndsFilled = false;
    private readonly spanEnds: number[] = [];

    public constructor(private readonly beans: BeanCollection) {}

    public getRowNode(cellPosition: CellPosition): RowNode | undefined {
        const rowPinned = cellPosition.rowPinned ?? null;
        if (cellPosition.rowIndex !== this.rowIndex || rowPinned !== this.rowPinned) {
            this.rowIndex = cellPosition.rowIndex;
            this.rowPinned = rowPinned;
            this.rowNode = _getRowNode(this.beans, cellPosition);
            this.fullWidth = null;
            this.spanEndsFilled = false;
        }
        return this.rowNode;
    }

    public isFullWidth(cellPosition: CellPosition): boolean {
        const rowNode = this.getRowNode(cellPosition);
        let fullWidth = this.fullWidth;
        if (fullWidth === null) {
            // renders as one full-width cell, decided from the node alone
            fullWidth = !!rowNode && _getRowType(this.beans, rowNode) !== 'Normal';
            this.fullWidth = fullWidth;
        }
        return fullWidth;
    }

    /** The column whose cell takes focus: its own cell's, else the cell spanning it, drawn or from the callbacks. */
    public getFocusColumn(cellPosition: CellPosition): AgColumn {
        const column = cellPosition.column as AgColumn;
        const beans = this.beans;
        const visibleCols = beans.visibleCols;
        if (!visibleCols.colSpanActive) {
            return column;
        }
        const rowNode = this.getRowNode(cellPosition);
        // not held per row: a walk that scrolls can render the row it is on
        const cellCtrl = beans.rowRenderer.getRowByPosition(cellPosition)?.getCellCtrl(column);
        if (cellCtrl) {
            return cellCtrl.column;
        }
        if (!rowNode || this.isFullWidth(cellPosition)) {
            return column;
        }
        const spanEnds = this.spanEnds;
        if (!this.spanEndsFilled) {
            visibleCols.fillRowSpanEnds(rowNode, spanEnds);
            this.spanEndsFilled = true;
        }
        return visibleCols.getSpanningCol(spanEnds, column);
    }
}

export function _getRowById(beans: BeanCollection, rowId: string, rowPinned?: RowPinnedType): RowNode | undefined {
    const { rowModel: rm, pinnedRowModel: prm } = beans;

    let node;

    node ??= rm?.getRowNode(rowId);

    if (rowPinned) {
        node ??= prm?.getPinnedRowById(rowId, rowPinned);
    } else {
        node ??= prm?.getPinnedRowById(rowId, 'top');
        node ??= prm?.getPinnedRowById(rowId, 'bottom');
    }

    return node;
}

/**
 * Gets the row position above the given row position. Considers pinned and sticky rows for navigation.
 * RowModel.getRow() is expensive, so it is only called if `checkSticky` is true.
 * @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time.
 */
export function _getRowAbove(beans: BeanCollection, rowPosition: RowPosition, checkSticky = false): RowPosition | null {
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

    if (checkSticky) {
        const rowNode = pinned ? undefined : rowModel.getRow(index);
        return getNextStickyPosition(beans, rowNode, true) ?? { rowIndex: index - 1, rowPinned: pinned };
    }
    return { rowIndex: index - 1, rowPinned: pinned };
}

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export function _getAbsoluteRowIndex(beans: BeanCollection, rowPosition: RowPosition): number {
    const { pinnedRowModel, rowModel } = beans;
    const pinnedTopRowCount = pinnedRowModel?.getPinnedTopRowCount() ?? 0;
    const unpinnedRowCount = rowModel.getRowCount();
    const { rowPinned, rowIndex } = rowPosition;

    if (rowPinned === 'top') {
        return rowIndex;
    }

    if (rowPinned === 'bottom') {
        return pinnedTopRowCount + unpinnedRowCount + rowIndex;
    }

    return pinnedTopRowCount + rowIndex;
}

/**
 * Returns the row position below the given row position. Considers pinned and sticky rows for navigation.
 * RowModel.getRow() is expensive, so it is only called if `checkSticky` is true.
 * @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time.
 */
export function _getRowBelow(beans: BeanCollection, rowPosition: RowPosition, checkSticky = false): RowPosition | null {
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

    if (checkSticky) {
        const rowNode = pinned ? undefined : rowModel.getRow(index);
        return getNextStickyPosition(beans, rowNode) ?? { rowIndex: index + 1, rowPinned: pinned };
    }
    return { rowIndex: index + 1, rowPinned: pinned };
}

/**
 * Returns the next sticky row position based on the current row node and direction (up or down).
 * If there are no other sticky rows or the current row is not sticky, it returns undefined.
 */
function getNextStickyPosition(beans: BeanCollection, rowNode?: RowNode, up = false): RowPosition | undefined {
    const { gos, rowRenderer } = beans;

    if (!rowNode?.sticky || !_isGroupRowsSticky(gos)) {
        return;
    }

    const stickyTopCtrls = rowRenderer.getStickyTopRowCtrls();
    const stickyBottomCtrls = rowRenderer.getStickyBottomRowCtrls();

    // check isStickyBottom as it theoretically has less rows.
    const isStickyTop = !stickyBottomCtrls.some((ctrl) => ctrl.rowNode.rowIndex === rowNode.rowIndex);
    const stickyRowCtrls = isStickyTop ? stickyTopCtrls : stickyBottomCtrls;

    // invert for sticky top, as the order is flipped for rendering.
    const increment = (up ? -1 : 1) * (isStickyTop ? -1 : 1);
    let nextCtrl: RowCtrl | undefined;
    for (let i = 0; i < stickyRowCtrls.length; i++) {
        if (stickyRowCtrls[i].rowNode.rowIndex === rowNode.rowIndex) {
            nextCtrl = stickyRowCtrls[i + increment];
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
