'use strict';

import React, { StrictMode, useState } from 'react';
import { createRoot } from 'react-dom/client';

import { ClientSideRowModelModule, CommunityFeaturesModule } from 'ag-grid-community';
import { ModuleRegistry } from 'ag-grid-community';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-quartz.css';
import { AgGridReact } from 'ag-grid-react';

ModuleRegistry.registerModules([ClientSideRowModelModule, CommunityFeaturesModule]);

const CustomButtonComponent = (props) => {
    return <button onClick={() => window.alert('clicked')}>Push Me!</button>;
};

const GridExample = () => {
    const [rowData, setRowData] = useState([
        { make: 'Tesla', model: 'Model Y', price: 64950, electric: true },
        { make: 'Ford', model: 'F-Series', price: 33850, electric: false },
        { make: 'Toyota', model: 'Corolla', price: 29600, electric: false },
        { make: 'Mercedes', model: 'EQA', price: 48890, electric: true },
        { make: 'Fiat', model: '500', price: 15774, electric: false },
        { make: 'Nissan', model: 'Juke', price: 20675, electric: false },
    ]);
    const [columnDefs, setColumnDefs] = useState([
        {
            headerName: 'Make & Model',
            valueGetter: (p) => p.data.make + ' ' + p.data.model,
            flex: 2,
        },
        {
            field: 'price',
            valueFormatter: (p) => '£' + Math.floor(p.value).toLocaleString(),
            flex: 1,
        },
        { field: 'electric', flex: 1 },
        { field: 'button', cellRenderer: CustomButtonComponent, flex: 1 },
    ]);

    return (
        <div style={{ width: '100%', height: '100%' }}>
            <div
                style={{ width: '100%', height: '100%' }}
                className={
                    /** DARK MODE START **/ document.documentElement.dataset.defaultTheme ||
                    'ag-theme-quartz' /** DARK MODE END **/
                }
            >
                <AgGridReact rowData={rowData} columnDefs={columnDefs} />
            </div>
        </div>
    );
};

const root = createRoot(document.getElementById('root'));
root.render(
    <StrictMode>
        <GridExample />
    </StrictMode>
);
