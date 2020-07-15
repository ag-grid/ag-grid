import {
    UserComponentFactory,
    IFloatingFilterComp,
    IFloatingFilterParams,
    Promise,
    FilterChangedEvent,
    IFilterComp,
} from '@ag-grid-community/core';
import { MultiFloatingFilterComp } from './multiFloatingFilter';
import { IMultiFilterModel, MultiFilter } from './multiFilter';
import { mock } from '../test-utils/mock';

let userComponentFactory: jest.Mocked<UserComponentFactory>;
let parentFilter: jest.Mocked<MultiFilter>;
let floatingFilter1: jest.Mocked<IFloatingFilterComp>;
let floatingFilter2: jest.Mocked<IFloatingFilterComp>;

function createFloatingFilter(filterParams: any = {}): MultiFloatingFilterComp {
    userComponentFactory.newFloatingFilterComponent
        .mockReturnValueOnce(Promise.resolve(floatingFilter1))
        .mockReturnValueOnce(Promise.resolve(floatingFilter2));

    const params: IFloatingFilterParams = {
        column: null,
        api: null,
        currentParentModel: null,
        parentFilterInstance: (callback: (filter: IFilterComp) => void) => callback(parentFilter),
        suppressFilterButton: false,
        onFloatingFilterChanged: () => true,
        filterParams,
    };

    const multiFloatingFilter = new MultiFloatingFilterComp();

    (multiFloatingFilter as any).userComponentFactory = userComponentFactory;

    multiFloatingFilter.init(params);

    return multiFloatingFilter;
}

beforeEach(() => {
    userComponentFactory = mock<UserComponentFactory>('newFloatingFilterComponent', 'createUserComponentFromConcreteClass');
    parentFilter = mock<MultiFilter>('getLastActiveFilterIndex');
});

describe('init', () => {
    beforeEach(() => {
        floatingFilter1 = mock<IFloatingFilterComp>('getGui');
        floatingFilter2 = mock<IFloatingFilterComp>('getGui');
    });

    it('creates floating filters for both filters with second floating filter hidden', () => {
        const wrappedFloatingFilterElement = document.createElement('div');
        wrappedFloatingFilterElement.id = 'filter-1';
        floatingFilter1 = mock<IFloatingFilterComp>('getGui');
        floatingFilter1.getGui.mockReturnValue(wrappedFloatingFilterElement);

        const setFloatingFilterElement = document.createElement('div');
        setFloatingFilterElement.id = 'filter-2';
        floatingFilter2 = mock<IFloatingFilterComp>('getGui');
        floatingFilter2.getGui.mockReturnValue(setFloatingFilterElement);

        const multiFloatingFilter = createFloatingFilter();

        expect(multiFloatingFilter.getGui().outerHTML).toBe('<div class="ag-multi-floating-filter ag-floating-filter-input"><div id="filter-1"></div><div id="filter-2" class="ag-hidden"></div></div>');
    });
});

describe('onParentModelChanged', () => {
    beforeEach(() => {
        floatingFilter1 = mock<IFloatingFilterComp>('getGui', 'onParentModelChanged');
        floatingFilter1.getGui.mockReturnValue(document.createElement('div'));
        floatingFilter2 = mock<IFloatingFilterComp>('getGui', 'onParentModelChanged');
        floatingFilter2.getGui.mockReturnValue(document.createElement('div'));
    });

    it('passes through onParentModelChanged call when model is null', () => {
        const multiFloatingFilter = createFloatingFilter();
        const event = mock<FilterChangedEvent>();

        multiFloatingFilter.onParentModelChanged(null, event);

        expect(floatingFilter1.onParentModelChanged).toHaveBeenCalledTimes(1);
        expect(floatingFilter1.onParentModelChanged).toHaveBeenCalledWith(null, event);
        expect(floatingFilter2.onParentModelChanged).toHaveBeenCalledTimes(1);
        expect(floatingFilter2.onParentModelChanged).toHaveBeenCalledWith(null, event);
    });

    it('passes through onParentModelChanged call when model is present', () => {
        const multiFloatingFilter = createFloatingFilter();
        const event = mock<FilterChangedEvent>();
        const filterModel1 = { filterType: 'text' };
        const filterModel2 = { filterType: 'set', values: ['A', 'B', 'C'] };
        const model: IMultiFilterModel = {
            filterType: 'multi',
            filterModels: [filterModel1, filterModel2]
        };

        multiFloatingFilter.onParentModelChanged(model, event);

        expect(floatingFilter1.onParentModelChanged).toHaveBeenCalledTimes(1);
        expect(floatingFilter1.onParentModelChanged).toHaveBeenCalledWith(filterModel1, event);
        expect(floatingFilter2.onParentModelChanged).toHaveBeenCalledTimes(1);
        expect(floatingFilter2.onParentModelChanged).toHaveBeenCalledWith(filterModel2, event);
    });

    it('does nothing if afterFloatingFilter is true', () => {
        const multiFloatingFilter = createFloatingFilter();
        const event = mock<FilterChangedEvent>();
        event.afterFloatingFilter = true;

        const model: IMultiFilterModel = {
            filterType: 'multi',
            filterModels: [{ filterType: 'text' }, { filterType: 'set', values: [] }]
        };

        multiFloatingFilter.onParentModelChanged(model, event);

        expect(floatingFilter1.onParentModelChanged).toHaveBeenCalledTimes(0);
        expect(floatingFilter2.onParentModelChanged).toHaveBeenCalledTimes(0);
    });

    it('shows first floating filter if no first filter is active', () => {
        const multiFloatingFilter = createFloatingFilter();
        const event = mock<FilterChangedEvent>();
        multiFloatingFilter.onParentModelChanged(null, event);

        expect(floatingFilter1.getGui().className).toBe('');
        expect(floatingFilter2.getGui().className).toBe('ag-hidden');
    });

    it('shows floating filter for last active filter if any filter is active', () => {
        const multiFloatingFilter = createFloatingFilter();
        const event = mock<FilterChangedEvent>();
        const model: IMultiFilterModel = {
            filterType: 'multi',
            filterModels: [null, { filterType: 'set', values: [] }]
        };

        parentFilter.getLastActiveFilterIndex.mockReturnValue(1);

        multiFloatingFilter.onParentModelChanged(model, event);

        expect(floatingFilter1.getGui().className).toBe('ag-hidden');
        expect(floatingFilter2.getGui().className).toBe('');
    });
});