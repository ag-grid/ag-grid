import { ClientSideRowModelModule, QuickFilterModule } from 'ag-grid-community';
import { PivotModule, RowGroupingModule, TreeDataModule } from 'ag-grid-enterprise';

import { GridColumns, GridRows, TestGridsManager, applyTransactionChecked } from '../test-utils';

describe('group order maintenance', () => {
    const gridsManager = new TestGridsManager({
        modules: [QuickFilterModule, ClientSideRowModelModule, RowGroupingModule, PivotModule, TreeDataModule],
    });

    afterEach(() => gridsManager.reset());

    test('per-level sort isolation: secondary sort cannot tie-break a non-targeted level', async () => {
        const rowData = [
            { id: '1', country: 'Alpha', sales: 10 },
            { id: '2', country: 'Bravo', sales: 20 },
            { id: '3', country: 'Charlie', sales: 30 },
        ];

        const api = gridsManager.createGrid('grid-isolation', {
            columnDefs: [
                { field: 'country', rowGroup: true, hide: true, sortable: true, comparator: () => 0 },
                { field: 'sales', aggFunc: 'sum', sortable: true },
            ],
            autoGroupColumnDef: { headerName: 'Country' },
            animateRows: false,
            groupDefaultExpanded: -1,
            groupMaintainOrder: true,
            rowData,
            getRowId: (p) => p.data.id,
        });

        api.applyColumnState({
            state: [
                { colId: 'country', sort: 'asc', sortIndex: 0 },
                { colId: 'sales', sort: 'desc', sortIndex: 1 },
            ],
        });

        await new GridRows(api, 'isolation: country in structural order').check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ LEAF_GROUP id:row-group-country-Alpha ag-Grid-AutoColumn:"Alpha" sales:10
            │ └── LEAF id:1 country:"Alpha" sales:10
            ├─┬ LEAF_GROUP id:row-group-country-Bravo ag-Grid-AutoColumn:"Bravo" sales:20
            │ └── LEAF id:2 country:"Bravo" sales:20
            └─┬ LEAF_GROUP id:row-group-country-Charlie ag-Grid-AutoColumn:"Charlie" sales:30
            · └── LEAF id:3 country:"Charlie" sales:30
        `);
    });

    test('leaf rows are not reordered by a custom group-column comparator (data-row sort isolation)', async () => {
        // Per-level isolation extends to data rows too: a sort on a group column must NOT reorder
        // leaf rows inside a single leaf group (all rows there share the group key). With a custom
        // comparator that returns a non-zero result for "equal" rows, the old code would reorder
        // leaf rows on every group-column sort. The fix routes group-column sort options to the
        // group-level buckets only; data rows see only the leaf-targeted options.
        const rowData = [
            { id: '1', country: 'Audi', athlete: 'Z' },
            { id: '2', country: 'Audi', athlete: 'A' },
            { id: '3', country: 'BMW', athlete: 'M' },
        ];

        const api = gridsManager.createGrid('grid-leaf-isolation', {
            columnDefs: [
                {
                    field: 'country',
                    rowGroup: true,
                    hide: true,
                    sortable: true,
                    // Comparator that always returns 1 — even rows that share the group key would
                    // get reordered if this option reached the data-row sort.
                    comparator: () => 1,
                },
                { field: 'athlete' },
            ],
            autoGroupColumnDef: { headerName: 'Country' },
            animateRows: false,
            groupDefaultExpanded: -1,
            groupMaintainOrder: true,
            rowData,
            getRowId: (p) => p.data.id,
        });

        api.applyColumnState({ state: [{ colId: 'country', sort: 'asc' }] });

        // Inside Audi, athletes [Z, A] must remain in data order; the country comparator must
        // NOT bubble down to data rows. Old behaviour would have reordered them.
        await new GridRows(api, 'leaf isolation: data rows in data order').check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ LEAF_GROUP id:row-group-country-Audi ag-Grid-AutoColumn:"Audi"
            │ ├── LEAF id:1 country:"Audi" athlete:"Z"
            │ └── LEAF id:2 country:"Audi" athlete:"A"
            └─┬ LEAF_GROUP id:row-group-country-BMW ag-Grid-AutoColumn:"BMW"
            · └── LEAF id:3 country:"BMW" athlete:"M"
        `);
    });

    test('display column with own data: sort reaches both leaf rows AND group levels', async () => {
        // Per `sortService.getDisplaySortForColumn`: an auto-display column with `field` or
        // `valueGetter` of its own has unique data — its sort participates in the displayed-sort
        // mix as the column itself. `buildLevelSortOptions` cascades the option to every group
        // level AND adds it to the leaf bucket, so leaf rows are ordered by the column's data
        // and group rows can be reordered too.
        //
        // Test fixture: group columns have a comparator returning 0 (so the source rowGroup col
        // can't reorder countries). The auto-display column has its own field `displayLabel`
        // and is sorted asc. We verify: leaf rows reorder by displayLabel; group rows return
        // undefined for `displayLabel` under the coupled path, so they tie and country order
        // stays structural.
        const rowData = [
            { id: '1', country: 'Audi', athlete: 'A1', displayLabel: 'Z-display' },
            { id: '2', country: 'Audi', athlete: 'A2', displayLabel: 'A-display' },
            { id: '3', country: 'BMW', athlete: 'B1', displayLabel: 'M-display' },
        ];

        const api = gridsManager.createGrid('grid-display-data', {
            columnDefs: [{ field: 'country', rowGroup: true, hide: true, comparator: () => 0 }, { field: 'athlete' }],
            autoGroupColumnDef: {
                headerName: 'Group',
                showRowGroup: true,
                field: 'displayLabel',
                sortable: true,
            },
            animateRows: false,
            groupDefaultExpanded: -1,
            groupMaintainOrder: true,
            rowData,
            getRowId: (p) => p.data.id,
        });

        // Sort on the auto-display column. Leaf rows reorder by displayLabel asc; group rows
        // tie 0 (group rows return undefined for `displayLabel` in coupled mode) so the country
        // order stays structural.
        api.applyColumnState({ state: [{ colId: 'ag-Grid-AutoColumn', sort: 'asc' }] });

        await new GridRows(api, 'display-data: leaf rows reordered by displayLabel').check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ LEAF_GROUP id:row-group-country-Audi ag-Grid-AutoColumn:"Audi"
            │ ├── LEAF id:2 ag-Grid-AutoColumn:"A-display" country:"Audi" athlete:"A2"
            │ └── LEAF id:1 ag-Grid-AutoColumn:"Z-display" country:"Audi" athlete:"A1"
            └─┬ LEAF_GROUP id:row-group-country-BMW ag-Grid-AutoColumn:"BMW"
            · └── LEAF id:3 ag-Grid-AutoColumn:"M-display" country:"BMW" athlete:"B1"
        `);
    });

    test('auto-display column with own field reorders group rows under custom comparator', async () => {
        const rowData = [
            { id: '1', country: 'Audi', athlete: 'A1', displayLabel: 'long-label-Z' },
            { id: '2', country: 'Audi', athlete: 'A2', displayLabel: 'short-A' },
            { id: '3', country: 'BMW', athlete: 'B1', displayLabel: 'm-BMW' },
            { id: '4', country: 'Tesla', athlete: 'T1', displayLabel: 'mid-T' },
        ];

        const api = gridsManager.createGrid('grid-display-regression', {
            columnDefs: [{ field: 'country', rowGroup: true, hide: true }, { field: 'athlete' }],
            autoGroupColumnDef: {
                headerName: 'Group',
                showRowGroup: true,
                field: 'displayLabel',
                sortable: true,
                // Custom comparator on autoGroupColumnDef → uncoupled mode. Compares by length;
                // resolves the displayed value: leaves use `data.displayLabel`, group rows use
                // their key (the group identifier).
                comparator: (a: unknown, b: unknown) => {
                    const aLen = a == null ? 0 : String(a).length;
                    const bLen = b == null ? 0 : String(b).length;
                    return aLen - bLen;
                },
            },
            animateRows: false,
            groupDefaultExpanded: -1,
            groupMaintainOrder: true,
            rowData,
            getRowId: (p) => p.data.id,
        });

        api.applyColumnState({ state: [{ colId: 'ag-Grid-AutoColumn', sort: 'asc' }] });

        // Country groups reorder by the comparator running on group keys (len asc): BMW, Audi,
        // Tesla. Leaf rows inside Audi reorder by displayLabel length asc (short-A before long-).
        // If the cascade had been dropped (pre-fix), countries would have stayed in data order.
        await new GridRows(api, 'display-regression: groups + leaves both reorder under custom comparator').check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ LEAF_GROUP id:row-group-country-BMW ag-Grid-AutoColumn:"BMW"
            │ └── LEAF id:3 ag-Grid-AutoColumn:"m-BMW" country:"BMW" athlete:"B1"
            ├─┬ LEAF_GROUP id:row-group-country-Audi ag-Grid-AutoColumn:"Audi"
            │ ├── LEAF id:2 ag-Grid-AutoColumn:"short-A" country:"Audi" athlete:"A2"
            │ └── LEAF id:1 ag-Grid-AutoColumn:"long-label-Z" country:"Audi" athlete:"A1"
            └─┬ LEAF_GROUP id:row-group-country-Tesla ag-Grid-AutoColumn:"Tesla"
            · └── LEAF id:4 ag-Grid-AutoColumn:"mid-T" country:"Tesla" athlete:"T1"
        `);
    });

    test('empty leaf group: leaf-column sort is applied when data is later added by transaction', async () => {
        // Reviewer concern (P1 #6): empty leaf groups whose `leafGroup` flag may not be reliable.
        // After a transaction adds data, the new rows must show in leaf-sort order, not raw data
        // order. The level-based detection (level === leafLevelIndex) plus per-level isolation
        // ensures the leaf-row bucket is applied even on the transactional path.
        const rowData = [
            { id: '1', country: 'Audi', athlete: 'A1', total: 5 },
            { id: '2', country: 'BMW', athlete: 'B1', total: 8 },
        ];

        const api = gridsManager.createGrid('grid-empty-leaf', {
            columnDefs: [
                { field: 'country', rowGroup: true, hide: true },
                { field: 'athlete' },
                { field: 'total', sortable: true },
            ],
            autoGroupColumnDef: { headerName: 'Country' },
            animateRows: false,
            groupDefaultExpanded: -1,
            groupMaintainOrder: true,
            rowData,
            getRowId: (p) => p.data.id,
        });

        api.applyColumnState({ state: [{ colId: 'total', sort: 'desc' }] });

        // Transaction adds two rows to a brand-new "Tesla" leaf group. They should appear in
        // total-desc order (not data-insertion order) inside Tesla.
        applyTransactionChecked(api, {
            add: [
                { id: '3', country: 'Tesla', athlete: 'T1', total: 4 },
                { id: '4', country: 'Tesla', athlete: 'T2', total: 9 },
            ],
        });

        await new GridRows(api, 'empty-leaf: new rows in leaf-sort order').check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ LEAF_GROUP id:row-group-country-Audi ag-Grid-AutoColumn:"Audi"
            │ └── LEAF id:1 country:"Audi" athlete:"A1" total:5
            ├─┬ LEAF_GROUP id:row-group-country-BMW ag-Grid-AutoColumn:"BMW"
            │ └── LEAF id:2 country:"BMW" athlete:"B1" total:8
            └─┬ LEAF_GROUP id:row-group-country-Tesla ag-Grid-AutoColumn:"Tesla"
            · ├── LEAF id:4 country:"Tesla" athlete:"T2" total:9
            · └── LEAF id:3 country:"Tesla" athlete:"T1" total:4
        `);
    });

    test('new group is appended at end when groupMaintainOrder is true', async () => {
        const rowData = [
            { id: '1', country: 'Ireland', athlete: 'I1' },
            { id: '2', country: 'Ireland', athlete: 'I2' },
            { id: '3', country: 'Italy', athlete: 'It1' },
        ];

        const api = gridsManager.createGrid('grid1', {
            columnDefs: [{ field: 'country', rowGroup: true, hide: true }, { field: 'athlete' }],
            autoGroupColumnDef: { headerName: 'Country' },
            animateRows: false,
            groupDefaultExpanded: -1,
            groupMaintainOrder: true,
            rowData,
            getRowId: (p) => p.data.id,
        });

        await new GridRows(api, 'initial').check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ LEAF_GROUP id:row-group-country-Ireland ag-Grid-AutoColumn:"Ireland"
            │ ├── LEAF id:1 country:"Ireland" athlete:"I1"
            │ └── LEAF id:2 country:"Ireland" athlete:"I2"
            └─┬ LEAF_GROUP id:row-group-country-Italy ag-Grid-AutoColumn:"Italy"
            · └── LEAF id:3 country:"Italy" athlete:"It1"
        `);

        // Add a new row that creates a new group (France)
        applyTransactionChecked(api, { add: [{ id: '4', country: 'France', athlete: 'F1' }] });

        // Expect the new group to be appended at the end (Ireland, Italy, France)
        await new GridRows(api, 'after add France').check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ LEAF_GROUP id:row-group-country-Ireland ag-Grid-AutoColumn:"Ireland"
            │ ├── LEAF id:1 country:"Ireland" athlete:"I1"
            │ └── LEAF id:2 country:"Ireland" athlete:"I2"
            ├─┬ LEAF_GROUP id:row-group-country-Italy ag-Grid-AutoColumn:"Italy"
            │ └── LEAF id:3 country:"Italy" athlete:"It1"
            └─┬ LEAF_GROUP id:row-group-country-France ag-Grid-AutoColumn:"France"
            · └── LEAF id:4 country:"France" athlete:"F1"
        `);

        await new GridColumns(api, 'columns').checkColumns(`
            CENTER
            ├── ag-Grid-AutoColumn "Country" width:200
            └── athlete "Athlete" width:200
        `);
    });

    test('updating a row without changing group does not change group order (groupMaintainOrder=true)', async () => {
        const rowData = [
            { id: '1', country: 'Ireland', athlete: 'I1' },
            { id: '2', country: 'Ireland', athlete: 'I2' },
            { id: '3', country: 'Italy', athlete: 'It1' },
            { id: '4', country: 'France', athlete: 'F1' },
        ];

        const api = gridsManager.createGrid('grid2', {
            columnDefs: [{ field: 'country', rowGroup: true, hide: true }, { field: 'athlete' }],
            autoGroupColumnDef: { headerName: 'Country' },
            animateRows: false,
            groupDefaultExpanded: -1,
            groupMaintainOrder: true,
            rowData,
            getRowId: (p) => p.data.id,
        });

        await new GridRows(api, 'initial').check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ LEAF_GROUP id:row-group-country-Ireland ag-Grid-AutoColumn:"Ireland"
            │ ├── LEAF id:1 country:"Ireland" athlete:"I1"
            │ └── LEAF id:2 country:"Ireland" athlete:"I2"
            ├─┬ LEAF_GROUP id:row-group-country-Italy ag-Grid-AutoColumn:"Italy"
            │ └── LEAF id:3 country:"Italy" athlete:"It1"
            └─┬ LEAF_GROUP id:row-group-country-France ag-Grid-AutoColumn:"France"
            · └── LEAF id:4 country:"France" athlete:"F1"
        `);

        // Update a leaf inside existing group (Ireland), do not move group
        applyTransactionChecked(api, { update: [{ id: '2', country: 'Ireland', athlete: 'I2-upd' }] });

        // Group order should be unchanged
        await new GridRows(api, 'after update').check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ LEAF_GROUP id:row-group-country-Ireland ag-Grid-AutoColumn:"Ireland"
            │ ├── LEAF id:1 country:"Ireland" athlete:"I1"
            │ └── LEAF id:2 country:"Ireland" athlete:"I2-upd"
            ├─┬ LEAF_GROUP id:row-group-country-Italy ag-Grid-AutoColumn:"Italy"
            │ └── LEAF id:3 country:"Italy" athlete:"It1"
            └─┬ LEAF_GROUP id:row-group-country-France ag-Grid-AutoColumn:"France"
            · └── LEAF id:4 country:"France" athlete:"F1"
        `);

        await new GridColumns(api, 'columns').checkColumns(`
            CENTER
            ├── ag-Grid-AutoColumn "Country" width:200
            └── athlete "Athlete" width:200
        `);
    });

    test('group order is stable across rowData reorder (immutable mode, getRowId)', async () => {
        // Existing groups keep their creation-order positions when rowData is reapplied in a
        // different sequence; only new keys would land at the end.
        let rowData = [
            { id: '1', country: 'Audi', athlete: 'A' },
            { id: '2', country: 'BMW', athlete: 'B' },
            { id: '3', country: 'Tesla', athlete: 'T' },
        ];

        const api = gridsManager.createGrid('grid-reorder', {
            columnDefs: [{ field: 'country', rowGroup: true, hide: true }, { field: 'athlete' }],
            autoGroupColumnDef: { headerName: 'Country' },
            animateRows: false,
            groupDefaultExpanded: -1,
            groupMaintainOrder: true,
            rowData,
            getRowId: (p) => p.data.id,
        });

        await new GridRows(api, 'reorder: initial').check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ LEAF_GROUP id:row-group-country-Audi ag-Grid-AutoColumn:"Audi"
            │ └── LEAF id:1 country:"Audi" athlete:"A"
            ├─┬ LEAF_GROUP id:row-group-country-BMW ag-Grid-AutoColumn:"BMW"
            │ └── LEAF id:2 country:"BMW" athlete:"B"
            └─┬ LEAF_GROUP id:row-group-country-Tesla ag-Grid-AutoColumn:"Tesla"
            · └── LEAF id:3 country:"Tesla" athlete:"T"
        `);

        // Reorder rowData: Tesla, BMW, Audi.
        rowData = [
            { id: '3', country: 'Tesla', athlete: 'T' },
            { id: '2', country: 'BMW', athlete: 'B' },
            { id: '1', country: 'Audi', athlete: 'A' },
        ];
        api.setGridOption('rowData', rowData);

        await new GridRows(api, 'reorder: groups stay in creation order').check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ LEAF_GROUP id:row-group-country-Audi ag-Grid-AutoColumn:"Audi"
            │ └── LEAF id:1 country:"Audi" athlete:"A"
            ├─┬ LEAF_GROUP id:row-group-country-BMW ag-Grid-AutoColumn:"BMW"
            │ └── LEAF id:2 country:"BMW" athlete:"B"
            └─┬ LEAF_GROUP id:row-group-country-Tesla ag-Grid-AutoColumn:"Tesla"
            · └── LEAF id:3 country:"Tesla" athlete:"T"
        `);
    });

    test('postSortRows + groupMaintainOrder: customisation reapplies through filter cycles', async () => {
        // A postSortRows callback that pins one group to the top must keep doing so after any
        // filter cycle.
        const rowData = [
            { id: '1', country: 'Audi', athlete: 'A' },
            { id: '2', country: 'BMW', athlete: 'B' },
            { id: '3', country: 'Tesla', athlete: 'T' },
        ];

        const api = gridsManager.createGrid('grid-postsort', {
            columnDefs: [{ field: 'country', rowGroup: true, hide: true }, { field: 'athlete' }],
            autoGroupColumnDef: { headerName: 'Country' },
            animateRows: false,
            groupDefaultExpanded: -1,
            groupMaintainOrder: true,
            rowData,
            getRowId: (p) => p.data.id,
            postSortRows: (params) => {
                const teslaIdx = params.nodes.findIndex((n) => n.key === 'Tesla');
                if (teslaIdx > 0) {
                    const [tesla] = params.nodes.splice(teslaIdx, 1);
                    params.nodes.unshift(tesla);
                }
            },
        });

        await new GridRows(api, 'postSort: initial — Tesla pinned to top').check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ LEAF_GROUP id:row-group-country-Tesla ag-Grid-AutoColumn:"Tesla"
            │ └── LEAF id:3 country:"Tesla" athlete:"T"
            ├─┬ LEAF_GROUP id:row-group-country-Audi ag-Grid-AutoColumn:"Audi"
            │ └── LEAF id:1 country:"Audi" athlete:"A"
            └─┬ LEAF_GROUP id:row-group-country-BMW ag-Grid-AutoColumn:"BMW"
            · └── LEAF id:2 country:"BMW" athlete:"B"
        `);

        api.setGridOption('quickFilterText', 'BMW');
        await new GridRows(api, 'postSort: filtered to BMW only').check(`
            ROOT id:ROOT_NODE_ID
            └─┬ LEAF_GROUP id:row-group-country-BMW ag-Grid-AutoColumn:"BMW"
            · └── LEAF id:2 country:"BMW" athlete:"B"
        `);

        api.setGridOption('quickFilterText', undefined);
        await new GridRows(api, 'postSort: clear filter — Tesla pinned again').check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ LEAF_GROUP id:row-group-country-Tesla ag-Grid-AutoColumn:"Tesla"
            │ └── LEAF id:3 country:"Tesla" athlete:"T"
            ├─┬ LEAF_GROUP id:row-group-country-Audi ag-Grid-AutoColumn:"Audi"
            │ └── LEAF id:1 country:"Audi" athlete:"A"
            └─┬ LEAF_GROUP id:row-group-country-BMW ag-Grid-AutoColumn:"BMW"
            · └── LEAF id:2 country:"BMW" athlete:"B"
        `);
    });

    test('grouped GroupSortStage: postSortRows reorder leaves childIndex / firstChild / lastChild stale (legacy AG-309 behaviour)', async () => {
        // Locks the AG-309 (Feb 2018) ordering: _updateRowNodeAfterSort runs BEFORE postSortRows.
        // The flags reflecting the pre-mutation order is intentional and out of scope to flip —
        // changing it would break callers reading those flags during postSortRows.
        const rowData = [
            { id: '1', country: 'Audi', athlete: 'A' },
            { id: '2', country: 'BMW', athlete: 'B' },
            { id: '3', country: 'Tesla', athlete: 'T' },
        ];

        const api = gridsManager.createGrid('grid-group-postsort-stale', {
            columnDefs: [{ field: 'country', rowGroup: true, hide: true }, { field: 'athlete' }],
            autoGroupColumnDef: { headerName: 'Country' },
            animateRows: false,
            groupDefaultExpanded: -1,
            rowData,
            getRowId: (p) => p.data.id,
            postSortRows: (params) => {
                // Reverse the input. After this, childrenAfterSort is [Tesla, BMW, Audi] but
                // the flags were already written for the input order [Audi, BMW, Tesla].
                params.nodes.reverse();
            },
        });

        // Display reflects the post-mutation array.
        await new GridRows(api, 'AG-309 stale flags: displayed order is post-mutation').check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ LEAF_GROUP id:row-group-country-Tesla ag-Grid-AutoColumn:"Tesla"
            │ └── LEAF id:3 country:"Tesla" athlete:"T"
            ├─┬ LEAF_GROUP id:row-group-country-BMW ag-Grid-AutoColumn:"BMW"
            │ └── LEAF id:2 country:"BMW" athlete:"B"
            └─┬ LEAF_GROUP id:row-group-country-Audi ag-Grid-AutoColumn:"Audi"
            · └── LEAF id:1 country:"Audi" athlete:"A"
        `);

        // Deprecated flags reflect the pre-mutation (input) order — Audi was first in input,
        // Tesla was last, even though they're now at the opposite ends of the display.
        const audi = api.getRowNode('row-group-country-Audi')!;
        expect(audi.childIndex).toBe(0);
        expect(audi.firstChild).toBe(true);
        expect(audi.lastChild).toBe(false);

        const tesla = api.getRowNode('row-group-country-Tesla')!;
        expect(tesla.childIndex).toBe(2);
        expect(tesla.firstChild).toBe(false);
        expect(tesla.lastChild).toBe(true);
    });

    test('firstChild / lastChild / childIndex reflect the sorted group order', async () => {
        // GroupSortStage must call _updateRowNodeAfterSort so the deprecated flags (and their
        // events) reflect the displayed group order — otherwise ag-row-first / ag-row-last go stale.
        const rowData = [
            { id: '1', country: 'Audi', athlete: 'A' },
            { id: '2', country: 'BMW', athlete: 'B' },
            { id: '3', country: 'Tesla', athlete: 'T' },
        ];

        const api = gridsManager.createGrid('grid-group-sort-flags', {
            columnDefs: [{ field: 'country', rowGroup: true, hide: true, sortable: true }, { field: 'athlete' }],
            autoGroupColumnDef: { headerName: 'Country' },
            animateRows: false,
            groupDefaultExpanded: -1,
            rowData,
            getRowId: (p) => p.data.id,
        });

        // Sort groups descending — order becomes [Tesla, BMW, Audi].
        api.applyColumnState({ state: [{ colId: 'country', sort: 'desc' }] });

        await new GridRows(api, 'group sort desc').check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ LEAF_GROUP id:row-group-country-Tesla ag-Grid-AutoColumn:"Tesla"
            │ └── LEAF id:3 country:"Tesla" athlete:"T"
            ├─┬ LEAF_GROUP id:row-group-country-BMW ag-Grid-AutoColumn:"BMW"
            │ └── LEAF id:2 country:"BMW" athlete:"B"
            └─┬ LEAF_GROUP id:row-group-country-Audi ag-Grid-AutoColumn:"Audi"
            · └── LEAF id:1 country:"Audi" athlete:"A"
        `);

        const sortedKeys = ['Tesla', 'BMW', 'Audi'];
        const groupNodes = sortedKeys.map((key) => api.getRowNode(`row-group-country-${key}`)!);

        groupNodes.forEach((node, idx) => {
            expect(node.childIndex).toBe(idx);
            expect(node.firstChild).toBe(idx === 0);
            expect(node.lastChild).toBe(idx === groupNodes.length - 1);
        });
    });

    test('reused-array postSortRows mutation does not corrupt the structural baseline', async () => {
        // Two invariants: (1) prevSort and childrenAfterAggFilter are separate refs, so an
        // in-place postSortRows never bleeds into the structural baseline; (2) _reuseArrayIfEqual
        // is by-position, so a reordered prevSort is NOT reused next refresh. The reverse=false
        // refresh is the load-bearing assertion — structural order is only restorable if both hold.
        const rowData = [
            { id: '1', country: 'Audi', athlete: 'A' },
            { id: '2', country: 'BMW', athlete: 'B' },
            { id: '3', country: 'Tesla', athlete: 'T' },
        ];

        let reverse = false;
        const api = gridsManager.createGrid('grid-baseline-integrity', {
            columnDefs: [{ field: 'country', rowGroup: true, hide: true }, { field: 'athlete' }],
            autoGroupColumnDef: { headerName: 'Country' },
            animateRows: false,
            groupDefaultExpanded: -1,
            groupMaintainOrder: true,
            rowData,
            getRowId: (p) => p.data.id,
            postSortRows: (params) => {
                if (reverse) {
                    params.nodes.reverse();
                }
            },
        });

        // Initial: postSortRows is a no-op, in structural order.
        await new GridRows(api, 'baseline: structural order').check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ LEAF_GROUP id:row-group-country-Audi ag-Grid-AutoColumn:"Audi"
            │ └── LEAF id:1 country:"Audi" athlete:"A"
            ├─┬ LEAF_GROUP id:row-group-country-BMW ag-Grid-AutoColumn:"BMW"
            │ └── LEAF id:2 country:"BMW" athlete:"B"
            └─┬ LEAF_GROUP id:row-group-country-Tesla ag-Grid-AutoColumn:"Tesla"
            · └── LEAF id:3 country:"Tesla" athlete:"T"
        `);

        // Refresh with reverse=true. The reused-array branch fires and postSortRows mutates
        // the previous array in place — childrenAfterSort flips.
        reverse = true;
        api.refreshClientSideRowModel('sort');
        await new GridRows(api, 'baseline: postSortRows reverses').check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ LEAF_GROUP id:row-group-country-Tesla ag-Grid-AutoColumn:"Tesla"
            │ └── LEAF id:3 country:"Tesla" athlete:"T"
            ├─┬ LEAF_GROUP id:row-group-country-BMW ag-Grid-AutoColumn:"BMW"
            │ └── LEAF id:2 country:"BMW" athlete:"B"
            └─┬ LEAF_GROUP id:row-group-country-Audi ag-Grid-AutoColumn:"Audi"
            · └── LEAF id:1 country:"Audi" athlete:"A"
        `);

        // Refresh with reverse=false. Structural order returns. If the baseline had been
        // corrupted by the previous mutation, the structural order could not be restored here.
        reverse = false;
        api.refreshClientSideRowModel('sort');
        await new GridRows(api, 'baseline: structural order restored').check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ LEAF_GROUP id:row-group-country-Audi ag-Grid-AutoColumn:"Audi"
            │ └── LEAF id:1 country:"Audi" athlete:"A"
            ├─┬ LEAF_GROUP id:row-group-country-BMW ag-Grid-AutoColumn:"BMW"
            │ └── LEAF id:2 country:"BMW" athlete:"B"
            └─┬ LEAF_GROUP id:row-group-country-Tesla ag-Grid-AutoColumn:"Tesla"
            · └── LEAF id:3 country:"Tesla" athlete:"T"
        `);
    });

    test('postSortRows reorder survives a sort refresh on the reused-array path', async () => {
        // hasAnyFirstChildChanged must capture the previous first child by value before
        // postSortRows mutates the reused array — otherwise the before/after comparison reads
        // from one shared ref and silently misses the change.
        const rowData = [
            { id: '1', country: 'Audi', athlete: 'A' },
            { id: '2', country: 'BMW', athlete: 'B' },
            { id: '3', country: 'Tesla', athlete: 'T' },
        ];

        let promoteKey: string | null = null;
        const api = gridsManager.createGrid('grid-postsort-reuse', {
            columnDefs: [{ field: 'country', rowGroup: true, hide: true }, { field: 'athlete' }],
            autoGroupColumnDef: { headerName: 'Country' },
            animateRows: false,
            groupDefaultExpanded: -1,
            groupMaintainOrder: true,
            rowData,
            getRowId: (p) => p.data.id,
            postSortRows: (params) => {
                if (!promoteKey) {
                    return;
                }
                const idx = params.nodes.findIndex((n) => n.key === promoteKey);
                if (idx > 0) {
                    const [promoted] = params.nodes.splice(idx, 1);
                    params.nodes.unshift(promoted);
                }
            },
        });

        await new GridRows(api, 'reuse-path: initial structural').check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ LEAF_GROUP id:row-group-country-Audi ag-Grid-AutoColumn:"Audi"
            │ └── LEAF id:1 country:"Audi" athlete:"A"
            ├─┬ LEAF_GROUP id:row-group-country-BMW ag-Grid-AutoColumn:"BMW"
            │ └── LEAF id:2 country:"BMW" athlete:"B"
            └─┬ LEAF_GROUP id:row-group-country-Tesla ag-Grid-AutoColumn:"Tesla"
            · └── LEAF id:3 country:"Tesla" athlete:"T"
        `);

        // Force the sort stage to re-run with structurally identical childrenAfterAggFilter so
        // _reuseArrayIfEqual returns the previous reference. postSortRows then mutates that array.
        promoteKey = 'Tesla';
        api.refreshClientSideRowModel('sort');
        await new GridRows(api, 'reuse-path: Tesla promoted').check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ LEAF_GROUP id:row-group-country-Tesla ag-Grid-AutoColumn:"Tesla"
            │ └── LEAF id:3 country:"Tesla" athlete:"T"
            ├─┬ LEAF_GROUP id:row-group-country-Audi ag-Grid-AutoColumn:"Audi"
            │ └── LEAF id:1 country:"Audi" athlete:"A"
            └─┬ LEAF_GROUP id:row-group-country-BMW ag-Grid-AutoColumn:"BMW"
            · └── LEAF id:2 country:"BMW" athlete:"B"
        `);

        // Run another refresh on the now-reordered array — postSortRows still applies on top.
        api.refreshClientSideRowModel('sort');
        await new GridRows(api, 'reuse-path: idempotent re-refresh').check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ LEAF_GROUP id:row-group-country-Tesla ag-Grid-AutoColumn:"Tesla"
            │ └── LEAF id:3 country:"Tesla" athlete:"T"
            ├─┬ LEAF_GROUP id:row-group-country-Audi ag-Grid-AutoColumn:"Audi"
            │ └── LEAF id:1 country:"Audi" athlete:"A"
            └─┬ LEAF_GROUP id:row-group-country-BMW ag-Grid-AutoColumn:"BMW"
            · └── LEAF id:2 country:"BMW" athlete:"B"
        `);

        // Switching the promoted key takes effect on the next refresh — the new ordering is
        // produced from the structural baseline ([Audi, BMW, Tesla]) and then BMW is unshifted.
        promoteKey = 'BMW';
        api.refreshClientSideRowModel('sort');
        await new GridRows(api, 'reuse-path: switch to BMW promoted').check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ LEAF_GROUP id:row-group-country-BMW ag-Grid-AutoColumn:"BMW"
            │ └── LEAF id:2 country:"BMW" athlete:"B"
            ├─┬ LEAF_GROUP id:row-group-country-Audi ag-Grid-AutoColumn:"Audi"
            │ └── LEAF id:1 country:"Audi" athlete:"A"
            └─┬ LEAF_GROUP id:row-group-country-Tesla ag-Grid-AutoColumn:"Tesla"
            · └── LEAF id:3 country:"Tesla" athlete:"T"
        `);
    });

    test('pivot mode: leaf-group children are not reordered by an active leaf-column sort', async () => {
        // In pivot mode the leaf groups' children aren't part of the displayed output, so a
        // leaf-column sort must not reorder them. Defended by two layers: GroupSortStage's
        // skipPivotLeafs guard and SortService filtering pivot-incompatible options.
        const rowData = [
            { id: '1', country: 'Audi', year: 2020, athlete: 'Z' },
            { id: '2', country: 'Audi', year: 2020, athlete: 'A' },
            { id: '3', country: 'Audi', year: 2021, athlete: 'M' },
        ];

        const api = gridsManager.createGrid('grid-pivot-leaf-skip', {
            columnDefs: [
                { field: 'country', rowGroup: true, hide: true },
                { field: 'year', pivot: true, hide: true },
                { field: 'athlete', sort: 'asc' },
            ],
            autoGroupColumnDef: { headerName: 'Country' },
            animateRows: false,
            groupDefaultExpanded: -1,
            rowData,
            getRowId: (p) => p.data.id,
        });

        const audi = () => api.getRowNode('row-group-country-Audi')!;
        const childIds = () => audi().childrenAfterSort?.map((n) => n.id);

        // Without pivot, athlete asc orders the leaf children: '2'=A, '3'=M, '1'=Z.
        expect(childIds()).toEqual(['2', '3', '1']);

        // Enabling pivot mode reverts leaf children to structural / filter order — they are
        // no longer part of the pivoted display, so reordering them would be wasted work.
        api.setGridOption('pivotMode', true);
        expect(childIds()).toEqual(['1', '2', '3']);
    });

    test('pivot mode + groupMaintainOrder: filter cycle preserves group order', async () => {
        // Group order survives a filter cycle when pivot mode is on.
        const rowData = [
            { id: '1', country: 'Audi', year: 2020, sales: 10 },
            { id: '2', country: 'BMW', year: 2020, sales: 20 },
            { id: '3', country: 'Tesla', year: 2021, sales: 30 },
        ];

        const api = gridsManager.createGrid('grid-pivot', {
            columnDefs: [
                { field: 'country', rowGroup: true, hide: true },
                { field: 'year', pivot: true, hide: true },
                { field: 'sales', aggFunc: 'sum' },
            ],
            autoGroupColumnDef: { headerName: 'Country' },
            animateRows: false,
            groupDefaultExpanded: -1,
            groupMaintainOrder: true,
            pivotMode: true,
            rowData,
            getRowId: (p) => p.data.id,
        });

        const initialOrder = ['Audi', 'BMW', 'Tesla'];
        const renderedKeys = () =>
            api
                .getRenderedNodes()
                .filter((n) => n.level === 0 && n.group)
                .map((n) => n.key);

        expect(renderedKeys()).toEqual(initialOrder);

        api.setGridOption('quickFilterText', 'BMW');
        expect(renderedKeys()).toEqual(['BMW']);

        api.setGridOption('quickFilterText', undefined);
        expect(renderedKeys()).toEqual(initialOrder);
    });

    test('updating a row without changing group does not change group order (groupMaintainOrder=false)', async () => {
        const rowData = [
            { id: '1', country: 'Ireland', athlete: 'I1' },
            { id: '2', country: 'Ireland', athlete: 'I2' },
            { id: '3', country: 'Italy', athlete: 'It1' },
            { id: '4', country: 'France', athlete: 'F1' },
        ];

        const api = gridsManager.createGrid('grid3', {
            columnDefs: [{ field: 'country', rowGroup: true, hide: true }, { field: 'athlete' }],
            autoGroupColumnDef: { headerName: 'Country' },
            animateRows: false,
            groupDefaultExpanded: -1,
            groupMaintainOrder: false,
            rowData,
            getRowId: (p) => p.data.id,
        });

        await new GridRows(api, 'initial').check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ LEAF_GROUP id:row-group-country-Ireland ag-Grid-AutoColumn:"Ireland"
            │ ├── LEAF id:1 country:"Ireland" athlete:"I1"
            │ └── LEAF id:2 country:"Ireland" athlete:"I2"
            ├─┬ LEAF_GROUP id:row-group-country-Italy ag-Grid-AutoColumn:"Italy"
            │ └── LEAF id:3 country:"Italy" athlete:"It1"
            └─┬ LEAF_GROUP id:row-group-country-France ag-Grid-AutoColumn:"France"
            · └── LEAF id:4 country:"France" athlete:"F1"
        `);

        applyTransactionChecked(api, { update: [{ id: '2', country: 'Ireland', athlete: 'I2-upd' }] });

        // Group order should remain the same even when groupMaintainOrder is false
        await new GridRows(api, 'after update').check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ LEAF_GROUP id:row-group-country-Ireland ag-Grid-AutoColumn:"Ireland"
            │ ├── LEAF id:1 country:"Ireland" athlete:"I1"
            │ └── LEAF id:2 country:"Ireland" athlete:"I2-upd"
            ├─┬ LEAF_GROUP id:row-group-country-Italy ag-Grid-AutoColumn:"Italy"
            │ └── LEAF id:3 country:"Italy" athlete:"It1"
            └─┬ LEAF_GROUP id:row-group-country-France ag-Grid-AutoColumn:"France"
            · └── LEAF id:4 country:"France" athlete:"F1"
        `);
    });

    test('leaf-column sort preserves group order (groupMaintainOrder=true)', async () => {
        const rowData = [
            { id: '1', country: 'Ireland', athlete: 'Zed' },
            { id: '2', country: 'Italy', athlete: 'Ann' },
            { id: '3', country: 'France', athlete: 'Mike' },
        ];

        const api = gridsManager.createGrid('grid4', {
            columnDefs: [
                { field: 'country', rowGroup: true, hide: true },
                { field: 'athlete', sortable: true },
            ],
            autoGroupColumnDef: { headerName: 'Country' },
            animateRows: false,
            groupDefaultExpanded: -1,
            groupMaintainOrder: true,
            rowData,
            getRowId: (p) => p.data.id,
        });

        await new GridRows(api, 'initial').check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ LEAF_GROUP id:row-group-country-Ireland ag-Grid-AutoColumn:"Ireland"
            │ └── LEAF id:1 country:"Ireland" athlete:"Zed"
            ├─┬ LEAF_GROUP id:row-group-country-Italy ag-Grid-AutoColumn:"Italy"
            │ └── LEAF id:2 country:"Italy" athlete:"Ann"
            └─┬ LEAF_GROUP id:row-group-country-France ag-Grid-AutoColumn:"France"
            · └── LEAF id:3 country:"France" athlete:"Mike"
        `);

        // Sort by a leaf column. Group order should remain insertion order.
        api.applyColumnState({ state: [{ colId: 'athlete', sort: 'asc' }] });

        await new GridRows(api, 'leaf sort asc preserves group order').check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ LEAF_GROUP id:row-group-country-Ireland ag-Grid-AutoColumn:"Ireland"
            │ └── LEAF id:1 country:"Ireland" athlete:"Zed"
            ├─┬ LEAF_GROUP id:row-group-country-Italy ag-Grid-AutoColumn:"Italy"
            │ └── LEAF id:2 country:"Italy" athlete:"Ann"
            └─┬ LEAF_GROUP id:row-group-country-France ag-Grid-AutoColumn:"France"
            · └── LEAF id:3 country:"France" athlete:"Mike"
        `);
    });

    test('group-column sort reorders groups (sorting coupled)', async () => {
        const rowData = [
            { id: '1', country: 'Ireland', athlete: 'A' },
            { id: '2', country: 'Italy', athlete: 'B' },
            { id: '3', country: 'France', athlete: 'C' },
        ];

        const api = gridsManager.createGrid('grid5', {
            columnDefs: [
                { field: 'country', rowGroup: true, hide: true, sortable: true },
                { field: 'athlete', sortable: true },
            ],
            autoGroupColumnDef: { headerName: 'Country' },
            animateRows: false,
            groupDefaultExpanded: -1,
            groupMaintainOrder: true,
            rowData,
            getRowId: (p) => p.data.id,
        });

        await new GridRows(api, 'initial').check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ LEAF_GROUP id:row-group-country-Ireland ag-Grid-AutoColumn:"Ireland"
            │ └── LEAF id:1 country:"Ireland" athlete:"A"
            ├─┬ LEAF_GROUP id:row-group-country-Italy ag-Grid-AutoColumn:"Italy"
            │ └── LEAF id:2 country:"Italy" athlete:"B"
            └─┬ LEAF_GROUP id:row-group-country-France ag-Grid-AutoColumn:"France"
            · └── LEAF id:3 country:"France" athlete:"C"
        `);

        // Sort by the primary grouped column; groups should reorder alphabetically: France, Ireland, Italy
        api.applyColumnState({ state: [{ colId: 'country', sort: 'asc' }] });

        await new GridRows(api, 'group sort asc').check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ LEAF_GROUP id:row-group-country-France ag-Grid-AutoColumn:"France"
            │ └── LEAF id:3 country:"France" athlete:"C"
            ├─┬ LEAF_GROUP id:row-group-country-Ireland ag-Grid-AutoColumn:"Ireland"
            │ └── LEAF id:1 country:"Ireland" athlete:"A"
            └─┬ LEAF_GROUP id:row-group-country-Italy ag-Grid-AutoColumn:"Italy"
            · └── LEAF id:2 country:"Italy" athlete:"B"
        `);

        // Change to desc: Italy, Ireland, France
        api.applyColumnState({ state: [{ colId: 'country', sort: 'desc' }] });

        await new GridRows(api, 'group sort desc').check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ LEAF_GROUP id:row-group-country-Italy ag-Grid-AutoColumn:"Italy"
            │ └── LEAF id:2 country:"Italy" athlete:"B"
            ├─┬ LEAF_GROUP id:row-group-country-Ireland ag-Grid-AutoColumn:"Ireland"
            │ └── LEAF id:1 country:"Ireland" athlete:"A"
            └─┬ LEAF_GROUP id:row-group-country-France ag-Grid-AutoColumn:"France"
            · └── LEAF id:3 country:"France" athlete:"C"
        `);
    });

    test('toggle from group sort to leaf sort preserves last group order', async () => {
        const rowData = [
            { id: '1', country: 'Ireland', athlete: 'Z' },
            { id: '2', country: 'Italy', athlete: 'A' },
            { id: '3', country: 'France', athlete: 'M' },
        ];

        const api = gridsManager.createGrid('grid6', {
            columnDefs: [
                { field: 'country', rowGroup: true, hide: true, sortable: true },
                { field: 'athlete', sortable: true },
            ],
            autoGroupColumnDef: { headerName: 'Country' },
            animateRows: false,
            groupDefaultExpanded: -1,
            groupMaintainOrder: true,
            rowData,
            getRowId: (p) => p.data.id,
        });

        await new GridRows(api, 'initial unsorted').check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ LEAF_GROUP id:row-group-country-Ireland ag-Grid-AutoColumn:"Ireland"
            │ └── LEAF id:1 country:"Ireland" athlete:"Z"
            ├─┬ LEAF_GROUP id:row-group-country-Italy ag-Grid-AutoColumn:"Italy"
            │ └── LEAF id:2 country:"Italy" athlete:"A"
            └─┬ LEAF_GROUP id:row-group-country-France ag-Grid-AutoColumn:"France"
            · └── LEAF id:3 country:"France" athlete:"M"
        `);

        // Force a group sort order first (desc): Italy, Ireland, France
        api.applyColumnState({ state: [{ colId: 'country', sort: 'desc' }] });
        await new GridRows(api, 'after group sort desc').check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ LEAF_GROUP id:row-group-country-Italy ag-Grid-AutoColumn:"Italy"
            │ └── LEAF id:2 country:"Italy" athlete:"A"
            ├─┬ LEAF_GROUP id:row-group-country-Ireland ag-Grid-AutoColumn:"Ireland"
            │ └── LEAF id:1 country:"Ireland" athlete:"Z"
            └─┬ LEAF_GROUP id:row-group-country-France ag-Grid-AutoColumn:"France"
            · └── LEAF id:3 country:"France" athlete:"M"
        `);

        // Now switch to a leaf sort; group order should remain the same
        api.applyColumnState({ state: [{ colId: 'athlete', sort: 'asc' }] });
        await new GridRows(api, 'leaf sort maintains last group order').check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ LEAF_GROUP id:row-group-country-Italy ag-Grid-AutoColumn:"Italy"
            │ └── LEAF id:2 country:"Italy" athlete:"A"
            ├─┬ LEAF_GROUP id:row-group-country-Ireland ag-Grid-AutoColumn:"Ireland"
            │ └── LEAF id:1 country:"Ireland" athlete:"Z"
            └─┬ LEAF_GROUP id:row-group-country-France ag-Grid-AutoColumn:"France"
            · └── LEAF id:3 country:"France" athlete:"M"
        `);
    });

    test('multi-level groupMaintainOrder: sort at one level only reorders that level', async () => {
        // Sibling levels keep structural order; only the targeted level reorders.
        const rowData = [
            { id: '1', country: 'Italy', year: 2021, sales: 100 },
            { id: '2', country: 'Italy', year: 2020, sales: 50 },
            { id: '3', country: 'France', year: 2019, sales: 200 },
            { id: '4', country: 'France', year: 2022, sales: 30 },
            { id: '5', country: 'USA', year: 2018, sales: 70 },
        ];

        const api = gridsManager.createGrid('grid-multi-level-sort', {
            columnDefs: [
                { field: 'country', rowGroup: true, hide: true },
                { field: 'year', rowGroup: true, hide: true },
                { field: 'sales' },
            ],
            autoGroupColumnDef: { headerName: 'Group' },
            animateRows: false,
            groupDefaultExpanded: -1,
            groupMaintainOrder: true,
            rowData,
            getRowId: (p) => p.data.id,
        });

        // Inner-level sort: countries stay structural; year groups sort asc inside each country.
        api.applyColumnState({ state: [{ colId: 'year', sort: 'asc' }] });
        await new GridRows(api, 'inner (year) sort').check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ filler id:row-group-country-Italy ag-Grid-AutoColumn:"Italy"
            │ ├─┬ LEAF_GROUP id:row-group-country-Italy-year-2020 ag-Grid-AutoColumn:2020
            │ │ └── LEAF id:2 country:"Italy" year:2020 sales:50
            │ └─┬ LEAF_GROUP id:row-group-country-Italy-year-2021 ag-Grid-AutoColumn:2021
            │ · └── LEAF id:1 country:"Italy" year:2021 sales:100
            ├─┬ filler id:row-group-country-France ag-Grid-AutoColumn:"France"
            │ ├─┬ LEAF_GROUP id:row-group-country-France-year-2019 ag-Grid-AutoColumn:2019
            │ │ └── LEAF id:3 country:"France" year:2019 sales:200
            │ └─┬ LEAF_GROUP id:row-group-country-France-year-2022 ag-Grid-AutoColumn:2022
            │ · └── LEAF id:4 country:"France" year:2022 sales:30
            └─┬ filler id:row-group-country-USA ag-Grid-AutoColumn:"USA"
            · └─┬ LEAF_GROUP id:row-group-country-USA-year-2018 ag-Grid-AutoColumn:2018
            · · └── LEAF id:5 country:"USA" year:2018 sales:70
        `);

        // Outer-level sort: countries reorder asc; years inside each country revert to structural.
        // Italy inserted as 2021→2020; France as 2019→2022.
        api.applyColumnState({
            state: [{ colId: 'country', sort: 'asc' }],
            defaultState: { sort: null },
        });
        await new GridRows(api, 'outer (country) sort').check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ filler id:row-group-country-France ag-Grid-AutoColumn:"France"
            │ ├─┬ LEAF_GROUP id:row-group-country-France-year-2019 ag-Grid-AutoColumn:2019
            │ │ └── LEAF id:3 country:"France" year:2019 sales:200
            │ └─┬ LEAF_GROUP id:row-group-country-France-year-2022 ag-Grid-AutoColumn:2022
            │ · └── LEAF id:4 country:"France" year:2022 sales:30
            ├─┬ filler id:row-group-country-Italy ag-Grid-AutoColumn:"Italy"
            │ ├─┬ LEAF_GROUP id:row-group-country-Italy-year-2021 ag-Grid-AutoColumn:2021
            │ │ └── LEAF id:1 country:"Italy" year:2021 sales:100
            │ └─┬ LEAF_GROUP id:row-group-country-Italy-year-2020 ag-Grid-AutoColumn:2020
            │ · └── LEAF id:2 country:"Italy" year:2020 sales:50
            └─┬ filler id:row-group-country-USA ag-Grid-AutoColumn:"USA"
            · └─┬ LEAF_GROUP id:row-group-country-USA-year-2018 ag-Grid-AutoColumn:2018
            · · └── LEAF id:5 country:"USA" year:2018 sales:70
        `);
    });

    test('multi-level groupMaintainOrder + secondary leaf sort: leaf rows sort inside each leaf group', async () => {
        // Sort = [country asc, athlete asc]: country level reorders, year level keeps
        // structural order, leaf rows inside each year group sort by athlete.
        const rowData = [
            { id: '1', country: 'Italy', year: 2021, athlete: 'Zed' },
            { id: '2', country: 'Italy', year: 2021, athlete: 'Anna' },
            { id: '3', country: 'France', year: 2019, athlete: 'Mark' },
            { id: '4', country: 'France', year: 2019, athlete: 'Bob' },
        ];

        const api = gridsManager.createGrid('grid-leaf-sort-secondary', {
            columnDefs: [
                { field: 'country', rowGroup: true, hide: true },
                { field: 'year', rowGroup: true, hide: true },
                { field: 'athlete' },
            ],
            autoGroupColumnDef: { headerName: 'Group' },
            animateRows: false,
            groupDefaultExpanded: -1,
            groupMaintainOrder: true,
            rowData,
            getRowId: (p) => p.data.id,
        });

        api.applyColumnState({
            state: [
                { colId: 'country', sort: 'asc', sortIndex: 0 },
                { colId: 'athlete', sort: 'asc', sortIndex: 1 },
            ],
        });

        await new GridRows(api, 'leaf-sort-secondary: country reorders, leaf rows sort by athlete').check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ filler id:row-group-country-France ag-Grid-AutoColumn:"France"
            │ └─┬ LEAF_GROUP id:row-group-country-France-year-2019 ag-Grid-AutoColumn:2019
            │ · ├── LEAF id:4 country:"France" year:2019 athlete:"Bob"
            │ · └── LEAF id:3 country:"France" year:2019 athlete:"Mark"
            └─┬ filler id:row-group-country-Italy ag-Grid-AutoColumn:"Italy"
            · └─┬ LEAF_GROUP id:row-group-country-Italy-year-2021 ag-Grid-AutoColumn:2021
            · · ├── LEAF id:2 country:"Italy" year:2021 athlete:"Anna"
            · · └── LEAF id:1 country:"Italy" year:2021 athlete:"Zed"
        `);
    });

    test('singleColumn + groupMaintainOrder: cascade-equivalent group sort reorders every level', async () => {
        // singleColumn (default) has one shared auto-display column. A header click cascades
        // the sort to every source rowGroup column — simulated here by applyColumnState on
        // both. With one display column there's no per-level distinction to express, so all
        // levels reorder.
        const rowData = [
            { id: '1', country: 'Italy', year: 2021, sales: 100 },
            { id: '2', country: 'Italy', year: 2020, sales: 50 },
            { id: '3', country: 'France', year: 2019, sales: 200 },
            { id: '4', country: 'France', year: 2022, sales: 30 },
        ];

        const api = gridsManager.createGrid('grid-single-col-cascade', {
            columnDefs: [
                { field: 'country', rowGroup: true, hide: true },
                { field: 'year', rowGroup: true, hide: true },
                { field: 'sales' },
            ],
            autoGroupColumnDef: { headerName: 'Group' },
            animateRows: false,
            groupDefaultExpanded: -1,
            groupMaintainOrder: true,
            rowData,
            getRowId: (p) => p.data.id,
        });

        // Cascade-equivalent: setSortForColumn would propagate to both source cols.
        api.applyColumnState({
            state: [
                { colId: 'country', sort: 'asc', sortIndex: 0 },
                { colId: 'year', sort: 'asc', sortIndex: 1 },
            ],
        });

        await new GridRows(api, 'singleColumn cascade: country and year both reorder').check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ filler id:row-group-country-France ag-Grid-AutoColumn:"France"
            │ ├─┬ LEAF_GROUP id:row-group-country-France-year-2019 ag-Grid-AutoColumn:2019
            │ │ └── LEAF id:3 country:"France" year:2019 sales:200
            │ └─┬ LEAF_GROUP id:row-group-country-France-year-2022 ag-Grid-AutoColumn:2022
            │ · └── LEAF id:4 country:"France" year:2022 sales:30
            └─┬ filler id:row-group-country-Italy ag-Grid-AutoColumn:"Italy"
            · ├─┬ LEAF_GROUP id:row-group-country-Italy-year-2020 ag-Grid-AutoColumn:2020
            · │ └── LEAF id:2 country:"Italy" year:2020 sales:50
            · └─┬ LEAF_GROUP id:row-group-country-Italy-year-2021 ag-Grid-AutoColumn:2021
            · · └── LEAF id:1 country:"Italy" year:2021 sales:100
        `);
    });

    test('multipleColumns + custom colId on rowGroup column: per-level isolation is preserved', async () => {
        // Each rowGroup column has a custom colId; multipleColumns generates one auto-display
        // column per level whose `showRowGroup` is the source colId. Locks in the unified
        // buildLevelSortTargeted lookup: matches source rowGroup columns by reference AND
        // auto-display columns by `colDef.showRowGroup`, regardless of coupling.
        const rowData = [
            { id: '1', country: 'Italy', year: 2021, sales: 100 },
            { id: '2', country: 'Italy', year: 2020, sales: 50 },
            { id: '3', country: 'France', year: 2019, sales: 200 },
            { id: '4', country: 'France', year: 2022, sales: 30 },
        ];

        const api = gridsManager.createGrid('grid-multi-cols-custom-colid', {
            columnDefs: [
                { colId: 'customCountry', field: 'country', rowGroup: true, hide: true },
                { colId: 'customYear', field: 'year', rowGroup: true, hide: true },
                { field: 'sales' },
            ],
            groupDisplayType: 'multipleColumns',
            animateRows: false,
            groupDefaultExpanded: -1,
            groupMaintainOrder: true,
            rowData,
            getRowId: (p) => p.data.id,
        });

        api.applyColumnState({ state: [{ colId: 'customYear', sort: 'asc' }] });

        // Country groups stay in structural order (Italy, France); year groups within each
        // country are sorted ascending.
        await new GridRows(api, 'multipleColumns: year sort respects per-level isolation').check(`
            ROOT id:ROOT_NODE_ID ag-Grid-AutoColumn-customCountry:null ag-Grid-AutoColumn-customYear:null
            ├─┬ filler id:row-group-customCountry-Italy ag-Grid-AutoColumn-customCountry:"Italy" ag-Grid-AutoColumn-customYear:null
            │ ├─┬ LEAF_GROUP id:row-group-customCountry-Italy-customYear-2020 ag-Grid-AutoColumn-customYear:2020
            │ │ └── LEAF id:2 customCountry:"Italy" customYear:2020 sales:50
            │ └─┬ LEAF_GROUP id:row-group-customCountry-Italy-customYear-2021 ag-Grid-AutoColumn-customYear:2021
            │ · └── LEAF id:1 customCountry:"Italy" customYear:2021 sales:100
            └─┬ filler id:row-group-customCountry-France ag-Grid-AutoColumn-customCountry:"France" ag-Grid-AutoColumn-customYear:null
            · ├─┬ LEAF_GROUP id:row-group-customCountry-France-customYear-2019 ag-Grid-AutoColumn-customYear:2019
            · │ └── LEAF id:3 customCountry:"France" customYear:2019 sales:200
            · └─┬ LEAF_GROUP id:row-group-customCountry-France-customYear-2022 ag-Grid-AutoColumn-customYear:2022
            · · └── LEAF id:4 customCountry:"France" customYear:2022 sales:30
        `);

        // The auto-display column for year inherits the linked customYear sort indicator
        // visually (aria-sort=ascending in DOM, validated by GridColumnsDomValidator), but its
        // own colDef has no sort, so the diagram shows no sort tag here.
        await new GridColumns(api, 'multipleColumns: auto-display columns + sales').checkColumns(`
            CENTER
            ├── ag-Grid-AutoColumn-customCountry "Country" width:200
            ├── ag-Grid-AutoColumn-customYear "Year" width:200
            └── sales "Sales" width:200
        `);
    });

    test('clearing a filter restores the original group order', async () => {
        // After a filter narrows the data to a single non-first group, clearing the filter must
        // restore every group to its original slot, not move the surviving group to the end.
        const rowData = [
            { id: '1', country: 'Ireland', athlete: 'I1' },
            { id: '2', country: 'Italy', athlete: 'T1' },
            { id: '3', country: 'France', athlete: 'F1' },
            { id: '4', country: 'Spain', athlete: 'S1' },
        ];

        const api = gridsManager.createGrid('grid-filter-reset', {
            columnDefs: [{ field: 'country', rowGroup: true, hide: true }, { field: 'athlete' }],
            autoGroupColumnDef: { headerName: 'Country' },
            animateRows: false,
            groupDefaultExpanded: -1,
            groupMaintainOrder: true,
            rowData,
            getRowId: (p) => p.data.id,
        });

        api.setGridOption('quickFilterText', 'T1');
        await new GridRows(api, 'after filter to Italy only').check(`
            ROOT id:ROOT_NODE_ID
            └─┬ LEAF_GROUP id:row-group-country-Italy ag-Grid-AutoColumn:"Italy"
            · └── LEAF id:2 country:"Italy" athlete:"T1"
        `);

        api.setGridOption('quickFilterText', undefined);
        await new GridRows(api, 'after clearing filter — original order').check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ LEAF_GROUP id:row-group-country-Ireland ag-Grid-AutoColumn:"Ireland"
            │ └── LEAF id:1 country:"Ireland" athlete:"I1"
            ├─┬ LEAF_GROUP id:row-group-country-Italy ag-Grid-AutoColumn:"Italy"
            │ └── LEAF id:2 country:"Italy" athlete:"T1"
            ├─┬ LEAF_GROUP id:row-group-country-France ag-Grid-AutoColumn:"France"
            │ └── LEAF id:3 country:"France" athlete:"F1"
            └─┬ LEAF_GROUP id:row-group-country-Spain ag-Grid-AutoColumn:"Spain"
            · └── LEAF id:4 country:"Spain" athlete:"S1"
        `);
    });

    test('filter cycle interleaved with add / update / remove transactions', async () => {
        const rowData = [
            { id: '1', country: 'Audi', athlete: 'Anna' },
            { id: '2', country: 'BMW', athlete: 'Bert' },
            { id: '3', country: 'Tesla', athlete: 'Tim' },
        ];

        const api = gridsManager.createGrid('grid-stress', {
            columnDefs: [{ field: 'country', rowGroup: true, hide: true }, { field: 'athlete' }],
            autoGroupColumnDef: { headerName: 'Country' },
            animateRows: false,
            groupDefaultExpanded: -1,
            groupMaintainOrder: true,
            rowData,
            getRowId: (p) => p.data.id,
        });

        await new GridRows(api, 'stress: initial').check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ LEAF_GROUP id:row-group-country-Audi ag-Grid-AutoColumn:"Audi"
            │ └── LEAF id:1 country:"Audi" athlete:"Anna"
            ├─┬ LEAF_GROUP id:row-group-country-BMW ag-Grid-AutoColumn:"BMW"
            │ └── LEAF id:2 country:"BMW" athlete:"Bert"
            └─┬ LEAF_GROUP id:row-group-country-Tesla ag-Grid-AutoColumn:"Tesla"
            · └── LEAF id:3 country:"Tesla" athlete:"Tim"
        `);

        api.setGridOption('quickFilterText', 'Tim');
        await new GridRows(api, 'stress: filter Tesla').check(`
            ROOT id:ROOT_NODE_ID
            └─┬ LEAF_GROUP id:row-group-country-Tesla ag-Grid-AutoColumn:"Tesla"
            · └── LEAF id:3 country:"Tesla" athlete:"Tim"
        `);

        applyTransactionChecked(api, { add: [{ id: '4', country: 'Volvo', athlete: 'Timmy' }] });
        await new GridRows(api, 'stress: add Volvo (visible) while filtered').check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ LEAF_GROUP id:row-group-country-Tesla ag-Grid-AutoColumn:"Tesla"
            │ └── LEAF id:3 country:"Tesla" athlete:"Tim"
            └─┬ LEAF_GROUP id:row-group-country-Volvo ag-Grid-AutoColumn:"Volvo"
            · └── LEAF id:4 country:"Volvo" athlete:"Timmy"
        `);

        applyTransactionChecked(api, { update: [{ id: '1', country: 'Audi', athlete: 'Anna-upd' }] });
        await new GridRows(api, 'stress: update hidden Audi while filtered').check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ LEAF_GROUP id:row-group-country-Tesla ag-Grid-AutoColumn:"Tesla"
            │ └── LEAF id:3 country:"Tesla" athlete:"Tim"
            └─┬ LEAF_GROUP id:row-group-country-Volvo ag-Grid-AutoColumn:"Volvo"
            · └── LEAF id:4 country:"Volvo" athlete:"Timmy"
        `);

        applyTransactionChecked(api, { remove: [{ id: '2', country: 'BMW', athlete: 'Bert' }] });
        await new GridRows(api, 'stress: remove hidden BMW while filtered').check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ LEAF_GROUP id:row-group-country-Tesla ag-Grid-AutoColumn:"Tesla"
            │ └── LEAF id:3 country:"Tesla" athlete:"Tim"
            └─┬ LEAF_GROUP id:row-group-country-Volvo ag-Grid-AutoColumn:"Volvo"
            · └── LEAF id:4 country:"Volvo" athlete:"Timmy"
        `);

        api.setGridOption('quickFilterText', undefined);
        await new GridRows(api, 'stress: clear filter — original positions restored').check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ LEAF_GROUP id:row-group-country-Audi ag-Grid-AutoColumn:"Audi"
            │ └── LEAF id:1 country:"Audi" athlete:"Anna-upd"
            ├─┬ LEAF_GROUP id:row-group-country-Tesla ag-Grid-AutoColumn:"Tesla"
            │ └── LEAF id:3 country:"Tesla" athlete:"Tim"
            └─┬ LEAF_GROUP id:row-group-country-Volvo ag-Grid-AutoColumn:"Volvo"
            · └── LEAF id:4 country:"Volvo" athlete:"Timmy"
        `);
    });

    test('initialGroupOrderComparator + groupMaintainOrder + filter cycle', async () => {
        // Data order is Tesla, BMW, Audi — the comparator should override it to alphabetical.
        const rowData = [
            { id: '1', country: 'Tesla', athlete: 'Tim' },
            { id: '2', country: 'BMW', athlete: 'Bert' },
            { id: '3', country: 'Audi', athlete: 'Anna' },
        ];

        const api = gridsManager.createGrid('grid-comparator', {
            columnDefs: [{ field: 'country', rowGroup: true, hide: true }, { field: 'athlete' }],
            autoGroupColumnDef: { headerName: 'Country' },
            animateRows: false,
            groupDefaultExpanded: -1,
            groupMaintainOrder: true,
            initialGroupOrderComparator: ({ nodeA, nodeB }) => (nodeA.key! < nodeB.key! ? -1 : 1),
            rowData,
            getRowId: (p) => p.data.id,
        });

        await new GridRows(api, 'comparator: initial alphabetical order').check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ LEAF_GROUP id:row-group-country-Audi ag-Grid-AutoColumn:"Audi"
            │ └── LEAF id:3 country:"Audi" athlete:"Anna"
            ├─┬ LEAF_GROUP id:row-group-country-BMW ag-Grid-AutoColumn:"BMW"
            │ └── LEAF id:2 country:"BMW" athlete:"Bert"
            └─┬ LEAF_GROUP id:row-group-country-Tesla ag-Grid-AutoColumn:"Tesla"
            · └── LEAF id:1 country:"Tesla" athlete:"Tim"
        `);

        api.setGridOption('quickFilterText', 'Tim');
        await new GridRows(api, 'comparator: filter Tesla only').check(`
            ROOT id:ROOT_NODE_ID
            └─┬ LEAF_GROUP id:row-group-country-Tesla ag-Grid-AutoColumn:"Tesla"
            · └── LEAF id:1 country:"Tesla" athlete:"Tim"
        `);

        api.setGridOption('quickFilterText', undefined);
        await new GridRows(api, 'comparator: clear filter — alphabetical order restored').check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ LEAF_GROUP id:row-group-country-Audi ag-Grid-AutoColumn:"Audi"
            │ └── LEAF id:3 country:"Audi" athlete:"Anna"
            ├─┬ LEAF_GROUP id:row-group-country-BMW ag-Grid-AutoColumn:"BMW"
            │ └── LEAF id:2 country:"BMW" athlete:"Bert"
            └─┬ LEAF_GROUP id:row-group-country-Tesla ag-Grid-AutoColumn:"Tesla"
            · └── LEAF id:1 country:"Tesla" athlete:"Tim"
        `);

        // A transaction-added group is placed at its comparator position, not appended at the end.
        applyTransactionChecked(api, { add: [{ id: '4', country: 'Acura', athlete: 'Alex' }] });
        await new GridRows(api, 'comparator: add Acura via transaction — sorted alphabetically').check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ LEAF_GROUP id:row-group-country-Acura ag-Grid-AutoColumn:"Acura"
            │ └── LEAF id:4 country:"Acura" athlete:"Alex"
            ├─┬ LEAF_GROUP id:row-group-country-Audi ag-Grid-AutoColumn:"Audi"
            │ └── LEAF id:3 country:"Audi" athlete:"Anna"
            ├─┬ LEAF_GROUP id:row-group-country-BMW ag-Grid-AutoColumn:"BMW"
            │ └── LEAF id:2 country:"BMW" athlete:"Bert"
            └─┬ LEAF_GROUP id:row-group-country-Tesla ag-Grid-AutoColumn:"Tesla"
            · └── LEAF id:1 country:"Tesla" athlete:"Tim"
        `);
    });

    test('after filtering removes a group, adding a new group appends at end', async () => {
        const rowData = [
            { id: '1', country: 'Ireland', athlete: 'I1' },
            { id: '2', country: 'Italy', athlete: 'T1' },
            { id: '3', country: 'France', athlete: 'F1' },
        ];

        const api = gridsManager.createGrid('grid7', {
            columnDefs: [{ field: 'country', rowGroup: true, hide: true }, { field: 'athlete' }],
            autoGroupColumnDef: { headerName: 'Country' },
            animateRows: false,
            groupDefaultExpanded: -1,
            groupMaintainOrder: true,
            rowData,
            getRowId: (p) => p.data.id,
        });

        await new GridRows(api, 'initial').check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ LEAF_GROUP id:row-group-country-Ireland ag-Grid-AutoColumn:"Ireland"
            │ └── LEAF id:1 country:"Ireland" athlete:"I1"
            ├─┬ LEAF_GROUP id:row-group-country-Italy ag-Grid-AutoColumn:"Italy"
            │ └── LEAF id:2 country:"Italy" athlete:"T1"
            └─┬ LEAF_GROUP id:row-group-country-France ag-Grid-AutoColumn:"France"
            · └── LEAF id:3 country:"France" athlete:"F1"
        `);

        // Filter out Italy group entirely
        api.setGridOption('quickFilterText', 'I1'); // shows only Ireland
        await new GridRows(api, 'after filter Ireland only').check(`
            ROOT id:ROOT_NODE_ID
            └─┬ LEAF_GROUP id:row-group-country-Ireland ag-Grid-AutoColumn:"Ireland"
            · └── LEAF id:1 country:"Ireland" athlete:"I1"
        `);

        // Clear filter and add a new country; new group must append after prior order (Ire, Ita, Fra, then new Spain)
        api.setGridOption('quickFilterText', undefined);
        applyTransactionChecked(api, { add: [{ id: '4', country: 'Spain', athlete: 'S1' }] });

        await new GridRows(api, 'after add Spain').check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ LEAF_GROUP id:row-group-country-Ireland ag-Grid-AutoColumn:"Ireland"
            │ └── LEAF id:1 country:"Ireland" athlete:"I1"
            ├─┬ LEAF_GROUP id:row-group-country-Italy ag-Grid-AutoColumn:"Italy"
            │ └── LEAF id:2 country:"Italy" athlete:"T1"
            ├─┬ LEAF_GROUP id:row-group-country-France ag-Grid-AutoColumn:"France"
            │ └── LEAF id:3 country:"France" athlete:"F1"
            └─┬ LEAF_GROUP id:row-group-country-Spain ag-Grid-AutoColumn:"Spain"
            · └── LEAF id:4 country:"Spain" athlete:"S1"
        `);
    });

    test('after removing a group, adding a new group appends at end (sentinel append)', async () => {
        const rowData = [
            { id: '1', country: 'Ireland', athlete: 'I1' },
            { id: '2', country: 'Italy', athlete: 'It1' },
            { id: '3', country: 'France', athlete: 'F1' },
        ];

        const api = gridsManager.createGrid('grid8', {
            columnDefs: [{ field: 'country', rowGroup: true, hide: true }, { field: 'athlete' }],
            autoGroupColumnDef: { headerName: 'Country' },
            animateRows: false,
            groupDefaultExpanded: -1,
            groupMaintainOrder: true,
            rowData,
            getRowId: (p) => p.data.id,
        });

        await new GridRows(api, 'initial').check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ LEAF_GROUP id:row-group-country-Ireland ag-Grid-AutoColumn:"Ireland"
            │ └── LEAF id:1 country:"Ireland" athlete:"I1"
            ├─┬ LEAF_GROUP id:row-group-country-Italy ag-Grid-AutoColumn:"Italy"
            │ └── LEAF id:2 country:"Italy" athlete:"It1"
            └─┬ LEAF_GROUP id:row-group-country-France ag-Grid-AutoColumn:"France"
            · └── LEAF id:3 country:"France" athlete:"F1"
        `);

        // Remove the middle group (Italy)
        applyTransactionChecked(api, { remove: [{ id: '2', country: 'Italy', athlete: 'It1' }] });

        await new GridRows(api, 'after remove Italy').check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ LEAF_GROUP id:row-group-country-Ireland ag-Grid-AutoColumn:"Ireland"
            │ └── LEAF id:1 country:"Ireland" athlete:"I1"
            └─┬ LEAF_GROUP id:row-group-country-France ag-Grid-AutoColumn:"France"
            · └── LEAF id:3 country:"France" athlete:"F1"
        `);

        // Add a new group (Spain) - should append at end
        applyTransactionChecked(api, { add: [{ id: '4', country: 'Spain', athlete: 'S1' }] });

        await new GridRows(api, 'after add Spain').check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ LEAF_GROUP id:row-group-country-Ireland ag-Grid-AutoColumn:"Ireland"
            │ └── LEAF id:1 country:"Ireland" athlete:"I1"
            ├─┬ LEAF_GROUP id:row-group-country-France ag-Grid-AutoColumn:"France"
            │ └── LEAF id:3 country:"France" athlete:"F1"
            └─┬ LEAF_GROUP id:row-group-country-Spain ag-Grid-AutoColumn:"Spain"
            · └── LEAF id:4 country:"Spain" athlete:"S1"
        `);
    });

    test('apply group sort then clear: structural order is restored, not the prior sorted order', async () => {
        // Locks the docs contract: "If a group column was sorted via colDef.sort and the user
        // later explicitly clears that sort, the structural order is restored." After a desc
        // sort on country reorders to [Italy, France, Audi], clearing the sort must put groups
        // back to their structural slots [Audi, France, Italy] — NOT keep the desc order as a
        // sticky baseline. The previously-sorted childrenAfterSort and the structural
        // childrenAfterAggFilter differ by position, so _reuseArrayIfEqual takes the fresh-slice
        // branch and the structural baseline wins.
        const rowData = [
            { id: '1', country: 'Audi', athlete: 'A' },
            { id: '2', country: 'France', athlete: 'F' },
            { id: '3', country: 'Italy', athlete: 'I' },
        ];

        const api = gridsManager.createGrid('grid-clear-sort', {
            columnDefs: [{ field: 'country', rowGroup: true, hide: true, sortable: true }, { field: 'athlete' }],
            autoGroupColumnDef: { headerName: 'Country' },
            animateRows: false,
            groupDefaultExpanded: -1,
            groupMaintainOrder: true,
            rowData,
            getRowId: (p) => p.data.id,
        });

        await new GridRows(api, 'clear-sort: initial structural order').check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ LEAF_GROUP id:row-group-country-Audi ag-Grid-AutoColumn:"Audi"
            │ └── LEAF id:1 country:"Audi" athlete:"A"
            ├─┬ LEAF_GROUP id:row-group-country-France ag-Grid-AutoColumn:"France"
            │ └── LEAF id:2 country:"France" athlete:"F"
            └─┬ LEAF_GROUP id:row-group-country-Italy ag-Grid-AutoColumn:"Italy"
            · └── LEAF id:3 country:"Italy" athlete:"I"
        `);

        api.applyColumnState({ state: [{ colId: 'country', sort: 'desc' }] });
        await new GridRows(api, 'clear-sort: country desc reorders groups').check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ LEAF_GROUP id:row-group-country-Italy ag-Grid-AutoColumn:"Italy"
            │ └── LEAF id:3 country:"Italy" athlete:"I"
            ├─┬ LEAF_GROUP id:row-group-country-France ag-Grid-AutoColumn:"France"
            │ └── LEAF id:2 country:"France" athlete:"F"
            └─┬ LEAF_GROUP id:row-group-country-Audi ag-Grid-AutoColumn:"Audi"
            · └── LEAF id:1 country:"Audi" athlete:"A"
        `);

        api.applyColumnState({ state: [{ colId: 'country', sort: null }] });
        await new GridRows(api, 'clear-sort: structural order restored, not the prior desc order').check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ LEAF_GROUP id:row-group-country-Audi ag-Grid-AutoColumn:"Audi"
            │ └── LEAF id:1 country:"Audi" athlete:"A"
            ├─┬ LEAF_GROUP id:row-group-country-France ag-Grid-AutoColumn:"France"
            │ └── LEAF id:2 country:"France" athlete:"F"
            └─┬ LEAF_GROUP id:row-group-country-Italy ag-Grid-AutoColumn:"Italy"
            · └── LEAF id:3 country:"Italy" athlete:"I"
        `);
    });

    test('deltaSort + groupMaintainOrder: per-level isolation holds across transactions', async () => {
        // With deltaSort on, transactions hit _doDeltaSort at sortable levels (leaf groups when
        // a leaf-column sort is active) and the structural baseline elsewhere. The per-level
        // isolation contract must still hold: country and year groups stay in structural
        // (data-insertion) order, leaf rows sort within each leaf group, and a transaction-added
        // row lands in its sorted leaf-row position without disturbing group order.
        const rowData = [
            { id: '1', country: 'Italy', year: 2021, athlete: 'Zed' },
            { id: '2', country: 'Italy', year: 2021, athlete: 'Anna' },
            { id: '3', country: 'France', year: 2019, athlete: 'Mark' },
            { id: '4', country: 'France', year: 2019, athlete: 'Bob' },
        ];

        const api = gridsManager.createGrid('grid-delta-sort', {
            columnDefs: [
                { field: 'country', rowGroup: true, hide: true },
                { field: 'year', rowGroup: true, hide: true },
                { field: 'athlete' },
            ],
            autoGroupColumnDef: { headerName: 'Group' },
            animateRows: false,
            groupDefaultExpanded: -1,
            groupMaintainOrder: true,
            deltaSort: true,
            rowData,
            getRowId: (p) => p.data.id,
        });

        api.applyColumnState({ state: [{ colId: 'athlete', sort: 'asc' }] });
        await new GridRows(api, 'deltaSort: leaf rows sort, country/year groups stay structural').check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ filler id:row-group-country-Italy ag-Grid-AutoColumn:"Italy"
            │ └─┬ LEAF_GROUP id:row-group-country-Italy-year-2021 ag-Grid-AutoColumn:2021
            │ · ├── LEAF id:2 country:"Italy" year:2021 athlete:"Anna"
            │ · └── LEAF id:1 country:"Italy" year:2021 athlete:"Zed"
            └─┬ filler id:row-group-country-France ag-Grid-AutoColumn:"France"
            · └─┬ LEAF_GROUP id:row-group-country-France-year-2019 ag-Grid-AutoColumn:2019
            · · ├── LEAF id:4 country:"France" year:2019 athlete:"Bob"
            · · └── LEAF id:3 country:"France" year:2019 athlete:"Mark"
        `);

        // Transaction add: id=5 goes to Italy/2021. delta sort fires at the leaf group, structural
        // baseline stays at country and year levels. Bart sorts between Anna and Zed.
        applyTransactionChecked(api, { add: [{ id: '5', country: 'Italy', year: 2021, athlete: 'Bart' }] });
        await new GridRows(api, 'deltaSort: after add — Bart placed in sorted leaf position').check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ filler id:row-group-country-Italy ag-Grid-AutoColumn:"Italy"
            │ └─┬ LEAF_GROUP id:row-group-country-Italy-year-2021 ag-Grid-AutoColumn:2021
            │ · ├── LEAF id:2 country:"Italy" year:2021 athlete:"Anna"
            │ · ├── LEAF id:5 country:"Italy" year:2021 athlete:"Bart"
            │ · └── LEAF id:1 country:"Italy" year:2021 athlete:"Zed"
            └─┬ filler id:row-group-country-France ag-Grid-AutoColumn:"France"
            · └─┬ LEAF_GROUP id:row-group-country-France-year-2019 ag-Grid-AutoColumn:2019
            · · ├── LEAF id:4 country:"France" year:2019 athlete:"Bob"
            · · └── LEAF id:3 country:"France" year:2019 athlete:"Mark"
        `);

        // Update an athlete name to force a re-sort within the same leaf group; group order
        // must remain unchanged.
        applyTransactionChecked(api, {
            update: [{ id: '2', country: 'Italy', year: 2021, athlete: 'Yves' }],
        });
        await new GridRows(api, 'deltaSort: after update — re-sorted leaf, groups still structural').check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ filler id:row-group-country-Italy ag-Grid-AutoColumn:"Italy"
            │ └─┬ LEAF_GROUP id:row-group-country-Italy-year-2021 ag-Grid-AutoColumn:2021
            │ · ├── LEAF id:5 country:"Italy" year:2021 athlete:"Bart"
            │ · ├── LEAF id:2 country:"Italy" year:2021 athlete:"Yves"
            │ · └── LEAF id:1 country:"Italy" year:2021 athlete:"Zed"
            └─┬ filler id:row-group-country-France ag-Grid-AutoColumn:"France"
            · └─┬ LEAF_GROUP id:row-group-country-France-year-2019 ag-Grid-AutoColumn:2019
            · · ├── LEAF id:4 country:"France" year:2019 athlete:"Bob"
            · · └── LEAF id:3 country:"France" year:2019 athlete:"Mark"
        `);
    });

    test('deltaSort + postSortRows-pinned group + transactions: per-level baseline integrity', async () => {
        // _doDeltaSort consumes rowNode.childrenAfterSort as its prior baseline. Group levels
        // with no sort options use _reuseArrayIfEqual to publish the structural baseline;
        // postSortRows may then mutate that array in place to pin a group, leaving
        // childrenAfterSort in non-structural (visual) order. On the NEXT refresh:
        //   - For the no-sort group level: the comparison `prev !== aggFilter` causes
        //     _reuseArrayIfEqual to fall back to a fresh slice of aggFilter, restoring the
        //     structural baseline (then postSortRows reapplies the pin on top).
        //   - For the sort-active leaf level: _doDeltaSort is unaffected by the group level's
        //     visual order — leaf children are unrelated nodes.
        // The contract: an idempotent postSortRows pin at the group level remains stable across
        // transactions, and delta-sort transactions on leaf rows place rows in their sorted slots.
        const rowData = [
            { id: '1', country: 'Italy', athlete: 'Mark' },
            { id: '2', country: 'France', athlete: 'Bob' },
            { id: '3', country: 'Italy', athlete: 'Anna' },
            { id: '4', country: 'France', athlete: 'Zed' },
        ];

        const api = gridsManager.createGrid('grid-delta-postsort', {
            columnDefs: [{ field: 'country', rowGroup: true, hide: true }, { field: 'athlete' }],
            autoGroupColumnDef: { headerName: 'Country' },
            animateRows: false,
            groupDefaultExpanded: -1,
            groupMaintainOrder: true,
            deltaSort: true,
            rowData,
            getRowId: (p) => p.data.id,
            postSortRows: (params) => {
                // Idempotent group-level pin: keep group with key 'Italy' first if present.
                // Per-leaf-group postSortRows calls also fire; for those, no node has key 'Italy'
                // (leaves have key=null), so this is a no-op there.
                const idx = params.nodes.findIndex((n) => n.key === 'Italy');
                if (idx > 0) {
                    const [pinned] = params.nodes.splice(idx, 1);
                    params.nodes.unshift(pinned);
                }
            },
        });

        api.applyColumnState({ state: [{ colId: 'athlete', sort: 'asc' }] });

        // Per-level isolation: country level uses no-sort branch (postSortRows pins Italy first);
        // leaf level full-sorts by athlete asc.
        await new GridRows(api, 'delta+postSort: initial — Italy pinned, leaves sorted').check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ LEAF_GROUP id:row-group-country-Italy ag-Grid-AutoColumn:"Italy"
            │ ├── LEAF id:3 country:"Italy" athlete:"Anna"
            │ └── LEAF id:1 country:"Italy" athlete:"Mark"
            └─┬ LEAF_GROUP id:row-group-country-France ag-Grid-AutoColumn:"France"
            · ├── LEAF id:2 country:"France" athlete:"Bob"
            · └── LEAF id:4 country:"France" athlete:"Zed"
        `);

        // Transaction add hits delta sort at the France leaf group. Country level uses the no-sort
        // branch + Italy pin again. New row (Carl) sorts between Bob and Zed in France.
        applyTransactionChecked(api, { add: [{ id: '5', country: 'France', athlete: 'Carl' }] });
        await new GridRows(api, 'delta+postSort: add — Carl placed in sorted slot, Italy still pinned').check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ LEAF_GROUP id:row-group-country-Italy ag-Grid-AutoColumn:"Italy"
            │ ├── LEAF id:3 country:"Italy" athlete:"Anna"
            │ └── LEAF id:1 country:"Italy" athlete:"Mark"
            └─┬ LEAF_GROUP id:row-group-country-France ag-Grid-AutoColumn:"France"
            · ├── LEAF id:2 country:"France" athlete:"Bob"
            · ├── LEAF id:5 country:"France" athlete:"Carl"
            · └── LEAF id:4 country:"France" athlete:"Zed"
        `);

        // Update Italy/Mark to athlete='Yann'. Delta sort re-sorts the Italy leaves.
        // Country level still pins Italy first via postSortRows.
        applyTransactionChecked(api, { update: [{ id: '1', country: 'Italy', athlete: 'Yann' }] });
        await new GridRows(api, 'delta+postSort: update reorders Italy leaves, Italy still pinned').check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ LEAF_GROUP id:row-group-country-Italy ag-Grid-AutoColumn:"Italy"
            │ ├── LEAF id:3 country:"Italy" athlete:"Anna"
            │ └── LEAF id:1 country:"Italy" athlete:"Yann"
            └─┬ LEAF_GROUP id:row-group-country-France ag-Grid-AutoColumn:"France"
            · ├── LEAF id:2 country:"France" athlete:"Bob"
            · ├── LEAF id:5 country:"France" athlete:"Carl"
            · └── LEAF id:4 country:"France" athlete:"Zed"
        `);
    });

    test('display column with own data (uncoupled): sort routes to leaf-row data only', async () => {
        // Reviewer P2 [DA]: when the auto-display column has its own field/valueGetter and the
        // user sorts that column, `buildLevelSortOptions` routes the option to the leaf-row bucket
        // (not cascaded to group levels). This matches `getDisplaySortForColumn`'s
        // `columnHasUniqueData` semantics: the sort applies to the column's own data on leaf rows.
        // Group rows return undefined for their own sort path under coupled mode and are not
        // tie-broken by the display value here either, so group order stays structural.
        //
        // This test runs with autoGroupColumnDef.comparator set, which makes
        // _isColumnsSortingCoupledToGroup return false (UNCOUPLED). In uncoupled mode the sort
        // does NOT propagate to source rowGroup columns, so the routing-only-to-leaf is the
        // correct interpretation.
        const rowData = [
            { id: '1', country: 'Audi', athlete: 'A1', displayLabel: 'Z-display' },
            { id: '2', country: 'Audi', athlete: 'A2', displayLabel: 'A-display' },
            { id: '3', country: 'BMW', athlete: 'B1', displayLabel: 'M-display' },
        ];

        const api = gridsManager.createGrid('grid-display-uncoupled', {
            columnDefs: [{ field: 'country', rowGroup: true, hide: true }, { field: 'athlete' }],
            autoGroupColumnDef: {
                headerName: 'Group',
                showRowGroup: true,
                field: 'displayLabel',
                sortable: true,
                // Custom comparator on autoGroupColumnDef triggers UNCOUPLED mode in
                // _isColumnsSortingCoupledToGroup. The comparator runs for every sort
                // comparison (group rows AND leaf rows) since the colDef.comparator wins over
                // the default in `getComparatorFromColDef`. Group rows resolve `displayLabel`
                // to undefined (no `data` on group rows) so they tie 0; leaf rows compare their
                // string displayLabel values.
                comparator: (a: unknown, b: unknown) => {
                    const aStr = a == null ? '' : String(a);
                    const bStr = b == null ? '' : String(b);
                    return aStr < bStr ? -1 : aStr > bStr ? 1 : 0;
                },
            },
            animateRows: false,
            groupDefaultExpanded: -1,
            groupMaintainOrder: true,
            rowData,
            getRowId: (p) => p.data.id,
        });

        api.applyColumnState({ state: [{ colId: 'ag-Grid-AutoColumn', sort: 'asc' }] });

        // Group order stays structural (Audi, BMW); leaf rows inside Audi reorder by displayLabel
        // asc. If the sort had cascaded to group levels, Audi/BMW would also be subject to the
        // displayLabel comparison, but that route is excluded here.
        await new GridRows(api, 'display-uncoupled: leaf rows reorder, group order structural').check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ LEAF_GROUP id:row-group-country-Audi ag-Grid-AutoColumn:"Audi"
            │ ├── LEAF id:2 ag-Grid-AutoColumn:"A-display" country:"Audi" athlete:"A2"
            │ └── LEAF id:1 ag-Grid-AutoColumn:"Z-display" country:"Audi" athlete:"A1"
            └─┬ LEAF_GROUP id:row-group-country-BMW ag-Grid-AutoColumn:"BMW"
            · └── LEAF id:3 ag-Grid-AutoColumn:"M-display" country:"BMW" athlete:"B1"
        `);
    });

    test('treeData + groupMaintainOrder: per-level isolation does not apply, sort still runs', async () => {
        // `groupMaintainOrder` docs state "Has no effect on tree data". This test pins that
        // contract: with treeData=true and groupMaintainOrder=true, a sort on a leaf column
        // reorders ALL rows (groups and leaves) just as it would without groupMaintainOrder —
        // per-level isolation is bypassed. Tree data has no rowGroupCols (numLevels=0) and the
        // explicit treeData guard inside GroupSortStage falls through to the full-sort path. The
        // `_reuseArrayIfEqual` helper used on the no-sort branch is a memory optimisation only;
        // it does not change behaviour.
        const rowData = [
            { id: '1', path: ['Audi'], name: 'Audi' },
            { id: '2', path: ['Audi', 'A2'], name: 'A2' },
            { id: '3', path: ['Audi', 'A1'], name: 'A1' },
            { id: '4', path: ['BMW'], name: 'BMW' },
            { id: '5', path: ['BMW', 'B1'], name: 'B1' },
        ];

        const api = gridsManager.createGrid('grid-tree-data-maintain', {
            columnDefs: [{ field: 'name', sortable: true }],
            treeData: true,
            getDataPath: (data: any) => data.path,
            animateRows: false,
            groupDefaultExpanded: -1,
            groupMaintainOrder: true,
            rowData,
            getRowId: (p) => p.data.id,
        });

        // Initial: data-insertion order, with the children of Audi in their data order [A2, A1].
        await new GridRows(api, 'tree+maintain: initial structural').check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ Audi GROUP id:1 ag-Grid-AutoColumn:"Audi" name:"Audi"
            │ ├── A2 LEAF id:2 ag-Grid-AutoColumn:"A2" name:"A2"
            │ └── A1 LEAF id:3 ag-Grid-AutoColumn:"A1" name:"A1"
            └─┬ BMW GROUP id:4 ag-Grid-AutoColumn:"BMW" name:"BMW"
            · └── B1 LEAF id:5 ag-Grid-AutoColumn:"B1" name:"B1"
        `);

        // Sort by name asc — both top-level groups and their children reorder. Per-level
        // isolation does NOT apply: Audi vs BMW is alphabetised, and A1 vs A2 inside Audi
        // is alphabetised too. This is identical to groupMaintainOrder=false for tree data.
        api.applyColumnState({ state: [{ colId: 'name', sort: 'asc' }] });
        await new GridRows(api, 'tree+maintain: sort cascades — full reorder, no isolation').check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ Audi GROUP id:1 ag-Grid-AutoColumn:"Audi" name:"Audi"
            │ ├── A1 LEAF id:3 ag-Grid-AutoColumn:"A1" name:"A1"
            │ └── A2 LEAF id:2 ag-Grid-AutoColumn:"A2" name:"A2"
            └─┬ BMW GROUP id:4 ag-Grid-AutoColumn:"BMW" name:"BMW"
            · └── B1 LEAF id:5 ag-Grid-AutoColumn:"B1" name:"B1"
        `);

        // Clear sort — back to structural data-insertion order (no maintained "previous sorted"
        // baseline for tree data, just like groupMaintainOrder=false).
        api.applyColumnState({ state: [{ colId: 'name', sort: null }] });
        await new GridRows(api, 'tree+maintain: clear sort — structural order restored').check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ Audi GROUP id:1 ag-Grid-AutoColumn:"Audi" name:"Audi"
            │ ├── A2 LEAF id:2 ag-Grid-AutoColumn:"A2" name:"A2"
            │ └── A1 LEAF id:3 ag-Grid-AutoColumn:"A1" name:"A1"
            └─┬ BMW GROUP id:4 ag-Grid-AutoColumn:"BMW" name:"BMW"
            · └── B1 LEAF id:5 ag-Grid-AutoColumn:"B1" name:"B1"
        `);
    });
});
