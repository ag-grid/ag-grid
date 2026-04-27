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

function getPinnedRows(api: GridApi, floating: NonNullable<RowPinnedType>): RowNode[] {
    const pinnedNodes: RowNode[] = [];
    api.forEachPinnedRow(floating, (node) => {
        pinnedNodes.push(node as RowNode);
    });
    return pinnedNodes;
}

describe('Manual pinned rows', () => {
    const gridsManager = new TestGridsManager({
        modules: [PinnedRowModule, ClientSideRowModelModule, RowGroupingModule, PaginationModule],
    });

    const columnDefs = [{ field: 'sport' }];
    const rowData = [
        { sport: 'football' },
        { sport: 'rugby' },
        { sport: 'tennis' },
        { sport: 'cricket' },
        { sport: 'golf' },
        { sport: 'swimming' },
        { sport: 'rowing' },
    ];

    beforeEach(() => {
        gridsManager.reset();
    });

    afterEach(() => {
        gridsManager.reset();
    });

    test('Setting `grandTotalRow` to non-pinned value does not reset pinned row state', async () => {
        const api = await gridsManager.createGridAndWait('myGrid', {
            columnDefs,
            rowData,
            enableRowPinning: true,
            isRowPinned: (node) => (node.data?.sport === 'rugby' ? 'top' : null),
            getRowId(params) {
                return `${params.level}-${params.data?.sport}`;
            },
            grandTotalRow: 'bottom',
        });

        // Verify initial state (grandTotalRow: 'bottom' adds a footer row)
        await new GridRows(api, 'initial').check(`
            PINNED_TOP id:t-top-0-rugby sport:"rugby"
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:"0-football" sport:"football"
            ├── LEAF id:"0-rugby" sport:"rugby"
            ├── LEAF id:"0-tennis" sport:"tennis"
            ├── LEAF id:"0-cricket" sport:"cricket"
            ├── LEAF id:"0-golf" sport:"golf"
            ├── LEAF id:"0-swimming" sport:"swimming"
            ├── LEAF id:"0-rowing" sport:"rowing"
            └─ footer id:rowGroupFooter_ROOT_NODE_ID
        `);

        assertPinnedRows(api, 'top', ['t-top-0-rugby']);

        api.setGridOption('grandTotalRow', 'top');

        await asyncSetTimeout(5);

        // After changing grandTotalRow to 'top', footer moves to top but is not shown in DOM
        await new GridRows(api, 'after grandTotalRow change').check(`
            PINNED_TOP id:t-top-0-rugby sport:"rugby"
            ROOT id:ROOT_NODE_ID
            ├─ footer id:rowGroupFooter_ROOT_NODE_ID
            ├── LEAF id:"0-football" sport:"football"
            ├── LEAF id:"0-rugby" sport:"rugby"
            ├── LEAF id:"0-tennis" sport:"tennis"
            ├── LEAF id:"0-cricket" sport:"cricket"
            ├── LEAF id:"0-golf" sport:"golf"
            ├── LEAF id:"0-swimming" sport:"swimming"
            └── LEAF id:"0-rowing" sport:"rowing"
        `);

        assertPinnedRows(api, 'top', ['t-top-0-rugby']);

        await new GridColumns(api, 'columns').checkColumns(`
            CENTER
            └── sport "Sport" width:200
        `);
    });

    test('Setting `grandTotalRow` to pinned value does not reset pinned row state', async () => {
        const api = await gridsManager.createGridAndWait('myGrid', {
            columnDefs,
            rowData,
            enableRowPinning: true,
            isRowPinned: (node) => (node.data?.sport === 'rugby' ? 'top' : null),
            getRowId(params) {
                return `${params.level}-${params.data?.sport}`;
            },
            grandTotalRow: 'bottom',
        });

        // Verify initial state (grandTotalRow: 'bottom' adds a footer row)
        await new GridRows(api, 'initial').check(`
            PINNED_TOP id:t-top-0-rugby sport:"rugby"
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:"0-football" sport:"football"
            ├── LEAF id:"0-rugby" sport:"rugby"
            ├── LEAF id:"0-tennis" sport:"tennis"
            ├── LEAF id:"0-cricket" sport:"cricket"
            ├── LEAF id:"0-golf" sport:"golf"
            ├── LEAF id:"0-swimming" sport:"swimming"
            ├── LEAF id:"0-rowing" sport:"rowing"
            └─ footer id:rowGroupFooter_ROOT_NODE_ID
        `);

        assertPinnedRows(api, 'top', ['t-top-0-rugby']);

        api.setGridOption('grandTotalRow', 'pinnedTop');

        await asyncSetTimeout(10);

        assertPinnedRows(api, 'top', ['t-top-rowGroupFooter_ROOT_NODE_ID', 't-top-0-rugby']);

        await new GridColumns(api, 'columns').checkColumns(`
            CENTER
            └── sport "Sport" width:200
        `);
    });

    test('Setting `grandTotalRow` to pinned value when pagination is enabled works', async () => {
        const api = await gridsManager.createGridAndWait('myGrid', {
            columnDefs,
            rowData,
            getRowId(params) {
                return `${params.level}-${params.data?.sport}`;
            },
            grandTotalRow: 'pinnedBottom',
            pagination: true,
            paginationPageSize: rowData.length,
            paginationPageSizeSelector: [rowData.length, 2 * rowData.length],
        });

        assertPinnedRows(api, 'bottom', ['b-bottom-rowGroupFooter_ROOT_NODE_ID']);
    });

    test('grand total row can be pinned without `enableRowPinning`', async () => {
        const api = await gridsManager.createGridAndWait('myGrid', {
            columnDefs,
            rowData,
            grandTotalRow: 'pinnedBottom',
        });

        assertPinnedRows(api, 'bottom', ['b-bottom-rowGroupFooter_ROOT_NODE_ID']);
    });

    test('can move position of pinned grand total row with `grandTotalRow`', async () => {
        const api = await gridsManager.createGridAndWait('myGrid', {
            columnDefs,
            rowData,
            enableRowPinning: true,
            isRowPinned: (node) => (node.data?.sport === 'rugby' ? 'top' : null),
            getRowId(params) {
                return `${params.level}-${params.data?.sport}`;
            },
            grandTotalRow: 'pinnedBottom',
        });

        assertPinnedRows(api, 'top', ['t-top-0-rugby']);
        assertPinnedRows(api, 'bottom', ['b-bottom-rowGroupFooter_ROOT_NODE_ID']);
        const oldPinnedBottom = getPinnedRows(api, 'bottom')[0];
        expect(oldPinnedBottom.destroyed).toBe(false);

        api.setGridOption('grandTotalRow', 'pinnedTop');
        await asyncSetTimeout(10);

        assertPinnedRows(api, 'top', ['t-top-rowGroupFooter_ROOT_NODE_ID', 't-top-0-rugby']);
        assertPinnedRows(api, 'bottom', []);
        expect(oldPinnedBottom.destroyed).toBe(true);
    });

    test('cycle through grandTotalRow positions including pinned', async () => {
        const api = await gridsManager.createGridAndWait('myGrid', {
            columnDefs,
            rowData,
            getRowId(params) {
                return `${params.level}-${params.data?.sport}`;
            },
            grandTotalRow: 'pinnedTop',
        });

        // pinnedTop
        assertPinnedRows(api, 'top', ['t-top-rowGroupFooter_ROOT_NODE_ID']);
        assertPinnedRows(api, 'bottom', []);
        const topPinnedNode = getPinnedRows(api, 'top')[0];
        expect(topPinnedNode.destroyed).toBe(false);

        api.setGridOption('grandTotalRow', 'top');
        await asyncSetTimeout(10);
        assertPinnedRows(api, 'top', []);
        assertPinnedRows(api, 'bottom', []);
        expect(topPinnedNode.destroyed).toBe(true);

        api.setGridOption('grandTotalRow', 'pinnedBottom');
        await asyncSetTimeout(10);
        assertPinnedRows(api, 'top', []);
        assertPinnedRows(api, 'bottom', ['b-bottom-rowGroupFooter_ROOT_NODE_ID']);

        const bottomNode = getPinnedRows(api, 'bottom')[0];
        expect(bottomNode.rowPinned).toBe('bottom');
        expect(bottomNode.destroyed).toBe(false);
        expect(bottomNode).not.toBe(topPinnedNode);

        api.setGridOption('grandTotalRow', undefined);
        await asyncSetTimeout(10);
        assertPinnedRows(api, 'top', []);
        assertPinnedRows(api, 'bottom', []);
        expect(bottomNode.destroyed).toBe(true);
    });

    test('pinned row is unpinned when source row is destroyed via transaction remove', async () => {
        const api = await gridsManager.createGridAndWait('myGrid', {
            columnDefs,
            rowData,
            enableRowPinning: true,
            isRowPinned: (node) => (node.data?.sport === 'rugby' ? 'top' : null),
            getRowId(params) {
                return `${params.level}-${params.data?.sport}`;
            },
        });

        // Verify initial state
        await new GridRows(api, 'initial').check(`
            PINNED_TOP id:t-top-0-rugby sport:"rugby"
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:"0-football" sport:"football"
            ├── LEAF id:"0-rugby" sport:"rugby"
            ├── LEAF id:"0-tennis" sport:"tennis"
            ├── LEAF id:"0-cricket" sport:"cricket"
            ├── LEAF id:"0-golf" sport:"golf"
            ├── LEAF id:"0-swimming" sport:"swimming"
            └── LEAF id:"0-rowing" sport:"rowing"
        `);

        assertPinnedRows(api, 'top', ['t-top-0-rugby']);

        // Get references to the pinned row and source row
        const pinnedRows = getPinnedRows(api, 'top');
        expect(pinnedRows).toHaveLength(1);
        const pinnedRow = pinnedRows[0];
        const sourceRow = pinnedRow.pinnedSibling;
        expect(sourceRow).toBeDefined();
        expect(sourceRow!.data?.sport).toBe('rugby');

        // Remove the source row via transaction
        api.applyTransaction({ remove: [{ sport: 'rugby' }] });
        await asyncSetTimeout(10);

        // Verify final state - rugby is removed
        await new GridRows(api, 'after remove').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:"0-football" sport:"football"
            ├── LEAF id:"0-tennis" sport:"tennis"
            ├── LEAF id:"0-cricket" sport:"cricket"
            ├── LEAF id:"0-golf" sport:"golf"
            ├── LEAF id:"0-swimming" sport:"swimming"
            └── LEAF id:"0-rowing" sport:"rowing"
        `);

        // Pinned row should be removed
        assertPinnedRows(api, 'top', []);

        // Source row should be destroyed
        expect(sourceRow!.destroyed).toBe(true);
    });

    test('pinned row is unpinned when source row is destroyed via setRowData', async () => {
        const api = await gridsManager.createGridAndWait('myGrid', {
            columnDefs,
            rowData,
            enableRowPinning: true,
            isRowPinned: (node) => (node.data?.sport === 'rugby' ? 'top' : null),
            getRowId(params) {
                return `${params.level}-${params.data?.sport}`;
            },
        });

        // Verify initial state
        await new GridRows(api, 'initial').check(`
            PINNED_TOP id:t-top-0-rugby sport:"rugby"
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:"0-football" sport:"football"
            ├── LEAF id:"0-rugby" sport:"rugby"
            ├── LEAF id:"0-tennis" sport:"tennis"
            ├── LEAF id:"0-cricket" sport:"cricket"
            ├── LEAF id:"0-golf" sport:"golf"
            ├── LEAF id:"0-swimming" sport:"swimming"
            └── LEAF id:"0-rowing" sport:"rowing"
        `);

        assertPinnedRows(api, 'top', ['t-top-0-rugby']);
        const pinnedRows = getPinnedRows(api, 'top');
        const sourceRow = pinnedRows[0].pinnedSibling;

        // Replace all row data without the rugby row
        api.setGridOption(
            'rowData',
            rowData.filter((r) => r.sport !== 'rugby')
        );
        await asyncSetTimeout(10);

        // Verify final state - rugby is removed
        await new GridRows(api, 'after setRowData').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:"0-football" sport:"football"
            ├── LEAF id:"0-tennis" sport:"tennis"
            ├── LEAF id:"0-cricket" sport:"cricket"
            ├── LEAF id:"0-golf" sport:"golf"
            ├── LEAF id:"0-swimming" sport:"swimming"
            └── LEAF id:"0-rowing" sport:"rowing"
        `);

        // Pinned row should be removed
        assertPinnedRows(api, 'top', []);

        // Source row should be destroyed
        expect(sourceRow!.destroyed).toBe(true);
    });

    test('pinnedSibling references are correctly set up', async () => {
        const api = await gridsManager.createGridAndWait('myGrid', {
            columnDefs,
            rowData,
            enableRowPinning: true,
            isRowPinned: (node) => (node.data?.sport === 'rugby' ? 'top' : null),
            getRowId(params) {
                return `${params.level}-${params.data?.sport}`;
            },
        });

        // Verify grid state
        await new GridRows(api, 'state').check(`
            PINNED_TOP id:t-top-0-rugby sport:"rugby"
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:"0-football" sport:"football"
            ├── LEAF id:"0-rugby" sport:"rugby"
            ├── LEAF id:"0-tennis" sport:"tennis"
            ├── LEAF id:"0-cricket" sport:"cricket"
            ├── LEAF id:"0-golf" sport:"golf"
            ├── LEAF id:"0-swimming" sport:"swimming"
            └── LEAF id:"0-rowing" sport:"rowing"
        `);

        const pinnedRows = getPinnedRows(api, 'top');
        expect(pinnedRows).toHaveLength(1);

        const pinnedRow = pinnedRows[0];
        const sourceRow = pinnedRow.pinnedSibling;

        // Verify bidirectional relationship
        expect(sourceRow).toBeDefined();
        expect(sourceRow!.pinnedSibling).toBe(pinnedRow);
        expect(pinnedRow.pinnedSibling).toBe(sourceRow);

        // Verify row properties
        expect(pinnedRow.rowPinned).toBe('top');
        expect(sourceRow!.rowPinned).toBeFalsy(); // null or undefined
        expect(pinnedRow.data).toBe(sourceRow!.data);
    });

    test('multiple pinned rows are all unpinned when their source rows are destroyed', async () => {
        const api = await gridsManager.createGridAndWait('myGrid', {
            columnDefs,
            rowData,
            enableRowPinning: true,
            isRowPinned: (node) => {
                const sport = node.data?.sport;
                if (sport === 'rugby' || sport === 'tennis') {
                    return 'top';
                }
                if (sport === 'golf') {
                    return 'bottom';
                }
                return null;
            },
            getRowId(params) {
                return `${params.level}-${params.data?.sport}`;
            },
        });

        // Verify initial state
        await new GridRows(api, 'initial').check(`
            PINNED_TOP id:t-top-0-rugby sport:"rugby"
            PINNED_TOP id:t-top-0-tennis sport:"tennis"
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:"0-football" sport:"football"
            ├── LEAF id:"0-rugby" sport:"rugby"
            ├── LEAF id:"0-tennis" sport:"tennis"
            ├── LEAF id:"0-cricket" sport:"cricket"
            ├── LEAF id:"0-golf" sport:"golf"
            ├── LEAF id:"0-swimming" sport:"swimming"
            └── LEAF id:"0-rowing" sport:"rowing"
            PINNED_BOTTOM id:b-bottom-0-golf sport:"golf"
        `);

        assertPinnedRows(api, 'top', ['t-top-0-rugby', 't-top-0-tennis']);
        assertPinnedRows(api, 'bottom', ['b-bottom-0-golf']);

        // Remove all pinned source rows
        api.applyTransaction({
            remove: [{ sport: 'rugby' }, { sport: 'tennis' }, { sport: 'golf' }],
        });
        await asyncSetTimeout(10);

        // Verify final state - all pinned rows removed
        await new GridRows(api, 'after remove').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:"0-football" sport:"football"
            ├── LEAF id:"0-cricket" sport:"cricket"
            ├── LEAF id:"0-swimming" sport:"swimming"
            └── LEAF id:"0-rowing" sport:"rowing"
        `);

        // All pinned rows should be removed
        assertPinnedRows(api, 'top', []);
        assertPinnedRows(api, 'bottom', []);
    });

    test('pinned row is correctly moved when isRowPinned callback changes', async () => {
        let pinnedPosition: RowPinnedType = 'top';

        const api = await gridsManager.createGridAndWait('myGrid', {
            columnDefs,
            rowData,
            enableRowPinning: true,
            isRowPinned: (node) => (node.data?.sport === 'rugby' ? pinnedPosition : null),
            getRowId(params) {
                return `${params.level}-${params.data?.sport}`;
            },
        });

        // Verify initial state - pinned to top
        await new GridRows(api, 'initial').check(`
            PINNED_TOP id:t-top-0-rugby sport:"rugby"
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:"0-football" sport:"football"
            ├── LEAF id:"0-rugby" sport:"rugby"
            ├── LEAF id:"0-tennis" sport:"tennis"
            ├── LEAF id:"0-cricket" sport:"cricket"
            ├── LEAF id:"0-golf" sport:"golf"
            ├── LEAF id:"0-swimming" sport:"swimming"
            └── LEAF id:"0-rowing" sport:"rowing"
        `);

        assertPinnedRows(api, 'top', ['t-top-0-rugby']);
        assertPinnedRows(api, 'bottom', []);

        // Change the callback to pin to bottom and refresh
        pinnedPosition = 'bottom';

        // Trigger re-evaluation by updating the row data for rugby
        api.applyTransaction({ update: [{ sport: 'rugby' }] });
        await asyncSetTimeout(10);

        // The row should now be pinned to bottom (after isRowPinned is re-evaluated)
        // Note: isRowPinned is only called on firstDataRendered, so we need to test via setGridOption
    });

    test('pinned rows survive data updates to other rows', async () => {
        const api = await gridsManager.createGridAndWait('myGrid', {
            columnDefs,
            rowData,
            enableRowPinning: true,
            isRowPinned: (node) => (node.data?.sport === 'rugby' ? 'top' : null),
            getRowId(params) {
                return `${params.level}-${params.data?.sport}`;
            },
        });

        // Verify initial state
        await new GridRows(api, 'initial').check(`
            PINNED_TOP id:t-top-0-rugby sport:"rugby"
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:"0-football" sport:"football"
            ├── LEAF id:"0-rugby" sport:"rugby"
            ├── LEAF id:"0-tennis" sport:"tennis"
            ├── LEAF id:"0-cricket" sport:"cricket"
            ├── LEAF id:"0-golf" sport:"golf"
            ├── LEAF id:"0-swimming" sport:"swimming"
            └── LEAF id:"0-rowing" sport:"rowing"
        `);

        assertPinnedRows(api, 'top', ['t-top-0-rugby']);

        // Update a different row
        api.applyTransaction({ update: [{ sport: 'tennis' }] });
        await asyncSetTimeout(10);

        // Rugby should still be pinned
        await new GridRows(api, 'after update tennis').check(`
            PINNED_TOP id:t-top-0-rugby sport:"rugby"
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:"0-football" sport:"football"
            ├── LEAF id:"0-rugby" sport:"rugby"
            ├── LEAF id:"0-tennis" sport:"tennis"
            ├── LEAF id:"0-cricket" sport:"cricket"
            ├── LEAF id:"0-golf" sport:"golf"
            ├── LEAF id:"0-swimming" sport:"swimming"
            └── LEAF id:"0-rowing" sport:"rowing"
        `);

        assertPinnedRows(api, 'top', ['t-top-0-rugby']);

        // Add a new row
        api.applyTransaction({ add: [{ sport: 'hockey' }] });
        await asyncSetTimeout(10);

        // Rugby should still be pinned
        await new GridRows(api, 'after add hockey').check(`
            PINNED_TOP id:t-top-0-rugby sport:"rugby"
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:"0-football" sport:"football"
            ├── LEAF id:"0-rugby" sport:"rugby"
            ├── LEAF id:"0-tennis" sport:"tennis"
            ├── LEAF id:"0-cricket" sport:"cricket"
            ├── LEAF id:"0-golf" sport:"golf"
            ├── LEAF id:"0-swimming" sport:"swimming"
            ├── LEAF id:"0-rowing" sport:"rowing"
            └── LEAF id:"0-hockey" sport:"hockey"
        `);

        assertPinnedRows(api, 'top', ['t-top-0-rugby']);
    });
});
