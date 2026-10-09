import { act, cleanup, render, waitFor } from '@testing-library/react';
import { asyncSetTimeout } from 'ag-test-utils';
import { mockGridLayout } from 'ag-test-utils/polyfills/mockGridLayout';
import React from 'react';

import type { GridApi } from 'ag-grid-community';
import { ClientSideRowModelModule, ModuleRegistry, PinnedRowModule } from 'ag-grid-community';
import { RowGroupingModule } from 'ag-grid-enterprise';
import { AgGridReact } from 'ag-grid-react';

import { grandTotalBorders } from './grandTotalRowBorderDom';

describe('grand total row border classes (React)', () => {
    beforeAll(() => {
        mockGridLayout.init();
        ModuleRegistry.registerModules([ClientSideRowModelModule, PinnedRowModule, RowGroupingModule]);
    });

    afterEach(async () => {
        await act(async () => {
            await asyncSetTimeout(0);
            cleanup();
        });
    });

    test('the border side class follows grandTotalRow', async () => {
        let api: GridApi | undefined;
        const { container } = render(
            <div style={{ height: 400, width: 600 }}>
                <AgGridReact
                    columnDefs={[{ field: 'id' }, { field: 'value', aggFunc: 'sum' }]}
                    rowData={[
                        { id: 'r0', value: 0 },
                        { id: 'r1', value: 1 },
                    ]}
                    getRowId={(params) => params.data.id}
                    grandTotalRow="pinnedBottom"
                    suppressStickyTotalRow="grand"
                    onGridReady={(params) => {
                        api = params.api;
                    }}
                />
            </div>
        );

        await waitFor(() => expect(grandTotalBorders(container)).toEqual({ pinnedBottom: ['TOTAL border-top'] }));

        act(() => api!.setGridOption('grandTotalRow', 'bottom'));
        await waitFor(() => expect(grandTotalBorders(container)).toEqual({ scrolling: ['TOTAL border-top'] }));

        act(() => api!.setGridOption('grandTotalRow', 'top'));
        await waitFor(() => expect(grandTotalBorders(container)).toEqual({ scrolling: ['TOTAL border-bottom'] }));
    });
});
