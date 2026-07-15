import type { GridApi, GridOptions } from 'ag-grid-community';
import { ClientSideRowModelModule, DateFilterModule, NumberFilterModule, TextFilterModule } from 'ag-grid-community';
import { AdvancedFilterModule } from 'ag-grid-enterprise';

import { AdvancedFilterHarness, FilterDom, GridRows, TestGridsManager, asyncSetTimeout } from '../../test-utils';

/**
 * Regression baseline for the Advanced Filter operand parser plus parser edge cases the happy-path
 * suites miss: quote handling, same-quote termination, number/bigint coercion + validation messages,
 * and operator/join case-normalisation. Locks behaviour before AG-8950 (value lists) and
 * AG-10819/AG-10029 (two operands) extend the operand grammar. Driven black-box via editor + model.
 */
describe('Advanced Filter — operand parser edge cases', () => {
    interface Row {
        athlete: string;
        country: string;
        age: number;
    }

    const ROW_DATA: Row[] = [
        { athlete: 'Bolt', country: 'Jamaica', age: 25 },
        { athlete: "O'Brien", country: 'Ireland', age: 30 },
        { athlete: 'José', country: 'España', age: 40 },
        { athlete: 'say "hi"', country: 'United States', age: 50 },
        { athlete: '123', country: 'New Zealand', age: 60 },
    ];

    const DEFAULT_OPTIONS: GridOptions<Row> = {
        columnDefs: [
            { field: 'athlete', filter: true },
            { field: 'country', filter: true },
            { field: 'age', filter: true },
        ],
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

    const ALL = ['Bolt', "O'Brien", 'José', 'say "hi"', '123'];

    const gridsManager = new TestGridsManager({
        modules: [TextFilterModule, NumberFilterModule, AdvancedFilterModule, ClientSideRowModelModule],
    });

    afterEach(() => gridsManager.reset());

    describe('text operand quoting', () => {
        test('single and double quotes are interchangeable and produce the same model', async () => {
            const api = await gridsManager.createGridAndWait('grid1', DEFAULT_OPTIONS);

            await AdvancedFilterHarness.get(api).applyExpression('[Athlete] equals "Bolt"');
            await asyncSetTimeout(0);
            expect(displayedAthletes(api)).toEqual(['Bolt']);
            const doubleModel = api.getAdvancedFilterModel();
            await new GridRows(api, 'double-quoted equals rows').check(`
                ROOT id:ROOT_NODE_ID
                └── LEAF id:0 athlete:"Bolt" country:"Jamaica" age:25
            `);

            await AdvancedFilterHarness.get(api).applyExpression("[Athlete] equals 'Bolt'");
            await asyncSetTimeout(0);
            expect(displayedAthletes(api)).toEqual(['Bolt']);
            expect(api.getAdvancedFilterModel()).toEqual(doubleModel);
            expect(doubleModel).toEqual({ filterType: 'text', colId: 'athlete', type: 'equals', filter: 'Bolt' });
            await new GridRows(api, 'single-quoted equals rows').check(`
                ROOT id:ROOT_NODE_ID
                └── LEAF id:0 athlete:"Bolt" country:"Jamaica" age:25
            `);
        });

        test('a quote of the other kind survives inside the operand', async () => {
            const api = await gridsManager.createGridAndWait('grid1', DEFAULT_OPTIONS);

            await AdvancedFilterHarness.get(api).applyExpression('[Athlete] equals "O\'Brien"');
            await asyncSetTimeout(0);
            expect(displayedAthletes(api)).toEqual(["O'Brien"]);
            expect(api.getAdvancedFilterModel()).toMatchObject({ filter: "O'Brien" });
            await new GridRows(api, 'apostrophe-in-double-quotes rows').check(`
                ROOT id:ROOT_NODE_ID
                └── LEAF id:1 athlete:"O'Brien" country:"Ireland" age:30
            `);

            await AdvancedFilterHarness.get(api).applyExpression('[Athlete] equals \'say "hi"\'');
            await asyncSetTimeout(0);
            expect(displayedAthletes(api)).toEqual(['say "hi"']);
            expect(api.getAdvancedFilterModel()).toMatchObject({ filter: 'say "hi"' });
            await new GridRows(api, 'double-quote-in-single-quotes rows').check(`
                ROOT id:ROOT_NODE_ID
                └── LEAF id:3 athlete:'say "hi"' country:"United States" age:50
            `);
        });

        test('spaces are preserved inside quotes', async () => {
            const api = await gridsManager.createGridAndWait('grid1', DEFAULT_OPTIONS);

            await AdvancedFilterHarness.get(api).applyExpression('[Country] equals "New Zealand"');
            await asyncSetTimeout(0);
            expect(displayedAthletes(api)).toEqual(['123']);
            expect(api.getAdvancedFilterModel()).toMatchObject({ filter: 'New Zealand' });
            await new GridRows(api, 'spaces-in-quotes rows').check(`
                ROOT id:ROOT_NODE_ID
                └── LEAF id:4 athlete:"123" country:"New Zealand" age:60
            `);
        });

        test('unicode operand round-trips and matches', async () => {
            const api = await gridsManager.createGridAndWait('grid1', DEFAULT_OPTIONS);

            await AdvancedFilterHarness.get(api).applyExpression('[Athlete] equals "José"');
            await asyncSetTimeout(0);
            expect(displayedAthletes(api)).toEqual(['José']);
            await new GridRows(api, 'unicode rows').check(`
                ROOT id:ROOT_NODE_ID
                └── LEAF id:2 athlete:"José" country:"España" age:40
            `);

            api.setAdvancedFilterModel(null);
            await asyncSetTimeout(0);
            api.setAdvancedFilterModel({ filterType: 'text', colId: 'athlete', type: 'equals', filter: 'José' });
            await asyncSetTimeout(0);
            expect(AdvancedFilterHarness.get(api).value).toBe('[Athlete] equals "José"');
        });

        test('a text operand may be unquoted', async () => {
            const api = await gridsManager.createGridAndWait('grid1', DEFAULT_OPTIONS);

            await AdvancedFilterHarness.get(api).applyExpression('[Athlete] equals 123');
            await asyncSetTimeout(0);
            expect(displayedAthletes(api)).toEqual(['123']);
            expect(api.getAdvancedFilterModel()).toEqual({
                filterType: 'text',
                colId: 'athlete',
                type: 'equals',
                filter: '123',
            });
            await new GridRows(api, 'unquoted-text rows').check(`
                ROOT id:ROOT_NODE_ID
                └── LEAF id:4 athlete:"123" country:"New Zealand" age:60
            `);
        });

        test('an embedded same-kind quote terminates the operand early (no escaping)', async () => {
            const api = await gridsManager.createGridAndWait('grid1', DEFAULT_OPTIONS);

            // The first inner `"` closes the operand at `say `; the trailing `hi""` is then read as a
            // (missing) join operator → the whole expression is invalid and does not apply.
            await AdvancedFilterHarness.get(api).applyExpression('[Athlete] equals "say "hi""');
            await asyncSetTimeout(0);
            expect(displayedAthletes(api)).toEqual(ALL);
            await new FilterDom(api, 'embedded same-quote panel').checkFilterDom(`
                ADVANCED FILTER
                input: "[Athlete] equals "say "hi"""
                valid: false — Expression has an error. Join operator not found - hi"".
                buttons: Apply ⊘ | Builder
                model: null
            `);
            await new GridRows(api, 'embedded same-quote rows').check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:0 athlete:"Bolt" country:"Jamaica" age:25
                ├── LEAF id:1 athlete:"O'Brien" country:"Ireland" age:30
                ├── LEAF id:2 athlete:"José" country:"España" age:40
                ├── LEAF id:3 athlete:'say "hi"' country:"United States" age:50
                └── LEAF id:4 athlete:"123" country:"New Zealand" age:60
            `);
        });
    });

    describe('number operand', () => {
        test('an unquoted number coerces to a numeric model', async () => {
            const api = await gridsManager.createGridAndWait('grid1', DEFAULT_OPTIONS);

            await AdvancedFilterHarness.get(api).applyExpression('[Age] = 40');
            await asyncSetTimeout(0);
            expect(displayedAthletes(api)).toEqual(['José']);
            expect(api.getAdvancedFilterModel()).toEqual({
                filterType: 'number',
                colId: 'age',
                type: 'equals',
                filter: 40,
            });
            await new GridRows(api, 'unquoted-number rows').check(`
                ROOT id:ROOT_NODE_ID
                └── LEAF id:2 athlete:"José" country:"España" age:40
            `);
        });

        test('a quoted number is rejected on a number column', async () => {
            const api = await gridsManager.createGridAndWait('grid1', DEFAULT_OPTIONS);

            await AdvancedFilterHarness.get(api).applyExpression('[Age] = "40"');
            await asyncSetTimeout(0);
            expect(displayedAthletes(api)).toEqual(ALL);
            await new FilterDom(api, 'quoted number panel').checkFilterDom(`
                ADVANCED FILTER
                input: "[Age] = "40""
                valid: false — Expression has an error. Value is not a number - "40".
                buttons: Apply ⊘ | Builder
                model: null
            `);
            await new GridRows(api, 'quoted-number rows').check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:0 athlete:"Bolt" country:"Jamaica" age:25
                ├── LEAF id:1 athlete:"O'Brien" country:"Ireland" age:30
                ├── LEAF id:2 athlete:"José" country:"España" age:40
                ├── LEAF id:3 athlete:'say "hi"' country:"United States" age:50
                └── LEAF id:4 athlete:"123" country:"New Zealand" age:60
            `);
        });

        test('a non-numeric number operand is rejected', async () => {
            const api = await gridsManager.createGridAndWait('grid1', DEFAULT_OPTIONS);

            await AdvancedFilterHarness.get(api).applyExpression('[Age] = abc');
            await asyncSetTimeout(0);
            expect(displayedAthletes(api)).toEqual(ALL);
            await new FilterDom(api, 'non-numeric panel').checkFilterDom(`
                ADVANCED FILTER
                input: "[Age] = abc"
                valid: false — Expression has an error. Value is not a number - abc.
                buttons: Apply ⊘ | Builder
                model: null
            `);
            await new GridRows(api, 'non-numeric rows').check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:0 athlete:"Bolt" country:"Jamaica" age:25
                ├── LEAF id:1 athlete:"O'Brien" country:"Ireland" age:30
                ├── LEAF id:2 athlete:"José" country:"España" age:40
                ├── LEAF id:3 athlete:'say "hi"' country:"United States" age:50
                └── LEAF id:4 athlete:"123" country:"New Zealand" age:60
            `);
        });
    });

    describe('missing / malformed operand', () => {
        test('an empty quoted operand is rejected as missing', async () => {
            const api = await gridsManager.createGridAndWait('grid1', DEFAULT_OPTIONS);

            await AdvancedFilterHarness.get(api).applyExpression('[Athlete] contains ""');
            await asyncSetTimeout(0);
            expect(displayedAthletes(api)).toEqual(ALL);
            await new FilterDom(api, 'empty operand panel').checkFilterDom(`
                ADVANCED FILTER
                input: "[Athlete] contains """
                valid: false — Expression has an error. Value is missing - "".
                buttons: Apply ⊘ | Builder
                model: null
            `);
            await new GridRows(api, 'empty-operand rows').check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:0 athlete:"Bolt" country:"Jamaica" age:25
                ├── LEAF id:1 athlete:"O'Brien" country:"Ireland" age:30
                ├── LEAF id:2 athlete:"José" country:"España" age:40
                ├── LEAF id:3 athlete:'say "hi"' country:"United States" age:50
                └── LEAF id:4 athlete:"123" country:"New Zealand" age:60
            `);
        });

        test('a missing operand is rejected', async () => {
            const api = await gridsManager.createGridAndWait('grid1', DEFAULT_OPTIONS);

            await AdvancedFilterHarness.get(api).applyExpression('[Athlete] contains');
            await asyncSetTimeout(0);
            expect(displayedAthletes(api)).toEqual(ALL);
            await new FilterDom(api, 'missing operand panel').checkFilterDom(`
                ADVANCED FILTER
                input: "[Athlete] contains"
                valid: false — Expression has an error. Value is missing at end of expression.
                buttons: Apply ⊘ | Builder
                model: null
            `);
            await new GridRows(api, 'missing-operand rows').check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:0 athlete:"Bolt" country:"Jamaica" age:25
                ├── LEAF id:1 athlete:"O'Brien" country:"Ireland" age:30
                ├── LEAF id:2 athlete:"José" country:"España" age:40
                ├── LEAF id:3 athlete:'say "hi"' country:"United States" age:50
                └── LEAF id:4 athlete:"123" country:"New Zealand" age:60
            `);
        });

        test('a missing end quote is rejected', async () => {
            const api = await gridsManager.createGridAndWait('grid1', DEFAULT_OPTIONS);

            await AdvancedFilterHarness.get(api).applyExpression('[Athlete] equals "Bolt');
            await asyncSetTimeout(0);
            expect(displayedAthletes(api)).toEqual(ALL);
            await new FilterDom(api, 'missing end quote panel').checkFilterDom(`
                ADVANCED FILTER
                input: "[Athlete] equals "Bolt"
                valid: false — Expression has an error. Value is missing an end quote - "Bolt.
                buttons: Apply ⊘ | Builder
                model: null
            `);
            await new GridRows(api, 'missing-end-quote rows').check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:0 athlete:"Bolt" country:"Jamaica" age:25
                ├── LEAF id:1 athlete:"O'Brien" country:"Ireland" age:30
                ├── LEAF id:2 athlete:"José" country:"España" age:40
                ├── LEAF id:3 athlete:'say "hi"' country:"United States" age:50
                └── LEAF id:4 athlete:"123" country:"New Zealand" age:60
            `);
        });
    });
});

