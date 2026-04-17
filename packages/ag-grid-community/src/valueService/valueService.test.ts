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

describe('resolveSsrmGroupValue — footer field fallback', () => {
    // Helpers used by multi-auto-col SSRM footer scenarios.
    const makeColumn = (colId: string, colDef: ColDef) => {
        const col = mock<AgColumn>('getColDef');
        (col as any).colId = colId;
        (col as any).colDef = colDef;
        (col as any).fieldContainsDots = false;
        col.getColDef.mockReturnValue(colDef);
        return col;
    };

    const makeSsrmSvc = () => {
        const svc = new ValueService();
        (svc as any).isSsrm = true;
        (svc as any).beans = {};
        (svc as any).rowGroupColsSvc = { getColumnIndex: () => null };
        return svc;
    };

    it('extracts footer value from data when showRowGroup matches rowNode.field (multi-auto-col)', () => {
        const autoColDef: ColDef = { showRowGroup: 'country' };
        const column = makeColumn('ag-Grid-AutoColumn-country', autoColDef);
        const svc = makeSsrmSvc();

        const footerNode: any = {
            footer: true,
            field: 'country',
            level: 0,
            data: { country: 'Ireland' },
            groupData: null,
            aggData: null,
        };

        const value = (svc as any).resolveSsrmGroupValue(column, autoColDef, footerNode, false);
        expect(value).toBe('Ireland');
    });

    it('still returns null for shallower multi-auto-col when not a footer', () => {
        // Non-footer rows retain the retro-compat behaviour: deeper columns are null at
        // shallower group levels to keep cells blank.
        const autoColDef: ColDef = { showRowGroup: 'year' };
        const column = makeColumn('ag-Grid-AutoColumn-year', autoColDef);
        const svc = makeSsrmSvc();
        (svc as any).rowGroupColsSvc = {
            // 'year' is at index 1, row is at level 0 → null
            getColumnIndex: (key: string) => (key === 'year' ? 1 : null),
        };

        const groupNode: any = {
            footer: false,
            field: 'country',
            level: 0,
            data: { country: 'Ireland' },
            groupData: null,
            aggData: null,
        };

        const value = (svc as any).resolveSsrmGroupValue(column, autoColDef, groupNode, false);
        expect(value).toBeNull();
    });

    it('extracts footer value for single-auto-col (showRowGroup === true)', () => {
        // Single-auto-col path: unchanged behaviour preserved by the refactor.
        const autoColDef: ColDef = { showRowGroup: true };
        const column = makeColumn('ag-Grid-AutoColumn', autoColDef);
        const svc = makeSsrmSvc();

        const footerNode: any = {
            footer: true,
            field: 'country',
            level: 0,
            data: { country: 'Ireland' },
            groupData: null,
            aggData: null,
        };

        const value = (svc as any).resolveSsrmGroupValue(column, autoColDef, footerNode, false);
        expect(value).toBe('Ireland');
    });

    it('prefers groupData over footer field fallback when both are present', () => {
        // groupData lookup must win: the footer-field fallback only fires when groupData misses.
        const autoColDef: ColDef = { showRowGroup: 'country' };
        const column = makeColumn('ag-Grid-AutoColumn-country', autoColDef);
        const svc = makeSsrmSvc();

        const footerNode: any = {
            footer: true,
            field: 'country',
            level: 0,
            data: { country: 'Ireland' },
            groupData: { 'ag-Grid-AutoColumn-country': 'FromGroupData' },
            aggData: null,
        };

        const value = (svc as any).resolveSsrmGroupValue(column, autoColDef, footerNode, false);
        expect(value).toBe('FromGroupData');
    });
});
