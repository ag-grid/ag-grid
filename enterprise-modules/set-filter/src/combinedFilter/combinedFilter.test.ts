import { CombinedFilter, CombinedFilterParams, CombinedFilterModel } from './combinedFilter';
import {
    ColDef,
    IClientSideRowModel,
    FilterManager,
    IProvidedFilterParams,
    Column,
    UserComponentFactory,
    IRowModel,
    Promise,
    IFilterComp,
    IAfterGuiAttachedParams,
    IDoesFilterPassParams,
    ProvidedFilter,
    ProvidedFilterModel,
    SimpleFilter,
    ISetFilterParams,
} from '@ag-grid-community/core';
import { mock } from '../test-utils/mock';
import { SetFilterModel } from '../setFilter/setFilterModel';

let eGui: jest.Mocked<HTMLElement>;
let filterManager: jest.Mocked<FilterManager>;
let userComponentFactory: jest.Mocked<UserComponentFactory>;

let colDef: jest.Mocked<ColDef>;
let column: jest.Mocked<Column>;
let rowModel: jest.Mocked<IRowModel>;

let filter1: jest.Mocked<IFilterComp>;
let filter2: jest.Mocked<IFilterComp>;

function createCombinedFilter(filterParams: any = {}): CombinedFilter {
    const baseFilterParams: IProvidedFilterParams = {
        api: null,
        column,
        colDef,
        rowModel,
        context: null,
        doesRowPassOtherFilter: () => true,
        filterChangedCallback: () => { },
        filterModifiedCallback: () => { },
        valueGetter: node => node.data.value,
    };

    filterManager.createFilterParams.mockImplementation((_1, _2, _3) => ({ ...baseFilterParams }));
    userComponentFactory.newFilterComponent
        .mockReturnValueOnce(Promise.resolve(filter1))
        .mockReturnValueOnce(Promise.resolve(filter2));

    const params: CombinedFilterParams = {
        ...baseFilterParams,
        ...filterParams,
    };

    const combinedFilter = new CombinedFilter();

    (combinedFilter as any).eGui = eGui;
    (combinedFilter as any).filterManager = filterManager;
    (combinedFilter as any).userComponentFactory = userComponentFactory;

    combinedFilter.init(params);

    return combinedFilter;
}

beforeEach(() => {
    eGui = mock<HTMLElement>('appendChild');
    filterManager = mock<FilterManager>('createFilterParams');
    userComponentFactory = mock<UserComponentFactory>('newFilterComponent');

    colDef = mock<ColDef>();
    column = mock<Column>('getColDef');
    column.getColDef.mockReturnValue(colDef);
    rowModel = mock<IClientSideRowModel>('getType');
});

describe('init', () => {
    beforeEach(() => {
        filter1 = mock<IFilterComp>('getGui');
        filter2 = mock<IFilterComp>('getGui');
    });

    it('presents the first filter then the second filter with a divider in-between', () => {
        const filter1Element = document.createElement('div');
        filter1Element.id = 'filter-1';
        filter1 = mock<IFilterComp>('getGui');
        filter1.getGui.mockReturnValue(filter1Element);

        const filter2Element = document.createElement('div');
        filter2Element.id = 'filter-2';
        filter2 = mock<IFilterComp>('getGui');
        filter2.getGui.mockReturnValue(filter2Element);

        createCombinedFilter();

        expect(eGui.appendChild).toHaveBeenCalledTimes(3);

        const { calls } = eGui.appendChild.mock;

        expect((calls[0][0] as HTMLElement)).toBe(filter1Element);
        expect((calls[1][0] as HTMLElement).outerHTML).toBe('<div class="ag-combined-filter-divider"></div>');
        expect((calls[2][0] as HTMLElement)).toBe(filter2Element);
    });

    it('will default to text filter and set filter', () => {
        createCombinedFilter();

        expect(userComponentFactory.newFilterComponent).toHaveBeenCalledTimes(2);
        expect(userComponentFactory.newFilterComponent.mock.calls[0][0]).toMatchObject({ filter: 'agTextColumnFilter' });
        expect(userComponentFactory.newFilterComponent.mock.calls[1][0]).toMatchObject({ filter: 'agSetColumnFilter' });
    });
});

