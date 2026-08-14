import { fireEvent } from '@testing-library/dom';

import type { GridApi } from 'ag-grid-community';
import { ClientSideRowModelModule, TextFilterModule, setupAgTestIds } from 'ag-grid-community';

import {
    ColumnFilterHarness,
    TestGridsManager,
    asyncSetTimeout,
    installFilterLayoutMock,
    uninstallFilterLayoutMock,
} from '../test-utils';

const ROW_DATA = [{ country: 'Ireland' }, { country: 'Italy' }];

describe('Filter input clear button', () => {
    const gridsManager = new TestGridsManager({
        modules: [ClientSideRowModelModule, TextFilterModule],
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
});
