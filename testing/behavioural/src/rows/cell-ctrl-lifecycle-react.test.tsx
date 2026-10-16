import { act, cleanup, render, waitFor } from '@testing-library/react';
import { asyncSetTimeout } from 'ag-test-utils';
import React from 'react';
import { onTestFinished } from 'vitest';

import type { GridApi } from 'ag-grid-community';
import { ClientSideRowModelModule, RenderApiModule, RowApiModule, RowDragModule } from 'ag-grid-community';
import { AgGridReact } from 'ag-grid-react';

describe('cell ctrl lifecycle (react)', () => {
    afterEach(() => {
        cleanup();
    });

    test('a focused cell or full-width row rebuilt by a redraw takes focus back, unless focus has since moved out of the grid', async () => {
        let api: GridApi | undefined;
        const { container } = render(
            <React.StrictMode>
                <AgGridReact
                    columnDefs={[{ field: 'a' }]}
                    rowData={[{ a: 'a1' }, { a: 'a2' }]}
                    isFullWidthRow={(params) => params.rowNode.data?.a === 'a2'}
                    fullWidthCellRenderer={() => 'full width'}
                    modules={[ClientSideRowModelModule, RowApiModule]}
                    onGridReady={(e) => (api = e.api)}
                />
            </React.StrictMode>
        );
        const cell = () => container.querySelector('.ag-row[row-index="0"] .ag-cell[col-id="a"]');
        const fullWidthRow = () => container.querySelector('.ag-full-width-row[row-index="1"]');
        await waitFor(() => expect(fullWidthRow()).not.toBeNull());
        const input = document.body.appendChild(document.createElement('input'));
        onTestFinished(() => input.remove());
        const expectFocusTakenBackUnlessMoved = async (rowIndex: number, focused: () => Element | null) => {
            act(() => {
                api!.setFocusedCell(rowIndex, 'a');
                api!.redrawRows();
            });
            await waitFor(() => expect(document.activeElement).toBe(focused()));

            act(() => {
                api!.redrawRows();
                input.focus();
            });
            await act(async () => {
                await asyncSetTimeout(0);
            });
            expect(document.activeElement).toBe(input);
        };

        await expectFocusTakenBackUnlessMoved(0, cell);
        await expectFocusTakenBackUnlessMoved(1, fullWidthRow);
    });

    test('a focused cell rebuilt while a focus trap holds focus around the grid takes focus back', async () => {
        let api: GridApi | undefined;
        const { container } = render(
            <React.StrictMode>
                <div tabIndex={-1} id="trap">
                    <AgGridReact
                        columnDefs={[{ field: 'a' }]}
                        rowData={[{ a: 'a1' }, { a: 'a2' }]}
                        modules={[ClientSideRowModelModule, RenderApiModule, RowApiModule, RowDragModule]}
                        onGridReady={(e) => (api = e.api)}
                    />
                </div>
            </React.StrictMode>
        );
        const cell = () => container.querySelector('.ag-row[row-index="0"] .ag-cell[col-id="a"]');
        await waitFor(() => expect(cell()).not.toBeNull());
        const trap = container.querySelector<HTMLElement>('#trap')!;
        const observer = new MutationObserver(() => {
            if (document.activeElement === document.body) {
                trap.focus();
            }
        });
        observer.observe(trap, { childList: true, subtree: true });
        onTestFinished(() => observer.disconnect());
        act(() => api!.setFocusedCell(0, 'a'));
        await waitFor(() => expect(document.activeElement).toBe(cell()));
        const before = cell();
        act(() => {
            api!.setGridOption('columnDefs', [{ field: 'a', rowDrag: true }]);
            api!.refreshCells({ force: true });
        });
        await waitFor(() => expect(cell()).not.toBe(before));
        await act(async () => {
            await asyncSetTimeout(0);
        });
        expect(document.activeElement).toBe(cell());
    });
});
