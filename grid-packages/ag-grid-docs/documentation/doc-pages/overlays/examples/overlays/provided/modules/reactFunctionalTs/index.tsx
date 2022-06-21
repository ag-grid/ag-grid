'use strict';

import React, { useCallback, useMemo, useRef, useState } from 'react';
import { render } from 'react-dom';
import { AgGridReact } from '@ag-grid-community/react';
import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import '@ag-grid-community/styles/ag-grid.css';
import '@ag-grid-community/styles/ag-theme-alpine.css';

import { ColDef, GridReadyEvent, ModuleRegistry } from '@ag-grid-community/core';
// Register the required feature modules with the Grid
ModuleRegistry.registerModules([ClientSideRowModelModule]);

const GridExample = () => {
    const gridRef = useRef<AgGridReact>(null);
    const containerStyle = useMemo(() => ({ width: '100%', height: '100%' }), []);
    const gridStyle = useMemo(() => ({ height: '100%', width: '100%' }), []);
    const [rowData, setRowData] = useState();
    const [columnDefs, setColumnDefs] = useState<ColDef[]>([
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
    const defaultColDef = useMemo<ColDef>(() => {
        return {
            flex: 1,
            minWidth: 100,
            filter: true,
            sortable: true,
            resizable: true,
        }
    }, []);

    const onGridReady = useCallback((params: GridReadyEvent) => {

        fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
            .then(resp => resp.json())
            .then(data => setRowData(data));
    }, []);

    const onBtShowLoading = useCallback(() => {
        gridRef.current!.api.showLoadingOverlay();
    }, [])

    const onBtShowNoRows = useCallback(() => {
        gridRef.current!.api.showNoRowsOverlay();
    }, [])

    const onBtHide = useCallback(() => {
        gridRef.current!.api.hideOverlay();
    }, [])


    return (
        <div style={containerStyle}>
            <div className="example-wrapper">
                <div style={{ "marginBottom": "5px" }}>
                    <button onClick={onBtShowLoading}>Show Loading Overlay</button>
                    <button onClick={onBtShowNoRows}>Show No Rows Overlay</button>
                    <button onClick={onBtHide}>Hide Overlay</button>
                </div>

                <div style={gridStyle} className="ag-theme-alpine">
                    <AgGridReact
                        ref={gridRef}
                        rowData={rowData}
                        columnDefs={columnDefs}
                        defaultColDef={defaultColDef}
                        overlayLoadingTemplate={'<span class="ag-overlay-loading-center">Please wait while your rows are loading</span>'}
                        overlayNoRowsTemplate={'<span style="padding: 10px; border: 2px solid #444; background: lightgoldenrodyellow">This is a custom \'no rows\' overlay</span>'}
                        onGridReady={onGridReady}
                    >
                    </AgGridReact>
                </div>
            </div>
        </div>
    );

}

render(<GridExample></GridExample>, document.querySelector('#root'))
