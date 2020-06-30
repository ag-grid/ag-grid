import {
    RowNode,
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
} from '@ag-grid-community/core';
import { mock } from '../test-utils/mock';
import { SetFilter } from './setFilter';
import { SetValueModel } from './setValueModel';
import { SetFilterModel } from './setFilterModel';

function createSetFilter(setValueModel?: SetValueModel, filterParams?: any): SetFilter {
    const colDef: ColDef = {};

    const rowModel = {
        getType: () => Constants.ROW_MODEL_TYPE_CLIENT_SIDE,
        forEachLeafNode: _ => { }
    } as IClientSideRowModel;

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

    const eventService = mock<EventService>('addEventListener');

    const valueFormatterService = mock<ValueFormatterService>('formatValue');
    valueFormatterService.formatValue.mockImplementation((_1, _2, _3, value) => value);

    const gridOptionsWrapper = mock<GridOptionsWrapper>('getLocaleTextFunc', 'isEnableOldSetFilterModel');
    gridOptionsWrapper.getLocaleTextFunc.mockImplementation(() => ((_: string, defaultValue: string) => defaultValue));

    const context = mock<Context>('createBean');
    context.createBean.mockImplementation((bean) => bean);

    const eMiniFilter = mock<AgInputTextField>('getGui', 'setValue', 'onValueChange', 'getInputElement');
    eMiniFilter.getGui.mockImplementation(() => mock<HTMLElement>());
    eMiniFilter.getInputElement.mockImplementation(() => mock<HTMLInputElement>('addEventListener'));

    const eGui = mock<HTMLElement>('querySelector', 'appendChild');
    eGui.querySelector.mockImplementation(() => mock<HTMLElement>('appendChild', 'addEventListener'));

    const eSelectAll = mock<AgCheckbox>('setValue', 'getInputElement', 'onValueChange');
    eSelectAll.getInputElement.mockImplementation(() => mock<HTMLInputElement>('addEventListener'));

    const eSelectAllLabel = mock<HTMLElement>();

    const setFilter = new SetFilter();
    setFilter['eventService'] = eventService;
    setFilter['gridOptionsWrapper'] = gridOptionsWrapper;
    setFilter['valueFormatterService'] = valueFormatterService;
    setFilter['rowModel'] = rowModel;
    setFilter['context'] = context;
    setFilter['eGui'] = eGui;
    setFilter['eMiniFilter'] = eMiniFilter;
    setFilter['eSelectAll'] = eSelectAll;
    setFilter['eSelectAllLabel'] = eSelectAllLabel;
    setFilter.setParams(params);

    const virtualList = mock<VirtualList>('refresh');
    setFilter['virtualList'] = virtualList;

    if (setValueModel) {
        setFilter['valueModel'] = setValueModel;
    }

    return setFilter;
}

describe('applyModel', () => {
    it('returns false if nothing has changed', () => {
        const setValueModel = mock<SetValueModel>('getModel', 'isEverythingVisibleSelected');
        const setFilter = createSetFilter(setValueModel);

        expect(setFilter.applyModel()).toBe(false);
    });

    it('returns true if something has changed', () => {
        const setValueModel = mock<SetValueModel>('getModel', 'isEverythingVisibleSelected');
        const setFilter = createSetFilter(setValueModel);

        setValueModel.getModel.mockReturnValue(['A']);

        expect(setFilter.applyModel()).toBe(true);
    });

    it('can apply empty model', () => {
        const setValueModel = mock<SetValueModel>('getModel', 'isEverythingVisibleSelected');
        const setFilter = createSetFilter(setValueModel);

        setValueModel.getModel.mockReturnValue([]);
        setFilter.applyModel();

        expect((setFilter.getModel() as SetFilterModel).values).toStrictEqual([]);
    });

    it.each(['windows', 'mac'])('will not apply model with zero values in %s Excel Mode', excelMode => {
        const setValueModel = mock<SetValueModel>('getModel', 'isEverythingVisibleSelected');
        const setFilter = createSetFilter(setValueModel, { excelMode });

        setValueModel.getModel.mockReturnValue([]);
        setFilter.applyModel();

        expect(setFilter.getModel()).toBeNull();
    });

    it.each(['windows', 'mac'])('preserves existing model if new model with zero values applied in %s Excel Mode', excelMode => {
        const setValueModel = mock<SetValueModel>('getModel', 'isEverythingVisibleSelected');
        const setFilter = createSetFilter(setValueModel, { excelMode });
        const model = ['A', 'B'];

        setValueModel.getModel.mockReturnValue(model);
        setFilter.applyModel();

        expect((setFilter.getModel() as SetFilterModel).values).toStrictEqual(model);

        setValueModel.getModel.mockReturnValue(model);
        setFilter.applyModel();

        expect((setFilter.getModel() as SetFilterModel).values).toStrictEqual(model);
    });

    it.each(['windows', 'mac'])('can reset model in %s Excel Mode', excelMode => {
        const setValueModel = mock<SetValueModel>('getModel', 'isEverythingVisibleSelected');
        const setFilter = createSetFilter(setValueModel, { excelMode });
        const model = ['A', 'B'];

        setValueModel.getModel.mockReturnValue(model);
        setFilter.applyModel();

        expect((setFilter.getModel() as SetFilterModel).values).toStrictEqual(model);

        setValueModel.getModel.mockReturnValue(null);
        setFilter.applyModel();

        expect(setFilter.getModel()).toBeNull();
    });

    it.each(['windows', 'mac'])('ensures any active filter is removed by selecting all values if all visible values are selected', excelMode => {
        const setValueModel = mock<SetValueModel>('getModel', 'isEverythingVisibleSelected', 'selectAllMatchingMiniFilter');
        const setFilter = createSetFilter(setValueModel, { excelMode });

        setValueModel.isEverythingVisibleSelected.mockReturnValue(true);
        setValueModel.getModel.mockReturnValue(null);

        setFilter.applyModel();

        expect(setValueModel.selectAllMatchingMiniFilter).toBeCalledTimes(1);
    });
});