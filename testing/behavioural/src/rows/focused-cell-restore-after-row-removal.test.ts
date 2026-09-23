import { waitFor } from '@testing-library/dom';
import { TestGridsManager, asyncSetTimeout } from 'ag-test-utils';

import { ClientSideRowModelModule, ScrollApiModule } from 'ag-grid-community';
import type { GridApi } from 'ag-grid-community';

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
        await asyncSetTimeout(0);
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

    // AG-18636: removing the focused row while its column is virtualised out of the other rows threw error #252
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

            expect(() => api.applyTransaction({ remove: buildRows(ROW_COUNT).slice(ROW_COUNT - REMOVE) })).not.toThrow();

            await expectFocusOnFallbackCellAndGridUsable(api, hasCell);
        }
    );
});
