import { getByTestId } from '@testing-library/dom';

import type { GridApi } from 'ag-grid-community';
import { agTestIdFor, getGridElement } from 'ag-grid-community';

import { asyncSetTimeout } from '../node-utils';
import { firePointerLikeClick } from '../test-utils-events';
import { clickSelectOption, nudgeVirtualList, openPicker } from '../widgets/dropdowns';

const COLUMN_FILTER_MENU = '.ag-filter-menu';

function setNativeInputValue(input: HTMLInputElement, value: string): void {
    const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!;
    setter.call(input, value);
    input.dispatchEvent(new Event('input', { bubbles: true }));
    input.dispatchEvent(new Event('change', { bubbles: true }));
}

/**
 * Drives a column filter popup (`.ag-filter-menu`) through public DOM only. Operator selection uses the
 * AgSelect dropdown; inputs are set via native events; set-filter items are toggled by label.
 */
export class ColumnFilterHarness {
    private constructor(
        public readonly api: GridApi,
        public readonly colId: string,
        public readonly gridDiv: HTMLElement
    ) {}

    /** Clicks the header filter button for `colId` and returns a harness scoped to the popup. */
    public static async open(api: GridApi, colId: string): Promise<ColumnFilterHarness> {
        const gridDiv = getGridElement(api)! as HTMLElement;
        await asyncSetTimeout(0);
        const button = getByTestId(gridDiv, agTestIdFor.headerFilterButton(colId));
        await firePointerLikeClick(button);
        await asyncSetTimeout(0);
        return new ColumnFilterHarness(api, colId, gridDiv);
    }

    private get popup(): HTMLElement {
        const popup = document.querySelector<HTMLElement>(COLUMN_FILTER_MENU);
        if (!popup) {
            throw new Error(`Column filter popup not open for "${this.colId}"`);
        }
        return popup;
    }

    /** Selects an operator by its display label (e.g. "Greater than", "In range") via the AgSelect. */
    public async selectOperator(displayName: string, conditionIndex = 0): Promise<this> {
        const selects = this.popup.querySelectorAll<HTMLElement>('.ag-filter-select');
        const select = selects[conditionIndex];
        if (!select) {
            throw new Error(`No operator select at condition index ${conditionIndex} for "${this.colId}"`);
        }
        await openPicker(select);
        await clickSelectOption(displayName);
        return this;
    }

    /** Non-set inputs in DOM order (from/to for ranges). Excludes inputs hidden via any ancestor. */
    private inputs(type: 'text' | 'number' | 'date'): HTMLInputElement[] {
        const typeSel = type === 'date' ? 'input[type="date"], input[type="datetime-local"]' : `input[type="${type}"]`;
        return Array.from(
            this.popup.querySelectorAll<HTMLInputElement>(`.ag-filter-body .ag-input-field ${typeSel}`)
        ).filter((input) => !input.closest('.ag-hidden'));
    }

    public async setText(value: string, index = 0): Promise<this> {
        setNativeInputValue(this.inputs('text')[index], value);
        await asyncSetTimeout(0);
        return this;
    }

    public async setNumber(value: number | string, index = 0): Promise<this> {
        setNativeInputValue(this.inputs('number')[index], String(value));
        await asyncSetTimeout(0);
        return this;
    }

    public async setDate(value: string, index = 0): Promise<this> {
        setNativeInputValue(this.inputs('date')[index], value);
        await asyncSetTimeout(0);
        return this;
    }

    /** Selects the AND/OR join radio between conditions. */
    public async setJoinOperator(op: 'AND' | 'OR'): Promise<this> {
        const radios = this.popup.querySelectorAll<HTMLElement>('.ag-filter-condition .ag-radio-button');
        const target = Array.from(radios).find((r) =>
            r.querySelector('.ag-radio-button-label')?.textContent?.trim().toUpperCase().startsWith(op)
        );
        if (!target) {
            throw new Error(`Join radio "${op}" not found for "${this.colId}"`);
        }
        await firePointerLikeClick(target.querySelector<HTMLElement>('input[type=radio]') ?? target);
        await asyncSetTimeout(0);
        return this;
    }

    // --- Set filter ---

    /** Types into the set-filter mini-filter search box. */
    public async miniFilterSearch(text: string): Promise<this> {
        const input = this.popup.querySelector<HTMLInputElement>('.ag-mini-filter input[type="text"]');
        if (!input) {
            throw new Error(`No set-filter mini-filter for "${this.colId}"`);
        }
        setNativeInputValue(input, text);
        await asyncSetTimeout(0);
        return this;
    }

    private setFilterItems(): HTMLElement[] {
        nudgeVirtualList('.ag-set-filter-list .ag-virtual-list-viewport', this.popup);
        return Array.from(this.popup.querySelectorAll<HTMLElement>('.ag-set-filter-list .ag-set-filter-item'));
    }

    /** Set-filter item labels currently rendered (requires layout mock installed). */
    public setFilterItemLabels(): string[] {
        return this.setFilterItems().map((item) => item.querySelector('.ag-checkbox-label')?.textContent?.trim() ?? '');
    }

    /** Toggles the set-filter item checkbox whose label matches `label`. */
    public async toggleSetItem(label: string): Promise<this> {
        const item = this.setFilterItems().find(
            (el) => el.querySelector('.ag-checkbox-label')?.textContent?.trim() === label
        );
        if (!item) {
            throw new Error(
                `Set-filter item "${label}" not found for "${this.colId}". Available: ${this.setFilterItemLabels().join(', ')}`
            );
        }
        await firePointerLikeClick(item.querySelector<HTMLElement>('input[type="checkbox"]') ?? item);
        await asyncSetTimeout(0);
        return this;
    }

    // --- Apply / clear ---

    private async clickApplyPanelButton(label: string): Promise<void> {
        const button = Array.from(this.popup.querySelectorAll<HTMLElement>('.ag-filter-apply-panel button')).find(
            (b) => b.textContent?.trim() === label
        );
        if (button) {
            await firePointerLikeClick(button);
            await asyncSetTimeout(0);
        }
    }

    /** Clicks Apply if an apply panel is present (no-op when filters apply immediately). */
    public async apply(): Promise<this> {
        await this.clickApplyPanelButton('Apply');
        return this;
    }

    public async clear(): Promise<this> {
        await this.clickApplyPanelButton('Clear');
        return this;
    }

    /** Clicks Reset (clears the form AND removes the active filter). */
    public async reset(): Promise<this> {
        await this.clickApplyPanelButton('Reset');
        return this;
    }

    public getModel(): any {
        return this.api.getColumnFilterModel(this.colId);
    }
}
