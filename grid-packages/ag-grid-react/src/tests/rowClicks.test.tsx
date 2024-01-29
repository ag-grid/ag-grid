import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import { ColDef } from 'ag-grid-community';
import { describe, test , expect} from '@jest/globals';
import { configure, render, screen, within } from '@testing-library/react';
import React, { useRef, useState } from 'react';
import { AgGridReact } from '../agGridReact';
import { act } from 'react-dom/test-utils';
import userEvent from '@testing-library/user-event';

interface RowData {
    make: string;
    model: string;
    price: number;
}

const App = () => {
    const gridRef = useRef<AgGridReact<RowData>>(null);

    const [rowData] = useState<RowData[]>([
        { make: 'Toyota',  model: 'Celica', price: 35000 },
        { make: 'Ford', model: 'Mondeo', price: 32000 },
        { make: 'Porsche', model: 'Boxster', price: 72000 }
    ]);
    const [colDefs, setColDefs] = useState<ColDef<RowData>[]>([
        { field: 'make' },
        { field: 'model' },
        { field: 'price' },
    ]);

    return (
        <div className="ag-theme-quartz" style={{height: 400, width: 600}}>
            <AgGridReact<RowData>
                ref={ gridRef }
                rowData={ rowData }
                columnDefs={colDefs}
                onRowDoubleClicked={() => {
                    console.log('row double clicked...!')
                }}
                modules={[ClientSideRowModelModule]} />
        </div>
    );
};

describe('Basic Grid', () => {

    configure({testIdAttribute: 'row-business-key'})

    // render basic AgGridReact
    test('render basic grid',async () => {
        render(<App />);

        await screen.findByText('Boxster') 
        
    });


        // render basic AgGridReact
        test('render grid and then sort by price',async () => {
            render(<App />);
    
            let rows = await screen.findAllByTestId('rowID');

            expect(rows.length).toBe(3)

            expect(within(rows[0]).getByText('Toyota')).toBeDefined();
            expect(within(rows[1]).getByText('Ford')).toBeDefined();
            expect(within(rows[2]).getByText('Porsche')).toBeDefined();

            const priceHeader = (await screen.findByText('Price'));
            
            await userEvent.click(priceHeader);
            await userEvent.click(priceHeader);

            rows = await screen.findAllByTestId('rowID');


            expect(within(rows[0]).getByText('Toyota')).toBeDefined();
            expect(within(rows[1]).getByText('Ford')).toBeDefined();
            expect(within(rows[2]).getByText('Porsche')).toBeDefined();
        });
    
});
   