import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import { ModuleRegistry } from '@ag-grid-community/core';
import { AgGridReact } from '@ag-grid-community/react';
import '@ag-grid-community/styles/ag-grid.css';
import '@ag-grid-community/styles/ag-theme-quartz.css';
import React, { StrictMode, useMemo, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';

import './styles.css';

ModuleRegistry.registerModules([ClientSideRowModelModule]);

const bottomData = [
    {
        athlete: 'Total',
        age: '15 - 61',
        country: 'Ireland',
        year: '2020',
        date: '26/11/1970',
        sport: 'Synchronised Riding',
        gold: 55,
        silver: 65,
        bronze: 12,
    },
];

const GridExample = () => {
    const [rowData, setRowData] = useState(null);

    const topGrid = useRef(null);
    const bottomGrid = useRef(null);

    const defaultColDef = useMemo(
        () => ({
            filter: true,
            flex: 1,
            minWidth: 100,
        }),
        []
    );

    const columnDefs = useMemo(
        () => [
            { field: 'athlete', width: 200 },
            { field: 'age', width: 150 },
            { field: 'country', width: 150 },
            { field: 'year', width: 120 },
            { field: 'date', width: 150 },
            { field: 'sport', width: 150 },
            {
                headerName: 'Total',
                colId: 'total',
                valueGetter: 'data.gold + data.silver + data.bronze',
                width: 200,
            },
            { field: 'gold', width: 100 },
            { field: 'silver', width: 100 },
            { field: 'bronze', width: 100 },
        ],
        []
    );

    const autoSizeStrategy = useMemo(
        () => ({
            type: 'fitCellContents',
        }),
        []
    );

    const onGridReady = (params) => {
        fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
            .then((resp) => resp.json())
            .then((data) => setRowData(data));
    };

    const baseClassName = 'example-container';
    const themeClassName =
        /** DARK MODE START **/ document.documentElement.dataset.defaultTheme ||
        'ag-theme-quartz'; /** DARK MODE END **/

    return (
        <div
            style={{ display: 'flex', flexDirection: 'column', height: '100%' }}
            className={`${baseClassName} ${themeClassName}`}
        >
            <div style={{ flex: '1 1 auto' }}>
                <AgGridReact
                    ref={topGrid}
                    alignedGrids={[bottomGrid]}
                    rowData={rowData}
                    defaultColDef={defaultColDef}
                    columnDefs={columnDefs}
                    onGridReady={onGridReady}
                    suppressHorizontalScroll
                    alwaysShowVerticalScroll
                    autoSizeStrategy={autoSizeStrategy}
                />
            </div>
            <div style={{ flex: 'none', height: '60px' }}>
                <AgGridReact
                    ref={bottomGrid}
                    alignedGrids={[topGrid]}
                    rowData={bottomData}
                    defaultColDef={defaultColDef}
                    columnDefs={columnDefs}
                    headerHeight="0"
                    alwaysShowVerticalScroll
                    rowStyle={{ fontWeight: 'bold' }}
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
