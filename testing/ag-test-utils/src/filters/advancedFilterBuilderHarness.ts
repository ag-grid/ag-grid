import { waitFor } from '@testing-library/dom';

import type { GridApi } from 'ag-grid-community';

import { DragEventDispatcher } from '../drag-n-drop/drag-event-dispatcher';
import { asyncSetTimeout } from '../node-utils';
import { firePointerLikeClick } from '../test-utils-events';
import { getRichSelectRowLabels, nudgeVirtualList, openPicker, selectRichSelectRow } from '../widgets/dropdowns';
import { setNativeInputValue } from '../widgets/inputs';

/** Row height the builder virtual list is created with (`setRowHeight(40)`); used to target drag drops. */
const BUILDER_ROW_HEIGHT = 40;

const BUILDER = '.ag-advanced-filter-builder';
const VIRTUAL_LIST_ITEM = '.ag-advanced-filter-builder-virtual-list-item';
const RICH_SELECT_ITEM = '.ag-rich-select-virtual-list-item';
const ITEM_WRAPPER = '.ag-advanced-filter-builder-item-wrapper';
const COLUMN_PILL = '.ag-advanced-filter-builder-column-pill';
const OPTION_PILL = '.ag-advanced-filter-builder-option-pill';
const VALUE_PILL = '.ag-advanced-filter-builder-value-pill';
const PILL_DISPLAY = '.ag-advanced-filter-builder-pill-display';
const JOIN_PILL = '.ag-advanced-filter-builder-join-pill';

/** Column-pill captions in rendered order — the observable signature of the builder's item list. */
function columnPillOrder(): string {
    return Array.from(document.querySelectorAll<HTMLElement>(`${ITEM_WRAPPER} ${COLUMN_PILL}`))
        .map((pill) => pill.textContent)
        .join('|');
}

/**
 * Drives the Advanced Filter Builder dialog through public DOM. Requires the layout mock
 * (`installFilterLayoutMock`) so the builder VirtualList and pill rich-select popups render rows without layout.
 */
export class AdvancedFilterBuilderHarness {
    private constructor(public readonly api: GridApi) {}

    public static async open(api: GridApi): Promise<AdvancedFilterBuilderHarness> {
        api.showAdvancedFilterBuilder();
        await asyncSetTimeout(0);
        const harness = new AdvancedFilterBuilderHarness(api);
        await harness.ensureItemsRendered();
        return harness;
    }

    public async close(): Promise<void> {
        this.api.hideAdvancedFilterBuilder();
        await asyncSetTimeout(0);
    }

    public static isOpen(): boolean {
        return document.querySelector(BUILDER) !== null;
    }

    /** VirtualList renders 0 rows until it has height + a scroll event; nudge it. */
    public async ensureItemsRendered(): Promise<void> {
        nudgeVirtualList('.ag-advanced-filter-builder-virtual-list-viewport');
        nudgeVirtualList('.ag-rich-select-virtual-list-viewport');
        await asyncSetTimeout(0);
    }

    public async items(): Promise<HTMLElement[]> {
        await this.ensureItemsRendered();
        return Array.from(document.querySelectorAll<HTMLElement>(ITEM_WRAPPER));
    }

    /** Item rows that are filter conditions (have a column pill). */
    public async conditionItems(): Promise<HTMLElement[]> {
        return (await this.items()).filter((item) => item.querySelector(COLUMN_PILL));
    }

    /** Item rows that are join operators (join pill, no column pill). */
    public async joinItems(): Promise<HTMLElement[]> {
        return (await this.items()).filter((item) => item.querySelector(JOIN_PILL) && !item.querySelector(COLUMN_PILL));
    }

    /** Opens the column pill on `item` and selects `displayName` from the rich-select. */
    public async selectColumn(item: HTMLElement, displayName: string): Promise<this> {
        await this.selectPill(item, COLUMN_PILL, displayName);
        return this;
    }

    /** Opens the operator pill on `item` and selects `displayName` from the rich-select. */
    public async selectOperator(item: HTMLElement, displayName: string): Promise<this> {
        await this.selectPill(item, OPTION_PILL, displayName);
        return this;
    }

    /** Opens the operator pill on `item` and reads the options it offers, in order. */
    public async operatorOptions(item: HTMLElement): Promise<string[]> {
        const pill = await this.openPillPicker(item, OPTION_PILL);
        try {
            // Both polled together: the list virtualises, so a partial render is a state to wait out rather
            // than an answer, and a viewport-sized subset would let an absence assertion pass vacuously.
            return await waitFor(() => {
                const setSize = Number(document.querySelector(RICH_SELECT_ITEM)?.getAttribute('aria-setsize'));
                const options = getRichSelectRowLabels();
                if (!options.length || options.length < setSize) {
                    throw new Error(`Only ${options.length} of ${setSize || '?'} operator rows rendered`);
                }
                return options;
            });
        } finally {
            // Leave the pill closed, so a following selection re-opens it rather than toggling it shut.
            pill.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
            await asyncSetTimeout(0);
        }
    }

