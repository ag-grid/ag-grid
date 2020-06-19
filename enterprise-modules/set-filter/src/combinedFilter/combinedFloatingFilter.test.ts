import { UserComponentFactory, IFloatingFilterComp, IFloatingFilterParams, Promise, FilterChangedEvent } from '@ag-grid-community/core';
import { SetFloatingFilterComp } from '../setFilter/setFloatingFilter';
import { CombinedFloatingFilterComp } from './combinedFloatingFilter';
import { mock } from '../test-utils/mock';
import { CombinedFilterModel } from './combinedFilter';

let userComponentFactory: jest.Mocked<UserComponentFactory>;
let wrappedFloatingFilter: jest.Mocked<IFloatingFilterComp>;
let setFloatingFilter: jest.Mocked<SetFloatingFilterComp>;

function createCombinedFloatingFilter(filterParams: any = {}): CombinedFloatingFilterComp {
    userComponentFactory.newFloatingFilterComponent.mockReturnValue(Promise.resolve(wrappedFloatingFilter));
    userComponentFactory.createUserComponentFromConcreteClass.mockReturnValue(setFloatingFilter);

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
        wrappedFloatingFilter = mock<IFloatingFilterComp>('getGui');
        setFloatingFilter = mock<SetFloatingFilterComp>('getGui');
    });

    it('creates floating filters for both filters with set floating filter hidden', () => {
        const wrappedFloatingFilterElement = document.createElement('div');
        wrappedFloatingFilterElement.id = 'wrapped-filter';
        wrappedFloatingFilter = mock<IFloatingFilterComp>('getGui');
        wrappedFloatingFilter.getGui.mockReturnValue(wrappedFloatingFilterElement);

        const setFloatingFilterElement = document.createElement('div');
        setFloatingFilterElement.id = 'set-filter';
        setFloatingFilter = mock<SetFloatingFilterComp>('getGui');
        setFloatingFilter.getGui.mockReturnValue(setFloatingFilterElement);

        const combinedFloatingFilter = createCombinedFloatingFilter();

        expect(combinedFloatingFilter.getGui().outerHTML).toBe('<div class="ag-floating-filter-input"><div id="wrapped-filter"></div><div id="set-filter" class="ag-hidden"></div></div>');
    });
});

describe('onParentModelChanged', () => {
    beforeEach(() => {
        wrappedFloatingFilter = mock<IFloatingFilterComp>('getGui', 'onParentModelChanged');
        wrappedFloatingFilter.getGui.mockReturnValue(document.createElement('div'));
        setFloatingFilter = mock<SetFloatingFilterComp>('getGui', 'onParentModelChanged');
        setFloatingFilter.getGui.mockReturnValue(document.createElement('div'));
    });

    it('passes through onParentModelChanged call when model is null', () => {
        const combinedFloatingFilter = createCombinedFloatingFilter();
        const event = mock<FilterChangedEvent>();

        combinedFloatingFilter.onParentModelChanged(null, event);

        expect(wrappedFloatingFilter.onParentModelChanged).toHaveBeenCalledTimes(1);
        expect(wrappedFloatingFilter.onParentModelChanged).toHaveBeenCalledWith(null, event);
        expect(setFloatingFilter.onParentModelChanged).toHaveBeenCalledTimes(1);
        expect(setFloatingFilter.onParentModelChanged).toHaveBeenCalledWith(null);
    });

    it('passes through onParentModelChanged call when model is present', () => {
        const combinedFloatingFilter = createCombinedFloatingFilter();
        const event = mock<FilterChangedEvent>();
        const model: CombinedFilterModel = {
            filterType: 'combined',
            wrappedFilterModel: { filterType: 'wrapped' },
            setFilterModel: { filterType: 'set', values: [] },
        };

        combinedFloatingFilter.onParentModelChanged(model, event);

        expect(wrappedFloatingFilter.onParentModelChanged).toHaveBeenCalledTimes(1);
        expect(wrappedFloatingFilter.onParentModelChanged).toHaveBeenCalledWith(model.wrappedFilterModel, event);
        expect(setFloatingFilter.onParentModelChanged).toHaveBeenCalledTimes(1);
        expect(setFloatingFilter.onParentModelChanged).toHaveBeenCalledWith(model.setFilterModel);
    });

    it('does nothing if afterFloatingFilter is true', () => {
        const combinedFloatingFilter = createCombinedFloatingFilter();
        const event = mock<FilterChangedEvent>();
        event.afterFloatingFilter = true;

        const model: CombinedFilterModel = {
            filterType: 'combined',
            wrappedFilterModel: { filterType: 'wrapped' },
            setFilterModel: { filterType: 'set', values: [] },
        };

        combinedFloatingFilter.onParentModelChanged(model, event);

        expect(wrappedFloatingFilter.onParentModelChanged).toHaveBeenCalledTimes(0);
        expect(setFloatingFilter.onParentModelChanged).toHaveBeenCalledTimes(0);
    });

    it('shows wrapped floating filter if only wrapped filter is active', () => {
        const combinedFloatingFilter = createCombinedFloatingFilter();
        const event = mock<FilterChangedEvent>();
        const model: CombinedFilterModel = {
            filterType: 'combined',
            wrappedFilterModel: { filterType: 'wrapped' },
            setFilterModel: null,
        };

        combinedFloatingFilter.onParentModelChanged(model, event);

        expect(wrappedFloatingFilter.getGui().className).toBe('');
        expect(setFloatingFilter.getGui().className).toBe('ag-hidden');
    });

    it('shows set floating filter if only set filter is active', () => {
        const combinedFloatingFilter = createCombinedFloatingFilter();
        const event = mock<FilterChangedEvent>();
        const model: CombinedFilterModel = {
            filterType: 'combined',
            wrappedFilterModel: null,
            setFilterModel: { filterType: 'set', values: [] },
        };

        combinedFloatingFilter.onParentModelChanged(model, event);

        expect(wrappedFloatingFilter.getGui().className).toBe('ag-hidden');
        expect(setFloatingFilter.getGui().className).toBe('');
    });

    it('shows neither floating filter if both filters are active', () => {
        const combinedFloatingFilter = createCombinedFloatingFilter();
        const event = mock<FilterChangedEvent>();
        const model: CombinedFilterModel = {
            filterType: 'combined',
            wrappedFilterModel: { filterType: 'wrapped' },
            setFilterModel: { filterType: 'set', values: [] },
        };

        combinedFloatingFilter.onParentModelChanged(model, event);

        expect(wrappedFloatingFilter.getGui().className).toBe('ag-hidden');
        expect(setFloatingFilter.getGui().className).toBe('ag-hidden');
    });
});