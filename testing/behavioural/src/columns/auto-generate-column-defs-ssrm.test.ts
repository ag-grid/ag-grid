import { GridColumns, GridRows, TestGridsManager, waitForNoLoadingRows } from 'ag-test-utils';
import type { MockInstance } from 'vitest';

import type {
    GridApi,
    GridOptions,
    IServerSideDatasource,
    IServerSideGetRowsParams,
    IServerSideGetRowsRequest,
} from 'ag-grid-community';
import {
    AutoGenerateColumnsModule,
    InfiniteRowModelModule,
    ValidationModule,
    enableDevValidations,
} from 'ag-grid-community';
import { RowGroupingModule, ServerSideRowModelApiModule, ServerSideRowModelModule } from 'ag-grid-enterprise';

describe('Auto-Generate Column Defs with the Server-Side Row Model', () => {
    const gridsManager = new TestGridsManager({
        modules: [AutoGenerateColumnsModule, RowGroupingModule, ServerSideRowModelModule, ServerSideRowModelApiModule],
    });

    afterEach(() => {
        gridsManager.reset();
    });

    const rows = [
        { id: 'a', name: 'Alice', age: 30 },
        { id: 'b', name: 'Bob', age: 25 },
    ];

    type Responder = (params: IServerSideGetRowsParams, requestIndex: number) => void;

    function createDatasource(respond: Responder = (params) => params.success({ rowData: rows, rowCount: 2 })) {
        const requests: IServerSideGetRowsRequest[] = [];
        const datasource: IServerSideDatasource = {
            getRows(params) {
                requests.push(params.request);
                respond(params, requests.length - 1);
            },
        };
        return { datasource, requests };
    }

    async function createGrid(gridOptions: GridOptions, datasource: IServerSideDatasource): Promise<GridApi> {
        const api = gridsManager.createGrid('myGrid', {
            rowModelType: 'serverSide',
            getRowId: ({ data }) => data.id,
            serverSideDatasource: datasource,
            ...gridOptions,
        });
        await waitForNoLoadingRows(api);
        return api;
    }

    describe('generation', () => {
        test('generates columns from the first root-level block with a single flat request', async () => {
            const { datasource, requests } = createDatasource();
            const api = await createGrid({ autoGenerateColumnDefs: true }, datasource);

            await new GridColumns(api, 'generated').checkColumns(`
                CENTER
                ├── id "Id" width:200
                ├── name "Name" width:200
                └── age "Age" width:200
            `);
            await new GridRows(api, 'rows').check(`
                ROOT id:<no-id>
                ├── LEAF id:a id:"a" name:"Alice" age:30
                └── LEAF id:b id:"b" name:"Bob" age:25
            `);

            expect(requests).toHaveLength(1);
            expect(requests[0].rowGroupCols).toEqual([]);
            expect(requests[0].valueCols).toEqual([]);
            expect(requests[0].pivotCols).toEqual([]);
        });

        test('nested objects produce column groups', async () => {
            const { datasource } = createDatasource((params) =>
                params.success({ rowData: [{ id: 'a', address: { city: 'Paris' } }], rowCount: 1 })
            );
            const api = await createGrid({ autoGenerateColumnDefs: true }, datasource);

            await new GridColumns(api, 'nested').checkColumns(`
                CENTER
                ├── id "Id" width:200
                └─┬ "Address" GROUP
                  └── address.city "City" width:200
            `);
        });

        test('generates nothing when the option is not set', async () => {
            const { datasource } = createDatasource();
            const api = await createGrid({}, datasource);

            await new GridColumns(api, 'not enabled').checkColumns('empty');
        });

        test('replaces columnDefs supplied by the application, as with the Client-Side Row Model', async () => {
            const { datasource } = createDatasource();
            const api = await createGrid({ autoGenerateColumnDefs: true, columnDefs: [{ field: 'name' }] }, datasource);

            await new GridColumns(api, 'explicit columns replaced').checkColumns(`
                CENTER
                ├── id "Id" width:200
                ├── name "Name" width:200
                └── age "Age" width:200
            `);
        });

        test('generates from rows supplied to the root with applyServerSideRowData', async () => {
            // a datasource that never answers, so the only rows are the ones the application applies
            const { datasource } = createDatasource(() => {});
            const api = gridsManager.createGrid('myGrid', {
                rowModelType: 'serverSide',
                getRowId: ({ data }) => data.id,
                serverSideDatasource: datasource,
                autoGenerateColumnDefs: true,
            });

            api.applyServerSideRowData({ successParams: { rowData: rows, rowCount: 2 } });

            await new GridColumns(api, 'generated from applied rows').checkColumns(`
                CENTER
                ├── id "Id" width:200
                ├── name "Name" width:200
                └── age "Age" width:200
            `);
            await new GridRows(api, 'applied rows').check(`
                ROOT id:<no-id>
                ├── LEAF id:a id:"a" name:"Alice" age:30
                └── LEAF id:b id:"b" name:"Bob" age:25
            `);
        });

        test('generates alongside pivot result columns supplied by the server', async () => {
            const { datasource } = createDatasource((params) =>
                params.success({ rowData: rows, rowCount: 2, pivotResultFields: ['2020_age', '2021_age'] })
            );
            const api = await createGrid({ autoGenerateColumnDefs: true, pivotMode: true }, datasource);

            expect(
                api
                    .getColumns()
                    ?.map((col) => col.getColId())
                    .sort()
            ).toEqual(['age', 'id', 'name']);
            expect(
                api
                    .getPivotResultColumns()
                    ?.map((col) => col.getColId())
                    .sort()
            ).toEqual(['2020_age', '2021_age']);
        });
    });

    describe('runtime changes to autoGenerateColumnDefs', () => {
        test('enabling it after initialisation does nothing', async () => {
            const { datasource } = createDatasource();
            const api = await createGrid({ columnDefs: [{ field: 'name' }] }, datasource);

            api.setGridOption('autoGenerateColumnDefs', true);
            api.refreshServerSide({ purge: true });
            await waitForNoLoadingRows(api);

            await new GridColumns(api, 'still the supplied columns').checkColumns(`
                CENTER
                └── name "Name" width:200
            `);
        });

        test('disabling it after initialisation does not stop generation', async () => {
            let respond: (() => void) | undefined;
            const { datasource } = createDatasource((params) => {
                respond = () => params.success({ rowData: rows, rowCount: 2 });
            });
            const api = gridsManager.createGrid('myGrid', {
                rowModelType: 'serverSide',
                getRowId: ({ data }) => data.id,
                serverSideDatasource: datasource,
                autoGenerateColumnDefs: true,
            });
            await vi.waitFor(() => expect(respond).toBeDefined());

            api.setGridOption('autoGenerateColumnDefs', false);
            respond!();
            await waitForNoLoadingRows(api);

            await new GridColumns(api, 'generated from the initial value').checkColumns(`
                CENTER
                ├── id "Id" width:200
                ├── name "Name" width:200
                └── age "Age" width:200
            `);
        });

        test('does not clear columnDefs when changed at runtime', async () => {
            const { datasource } = createDatasource();
            const api = await createGrid({ columnDefs: [{ field: 'name' }] }, datasource);

            api.setGridOption('autoGenerateColumnDefs', true);
            api.setGridOption('autoGenerateColumnDefs', false);

            await new GridColumns(api, 'columns kept').checkColumns(`
                CENTER
                └── name "Name" width:200
            `);
        });
    });

    describe('regeneration', () => {
        test('sort and refresh do not regenerate, keeping user width and order', async () => {
            const { datasource, requests } = createDatasource();
            const api = await createGrid({ autoGenerateColumnDefs: true }, datasource);

            api.applyColumnState({
                state: [{ colId: 'age' }, { colId: 'name', width: 321 }, { colId: 'id' }],
                applyOrder: true,
            });
            api.applyColumnState({ state: [{ colId: 'name', sort: 'asc' }] });
            await waitForNoLoadingRows(api);
            api.refreshServerSide({ purge: true });
            await waitForNoLoadingRows(api);

            expect(requests.length).toBeGreaterThan(1);
            await new GridColumns(api, 'after sort and refresh').checkColumns(`
                CENTER
                ├── age "Age" width:200
                ├── name "Name" width:321 sort:asc
                └── id "Id" width:200
            `);
        });

        test('swapping the datasource does not regenerate', async () => {
            const { datasource } = createDatasource();
            const api = await createGrid({ autoGenerateColumnDefs: true }, datasource);

            const other = createDatasource((params) =>
                params.success({ rowData: [{ id: 'x', other: true }], rowCount: 1 })
            );
            api.setGridOption('serverSideDatasource', other.datasource);
            await waitForNoLoadingRows(api);

            await new GridColumns(api, 'after datasource swap').checkColumns(`
                CENTER
                ├── id "Id" width:200
                ├── name "Name" width:200
                └── age "Age" width:200
            `);
        });
    });

    describe('empty or failed first response', () => {
        test.each([
            ['empty', (params: IServerSideGetRowsParams) => params.success({ rowData: [], rowCount: 0 })],
            ['failed', (params: IServerSideGetRowsParams) => params.fail()],
        ])('%s first response generates nothing, the next response with rows generates', async (_name, first) => {
            const { datasource, requests } = createDatasource((params, index) =>
                index === 0 ? first(params) : params.success({ rowData: rows, rowCount: 2 })
            );
            // a failed block stays as a failed stub row, so wait on the request rather than on loading rows
            const api = gridsManager.createGrid('myGrid', {
                rowModelType: 'serverSide',
                getRowId: ({ data }) => data.id,
                serverSideDatasource: datasource,
                autoGenerateColumnDefs: true,
            });
            await vi.waitFor(() => expect(requests).toHaveLength(1));

            await new GridColumns(api, 'nothing yet').checkColumns('empty');

            api.refreshServerSide({ purge: true });
            await vi.waitFor(() => expect(requests).toHaveLength(2));

            await new GridColumns(api, 'generated on next response').checkColumns(`
                CENTER
                ├── id "Id" width:200
                ├── name "Name" width:200
                └── age "Age" width:200
            `);
        });
    });

    describe('processAutoGeneratedColumnDefs', () => {
        test('receives the first block rows and its returned array replaces the columns', async () => {
            const { datasource } = createDatasource();
            const processAutoGeneratedColumnDefs = vi.fn(() => [{ field: 'name' }]);
            const api = await createGrid({ autoGenerateColumnDefs: true, processAutoGeneratedColumnDefs }, datasource);

            expect(processAutoGeneratedColumnDefs).toHaveBeenCalledTimes(1);
            expect(processAutoGeneratedColumnDefs).toHaveBeenCalledWith(expect.objectContaining({ rowData: rows }));
            await new GridColumns(api, 'callback result').checkColumns(`
                CENTER
                └── name "Name" width:200
            `);
        });

        test('setting only aggFunc does not refetch', async () => {
            const { datasource, requests } = createDatasource();
            const api = await createGrid(
                {
                    autoGenerateColumnDefs: true,
                    processAutoGeneratedColumnDefs: ({ columnDefs }) => {
                        for (const colDef of columnDefs) {
                            if ('field' in colDef && colDef.field === 'age') {
                                colDef.aggFunc = 'sum';
                            }
                        }
                    },
                },
                datasource
            );

            expect(requests).toHaveLength(1);
            expect(api.getColumn('age')?.getAggFunc()).toBe('sum');
        });

        test('adding rowGroup makes exactly one extra request carrying the grouping', async () => {
            const { datasource, requests } = createDatasource((params) => {
                if (params.request.rowGroupCols.length) {
                    params.success({ rowData: [{ name: 'Alice' }, { name: 'Bob' }], rowCount: 2 });
                } else {
                    params.success({ rowData: rows, rowCount: 2 });
                }
            });
            const api = await createGrid(
                {
                    autoGenerateColumnDefs: true,
                    getRowId: ({ data, parentKeys }) => [...(parentKeys ?? []), data.id ?? data.name].join('/'),
                    processAutoGeneratedColumnDefs: ({ columnDefs }) => {
                        for (const colDef of columnDefs) {
                            if ('field' in colDef && colDef.field === 'name') {
                                colDef.rowGroup = true;
                            }
                        }
                    },
                },
                datasource
            );

            expect(requests).toHaveLength(2);
            expect(requests[1].rowGroupCols.map((col) => col.field)).toEqual(['name']);
            await new GridRows(api, 'grouped').check(`
                ROOT id:<no-id>
                ├── GROUP-leafGroup collapsed id:Alice ag-Grid-AutoColumn:"Alice" name:"Alice"
                └── GROUP-leafGroup collapsed id:Bob ag-Grid-AutoColumn:"Bob" name:"Bob"
            `);
        });
    });
});

describe('Auto-Generate Column Defs row model validation', () => {
    const gridsManager = new TestGridsManager({
        modules: [AutoGenerateColumnsModule, InfiniteRowModelModule, ValidationModule],
    });
    let consoleWarnSpy: MockInstance;

    beforeEach(() => {
        enableDevValidations({ throwOn: [] });
        consoleWarnSpy = vitest.spyOn(console, 'warn').mockImplementation(() => {});
    });

    afterEach(() => {
        gridsManager.reset();
        consoleWarnSpy.mockRestore();
    });

    test('warns when used with the Infinite Row Model', () => {
        gridsManager.createGrid('myGrid', { rowModelType: 'infinite', autoGenerateColumnDefs: true });

        expect(consoleWarnSpy).toHaveBeenCalledWith(
            expect.stringContaining('warning #309'),
            expect.stringContaining('`autoGenerateColumnDefs` is not supported with the `infinite` row model'),
            expect.any(String)
        );
    });
});
