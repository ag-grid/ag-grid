import React, { useState, useRef, useMemo } from 'react';
import { render } from 'react-dom';
import { AgGridReact } from '@ag-grid-community/react';
import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';

import "@ag-grid-community/styles/ag-grid.css";
import "@ag-grid-community/styles/ag-theme-alpine.css";

import { ModuleRegistry } from '@ag-grid-community/core';
// Register the required feature modules with the Grid
ModuleRegistry.registerModules([ClientSideRowModelModule]);


const GridExample = () => {
    const topGrid = useRef(null);
    const bottomGrid = useRef(null);

    const defaultColDef = useMemo(() => ({
        editable: true,
        sortable: true,
        resizable: true,
        filter: true,
        flex: 1,
        minWidth: 100
    }));

    const columnDefs = useMemo(() => [
        { field: 'athlete' },
        { field: 'age' },
        { field: 'country' },
        { field: 'year' },
        { field: 'date' },
        { field: 'sport' },
        {
            headerName: 'Medals',
            children: [
                {
                    columnGroupShow: 'closed', field: "total",
                    valueGetter: "data.gold + data.silver + data.bronze", width: 200
                },
                { columnGroupShow: 'open', field: "gold", width: 100 },
                { columnGroupShow: 'open', field: "silver", width: 100 },
                { columnGroupShow: 'open', field: "bronze", width: 100 }
            ]
        }
    ], []);

    const [rowData, setRowData] = useState();

    const onGridReady = (params) => {
        fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
            .then(resp => resp.json())
            .then(data => setRowData(data));
    }

    const onCbAthlete = (event) => {
        // we only need to update one grid, as the other is a slave
        if (topGrid.current) {
            topGrid.current.columnApi.setColumnVisible('athlete', event.target.checked);
        }
    }

    const onCbAge = (event) => {
        // we only need to update one grid, as the other is a slave
        if (topGrid.current){
            topGrid.current.columnApi.setColumnVisible('age', event.target.checked);
        }
    }

    const onCbCountry = (event) => {
        // we only need to update one grid, as the other is a slave
        if (topGrid.current) {
            topGrid.current.columnApi.setColumnVisible('country', event.target.checked);
        }
    }

    return (
        <div className="container">
            <div className="header">
                <label>
                    <input
                        type="checkbox"
                        defaultChecked
                        onChange={onCbAthlete} />Athlete
                </label>
                <label>
                    <input
                        type="checkbox"
                        defaultChecked
                        onChange={onCbAge} />Age
                </label>
                <label>
                    <input
                        type="checkbox"
                        defaultChecked
                        onChange={onCbCountry} />Country
                </label>
            </div>

            <div className="grid ag-theme-alpine">
                <AgGridReact
                    ref={topGrid}
                    alignedGrids={bottomGrid.current ? [bottomGrid.current] : undefined}
                    rowData={rowData}
                    defaultColDef={defaultColDef}
                    columnDefs={columnDefs}
                    onGridReady={onGridReady}
                />
            </div>

            <div className="grid ag-theme-alpine">
                <AgGridReact
                    ref={bottomGrid}
                    alignedGrids={topGrid.current ? [topGrid.current] : undefined}
                    rowData={rowData}
                    defaultColDef={defaultColDef}
                    columnDefs={columnDefs}
                />
            </div>
        </div>
    );
};

render(
    <GridExample></GridExample>,
    document.querySelector('#root')
)
