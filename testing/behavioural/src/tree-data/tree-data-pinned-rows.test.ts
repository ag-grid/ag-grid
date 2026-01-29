import { ClientSideRowModelModule, PaginationModule } from 'ag-grid-community';
import { TreeDataModule } from 'ag-grid-enterprise';

import { TestGridsManager, asyncSetTimeout } from '../test-utils';

describe('ag-grid tree data pinned rows', () => {
    const gridsManager = new TestGridsManager({
        modules: [ClientSideRowModelModule, TreeDataModule, PaginationModule],
    });

    const columnDefs = [{ field: 'name' }, { field: 'amount', aggFunc: 'sum' }];

    const rowData = [
        { id: 'europe', path: ['Europe'], name: 'Europe', amount: null },
        { id: 'france', path: ['Europe', 'France'], name: 'France', amount: null },
        { id: 'paris', path: ['Europe', 'France', 'Paris'], name: 'Paris', amount: 100 },
        { id: 'lyon', path: ['Europe', 'France', 'Lyon'], name: 'Lyon', amount: 200 },
        { id: 'germany', path: ['Europe', 'Germany'], name: 'Germany', amount: null },
        { id: 'berlin', path: ['Europe', 'Germany', 'Berlin'], name: 'Berlin', amount: 150 },
        { id: 'asia', path: ['Asia'], name: 'Asia', amount: null },
        { id: 'japan', path: ['Asia', 'Japan'], name: 'Japan', amount: null },
        { id: 'tokyo', path: ['Asia', 'Japan', 'Tokyo'], name: 'Tokyo', amount: 300 },
    ];

    beforeEach(() => {
        gridsManager.reset();
    });

    afterEach(() => {
        gridsManager.reset();
    });

    test('pinned tree node is unpinned when source node is destroyed via transaction remove', async () => {
        const api = await gridsManager.createGridAndWait('myGrid', {
            columnDefs,
            rowData,
            treeData: true,
            getDataPath: (data) => data.path,
            groupDefaultExpanded: -1,
            enableRowPinning: true,
            isRowPinned: (node) => (node.key === 'France' ? 'top' : null),
            getRowId: (params) => params.data.id,
        });

        // Verify initial state - France is pinned
        expect(api.getPinnedTopRowCount()).toBe(1);
        const pinnedFrance = api.getPinnedTopRow(0);
        expect(pinnedFrance?.key).toBe('France');

        // Get reference to the source node
        const franceNode = api.getRowNode('france');
        expect(franceNode).toBeDefined();

        // Remove France and all its children
        api.applyTransaction({
            remove: [{ id: 'france' }, { id: 'paris' }, { id: 'lyon' }],
        });
        await asyncSetTimeout(10);

        // France node should be destroyed, and pinned row should be removed
        expect(api.getRowNode('france')).toBeUndefined();
        expect(api.getPinnedTopRowCount()).toBe(0);
        expect(franceNode!.destroyed).toBe(true);
    });

    test('pinned tree node survives when some children are removed', async () => {
        const api = await gridsManager.createGridAndWait('myGrid', {
            columnDefs,
            rowData,
            treeData: true,
            getDataPath: (data) => data.path,
            groupDefaultExpanded: -1,
            enableRowPinning: true,
            isRowPinned: (node) => (node.key === 'France' ? 'top' : null),
            getRowId: (params) => params.data.id,
        });

        // Verify initial state
        expect(api.getPinnedTopRowCount()).toBe(1);
        const franceNode = api.getRowNode('france');
        expect(franceNode).toBeDefined();
        expect(franceNode!.destroyed).toBe(false);

        // Remove only Paris (one child)
        api.applyTransaction({
            remove: [{ id: 'paris' }],
        });
        await asyncSetTimeout(10);

        // France should still exist and be pinned
        expect(api.getPinnedTopRowCount()).toBe(1);
        const pinnedFrance = api.getPinnedTopRow(0);
        expect(pinnedFrance?.key).toBe('France');
        expect(franceNode!.destroyed).toBe(false);
    });

    test('multiple pinned tree nodes are unpinned when their source nodes are destroyed', async () => {
        const api = await gridsManager.createGridAndWait('myGrid', {
            columnDefs,
            rowData,
            treeData: true,
            getDataPath: (data) => data.path,
            groupDefaultExpanded: -1,
            enableRowPinning: true,
            isRowPinned: (node) => {
                if (node.key === 'France') {
                    return 'top';
                }
                if (node.key === 'Japan') {
                    return 'bottom';
                }
                return null;
            },
            getRowId: (params) => params.data.id,
        });

        // Verify initial state
        expect(api.getPinnedTopRowCount()).toBe(1);
        expect(api.getPinnedBottomRowCount()).toBe(1);

        // Remove France and Japan with all their children
        api.applyTransaction({
            remove: [{ id: 'france' }, { id: 'paris' }, { id: 'lyon' }, { id: 'japan' }, { id: 'tokyo' }],
        });
        await asyncSetTimeout(10);

        // Both pinned rows should be removed
        expect(api.getPinnedTopRowCount()).toBe(0);
        expect(api.getPinnedBottomRowCount()).toBe(0);
    });

    test('pinned tree node is unpinned when source node is destroyed via setRowData', async () => {
        const api = await gridsManager.createGridAndWait('myGrid', {
            columnDefs,
            rowData,
            treeData: true,
            getDataPath: (data) => data.path,
            groupDefaultExpanded: -1,
            enableRowPinning: true,
            isRowPinned: (node) => (node.key === 'France' ? 'top' : null),
            getRowId: (params) => params.data.id,
        });

        // Verify initial state
        expect(api.getPinnedTopRowCount()).toBe(1);
        const franceNode = api.getRowNode('france');
        expect(franceNode).toBeDefined();

        // Replace row data without France (and its children)
        api.setGridOption(
            'rowData',
            rowData.filter((r) => !r.path.includes('France'))
        );
        await asyncSetTimeout(10);

        // France node should be destroyed and pinned row removed
        expect(api.getPinnedTopRowCount()).toBe(0);
        expect(franceNode!.destroyed).toBe(true);
    });

    test('pinned leaf node in tree is unpinned when destroyed', async () => {
        const api = await gridsManager.createGridAndWait('myGrid', {
            columnDefs,
            rowData,
            treeData: true,
            getDataPath: (data) => data.path,
            groupDefaultExpanded: -1,
            enableRowPinning: true,
            isRowPinned: (node) => (node.key === 'Paris' ? 'top' : null),
            getRowId: (params) => params.data.id,
        });

        // Verify initial state - Paris (a leaf node) is pinned
        expect(api.getPinnedTopRowCount()).toBe(1);
        const pinnedParis = api.getPinnedTopRow(0);
        expect(pinnedParis?.key).toBe('Paris');

        // Get reference to the source node
        const parisNode = api.getRowNode('paris');
        expect(parisNode).toBeDefined();

        // Remove Paris
        api.applyTransaction({
            remove: [{ id: 'paris' }],
        });
        await asyncSetTimeout(10);

        // Paris should be destroyed and pinned row removed
        expect(api.getPinnedTopRowCount()).toBe(0);
        expect(parisNode!.destroyed).toBe(true);
    });

    test('pinnedSibling references are correctly set up for tree nodes', async () => {
        const api = await gridsManager.createGridAndWait('myGrid', {
            columnDefs,
            rowData,
            treeData: true,
            getDataPath: (data) => data.path,
            groupDefaultExpanded: -1,
            enableRowPinning: true,
            isRowPinned: (node) => (node.key === 'France' ? 'top' : null),
            getRowId: (params) => params.data.id,
        });

        const pinnedFrance = api.getPinnedTopRow(0);
        const franceNode = api.getRowNode('france');

        // Verify bidirectional relationship
        expect(pinnedFrance).toBeDefined();
        expect(franceNode).toBeDefined();
        expect(pinnedFrance?.pinnedSibling).toBe(franceNode);
        expect(franceNode?.pinnedSibling).toBe(pinnedFrance);

        // Verify row properties
        expect(pinnedFrance?.rowPinned).toBe('top');
        expect(franceNode?.rowPinned).toBeFalsy();
    });
});