describe('isFilterActive', () => {
    beforeEach(() => {
        filter1 = mock<IFilterComp>('getGui', 'isFilterActive');
        filter2 = mock<IFilterComp>('getGui', 'isFilterActive');
    });

    it('returns false if neither filter is active', () => {
        const combinedFilter = createCombinedFilter();

        expect(combinedFilter.isFilterActive()).toBe(false);
    });

    it('returns true if first filter is active', () => {
        const combinedFilter = createCombinedFilter();

        filter1.isFilterActive.mockReturnValue(true);

        expect(combinedFilter.isFilterActive()).toBe(true);
    });

    it('returns true if second filter is active', () => {
        const combinedFilter = createCombinedFilter();

        filter2.isFilterActive.mockReturnValue(true);

        expect(combinedFilter.isFilterActive()).toBe(true);
    });

    it('returns true if both filters are active', () => {
        const combinedFilter = createCombinedFilter();

        filter1.isFilterActive.mockReturnValue(true);
        filter2.isFilterActive.mockReturnValue(true);

        expect(combinedFilter.isFilterActive()).toBe(true);
    });
});

describe('doesFilterPass', () => {
    beforeEach(() => {
        filter1 = mock<IFilterComp>('getGui', 'isFilterActive', 'doesFilterPass');
        filter2 = mock<IFilterComp>('getGui', 'isFilterActive', 'doesFilterPass');
    });

    it('returns true if neither filter is active', () => {
        const combinedFilter = createCombinedFilter();
        const params: IDoesFilterPassParams = { node: null, data: null };

        expect(combinedFilter.doesFilterPass(params)).toBe(true);
    });

    it('returns true if first filter is active and passes', () => {
        const combinedFilter = createCombinedFilter();
        const params: IDoesFilterPassParams = { node: null, data: null };

        filter1.isFilterActive.mockReturnValue(true);
        filter1.doesFilterPass.mockReturnValue(true);

        expect(combinedFilter.doesFilterPass(params)).toBe(true);
    });

    it('returns false if first filter is active and does not pass', () => {
        const combinedFilter = createCombinedFilter();
        const params: IDoesFilterPassParams = { node: null, data: null };

        filter1.isFilterActive.mockReturnValue(true);
        filter1.doesFilterPass.mockReturnValue(false);

        expect(combinedFilter.doesFilterPass(params)).toBe(false);
    });

    it('returns true if second filter is active and passes', () => {
        const combinedFilter = createCombinedFilter();
        const params: IDoesFilterPassParams = { node: null, data: null };

        filter2.isFilterActive.mockReturnValue(true);
        filter2.doesFilterPass.mockReturnValue(true);

        expect(combinedFilter.doesFilterPass(params)).toBe(true);
    });

    it('returns false if second filter is active and does not pass', () => {
        const combinedFilter = createCombinedFilter();
        const params: IDoesFilterPassParams = { node: null, data: null };

        filter2.isFilterActive.mockReturnValue(true);
        filter2.doesFilterPass.mockReturnValue(false);

        expect(combinedFilter.doesFilterPass(params)).toBe(false);
    });

    it('returns true if both filters are active and both pass', () => {
        const combinedFilter = createCombinedFilter();
        const params: IDoesFilterPassParams = { node: null, data: null };

        filter1.isFilterActive.mockReturnValue(true);
        filter1.doesFilterPass.mockReturnValue(true);
        filter2.isFilterActive.mockReturnValue(true);
        filter2.doesFilterPass.mockReturnValue(true);

        expect(combinedFilter.doesFilterPass(params)).toBe(true);
    });

    it('returns false if both filters are active and first filter does not pass', () => {
        const combinedFilter = createCombinedFilter();
        const params: IDoesFilterPassParams = { node: null, data: null };

        filter1.isFilterActive.mockReturnValue(true);
        filter1.doesFilterPass.mockReturnValue(false);
        filter2.isFilterActive.mockReturnValue(true);
        filter2.doesFilterPass.mockReturnValue(true);

        expect(combinedFilter.doesFilterPass(params)).toBe(false);
    });

    it('returns false if both filters are active and second filter does not pass', () => {
        const combinedFilter = createCombinedFilter();
        const params: IDoesFilterPassParams = { node: null, data: null };

        filter1.isFilterActive.mockReturnValue(true);
        filter1.doesFilterPass.mockReturnValue(true);
        filter2.isFilterActive.mockReturnValue(true);
        filter2.doesFilterPass.mockReturnValue(false);

        expect(combinedFilter.doesFilterPass(params)).toBe(false);
    });
});

