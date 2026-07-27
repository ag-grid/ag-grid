import type { GridApi, GridOptions } from 'ag-grid-community';
import { BigIntFilterModule, ClientSideRowModelModule, NumberFilterModule, getGridElement } from 'ag-grid-community';
import { AdvancedFilterModule } from 'ag-grid-enterprise';

import {
    AdvancedFilterBuilderHarness,
    GridRows,
    TestGridsManager,
    asyncSetTimeout,
    installFilterLayoutMock,
    uninstallFilterLayoutMock,
} from '../../test-utils';

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

/** Display text of a builder condition row's value pill. */
function valuePillText(item: HTMLElement): string {
    return (
        item
            .querySelector('.ag-advanced-filter-builder-value-pill .ag-advanced-filter-builder-pill-display')
            ?.textContent?.trim() ?? ''
    );
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
        expect(valuePillText(condition)).toBe('0xFF');

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
});
