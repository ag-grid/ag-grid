import { act, cleanup, render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { afterEach, describe, expect, it } from 'vitest';

import type { ColDef, GridApi, GridReadyEvent } from 'ag-grid-community';
import { AllCommunityModule } from 'ag-grid-community';
import { AgGridReact } from 'ag-grid-react';

const rowData = [{ c0: 1, c1: 2, c2: 3, c3: 4, c4: 5 }];
const columnDefs: ColDef[] = [0, 1, 2, 3, 4].map((i) => ({ colId: `c${i}`, field: `c${i}` }));
const ids = columnDefs.map((c) => c.colId!);

describe('React header cell reuse on visibility toggle', () => {
    afterEach(() => cleanup());

    it('hide-all then show-all renders correct headers (pooled-ctrl remount is safe)', async () => {
        const apiRef: { current?: GridApi } = {};
        render(
            <AgGridReact
                rowData={rowData}
                columnDefs={columnDefs}
                modules={[AllCommunityModule]}
                onGridReady={(e: GridReadyEvent) => {
                    apiRef.current = e.api;
                }}
            />
        );

        const colIds = () => screen.queryAllByRole('columnheader').map((h) => h.getAttribute('col-id'));

        await waitFor(() => expect(colIds()).toEqual(ids));

        // Hidden columns must not be rendered.
        act(() => apiRef.current!.setColumnsVisible(ids, false));
        await waitFor(() => expect(screen.queryAllByRole('columnheader').length).toBe(0));

        // Re-show: pooled ctrls are reused and React remounts the cells correctly.
        act(() => apiRef.current!.setColumnsVisible(ids, true));
        await waitFor(() => expect(colIds()).toEqual(ids));

        // A single-column round-trip also stays correct.
        act(() => apiRef.current!.setColumnsVisible(['c2'], false));
        await waitFor(() => expect(colIds()).toEqual(['c0', 'c1', 'c3', 'c4']));
        act(() => apiRef.current!.setColumnsVisible(['c2'], true));
        await waitFor(() => expect(colIds()).toEqual(ids));
    });
});
