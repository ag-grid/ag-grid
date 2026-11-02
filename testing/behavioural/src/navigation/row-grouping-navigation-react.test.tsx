import { act, cleanup, render } from '@testing-library/react';
import { asyncSetTimeout } from 'ag-test-utils';
import React from 'react';

import type { GridApi } from 'ag-grid-community';
import { ClientSideRowModelModule, KeyCode, ModuleRegistry } from 'ag-grid-community';
import { RowGroupingModule } from 'ag-grid-enterprise';
import { AgGridReact } from 'ag-grid-react';

import { dispatchKeyDown, getFocusedRowIndex } from './navigation-test-utils';

const flush = async () => {
    await act(async () => {
        await asyncSetTimeout(0);
    });
};

describe('Row Grouping Navigation (React)', () => {
    beforeAll(() => {
        ModuleRegistry.registerModules([ClientSideRowModelModule, RowGroupingModule]);
    });

    afterEach(() => {
        cleanup();
    });

    test('ctrl+down and ctrl+up from a full width group row move to the last and first row', async () => {
        let api: GridApi | undefined;
        render(
            <AgGridReact
                columnDefs={[{ field: 'category', rowGroup: true, hide: true }, { field: 'value' }]}
                rowData={[
                    { category: 'A', value: 'v1' },
                    { category: 'B', value: 'v2' },
                    { category: 'C', value: 'v3' },
                ]}
                groupDisplayType="groupRows"
                onGridReady={(e) => {
                    api = e.api;
                }}
            />
        );
        await flush();

        // Collapsed layout: 0 = group A, 1 = group B, 2 = group C
        act(() => {
            api!.setFocusedCell(0, 'value');
        });
        await flush();
        expect(document.activeElement?.classList.contains('ag-full-width-row')).toBe(true);

        act(() => {
            dispatchKeyDown(KeyCode.DOWN, { ctrlKey: true });
        });
        await flush();
        expect(getFocusedRowIndex(api!)).toBe(2);
        expect(document.activeElement?.getAttribute('row-index')).toBe('2');

        act(() => {
            dispatchKeyDown(KeyCode.UP, { ctrlKey: true });
        });
        await flush();
        expect(getFocusedRowIndex(api!)).toBe(0);
        expect(document.activeElement?.getAttribute('row-index')).toBe('0');
    });
});
