import { cellKey, parseRowElement } from '../gridHtmlRows';

export const AUTO_GROUP_COL_ID = 'ag-Grid-AutoColumn';

export function isAutoGroupColumn(columnId: string): boolean {
    return columnId === AUTO_GROUP_COL_ID || columnId.startsWith(`${AUTO_GROUP_COL_ID}-`);
}

export function cellValueMismatchMsg(columnId: string, expected: unknown, actual: string): string {
    return `HTML cell value mismatch for column id:"${columnId}", expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`;
}

export function hasSuppressCount(params: unknown): boolean | undefined {
    if (params && typeof params === 'object' && 'suppressCount' in params) {
        return !!(params as any).suppressCount;
    }
    return undefined;
}

export function combineGroupValue(valueText: string, childCountText: string): string {
    return valueText ? (childCountText ? `${valueText} ${childCountText}` : valueText) : childCountText;
}

export function findCellElement(rowElements: HTMLElement[], columnId: string): HTMLElement | null {
    const selector = `[col-id="${CSS.escape(columnId)}"]`;
    for (const rowElement of rowElements) {
        const match = rowElement.querySelector(selector) as HTMLElement | null;
        if (match) {
            return match;
        }
    }
    return null;
}

export function findGroupRowsWrapper(rowElements: HTMLElement[]): HTMLElement | null {
    for (const rowElement of rowElements) {
        const wrapper = rowElement.querySelector('.ag-cell-wrapper.ag-row-group');
        if (wrapper) {
            return wrapper as HTMLElement;
        }
    }
    return null;
}

export function getGroupRowsActualText(wrapper: HTMLElement): string {
    const value = wrapper.querySelector('.ag-group-value')?.textContent?.trim() ?? '';
    const childCount = wrapper.querySelector('.ag-group-child-count')?.textContent?.trim() ?? '';
    return value && childCount ? `${value} ${childCount}` : value || childCount;
}

/**
 * The inline editor's text-like input, matching custom editors that render a bare input with no
 * `ag-cell-editor` wrapper. Checkboxes carry no text value (see `validateCheckboxCell`), and a popup
 * editor's input lives outside the cell, so both yield null.
 */
export function findEditorInput(cellElement: HTMLElement): HTMLInputElement | HTMLTextAreaElement | null {
    return cellElement.querySelector<HTMLInputElement | HTMLTextAreaElement>(
        'input:not([type="checkbox"]):not([type="radio"]), textarea'
    );
}

/**
 * Whether `input` is a built-in AG editor input, whose `.value` tracks the editor's `getValue()`.
 * A custom composite editor may render several arbitrary inputs with no such guarantee, so the
 * DOM value cross-check is limited to these (invalid-marker checks still cover custom editors).
 */
export function isAgEditorInput(input: HTMLInputElement | HTMLTextAreaElement): boolean {
    return input.classList.contains('ag-input-field-input') || input.classList.contains('ag-large-text-input');
}

/**
 * Whether the cell's editor advertises an invalid state in the DOM (`aria-invalid="true"`,
 * `setCustomValidity`, or the `invalid` class). Every control is inspected, not just the first:
 * a composite editor may carry the custom-validity message on a later one.
 */
export function cellShowsInvalid(cellElement: HTMLElement): boolean {
    if (
        cellElement.matches('[aria-invalid="true"], .invalid') ||
        cellElement.querySelector('[aria-invalid="true"], .invalid')
    ) {
        return true;
    }
    // customError only: native constraints (the number editor's own min/max params, pattern, required)
    // fill validationMessage on their own, with no grid validation pass behind it.
    const controls = cellElement.querySelectorAll<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>(
        'input, textarea, select'
    );
    for (let i = 0, len = controls.length; i < len; ++i) {
        if (controls[i].validity.customError) {
            return true;
        }
    }
    return false;
}

/**
 * Cell keys (`rowIndex:rowPinned:colId`) whose editor shows an invalid DOM marker. Read after the
 * validation pass has applied its markers, so a cell validated for the first time is included; a
 * model error with no marker here then means the editor exposes no markable validation element.
 * Inline editors only — a popup's markers render outside the cell, with nothing tying them back.
 */
export function captureDomInvalidCellKeys(gridElement: HTMLElement): Set<string> {
    const keys = new Set<string>();
    // As in getGridRowsHtmlElements: a nested detail grid renders inside this element, and its row
    // indexes collide with this grid's.
    const gridRoot = gridElement.querySelector('.ag-root-wrapper');
    // Iterate the actively-editing cells (not just AG editor inputs) so custom editors are covered.
    const cells = gridElement.querySelectorAll<HTMLElement>('.ag-cell-inline-editing[col-id]');
    for (let i = 0, len = cells.length; i < len; ++i) {
        const cellElement = cells[i];
        const rowElement = cellElement.closest<HTMLElement>('[row-index]');
        if (!rowElement || !cellShowsInvalid(cellElement)) {
            continue;
        }
        if (gridRoot && rowElement.closest('.ag-root-wrapper') !== gridRoot) {
            continue;
        }
        const { rowIndex, pinned } = parseRowElement(rowElement);
        keys.add(cellKey(rowIndex, pinned, cellElement.getAttribute('col-id')!));
    }
    return keys;
}
