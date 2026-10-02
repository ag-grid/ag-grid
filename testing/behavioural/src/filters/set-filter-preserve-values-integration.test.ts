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
    IFilterParams,
    IMultiFilter,
    ISetFilterParams,
    KeyCreatorParams,
    MultiFilterHandler,
    SetFilterHandler,
    SetFilterUi,
    SetFilterValuesFuncParams,
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

        test('from filterParams given as a function, handed the params its filter is created with', async () => {
            const api = createGrid(rows('A', 'B', 'C'), {
                filter: 'agSetColumnFilter',
                filterParams: (params: IFilterParams) => ({
                    preservePreviousValues: params.rowModel.getType() === 'clientSide',
                }),
            });
            await asyncSetTimeout(0);
            await expectCRetained(api);
        });

        test('not for a column that cannot be filtered, whose filterParams function is never called', async () => {
            const filterParams = vi.fn(() => ({ preservePreviousValues: true }));
            const api = createGrid(rows('A', 'B', 'C'), { filter: false, filterParams });
            await asyncSetTimeout(0);
            api.setGridOption('columnDefs', [{ field: 'value', filter: false, filterParams }]);
            await asyncSetTimeout(0);
            expect(filterParams).not.toHaveBeenCalled();
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

        test('by the column filter alone once the Advanced Filter, which made its own, is turned off', async () => {
            const createCounted = (id: string, enableAdvancedFilter: boolean) => {
                const reads = { count: 0 };
                const initial = rows('A', 'B', 'C');
                const api = gridsManager.createGrid<Row>(id, {
                    columnDefs: [
                        {
                            field: 'value',
                            ...setFilter(),
                            valueGetter: ({ data }) => {
                                ++reads.count;
                                return data!.value;
                            },
                        },
                    ],
                    getRowId: ({ data }) => data.id,
                    rowData: initial,
                    enableAdvancedFilter,
                });
                const update = async () => {
                    reads.count = 0;
                    api.applyTransaction({ update: [{ ...initial[0], value: 'A2' }] });
                    await asyncSetTimeout(0);
                    return reads.count;
                };
                return { api, update };
            };
            const turnedOff = createCounted('turnedOff', true);
            await asyncSetTimeout(0);
            turnedOff.api.setGridOption('enableAdvancedFilter', false);
            await asyncSetTimeout(0);
            const never = createCounted('never', false);
            await asyncSetTimeout(0);

            expect(await turnedOff.update()).toBe(await never.update());
            // the column filter was reading, as it kept 'A', which left before it was asked for
            expect(handlerOf(turnedOff.api).getFilterKeys()).toContain('A');
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

        test("but not for the pivot result columns that copy a value column's params", async () => {
            const values = vi.fn((params: SetFilterValuesFuncParams<Row, string>) => params.success(['1']));
            const api = gridsManager.createGrid<Row>('grid', {
                columnDefs: [
                    { field: 'value', pivot: true },
                    { colId: 'count', valueGetter: () => 1, aggFunc: 'sum', ...setFilter({ values }) },
                ],
                getRowId: ({ data }) => data.id,
                rowData: rows('A', 'B', 'C', 'D'),
                pivotMode: true,
            });
            await waitFor(() => expect(api.getPivotResultColumns()?.length).toBeGreaterThan(0));
            await asyncSetTimeout(0);
            expect(values).toHaveBeenCalledTimes(1);
        });

        test('loading its values once at grid start, as a filter created after it would', async () => {
            const createCounted = (id: string, colDef: ColDef<Row>) => {
                const reads = { count: 0 };
                const api = gridsManager.createGrid<Row>(id, {
                    columnDefs: [
                        {
                            field: 'value',
                            valueGetter: ({ data }) => {
                                ++reads.count;
                                return data!.value;
                            },
                            ...colDef,
                        },
                    ],
                    getRowId: ({ data }) => data.id,
                    rowData: rows('A', 'B', 'C'),
                });
                return { api, reads };
            };
            const upFront = createCounted('upFront', setFilter());
            await asyncSetTimeout(0);
            const later = createCounted('later', { filter: 'agSetColumnFilter' });
            await asyncSetTimeout(0);
            later.api.getColumnFilterHandler('value');
            await asyncSetTimeout(0);

            expect(upFront.reads.count).toBe(later.reads.count);
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

            // Recreated under the same colId, so the removed filter's late load must not reach the new one.
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

        test('clearPreservedValues reaches a Set Filter child, with or without filter handlers', async () => {
            const expectCleared = async (api: GridApi<Row>, child: SetFilterHandler) => {
                await setRowData(api, rows('A', 'B'));
                expect(child.getFilterKeys().sort()).toEqual(['A', 'B', 'C']);
                api.doFilterAction({ colId: 'value', action: 'clearPreservedValues' });
                await asyncSetTimeout(0);
                expect(child.getFilterKeys().sort()).toEqual(['A', 'B']);
            };

            const api = createGrid(rows('A', 'B', 'C'), multiFilter);
            await asyncSetTimeout(0);
            const multi = (await api.getColumnFilterInstance<IMultiFilter>('value'))!;
            await expectCleared(api, multi.getChildFilterInstance<SetFilterUi>(1)!.getFilterHandler());

            const withHandlers = gridsManager.createGrid<Row>('handlers', {
                columnDefs: [{ field: 'value', ...multiFilter }],
                getRowId: ({ data }) => data.id,
                rowData: rows('A', 'B', 'C'),
                enableFilterHandlers: true,
            });
            await asyncSetTimeout(0);
            const handler = withHandlers.getColumnFilterHandler('value') as MultiFilterHandler;
            await expectCleared(withHandlers, handler.getHandler<SetFilterHandler>(1)!);
        });

        test('a Set Filter child is created up front, so it retains values that leave before first use, from params as objects or functions', async () => {
            const fromFunctions: ColDef<Row> = {
                filter: 'agMultiColumnFilter',
                filterParams: () => ({
                    filters: [
                        { filter: 'agTextColumnFilter' },
                        { filter: 'agSetColumnFilter', filterParams: () => ({ preservePreviousValues: true }) },
                    ],
                }),
            };
            for (const colDef of [multiFilter, fromFunctions]) {
                const api = createGrid(rows('A', 'B', 'C'), colDef);
                await asyncSetTimeout(0);
                await setRowData(api, rows('A', 'B'));

                await ColumnFilterHarness.open(api, 'value');
                await waitFor(() => expect(missingLabels(popup())).toEqual(['C']));
                gridsManager.reset();
            }
        });
    });

    test('clearPreservedValues clears a column, a list of columns or every column, without filter handlers', async () => {
        const fields = ['a', 'b', 'c'];
        const api = gridsManager.createGrid('columns', {
            columnDefs: fields.map((field) => ({ field, ...setFilter() })),
            rowData: [
                { a: 'A1', b: 'B1', c: 'C1' },
                { a: 'A2', b: 'B2', c: 'C2' },
            ],
        });
        await asyncSetTimeout(0);
        api.setGridOption('rowData', [{ a: 'A1', b: 'B1', c: 'C1' }]);
        await asyncSetTimeout(0);
        const keyCounts = async () => {
            await asyncSetTimeout(0);
            return fields.map(
                (colId) => (api.getColumnFilterHandler(colId) as SetFilterHandler).getFilterKeys().length
            );
        };
        expect(await keyCounts()).toEqual([2, 2, 2]);

        api.doFilterAction({ colId: 'a', action: 'clearPreservedValues' });
        expect(await keyCounts()).toEqual([1, 2, 2]);
        api.doFilterAction({ colId: ['b'], action: 'clearPreservedValues' });
        expect(await keyCounts()).toEqual([1, 1, 2]);
        api.doFilterAction({ action: 'clearPreservedValues' });
        expect(await keyCounts()).toEqual([1, 1, 1]);
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

    test('a values callback answering after destroyFilter does not reach the filter created in its place', async () => {
        const pending: ((values: string[]) => void)[] = [];
        const values = (params: SetFilterValuesFuncParams<Row, string>) => pending.push(params.success);
        const api = createGrid(rows('A'), setFilter({ values }));
        await waitFor(() => expect(pending).toHaveLength(1));

        api.destroyFilter('value');
        await waitFor(() => expect(pending).toHaveLength(2));
        pending[1](['New']);
        pending[0](['Old']);
        await asyncSetTimeout(0);
        expect(handlerOf(api).getFilterKeys()).toEqual(['New']);
    });

    test('changing caseSensitive discards retained values, with the filter when one is applied', async () => {
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
        expect(modelOf(api)).toBeNull();
        expect(handlerOf(api).getFilterKeys()).toEqual(['pear']);

        // Without a model the filter is kept, and its values reload without the retained ones.
        await setRowData(api, rows('pear', 'fig'));
        await setRowData(api, rows('pear'));
        expect(handlerOf(api).getFilterKeys().sort()).toEqual(['fig', 'pear']);
        api.setGridOption('columnDefs', [colDef(false)]);
        await asyncSetTimeout(0);
        expect(handlerOf(api).getFilterKeys()).toEqual(['pear']);
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
        expect(handlerOf(api).getFilterKeys().sort()).toEqual(['apple', 'pear']);
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

    test('without the option, a row group change keeps the model, which then matches no rows', async () => {
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

    test('a row group change before the option is turned on does not later drop a model key never seen', async () => {
        const autoGroupColumnDef = (filterParams: ISetFilterParams<any, string[]>): ColDef => ({
            field: 'athlete',
            filter: 'agSetColumnFilter',
            filterParams: {
                treeList: true,
                keyCreator: (params: KeyCreatorParams) => params.value.join('#'),
                ...filterParams,
            },
        });
        const api = gridsManager.createGrid('grouping-turned-on', {
            columnDefs: [
                { field: 'country', rowGroup: true, hide: true },
                { field: 'city', hide: true },
                { field: 'athlete' },
            ],
            autoGroupColumnDef: autoGroupColumnDef({}),
            getRowId: ({ data }) => data.id,
            rowData: [{ id: '1', country: 'A', city: 'a1', athlete: 'x' }],
        });
        await asyncSetTimeout(0);
        const handler = api.getColumnFilterHandler('ag-Grid-AutoColumn') as SetFilterHandler;
        api.setRowGroupColumns(['country', 'city']);
        await asyncSetTimeout(0);
        // The update regroups the rows after the refresh turns the option on, so the reshape is taken then.
        api.setGridOption('autoGroupColumnDef', autoGroupColumnDef({ preservePreviousValues: true }));
        await asyncSetTimeout(0);
        expect(api.getColumnFilterHandler('ag-Grid-AutoColumn')).toBe(handler);

        await setModel(api, 'ag-Grid-AutoColumn', { filterType: 'set', values: ['A#a1#x', 'Q#q1#q'] });
        api.setGridOption('rowData', [{ id: '1', country: 'A', city: 'a1', athlete: 'x' }]);
        await asyncSetTimeout(0);
        expect(api.getColumnFilterModel<any>('ag-Grid-AutoColumn')?.values).toEqual(['A#a1#x', 'Q#q1#q']);
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

    test('a key rule change reloads unchanged values once, and not while the first load is pending', async () => {
        const pending: ((values: string[]) => void)[] = [];
        const values = vi.fn((params: SetFilterValuesFuncParams) => pending.push(params.success));
        const colDef = (caseSensitive: boolean): ColDef<Row> => ({
            field: 'value',
            ...setFilter({ values, caseSensitive }),
        });
        const api = createGrid(rows('apple', 'pear'), colDef(false));
        await waitFor(() => expect(values).toHaveBeenCalledTimes(1));

        // the pending load reads by the new rules when it resolves
        api.setGridOption('columnDefs', [colDef(true)]);
        pending[0](['apple', 'fig']);
        await asyncSetTimeout(0);
        expect(values).toHaveBeenCalledTimes(1);

        api.setGridOption('columnDefs', [colDef(false)]);
        await waitFor(() => expect(values).toHaveBeenCalledTimes(2));
        pending[1](['apple', 'pear']);
        await asyncSetTimeout(0);
        expect(values).toHaveBeenCalledTimes(2);
        expect(handlerOf(api).getFilterKeys()).toEqual(['apple', 'pear']);
    });

    test('a key rule change still replaces the kept keys when a newer load overtakes its own', async () => {
        const pending: ((values: string[]) => void)[] = [];
        const colDef = (caseSensitive: boolean): ColDef<Row> => ({
            field: 'value',
            ...setFilter({ values: (params) => pending.push(params.success), caseSensitive }),
        });
        const api = createGrid(rows('apple'), colDef(true));
        await waitFor(() => expect(pending.length).toBe(1));
        pending[0](['apple', 'APPLE']);
        await asyncSetTimeout(0);
        expect(handlerOf(api).getFilterKeys()).toEqual(['apple', 'APPLE']);

        api.setGridOption('columnDefs', [colDef(false)]);
        // its callback runs before it is overtaken, as one overtaken first is never called
        await asyncSetTimeout(0);
        api.setGridOption('columnDefs', [colDef(false)]);
        await waitFor(() => expect(pending.length).toBe(3));
        pending[2](['apple']);
        pending[1](['apple']);
        await asyncSetTimeout(0);
        expect(handlerOf(api).getFilterKeys()).toEqual(['apple']);
    });

    test('provided values keyed before the data type is inferred are not retained under their old keys', async () => {
        const api: GridApi = gridsManager.createGrid('grid', {
            columnDefs: [
                {
                    field: 'date',
                    filter: 'agSetColumnFilter',
                    filterParams: {
                        preservePreviousValues: true,
                        values: [new Date(2024, 0, 5), new Date(2024, 1, 5)],
                    } as ISetFilterParams<any, Date>,
                },
            ],
            rowData: [],
        });
        await asyncSetTimeout(0);
        // created before the rows, as a floating filter or an initial model would create it
        api.getColumnFilterHandler<SetFilterHandler>('date');

        api.setGridOption('rowData', [{ date: new Date(2024, 0, 5) }]);
        await asyncSetTimeout(0);

        expect(api.getColumnFilterHandler<SetFilterHandler>('date')!.getFilterKeys()).toEqual([
            '2024-01-05',
            '2024-02-05',
        ]);
    });

    test('a model naming a key twice, in two cases, keeps it once', async () => {
        const api = createGrid(rows('pear', 'fig'), setFilter());
        await asyncSetTimeout(0);
        await setModel(api, 'value', { filterType: 'set', values: ['pear', 'PEAR'] });
        expect(modelOf(api)?.values).toEqual(['pear']);
        expect(shown(api)).toEqual(['pear']);
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
