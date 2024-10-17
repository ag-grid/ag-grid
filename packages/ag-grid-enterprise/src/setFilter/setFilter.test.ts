import type {
    AgCheckbox,
    AgInputTextField,
    ColDef,
    Context,
    EventService,
    GridOptionsService,
    IClientSideRowModel,
    IColsService,
    IRowModel,
    LocaleService,
    SetFilterModel,
    SetFilterParams,
    ValueService,
} from 'ag-grid-community';

import { mock } from '../test-utils/mock';
import type { VirtualList } from '../widgets/virtualList';
import { SetFilter } from './setFilter';
import type { SetValueModel } from './setValueModel';

let rowModel: jest.Mocked<IRowModel>;
let eventService: jest.Mocked<EventService>;
let valueService: jest.Mocked<ValueService>;
let localeService: jest.Mocked<LocaleService>;
let context: jest.Mocked<Context>;
let eMiniFilter: jest.Mocked<AgInputTextField>;
let eGui: jest.Mocked<HTMLElement>;
let eSelectAll: jest.Mocked<AgCheckbox>;
let gridOptionsService: jest.Mocked<GridOptionsService>;
let rowGroupColsService: jest.Mocked<IColsService>;
let virtualList: jest.Mocked<VirtualList>;
let setValueModel: jest.Mocked<SetValueModel<string>>;

beforeEach(() => {
    rowModel = mock<IClientSideRowModel>('forEachLeafNode', 'isRowDataLoaded');

    eventService = mock<EventService>('addEventListener');

    valueService = mock<ValueService>('formatValue');
    valueService.formatValue.mockImplementation((_1, _2, value) => value);

    localeService = mock<LocaleService>('getLocaleTextFunc');
    localeService.getLocaleTextFunc.mockImplementation(() => (_: string, defaultValue: string) => defaultValue);

    context = mock<Context>('createBean');
    context.createBean.mockImplementation((bean) => bean);

    eMiniFilter = mock<AgInputTextField>(
        'getGui',
        'getValue',
        'setValue',
        'setDisplayed',
        'onValueChange',
        'getInputElement',
        'setInputAriaLabel'
    );
    eMiniFilter.getGui.mockImplementation(() => mock<HTMLElement>());
    eMiniFilter.getInputElement.mockImplementation(() => mock<HTMLInputElement>('addEventListener'));

    eGui = mock<HTMLElement>('querySelector', 'appendChild');
    eGui.querySelector.mockImplementation(() => mock<HTMLElement>('appendChild', 'addEventListener'));

    eSelectAll = mock<AgCheckbox>('setValue', 'getInputElement', 'onValueChange', 'setLabel');
    eSelectAll.getInputElement.mockImplementation(() => mock<HTMLInputElement>('addEventListener'));

    gridOptionsService = mock<GridOptionsService>('get', 'addPropertyEventListener');
    gridOptionsService.get.mockImplementation((prop) => (prop === 'rowModelType' ? 'clientSide' : undefined));

    rowGroupColsService = mock<IColsService>();
    rowGroupColsService.columns = [];

    virtualList = mock<VirtualList>('refresh');

    setValueModel = mock<SetValueModel<string>>(
        'getModel',
        'setAppliedModelKeys',
        'addToAppliedModelKeys',
        'isEverythingVisibleSelected',
        'showAddCurrentSelectionToFilter',
        'isAddCurrentSelectionToFilterChecked'
    );
});

function createSetFilter(filterParams?: any): SetFilter<unknown> {
    const colDef: ColDef = {};

    const params: SetFilterParams = {
        api: null,
        colDef,
        rowModel,
        column: { getId: () => '' },
        context: null,
        doesRowPassOtherFilter: () => true,
        filterChangedCallback: () => {},
        filterModifiedCallback: () => {},
        getValue: (node) => node.data.value,
        ...filterParams,
    };

    colDef.filterParams = params;

    const setFilter = new SetFilter();
    (setFilter as any).eventService = eventService;
    (setFilter as any).localeService = localeService;
    (setFilter as any).valueService = valueService;
    (setFilter as any).rowModel = rowModel;
    (setFilter as any).context = context;
    (setFilter as any).stubContext = context;
    (setFilter as any).eGui = eGui;
    (setFilter as any).eMiniFilter = eMiniFilter;
    (setFilter as any).eSelectAll = eSelectAll;
    (setFilter as any).gos = gridOptionsService;
    (setFilter as any).rowGroupColsService = rowGroupColsService;

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

    it.each(['windows', 'mac'])('will not apply model with zero values in %s Excel Mode', (excelMode) => {
        const setFilter = createSetFilter({ excelMode });

        setValueModel.getModel.mockReturnValue([]);
        setFilter.applyModel();

        expect(setFilter.getModel()).toBeNull();
    });

    it.each(['windows', 'mac'])(
        'preserves existing model if new model with zero values applied in %s Excel Mode',
        (excelMode) => {
            const setFilter = createSetFilter({ excelMode });
            const model = ['A', 'B'];

            setValueModel.getModel.mockReturnValue(model);
            setFilter.applyModel();

            expect((setFilter.getModel() as SetFilterModel).values).toStrictEqual(model);

            setValueModel.getModel.mockReturnValue(model);
            setFilter.applyModel();

            expect((setFilter.getModel() as SetFilterModel).values).toStrictEqual(model);
        }
    );

    it.each(['windows', 'mac'])('can reset model in %s Excel Mode', (excelMode) => {
        const setFilter = createSetFilter({ excelMode });
        const model = ['A', 'B'];

        setValueModel.getModel.mockReturnValue(model);
        setFilter.applyModel();

        expect((setFilter.getModel() as SetFilterModel).values).toStrictEqual(model);

        setValueModel.getModel.mockReturnValue(null);
        setFilter.applyModel();

        expect(setFilter.getModel()).toBeNull();
    });

    it.each(['windows', 'mac'])(
        'ensures any active filter is removed by selecting all values if all visible values are selected',
        (excelMode) => {
            setValueModel = mock<SetValueModel<string>>(
                'getModel',
                'setAppliedModelKeys',
                'addToAppliedModelKeys',
                'isEverythingVisibleSelected',
                'selectAllMatchingMiniFilter',
                'showAddCurrentSelectionToFilter',
                'isAddCurrentSelectionToFilterChecked'
            );

            const setFilter = createSetFilter({ excelMode });

            setValueModel.isEverythingVisibleSelected.mockReturnValue(true);
            setValueModel.getModel.mockReturnValue(null);

            setFilter.applyModel();

            expect(setValueModel.selectAllMatchingMiniFilter).toBeCalledTimes(1);
        }
    );
});
