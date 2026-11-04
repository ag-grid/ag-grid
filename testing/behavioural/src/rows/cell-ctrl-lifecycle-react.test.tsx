import { act, cleanup, render, waitFor } from '@testing-library/react';
import { asyncSetTimeout } from 'ag-test-utils';
import React from 'react';
import { onTestFinished, vi } from 'vitest';

import type { GridApi } from 'ag-grid-community';
import {
    CellSpanModule,
    ClientSideRowModelApiModule,
    ClientSideRowModelModule,
    ColumnApiModule,
    RenderApiModule,
    RowApiModule,
    RowDragModule,
} from 'ag-grid-community';
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

    test.each(['a cell', 'a full-width row'] as const)(
        'setFocusedCell on %s React has not mounted yet, rebuilt by a redraw before it mounts, focuses the rebuilt one, even with suppressFocusAfterRefresh',
        async (kind) => {
            let api: GridApi | undefined;
            const container = render(
                <React.StrictMode>
                    <AgGridReact
                        columnDefs={[{ field: 'a' }]}
                        rowData={[{ a: 'a0' }]}
                        getRowId={(params) => params.data.a}
                        isFullWidthRow={(params) => kind === 'a full-width row' && params.rowNode.data?.a === 'a1'}
                        suppressFocusAfterRefresh
                        fullWidthCellRenderer={() => 'full width'}
                        modules={[ClientSideRowModelModule, ClientSideRowModelApiModule, RowApiModule]}
                        onGridReady={(e) => (api = e.api)}
                    />
                </React.StrictMode>
            ).container;
            await waitFor(() => expect(container.querySelector('.ag-row[row-id="a0"]')).not.toBeNull());
            const target = () =>
                container.querySelector(
                    kind === 'a cell' ? '.ag-row[row-id="a1"] .ag-cell[col-id="a"]' : '.ag-full-width-row[row-id="a1"]'
                );

            act(() => {
                api!.applyTransaction({ add: [{ a: 'a1' }] });
                expect(target()).toBeNull();
                api!.setFocusedCell(1, 'a');
                api!.redrawRows();
            });

            await waitFor(() => expect(document.activeElement).toBe(target()));
        }
    );

    test('a focused full-width row below another, both rebuilt by a redraw, takes focus back', async () => {
        let api: GridApi | undefined;
        const { container } = render(
            <React.StrictMode>
                <AgGridReact
                    columnDefs={[{ field: 'a' }]}
                    rowData={[{ a: 'a1' }, { a: 'a2' }]}
                    isFullWidthRow={() => true}
                    fullWidthCellRenderer={() => 'full width'}
                    modules={[ClientSideRowModelModule, RowApiModule, RenderApiModule]}
                    onGridReady={(e) => (api = e.api)}
                />
            </React.StrictMode>
        );
        const fullWidthRow = () => container.querySelector('.ag-full-width-row[row-index="1"]');
        await waitFor(() => expect(fullWidthRow()).not.toBeNull());
        act(() => api!.setFocusedCell(1, 'a'));
        await waitFor(() => expect(document.activeElement).toBe(fullWidthRow()));
        const before = fullWidthRow();

        act(() => api!.redrawRows());
        await waitFor(() => expect(fullWidthRow()).not.toBe(before));
        await act(async () => {
            await asyncSetTimeout(0);
        });
        expect(document.activeElement).toBe(fullWidthRow());
    });

    test('a header and then a cell focused before React mounts either: the cell, focused last, keeps focus', async () => {
        let api: GridApi | undefined;
        const container = render(
            <React.StrictMode>
                <AgGridReact
                    columnDefs={[{ field: 'a' }]}
                    rowData={[{ a: 'a0' }]}
                    getRowId={(params) => params.data.a}
                    modules={[ClientSideRowModelModule, ClientSideRowModelApiModule, RowApiModule]}
                    onGridReady={(e) => (api = e.api)}
                />
            </React.StrictMode>
        ).container;
        await waitFor(() => expect(container.querySelector('.ag-row[row-id="a0"]')).not.toBeNull());
        const cell = () => container.querySelector('.ag-row[row-id="a1"] .ag-cell[col-id="a"]');

        act(() => {
            api!.setGridOption('columnDefs', [{ field: 'a' }, { field: 'b' }]);
            api!.setFocusedHeader('b');
            api!.applyTransaction({ add: [{ a: 'a1' }] });
            api!.setFocusedCell(1, 'a');
        });
        await waitFor(() => expect(document.activeElement).toBe(cell()));
        await act(async () => {
            await asyncSetTimeout(0);
        });
        expect(document.activeElement).toBe(cell());
    });

    test('a header focused before React mounts it keeps focus though the focused cell holding focus is rebuilt meanwhile', async () => {
        let api: GridApi | undefined;
        const container = render(
            <React.StrictMode>
                <AgGridReact
                    columnDefs={[{ field: 'a' }]}
                    rowData={[{ a: 'a0' }]}
                    modules={[ClientSideRowModelModule, ColumnApiModule, RowApiModule]}
                    onGridReady={(e) => (api = e.api)}
                />
            </React.StrictMode>
        ).container;
        const cell = () => container.querySelector('.ag-row[row-index="0"] .ag-cell[col-id="a"]');
        const header = () => container.querySelector('.ag-header-cell[col-id="b"]');
        await waitFor(() => expect(cell()).not.toBeNull());
        act(() => api!.setFocusedCell(0, 'a'));
        await waitFor(() => expect(document.activeElement).toBe(cell()));

        act(() => {
            api!.setGridOption('columnDefs', [{ field: 'a' }, { field: 'b' }]);
            api!.setFocusedHeader('b');
            api!.setColumnsVisible(['a'], false);
            api!.setColumnsVisible(['a'], true);
        });
        await waitFor(() => expect(document.activeElement).toBe(header()));
        await act(async () => {
            await asyncSetTimeout(0);
        });
        expect(document.activeElement).toBe(header());
    });

    test('a focused cell rebuilt after a header asked for focus and was destroyed before React mounted it takes focus back', async () => {
        let api: GridApi | undefined;
        const container = render(
            <React.StrictMode>
                <AgGridReact
                    columnDefs={[{ field: 'a' }]}
                    rowData={[{ a: 'a0' }]}
                    modules={[ClientSideRowModelModule, ColumnApiModule, RowApiModule, RenderApiModule]}
                    onGridReady={(e) => (api = e.api)}
                />
            </React.StrictMode>
        ).container;
        const cell = () => container.querySelector('.ag-row[row-index="0"] .ag-cell[col-id="a"]');
        await waitFor(() => expect(cell()).not.toBeNull());
        act(() => api!.setFocusedCell(0, 'a'));
        await waitFor(() => expect(document.activeElement).toBe(cell()));
        act(() => {
            api!.setGridOption('columnDefs', [{ field: 'a' }, { field: 'b' }]);
            api!.setFocusedHeader('b');
            api!.setColumnsVisible(['b'], false);
        });
        await act(async () => {
            await asyncSetTimeout(0);
        });
        expect(document.activeElement).toBe(cell());

        const before = cell();
        act(() => api!.redrawRows());
        await waitFor(() => expect(cell()).not.toBe(before));
        await act(async () => {
            await asyncSetTimeout(0);
        });
        expect(document.activeElement).toBe(cell());
    });

    test('setFocusedCell on a row React has not mounted focuses it once mounted, and once only: a redraw after a blur leaves focus on the body', async () => {
        let api: GridApi | undefined;
        const container = render(
            <AgGridReact
                columnDefs={[{ field: 'a' }]}
                rowData={[{ a: 'a0' }]}
                getRowId={(params) => params.data.a}
                modules={[ClientSideRowModelModule, ClientSideRowModelApiModule, RowApiModule]}
                onGridReady={(e) => (api = e.api)}
            />
        ).container;
        await waitFor(() => expect(container.querySelector('.ag-row[row-id="a0"]')).not.toBeNull());
        const cell = () => container.querySelector('.ag-row[row-id="a1"] .ag-cell[col-id="a"]');

        act(() => {
            api!.applyTransaction({ add: [{ a: 'a1' }] });
            api!.setFocusedCell(1, 'a');
        });
        await waitFor(() => expect(document.activeElement).toBe(cell()));

        (document.activeElement as HTMLElement).blur();
        act(() => api!.redrawRows());
        await act(async () => {
            await asyncSetTimeout(0);
        });
        expect(document.activeElement).toBe(document.body);
    });

    test('setFocusedCell on a row React has not mounted, given up as focus moved out of the grid first, is not taken by a later redraw', async () => {
        let api: GridApi | undefined;
        const container = render(
            <AgGridReact
                columnDefs={[{ field: 'a' }]}
                rowData={[{ a: 'a0' }]}
                getRowId={(params) => params.data.a}
                modules={[ClientSideRowModelModule, ClientSideRowModelApiModule, RowApiModule]}
                onGridReady={(e) => (api = e.api)}
            />
        ).container;
        await waitFor(() => expect(container.querySelector('.ag-row[row-id="a0"]')).not.toBeNull());
        const input = document.body.appendChild(document.createElement('input'));
        onTestFinished(() => input.remove());

        act(() => {
            api!.applyTransaction({ add: [{ a: 'a1' }] });
            api!.setFocusedCell(1, 'a');
            input.focus();
        });
        await act(async () => {
            await asyncSetTimeout(0);
        });
        expect(document.activeElement).toBe(input);

        input.blur();
        act(() => api!.redrawRows());
        await act(async () => {
            await asyncSetTimeout(0);
        });
        expect(document.activeElement).toBe(document.body);
    });

    test.each(['light', 'open', 'closed', 'nested'] as const)(
        'in a %s grid, a focused cell rebuilt while a focus trap holds focus around the grid takes focus back',
        async (mode) => {
            const trap = document.body.appendChild(document.createElement('div'));
            trap.tabIndex = -1;
            onTestFinished(() => trap.remove());
            const outer =
                mode === 'nested'
                    ? trap.appendChild(document.createElement('div')).attachShadow({ mode: 'open' })
                    : trap;
            const gridRoot: Document | ShadowRoot =
                mode === 'light'
                    ? document
                    : outer
                          .appendChild(document.createElement('div'))
                          .attachShadow({ mode: mode === 'closed' ? 'closed' : 'open' });
            const container = (mode === 'light' ? trap : gridRoot).appendChild(document.createElement('div'));
            let api: GridApi | undefined;
            render(
                <React.StrictMode>
                    <AgGridReact
                        columnDefs={[{ field: 'a' }]}
                        rowData={[{ a: 'a1' }, { a: 'a2' }]}
                        modules={[ClientSideRowModelModule, RenderApiModule, RowApiModule, RowDragModule]}
                        onGridReady={(e) => (api = e.api)}
                    />
                </React.StrictMode>,
                { container }
            );
            const cell = () => container.querySelector('.ag-row[row-index="0"] .ag-cell[col-id="a"]');
            await waitFor(() => expect(cell()).not.toBeNull());
            const observer = new MutationObserver(() => {
                if (document.activeElement === document.body) {
                    trap.focus();
                }
            });
            observer.observe(mode === 'light' ? trap : gridRoot, { childList: true, subtree: true });
            onTestFinished(() => observer.disconnect());
            act(() => api!.setFocusedCell(0, 'a'));
            await waitFor(() => expect(gridRoot.activeElement).toBe(cell()));
            const before = cell();
            act(() => {
                api!.setGridOption('columnDefs', [{ field: 'a', rowDrag: true }]);
                api!.refreshCells({ force: true });
            });
            await waitFor(() => expect(cell()).not.toBe(before));
            await act(async () => {
                await asyncSetTimeout(0);
            });
            expect(gridRoot.activeElement).toBe(cell());
        }
    );

    test('unmounting a grid whose focused spanned cell holds focus leaves no listener on the document', async () => {
        let api: GridApi | undefined;
        const { container, unmount } = render(
            <React.StrictMode>
                <AgGridReact
                    columnDefs={[{ field: 'a', spanRows: true }, { field: 'b' }]}
                    rowData={[
                        { a: 'x', b: 1 },
                        { a: 'x', b: 2 },
                    ]}
                    enableCellSpan
                    modules={[ClientSideRowModelModule, CellSpanModule, RenderApiModule]}
                    onGridReady={(e) => (api = e.api)}
                />
            </React.StrictMode>
        );
        const spannedCell = () => container.querySelector('.ag-spanned-cell-wrapper .ag-cell[col-id="a"]');
        await waitFor(() => expect(spannedCell()).not.toBeNull());
        act(() => api!.setFocusedCell(0, 'a'));
        await waitFor(() => expect(document.activeElement).toBe(spannedCell()));

        // what the document still listens for: the event type, the capture flag and the listener, as removal matches them
        const listening: [string, boolean, unknown][] = [];
        const isCapture = (options?: boolean | EventListenerOptions) =>
            typeof options === 'boolean' ? options : !!options?.capture;
        const { addEventListener, removeEventListener } = document;
        const add = vi.spyOn(document, 'addEventListener').mockImplementation((type, listener, options) => {
            listening.push([type, isCapture(options), listener]);
            addEventListener.call(document, type, listener, options);
        });
        const remove = vi.spyOn(document, 'removeEventListener').mockImplementation((type, listener, options) => {
            const capture = isCapture(options);
            const index = listening.findIndex((l) => l[0] === type && l[1] === capture && l[2] === listener);
            if (index >= 0) {
                listening.splice(index, 1);
            }
            removeEventListener.call(document, type, listener, options);
        });
        onTestFinished(() => {
            add.mockRestore();
            remove.mockRestore();
        });
        unmount();
        expect(listening.map(([type]) => type)).toEqual([]);
    });
});
