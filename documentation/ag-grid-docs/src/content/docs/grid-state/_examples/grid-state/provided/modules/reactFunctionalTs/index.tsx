'use strict';

import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import {
    ColDef,
    GridPreDestroyedEvent,
    GridReadyEvent,
    GridState,
    ModuleRegistry,
    RowSelectionOptions,
    StateUpdatedEvent,
} from '@ag-grid-community/core';
import { AgGridReact } from '@ag-grid-community/react';
import '@ag-grid-community/styles/ag-grid.css';
import '@ag-grid-community/styles/ag-theme-quartz.css';
import { ColumnsToolPanelModule } from '@ag-grid-enterprise/column-tool-panel';
import { FiltersToolPanelModule } from '@ag-grid-enterprise/filter-tool-panel';
import { RangeSelectionModule } from '@ag-grid-enterprise/range-selection';
import { SetFilterModule } from '@ag-grid-enterprise/set-filter';
import React, { StrictMode, useCallback, useMemo, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';

import { IOlympicData } from './interfaces';
import './styles.css';

ModuleRegistry.registerModules([
    ClientSideRowModelModule,
    ColumnsToolPanelModule,
    FiltersToolPanelModule,
    SetFilterModule,
    RangeSelectionModule,
]);

const GridExample = () => {
    const gridRef = useRef<AgGridReact<IOlympicData>>(null);
    const containerStyle = useMemo(() => ({ width: '100%', height: '100%' }), []);
    const gridStyle = useMemo(() => ({ height: '100%', width: '100%' }), []);
    const [rowData, setRowData] = useState<IOlympicData[]>();
    const [columnDefs, setColumnDefs] = useState<ColDef[]>([
        { field: 'athlete', minWidth: 150 },
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
    const defaultColDef = useMemo<ColDef>(() => {
        return {
            flex: 1,
            minWidth: 100,
            filter: true,
            enableRowGroup: true,
            enablePivot: true,
            enableValue: true,
        };
    }, []);
    const rowSelection = useMemo<RowSelectionOptions>(
        () => ({
            mode: 'multiRow',
        }),
        []
    );
    const [initialState, setInitialState] = useState<GridState>();
    const [currentState, setCurrentState] = useState<GridState>();
    const [gridVisible, setGridVisible] = useState(true);

    const onGridReady = useCallback((params: GridReadyEvent<IOlympicData>) => {
        fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
            .then((resp) => resp.json())
            .then((data: IOlympicData[]) => setRowData(data));
    }, []);

    const reloadGrid = useCallback(() => {
        setGridVisible(false);
        setTimeout(() => {
            setRowData(undefined);
            setGridVisible(true);
        });
    }, []);

    const onGridPreDestroyed = useCallback((params: GridPreDestroyedEvent<IOlympicData>) => {
        const { state } = params;
        console.log('Grid state on destroy (can be persisted)', state);
        setInitialState(state);
    }, []);

    const onStateUpdated = useCallback((params: StateUpdatedEvent<IOlympicData>) => {
        console.log('State updated', params.state);
        setCurrentState(params.state);
    }, []);

    const printState = useCallback(() => {
        console.log('Grid state', currentState);
    }, [currentState]);

    return (
        <div style={containerStyle}>
            <div className="example-wrapper">
                <div>
                    <span className="button-group">
                        <button onClick={reloadGrid}>Recreate Grid with Current State</button>
                        <button onClick={printState}>Print State</button>
                    </span>
                </div>
                <div
                    style={gridStyle}
                    className={
                        /** DARK MODE START **/ document.documentElement?.dataset.defaultTheme ||
                        'ag-theme-quartz' /** DARK MODE END **/
                    }
                >
                    {gridVisible && (
                        <AgGridReact<IOlympicData>
                            ref={gridRef}
                            rowData={rowData}
                            columnDefs={columnDefs}
                            defaultColDef={defaultColDef}
                            sideBar={true}
                            pagination={true}
                            rowSelection={rowSelection}
                            suppressColumnMoveAnimation={true}
                            initialState={initialState}
                            onGridReady={onGridReady}
                            onGridPreDestroyed={onGridPreDestroyed}
                            onStateUpdated={onStateUpdated}
                        />
                    )}
                </div>
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