describe('getModelFromUi', () => {
    beforeEach(() => {
        filter1 = mock<IFilterComp>('getGui', 'isFilterActive');
        filter2 = mock<IFilterComp>('getGui', 'isFilterActive');
    });

    it('returns null if neither filter is active', () => {
        const combinedFilter = createCombinedFilter();

        expect(combinedFilter.getModelFromUi()).toBeNull();
    });

    it('includes model from first filter', () => {
        const providedFilter = mock<ProvidedFilter>('getGui', 'isFilterActive', 'getModelFromUi');
        filter1 = providedFilter;

        const combinedFilter = createCombinedFilter();
        const filterModel: ProvidedFilterModel = { filterType: 'text' };
        providedFilter.getModelFromUi.mockReturnValue(filterModel);
        filter1.isFilterActive.mockReturnValue(true);

        expect(combinedFilter.getModelFromUi()).toStrictEqual<CombinedFilterModel>({
            filterType: 'combined',
            filterModels: [filterModel, null],
        });
    });

    it('does not include model from first filter if does not implement getModelFromUi', () => {
        const combinedFilter = createCombinedFilter();
        filter1.isFilterActive.mockReturnValue(true);

        expect(combinedFilter.getModelFromUi()).toStrictEqual<CombinedFilterModel>({
            filterType: 'combined',
            filterModels: [null, null],
        });
    });

    it('includes model from second filter', () => {
        const providedFilter = mock<ProvidedFilter>('getGui', 'isFilterActive', 'getModelFromUi');
        filter2 = providedFilter;

        const combinedFilter = createCombinedFilter();
        const filterModel: ProvidedFilterModel = { filterType: 'text' };
        providedFilter.getModelFromUi.mockReturnValue(filterModel);
        filter2.isFilterActive.mockReturnValue(true);

        expect(combinedFilter.getModelFromUi()).toStrictEqual<CombinedFilterModel>({
            filterType: 'combined',
            filterModels: [null, filterModel],
        });
    });

    it('does not include model from second filter if does not implement getModelFromUi', () => {
        const combinedFilter = createCombinedFilter();
        filter2.isFilterActive.mockReturnValue(true);

        expect(combinedFilter.getModelFromUi()).toStrictEqual<CombinedFilterModel>({
            filterType: 'combined',
            filterModels: [null, null],
        });
    });
});

describe('getModel', () => {
    beforeEach(() => {
        filter1 = mock<IFilterComp>('getGui', 'isFilterActive', 'getModel');
        filter2 = mock<IFilterComp>('getGui', 'isFilterActive', 'getModel');
    });

    it('returns null if neither filter is active', () => {
        const combinedFilter = createCombinedFilter();

        expect(combinedFilter.getModelFromUi()).toBeNull();
    });

    it('includes model from first filter', () => {
        const combinedFilter = createCombinedFilter();
        const filterModel: ProvidedFilterModel = { filterType: 'text' };
        filter1.getModel.mockReturnValue(filterModel);
        filter1.isFilterActive.mockReturnValue(true);

        expect(combinedFilter.getModel()).toStrictEqual<CombinedFilterModel>({
            filterType: 'combined',
            filterModels: [filterModel, null],
        });
    });

    it('includes model from second filter', () => {
        const combinedFilter = createCombinedFilter();
        const filterModel: SetFilterModel = { filterType: 'set', values: [] };
        filter2.getModel.mockReturnValue(filterModel);
        filter2.isFilterActive.mockReturnValue(true);

        expect(combinedFilter.getModel()).toStrictEqual<CombinedFilterModel>({
            filterType: 'combined',
            filterModels: [null, filterModel],
        });
    });

    it('includes model from both filters', () => {
        const combinedFilter = createCombinedFilter();

        const filterModel1: ProvidedFilterModel = { filterType: 'text' };
        filter1.getModel.mockReturnValue(filterModel1);
        filter1.isFilterActive.mockReturnValue(true);

        const filterModel2: SetFilterModel = { filterType: 'set', values: [] };
        filter2.getModel.mockReturnValue(filterModel2);
        filter2.isFilterActive.mockReturnValue(true);

        expect(combinedFilter.getModel()).toStrictEqual<CombinedFilterModel>({
            filterType: 'combined',
            filterModels: [filterModel1, filterModel2],
        });
    });
});

