'use client';

import React, { StrictMode, useState } from 'react';
import { createRoot } from 'react-dom/client';

import type { ColDef } from 'ag-grid-community';
import { ClientSideRowModelModule, enableDevValidations } from 'ag-grid-community';
import { AgGridProvider, AgGridReact } from 'ag-grid-react';

import './styles.css';

if (process.env.NODE_ENV !== 'production') {
    enableDevValidations();
}

const modules = [ClientSideRowModelModule];
const columnDefs: ColDef[] = [{ field: 'row' }, { field: 'name' }];
const defaultColDef: ColDef = { flex: 1 };
const rowData = Array.from({ length: 1000 }, (_, index) => ({ row: index + 1, name: `Item ${index + 1}` }));

const GridExample = () => {
    const [debounceVerticalScrollbar, setDebounceVerticalScrollbar] = useState(false);

    return (
        <AgGridProvider modules={modules}>
            <div className="example-wrapper">
                <div className="example-controls">
                    <label>
                        <input
                            type="checkbox"
                            checked={debounceVerticalScrollbar}
                            onChange={(event) => setDebounceVerticalScrollbar(event.target.checked)}
                        />
                        Debounce vertical scroll
                    </label>
                </div>
                <div id="myGrid">
                    {/* This initial-only option requires a new grid when toggled. */}
                    <AgGridReact
                        key={String(debounceVerticalScrollbar)}
                        columnDefs={columnDefs}
                        defaultColDef={defaultColDef}
                        rowData={rowData}
                        rowHeight={40}
                        debounceVerticalScrollbar={debounceVerticalScrollbar}
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
