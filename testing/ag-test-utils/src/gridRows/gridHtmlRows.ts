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
    // Selection wrappers only: a bare `.ag-checkbox` fallback also matches a checkbox cell renderer, so a
    // row without a selection checkbox would have its data cell clicked instead of failing to find one.
];

export function getGridHTMLElement<TData = any>(api: GridApi<TData>): HTMLElement | null {
    return TestGridsManager.getHTMLElement(api);
}

export interface SpannedCellInfo {
    colId: string;
    pinned: '' | 'top' | 'bottom';
    anchorIndex: number;
    span: number;
}

/** The cell key shared by the model-side and DOM-side invalid/editing lookups. Both must build it here,
 *  or a mismatch silently makes the cross-checks pass. */
export function cellKey(rowIndex: number | null | undefined, pinned: string | null | undefined, colId: string) {
    return `${rowKey(rowIndex, pinned)}:${colId}`;
}

/** As {@link cellKey}, for row-scoped lookups. The pinned section is part of the key because a pinned row
 *  and a body row share a rowIndex. */
export function rowKey(rowIndex: number | null | undefined, pinned: string | null | undefined) {
    return `${rowIndex}:${pinned ?? ''}`;
}

/** Model row index + pinned section of a `[row-index]` element. Pinned rows carry a prefixed `row-index`
 *  (`t-0`/`b-0`); the model index (matching `RowNode.rowIndex`) is the trailing number. */
export function parseRowElement(rowElement: Element): { rowIndex: number; pinned: '' | 'top' | 'bottom' } {
    const raw = rowElement.getAttribute('row-index');
    const rowIndex = raw != null ? Number(raw.replace(/^\D+/, '')) : NaN;
    let pinned: '' | 'top' | 'bottom' = '';
    if (rowElement.closest('.ag-grid-pinned-top-rows')) {
        pinned = 'top';
    } else if (rowElement.closest('.ag-grid-pinned-bottom-rows')) {
        pinned = 'bottom';
    }
    return { rowIndex, pinned };
}

/** Parse a `.ag-spanned-row [col-id]` cell. Returns null if not a real span. */
export function parseSpannedCell(cell: Element): SpannedCellInfo | null {
    const colId = cell.getAttribute('col-id');
    const span = Number(cell.getAttribute('aria-rowspan'));
    const rowElement = cell.closest('[row-index]');
    if (!colId || !rowElement || !Number.isFinite(span) || span <= 1) {
        return null;
    }
    const { rowIndex: anchorIndex, pinned } = parseRowElement(rowElement);
    if (!Number.isFinite(anchorIndex)) {
        return null;
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
    if (!gridRoot) {
        return Array.from(gridElement.querySelectorAll<HTMLElement>(ROW_SELECTOR));
    }
    // Scoping the query to the wrapper already drops every row a `closest` filter would have: a row
    // outside it has no `.ag-root-wrapper` ancestor at all.
    const rows = Array.from(gridRoot.querySelectorAll<HTMLElement>(ROW_SELECTOR));
    const nestedRoots = gridRoot.querySelectorAll('.ag-root-wrapper');
    if (nestedRoots.length === 0) {
        return rows;
    }
    // Only master/detail gets here. Walking parents by identity costs nothing per step; `closest`
    // ran the selector engine at every ancestor of every row, on the assertion path.
    const nested = new Set<Element>(nestedRoots);
    return rows.filter((row) => {
        for (let el = row.parentElement; el && el !== gridRoot; el = el.parentElement) {
            if (nested.has(el)) {
                return false;
            }
        }
        return true;
    });
}

/** Centre-container elements first: a row spanning pinned columns has one element per container. */
function orderRowElements(rowElements: HTMLElement[]): HTMLElement[] {
    if (rowElements.length < 2) {
        return rowElements;
    }
    const mainRowElements: HTMLElement[] = [];
    const secondaryRowElements: HTMLElement[] = [];
    for (const rowElement of rowElements) {
        if (CENTER_CONTAINER_SELECTORS.some((selector) => rowElement.closest(selector))) {
            mainRowElements.push(rowElement);
        } else {
            secondaryRowElements.push(rowElement);
        }
    }
    const ordered = mainRowElements.length ? mainRowElements.concat(secondaryRowElements) : secondaryRowElements;
    // A span anchor renders a second element sharing its row-id, holding the merged cells rather than the
    // row's own classes and aria - so the row itself must come first for the `rowElements[0]` callers.
    const spanned = (el: HTMLElement) => el.classList.contains('ag-spanned-row');
    return [...ordered.filter((el) => !spanned(el)), ...ordered.filter(spanned)];
}

/**
 * Every row element grouped by `row-id`. Callers that resolve more than one row must build this once
 * and index it: resolving each row on its own rescans the whole grid, making a validation pass
 * quadratic in the row count.
 */
export function getGridRowsHtmlElementsById<TData = any>(api: GridApi<TData>): Map<string, HTMLElement[]> {
    const byId = new Map<string, HTMLElement[]>();
    for (const rowElement of getGridRowsHtmlElements(api)) {
        const rowId = rowElement.getAttribute('row-id');
        if (rowId == null) {
            continue;
        }
        const existing = byId.get(rowId);
        if (existing) {
            existing.push(rowElement);
        } else {
            byId.set(rowId, [rowElement]);
        }
    }
    for (const [rowId, rowElements] of byId) {
        byId.set(rowId, orderRowElements(rowElements));
    }
    return byId;
}

export function getRowHtmlElements<TData = any>(api: GridApi<TData>, reference: RowElementReference): HTMLElement[] {
    const rowId = resolveRowElementId(reference);
    if (rowId == null) {
        return [];
    }
    return orderRowElements(getGridRowsHtmlElements(api).filter((el) => el.getAttribute('row-id') === rowId));
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
