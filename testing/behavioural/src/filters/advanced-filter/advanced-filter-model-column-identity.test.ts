import { waitFor } from '@testing-library/dom';
import { AdvancedFilterHarness, TestGridsManager, asyncSetTimeout } from 'ag-test-utils';

import type { AdvancedFilterModel, ColDef, GridApi, GridOptions, IServerSideGetRowsParams } from 'ag-grid-community';
import { ClientSideRowModelModule, GridStateModule, TextFilterModule } from 'ag-grid-community';
import { AdvancedFilterModule, ServerSideRowModelModule } from 'ag-grid-enterprise';

interface Row {
    name: string;
    country: string;
    nation: string;
    other: string;
}

const ROW_DATA: Row[] = [
    { name: 'A', country: 'Norway', nation: 'Peru', other: 'x' },
    { name: 'B', country: 'Peru', nation: 'Chile', other: 'x' },
    { name: 'C', country: 'Chile', nation: 'Spain', other: 'x' },
];

const ALL_ROWS = ['A', 'B', 'C'];
const COUNTRY_ROWS = ['B', 'C'];
const NATION_ROWS = ['A', 'B'];

const NAME_COL: ColDef = { field: 'name', filter: true };
const OTHER_COL: ColDef = { field: 'other', filter: true };
const NATION_AS_COUNTRY: ColDef = { field: 'nation', headerName: 'Country', filter: true };

const containsE = (colId: string): AdvancedFilterModel => ({
    filterType: 'text',
    colId,
    type: 'contains',
    filter: 'e',
});

function getDisplayedNames(api: GridApi<Row>): string[] {
    const names: string[] = [];
    api.forEachNodeAfterFilter((node) => names.push(node.data!.name));
    return names;
}

