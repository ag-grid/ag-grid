import { MultiFilter, IMultiFilterParams, IMultiFilterModel } from './multiFilter';
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
    ISetFilterParams,
} from '@ag-grid-community/core';
import { SetFilterModel } from '@ag-grid-enterprise/set-filter';
import { mock } from '../test-utils/mock';

let eGui: jest.Mocked<HTMLElement>;
let filterManager: jest.Mocked<FilterManager>;
let userComponentFactory: jest.Mocked<UserComponentFactory>;

let colDef: jest.Mocked<ColDef>;
let column: jest.Mocked<Column>;
let rowModel: jest.Mocked<IRowModel>;

let filter1: jest.Mocked<IFilterComp>;
let filter2: jest.Mocked<IFilterComp>;

function createFilter(filterParams: any = {}): MultiFilter {
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

    const params: IMultiFilterParams = {
        ...baseFilterParams,
        ...filterParams,
    };

    const multiFilter = new MultiFilter();

    (multiFilter as any).eGui = eGui;
    (multiFilter as any).filterManager = filterManager;
    (multiFilter as any).userComponentFactory = userComponentFactory;

    multiFilter.init(params);

    return multiFilter;
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

        createFilter();

        expect(eGui.appendChild).toHaveBeenCalledTimes(3);

        const { calls } = eGui.appendChild.mock;

        expect((calls[0][0] as HTMLElement)).toBe(filter1Element);
        expect((calls[1][0] as HTMLElement).outerHTML).toBe('<div class="ag-menu-separator"></div>');
        expect((calls[2][0] as HTMLElement)).toBe(filter2Element);
    });

    it('will default to text filter and set filter', () => {
        createFilter();

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
        const multiFilter = createFilter();

        expect(multiFilter.isFilterActive()).toBe(false);
    });

    it('returns true if first filter is active', () => {
        const multiFilter = createFilter();

        filter1.isFilterActive.mockReturnValue(true);

        expect(multiFilter.isFilterActive()).toBe(true);
    });

    it('returns true if second filter is active', () => {
        const multiFilter = createFilter();

        filter2.isFilterActive.mockReturnValue(true);

        expect(multiFilter.isFilterActive()).toBe(true);
    });

    it('returns true if both filters are active', () => {
        const multiFilter = createFilter();

        filter1.isFilterActive.mockReturnValue(true);
        filter2.isFilterActive.mockReturnValue(true);

        expect(multiFilter.isFilterActive()).toBe(true);
    });
});

describe('doesFilterPass', () => {
    beforeEach(() => {
        filter1 = mock<IFilterComp>('getGui', 'isFilterActive', 'doesFilterPass');
        filter2 = mock<IFilterComp>('getGui', 'isFilterActive', 'doesFilterPass');
    });

    it('returns true if no filters are active', () => {
        const multiFilter = createFilter();
        const params: IDoesFilterPassParams = { node: null, data: null };

        expect(multiFilter.doesFilterPass(params)).toBe(true);
    });

    it('returns true if all active filters pass', () => {
        const multiFilter = createFilter();
        const params: IDoesFilterPassParams = { node: null, data: null };

        (multiFilter as any).activeFilters = new Set([filter1, filter2]);
        filter1.doesFilterPass.mockReturnValue(true);
        filter2.doesFilterPass.mockReturnValue(true);

        expect(multiFilter.doesFilterPass(params)).toBe(true);
    });

    it('returns false if any active filters do not pass', () => {
        const multiFilter = createFilter();
        const params: IDoesFilterPassParams = { node: null, data: null };

        (multiFilter as any).activeFilters = new Set([filter1, filter2]);
        filter1.doesFilterPass.mockReturnValue(true);
        filter2.doesFilterPass.mockReturnValue(false);

        expect(multiFilter.doesFilterPass(params)).toBe(false);
    });
});

