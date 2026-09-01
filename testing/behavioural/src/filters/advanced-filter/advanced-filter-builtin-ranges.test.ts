import { _serialiseDate } from 'ag-stack';
import {
    AdvancedFilterBuilderHarness,
    AdvancedFilterHarness,
    FilterDom,
    TestGridsManager,
    asyncSetTimeout,
    installFilterLayoutMock,
    uninstallFilterLayoutMock,
} from 'ag-test-utils';

import type { GridApi, GridOptions } from 'ag-grid-community';
import {
    ClientSideRowModelModule,
    DateFilterModule,
    LocaleModule,
    NumberFilterModule,
    TextFilterModule,
    ValidationModule,
} from 'ag-grid-community';
import { AdvancedFilterModule } from 'ag-grid-enterprise';

/**
 * The Date and Number filters' built-in `inRange` and relative date options in the Advanced Filter: which of
 * them a column offers, their expression grammar, the Builder, the model round-trip, and evaluation matching
 * the equivalent column filter.
 */
interface TestRow {
    id: number;
    age: number | null;
    day: string | null;
}

/** Built from the current date, since a relative option means whatever it means when it is evaluated. */
function isoDaysFromToday(offset: number): string {
    const date = new Date();
    date.setDate(date.getDate() + offset);
    return _serialiseDate(date, false)!;
}

const TODAY = isoDaysFromToday(0);
const YESTERDAY = isoDaysFromToday(-1);
const TOMORROW = isoDaysFromToday(1);
const LONG_AGO = isoDaysFromToday(-400);

const ROW_DATA: TestRow[] = [
    { id: 0, age: 21, day: TODAY },
    { id: 1, age: 30, day: YESTERDAY },
    { id: 2, age: 38, day: LONG_AGO },
    { id: 3, age: null, day: null },
];

const SCALAR_OPERATORS = ['=', '!=', '>', '>=', '<', '<=', 'is between', 'is blank', 'is not blank'];

/** Every relative date option, against the Advanced Filter's own label for it — not the Date Filter's. */
const PRESET_LABELS: Record<string, string> = {
    yesterday: 'is yesterday',
    today: 'is today',
    tomorrow: 'is tomorrow',
    last7Days: 'is in last 7 days',
    lastWeek: 'is in last week',
    thisWeek: 'is in this week',
    nextWeek: 'is in next week',
    last30Days: 'is in last 30 days',
    lastMonth: 'is in last month',
    thisMonth: 'is in this month',
    nextMonth: 'is in next month',
    last90Days: 'is in last 90 days',
    lastQuarter: 'is in last quarter',
    thisQuarter: 'is in this quarter',
    nextQuarter: 'is in next quarter',
    lastYear: 'is in last year',
    thisYear: 'is in this year',
    yearToDate: 'is in year to date',
    nextYear: 'is in next year',
    last6Months: 'is in last 6 months',
    last12Months: 'is in last 12 months',
    last24Months: 'is in last 24 months',
};

function opts(dateFilterOptions?: string[]): GridOptions<TestRow> {
    return {
        columnDefs: [
            { field: 'age', filter: 'agNumberColumnFilter' },
            {
                field: 'day',
                cellDataType: 'dateString',
                filter: 'agDateColumnFilter',
                filterParams: dateFilterOptions ? { filterOptions: dateFilterOptions } : undefined,
            },
        ],
        rowData: ROW_DATA,
        enableAdvancedFilter: true,
    };
}

function getDisplayedIds(api: GridApi<TestRow>): number[] {
    const result: number[] = [];
    for (let i = 0, len = api.getDisplayedRowCount(); i < len; i++) {
        result.push(api.getDisplayedRowAtIndex(i)!.data!.id);
    }
    return result;
}

