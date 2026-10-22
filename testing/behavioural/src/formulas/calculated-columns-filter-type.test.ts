import { waitFor } from '@testing-library/dom';
import { clickMenuOption } from 'ag-test-utils';

import type { GridApi } from 'ag-grid-community';

import {
    addViaDialog,
    clickDialogButton,
    createGrid,
    getDialog,
    selectDataType,
    setupCalculatedColumnsStateSuite,
} from './calculatedColumnsStateHarness';

async function openFilter(api: GridApi, colId: string): Promise<HTMLElement> {
    api.showColumnFilter(colId);
    return waitFor(() => {
        const filter = document.querySelector<HTMLElement>('.ag-filter');
        expect(filter).toBeTruthy();
        return filter!;
    });
}

describe('calculated columns - filter follows cellDataType', () => {
    setupCalculatedColumnsStateSuite();

    test('editing a text calculated column to number switches it to the number filter', async () => {
        const api = createGrid('filter-follows-data-type', {
            rowData: [{ id: 'r1', a: 10, b: 3 }],
            columnDefs: [{ field: 'a' }, { field: 'b' }],
            defaultColDef: { filter: true },
        });
        const calcId = await addViaDialog(api, 'a', '[a] * 2');
        expect(api.getColumn(calcId)!.getColDef().cellDataType).toBe('text');

        const textFilter = await openFilter(api, calcId);
        expect(textFilter.querySelector('.ag-text-field')).toBeTruthy();
        expect(textFilter.querySelector('.ag-number-field')).toBeNull();
        api.hidePopupMenu();

        api.showColumnMenu(calcId);
        await clickMenuOption('Edit Calculated Column');
        await waitFor(() => getDialog());
        await selectDataType('Number');
        clickDialogButton('Apply');
        await waitFor(() => expect(api.getColumn(calcId)!.getColDef().cellDataType).toBe('number'));

        await waitFor(async () => {
            const numberFilter = await openFilter(api, calcId);
            expect(numberFilter.querySelector('.ag-number-field')).toBeTruthy();
            expect(numberFilter.querySelector('.ag-text-field')).toBeNull();
        });
    });
});
