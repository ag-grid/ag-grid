import { act, cleanup, render, waitFor } from '@testing-library/react';
import { asyncSetTimeout } from 'ag-test-utils';
import { mockGridLayout } from 'ag-test-utils/polyfills/mockGridLayout';
import React from 'react';
import { afterEach, beforeAll, describe, expect, test } from 'vitest';

import type { ColDef, GridApi } from 'ag-grid-community';
import { ClientSideRowModelModule, ColumnApiModule } from 'ag-grid-community';
import { PivotModule } from 'ag-grid-enterprise';
import { AgGridReact } from 'ag-grid-react';

/** Each section's cells of every rendered row, by row index, as the DOM shows them. */
const renderedCells = () => {
    const rows: Record<string, Record<string, string[]>> = {};
    for (const row of document.querySelectorAll<HTMLElement>('.ag-row[row-index]')) {
        const sections: Record<string, string[]> = {};
        for (const section of ['pinned-left', 'scrolling', 'pinned-right']) {
            const cells = row.querySelectorAll(`:scope > .ag-grid-${section}-cells .ag-cell`);
            if (cells.length > 0) {
                sections[section] = Array.from(cells, (cell) => cell.getAttribute('col-id')!);
            }
        }
        rows[row.getAttribute('row-index')!] = sections;
    }
    return rows;
};

/** What every rendered row should show: the displayed columns of each section. */
const expectedCells = (api: GridApi, rowCount: number) => {
    const ids = (cols: { getColId(): string }[]) => cols.map((col) => col.getColId());
    const sections: Record<string, string[]> = {};
    const left = ids(api.getDisplayedLeftColumns());
    const center = ids(api.getDisplayedCenterColumns());
    const right = ids(api.getDisplayedRightColumns());
    if (left.length > 0) {
        sections['pinned-left'] = left;
    }
    if (center.length > 0) {
        sections['scrolling'] = center;
    }
    if (right.length > 0) {
        sections['pinned-right'] = right;
    }
    const rows: Record<string, Record<string, string[]>> = {};
    for (let i = 0; i < rowCount; ++i) {
        rows[String(i)] = sections;
    }
    return rows;
};

// React lays a row out a task after its ctrl exists: a row drawn inside a column update shows the final columns.
describe('rows drawing a column change (React)', () => {
    beforeAll(() => {
        mockGridLayout.init();
    });

    afterEach(() => {
        cleanup();
    });

    const rowData = [
        { country: 'Italy', sport: 'Rowing', year: 2020, gold: 1, silver: 2 },
        { country: 'Spain', sport: 'Sailing', year: 2021, gold: 3, silver: 4 },
    ];

    test('a pivot mode columnDefs update adding a value column draws its cells in every row', async () => {
        const columnDefs = (withSilver: boolean): ColDef[] => [
            { field: 'country', rowGroup: true },
            { field: 'year', pivot: true },
            { field: 'gold', aggFunc: 'sum' },
            { field: 'silver', aggFunc: withSilver ? 'sum' : null },
        ];
        let api: GridApi | undefined;
        const grid = (withSilver: boolean) => (
            <React.StrictMode>
                <AgGridReact
                    pivotMode
                    suppressColumnVirtualisation
                    columnDefs={columnDefs(withSilver)}
                    rowData={rowData}
                    modules={[ClientSideRowModelModule, ColumnApiModule, PivotModule]}
                    onGridReady={(e) => (api = e.api)}
                />
            </React.StrictMode>
        );

        const { rerender, unmount } = render(grid(false));
        await waitFor(() => expect(Object.keys(renderedCells())).toEqual(['0', '1']));
        expect(renderedCells()).toEqual(expectedCells(api!, 2));

        // the group column, then a column per year and value column
        for (const withSilver of [true, false, true]) {
            await act(async () => {
                rerender(grid(withSilver));
                await asyncSetTimeout(0);
            });
            await waitFor(() => expect(api!.getDisplayedCenterColumns().length).toBe(withSilver ? 5 : 3));
            await waitFor(() => expect(renderedCells()).toEqual(expectedCells(api!, 2)));
        }
        unmount();
    });

    test('pinning a hidden column shows its cells in every row’s pinned section', async () => {
        let api: GridApi | undefined;
        const grid = (
            <React.StrictMode>
                <AgGridReact
                    columnDefs={[{ field: 'country', hide: true }, { field: 'sport' }, { field: 'gold' }]}
                    rowData={rowData}
                    modules={[ClientSideRowModelModule, ColumnApiModule]}
                    onGridReady={(e) => (api = e.api)}
                />
            </React.StrictMode>
        );

        render(grid);
        await waitFor(() =>
            expect(renderedCells()).toEqual({
                0: { scrolling: ['sport', 'gold'] },
                1: { scrolling: ['sport', 'gold'] },
            })
        );

        await act(async () => {
            api!.applyColumnState({ state: [{ colId: 'country', hide: false, pinned: 'left' }] });
            await asyncSetTimeout(0);
        });

        const shown = { 'pinned-left': ['country'], scrolling: ['sport', 'gold'] };
        await waitFor(() => expect(renderedCells()).toEqual({ 0: shown, 1: shown }));
    });
});
