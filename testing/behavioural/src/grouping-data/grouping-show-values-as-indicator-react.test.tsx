import { act, cleanup, render, waitFor } from '@testing-library/react';
import { mockGridLayout } from 'ag-test-utils/polyfills/mockGridLayout';
import React from 'react';
import { afterEach, beforeAll, describe, expect, test } from 'vitest';

import type { GridApi, GridOptions } from 'ag-grid-community';
import { ClientSideRowModelModule, ColumnApiModule, ModuleRegistry } from 'ag-grid-community';
import { RowGroupingModule, ShowValuesAsModule } from 'ag-grid-enterprise';
import { AgGridReact } from 'ag-grid-react';

const indicator = (colId: string): HTMLElement | null =>
    document.querySelector<HTMLElement>(`.ag-header-cell[col-id="${colId}"] .ag-show-values-as-icon`);

const isDormant = (colId: string): boolean | undefined =>
    indicator(colId)?.classList.contains('ag-show-values-as-dormant');

/** React mounts the header components asynchronously, so their cells tell them of a regroup by call once mounted. */
describe('showValuesAs header indicator (React)', () => {
    const renderGrid = (options: GridOptions): Promise<GridApi> =>
        new Promise<GridApi>((resolve) => {
            render(<AgGridReact {...options} onGridReady={(e) => resolve(e.api)} />);
        });

    beforeAll(() => {
        ModuleRegistry.registerModules([
            ClientSideRowModelModule,
            ColumnApiModule,
            RowGroupingModule,
            ShowValuesAsModule,
        ]);
        mockGridLayout.init();
    });

    afterEach(() => {
        cleanup();
    });

    test('a parent-total indicator goes from dormant to active when grouping is added', async () => {
        const api = await renderGrid({
            columnDefs: [
                { field: 'country' },
                { field: 'amount', aggFunc: 'sum', showValuesAs: 'percentOfParentRowTotal' },
            ],
            getRowId: ({ data }) => data.id,
            // keeps the header name, so the header component is told rather than refreshed for a new name
            suppressAggFuncInHeader: true,
            rowData: [
                { id: '1', country: 'A', amount: 25 },
                { id: '2', country: 'B', amount: 75 },
            ],
        });
        await waitFor(() => expect(isDormant('amount')).toBe(true));

        act(() => {
            api.applyColumnState({ state: [{ colId: 'country', rowGroup: true }] });
        });

        await waitFor(() => expect(isDormant('amount')).toBe(false));
    });
});
