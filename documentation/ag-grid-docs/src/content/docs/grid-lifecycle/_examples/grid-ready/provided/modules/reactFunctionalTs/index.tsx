'use strict';

import React, { StrictMode, useCallback, useMemo, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';

import { ClientSideRowModelModule } from 'ag-grid-community';
import type { ColDef, GridReadyEvent } from 'ag-grid-community';
import { ModuleRegistry } from 'ag-grid-community';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-quartz.css';
import { AgGridReact } from 'ag-grid-react';

import { getData } from './data';
import './styles.css';

ModuleRegistry.registerModules([ClientSideRowModelModule]);

const pRandom = (() => {
    // From https://stackoverflow.com/a/3062783
    let seed = 123_456_789;
    const m = 2 ** 32;
    const a = 1_103_515_245;
    const c = 12_345;

    return () => {
        seed = (a * seed + c) % m;
        return seed / m;
    };
})();

const GridExample = () => {
    const gridRef = useRef<AgGridReact>(null);
    const [gridKey, setGridKey] = useState<string>(`grid-key-${pRandom()}`);
    const containerStyle = useMemo(() => ({ width: '100%', height: '100%' }), []);
    const gridStyle = useMemo(() => ({ height: '100%', width: '100%' }), []);
    const [rowData, setRowData] = useState<any[]>(getData());

    const [columnDefs, setColumnDefs] = useState<ColDef[]>([
        { field: 'name', headerName: 'Athlete', width: 250 },
        { field: 'person.country', headerName: 'Country' },
        { field: 'person.age', headerName: 'Age' },
        { field: 'medals.gold', headerName: 'Gold Medals' },
        { field: 'medals.silver', headerName: 'Silver Medals' },
        { field: 'medals.bronze', headerName: 'Bronze Medals' },
    ]);

    const onGridReady = useCallback((params: GridReadyEvent) => {
        const checkbox = document.querySelector<HTMLInputElement>('#pinFirstColumnOnLoad')!;
        const shouldPinFirstColumn = checkbox && checkbox.checked;
        if (shouldPinFirstColumn) {
            params.api.applyColumnState({
                state: [{ colId: 'name', pinned: 'left' }],
            });
        }
    }, []);

    const reloadGrid = useCallback(() => {
        // Trigger re-load by assigning a new key to the Grid React component
        setGridKey(`grid-key-${pRandom()}`);
    }, []);

    return (
        <div style={containerStyle}>
            <div className="test-container">
                <div className="test-header">
                    <div style={{ marginBottom: '1rem' }}>
                        <input type="checkbox" id="pinFirstColumnOnLoad" />
                        <label htmlFor="pinFirstColumnOnLoad">Pin first column on load</label>
                    </div>

                    <div style={{ marginBottom: '1rem' }}>
                        <button id="reloadGridButton" onClick={reloadGrid}>
                            Reload Grid
                        </button>
                    </div>
                </div>

                <div
                    style={gridStyle}
                    className={
                        /** DARK MODE START **/ document.documentElement?.dataset.defaultTheme ||
                        'ag-theme-quartz' /** DARK MODE END **/
                    }
                >
                    <AgGridReact
                        key={gridKey}
                        ref={gridRef}
                        rowData={rowData}
                        columnDefs={columnDefs}
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
