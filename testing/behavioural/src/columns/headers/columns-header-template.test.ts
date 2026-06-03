import type { ColDef, ColGroupDef, GridOptions } from 'ag-grid-community';
import { ClientSideRowModelModule, createGrid } from 'ag-grid-community';

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
