import React, { StrictMode, useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';

import type { ColDef, Toolbar } from 'ag-grid-community';
import { AllCommunityModule } from 'ag-grid-community';
import { ToolbarModule } from 'ag-grid-enterprise';
import { AgGridProvider, AgGridReact } from 'ag-grid-react';

import WinnersToggle from './customToolbarItem';

const modules = [AllCommunityModule, ToolbarModule];

const GridExample = () => {
    const containerStyle = useMemo(() => ({ width: '100%', height: '100%' }), []);
    const gridStyle = useMemo(() => ({ height: '100%', width: '100%' }), []);
    const [rowData, setRowData] = useState<any[]>();

    useEffect(() => {
        fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
            .then((response) => response.json())
            .then((data) => setRowData(data));
    }, []);

    const columnDefs = useMemo<ColDef[]>(
        () => [
            { field: 'athlete' },
            { field: 'country' },
            { field: 'gold', filter: 'agNumberColumnFilter' },
            { field: 'silver', filter: 'agNumberColumnFilter' },
            { field: 'bronze' },
        ],
        []
    );
    const defaultColDef = useMemo<ColDef>(
        () => ({
            minWidth: 100,
        }),
        []
    );
    const toolbar = useMemo<Toolbar>(
        () => ({
            items: [{ toolbarItem: WinnersToggle, key: 'winners' }],
        }),
        []
    );

    return (
        <AgGridProvider modules={modules}>
            <div style={containerStyle}>
                <div style={gridStyle}>
                    <AgGridReact
                        rowData={rowData}
                        columnDefs={columnDefs}
                        defaultColDef={defaultColDef}
                        toolbar={toolbar}
                    />
                </div>
            </div>
        </AgGridProvider>
    );
};

const root = createRoot(document.getElementById('root')!);
root.render(
    <StrictMode>
        <GridExample />
    </StrictMode>
);
