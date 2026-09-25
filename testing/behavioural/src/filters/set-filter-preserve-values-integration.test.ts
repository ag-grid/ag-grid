import { waitFor } from '@testing-library/dom';
import { AgChartsEnterpriseModule } from 'ag-charts-enterprise';
import {
    ColumnFilterHarness,
    TestGridsManager,
    asyncSetTimeout,
    canvasPolyfill,
    installFilterLayoutMock,
    uninstallFilterLayoutMock,
} from 'ag-test-utils';

import type {
    ColDef,
    GridApi,
    GridOptions,
    IFilterComp,
    ISetFilterParams,
    KeyCreatorParams,
    SetFilterHandler,
} from 'ag-grid-community';
import {
    AgPromise,
    ClientSideRowModelModule,
    CustomFilterModule,
    GridStateModule,
    TextFilterModule,
    setupAgTestIds,
} from 'ag-grid-community';
import {
    AdvancedFilterModule,
    ColumnMenuModule,
    FiltersToolPanelModule,
    IntegratedChartsModule,
    MultiFilterModule,
    NewFiltersToolPanelModule,
    PivotModule,
    RowGroupingModule,
    ServerSideRowModelModule,
    SetFilterModule,
    TreeDataModule,
} from 'ag-grid-enterprise';

import { FILTERS_SIDEBAR, openFiltersPanel } from './filter-behaviour/toolPanelHarness';

interface Row {
    id: string;
    value: string | null;
}

