import { TestGridsManager, asyncSetTimeout } from 'ag-test-utils';

import type { AdvancedFilterModel, ColumnAdvancedFilterModel, GridApi, GridOptions } from 'ag-grid-community';
import { ClientSideRowModelModule, DateFilterModule, NumberFilterModule, TextFilterModule } from 'ag-grid-community';
import { AdvancedFilterModule } from 'ag-grid-enterprise';

interface TestRow {
    id: number;
    athlete: string | null;
    age: number | null;
    date: string | null;
}

const ROW_DATA: TestRow[] = [
    { id: 0, athlete: 'Alpha', age: 1, date: '2008-08-24' },
    { id: 1, athlete: 'alpha beta', age: 2, date: '   ' },
    { id: 2, athlete: '', age: 3, date: null },
    { id: 3, athlete: '   ', age: null, date: '2020-07-23' },
    { id: 4, athlete: null, age: 0, date: 'not a date' },
    { id: 5, athlete: 'Beta', age: -2, date: '2012-08-05' },
];

const COLUMN_DEFS: GridOptions<TestRow>['columnDefs'] = [
    { field: 'athlete', filter: 'agTextColumnFilter' },
    { field: 'age', filter: 'agNumberColumnFilter', filterParams: { includeBlanksInNotEqual: true } },
    { field: 'date', cellDataType: 'dateString', filter: 'agDateColumnFilter' },
];

function getDisplayedIds(api: GridApi<TestRow>): number[] {
    const result: number[] = [];
    for (let i = 0; i < api.getDisplayedRowCount(); i++) {
        result.push(api.getDisplayedRowAtIndex(i)!.data!.id);
    }
    return result;
}

describe('Advanced Filter matches the column filter', () => {
    const gridsManager = new TestGridsManager({
        modules: [
            TextFilterModule,
            NumberFilterModule,
            DateFilterModule,
            AdvancedFilterModule,
            ClientSideRowModelModule,
        ],
    });

    afterEach(() => gridsManager.reset());

    /** The rows a column filter shows for `model`, applied to a grid with no Advanced Filter. */
    async function withColumnFilter(colId: string, model: object): Promise<number[]> {
        const api = gridsManager.createGrid('columnFilterGrid', { columnDefs: COLUMN_DEFS, rowData: ROW_DATA });
        await asyncSetTimeout(0);
        await api.setColumnFilterModel(colId, model);
        api.onFilterChanged();
        await asyncSetTimeout(0);
        const ids = getDisplayedIds(api);
        api.destroy();
        return ids;
    }

    /** The rows the Advanced Filter shows for the equivalent condition. */
    async function withAdvancedFilter(model: AdvancedFilterModel): Promise<number[]> {
        const api = gridsManager.createGrid('advancedFilterGrid', {
            columnDefs: COLUMN_DEFS,
            rowData: ROW_DATA,
            enableAdvancedFilter: true,
        });
        await asyncSetTimeout(0);
        api.setAdvancedFilterModel(model);
        api.onFilterChanged();
        await asyncSetTimeout(0);
        const ids = getDisplayedIds(api);
        api.destroy();
        return ids;
    }

    /** Anchors the comparison: were either side to stop filtering, both would return every row and agree. */
    function expectFiltered(ids: number[]): void {
        expect(ids.length).toBeGreaterThan(0);
        expect(ids.length).toBeLessThan(ROW_DATA.length);
    }

    /**
     * The harness that keeps the two filters honest: every built-in option, evaluated by both against the same
     * rows. A future change that makes one of them mean something different fails here.
     */
    describe.each([
        { colId: 'athlete', filterType: 'text' as const, filter: 'alpha' },
        { colId: 'age', filterType: 'number' as const, filter: 2 },
    ])('$colId', ({ colId, filterType, filter }) => {
        // A number column's `notEqual` is not at parity: the Advanced Filter admits blanks to it by
        // `includeBlanksInEquals`, where the column filter reads `includeBlanksInNotEqual`.
        const valuedOptions =
            filterType === 'text'
                ? ['contains', 'notContains', 'equals', 'notEqual', 'startsWith', 'endsWith']
                : ['equals', 'greaterThan', 'greaterThanOrEqual', 'lessThan', 'lessThanOrEqual'];

        test.each(valuedOptions)('`%s` filters the same rows', async (type) => {
            const columnFilterIds = await withColumnFilter(colId, { filterType, type, filter });
            const advancedFilterIds = await withAdvancedFilter({
                filterType,
                colId,
                type,
                filter,
            } as ColumnAdvancedFilterModel);

            expectFiltered(columnFilterIds);
            expect(advancedFilterIds).toEqual(columnFilterIds);
        });

        test.each(['blank', 'notBlank'])('`%s` filters the same rows', async (type) => {
            const columnFilterIds = await withColumnFilter(colId, { filterType, type });
            const advancedFilterIds = await withAdvancedFilter({
                filterType,
                colId,
                type,
            } as ColumnAdvancedFilterModel);

            expectFiltered(columnFilterIds);
            expect(advancedFilterIds).toEqual(columnFilterIds);
        });
    });

    // A whitespace date is rejected as an invalid date before either filter asks whether it is blank, so
    // `isBlank`'s treatment of whitespace never reaches it. Pinned because it is the surprise.
    test('a whitespace `dateString` is not blank to either', async () => {
        const columnFilterIds = await withColumnFilter('date', { filterType: 'date', type: 'blank' });

        expect(columnFilterIds).toEqual([2]);
        expect(await withAdvancedFilter({ filterType: 'dateString', colId: 'date', type: 'blank' })).toEqual(
            columnFilterIds
        );
    });
});