describe('getModelFromUi', () => {
    beforeEach(() => {
        filter1 = mock<IFilterComp>('getGui', 'isFilterActive');
        filter2 = mock<IFilterComp>('getGui', 'isFilterActive');
    });

    it('returns null if neither filter is active', () => {
        const multiFilter = createFilter();

        expect(multiFilter.getModelFromUi()).toBeNull();
    });

    it('includes model from first filter', () => {
        const providedFilter = mock<ProvidedFilter>('getGui', 'isFilterActive', 'getModelFromUi');
        filter1 = providedFilter;

        const multiFilter = createFilter();
        const filterModel: ProvidedFilterModel = { filterType: 'text' };
        providedFilter.getModelFromUi.mockReturnValue(filterModel);
        filter1.isFilterActive.mockReturnValue(true);

        expect(multiFilter.getModelFromUi()).toStrictEqual<IMultiFilterModel>({
            filterType: 'multi',
            filterModels: [filterModel, null],
        });
    });

    it('does not include model from first filter if does not implement getModelFromUi', () => {
        const multiFilter = createFilter();
        filter1.isFilterActive.mockReturnValue(true);

        expect(multiFilter.getModelFromUi()).toStrictEqual<IMultiFilterModel>({
            filterType: 'multi',
            filterModels: [null, null],
        });
    });

    it('includes model from second filter', () => {
        const providedFilter = mock<ProvidedFilter>('getGui', 'isFilterActive', 'getModelFromUi');
        filter2 = providedFilter;

        const multiFilter = createFilter();
        const filterModel: ProvidedFilterModel = { filterType: 'text' };
        providedFilter.getModelFromUi.mockReturnValue(filterModel);
        filter2.isFilterActive.mockReturnValue(true);

        expect(multiFilter.getModelFromUi()).toStrictEqual<IMultiFilterModel>({
            filterType: 'multi',
            filterModels: [null, filterModel],
        });
    });

    it('does not include model from second filter if does not implement getModelFromUi', () => {
        const multiFilter = createFilter();
        filter2.isFilterActive.mockReturnValue(true);

        expect(multiFilter.getModelFromUi()).toStrictEqual<IMultiFilterModel>({
            filterType: 'multi',
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
        const multiFilter = createFilter();

        expect(multiFilter.getModelFromUi()).toBeNull();
    });

    it('includes model from first filter', () => {
        const multiFilter = createFilter();
        const filterModel: ProvidedFilterModel = { filterType: 'text' };
        filter1.getModel.mockReturnValue(filterModel);
        filter1.isFilterActive.mockReturnValue(true);

        expect(multiFilter.getModel()).toStrictEqual<IMultiFilterModel>({
            filterType: 'multi',
            filterModels: [filterModel, null],
        });
    });

    it('includes model from second filter', () => {
        const multiFilter = createFilter();
        const filterModel: SetFilterModel = { filterType: 'set', values: [] };
        filter2.getModel.mockReturnValue(filterModel);
        filter2.isFilterActive.mockReturnValue(true);

        expect(multiFilter.getModel()).toStrictEqual<IMultiFilterModel>({
            filterType: 'multi',
            filterModels: [null, filterModel],
        });
    });

    it('includes model from both filters', () => {
        const multiFilter = createFilter();

        const filterModel1: ProvidedFilterModel = { filterType: 'text' };
        filter1.getModel.mockReturnValue(filterModel1);
        filter1.isFilterActive.mockReturnValue(true);

        const filterModel2: SetFilterModel = { filterType: 'set', values: [] };
        filter2.getModel.mockReturnValue(filterModel2);
        filter2.isFilterActive.mockReturnValue(true);

        expect(multiFilter.getModel()).toStrictEqual<IMultiFilterModel>({
            filterType: 'multi',
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
        const multiFilter = createFilter();

        multiFilter.setModel(null).then(() => {
            expect(filter1.setModel).toHaveBeenCalledTimes(1);
            expect(filter1.setModel).toHaveBeenCalledWith(null);
            expect(filter2.setModel).toHaveBeenCalledTimes(1);
            expect(filter2.setModel).toHaveBeenCalledWith(null);

            done();
        });
    });

    it('sets model on all filters if provided model is present', done => {
        const multiFilter = createFilter();
        const filterModel1: ProvidedFilterModel = { filterType: 'text' };
        const filterModel2: SetFilterModel = { filterType: 'set', values: [] };

        const model: IMultiFilterModel = {
            filterType: 'multi',
            filterModels: [filterModel1, filterModel2]
        };

        multiFilter.setModel(model).then(() => {
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
        const multiFilter = createFilter();

        multiFilter.getFilter(0).then(filter => {
            expect(filter).toBe(filter1);
            done();
        });
    });

    it('returns second filter', done => {
        const multiFilter = createFilter();

        multiFilter.getFilter(1).then(filter => {
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

        const multiFilter = createFilter();
        const params: IAfterGuiAttachedParams = {};

        multiFilter.afterGuiAttached(params);

        expect(filter1.afterGuiAttached).toHaveBeenCalledTimes(1);
        expect(filter1.afterGuiAttached).toHaveBeenCalledWith(params);
        expect(filter2.afterGuiAttached).toHaveBeenCalledTimes(1);
        expect(filter2.afterGuiAttached).toHaveBeenCalledWith(params);
    });

    it('does not pass through to filter if afterGuiAttached function does not exist', () => {
        const multiFilter = createFilter();

        expect(() => multiFilter.afterGuiAttached({})).not.toThrow();
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

        const multiFilter = createFilter();
        multiFilter.onAnyFilterChanged();

        expect(filter1.onAnyFilterChanged).toHaveBeenCalledTimes(1);
        expect(filter2.onAnyFilterChanged).toHaveBeenCalledTimes(1);
    });

    it('does not pass through to filter if onAnyFilterChanged function does not exist', () => {
        const multiFilter = createFilter();

        expect(() => multiFilter.onAnyFilterChanged()).not.toThrow();
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

        const multiFilter = createFilter();
        multiFilter.onNewRowsLoaded();

        expect(filter1.onNewRowsLoaded).toHaveBeenCalledTimes(1);
        expect(filter2.onNewRowsLoaded).toHaveBeenCalledTimes(1);
    });

    it('does not pass through to filter if onNewRowsLoaded function does not exist', () => {
        const multiFilter = createFilter();

        expect(() => multiFilter.onNewRowsLoaded()).not.toThrow();
    });
});

describe('onFilterChanged', () => {
    beforeEach(() => {
        filter1 = mock<IFilterComp>('getGui', 'isFilterActive', 'setModel');
        filter2 = mock<IFilterComp>('getGui', 'isFilterActive', 'setModel');
    });

    it('triggers filterChangedCallback from multi filter if first filter changes', () => {
        const multiFilterChangedCallback = jest.fn();

        createFilter({ filterChangedCallback: multiFilterChangedCallback });

        const { filterChangedCallback } = userComponentFactory.newFilterComponent.mock.calls[0][1];

        filterChangedCallback();

        expect(multiFilterChangedCallback).toHaveBeenCalledTimes(1);
    });

    it('triggers filterChangedCallback from multi filter if second filter changes', () => {
        const multiFilterChangedCallback = jest.fn();

        createFilter({ filterChangedCallback: multiFilterChangedCallback });

        const params = userComponentFactory.newFilterComponent.mock.calls[1][1] as ISetFilterParams;
        const { filterChangedCallback } = params;

        filterChangedCallback();

        expect(multiFilterChangedCallback).toHaveBeenCalledTimes(1);
    });

    it('triggers filterChangedCallback from multi filter if first filter changes and all filters are allowed', () => {
        const multiFilterChangedCallback = jest.fn();

        createFilter({ filterChangedCallback: multiFilterChangedCallback, allowBothFiltersConcurrently: true });

        const { filterChangedCallback } = userComponentFactory.newFilterComponent.mock.calls[0][1];

        filterChangedCallback();

        expect(multiFilterChangedCallback).toHaveBeenCalledTimes(1);
    });

    it('triggers filterChangedCallback from multi filter if second filter changes and all filters are allowed', () => {
        const multiFilterChangedCallback = jest.fn();

        createFilter({ filterChangedCallback: multiFilterChangedCallback, allowBothFiltersConcurrently: true });

        const params = userComponentFactory.newFilterComponent.mock.calls[1][1];
        const { filterChangedCallback } = params;

        filterChangedCallback();

        expect(multiFilterChangedCallback).toHaveBeenCalledTimes(1);
    });

    it('resets second filter if first filter changes', () => {
        createFilter();

        const { filterChangedCallback } = userComponentFactory.newFilterComponent.mock.calls[0][1];
        filter2.isFilterActive.mockReturnValue(true);

        filterChangedCallback();

        expect(filter2.setModel).toHaveBeenCalledTimes(1);
        expect(filter2.setModel).toHaveBeenCalledWith(null);
    });

    it('resets first filter if second filter changes', () => {
        createFilter();

        const params = userComponentFactory.newFilterComponent.mock.calls[1][1];
        const { filterChangedCallback } = params;

        filter1.isFilterActive.mockReturnValue(true);

        filterChangedCallback();

        expect(filter1.setModel).toHaveBeenCalledTimes(1);
        expect(filter1.setModel).toHaveBeenCalledWith(null);
    });

    it('does not reset second filter if first filter changes and filters are combined', () => {
        createFilter({ combineFilters: true });

        const params = userComponentFactory.newFilterComponent.mock.calls[0][1];
        const { filterChangedCallback } = params;

        filter2.isFilterActive.mockReturnValue(true);

        filterChangedCallback();

        expect(filter2.setModel).toHaveBeenCalledTimes(0);
    });

    it('does not reset first filter if second filter changes and filters are combined', () => {
        createFilter({ combineFilters: true });

        const params = userComponentFactory.newFilterComponent.mock.calls[1][1];
        const { filterChangedCallback } = params;

        filter1.isFilterActive.mockReturnValue(true);

        filterChangedCallback();

        expect(filter1.setModel).toHaveBeenCalledTimes(0);
    });

    it('adds changed filter to active filters if active', () => {
        const multiFilter = createFilter();
        const params = userComponentFactory.newFilterComponent.mock.calls[0][1];
        const { filterChangedCallback } = params;

        filter1.isFilterActive.mockReturnValue(true);

        filterChangedCallback();

        expect((multiFilter as any).activeFilters).toContain(filter1);
        expect((multiFilter as any).activeFilters).not.toContain(filter2);
    });

    it('removes changed filter from active filters if inactive', () => {
        const multiFilter = createFilter();
        const params = userComponentFactory.newFilterComponent.mock.calls[0][1];
        const { filterChangedCallback } = params;

        filter1.isFilterActive.mockReturnValue(false);
        (multiFilter as any).activeFilters = new Set([filter1, filter2]);

        filterChangedCallback();

        expect((multiFilter as any).activeFilters).not.toContain(filter1);
        expect((multiFilter as any).activeFilters).toContain(filter2);
    });

    it('triggers onAnyFilterChanged on other filters if exists', () => {
        filter1 = mock<IFilterComp>('getGui', 'isFilterActive', 'setModel', 'onAnyFilterChanged');
        filter2 = mock<IFilterComp>('getGui', 'isFilterActive', 'setModel', 'onAnyFilterChanged');

        createFilter();

        const params = userComponentFactory.newFilterComponent.mock.calls[0][1];
        const { filterChangedCallback } = params;

        filterChangedCallback();

        expect(filter1.onAnyFilterChanged).not.toHaveBeenCalled();
        expect(filter2.onAnyFilterChanged).toHaveBeenCalledTimes(1);
    });

    it('triggers onSiblingFilterChanged on other filters if exists', () => {
        filter1 = mock<IFilterComp>('getGui', 'isFilterActive', 'setModel', 'onSiblingFilterChanged');
        filter2 = mock<IFilterComp>('getGui', 'isFilterActive', 'setModel', 'onSiblingFilterChanged');

        createFilter();

        const params = userComponentFactory.newFilterComponent.mock.calls[1][1];
        const { filterChangedCallback } = params;

        filterChangedCallback();

        expect(filter1.onSiblingFilterChanged).toHaveBeenCalledTimes(1);
        expect(filter2.onSiblingFilterChanged).not.toHaveBeenCalled();
    });
});