describe('Advanced Filter model column identity', () => {
    const gridsManager = new TestGridsManager({
        modules: [TextFilterModule, AdvancedFilterModule, ClientSideRowModelModule, GridStateModule],
    });

    afterEach(() => gridsManager.reset());

    async function createGrid(columnDefs: ColDef[], options: GridOptions<Row> = {}): Promise<GridApi<Row>> {
        const api = gridsManager.createGrid('grid', {
            columnDefs,
            rowData: ROW_DATA,
            enableAdvancedFilter: true,
            ...options,
        });
        await asyncSetTimeout(0);
        return api;
    }

    function setModel(api: GridApi<Row>, model: AdvancedFilterModel | null): void {
        api.setAdvancedFilterModel(model);
        api.onFilterChanged();
    }

    function expectFilter(api: GridApi<Row>, model: AdvancedFilterModel | null, names: string[]): void {
        expect(api.getAdvancedFilterModel()).toEqual(model);
        expect(getDisplayedNames(api)).toEqual(names);
    }

    test('a condition on a column without filtering is not applied to another column whose header matches its colId', async () => {
        const api = await createGrid([NAME_COL, { field: 'country' }, NATION_AS_COUNTRY, OTHER_COL]);

        setModel(api, containsE('country'));
        expectFilter(api, null, ALL_ROWS);

        api.setColumnsVisible(['other'], false);
        await asyncSetTimeout(0);
        expectFilter(api, null, ALL_ROWS);
    });

    test('a condition on a hidden column applies to it, not to the colliding column, once hidden columns are offered', async () => {
        const api = await createGrid([NAME_COL, { field: 'country', filter: true, hide: true }, NATION_AS_COUNTRY]);

        setModel(api, containsE('country'));
        expectFilter(api, null, ALL_ROWS);

        api.setGridOption('includeHiddenColumnsInAdvancedFilter', true);
        await asyncSetTimeout(0);
        expectFilter(api, containsE('country'), COUNTRY_ROWS);
    });

    test('a condition on a hidden column follows the column as it is shown and hidden again', async () => {
        const api = await createGrid([
            NAME_COL,
            { field: 'country', filter: true, hide: true },
            NATION_AS_COUNTRY,
            OTHER_COL,
        ]);

        setModel(api, containsE('country'));
        expectFilter(api, null, ALL_ROWS);

        api.setColumnsVisible(['country'], true);
        await asyncSetTimeout(0);
        expectFilter(api, containsE('country'), COUNTRY_ROWS);

        api.setColumnsVisible(['country'], false);
        await asyncSetTimeout(0);
        api.setColumnsVisible(['other'], false);
        await asyncSetTimeout(0);
        expectFilter(api, null, ALL_ROWS);
    });

    test('a join naming an unavailable and an available column with the same header is not applied to one column twice', async () => {
        const api = await createGrid([NAME_COL, { field: 'country' }, NATION_AS_COUNTRY]);
        const model: AdvancedFilterModel = {
            filterType: 'join',
            type: 'AND',
            conditions: [containsE('country'), containsE('nation')],
        };

        setModel(api, model);
        expectFilter(api, null, ALL_ROWS);
    });

    test('a join over two available columns sharing a header keeps each colId through a column event', async () => {
        const api = await createGrid([NAME_COL, { field: 'country', filter: true }, NATION_AS_COUNTRY, OTHER_COL]);
        const model: AdvancedFilterModel = {
            filterType: 'join',
            type: 'OR',
            conditions: [
                containsE('nation'),
                { filterType: 'text', colId: 'country', type: 'equals', filter: 'Chile' },
            ],
        };

        setModel(api, model);
        expectFilter(api, model, ['A', 'B', 'C']);

        api.setColumnsVisible(['other'], false);
        await asyncSetTimeout(0);
        expect(api.getAdvancedFilterModel()).toEqual(model);
    });

    test('a condition on one of two available columns sharing a header keeps its colId through a column event', async () => {
        const api = await createGrid([NAME_COL, { field: 'country', filter: true }, NATION_AS_COUNTRY, OTHER_COL]);

        setModel(api, containsE('nation'));
        expectFilter(api, containsE('nation'), NATION_ROWS);

        api.setColumnsVisible(['other'], false);
        await asyncSetTimeout(0);
        expectFilter(api, containsE('nation'), NATION_ROWS);
    });

    test('the applied colId survives a column event after the user submits invalid text', async () => {
        const api = await createGrid([NAME_COL, { field: 'country', filter: true }, NATION_AS_COUNTRY, OTHER_COL]);
        setModel(api, containsE('nation'));

        const harness = AdvancedFilterHarness.get(api);
        await harness.type('[Country] contains');
        await harness.pressKey('Enter');
        await asyncSetTimeout(0);

        api.setColumnsVisible(['other'], false);
        await asyncSetTimeout(0);
        expectFilter(api, containsE('nation'), NATION_ROWS);
    });

    test('a model in initial state on an unavailable column is not applied to the colliding column', async () => {
        const api = await createGrid([NAME_COL, { field: 'country' }, NATION_AS_COUNTRY], {
            initialState: { filter: { advancedFilterModel: containsE('country') } },
        });

        expectFilter(api, null, ALL_ROWS);
    });

    test('a model set before data types are inferred is not applied to the colliding column', async () => {
        const api = await createGrid([NAME_COL, { field: 'country' }, NATION_AS_COUNTRY], { rowData: [] });

        setModel(api, containsE('country'));
        api.setGridOption('rowData', ROW_DATA);
        await asyncSetTimeout(0);
        expectFilter(api, null, ALL_ROWS);
    });

    test('the Server-Side Row Model is not asked to filter the colliding column', async () => {
        const requests: unknown[] = [];
        const api = gridsManager.createGrid(
            'grid',
            {
                rowModelType: 'serverSide',
                columnDefs: [NAME_COL, { field: 'country' }, NATION_AS_COUNTRY],
                enableAdvancedFilter: true,
                initialState: { filter: { advancedFilterModel: containsE('country') } },
                serverSideDatasource: {
                    getRows: (params: IServerSideGetRowsParams) => {
                        requests.push(params.request.filterModel);
                        params.success({ rowData: ROW_DATA, rowCount: ROW_DATA.length });
                    },
                },
            },
            { modules: [ServerSideRowModelModule] }
        );

        await waitFor(() => expect(api.getDisplayedRowCount()).toBe(ROW_DATA.length));
        expect({ model: api.getAdvancedFilterModel(), requests }).toEqual({ model: null, requests: [null] });
    });

    test('text the user applies still resolves its columns by header name', async () => {
        const api = await createGrid([NAME_COL, { field: 'country' }, NATION_AS_COUNTRY]);
        setModel(api, containsE('country'));

        await AdvancedFilterHarness.get(api).applyExpression('[Country] contains "e"');
        await asyncSetTimeout(0);
        expectFilter(api, containsE('nation'), NATION_ROWS);
    });

    test('a dropped condition re-applies once its column is offered, whatever its header', async () => {
        const api = await createGrid([
            NAME_COL,
            { colId: 'c1', field: 'country', headerName: 'Country', filter: true, hide: true },
        ]);

        setModel(api, containsE('c1'));
        expectFilter(api, null, ALL_ROWS);

        api.setColumnsVisible(['c1'], true);
        await asyncSetTimeout(0);
        expectFilter(api, containsE('c1'), COUNTRY_ROWS);
    });

    test('a condition on a column whose header contains a closing bracket round-trips', async () => {
        const api = await createGrid([NAME_COL, { field: 'country', headerName: 'Country [x]', filter: true }]);

        setModel(api, containsE('country'));
        expectFilter(api, containsE('country'), COUNTRY_ROWS);
    });
});
