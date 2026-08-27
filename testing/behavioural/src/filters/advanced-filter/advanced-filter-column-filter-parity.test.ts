import { ALL_SEVERITIES, TestGridsManager, asyncSetTimeout } from 'ag-test-utils';

import type { AdvancedFilterModel, ColumnAdvancedFilterModel, GridApi, GridOptions } from 'ag-grid-community';
import {
    ClientSideRowModelModule,
    DateFilterModule,
    NumberFilterModule,
    TextFilterModule,
    enableDevValidations,
} from 'ag-grid-community';
import { AdvancedFilterModule, SetFilterModule } from 'ag-grid-enterprise';

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

/** Ignores the time of day, which is the whole reason a column supplies its own comparator. */
function byCalendarDay(filterDate: Date, cellValue: Date): number {
    const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
    const cellDay = startOfDay(cellValue);
    const filterDay = startOfDay(filterDate);
    if (cellDay === filterDay) {
        return 0;
    }
    return cellDay > filterDay ? 1 : -1;
}

/** Every fixture row carries an `id`, which is what a parity assertion compares. */
type IdRow = { id: number };

function getDisplayedIds(api: GridApi<any>): number[] {
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

    afterEach(() => {
        gridsManager.reset();
        vi.restoreAllMocks();
    });

    /** The rows a column filter shows for `model`, applied to a grid with no Advanced Filter. */
    async function withColumnFilter(
        colId: string,
        model: object,
        columnDefs: GridOptions<any>['columnDefs'] = COLUMN_DEFS,
        rowData: IdRow[] = ROW_DATA
    ): Promise<number[]> {
        const api = gridsManager.createGrid<any>('columnFilterGrid', { columnDefs, rowData });
        await asyncSetTimeout(0);
        await api.setColumnFilterModel(colId, model);
        api.onFilterChanged();
        await asyncSetTimeout(0);
        const ids = getDisplayedIds(api);
        api.destroy();
        return ids;
    }

    /** The rows the Advanced Filter shows for the equivalent condition. */
    async function withAdvancedFilter(
        model: AdvancedFilterModel,
        columnDefs: GridOptions<any>['columnDefs'] = COLUMN_DEFS,
        rowData: IdRow[] = ROW_DATA
    ): Promise<number[]> {
        const api = gridsManager.createGrid<any>('advancedFilterGrid', {
            columnDefs,
            rowData,
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
        const columnFilterIds = await withColumnFilter('age', { filterType: 'number', type: 'notEqual', filter: 2 });

        expect(columnFilterIds).toContain(3); // the row with a null age
        expect(await withAdvancedFilter({ filterType: 'number', colId: 'age', type: 'notEqual', filter: 2 })).toEqual(
            columnFilterIds
        );
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

        expect(columnFilterIds).toContain(1); // whitespace
        expect(columnFilterIds).toContain(4); // 'not a date'
        expect(columnFilterIds).not.toContain(2); // null is blank, not unreadable
        expect(
            await withAdvancedFilter({
                filterType: 'dateString',
                colId: 'date',
                type: 'notEqual',
                filter: '2008-08-24',
            })
        ).toEqual(columnFilterIds);
    });

    // An option the column's filter cannot evaluate is dropped from its list when the colDef is read, so a
    // model naming it names an option the column does not offer. Neither engine applies such a model.
    test('a model naming a key the column cannot evaluate is cleared in both', async () => {
        enableDevValidations({ throwOn: ALL_SEVERITIES, suppress: [76] });
        vi.spyOn(console, 'warn').mockImplementation(() => {});
        const columnDefs: GridOptions<TestRow>['columnDefs'] = [
            { field: 'age', filter: 'agNumberColumnFilter', filterParams: { filterOptions: ['equals', 'contains'] } },
        ];
        const model = { filterType: 'number' as const, type: 'contains', filter: 2 };
        const columnFilterIds = await withColumnFilter('age', model, columnDefs);

        // Nothing is filtered, rather than everything being filtered out.
        expect(columnFilterIds).toEqual([0, 1, 2, 3, 4, 5]);
        // Asserted deliberately outside the model type: `contains` is not a number filter's option.
        expect(await withAdvancedFilter({ ...model, colId: 'age' } as ColumnAdvancedFilterModel, columnDefs)).toEqual(
            columnFilterIds
        );
    });

    // A join is asserted as a whole, so one condition naming an option the column does not offer makes the
    // whole model unofferable: neither engine applies half of what was asked for.
    test('a combined model naming a key the column cannot evaluate is cleared whole in both', async () => {
        enableDevValidations({ throwOn: ALL_SEVERITIES, suppress: [76] });
        vi.spyOn(console, 'warn').mockImplementation(() => {});
        const columnDefs: GridOptions<TestRow>['columnDefs'] = [
            {
                field: 'age',
                filter: 'agNumberColumnFilter',
                filterParams: { filterOptions: ['equals', 'contains'], maxNumConditions: 2 },
            },
        ];

        const columnFilterIds = await withColumnFilter(
            'age',
            {
                filterType: 'number',
                operator: 'OR',
                conditions: [
                    { filterType: 'number', type: 'contains', filter: 2 },
                    { filterType: 'number', type: 'equals', filter: 3 },
                ],
            },
            columnDefs
        );

        // Not `[2]`: the offered half is not applied on its own.
        expect(columnFilterIds).toEqual([0, 1, 2, 3, 4, 5]);
        expect(
            await withAdvancedFilter(
                {
                    filterType: 'join',
                    type: 'OR',
                    conditions: [
                        { filterType: 'number', colId: 'age', type: 'contains', filter: 2 },
                        { filterType: 'number', colId: 'age', type: 'equals', filter: 3 },
                    ],
                } as AdvancedFilterModel,
                columnDefs
            )
        ).toEqual(columnFilterIds);
    });

    // Blankness is a property of the value, so a whitespace date is blank even though nothing can read it
    // as a date: the same answer either filter's `blank` gives, and the same one the Set Filter gives.
    test('a whitespace `dateString` is blank to both', async () => {
        const columnFilterIds = await withColumnFilter('date', { filterType: 'date', type: 'blank' });

        expect(columnFilterIds).toEqual([1, 2]);
        expect(await withAdvancedFilter({ filterType: 'dateString', colId: 'date', type: 'blank' })).toEqual(
            columnFilterIds
        );
    });

    /** Text-column parity, each case driven by a `filterParams` that decides the column filter's matching. */
    describe.each([
        {
            name: 'a `textMatcher` decides the matching',
            filterParams: {
                // Word-boundary matching: only a whitespace-delimited token counts, so `car` misses `carpet`.
                textMatcher: ({ value, filterText }: { value: string; filterText: string | null }) =>
                    filterText != null && value.split(' ').includes(filterText),
            },
            operand: 'car',
            expected: [0],
        },
        {
            name: 'a `textFormatter` normalises both sides',
            filterParams: {
                textFormatter: (from: string) =>
                    from
                        .normalize('NFD')
                        .replace(/\p{Diacritic}/gu, '')
                        .toLowerCase(),
            },
            operand: 'cafe',
            expected: [1, 2],
        },
    ])('$name, in both', ({ filterParams, operand, expected }) => {
        const columnDefs: GridOptions['columnDefs'] = [
            { field: 'name', filter: 'agTextColumnFilter', filterParams: { ...filterParams, maxNumConditions: 1 } },
        ];
        const rowData = [
            { id: 0, name: 'red car' },
            { id: 1, name: 'Café' },
            { id: 2, name: 'cafe' },
            { id: 3, name: 'carpet' },
        ];

        test('same rows', async () => {
            const columnFilterIds = await withColumnFilter(
                'name',
                { filterType: 'text', type: 'contains', filter: operand },
                columnDefs,
                rowData
            );

            expect(columnFilterIds).toEqual(expected);
            expect(
                await withAdvancedFilter(
                    { filterType: 'text', colId: 'name', type: 'contains', filter: operand },
                    columnDefs,
                    rowData
                )
            ).toEqual(columnFilterIds);
        });
    });

    // The column filter trims what was typed into the model it applies; the Advanced Filter's operand is
    // itself what was typed, so `trimInput` has to be honoured at the comparison instead.
    test('`trimInput` trims the operand the expression carries', async () => {
        const rowData = [
            { id: 0, name: 'red car' },
            { id: 1, name: 'carpet' },
        ];
        const model: AdvancedFilterModel = {
            filterType: 'text',
            colId: 'name',
            type: 'startsWith',
            filter: '  car ',
        };

        expect(
            await withAdvancedFilter(
                model,
                [{ field: 'name', filter: 'agTextColumnFilter', filterParams: { trimInput: true } }],
                rowData
            )
        ).toEqual([1]);

        // The control: without it the spaces are part of the value to look for, so nothing starts with them.
        expect(await withAdvancedFilter(model, [{ field: 'name', filter: 'agTextColumnFilter' }], rowData)).toEqual([]);
    });

    // A column whose values carry a time can only be compared by day through its own `comparator`, so the
    // filter that ignores it answers a different question from the one that does not.
    test('a `comparator` decides the comparison in both', async () => {
        const columnDefs: GridOptions['columnDefs'] = [
            {
                field: 'when',
                cellDataType: 'date',
                filter: 'agDateColumnFilter',
                filterParams: { comparator: byCalendarDay },
            },
        ];
        const rowData = [
            { id: 0, when: new Date('2008-08-24T13:45:00') },
            { id: 1, when: new Date('2012-08-05T09:00:00') },
        ];

        const columnFilterIds = await withColumnFilter(
            'when',
            { filterType: 'date', type: 'equals', dateFrom: '2008-08-24' },
            columnDefs,
            rowData
        );

        expect(columnFilterIds).toEqual([0]);
        expect(
            await withAdvancedFilter(
                { filterType: 'date', colId: 'when', type: 'equals', filter: '2008-08-24' },
                columnDefs,
                rowData
            )
        ).toEqual(columnFilterIds);
    });

    // The gate the column filter holds a comparison to, on the value it hands it: a date column's own
    // `isValidDate` decides what can be compared at all, before any comparison is asked for.
    test('a user `isValidDate` decides what can be compared in both', async () => {
        const columnDefs: GridOptions['columnDefs'] = [
            {
                field: 'when',
                cellDataType: 'date',
                filter: 'agDateColumnFilter',
                // Anything before 2010 is not a date this column will compare.
                filterParams: { isValidDate: (value: any) => value instanceof Date && value.getFullYear() >= 2010 },
            },
        ];
        const rowData = [
            { id: 0, when: new Date('2008-08-24T13:45:00') },
            { id: 1, when: new Date('2012-08-05T09:00:00') },
        ];

        const columnFilterIds = await withColumnFilter(
            'when',
            { filterType: 'date', type: 'greaterThan', dateFrom: '2000-01-01' },
            columnDefs,
            rowData
        );

        // The 2008 row is after the operand, so only the gate can keep it out.
        expect(columnFilterIds).toEqual([1]);
        expect(
            await withAdvancedFilter(
                { filterType: 'date', colId: 'when', type: 'greaterThan', filter: '2000-01-01' },
                columnDefs,
                rowData
            )
        ).toEqual(columnFilterIds);
    });

    // The dotted and dotless I are one letter to `toLowerCase` and two to `toLocaleLowerCase`, so which rows
    // match depends on the host locale. Which engine matches them must not: asserted against each other only.
    test('the dotted and dotless I fold the same way in both', async () => {
        const columnDefs: GridOptions['columnDefs'] = [{ field: 'name', filter: 'agTextColumnFilter' }];
        const rowData = [
            { id: 0, name: 'IRMAK' },
            { id: 1, name: 'ırmak' },
            { id: 2, name: 'irmak' },
        ];

        const columnFilterIds = await withColumnFilter(
            'name',
            { filterType: 'text', type: 'equals', filter: 'irmak' },
            columnDefs,
            rowData
        );

        // The exactly-typed row matches under either folding; the other two are what the locale decides.
        expect(columnFilterIds).toContain(2);
        expect(
            await withAdvancedFilter(
                { filterType: 'text', colId: 'name', type: 'equals', filter: 'irmak' },
                columnDefs,
                rowData
            )
        ).toEqual(columnFilterIds);
    });

    /**
     * Whitespace reaches `blank` on both sides, where nothing rejects it first, including on a boolean column,
     * whose own list omitted the two keys and whose filter has no comparison to gate them with.
     */
    describe.each([
        { cellDataType: 'number', present: 1, columnFilterType: 'number', advancedFilterType: 'number' } as const,
        { cellDataType: 'boolean', present: true, columnFilterType: 'text', advancedFilterType: 'boolean' } as const,
    ])(
        'a whitespace value on a $cellDataType column',
        ({ cellDataType, present, columnFilterType, advancedFilterType }) => {
            const columnDefs: GridOptions['columnDefs'] = [{ field: 'value', cellDataType, filter: true }];
            const rowData = [
                { id: 0, value: present },
                { id: 1, value: '   ' },
                { id: 2, value: null },
            ];

            test.each([
                { type: 'blank' as const, expected: [1, 2] },
                { type: 'notBlank' as const, expected: [0] },
            ])('is `$type` to both', async ({ type, expected }) => {
                const columnFilterIds = await withColumnFilter(
                    'value',
                    { filterType: columnFilterType, type },
                    columnDefs,
                    rowData
                );

                expect(columnFilterIds).toEqual(expected);
                expect(
                    await withAdvancedFilter(
                        { filterType: advancedFilterType, colId: 'value', type },
                        columnDefs,
                        rowData
                    )
                ).toEqual(columnFilterIds);
            });
        }
    );
});