describe('Advanced Filter — parser edge cases', () => {
    interface Row {
        athlete: string;
        age: number;
        big: bigint;
    }

    const ROW_DATA: Row[] = [
        { athlete: 'Bolt', age: 25, big: 10000000000000000001n },
        { athlete: 'Ng', age: 40, big: 20000000000000000002n },
        { athlete: 'Wei', age: 28, big: 10000000000000000001n },
    ];

    const OPTS: GridOptions<Row> = {
        columnDefs: [
            { field: 'athlete', filter: true },
            { field: 'age', filter: true },
            { field: 'big', cellDataType: 'bigint', filter: true },
        ],
        rowData: ROW_DATA,
        enableAdvancedFilter: true,
    };

    const gridsManager = new TestGridsManager({
        modules: [TextFilterModule, NumberFilterModule, AdvancedFilterModule, ClientSideRowModelModule],
    });

    afterEach(() => gridsManager.reset());

    describe('case normalisation', () => {
        test('an uppercase text operator is rewritten to its canonical display form', async () => {
            const api = await gridsManager.createGridAndWait('grid1', OPTS);
            const af = AdvancedFilterHarness.get(api);

            await af.applyExpression('[Athlete] CONTAINS "o"');
            await asyncSetTimeout(0);

            // The parser matches case-insensitively, then rewrites the editor to the display form.
            expect(af.value).toBe('[Athlete] contains "o"');
            expect(api.getAdvancedFilterModel()).toEqual({
                filterType: 'text',
                colId: 'athlete',
                type: 'contains',
                filter: 'o',
            });
            await new GridRows(api, 'uppercase operator normalised').check(`
                ROOT id:ROOT_NODE_ID
                └── LEAF id:0 athlete:"Bolt" age:25 big:"10000000000000000001n"
            `);
        });

        test('a lowercase join operator is rewritten to uppercase AND across the expression', async () => {
            const api = await gridsManager.createGridAndWait('grid1', OPTS);
            const af = AdvancedFilterHarness.get(api);

            await af.applyExpression('[Age] > 20 and [Athlete] contains "e"');
            await asyncSetTimeout(0);

            expect(af.value).toBe('[Age] > 20 AND [Athlete] contains "e"');
            expect(api.getAdvancedFilterModel()).toEqual({
                filterType: 'join',
                type: 'AND',
                conditions: [
                    { filterType: 'number', colId: 'age', type: 'greaterThan', filter: 20 },
                    { filterType: 'text', colId: 'athlete', type: 'contains', filter: 'e' },
                ],
            });
            await new GridRows(api, 'lowercase join normalised').check(`
                ROOT id:ROOT_NODE_ID
                └── LEAF id:2 athlete:"Wei" age:28 big:"10000000000000000001n"
            `);
        });

        test('a lowercase OR across three conditions normalises every join operator', async () => {
            const api = await gridsManager.createGridAndWait('grid1', OPTS);
            const af = AdvancedFilterHarness.get(api);

            await af.applyExpression('[Age] = 25 or [Age] = 40 or [Age] = 28');
            await asyncSetTimeout(0);

            expect(af.value).toBe('[Age] = 25 OR [Age] = 40 OR [Age] = 28');
            expect(api.getAdvancedFilterModel()).toEqual({
                filterType: 'join',
                type: 'OR',
                conditions: [
                    { filterType: 'number', colId: 'age', type: 'equals', filter: 25 },
                    { filterType: 'number', colId: 'age', type: 'equals', filter: 40 },
                    { filterType: 'number', colId: 'age', type: 'equals', filter: 28 },
                ],
            });
            await new GridRows(api, 'lowercase-OR normalised filters rows').check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:0 athlete:"Bolt" age:25 big:"10000000000000000001n"
                ├── LEAF id:1 athlete:"Ng" age:40 big:"20000000000000000002n"
                └── LEAF id:2 athlete:"Wei" age:28 big:"10000000000000000001n"
            `);
        });
    });

    describe('bigint operand', () => {
        test('a bigint literal beyond Number.MAX_SAFE_INTEGER filters exactly', async () => {
            const api = await gridsManager.createGridAndWait('grid1', OPTS);
            const af = AdvancedFilterHarness.get(api);

            await af.applyExpression('[Big] = 10000000000000000001');
            await asyncSetTimeout(0);

            expect(api.getAdvancedFilterModel()).toEqual({
                filterType: 'bigint',
                colId: 'big',
                type: 'equals',
                filter: '10000000000000000001',
            });
            await new GridRows(api, 'bigint equals').check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:0 athlete:"Bolt" age:25 big:"10000000000000000001n"
                └── LEAF id:2 athlete:"Wei" age:28 big:"10000000000000000001n"
            `);
        });

        test('a quoted bigint operand is rejected as not a bigint', async () => {
            const api = await gridsManager.createGridAndWait('grid1', OPTS);
            const af = AdvancedFilterHarness.get(api);

            await af.type('[Big] = "10000000000000000001"');
            await asyncSetTimeout(0);

            await new FilterDom(api, 'quoted bigint rejected').checkFilterDom(`
                ADVANCED FILTER
                input: "[Big] = "10000000000000000001""
                valid: false — Expression has an error. Value is not a big integer - "10000000000000000001".
                buttons: Apply ⊘ | Builder
                model: null
            `);
        });

        test('a non-numeric bigint operand is rejected', async () => {
            const api = await gridsManager.createGridAndWait('grid1', OPTS);
            const af = AdvancedFilterHarness.get(api);

            await af.type('[Big] = abc');
            await asyncSetTimeout(0);

            expect(af.input.validationMessage).toContain('Value is not a big integer');
            expect(api.getAdvancedFilterModel()).toBeNull();
        });
    });

    describe('operands and validation', () => {
        test('a closing bracket inside a quoted operand is part of the value', async () => {
            const api = await gridsManager.createGridAndWait('grid1', {
                ...OPTS,
                rowData: [
                    { athlete: 'a)b', age: 1, big: 1n },
                    { athlete: 'ab', age: 2, big: 2n },
                ],
            });
            const af = AdvancedFilterHarness.get(api);

            await af.applyExpression('([Athlete] equals "a)b")');
            await asyncSetTimeout(0);

            expect(api.getAdvancedFilterModel()).toEqual({
                filterType: 'text',
                colId: 'athlete',
                type: 'equals',
                filter: 'a)b',
            });
            await new GridRows(api, 'bracket in quoted operand').check(`
                ROOT id:ROOT_NODE_ID
                └── LEAF id:0 athlete:"a)b" age:1 big:"1n"
            `);
        });

        test('a trailing join operator with no second condition reports "missing condition"', async () => {
            const api = await gridsManager.createGridAndWait('grid1', OPTS);
            const af = AdvancedFilterHarness.get(api);

            await af.type('[Age] > 20 AND ');
            await asyncSetTimeout(0);

            expect(af.input.validationMessage).toContain('Condition is missing at end of expression');
            expect(api.getAdvancedFilterModel()).toBeNull();
        });
    });
});