    private async selectPill(item: HTMLElement, pillSelector: string, displayName: string): Promise<void> {
        await this.openPillPicker(item, pillSelector);
        await selectRichSelectRow(displayName);
    }

    /**
     * The row currently rendered for `item`, resolved by its own identity rather than the caller's element:
     * committing an edit re-renders the row, leaving a detached tree that can be clicked forever.
     */
    private liveItem(item: HTMLElement): HTMLElement {
        const posInSet = item.closest(VIRTUAL_LIST_ITEM)?.getAttribute('aria-posinset');
        if (!posInSet) {
            throw new Error('Builder item is not one of the rendered rows');
        }
        const live = document.querySelector<HTMLElement>(`${VIRTUAL_LIST_ITEM}[aria-posinset="${posInSet}"]`);
        if (!live) {
            throw new Error(`Builder row ${posInSet} is no longer rendered`);
        }
        return live;
    }

    /** Opens the pill's rich-select, waits for its rows to render, and returns the pill it opened. */
    private async openPillPicker(item: HTMLElement, pillSelector: string): Promise<HTMLElement> {
        const posInSet = this.liveItem(item).getAttribute('aria-posinset');
        const livePillSelector = `${VIRTUAL_LIST_ITEM}[aria-posinset="${posInSet}"] ${pillSelector}`;
        // Re-clicked, not just awaited: the pill defers showPicker(), so a click swallowed by a re-render
        // needs another - waiting alone never opens a picker that was never told to open.
        return waitFor(async () => {
            const livePill = document.querySelector<HTMLElement>(livePillSelector);
            if (!livePill) {
                throw new Error(`Pill "${pillSelector}" not found on builder item`);
            }
            if (document.querySelector('.ag-rich-select-list')) {
                return livePill;
            }
            await openPicker(livePill);
            await this.ensureItemsRendered();
            throw new Error(`Picker for "${pillSelector}" did not open`);
        });
    }

    /** Adds a new condition via the builder add-item button. */
    public async addCondition(): Promise<this> {
        const addButton = document.querySelector<HTMLElement>(
            '.ag-advanced-filter-builder-item-button.ag-advanced-filter-builder-add-item-button, .ag-advanced-filter-builder-item-add .ag-advanced-filter-builder-item-button'
        );
        if (!addButton) {
            throw new Error('Advanced filter builder add-condition button not found');
        }
        await firePointerLikeClick(addButton);
        await asyncSetTimeout(0);
        return this;
    }

    /** The value pills on `item` — a two-input filter option renders one per operand. */
    public valuePills(item: HTMLElement): HTMLElement[] {
        return Array.from(this.liveItem(item).querySelectorAll<HTMLElement>(VALUE_PILL));
    }

    /** Display text of value pill `index` on `item`. */
    public valuePillText(item: HTMLElement, index = 0): string {
        return this.valuePills(item)[index]?.querySelector(PILL_DISPLAY)?.textContent?.trim() ?? '';
    }

    /** Clicks value pill `index` on `item` and returns the editor input it opens. */
    public async openValueEditor(item: HTMLElement, index = 0): Promise<HTMLInputElement> {
        const pill = this.valuePills(item)[index];
        if (!pill) {
            throw new Error(`Value pill ${index} not found on builder item`);
        }
        await firePointerLikeClick(pill);
        // The column/operator pills carry hidden rich-select inputs; the value editor is the only
        // visible one, and it mounts a macrotask or two after the click — poll rather than guess a delay.
        return waitFor(() => {
            const input = Array.from(
                this.liveItem(item).querySelectorAll<HTMLInputElement>('input.ag-input-field-input')
            ).find((candidate) => !candidate.closest('.ag-hidden'));
            if (!input) {
                throw new Error('Value editor input did not open');
            }
            return input;
        });
    }

    /** Clicks value pill `index` on `item`, types `value` into the editor it opens, and commits (Enter). */
    public async setValue(item: HTMLElement, value: string, index = 0): Promise<this> {
        const editor = await this.openValueEditor(item, index);
        setNativeInputValue(editor, value);
        editor.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
        await asyncSetTimeout(0);
        return this;
    }

    /** Selects the join operator (`And`/`Or`) on a join `item`. */
    public async selectJoin(item: HTMLElement, displayName: string): Promise<this> {
        await this.selectPill(item, JOIN_PILL, displayName);
        return this;
    }

    /** Clicks the Remove button on `item` to delete that condition/group. */
    public async removeItem(item: HTMLElement): Promise<this> {
        const remove = this.liveItem(item).querySelector<HTMLElement>('[aria-label="Remove"]');
        if (!remove) {
            throw new Error('Remove button not found on builder item');
        }
        await firePointerLikeClick(remove);
        await asyncSetTimeout(0);
        return this;
    }

