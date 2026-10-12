import { waitFor } from '@testing-library/dom';
import { TestGridsManager } from 'ag-test-utils';

import type { GridApi } from 'ag-grid-community';
import {
    ClientSideRowModelModule,
    ColumnApiModule,
    ScrollApiModule,
    TextEditorModule,
    getGridElement,
} from 'ag-grid-community';

/** The row's drawn cells, as `colId:width`. */
const renderedRow = (api: GridApi) =>
    Array.from(getGridElement(api)!.querySelectorAll<HTMLElement>('.ag-row[row-index="0"] .ag-cell'))
        .map((cell) => `${cell.getAttribute('col-id')}:${cell.style.width}`)
        .join(' ');

/** The drawn cell the row resolves for each column, as the cell's own column, which focus, editing and menus use. */
const cellsFor = (api: GridApi, colIds: string[]): (string | undefined)[] => {
    const rowNode = api.getRowNode('r0')!;
    const rowCtrl = (rowNode as any).beans.rowRenderer.getRowCtrlByNode(rowNode);
    return colIds.map((colId) => rowCtrl.getCellCtrl(api.getColumn(colId))?.column.getColId());
};

describe('the drawn cell covering a column', () => {
    const gridsManager = new TestGridsManager({
        modules: [ClientSideRowModelModule, ColumnApiModule, ScrollApiModule, TextEditorModule],
    });

    afterEach(() => {
        gridsManager.reset();
    });

    test('is the kept cell over it inside a span, else the spanning cell', async () => {
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [
                { colId: 'p', colSpan: (params) => (params.data!.wide ? 4 : 1) },
                { colId: 's', colSpan: () => 2 },
                { colId: 't' },
                { colId: 'u' },
                { colId: 'v' },
            ],
            defaultColDef: { width: 100, valueGetter: () => '' },
            rowData: [{ id: 'r0', wide: false }],
            getRowId: (params) => params.data.id,
        });
        await waitFor(() => expect(renderedRow(api)).toBe('p:100px s:200px u:100px v:100px'));

        api.setFocusedCell(0, 's');
        api.getRowNode('r0')!.setData({ id: 'r0', wide: true });
        // s stays drawn for focus above p's span, with its own colSpan of 2
        await waitFor(() => expect(renderedRow(api)).toBe('p:400px s:200px v:100px'));

        expect(cellsFor(api, ['p', 's', 't', 'u', 'v'])).toEqual(['p', 's', 's', 'p', 'v']);
    });

    test('is the cell drawn over it while the row is still laid out against the previous columns', async () => {
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: Array.from({ length: 60 }, (_, i) => ({
                colId: `c${i}`,
                colSpan: i === 2 ? () => 2 : undefined,
            })),
            defaultColDef: { width: 100, valueGetter: () => '' },
            rowData: [{ id: 'r0', wide: false }],
            getRowId: (params) => params.data.id,
            suppressColumnVirtualisation: false,
        });
        await waitFor(() => expect(renderedRow(api)).toMatch(/^c0:100px c1:100px c2:200px c4:100px/));
        let seen: (string | undefined)[] | null = null;
        // a move outside the viewport leaves the rendered columns alone, so the rows hear of it last
        api.getColumn('c50')!.addEventListener('leftChanged', () => {
            seen ??= cellsFor(api, ['c2', 'c3', 'c4']);
        });

        api.moveColumns(['c55'], 50);

        expect(seen).toEqual(['c2', 'c2', 'c4']);
    });

    test('is none where a kept spanning cell stops short of it', async () => {
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [
                { colId: 'p', colSpan: (params) => (params.data!.wide ? 3 : 1), editable: true },
                { colId: 's', editable: true },
                { colId: 't' },
                ...Array.from({ length: 30 }, (_, i) => ({ colId: `f${i}` })),
            ],
            defaultColDef: { width: 100, valueGetter: () => '' },
            rowData: [{ id: 'r0', wide: false }],
            getRowId: (params) => params.data.id,
            editType: 'fullRow',
            suppressAnimationFrame: true,
            suppressColumnVirtualisation: false,
        });
        await waitFor(() => expect(renderedRow(api)).toMatch(/^p:100px s:100px t:100px f0:100px/));

        api.startEditingCell({ rowIndex: 0, colKey: 'p' });
        await waitFor(() => expect(api.getCellEditorInstances()).toHaveLength(2));
        api.applyTransaction({ update: [{ id: 'r0', wide: true }] });
        api.ensureColumnVisible('f29');
        // both edits stay drawn out of view, and p stops at s, so t is left with no cell
        await waitFor(() => expect(renderedRow(api)).toMatch(/^p:100px s:100px f/));

        expect(cellsFor(api, ['p', 's', 't'])).toEqual(['p', 's', undefined]);
    });
});
