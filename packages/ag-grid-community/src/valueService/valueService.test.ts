import type { AgColumn } from '../entities/agColumn';
import type { ColDef, ValueFormatterParams } from '../entities/colDef';
import { RowNode } from '../entities/rowNode';
import type { GridOptionsService } from '../gridOptionsService';
import type { IEditService } from '../interfaces/iEditService';
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

        gos = mock<GridOptionsService>('get', 'addCommon');
        gos.addCommon.mockImplementation((params) => params as any);
        expressionSvc = mock<ExpressionService>('evaluate');
        valueSvc = new ValueService();
        (valueSvc as any).gos = gos;
        (valueSvc as any).expressionSvc = expressionSvc;
        (valueSvc as any).beans = {
            editSvc: mock<IEditService>('isEditing'),
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

describe('getValue with textContentAsValue', () => {
    let valueService: ValueService;
    let mockBeans: any;
    let mockColumn: jest.Mocked<AgColumn>;
    let mockRowNode: RowNode;
    let colDef: ColDef;

    beforeEach(() => {
        valueService = new ValueService();

        // Mock the beans collection
        mockBeans = {
            rowRenderer: {
                getRowByPosition: jest.fn(),
            },
            spannedRowRenderer: null,
        };

        // Set up the value service with mocked beans
        (valueService as any).beans = mockBeans;
        (valueService as any).initialised = true;

        colDef = {
            field: 'testField',
        };

        mockColumn = mock<AgColumn>('getColDef', 'getColId', 'isFieldContainsDots');
        mockColumn.getColDef.mockReturnValue(colDef);
        mockColumn.getColId.mockReturnValue('testColumn');
        mockColumn.isFieldContainsDots.mockReturnValue(false);

        // Mock row node
        mockRowNode = new RowNode(mockBeans as any);
        mockRowNode.rowIndex = 0;
        mockRowNode.rowPinned = null;
        mockRowNode.data = { testField: 'Original Value' };
    });

    it('should return DOM textContent when textContentAsValue is true', () => {
        colDef.textContentAsValue = true;

        // Mock the row controller and cell controller to return DOM content
        const mockCellCtrl = {
            eGui: {
                textContent: 'Test Cell Content',
            },
        };

        const mockRowCtrl = {
            getCellCtrl: jest.fn().mockReturnValue(mockCellCtrl),
        };

        mockBeans.rowRenderer.getRowByPosition.mockReturnValue(mockRowCtrl);

        const result = valueService.getValue(mockColumn, mockRowNode);
        expect(result).toBe('Test Cell Content');
    });

    it('should return normal field value when textContentAsValue is false', () => {
        colDef.textContentAsValue = false;

        const result = valueService.getValue(mockColumn, mockRowNode);
        expect(result).toBe('Original Value');
    });

    it('should return undefined textContentAsValue is true but DOM element is not available', () => {
        colDef.textContentAsValue = true;

        // Mock beans to return null for row controller
        mockBeans.rowRenderer.getRowByPosition.mockReturnValue(null);

        const result = valueService.getValue(mockColumn, mockRowNode);
        expect(result).toBe('Original Value');
    });

    it('should return undefined when textContentAsValue is true but cell controller is not available', () => {
        colDef.textContentAsValue = true;

        const mockRowCtrl = {
            getCellCtrl: jest.fn().mockReturnValue(null),
        };

        mockBeans.rowRenderer.getRowByPosition.mockReturnValue(mockRowCtrl);

        const result = valueService.getValue(mockColumn, mockRowNode);
        expect(result).toBe('Original Value');
    });

    it('should return undefined when textContentAsValue is true but eGui is not available', () => {
        colDef.textContentAsValue = true;

        const mockCellCtrl = {
            eGui: null,
        };

        const mockRowCtrl = {
            getCellCtrl: jest.fn().mockReturnValue(mockCellCtrl),
        };

        mockBeans.rowRenderer.getRowByPosition.mockReturnValue(mockRowCtrl);

        const result = valueService.getValue(mockColumn, mockRowNode);
        expect(result).toBe('Original Value');
    });
});
