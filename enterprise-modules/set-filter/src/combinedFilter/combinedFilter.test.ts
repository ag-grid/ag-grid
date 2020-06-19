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
    Constants,
} from '@ag-grid-community/core';
import { mock } from '../test-utils/mock';
import { SetFilter } from '../setFilter/setFilter';
import { SetFilterModel } from '../setFilter/setFilterModel';

let eCombinedFilter: jest.Mocked<HTMLElement>;
let filterManager: jest.Mocked<FilterManager>;
let userComponentFactory: jest.Mocked<UserComponentFactory>;

let colDef: jest.Mocked<ColDef>;
let column: jest.Mocked<Column>;
let rowModel: jest.Mocked<IRowModel>;

let wrappedFilter: jest.Mocked<IFilterComp>;
let setFilter: jest.Mocked<SetFilter>;

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
    userComponentFactory.newFilterComponent.mockReturnValue(Promise.resolve(wrappedFilter));
    userComponentFactory.createUserComponentFromConcreteClass.mockReturnValue(setFilter);

    const params: CombinedFilterParams = {
        ...baseFilterParams,
        ...filterParams,
    };

    const combinedFilter = new CombinedFilter();

    (combinedFilter as any).eCombinedFilter = eCombinedFilter;
    (combinedFilter as any).filterManager = filterManager;
    (combinedFilter as any).userComponentFactory = userComponentFactory;

    combinedFilter.init(params);

    return combinedFilter;
}

beforeEach(() => {
    eCombinedFilter = mock<HTMLElement>('appendChild');
    filterManager = mock<FilterManager>('createFilterParams');
    userComponentFactory = mock<UserComponentFactory>('newFilterComponent', 'createUserComponentFromConcreteClass');

    colDef = mock<ColDef>();
    column = mock<Column>('getColDef');
    column.getColDef.mockReturnValue(colDef);
    rowModel = mock<IClientSideRowModel>('getType');
});

describe('init', () => {
    beforeEach(() => {
        wrappedFilter = mock<IFilterComp>('getGui');
        setFilter = mock<SetFilter>('getGui');
    });

    it('presents the wrapped filter then the set filter with a divider in-between', () => {
        const wrappedFilterElement = document.createElement('div');
        wrappedFilterElement.id = 'wrapped-filter';
        wrappedFilter = mock<IFilterComp>('getGui');
        wrappedFilter.getGui.mockReturnValue(wrappedFilterElement);

        const setFilterElement = document.createElement('div');
        setFilterElement.id = 'set-filter';
        setFilter = mock<SetFilter>('getGui');
        setFilter.getGui.mockReturnValue(setFilterElement);

        createCombinedFilter();

        expect(eCombinedFilter.appendChild).toHaveBeenCalledTimes(3);

        const { calls } = eCombinedFilter.appendChild.mock;

        expect((calls[0][0] as HTMLElement)).toBe(wrappedFilterElement);
        expect((calls[1][0] as HTMLElement).outerHTML).toBe('<div class="ag-combined-filter-divider"></div>');
        expect((calls[2][0] as HTMLElement)).toBe(setFilterElement);
    });

    it('will default to text filter for wrapped filter', () => {
        createCombinedFilter();

        expect(userComponentFactory.newFilterComponent)
            .toHaveBeenCalledWith(expect.anything(), expect.anything(), 'agTextColumnFilter');
    });

    it('defaults to always show both conditions in the wrapped filter', () => {
        createCombinedFilter();

        expect(userComponentFactory.newFilterComponent)
            .toHaveBeenCalledWith(expect.anything(), expect.objectContaining({ alwaysShowBothConditions: true }), expect.anything());
    });
});

