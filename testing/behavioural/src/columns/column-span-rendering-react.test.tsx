import { act, cleanup, render, waitFor } from '@testing-library/react';
import { asyncSetTimeout } from 'ag-test-utils';
import React, { Profiler, StrictMode } from 'react';

import type { ColDef, GridApi } from 'ag-grid-community';
import {
    ClientSideRowModelApiModule,
    ClientSideRowModelModule,
    ModuleRegistry,
    RowApiModule,
    TextEditorModule,
    ValidationModule,
    getGridElement,
} from 'ag-grid-community';
import { AgGridReact } from 'ag-grid-react';

interface PriceRow {
    id: string;
    price: number;
    symbol: string;
    group: string;
}

const columnDefs: ColDef<PriceRow>[] = [
    { field: 'price', width: 100, colSpan: (params) => (params.data ? params.data.price + 1 : 1) },
    { field: 'symbol', width: 100 },
    { field: 'group', width: 100 },
];

const renderedRow = (api: GridApi, rowIndex: number) => {
    const row = getGridElement(api)!.querySelector(`.ag-row[row-index="${rowIndex}"]`);
    const cells = Array.from(row?.querySelectorAll<HTMLElement>('.ag-cell') ?? []);
    return cells.map((cell) => `${cell.getAttribute('col-id')}:${cell.style.width}`).join(' ');
};

describe('colSpan follows row data updates (React)', () => {
    beforeAll(() => {
        ModuleRegistry.registerModules([
            ClientSideRowModelApiModule,
            ClientSideRowModelModule,
            RowApiModule,
            TextEditorModule,
            ValidationModule,
        ]);
    });

    afterEach(() => {
        cleanup();
    });

    test('a span grows and shrinks when the rowData prop changes, keeping the focused cell until focus moves on', async () => {
        let api: GridApi | undefined;
        const Grid = ({ rowData }: { rowData: PriceRow[] }) => (
            <StrictMode>
                <AgGridReact
                    rowData={rowData}
                    columnDefs={columnDefs}
                    getRowId={(params) => params.data.id}
                    onGridReady={(e) => {
                        api = e.api;
                    }}
                />
            </StrictMode>
        );

        const { rerender } = render(
            <Grid
                rowData={[
                    { id: 'r0', price: 0, symbol: 'AAA', group: 'A' },
                    { id: 'r1', price: 2, symbol: 'BBB', group: 'A' },
                ]}
            />
        );

        await waitFor(() => expect(renderedRow(api!, 0)).toBe('price:100px symbol:100px group:100px'));
        expect(renderedRow(api!, 1)).toBe('price:300px');
        act(() => api!.setFocusedCell(0, 'symbol'));

        rerender(
            <Grid
                rowData={[
                    { id: 'r0', price: 1, symbol: 'AAA', group: 'A' },
                    { id: 'r1', price: 0, symbol: 'BBB', group: 'A' },
                ]}
            />
        );

        await waitFor(() => expect(renderedRow(api!, 0)).toBe('price:200px symbol:100px group:100px'));
        expect(renderedRow(api!, 1)).toBe('price:100px symbol:100px group:100px');

        act(() => api!.setFocusedCell(1, 'price'));
        await waitFor(() => expect(renderedRow(api!, 0)).toBe('price:200px group:100px'));
    });

    test('a data update that moves no span and changes no value or business key re-renders nothing, colSpan or not', async () => {
        const noSpanColumnDefs: ColDef<PriceRow>[] = [{ ...columnDefs[0], colSpan: undefined }, ...columnDefs.slice(1)];
        const cases = [
            { defs: columnDefs, row: 'price:200px group:100px' },
            { defs: noSpanColumnDefs, row: 'price:100px symbol:100px group:100px' },
        ];
        for (const { defs, row } of cases) {
            let api: GridApi | undefined;
            let commits = 0;
            const rowData: PriceRow[] = [{ id: 'r0', price: 1, symbol: 'AAA', group: 'A' }];
            render(
                <Profiler id="grid" onRender={() => ++commits}>
                    <AgGridReact
                        rowData={rowData}
                        columnDefs={defs}
                        getRowId={(params) => params.data.id}
                        getBusinessKeyForNode={(node) => node.data!.symbol}
                        suppressAnimationFrame
                        onGridReady={(e) => {
                            api = e.api;
                        }}
                    />
                </Profiler>
            );
            await waitFor(() => expect(renderedRow(api!, 0)).toBe(row));
            await act(async () => {
                await asyncSetTimeout(0);
            });

            commits = 0;
            await act(async () => {
                api!.applyTransaction({ update: [{ ...rowData[0] }] });
                await asyncSetTimeout(0);
            });
            expect({ row, commits }).toEqual({ row, commits: 0 });
            cleanup();
        }
    });

    test('a span growing over the edited cell keeps it until editing stops, after focus has moved on', async () => {
        let api: GridApi | undefined;
        const editableColumnDefs: ColDef<PriceRow>[] = [
            columnDefs[0],
            { ...columnDefs[1], editable: true },
            columnDefs[2],
        ];
        render(
            <StrictMode>
                <AgGridReact
                    rowData={[
                        { id: 'r0', price: 0, symbol: 'AAA', group: 'A' },
                        { id: 'r1', price: 0, symbol: 'BBB', group: 'A' },
                    ]}
                    columnDefs={editableColumnDefs}
                    getRowId={(params) => params.data.id}
                    // rebuilds run synchronously, so the check after the focus move sees the rebuild it causes
                    suppressAnimationFrame
                    onGridReady={(e) => {
                        api = e.api;
                    }}
                />
            </StrictMode>
        );
        const editor = () => getGridElement(api!)!.querySelector('[row-index="0"] [col-id="symbol"] input');
        await waitFor(() => expect(renderedRow(api!, 0)).toBe('price:100px symbol:100px group:100px'));

        act(() => api!.startEditingCell({ rowIndex: 0, colKey: 'symbol' }));
        await waitFor(() => expect(editor()).not.toBeNull());
        act(() => {
            api!.getRowNode('r0')!.setDataValue('price', 1);
        });
        await waitFor(() => expect(renderedRow(api!, 0)).toBe('price:200px symbol:100px group:100px'));

        act(() => api!.setFocusedCell(1, 'price'));
        expect(editor()).not.toBeNull();
        act(() => api!.stopEditing());
        await waitFor(() => expect(renderedRow(api!, 0)).toBe('price:200px group:100px'));
    });
});
