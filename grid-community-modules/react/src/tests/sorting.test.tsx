import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import { ColDef } from '@ag-grid-community/core';
import { describe, test, expect } from '@jest/globals';
import { configure, render, screen, within } from '@testing-library/react';
import React, { useRef, useState } from 'react';
import { AgGridReact } from '../agGridReact';
import userEvent from '@testing-library/user-event'
import exp from 'constants';

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

    return (
        <div className="ag-theme-quartz" style={{ height: 400, width: 600 }}>
            <AgGridReact<RowData>
                ref={gridRef}
                rowData={rowData}
                columnDefs={colDefs}
                ensureDomOrder // Required to test sorting so that DOM order matches the order of the rows in the grid
                modules={[ClientSideRowModelModule]} />
        </div>
    );
};

describe('Sorting Grid Data', () => {

    test('render basic grid', async () => {
        render(<App />);
        await screen.findByText('Boxster')

    });

    test('render grid and then sort by price', async () => {
        render(<App />);

        let rowsBefore: string[] = [];
        document.querySelectorAll('.ag-row').forEach((row, index) => {
            rowsBefore.push(row.textContent!);
        });

        expect(rowsBefore[0]).toBe('ToyotaCelica35000');
        expect(rowsBefore[1]).toBe('FordMondeo32000');
        expect(rowsBefore[2]).toBe('PorscheBoxster72000');

        // Click the price header to sort by price
        const priceHeader = (await screen.findByText('Price'));
        await userEvent.click(priceHeader);


        let rowsAfter: string[] = [];
        document.querySelectorAll('.ag-row').forEach((row, index) => {
            rowsAfter.push(row.textContent!);
        });

        expect(rowsAfter[0]).toBe('FordMondeo32000');
        expect(rowsAfter[1]).toBe('ToyotaCelica35000');
        expect(rowsAfter[2]).toBe('PorscheBoxster72000');
    });

});
