import React, { StrictMode, useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';

import type { ColDef, Toolbar } from 'ag-grid-community';
import {
    ClientSideRowModelModule,
    ColumnApiModule,
    ColumnAutoSizeModule,
    NumberFilterModule,
    TextFilterModule,
    ValidationModule,
} from 'ag-grid-community';
import { FindModule, RowGroupingModule, RowGroupingPanelModule, ToolbarModule } from 'ag-grid-enterprise';
import { AgGridProvider, AgGridReact } from 'ag-grid-react';

const modules = [
    TextFilterModule,
    NumberFilterModule,
    ClientSideRowModelModule,
    ColumnApiModule,
    ColumnAutoSizeModule,
    FindModule,
    RowGroupingModule,
    RowGroupingPanelModule,
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
            { field: 'country', minWidth: 200, enableRowGroup: true },
            { field: 'sport', minWidth: 200, enableRowGroup: true },
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
    const autoGroupColumnDef = useMemo<ColDef>(() => ({ minWidth: 200 }), []);
    const toolbar = useMemo<Toolbar>(
        () => ({
            alignment: 'right',
            items: [
                { toolbarItem: 'agRowGroupPanelToolbarItem', alignment: 'left' },
                'agFindToolbarItem',
                {
                    key: 'autoSizeAll',
                    label: 'Auto Size All',
                    icon: 'maximize',
                    action: (params) => params.api.autoSizeAllColumns(),
                },
                {
                    key: 'resetColumns',
                    label: 'Reset Columns',
                    icon: 'minimize',
                    action: (params) => params.api.resetColumnState(),
                },
            ],
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