/** `preservePreviousValues` through the surfaces that host or wrap a Set Filter, and the params it composes with. */
describe('Set Filter preservePreviousValues - integration', () => {
    const gridsManager = new TestGridsManager({
        modules: [
            ClientSideRowModelModule,
            CustomFilterModule,
            SetFilterModule,
            TextFilterModule,
            MultiFilterModule,
            FiltersToolPanelModule,
            ColumnMenuModule,
            TreeDataModule,
            RowGroupingModule,
            NewFiltersToolPanelModule,
            ServerSideRowModelModule,
            GridStateModule,
            AdvancedFilterModule,
            PivotModule,
        ],
    });

    beforeAll(() => {
        setupAgTestIds();
        installFilterLayoutMock();
    });
    afterAll(() => uninstallFilterLayoutMock());
    afterEach(() => {
        gridsManager.reset();
        vi.restoreAllMocks();
    });

    let nextId = 0;
    const rows = (...values: (string | null)[]): Row[] => values.map((value) => ({ id: String(nextId++), value }));

    function createGrid(rowData: Row[], colDef: ColDef<Row>, options: GridOptions<Row> = {}): GridApi<Row> {
        return gridsManager.createGrid<Row>('grid', {
            columnDefs: [{ field: 'value', ...colDef }],
            getRowId: ({ data }) => data.id,
            rowData,
            ...options,
        });
    }
    const setFilter = (filterParams: ISetFilterParams = {}): ColDef<Row> => ({
        filter: 'agSetColumnFilter',
        filterParams: { preservePreviousValues: true, ...filterParams },
    });

    const handlerOf = (api: GridApi<Row>) => api.getColumnFilterHandler('value') as SetFilterHandler;
    const modelOf = (api: GridApi<Row>) => api.getColumnFilterModel<any>('value');
    const shown = (api: GridApi<Row>) => {
        const values: (string | null)[] = [];
        api.forEachNodeAfterFilter((node) => values.push(node.data!.value));
        return values;
    };
    const setRowData = async (api: GridApi<Row>, rowData: Row[]) => {
        api.setGridOption('rowData', rowData);
        await asyncSetTimeout(0);
    };
    const setModel = async (api: GridApi<Row>, colId: string, model: any) => {
        void api.setColumnFilterModel(colId, model);
        api.onFilterChanged();
        await asyncSetTimeout(0);
    };
    const popup = () => document.querySelector<HTMLElement>('.ag-filter-menu')!;
    const missingLabels = (root: ParentNode) =>
        Array.from(root.querySelectorAll<HTMLElement>('.ag-set-filter-item-missing')).map((item) =>
            item.querySelector('.ag-checkbox-label')?.textContent?.trim()
        );

    describe('created up front, so a value leaving before the filter is first used is retained', () => {
        // Asking for the handler creates it if missing, which would only see the data after 'C' left.
        const expectCRetained = async (api: GridApi<Row>) => {
            await setRowData(api, rows('A', 'B'));
            expect(handlerOf(api).getFilterKeys().sort()).toEqual(['A', 'B', 'C']);
        };

        test('at grid start', async () => {
            const api = createGrid(rows('A', 'B', 'C'), setFilter());
            await asyncSetTimeout(0);
            await expectCRetained(api);
        });

        test('when a column definition update turns the option on', async () => {
            const api = createGrid(rows('A', 'B', 'C'), { filter: 'agSetColumnFilter' });
            await asyncSetTimeout(0);
            api.setGridOption('columnDefs', [{ field: 'value', ...setFilter() }]);
            await asyncSetTimeout(0);
            await expectCRetained(api);
        });

        test('when the Advanced Filter is turned off', async () => {
            const api = createGrid(rows('A', 'B', 'C'), setFilter(), { enableAdvancedFilter: true });
            await asyncSetTimeout(0);
            api.setGridOption('enableAdvancedFilter', false);
            await asyncSetTimeout(0);
            await expectCRetained(api);
        });

        test('for a primary column while pivoting', async () => {
            const api = gridsManager.createGrid<Row>('grid', {
                columnDefs: [
                    { field: 'value', ...setFilter() },
                    { field: 'id', pivot: true },
                    { colId: 'count', valueGetter: () => 1, aggFunc: 'sum' },
                ],
                getRowId: ({ data }) => data.id,
                rowData: rows('A', 'B', 'C'),
                pivotMode: true,
            });
            await asyncSetTimeout(0);
            await expectCRetained(api);
        });

        test('for a selectable filter whose default params ask for it', async () => {
            const api = createGrid(
                rows('A', 'B', 'C'),
                {
                    filter: 'agSelectableColumnFilter',
                    filterParams: { defaultFilterParams: { preservePreviousValues: true }, defaultFilterIndex: 1 },
                },
                { enableFilterHandlers: true, sideBar: 'filters-new' }
            );
            await asyncSetTimeout(0);
            await expectCRetained(api);
        });

        test('after cellDataType inference, so rows arriving after grid start are keyed by their data type', async () => {
            const api = gridsManager.createGrid<any>('dates', {
                columnDefs: [{ field: 'd', ...setFilter() }],
                getRowId: ({ data }) => data.id,
            });
            await asyncSetTimeout(0);
            const jan1 = { id: '1', d: new Date(2024, 0, 1) };
            api.setGridOption('rowData', [jan1, { id: '2', d: new Date(2024, 0, 2) }]);
            await asyncSetTimeout(0);
            api.setGridOption('rowData', [jan1]);
            await asyncSetTimeout(0);

            const handler = api.getColumnFilterHandler('d') as SetFilterHandler;
            expect(handler.getFilterKeys()).toEqual(['2024-01-01', '2024-01-02']);
            void api.setColumnFilterModel('d', { filterType: 'set', values: ['2024-01-01'] });
            api.onFilterChanged();
            await asyncSetTimeout(0);
            expect(api.getDisplayedRowCount()).toBe(1);
        });

        test('for a column recreated while the filter it replaces is still loading', async () => {
            let finishLoading!: () => void;
            class LoadingFilter implements IFilterComp {
                private readonly eGui = document.createElement('div');
                public init(): AgPromise<void> {
                    return new AgPromise((resolve) => {
                        finishLoading = resolve;
                    });
                }
                public getGui(): HTMLElement {
                    return this.eGui;
                }
                public isFilterActive(): boolean {
                    return false;
                }
                public doesFilterPass(): boolean {
                    return true;
                }
                public getModel(): null {
                    return null;
                }
                public setModel(): void {}
            }
            const rowData = (...athletes: string[]) => athletes.map((athlete) => ({ id: athlete, athlete }));
            const autoGroupColumnDef = (filter: ColDef['filter'], filterParams?: ISetFilterParams): ColDef => ({
                field: 'athlete',
                filter,
                filterParams,
            });
            const api = gridsManager.createGrid('recreated', {
                columnDefs: [{ field: 'athlete', rowGroup: true, hide: true }],
                autoGroupColumnDef: autoGroupColumnDef(LoadingFilter),
                getRowId: ({ data }) => data.id,
                rowData: rowData('x', 'y'),
            });
            await asyncSetTimeout(0);
            void api.getColumnFilterInstance('ag-Grid-AutoColumn');
            await asyncSetTimeout(0);

            // Removed, then recreated under the same colId.
            api.setRowGroupColumns([]);
            api.setGridOption('autoGroupColumnDef', autoGroupColumnDef('agSetColumnFilter', setFilter().filterParams));
            api.setRowGroupColumns(['athlete']);
            await asyncSetTimeout(0);
            finishLoading();
            await asyncSetTimeout(0);
            api.setGridOption('rowData', rowData('x'));
            await asyncSetTimeout(0);
            const handler = api.getColumnFilterHandler('ag-Grid-AutoColumn') as SetFilterHandler;
            expect(handler.getFilterKeys().sort()).toEqual(['x', 'y']);
        });
    });

    describe('Multi Filter', () => {
        const multiFilter: ColDef<Row> = {
            filter: 'agMultiColumnFilter',
            filterParams: {
                filters: [
                    { filter: 'agTextColumnFilter' },
                    { filter: 'agSetColumnFilter', filterParams: { preservePreviousValues: true } },
                ],
            },
        };

        test('a Set Filter child keeps the state of values that leave and return', async () => {
            const api = createGrid(rows('A', 'B', 'C'), multiFilter);
            await asyncSetTimeout(0);
            await setModel(api, 'value', {
                filterType: 'multi',
                filterModels: [null, { filterType: 'set', values: ['A', 'C'] }],
            });

            await setRowData(api, rows('A', 'B'));
            expect(modelOf(api)?.filterModels[1].values).toEqual(['A', 'C']);
            await setRowData(api, rows('A', 'B', 'C'));
            expect(shown(api)).toEqual(['A', 'C']);
        });

        test('a Set Filter child is created up front, so it retains values that leave before first use', async () => {
            const api = createGrid(rows('A', 'B', 'C'), multiFilter);
            await asyncSetTimeout(0);
            await setRowData(api, rows('A', 'B'));

            await ColumnFilterHarness.open(api, 'value');
            await waitFor(() => expect(missingLabels(popup())).toEqual(['C']));
        });
    });

    test('the Filters Tool Panel lists retained values after the current ones, muted', async () => {
        const api = createGrid(rows('A', 'B', 'C'), setFilter(), { sideBar: FILTERS_SIDEBAR });
        await asyncSetTimeout(0);
        await setModel(api, 'value', { filterType: 'set', values: ['A'] });
        await setRowData(api, rows('B', 'C'));

        const panel = await openFiltersPanel(api);
        await panel.expandGroup('Value');
        await waitFor(() => expect(panel.setFilterItemLabels('Value')).toEqual(['(Select All)', 'B', 'C', 'A']));
        expect(missingLabels(document.querySelector('.ag-filter-toolpanel')!)).toEqual(['A']);
    });

    test('the new Filters Tool Panel summary counts selected values no longer in the data', async () => {
        const api = createGrid(rows('A', 'B', 'C'), setFilter(), {
            enableFilterHandlers: true,
            sideBar: 'filters-new',
            initialState: {
                sideBar: {
                    visible: true,
                    position: 'right',
                    openToolPanel: 'filters-new',
                    toolPanels: { 'filters-new': { filters: [{ colId: 'value', expanded: false }] } },
                },
            },
        });
        await asyncSetTimeout(0);
        await setModel(api, 'value', { filterType: 'set', values: ['A', 'B'] });
        await setRowData(api, rows('A', 'C'));

        await waitFor(() => expect(document.querySelector('.ag-filter-card-summary')?.textContent).toBe('is (A, B)'));
    });

    test('the Server-Side Row Model keeps a provided value dropped from the list', async () => {
        const api = gridsManager.createGrid('ssrm', {
            columnDefs: [{ field: 'value', ...setFilter({ values: ['A', 'B', 'C'] }) }],
            rowModelType: 'serverSide',
            serverSideDatasource: { getRows: (params) => params.success({ rowData: [], rowCount: 0 }) },
        });
        await asyncSetTimeout(0);
        await setModel(api as GridApi<Row>, 'value', { filterType: 'set', values: ['C'] });

        const handler = api.getColumnFilterHandler('value') as SetFilterHandler;
        handler.setFilterValues(['A', 'B']);
        await asyncSetTimeout(0);
        expect(handler.getFilterKeys().sort()).toEqual(['A', 'B', 'C']);
        expect(api.getColumnFilterModel<any>('value')?.values).toEqual(['C']);
    });

    test('a value hidden only by another column filter is not kept, as it is still in the data', async () => {
        const api = gridsManager.createGrid('pair', {
            columnDefs: [
                { field: 'value', filter: 'agSetColumnFilter', filterParams: { preservePreviousValues: true } },
                { field: 'other', filter: 'agSetColumnFilter' },
            ],
            getRowId: ({ data }) => data.id,
            rowData: [
                { id: '1', value: 'A', other: 'x' },
                { id: '2', value: 'B', other: 'y' },
            ],
        });
        await asyncSetTimeout(0);
        void api.setColumnFilterModel('other', { filterType: 'set', values: ['x'] });
        api.onFilterChanged();
        await asyncSetTimeout(0);
        // Values are only reconciled on a data change, so one follows the other column's filter.
        api.applyTransaction({ update: [{ id: '1', value: 'A', other: 'x' }] });
        await asyncSetTimeout(0);

        const filter = await ColumnFilterHarness.open(api, 'value');
        await waitFor(() => expect(filter.setFilterItemLabels()).toEqual(['(Select All)', 'A']));
        expect(missingLabels(popup())).toEqual([]);
    });

    test('with filter handlers enabled, a checked value survives its rows leaving', async () => {
        const api = createGrid(rows('A', 'B', 'C'), setFilter(), { enableFilterHandlers: true });
        await asyncSetTimeout(0);
        await setModel(api, 'value', { filterType: 'set', values: ['B'] });

        await setRowData(api, rows('A', 'C'));
        expect(modelOf(api)?.values).toEqual(['B']);
        await setRowData(api, rows('A', 'B', 'C'));
        expect(shown(api)).toEqual(['B']);
    });

    test('suppressSorting lists values in first-seen order, retained ones after', async () => {
        const api = createGrid(rows('C', 'A', 'B'), setFilter({ suppressSorting: true }));
        await asyncSetTimeout(0);
        await setModel(api, 'value', { filterType: 'set', values: ['C', 'A'] });
        await setRowData(api, rows('B', 'D'));

        const filter = await ColumnFilterHarness.open(api, 'value');
        expect(filter.setFilterItemLabels()).toEqual(['(Select All)', 'B', 'D', 'C', 'A']);
    });

    test('refreshValuesOnOpen keeps a value the callback stops returning', async () => {
        let source = ['A', 'B', 'C'];
        const values = vi.fn((params) => params.success(source));
        const api = createGrid(rows('A', 'B', 'C'), setFilter({ values, refreshValuesOnOpen: true }));
        await waitFor(() => expect(values).toHaveBeenCalledTimes(1));
        await setModel(api, 'value', { filterType: 'set', values: ['C'] });

        source = ['A', 'B'];
        const filter = await ColumnFilterHarness.open(api, 'value');
        await waitFor(() => expect(values).toHaveBeenCalledTimes(2));
        await waitFor(() => expect(filter.setFilterItemLabels()).toEqual(['(Select All)', 'A', 'B', 'C']));
        expect(missingLabels(popup())).toEqual(['C']);
        expect(modelOf(api)?.values).toEqual(['C']);
    });

    test('destroyFilter discards retained values, and the new filter retains from the start', async () => {
        const api = createGrid(rows('A', 'B', 'C'), setFilter());
        await asyncSetTimeout(0);
        await setModel(api, 'value', { filterType: 'set', values: ['A', 'B'] });
        await setRowData(api, rows('A'));

        api.destroyFilter('value');
        await asyncSetTimeout(0);
        expect(modelOf(api)).toBeNull();

        // Recreated up front, so 'D' leaving before the filter is used again is retained; 'B' and 'C' are gone.
        await setRowData(api, rows('A', 'D'));
        await setRowData(api, rows('A'));
        const filter = await ColumnFilterHarness.open(api, 'value');
        expect(filter.setFilterItemLabels()).toEqual(['(Select All)', 'A', 'D']);
        expect(missingLabels(popup())).toEqual(['D']);
    });

    test('changing caseSensitive discards retained values, as their keys fold differently', async () => {
        const colDef = (caseSensitive: boolean): ColDef<Row> => ({
            field: 'value',
            ...setFilter({ caseSensitive }),
        });
        const api = createGrid(rows('apple', 'pear'), colDef(false));
        await asyncSetTimeout(0);
        await setModel(api, 'value', { filterType: 'set', values: ['pear'] });
        await setRowData(api, rows('pear'));
        expect(handlerOf(api).getFilterKeys().sort()).toEqual(['apple', 'pear']);

        api.setGridOption('columnDefs', [colDef(true)]);
        await asyncSetTimeout(0);
        expect(handlerOf(api).getFilterKeys()).toEqual(['pear']);
        expect(modelOf(api)?.values).toEqual(['pear']);

        // A selected value out of the data names the same rows under either rule, so it stays.
        await setModel(api, 'value', { filterType: 'set', values: ['pear', 'fig'] });
        api.setGridOption('columnDefs', [colDef(false)]);
        await asyncSetTimeout(0);
        expect(modelOf(api)?.values).toEqual(['pear', 'fig']);
        await setRowData(api, rows('fig', 'pear'));
        expect(shown(api)).toEqual(['fig', 'pear']);
        api.setGridOption('columnDefs', [colDef(true)]);
        await asyncSetTimeout(0);

        // Keys that only differed by case fold into one, as without the option.
        await setRowData(api, rows('apple', 'APPLE', 'pear'));
        api.setGridOption('columnDefs', [colDef(false)]);
        await setRowData(api, rows('apple', 'APPLE', 'pear'));
        // 'fig' is still selected, so it stays once its rows leave.
        expect(handlerOf(api).getFilterKeys().sort()).toEqual(['apple', 'fig', 'pear']);
    });

    test('a case sensitive filter keeps its retained values when its model is set', async () => {
        const api = createGrid(rows('A', 'B'), setFilter({ caseSensitive: true }));
        await asyncSetTimeout(0);
        await setRowData(api, rows('A'));
        await setModel(api, 'value', { filterType: 'set', values: ['A'] });
        expect(handlerOf(api).getFilterKeys().sort()).toEqual(['A', 'B']);
    });

    test('turning the option on with a caseSensitive change starts from keys folded by the new rule', async () => {
        const api = createGrid(rows('apple', 'APPLE'), {
            filter: 'agSetColumnFilter',
            filterParams: { caseSensitive: true },
        });
        await asyncSetTimeout(0);
        expect(handlerOf(api).getFilterKeys().sort()).toEqual(['APPLE', 'apple']);

        api.setGridOption('columnDefs', [{ field: 'value', ...setFilter({ caseSensitive: false }) }]);
        await asyncSetTimeout(0);
        await setRowData(api, rows('pear'));
        expect(handlerOf(api).getFilterKeys()).toHaveLength(2);
    });

    test('changing the row group columns discards keys made from the old grouping', async () => {
        const api = gridsManager.createGrid('grouping', {
            columnDefs: [
                { field: 'country', rowGroup: true, hide: true },
                { field: 'city', hide: true },
                { field: 'athlete' },
            ],
            autoGroupColumnDef: {
                field: 'athlete',
                filter: 'agSetColumnFilter',
                filterParams: {
                    preservePreviousValues: true,
                    treeList: true,
                    keyCreator: (params: KeyCreatorParams) => params.value.join('#'),
                },
            },
            getDataPath: (data) => ['T', data.athlete],
            getRowId: ({ data }) => data.id,
            rowData: [
                { id: '1', country: 'A', city: 'a1', athlete: 'x' },
                { id: '2', country: 'B', city: 'b1', athlete: 'y' },
            ],
        });
        await asyncSetTimeout(0);
        await setModel(api, 'ag-Grid-AutoColumn', { filterType: 'set', values: ['A#x'] });
        const handler = api.getColumnFilterHandler('ag-Grid-AutoColumn') as SetFilterHandler;
        expect(handler.getFilterKeys().sort()).toEqual(['A#x', 'B#y']);

        api.setRowGroupColumns(['country', 'city']);
        await asyncSetTimeout(0);
        expect(handler.getFilterKeys().sort()).toEqual(['A#a1#x', 'B#b1#y']);
        expect(api.getColumnFilterModel<any>('ag-Grid-AutoColumn')?.values).toEqual([]);

        api.setGridOption('rowData', [{ id: '1', country: 'A', city: 'a1', athlete: 'x' }]);
        await asyncSetTimeout(0);
        expect(handler.getFilterKeys().sort()).toEqual(['A#a1#x', 'B#b1#y']);

        // Tree data paths replace the grouping ones on the same column.
        api.setGridOption('treeData', true);
        await asyncSetTimeout(0);
        expect(handler.getFilterKeys()).toEqual(['T#x']);
    });

    test('without the option, a row group change leaves the model and the rows it passes as they were', async () => {
        const api = gridsManager.createGrid('grouping-off', {
            columnDefs: [
                { field: 'country', rowGroup: true, hide: true },
                { field: 'city', hide: true },
                { field: 'athlete' },
            ],
            autoGroupColumnDef: {
                field: 'athlete',
                filter: 'agSetColumnFilter',
                filterParams: {
                    excelMode: 'windows',
                    treeList: true,
                    keyCreator: (params: KeyCreatorParams) => params.value.join('#'),
                },
            },
            groupDefaultExpanded: -1,
            getRowId: ({ data }) => data.id,
            rowData: [
                { id: '1', country: 'A', city: 'a1', athlete: 'x' },
                { id: '2', country: 'B', city: 'b1', athlete: 'y' },
            ],
        });
        await asyncSetTimeout(0);
        await setModel(api, 'ag-Grid-AutoColumn', { filterType: 'set', values: ['A#x'] });
        const leaves = () => {
            const shownLeaves: string[] = [];
            api.forEachNodeAfterFilter((node) => {
                if (!node.group) {
                    shownLeaves.push(node.data.athlete);
                }
            });
            return shownLeaves;
        };
        expect(leaves()).toEqual(['x']);

        api.setRowGroupColumns(['country', 'city']);
        await asyncSetTimeout(0);
        expect(api.getColumnFilterModel<any>('ag-Grid-AutoColumn')?.values).toEqual(['A#x']);
        expect(leaves()).toEqual([]);
    });

    test('toggling groupAllowUnbalanced discards keys made with the other path rule', async () => {
        const api = gridsManager.createGrid('unbalanced', {
            columnDefs: [{ field: 'country', rowGroup: true, hide: true }, { field: 'athlete' }],
            autoGroupColumnDef: {
                field: 'athlete',
                filter: 'agSetColumnFilter',
                filterParams: {
                    preservePreviousValues: true,
                    treeList: true,
                    keyCreator: (params: KeyCreatorParams) => params.value.join('#'),
                },
            },
            getRowId: ({ data }) => data.id,
            rowData: [
                { id: '1', country: 'A', athlete: 'x' },
                { id: '2', country: null, athlete: 'z' },
            ],
        });
        await asyncSetTimeout(0);
        const handler = api.getColumnFilterHandler('ag-Grid-AutoColumn') as SetFilterHandler;
        expect(handler.getFilterKeys().sort()).toEqual(['#z', 'A#x']);

        api.setGridOption('groupAllowUnbalanced', true);
        await asyncSetTimeout(0);
        expect(handler.getFilterKeys().sort()).toEqual(['A#x', 'z']);
    });

    const groupedAthletes = (filterParams: ISetFilterParams<any, string[]>, options: GridOptions = {}): GridApi =>
        gridsManager.createGrid('grouped', {
            columnDefs: [
                { field: 'country', rowGroup: true, hide: true },
                { field: 'city', hide: true },
                { field: 'athlete' },
            ],
            autoGroupColumnDef: {
                field: 'athlete',
                filter: 'agSetColumnFilter',
                filterParams: {
                    preservePreviousValues: true,
                    treeList: true,
                    keyCreator: (params: KeyCreatorParams) => params.value.join('#'),
                    ...filterParams,
                },
            },
            getRowId: ({ data }) => data.id,
            rowData: [
                { id: '1', country: 'A', city: 'a1', athlete: 'x' },
                { id: '2', country: 'B', city: 'b1', athlete: 'y' },
            ],
            ...options,
        });
    const autoModelOf = (api: GridApi) => api.getColumnFilterModel<any>('ag-Grid-AutoColumn')?.values;

    test('provided values are keyed by the values alone, so a grouping change keeps the model', async () => {
        const api = groupedAthletes({ values: [['A', 'x']] });
        await asyncSetTimeout(0);
        await setModel(api as GridApi<Row>, 'ag-Grid-AutoColumn', { filterType: 'set', values: ['A#x', 'Z#z'] });
        expect(autoModelOf(api)).toEqual(['A#x', 'Z#z']);

        api.setRowGroupColumns(['country', 'city']);
        await asyncSetTimeout(0);
        expect(autoModelOf(api)).toEqual(['A#x', 'Z#z']);
    });

    test('a model set while a grouping rekey waits for the first rows does not bring stale keys back', async () => {
        // No inference, which would queue the models until the rows arrive.
        const api = groupedAthletes({}, { rowData: undefined, defaultColDef: { cellDataType: false } });
        await asyncSetTimeout(0);
        void api.setColumnFilterModel('ag-Grid-AutoColumn', { filterType: 'set', values: ['A#x'] });
        api.setRowGroupColumns(['country', 'city']);
        void api.setColumnFilterModel('ag-Grid-AutoColumn', { filterType: 'set', values: ['A#x'] });
        await asyncSetTimeout(0);

        api.setGridOption('rowData', [{ id: '1', country: 'A', city: 'a1', athlete: 'x' }]);
        await asyncSetTimeout(0);
        const handler = api.getColumnFilterHandler('ag-Grid-AutoColumn') as SetFilterHandler;
        expect(handler.getFilterKeys()).toEqual(['A#a1#x']);
        expect(autoModelOf(api)).toEqual([]);
    });

    test('tree data turning on makes keys from tree paths only', async () => {
        const keyCreator = vi.fn((params: KeyCreatorParams) => params.value.join('#'));
        const api = groupedAthletes({ keyCreator }, { getDataPath: (data) => ['T', data.athlete] });
        await asyncSetTimeout(0);

        keyCreator.mockClear();
        api.setGridOption('treeData', true);
        await asyncSetTimeout(0);
        const paths = keyCreator.mock.calls.map(([params]) => params.value.join('#'));
        expect(new Set(paths)).toEqual(new Set(['T#x', 'T#y']));
    });

    test('a column definition update changing the values and the key rules loads the values once', async () => {
        const values = vi.fn((params) => params.success(['apple', 'pear']));
        const colDef = (filterParams: ISetFilterParams): ColDef<Row> => ({
            field: 'value',
            ...setFilter({ values: (params) => values(params), ...filterParams }),
        });
        const api = createGrid(rows('apple', 'pear'), colDef({}));
        await waitFor(() => expect(values).toHaveBeenCalledTimes(1));

        api.setGridOption('columnDefs', [colDef({ caseSensitive: true })]);
        await waitFor(() => expect(values).toHaveBeenCalledTimes(2));
        await asyncSetTimeout(0);
        expect(values).toHaveBeenCalledTimes(2);

        api.setGridOption('columnDefs', [colDef({ caseSensitive: true, preservePreviousValues: false })]);
        await waitFor(() => expect(values).toHaveBeenCalledTimes(3));
        await asyncSetTimeout(0);
        expect(values).toHaveBeenCalledTimes(3);
    });

    test('keys that fold into one are kept once when caseSensitive is turned off', async () => {
        const colDef = (caseSensitive: boolean): ColDef<Row> => ({ field: 'value', ...setFilter({ caseSensitive }) });
        const api = createGrid(rows('pear', 'Pear', 'fig'), colDef(true));
        await asyncSetTimeout(0);
        await setModel(api, 'value', { filterType: 'set', values: ['pear', 'Pear'] });

        api.setGridOption('columnDefs', [colDef(false)]);
        await asyncSetTimeout(0);
        expect(modelOf(api)?.values).toEqual(['pear']);
        expect(shown(api)).toEqual(['pear', 'Pear']);
    });

    test('tree data: a retained path stays in its group, and a model key never seen is a root leaf', async () => {
        const api = gridsManager.createGrid('tree', {
            columnDefs: [],
            autoGroupColumnDef: {
                filter: 'agSetColumnFilter',
                filterParams: {
                    preservePreviousValues: true,
                    treeList: true,
                    keyCreator: (params: KeyCreatorParams) => params.value.join('/'),
                },
            },
            treeData: true,
            getDataPath: (data) => data.path,
            getRowId: ({ data }) => data.path.join('/'),
            rowData: [{ path: ['A', 'a1'] }, { path: ['B', 'b1'] }],
        });
        await asyncSetTimeout(0);
        await setModel(api, 'ag-Grid-AutoColumn', { filterType: 'set', values: ['A/a1', 'B/b1', 'X/x1'] });
        api.setGridOption('rowData', [{ path: ['A', 'a1'] }]);
        await asyncSetTimeout(0);

        const handler = api.getColumnFilterHandler('ag-Grid-AutoColumn') as SetFilterHandler;
        expect(handler.getFilterKeys().sort()).toEqual(['A/a1', 'B/b1', 'X/x1']);

        await ColumnFilterHarness.open(api, 'ag-Grid-AutoColumn');
        // The (Select All) row's icon expands every group.
        popup().querySelector<HTMLElement>('.ag-set-filter-group-closed-icon')!.click();
        await asyncSetTimeout(0);
        const labels = Array.from(popup().querySelectorAll<HTMLElement>('.ag-set-filter-item')).map((item) =>
            item.querySelector('.ag-checkbox-label')?.textContent?.trim()
        );
        expect(labels).toEqual(['(Select All)', 'A', 'a1', 'B', 'b1', 'X/x1']);
        expect(missingLabels(popup())).toEqual(['B', 'b1', 'X/x1']);
    });
});

