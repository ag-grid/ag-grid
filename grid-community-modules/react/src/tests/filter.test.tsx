import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import { ColDef } from '@ag-grid-community/core';
import { describe, expect, test } from '@jest/globals';
import { render, screen, waitForElementToBeRemoved } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React, { useRef, useState } from 'react';
import { act } from 'react-dom/test-utils';
import { AgGridReact } from '../agGridReact';

interface RowData {
    make: string;
    model: string;
    price: number;
}

const App = () => {
    const gridRef = useRef<AgGridReact<RowData>>(null);

    const [rowData] = useState<RowData[]>([
        { make: 'Toyota', model: 'Celica', price: 35000 },
        { make: 'Ford', model: 'Mondeo', price: 32000 },
        { make: 'Porsche', model: 'Boxster', price: 72000 }
    ]);
    const [colDefs, setColDefs] = useState<ColDef<RowData>[]>([
        { field: 'make' },
        { field: 'model' },
        { field: 'price', filter: true, floatingFilter: true },
    ]);

    return (
        <div className="ag-theme-quartz" style={{ height: 400, width: 600 }}>
            <AgGridReact<RowData>
                ref={gridRef}
                rowData={rowData}
                columnDefs={colDefs}
                modules={[ClientSideRowModelModule]} />
        </div>
    );
};

describe('Filter Grid Data', () => {

    test('enter value to floating filter', async () => {
        render(<App />);

        let fordCell = await screen.findByText('Ford')
        expect(fordCell).toBeDefined();

        let priceFloatingFilters: HTMLInputElement[] = await screen.findAllByLabelText('Price Filter Input');
        let priceFloatingFilter = priceFloatingFilters[0];

        expect(priceFloatingFilter).toBeDefined();

        let rows = await screen.findAllByRole('row');

        // 3 rows + the header rows (2)
        expect(rows.length).toBe(5);

        // Click to focus the floating filter input
        await userEvent.click(priceFloatingFilter);
        await act(async () => {
            return await userEvent.keyboard('32000');
        });

        await waitForElementToBeRemoved(() => {
            // Wait for Porsche row to be filtered out
            return screen.queryByText('Porsche')
        });

        rows = await screen.findAllByRole('row');
        // 1 rows + the header rows (2)
        expect(rows.length).toBe(3);

    });

});
