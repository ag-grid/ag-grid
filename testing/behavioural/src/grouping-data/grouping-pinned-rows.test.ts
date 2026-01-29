import { ClientSideRowModelModule, PaginationModule } from 'ag-grid-community';
import { RowGroupingModule } from 'ag-grid-enterprise';

import { TestGridsManager, asyncSetTimeout } from '../test-utils';

describe('ag-grid grouping pinned rows', () => {
    const gridsManager = new TestGridsManager({
        modules: [ClientSideRowModelModule, RowGroupingModule, PaginationModule],
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
        expect(api.getRowNode('row-group-country-France')).toBeUndefined();
        expect(api.getPinnedTopRowCount()).toBe(0);
        expect(franceGroup!.destroyed).toBe(true);
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
        expect(api.getPinnedTopRowCount()).toBe(1);
        const pinnedFrance = api.getPinnedTopRow(0);
        expect(pinnedFrance?.key).toBe('France');
        // The source group should still be alive
        expect(franceGroup!.destroyed).toBe(false);
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
        expect(api.getPinnedTopRowCount()).toBe(1);
        expect(api.getPinnedBottomRowCount()).toBe(1);

        // Remove all France and Germany rows
        api.applyTransaction({
            remove: [{ id: 'fr-paris' }, { id: 'fr-lyon' }, { id: 'de-berlin' }, { id: 'de-hamburg' }],
        });
        await asyncSetTimeout(10);

        // Both pinned rows should be removed
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
        expect(api.getPinnedTopRowCount()).toBe(1);
        const pinnedFrance = api.getPinnedTopRow(0);
        expect(pinnedFrance?.group).toBe(true);
        expect(pinnedFrance?.key).toBe('France');

        // The source group node should reference the pinned node
        const franceGroup = api.getRowNode('row-group-country-France');
        expect(franceGroup).toBeDefined();
        expect(franceGroup!.pinnedSibling).toBe(pinnedFrance);
        expect(pinnedFrance?.pinnedSibling).toBe(franceGroup);
    });
});
