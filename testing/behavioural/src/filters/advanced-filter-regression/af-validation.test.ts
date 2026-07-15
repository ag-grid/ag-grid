import type { GridApi, GridOptions, IFilterOptionDef } from 'ag-grid-community';
import {
    ClientSideRowModelModule,
    NumberFilterModule,
    TextFilterModule,
    getGridElement,
    setupAgTestIds,
} from 'ag-grid-community';
import { AdvancedFilterModule } from 'ag-grid-enterprise';

import {
    AdvancedFilterHarness,
    ColumnFilterHarness,
    FilterDom,
    GridRows,
    TestGridsManager,
    asyncSetTimeout,
    installFilterLayoutMock,
    uninstallFilterLayoutMock,
} from '../../test-utils';

/**
 * Regression baseline for Advanced Filter validation and for the custom `filterParams.filterOptions`
 * reuse surface (AG-10819). Pins the invalid-expression contract (error shown, Apply disabled, rows
 * unchanged) and the display names / input counts / model shape / predicate evaluation of custom
 * 0-, 1- and 2-input options, so grammar extensions can't silently regress either.
 */
interface Row {
    name: string;
    age: number;
}

const ROW_DATA: Row[] = [
    { name: 'Bolt', age: 25 },
    { name: 'Ng', age: 40 },
    { name: 'Wei', age: 28 },
];

const DEFAULT_OPTIONS: GridOptions<Row> = {
    columnDefs: [
        { field: 'name', filter: true },
        { field: 'age', filter: true },
    ],
    rowData: ROW_DATA,
    enableAdvancedFilter: true,
};

const UNFILTERED = `
    ROOT id:ROOT_NODE_ID
    ├── LEAF id:0 name:"Bolt" age:25
    ├── LEAF id:1 name:"Ng" age:40
    └── LEAF id:2 name:"Wei" age:28
`;

