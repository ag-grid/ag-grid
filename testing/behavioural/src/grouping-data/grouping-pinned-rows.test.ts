import { ClientSideRowModelModule, PaginationModule, PinnedRowModule } from 'ag-grid-community';
import type { GridApi, RowNode, RowPinnedType } from 'ag-grid-community';
import { RowGroupingModule } from 'ag-grid-enterprise';

import { GridColumns, GridRows, TestGridsManager, asyncSetTimeout } from '../test-utils';

function assertPinnedRows(api: GridApi, floating: NonNullable<RowPinnedType>, ids: any[]): void {
    const pinnedNodes: RowNode[] = [];
    api.forEachPinnedRow(floating, (node) => {
        pinnedNodes.push(node as RowNode);
    });

    expect(pinnedNodes).toHaveLength(ids.length);
    expect(pinnedNodes.map((p) => p.id)).toEqual(ids);
}

describe('ag-grid grouping pinned rows', () => {
    const gridsManager = new TestGridsManager({
        modules: [PinnedRowModule, ClientSideRowModelModule, RowGroupingModule, PaginationModule],
    });

    const columnDefs = [
        { field: 'country', rowGroup: true, hide: true },
        { field: 'sport' },
        { field: 'amount', aggFunc: 'sum' },
    ];

    const rowData = [
        { id: 'fr-paris', country: 'France', sport: 'football', amount: 100 },
        { id: 'fr-lyon', country: 'France', sport: 'rugby', amount: 200 },
        { id: 'de-berlin', country: 'Germany', sport: 'tennis', amount: 150 },
        { id: 'de-hamburg', country: 'Germany', sport: 'cricket', amount: 250 },
        { id: 'it-rome', country: 'Italy', sport: 'golf', amount: 300 },
    ];

    beforeEach(() => {
        gridsManager.reset();
    });

    afterEach(() => {
        gridsManager.reset();
    });

    test('pinned group row is unpinned when all its children are removed', async () => {
        const api = await gridsManager.createGridAndWait('myGrid', {
            columnDefs,
            rowData,
            groupDefaultExpanded: -1,
            enableRowPinning: true,
            isRowPinned: (node) => (node.group && node.key === 'France' ? 'top' : null),
            getRowId: (params) => params.data.id,
        });

        // Verify initial state - France group is pinned
        await new GridRows(api, 'initial').check(`
            PINNED_TOP id:t-top-row-group-country-France ag-Grid-AutoColumn:"France" amount:300
            ROOT id:ROOT_NODE_ID
            ├─┬ LEAF_GROUP id:row-group-country-France ag-Grid-AutoColumn:"France" amount:300
            │ ├── LEAF id:fr-paris country:"France" sport:"football" amount:100
            │ └── LEAF id:fr-lyon country:"France" sport:"rugby" amount:200
            ├─┬ LEAF_GROUP id:row-group-country-Germany ag-Grid-AutoColumn:"Germany" amount:400
            │ ├── LEAF id:de-berlin country:"Germany" sport:"tennis" amount:150
            │ └── LEAF id:de-hamburg country:"Germany" sport:"cricket" amount:250
            └─┬ LEAF_GROUP id:row-group-country-Italy ag-Grid-AutoColumn:"Italy" amount:300
            · └── LEAF id:it-rome country:"Italy" sport:"golf" amount:300
        `);

        expect(api.getPinnedTopRowCount()).toBe(1);
        const pinnedFrance = api.getPinnedTopRow(0);
        expect(pinnedFrance?.key).toBe('France');

        // Get reference to the source group
        const franceGroup = api.getRowNode('row-group-country-France');
        expect(franceGroup).toBeDefined();

        // Remove all France rows
        api.applyTransaction({
            remove: [{ id: 'fr-paris' }, { id: 'fr-lyon' }],
        });
        await asyncSetTimeout(10);

        // France group should be destroyed, and pinned row should be removed
        await new GridRows(api, 'after remove').check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ LEAF_GROUP id:row-group-country-Germany ag-Grid-AutoColumn:"Germany" amount:400
            │ ├── LEAF id:de-berlin country:"Germany" sport:"tennis" amount:150
            │ └── LEAF id:de-hamburg country:"Germany" sport:"cricket" amount:250
            └─┬ LEAF_GROUP id:row-group-country-Italy ag-Grid-AutoColumn:"Italy" amount:300
            · └── LEAF id:it-rome country:"Italy" sport:"golf" amount:300
        `);

        expect(api.getRowNode('row-group-country-France')).toBeUndefined();
        expect(api.getPinnedTopRowCount()).toBe(0);
        expect(franceGroup!.destroyed).toBe(true);

        await new GridColumns(api, 'columns').checkColumns(`
            CENTER
            ├── ag-Grid-AutoColumn "Group" width:200
            ├── sport "Sport" width:200
            └── amount "Amount" width:200 aggFunc:sum
        `);
    });

    test('pinned group row survives when some but not all children are removed', async () => {
        const api = await gridsManager.createGridAndWait('myGrid', {
            columnDefs,
            rowData,
            groupDefaultExpanded: -1,
            enableRowPinning: true,
            isRowPinned: (node) => (node.group && node.key === 'France' ? 'top' : null),
            getRowId: (params) => params.data.id,
        });

        // Verify initial state
        await new GridRows(api, 'initial').check(`
            PINNED_TOP id:t-top-row-group-country-France ag-Grid-AutoColumn:"France" amount:300
            ROOT id:ROOT_NODE_ID
            ├─┬ LEAF_GROUP id:row-group-country-France ag-Grid-AutoColumn:"France" amount:300
            │ ├── LEAF id:fr-paris country:"France" sport:"football" amount:100
            │ └── LEAF id:fr-lyon country:"France" sport:"rugby" amount:200
            ├─┬ LEAF_GROUP id:row-group-country-Germany ag-Grid-AutoColumn:"Germany" amount:400
            │ ├── LEAF id:de-berlin country:"Germany" sport:"tennis" amount:150
            │ └── LEAF id:de-hamburg country:"Germany" sport:"cricket" amount:250
            └─┬ LEAF_GROUP id:row-group-country-Italy ag-Grid-AutoColumn:"Italy" amount:300
            · └── LEAF id:it-rome country:"Italy" sport:"golf" amount:300
        `);

        expect(api.getPinnedTopRowCount()).toBe(1);
        const franceGroup = api.getRowNode('row-group-country-France');
        expect(franceGroup).toBeDefined();
        expect(franceGroup!.destroyed).toBe(false);

        // Remove one France row
        api.applyTransaction({
            remove: [{ id: 'fr-paris' }],
        });
        await asyncSetTimeout(10);

        // France group should still exist and be pinned
        await new GridRows(api, 'after remove').check(`
            PINNED_TOP id:t-top-row-group-country-France ag-Grid-AutoColumn:"France" amount:200
            ROOT id:ROOT_NODE_ID
            ├─┬ LEAF_GROUP id:row-group-country-France ag-Grid-AutoColumn:"France" amount:200
            │ └── LEAF id:fr-lyon country:"France" sport:"rugby" amount:200
            ├─┬ LEAF_GROUP id:row-group-country-Germany ag-Grid-AutoColumn:"Germany" amount:400
            │ ├── LEAF id:de-berlin country:"Germany" sport:"tennis" amount:150
            │ └── LEAF id:de-hamburg country:"Germany" sport:"cricket" amount:250
            └─┬ LEAF_GROUP id:row-group-country-Italy ag-Grid-AutoColumn:"Italy" amount:300
            · └── LEAF id:it-rome country:"Italy" sport:"golf" amount:300
        `);

        expect(api.getPinnedTopRowCount()).toBe(1);
        const pinnedFrance = api.getPinnedTopRow(0);
        expect(pinnedFrance?.key).toBe('France');
        // The source group should still be alive
        expect(franceGroup!.destroyed).toBe(false);

        await new GridColumns(api, 'columns').checkColumns(`
            CENTER
            ├── ag-Grid-AutoColumn "Group" width:200
            ├── sport "Sport" width:200
            └── amount "Amount" width:200 aggFunc:sum
        `);
    });

    test('multiple pinned group rows are unpinned when their groups are destroyed', async () => {
        const api = await gridsManager.createGridAndWait('myGrid', {
            columnDefs,
            rowData,
            groupDefaultExpanded: -1,
            enableRowPinning: true,
            isRowPinned: (node) => {
                if (!node.group) {
                    return null;
                }
                if (node.key === 'France') {
                    return 'top';
                }
                if (node.key === 'Germany') {
                    return 'bottom';
                }
                return null;
            },
            getRowId: (params) => params.data.id,
        });

        // Verify initial state
        await new GridRows(api, 'initial').check(`
            PINNED_TOP id:t-top-row-group-country-France ag-Grid-AutoColumn:"France" amount:300
            ROOT id:ROOT_NODE_ID
            ├─┬ LEAF_GROUP id:row-group-country-France ag-Grid-AutoColumn:"France" amount:300
            │ ├── LEAF id:fr-paris country:"France" sport:"football" amount:100
            │ └── LEAF id:fr-lyon country:"France" sport:"rugby" amount:200
            ├─┬ LEAF_GROUP id:row-group-country-Germany ag-Grid-AutoColumn:"Germany" amount:400
            │ ├── LEAF id:de-berlin country:"Germany" sport:"tennis" amount:150
            │ └── LEAF id:de-hamburg country:"Germany" sport:"cricket" amount:250
            └─┬ LEAF_GROUP id:row-group-country-Italy ag-Grid-AutoColumn:"Italy" amount:300
            · └── LEAF id:it-rome country:"Italy" sport:"golf" amount:300
            PINNED_BOTTOM id:b-bottom-row-group-country-Germany ag-Grid-AutoColumn:"Germany" amount:400
        `);

        expect(api.getPinnedTopRowCount()).toBe(1);
        expect(api.getPinnedBottomRowCount()).toBe(1);

        // Remove all France and Germany rows
        api.applyTransaction({
            remove: [{ id: 'fr-paris' }, { id: 'fr-lyon' }, { id: 'de-berlin' }, { id: 'de-hamburg' }],
        });
        await asyncSetTimeout(10);

        // Both pinned rows should be removed
        await new GridRows(api, 'after remove').check(`
            ROOT id:ROOT_NODE_ID
            └─┬ LEAF_GROUP id:row-group-country-Italy ag-Grid-AutoColumn:"Italy" amount:300
            · └── LEAF id:it-rome country:"Italy" sport:"golf" amount:300
        `);

        expect(api.getPinnedTopRowCount()).toBe(0);
        expect(api.getPinnedBottomRowCount()).toBe(0);
    });

    test('pinned group row is unpinned when group is destroyed via setRowData', async () => {
        const api = await gridsManager.createGridAndWait('myGrid', {
            columnDefs,
            rowData,
            groupDefaultExpanded: -1,
            enableRowPinning: true,
            isRowPinned: (node) => (node.group && node.key === 'France' ? 'top' : null),
            getRowId: (params) => params.data.id,
        });

        // Verify initial state
        await new GridRows(api, 'initial').check(`
            PINNED_TOP id:t-top-row-group-country-France ag-Grid-AutoColumn:"France" amount:300
            ROOT id:ROOT_NODE_ID
            ├─┬ LEAF_GROUP id:row-group-country-France ag-Grid-AutoColumn:"France" amount:300
            │ ├── LEAF id:fr-paris country:"France" sport:"football" amount:100
            │ └── LEAF id:fr-lyon country:"France" sport:"rugby" amount:200
            ├─┬ LEAF_GROUP id:row-group-country-Germany ag-Grid-AutoColumn:"Germany" amount:400
            │ ├── LEAF id:de-berlin country:"Germany" sport:"tennis" amount:150
            │ └── LEAF id:de-hamburg country:"Germany" sport:"cricket" amount:250
            └─┬ LEAF_GROUP id:row-group-country-Italy ag-Grid-AutoColumn:"Italy" amount:300
            · └── LEAF id:it-rome country:"Italy" sport:"golf" amount:300
        `);

        expect(api.getPinnedTopRowCount()).toBe(1);
        const franceGroup = api.getRowNode('row-group-country-France');
        expect(franceGroup).toBeDefined();

        // Replace row data without any France rows
        api.setGridOption(
            'rowData',
            rowData.filter((r) => r.country !== 'France')
        );
        await asyncSetTimeout(10);

        // France group should be destroyed and pinned row removed
        await new GridRows(api, 'after setRowData').check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ LEAF_GROUP id:row-group-country-Germany ag-Grid-AutoColumn:"Germany" amount:400
            │ ├── LEAF id:de-berlin country:"Germany" sport:"tennis" amount:150
            │ └── LEAF id:de-hamburg country:"Germany" sport:"cricket" amount:250
            └─┬ LEAF_GROUP id:row-group-country-Italy ag-Grid-AutoColumn:"Italy" amount:300
            · └── LEAF id:it-rome country:"Italy" sport:"golf" amount:300
        `);

        expect(api.getPinnedTopRowCount()).toBe(0);
        expect(franceGroup!.destroyed).toBe(true);
    });

    test('pinned filler row (group without children in current view) is handled correctly', async () => {
        const api = await gridsManager.createGridAndWait('myGrid', {
            columnDefs,
            rowData,
            groupDefaultExpanded: -1,
            enableRowPinning: true,
            isRowPinned: (node) => (node.group && node.key === 'France' ? 'top' : null),
            getRowId: (params) => params.data.id,
        });

        // Verify initial state - France group is pinned
        await new GridRows(api, 'initial').check(`
            PINNED_TOP id:t-top-row-group-country-France ag-Grid-AutoColumn:"France" amount:300
            ROOT id:ROOT_NODE_ID
            ├─┬ LEAF_GROUP id:row-group-country-France ag-Grid-AutoColumn:"France" amount:300
            │ ├── LEAF id:fr-paris country:"France" sport:"football" amount:100
            │ └── LEAF id:fr-lyon country:"France" sport:"rugby" amount:200
            ├─┬ LEAF_GROUP id:row-group-country-Germany ag-Grid-AutoColumn:"Germany" amount:400
            │ ├── LEAF id:de-berlin country:"Germany" sport:"tennis" amount:150
            │ └── LEAF id:de-hamburg country:"Germany" sport:"cricket" amount:250
            └─┬ LEAF_GROUP id:row-group-country-Italy ag-Grid-AutoColumn:"Italy" amount:300
            · └── LEAF id:it-rome country:"Italy" sport:"golf" amount:300
        `);

        assertPinnedRows(api, 'top', ['t-top-row-group-country-France']);

        const pinnedFrance = api.getPinnedTopRow(0);
        expect(pinnedFrance?.group).toBe(true);
        expect(pinnedFrance?.key).toBe('France');
    });

    test('sibling group removal via transaction does not affect pinned group', async () => {
        // This test verifies that when a sibling group is removed via transaction,
        // the pinned group remains correctly pinned and the grid state is valid.

        const api = await gridsManager.createGridAndWait('myGrid', {
            columnDefs,
            rowData,
            groupDefaultExpanded: -1,
            enableRowPinning: true,
            isRowPinned: (node) => (node.group && node.key === 'France' ? 'top' : null),
            getRowId: (params) => params.data.id,
        });

        // Verify initial state - France group is pinned
        await new GridRows(api, 'initial').check(`
            PINNED_TOP id:t-top-row-group-country-France ag-Grid-AutoColumn:"France" amount:300
            ROOT id:ROOT_NODE_ID
            ├─┬ LEAF_GROUP id:row-group-country-France ag-Grid-AutoColumn:"France" amount:300
            │ ├── LEAF id:fr-paris country:"France" sport:"football" amount:100
            │ └── LEAF id:fr-lyon country:"France" sport:"rugby" amount:200
            ├─┬ LEAF_GROUP id:row-group-country-Germany ag-Grid-AutoColumn:"Germany" amount:400
            │ ├── LEAF id:de-berlin country:"Germany" sport:"tennis" amount:150
            │ └── LEAF id:de-hamburg country:"Germany" sport:"cricket" amount:250
            └─┬ LEAF_GROUP id:row-group-country-Italy ag-Grid-AutoColumn:"Italy" amount:300
            · └── LEAF id:it-rome country:"Italy" sport:"golf" amount:300
        `);

        expect(api.getPinnedTopRowCount()).toBe(1);
        const pinnedFrance = api.getPinnedTopRow(0);
        expect(pinnedFrance?.key).toBe('France');
        expect(pinnedFrance?.destroyed).toBe(false);

        // Remove a sibling group (Germany) - this triggers a remap that should not
        // affect the pinned France group
        api.applyTransaction({
            remove: [{ id: 'de-berlin' }, { id: 'de-hamburg' }],
        });
        await asyncSetTimeout(10);

        // The Germany group should be destroyed, but the pinned France should remain
        await new GridRows(api, 'after Germany removal').check(`
            PINNED_TOP id:t-top-row-group-country-France ag-Grid-AutoColumn:"France" amount:300
            ROOT id:ROOT_NODE_ID
            ├─┬ LEAF_GROUP id:row-group-country-France ag-Grid-AutoColumn:"France" amount:300
            │ ├── LEAF id:fr-paris country:"France" sport:"football" amount:100
            │ └── LEAF id:fr-lyon country:"France" sport:"rugby" amount:200
            └─┬ LEAF_GROUP id:row-group-country-Italy ag-Grid-AutoColumn:"Italy" amount:300
            · └── LEAF id:it-rome country:"Italy" sport:"golf" amount:300
        `);

        expect(api.getPinnedTopRowCount()).toBe(1);
        expect(api.getPinnedTopRow(0)?.key).toBe('France');
        expect(api.getPinnedTopRow(0)?.destroyed).toBe(false);

        // Verify the Germany group no longer exists
        expect(api.getRowNode('row-group-country-Germany')).toBeUndefined();
    });
});
