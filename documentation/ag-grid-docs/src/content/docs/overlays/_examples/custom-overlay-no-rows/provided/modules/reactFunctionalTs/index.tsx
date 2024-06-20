'use strict';

import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import type { ColDef } from '@ag-grid-community/core';
import { ModuleRegistry } from '@ag-grid-community/core';
import { AgGridReact } from '@ag-grid-community/react';
import '@ag-grid-community/styles/ag-grid.css';
import '@ag-grid-community/styles/ag-theme-quartz.css';
import React, { StrictMode, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';

import CustomNoRowsOverlay from './customNoRowsOverlay';
import './styles.css';

interface IAthlete {
    athlete: string;
    country: string;
}

const columnDefs: ColDef[] = [
    { field: 'athlete', width: 150 },
    { field: 'country', width: 120 },
];

const defaultColDef = {
    editable: true,
    flex: 1,
    minWidth: 100,
    filter: true,
};

ModuleRegistry.registerModules([ClientSideRowModelModule]);

const GridExample = () => {
    const [rowData, setRowData] = useState<IAthlete[]>([]);

    const noRowsOverlayComponentParams = useMemo(() => {
        return {
            noRowsMessageFunc: () => 'No rows found at: ' + new Date().toLocaleTimeString(),
        };
    }, []);

    return (
        <div className="example-wrapper">
            <div>
                <button onClick={() => setRowData([])}>Clear rowData</button>
                <button onClick={() => setRowData([{ athlete: 'Michael Phelps', country: 'US' }])}>Set rowData</button>
            </div>

            <div
                style={{ height: '100%' }}
                className={
                    /** DARK MODE START **/ document.documentElement?.dataset.defaultTheme ||
                    'ag-theme-quartz' /** DARK MODE END **/
                }
            >
                <AgGridReact<IAthlete>
                    rowData={rowData}
                    columnDefs={columnDefs}
                    defaultColDef={defaultColDef}
                    noRowsOverlayComponent={CustomNoRowsOverlay}
                    noRowsOverlayComponentParams={noRowsOverlayComponentParams}
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
