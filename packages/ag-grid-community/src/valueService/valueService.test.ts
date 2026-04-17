import type { EditService } from '../edit/editService';
import type { AgColumn } from '../entities/agColumn';
import type { ColDef, ValueFormatterParams } from '../entities/colDef';
import { RowNode } from '../entities/rowNode';
import type { GridOptionsService } from '../gridOptionsService';
import { mock } from '../test-utils/mock';
import type { ExpressionService } from './expressionService';
import { ValueService } from './valueService';

let colDef: ColDef;
let column: jest.Mocked<AgColumn>;
let gos: jest.Mocked<GridOptionsService>;
let expressionSvc: jest.Mocked<ExpressionService>;
let valueSvc: ValueService;

describe('formatValue', () => {
    beforeEach(() => {
        colDef = {};
        column = mock<AgColumn>('getColDef');
        column.getColDef.mockReturnValue(colDef);
        (column as any).colDef = colDef;

        gos = mock<GridOptionsService>('get', 'addCommon');
        gos.addCommon.mockImplementation((params) => params as any);
        expressionSvc = mock<ExpressionService>('evaluate');
        valueSvc = new ValueService();
        (valueSvc as any).gos = gos;
        (valueSvc as any).expressionSvc = expressionSvc;
        (valueSvc as any).beans = {
            editSvc: mock<EditService>('isEditing'),
            expressionSvc,
        };
    });

    it('uses supplied formatter if provided', () => {
        const returnValue = 'foo';
        const formatter = () => returnValue;
        const value = 'bar';

        const formattedValue = valueSvc.formatValue(column, null, value, formatter);

        expect(formattedValue).toBe(returnValue);
        expect(expressionSvc.evaluate).toHaveBeenCalledTimes(0);
    });

    it('uses value formatter from column definition if no formatter provided', () => {
        const returnValue = 'foo';
        const formatter = () => returnValue;
        colDef.valueFormatter = formatter;
        const value = 'bar';

        const formattedValue = valueSvc.formatValue(column, null, value);

        expect(formattedValue).toBe(returnValue);
        expect(expressionSvc.evaluate).toHaveBeenCalledTimes(0);
    });

    it('does not use value formatter from column definition if disabled', () => {
        const formatter = (params: ValueFormatterParams) => params.value.toString();
        colDef.valueFormatter = formatter;
        const formattedValue = valueSvc.formatValue(column, null, 'bar', undefined, false);

        expect(formattedValue).toBeNull();
        expect(expressionSvc.evaluate).toHaveBeenCalledTimes(0);
    });

    it('uses pinned value formatter from column definition if row is pinned', () => {
        const returnValue = 'foo';
        const formatter = (params: ValueFormatterParams) => (params.node?.isRowPinned() ? returnValue : '');
        colDef.valueFormatter = formatter;
        const value = 'bar';
        const node = new RowNode({} as any);
        node.rowPinned = 'top';
        expect(node.isRowPinned()).toBe(true);

        const formattedValue = valueSvc.formatValue(column, node, value);

        expect(formattedValue).toBe(returnValue);
        expect(expressionSvc.evaluate).toHaveBeenCalledTimes(0);
    });

    it('looks at refData if no formatter found', () => {
        const value = 'foo';
        const refDataValue = 'bar';
        colDef.refData = { [value]: refDataValue };
        const formattedValue = valueSvc.formatValue(column, null, value);

        expect(formattedValue).toBe(refDataValue);
    });

    it('returns empty string if refData exists but key cannot be found', () => {
        colDef.refData = {};
        const formattedValue = valueSvc.formatValue(column, null, 'foo');

        expect(formattedValue).toBe('');
    });

    it('does not use refData if formatter is found', () => {
        const value = 'foo';
        const returnValue = 'foo';
        const formatter = (params: ValueFormatterParams) => params.value.toString();
        colDef.refData = { [value]: 'bob' };

        const formattedValue = valueSvc.formatValue(column, null, value, formatter);

        expect(formattedValue).toBe(returnValue);
    });

    it('formats array values with spaces by default if not otherwise formatted', () => {
        const value = [1, 2, 3];
        const formattedValue = valueSvc.formatValue(column, null, value);

        expect(formattedValue).toBe('1, 2, 3');
    });
});

