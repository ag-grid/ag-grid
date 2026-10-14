import { waitFor } from '@testing-library/dom';
import { GridRows, TestGridsManager, waitForNoLoadingRows } from 'ag-test-utils';

import type {
    GetRowIdParams,
    GetServerSideGroupAggDataParams,
    GridApi,
    IServerSideDatasource,
    IServerSideGetRowsParams,
    IServerSideGetRowsRequest,
} from 'ag-grid-community';
import { GROUP_TOTAL_ROW_ID_PREFIX, NumberFilterModule, ValueCacheModule } from 'ag-grid-community';
import { RowGroupingModule, ServerSideRowModelApiModule, ServerSideRowModelModule } from 'ag-grid-enterprise';

describe('SSRM grouping and aggregating the same column', () => {
    const gridManager = new TestGridsManager({
        modules: [
            RowGroupingModule,
            ServerSideRowModelModule,
            ServerSideRowModelApiModule,
            ValueCacheModule,
            NumberFilterModule,
        ],
    });

    afterEach(() => {
        gridManager.reset();
    });

    interface Athlete {
        id: string;
        athlete: string;
        country: string;
        gold: number;
    }

    const athletes: Athlete[] = [
        { id: 'a1', athlete: 'Alice', country: 'Italy', gold: 4 },
        { id: 'a2', athlete: 'Bruno', country: 'Italy', gold: 4 },
        { id: 'a3', athlete: 'Carla', country: 'Spain', gold: 2 },
    ];

    /**
     * Group rows carry the key under the grouped field and each aggregate under `${aggFunc}_${field}`.
     * Supports a `greaterThan` filter on gold, and sorts a group level by its key.
     */
    const createDatasource = (requests: IServerSideGetRowsRequest[], goldMultiplier = 1): IServerSideDatasource => ({
        getRows(params: IServerSideGetRowsParams) {
            const { request } = params;
            requests.push(request);
            const { rowGroupCols, groupKeys, sortModel } = request;
            const goldFilter = (request.filterModel as Record<string, { filter: number }> | null)?.gold;
            const matching = athletes.filter(
                (row) =>
                    groupKeys.every((key, i) => String(row[rowGroupCols[i].field as keyof Athlete]) === String(key)) &&
                    (!goldFilter || row.gold > goldFilter.filter)
            );

            let rowData: any[] = matching;
            if (rowGroupCols.length > groupKeys.length) {
                const field = rowGroupCols[groupKeys.length].field as keyof Athlete;
                const keys = [...new Set(matching.map((row) => row[field]))];
                const sort = sortModel.find((item) => item.colId === field)?.sort;
                if (sort) {
                    keys.sort((a, b) => (a < b ? -1 : a > b ? 1 : 0) * (sort === 'asc' ? 1 : -1));
                }
                rowData = keys.map((key) => {
                    const children = matching.filter((row) => row[field] === key);
                    const sumGold = children.reduce((sum, row) => sum + row.gold, 0) * goldMultiplier;
                    return {
                        [field]: key,
                        gold: field === 'gold' ? key : sumGold,
                        sum_gold: sumGold,
                        count_country: children.length,
                    };
                });
            }
            setTimeout(() => params.success({ rowData, rowCount: rowData.length }), 0);
        },
    });

    const getRowId = ({ data, parentKeys }: GetRowIdParams<Athlete>): string =>
        data.id ?? [...(parentKeys ?? []), data.gold].join('|');

    const goldGroupRow = (api: GridApi) => api.getRowNode('4')!;

    test('group row shows the key in the group column and the aggregate in the value column', async () => {
        const requests: IServerSideGetRowsRequest[] = [];
        const getServerSideGroupAggData = vi.fn(({ data }: GetServerSideGroupAggDataParams) => ({
            gold: data.sum_gold,
        }));
        const api = gridManager.createGrid(null, {
            columnDefs: [{ field: 'athlete' }, { field: 'gold', rowGroup: true, aggFunc: 'sum' }],
            rowModelType: 'serverSide',
            serverSideDatasource: createDatasource(requests),
            getRowId,
            getServerSideGroupAggData,
        });
        await waitFor(() => expect(goldGroupRow(api)).toBeDefined());

        const groupRow = goldGroupRow(api);
        expect(groupRow.key).toBe(4);
        expect(api.getCellValue({ rowNode: groupRow, colKey: 'ag-Grid-AutoColumn' })).toBe(4);
        expect(api.getCellValue({ rowNode: groupRow, colKey: 'gold' })).toBe(8);
        expect(groupRow.groupData).toEqual({ 'ag-Grid-AutoColumn': 4 });
        expect(getServerSideGroupAggData).toHaveBeenCalledWith(
            expect.objectContaining({ data: { gold: 4, sum_gold: 8, count_country: 2 }, node: groupRow, api })
        );

        groupRow.setExpanded(true);
        await waitFor(() => expect(api.getRowNode('a1')).toBeDefined());
        await waitForNoLoadingRows(api);

        expect(requests.map((request) => request.groupKeys)).toEqual([[], [4]]);
        await new GridRows(api, 'gold 4 expanded').check(`
            ROOT id:<no-id>
            ├─┬ GROUP-leafGroup id:4 ag-Grid-AutoColumn:4 gold:8
            │ ├── LEAF id:a1 athlete:"Alice" gold:4
            │ └── LEAF id:a2 athlete:"Bruno" gold:4
            └── GROUP-leafGroup collapsed id:2 ag-Grid-AutoColumn:2 gold:2
        `);
    });

    test('a column missing from the callback result is read from the row data', async () => {
        const api = gridManager.createGrid(null, {
            columnDefs: [
                { field: 'athlete' },
                { field: 'country', rowGroup: true, aggFunc: 'count' },
                { field: 'gold', aggFunc: 'sum' },
            ],
            rowModelType: 'serverSide',
            serverSideDatasource: createDatasource([]),
            getRowId: ({ data, parentKeys }) => data.id ?? [...(parentKeys ?? []), data.country].join('|'),
            getServerSideGroupAggData: ({ data }) => ({ country: data.count_country }),
        });
        await waitFor(() => expect(api.getRowNode('Italy')).toBeDefined());

        const italy = api.getRowNode('Italy')!;
        expect(api.getCellValue({ rowNode: italy, colKey: 'ag-Grid-AutoColumn' })).toBe('Italy');
        expect(api.getCellValue({ rowNode: italy, colKey: 'country' })).toBe(2);
        expect(api.getCellValue({ rowNode: italy, colKey: 'gold' })).toBe(8);
    });

    test('group total row shows the aggregate and an open group hides it', async () => {
        const api = gridManager.createGrid(null, {
            columnDefs: [{ field: 'athlete' }, { field: 'gold', rowGroup: true, aggFunc: 'sum' }],
            rowModelType: 'serverSide',
            serverSideDatasource: createDatasource([]),
            getRowId,
            groupTotalRow: 'bottom',
            getServerSideGroupAggData: ({ data }) => ({ gold: data.sum_gold }),
        });
        await waitFor(() => expect(goldGroupRow(api)).toBeDefined());

        goldGroupRow(api).setExpanded(true);
        await waitFor(() => expect(api.getRowNode('a1')).toBeDefined());
        await waitForNoLoadingRows(api);

        const totalRow = api.getRowNode(GROUP_TOTAL_ROW_ID_PREFIX + '4')!;
        expect(api.getCellValue({ rowNode: totalRow, colKey: 'gold' })).toBe(8);
        expect(api.getCellValue({ rowNode: goldGroupRow(api), colKey: 'gold' })).toBeUndefined();
        await new GridRows(api, 'gold 4 expanded with total row').check(`
            ROOT id:<no-id>
            ├─┬ GROUP-leafGroup id:4 ag-Grid-AutoColumn:4
            │ ├── LEAF id:a1 athlete:"Alice" gold:4
            │ ├── LEAF id:a2 athlete:"Bruno" gold:4
            │ └─ footer collapsed id:rowGroupFooter_4 ag-Grid-AutoColumn:"Total 4" gold:8
            └── GROUP-leafGroup collapsed id:2 ag-Grid-AutoColumn:2 gold:2
        `);
    });

    test('without the callback the value column reads the grouped field', async () => {
        const api = gridManager.createGrid(null, {
            columnDefs: [{ field: 'athlete' }, { field: 'gold', rowGroup: true, aggFunc: 'sum' }],
            rowModelType: 'serverSide',
            serverSideDatasource: createDatasource([]),
            getRowId,
        });
        await waitFor(() => expect(goldGroupRow(api)).toBeDefined());

        const groupRow = goldGroupRow(api);
        expect(groupRow.aggData).toBeUndefined();
        expect(groupRow.key).toBe(4);
        expect(api.getCellValue({ rowNode: groupRow, colKey: 'gold' })).toBe(4);
    });

    test('refreshing the group rows calls the callback again', async () => {
        let goldMultiplier = 1;
        const getServerSideGroupAggData = vi.fn(({ data }: GetServerSideGroupAggDataParams) => ({
            gold: data.sum_gold,
        }));
        const api = gridManager.createGrid(null, {
            columnDefs: [{ field: 'athlete' }, { field: 'gold', rowGroup: true, aggFunc: 'sum' }],
            rowModelType: 'serverSide',
            serverSideDatasource: {
                getRows: (params) => createDatasource([], goldMultiplier).getRows(params),
            },
            getRowId,
            getServerSideGroupAggData,
        });
        await waitFor(() => expect(goldGroupRow(api)).toBeDefined());
        const groupRow = goldGroupRow(api);
        const callsBeforeRefresh = getServerSideGroupAggData.mock.calls.length;

        goldMultiplier = 10;
        api.refreshServerSide({ purge: false });

        await waitFor(() => expect(api.getCellValue({ rowNode: groupRow, colKey: 'gold' })).toBe(80));
        expect(goldGroupRow(api)).toBe(groupRow);
        expect(groupRow.key).toBe(4);
        expect(getServerSideGroupAggData.mock.calls.length).toBeGreaterThan(callsBeforeRefresh);
    });

    test('refreshing the group rows updates values that depend on the aggregate', async () => {
        let goldMultiplier = 1;
        const api = gridManager.createGrid(null, {
            columnDefs: [
                { field: 'athlete' },
                { field: 'gold', rowGroup: true, aggFunc: 'sum' },
                { colId: 'doubleGold', valueGetter: ({ getValue }) => getValue('gold') * 2 },
            ],
            rowModelType: 'serverSide',
            serverSideDatasource: {
                getRows: (params) => createDatasource([], goldMultiplier).getRows(params),
            },
            getRowId,
            valueCache: true,
            getServerSideGroupAggData: ({ data }) => ({ gold: data.sum_gold }),
        });
        await waitFor(() => expect(goldGroupRow(api)).toBeDefined());
        const groupRow = goldGroupRow(api);
        expect(api.getCellValue({ rowNode: groupRow, colKey: 'doubleGold' })).toBe(16);
        const renderedCell = (colId: string) =>
            document.querySelector(`.ag-row[row-id="4"] .ag-cell[col-id="${colId}"]`)?.textContent;
        expect(renderedCell('doubleGold')).toBe('16');

        goldMultiplier = 10;
        api.refreshServerSide({ purge: false });

        await waitFor(() => expect(renderedCell('gold')).toBe('80'));
        expect(renderedCell('doubleGold')).toBe('160');
        expect(api.getCellValue({ rowNode: groupRow, colKey: 'doubleGold' })).toBe(160);
    });

    test('a transaction updating the group row calls the callback with the new data', async () => {
        const getServerSideGroupAggData = vi.fn(({ data }: GetServerSideGroupAggDataParams) => ({
            gold: data.sum_gold,
        }));
        const api = gridManager.createGrid(null, {
            columnDefs: [{ field: 'athlete' }, { field: 'gold', rowGroup: true, aggFunc: 'sum' }],
            rowModelType: 'serverSide',
            serverSideDatasource: createDatasource([]),
            getRowId,
            getServerSideGroupAggData,
        });
        await waitFor(() => expect(goldGroupRow(api)).toBeDefined());
        const groupRow = goldGroupRow(api);

        const newData = { gold: 4, sum_gold: 50, count_country: 2 };
        api.applyServerSideTransaction({ route: [], update: [newData] });

        expect(getServerSideGroupAggData).toHaveBeenLastCalledWith(
            expect.objectContaining({ data: newData, node: groupRow })
        );
        expect(goldGroupRow(api)).toBe(groupRow);
        expect(groupRow.key).toBe(4);
        expect(api.getCellValue({ rowNode: groupRow, colKey: 'ag-Grid-AutoColumn' })).toBe(4);
        expect(api.getCellValue({ rowNode: groupRow, colKey: 'gold' })).toBe(50);
    });

    test('a callback returning null reads the row data, and clears aggregates set before', async () => {
        let returnNull = false;
        const api = gridManager.createGrid(null, {
            columnDefs: [{ field: 'athlete' }, { field: 'gold', rowGroup: true, aggFunc: 'sum' }],
            rowModelType: 'serverSide',
            serverSideDatasource: createDatasource([]),
            getRowId,
            getServerSideGroupAggData: ({ data }) => (returnNull || data.gold === 2 ? null : { gold: data.sum_gold }),
        });
        await waitFor(() => expect(goldGroupRow(api)).toBeDefined());
        const groupRow = goldGroupRow(api);
        const gold2 = api.getRowNode('2')!;
        expect(gold2.aggData).toBeNull();
        expect(api.getCellValue({ rowNode: gold2, colKey: 'gold' })).toBe(2);
        expect(api.getCellValue({ rowNode: groupRow, colKey: 'gold' })).toBe(8);

        returnNull = true;
        api.refreshServerSide({ purge: false });

        await waitFor(() => expect(groupRow.aggData).toBeNull());
        expect(api.getCellValue({ rowNode: groupRow, colKey: 'gold' })).toBe(4);
    });

    test('a grouped and aggregated column below another group expands by its key', async () => {
        const requests: IServerSideGetRowsRequest[] = [];
        const api = gridManager.createGrid(null, {
            columnDefs: [
                { field: 'athlete' },
                { field: 'country', rowGroup: true },
                { field: 'gold', rowGroup: true, aggFunc: 'sum' },
            ],
            rowModelType: 'serverSide',
            serverSideDatasource: createDatasource(requests),
            getRowId: ({ data, parentKeys }) =>
                data.id ?? [...(parentKeys ?? []), parentKeys?.length ? data.gold : data.country].join('|'),
            getServerSideGroupAggData: ({ data }) => (data.country === undefined ? { gold: data.sum_gold } : null),
        });
        await waitFor(() => expect(api.getRowNode('Italy')).toBeDefined());

        api.getRowNode('Italy')!.setExpanded(true);
        await waitFor(() => expect(api.getRowNode('Italy|4')).toBeDefined());
        const italyGold4 = api.getRowNode('Italy|4')!;
        expect(italyGold4.key).toBe(4);
        expect(api.getCellValue({ rowNode: italyGold4, colKey: 'gold' })).toBe(8);

        italyGold4.setExpanded(true);
        await waitFor(() => expect(api.getRowNode('a1')).toBeDefined());
        expect(requests[requests.length - 1].groupKeys).toEqual(['Italy', 4]);
    });

    test('sorting the grouped and aggregated column sends it in the sort model and keeps the key and aggregate', async () => {
        const requests: IServerSideGetRowsRequest[] = [];
        const api = gridManager.createGrid(null, {
            columnDefs: [{ field: 'athlete' }, { field: 'gold', rowGroup: true, aggFunc: 'sum' }],
            rowModelType: 'serverSide',
            serverSideDatasource: createDatasource(requests),
            getRowId,
            getServerSideGroupAggData: ({ data }) => ({ gold: data.sum_gold }),
        });
        await waitFor(() => expect(goldGroupRow(api)).toBeDefined());

        api.applyColumnState({ state: [{ colId: 'gold', sort: 'asc' }] });

        await waitFor(() =>
            expect(requests[requests.length - 1].sortModel).toContainEqual(
                expect.objectContaining({ colId: 'gold', sort: 'asc' })
            )
        );
        await waitForNoLoadingRows(api);
        await new GridRows(api, 'sorted by gold asc').check(`
            ROOT id:<no-id>
            ├── GROUP-leafGroup collapsed id:2 ag-Grid-AutoColumn:2 gold:2
            └── GROUP-leafGroup collapsed id:4 ag-Grid-AutoColumn:4 gold:8
        `);
    });

    test('filtering the grouped and aggregated column sends it in the filter model and keeps the key and aggregate', async () => {
        const requests: IServerSideGetRowsRequest[] = [];
        const api = gridManager.createGrid(null, {
            columnDefs: [
                { field: 'athlete' },
                { field: 'gold', rowGroup: true, aggFunc: 'sum', filter: 'agNumberColumnFilter' },
            ],
            rowModelType: 'serverSide',
            serverSideDatasource: createDatasource(requests),
            getRowId,
            getServerSideGroupAggData: ({ data }) => ({ gold: data.sum_gold }),
        });
        await waitFor(() => expect(goldGroupRow(api)).toBeDefined());

        api.setFilterModel({ gold: { filterType: 'number', type: 'greaterThan', filter: 2 } });

        await waitFor(() =>
            expect(requests[requests.length - 1].filterModel).toEqual({
                gold: expect.objectContaining({ type: 'greaterThan', filter: 2 }),
            })
        );
        await waitFor(() => expect(api.getRowNode('2')).toBeUndefined());
        await waitForNoLoadingRows(api);
        await new GridRows(api, 'filtered by gold > 2').check(`
            ROOT id:<no-id>
            └── GROUP-leafGroup collapsed id:4 ag-Grid-AutoColumn:4 gold:8
        `);
    });

    test('grouping and aggregating the same column through the API', async () => {
        const requests: IServerSideGetRowsRequest[] = [];
        const api = gridManager.createGrid(null, {
            columnDefs: [{ field: 'athlete' }, { field: 'gold', enableRowGroup: true, enableValue: true }],
            rowModelType: 'serverSide',
            serverSideDatasource: createDatasource(requests),
            getRowId,
            getServerSideGroupAggData: ({ data }) => ({ gold: data.sum_gold }),
        });
        await waitFor(() => expect(api.getRowNode('a1')).toBeDefined());

        api.setRowGroupColumns(['gold']);
        api.setValueColumns(['gold']);

        await waitFor(() => expect(goldGroupRow(api)).toBeDefined());
        const lastRequest = requests[requests.length - 1];
        expect(lastRequest.rowGroupCols.map((col) => col.id)).toEqual(['gold']);
        expect(lastRequest.valueCols.map((col) => col.id)).toEqual(['gold']);
        expect(api.getCellValue({ rowNode: goldGroupRow(api), colKey: 'ag-Grid-AutoColumn' })).toBe(4);
        expect(api.getCellValue({ rowNode: goldGroupRow(api), colKey: 'gold' })).toBe(8);
    });
});
