import { waitFor } from '@testing-library/dom';
import { DragEventDispatcher, GridRows, TestGridsManager, asyncSetTimeout, mockGridLayout } from 'ag-test-utils';

import type {
    AgColumn,
    AgEventType,
    ColDef,
    ColGroupDef,
    Column,
    ColumnState,
    GetRowIdParams,
    GridApi,
    GridOptions,
    ICellRendererParams,
    IColumnStateUpdateStrategy,
    KeyCreatorParams,
} from 'ag-grid-community';
import {
    ClientSideRowModelModule,
    ColumnApiModule,
    ColumnAutoSizeModule,
    GRAND_TOTAL_ROW_ID,
    GridStateModule,
    TextFilterModule,
    getGridElement,
} from 'ag-grid-community';
import {
    AllEnterpriseModule,
    PivotModule,
    RowGroupingModule,
    RowNumbersModule,
    ServerSideRowModelModule,
    SetFilterModule,
} from 'ag-grid-enterprise';

/** The grid API's listener registration, typed for the internal events too, which the grid raises the same way. */
interface AnyEventApi {
    addEventListener(eventType: AgEventType, listener: () => void): void;
}

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

    test('a group opened and then removed inside one update, by a column listener, is told nothing', () => {
        const api = createGrid(false);
        const seen: string[] = [];
        api.getProvidedColumnGroup('g2')!.addEventListener('expandedChanged', () => seen.push('g2'));
        api.setColumnGroupOpened('g2', true);
        expect(seen).toEqual(['g2']);
        api.getColumn('a')!.addEventListener('visibleChanged', () => {
            api.setColumnGroupOpened('g2', false);
            api.setGridOption('columnDefs', [{ field: 'a' }, { field: 'b' }]);
        });

        api.setColumnsVisible(['a'], false);

        expect(seen).toEqual(['g2']);
        expect(ids(api)).toBe('b');
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

    test.each<[string, (api: GridApi, pivotMode: boolean) => void]>([
        ['setGridOption', (api, pivotMode) => api.setGridOption('pivotMode', pivotMode)],
        ['columnDefs: undefined', (api, pivotMode) => api.updateGridOptions({ pivotMode, columnDefs: undefined })],
    ])(
        'pivot mode switched on with nothing to pivot draws none of the columns it hides, and switched off draws them all again (%s)',
        async (_, setPivotMode) => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [{ field: 'a' }, { field: 'b' }],
                rowData: [{ a: 1, b: 2 }],
                suppressColumnVirtualisation: false,
            });
            const drawn = () => {
                const ids = (selector: string) =>
                    Array.from(getGridElement(api)!.querySelectorAll(selector), (el) =>
                        el.getAttribute('col-id')
                    ).join();
                return { headers: ids('.ag-header-cell'), cells: ids('.ag-row[row-index="0"] .ag-cell') };
            };
            await waitFor(() => expect(drawn()).toEqual({ headers: 'a,b', cells: 'a,b' }));

            setPivotMode(api, true);
            await asyncSetTimeout(0);
            const pivoted = { displayed: api.getAllDisplayedColumns().length, ...drawn() };
            setPivotMode(api, false);
            await asyncSetTimeout(0);

            expect([pivoted, drawn()]).toEqual([
                { displayed: 0, headers: '', cells: '' },
                { headers: 'a,b', cells: 'a,b' },
            ]);
        }
    );
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

    test('an options change of rowData and a header option loads the rows once', async () => {
        const events: string[] = [];
        const api = gridsManager.createGrid('headerOptionAndRows', {
            columnDefs: [{ field: 'value' }],
            rowData: [{ id: '1', value: 1 }],
            onRowDataUpdated: () => events.push('rowDataUpdated'),
            onModelUpdated: () => events.push('modelUpdated'),
        });
        await waitFor(() => expect(events).toContain('modelUpdated'));
        await asyncSetTimeout(0);
        events.length = 0;

        api.updateGridOptions({
            suppressMenuHide: true,
            rowData: [
                { id: '1', value: 2 },
                { id: '2', value: 3 },
            ],
        });
        await waitFor(() => expect(events).toContain('modelUpdated'));
        await asyncSetTimeout(0);

        expect(events.sort()).toEqual(['modelUpdated', 'rowDataUpdated']);
    });

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

    test('a transaction a data type matcher applies during a columnDefs update shows its row once, grouped by the new columns, in one refresh', async () => {
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
        const refreshes = countRefreshes(api);

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
        expect(refreshes()).toBe(1);
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

    test('one applyColumnState grouping a column and aggregating another refreshes the rows once, grouped and aggregated', async () => {
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

    test('one applyColumnState aggregating a column and sorting by it on a grouped grid refreshes the rows once, animated when rows animate, groups ordered by their sum', async () => {
        const groupedRowData = [
            { id: '1', country: 'Ireland', sport: 'Rowing', gold: 1 },
            { id: '2', country: 'Ireland', sport: 'Boxing', gold: 2 },
            { id: '3', country: 'France', sport: 'Rowing', gold: 5 },
        ];
        const api = gridsManager.createGrid('animatedAggregateAndSort', {
            columnDefs: [{ field: 'country', rowGroup: true, hide: true }, { field: 'sport' }, { field: 'gold' }],
            rowData: groupedRowData,
            getRowId: (params) => params.data.id,
            animateRows: true,
            ensureDomOrder: false, // the harness enforces the DOM order, which turns row animation off
        });
        await asyncSetTimeout(0);
        const animated: (boolean | undefined)[] = [];
        api.addEventListener('modelUpdated', (event) => animated.push(event.animate));

        api.applyColumnState({
            state: [{ colId: 'gold', aggFunc: 'sum', sort: 'desc' }],
        });
        await waitFor(() => expect(animated).toHaveLength(1), { timeout: 300 });
        await asyncSetTimeout(0);

        expect(animated).toEqual([true]);
        await new GridRows(api, 'aggregated and sorted').check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ LEAF_GROUP collapsed id:row-group-country-France ag-Grid-AutoColumn:"France" gold:5
            │ └── LEAF hidden id:3 country:"France" sport:"Rowing" gold:5
            └─┬ LEAF_GROUP collapsed id:row-group-country-Ireland ag-Grid-AutoColumn:"Ireland" gold:3
            · ├── LEAF hidden id:2 country:"Ireland" sport:"Boxing" gold:2
            · └── LEAF hidden id:1 country:"Ireland" sport:"Rowing" gold:1
        `);
    });

    test('a columnDefs update that replaces the rows (a new aggregation or pivot column) refreshes them once without animation, one that keeps them animates', async () => {
        const medalRows = [
            { country: 'Ireland', year: '2000', gold: 1 },
            { country: 'Ireland', year: '2004', gold: 3 },
            { country: 'France', year: '2000', gold: 4 },
        ];
        const groupedDefs = (aggFunc: 'sum' | 'max', goldSort?: 'desc'): ColDef[] => [
            { field: 'country', rowGroup: true },
            { field: 'year' },
            { field: 'gold', aggFunc, ...(goldSort && { sort: goldSort }) },
        ];

        /** Runs one columnDefs update on a settled grid and returns every modelUpdated flag pair it raised. */
        async function recordUpdate(options: GridOptions, next: ColDef[], prepare?: (api: GridApi) => Promise<void>) {
            const api = gridsManager.createGrid('replacedRows', {
                rowData: medalRows,
                animateRows: true,
                ensureDomOrder: false, // the harness enforces the DOM order, which turns row animation off
                ...options,
            });
            await asyncSetTimeout(0);
            await prepare?.(api);
            const refreshes: { keepRenderedRows: boolean | undefined; animate: boolean | undefined }[] = [];
            api.addEventListener('modelUpdated', (event) =>
                refreshes.push({ keepRenderedRows: event.keepRenderedRows, animate: event.animate })
            );

            api.setGridOption('columnDefs', next);
            await waitFor(() => expect(refreshes).toHaveLength(1), { timeout: 300 });
            await asyncSetTimeout(0);
            return { api, refreshes };
        }

        const keepsRows = await recordUpdate({ columnDefs: groupedDefs('sum') }, [
            ...groupedDefs('sum'),
            { field: 'total', valueGetter: (params) => params.data?.gold },
        ]);
        gridsManager.reset();

        const newAggregation = await recordUpdate({ columnDefs: groupedDefs('sum') }, groupedDefs('max'));
        const maxByCountry: string[] = [];
        newAggregation.api.forEachNode((node) => {
            if (node.group) {
                maxByCountry.push(`${node.key}:${node.aggData.gold}`);
            }
        });
        gridsManager.reset();

        const newPivotColumn = await recordUpdate(
            {
                columnDefs: [
                    { field: 'country', rowGroup: true },
                    { field: 'year', pivot: true },
                    { field: 'gold', aggFunc: 'sum' },
                ],
                pivotMode: true,
            },
            [
                { field: 'country', rowGroup: false, pivot: true },
                { field: 'year', rowGroup: true, pivot: false },
                { field: 'gold', aggFunc: 'sum' },
            ]
        );

        const pivotColumns = newPivotColumn.api.getPivotColumns().map((column) => column.getColId());
        gridsManager.reset();

        const newAggregationAndSort = await recordUpdate(
            { columnDefs: groupedDefs('sum') },
            groupedDefs('max', 'desc')
        );
        gridsManager.reset();

        const newSort = await recordUpdate({ columnDefs: groupedDefs('sum') }, groupedDefs('sum', 'desc'));
        gridsManager.reset();

        const yearFilterModel = { year: { filterType: 'text', type: 'contains', filter: '2000' } };
        let filterModelBefore: unknown;
        const filteredColumnDropped = await recordUpdate(
            {
                columnDefs: [
                    { field: 'country', rowGroup: true },
                    { field: 'year', filter: 'agTextColumnFilter' },
                    { field: 'gold', aggFunc: 'sum' },
                ],
            },
            [
                { field: 'country', rowGroup: true },
                { field: 'gold', aggFunc: 'max' },
            ],
            async (api) => {
                api.setFilterModel(yearFilterModel);
                await asyncSetTimeout(0);
                filterModelBefore = api.getFilterModel();
            }
        );

        expect({
            keepsRows: keepsRows.refreshes,
            newAggregation: newAggregation.refreshes,
            newPivotColumn: newPivotColumn.refreshes,
            newAggregationAndSort: newAggregationAndSort.refreshes,
            newSort: newSort.refreshes,
            filteredColumnDropped: filteredColumnDropped.refreshes,
            maxByCountry,
            pivotColumns,
            filterModelBefore,
            filterModelAfter: filteredColumnDropped.api.getFilterModel(),
        }).toEqual({
            keepsRows: [{ keepRenderedRows: true, animate: true }],
            newAggregation: [{ keepRenderedRows: false, animate: false }],
            newPivotColumn: [{ keepRenderedRows: false, animate: false }],
            newAggregationAndSort: [{ keepRenderedRows: false, animate: false }],
            newSort: [{ keepRenderedRows: true, animate: true }],
            filteredColumnDropped: [{ keepRenderedRows: false, animate: false }],
            maxByCountry: ['Ireland:3', 'France:4'],
            pivotColumns: ['country'],
            filterModelBefore: yearFilterModel,
            filterModelAfter: {},
        });
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

    test('new column definitions reversing the pivot sort reverse the pivot result columns, telling which moved after the rows refresh', async () => {
        const { order, moved, displayed } = await reversePivotSort((api) =>
            api.setGridOption('columnDefs', pivotColumnDefs({ field: 'year', pivot: true, pivotSort: 'desc' }))
        );

        expect({ order, moved, displayed }).toEqual({
            order: ['modelUpdated', 'columnMoved'],
            moved: ['2000', '2004', '2008', '2012'],
            displayed: ['2012', '2008', '2004', '2000'],
        });
    });

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

    test('a pivot column applied a new pivot sort raises columnPivotChanged, columnMoved for the reordered pivot result columns, then displayedColumnsChanged', async () => {
        const api = gridsManager.createGrid('pivotSortOrder', {
            columnDefs: pivotColumnDefs({ field: 'year', pivot: true }),
            rowData: pivotRowData,
            pivotMode: true,
        });
        await waitFor(() => expect(api.getPivotResultColumns()).toHaveLength(4), { timeout: 300 });
        await asyncSetTimeout(0);
        const heard: string[] = [];
        for (const type of ['columnPivotChanged', 'columnMoved', 'displayedColumnsChanged'] as const) {
            api.addEventListener(type, () => heard.push(type));
        }

        api.applyColumnState({ state: [{ colId: 'year', pivotSort: 'desc' }] });
        await waitFor(() => expect(heard).toContain('columnMoved'), { timeout: 300 });
        await asyncSetTimeout(0);

        expect(displayedPivotYears(api)).toEqual(['2012', '2008', '2004', '2000']);
        expect(heard).toEqual(['columnPivotChanged', 'columnMoved', 'displayedColumnsChanged']);
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

    test('one applyColumnState hiding a column and grouping another raises its column events before the rows refresh, once', async () => {
        const api = gridsManager.createGrid('hideAndGroup', {
            columnDefs: [{ field: 'country' }, { field: 'sport' }, { field: 'gold' }],
            rowData,
            getRowId: (params) => params.data.id,
        });
        await asyncSetTimeout(0);
        const order: string[] = [];
        for (const type of ['columnRowGroupChanged', 'columnVisible', 'modelUpdated'] as const) {
            api.addEventListener(type, () => order.push(type));
        }

        api.applyColumnState({
            state: [
                { colId: 'sport', hide: true },
                { colId: 'country', rowGroup: true },
            ],
        });
        await waitFor(() => expect(order).toContain('modelUpdated'), { timeout: 300 });
        await asyncSetTimeout(0);

        expect(order).toEqual(['columnRowGroupChanged', 'columnVisible', 'modelUpdated']);
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

    test('a fit to the width the columns already fill leaves column width changes unanimated', async () => {
        const api = createFittingGrid();
        expect(resizeAnimating(api)).toBe(false);

        api.sizeColumnsToFit(600);

        expect(api.getAllDisplayedColumns().map((column) => column.getActualWidth())).toEqual([300, 300]);
        expect(resizeAnimating(api)).toBe(false);
        await asyncSetTimeout(0);
        expect(resizeAnimating(api)).toBe(false);
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

    test('setting the group state the groups are already in leaves the next column change jumping', async () => {
        const api = await createGroupGrid();
        expect(order(api)).toBe('a,c,d');

        api.setColumnGroupState(api.getColumnGroupState());

        widenFirstGroupColumn(api);
        expect(moving(api)).toBe(false);
    });

    test('closing a group that is closed leaves the next column change jumping', async () => {
        const api = await createGroupGrid();

        api.setColumnGroupOpened('g', false);

        widenFirstGroupColumn(api);
        expect(moving(api)).toBe(false);
    });

    test('resetting the group state when every group is at its default leaves the next column change jumping', async () => {
        const api = await createGroupGrid();

        api.resetColumnGroupState();

        widenFirstGroupColumn(api);
        expect(moving(api)).toBe(false);
    });

    test('opening a group makes the next column change slide', async () => {
        const api = await createGroupGrid();

        api.setColumnGroupOpened('g', true);
        expect(order(api)).toBe('a,b,c,d');
        expect(cellLeft(api, 'c')).toBe('200px');

        widenFirstGroupColumn(api);
        expect({ moving: moving(api), cLeft: cellLeft(api, 'c') }).toEqual({ moving: true, cLeft: '250px' });
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

    test('moving a column by moveColumns before a locked column or to the index it is already at changes nothing and leaves the next column change jumping', async () => {
        const api = await createLockedGrid();

        api.moveColumns(['athlete'], 0);

        expect(order(api)).toBe('year,athlete,country,sport');
        widenAthlete(api);
        expect(moving(api)).toBe(false);

        api.moveColumns(['athlete'], 1);

        expect(order(api)).toBe('year,athlete,country,sport');
        api.setColumnWidths([{ key: 'athlete', newWidth: 200 }]);
        expect({ width: api.getColumn('athlete')!.getActualWidth(), moving: moving(api) }).toEqual({
            width: 200,
            moving: false,
        });
    });

    test('moving a column before a locked column by moveColumnByIndex changes nothing and leaves the next column change jumping', async () => {
        const api = await createLockedGrid();

        api.moveColumnByIndex(1, 0);

        expect(order(api)).toBe('year,athlete,country,sport');
        widenAthlete(api);
        expect(moving(api)).toBe(false);
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

    test('applying the column state the columns are already in leaves the next column change jumping', async () => {
        const api = await createAnimatedGrid();

        api.applyColumnState({ state: api.getColumnState() });

        expect({ resizeAnimating: resizeAnimating(api), moving: moving(api) }).toEqual({
            resizeAnimating: false,
            moving: false,
        });
        narrowA(api);
        expect({ resizeAnimating: resizeAnimating(api), moving: moving(api), bLeft: cellLeft(api, 'b') }).toEqual({
            resizeAnimating: false,
            moving: false,
            bLeft: '250px',
        });
    });

    test('column calls that change nothing, however many in a row, leave neither the width animation nor the move animation on', async () => {
        const api = await createAnimatedGrid();
        const animations = () => ({ resizeAnimating: resizeAnimating(api), moving: moving(api) });
        const off = { resizeAnimating: false, moving: false };
        expect(animations()).toEqual(off);

        api.applyColumnState({ state: api.getColumnState() });
        expect(animations()).toEqual(off);

        api.applyColumnState({ state: api.getColumnState() });
        expect(animations()).toEqual(off);

        api.sizeColumnsToFit(600);
        expect(api.getAllDisplayedColumns().map((column) => column.getActualWidth())).toEqual([300, 300]);
        expect(animations()).toEqual(off);
    });

    test('a fit when every column is at its maximum width leaves the next column change jumping', async () => {
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [{ colId: 'a' }, { colId: 'b' }],
            defaultColDef: { width: 100, maxWidth: 100 },
            animateColumnResizing: true,
            rowData: [{}],
        });
        await waitFor(() => expect(moving(api)).toBe(false));

        api.sizeColumnsToFit(600);

        expect(api.getAllDisplayedColumns().map((column) => column.getActualWidth())).toEqual([100, 100]);
        expect(resizeAnimating(api)).toBe(false);
        api.setColumnWidths([{ key: 'a', newWidth: 80 }]);
        expect(api.getColumn('a')!.getActualWidth()).toBe(80);
        expect({ resizeAnimating: resizeAnimating(api), moving: moving(api), bLeft: cellLeft(api, 'b') }).toEqual({
            resizeAnimating: false,
            moving: false,
            bLeft: '80px',
        });
    });

    test('resetting the column state when every column is at its definition leaves the next column change jumping', async () => {
        const api = await createAnimatedGrid();

        api.resetColumnState();

        expect({ resizeAnimating: resizeAnimating(api), moving: moving(api) }).toEqual({
            resizeAnimating: false,
            moving: false,
        });
        narrowA(api);
        expect({ moving: moving(api), bLeft: cellLeft(api, 'b') }).toEqual({ moving: false, bLeft: '250px' });
    });

    test('setting column definitions equal to the current ones leaves the next column change jumping', async () => {
        const api = await createAnimatedGrid([{ colId: 'a' }, { colId: 'b' }]);

        api.setGridOption('columnDefs', [{ colId: 'a' }, { colId: 'b' }]);

        expect({ resizeAnimating: resizeAnimating(api), moving: moving(api) }).toEqual({
            resizeAnimating: false,
            moving: false,
        });
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

    test('a call that changes nothing, made while a width change animates, leaves the animation to end 250 ms after the width change', async () => {
        const api = await createAnimatedGrid();

        vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
        onTestFinished(() => {
            vi.useRealTimers();
        });
        api.applyColumnState({ state: [{ colId: 'a', width: 400 }] });
        expect(resizeAnimating(api)).toBe(true);
        await vi.advanceTimersByTimeAsync(100);
        expect(resizeAnimating(api)).toBe(true);

        api.applyColumnState({ state: api.getColumnState() });
        const afterNoOp = resizeAnimating(api);
        // 249 ms after the width change, 149 ms after the call that changed nothing
        await vi.advanceTimersByTimeAsync(149);
        const justBeforeEnd = resizeAnimating(api);
        await vi.advanceTimersByTimeAsync(1);

        expect({
            widths: api.getAllDisplayedColumns().map((column) => column.getActualWidth()),
            afterNoOp,
            justBeforeEnd,
            atEnd: resizeAnimating(api),
        }).toEqual({ widths: [400, 300], afterNoOp: true, justBeforeEnd: true, atEnd: false });
    });

    test.each<[string, (api: GridApi) => void]>([
        [
            'applyColumnState with the state the columns are in',
            (api) => api.applyColumnState({ state: api.getColumnState() }),
        ],
        ['autoSizeColumns on a column already at its autosized width', (api) => api.autoSizeColumns(['b'])],
    ])(
        '%s, made from a listener of the column update that changed the width, leaves the width animation on',
        async (_, noOp) => {
            const api = await createAnimatedGrid();
            // happy-dom measures no content: b settles on its autosized width, so the call in the listener changes nothing
            vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
            onTestFinished(() => {
                vi.useRealTimers();
            });
            api.autoSizeColumns(['b']);
            await vi.advanceTimersByTimeAsync(250);
            expect(resizeAnimating(api)).toBe(false);
            const bWidth = api.getColumn('b')!.getActualWidth();
            let listenerCalls = 0;
            api.getColumn('a')!.addEventListener('widthChanged', () => {
                ++listenerCalls;
                noOp(api);
            });

            api.applyColumnState({ state: [{ colId: 'a', width: 400 }] });

            expect({
                listenerCalls,
                widths: api.getAllDisplayedColumns().map((column) => column.getActualWidth()),
                resizeAnimating: resizeAnimating(api),
            }).toEqual({ listenerCalls: 1, widths: [400, bWidth], resizeAnimating: true });
        }
    );

    test('a call that changes nothing, made from a columnResized listener, leaves the width animation on', async () => {
        const api = await createAnimatedGrid();
        let resized = 0;
        let animatingInListener: boolean | undefined;
        api.addEventListener('columnResized', () => {
            ++resized;
            api.applyColumnState({ state: api.getColumnState() });
            animatingInListener = resizeAnimating(api);
        });

        api.applyColumnState({ state: [{ colId: 'a', width: 400 }] });
        await waitFor(() => expect(resized).toBeGreaterThan(0), { timeout: 1000 });

        expect({ animatingInListener, animatingAfter: resizeAnimating(api) }).toEqual({
            animatingInListener: true,
            animatingAfter: true,
        });
    });
});

describe('the layout events of a resize', () => {
    const gridsManager = new TestGridsManager({
        modules: [ClientSideRowModelModule, ColumnApiModule, ColumnAutoSizeModule],
    });

    afterEach(() => {
        gridsManager.reset();
    });

    test('a column an autosize moves in two passes is told its left once', async () => {
        const api = gridsManager.createGrid('myGrid', {
            // happy-dom measures no content, so an autosize lands on `minWidth`; each wide column hides the next
            columnDefs: [
                { field: 'a', width: 3000, minWidth: 100 },
                { field: 'b', width: 3000, minWidth: 100 },
                { field: 'c' },
            ],
            defaultColDef: { width: 100 },
            rowData: [{ a: 1, b: 2, c: 3 }],
            suppressColumnVirtualisation: false,
            suppressAnimationFrame: true,
        });
        const lefts: (number | null)[] = [];
        const c = api.getColumn('c')!;
        c.addEventListener('leftChanged', () => lefts.push(c.getLeft()));

        api.autoSizeColumns(['a', 'b']);
        await asyncSetTimeout(0);

        expect(lefts).toEqual([200]);
    });
});

describe('the column events of an updateGridOptions call changing column options', () => {
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

    /** Every grid event heard from now, in order. */
    const hearAll = (api: GridApi) => {
        const heard: string[] = [];
        api.addGlobalListener((type: string) => heard.push(type));
        return heard;
    };

    const columnHeaders = (api: GridApi) =>
        api.getAllGridColumns().map((column) => [column.getColId(), api.getDisplayNameForColumn(column, 'header')]);

    test('one update changing groupDisplayType and autoGroupColumnDef refreshes the rows, then raises columnEverythingChanged with one displayed columns change', async () => {
        const api = createGroupedGrid();
        await settle();
        const heard = hearAll(api);

        api.updateGridOptions({ groupDisplayType: 'multipleColumns', autoGroupColumnDef: { headerName: 'G' } });
        await settle();

        expect(columnHeaders(api)).toEqual([
            ['ag-Grid-AutoColumn-a', 'G'],
            ['ag-Grid-AutoColumn-b', 'G'],
            ['a', 'A'],
            ['b', 'B'],
            ['c', 'C'],
        ]);
        expect(heard).toEqual([
            'showRowGroupColsSetChanged',
            'gridColumnsChanged',
            'modelUpdated',
            'paginationChanged',
            'virtualRowRemoved',
            'virtualRowRemoved',
            'displayedRowsChanged',
            'columnContainerWidthChanged',
            'displayedColumnsWidthChanged',
            'virtualColumnsChanged',
            'displayedColumnsChanged',
            'columnEverythingChanged',
            'stateUpdated',
        ]);
    });

    test('one update turning on rowNumbers and rowSelection raises one displayed columns change, showing both columns', async () => {
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [{ field: 'a' }, { field: 'b' }],
            rowData,
        });
        await settle();
        const heard = hear(api, ['displayedColumnsChanged']);

        api.updateGridOptions({ rowNumbers: true, rowSelection: { mode: 'multiRow' } });
        await settle();

        expect(displayedIds(api).sort()).toEqual(
            ['a', 'ag-Grid-RowNumbersColumn', 'ag-Grid-SelectionColumn', 'b'].sort()
        );
        expect(heard).toEqual(['displayedColumnsChanged']);
    });

    test('one update switching pivot mode on, turning on rowNumbers and changing defaultColDef refreshes the rows once and raises one displayed columns change', async () => {
        const api = createGroupedGrid();
        await settle();
        const heard = hear(api, ['modelUpdated', 'displayedColumnsChanged']);

        api.updateGridOptions({ pivotMode: true, rowNumbers: true, defaultColDef: { width: 123 } });
        await settle();

        expect(api.isPivotMode()).toBe(true);
        expect(heard.sort()).toEqual(['displayedColumnsChanged', 'modelUpdated']);
    });

    test('one update changing groupDisplayType, rowData and autoGroupColumnDef refreshes the rows once, with the new auto group column header, then raises columnEverythingChanged', async () => {
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [
                { field: 'a', rowGroup: true, hide: true },
                { field: 'c', aggFunc: 'sum' },
            ],
            rowData,
        });
        await settle();
        const heard = hearAll(api);
        const headersHeard: string[][][] = [];
        api.addEventListener('modelUpdated', () => {
            headersHeard.push(columnHeaders(api));
        });

        api.updateGridOptions({
            groupDisplayType: 'multipleColumns',
            rowData: [
                { a: 'z', c: 5 },
                { a: 'w', c: 6 },
            ],
            autoGroupColumnDef: { headerName: 'P' },
        });
        await settle();

        expect(headersHeard).toEqual([
            [
                ['ag-Grid-AutoColumn-a', 'P'],
                ['a', 'A'],
                ['c', 'C'],
            ],
        ]);
        expect(heard).toEqual([
            'showRowGroupColsSetChanged',
            'rowDataUpdateStarted',
            'rowDataUpdated',
            'gridColumnsChanged',
            'modelUpdated',
            'paginationChanged',
            'virtualRowRemoved',
            'virtualRowRemoved',
            'displayedRowsChanged',
            'virtualColumnsChanged',
            'displayedColumnsChanged',
            'columnEverythingChanged',
            'stateUpdated',
        ]);
    });

    test('one update turning on rowSelection and changing groupDisplayType and autoGroupColumnDef raises one displayed columns change, showing the selection column and every auto group column', async () => {
        const api = createGroupedGrid();
        await settle();
        const heard = hear(api, ['displayedColumnsChanged']);

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
        expect(displayedIds(api)).toEqual([
            'ag-Grid-SelectionColumn',
            'ag-Grid-AutoColumn-a',
            'ag-Grid-AutoColumn-b',
            'c',
        ]);
        expect(heard).toEqual(['displayedColumnsChanged']);
    });

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

    test('one update turning on calculatedColumns and changing defaultColDef raises one displayed columns change and one model update, showing the calculated column at the new width', async () => {
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
        const heard = hear(api, ['modelUpdated', 'displayedColumnsChanged']);

        api.updateGridOptions({ calculatedColumns: true, defaultColDef: { width: 170 } });
        await settle();

        expect(displayedIds(api)).toEqual(['a', 'c', 'double']);
        expect(api.getAllDisplayedColumns().map((column) => column.getActualWidth())).toEqual([170, 170, 170]);
        expect(heard.sort()).toEqual(['displayedColumnsChanged', 'modelUpdated']);
    });

    test('one update switching pivot mode on and changing groupDisplayType and autoGroupColumnDef raises one displayed columns change, the pivot mode change before columnEverythingChanged', async () => {
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
        expect(heard).toEqual(['columnPivotModeChanged', 'displayedColumnsChanged', 'columnEverythingChanged']);
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

    test("columnDefs and autoGroupColumnDef in one call apply the auto group column's state with the other columns', before newColumnsLoaded", async () => {
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [
                { field: 'g', rowGroup: true, hide: true },
                { field: 'v', width: 100 },
            ],
            rowData: [
                { g: 'b', v: 1 },
                { g: 'a', v: 2 },
                { g: 'c', v: 3 },
            ],
            autoGroupColumnDef: { headerName: 'G0', width: 150 },
        });
        await settle();
        const columnState = (colId: string) => {
            const column = api.getColumn(colId)!;
            return {
                header: api.getDisplayNameForColumn(column, 'header'),
                width: column.getActualWidth(),
                pinned: column.getPinned(),
            };
        };
        expect([columnState('ag-Grid-AutoColumn'), columnState('v')]).toEqual([
            { header: 'G0', width: 150, pinned: null },
            { header: 'V', width: 100, pinned: null },
        ]);
        const heard: { type: string; ids: string[] }[] = [];
        for (const type of ['columnResized', 'columnPinned', 'newColumnsLoaded'] as const) {
            api.addEventListener(type, (event) => {
                const columns = 'columns' in event ? event.columns : null;
                heard.push({ type, ids: (columns ?? []).map((column) => column.getColId()).sort() });
            });
        }

        api.updateGridOptions({
            columnDefs: [
                { field: 'g', rowGroup: true, hide: true },
                { field: 'v', width: 120, pinned: 'right' },
            ],
            autoGroupColumnDef: { headerName: 'G1', width: 220, pinned: 'left' },
        });
        await settle();

        // One event per type or one per column, and their order before newColumnsLoaded, are open: split and sorted.
        const told = heard.flatMap(({ type, ids }) => (ids.length ? ids.map((id) => `${type}:${id}`) : [type]));
        const loaded = told.indexOf('newColumnsLoaded');
        expect([...told.slice(0, loaded).sort(), ...told.slice(loaded)]).toEqual([
            'columnPinned:ag-Grid-AutoColumn',
            'columnPinned:v',
            'columnResized:ag-Grid-AutoColumn',
            'columnResized:v',
            'newColumnsLoaded',
        ]);
        expect([columnState('ag-Grid-AutoColumn'), columnState('v')]).toEqual([
            { header: 'G1', width: 220, pinned: 'left' },
            { header: 'V', width: 120, pinned: 'right' },
        ]);
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

    const orders = [{ order: 'columnDefs first' as const }, { order: 'rowData first' as const }];

    test.each(orders)(
        'an update adding a column that reads the new rows, $order, refreshes the rows once and never evaluates it on a row without them',
        async (testCase) => {
            const order = testCase.order;
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [{ field: 'name' }],
                rowData: [{ id: 1, name: 'Some name' }],
            });
            await settle();
            const heard = hear(api, ['modelUpdated', 'rowDataUpdated']);
            const withoutNc: string[] = [];
            let evaluations = 0;

            api.updateGridOptions(
                inOrder(
                    order,
                    [
                        { field: 'name' },
                        {
                            colId: 'nc',
                            valueGetter: (params) => {
                                const data = params.data;
                                ++evaluations;
                                if (!data?.nc) {
                                    withoutNc.push(JSON.stringify(data));
                                }
                                return data?.nc?.p;
                            },
                        },
                    ],
                    [{ id: 1, name: 'Some name', nc: { p: 'v' } }]
                )
            );
            await settle();

            expect(evaluations).toBeGreaterThan(0);
            expect({
                withoutNc,
                columns: api.getAllDisplayedColumns().map((column) => column.getColId()),
                nc: cellValues(api, 'nc'),
                // Only how many times each event is heard is fixed, not their order.
                heard: heard.sort(),
            }).toEqual({
                withoutNc: [],
                columns: ['name', 'nc'],
                nc: ['v'],
                heard: ['modelUpdated', 'rowDataUpdated'],
            });
        }
    );

    test.each(orders)(
        'prepending a column while the rows gain a value, $order, never evaluates a column on a value that is not its own',
        async (testCase) => {
            const order = testCase.order;
            const mismatches: string[] = [];
            // Column i of n reads values[n - 1 - i], which a row of n values holds as i: its own index.
            const columnsOf = (n: number): ColDef[] =>
                Array.from({ length: n }, (_, j) => {
                    const i = n - 1 - j;
                    return {
                        colId: String(i),
                        valueGetter: (params) => {
                            const value = params.data?.values[n - 1 - i];
                            if (value !== i) {
                                mismatches.push(`column ${i} defined for ${n} columns read ${value}`);
                            }
                            return value;
                        },
                    };
                });
            const rowsOf = (n: number) =>
                ['a', 'b'].map((id) => ({ id, values: Array.from({ length: n }, (_, k) => n - 1 - k) }));

            const api = gridsManager.createGrid('myGrid', {
                columnDefs: columnsOf(1),
                rowData: rowsOf(1),
                getRowId: (params) => params.data.id,
            });
            await settle();
            const heard = hear(api, ['modelUpdated']);

            for (const n of [2, 3]) {
                heard.length = 0;
                api.updateGridOptions(inOrder(order, columnsOf(n), rowsOf(n)));
                await settle();

                expect({
                    n,
                    mismatches,
                    columns: api.getAllDisplayedColumns().map((column) => column.getColId()),
                    values: api.getAllDisplayedColumns().map((column) => cellValues(api, column.getColId())),
                    heard,
                }).toEqual({
                    n,
                    mismatches: [],
                    columns: Array.from({ length: n }, (_, j) => String(n - 1 - j)),
                    values: Array.from({ length: n }, (_, j) => [n - 1 - j, n - 1 - j]),
                    heard: ['modelUpdated'],
                });
            }
        }
    );

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
        { order: 'columnDefs first' as const, rowIds: 'without getRowId', getRowId: undefined },
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

    const groupedColumns: ColDef[] = [
        { field: 'country', rowGroup: true, hide: true },
        { field: 'sales', aggFunc: 'sum', type: 'num' },
    ];
    const oldRows = [
        { country: 'UK', sales: 1, city: 'London' },
        { country: 'UK', sales: 2, city: 'Leeds' },
        { country: 'DE', sales: 4, city: 'Berlin' },
    ];
    const newRows = [
        { country: 'IE', sales: 5, city: 'Cork' },
        { country: 'FR', sales: 7, city: 'Paris' },
        { country: 'IE', sales: 11, city: 'Dublin' },
    ];

    /** Every displayed row, top to bottom: a group by its key and sum, a leaf by its values. */
    const displayedRows = (api: GridApi) => {
        const rows: unknown[] = [];
        for (let i = 0; i < api.getDisplayedRowCount(); ++i) {
            const node = api.getDisplayedRowAtIndex(i);
            rows.push(
                node?.group
                    ? { group: node.key, sum: node.aggData?.sales }
                    : { country: node?.data.country, sales: node?.data.sales }
            );
        }
        return rows;
    };

    const salesWidth = (api: GridApi) => api.getColumn('sales')?.getActualWidth();
    const displayedIds = (api: GridApi) => api.getAllDisplayedColumns().map((column) => column.getColId());
    const forms: {
        form: string;
        update: GridOptions;
        observed: (api: GridApi) => unknown;
        expectedObserved: unknown;
    }[] = [
        {
            form: 'new columnDefs',
            update: { columnDefs: [...groupedColumns, { field: 'city' }] },
            observed: displayedIds,
            expectedObserved: ['ag-Grid-AutoColumn', 'sales', 'city'],
        },
        {
            form: 'new defaultColDef',
            update: { defaultColDef: { width: 120 } },
            observed: salesWidth,
            expectedObserved: 120,
        },
        {
            form: 'new columnTypes',
            update: { columnTypes: { num: { width: 90 } } },
            observed: salesWidth,
            expectedObserved: 90,
        },
    ];

    test.each(forms)(
        'rowData set with $form groups the new rows as a grid created with them does, with one model update',
        async ({ update, observed, expectedObserved }) => {
            const baseOptions: GridOptions = {
                columnDefs: groupedColumns,
                columnTypes: { num: {} },
                groupDefaultExpanded: -1,
            };

            const reference = gridsManager.createGrid('reference', {
                ...baseOptions,
                ...update,
                rowData: newRows,
            });
            await settle();
            const expectedRows = displayedRows(reference);
            gridsManager.reset();

            const api = gridsManager.createGrid('myGrid', { ...baseOptions, rowData: oldRows });
            await settle();
            const heard = hear(api, ['modelUpdated']);

            api.updateGridOptions({ ...update, rowData: newRows });
            await settle();

            expect({ observed: observed(api), rows: displayedRows(api), heard }).toEqual({
                observed: expectedObserved,
                rows: expectedRows,
                heard: ['modelUpdated'],
            });
            expect(expectedRows).toEqual([
                { group: 'IE', sum: 16 },
                { country: 'IE', sales: 5 },
                { country: 'IE', sales: 11 },
                { group: 'FR', sum: 7 },
                { country: 'FR', sales: 7 },
            ]);
        }
    );

    /** The displayed row ids after filter and sort, in order. */
    const rowIds = (api: GridApi) => {
        const ids: string[] = [];
        api.forEachNodeAfterFilterAndSort((node) => ids.push(node.data.id));
        return ids;
    };

    test('rowData set with columnDefs on a grid that already took rowData shows the new rows, loaded once', async () => {
        const api = gridsManager.createGrid('myGrid', {});
        await settle();
        api.setGridOption('rowData', [{ id: 'a1' }, { id: 'a2' }]);
        await settle();
        const heard = hear(api, ['rowDataUpdated', 'modelUpdated']);
        const readByRowDataUpdated: { count: number; ids: string[] }[] = [];
        api.addEventListener('rowDataUpdated', () =>
            readByRowDataUpdated.push({ count: api.getDisplayedRowCount(), ids: rowIds(api) })
        );

        api.updateGridOptions({
            columnDefs: [{ field: 'id' }],
            rowData: [{ id: 'b1' }, { id: 'b2' }, { id: 'b3' }],
        });
        await settle();

        expect({ heard, readByRowDataUpdated, displayed: rowIds(api) }).toEqual({
            heard: ['rowDataUpdated', 'modelUpdated'],
            readByRowDataUpdated: [{ count: 3, ids: ['b1', 'b2', 'b3'] }],
            displayed: ['b1', 'b2', 'b3'],
        });
    });

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

        const reversed = (a: string, b: string) => b.localeCompare(a);

        const treeColumns = (): ColDef[] => [
            { field: 'a', rowGroup: true, hide: true },
            { field: 'b', rowGroup: true, hide: true },
            { field: 'v' },
        ];
        const treeRows = (changedValue: number) =>
            ['X', 'Y', 'Z'].flatMap((a) =>
                ['p', 'q'].map((b) => ({ id: `${a}-${b}`, a, b, v: a === 'X' && b === 'p' ? changedValue : 1 }))
            );
        const treeOptions = (): GridOptions => ({
            columnDefs: treeColumns(),
            groupDisplayType: 'singleColumn',
            groupDefaultExpanded: -1,
            getRowId: (params) => params.data.id,
        });

        test('rowData and autoGroupColumnDef changed in one call order every level by the new comparator, as a grid created with them', async () => {
            const newAutoColumn = { sort: 'asc' as const, comparator: reversed };
            const reference = gridsManager.createGrid('reference', {
                ...treeOptions(),
                autoGroupColumnDef: newAutoColumn,
                rowData: treeRows(2),
            });
            await settle();
            const expectedTree = displayedTree(reference);
            gridsManager.reset();

            // an immutable update touching one row: every other row keeps its data object
            const rows = treeRows(1);
            const api = gridsManager.createGrid('myGrid', {
                ...treeOptions(),
                autoGroupColumnDef: { sort: 'asc' },
                rowData: rows,
            });
            await settle();
            expect(displayedTree(api)).toEqual([
                '0 X',
                '1 p',
                '2 X-p',
                '1 q',
                '2 X-q',
                '0 Y',
                '1 p',
                '2 Y-p',
                '1 q',
                '2 Y-q',
                '0 Z',
                '1 p',
                '2 Z-p',
                '1 q',
                '2 Z-q',
            ]);

            api.updateGridOptions({
                rowData: rows.map((row) => (row.id === 'X-p' ? { ...row, v: 2 } : row)),
                autoGroupColumnDef: newAutoColumn,
            });
            await settle();

            expect(displayedTree(api)).toEqual(expectedTree);
            expect(expectedTree).toEqual([
                '0 Z',
                '1 q',
                '2 Z-q',
                '1 p',
                '2 Z-p',
                '0 Y',
                '1 q',
                '2 Y-q',
                '1 p',
                '2 Y-p',
                '0 X',
                '1 q',
                '2 X-q',
                '1 p',
                '2 X-p',
            ]);
        });

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

describe('columnDefs given with an option the row grouping reads, in one call', () => {
    const gridsManager = new TestGridsManager({ modules: [AllEnterpriseModule] });

    afterEach(() => {
        gridsManager.reset();
    });

    const settle = async () => {
        await asyncSetTimeout(0);
        await asyncSetTimeout(0);
    };

    /** Each displayed row, top to bottom, as its level and its group key or its row id. */
    const displayedTree = (api: GridApi) => {
        const rows: string[] = [];
        for (let i = 0; i < api.getDisplayedRowCount(); ++i) {
            const node = api.getDisplayedRowAtIndex(i)!;
            rows.push(`${node.level} ${node.group ? node.key : node.data.id}`);
        }
        return rows;
    };

    /** Every row node in grid order, a group by its key and a leaf by its id. */
    const nodeList = (api: GridApi) => {
        const nodes: {
            kind: 'group' | 'leaf';
            key: string | null;
            level: number;
            parentKey: string | null;
            sum?: number;
        }[] = [];
        api.forEachNode((node) => {
            const parent = node.parent;
            nodes.push({
                kind: node.group ? 'group' : 'leaf',
                key: node.group ? node.key : node.data.id,
                level: node.level,
                parentKey: parent && parent.level >= 0 ? parent.key : null,
                ...(node.group ? { sum: node.aggData?.gold } : {}),
            });
        });
        return nodes;
    };

    const byKind = (nodes: ReturnType<typeof nodeList>) =>
        [...nodes].sort((a, b) => `${a.kind} ${a.key}`.localeCompare(`${b.kind} ${b.key}`));

    /** Each displayed row, top to bottom, as its level and its sum of gold. */
    const displayedSums = (api: GridApi) => {
        const rows: { level: number; sum: number | undefined }[] = [];
        for (let i = 0; i < api.getDisplayedRowCount(); ++i) {
            const node = api.getDisplayedRowAtIndex(i)!;
            rows.push({ level: node.level, sum: node.aggData?.gold });
        }
        return rows;
    };

    test.each([{ order: 'columnDefs first' as const }, { order: 'groupAllowUnbalanced first' as const }])(
        'the same columns given again with groupAllowUnbalanced, $order, leave a row with a blank group key at the top level, as a grid created with it',
        async (testCase) => {
            const rowData = [
                { id: '1', sport: 'Golf', gold: 1 },
                { id: '2', sport: 'Tennis', gold: 2 },
                { id: '3', sport: 'Golf', gold: 3 },
                { id: '4', sport: '', gold: 4 },
            ];
            const columns = (): ColDef[] => [
                { field: 'sport', rowGroup: true, hide: true },
                { field: 'gold', aggFunc: 'sum' },
            ];
            const reference = gridsManager.createGrid('reference', {
                columnDefs: columns(),
                rowData,
                groupDefaultExpanded: -1,
                groupAllowUnbalanced: true,
            });
            await settle();
            const expectedNodes = nodeList(reference);
            const expectedDisplayed = displayedTree(reference);
            gridsManager.reset();

            const api = gridsManager.createGrid('myGrid', {
                columnDefs: columns(),
                rowData,
                groupDefaultExpanded: -1,
            });
            await settle();

            api.updateGridOptions(
                testCase.order === 'columnDefs first'
                    ? { columnDefs: columns(), groupAllowUnbalanced: true }
                    : { groupAllowUnbalanced: true, columnDefs: columns() }
            );
            await settle();

            expect({ nodes: nodeList(api), displayed: displayedTree(api) }).toEqual({
                nodes: expectedNodes,
                displayed: expectedDisplayed,
            });
            expect(byKind(nodeList(api))).toEqual([
                { kind: 'group', key: 'Golf', level: 0, parentKey: null, sum: 4 },
                { kind: 'group', key: 'Tennis', level: 0, parentKey: null, sum: 2 },
                { kind: 'leaf', key: '1', level: 1, parentKey: 'Golf' },
                { kind: 'leaf', key: '2', level: 1, parentKey: 'Tennis' },
                { kind: 'leaf', key: '3', level: 1, parentKey: 'Golf' },
                { kind: 'leaf', key: '4', level: 0, parentKey: null },
            ]);
        }
    );

    test('the same columns given again with pivotMode on show one total row, as a grid created in pivot mode', async () => {
        const rowData = [
            { id: '1', sport: 'Golf', gold: 1 },
            { id: '2', sport: 'Tennis', gold: 2 },
            { id: '3', sport: 'Golf', gold: 3 },
            { id: '4', sport: '', gold: 4 },
        ];
        const columns = (): ColDef[] => [{ field: 'sport' }, { field: 'gold', aggFunc: 'sum' }];
        const reference = gridsManager.createGrid('reference', { columnDefs: columns(), rowData, pivotMode: true });
        await settle();
        const expectedDisplayed = displayedSums(reference);
        gridsManager.reset();

        const api = gridsManager.createGrid('myGrid', { columnDefs: columns(), rowData });
        await settle();

        api.updateGridOptions({ columnDefs: columns(), pivotMode: true });
        await settle();

        expect(displayedSums(api)).toEqual(expectedDisplayed);
        expect(expectedDisplayed).toEqual([{ level: -1, sum: 10 }]);
    });

    test('the same columns given again with pivotMode on group a blank key too, as a grid created in pivot mode', async () => {
        const rowData = [
            { id: '1', sport: 'Golf', gold: 1 },
            { id: '2', sport: 'Tennis', gold: 2 },
            { id: '3', sport: 'Golf', gold: 3 },
            { id: '4', sport: '', gold: 4 },
        ];
        const columns = (): ColDef[] => [
            { field: 'sport', rowGroup: true, hide: true },
            { field: 'gold', aggFunc: 'sum' },
        ];
        const reference = gridsManager.createGrid('reference', {
            columnDefs: columns(),
            rowData,
            groupDefaultExpanded: -1,
            groupAllowUnbalanced: true,
            pivotMode: true,
        });
        await settle();
        const expectedNodes = nodeList(reference);
        gridsManager.reset();

        const api = gridsManager.createGrid('myGrid', {
            columnDefs: columns(),
            rowData,
            groupDefaultExpanded: -1,
            groupAllowUnbalanced: true,
        });
        await settle();
        expect(byKind(nodeList(api))).toEqual([
            { kind: 'group', key: 'Golf', level: 0, parentKey: null, sum: 4 },
            { kind: 'group', key: 'Tennis', level: 0, parentKey: null, sum: 2 },
            { kind: 'leaf', key: '1', level: 1, parentKey: 'Golf' },
            { kind: 'leaf', key: '2', level: 1, parentKey: 'Tennis' },
            { kind: 'leaf', key: '3', level: 1, parentKey: 'Golf' },
            { kind: 'leaf', key: '4', level: 0, parentKey: null },
        ]);

        api.updateGridOptions({ columnDefs: columns(), pivotMode: true });
        await settle();

        expect(nodeList(api)).toEqual(expectedNodes);
        expect(byKind(nodeList(api))).toEqual([
            { kind: 'group', key: '', level: 0, parentKey: null, sum: 4 },
            { kind: 'group', key: 'Golf', level: 0, parentKey: null, sum: 4 },
            { kind: 'group', key: 'Tennis', level: 0, parentKey: null, sum: 2 },
            { kind: 'leaf', key: '1', level: 1, parentKey: 'Golf' },
            { kind: 'leaf', key: '2', level: 1, parentKey: 'Tennis' },
            { kind: 'leaf', key: '3', level: 1, parentKey: 'Golf' },
            { kind: 'leaf', key: '4', level: 1, parentKey: '' },
        ]);
    });

    test('the same columns given again with a grand total row do not regroup the rows, and the grand total shows', async () => {
        let keyCreatorCalls = 0;
        const keyCreator = (params: KeyCreatorParams) => {
            ++keyCreatorCalls;
            return String(params.value ?? '');
        };
        const columns = (): ColDef[] => [
            { field: 'sport', rowGroup: true, hide: true, keyCreator },
            { field: 'gold', aggFunc: 'sum' },
        ];
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: columns(),
            rowData: [
                { id: '1', sport: 'Golf', gold: 1 },
                { id: '2', sport: 'Tennis', gold: 2 },
                { id: '3', sport: 'Golf', gold: 3 },
                { id: '4', sport: '', gold: 4 },
            ],
            groupDefaultExpanded: -1,
        });
        await settle();
        keyCreatorCalls = 0;

        api.updateGridOptions({ columnDefs: columns(), grandTotalRow: 'bottom' });
        await settle();

        const grandTotal = api.getRowNode(GRAND_TOTAL_ROW_ID);
        expect({
            keyCreatorCalls,
            grandTotalSum: grandTotal?.aggData?.gold,
            lastDisplayedIsGrandTotal: api.getDisplayedRowAtIndex(api.getDisplayedRowCount() - 1) === grandTotal,
        }).toEqual({ keyCreatorCalls: 0, grandTotalSum: 10, lastDisplayedIsGrandTotal: true });

        api.refreshClientSideRowModel('group');
        await settle();

        expect(keyCreatorCalls).toBe(4);
    });
});

describe('the order of the grid events of one API call', () => {
    const gridsManager = new TestGridsManager({
        modules: [
            ClientSideRowModelModule,
            ColumnApiModule,
            ColumnAutoSizeModule,
            TextFilterModule,
            RowGroupingModule,
            PivotModule,
            RowNumbersModule,
        ],
    });

    afterEach(() => {
        gridsManager.reset();
    });

    const settle = async () => {
        await asyncSetTimeout(0);
        await asyncSetTimeout(0);
    };

    // the events the contract orders
    const ordered = [
        'columnRowGroupChanged',
        'columnPivotChanged',
        'columnValueChanged',
        'columnPivotModeChanged',
        'columnVisible',
        'columnMoved',
        'columnPinned',
        'columnResized',
        'gridColumnsChanged',
        'filterDestroyed',
        'filterChanged',
        'newColumnsLoaded',
        'rowDataUpdated',
        'modelUpdated',
        'columnContainerWidthChanged',
        'displayedColumnsWidthChanged',
        'virtualColumnsChanged',
        'displayedColumnsChanged',
        'columnEverythingChanged',
    ] as const;

    const widthEvents = ['columnContainerWidthChanged', 'displayedColumnsWidthChanged'];

    const rowData = [
        { a: 'x', b: 'b1', c: 'p', d: 1, e: 'e1', f: 'f1', g: 'k1' },
        { a: 'x', b: 'b2', c: 'q', d: 2, e: 'e2', f: 'f2', g: 'k2' },
        { a: 'y', b: 'b3', c: 'p', d: 3, e: 'e3', f: 'f3', g: 'k1' },
    ];

    // Each column is 100 wide, so the width of a section changes exactly when a visible column comes or goes.
    const cols = (...colIds: string[]): ColDef[] => colIds.map((colId) => ({ colId, field: colId }));
    const pivotAndValue: ColDef[] = [
        { colId: 'c', field: 'c', pivot: true },
        { colId: 'd', field: 'd', aggFunc: 'sum' },
    ];

    test('one API call raises its cause events, then the columns change with its filter effects, the new columns loaded, the rows, then the layout events, last columnEverythingChanged when the call raises it', async () => {
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [
                { colId: 'a', field: 'a', filter: 'agTextColumnFilter', filterParams: { debounceMs: 0 } },
                { colId: 'b', field: 'b' },
                ...pivotAndValue,
            ],
            defaultColDef: { width: 100 },
            rowData,
            suppressColumnVirtualisation: false,
        });
        await settle();
        api.setFilterModel({ a: { filterType: 'text', type: 'equals', filter: 'x' } });
        await settle();
        const filteredBefore = api.isColumnFilterPresent();
        const heard: string[] = [];
        const anyEvents: AnyEventApi = api;
        for (const type of ordered) {
            anyEvents.addEventListener(type, () => heard.push(type));
        }
        const centreIds = () => api.getAllDisplayedColumns().map((column) => column.getColId());
        const call = async (action: () => void) => {
            action();
            await settle();
            return heard.splice(0);
        };

        const replacedColumn = await call(() =>
            api.setGridOption('columnDefs', [...cols('b'), ...pivotAndValue, ...cols('e')])
        );
        const filteredAfter = api.isColumnFilterPresent();
        const addedColumn = await call(() =>
            api.setGridOption('columnDefs', [
                ...cols('b'),
                ...pivotAndValue,
                ...cols('e', 'f'),
                { colId: 'g', field: 'g', hide: true },
            ])
        );
        const grouped = await call(() => api.applyColumnState({ state: [{ colId: 'g', rowGroup: true }] }));
        const groupedBy = api.getRowGroupColumns().map((column) => column.getColId());
        const pivotOn = await call(() => api.setGridOption('pivotMode', true));
        const pivoting = { mode: api.isPivotMode(), resultColumns: (api.getPivotResultColumns() ?? []).length > 0 };
        const pivotOff = await call(() => api.setGridOption('pivotMode', false));
        const notPivoting = api.isPivotMode();
        const hidden = await call(() => api.setColumnsVisible(['b'], false));
        const bVisible = api.getColumn('b')!.isVisible();
        const fBeforeC = () => centreIds().indexOf('f') < centreIds().indexOf('c');
        const fBeforeCBefore = fBeforeC();
        const moved = await call(() => api.moveColumns(['f'], 0));

        expect({
            premises: {
                filteredBefore,
                filteredAfter,
                groupedBy,
                pivoting,
                notPivoting,
                bVisible,
                fBeforeCBefore,
                fBeforeCAfter: fBeforeC(),
            },
            replacedColumn,
            addedColumn,
            grouped,
            pivotOn,
            pivotOff,
            hidden,
            moved,
        }).toEqual({
            premises: {
                filteredBefore: true,
                filteredAfter: false,
                groupedBy: ['g'],
                pivoting: { mode: true, resultColumns: true },
                notPivoting: false,
                bVisible: false,
                fBeforeCBefore: false,
                fBeforeCAfter: true,
            },
            // a column with an active filter leaves and another of the same width arrives: no width event
            replacedColumn: [
                'gridColumnsChanged',
                'filterDestroyed',
                'filterChanged',
                'newColumnsLoaded',
                'modelUpdated',
                'virtualColumnsChanged',
                'displayedColumnsChanged',
                'columnEverythingChanged',
            ],
            addedColumn: [
                'gridColumnsChanged',
                'newColumnsLoaded',
                'modelUpdated',
                ...widthEvents,
                'virtualColumnsChanged',
                'displayedColumnsChanged',
                'columnEverythingChanged',
            ],
            grouped: [
                'columnRowGroupChanged',
                'gridColumnsChanged',
                'modelUpdated',
                ...widthEvents,
                'virtualColumnsChanged',
                'displayedColumnsChanged',
                'columnEverythingChanged',
            ],
            pivotOn: [
                'columnPivotModeChanged',
                'gridColumnsChanged',
                'modelUpdated',
                ...widthEvents,
                'virtualColumnsChanged',
                'displayedColumnsChanged',
            ],
            pivotOff: [
                'columnPivotModeChanged',
                'gridColumnsChanged',
                'modelUpdated',
                ...widthEvents,
                'virtualColumnsChanged',
                'displayedColumnsChanged',
            ],
            hidden: [
                'columnVisible',
                ...widthEvents,
                'virtualColumnsChanged',
                'displayedColumnsChanged',
                'columnEverythingChanged',
            ],
            moved: ['columnMoved', 'virtualColumnsChanged', 'displayedColumnsChanged'],
        });
    });

    test('a column listener grouping by another column raises the events of its change after the events of the call that hid its column, columnEverythingChanged closing each', async () => {
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: cols('a', 'b', 'c'),
            defaultColDef: { width: 100 },
            rowData,
            suppressColumnVirtualisation: false,
        });
        await settle();
        const heard: string[] = [];
        const anyEvents: AnyEventApi = api;
        for (const type of ordered) {
            anyEvents.addEventListener(type, () => heard.push(type));
        }
        let listenerCalls = 0;
        api.getColumn('a')!.addEventListener('visibleChanged', () => {
            ++listenerCalls;
            api.applyColumnState({ state: [{ colId: 'b', rowGroup: true }] });
        });

        api.setColumnsVisible(['a'], false);
        await settle();

        expect({
            premises: {
                listenerCalls,
                aVisible: api.getColumn('a')!.isVisible(),
                groupedBy: api.getRowGroupColumns().map((column) => column.getColId()),
            },
            heard,
        }).toEqual({
            premises: { listenerCalls: 1, aVisible: false, groupedBy: ['b'] },
            heard: [
                // the call's own events
                'columnVisible',
                ...widthEvents,
                'virtualColumnsChanged',
                'displayedColumnsChanged',
                'columnEverythingChanged',
                // the events of the listener's change
                'columnRowGroupChanged',
                'gridColumnsChanged',
                'modelUpdated',
                ...widthEvents,
                'virtualColumnsChanged',
                'displayedColumnsChanged',
                'columnEverythingChanged',
            ],
        });
    });

    test('a column listener turning on rowNumbers raises the events of its change after the events of the call that hid its column, and the next call raises only its own', async () => {
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: cols('a', 'b', 'c'),
            defaultColDef: { width: 100 },
            rowData,
            suppressColumnVirtualisation: false,
        });
        await settle();
        const heard: string[] = [];
        const anyEvents: AnyEventApi = api;
        for (const type of ordered) {
            anyEvents.addEventListener(type, () => heard.push(type));
        }
        let listenerCalls = 0;
        api.getColumn('a')!.addEventListener('visibleChanged', () => {
            ++listenerCalls;
            api.setGridOption('rowNumbers', true);
        });
        const call = async (action: () => void) => {
            action();
            await settle();
            return heard.splice(0);
        };

        const first = await call(() => api.setColumnsVisible(['a'], false));
        const premises = {
            listenerCalls,
            rowNumbersColumn: api.getColumn('ag-Grid-RowNumbersColumn') != null,
            aVisible: api.getColumn('a')!.isVisible(),
        };
        const second = await call(() => api.setColumnsVisible(['c'], false));

        expect({ premises, first, second, listenerCallsAfter: listenerCalls }).toEqual({
            premises: { listenerCalls: 1, rowNumbersColumn: true, aVisible: false },
            first: [
                // the call's own events
                'columnVisible',
                ...widthEvents,
                'virtualColumnsChanged',
                'displayedColumnsChanged',
                'columnEverythingChanged',
                // the events of the listener's change; turning on row numbers raises no columnEverythingChanged
                'gridColumnsChanged',
                ...widthEvents,
                'virtualColumnsChanged',
                'displayedColumnsChanged',
            ],
            second: [
                'columnVisible',
                ...widthEvents,
                'virtualColumnsChanged',
                'displayedColumnsChanged',
                'columnEverythingChanged',
            ],
            listenerCallsAfter: 1,
        });
    });

    test('one update giving columnDefs with pivot mode on raises gridColumnsChanged at the build, then with the pivot result columns its rows build, whatever the key order', async () => {
        const columnDefs: ColDef[] = [
            { colId: 'a', field: 'a', rowGroup: true },
            { colId: 'b', field: 'b' },
            { colId: 'c', field: 'c', pivot: true },
            { colId: 'd', field: 'd', aggFunc: 'sum' },
        ];
        const newColumnDefs = [...columnDefs, ...cols('e')];
        const run = async (initial: GridOptions, change: GridOptions) => {
            const api = gridsManager.createGrid('myGrid', { rowData, ...initial });
            await settle();
            const heard: string[] = [];
            for (const type of ['gridColumnsChanged', 'newColumnsLoaded', 'modelUpdated'] as const) {
                api.addEventListener(type, () => heard.push(type));
            }
            api.updateGridOptions(change);
            await settle();
            const premises = {
                pivotMode: api.isPivotMode(),
                pivotResultColumns: (api.getPivotResultColumns() ?? []).length > 0,
                eExists: api.getColumn('e') != null,
            };
            gridsManager.reset();
            return { premises, heard };
        };

        const pivotModeFirst = await run({ columnDefs }, { pivotMode: true, columnDefs: newColumnDefs });
        const columnDefsFirst = await run({ columnDefs }, { columnDefs: newColumnDefs, pivotMode: true });
        const noColumnsPivotModeFirst = await run({}, { pivotMode: true, columnDefs: newColumnDefs });
        const noColumnsColumnDefsFirst = await run({}, { columnDefs: newColumnDefs, pivotMode: true });

        const expected = {
            premises: { pivotMode: true, pivotResultColumns: true, eExists: true },
            heard: ['gridColumnsChanged', 'newColumnsLoaded', 'gridColumnsChanged', 'modelUpdated'],
        };
        expect({ pivotModeFirst, columnDefsFirst, noColumnsPivotModeFirst, noColumnsColumnDefsFirst }).toEqual({
            pivotModeFirst: expected,
            columnDefsFirst: expected,
            noColumnsPivotModeFirst: expected,
            noColumnsColumnDefsFirst: expected,
        });
    });

    describe('a client-side pivot grid', () => {
        const pivotGrids = new TestGridsManager({
            modules: [
                ClientSideRowModelModule,
                ColumnApiModule,
                RowGroupingModule,
                PivotModule,
                RowNumbersModule,
                SetFilterModule,
                TextFilterModule,
            ],
        });

        afterEach(() => {
            pivotGrids.reset();
        });

        const pivotColumnDefs: ColDef[] = [
            { colId: 'a', field: 'a', rowGroup: true },
            { colId: 'b', field: 'b', filter: 'agSetColumnFilter' },
            { colId: 'c', field: 'c', pivot: true },
            { colId: 'd', field: 'd', aggFunc: 'sum' },
        ];
        const pivotRows = [
            { id: '1', a: 'x', b: 'b1', c: 'p', d: 1 },
            { id: '2', a: 'x', b: 'b2', c: 'q', d: 2 },
            { id: '3', a: 'y', b: 'b3', c: 'p', d: 3 },
        ];
        // b1 leaves, so the set filter refreshes after the data; a new pivot key arrives under b2
        const moreRows = [...pivotRows.slice(1), { id: '4', a: 'y', b: 'b2', c: 'r', d: 4 }];
        const pivotKeys = (api: GridApi) => api.getPivotResultColumns()!.map((column) => column.getColDef().pivotKeys!);

        test.each<[string, GridOptions, boolean, boolean]>([
            ['defaultColDef', { rowData: moreRows, defaultColDef: { width: 123 } }, false, true],
            ['rowNumbers', { rowData: moreRows, rowNumbers: true }, false, false],
            ['keyed rowNumbers', { rowData: moreRows, rowNumbers: true }, true, false],
        ])(
            'a client-side pivot grid with an active set filter given rowData and a column option in one call raises gridColumnsChanged once, before modelUpdated (%s)',
            async (_name, options, keyed, raisesNewColumnsLoaded) => {
                const api = pivotGrids.createGrid('myGrid', {
                    columnDefs: pivotColumnDefs,
                    rowData: pivotRows,
                    pivotMode: true,
                    ...(keyed ? { getRowId: (params: GetRowIdParams) => params.data.id } : {}),
                });
                await settle();
                api.setFilterModel({ b: { filterType: 'set', values: ['b1', 'b2'] } });
                await settle();
                expect(pivotKeys(api)).toEqual([['p'], ['q']]);

                const types = [
                    'newColumnsLoaded',
                    'rowDataUpdated',
                    'filterChanged',
                    'gridColumnsChanged',
                    'modelUpdated',
                ] as const;
                const heard: string[] = [];
                for (const type of types) {
                    api.addEventListener(type, () => heard.push(type));
                }
                api.updateGridOptions(options);
                await waitFor(() => expect(heard).toContain('modelUpdated'), { timeout: 1000 });
                await settle();

                expect(heard).toEqual([
                    ...(raisesNewColumnsLoaded ? ['newColumnsLoaded'] : []),
                    'rowDataUpdated',
                    'filterChanged',
                    'gridColumnsChanged',
                    'modelUpdated',
                ]);
                expect(pivotKeys(api)).toEqual([['q'], ['r']]);
            }
        );

        test.each<[string, ColDef[], object[] | undefined, string[]]>([
            [
                'rowData',
                pivotColumnDefs,
                pivotRows,
                ['gridColumnsChanged', 'newColumnsLoaded', 'rowDataUpdated', 'gridColumnsChanged', 'modelUpdated'],
            ],
            ['no rowData', pivotColumnDefs, undefined, ['gridColumnsChanged', 'newColumnsLoaded']],
            [
                'no pivot columns',
                pivotColumnDefs.map((colDef) => ({ ...colDef, pivot: false })),
                pivotRows,
                ['gridColumnsChanged', 'newColumnsLoaded', 'rowDataUpdated', 'modelUpdated'],
            ],
        ])(
            "a client-side pivot grid's creation raises gridColumnsChanged before newColumnsLoaded, and again only when its rows build pivot result columns (%s)",
            async (_name, columnDefs, rowData, expected) => {
                const heard: string[] = [];
                pivotGrids.createGrid('myGrid', {
                    columnDefs,
                    ...(rowData ? { rowData } : {}),
                    pivotMode: true,
                    onGridColumnsChanged: () => heard.push('gridColumnsChanged'),
                    onNewColumnsLoaded: () => heard.push('newColumnsLoaded'),
                    onRowDataUpdated: () => heard.push('rowDataUpdated'),
                    onModelUpdated: () => heard.push('modelUpdated'),
                });
                const last = expected[expected.length - 1];
                await waitFor(() => expect(heard).toContain(last), { timeout: 1000 });
                await settle();

                expect(heard).toEqual(expected);
            }
        );

        test('a grid created in pivot mode without columns, then given columnDefs and no rowData, raises gridColumnsChanged once, before newColumnsLoaded', async () => {
            const heard: string[] = [];
            const api = pivotGrids.createGrid('myGrid', {
                pivotMode: true,
                onGridColumnsChanged: () => heard.push('gridColumnsChanged'),
                onNewColumnsLoaded: () => heard.push('newColumnsLoaded'),
            });
            await settle();
            heard.length = 0;

            api.setGridOption('columnDefs', pivotColumnDefs);
            await waitFor(() => expect(heard).toContain('newColumnsLoaded'), { timeout: 1000 });
            await settle();

            expect(heard).toEqual(['gridColumnsChanged', 'newColumnsLoaded']);
        });

        test.each<{ name: string; ungroup: (api: GridApi) => void }>([
            {
                name: 'applyColumnState',
                ungroup: (api) => api.applyColumnState({ state: [{ colId: 'a', rowGroup: false }] }),
            },
            { name: 'removeRowGroupColumns', ungroup: (api) => api.removeRowGroupColumns(['a']) },
        ])(
            'a client-side pivot grid ungrouped while its auto group column is filtered drops that filter before its one rows refresh ($name)',
            async (row) => {
                const api = pivotGrids.createGrid('myGrid', {
                    columnDefs: [
                        { colId: 'a', field: 'a', rowGroup: true },
                        { colId: 'b', field: 'b' },
                        { colId: 'c', field: 'c', pivot: true },
                        { colId: 'd', field: 'd', aggFunc: 'sum' },
                    ],
                    rowData: pivotRows,
                    pivotMode: true,
                    autoGroupColumnDef: {
                        filter: 'agTextColumnFilter',
                        filterValueGetter: (params) => params.data?.a,
                    },
                });
                await settle();
                api.setFilterModel({ 'ag-Grid-AutoColumn': { filterType: 'text', type: 'equals', filter: 'x' } });
                await settle();
                const leavesPassingFilter = () => {
                    let count = 0;
                    api.forEachNodeAfterFilter((node) => {
                        if (!node.group) {
                            ++count;
                        }
                    });
                    return count;
                };
                expect(leavesPassingFilter()).toBe(2);

                const heard: string[] = [];
                for (const type of [
                    'columnRowGroupChanged',
                    'filterChanged',
                    'gridColumnsChanged',
                    'modelUpdated',
                ] as const) {
                    api.addEventListener(type, () => heard.push(type));
                }
                row.ungroup(api);
                await waitFor(() => expect(heard).toContain('modelUpdated'), { timeout: 1000 });
                await settle();

                expect(heard).toEqual(['columnRowGroupChanged', 'filterChanged', 'gridColumnsChanged', 'modelUpdated']);
                expect(api.getFilterModel()).toEqual({});
                expect(leavesPassingFilter()).toBe(3);
            }
        );
    });

    describe('a settle pass', () => {
        const settleGrids = new TestGridsManager({
            modules: [ClientSideRowModelModule, ColumnApiModule, RowNumbersModule, SetFilterModule],
        });

        afterEach(() => {
            settleGrids.reset();
        });

        test('a grid outside pivot mode with an active set filter given rowData and rowNumbers in one call raises gridColumnsChanged before the filterChanged of its rows', async () => {
            const rows = [
                { id: '1', a: 'x', b: 'b1', c: 'p', d: 1 },
                { id: '2', a: 'x', b: 'b2', c: 'q', d: 2 },
                { id: '3', a: 'y', b: 'b3', c: 'p', d: 3 },
            ];
            const api = settleGrids.createGrid('myGrid', {
                columnDefs: [
                    { colId: 'a', field: 'a' },
                    { colId: 'b', field: 'b', filter: 'agSetColumnFilter' },
                    { colId: 'c', field: 'c' },
                    { colId: 'd', field: 'd' },
                ],
                rowData: rows,
            });
            await settle();
            api.setFilterModel({ b: { filterType: 'set', values: ['b1', 'b2'] } });
            await settle();
            expect(api.getDisplayedRowCount()).toBe(2);

            const heard: string[] = [];
            for (const type of ['rowDataUpdated', 'gridColumnsChanged', 'filterChanged', 'modelUpdated'] as const) {
                api.addEventListener(type, () => heard.push(type));
            }
            api.updateGridOptions({
                rowData: [...rows.slice(1), { id: '4', a: 'y', b: 'b2', c: 'r', d: 4 }],
                rowNumbers: true,
            });
            await waitFor(() => expect(heard).toContain('modelUpdated'), { timeout: 1000 });
            await settle();

            expect(heard).toEqual(['rowDataUpdated', 'gridColumnsChanged', 'filterChanged', 'modelUpdated']);
        });
    });

    describe('a server-side pivot grid', () => {
        const serverGrids = new TestGridsManager({
            modules: [ServerSideRowModelModule, ColumnApiModule, RowGroupingModule, PivotModule],
        });

        afterEach(() => {
            serverGrids.reset();
        });

        test.each<[string, ColumnState, string[]]>([
            [
                'group b',
                { colId: 'b', rowGroup: true },
                [
                    'columnRowGroupChanged',
                    'gridColumnsChanged',
                    'modelUpdated',
                    'columnMoved',
                    'gridColumnsChanged',
                    'modelUpdated',
                ],
            ],
            [
                'ungroup a',
                { colId: 'a', rowGroup: false },
                [
                    'columnRowGroupChanged',
                    'gridColumnsChanged',
                    'gridColumnsChanged',
                    'modelUpdated',
                    'gridColumnsChanged',
                    'modelUpdated',
                ],
            ],
        ])(
            'a server-side pivot grid regrouped by applyColumnState raises gridColumnsChanged before the modelUpdated of its reset (%s)',
            async (_name, state, expected) => {
                const api = serverGrids.createGrid('myGrid', {
                    columnDefs: [
                        { colId: 'a', field: 'a', rowGroup: true },
                        { colId: 'b', field: 'b' },
                        { colId: 'c', field: 'c', pivot: true },
                        { colId: 'd', field: 'd', aggFunc: 'sum' },
                    ],
                    pivotMode: true,
                    rowModelType: 'serverSide',
                    serverSideDatasource: {
                        getRows: (params) =>
                            setTimeout(
                                () =>
                                    params.success({
                                        rowData: [{ a: 'x' }, { a: 'y' }],
                                        pivotResultFields: ['p_d', 'q_d'],
                                    }),
                                0
                            ),
                    },
                });
                await waitFor(() => expect(api.getPivotResultColumns()?.length).toBe(2), { timeout: 1000 });
                await settle();

                const heard: string[] = [];
                for (const type of [
                    'columnRowGroupChanged',
                    'gridColumnsChanged',
                    'modelUpdated',
                    'columnMoved',
                ] as const) {
                    api.addEventListener(type, () => heard.push(type));
                }
                api.applyColumnState({ state: [state] });
                await waitFor(
                    () => expect(heard.lastIndexOf('modelUpdated')).toBeGreaterThan(heard.indexOf('modelUpdated')),
                    {
                        timeout: 1000,
                    }
                );
                await settle();

                expect(heard).toEqual(expected);
            }
        );
    });

    test('one update dropping a filtered column refreshes the rows once, unfiltered, whatever pivot mode does: turning it on or keeping it on the filter leaves first, turning it off the columns change is told first', async () => {
        const columnDefs: ColDef[] = [
            { colId: 'a', field: 'a', filter: 'agTextColumnFilter', filterParams: { debounceMs: 0 } },
            { colId: 'b', field: 'b', rowGroup: true },
            { colId: 'c', field: 'c', pivot: true },
            { colId: 'd', field: 'd', aggFunc: 'sum' },
        ];
        const run = async (pivotModeBefore: boolean, pivotModeAfter: boolean) => {
            const api = gridsManager.createGrid('myGrid', { columnDefs, rowData, pivotMode: pivotModeBefore });
            await settle();
            api.setFilterModel({ a: { filterType: 'text', type: 'equals', filter: 'y' } });
            await settle();
            const filteredBefore = api.isColumnFilterPresent();
            const heard: string[] = [];
            for (const type of ['gridColumnsChanged', 'filterChanged', 'newColumnsLoaded', 'modelUpdated'] as const) {
                api.addEventListener(type, () => heard.push(type));
            }
            api.updateGridOptions(
                pivotModeAfter === pivotModeBefore
                    ? { columnDefs: columnDefs.slice(1) }
                    : { pivotMode: pivotModeAfter, columnDefs: columnDefs.slice(1) }
            );
            await settle();
            let leavesPassingFilter = 0;
            api.forEachNodeAfterFilter((node) => {
                if (!node.group) {
                    ++leavesPassingFilter;
                }
            });
            const premises = {
                filteredBefore,
                filterModel: api.getFilterModel(),
                pivotMode: api.isPivotMode(),
                leavesPassingFilter,
            };
            gridsManager.reset();
            return { premises, heard };
        };

        const turnedOn = await run(false, true);
        const turnedOff = await run(true, false);
        const keptOn = await run(true, true);

        expect({ turnedOn, turnedOff, keptOn }).toEqual({
            turnedOn: {
                premises: { filteredBefore: true, filterModel: {}, pivotMode: true, leavesPassingFilter: 3 },
                heard: [
                    'gridColumnsChanged',
                    'filterChanged',
                    'newColumnsLoaded',
                    'gridColumnsChanged',
                    'modelUpdated',
                ],
            },
            turnedOff: {
                premises: { filteredBefore: true, filterModel: {}, pivotMode: false, leavesPassingFilter: 3 },
                heard: ['gridColumnsChanged', 'filterChanged', 'newColumnsLoaded', 'modelUpdated'],
            },
            // the pivot result columns follow every row once the filter is destroyed
            keptOn: {
                premises: { filteredBefore: true, filterModel: {}, pivotMode: true, leavesPassingFilter: 3 },
                heard: ['filterChanged', 'newColumnsLoaded', 'gridColumnsChanged', 'modelUpdated'],
            },
        });
    });

    describe('with a horizontal scrollbar that comes and goes', () => {
        const scrollbarWidth = 15;
        const layoutEvents = [
            'columnContainerWidthChanged',
            'displayedColumnsWidthChanged',
            'virtualColumnsChanged',
            'scrollVisibilityChanged',
            'columnResized',
        ];
        let originalGridWidth: number;
        let originalNativeScrollbarWidth: number;

        beforeAll(() => {
            originalGridWidth = mockGridLayout.gridWidth;
            originalNativeScrollbarWidth = mockGridLayout.nativeScrollbarWidth;
            mockGridLayout.gridWidth = 600;
            mockGridLayout.useRealOffsetDimensions = true;
            mockGridLayout.nativeScrollbarWidth = scrollbarWidth;
        });

        afterAll(() => {
            mockGridLayout.gridWidth = originalGridWidth;
            mockGridLayout.useRealOffsetDimensions = false;
            mockGridLayout.nativeScrollbarWidth = originalNativeScrollbarWidth;
        });

        test('a width change outside any other column change raises the width, rendered columns and scrollbar events, then columnResized, once each', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: cols('a', 'b', 'c', 'd', 'e', 'f'),
                defaultColDef: { width: 90 },
                rowData,
                scrollbarWidth,
                suppressColumnVirtualisation: false,
            });
            await settle();
            const heard: string[] = [];
            api.addGlobalListener((type) => {
                if (layoutEvents.includes(type)) {
                    heard.push(type);
                }
            });
            const gridElement = getGridElement(api)!;
            const horizontalScrollbar = () =>
                gridElement.querySelector<HTMLElement>('.ag-body-horizontal-scroll')!.style.height;
            const renderedColumns = () =>
                Array.from(gridElement.querySelectorAll('.ag-header-cell'), (cell) => cell.getAttribute('col-id'));
            const call = async (action: () => void) => {
                const before = { horizontalScrollbar: horizontalScrollbar(), renderedColumns: renderedColumns() };
                action();
                await settle();
                // a scrollbar shows 100 ms after the call
                await vi.advanceTimersByTimeAsync(100);
                return {
                    before,
                    after: { horizontalScrollbar: horizontalScrollbar(), renderedColumns: renderedColumns() },
                    events: heard.splice(0),
                };
            };
            await waitFor(() => expect(horizontalScrollbar()).toBe('0px'));
            const initial = { horizontalScrollbar: horizontalScrollbar(), renderedColumns: renderedColumns() };
            const shown = `${scrollbarWidth}px`;

            vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
            onTestFinished(() => {
                vi.useRealTimers();
            });
            // 6 x 90 = 540px fits the 600px viewport; a first column of 2000px overflows it, the rest far out of view
            const widened = await call(() => api.setColumnWidths([{ key: 'a', newWidth: 2000 }]));
            const fitted = await call(() => api.sizeColumnsToFit({ defaultMinWidth: 20 }));
            const widenedAgain = await call(() => api.setColumnWidths([{ key: 'a', newWidth: 2000 }]));
            const narrowed = await call(() => api.setColumnWidths([{ key: 'a', newWidth: 90 }]));

            const events = [
                'columnContainerWidthChanged',
                'displayedColumnsWidthChanged',
                'virtualColumnsChanged',
                'scrollVisibilityChanged',
                'columnResized',
            ];
            const all = ['a', 'b', 'c', 'd', 'e', 'f'];
            const out = { horizontalScrollbar: '0px', renderedColumns: all };
            const overflowing = { horizontalScrollbar: shown, renderedColumns: ['a'] };
            expect({ initial, widened, fitted, widenedAgain, narrowed }).toEqual({
                initial: out,
                widened: { before: out, after: overflowing, events },
                fitted: { before: overflowing, after: out, events },
                widenedAgain: { before: out, after: overflowing, events },
                narrowed: { before: overflowing, after: out, events },
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
