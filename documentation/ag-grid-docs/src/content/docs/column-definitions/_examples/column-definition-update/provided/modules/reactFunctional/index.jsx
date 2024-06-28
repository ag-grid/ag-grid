'use strict';

import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import { ModuleRegistry } from '@ag-grid-community/core';
import { AgGridReact } from '@ag-grid-community/react';
import '@ag-grid-community/styles/ag-grid.css';
import '@ag-grid-community/styles/ag-theme-quartz.css';
import React, { StrictMode, useCallback, useMemo, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';

import './styles.css';

ModuleRegistry.registerModules([ClientSideRowModelModule]);

const columnDefinitions = [{ field: 'athlete' }, { field: 'age' }, { field: 'country' }, { field: 'sport' }];

const updatedHeaderColumnDefs = [
    { field: 'athlete', headerName: 'C1' },
    { field: 'age', headerName: 'C2' },
    { field: 'country', headerName: 'C3' },
    { field: 'sport', headerName: 'C4' },
];

const GridExample = () => {
    const gridRef = useRef(null);
    const containerStyle = useMemo(() => ({ width: '100%', height: '100%' }), []);
    const gridStyle = useMemo(() => ({ height: '100%', width: '100%' }), []);
    const [rowData, setRowData] = useState();
    const [columnDefs, setColumnDefs] = useState(columnDefinitions);
    const autoSizeStrategy = useMemo(
        () => ({
            type: 'fitGridWidth',
        }),
        []
    );

    const onGridReady = useCallback(() => {
        fetch('https://www.ag-grid.com/example-assets/small-olympic-winners.json')
            .then((resp) => resp.json())
            .then((data) => setRowData(data));
    }, []);

    const onBtUpdateHeaders = useCallback(() => {
        setColumnDefs(updatedHeaderColumnDefs);
    }, []);

    const onBtRestoreHeaders = useCallback(() => {
        setColumnDefs(columnDefinitions);
    }, []);

    return (
        <div style={containerStyle}>
            <div className="test-container">
                <div className="test-header">
                    <button onClick={onBtUpdateHeaders}>Update Header Names</button>
                    <button onClick={onBtRestoreHeaders}>Restore Original Column Definitions</button>
                </div>
                <div style={gridStyle} className={'ag-theme-quartz-dark'}>
                    <AgGridReact
                        ref={gridRef}
                        rowData={rowData}
                        columnDefs={columnDefs}
                        autoSizeStrategy={autoSizeStrategy}
                        onGridReady={onGridReady}
                    />
                </div>
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