describe('afterGuiAttached', () => {
    beforeEach(() => {
        wrappedFilter = mock<IFilterComp>('getGui');
        setFilter = mock<SetFilter>('getGui', 'afterGuiAttached');
    });

    it('passes through to set filter', () => {
        const combinedFilter = createCombinedFilter();
        const params: IAfterGuiAttachedParams = {};
        combinedFilter.afterGuiAttached(params);

        expect(setFilter.afterGuiAttached).toHaveBeenCalledTimes(1);
        expect(setFilter.afterGuiAttached).toHaveBeenCalledWith(params);
    });

    it('passes through to wrapped filter if it has afterGuiAttached function', () => {
        wrappedFilter = mock<IFilterComp>('getGui', 'afterGuiAttached');

        const combinedFilter = createCombinedFilter();
        const params: IAfterGuiAttachedParams = {};
        combinedFilter.afterGuiAttached(params);

        expect(wrappedFilter.afterGuiAttached).toHaveBeenCalledTimes(1);
        expect(wrappedFilter.afterGuiAttached).toHaveBeenCalledWith(params);
    });

    it('does not pass through to wrapped filter if afterGuiAttached function does not exist', () => {
        const combinedFilter = createCombinedFilter();
        const params: IAfterGuiAttachedParams = {};

        expect(() => combinedFilter.afterGuiAttached(params)).not.toThrow();
    });
});

describe('isFilterActive', () => {
    beforeEach(() => {
        wrappedFilter = mock<IFilterComp>('getGui', 'isFilterActive');
        setFilter = mock<SetFilter>('getGui', 'isFilterActive');
    });

    it('returns false if neither filter is active', () => {
        const combinedFilter = createCombinedFilter();

        expect(combinedFilter.isFilterActive()).toBe(false);
    });

    it('returns true if wrapped filter is active', () => {
        const combinedFilter = createCombinedFilter();

        wrappedFilter.isFilterActive.mockReturnValue(true);

        expect(combinedFilter.isFilterActive()).toBe(true);
    });

    it('returns true if set filter is active', () => {
        const combinedFilter = createCombinedFilter();

        setFilter.isFilterActive.mockReturnValue(true);

        expect(combinedFilter.isFilterActive()).toBe(true);
    });
});

describe('doesFilterPass', () => {
    beforeEach(() => {
        wrappedFilter = mock<IFilterComp>('getGui', 'isFilterActive', 'doesFilterPass');
        setFilter = mock<SetFilter>('getGui', 'isFilterActive', 'doesFilterPass');
    });

    it('returns true if neither filter is active', () => {
        const combinedFilter = createCombinedFilter();
        const params: IDoesFilterPassParams = { node: null, data: null };

        expect(combinedFilter.doesFilterPass(params)).toBe(true);
    });

    it('returns true if wrapped filter is active and passes', () => {
        const combinedFilter = createCombinedFilter();
        const params: IDoesFilterPassParams = { node: null, data: null };

        wrappedFilter.isFilterActive.mockReturnValue(true);
        wrappedFilter.doesFilterPass.mockReturnValue(true);

        expect(combinedFilter.doesFilterPass(params)).toBe(true);
    });

    it('returns false if wrapped filter is active and does not pass', () => {
        const combinedFilter = createCombinedFilter();
        const params: IDoesFilterPassParams = { node: null, data: null };

        wrappedFilter.isFilterActive.mockReturnValue(true);
        wrappedFilter.doesFilterPass.mockReturnValue(false);

        expect(combinedFilter.doesFilterPass(params)).toBe(false);
    });

    it('returns true if set filter is active and passes', () => {
        const combinedFilter = createCombinedFilter();
        const params: IDoesFilterPassParams = { node: null, data: null };

        setFilter.isFilterActive.mockReturnValue(true);
        setFilter.doesFilterPass.mockReturnValue(true);

        expect(combinedFilter.doesFilterPass(params)).toBe(true);
    });

    it('returns false if set filter is active and does not pass', () => {
        const combinedFilter = createCombinedFilter();
        const params: IDoesFilterPassParams = { node: null, data: null };

        setFilter.isFilterActive.mockReturnValue(true);
        setFilter.doesFilterPass.mockReturnValue(false);

        expect(combinedFilter.doesFilterPass(params)).toBe(false);
    });

    it('returns true if both filters are active and both pass', () => {
        const combinedFilter = createCombinedFilter();
        const params: IDoesFilterPassParams = { node: null, data: null };

        wrappedFilter.isFilterActive.mockReturnValue(true);
        wrappedFilter.doesFilterPass.mockReturnValue(true);
        setFilter.isFilterActive.mockReturnValue(true);
        setFilter.doesFilterPass.mockReturnValue(true);

        expect(combinedFilter.doesFilterPass(params)).toBe(true);
    });

    it('returns false if both filters are active and wrapped filter does not pass', () => {
        const combinedFilter = createCombinedFilter();
        const params: IDoesFilterPassParams = { node: null, data: null };

        wrappedFilter.isFilterActive.mockReturnValue(true);
        wrappedFilter.doesFilterPass.mockReturnValue(false);
        setFilter.isFilterActive.mockReturnValue(true);
        setFilter.doesFilterPass.mockReturnValue(true);

        expect(combinedFilter.doesFilterPass(params)).toBe(false);
    });

    it('returns false if both filters are active and set filter does not pass', () => {
        const combinedFilter = createCombinedFilter();
        const params: IDoesFilterPassParams = { node: null, data: null };

        wrappedFilter.isFilterActive.mockReturnValue(true);
        wrappedFilter.doesFilterPass.mockReturnValue(true);
        setFilter.isFilterActive.mockReturnValue(true);
        setFilter.doesFilterPass.mockReturnValue(false);

        expect(combinedFilter.doesFilterPass(params)).toBe(false);
    });
});