describe('Advanced Filter — dateTime operands', () => {
    interface DateRow {
        name: string;
        when: Date | null;
        stamp: string | null;
    }

    const DATE_ROWS: DateRow[] = [
        { name: 'a', when: new Date('2012-08-05T10:30:00'), stamp: '2012-08-05 10:30:00' },
        { name: 'b', when: new Date('2020-01-01T00:00:00'), stamp: '2020-01-01 00:00:00' },
        { name: 'c', when: new Date('2012-08-05T10:30:00'), stamp: '2012-08-05 10:30:00' },
    ];

    const DATE_OPTS: GridOptions<DateRow> = {
        columnDefs: [
            { field: 'name', filter: true },
            { field: 'when', cellDataType: 'dateTime', filter: true },
            { field: 'stamp', cellDataType: 'dateTimeString', filter: true },
        ],
        rowData: DATE_ROWS,
        enableAdvancedFilter: true,
    };

    const gridsManager = new TestGridsManager({
        modules: [
            TextFilterModule,
            NumberFilterModule,
            DateFilterModule,
            AdvancedFilterModule,
            ClientSideRowModelModule,
        ],
    });

    afterEach(() => gridsManager.reset());

    test('a dateTime column filters by a full timestamp operand', async () => {
        const api = await gridsManager.createGridAndWait('grid1', DATE_OPTS);

        await AdvancedFilterHarness.get(api).applyExpression('[When] = "2012-08-05 10:30:00"');
        await asyncSetTimeout(0);

        expect(api.getAdvancedFilterModel()).toMatchObject({ filterType: 'dateTime', colId: 'when', type: 'equals' });
        await new GridRows(api, 'dateTime equals rows').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:0 name:"a" when:"2012-08-05T10:30:00" stamp:"2012-08-05 10:30:00"
            └── LEAF id:2 name:"c" when:"2012-08-05T10:30:00" stamp:"2012-08-05 10:30:00"
        `);
    });

    test('a dateTimeString column filters by a full timestamp operand', async () => {
        const api = await gridsManager.createGridAndWait('grid1', DATE_OPTS);

        await AdvancedFilterHarness.get(api).applyExpression('[Stamp] = "2012-08-05 10:30:00"');
        await asyncSetTimeout(0);

        expect(api.getAdvancedFilterModel()).toMatchObject({
            filterType: 'dateTimeString',
            colId: 'stamp',
            type: 'equals',
        });
        await new GridRows(api, 'dateTimeString equals rows').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:0 name:"a" when:"2012-08-05T10:30:00" stamp:"2012-08-05 10:30:00"
            └── LEAF id:2 name:"c" when:"2012-08-05T10:30:00" stamp:"2012-08-05 10:30:00"
        `);
    });
});

