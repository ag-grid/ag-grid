import { waitFor } from '@testing-library/dom';

import type { ColDef, ColGroupDef, GridApi, GridOptions, Module } from 'ag-grid-community';
import { ClientSideRowModelModule, NumberEditorModule, TextEditorModule, ValidationModule } from 'ag-grid-community';
import {
    CalculatedColumnsModule,
    ColumnMenuModule,
    ContextMenuModule,
    FormulaModule,
    RowGroupingModule,
    RowNumbersModule,
} from 'ag-grid-enterprise';

import { TestGridsManager, asyncSetTimeout } from '../test-utils';

// Behavioural spec for calculated-column DISPLAY ORDERING. The expectations below encode the
// documented behaviour (documentation/ag-grid-docs/src/content/docs/calculated-columns/index.mdoc),
// NOT whatever the current implementation happens to do — any divergence is a bug to surface.
//
// Documented ordering rules:
//   1. `api.addCalculatedColumn` appends to the end of the column tree (no position argument).
//   2. A column added from the header menu is placed AFTER the leaf column it was created from.
//   3. When that anchor is a generated visible column, e.g. the auto-group column, the calc col is
//      placed after that visible column.
//   4. When the anchor column is later removed, the dependent calc col falls back to the END.
//   5. `setColumnDefs` / `updateGridOptions({ columnDefs })` is a full reset: dynamic calc cols are
//      cleared.
//   6. Static calc cols declared in `columnDefs` keep their declared position (incl. chains/groups).
//   7. `getColumnDefs()` includes dynamic calc cols so they survive a round-trip.

