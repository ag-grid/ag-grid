import type { GridApi } from 'ag-grid-community';

import { DragEventDispatcher } from '../drag-n-drop/drag-event-dispatcher';
import { asyncSetTimeout } from '../node-utils';
import { firePointerLikeClick } from '../test-utils-events';
import { nudgeVirtualList, openPicker, selectRichSelectRow } from '../widgets/dropdowns';

/** Row height the builder virtual list is created with (`setRowHeight(40)`); used to target drag drops. */
const BUILDER_ROW_HEIGHT = 40;

const BUILDER = '.ag-advanced-filter-builder';
const ITEM_WRAPPER = '.ag-advanced-filter-builder-item-wrapper';
const COLUMN_PILL = '.ag-advanced-filter-builder-column-pill';
const OPTION_PILL = '.ag-advanced-filter-builder-option-pill';
const VALUE_PILL = '.ag-advanced-filter-builder-value-pill';
const JOIN_PILL = '.ag-advanced-filter-builder-join-pill';

/**
 * Drives the Advanced Filter Builder dialog through public DOM. Requires the layout mock
 * (`installFilterLayoutMock`) so the builder VirtualList and pill rich-select popups render rows in jsdom.
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

    private async selectPill(item: HTMLElement, pillSelector: string, displayName: string): Promise<void> {
        const pill = item.querySelector<HTMLElement>(pillSelector);
        if (!pill) {
            throw new Error(`Pill "${pillSelector}" not found on builder item`);
        }
        await openPicker(pill);
        // The builder pill defers showPicker() by a macrotask; wait for the list to mount.
        await asyncSetTimeout(0);
        await this.ensureItemsRendered();
        await selectRichSelectRow(displayName);
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

    /** Clicks the value pill on `item`, types `value` into the editor it opens, and commits (Enter). */
    public async setValue(item: HTMLElement, value: string): Promise<this> {
        const pill = item.querySelector<HTMLElement>(VALUE_PILL);
        if (!pill) {
            throw new Error('Value pill not found on builder item');
        }
        await firePointerLikeClick(pill);
        await asyncSetTimeout(0);
        // The column/operator pills carry hidden rich-select inputs; the value editor is the only visible one.
        const editor = Array.from(item.querySelectorAll<HTMLInputElement>('input.ag-text-field-input')).find(
            (input) => !input.closest('.ag-hidden')
        );
        if (!editor) {
            throw new Error('Value editor input did not open');
        }
        const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!;
        setter.call(editor, value);
        editor.dispatchEvent(new Event('input', { bubbles: true }));
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
        const remove = item.querySelector<HTMLElement>('[aria-label="Remove"]');
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
        const button = item.querySelector<HTMLElement>(`[aria-label="${label}"]`);
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
            await asyncSetTimeout(50);
        } finally {
            doc.elementsFromPoint = originalElementsFromPoint as typeof doc.elementsFromPoint;
        }
        return this;
    }

    /**
     * Re-applies the current model to force the builder to recreate its item rows. Needed before
     * dragging in jsdom: the synchronous layout mock renders the initial rows before the builder
     * assigns its drag feature, so the first-render rows have no drag source.
     */
    public async forceReRender(): Promise<this> {
        this.api.setAdvancedFilterModel(this.api.getAdvancedFilterModel());
        this.api.onFilterChanged();
        await asyncSetTimeout(10);
        await this.ensureItemsRendered();
        return this;
    }
}
