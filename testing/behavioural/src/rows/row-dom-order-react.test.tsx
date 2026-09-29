import { act, cleanup, render, waitFor } from '@testing-library/react';
import { asyncSetTimeout } from 'ag-test-utils';
import React, { Profiler } from 'react';

import type { GridApi } from 'ag-grid-community';
import {
    ClientSideRowModelModule,
    ColumnApiModule,
    ModuleRegistry,
    RenderApiModule,
    getGridElement,
} from 'ag-grid-community';
import { AgGridReact } from 'ag-grid-react';

interface Row {
    id: string;
}

interface Cols {
    a: string;
    b: string;
    c: string;
}

const rowIdsInDom = (api: GridApi<Row>) =>
    Array.from(getGridElement(api)!.querySelectorAll('.ag-row'), (row) => row.getAttribute('row-id'));

const rowCellColIds = (api: GridApi<Cols>, rowIndex: number) =>
    Array.from(getGridElement(api)!.querySelectorAll(`.ag-row[row-index="${rowIndex}"] .ag-cell`), (cell) =>
        cell.getAttribute('col-id')
    );

const cellColIds = (api: GridApi<Cols>, lane: 'pinned-left' | 'scrolling') =>
    Array.from(getGridElement(api)!.querySelectorAll(`.ag-row .ag-grid-${lane}-cells .ag-cell`), (cell) =>
        cell.getAttribute('col-id')
    );

describe('row DOM order (React)', () => {
    beforeAll(() => {
        ModuleRegistry.registerModules([ClientSideRowModelModule, ColumnApiModule, RenderApiModule]);
    });

    afterEach(() => {
        cleanup();
    });

    const renderGrid = (ensureDomOrder: boolean) => {
        let api: GridApi<Row> | undefined;
        render(
            <AgGridReact<Row>
                rowData={[{ id: 'a' }, { id: 'b' }, { id: 'c' }]}
                columnDefs={[{ field: 'id' }]}
                getRowId={(params) => params.data.id}
                ensureDomOrder={ensureDomOrder}
                onGridReady={(e) => {
                    api = e.api;
                }}
            />
        );
        return () => api!;
    };

    test('with ensureDomOrder, reordered rows follow the new order in the DOM', async () => {
        const api = renderGrid(true);
        await waitFor(() => expect(rowIdsInDom(api())).toEqual(['a', 'b', 'c']));

        act(() => api().setGridOption('rowData', [{ id: 'c' }, { id: 'b' }, { id: 'a' }]));

        await waitFor(() => expect(rowIdsInDom(api())).toEqual(['c', 'b', 'a']));
    });

    test('without ensureDomOrder, rows kept through a reorder keep their DOM place', async () => {
        const api = renderGrid(false);
        await waitFor(() => expect(rowIdsInDom(api())).toEqual(['a', 'b', 'c']));

        act(() => api().setGridOption('rowData', [{ id: 'c' }, { id: 'a' }, { id: 'd' }]));

        await waitFor(() => expect(rowIdsInDom(api())).toEqual(['a', 'c', 'd']));
    });

    test('without ensureDomOrder, a row added before rows kept in order goes after them in the DOM', async () => {
        const api = renderGrid(false);
        await waitFor(() => expect(rowIdsInDom(api())).toEqual(['a', 'b', 'c']));

        act(() => api().setGridOption('rowData', [{ id: 'd' }, { id: 'a' }, { id: 'b' }]));

        await waitFor(() => expect(rowIdsInDom(api())).toEqual(['a', 'b', 'd']));
    });

    test('setting empty rowData on a grid that is already empty commits nothing', async () => {
        let api: GridApi<Row> | undefined;
        let commits = 0;
        render(
            <Profiler id="grid" onRender={() => ++commits}>
                <AgGridReact<Row>
                    rowData={[{ id: 'a' }]}
                    columnDefs={[{ field: 'id' }]}
                    getRowId={(params) => params.data.id}
                    onGridReady={(e) => {
                        api = e.api;
                    }}
                />
            </Profiler>
        );
        await waitFor(() => expect(rowIdsInDom(api!)).toEqual(['a']));
        await act(async () => {
            api!.setGridOption('rowData', []);
            await asyncSetTimeout(0);
        });

        commits = 0;
        await act(async () => {
            api!.setGridOption('rowData', []);
            await asyncSetTimeout(0);
        });

        expect(commits).toBe(0);
    });

    test('a column pinned after mount draws its cells in the pinned lane', async () => {
        let api: GridApi<Cols> | undefined;
        render(
            <AgGridReact<Cols>
                rowData={[{ a: 'a', b: 'b', c: 'c' }]}
                columnDefs={[{ field: 'a' }, { field: 'b' }, { field: 'c' }]}
                onGridReady={(e) => {
                    api = e.api;
                }}
            />
        );
        await waitFor(() => expect(cellColIds(api!, 'scrolling')).toEqual(['a', 'b', 'c']));

        act(() => {
            api!.applyColumnState({ state: [{ colId: 'b', pinned: 'left' }] });
        });

        await waitFor(() => expect(cellColIds(api!, 'pinned-left')).toEqual(['b']));
        expect(cellColIds(api!, 'scrolling')).toEqual(['a', 'c']);
    });

    test('in legacy rendering mode, a column pinned after mount draws its cells in the pinned lane', async () => {
        let api: GridApi<Cols> | undefined;
        render(
            <AgGridReact<Cols>
                rowData={[{ a: 'a', b: 'b', c: 'c' }]}
                columnDefs={[{ field: 'a' }, { field: 'b' }, { field: 'c' }]}
                renderingMode="legacy"
                onGridReady={(e) => {
                    api = e.api;
                }}
            />
        );
        await waitFor(() => expect(cellColIds(api!, 'scrolling')).toEqual(['a', 'b', 'c']));

        act(() => {
            api!.applyColumnState({ state: [{ colId: 'b', pinned: 'left' }] });
        });

        await waitFor(() => expect(cellColIds(api!, 'pinned-left')).toEqual(['b']));
        expect(cellColIds(api!, 'scrolling')).toEqual(['a', 'c']);
    });

    test('a row a scroll brings in draws its cells once they are laid out', async () => {
        let api: GridApi<Cols> | undefined;
        render(
            <AgGridReact<Cols>
                rowData={Array.from({ length: 100 }, (_, i) => ({ a: `a${i}`, b: `b${i}`, c: `c${i}` }))}
                columnDefs={[{ field: 'a' }, { field: 'b' }, { field: 'c' }]}
                onGridReady={(e) => {
                    api = e.api;
                }}
            />
        );
        await waitFor(() => expect(rowCellColIds(api!, 0)).toEqual(['a', 'b', 'c']));

        const viewport = getGridElement(api!)!.querySelector<HTMLElement>('.ag-grid-viewport')!;
        viewport.scrollTop = 1500;
        act(() => {
            viewport.dispatchEvent(new Event('scroll'));
        });
        act(() => {
            api!.flushAllAnimationFrames();
        });

        await waitFor(() => expect(rowCellColIds(api!, 35)).toEqual(['a', 'b', 'c']));
    });
});
