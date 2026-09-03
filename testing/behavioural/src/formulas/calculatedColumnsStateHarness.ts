// Shared setup for the calculated-columns grid-state suites: the dialog plumbing every one of them drives,
// and the grid manager. Siblings rather than one file because vitest parallelises across files but not within
// one, and these tests build two grids each to round-trip state.
import { waitFor } from '@testing-library/dom';
import {
    GridColumns,
    GridRows,
    TestGridsManager,
    asyncSetTimeout,
    clickMenuOption,
    clickSelectOption,
    openPicker,
} from 'ag-test-utils';

import type { GridApi, GridOptions, GridState, Module, UserColumnProperty } from 'ag-grid-community';
import {
    ClientSideRowModelModule,
    GridStateModule,
    NumberEditorModule,
    NumberFilterModule,
    TextEditorModule,
    TextFilterModule,
    ValidationModule,
} from 'ag-grid-community';
import {
    CalculatedColumnsModule,
    ColumnMenuModule,
    ContextMenuModule,
    FormulaModule,
    RowGroupingModule,
    RowNumbersModule,
} from 'ag-grid-enterprise';

// Behavioural spec for PERSISTING runtime-added (dynamic) calculated columns in grid state.
// A dynamic calc col is added via the header-menu dialog, so it is not present in `columnDefs`.
// The `GridState.userColumns` section is responsible for recreating it when state is restored
// (via `initialState` or `api.setState`) into a grid whose `columnDefs` do NOT declare the calc col.
const gridsManager = new TestGridsManager({
    modules: [
        ClientSideRowModelModule,
        GridStateModule,
        CalculatedColumnsModule,
        FormulaModule,
        ColumnMenuModule,
        ContextMenuModule,
        RowGroupingModule,
        RowNumbersModule,
        TextEditorModule,
        NumberEditorModule,
        TextFilterModule,
        NumberFilterModule,
        ValidationModule,
    ] as Module[],
});

export function createGrid(id: string, opts: Partial<GridOptions>): GridApi {
    return gridsManager.createGrid(id, {
        getRowId: (params) => params.data?.id,
        calculatedColumns: true,
        ...opts,
    });
}

export function order(api: GridApi): string[] {
    return api.getAllGridColumns()!.map((col) => col.getColId());
}

/** A `userColumns` entry's properties as an object — the array is a list, so its order is an
 *  implementation detail no assertion should depend on. */
export function propertiesOf(state: GridState, colId: string): Record<string, unknown> | undefined {
    const entry = state.userColumns?.find((userColumn) => userColumn.colId === colId);
    if (!entry?.properties) {
        return undefined;
    }
    return Object.fromEntries(entry.properties.map(({ property, value }) => [property, value]));
}

export function entryOf(state: GridState, colId: string): NonNullable<GridState['userColumns']>[number] {
    const entry = state.userColumns?.find((userColumn) => userColumn.colId === colId);
    expect(entry).toBeTruthy();
    return entry!;
}

// --- dialog plumbing (the only public surface that sets an anchor) ---------------------------
export function getDialog(): HTMLElement {
    // Live-apply dialogs stay open after Apply, so target the most recently opened one.
    const dialogs = document.querySelectorAll<HTMLElement>('.ag-calculated-column-form');
    expect(dialogs.length).toBeGreaterThan(0);
    return dialogs[dialogs.length - 1];
}

export function setExpression(expression: string): void {
    const input = getDialog().querySelector<HTMLTextAreaElement>('textarea')!;
    input.value = expression;
    input.dispatchEvent(new Event('input', { bubbles: true }));
}

export function setTitle(title: string): void {
    const input = getDialog().querySelector<HTMLInputElement>('input');
    expect(input).toBeTruthy();
    input!.value = title;
    input!.dispatchEvent(new Event('input', { bubbles: true }));
}

export async function selectDataType(label: string): Promise<void> {
    await openPicker(getDialog().querySelector('.ag-select')!);
    await clickSelectOption(label);
}

export function clickDialogButton(label: string): void {
    const button = Array.from(getDialog().querySelectorAll<HTMLButtonElement>('button')).find(
        (element) => element.textContent?.trim() === label
    );
    expect(button).toBeTruthy();
    button!.click();
}

/** Adds a calc col through the header menu of {@link anchorColId} (the documented "anchor").
 *  Returns the auto-generated colId of the new column, discovered by diffing the column set. */
export async function addViaDialog(api: GridApi, anchorColId: string, expression: string): Promise<string> {
    const before = new Set(order(api));
    api.showColumnMenu(anchorColId);
    await clickMenuOption('Add Calculated Column');
    await waitFor(() => getDialog());
    setExpression(expression);
    clickDialogButton('Apply');
    // Under the default 'live' mode, "Add" creates the column up front (with an empty expression)
    // and opens the dialog over it, so the new colId is in `order()` immediately — before the
    // rAF-coalesced live-apply flush (`scheduleLiveApplyUpdate`) commits the typed expression. Poll
    // for the expression itself landing, not just the column's presence.
    const added = await waitFor(() => {
        const result = order(api).filter((id) => !before.has(id));
        expect(result).toHaveLength(1);
        expect(api.getColumn(result[0])!.getColDef().calculatedExpression).toBeTruthy();
        return result;
    });
    return added[0];
}

