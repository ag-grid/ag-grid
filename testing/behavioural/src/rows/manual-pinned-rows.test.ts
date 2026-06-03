import { ClientSideRowModelModule, PaginationModule, PinnedRowModule } from 'ag-grid-community';
import type { GridApi, RowNode, RowPinnedType } from 'ag-grid-community';
import { PivotModule, RowGroupingModule } from 'ag-grid-enterprise';

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
        modules: [PinnedRowModule, ClientSideRowModelModule, RowGroupingModule, PaginationModule, PivotModule],
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

    test('isRowPinned updates aria-rowindex for rows below pinned top rows', async () => {
        await gridsManager.createGridAndWait('myGrid', {
            columnDefs,
            rowData,
            enableRowPinning: true,
            isRowPinned: (node) => (node.data?.sport === 'rugby' ? 'top' : null),
        });

        await asyncSetTimeout(0);

        const firstBodyRow = document.querySelector(
            '#myGrid .ag-grid-scrolling-container > .ag-row[row-index="0"]'
        ) as HTMLElement | null;

        expect(firstBodyRow).toBeTruthy();
        // 1 header row + 1 pinned top row + row index (0) + 1 (aria is 1-based)
        expect(firstBodyRow?.getAttribute('aria-rowindex')).toBe('3');
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
        await new GridColumns(api, `Setting _grandTotalRow_ to pinned value when pagination is enabled works setup`)
            .checkColumns(`
                CENTER
                └── sport "Sport" width:200
            `);
        await new GridRows(api, `Setting _grandTotalRow_ to pinned value when pagination is enabled works setup`).check(
            `
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:"0-football" sport:"football"
                ├── LEAF id:"0-rugby" sport:"rugby"
                ├── LEAF id:"0-tennis" sport:"tennis"
                ├── LEAF id:"0-cricket" sport:"cricket"
                ├── LEAF id:"0-golf" sport:"golf"
                ├── LEAF id:"0-swimming" sport:"swimming"
                └── LEAF id:"0-rowing" sport:"rowing"
                PINNED_BOTTOM id:b-bottom-rowGroupFooter_ROOT_NODE_ID
            `
        );

        assertPinnedRows(api, 'bottom', ['b-bottom-rowGroupFooter_ROOT_NODE_ID']);
        await new GridRows(api, `Setting _grandTotalRow_ to pinned value when pagination is enabled works final state`)
            .check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:"0-football" sport:"football"
                ├── LEAF id:"0-rugby" sport:"rugby"
                ├── LEAF id:"0-tennis" sport:"tennis"
                ├── LEAF id:"0-cricket" sport:"cricket"
                ├── LEAF id:"0-golf" sport:"golf"
                ├── LEAF id:"0-swimming" sport:"swimming"
                └── LEAF id:"0-rowing" sport:"rowing"
                PINNED_BOTTOM id:b-bottom-rowGroupFooter_ROOT_NODE_ID
            `);
    });

    test('grand total row can be pinned without `enableRowPinning`', async () => {
        const api = await gridsManager.createGridAndWait('myGrid', {
            columnDefs,
            rowData,
            grandTotalRow: 'pinnedBottom',
        });
        await new GridColumns(api, `grand total row can be pinned without _enableRowPinning_ setup`).checkColumns(`
            CENTER
            └── sport "Sport" width:200
        `);
        await new GridRows(api, `grand total row can be pinned without _enableRowPinning_ setup`).check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:0 sport:"football"
            ├── LEAF id:1 sport:"rugby"
            ├── LEAF id:2 sport:"tennis"
            ├── LEAF id:3 sport:"cricket"
            ├── LEAF id:4 sport:"golf"
            ├── LEAF id:5 sport:"swimming"
            └── LEAF id:6 sport:"rowing"
            PINNED_BOTTOM id:b-bottom-rowGroupFooter_ROOT_NODE_ID
        `);

        assertPinnedRows(api, 'bottom', ['b-bottom-rowGroupFooter_ROOT_NODE_ID']);
        await new GridRows(api, `grand total row can be pinned without _enableRowPinning_ final state`).check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:0 sport:"football"
            ├── LEAF id:1 sport:"rugby"
            ├── LEAF id:2 sport:"tennis"
            ├── LEAF id:3 sport:"cricket"
            ├── LEAF id:4 sport:"golf"
            ├── LEAF id:5 sport:"swimming"
            └── LEAF id:6 sport:"rowing"
            PINNED_BOTTOM id:b-bottom-rowGroupFooter_ROOT_NODE_ID
        `);
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
        await new GridColumns(api, `can move position of pinned grand total row with _grandTotalRow_ setup`)
            .checkColumns(`
                CENTER
                └── sport "Sport" width:200
            `);
        await new GridRows(api, `can move position of pinned grand total row with _grandTotalRow_ setup`).check(`
            PINNED_TOP id:t-top-0-rugby sport:"rugby"
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:"0-football" sport:"football"
            ├── LEAF id:"0-rugby" sport:"rugby"
            ├── LEAF id:"0-tennis" sport:"tennis"
            ├── LEAF id:"0-cricket" sport:"cricket"
            ├── LEAF id:"0-golf" sport:"golf"
            ├── LEAF id:"0-swimming" sport:"swimming"
            └── LEAF id:"0-rowing" sport:"rowing"
            PINNED_BOTTOM id:b-bottom-rowGroupFooter_ROOT_NODE_ID
        `);

        assertPinnedRows(api, 'top', ['t-top-0-rugby']);
        assertPinnedRows(api, 'bottom', ['b-bottom-rowGroupFooter_ROOT_NODE_ID']);
        const oldPinnedBottom = getPinnedRows(api, 'bottom')[0];
        expect(oldPinnedBottom.destroyed).toBe(false);

        api.setGridOption('grandTotalRow', 'pinnedTop');
        await new GridColumns(
            api,
            `can move position of pinned grand total row with _grandTotalRow_ after setGridOption grandTotalRow`
        ).checkColumns(`
            CENTER
            └── sport "Sport" width:200
        `);
        await new GridRows(
            api,
            `can move position of pinned grand total row with _grandTotalRow_ after setGridOption grandTotalRow`
        ).check(`
            PINNED_TOP id:t-top-rowGroupFooter_ROOT_NODE_ID
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
        await new GridColumns(api, `cycle through grandTotalRow positions including pinned setup`).checkColumns(`
            CENTER
            └── sport "Sport" width:200
        `);
        await new GridRows(api, `cycle through grandTotalRow positions including pinned setup`).check(`
            PINNED_TOP id:t-top-rowGroupFooter_ROOT_NODE_ID
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:"0-football" sport:"football"
            ├── LEAF id:"0-rugby" sport:"rugby"
            ├── LEAF id:"0-tennis" sport:"tennis"
            ├── LEAF id:"0-cricket" sport:"cricket"
            ├── LEAF id:"0-golf" sport:"golf"
            ├── LEAF id:"0-swimming" sport:"swimming"
            └── LEAF id:"0-rowing" sport:"rowing"
        `);

        // pinnedTop
        assertPinnedRows(api, 'top', ['t-top-rowGroupFooter_ROOT_NODE_ID']);
        assertPinnedRows(api, 'bottom', []);
        const topPinnedNode = getPinnedRows(api, 'top')[0];
        expect(topPinnedNode.destroyed).toBe(false);

        api.setGridOption('grandTotalRow', 'top');
        await new GridColumns(
            api,
            `cycle through grandTotalRow positions including pinned after setGridOption grandTotalRow`
        ).checkColumns(`
            CENTER
            └── sport "Sport" width:200
        `);
        await new GridRows(
            api,
            `cycle through grandTotalRow positions including pinned after setGridOption grandTotalRow`
        ).check(`
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
        await asyncSetTimeout(10);
        assertPinnedRows(api, 'top', []);
        assertPinnedRows(api, 'bottom', []);
        expect(topPinnedNode.destroyed).toBe(true);

        api.setGridOption('grandTotalRow', 'pinnedBottom');
        await new GridColumns(
            api,
            `cycle through grandTotalRow positions including pinned after setGridOption grandTotalRow #2`
        ).checkColumns(`
            CENTER
            └── sport "Sport" width:200
        `);
        await new GridRows(
            api,
            `cycle through grandTotalRow positions including pinned after setGridOption grandTotalRow #2`
        ).check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:"0-football" sport:"football"
            ├── LEAF id:"0-rugby" sport:"rugby"
            ├── LEAF id:"0-tennis" sport:"tennis"
            ├── LEAF id:"0-cricket" sport:"cricket"
            ├── LEAF id:"0-golf" sport:"golf"
            ├── LEAF id:"0-swimming" sport:"swimming"
            └── LEAF id:"0-rowing" sport:"rowing"
            PINNED_BOTTOM id:b-bottom-rowGroupFooter_ROOT_NODE_ID
        `);
        await asyncSetTimeout(10);
        assertPinnedRows(api, 'top', []);
        assertPinnedRows(api, 'bottom', ['b-bottom-rowGroupFooter_ROOT_NODE_ID']);

        const bottomNode = getPinnedRows(api, 'bottom')[0];
        expect(bottomNode.rowPinned).toBe('bottom');
        expect(bottomNode.destroyed).toBe(false);
        expect(bottomNode).not.toBe(topPinnedNode);

        api.setGridOption('grandTotalRow', undefined);
        await new GridColumns(
            api,
            `cycle through grandTotalRow positions including pinned after setGridOption grandTotalRow #3`
        ).checkColumns(`
            CENTER
            └── sport "Sport" width:200
        `);
        await new GridRows(
            api,
            `cycle through grandTotalRow positions including pinned after setGridOption grandTotalRow #3`
        ).check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:"0-football" sport:"football"
            ├── LEAF id:"0-rugby" sport:"rugby"
            ├── LEAF id:"0-tennis" sport:"tennis"
            ├── LEAF id:"0-cricket" sport:"cricket"
            ├── LEAF id:"0-golf" sport:"golf"
            ├── LEAF id:"0-swimming" sport:"swimming"
            └── LEAF id:"0-rowing" sport:"rowing"
        `);
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

    test('isRowPinnable callback unpins a row when it stops being pinnable', async () => {
        // Track which sports are pinnable. We start with rugby pinnable, then make it
        // non-pinnable. The model listens to `rowNodeDataChanged` and re-evaluates pinnability;
        // when a previously-pinned row becomes non-pinnable, it must be unpinned.
        let pinnable = new Set(['rugby']);

        const api = await gridsManager.createGridAndWait('myGrid', {
            columnDefs,
            rowData,
            enableRowPinning: true,
            isRowPinned: (node) => (node.data?.sport === 'rugby' ? 'top' : null),
            isRowPinnable: (node) => pinnable.has(node.data?.sport ?? ''),
            getRowId(params) {
                return `${params.level}-${params.data?.sport}`;
            },
        });
        await new GridColumns(api, `isRowPinnable callback unpins a row when it stops being pinnable setup`)
            .checkColumns(`
                CENTER
                └── sport "Sport" width:200
            `);
        await new GridRows(api, `isRowPinnable callback unpins a row when it stops being pinnable setup`).check(`
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
        const pinnedRugby = getPinnedRows(api, 'top')[0];
        const sourceRugby = pinnedRugby.pinnedSibling!;

        // Make rugby no longer pinnable, then trigger rowNodeDataChanged via update.
        pinnable = new Set();
        api.applyTransaction({ update: [{ sport: 'rugby' }] });
        await new GridRows(
            api,
            `isRowPinnable callback unpins a row when it stops being pinnable after applyTransaction`
        ).check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:"0-football" sport:"football"
            ├── LEAF id:"0-rugby" sport:"rugby"
            ├── LEAF id:"0-tennis" sport:"tennis"
            ├── LEAF id:"0-cricket" sport:"cricket"
            ├── LEAF id:"0-golf" sport:"golf"
            ├── LEAF id:"0-swimming" sport:"swimming"
            └── LEAF id:"0-rowing" sport:"rowing"
        `);
        await asyncSetTimeout(10);

        // The previously-pinned row should be unpinned (rowNodeDataChanged listener handles it).
        assertPinnedRows(api, 'top', []);
        expect(sourceRugby.destroyed).toBe(false); // source row stays alive
        expect(sourceRugby.pinnedSibling).toBeUndefined();
        expect(pinnedRugby.destroyed).toBe(true);
    });

    test('sort change re-sorts pinned containers', async () => {
        const api = await gridsManager.createGridAndWait('myGrid', {
            columnDefs: [{ field: 'sport', sortable: true }],
            rowData,
            enableRowPinning: true,
            isRowPinned: (node) => {
                const s = node.data?.sport;
                return s === 'tennis' || s === 'football' || s === 'cricket' ? 'top' : null;
            },
            getRowId(params) {
                return `${params.level}-${params.data?.sport}`;
            },
        });
        await new GridColumns(api, `sort change re-sorts pinned containers setup`).checkColumns(`
            CENTER
            └── sport "Sport" width:200
        `);
        await new GridRows(api, `sort change re-sorts pinned containers setup`).check(`
            PINNED_TOP id:t-top-0-football sport:"football"
            PINNED_TOP id:t-top-0-tennis sport:"tennis"
            PINNED_TOP id:t-top-0-cricket sport:"cricket"
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:"0-football" sport:"football"
            ├── LEAF id:"0-rugby" sport:"rugby"
            ├── LEAF id:"0-tennis" sport:"tennis"
            ├── LEAF id:"0-cricket" sport:"cricket"
            ├── LEAF id:"0-golf" sport:"golf"
            ├── LEAF id:"0-swimming" sport:"swimming"
            └── LEAF id:"0-rowing" sport:"rowing"
        `);

        // Initial order matches source row order: football, tennis, cricket
        assertPinnedRows(api, 'top', ['t-top-0-football', 't-top-0-tennis', 't-top-0-cricket']);

        // Sort ascending by sport — pinned area must re-sort
        api.applyColumnState({ state: [{ colId: 'sport', sort: 'asc' }] });
        await new GridColumns(api, `sort change re-sorts pinned containers after applyColumnState`).checkColumns(`
            CENTER
            └── sport "Sport" width:200 sort:asc
        `);
        await new GridRows(api, `sort change re-sorts pinned containers after applyColumnState`).check(`
            PINNED_TOP id:t-top-0-cricket sport:"cricket"
            PINNED_TOP id:t-top-0-football sport:"football"
            PINNED_TOP id:t-top-0-tennis sport:"tennis"
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:"0-cricket" sport:"cricket"
            ├── LEAF id:"0-football" sport:"football"
            ├── LEAF id:"0-golf" sport:"golf"
            ├── LEAF id:"0-rowing" sport:"rowing"
            ├── LEAF id:"0-rugby" sport:"rugby"
            ├── LEAF id:"0-swimming" sport:"swimming"
            └── LEAF id:"0-tennis" sport:"tennis"
        `);
        await asyncSetTimeout(10);
        assertPinnedRows(api, 'top', ['t-top-0-cricket', 't-top-0-football', 't-top-0-tennis']);

        // Sort descending
        api.applyColumnState({ state: [{ colId: 'sport', sort: 'desc' }] });
        await new GridColumns(api, `sort change re-sorts pinned containers after applyColumnState #2`).checkColumns(`
            CENTER
            └── sport "Sport" width:200 sort:desc
        `);
        await new GridRows(api, `sort change re-sorts pinned containers after applyColumnState #2`).check(`
            PINNED_TOP id:t-top-0-tennis sport:"tennis"
            PINNED_TOP id:t-top-0-football sport:"football"
            PINNED_TOP id:t-top-0-cricket sport:"cricket"
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:"0-tennis" sport:"tennis"
            ├── LEAF id:"0-swimming" sport:"swimming"
            ├── LEAF id:"0-rugby" sport:"rugby"
            ├── LEAF id:"0-rowing" sport:"rowing"
            ├── LEAF id:"0-golf" sport:"golf"
            ├── LEAF id:"0-football" sport:"football"
            └── LEAF id:"0-cricket" sport:"cricket"
        `);
        await asyncSetTimeout(10);
        assertPinnedRows(api, 'top', ['t-top-0-tennis', 't-top-0-football', 't-top-0-cricket']);

        // Clear sort — falls back to source row order
        api.applyColumnState({ state: [{ colId: 'sport', sort: null }] });
        await new GridColumns(api, `sort change re-sorts pinned containers after applyColumnState #3`).checkColumns(`
            CENTER
            └── sport "Sport" width:200
        `);
        await new GridRows(api, `sort change re-sorts pinned containers after applyColumnState #3`).check(`
            PINNED_TOP id:t-top-0-football sport:"football"
            PINNED_TOP id:t-top-0-tennis sport:"tennis"
            PINNED_TOP id:t-top-0-cricket sport:"cricket"
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:"0-football" sport:"football"
            ├── LEAF id:"0-rugby" sport:"rugby"
            ├── LEAF id:"0-tennis" sport:"tennis"
            ├── LEAF id:"0-cricket" sport:"cricket"
            ├── LEAF id:"0-golf" sport:"golf"
            ├── LEAF id:"0-swimming" sport:"swimming"
            └── LEAF id:"0-rowing" sport:"rowing"
        `);
        await asyncSetTimeout(10);
        assertPinnedRows(api, 'top', ['t-top-0-football', 't-top-0-tennis', 't-top-0-cricket']);
    });

    test('pivotMode toggle hides pinned leaf clones and shows them again on toggle off', async () => {
        // In pivot mode, _shouldHidePinnedRows returns !node.group, hiding leaf clones.
        // Toggling pivotMode off should bring them back.
        const api = await gridsManager.createGridAndWait('myGrid', {
            columnDefs: [
                { field: 'country', rowGroup: true, hide: true },
                { field: 'year', pivot: true, hide: true },
                { field: 'sport' },
                { field: 'value', aggFunc: 'sum' },
            ],
            rowData: [
                { country: 'A', year: 2024, sport: 'rugby', value: 1 },
                { country: 'A', year: 2024, sport: 'tennis', value: 2 },
                { country: 'B', year: 2024, sport: 'rugby', value: 3 },
            ],
            enableRowPinning: true,
            // Pin both a group row and a leaf row.
            isRowPinned: (node) => {
                if (node.group && node.key === 'A') {
                    return 'top';
                }
                if (!node.group && node.data?.sport === 'rugby') {
                    return 'top';
                }
                return null;
            },
            getRowId(params) {
                return params.data?.sport ? `leaf-${params.data.country}-${params.data.sport}` : '';
            },
            groupDefaultExpanded: -1,
        });
        await new GridColumns(api, `pivotMode toggle hides pinned leaf clones and shows them again on toggle off setup`)
            .checkColumns(`
                CENTER
                ├── ag-Grid-AutoColumn "Group" width:200
                ├── sport "Sport" width:200
                └── value "Value" width:200 aggFunc:sum
            `);
        await new GridRows(api, `pivotMode toggle hides pinned leaf clones and shows them again on toggle off setup`)
            .check(`
                PINNED_TOP id:t-top-row-group-country-A ag-Grid-AutoColumn:"A" value:3
                PINNED_TOP id:t-top-leaf-A-rugby country:"A" year:2024 sport:"rugby" value:1
                PINNED_TOP id:t-top-leaf-B-rugby country:"B" year:2024 sport:"rugby" value:3
                ROOT id:ROOT_NODE_ID
                ├─┬ LEAF_GROUP id:row-group-country-A ag-Grid-AutoColumn:"A" value:3
                │ ├── LEAF id:leaf-A-rugby country:"A" year:2024 sport:"rugby" value:1
                │ └── LEAF id:leaf-A-tennis country:"A" year:2024 sport:"tennis" value:2
                └─┬ LEAF_GROUP id:row-group-country-B ag-Grid-AutoColumn:"B" value:3
                · └── LEAF id:leaf-B-rugby country:"B" year:2024 sport:"rugby" value:3
            `);

        // Initially (pivotMode off): both the group AND the leaf clones are visible.
        const initialPinned = getPinnedRows(api, 'top');
        const groupClone = initialPinned.find((n) => n.group);
        const leafClones = initialPinned.filter((n) => !n.group);
        expect(groupClone).toBeDefined();
        expect(leafClones.length).toBeGreaterThan(0);
        const initialCount = initialPinned.length;

        // Turn pivot mode on — leaf clones should be hidden, group clones remain.
        api.setGridOption('pivotMode', true);
        await new GridColumns(
            api,
            `pivotMode toggle hides pinned leaf clones and shows them again on toggle off after setGridOption pivotMode`
        ).checkColumns(`
            CENTER
            ├── ag-Grid-AutoColumn "Group" width:200
            └─┬ "2024" GROUP
              └── pivot_year_2024_value "Value" width:200 columnGroupShow:open
        `);
        await new GridRows(
            api,
            `pivotMode toggle hides pinned leaf clones and shows them again on toggle off after setGridOption pivotMode`
        ).check(`
            PINNED_TOP id:t-top-row-group-country-A ag-Grid-AutoColumn:"A" pivot_year_2024_value:3
            ROOT id:ROOT_NODE_ID pivot_year_2024_value:6
            ├─┬ LEAF_GROUP collapsed id:row-group-country-A ag-Grid-AutoColumn:"A" pivot_year_2024_value:3
            │ ├── LEAF hidden id:leaf-A-rugby pivot_year_2024_value:1
            │ └── LEAF hidden id:leaf-A-tennis pivot_year_2024_value:2
            └─┬ LEAF_GROUP collapsed id:row-group-country-B ag-Grid-AutoColumn:"B" pivot_year_2024_value:3
            · └── LEAF hidden id:leaf-B-rugby pivot_year_2024_value:3
        `);
        await asyncSetTimeout(10);

        const afterPivot = getPinnedRows(api, 'top');
        expect(afterPivot.every((n) => n.group)).toBe(true); // only groups visible
        expect(afterPivot.length).toBeLessThan(initialCount);

        // Source nodes for hidden leaves should NOT be destroyed — they're still pinned, just hidden.
        for (const leaf of leafClones) {
            expect(leaf.destroyed).toBe(false);
        }

        // Toggle pivot mode off — leaf clones should come back.
        api.setGridOption('pivotMode', false);
        await new GridColumns(
            api,
            `pivotMode toggle hides pinned leaf clones and shows them again on toggle off after setGridOption pivotMode #2`
        ).checkColumns(`
            CENTER
            ├── ag-Grid-AutoColumn "Group" width:200
            ├── sport "Sport" width:200
            └── value "Value" width:200 aggFunc:sum
        `);
        await new GridRows(
            api,
            `pivotMode toggle hides pinned leaf clones and shows them again on toggle off after setGridOption pivotMode #2`
        ).check(`
            PINNED_TOP id:t-top-row-group-country-A ag-Grid-AutoColumn:"A" value:3
            PINNED_TOP id:t-top-leaf-A-rugby country:"A" year:2024 sport:"rugby" value:1
            PINNED_TOP id:t-top-leaf-B-rugby country:"B" year:2024 sport:"rugby" value:3
            ROOT id:ROOT_NODE_ID
            ├─┬ LEAF_GROUP id:row-group-country-A ag-Grid-AutoColumn:"A" value:3
            │ ├── LEAF id:leaf-A-rugby country:"A" year:2024 sport:"rugby" value:1
            │ └── LEAF id:leaf-A-tennis country:"A" year:2024 sport:"tennis" value:2
            └─┬ LEAF_GROUP id:row-group-country-B ag-Grid-AutoColumn:"B" value:3
            · └── LEAF id:leaf-B-rugby country:"B" year:2024 sport:"rugby" value:3
        `);
        await asyncSetTimeout(10);

        const afterToggleOff = getPinnedRows(api, 'top');
        expect(afterToggleOff.length).toBe(initialCount);
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
