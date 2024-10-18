'use strict';

import React, { StrictMode, useCallback, useMemo, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';

import { ClientSideRowModelModule } from 'ag-grid-community';
import type { ColDef, SizeColumnsToFitGridStrategy } from 'ag-grid-community';
import { ModuleRegistry } from 'ag-grid-community';
import { AgGridReact } from 'ag-grid-react';

import type { IOlympicData } from './interfaces';
import './styles.css';

ModuleRegistry.registerModules([ClientSideRowModelModule]);

const columnDefinitions: ColDef[] = [{ field: 'athlete' }, { field: 'age' }, { field: 'country' }, { field: 'sport' }];

const updatedHeaderColumnDefs: ColDef[] = [
    { field: 'athlete', headerName: 'C1' },
    { field: 'age', headerName: 'C2' },
    { field: 'country', headerName: 'C3' },
    { field: 'sport', headerName: 'C4' },
];

const GridExample = () => {
    const gridRef = useRef<AgGridReact<IOlympicData>>(null);
    const containerStyle = useMemo(() => ({ width: '100%', height: '100%' }), []);
    const gridStyle = useMemo(() => ({ height: '100%', width: '100%' }), []);
    const [rowData, setRowData] = useState<IOlympicData[]>();
    const [columnDefs, setColumnDefs] = useState<ColDef[]>(columnDefinitions);
    const autoSizeStrategy = useMemo<SizeColumnsToFitGridStrategy>(
        () => ({
            type: 'fitGridWidth',
        }),
        []
    );

    const onGridReady = useCallback(() => {
        fetch('https://www.ag-grid.com/example-assets/small-olympic-winners.json')
            .then((resp) => resp.json())
            .then((data: IOlympicData[]) => setRowData(data));
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
                <div style={gridStyle}>
                    <AgGridReact<IOlympicData>
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

const root = createRoot(document.getElementById('root')!);
root.render(
    <StrictMode>
        <GridExample />
    </StrictMode>
);
