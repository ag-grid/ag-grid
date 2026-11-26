import { waitFor } from '@testing-library/dom';
import { DragEventDispatcher, GridRows, TestGridsManager, asyncSetTimeout } from 'ag-test-utils';

import type {
    AgColumn,
    ColDef,
    ColGroupDef,
    Column,
    GetRowIdParams,
    GridApi,
    GridOptions,
    ICellRendererParams,
    IColumnStateUpdateStrategy,
} from 'ag-grid-community';
import {
    ClientSideRowModelModule,
    ColumnApiModule,
    ColumnAutoSizeModule,
    GridStateModule,
    TextFilterModule,
    getGridElement,
} from 'ag-grid-community';
import { AllEnterpriseModule, PivotModule, RowGroupingModule } from 'ag-grid-enterprise';

describe('the column events of a column tool panel apply', () => {
    const gridsManager = new TestGridsManager({ modules: [AllEnterpriseModule] });

    afterEach(() => {
        gridsManager.reset();
    });

    const ids = (columns: Column[] | null) => (columns ?? []).map((column) => column.getColId()).join();

    test('a column grouped with others by an apply is told once the apply has laid them out', async () => {
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [{ field: 'a' }, { field: 'b' }, { field: 'c' }, { field: 'd' }],
            rowData: [{ a: 1, b: 2, c: 3, d: 4 }],
            sideBar: {
                toolPanels: [
                    {
                        id: 'columns',
                        labelDefault: 'Columns',
                        labelKey: 'columns',
                        iconKey: 'columns',
                        toolPanel: 'agColumnsToolPanel',
                        toolPanelParams: { buttons: ['apply'] },
                    },
                ],
                defaultToolPanel: 'columns',
            },
        });
        const toolPanel = await waitFor(() => {
            const panel = api.getToolPanelInstance('columns') as any;
            expect(panel).toBeTruthy();
            return panel;
        });
        const strategy: IColumnStateUpdateStrategy = toolPanel.beans.columnStateUpdateStrategy;
        const a = api.getColumn('a') as AgColumn;
        const seen: string[] = [];
        a.addEventListener('columnRowGroupChanged', () => seen.push(ids(api.getAllDisplayedColumns())));

        strategy.setRowGroupColumns(true, [a, api.getColumn('c') as AgColumn], 'toolPanelUi');
        strategy.commit(true);

        expect(seen).toEqual([ids(api.getAllDisplayedColumns())]);
        expect(api.getAllDisplayedColumns()[0].getColId()).toBe('ag-Grid-AutoColumn');
    });

    test('a column listener resizing a column during an apply leaves the apply reporting its own source', async () => {
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [{ field: 'a' }, { field: 'b' }, { field: 'c' }, { field: 'd' }],
            rowData: [{ a: 1, b: 2, c: 3, d: 4 }],
            sideBar: {
                toolPanels: [
                    {
                        id: 'columns',
                        labelDefault: 'Columns',
                        labelKey: 'columns',
                        iconKey: 'columns',
                        toolPanel: 'agColumnsToolPanel',
                        toolPanelParams: { buttons: ['apply'] },
                    },
                ],
                defaultToolPanel: 'columns',
            },
        });
        const toolPanel = await waitFor(() => {
            const panel = api.getToolPanelInstance('columns') as any;
            expect(panel).toBeTruthy();
            return panel;
        });
        const strategy: IColumnStateUpdateStrategy = toolPanel.beans.columnStateUpdateStrategy;
        const sources: string[] = [];
        // `b` is moved by the apply alone: the listener resizes `d`, to its right
        api.getColumn('b')!.addEventListener('leftChanged', (event) => sources.push(event.source));
        api.getColumn('a')!.addEventListener('visibleChanged', () =>
            api.setColumnWidths([{ key: 'd', newWidth: 150 }])
        );

        strategy.setColumnsVisible(true, [api.getColumn('a') as AgColumn], false, 'toolPanelUi');
        strategy.commit(true);

        expect(sources).toEqual(['toolPanelUi']);
    });

    test('a listener throwing during an apply leaves the next operation telling its columns once they are final', async () => {
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [{ field: 'a' }, { field: 'b' }, { field: 'c' }, { field: 'd' }],
            rowData: [{ a: 1, b: 2, c: 3, d: 4 }],
            sideBar: {
                toolPanels: [
                    {
                        id: 'columns',
                        labelDefault: 'Columns',
                        labelKey: 'columns',
                        iconKey: 'columns',
                        toolPanel: 'agColumnsToolPanel',
                        toolPanelParams: { buttons: ['apply'] },
                    },
                ],
                defaultToolPanel: 'columns',
            },
        });
        const toolPanel = await waitFor(() => {
            const panel = api.getToolPanelInstance('columns') as any;
            expect(panel).toBeTruthy();
            return panel;
        });
        const strategy: IColumnStateUpdateStrategy = toolPanel.beans.columnStateUpdateStrategy;
        const a = api.getColumn('a') as AgColumn;
        let fail = true;
        a.addEventListener('columnRowGroupChanged', () => {
            if (fail) {
                fail = false;
                throw new Error('listener failed');
            }
        });
        // a visibility op after a role op closes and reopens the apply's update, and the close raises the role events
        strategy.setRowGroupColumns(true, [a], 'toolPanelUi');
        strategy.setColumnsVisible(true, [api.getColumn('b') as AgColumn], false, 'toolPanelUi');
        expect(() => strategy.commit(true)).toThrow('listener failed');
        // the operations after the throw are applied all the same
        expect(api.getColumn('b')!.isVisible()).toBe(false);
        expect(strategy.hasPendingChanges(true)).toBe(false);

        const seen: string[] = [];
        api.getColumn('c')!.addEventListener('visibleChanged', () => seen.push(ids(api.getAllDisplayedColumns())));
        api.applyColumnState({
            state: [
                { colId: 'c', hide: true },
                { colId: 'd', hide: true },
            ],
        });

        expect(seen).toEqual([ids(api.getAllDisplayedColumns())]);
        expect(api.getColumn('c')!.isVisible() || api.getColumn('d')!.isVisible()).toBe(false);
    });
});

describe('the column events of a tool panel drop on the body while pivoting', () => {
    const gridsManager = new TestGridsManager({ modules: [AllEnterpriseModule] });

    afterEach(() => {
        gridsManager.reset();
    });

    test('a column given a role by the drop is told once every dropped column holds its role', async () => {
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [
                {
                    headerName: 'Medals',
                    children: [
                        { field: 'country', enableRowGroup: true },
                        { field: 'gold', enableValue: true },
                    ],
                },
            ],
            rowData: [{ country: 'UK', gold: 1 }],
            pivotMode: true,
            allowDragFromColumnsToolPanel: true,
            suppressDragLeaveHidesColumns: true,
            sideBar: { toolPanels: ['columns'], defaultToolPanel: 'columns' },
        });
        const gridElement = getGridElement(api)! as HTMLElement;
        const handle = await waitFor(() => {
            const found = gridElement.querySelector<HTMLElement>('.ag-column-select-column-group-drag-handle');
            expect(found).not.toBeNull();
            return found!;
        });
        const viewport = gridElement.querySelector<HTMLElement>('.ag-grid-viewport')!;
        const seen: string[] = [];
        api.getColumn('gold')!.addEventListener('columnValueChanged', () =>
            seen.push(
                api
                    .getRowGroupColumns()
                    .map((column) => column.getColId())
                    .join()
            )
        );
        const sources: string[] = [];
        api.addEventListener('columnRowGroupChanged', (event) => sources.push(event.source));

        const dispatcher = new DragEventDispatcher('mouse', null, false);
        try {
            await dispatcher.startDrag(handle, 10, 10);
            await dispatcher.movePointer(viewport, 50, 100);
            await dispatcher.movePointer(viewport, 60, 100);
            await dispatcher.finishDrag(viewport);
        } finally {
            dispatcher.reset();
        }

        expect(seen).toEqual(['country']);
        await waitFor(() => expect(sources).toEqual(['toolPanelDragAndDrop']));
    });
});

describe('the column group events of one call', () => {
    const gridsManager = new TestGridsManager({ modules: [ClientSideRowModelModule, ColumnApiModule] });

    afterEach(() => {
        gridsManager.reset();
    });

    const createGrid = (openByDefault: boolean) =>
        gridsManager.createGrid('myGrid', {
            columnDefs: [
                { groupId: 'g1', openByDefault, children: [{ field: 'a' }, { field: 'b', columnGroupShow: 'open' }] },
                { groupId: 'g2', openByDefault, children: [{ field: 'c' }, { field: 'd', columnGroupShow: 'open' }] },
            ],
            rowData: [{ a: 1, b: 2, c: 3, d: 4 }],
        });

    const ids = (api: GridApi) =>
        api
            .getAllDisplayedColumns()
            .map((column) => column.getColId())
            .join();

    test('a group opened with others is told once every group is opened and the columns laid out', () => {
        const api = createGrid(false);
        const seen: string[] = [];
        api.getProvidedColumnGroup('g1')!.addEventListener('expandedChanged', () =>
            seen.push(`${api.getProvidedColumnGroup('g2')!.isExpanded()}:${ids(api)}`)
        );

        api.setColumnGroupState([
            { groupId: 'g1', open: true },
            { groupId: 'g2', open: true },
        ]);

        expect(seen).toEqual(['true:a,b,c,d']);
    });

    test('a group a hide makes unexpandable is told once every column is hidden and laid out', () => {
        const api = createGrid(true);
        const seen: string[] = [];
        api.getProvidedColumnGroup('g1')!.addEventListener('expandableChanged', () => seen.push(ids(api)));

        api.setColumnsVisible(['b', 'd'], false);

        expect(seen).toEqual(['a,c']);
    });
});