describe('getModelFromUi', () => {
    beforeEach(() => {
        wrappedFilter = mock<IFilterComp>('getGui', 'isFilterActive');
        setFilter = mock<SetFilter>('getGui', 'isFilterActive', 'getModelFromUi');
    });

    it('returns null if neither filter is active', () => {
        const combinedFilter = createCombinedFilter();

        expect(combinedFilter.getModelFromUi()).toBeNull();
    });

    it('includes model from wrapped filter', () => {
        const providedFilter = mock<ProvidedFilter>('getGui', 'isFilterActive', 'getModelFromUi');
        wrappedFilter = providedFilter;

        const combinedFilter = createCombinedFilter();
        const wrappedFilterModel: ProvidedFilterModel = { filterType: 'wrapped' };
        providedFilter.getModelFromUi.mockReturnValue(wrappedFilterModel);
        wrappedFilter.isFilterActive.mockReturnValue(true);

        expect(combinedFilter.getModelFromUi()).toStrictEqual<CombinedFilterModel>({
            filterType: 'combined',
            wrappedFilterModel,
            setFilterModel: null
        });
    });

    it('does not include model from wrapped filter if does not implement getModelFromUi', () => {
        const combinedFilter = createCombinedFilter();
        wrappedFilter.isFilterActive.mockReturnValue(true);

        expect(combinedFilter.getModelFromUi()).toStrictEqual<CombinedFilterModel>({
            filterType: 'combined',
            wrappedFilterModel: null,
            setFilterModel: null
        });
    });

    it('includes model from set filter', () => {
        const combinedFilter = createCombinedFilter();
        const setFilterModel: SetFilterModel = { filterType: 'set', values: [] };
        setFilter.getModelFromUi.mockReturnValue(setFilterModel);
        setFilter.isFilterActive.mockReturnValue(true);

        expect(combinedFilter.getModelFromUi()).toStrictEqual<CombinedFilterModel>({
            filterType: 'combined',
            wrappedFilterModel: null,
            setFilterModel
        });
    });
});

