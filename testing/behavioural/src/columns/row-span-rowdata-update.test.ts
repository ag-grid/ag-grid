import type { GridApi, GridOptions } from 'ag-grid-community';
import { CellSpanModule, ClientSideRowModelModule, RowApiModule } from 'ag-grid-community';

import { GridRows, TestGridsManager, asyncSetTimeout, nextAnimationFrame } from '../test-utils';

/**
 * AG-17868 regression repro: after a full `rowData` replacement via
 * `api.setGridOption('rowData', ...)`, spanned cells must re-derive their row coverage from the new
 * data rather than keeping the stale pre-update span. Coverage is asserted two ways: the GridRows
 * span marker (aria-rowspan) AND the rendered `style.height`, since the reported bug was a stale
 * height even while aria-rowspan looked correct.
 */

const settle = async (): Promise<void> => {
    await asyncSetTimeout(0);
    await nextAnimationFrame();
    await nextAnimationFrame();
};

/** Rendered height (px) of the spanned `group` cell whose value is `value`. A row is 42px tall and
 *  the span height drops one border pixel, so 2 rows = 83px and 3 rows = 125px. */
function spannedGroupHeightPx(api: GridApi, value: string): number | null {
    const root = TestGridsManager.getHTMLElement(api);
    const cells = Array.from(
        root?.querySelectorAll<HTMLElement>('.ag-spanned-row .ag-spanned-cell[col-id="group"]') ?? []
    );
    const cell = cells.find((c) => c.textContent?.trim() === value);
    return cell ? parseInt(cell.style.height, 10) : null;
}

describe('row spanning - rowData replacement', () => {
    const gridsManager = new TestGridsManager({
        modules: [ClientSideRowModelModule, CellSpanModule, RowApiModule],
    });

    beforeEach(() => gridsManager.reset());
    afterEach(() => gridsManager.reset());

    function createGrid(options: GridOptions): GridApi {
        return gridsManager.createGrid('myGrid', { enableCellSpan: true, ...options });
    }

    test('setGridOption("rowData") re-spans spanned cells to match the new data', async () => {
        const api = createGrid({
            columnDefs: [
                { field: 'group', spanRows: true },
                { field: 'label', headerName: 'Row' },
            ],
            getRowId: (p) => p.data.id,
            rowData: [
                { id: 'a0', group: 'A', label: 'r0' },
                { id: 'a1', group: 'A', label: 'r1' },
                { id: 'a2', group: 'A', label: 'r2' },
                { id: 'b0', group: 'B', label: 'r3' },
                { id: 'b1', group: 'B', label: 'r4' },
            ],
        });
        await settle();
        // BEFORE: group A spans 3 rows, group B spans 2 rows.
        await new GridRows(api, 'before rowData update').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:a0 group:"A"↧3 label:"r0"
            ├── LEAF id:a1 group:"A"↥ label:"r1"
            ├── LEAF id:a2 group:"A"↥ label:"r2"
            ├── LEAF id:b0 group:"B"↧2 label:"r3"
            └── LEAF id:b1 group:"B"↥ label:"r4"
        `);
        expect(spannedGroupHeightPx(api, 'A')).toBe(125); // 3 rows
        expect(spannedGroupHeightPx(api, 'B')).toBe(83); // 2 rows

        api.setGridOption('rowData', [
            { id: 'a0', group: 'A', label: 'r0' },
            { id: 'a1', group: 'A', label: 'r1' },
            { id: 'a2', group: 'A2', label: 'r2' },
            { id: 'b0', group: 'B', label: 'r3' },
            { id: 'b1', group: 'B', label: 'r4' },
            { id: 'b2', group: 'B', label: 'r5' },
        ]);
        await settle();
        // AFTER (expected): group A spans 2, A2 spans 1 (no marker), group B spans 3.
        await new GridRows(api, 'after rowData update').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:a0 group:"A"↧2 label:"r0"
            ├── LEAF id:a1 group:"A"↥ label:"r1"
            ├── LEAF id:a2 group:"A2" label:"r2"
            ├── LEAF id:b0 group:"B"↧3 label:"r3"
            ├── LEAF id:b1 group:"B"↥ label:"r4"
            └── LEAF id:b2 group:"B"↥ label:"r5"
        `);
        // The reported regression: the spanned cell kept its stale height. A shrank 3→2, B grew 2→3.
        expect(spannedGroupHeightPx(api, 'A')).toBe(83); // 2 rows
        expect(spannedGroupHeightPx(api, 'B')).toBe(125); // 3 rows
    });
});
