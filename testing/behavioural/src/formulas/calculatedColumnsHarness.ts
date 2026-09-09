// Shared setup for the calculated-columns suites: the grid manager, the dialog and menu plumbing every one of
// them drives, and the layout polyfills the popup needs. Siblings rather than one file because vitest
// parallelises across files but not within one, so ~100 grid-building tests serialise in a single worker.
import { waitFor } from '@testing-library/dom';
import { TestGridsManager, clickMenuOption, clickSelectOption, openPicker, polyfillOffsetParent } from 'ag-test-utils';
import { vi } from 'vitest';

import type { ColDef, ColGroupDef, GridApi, GridOptions, Module } from 'ag-grid-community';
import {
    CellSpanModule,
    ClientSideRowModelModule,
    HighlightChangesModule,
    InfiniteRowModelModule,
    NumberEditorModule,
    NumberFilterModule,
    RowSelectionModule,
    TextEditorModule,
} from 'ag-grid-community';
import {
    CalculatedColumnsModule,
    ClipboardModule,
    ColumnHeaderEditModule,
    ColumnMenuModule,
    ContextMenuModule,
    PivotModule,
    RowGroupingModule,
    RowNumbersModule,
    ServerSideRowModelModule,
    TreeDataModule,
    ViewportRowModelModule,
} from 'ag-grid-enterprise';

export const flashCssClass = 'ag-cell-data-changed';
export const gridRowsOpts = { useFormatter: false } as const;
let restoreOffsetParent: (() => void) | undefined;
let restoreVirtualListSize: (() => void) | undefined;
const gridsManager = new TestGridsManager({
    modules: [
        ClientSideRowModelModule,
        CellSpanModule,
        InfiniteRowModelModule,
        ServerSideRowModelModule,
        ViewportRowModelModule,
        CalculatedColumnsModule,
        ClipboardModule,
        ColumnHeaderEditModule,
        ColumnMenuModule,
        ContextMenuModule,
        RowGroupingModule,
        TreeDataModule,
        NumberFilterModule,
        TextEditorModule,
        NumberEditorModule,
        RowSelectionModule,
        PivotModule,
        RowNumbersModule,
        HighlightChangesModule,
    ] as Module[],
});

export function createGrid(id: string, opts: Partial<GridOptions>) {
    const options: GridOptions = {
        getRowId: (params) => params.data?.id,
        calculatedColumns: true,
        ...opts,
    };
    return gridsManager.createGrid(id, options);
}

export function addCalculatedColumnDef(api: GridApi, colDef: ColDef): void {
    api.setGridOption('columnDefs', [...(api.getColumnDefs() ?? []), colDef]);
}

export function updateCalculatedColumnDef(api: GridApi, colId: string, colDefUpdate: ColDef): void {
    api.setGridOption('columnDefs', updateColumnDef(api.getColumnDefs() ?? [], colId, colDefUpdate));
}

export function removeColumnDef(api: GridApi, colId: string): void {
    api.setGridOption('columnDefs', removeColumnDefFromDefs(api.getColumnDefs() ?? [], colId));
}

/** How a colDef is identified in these suites, spelled once so the walks below cannot disagree. */
const defId = (colDef: ColDef): string | undefined => colDef.colId ?? colDef.field;

function updateColumnDef(
    columnDefs: (ColDef | ColGroupDef)[],
    colId: string,
    colDefUpdate: ColDef
): (ColDef | ColGroupDef)[] {
    return columnDefs.map((colDef) => {
        if ('children' in colDef) {
            return { ...colDef, children: updateColumnDef(colDef.children, colId, colDefUpdate) };
        }

        return defId(colDef) === colId ? { ...colDef, ...colDefUpdate } : colDef;
    });
}

function removeColumnDefFromDefs(columnDefs: (ColDef | ColGroupDef)[], colId: string): (ColDef | ColGroupDef)[] {
    const nextColumnDefs: (ColDef | ColGroupDef)[] = [];
    for (let i = 0, len = columnDefs.length; i < len; ++i) {
        const colDef = columnDefs[i];
        if ('children' in colDef) {
            nextColumnDefs.push({ ...colDef, children: removeColumnDefFromDefs(colDef.children, colId) });
        } else if (defId(colDef) !== colId) {
            nextColumnDefs.push(colDef);
        }
    }
    return nextColumnDefs;
}

function enableOffsetParentPolyfill(): void {
    restoreOffsetParent ??= polyfillOffsetParent();
}

/** Wraps whatever owns these descriptors now — `mockGridLayout`'s own getters, installed when this file's
 *  grid manager was constructed — so the captured pair must be put back in `afterEach`, not dropped. */
