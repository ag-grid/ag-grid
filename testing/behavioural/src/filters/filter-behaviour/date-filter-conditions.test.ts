import {
    ALL_SEVERITIES,
    ColumnFilterHarness,
    FilterDom,
    FloatingFilterHarness,
    GridRows,
    TestGridsManager,
    asyncSetTimeout,
    installFilterLayoutMock,
    uninstallFilterLayoutMock,
} from 'ag-test-utils';

import type { GridApi } from 'ag-grid-community';
import { ClientSideRowModelModule, DateFilterModule, enableDevValidations, setupAgTestIds } from 'ag-grid-community';

/**
 * Black-box coverage for `agDateColumnFilter` conditions (operators, inRange boundaries, validation,
 * custom comparator, AND/OR, round-trip). Complements the equals-focused date-filter.test.ts and the
 * validation-focused date-filter-range-validation.test.ts with no overlap. TZ=UTC pins determinism.
 */
describe('Date Filter — conditions coverage', () => {
    const gridsManager = new TestGridsManager({
        modules: [DateFilterModule, ClientSideRowModelModule],
    });

    beforeAll(() => {
        setupAgTestIds();
        installFilterLayoutMock();
    });
    afterAll(() => uninstallFilterLayoutMock());
    afterEach(() => {
        // Restored first: a throw from `reset` would otherwise leave `console.warn` mocked for the rest of
        // the file. The global `beforeEach` puts the validation config back on its own.
        vi.restoreAllMocks();
        gridsManager.reset();
    });

    // A date component is built inside an `AgPromise` that settles inline, so one reporting from its own
    // `init` drives the filter's callbacks before the condition it belongs to has its type widget.
    test('a date component reporting a change while it initialises builds one whole condition', async () => {
        class EagerDateComp {
            private eGui!: HTMLInputElement;
            public init(params: { onDateChanged: () => void }): void {
                this.eGui = document.createElement('input');
                params.onDateChanged();
            }
            public getGui(): HTMLElement {
                return this.eGui;
            }
            public getDate(): Date | null {
                return null;
            }
            public setDate(): void {}
        }

        const api: GridApi = await gridsManager.createGridAndWait('grid1', {
            columnDefs: [
                {
                    field: 'date',
                    filter: 'agDateColumnFilter',
                    dateComponent: EagerDateComp,
                    filterParams: { debounceMs: 0 },
                },
            ],
            rowData: ASCENDING,
        });

        const filter = await ColumnFilterHarness.open(api, 'date');
        // One whole condition, not two: reporting mid-build must not leave a half-registered condition behind
        // for the completeness pass to count and then build a successor to.
        await new FilterDom(api, 'a panel whose component reported before its type widget existed', {
            mode: 'column-filter',
            colId: 'date',
        }).checkFilterDom(`
            COLUMN FILTER
            operator: "Equals"
            model: null
        `);
        expect(filter.getModel()).toBe(null);
        await new GridRows(api, 'a filter whose component reported early still filters nothing').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:0 date:"2024-01-10"
            ├── LEAF id:1 date:"2024-03-15"
            ├── LEAF id:2 date:"2024-05-20"
            └── LEAF id:3 date:"2024-07-04"
        `);
    });

    const ASCENDING = [{ date: '2024-01-10' }, { date: '2024-03-15' }, { date: '2024-05-20' }, { date: '2024-07-04' }];

    // Pinned as the odd one out: text, number and bigint all mark this element `role="presentation"`.
    test('the condition body carries no role, unlike every other provided filter', async () => {
        const api: GridApi = await gridsManager.createGridAndWait('grid1', {
            columnDefs: [{ field: 'date', filter: 'agDateColumnFilter', filterParams: { debounceMs: 0 } }],
            rowData: ASCENDING,
        });

        await ColumnFilterHarness.open(api, 'date');

        const body = document.querySelector('.ag-filter-menu .ag-filter-body');
        expect(body).not.toBeNull();
        expect(body!.hasAttribute('role')).toBe(false);
    });

    test('a filterParams `includeTime` column shows the date it was given', async () => {
        const api: GridApi = await gridsManager.createGridAndWait('grid1', {
            // `includeTime` is the only thing saying the input takes a time; no cell data type implies one.
            columnDefs: [
                { field: 'date', filter: 'agDateColumnFilter', filterParams: { debounceMs: 0, includeTime: true } },
            ],
            rowData: ASCENDING,
        });

        await api.setColumnFilterModel('date', { filterType: 'date', type: 'equals', dateFrom: '2024-03-15 14:30:00' });
        api.onFilterChanged();
        const filter = await ColumnFilterHarness.open(api, 'date');
        await asyncSetTimeout(0);

        const input = filter.input('date', 0);
        expect(input.type).toBe('datetime-local');
        // Written for the input the params asked for, not the one the cell data type implies.
        expect(input.value).toBe('2024-03-15T14:30');
    });

    test('a filterParams `includeTime` floating filter shows the date it was given', async () => {
        const api: GridApi = await gridsManager.createGridAndWait('grid1', {
            columnDefs: [
                {
                    field: 'date',
                    filter: 'agDateColumnFilter',
                    floatingFilter: true,
                    filterParams: { debounceMs: 0, includeTime: true },
                },
            ],
            rowData: ASCENDING,
        });

        await api.setColumnFilterModel('date', { filterType: 'date', type: 'equals', dateFrom: '2024-03-15 14:30:00' });
        api.onFilterChanged();
        await asyncSetTimeout(0);

        // The floating filter is handed the same `filterParams`, so it builds the same kind of input.
        const input = FloatingFilterHarness.get(api, 'date').input();
        expect(input.type).toBe('datetime-local');
        expect(input.value).toBe('2024-03-15T14:30');
    });

    test('comparison operators over an ascending date dataset', async () => {
        const api: GridApi = await gridsManager.createGridAndWait('grid1', {
            columnDefs: [{ field: 'date', filter: 'agDateColumnFilter', filterParams: { debounceMs: 0 } }],
            rowData: ASCENDING,
        });

        const filter = await ColumnFilterHarness.open(api, 'date');

        // equals — single value, dateTo stays null in the model.
        await filter.selectOperator('Equals');
        await filter.setDate('2024-03-15', 0);
        await asyncSetTimeout(0);
        await new FilterDom(api, 'equals panel', { mode: 'column-filter', colId: 'date' }).checkFilterDom(`
            COLUMN FILTER
            operator: "Equals"
            input: "2024-03-15"
            AND
            operator: "Equals"
            input: "" ⟨yyyy-mm-dd⟩
            model:
              dateFrom: "2024-03-15"
              dateTo: null
              filterType: "date"
              type: "equals"
        `);
        await new GridRows(api, 'equals rows').check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:1 date:"2024-03-15"
        `);
        expect(filter.getModel()).toEqual({
            dateFrom: '2024-03-15',
            dateTo: null,
            filterType: 'date',
            type: 'equals',
        });

        // notEqual ("Does not equal")
        await filter.selectOperator('Does not equal');
        await filter.setDate('2024-03-15', 0);
        await asyncSetTimeout(0);
        await new GridRows(api, 'notEqual rows').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:0 date:"2024-01-10"
            ├── LEAF id:2 date:"2024-05-20"
            └── LEAF id:3 date:"2024-07-04"
        `);
        expect(filter.getModel()).toMatchObject({ type: 'notEqual', dateFrom: '2024-03-15' });

        // before (lessThan) — labelled "Before" for the date filter.
        await filter.selectOperator('Before');
        await filter.setDate('2024-05-20', 0);
        await asyncSetTimeout(0);
        await new GridRows(api, 'before rows').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:0 date:"2024-01-10"
            └── LEAF id:1 date:"2024-03-15"
        `);
        expect(filter.getModel()).toMatchObject({ type: 'lessThan', dateFrom: '2024-05-20' });

        // after (greaterThan) — labelled "After".
        await filter.selectOperator('After');
        await filter.setDate('2024-03-15', 0);
        await asyncSetTimeout(0);
        await new GridRows(api, 'after rows').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:2 date:"2024-05-20"
            └── LEAF id:3 date:"2024-07-04"
        `);
        expect(filter.getModel()).toMatchObject({ type: 'greaterThan', dateFrom: '2024-03-15' });
    });

    test('blank, notBlank and equals partition every way of writing no date', async () => {
        const api: GridApi = await gridsManager.createGridAndWait('grid1', {
            columnDefs: [{ field: 'date', filter: 'agDateColumnFilter', filterParams: { debounceMs: 0 } }],
            // A non-breaking space is whitespace to `trim`, and so blank, however printable its code point.
            rowData: [
                { date: '2024-01-10' },
                { date: null },
                { date: '2024-05-20' },
                { date: null },
                { date: '' },
                { date: '\u00A0' },
            ],
        });

        const filter = await ColumnFilterHarness.open(api, 'date');

        await filter.selectOperator('Blank');
        await asyncSetTimeout(0);
        await new FilterDom(api, 'blank panel', { mode: 'column-filter', colId: 'date' }).checkFilterDom(`
            COLUMN FILTER
            operator: "Blank"
            AND
            operator: "Equals"
            input: "" ⟨yyyy-mm-dd⟩
            model:
              dateFrom: null
              dateTo: null
              filterType: "date"
              type: "blank"
        `);
        await new GridRows(api, 'blank rows').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:1 date:null
            ├── LEAF id:3 date:null
            ├── LEAF id:4 date:""
            └── LEAF id:5 date:""
        `);
        expect(filter.getModel()).toMatchObject({ type: 'blank' });
        // Both blank rows serialise as `date:""`, so the ids are what say which is the non-breaking space.
        expect(api.getDisplayedRowAtIndex(3)!.data.date).toBe('\u00A0');

        await filter.selectOperator('Not blank');
        await asyncSetTimeout(0);
        await new GridRows(api, 'notBlank rows').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:0 date:"2024-01-10"
            └── LEAF id:2 date:"2024-05-20"
        `);
        expect(filter.getModel()).toMatchObject({ type: 'notBlank' });

        // Blanks are out of an `equals` unless asked for, whichever way they are written.
        await filter.selectOperator('Equals');
        await filter.setDate('2024-01-10', 0);
        await asyncSetTimeout(0);
        await new GridRows(api, 'equals rows').check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:0 date:"2024-01-10"
        `);
        expect(filter.getModel()).toMatchObject({ type: 'equals', dateFrom: '2024-01-10' });
    });

    test('includeBlanksInEquals admits an empty string as well as a null', async () => {
        const api: GridApi = await gridsManager.createGridAndWait('grid1', {
            columnDefs: [
                {
                    field: 'date',
                    filter: 'agDateColumnFilter',
                    filterParams: { debounceMs: 0, includeBlanksInEquals: true },
                },
            ],
            rowData: [{ date: '2024-01-10' }, { date: null }, { date: '2024-05-20' }, { date: '' }],
        });

        const filter = await ColumnFilterHarness.open(api, 'date');
        await filter.selectOperator('Equals');
        await filter.setDate('2024-01-10', 0);
        await asyncSetTimeout(0);

        await new GridRows(api, 'equals with blanks included').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:0 date:"2024-01-10"
            ├── LEAF id:1 date:null
            └── LEAF id:3 date:""
        `);
    });

    // A lenient `comparator` reports "equal" for input it cannot parse, so a blank must not reach it.
    test('an empty string never reaches the comparator', async () => {
        const comparator = vi.fn(dayMonthYearComparator);
        const api: GridApi = await gridsManager.createGridAndWait('grid1', {
            columnDefs: [
                { field: 'date', filter: 'agDateColumnFilter', cellDataType: false, filterParams: { comparator } },
            ],
            rowData: [{ date: null }, { date: '' }, { date: '25/10/2016' }],
        });

        const filter = await ColumnFilterHarness.open(api, 'date');
        await filter.selectOperator('Equals');
        await filter.setDate('2016-10-25', 0);
        await asyncSetTimeout(0);

        await new GridRows(api, 'only the row that holds the date').check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:2 date:"25/10/2016"
        `);
        expect(comparator.mock.calls.map(([, cellValue]) => cellValue)).toEqual(['25/10/2016']);
    });

    const BOUNDARY = [
        { date: '2024-01-10' },
        { date: '2024-03-15' },
        { date: '2024-05-20' },
        { date: '2024-07-04' },
        { date: '2024-09-01' },
    ];

    test('inRange is exclusive of both bounds by default and yields a two-value model', async () => {
        const api: GridApi = await gridsManager.createGridAndWait('grid1', {
            columnDefs: [{ field: 'date', filter: 'agDateColumnFilter', filterParams: { debounceMs: 0 } }],
            rowData: BOUNDARY,
        });

        const filter = await ColumnFilterHarness.open(api, 'date');
        await filter.selectOperator('Between');
        await filter.setDate('2024-03-15', 0);
        await filter.setDate('2024-07-04', 1);
        await asyncSetTimeout(0);

        await new FilterDom(api, 'inRange exclusive panel', { mode: 'column-filter', colId: 'date' }).checkFilterDom(`
            COLUMN FILTER
            operator: "Between"
            input [0]: "2024-03-15"
            input [1]: "2024-07-04"
            AND
            operator: "Equals"
            input: "" ⟨yyyy-mm-dd⟩
            model:
              dateFrom: "2024-03-15"
              dateTo: "2024-07-04"
              filterType: "date"
              type: "inRange"
        `);
        // Exclusive: the two boundary dates are excluded, only 2024-05-20 (strictly inside) passes.
        await new GridRows(api, 'inRange exclusive rows').check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:2 date:"2024-05-20"
        `);
        expect(filter.getModel()).toEqual({
            dateFrom: '2024-03-15',
            dateTo: '2024-07-04',
            filterType: 'date',
            type: 'inRange',
        });
    });

    test('inRange includes both bounds when inRangeInclusive is true', async () => {
        const api: GridApi = await gridsManager.createGridAndWait('grid1', {
            columnDefs: [
                {
                    field: 'date',
                    filter: 'agDateColumnFilter',
                    filterParams: { debounceMs: 0, inRangeInclusive: true },
                },
            ],
            rowData: BOUNDARY,
        });

        const filter = await ColumnFilterHarness.open(api, 'date');
        await filter.selectOperator('Between');
        await filter.setDate('2024-03-15', 0);
        await filter.setDate('2024-07-04', 1);
        await asyncSetTimeout(0);

        // Inclusive: both boundary dates plus the inside date pass.
        await new GridRows(api, 'inRange inclusive rows').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:1 date:"2024-03-15"
            ├── LEAF id:2 date:"2024-05-20"
            └── LEAF id:3 date:"2024-07-04"
        `);
        expect(filter.getModel()).toEqual({
            dateFrom: '2024-03-15',
            dateTo: '2024-07-04',
            filterType: 'date',
            type: 'inRange',
        });
    });

    test('inRange with only the lower bound does not filter (incomplete range)', async () => {
        const api: GridApi = await gridsManager.createGridAndWait('grid1', {
            columnDefs: [{ field: 'date', filter: 'agDateColumnFilter', filterParams: { debounceMs: 0 } }],
            rowData: BOUNDARY,
        });

        const filter = await ColumnFilterHarness.open(api, 'date');
        await filter.selectOperator('Between');
        await filter.setDate('2024-03-15', 0);
        await asyncSetTimeout(0);

        await new FilterDom(api, 'inRange incomplete panel', { mode: 'column-filter', colId: 'date' }).checkFilterDom(`
            COLUMN FILTER
            operator: "Between"
            input [0]: "2024-03-15"
            input [1]: "" ⟨yyyy-mm-dd⟩
            model: null
        `);
        // Incomplete range → no model applied → all rows visible.
        await new GridRows(api, 'inRange incomplete rows').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:0 date:"2024-01-10"
            ├── LEAF id:1 date:"2024-03-15"
            ├── LEAF id:2 date:"2024-05-20"
            ├── LEAF id:3 date:"2024-07-04"
            └── LEAF id:4 date:"2024-09-01"
        `);
        expect(filter.getModel()).toBeNull();
    });

    test('minValidYear / maxValidYear reject out-of-range years so the filter is not applied', async () => {
        const api: GridApi = await gridsManager.createGridAndWait('grid1', {
            columnDefs: [
                {
                    field: 'date',
                    filter: 'agDateColumnFilter',
                    filterParams: { debounceMs: 0, minValidYear: 2000, maxValidYear: 2020 },
                },
            ],
            rowData: [{ date: '1999-05-20' }, { date: '2010-05-20' }, { date: '2025-05-20' }],
        });

        const filter = await ColumnFilterHarness.open(api, 'date');
        await filter.selectOperator('Equals');

        // Invalid dates are never applied and never clear an existing model; both invalid entries
        // below run against a still-null model, so it stays null throughout.

        // Below minValidYear — invalid, so no model is applied and every row stays visible.
        await filter.setDate('1999-05-20', 0);
        await asyncSetTimeout(0);
        expect(filter.getModel()).toBeNull();
        await new GridRows(api, 'below minValidYear rows').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:0 date:"1999-05-20"
            ├── LEAF id:1 date:"2010-05-20"
            └── LEAF id:2 date:"2025-05-20"
        `);

        // Above maxValidYear — still invalid, model stays null, all rows visible.
        await filter.setDate('2025-05-20', 0);
        await asyncSetTimeout(0);
        expect(filter.getModel()).toBeNull();
        await new GridRows(api, 'above maxValidYear rows').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:0 date:"1999-05-20"
            ├── LEAF id:1 date:"2010-05-20"
            └── LEAF id:2 date:"2025-05-20"
        `);

        // Within range — the first valid entry applies and matches the one row.
        await filter.setDate('2010-05-20', 0);
        await asyncSetTimeout(0);
        expect(filter.getModel()).toMatchObject({ type: 'equals', dateFrom: '2010-05-20' });
        await new GridRows(api, 'within valid year rows').check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:1 date:"2010-05-20"
        `);
    });

    test('minValidDate / maxValidDate reject out-of-bounds dates so the filter is not applied', async () => {
        const api: GridApi = await gridsManager.createGridAndWait('grid1', {
            columnDefs: [
                {
                    field: 'date',
                    filter: 'agDateColumnFilter',
                    filterParams: { debounceMs: 0, minValidDate: '2024-03-01', maxValidDate: '2024-06-30' },
                },
            ],
            rowData: [{ date: '2024-01-10' }, { date: '2024-05-20' }, { date: '2024-12-25' }],
        });

        const filter = await ColumnFilterHarness.open(api, 'date');
        await filter.selectOperator('Equals');

        // Both invalid entries happen while the model is still null (see minValidYear test above).

        // Before minValidDate — invalid, model stays null, all rows visible.
        await filter.setDate('2024-01-10', 0);
        await asyncSetTimeout(0);
        expect(filter.getModel()).toBeNull();
        await new GridRows(api, 'before minValidDate rows').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:0 date:"2024-01-10"
            ├── LEAF id:1 date:"2024-05-20"
            └── LEAF id:2 date:"2024-12-25"
        `);

        // After maxValidDate — still invalid, model stays null.
        await filter.setDate('2024-12-25', 0);
        await asyncSetTimeout(0);
        expect(filter.getModel()).toBeNull();
        await new GridRows(api, 'after maxValidDate rows').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:0 date:"2024-01-10"
            ├── LEAF id:1 date:"2024-05-20"
            └── LEAF id:2 date:"2024-12-25"
        `);

        // Inside the valid window — the first valid entry applies.
        await filter.setDate('2024-05-20', 0);
        await asyncSetTimeout(0);
        expect(filter.getModel()).toMatchObject({ type: 'equals', dateFrom: '2024-05-20' });
        await new GridRows(api, 'inside valid date window rows').check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:1 date:"2024-05-20"
        `);
    });

    test('custom comparator matches by calendar day (ignoring time) on a dateTime column', async () => {
        const api: GridApi = await gridsManager.createGridAndWait('grid1', {
            columnDefs: [
                {
                    field: 'date',
                    filter: 'agDateColumnFilter',
                    cellDataType: 'dateTime',
                    filterParams: { debounceMs: 0, comparator: sameDayComparator },
                },
            ],
            rowData: [
                { date: new Date(2024, 0, 15, 9, 0, 0) },
                { date: new Date(2024, 0, 15, 18, 30, 0) },
                { date: new Date(2024, 2, 20, 9, 0, 0) },
            ],
        });

        const filter = await ColumnFilterHarness.open(api, 'date');
        await filter.selectOperator('Equals');
        await filter.setDate('2024-01-15T00:00:00', 0);
        await asyncSetTimeout(0);

        // Both Jan-15 rows match regardless of their differing times; the Mar-20 row does not.
        await new GridRows(api, 'custom comparator same-day rows').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:0 date:"2024-01-15T09:00:00"
            └── LEAF id:1 date:"2024-01-15T18:30:00"
        `);
        expect(api.getDisplayedRowCount()).toBe(2);
    });

    test('dateTime inRange filters between two datetimes (exclusive bounds)', async () => {
        const api: GridApi = await gridsManager.createGridAndWait('grid1', {
            columnDefs: [
                {
                    field: 'date',
                    filter: 'agDateColumnFilter',
                    cellDataType: 'dateTime',
                    filterParams: { debounceMs: 0 },
                },
            ],
            rowData: [
                { date: new Date(2024, 0, 15, 8, 0, 0) },
                { date: new Date(2024, 0, 15, 12, 0, 0) },
                { date: new Date(2024, 0, 15, 20, 0, 0) },
            ],
        });

        const filter = await ColumnFilterHarness.open(api, 'date');
        await filter.selectOperator('Between');
        await filter.setDate('2024-01-15T08:00:00', 0);
        await filter.setDate('2024-01-15T20:00:00', 1);
        await asyncSetTimeout(0);

        // Exclusive of both bounds: only the 12:00 row is strictly inside.
        await new GridRows(api, 'dateTime inRange rows').check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:1 date:"2024-01-15T12:00:00"
        `);
        expect(api.getDisplayedRowCount()).toBe(1);
        expect(filter.getModel()).toMatchObject({ type: 'inRange' });
    });

    test('two conditions joined with AND', async () => {
        const api: GridApi = await gridsManager.createGridAndWait('grid1', {
            columnDefs: [{ field: 'date', filter: 'agDateColumnFilter', filterParams: { debounceMs: 0 } }],
            rowData: BOUNDARY,
        });

        const filter = await ColumnFilterHarness.open(api, 'date');
        await filter.selectOperator('After', 0);
        await filter.setDate('2024-01-10', 0);
        await filter.setJoinOperator('AND');
        await filter.selectOperator('Before', 1);
        await filter.setDate('2024-09-01', 1);
        await asyncSetTimeout(0);

        await new FilterDom(api, 'AND panel', { mode: 'column-filter', colId: 'date' }).checkFilterDom(`
            COLUMN FILTER
            operator: "After"
            input: "2024-01-10"
            AND
            operator: "Before"
            input: "2024-09-01"
            model:
              filterType: "date"
              operator: "AND"
              conditions:
                - dateFrom: "2024-01-10"
                  dateTo: null
                  filterType: "date"
                  type: "greaterThan"
                - dateFrom: "2024-09-01"
                  dateTo: null
                  filterType: "date"
                  type: "lessThan"
        `);
        // after 2024-01-10 AND before 2024-09-01 → the three middle dates.
        await new GridRows(api, 'AND rows').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:1 date:"2024-03-15"
            ├── LEAF id:2 date:"2024-05-20"
            └── LEAF id:3 date:"2024-07-04"
        `);
        expect(filter.getModel()).toEqual({
            filterType: 'date',
            operator: 'AND',
            conditions: [
                { dateFrom: '2024-01-10', dateTo: null, filterType: 'date', type: 'greaterThan' },
                { dateFrom: '2024-09-01', dateTo: null, filterType: 'date', type: 'lessThan' },
            ],
        });
    });

    test('two conditions joined with OR', async () => {
        const api: GridApi = await gridsManager.createGridAndWait('grid1', {
            columnDefs: [{ field: 'date', filter: 'agDateColumnFilter', filterParams: { debounceMs: 0 } }],
            rowData: BOUNDARY,
        });

        const filter = await ColumnFilterHarness.open(api, 'date');
        await filter.selectOperator('Equals', 0);
        await filter.setDate('2024-01-10', 0);
        await filter.setJoinOperator('OR');
        await filter.selectOperator('Equals', 1);
        await filter.setDate('2024-09-01', 1);
        await asyncSetTimeout(0);

        await new FilterDom(api, 'OR panel', { mode: 'column-filter', colId: 'date' }).checkFilterDom(`
            COLUMN FILTER
            operator: "Equals"
            input: "2024-01-10"
            OR
            operator: "Equals"
            input: "2024-09-01"
            model:
              filterType: "date"
              operator: "OR"
              conditions:
                - dateFrom: "2024-01-10"
                  dateTo: null
                  filterType: "date"
                  type: "equals"
                - dateFrom: "2024-09-01"
                  dateTo: null
                  filterType: "date"
                  type: "equals"
        `);
        // equals 2024-01-10 OR equals 2024-09-01 → the two outer dates.
        await new GridRows(api, 'OR rows').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:0 date:"2024-01-10"
            └── LEAF id:4 date:"2024-09-01"
        `);
        expect(filter.getModel()).toEqual({
            filterType: 'date',
            operator: 'OR',
            conditions: [
                { dateFrom: '2024-01-10', dateTo: null, filterType: 'date', type: 'equals' },
                { dateFrom: '2024-09-01', dateTo: null, filterType: 'date', type: 'equals' },
            ],
        });
    });

    test('model round-trip: setFilterModel populates the popup and filters rows', async () => {
        const api: GridApi = await gridsManager.createGridAndWait('grid1', {
            columnDefs: [{ field: 'date', filter: 'agDateColumnFilter', filterParams: { debounceMs: 0 } }],
            rowData: BOUNDARY,
        });

        api.setFilterModel({
            date: { dateFrom: '2024-03-15', dateTo: '2024-07-04', filterType: 'date', type: 'inRange' },
        });
        await asyncSetTimeout(0);

        expect(api.getFilterModel()).toEqual({
            date: { dateFrom: '2024-03-15', dateTo: '2024-07-04', filterType: 'date', type: 'inRange' },
        });
        await new GridRows(api, 'round-trip rows').check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:2 date:"2024-05-20"
        `);

        // Re-opening the popup reflects the programmatic model in its inputs.
        await ColumnFilterHarness.open(api, 'date');
        await new FilterDom(api, 'round-trip panel', { mode: 'column-filter', colId: 'date' }).checkFilterDom(`
            COLUMN FILTER
            operator: "Between"
            input [0]: "2024-03-15"
            input [1]: "2024-07-04"
            AND
            operator: "Equals"
            input: "" ⟨yyyy-mm-dd⟩
            model:
              dateFrom: "2024-03-15"
              dateTo: "2024-07-04"
              filterType: "date"
              type: "inRange"
        `);
    });

    // A read-only filter builds no replacement for a condition a model removed, so it is the one panel that
    // can be attached holding none at all.
    test('a read-only filter opens on a combined model with no conditions rather than throwing', async () => {
        // Deliberate: a combined model without `conditions` is reported as warning #77.
        enableDevValidations({ throwOn: ALL_SEVERITIES, suppress: [77] });
        const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

        const api: GridApi = await gridsManager.createGridAndWait('grid1', {
            columnDefs: [
                { field: 'date', filter: 'agDateColumnFilter', filterParams: { debounceMs: 0, readOnly: true } },
            ],
            rowData: ASCENDING,
        });

        await api.setColumnFilterModel('date', { filterType: 'date', operator: 'AND' });
        api.onFilterChanged();
        await asyncSetTimeout(0);

        await ColumnFilterHarness.open(api, 'date');
        await asyncSetTimeout(0);

        // The panel itself is the subject: a model with nothing to show must leave it empty rather than
        // holding a condition built out of the gap.
        await new FilterDom(api, 'a read-only panel built from a conditionless model', {
            mode: 'column-filter',
            colId: 'date',
        }).checkFilterDom(`
            COLUMN FILTER
            model:
              filterType: "date"
              operator: "AND"
        `);

        expect(warnSpy.mock.calls.flat().join(' ')).toContain('warning #77');
        expect(api.getColumnFilterModel('date')).toEqual({ filterType: 'date', operator: 'AND' });
        await new GridRows(api, 'a conditionless read-only date model matches every row').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:0 date:"2024-01-10"
            ├── LEAF id:1 date:"2024-03-15"
            ├── LEAF id:2 date:"2024-05-20"
            └── LEAF id:3 date:"2024-07-04"
        `);
    });

    // The read-only panel is the one that can be left holding nothing, so it is the one that rebuilds
    // from zero, where a join operator has no condition in front of it to join to.
    test('a model arriving at a read-only panel holding no conditions joins them from the second on', async () => {
        // Deliberate: the conditionless model on the way in is reported as warning #77.
        enableDevValidations({ throwOn: ALL_SEVERITIES, suppress: [77] });
        const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

        const api: GridApi = await gridsManager.createGridAndWait('grid1', {
            columnDefs: [
                { field: 'date', filter: 'agDateColumnFilter', filterParams: { debounceMs: 0, readOnly: true } },
            ],
            rowData: ASCENDING,
        });

        await api.setColumnFilterModel('date', { filterType: 'date', operator: 'AND' });
        api.onFilterChanged();
        await asyncSetTimeout(0);
        await ColumnFilterHarness.open(api, 'date');
        await asyncSetTimeout(0);

        await api.setColumnFilterModel('date', {
            filterType: 'date',
            operator: 'AND',
            conditions: [
                { filterType: 'date', type: 'greaterThan', dateFrom: '2024-02-01' },
                { filterType: 'date', type: 'lessThan', dateFrom: '2024-06-01' },
            ],
        });
        api.onFilterChanged();
        await asyncSetTimeout(0);

        expect(warnSpy.mock.calls.flat().join(' ')).toContain('warning #77');
        // Counted in the DOM: the snapshot renders the join from its own loop over conditions, so a panel
        // mounted ahead of the first one is invisible there.
        expect(document.querySelectorAll('.ag-filter-menu .ag-filter-condition')).toHaveLength(1);

        await new FilterDom(api, 'two conditions joined by one operator between them', {
            mode: 'column-filter',
            colId: 'date',
        }).checkFilterDom(`
            COLUMN FILTER
            operator: "After"
            input: "2024-02-01"
            AND
            operator: "Before"
            input: "2024-06-01"
            model:
              filterType: "date"
              operator: "AND"
              conditions:
                - filterType: "date"
                  type: "greaterThan"
                  dateFrom: "2024-02-01"
                - filterType: "date"
                  type: "lessThan"
                  dateFrom: "2024-06-01"
        `);
    });

    // The read-only panel is the only one that stays at zero conditions, and a simple model addresses the
    // first by index, so it has to build one before it writes to it.
    test('a simple model arriving at a read-only panel holding no conditions builds one to hold it', async () => {
        // Deliberate: the conditionless model on the way in is reported as warning #77.
        enableDevValidations({ throwOn: ALL_SEVERITIES, suppress: [77] });
        const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

        const api: GridApi = await gridsManager.createGridAndWait('grid1', {
            columnDefs: [
                { field: 'date', filter: 'agDateColumnFilter', filterParams: { debounceMs: 0, readOnly: true } },
            ],
            rowData: ASCENDING,
        });

        await api.setColumnFilterModel('date', { filterType: 'date', operator: 'AND' });
        api.onFilterChanged();
        await asyncSetTimeout(0);
        await ColumnFilterHarness.open(api, 'date');
        await asyncSetTimeout(0);

        await api.setColumnFilterModel('date', {
            filterType: 'date',
            type: 'greaterThan',
            dateFrom: '2024-02-01',
        });
        api.onFilterChanged();
        await asyncSetTimeout(0);

        expect(warnSpy.mock.calls.flat().join(' ')).toContain('warning #77');
        await new FilterDom(api, 'a simple model shown by a panel that had been left with no conditions', {
            mode: 'column-filter',
            colId: 'date',
        }).checkFilterDom(`
            COLUMN FILTER
            operator: "After"
            input: "2024-02-01"
            model:
              filterType: "date"
              type: "greaterThan"
              dateFrom: "2024-02-01"
        `);
        await new GridRows(api, 'the simple model reaching an emptied read-only panel still filters').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:1 date:"2024-03-15"
            ├── LEAF id:2 date:"2024-05-20"
            └── LEAF id:3 date:"2024-07-04"
        `);
    });
});

/** Reads `dd/mm/yyyy` and reports "equal" for anything it cannot parse. */
function dayMonthYearComparator(filterDate: Date, cellValue: string): number {
    const [day, month, year] = cellValue.split('/');
    const cellDate = new Date(Number(year), Number(month) - 1, Number(day));
    if (cellDate < filterDate) {
        return -1;
    }
    if (cellDate > filterDate) {
        return 1;
    }
    return 0;
}

/** Day-granularity date comparator (cell vs filter): ignores the time-of-day component. */
function sameDayComparator(filterDate: Date, cellValue: Date): number {
    const filterDay = Date.UTC(filterDate.getUTCFullYear(), filterDate.getUTCMonth(), filterDate.getUTCDate());
    const cellDay = Date.UTC(cellValue.getUTCFullYear(), cellValue.getUTCMonth(), cellValue.getUTCDate());
    if (cellDay < filterDay) {
        return -1;
    }
    if (cellDay > filterDay) {
        return 1;
    }
    return 0;
}
