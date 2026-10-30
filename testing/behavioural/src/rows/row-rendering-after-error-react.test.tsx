import { act, cleanup, render, waitFor } from '@testing-library/react';
import { asyncSetTimeout, mockGridLayout } from 'ag-test-utils';
import React from 'react';

import {
    ClientSideRowModelModule,
    ColumnApiModule,
    ModuleRegistry,
    RenderApiModule,
    RowApiModule,
    ScrollApiModule,
} from 'ag-grid-community';
import type { ColDef, GridApi, IsFullWidthRowParams } from 'ag-grid-community';
import { RowGroupingModule } from 'ag-grid-enterprise';
import { AgGridReact } from 'ag-grid-react';

type Row = { id: string; a: string };

const buildRows = (count: number, prefix: string): Row[] =>
    Array.from({ length: count }, (_, i) => ({ id: `${prefix}-${i}`, a: `${prefix}-${i}` }));

const columnDefs: ColDef<Row>[] = [{ field: 'a' }];
const getRowId = (params: { data: Row }) => params.data.id;

describe('Row rendering after an error while rows are drawn (React)', () => {
    beforeAll(() => {
        ModuleRegistry.registerModules([
            ClientSideRowModelModule,
            ColumnApiModule,
            RenderApiModule,
            RowApiModule,
            RowGroupingModule,
            ScrollApiModule,
        ]);
        mockGridLayout.init();
    });

    afterEach(async () => {
        await act(async () => {
            await asyncSetTimeout(0);
            cleanup();
        });
    });

    test('an update that threw shows the rows drawn before the throw, and row data passed as a prop after it is drawn', async () => {
        let thrown = false;
        const isFullWidthRow = (params: IsFullWidthRowParams<Row>) => {
            if (!thrown && params.rowNode.id === 'bad-1') {
                thrown = true;
                throw new Error('isFullWidthRow failed');
            }
            return false;
        };
        let resolveApi: (api: GridApi<Row>) => void;
        const apiPromise = new Promise<GridApi<Row>>((resolve) => (resolveApi = resolve));
        const renderGrid = (rowData: Row[]) => (
            <div style={{ width: 600, height: 400 }}>
                <AgGridReact<Row>
                    rowData={rowData}
                    columnDefs={columnDefs}
                    getRowId={getRowId}
                    isFullWidthRow={isFullWidthRow}
                    onGridReady={(e) => resolveApi(e.api)}
                />
            </div>
        );

        const { container, rerender } = render(renderGrid(buildRows(3, 'row')));
        const api = await apiPromise;
        const renderedRowIds = () =>
            Array.from(container.querySelectorAll('.ag-row'))
                .map((row) => row.getAttribute('row-id'))
                .sort();
        await waitFor(() => expect(renderedRowIds()).toEqual(['row-0', 'row-1', 'row-2']));

        let error: unknown;
        await act(async () => {
            try {
                api.setGridOption('rowData', buildRows(2, 'bad'));
            } catch (e) {
                error = e;
            }
        });
        expect(error).toEqual(new Error('isFullWidthRow failed'));
        await waitFor(() => expect(renderedRowIds()).toEqual(['bad-0']));

        await act(async () => rerender(renderGrid(buildRows(2, 'next'))));

        await waitFor(() => expect(renderedRowIds()).toEqual(['next-0', 'next-1']));
    });

    test('a row whose cell threw while drawn leaves nothing behind: a column change formats each row shown once', async () => {
        const formattedRowIds: string[] = [];
        let throwFor: string | undefined;
        const formattedColumnDefs: ColDef<Row>[] = [
            {
                field: 'a',
                valueFormatter: (params) => {
                    const id = params.node!.id!;
                    if (id === throwFor) {
                        throwFor = undefined;
                        throw new Error('valueFormatter failed');
                    }
                    formattedRowIds.push(id);
                    return params.value;
                },
            },
            { colId: 'b', field: 'a' },
        ];
        let resolveApi: (api: GridApi<Row>) => void;
        const apiPromise = new Promise<GridApi<Row>>((resolve) => (resolveApi = resolve));
        const container = render(
            <div style={{ width: 600, height: 400 }}>
                <AgGridReact<Row>
                    rowData={buildRows(1, 'row')}
                    columnDefs={formattedColumnDefs}
                    getRowId={getRowId}
                    onGridReady={(e) => resolveApi(e.api)}
                />
            </div>
        ).container;
        const api = await apiPromise;
        const cellText = (rowId: string) =>
            container.querySelector(`.ag-row[row-id="${rowId}"] .ag-cell[col-id="a"]`)?.textContent;
        await waitFor(() => expect(cellText('row-0')).toBe('row-0'));

        throwFor = 'next-1';
        let error: unknown;
        await act(async () => {
            try {
                api.setGridOption('rowData', buildRows(2, 'next'));
            } catch (e) {
                error = e;
            }
        });
        expect(error).toEqual(new Error('valueFormatter failed'));
        await act(async () => api.setGridOption('rowData', buildRows(2, 'next')));
        await waitFor(() => expect(cellText('next-1')).toBe('next-1'));
        formattedRowIds.length = 0;

        await act(async () => {
            api.setColumnsVisible(['a'], false);
            api.setColumnsVisible(['a'], true);
        });
        await waitFor(() => expect(cellText('next-1')).toBe('next-1'));
        expect(formattedRowIds.sort()).toEqual(['next-0', 'next-1']);
    });

    test('a sticky row whose redraw threw stays shown, and the next redraw replaces it', async () => {
        type GroupedRow = Row & { g1: string; g2: string };
        let throwFor: string | undefined;
        let resolveApi: (api: GridApi<GroupedRow>) => void;
        const apiPromise = new Promise<GridApi<GroupedRow>>((resolve) => (resolveApi = resolve));
        const container = render(
            <div style={{ width: 600, height: 400 }}>
                <AgGridReact<GroupedRow>
                    columnDefs={[
                        { field: 'g1', rowGroup: true, hide: true },
                        { field: 'g2', rowGroup: true, hide: true },
                        { field: 'a' },
                    ]}
                    rowData={Array.from({ length: 200 }, (_, i) => ({
                        id: `row-${i}`,
                        a: `row-${i}`,
                        g1: i < 100 ? 'A' : 'B',
                        g2: i % 100 < 50 ? 'X' : 'Y',
                    }))}
                    getRowId={(p) => p.data.id}
                    groupDefaultExpanded={-1}
                    rowHeight={25}
                    isFullWidthRow={(params) => {
                        if (params.rowNode.id === throwFor) {
                            throwFor = undefined;
                            throw new Error('isFullWidthRow failed');
                        }
                        return false;
                    }}
                    onGridReady={(e) => resolveApi(e.api)}
                />
            </div>
        ).container;
        const api = await apiPromise;
        const groupBX = api.getRowNode('row-group-g1-B-g2-X')!;
        const stickyRow = () =>
            container.querySelector(`.ag-grid-sticky-top-rows-container .ag-row[row-id="${groupBX.id}"]`);
        await act(async () => api.ensureIndexVisible(115, 'top'));
        await waitFor(() => expect(stickyRow()).not.toBeNull());
        const shownRow = stickyRow();

        throwFor = groupBX.id;
        let error: unknown;
        await act(async () => {
            try {
                api.redrawRows({ rowNodes: [groupBX] });
            } catch (e) {
                error = e;
            }
        });
        expect({ error, sameRow: stickyRow() === shownRow }).toEqual({
            error: new Error('isFullWidthRow failed'),
            sameRow: true,
        });

        await act(async () => api.redrawRows({ rowNodes: [groupBX] }));
        await waitFor(() => expect(stickyRow()).not.toBe(shownRow));
        expect(stickyRow()).not.toBeNull();
    });
    test('under StrictMode, after a scroll that threw, scrolls and row data passed as a prop draw, also after an unmount and remount', async () => {
        let throwFor: string | undefined;
        let api: GridApi<Row> | undefined;
        const renderGrid = (rowData: Row[]) => (
            <React.StrictMode>
                <div style={{ width: 600, height: 400 }}>
                    <AgGridReact<Row>
                        rowData={rowData}
                        columnDefs={columnDefs}
                        getRowId={getRowId}
                        rowHeight={25}
                        suppressRowVirtualisation={false}
                        isFullWidthRow={(params) => {
                            if (params.rowNode.id === throwFor) {
                                throwFor = undefined;
                                throw new Error('isFullWidthRow failed');
                            }
                            return false;
                        }}
                        onGridReady={(e) => (api = e.api)}
                    />
                </div>
            </React.StrictMode>
        );
        const { container, rerender, unmount } = render(renderGrid(buildRows(200, 'row')));
        const renderedRowIds = () =>
            Array.from(container.querySelectorAll('.ag-row')).map((row) => row.getAttribute('row-id'));
        await waitFor(() => expect(renderedRowIds()).toContain('row-0'));

        throwFor = 'row-100';
        let error: unknown;
        await act(async () => {
            try {
                api!.ensureIndexVisible(100, 'top');
            } catch (e) {
                error = e;
            }
        });
        expect(error).toEqual(new Error('isFullWidthRow failed'));
        await act(async () => api!.ensureIndexVisible(150, 'top'));
        await waitFor(() => expect(renderedRowIds()).toContain('row-150'));

        await act(async () => rerender(renderGrid(buildRows(200, 'next'))));
        await waitFor(() => expect(renderedRowIds()).toContain('next-150'));

        unmount();
        const remounted = render(renderGrid(buildRows(3, 'again')));
        await waitFor(() =>
            expect(
                Array.from(remounted.container.querySelectorAll('.ag-row'))
                    .map((row) => row.getAttribute('row-id'))
                    .sort()
            ).toEqual(['again-0', 'again-1', 'again-2'])
        );
    });
});
