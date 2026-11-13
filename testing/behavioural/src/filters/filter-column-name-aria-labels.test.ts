import { findByTestId, waitFor } from '@testing-library/dom';
import {
    ColumnFilterHarness,
    TestGridsManager,
    installFilterLayoutMock,
    uninstallFilterLayoutMock,
} from 'ag-test-utils';

import type { ColDef, GridApi } from 'ag-grid-community';
import {
    ClientSideRowModelModule,
    ColumnApiModule,
    DateFilterModule,
    NumberFilterModule,
    TextFilterModule,
    agTestIdFor,
    getGridElement,
    setupAgTestIds,
} from 'ag-grid-community';

/**
 * The floating filter button, the filter popup and the controls inside it name the column they filter,
 * so a screen reader user tabbing between columns hears which one each control belongs to.
 */
describe('Filter controls name their column', () => {
    const gridsManager = new TestGridsManager({
        modules: [ClientSideRowModelModule, ColumnApiModule, DateFilterModule, NumberFilterModule, TextFilterModule],
    });

    beforeAll(() => {
        setupAgTestIds();
        installFilterLayoutMock();
    });
    afterAll(() => uninstallFilterLayoutMock());
    afterEach(() => gridsManager.reset());

    const ROW_DATA = [{ value: 'Ireland', total: 3, awarded: '2024-01-01' }];

    const floatingFilterButtonLabel = async (api: GridApi, colId: string) => {
        const button = await findByTestId(getGridElement(api)! as HTMLElement, agTestIdFor.floatingFilterButton(colId));
        return button.getAttribute('aria-label');
    };
    const popup = () => document.querySelector<HTMLElement>('.ag-filter-menu')!;
    const operatorLabel = () =>
        popup().querySelector('.ag-filter-select .ag-picker-field-wrapper')!.getAttribute('aria-label');

    test.each<[string, ColDef, 'text' | 'date']>([
        ['text', { field: 'value', filter: 'agTextColumnFilter' }, 'text'],
        ['date', { field: 'awarded', filter: 'agDateColumnFilter', cellDataType: 'dateString' }, 'date'],
    ])('%s filter', async (_name, colDef, inputType) => {
        const api = await gridsManager.createGridAndWait('grid1', {
            columnDefs: [{ ...colDef, headerName: 'Country', floatingFilter: true }],
            rowData: ROW_DATA,
        });
        const colId = colDef.field!;
        expect(await floatingFilterButtonLabel(api, colId)).toBe('Open Country Filter Menu');

        const harness = await ColumnFilterHarness.open(api, colId, 'floatingFilter');

        expect(popup().getAttribute('aria-label')).toBe('Country Column Filter');
        expect(operatorLabel()).toBe('Country Filtering Operator');
        expect(harness.input(inputType).getAttribute('aria-label')).toBe('Country Filter Value');
    });

    test('range inputs name the column on both ends', async () => {
        const api = await gridsManager.createGridAndWait('grid1', {
            columnDefs: [{ field: 'total', filter: 'agNumberColumnFilter' }],
            rowData: ROW_DATA,
        });
        const harness = await ColumnFilterHarness.open(api, 'total');
        await harness.selectOperator('Between');

        expect(harness.inputs('number').map((input) => input.getAttribute('aria-label'))).toEqual([
            'Total Filter from value',
            'Total Filter to value',
        ]);
    });

    test.each<[string, (api: GridApi) => void]>([
        ['column state', (api) => api.applyColumnState({ state: [{ colId: 'value', headerName: 'Nation' }] })],
        [
            'column definition',
            (api) =>
                api.setGridOption('columnDefs', [
                    { field: 'value', headerName: 'Nation', filter: 'agTextColumnFilter', floatingFilter: true },
                ]),
        ],
    ])('labels follow a rename through the %s', async (_name, rename) => {
        const api = await gridsManager.createGridAndWait('grid1', {
            columnDefs: [{ field: 'value', headerName: 'Country', filter: 'agTextColumnFilter', floatingFilter: true }],
            rowData: ROW_DATA,
        });
        const harness = await ColumnFilterHarness.open(api, 'value', 'floatingFilter');
        expect(operatorLabel()).toBe('Country Filtering Operator');

        rename(api);

        await waitFor(() => expect(operatorLabel()).toBe('Nation Filtering Operator'));
        expect(harness.input('text').getAttribute('aria-label')).toBe('Nation Filter Value');
        expect(popup().getAttribute('aria-label')).toBe('Nation Column Filter');
        expect(await floatingFilterButtonLabel(api, 'value')).toBe('Open Nation Filter Menu');
    });

    test('a column with no header name keeps the unnamed labels', async () => {
        const api = await gridsManager.createGridAndWait('grid1', {
            columnDefs: [{ field: 'value', headerName: '', filter: 'agTextColumnFilter', floatingFilter: true }],
            rowData: ROW_DATA,
        });
        expect(await floatingFilterButtonLabel(api, 'value')).toBe('Open Filter Menu');
        expect(document.querySelector('.ag-floating-filter input')!.getAttribute('aria-label')).toBe('Filter Input');

        const harness = await ColumnFilterHarness.open(api, 'value', 'floatingFilter');

        expect(popup().getAttribute('aria-label')).toBe('Column Filter');
        expect(operatorLabel()).toBe('Filtering Operator');
        expect(harness.input('text').getAttribute('aria-label')).toBe('Filter Value');
    });
});
