import type { GridApi } from '@ag-grid-community/core';

export function getRowByIndex(index: number): HTMLElement | null {
    return document.getElementById('myGrid')!.querySelector(`[row-index=${index}]`);
}

export function getCheckboxByIndex(index: number): HTMLElement | null {
    return document
        .getElementById('myGrid')!
        .querySelectorAll<HTMLElement>('.ag-selection-checkbox')
        .item(index)
        .querySelector('input[type=checkbox]');
}

export function getHeaderCheckboxByIndex(index: number): HTMLElement | null {
    return document
        .getElementById('myGrid')!
        .querySelectorAll<HTMLElement>('.ag-header-select-all')
        .item(index)
        .querySelector('input[type=checkbox]');
}

export function selectRowsByIndex(indices: number[], api?: GridApi): void {
    for (const i of indices) {
        clickRowByIndex(i, { ctrlKey: true });
    }
    if (api !== undefined) {
        assertSelectedRowsByIndex(indices, api);
    }
}

export function clickRowByIndex(index: number, opts?: MouseEventInit): void {
    getRowByIndex(index)?.dispatchEvent(new MouseEvent('click', { ...opts, bubbles: true }));
}

export function toggleCheckboxByIndex(index: number, opts?: MouseEventInit): void {
    getCheckboxByIndex(index)?.dispatchEvent(new MouseEvent('click', { ...opts, bubbles: true }));
}

export function toggleHeaderCheckboxByIndex(index: number, opts?: MouseEventInit): void {
    getHeaderCheckboxByIndex(index)?.dispatchEvent(new MouseEvent('click', { ...opts, bubbles: true }));
}

export function assertSelectedRowsByIndex(indices: number[], api: GridApi) {
    const actual = new Set(api.getSelectedNodes().map((n) => n.rowIndex));
    const expected = new Set(indices);
    expect(actual).toEqual(expected);
}
