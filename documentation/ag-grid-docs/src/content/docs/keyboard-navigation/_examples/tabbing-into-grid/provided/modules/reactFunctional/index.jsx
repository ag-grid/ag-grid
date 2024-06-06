'use strict';

import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import { ModuleRegistry } from '@ag-grid-community/core';
import { AgGridReact } from '@ag-grid-community/react';
import '@ag-grid-community/styles/ag-grid.css';
import '@ag-grid-community/styles/ag-theme-quartz.css';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';

import './styles.css';

ModuleRegistry.registerModules([ClientSideRowModelModule]);

const GridExample = () => {
    const [gridApi, setGridApi] = useState(null);
    const [rowData, setRowData] = useState(null);
    const columnDefs = useMemo(
        () => [
            {
                headerName: '#',
                colId: 'rowNum',
                valueGetter: 'node.id',
            },
            {
                field: 'athlete',
                minWidth: 170,
            },
            { field: 'age' },
            { field: 'country' },
            { field: 'year' },
            { field: 'date' },
            { field: 'sport' },
            { field: 'gold' },
            { field: 'silver' },
            { field: 'bronze' },
            { field: 'total' },
        ],
        []
    );
    const myInput = useRef(null);

    const onGridReady = (params) => {
        setGridApi(params.api);

        const updateData = (data) => {
            setRowData(data);
        };

        fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
            .then((resp) => resp.json())
            .then((data) => updateData(data));
    };

    useEffect(() => {
        if (!myInput.current || !gridApi || !gridApi) {
            return;
        }

        myInput.current.addEventListener(
            'keydown',
            function (event) {
                if (event.key !== 'Tab') {
                    return;
                }

                event.preventDefault();
                gridApi.ensureIndexVisible(0);

                const firstCol = gridApi.getAllDisplayedColumns()[0];

                gridApi.ensureColumnVisible(firstCol);
                gridApi.setFocusedCell(0, firstCol);
            },
            true
        );
    }, [myInput, gridApi, gridApi]);

    const defaultColDef = useMemo(
        () => ({
            editable: true,
            flex: 1,
            minWidth: 100,
            filter: true,
        }),
        []
    );

    return (
        <div style={{ width: '100%', height: '100%' }}>
            <div className="test-container">
                <div>
                    <div className="form-container">
                        <label>Tab into Grid (Focus the First Cell)</label>
                        <input ref={myInput} />
                    </div>
                    <div className="form-container">
                        <label>Tab into the Grid (Default Behavior)</label>
                        <input type="text" />
                    </div>
                </div>
                <div
                    id="myGrid"
                    style={{ height: '100%', width: '100%' }}
                    className={
                        /** DARK MODE START **/ document.documentElement.dataset.defaultTheme ||
                        'ag-theme-quartz' /** DARK MODE END **/
                    }
                >
                    <AgGridReact
                        rowData={rowData}
                        columnDefs={columnDefs}
                        defaultColDef={defaultColDef}
                        onGridReady={onGridReady}
                    />
                </div>
                <div className="form-container">
                    <label>Tab into the grid with Shift-Tab (Default Behavior)</label>
                    <input type="text" />
                </div>
            </div>
        </div>
    );
};

const root = createRoot(document.getElementById('root'));
root.render(<GridExample />);
