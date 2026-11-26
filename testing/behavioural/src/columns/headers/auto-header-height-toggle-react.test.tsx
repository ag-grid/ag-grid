import { act, cleanup, render, waitFor } from '@testing-library/react';
import { asyncSetTimeout, nextAnimationFrame } from 'ag-test-utils';
import { mockGridLayout } from 'ag-test-utils/polyfills/mockGridLayout';
import React from 'react';
import { afterEach, describe, expect, it, onTestFinished } from 'vitest';

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

    it('measures an auto-height header again after a sort that only pads its cell', async () => {
        // application CSS pads a sorted header cell: its wrapper keeps its size, so no resize is reported
        mockGridLayout.init();
        mockGridLayout.useRealOffsetDimensions = true;
        mockGridLayout.elementHeightOverride = (el) =>
            el.classList.contains('ag-header-cell-comp-wrapper') ? 40 : undefined;
        const style = document.createElement('style');
        style.textContent = '.ag-header-cell[aria-sort="ascending"] { padding-top: 30px; }';
        document.head.appendChild(style);
        onTestFinished(() => {
            style.remove();
            mockGridLayout.useRealOffsetDimensions = false;
            mockGridLayout.elementHeightOverride = undefined;
        });
        const apiRef: { current?: GridApi } = {};
        render(
            <AgGridReact
                rowData={rowData}
                columnDefs={[{ colId: 'auto', autoHeaderHeight: true, wrapHeaderText: true }]}
                modules={[AllCommunityModule]}
                onGridReady={(e: GridReadyEvent) => {
                    apiRef.current = e.api;
                }}
            />
        );
        await waitFor(() => expect(apiRef.current?.getColumn('auto')!.getAutoHeaderHeight()).toBe(40));
        const api = apiRef.current!;
        // the cell's first measure, made before it was in the document, is tried again a frame later
        await act(async () => {
            await nextAnimationFrame();
            await asyncSetTimeout(0);
        });

        act(() => {
            api.applyColumnState({ state: [{ colId: 'auto', sort: 'asc' }] });
        });

        await waitFor(() => expect(api.getColumn('auto')!.getAutoHeaderHeight()).toBe(70));
    });
});
