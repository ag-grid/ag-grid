// React Grid Logic
import '@ag-grid-community/styles/ag-grid.css';
// Core CSS
import '@ag-grid-community/styles/ag-theme-quartz.css';
import React, { StrictMode, useState } from 'react';
import { createRoot } from 'react-dom/client';

import { ClientSideRowModelModule, CommunityFeaturesModule } from 'ag-grid-community';
// Theme
import { ModuleRegistry } from 'ag-grid-community';
import { AgGridReact } from 'ag-grid-react';

ModuleRegistry.registerModules([ClientSideRowModelModule, CommunityFeaturesModule]);

// Create new GridExample component
const GridExample = () => {
    // Row Data: The data to be displayed.
    const [rowData, setRowData] = useState([
        {
            mission: 'CRS SpX-25',
            company: 'SpaceX',
            location: 'LC-39A, Kennedy Space Center, Florida, USA',
            date: '2022-07-15',
            time: '0:44:00',
            rocket: 'Falcon 9 Block 5',
            price: 12480000,
            successful: true,
        },
        {
            mission: 'LARES 2 & Cubesats',
            company: 'ESA',
            location: 'ELV-1, Guiana Space Centre, French Guiana, France',
            date: '2022-07-13',
            time: '13:13:00',
            rocket: 'Vega C',
            price: 4470000,
            successful: true,
        },
        {
            mission: 'Wise One Looks Ahead (NROL-162)',
            company: 'Rocket Lab',
            location: 'Rocket Lab LC-1A, Māhia Peninsula, New Zealand',
            date: '2022-07-13',
            time: '6:30:00',
            rocket: 'Electron/Curie',
            price: 9750000,
            successful: true,
        },
    ]);

    // Column Definitions: Defines & controls grid columns.
    const [colDefs] = useState([
        { field: 'mission' },
        { field: 'company' },
        { field: 'location' },
        { field: 'date' },
        { field: 'price' },
        { field: 'successful' },
        { field: 'rocket' },
    ]);

    // Container: Defines the grid's theme & dimensions.
    return (
        <div
            className={
                /** DARK MODE START **/ document.documentElement.dataset.defaultTheme ||
                'ag-theme-quartz' /** DARK MODE END **/
            }
            style={{ width: '100%', height: '100%' }}
        >
            <AgGridReact rowData={rowData} columnDefs={colDefs} />
        </div>
    );
};

// Render GridExample
const root = createRoot(document.getElementById('root'));
root.render(
    <StrictMode>
        <GridExample />
    </StrictMode>
);
