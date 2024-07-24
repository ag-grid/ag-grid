import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
// Theme
import { ModuleRegistry } from '@ag-grid-community/core';
import { AgGridReact } from '@ag-grid-community/react';
// React Grid Logic
import '@ag-grid-community/styles/ag-grid.css';
// Core CSS
import '@ag-grid-community/styles/ag-theme-quartz.css';
import React, { StrictMode, useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';

ModuleRegistry.registerModules([ClientSideRowModelModule]);

// Custom Cell Renderer (Display logos based on cell value)
const CompanyLogoRenderer = ({ value }) => (
    <span style={{ display: 'flex', height: '100%', width: '100%', alignItems: 'center' }}>
        {value && (
            <img
                alt={`${value} Flag`}
                src={`https://www.ag-grid.com/example-assets/space-company-logos/${value.toLowerCase()}.png`}
                style={{
                    display: 'block',
                    width: '25px',
                    height: 'auto',
                    maxHeight: '50%',
                    marginRight: '12px',
                    filter: 'brightness(1.1)',
                }}
            />
        )}
        <p style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{value}</p>
    </span>
);

// Create new GridExample component
const GridExample = () => {
    // Row Data: The data to be displayed.
    const [rowData, setRowData] = useState([]);

    // Column Definitions: Defines & controls grid columns.
    const [colDefs] = useState([
        {
            field: 'mission',
            filter: true,
        },
        {
            field: 'company',
            cellRenderer: CompanyLogoRenderer,
        },
        {
            field: 'location',
        },
        { field: 'date' },
        {
            field: 'price',
            valueFormatter: (params) => {
                return '£' + params.value.toLocaleString();
            },
        },
        { field: 'successful' },
        { field: 'rocket' },
    ]);

    // Fetch data & update rowData state
    useEffect(() => {
        fetch('https://www.ag-grid.com/example-assets/space-mission-data.json') // Fetch data from server
            .then((result) => result.json()) // Convert to JSON
            .then((rowData) => setRowData(rowData)); // Update state of `rowData`
    }, []);

    // Apply settings across all columns
    const defaultColDef = useMemo(() => ({
        filter: true,
        editable: true,
    }));

    // Container: Defines the grid's theme & dimensions.
    return (
        <div
            className={
                /** DARK MODE START **/ document.documentElement.dataset.defaultTheme ||
                'ag-theme-quartz' /** DARK MODE END **/
            }
            style={{ width: '100%', height: '100%' }}
        >
            <AgGridReact
                rowData={rowData}
                columnDefs={colDefs}
                defaultColDef={defaultColDef}
                pagination={true}
                onCellValueChanged={(event) => console.log(`New Cell Value: ${event.value}`)}
            />
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
