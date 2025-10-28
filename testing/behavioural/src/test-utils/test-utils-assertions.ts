import { expect } from 'vitest';

import type { GridApi, IRowNode } from 'ag-grid-community';
import { _areEqual } from 'ag-grid-community';

export function assertSelectedRowsByIndex(indices: number[], api: GridApi): void {
    const actual = new Set(api.getSelectedNodes().map((n) => n.rowIndex));
    const expected = new Set(indices);
    expect(actual).toEqual(expected);
}

export function assertSelectedRowElementsById(ids: string[], api: GridApi): void {
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

export function assertElementDisplayed(element: HTMLElement): boolean {
    let el: HTMLElement | null = element;
    while (el) {
        if (el.classList.contains('ag-invisible')) {
            return false;
        }
        el = el.parentElement;
    }
    return true;
}

interface CellRangeSpec {
    rowStartIndex: number;
    rowEndIndex: number;
    columns: string[];
}

export function assertSelectedCellRanges(cellRanges: CellRangeSpec[], api: GridApi): void {
    const selectedCellRanges = api.getCellRanges()?.slice();
    const notFound: CellRangeSpec[] = [];

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
}

export function assertColumnsSelected(ranges: string[][], api: GridApi): void {
    const cellRanges = api.getCellRanges()?.slice() ?? [];
    const lastRowIdx = api.getLastDisplayedRowIndex();
    const nRowsTop = api.getPinnedTopRowCount();
    const nRowsBottom = api.getPinnedBottomRowCount();
    const notFound: string[][] = [];

    for (const columnIds of ranges) {
        const idx = cellRanges.findIndex((cellRange) => {
            return _areEqual(
                cellRange.columns.map((c) => c.getColId()),
                columnIds
            );
        });

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
}
