import React, { StrictMode, useCallback, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';

import type { ColDef } from 'ag-grid-community';
import { ClientSideRowModelModule, CustomFilterModule, ModuleRegistry, ValidationModule } from 'ag-grid-community';
import { AgGridReact } from 'ag-grid-react';

import type { IOlympicData } from './interfaces';
import NumberFilterComponent from './numberFilterComponent';
import './styles.css';

ModuleRegistry.registerModules([CustomFilterModule, ClientSideRowModelModule, ValidationModule /* Development Only */]);

const GridExample = () => {
    const containerStyle = useMemo(() => ({ width: '100%', height: '100%' }), []);
    const gridStyle = useMemo(() => ({ height: '100%', width: '100%' }), []);

    const [columnDefs, setColumnDefs] = useState<ColDef[]>([
        { field: 'athlete', width: 150, filter: false },
        {
            field: 'gold',
            width: 100,
            filter: NumberFilterComponent,
            suppressHeaderMenuButton: true,
        },
        {
            field: 'silver',
            width: 100,
            filter: NumberFilterComponent,
            suppressHeaderMenuButton: true,
        },
        {
            field: 'bronze',
            width: 100,
            filter: NumberFilterComponent,
            suppressHeaderMenuButton: true,
        },
        {
            field: 'total',
            width: 100,
            filter: NumberFilterComponent,
            suppressHeaderMenuButton: true,
        },
    ]);
    const defaultColDef = useMemo<ColDef>(() => {
        return {
            flex: 1,
            minWidth: 100,
            filter: true,
            floatingFilter: true,
        };
    }, []);

    const { data, loading } = useFetchJson<IOlympicData>('https://www.ag-grid.com/example-assets/olympic-winners.json');

    return (
        <div style={containerStyle}>
            <div style={gridStyle}>
                <AgGridReact<IOlympicData>
                    rowData={data}
                    loading={loading}
                    columnDefs={columnDefs}
                    defaultColDef={defaultColDef}
                />
            </div>
        </div>
    );
};

const root = createRoot(document.getElementById('root')!);
root.render(
    <StrictMode>
        <GridExample />
    </StrictMode>
);