describe('setModel', () => {
    beforeEach(() => {
        filter1 = mock<IFilterComp>('getGui', 'isFilterActive', 'setModel');
        filter2 = mock<IFilterComp>('getGui', 'isFilterActive', 'setModel');
    });

    it('sets null on both filters if provided model is null', done => {
        const combinedFilter = createCombinedFilter();

        combinedFilter.setModel(null).then(() => {
            expect(filter1.setModel).toHaveBeenCalledTimes(1);
            expect(filter1.setModel).toHaveBeenCalledWith(null);
            expect(filter2.setModel).toHaveBeenCalledTimes(1);
            expect(filter2.setModel).toHaveBeenCalledWith(null);

            done();
        });
    });

    it('sets model on all filters if provided model is present', done => {
        const combinedFilter = createCombinedFilter();
        const filterModel1: ProvidedFilterModel = { filterType: 'text' };
        const filterModel2: SetFilterModel = { filterType: 'set', values: [] };

        const model: CombinedFilterModel = {
            filterType: 'combined',
            filterModels: [filterModel1, filterModel2]
        };

        combinedFilter.setModel(model).then(() => {
            expect(filter1.setModel).toHaveBeenCalledTimes(1);
            expect(filter1.setModel).toHaveBeenCalledWith(filterModel1);
            expect(filter2.setModel).toHaveBeenCalledTimes(1);
            expect(filter2.setModel).toHaveBeenCalledWith(filterModel2);

            done();
        });
    });
});

describe('getFilter', () => {
    it('returns first filter', done => {
        const combinedFilter = createCombinedFilter();

        combinedFilter.getFilter(0).then(filter => {
            expect(filter).toBe(filter1);
            done();
        });
    });

    it('returns second filter', done => {
        const combinedFilter = createCombinedFilter();

        combinedFilter.getFilter(1).then(filter => {
            expect(filter).toBe(filter2);
            done();
        });
    });
});

describe('afterGuiAttached', () => {
    beforeEach(() => {
        filter1 = mock<IFilterComp>('getGui');
        filter2 = mock<IFilterComp>('getGui');
    });

    it('passes through to filter if it has afterGuiAttached function', () => {
        filter1 = mock<IFilterComp>('getGui', 'afterGuiAttached');
        filter2 = mock<IFilterComp>('getGui', 'afterGuiAttached');

        const combinedFilter = createCombinedFilter();
        const params: IAfterGuiAttachedParams = {};

        combinedFilter.afterGuiAttached(params);

        expect(filter1.afterGuiAttached).toHaveBeenCalledTimes(1);
        expect(filter1.afterGuiAttached).toHaveBeenCalledWith(params);
        expect(filter2.afterGuiAttached).toHaveBeenCalledTimes(1);
        expect(filter2.afterGuiAttached).toHaveBeenCalledWith(params);
    });

    it('does not pass through to filter if afterGuiAttached function does not exist', () => {
        const combinedFilter = createCombinedFilter();

        expect(() => combinedFilter.afterGuiAttached({})).not.toThrow();
    });
});

describe('onAnyFilterChanged', () => {
    beforeEach(() => {
        filter1 = mock<IFilterComp>('getGui');
        filter2 = mock<IFilterComp>('getGui');
    });

    it('passes through to filter if it has onAnyFilterChanged function', () => {
        filter1 = mock<IFilterComp>('getGui', 'onAnyFilterChanged');
        filter2 = mock<IFilterComp>('getGui', 'onAnyFilterChanged');

        const combinedFilter = createCombinedFilter();
        combinedFilter.onAnyFilterChanged();

        expect(filter1.onAnyFilterChanged).toHaveBeenCalledTimes(1);
        expect(filter2.onAnyFilterChanged).toHaveBeenCalledTimes(1);
    });

    it('does not pass through to filter if onAnyFilterChanged function does not exist', () => {
        const combinedFilter = createCombinedFilter();

        expect(() => combinedFilter.onAnyFilterChanged()).not.toThrow();
    });
});

