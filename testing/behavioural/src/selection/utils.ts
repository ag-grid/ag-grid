import { expect } from 'vitest';

import type { AgPublicEventType, GridApi, IRowNode } from 'ag-grid-community';
import { KeyCode, _areEqual } from 'ag-grid-community';

function escapeQuotes(value: string): string {
    return value.replaceAll(/(['"])/g, '\\$1');
}

export class GridActions {
    private parent: HTMLElement;

    constructor(
        private api: GridApi,
        parentSelector = '#myGrid'
    ) {
        this.parent = document.querySelector(parentSelector)!;
    }

    getRowByIndex(index: number): HTMLElement | null {
        return this.parent.querySelector(`[row-index="${index}"]`);
    }

    getRowById(id: string): HTMLElement | null {
        return this.parent.querySelector(`[row-id="${escapeQuotes(id)}"]`);
    }

    getCellByPosition(rowIndex: number, colId: string): HTMLElement | null {
        return this.getRowByIndex(rowIndex)?.querySelector(`[col-id="${colId}"]`) ?? null;
    }

    getCheckboxByIndex(index: number): HTMLElement | null {
        return (
            this.getRowByIndex(index)?.querySelector<HTMLElement>('.ag-selection-checkbox input[type=checkbox]') ?? null
        );
    }

    getCheckboxById(id: string): HTMLElement | null {
        return this.getRowById(id)?.querySelector<HTMLElement>('.ag-selection-checkbox input[type=checkbox]') ?? null;
    }

    getHeaderCheckboxByIndex(index: number): HTMLElement | null {
        return this.parent
            .querySelectorAll<HTMLElement>('.ag-header-select-all')
            .item(index)
            .querySelector('input[type=checkbox]');
    }

    selectRowsByIndex(indices: number[], click: boolean): void {
        for (const i of indices) {
            click ? this.clickRowByIndex(i, { ctrlKey: true }) : this.toggleCheckboxByIndex(i);
        }
        assertSelectedRowsByIndex(indices, this.api);
    }

    clickRowByIndex(index: number, opts?: MouseEventInit): void {
        this.getRowByIndex(index)?.dispatchEvent(new MouseEvent('click', { ...opts, bubbles: true }));
    }

    toggleCheckboxByIndex(index: number, opts?: MouseEventInit): void {
        this.getCheckboxByIndex(index)?.dispatchEvent(new MouseEvent('click', { ...opts, bubbles: true }));
    }

    toggleCheckboxById(id: string, opts?: MouseEventInit): void {
        this.getCheckboxById(id)?.dispatchEvent(new MouseEvent('click', { ...opts, bubbles: true }));
    }

    toggleHeaderCheckboxByIndex(index: number, opts?: MouseEventInit): void {
        this.getHeaderCheckboxByIndex(index)?.dispatchEvent(new MouseEvent('click', { ...opts, bubbles: true }));
    }

    clickExpandGroupRowByIndex(index: number, opts?: MouseEventInit): void {
        this.getRowByIndex(index)
            ?.querySelector<HTMLElement>('.ag-group-contracted')
            ?.dispatchEvent(new MouseEvent('click', { ...opts, bubbles: true }));
    }

    clickExpandGroupRowById(id: string, opts?: MouseEventInit): void {
        this.getRowById(id)
            ?.querySelector<HTMLElement>('.ag-group-contracted')
            ?.dispatchEvent(new MouseEvent('click', { ...opts, bubbles: true }));
    }

    async expandGroupRowByIndex(index: number, opts?: MouseEventInit & { count?: number }): Promise<void> {
        const updated = waitForEvent('modelUpdated', this.api, opts?.count ?? 2); // attach listener first
        this.clickExpandGroupRowByIndex(index, opts);
        await updated;
    }

    async expandGroupRowById(id: string, opts?: MouseEventInit & { count?: number }): Promise<void> {
        const updated = waitForEvent('modelUpdated', this.api, opts?.count ?? 2);
        this.clickExpandGroupRowById(id, opts);
        await updated;
    }
}

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

export function waitForEvent(event: AgPublicEventType, api: GridApi, n = 1): Promise<void> {
    let count = n;
    return new Promise((resolve) => {
        function listener() {
            if (--count === 0) {
                api.removeEventListener(event, listener);
                resolve();
            }
        }
        api.addEventListener(event, listener);
    });
}

export function pressSpaceKey(element: HTMLElement, opts?: KeyboardEventInit): void {
    element.dispatchEvent(new KeyboardEvent('keydown', { ...opts, key: KeyCode.SPACE, bubbles: true }));
}
