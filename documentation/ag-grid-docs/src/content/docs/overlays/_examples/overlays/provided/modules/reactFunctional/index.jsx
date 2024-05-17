'use strict';

import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import { ModuleRegistry } from '@ag-grid-community/core';
import { AgGridReact } from '@ag-grid-community/react';
import '@ag-grid-community/styles/ag-grid.css';
import '@ag-grid-community/styles/ag-theme-quartz.css';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';

import './styles.css';

ModuleRegistry.registerModules([ClientSideRowModelModule]);

const GridExample = () => {
    const gridRef = useRef(null);
    const containerStyle = useMemo(() => ({ width: '100%', height: '100%' }), []);
    const gridStyle = useMemo(() => ({ height: '100%', width: '100%' }), []);
    const [rowData, setRowData] = useState();
    const [columnDefs, setColumnDefs] = useState([
        { field: 'athlete', minWidth: 200 },
        { field: 'age' },
        { field: 'country', minWidth: 200 },
        { field: 'year' },
        { field: 'date', minWidth: 180 },
        { field: 'sport', minWidth: 200 },
        { field: 'gold' },
        { field: 'silver' },
        { field: 'bronze' },
        { field: 'total' },
    ]);
    const defaultColDef = useMemo(() => {
        return {
            flex: 1,
            minWidth: 100,
            filter: true,
        };
    }, []);

    const onBtShowLoading = useCallback(() => {
        gridRef.current.api.showLoadingOverlay();
    }, []);

    const onBtShowNoRows = useCallback(() => {
        gridRef.current.api.showNoRowsOverlay();
    }, []);

    const onBtHide = useCallback(() => {
        gridRef.current.api.hideOverlay();
    }, []);

    return (
        <div style={containerStyle}>
            <div className="example-wrapper">
                <div style={{ marginBottom: '5px' }}>
                    <button onClick={onBtShowLoading}>Show Loading Overlay</button>
                    <button onClick={onBtShowNoRows}>Show No Rows Overlay</button>
                    <button onClick={onBtHide}>Hide Overlay</button>
                </div>

                <div
                    style={gridStyle}
                    className={
                        /** DARK MODE START **/ document.documentElement.dataset.defaultTheme ||
                        'ag-theme-quartz' /** DARK MODE END **/
                    }
                >
                    <AgGridReact
                        ref={gridRef}
                        rowData={rowData}
                        columnDefs={columnDefs}
                        defaultColDef={defaultColDef}
                    />
                </div>
            </div>
        </div>
    );
};

const root = createRoot(document.getElementById('root'));
root.render(<GridExample />);
