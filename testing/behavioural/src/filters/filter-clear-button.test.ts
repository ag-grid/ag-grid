import { fireEvent, waitFor } from '@testing-library/dom';
import {
    ColumnFilterHarness,
    TestGridsManager,
    asyncSetTimeout,
    installFilterLayoutMock,
    uninstallFilterLayoutMock,
} from 'ag-test-utils';

import type { GridApi, ISetFilterParams, SetFilterValuesFuncParams } from 'ag-grid-community';
import { ClientSideRowModelModule, NumberFilterModule, TextFilterModule, setupAgTestIds } from 'ag-grid-community';
import type { SetFilterHandler } from 'ag-grid-enterprise';
import { SetFilterModule } from 'ag-grid-enterprise';

const ROW_DATA = [{ country: 'Ireland' }, { country: 'Italy' }];

describe('Filter input clear button', () => {
    const gridsManager = new TestGridsManager({
        modules: [ClientSideRowModelModule, NumberFilterModule, TextFilterModule, SetFilterModule],
    });

    beforeAll(() => {
        setupAgTestIds();
        installFilterLayoutMock();
    });
    afterAll(() => uninstallFilterLayoutMock());
    afterEach(() => gridsManager.reset());

    test('with an apply button, clearing updates the UI but does not apply the model', async () => {
        const api: GridApi = await gridsManager.createGridAndWait('grid1', {
            columnDefs: [{ field: 'country', filter: 'agTextColumnFilter', filterParams: { buttons: ['apply'] } }],
            rowData: ROW_DATA,
        });

        const harness = await ColumnFilterHarness.open(api, 'country');
        await harness.setText('Italy');
        await harness.apply();
        const appliedModel = { filterType: 'text', type: 'contains', filter: 'Italy' };
        expect(api.getColumnFilterModel('country')).toEqual(appliedModel);

        const input = harness.input('text');
        const clearButton = input.parentElement!.querySelector<HTMLButtonElement>('.ag-input-field-clear-button')!;
        expect(clearButton.classList.contains('ag-hidden')).toBe(false);
        fireEvent.mouseDown(clearButton);
        fireEvent.click(clearButton);
        await asyncSetTimeout(0);

        // the UI cleared, but the applied model waits for the apply button
        expect(input.value).toBe('');
        expect(api.getColumnFilterModel('country')).toEqual(appliedModel);

        await harness.apply();
        expect(api.getColumnFilterModel('country')).toBeNull();
    });

    test('without an apply button, one clear click runs the filter pipeline exactly once', async () => {
        const api: GridApi = await gridsManager.createGridAndWait('grid1', {
            columnDefs: [{ field: 'country', filter: 'agTextColumnFilter', filterParams: { debounceMs: 0 } }],
            rowData: ROW_DATA,
        });

        const harness = await ColumnFilterHarness.open(api, 'country');
        await harness.setText('Italy');
        expect(api.getColumnFilterModel('country')).toEqual({
            filterType: 'text',
            type: 'contains',
            filter: 'Italy',
        });

        let filterModifiedCount = 0;
        let filterChangedCount = 0;
        api.addEventListener('filterModified', () => ++filterModifiedCount);
        api.addEventListener('filterChanged', () => ++filterChangedCount);
        const input = harness.input('text');
        const clearButton = input.parentElement!.querySelector<HTMLButtonElement>('.ag-input-field-clear-button')!;
        fireEvent.mouseDown(clearButton);
        fireEvent.click(clearButton);
        await asyncSetTimeout(0);

        expect(input.value).toBe('');
        expect(api.getColumnFilterModel('country')).toBeNull();
        expect(filterModifiedCount).toBe(1);
        expect(filterChangedCount).toBe(1);
    });

    test('number filter input displays and applies the clear button', async () => {
        const api: GridApi = await gridsManager.createGridAndWait('grid1', {
            columnDefs: [{ field: 'age', filter: 'agNumberColumnFilter', filterParams: { debounceMs: 0 } }],
            rowData: [{ age: 23 }, { age: 25 }],
        });

        const harness = await ColumnFilterHarness.open(api, 'age');
        await harness.setNumber(25);
        expect(api.getColumnFilterModel('age')).toEqual({ filterType: 'number', type: 'equals', filter: 25 });

        const input = harness.input('number');
        const clearButton = input.parentElement!.querySelector<HTMLButtonElement>('.ag-input-field-clear-button')!;
        expect(clearButton.classList.contains('ag-hidden')).toBe(false);

        fireEvent.mouseDown(clearButton);
        fireEvent.click(clearButton);
        await asyncSetTimeout(0);

        expect(input.value).toBe('');
        expect(document.activeElement).toBe(input);
        expect(clearButton.classList.contains('ag-hidden')).toBe(true);
        expect(api.getColumnFilterModel('age')).toBeNull();
    });

    test('mini filter clear applies immediately rather than waiting for the typing debounce', async () => {
        const api: GridApi = await gridsManager.createGridAndWait('grid1', {
            columnDefs: [
                {
                    field: 'country',
                    filter: 'agSetColumnFilter',
                    filterParams: { applyMiniFilterWhileTyping: true, debounceMs: 50 } as ISetFilterParams,
                },
            ],
            rowData: ROW_DATA,
        });

        const harness = await ColumnFilterHarness.open(api, 'country');
        await harness.miniFilterSearch('Ital');
        // typing is debounced, so the model only lands once the debounce elapses
        expect(api.getColumnFilterModel('country')).toBeNull();
        await waitFor(() =>
            expect(api.getColumnFilterModel('country')).toEqual({ filterType: 'set', values: ['Italy'] })
        );

        const miniFilterInput = document.querySelector<HTMLInputElement>('.ag-mini-filter input[type="text"]')!;
        const clearButton = document.querySelector<HTMLButtonElement>('.ag-mini-filter .ag-input-field-clear-button')!;
        expect(clearButton.classList.contains('ag-hidden')).toBe(false);
        fireEvent.mouseDown(clearButton);
        fireEvent.click(clearButton);
        await asyncSetTimeout(0);

        // the clear bypasses the debounce, so all values are selected again straight away
        expect(api.getColumnFilterModel('country')).toBeNull();
        expect(miniFilterInput.value).toBe('');
    });

    test('excel-mode mini filter clear never applies pending selections, even mid values-refresh', async () => {
        let capturedSuccess: ((values: string[]) => void) | undefined;
        const api: GridApi = await gridsManager.createGridAndWait('grid1', {
            columnDefs: [
                {
                    field: 'country',
                    filter: 'agSetColumnFilter',
                    filterParams: {
                        excelMode: 'windows',
                        values: (params: SetFilterValuesFuncParams) => {
                            capturedSuccess = params.success;
                        },
                    } as ISetFilterParams,
                },
            ],
            rowData: ROW_DATA,
        });

        const harness = await ColumnFilterHarness.open(api, 'country');
        capturedSuccess!(['Ireland', 'Italy']);
        await asyncSetTimeout(0);

        // type first (excel mode select-all-matching runs on typing), then make the pending change
        await harness.miniFilterSearch('I');
        await harness.toggleSetItem('Italy');
        expect(api.getColumnFilterModel('country')).toBeNull();

        // hold the next values load so the clear's reset-to-applied-model cannot land synchronously
        capturedSuccess = undefined;
        api.getColumnFilterHandler<SetFilterHandler>('country')!.refreshFilterValues();

        const clearButton = document.querySelector<HTMLButtonElement>('.ag-mini-filter .ag-input-field-clear-button')!;
        fireEvent.mouseDown(clearButton);
        fireEvent.click(clearButton);
        await asyncSetTimeout(0);

        // the pending Apply/Cancel state must not be applied by the clear
        expect(api.getColumnFilterModel('country')).toBeNull();

        capturedSuccess!(['Ireland', 'Italy']);
        await asyncSetTimeout(0);
        expect(api.getColumnFilterModel('country')).toBeNull();
    });
});