describe('onNewRowsLoaded', () => {
    beforeEach(() => {
        filter1 = mock<IFilterComp>('getGui');
        filter2 = mock<IFilterComp>('getGui');
    });

    it('passes through to filter if it has onNewRowsLoaded function', () => {
        filter1 = mock<IFilterComp>('getGui', 'onNewRowsLoaded');
        filter2 = mock<IFilterComp>('getGui', 'onNewRowsLoaded');

        const combinedFilter = createCombinedFilter();
        combinedFilter.onNewRowsLoaded();

        expect(filter1.onNewRowsLoaded).toHaveBeenCalledTimes(1);
        expect(filter2.onNewRowsLoaded).toHaveBeenCalledTimes(1);
    });

    it('does not pass through to filter if onNewRowsLoaded function does not exist', () => {
        const combinedFilter = createCombinedFilter();

        expect(() => combinedFilter.onNewRowsLoaded()).not.toThrow();
    });
});

describe('onFloatingFilterChanged', () => {
    beforeEach(() => {
        filter1 = mock<IFilterComp>('getGui');
        filter2 = mock<IFilterComp>('getGui');
    });

    it('passes through to filter if it has onFloatingFilterChanged function', () => {
        const simpleFilter1 = filter1 = mock<SimpleFilter<any>>('getGui', 'onFloatingFilterChanged');
        const simpleFilter2 = filter2 = mock<SimpleFilter<any>>('getGui', 'onFloatingFilterChanged');

        const combinedFilter = createCombinedFilter();
        const type = 'type';
        const value = 'value';

        combinedFilter.onFloatingFilterChanged(type, value);

        expect(simpleFilter1.onFloatingFilterChanged).toHaveBeenCalledTimes(1);
        expect(simpleFilter1.onFloatingFilterChanged).toHaveBeenCalledWith(type, value);
        expect(simpleFilter2.onFloatingFilterChanged).toHaveBeenCalledTimes(1);
        expect(simpleFilter2.onFloatingFilterChanged).toHaveBeenCalledWith(type, value);
    });

    it('does not pass through to filter if onFloatingFilterChanged function does not exist', () => {
        const combinedFilter = createCombinedFilter();

        expect(() => combinedFilter.onFloatingFilterChanged('type', 'value')).not.toThrow();
    });
});

