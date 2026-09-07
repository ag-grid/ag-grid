import {
    AdvancedFilterBuilderHarness,
    AdvancedFilterHarness,
    FilterDom,
    GridRows,
    TestGridsManager,
    asyncSetTimeout,
    installFilterLayoutMock,
    uninstallFilterLayoutMock,
} from 'ag-test-utils';

import type { FilterInputCallbackParams, GridApi, GridOptions } from 'ag-grid-community';
import { BigIntFilterModule, ClientSideRowModelModule, NumberFilterModule, getGridElement } from 'ag-grid-community';
import { AdvancedFilterModule } from 'ag-grid-enterprise';

interface TestRow {
    value: bigint;
}

function parseBigInt(value: string): bigint | null {
    const trimmed = value.trim();
    if (!trimmed) {
        return null;
    }
    const withoutSuffix = trimmed.endsWith('n') || trimmed.endsWith('N') ? trimmed.slice(0, -1).trim() : trimmed;
    if (!withoutSuffix) {
        return null;
    }
    let sign = 1n;
    let body = withoutSuffix;
    if (body.startsWith('+')) {
        body = body.slice(1);
    } else if (body.startsWith('-')) {
        sign = -1n;
        body = body.slice(1);
    }
    if (!body) {
        return null;
    }
    try {
        if (/^0[xX][0-9a-fA-F]+$/.test(body)) {
            return sign * BigInt(body);
        }
        if (/^\d+$/.test(body)) {
            return sign * BigInt(body);
        }
        return null;
    } catch {
        return null;
    }
}

function formatBigInt(value: bigint): string {
    const sign = value < 0n ? '-' : '';
    const absValue = value < 0n ? -value : value;
    return `${sign}0x${absValue.toString(16).toUpperCase()}`;
}

function getService(api: GridApi): any {
    const beans = (api.getRowNode('ROOT_NODE_ID') as any)?.beans;
    return beans?.advancedFilter ?? beans?.advancedFilterService;
}

function applyExpression(gridDiv: HTMLElement, expression: string): void {
    const input = gridDiv.querySelector<HTMLInputElement>('.ag-advanced-filter input[type=text]')!;
    const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!;
    setter.call(input, expression);
    input.selectionStart = expression.length;
    input.selectionEnd = expression.length;
    input.dispatchEvent(new Event('input', { bubbles: true }));
    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
}

const withParser: GridOptions<TestRow>['columnDefs'] = [
    {
        field: 'value',
        headerName: 'Value',
        cellDataType: 'bigint',
        filter: 'agBigIntColumnFilter',
        filterParams: {
            allowedCharPattern: 'n0-9a-fA-FxX+\\-',
            bigintParser: parseBigInt,
            bigintFormatter: formatBigInt,
        },
    },
];

/**
 * The Advanced Filter must apply a column's custom `bigintParser` to operands (so hex input such
 * as `0xFF` filters correctly) and its `bigintFormatter` when displaying a stored operand (so the
 * expression text and builder pill show `0xFF` rather than the raw decimal model value).
 */
