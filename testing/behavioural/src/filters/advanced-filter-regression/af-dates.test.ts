import type { GridApi, GridOptions } from 'ag-grid-community';
import { ClientSideRowModelModule, DateFilterModule, TextFilterModule } from 'ag-grid-community';
import { AdvancedFilterModule } from 'ag-grid-enterprise';

import { AdvancedFilterHarness, FilterDom, GridRows, TestGridsManager, asyncSetTimeout } from '../../test-utils';

/**
 * Regression baseline for Advanced Filter date handling that AG-10029 (range / relative date) builds on:
 * date operators via the text parser (`[Date] = "2012-08-05"`) across dateString/date columns, plus the
 * built-in relative date presets (Today, Yesterday, This Year …). Preset rows are dated from "now" and
 * asserted by tag (a snapshot would drift daily); TZ=UTC.
 */
interface Row {
    athlete: string;
    date: string | null;
    when: Date | null;
}

const ROW_DATA: Row[] = [
    { athlete: 'Phelps', date: '2008-08-24', when: new Date('2008-08-24') },
    { athlete: 'Thompson', date: '2012-07-15', when: new Date('2012-07-15') },
    { athlete: 'Bolt', date: '2012-08-05', when: new Date('2012-08-05') },
    { athlete: 'Kowalski', date: '2020-07-23', when: new Date('2020-07-23') },
    { athlete: 'Wei', date: null, when: null },
    { athlete: 'Ng', date: '2024-01-01', when: new Date('2024-01-01') },
];

// `date` is a string column → inferred base type `dateString`; `when` holds Date objects → `date`.
const COLUMN_DEFS: GridOptions<Row>['columnDefs'] = [
    { field: 'athlete', filter: true },
    { field: 'date', filter: true },
    { field: 'when', cellDataType: 'date', filter: true },
];

const DEFAULT_OPTIONS: GridOptions<Row> = {
    columnDefs: COLUMN_DEFS,
    rowData: ROW_DATA,
    enableAdvancedFilter: true,
};

function displayedAthletes(api: GridApi<Row>): string[] {
    const out: string[] = [];
    for (let i = 0, len = api.getDisplayedRowCount(); i < len; i++) {
        out.push(api.getDisplayedRowAtIndex(i)!.data!.athlete);
    }
    return out;
}

/** ISO yyyy-mm-dd for `daysAgo` days before today (UTC). */
function isoDaysAgo(daysAgo: number): string {
    const d = new Date();
    d.setUTCDate(d.getUTCDate() - daysAgo);
    return d.toISOString().slice(0, 10);
}

/** ISO yyyy-mm-dd for the same day-of-month, `yearsAgo` years back (UTC). */
function isoYearsAgo(yearsAgo: number): string {
    const d = new Date();
    d.setUTCFullYear(d.getUTCFullYear() - yearsAgo);
    return d.toISOString().slice(0, 10);
}