describe('getModel', () => {
    beforeEach(() => {
        wrappedFilter = mock<IFilterComp>('getGui', 'isFilterActive', 'getModel');
        setFilter = mock<SetFilter>('getGui', 'isFilterActive', 'getModel');
    });

    it('returns null if neither filter is active', () => {
        const combinedFilter = createCombinedFilter();

        expect(combinedFilter.getModelFromUi()).toBeNull();
    });

    it('includes model from wrapped filter', () => {
        const combinedFilter = createCombinedFilter();
        const wrappedFilterModel: ProvidedFilterModel = { filterType: 'wrapped' };
        wrappedFilter.getModel.mockReturnValue(wrappedFilterModel);
        wrappedFilter.isFilterActive.mockReturnValue(true);

        expect(combinedFilter.getModel()).toStrictEqual<CombinedFilterModel>({
            filterType: 'combined',
            wrappedFilterModel,
            setFilterModel: null
        });
    });

    it('includes model from set filter', () => {
        const combinedFilter = createCombinedFilter();
        const setFilterModel: SetFilterModel = { filterType: 'set', values: [] };
        setFilter.getModel.mockReturnValue(setFilterModel);
        setFilter.isFilterActive.mockReturnValue(true);

        expect(combinedFilter.getModel()).toStrictEqual<CombinedFilterModel>({
            filterType: 'combined',
            wrappedFilterModel: null,
            setFilterModel
        });
    });
});

describe('setModel', () => {
    beforeEach(() => {
        wrappedFilter = mock<IFilterComp>('getGui', 'isFilterActive', 'setModel');
        setFilter = mock<SetFilter>('getGui', 'isFilterActive', 'setModel');
        setFilter.setModel.mockReturnValue(Promise.resolve());
    });

    it('sets null on both filters if provided model is null', done => {
        const combinedFilter = createCombinedFilter();

        combinedFilter.setModel(null).then(() => {
            expect(wrappedFilter.setModel).toHaveBeenCalledTimes(1);
            expect(wrappedFilter.setModel).toHaveBeenCalledWith(null);
            expect(setFilter.setModel).toHaveBeenCalledTimes(1);
            expect(setFilter.setModel).toHaveBeenCalledWith(null);

            done();
        });
    });

    it('sets model on both filters if provided model is present', done => {
        const combinedFilter = createCombinedFilter();

        const model: CombinedFilterModel = {
            filterType: 'combined',
            wrappedFilterModel: { filterType: 'wrapped' },
            setFilterModel: { filterType: 'set', values: [] }
        };

        combinedFilter.setModel(model).then(() => {
            expect(wrappedFilter.setModel).toHaveBeenCalledTimes(1);
            expect(wrappedFilter.setModel).toHaveBeenCalledWith(model.wrappedFilterModel);
            expect(setFilter.setModel).toHaveBeenCalledTimes(1);
            expect(setFilter.setModel).toHaveBeenCalledWith(model.setFilterModel);

            done();
        });
    });
});

describe('getWrappedFilter', () => {
    it('returns wrapped filter', () => {
        const combinedFilter = createCombinedFilter();

        expect(combinedFilter.getWrappedFilter()).toBe(wrappedFilter);
    });
});

describe('getSetFilter', () => {
    it('returns set filter', () => {
        const combinedFilter = createCombinedFilter();

        expect(combinedFilter.getSetFilter()).toBe(setFilter);
    });
});

describe('onAnyFilterChanged', () => {
    beforeEach(() => {
        wrappedFilter = mock<IFilterComp>('getGui');
        setFilter = mock<SetFilter>('getGui', 'onAnyFilterChanged');
    });

    it('passes through to set filter', () => {
        const combinedFilter = createCombinedFilter();
        combinedFilter.onAnyFilterChanged();

        expect(setFilter.onAnyFilterChanged).toHaveBeenCalledTimes(1);
    });

    it('passes through to wrapped filter if it has onAnyFilterChanged function', () => {
        wrappedFilter = mock<IFilterComp>('getGui', 'onAnyFilterChanged');

        const combinedFilter = createCombinedFilter();
        combinedFilter.onAnyFilterChanged();

        expect(wrappedFilter.onAnyFilterChanged).toHaveBeenCalledTimes(1);
    });

    it('does not pass through to wrapped filter if onAnyFilterChanged function does not exist', () => {
        const combinedFilter = createCombinedFilter();

        expect(() => combinedFilter.onAnyFilterChanged()).not.toThrow();
    });
});

