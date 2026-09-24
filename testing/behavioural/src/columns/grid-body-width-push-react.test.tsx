import { act, cleanup, render, waitFor } from '@testing-library/react';
import { asyncSetTimeout } from 'ag-test-utils';
import { mockGridLayout } from 'ag-test-utils/polyfills/mockGridLayout';
import React from 'react';
import { afterEach, beforeAll, describe, expect, test } from 'vitest';

import type { ColDef, GridApi, GridOptions } from 'ag-grid-community';
import { ClientSideRowModelModule, ColumnApiModule, ModuleRegistry, RenderApiModule } from 'ag-grid-community';
import { AgGridReact } from 'ag-grid-react';

const VIEWPORT_WIDTH = mockGridLayout.gridWidth;

const ROW_CONTAINER_SELECTORS = [
    '.ag-grid-scrolling-container',
    '.ag-grid-pinned-top-rows-container',
    '.ag-grid-pinned-bottom-rows-container',
    '.ag-grid-sticky-top-rows-container',
    '.ag-grid-sticky-bottom-rows-container',
];

const containerWidths = (): string[] =>
    ROW_CONTAINER_SELECTORS.map((selector) => {
        const element = document.querySelector<HTMLElement>(selector);
        expect(element, `Expected ${selector} to be rendered`).not.toBeNull();
        return element!.style.width;
    });

const headerRowWidths = (): string[] =>
    Array.from(document.querySelectorAll<HTMLElement>('.ag-header-row'), (row) => row.style.width);

const buildCols = (count: number): ColDef[] => {
    const cols: ColDef[] = [];
    for (let i = 0; i < count; ++i) {
        cols.push({ colId: `c${i}`, field: `c${i}`, width: 100 });
    }
    return cols;
};

/**
 * React mounts the row containers asynchronously and through its own view layer, so the grid body has to
 * push the widths again once they have all registered rather than at its own construction.
 */
describe('Grid body width push (React)', () => {
    const renderGrid = (options: GridOptions): Promise<GridApi> =>
        new Promise<GridApi>((resolve) => {
            render(<AgGridReact {...options} onGridReady={(e) => resolve(e.api)} />);
        });

    beforeAll(() => {
        ModuleRegistry.registerModules([ClientSideRowModelModule, ColumnApiModule, RenderApiModule]);
        // No TestGridsManager here, so the layout mock that gives the viewport a width has to be installed.
        mockGridLayout.init();
    });

    afterEach(() => {
        cleanup();
    });

    // On mount, on a remount, and in both branches of the stretch-or-follow-the-columns rule.
    test('sizes every row container and header row on mount and on a remount', async () => {
        await renderGrid({ columnDefs: buildCols(15), rowData: [{ c0: 1 }] });

        await waitFor(() =>
            expect(containerWidths()).toEqual(new Array(ROW_CONTAINER_SELECTORS.length).fill('1500px'))
        );
        expect(headerRowWidths()).toEqual(['1500px']);

        // Remounted with columns narrower than the viewport, so the containers stretch to it instead.
        cleanup();
        await renderGrid({ columnDefs: buildCols(3), rowData: [{ c0: 1 }] });

        const stretched = `${VIEWPORT_WIDTH}px`;
        await waitFor(() =>
            expect(containerWidths()).toEqual(new Array(ROW_CONTAINER_SELECTORS.length).fill(stretched))
        );
        expect(headerRowWidths()).toEqual([stretched]);
    });

    test('re-sizes every row container when the columns change', async () => {
        const api = await renderGrid({ columnDefs: buildCols(15), rowData: [{ c0: 1 }] });
        await waitFor(() => expect(containerWidths()[0]).toBe('1500px'));

        act(() => {
            api.setColumnWidths([{ key: 'c0', newWidth: 400 }]);
        });

        await waitFor(() =>
            expect(containerWidths()).toEqual(new Array(ROW_CONTAINER_SELECTORS.length).fill('1800px'))
        );
        expect(headerRowWidths()).toEqual(['1800px']);
    });

    // StrictMode double-fires the ref callbacks, so the row containers are destroyed and re-created after
    // the column events that would otherwise have sized them.
    test('sizes the row containers re-created by a StrictMode double mount', async () => {
        await new Promise<GridApi>((resolve) => {
            render(
                <React.StrictMode>
                    <AgGridReact columnDefs={buildCols(15)} rowData={[{ c0: 1 }]} onGridReady={(e) => resolve(e.api)} />
                </React.StrictMode>
            );
        });

        await waitFor(() =>
            expect(containerWidths()).toEqual(new Array(ROW_CONTAINER_SELECTORS.length).fill('1500px'))
        );
        expect(headerRowWidths()).toEqual(['1500px']);
    });

    // A header row mounts a frame after the ctrl that owns it is created, so a width can arrive while it has
    // no component to write to. The width it is handed on arrival must still reach the DOM.
    test('sizes a header row added after the first push', async () => {
        const api = await renderGrid({ columnDefs: buildCols(15), rowData: [{ c0: 1 }] });
        await waitFor(() => expect(headerRowWidths()).toEqual(['1500px']));

        act(() => {
            api.setGridOption('columnDefs', [{ headerName: 'Group', children: buildCols(15) }]);
        });

        await waitFor(() => expect(headerRowWidths()).toHaveLength(2));
        expect(headerRowWidths()).toEqual(['1500px', '1500px']);
    });

    // `refreshHeader` destroys and re-creates every header row ctrl, so all of them re-mount into the window
    // above at once.
    test('sizes every header row re-created by refreshHeader', async () => {
        const api = await renderGrid({ columnDefs: buildCols(15), rowData: [{ c0: 1 }] });
        await waitFor(() => expect(headerRowWidths()).toEqual(['1500px']));
        const before = Array.from(document.querySelectorAll('.ag-header-row'));

        act(() => {
            api.refreshHeader();
        });

        // Not `waitFor`: the width is already correct before the refresh, so a poll would pass without
        // ever seeing the re-created rows. Flush the remount, then assert.
        await act(async () => {
            await asyncSetTimeout(0);
        });
        // The identity check is what makes the width assertion load-bearing: without it the test passes
        // against the old rows.
        expect(Array.from(document.querySelectorAll('.ag-header-row'))).not.toEqual(before);
        expect(headerRowWidths()).toEqual(['1500px']);
    });
});
