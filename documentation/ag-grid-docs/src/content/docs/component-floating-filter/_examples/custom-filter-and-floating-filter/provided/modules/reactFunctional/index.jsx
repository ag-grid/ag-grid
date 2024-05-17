'use strict';

import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import { ModuleRegistry } from '@ag-grid-community/core';
import { AgGridReact } from '@ag-grid-community/react';
import '@ag-grid-community/styles/ag-grid.css';
import '@ag-grid-community/styles/ag-theme-quartz.css';
import React, { StrictMode, useCallback, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';

import NumberFilterComponent from './numberFilterComponent.jsx';
import NumberFloatingFilterComponent from './numberFloatingFilterComponent.jsx';
import './styles.css';

ModuleRegistry.registerModules([ClientSideRowModelModule]);

const GridExample = () => {
    const containerStyle = useMemo(() => ({ width: '100%', height: '100%' }), []);
    const gridStyle = useMemo(() => ({ height: '100%', width: '100%' }), []);
    const [rowData, setRowData] = useState();
    const [columnDefs, setColumnDefs] = useState([
        { field: 'athlete', filter: 'agTextColumnFilter' },
        {
            field: 'gold',
            floatingFilterComponent: NumberFloatingFilterComponent,
            filter: NumberFilterComponent,
            suppressFloatingFilterButton: true,
        },
        {
            field: 'silver',
            floatingFilterComponent: NumberFloatingFilterComponent,
            filter: NumberFilterComponent,
            suppressFloatingFilterButton: true,
        },
        {
            field: 'bronze',
            floatingFilterComponent: NumberFloatingFilterComponent,
            filter: NumberFilterComponent,
            suppressFloatingFilterButton: true,
        },
        {
            field: 'total',
            floatingFilterComponent: NumberFloatingFilterComponent,
            filter: NumberFilterComponent,
            suppressFloatingFilterButton: true,
        },
    ]);
    const defaultColDef = useMemo(() => {
        return {
            flex: 1,
            minWidth: 100,
            filter: true,
            floatingFilter: true,
        };
    }, []);

    const onGridReady = useCallback((params) => {
        fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
            .then((resp) => resp.json())
            .then((data) => {
                setRowData(data);
            });
    }, []);

    return (
        <div style={containerStyle}>
            <div
                style={gridStyle}
                className={
                    /** DARK MODE START **/ document.documentElement.dataset.defaultTheme ||
                    'ag-theme-quartz' /** DARK MODE END **/
                }
            >
                <AgGridReact
                    rowData={rowData}
                    columnDefs={columnDefs}
                    defaultColDef={defaultColDef}
                    reactiveCustomComponents
                    onGridReady={onGridReady}
                />
            </div>
        </div>
    );
};

const root = createRoot(document.getElementById('root'));
root.render(
    <StrictMode>
        <GridExample />
    </StrictMode>
);
