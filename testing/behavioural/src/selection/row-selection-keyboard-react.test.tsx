import { act, cleanup, render, waitFor } from '@testing-library/react';
import React from 'react';

import type { GridApi } from 'ag-grid-community';
import { ClientSideRowModelModule, ModuleRegistry, RowSelectionModule, getGridElement } from 'ag-grid-community';
import { AgGridReact } from 'ag-grid-react';

import { holdSpaceKey, releaseSpaceKey } from './utils';

describe('Row Selection with Keyboard (React)', () => {
    beforeAll(() => {
        ModuleRegistry.registerModules([ClientSideRowModelModule, RowSelectionModule]);
    });

    afterEach(() => {
        cleanup();
    });

    test('holding SPACE on a cell selects the row once, when SPACE is released', async () => {
        let api: GridApi | undefined;
        render(
            <React.StrictMode>
                <AgGridReact
                    rowData={[{ sport: 'tennis' }, { sport: 'golf' }]}
                    columnDefs={[{ field: 'sport' }]}
                    rowSelection={{ mode: 'multiRow' }}
                    onGridReady={(event) => {
                        api = event.api;
                    }}
                />
            </React.StrictMode>
        );
        const getCell = () =>
            getGridElement(api!)?.querySelector<HTMLElement>('.ag-row[row-index="1"] .ag-cell[col-id="sport"]');
        await waitFor(() => expect(getCell()).toBeTruthy());
        const cell = getCell()!;
        const selectedIds = () => api!.getSelectedNodes().map((node) => node.id);

        act(() => holdSpaceKey(cell));
        expect(selectedIds()).toEqual([]);

        act(() => releaseSpaceKey(cell));
        expect(selectedIds()).toEqual(['1']);
    });
});
