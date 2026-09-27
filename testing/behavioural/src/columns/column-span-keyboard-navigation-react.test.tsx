import { cleanup, waitFor } from '@testing-library/react';

import type { ColDef } from 'ag-grid-community';
import {
    ClientSideRowModelModule,
    ColumnApiModule,
    KeyCode,
    ModuleRegistry,
    PaginationModule,
    ValidationModule,
    getGridElement,
} from 'ag-grid-community';

import { renderNavGrid } from '../navigation/navigation-react-test-utils';
import { dispatchKeyDown, getFocusedColId, getFocusedRowIndex } from '../navigation/navigation-test-utils';

interface RowData {
    a: string;
    b: string;
    c: string;
}

function makeColumnDefs(): ColDef<RowData>[] {
    return [
        {
            field: 'a',
            colId: 'a',
            colSpan: (params) => (params.node!.rowIndex! % 2 === 1 ? 2 : 1),
        },
        { field: 'b', colId: 'b' },
        { field: 'c', colId: 'c' },
    ];
}

describe('Column Spanning Keyboard Navigation (React)', () => {
    beforeAll(() => {
        ModuleRegistry.registerModules([ClientSideRowModelModule, ColumnApiModule, PaginationModule, ValidationModule]);
    });

    afterEach(() => {
        cleanup();
    });

    test('Page Down normalises focus onto spanning cell, and Arrow Up continues in the covered column (TC1)', async () => {
        const api = await renderNavGrid({
            rowData: [
                { a: 'a0', b: 'b0', c: 'c0' },
                { a: 'a1', b: 'b1', c: 'c1' },
            ],
            columnDefs: makeColumnDefs(),
        });

        api.setFocusedCell(0, 'b');
        expect(getFocusedColId(api)).toBe('b');

        dispatchKeyDown(KeyCode.PAGE_DOWN);

        await waitFor(() => {
            expect(getFocusedRowIndex(api)).toBe(1);
            expect(getFocusedColId(api)).toBe('a');
        });

        dispatchKeyDown(KeyCode.UP);

        await waitFor(() => {
            expect(getFocusedRowIndex(api)).toBe(0);
            expect(getFocusedColId(api)).toBe('b');
        });
    });

    test('Ctrl+Down normalises focus onto spanning cell on last row, and Arrow Up continues in the covered column (TC2)', async () => {
        const api = await renderNavGrid({
            rowData: [
                { a: 'a0', b: 'b0', c: 'c0' },
                { a: 'a1', b: 'b1', c: 'c1' },
                { a: 'a2', b: 'b2', c: 'c2' },
                { a: 'a3', b: 'b3', c: 'c3' },
            ],
            columnDefs: makeColumnDefs(),
        });

        api.setFocusedCell(0, 'b');
        expect(getFocusedColId(api)).toBe('b');

        dispatchKeyDown(KeyCode.DOWN, { ctrlKey: true });

        await waitFor(() => {
            expect(getFocusedRowIndex(api)).toBe(3);
            expect(getFocusedColId(api)).toBe('a');
        });

        dispatchKeyDown(KeyCode.UP);

        await waitFor(() => {
            expect(getFocusedRowIndex(api)).toBe(2);
            expect(getFocusedColId(api)).toBe('b');
        });
    });

    test('entry from a header and through a tabToNextGridContainer cell focuses the cell spanning its column, and Arrow continues in the column', async () => {
        const columnDefs = makeColumnDefs();
        // 'a' spans all three columns on rows 0 and 2
        columnDefs[0].colSpan = (params) => (params.node!.rowIndex! % 2 === 0 ? 3 : 1);
        const api = await renderNavGrid({
            rowData: [
                { a: 'a0', b: 'b0', c: 'c0' },
                { a: 'a1', b: 'b1', c: 'c1' },
                { a: 'a2', b: 'b2', c: 'c2' },
            ],
            columnDefs,
            gridOptions: {
                pagination: true,
                paginationPageSizeSelector: false,
                tabToNextGridContainer: (params) =>
                    params.backwards ? { rowIndex: 2, rowPinned: null, column: params.api.getColumn('b')! } : undefined,
            },
        });
        const focused = () => `${getFocusedRowIndex(api)} ${getFocusedColId(api)}`;
        const pressThenExpect = async (key: string, expected: string) => {
            dispatchKeyDown(key);
            await waitFor(() => expect(focused()).toBe(expected));
        };

        api.setFocusedHeader('c');
        await pressThenExpect(KeyCode.DOWN, '0 a');
        await pressThenExpect(KeyCode.DOWN, '1 c');

        getGridElement(api)!.querySelector<HTMLElement>('.ag-paging-button')!.focus();
        dispatchKeyDown(KeyCode.TAB, { shiftKey: true });
        await waitFor(() => expect(focused()).toBe('2 a'));
        await pressThenExpect(KeyCode.UP, '1 b');
    });
});
