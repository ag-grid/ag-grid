import { act, cleanup, render } from '@testing-library/react';
import React from 'react';

import type { ColDef, GridApi } from 'ag-grid-community';
import {
    ClientSideRowModelModule,
    GROUP_AUTO_COLUMN_ID,
    KeyCode,
    ModuleRegistry,
    RenderApiModule,
    ValidationModule,
} from 'ag-grid-community';
import { RowGroupingModule } from 'ag-grid-enterprise';
import { AgGridReact } from 'ag-grid-react';

import { asyncSetTimeout, ignoreConsoleLicenseKeyError } from '../test-utils';

interface RowData {
    category: string;
    value: string;
}

const columnDefs: ColDef<RowData>[] = [
    { field: 'category', rowGroup: true, hide: true },
    { field: 'value', colId: 'value' },
];

// Expanded layout (groupDefaultExpanded: -1):
//   row 0: group A
//   row 1: leaf { category:'A', value:'v1' }
//   row 2: leaf { category:'A', value:'v2' }
//   row 3: group B
//   row 4: leaf { category:'B', value:'v3' }
const rowData: RowData[] = [
    { category: 'A', value: 'v1' },
    { category: 'A', value: 'v2' },
    { category: 'B', value: 'v3' },
];

function getCell(rowId: string, colId: string): HTMLElement {
    const cell = document.querySelector(`[row-id="${rowId}"] [col-id="${colId}"]`);
    if (!cell) {
        throw new Error(`No cell for row ${rowId} / column ${colId}`);
    }
    return cell as HTMLElement;
}

describe('Interactions while rows animate out (React)', () => {
    beforeAll(() => {
        ModuleRegistry.registerModules([
            ClientSideRowModelModule,
            RowGroupingModule,
            RenderApiModule,
            ValidationModule,
        ]);
        ignoreConsoleLicenseKeyError();
    });

    afterEach(() => {
        cleanup();
    });

    test('clicking a row that is animating out focuses the row now occupying that slot', async () => {
        let resolveReady!: (api: GridApi) => void;
        const readyPromise = new Promise<GridApi>((resolve) => {
            resolveReady = resolve;
        });

        act(() => {
            render(
                <AgGridReact
                    rowData={rowData}
                    columnDefs={columnDefs}
                    groupDefaultExpanded={-1}
                    suppressRowVirtualisation
                    suppressColumnVirtualisation
                    animateRows
                    onGridReady={(e) => resolveReady(e.api)}
                />
            );
        });

        const api = await readyPromise;
        await asyncSetTimeout(0); // allow React to complete the initial cell render pass

        act(() => api.setFocusedCell(0, GROUP_AUTO_COLUMN_ID));

        // collapse group A; its two leaves stay in the dom, fading out, until the animation completes
        act(() => {
            getCell('row-group-category-A', GROUP_AUTO_COLUMN_ID).dispatchEvent(
                new KeyboardEvent('keydown', { key: KeyCode.ENTER, bubbles: true, cancelable: true })
            );
            api.flushAllAnimationFrames();
        });
        await act(() => asyncSetTimeout(0));

        // the leaf that was at row index 1 is still rendered, covering the slot group B now owns.
        // jsdom reports no pointer/mouse support, so the grid listens for touchstart as its mouse down event
        act(() => {
            getCell('0', GROUP_AUTO_COLUMN_ID).dispatchEvent(
                new MouseEvent('touchstart', { bubbles: true, cancelable: true })
            );
        });

        expect(api.getFocusedCell()?.rowIndex).toBe(1);
        expect(api.getFocusedCell()?.column.getColId()).toBe(GROUP_AUTO_COLUMN_ID);
        expect(document.activeElement).toBe(getCell('row-group-category-B', GROUP_AUTO_COLUMN_ID));

        act(() => {
            (document.activeElement as HTMLElement).dispatchEvent(
                new KeyboardEvent('keydown', { key: KeyCode.DOWN, bubbles: true, cancelable: true })
            );
        });
        expect(api.getFocusedCell()?.rowIndex).toBe(2);
    });
});
