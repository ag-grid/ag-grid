import { act, cleanup, render, waitFor } from '@testing-library/react';
import React from 'react';

import type { GridApi } from 'ag-grid-community';
import {
    ClientSideRowModelModule,
    ModuleRegistry,
    ROW_NUMBERS_COLUMN_ID,
    RenderApiModule,
    getGridElement,
} from 'ag-grid-community';
import { CellSelectionModule, RowNumbersModule } from 'ag-grid-enterprise';
import { AgGridReact } from 'ag-grid-react';

const rowNumberHeader = (api: GridApi) =>
    getGridElement(api)!.querySelector<HTMLElement>(`.ag-header-cell[col-id="${ROW_NUMBERS_COLUMN_ID}"]`);

describe('Row numbers header (React)', () => {
    beforeAll(() => {
        ModuleRegistry.registerModules([
            ClientSideRowModelModule,
            CellSelectionModule,
            RowNumbersModule,
            RenderApiModule,
        ]);
    });

    afterEach(() => {
        cleanup();
    });

    test('a header click selects all cells after a keyboard resize whose header was rebuilt mid-press', async () => {
        let api: GridApi | undefined;
        render(
            <React.StrictMode>
                <AgGridReact
                    rowData={[{ sport: 'tennis' }, { sport: 'golf' }]}
                    columnDefs={[{ field: 'sport' }]}
                    cellSelection={true}
                    rowNumbers={{ resizable: true }}
                    onGridReady={(event) => {
                        api = event.api;
                    }}
                />
            </React.StrictMode>
        );
        await waitFor(() => expect(rowNumberHeader(api!)).not.toBeNull());

        // held: no keyup reaches the header the refresh replaces
        act(() => api!.setFocusedHeader(ROW_NUMBERS_COLUMN_ID));
        act(() => {
            document.activeElement!.dispatchEvent(
                new KeyboardEvent('keydown', { key: 'ArrowRight', altKey: true, bubbles: true })
            );
        });
        const pressed = rowNumberHeader(api!)!;
        expect(pressed.classList.contains('ag-column-resizing')).toBe(true);
        act(() => api!.refreshHeader());
        await waitFor(() => expect(rowNumberHeader(api!)).not.toBe(pressed));

        // past the click guard that follows any resize
        const clock = vi.spyOn(Date, 'now').mockReturnValue(Date.now() + 1000);
        act(() => {
            rowNumberHeader(api!)!.dispatchEvent(new MouseEvent('click', { bubbles: true }));
        });
        clock.mockRestore();

        expect(api!.getCellRanges()!.map(({ startRow, endRow }) => [startRow?.rowIndex, endRow?.rowIndex])).toEqual([
            [0, 1],
        ]);
    });

    test('suppressHeaderKeyboardEvent on the header stops the key it suppresses from selecting all cells', async () => {
        let api: GridApi | undefined;
        render(
            <React.StrictMode>
                <AgGridReact
                    rowData={[{ sport: 'tennis' }, { sport: 'golf' }]}
                    columnDefs={[{ field: 'sport' }]}
                    cellSelection={true}
                    rowNumbers={{ suppressHeaderKeyboardEvent: ({ event }) => event.key === 'Enter' }}
                    onGridReady={(event) => {
                        api = event.api;
                    }}
                />
            </React.StrictMode>
        );
        await waitFor(() => expect(rowNumberHeader(api!)).not.toBeNull());
        act(() => api!.setFocusedHeader(ROW_NUMBERS_COLUMN_ID));
        const press = (key: string) =>
            act(() => {
                document.activeElement!.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true }));
            });
        const rangeCount = () => api!.getCellRanges()?.length ?? 0;

        press('Enter');
        const afterEnter = rangeCount();
        press(' ');

        expect([afterEnter, rangeCount()]).toEqual([0, 1]);
    });
});
