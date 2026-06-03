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

import { GridColumns, GridRows, TestGridsManager, asyncSetTimeout } from '../test-utils';

// Behavioural spec for calculated-column DISPLAY ORDERING. The expectations encode the intended
// behaviour of this branch's column model. Rules 3 and 4 intentionally diverge from the stale
// `index.mdoc` wording ("falls back to the end"); the canonical docs rewrite will reconcile them.
//
// Ordering rules:
//   1. `api.addCalculatedColumn` appends to the end of the column tree (no position argument).
//   2. A column added from the header menu is placed AFTER the leaf column it was created from.
//   3. When that anchor is a generated visible column, e.g. the auto-group column, the calc col is
//      placed after that visible column.
//   4. When the anchor column is later removed, the dependent calc col keeps its displayed position
//      (order maintained) — only the removed column goes.
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

    test('static calc col keeps its declared position among regular columns', async () => {
        const api = createGrid('static-position', {
            rowData: [{ id: 'r1', revenue: 10, cost: 3 }],
            columnDefs: [
                { field: 'revenue' },
                { colId: 'profit', calculatedExpression: '[revenue] - [cost]', cellDataType: 'number' },
                { field: 'cost' },
            ],
        });
        expect(order(api)).toEqual(['revenue', 'profit', 'cost']);
        await new GridColumns(api, 'static calc col keeps its declared position among regular columns').checkColumns(`
            CENTER
            ├── revenue "Revenue" width:200
            ├── profit width:200
            └── cost "Cost" width:200
        `);
    });

    test('static calc col chain keeps declared order', async () => {
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
        await new GridColumns(api, 'static calc col chain keeps declared order').checkColumns(`
            CENTER
            ├── revenue "Revenue" width:200
            ├── cost "Cost" width:200
            ├── profit width:200
            ├── margin width:200
            └── status width:200
        `);
    });

    test('static calc col inside a column group keeps its position within the group', async () => {
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
        await new GridColumns(api, 'static calc col inside a column group keeps its position within the group')
            .checkColumns(`
                CENTER
                └─┬ GROUP
                  ├── revenue "Revenue" width:200
                  ├── profit width:200
                  └── cost "Cost" width:200
            `);
    });

    test('removing a group’s sole static calc child prunes the now-empty group', async () => {
        const api = createGrid('sole-child-group', {
            rowData: [{ id: 'r1', revenue: 10, cost: 3 }],
            columnDefs: [
                { field: 'revenue' },
                {
                    groupId: 'derived',
                    headerName: 'Derived',
                    children: [{ colId: 'profit', calculatedExpression: '[revenue] - [cost]', cellDataType: 'number' }],
                } as ColGroupDef,
                { field: 'cost' },
            ],
        });
        expect(order(api)).toEqual(['revenue', 'profit', 'cost']);

        api.removeCalculatedColumn('profit');
        await asyncSetTimeout(1);

        // The group's only child is gone — the group must be pruned, not left empty in the colId tree.
        expect(order(api)).toEqual(['revenue', 'cost']);
        expect(api.getColumnDefs()!.some((d) => 'groupId' in d && d.groupId === 'derived')).toBe(false);
        await new GridColumns(api, 'group pruned after its sole static calc child is removed').checkColumns(`
            CENTER
            ├── revenue "Revenue" width:200
            └── cost "Cost" width:200
        `);
        await new GridRows(api, 'rows after pruning the derived group').check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:r1 revenue:10 cost:3
        `);
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
        await new GridColumns(api, 'addCalculatedColumn appends to the end of the tree').checkColumns(`
            CENTER
            ├── revenue "Revenue" width:200
            ├── cost "Cost" width:200
            └── profit width:200
        `);
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
        await new GridColumns(api, 'two addCalculatedColumn calls append in call order').checkColumns(`
            CENTER
            ├── revenue "Revenue" width:200
            ├── cost "Cost" width:200
            ├── profit width:200
            └── margin width:200
        `);
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
        await new GridColumns(api, 'addCalculatedColumn appends after a manual reorder, preserving the reorder')
            .checkColumns(`
                CENTER
                ├── c "C" width:200
                ├── a "A" width:200
                ├── b "B" width:200
                └── sum width:200
            `);
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
        await new GridColumns(api, 'dialog add lands immediately after the anchor leaf column').checkColumns(`
            CENTER
            ├── revenue "Revenue" width:200
            ├── calculated_1 "New title" width:200
            └── cost "Cost" width:200
        `);
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
        await new GridColumns(api, 'dialog add lands inside the group, after a grouped anchor leaf').checkColumns(`
            CENTER
            └─┬ GROUP
              ├── revenue "Revenue" width:200
              ├── calculated_1 "New title" width:200
              └── cost "Cost" width:200
        `);
    });

    test('dialog add inherits open columnGroupShow from the anchor leaf column', async () => {
        const api = createGrid('dialog-after-anchor-group-show-open', {
            rowData: [{ id: 'r1', revenue: 10, cost: 3, forecast: 4 }],
            columnDefs: [
                {
                    groupId: 'money',
                    openByDefault: true,
                    children: [
                        { field: 'revenue', headerName: 'Revenue', columnGroupShow: 'open' },
                        { field: 'forecast', headerName: 'Forecast', columnGroupShow: 'closed' },
                        { field: 'cost', headerName: 'Cost' },
                    ],
                } as ColGroupDef,
            ],
        });
        const openId = await addViaDialog(api, 'revenue', '[Revenue] - [Cost]');
        const group = api
            .getColumnDefs()!
            .find((def): def is ColGroupDef => 'groupId' in def && def.groupId === 'money')!;
        const openCalculatedColDef = group.children.find(
            (def): def is ColDef => !('children' in def) && def.colId === openId
        );

        expect(openCalculatedColDef?.columnGroupShow).toBe('open');
    });

    test('dialog add preserves expanded state for generated-id column groups', async () => {
        const api = createGrid('dialog-after-open-anchor-preserves-generated-group-expanded-state', {
            rowData: [{ id: 'r1', product: 'Panel', revenue: 10, cost: 3, forecast: 4 }],
            columnDefs: [
                {
                    headerName: 'Money',
                    children: [
                        { field: 'product', headerName: 'Product' },
                        { field: 'revenue', headerName: 'Revenue', columnGroupShow: 'open' },
                        { field: 'forecast', headerName: 'Forecast', columnGroupShow: 'closed' },
                        { field: 'cost', headerName: 'Cost' },
                    ],
                } as ColGroupDef,
            ],
        });
        const groupId = api.getColumnGroupState()[0].groupId;

        expect(api.getAllDisplayedColumns().map((column) => column.getColId())).toEqual([
            'product',
            'forecast',
            'cost',
        ]);

        api.setColumnGroupState([{ groupId, open: true }]);
        expect(api.getColumnGroupState()[0].open).toBe(true);
        expect(api.getAllDisplayedColumns().map((column) => column.getColId())).toEqual(['product', 'revenue', 'cost']);

        const openId = await addViaDialog(api, 'revenue', '[Revenue] - [Cost]');

        expect(api.getColumnGroupState()[0].open).toBe(true);
        expect(api.getAllDisplayedColumns().map((column) => column.getColId())).toEqual([
            'product',
            'revenue',
            openId,
            'cost',
        ]);
    });

    test('dialog add inherits closed columnGroupShow from the anchor leaf column', async () => {
        const api = createGrid('dialog-after-anchor-group-show-closed', {
            rowData: [{ id: 'r1', revenue: 10, cost: 3, forecast: 4 }],
            columnDefs: [
                {
                    groupId: 'money',
                    children: [
                        { field: 'revenue', headerName: 'Revenue', columnGroupShow: 'open' },
                        { field: 'forecast', headerName: 'Forecast', columnGroupShow: 'closed' },
                        { field: 'cost', headerName: 'Cost' },
                    ],
                } as ColGroupDef,
            ],
        });
        const closedId = await addViaDialog(api, 'forecast', '[Forecast] - [Cost]');
        const group = api
            .getColumnDefs()!
            .find((def): def is ColGroupDef => 'groupId' in def && def.groupId === 'money')!;
        const closedCalculatedColDef = group.children.find(
            (def): def is ColDef => !('children' in def) && def.colId === closedId
        );

        expect(closedCalculatedColDef?.columnGroupShow).toBe('closed');
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
        expect(order(api)).toEqual(['c', 'a', second, 'b']);
        await new GridColumns(api, 'removing an anchor preserves the user reorder and keeps the dependent in place')
            .checkColumns(`
                CENTER
                ├── c "C" width:200
                ├── a "A" width:200
                ├── calculated_2 "New title" width:200
                └── b "B" width:200
            `);
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
        await new GridColumns(api, 'dialog add anchored on another calculated column chains after it').checkColumns(`
            CENTER
            ├── revenue "Revenue" width:200
            ├── calculated_1 "New title" width:200
            ├── calculated_2 "New title" width:200
            └── cost "Cost" width:200
        `);
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
        // `second` chains after `first` (its anchor), and the user's move of `revenue` is preserved.
        expect(order(api)).toEqual([first, second, 'revenue', 'cost']);
        await new GridColumns(api, 'chain after anchor move').checkColumns(`
            CENTER
            ├── calculated_1 "New title" width:200
            ├── calculated_2 "New title" width:200
            ├── revenue "Revenue" width:200
            └── cost "Cost" width:200
        `);
    });

    // Solved by AG-17366 when it is completed
    test.skip('two dialog adds on the same anchor: later add sits between the anchor and the earlier add', async () => {
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
        // Both anchored on `revenue`; each new add seats immediately after the anchor, so same-anchor
        // adds stack newest-first — the later add sits between the anchor and the earlier add.
        expect(order(api)).toEqual(['revenue', second, first, 'cost']);
        await new GridColumns(
            api,
            'two dialog adds on the same anchor: later add sits between the anchor and the earlier add'
        ).checkColumns(`
            CENTER
            ├── revenue "Revenue" width:200
            ├── calculated_2 "New title" width:200
            ├── calculated_1 "New title" width:200
            └── cost "Cost" width:200
        `);
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
        // The auto-group col isn't a leaf in the column tree, so the calc col is re-seated after it
        // in display order (via the anchor pass) rather than falling to the end.
        expect(order(api)).toEqual(['ag-Grid-AutoColumn', id, 'region', 'revenue', 'cost']);
        await new GridColumns(api, 'calc after auto-group anchor').checkColumns(`
            CENTER
            ├── ag-Grid-AutoColumn "Group" width:200
            ├── calculated_1 "New title" width:200
            ├── revenue "Revenue" width:200 aggFunc:sum
            └── cost "Cost" width:200 aggFunc:sum
        `);
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
        // Same anchor → newest-first: each new add seats immediately after the auto-group col.
        expect(order(api)).toEqual(['ag-Grid-AutoColumn', second, first, 'region', 'revenue', 'cost']);
        await new GridColumns(api, 'repeated calc adds from auto-group anchor').checkColumns(`
            CENTER
            ├── ag-Grid-AutoColumn "Group" width:200
            ├── calculated_2 "New title" width:200
            ├── calculated_1 "New title" width:200
            ├── revenue "Revenue" width:200 aggFunc:sum
            └── cost "Cost" width:200 aggFunc:sum
        `);
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
        // `first` stays at its moved position (preserved); `second` seats after the moved auto col.
        expect(order(api)).toEqual([first, 'ag-Grid-AutoColumn', second, 'region', 'revenue', 'cost']);
        await new GridColumns(api, 'add from moved auto-group anchor').checkColumns(`
            CENTER
            ├── calculated_1 "New title" width:200
            ├── ag-Grid-AutoColumn "Group" width:200
            ├── calculated_2 "New title" width:200
            ├── revenue "Revenue" width:200 aggFunc:sum
            └── cost "Cost" width:200 aggFunc:sum
        `);
    });

    test('a moved calc column survives a structural change (grouping) and a reorder of other columns', async () => {
        const api = createGrid('move-calc-then-structural-change', {
            rowData: [{ id: 'r1', region: 'EMEA', revenue: 10, cost: 3, qty: 2 }],
            columnDefs: [
                { field: 'region' },
                { field: 'revenue', headerName: 'Revenue' },
                { field: 'cost', headerName: 'Cost' },
                { field: 'qty' },
            ],
        });
        const calc = await addViaDialog(api, 'revenue', '[Revenue] - [Cost]');
        expect(order(api)).toEqual(['region', 'revenue', calc, 'cost', 'qty']);

        // User reorders: move the calc col to the end, and a normal col to the front.
        api.moveColumns([calc], 4);
        await asyncSetTimeout(1);
        api.moveColumns(['qty'], 0);
        await asyncSetTimeout(1);
        expect(order(api)).toEqual(['qty', 'region', 'revenue', 'cost', calc]);

        // Structural change: activate row grouping (auto-group col appears, region hides). The user's
        // reorder — calc col last, qty first — is preserved; the new auto col slots in at the head.
        api.applyColumnState({ state: [{ colId: 'region', rowGroup: true, hide: true }] });
        await asyncSetTimeout(1);
        expect(order(api)).toEqual(['ag-Grid-AutoColumn', 'qty', 'region', 'revenue', 'cost', calc]);
        await new GridColumns(api, 'moved calc col survives grouping + reorder').checkColumns(`
            CENTER
            ├── ag-Grid-AutoColumn "Group" width:200
            ├── qty "Qty" width:200
            ├── revenue "Revenue" width:200
            ├── cost "Cost" width:200
            └── calculated_1 "New title" width:200
        `);
    });

    test('a moved calc column with maintainColumnOrder survives a recreateColumnDefs', async () => {
        const api = createGrid('move-calc-maintain-order', {
            maintainColumnOrder: true,
            rowData: [{ id: 'r1', revenue: 10, cost: 3, qty: 2 }],
            columnDefs: [
                { field: 'revenue', headerName: 'Revenue' },
                { field: 'cost', headerName: 'Cost' },
                { field: 'qty' },
            ],
        });
        const calc = await addViaDialog(api, 'revenue', '[Revenue] - [Cost]');
        api.moveColumns([calc], 3);
        await asyncSetTimeout(1);
        expect(order(api)).toEqual(['revenue', 'cost', 'qty', calc]);

        // A recreateColumnDefs-style refresh (defaultColDef change). With maintainColumnOrder the moved
        // calc col is preserved exactly like a normal column.
        api.setGridOption('defaultColDef', { resizable: false });
        await asyncSetTimeout(1);
        expect(order(api)).toEqual(['revenue', 'cost', 'qty', calc]);
        await new GridColumns(api, 'moved calc col preserved with maintainColumnOrder').checkColumns(`
            CENTER
            ├── revenue "Revenue" width:200 !resizable
            ├── cost "Cost" width:200 !resizable
            ├── qty "Qty" width:200 !resizable
            └── calculated_1 "New title" width:200 !resizable
        `);
    });

    // === mid-list calc cols stay put (not at the end, never user-moved) ==========================

    test('a mid-list calc column stays in place across dynamic refreshes without being moved', async () => {
        const api = createGrid('mid-calc-dynamic-refresh', {
            rowData: [{ id: 'r1', a: 1, revenue: 10, cost: 3, b: 4 }],
            columnDefs: [
                { field: 'a' },
                { field: 'revenue', headerName: 'Revenue' },
                { field: 'cost', headerName: 'Cost' },
                { field: 'b' },
            ],
        });
        const calc = await addViaDialog(api, 'revenue', '[Revenue] - [Cost]');
        expect(order(api)).toEqual(['a', 'revenue', calc, 'cost', 'b']);

        // Dynamic refreshes that don't touch the calc col: sort one column, hide+show another.
        api.applyColumnState({ state: [{ colId: 'a', sort: 'asc' }] });
        await asyncSetTimeout(1);
        api.setColumnsVisible(['b'], false);
        await asyncSetTimeout(1);
        api.setColumnsVisible(['b'], true);
        await asyncSetTimeout(1);
        // Stays exactly where its anchor placed it — mid-list, never at the end.
        expect(order(api)).toEqual(['a', 'revenue', calc, 'cost', 'b']);
        await new GridColumns(api, 'mid-list calc stays across dynamic refreshes').checkColumns(`
            CENTER
            ├── a "A" width:200 sort:asc
            ├── revenue "Revenue" width:200
            ├── calculated_1 "New title" width:200
            ├── cost "Cost" width:200
            └── b "B" width:200
        `);
    });

    test('a mid-list calc column with maintainColumnOrder stays in place across a recreateColumnDefs', async () => {
        const api = createGrid('mid-calc-maintain-order', {
            maintainColumnOrder: true,
            rowData: [{ id: 'r1', revenue: 10, cost: 3, qty: 2 }],
            columnDefs: [
                { field: 'revenue', headerName: 'Revenue' },
                { field: 'cost', headerName: 'Cost' },
                { field: 'qty' },
            ],
        });
        const calc = await addViaDialog(api, 'revenue', '[Revenue] - [Cost]');
        expect(order(api)).toEqual(['revenue', calc, 'cost', 'qty']);

        // recreateColumnDefs-style refresh (defaultColDef change); calc not moved → stays mid-list.
        api.setGridOption('defaultColDef', { resizable: false });
        await asyncSetTimeout(1);
        expect(order(api)).toEqual(['revenue', calc, 'cost', 'qty']);
        await new GridColumns(api, 'mid-list calc preserved with maintainColumnOrder').checkColumns(`
            CENTER
            ├── revenue "Revenue" width:200 !resizable
            ├── calculated_1 "New title" width:200 !resizable
            ├── cost "Cost" width:200 !resizable
            └── qty "Qty" width:200 !resizable
        `);
    });

    test('a mid-list calc column stays after its anchor when grouping is activated', async () => {
        const api = createGrid('mid-calc-grouping', {
            rowData: [{ id: 'r1', region: 'EMEA', revenue: 10, cost: 3 }],
            columnDefs: [
                { field: 'region' },
                { field: 'revenue', headerName: 'Revenue' },
                { field: 'cost', headerName: 'Cost' },
            ],
        });
        const calc = await addViaDialog(api, 'revenue', '[Revenue] - [Cost]');
        expect(order(api)).toEqual(['region', 'revenue', calc, 'cost']);

        // Activate grouping on region (auto col appears, region hides). The calc col is not moved and
        // stays right after its `revenue` anchor.
        api.applyColumnState({ state: [{ colId: 'region', rowGroup: true, hide: true }] });
        await asyncSetTimeout(1);
        expect(order(api)).toEqual(['ag-Grid-AutoColumn', 'region', 'revenue', calc, 'cost']);
        await new GridColumns(api, 'mid-list calc stays after anchor on grouping').checkColumns(`
            CENTER
            ├── ag-Grid-AutoColumn "Group" width:200
            ├── revenue "Revenue" width:200
            ├── calculated_1 "New title" width:200
            └── cost "Cost" width:200
        `);
    });

    // === Rule 4: anchor removed — orphaned dependent keeps its displayed position ================

    // Solved by AG-17366 when it is completed
    test.skip('removing the anchor calc col keeps its orphaned dependent in place', async () => {
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
        // Only `first` is removed; `second` lost its anchor but keeps its displayed slot (order
        // maintained) rather than jumping to the end.
        expect(order(api)).toEqual(['revenue', second, 'cost']);
        await new GridColumns(api, 'removing the anchor calc col keeps its orphaned dependent in place').checkColumns(`
            CENTER
            ├── revenue "Revenue" width:200
            ├── calculated_2 "New title" width:200
            └── cost "Cost" width:200
        `);
    });

    // Solved by AG-17366 when it is completed
    test.skip('removing the anchor calc col keeps a mid-list dependent between its neighbours', async () => {
        const api = createGrid('dialog-anchor-removed-mid', {
            rowData: [{ id: 'r1', revenue: 10, cost: 3, tax: 1 }],
            columnDefs: [
                { field: 'revenue', headerName: 'Revenue' },
                { field: 'cost', headerName: 'Cost' },
                { field: 'tax', headerName: 'Tax' },
            ],
        });
        const first = await addViaDialog(api, 'revenue', '[Revenue] - [Cost]');
        const second = await addViaDialog(api, first, '[Revenue] - [Cost]');
        expect(order(api)).toEqual(['revenue', first, second, 'cost', 'tax']);

        api.removeCalculatedColumn(first);
        await asyncSetTimeout(1);
        // `second` is in the MIDDLE (cost + tax follow it) — it stays between revenue and cost, and the
        // trailing columns are untouched.
        expect(order(api)).toEqual(['revenue', second, 'cost', 'tax']);
        await new GridColumns(api, 'removing the anchor calc col keeps a mid-list dependent between its neighbours')
            .checkColumns(`
                CENTER
                ├── revenue "Revenue" width:200
                ├── calculated_2 "New title" width:200
                ├── cost "Cost" width:200
                └── tax "Tax" width:200
            `);
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
        await new GridColumns(api, 'removing a dynamic calc col leaves the remaining order intact').checkColumns(`
            CENTER
            ├── revenue "Revenue" width:200
            ├── cost "Cost" width:200
            └── margin width:200
        `);
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
        await new GridColumns(api, 'removing a static calc col (suppression) leaves the remaining order intact')
            .checkColumns(`
                CENTER
                ├── revenue "Revenue" width:200
                └── cost "Cost" width:200
            `);
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
        await new GridColumns(api, 'updateGridOptions({ columnDefs }) clears dynamic calc cols').checkColumns(`
            CENTER
            ├── revenue "Revenue" width:200
            └── cost "Cost" width:200
        `);
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
        await new GridColumns(api, 'getColumnDefs persists a dynamic calc col at its position into a fresh grid')
            .checkColumns(`
                CENTER
                ├── revenue "Revenue" width:200
                ├── cost "Cost" width:200
                └── profit width:200
            `);
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
        await new GridColumns(api, 'rowNumbers column stays first when a calc col is appended').checkColumns(`
            LEFT
            └── ag-Grid-RowNumbersColumn width:60 !resizable !sortable suppressMovable lockPosition:left
            CENTER
            ├── revenue "Revenue" width:200
            ├── cost "Cost" width:200
            └── profit width:200
        `);
    });
});
