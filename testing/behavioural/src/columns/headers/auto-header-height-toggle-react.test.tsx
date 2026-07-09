import { act, cleanup, render, waitFor } from '@testing-library/react';
import React from 'react';
import { afterEach, describe, expect, it } from 'vitest';

import type { GridApi, GridReadyEvent } from 'ag-grid-community';
import { AllCommunityModule } from 'ag-grid-community';
import { AgGridReact } from 'ag-grid-react';

const rowData = [{ auto: 1, normal: 2 }];

describe('React autoHeaderHeight toggle', () => {
    afterEach(() => cleanup());

    it('clears the measured header height when autoHeaderHeight is toggled off', async () => {
        const apiRef: { current?: GridApi } = {};
        render(
            <AgGridReact
                rowData={rowData}
                columnDefs={[{ colId: 'auto', autoHeaderHeight: true, headerName: 'Auto' }, { colId: 'normal' }]}
                modules={[AllCommunityModule]}
                onGridReady={(e: GridReadyEvent) => {
                    apiRef.current = e.api;
                }}
            />
        );

        await waitFor(() => expect(apiRef.current).toBeDefined());
        const api = apiRef.current!;
        const autoCol = () => api.getColumn('auto')!;

        await waitFor(() => expect(autoCol().getAutoHeaderHeight()).not.toBeNull());

        act(() => {
            api.setGridOption('columnDefs', [{ colId: 'auto', headerName: 'Auto' }, { colId: 'normal' }]);
        });

        await waitFor(() => {
            expect(autoCol().isAutoHeaderHeight()).toBe(false);
            expect(autoCol().getAutoHeaderHeight()).toBeNull();
        });
    });
});
