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
    it('print layout empties the header pinned sections and draws every column in the scrolling one, until switched back', async () => {
        const apiRef: { current?: GridApi } = {};
        render(
            <AgGridReact
                rowData={[{ c0: 1, c1: 2, c2: 3 }]}
                columnDefs={[{ ...columnDefs[0], pinned: 'left' }, columnDefs[1], columnDefs[2]]}
                modules={[AllCommunityModule]}
                onGridReady={(e: GridReadyEvent) => {
                    apiRef.current = e.api;
                }}
            />
        );
        const sections = () => {
            const row = document.querySelector('.ag-header-row-column')!;
            const left = row.querySelector<HTMLElement>('.ag-grid-pinned-left-cells')!.style.width;
            const scrolling = row.querySelector<HTMLElement>('.ag-grid-scrolling-cells')!.style.width;
            return `${left}/${scrolling}`;
        };
        const pinnedLane = () =>
            document.querySelector('.ag-header-cell[col-id="c0"]')?.closest('.ag-grid-pinned-left-cells') != null;
        await waitFor(() => expect(sections()).toBe('100px/200px'));
        expect(pinnedLane()).toBe(true);

        act(() => apiRef.current!.setGridOption('domLayout', 'print'));
        await waitFor(() => expect(sections()).toBe('0px/300px'));
        await waitFor(() => expect(pinnedLane()).toBe(false));

        act(() => apiRef.current!.setGridOption('domLayout', 'normal'));
        await waitFor(() => expect(sections()).toBe('100px/200px'));
        await waitFor(() => expect(pinnedLane()).toBe(true));
    });
});
