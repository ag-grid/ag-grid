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
    { a: 'a3', b: 'b3', c: 'c3' },
];

describe('Arrow Key Cell Navigation (React)', () => {
    beforeAll(() => {
        ModuleRegistry.registerModules([ClientSideRowModelModule, ValidationModule]);
        ignoreConsoleLicenseKeyError();
    });

    afterEach(() => {
        cleanup();
    });

    test('right arrow moves focus to next column', async () => {
        const api = await renderNavGrid({ rowData, columnDefs });
        api.setFocusedCell(0, 'a');
        dispatchKeyDown(KeyCode.RIGHT);
        expect(getFocusedColId(api)).toBe('b');
        expect(getFocusedRowIndex(api)).toBe(0);
    });

    test('left arrow moves focus to previous column', async () => {
        const api = await renderNavGrid({ rowData, columnDefs });
        api.setFocusedCell(0, 'b');
        dispatchKeyDown(KeyCode.LEFT);
        expect(getFocusedColId(api)).toBe('a');
        expect(getFocusedRowIndex(api)).toBe(0);
    });

    test('down arrow moves focus to next row', async () => {
        const api = await renderNavGrid({ rowData, columnDefs });
        api.setFocusedCell(0, 'a');
        dispatchKeyDown(KeyCode.DOWN);
        expect(getFocusedRowIndex(api)).toBe(1);
        expect(getFocusedColId(api)).toBe('a');
    });

    test('up arrow moves focus to previous row', async () => {
        const api = await renderNavGrid({ rowData, columnDefs });
        api.setFocusedCell(1, 'a');
        dispatchKeyDown(KeyCode.UP);
        expect(getFocusedRowIndex(api)).toBe(0);
        expect(getFocusedColId(api)).toBe('a');
    });

    test('right arrow at last column stays on last column', async () => {
        const api = await renderNavGrid({ rowData, columnDefs });
        api.setFocusedCell(0, 'c');
        dispatchKeyDown(KeyCode.RIGHT);
        expect(getFocusedColId(api)).toBe('c');
        expect(getFocusedRowIndex(api)).toBe(0);
    });

    test('left arrow at first column stays on first column', async () => {
        const api = await renderNavGrid({ rowData, columnDefs });
        api.setFocusedCell(0, 'a');
        dispatchKeyDown(KeyCode.LEFT);
        expect(getFocusedColId(api)).toBe('a');
        expect(getFocusedRowIndex(api)).toBe(0);
    });

    test('down arrow at last row stays on last row', async () => {
        const api = await renderNavGrid({ rowData, columnDefs });
        api.setFocusedCell(3, 'a');
        dispatchKeyDown(KeyCode.DOWN);
        expect(getFocusedRowIndex(api)).toBe(3);
        expect(getFocusedColId(api)).toBe('a');
    });

    test('up arrow at first row stays on first row', async () => {
        const api = await renderNavGrid({ rowData, columnDefs });
        api.setFocusedCell(0, 'a');
        dispatchKeyDown(KeyCode.UP);
        expect(getFocusedRowIndex(api)).toBe(0);
        expect(getFocusedColId(api)).toBe('a');
    });

    test('ctrl+right moves to last column in row', async () => {
        const api = await renderNavGrid({ rowData, columnDefs });
        api.setFocusedCell(0, 'a');
        dispatchKeyDown(KeyCode.RIGHT, { ctrlKey: true });
        expect(getFocusedColId(api)).toBe('c');
        expect(getFocusedRowIndex(api)).toBe(0);
    });

    test('ctrl+left moves to first column in row', async () => {
        const api = await renderNavGrid({ rowData, columnDefs });
        api.setFocusedCell(0, 'c');
        dispatchKeyDown(KeyCode.LEFT, { ctrlKey: true });
        expect(getFocusedColId(api)).toBe('a');
        expect(getFocusedRowIndex(api)).toBe(0);
    });

    test('ctrl+down moves to last row in column', async () => {
        const api = await renderNavGrid({ rowData, columnDefs });
        api.setFocusedCell(0, 'a');
        dispatchKeyDown(KeyCode.DOWN, { ctrlKey: true });
        expect(getFocusedRowIndex(api)).toBe(3);
        expect(getFocusedColId(api)).toBe('a');
    });

    test('ctrl+up moves to first row in column', async () => {
        const api = await renderNavGrid({ rowData, columnDefs });
        api.setFocusedCell(3, 'a');
        dispatchKeyDown(KeyCode.UP, { ctrlKey: true });
        expect(getFocusedRowIndex(api)).toBe(0);
        expect(getFocusedColId(api)).toBe('a');
    });

    test('Home moves to first cell of grid', async () => {
        const api = await renderNavGrid({ rowData, columnDefs });
        api.setFocusedCell(2, 'b');
        dispatchKeyDown(KeyCode.PAGE_HOME);
        expect(getFocusedRowIndex(api)).toBe(0);
        expect(getFocusedColId(api)).toBe('a');
    });

    test('End moves to last cell of grid', async () => {
        const api = await renderNavGrid({ rowData, columnDefs });
        api.setFocusedCell(1, 'a');
        dispatchKeyDown(KeyCode.PAGE_END);
        expect(getFocusedRowIndex(api)).toBe(3);
        expect(getFocusedColId(api)).toBe('c');
    });
});