describe('Advanced Filter — validation', () => {
    const gridsManager = new TestGridsManager({
        modules: [TextFilterModule, NumberFilterModule, AdvancedFilterModule, ClientSideRowModelModule],
    });

    afterEach(() => gridsManager.reset());

    test('an unknown column is rejected and does not filter', async () => {
        const api = await gridsManager.createGridAndWait('grid1', DEFAULT_OPTIONS);

        await AdvancedFilterHarness.get(api).applyExpression('[Nope] equals "Bolt"');
        await asyncSetTimeout(0);

        expect(api.getAdvancedFilterModel()).toBeNull();
        await new FilterDom(api, 'unknown column panel').checkFilterDom(`
            ADVANCED FILTER
            input: "[Nope] equals "Bolt""
            valid: false — Expression has an error. Column not found - [Nope] equals "Bolt".
            buttons: Apply ⊘ | Builder
            model: null
        `);
        await new GridRows(api, 'unknown column rows').check(UNFILTERED);
    });

    test('an unknown operator is rejected and does not filter', async () => {
        const api = await gridsManager.createGridAndWait('grid1', DEFAULT_OPTIONS);

        await AdvancedFilterHarness.get(api).applyExpression('[Name] frobnicates "Bolt"');
        await asyncSetTimeout(0);

        expect(api.getAdvancedFilterModel()).toBeNull();
        await new FilterDom(api, 'unknown operator panel').checkFilterDom(`
            ADVANCED FILTER
            input: "[Name] frobnicates "Bolt""
            valid: false — Expression has an error. Option not found - frobnicates "Bolt".
            buttons: Apply ⊘ | Builder
            model: null
        `);
        await new GridRows(api, 'unknown operator rows').check(UNFILTERED);
    });

    test('a missing end bracket is rejected', async () => {
        const api = await gridsManager.createGridAndWait('grid1', DEFAULT_OPTIONS);

        await AdvancedFilterHarness.get(api).applyExpression('([Age] > 20 AND [Name] equals "Bolt"');
        await asyncSetTimeout(0);

        expect(api.getAdvancedFilterModel()).toBeNull();
        await new FilterDom(api, 'missing end bracket panel').checkFilterDom(`
            ADVANCED FILTER
            input: "([Age] > 20 AND [Name] equals "Bolt""
            valid: false — Expression has an error. Missing end bracket at end of expression.
            buttons: Apply ⊘ | Builder
            model: null
        `);
        await new GridRows(api, 'missing end bracket rows').check(UNFILTERED);
    });

    test('an extra end bracket is rejected', async () => {
        const api = await gridsManager.createGridAndWait('grid1', DEFAULT_OPTIONS);

        await AdvancedFilterHarness.get(api).applyExpression('[Age] > 20)');
        await asyncSetTimeout(0);

        expect(api.getAdvancedFilterModel()).toBeNull();
        await new FilterDom(api, 'extra end bracket panel').checkFilterDom(`
            ADVANCED FILTER
            input: "[Age] > 20)"
            valid: false — Expression has an error. Too many end brackets - ).
            buttons: Apply ⊘ | Builder
            model: null
        `);
        await new GridRows(api, 'extra end bracket rows').check(UNFILTERED);
    });

    test('an empty bracket group is rejected as a missing condition', async () => {
        const api = await gridsManager.createGridAndWait('grid1', DEFAULT_OPTIONS);

        await AdvancedFilterHarness.get(api).applyExpression('()');
        await asyncSetTimeout(0);

        expect(api.getAdvancedFilterModel()).toBeNull();
        await new FilterDom(api, 'empty bracket panel').checkFilterDom(`
            ADVANCED FILTER
            input: "()"
            valid: false — Expression has an error. Condition is missing at end of expression.
            buttons: Apply ⊘ | Builder
            model: null
        `);
        await new GridRows(api, 'empty bracket rows').check(UNFILTERED);
    });

    test('a dangling join operator inside a group is rejected', async () => {
        const api = await gridsManager.createGridAndWait('grid1', DEFAULT_OPTIONS);

        await AdvancedFilterHarness.get(api).applyExpression('([Age] > 20 OR)');
        await asyncSetTimeout(0);

        expect(api.getAdvancedFilterModel()).toBeNull();
        await new FilterDom(api, 'dangling group operator panel').checkFilterDom(`
            ADVANCED FILTER
            input: "([Age] > 20 OR)"
            valid: false — Expression has an error. Join operator not found - OR).
            buttons: Apply ⊘ | Builder
            model: null
        `);
        await new GridRows(api, 'dangling group operator rows').check(UNFILTERED);
    });

    test('mismatched join operators within a group are rejected', async () => {
        const api = await gridsManager.createGridAndWait('grid1', DEFAULT_OPTIONS);

        await AdvancedFilterHarness.get(api).applyExpression('([Age] > 20 AND [Name] equals "Bolt" OR [Age] < 30)');
        await asyncSetTimeout(0);

        expect(api.getAdvancedFilterModel()).toBeNull();
        await new FilterDom(api, 'join mismatch panel').checkFilterDom(`
            ADVANCED FILTER
            input: "([Age] > 20 AND [Name] equals "Bolt" OR [Age] < 30)"
            valid: false — Expression has an error. Join operators within a condition must be the same - OR.
            buttons: Apply ⊘ | Builder
            model: null
        `);
        await new GridRows(api, 'join mismatch rows').check(UNFILTERED);
    });

    test('an unknown join operator is rejected', async () => {
        const api = await gridsManager.createGridAndWait('grid1', DEFAULT_OPTIONS);

        await AdvancedFilterHarness.get(api).applyExpression('[Age] > 20 XOR [Name] equals "Bolt"');
        await asyncSetTimeout(0);

        expect(api.getAdvancedFilterModel()).toBeNull();
        await new FilterDom(api, 'unknown join operator panel').checkFilterDom(`
            ADVANCED FILTER
            input: "[Age] > 20 XOR [Name] equals "Bolt""
            valid: false — Expression has an error. Join operator not found - XOR.
            buttons: Apply ⊘ | Builder
            model: null
        `);
        await new GridRows(api, 'unknown join operator rows').check(UNFILTERED);
    });

    test('an invalid expression does not replace a previously applied valid filter', async () => {
        const api = await gridsManager.createGridAndWait('grid1', DEFAULT_OPTIONS);

        await AdvancedFilterHarness.get(api).applyExpression('[Age] > 30');
        await asyncSetTimeout(0);
        expect(api.getAdvancedFilterModel()).toEqual({
            filterType: 'number',
            colId: 'age',
            type: 'greaterThan',
            filter: 30,
        });
        await new GridRows(api, 'valid filter applied').check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:1 name:"Ng" age:40
        `);

        // Applying an invalid expression is blocked (Apply stays disabled) — the prior filter persists.
        await AdvancedFilterHarness.get(api).applyExpression('[Nope] equals "x"');
        await asyncSetTimeout(0);
        expect(api.getAdvancedFilterModel()).toEqual({
            filterType: 'number',
            colId: 'age',
            type: 'greaterThan',
            filter: 30,
        });
        await new GridRows(api, 'prior filter persists after invalid input').check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:1 name:"Ng" age:40
        `);
    });

    test('clearing the expression removes the filter', async () => {
        const api = await gridsManager.createGridAndWait('grid1', DEFAULT_OPTIONS);

        await AdvancedFilterHarness.get(api).applyExpression('[Age] > 30');
        await asyncSetTimeout(0);
        expect(api.getDisplayedRowCount()).toBe(1);

        await AdvancedFilterHarness.get(api).applyExpression('');
        await asyncSetTimeout(0);
        expect(api.getAdvancedFilterModel()).toBeNull();
        await new GridRows(api, 'cleared rows').check(UNFILTERED);
    });

    // Meta-test: the FilterDom invariant validator must FAIL when the panel DOM contradicts its
    // state, else every other FilterDom snapshot's validation is worthless.
    test('the FilterDom validator throws when Apply is enabled for an invalid expression', async () => {
        const api = await gridsManager.createGridAndWait('grid1', DEFAULT_OPTIONS);

        const af = AdvancedFilterHarness.get(api);
        await af.type('[Age] blah');
        await asyncSetTimeout(0);
        // Consistent state (invalid + Apply disabled) passes validation.
        await new FilterDom(api, 'invalid but consistent').checkFilterDom(`
            ADVANCED FILTER
            input: "[Age] blah"
            valid: false — Expression has an error. Option not found - blah.
            buttons: Apply ⊘ | Builder
            model: null
        `);

        // Corrupt the DOM: force-enable Apply while the expression is invalid → invariant violated.
        const applyBtn = getGridElement(api)!.querySelector<HTMLButtonElement>(
            '.ag-advanced-filter-buttons .ag-filter-apply-panel-apply-button'
        )!;
        applyBtn.disabled = false;
        const corrupted = new FilterDom(api, 'corrupted').loadErrors();
        expect(corrupted.errors.totalErrorsCount).toBe(1);
        expect(corrupted.errors.toString()).toContain(
            'advanced filter expression is invalid but the Apply button is enabled'
        );
    });
});

