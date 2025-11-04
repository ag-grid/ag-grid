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
