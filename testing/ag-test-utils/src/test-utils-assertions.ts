import { _areEqual } from 'ag-stack';
import { expect } from 'vitest';

import type { CellRange, GridApi, IRowNode } from 'ag-grid-community';

export function assertSelectedRowsByIndex(indices: number[], api: GridApi): void {
    const actual = new Set(api.getSelectedNodes().map((n) => n.rowIndex));
    const expected = new Set(indices);
    expect(actual).toEqual(expected);
}

/**
 * Selection assertion by row index that reads node state directly rather than via `getSelectedNodes()`,
 * for modes where that API is unsupported: `groupSelects: 'descendants'` under the server-side row model
 * (see error #202, which directs callers to `getServerSideSelectionState()`).
 */
export function assertSelectedRowsByIndexFromNodes(indices: number[], api: GridApi): void {
    const actual = new Set<number | null>();
    api.forEachNode((node) => {
        if (node.isSelected()) {
            actual.add(node.rowIndex);
        }
    });
    expect(actual).toEqual(new Set(indices));
}

export function assertSelectedRowsById(ids: string[], api: GridApi): void {
    const selected = new Set<string>();
    api.forEachNode((node) => (node.isSelected() ? selected.add(node.id!) : null));
    expect(selected).toEqual(new Set(ids));
}

export function assertSelectedRowNodes(nodes: IRowNode[], api: GridApi): void {
    const selectedNodes = api.getSelectedNodes();
    expect(selectedNodes).toHaveLength(nodes.length);
    for (let i = 0; i < nodes.length; i++) {
        expect(selectedNodes[i]).toBe(nodes[i]);
    }
}

export function assertSelectableByIndex(indices: number[], api: GridApi): void {
    const selectable: number[] = [];

    api.forEachNode((node) => {
        if (node.selectable) {
            selectable.push(node.rowIndex!);
        }
    });

    expect(selectable).toEqual(indices);
}

export function isElementDisplayed(element: HTMLElement): boolean {
    let el: HTMLElement | null = element;
    while (el) {
        if (el.classList.contains('ag-invisible')) {
            return false;
        }
        el = el.parentElement;
    }
    return true;
}

/** Ranges as `rowStart..rowEnd:colA,colB`, so a leftover selection reads as text rather than a CellRange dump. */
const describeRanges = (ranges: CellRange[] | undefined): string[] =>
    (ranges ?? []).map(
        (range) =>
            `${range.startRow?.rowIndex}..${range.endRow?.rowIndex}:${range.columns.map((column) => column.getColId()).join(',')}`
    );

interface CellRangeSpec {
    rowStartIndex: number;
    rowEndIndex: number;
    columns: string[];
}

export function assertSelectedCellRanges(cellRanges: CellRangeSpec[], api: GridApi): void {
    const selectedCellRanges = api.getCellRanges()?.slice();
    const notFound: CellRangeSpec[] = [];

    if (cellRanges.length === 0) {
        expect(selectedCellRanges).toHaveLength(0);
        return;
    }

    for (const range of cellRanges) {
        const foundIdx =
            selectedCellRanges?.findIndex(
                (selectedRange) =>
                    range.rowStartIndex === selectedRange.startRow?.rowIndex &&
                    range.rowEndIndex === selectedRange.endRow?.rowIndex &&
                    _areEqual(
                        range.columns,
                        selectedRange.columns.map((c) => c.getId())
                    )
            ) ?? -1;

        if (foundIdx > -1) {
            selectedCellRanges?.splice(foundIdx, 1);
        } else {
            notFound.push(range);
        }
    }
    expect(notFound).toEqual([]);
    // The expected ones are spliced out above, so anything still here was never asked for: a stale or
    // over-broad selection would otherwise pass unnoticed.
    expect(describeRanges(selectedCellRanges)).toEqual([]);
}

export function assertColumnsSelected(ranges: string[][], api: GridApi): void {
    const cellRanges = api.getCellRanges()?.slice() ?? [];
    const lastRowIdx = api.getLastDisplayedRowIndex();
    const nRowsTop = api.getPinnedTopRowCount();
    const nRowsBottom = api.getPinnedBottomRowCount();
    const notFound: string[][] = [];

    // Spans every row, top pinned through bottom pinned: a full-column selection, which is the only
    // shape this helper speaks about. Pinned-bottom indices run 0..count-1, as the assertions below assume.
    const isFullColumnRange = ({ startRow, endRow }: CellRange): boolean =>
        startRow?.rowIndex === 0 &&
        startRow?.rowPinned === (nRowsTop > 0 ? 'top' : null) &&
        (nRowsBottom > 0
            ? endRow?.rowPinned === 'bottom' && endRow.rowIndex === nRowsBottom - 1
            : endRow?.rowIndex === lastRowIdx);

    for (const columnIds of ranges) {
        const hasColumns = (cellRange: CellRange) =>
            _areEqual(
                cellRange.columns.map((c) => c.getColId()),
                columnIds
            );
        // A full-column match wins: a partial range may share the same columns, and taking it first would fail
        // the endpoint assertions while the full-column range it shadowed sat later. The columns-only fallback
        // is what keeps those assertions diagnostic rather than tautological when nothing spans every row.
        let idx = cellRanges.findIndex((cellRange) => isFullColumnRange(cellRange) && hasColumns(cellRange));
        if (idx < 0) {
            idx = cellRanges.findIndex(hasColumns);
        }

        if (idx > -1) {
            expect(cellRanges[idx].startRow?.rowIndex).toEqual(0);
            expect(cellRanges[idx].startRow?.rowPinned).toEqual(nRowsTop > 0 ? 'top' : null);

            expect(cellRanges[idx].endRow?.rowIndex).toEqual(nRowsBottom > 0 ? nRowsBottom - 1 : lastRowIdx);
            expect(cellRanges[idx].endRow?.rowPinned).toEqual(nRowsBottom > 0 ? 'bottom' : null);

            cellRanges.splice(idx, 1);
        } else {
            notFound.push(columnIds);
        }
    }

    expect(notFound).toEqual([]);
    // The expected ones are spliced out, so a full-column range still here was never asked for. Partial
    // ranges are left alone: they legitimately coexist with a column selection.
    expect(describeRanges(cellRanges.filter(isFullColumnRange))).toEqual([]);
}