describe('Custom filterOptions (0/1/2-input) reuse surface', () => {
    const EVEN: IFilterOptionDef = {
        displayKey: 'even',
        displayName: 'Is even',
        numberOfInputs: 0,
        predicate: (_values, cellValue) => typeof cellValue === 'number' && cellValue % 2 === 0,
    };
    const MULTIPLE_OF: IFilterOptionDef = {
        displayKey: 'multipleOf',
        displayName: 'Multiple of',
        numberOfInputs: 1,
        predicate: ([v], cellValue) => v != null && cellValue % v === 0,
    };
    const STRICTLY_BETWEEN: IFilterOptionDef = {
        displayKey: 'strictlyBetween',
        displayName: 'Strictly between',
        numberOfInputs: 2,
        predicate: ([a, b], cellValue) => cellValue > a && cellValue < b,
    };

    const COLUMN_DEFS: GridOptions['columnDefs'] = [
        {
            field: 'age',
            filter: 'agNumberColumnFilter',
            // 'equals' first so the (empty, inactive) default isn't a custom option: selecting one is then
            // a real change that applies. A 0-input custom option placed first wouldn't auto-apply.
            filterParams: { debounceMs: 0, filterOptions: ['equals', EVEN, MULTIPLE_OF, STRICTLY_BETWEEN] },
        },
    ];
    const ROW_DATA = [{ age: 10 }, { age: 15 }, { age: 20 }, { age: 21 }, { age: 30 }];

    const gridsManager = new TestGridsManager({
        modules: [NumberFilterModule, ClientSideRowModelModule],
    });

    beforeAll(() => {
        setupAgTestIds();
        installFilterLayoutMock();
    });
    afterAll(() => uninstallFilterLayoutMock());
    afterEach(() => gridsManager.reset());

    test('0-input custom option applies on selection with no inputs', async () => {
        const api: GridApi = await gridsManager.createGridAndWait('grid1', {
            columnDefs: COLUMN_DEFS,
            rowData: ROW_DATA,
        });

        const filter = await ColumnFilterHarness.open(api, 'age');
        await filter.selectOperator('Is even');
        await asyncSetTimeout(0);

        await new FilterDom(api, '0-input custom option', { colId: 'age' }).checkFilterDom(`
            COLUMN FILTER
            operator: "Is even"
            AND
            operator: "Equals"
            input: ""
            model:
              filterType: "number"
              type: "even"
        `);
        await new GridRows(api, '0-input custom option rows').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:0 age:10
            ├── LEAF id:2 age:20
            └── LEAF id:4 age:30
        `);
    });

    test('1-input custom option filters by its predicate', async () => {
        const api: GridApi = await gridsManager.createGridAndWait('grid1', {
            columnDefs: COLUMN_DEFS,
            rowData: ROW_DATA,
        });

        const filter = await ColumnFilterHarness.open(api, 'age');
        await filter.selectOperator('Multiple of');
        await filter.setNumber(10, 0);
        await asyncSetTimeout(0);

        await new FilterDom(api, '1-input custom option', { colId: 'age' }).checkFilterDom(`
            COLUMN FILTER
            operator: "Multiple of"
            input: "10"
            AND
            operator: "Equals"
            input: ""
            model:
              filterType: "number"
              type: "multipleOf"
              filter: 10
        `);
        await new GridRows(api, '1-input custom option rows').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:0 age:10
            ├── LEAF id:2 age:20
            └── LEAF id:4 age:30
        `);
    });

    test('2-input custom option yields a two-input model and filters by its predicate', async () => {
        const api: GridApi = await gridsManager.createGridAndWait('grid1', {
            columnDefs: COLUMN_DEFS,
            rowData: ROW_DATA,
        });

        const filter = await ColumnFilterHarness.open(api, 'age');
        await filter.selectOperator('Strictly between');
        await filter.setNumber(10, 0);
        await filter.setNumber(30, 1);
        await asyncSetTimeout(0);

        await new FilterDom(api, '2-input custom option', { colId: 'age' }).checkFilterDom(`
            COLUMN FILTER
            operator: "Strictly between"
            input [0]: "10"
            input [1]: "30"
            AND
            operator: "Equals"
            input: ""
            model:
              filterType: "number"
              type: "strictlyBetween"
              filter: 10
              filterTo: 30
        `);
        await new GridRows(api, '2-input custom option rows').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:1 age:15
            ├── LEAF id:2 age:20
            └── LEAF id:3 age:21
        `);
    });

    test('columns without custom options only show the default options', async () => {
        const api: GridApi = await gridsManager.createGridAndWait('grid1', {
            columnDefs: [{ field: 'age', filter: 'agNumberColumnFilter', filterParams: { debounceMs: 0 } }],
            rowData: ROW_DATA,
        });

        const filter = await ColumnFilterHarness.open(api, 'age');
        // Selecting a custom option must fail — it isn't offered on a default column.
        await expect(filter.selectOperator('Strictly between')).rejects.toThrow(/not found/);
    });
});
