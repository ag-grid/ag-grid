import React, { StrictMode, useMemo, useRef } from 'react';
import { createRoot } from 'react-dom/client';

import { ClientSideRowModelModule, RowSelectionModule, enableDevValidations } from 'ag-grid-community';
import type { ColDef, RowSelectionOptions } from 'ag-grid-community';
import { AgGridProvider, AgGridReact } from 'ag-grid-react';

import './styles.css';

// Enable extended validations only for development
if (process.env.NODE_ENV !== 'production') {
    enableDevValidations();
}

const modules = [RowSelectionModule, ClientSideRowModelModule];

const GridExample = () => {
    const grid = useRef<AgGridReact>(null);
    const defaultColDef = useMemo(
        () => ({
            flex: 1,
            minWidth: 100,
        }),
        []
    );

    const columnDefs = useMemo<ColDef[]>(
        () => [{ field: 'athlete' }, { field: 'sport' }, { field: 'year', maxWidth: 120 }],
        []
    );

    const rowSelection = useMemo<RowSelectionOptions>(
        () => ({
            mode: 'singleRow',
            hideDisabledCheckboxes: true,
            isRowSelectable: (node) => (node.data ? node.data.year < 2007 : false),
        }),
        []
    );

    const { data, loading } = useFetchJson<IOlympicData>('https://www.ag-grid.com/example-assets/olympic-winners.json');

    function toggleHideCheckbox() {
        grid.current?.api.setGridOption('rowSelection', {
            mode: 'singleRow',
            isRowSelectable: (node) => (node.data ? node.data.year < 2007 : false),
            hideDisabledCheckboxes: getCheckboxValue('#toggle-hide-checkbox'),
        });
    }

    return (
        <AgGridProvider modules={modules}>
            <div className="example-wrapper">
                <div className="example-header">
                    <label>
                        <span>Hide disabled checkboxes:</span>
                        <input id="toggle-hide-checkbox" type="checkbox" defaultChecked onChange={toggleHideCheckbox} />
                    </label>
                </div>
                <div id="myGrid" className="grid">
                    <AgGridReact
                        ref={grid}
                        rowData={data}
                        loading={loading}
                        defaultColDef={defaultColDef}
                        columnDefs={columnDefs}
                        rowSelection={rowSelection}
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

function getCheckboxValue(id: string): boolean {
    return document.querySelector<HTMLInputElement>(id)?.checked ?? false;
}
