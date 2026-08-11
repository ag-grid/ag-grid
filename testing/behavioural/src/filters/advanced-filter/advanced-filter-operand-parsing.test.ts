import { waitFor } from '@testing-library/dom';

import type { GridApi, GridOptions, IFilterOptionDef } from 'ag-grid-community';
import {
    ClientSideRowModelModule,
    DateFilterModule,
    NumberFilterModule,
    TextFilterModule,
    setupAgTestIds,
} from 'ag-grid-community';
import { AdvancedFilterModule } from 'ag-grid-enterprise';

import {
    AdvancedFilterHarness,
    FilterDom,
    GridRows,
    TestGridsManager,
    asyncSetTimeout,
    installFilterLayoutMock,
    uninstallFilterLayoutMock,
} from '../../test-utils';

/**
 * Behavioural coverage of how the Advanced Filter reads the operand region of a condition - quoting,
 * delimiting, arity and per-type rejection. Pins what the grammar accepts so the operand parsers can be
 * restructured without changing what a user can type.
 */
interface Row {
    name: string;
    age: number;
    when: string;
}

const ROW_DATA: Row[] = [
    { name: 'Bolt', age: 25, when: '2012-08-10' },
    { name: 'Ng Wei', age: 40, when: '2012-08-14' },
    { name: 'Wei', age: 28, when: '2012-08-30' },
];

/** Order-insensitive in itself, but two operands of an ordered type are still held to the range rule. */
const ANY_OF_TWO: IFilterOptionDef = {
    displayKey: 'anyOfTwo',
    displayName: 'Any Of Two',
    numberOfInputs: 2,
    predicate: ([a, b], cellValue) => cellValue === a || cellValue === b,
};

const ANY_OF_TWO_TEXT: IFilterOptionDef = {
    displayKey: 'anyOfTwoText',
    displayName: 'Any Of Two Text',
    numberOfInputs: 2,
    predicate: ([a, b], cellValue) => cellValue === a || cellValue === b,
};

/** One operand, so a comma inside it is an ordinary character rather than a separator. */
const NOT_ONE_OF: IFilterOptionDef = {
    displayKey: 'notOneOf',
    displayName: 'Not One Of',
    numberOfInputs: 1,
    predicate: ([list], cellValue) => !String(list).split(',').includes(String(cellValue)),
};

const OPTS: GridOptions<Row> = {
    columnDefs: [
        { field: 'name', filter: true, filterParams: { filterOptions: ['equals', ANY_OF_TWO_TEXT, NOT_ONE_OF] } },
        { field: 'age', filter: 'agNumberColumnFilter', filterParams: { filterOptions: ['equals', ANY_OF_TWO] } },
        { field: 'when', filter: 'agDateColumnFilter', cellDataType: 'dateString' },
    ],
    rowData: ROW_DATA,
    enableAdvancedFilter: true,
};

const UNFILTERED = `
    ROOT id:ROOT_NODE_ID
    ├── LEAF id:0 name:"Bolt" age:25 when:"2012-08-10"
    ├── LEAF id:1 name:"Ng Wei" age:40 when:"2012-08-14"
    └── LEAF id:2 name:"Wei" age:28 when:"2012-08-30"
`;

