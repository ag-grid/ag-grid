import { waitFor } from '@testing-library/dom';
import { TestGridsManager } from 'ag-test-utils';

import { ClientSideRowModelModule, ScrollApiModule } from 'ag-grid-community';
import type { ColSpanParams, GridApi } from 'ag-grid-community';

const ROW_COUNT = 100;
const REMOVE = 5;
const COLS = Array.from({ length: 12 }, (_, i) => `col${i}`);
const LAST_ROW = ROW_COUNT - 1;
const LAST_COL = COLS[COLS.length - 1];
const FALLBACK_ROW = LAST_ROW - REMOVE;

const buildRows = (count: number) =>
    Array.from({ length: count }, (_, r) => {
        const row: Record<string, string> = { id: `row-${r}` };
        for (const c of COLS) {
            row[c] = `${c}-${r}`;
        }
        return row;
    });

const cellSelector = (rowIndex: number, colId: string) =>
    `.ag-row[row-index="${rowIndex}"] .ag-cell[col-id="${colId}"]`;

describe('Focused cell restore after row removal', () => {
    const gridMgr = new TestGridsManager({
        modules: [ClientSideRowModelModule, ScrollApiModule],
    });

    afterEach(() => {
        gridMgr.reset();
    });

    /** Focuses the last column of the last row, then scrolls that column out of view on every other row. */
    async function createGridWithFocusedColumnScrolledOut(suppressAnimationFrame: boolean) {
        const api = await gridMgr.createGridAndWait('focusRestoreRowRemoval', {
            rowData: buildRows(ROW_COUNT),
            columnDefs: COLS.map((colId) => ({ colId, field: colId, width: 200 })),
            getRowId: (p) => p.data.id,
            rowHeight: 40,
            suppressRowVirtualisation: false,
            suppressColumnVirtualisation: false,
            suppressAnimationFrame,
        });
        const gridDiv = TestGridsManager.getHTMLElement(api)!;
        const hasCell = (rowIndex: number, colId: string) => !!gridDiv.querySelector(cellSelector(rowIndex, colId));

        api.ensureIndexVisible(LAST_ROW, 'bottom');
        await waitFor(() => expect(hasCell(LAST_ROW, 'col0')).toBe(true));
        api.ensureColumnVisible(LAST_COL);
        await waitFor(() => expect(hasCell(LAST_ROW, LAST_COL)).toBe(true));
        api.setFocusedCell(LAST_ROW, LAST_COL);
        await waitFor(() => expect(document.activeElement?.getAttribute('col-id')).toBe(LAST_COL));
        api.ensureColumnVisible('col0');
        await waitFor(() => expect(hasCell(FALLBACK_ROW, 'col0')).toBe(true));

        // preconditions: the focused column stays rendered only on the focused row, and the row focus falls back to is rendered
        expect(hasCell(LAST_ROW, LAST_COL)).toBe(true);
        expect(hasCell(FALLBACK_ROW, LAST_COL)).toBe(false);

        return { api, hasCell };
    }

    async function expectFocusOnFallbackCellAndGridUsable(
        api: GridApi,
        hasCell: (rowIndex: number, colId: string) => boolean
    ) {
        // focus moves to the new last row, whose cell for the focused column is rendered and receives browser focus
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
        expect(api.getDisplayedRowCount()).toBe(ROW_COUNT - REMOVE);

        // the grid remains usable: it can still render rows
        expect(() => api.ensureIndexVisible(0, 'top')).not.toThrow();
        await waitFor(() => expect(hasCell(0, 'col0')).toBe(true));
    }

    test.each([false, true])(
        'rowData update removing the focused row completes when the focused column is scrolled out of view (suppressAnimationFrame: %s)',
        async (suppressAnimationFrame) => {
            const { api, hasCell } = await createGridWithFocusedColumnScrolledOut(suppressAnimationFrame);

            expect(() => api.setGridOption('rowData', buildRows(ROW_COUNT - REMOVE))).not.toThrow();

            await expectFocusOnFallbackCellAndGridUsable(api, hasCell);
        }
    );

    test.each([false, true])(
        'transaction removing the focused row completes when the focused column is scrolled out of view (suppressAnimationFrame: %s)',
        async (suppressAnimationFrame) => {
            const { api, hasCell } = await createGridWithFocusedColumnScrolledOut(suppressAnimationFrame);

            expect(() =>
                api.applyTransaction({ remove: buildRows(ROW_COUNT).slice(ROW_COUNT - REMOVE) })
            ).not.toThrow();

            await expectFocusOnFallbackCellAndGridUsable(api, hasCell);
        }
    );

    /** Scrolls to the bottom with the first columns in view, so the last columns are virtualised out of every rendered row.
     *  With `colSpanColId`, that column spans by `colSpan` and is the one scrolled out: a covered column starts no cell. */
    async function createGridScrolledLeft(colSpanColId?: string, colSpan?: (params: ColSpanParams) => number) {
        const scrolledOutCol = colSpanColId ?? LAST_COL;
        const api = await gridMgr.createGridAndWait('focusScrolledOutColumn', {
            rowData: buildRows(ROW_COUNT),
            columnDefs: COLS.map((colId) => ({
                colId,
                field: colId,
                width: 200,
                colSpan: colId === colSpanColId ? colSpan : undefined,
            })),
            getRowId: (p) => p.data.id,
            rowHeight: 40,
            suppressRowVirtualisation: false,
            suppressColumnVirtualisation: false,
        });
        const gridDiv = TestGridsManager.getHTMLElement(api)!;
        const hasCell = (rowIndex: number, colId: string) => !!gridDiv.querySelector(cellSelector(rowIndex, colId));

        api.ensureIndexVisible(LAST_ROW, 'bottom');
        await waitFor(() => expect(hasCell(LAST_ROW, 'col0')).toBe(true));
        api.ensureColumnVisible(scrolledOutCol);
        await waitFor(() => expect(hasCell(LAST_ROW, scrolledOutCol)).toBe(true));
        api.ensureColumnVisible('col0');
        await waitFor(() => expect(hasCell(FALLBACK_ROW, scrolledOutCol)).toBe(false));
        expect(hasCell(FALLBACK_ROW, 'col0')).toBe(true);

        return { api, hasCell };
    }

    const activeCell = () => ({
        rowIndex: document.activeElement?.closest('.ag-row')?.getAttribute('row-index'),
        colId: document.activeElement?.getAttribute('col-id'),
    });

    test('setFocusedCell onto a scrolled-out column of a rendered row renders that cell and focuses it', async () => {
        const { api, hasCell } = await createGridScrolledLeft();

        expect(() => api.setFocusedCell(FALLBACK_ROW, LAST_COL)).not.toThrow();

        await waitFor(() => expect(activeCell()).toEqual({ rowIndex: String(FALLBACK_ROW), colId: LAST_COL }));
        expect(hasCell(FALLBACK_ROW, LAST_COL)).toBe(true);
        expect(() => api.ensureIndexVisible(0, 'top')).not.toThrow();
        await waitFor(() => expect(hasCell(0, 'col0')).toBe(true));
    });

    test('setFocusedCell onto a scrolled-out column a colSpan covers focuses the spanning cell', async () => {
        const colSpan = vi.fn((_params: ColSpanParams) => 3);
        const { api } = await createGridScrolledLeft('col9', colSpan);
        const colSpanCallsForRow = () => colSpan.mock.calls.filter(([p]) => p.node?.rowIndex === FALLBACK_ROW).length;
        const callsBeforeFocus = colSpanCallsForRow();
        expect(callsBeforeFocus).toBeGreaterThan(0);

        api.setFocusedCell(FALLBACK_ROW, LAST_COL);

        await waitFor(() => expect(activeCell()).toEqual({ rowIndex: String(FALLBACK_ROW), colId: 'col9' }));
        const focused = api.getFocusedCell();
        expect({ rowIndex: focused?.rowIndex, colId: focused?.column.getColId() }).toEqual({
            rowIndex: FALLBACK_ROW,
            colId: 'col9',
        });
        // the rendered row has already read the span, so focusing it asks the callback again neither now nor on layout
        expect(colSpanCallsForRow()).toBe(callsBeforeFocus);
    });
});