describe('resolveSsrmGroupValue', () => {
    const makeColumn = (colId: string, colDef: ColDef) => {
        const col = mock<AgColumn>('getColDef');
        (col as any).colId = colId;
        (col as any).colDef = colDef;
        (col as any).fieldContainsDots = false;
        col.getColDef.mockReturnValue(colDef);
        return col;
    };

    const makeSsrmSvc = (getColumnIndex: (key: string) => number | null = () => null) => {
        const svc = new ValueService();
        (svc as any).isSsrm = true;
        (svc as any).beans = {};
        (svc as any).rowGroupColsSvc = { getColumnIndex };
        return svc;
    };

    type Case = {
        name: string;
        colDef: ColDef;
        colId: string;
        node: any;
        ignoreAggData: boolean;
        expected: unknown;
        getColumnIndex?: (key: string) => number | null;
    };

    // Default-shape footer/group node; individual cases override fields.
    const node = (overrides: any) => ({
        footer: false,
        field: 'country',
        level: 0,
        data: { country: 'Ireland' },
        groupData: null,
        aggData: null,
        ...overrides,
    });

    const cases: Case[] = [
        {
            name: 'extracts footer value from data when showRowGroup matches rowNode.field (multi-auto-col)',
            colDef: { showRowGroup: 'country' },
            colId: 'ag-Grid-AutoColumn-country',
            node: node({ footer: true }),
            ignoreAggData: false,
            expected: 'Ireland',
        },
        {
            // Non-footer rows retain the retro-compat behaviour: deeper columns are null at
            // shallower group levels to keep cells blank.
            name: 'returns null for shallower multi-auto-col when not a footer',
            colDef: { showRowGroup: 'year' },
            colId: 'ag-Grid-AutoColumn-year',
            node: node({}),
            ignoreAggData: false,
            expected: null,
            getColumnIndex: (key) => (key === 'year' ? 1 : null),
        },
        {
            name: 'extracts footer value for single-auto-col (showRowGroup === true)',
            colDef: { showRowGroup: true },
            colId: 'ag-Grid-AutoColumn',
            node: node({ footer: true }),
            ignoreAggData: false,
            expected: 'Ireland',
        },
        {
            // groupData lookup must win: the footer-field fallback only fires when groupData misses.
            name: 'prefers groupData over footer field fallback when both are present',
            colDef: { showRowGroup: 'country' },
            colId: 'ag-Grid-AutoColumn-country',
            node: node({ footer: true, groupData: { 'ag-Grid-AutoColumn-country': 'FromGroupData' } }),
            ignoreAggData: false,
            expected: 'FromGroupData',
        },
        {
            // Regression guard: ignoreAggData + aggFunc must suppress valueGetter/field fallbacks
            // (SSRM leaks agg data via the data attribute), but the footer group-extraction path
            // must still fire — footer rows legitimately read the group key from data[field].
            name: 'still extracts footer group value for single-auto-col when ignoreAggData + aggFunc',
            colDef: { showRowGroup: true, aggFunc: 'sum' },
            colId: 'ag-Grid-AutoColumn',
            node: node({ footer: true, data: { country: 'Ireland', total: 100 } }),
            ignoreAggData: true,
            expected: 'Ireland',
        },
        {
            // Complement: non-footer path must still return undefined under ignoreSsrmAggData to
            // avoid leaking raw data into aggregated cells.
            name: 'suppresses valueGetter/field when ignoreAggData + aggFunc on non-footer group rows',
            colDef: { field: 'total', aggFunc: 'sum' },
            colId: 'total',
            node: node({ data: { country: 'Ireland', total: 100 } }),
            ignoreAggData: true,
            expected: undefined,
        },
    ];

    it.each(cases)('$name', ({ colDef, colId, node, ignoreAggData, expected, getColumnIndex }) => {
        const column = makeColumn(colId, colDef);
        const svc = makeSsrmSvc(getColumnIndex);
        const value = (svc as any).resolveSsrmGroupValue(column, colDef, node, ignoreAggData);
        expect(value).toEqual(expected);
    });
});