describe('onNewRowsLoaded', () => {
    beforeEach(() => {
        wrappedFilter = mock<IFilterComp>('getGui');
        setFilter = mock<SetFilter>('getGui', 'onNewRowsLoaded');
    });

    it('passes through to set filter', () => {
        const combinedFilter = createCombinedFilter();
        combinedFilter.onNewRowsLoaded();

        expect(setFilter.onNewRowsLoaded).toHaveBeenCalledTimes(1);
    });

    it('passes through to wrapped filter if it has onNewRowsLoaded function', () => {
        wrappedFilter = mock<IFilterComp>('getGui', 'onNewRowsLoaded');

        const combinedFilter = createCombinedFilter();

        combinedFilter.onNewRowsLoaded();

        expect(wrappedFilter.onNewRowsLoaded).toHaveBeenCalledTimes(1);
    });

    it('does not pass through to wrapped filter if onNewRowsLoaded function does not exist', () => {
        const combinedFilter = createCombinedFilter();

        expect(() => combinedFilter.onNewRowsLoaded()).not.toThrow();
    });
});

describe('onFloatingFilterChanged', () => {
    beforeEach(() => {
        wrappedFilter = mock<IFilterComp>('getGui');
        setFilter = mock<SetFilter>('getGui');
    });

    it('passes through to wrapped filter if it has onFloatingFilterChanged function', () => {
        const simpleFilter = mock<SimpleFilter<any>>('getGui', 'onFloatingFilterChanged');
        wrappedFilter = simpleFilter;

        const combinedFilter = createCombinedFilter();
        const type = 'type';
        const value = 'value';

        combinedFilter.onFloatingFilterChanged(type, value);

        expect(simpleFilter.onFloatingFilterChanged).toHaveBeenCalledTimes(1);
        expect(simpleFilter.onFloatingFilterChanged).toHaveBeenCalledWith(type, value);
    });

    it('does not pass through to wrapped filter if onFloatingFilterChanged function does not exist', () => {
        const combinedFilter = createCombinedFilter();

        expect(() => combinedFilter.onFloatingFilterChanged('type', 'value')).not.toThrow();
    });
});

