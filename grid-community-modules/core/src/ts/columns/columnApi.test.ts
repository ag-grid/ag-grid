import { ColumnApi } from './columnApi';
import { GridApi } from '../gridApi';
import { describe, test, beforeAll, jest, expect } from '@jest/globals';

describe('ColumnApi calls gridApi', () => {
    let api: GridApi;
    let colApi: ColumnApi;

    beforeAll(() => {
        jest.spyOn(console, 'warn').mockImplementation(() => {});

        jest.spyOn(GridApi.prototype, 'sizeColumnsToFit');
        jest.spyOn(GridApi.prototype, 'sizeColumnsToFit').mockImplementation(() => undefined);
        jest.spyOn(GridApi.prototype, 'setColumnGroupOpened').mockImplementation(() => undefined);
        jest.spyOn(GridApi.prototype, 'getColumnGroup').mockImplementation(() => null);
        jest.spyOn(GridApi.prototype, 'getProvidedColumnGroup').mockImplementation(() => null);
        jest.spyOn(GridApi.prototype, 'getDisplayNameForColumn').mockImplementation(() => 'undefined');
        jest.spyOn(GridApi.prototype, 'getDisplayNameForColumnGroup').mockImplementation(() => 'null');
        jest.spyOn(GridApi.prototype, 'getColumn').mockImplementation(() => null);
        jest.spyOn(GridApi.prototype, 'getColumns').mockImplementation(() => null);
        jest.spyOn(GridApi.prototype, 'applyColumnState').mockImplementation(() => true);
        jest.spyOn(GridApi.prototype, 'getColumnState').mockImplementation(() => ({} as any));
        jest.spyOn(GridApi.prototype, 'resetColumnState').mockImplementation(() => null);
        jest.spyOn(GridApi.prototype, 'getColumnGroupState').mockImplementation(() => ({} as any));
        jest.spyOn(GridApi.prototype, 'setColumnGroupState').mockImplementation(() => null);
        jest.spyOn(GridApi.prototype, 'resetColumnGroupState').mockImplementation(() => null);
        jest.spyOn(GridApi.prototype, 'isPinning').mockImplementation(() => true);
        jest.spyOn(GridApi.prototype, 'isPinningLeft').mockImplementation(() => true);
        jest.spyOn(GridApi.prototype, 'isPinningRight').mockImplementation(() => true);
        jest.spyOn(GridApi.prototype, 'getDisplayedColAfter').mockImplementation(() => null);
        jest.spyOn(GridApi.prototype, 'getDisplayedColBefore').mockImplementation(() => null);
        jest.spyOn(GridApi.prototype, 'setColumnVisible').mockImplementation(() => null);
        jest.spyOn(GridApi.prototype, 'setColumnsVisible').mockImplementation(() => null);
        jest.spyOn(GridApi.prototype, 'setColumnPinned').mockImplementation(() => null);
        jest.spyOn(GridApi.prototype, 'setColumnsPinned').mockImplementation(() => null);
        jest.spyOn(GridApi.prototype, 'getAllGridColumns').mockImplementation(() => []);
        jest.spyOn(GridApi.prototype, 'getDisplayedLeftColumns').mockImplementation(() => []);
        jest.spyOn(GridApi.prototype, 'getDisplayedCenterColumns').mockImplementation(() => []);
        jest.spyOn(GridApi.prototype, 'getDisplayedRightColumns').mockImplementation(() => []);
        jest.spyOn(GridApi.prototype, 'getAllDisplayedColumns').mockImplementation(() => []);
        jest.spyOn(GridApi.prototype, 'getAllDisplayedVirtualColumns').mockImplementation(() => []);
        jest.spyOn(GridApi.prototype, 'moveColumn').mockImplementation(() => null);
        jest.spyOn(GridApi.prototype, 'moveColumnByIndex').mockImplementation(() => null);
        jest.spyOn(GridApi.prototype, 'moveColumns').mockImplementation(() => null);
        jest.spyOn(GridApi.prototype, 'moveRowGroupColumn').mockImplementation(() => null);
        jest.spyOn(GridApi.prototype, 'setColumnAggFunc').mockImplementation(() => null);
        jest.spyOn(GridApi.prototype, 'setColumnWidth').mockImplementation(() => null);
        jest.spyOn(GridApi.prototype, 'setColumnWidths').mockImplementation(() => null);
        jest.spyOn(GridApi.prototype, 'setPivotMode').mockImplementation(() => null);
        jest.spyOn(GridApi.prototype, 'isPivotMode').mockImplementation(() => true);
        jest.spyOn(GridApi.prototype, 'getPivotResultColumn').mockImplementation(() => null);
        jest.spyOn(GridApi.prototype, 'setValueColumns').mockImplementation(() => null);
        jest.spyOn(GridApi.prototype, 'getValueColumns').mockImplementation(() => []);
        jest.spyOn(GridApi.prototype, 'removeValueColumn').mockImplementation(() => null);
        jest.spyOn(GridApi.prototype, 'removeValueColumns').mockImplementation(() => null);
        jest.spyOn(GridApi.prototype, 'addValueColumn').mockImplementation(() => null);
        jest.spyOn(GridApi.prototype, 'addValueColumns').mockImplementation(() => null);
        jest.spyOn(GridApi.prototype, 'setRowGroupColumns').mockImplementation(() => null);
        jest.spyOn(GridApi.prototype, 'removeRowGroupColumn').mockImplementation(() => null);
        jest.spyOn(GridApi.prototype, 'removeRowGroupColumns').mockImplementation(() => null);
        jest.spyOn(GridApi.prototype, 'addRowGroupColumn').mockImplementation(() => null);
        jest.spyOn(GridApi.prototype, 'addRowGroupColumns').mockImplementation(() => null);
        jest.spyOn(GridApi.prototype, 'getRowGroupColumns').mockImplementation(() => []);
        jest.spyOn(GridApi.prototype, 'setPivotColumns').mockImplementation(() => null);
        jest.spyOn(GridApi.prototype, 'removePivotColumn').mockImplementation(() => null);
        jest.spyOn(GridApi.prototype, 'removePivotColumns').mockImplementation(() => null);
        jest.spyOn(GridApi.prototype, 'addPivotColumn').mockImplementation(() => null);
        jest.spyOn(GridApi.prototype, 'addPivotColumns').mockImplementation(() => null);
        jest.spyOn(GridApi.prototype, 'getPivotColumns').mockImplementation(() => []);
        jest.spyOn(GridApi.prototype, 'getLeftDisplayedColumnGroups').mockImplementation(() => []);
        jest.spyOn(GridApi.prototype, 'getCenterDisplayedColumnGroups').mockImplementation(() => []);
        jest.spyOn(GridApi.prototype, 'getRightDisplayedColumnGroups').mockImplementation(() => []);
        jest.spyOn(GridApi.prototype, 'getAllDisplayedColumnGroups').mockImplementation(() => null);
        jest.spyOn(GridApi.prototype, 'autoSizeColumn').mockImplementation(() => null);
        jest.spyOn(GridApi.prototype, 'autoSizeColumns').mockImplementation(() => null);
        jest.spyOn(GridApi.prototype, 'autoSizeAllColumns').mockImplementation(() => null);
        jest.spyOn(GridApi.prototype, 'setPivotResultColumns').mockImplementation(() => null);
        jest.spyOn(GridApi.prototype, 'getPivotResultColumns').mockImplementation(() => []);

        api = new GridApi();
        colApi = new ColumnApi(api);
    });

    test('sizeColumnsToFit', () => {
        colApi.sizeColumnsToFit(100);
        expect(api.sizeColumnsToFit).toBeCalledWith(100);
    });
    test('setColumnGroupOpened', () => {
        colApi.setColumnGroupOpened('group', true);
        expect(api.setColumnGroupOpened).toBeCalledWith('group', true);
    });
    test('getColumnGroup', () => {
        colApi.getColumnGroup('group', 2);
        expect(api.getColumnGroup).toBeCalledWith('group', 2);
    });
    test('getProvidedColumnGroup', () => {
        colApi.getProvidedColumnGroup('tes');
        expect(api.getProvidedColumnGroup).toBeCalledWith('tes');
    });
    test('getDisplayNameForColumn', () => {
        const col = {} as any;
        colApi.getDisplayNameForColumn(col, 'advancedFilter');
        expect(api.getDisplayNameForColumn).toBeCalledWith(col, 'advancedFilter');
    });
    test('getDisplayNameForColumnGroup', () => {
        const col = {} as any;

        colApi.getDisplayNameForColumnGroup(col, 'advancedFilter');
        expect(api.getDisplayNameForColumnGroup).toBeCalledWith(col, 'advancedFilter');
    });
    test('getColumn', () => {
        colApi.getColumn('s');
        expect(api.getColumn).toBeCalledWith('s');
    });
    test('getColumns', () => {
        colApi.getColumns();
        expect(api.getColumns).toBeCalledWith();
    });
    test('applyColumnState', () => {
        const state = {} as any;
        colApi.applyColumnState(state);
        expect(api.applyColumnState).toBeCalledWith(state);
    });
    test('getColumnState', () => {
        colApi.getColumnState();
        expect(api.getColumnState).toBeCalledWith();
    });
    test('resetColumnState', () => {
        colApi.resetColumnState();
        expect(api.resetColumnState).toBeCalledWith();
    });
    test('getColumnGroupState', () => {
        colApi.getColumnGroupState();
        expect(api.getColumnGroupState).toBeCalledWith();
    });
    test('setColumnGroupState', () => {
        const states = [];
        colApi.setColumnGroupState(states);
        expect(api.setColumnGroupState).toBeCalledWith(states);
    });
    test('resetColumnGroupState', () => {
        colApi.resetColumnGroupState();
        expect(api.resetColumnGroupState).toBeCalledWith();
    });
    test('isPinning', () => {
        colApi.isPinning();
        expect(api.isPinning).toBeCalledWith();
    });
    test('isPinningLeft', () => {
        colApi.isPinningLeft();
        expect(api.isPinningLeft).toBeCalledWith();
    });
    test('isPinningRight', () => {
        colApi.isPinningRight();
        expect(api.isPinningRight).toBeCalledWith();
    });
    test('getDisplayedColAfter', () => {
        const col = {} as any;
        colApi.getDisplayedColAfter(col);
        expect(api.getDisplayedColAfter).toBeCalledWith(col);
    });
    test('getDisplayedColBefore', () => {
        const col = {} as any;
        colApi.getDisplayedColBefore(col);
        expect(api.getDisplayedColBefore).toBeCalledWith(col);
    });
    test('setColumnVisible', () => {
        colApi.setColumnVisible('k', false);
        expect(api.setColumnVisible).toBeCalledWith('k', false);
    });
    test('setColumnsVisible', () => {
        colApi.setColumnsVisible(['k'], false);
        expect(api.setColumnsVisible).toBeCalledWith(['k'], false);
    });
    test('setColumnPinned', () => {
        colApi.setColumnPinned('k', 'left');
        expect(api.setColumnPinned).toBeCalledWith('k', 'left');
    });
    test('setColumnsPinned', () => {
        colApi.setColumnsPinned(['k'], 'left');
        expect(api.setColumnsPinned).toBeCalledWith(['k'], 'left');
    });
    test('getAllGridColumns', () => {
        colApi.getAllGridColumns();
        expect(api.getAllGridColumns).toBeCalledWith();
    });
    test('getDisplayedLeftColumns', () => {
        colApi.getDisplayedLeftColumns();
        expect(api.getDisplayedLeftColumns).toBeCalledWith();
    });
    test('getDisplayedCenterColumns', () => {
        colApi.getDisplayedCenterColumns();
        expect(api.getDisplayedCenterColumns).toBeCalledWith();
    });
    test('getDisplayedRightColumns', () => {
        colApi.getDisplayedRightColumns();
        expect(api.getDisplayedRightColumns).toBeCalledWith();
    });
    test('getAllDisplayedColumns', () => {
        colApi.getAllDisplayedColumns();
        expect(api.getAllDisplayedColumns).toBeCalledWith();
    });
    test('getAllDisplayedVirtualColumns', () => {
        colApi.getAllDisplayedVirtualColumns();
        expect(api.getAllDisplayedVirtualColumns).toBeCalledWith();
    });
    test('moveColumn', () => {
        colApi.moveColumn('k', 2);
        expect(api.moveColumn).toBeCalledWith('k', 2);
    });
    test('moveColumnByIndex', () => {
        colApi.moveColumnByIndex(1, 2);
        expect(api.moveColumnByIndex).toBeCalledWith(1, 2);
    });
    test('moveColumns', () => {
        const cols = ['3', '4'];
        colApi.moveColumns(cols, 4);
        expect(api.moveColumns).toBeCalledWith(cols, 4);
    });
    test('moveRowGroupColumn', () => {
        colApi.moveRowGroupColumn(2, 3);
        expect(api.moveRowGroupColumn).toBeCalledWith(2, 3);
    });
    test('setColumnAggFunc', () => {
        colApi.setColumnAggFunc('k', 'sum');
        expect(api.setColumnAggFunc).toBeCalledWith('k', 'sum');
    });
    test('setColumnWidth', () => {
        colApi.setColumnWidth('k', 2, true, 'alignedGridChanged');
        expect(api.setColumnWidth).toBeCalledWith('k', 2, true, 'alignedGridChanged');
    });
    test('setColumnWidths', () => {
        const cols = {} as any;
        colApi.setColumnWidths(cols, true, 'alignedGridChanged');
        expect(api.setColumnWidths).toBeCalledWith(cols, true, 'alignedGridChanged');
    });
    test('setPivotMode', () => {
        colApi.setPivotMode(true);
        expect(api.setPivotMode).toBeCalledWith(true);
    });
    test('isPivotMode', () => {
        colApi.isPivotMode();
        expect(api.isPivotMode).toBeCalledWith();
    });
    test('getPivotResultColumn', () => {
        const keys = ['k'];
        colApi.getPivotResultColumn(keys, 's');
        expect(api.getPivotResultColumn).toBeCalledWith(keys, 's');
    });
    test('setValueColumns', () => {
        const keys = ['k'];
        colApi.setValueColumns(keys);
        expect(api.setValueColumns).toBeCalledWith(keys);
    });
    test('getValueColumns', () => {
        colApi.getValueColumns();
        expect(api.getValueColumns).toBeCalledWith();
    });
    test('removeValueColumn', () => {
        colApi.removeValueColumn('s');
        expect(api.removeValueColumn).toBeCalledWith('s');
    });
    test('removeValueColumns', () => {
        const keys = ['k'];
        colApi.removeValueColumns(keys);
        expect(api.removeValueColumns).toBeCalledWith(keys);
    });
    test('addValueColumn', () => {
        colApi.addValueColumn('s');
        expect(api.addValueColumn).toBeCalledWith('s');
    });
    test('addValueColumns', () => {
        const keys = ['k'];
        colApi.addValueColumns(keys);
        expect(api.addValueColumns).toBeCalledWith(keys);
    });
    test('setRowGroupColumns', () => {
        const keys = ['k'];
        colApi.setRowGroupColumns(keys);
        expect(api.setRowGroupColumns).toBeCalledWith(keys);
    });
    test('removeRowGroupColumn', () => {
        colApi.removeRowGroupColumn('f');
        expect(api.removeRowGroupColumn).toBeCalledWith('f');
    });
    test('removeRowGroupColumns', () => {
        const keys = ['k'];
        colApi.removeRowGroupColumns(keys);
        expect(api.removeRowGroupColumns).toBeCalledWith(keys);
    });
    test('addRowGroupColumn', () => {
        colApi.addRowGroupColumn('f');
        expect(api.addRowGroupColumn).toBeCalledWith('f');
    });
    test('addRowGroupColumns', () => {
        const keys = ['k'];
        colApi.addRowGroupColumns(keys);
        expect(api.addRowGroupColumns).toBeCalledWith(keys);
    });
    test('getRowGroupColumns', () => {
        colApi.getRowGroupColumns();
        expect(api.getRowGroupColumns).toBeCalledWith();
    });
    test('setPivotColumns', () => {
        const keys = ['k'];
        colApi.setPivotColumns(keys);
        expect(api.setPivotColumns).toBeCalledWith(keys);
    });
    test('removePivotColumn', () => {
        colApi.removePivotColumn('f');
        expect(api.removePivotColumn).toBeCalledWith('f');
    });
    test('removePivotColumns', () => {
        const keys = ['k'];
        colApi.removePivotColumns(keys);
        expect(api.removePivotColumns).toBeCalledWith(keys);
    });
    test('addPivotColumn', () => {
        colApi.addPivotColumn('s');
        expect(api.addPivotColumn).toBeCalledWith('s');
    });
    test('addPivotColumns', () => {
        const keys = ['k'];
        colApi.addPivotColumns(keys);
        expect(api.addPivotColumns).toBeCalledWith(keys);
    });
    test('getPivotColumns', () => {
        colApi.getPivotColumns();
        expect(api.getPivotColumns).toBeCalledWith();
    });
    test('getLeftDisplayedColumnGroups', () => {
        colApi.getLeftDisplayedColumnGroups();
        expect(api.getLeftDisplayedColumnGroups).toBeCalledWith();
    });
    test('getCenterDisplayedColumnGroups', () => {
        colApi.getCenterDisplayedColumnGroups();
        expect(api.getCenterDisplayedColumnGroups).toBeCalledWith();
    });
    test('getRightDisplayedColumnGroups', () => {
        colApi.getRightDisplayedColumnGroups();
        expect(api.getRightDisplayedColumnGroups).toBeCalledWith();
    });
    test('getAllDisplayedColumnGroups', () => {
        colApi.getAllDisplayedColumnGroups();
        expect(api.getAllDisplayedColumnGroups).toBeCalledWith();
    });
    test('autoSizeColumn', () => {
        colApi.autoSizeColumn('k', true);
        expect(api.autoSizeColumn).toBeCalledWith('k', true);
    });
    test('autoSizeColumns', () => {
        const keys = ['k'];
        colApi.autoSizeColumns(keys, false);
        expect(api.autoSizeColumns).toBeCalledWith(keys, false);
    });
    test('autoSizeAllColumns', () => {
        colApi.autoSizeAllColumns(false);
        expect(api.autoSizeAllColumns).toBeCalledWith(false);
    });
    test('autoSizeAllColumns default', () => {
        colApi.autoSizeAllColumns();
        expect(api.autoSizeAllColumns).toBeCalledWith(undefined);
    });
    test('setPivotResultColumns', () => {
        const keys = [{}];
        colApi.setPivotResultColumns(keys);
        expect(api.setPivotResultColumns).toBeCalledWith(keys);
    });
    test('getPivotResultColumns', () => {
        colApi.getPivotResultColumns();
        expect(api.getPivotResultColumns).toBeCalledWith();
    });
});
