import {
    AdvancedFilterBuilderHarness,
    AdvancedFilterHarness,
    GridRows,
    TestGridsManager,
    asyncSetTimeout,
    installFilterLayoutMock,
    uninstallFilterLayoutMock,
} from 'ag-test-utils';

import type { FilterInputCallbackParams, GridOptions } from 'ag-grid-community';
import { ClientSideRowModelModule, NumberFilterModule, TextFilterModule } from 'ag-grid-community';
import { AdvancedFilterModule } from 'ag-grid-enterprise';

interface TestRow {
    value: number;
    plain?: number;
}

/** Reads the grouped form the formatter writes; plain `Number` cannot. */
function parseGrouped(value: string | null): number | null {
    const trimmed = value?.trim();
    if (!trimmed) {
        return null;
    }
    if (!/^[+-]?[\d,]+(\.\d+)?$/.test(trimmed)) {
        return null;
    }
    const parsed = Number(trimmed.replace(/,/g, ''));
    return isNaN(parsed) ? null : parsed;
}

function formatGrouped(value: number | null): string | null {
    if (value == null) {
        return null;
    }
    const sign = value < 0 ? '-' : '';
    const [whole, fraction] = String(Math.abs(value)).split('.');
    const grouped = whole.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return `${sign}${grouped}${fraction ? `.${fraction}` : ''}`;
}

const ROW_DATA: TestRow[] = [{ value: 10 }, { value: 255 }, { value: 1234 }, { value: 1234567 }];

const withParser: GridOptions<TestRow>['columnDefs'] = [
    {
        field: 'value',
        headerName: 'Value',
        cellDataType: 'number',
        filter: 'agNumberColumnFilter',
        filterParams: {
            allowedCharPattern: '\\d,.+\\-',
            numberParser: parseGrouped,
            numberFormatter: formatGrouped,
        },
    },
];

/**
 * A number column's `numberParser` and `numberFormatter` decide its operands in the Advanced Filter,
 * exactly as `bigintParser` and `bigintFormatter` already do for a BigInt column.
 */
