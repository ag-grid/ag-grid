// React Grid Logic
import React, { StrictMode, useState } from 'react';
import { createRoot } from 'react-dom/client';

import { ClientSideRowModelModule } from 'ag-grid-community';
// Theme
import type { ColDef } from 'ag-grid-community';
import { ModuleRegistry } from 'ag-grid-community';
import 'ag-grid-community/styles/ag-grid.css';
// Core CSS
import 'ag-grid-community/styles/ag-theme-quartz.css';
import { AgGridReact } from 'ag-grid-react';

ModuleRegistry.registerModules([ClientSideRowModelModule]);

// Row Data Interface
interface IRow {
    make: string;
    model: string;
    price: number;
    electric: boolean;
}

// Create new GridExample component
const GridExample = () => {
    // Row Data: The data to be displayed.
    const [rowData, setRowData] = useState<IRow[]>([
        { make: 'Tesla', model: 'Model Y', price: 64950, electric: true },
        { make: 'Ford', model: 'F-Series', price: 33850, electric: false },
        { make: 'Toyota', model: 'Corolla', price: 29600, electric: false },
        { make: 'Mercedes', model: 'EQA', price: 48890, electric: true },
        { make: 'Fiat', model: '500', price: 15774, electric: false },
        { make: 'Nissan', model: 'Juke', price: 20675, electric: false },
    ]);

    // Column Definitions: Defines & controls grid columns.
    const [colDefs, setColDefs] = useState<ColDef<IRow>[]>([
        { field: 'make' },
        { field: 'model' },
        { field: 'price' },
        { field: 'electric' },
    ]);

    const defaultColDef: ColDef = {
        flex: 1,
    };

    // Container: Defines the grid's theme & dimensions.
    return (
        <div
            className={
                /** DARK MODE START **/ document.documentElement?.dataset.defaultTheme ||
                'ag-theme-quartz' /** DARK MODE END **/
            }
            style={{ width: '100%', height: '100%' }}
        >
            <AgGridReact rowData={rowData} columnDefs={colDefs} defaultColDef={defaultColDef} />
        </div>
    );
};

// Render GridExample
const root = createRoot(document.getElementById('root')!);
root.render(
    <StrictMode>
        <GridExample />
    </StrictMode>
);
