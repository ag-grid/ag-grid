import { cleanup, render, waitFor } from '@testing-library/react';
import React from 'react';

import {
    CellSpanModule,
    ClientSideRowModelModule,
    GridStateModule,
    ModuleRegistry,
    PinnedRowModule,
} from 'ag-grid-community';
import { AgGridReact } from 'ag-grid-react';

const spannedRowPinClasses = () =>
    Object.fromEntries(
        Array.from(document.querySelectorAll('.ag-spanned-row'), (row) => [
            row.getAttribute('row-id'),
            Array.from(row.classList).filter((c) => c === 'ag-row-pinned' || c === 'ag-row-pinned-source'),
        ])
    );

describe('Manual pinned rows (React)', () => {
    beforeAll(() => {
        ModuleRegistry.registerModules([ClientSideRowModelModule, CellSpanModule, PinnedRowModule, GridStateModule]);
    });

    afterEach(() => {
        cleanup();
    });

    test('spanned cells of a pinned row carry the pinned row styling', async () => {
        render(
            <AgGridReact
                columnDefs={[{ field: 'country', spanRows: true }, { field: 'sport' }]}
                rowData={[
                    { id: '1', country: 'Ireland', sport: 'Rugby' },
                    { id: '2', country: 'Ireland', sport: 'Hurling' },
                    { id: '3', country: 'Italy', sport: 'Cycling' },
                ]}
                getRowId={(params) => params.data.id}
                enableRowPinning
                enableCellSpan
                initialState={{ rowPinning: { top: ['1', '2'], bottom: [] } }}
            />
        );
        await waitFor(() =>
            expect(spannedRowPinClasses()).toEqual({ 't-top-1': ['ag-row-pinned'], '1': ['ag-row-pinned-source'] })
        );
    });
});
