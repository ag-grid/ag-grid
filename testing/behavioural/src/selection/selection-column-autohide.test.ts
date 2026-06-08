import type { GridApi } from 'ag-grid-community';
import { ClientSideRowModelModule, RowSelectionModule } from 'ag-grid-community';
import { RowNumbersModule } from 'ag-grid-enterprise';

import { TestGridsManager, asyncSetTimeout } from '../test-utils';

const SELECTION_COL = 'ag-Grid-SelectionColumn';
const ROW_NUMBERS_COL = 'ag-Grid-RowNumbersColumn';

// A lone selection (checkbox) column adds nothing, so when the only displayed column would be the
// selection col (plus optional row-numbers) it auto-hides. This must be consistent across BOTH the
// body (displayed leaf cols) and the header (displayed column-group tree) — a regression had the body
// drop it but the header keep a phantom padding-wrapped entry at depth>0.
describe('selection column auto-hide', () => {
    const mgr = new TestGridsManager({ modules: [RowSelectionModule, RowNumbersModule, ClientSideRowModelModule] });
    afterEach(() => mgr.reset());

    const bodyColIds = (api: GridApi): string[] => api.getAllDisplayedColumns().map((c) => c.getColId());

    // Flatten the displayed header tree (groups + padding) to its leaf colIds.
    const headerColIds = (api: GridApi): string[] => {
        const ids: string[] = [];
        const visit = (item: any): void => {
            if (typeof item.getDisplayedChildren === 'function') {
                item.getDisplayedChildren().forEach(visit);
            } else {
                ids.push(item.getColId());
            }
        };
        [
            ...(api.getLeftDisplayedColumnGroups?.() ?? []),
            ...(api.getCenterDisplayedColumnGroups?.() ?? []),
            ...(api.getRightDisplayedColumnGroups?.() ?? []),
        ].forEach(visit);
        return ids;
    };

    test('hiding all grouped data cols removes the selection col from body AND header (depth > 0)', async () => {
        const api = mgr.createGrid('g', {
            columnDefs: [{ headerName: 'G', children: [{ field: 'a' }, { field: 'b' }] }],
            rowData: [{ a: 1, b: 2 }],
            rowSelection: { mode: 'multiRow' },
        });
        await asyncSetTimeout(1);

        expect(bodyColIds(api)).toContain(SELECTION_COL);
        expect(headerColIds(api)).toContain(SELECTION_COL);

        api.setColumnsVisible(['a', 'b'], false);
        await asyncSetTimeout(1);

        // Body and header agree: the lone selection col is gone from both.
        expect(bodyColIds(api)).toHaveLength(0);
        expect(headerColIds(api)).not.toContain(SELECTION_COL);

        api.setColumnsVisible(['a', 'b'], true);
        await asyncSetTimeout(1);

        // Restored to both representations.
        expect(bodyColIds(api)).toEqual(expect.arrayContaining([SELECTION_COL, 'a', 'b']));
        expect(headerColIds(api)).toContain(SELECTION_COL);
    });

    test('hiding all flat data cols removes the selection col from body AND header (depth 0)', async () => {
        const api = mgr.createGrid('g', {
            columnDefs: [{ field: 'a' }, { field: 'b' }],
            rowData: [{ a: 1, b: 2 }],
            rowSelection: { mode: 'multiRow' },
        });
        await asyncSetTimeout(1);

        expect(bodyColIds(api)).toContain(SELECTION_COL);

        api.setColumnsVisible(['a', 'b'], false);
        await asyncSetTimeout(1);

        expect(bodyColIds(api)).toHaveLength(0);
        expect(headerColIds(api)).not.toContain(SELECTION_COL);

        api.setColumnsVisible(['a', 'b'], true);
        await asyncSetTimeout(1);

        expect(bodyColIds(api)).toContain(SELECTION_COL);
    });

    test('selection col stays when at least one data col remains (with row-numbers present)', async () => {
        const api = mgr.createGrid('g', {
            columnDefs: [{ field: 'a' }, { field: 'b' }],
            rowData: [{ a: 1, b: 2 }],
            rowSelection: { mode: 'multiRow' },
            rowNumbers: true,
        });
        await asyncSetTimeout(1);

        expect(bodyColIds(api)).toContain(ROW_NUMBERS_COL);

        // Hide only one data col — a real col still shows, so the selection col stays.
        api.setColumnsVisible(['a'], false);
        await asyncSetTimeout(1);
        expect(bodyColIds(api)).toContain(SELECTION_COL);
        expect(bodyColIds(api)).toContain('b');

        // Hide the last data col — now only selection + row-numbers would remain → selection auto-hides
        // while the row-numbers col stays.
        api.setColumnsVisible(['b'], false);
        await asyncSetTimeout(1);
        expect(bodyColIds(api)).not.toContain(SELECTION_COL);
        expect(bodyColIds(api)).toContain(ROW_NUMBERS_COL);
    });
});
