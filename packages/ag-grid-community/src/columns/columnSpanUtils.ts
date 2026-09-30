import type { AgColumn } from '../entities/agColumn';
import type { IRowNode } from '../interfaces/iRowNode';

/**
 * The columns the cell at `index` spans, as the grid draws it: its colSpan, stopped at the last column, at its
 * pinned lane's edge and at a column not displayed next to it; a column not displayed spans only itself.
 * @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time.
 */
export function _getDrawnColSpan(cols: AgColumn[], index: number, rowNode: IRowNode): number {
    const col = cols[index];
    const colSpan = col.allColsIndex < 0 ? 1 : Math.min(col.getColSpan(rowNode), cols.length - index);
    for (let i = 1; i < colSpan; ++i) {
        const next = cols[index + i];
        if (next.pinnedLane !== col.pinnedLane || next.allColsIndex !== col.allColsIndex + i) {
            return i;
        }
    }
    return colSpan;
}

/**
 * The columns starting a cell in `rowNode`. `filterCallback` is only set for the virtualised centre, where a
 * col-spanned run is kept if ANY col it spans passes.
 * @param colSpans the row's drawn colSpans by `allColsIndex`, 0 where not read yet; filled as the walk reads them
 */
export function _getColsForRow(
    rowNode: IRowNode,
    displayedColumns: AgColumn[],
    colSpans: number[] | null | undefined,
    filterCallback: ((column: AgColumn) => boolean) | null,
    emptySpaceBeforeColumn: ((column: AgColumn) => boolean) | null
): AgColumn[] {
    const result: AgColumn[] = [];
    let lastConsideredCol: AgColumn | null = null;
    const len = displayedColumns.length;
    // colSpans never reach backwards, so nothing after the last col the filter passes can render
    let end = len;
    while (filterCallback !== null && end > 0 && !filterCallback(displayedColumns[end - 1])) {
        --end;
    }

    for (let i = 0; i < end; ++i) {
        const col = displayedColumns[i];
        const colSpan = _getRowColSpan(rowNode, displayedColumns, i, colSpans);
        const filterPasses = filterCallback === null || anyColPasses(displayedColumns, i, colSpan, filterCallback);
        i += colSpan - 1;

        if (filterPasses) {
            if (result.length === 0 && lastConsideredCol && emptySpaceBeforeColumn?.(col)) {
                result.push(lastConsideredCol);
            }
            result.push(col);
        }

        lastConsideredCol = col;
    }

    return result;
}

/** The drawn colSpan of the cell at `index`, read once per row when `colSpans` keeps the row's colSpans. */
export function _getRowColSpan(
    rowNode: IRowNode,
    cols: AgColumn[],
    index: number,
    colSpans: number[] | null | undefined
): number {
    if (!colSpans) {
        return _getDrawnColSpan(cols, index, rowNode);
    }
    const allColsIndex = cols[index].allColsIndex;
    // a walk only lands where a cell starts, so a stored 0 always means not read yet
    let colSpan = colSpans[allColsIndex];
    if (colSpan === 0) {
        colSpan = _getDrawnColSpan(cols, index, rowNode);
        colSpans[allColsIndex] = colSpan;
    }
    return colSpan;
}

/** Whether any of the `count` columns from `start` passes `filter`. */
const anyColPasses = (
    cols: AgColumn[],
    start: number,
    count: number,
    filter: (column: AgColumn) => boolean
): boolean => {
    for (let i = start, end = start + count; i < end; ++i) {
        if (filter(cols[i])) {
            return true;
        }
    }
    return false;
};
