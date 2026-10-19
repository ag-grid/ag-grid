import { act, cleanup, render, screen, waitFor } from '@testing-library/react';
import { asyncSetTimeout } from 'ag-test-utils';
import React from 'react';
import { afterEach, describe, expect, it, onTestFinished } from 'vitest';

import type { ColDef, GridApi, GridReadyEvent, HeaderStyle } from 'ag-grid-community';
import { AllCommunityModule } from 'ag-grid-community';
import { CellSelectionModule } from 'ag-grid-enterprise';
import { AgGridReact } from 'ag-grid-react';

const rowData = [{ c0: 1, c1: 2, c2: 3, c3: 4, c4: 5 }];
const columnDefs: ColDef[] = [0, 1, 2, 3, 4].map((i) => ({ colId: `c${i}`, field: `c${i}` }));
const ids = columnDefs.map((c) => c.colId!);

describe('React header cell reuse', () => {
    afterEach(() => cleanup());

    it('cleans up header styles when pinning and unpinning', async () => {
        const apiRef: { current?: GridApi } = {};
        const { container } = render(
            <AgGridReact
                rowData={rowData}
                columnDefs={columnDefs.slice(0, 2)}
                defaultColDef={{
                    filter: 'agTextColumnFilter',
                    floatingFilter: true,
                    headerStyle: ({ column }): HeaderStyle =>
                        column!.isPinned()
                            ? {
                                  backgroundColor: 'orange',
                                  border: '1px solid black',
                                  borderBottom: '3px solid orange',
                              }
                            : { border: '1px solid black' },
                }}
                modules={[AllCommunityModule]}
                onGridReady={(e: GridReadyEvent) => {
                    apiRef.current = e.api;
                }}
            />
        );
        const headers = () => Array.from(container.querySelectorAll<HTMLElement>('.ag-header-cell[col-id]'));
        await waitFor(() => expect(headers()).toHaveLength(4));

        for (const pinned of ['left', null, 'right', null] as const) {
            act(() => apiRef.current!.setColumnsPinned(['c0', 'c1'], pinned));
            await waitFor(() => {
                for (const header of headers()) {
                    expect(header.style.backgroundColor).toBe(pinned ? 'orange' : '');
                    expect(header.style.borderBottom).toBe(pinned ? '3px solid orange' : '1px solid black');
                }
            });
        }
    });

    it('hide-all then show-all renders correct headers (pooled-ctrl remount is safe)', async () => {
        const apiRef: { current?: GridApi } = {};
        render(
            <AgGridReact
                rowData={rowData}
                columnDefs={columnDefs}
                modules={[AllCommunityModule]}
                onGridReady={(e: GridReadyEvent) => {
                    apiRef.current = e.api;
                }}
            />
        );

        const colIds = () => screen.queryAllByRole('columnheader').map((h) => h.getAttribute('col-id'));

        await waitFor(() => expect(colIds()).toEqual(ids));

        // Hidden columns must not be rendered.
        act(() => apiRef.current!.setColumnsVisible(ids, false));
        await waitFor(() => expect(screen.queryAllByRole('columnheader').length).toBe(0));

        // Re-show: pooled ctrls are reused and React remounts the cells correctly.
        act(() => apiRef.current!.setColumnsVisible(ids, true));
        await waitFor(() => expect(colIds()).toEqual(ids));

        // A single-column round-trip also stays correct.
        act(() => apiRef.current!.setColumnsVisible(['c2'], false));
        await waitFor(() => expect(colIds()).toEqual(['c0', 'c1', 'c3', 'c4']));
        act(() => apiRef.current!.setColumnsVisible(['c2'], true));
        await waitFor(() => expect(colIds()).toEqual(ids));
    });

    it('a header cell remounted in another lane highlights the ranges covering it', async () => {
        const apiRef: { current?: GridApi } = {};
        render(
            <AgGridReact
                rowData={rowData}
                columnDefs={columnDefs}
                modules={[AllCommunityModule, CellSelectionModule]}
                cellSelection={{ enableHeaderHighlight: true }}
                onGridReady={(e: GridReadyEvent) => {
                    apiRef.current = e.api;
                }}
            />
        );
        const highlighted = () =>
            Array.from(document.querySelectorAll('.ag-header-range-highlight'), (cell) => cell.getAttribute('col-id'));
        await waitFor(() => expect(screen.queryAllByRole('columnheader').length).toBe(ids.length));

        act(() => apiRef.current!.addCellRange({ rowStartIndex: 0, rowEndIndex: 0, columns: ['c1'] }));
        await waitFor(() => expect(highlighted()).toEqual(['c1']));

        // a header cell moved to another lane is drawn in a new element
        const before = document.querySelector('.ag-header-cell[col-id="c1"]');
        act(() => apiRef.current!.setColumnsPinned(['c1'], 'left'));
        await waitFor(() => expect(document.querySelector('.ag-header-cell[col-id="c1"]')).not.toBe(before));
        await waitFor(() => expect(highlighted()).toEqual(['c1']));

        // the remounted cell's own highlight has to follow the ranges, not just its first draw
        act(() => apiRef.current!.clearCellSelection());
        await waitFor(() => expect(highlighted()).toEqual([]));
        act(() => apiRef.current!.addCellRange({ rowStartIndex: 0, rowEndIndex: 0, columns: ['c1', 'c3'] }));
        await waitFor(() => expect(highlighted()).toEqual(['c1', 'c3']));
    });

    it('a header asked for focus before it mounts takes it, also from an input, unless focus has since moved out of the grid', async () => {
        const apiRef: { current?: GridApi } = {};
        render(
            <React.StrictMode>
                <AgGridReact
                    rowData={rowData}
                    columnDefs={columnDefs}
                    modules={[AllCommunityModule]}
                    onGridReady={(e: GridReadyEvent) => {
                        apiRef.current = e.api;
                    }}
                />
            </React.StrictMode>
        );
        const header = () => document.querySelector('.ag-header-cell[col-id="c2"]');
        await waitFor(() => expect(screen.queryAllByRole('columnheader').length).toBe(ids.length));
        const input = document.body.appendChild(document.createElement('input'));
        onTestFinished(() => input.remove());

        act(() => apiRef.current!.setColumnsVisible(['c2'], false));
        await waitFor(() => expect(header()).toBeNull());
        act(() => {
            apiRef.current!.setColumnsVisible(['c2'], true);
            apiRef.current!.setFocusedHeader('c2');
        });
        await waitFor(() => expect(document.activeElement).toBe(header()));

        act(() => apiRef.current!.setColumnsVisible(['c2'], false));
        await waitFor(() => expect(header()).toBeNull());
        act(() => {
            apiRef.current!.setColumnsVisible(['c2'], true);
            apiRef.current!.setFocusedHeader('c2');
            input.focus();
        });
        await waitFor(() => expect(header()).not.toBeNull());
        await act(async () => {
            await asyncSetTimeout(0);
        });
        expect(document.activeElement).toBe(input);

        act(() => apiRef.current!.setColumnsVisible(['c2'], false));
        await waitFor(() => expect(header()).toBeNull());
        input.blur();
        act(() => {
            apiRef.current!.setColumnsVisible(['c2'], true);
            apiRef.current!.setFocusedHeader('c2');
            input.focus();
            apiRef.current!.setFocusedHeader('c2');
        });
        await waitFor(() => expect(document.activeElement).toBe(header()));
    });

    it('of headers and cells asked for focus before they mount, the one asked last takes it', async () => {
        const apiRef: { current?: GridApi } = {};
        render(
            <React.StrictMode>
                <AgGridReact
                    rowData={rowData}
                    columnDefs={columnDefs}
                    modules={[AllCommunityModule]}
                    onGridReady={(e: GridReadyEvent) => {
                        apiRef.current = e.api;
                    }}
                />
            </React.StrictMode>
        );
        const header = (colId: string) => () => document.querySelector(`.ag-header-cell[col-id="${colId}"]`);
        const cell = () => document.querySelector('.ag-cell[col-id="c2"]');
        await waitFor(() => expect(screen.queryAllByRole('columnheader').length).toBe(ids.length));
        const expectLastAskedFocused = async (askBoth: (api: GridApi) => void, focused: () => Element | null) => {
            act(() => apiRef.current!.setColumnsVisible(['c2', 'c3'], false));
            await waitFor(() => expect(header('c3')()).toBeNull());
            (document.activeElement as HTMLElement).blur();
            act(() => {
                apiRef.current!.setColumnsVisible(['c2', 'c3'], true);
                askBoth(apiRef.current!);
            });
            await waitFor(() => expect(cell()).not.toBeNull());
            await act(async () => {
                await asyncSetTimeout(0);
            });
            expect(document.activeElement).toBe(focused());
        };

        await expectLastAskedFocused((api) => {
            api.setFocusedHeader('c2');
            api.setFocusedCell(0, 'c2');
        }, cell);
        await expectLastAskedFocused((api) => {
            api.setFocusedCell(0, 'c2');
            api.setFocusedHeader('c2');
        }, header('c2'));
        await expectLastAskedFocused((api) => {
            api.setFocusedHeader('c2');
            api.setFocusedHeader('c3');
        }, header('c3'));
        await expectLastAskedFocused((api) => {
            api.setFocusedHeader('c3');
            api.setFocusedHeader('c2');
        }, header('c2'));
    });

    it('a header cell shows its column filtered, also one told while it is remounted in another lane', async () => {
        const apiRef: { current?: GridApi } = {};
        render(
            <AgGridReact
                rowData={rowData}
                columnDefs={columnDefs.map((colDef) => ({ ...colDef, filter: 'agNumberColumnFilter' }))}
                modules={[AllCommunityModule]}
                onGridReady={(e: GridReadyEvent) => {
                    apiRef.current = e.api;
                }}
            />
        );
        const filtered = () =>
            Array.from(document.querySelectorAll('.ag-header-cell-filtered'), (cell) => cell.getAttribute('col-id'));
        await waitFor(() => expect(screen.queryAllByRole('columnheader').length).toBe(ids.length));

        act(() => apiRef.current!.setFilterModel({ c1: { filterType: 'number', type: 'equals', filter: 2 } }));
        await waitFor(() => expect(filtered()).toEqual(['c1']));

        const before = document.querySelector('.ag-header-cell[col-id="c3"]');
        act(() => {
            apiRef.current!.setColumnsPinned(['c3'], 'left');
            apiRef.current!.setFilterModel({ c3: { filterType: 'number', type: 'equals', filter: 4 } });
        });
        await waitFor(() => expect(document.querySelector('.ag-header-cell[col-id="c3"]')).not.toBe(before));
        await waitFor(() => expect(filtered()).toEqual(['c3']));
    });
});
