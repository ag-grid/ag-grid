import { act, cleanup, render, waitFor } from '@testing-library/react';
import { asyncSetTimeout, initPointerEventPolyfill } from 'ag-test-utils';
import React from 'react';

import type { GridApi, GridOptions, GridReadyEvent } from 'ag-grid-community';
import { ModuleRegistry } from 'ag-grid-community';
import { AllEnterpriseModule } from 'ag-grid-enterprise';
import { AgGridReact } from 'ag-grid-react';

/**
 * Touch presses are deferred in the shared `RowContainerEventsFeature`, but React re-implements the row
 * container, cell and group cell renderer views, so this guards the deferral under React reconciliation.
 */
describe('touch press on a cell (react)', () => {
    beforeAll(() => {
        initPointerEventPolyfill();
        ModuleRegistry.registerModules([AllEnterpriseModule]);
    });

    beforeEach(() => {
        cleanup();
    });

    function renderGrid(gridOptions: GridOptions = {}): () => GridApi {
        let gridApi: GridApi | undefined;
        render(
            <AgGridReact
                columnDefs={[{ field: 'athlete' }, { field: 'age' }]}
                rowData={[
                    { athlete: 'A', age: 20 },
                    { athlete: 'B', age: 21 },
                ]}
                getRowId={(params) => params.data.athlete}
                {...gridOptions}
                onGridReady={(e: GridReadyEvent) => {
                    gridApi = e.api;
                }}
            />
        );
        return () => gridApi!;
    }

    function findElement(selector: string) {
        return waitFor(() => {
            const element = document.querySelector<HTMLElement>(selector);
            expect(element).not.toBeNull();
            return element!;
        });
    }

    function press(target: HTMLElement) {
        const init: PointerEventInit = { bubbles: true, cancelable: true, button: 0, buttons: 1, pointerType: 'touch' };
        act(() => {
            target.dispatchEvent(new PointerEvent('pointerdown', init));
            target.dispatchEvent(new PointerEvent('pointerup', { ...init, buttons: 0 }));
        });
    }

    function click(target: HTMLElement) {
        act(() => {
            target.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
        });
    }

    test('a touch that becomes a scroll does not focus the cell', async () => {
        const getApi = renderGrid();
        const cell = await findElement('.ag-row[row-id="B"] .ag-cell[col-id="age"]');

        press(cell);
        await act(async () => {
            await asyncSetTimeout(0);
        });

        expect(getApi().getFocusedCell()).toBeNull();
    });

    test('a tap focuses the cell', async () => {
        const getApi = renderGrid();
        const cell = await findElement('.ag-row[row-id="B"] .ag-cell[col-id="age"]');

        press(cell);
        click(cell);

        expect(getApi().getFocusedCell()).toMatchObject({ rowIndex: 1, column: getApi().getColumn('age') });
    });

    test('a tap on a group chevron expands the group and focuses its cell', async () => {
        const getApi = renderGrid({
            columnDefs: [{ field: 'athlete', rowGroup: true, hide: true }, { field: 'age' }],
        });
        const chevron = await findElement('.ag-group-contracted');

        press(chevron);
        click(chevron);

        await waitFor(() => expect(getApi().getDisplayedRowAtIndex(0)?.expanded).toBe(true));
        expect(getApi().getFocusedCell()?.rowIndex).toBe(0);
    });
});
