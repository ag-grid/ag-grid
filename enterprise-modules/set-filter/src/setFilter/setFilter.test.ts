import {
    ColDef,
    Constants,
    IClientSideRowModel,
    ValueFormatterService,
    ISetFilterParams,
    Context,
    AgInputTextField,
    AgCheckbox,
    GridOptionsWrapper,
    EventService,
    VirtualList,
    IRowModel,
    Promise,
    RowNode,
    IDoesFilterPassParams,
} from '@ag-grid-community/core';
import { mock } from '../test-utils/mock';
import { SetFilter } from './setFilter';
import { SetValueModel } from './setValueModel';
import { SetFilterModel } from './setFilterModel';

let rowModel: jest.Mocked<IRowModel>;
let eventService: jest.Mocked<EventService>;
let valueFormatterService: jest.Mocked<ValueFormatterService>;
let gridOptionsWrapper: jest.Mocked<GridOptionsWrapper>;
let context: jest.Mocked<Context>;
let eMiniFilter: jest.Mocked<AgInputTextField>;
let eGui: jest.Mocked<HTMLElement>;
let eSelectAll: jest.Mocked<AgCheckbox>;
let virtualList: jest.Mocked<VirtualList>;
let setValueModel: jest.Mocked<SetValueModel>;

beforeEach(() => {
    rowModel = mock<IClientSideRowModel>('getType', 'forEachLeafNode');
    rowModel.getType.mockReturnValue(Constants.ROW_MODEL_TYPE_CLIENT_SIDE);

    eventService = mock<EventService>('addEventListener');

    valueFormatterService = mock<ValueFormatterService>('formatValue');
    valueFormatterService.formatValue.mockImplementation((_1, _2, _3, value) => value);

    gridOptionsWrapper = mock<GridOptionsWrapper>('getLocaleTextFunc', 'isEnableOldSetFilterModel');
    gridOptionsWrapper.getLocaleTextFunc.mockImplementation(() => ((_: string, defaultValue: string) => defaultValue));

    context = mock<Context>('createBean');
    context.createBean.mockImplementation(bean => bean);

    eMiniFilter = mock<AgInputTextField>('getGui', 'getValue', 'setValue', 'onValueChange', 'getInputElement', 'setInputAriaLabel');
    eMiniFilter.getGui.mockImplementation(() => mock<HTMLElement>());
    eMiniFilter.getInputElement.mockImplementation(() => mock<HTMLInputElement>('addEventListener'));

    eGui = mock<HTMLElement>('querySelector', 'appendChild');
    eGui.querySelector.mockImplementation(() => mock<HTMLElement>('appendChild', 'addEventListener'));

    eSelectAll = mock<AgCheckbox>('setValue', 'getInputElement', 'onValueChange', 'setLabel');
    eSelectAll.getInputElement.mockImplementation(() => mock<HTMLInputElement>('addEventListener'));
    virtualList = mock<VirtualList>('refresh');

    setValueModel = mock<SetValueModel>('getModel', 'isEverythingVisibleSelected');
});

function createSetFilter(filterParams?: any): SetFilter {
    const colDef: ColDef = {};

    const params: ISetFilterParams = {
        api: null,
        colDef,
        rowModel,
        column: null,
        context: null,
        doesRowPassOtherFilter: () => true,
        filterChangedCallback: () => { },
        filterModifiedCallback: () => { },
        valueGetter: node => node.data.value,
        ...filterParams,
    };

    colDef.filterParams = params;

    const setFilter = new SetFilter();
    setFilter['eventService'] = eventService;
    setFilter['gridOptionsWrapper'] = gridOptionsWrapper;
    setFilter['valueFormatterService'] = valueFormatterService;
    setFilter['rowModel'] = rowModel;
    setFilter['context'] = context;
    setFilter['eGui'] = eGui;
    setFilter['eMiniFilter'] = eMiniFilter;
    setFilter['eSelectAll'] = eSelectAll;

    setFilter.setParams(params);

    setFilter['virtualList'] = virtualList;
    setFilter['valueModel'] = setValueModel;

    return setFilter;
}

