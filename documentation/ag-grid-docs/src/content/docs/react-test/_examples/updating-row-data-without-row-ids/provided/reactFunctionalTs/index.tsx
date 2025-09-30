'use client';

import React, { StrictMode, useCallback, useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';

import {
    ClientSideRowModelModule,
    type ColDef,
    type GridReadyEvent,
    ModuleRegistry,
    ValidationModule,
} from 'ag-grid-community';
import { AgGridReact } from 'ag-grid-react';

ModuleRegistry.registerModules([
    ClientSideRowModelModule,
    ...(process.env.NODE_ENV !== 'production' ? [ValidationModule] : []),
]);

let startTime: any = undefined;
let endTime: any = undefined;
let timerRef: number | undefined = undefined;
const GridExample = () => {
    const containerStyle = useMemo(() => ({ width: '100%', height: '100%' }), []);
    const gridStyle = useMemo(() => ({ height: '80%', width: '100%' }), []);
    const [rowData, setRowData] = useState<any[]>();
    const [count, setCount] = useState<number>(1);
    const [gridApi, setGridApi] = useState<any>();
    const [renderingMode, setRenderingMode] = useState<'legacy' | 'default'>('default');
    const [useGetRowId, setUseGetRowId] = useState<boolean>(false);

    const setupTimer = (gridApi: any) => {
        // Clear any existing timer first
        if (timerRef !== undefined) {
            clearInterval(timerRef);
        }

        setGridApi(gridApi);
        let c = 0;
        timerRef = window.setInterval(() => {
            setCount(c++);
        }, 0);
    };
    useEffect(() => {
        if (gridApi && rowData) {
            if (!startTime) {
                startTime = new Date();
            }
            if (count % 500 == 0) {
                endTime = new Date();
                console.log('To 1000', endTime - startTime);
                startTime = undefined;
            }
            let rd = [...rowData];
            rd[0] = { ...rd[0], athlete: count + '' };
            setRowData(rd);
        }
    }, [count]);
    const [columnDefs, setColumnDefs] = useState<ColDef[]>([
        {
            field: 'athlete',
        },
        {
            field: 'country',
        },
        {
            field: 'sport',
        },
    ]);

    const onGridReady = useCallback((params: GridReadyEvent) => {
        setupTimer(params.api);
        fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
            .then((resp) => resp.json())
            .then(
                (data: IOlympicData[]) => setRowData(data.map((it, i) => ({ ...it, id: i }))) //.slice(0,1))
            );
    }, []);

    const toggleRenderingMode = () => {
        // Clear the existing timer when switching modes
        if (timerRef !== undefined) {
            clearInterval(timerRef);
            timerRef = undefined;
        }

        // Reset timing variables
        startTime = undefined;
        endTime = undefined;

        // Reset state
        setCount(1);
        setGridApi(undefined);
        setRowData(undefined);

        setRenderingMode((prevMode) => (prevMode === 'legacy' ? 'default' : 'legacy'));
    };

    const toggleGetRowId = () => {
        // Clear the existing timer when switching getRowId
        if (timerRef !== undefined) {
            clearInterval(timerRef);
            timerRef = undefined;
        }

        // Reset timing variables
        startTime = undefined;
        endTime = undefined;

        // Reset state
        setCount(1);
        setGridApi(undefined);
        setRowData(undefined);

        setUseGetRowId((prevValue) => !prevValue);
    };

    return (
        <div style={containerStyle}>
            <div style={{ marginBottom: '10px' }}>
                <button onClick={toggleRenderingMode}>
                    Switch to {renderingMode === 'legacy' ? 'Default' : 'Legacy'} Mode
                </button>
                <button onClick={toggleGetRowId} style={{ marginLeft: '10px' }}>
                    {useGetRowId ? 'Remove' : 'Add'} getRowId
                </button>
            </div>
            <div style={{ marginBottom: '10px', fontSize: '14px', color: '#666' }}>
                <div>
                    Current Rendering Mode: <strong>{renderingMode}</strong>
                </div>
                <div>
                    Current getRowId: <strong>{useGetRowId ? 'Enabled' : 'Disabled'}</strong>
                </div>
            </div>
            <div style={gridStyle}>
                <AgGridReact<IOlympicData>
                    key={`${renderingMode}-${useGetRowId}`}
                    rowData={rowData}
                    columnDefs={columnDefs}
                    onGridReady={onGridReady}
                    suppressScrollOnNewData
                    renderingMode={renderingMode}
                    getRowId={useGetRowId ? (params) => String(params.data.id) : undefined}
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
