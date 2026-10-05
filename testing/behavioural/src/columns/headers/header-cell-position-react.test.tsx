import { act, cleanup, render, waitFor } from '@testing-library/react';
import React from 'react';
import { afterEach, describe, expect, it } from 'vitest';

import type { ColDef, GridApi, GridReadyEvent } from 'ag-grid-community';
import { AllCommunityModule } from 'ag-grid-community';
import { AgGridReact } from 'ag-grid-react';

const columnDefs: ColDef[] = [0, 1, 2].map((i) => ({ colId: `c${i}`, field: `c${i}`, width: 100 }));

describe('React header cell positions', () => {
    afterEach(() => cleanup());

    it('a header cell moved to another lane is placed and sized in its new element', async () => {
        const apiRef: { current?: GridApi } = {};
        render(
            <AgGridReact
                rowData={[{ c0: 1, c1: 2, c2: 3 }]}
                columnDefs={columnDefs}
                modules={[AllCommunityModule]}
                onGridReady={(e: GridReadyEvent) => {
                    apiRef.current = e.api;
                }}
            />
        );
        const header = () => document.querySelector<HTMLElement>('.ag-header-cell[col-id="c1"]');
        await waitFor(() => expect(header()?.style.left).toBe('100px'));
        const before = header();

        act(() => apiRef.current!.setColumnsPinned(['c1'], 'left'));
        await waitFor(() => expect(header()?.closest('.ag-grid-pinned-left-cells')).not.toBeNull());

        expect(header()).not.toBe(before);
        await waitFor(() => expect(`${header()!.style.left}/${header()!.style.width}`).toBe('0px/100px'));
    });
});
