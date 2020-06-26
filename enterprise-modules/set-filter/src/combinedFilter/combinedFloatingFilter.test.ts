import {
    UserComponentFactory,
    IFloatingFilterComp,
    IFloatingFilterParams,
    Promise,
    FilterChangedEvent,
    ProvidedFilterModel
} from '@ag-grid-community/core';
import { CombinedFloatingFilterComp } from './combinedFloatingFilter';
import { mock } from '../test-utils/mock';
import { CombinedFilterModel } from './combinedFilter';
import { SetFilterModel } from '../setFilter/setFilterModel';

let userComponentFactory: jest.Mocked<UserComponentFactory>;
let floatingFilter1: jest.Mocked<IFloatingFilterComp>;
let floatingFilter2: jest.Mocked<IFloatingFilterComp>;

function createCombinedFloatingFilter(filterParams: any = {}): CombinedFloatingFilterComp {
    userComponentFactory.newFloatingFilterComponent
        .mockReturnValueOnce(Promise.resolve(floatingFilter1))
        .mockReturnValueOnce(Promise.resolve(floatingFilter2));

    const params: IFloatingFilterParams = {
        column: null,
        api: null,
        currentParentModel: null,
        parentFilterInstance: null,
        suppressFilterButton: false,
        onFloatingFilterChanged: () => true,
        filterParams,
    };

    const combinedFloatingFilter = new CombinedFloatingFilterComp();

    (combinedFloatingFilter as any).userComponentFactory = userComponentFactory;

    combinedFloatingFilter.init(params);

    return combinedFloatingFilter;
}

beforeEach(() => {
    userComponentFactory = mock<UserComponentFactory>('newFloatingFilterComponent', 'createUserComponentFromConcreteClass');
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

        const combinedFloatingFilter = createCombinedFloatingFilter();

        expect(combinedFloatingFilter.getGui().outerHTML).toBe('<div class="ag-floating-filter-input"><div id="filter-1"></div><div id="filter-2" class="ag-hidden"></div></div>');
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
        const combinedFloatingFilter = createCombinedFloatingFilter();
        const event = mock<FilterChangedEvent>();

        combinedFloatingFilter.onParentModelChanged(null, event);

        expect(floatingFilter1.onParentModelChanged).toHaveBeenCalledTimes(1);
        expect(floatingFilter1.onParentModelChanged).toHaveBeenCalledWith(null, event);
        expect(floatingFilter2.onParentModelChanged).toHaveBeenCalledTimes(1);
        expect(floatingFilter2.onParentModelChanged).toHaveBeenCalledWith(null, event);
    });

    it('passes through onParentModelChanged call when model is present', () => {
        const combinedFloatingFilter = createCombinedFloatingFilter();
        const event = mock<FilterChangedEvent>();
        const filterModel1: ProvidedFilterModel = { filterType: 'text' };
        const filterModel2: SetFilterModel = { filterType: 'set', values: [] };
        const model: CombinedFilterModel = {
            filterType: 'combined',
            filterModels: [filterModel1, filterModel2]
        };

        combinedFloatingFilter.onParentModelChanged(model, event);

        expect(floatingFilter1.onParentModelChanged).toHaveBeenCalledTimes(1);
        expect(floatingFilter1.onParentModelChanged).toHaveBeenCalledWith(filterModel1, event);
        expect(floatingFilter2.onParentModelChanged).toHaveBeenCalledTimes(1);
        expect(floatingFilter2.onParentModelChanged).toHaveBeenCalledWith(filterModel2, event);
    });

    it('does nothing if afterFloatingFilter is true', () => {
        const combinedFloatingFilter = createCombinedFloatingFilter();
        const event = mock<FilterChangedEvent>();
        event.afterFloatingFilter = true;

        const model: CombinedFilterModel = {
            filterType: 'combined',
            filterModels: [{ filterType: 'text' }, { filterType: 'set', values: [] }]
        };

        combinedFloatingFilter.onParentModelChanged(model, event);

        expect(floatingFilter1.onParentModelChanged).toHaveBeenCalledTimes(0);
        expect(floatingFilter2.onParentModelChanged).toHaveBeenCalledTimes(0);
    });

    it('shows first floating filter if only first filter is active', () => {
        const combinedFloatingFilter = createCombinedFloatingFilter();
        const event = mock<FilterChangedEvent>();
        const model: CombinedFilterModel = {
            filterType: 'combined',
            filterModels: [{ filterType: 'text' }, null]
        };

        combinedFloatingFilter.onParentModelChanged(model, event);

        expect(floatingFilter1.getGui().className).toBe('');
        expect(floatingFilter2.getGui().className).toBe('ag-hidden');
    });

    it('shows second floating filter if only second filter is active', () => {
        const combinedFloatingFilter = createCombinedFloatingFilter();
        const event = mock<FilterChangedEvent>();
        const model: CombinedFilterModel = {
            filterType: 'combined',
            filterModels: [null, { filterType: 'set', values: [] }]
        };

        combinedFloatingFilter.onParentModelChanged(model, event);

        expect(floatingFilter1.getGui().className).toBe('ag-hidden');
        expect(floatingFilter2.getGui().className).toBe('');
    });

    it('shows neither floating filter if both filters are active', () => {
        const combinedFloatingFilter = createCombinedFloatingFilter();
        const event = mock<FilterChangedEvent>();
        const model: CombinedFilterModel = {
            filterType: 'combined',
            filterModels: [{ filterType: 'text' }, { filterType: 'set', values: [] }]
        };

        combinedFloatingFilter.onParentModelChanged(model, event);

        expect(floatingFilter1.getGui().className).toBe('ag-hidden');
        expect(floatingFilter2.getGui().className).toBe('ag-hidden');
    });
});