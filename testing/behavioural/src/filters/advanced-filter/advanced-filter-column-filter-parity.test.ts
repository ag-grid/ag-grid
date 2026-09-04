import {
    AdvancedFilterHarness,
    ColumnFilterHarness,
    TestGridsManager,
    asyncSetTimeout,
    installFilterLayoutMock,
    uninstallFilterLayoutMock,
} from 'ag-test-utils';

import type { AdvancedFilterModel, ColumnAdvancedFilterModel, GridApi, GridOptions } from 'ag-grid-community';
import {
    BigIntFilterModule,
    ClientSideRowModelModule,
    DateFilterModule,
    NumberFilterModule,
    TextFilterModule,
    setupAgTestIds,
} from 'ag-grid-community';
import { AdvancedFilterModule, SetFilterModule } from 'ag-grid-enterprise';

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
            SetFilterModule,
            AdvancedFilterModule,
            ClientSideRowModelModule,
        ],
    });

    beforeAll(() => {
        setupAgTestIds();
        installFilterLayoutMock();
    });
    afterAll(() => uninstallFilterLayoutMock());
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

    describe('a Set Filter column', () => {
        const setDefs = COLUMN_DEFS!.map((def) =>
            (def as { field?: string }).field === 'athlete' ? { ...def, filter: 'agSetColumnFilter' } : def
        );

        const advancedModel = (type: 'isAnyOf' | 'isNoneOf', values: (string | null)[]) =>
            ({ filterType: 'set', colId: 'athlete', type, values }) as ColumnAdvancedFilterModel;

        test('`isAnyOf` filters the same rows as the equivalent selection', async () => {
            const selections: Record<string, (string | null)[]> = {
                'one value': ['Alpha'],
                'two values': ['Alpha', 'Beta'],
                'a blank': [null],
                'a blank among values': [null, 'Alpha'],
            };
            const outcomes: Record<string, number[]> = {};
            const expected: Record<string, number[]> = {};

            for (const [name, values] of Object.entries(selections)) {
                const columnFilterIds = await withColumnFilter('athlete', { filterType: 'set', values }, setDefs);
                expectFiltered(columnFilterIds);
                expected[name] = columnFilterIds;
                outcomes[name] = await withAdvancedFilter(advancedModel('isAnyOf', values), setDefs);
            }

            expect(outcomes).toEqual(expected);
        });

        test('`isNoneOf` leaves exactly the rows the selection excludes', async () => {
            const values = ['Alpha', 'Beta'];
            const selected = await withColumnFilter('athlete', { filterType: 'set', values }, setDefs);
            const excluded = await withAdvancedFilter(advancedModel('isNoneOf', values), setDefs);

            expectFiltered(selected);
            expectFiltered(excluded);
            const byId = (a: number, b: number) => a - b;
            expect([...selected, ...excluded].sort(byId)).toEqual(ROW_DATA.map(({ id }) => id).sort(byId));
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
    // `inRange` takes two values rather than one, so it cannot ride on the shared table above.
    describe('inRange', () => {
        test('a number range filters the same rows, exclusive of both ends', async () => {
            const model = { filterType: 'number' as const, type: 'inRange' as const, filter: -1, filterTo: 3 };
            const columnFilterIds = await withColumnFilter('age', model);

            expect(columnFilterIds).not.toContain(2); // age 3 is the excluded upper end
            expectFiltered(columnFilterIds);
            expect(await withAdvancedFilter({ ...model, colId: 'age' })).toEqual(columnFilterIds);
        });

        test('`inRangeInclusive` admits both ends in both', async () => {
            const defs = COLUMN_DEFS!.map((def) =>
                (def as { field?: string }).field === 'age' ? { ...def, filterParams: { inRangeInclusive: true } } : def
            );
            const model = { filterType: 'number' as const, type: 'inRange' as const, filter: -1, filterTo: 3 };
            const columnFilterIds = await withColumnFilter('age', model, defs);

            expect(columnFilterIds).toContain(2); // age 3 is now the included upper end
            expectFiltered(columnFilterIds);
            expect(await withAdvancedFilter({ ...model, colId: 'age' }, defs)).toEqual(columnFilterIds);
        });

        test('`includeBlanksInRange` admits a blank in both', async () => {
            const defs = COLUMN_DEFS!.map((def) =>
                (def as { field?: string }).field === 'age'
                    ? { ...def, filterParams: { includeBlanksInRange: true } }
                    : def
            );
            const model = { filterType: 'number' as const, type: 'inRange' as const, filter: -1, filterTo: 3 };
            const columnFilterIds = await withColumnFilter('age', model, defs);

            expect(columnFilterIds).toContain(3); // the row with a null age
            expect(columnFilterIds).toContain(6); // and the row with an empty-string age
            expectFiltered(columnFilterIds);
            expect(await withAdvancedFilter({ ...model, colId: 'age' }, defs)).toEqual(columnFilterIds);
        });

        // `bigint` reaches `evaluateRangeExpression` through its own parser and converter, not the number one.
        test('a bigint range filters the same rows', async () => {
            const columnFilterIds = await withColumnFilter('qty', {
                filterType: 'bigint',
                type: 'inRange',
                filter: '-6',
                filterTo: '10',
            });

            expectFiltered(columnFilterIds);
            expect(
                await withAdvancedFilter({
                    filterType: 'bigint',
                    colId: 'qty',
                    type: 'inRange',
                    filter: '-6',
                    filterTo: '10',
                })
            ).toEqual(columnFilterIds);
        });

        test('a date range filters the same rows', async () => {
            const columnFilterIds = await withColumnFilter('date', {
                filterType: 'date',
                type: 'inRange',
                dateFrom: '2008-01-01',
                dateTo: '2013-01-01',
            });

            expect(columnFilterIds).not.toContain(3); // 2020 is outside the range
            expectFiltered(columnFilterIds);
            expect(
                await withAdvancedFilter({
                    filterType: 'dateString',
                    colId: 'date',
                    type: 'inRange',
                    filter: '2008-01-01',
                    filterTo: '2013-01-01',
                })
            ).toEqual(columnFilterIds);
        });

        // The two params were proven on `number` above; the date path converts through a different
        // `valueConverter` before it reaches the same comparison.
        test('`inRangeInclusive` and `includeBlanksInRange` behave the same on a date column', async () => {
            const withDateParams = (filterParams: object) =>
                COLUMN_DEFS!.map((def) =>
                    (def as { field?: string }).field === 'date' ? { ...def, filterParams } : def
                );
            const model = {
                filterType: 'date' as const,
                type: 'inRange' as const,
                dateFrom: '2008-08-24',
                dateTo: '2020-07-23',
            };
            const advancedModel = {
                filterType: 'dateString' as const,
                colId: 'date',
                type: 'inRange' as const,
                filter: '2008-08-24',
                filterTo: '2020-07-23',
            };

            const inclusiveDefs = withDateParams({ inRangeInclusive: true });
            const inclusiveIds = await withColumnFilter('date', model, inclusiveDefs);
            expect(inclusiveIds).toContain(0); // 2008-08-24 is now the included lower end
            expectFiltered(inclusiveIds);
            expect(await withAdvancedFilter(advancedModel, inclusiveDefs)).toEqual(inclusiveIds);

            const blanksDefs = withDateParams({ includeBlanksInRange: true });
            const blanksIds = await withColumnFilter('date', model, blanksDefs);
            expect(blanksIds).toContain(2); // the row with a null date
            expectFiltered(blanksIds);
            expect(await withAdvancedFilter(advancedModel, blanksDefs)).toEqual(blanksIds);
        });

        // The one place the two deliberately part company. The ordering rule lives in the column filter's
        // input validation, so a model set through its API bypasses it and applies; the Advanced Filter has
        // only the one route in and rejects there. Asserted rather than omitted, so a change to either side
        // fails here instead of quietly restoring the divergence this file exists to catch.
        test('a reversed date range is rejected by the Advanced Filter where the column filter model applies it', async () => {
            const reversed = { type: 'inRange', filter: '2020-07-23', filterTo: '2008-08-24' };

            const advanced = await withAdvancedFilter({ filterType: 'dateString', colId: 'date', ...reversed });
            const column = await withColumnFilter('date', { filterType: 'date', ...reversed });

            expect(advanced).toEqual([0, 1, 2, 3, 4, 5, 6]); // no filter applied at all
            expect(column).toEqual([]); // applied, and nothing can fall inside it
            expect(advanced).not.toEqual(column);
        });

        // There is no invalid-range wording in the grid: the rule belongs to the column filter, so the
        // Advanced Filter reports it in the column filter's own words, naming the bound the value must clear.
        test("a reversed range is reported in the column filter's own words", async () => {
            const columnDefs: GridOptions<TestRow>['columnDefs'] = [
                { field: 'age', filter: 'agNumberColumnFilter', filterParams: { filterOptions: ['inRange'] } },
            ];

            const columnApi = await gridsManager.createGridAndWait('columnFilterGrid', {
                columnDefs,
                rowData: ROW_DATA,
            });
            const filter = await ColumnFilterHarness.open(columnApi, 'age');
            await filter.setNumber(38, 0);
            await filter.setNumber(21, 1);
            const columnMessage = filter.input('number', 1).validationMessage;

            const advancedApi = gridsManager.createGrid('advancedFilterGrid', {
                columnDefs,
                rowData: ROW_DATA,
                enableAdvancedFilter: true,
            });
            await asyncSetTimeout(0);
            const advanced = AdvancedFilterHarness.get(advancedApi);
            await advanced.applyExpression('[Age] is between (38, 21)');
            await asyncSetTimeout(0);

            expect(columnMessage).toBe('Must be greater than 38');
            expect(advanced.input.validationMessage).toBe(`Expression has an error. ${columnMessage}.`);
        });

        // Bigints are ordered as numbers, where the decimal text the model stores them as would put 9 above 10.
        test('a bigint range is judged on the value, not on the text the model stores', async () => {
            const model = { filterType: 'bigint' as const, colId: 'qty', type: 'inRange' as const };

            expect(await withAdvancedFilter({ ...model, filter: '9', filterTo: '10' })).toEqual([]);
            expect(await withAdvancedFilter({ ...model, filter: '10', filterTo: '9' })).toEqual([0, 1, 2, 3, 4, 5, 6]);
        });
    });
});
