import { act, cleanup, render, waitFor } from '@testing-library/react';
import { mockGridLayout } from 'ag-test-utils/polyfills/mockGridLayout';
import React from 'react';
import { afterAll, afterEach, beforeAll, describe, expect, test, vi } from 'vitest';

import type { GridApi, GridOptions } from 'ag-grid-community';
import { ClientSideRowModelModule, ColumnApiModule, ColumnAutoSizeModule, ModuleRegistry } from 'ag-grid-community';
import { AgGridReact } from 'ag-grid-react';

/** The width animation window under React, whose grid body and headers render on their own schedule. */
describe('column width animation (React)', () => {
    function renderGrid(options: GridOptions): Promise<GridApi> {
        return new Promise<GridApi>((resolve) => {
            render(<AgGridReact {...options} onGridReady={(e) => resolve(e.api)} />);
        });
    }

    const animating = () => document.querySelector('.ag-animate-autosize') !== null;

    beforeAll(() => {
        ModuleRegistry.registerModules([ClientSideRowModelModule, ColumnApiModule, ColumnAutoSizeModule]);
        mockGridLayout.init();
        mockGridLayout.useRealOffsetDimensions = true;
    });

    afterAll(() => {
        mockGridLayout.useRealOffsetDimensions = false;
    });

    afterEach(() => {
        cleanup();
        vi.restoreAllMocks();
    });

    test('a width change animates, and the animation ends', async () => {
        const api = await renderGrid({
            columnDefs: [{ colId: 'a', width: 100 }, { colId: 'b' }],
            animateColumnResizing: true,
        });

        act(() => {
            api.applyColumnState({ state: [{ colId: 'a', width: 300 }] });
        });

        expect(api.getColumn('a')!.getActualWidth()).toBe(300);
        expect(animating()).toBe(true);
        await waitFor(() => expect(animating()).toBe(false));
    });

    test('an auto-size asked for as the grid is ready sizes the columns, and its animation ends', async () => {
        vi.spyOn(HTMLElement.prototype, 'offsetWidth', 'get').mockImplementation(function (this: HTMLElement) {
            return this.tagName === 'FORM' ? 50 : 0;
        });
        let api: GridApi | undefined;
        render(
            <AgGridReact
                columnDefs={[{ colId: 'a' }, { colId: 'b' }]}
                rowData={[{}]}
                autoSizePadding={0}
                animateColumnResizing={true}
                onGridReady={(e) => {
                    api = e.api;
                    e.api.autoSizeAllColumns();
                }}
            />
        );

        await waitFor(() => expect(api?.getAllDisplayedColumns().map((col) => col.getActualWidth())).toEqual([50, 50]));
        await waitFor(() => expect(animating()).toBe(false));
    });
});
