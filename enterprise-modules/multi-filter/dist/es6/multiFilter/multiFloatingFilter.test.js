import { Promise, } from '@ag-grid-community/core';
import { MultiFloatingFilterComp } from './multiFloatingFilter';
import { mock } from '../test-utils/mock';
var userComponentFactory;
var parentFilter;
var floatingFilter1;
var floatingFilter2;
function createFloatingFilter(filterParams) {
    if (filterParams === void 0) { filterParams = {}; }
    userComponentFactory.newFloatingFilterComponent
        .mockReturnValueOnce(Promise.resolve(floatingFilter1))
        .mockReturnValueOnce(Promise.resolve(floatingFilter2));
    var params = {
        column: null,
        api: null,
        currentParentModel: null,
        parentFilterInstance: function (callback) { return callback(parentFilter); },
        showParentFilter: function () { },
        suppressFilterButton: false,
        onFloatingFilterChanged: function () { return true; },
        filterParams: filterParams,
    };
    var multiFloatingFilter = new MultiFloatingFilterComp();
    multiFloatingFilter.userComponentFactory = userComponentFactory;
    multiFloatingFilter.init(params);
    return multiFloatingFilter;
}
beforeEach(function () {
    userComponentFactory = mock('newFloatingFilterComponent', 'createUserComponentFromConcreteClass');
    parentFilter = mock('getLastActiveFilterIndex');
});
describe('init', function () {
    beforeEach(function () {
        floatingFilter1 = mock('getGui');
        floatingFilter2 = mock('getGui');
    });
    it('creates floating filters for both filters with second floating filter hidden', function () {
        var wrappedFloatingFilterElement = document.createElement('div');
        wrappedFloatingFilterElement.id = 'filter-1';
        floatingFilter1 = mock('getGui');
        floatingFilter1.getGui.mockReturnValue(wrappedFloatingFilterElement);
        var setFloatingFilterElement = document.createElement('div');
        setFloatingFilterElement.id = 'filter-2';
        floatingFilter2 = mock('getGui');
        floatingFilter2.getGui.mockReturnValue(setFloatingFilterElement);
        var multiFloatingFilter = createFloatingFilter();
        expect(multiFloatingFilter.getGui().outerHTML).toBe('<div class="ag-multi-floating-filter ag-floating-filter-input"><div id="filter-1"></div><div id="filter-2" class="ag-hidden"></div></div>');
    });
});
describe('onParentModelChanged', function () {
    beforeEach(function () {
        floatingFilter1 = mock('getGui', 'onParentModelChanged');
        floatingFilter1.getGui.mockReturnValue(document.createElement('div'));
        floatingFilter2 = mock('getGui', 'onParentModelChanged');
        floatingFilter2.getGui.mockReturnValue(document.createElement('div'));
    });
    it('passes through onParentModelChanged call when model is null', function () {
        var multiFloatingFilter = createFloatingFilter();
        var event = mock();
        multiFloatingFilter.onParentModelChanged(null, event);
        expect(floatingFilter1.onParentModelChanged).toHaveBeenCalledTimes(1);
        expect(floatingFilter1.onParentModelChanged).toHaveBeenCalledWith(null, event);
        expect(floatingFilter2.onParentModelChanged).toHaveBeenCalledTimes(1);
        expect(floatingFilter2.onParentModelChanged).toHaveBeenCalledWith(null, event);
    });
    it('passes through onParentModelChanged call when model is present', function () {
        var multiFloatingFilter = createFloatingFilter();
        var event = mock();
        var filterModel1 = { filterType: 'text' };
        var filterModel2 = { filterType: 'set', values: ['A', 'B', 'C'] };
        var model = {
            filterType: 'multi',
            filterModels: [filterModel1, filterModel2]
        };
        multiFloatingFilter.onParentModelChanged(model, event);
        expect(floatingFilter1.onParentModelChanged).toHaveBeenCalledTimes(1);
        expect(floatingFilter1.onParentModelChanged).toHaveBeenCalledWith(filterModel1, event);
        expect(floatingFilter2.onParentModelChanged).toHaveBeenCalledTimes(1);
        expect(floatingFilter2.onParentModelChanged).toHaveBeenCalledWith(filterModel2, event);
    });
    it('does nothing if afterFloatingFilter is true', function () {
        var multiFloatingFilter = createFloatingFilter();
        var event = mock();
        event.afterFloatingFilter = true;
        var model = {
            filterType: 'multi',
            filterModels: [{ filterType: 'text' }, { filterType: 'set', values: [] }]
        };
        multiFloatingFilter.onParentModelChanged(model, event);
        expect(floatingFilter1.onParentModelChanged).toHaveBeenCalledTimes(0);
        expect(floatingFilter2.onParentModelChanged).toHaveBeenCalledTimes(0);
    });
    it('shows first floating filter if no first filter is active', function () {
        var multiFloatingFilter = createFloatingFilter();
        var event = mock();
        multiFloatingFilter.onParentModelChanged(null, event);
        expect(floatingFilter1.getGui().className).toBe('');
        expect(floatingFilter2.getGui().className).toBe('ag-hidden');
    });
    it('shows floating filter for last active filter if any filter is active', function () {
        var multiFloatingFilter = createFloatingFilter();
        var event = mock();
        var model = {
            filterType: 'multi',
            filterModels: [null, { filterType: 'set', values: [] }]
        };
        parentFilter.getLastActiveFilterIndex.mockReturnValue(1);
        multiFloatingFilter.onParentModelChanged(model, event);
        expect(floatingFilter1.getGui().className).toBe('ag-hidden');
        expect(floatingFilter2.getGui().className).toBe('');
    });
});
