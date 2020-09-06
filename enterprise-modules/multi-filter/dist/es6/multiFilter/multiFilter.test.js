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
import { MultiFilter } from './multiFilter';
import { Promise, } from '@ag-grid-community/core';
import { mock } from '../test-utils/mock';
var eGui;
var filterManager;
var userComponentFactory;
var focusController;
var colDef;
var column;
var rowModel;
var context;
var filter1;
var filter2;
function createFilter(filterParams) {
    if (filterParams === void 0) { filterParams = {}; }
    var baseFilterParams = {
        api: null,
        column: column,
        colDef: colDef,
        rowModel: rowModel,
        context: context,
        doesRowPassOtherFilter: function () { return true; },
        filterChangedCallback: function () { },
        filterModifiedCallback: function () { },
        valueGetter: function (node) { return node.data.value; },
    };
    filterManager.createFilterParams.mockImplementation(function (_1, _2, _3) { return (__assign({}, baseFilterParams)); });
    userComponentFactory.newFilterComponent
        .mockReturnValueOnce(Promise.resolve(filter1))
        .mockReturnValueOnce(Promise.resolve(filter2));
    var params = __assign(__assign({}, baseFilterParams), filterParams);
    var multiFilter = new MultiFilter();
    multiFilter.eGui = eGui;
    multiFilter.filterManager = filterManager;
    multiFilter.userComponentFactory = userComponentFactory;
    multiFilter.focusController = focusController;
    multiFilter.context = context;
    multiFilter.init(params);
    return multiFilter;
}
beforeEach(function () {
    eGui = mock('appendChild', 'insertAdjacentElement');
    filterManager = mock('createFilterParams');
    userComponentFactory = mock('newFilterComponent');
    focusController = mock('findFocusableElements');
    context = mock('createBean', 'destroyBean');
    colDef = mock();
    column = mock('getColDef');
    column.getColDef.mockReturnValue(colDef);
    rowModel = mock('getType');
});
describe('init', function () {
    beforeEach(function () {
        filter1 = mock('getGui');
        filter2 = mock('getGui');
        filter1.getGui.mockReturnValue(document.createElement('div'));
        filter2.getGui.mockReturnValue(document.createElement('div'));
    });
    it('will default to text filter and set filter', function () {
        createFilter();
        expect(userComponentFactory.newFilterComponent).toHaveBeenCalledTimes(2);
        var calls = userComponentFactory.newFilterComponent.mock.calls;
        expect(calls[0][0]).toMatchObject({ filter: 'agTextColumnFilter' });
        expect(calls[1][0]).toMatchObject({ filter: 'agSetColumnFilter' });
    });
});
describe('isFilterActive', function () {
    beforeEach(function () {
        filter1 = mock('getGui', 'isFilterActive');
        filter2 = mock('getGui', 'isFilterActive');
        filter1.getGui.mockReturnValue(document.createElement('div'));
        filter2.getGui.mockReturnValue(document.createElement('div'));
    });
    it('returns false if no filters are active', function () {
        var multiFilter = createFilter();
        expect(multiFilter.isFilterActive()).toBe(false);
    });
    it.each([[true, false], [false, true], [true, true]])('returns true if any filters are active', function (filter1active, filter2active) {
        var multiFilter = createFilter();
        filter1.isFilterActive.mockReturnValue(filter1active);
        filter2.isFilterActive.mockReturnValue(filter2active);
        expect(multiFilter.isFilterActive()).toBe(true);
    });
});
describe('doesFilterPass', function () {
    beforeEach(function () {
        filter1 = mock('getGui', 'isFilterActive', 'doesFilterPass');
        filter2 = mock('getGui', 'isFilterActive', 'doesFilterPass');
        filter1.getGui.mockReturnValue(document.createElement('div'));
        filter2.getGui.mockReturnValue(document.createElement('div'));
    });
    it('returns true if no filters are active', function () {
        var multiFilter = createFilter();
        var params = { node: null, data: null };
        expect(multiFilter.doesFilterPass(params)).toBe(true);
    });
    it('returns true if all active filters pass', function () {
        var multiFilter = createFilter();
        var params = { node: null, data: null };
        filter1.isFilterActive.mockReturnValue(true);
        filter1.doesFilterPass.mockReturnValue(true);
        filter2.isFilterActive.mockReturnValue(true);
        filter2.doesFilterPass.mockReturnValue(true);
        expect(multiFilter.doesFilterPass(params)).toBe(true);
    });
    it.each([[false, false], [true, false], [false, true]])('returns false if any active filters do not pass', function (filter1passes, filter2passes) {
        var multiFilter = createFilter();
        var params = { node: null, data: null };
        filter1.isFilterActive.mockReturnValue(true);
        filter1.doesFilterPass.mockReturnValue(filter1passes);
        filter2.isFilterActive.mockReturnValue(true);
        filter2.doesFilterPass.mockReturnValue(filter2passes);
        expect(multiFilter.doesFilterPass(params)).toBe(false);
    });
});
describe('getModelFromUi', function () {
    beforeEach(function () {
        filter1 = mock('getGui', 'isFilterActive');
        filter2 = mock('getGui', 'isFilterActive');
        filter1.getGui.mockReturnValue(document.createElement('div'));
        filter2.getGui.mockReturnValue(document.createElement('div'));
    });
    it('returns null if neither filter is active', function () {
        var multiFilter = createFilter();
        expect(multiFilter.getModelFromUi()).toBeNull();
    });
    it('includes model from first filter', function () {
        var providedFilter = mock('getGui', 'isFilterActive', 'getModelFromUi');
        providedFilter.getGui.mockReturnValue(document.createElement('div'));
        filter1 = providedFilter;
        var multiFilter = createFilter();
        var filterModel = { filterType: 'text' };
        providedFilter.getModelFromUi.mockReturnValue(filterModel);
        filter1.isFilterActive.mockReturnValue(true);
        expect(multiFilter.getModelFromUi()).toStrictEqual({
            filterType: 'multi',
            filterModels: [filterModel, null],
        });
    });
    it('does not include model from first filter if does not implement getModelFromUi', function () {
        var multiFilter = createFilter();
        filter1.isFilterActive.mockReturnValue(true);
        expect(multiFilter.getModelFromUi()).toStrictEqual({
            filterType: 'multi',
            filterModels: [null, null],
        });
    });
    it('includes model from second filter', function () {
        var providedFilter = mock('getGui', 'isFilterActive', 'getModelFromUi');
        providedFilter.getGui.mockReturnValue(document.createElement('div'));
        filter2 = providedFilter;
        var multiFilter = createFilter();
        var filterModel = { filterType: 'text' };
        providedFilter.getModelFromUi.mockReturnValue(filterModel);
        filter2.isFilterActive.mockReturnValue(true);
        expect(multiFilter.getModelFromUi()).toStrictEqual({
            filterType: 'multi',
            filterModels: [null, filterModel],
        });
    });
    it('does not include model from second filter if does not implement getModelFromUi', function () {
        var multiFilter = createFilter();
        filter2.isFilterActive.mockReturnValue(true);
        expect(multiFilter.getModelFromUi()).toStrictEqual({
            filterType: 'multi',
            filterModels: [null, null],
        });
    });
});
describe('getModel', function () {
    beforeEach(function () {
        filter1 = mock('getGui', 'isFilterActive', 'getModel');
        filter2 = mock('getGui', 'isFilterActive', 'getModel');
        filter1.getGui.mockReturnValue(document.createElement('div'));
        filter2.getGui.mockReturnValue(document.createElement('div'));
    });
    it('returns null if neither filter is active', function () {
        var multiFilter = createFilter();
        expect(multiFilter.getModelFromUi()).toBeNull();
    });
    it('includes model from first filter', function () {
        var multiFilter = createFilter();
        var filterModel = { filterType: 'text' };
        filter1.getModel.mockReturnValue(filterModel);
        filter1.isFilterActive.mockReturnValue(true);
        expect(multiFilter.getModel()).toStrictEqual({
            filterType: 'multi',
            filterModels: [filterModel, null],
        });
    });
    it('includes model from second filter', function () {
        var multiFilter = createFilter();
        var filterModel = { filterType: 'set', values: ['A', 'B', 'C'] };
        filter2.getModel.mockReturnValue(filterModel);
        filter2.isFilterActive.mockReturnValue(true);
        expect(multiFilter.getModel()).toStrictEqual({
            filterType: 'multi',
            filterModels: [null, filterModel],
        });
    });
    it('includes model from both filters', function () {
        var multiFilter = createFilter();
        var filterModel1 = { filterType: 'text' };
        filter1.getModel.mockReturnValue(filterModel1);
        filter1.isFilterActive.mockReturnValue(true);
        var filterModel2 = { filterType: 'set', values: ['A', 'B', 'C'] };
        filter2.getModel.mockReturnValue(filterModel2);
        filter2.isFilterActive.mockReturnValue(true);
        expect(multiFilter.getModel()).toStrictEqual({
            filterType: 'multi',
            filterModels: [filterModel1, filterModel2],
        });
    });
});
describe('setModel', function () {
    beforeEach(function () {
        filter1 = mock('getGui', 'isFilterActive', 'setModel');
        filter2 = mock('getGui', 'isFilterActive', 'setModel');
        filter1.getGui.mockReturnValue(document.createElement('div'));
        filter2.getGui.mockReturnValue(document.createElement('div'));
    });
    it('sets null on both filters if provided model is null', function (done) {
        var multiFilter = createFilter();
        multiFilter.setModel(null).then(function () {
            expect(filter1.setModel).toHaveBeenCalledTimes(1);
            expect(filter1.setModel).toHaveBeenCalledWith(null);
            expect(filter2.setModel).toHaveBeenCalledTimes(1);
            expect(filter2.setModel).toHaveBeenCalledWith(null);
            done();
        });
    });
    it('sets model on all filters if provided model is present', function (done) {
        var multiFilter = createFilter();
        var filterModel1 = { filterType: 'text' };
        var filterModel2 = { filterType: 'set', values: ['A', 'B', 'C'] };
        var model = {
            filterType: 'multi',
            filterModels: [filterModel1, filterModel2]
        };
        multiFilter.setModel(model).then(function () {
            expect(filter1.setModel).toHaveBeenCalledTimes(1);
            expect(filter1.setModel).toHaveBeenCalledWith(filterModel1);
            expect(filter2.setModel).toHaveBeenCalledTimes(1);
            expect(filter2.setModel).toHaveBeenCalledWith(filterModel2);
            done();
        });
    });
});
describe('getChildFilterInstance', function () {
    it('returns first filter', function () {
        var multiFilter = createFilter();
        expect(multiFilter.getChildFilterInstance(0)).toBe(filter1);
    });
    it('returns second filter', function () {
        var multiFilter = createFilter();
        expect(multiFilter.getChildFilterInstance(1)).toBe(filter2);
    });
});
describe('afterGuiAttached', function () {
    var filter1Gui;
    var filter2Gui;
    beforeEach(function () {
        filter1Gui = document.createElement('div');
        filter1Gui.id = 'filter-1';
        filter1 = mock('getGui');
        filter1.getGui.mockReturnValue(filter1Gui);
        filter2Gui = document.createElement('div');
        filter2Gui.id = 'filter-2';
        filter2 = mock('getGui');
        filter2.getGui.mockReturnValue(filter2Gui);
        context.createBean.mockImplementation(function (bean) { return bean; });
        focusController.findFocusableElements.mockReturnValue([]);
    });
    it('passes through to filter if it has afterGuiAttached function', function () {
        filter1 = mock('getGui', 'afterGuiAttached');
        filter1.getGui.mockReturnValue(filter1Gui);
        filter2 = mock('getGui', 'afterGuiAttached');
        filter2.getGui.mockReturnValue(filter2Gui);
        var multiFilter = createFilter();
        var params = { container: 'columnMenu' };
        multiFilter.afterGuiAttached(params);
        expect(filter1.afterGuiAttached).toHaveBeenCalledTimes(1);
        expect(filter1.afterGuiAttached).toHaveBeenCalledWith(params);
        expect(filter2.afterGuiAttached).toHaveBeenCalledTimes(1);
        expect(filter2.afterGuiAttached).toHaveBeenCalledWith(params);
    });
    it('allows focussing if all filters are inline', function () {
        filter1 = mock('getGui', 'afterGuiAttached');
        filter1.getGui.mockReturnValue(filter1Gui);
        filter2 = mock('getGui', 'afterGuiAttached');
        filter2.getGui.mockReturnValue(filter2Gui);
        var multiFilter = createFilter({
            filters: [
                {
                    filter: 'agTextColumnFilter',
                    display: 'inline',
                },
                {
                    filter: 'agSetColumnFilter',
                }
            ]
        });
        var params = { container: 'columnMenu' };
        multiFilter.afterGuiAttached(params);
        var expectedParams = __assign(__assign({}, params), { suppressFocus: false });
        expect(filter1.afterGuiAttached).toHaveBeenCalledTimes(1);
        expect(filter1.afterGuiAttached).toHaveBeenCalledWith(expectedParams);
        expect(filter2.afterGuiAttached).toHaveBeenCalledTimes(1);
        expect(filter2.afterGuiAttached).toHaveBeenCalledWith(expectedParams);
    });
    it.each(['subMenu', 'accordion'])('suppresses focussing if any filter is not inline', function (display) {
        filter1 = mock('getGui', 'afterGuiAttached');
        filter1.getGui.mockReturnValue(filter1Gui);
        filter2 = mock('getGui', 'afterGuiAttached');
        filter2.getGui.mockReturnValue(filter2Gui);
        var multiFilter = createFilter({
            filters: [
                {
                    filter: 'agTextColumnFilter',
                },
                {
                    filter: 'agSetColumnFilter',
                    display: display
                }
            ]
        });
        var params = { container: 'columnMenu' };
        multiFilter.afterGuiAttached(params);
        var expectedParams = __assign(__assign({}, params), { suppressFocus: true });
        expect(filter1.afterGuiAttached).toHaveBeenCalledTimes(1);
        expect(filter1.afterGuiAttached).toHaveBeenCalledWith(expectedParams);
        expect(filter2.afterGuiAttached).toHaveBeenCalledTimes(1);
        expect(filter2.afterGuiAttached).toHaveBeenCalledWith(expectedParams);
    });
    it('does not pass through to filter if afterGuiAttached function does not exist', function () {
        var multiFilter = createFilter();
        expect(function () { return multiFilter.afterGuiAttached({ container: 'columnMenu' }); }).not.toThrow();
    });
    it('presents the first filter then the second filter with a separator in-between', function () {
        var filter = createFilter();
        filter.afterGuiAttached({ container: 'columnMenu' });
        expect(eGui.appendChild).toHaveBeenCalledTimes(3);
        var calls = eGui.appendChild.mock.calls;
        expect(calls[0][0]).toBe(filter1Gui);
        expect(calls[1][0].outerHTML).toBe('<div class="ag-filter-separator"></div>');
        expect(calls[2][0]).toBe(filter2Gui);
    });
    it('refreshes the UI if the container changes', function () {
        var filter = createFilter();
        filter.afterGuiAttached({ container: 'columnMenu' });
        filter.afterGuiAttached({ container: 'toolPanel' });
        expect(eGui.appendChild).toHaveBeenCalledTimes(6);
    });
    it('does not refresh the UI if the container does not change', function () {
        var filter = createFilter();
        filter.afterGuiAttached({ container: 'columnMenu' });
        filter.afterGuiAttached({ container: 'columnMenu' });
        expect(eGui.appendChild).toHaveBeenCalledTimes(3);
    });
    var getMostRecentlyAppendedElement = function () {
        var calls = eGui.appendChild.mock.calls;
        return calls[calls.length - 1][0];
    };
    it('presents the filter inside a sub-menu if configured', function () {
        var filter = createFilter({
            filters: [{
                    filter: 'agTextColumnFilter',
                    display: 'subMenu',
                }]
        });
        filter.afterGuiAttached({ container: 'columnMenu' });
        expect(getMostRecentlyAppendedElement().classList).toContain('ag-compact-menu-option');
    });
    it('presents the filter inside an accordion if sub-menu is configured but filter is opened in tool panel', function () {
        var filter = createFilter({
            filters: [{
                    filter: 'agTextColumnFilter',
                    display: 'subMenu',
                }]
        });
        filter.afterGuiAttached({ container: 'toolPanel' });
        expect(getMostRecentlyAppendedElement().classList).toContain('ag-multi-filter-group');
    });
    it('presents the filter inside an accordion if configured', function () {
        var filter = createFilter({
            filters: [{
                    filter: 'agTextColumnFilter',
                    display: 'accordion',
                }]
        });
        filter.afterGuiAttached({ container: 'columnMenu' });
        expect(getMostRecentlyAppendedElement().classList).toContain('ag-multi-filter-group');
    });
    it('presents the filter inside an sub-menu with custom title if configured', function () {
        var title = 'Filter Title';
        var filter = createFilter({
            filters: [{
                    filter: 'agTextColumnFilter',
                    display: 'subMenu',
                    title: title
                }]
        });
        filter.afterGuiAttached({ container: 'columnMenu' });
        var calls = context.createBean.mock.calls;
        expect(calls[0][0].params.name).toBe(title);
    });
    it('presents the filter inside an accordion with custom title if configured', function () {
        var title = 'Filter Title';
        var filter = createFilter({
            filters: [{
                    filter: 'agTextColumnFilter',
                    display: 'accordion',
                    title: title
                }]
        });
        filter.afterGuiAttached({ container: 'columnMenu' });
        var calls = context.createBean.mock.calls;
        expect(calls[0][0].title).toBe(title);
    });
});
describe('onAnyFilterChanged', function () {
    beforeEach(function () {
        filter1 = mock('getGui');
        filter2 = mock('getGui');
        filter1.getGui.mockReturnValue(document.createElement('div'));
        filter2.getGui.mockReturnValue(document.createElement('div'));
    });
    it('passes through to filter if it has onAnyFilterChanged function', function () {
        filter1 = mock('getGui', 'onAnyFilterChanged');
        filter2 = mock('getGui', 'onAnyFilterChanged');
        filter1.getGui.mockReturnValue(document.createElement('div'));
        filter2.getGui.mockReturnValue(document.createElement('div'));
        var multiFilter = createFilter();
        multiFilter.onAnyFilterChanged();
        expect(filter1.onAnyFilterChanged).toHaveBeenCalledTimes(1);
        expect(filter2.onAnyFilterChanged).toHaveBeenCalledTimes(1);
    });
    it('does not pass through to filter if onAnyFilterChanged function does not exist', function () {
        var multiFilter = createFilter();
        expect(function () { return multiFilter.onAnyFilterChanged(); }).not.toThrow();
    });
});
describe('onNewRowsLoaded', function () {
    beforeEach(function () {
        filter1 = mock('getGui');
        filter2 = mock('getGui');
        filter1.getGui.mockReturnValue(document.createElement('div'));
        filter2.getGui.mockReturnValue(document.createElement('div'));
    });
    it('passes through to filter if it has onNewRowsLoaded function', function () {
        filter1 = mock('getGui', 'onNewRowsLoaded');
        filter2 = mock('getGui', 'onNewRowsLoaded');
        filter1.getGui.mockReturnValue(document.createElement('div'));
        filter2.getGui.mockReturnValue(document.createElement('div'));
        var multiFilter = createFilter();
        multiFilter.onNewRowsLoaded();
        expect(filter1.onNewRowsLoaded).toHaveBeenCalledTimes(1);
        expect(filter2.onNewRowsLoaded).toHaveBeenCalledTimes(1);
    });
    it('does not pass through to filter if onNewRowsLoaded function does not exist', function () {
        var multiFilter = createFilter();
        expect(function () { return multiFilter.onNewRowsLoaded(); }).not.toThrow();
    });
});
describe('onFilterChanged', function () {
    beforeEach(function () {
        filter1 = mock('getGui', 'isFilterActive', 'setModel');
        filter2 = mock('getGui', 'isFilterActive', 'setModel');
        filter1.getGui.mockReturnValue(document.createElement('div'));
        filter2.getGui.mockReturnValue(document.createElement('div'));
    });
    it.each([0, 1])('triggers filterChangedCallback from multi filter if child filter changes', function (index) {
        var multiFilterChangedCallback = jest.fn();
        createFilter({ filterChangedCallback: multiFilterChangedCallback });
        var filterChangedCallback = userComponentFactory.newFilterComponent.mock.calls[index][1].filterChangedCallback;
        filterChangedCallback();
        expect(multiFilterChangedCallback).toHaveBeenCalledTimes(1);
    });
    it('triggers onAnyFilterChanged on other filters if exists', function () {
        filter1 = mock('getGui', 'isFilterActive', 'setModel', 'onAnyFilterChanged');
        filter2 = mock('getGui', 'isFilterActive', 'setModel', 'onAnyFilterChanged');
        filter1.getGui.mockReturnValue(document.createElement('div'));
        filter2.getGui.mockReturnValue(document.createElement('div'));
        createFilter();
        var params = userComponentFactory.newFilterComponent.mock.calls[0][1];
        var filterChangedCallback = params.filterChangedCallback;
        filterChangedCallback();
        expect(filter1.onAnyFilterChanged).not.toHaveBeenCalled();
        expect(filter2.onAnyFilterChanged).toHaveBeenCalledTimes(1);
    });
});
describe('getLastActiveFilterIndex', function () {
    beforeEach(function () {
        filter1 = mock('getGui', 'isFilterActive', 'setModel');
        filter2 = mock('getGui', 'isFilterActive', 'setModel');
        filter1.getGui.mockReturnValue(document.createElement('div'));
        filter2.getGui.mockReturnValue(document.createElement('div'));
    });
    it('returns null if no filter is active', function () {
        var filter = createFilter();
        expect(filter.getLastActiveFilterIndex()).toBeNull();
    });
    it('returns the index of the filter that was most recently made active', function () {
        var filter = createFilter();
        var filter1ChangedCallback = userComponentFactory.newFilterComponent.mock.calls[0][1].filterChangedCallback;
        var filter2ChangedCallback = userComponentFactory.newFilterComponent.mock.calls[1][1].filterChangedCallback;
        filter1.isFilterActive.mockReturnValue(true);
        filter2.isFilterActive.mockReturnValue(true);
        filter1ChangedCallback();
        filter2ChangedCallback();
        filter1ChangedCallback();
        expect(filter.getLastActiveFilterIndex()).toBe(0);
    });
    it('returns the previously active index if the most recently active filter becomes inactive', function () {
        var filter = createFilter();
        var filter1ChangedCallback = userComponentFactory.newFilterComponent.mock.calls[0][1].filterChangedCallback;
        var filter2ChangedCallback = userComponentFactory.newFilterComponent.mock.calls[1][1].filterChangedCallback;
        filter1.isFilterActive.mockReturnValue(true);
        filter2.isFilterActive.mockReturnValue(true);
        filter2ChangedCallback();
        filter1ChangedCallback();
        filter1.isFilterActive.mockReturnValue(false);
        filter1ChangedCallback();
        expect(filter.getLastActiveFilterIndex()).toBe(1);
    });
});
