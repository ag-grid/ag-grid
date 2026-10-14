import { act, cleanup, render, waitFor } from '@testing-library/react';
import { asyncSetTimeout } from 'ag-test-utils';
import { mockGridLayout } from 'ag-test-utils/polyfills/mockGridLayout';
import { installMockResizeObserver, triggerResizeObservers } from 'ag-test-utils/polyfills/mockResizeObserver';
import React from 'react';
import { afterAll, afterEach, beforeAll, describe, expect, test } from 'vitest';

import type { ColDef, GridApi, GridOptions } from 'ag-grid-community';
import { CellSpanModule, ClientSideRowModelModule, RowApiModule, RowAutoHeightModule } from 'ag-grid-community';
import type { CustomCellRendererProps } from 'ag-grid-react';
import { AgGridReact } from 'ag-grid-react';

/**
 * React mounts a cell's content a task after the ctrl exists, and StrictMode mounts it, tears it down and
 * mounts it again. A measured height is cleared by the teardown of the cell *comp* rather than the ctrl, so
 * these are the cases where a row can be left holding no measurement and never be asked for one again.
 */
describe('Auto row height (React)', () => {
    const DEFAULT_ROW_HEIGHT = 42;
    const MODULES = [ClientSideRowModelModule, RowApiModule, RowAutoHeightModule];

    const cellHeights = new Map<string, number>();

    let uninstallResizeObserver: () => void;

    beforeAll(() => {
        // happy-dom drops resize callbacks, so without this a cell is only ever measured as it is built.
        uninstallResizeObserver = installMockResizeObserver();

        // No TestGridsManager here, so the layout mock has to be installed by hand.
        mockGridLayout.init();
        mockGridLayout.useRealOffsetDimensions = true;
        mockGridLayout.elementHeightOverride = (el) => {
            if (!el.classList.contains('ag-cell-wrapper')) {
                return undefined;
            }
            const colId = el.closest('.ag-cell')?.getAttribute('col-id');
            return colId == null ? undefined : cellHeights.get(colId);
        };
    });

    afterAll(() => {
        uninstallResizeObserver();
        mockGridLayout.useRealOffsetDimensions = false;
        mockGridLayout.elementHeightOverride = undefined;
    });

    afterEach(() => {
        cleanup();
        cellHeights.clear();
    });

    const OPTIONS: GridOptions = {
        rowData: [{ a: 'a0', b: 'b0' }],
    };

    const AUTO_HEIGHT_COLS: ColDef[] = [{ field: 'a' }, { field: 'b', autoHeight: true }];

    /** The last api handed out: StrictMode builds the grid more than once and only the last one is live. */
    const renderGrid = (strict: boolean, columnDefs: ColDef[] = AUTO_HEIGHT_COLS): (() => GridApi | undefined) => {
        let api: GridApi | undefined;
        const options: GridOptions = { ...OPTIONS, columnDefs };
        const grid = <AgGridReact {...options} modules={MODULES} onGridReady={(e) => (api = e.api)} />;
        render(strict ? <React.StrictMode>{grid}</React.StrictMode> : grid);
        return () => api;
    };

    const rowHeight = (api: GridApi): number | undefined => api.getDisplayedRowAtIndex(0)?.rowHeight ?? undefined;

    // Spanning off gives each row its own cell in the column and back on hands it to one cell for the run.
    // React unmounts the cells it replaces after mounting the new ones, and StrictMode remounts them all:
    // whichever order they come and go in, only the span's own measurement counts.
    test('a span toggled on and off in quick succession ends level with the rows it covers', async () => {
        cellHeights.set('b', 200);
        cellHeights.set('c', 50);
        const columnDefs = (spanRows: boolean): ColDef[] => [
            { field: 'a' },
            { field: 'b', spanRows, autoHeight: true },
            { field: 'c', autoHeight: true },
        ];
        let api: GridApi | undefined;
        const grid = (spanRows: boolean) => (
            <React.StrictMode>
                <AgGridReact
                    columnDefs={columnDefs(spanRows)}
                    enableCellSpan
                    rowData={[
                        { a: 'a0', b: 'x', c: 'c0' },
                        { a: 'a1', b: 'x', c: 'c1' },
                    ]}
                    modules={[...MODULES, CellSpanModule]}
                    onGridReady={(e) => (api = e.api)}
                />
            </React.StrictMode>
        );
        const heights = () => [0, 1].map((i) => api!.getDisplayedRowAtIndex(i)!.rowHeight);
        const { rerender } = render(grid(true));
        await waitFor(() => expect(heights()).toEqual([50, 150]));

        for (let i = 0; i < 6; ++i) {
            await act(async () => {
                rerender(grid(false));
                await asyncSetTimeout(0);
                rerender(grid(true));
            });
            await waitFor(() => expect(heights()).toEqual([50, 150]));
        }
    });

    test('a row takes the height of its auto-height cell', async () => {
        cellHeights.set('b', 90);
        const getApi = renderGrid(false);

        await waitFor(() => expect(rowHeight(getApi()!)).toBe(90));
    });

    test('remounting the grid measures its rows again', async () => {
        cellHeights.set('b', 90);
        const first = renderGrid(false);
        await waitFor(() => expect(rowHeight(first()!)).toBe(90));

        cleanup();

        cellHeights.set('b', 150);
        const second = renderGrid(false);
        await waitFor(() => expect(rowHeight(second()!)).toBe(150));
    });

    test('rebuilding a row measures it again', async () => {
        cellHeights.set('b', 90);
        const getApi = renderGrid(false);
        await waitFor(() => expect(rowHeight(getApi()!)).toBe(90));

        cellHeights.set('b', 140);
        act(() => getApi()!.redrawRows());

        await waitFor(() => expect(rowHeight(getApi()!)).toBe(140));
    });

    test('a resize reaches a cell rendered inside a user component', async () => {
        const Inner = ({ value }: { value: string }) => <span>{value}</span>;
        const UserRenderer = (props: CustomCellRendererProps) => (
            <div>
                <Inner value={props.value} />
            </div>
        );

        cellHeights.set('b', 90);
        const getApi = renderGrid(false, [
            { field: 'a' },
            { field: 'b', autoHeight: true, cellRenderer: UserRenderer },
        ]);
        await waitFor(() => expect(rowHeight(getApi()!)).toBe(90));

        // Nothing rebuilds the cell, so the observation is the only thing that can bring the new height
        // back, and it has to lead from the watched element to the cell that owns it.
        cellHeights.set('b', 150);
        act(() => triggerResizeObservers());

        await waitFor(() => expect(rowHeight(getApi()!)).toBe(150));
    });

    // The row caps its line height against its configured height, which the pass hands to the row as it
    // applies the measured one: under React the row is a React component, but the ctrl is the same.
    test('a measured row caps its line height against its configured height', async () => {
        cellHeights.set('b', 90);
        let api: GridApi | undefined;
        render(
            <AgGridReact
                columnDefs={AUTO_HEIGHT_COLS}
                rowData={OPTIONS.rowData}
                getRowHeight={() => 30}
                modules={MODULES}
                onGridReady={(e) => (api = e.api)}
            />
        );
        await waitFor(() => expect(api && rowHeight(api)).toBe(90));

        const row = document.querySelector<HTMLElement>('.ag-row[row-index="0"]')!;
        // `min(default 42, configured 30) - 2`, rather than the 40 the measured 90 would cap to.
        expect(row.style.getPropertyValue('--ag-line-height')).toBe('28px');
    });

    test('a row with no auto-height column keeps the configured height', async () => {
        // A height is on offer for `b`, so a row that took it would be 90: the column not asking for it
        // is the only reason this stays at the configured height.
        cellHeights.set('b', 90);
        const getApi = renderGrid(false, [{ field: 'a' }, { field: 'b' }]);

        await waitFor(() => expect(getApi()).toBeDefined());
        // The row starts at the configured height, so it is read once a measurement would have landed.
        await act(async () => {
            await asyncSetTimeout(0);
        });
        await act(async () => {
            await asyncSetTimeout(0);
        });
        expect(rowHeight(getApi()!)).toBe(DEFAULT_ROW_HEIGHT);

        // Control: the height on offer does reach the row once the column asks for it.
        await act(async () => {
            getApi()!.setGridOption('columnDefs', [{ field: 'a' }, { field: 'b', autoHeight: true }]);
        });
        await waitFor(() => expect(rowHeight(getApi()!)).toBe(90));
    });
});
