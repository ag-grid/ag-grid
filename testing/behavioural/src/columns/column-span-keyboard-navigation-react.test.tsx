import { act, cleanup, waitFor } from '@testing-library/react';

import type { ColDef } from 'ag-grid-community';
import { ClientSideRowModelModule, KeyCode, ModuleRegistry, RowApiModule, ValidationModule } from 'ag-grid-community';

import { renderNavGrid } from '../navigation/navigation-react-test-utils';
import {
    dispatchKeyDown,
    getActiveCellColId,
    getFocusedColId,
    getFocusedRowIndex,
} from '../navigation/navigation-test-utils';

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
        ModuleRegistry.registerModules([ClientSideRowModelModule, RowApiModule, ValidationModule]);
    });

    afterEach(() => {
        cleanup();
    });

    test('Page Down normalises focus onto spanning cell (TC1)', async () => {
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
    });

    test('Ctrl+Down normalises focus onto spanning cell on last row (TC2)', async () => {
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
    });

    test('setFocusedCell on a column a span covers focuses the spanning cell and keeps the column for vertical moves', async () => {
        const api = await renderNavGrid({
            rowData: [
                { a: 'a0', b: 'b0', c: 'c0' },
                { a: 'a1', b: 'b1', c: 'c1' },
                { a: 'a2', b: 'b2', c: 'c2' },
            ],
            columnDefs: makeColumnDefs(),
        });

        api.setFocusedCell(1, 'b');

        await waitFor(() => expect(getActiveCellColId()).toBe('a'));
        expect(getFocusedColId(api)).toBe('a');

        dispatchKeyDown(KeyCode.DOWN);
        await waitFor(() => expect(getFocusedRowIndex(api)).toBe(2));
        expect(getFocusedColId(api)).toBe('b');
    });

    test('Tab straight after a data change goes past a span that grew and onto the column one that shrank uncovered', async () => {
        const api = await renderNavGrid({
            rowData: [{ span: 1, b: 'b0', c: 'c0' }],
            columnDefs: [{ field: 'span', colSpan: (params) => params.data.span }, { field: 'b' }, { field: 'c' }],
        });
        const rowNode = api.getDisplayedRowAtIndex(0)!;

        act(() => {
            api.setFocusedCell(0, 'span');
            rowNode.setDataValue('span', 2);
            api.tabToNextCell();
        });
        expect(getFocusedColId(api)).toBe('c');
        await waitFor(() => expect(getActiveCellColId()).toBe('c'));

        act(() => {
            api.setFocusedCell(0, 'span');
            rowNode.setDataValue('span', 1);
            api.tabToNextCell();
        });
        expect(getFocusedColId(api)).toBe('b');
        await waitFor(() => expect(getActiveCellColId()).toBe('b'));
    });
});
