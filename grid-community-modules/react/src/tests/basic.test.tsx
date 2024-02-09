import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import { ColDef } from '@ag-grid-community/core';
import { describe, test, expect } from '@jest/globals';
import { configure, render, screen, within } from '@testing-library/react';
import React, { useRef, useState } from 'react';
import { AgGridReact } from '../agGridReact';
import userEvent from '@testing-library/user-event'

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
                modules={[ClientSideRowModelModule]} />
        </div>
    );
};

describe('Basic Grid', () => {

    test('render basic grid', async () => {
        render(<App />);
        await screen.findByText('Boxster')

    });

});
