import { waitFor } from '@testing-library/dom';
import { GridColumns, GridRows, asyncSetTimeout, clickMenuOption, nextAnimationFrame } from 'ag-test-utils';

import { getGridElement } from 'ag-grid-community';

import {
    addCalculatedColumnDef,
    createGrid,
    gridRowsOpts,
    setExpression,
    setupCalculatedColumnsSuite,
    showColumnMenu,
} from './calculatedColumnsHarness';

describe('ag-grid calculated columns', () => {
    setupCalculatedColumnsSuite();

    // calculatedColumnsService writes back via `updateGridOptions({ columnDefs })` to add /
    // update / remove a calc col. Without preserving the live display order in the colDefs it
    // passes through, runtime reorders (drag-drop / moveColumns / applyColumnState) reset to the
    // original setGridOption order on every calc-col mutation.
    test('adding a calculated column preserves the current display order after moveColumns', async () => {
        const api = createGrid('calculated-cols-preserve-order', {
            rowData: [{ id: 'r1', a: 1, b: 2, c: 3 }],
            columnDefs: [{ field: 'a' }, { field: 'b' }, { field: 'c' }],
        });
        await asyncSetTimeout(0);

        // Sanity: original order.
        expect(api.getAllGridColumns()!.map((col) => col.getColId())).toEqual(['a', 'b', 'c']);

        // Reorder via API — drag-drop equivalent — so col `c` is first.
        api.moveColumns(['c'], 0);
        await asyncSetTimeout(0);
        expect(api.getAllGridColumns()!.map((col) => col.getColId())).toEqual(['c', 'a', 'b']);

        // Add a calculated column. Its round-trip through `updateGridOptions({ columnDefs })`
        // must not reset the reorder.
        addCalculatedColumnDef(api, { colId: 'sum', calculatedExpression: '[a] + [b] + [c]' });
        await asyncSetTimeout(0);

        expect(api.getAllGridColumns()!.map((col) => col.getColId())).toEqual(['c', 'a', 'b', 'sum']);
        expect(api.getCellValue({ rowNode: api.getDisplayedRowAtIndex(0)!, colKey: 'sum', useFormatter: false })).toBe(
            6
        );

        await new GridColumns(api, 'reorder + addCalculatedColumn').checkColumns(`
            CENTER
            ├── c "C" width:200
            ├── a "A" width:200
            ├── b "B" width:200
            └── sum width:200 ƒ
        `);
        await new GridRows(api, 'reorder + addCalculatedColumn rows', gridRowsOpts).check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:r1 c:3 a:1 b:2 sum:6
        `);
    });

    // Same invariant with a column group: the group structure must survive the calc-col round-trip
    // and the runtime reorder must be preserved.
    test('addCalculatedColumn preserves group structure and reorder when columns are grouped', async () => {
        const api = createGrid('calc-cols-with-groups', {
            rowData: [{ id: 'r1', a: 1, b: 2, c: 3 }],
            columnDefs: [{ groupId: 'G', headerName: 'G', children: [{ field: 'a' }, { field: 'b' }] }, { field: 'c' }],
        });
        await asyncSetTimeout(0);

        // Move `c` before the group → display order [c, a, b]; group G still wraps [a, b].
        api.moveColumns(['c'], 0);
        await asyncSetTimeout(0);

        // Add a calculated column at top level (no target column passed).
        addCalculatedColumnDef(api, { colId: 'sum', calculatedExpression: '[a] + [b] + [c]' });
        await asyncSetTimeout(0);

        // After the round-trip: `c` stays first, group G still wraps [a, b], sum at the end.
        expect(api.getCellValue({ rowNode: api.getDisplayedRowAtIndex(0)!, colKey: 'sum', useFormatter: false })).toBe(
            6
        );
        await new GridColumns(api, 'group + reorder + addCalculatedColumn').checkColumns(`
            CENTER
            ├── c "C" width:200
            ├─┬ "G" GROUP
            │ ├── a "A" width:200
            │ └── b "B" width:200
            └── sum width:200 ƒ
        `);
        await new GridRows(api, 'group + reorder + addCalculatedColumn rows', gridRowsOpts).check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:r1 c:3 a:1 b:2 sum:6
        `);
    });

    test('dialog-created calculated column cells follow moves next to a group with an explicit groupId', async () => {
        const api = createGrid('calc-dialog-group-id-move', {
            suppressColumnMoveAnimation: true,
            rowData: [{ id: 'r1', athlete: 'Michael Phelps', age: 23, country: 'United States', year: 2008 }],
            columnDefs: [
                { field: 'athlete' },
                { field: 'age' },
                { field: 'country' },
                {
                    headerName: 'Competition',
                    groupId: 'competition',
                    children: [{ field: 'year' }],
                },
            ],
        });

        showColumnMenu(api, 'country');
        await clickMenuOption('Add Calculated Column');
        setExpression('"Foo"');
        // Wait past the live-apply animation frame so the expression flush lands before the dialog closes.
        await nextAnimationFrame();

        const closeButton = document.querySelector<HTMLElement>('.ag-dialog .ag-panel-title-bar-button');
        expect(closeButton).toBeTruthy();
        closeButton!.click();
        api.moveColumns(['calculated_1'], 2);

        const gridEl = getGridElement(api)!;
        const calculatedColumn = api.getColumn('calculated_1')!;

        await waitFor(() =>
            expect(api.getAllDisplayedColumns().map((column) => column.getColId())).toEqual([
                'athlete',
                'age',
                'calculated_1',
                'country',
                'year',
            ])
        );
        const calculatedCell = gridEl.querySelector<HTMLElement>('[row-index="0"] [col-id="calculated_1"]');
        expect(calculatedCell).toBeTruthy();
        expect(calculatedCell!.style.left).toBe(`${calculatedColumn.getLeft()}px`);
        expect(calculatedCell!.textContent).toBe('Foo');
    });

    // Same order-preservation invariant, but via `applyColumnState({ applyOrder: true })` instead
    // of `moveColumns`. Drives the same `colsList` mutation through a different code path —
    // guards that the lean variant's display-order sort sees the applied order.
    test('addCalculatedColumn preserves order set via applyColumnState({ applyOrder: true })', async () => {
        const api = createGrid('calc-cols-preserve-applyOrder', {
            rowData: [{ id: 'r1', a: 1, b: 2, c: 3 }],
            columnDefs: [{ field: 'a' }, { field: 'b' }, { field: 'c' }],
        });
        await asyncSetTimeout(0);

        // Reorder via column state.
        api.applyColumnState({
            state: [{ colId: 'c' }, { colId: 'a' }, { colId: 'b' }],
            applyOrder: true,
        });
        await asyncSetTimeout(0);
        expect(api.getAllGridColumns()!.map((col) => col.getColId())).toEqual(['c', 'a', 'b']);

        addCalculatedColumnDef(api, { colId: 'sum', calculatedExpression: '[a] + [b] + [c]' });
        await asyncSetTimeout(0);

        expect(api.getAllGridColumns()!.map((col) => col.getColId())).toEqual(['c', 'a', 'b', 'sum']);
        expect(api.getCellValue({ rowNode: api.getDisplayedRowAtIndex(0)!, colKey: 'sum', useFormatter: false })).toBe(
            6
        );
        await new GridColumns(api, 'applyOrder + addCalculatedColumn').checkColumns(`
            CENTER
            ├── c "C" width:200
            ├── a "A" width:200
            ├── b "B" width:200
            └── sum width:200 ƒ
        `);
        await new GridRows(api, 'applyOrder + addCalculatedColumn rows', gridRowsOpts).check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:r1 c:3 a:1 b:2 sum:6
        `);
    });

    test('addCalculatedColumn round-trip preserves groupHierarchy virtual columns', async () => {
        const api = createGrid('calc-cols-with-hierarchy', {
            rowData: [
                { id: 'r1', country: 'USA', date: new Date(2020, 0, 1), amount: 10 },
                { id: 'r2', country: 'UK', date: new Date(2021, 5, 15), amount: 20 },
            ],
            columnDefs: [
                { field: 'country' },
                { field: 'date', enableRowGroup: true, groupHierarchy: ['year', 'month'] },
                { field: 'amount' },
            ],
        });
        await asyncSetTimeout(0);

        // Virtual cols exist before the round-trip.
        const yearVirtualBefore = api.getColumn('ag-Grid-HierarchyColumn-date-year');
        const monthVirtualBefore = api.getColumn('ag-Grid-HierarchyColumn-date-month');
        expect(yearVirtualBefore).not.toBeNull();
        expect(monthVirtualBefore).not.toBeNull();

        // Add a calc col — full updateGridOptions round-trip.
        addCalculatedColumnDef(api, { colId: 'doubled', calculatedExpression: '[amount] * 2' });
        await asyncSetTimeout(0);

        // Virtuals still present and alive after the round-trip.
        const yearVirtualAfter = api.getColumn('ag-Grid-HierarchyColumn-date-year');
        const monthVirtualAfter = api.getColumn('ag-Grid-HierarchyColumn-date-month');
        expect(yearVirtualAfter).not.toBeNull();
        expect(monthVirtualAfter).not.toBeNull();
        expect((yearVirtualAfter as any)!.isAlive()).toBe(true);
        expect((monthVirtualAfter as any)!.isAlive()).toBe(true);

        const hierarchyCols = api
            .getAllGridColumns()!
            .filter((col) => col.getColId().startsWith('ag-Grid-HierarchyColumn-'));
        expect(hierarchyCols.map((c) => c.getColId())).toEqual([
            'ag-Grid-HierarchyColumn-date-year',
            'ag-Grid-HierarchyColumn-date-month',
        ]);

        // Calc col evaluates.
        expect(
            api.getCellValue({ rowNode: api.getDisplayedRowAtIndex(0)!, colKey: 'doubled', useFormatter: false })
        ).toBe(20);
        await new GridColumns(api, 'hierarchy + addCalculatedColumn').checkColumns(`
            CENTER
            ├── country "Country" width:200
            ├── date "Date" width:200
            ├── amount "Amount" width:200
            └── doubled width:200 ƒ
        `);
        await new GridRows(api, 'hierarchy + addCalculatedColumn rows', {
            ...gridRowsOpts,
            forcedColumns: [
                'ag-Grid-HierarchyColumn-date-year',
                'ag-Grid-HierarchyColumn-date-month',
                'country',
                'amount',
                'doubled',
            ],
        }).check(`
            ROOT id:ROOT_NODE_ID ag-Grid-HierarchyColumn-date-year:null ag-Grid-HierarchyColumn-date-month:null
            ├── LEAF id:r1 ag-Grid-HierarchyColumn-date-year:"2020" ag-Grid-HierarchyColumn-date-month:"1" country:"USA" amount:10 doubled:20
            └── LEAF id:r2 ag-Grid-HierarchyColumn-date-year:"2021" ag-Grid-HierarchyColumn-date-month:"6" country:"UK" amount:20 doubled:40
        `);
    });

    // Bracket references in calculated expressions can name a column by its `field` even when the
    // column carries an explicit `colId` that differs. `calculatedColumnsService` validates such
    // references via `colModel.getCol(ref)` (which falls back to field-name lookup), so the AST
    // parser must use the same lookup or validation accepts a reference that evaluation can't
    // resolve. Locks in parser/validator consistency.
    test('calculated expression bracket-reference resolves a column by field when colId differs', async () => {
        const api = createGrid('calc-bracket-field-ref', {
            rowData: [{ id: 'r1', revenue: 10 }],
            columnDefs: [
                // colId differs from field — bracket ref `[revenue]` must resolve via field.
                { colId: 'rev', field: 'revenue' },
                { colId: 'doubled', calculatedExpression: '[revenue] * 2' },
            ],
        });
        await asyncSetTimeout(0);

        expect(
            api.getCellValue({ rowNode: api.getDisplayedRowAtIndex(0)!, colKey: 'doubled', useFormatter: false })
        ).toBe(20);
        await new GridRows(api, 'field-based bracket-ref calc col rows', gridRowsOpts).check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:r1 rev:10 doubled:20
        `);
    });

    // §3.6 expanded coverage: integration of dynamic calc cols with other column-model features.
    // Each test exercises a feature that interacts with `colsList` / `colDefList` or service cols,
    // and asserts the calc col splice cooperates with the existing flow.

    test('addCalculatedColumn after moveColumns with maintainColumnOrder=true preserves reorder', async () => {
        const api = createGrid('calc-maintain-true-move', {
            rowData: [{ id: 'r1', a: 1, b: 2, c: 3 }],
            columnDefs: [{ field: 'a' }, { field: 'b' }, { field: 'c' }],
            maintainColumnOrder: true,
        });
        await asyncSetTimeout(0);

        api.moveColumns(['c'], 0);
        await asyncSetTimeout(0);

        addCalculatedColumnDef(api, { colId: 'sum', calculatedExpression: '[a] + [b] + [c]' });
        await asyncSetTimeout(0);

        await new GridColumns(api, 'maintainColumnOrder=true: move + addCalcCol').checkColumns(`
            CENTER
            ├── c "C" width:200
            ├── a "A" width:200
            ├── b "B" width:200
            └── sum width:200 ƒ
        `);
        await new GridRows(api, 'maintainColumnOrder=true: move + addCalcCol rows', gridRowsOpts).check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:r1 c:3 a:1 b:2 sum:6
        `);
    });

    test('addCalculatedColumn after moveColumns with maintainColumnOrder=false preserves reorder', async () => {
        const api = createGrid('calc-maintain-false-move', {
            rowData: [{ id: 'r1', a: 1, b: 2, c: 3 }],
            columnDefs: [{ field: 'a' }, { field: 'b' }, { field: 'c' }],
            maintainColumnOrder: false,
        });
        await asyncSetTimeout(0);

        api.moveColumns(['c'], 0);
        await asyncSetTimeout(0);

        addCalculatedColumnDef(api, { colId: 'sum', calculatedExpression: '[a] + [b] + [c]' });
        await asyncSetTimeout(0);

        // Order preservation now comes from the incremental snapshot, not maintainColumnOrder.
        await new GridColumns(api, 'maintainColumnOrder=false: move + addCalcCol').checkColumns(`
            CENTER
            ├── c "C" width:200
            ├── a "A" width:200
            ├── b "B" width:200
            └── sum width:200 ƒ
        `);
        await new GridRows(api, 'maintainColumnOrder=false: move + addCalcCol rows', gridRowsOpts).check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:r1 c:3 a:1 b:2 sum:6
        `);
    });

    test('updateGridOptions({ columnDefs }) with reordered cols + maintainColumnOrder=true keeps reorder', async () => {
        const api = createGrid('calc-maintain-true-update', {
            rowData: [{ id: 'r1', a: 1, b: 2, c: 3 }],
            columnDefs: [{ field: 'a' }, { field: 'b' }, { field: 'c' }],
            maintainColumnOrder: true,
        });
        await asyncSetTimeout(0);

        api.moveColumns(['c'], 0);
        await asyncSetTimeout(0);

        // Re-pass colDefs in DIFFERENT order; maintainColumnOrder=true keeps the runtime reorder.
        api.updateGridOptions({ columnDefs: [{ field: 'b' }, { field: 'a' }, { field: 'c' }] });
        await asyncSetTimeout(0);

        addCalculatedColumnDef(api, { colId: 'sum', calculatedExpression: '[a] + [b] + [c]' });
        await asyncSetTimeout(0);

        await new GridColumns(api, 'maintainColumnOrder=true: updateColDefs + addCalcCol').checkColumns(`
            CENTER
            ├── c "C" width:200
            ├── a "A" width:200
            ├── b "B" width:200
            └── sum width:200 ƒ
        `);
        await new GridRows(api, 'maintainColumnOrder=true: updateColDefs + addCalcCol rows', gridRowsOpts).check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:r1 c:3 a:1 b:2 sum:6
        `);
    });

    test('updateGridOptions({ columnDefs }) with reordered cols + maintainColumnOrder=false resets order', async () => {
        const api = createGrid('calc-maintain-false-update', {
            rowData: [{ id: 'r1', a: 1, b: 2, c: 3 }],
            columnDefs: [{ field: 'a' }, { field: 'b' }, { field: 'c' }],
            maintainColumnOrder: false,
        });
        await asyncSetTimeout(0);

        api.moveColumns(['c'], 0);
        await asyncSetTimeout(0);

        // maintainColumnOrder=false: passing new colDefs resets to the colDef order.
        api.updateGridOptions({ columnDefs: [{ field: 'b' }, { field: 'a' }, { field: 'c' }] });
        await asyncSetTimeout(0);

        await new GridColumns(api, 'maintainColumnOrder=false: updateColDefs resets order').checkColumns(`
            CENTER
            ├── b "B" width:200
            ├── a "A" width:200
            └── c "C" width:200
        `);
    });

    test('addCalculatedColumn while rowGroup is active does not affect grouping', async () => {
        const api = createGrid('calc-with-rowGroup', {
            rowData: [
                { id: 'r1', category: 'A', revenue: 10, cost: 3 },
                { id: 'r2', category: 'A', revenue: 20, cost: 5 },
                { id: 'r3', category: 'B', revenue: 15, cost: 4 },
            ],
            columnDefs: [{ field: 'category', rowGroup: true, hide: true }, { field: 'revenue' }, { field: 'cost' }],
            autoGroupColumnDef: { headerName: 'Category' },
        });
        await asyncSetTimeout(0);

        addCalculatedColumnDef(api, { colId: 'profit', calculatedExpression: '[revenue] - [cost]' });
        await asyncSetTimeout(0);

        await new GridColumns(api, 'rowGroup + calc col').checkColumns(`
            CENTER
            ├── ag-Grid-AutoColumn "Category" width:200
            ├── revenue "Revenue" width:200
            ├── cost "Cost" width:200
            └── profit width:200 ƒ
        `);
        // Expand a group so leaves render and the calc col's per-row evaluation appears.
        // `forceSync=true` skips the async dispatch so the snapshot below sees the expanded
        // state deterministically (without it, a single `asyncSetTimeout(0)` doesn't reliably
        // flush the row-render work and the test flakes between collapsed/expanded states).
        const groupRow = api.getDisplayedRowAtIndex(0)!;
        api.setRowNodeExpanded(groupRow, true, undefined, true);
        await asyncSetTimeout(0);
        await new GridRows(api, 'rowGroup + calc col rows', gridRowsOpts).check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ LEAF_GROUP id:row-group-category-A ag-Grid-AutoColumn:"A"
            │ ├── LEAF id:r1 category:"A" revenue:10 cost:3 profit:7
            │ └── LEAF id:r2 category:"A" revenue:20 cost:5 profit:15
            └─┬ LEAF_GROUP collapsed id:row-group-category-B ag-Grid-AutoColumn:"B"
            · └── LEAF hidden id:r3 category:"B" revenue:15 cost:4 profit:11
        `);
    });

    test('addCalculatedColumn while pivot is active references primary columns', async () => {
        const api = createGrid('calc-with-pivot', {
            rowData: [
                { id: 'r1', country: 'US', year: 2020, revenue: 10, cost: 3 },
                { id: 'r2', country: 'UK', year: 2020, revenue: 20, cost: 5 },
                { id: 'r3', country: 'US', year: 2021, revenue: 15, cost: 4 },
            ],
            columnDefs: [
                { field: 'country', rowGroup: true, hide: true },
                { field: 'year', pivot: true },
                { field: 'revenue', aggFunc: 'sum' },
                { field: 'cost', aggFunc: 'sum' },
            ],
            pivotMode: true,
        });
        await asyncSetTimeout(0);

        // A calc col is a primary (non-value) column, so the pivot cross-tab has no cell for it:
        // adding one while pivot is active does NOT add it to the pivot display, and the pivot result
        // is unaffected. It stays a resolvable primary column (and reappears when pivot is off).
        addCalculatedColumnDef(api, { colId: 'profit', calculatedExpression: '[revenue] - [cost]' });
        await asyncSetTimeout(0);

        expect(api.getColumn('profit')).toBeTruthy();
        await new GridColumns(api, 'pivot + calc col').checkColumns(`
            CENTER
            ├── ag-Grid-AutoColumn "Group" width:200
            ├─┬ "2020" GROUP
            │ ├── pivot_year_2020_revenue "Revenue" width:200 columnGroupShow:open
            │ └── pivot_year_2020_cost "Cost" width:200 columnGroupShow:open
            └─┬ "2021" GROUP
              ├── pivot_year_2021_revenue "Revenue" width:200 columnGroupShow:open
              └── pivot_year_2021_cost "Cost" width:200 columnGroupShow:open
        `);
    });

    test('addCalculatedColumn while rowSelection is configured keeps the selection col first', async () => {
        const api = createGrid('calc-with-rowSelection', {
            rowData: [
                { id: 'r1', revenue: 10, cost: 3 },
                { id: 'r2', revenue: 20, cost: 5 },
            ],
            columnDefs: [{ field: 'revenue' }, { field: 'cost' }],
            rowSelection: { mode: 'multiRow', checkboxes: true },
        });
        await asyncSetTimeout(0);

        addCalculatedColumnDef(api, { colId: 'profit', calculatedExpression: '[revenue] - [cost]' });
        await asyncSetTimeout(0);

        await new GridColumns(api, 'rowSelection + calc col').checkColumns(`
            CENTER
            ├── ag-Grid-SelectionColumn width:50 !resizable !sortable suppressMovable lockPosition:left
            ├── revenue "Revenue" width:200
            ├── cost "Cost" width:200
            └── profit width:200 ƒ
        `);
        await new GridRows(api, 'rowSelection + calc col rows', gridRowsOpts).check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:r1 revenue:10 cost:3 profit:7
            └── LEAF id:r2 revenue:20 cost:5 profit:15
        `);
    });

    test('addCalculatedColumn while rowNumbers is enabled keeps the rowNumbers col first', async () => {
        const api = createGrid('calc-with-rowNumbers', {
            rowData: [
                { id: 'r1', revenue: 10, cost: 3 },
                { id: 'r2', revenue: 20, cost: 5 },
            ],
            columnDefs: [{ field: 'revenue' }, { field: 'cost' }],
            rowNumbers: true,
        });
        await asyncSetTimeout(0);

        addCalculatedColumnDef(api, { colId: 'profit', calculatedExpression: '[revenue] - [cost]' });
        await asyncSetTimeout(0);

        await new GridColumns(api, 'rowNumbers + calc col').checkColumns(`
            LEFT
            └── ag-Grid-RowNumbersColumn width:60 !resizable !sortable suppressMovable lockPosition:left
            CENTER
            ├── revenue "Revenue" width:200
            ├── cost "Cost" width:200
            └── profit width:200 ƒ
        `);
        await new GridRows(api, 'rowNumbers + calc col rows', gridRowsOpts).check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:r1 row-number:"1" revenue:10 cost:3 profit:7
            └── LEAF id:r2 row-number:"2" revenue:20 cost:5 profit:15
        `);
    });

    test('moveColumns on a previously-added dynamic calc col preserves the move across subsequent adds', async () => {
        const api = createGrid('calc-move-then-add', {
            rowData: [{ id: 'r1', a: 1, b: 2, c: 3 }],
            columnDefs: [{ field: 'a' }, { field: 'b' }, { field: 'c' }],
        });
        await asyncSetTimeout(0);

        addCalculatedColumnDef(api, { colId: 'sum', calculatedExpression: '[a] + [b] + [c]' });
        await asyncSetTimeout(0);

        // Move sum to position 0 after creation.
        api.moveColumns(['sum'], 0);
        await asyncSetTimeout(0);

        // Add another calc col; sum's runtime position should still be 0.
        addCalculatedColumnDef(api, { colId: 'avg', calculatedExpression: '([a] + [b] + [c]) / 3' });
        await asyncSetTimeout(0);

        await new GridColumns(api, 'moveColumns on calc col + subsequent add').checkColumns(`
            CENTER
            ├── sum width:200 ƒ
            ├── a "A" width:200
            ├── b "B" width:200
            ├── c "C" width:200
            └── avg width:200 ƒ
        `);
        await new GridRows(api, 'moveColumns on calc col + subsequent add rows', gridRowsOpts).check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:r1 sum:6 a:1 b:2 c:3 avg:2
        `);
    });
});
