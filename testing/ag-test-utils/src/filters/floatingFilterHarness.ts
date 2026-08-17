import type { GridApi } from 'ag-grid-community';
import { getGridElement } from 'ag-grid-community';

import { asyncSetTimeout } from '../node-utils';
import { setNativeInputValue } from '../widgets/inputs';

/**
 * Drives a column's floating filter row through public DOM only. A floating filter shows either an editor of
 * the filter's own type or a disabled read-only summary, which `input().disabled` tells apart.
 */
export class FloatingFilterHarness {
    private constructor(
        public readonly api: GridApi,
        public readonly colId: string
    ) {}

    public static get(api: GridApi, colId: string): FloatingFilterHarness {
        return new FloatingFilterHarness(api, colId);
    }

    private get cell(): HTMLElement {
        const gridDiv = getGridElement(this.api) as HTMLElement;
        const cell = gridDiv?.querySelector<HTMLElement>(`.ag-header-cell.ag-floating-filter[col-id="${this.colId}"]`);
        if (!cell) {
            throw new Error(`No floating filter cell for "${this.colId}"`);
        }
        return cell;
    }

    /** The body, which is `ag-floating-filter-full-body` when the filter button is suppressed. */
    public get body(): HTMLElement {
        const body = this.cell.querySelector<HTMLElement>('.ag-floating-filter-body, .ag-floating-filter-full-body');
        if (!body) {
            throw new Error(`No floating filter body for "${this.colId}"`);
        }
        return body;
    }

    /** Every input, hidden ones included - what a filter mounts, rather than what it is showing. */
    public allInputs(): HTMLInputElement[] {
        return Array.from(this.body.querySelectorAll<HTMLInputElement>('input'));
    }

    /** Visible inputs in DOM order - a hidden one is the editor or the summary the other half is showing. */
    public inputs(): HTMLInputElement[] {
        return this.allInputs().filter((input) => !input.closest('.ag-hidden'));
    }

    public input(index = 0): HTMLInputElement {
        const input = this.inputs()[index];
        if (!input) {
            throw new Error(`No visible floating filter input at index ${index} for "${this.colId}"`);
        }
        return input;
    }

    public async setValue(value: string, index = 0): Promise<this> {
        setNativeInputValue(this.input(index), value);
        await asyncSetTimeout(0);
        return this;
    }
}
