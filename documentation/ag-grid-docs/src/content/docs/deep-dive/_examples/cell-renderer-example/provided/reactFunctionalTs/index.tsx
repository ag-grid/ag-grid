// React Grid Logic
import React, { StrictMode, useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';

// Theme
import type { ColDef, ValueFormatterParams } from 'ag-grid-community';
import { AllCommunityModule, ModuleRegistry } from 'ag-grid-community';
// Core CSS
import type { CustomCellRendererProps } from 'ag-grid-react';
import { AgGridReact } from 'ag-grid-react';

ModuleRegistry.registerModules([AllCommunityModule]);

// Custom Cell Renderer (Display logos based on cell value)
const CompanyLogoRenderer = (params: CustomCellRendererProps) => (
    <span style={{ display: 'flex', height: '100%', width: '100%', alignItems: 'center' }}>
        {params.value && (
            <img
                alt={`${params.value} Flag`}
                src={`https://www.ag-grid.com/example-assets/space-company-logos/${params.value.toLowerCase()}.png`}
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
        <p style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{params.value}</p>
    </span>
);

// Row Data Interface
interface IRow {
    mission: string;
    company: string;
    location: string;
    date: string;
    time: string;
    rocket: string;
    price: number;
    successful: boolean;
}

// Create new GridExample component
const GridExample = () => {
    // Row Data: The data to be displayed.
    const { data, loading } = useFetchJson<IRow>('https://www.ag-grid.com/example-assets/space-mission-data.json');

    // Column Definitions: Defines & controls grid columns.
    const [colDefs] = useState<ColDef[]>([
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
            valueFormatter: (params: ValueFormatterParams) => {
                return '£' + params.value.toLocaleString();
            },
        },
        { field: 'successful' },
        { field: 'rocket' },
    ]);

    // Apply settings across all columns
    const defaultColDef = useMemo<ColDef>(() => {
        return {
            filter: true,
        };
    }, []);

    // Container: Defines the grid's theme & dimensions.
    return (
        <div style={{ width: '100%', height: '100%' }}>
            {/* The AG Grid component, with Row Data & Column Definition props */}
            <AgGridReact
                rowData={data}
                loading={loading}
                columnDefs={colDefs}
                defaultColDef={defaultColDef}
                pagination={true}
            />
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
