import { TestGridsManager, asyncSetTimeout } from 'ag-test-utils';

import type { AdvancedFilterModel, ColumnAdvancedFilterModel, GridApi, GridOptions } from 'ag-grid-community';
import {
    BigIntFilterModule,
    ClientSideRowModelModule,
    DateFilterModule,
    NumberFilterModule,
    TextFilterModule,
} from 'ag-grid-community';
import { AdvancedFilterModule } from 'ag-grid-enterprise';

interface TestRow {
    id: number;
    athlete: string | null;
    age: number | string | null;
    date: string | null;
    qty: bigint | string | number | null;
}

const ROW_DATA: TestRow[] = [
    { id: 0, athlete: 'Alpha', age: 1, date: '2008-08-24', qty: 10n },
    { id: 1, athlete: 'alpha beta', age: 2, date: '   ', qty: '10' },
    { id: 2, athlete: '', age: 3, date: null, qty: 10 },
    { id: 3, athlete: '   ', age: null, date: '2020-07-23', qty: null },
    { id: 4, athlete: null, age: 0, date: 'not a date', qty: 'nope' },
    { id: 5, athlete: 'Beta', age: -2, date: '2012-08-05', qty: -5n },
    { id: 6, athlete: 'Gamma', age: '', date: '', qty: '' },
];

const COLUMN_DEFS: GridOptions<TestRow>['columnDefs'] = [
    { field: 'athlete', filter: 'agTextColumnFilter' },
    { field: 'age', filter: 'agNumberColumnFilter' },
    { field: 'date', cellDataType: 'dateString', filter: 'agDateColumnFilter' },
    { field: 'qty', cellDataType: 'bigint', filter: 'agBigIntColumnFilter' },
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
            BigIntFilterModule,
            AdvancedFilterModule,
            ClientSideRowModelModule,
        ],
    });

    afterEach(() => gridsManager.reset());

    /** The rows a column filter shows for `model`, applied to a grid with no Advanced Filter. */
    async function withColumnFilter(colId: string, model: object, columnDefs = COLUMN_DEFS): Promise<number[]> {
        const api = gridsManager.createGrid('columnFilterGrid', { columnDefs, rowData: ROW_DATA });
        await asyncSetTimeout(0);
        await api.setColumnFilterModel(colId, model);
        api.onFilterChanged();
        await asyncSetTimeout(0);
        const ids = getDisplayedIds(api);
        api.destroy();
        return ids;
    }

    /** The rows the Advanced Filter shows for the equivalent condition. */
    async function withAdvancedFilter(model: AdvancedFilterModel, columnDefs = COLUMN_DEFS): Promise<number[]> {
        const api = gridsManager.createGrid('advancedFilterGrid', {
            columnDefs,
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
        const valuedOptions =
            filterType === 'text'
                ? ['contains', 'notContains', 'equals', 'notEqual', 'startsWith', 'endsWith']
                : ['equals', 'notEqual', 'greaterThan', 'greaterThanOrEqual', 'lessThan', 'lessThanOrEqual'];

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

    test('`includeBlanksInNotEqual` admits a blank to `notEqual` in both', async () => {
        const defs = COLUMN_DEFS!.map((def) =>
            (def as { field?: string }).field === 'age'
                ? { ...def, filterParams: { includeBlanksInNotEqual: true } }
                : def
        );
        const columnFilterIds = await withColumnFilter(
            'age',
            { filterType: 'number', type: 'notEqual', filter: 2 },
            defs
        );

        expect(columnFilterIds).toContain(3); // the row with a null age
        expect(columnFilterIds).toContain(6); // and the row with an empty-string age
        expect(
            await withAdvancedFilter({ filterType: 'number', colId: 'age', type: 'notEqual', filter: 2 }, defs)
        ).toEqual(columnFilterIds);
    });

    // Boolean has no column-filter counterpart to compare against — its options are `true`/`false`, not
    // `blank` — so this is the Advanced Filter alone, pinning that it answers blank the way every other type does.
    test('a boolean column answers blank for an empty or whitespace-only value', async () => {
        const defs = [
            { field: 'id' },
            { field: 'active', cellDataType: 'boolean' as const, filter: 'agTextColumnFilter' },
        ];
        const rowData = [
            { id: 0, active: true },
            { id: 1, active: false },
            { id: 2, active: null },
            { id: 3, active: '' },
            { id: 4, active: '   ' },
        ];
        const api = gridsManager.createGrid('booleanGrid', { columnDefs: defs, rowData, enableAdvancedFilter: true });
        await asyncSetTimeout(0);

        api.setAdvancedFilterModel({ filterType: 'boolean', colId: 'active', type: 'blank' });
        api.onFilterChanged();
        await asyncSetTimeout(0);
        expect(getDisplayedIds(api as GridApi<TestRow>)).toEqual([2, 3, 4]);

        api.setAdvancedFilterModel({ filterType: 'boolean', colId: 'active', type: 'notBlank' });
        api.onFilterChanged();
        await asyncSetTimeout(0);
        expect(getDisplayedIds(api as GridApi<TestRow>)).toEqual([0, 1]);
    });

    // The column filter's `isValid(cellValue)` gate keeps an unreadable date out of the comparison; the
    // Advanced Filter has no equivalent and converts before it compares.
    test('an unreadable date compares rather than throwing, in both', async () => {
        expect(await withColumnFilter('date', { filterType: 'date', type: 'equals', dateFrom: '2008-08-24' })).toEqual([
            0,
        ]);
        expect(
            await withAdvancedFilter({
                filterType: 'dateString',
                colId: 'date',
                type: 'equals',
                filter: '2008-08-24',
            })
        ).toEqual([0]);
    });

    // The negated half of the same gate, and the only case in which an unreadable value is a match.
    test('an unreadable date is admitted to `notEqual`, in both', async () => {
        const columnFilterIds = await withColumnFilter('date', {
            filterType: 'date',
            type: 'notEqual',
            dateFrom: '2008-08-24',
        });

        expect(columnFilterIds).toContain(4); // 'not a date' is unreadable
        expect(columnFilterIds).not.toContain(1); // whitespace is blank, not unreadable
        expect(columnFilterIds).not.toContain(2); // and so are null
        expect(columnFilterIds).not.toContain(6); // and the empty string
        expect(
            await withAdvancedFilter({
                filterType: 'dateString',
                colId: 'date',
                type: 'notEqual',
                filter: '2008-08-24',
            })
        ).toEqual(columnFilterIds);
    });
});
