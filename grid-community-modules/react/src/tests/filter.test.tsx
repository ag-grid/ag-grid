import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import { ColDef } from '@ag-grid-community/core';
import { describe, expect, test } from '@jest/globals';
import { fireEvent, render, screen, waitFor, waitForElementToBeRemoved, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React, { useRef, useState } from 'react';
import { AgGridReact } from '../agGridReact';
import exp from 'constants';
import { act } from 'react-dom/test-utils';
import { wait } from '@testing-library/user-event/dist/types/utils';

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
        { field: 'make'},
        { field: 'model', valueGetter: (params) => {
            console.log(params.data?.make.toUpperCase())
            return params.data?.make.toUpperCase()
        } },
        { field: 'price', filter: true, floatingFilter: true },
    ]);

    return (
        <div className="ag-theme-quartz" style={{ height: 400, width: 600 }}>
            <AgGridReact<RowData>
                ref={gridRef}
                rowData={rowData}
                columnDefs={colDefs}
                ensureDomOrder
                onFilterChanged={(e) => console.log(e.type)}
                onFilterModified={(e) => {
                    let count = 0;
                    
                    e.api.forEachNodeAfterFilter(d => {
                      
                      count++
                    })
                    console.log(count, e.filterInstance.getModel())
                }}
                modules={[ClientSideRowModelModule]} />
        </div>
    );
};

describe('Filter Grid Data', () => {

    test('enter value to floating filter', async () => {
        render(<App />);

        let fordCell1 = await screen.findByText('Ford')
        expect(fordCell1).toBeDefined();

        let priceFloatingFilters: HTMLInputElement[] = await screen.findAllByLabelText('Price Filter Input');
        let priceFloatingFilter = priceFloatingFilters[0];

        expect(priceFloatingFilter).toBeDefined();

        let rows = await screen.findAllByRole('row');

        expect(rows.length).toBe(5);

        console.log('priceFloatingFilter', priceFloatingFilter);
        // Click to focus the floating filter input
        await userEvent.click(priceFloatingFilter);

         await act(async () => {
             return await userEvent.keyboard('32000');
         });

        console.log('priceFloatingFilter', priceFloatingFilter.value);

        await waitForElementToBeRemoved(() => screen.queryByText('Ford'), { timeout: 5000, interval: 1000});    

         

    });

});
