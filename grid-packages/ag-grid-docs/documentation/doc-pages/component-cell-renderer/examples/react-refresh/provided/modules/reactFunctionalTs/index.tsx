'use strict';

import React, { useCallback, useMemo, useState, StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { AgGridReact } from '@ag-grid-community/react';
import '@ag-grid-community/styles/ag-grid.css';
import '@ag-grid-community/styles/ag-theme-alpine.css';
import { ModuleRegistry, ColDef } from '@ag-grid-community/core';
import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import { IOlympicData } from './interfaces'
import MedalCellRenderer from './medalCellRenderer';
import UpdateCellRenderer from './updateCellRenderer';

// Register the required feature modules with the Grid
ModuleRegistry.registerModules([ClientSideRowModelModule])

const GridExample = () => {
    const [columnDefs, setColumnDefs] = useState<ColDef[]>([
        { field: 'athlete' },
        { field: 'year' },
        { field: 'gold', cellRenderer: MedalCellRenderer },
        { field: 'silver', cellRenderer: MedalCellRenderer },
        { field: 'bronze', cellRenderer: MedalCellRenderer },
        { cellRenderer: UpdateCellRenderer },
    ]);
    const defaultColDef = useMemo<ColDef>(() => ({
        flex: 1,
        minWidth: 100,
        resizable: true,
    }), []);
    const [rowData, setRowData] = useState<IOlympicData[]>();

    const onGridReady = useCallback(() => {
        fetch('https://www.ag-grid.com/example-assets/small-olympic-winners.json')
            .then(resp => resp.json())
            .then(data => {
                setRowData(data);
            });
    }, []);

    return  (
        <div style={{ width: '100%', height: '100%' }}>
            <div style={{ height: '100%', width: '100%' }} className="ag-theme-alpine">
                <AgGridReact
                    columnDefs={columnDefs}
                    defaultColDef={defaultColDef}
                    rowData={rowData}
                    onGridReady={onGridReady}
                />
            </div>
        </div>
    );
}

const root = createRoot(document.getElementById('root') as HTMLElement);
root.render(<StrictMode><GridExample /></StrictMode>);
