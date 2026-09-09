import { getByTestId } from '@testing-library/dom';
import {
    ColumnFilterHarness,
    TestGridsManager,
    asyncSetTimeout,
    installFilterLayoutMock,
    uninstallFilterLayoutMock,
} from 'ag-test-utils';

import type { GridApi } from 'ag-grid-community';
import {
    ClientSideRowModelModule,
    DateFilterModule,
    TextFilterModule,
    agTestIdFor,
    getGridElement,
    setupAgTestIds,
} from 'ag-grid-community';
import { ColumnsToolPanelModule, FiltersToolPanelModule, SetFilterModule } from 'ag-grid-enterprise';

const ROW_DATA = [{ country: 'Ireland' }, { country: 'Italy' }];

/**
 * Cross-surface coverage for the `browserAutoComplete` params: each user-facing input surface can
 * override `enableInputAutoComplete` individually, and omitting the param defers to the option.
 */
describe('browserAutoComplete params', () => {
    const gridsManager = new TestGridsManager({
        modules: [
            ClientSideRowModelModule,
            DateFilterModule,
            TextFilterModule,
            SetFilterModule,
            FiltersToolPanelModule,
            ColumnsToolPanelModule,
        ],
    });

    beforeAll(() => {
        setupAgTestIds();
        installFilterLayoutMock();
    });
    afterAll(() => uninstallFilterLayoutMock());
    afterEach(() => gridsManager.reset());

    test('filterParams overrides the option on filter body inputs and omitting defers', async () => {
        const api: GridApi = await gridsManager.createGridAndWait('grid1', {
            columnDefs: [
                { field: 'country', filter: 'agTextColumnFilter', filterParams: { browserAutoComplete: 'name' } },
                { colId: 'plain', field: 'country', filter: 'agTextColumnFilter' },
            ],
            rowData: ROW_DATA,
            enableInputAutoComplete: true,
        });

        const overridden = await ColumnFilterHarness.open(api, 'country');
        expect(overridden.input('text').getAttribute('autocomplete')).toBe('name');

        const deferring = await ColumnFilterHarness.open(api, 'plain');
        expect(deferring.input('text').getAttribute('autocomplete')).toBeNull();

        api.setGridOption('enableInputAutoComplete', false);
        expect(deferring.input('text').getAttribute('autocomplete')).toBe('off');
    });

    test('boolean overrides win in both directions and survive option toggles', async () => {
        const api: GridApi = await gridsManager.createGridAndWait('grid1', {
            columnDefs: [
                {
                    colId: 'on',
                    field: 'country',
                    filter: 'agTextColumnFilter',
                    filterParams: { browserAutoComplete: true },
                },
                {
                    colId: 'off',
                    field: 'country',
                    filter: 'agTextColumnFilter',
                    filterParams: { browserAutoComplete: false },
                },
            ],
            rowData: ROW_DATA,
            enableInputAutoComplete: false,
        });

        // option off, param true: enabled individually
        const enabled = await ColumnFilterHarness.open(api, 'on');
        expect(enabled.input('text').getAttribute('autocomplete')).toBeNull();

        // option on, param false: disabled individually
        api.setGridOption('enableInputAutoComplete', true);
        const disabled = await ColumnFilterHarness.open(api, 'off');
        expect(disabled.input('text').getAttribute('autocomplete')).toBe('off');

        // overrides are pinned: further option toggles change neither
        api.setGridOption('enableInputAutoComplete', false);
        const enabledAgain = await ColumnFilterHarness.open(api, 'on');
        expect(enabledAgain.input('text').getAttribute('autocomplete')).toBeNull();
        const disabledAgain = await ColumnFilterHarness.open(api, 'off');
        expect(disabledAgain.input('text').getAttribute('autocomplete')).toBe('off');
    });

    test('floating filter inputs inherit filterParams unless floatingFilterComponentParams overrides', async () => {
        const api: GridApi = await gridsManager.createGridAndWait('grid1', {
            columnDefs: [
                {
                    field: 'country',
                    filter: 'agTextColumnFilter',
                    floatingFilter: true,
                    filterParams: { browserAutoComplete: 'country-name' },
                },
                {
                    colId: 'both',
                    field: 'country',
                    filter: 'agTextColumnFilter',
                    floatingFilter: true,
                    filterParams: { browserAutoComplete: 'country-name' },
                    floatingFilterComponentParams: { browserAutoComplete: false },
                },
            ],
            rowData: ROW_DATA,
        });
        await asyncSetTimeout(0);

        const gridDiv = getGridElement(api)! as HTMLElement;
        const inherited = getByTestId(
            gridDiv,
            agTestIdFor.textFilterInstanceInput({ source: 'floating-filter', colId: 'country' })
        ) as HTMLInputElement;
        expect(inherited.getAttribute('autocomplete')).toBe('country-name');

        const overridden = getByTestId(
            gridDiv,
            agTestIdFor.textFilterInstanceInput({ source: 'floating-filter', colId: 'both' })
        ) as HTMLInputElement;
        expect(overridden.getAttribute('autocomplete')).toBe('off');
    });

    test('set filter mini filter honours filterParams.browserAutoComplete', async () => {
        const api: GridApi = await gridsManager.createGridAndWait('grid1', {
            columnDefs: [
                { field: 'country', filter: 'agSetColumnFilter', filterParams: { browserAutoComplete: true } },
            ],
            rowData: ROW_DATA,
        });

        await ColumnFilterHarness.open(api, 'country');
        const miniFilterInput = document.querySelector<HTMLInputElement>('.ag-mini-filter input[type="text"]')!;
        expect(miniFilterInput.getAttribute('autocomplete')).toBeNull();
    });

    test('date inputs re-apply browserAutoComplete on filter params updates', async () => {
        const dateColumn = {
            field: 'when',
            filter: 'agDateColumnFilter',
            floatingFilter: true,
            filterParams: { browserAutoComplete: 'bday' },
        };
        const api: GridApi = await gridsManager.createGridAndWait('grid1', {
            columnDefs: [dateColumn],
            rowData: [{ when: new Date(2020, 0, 1) }],
        });
        await asyncSetTimeout(0);

        const gridDiv = getGridElement(api)! as HTMLElement;
        const dateInput = gridDiv.querySelector<HTMLInputElement>('.ag-floating-filter .ag-date-filter input')!;
        expect(dateInput.getAttribute('autocomplete')).toBe('bday');

        api.setGridOption('columnDefs', [{ ...dateColumn, filterParams: {} }]);
        await asyncSetTimeout(0);
        expect(dateInput.getAttribute('autocomplete')).toBe('off');
    });

    test('tool panel search inputs honour toolPanelParams.browserAutoComplete', async () => {
        const api: GridApi = await gridsManager.createGridAndWait('grid1', {
            columnDefs: [{ field: 'country', filter: 'agTextColumnFilter' }],
            rowData: ROW_DATA,
            sideBar: {
                toolPanels: [
                    {
                        id: 'filters',
                        labelDefault: 'Filters',
                        labelKey: 'filters',
                        iconKey: 'filter',
                        toolPanel: 'agFiltersToolPanel',
                        toolPanelParams: { browserAutoComplete: true },
                    },
                    {
                        id: 'columns',
                        labelDefault: 'Columns',
                        labelKey: 'columns',
                        iconKey: 'columns',
                        toolPanel: 'agColumnsToolPanel',
                        toolPanelParams: { browserAutoComplete: 'off-the-record' },
                    },
                ],
                defaultToolPanel: 'filters',
            },
        });
        await asyncSetTimeout(0);

        const gridDiv = getGridElement(api)! as HTMLElement;
        const filtersSearch = gridDiv.querySelector<HTMLInputElement>('.ag-filter-toolpanel-search input')!;
        expect(filtersSearch.getAttribute('autocomplete')).toBeNull();

        api.openToolPanel('columns');
        await asyncSetTimeout(0);
        const columnsSearch = gridDiv.querySelector<HTMLInputElement>('.ag-column-select-header-filter-wrapper input')!;
        expect(columnsSearch.getAttribute('autocomplete')).toBe('off-the-record');
    });
});
