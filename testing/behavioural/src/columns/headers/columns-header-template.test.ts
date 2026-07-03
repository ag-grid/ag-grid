import type { ColDef, ColGroupDef, GridApi, GridOptions } from 'ag-grid-community';
import { ClientSideRowModelModule, ColumnApiModule, createGrid } from 'ag-grid-community';

import { GridColumns, TestGridsManager } from '../../test-utils';

const data = [{ a: 1, b: 10, c: 100 }];
const columns: ColDef[] = [
    {
        field: 'a',
    },
    {
        field: 'b',
        headerName: 'ColumnB',
    },
    {
        field: 'c',
        headerComponentParams: {
            // validate templates with no data-ref are rendered
            template: `<div>Hello</div>`,
        },
    },
    {
        field: 'c',
        headerName: 'C_Template',
        headerComponentParams: {
            // validate templates with no data-ref are rendered
            template: `<div data-ref="eText"></div>`,
        },
    },
];

test('Headers Rendered', async () => {
    const gridOptions: GridOptions = {
        columnDefs: columns,
        rowData: data,
    };

    const eGridDiv = document.createElement('div');

    createGrid(eGridDiv, gridOptions, { modules: [ClientSideRowModelModule] });

    const headers = eGridDiv.querySelectorAll('.ag-header-cell-comp-wrapper')!;

    expect(headers.length).toBe(4);
    expect(headers[0].textContent?.trim()).toBe('A');
    expect(headers[1].textContent?.trim()).toBe('ColumnB');
    expect(headers[2].textContent?.trim()).toBe('Hello');
    expect(headers[3].textContent?.trim()).toBe('C_Template');
});

describe('Column display names', () => {
    const gridsManager = new TestGridsManager({ modules: [ClientSideRowModelModule] });

    afterEach(() => gridsManager.reset());

    test('header name resolves from getter, headerName, then humanised field', () => {
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [
                { colId: 'a', field: 'a', headerValueGetter: '"Expr-" + colDef.field' },
                { colId: 'b', field: 'b', headerName: 'Plain B' },
                { colId: 'c', field: 'myField' },
            ],
            rowData: [{ a: 1, b: 2, myField: 3 }],
        });

        // String expression is evaluated against the header params.
        expect(api.getDisplayNameForColumn(api.getColumn('a')!, 'header')).toBe('Expr-a');
        // headerName takes precedence when no getter is supplied.
        expect(api.getDisplayNameForColumn(api.getColumn('b')!, 'header')).toBe('Plain B');
        // field falls back to humanised camelCase.
        expect(api.getDisplayNameForColumn(api.getColumn('c')!, 'header')).toBe('My Field');
    });

    test('padding groups created for an unbalanced header have no display name', async () => {
        const columnDefs: (ColDef | ColGroupDef)[] = [
            { headerName: 'L1', children: [{ headerName: 'L2', children: [{ colId: 'a', field: 'a' }] }] },
            // 'b' is ungrouped but the header is two group-rows deep, so padding groups
            // are created above 'b' to align the header rows.
            { colId: 'b', field: 'b' },
        ];

        const api = gridsManager.createGrid('myGrid', {
            columnDefs,
            rowData: [{ a: 1, b: 2 }],
        });

        await new GridColumns(api, 'unbalanced header with padding groups').checkColumns(`
            CENTER
            ├─┬ "L1" GROUP
            │ └─┬ "L2" GROUP
            │   └── a "A" width:200
            └── b "B" width:200
        `);

        // Every group above 'b' is a padding group with no header name.
        let group = api.getColumn('b')!.getParent();
        let paddingGroupCount = 0;
        while (group) {
            expect(api.getDisplayNameForColumnGroup(group, 'header')).toBe('');
            paddingGroupCount++;
            group = group.getParent();
        }
        expect(paddingGroupCount).toBe(2);
    });
});

describe('header visibility toggle', () => {
    const gridsManager = new TestGridsManager({ modules: [ClientSideRowModelModule, ColumnApiModule] });
    afterEach(() => gridsManager.reset());

    const headerCell = (root: HTMLElement, colId: string) =>
        root.querySelector<HTMLElement>(`.ag-header-cell[col-id="${colId}"]`);

    const makeGrid = (n: number): { api: GridApi; root: HTMLElement; ids: string[] } => {
        const columnDefs: ColDef[] = [];
        for (let i = 0; i < n; i++) {
            columnDefs.push({ colId: `c${i}`, field: `c${i}` });
        }
        const api = gridsManager.createGrid('reuse', { columnDefs, rowData: [{ c0: 1 }] });
        return { api, root: document.getElementById('reuse')!, ids: columnDefs.map((c) => c.colId!) };
    };

    test('heavy hide/show churn past the pool cap keeps final rendering correct', async () => {
        // Start mostly hidden so peakRendered (hence the pool cap) stays tiny and LRU eviction kicks in.
        const columnDefs: ColDef[] = [];
        for (let i = 0; i < 30; i++) {
            columnDefs.push({ colId: `c${i}`, field: `c${i}`, hide: i !== 0 });
        }
        const api = gridsManager.createGrid('reuse', { columnDefs, rowData: [{ c0: 1 }] });
        const root = document.getElementById('reuse')!;
        const allIds = columnDefs.map((c) => c.colId!);

        // Slide a one-column visible window across all columns, churning the pool well past its cap.
        for (let i = 1; i < 30; i++) {
            api.setColumnsVisible(allIds, false);
            api.setColumnsVisible([allIds[i]], true);
        }

        // Showing everything must render every column correctly regardless of pool churn/eviction.
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

    test('removing a hidden (pooled) column from the grid does not leave it rendered', async () => {
        const { api, root } = makeGrid(5);
        expect(headerCell(root, 'c4')).toBeTruthy();

        // Hide only c4 -> its header cell is removed from the DOM and pooled (still defined).
        api.setColumnsVisible(['c4'], false);
        expect(headerCell(root, 'c4')).toBeNull();

        // Remove c4 from the grid entirely: the still-visible columns stay, c4 must not reappear.
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
