import { cleanup, waitFor } from '@testing-library/react';

import type { ColDef } from 'ag-grid-community';
import { ClientSideRowModelModule, KeyCode, ModuleRegistry, ValidationModule } from 'ag-grid-community';

import { renderNavGrid } from '../navigation/navigation-react-test-utils';
import { dispatchKeyDown, getFocusedColId, getFocusedRowIndex } from '../navigation/navigation-test-utils';
import { ignoreConsoleLicenseKeyError } from '../test-utils';

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
        ModuleRegistry.registerModules([ClientSideRowModelModule, ValidationModule]);
        ignoreConsoleLicenseKeyError();
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
});