function enableVirtualListSizePolyfill(): void {
    if (restoreVirtualListSize) {
        return;
    }

    const originalOffsetHeight = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'offsetHeight');
    const originalClientHeight = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'clientHeight');
    const getVirtualListHeight = (element: HTMLElement): number | undefined => {
        if (
            !element.classList.contains('ag-virtual-list-viewport') &&
            !element.classList.contains('ag-virtual-list-container')
        ) {
            return undefined;
        }

        const styleHeight = Number.parseFloat(element.style.height);
        return Number.isFinite(styleHeight) && styleHeight > 0 ? styleHeight : 160;
    };

    Object.defineProperty(HTMLElement.prototype, 'offsetHeight', {
        configurable: true,
        get(this: HTMLElement) {
            return getVirtualListHeight(this) ?? originalOffsetHeight?.get?.call(this) ?? 0;
        },
    });
    Object.defineProperty(HTMLElement.prototype, 'clientHeight', {
        configurable: true,
        get(this: HTMLElement) {
            return getVirtualListHeight(this) ?? originalClientHeight?.get?.call(this) ?? 0;
        },
    });

    restoreVirtualListSize = () => {
        if (originalOffsetHeight) {
            Object.defineProperty(HTMLElement.prototype, 'offsetHeight', originalOffsetHeight);
        } else {
            delete (HTMLElement.prototype as any).offsetHeight;
        }
        if (originalClientHeight) {
            Object.defineProperty(HTMLElement.prototype, 'clientHeight', originalClientHeight);
        } else {
            delete (HTMLElement.prototype as any).clientHeight;
        }
    };
}

export function showColumnMenu(api: { showColumnMenu(colKey: string): void }, colKey: string): void {
    enableOffsetParentPolyfill();
    api.showColumnMenu(colKey);
}

export async function openEditDialogViaMenu(
    api: { showColumnMenu(colKey: string): void },
    colKey: string
): Promise<void> {
    showColumnMenu(api, colKey);
    await clickMenuOption('Edit Calculated Column');
}

export function getCalculatedColumnDialog(): HTMLElement {
    const dialog = document.querySelector<HTMLElement>('.ag-calculated-column-form');
    expect(dialog).toBeTruthy();
    return dialog!;
}

export function setExpression(expression: string): void {
    const input = getExpressionInput();
    input.value = expression;
    input.dispatchEvent(new Event('input', { bubbles: true }));
}

export function clickDialogButton(label: string): void {
    const button = getDialogButton(label);
    button.click();
}

export function getDialogButton(label: string): HTMLButtonElement {
    const button = Array.from(getCalculatedColumnDialog().querySelectorAll<HTMLButtonElement>('button')).find(
        (element) => element.textContent?.trim() === label
    );
    expect(button).toBeTruthy();
    return button!;
}

export async function selectDataType(label: string): Promise<void> {
    await openPicker(getCalculatedColumnDialog().querySelector('.ag-select')!);
    await clickSelectOption(label);
}

export function getSuggestionLabels(): string[] {
    return Array.from(document.querySelectorAll<HTMLElement>('.ag-autocomplete-row-label')).map(
        (element) => element.textContent?.trim() ?? ''
    );
}

// The suggestion list (AgAutocompleteList) selects by hover/keyboard, not by clicking a specific row.
const OPERATOR_ORDER = ['+', '-', '*', '/', '^', '&', '=', '<>', '>', '>=', '<', '<='];
export async function selectOperatorSuggestion(symbol: string): Promise<void> {
    const input = getExpressionInput();
    const index = OPERATOR_ORDER.indexOf(symbol);
    for (let i = 0; i < index; i++) {
        input.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
    }
    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
}

export function getOpenMenuEntries(): string[] {
    return Array.from(document.querySelectorAll<HTMLElement>('.ag-menu-option, .ag-menu-separator')).map((element) =>
        element.classList.contains('ag-menu-separator')
            ? 'separator'
            : (element.querySelector<HTMLElement>('.ag-menu-option-text')?.textContent?.trim() ?? '')
    );
}

export function getExpressionInput(): HTMLTextAreaElement {
    return getCalculatedColumnDialog().querySelector<HTMLTextAreaElement>('textarea')!;
}

// Polls until the first row has data. `modelUpdated` is unreliable across row models in
// happy-dom (Viewport may fire it before the listener is attached, or never trigger
// setViewportRange at all); polling on the actual row data is the one signal every row
// model exposes consistently.
export async function waitForFirstRow(api: { getDisplayedRowAtIndex(index: number): any }): Promise<void> {
    await waitFor(() => expect(api.getDisplayedRowAtIndex(0)?.data ?? null).not.toBeNull());
}

export function findColumnDef(columnDefs: (ColDef | ColGroupDef)[], colId: string): ColDef | undefined {
    for (const colDef of columnDefs) {
        if ('children' in colDef && colDef.children) {
            const child = findColumnDef(colDef.children, colId);
            if (child) {
                return child;
            }
            continue;
        }

        if (defId(colDef as ColDef) === colId) {
            return colDef as ColDef;
        }
    }

    return undefined;
}

export function findGroupDef(columnDefs: (ColDef | ColGroupDef)[], groupId: string): ColGroupDef | undefined {
    for (const colDef of columnDefs) {
        if (!('children' in colDef) || !colDef.children) {
            continue;
        }

        if (colDef.groupId === groupId) {
            return colDef;
        }

        const child = findGroupDef(colDef.children, groupId);
        if (child) {
            return child;
        }
    }

    return undefined;
}

/** Registers the hooks every sibling suite needs. */
export function setupCalculatedColumnsSuite(): void {
    beforeEach(() => {
        gridsManager.reset();
        enableVirtualListSizePolyfill();
    });

    afterEach(() => {
        vi.restoreAllMocks();
        gridsManager.reset();
        restoreOffsetParent?.();
        restoreOffsetParent = undefined;
        restoreVirtualListSize?.();
        restoreVirtualListSize = undefined;
    });
}
