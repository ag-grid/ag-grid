import { cleanup, render, waitFor } from '@testing-library/react';
import React from 'react';

import type { ColDef } from 'ag-grid-community';
import { ClientSideRowModelModule, ModuleRegistry } from 'ag-grid-community';
import { AgGridReact } from 'ag-grid-react';

const columnDefs: ColDef[] = [{ field: 'athlete' }, { field: 'age' }];

function headerRowTabIndexes(): (string | null)[] {
    return Array.from(document.querySelectorAll('.ag-header-row')).map((el) => el.getAttribute('tabindex'));
}

describe('header row tabindex and exclusive overlays (react)', () => {
    beforeAll(() => {
        ModuleRegistry.registerModules([ClientSideRowModelModule]);
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
});