describe('Advanced Filter - number custom parser and formatter', () => {
    const gridsManager = new TestGridsManager({
        modules: [NumberFilterModule, TextFilterModule, AdvancedFilterModule, ClientSideRowModelModule],
    });
    beforeAll(() => installFilterLayoutMock());
    afterAll(() => uninstallFilterLayoutMock());
    afterEach(() => gridsManager.reset());

    test('the parser and the formatter are given the api and the context', async () => {
        const context = { tag: 'advanced' };
        const parserSaw: FilterInputCallbackParams[] = [];
        const formatterSaw: FilterInputCallbackParams[] = [];
        const api = gridsManager.createGrid('grid1', {
            context,
            columnDefs: [
                {
                    field: 'value',
                    filter: 'agNumberColumnFilter',
                    filterParams: {
                        numberParser: (text: string | null, common: FilterInputCallbackParams) => {
                            parserSaw.push(common);
                            return parseGrouped(text);
                        },
                        numberFormatter: (value: number | null, common: FilterInputCallbackParams) => {
                            formatterSaw.push(common);
                            return value == null ? null : value.toLocaleString('en-US');
                        },
                    },
                },
            ],
            rowData: ROW_DATA,
            enableAdvancedFilter: true,
        });
        await asyncSetTimeout(0);
        await AdvancedFilterHarness.get(api).applyExpression('[Value] = 1,234');
        await asyncSetTimeout(0);

        // The operand is read on apply and written back when the expression is re-displayed.
        api.setAdvancedFilterModel(api.getAdvancedFilterModel());
        await asyncSetTimeout(0);

        expect(parserSaw.length).toBeGreaterThan(0);
        expect(formatterSaw.length).toBeGreaterThan(0);
        for (const common of [...parserSaw, ...formatterSaw]) {
            expect(common.api).toBe(api);
            expect(common.context).toBe(context);
            // The column too, so one callback on `defaultColDef` can tell which one it is working on.
            expect(common.column.getColId()).toBe('value');
            expect(common.colDef).toBe(common.column.getColDef());
        }
    });

    // Both round-trip: the model holds the plain number, so only the formatter can put the grouping back.
    test.each([
        ['a single separator', '[Value] = 1,234', 'equals', 1234],
        ['more than one separator', '[Value] > 1,234,566', 'greaterThan', 1234566],
    ] as const)(
        'a grouped operand with %s is read by the parser and displayed through the formatter',
        async (_name, expression, type, filter) => {
            const api = gridsManager.createGrid('grid1', {
                columnDefs: withParser,
                rowData: ROW_DATA,
                enableAdvancedFilter: true,
            });
            await asyncSetTimeout(0);
            await AdvancedFilterHarness.get(api).applyExpression(expression);
            await asyncSetTimeout(0);

            expect(api.getAdvancedFilterModel()).toEqual({
                filterType: 'number',
                colId: 'value',
                type,
                filter,
            });

            api.setAdvancedFilterModel(api.getAdvancedFilterModel());
            expect(AdvancedFilterHarness.get(api).value).toBe(expression);
        }
    );

    // A saved model is what users persist, and it is canonical: restoring one must give back the same model
    // and the same rows, whatever the column now displays the operand as.
    test.each([
        ['a value the formatter groups', 1234567],
        ['a value it does not', 255],
    ] as const)('a saved model with %s restores unchanged', async (_name, filter) => {
        const api = gridsManager.createGrid('grid1', {
            columnDefs: withParser,
            rowData: ROW_DATA,
            enableAdvancedFilter: true,
        });
        await asyncSetTimeout(0);

        const saved = { filterType: 'number', colId: 'value', type: 'equals', filter } as const;
        api.setAdvancedFilterModel(saved);
        api.onFilterChanged();
        await asyncSetTimeout(0);

        expect(api.getAdvancedFilterModel()).toEqual(saved);
        expect(api.getDisplayedRowAtIndex(0)?.data?.value).toBe(filter);
        expect(api.getDisplayedRowCount()).toBe(1);

        // Reopening the builder re-reads the operand out of what is displayed, which must not move it either.
        const builder = await AdvancedFilterBuilderHarness.open(api);
        await builder.apply();
        await asyncSetTimeout(0);

        expect(api.getAdvancedFilterModel()).toEqual(saved);
        expect(api.getDisplayedRowAtIndex(0)?.data?.value).toBe(filter);
        expect(api.getDisplayedRowCount()).toBe(1);
    });

    test('a grouped operand filters on the number its parser reads it as', async () => {
        const api = gridsManager.createGrid('grid1', {
            columnDefs: withParser,
            rowData: ROW_DATA,
            enableAdvancedFilter: true,
        });
        await asyncSetTimeout(0);
        await AdvancedFilterHarness.get(api).applyExpression('[Value] = 1,234');
        await asyncSetTimeout(0);

        await new GridRows(api, 'grouped operand matches only 1234').check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:2 value:1234
        `);
    });

    // Operands are the column's own syntax only where it can both read and write that syntax. Without a
    // `numberFormatter` the grid can only write a plain number, so a `numberParser` alone does not read them:
    // a parser of another syntax would reinterpret the very value the grid stored.
    test('a parser with no formatter leaves operands as plain numbers, which it does not reinterpret', async () => {
        const api = gridsManager.createGrid('grid1', {
            columnDefs: [
                {
                    field: 'value',
                    headerName: 'Value',
                    cellDataType: 'number',
                    filter: 'agNumberColumnFilter',
                    filterParams: { allowedCharPattern: '\\d,.+\\-', numberParser: parseGrouped },
                },
            ],
            rowData: ROW_DATA,
            enableAdvancedFilter: true,
        });
        await asyncSetTimeout(0);

        // The grouped form is not the operand syntax here, so it is reported rather than silently reread.
        await AdvancedFilterHarness.get(api).applyExpression('[Value] = 1,234');
        await asyncSetTimeout(0);
        expect(api.getAdvancedFilterModel()).toBe(null);

        await AdvancedFilterHarness.get(api).applyExpression('[Value] = 1234');
        await asyncSetTimeout(0);

        expect(api.getAdvancedFilterModel()).toEqual({
            filterType: 'number',
            colId: 'value',
            type: 'equals',
            filter: 1234,
        });
        await new GridRows(api, 'plain operand matches only 1234').check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:2 value:1234
        `);
        expect(AdvancedFilterHarness.get(api).value).toBe('[Value] = 1234');
    });

    // A parser reading another radix would read the plain number the grid stores as a different value.
    test('a parser whose syntax the grid cannot write does not reinterpret an API-set operand', async () => {
        const hexParser = (text: string | null) => {
            const trimmed = text?.trim();
            if (!trimmed) {
                return null;
            }
            const parsed = parseInt(trimmed.replace(/^0x/i, ''), 16);
            return isNaN(parsed) ? null : parsed;
        };
        const api = gridsManager.createGrid('grid1', {
            columnDefs: [
                {
                    field: 'value',
                    headerName: 'Value',
                    cellDataType: 'number',
                    filter: 'agNumberColumnFilter',
                    filterParams: { numberParser: hexParser },
                },
            ],
            rowData: [{ value: 255 }, { value: 597 }],
            enableAdvancedFilter: true,
        });
        await asyncSetTimeout(0);
        api.setAdvancedFilterModel({ filterType: 'number', colId: 'value', type: 'equals', filter: 255 } as any);
        await asyncSetTimeout(0);

        // `parseInt('255', 16)` is 597: the operand the grid wrote must not be read as the parser's syntax.
        expect(api.getAdvancedFilterModel()).toEqual({
            filterType: 'number',
            colId: 'value',
            type: 'equals',
            filter: 255,
        });
        await new GridRows(api, 'the API operand filters the value it was set to').check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:0 value:255
        `);
    });

    test('the builder value pill formats the stored operand and parses a grouped edit', async () => {
        const api = gridsManager.createGrid('grid1', {
            columnDefs: withParser,
            rowData: ROW_DATA,
            enableAdvancedFilter: true,
        });
        await asyncSetTimeout(0);
        api.setAdvancedFilterModel({ filterType: 'number', colId: 'value', type: 'equals', filter: 1234 } as any);
        await asyncSetTimeout(0);

        const builder = await AdvancedFilterBuilderHarness.open(api);
        const [condition] = await builder.conditionItems();

        // The stored plain number is displayed through the column's numberFormatter.
        expect(builder.valuePillText(condition)).toBe('1,234');
        expect((await builder.openValueEditor(condition)).value).toBe('1,234');

        await builder.setValue(condition, '1,234,567');
        await builder.apply();
        await asyncSetTimeout(0);

        expect(api.getAdvancedFilterModel()).toEqual({
            filterType: 'number',
            colId: 'value',
            type: 'equals',
            filter: 1234567,
        });
        await new GridRows(api, 'builder operand edit matches only 1234567').check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:3 value:1234567
        `);
    });

    // The expression is what an operand is read back out of, so a format that cannot survive that is
    // not used: displaying it would round the stored value away on the next read.
    test('a formatter whose output does not read back leaves the operand plain', async () => {
        const api = gridsManager.createGrid('grid1', {
            columnDefs: [
                {
                    field: 'value',
                    headerName: 'Value',
                    cellDataType: 'number',
                    filter: 'agNumberColumnFilter',
                    filterParams: {
                        numberFormatter: (v: number | null) => (v == null ? null : v.toFixed(0)),
                        numberParser: (text: string | null) => (text == null || text === '' ? null : parseFloat(text)),
                    },
                },
            ],
            rowData: [{ value: 1234.56 }, { value: 1235 }],
            enableAdvancedFilter: true,
        });
        await asyncSetTimeout(0);
        api.setAdvancedFilterModel({ filterType: 'number', colId: 'value', type: 'equals', filter: 1234.56 });
        api.onFilterChanged();
        await asyncSetTimeout(0);

        // `1235` would read back as a different operand, so the plain number is shown instead.
        expect(AdvancedFilterHarness.get(api).value).toBe('[Value] = 1234.56');

        const builder = await AdvancedFilterBuilderHarness.open(api);
        await builder.apply();
        await asyncSetTimeout(0);

        expect(api.getAdvancedFilterModel()).toEqual({
            filterType: 'number',
            colId: 'value',
            type: 'equals',
            filter: 1234.56,
        });
    });

    test('an inverse formatter survives opening the builder and an editor left untouched', async () => {
        const api = gridsManager.createGrid('grid1', {
            columnDefs: withParser,
            rowData: ROW_DATA,
            enableAdvancedFilter: true,
        });
        await asyncSetTimeout(0);
        api.setAdvancedFilterModel({ filterType: 'number', colId: 'value', type: 'equals', filter: 1234567 });
        await asyncSetTimeout(0);

        const builder = await AdvancedFilterBuilderHarness.open(api);
        const [condition] = await builder.conditionItems();
        expect(builder.valuePillText(condition)).toBe('1,234,567');

        const editor = await builder.openValueEditor(condition);
        expect(editor.value).toBe('1,234,567');
        editor.dispatchEvent(new FocusEvent('focusout', { bubbles: true }));
        await asyncSetTimeout(0);

        await builder.apply();
        await asyncSetTimeout(0);

        expect(api.getAdvancedFilterModel()).toEqual({
            filterType: 'number',
            colId: 'value',
            type: 'equals',
            filter: 1234567,
        });
    });

    test('the operand editor follows a column change between two number columns', async () => {
        const api = gridsManager.createGrid('grid1', {
            columnDefs: [
                { field: 'plain', headerName: 'Plain', cellDataType: 'number', filter: 'agNumberColumnFilter' },
                ...withParser!,
            ],
            rowData: [
                { plain: 1, value: 10 },
                { plain: 2, value: 1234567 },
            ],
            enableAdvancedFilter: true,
        });
        await asyncSetTimeout(0);
        api.setAdvancedFilterModel({ filterType: 'number', colId: 'plain', type: 'equals', filter: 1 } as any);
        await asyncSetTimeout(0);

        const builder = await AdvancedFilterBuilderHarness.open(api);
        const [condition] = await builder.conditionItems();
        await builder.selectColumn(condition, 'Value');

        // Both columns are `number`, so only the new column's `numberParser` makes this a text editor.
        expect((await builder.openValueEditor(condition)).type).toBe('text');

        await builder.setValue(condition, '1,234,567');
        await builder.apply();
        await asyncSetTimeout(0);

        expect(api.getAdvancedFilterModel()).toEqual({
            filterType: 'number',
            colId: 'value',
            type: 'equals',
            filter: 1234567,
        });
    });

    // A change of data type takes the operator with it, and the operand pill goes when the operator does —
    // so by the time the column-identity rebuild is reached there is no pill left for it to touch.
    test('a column change to another data type leaves no operand pill behind', async () => {
        const api = gridsManager.createGrid('grid1', {
            columnDefs: [
                ...withParser!,
                { field: 'name', headerName: 'Name', cellDataType: 'text', filter: 'agTextColumnFilter' },
            ],
            rowData: [{ value: 1234567, name: 'a' }],
            enableAdvancedFilter: true,
        });
        await asyncSetTimeout(0);
        api.setAdvancedFilterModel({ filterType: 'number', colId: 'value', type: 'equals', filter: 1234567 });
        await asyncSetTimeout(0);

        const builder = await AdvancedFilterBuilderHarness.open(api);
        const [condition] = await builder.conditionItems();
        expect(builder.valuePillText(condition)).toBe('1,234,567');

        await builder.selectColumn(condition, 'Name');

        expect(builder.valuePills(condition)).toHaveLength(0);
        expect(await builder.operatorOptions(condition)).toContain('contains');
    });

    const formatterOnly: GridOptions<TestRow>['columnDefs'] = [
        {
            field: 'value',
            headerName: 'Value',
            cellDataType: 'number',
            filter: 'agNumberColumnFilter',
            filterParams: { numberFormatter: formatGrouped },
        },
    ];

    test('a numberFormatter with no parser leaves the operand as the plain number that reads back', async () => {
        const api = gridsManager.createGrid('grid1', {
            columnDefs: formatterOnly,
            rowData: ROW_DATA,
            enableAdvancedFilter: true,
        });
        await asyncSetTimeout(0);
        api.setAdvancedFilterModel({ filterType: 'number', colId: 'value', type: 'equals', filter: 1234567 } as any);
        api.onFilterChanged();
        await asyncSetTimeout(0);

        // Formatting it as `1,234,567` would leave an expression only a `numberParser` could read back.
        expect(AdvancedFilterHarness.get(api).value).toBe('[Value] = 1234567');
        await new GridRows(api, 'formatter-only operand matches only 1234567').check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:3 value:1234567
        `);
    });

    test('an empty operand is no operand, not the formatted zero', async () => {
        const api = gridsManager.createGrid('grid1', {
            columnDefs: withParser,
            rowData: ROW_DATA,
            enableAdvancedFilter: true,
        });
        await asyncSetTimeout(0);
        api.setAdvancedFilterModel({ filterType: 'number', colId: 'value', type: 'equals', filter: '' } as any);
        await asyncSetTimeout(0);

        expect(AdvancedFilterHarness.get(api).value).toBe('[Value] = ');
    });

    // A blank format reads back as the value it came from and still leaves nothing in the expression,
    // so the round-trip guard has to reject it on its own account.
    test('a formatter blanking a value leaves the operand plain', async () => {
        const api = gridsManager.createGrid('grid1', {
            columnDefs: [
                {
                    field: 'value',
                    headerName: 'Value',
                    cellDataType: 'number',
                    filter: 'agNumberColumnFilter',
                    filterParams: {
                        // Blanking a zero is a display convention; reading blank back as zero is its inverse.
                        numberFormatter: (v: number | null) => (v === 0 ? '' : String(v)),
                        numberParser: (text: string | null) => (text?.trim() ? Number(text) : 0),
                    },
                },
            ],
            rowData: [{ value: 0 }, { value: 10 }],
            enableAdvancedFilter: true,
        });
        await asyncSetTimeout(0);
        api.setAdvancedFilterModel({ filterType: 'number', colId: 'value', type: 'equals', filter: 0 });
        api.onFilterChanged();
        await asyncSetTimeout(0);

        expect(AdvancedFilterHarness.get(api).value).toBe('[Value] = 0');
        await new GridRows(api, 'blanked-format operand still matches zero').check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:0 value:0
        `);
    });

    // A bare operand ends at a space or a `)` and opens on a leading quote, so a format using any of them
    // is only readable back in quotes — of the kind the format itself does not use.
    test.each([
        ['a space', (value: number) => value.toLocaleString('en-US').replace(/,/g, ' '), '"1 234 567"'],
        ['parentheses', (value: number) => `(${value})`, '"(1234567)"'],
        // Quoted with the other kind, so the operand's own quotes stay part of it.
        ['a leading quote', (value: number) => `"${value}"`, `'"1234567"'`],
    ] as const)(
        'a numberFormatter writing %s has its operand quoted, and reads back',
        async (_name, format, quoted) => {
            const parse = (text: string | null) => {
                const digits = text?.replace(/[^\d]/g, '');
                return digits ? Number(digits) : null;
            };
            const api = gridsManager.createGrid('grid1', {
                columnDefs: [
                    {
                        field: 'value',
                        headerName: 'Value',
                        cellDataType: 'number',
                        filter: 'agNumberColumnFilter',
                        filterParams: {
                            numberParser: parse,
                            numberFormatter: (v: number | null) => (v == null ? null : format(v)),
                        },
                    },
                ],
                rowData: ROW_DATA,
                enableAdvancedFilter: true,
            });
            await asyncSetTimeout(0);

            api.setAdvancedFilterModel({ filterType: 'number', colId: 'value', type: 'equals', filter: 1234567 });
            api.onFilterChanged();
            await asyncSetTimeout(0);

            expect(AdvancedFilterHarness.get(api).value).toBe(`[Value] = ${quoted}`);
            // The quotes are the grammar's, not the operand's: what they hold still goes through the parser.
            expect(api.getAdvancedFilterModel()).toEqual({
                filterType: 'number',
                colId: 'value',
                type: 'equals',
                filter: 1234567,
            });
            await new GridRows(api, `quoted ${_name} operand matches only 1234567`).check(`
                ROOT id:ROOT_NODE_ID
                └── LEAF id:3 value:1234567
            `);
        }
    );

    // Either quote ends an operand, so a format using both cannot be wrapped in one that survives.
    test('a numberFormatter writing both quote kinds leaves the operand plain', async () => {
        const api = gridsManager.createGrid('grid1', {
            columnDefs: [
                {
                    field: 'value',
                    headerName: 'Value',
                    cellDataType: 'number',
                    filter: 'agNumberColumnFilter',
                    filterParams: {
                        numberFormatter: (v: number | null) => (v == null ? null : `'${v}"`),
                        numberParser: (text: string | null) => {
                            const digits = text?.replace(/[^\d]/g, '');
                            return digits ? Number(digits) : null;
                        },
                    },
                },
            ],
            rowData: ROW_DATA,
            enableAdvancedFilter: true,
        });
        await asyncSetTimeout(0);

        api.setAdvancedFilterModel({ filterType: 'number', colId: 'value', type: 'equals', filter: 1234567 });
        api.onFilterChanged();
        await asyncSetTimeout(0);

        expect(AdvancedFilterHarness.get(api).value).toBe('[Value] = 1234567');
        expect(api.getAdvancedFilterModel()).toEqual({
            filterType: 'number',
            colId: 'value',
            type: 'equals',
            filter: 1234567,
        });
        await new GridRows(api, 'unquotable format falls back to the number it stands for').check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:3 value:1234567
        `);
    });

    test('a plain number operand is not quoted', async () => {
        const api = gridsManager.createGrid('grid1', {
            columnDefs: [{ field: 'value', headerName: 'Value', cellDataType: 'number', filter: true }],
            rowData: ROW_DATA,
            enableAdvancedFilter: true,
        });
        await asyncSetTimeout(0);

        api.setAdvancedFilterModel({ filterType: 'number', colId: 'value', type: 'equals', filter: 1234 });
        api.onFilterChanged();
        await asyncSetTimeout(0);

        expect(AdvancedFilterHarness.get(api).value).toBe('[Value] = 1234');
    });

    test('an operand the parser rejects is reported as not a number', async () => {
        const api = gridsManager.createGrid('grid1', {
            columnDefs: withParser,
            rowData: ROW_DATA,
            enableAdvancedFilter: true,
        });
        await asyncSetTimeout(0);
        // `parseGrouped` rejects exponent notation; `Number` reads it, and used to be what decided.
        await AdvancedFilterHarness.get(api).applyExpression('[Value] = 1e3');
        await asyncSetTimeout(0);

        expect(api.getAdvancedFilterModel()).toBe(null);
        await new GridRows(api, 'an operand no parser reads filters nothing').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:0 value:10
            ├── LEAF id:1 value:255
            ├── LEAF id:2 value:1234
            └── LEAF id:3 value:1234567
        `);
    });
});