/** Edits an existing calc col through its header menu, under the default 'live' apply mode. */
export async function editViaDialog(
    api: GridApi,
    colId: string,
    edits: { expression?: string; title?: string }
): Promise<void> {
    api.showColumnMenu(colId);
    await clickMenuOption('Edit Calculated Column');
    await waitFor(() => getDialog());
    // Only an actual edit schedules a live-apply flush (a no-op Apply, as used to merely open the
    // dialog, never fires the draft-change listener), so only then is there a flush to wait for.
    const willChange = edits.title !== undefined || edits.expression !== undefined;
    const colDefBefore = willChange ? api.getColumn(colId)!.getColDef() : undefined;
    if (edits.title !== undefined) {
        setTitle(edits.title);
    }
    if (edits.expression !== undefined) {
        setExpression(edits.expression);
    }
    clickDialogButton('Apply');
    if (willChange) {
        await waitFor(() => expect(api.getColumn(colId)!.getColDef()).not.toBe(colDefBefore));
    }
}

/** Removes a dynamic calc col through its header menu — dynamic calc cols are not in `columnDefs`,
 *  so the menu's "Remove Calculated Column" action is the only way a user can drop one. */
export async function removeViaMenu(api: GridApi, colId: string): Promise<void> {
    api.showColumnMenu(colId);
    await clickMenuOption('Remove Calculated Column');
    await waitFor(() => expect(api.getColumn(colId)).toBeNull());
}

// === columnDefs-declared calc cols: user edits and deletions are the state's to keep ==========
// These calc cols are created by `columnDefs`, so `userColumns` carries only what the user changed
// about them (`kind: 'calculatedOverride'`) — never the column itself. State stays authoritative:
// a listed entry re-applies the change, an absent one reverts to the declared definition.
export const STATIC_ROW_DATA = [{ id: 'r1', a: 10, b: 3 }];

export const staticColumnDefs = (): GridOptions['columnDefs'] => [
    { field: 'a' },
    { field: 'b' },
    { colId: 'declared', headerName: 'Declared', calculatedExpression: '[a] + [b]' },
];

export function cellValue(api: GridApi, colKey: string): unknown {
    return api.getCellValue({ colKey, rowNode: api.getRowNode('r1')! });
}

// === the layer only accepts what the owning UI can produce ===================================
/** State properties as they arrive from outside the type system, which `UserColumnProperty` refuses at
 *  compile time: a stored JSON payload, or `initialState` hand-authored in plain JavaScript. */
export const UNTYPED_PROPERTIES = (properties: { property: string; value: unknown }[]): UserColumnProperty[] =>
    properties as UserColumnProperty[];

// === created / restored parity ==============================================================
// A restored calc col is rebuilt from `userColumns` rather than from the dialog bookkeeping that
// produced it, so every behaviour has two constructions to keep honest. Each behaviour below runs
// against a freshly created col and then against the same col recreated in a new grid from the
// state of a destroyed one, and both runs must leave the grid in the same observable place.
/** Exercises `check` on a calc col the dialog just created, then on the same col recreated from the
 *  saved state of a destroyed grid, asserting both runs end in an identical column and row layout.
 *  The state is captured before `check` runs, so the restored col starts where the created one did. */
async function checkCreatedAndRestored(
    id: string,
    anchorColId: string,
    check: (api: GridApi, calcId: string) => Promise<void>
): Promise<{ api: GridApi; calcId: string }> {
    const rowData = [
        { id: 'r1', athlete: 'A', age: 20, gold: 3, silver: 1 },
        { id: 'r2', athlete: 'B', age: 30, gold: 1, silver: 2 },
    ];
    const columnDefs: GridOptions['columnDefs'] = [
        { field: 'athlete' },
        { field: 'age' },
        { headerName: 'Medals', groupId: 'medals', children: [{ field: 'gold' }, { field: 'silver' }] },
    ];
    // `makeDiagram(true)` annotates structural errors, so a restored col that renders wrongly differs from
    // the created one in the compared text rather than passing quietly.
    const layoutOf = (api: GridApi, label: string) => ({
        columns: new GridColumns(api, label).makeDiagram(true),
        rows: new GridRows(api, label).makeDiagram(true),
    });

    const created = createGrid(`${id}-created`, { rowData, columnDefs });
    const calcId = await addViaDialog(created, anchorColId, '[age] * 2');
    const savedState = created.getState();
    await check(created, calcId);
    const createdLayout = layoutOf(created, `${id} created`);
    created.destroy();

    const restored = createGrid(`${id}-restored`, { rowData, columnDefs, initialState: savedState });
    await waitFor(() => expect(restored.getColumn(calcId)).not.toBeNull());
    await check(restored, calcId);
    expect(layoutOf(restored, `${id} restored`)).toEqual(createdLayout);
    return { api: restored, calcId };
}