describe('Advanced Filter — text evaluation against a null cell value', () => {
    const NULLABLE_OPTS: GridOptions<{ athlete: string | null }> = {
        columnDefs: [{ field: 'athlete', filter: true }],
        rowData: [{ athlete: 'Bolt' }, { athlete: null }, { athlete: 'Bond' }],
        enableAdvancedFilter: true,
    };

    const gridsManager = new TestGridsManager({
        modules: [TextFilterModule, NumberFilterModule, AdvancedFilterModule, ClientSideRowModelModule],
    });

    afterEach(() => gridsManager.reset());

    test('"contains" excludes a null cell but "does not contain" includes it', async () => {
        const api = await gridsManager.createGridAndWait('grid1', NULLABLE_OPTS);

        await AdvancedFilterHarness.get(api).applyExpression('[Athlete] contains "o"');
        await asyncSetTimeout(0);
        await new GridRows(api, 'contains excludes null').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:0 athlete:"Bolt"
            └── LEAF id:2 athlete:"Bond"
        `);

        await AdvancedFilterHarness.get(api).applyExpression('[Athlete] does not contain "z"');
        await asyncSetTimeout(0);
        await new GridRows(api, 'does not contain includes null').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:0 athlete:"Bolt"
            ├── LEAF id:1 athlete:null
            └── LEAF id:2 athlete:"Bond"
        `);
    });
});

