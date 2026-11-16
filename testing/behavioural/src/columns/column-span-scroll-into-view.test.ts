import { waitFor } from '@testing-library/dom';
import { TestGridsManager } from 'ag-test-utils';

import type { ColDef, GridApi } from 'ag-grid-community';
import { ClientSideRowModelModule, KeyCode, ScrollApiModule } from 'ag-grid-community';

import { dispatchKeyDown, getFocusedColId } from '../navigation/navigation-test-utils';

const columnDefs: ColDef[] = [
    { colId: 'athlete', pinned: 'left' },
    { colId: 'age', pinned: 'left' },
    { colId: 'country', colSpan: () => 4 },
    { colId: 'year' },
    { colId: 'date' },
    { colId: 'sport' },
    { colId: 'gold' },
    { colId: 'silver' },
    { colId: 'bronze' },
    { colId: 'total' },
];

describe('Column spanning: moving left onto a spanning cell scrolls its start into view', () => {
    const gridsManager = new TestGridsManager({
        modules: [ClientSideRowModelModule, ScrollApiModule],
    });

    afterEach(() => {
        gridsManager.reset();
    });

    const createScrolledGrid = async (): Promise<GridApi> => {
        const api = gridsManager.createGrid('myGrid', {
            columnDefs,
            rowData: [{}],
            defaultColDef: { width: 150 },
        });
        api.ensureColumnVisible('total');
        // the span's last column, sport, is clipped at the left edge, so only part of the span shows
        await waitFor(() =>
            expect(api.getHorizontalPixelRange().left).toBeGreaterThan(api.getColumn('sport')!.getLeft()!)
        );
        api.setFocusedCell(0, 'gold');
        return api;
    };

    test.each([
        ['Shift+Tab', () => dispatchKeyDown(KeyCode.TAB, { shiftKey: true })],
        ['Left arrow', () => dispatchKeyDown(KeyCode.LEFT)],
    ])('%s', async (_name, moveLeft) => {
        const api = await createScrolledGrid();

        moveLeft();

        expect(getFocusedColId(api)).toBe('country');
        await waitFor(() => expect(api.getHorizontalPixelRange().left).toBe(api.getColumn('country')!.getLeft()));
    });
});
