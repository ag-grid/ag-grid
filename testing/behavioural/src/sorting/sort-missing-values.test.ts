import { GridRows, TestGridsManager, waitForEvent } from 'ag-test-utils';
import { waitForNoLoadingRows } from 'ag-test-utils/ssrm-test-utils';

import type { ColDef, GridApi, GridOptions, IServerSideGetRowsParams, SortMissingValues } from 'ag-grid-community';
import { ClientSideRowModelModule, CsvExportModule } from 'ag-grid-community';
import { FormulaModule, RowGroupingModule, ServerSideRowModelModule } from 'ag-grid-enterprise';

describe('Sorting missing values and NaN', () => {
    const gridMgr = new TestGridsManager({
        modules: [ClientSideRowModelModule, RowGroupingModule, CsvExportModule],
    });

    afterEach(() => {
        gridMgr.reset();
    });

    /** Each row's `label` is the value's name, so the sorted order reads as the values themselves. */
    const row = (value: unknown) => ({ value, label: Number.isNaN(value) ? 'NaN' : String(value) });
    const valuesRowData = () => [7, undefined, 5, NaN, 0, null, -2].map(row);

    function createGrid(id: string, options: GridOptions): GridApi {
        return gridMgr.createGrid(id, options);
    }

    /** Labels in display order after sorting `colId` (other columns unsorted). */
    function sortedLabels(api: GridApi, colId: string, direction: 'asc' | 'desc'): string[] {
        api.applyColumnState({ state: [{ colId, sort: direction }], defaultState: { sort: null } });
        return displayedLabels(api);
    }

    function displayedLabels(api: GridApi): string[] {
        const labels: string[] = [];
        api.forEachNodeAfterFilterAndSort((node) => labels.push(node.data.label));
        return labels;
    }

    const valueColumn = (sortMissingValues?: SortMissingValues, colDef: ColDef = {}): ColDef[] => [
        { field: 'value', sortMissingValues, ...colDef },
        { field: 'label' },
    ];

    describe('sortMissingValues', () => {
        test.each([undefined, 'inOrder'] as const)(
            '%s keeps missing values as the smallest values, equal to each other',
            (sortMissingValues) => {
                const api = createGrid('in-order', {
                    columnDefs: valueColumn(sortMissingValues),
                    rowData: valuesRowData(),
                });

                expect(sortedLabels(api, 'value', 'asc')).toEqual(['undefined', 'null', '-2', '0', '5', '7', 'NaN']);
                expect(sortedLabels(api, 'value', 'desc')).toEqual(['NaN', '7', '5', '0', '-2', 'undefined', 'null']);
            }
        );

        test("'first' places missing values first in both directions, null before undefined", () => {
            const api = createGrid('first', { columnDefs: valueColumn('first'), rowData: valuesRowData() });

            expect(sortedLabels(api, 'value', 'asc')).toEqual(['null', 'undefined', '-2', '0', '5', '7', 'NaN']);
            expect(sortedLabels(api, 'value', 'desc')).toEqual(['null', 'undefined', 'NaN', '7', '5', '0', '-2']);
        });

        test("'last' places missing values last in both directions, null before undefined", () => {
            const api = createGrid('last', { columnDefs: valueColumn('last'), rowData: valuesRowData() });

            expect(sortedLabels(api, 'value', 'asc')).toEqual(['-2', '0', '5', '7', 'NaN', 'null', 'undefined']);
            expect(sortedLabels(api, 'value', 'desc')).toEqual(['NaN', '7', '5', '0', '-2', 'null', 'undefined']);
        });

        test("'last' with absolute sort", () => {
            const api = createGrid('last-absolute', {
                columnDefs: valueColumn('last'),
                rowData: [-7, null, 3, -1].map(row),
            });

            api.applyColumnState({ state: [{ colId: 'value', sort: 'asc', sortType: 'absolute' }] });
            expect(displayedLabels(api)).toEqual(['-1', '3', '-7', 'null']);
            api.applyColumnState({ state: [{ colId: 'value', sort: 'desc', sortType: 'absolute' }] });
            expect(displayedLabels(api)).toEqual(['-7', '3', '-1', 'null']);
        });

        test('an empty string is not a missing value', () => {
            const api = createGrid('empty-string', {
                columnDefs: valueColumn('last'),
                rowData: ['b', null, '', 'a'].map(row),
            });

            expect(sortedLabels(api, 'value', 'asc')).toEqual(['', 'a', 'b', 'null']);
            expect(sortedLabels(api, 'value', 'desc')).toEqual(['b', 'a', '', 'null']);
        });

        test('applies to each column of a multi-column sort', () => {
            const api = createGrid('multi-column', {
                columnDefs: [{ field: 'group' }, { field: 'value', sortMissingValues: 'last' }, { field: 'label' }],
                rowData: [
                    { group: 'a', ...row(null) },
                    { group: 'b', ...row(1) },
                    { group: 'a', ...row(2) },
                    { group: 'b', ...row(undefined) },
                    { group: 'a', ...row(1) },
                ].map((data, i) => ({ ...data, label: `${data.group}:${data.label}:${i}` })),
            });

            api.applyColumnState({
                state: [
                    { colId: 'group', sort: 'asc', sortIndex: 0 },
                    { colId: 'value', sort: 'desc', sortIndex: 1 },
                ],
            });
            expect(displayedLabels(api)).toEqual(['a:2:2', 'a:1:4', 'a:null:0', 'b:1:1', 'b:undefined:3']);
        });

        test('is not used when the column has a user comparator', () => {
            const comparator = vi.fn((a: any, b: any) => (a ?? -Infinity) - (b ?? -Infinity));
            const api = createGrid('user-comparator', {
                columnDefs: valueColumn('last', { comparator }),
                rowData: [3, null, 1].map(row),
            });

            expect(sortedLabels(api, 'value', 'asc')).toEqual(['null', '1', '3']);
            expect(comparator).toHaveBeenCalledWith(
                null,
                expect.anything(),
                expect.anything(),
                expect.anything(),
                false
            );
        });

        test('applies to the built-in bigint comparator', () => {
            const api = createGrid('bigint', {
                columnDefs: valueColumn('last', { cellDataType: 'bigint' }),
                rowData: [BigInt(10), null, BigInt(-5), undefined, BigInt(2)].map(row),
            });

            expect(sortedLabels(api, 'value', 'asc')).toEqual(['-5', '2', '10', 'null', 'undefined']);
            expect(sortedLabels(api, 'value', 'desc')).toEqual(['10', '2', '-5', 'null', 'undefined']);
        });

        test('places the blanks row group last when set on the row group column', async () => {
            const api = createGrid('row-group-blanks', {
                columnDefs: [
                    { field: 'country', rowGroup: true, hide: true, sortMissingValues: 'last' },
                    { field: 'label' },
                ],
                autoGroupColumnDef: { sort: 'asc' },
                rowData: [
                    { id: 'r1', country: 'Spain', label: 'r1' },
                    { id: 'r2', country: null, label: 'r2' },
                    { id: 'r3', country: 'Austria', label: 'r3' },
                ],
                getRowId: (params) => params.data.id,
                groupDefaultExpanded: 0,
            });

            await new GridRows(api, 'ascending').check(`
                ROOT id:ROOT_NODE_ID
                ├─┬ LEAF_GROUP collapsed id:row-group-country-Austria ag-Grid-AutoColumn:"Austria"
                │ └── LEAF hidden id:r3 country:"Austria" label:"r3"
                ├─┬ LEAF_GROUP collapsed id:row-group-country-Spain ag-Grid-AutoColumn:"Spain"
                │ └── LEAF hidden id:r1 country:"Spain" label:"r1"
                └─┬ LEAF_GROUP collapsed id:row-group-country- ag-Grid-AutoColumn:"(Blanks)"
                · └── LEAF hidden id:r2 country:null label:"r2"
            `);

            // The auto group column's sort is coupled to the row group column, which holds the sort.
            api.applyColumnState({ state: [{ colId: 'country', sort: 'desc' }] });
            await new GridRows(api, 'descending').check(`
                ROOT id:ROOT_NODE_ID
                ├─┬ LEAF_GROUP collapsed id:row-group-country-Spain ag-Grid-AutoColumn:"Spain"
                │ └── LEAF hidden id:r1 country:"Spain" label:"r1"
                ├─┬ LEAF_GROUP collapsed id:row-group-country-Austria ag-Grid-AutoColumn:"Austria"
                │ └── LEAF hidden id:r3 country:"Austria" label:"r3"
                └─┬ LEAF_GROUP collapsed id:row-group-country- ag-Grid-AutoColumn:"(Blanks)"
                · └── LEAF hidden id:r2 country:null label:"r2"
            `);
        });

        test('treats an empty aggregation result as a missing value', () => {
            const api = createGrid('aggregation', {
                columnDefs: [
                    { field: 'country', rowGroup: true, hide: true },
                    { field: 'value', aggFunc: 'avg', sortMissingValues: 'last' },
                ],
                rowData: [
                    { country: 'Spain', value: 4 },
                    { country: 'Austria', value: null },
                    { country: 'Chile', value: 1 },
                ],
            });
            const groupKeys = () => {
                const keys: string[] = [];
                api.forEachNodeAfterFilterAndSort((node) => node.group && keys.push(node.key!));
                return keys;
            };

            api.applyColumnState({ state: [{ colId: 'value', sort: 'asc' }] });
            expect(groupKeys()).toEqual(['Chile', 'Spain', 'Austria']);
            api.applyColumnState({ state: [{ colId: 'value', sort: 'desc' }] });
            expect(groupKeys()).toEqual(['Spain', 'Chile', 'Austria']);
        });

        test('exports rows in the sorted order', () => {
            const api = createGrid('export', { columnDefs: valueColumn('last'), rowData: [2, null, 1].map(row) });

            api.applyColumnState({ state: [{ colId: 'value', sort: 'desc' }] });
            expect(api.getDataAsCsv({ columnKeys: ['label'], skipColumnHeaders: true })).toBe('"2"\r\n"1"\r\n"null"');
        });
    });

    describe('NaN', () => {
        test('NaN values are equal to each other and sort after numbers ascending, before them descending', () => {
            const api = createGrid('nan-numbers', {
                columnDefs: valueColumn(),
                rowData: [NaN, 3, null, -1, NaN, 2].map((value, i) => ({ value, label: `${value}:${i}` })),
            });

            expect(sortedLabels(api, 'value', 'asc')).toEqual(['null:2', '-1:3', '2:5', '3:1', 'NaN:0', 'NaN:4']);
            expect(sortedLabels(api, 'value', 'desc')).toEqual(['NaN:0', 'NaN:4', '3:1', '2:5', '-1:3', 'null:2']);
        });

        test('NaN sorts after text', () => {
            const api = createGrid('nan-text', { columnDefs: valueColumn(), rowData: ['b', NaN, 'a'].map(row) });

            expect(sortedLabels(api, 'value', 'asc')).toEqual(['a', 'b', 'NaN']);
            expect(sortedLabels(api, 'value', 'desc')).toEqual(['NaN', 'b', 'a']);
        });

        test('NaN sorts after text with accentedSort', () => {
            const api = createGrid('nan-text-accented', {
                columnDefs: valueColumn(),
                rowData: ['b', NaN, 'à'].map(row),
                accentedSort: true,
            });

            expect(sortedLabels(api, 'value', 'asc')).toEqual(['à', 'b', 'NaN']);
        });

        test('NaN with absolute sort', () => {
            const api = createGrid('nan-absolute', { columnDefs: valueColumn(), rowData: [-3, NaN, 2].map(row) });

            api.applyColumnState({ state: [{ colId: 'value', sort: 'asc', sortType: 'absolute' }] });
            expect(displayedLabels(api)).toEqual(['2', '-3', 'NaN']);
        });
    });
});

