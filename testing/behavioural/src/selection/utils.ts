import type { GridApi } from 'ag-grid-community';
import { KeyCode } from 'ag-grid-community';

import { escapeQuotes } from '../test-utils';
import { assertSelectedRowElementsById, assertSelectedRowsByIndex } from '../test-utils/test-utils-assertions';
import { waitForEvent } from '../test-utils/test-utils-events';

export class GridActions {
    private parent: HTMLElement;

    constructor(
        private api: GridApi,
        parentSelector = '#myGrid'
    ) {
        this.parent = document.querySelector(parentSelector)!;
        if (!this.parent) {
            throw new Error(`${parentSelector} not found.`);
        }
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

    selectRowsById(ids: string[], click: boolean): void {
        for (const i of ids) {
            click ? this.clickRowById(i, { ctrlKey: true }) : this.toggleCheckboxById(i);
        }
        assertSelectedRowElementsById(ids, this.api);
    }

    clickRowByIndex(index: number, opts?: MouseEventInit): void {
        this.getRowByIndex(index)?.dispatchEvent(new MouseEvent('click', { ...opts, bubbles: true }));
    }

    clickRowById(id: string, opts?: MouseEventInit): void {
        this.getRowById(id)?.dispatchEvent(new MouseEvent('click', { ...opts, bubbles: true }));
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

export function pressSpaceKey(element: HTMLElement, opts?: KeyboardEventInit): void {
    element.dispatchEvent(new KeyboardEvent('keydown', { ...opts, key: KeyCode.SPACE, bubbles: true }));
}

export function pressAKey(element: HTMLElement, opts?: KeyboardEventInit): void {
    element.dispatchEvent(new KeyboardEvent('keydown', { ...opts, key: KeyCode.A, keyCode: 65, bubbles: true }));
}
