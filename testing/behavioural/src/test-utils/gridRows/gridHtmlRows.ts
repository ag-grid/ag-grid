import type { GridApi } from 'ag-grid-community';
import { getGridApi } from 'ag-grid-community';

import { firePointerLikeClick } from '../test-utils-events';
import { TestGridsManager } from '../testGridsManager';

export type RowElementReference = string | Element | { readonly id: string | null | undefined } | null | undefined;

export type CheckboxState = boolean | 'mixed';

export class GridHtmlRows<TData = any> {
    public readonly api: GridApi<TData>;

    #ownerDocument: Document | null = null;
    #rootNode: Node | null = null;
    #rowsHtmlElements: HTMLElement[] | null = null;
    #gridHtmlElement: HTMLElement | null | undefined = undefined;
    #rowsHtmlElementsMap: Map<string, HTMLElement[]> | null = null;

    public constructor(api: GridApi<TData> | Element | string | null | undefined) {
        if (typeof api === 'string' || api instanceof Element) {
            api = getGridApi(api);
        }
        if (!api) {
            throw new Error('No grid instance found for the provided element');
        }
        this.api = api;
    }

    public get ownerDocument(): Document {
        return (this.#ownerDocument ??= this.gridHtmlElement?.ownerDocument ?? document);
    }

    public get rootNode(): Node {
        return (this.#rootNode ??= this.gridHtmlElement?.getRootNode() ?? this.ownerDocument);
    }

    public get gridHtmlElement(): HTMLElement | null {
        let element = this.#gridHtmlElement;
        if (element === undefined) {
            element = TestGridsManager.getHTMLElement(this.api);
            this.#gridHtmlElement = element;
        }
        return element ?? null;
    }

    public get rowsHtmlElements(): HTMLElement[] {
        return (this.#rowsHtmlElements ??= Array.from(
            this.gridHtmlElement?.querySelectorAll<HTMLElement>('[row-id]') ?? []
        ));
    }

    public getRowHtmlElements(reference: RowElementReference): HTMLElement[] {
        if (reference == null) {
            return [];
        }
        if (typeof reference === 'object') {
            if (reference instanceof Element) {
                const rowElId = reference.getAttribute('row-id');
                if (rowElId != null) {
                    reference = rowElId;
                } else {
                    const rowEl = reference.closest('[row-id]');
                    if (!(rowEl instanceof HTMLElement)) {
                        return [];
                    }
                    reference = rowEl.getAttribute('row-id');
                }
            } else {
                reference = reference?.id ?? null;
            }
            if (reference === null) {
                return [];
            }
        }
        reference = String(reference);
        let map = this.#rowsHtmlElementsMap;
        if (!map) {
            map = buildRowElementsMap(this.rowsHtmlElements);
            this.#rowsHtmlElementsMap = map;
        }
        return map.get(reference) ?? [];
    }

    public getRowHtmlElement(id: RowElementReference): HTMLElement | null {
        const elements = this.getRowHtmlElements(id);
        return elements.length > 0 ? elements[0] : null;
    }

    public getRowSelectionCheckboxElement(row: RowElementReference): HTMLElement | null {
        const rowElements = this.getRowHtmlElements(row);
        for (let i = 0, len = rowElements.length; i < len; ++i) {
            const rowElement = rowElements[i];
            for (const selector of ROW_SELECTION_CHECKBOX_QUERIES) {
                const candidate = rowElement.querySelector<HTMLElement>(selector);
                if (candidate) {
                    return candidate;
                }
            }
        }
        return null;
    }

    public getRowSelectionCheckboxState(row: RowElementReference): CheckboxState | undefined {
        const checkbox = this.getRowSelectionCheckboxElement(row);
        return checkbox ? readRowSelectionCheckboxState(checkbox) : undefined;
    }

    public async clickRowSelectionCheckbox(
        row: RowElementReference | (RowElementReference | null | undefined)[] | null | undefined
    ): Promise<boolean> {
        if (Array.isArray(row)) {
            let result = false;
            for (const item of row) {
                if (await this.clickRowSelectionCheckbox(item)) {
                    result = true;
                }
            }
            return result;
        }
        return firePointerLikeClick(this.getRowSelectionCheckboxElement(row));
    }

    public invalidateHtml(): void {
        this.#ownerDocument = null;
        this.#rootNode = null;
        this.#rowsHtmlElements = null;
        this.#gridHtmlElement = undefined;
        this.#rowsHtmlElementsMap = null;
    }
}

const ROW_SELECTION_CHECKBOX_QUERIES = [
    '.ag-selection-checkbox input[type="checkbox"]',
    '.ag-selection-checkbox [aria-checked]',
    '.ag-group-checkbox input[type="checkbox"]',
    '.ag-group-checkbox [aria-checked]',
    '.ag-checkbox-input-wrapper input[type="checkbox"]',
    '.ag-checkbox[aria-checked]',
    '.ag-checkbox',
];

function buildRowElementsMap(rowElements: Iterable<HTMLElement>): Map<string, HTMLElement[]> {
    const map = new Map<string, HTMLElement[]>();

    for (const rowElement of rowElements) {
        const rowId = rowElement.getAttribute('row-id');
        if (!rowId) {
            continue;
        }

        const existing = map.get(rowId);
        const isMainRowElement = rowElement.closest('.ag-center-cols-container') !== null;

        if (existing) {
            const index = existing.indexOf(rowElement);
            if (index >= 0) {
                if (isMainRowElement && index > 0) {
                    existing.splice(index, 1);
                    existing.unshift(rowElement);
                }
            } else if (isMainRowElement) {
                existing.unshift(rowElement);
            } else {
                existing.push(rowElement);
            }
        } else {
            map.set(rowId, [rowElement]);
        }
    }

    return map;
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