describe('Sorting formula error values', () => {
    const gridMgr = new TestGridsManager({ modules: [ClientSideRowModelModule, FormulaModule] });

    afterEach(() => {
        gridMgr.reset();
    });

    test('formula errors are grouped together after numbers, like NaN', () => {
        const api = gridMgr.createGrid('formula-errors', {
            columnDefs: [{ field: 'total', allowFormula: true, cellDataType: 'number' }],
            rowData: [
                { id: 'a', total: 5 },
                { id: 'b', total: '=1 / 0' },
                { id: 'c', total: 2 },
                { id: 'd', total: '=1 / 0' },
                { id: 'e', total: 9 },
            ],
            getRowId: (params) => params.data.id,
        });
        const ids = (direction: 'asc' | 'desc') => {
            api.applyColumnState({ state: [{ colId: 'total', sort: direction }] });
            const result: string[] = [];
            api.forEachNodeAfterFilterAndSort((node) => result.push(node.id!));
            return result;
        };

        expect(ids('asc')).toEqual(['c', 'a', 'e', 'b', 'd']);
        expect(ids('desc')).toEqual(['b', 'd', 'e', 'a', 'c']);
    });
});

describe('Sorting missing values with the Server-Side Row Model client-side sort', () => {
    const gridMgr = new TestGridsManager({ modules: [ServerSideRowModelModule] });

    afterEach(() => {
        gridMgr.reset();
    });

    test("sortMissingValues: 'last' applies to client-side sorting", async () => {
        const rows = [3, null, 1, undefined, 2].map((value, i) => ({ id: String(i), value }));
        const getRowsSpy = vi.fn((params: IServerSideGetRowsParams) =>
            params.success({ rowData: rows, rowCount: rows.length })
        );
        const api = gridMgr.createGrid('ssrm', {
            columnDefs: [{ field: 'value', sortMissingValues: 'last' }],
            rowModelType: 'serverSide',
            serverSideEnableClientSideSort: true,
            getRowId: (params) => params.data.id,
            serverSideDatasource: { getRows: getRowsSpy },
        });
        await waitForNoLoadingRows(api);
        getRowsSpy.mockClear();

        const sortChanged = waitForEvent('sortChanged', api);
        api.applyColumnState({ state: [{ colId: 'value', sort: 'desc' }] });
        await sortChanged;
        await waitForNoLoadingRows(api);

        const ids: string[] = [];
        api.forEachNode((node) => ids.push(node.id!));
        expect(ids).toEqual(['0', '4', '2', '1', '3']);
        expect(getRowsSpy).not.toHaveBeenCalled();
    });
});
