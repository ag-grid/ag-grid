// React Grid Logic
import React, { StrictMode, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';

import type { ColDef } from 'ag-grid-community';
import { AllCommunityModule } from 'ag-grid-community';
import { AgGridProvider, AgGridReact } from 'ag-grid-react';

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
        { field: 'mission', filter: true },
        { field: 'company' },
        { field: 'location' },
        { field: 'date' },
        { field: 'price' },
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
        <AgGridProvider modules={[AllCommunityModule]}>
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
        </AgGridProvider>
    );
};

// Render GridExample
const root = createRoot(document.getElementById('root')!);
root.render(
    <StrictMode>
        <GridExample />
    </StrictMode>
);
