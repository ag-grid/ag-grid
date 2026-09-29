import { act, cleanup, render, waitFor } from '@testing-library/react';
import React from 'react';

import type { GridApi } from 'ag-grid-community';
import { ClientSideRowModelModule, ModuleRegistry, getGridElement } from 'ag-grid-community';
import { AgGridReact } from 'ag-grid-react';

interface Row {
    id: string;
}

const rowIdsInDom = (api: GridApi<Row>) =>
    Array.from(getGridElement(api)!.querySelectorAll('.ag-row'), (row) => row.getAttribute('row-id'));

describe('row DOM order (React)', () => {
    beforeAll(() => {
        ModuleRegistry.registerModules([ClientSideRowModelModule]);
    });

    afterEach(() => {
        cleanup();
    });

    const renderGrid = (ensureDomOrder: boolean) => {
        let api: GridApi<Row> | undefined;
        render(
            <AgGridReact<Row>
                rowData={[{ id: 'a' }, { id: 'b' }, { id: 'c' }]}
                columnDefs={[{ field: 'id' }]}
                getRowId={(params) => params.data.id}
                ensureDomOrder={ensureDomOrder}
                onGridReady={(e) => {
                    api = e.api;
                }}
            />
        );
        return () => api!;
    };

    test('with ensureDomOrder, reordered rows follow the new order in the DOM', async () => {
        const api = renderGrid(true);
        await waitFor(() => expect(rowIdsInDom(api())).toEqual(['a', 'b', 'c']));

        act(() => api().setGridOption('rowData', [{ id: 'c' }, { id: 'b' }, { id: 'a' }]));

        await waitFor(() => expect(rowIdsInDom(api())).toEqual(['c', 'b', 'a']));
    });

    test('without ensureDomOrder, rows kept through a reorder keep their DOM place', async () => {
        const api = renderGrid(false);
        await waitFor(() => expect(rowIdsInDom(api())).toEqual(['a', 'b', 'c']));

        act(() => api().setGridOption('rowData', [{ id: 'c' }, { id: 'a' }, { id: 'd' }]));

        await waitFor(() => expect(rowIdsInDom(api())).toEqual(['a', 'c', 'd']));
    });
});