describe('Advanced Filter — date expressions (text parser)', () => {
    const gridsManager = new TestGridsManager({
        modules: [TextFilterModule, DateFilterModule, AdvancedFilterModule, ClientSideRowModelModule],
    });

    afterEach(() => gridsManager.reset());

    describe('dateString column (string dates)', () => {
        test('equals matches the exact date and yields a dateString model', async () => {
            const api = await gridsManager.createGridAndWait('grid1', DEFAULT_OPTIONS);

            await AdvancedFilterHarness.get(api).applyExpression('[Date] = "2012-08-05"');
            await asyncSetTimeout(0);

            expect(displayedAthletes(api)).toEqual(['Bolt']);
            expect(api.getAdvancedFilterModel()).toEqual({
                filterType: 'dateString',
                colId: 'date',
                type: 'equals',
                filter: '2012-08-05',
            });
            await new FilterDom(api, 'date equals panel').checkFilterDom(`
                ADVANCED FILTER
                input: "[Date] = "2012-08-05""
                valid: true
                buttons: Apply ⊘ | Builder
                model:
                  filterType: "dateString"
                  colId: "date"
                  type: "equals"
                  filter: "2012-08-05"
            `);
            await new GridRows(api, 'date equals rows').check(`
                ROOT id:ROOT_NODE_ID
                └── LEAF id:2 athlete:"Bolt" date:"2012-08-05" when:"2012-08-05"
            `);
        });

        test('greaterThan / lessThan bound the range exclusively', async () => {
            const api = await gridsManager.createGridAndWait('grid1', DEFAULT_OPTIONS);

            await AdvancedFilterHarness.get(api).applyExpression('[Date] > "2012-08-05"');
            await asyncSetTimeout(0);
            expect(displayedAthletes(api)).toEqual(['Kowalski', 'Ng']);
            await new GridRows(api, 'date greaterThan rows').check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:3 athlete:"Kowalski" date:"2020-07-23" when:"2020-07-23"
                └── LEAF id:5 athlete:"Ng" date:"2024-01-01" when:"2024-01-01"
            `);

            await AdvancedFilterHarness.get(api).applyExpression('[Date] < "2012-08-05"');
            await asyncSetTimeout(0);
            expect(displayedAthletes(api)).toEqual(['Phelps', 'Thompson']);
            await new GridRows(api, 'date lessThan rows').check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:0 athlete:"Phelps" date:"2008-08-24" when:"2008-08-24"
                └── LEAF id:1 athlete:"Thompson" date:"2012-07-15" when:"2012-07-15"
            `);
        });

        test('greaterThanOrEqual / lessThanOrEqual include the boundary', async () => {
            const api = await gridsManager.createGridAndWait('grid1', DEFAULT_OPTIONS);

            await AdvancedFilterHarness.get(api).applyExpression('[Date] >= "2012-08-05"');
            await asyncSetTimeout(0);
            expect(displayedAthletes(api)).toEqual(['Bolt', 'Kowalski', 'Ng']);
            await new GridRows(api, 'date greaterThanOrEqual rows').check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:2 athlete:"Bolt" date:"2012-08-05" when:"2012-08-05"
                ├── LEAF id:3 athlete:"Kowalski" date:"2020-07-23" when:"2020-07-23"
                └── LEAF id:5 athlete:"Ng" date:"2024-01-01" when:"2024-01-01"
            `);

            await AdvancedFilterHarness.get(api).applyExpression('[Date] <= "2012-08-05"');
            await asyncSetTimeout(0);
            expect(displayedAthletes(api)).toEqual(['Phelps', 'Thompson', 'Bolt']);
            await new GridRows(api, 'date lessThanOrEqual rows').check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:0 athlete:"Phelps" date:"2008-08-24" when:"2008-08-24"
                ├── LEAF id:1 athlete:"Thompson" date:"2012-07-15" when:"2012-07-15"
                └── LEAF id:2 athlete:"Bolt" date:"2012-08-05" when:"2012-08-05"
            `);
        });

        test('blank / not blank select on null presence', async () => {
            const api = await gridsManager.createGridAndWait('grid1', DEFAULT_OPTIONS);

            await AdvancedFilterHarness.get(api).applyExpression('[Date] is blank');
            await asyncSetTimeout(0);
            expect(displayedAthletes(api)).toEqual(['Wei']);
            expect(api.getAdvancedFilterModel()).toEqual({
                filterType: 'dateString',
                colId: 'date',
                type: 'blank',
            });
            await new GridRows(api, 'date blank rows').check(`
                ROOT id:ROOT_NODE_ID
                └── LEAF id:4 athlete:"Wei" date:null when:null
            `);

            await AdvancedFilterHarness.get(api).applyExpression('[Date] is not blank');
            await asyncSetTimeout(0);
            expect(displayedAthletes(api)).toEqual(['Phelps', 'Thompson', 'Bolt', 'Kowalski', 'Ng']);
            await new GridRows(api, 'date not blank rows').check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:0 athlete:"Phelps" date:"2008-08-24" when:"2008-08-24"
                ├── LEAF id:1 athlete:"Thompson" date:"2012-07-15" when:"2012-07-15"
                ├── LEAF id:2 athlete:"Bolt" date:"2012-08-05" when:"2012-08-05"
                ├── LEAF id:3 athlete:"Kowalski" date:"2020-07-23" when:"2020-07-23"
                └── LEAF id:5 athlete:"Ng" date:"2024-01-01" when:"2024-01-01"
            `);
        });

        test('an unparseable date operand is rejected and does not filter', async () => {
            const api = await gridsManager.createGridAndWait('grid1', DEFAULT_OPTIONS);

            await AdvancedFilterHarness.get(api).applyExpression('[Date] = "not-a-date"');
            await asyncSetTimeout(0);

            // Invalid expression must not apply — all rows remain.
            expect(displayedAthletes(api)).toEqual(['Phelps', 'Thompson', 'Bolt', 'Kowalski', 'Wei', 'Ng']);
            await new GridRows(api, 'invalid date rows').check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:0 athlete:"Phelps" date:"2008-08-24" when:"2008-08-24"
                ├── LEAF id:1 athlete:"Thompson" date:"2012-07-15" when:"2012-07-15"
                ├── LEAF id:2 athlete:"Bolt" date:"2012-08-05" when:"2012-08-05"
                ├── LEAF id:3 athlete:"Kowalski" date:"2020-07-23" when:"2020-07-23"
                ├── LEAF id:4 athlete:"Wei" date:null when:null
                └── LEAF id:5 athlete:"Ng" date:"2024-01-01" when:"2024-01-01"
            `);
            await new FilterDom(api, 'invalid date panel').checkFilterDom(`
                ADVANCED FILTER
                input: "[Date] = "not-a-date""
                valid: false — Expression has an error. Value is not a valid date - "not-a-date".
                buttons: Apply ⊘ | Builder
                model: null
            `);
        });

        test('model → text round-trips through the editor input', async () => {
            const api = await gridsManager.createGridAndWait('grid1', DEFAULT_OPTIONS);

            api.setAdvancedFilterModel({
                filterType: 'dateString',
                colId: 'date',
                type: 'greaterThan',
                filter: '2012-08-05',
            });
            await asyncSetTimeout(0);

            expect(AdvancedFilterHarness.get(api).value).toBe('[Date] > "2012-08-05"');
        });
    });

    describe('date column (Date objects)', () => {
        test('equals matches the exact date and yields a date model', async () => {
            const api = await gridsManager.createGridAndWait('grid1', DEFAULT_OPTIONS);

            await AdvancedFilterHarness.get(api).applyExpression('[When] = "2012-08-05"');
            await asyncSetTimeout(0);

            expect(displayedAthletes(api)).toEqual(['Bolt']);
            expect(api.getAdvancedFilterModel()).toEqual({
                filterType: 'date',
                colId: 'when',
                type: 'equals',
                filter: '2012-08-05',
            });
            await new GridRows(api, 'date-typed equals rows').check(`
                ROOT id:ROOT_NODE_ID
                └── LEAF id:2 athlete:"Bolt" date:"2012-08-05" when:"2012-08-05"
            `);
        });

        test('greaterThan bounds the range and round-trips', async () => {
            const api = await gridsManager.createGridAndWait('grid1', DEFAULT_OPTIONS);

            await AdvancedFilterHarness.get(api).applyExpression('[When] > "2012-08-05"');
            await asyncSetTimeout(0);
            expect(displayedAthletes(api)).toEqual(['Kowalski', 'Ng']);
            await new GridRows(api, 'date-typed greaterThan rows').check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:3 athlete:"Kowalski" date:"2020-07-23" when:"2020-07-23"
                └── LEAF id:5 athlete:"Ng" date:"2024-01-01" when:"2024-01-01"
            `);

            api.setAdvancedFilterModel(null);
            await asyncSetTimeout(0);
            api.setAdvancedFilterModel({
                filterType: 'date',
                colId: 'when',
                type: 'greaterThan',
                filter: '2012-08-05',
            });
            await asyncSetTimeout(0);
            expect(AdvancedFilterHarness.get(api).value).toBe('[When] > "2012-08-05"');
        });
    });
});

describe('Date Filter — relative date presets reuse surface', () => {
    interface Row {
        tag: string;
        date: string;
    }

    const gridsManager = new TestGridsManager({
        modules: [DateFilterModule, ClientSideRowModelModule],
    });

    afterEach(() => gridsManager.reset());

    function displayedTags(api: GridApi<Row>): string[] {
        const tags: string[] = [];
        for (let i = 0, len = api.getDisplayedRowCount(); i < len; i++) {
            tags.push(api.getDisplayedRowAtIndex(i)!.data!.tag);
        }
        return tags.sort();
    }

    const ROW_DATA: Row[] = [
        { tag: 'today', date: isoDaysAgo(0) },
        { tag: 'yesterday', date: isoDaysAgo(1) },
        { tag: 'lastWeek', date: isoDaysAgo(8) },
        { tag: 'lastYear', date: isoYearsAgo(1) },
    ];

    // Preset types must be registered in filterOptions or the standard filter's validateModel
    // nulls out the model (its type is not in the default options). AG-10029 must account for this.
    const COLUMN_DEFS = [
        {
            field: 'date',
            filter: 'agDateColumnFilter',
            filterParams: { filterOptions: ['today', 'yesterday', 'last7Days', 'thisYear', 'lastYear', 'equals'] },
        },
    ];

    async function applyPreset(api: GridApi<Row>, type: string): Promise<void> {
        await api.setColumnFilterModel('date', { filterType: 'date', type } as any);
        api.onFilterChanged();
        await asyncSetTimeout(0);
    }

    test('today preset matches only today', async () => {
        const api = await gridsManager.createGridAndWait('grid1', {
            columnDefs: COLUMN_DEFS,
            rowData: ROW_DATA,
        });
        await applyPreset(api, 'today');
        expect(displayedTags(api)).toEqual(['today']);
    });

    test('yesterday preset matches only yesterday', async () => {
        const api = await gridsManager.createGridAndWait('grid1', {
            columnDefs: COLUMN_DEFS,
            rowData: ROW_DATA,
        });
        await applyPreset(api, 'yesterday');
        expect(displayedTags(api)).toEqual(['yesterday']);
    });

    test('last7Days preset matches today and yesterday but not last week', async () => {
        const api = await gridsManager.createGridAndWait('grid1', {
            columnDefs: COLUMN_DEFS,
            rowData: ROW_DATA,
        });
        await applyPreset(api, 'last7Days');
        expect(displayedTags(api)).toEqual(['today', 'yesterday']);
    });

    test('lastYear preset matches only the last-year row', async () => {
        const api = await gridsManager.createGridAndWait('grid1', {
            columnDefs: COLUMN_DEFS,
            rowData: ROW_DATA,
        });
        await applyPreset(api, 'lastYear');
        expect(displayedTags(api)).toEqual(['lastYear']);
    });

    test('thisYear preset matches current-year rows (today, yesterday, last week)', async () => {
        const api = await gridsManager.createGridAndWait('grid1', {
            columnDefs: COLUMN_DEFS,
            rowData: ROW_DATA,
        });
        await applyPreset(api, 'thisYear');
        // Excludes lastYear; the others are all within the current calendar year unless run within
        // the first 8 days of January (when "last week"/"yesterday" fall into the previous year).
        const tags = displayedTags(api);
        expect(tags).toContain('today');
        expect(tags).not.toContain('lastYear');
    });
});
