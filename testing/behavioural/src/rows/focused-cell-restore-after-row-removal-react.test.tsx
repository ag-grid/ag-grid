import { act, cleanup, render, waitFor } from '@testing-library/react';
import { asyncSetTimeout } from 'ag-test-utils';
import { mockGridLayout } from 'ag-test-utils/polyfills/mockGridLayout';
import React from 'react';

import { ClientSideRowModelModule, ModuleRegistry, ScrollApiModule } from 'ag-grid-community';
import type { GridApi } from 'ag-grid-community';
import { AgGridReact } from 'ag-grid-react';

const ROW_COUNT = 100;
const REMOVE = 5;
const COLS = Array.from({ length: 12 }, (_, i) => `col${i}`);
const LAST_ROW = ROW_COUNT - 1;
const LAST_COL = COLS[COLS.length - 1];
const FALLBACK_ROW = LAST_ROW - REMOVE;

type Row = Record<string, string>;

const buildRows = (count: number): Row[] =>
    Array.from({ length: count }, (_, r) => {
        const row: Row = { id: `row-${r}` };
        for (const c of COLS) {
            row[c] = `${c}-${r}`;
        }
        return row;
    });

const columnDefs = COLS.map((colId) => ({ colId, field: colId, width: 200 }));

describe('Focused cell restore after row removal (React)', () => {
    beforeAll(() => {
        // without a laid-out grid, columns are not virtualised and the scenario cannot occur
        mockGridLayout.resetOptions();
        mockGridLayout.init();
        ModuleRegistry.registerModules([ClientSideRowModelModule, ScrollApiModule]);
    });

    afterEach(async () => {
        await act(async () => {
            await asyncSetTimeout(0);
            cleanup();
        });
    });

    test.each([false, true])(
        'rowData update removing the focused row completes when the focused column is scrolled out of view (suppressAnimationFrame: %s)',
        async (suppressAnimationFrame) => {
            let resolveApi: (api: GridApi<Row>) => void;
            const apiPromise = new Promise<GridApi<Row>>((resolve) => (resolveApi = resolve));

            const { container } = render(
                <div style={{ width: 1000, height: 800 }}>
                    <AgGridReact<Row>
                        rowData={buildRows(ROW_COUNT)}
                        columnDefs={columnDefs}
                        getRowId={(p) => p.data.id}
                        rowHeight={40}
                        suppressAnimationFrame={suppressAnimationFrame}
                        onGridReady={(e) => resolveApi(e.api)}
                    />
                </div>
            );
            const api = await apiPromise;
            const hasCell = (rowIndex: number, colId: string) =>
                !!container.querySelector(`.ag-row[row-index="${rowIndex}"] .ag-cell[col-id="${colId}"]`);

            await act(async () => api.ensureIndexVisible(LAST_ROW, 'bottom'));
            await waitFor(() => expect(hasCell(LAST_ROW, 'col0')).toBe(true));
            await act(async () => api.ensureColumnVisible(LAST_COL));
            await waitFor(() => expect(hasCell(LAST_ROW, LAST_COL)).toBe(true));
            await act(async () => api.setFocusedCell(LAST_ROW, LAST_COL));
            await act(async () => api.ensureColumnVisible('col0'));
            await waitFor(() => expect(hasCell(FALLBACK_ROW, 'col0')).toBe(true));

            // preconditions: the focused column stays rendered only on the focused row, and the row focus falls back to is rendered
            expect(hasCell(LAST_ROW, LAST_COL)).toBe(true);
            expect(hasCell(FALLBACK_ROW, LAST_COL)).toBe(false);

            let error: unknown;
            await act(async () => {
                try {
                    api.setGridOption('rowData', buildRows(ROW_COUNT - REMOVE));
                } catch (e) {
                    error = e;
                }
            });
            expect(error).toBeUndefined();

            await waitFor(() => {
                const active = document.activeElement;
                expect({
                    rowIndex: active?.closest('.ag-row')?.getAttribute('row-index'),
                    colId: active?.getAttribute('col-id'),
                }).toEqual({ rowIndex: String(FALLBACK_ROW), colId: LAST_COL });
            });
            const focused = api.getFocusedCell();
            expect({ rowIndex: focused?.rowIndex, colId: focused?.column.getColId() }).toEqual({
                rowIndex: FALLBACK_ROW,
                colId: LAST_COL,
            });

            // the grid remains usable: it can still render rows
            await act(async () => api.ensureIndexVisible(0, 'top'));
            await waitFor(() => expect(hasCell(0, 'col0')).toBe(true));
        }
    );
});