describe('Set Filter preservePreviousValues - chart cross-filtering', () => {
    const gridsManager = new TestGridsManager({
        modules: [
            ClientSideRowModelModule,
            SetFilterModule,
            RowGroupingModule,
            IntegratedChartsModule.with(AgChartsEnterpriseModule),
        ],
    });

    beforeAll(async () => {
        setupAgTestIds();
        await canvasPolyfill.init();
    });
    afterAll(() => canvasPolyfill.reset());
    afterEach(() => gridsManager.reset());

    test('adding a value with ctrl+click keeps selected values no longer in the data', async () => {
        const api = await gridsManager.createGridAndWait<{ id: string; country: string; gold: number }>('grid', {
            columnDefs: [
                { field: 'country', filter: 'agSetColumnFilter', filterParams: { preservePreviousValues: true } },
                { field: 'gold' },
            ],
            getRowId: ({ data }) => data.id,
            rowData: [
                { id: '1', country: 'A', gold: 1 },
                { id: '2', country: 'B', gold: 2 },
                { id: '3', country: 'C', gold: 3 },
            ],
        });
        const chartRef = api.createCrossFilterChart({
            cellRange: { columns: ['country', 'gold'] },
            chartType: 'column',
            aggFunc: 'sum',
        })!;
        await chartRef.chart.waitForUpdate();

        void api.setColumnFilterModel('country', { filterType: 'set', values: ['A', 'B'] });
        api.onFilterChanged();
        api.applyTransaction({ remove: [{ id: '2', country: 'B', gold: 2 }] });
        await asyncSetTimeout(0);
        expect(api.getColumnFilterModel<any>('country')?.values).toEqual(['A', 'B']);

        // The grid's own cross-filter listener, reached through the chart's public options.
        const [series] = (chartRef.chart.getOptions() as any).series;
        series.listeners.seriesNodeClick({ xKey: 'country', datum: { country: 'C' }, event: { ctrlKey: true } });
        await waitFor(() => expect(api.getColumnFilterModel<any>('country')?.values).toEqual(['A', 'B', 'C']));
    });
});
