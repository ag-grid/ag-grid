import { ClientSideRowModelModule, QuickFilterModule } from 'ag-grid-community';
import { PivotModule, RowGroupingModule } from 'ag-grid-enterprise';

import { GridColumns, GridRows, TestGridsManager, applyTransactionChecked } from '../test-utils';

describe('group order maintenance', () => {
    const gridsManager = new TestGridsManager({
        modules: [QuickFilterModule, ClientSideRowModelModule, RowGroupingModule, PivotModule],
    });

    afterEach(() => gridsManager.reset());

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
        // Locks the legacy AG-309 ordering: _updateRowNodeAfterSort runs before postSortRows,
        // so a callback that mutates params.nodes leaves the flags reflecting the input order.
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

    test('multi-level groupMaintainOrder: sort on inner level keeps outer level in structural order', async () => {
        // With multi-level row grouping (country / year), sorting `year` should:
        //  - re-order year groups within each country (year sort directly targets that level)
        //  - leave country groups in their structural order (country sort is not active)
        // Pre-fix behaviour reordered country groups by their first-leaf year — that's the bug
        // this test locks against.
        const rowData = [
            { id: '1', country: 'Italy', year: 2021, sales: 100 },
            { id: '2', country: 'Italy', year: 2020, sales: 50 },
            { id: '3', country: 'France', year: 2019, sales: 200 },
            { id: '4', country: 'France', year: 2022, sales: 30 },
            { id: '5', country: 'USA', year: 2018, sales: 70 },
        ];

        const api = gridsManager.createGrid('grid-multi-level-inner-sort', {
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

        api.applyColumnState({ state: [{ colId: 'year', sort: 'asc' }] });

        // Country groups stay in structural order; year groups inside each country are sorted asc.
        await new GridRows(api, 'multi-level: inner-level (year) sort').check(`
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
    });

    test('multi-level groupMaintainOrder: sort on outer level reorders only outer level', async () => {
        // Counterpart to the test above: sorting `country` should re-order country groups but
        // leave year groups within each country in structural (data-insertion) order.
        const rowData = [
            { id: '1', country: 'Italy', year: 2021, sales: 100 },
            { id: '2', country: 'Italy', year: 2020, sales: 50 },
            { id: '3', country: 'France', year: 2019, sales: 200 },
            { id: '4', country: 'France', year: 2022, sales: 30 },
            { id: '5', country: 'USA', year: 2018, sales: 70 },
        ];

        const api = gridsManager.createGrid('grid-multi-level-outer-sort', {
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

        api.applyColumnState({ state: [{ colId: 'country', sort: 'asc' }] });

        // Country groups sorted asc; year groups inside each country stay in structural order.
        // Italy was inserted as 2021, then 2020 → structural is [2021, 2020].
        // France was inserted as 2019, then 2022 → structural is [2019, 2022].
        await new GridRows(api, 'multi-level: outer-level (country) sort').check(`
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
});
