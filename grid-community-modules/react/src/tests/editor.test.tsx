import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import { ColDef } from '@ag-grid-community/core';
import { describe, test } from '@jest/globals';
import { fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React, { useRef, useState } from 'react';
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
        { field: 'price', editable: true, valueFormatter: (params) => "$" + params.value.toLocaleString()},
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

describe('Edit Cell Grid', () => {

    test('double click cell to edit', async () => {
        render(<App />);

        let porschePrice = await screen.findByText('$72,000')

        // double click to enter edit mode       
        await userEvent.dblClick(porschePrice);

        let input: HTMLInputElement = within(porschePrice).getByLabelText('Input Editor');

        await userEvent.keyboard('100000');

        // press enter to save
        fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });

        porschePrice = await screen.findByText('$100,000')

    });

});
