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
    colSpans: number[] | null,
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
        // a walk only lands where a cell starts, so a stored 0 always means not read yet
        let colSpan = colSpans === null ? 0 : colSpans[col.allColsIndex];
        if (colSpan === 0) {
            colSpan = _getDrawnColSpan(displayedColumns, i, rowNode);
            if (colSpans !== null) {
                colSpans[col.allColsIndex] = colSpan;
            }
        }

        let filterPasses: boolean;
        if (filterCallback) {
            filterPasses = filterCallback(col);
            for (let j = 1; !filterPasses && j < colSpan; ++j) {
                if (filterCallback(displayedColumns[i + j])) {
                    filterPasses = true;
                }
            }
        } else {
            filterPasses = true;
        }

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
