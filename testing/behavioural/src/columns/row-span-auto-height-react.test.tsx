import { act, cleanup, render, waitFor } from '@testing-library/react';
import { asyncSetTimeout } from 'ag-test-utils';
import { mockGridLayout } from 'ag-test-utils/polyfills/mockGridLayout';
import { installMockResizeObserver } from 'ag-test-utils/polyfills/mockResizeObserver';
import React from 'react';

import type { ColDef, GridApi } from 'ag-grid-community';
import { CellSpanModule, ClientSideRowModelModule, RowApiModule, RowAutoHeightModule } from 'ag-grid-community';
import { AgGridReact } from 'ag-grid-react';

/** A span as tall as its first row leaves its last row nothing extra; each row's own `title` cell is taller. */
const OWN_TITLE_HEIGHT = 120;
const ACTION_HEIGHT = 60;

// React mounts the replacement cells and unmounts the replaced ones in its own order, and StrictMode remounts
// them all: whichever order that is, the span's last row ends at the height of its own cells.
describe('row spanning with auto height (React)', () => {
    let uninstallResizeObserver: () => void;

    beforeAll(() => {
        mockGridLayout.init();
        mockGridLayout.useRealOffsetDimensions = true;
        mockGridLayout.elementHeightOverride = (el) => {
            const eCell = el.isConnected && el.classList.contains('ag-cell-wrapper') && el.closest('.ag-cell');
            if (!eCell) {
                return undefined;
            }
            const isOwnTitle = eCell.getAttribute('col-id') === 'title' && !eCell.classList.contains('ag-spanned-cell');
            return isOwnTitle ? OWN_TITLE_HEIGHT : ACTION_HEIGHT;
        };
        uninstallResizeObserver = installMockResizeObserver();
    });

    afterAll(() => {
        uninstallResizeObserver();
        mockGridLayout.useRealOffsetDimensions = false;
        mockGridLayout.elementHeightOverride = undefined;
    });

    afterEach(() => {
        cleanup();
    });

    test('a span toggled on and off in quick succession ends level with the rows it covers', async () => {
        const columnDefs = (spanRows: boolean): ColDef[] => [
            { field: 'title', autoHeight: true, spanRows },
            { field: 'action', autoHeight: true },
        ];
        let api: GridApi | undefined;
        const grid = (spanRows: boolean) => (
            <React.StrictMode>
                <AgGridReact
                    enableCellSpan
                    columnDefs={columnDefs(spanRows)}
                    rowData={[
                        { title: 'A', action: 'a0' },
                        { title: 'A', action: 'a1' },
                    ]}
                    modules={[ClientSideRowModelModule, CellSpanModule, RowApiModule, RowAutoHeightModule]}
                    onGridReady={(e) => (api = e.api)}
                />
            </React.StrictMode>
        );
        const rowHeights = () => [0, 1].map((i) => api?.getDisplayedRowAtIndex(i)?.rowHeight);

        const { rerender } = render(grid(true));
        await waitFor(() => expect(rowHeights()).toEqual([ACTION_HEIGHT, ACTION_HEIGHT]));

        for (let i = 0; i < 3; ++i) {
            await act(async () => {
                rerender(grid(false));
                await asyncSetTimeout(0);
                rerender(grid(true));
            });
            await waitFor(() => expect(rowHeights()).toEqual([ACTION_HEIGHT, ACTION_HEIGHT]));
            await act(async () => {
                rerender(grid(false));
            });
            await waitFor(() => expect(rowHeights()).toEqual([OWN_TITLE_HEIGHT, OWN_TITLE_HEIGHT]));
        }
    });
});
