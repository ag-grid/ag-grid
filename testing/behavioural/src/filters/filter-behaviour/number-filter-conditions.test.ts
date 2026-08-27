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

import type { FilterInputCallbackParams, GridApi } from 'ag-grid-community';
import { ClientSideRowModelModule, NumberFilterModule, enableDevValidations, setupAgTestIds } from 'ag-grid-community';

/**
 * Black-box coverage for `agNumberColumnFilter` conditions: operators, inRange boundary semantics,
 * blank handling, `numberParser`/`numberFormatter`/`filterInputType`, which element type an input is built
 * as and how a `colDef` refresh replaces it, AND/OR compounds, condition limits, model round-trip.
 * Complements number-filter-range-validation.test.ts (validation) and allowed-char-pattern.test.ts (which
 * characters an input admits) — no overlap.
 */
describe('Number Filter — conditions coverage', () => {
    const gridsManager = new TestGridsManager({
        modules: [NumberFilterModule, ClientSideRowModelModule],
    });

    beforeAll(() => {
        setupAgTestIds();
        installFilterLayoutMock();
    });
    afterAll(() => uninstallFilterLayoutMock());
    afterEach(() => {
        gridsManager.reset();
        vi.restoreAllMocks();
        enableDevValidations({ throwOn: ALL_SEVERITIES, suppress: [] });
    });

    const MIXED = [{ val: -10 }, { val: -2.5 }, { val: 0 }, { val: 3 }, { val: 7.5 }, { val: 10 }];

    test('comparison operators over a mixed positive/negative/decimal dataset', async () => {
        const api: GridApi = await gridsManager.createGridAndWait('grid1', {
            columnDefs: [{ field: 'val', filter: 'agNumberColumnFilter', filterParams: { debounceMs: 0 } }],
            rowData: MIXED,
        });

        const filter = await ColumnFilterHarness.open(api, 'val');

        await filter.selectOperator('Equals');
        await filter.setNumber(3, 0);
        await asyncSetTimeout(0);
        expect(filter.getModel()).toEqual({ filterType: 'number', type: 'equals', filter: 3 });
        await new FilterDom(api, 'equals panel', { colId: 'val' }).checkFilterDom(`
            COLUMN FILTER
            operator: "Equals"
            input: "3"
            AND
            operator: "Equals"
            input: "" ⟨Filter...⟩
            model:
              filterType: "number"
              type: "equals"
              filter: 3
        `);
        await new GridRows(api, 'equals rows').check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:3 val:3
        `);

        await filter.selectOperator('Does not equal');
        await filter.setNumber(3, 0);
        await asyncSetTimeout(0);
        expect(filter.getModel()).toEqual({ filterType: 'number', type: 'notEqual', filter: 3 });
        await new GridRows(api, 'notEqual rows').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:0 val:-10
            ├── LEAF id:1 val:-2.5
            ├── LEAF id:2 val:0
            ├── LEAF id:4 val:7.5
            └── LEAF id:5 val:10
        `);

        await filter.selectOperator('Greater than');
        await filter.setNumber(3, 0);
        await asyncSetTimeout(0);
        expect(filter.getModel()).toEqual({ filterType: 'number', type: 'greaterThan', filter: 3 });
        await new GridRows(api, 'greaterThan rows').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:4 val:7.5
            └── LEAF id:5 val:10
        `);

        await filter.selectOperator('Greater than or equal to');
        await filter.setNumber(3, 0);
        await asyncSetTimeout(0);
        expect(filter.getModel()).toEqual({ filterType: 'number', type: 'greaterThanOrEqual', filter: 3 });
        await new GridRows(api, 'greaterThanOrEqual rows').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:3 val:3
            ├── LEAF id:4 val:7.5
            └── LEAF id:5 val:10
        `);

        await filter.selectOperator('Less than');
        await filter.setNumber(0, 0);
        await asyncSetTimeout(0);
        expect(filter.getModel()).toEqual({ filterType: 'number', type: 'lessThan', filter: 0 });
        await new GridRows(api, 'lessThan rows').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:0 val:-10
            └── LEAF id:1 val:-2.5
        `);

        await filter.selectOperator('Less than or equal to');
        await filter.setNumber(0, 0);
        await asyncSetTimeout(0);
        expect(filter.getModel()).toEqual({ filterType: 'number', type: 'lessThanOrEqual', filter: 0 });
        await new GridRows(api, 'lessThanOrEqual rows').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:0 val:-10
            ├── LEAF id:1 val:-2.5
            └── LEAF id:2 val:0
        `);
    });

    test('equals matches an exact negative decimal (no float drift)', async () => {
        const api: GridApi = await gridsManager.createGridAndWait('grid1', {
            columnDefs: [{ field: 'val', filter: 'agNumberColumnFilter', filterParams: { debounceMs: 0 } }],
            rowData: MIXED,
        });

        const filter = await ColumnFilterHarness.open(api, 'val');
        await filter.selectOperator('Equals');
        await filter.setNumber(-2.5, 0);
        await asyncSetTimeout(0);

        expect(filter.getModel()).toEqual({ filterType: 'number', type: 'equals', filter: -2.5 });
        await new FilterDom(api, 'equals negative decimal panel', { colId: 'val' }).checkFilterDom(`
            COLUMN FILTER
            operator: "Equals"
            input: "-2.5"
            AND
            operator: "Equals"
            input: "" ⟨Filter...⟩
            model:
              filterType: "number"
              type: "equals"
              filter: -2.5
        `);
        await new GridRows(api, 'equals negative decimal rows').check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:1 val:-2.5
        `);
    });

    test('inRange is exclusive of both bounds by default', async () => {
        const api: GridApi = await gridsManager.createGridAndWait('grid1', {
            columnDefs: [{ field: 'val', filter: 'agNumberColumnFilter', filterParams: { debounceMs: 0 } }],
            rowData: MIXED,
        });

        const filter = await ColumnFilterHarness.open(api, 'val');
        await filter.selectOperator('Between');
        await filter.setNumber(-2.5, 0);
        await filter.setNumber(7.5, 1);
        await asyncSetTimeout(0);

        expect(filter.getModel()).toEqual({ filterType: 'number', type: 'inRange', filter: -2.5, filterTo: 7.5 });
        await new FilterDom(api, 'inRange exclusive panel', { colId: 'val' }).checkFilterDom(`
            COLUMN FILTER
            operator: "Between"
            input [0]: "-2.5"
            input [1]: "7.5"
            AND
            operator: "Equals"
            input: "" ⟨Filter...⟩
            model:
              filterType: "number"
              type: "inRange"
              filter: -2.5
              filterTo: 7.5
        `);
        // exclusive: -2.5 and 7.5 excluded, only 0 and 3 remain.
        await new GridRows(api, 'inRange exclusive rows').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:2 val:0
            └── LEAF id:3 val:3
        `);
    });

    test('inRange includes both bounds when inRangeInclusive is true', async () => {
        const api: GridApi = await gridsManager.createGridAndWait('grid1', {
            columnDefs: [
                {
                    field: 'val',
                    filter: 'agNumberColumnFilter',
                    filterParams: { debounceMs: 0, inRangeInclusive: true },
                },
            ],
            rowData: MIXED,
        });

        const filter = await ColumnFilterHarness.open(api, 'val');
        await filter.selectOperator('Between');
        await filter.setNumber(-2.5, 0);
        await filter.setNumber(7.5, 1);
        await asyncSetTimeout(0);

        expect(filter.getModel()).toEqual({ filterType: 'number', type: 'inRange', filter: -2.5, filterTo: 7.5 });
        // inclusive: -2.5, 0, 3, 7.5 all pass.
        await new GridRows(api, 'inRange inclusive rows').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:1 val:-2.5
            ├── LEAF id:2 val:0
            ├── LEAF id:3 val:3
            └── LEAF id:4 val:7.5
        `);
    });

    // A strict range of one value matches nothing, but an inclusive one is an exact match, so reporting it
    // as out of order would leave a legitimate filter that can never be applied.
    test('inRange accepts a single-value range when inRangeInclusive is true', async () => {
        const api: GridApi = await gridsManager.createGridAndWait('grid1', {
            columnDefs: [
                {
                    field: 'val',
                    filter: 'agNumberColumnFilter',
                    filterParams: { debounceMs: 0, inRangeInclusive: true },
                },
            ],
            rowData: MIXED,
        });

        const filter = await ColumnFilterHarness.open(api, 'val');
        await filter.selectOperator('Between');
        await filter.setNumber(3, 0);
        await filter.setNumber(3, 1);
        await asyncSetTimeout(0);

        expect(filter.input('number', 0).validity.valid).toBe(true);
        expect(filter.input('number', 1).validity.valid).toBe(true);
        expect(filter.getModel()).toEqual({ filterType: 'number', type: 'inRange', filter: 3, filterTo: 3 });
        await new GridRows(api, 'an inclusive range of one value is an exact match').check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:3 val:3
        `);
    });

    test('blank and notBlank partition null vs non-null rows (0 is not blank)', async () => {
        const api: GridApi = await gridsManager.createGridAndWait('grid1', {
            columnDefs: [{ field: 'val', filter: 'agNumberColumnFilter', filterParams: { debounceMs: 0 } }],
            rowData: [{ val: 5 }, { val: null }, { val: 0 }, { val: null }, { val: -3 }],
        });

        const filter = await ColumnFilterHarness.open(api, 'val');

        await filter.selectOperator('Blank');
        await asyncSetTimeout(0);
        expect(filter.getModel()).toEqual({ filterType: 'number', type: 'blank' });
        await new FilterDom(api, 'blank panel', { colId: 'val' }).checkFilterDom(`
            COLUMN FILTER
            operator: "Blank"
            AND
            operator: "Equals"
            input: "" ⟨Filter...⟩
            model:
              filterType: "number"
              type: "blank"
        `);
        await new GridRows(api, 'blank rows').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:1 val:null
            └── LEAF id:3 val:null
        `);

        await filter.selectOperator('Not blank');
        await asyncSetTimeout(0);
        expect(filter.getModel()).toEqual({ filterType: 'number', type: 'notBlank' });
        // 0 counts as not blank.
        await new GridRows(api, 'notBlank rows').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:0 val:5
            ├── LEAF id:2 val:0
            └── LEAF id:4 val:-3
        `);
    });

    test('notEqual excludes blank rows by default', async () => {
        const api: GridApi = await gridsManager.createGridAndWait('grid1', {
            columnDefs: [{ field: 'val', filter: 'agNumberColumnFilter', filterParams: { debounceMs: 0 } }],
            rowData: [{ val: 5 }, { val: null }, { val: 8 }],
        });

        const filter = await ColumnFilterHarness.open(api, 'val');
        await filter.selectOperator('Does not equal');
        await filter.setNumber(5, 0);
        await asyncSetTimeout(0);

        expect(filter.getModel()).toEqual({ filterType: 'number', type: 'notEqual', filter: 5 });
        // The null row is excluded even though null != 5 (blanks excluded from notEqual by default).
        await new GridRows(api, 'notEqual excludes blank rows').check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:2 val:8
        `);
    });

    test('includeBlanksInNotEqual keeps blank rows in a notEqual filter', async () => {
        const api: GridApi = await gridsManager.createGridAndWait('grid1', {
            columnDefs: [
                {
                    field: 'val',
                    filter: 'agNumberColumnFilter',
                    filterParams: { debounceMs: 0, includeBlanksInNotEqual: true },
                },
            ],
            rowData: [{ val: 5 }, { val: null }, { val: 8 }],
        });

        const filter = await ColumnFilterHarness.open(api, 'val');
        await filter.selectOperator('Does not equal');
        await filter.setNumber(5, 0);
        await asyncSetTimeout(0);

        await new GridRows(api, 'notEqual includes blank rows').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:1 val:null
            └── LEAF id:2 val:8
        `);
    });

    test('includeBlanksInEquals keeps blank rows in an equals filter', async () => {
        const api: GridApi = await gridsManager.createGridAndWait('grid1', {
            columnDefs: [
                {
                    field: 'val',
                    filter: 'agNumberColumnFilter',
                    filterParams: { debounceMs: 0, includeBlanksInEquals: true },
                },
            ],
            rowData: [{ val: 5 }, { val: null }, { val: 8 }],
        });

        const filter = await ColumnFilterHarness.open(api, 'val');
        await filter.selectOperator('Equals');
        await filter.setNumber(5, 0);
        await asyncSetTimeout(0);

        // 5 matches directly; the null row is included via the flag.
        await new GridRows(api, 'equals includes blank rows').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:0 val:5
            └── LEAF id:1 val:null
        `);
    });

    test('includeBlanksInGreaterThan keeps blank rows in a greaterThan filter', async () => {
        const api: GridApi = await gridsManager.createGridAndWait('grid1', {
            columnDefs: [
                {
                    field: 'val',
                    filter: 'agNumberColumnFilter',
                    filterParams: { debounceMs: 0, includeBlanksInGreaterThan: true },
                },
            ],
            rowData: [{ val: 1 }, { val: null }, { val: 9 }],
        });

        const filter = await ColumnFilterHarness.open(api, 'val');
        await filter.selectOperator('Greater than');
        await filter.setNumber(5, 0);
        await asyncSetTimeout(0);

        // only 9 is strictly greater; the null row rides along via the flag.
        await new GridRows(api, 'greaterThan includes blank rows').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:1 val:null
            └── LEAF id:2 val:9
        `);
    });

    test('includeBlanksInLessThan keeps blank rows in a lessThan filter', async () => {
        const api: GridApi = await gridsManager.createGridAndWait('grid1', {
            columnDefs: [
                {
                    field: 'val',
                    filter: 'agNumberColumnFilter',
                    filterParams: { debounceMs: 0, includeBlanksInLessThan: true },
                },
            ],
            rowData: [{ val: 1 }, { val: null }, { val: 9 }],
        });

        const filter = await ColumnFilterHarness.open(api, 'val');
        await filter.selectOperator('Less than');
        await filter.setNumber(5, 0);
        await asyncSetTimeout(0);

        await new GridRows(api, 'lessThan includes blank rows').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:0 val:1
            └── LEAF id:1 val:null
        `);
    });

    test('includeBlanksInRange keeps blank rows in an inRange filter', async () => {
        const api: GridApi = await gridsManager.createGridAndWait('grid1', {
            columnDefs: [
                {
                    field: 'val',
                    filter: 'agNumberColumnFilter',
                    filterParams: { debounceMs: 0, includeBlanksInRange: true },
                },
            ],
            rowData: [{ val: 1 }, { val: null }, { val: 5 }, { val: 9 }],
        });

        const filter = await ColumnFilterHarness.open(api, 'val');
        await filter.selectOperator('Between');
        await filter.setNumber(2, 0);
        await filter.setNumber(8, 1);
        await asyncSetTimeout(0);

        // 5 is strictly inside (2,8); the null row is included via the flag.
        await new GridRows(api, 'inRange includes blank rows').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:1 val:null
            └── LEAF id:2 val:5
        `);
    });

    test('allowedCharPattern + numberParser parse comma decimals', async () => {
        const api: GridApi = await gridsManager.createGridAndWait('grid1', {
            columnDefs: [
                {
                    field: 'val',
                    filter: 'agNumberColumnFilter',
                    filterParams: {
                        debounceMs: 0,
                        allowedCharPattern: '\\d\\-\\,',
                        numberParser: (text: string | null) =>
                            text == null || text === '' ? null : Number(text.replace(',', '.')),
                        numberFormatter: (value: number | null) =>
                            value == null ? null : String(value).replace('.', ','),
                    },
                },
            ],
            rowData: [{ val: 1.5 }, { val: 2 }, { val: 3.25 }],
        });

        const filter = await ColumnFilterHarness.open(api, 'val');
        await filter.selectOperator('Equals');
        // allowedCharPattern turns the input into a text field, so drive it as text.
        await filter.setText('1,5', 0);
        await asyncSetTimeout(0);

        expect(filter.getModel()).toEqual({ filterType: 'number', type: 'equals', filter: 1.5 });
        await new FilterDom(api, 'comma-parsed equals panel', { colId: 'val' }).checkFilterDom(`
            COLUMN FILTER
            operator: "Equals"
            input: "1,5"
            AND
            operator: "Equals"
            input: "" ⟨Filter...⟩
            model:
              filterType: "number"
              type: "equals"
              filter: 1.5
        `);
        await new GridRows(api, 'comma-parsed equals rows').check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:0 val:1.5
        `);
    });

    test('numberFormatter reaches both inputs, and they can hold it', async () => {
        const numberFormatter = (value: number | null) => (value == null ? null : `${value} units`);
        const numberParser = (text: string | null) => (text == null ? null : parseFloat(text));
        const columnDef = {
            field: 'val',
            filter: 'agNumberColumnFilter' as const,
            // `allowedCharPattern` is what admits the letters `5 units` needs; without it the input is numeric.
            filterParams: { debounceMs: 0, allowedCharPattern: '\\d\\w\\s\\.\\-', numberFormatter, numberParser },
        };
        const rowData = [{ val: 5 }, { val: 7 }];

        const floatingApi: GridApi = await gridsManager.createGridAndWait('grid1', {
            columnDefs: [{ ...columnDef, floatingFilter: true }],
            rowData,
        });
        await floatingApi.setColumnFilterModel('val', { filterType: 'number', type: 'equals', filter: 5 });
        floatingApi.onFilterChanged();
        await asyncSetTimeout(0);

        const floatingInput = FloatingFilterHarness.get(floatingApi, 'val').inputs()[0];
        expect(floatingInput.type).toBe('text');
        expect(floatingInput.value).toBe('5 units');

        const api: GridApi = await gridsManager.createGridAndWait('grid2', { columnDefs: [columnDef], rowData });
        await api.setColumnFilterModel('val', { filterType: 'number', type: 'equals', filter: 5 });
        api.onFilterChanged();
        await asyncSetTimeout(0);

        const filter = await ColumnFilterHarness.open(api, 'val');
        expect(filter.inputs('text')[0].value).toBe('5 units');

        // Read back through the same text field: what the formatter wrote still parses to the number.
        await filter.setText('7 units', 0);
        await asyncSetTimeout(0);
        expect(filter.getModel()).toEqual({ filterType: 'number', type: 'equals', filter: 7 });
        await new GridRows(api, 'formatted number filter rows').check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:1 val:7
        `);
    });

    test('a numberFormatter no parser reads back still shows, and the model it came from stands', async () => {
        const api: GridApi = await gridsManager.createGridAndWait('grid1', {
            columnDefs: [
                {
                    field: 'val',
                    filter: 'agNumberColumnFilter',
                    filterParams: {
                        debounceMs: 0,
                        // Groups the thousands, so its own output does not read back as the number it came from.
                        numberFormatter: (value: number | null) =>
                            value == null ? null : value.toLocaleString('en-US'),
                    },
                },
            ],
            rowData: [{ val: 1234 }, { val: 5 }],
        });
        await api.setColumnFilterModel('val', { filterType: 'number', type: 'equals', filter: 1234 });
        await api.onFilterChanged();

        const filter = await ColumnFilterHarness.open(api, 'val');
        // `1,234` would come back as 1, so it is shown but never read back as the value behind it.
        expect(filter.inputs('text', 0)[0].value).toBe('1,234');

        await filter.selectOperator('Does not equal');
        await asyncSetTimeout(0);
        expect(api.getColumnFilterModel('val')).toEqual({ filterType: 'number', type: 'notEqual', filter: 1234 });
        await new GridRows(api, 'the value survives an operator change').check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:1 val:5
        `);
    });

    test('a formatted inRange pair is validated on the values it was rendered with', async () => {
        const api: GridApi = await gridsManager.createGridAndWait('grid1', {
            columnDefs: [
                {
                    field: 'val',
                    filter: 'agNumberColumnFilter',
                    filterParams: {
                        debounceMs: 0,
                        // Grouped, so re-reading the rendered text would make `1,000` the number 1.
                        numberFormatter: (value: number | null) =>
                            value == null ? null : value.toLocaleString('en-US'),
                    },
                },
            ],
            rowData: [{ val: 1 }, { val: 500 }, { val: 3000 }],
        });
        await api.setColumnFilterModel('val', {
            filterType: 'number',
            type: 'inRange',
            filter: 2,
            filterTo: 1000,
        });
        await api.onFilterChanged();

        const filter = await ColumnFilterHarness.open(api, 'val');
        const inputs = filter.inputs('text', 0);
        expect([inputs[0].value, inputs[1].value]).toEqual(['2', '1,000']);
        // Re-read as text the bounds would be 2 and 1, and the pair would be reported out of order.
        expect(inputs[1].validationMessage).toBe('');
        await new GridRows(api, 'formatted inRange bounds').check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:1 val:500
        `);
    });

    test('a formatter change re-renders the second condition too', async () => {
        const columnDefs = (suffix: string) => [
            {
                field: 'val',
                filter: 'agNumberColumnFilter' as const,
                filterParams: {
                    debounceMs: 0,
                    numberFormatter: (value: number | null) => (value == null ? null : `${value}${suffix}`),
                },
            },
        ];
        const api: GridApi = await gridsManager.createGridAndWait('grid1', {
            columnDefs: columnDefs(' old'),
            rowData: [{ val: 5 }, { val: 7 }],
        });
        await api.setColumnFilterModel('val', {
            filterType: 'number',
            operator: 'OR',
            conditions: [
                { filterType: 'number', type: 'equals', filter: 5 },
                { filterType: 'number', type: 'equals', filter: 7 },
            ],
        });

        const filter = await ColumnFilterHarness.open(api, 'val');
        expect([filter.inputs('text', 0)[0].value, filter.inputs('text', 1)[0].value]).toEqual(['5 old', '7 old']);

        api.setGridOption('columnDefs', columnDefs(' new'));
        await asyncSetTimeout(0);

        // Every mounted position is shown again, not only the first.
        expect([filter.inputs('text', 0)[0].value, filter.inputs('text', 1)[0].value]).toEqual(['5 new', '7 new']);
        await new GridRows(api, 'both conditions survive the formatter change').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:0 val:5
            └── LEAF id:1 val:7
        `);
    });

    // `Number` reads every one of these back as 1234, but an `<input type="number">` keeps none of them.
    test.each([
        ['padded', (value: number) => `  ${value}  `, '  1234  '],
        ['explicitly signed', (value: number) => `+${value}`, '+1234'],
        ['hexadecimal', (value: number) => `0x${value.toString(16)}`, '0x4d2'],
        ['exponent notation', (value: number) => value.toExponential(3), '1.234e+3'],
    ])('%s numberFormatter output is shown as it wrote it', async (_name, format, shown) => {
        const api: GridApi = await gridsManager.createGridAndWait('grid1', {
            columnDefs: [
                {
                    field: 'val',
                    filter: 'agNumberColumnFilter',
                    filterParams: {
                        debounceMs: 0,
                        numberFormatter: (value: number | null) => (value == null ? null : format(value)),
                    },
                },
            ],
            rowData: [{ val: 1234 }, { val: 5 }],
        });
        await api.setColumnFilterModel('val', { filterType: 'number', type: 'equals', filter: 1234 });

        // Found as a text input at all: the formatter alone is what makes it one.
        const filter = await ColumnFilterHarness.open(api, 'val');
        expect(filter.inputs('text', 0)[0].value).toBe(shown);
        // None of these read back as 1234, and none has to: the model holds what the filter rendered.
        expect(filter.getModel()).toEqual({ filterType: 'number', type: 'equals', filter: 1234 });
    });

    // Neither reads back: `1,234` is not what `parseFloat` makes of it, and `1235` has lost the .56.
    // The last row is the formatter on its own, whose reader is the `parseFloat` the others name explicitly.
    test.each([
        ['a grouping', undefined, (value: number) => value.toLocaleString('en-US'), true, 1234, '1,234', '2,000', 2],
        ['a rounding', '\\d\\-\\.', (value: number) => value.toFixed(0), true, 1234.56, '1235', '2000', 2000],
        ['no parser', undefined, (value: number) => value.toLocaleString('en-US'), false, 1000, '1,000', '2,000', 2],
    ] as const)(
        'an editable floating filter with %s formatter shows what it wrote, and reads back what is typed',
        async (_name, allowedCharPattern, format, withParser, filter, expected, typed, typedFilter) => {
            const api: GridApi = await gridsManager.createGridAndWait('grid1', {
                columnDefs: [
                    {
                        field: 'val',
                        filter: 'agNumberColumnFilter',
                        floatingFilter: true,
                        filterParams: {
                            debounceMs: 0,
                            allowedCharPattern,
                            numberFormatter: (value: number | null) => (value == null ? null : format(value)),
                            numberParser: withParser
                                ? (text: string | null) => (text == null || text === '' ? null : parseFloat(text))
                                : undefined,
                        },
                    },
                ],
                rowData: [{ val: filter }, { val: 5 }],
            });
            await api.setColumnFilterModel('val', { filterType: 'number', type: 'equals', filter });
            await api.onFilterChanged();
            await asyncSetTimeout(0);

            const floating = FloatingFilterHarness.get(api, 'val');
            expect(floating.input().value).toBe(expected);
            // The text is the formatter's, so reading it back would replace the model it was rendered from.
            expect(api.getColumnFilterModel('val')).toEqual({ filterType: 'number', type: 'equals', filter });

            await floating.setValue(typed);
            await asyncSetTimeout(0);

            expect(api.getColumnFilterModel('val')).toEqual({
                filterType: 'number',
                type: 'equals',
                filter: typedFilter,
            });
        }
    );

    // The element type is derived from the other two parameters unless it is named outright.
    test.each([
        [
            'a formatter alone takes a text input',
            { numberFormatter: (v: number | null) => (v == null ? null : v.toFixed(2)) },
            'text',
            '5.00',
        ],
        [
            'which `number` overrides, for a formatter it can hold',
            {
                numberFormatter: (v: number | null) => (v == null ? null : v.toFixed(2)),
                filterInputType: 'number' as const,
            },
            'number',
            '5.00',
        ],
        ['and `text` takes one with neither parameter set', { filterInputType: 'text' as const }, 'text', '5'],
    ])('%s', async (_name, extraParams, expectedType, expectedValue) => {
        const api: GridApi = await gridsManager.createGridAndWait('grid1', {
            columnDefs: [
                { field: 'val', filter: 'agNumberColumnFilter', filterParams: { debounceMs: 0, ...extraParams } },
            ],
            rowData: [{ val: 5 }, { val: 7 }],
        });
        await api.setColumnFilterModel('val', { filterType: 'number', type: 'equals', filter: 5 });

        const filter = await ColumnFilterHarness.open(api, 'val');
        const input = filter.inputs(expectedType as 'text' | 'number', 0)[0];
        expect(input.value).toBe(expectedValue);
        expect(api.getColumnFilterModel('val')).toEqual({ filterType: 'number', type: 'equals', filter: 5 });
    });

    // Two construction sites: the filter builds the `number` input, the shared base builds the `text` one,
    // and a replacement is built from params rather than copied from the element it replaces.
    test('an input carries browserAutoComplete, and so does the replacement a colDef change builds', async () => {
        const columnDefs = (allowedCharPattern?: string) => [
            {
                field: 'val',
                filter: 'agNumberColumnFilter' as const,
                filterParams: { debounceMs: 0, browserAutoComplete: 'one-time-code', allowedCharPattern },
            },
        ];
        const api: GridApi = await gridsManager.createGridAndWait('grid1', {
            columnDefs: columnDefs(),
            rowData: [{ val: 5 }, { val: 7 }],
        });

        const filter = await ColumnFilterHarness.open(api, 'val');
        expect(filter.input('number', 0).getAttribute('autocomplete')).toBe('one-time-code');

        api.setGridOption('columnDefs', columnDefs('\\d\\-'));
        await asyncSetTimeout(0);

        expect(filter.input('text', 0).getAttribute('autocomplete')).toBe('one-time-code');
    });

    // The pattern narrows what can be typed, which a `number` input enforces as readily as a text one.
    test('an allowedCharPattern applies to a `number` input too', async () => {
        const filterParams = { debounceMs: 0, filterInputType: 'number' as const, allowedCharPattern: '\\d' };
        const api: GridApi = await gridsManager.createGridAndWait('grid1', {
            columnDefs: [
                { field: 'val', filter: 'agNumberColumnFilter', filterParams },
                { field: 'floating', filter: 'agNumberColumnFilter', floatingFilter: true, filterParams },
            ],
            rowData: [{ val: 5, floating: 5 }],
        });

        const filter = await ColumnFilterHarness.open(api, 'val');
        const inputs = [filter.input('number', 0), FloatingFilterHarness.get(api, 'floating').input()];
        // A `number` input reports its text as blank until it parses, so the edit is what can be observed.
        const admits = (input: HTMLInputElement, data: string): boolean =>
            input.dispatchEvent(
                new InputEvent('beforeinput', { inputType: 'insertText', data, cancelable: true, bubbles: true })
            );
        for (const input of inputs) {
            expect(input.type).toBe('number');
            expect(admits(input, 'e')).toBe(false);
            expect(admits(input, '5')).toBe(true);
        }
    });

    // Handlers re-apply the model after a `colDef` change, and a value held by an apply button is not in it.
    test.each([
        [false, '5'],
        [true, ''],
    ])(
        'a floating filter rebuilt for a new allowedCharPattern carries what was being typed (handlers: %s)',
        async (enableFilterHandlers, expected) => {
            const columnDefs = (allowedCharPattern?: string) => [
                {
                    field: 'val',
                    filter: 'agNumberColumnFilter' as const,
                    floatingFilter: true,
                    // An apply button holds the typed value in the input, which is what the rebuild has to carry.
                    filterParams: { buttons: ['apply' as const], allowedCharPattern },
                },
            ];
            const api: GridApi = await gridsManager.createGridAndWait('grid1', {
                enableFilterHandlers,
                columnDefs: columnDefs(),
                rowData: [{ val: 5 }, { val: 7 }],
            });

            await FloatingFilterHarness.get(api, 'val').setValue('5');
            // The pattern decides the element type, so the input is rebuilt rather than reconfigured.
            api.setGridOption('columnDefs', columnDefs('\\d\\-'));
            await asyncSetTimeout(0);

            expect(FloatingFilterHarness.get(api, 'val').input().value).toBe(expected);
        }
    );

    test('a read-only floating filter keeps its summary, which is not one value to read back', async () => {
        const api: GridApi = await gridsManager.createGridAndWait('grid1', {
            columnDefs: [
                {
                    field: 'val',
                    filter: 'agNumberColumnFilter',
                    floatingFilter: true,
                    filterParams: {
                        debounceMs: 0,
                        readOnly: true,
                        // Leads with text, so nothing reads the summary back as the number inside it.
                        numberFormatter: (value: number | null) => (value == null ? null : `units: ${value}`),
                    },
                },
            ],
            rowData: [{ val: 5 }, { val: 7 }],
        });
        await api.setColumnFilterModel('val', { filterType: 'number', type: 'equals', filter: 5 });
        await api.onFilterChanged();
        await asyncSetTimeout(0);

        expect(FloatingFilterHarness.get(api, 'val').input().value).toBe('units: 5');
    });

    test('a numberParser reading the formatter is what decides, not `Number`', async () => {
        const api: GridApi = await gridsManager.createGridAndWait('grid1', {
            columnDefs: [
                {
                    field: 'val',
                    filter: 'agNumberColumnFilter',
                    filterParams: {
                        debounceMs: 0,
                        // Grouped with `.`, which a number input holds and only this parser reads back.
                        numberFormatter: (value: number | null) =>
                            value == null ? null : value.toLocaleString('de-DE'),
                        numberParser: (text: string | null) =>
                            text == null || text === '' ? null : Number(text.replace(/\./g, '')),
                    },
                },
            ],
            rowData: [{ val: 1234 }, { val: 5 }],
        });
        await api.setColumnFilterModel('val', { filterType: 'number', type: 'equals', filter: 1234 });

        const filter = await ColumnFilterHarness.open(api, 'val');
        expect(filter.inputs('text', 0)[0].value).toBe('1.234');
        expect(filter.getModel()).toEqual({ filterType: 'number', type: 'equals', filter: 1234 });
    });

    test('a read-only summary follows numberFormatter across a colDef refresh', async () => {
        const columnDefs = (suffix: string) => [
            {
                field: 'val',
                filter: 'agNumberColumnFilter' as const,
                floatingFilter: true,
                filterParams: {
                    debounceMs: 0,
                    readOnly: true,
                    numberFormatter: (value: number | null) => (value == null ? null : `${value} ${suffix}`),
                },
            },
        ];
        const api: GridApi = await gridsManager.createGridAndWait('grid1', {
            columnDefs: columnDefs('units'),
            rowData: [{ val: 5 }, { val: 7 }],
        });

        await api.setColumnFilterModel('val', { filterType: 'number', type: 'equals', filter: 5 });
        api.onFilterChanged();
        await asyncSetTimeout(0);
        expect(FloatingFilterHarness.get(api, 'val').inputs()[0].value).toBe('5 units');

        // The formatter is read from the params each time, so a refresh that replaces it is picked up.
        api.updateGridOptions({ columnDefs: columnDefs('kg') });
        await api.setColumnFilterModel('val', { filterType: 'number', type: 'equals', filter: 7 });
        api.onFilterChanged();
        await asyncSetTimeout(0);
        expect(FloatingFilterHarness.get(api, 'val').inputs()[0].value).toBe('7 kg');
    });

    test('two conditions joined with AND', async () => {
        const api: GridApi = await gridsManager.createGridAndWait('grid1', {
            columnDefs: [{ field: 'val', filter: 'agNumberColumnFilter', filterParams: { debounceMs: 0 } }],
            rowData: MIXED,
        });

        const filter = await ColumnFilterHarness.open(api, 'val');
        await filter.selectOperator('Greater than', 0);
        await filter.setNumber(0, 0);
        await filter.setJoinOperator('AND');
        await filter.selectOperator('Less than', 1);
        await filter.setNumber(10, 1);
        await asyncSetTimeout(0);

        expect(filter.getModel()).toEqual({
            filterType: 'number',
            operator: 'AND',
            conditions: [
                { filterType: 'number', type: 'greaterThan', filter: 0 },
                { filterType: 'number', type: 'lessThan', filter: 10 },
            ],
        });
        await new FilterDom(api, 'AND panel', { colId: 'val' }).checkFilterDom(`
            COLUMN FILTER
            operator: "Greater than"
            input: "0"
            AND
            operator: "Less than"
            input: "10"
            model:
              filterType: "number"
              operator: "AND"
              conditions:
                - filterType: "number"
                  type: "greaterThan"
                  filter: 0
                - filterType: "number"
                  type: "lessThan"
                  filter: 10
        `);
        // >0 AND <10: only 3 and 7.5.
        await new GridRows(api, 'AND rows').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:3 val:3
            └── LEAF id:4 val:7.5
        `);
    });

    test('two conditions joined with OR', async () => {
        const api: GridApi = await gridsManager.createGridAndWait('grid1', {
            columnDefs: [{ field: 'val', filter: 'agNumberColumnFilter', filterParams: { debounceMs: 0 } }],
            rowData: MIXED,
        });

        const filter = await ColumnFilterHarness.open(api, 'val');
        await filter.selectOperator('Equals', 0);
        await filter.setNumber(-10, 0);
        await filter.setJoinOperator('OR');
        await filter.selectOperator('Equals', 1);
        await filter.setNumber(10, 1);
        await asyncSetTimeout(0);

        expect(filter.getModel()).toEqual({
            filterType: 'number',
            operator: 'OR',
            conditions: [
                { filterType: 'number', type: 'equals', filter: -10 },
                { filterType: 'number', type: 'equals', filter: 10 },
            ],
        });
        await new FilterDom(api, 'OR panel', { colId: 'val' }).checkFilterDom(`
            COLUMN FILTER
            operator: "Equals"
            input: "-10"
            OR
            operator: "Equals"
            input: "10"
            model:
              filterType: "number"
              operator: "OR"
              conditions:
                - filterType: "number"
                  type: "equals"
                  filter: -10
                - filterType: "number"
                  type: "equals"
                  filter: 10
        `);
        // ==-10 OR ==10.
        await new GridRows(api, 'OR rows').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:0 val:-10
            └── LEAF id:5 val:10
        `);
    });

    test('model round-trip: setFilterModel populates the popup and filters rows', async () => {
        const api: GridApi = await gridsManager.createGridAndWait('grid1', {
            columnDefs: [{ field: 'val', filter: 'agNumberColumnFilter', filterParams: { debounceMs: 0 } }],
            rowData: MIXED,
        });

        api.setFilterModel({ val: { filterType: 'number', type: 'inRange', filter: -2.5, filterTo: 7.5 } });
        await asyncSetTimeout(0);

        expect(api.getFilterModel()).toEqual({
            val: { filterType: 'number', type: 'inRange', filter: -2.5, filterTo: 7.5 },
        });
        await new GridRows(api, 'round-trip rows').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:2 val:0
            └── LEAF id:3 val:3
        `);

        // Re-opening the popup reflects the programmatic model in its inputs.
        await ColumnFilterHarness.open(api, 'val');
        await new FilterDom(api, 'round-trip panel', { colId: 'val' }).checkFilterDom(`
            COLUMN FILTER
            operator: "Between"
            input [0]: "-2.5"
            input [1]: "7.5"
            AND
            operator: "Equals"
            input: "" ⟨Filter...⟩
            model:
              filterType: "number"
              type: "inRange"
              filter: -2.5
              filterTo: 7.5
        `);
    });

    test('a combined model with no conditions reports when it is set, not when the filter is opened', async () => {
        enableDevValidations({ throwOn: ALL_SEVERITIES, suppress: [77] });
        const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

        const api: GridApi = await gridsManager.createGridAndWait('grid1', {
            columnDefs: [{ field: 'val', filter: 'agNumberColumnFilter', filterParams: { debounceMs: 0 } }],
            rowData: MIXED,
        });

        await api.setColumnFilterModel('val', { filterType: 'number', operator: 'AND' });
        api.onFilterChanged();
        await asyncSetTimeout(0);

        // The model is judged where it arrives. Reported from the display instead, a model set through the
        // API and never looked at is never reported at all.
        expect(warnSpy.mock.calls.flat().join(' ')).toContain('warning #77');
    });

    test('a combined model with no conditions is tolerated rather than throwing', async () => {
        // Deliberate: a combined model without `conditions` is reported as warning #77.
        enableDevValidations({ throwOn: ALL_SEVERITIES, suppress: [77] });
        const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

        const api: GridApi = await gridsManager.createGridAndWait('grid1', {
            columnDefs: [{ field: 'val', filter: 'agNumberColumnFilter', filterParams: { debounceMs: 0 } }],
            rowData: MIXED,
        });

        const filter = await ColumnFilterHarness.open(api, 'val');
        await filter.selectOperator('Equals');
        await filter.setNumber(3, 0);
        await asyncSetTimeout(0);

        // Hand-written models reach the grid: a join operator with no conditions must not break filtering,
        // and the open panel must still follow it.
        await api.setColumnFilterModel('val', { filterType: 'number', operator: 'AND' });
        api.onFilterChanged();
        await asyncSetTimeout(0);

        expect(warnSpy.mock.calls.flat().join(' ')).toContain('warning #77');
        expect(api.getColumnFilterModel('val')).toEqual({ filterType: 'number', operator: 'AND' });
        // The panel is back to one condition, with nothing before the first for a join to join it to.
        await new FilterDom(api, 'conditionless combined model panel', { colId: 'val' }).checkFilterDom(`
            COLUMN FILTER
            operator: "Equals"
            input: "" ⟨Filter...⟩
            model:
              filterType: "number"
              operator: "AND"
        `);
        await new GridRows(api, 'conditionless combined model matches every row').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:0 val:-10
            ├── LEAF id:1 val:-2.5
            ├── LEAF id:2 val:0
            ├── LEAF id:3 val:3
            ├── LEAF id:4 val:7.5
            └── LEAF id:5 val:10
        `);

        // `OR` is the operator that separates passing every row from failing every one of them: joining no
        // conditions with `some` would match nothing, where `every` over an empty list already matched all.
        await api.setColumnFilterModel('val', { filterType: 'number', operator: 'OR' });
        api.onFilterChanged();
        await asyncSetTimeout(0);

        await new GridRows(api, 'a conditionless OR matches every row too').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:0 val:-10
            ├── LEAF id:1 val:-2.5
            ├── LEAF id:2 val:0
            ├── LEAF id:3 val:3
            ├── LEAF id:4 val:7.5
            └── LEAF id:5 val:10
        `);

        // A well-formed model applied over it still takes effect.
        await api.setColumnFilterModel('val', { filterType: 'number', type: 'greaterThan', filter: 7 });
        api.onFilterChanged();
        await asyncSetTimeout(0);

        await new GridRows(api, 'valid model applied after the malformed one').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:4 val:7.5
            └── LEAF id:5 val:10
        `);
    });

    test('a floating filter follows a combined model with no conditions rather than throwing', async () => {
        // No popup is built here, so the floating filter is the only thing that has to follow the model.
        enableDevValidations({ throwOn: ALL_SEVERITIES, suppress: [77] });
        const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
        const api: GridApi = await gridsManager.createGridAndWait('grid1', {
            columnDefs: [
                { field: 'val', filter: 'agNumberColumnFilter', floatingFilter: true, filterParams: { debounceMs: 0 } },
            ],
            rowData: MIXED,
        });

        // Filled first, or an emptied input cannot be told from one that was never given anything.
        await api.setColumnFilterModel('val', { filterType: 'number', type: 'equals', filter: 3 });
        api.onFilterChanged();
        await asyncSetTimeout(0);
        expect(FloatingFilterHarness.get(api, 'val').input().value).toBe('3');

        await api.setColumnFilterModel('val', { filterType: 'number', operator: 'AND' });
        api.onFilterChanged();
        await asyncSetTimeout(0);

        // Strict: a key that was never there must not be matched by one rewritten to `undefined`.
        expect(api.getColumnFilterModel('val')).toStrictEqual({ filterType: 'number', operator: 'AND' });
        // No condition to read back, so the floating filter shows nothing rather than a value it does not have.
        expect(FloatingFilterHarness.get(api, 'val').input().value).toBe('');
        expect(warnSpy.mock.calls.flat().join(' ')).toContain('warning #77');
    });

    test('`maxNumConditions` below one leaves a lone condition alone rather than rewriting it forever', async () => {
        enableDevValidations({ throwOn: ALL_SEVERITIES, suppress: [79] });
        const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
        const api: GridApi = await gridsManager.createGridAndWait('grid1', {
            columnDefs: [
                { field: 'val', filter: 'agNumberColumnFilter', filterParams: { debounceMs: 0, maxNumConditions: 0 } },
            ],
            rowData: MIXED,
        });
        expect(warnSpy.mock.calls.flat().join(' ')).toContain('warning #79');

        await api.setColumnFilterModel('val', { filterType: 'number', type: 'greaterThan', filter: 0 });
        api.onFilterChanged();
        await asyncSetTimeout(0);
        expect(api.getColumnFilterModel('val')).toEqual({ filterType: 'number', type: 'greaterThan', filter: 0 });

        let modelChanges = 0;
        api.addEventListener('filterChanged', () => modelChanges++);

        // Only a refresh re-validates, so repeating one is what separates a limit that leaves the model
        // alone from one that rewrites it a little further on every pass.
        for (let pass = 0; pass < 2; pass++) {
            api.setGridOption('columnDefs', [
                {
                    field: 'val',
                    filter: 'agNumberColumnFilter',
                    filterParams: { debounceMs: 0, maxNumConditions: 0 },
                },
            ]);
            await asyncSetTimeout(0);
        }

        expect(modelChanges).toBe(0);
        expect(api.getColumnFilterModel('val')).toEqual({ filterType: 'number', type: 'greaterThan', filter: 0 });
    });

    // `NaN` is the case a bare `< 1` test misses: every comparison against it is false, so an unfloored
    // limit would cap nothing and hand back both conditions.
    test.each([
        ['below one', 0],
        ['not a number', Number.NaN],
    ])('`maxNumConditions` %s keeps one condition rather than emptying the model', async (_name, maxNumConditions) => {
        enableDevValidations({ throwOn: ALL_SEVERITIES, suppress: [79] });
        const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
        const api: GridApi = await gridsManager.createGridAndWait('grid1', {
            columnDefs: [
                { field: 'val', filter: 'agNumberColumnFilter', filterParams: { debounceMs: 0, maxNumConditions } },
            ],
            rowData: MIXED,
        });
        expect(warnSpy.mock.calls.flat().join(' ')).toContain('warning #79');

        await api.setColumnFilterModel('val', {
            filterType: 'number',
            operator: 'AND',
            conditions: [
                { filterType: 'number', type: 'greaterThan', filter: 0 },
                { filterType: 'number', type: 'lessThan', filter: 5 },
            ],
        });
        api.onFilterChanged();
        await asyncSetTimeout(0);

        // The first condition survives and filters: emptying the list would leave a model nothing can show.
        expect(api.getColumnFilterModel('val')).toEqual({ filterType: 'number', type: 'greaterThan', filter: 0 });
        await new GridRows(api, 'the one surviving condition filters').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:3 val:3
            ├── LEAF id:4 val:7.5
            └── LEAF id:5 val:10
        `);
    });

    // Characterises a mismatch rather than asserting a fix: `maxNumConditions` caps what the panel builds,
    // and where it is unset the model keeps every condition the caller set, so a filter can evaluate more
    // conditions than the panel can show. Capping the model instead would silently drop a condition from a
    // working `setFilterModel` call, which is why it is left as it is.
    test('an unset `maxNumConditions` leaves the model every condition it was given', async () => {
        const api: GridApi = await gridsManager.createGridAndWait('grid1', {
            columnDefs: [{ field: 'val', filter: 'agNumberColumnFilter', filterParams: { debounceMs: 0 } }],
            rowData: MIXED,
        });

        await api.setColumnFilterModel('val', {
            filterType: 'number',
            operator: 'AND',
            conditions: [
                { filterType: 'number', type: 'greaterThan', filter: 0 },
                { filterType: 'number', type: 'lessThan', filter: 8 },
                { filterType: 'number', type: 'notEqual', filter: 3 },
            ],
        });
        api.onFilterChanged();
        await asyncSetTimeout(0);

        expect(api.getColumnFilterModel('val')).toEqual({
            filterType: 'number',
            operator: 'AND',
            conditions: [
                { filterType: 'number', type: 'greaterThan', filter: 0 },
                { filterType: 'number', type: 'lessThan', filter: 8 },
                { filterType: 'number', type: 'notEqual', filter: 3 },
            ],
        });
        // 3 is what proves the third condition is evaluated: the first two admit it.
        await new GridRows(api, 'all three conditions filter, past what the panel would show').check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:4 val:7.5
        `);
    });

    // The two limits are floored on the display as well as in the model, and the message names the floor.
    // `NaN` is the case a bare `< 1` test misses, leaving a limit every later comparison reads as no limit.
    test.each([
        ['below one', 0],
        ['not a number', Number.NaN],
    ])('a condition limit %s is reported as needing to be at least one', async (_name, limit) => {
        enableDevValidations({ throwOn: ALL_SEVERITIES, suppress: [79, 80] });
        const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

        const api: GridApi = await gridsManager.createGridAndWait('grid1', {
            columnDefs: [
                {
                    field: 'val',
                    filter: 'agNumberColumnFilter',
                    filterParams: { debounceMs: 0, maxNumConditions: limit, numAlwaysVisibleConditions: limit },
                },
            ],
            rowData: MIXED,
        });

        await ColumnFilterHarness.open(api, 'val');

        const warnings = warnSpy.mock.calls.flat().join(' ');
        expect(warnings).toContain(
            '`filterParams.maxNumConditions` on column `val` must be greater than or equal to one.'
        );
        expect(warnings).toContain(
            '`filterParams.numAlwaysVisibleConditions` on column `val` must be greater than or equal to one.'
        );
        // Both floored to one, so the panel shows a single condition and nothing to join it to.
        await new FilterDom(api, 'both condition limits floored to one', { colId: 'val' }).checkFilterDom(`
            COLUMN FILTER
            operator: "Equals"
            input: "" ⟨Filter...⟩
            model: null
        `);
    });

    test('a cell no number can be compared with is excluded rather than ordered against', async () => {
        const api: GridApi = await gridsManager.createGridAndWait('grid1', {
            columnDefs: [{ field: 'val', filter: 'agNumberColumnFilter', filterParams: { debounceMs: 0 } }],
            rowData: [{ val: 1 }, { val: 'N/A' }, { val: 'abc' }, { val: 9 }],
        });

        // The ordering operators are where a non-coercing check would differ, letting every such row through.
        await api.setColumnFilterModel('val', { filterType: 'number', type: 'lessThan', filter: 5 });
        api.onFilterChanged();
        await asyncSetTimeout(0);
        await new GridRows(api, 'lessThan skips the uncomparable cells').check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:0 val:1
        `);

        await api.setColumnFilterModel('val', { filterType: 'number', type: 'greaterThan', filter: 5 });
        api.onFilterChanged();
        await asyncSetTimeout(0);
        await new GridRows(api, 'greaterThan skips them too').check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:3 val:9
        `);

        // `notEqual` is the one an uncomparable cell still passes, as nothing it holds equals the filter value.
        await api.setColumnFilterModel('val', { filterType: 'number', type: 'notEqual', filter: 1 });
        api.onFilterChanged();
        await asyncSetTimeout(0);
        await new GridRows(api, 'notEqual keeps them').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:1 val:"Invalid Number"
            ├── LEAF id:2 val:"Invalid Number"
            └── LEAF id:3 val:9
        `);
    });

    test('a numberParser replaced at runtime is used by inputs built before the change', async () => {
        const api: GridApi = await gridsManager.createGridAndWait('grid1', {
            columnDefs: [
                {
                    field: 'val',
                    filter: 'agNumberColumnFilter',
                    filterParams: {
                        debounceMs: 0,
                        allowedCharPattern: '\\d\\-\\,\\.',
                        // Reads "1,5" as one-and-a-half.
                        numberParser: (text: string | null) =>
                            text == null || text === '' ? null : Number(text.replace(',', '.')),
                    },
                },
            ],
            rowData: [{ val: 1.5 }, { val: 15 }],
        });

        // Building the condition's inputs is what captures the params, so open before swapping them.
        const filter = await ColumnFilterHarness.open(api, 'val');

        api.setGridOption('columnDefs', [
            {
                field: 'val',
                filter: 'agNumberColumnFilter',
                filterParams: {
                    debounceMs: 0,
                    allowedCharPattern: '\\d\\-\\,\\.',
                    // Reads "1,5" as fifteen: the comma is a thousands separator.
                    numberParser: (text: string | null) =>
                        text == null || text === '' ? null : Number(text.replace(',', '')),
                },
            },
        ]);
        await asyncSetTimeout(0);

        await filter.setText('1,5', 0);
        await asyncSetTimeout(0);

        expect(api.getColumnFilterModel('val')).toEqual({ filterType: 'number', type: 'equals', filter: 15 });
        await new FilterDom(api, 'input read by the replaced parser', { colId: 'val' }).checkFilterDom(`
            COLUMN FILTER
            operator: "Equals"
            input: "1,5"
            AND
            operator: "Equals"
            input: "" \u27e8Filter...\u27e9
            model:
              filterType: "number"
              type: "equals"
              filter: 15
        `);
        await new GridRows(api, 'the replaced numberParser decides which row matches').check(`
            ROOT id:ROOT_NODE_ID
            \u2514\u2500\u2500 LEAF id:1 val:15
        `);
    });

    test('a numberFormatter added at runtime reaches inputs built before it, and survives being withdrawn', async () => {
        const numberParser = (text: string | null) =>
            text == null || text === '' ? null : Number(String(text).replace(/,/g, ''));
        const numberFormatter = (value: number | null) => (value == null ? null : value.toLocaleString('en-US'));
        const allowedCharPattern = '\\d\\,\\.\\-';
        const plainColumnDefs = [
            {
                field: 'val',
                filter: 'agNumberColumnFilter' as const,
                filterParams: { debounceMs: 0, allowedCharPattern },
            },
        ];

        const api: GridApi = await gridsManager.createGridAndWait('grid1', {
            columnDefs: plainColumnDefs,
            rowData: [{ val: 5 }, { val: 1500 }],
        });
        const filter = await ColumnFilterHarness.open(api, 'val');

        api.setGridOption('columnDefs', [
            {
                field: 'val',
                filter: 'agNumberColumnFilter',
                filterParams: { debounceMs: 0, allowedCharPattern, numberParser, numberFormatter },
            },
        ]);
        await asyncSetTimeout(0);

        await api.setColumnFilterModel('val', { filterType: 'number', type: 'equals', filter: 1500 });
        api.onFilterChanged();
        await asyncSetTimeout(0);

        expect(filter.inputs('text', 0)[0].value).toBe('1,500');

        // Nothing can read "1,500" back once the parser goes, so the value is re-rendered, not copied across.
        api.setGridOption('columnDefs', plainColumnDefs);
        await asyncSetTimeout(0);

        expect(filter.inputs('text', 0)[0].value).toBe('1500');
        expect(api.getColumnFilterModel('val')).toEqual({ filterType: 'number', type: 'equals', filter: 1500 });
    });

    test('a formatter replaced by an equivalent one leaves the value it wrote intact', async () => {
        // No numberParser, so nothing can read "1,234" back: only what the input was rendered with can.
        const api: GridApi = await gridsManager.createGridAndWait('grid1', {
            columnDefs: [
                {
                    field: 'val',
                    filter: 'agNumberColumnFilter',
                    filterParams: {
                        debounceMs: 0,
                        numberFormatter: (value: number | null) =>
                            value == null ? null : value.toLocaleString('en-US'),
                    },
                },
            ],
            rowData: [{ val: 5 }, { val: 1234 }],
        });
        const filter = await ColumnFilterHarness.open(api, 'val');

        await api.setColumnFilterModel('val', { filterType: 'number', type: 'greaterThan', filter: 1234 });
        api.onFilterChanged();
        await asyncSetTimeout(0);
        expect(filter.inputs('text', 0)[0].value).toBe('1,234');

        // A new formatter of the same behaviour, which is what an inline arrow gives on every render.
        api.setGridOption('columnDefs', [
            {
                field: 'val',
                filter: 'agNumberColumnFilter',
                filterParams: {
                    debounceMs: 0,
                    numberFormatter: (value: number | null) => (value == null ? null : value.toLocaleString('en-US')),
                },
            },
        ]);
        await asyncSetTimeout(0);

        expect(filter.inputs('text', 0)[0].value).toBe('1,234');
        expect(api.getColumnFilterModel('val')).toEqual({ filterType: 'number', type: 'greaterThan', filter: 1234 });
    });

    test('a colDef refresh keeps text the parser cannot read yet', async () => {
        // Declared inline, as a framework wrapper does, so every refresh passes new function identities.
        const makeColumnDefs = () => [
            {
                field: 'val',
                filter: 'agNumberColumnFilter',
                filterParams: {
                    debounceMs: 0,
                    allowedCharPattern: '\\d\\-\\.',
                    numberParser: (text: string | null) => (text == null || text === '' ? null : Number(text)),
                    numberFormatter: (value: number | null) => (value == null ? null : String(value)),
                },
            },
        ];

        const api: GridApi = await gridsManager.createGridAndWait('grid1', {
            columnDefs: makeColumnDefs(),
            rowData: [{ val: -5 }, { val: 5 }],
        });
        const filter = await ColumnFilterHarness.open(api, 'val');
        await filter.selectOperator('Equals');
        await filter.setText('-');

        api.setGridOption('columnDefs', makeColumnDefs());
        await asyncSetTimeout(0);

        expect(filter.inputs('text', 0)[0].value).toBe('-');
        await filter.setText('-5');
        await asyncSetTimeout(0);
        expect(filter.getModel()).toEqual({ filterType: 'number', type: 'equals', filter: -5 });
    });

    test('an input replaced by a colDef refresh still applies what is typed into it', async () => {
        const api: GridApi = await gridsManager.createGridAndWait('grid1', {
            columnDefs: [{ field: 'val', filter: 'agNumberColumnFilter', filterParams: { debounceMs: 0 } }],
            rowData: [{ val: 5 }, { val: 1500 }],
        });
        const filter = await ColumnFilterHarness.open(api, 'val');
        await filter.selectOperator('Equals');
        expect(filter.inputs('number', 0)).toHaveLength(1);

        // `allowedCharPattern` makes the inputs text, so the ones typed into here are not the ones built.
        api.setGridOption('columnDefs', [
            {
                field: 'val',
                filter: 'agNumberColumnFilter',
                filterParams: { debounceMs: 0, allowedCharPattern: '\\d\\-\\.' },
            },
        ]);
        await asyncSetTimeout(0);

        await filter.setText('1500');
        expect(filter.getModel()).toEqual({ filterType: 'number', type: 'equals', filter: 1500 });
        await new GridRows(api, 'typed into the replacement input').check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:1 val:1500
        `);
    });

    test('a colDef refresh leaves text being typed alone rather than reformatting it', async () => {
        // Declared inline, as a framework wrapper does, so every refresh passes new function identities.
        const makeColumnDefs = () => [
            {
                field: 'val',
                filter: 'agNumberColumnFilter' as const,
                filterParams: {
                    debounceMs: 0,
                    allowedCharPattern: '\\d\\-\\.',
                    numberFormatter: (value: number | null) => (value == null ? null : value.toFixed(0)),
                    numberParser: (text: string | null) => (text == null || text === '' ? null : parseFloat(text)),
                },
            },
        ];
        const api: GridApi = await gridsManager.createGridAndWait('grid1', {
            columnDefs: makeColumnDefs(),
            rowData: [{ val: 5 }, { val: 1234.5 }],
        });
        const filter = await ColumnFilterHarness.open(api, 'val');
        await filter.setText('1234.5');

        api.setGridOption('columnDefs', makeColumnDefs());
        await asyncSetTimeout(0);

        // The user is still typing 1234.5; the formatter must not round it under the caret.
        expect(filter.inputs('text', 0)[0].value).toBe('1234.5');
    });

    test('a focused text input replaced by number inputs leaves the pair coherent', async () => {
        const api: GridApi = await gridsManager.createGridAndWait('grid1', {
            columnDefs: [
                {
                    field: 'val',
                    filter: 'agNumberColumnFilter',
                    filterParams: {
                        debounceMs: 0,
                        numberFormatter: (value: number | null) => (value == null ? null : value.toFixed(0)),
                    },
                },
            ],
            rowData: [{ val: 5 }, { val: 1500 }],
        });
        await api.setColumnFilterModel('val', {
            filterType: 'number',
            type: 'inRange',
            filter: 1500,
            filterTo: 2000,
        });
        api.onFilterChanged();
        await asyncSetTimeout(0);

        const filter = await ColumnFilterHarness.open(api, 'val');
        const eText = filter.inputs('text', 0)[0];
        eText.focus();
        eText.setSelectionRange(2, 2);

        // Withdrawing the formatter takes the text inputs with it, and a `number` input holds no selection.
        api.setGridOption('columnDefs', [
            { field: 'val', filter: 'agNumberColumnFilter', filterParams: { debounceMs: 0 } },
        ]);
        await asyncSetTimeout(0);

        // Both inputs are replaced, or the condition is left holding one of each type.
        expect(filter.inputs('number', 0).map((input) => input.value)).toEqual(['1500', '2000']);
        expect(filter.inputs('text', 0)).toHaveLength(0);
        expect(document.activeElement).toBe(filter.inputs('number', 0)[0]);
    });

    test('an input a formatter rendered as empty stands for no value', async () => {
        const api: GridApi = await gridsManager.createGridAndWait('grid1', {
            columnDefs: [
                {
                    field: 'val',
                    filter: 'agNumberColumnFilter',
                    filterParams: {
                        debounceMs: 0,
                        // Renders zero as nothing, so the input shows no value while the model holds one.
                        numberFormatter: (value: number | null) => (value === 0 ? '' : String(value)),
                    },
                },
            ],
            rowData: [{ val: 0 }, { val: 5 }],
        });
        await api.setColumnFilterModel('val', { filterType: 'number', type: 'equals', filter: 0 });
        api.onFilterChanged();
        await asyncSetTimeout(0);

        const filter = await ColumnFilterHarness.open(api, 'val');
        expect(filter.inputs('text', 0)[0].value).toBe('');

        // An empty input is read as empty, so the condition it belongs to is no longer complete.
        await filter.selectOperator('Does not equal');
        await asyncSetTimeout(0);
        expect(api.getColumnFilterModel('val')).toBe(null);
    });

    test('a rebuild puts the caret back where the user left it', async () => {
        const columnDefs = (allowedCharPattern: string) => [
            {
                field: 'val',
                filter: 'agNumberColumnFilter' as const,
                filterParams: { debounceMs: 0, allowedCharPattern },
            },
        ];
        const api: GridApi = await gridsManager.createGridAndWait('grid1', {
            columnDefs: columnDefs('\\d\\-\\.'),
            rowData: [{ val: 5 }, { val: 1234 }],
        });
        const filter = await ColumnFilterHarness.open(api, 'val');
        await filter.selectOperator('Equals');
        await filter.setText('1234');
        const before = filter.inputs('text', 0)[0];
        before.focus();
        before.setSelectionRange(2, 2);

        api.setGridOption('columnDefs', columnDefs('\\d\\-\\.,'));
        await asyncSetTimeout(0);

        const after = filter.inputs('text', 0)[0];
        expect(after).not.toBe(before);
        expect(after.value).toBe('1234');
        expect(document.activeElement).toBe(after);
        expect([after.selectionStart, after.selectionEnd]).toEqual([2, 2]);
        // Equals takes one input, so the replacements must not arrive showing the unused second one.
        expect(filter.inputs('text', 0)).toHaveLength(1);
    });

    test('the parser and the formatter are given the api and the context', async () => {
        const context = { tag: 'number' };
        // Kept apart: one array cannot tell "both were given it" from "only one of them ran".
        const parserSaw: FilterInputCallbackParams[] = [];
        const formatterSaw: FilterInputCallbackParams[] = [];
        const api: GridApi = await gridsManager.createGridAndWait('grid1', {
            context,
            columnDefs: [
                {
                    field: 'val',
                    filter: 'agNumberColumnFilter',
                    filterParams: {
                        debounceMs: 0,
                        numberParser: (text: string | null, common: FilterInputCallbackParams) => {
                            parserSaw.push(common);
                            // `Number('')` is `0`, which would read an emptied input as a real value.
                            return text ? Number(text) : null;
                        },
                        numberFormatter: (value: number | null, common: FilterInputCallbackParams) => {
                            formatterSaw.push(common);
                            return value == null ? null : String(value);
                        },
                    },
                },
            ],
            rowData: [{ val: 1 }, { val: 5 }],
        });

        const filter = await ColumnFilterHarness.open(api, 'val');
        await filter.setText('5');

        expect(parserSaw.length).toBeGreaterThan(0);
        expect(formatterSaw.length).toBeGreaterThan(0);
        for (const common of [...parserSaw, ...formatterSaw]) {
            expect(common.api).toBe(api);
            expect(common.context).toBe(context);
            // The column too, so one callback on `defaultColDef` can tell which one it is working on.
            expect(common.column.getColId()).toBe('val');
            expect(common.colDef).toBe(common.column.getColDef());
        }
    });
});
