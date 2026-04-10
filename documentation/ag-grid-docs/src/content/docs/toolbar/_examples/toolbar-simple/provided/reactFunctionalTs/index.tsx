import React, { StrictMode, useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';

import type { ColDef, Toolbar } from 'ag-grid-community';
import { ClientSideRowModelModule, NumberFilterModule, TextFilterModule, ValidationModule } from 'ag-grid-community';
import { RowGroupingModule, ToolbarModule } from 'ag-grid-enterprise';
import { AgGridProvider, AgGridReact } from 'ag-grid-react';

import CustomToolbarItem from './customToolbarItem';

const modules = [
    TextFilterModule,
    NumberFilterModule,
    ClientSideRowModelModule,
    RowGroupingModule,
    ToolbarModule,
    ...(process.env.NODE_ENV !== 'production' ? [ValidationModule] : []),
];

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
            { field: 'athlete', minWidth: 200 },
            { field: 'country', minWidth: 200 },
            { field: 'sport', minWidth: 200 },
            { field: 'year', filter: 'agNumberColumnFilter' },
            { field: 'gold' },
            { field: 'silver' },
            { field: 'bronze' },
            { field: 'total' },
        ],
        []
    );
    const defaultColDef = useMemo<ColDef>(
        () => ({
            flex: 1,
            minWidth: 100,
            filter: true,
        }),
        []
    );
    const autoGroupColumnDef = useMemo<ColDef>(
        () => ({
            minWidth: 200,
        }),
        []
    );
    const toolbar = useMemo<Toolbar>(
        () => ({
            items: [{ toolbarItem: CustomToolbarItem, key: 'analyseByCountry' }],
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
                        autoGroupColumnDef={autoGroupColumnDef}
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
