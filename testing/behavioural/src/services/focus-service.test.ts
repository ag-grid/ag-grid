import { userEvent } from '@testing-library/user-event';
import { TestGridsManager } from 'ag-test-utils';

import { ClientSideRowModelModule, getGridElement } from 'ag-grid-community';

describe('getFocusedCell', () => {
    const gridMgr = new TestGridsManager({ modules: [ClientSideRowModelModule] });

    afterEach(() => {
        gridMgr.reset();
    });

    test('returns null before any cell has been focused and after the focus is cleared', async () => {
        const api = await gridMgr.createGridAndWait('focusedCellNull', {
            columnDefs: [{ field: 'athlete' }],
            rowData: [{ athlete: 'Ann' }],
        });
        expect(api.getFocusedCell()).toBeNull();

        await userEvent.click(getGridElement(api)!.querySelector<HTMLElement>('.ag-cell[col-id="athlete"]')!);
        expect(api.getFocusedCell()?.column.getColId()).toBe('athlete');

        api.clearFocusedCell();
        expect(api.getFocusedCell()).toBeNull();
    });
});