describe('applyModel', () => {
    it('returns false if nothing has changed', () => {
        const setFilter = createSetFilter();

        expect(setFilter.applyModel()).toBe(false);
    });

    it('returns true if something has changed', () => {
        const setFilter = createSetFilter();

        setValueModel.getModel.mockReturnValue(['A']);

        expect(setFilter.applyModel()).toBe(true);
    });

    it('can apply empty model', () => {
        const setFilter = createSetFilter();

        setValueModel.getModel.mockReturnValue([]);
        setFilter.applyModel();

        expect((setFilter.getModel() as SetFilterModel).values).toStrictEqual([]);
    });

    it.each(['windows', 'mac'])('will not apply model with zero values in %s Excel Mode', excelMode => {
        const setFilter = createSetFilter({ excelMode });

        setValueModel.getModel.mockReturnValue([]);
        setFilter.applyModel();

        expect(setFilter.getModel()).toBeNull();
    });

    it.each(['windows', 'mac'])('preserves existing model if new model with zero values applied in %s Excel Mode', excelMode => {
        const setFilter = createSetFilter({ excelMode });
        const model = ['A', 'B'];

        setValueModel.getModel.mockReturnValue(model);
        setFilter.applyModel();

        expect((setFilter.getModel() as SetFilterModel).values).toStrictEqual(model);

        setValueModel.getModel.mockReturnValue(model);
        setFilter.applyModel();

        expect((setFilter.getModel() as SetFilterModel).values).toStrictEqual(model);
    });

    it.each(['windows', 'mac'])('can reset model in %s Excel Mode', excelMode => {
        const setFilter = createSetFilter({ excelMode });
        const model = ['A', 'B'];

        setValueModel.getModel.mockReturnValue(model);
        setFilter.applyModel();

        expect((setFilter.getModel() as SetFilterModel).values).toStrictEqual(model);

        setValueModel.getModel.mockReturnValue(null);
        setFilter.applyModel();

        expect(setFilter.getModel()).toBeNull();
    });

    it.each(['windows', 'mac'])('ensures any active filter is removed by selecting all values if all visible values are selected', excelMode => {
        setValueModel = mock<SetValueModel>('getModel', 'isEverythingVisibleSelected', 'selectAllMatchingMiniFilter');
        const setFilter = createSetFilter({ excelMode });

        setValueModel.isEverythingVisibleSelected.mockReturnValue(true);
        setValueModel.getModel.mockReturnValue(null);

        setFilter.applyModel();

        expect(setValueModel.selectAllMatchingMiniFilter).toBeCalledTimes(1);
    });
});

describe('onSiblingFilterChanged', () => {
    beforeEach(() => {
        setValueModel = mock<SetValueModel>(
            'getModel', 'setModel', 'getMiniFilter', 'setMiniFilter', 'isEverythingVisibleSelected');
        setValueModel.setModel.mockReturnValue(Promise.resolve());
        setValueModel.isEverythingVisibleSelected.mockReturnValue(true);
    });

    it('blanks set filter when sibling filter is active and set filter is not using client-side row model', () => {
        rowModel.getType.mockReturnValue(Constants.ROW_MODEL_TYPE_SERVER_SIDE);

        const setFilter = createSetFilter({ values: ['A', 'B', 'C'], doesRowPassSiblingFilters: () => true });

        setFilter.onSiblingFilterChanged(true);

        expect(setValueModel.setModel).toHaveBeenCalledTimes(1);
        expect(setValueModel.setModel).toHaveBeenCalledWith([]);
    });

    it('sets state to select values that pass sibling filters', () => {
        const values = ['A', 'B', 'C'];

        (rowModel as jest.Mocked<IClientSideRowModel>).forEachLeafNode
            .mockImplementation((callback: (node: RowNode, index: number) => void) => {
                const nodes = values.map(v => ({ data: { value: v } }));
                nodes.forEach(callback);
            });

        const setFilter = createSetFilter({ doesRowPassSiblingFilters: (params: IDoesFilterPassParams) => params.data.value === 'B' });

        setFilter.onSiblingFilterChanged(true);

        expect(setValueModel.setModel).toHaveBeenCalledTimes(1);
        expect(setValueModel.setModel).toHaveBeenCalledWith(['B']);
    });

    it('ensures set filter state is reset when sibling filter is no longer active', () => {
        const setFilter = createSetFilter({ doesRowPassSiblingFilters: () => true });

        setFilter.onSiblingFilterChanged(false);

        expect(setValueModel.setModel).toHaveBeenCalledTimes(1);
        expect(setValueModel.setModel).toHaveBeenCalledWith(null);
    });

    it('does nothing if suppressSyncOnSiblingFilterChange is true', () => {
        const values = ['A', 'B', 'C'];

        (rowModel as jest.Mocked<IClientSideRowModel>).forEachLeafNode
            .mockImplementation((callback: (node: RowNode, index: number) => void) => {
                const nodes = values.map(v => ({ data: { value: v } }));
                nodes.forEach(callback);
            });

        const setFilter = createSetFilter({
            doesRowPassSiblingFilters: (params: IDoesFilterPassParams) => params.data.value === 'B',
            suppressSyncOnSiblingFilterChange: true,
        });

        setFilter.onSiblingFilterChanged(true);

        expect(setValueModel.setModel).not.toHaveBeenCalled();
    });
});