describe('Advanced Filter - bigint custom parser and formatter', () => {
    const gridsManager = new TestGridsManager({
        modules: [NumberFilterModule, BigIntFilterModule, AdvancedFilterModule, ClientSideRowModelModule],
    });
    beforeAll(() => installFilterLayoutMock());
    afterAll(() => uninstallFilterLayoutMock());
    afterEach(() => gridsManager.reset());

    test('the parser and the formatter are given the api and the context', async () => {
        const context = { tag: 'advanced-bigint' };
        const parserSaw: FilterInputCallbackParams[] = [];
        const formatterSaw: FilterInputCallbackParams[] = [];
        const api = gridsManager.createGrid('grid1', {
            context,
            columnDefs: [
                {
                    field: 'value',
                    cellDataType: 'bigint',
                    filter: 'agBigIntColumnFilter',
                    filterParams: {
                        bigintParser: (text: string | null, common: FilterInputCallbackParams) => {
                            parserSaw.push(common);
                            return text == null ? null : parseBigInt(text);
                        },
                        bigintFormatter: (value: bigint | null, common: FilterInputCallbackParams) => {
                            formatterSaw.push(common);
                            return value == null ? null : formatBigInt(value);
                        },
                    },
                },
            ],
            rowData: [{ value: 10n }, { value: 255n }],
            enableAdvancedFilter: true,
        });
        await asyncSetTimeout(0);

        const gridDiv = getGridElement(api)! as HTMLElement;
        applyExpression(gridDiv, '[Value] = 0xFF');
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

    test('hex typed via text input matches and displays with formatter', async () => {
        const api = gridsManager.createGrid('grid1', {
            columnDefs: withParser,
            rowData: [{ value: 10n }, { value: 255n }, { value: 1000n }, { value: 65535n }],
            enableAdvancedFilter: true,
        });
        await asyncSetTimeout(0);
        const gridDiv = getGridElement(api)! as HTMLElement;

        applyExpression(gridDiv, '[Value] = 0xff');
        await asyncSetTimeout(0);

        expect(api.getAdvancedFilterModel()).toEqual({
            filterType: 'bigint',
            colId: 'value',
            type: 'equals',
            filter: '255',
        });
        await new GridRows(api, 'hex matches only 255').check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:1 value:"255n"
        `);

        // Round-trip via model → operand should display through the formatter as 0xFF
        api.setAdvancedFilterModel(api.getAdvancedFilterModel());
        const svc = getService(api);
        expect(svc.getExpressionDisplayValue()).toBe('[Value] = 0xFF');
        await new FilterDom(api, 'hex round-trips through the formatter', { mode: 'advanced-filter' }).checkFilterDom(`
            ADVANCED FILTER
            input: "[Value] = 0xFF"
            valid: true
            buttons: Apply ⊘ | Builder
            model:
              filterType: "bigint"
              colId: "value"
              type: "equals"
              filter: "255"
        `);
    });

    test('no formatter falls back to decimal display and still matches', async () => {
        const api = gridsManager.createGrid('grid2', {
            columnDefs: [
                {
                    field: 'value',
                    headerName: 'Value',
                    cellDataType: 'bigint',
                    filter: 'agBigIntColumnFilter',
                    filterParams: { allowedCharPattern: 'n0-9a-fA-FxX+\\-', bigintParser: parseBigInt },
                },
            ],
            rowData: [{ value: 10n }, { value: 255n }, { value: 1000n }],
            enableAdvancedFilter: true,
        });
        await asyncSetTimeout(0);
        const gridDiv = getGridElement(api)! as HTMLElement;

        applyExpression(gridDiv, '[Value] = 0xff');
        await asyncSetTimeout(0);

        await new GridRows(api, 'no-formatter hex matches only 255').check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:1 value:"255n"
        `);
        api.setAdvancedFilterModel(api.getAdvancedFilterModel());
        expect(getService(api).getExpressionDisplayValue()).toBe('[Value] = 255');

        // With no formatter the operand is written as the canonical decimal and read back through the
        // column's own parser, so re-applying what is displayed must not reinterpret it.
        applyExpression(gridDiv, '[Value] = 255');
        await asyncSetTimeout(0);
        expect(api.getAdvancedFilterModel()).toEqual({
            filterType: 'bigint',
            colId: 'value',
            type: 'equals',
            filter: '255',
        });

        await new FilterDom(api, 'no formatter falls back to decimal', { mode: 'advanced-filter' }).checkFilterDom(`
            ADVANCED FILTER
            input: "[Value] = 255"
            valid: true
            buttons: Apply ⊘ | Builder
            model:
              filterType: "bigint"
              colId: "value"
              type: "equals"
              filter: "255"
        `);
    });

    test('builder value pill formats the stored operand and parses custom bigint input', async () => {
        const api = gridsManager.createGrid('grid3', {
            columnDefs: withParser,
            rowData: [{ value: 10n }, { value: 255n }, { value: 1000n }, { value: 65535n }],
            enableAdvancedFilter: true,
        });
        await asyncSetTimeout(0);
        api.setAdvancedFilterModel({ filterType: 'bigint', colId: 'value', type: 'equals', filter: '255' } as any);
        await asyncSetTimeout(0);

        const builder = await AdvancedFilterBuilderHarness.open(api);
        const [condition] = await builder.conditionItems();

        // The stored decimal model value is displayed through the column's bigintFormatter.
        expect(builder.valuePillText(condition)).toBe('0xFF');
        await new FilterDom(api, 'builder pill shows the formatted operand', { mode: 'builder' }).checkFilterDom(`
            BUILDER
            AND
              Value = 0xFF
              + add
            buttons: Apply | Cancel
            model:
              filterType: "bigint"
              colId: "value"
              type: "equals"
              filter: "255"
        `);

        // `1000n` is only understood by the column's bigintParser (native BigInt rejects the suffix),
        // so a canonical decimal in the model proves the builder ran the edit through that parser.
        await builder.setValue(condition, '1000n');
        await builder.apply();
        await asyncSetTimeout(0);

        expect(api.getAdvancedFilterModel()).toEqual({
            filterType: 'bigint',
            colId: 'value',
            type: 'equals',
            filter: '1000',
        });
        await new GridRows(api, 'builder operand edit matches only 1000').check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:2 value:"1000n"
        `);
    });

    test('builder decimal operand is stored canonically, matches, and displays via the formatter', async () => {
        const api = gridsManager.createGrid('grid4', {
            columnDefs: withParser,
            rowData: [{ value: 10n }, { value: 255n }, { value: 1000n }, { value: 65535n }],
            enableAdvancedFilter: true,
        });
        await asyncSetTimeout(0);
        api.setAdvancedFilterModel({ filterType: 'bigint', colId: 'value', type: 'equals', filter: '1000' } as any);
        await asyncSetTimeout(0);

        const builder = await AdvancedFilterBuilderHarness.open(api);
        const [condition] = await builder.conditionItems();

        // The builder editor presents the stored operand through the formatter, not as the canonical
        // decimal it is stored as — assert that here, while the builder is still open, so a
        // regression showing `1000`/`255` in the editor cannot hide behind the applied expression.
        expect(builder.valuePillText(condition)).toBe('0x3E8');

        await builder.setValue(condition, '255');
        // Re-query: committing the edit re-renders the condition row, detaching the earlier element.
        const [editedCondition] = await builder.conditionItems();
        expect(builder.valuePillText(editedCondition)).toBe('0xFF');

        await builder.apply();
        await asyncSetTimeout(0);

        expect(api.getAdvancedFilterModel()).toEqual({
            filterType: 'bigint',
            colId: 'value',
            type: 'equals',
            filter: '255',
        });
        await new GridRows(api, 'builder decimal operand matches only 255').check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:1 value:"255n"
        `);
        // The formatter is the canonical presentation of a stored operand, whatever syntax was typed.
        expect(getService(api).getExpressionDisplayValue()).toBe('[Value] = 0xFF');
    });

    test('builder value editor opens with the formatted operand, not the underlying decimal', async () => {
        const api = gridsManager.createGrid('grid5', {
            columnDefs: withParser,
            rowData: [{ value: 10n }, { value: 255n }, { value: 1000n }],
            enableAdvancedFilter: true,
        });
        await asyncSetTimeout(0);
        api.setAdvancedFilterModel({ filterType: 'bigint', colId: 'value', type: 'equals', filter: '1000' } as any);
        await asyncSetTimeout(0);

        const builder = await AdvancedFilterBuilderHarness.open(api);
        const [condition] = await builder.conditionItems();
        expect(builder.valuePillText(condition)).toBe('0x3E8');

        // Editing must start from the value shown on the pill (the formatter's output, which the
        // column's parser accepts), not the canonical decimal the model stores.
        expect((await builder.openValueEditor(condition)).value).toBe('0x3E8');
    });

    test('builder keeps the typed operand syntax across apply when no formatter can reproduce it', async () => {
        const api = gridsManager.createGrid('grid7', {
            columnDefs: [
                {
                    field: 'value',
                    headerName: 'Value',
                    cellDataType: 'bigint',
                    filter: 'agBigIntColumnFilter',
                    filterParams: { allowedCharPattern: 'n0-9a-fA-FxX+\\-', bigintParser: parseBigInt },
                },
            ],
            rowData: [{ value: 10n }, { value: 255n }, { value: 1000n }],
            enableAdvancedFilter: true,
        });
        await asyncSetTimeout(0);
        const gridDiv = getGridElement(api)! as HTMLElement;

        // Without a bigintFormatter the model's canonical `255` cannot be turned back into `0xff`,
        // so the builder must carry the typed text rather than fall back to the decimal.
        applyExpression(gridDiv, '[Value] = 0xff');
        await asyncSetTimeout(0);

        const builder = await AdvancedFilterBuilderHarness.open(api);
        const [condition] = await builder.conditionItems();
        expect(builder.valuePillText(condition)).toBe('0xff');
        expect((await builder.openValueEditor(condition)).value).toBe('0xff');
        await new FilterDom(api, 'builder keeps the typed operand syntax', { mode: 'builder' }).checkFilterDom(`
            BUILDER
            AND
              Value = 0xff
              + add
            buttons: Apply | Cancel
            model:
              filterType: "bigint"
              colId: "value"
              type: "equals"
              filter: "255"
        `);

        // Applying from the builder round-trips the operand through the expression text, so the
        // typed syntax must survive a re-open too - and must still filter on the parsed value.
        await builder.apply();
        await asyncSetTimeout(0);
        await builder.close();

        const reopened = await AdvancedFilterBuilderHarness.open(api);
        expect(reopened.valuePillText((await reopened.conditionItems())[0])).toBe('0xff');
        expect(api.getAdvancedFilterModel()).toEqual({
            filterType: 'bigint',
            colId: 'value',
            type: 'equals',
            filter: '255',
        });
        await new GridRows(api, 'typed hex still matches only 255').check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:1 value:"255n"
        `);
    });

    test('builder value editor opens with the decimal operand when no formatter is provided', async () => {
        const api = gridsManager.createGrid('grid6', {
            columnDefs: [
                {
                    field: 'value',
                    headerName: 'Value',
                    cellDataType: 'bigint',
                    filter: 'agBigIntColumnFilter',
                    filterParams: { allowedCharPattern: 'n0-9a-fA-FxX+\\-', bigintParser: parseBigInt },
                },
            ],
            rowData: [{ value: 10n }, { value: 255n }, { value: 1000n }],
            enableAdvancedFilter: true,
        });
        await asyncSetTimeout(0);
        api.setAdvancedFilterModel({ filterType: 'bigint', colId: 'value', type: 'equals', filter: '1000' } as any);
        await asyncSetTimeout(0);

        const builder = await AdvancedFilterBuilderHarness.open(api);
        const [condition] = await builder.conditionItems();
        expect(builder.valuePillText(condition)).toBe('1000');
        expect((await builder.openValueEditor(condition)).value).toBe('1000');
        await new FilterDom(api, 'builder decimal operand with no formatter', { mode: 'builder' }).checkFilterDom(`
            BUILDER
            AND
              Value = 1000
              + add
            buttons: Apply | Cancel
            model:
              filterType: "bigint"
              colId: "value"
              type: "equals"
              filter: "1000"
        `);
    });

    test('an operand the bigint parser rejects is reported as not a number', async () => {
        // Rejects negatives while still reading a plain decimal, which `bigintParser` documents as required.
        const unsignedOnly = (text: string | null) => {
            const parsed = text == null ? null : parseBigInt(text);
            return parsed == null || parsed < 0n ? null : parsed;
        };
        const api = gridsManager.createGrid('grid1', {
            columnDefs: [
                {
                    field: 'value',
                    headerName: 'Value',
                    cellDataType: 'bigint',
                    filter: 'agBigIntColumnFilter',
                    filterParams: { allowedCharPattern: 'n0-9a-fA-FxX+\\-', bigintParser: unsignedOnly },
                },
            ],
            rowData: [{ value: 10n }, { value: 255n }],
            enableAdvancedFilter: true,
        });
        await asyncSetTimeout(0);
        const af = AdvancedFilterHarness.get(api);

        // The default parser reads `-5`, so only the column's own parser can reject it.
        await af.applyExpression('[Value] = -5');
        await asyncSetTimeout(0);

        expect(af.input.validationMessage).toContain('Value is not a BigInt');
        expect(api.getAdvancedFilterModel()).toBeNull();
    });
});
