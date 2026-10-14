import { GridColumns, TestGridsManager } from 'ag-test-utils';
import { afterEach, describe, expect, test } from 'vitest';

import type { ColDef, GridApi } from 'ag-grid-community';
import { ClientSideRowModelModule, ColumnApiModule } from 'ag-grid-community';

const modules = [ClientSideRowModelModule, ColumnApiModule];

describe('header cell reuse on visibility toggle', () => {
    const gridsManager = new TestGridsManager({ modules });
    afterEach(() => gridsManager.reset());

    const headerCell = (root: HTMLElement, colId: string) =>
        root.querySelector<HTMLElement>(`.ag-header-cell[col-id="${colId}"]`);

    const makeGrid = (n: number): { api: GridApi; root: HTMLElement } => {
        const columnDefs: ColDef[] = [];
        for (let i = 0; i < n; i++) {
            columnDefs.push({ colId: `c${i}`, field: `c${i}` });
        }
        const api = gridsManager.createGrid('reuse', { columnDefs, rowData: [{ c0: 1 }] });
        return { api, root: document.getElementById('reuse')! };
    };

    test('heavy hide/show churn keeps the final rendering correct', async () => {
        const columnDefs: ColDef[] = [];
        for (let i = 0; i < 30; i++) {
            columnDefs.push({ colId: `c${i}`, field: `c${i}`, hide: i !== 0 });
        }
        const api = gridsManager.createGrid('reuse', { columnDefs, rowData: [{ c0: 1 }] });
        const root = document.getElementById('reuse')!;
        const allIds = columnDefs.map((c) => c.colId!);

        // Slide a one-column visible window across all columns.
        for (let i = 1; i < 30; i++) {
            api.setColumnsVisible(allIds, false);
            api.setColumnsVisible([allIds[i]], true);
        }

        api.setColumnsVisible(allIds, true);
        const rendered = Array.from(root.querySelectorAll<HTMLElement>('.ag-header-cell[col-id]'))
            .map((e) => e.getAttribute('col-id'))
            .sort();
        expect(rendered).toEqual(allIds.slice().sort());
        await new GridColumns(api, 'all columns shown after churn').checkColumns(`
            CENTER
            ├── c0 "C0" width:200
            ├── c1 "C1" width:200
            ├── c2 "C2" width:200
            ├── c3 "C3" width:200
            ├── c4 "C4" width:200
            ├── c5 "C5" width:200
            ├── c6 "C6" width:200
            ├── c7 "C7" width:200
            ├── c8 "C8" width:200
            ├── c9 "C9" width:200
            ├── c10 "C10" width:200
            ├── c11 "C11" width:200
            ├── c12 "C12" width:200
            ├── c13 "C13" width:200
            ├── c14 "C14" width:200
            ├── c15 "C15" width:200
            ├── c16 "C16" width:200
            ├── c17 "C17" width:200
            ├── c18 "C18" width:200
            ├── c19 "C19" width:200
            ├── c20 "C20" width:200
            ├── c21 "C21" width:200
            ├── c22 "C22" width:200
            ├── c23 "C23" width:200
            ├── c24 "C24" width:200
            ├── c25 "C25" width:200
            ├── c26 "C26" width:200
            ├── c27 "C27" width:200
            ├── c28 "C28" width:200
            └── c29 "C29" width:200
        `);
    });

    test('removing a hidden column from the grid does not leave it rendered', async () => {
        const { api, root } = makeGrid(5);
        expect(headerCell(root, 'c4')).toBeTruthy();

        api.setColumnsVisible(['c4'], false);
        expect(headerCell(root, 'c4')).toBeNull();

        api.setGridOption('columnDefs', [
            { colId: 'c0', field: 'c0' },
            { colId: 'c1', field: 'c1' },
            { colId: 'c2', field: 'c2' },
            { colId: 'c3', field: 'c3' },
        ]);
        expect(headerCell(root, 'c4')).toBeNull();
        expect(headerCell(root, 'c0')).toBeTruthy();
        expect(headerCell(root, 'c3')).toBeTruthy();
        await new GridColumns(api, 'c4 removed from grid').checkColumns(`
            CENTER
            ├── c0 "C0" width:200
            ├── c1 "C1" width:200
            ├── c2 "C2" width:200
            └── c3 "C3" width:200
        `);
    });
});
