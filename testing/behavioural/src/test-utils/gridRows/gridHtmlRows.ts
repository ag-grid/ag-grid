import type { GridApi } from 'ag-grid-community';

import { firePointerLikeClick } from '../test-utils-events';
import { TestGridsManager } from '../testGridsManager';

export type RowElementReference = string | Element | { readonly id: string | null | undefined } | null | undefined;

export type CheckboxState = boolean | 'mixed';

const ROW_SELECTOR = '[row-id]';
const CENTER_CONTAINER_SELECTORS = ['.ag-grid-scrolling-container'];
const ROW_SELECTION_CHECKBOX_QUERIES = [
    '.ag-selection-checkbox input[type="checkbox"]',
    '.ag-selection-checkbox [aria-checked]',
    '.ag-group-checkbox input[type="checkbox"]',
    '.ag-group-checkbox [aria-checked]',
    '.ag-checkbox-input-wrapper input[type="checkbox"]',
    '.ag-checkbox[aria-checked]',
    '.ag-checkbox',
];

export function getGridHTMLElement<TData = any>(api: GridApi<TData>): HTMLElement | null {
    return TestGridsManager.getHTMLElement(api) ?? null;
}

export interface SpannedCellInfo {
    colId: string;
    pinned: '' | 'top' | 'bottom';
    anchorIndex: number;
    span: number;
}

/** Parse a `.ag-spanned-row [col-id]` cell. Pinned rows carry a prefixed `row-index` (`t-0`/`b-0`);
 *  the model index (matching `RowNode.rowIndex`) is the trailing number. Returns null if not a real span. */
export function parseSpannedCell(cell: Element): SpannedCellInfo | null {
    const colId = cell.getAttribute('col-id');
    const span = Number(cell.getAttribute('aria-rowspan'));
    const raw = cell.closest('[row-index]')?.getAttribute('row-index');
    const anchorIndex = raw != null ? Number(raw.replace(/^\D+/, '')) : NaN;
    if (!colId || !Number.isFinite(anchorIndex) || !Number.isFinite(span) || span <= 1) {
        return null;
    }
    let pinned: '' | 'top' | 'bottom' = '';
    if (cell.closest('.ag-grid-pinned-top-rows')) {
        pinned = 'top';
    } else if (cell.closest('.ag-grid-pinned-bottom-rows')) {
        pinned = 'bottom';
    }
    return { colId, pinned, anchorIndex, span };
}

export function getGridOwnerDocument<TData = any>(api: GridApi<TData>): Document {
    return getGridHTMLElement(api)?.ownerDocument ?? document;
}

export function getGridRowsHtmlElements<TData = any>(api: GridApi<TData>): HTMLElement[] {
    const gridElement = getGridHTMLElement(api);
    if (!gridElement) {
        return [];
    }
    // Find this grid's own root wrapper to exclude rows from nested detail grids
    const gridRoot = gridElement.querySelector('.ag-root-wrapper');
    const allRows = Array.from(gridElement.querySelectorAll<HTMLElement>(ROW_SELECTOR));
    if (!gridRoot) {
        return allRows;
    }
    return allRows.filter((row) => row.closest('.ag-root-wrapper') === gridRoot);
}

export function getRowHtmlElements<TData = any>(api: GridApi<TData>, reference: RowElementReference): HTMLElement[] {
    const rowId = resolveRowElementId(reference);
    if (rowId == null) {
        return [];
    }
    const rowElements = getGridRowsHtmlElements(api);
    const mainRowElements: HTMLElement[] = [];
    const secondaryRowElements: HTMLElement[] = [];

    for (const rowElement of rowElements) {
        if (rowElement.getAttribute('row-id') !== rowId) {
            continue;
        }

        if (CENTER_CONTAINER_SELECTORS.some((selector) => rowElement.closest(selector))) {
            mainRowElements.push(rowElement);
        } else {
            secondaryRowElements.push(rowElement);
        }
    }

    return mainRowElements.length ? mainRowElements.concat(secondaryRowElements) : secondaryRowElements;
}

export function getRowHtmlElement<TData = any>(
    api: GridApi<TData>,
    reference: RowElementReference
): HTMLElement | null {
    const elements = getRowHtmlElements(api, reference);
    return elements.length > 0 ? elements[0] : null;
}

export function getRowSelectionCheckboxElement<TData = any>(
    api: GridApi<TData>,
    row: RowElementReference
): HTMLElement | null {
    const rowElements = getRowHtmlElements(api, row);
    for (const rowElement of rowElements) {
        for (const selector of ROW_SELECTION_CHECKBOX_QUERIES) {
            const candidate = rowElement.querySelector<HTMLElement>(selector);
            if (candidate) {
                return candidate;
            }
        }
    }
    return null;
}

export function getRowSelectionCheckboxState<TData = any>(
    api: GridApi<TData>,
    row: RowElementReference
): CheckboxState | undefined {
    const checkbox = getRowSelectionCheckboxElement(api, row);
    return checkbox ? readRowSelectionCheckboxState(checkbox) : undefined;
}

export async function clickRowSelectionCheckbox<TData = any>(
    api: GridApi<TData>,
    row: RowElementReference | (RowElementReference | null | undefined)[] | null | undefined
): Promise<boolean> {
    if (Array.isArray(row)) {
        let result = false;
        for (const item of row) {
            if (await clickRowSelectionCheckbox(api, item)) {
                result = true;
            }
        }
        return result;
    }
    return firePointerLikeClick(getRowSelectionCheckboxElement(api, row));
}

function resolveRowElementId(reference: RowElementReference): string | null {
    if (reference == null) {
        return null;
    }
    if (typeof reference === 'object') {
        if (reference instanceof Element) {
            const rowElement = reference.matches(ROW_SELECTOR)
                ? reference
                : (reference.closest(ROW_SELECTOR) as HTMLElement | null);
            return rowElement?.getAttribute('row-id') ?? null;
        }
        return reference.id ?? null;
    }
    return String(reference);
}

function readRowSelectionCheckboxState(element: HTMLElement): CheckboxState | undefined {
    if (element instanceof HTMLInputElement && element.type === 'checkbox') {
        if (element.indeterminate) {
            return 'mixed';
        }
        return element.checked;
    }

    const ariaChecked = element.getAttribute('aria-checked');
    if (ariaChecked === 'mixed') {
        return 'mixed';
    }
    if (ariaChecked === 'true') {
        return true;
    }
    if (ariaChecked === 'false') {
        return false;
    }

    const inputChild = element.querySelector<HTMLInputElement>('input[type="checkbox"]');
    if (inputChild) {
        return readRowSelectionCheckboxState(inputChild);
    }

    const ariaChild = element.querySelector<HTMLElement>('[aria-checked]');
    if (ariaChild) {
        return readRowSelectionCheckboxState(ariaChild);
    }

    if (element.classList.contains('ag-checkbox')) {
        if (element.classList.contains('ag-indeterminate')) {
            return 'mixed';
        }
        if (element.classList.contains('ag-checked')) {
            return true;
        }
        if (element.classList.contains('ag-unchecked')) {
            return false;
        }
    }

    return undefined;
}