describe('Advanced Filter and a Set Filter column', () => {
    const gridsManager = new TestGridsManager({
        modules: [SetFilterModule, AdvancedFilterModule, ClientSideRowModelModule],
    });

    afterEach(() => gridsManager.reset());

    // `comparator` means "sort the values list" to a Set Filter and "compare against the operand" to a scalar
    // one, so only the column whose own filter means the latter may have it read as a comparison. The number
    // data type supplies the Set Filter one itself, so the default column is the case that has to hold.
    test.each([
        { name: 'the data type supplies', filterParams: undefined },
        // Ascending, as a values list is sorted: `(a, b)` are two cell values, never an operand.
        { name: 'the column supplies', filterParams: { comparator: (a: number, b: number) => a - b } },
    ])('a Set Filter sorting `comparator` $name is not read as the comparison', async ({ filterParams }) => {
        const api = gridsManager.createGrid('setComparatorAdvanced', {
            columnDefs: [{ field: 'age', filter: true, filterParams }],
            rowData: ROW_DATA,
            enableAdvancedFilter: true,
        });
        await asyncSetTimeout(0);
        api.setAdvancedFilterModel({ filterType: 'number', colId: 'age', type: 'greaterThan', filter: 1 });
        api.onFilterChanged();
        await asyncSetTimeout(0);
        expect(getDisplayedIds(api)).toEqual([1, 2]);
        api.destroy();
    });
});
