import { TestGridsManager, asyncSetTimeout, nextAnimationFrame } from 'ag-test-utils';

import type { GridApi, GridOptions } from 'ag-grid-community';
import { CellSpanModule, ClientSideRowModelModule } from 'ag-grid-community';

/**
 * A spanned cell must carry the same valid 1-based `aria-rowindex` as its
 * `.ag-spanned-row` wrapper, never the raw 0-based row index (which rendered the invalid
 * `aria-rowindex="0"` on the first data row). Two anchors ("A" over data
 * rows 0-1, "B" over rows 2-3) so per-grid-row numbering (2, 4) is distinguished from a
 * span-sequential renumbering (2, 3), which would contradict the emitted `aria-rowspan="2"`.
 */

const settle = async (): Promise<void> => {
    await asyncSetTimeout(0);
    await nextAnimationFrame();
    await nextAnimationFrame();
};

/** [cell aria-rowindex, containing spanned-row wrapper aria-rowindex] for every rendered spanned cell. */
function spannedCellRowIndexes(api: GridApi): Array<[string | null, string | null]> {
    const root = TestGridsManager.getHTMLElement(api);
    const rows = Array.from(root?.querySelectorAll<HTMLElement>('.ag-spanned-row') ?? []);
    return rows.map((row) => {
        const cell = row.querySelector<HTMLElement>('.ag-spanned-cell');
        return [cell?.getAttribute('aria-rowindex') ?? null, row.getAttribute('aria-rowindex')];
    });
}

describe('row spanning aria-rowindex', () => {
    const gridsManager = new TestGridsManager({
        modules: [ClientSideRowModelModule, CellSpanModule],
    });

    beforeEach(() => gridsManager.reset());
    afterEach(() => gridsManager.reset());

    function createGrid(options: GridOptions): GridApi {
        return gridsManager.createGrid('myGrid', { enableCellSpan: true, ...options });
    }

    test('spanned cell carries the same valid 1-based aria-rowindex as its spanned row (never 0)', async () => {
        const api = createGrid({
            columnDefs: [
                { field: 'group', spanRows: true },
                { field: 'label', headerName: 'Row' },
            ],
            rowData: [
                { group: 'A', label: 'r0' },
                { group: 'A', label: 'r1' },
                { group: 'B', label: 'r2' },
                { group: 'B', label: 'r3' },
            ],
        });
        await settle();

        const indexes = spannedCellRowIndexes(api);
        expect(indexes).toHaveLength(2);

        // Every spanned cell matches its wrapper row and is never the invalid "0".
        for (const [cellIndex, rowIndex] of indexes) {
            expect(cellIndex).not.toBe('0');
            expect(cellIndex).toBe(rowIndex);
        }

        // Per-grid-row numbering: A anchors at data row 0 (header 1 + 0 + 1 = 2), B at data row 2
        // (Afghanistan-style: A spans two rows, so B is 1 + 2 + 1 = 4) — not a span-sequential 2, 3.
        expect(indexes.map(([cellIndex]) => cellIndex)).toEqual(['2', '4']);
    });
});
