import { cleanup } from '@testing-library/react';

import type { ColDef } from 'ag-grid-community';
import { ClientSideRowModelModule, KeyCode, ModuleRegistry, ValidationModule } from 'ag-grid-community';

import { ignoreConsoleLicenseKeyError } from '../test-utils';
import { renderNavGrid } from './navigation-react-test-utils';
import { dispatchKeyDown, getFocusedColId, getFocusedRowIndex } from './navigation-test-utils';

interface RowData {
    a: string;
    b: string;
    c: string;
}

const columnDefs: ColDef<RowData>[] = [
    { field: 'a', colId: 'a' },
    { field: 'b', colId: 'b' },
    { field: 'c', colId: 'c' },
];

const rowData: RowData[] = [
    { a: 'a0', b: 'b0', c: 'c0' },
    { a: 'a1', b: 'b1', c: 'c1' },
    { a: 'a2', b: 'b2', c: 'c2' },
];

describe('Tab Cell Navigation (React)', () => {
    beforeAll(() => {
        ModuleRegistry.registerModules([ClientSideRowModelModule, ValidationModule]);
        ignoreConsoleLicenseKeyError();
    });

    afterEach(() => {
        cleanup();
    });

    test('Tab moves focus to next column in same row', async () => {
        const api = await renderNavGrid({ rowData, columnDefs });
        api.setFocusedCell(0, 'a');
        dispatchKeyDown(KeyCode.TAB);
        expect(getFocusedColId(api)).toBe('b');
        expect(getFocusedRowIndex(api)).toBe(0);
    });

    test('Tab at last column wraps to first column of next row', async () => {
        const api = await renderNavGrid({ rowData, columnDefs });
        api.setFocusedCell(0, 'c');
        dispatchKeyDown(KeyCode.TAB);
        expect(getFocusedRowIndex(api)).toBe(1);
        expect(getFocusedColId(api)).toBe('a');
    });

    test('Shift+Tab moves focus to previous column', async () => {
        const api = await renderNavGrid({ rowData, columnDefs });
        api.setFocusedCell(0, 'b');
        dispatchKeyDown(KeyCode.TAB, { shiftKey: true });
        expect(getFocusedColId(api)).toBe('a');
        expect(getFocusedRowIndex(api)).toBe(0);
    });

    test('Shift+Tab at first column wraps to last column of previous row', async () => {
        const api = await renderNavGrid({ rowData, columnDefs });
        api.setFocusedCell(1, 'a');
        dispatchKeyDown(KeyCode.TAB, { shiftKey: true });
        expect(getFocusedRowIndex(api)).toBe(0);
        expect(getFocusedColId(api)).toBe('c');
    });

    test('Tab at last cell of last row does not move focus off grid', async () => {
        const api = await renderNavGrid({ rowData, columnDefs });
        api.setFocusedCell(2, 'c');
        dispatchKeyDown(KeyCode.TAB);
        expect(getFocusedRowIndex(api)).toBe(2);
        expect(getFocusedColId(api)).toBe('c');
    });

    test('Shift+Tab at first cell of first row does not move focus off grid', async () => {
        const api = await renderNavGrid({ rowData, columnDefs });
        api.setFocusedCell(0, 'a');
        dispatchKeyDown(KeyCode.TAB, { shiftKey: true });
        expect(getFocusedRowIndex(api)).toBe(0);
        expect(getFocusedColId(api)).toBe('a');
    });
});