describe('calculated columns - display ordering', () => {
    const gridsManager = new TestGridsManager({
        modules: [
            ClientSideRowModelModule,
            CalculatedColumnsModule,
            FormulaModule,
            ColumnMenuModule,
            ContextMenuModule,
            RowGroupingModule,
            RowNumbersModule,
            TextEditorModule,
            NumberEditorModule,
            ValidationModule,
        ] as Module[],
    });

    let restoreOffsetParent: (() => void) | undefined;

    beforeEach(() => {
        gridsManager.reset();
    });

    afterEach(() => {
        gridsManager.reset();
        restoreOffsetParent?.();
        restoreOffsetParent = undefined;
    });

    function createGrid(id: string, opts: Partial<GridOptions>): GridApi {
        return gridsManager.createGrid(id, { getRowId: (params) => params.data?.id, ...opts });
    }

    function order(api: GridApi): string[] {
        return api.getAllGridColumns()!.map((col) => col.getColId());
    }

    // --- dialog plumbing (the only public surface that sets an anchor) ---------------------------

    function enableOffsetParentPolyfill(): void {
        if (restoreOffsetParent) {
            return;
        }
        const original = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'offsetParent');
        Object.defineProperty(HTMLElement.prototype, 'offsetParent', {
            configurable: true,
            get(this: HTMLElement) {
                return this.parentElement;
            },
        });
        restoreOffsetParent = () => {
            if (original) {
                Object.defineProperty(HTMLElement.prototype, 'offsetParent', original);
            } else {
                delete (HTMLElement.prototype as any).offsetParent;
            }
        };
    }

    async function clickColumnMenuItem(name: string): Promise<void> {
        const menuItem = await waitFor(() => {
            const text = Array.from(document.querySelectorAll<HTMLElement>('.ag-menu-option-text')).find(
                (element) => element.textContent?.trim() === name
            );
            const element = text?.closest<HTMLElement>('.ag-menu-option');
            expect(element).toBeTruthy();
            return element!;
        });
        menuItem.click();
    }

    function getDialog(): HTMLElement {
        const dialog = document.querySelector<HTMLElement>('.ag-calculated-column-form');
        expect(dialog).toBeTruthy();
        return dialog!;
    }

    function setExpression(expression: string): void {
        const input = getDialog().querySelector<HTMLTextAreaElement>('textarea')!;
        input.value = expression;
        input.dispatchEvent(new Event('input', { bubbles: true }));
    }

    function clickDialogButton(label: string): void {
        const button = Array.from(getDialog().querySelectorAll<HTMLButtonElement>('button')).find(
            (element) => element.textContent?.trim() === label
        );
        expect(button).toBeTruthy();
        button!.click();
    }

    /** Adds a calc col through the header menu of {@link anchorColId} (the documented "anchor").
     *  Returns the auto-generated colId of the new column, discovered by diffing the column set. */
    async function addViaDialog(api: GridApi, anchorColId: string, expression: string): Promise<string> {
        const before = new Set(order(api));
        enableOffsetParentPolyfill();
        api.showColumnMenu(anchorColId);
        await asyncSetTimeout(10);
        await clickColumnMenuItem('Add Calculated Column');
        await asyncSetTimeout(1);
        setExpression(expression);
        clickDialogButton('Apply');
        await asyncSetTimeout(1);
        const added = order(api).filter((id) => !before.has(id));
        expect(added).toHaveLength(1);
        return added[0];
    }

    // === Rule 6: static calc cols keep their declared columnDefs position ========================

    test('static calc col keeps its declared position among regular columns', () => {
        const api = createGrid('static-position', {
            rowData: [{ id: 'r1', revenue: 10, cost: 3 }],
            columnDefs: [
                { field: 'revenue' },
                { colId: 'profit', calculatedExpression: '[revenue] - [cost]', cellDataType: 'number' },
                { field: 'cost' },
            ],
        });
        expect(order(api)).toEqual(['revenue', 'profit', 'cost']);
    });

    test('static calc col chain keeps declared order', () => {
        const api = createGrid('static-chain', {
            rowData: [{ id: 'r1', revenue: 10, cost: 3 }],
            columnDefs: [
                { field: 'revenue' },
                { field: 'cost' },
                { colId: 'profit', calculatedExpression: '[revenue] - [cost]', cellDataType: 'number' },
                { colId: 'margin', calculatedExpression: '[profit] / [revenue]', cellDataType: 'number' },
                { colId: 'status', calculatedExpression: 'IF([margin] >= 0.25, "Healthy", "Review")' },
            ],
        });
        expect(order(api)).toEqual(['revenue', 'cost', 'profit', 'margin', 'status']);
    });

    test('static calc col inside a column group keeps its position within the group', () => {
        const api = createGrid('static-in-group', {
            rowData: [{ id: 'r1', revenue: 10, cost: 3 }],
            columnDefs: [
                {
                    groupId: 'money',
                    children: [
                        { field: 'revenue' },
                        { colId: 'profit', calculatedExpression: '[revenue] - [cost]', cellDataType: 'number' },
                        { field: 'cost' },
                    ],
                } as ColGroupDef,
            ],
        });
        expect(order(api)).toEqual(['revenue', 'profit', 'cost']);
        // colId tree exposes the group membership at the declared position.
        const group = api
            .getColumnDefs()!
            .find((def): def is ColGroupDef => 'groupId' in def && def.groupId === 'money')!;
        expect(group.children.map((c) => ('children' in c ? c.groupId : c.colId))).toEqual([
            'revenue',
            'profit',
            'cost',
        ]);
    });

    // === Rule 1: api.addCalculatedColumn appends to the end ======================================

    test('addCalculatedColumn appends to the end of the tree', async () => {
        const api = createGrid('api-append', {
            rowData: [{ id: 'r1', revenue: 10, cost: 3 }],
            columnDefs: [{ field: 'revenue' }, { field: 'cost' }],
        });
        api.addCalculatedColumn({
            colId: 'profit',
            calculatedExpression: '[revenue] - [cost]',
            cellDataType: 'number',
        });
        await asyncSetTimeout(1);
        expect(order(api)).toEqual(['revenue', 'cost', 'profit']);
    });

    test('two addCalculatedColumn calls append in call order', async () => {
        const api = createGrid('api-append-two', {
            rowData: [{ id: 'r1', revenue: 10, cost: 3 }],
            columnDefs: [{ field: 'revenue' }, { field: 'cost' }],
        });
        api.addCalculatedColumn({
            colId: 'profit',
            calculatedExpression: '[revenue] - [cost]',
            cellDataType: 'number',
        });
        await asyncSetTimeout(1);
        api.addCalculatedColumn({
            colId: 'margin',
            calculatedExpression: '[profit] / [revenue]',
            cellDataType: 'number',
        });
        await asyncSetTimeout(1);
        expect(order(api)).toEqual(['revenue', 'cost', 'profit', 'margin']);
    });

    // Solved by AG-17366 when it is completed
    test.skip('addCalculatedColumn appends after a manual reorder, preserving the reorder', async () => {
        const api = createGrid('api-append-after-move', {
            rowData: [{ id: 'r1', a: 1, b: 2, c: 3 }],
            columnDefs: [{ field: 'a' }, { field: 'b' }, { field: 'c' }],
        });
        api.moveColumns(['c'], 0);
        expect(order(api)).toEqual(['c', 'a', 'b']);
        api.addCalculatedColumn({ colId: 'sum', calculatedExpression: '[a] + [b]', cellDataType: 'number' });
        await asyncSetTimeout(1);
        expect(order(api)).toEqual(['c', 'a', 'b', 'sum']);
    });

    // === Rule 2: dialog add lands immediately after the anchor leaf ==============================

    test('dialog add lands immediately after the anchor leaf column', async () => {
        const api = createGrid('dialog-after-anchor', {
            rowData: [{ id: 'r1', revenue: 10, cost: 3 }],
            columnDefs: [
                { field: 'revenue', headerName: 'Revenue' },
                { field: 'cost', headerName: 'Cost' },
            ],
        });
        const id = await addViaDialog(api, 'revenue', '[Revenue] - [Cost]');
        expect(order(api)).toEqual(['revenue', id, 'cost']);
    });

    test('dialog add lands after the anchor leaf column when maintainColumnOrder is enabled', async () => {
        const api = createGrid('dialog-after-anchor-maintain-order', {
            maintainColumnOrder: true,
            rowData: [{ id: 'r1', athlete: 'A', age: 23, country: 'US', total: 3 }],
            columnDefs: [
                { field: 'athlete', colId: 'athlete', headerName: 'Athlete' },
                { field: 'age', colId: 'age', headerName: 'Age' },
                { field: 'country', colId: 'country', headerName: 'Country' },
                { field: 'total', colId: 'total', headerName: 'Total' },
            ],
        });

        const id = await addViaDialog(api, 'athlete', '[Age] + [Total]');
        expect(order(api)).toEqual(['athlete', id, 'age', 'country', 'total']);
    });

    test('dialog add lands inside the group, after a grouped anchor leaf', async () => {
        const api = createGrid('dialog-after-anchor-group', {
            rowData: [{ id: 'r1', revenue: 10, cost: 3 }],
            columnDefs: [
                {
                    groupId: 'money',
                    children: [
                        { field: 'revenue', headerName: 'Revenue' },
                        { field: 'cost', headerName: 'Cost' },
                    ],
                } as ColGroupDef,
            ],
        });
        const id = await addViaDialog(api, 'revenue', '[Revenue] - [Cost]');
        expect(order(api)).toEqual(['revenue', id, 'cost']);
        const group = api
            .getColumnDefs()!
            .find((def): def is ColGroupDef => 'groupId' in def && def.groupId === 'money')!;
        expect(group.children.map((c) => ('children' in c ? c.groupId : c.colId))).toEqual(['revenue', id, 'cost']);
    });

    // Solved by AG-17366 when it is completed
    test.skip('removing an anchor preserves the user reorder and keeps the dependent in place', async () => {
        const api = createGrid('reorder-then-remove-anchor', {
            rowData: [{ id: 'r1', a: 1, b: 2, c: 3 }],
            columnDefs: [
                { field: 'a', headerName: 'A' },
                { field: 'b', headerName: 'B' },
                { field: 'c', headerName: 'C' },
            ],
        });
        const first = await addViaDialog(api, 'a', '[A] + [B]');
        const second = await addViaDialog(api, first, '[A] + [B]');
        expect(order(api)).toEqual(['a', first, second, 'b', 'c']);

        api.moveColumns(['c'], 0);
        expect(order(api)).toEqual(['c', 'a', first, second, 'b']);

        api.removeCalculatedColumn(first);
        await asyncSetTimeout(1);
        // Two things happen together: the orphaned `second` falls to the END (documented), AND the
        // user's manual reorder of the OTHER columns (c first) is preserved. NOTE: `latest` instead
        // resets everything to the provided colDef order (`['a', 'b', 'c', second]`), discarding the
        // reorder — a separate bug this branch fixes via the lastOrder snapshot.
        expect(order(api)).toEqual(['c', 'a', 'b', second]);
    });

    test('dialog add anchored on another calculated column chains after it', async () => {
        const api = createGrid('dialog-chain', {
            rowData: [{ id: 'r1', revenue: 10, cost: 3 }],
            columnDefs: [
                { field: 'revenue', headerName: 'Revenue' },
                { field: 'cost', headerName: 'Cost' },
            ],
        });
        const first = await addViaDialog(api, 'revenue', '[Revenue] - [Cost]');
        expect(order(api)).toEqual(['revenue', first, 'cost']);
        const second = await addViaDialog(api, first, '[Revenue] - [Cost]');
        // second is anchored on the first calc col, so it sits between first and cost.
        expect(order(api)).toEqual(['revenue', first, second, 'cost']);
    });

    test('dialog add anchored on a moved calculated column keeps the calculated column chain in place', async () => {
        const api = createGrid('dialog-chain-after-anchor-move', {
            rowData: [{ id: 'r1', revenue: 10, cost: 3 }],
            columnDefs: [
                { field: 'revenue', headerName: 'Revenue' },
                { field: 'cost', headerName: 'Cost' },
            ],
        });
        const first = await addViaDialog(api, 'revenue', '[Revenue] - [Cost]');
        expect(order(api)).toEqual(['revenue', first, 'cost']);

        api.moveColumns(['revenue'], 1);
        await asyncSetTimeout(1);
        expect(order(api)).toEqual([first, 'revenue', 'cost']);

        const second = await addViaDialog(api, first, '[Revenue] - [Cost]');
        expect(order(api)).toEqual([first, second, 'revenue', 'cost']);
    });

    test('two dialog adds on the same anchor: later add sits between the anchor and the earlier add', async () => {
        const api = createGrid('dialog-same-anchor', {
            rowData: [{ id: 'r1', revenue: 10, cost: 3 }],
            columnDefs: [
                { field: 'revenue', headerName: 'Revenue' },
                { field: 'cost', headerName: 'Cost' },
            ],
        });
        const first = await addViaDialog(api, 'revenue', '[Revenue] - [Cost]');
        expect(order(api)).toEqual(['revenue', first, 'cost']);
        const second = await addViaDialog(api, 'revenue', '[Revenue] - [Cost]');
        // Both are anchored on `revenue`; siblings sharing an anchor keep their creation order,
        // so the later add follows the earlier one (each appended to the anchor's chain).
        expect(order(api)).toEqual(['revenue', first, second, 'cost']);
    });

    // === Rule 3: generated visible column anchors use visible order =============================

    test('dialog add anchored on the auto-group column lands after the visible anchor', async () => {
        const api = createGrid('dialog-autogroup-anchor', {
            rowData: [
                { id: 'r1', region: 'EMEA', revenue: 10, cost: 3 },
                { id: 'r2', region: 'APAC', revenue: 20, cost: 8 },
            ],
            columnDefs: [
                { field: 'region', rowGroup: true, hide: true },
                { field: 'revenue', headerName: 'Revenue', aggFunc: 'sum' },
                { field: 'cost', headerName: 'Cost', aggFunc: 'sum' },
            ],
        });
        await asyncSetTimeout(1);
        // `getAllGridColumns` includes the hidden rowGroup `region` col.
        expect(order(api)).toEqual(['ag-Grid-AutoColumn', 'region', 'revenue', 'cost']);
        const id = await addViaDialog(api, 'ag-Grid-AutoColumn', '[Revenue] - [Cost]');
        expect(order(api)).toEqual(['ag-Grid-AutoColumn', id, 'region', 'revenue', 'cost']);
    });

    test('repeated dialog adds from the auto-group column stay next to the visible anchor', async () => {
        const api = createGrid('dialog-autogroup-anchor-repeat', {
            rowData: [{ id: 'r1', region: 'EMEA', revenue: 10, cost: 3 }],
            columnDefs: [
                { field: 'region', rowGroup: true, hide: true },
                { field: 'revenue', headerName: 'Revenue', aggFunc: 'sum' },
                { field: 'cost', headerName: 'Cost', aggFunc: 'sum' },
            ],
        });
        await asyncSetTimeout(1);

        const first = await addViaDialog(api, 'ag-Grid-AutoColumn', '[Revenue] - [Cost]');
        const second = await addViaDialog(api, 'ag-Grid-AutoColumn', '[Revenue] - [Cost]');

        expect(order(api)).toEqual(['ag-Grid-AutoColumn', second, first, 'region', 'revenue', 'cost']);
    });

    test('adding from a moved auto-group column preserves the moved auto-group position', async () => {
        const api = createGrid('dialog-autogroup-anchor-moved', {
            rowData: [{ id: 'r1', region: 'EMEA', revenue: 10, cost: 3 }],
            columnDefs: [
                { field: 'region', rowGroup: true, hide: true },
                { field: 'revenue', headerName: 'Revenue', aggFunc: 'sum' },
                { field: 'cost', headerName: 'Cost', aggFunc: 'sum' },
            ],
        });
        await asyncSetTimeout(1);

        const first = await addViaDialog(api, 'ag-Grid-AutoColumn', '[Revenue] - [Cost]');
        expect(order(api)).toEqual(['ag-Grid-AutoColumn', first, 'region', 'revenue', 'cost']);

        api.moveColumns(['ag-Grid-AutoColumn'], 1);
        await asyncSetTimeout(1);
        expect(order(api)).toEqual([first, 'ag-Grid-AutoColumn', 'region', 'revenue', 'cost']);

        const second = await addViaDialog(api, 'ag-Grid-AutoColumn', '[Revenue] - [Cost]');
        expect(order(api)).toEqual([first, 'ag-Grid-AutoColumn', second, 'region', 'revenue', 'cost']);
    });

    // === Rule 4: anchor removed — orphaned dependent falls back to the end =======================

    test('removing the anchor calc col pushes its orphaned dependent to the end', async () => {
        const api = createGrid('dialog-anchor-removed', {
            rowData: [{ id: 'r1', revenue: 10, cost: 3 }],
            columnDefs: [
                { field: 'revenue', headerName: 'Revenue' },
                { field: 'cost', headerName: 'Cost' },
            ],
        });
        const first = await addViaDialog(api, 'revenue', '[Revenue] - [Cost]');
        const second = await addViaDialog(api, first, '[Revenue] - [Cost]');
        expect(order(api)).toEqual(['revenue', first, second, 'cost']);

        api.removeCalculatedColumn(first);
        await asyncSetTimeout(1);
        // `first` is gone; `second` lost its anchor, so it falls back to the END of the tree
        // (documented behaviour).
        expect(order(api)).toEqual(['revenue', 'cost', second]);
    });

    // === removal preserves the order of the remaining columns ====================================

    test('removing a dynamic calc col leaves the remaining order intact', async () => {
        const api = createGrid('remove-dynamic', {
            rowData: [{ id: 'r1', revenue: 10, cost: 3 }],
            columnDefs: [{ field: 'revenue' }, { field: 'cost' }],
        });
        api.addCalculatedColumn({
            colId: 'profit',
            calculatedExpression: '[revenue] - [cost]',
            cellDataType: 'number',
        });
        await asyncSetTimeout(1);
        api.addCalculatedColumn({
            colId: 'margin',
            calculatedExpression: '[profit] / [revenue]',
            cellDataType: 'number',
        });
        await asyncSetTimeout(1);
        expect(order(api)).toEqual(['revenue', 'cost', 'profit', 'margin']);

        api.removeCalculatedColumn('profit');
        await asyncSetTimeout(1);
        expect(order(api)).toEqual(['revenue', 'cost', 'margin']);
    });

    test('removing a static calc col (suppression) leaves the remaining order intact', async () => {
        const api = createGrid('remove-static', {
            rowData: [{ id: 'r1', revenue: 10, cost: 3 }],
            columnDefs: [
                { field: 'revenue' },
                { colId: 'profit', calculatedExpression: '[revenue] - [cost]', cellDataType: 'number' },
                { field: 'cost' },
            ],
        });
        expect(order(api)).toEqual(['revenue', 'profit', 'cost']);
        api.removeCalculatedColumn('profit');
        await asyncSetTimeout(1);
        expect(order(api)).toEqual(['revenue', 'cost']);
    });

    // === Rule 5 + 7: reset on setColumnDefs, persistence via getColumnDefs =======================

    test('updateGridOptions({ columnDefs }) clears dynamic calc cols', async () => {
        const baseDefs: ColDef[] = [{ field: 'revenue' }, { field: 'cost' }];
        const api = createGrid('reset-clears', {
            rowData: [{ id: 'r1', revenue: 10, cost: 3 }],
            columnDefs: baseDefs,
        });
        api.addCalculatedColumn({
            colId: 'profit',
            calculatedExpression: '[revenue] - [cost]',
            cellDataType: 'number',
        });
        await asyncSetTimeout(1);
        expect(order(api)).toEqual(['revenue', 'cost', 'profit']);

        api.setGridOption('columnDefs', baseDefs.slice());
        await asyncSetTimeout(1);
        expect(order(api)).toEqual(['revenue', 'cost']);
    });

    test('getColumnDefs persists a dynamic calc col at its position into a fresh grid', async () => {
        const api = createGrid('roundtrip', {
            rowData: [{ id: 'r1', revenue: 10, cost: 3 }],
            columnDefs: [{ field: 'revenue' }, { field: 'cost' }],
        });
        api.addCalculatedColumn({
            colId: 'profit',
            calculatedExpression: '[revenue] - [cost]',
            cellDataType: 'number',
        });
        await asyncSetTimeout(1);
        expect(order(api)).toEqual(['revenue', 'cost', 'profit']);

        // Documented persistence pattern: read getColumnDefs() and seed a fresh grid with them.
        const persisted = api.getColumnDefs()!;
        const api2 = createGrid('roundtrip-restored', {
            rowData: [{ id: 'r1', revenue: 10, cost: 3 }],
            columnDefs: persisted,
        });
        await asyncSetTimeout(1);
        expect(order(api2)).toEqual(['revenue', 'cost', 'profit']);
    });

    // === service columns stay leftmost regardless of calc-col adds ===============================

    test('rowNumbers column stays first when a calc col is appended', async () => {
        const api = createGrid('rownumbers-first', {
            rowData: [{ id: 'r1', revenue: 10, cost: 3 }],
            columnDefs: [{ field: 'revenue' }, { field: 'cost' }],
            rowNumbers: true,
        });
        await asyncSetTimeout(1);
        api.addCalculatedColumn({
            colId: 'profit',
            calculatedExpression: '[revenue] - [cost]',
            cellDataType: 'number',
        });
        await asyncSetTimeout(1);
        const cols = order(api);
        expect(cols[0]).toBe('ag-Grid-RowNumbersColumn');
        expect(cols[cols.length - 1]).toBe('profit');
    });
});
