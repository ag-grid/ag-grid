import React, { StrictMode, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';

import type { ColDef, ValueFormatterParams } from 'ag-grid-community';
import {
    ClientSideRowModelModule,
    ModuleRegistry,
    NumberFilterModule,
    RowSelectionModule,
    TextFilterModule,
    themeQuartz,
} from 'ag-grid-community';
import { AgGridReact } from 'ag-grid-react';

import type { IProduct } from './data';
import { getData } from './data';

ModuleRegistry.registerModules([RowSelectionModule, TextFilterModule, NumberFilterModule, ClientSideRowModelModule]);

// Customise the theme with parameters
const myTheme = themeQuartz.withParams({
    backgroundColor: '#ffffff',
    foregroundColor: '#1a1a1a',
    headerBackgroundColor: '#faf8f5',
    spacing: 10,
    fontSize: 12,
    headerFontSize: 14,
});

const GridExample = () => {
    const [rowData] = useState<IProduct[]>(getData());

    const columnDefs = useMemo<ColDef<IProduct>[]>(
        () => [
            { field: 'productName', headerName: 'Product', minWidth: 180 },
            {
                field: 'salesRevenue',
                headerName: 'Revenue',
                valueFormatter: (params: ValueFormatterParams) =>
                    params.value != null ? `$${params.value.toLocaleString()}` : '',
            },
            {
                field: 'profitMargin',
                headerName: 'Margin',
                valueFormatter: (params: ValueFormatterParams) =>
                    params.value != null ? `${(params.value * 100).toFixed(0)}%` : '',
            },
            { field: 'status' },
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

    return (
        <div style={{ height: '100%' }}>
            <AgGridReact
                theme={myTheme}
                rowData={rowData}
                columnDefs={columnDefs}
                defaultColDef={defaultColDef}
                rowSelection={{ mode: 'multiRow' }}
            />
        </div>
    );
};

const root = createRoot(document.getElementById('root')!);
root.render(
    <StrictMode>
        <GridExample />
    </StrictMode>
);
