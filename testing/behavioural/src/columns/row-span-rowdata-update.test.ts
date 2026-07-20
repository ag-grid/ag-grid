import type { GridApi, GridOptions } from 'ag-grid-community';
import { CellSpanModule, ClientSideRowModelModule, RowApiModule } from 'ag-grid-community';

import { GridRows, TestGridsManager, asyncSetTimeout, nextAnimationFrame } from '../test-utils';

/**
 * AG-17868 regression repro: after a full `rowData` replacement via
 * `api.setGridOption('rowData', ...)`, spanned cells must re-derive their row coverage from the new
 * data rather than keeping the stale pre-update span.
 */

const settle = async (): Promise<void> => {
    await asyncSetTimeout(10);
    await nextAnimationFrame();
    await nextAnimationFrame();
};

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
    });
});