describe('the header a column rebuild draws', () => {
    const gridsManager = new TestGridsManager({ modules: [ClientSideRowModelModule, ColumnApiModule, PivotModule] });

    afterEach(() => {
        gridsManager.reset();
    });

    test('a column that stops spanning the header height through new columnDefs draws its padding group', async () => {
        const defs = (suppressSpanHeaderHeight: boolean): (ColDef | ColGroupDef)[] => [
            { groupId: 'g', headerName: 'G', children: [{ colId: 'a' }] },
            { colId: 'b', suppressSpanHeaderHeight },
        ];
        const api = gridsManager.createGrid('myGrid', { columnDefs: defs(false), rowData: [{}] });
        await asyncSetTimeout(0);
        const groupRow = () =>
            Array.from(getGridElement(api)!.querySelectorAll('.ag-header-row-group .ag-header-group-cell'), (cell) =>
                cell.getAttribute('col-id')
            ).join();
        expect(groupRow()).toBe('g_0');

        api.setGridOption('columnDefs', defs(true));
        await asyncSetTimeout(0);

        expect(groupRow()).toBe('g_0,0_0');
    });

    test('hiding the column whose header has the focus removes its header', async () => {
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [
                { colId: 'a', headerName: 'A' },
                { colId: 'b', headerName: 'B' },
            ],
            rowData: [{}],
        });
        await asyncSetTimeout(0);
        const headers = () =>
            Array.from(getGridElement(api)!.querySelectorAll('.ag-header-cell'), (cell) =>
                cell.getAttribute('col-id')
            ).join();
        api.setFocusedHeader('b');
        const focused = document.activeElement?.closest('.ag-header-cell')?.getAttribute('col-id');

        api.setColumnsVisible(['b'], false);
        await asyncSetTimeout(0);

        expect({ focused, headers: headers() }).toEqual({ focused: 'b', headers: 'a' });
    });

    test('a group of a column scrolled out of view is drawn once the column, or the group, sizes its header row', async () => {
        const defs = (sizedBy: 'column' | 'group' | null): (ColDef | ColGroupDef)[] => [
            { colId: 'a', width: 3000 },
            {
                groupId: 'g',
                headerName: 'G',
                autoHeaderHeight: sizedBy === 'group',
                children: [{ colId: 'x', autoHeaderHeight: sizedBy === 'column' }],
            },
        ];
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: defs(null),
            rowData: [{}],
            suppressColumnVirtualisation: false,
        });
        await asyncSetTimeout(0);
        const groupDrawn = () =>
            Array.from(getGridElement(api)!.querySelectorAll('.ag-header-group-text')).some(
                (text) => text.textContent === 'G'
            );
        const seen = [groupDrawn()];
        for (const sizedBy of ['column', null, 'group'] as const) {
            api.setGridOption('columnDefs', defs(sizedBy));
            await asyncSetTimeout(0);
            seen.push(groupDrawn());
        }

        expect(seen).toEqual([false, true, false, true]);
    });

    test('pivot mode switched on with nothing to pivot draws none of the columns it hides, and switched off draws them all again', async () => {
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [{ field: 'a' }, { field: 'b' }],
            rowData: [{ a: 1, b: 2 }],
            suppressColumnVirtualisation: false,
        });
        const drawn = () => {
            const ids = (selector: string) =>
                Array.from(getGridElement(api)!.querySelectorAll(selector), (el) => el.getAttribute('col-id')).join();
            return { headers: ids('.ag-header-cell'), cells: ids('.ag-row[row-index="0"] .ag-cell') };
        };
        await waitFor(() => expect(drawn()).toEqual({ headers: 'a,b', cells: 'a,b' }));

        api.setGridOption('pivotMode', true);
        await asyncSetTimeout(0);
        const pivoted = { displayed: api.getAllDisplayedColumns().length, ...drawn() };
        api.setGridOption('pivotMode', false);
        await asyncSetTimeout(0);

        expect([pivoted, drawn()]).toEqual([
            { displayed: 0, headers: '', cells: '' },
            { headers: 'a,b', cells: 'a,b' },
        ]);
    });
});

