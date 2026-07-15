import { asyncSetTimeout } from '../node-utils';
import { firePointerLikeClick } from '../test-utils-events';

/**
 * Interaction helpers for the two filter dropdown widgets: AgSelect (non-virtualised) and
 * AgRichSelect (VirtualList). Both open on `mousedown` (hence `firePointerLikeClick`, not `.click()`);
 * AgRichSelect also needs the layout mock plus a scroll nudge for its VirtualList to render rows.
 */

const RICH_SELECT_VIEWPORT = '.ag-rich-select-virtual-list-viewport';

/** Nudges a VirtualList viewport so jsdom re-runs drawVirtualRows against its (mocked) height. */
export function nudgeVirtualList(selector: string, root: ParentNode = document): void {
    const el = root.querySelector<HTMLElement>(selector);
    if (el) {
        el.scrollTop = 1;
        el.scrollTop = 0;
    }
}

/** Opens a picker field (AgSelect or AgRichSelect) by pointer-clicking its wrapper. */
export async function openPicker(pickerRoot: Element): Promise<void> {
    const wrapper = pickerRoot.querySelector<HTMLElement>('.ag-picker-field-wrapper') ?? (pickerRoot as HTMLElement);
    await firePointerLikeClick(wrapper);
    await asyncSetTimeout(0);
}

// --- AgSelect (simple-filter operator dropdown) ---

/** All open AgSelect list option labels, in order. */
export function getSelectOptionLabels(root: ParentNode = document): string[] {
    return Array.from(root.querySelectorAll('.ag-list-item[role=option] .ag-list-item-text')).map(
        (el) => el.textContent?.trim() ?? ''
    );
}

/** Clicks the open AgSelect option whose text matches `label`. Throws if not present. */
export async function clickSelectOption(label: string, root: ParentNode = document): Promise<void> {
    const option = Array.from(root.querySelectorAll<HTMLElement>('.ag-list-item[role=option]')).find(
        (el) => el.textContent?.trim() === label
    );
    if (!option) {
        throw new Error(`AgSelect option "${label}" not found. Available: ${getSelectOptionLabels(root).join(', ')}`);
    }
    await firePointerLikeClick(option);
    await asyncSetTimeout(0);
}

// --- AgRichSelect (builder pills) ---

/**
 * Selects the open AgRichSelect row whose text matches `label`. AgRichSelect resolves the clicked
 * row from `event.clientY` (not the target), so we compute clientY from the list rect and row index;
 * a plain synthetic click has clientY 0 and always hits row 0. Assumes the list isn't scrolled.
 */
export async function selectRichSelectRow(label: string, root: ParentNode = document): Promise<void> {
    nudgeVirtualList(RICH_SELECT_VIEWPORT, root);
    await asyncSetTimeout(0);

    const rows = Array.from(root.querySelectorAll<HTMLElement>('.ag-rich-select-row'));
    const index = rows.findIndex((r) => r.textContent?.trim() === label);
    if (index < 0) {
        throw new Error(
            `AgRichSelect row "${label}" not found. Available: ${rows.map((r) => r.textContent?.trim()).join(', ')}`
        );
    }

    const list = root.querySelector<HTMLElement>('.ag-rich-select-list');
    const listTop = list?.getBoundingClientRect().top ?? 0;
    const rowHeight = rows[0].getBoundingClientRect().height || 20;
    const clientY = listTop + index * rowHeight + rowHeight / 2;

    const target = rows[index];
    for (const type of ['mousedown', 'mouseup', 'click'] as const) {
        target.dispatchEvent(new MouseEvent(type, { clientY, bubbles: true }));
    }
    await asyncSetTimeout(0);
}
