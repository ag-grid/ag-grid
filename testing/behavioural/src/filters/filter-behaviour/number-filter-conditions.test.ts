import type { GridApi } from 'ag-grid-community';
import { ClientSideRowModelModule, NumberFilterModule, enableDevValidations, setupAgTestIds } from 'ag-grid-community';

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
} from '../../test-utils';

/**
 * Black-box coverage for `agNumberColumnFilter` conditions: operators, inRange boundary semantics,
 * blank handling, `allowedCharPattern`/`numberParser`, AND/OR compounds, model round-trip.
 * Complements number-filter-range-validation.test.ts (validation-focused) — no overlap.
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
        await api.setColumnFilterModel('val', { filterType: 'number', operator: 'AND' } as any);
        api.onFilterChanged();
        await asyncSetTimeout(0);

        expect(warnSpy.mock.calls.flat().join(' ')).toContain('warning #77');
        expect(api.getColumnFilterModel('val')).toEqual({ filterType: 'number', operator: 'AND' });
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

    test('a numberFormatter added at runtime reaches inputs built before it', async () => {
        const numberParser = (text: string | null) =>
            text == null || text === '' ? null : Number(String(text).replace(/,/g, ''));
        const numberFormatter = (value: number | null) => (value == null ? null : value.toLocaleString('en-US'));
        const allowedCharPattern = '\\d\\,\\.\\-';

        const api: GridApi = await gridsManager.createGridAndWait('grid1', {
            columnDefs: [
                { field: 'val', filter: 'agNumberColumnFilter', filterParams: { debounceMs: 0, allowedCharPattern } },
            ],
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
});