describe('the rows a column update refreshes', () => {
    const gridsManager = new TestGridsManager({
        modules: [ClientSideRowModelModule, ColumnApiModule, RowGroupingModule, PivotModule, TextFilterModule],
    });

    afterEach(() => {
        gridsManager.reset();
    });

    const rowData = [
        { id: '1', country: 'Ireland', sport: 'Rowing', gold: 1 },
        { id: '2', country: 'Ireland', sport: 'Boxing', gold: 3 },
        { id: '3', country: 'France', sport: 'Rowing', gold: 2 },
    ];

    function countRefreshes(api: GridApi): () => number {
        let refreshes = 0;
        api.addEventListener('modelUpdated', () => ++refreshes);
        return () => refreshes;
    }

    test('new column definitions that group and sort the rows refresh them once', async () => {
        const api = gridsManager.createGrid('groupAndSort', {
            columnDefs: [{ field: 'country' }, { field: 'sport' }, { field: 'gold' }],
            rowData,
            getRowId: ({ data }) => data.id,
        });
        await asyncSetTimeout(0);
        const refreshes = countRefreshes(api);

        api.setGridOption('columnDefs', [
            { field: 'country', rowGroup: true, hide: true },
            { field: 'sport' },
            { field: 'gold', sort: 'desc' },
        ]);
        await asyncSetTimeout(0);

        expect(refreshes()).toBe(1);
        await new GridRows(api, 'grouped and sorted').check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ LEAF_GROUP collapsed id:row-group-country-Ireland ag-Grid-AutoColumn:"Ireland"
            │ ├── LEAF hidden id:2 country:"Ireland" sport:"Boxing" gold:3
            │ └── LEAF hidden id:1 country:"Ireland" sport:"Rowing" gold:1
            └─┬ LEAF_GROUP collapsed id:row-group-country-France ag-Grid-AutoColumn:"France"
            · └── LEAF hidden id:3 country:"France" sport:"Rowing" gold:2
        `);
    });

    test('a transaction a data type matcher applies during a columnDefs update shows its row, grouped by the new columns', async () => {
        let onMatch: (() => void) | null = null;
        const api = gridsManager.createGrid('matcherTransaction', {
            columnDefs: [{ field: 'sport' }],
            rowData,
            getRowId: (params) => params.data.id,
            dataTypeDefinitions: {
                mine: {
                    baseDataType: 'text',
                    extendsDataType: 'text',
                    dataTypeMatcher: (value) => {
                        const run = onMatch;
                        onMatch = null;
                        run?.();
                        return value === 'never';
                    },
                },
            },
        });
        await asyncSetTimeout(0);

        onMatch = () => api.applyTransaction({ add: [{ id: '4', country: 'Spain', sport: 'Sailing', gold: 0 }] });
        api.setGridOption('columnDefs', [{ field: 'country', rowGroup: true, hide: true }, { field: 'sport' }]);

        expect(onMatch).toBeNull();
        expect(api.getRowNode('4')!.data.sport).toBe('Sailing');
        const displayedGroups: (string | null | undefined)[] = [];
        for (let i = 0; i < api.getDisplayedRowCount(); ++i) {
            displayedGroups.push(api.getDisplayedRowAtIndex(i)!.key);
        }
        expect({ groups: displayedGroups, columns: api.getAllGridColumns().map((col) => col.getColId()) }).toEqual({
            groups: ['Ireland', 'France', 'Spain'],
            columns: ['ag-Grid-AutoColumn', 'country', 'sport'],
        });

        await asyncSetTimeout(0);
    });

    test('a filtered pivot result column that is replaced lets its rows back and draws no cell once gone', async () => {
        const drawn: string[] = [];
        const cellRenderer = (params: ICellRendererParams) => {
            drawn.push(params.column!.getColId());
            return String(params.value ?? '');
        };
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [
                { field: 'country', rowGroup: true },
                { field: 'gold', aggFunc: 'sum' },
            ],
            rowData,
            pivotMode: true,
        });
        api.setPivotResultColumns([{ colId: 'r1', field: 'gold', filter: 'agTextColumnFilter', cellRenderer }]);
        await asyncSetTimeout(0);
        const unfiltered = api.getDisplayedRowCount();
        expect(unfiltered).toBe(2);
        api.setFilterModel({ r1: { filterType: 'text', type: 'equals', filter: 'none' } });
        await asyncSetTimeout(0);
        expect(api.getDisplayedRowCount()).toBe(0);
        drawn.length = 0;

        api.setPivotResultColumns([{ colId: 'r2', field: 'gold', cellRenderer }]);
        await asyncSetTimeout(0);

        expect({ model: api.getFilterModel(), rows: api.getDisplayedRowCount(), drawn: [...new Set(drawn)] }).toEqual({
            model: {},
            rows: unfiltered,
            drawn: ['r2'],
        });
    });

    test('a filter on a column the update removes, as it groups the rows, lets its rows back in the same refresh', async () => {
        const api = gridsManager.createGrid('filterRemoved', {
            columnDefs: [{ field: 'country' }, { field: 'sport', filter: 'agTextColumnFilter' }, { field: 'gold' }],
            rowData,
            getRowId: ({ data }) => data.id,
        });
        api.setFilterModel({ sport: { filterType: 'text', type: 'equals', filter: 'Rowing' } });
        await asyncSetTimeout(0);
        expect(api.getDisplayedRowCount()).toBe(2);
        const refreshes = countRefreshes(api);
        let filterChanges = 0;
        api.addEventListener('filterChanged', () => ++filterChanges);

        api.setGridOption('columnDefs', [{ field: 'country', rowGroup: true, hide: true }, { field: 'gold' }]);
        // releasing the removed column's filter does not refresh the rows a second time
        await waitFor(() => expect(filterChanges).toBe(1));

        expect(refreshes()).toBe(1);
        await new GridRows(api, 'filter released and grouped').check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ LEAF_GROUP collapsed id:row-group-country-Ireland ag-Grid-AutoColumn:"Ireland"
            │ ├── LEAF hidden id:1 country:"Ireland" gold:1
            │ └── LEAF hidden id:2 country:"Ireland" gold:3
            └─┬ LEAF_GROUP collapsed id:row-group-country-France ag-Grid-AutoColumn:"France"
            · └── LEAF hidden id:3 country:"France" gold:2
        `);
    });

    // TODO: disabled due to AG-19397 - re-enable once fixed
    test.skip('one applyColumnState grouping a column and aggregating another refreshes the rows once, grouped and aggregated', async () => {
        const api = gridsManager.createGrid('groupAndAggregate', {
            columnDefs: [{ field: 'country' }, { field: 'sport' }, { field: 'gold' }],
            rowData,
            getRowId: ({ data }) => data.id,
        });
        await asyncSetTimeout(0);
        const refreshes = countRefreshes(api);

        api.applyColumnState({
            state: [
                { colId: 'country', rowGroup: true, hide: true },
                { colId: 'gold', aggFunc: 'sum' },
            ],
        });
        await waitFor(() => expect(refreshes()).toBe(1), { timeout: 300 });
        await asyncSetTimeout(0);

        expect(refreshes()).toBe(1);
        await new GridRows(api, 'grouped and aggregated').check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ LEAF_GROUP collapsed id:row-group-country-Ireland ag-Grid-AutoColumn:"Ireland" gold:4
            │ ├── LEAF hidden id:1 country:"Ireland" sport:"Rowing" gold:1
            │ └── LEAF hidden id:2 country:"Ireland" sport:"Boxing" gold:3
            └─┬ LEAF_GROUP collapsed id:row-group-country-France ag-Grid-AutoColumn:"France" gold:2
            · └── LEAF hidden id:3 country:"France" sport:"Rowing" gold:2
        `);
    });

    const pivotRowData = [
        { country: 'Ireland', year: '2000', gold: 1 },
        { country: 'Ireland', year: '2004', gold: 3 },
        { country: 'Ireland', year: '2008', gold: 2 },
        { country: 'France', year: '2012', gold: 5 },
        { country: 'France', year: '2000', gold: 4 },
    ];
    const pivotColumnDefs = (year: ColDef): ColDef[] => [
        { field: 'country', rowGroup: true },
        year,
        { field: 'gold', aggFunc: 'sum' },
    ];
    const pivotYears = (columns: readonly Column[] | null | undefined) =>
        columns!.map((column) => column.getColDef().pivotKeys![0]);
    const displayedPivotYears = (api: GridApi) => {
        const pivotIds = new Set(api.getPivotResultColumns()!.map((column) => column.getColId()));
        return pivotYears(api.getAllDisplayedColumns().filter((column) => pivotIds.has(column.getColId())));
    };

    /** Runs `update` on a pivot grid and returns the order of the pivot result columns and what its events said. */
    async function reversePivotSort(update: (api: GridApi) => void) {
        const api = gridsManager.createGrid('pivotSort', {
            columnDefs: pivotColumnDefs({ field: 'year', pivot: true }),
            rowData: pivotRowData,
            pivotMode: true,
        });
        await waitFor(() => expect(api.getPivotResultColumns()).toHaveLength(4), { timeout: 300 });
        expect(displayedPivotYears(api)).toEqual(['2000', '2004', '2008', '2012']);
        const order: string[] = [];
        let moved: string[] = [];
        api.addEventListener('modelUpdated', () => order.push('modelUpdated'));
        api.addEventListener('columnMoved', (event) => {
            order.push('columnMoved');
            moved = pivotYears(event.columns).sort();
        });

        update(api);
        await waitFor(() => expect(order).toContain('modelUpdated'), { timeout: 300 });
        await asyncSetTimeout(0);

        return { order, moved, displayed: displayedPivotYears(api) };
    }

    test('applyColumnState reversing the pivot sort reverses the pivot result columns, telling which moved after the rows refresh', async () => {
        const { order, moved, displayed } = await reversePivotSort((api) =>
            api.applyColumnState({ state: [{ colId: 'year', pivotSort: 'desc' }] })
        );

        expect({ order, moved, displayed }).toEqual({
            order: ['modelUpdated', 'columnMoved'],
            moved: ['2000', '2004', '2008', '2012'],
            displayed: ['2012', '2008', '2004', '2000'],
        });
    });

    test('a columnDefs update reversing the pivot sort reverses the pivot result columns, refreshing the rows once', async () => {
        const { order, displayed } = await reversePivotSort((api) =>
            api.setGridOption('columnDefs', pivotColumnDefs({ field: 'year', pivot: true, pivotSort: 'desc' }))
        );

        expect({ refreshes: order.filter((type) => type === 'modelUpdated').length, displayed }).toEqual({
            refreshes: 1,
            displayed: ['2012', '2008', '2004', '2000'],
        });
    });

    const columnEvents = [
        'columnMoved',
        'columnsReset',
        'columnPivotChanged',
        'pivotMaxColumnsExceeded',
        'columnGroupOpened',
        'columnHeaderNameChanged',
        'sortChanged',
        'columnVisible',
        'columnPinned',
        'columnResized',
        'columnRowGroupChanged',
        'columnValueChanged',
        'columnPivotModeChanged',
        'columnEverythingChanged',
        'newColumnsLoaded',
        'gridColumnsChanged',
        'displayedColumnsChanged',
        'virtualColumnsChanged',
    ] as const;

    test('resetting the column state reorders the pivot result columns back to ascending, raising columnMoved then columnsReset, the last column event of the reset', async () => {
        const api = gridsManager.createGrid('pivotSortReset', {
            columnDefs: pivotColumnDefs({ field: 'year', pivot: true }),
            rowData: pivotRowData,
            pivotMode: true,
        });
        await waitFor(() => expect(api.getPivotResultColumns()).toHaveLength(4), { timeout: 300 });
        api.applyColumnState({ state: [{ colId: 'year', pivotSort: 'desc' }] });
        await waitFor(() => expect(displayedPivotYears(api)).toEqual(['2012', '2008', '2004', '2000']), {
            timeout: 300,
        });
        await asyncSetTimeout(0);
        const refreshes = countRefreshes(api);
        const heard: string[] = [];
        for (const type of columnEvents) {
            api.addEventListener(type, () => heard.push(type));
        }

        api.resetColumnState();
        await waitFor(() => expect(heard).toContain('columnsReset'), { timeout: 300, interval: 5 });
        await asyncSetTimeout(0);

        expect(displayedPivotYears(api)).toEqual(['2000', '2004', '2008', '2012']);
        expect(heard.filter((type) => type === 'columnMoved' || type === 'columnsReset')).toEqual([
            'columnMoved',
            'columnsReset',
        ]);
        expect(heard[heard.length - 1]).toBe('columnsReset');
        expect(refreshes()).toBe(1);
    });

    test('an aggregation throwing while the column state is reset throws to the caller, and the next reset raises columnsReset and reorders the pivot result columns', async () => {
        let aggregationArmed = false;
        const api = gridsManager.createGrid('pivotSortResetThrow', {
            columnDefs: [
                { field: 'country', rowGroup: true },
                { field: 'year', pivot: true },
                { field: 'gold', aggFunc: 'throwWhenArmed' },
            ],
            aggFuncs: {
                throwWhenArmed: (params) => {
                    if (aggregationArmed) {
                        throw new Error('aggregation failed');
                    }
                    return params.values.reduce((sum, value) => sum + value, 0);
                },
            },
            rowData: pivotRowData,
            pivotMode: true,
        });
        await waitFor(() => expect(api.getPivotResultColumns()).toHaveLength(4), { timeout: 300 });
        api.applyColumnState({ state: [{ colId: 'year', pivotSort: 'desc' }] });
        await waitFor(() => expect(displayedPivotYears(api)).toEqual(['2012', '2008', '2004', '2000']), {
            timeout: 300,
        });
        await asyncSetTimeout(0);
        const heard: string[] = [];
        api.addEventListener('columnsReset', () => heard.push('columnsReset'));

        aggregationArmed = true;
        expect(() => api.resetColumnState()).toThrow('aggregation failed');
        aggregationArmed = false;
        await asyncSetTimeout(0);
        await asyncSetTimeout(0);
        heard.length = 0;

        api.resetColumnState();

        await waitFor(() => expect(heard).toEqual(['columnsReset']), { timeout: 300, interval: 5 });
        await asyncSetTimeout(0);
        expect(heard).toEqual(['columnsReset']);
        expect(displayedPivotYears(api)).toEqual(['2000', '2004', '2008', '2012']);
    });

    test('a pivot column added while a filter is present refreshes the rows once, keeping the rendered rows', async () => {
        const api = gridsManager.createGrid('pivotWithFilter', {
            columnDefs: [
                { field: 'country', rowGroup: true, filter: 'agTextColumnFilter' },
                { field: 'year', pivot: true },
                { field: 'sport' },
                { field: 'gold', aggFunc: 'sum' },
            ],
            rowData: pivotRowData.map((row) => ({ ...row, sport: 'Rowing' })),
            pivotMode: true,
        });
        await waitFor(() => expect(api.getPivotResultColumns()).toHaveLength(4), { timeout: 300 });
        let removedRows = 0;
        api.addEventListener('virtualRowRemoved', () => ++removedRows);
        api.setFilterModel({ country: { filterType: 'text', type: 'contains', filter: 'Ire' } });
        await waitFor(() => expect(api.getDisplayedRowCount()).toBe(1), { timeout: 300 });
        expect(Object.keys(api.getFilterModel())).toEqual(['country']);
        await asyncSetTimeout(0);
        // The filter removing France's row shows the listener hears a removed row.
        expect(removedRows).toBe(1);
        removedRows = 0;
        const rowElements = () =>
            Array.from(getGridElement(api)!.querySelectorAll('.ag-row[row-id="row-group-country-Ireland"]'));
        const irelandRows = rowElements();
        expect(irelandRows.length).toBeGreaterThan(0);
        const pivotKeys = () => api.getPivotResultColumns()!.map((column) => column.getColDef().pivotKeys!);
        // The Ireland rows' years: the France-only 2012 leaves with the filter.
        expect(pivotKeys()).toEqual([['2000'], ['2004'], ['2008']]);
        const refreshes: (boolean | undefined)[] = [];
        api.addEventListener('modelUpdated', (event) => refreshes.push(event.keepRenderedRows));

        api.addPivotColumns(['sport']);
        await waitFor(() => expect(refreshes.length).toBeGreaterThan(0), { timeout: 300 });
        await asyncSetTimeout(0);

        expect({
            refreshes,
            removedRows,
            keptRowElements: rowElements().map((element, i) => element === irelandRows[i]),
            displayed: [api.getDisplayedRowAtIndex(0)?.key, api.getDisplayedRowCount()],
            pivots: api.getPivotColumns().map((column) => column.getColId()),
            pivotKeys: pivotKeys(),
        }).toEqual({
            refreshes: [true],
            removedRows: 0,
            keptRowElements: irelandRows.map(() => true),
            displayed: ['Ireland', 1],
            pivots: ['year', 'sport'],
            // Pivot groups are expandable by default with several pivot columns: each has its collapsed column.
            pivotKeys: [['2000', 'Rowing'], ['2000'], ['2004', 'Rowing'], ['2004'], ['2008', 'Rowing'], ['2008']],
        });
    });

    test('onSortChanged after the row data was changed out of band sorts the displayed rows by the current sort, refreshing them once', async () => {
        const data = [
            { id: '1', gold: 1 },
            { id: '2', gold: 2 },
            { id: '3', gold: 3 },
            { id: '4', gold: 4 },
        ];
        const api = gridsManager.createGrid('outOfBandSort', {
            columnDefs: [{ field: 'gold', sort: 'asc' }],
            rowData: data,
            getRowId: ({ data }) => data.id,
        });
        await asyncSetTimeout(0);
        const displayedIds = () =>
            Array.from({ length: api.getDisplayedRowCount() }, (_, i) => api.getDisplayedRowAtIndex(i)!.id);
        expect(displayedIds()).toEqual(['1', '2', '3', '4']);
        const refreshes = countRefreshes(api);
        let sortChanges = 0;
        api.addEventListener('sortChanged', () => ++sortChanges);

        data[0].gold = 9;
        api.onSortChanged();
        await waitFor(() => expect({ sortChanges, refreshes: refreshes() }).toEqual({ sortChanges: 1, refreshes: 1 }), {
            timeout: 300,
            interval: 5,
        });
        await asyncSetTimeout(0);

        expect({ sortChanges, refreshes: refreshes(), displayed: displayedIds() }).toEqual({
            sortChanges: 1,
            refreshes: 1,
            displayed: ['2', '3', '4', '1'],
        });
    });
});

describe('the column animations a column call leaves on', () => {
    const gridsManager = new TestGridsManager({
        modules: [ClientSideRowModelModule, ColumnApiModule, ColumnAutoSizeModule],
    });

    afterEach(() => {
        gridsManager.reset();
    });

    const hasClass = (api: GridApi, cssClass: string) => {
        const grid = getGridElement(api)!;
        return grid.classList.contains(cssClass) || grid.querySelector(`.${cssClass}`) !== null;
    };
    const resizeAnimating = (api: GridApi) => hasClass(api, 'ag-animate-autosize');
    const moving = (api: GridApi) => hasClass(api, 'ag-column-moving');
    const cellLeft = (api: GridApi, colId: string) =>
        getGridElement(api)!.querySelector<HTMLElement>(`.ag-cell[col-id="${colId}"]`)!.style.left;
    const order = (api: GridApi) =>
        api
            .getAllDisplayedColumns()
            .map((column) => column.getColId())
            .join();

    const createFittingGrid = () =>
        gridsManager.createGrid('myGrid', {
            columnDefs: [{ colId: 'a' }, { colId: 'b' }],
            defaultColDef: { width: 300 },
            animateColumnResizing: true,
            rowData: [{}],
        });

    test('a fit to the width the columns already fill keeps the column widths', async () => {
        const api = createFittingGrid();
        expect(resizeAnimating(api)).toBe(false);

        api.sizeColumnsToFit(600);

        expect(api.getAllDisplayedColumns().map((column) => column.getActualWidth())).toEqual([300, 300]);
        await asyncSetTimeout(0);
    });

    test('a fit to the width the columns already fill does not cut short the animation of the width change before it', async () => {
        const api = createFittingGrid();

        vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
        onTestFinished(() => {
            vi.useRealTimers();
        });
        api.applyColumnState({ state: [{ colId: 'a', width: 400 }] });
        expect(resizeAnimating(api)).toBe(true);

        api.sizeColumnsToFit(700);

        expect(api.getAllDisplayedColumns().map((column) => column.getActualWidth())).toEqual([400, 300]);
        expect(resizeAnimating(api)).toBe(true);
        // a width change animates for 250 ms
        await vi.advanceTimersByTimeAsync(250);
        expect(resizeAnimating(api)).toBe(false);
    });

    // TODO: disabled due to AG-18901 - re-enable once fixed
    test.skip('setting the group state the groups are already in leaves the next column change jumping', async () => {
        const api = await createGroupGrid();
        expect(order(api)).toBe('a,c,d');

        api.setColumnGroupState(api.getColumnGroupState());

        widenFirstGroupColumn(api);
        expect(moving(api)).toBe(false);
    });

    const createGroupGrid = async () => {
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [
                {
                    groupId: 'g',
                    headerName: 'Group',
                    children: [{ colId: 'a' }, { colId: 'b', columnGroupShow: 'open' }],
                },
                { colId: 'c' },
                { colId: 'd' },
            ],
            defaultColDef: { width: 100 },
            rowData: [{}],
        });
        await waitFor(() => expect(moving(api)).toBe(false));
        return api;
    };

    /** Widens the group's first column, the next column change after the call under test. */
    const widenFirstGroupColumn = (api: GridApi) => {
        api.setColumnWidths([{ key: 'a', newWidth: 150 }]);
        expect(api.getColumn('a')!.getActualWidth()).toBe(150);
    };

    test('opening a group makes the next column change slide', async () => {
        const api = await createGroupGrid();

        api.setColumnGroupOpened('g', true);
        expect(order(api)).toBe('a,b,c,d');
        expect(cellLeft(api, 'c')).toBe('200px');

        widenFirstGroupColumn(api);
        expect({ moving: moving(api), cLeft: cellLeft(api, 'c') }).toEqual({ moving: true, cLeft: '250px' });
    });

    test('moving a column by moveColumns before a locked column or to the index it is already at leaves the column order unchanged', async () => {
        const api = await createLockedGrid();

        api.moveColumns(['athlete'], 0);

        expect(order(api)).toBe('year,athlete,country,sport');
        widenAthlete(api);

        api.moveColumns(['athlete'], 1);

        expect(order(api)).toBe('year,athlete,country,sport');
        api.setColumnWidths([{ key: 'athlete', newWidth: 200 }]);
    });

    const createLockedGrid = async () => {
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [
                { colId: 'year', lockPosition: 'left' },
                { colId: 'athlete' },
                { colId: 'country' },
                { colId: 'sport' },
            ],
            defaultColDef: { width: 100 },
            rowData: [{}],
        });
        await waitFor(() => expect(moving(api)).toBe(false));
        return api;
    };

    /** Widens athlete, the next column change after the call under test. */
    const widenAthlete = (api: GridApi) => {
        api.setColumnWidths([{ key: 'athlete', newWidth: 150 }]);
        expect(api.getColumn('athlete')!.getActualWidth()).toBe(150);
    };

    test('moving a column before a locked column by moveColumns changes nothing', async () => {
        const api = await createLockedGrid();

        api.moveColumns(['athlete'], 0);

        expect(order(api)).toBe('year,athlete,country,sport');
        widenAthlete(api);
    });

    test('moving a column before a locked column by moveColumnByIndex changes nothing', async () => {
        const api = await createLockedGrid();

        api.moveColumnByIndex(1, 0);

        expect(order(api)).toBe('year,athlete,country,sport');
        widenAthlete(api);
    });

    test('moving a column that is allowed to move makes the next column change slide', async () => {
        const api = await createLockedGrid();

        api.moveColumns(['sport'], 1);

        expect(order(api)).toBe('year,sport,athlete,country');
        expect(cellLeft(api, 'country')).toBe('300px');
        widenAthlete(api);
        expect({ moving: moving(api), countryLeft: cellLeft(api, 'country') }).toEqual({
            moving: true,
            countryLeft: '350px',
        });
    });

    test('moving a column to the index it is already at keeps the column order', async () => {
        const api = await createLockedGrid();

        api.moveColumns(['athlete'], 1);

        expect(order(api)).toBe('year,athlete,country,sport');
        widenAthlete(api);
    });

    test('a call made while a column move is still sliding does not cut the slide short when it changes nothing', async () => {
        const api = await createLockedGrid();

        vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
        onTestFinished(() => {
            vi.useRealTimers();
        });
        api.moveColumns(['sport'], 1);
        // A move slides for 200 ms; the no-op lands halfway, after the move's next-turn work.
        await vi.advanceTimersByTimeAsync(100);
        expect(moving(api)).toBe(true);

        api.applyColumnState({ state: api.getColumnState() });
        await vi.advanceTimersByTimeAsync(99);
        const justBeforeEnd = moving(api);
        await vi.advanceTimersByTimeAsync(1);

        expect({ order: order(api), justBeforeEnd, atEnd: moving(api) }).toEqual({
            order: 'year,sport,athlete,country',
            justBeforeEnd: true,
            atEnd: false,
        });
    });

    const createAnimatedGrid = async (columnDefs: ColDef[] = [{ colId: 'a' }, { colId: 'b' }]) => {
        const api = gridsManager.createGrid('myGrid', {
            columnDefs,
            defaultColDef: { width: 300 },
            animateColumnResizing: true,
            rowData: [{}],
        });
        await waitFor(() => expect(moving(api)).toBe(false));
        return api;
    };

    /** Narrows column a, the next column change after the call under test. */
    const narrowA = (api: GridApi) => {
        api.setColumnWidths([{ key: 'a', newWidth: 250 }]);
        expect(api.getColumn('a')!.getActualWidth()).toBe(250);
    };

    test('column calls that change nothing, however many in a row, keep the column widths', async () => {
        const api = await createAnimatedGrid();
        const animations = () => ({ resizeAnimating: resizeAnimating(api), moving: moving(api) });
        const off = { resizeAnimating: false, moving: false };
        expect(animations()).toEqual(off);

        api.applyColumnState({ state: api.getColumnState() });

        api.applyColumnState({ state: api.getColumnState() });

        api.sizeColumnsToFit(600);
        expect(api.getAllDisplayedColumns().map((column) => column.getActualWidth())).toEqual([300, 300]);
    });

    test('a fit when every column is at its maximum width keeps every column at its maximum width', async () => {
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [{ colId: 'a' }, { colId: 'b' }],
            defaultColDef: { width: 100, maxWidth: 100 },
            animateColumnResizing: true,
            rowData: [{}],
        });
        await waitFor(() => expect(moving(api)).toBe(false));

        api.sizeColumnsToFit(600);

        expect(api.getAllDisplayedColumns().map((column) => column.getActualWidth())).toEqual([100, 100]);
        api.setColumnWidths([{ key: 'a', newWidth: 80 }]);
        expect(api.getColumn('a')!.getActualWidth()).toBe(80);
    });

    test('setting column definitions equal to the current ones leaves the next column change jumping', async () => {
        const api = await createAnimatedGrid([{ colId: 'a' }, { colId: 'b' }]);

        api.setGridOption('columnDefs', [{ colId: 'a' }, { colId: 'b' }]);
        narrowA(api);
        expect({ moving: moving(api), bLeft: cellLeft(api, 'b') }).toEqual({ moving: false, bLeft: '250px' });
    });

    test('trading width between two columns at an unchanged total animates the column that moved', async () => {
        const api = await createAnimatedGrid([{ colId: 'a' }, { colId: 'b' }, { colId: 'c' }]);
        expect({ resizeAnimating: resizeAnimating(api), bLeft: cellLeft(api, 'b'), cLeft: cellLeft(api, 'c') }).toEqual(
            {
                resizeAnimating: false,
                bLeft: '300px',
                cLeft: '600px',
            }
        );

        vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
        onTestFinished(() => {
            vi.useRealTimers();
        });
        api.applyColumnState({
            state: [
                { colId: 'a', width: 400 },
                { colId: 'b', width: 200 },
            ],
        });

        expect(api.getAllDisplayedColumns().map((column) => column.getActualWidth())).toEqual([400, 200, 300]);
        expect({ resizeAnimating: resizeAnimating(api), bLeft: cellLeft(api, 'b'), cLeft: cellLeft(api, 'c') }).toEqual(
            {
                resizeAnimating: true,
                bLeft: '400px',
                cLeft: '600px',
            }
        );
        // a width change animates for 250 ms
        await vi.advanceTimersByTimeAsync(250);
        expect(resizeAnimating(api)).toBe(false);
    });

    test('a fit whose column limits trade width at the total the columns already fill animates the column that moved', async () => {
        // sizeColumnsToFit(params) fits the grid's width, which the layout mock sets to 1000
        const api = await createAnimatedGrid([
            { colId: 'a', width: 600 },
            { colId: 'b', width: 400 },
        ]);
        expect({ resizeAnimating: resizeAnimating(api), bLeft: cellLeft(api, 'b') }).toEqual({
            resizeAnimating: false,
            bLeft: '600px',
        });

        vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
        onTestFinished(() => {
            vi.useRealTimers();
        });
        api.sizeColumnsToFit({ columnLimits: [{ key: 'a', maxWidth: 500 }] });

        expect(api.getAllDisplayedColumns().map((column) => column.getActualWidth())).toEqual([500, 500]);
        expect({ resizeAnimating: resizeAnimating(api), bLeft: cellLeft(api, 'b') }).toEqual({
            resizeAnimating: true,
            bLeft: '500px',
        });
        // a width change animates for 250 ms
        await vi.advanceTimersByTimeAsync(250);
        expect(resizeAnimating(api)).toBe(false);
    });
});

describe('the column events of an updateGridOptions call changing column options', () => {
    test('one update turning on rowNumbers and rowSelection shows both columns', async () => {
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [{ field: 'a' }, { field: 'b' }],
            rowData,
        });
        await settle();

        api.updateGridOptions({ rowNumbers: true, rowSelection: { mode: 'multiRow' } });
        await settle();

        expect(displayedIds(api).sort()).toEqual(
            ['a', 'ag-Grid-RowNumbersColumn', 'ag-Grid-SelectionColumn', 'b'].sort()
        );
    });

    test('one update turning on rowSelection and changing groupDisplayType and autoGroupColumnDef shows the selection column and every auto group column', async () => {
        const api = createGroupedGrid();
        await settle();

        api.updateGridOptions({
            groupDisplayType: 'multipleColumns',
            rowSelection: { mode: 'multiRow' },
            autoGroupColumnDef: { headerName: 'S' },
        });
        await settle();

        const displayedAutoGroups = api
            .getAllDisplayedColumns()
            .filter((column) => column.getColId().startsWith('ag-Grid-AutoColumn'));
        expect(displayedAutoGroups.map((column) => api.getDisplayNameForColumn(column, 'header'))).toEqual(['S', 'S']);
        expect(displayedIds(api).filter((id) => !id.startsWith('ag-Grid-AutoColumn'))).toEqual([
            'ag-Grid-SelectionColumn',
            'c',
        ]);
    });
    const gridsManager = new TestGridsManager({ modules: [AllEnterpriseModule] });

    afterEach(() => {
        gridsManager.reset();
    });

    const rowData = [
        { a: 'x', b: 'p', c: 1 },
        { a: 'x', b: 'q', c: 2 },
        { a: 'y', b: 'p', c: 3 },
    ];

    const createGroupedGrid = (options: GridOptions = {}) =>
        gridsManager.createGrid('myGrid', {
            columnDefs: [
                { field: 'a', rowGroup: true, hide: true },
                { field: 'b', rowGroup: true, hide: true },
                { field: 'c', aggFunc: 'sum' },
            ],
            rowData,
            ...options,
        });

    /** The grid events of `types` heard from now, in order. */
    const hear = (
        api: GridApi,
        types: ('columnEverythingChanged' | 'columnPivotModeChanged' | 'modelUpdated' | 'displayedColumnsChanged')[]
    ) => {
        const heard: string[] = [];
        for (const type of types) {
            api.addEventListener(type, () => heard.push(type));
        }
        return heard;
    };

    const settle = async () => {
        await asyncSetTimeout(0);
        await asyncSetTimeout(0);
    };

    const displayedIds = (api: GridApi) => api.getAllDisplayedColumns().map((column) => column.getColId());

    const autoGroupColumns = (api: GridApi) =>
        api.getAllGridColumns().filter((column) => column.getColId().startsWith('ag-Grid-AutoColumn'));

    test('one update changing groupDisplayType and the rowNumbers options, which need no column refresh, shows every auto group column after the row numbers column', async () => {
        const api = createGroupedGrid({ rowNumbers: true });
        await settle();
        expect(displayedIds(api)).toEqual(['ag-Grid-RowNumbersColumn', 'ag-Grid-AutoColumn', 'c']);

        api.updateGridOptions({
            groupDisplayType: 'multipleColumns',
            rowNumbers: { suppressCellSelectionIntegration: true },
        });
        await settle();

        expect(displayedIds(api)).toEqual([
            'ag-Grid-RowNumbersColumn',
            'ag-Grid-AutoColumn-a',
            'ag-Grid-AutoColumn-b',
            'c',
        ]);
    });

    test('one update turning on calculatedColumns and changing defaultColDef shows the calculated column at the new width', async () => {
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [{ field: 'a' }, { field: 'c' }],
            rowData,
            calculatedColumns: false,
            initialState: {
                userColumns: [
                    {
                        colId: 'double',
                        created: true,
                        properties: [{ property: 'calculatedExpression', value: '[c] * 2' }],
                    },
                ],
            },
        });
        await settle();
        expect(displayedIds(api)).toEqual(['a', 'c']);

        api.updateGridOptions({ calculatedColumns: true, defaultColDef: { width: 170 } });
        await settle();

        expect(displayedIds(api)).toEqual(['a', 'c', 'double']);
        expect(api.getAllDisplayedColumns().map((column) => column.getActualWidth())).toEqual([170, 170, 170]);
    });

    test('one update switching pivot mode on and changing groupDisplayType and autoGroupColumnDef turns pivot mode on with the new auto group column, raising columnPivotModeChanged and columnEverythingChanged', async () => {
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [
                { field: 'a', rowGroup: true, hide: true },
                { field: 'b', pivot: true },
                { field: 'c', aggFunc: 'sum' },
            ],
            rowData,
        });
        await settle();
        const heard = hear(api, ['columnPivotModeChanged', 'columnEverythingChanged', 'displayedColumnsChanged']);

        api.updateGridOptions({
            pivotMode: true,
            groupDisplayType: 'multipleColumns',
            autoGroupColumnDef: { headerName: 'PB' },
        });
        await settle();

        expect(api.isPivotMode()).toBe(true);
        expect(autoGroupColumns(api).map((column) => api.getDisplayNameForColumn(column, 'header'))).toEqual(['PB']);
        const pivotModeChanged = heard.indexOf('columnPivotModeChanged');
        const everythingChanged = heard.indexOf('columnEverythingChanged');
        expect(pivotModeChanged).toBeGreaterThanOrEqual(0);
        expect(everythingChanged).toBeGreaterThanOrEqual(0);
    });

    test('one update changing defaultColDef and autoGroupColumnDef gives the auto group column its own header and width and every other column the default width', async () => {
        const api = createGroupedGrid();
        await settle();

        api.updateGridOptions({
            defaultColDef: { width: 140 },
            autoGroupColumnDef: { headerName: 'E', width: 222 },
        });
        await settle();

        const autoGroups = autoGroupColumns(api);
        expect(autoGroups.map((column) => api.getDisplayNameForColumn(column, 'header'))).toEqual(['E']);
        expect(autoGroups.map((column) => column.getActualWidth())).toEqual([222]);
        expect(
            api
                .getAllGridColumns()
                .filter((column) => !autoGroups.includes(column))
                .map((column) => `${column.getColId()}:${column.getActualWidth()}`)
        ).toEqual(['a:140', 'b:140', 'c:140']);
    });

    test('one update changing rowData before autoGroupColumnDef refreshes the rows before columnEverythingChanged', async () => {
        const api = createGroupedGrid();
        await settle();
        // Each event with the top-level group keys displayed when it arrives.
        const heard: string[] = [];
        const topGroupKeys = () => {
            const keys: string[] = [];
            api.forEachNodeAfterFilterAndSort((node) => {
                if (node.group && node.level === 0) {
                    keys.push(String(node.key));
                }
            });
            return keys.join(',');
        };
        api.addEventListener('modelUpdated', () => heard.push(`modelUpdated:${topGroupKeys()}`));
        api.addEventListener('columnEverythingChanged', () => heard.push('columnEverythingChanged'));

        api.updateGridOptions({
            rowData: [
                { a: 'z', b: 'r', c: 5 },
                { a: 'w', b: 's', c: 6 },
            ],
            autoGroupColumnDef: { headerName: 'F' },
        });
        await settle();

        expect(autoGroupColumns(api).map((column) => api.getDisplayNameForColumn(column, 'header'))).toEqual(['F']);
        const everythingChanged = heard.indexOf('columnEverythingChanged');
        expect(everythingChanged).toBeGreaterThan(0);
        // The refresh before columnEverythingChanged already holds the replacement groups.
        expect(heard[everythingChanged - 1]).toBe('modelUpdated:z,w');
    });

    test('rowSelection turning its checkboxes on, off and on in three calls shows, removes and shows the selection column', async () => {
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [{ field: 'a' }, { field: 'b' }],
            rowData,
            rowSelection: { mode: 'multiRow', checkboxes: false, headerCheckbox: false },
        });
        await settle();
        expect(displayedIds(api)).toEqual(['a', 'b']);

        api.updateGridOptions({ rowSelection: { mode: 'multiRow', checkboxes: true } });
        await settle();
        expect(displayedIds(api)).toEqual(['ag-Grid-SelectionColumn', 'a', 'b']);

        api.updateGridOptions({ rowSelection: { mode: 'multiRow', checkboxes: false, headerCheckbox: false } });
        await settle();
        expect(displayedIds(api)).toEqual(['a', 'b']);

        api.updateGridOptions({ rowSelection: { mode: 'multiRow', checkboxes: true } });
        await settle();
        expect(displayedIds(api)).toEqual(['ag-Grid-SelectionColumn', 'a', 'b']);
    });

    test('rowSelection turning its checkboxes on, off and on in single row mode shows, removes and shows the selection column', async () => {
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [{ field: 'a' }, { field: 'b' }],
            rowData,
            rowSelection: { mode: 'singleRow', checkboxes: false },
        });
        await settle();
        expect(displayedIds(api)).toEqual(['a', 'b']);

        api.updateGridOptions({ rowSelection: { mode: 'singleRow', checkboxes: true } });
        await settle();
        expect(displayedIds(api)).toEqual(['ag-Grid-SelectionColumn', 'a', 'b']);

        api.updateGridOptions({ rowSelection: { mode: 'singleRow', checkboxes: false } });
        await settle();
        expect(displayedIds(api)).toEqual(['a', 'b']);

        api.updateGridOptions({ rowSelection: { mode: 'singleRow', checkboxes: true } });
        await settle();
        expect(displayedIds(api)).toEqual(['ag-Grid-SelectionColumn', 'a', 'b']);
    });

    test('calculatedColumns enabled, disabled and enabled in three calls shows, removes and shows the calculated column', async () => {
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [{ field: 'a' }, { field: 'c' }],
            rowData,
            calculatedColumns: false,
            initialState: {
                userColumns: [
                    {
                        colId: 'double',
                        created: true,
                        properties: [{ property: 'calculatedExpression', value: '[c] * 2' }],
                    },
                ],
            },
        });
        await settle();
        expect(displayedIds(api)).toEqual(['a', 'c']);
        // Row 0 has c = 1, so its double is 2.
        const firstDouble = () => {
            const rowNode = api.getRowNode('0');
            return rowNode && api.getCellValue({ rowNode, colKey: 'double' });
        };

        api.setGridOption('calculatedColumns', true);
        await settle();
        expect({ ids: displayedIds(api), double: firstDouble() }).toEqual({ ids: ['a', 'c', 'double'], double: 2 });

        api.setGridOption('calculatedColumns', false);
        await settle();
        expect(displayedIds(api)).toEqual(['a', 'c']);

        api.setGridOption('calculatedColumns', true);
        await settle();
        expect({ ids: displayedIds(api), double: firstDouble() }).toEqual({ ids: ['a', 'c', 'double'], double: 2 });
    });

    // d is neither grouped nor aggregated, so pivot mode hides it.
    test.each<{
        option: keyof GridOptions;
        update: GridOptions;
        ids: string[];
        autoHeader: string | undefined;
        changesDisplayedColumns: boolean;
    }>([
        {
            option: 'groupDisplayType',
            update: { groupDisplayType: 'multipleColumns' },
            ids: ['ag-Grid-AutoColumn-a', 'ag-Grid-AutoColumn-b', 'c', 'd'],
            autoHeader: undefined,
            changesDisplayedColumns: true,
        },
        {
            option: 'autoGroupColumnDef',
            update: { autoGroupColumnDef: { headerName: 'G' } },
            ids: ['ag-Grid-AutoColumn', 'c', 'd'],
            autoHeader: 'G',
            changesDisplayedColumns: false,
        },
        {
            option: 'rowNumbers',
            update: { rowNumbers: true },
            ids: ['ag-Grid-RowNumbersColumn', 'ag-Grid-AutoColumn', 'c', 'd'],
            autoHeader: 'Group',
            changesDisplayedColumns: true,
        },
        {
            option: 'rowSelection',
            update: { rowSelection: { mode: 'multiRow' } },
            ids: ['ag-Grid-SelectionColumn', 'ag-Grid-AutoColumn', 'c', 'd'],
            autoHeader: 'Group',
            changesDisplayedColumns: true,
        },
        {
            option: 'pivotMode',
            update: { pivotMode: true },
            ids: ['ag-Grid-AutoColumn', 'c'],
            autoHeader: 'Group',
            changesDisplayedColumns: true,
        },
    ])(
        'one update changing only $option raises at most one displayed columns change, and one when the displayed columns change',
        async ({ option, update, ids, autoHeader, changesDisplayedColumns }) => {
            const api = createGroupedGrid({
                columnDefs: [
                    { field: 'a', rowGroup: true, hide: true },
                    { field: 'b', rowGroup: true, hide: true },
                    { field: 'c', aggFunc: 'sum' },
                    { field: 'd' },
                ],
            });
            await settle();
            expect(displayedIds(api)).toEqual(['ag-Grid-AutoColumn', 'c', 'd']);
            const heard = hear(api, ['displayedColumnsChanged']);

            api.updateGridOptions(update);
            await settle();

            const auto = api.getColumn('ag-Grid-AutoColumn');
            expect({
                option: api.getGridOption(option),
                ids: displayedIds(api),
                autoHeader: auto ? api.getDisplayNameForColumn(auto, 'header') : undefined,
            }).toEqual({ option: update[option], ids, autoHeader });
            if (changesDisplayedColumns) {
                expect(heard).toEqual(['displayedColumnsChanged']);
            } else {
                expect(heard.length).toBeLessThanOrEqual(1);
            }
        }
    );
});

describe('columnDefs and rowData changed in one call', () => {
    const gridsManager = new TestGridsManager({ modules: [AllEnterpriseModule] });

    afterEach(() => {
        gridsManager.reset();
    });

    const settle = async () => {
        await asyncSetTimeout(0);
        await asyncSetTimeout(0);
    };

    /** The grid events of `types` heard from now, in order. */
    const hear = (api: GridApi, types: ('modelUpdated' | 'rowDataUpdated')[]) => {
        const heard: string[] = [];
        for (const type of types) {
            api.addEventListener(type, () => heard.push(type));
        }
        return heard;
    };

    /** The value of `colId` in each row, in row order. */
    const cellValues = (api: GridApi, colId: string) => {
        const values: unknown[] = [];
        api.forEachNode((rowNode) => values.push(api.getCellValue({ rowNode, colKey: colId })));
        return values;
    };

    /** `update` with its keys in the order named. */
    const inOrder = (order: 'columnDefs first' | 'rowData first', columnDefs: ColDef[], rowData: any[]): GridOptions =>
        order === 'columnDefs first' ? { columnDefs, rowData } : { rowData, columnDefs };

    test('an update changing only rowData, and one changing only columnDefs, each refresh the rows once', async () => {
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [{ field: 'name' }],
            rowData: [{ id: 1, name: 'a' }],
        });
        await settle();
        const heard = hear(api, ['modelUpdated']);

        api.updateGridOptions({ rowData: [{ id: 1, name: 'b' }] });
        await settle();
        const afterRowData = heard.splice(0);

        api.updateGridOptions({ columnDefs: [{ field: 'name' }, { field: 'id' }] });
        await settle();

        expect({
            afterRowData,
            afterColumnDefs: heard,
            name: cellValues(api, 'name'),
            id: cellValues(api, 'id'),
        }).toEqual({ afterRowData: ['modelUpdated'], afterColumnDefs: ['modelUpdated'], name: ['b'], id: [1] });
    });

    const rowId = (params: GetRowIdParams): string => params.data.id;

    test.each([
        { order: 'rowData first' as const, rowIds: 'without getRowId', getRowId: undefined },
        { order: 'rowData first' as const, rowIds: 'with getRowId', getRowId: rowId },
        {
            order: 'columnDefs first' as const,
            rowIds: 'with getRowId',
            getRowId: rowId,
        },
    ])(
        'rowData and columnDefs set together on a grid created without columns load the rows once ($order, $rowIds)',
        async (testCase) => {
            const heard: string[] = [];
            const api = gridsManager.createGrid('myGrid', {
                getRowId: testCase.getRowId,
                onRowDataUpdated: () => heard.push('rowDataUpdated'),
                onModelUpdated: (event) => heard.push(event.newData ? 'modelUpdated:new' : 'modelUpdated'),
            });
            await settle();
            heard.length = 0;

            api.updateGridOptions(
                inOrder(
                    testCase.order,
                    [{ field: 'x' }],
                    [
                        { id: 'a', x: 1 },
                        { id: 'b', x: 2 },
                    ]
                )
            );
            await settle();

            expect({ heard, x: cellValues(api, 'x') }).toEqual({
                heard: ['rowDataUpdated', 'modelUpdated:new'],
                x: [1, 2],
            });
        }
    );

    test('rowData and columnDefs set together mark the new master rows', async () => {
        const columnDefs = (): ColDef[] => [{ field: 'name', cellRenderer: 'agGroupCellRenderer' }, { field: 'n' }];
        const masters = (api: GridApi) => {
            const rows: { name: string; master: boolean }[] = [];
            api.forEachNode((node) => rows.push({ name: node.data.name, master: !!node.master }));
            return rows;
        };
        const api = gridsManager.createGrid('myGrid', {
            masterDetail: true,
            isRowMaster: (data) => !!data.kids,
            detailCellRendererParams: {
                detailGridOptions: { columnDefs: [{ field: 'k' }] },
                getDetailRowData: (params: any) => params.successCallback(params.data.kids),
            },
            columnDefs: columnDefs(),
            rowData: [{ name: 'a', n: 1 }],
        });
        await settle();

        api.updateGridOptions({
            columnDefs: columnDefs(),
            rowData: [
                { name: 'b', n: 2, kids: [{ k: 1 }] },
                { name: 'c', n: 3 },
            ],
        });
        await settle();

        expect(masters(api)).toEqual([
            { name: 'b', master: true },
            { name: 'c', master: false },
        ]);
    });

    test('rowData and columnDefs set together keep the group and leaf nodes of an immutable update', async () => {
        const columnDefs = (): ColDef[] => [
            { field: 'g', rowGroup: true, hide: true },
            { field: 'v', aggFunc: 'sum' },
        ];
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: columnDefs(),
            getRowId: (params) => params.data.id,
            rowData: [
                { id: '1', g: 'x', v: 1 },
                { id: '2', g: 'x', v: 2 },
            ],
        });
        await settle();
        const groupBefore = api.getRowNode('row-group-g-x');
        const leaf1Before = api.getRowNode('1');
        const leaf2Before = api.getRowNode('2');
        expect({ group: groupBefore?.aggData?.v, leaf1: leaf1Before?.data.v, leaf2: leaf2Before?.data.v }).toEqual({
            group: 3,
            leaf1: 1,
            leaf2: 2,
        });

        api.updateGridOptions({
            columnDefs: columnDefs(),
            rowData: [
                { id: '1', g: 'x', v: 5 },
                { id: '2', g: 'x', v: 2 },
            ],
        });
        await settle();

        const groupAfter = api.getRowNode('row-group-g-x');
        const leaf1After = api.getRowNode('1');
        const leaf2After = api.getRowNode('2');
        expect({
            sameGroup: groupAfter === groupBefore,
            sameLeaf1: leaf1After === leaf1Before,
            sameLeaf2: leaf2After === leaf2Before,
            groupSum: groupAfter?.aggData?.v,
            leaf1: leaf1After?.data.v,
        }).toEqual({ sameGroup: true, sameLeaf1: true, sameLeaf2: true, groupSum: 7, leaf1: 5 });
    });
    const displayedIds = (api: GridApi) => api.getAllDisplayedColumns().map((column) => column.getColId());

    test('a grid created with rowData and no columnDefs shows no rows until its first columnDefs arrive, and then at the width another option gave', async () => {
        const rowData = [{ id: 'a' }, { id: 'b' }, { id: 'c' }];
        const api = gridsManager.createGrid('myGrid', { rowData });
        await settle();
        const heard = hear(api, ['rowDataUpdated', 'modelUpdated']);
        const displayedRowIds = () => {
            const ids: string[] = [];
            for (let i = 0; i < api.getDisplayedRowCount(); ++i) {
                ids.push(api.getDisplayedRowAtIndex(i)!.data.id);
            }
            return ids;
        };

        api.setGridOption('defaultColDef', { width: 120 });
        await settle();
        const afterDefaultColDef = { heard: heard.splice(0), displayed: displayedRowIds() };

        api.setGridOption('columnDefs', [{ field: 'id' }]);
        await settle();
        const afterColumnDefs = {
            heard: heard.splice(0),
            displayed: displayedRowIds(),
            columns: displayedIds(api),
            width: api.getColumn('id')?.getActualWidth(),
        };

        expect({ afterDefaultColDef, afterColumnDefs }).toEqual({
            afterDefaultColDef: { heard: [], displayed: [] },
            afterColumnDefs: {
                heard: ['rowDataUpdated', 'modelUpdated'],
                displayed: ['a', 'b', 'c'],
                columns: ['id'],
                width: 120,
            },
        });
    });

    test('the first columnDefs of a grid created with neither columnDefs nor rowData raise no model or pagination event, as when it is created with them; with rowData they raise one modelUpdated', async () => {
        const heardAfterColumnDefs = async (options: GridOptions, types: ('modelUpdated' | 'paginationChanged')[]) => {
            const api = gridsManager.createGrid(options.rowData ? 'withRowData' : 'withoutRowData', options);
            await settle();
            const heard: string[] = [];
            for (const type of types) {
                api.addEventListener(type, () => heard.push(type));
            }

            api.setGridOption('columnDefs', [{ field: 'a' }]);
            await settle();

            return { heard, columns: displayedIds(api) };
        };

        const withoutRowData = await heardAfterColumnDefs({}, ['modelUpdated', 'paginationChanged']);
        const withRowData = await heardAfterColumnDefs({ rowData: [{ a: 1 }] }, ['modelUpdated']);

        expect({ withoutRowData, withRowData }).toEqual({
            withoutRowData: { heard: [], columns: ['a'] },
            withRowData: { heard: ['modelUpdated'], columns: ['a'] },
        });
    });

    test('a data type matcher throwing while the new columnDefs are built throws to the caller, and the next update shows its columns and rowData', async () => {
        let armed = false;
        let matcherCalls = 0;
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [{ field: 'a' }],
            rowData: [{ a: 1 }],
            dataTypeDefinitions: {
                mine: {
                    baseDataType: 'text',
                    extendsDataType: 'text',
                    dataTypeMatcher: () => {
                        if (armed) {
                            ++matcherCalls;
                            throw new Error('matcher failed');
                        }
                        return false;
                    },
                },
            },
        });
        await settle();
        armed = true;

        expect(() =>
            api.updateGridOptions({
                columnDefs: [{ field: 'a' }, { colId: 'b', valueGetter: () => 1 }],
                rowData: [{ a: 2 }, { a: 3 }],
            })
        ).toThrow('matcher failed');
        armed = false;
        const matcherCallsBefore = matcherCalls;
        await settle();

        api.updateGridOptions({
            columnDefs: [{ field: 'a' }, { colId: 'b', valueGetter: () => 1 }],
            rowData: [{ a: 4 }, { a: 5 }, { a: 6 }],
        });
        await settle();

        const displayed: unknown[] = [];
        for (let i = 0; i < api.getDisplayedRowCount(); ++i) {
            displayed.push(api.getDisplayedRowAtIndex(i)!.data.a);
        }
        expect({
            matcherRan: matcherCallsBefore > 0,
            columns: api.getAllDisplayedColumns().map((column) => column.getColId()),
            displayed,
            b: cellValues(api, 'b'),
        }).toEqual({
            matcherRan: true,
            columns: ['a', 'b'],
            displayed: [4, 5, 6],
            b: [1, 1, 1],
        });
    });

    describe('grouped rows', () => {
        /** Each displayed row, top to bottom, as its level and its group key or its row id. */
        const displayedTree = (api: GridApi) => {
            const rows: string[] = [];
            for (let i = 0; i < api.getDisplayedRowCount(); ++i) {
                const node = api.getDisplayedRowAtIndex(i)!;
                rows.push(`${node.level} ${node.group ? node.key : node.data.id}`);
            }
            return rows;
        };

        describe('two transactions on one new row inside a column update', () => {
            const rowN = (a: string) => ({ id: 'n', a, v: 9 });
            const createGrid = (second: 'remove' | 'move to Z') => {
                const api = gridsManager.createGrid('myGrid', {
                    columnDefs: [{ field: 'a', rowGroup: true, hide: true }, { field: 'v' }],
                    groupDefaultExpanded: -1,
                    getRowId: (params) => params.data.id,
                    rowData: [
                        { id: '1', a: 'X', v: 1 },
                        { id: '2', a: 'X', v: 2 },
                    ],
                });
                let ran = 0;
                api.getColumn('v')!.addEventListener('visibleChanged', () => {
                    ++ran;
                    api.applyTransaction({ add: [rowN('Y')] });
                    api.applyTransaction(second === 'remove' ? { remove: [{ id: 'n' }] } : { update: [rowN('Z')] });
                });
                return { api, ran: () => ran };
            };

            test('an add then a remove leave the row nowhere', async () => {
                const { api, ran } = createGrid('remove');
                await settle();
                expect(displayedTree(api)).toEqual(['0 X', '1 1', '1 2']);

                api.setColumnsVisible(['v'], false);
                await settle();

                expect({
                    ran: ran(),
                    vVisible: api.getColumn('v')!.isVisible(),
                    n: api.getRowNode('n')?.id,
                    groupY: api.getRowNode('row-group-a-Y')?.id,
                    displayed: displayedTree(api),
                }).toEqual({
                    ran: 1,
                    vVisible: false,
                    n: undefined,
                    groupY: undefined,
                    displayed: ['0 X', '1 1', '1 2'],
                });
            });

            test('an add then an update moving it to another group leave it once, under that group', async () => {
                const { api, ran } = createGrid('move to Z');
                await settle();

                api.setColumnsVisible(['v'], false);
                await settle();

                expect({
                    ran: ran(),
                    vVisible: api.getColumn('v')!.isVisible(),
                    groupY: api.getRowNode('row-group-a-Y')?.id,
                    childrenOfZ: api.getRowNode('row-group-a-Z')?.childrenAfterGroup?.map((node) => node.data.id),
                    displayed: displayedTree(api),
                }).toEqual({
                    ran: 1,
                    vVisible: false,
                    groupY: undefined,
                    childrenOfZ: ['n'],
                    displayed: ['0 X', '1 1', '1 2', '0 Z', '1 n'],
                });
            });
        });
    });
});

describe('a column update that throws', () => {
    const gridsManager = new TestGridsManager({ modules: [ClientSideRowModelModule, ColumnApiModule] });
    const stateGridsManager = new TestGridsManager({
        modules: [ClientSideRowModelModule, ColumnApiModule, GridStateModule],
    });

    afterEach(() => {
        gridsManager.reset();
        stateGridsManager.reset();
    });

    test('a sort comparator throwing in a call that also hides a column leaves the header and the rows showing the displayed columns', async () => {
        let failing = true;
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [
                {
                    field: 'a',
                    comparator: (x: number, y: number) => {
                        if (failing) {
                            throw new Error('comparator failed');
                        }
                        return x - y;
                    },
                },
                { field: 'b' },
                { field: 'c' },
            ],
            rowData: [
                { a: 1, b: 2, c: 3 },
                { a: 4, b: 5, c: 6 },
            ],
        });
        const gridElement = getGridElement(api)!;
        const shown = () => ({
            headers: [...gridElement.querySelectorAll('.ag-header-cell[col-id]')].map((el) =>
                el.getAttribute('col-id')
            ),
            firstRow: [...gridElement.querySelectorAll('.ag-row[row-index="0"] .ag-cell[col-id]')].map((el) =>
                el.getAttribute('col-id')
            ),
        });
        await waitFor(() => expect(shown()).toEqual({ headers: ['a', 'b', 'c'], firstRow: ['a', 'b', 'c'] }));

        expect(() =>
            api.applyColumnState({
                state: [
                    { colId: 'a', sort: 'asc' },
                    { colId: 'b', hide: true },
                ],
            })
        ).toThrow('comparator failed');
        failing = false;

        expect(api.getAllDisplayedColumns().map((column) => column.getColId())).toEqual(['a', 'c']);
        await waitFor(() => expect(shown()).toEqual({ headers: ['a', 'c'], firstRow: ['a', 'c'] }));

        // a call that changes no column still finds the columns laid out
        api.setGridOption('rowData', [{ a: 7, b: 8, c: 9 }]);
        await waitFor(() => expect(shown()).toEqual({ headers: ['a', 'c'], firstRow: ['a', 'c'] }));
    });

    test('a column listener throwing leaves no column animation running after the call', async () => {
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [{ field: 'a' }, { field: 'b' }, { field: 'c' }, { field: 'd' }],
            defaultColDef: { width: 100 },
            rowData: [{ a: 1, b: 2, c: 3, d: 4 }],
        });
        const gridElement = getGridElement(api)!;
        const animating = () => gridElement.querySelector('.ag-column-moving') !== null;
        let failing = true;
        api.getColumn('a')!.addEventListener('visibleChanged', () => {
            if (failing) {
                throw new Error('listener failed');
            }
        });

        vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
        onTestFinished(() => {
            vi.useRealTimers();
        });
        expect(() => api.applyColumnState({ state: [{ colId: 'a', hide: true }] })).toThrow('listener failed');
        failing = false;
        const slidingAfterCall = animating();
        // a move slides for 200 ms
        await vi.advanceTimersByTimeAsync(200);

        expect({ slidingAfterCall, slidingAfterSlide: animating() }).toEqual({
            slidingAfterCall: true,
            slidingAfterSlide: false,
        });
        expect(api.getAllDisplayedColumns().map((column) => column.getColId())).toEqual(['b', 'c', 'd']);
    });

    test('a layout listener throwing leaves no column animation running after the call', async () => {
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [{ field: 'a' }, { field: 'b' }, { field: 'c' }, { field: 'd' }],
            defaultColDef: { width: 100 },
            rowData: [{ a: 1, b: 2, c: 3, d: 4 }],
        });
        const gridElement = getGridElement(api)!;
        const animating = () => gridElement.querySelector('.ag-column-moving') !== null;
        let failing = true;
        api.getColumn('b')!.addEventListener('leftChanged', () => {
            if (failing) {
                throw new Error('listener failed');
            }
        });

        vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
        onTestFinished(() => {
            vi.useRealTimers();
        });
        expect(() => api.applyColumnState({ state: [{ colId: 'a', hide: true }] })).toThrow('listener failed');
        failing = false;
        const slidingAfterCall = animating();
        // a move slides for 200 ms
        await vi.advanceTimersByTimeAsync(200);

        expect({ slidingAfterCall, slidingAfterSlide: animating() }).toEqual({
            slidingAfterCall: true,
            slidingAfterSlide: false,
        });
        expect(api.getColumn('b')!.getLeft()).toBe(0);
    });

    test('a layout listener throwing leaves the grid state holding the change the call made', async () => {
        const api = stateGridsManager.createGrid('myGrid', {
            columnDefs: [{ field: 'a' }, { field: 'b' }, { field: 'c' }],
            rowData: [{ a: 1, b: 2, c: 3 }],
        });
        await asyncSetTimeout(0);
        let failing = true;
        api.getColumn('b')!.addEventListener('leftChanged', () => {
            if (failing) {
                throw new Error('listener failed');
            }
        });
        expect(api.getState().columnVisibility).toBeUndefined();

        expect(() => api.applyColumnState({ state: [{ colId: 'a', hide: true }] })).toThrow('listener failed');
        failing = false;

        expect(api.getState().columnVisibility).toEqual({ hiddenColIds: ['a'] });
    });
});