describe('onFilterChanged', () => {
    beforeEach(() => {
        filter1 = mock<IFilterComp>('getGui', 'isFilterActive', 'setModel');
        filter2 = mock<IFilterComp>('getGui', 'isFilterActive', 'setModel');
    });

    it('triggers filterChangedCallback from combined filter if first filter changes', () => {
        const combinedFilterChangedCallback = jest.fn();

        createCombinedFilter({ filterChangedCallback: combinedFilterChangedCallback });

        const { filterChangedCallback } = userComponentFactory.newFilterComponent.mock.calls[0][1];

        filterChangedCallback();

        expect(combinedFilterChangedCallback).toHaveBeenCalledTimes(1);
    });

    it('triggers filterChangedCallback from combined filter if second filter changes', () => {
        const combinedFilterChangedCallback = jest.fn();

        createCombinedFilter({ filterChangedCallback: combinedFilterChangedCallback });

        const params = userComponentFactory.newFilterComponent.mock.calls[1][1] as ISetFilterParams;
        const { filterChangedCallback } = params;

        filterChangedCallback();

        expect(combinedFilterChangedCallback).toHaveBeenCalledTimes(1);
    });

    it('triggers filterChangedCallback from combined filter if first filter changes and both filters are enabled', () => {
        const combinedFilterChangedCallback = jest.fn();

        createCombinedFilter({ filterChangedCallback: combinedFilterChangedCallback, allowBothFiltersConcurrently: true });

        const { filterChangedCallback } = userComponentFactory.newFilterComponent.mock.calls[0][1];

        filterChangedCallback();

        expect(combinedFilterChangedCallback).toHaveBeenCalledTimes(1);
    });

    it('triggers filterChangedCallback from combined filter if second filter changes and both filters are enabled', () => {
        const combinedFilterChangedCallback = jest.fn();

        createCombinedFilter({ filterChangedCallback: combinedFilterChangedCallback, allowBothFiltersConcurrently: true });

        const params = userComponentFactory.newFilterComponent.mock.calls[1][1];
        const { filterChangedCallback } = params;

        filterChangedCallback();

        expect(combinedFilterChangedCallback).toHaveBeenCalledTimes(1);
    });

    it('resets second filter if first filter changes', () => {
        createCombinedFilter();

        const { filterChangedCallback } = userComponentFactory.newFilterComponent.mock.calls[0][1];
        filter2.isFilterActive.mockReturnValue(true);

        filterChangedCallback();

        expect(filter2.setModel).toHaveBeenCalledTimes(1);
        expect(filter2.setModel).toHaveBeenCalledWith(null);
    });

    it('resets first filter if second filter changes', () => {
        createCombinedFilter();

        const params = userComponentFactory.newFilterComponent.mock.calls[1][1];
        const { filterChangedCallback } = params;

        filter1.isFilterActive.mockReturnValue(true);

        filterChangedCallback();

        expect(filter1.setModel).toHaveBeenCalledTimes(1);
        expect(filter1.setModel).toHaveBeenCalledWith(null);
    });

    it('does not reset second filter if first filter changes and all filters are allowed', () => {
        createCombinedFilter({ allowAllFiltersConcurrently: true });

        const params = userComponentFactory.newFilterComponent.mock.calls[0][1];
        const { filterChangedCallback } = params;

        filter2.isFilterActive.mockReturnValue(true);

        filterChangedCallback();

        expect(filter2.setModel).toHaveBeenCalledTimes(0);
    });

    it('does not reset first filter if second filter changes and all filters are allowed', () => {
        createCombinedFilter({ allowAllFiltersConcurrently: true });

        const params = userComponentFactory.newFilterComponent.mock.calls[1][1];
        const { filterChangedCallback } = params;

        filter1.isFilterActive.mockReturnValue(true);

        filterChangedCallback();

        expect(filter1.setModel).toHaveBeenCalledTimes(0);
    });
});

// describe('synchronisation', () => {
//     it('blanks set filter when wrapped filter is active and not using client-side row model', () => {
//         rowModel.getType.mockReturnValue(Constants.ROW_MODEL_TYPE_SERVER_SIDE);

//         createCombinedFilter();

//         const { filterChangedCallback } = userComponentFactory.newFilterComponent.mock.calls[0][1];
//         filter1.isFilterActive.mockReturnValue(true);

//         filterChangedCallback();

//         expect(filter2.setModelIntoUi).toHaveBeenCalledTimes(1);
//         expect(filter2.setModelIntoUi).toHaveBeenCalledWith({ filterType: 'set', values: [] });
//     });

//     it('blanks set filter when wrapped filter is active and synchronisation is suppressed', () => {
//         rowModel.getType.mockReturnValue(Constants.ROW_MODEL_TYPE_CLIENT_SIDE);

//         createCombinedFilter({ suppressSynchronisation: true });

//         const { filterChangedCallback } = userComponentFactory.newFilterComponent.mock.calls[0][1];
//         filter1.isFilterActive.mockReturnValue(true);

//         filterChangedCallback();

//         expect(filter2.setModelIntoUi).toHaveBeenCalledTimes(1);
//         expect(filter2.setModelIntoUi).toHaveBeenCalledWith({ filterType: 'set', values: [] });
//     });

//     it('ensures set filter state is reset when wrapped filter is no longer active', () => {
//         createCombinedFilter();

//         const { filterChangedCallback } = userComponentFactory.newFilterComponent.mock.calls[0][1];

//         filterChangedCallback();

//         expect(filter2.setModelIntoUi).toHaveBeenCalledTimes(1);
//         expect(filter2.setModelIntoUi).toHaveBeenCalledWith(null);
//     });

//     it('does not change set filter if wrapped filter changes and both filters are allowed', () => {
//         createCombinedFilter({ allowBothFiltersConcurrently: true });

//         const { filterChangedCallback } = userComponentFactory.newFilterComponent.mock.calls[0][1];
//         filter2.isFilterActive.mockReturnValue(true);

//         filterChangedCallback();

//         expect(filter2.setModel).toHaveBeenCalledTimes(0);
//         expect(filter2.setModelIntoUi).toHaveBeenCalledTimes(0);
//     });
// });