describe('Advanced Filter - built-in range and relative date options', () => {
    const gridsManager = new TestGridsManager({
        modules: [
            TextFilterModule,
            NumberFilterModule,
            DateFilterModule,
            LocaleModule,
            ValidationModule,
            AdvancedFilterModule,
            ClientSideRowModelModule,
        ],
    });

    beforeAll(() => installFilterLayoutMock());
    afterAll(() => uninstallFilterLayoutMock());
    afterEach(() => gridsManager.reset());

    describe('is between', () => {
        test('is offered above `is blank` for a number and a date column alike', async () => {
            const api = await gridsManager.createGridAndWait('grid1', opts());
            const af = AdvancedFilterHarness.get(api);

            await af.type('[Age] ');
            expect(af.autocompleteEntries()).toEqual(SCALAR_OPERATORS);

            await af.type('[Day] ');
            expect(af.autocompleteEntries()).toEqual(SCALAR_OPERATORS);
        });

        // Numbers are written bare and dates quoted, as they are for every other option of their type.
        test('a number pair is written unquoted, and both bounds are exclusive', async () => {
            const api = await gridsManager.createGridAndWait('grid1', opts());

            await AdvancedFilterHarness.get(api).applyExpression('[Age] is between (21, 38)');
            await asyncSetTimeout(0);

            await new FilterDom(api, 'number between').checkFilterDom(`
                ADVANCED FILTER
                input: "[Age] is between (21, 38)"
                valid: true
                buttons: Apply ⊘ | Builder
                model:
                  filterType: "number"
                  colId: "age"
                  type: "inRange"
                  filter: 21
                  filterTo: 38
            `);
            // Both bounds name a row, and only the row between them survives.
            expect(getDisplayedIds(api)).toEqual([1]);
        });

        // The same claim on the date path, which converts through a different `valueConverter`.
        test('a date pair is written quoted, and both bounds are exclusive', async () => {
            const api = await gridsManager.createGridAndWait('grid1', opts());

            await AdvancedFilterHarness.get(api).applyExpression(`[Day] is between ("${LONG_AGO}", "${TODAY}")`);
            await asyncSetTimeout(0);

            expect(api.getAdvancedFilterModel()).toEqual({
                filterType: 'dateString',
                colId: 'day',
                type: 'inRange',
                filter: LONG_AGO,
                filterTo: TODAY,
            });
            expect(getDisplayedIds(api)).toEqual([1]);
        });

        // No ordering validation is required, so a reversed pair applies and simply matches nothing.
        test('a reversed pair is accepted and matches no row', async () => {
            const api = await gridsManager.createGridAndWait('grid1', opts());

            await AdvancedFilterHarness.get(api).applyExpression('[Age] is between (38, 21)');
            await asyncSetTimeout(0);

            expect(api.getAdvancedFilterModel()).toEqual({
                filterType: 'number',
                colId: 'age',
                type: 'inRange',
                filter: 38,
                filterTo: 21,
            });
            expect(getDisplayedIds(api)).toEqual([]);
        });

        // `inRange` is the first built-in option taking two values, so a model carrying only one is a
        // plausible API call. It must leave the grid unfiltered rather than filtering every row out.
        test('a model missing its second value is rejected rather than filtering every row out', async () => {
            const api = await gridsManager.createGridAndWait('grid1', opts());

            api.setAdvancedFilterModel({ filterType: 'number', colId: 'age', type: 'inRange', filter: 21 });
            api.onFilterChanged();
            await asyncSetTimeout(0);

            await new FilterDom(api, 'half a range').checkFilterDom(`
                ADVANCED FILTER
                input: "[Age] is between (21, )"
                valid: false — Expression has an error. Value is missing - (21, ).
                buttons: Apply ⊘ | Builder
                model: null
            `);
            expect(getDisplayedIds(api)).toEqual([0, 1, 2, 3]);
        });

        // Two pills both called "Value" are indistinguishable to a screen reader, so the pair takes the
        // column filter's own from/to labels.
        test('selecting it in the Builder shows two value inputs, labelled from and to', async () => {
            const api = await gridsManager.createGridAndWait('grid1', opts());
            api.setAdvancedFilterModel({ filterType: 'number', colId: 'age', type: 'equals', filter: 21 });
            api.onFilterChanged();
            await asyncSetTimeout(0);

            const builder = await AdvancedFilterBuilderHarness.open(api);
            const [condition] = await builder.conditionItems();
            expect(await builder.operatorOptions(condition)).toEqual(SCALAR_OPERATORS);
            expect(builder.valuePills(condition)).toHaveLength(1);
            expect(builder.valuePills(condition)[0].getAttribute('aria-label')).toBe('Value');

            await builder.selectOperator(condition, 'is between');
            expect(builder.valuePills(condition)).toHaveLength(2);
            expect(builder.valuePills(condition).map((pill) => pill.getAttribute('aria-label'))).toEqual([
                'Filter from value',
                'Filter to value',
            ]);

            await builder.setValue(condition, '21', 0);
            await builder.setValue(condition, '38', 1);
            await builder.apply();
            await asyncSetTimeout(0);

            expect(api.getAdvancedFilterModel()).toEqual({
                filterType: 'number',
                colId: 'age',
                type: 'inRange',
                filter: 21,
                filterTo: 38,
            });
            expect(getDisplayedIds(api)).toEqual([1]);
        });

        test('a saved model restores the expression, the rows and both Builder pills', async () => {
            const api = await gridsManager.createGridAndWait('grid1', opts());

            api.setAdvancedFilterModel({
                filterType: 'number',
                colId: 'age',
                type: 'inRange',
                filter: 21,
                filterTo: 38,
            });
            api.onFilterChanged();
            await asyncSetTimeout(0);

            expect(AdvancedFilterHarness.get(api).value).toBe('[Age] is between (21, 38)');
            expect(getDisplayedIds(api)).toEqual([1]);

            const builder = await AdvancedFilterBuilderHarness.open(api);
            const [condition] = await builder.conditionItems();
            expect(builder.valuePills(condition)).toHaveLength(2);
            expect([builder.valuePillText(condition, 0), builder.valuePillText(condition, 1)]).toEqual(['21', '38']);
        });
    });

    describe('relative date options', () => {
        test('none is offered where the column names none', async () => {
            const api = await gridsManager.createGridAndWait('grid1', opts());
            const af = AdvancedFilterHarness.get(api);

            await af.type('[Day] ');
            expect(af.autocompleteEntries()).toEqual(SCALAR_OPERATORS);
        });

        // Listed against the canonical order rather than with it: `today` precedes `last7Days` in
        // `PRESET_DATE_FILTER_TYPES`, so a dropdown built from that order would come back reversed.
        test('the ones the column names are offered, in the order it lists them', async () => {
            const api = await gridsManager.createGridAndWait('grid1', opts(['last7Days', 'today', 'equals']));
            const af = AdvancedFilterHarness.get(api);

            await af.type('[Day] ');
            expect(af.autocompleteEntries()).toEqual(['is in last 7 days', 'is today', '=']);
        });

        test('every one is written as its own phrase, and read back as the option key', async () => {
            const api = await gridsManager.createGridAndWait('grid1', opts(Object.keys(PRESET_LABELS)));
            const af = AdvancedFilterHarness.get(api);

            const written: string[] = [];
            for (const key of Object.keys(PRESET_LABELS)) {
                api.setAdvancedFilterModel({ filterType: 'dateString', colId: 'day', type: key });
                api.onFilterChanged();
                await asyncSetTimeout(0);
                written.push(af.value);
            }
            expect(written).toEqual(Object.values(PRESET_LABELS).map((label) => `[Day] ${label}`));

            // And back the other way: the phrase is what an expression spells, and it resolves to the key.
            await af.applyExpression('[Day] is in year to date');
            await asyncSetTimeout(0);
            expect(api.getAdvancedFilterModel()).toEqual({
                filterType: 'dateString',
                colId: 'day',
                type: 'yearToDate',
            });
        });

        // Each takes no value, so it can never be a bound of `is between`. A span of consecutive ones is
        // written as a join of them instead, and stays relative where a pair of dates would not.
        test('a span is written by joining them, since none can be a range bound', async () => {
            const api = await gridsManager.createGridAndWait('grid1', {
                ...opts(['yesterday', 'today', 'tomorrow']),
                rowData: [
                    { id: 0, age: 21, day: YESTERDAY },
                    { id: 1, age: 30, day: TODAY },
                    { id: 2, age: 38, day: TOMORROW },
                    { id: 3, age: 44, day: LONG_AGO },
                ],
            });
            const af = AdvancedFilterHarness.get(api);

            // Named where a value belongs, it is a date that does not parse rather than the range it names.
            await af.applyExpression('[Day] is between ("is yesterday", "is tomorrow")');
            await asyncSetTimeout(0);
            await new FilterDom(api, 'a preset named as a bound').checkFilterDom(`
                ADVANCED FILTER
                input: "[Day] is between ("is yesterday", "is tomorrow")"
                valid: false — Expression has an error. Value is not a valid date - "is yesterday".
                buttons: Apply ⊘ | Builder
                model: null
            `);
            expect(getDisplayedIds(api)).toEqual([0, 1, 2, 3]);

            // Joined instead, the span stays relative where a pair of written dates would not.
            await af.applyExpression('[Day] is yesterday OR [Day] is today OR [Day] is tomorrow');
            await asyncSetTimeout(0);
            expect(api.getAdvancedFilterModel()).toEqual({
                filterType: 'join',
                type: 'OR',
                conditions: [
                    { filterType: 'dateString', colId: 'day', type: 'yesterday' },
                    { filterType: 'dateString', colId: 'day', type: 'today' },
                    { filterType: 'dateString', colId: 'day', type: 'tomorrow' },
                ],
            });
            expect(getDisplayedIds(api)).toEqual([0, 1, 2]);
        });

        // The configuration the reporters filed against `inRange`, which threw before it was an operator.
        test('the reported `inRange` configuration opens the dropdown and offers it', async () => {
            const api = await gridsManager.createGridAndWait('grid1', opts(['equals', 'inRange']));
            const af = AdvancedFilterHarness.get(api);

            await af.type('[Day] ');
            expect(af.isAutocompleteOpen()).toBe(true);
            expect(af.autocompleteEntries()).toEqual(['=', 'is between']);
        });

        // And the one filed against the relative options.
        test('the reported preset configuration opens the dropdown and offers both presets', async () => {
            const api = await gridsManager.createGridAndWait('grid1', opts(['equals', 'thisYear', 'lastYear']));
            const af = AdvancedFilterHarness.get(api);

            await af.type('[Day] ');
            expect(af.isAutocompleteOpen()).toBe(true);
            expect(af.autocompleteEntries()).toEqual(['=', 'is in this year', 'is in last year']);
        });

        // The option is stored as its key and stays relative, so a model restored on another day means
        // that day rather than the one it was saved on.
        test('one takes no value, and filters as the equivalent column filter does', async () => {
            const api = await gridsManager.createGridAndWait('grid1', opts(['today', 'last7Days']));

            await AdvancedFilterHarness.get(api).applyExpression('[Day] is in last 7 days');
            await asyncSetTimeout(0);

            await new FilterDom(api, 'relative date applied').checkFilterDom(`
                ADVANCED FILTER
                input: "[Day] is in last 7 days"
                valid: true
                buttons: Apply ⊘ | Builder
                model:
                  filterType: "dateString"
                  colId: "day"
                  type: "last7Days"
            `);
            // The blank row is not in the range either, as it is in no range in the column filter.
            const advancedIds = getDisplayedIds(api);
            expect(advancedIds).toEqual([0, 1]);

            // The parity suite's fixtures are fixed dates, which no relative option can match, so the
            // comparison is built here against a grid with no Advanced Filter.
            const columnApi: GridApi<TestRow> = await gridsManager.createGridAndWait('grid2', {
                columnDefs: opts(['today', 'last7Days']).columnDefs,
                rowData: ROW_DATA,
            });
            await columnApi.setColumnFilterModel('day', { filterType: 'date', type: 'last7Days' });
            columnApi.onFilterChanged();
            await asyncSetTimeout(0);
            const columnIds = getDisplayedIds(columnApi);

            // Anchored: were either side to stop filtering, both would show every row and agree.
            expect(columnIds.length).toBeGreaterThan(0);
            expect(columnIds.length).toBeLessThan(ROW_DATA.length);
            expect(advancedIds).toEqual(columnIds);
        });

        test('a saved model restores the expression and the Builder row', async () => {
            const api = await gridsManager.createGridAndWait('grid1', opts(['today', 'last7Days']));

            api.setAdvancedFilterModel({ filterType: 'dateString', colId: 'day', type: 'today' });
            api.onFilterChanged();
            await asyncSetTimeout(0);

            expect(AdvancedFilterHarness.get(api).value).toBe('[Day] is today');
            expect(getDisplayedIds(api)).toEqual([0]);

            const builder = await AdvancedFilterBuilderHarness.open(api);
            const [condition] = await builder.conditionItems();
            expect(await builder.operatorOptions(condition)).toEqual(['is today', 'is in last 7 days']);
            expect(builder.valuePills(condition)).toHaveLength(0);
        });

        // Choosing one after an option that took values has to drop them, or the model would carry a slot
        // the option does not use.
        test('selecting one in the Builder removes the value pills of the option it replaces', async () => {
            const api = await gridsManager.createGridAndWait('grid1', opts(['inRange', 'today']));
            api.setAdvancedFilterModel({
                filterType: 'dateString',
                colId: 'day',
                type: 'inRange',
                filter: YESTERDAY,
                filterTo: TODAY,
            });
            api.onFilterChanged();
            await asyncSetTimeout(0);

            const builder = await AdvancedFilterBuilderHarness.open(api);
            const [condition] = await builder.conditionItems();
            expect(builder.valuePills(condition)).toHaveLength(2);

            await builder.selectOperator(condition, 'is today');
            expect(builder.valuePills(condition)).toHaveLength(0);
            await builder.apply();
            await asyncSetTimeout(0);

            expect(api.getAdvancedFilterModel()).toEqual({ filterType: 'dateString', colId: 'day', type: 'today' });
            expect(getDisplayedIds(api)).toEqual([0]);
        });

        // Suggestion is what a column narrows; the grammar stays the data type's, so an option a column
        // never names is still one an already-saved expression can spell.
        test('one the column does not name is not suggested, but an expression naming it still applies', async () => {
            const api = await gridsManager.createGridAndWait('grid1', opts());
            const af = AdvancedFilterHarness.get(api);

            await af.type('[Day] ');
            expect(af.autocompleteEntries()).toEqual(SCALAR_OPERATORS);

            await af.applyExpression('[Day] is yesterday');
            await asyncSetTimeout(0);

            expect(api.getAdvancedFilterModel()).toEqual({
                filterType: 'dateString',
                colId: 'day',
                type: 'yesterday',
            });
            expect(getDisplayedIds(api)).toEqual([1]);
        });

        // A number column has no relative date option, so neither its dropdown nor its grammar has one.
        test('a number column offers none and rejects an expression naming one', async () => {
            const api = await gridsManager.createGridAndWait('grid1', opts());
            const af = AdvancedFilterHarness.get(api);

            await af.type('[Age] ');
            expect(af.autocompleteEntries()).toEqual(SCALAR_OPERATORS);

            await af.applyExpression('[Age] is yesterday');
            await asyncSetTimeout(0);

            await new FilterDom(api, 'preset rejected on a number column').checkFilterDom(`
                ADVANCED FILTER
                input: "[Age] is yesterday"
                valid: false — Expression has an error. Option not found - is yesterday.
                buttons: Apply ⊘ | Builder
                model: null
            `);
        });

        // A date column offers a preset only where it names it, so retargeting a condition to one that
        // does not clears the operator rather than carrying it across.
        test('retargeting a condition to a date column that does not name the preset clears it', async () => {
            const api = await gridsManager.createGridAndWait('grid1', {
                columnDefs: [
                    {
                        field: 'day',
                        cellDataType: 'dateString',
                        filter: 'agDateColumnFilter',
                        filterParams: { filterOptions: ['today', 'equals'] },
                    },
                    { field: 'other', cellDataType: 'dateString', filter: 'agDateColumnFilter' },
                ],
                rowData: ROW_DATA.map((row) => ({ ...row, other: row.day })),
                enableAdvancedFilter: true,
            });
            api.setAdvancedFilterModel({ filterType: 'dateString', colId: 'day', type: 'today' });
            api.onFilterChanged();
            await asyncSetTimeout(0);

            const builder = await AdvancedFilterBuilderHarness.open(api);
            const [condition] = await builder.conditionItems();
            expect(await builder.operatorOptions(condition)).toEqual(['is today', '=']);

            await builder.selectColumn(condition, 'Other');

            expect(await builder.operatorOptions(condition)).toEqual(SCALAR_OPERATORS);
            // The model shown is the applied one; the Builder's own edit is the cleared operator pill.
            await new FilterDom(api, 'preset cleared by the column switch', { mode: 'builder' }).checkFilterDom(`
                BUILDER
                AND
                  Other Select an option ✗
                  + add
                buttons: Apply ⊘ | Cancel
                model:
                  filterType: "dateString"
                  colId: "day"
                  type: "today"
            `);
        });
    });
});
