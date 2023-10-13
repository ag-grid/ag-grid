
'use strict';

import React, { useCallback, useMemo, useRef, useState, StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { AgGridReact } from '@ag-grid-community/react';
import '@ag-grid-community/styles/ag-grid.css';
import '@ag-grid-community/styles/ag-theme-alpine.css';
import './styles.css';
import { IOlympicData } from './interfaces'
import { ColDef, GridReadyEvent, GridState, ModuleRegistry } from '@ag-grid-community/core';
import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import { ColumnsToolPanelModule } from '@ag-grid-enterprise/column-tool-panel';
import { FiltersToolPanelModule } from '@ag-grid-enterprise/filter-tool-panel';
import { SetFilterModule } from '@ag-grid-enterprise/set-filter';
import { RangeSelectionModule } from '@ag-grid-enterprise/range-selection';

// Register the required feature modules with the Grid
ModuleRegistry.registerModules([ClientSideRowModelModule, ColumnsToolPanelModule, FiltersToolPanelModule, SetFilterModule, RangeSelectionModule])

const GridExample = () => {
    const gridRef = useRef<AgGridReact<IOlympicData>>(null);
    const containerStyle = useMemo(() => ({ width: '100%', height: '100%' }), []);
    const gridStyle = useMemo(() => ({height: '100%', width: '100%'}), []);
    const [rowData, setRowData] = useState<IOlympicData[]>();
    const [columnDefs, setColumnDefs] = useState<ColDef[]>([
        {
            field: 'athlete',
            minWidth: 150,
            headerCheckboxSelection: true,
            checkboxSelection: true,
        },
        { field: 'age', maxWidth: 90 },
        { field: 'country', minWidth: 150 },
        { field: 'year', maxWidth: 90 },
        { field: 'date', minWidth: 150 },
        { field: 'sport', minWidth: 150 },
        { field: 'gold' },
        { field: 'silver' },
        { field: 'bronze' },
        { field: 'total' },
    ]);
    const defaultColDef = useMemo<ColDef>(() => { return {
        flex: 1,
        minWidth: 100,
        sortable: true,
        resizable: true,
        filter: true,
        enableRowGroup: true,
        enablePivot: true,
        enableValue: true,
    } }, []);
    const [initialState, setInitialState] = useState<GridState>();
    const [gridVisible, setGridVisible] = useState(true);

    const onGridReady = useCallback((params: GridReadyEvent) => {            
        fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
        .then(resp => resp.json())
        .then((data: IOlympicData[]) => setRowData(data));
    }, []);

    const reloadGrid = useCallback(() => {
        const state = gridRef.current!.api.getState();
        setGridVisible(false);
        setTimeout(() => {
            setInitialState(state);
            setRowData(undefined);
            setGridVisible(true);
        });
    }, []);

    const printState = useCallback(() => {
        console.log('Grid state', gridRef.current!.api.getState());
    }, []);

    return  (
        <div style={containerStyle}>
            <div className="example-wrapper">
                <div>
                    <span className="button-group">
                        <button onClick={reloadGrid}>Recreate Grid</button>
                        <button onClick={printState}>Print State</button>
                    </span>
                </div>
                <div  style={gridStyle} className="ag-theme-alpine">             
                    {gridVisible && <AgGridReact<IOlympicData>
                        ref={gridRef}
                        rowData={rowData}
                        columnDefs={columnDefs}
                        defaultColDef={defaultColDef}
                        enableRangeSelection={true}
                        sideBar={true}
                        pagination={true}
                        rowSelection={'multiple'}
                        suppressRowClickSelection={true}
                        suppressColumnMoveAnimation={true}
                        initialState={initialState}
                        onGridReady={onGridReady}
                    />}
                </div>
            </div>
        </div>
    );
}

const root = createRoot(document.getElementById('root')!);
root.render(<StrictMode><GridExample /></StrictMode>);
