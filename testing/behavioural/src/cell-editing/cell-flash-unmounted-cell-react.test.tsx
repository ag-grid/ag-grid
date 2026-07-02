import { act, cleanup, render, waitFor } from '@testing-library/react';
import React from 'react';

import type { ColDef, GridApi } from 'ag-grid-community';
import {
    ClientSideRowModelApiModule,
    ClientSideRowModelModule,
    HighlightChangesModule,
    ModuleRegistry,
    RowApiModule,
} from 'ag-grid-community';
import { AgGridReact } from 'ag-grid-react';

import { asyncSetTimeout, ignoreConsoleLicenseKeyError } from '../test-utils';

const ROW_SELECTOR = '[row-id]';

// React mounts cell comps through ref callbacks on a later commit, so a CellCtrl created by
// applyTransaction is briefly returned by getCellCtrls with no comp/eGui. Flashing in that window
// is the master-detail/detail-grid-api webkit crash: `Cannot destructure property 'style' from ...`.
describe('flashCells during React async cell mount', () => {
    beforeAll(() => {
        ModuleRegistry.registerModules([
            ClientSideRowModelModule,
            ClientSideRowModelApiModule,
            RowApiModule,
            HighlightChangesModule,
        ]);
        ignoreConsoleLicenseKeyError();
    });

    afterEach(async () => {
        await act(async () => {
            await asyncSetTimeout(0);
            cleanup();
        });
    });

    test('does not throw when flashing cells whose comps have not yet mounted', async () => {
        const columnDefs: ColDef[] = [{ field: 'make' }];
        const initialRowData = [{ id: 'ROW_0', make: 'Toyota' }];

        let gridApi: GridApi | undefined;
        const rendered = render(
            <div style={{ height: 400, width: 600 }}>
                <AgGridReact
                    rowData={initialRowData}
                    columnDefs={columnDefs}
                    getRowId={(params) => params.data.id}
                    onGridReady={(p) => {
                        gridApi = p.api;
                    }}
                />
            </div>
        );

        await waitFor(() => expect(rendered.container.querySelectorAll(ROW_SELECTOR).length).toBeGreaterThan(0));

        const additions = Array.from({ length: 20 }, (_, i) => ({ id: `ADDED_${i}`, make: `Make ${i}` }));

        let flashError: unknown = null;
        await act(async () => {
            // add rows, then flash them in the same tick — before React commits the new cell comps
            gridApi!.applyTransaction({ add: additions });
            try {
                gridApi!.flashCells({ rowNodes: additions.map((row) => gridApi!.getRowNode(row.id)!) });
            } catch (e) {
                flashError = e;
            }
            await asyncSetTimeout(0);
        });

        expect(flashError).toBeNull();
    });
});
