var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
import { Constants, } from '@ag-grid-community/core';
import { mock } from '../test-utils/mock';
import { SetFilter } from './setFilter';
function createSetFilter(setValueModel, filterParams) {
    var colDef = {};
    var rowModel = {
        getType: function () { return Constants.ROW_MODEL_TYPE_CLIENT_SIDE; },
        forEachLeafNode: function (callback) { }
    };
    var params = __assign({ api: null, colDef: colDef,
        rowModel: rowModel, column: null, context: null, doesRowPassOtherFilter: function () { return true; }, filterChangedCallback: function () { }, filterModifiedCallback: function () { }, valueGetter: function (node) { return node.data.value; } }, filterParams);
    colDef.filterParams = params;
    var eventService = mock('addEventListener');
    var valueFormatterService = mock('formatValue');
    valueFormatterService.formatValue.mockImplementation(function (_1, _2, _3, value) { return value; });
    var gridOptionsWrapper = mock('getLocaleTextFunc', 'isEnableOldSetFilterModel');
    gridOptionsWrapper.getLocaleTextFunc.mockImplementation(function () { return (function (_, defaultValue) { return defaultValue; }); });
    var context = mock('createBean');
    context.createBean.mockImplementation(function (bean) { return bean; });
    var eMiniFilter = mock('getGui', 'setValue', 'onValueChange', 'getInputElement');
    eMiniFilter.getGui.mockImplementation(function () { return mock(); });
    eMiniFilter.getInputElement.mockImplementation(function () { return mock('addEventListener'); });
    var eGui = mock('querySelector', 'appendChild');
    eGui.querySelector.mockImplementation(function () { return mock('appendChild', 'addEventListener'); });
    var eSelectAll = mock('setValue', 'getInputElement', 'onValueChange');
    eSelectAll.getInputElement.mockImplementation(function () { return mock('addEventListener'); });
    var eSelectAllLabel = mock();
    var setFilter = new SetFilter();
    setFilter['eventService'] = eventService;
    setFilter['gridOptionsWrapper'] = gridOptionsWrapper;
    setFilter['valueFormatterService'] = valueFormatterService;
    setFilter['rowModel'] = rowModel;
    setFilter['context'] = context;
    setFilter['eGui'] = eGui;
    setFilter['eMiniFilter'] = eMiniFilter;
    setFilter['eSelectAll'] = eSelectAll;
    setFilter['eSelectAllLabel'] = eSelectAllLabel;
    setFilter.setParams(params);
    var virtualList = mock('refresh');
    setFilter['virtualList'] = virtualList;
    if (setValueModel) {
        setFilter['valueModel'] = setValueModel;
    }
    return setFilter;
}
describe('applyModel', function () {
    it('returns false if nothing has changed', function () {
        var setValueModel = mock('getModel', 'isEverythingVisibleSelected');
        var setFilter = createSetFilter(setValueModel);
        expect(setFilter.applyModel()).toBe(false);
    });
    it('returns true if something has changed', function () {
        var setValueModel = mock('getModel', 'isEverythingVisibleSelected');
        var setFilter = createSetFilter(setValueModel);
        setValueModel.getModel.mockReturnValue(['A']);
        expect(setFilter.applyModel()).toBe(true);
    });
    it('can apply empty model', function () {
        var setValueModel = mock('getModel', 'isEverythingVisibleSelected');
        var setFilter = createSetFilter(setValueModel);
        setValueModel.getModel.mockReturnValue([]);
        setFilter.applyModel();
        expect(setFilter.getModel().values).toStrictEqual([]);
    });
    it.each(['windows', 'mac'])('will not apply model with zero values in %s Excel Mode', function (excelMode) {
        var setValueModel = mock('getModel', 'isEverythingVisibleSelected');
        var setFilter = createSetFilter(setValueModel, { excelMode: excelMode });
        setValueModel.getModel.mockReturnValue([]);
        setFilter.applyModel();
        expect(setFilter.getModel()).toBeNull();
    });
    it.each(['windows', 'mac'])('preserves existing model if new model with zero values applied in %s Excel Mode', function (excelMode) {
        var setValueModel = mock('getModel', 'isEverythingVisibleSelected');
        var setFilter = createSetFilter(setValueModel, { excelMode: excelMode });
        var model = ['A', 'B'];
        setValueModel.getModel.mockReturnValue(model);
        setFilter.applyModel();
        expect(setFilter.getModel().values).toStrictEqual(model);
        setValueModel.getModel.mockReturnValue(model);
        setFilter.applyModel();
        expect(setFilter.getModel().values).toStrictEqual(model);
    });
    it.each(['windows', 'mac'])('can reset model in %s Excel Mode', function (excelMode) {
        var setValueModel = mock('getModel', 'isEverythingVisibleSelected');
        var setFilter = createSetFilter(setValueModel, { excelMode: excelMode });
        var model = ['A', 'B'];
        setValueModel.getModel.mockReturnValue(model);
        setFilter.applyModel();
        expect(setFilter.getModel().values).toStrictEqual(model);
        setValueModel.getModel.mockReturnValue(null);
        setFilter.applyModel();
        expect(setFilter.getModel()).toBeNull();
    });
    it.each(['windows', 'mac'])('ensures any active filter is removed by selecting all values if all visible values are selected', function (excelMode) {
        var setValueModel = mock('getModel', 'isEverythingVisibleSelected', 'selectAllMatchingMiniFilter');
        var setFilter = createSetFilter(setValueModel, { excelMode: excelMode });
        setValueModel.isEverythingVisibleSelected.mockReturnValue(true);
        setValueModel.getModel.mockReturnValue(null);
        setFilter.applyModel();
        expect(setValueModel.selectAllMatchingMiniFilter).toBeCalledTimes(1);
    });
});
