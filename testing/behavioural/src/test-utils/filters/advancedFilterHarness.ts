import type { GridApi } from 'ag-grid-community';
import { getGridElement } from 'ag-grid-community';

import { asyncSetTimeout } from '../node-utils';
import { nudgeVirtualList } from '../widgets/dropdowns';

const INPUT_SELECTOR = '.ag-advanced-filter input[type=text]';
const AUTOCOMPLETE_POPUP = '.ag-autocomplete-list-popup';

/**
 * Drives the Advanced Filter text editor and its autocomplete through public DOM only.
 * Autocomplete selection works via Enter/Tab even when the VirtualList rows aren't visibly rendered,
 * because the autocomplete tracks its highlighted entry internally.
 */
export class AdvancedFilterHarness {
    private constructor(
        public readonly api: GridApi,
        public readonly input: HTMLInputElement
    ) {}

    public static get(api: GridApi): AdvancedFilterHarness {
        const gridDiv = getGridElement(api)! as HTMLElement;
        const input = gridDiv.querySelector<HTMLInputElement>(INPUT_SELECTOR);
        if (!input) {
            throw new Error('Advanced filter input not found in DOM');
        }
        return new AdvancedFilterHarness(api, input);
    }

    /** Current text in the editor. */
    public get value(): string {
        return this.input.value;
    }

    /** Sets the input value with the caret at `cursorPos` (default end) and fires an input event. */
    public async type(text: string, cursorPos?: number): Promise<this> {
        const pos = cursorPos ?? text.length;
        const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!;
        setter.call(this.input, text);
        this.input.selectionStart = pos;
        this.input.selectionEnd = pos;
        this.input.dispatchEvent(new Event('input', { bubbles: true }));
        await asyncSetTimeout(0);
        // VirtualList: even with `installFilterLayoutMock` it needs a scroll nudge + tick to draw rows.
        if (this.isAutocompleteOpen()) {
            nudgeVirtualList('.ag-autocomplete-list-popup .ag-virtual-list-viewport');
            nudgeVirtualList('.ag-autocomplete-list .ag-virtual-list-viewport');
            await asyncSetTimeout(0);
        }
        return this;
    }

    /** Appends `suffix` to the current value (used to drive multi-step autocomplete). */
    public async append(suffix: string): Promise<this> {
        return this.type(this.input.value + suffix);
    }

    public async pressKey(key: string): Promise<this> {
        this.input.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true }));
        await asyncSetTimeout(0);
        return this;
    }

    public isAutocompleteOpen(): boolean {
        return document.querySelector(AUTOCOMPLETE_POPUP) !== null;
    }

    /** Rendered autocomplete entry labels — reliable only when `installFilterLayoutMock` is active (VirtualList needs height). */
    public autocompleteEntries(): string[] {
        return Array.from(document.querySelectorAll('.ag-autocomplete-list .ag-autocomplete-row')).map(
            (el) => el.textContent?.trim() ?? ''
        );
    }

    /** Selects the highlighted autocomplete entry (Enter). */
    public async selectAutocomplete(): Promise<this> {
        return this.pressKey('Enter');
    }

    /** Tab also confirms the highlighted autocomplete entry. */
    public async tabComplete(): Promise<this> {
        return this.pressKey('Tab');
    }

    /** Closes any open autocomplete list and applies the expression (Escape then Enter). */
    public async apply(): Promise<this> {
        await this.pressKey('Escape');
        await this.pressKey('Enter');
        return this;
    }

    /** Types a full expression and applies it. */
    public async applyExpression(expression: string): Promise<this> {
        await this.type(expression);
        return this.apply();
    }

    public getModel(): any {
        return this.api.getAdvancedFilterModel();
    }
}
