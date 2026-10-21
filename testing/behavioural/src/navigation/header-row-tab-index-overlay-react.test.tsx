import { act, cleanup, render, waitFor } from '@testing-library/react';
import React from 'react';

import type { ColDef, ColGroupDef, GridApi } from 'ag-grid-community';
import { ClientSideRowModelModule, ColumnApiModule, ModuleRegistry } from 'ag-grid-community';
import { AgGridReact } from 'ag-grid-react';

const columnDefs: ColDef[] = [{ field: 'athlete' }, { field: 'age' }];

function headerRowTabIndexes(): (string | null)[] {
    return Array.from(document.querySelectorAll('.ag-header-row')).map((el) => el.getAttribute('tabindex'));
}

describe('header row tabindex and exclusive overlays (react)', () => {
    beforeAll(() => {
        ModuleRegistry.registerModules([ClientSideRowModelModule, ColumnApiModule]);
    });

    beforeEach(() => {
        cleanup();
    });

    test('header rows rejoin the tab order once an exclusive overlay is hidden', async () => {
        const { rerender } = render(<AgGridReact columnDefs={columnDefs} rowData={[]} loading />);
        await waitFor(() => expect(headerRowTabIndexes()).toEqual([null]));

        rerender(<AgGridReact columnDefs={columnDefs} rowData={[]} loading={false} />);
        await waitFor(() => expect(headerRowTabIndexes()).toEqual(['0']));
    });

    test('a header row with no cells is hidden from assistive technology and the tab order, through a StrictMode remount', async () => {
        const groupedColumnDefs: (ColDef | ColGroupDef)[] = [
            { field: 'make' },
            { headerName: 'Currency', children: [{ field: 'usd', hide: true }] },
        ];
        const rowStates = () =>
            Array.from(document.querySelectorAll('.ag-header-row')).map(
                (el) => `${el.getAttribute('aria-hidden')}/${el.getAttribute('tabindex')}`
            );
        const api = await new Promise<GridApi>((resolve) => {
            render(
                <React.StrictMode>
                    <AgGridReact columnDefs={groupedColumnDefs} rowData={[]} onGridReady={(e) => resolve(e.api)} />
                </React.StrictMode>
            );
        });
        await waitFor(() => expect(rowStates()).toEqual(['true/null', 'null/0']));

        act(() => api.setColumnsVisible(['usd'], true));
        await waitFor(() => expect(rowStates()).toEqual(['null/0', 'null/0']));

        act(() => api.setColumnsVisible(['usd'], false));
        await waitFor(() => expect(rowStates()).toEqual(['true/null', 'null/0']));
    });
});
