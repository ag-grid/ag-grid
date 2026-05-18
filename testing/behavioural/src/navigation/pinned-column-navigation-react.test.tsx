import { cleanup } from '@testing-library/react';

import type { ColDef } from 'ag-grid-community';
import { ClientSideRowModelModule, KeyCode, ModuleRegistry, ValidationModule } from 'ag-grid-community';

import { ignoreConsoleLicenseKeyError } from '../test-utils';
import { renderNavGrid } from './navigation-react-test-utils';
import { dispatchKeyDown, getFocusedColId, getFocusedRowIndex } from './navigation-test-utils';

interface RowData {
    pinLeft: string;
    body1: string;
    body2: string;
    pinRight: string;
}

const columnDefs: ColDef<RowData>[] = [
    { field: 'pinLeft', colId: 'pinLeft', pinned: 'left' },
    { field: 'body1', colId: 'body1' },
    { field: 'body2', colId: 'body2' },
    { field: 'pinRight', colId: 'pinRight', pinned: 'right' },
];

const rowData: RowData[] = [
    { pinLeft: 'pl0', body1: 'b10', body2: 'b20', pinRight: 'pr0' },
    { pinLeft: 'pl1', body1: 'b11', body2: 'b21', pinRight: 'pr1' },
    { pinLeft: 'pl2', body1: 'b12', body2: 'b22', pinRight: 'pr2' },
];

describe('Pinned Column Navigation (React)', () => {
    beforeAll(() => {
        ModuleRegistry.registerModules([ClientSideRowModelModule, ValidationModule]);
        ignoreConsoleLicenseKeyError();
    });

    afterEach(() => {
        cleanup();
    });

    test('right arrow from last pinned-left column moves into first body column', async () => {
        const api = await renderNavGrid({ rowData, columnDefs });
        api.setFocusedCell(0, 'pinLeft');
        dispatchKeyDown(KeyCode.RIGHT);
        expect(getFocusedColId(api)).toBe('body1');
        expect(getFocusedRowIndex(api)).toBe(0);
    });

    test('left arrow from first body column moves into last pinned-left column', async () => {
        const api = await renderNavGrid({ rowData, columnDefs });
        api.setFocusedCell(0, 'body1');
        dispatchKeyDown(KeyCode.LEFT);
        expect(getFocusedColId(api)).toBe('pinLeft');
        expect(getFocusedRowIndex(api)).toBe(0);
    });

    test('right arrow from last body column moves into first pinned-right column', async () => {
        const api = await renderNavGrid({ rowData, columnDefs });
        api.setFocusedCell(0, 'body2');
        dispatchKeyDown(KeyCode.RIGHT);
        expect(getFocusedColId(api)).toBe('pinRight');
        expect(getFocusedRowIndex(api)).toBe(0);
    });

    test('left arrow from first pinned-right column moves into last body column', async () => {
        const api = await renderNavGrid({ rowData, columnDefs });
        api.setFocusedCell(0, 'pinRight');
        dispatchKeyDown(KeyCode.LEFT);
        expect(getFocusedColId(api)).toBe('body2');
        expect(getFocusedRowIndex(api)).toBe(0);
    });

    test('Home key navigates to first pinned-left column on row 0', async () => {
        const api = await renderNavGrid({ rowData, columnDefs });
        api.setFocusedCell(1, 'body2');
        dispatchKeyDown(KeyCode.PAGE_HOME);
        expect(getFocusedRowIndex(api)).toBe(0);
        expect(getFocusedColId(api)).toBe('pinLeft');
    });

    test('End key navigates to last pinned-right column on last row', async () => {
        const api = await renderNavGrid({ rowData, columnDefs });
        api.setFocusedCell(0, 'body1');
        dispatchKeyDown(KeyCode.PAGE_END);
        expect(getFocusedRowIndex(api)).toBe(2);
        expect(getFocusedColId(api)).toBe('pinRight');
    });

    test('Tab traverses pinned-left then body then pinned-right in order', async () => {
        const api = await renderNavGrid({ rowData, columnDefs });
        api.setFocusedCell(0, 'pinLeft');

        dispatchKeyDown(KeyCode.TAB);
        expect(getFocusedColId(api)).toBe('body1');

        dispatchKeyDown(KeyCode.TAB);
        expect(getFocusedColId(api)).toBe('body2');

        dispatchKeyDown(KeyCode.TAB);
        expect(getFocusedColId(api)).toBe('pinRight');
    });
});
