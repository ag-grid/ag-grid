import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import { ColDef, RowClickedEvent } from '@ag-grid-community/core';
import { expect, describe,  test, beforeEach, jest } from '@jest/globals';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React, { useCallback, useRef, useState } from 'react';
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
        { field: 'price' },
    ]);

    const [rowClicked, setRowClicked] = useState<RowData | null>(null);
    const [rowDoubleClicked, setRowDoubleClicked] = useState<RowData | null>(null);

    const onRowClicked = useCallback((params: RowClickedEvent) => {
        setRowClicked(params.data);
    }, []);

    const onRowDoubleClicked = useCallback((params: RowClickedEvent) => {
        setRowDoubleClicked(params.data);
    }, []);

    return (
        <div>
            <div data-testid="rowClicked">Row Clicked: {rowClicked?.make}</div>
            <div data-testid="rowDoubleClicked">Row Double Clicked: {rowDoubleClicked?.make}</div>
        <div className="ag-theme-quartz" style={{ height: 400, width: 600 }}>
            <AgGridReact<RowData>
                ref={gridRef}
                rowData={rowData}
                columnDefs={colDefs}
                onRowClicked={onRowClicked}
                onRowDoubleClicked={onRowDoubleClicked}
                modules={[ClientSideRowModelModule]} />
        </div>
        </div>
    );
};

describe('Row Clicks Grid', () => {

    beforeEach(() => {
       jest.spyOn(console, 'error').mockImplementation(jest.fn());
      });

    // render basic AgGridReact
    test('render grid and click a row', async () => {
        render(<App />);

        let row = await screen.findByText('Ford');
        expect(row).toBeDefined();

        await userEvent.click(row);

        let rowClicked = await screen.findByTestId('rowClicked');
        expect(rowClicked.textContent).toBe('Row Clicked: Ford');
    });

    // render basic AgGridReact
    test('render grid and double click a row', async () => {
        render(<App />);

        let row = await screen.findByText('Porsche');
        expect(row).toBeDefined();

        await userEvent.dblClick(row);

        let rowClicked = await screen.findByTestId('rowDoubleClicked');
        expect(rowClicked.textContent).toBe('Row Double Clicked: Porsche');
    });

});