describe('Advanced Filter — operand parsing', () => {
    const gridsManager = new TestGridsManager({
        modules: [
            TextFilterModule,
            NumberFilterModule,
            DateFilterModule,
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

    const grid = async (): Promise<GridApi<Row>> => gridsManager.createGridAndWait('grid1', OPTS);

    describe('a single operand', () => {
        test('quotes keep the spaces inside a value', async () => {
            const api = await grid();

            await AdvancedFilterHarness.get(api).applyExpression('[Name] equals "Ng Wei"');
            await asyncSetTimeout(0);

            await waitFor(() =>
                expect(api.getAdvancedFilterModel()).toEqual({
                    filterType: 'text',
                    colId: 'name',
                    type: 'equals',
                    filter: 'Ng Wei',
                })
            );
            await new GridRows(api, 'quoted value with a space').check(`
                ROOT id:ROOT_NODE_ID
                └── LEAF id:1 name:"Ng Wei" age:40 when:"2012-08-14"
            `);
        });

        test('quotes keep a closing bracket inside a value', async () => {
            const api = await grid();
            api.setGridOption('rowData', [{ name: 'Bolt)', age: 25, when: '2012-08-10' }]);
            await asyncSetTimeout(0);

            await AdvancedFilterHarness.get(api).applyExpression('[Name] equals "Bolt)"');
            await asyncSetTimeout(0);

            await waitFor(() =>
                expect(api.getAdvancedFilterModel()).toEqual({
                    filterType: 'text',
                    colId: 'name',
                    type: 'equals',
                    filter: 'Bolt)',
                })
            );
            await new GridRows(api, 'quoted bracket matches the row').check(`
                ROOT id:ROOT_NODE_ID
                └── LEAF id:0 name:"Bolt)" age:25 when:"2012-08-10"
            `);
        });

        test('a quote after the first character is part of the value, not a delimiter', async () => {
            const api = await grid();
            api.setGridOption('rowData', [{ name: `Bo"lt`, age: 25, when: '2012-08-10' }]);
            await asyncSetTimeout(0);

            await AdvancedFilterHarness.get(api).applyExpression(`[Name] equals Bo"lt`);
            await asyncSetTimeout(0);

            await waitFor(() =>
                expect(api.getAdvancedFilterModel()).toEqual({
                    filterType: 'text',
                    colId: 'name',
                    type: 'equals',
                    filter: `Bo"lt`,
                })
            );
            await new GridRows(api, 'mid-value quote matches the row').check(`
                ROOT id:ROOT_NODE_ID
                └── LEAF id:0 name:'Bo"lt' age:25 when:"2012-08-10"
            `);
        });

        // Each is rejected whole: the expression reaches no model and nothing is filtered.
        test.each([
            ['an unterminated quote', '[Name] equals "Bolt', 'Value is missing an end quote - "Bolt.'],
            ['an operator with nothing after it', '[Name] equals', 'Value is missing at end of expression.'],
            ['a quoted number, the type having a syntax of its own', '[Age] = "25"', 'Value is not a number - "25".'],
            ['a non-numeric operand on a number column', '[Age] = abc', 'Value is not a number - abc.'],
            ['an unreadable date', '[When] = "not-a-date"', 'Value is not a valid date - "not-a-date".'],
            ['a missing comma between operands', '[Age] Any Of Two (25 28)', 'Value is missing - (25 2.'],
            [
                'a trailing comma leaving the last operand missing',
                '[Age] Any Of Two (25, )',
                'Value is missing - (25, ).',
            ],
            ['a second comma rather than a third operand', '[Age] Any Of Two (25,,28)', 'Value is missing - (25,,.'],
            ['more operands than the option takes', '[Age] Any Of Two (25, 28, 40)', 'Missing end bracket - (25, 28,.'],
            [
                'a bracket the operand list never opened',
                '[Age] Any Of Two 25)',
                'Value is missing at end of expression.',
            ],
        ])('%s is rejected', async (_name, expression, message) => {
            const api = await grid();

            await AdvancedFilterHarness.get(api).applyExpression(expression);
            await asyncSetTimeout(0);

            await new FilterDom(api, expression).checkFilterDom(`
                ADVANCED FILTER
                input: "${expression}"
                valid: false — Expression has an error. ${message}
                buttons: Apply ⊘ | Builder
                model: null
            `);
            await new GridRows(api, `${expression} rows`).check(UNFILTERED);
        });

        test('a comma belongs to the value when the option takes only one operand', async () => {
            const api = await grid();

            await AdvancedFilterHarness.get(api).applyExpression('[Name] Not One Of "Bolt,Wei"');
            await asyncSetTimeout(0);

            await waitFor(() =>
                expect(api.getAdvancedFilterModel()).toEqual({
                    filterType: 'text',
                    colId: 'name',
                    type: 'notOneOf',
                    filter: 'Bolt,Wei',
                })
            );
            await new GridRows(api, 'comma kept inside a single operand').check(`
                ROOT id:ROOT_NODE_ID
                └── LEAF id:1 name:"Ng Wei" age:40 when:"2012-08-14"
            `);
        });
    });

    describe('several operands', () => {
        const TWO_MATCHED = `
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:0 name:"Bolt" age:25 when:"2012-08-10"
            └── LEAF id:2 name:"Wei" age:28 when:"2012-08-30"
        `;

        test('inner spacing around the comma does not matter', async () => {
            const api = await grid();
            const af = AdvancedFilterHarness.get(api);

            await af.applyExpression('[Age] Any Of Two (25,28)');
            await asyncSetTimeout(0);
            await new GridRows(api, 'no spaces').check(TWO_MATCHED);

            await af.applyExpression('[Age] Any Of Two (  25 ,  28  )');
            await asyncSetTimeout(0);
            await new GridRows(api, 'extra spaces').check(TWO_MATCHED);
        });

        test('the brackets may be omitted entirely', async () => {
            const api = await grid();

            await AdvancedFilterHarness.get(api).applyExpression('[Age] Any Of Two 25, 28');
            await asyncSetTimeout(0);

            await new GridRows(api, 'bare operands').check(TWO_MATCHED);
        });

        test('the comma is what stops a following join being read as a value', async () => {
            const api = await grid();

            // Without the separator the `AND` would be swallowed into the operand region.
            await AdvancedFilterHarness.get(api).applyExpression('[Age] Any Of Two (25, 28) AND [Name] equals "Bolt"');
            await asyncSetTimeout(0);

            await new GridRows(api, 'join after a bracketed operand list').check(`
                ROOT id:ROOT_NODE_ID
                └── LEAF id:0 name:"Bolt" age:25 when:"2012-08-10"
            `);
        });

        test('quoted text operands keep their spaces on both sides of the comma', async () => {
            const api = await grid();

            await AdvancedFilterHarness.get(api).applyExpression('[Name] Any Of Two Text ("Ng Wei", "Bolt")');
            await asyncSetTimeout(0);

            // Both operands keep their spaces, untrimmed, in `filter` and `filterTo`.
            await waitFor(() =>
                expect(api.getAdvancedFilterModel()).toEqual({
                    filterType: 'text',
                    colId: 'name',
                    type: 'anyOfTwoText',
                    filter: 'Ng Wei',
                    filterTo: 'Bolt',
                })
            );
            await new GridRows(api, 'two quoted text operands').check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:0 name:"Bolt" age:25 when:"2012-08-10"
                └── LEAF id:1 name:"Ng Wei" age:40 when:"2012-08-14"
            `);
        });
    });

    describe('brackets against an enclosing group', () => {
        // The name no row carries, so the OR contributes nothing and only the operand pair selects rows.
        const MATCHED_BY_THE_PAIR = `
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:0 name:"Bolt" age:25 when:"2012-08-10"
            └── LEAF id:2 name:"Wei" age:28 when:"2012-08-30"
        `;

        test('the operand list closes its own bracket, leaving the group its own', async () => {
            const api = await grid();

            await AdvancedFilterHarness.get(api).applyExpression('([Age] Any Of Two (25, 28) OR [Name] equals "Nope")');
            await asyncSetTimeout(0);

            await waitFor(() => expect(api.getAdvancedFilterModel()).not.toBeNull());
            await new GridRows(api, 'bracketed operands inside a group').check(MATCHED_BY_THE_PAIR);
        });

        test('a bracket closing the group is not taken as the operand list’s', async () => {
            const api = await grid();

            // The operand list opened no bracket of its own, so this `)` must close the group instead.
            await AdvancedFilterHarness.get(api).applyExpression('([Age] Any Of Two 25, 28 OR [Name] equals "Nope")');
            await asyncSetTimeout(0);

            await waitFor(() => expect(api.getAdvancedFilterModel()).not.toBeNull());
            await new GridRows(api, 'bare operands inside a group').check(MATCHED_BY_THE_PAIR);
        });

        test('a one-operand option has no bracket syntax, so a bracket belongs to the value', async () => {
            const api = await grid();
            api.setGridOption('rowData', [{ name: '(Bolt)', age: 25, when: '2012-08-10' }]);
            await asyncSetTimeout(0);

            await AdvancedFilterHarness.get(api).applyExpression('[Name] equals "(Bolt)"');
            await asyncSetTimeout(0);

            await waitFor(() =>
                expect(api.getAdvancedFilterModel()).toEqual({
                    filterType: 'text',
                    colId: 'name',
                    type: 'equals',
                    filter: '(Bolt)',
                })
            );
            await new GridRows(api, 'quoted brackets match the row').check(`
                ROOT id:ROOT_NODE_ID
                └── LEAF id:0 name:"(Bolt)" age:25 when:"2012-08-10"
            `);
        });

        test('an unquoted opening bracket is content too, as the option has no list to open', async () => {
            const api = await grid();
            api.setGridOption('rowData', [{ name: '(Bolt', age: 25, when: '2012-08-10' }]);
            await asyncSetTimeout(0);

            await AdvancedFilterHarness.get(api).applyExpression('[Name] equals (Bolt');
            await asyncSetTimeout(0);

            await waitFor(() =>
                expect(api.getAdvancedFilterModel()).toEqual({
                    filterType: 'text',
                    colId: 'name',
                    type: 'equals',
                    filter: '(Bolt',
                })
            );
            await new GridRows(api, 'unquoted bracket matches the row').check(`
                ROOT id:ROOT_NODE_ID
                └── LEAF id:0 name:"(Bolt" age:25 when:"2012-08-10"
            `);
        });

        test('a number ends its value at a bracket even inside quotes, unlike text', async () => {
            const api = await grid();

            // Text keeps a quoted `)`; a number column stops there, so the value is left quoted and rejected.
            await AdvancedFilterHarness.get(api).applyExpression('[Age] = "25)"');
            await asyncSetTimeout(0);

            await new FilterDom(api, 'number bracket inside quotes').checkFilterDom(`
                ADVANCED FILTER
                input: "[Age] = "25)""
                valid: false — Expression has an error. Value is not a number - "25.
                buttons: Apply ⊘ | Builder
                model: null
            `);
            await new GridRows(api, 'number bracket inside quotes rows').check(UNFILTERED);
        });
        test('an option taking no value rejects a value written after it', async () => {
            const api = await grid();

            // Pinned because the model builds its operands from what parsed, not from the option's arity:
            // a `filter` picked up here would filter on a value the predicate never sees.
            await AdvancedFilterHarness.get(api).applyExpression('[Name] is blank "x"');
            await asyncSetTimeout(0);

            await new FilterDom(api, 'a value after a zero-value option').checkFilterDom(`
                ADVANCED FILTER
                input: "[Name] is blank "x""
                valid: false — Expression has an error. Join operator not found - "x".
                buttons: Apply ⊘ | Builder
                model: null
            `);
            await new GridRows(api, 'a rejected expression filters nothing').check(UNFILTERED);
        });
    });
});