    /** Clicks the Move Up / Move Down button on `item` (requires `advancedFilterBuilderParams.showMoveButtons`). */
    public async move(item: HTMLElement, direction: 'up' | 'down'): Promise<this> {
        await this.clickMoveButton(item, direction);
        return this;
    }

    /** Focuses the Move Up / Move Down button on `item` and presses Enter (keyboard reorder path). */
    public async moveWithKeyboard(item: HTMLElement, direction: 'up' | 'down'): Promise<this> {
        const button = this.moveButton(item, direction);
        button.focus();
        button.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
        await asyncSetTimeout(0);
        return this;
    }

    private moveButton(item: HTMLElement, direction: 'up' | 'down'): HTMLElement {
        const label = direction === 'up' ? 'Move Up' : 'Move Down';
        const button = this.liveItem(item).querySelector<HTMLElement>(`[aria-label="${label}"]`);
        if (!button) {
            throw new Error(`"${label}" button not found (is advancedFilterBuilderParams.showMoveButtons set?)`);
        }
        return button;
    }

    private async clickMoveButton(item: HTMLElement, direction: 'up' | 'down'): Promise<void> {
        await firePointerLikeClick(this.moveButton(item, direction));
        await asyncSetTimeout(0);
    }

    /** Clicks the builder Apply button, committing the staged edits to the grid (and closing the dialog). */
    public async apply(): Promise<this> {
        const panel = document.querySelector(`${BUILDER} .ag-filter-apply-panel`);
        const button = Array.from(panel?.querySelectorAll<HTMLButtonElement>('button') ?? []).find(
            (b) => b.textContent?.trim() === 'Apply'
        );
        if (!button) {
            throw new Error('Builder Apply button not found');
        }
        await firePointerLikeClick(button);
        await asyncSetTimeout(0);
        return this;
    }

    /**
     * Drags `item`'s handle and drops it over builder list row `targetRow` (0 = the group's join row,
     * 1 = first condition, …), landing in the row's lower half so the drop lands *after* it. Requires
     * `initPointerEventPolyfill()`. The builder must have re-rendered its items after wiring the drag
     * feature — call {@link forceReRender} once after opening, or the drag source will be missing.
     */
    public async dragToRow(item: HTMLElement, targetRow: number): Promise<this> {
        const handle = item.querySelector<HTMLElement>('.ag-drag-handle');
        const container = document.querySelector<HTMLElement>(BUILDER);
        if (!handle || !container) {
            throw new Error('drag handle or builder container not found');
        }
        const toClientY = targetRow * BUILDER_ROW_HEIGHT + Math.round(BUILDER_ROW_HEIGHT * 0.75);
        const orderBeforeDrop = columnPillOrder();
        const doc = handle.ownerDocument;
        const originalElementsFromPoint = doc.elementsFromPoint?.bind(doc);
        // The drop target resolves via elementsFromPoint; point it at the builder container.
        doc.elementsFromPoint = () => [container];
        const dispatcher = new DragEventDispatcher('pointer', null, false);
        try {
            await dispatcher.startDrag(handle, 10, BUILDER_ROW_HEIGHT);
            await dispatcher.movePointer(container, 10, BUILDER_ROW_HEIGHT + 5);
            await dispatcher.movePointer(container, 10, toClientY);
            await dispatcher.finishDrag(container);
            // The drop re-renders the builder list asynchronously. Poll for the reordered pills
            // rather than guessing a delay — a drop that never lands must fail here, not silently
            // in the caller's assertion.
            await waitFor(() => {
                if (columnPillOrder() === orderBeforeDrop) {
                    throw new Error('builder rows did not reorder after drop');
                }
            });
        } finally {
            doc.elementsFromPoint = originalElementsFromPoint as typeof doc.elementsFromPoint;
        }
        return this;
    }

    /**
     * Re-applies the current model to force the builder to recreate its item rows. Needed before
     * dragging without layout: the synchronous layout mock renders the initial rows before the builder
     * assigns its drag feature, so the first-render rows have no drag source.
     */
    public async forceReRender(): Promise<this> {
        const rowsBefore = Array.from(document.querySelectorAll<HTMLElement>(ITEM_WRAPPER));
        this.api.setAdvancedFilterModel(this.api.getAdvancedFilterModel());
        this.api.onFilterChanged();
        // Recreating the rows is the whole point of this helper, so poll until the rendered rows are
        // new element instances — the only signal that can distinguish a rebuild from the original render.
        await waitFor(async () => {
            nudgeVirtualList('.ag-advanced-filter-builder-virtual-list-viewport');
            nudgeVirtualList('.ag-rich-select-virtual-list-viewport');
            await asyncSetTimeout(0);
            const rowsNow = Array.from(document.querySelectorAll<HTMLElement>(ITEM_WRAPPER));
            if (rowsNow.length === 0 || rowsNow.some((row) => rowsBefore.includes(row))) {
                throw new Error('builder item rows were not recreated');
            }
        });
        return this;
    }
}
