import { waitFor } from '@testing-library/dom';
import { GridRows, TestGridsManager, waitForNoLoadingRows } from 'ag-test-utils';

import type {
    GetRowIdParams,
    GetServerSideRowGroupKeyParams,
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

    const compareKeys = (a: string | number, b: string | number): number => {
        if (a === b) {
            return 0;
        }
        return a < b ? -1 : 1;
    };

    /**
     * Group rows carry the key under `groupKey` and the grouped field, then each aggregate under its column's field.
     * Supports a `greaterThan` filter on gold, and sorts a group level by its key.
     */
    const createDatasource = (requests: IServerSideGetRowsRequest[], goldMultiplier = 1): IServerSideDatasource => ({
        getRows(params: IServerSideGetRowsParams) {
            const { request } = params;
            requests.push(request);
            const { rowGroupCols, groupKeys, sortModel, valueCols } = request;
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
                    const direction = sort === 'asc' ? 1 : -1;
                    keys.sort((a, b) => compareKeys(a, b) * direction);
                }
                rowData = keys.map((key) => {
                    const children = matching.filter((row) => row[field] === key);
                    const groupRow: Record<string, any> = { groupKey: key, [field]: key };
                    for (const { field: valueField, aggFunc } of valueCols) {
                        groupRow[valueField!] =
                            aggFunc === 'count'
                                ? children.length
                                : children.reduce((sum, row) => sum + row.gold, 0) * goldMultiplier;
                    }
                    return groupRow;
                });
            }
            setTimeout(() => params.success({ rowData, rowCount: rowData.length }), 0);
        },
    });

    const getRowId = ({ data, parentKeys }: GetRowIdParams): string =>
        data.id ?? [...(parentKeys ?? []), data.groupKey].join('|');

    const getServerSideRowGroupKey = ({ data }: GetServerSideRowGroupKeyParams) => data.groupKey;

    const goldGroupRow = (api: GridApi) => api.getRowNode('4')!;

    test('group row shows the key in the group column and the aggregate in the value column', async () => {
        const requests: IServerSideGetRowsRequest[] = [];
        const getRowGroupKey = vi.fn(getServerSideRowGroupKey);
        const api = gridManager.createGrid(null, {
            columnDefs: [{ field: 'athlete' }, { field: 'gold', rowGroup: true, aggFunc: 'sum' }],
            rowModelType: 'serverSide',
            serverSideDatasource: createDatasource(requests),
            getRowId,
            getServerSideRowGroupKey: getRowGroupKey,
        });
        await waitFor(() => expect(goldGroupRow(api)).toBeDefined());

        const groupRow = goldGroupRow(api);
        expect(groupRow.key).toBe(4);
        expect(api.getCellValue({ rowNode: groupRow, colKey: 'ag-Grid-AutoColumn' })).toBe(4);
        expect(api.getCellValue({ rowNode: groupRow, colKey: 'gold' })).toBe(8);
        expect(groupRow.aggData).toBeUndefined();
        expect(getRowGroupKey).toHaveBeenCalledWith(
            expect.objectContaining({
                data: { groupKey: 4, gold: 8 },
                node: groupRow,
                column: api.getColumn('gold'),
                api,
            })
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

    test('other value columns are read from the row data', async () => {
        const api = gridManager.createGrid(null, {
            columnDefs: [
                { field: 'athlete' },
                { field: 'country', rowGroup: true, aggFunc: 'count' },
                { field: 'gold', aggFunc: 'sum' },
            ],
            rowModelType: 'serverSide',
            serverSideDatasource: createDatasource([]),
            getRowId,
            getServerSideRowGroupKey,
        });
        await waitFor(() => expect(api.getRowNode('Italy')).toBeDefined());

        const italy = api.getRowNode('Italy')!;
        expect(api.getCellValue({ rowNode: italy, colKey: 'ag-Grid-AutoColumn' })).toBe('Italy');
        expect(api.getCellValue({ rowNode: italy, colKey: 'country' })).toBe(2);
        expect(api.getCellValue({ rowNode: italy, colKey: 'gold' })).toBe(8);
    });

    test('group total row shows the key in the group column and the aggregate in the value column', async () => {
        const api = gridManager.createGrid(null, {
            columnDefs: [{ field: 'athlete' }, { field: 'gold', rowGroup: true, aggFunc: 'sum' }],
            rowModelType: 'serverSide',
            serverSideDatasource: createDatasource([]),
            getRowId,
            groupTotalRow: 'bottom',
            getServerSideRowGroupKey,
        });
        await waitFor(() => expect(goldGroupRow(api)).toBeDefined());

        goldGroupRow(api).setExpanded(true);
        await waitFor(() => expect(api.getRowNode('a1')).toBeDefined());
        await waitForNoLoadingRows(api);

        const totalRow = api.getRowNode(GROUP_TOTAL_ROW_ID_PREFIX + '4')!;
        expect(api.getCellValue({ rowNode: totalRow, colKey: 'ag-Grid-AutoColumn' })).toBe(4);
        expect(api.getCellValue({ rowNode: totalRow, colKey: 'gold' })).toBe(8);
        await new GridRows(api, 'gold 4 expanded with total row').check(`
            ROOT id:<no-id>
            ├─┬ GROUP-leafGroup id:4 ag-Grid-AutoColumn:4
            │ ├── LEAF id:a1 athlete:"Alice" gold:4
            │ ├── LEAF id:a2 athlete:"Bruno" gold:4
            │ └─ footer collapsed id:rowGroupFooter_4 ag-Grid-AutoColumn:"Total 4" gold:8
            └── GROUP-leafGroup collapsed id:2 ag-Grid-AutoColumn:2 gold:2
        `);
    });

    test('a callback returning undefined reads the key from the row data', async () => {
        const api = gridManager.createGrid(null, {
            columnDefs: [{ field: 'athlete' }, { field: 'gold', rowGroup: true }],
            rowModelType: 'serverSide',
            serverSideDatasource: createDatasource([]),
            getRowId,
            getServerSideRowGroupKey: () => undefined,
        });
        await waitFor(() => expect(goldGroupRow(api)).toBeDefined());

        const groupRow = goldGroupRow(api);
        expect(groupRow.key).toBe(4);
        expect(api.getCellValue({ rowNode: groupRow, colKey: 'ag-Grid-AutoColumn' })).toBe(4);
        expect(api.getCellValue({ rowNode: groupRow, colKey: 'gold' })).toBe(4);
    });

    test('refreshing the group rows keeps the key and updates values that depend on the aggregate', async () => {
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
            getServerSideRowGroupKey,
        });
        await waitFor(() => expect(goldGroupRow(api)).toBeDefined());
        const groupRow = goldGroupRow(api);
        const renderedCell = (colId: string) =>
            document.querySelector(`.ag-row[row-id="4"] .ag-cell[col-id="${colId}"]`)?.textContent;
        expect(renderedCell('doubleGold')).toBe('16');

        goldMultiplier = 10;
        api.refreshServerSide({ purge: false });

        await waitFor(() => expect(renderedCell('gold')).toBe('80'));
        expect(renderedCell('doubleGold')).toBe('160');
        expect(goldGroupRow(api)).toBe(groupRow);
        expect(groupRow.key).toBe(4);
        expect(api.getCellValue({ rowNode: groupRow, colKey: 'ag-Grid-AutoColumn' })).toBe(4);
    });

    test('updating the group row data with a transaction or updateData shows the new aggregate', async () => {
        const api = gridManager.createGrid(null, {
            columnDefs: [{ field: 'athlete' }, { field: 'gold', rowGroup: true, aggFunc: 'sum' }],
            rowModelType: 'serverSide',
            serverSideDatasource: createDatasource([]),
            getRowId,
            getServerSideRowGroupKey,
        });
        await waitFor(() => expect(goldGroupRow(api)).toBeDefined());
        const groupRow = goldGroupRow(api);

        api.applyServerSideTransaction({ route: [], update: [{ groupKey: 4, gold: 50 }] });

        expect(goldGroupRow(api)).toBe(groupRow);
        expect(groupRow.key).toBe(4);
        expect(api.getCellValue({ rowNode: groupRow, colKey: 'ag-Grid-AutoColumn' })).toBe(4);
        expect(api.getCellValue({ rowNode: groupRow, colKey: 'gold' })).toBe(50);

        groupRow.updateData({ groupKey: 4, gold: 60 });

        expect(api.getCellValue({ rowNode: groupRow, colKey: 'ag-Grid-AutoColumn' })).toBe(4);
        expect(api.getCellValue({ rowNode: groupRow, colKey: 'gold' })).toBe(60);
    });

    test('a grouped and aggregated column below another group expands by its key', async () => {
        const requests: IServerSideGetRowsRequest[] = [];
        const getRowGroupKey = vi.fn(getServerSideRowGroupKey);
        const api = gridManager.createGrid(null, {
            columnDefs: [
                { field: 'athlete' },
                { field: 'country', rowGroup: true },
                { field: 'gold', rowGroup: true, aggFunc: 'sum' },
            ],
            rowModelType: 'serverSide',
            serverSideDatasource: createDatasource(requests),
            getRowId,
            getServerSideRowGroupKey: getRowGroupKey,
        });
        await waitFor(() => expect(api.getRowNode('Italy')).toBeDefined());
        const italy = api.getRowNode('Italy')!;
        expect(getRowGroupKey).toHaveBeenCalledWith(
            expect.objectContaining({ node: italy, column: api.getColumn('country') })
        );
        expect(api.getCellValue({ rowNode: italy, colKey: 'gold' })).toBe(8);

        italy.setExpanded(true);
        await waitFor(() => expect(api.getRowNode('Italy|4')).toBeDefined());
        const italyGold4 = api.getRowNode('Italy|4')!;
        expect(italyGold4.key).toBe(4);
        expect(api.getCellValue({ rowNode: italyGold4, colKey: 'gold' })).toBe(8);
        expect(getRowGroupKey).toHaveBeenCalledWith(
            expect.objectContaining({ node: italyGold4, column: api.getColumn('gold') })
        );

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
            getServerSideRowGroupKey,
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
            getServerSideRowGroupKey,
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
            getServerSideRowGroupKey,
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