describe('onFilterChanged', () => {
    beforeEach(() => {
        wrappedFilter = mock<IFilterComp>('getGui', 'isFilterActive', 'setModel');
        setFilter = mock<SetFilter>('getGui', 'isFilterActive', 'setModel', 'setModelIntoUi');
    });

    it('triggers filterChangedCallback from combined filter if wrapped filter changes', () => {
        const combinedFilterChangedCallback = jest.fn();

        createCombinedFilter({ filterChangedCallback: combinedFilterChangedCallback });

        const { filterChangedCallback } = userComponentFactory.newFilterComponent.mock.calls[0][1];

        filterChangedCallback();

        expect(combinedFilterChangedCallback).toHaveBeenCalledTimes(1);
    });

    it('triggers filterChangedCallback from combined filter if set filter changes', () => {
        const combinedFilterChangedCallback = jest.fn();

        createCombinedFilter({ filterChangedCallback: combinedFilterChangedCallback });

        const params = userComponentFactory.createUserComponentFromConcreteClass.mock.calls[0][1] as ISetFilterParams;
        const { filterChangedCallback } = params;

        filterChangedCallback();

        expect(combinedFilterChangedCallback).toHaveBeenCalledTimes(1);
    });

    it('triggers filterChangedCallback from combined filter if wrapped filter changes and both filters are enabled', () => {
        const combinedFilterChangedCallback = jest.fn();

        createCombinedFilter({ filterChangedCallback: combinedFilterChangedCallback, allowBothFiltersConcurrently: true });

        const { filterChangedCallback } = userComponentFactory.newFilterComponent.mock.calls[0][1];

        filterChangedCallback();

        expect(combinedFilterChangedCallback).toHaveBeenCalledTimes(1);
    });

    it('triggers filterChangedCallback from combined filter if set filter changes and both filters are enabled', () => {
        const combinedFilterChangedCallback = jest.fn();

        createCombinedFilter({ filterChangedCallback: combinedFilterChangedCallback, allowBothFiltersConcurrently: true });

        const params = userComponentFactory.createUserComponentFromConcreteClass.mock.calls[0][1] as ISetFilterParams;
        const { filterChangedCallback } = params;

        filterChangedCallback();

        expect(combinedFilterChangedCallback).toHaveBeenCalledTimes(1);
    });

    it('resets set filter if wrapped filter changes', () => {
        createCombinedFilter();

        const { filterChangedCallback } = userComponentFactory.newFilterComponent.mock.calls[0][1];
        setFilter.isFilterActive.mockReturnValue(true);

        filterChangedCallback();

        expect(setFilter.setModel).toHaveBeenCalledTimes(1);
        expect(setFilter.setModel).toHaveBeenCalledWith(null);
    });

    it('blanks set filter when wrapped filter is active and not using client-side row model', () => {
        rowModel.getType.mockReturnValue(Constants.ROW_MODEL_TYPE_SERVER_SIDE);

        createCombinedFilter();

        const { filterChangedCallback } = userComponentFactory.newFilterComponent.mock.calls[0][1];
        wrappedFilter.isFilterActive.mockReturnValue(true);

        filterChangedCallback();

        expect(setFilter.setModelIntoUi).toHaveBeenCalledTimes(1);
        expect(setFilter.setModelIntoUi).toHaveBeenCalledWith({ filterType: 'set', values: [] });
    });

    it('blanks set filter when wrapped filter is active and synchronisation is suppressed', () => {
        rowModel.getType.mockReturnValue(Constants.ROW_MODEL_TYPE_CLIENT_SIDE);

        createCombinedFilter({ suppressSynchronisation: true });

        const { filterChangedCallback } = userComponentFactory.newFilterComponent.mock.calls[0][1];
        wrappedFilter.isFilterActive.mockReturnValue(true);

        filterChangedCallback();

        expect(setFilter.setModelIntoUi).toHaveBeenCalledTimes(1);
        expect(setFilter.setModelIntoUi).toHaveBeenCalledWith({ filterType: 'set', values: [] });
    });

    it('ensures set filter state is reset when wrapped filter is no longer active', () => {
        createCombinedFilter();

        const { filterChangedCallback } = userComponentFactory.newFilterComponent.mock.calls[0][1];

        filterChangedCallback();

        expect(setFilter.setModelIntoUi).toHaveBeenCalledTimes(1);
        expect(setFilter.setModelIntoUi).toHaveBeenCalledWith(null);
    });

    it('does not change set filter if wrapped filter changes and both filters are allowed', () => {
        createCombinedFilter({ allowBothFiltersConcurrently: true });

        const { filterChangedCallback } = userComponentFactory.newFilterComponent.mock.calls[0][1];
        setFilter.isFilterActive.mockReturnValue(true);

        filterChangedCallback();

        expect(setFilter.setModel).toHaveBeenCalledTimes(0);
        expect(setFilter.setModelIntoUi).toHaveBeenCalledTimes(0);
    });

    it('resets wrapped filter if set filter changes', () => {
        createCombinedFilter();

        const params = userComponentFactory.createUserComponentFromConcreteClass.mock.calls[0][1] as ISetFilterParams;
        const { filterChangedCallback } = params;

        wrappedFilter.isFilterActive.mockReturnValue(true);

        filterChangedCallback();

        expect(wrappedFilter.setModel).toHaveBeenCalledTimes(1);
        expect(wrappedFilter.setModel).toHaveBeenCalledWith(null);
    });

    it('does not change wrapped filter if set filter changes and both filters are allowed', () => {
        createCombinedFilter({ allowBothFiltersConcurrently: true });

        const params = userComponentFactory.createUserComponentFromConcreteClass.mock.calls[0][1] as ISetFilterParams;
        const { filterChangedCallback } = params;

        wrappedFilter.isFilterActive.mockReturnValue(true);

        filterChangedCallback();

        expect(wrappedFilter.setModel).toHaveBeenCalledTimes(0);
    });
});