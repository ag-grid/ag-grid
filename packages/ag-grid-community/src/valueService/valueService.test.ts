import type { Mocked } from 'vitest';

import type { EditService } from '../edit/editService';
import type { AgColumn } from '../entities/agColumn';
import type { ColDef, ValueFormatterParams } from '../entities/colDef';
import { RowNode } from '../entities/rowNode';
import type { GridOptionsService } from '../gridOptionsService';
import { mock } from '../test-utils/mock';
import type { ExpressionService } from './expressionService';
import { ValueService } from './valueService';

let colDef: ColDef;
let column: Mocked<AgColumn>;
let gos: Mocked<GridOptionsService>;
let expressionSvc: Mocked<ExpressionService>;
let valueSvc: ValueService;

describe('formatValue', () => {
    beforeEach(() => {
        colDef = {};
        column = mock<AgColumn>();
        column.colDef = colDef;
        // The value service reads these off the column (mirrored from colDef by initColDefHotFields),
        // so mirror them here for the mock to behave like a real column.
        Object.defineProperty(column, 'valueFormatter', { get: () => colDef.valueFormatter, configurable: true });
        Object.defineProperty(column, 'refData', { get: () => colDef.refData, configurable: true });

        gos = mock<GridOptionsService>('get', 'addCommon');
        gos.addCommon.mockImplementation((params) => params as any);
        expressionSvc = mock<ExpressionService>('evaluate');
        valueSvc = new ValueService();
        (valueSvc as any).gos = gos;
        (valueSvc as any).expressionSvc = expressionSvc;
        // ValueService builds params from these cached refs (set in wireBeans on a real grid).
        (valueSvc as any).gridApi = {};
        (valueSvc as any).gridOptions = {};
        (valueSvc as any).beans = {
            editSvc: mock<EditService>('isEditing'),
            expressionSvc,
        };
    });

    it('uses supplied formatter if provided', () => {
        const returnValue = 'foo';
        const formatter = () => returnValue;
        const value = 'bar';

        const formattedValue = valueSvc.formatValue(column, null, value, formatter, true);

        expect(formattedValue).toBe(returnValue);
        expect(expressionSvc.evaluate).toHaveBeenCalledTimes(0);
    });

    it('uses value formatter from column definition if no formatter provided', () => {
        const returnValue = 'foo';
        const formatter = () => returnValue;
        colDef.valueFormatter = formatter;
        const value = 'bar';

        const formattedValue = valueSvc.formatValue(column, null, value, undefined, true);

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

        const formattedValue = valueSvc.formatValue(column, node, value, undefined, true);

        expect(formattedValue).toBe(returnValue);
        expect(expressionSvc.evaluate).toHaveBeenCalledTimes(0);
    });

    it('looks at refData if no formatter found', () => {
        const value = 'foo';
        const refDataValue = 'bar';
        colDef.refData = { [value]: refDataValue };
        const formattedValue = valueSvc.formatValue(column, null, value, undefined, true);

        expect(formattedValue).toBe(refDataValue);
    });

    it('returns empty string if refData exists but key cannot be found', () => {
        colDef.refData = {};
        const formattedValue = valueSvc.formatValue(column, null, 'foo', undefined, true);

        expect(formattedValue).toBe('');
    });

    it('does not use refData if formatter is found', () => {
        const value = 'foo';
        const returnValue = 'foo';
        const formatter = (params: ValueFormatterParams) => params.value.toString();
        colDef.refData = { [value]: 'bob' };

        const formattedValue = valueSvc.formatValue(column, null, value, formatter, true);

        expect(formattedValue).toBe(returnValue);
    });

    it('formats array values with spaces by default if not otherwise formatted', () => {
        const value = [1, 2, 3];
        const formattedValue = valueSvc.formatValue(column, null, value, undefined, true);

        expect(formattedValue).toBe('1, 2, 3');
    });
});
