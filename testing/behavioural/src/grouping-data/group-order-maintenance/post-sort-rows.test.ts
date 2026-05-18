import { ClientSideRowModelModule, QuickFilterModule } from 'ag-grid-community';
import { RowGroupingModule } from 'ag-grid-enterprise';

import { GridRows, TestGridsManager } from '../../test-utils';

describe('group order maintenance / postSortRows', () => {
    const gridsManager = new TestGridsManager({
        modules: [QuickFilterModule, ClientSideRowModelModule, RowGroupingModule],
    });

    afterEach(() => gridsManager.reset());

    test('postSortRows + groupMaintainOrder: customisation reapplies through filter cycles', async () => {
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

        await new GridRows(api, 'baseline: structural order').check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ LEAF_GROUP id:row-group-country-Audi ag-Grid-AutoColumn:"Audi"
            │ └── LEAF id:1 country:"Audi" athlete:"A"
            ├─┬ LEAF_GROUP id:row-group-country-BMW ag-Grid-AutoColumn:"BMW"
            │ └── LEAF id:2 country:"BMW" athlete:"B"
            └─┬ LEAF_GROUP id:row-group-country-Tesla ag-Grid-AutoColumn:"Tesla"
            · └── LEAF id:3 country:"Tesla" athlete:"T"
        `);

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

    test('groupHideOpenParents + postSortRows reorder on reused-array path: first-child change is detected', async () => {
        const rowData = [
            { id: '1', country: 'Audi', athlete: 'A1' },
            { id: '2', country: 'Audi', athlete: 'A2' },
            { id: '3', country: 'BMW', athlete: 'B1' },
            { id: '4', country: 'BMW', athlete: 'B2' },
        ];

        let promoteId: string | null = null;
        const api = gridsManager.createGrid('grid-ghop-reuse-firstchild', {
            columnDefs: [{ field: 'country', rowGroup: true, hide: true }, { field: 'athlete' }],
            autoGroupColumnDef: { headerName: 'Country', cellRendererParams: { suppressCount: true } },
            animateRows: false,
            groupDefaultExpanded: -1,
            groupMaintainOrder: true,
            groupHideOpenParents: true,
            rowData,
            getRowId: (p) => p.data.id,
            postSortRows: (params) => {
                if (!promoteId) {
                    return;
                }
                const idx = params.nodes.findIndex((n) => n.id === promoteId);
                if (idx > 0) {
                    const [promoted] = params.nodes.splice(idx, 1);
                    params.nodes.unshift(promoted);
                }
            },
        });

        await new GridRows(api, 'groupHideOpenParents-reuse: initial structural').check(`
            ROOT id:ROOT_NODE_ID ag-Grid-AutoColumn-country:null
            ├── LEAF id:1 ag-Grid-AutoColumn-country:"Audi" country:"Audi" athlete:"A1"
            ├── LEAF id:2 country:"Audi" athlete:"A2"
            ├── LEAF id:3 ag-Grid-AutoColumn-country:"BMW" country:"BMW" athlete:"B1"
            └── LEAF id:4 country:"BMW" athlete:"B2"
        `);

        promoteId = '2';
        api.refreshClientSideRowModel('sort');
        await new GridRows(api, 'groupHideOpenParents-reuse: postSortRows promotes A2 inside Audi').check(`
            ROOT id:ROOT_NODE_ID ag-Grid-AutoColumn-country:null
            ├── LEAF id:2 ag-Grid-AutoColumn-country:"Audi" country:"Audi" athlete:"A2"
            ├── LEAF id:1 country:"Audi" athlete:"A1"
            ├── LEAF id:3 ag-Grid-AutoColumn-country:"BMW" country:"BMW" athlete:"B1"
            └── LEAF id:4 country:"BMW" athlete:"B2"
        `);

        api.refreshClientSideRowModel('sort');
        await new GridRows(api, 'groupHideOpenParents-reuse: idempotent re-refresh').check(`
            ROOT id:ROOT_NODE_ID ag-Grid-AutoColumn-country:null
            ├── LEAF id:2 ag-Grid-AutoColumn-country:"Audi" country:"Audi" athlete:"A2"
            ├── LEAF id:1 country:"Audi" athlete:"A1"
            ├── LEAF id:3 ag-Grid-AutoColumn-country:"BMW" country:"BMW" athlete:"B1"
            └── LEAF id:4 country:"BMW" athlete:"B2"
        `);

        promoteId = '4';
        api.refreshClientSideRowModel('sort');
        await new GridRows(api, 'groupHideOpenParents-reuse: switch promote to B2 inside BMW').check(`
            ROOT id:ROOT_NODE_ID ag-Grid-AutoColumn-country:null
            ├── LEAF id:1 ag-Grid-AutoColumn-country:"Audi" country:"Audi" athlete:"A1"
            ├── LEAF id:2 country:"Audi" athlete:"A2"
            ├── LEAF id:4 ag-Grid-AutoColumn-country:"BMW" country:"BMW" athlete:"B2"
            └── LEAF id:3 country:"BMW" athlete:"B1"
        `);

        promoteId = null;
        api.refreshClientSideRowModel('sort');
        await new GridRows(api, 'groupHideOpenParents-reuse: clear promotion — structural order restored').check(`
            ROOT id:ROOT_NODE_ID ag-Grid-AutoColumn-country:null
            ├── LEAF id:1 ag-Grid-AutoColumn-country:"Audi" country:"Audi" athlete:"A1"
            ├── LEAF id:2 country:"Audi" athlete:"A2"
            ├── LEAF id:3 ag-Grid-AutoColumn-country:"BMW" country:"BMW" athlete:"B1"
            └── LEAF id:4 country:"BMW" athlete:"B2"
        `);
    });
});