/**
 * The created/restored parity matrix, run once per anchor placement. A top-level leaf and a grouped col
 * take different restore paths - only a grouped col has a `parentGroupId` to resolve its anchor from - so
 * each placement gets its own file, and the file supplies nothing but the anchor.
 */
export function describeCreatedRestoredParity(placement: string, anchorColId: string): void {
    describe(`created/restored parity - a calc col ${placement}`, () => {
        test('renaming it in the dialog updates the header in place', async () => {
            const { api, calcId } = await checkCreatedAndRestored(
                `parity-rename-${anchorColId}`,
                anchorColId,
                async (gridApi, colId) => {
                    await editViaDialog(gridApi, colId, { title: 'Renamed' });
                }
            );
            expect(api.getColumn(calcId)!.getColDef().headerName).toBe('Renamed');
        });

        test('editing its expression recalculates its values', async () => {
            const { api, calcId } = await checkCreatedAndRestored(
                `parity-expression-${anchorColId}`,
                anchorColId,
                async (gridApi, colId) => {
                    await editViaDialog(gridApi, colId, { expression: '[age] * 3' });
                }
            );
            expect(api.getCellValue({ rowNode: api.getDisplayedRowAtIndex(0)!, colKey: calcId })).toBe(60);
        });

        test('changing its data type in the dialog retypes it', async () => {
            const { api, calcId } = await checkCreatedAndRestored(
                `parity-datatype-${anchorColId}`,
                anchorColId,
                async (gridApi, colId) => {
                    await editViaDialog(gridApi, colId, {});
                    await selectDataType('Number');
                    clickDialogButton('Apply');
                    await waitFor(() => expect(gridApi.getColumn(colId)!.getColDef().cellDataType).toBe('number'));
                }
            );
            expect(api.getCellValue({ rowNode: api.getDisplayedRowAtIndex(0)!, colKey: calcId })).toBe(40);
        });

        test('a later dialog edit leaves it where it was moved to', async () => {
            await checkCreatedAndRestored(`parity-moved-${anchorColId}`, anchorColId, async (gridApi, colId) => {
                gridApi.moveColumns([colId], 0);
                await asyncSetTimeout(0);
                await editViaDialog(gridApi, colId, { title: 'Moved' });
            });
        });

        test('a later dialog edit leaves it pinned', async () => {
            const { api, calcId } = await checkCreatedAndRestored(
                `parity-pinned-${anchorColId}`,
                anchorColId,
                async (gridApi, colId) => {
                    gridApi.setColumnsPinned([colId], 'left');
                    await asyncSetTimeout(0);
                    await editViaDialog(gridApi, colId, { title: 'Pinned' });
                }
            );
            expect(api.getColumn(calcId)!.getPinned()).toBe('left');
        });

        // Hiding drops the col from the header, so it is re-shown before the dialog edit — the point
        // is that the round trip through hidden leaves an editable col in its original place.
        test('a dialog edit after it is hidden and re-shown leaves it in place', async () => {
            const { api, calcId } = await checkCreatedAndRestored(
                `parity-hidden-${anchorColId}`,
                anchorColId,
                async (gridApi, colId) => {
                    gridApi.setColumnsVisible([colId], false);
                    await asyncSetTimeout(0);
                    gridApi.setColumnsVisible([colId], true);
                    await asyncSetTimeout(0);
                    await editViaDialog(gridApi, colId, { title: 'Reshown' });
                }
            );
            expect(api.getColumn(calcId)!.isVisible()).toBe(true);
        });

        test('sorting on it orders the rows by its values', async () => {
            await checkCreatedAndRestored(`parity-sort-${anchorColId}`, anchorColId, async (gridApi, colId) => {
                gridApi.applyColumnState({ state: [{ colId, sort: 'desc' }] });
                await asyncSetTimeout(0);
            });
        });

        test('removing it through its header menu drops it and its state entry', async () => {
            const { api, calcId } = await checkCreatedAndRestored(
                `parity-removed-${anchorColId}`,
                anchorColId,
                async (gridApi, colId) => {
                    await removeViaMenu(gridApi, colId);
                }
            );
            expect(api.getColumn(calcId)).toBeNull();
            expect(api.getState().userColumns).toBeUndefined();
        });

        test('a second calc col can be chained onto it', async () => {
            const { api } = await checkCreatedAndRestored(
                `parity-chained-${anchorColId}`,
                anchorColId,
                async (gridApi, colId) => {
                    await addViaDialog(gridApi, colId, `[${colId}] + 1`);
                }
            );
            expect(api.getCellValue({ rowNode: api.getDisplayedRowAtIndex(0)!, colKey: 'calculated_2' })).toBe(41);
        });
    });
}

/** Registers the hooks every sibling suite needs. */
export function setupCalculatedColumnsStateSuite(): void {
    beforeEach(() => {
        gridsManager.reset();
    });
    afterEach(() => {
        gridsManager.reset();
    });
}