/**
 * Deep nesting, grouping/precedence, redundant brackets, long chains and whitespace — the structural
 * edge cases the flat 3-condition suites miss. The dataset is chosen so each grouping yields a distinct,
 * verifiable row set. NOTE: Advanced Filter has NO AND/OR precedence — mixing joins at one level without
 * brackets is rejected (see the precedence test), so grouping is required to express such logic.
 */
describe('Advanced Filter — complex & nested expressions', () => {
    interface CRow {
        name: string;
        age: number;
        country: string;
    }

    const C_ROWS: CRow[] = [
        { name: 'Amy', age: 15, country: 'US' },
        { name: 'Ben', age: 25, country: 'UK' },
        { name: 'Cal', age: 35, country: 'US' },
        { name: 'Dan', age: 45, country: 'UK' },
        { name: 'Eve', age: 30, country: 'US' },
        { name: 'x', age: 50, country: 'US' },
        { name: 'y', age: 10, country: 'UK' },
    ];

    const C_OPTS: GridOptions<CRow> = {
        columnDefs: [
            { field: 'name', filter: true },
            { field: 'age', filter: true },
            { field: 'country', filter: true },
        ],
        rowData: C_ROWS,
        enableAdvancedFilter: true,
    };

    const C_UNFILTERED = `
        ROOT id:ROOT_NODE_ID
        ├── LEAF id:0 name:"Amy" age:15 country:"US"
        ├── LEAF id:1 name:"Ben" age:25 country:"UK"
        ├── LEAF id:2 name:"Cal" age:35 country:"US"
        ├── LEAF id:3 name:"Dan" age:45 country:"UK"
        ├── LEAF id:4 name:"Eve" age:30 country:"US"
        ├── LEAF id:5 name:"x" age:50 country:"US"
        └── LEAF id:6 name:"y" age:10 country:"UK"
    `;

    const gridsManager = new TestGridsManager({
        modules: [TextFilterModule, NumberFilterModule, AdvancedFilterModule, ClientSideRowModelModule],
    });

    afterEach(() => gridsManager.reset());

    test('a nested join-of-joins evaluates each group independently', async () => {
        const api = await gridsManager.createGridAndWait('grid1', C_OPTS);

        await AdvancedFilterHarness.get(api).applyExpression(
            '([Age] > 20 OR [Name] equals "x") AND ([Age] < 40 OR [Name] equals "y")'
        );
        await asyncSetTimeout(0);

        expect(api.getAdvancedFilterModel()).toEqual({
            filterType: 'join',
            type: 'AND',
            conditions: [
                {
                    filterType: 'join',
                    type: 'OR',
                    conditions: [
                        { filterType: 'number', colId: 'age', type: 'greaterThan', filter: 20 },
                        { filterType: 'text', colId: 'name', type: 'equals', filter: 'x' },
                    ],
                },
                {
                    filterType: 'join',
                    type: 'OR',
                    conditions: [
                        { filterType: 'number', colId: 'age', type: 'lessThan', filter: 40 },
                        { filterType: 'text', colId: 'name', type: 'equals', filter: 'y' },
                    ],
                },
            ],
        });
        // (age>20 OR x) = {Ben,Cal,Dan,Eve,x}; (age<40 OR y) = {Amy,Ben,Cal,Eve,y}; AND = {Ben,Cal,Eve}.
        await new GridRows(api, 'nested join-of-joins rows').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:1 name:"Ben" age:25 country:"UK"
            ├── LEAF id:2 name:"Cal" age:35 country:"US"
            └── LEAF id:4 name:"Eve" age:30 country:"US"
        `);
    });

    test('grouping is required to mix joins: unbracketed mixed joins are rejected, the group applies', async () => {
        const api = await gridsManager.createGridAndWait('grid1', C_OPTS);
        const af = AdvancedFilterHarness.get(api);

        // No operator precedence: AND/OR mixed at one level without brackets is an error, not "AND binds tighter".
        await af.type('[Age] < 18 OR [Age] > 30 AND [Country] equals "US"');
        await asyncSetTimeout(0);
        expect(af.input.validationMessage).toContain('Join operators within a condition must be the same');
        await af.apply();
        await asyncSetTimeout(0);
        expect(api.getAdvancedFilterModel()).toBeNull();
        await new GridRows(api, 'unbracketed mixed joins rejected').check(C_UNFILTERED);

        // Explicit group over the OR pair applies and filters.
        await af.applyExpression('([Age] < 18 OR [Age] > 30) AND [Country] equals "US"');
        await asyncSetTimeout(0);
        expect(api.getAdvancedFilterModel()).toEqual({
            filterType: 'join',
            type: 'AND',
            conditions: [
                {
                    filterType: 'join',
                    type: 'OR',
                    conditions: [
                        { filterType: 'number', colId: 'age', type: 'lessThan', filter: 18 },
                        { filterType: 'number', colId: 'age', type: 'greaterThan', filter: 30 },
                    ],
                },
                { filterType: 'text', colId: 'country', type: 'equals', filter: 'US' },
            ],
        });
        // (age<18 OR age>30) = {Amy,Cal,Dan,x,y}; AND country=US = {Amy,Cal,x}.
        await new GridRows(api, 'grouped precedence rows').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:0 name:"Amy" age:15 country:"US"
            ├── LEAF id:2 name:"Cal" age:35 country:"US"
            └── LEAF id:5 name:"x" age:50 country:"US"
        `);
    });

    test('redundant brackets parse to the same single-condition model', async () => {
        const api = await gridsManager.createGridAndWait('grid1', C_OPTS);
        const af = AdvancedFilterHarness.get(api);

        await af.applyExpression('[Age] > 20');
        await asyncSetTimeout(0);
        const plain = api.getAdvancedFilterModel();
        expect(plain).toEqual({ filterType: 'number', colId: 'age', type: 'greaterThan', filter: 20 });

        await af.applyExpression('((([Age] > 20)))');
        await asyncSetTimeout(0);
        expect(api.getAdvancedFilterModel()).toEqual(plain);
        // Editor text keeps the redundant brackets verbatim (only the model is canonicalised).
        expect(af.value).toBe('((([Age] > 20)))');
        await new GridRows(api, 'redundant brackets rows').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:1 name:"Ben" age:25 country:"UK"
            ├── LEAF id:2 name:"Cal" age:35 country:"US"
            ├── LEAF id:3 name:"Dan" age:45 country:"UK"
            ├── LEAF id:4 name:"Eve" age:30 country:"US"
            └── LEAF id:5 name:"x" age:50 country:"US"
        `);
    });

    test('a long AND chain and a long OR chain parse without truncation', async () => {
        const api = await gridsManager.createGridAndWait('grid1', C_OPTS);
        const af = AdvancedFilterHarness.get(api);

        // 11 AND conditions; the != clauses drop ages 10,15,35,45,50 → {Ben(25),Eve(30)}.
        await af.applyExpression(
            '[Age] >= 10 AND [Age] <= 50 AND [Age] != 10 AND [Age] != 50 AND [Age] != 15 ' +
                'AND [Age] != 45 AND [Name] does not equal "z" AND [Country] does not equal "FR" AND [Age] > 5 ' +
                'AND [Age] < 60 AND [Age] != 35'
        );
        await asyncSetTimeout(0);
        const andModel = api.getAdvancedFilterModel() as { type: string; conditions: unknown[] };
        expect(andModel.type).toBe('AND');
        expect(andModel.conditions).toHaveLength(11);
        await new GridRows(api, 'long AND chain rows').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:1 name:"Ben" age:25 country:"UK"
            └── LEAF id:4 name:"Eve" age:30 country:"US"
        `);

        // 10 OR conditions covering every present age → all rows match.
        await af.applyExpression(
            '[Age] = 15 OR [Age] = 25 OR [Age] = 35 OR [Age] = 45 OR [Age] = 30 ' +
                'OR [Age] = 50 OR [Age] = 10 OR [Name] equals "zz1" OR [Name] equals "zz2" OR [Name] equals "zz3"'
        );
        await asyncSetTimeout(0);
        const orModel = api.getAdvancedFilterModel() as { type: string; conditions: unknown[] };
        expect(orModel.type).toBe('OR');
        expect(orModel.conditions).toHaveLength(10);
        await new GridRows(api, 'long OR chain rows').check(C_UNFILTERED);
    });

    test('surrounding whitespace parses to the same model but is kept verbatim in the editor', async () => {
        const api = await gridsManager.createGridAndWait('grid1', C_OPTS);
        const af = AdvancedFilterHarness.get(api);

        await af.applyExpression('  [Age]   >   20  ');
        await asyncSetTimeout(0);
        expect(api.getAdvancedFilterModel()).toEqual({
            filterType: 'number',
            colId: 'age',
            type: 'greaterThan',
            filter: 20,
        });
        // Whitespace is NOT normalised in the editor text (unlike operator/join case, which is normalised).
        expect(af.value).toBe('  [Age]   >   20  ');
        await new GridRows(api, 'whitespace rows').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:1 name:"Ben" age:25 country:"UK"
            ├── LEAF id:2 name:"Cal" age:35 country:"US"
            ├── LEAF id:3 name:"Dan" age:45 country:"UK"
            ├── LEAF id:4 name:"Eve" age:30 country:"US"
            └── LEAF id:5 name:"x" age:50 country:"US"
        `);
    });

    test('a nested group works as the first and as the last operand', async () => {
        const api = await gridsManager.createGridAndWait('grid1', C_OPTS);
        const af = AdvancedFilterHarness.get(api);

        // Group FIRST: model condition[0] is the join, condition[1] the plain condition.
        await af.applyExpression('([Age] > 40 OR [Name] equals "Amy") AND [Country] equals "US"');
        await asyncSetTimeout(0);
        expect(api.getAdvancedFilterModel()).toEqual({
            filterType: 'join',
            type: 'AND',
            conditions: [
                {
                    filterType: 'join',
                    type: 'OR',
                    conditions: [
                        { filterType: 'number', colId: 'age', type: 'greaterThan', filter: 40 },
                        { filterType: 'text', colId: 'name', type: 'equals', filter: 'Amy' },
                    ],
                },
                { filterType: 'text', colId: 'country', type: 'equals', filter: 'US' },
            ],
        });
        // (age>40 OR Amy) = {Amy,Dan,x}; AND country=US = {Amy,x}.
        await new GridRows(api, 'group first rows').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:0 name:"Amy" age:15 country:"US"
            └── LEAF id:5 name:"x" age:50 country:"US"
        `);

        // Group LAST: same logic, but the plain condition is condition[0] and the join condition[1].
        await af.applyExpression('[Country] equals "US" AND ([Age] > 40 OR [Name] equals "Amy")');
        await asyncSetTimeout(0);
        expect(api.getAdvancedFilterModel()).toEqual({
            filterType: 'join',
            type: 'AND',
            conditions: [
                { filterType: 'text', colId: 'country', type: 'equals', filter: 'US' },
                {
                    filterType: 'join',
                    type: 'OR',
                    conditions: [
                        { filterType: 'number', colId: 'age', type: 'greaterThan', filter: 40 },
                        { filterType: 'text', colId: 'name', type: 'equals', filter: 'Amy' },
                    ],
                },
            ],
        });
        await new GridRows(api, 'group last rows').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:0 name:"Amy" age:15 country:"US"
            └── LEAF id:5 name:"x" age:50 country:"US"
        `);
    });
});
