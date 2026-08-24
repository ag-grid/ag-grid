import { cleanup, render, waitFor } from '@testing-library/react';
import React from 'react';

import type { ColDef, GridApi } from 'ag-grid-community';
import { ClientSideRowModelModule, ModuleRegistry, RowStyleModule } from 'ag-grid-community';
import { AgGridReact } from 'ag-grid-react';

interface RowData {
    price: number;
    quantity: number;
}

describe('CSRM loading rows (React)', () => {
    beforeAll(() => {
        ModuleRegistry.registerModules([ClientSideRowModelModule, RowStyleModule]);
    });

    afterEach(() => {
        cleanup();
    });

    test('renders custom loading cells without data callbacks and replaces them with real rows', async () => {
        let valueGetterCallsWithMissingData = 0;
        let getRowStyleCallsWithMissingData = 0;
        let firstDataRenderedCount = 0;
        const CustomLoadingCell = () => <span className="custom-loading-cell">Loading total...</span>;
        const columnDefs: ColDef<RowData>[] = [
            {
                colId: 'total',
                headerName: 'Total',
                valueGetter: (params) => {
                    if (!params.data) {
                        valueGetterCallsWithMissingData++;
                        return undefined;
                    }
                    return params.data.price * params.data.quantity;
                },
                loadingCellRenderer: CustomLoadingCell,
            },
        ];
        const getRowStyle = (params: { data: RowData | undefined }) => {
            if (!params.data) {
                getRowStyleCallsWithMissingData++;
            }
            return undefined;
        };

        let api: GridApi<RowData> | undefined;
        const rendered = render(
            <div style={{ height: 400, width: 600 }}>
                <AgGridReact<RowData>
                    columnDefs={columnDefs}
                    loading={{ type: 'rows', rowCount: 3 }}
                    getRowStyle={getRowStyle}
                    onFirstDataRendered={() => firstDataRenderedCount++}
                    onGridReady={(event) => (api = event.api)}
                />
            </div>
        );

        await waitFor(() => expect(rendered.container.querySelectorAll('.ag-row-loading')).toHaveLength(3));
        await waitFor(() => expect(rendered.container.querySelectorAll('.custom-loading-cell')).toHaveLength(3));
        expect(valueGetterCallsWithMissingData).toBe(0);
        expect(getRowStyleCallsWithMissingData).toBe(0);
        expect(firstDataRenderedCount).toBe(0);

        api!.refreshCells({ force: true });
        expect(valueGetterCallsWithMissingData).toBe(0);
        expect(rendered.container.querySelectorAll('.custom-loading-cell')).toHaveLength(3);

        rendered.rerender(
            <div style={{ height: 400, width: 600 }}>
                <AgGridReact<RowData>
                    columnDefs={columnDefs}
                    rowData={[{ price: 2, quantity: 3 }]}
                    loading={false}
                    getRowStyle={getRowStyle}
                    onFirstDataRendered={() => firstDataRenderedCount++}
                />
            </div>
        );

        await waitFor(() =>
            expect(rendered.container.querySelector('.ag-cell[col-id="total"]')?.textContent).toBe('6')
        );
        expect(rendered.container.querySelectorAll('.ag-row-loading')).toHaveLength(0);
        expect(rendered.container.querySelectorAll('.custom-loading-cell')).toHaveLength(0);
        await waitFor(() => expect(firstDataRenderedCount).toBe(1));
    });

    test('Tab from the final header is not consumed when loading cells are non-navigable', async () => {
        const rendered = render(
            <div style={{ height: 400, width: 600 }}>
                <AgGridReact<RowData>
                    columnDefs={[{ field: 'price' }, { field: 'quantity' }]}
                    loading={{ type: 'rows', rowCount: 3 }}
                />
            </div>
        );

        await waitFor(() => expect(rendered.container.querySelectorAll('.ag-row-loading')).toHaveLength(3));
        const finalHeader = rendered.container.querySelectorAll<HTMLElement>('.ag-header-cell').item(1);
        finalHeader.focus();
        const event = new KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true });
        finalHeader.dispatchEvent(event);

        expect(event.defaultPrevented).toBe(false);
        expect(rendered.container.querySelector('.ag-cell-focus')).toBeNull();
    });
});
