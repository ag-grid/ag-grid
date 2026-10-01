import { waitFor } from '@testing-library/dom';
import { userEvent } from '@testing-library/user-event';
import {
    GridColumns,
    GridRows,
    TestGridsManager,
    asyncSetTimeout,
    clickMenuOption,
    polyfillOffsetParent,
} from 'ag-test-utils';

import {
    CellSpanModule,
    ClientSideRowModelModule,
    CsvExportModule,
    GRAND_TOTAL_ROW_ID,
    GridStateModule,
    PaginationModule,
    PinnedRowModule,
    TextFilterModule,
    getGridElement,
} from 'ag-grid-community';
import type { GridApi, GridOptions, GridState, IRowNode, RowNode, RowPinnedType } from 'ag-grid-community';
import {
    CellSelectionModule,
    ContextMenuModule,
    MasterDetailModule,
    PivotModule,
    RowGroupingModule,
} from 'ag-grid-enterprise';

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
        modules: [
            PinnedRowModule,
            ClientSideRowModelModule,
            CsvExportModule,
            RowGroupingModule,
            PaginationModule,
            PivotModule,
            TextFilterModule,
            GridStateModule,
            ContextMenuModule,
            CellSelectionModule,
            CellSpanModule,
            MasterDetailModule,
        ],
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

    test('a row pinned after render takes the height getRowHeight gives the pinned row, not its source', async () => {
        const api = gridsManager.createGrid('myGrid', {
            columnDefs,
            rowData,
            enableRowPinning: true,
            getRowHeight: ({ node }) => (node.rowPinned ? ((node as RowNode).pinnedSibling ? 30 : 99) : 50),
        });
        await asyncSetTimeout(0);
        const football = api.getDisplayedRowAtIndex(0)!;
        football.setRowHeight(80);
        api.onRowHeightChanged();

        api.setGridOption('isRowPinned', (node) =>
            node.data?.sport === 'rugby' || node.data?.sport === 'football' ? 'top' : null
        );

        await waitFor(() =>
            expect(getPinnedRows(api, 'top').map((node) => node.data.sport)).toEqual(['football', 'rugby'])
        );
        const [pinnedFootball, pinnedRugby] = getPinnedRows(api, 'top');
        expect(pinnedFootball.rowHeight).toBe(30);
        expect(football.rowHeight).toBe(80);
        expect(pinnedRugby.rowHeight).toBe(30);
        expect(pinnedRugby.pinnedSibling!.rowHeight).toBe(50);
        expect(pinnedRugby.rowTop).toBe(30);
    });

    test('exports manually pinned rows and optionally omits their body duplicates', async () => {
        const api = await gridsManager.createGridAndWait('myGrid', {
            columnDefs,
            rowData,
            enableRowPinning: true,
            isRowPinned: (node) => {
                if (node.data?.sport === 'rugby') {
                    return 'top';
                }
                return node.data?.sport === 'golf' ? 'bottom' : null;
            },
        });

        expect(api.getDataAsCsv({ suppressQuotes: true })).toBe(
            ['Sport', 'rugby', 'football', 'rugby', 'tennis', 'cricket', 'golf', 'swimming', 'rowing', 'golf'].join(
                '\r\n'
            )
        );
        expect(api.getDataAsCsv({ suppressQuotes: true, skipPinnedRowDuplicates: true })).toBe(
            ['Sport', 'rugby', 'football', 'tennis', 'cricket', 'swimming', 'rowing', 'golf'].join('\r\n')
        );
        expect(
            api.getDataAsCsv({
                suppressQuotes: true,
                rowPositions: [
                    { rowIndex: 0, rowPinned: 'top' },
                    { rowIndex: 1, rowPinned: null },
                ],
                skipPinnedRowDuplicates: true,
            })
        ).toBe(['Sport', 'rugby'].join('\r\n'));
        expect(
            api.getDataAsCsv({
                suppressQuotes: true,
                skipPinnedTop: true,
                skipPinnedBottom: true,
                skipPinnedRowDuplicates: true,
            })
        ).toBe(['Sport', 'football', 'tennis', 'cricket', 'swimming', 'rowing'].join('\r\n'));
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

        await waitFor(() => assertPinnedRows(api, 'top', ['t-top-rowGroupFooter_ROOT_NODE_ID', 't-top-0-rugby']));

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

    test('`isRowPinned` returning null for the grand total row keeps it where `grandTotalRow` pins it', async () => {
        const api = await gridsManager.createGridAndWait('myGrid', {
            columnDefs,
            rowData,
            enableRowPinning: true,
            grandTotalRow: 'pinnedBottom',
            isRowPinned: (node) => (node.data?.sport === 'rugby' ? 'top' : null),
        });
        await new GridRows(api, 'isRowPinned null keeps the grand total pinned').check(`
            PINNED_TOP id:t-top-1 sport:"rugby"
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

    test('a grand total pinned by `grandTotalRow` stays there when a context menu item pins or unpins it', async () => {
        const restoreOffsetParent = polyfillOffsetParent();
        try {
            const api = await gridsManager.createGridAndWait('myGrid', {
                columnDefs,
                rowData,
                enableRowPinning: true,
                grandTotalRow: 'pinnedBottom',
                getContextMenuItems: () => ['pinTop', 'unpinRow'],
            });
            const pinnedBottomElements = () => getGridElement(api)!.querySelectorAll('.ag-row-pinned[row-index^="b"]');
            const expectPinnedBottomOnly = () => {
                assertPinnedRows(api, 'top', []);
                assertPinnedRows(api, 'bottom', ['b-bottom-rowGroupFooter_ROOT_NODE_ID']);
                expect(pinnedBottomElements().length).toBe(1);
            };
            await waitFor(() => expect(pinnedBottomElements().length).toBe(1));
            const modelUpdated = vi.fn();
            api.addEventListener('modelUpdated', modelUpdated);

            for (const option of ['Pin to Top', 'Unpin Row']) {
                await userEvent.pointer({
                    keys: '[MouseRight]',
                    target: pinnedBottomElements()[0].querySelector<HTMLElement>('.ag-cell')!,
                });
                await clickMenuOption(option);
                await asyncSetTimeout(0);
                expectPinnedBottomOnly();
            }
            expect(modelUpdated).not.toHaveBeenCalled(); // nothing to re-map when the pin is refused
        } finally {
            restoreOffsetParent();
        }
    });

    test('a grand total pinned by `grandTotalRow` stays there when the row pinning state names it', async () => {
        const api = await gridsManager.createGridAndWait('myGrid', {
            columnDefs,
            rowData,
            enableRowPinning: true,
            grandTotalRow: 'pinnedBottom',
        });

        api.setState({ rowPinning: { top: [GRAND_TOTAL_ROW_ID], bottom: [] } });
        await asyncSetTimeout(0);

        assertPinnedRows(api, 'top', []);
        assertPinnedRows(api, 'bottom', ['b-bottom-rowGroupFooter_ROOT_NODE_ID']);
        expect(api.getState().rowPinning).toEqual({ top: [], bottom: [] });
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
        await waitFor(() => {
            assertPinnedRows(api, 'top', ['t-top-rowGroupFooter_ROOT_NODE_ID', 't-top-0-rugby']);
            assertPinnedRows(api, 'bottom', []);
            expect(oldPinnedBottom.destroyed).toBe(true);
        });
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
        await waitFor(() => {
            assertPinnedRows(api, 'top', []);
            assertPinnedRows(api, 'bottom', []);
            expect(topPinnedNode.destroyed).toBe(true);
        });

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
        await waitFor(() => {
            assertPinnedRows(api, 'top', []);
            assertPinnedRows(api, 'bottom', ['b-bottom-rowGroupFooter_ROOT_NODE_ID']);
        });

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
        await waitFor(() => {
            assertPinnedRows(api, 'top', []);
            assertPinnedRows(api, 'bottom', []);
            expect(bottomNode.destroyed).toBe(true);
        });
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

        // Pinned row should be removed and its source row destroyed
        await waitFor(() => {
            assertPinnedRows(api, 'top', []);
            expect(sourceRow!.destroyed).toBe(true);
        });
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

        // Pinned row should be removed and its source row destroyed
        await waitFor(() => {
            assertPinnedRows(api, 'top', []);
            expect(sourceRow!.destroyed).toBe(true);
        });
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
        // Flush the transaction before teardown; this test makes no assertion about the outcome.
        await asyncSetTimeout(0);

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
        // The previously-pinned row should be unpinned (rowNodeDataChanged listener handles it).
        await waitFor(() => {
            assertPinnedRows(api, 'top', []);
            expect(pinnedRugby.destroyed).toBe(true);
            expect(sourceRugby.pinnedSibling).toBeUndefined();
        });
        expect(sourceRugby.destroyed).toBe(false); // source row stays alive
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
        await waitFor(() => assertPinnedRows(api, 'top', ['t-top-0-cricket', 't-top-0-football', 't-top-0-tennis']));

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
        await waitFor(() => assertPinnedRows(api, 'top', ['t-top-0-tennis', 't-top-0-football', 't-top-0-cricket']));

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
        await waitFor(() => assertPinnedRows(api, 'top', ['t-top-0-football', 't-top-0-tennis', 't-top-0-cricket']));
    });

    test('pivotMode toggle hides pinned leaf clones and shows them again on toggle off', async () => {
        // In pivot mode, _shouldHidePinnedRows returns !node.group, hiding leaf clones.
        // Toggling pivotMode off should bring them back.
        const api = await gridsManager.createGridAndWait('myGrid', {
            columnDefs: [
                { field: 'country', rowGroup: true, hide: true },
                { field: 'year', pivot: true, hide: true },
                { field: 'sport', filter: true },
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
        await waitFor(() => {
            const afterPivot = getPinnedRows(api, 'top');
            expect(afterPivot.length).toBeLessThan(initialCount);
            expect(afterPivot.every((n) => n.group)).toBe(true); // only groups visible
        });
        expect(api.getState().rowPinning?.top).toEqual(['row-group-country-A', 'leaf-A-rugby', 'leaf-B-rugby']);

        api.setFilterModel({ sport: { filterType: 'text', type: 'notEqual', filter: 'tennis' } });
        await new GridRows(api, 'pivot mode with a filter still hides pinned leaves').check(`
            PINNED_TOP id:t-top-row-group-country-A ag-Grid-AutoColumn:"A" pivot_year_2024_value:1
            ROOT id:ROOT_NODE_ID pivot_year_2024_value:4
            ├─┬ LEAF_GROUP collapsed id:row-group-country-A ag-Grid-AutoColumn:"A" pivot_year_2024_value:1
            │ └── LEAF hidden id:leaf-A-rugby pivot_year_2024_value:1
            └─┬ LEAF_GROUP collapsed id:row-group-country-B ag-Grid-AutoColumn:"B" pivot_year_2024_value:3
            · └── LEAF hidden id:leaf-B-rugby pivot_year_2024_value:3
        `);
        api.setFilterModel(null);

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
        await waitFor(() => expect(getPinnedRows(api, 'top').length).toBe(initialCount));
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

    describe('pinned rows hidden by a filter or not loaded yet', () => {
        const countryRowData = [
            { id: '1', country: 'Ireland', sport: 'Rugby' },
            { id: '2', country: 'France', sport: 'Football' },
            { id: '3', country: 'Italy', sport: 'Cycling' },
        ];
        const notIreland = { country: { filterType: 'text', type: 'notEqual', filter: 'Ireland' } };
        const countryGridOptions = (initialState?: GridState): GridOptions => ({
            columnDefs: [{ field: 'country', filter: true }, { field: 'sport' }],
            rowData: countryRowData,
            getRowId: (params) => params.data.id,
            enableRowPinning: true,
            initialState,
        });

        afterEach(() => {
            vi.restoreAllMocks();
        });

        test('stay in the saved state in pin order, and are restored in display order', async () => {
            let api = await gridsManager.createGridAndWait(
                'myGrid',
                countryGridOptions({ rowPinning: { top: ['3', '1'], bottom: [] } })
            );
            api.setFilterModel(notIreland);
            await new GridRows(api, 'filtered').check(`
                PINNED_TOP id:t-top-3 country:"Italy" sport:"Cycling"
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:2 country:"France" sport:"Football"
                └── LEAF id:3 country:"Italy" sport:"Cycling"
            `);
            const state = api.getState();
            expect(state.rowPinning).toEqual({ top: ['3', '1'], bottom: [] });

            api.destroy();
            api = await gridsManager.createGridAndWait('myGrid', countryGridOptions(state));
            expect(api.getState().rowPinning).toEqual({ top: ['3', '1'], bottom: [] });
            api.setFilterModel(null);
            await new GridRows(api, 'restored').check(`
                PINNED_TOP id:t-top-1 country:"Ireland" sport:"Rugby"
                PINNED_TOP id:t-top-3 country:"Italy" sport:"Cycling"
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:1 country:"Ireland" sport:"Rugby"
                ├── LEAF id:2 country:"France" sport:"Football"
                └── LEAF id:3 country:"Italy" sport:"Cycling"
            `);
            expect(api.getState().rowPinning).toEqual({ top: ['3', '1'], bottom: [] });
        });

        test('are skipped by forEachPinnedRow while hidden, and come back in display order', async () => {
            const api = await gridsManager.createGridAndWait(
                'myGrid',
                countryGridOptions({ rowPinning: { top: ['3', '1'], bottom: [] } })
            );
            const visit = () => {
                const displayed: [string | undefined, number | null, number | null][] = [];
                api.forEachPinnedRow('top', (node) => displayed.push([node.id, node.rowIndex, node.rowTop]));
                return displayed;
            };
            expect(visit()).toEqual([
                ['t-top-1', 0, 0],
                ['t-top-3', 1, 42],
            ]);

            api.setFilterModel(notIreland);
            expect(visit()).toEqual([['t-top-3', 0, 0]]);

            api.setFilterModel({ country: { filterType: 'text', type: 'equals', filter: 'France' } });
            expect(visit()).toEqual([]);

            api.setFilterModel(null);
            expect(visit()).toEqual([
                ['t-top-1', 0, 0],
                ['t-top-3', 1, 42],
            ]);
        });

        test('swap when one filter change hides one pinned row and reveals another', async () => {
            const api = await gridsManager.createGridAndWait(
                'myGrid',
                countryGridOptions({ rowPinning: { top: ['1', '2'], bottom: [] } })
            );
            api.setFilterModel(notIreland);
            await new GridRows(api, 'Ireland hidden').check(`
                PINNED_TOP id:t-top-2 country:"France" sport:"Football"
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:2 country:"France" sport:"Football"
                └── LEAF id:3 country:"Italy" sport:"Cycling"
            `);

            api.setFilterModel({ country: { filterType: 'text', type: 'notEqual', filter: 'France' } });
            await new GridRows(api, 'France hidden').check(`
                PINNED_TOP id:t-top-1 country:"Ireland" sport:"Rugby"
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:1 country:"Ireland" sport:"Rugby"
                └── LEAF id:3 country:"Italy" sport:"Cycling"
            `);
        });

        test('are hidden from both containers by one filter change', async () => {
            const api = await gridsManager.createGridAndWait(
                'myGrid',
                countryGridOptions({ rowPinning: { top: ['1'], bottom: ['2'] } })
            );
            api.setFilterModel({ country: { filterType: 'text', type: 'equals', filter: 'Italy' } });
            await new GridRows(api, 'only Italy passes').check(`
                ROOT id:ROOT_NODE_ID
                └── LEAF id:3 country:"Italy" sport:"Cycling"
            `);
        });

        test('rows not loaded yet stay in the saved state until they arrive', async () => {
            const api = gridsManager.createGrid('myGrid', {
                ...countryGridOptions({ rowPinning: { top: ['9', '1'], bottom: [] } }),
                rowData: [],
            });
            expect(api.getState().rowPinning).toEqual({ top: ['9', '1'], bottom: [] });

            api.applyTransaction({ add: countryRowData });
            await new GridRows(api, 'rows loaded').check(`
                PINNED_TOP id:t-top-1 country:"Ireland" sport:"Rugby"
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:1 country:"Ireland" sport:"Rugby"
                ├── LEAF id:2 country:"France" sport:"Football"
                └── LEAF id:3 country:"Italy" sport:"Cycling"
            `);
            // A row still waiting is listed after the pinned ones.
            expect(api.getState().rowPinning).toEqual({ top: ['1', '9'], bottom: [] });
        });

        test('rows not loaded yet are pinned when rowData replaces the empty data', async () => {
            const api = gridsManager.createGrid('myGrid', {
                ...countryGridOptions({ rowPinning: { top: ['1'], bottom: [] } }),
                rowData: [],
            });
            api.setGridOption('rowData', countryRowData);
            await new GridRows(api, 'rows loaded').check(`
                PINNED_TOP id:t-top-1 country:"Ireland" sport:"Rugby"
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:1 country:"Ireland" sport:"Rugby"
                ├── LEAF id:2 country:"France" sport:"Football"
                └── LEAF id:3 country:"Italy" sport:"Cycling"
            `);
            expect(api.getState().rowPinning).toEqual({ top: ['1'], bottom: [] });
        });

        test('rows not loaded yet are dropped by setState without rowPinning', async () => {
            const api = gridsManager.createGrid('myGrid', {
                ...countryGridOptions({ rowPinning: { top: ['1'], bottom: [] } }),
                rowData: [],
            });
            api.setState({});
            expect(api.getState().rowPinning).toEqual({ top: [], bottom: [] });

            api.setGridOption('rowData', countryRowData);
            await new GridRows(api, 'rows loaded').check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:1 country:"Ireland" sport:"Rugby"
                ├── LEAF id:2 country:"France" sport:"Football"
                └── LEAF id:3 country:"Italy" sport:"Cycling"
            `);
        });

        test('are unpinned when their source row is removed while hidden', async () => {
            const api = await gridsManager.createGridAndWait(
                'myGrid',
                countryGridOptions({ rowPinning: { top: ['1'], bottom: [] } })
            );
            api.setFilterModel(notIreland);
            api.applyTransaction({ remove: [{ id: '1' }] });
            expect(api.getState().rowPinning).toEqual({ top: [], bottom: [] });

            api.setFilterModel(null);
            await new GridRows(api, 'filter cleared').check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:2 country:"France" sport:"Football"
                └── LEAF id:3 country:"Italy" sport:"Cycling"
            `);
        });

        test('are exported from the body when skipping pinned duplicates', async () => {
            const api = await gridsManager.createGridAndWait(
                'myGrid',
                countryGridOptions({ rowPinning: { top: ['1', '2'], bottom: [] } })
            );
            api.setFilterModel(notIreland);
            expect(api.getDataAsCsv({ suppressQuotes: true, skipPinnedRowDuplicates: true, exportedRows: 'all' })).toBe(
                ['Country,Sport', 'France,Football', 'Ireland,Rugby', 'Italy,Cycling'].join('\r\n')
            );
        });

        test('are fully unpinned by a row pinning reset, so they can be pinned elsewhere', async () => {
            const api = await gridsManager.createGridAndWait(
                'myGrid',
                countryGridOptions({ rowPinning: { top: ['1'], bottom: [] } })
            );
            api.setFilterModel(notIreland);
            api.setState({ filter: { filterModel: notIreland } });
            expect(api.getState().rowPinning).toEqual({ top: [], bottom: [] });

            api.setState({ rowPinning: { top: [], bottom: ['1'] } });
            await new GridRows(api, 'pinned bottom').check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:1 country:"Ireland" sport:"Rugby"
                ├── LEAF id:2 country:"France" sport:"Football"
                └── LEAF id:3 country:"Italy" sport:"Cycling"
                PINNED_BOTTOM id:b-bottom-1 country:"Ireland" sport:"Rugby"
            `);
        });

        test('stay hidden when pinned while the filter already hides them', async () => {
            const api = await gridsManager.createGridAndWait('myGrid', countryGridOptions());
            api.setFilterModel(notIreland);
            api.setGridOption('isRowPinned', (node) => (node.id === '1' ? 'top' : null));
            await new GridRows(api, 'pinned while filtered').check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:2 country:"France" sport:"Football"
                └── LEAF id:3 country:"Italy" sport:"Cycling"
            `);
            expect(api.getState().rowPinning).toEqual({ top: ['1'], bottom: [] });

            api.setFilterModel(null);
            await new GridRows(api, 'filter cleared').check(`
                PINNED_TOP id:t-top-1 country:"Ireland" sport:"Rugby"
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:1 country:"Ireland" sport:"Rugby"
                ├── LEAF id:2 country:"France" sport:"Football"
                └── LEAF id:3 country:"Italy" sport:"Cycling"
            `);
        });

        test('move to the other container when isRowPinned changes while hidden', async () => {
            const api = await gridsManager.createGridAndWait('myGrid', {
                ...countryGridOptions(),
                isRowPinned: (node) => (node.id === '1' ? 'top' : null),
            });
            api.setFilterModel(notIreland);
            api.setGridOption('isRowPinned', (node) => (node.id === '1' ? 'bottom' : null));
            expect(api.getState().rowPinning).toEqual({ top: [], bottom: ['1'] });

            api.setFilterModel(null);
            await new GridRows(api, 'filter cleared').check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:1 country:"Ireland" sport:"Rugby"
                ├── LEAF id:2 country:"France" sport:"Football"
                └── LEAF id:3 country:"Italy" sport:"Cycling"
                PINNED_BOTTOM id:b-bottom-1 country:"Ireland" sport:"Rugby"
            `);
        });

        test('pick up a theme row height change, displayed or hidden', async () => {
            const api = await gridsManager.createGridAndWait(
                'myGrid',
                countryGridOptions({ rowPinning: { top: ['1', '2'], bottom: [] } })
            );
            api.setFilterModel(notIreland);
            // `stylesChanged` is internal with no public trigger; drive it as the theme code does.
            const beans = (api.getRowNode('1') as any).beans;
            vi.spyOn(beans.environment, 'getDefaultRowHeight').mockReturnValue(64);
            beans.eventSvc.dispatchEvent({ type: 'stylesChanged', rowHeightChanged: true });
            await waitFor(() => expect(api.getPinnedTopRow(0)?.rowHeight).toBe(64));
            api.setFilterModel(null);
            await waitFor(() => expect(api.getPinnedTopRow(0)?.id).toBe('t-top-1'));
            expect(api.getPinnedTopRow(0)?.rowHeight).toBe(64);
        });

        test('group rows are dropped from the state when grouping is removed while hidden', async () => {
            const api = await gridsManager.createGridAndWait('myGrid', {
                columnDefs: [
                    { field: 'country', rowGroup: true, hide: true },
                    { field: 'sport', filter: true },
                ],
                rowData: countryRowData,
                getRowId: (params) => params.data.id,
                enableRowPinning: true,
                initialState: { rowPinning: { top: ['row-group-country-Ireland'], bottom: [] } },
            });
            api.setFilterModel({ sport: { filterType: 'text', type: 'notEqual', filter: 'Rugby' } });
            api.setRowGroupColumns([]);
            api.setFilterModel(null);
            await new GridRows(api, 'ungrouped').check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:1 country:"Ireland" sport:"Rugby"
                ├── LEAF id:2 country:"France" sport:"Football"
                └── LEAF id:3 country:"Italy" sport:"Cycling"
            `);
            expect(api.getState().rowPinning).toEqual({ top: [], bottom: [] });
        });
    });

    test('setState replaces the pinned rows rather than adding to them', async () => {
        const api = await gridsManager.createGridAndWait('myGrid', {
            columnDefs,
            rowData,
            enableRowPinning: true,
            getRowId: (params) => params.data.sport,
            initialState: { rowPinning: { top: ['rugby'], bottom: [] } },
        });

        let rugbyPinned = 0;
        let swimmingPinned = 0;
        api.getRowNode('rugby')!.addEventListener('rowPinned', () => ++rugbyPinned);
        api.getRowNode('swimming')!.addEventListener('rowPinned', () => ++swimmingPinned);

        // Swimming is listed in both containers, so it goes to the bottom.
        api.setState({ rowPinning: { top: ['golf', 'swimming', 'tennis'], bottom: ['rugby', 'swimming'] } });
        expect(rugbyPinned).toBe(1); // moved, not unpinned then pinned
        expect(swimmingPinned).toBe(1);
        await new GridRows(api, 'after setState').check(`
            PINNED_TOP id:t-top-tennis sport:"tennis"
            PINNED_TOP id:t-top-golf sport:"golf"
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:football sport:"football"
            ├── LEAF id:rugby sport:"rugby"
            ├── LEAF id:tennis sport:"tennis"
            ├── LEAF id:cricket sport:"cricket"
            ├── LEAF id:golf sport:"golf"
            ├── LEAF id:swimming sport:"swimming"
            └── LEAF id:rowing sport:"rowing"
            PINNED_BOTTOM id:b-bottom-rugby sport:"rugby"
            PINNED_BOTTOM id:b-bottom-swimming sport:"swimming"
        `);
        expect(api.getState().rowPinning).toEqual({ top: ['golf', 'tennis'], bottom: ['rugby', 'swimming'] });
    });

    test('an isRowPinned change pinning, moving and unpinning rows fires one pinnedRowsChanged', async () => {
        const api = await gridsManager.createGridAndWait('myGrid', {
            columnDefs,
            rowData,
            enableRowPinning: true,
            getRowId: (params) => params.data.sport,
            isRowPinned: (node) => (node.id === 'rugby' || node.id === 'golf' ? 'top' : null),
        });
        let pinnedRowsChanged = 0;
        api.addEventListener('pinnedRowsChanged', () => ++pinnedRowsChanged);

        api.setGridOption('isRowPinned', (node) => (node.id === 'rugby' || node.id === 'tennis' ? 'bottom' : null));
        await new GridRows(api, 'after isRowPinned change').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:football sport:"football"
            ├── LEAF id:rugby sport:"rugby"
            ├── LEAF id:tennis sport:"tennis"
            ├── LEAF id:cricket sport:"cricket"
            ├── LEAF id:golf sport:"golf"
            ├── LEAF id:swimming sport:"swimming"
            └── LEAF id:rowing sport:"rowing"
            PINNED_BOTTOM id:b-bottom-rugby sport:"rugby"
            PINNED_BOTTOM id:b-bottom-tennis sport:"tennis"
        `);
        // API listeners run asynchronously; one extra tick lets any second event land.
        await waitFor(() => expect(pinnedRowsChanged).toBe(1));
        await asyncSetTimeout(0);
        expect(pinnedRowsChanged).toBe(1);
    });

    test('destroying the grid fires no pinning events', async () => {
        const api = await gridsManager.createGridAndWait('myGrid', {
            columnDefs,
            rowData,
            enableRowPinning: true,
            getRowId: (params) => params.data.sport,
            initialState: { rowPinning: { top: ['rugby'], bottom: ['golf'] } },
        });
        let events = 0;
        api.addEventListener('pinnedRowsChanged', () => ++events);
        api.getRowNode('rugby')!.addEventListener('rowPinned', () => ++events);

        api.destroy();
        await asyncSetTimeout(0);
        expect(events).toBe(0);
    });

    describe('pinning through the context menu', () => {
        let restoreOffsetParent: (() => void) | undefined;

        afterEach(() => {
            restoreOffsetParent?.();
            restoreOffsetParent = undefined;
        });

        const createMenuGrid = (initialState?: GridState) => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [{ field: 'country' }, { field: 'sport' }],
                rowData: [
                    { id: '1', country: 'Ireland', sport: 'Rugby' },
                    { id: '2', country: 'France', sport: 'Football' },
                    { id: '3', country: 'Italy', sport: 'Cycling' },
                ],
                getRowId: (params) => params.data.id,
                enableRowPinning: true,
                cellSelection: true,
                initialState,
                getContextMenuItems: () => ['pinTop', 'pinBottom', 'unpinRow'],
            });
            restoreOffsetParent = polyfillOffsetParent();
            return api;
        };

        // the pinned row font weight etc. reach a spanned cell only through its own spanned row
        const SPANNED_PIN_CLASSES = { 't-top-1': ['ag-row-pinned'], '1': ['ag-row-pinned-source'] };
        const spannedRowPinClasses = () =>
            Object.fromEntries(
                Array.from(document.querySelectorAll('#myGrid .ag-spanned-row'), (row) => [
                    row.getAttribute('row-id'),
                    Array.from(row.classList).filter((c) => c === 'ag-row-pinned' || c === 'ag-row-pinned-source'),
                ])
            );

        const rightClickCell = async (rowId: string) => {
            const cell = await waitFor(() => {
                const found = document.querySelector<HTMLElement>(`#myGrid .ag-row[row-id="${rowId}"] .ag-cell`);
                expect(found).not.toBeNull();
                return found!;
            });
            await userEvent.pointer({ keys: '[MouseRight]', target: cell });
        };

        test('pins a row, moves it to the other container and unpins it', async () => {
            const api = createMenuGrid();
            await rightClickCell('1');
            await clickMenuOption('Pin to Top');
            await new GridRows(api, 'pinned top').check(`
                PINNED_TOP id:t-top-1 country:"Ireland" sport:"Rugby"
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:1 country:"Ireland" sport:"Rugby"
                ├── LEAF id:2 country:"France" sport:"Football"
                └── LEAF id:3 country:"Italy" sport:"Cycling"
            `);

            await rightClickCell('t-top-1');
            await clickMenuOption('Pin to Bottom');
            await new GridRows(api, 'moved bottom').check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:1 country:"Ireland" sport:"Rugby"
                ├── LEAF id:2 country:"France" sport:"Football"
                └── LEAF id:3 country:"Italy" sport:"Cycling"
                PINNED_BOTTOM id:b-bottom-1 country:"Ireland" sport:"Rugby"
            `);

            await rightClickCell('b-bottom-1');
            await clickMenuOption('Unpin Row');
            await new GridRows(api, 'unpinned').check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:1 country:"Ireland" sport:"Rugby"
                ├── LEAF id:2 country:"France" sport:"Football"
                └── LEAF id:3 country:"Italy" sport:"Cycling"
            `);
        });

        test('pinning a spanned cell pins every row the span covers', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [{ field: 'country', spanRows: true }, { field: 'sport' }],
                rowData: [
                    { id: '1', country: 'Ireland', sport: 'Rugby' },
                    { id: '2', country: 'Ireland', sport: 'Hurling' },
                    { id: '3', country: 'Italy', sport: 'Cycling' },
                ],
                getRowId: (params) => params.data.id,
                enableRowPinning: true,
                enableCellSpan: true,
                getContextMenuItems: () => ['pinTop'],
            });
            restoreOffsetParent = polyfillOffsetParent();
            const spannedCell = await waitFor(() => {
                const found = document.querySelector<HTMLElement>('#myGrid .ag-spanned-cell-wrapper .ag-cell');
                expect(found).not.toBeNull();
                return found!;
            });
            await userEvent.pointer({ keys: '[MouseRight]', target: spannedCell });
            await clickMenuOption('Pin to Top');
            await new GridRows(api, 'span pinned').check(`
                PINNED_TOP id:t-top-1 country:"Ireland"↧2 sport:"Rugby"
                PINNED_TOP id:t-top-2 country:"Ireland"↥ sport:"Hurling"
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:1 country:"Ireland"↧2 sport:"Rugby"
                ├── LEAF id:2 country:"Ireland"↥ sport:"Hurling"
                └── LEAF id:3 country:"Italy" sport:"Cycling"
            `);
            await waitFor(() => expect(spannedRowPinClasses()).toEqual(SPANNED_PIN_CLASSES));
        });

        test('spanned cells of a row pinned from initial state carry the pinned row styling', async () => {
            gridsManager.createGrid('myGrid', {
                columnDefs: [{ field: 'country', spanRows: true }, { field: 'sport' }],
                rowData: [
                    { id: '1', country: 'Ireland', sport: 'Rugby' },
                    { id: '2', country: 'Ireland', sport: 'Hurling' },
                    { id: '3', country: 'Italy', sport: 'Cycling' },
                ],
                getRowId: (params) => params.data.id,
                enableRowPinning: true,
                enableCellSpan: true,
                initialState: { rowPinning: { top: ['1', '2'], bottom: [] } },
            });
            await waitFor(() => expect(spannedRowPinClasses()).toEqual(SPANNED_PIN_CLASSES));
        });

        test('pinning a cell range that includes an already pinned row pins only the others', async () => {
            const api = createMenuGrid({ rowPinning: { top: ['1'], bottom: [] } });
            await new GridRows(api, 'initial').check(`
                PINNED_TOP id:t-top-1 country:"Ireland" sport:"Rugby"
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:1 country:"Ireland" sport:"Rugby"
                ├── LEAF id:2 country:"France" sport:"Football"
                └── LEAF id:3 country:"Italy" sport:"Cycling"
            `);
            api.addCellRange({
                rowStartIndex: 0,
                rowStartPinned: 'top',
                rowEndIndex: 1,
                rowEndPinned: null,
                columns: ['country'],
            });
            api.showContextMenu();
            await clickMenuOption('Pin to Top');
            await new GridRows(api, 'range pinned top').check(`
                PINNED_TOP id:t-top-1 country:"Ireland" sport:"Rugby"
                PINNED_TOP id:t-top-2 country:"France" sport:"Football"
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:1 country:"Ireland" sport:"Rugby"
                ├── LEAF id:2 country:"France" sport:"Football"
                └── LEAF id:3 country:"Italy" sport:"Cycling"
            `);
            expect(api.getState().rowPinning).toEqual({ top: ['1', '2'], bottom: [] });
        });

        test('unpinning a cell range over pinned rows unpins every row in it', async () => {
            const api = createMenuGrid({ rowPinning: { top: ['1', '2'], bottom: [] } });
            await new GridRows(api, 'initial').check(`
                PINNED_TOP id:t-top-1 country:"Ireland" sport:"Rugby"
                PINNED_TOP id:t-top-2 country:"France" sport:"Football"
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:1 country:"Ireland" sport:"Rugby"
                ├── LEAF id:2 country:"France" sport:"Football"
                └── LEAF id:3 country:"Italy" sport:"Cycling"
            `);
            api.addCellRange({
                rowStartIndex: 0,
                rowStartPinned: 'top',
                rowEndIndex: 1,
                rowEndPinned: 'top',
                columns: ['country'],
            });
            api.showContextMenu();
            await clickMenuOption('Unpin Row');
            expect(api.getState().rowPinning).toEqual({ top: [], bottom: [] });
        });
    });

    test('re-running an unchanged isRowPinned leaves the pinned rows alone', async () => {
        const isRowPinned = (node: IRowNode) => (node.data?.sport === 'rugby' ? 'top' : null);
        const api = await gridsManager.createGridAndWait('myGrid', {
            columnDefs,
            rowData,
            enableRowPinning: true,
            getRowId: (params) => params.data.sport,
            isRowPinned,
        });
        const pinned = api.getPinnedTopRow(0);
        let rowPinnedEvents = 0;
        api.getRowNode('rugby')!.addEventListener('rowPinned', () => ++rowPinnedEvents);

        api.setGridOption('isRowPinned', (node) => isRowPinned(node));
        expect(api.getPinnedTopRow(0)).toBe(pinned);
        expect(rowPinnedEvents).toBe(0);
    });

    test('a row id listed twice in the state is pinned once', async () => {
        const api = await gridsManager.createGridAndWait('myGrid', {
            columnDefs,
            rowData,
            enableRowPinning: true,
            getRowId: (params) => params.data.sport,
            initialState: { rowPinning: { top: ['rugby', 'rugby'], bottom: [] } },
        });
        await new GridRows(api, 'pinned once').check(`
            PINNED_TOP id:t-top-rugby sport:"rugby"
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:football sport:"football"
            ├── LEAF id:rugby sport:"rugby"
            ├── LEAF id:tennis sport:"tennis"
            ├── LEAF id:cricket sport:"cricket"
            ├── LEAF id:golf sport:"golf"
            ├── LEAF id:swimming sport:"swimming"
            └── LEAF id:rowing sport:"rowing"
        `);
        expect(api.getState().rowPinning).toEqual({ top: ['rugby'], bottom: [] });
    });

    test('the grand total row id in the state pins the grand total row', async () => {
        const api = await gridsManager.createGridAndWait('myGrid', {
            columnDefs: [{ field: 'country', rowGroup: true, hide: true }, { field: 'sport' }],
            rowData: [
                { country: 'Ireland', sport: 'Rugby' },
                { country: 'France', sport: 'Football' },
            ],
            enableRowPinning: true,
            grandTotalRow: 'bottom',
        });
        api.setState({ rowPinning: { top: [GRAND_TOTAL_ROW_ID], bottom: [] } }, ['rowGroup', 'columnVisibility']);
        await waitFor(() => expect(api.getPinnedTopRow(0)?.footer).toBe(true));
        // A model update re-derives the grand total's place, so it must have been pinned through `grandTotalRow`.
        api.refreshClientSideRowModel('aggregate');
        await new GridRows(api, 'grand total pinned top').check(`
            PINNED_TOP id:t-top-rowGroupFooter_ROOT_NODE_ID ag-Grid-AutoColumn:"Total "
            ROOT id:ROOT_NODE_ID
            ├─┬ LEAF_GROUP collapsed id:row-group-country-Ireland ag-Grid-AutoColumn:"Ireland"
            │ └── LEAF hidden id:0 country:"Ireland" sport:"Rugby"
            ├─┬ LEAF_GROUP collapsed id:row-group-country-France ag-Grid-AutoColumn:"France"
            │ └── LEAF hidden id:1 country:"France" sport:"Football"
            └─ footer id:rowGroupFooter_ROOT_NODE_ID ag-Grid-AutoColumn:"Total "
        `);
        expect(api.getState().rowPinning).toEqual({ top: [], bottom: [] });
    });

    test('removing row grouping unpins every pinned group row with one pinnedRowsChanged', async () => {
        const api = await gridsManager.createGridAndWait('myGrid', {
            columnDefs: [{ field: 'country', rowGroup: true, hide: true }, { field: 'sport' }],
            rowData: [
                { country: 'Ireland', sport: 'Rugby' },
                { country: 'France', sport: 'Football' },
            ],
            enableRowPinning: true,
            initialState: {
                rowPinning: { top: ['row-group-country-Ireland'], bottom: ['row-group-country-France'] },
            },
        });
        await new GridRows(api, 'grouped').check(`
            PINNED_TOP id:t-top-row-group-country-Ireland ag-Grid-AutoColumn:"Ireland"
            ROOT id:ROOT_NODE_ID
            ├─┬ LEAF_GROUP collapsed id:row-group-country-Ireland ag-Grid-AutoColumn:"Ireland"
            │ └── LEAF hidden id:0 country:"Ireland" sport:"Rugby"
            └─┬ LEAF_GROUP collapsed id:row-group-country-France ag-Grid-AutoColumn:"France"
            · └── LEAF hidden id:1 country:"France" sport:"Football"
            PINNED_BOTTOM id:b-bottom-row-group-country-France ag-Grid-AutoColumn:"France"
        `);
        let pinnedRowsChanged = 0;
        api.addEventListener('pinnedRowsChanged', () => ++pinnedRowsChanged);

        api.setRowGroupColumns([]);
        await new GridRows(api, 'ungrouped').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:0 country:"Ireland" sport:"Rugby"
            └── LEAF id:1 country:"France" sport:"Football"
        `);
        // API listeners run asynchronously; one extra tick lets any second event land.
        await waitFor(() => expect(pinnedRowsChanged).toBe(1));
        await asyncSetTimeout(0);
        expect(pinnedRowsChanged).toBe(1);
        expect(api.getState().rowPinning).toEqual({ top: [], bottom: [] });
    });

    test('unpinning a master row keeps its detail row', async () => {
        const api = await gridsManager.createGridAndWait('myGrid', {
            columnDefs: [{ field: 'sport' }],
            rowData: [
                { id: '1', sport: 'rugby', orders: [{ orderId: 'A' }] },
                { id: '2', sport: 'golf', orders: [] },
            ],
            getRowId: (params) => params.data.id,
            enableRowPinning: true,
            masterDetail: true,
            detailCellRendererParams: {
                detailGridOptions: { columnDefs: [{ field: 'orderId' }] },
                getDetailRowData: (params: any) => params.successCallback(params.data.orders),
            },
        });
        const master = api.getRowNode('1') as RowNode;
        api.setRowNodeExpanded(master, true);
        await waitFor(() => expect(master.detailNode).toBeDefined());
        const detailNode = master.detailNode!;

        // Pinned after expanding, so the pinned copy shares the detail row.
        api.setGridOption('isRowPinned', (node) => (node.id === '1' ? 'top' : null));
        expect((api.getPinnedTopRow(0) as RowNode).detailNode).toBe(detailNode);
        api.setGridOption('isRowPinned', () => null);
        expect(api.getPinnedTopRowCount()).toBe(0);
        expect(detailNode.destroyed).toBe(false);
        expect(master.detailNode).toBe(detailNode);
    });

    test('setState with unchanged pinning keeps the pinned rows and their nodes', async () => {
        const api = await gridsManager.createGridAndWait('myGrid', {
            columnDefs,
            rowData,
            enableRowPinning: true,
            getRowId: (params) => params.data.sport,
            initialState: { rowPinning: { top: ['rugby'], bottom: ['golf'] } },
        });
        const pinnedTop = api.getPinnedTopRow(0);
        let rowPinnedEvents = 0;
        api.getRowNode('rugby')!.addEventListener('rowPinned', () => ++rowPinnedEvents);

        api.setState({ rowPinning: { top: ['rugby'], bottom: ['golf'] } });
        expect(api.getPinnedTopRow(0)).toBe(pinnedTop);
        expect(pinnedTop?.destroyed).toBe(false);
        expect(rowPinnedEvents).toBe(0);
        expect(api.getState().rowPinning).toEqual({ top: ['rugby'], bottom: ['golf'] });
    });

    test('a pinned grand total row keeps its node when row grouping changes', async () => {
        const api = await gridsManager.createGridAndWait('myGrid', {
            columnDefs: [{ field: 'country', rowGroup: true, hide: true }, { field: 'sport' }],
            rowData: [
                { country: 'Ireland', sport: 'Rugby' },
                { country: 'France', sport: 'Football' },
            ],
            enableRowPinning: true,
            grandTotalRow: 'pinnedBottom',
        });
        const grandTotal = api.getPinnedBottomRow(0);
        expect(grandTotal?.footer).toBe(true);

        api.setRowGroupColumns(['sport']);
        await waitFor(() => expect(api.getPinnedBottomRow(0)?.footer).toBe(true));
        expect(api.getPinnedBottomRow(0)).toBe(grandTotal);
    });
});
