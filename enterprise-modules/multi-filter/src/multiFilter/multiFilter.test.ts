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
    Context,
} from '@ag-grid-community/core';
import { mock } from '../test-utils/mock';
import { MenuItemComponent } from '@ag-grid-enterprise/menu';

let eGui: jest.Mocked<HTMLElement>;
let filterManager: jest.Mocked<FilterManager>;
let userComponentFactory: jest.Mocked<UserComponentFactory>;

let colDef: jest.Mocked<ColDef>;
let column: jest.Mocked<Column>;
let rowModel: jest.Mocked<IRowModel>;
let context: jest.Mocked<Context>;

let filter1: jest.Mocked<IFilterComp>;
let filter2: jest.Mocked<IFilterComp>;

function createFilter(filterParams: any = {}): MultiFilter {
    const baseFilterParams: IProvidedFilterParams = {
        api: null,
        column,
        colDef,
        rowModel,
        context,
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
    (multiFilter as any).context = context;

    multiFilter.init(params);

    return multiFilter;
}

beforeEach(() => {
    eGui = mock<HTMLElement>('appendChild');
    filterManager = mock<FilterManager>('createFilterParams');
    userComponentFactory = mock<UserComponentFactory>('newFilterComponent');
    context = mock<Context>('createBean');

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

    it('returns false if no filters are active', () => {
        const multiFilter = createFilter();

        expect(multiFilter.isFilterActive()).toBe(false);
    });

    it.each([[true, false], [false, true], [true, true]])
        ('returns true if any filters are active', (filter1active, filter2active) => {
            const multiFilter = createFilter();

            filter1.isFilterActive.mockReturnValue(filter1active);
            filter2.isFilterActive.mockReturnValue(filter2active);

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

        filter1.isFilterActive.mockReturnValue(true);
        filter1.doesFilterPass.mockReturnValue(true);

        filter2.isFilterActive.mockReturnValue(true);
        filter2.doesFilterPass.mockReturnValue(true);

        expect(multiFilter.doesFilterPass(params)).toBe(true);
    });

    it.each([[false, false], [true, false], [false, true]])
        ('returns false if any active filters do not pass', (filter1passes, filter2passes) => {
            const multiFilter = createFilter();
            const params: IDoesFilterPassParams = { node: null, data: null };

            filter1.isFilterActive.mockReturnValue(true);
            filter1.doesFilterPass.mockReturnValue(filter1passes);

            filter2.isFilterActive.mockReturnValue(true);
            filter2.doesFilterPass.mockReturnValue(filter2passes);

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
        const filterModel = { filterType: 'text' };
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
        const filterModel = { filterType: 'text' };
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
        const filterModel = { filterType: 'text' };
        filter1.getModel.mockReturnValue(filterModel);
        filter1.isFilterActive.mockReturnValue(true);

        expect(multiFilter.getModel()).toStrictEqual<IMultiFilterModel>({
            filterType: 'multi',
            filterModels: [filterModel, null],
        });
    });

    it('includes model from second filter', () => {
        const multiFilter = createFilter();
        const filterModel = { filterType: 'set', values: ['A', 'B', 'C'] };
        filter2.getModel.mockReturnValue(filterModel);
        filter2.isFilterActive.mockReturnValue(true);

        expect(multiFilter.getModel()).toStrictEqual<IMultiFilterModel>({
            filterType: 'multi',
            filterModels: [null, filterModel],
        });
    });

    it('includes model from both filters', () => {
        const multiFilter = createFilter();

        const filterModel1 = { filterType: 'text' };
        filter1.getModel.mockReturnValue(filterModel1);
        filter1.isFilterActive.mockReturnValue(true);

        const filterModel2 = { filterType: 'set', values: ['A', 'B', 'C'] };
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
        const filterModel1 = { filterType: 'text' };
        const filterModel2 = { filterType: 'set', values: ['A', 'B', 'C'] };

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
        const params: IAfterGuiAttachedParams = { container: 'columnMenu' };

        multiFilter.afterGuiAttached(params);

        expect(filter1.afterGuiAttached).toHaveBeenCalledTimes(1);
        expect(filter1.afterGuiAttached).toHaveBeenCalledWith(params);
        expect(filter2.afterGuiAttached).toHaveBeenCalledTimes(1);
        expect(filter2.afterGuiAttached).toHaveBeenCalledWith(params);
    });

    it('does not pass through to filter if afterGuiAttached function does not exist', () => {
        const multiFilter = createFilter();

        expect(() => multiFilter.afterGuiAttached({ container: 'columnMenu' })).not.toThrow();
    });

    it('presents the first filter then the second filter with a separator in-between', () => {
        const filter1Element = document.createElement('div');
        filter1Element.id = 'filter-1';
        filter1.getGui.mockReturnValue(filter1Element);

        const filter2Element = document.createElement('div');
        filter2Element.id = 'filter-2';
        filter2.getGui.mockReturnValue(filter2Element);

        const filter = createFilter();
        filter.afterGuiAttached({ container: 'columnMenu' });

        expect(eGui.appendChild).toHaveBeenCalledTimes(3);

        const { calls } = eGui.appendChild.mock;

        expect((calls[0][0] as HTMLElement)).toBe(filter1Element);
        expect((calls[1][0] as HTMLElement).outerHTML).toBe('<div class="ag-filter-separator"></div>');
        expect((calls[2][0] as HTMLElement)).toBe(filter2Element);
    });

    it('refreshes the UI if the container changes', () => {
        const filter1Element = document.createElement('div');
        filter1Element.id = 'filter-1';
        filter1.getGui.mockReturnValue(filter1Element);

        const filter2Element = document.createElement('div');
        filter2Element.id = 'filter-2';
        filter2.getGui.mockReturnValue(filter2Element);

        const filter = createFilter();
        filter.afterGuiAttached({ container: 'columnMenu' });
        filter.afterGuiAttached({ container: 'toolPanel' });

        expect(eGui.appendChild).toHaveBeenCalledTimes(6);
    });

    it('does not refresh the UI if the container does not change', () => {
        const filter1Element = document.createElement('div');
        filter1Element.id = 'filter-1';
        filter1.getGui.mockReturnValue(filter1Element);

        const filter2Element = document.createElement('div');
        filter2Element.id = 'filter-2';
        filter2.getGui.mockReturnValue(filter2Element);

        const filter = createFilter();
        filter.afterGuiAttached({ container: 'columnMenu' });
        filter.afterGuiAttached({ container: 'columnMenu' });

        expect(eGui.appendChild).toHaveBeenCalledTimes(3);
    });

    it('presents the filter inside a sub-menu if configured', () => {
        context.createBean.mockImplementation(bean => bean);

        const filter1Element = document.createElement('div');
        filter1Element.id = 'filter-1';
        filter1.getGui.mockReturnValue(filter1Element);

        const filter2Element = document.createElement('div');
        filter2Element.id = 'filter-2';
        filter2.getGui.mockReturnValue(filter2Element);

        const filter = createFilter({
            filters: [{
                filter: 'agTextColumnFilter',
                display: 'subMenu',
            }]
        });

        filter.afterGuiAttached({ container: 'columnMenu' });

        const { calls } = eGui.appendChild.mock;

        expect((calls[0][0] as HTMLElement).classList).toContain('ag-menu-option');
    });

    it('presents the filter inside an accordion if sub-menu is configured but filter is opened in tool panel', () => {
        context.createBean.mockImplementation(bean => bean);

        const filter1Element = document.createElement('div');
        filter1Element.id = 'filter-1';
        filter1.getGui.mockReturnValue(filter1Element);

        const filter2Element = document.createElement('div');
        filter2Element.id = 'filter-2';
        filter2.getGui.mockReturnValue(filter2Element);

        const filter = createFilter({
            filters: [{
                filter: 'agTextColumnFilter',
                display: 'subMenu',
            }]
        });

        filter.afterGuiAttached({ container: 'toolPanel' });

        const { calls } = eGui.appendChild.mock;

        expect((calls[0][0] as HTMLElement).classList).toContain('ag-multi-filter-group');
    });

    it('presents the filter inside an accordion if configured', () => {
        context.createBean.mockImplementation(bean => bean);

        const filter1Element = document.createElement('div');
        filter1Element.id = 'filter-1';
        filter1.getGui.mockReturnValue(filter1Element);

        const filter2Element = document.createElement('div');
        filter2Element.id = 'filter-2';
        filter2.getGui.mockReturnValue(filter2Element);

        const filter = createFilter({
            filters: [{
                filter: 'agTextColumnFilter',
                display: 'accordion',
            }]
        });

        filter.afterGuiAttached({ container: 'columnMenu' });

        const { calls } = eGui.appendChild.mock;

        expect((calls[0][0] as HTMLElement).classList).toContain('ag-multi-filter-group');
    });

    it('presents the filter inside an sub-menu with custom title if configured', () => {
        context.createBean.mockImplementation(bean => bean);

        const title = 'Filter Title';
        const filter1Element = document.createElement('div');
        filter1Element.id = 'filter-1';
        filter1.getGui.mockReturnValue(filter1Element);

        const filter2Element = document.createElement('div');
        filter2Element.id = 'filter-2';
        filter2.getGui.mockReturnValue(filter2Element);

        const filter = createFilter({
            filters: [{
                filter: 'agTextColumnFilter',
                display: 'subMenu',
                title
            }]
        });

        filter.afterGuiAttached({ container: 'columnMenu' });

        const { calls } = context.createBean.mock;

        expect((calls[0][0] as MenuItemComponent).getGui().getElementsByClassName('ag-menu-option-text')[0].innerHTML).toBe(title);
    });

    it('presents the filter inside an accordion with custom title if configured', () => {
        context.createBean.mockImplementation(bean => bean);

        const title = 'Filter Title';
        const filter1Element = document.createElement('div');
        filter1Element.id = 'filter-1';
        filter1.getGui.mockReturnValue(filter1Element);

        const filter2Element = document.createElement('div');
        filter2Element.id = 'filter-2';
        filter2.getGui.mockReturnValue(filter2Element);

        const filter = createFilter({
            filters: [{
                filter: 'agTextColumnFilter',
                display: 'accordion',
                title
            }]
        });

        filter.afterGuiAttached({ container: 'columnMenu' });

        const { calls } = context.createBean.mock;

        expect((calls[0][0] as any).title).toBe(title);
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

    it.each([0, 1])('triggers filterChangedCallback from multi filter if child filter changes', index => {
        const multiFilterChangedCallback = jest.fn();

        createFilter({ filterChangedCallback: multiFilterChangedCallback });

        const { filterChangedCallback } = userComponentFactory.newFilterComponent.mock.calls[index][1];

        filterChangedCallback();

        expect(multiFilterChangedCallback).toHaveBeenCalledTimes(1);
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
});
