'use client';

import React, { StrictMode, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';

import type { ColDef, GridOptions } from 'ag-grid-community';
import { ClientSideRowModelModule, enableDevValidations } from 'ag-grid-community';
import { AgGridProvider, AgGridReact } from 'ag-grid-react';

import './styles.css';

if (process.env.NODE_ENV !== 'production') {
    // Enable extended validations only for development
    enableDevValidations();
}

const modules = [ClientSideRowModelModule];
type ScrollGestureMode = NonNullable<GridOptions['scrollGestureMode']>;

const GridExample = () => {
    const [scrollGestureMode, setScrollGestureMode] = useState<ScrollGestureMode>('native');
    const [rowData] = useState(() =>
        Array.from({ length: 100 }, (_, row) =>
            Object.fromEntries(Array.from({ length: 10 }, (_, col) => [`c${col}`, `Row ${row + 1}, column ${col + 1}`]))
        )
    );
    const [columnDefs] = useState<ColDef[]>(() =>
        Array.from({ length: 10 }, (_, i) => ({ field: `c${i}`, headerName: `Column ${i + 1}` }))
    );
    const defaultColDef = useMemo<ColDef>(() => ({ width: 180 }), []);

    return (
        <AgGridProvider modules={modules}>
            <div className="example-wrapper">
                <div className="example-controls">
                    <div className="controls-row">
                        <label htmlFor="scrollGestureMode">Scroll gesture mode:</label>
                        <select
                            id="scrollGestureMode"
                            value={scrollGestureMode}
                            onChange={(event) => setScrollGestureMode(event.target.value as ScrollGestureMode)}
                        >
                            <option value="native">native</option>
                            <option value="axisLocked">axisLocked</option>
                        </select>
                    </div>
                </div>
                <div id="myGrid">
                    {/* Recreate the grid when this initial-only option changes. */}
                    <AgGridReact
                        key={scrollGestureMode}
                        scrollGestureMode={scrollGestureMode}
                        columnDefs={columnDefs}
                        defaultColDef={defaultColDef}
                        rowData={rowData}
                    />
                </div>
            </div>
        </AgGridProvider>
    );
};

const root = createRoot(document.getElementById('root')!);
root.render(
    <StrictMode>
        <GridExample />
    </StrictMode>
);
