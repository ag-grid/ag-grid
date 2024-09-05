import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import { ModuleRegistry } from '@ag-grid-community/core';
import { AgGridReact } from '@ag-grid-community/react';
import '@ag-grid-community/styles/ag-grid.css';
import '@ag-grid-community/styles/ag-theme-quartz.css';
import React, { StrictMode, useCallback, useMemo, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';

import './styles.css';

ModuleRegistry.registerModules([ClientSideRowModelModule]);

const GridExample = () => {
    const grid = useRef(null);
    const defaultColDef = useMemo(() => ({
        flex: 1,
        minWidth: 100,
    }));

    const columnDefs = useMemo(() => [{ field: 'athlete' }, { field: 'sport' }, { field: 'year', maxWidth: 120 }], []);

    const selection = useMemo(
        () => ({
            mode: 'singleRow',
            headerCheckbox: false,
        }),
        []
    );
    const [rowData, setRowData] = useState();

    const onFirstDataRendered = useCallback((params) => {
        const nodesToSelect = [];
        params.api.forEachNode((node) => {
            if (node.rowIndex === 3) {
                nodesToSelect.push(node);
            }
        });
        params.api.setNodesSelected({ nodes: nodesToSelect, newValue: true });
    });

    const onGridReady = (params) => {
        fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
            .then((resp) => resp.json())
            .then((data) => setRowData(data));
    };

    function toggleCheckbox() {
        grid.current.api.setGridOption('selection', {
            mode: 'singleRow',
            headerCheckbox: false,
            isRowSelectable: (params) => params.data.year >= 2002 && params.data.year <= 2010,
            checkboxes: getCheckboxValue('#toggle-checkbox'),
        });
    }

    return (
        <div className="example-wrapper">
            <div className="example-header">
                <label>
                    <span>Enable checkboxes:</span>
                    <input id="toggle-checkbox" type="checkbox" defaultChecked onChange={toggleCheckbox} />
                </label>
            </div>
            <div
                id="myGrid"
                className={
                    'grid ' +
                    /** DARK MODE START **/ (document.documentElement.dataset.defaultTheme ||
                        'ag-theme-quartz') /** DARK MODE END **/
                }
            >
                <AgGridReact
                    ref={grid}
                    rowData={rowData}
                    defaultColDef={defaultColDef}
                    columnDefs={columnDefs}
                    selection={selection}
                    onFirstDataRendered={onFirstDataRendered}
                    onGridReady={onGridReady}
                />
            </div>
        </div>
    );
};

const root = createRoot(document.getElementById('root'));
root.render(
    <StrictMode>
        <GridExample />
    </StrictMode>
);

function getCheckboxValue(id) {
    return document.querySelector(id)?.checked ?? false;
}
