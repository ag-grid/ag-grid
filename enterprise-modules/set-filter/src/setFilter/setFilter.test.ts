import {
    ColDef,
    IClientSideRowModel,
    ValueFormatterService,
    ISetFilterParams,
    Context,
    AgInputTextField,
    AgCheckbox,
    EventService,
    VirtualList,
    IRowModel,
    SetFilterModel,
    LocaleService
} from '@ag-grid-community/core';
import { mock } from '../test-utils/mock';
import { SetFilter } from './setFilter';
import { SetValueModel } from './setValueModel';

let rowModel: jest.Mocked<IRowModel>;
let eventService: jest.Mocked<EventService>;
let valueFormatterService: jest.Mocked<ValueFormatterService>;
let localeService: jest.Mocked<LocaleService>;
let context: jest.Mocked<Context>;
let eMiniFilter: jest.Mocked<AgInputTextField>;
let eGui: jest.Mocked<HTMLElement>;
let eSelectAll: jest.Mocked<AgCheckbox>;
let virtualList: jest.Mocked<VirtualList>;
let setValueModel: jest.Mocked<SetValueModel<string>>;

beforeEach(() => {
    rowModel = mock<IClientSideRowModel>('getType', 'forEachLeafNode');
    rowModel.getType.mockReturnValue('clientSide');

    eventService = mock<EventService>('addEventListener');

    valueFormatterService = mock<ValueFormatterService>('formatValue');
    valueFormatterService.formatValue.mockImplementation((_1, _2, value) => value);

    localeService = mock<LocaleService>('getLocaleTextFunc');
    localeService.getLocaleTextFunc.mockImplementation(() => ((_: string, defaultValue: string) => defaultValue));

    context = mock<Context>('createBean');
    context.createBean.mockImplementation(bean => bean);

    eMiniFilter = mock<AgInputTextField>('getGui', 'getValue', 'setValue', 'setDisplayed', 'onValueChange', 'getInputElement', 'setInputAriaLabel');
    eMiniFilter.getGui.mockImplementation(() => mock<HTMLElement>());
    eMiniFilter.getInputElement.mockImplementation(() => mock<HTMLInputElement>('addEventListener'));

    eGui = mock<HTMLElement>('querySelector', 'appendChild');
    eGui.querySelector.mockImplementation(() => mock<HTMLElement>('appendChild', 'addEventListener'));

    eSelectAll = mock<AgCheckbox>('setValue', 'getInputElement', 'onValueChange', 'setLabel');
    eSelectAll.getInputElement.mockImplementation(() => mock<HTMLInputElement>('addEventListener'));
    virtualList = mock<VirtualList>('refresh');

    setValueModel = mock<SetValueModel<string>>('getModel', 'isEverythingVisibleSelected');
});

function createSetFilter(filterParams?: any): SetFilter<unknown> {
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
        valueGetter: ({node}) => node.data.value,
        ...filterParams,
    };

    colDef.filterParams = params;

    const setFilter = new SetFilter();
    (setFilter as any).eventService = eventService;
    (setFilter as any).localeService = localeService;
    (setFilter as any).valueFormatterService = valueFormatterService;
    (setFilter as any).rowModel = rowModel;
    (setFilter as any).context = context;
    (setFilter as any).eGui = eGui;
    (setFilter as any).eMiniFilter = eMiniFilter;
    (setFilter as any).eSelectAll = eSelectAll;

    setFilter.setParams(params);

    (setFilter as any).virtualList = virtualList;
    (setFilter as any).valueModel = setValueModel;

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
        setValueModel = mock<SetValueModel<string>>('getModel', 'isEverythingVisibleSelected', 'selectAllMatchingMiniFilter');
        const setFilter = createSetFilter({ excelMode });

        setValueModel.isEverythingVisibleSelected.mockReturnValue(true);
        setValueModel.getModel.mockReturnValue(null);

        setFilter.applyModel();

        expect(setValueModel.selectAllMatchingMiniFilter).toBeCalledTimes(1);
    });
});
