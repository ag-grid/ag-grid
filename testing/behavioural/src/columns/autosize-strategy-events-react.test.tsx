import { act, cleanup, render, waitFor } from '@testing-library/react';
import React from 'react';

import type { GridApi } from 'ag-grid-community';
import {
    ClientSideRowModelModule,
    ColumnApiModule,
    ColumnAutoSizeModule,
    EventApiModule,
    ModuleRegistry,
    RowApiModule,
    ValidationModule,
} from 'ag-grid-community';
import { RowGroupingModule } from 'ag-grid-enterprise';
import { AgGridReact } from 'ag-grid-react';

import { ignoreConsoleLicenseKeyError } from '../test-utils';

/**
 * AG-4093 TC9: React renders cells asynchronously, so a strategy re-run triggered by a grid event
 * must still measure the cells the event produced. Expanding a row group widens the auto group
 * column by hand first, so a re-run is only observable if it ran after React committed the newly
 * rendered group children.
 */
describe('autoSizeStrategy events (React)', () => {
    beforeAll(() => {
        ModuleRegistry.registerModules([
            ClientSideRowModelModule,
            ColumnApiModule,
            ColumnAutoSizeModule,
            EventApiModule,
            RowApiModule,
            RowGroupingModule,
            ValidationModule,
        ]);
        ignoreConsoleLicenseKeyError();
    });

    afterEach(() => {
        cleanup();
    });

    test('re-runs after React has rendered an expanded row group', async () => {
        let resolveReady!: (api: GridApi) => void;
        const ready = new Promise<GridApi>((resolve) => {
            resolveReady = resolve;
        });

        await act(async () => {
            render(
                <AgGridReact
                    columnDefs={[
                        { field: 'group', rowGroup: true, hide: true },
                        { field: 'value', minWidth: 120, width: 300 },
                    ]}
                    autoGroupColumnDef={{ minWidth: 140, width: 300 }}
                    rowData={[
                        { group: 'DESKTOP', value: 'a' },
                        { group: 'DESKTOP', value: 'a much longer value' },
                    ]}
                    autoSizeStrategy={{ type: 'fitCellContents', skipHeader: true, events: ['rowGroupOpened'] }}
                    onGridReady={(e) => resolveReady(e.api)}
                />
            );
        });

        const api = await ready;
        await waitFor(() => expect(api.getColumn('value')!.getActualWidth()).toBe(120));

        // Record how many leaf cells React had committed at the moment each re-run measured.
        // A run that fired before the commit would see only the collapsed group row.
        const leafCellsAtRun: number[] = [];
        api.addEventListener('columnResized', (e) => {
            if (e.finished && e.source === 'autosizeColumns') {
                leafCellsAtRun.push(document.querySelectorAll('.ag-row:not(.ag-row-group) [col-id="value"]').length);
            }
        });

        api.setColumnWidths([{ key: 'value', newWidth: 400 }]);
        await act(async () => {
            api.getDisplayedRowAtIndex(0)!.setExpanded(true);
        });

        await waitFor(() => expect(api.getColumn('value')!.getActualWidth()).toBe(120));

        // both leaf rows of the expanded group were rendered before the strategy measured
        expect(leafCellsAtRun).toEqual([2]);
    });
});
