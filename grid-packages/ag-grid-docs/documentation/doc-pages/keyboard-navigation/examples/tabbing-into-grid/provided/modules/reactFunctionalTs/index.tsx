'use strict';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { render } from 'react-dom';
import { AgGridReact } from '@ag-grid-community/react';
import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import "@ag-grid-community/styles/ag-grid.css";
import "@ag-grid-community/styles/ag-theme-alpine.css";

import { ColDef, ColumnApi, GridApi, GridReadyEvent, ModuleRegistry } from '@ag-grid-community/core';
// Register the required feature modules with the Grid
ModuleRegistry.registerModules([ClientSideRowModelModule]);

const GridExample = () => {
    const [gridApi, setGridApi] = useState<GridApi | null>(null);
    const [gridColumnApi, setGridColumnApi] = useState<ColumnApi | null>(null);
    const [rowData, setRowData] = useState<any[]>();
    const columnDefs = useMemo<ColDef[]>(() => [
        {
            headerName: "#",
            colId: "rowNum",
            valueGetter: "node.id"
        },
        {
            field: "athlete",
            minWidth: 170
        },
        { field: "age" },
        { field: "country" },
        { field: "year" },
        { field: "date" },
        { field: "sport" },
        { field: "gold" },
        { field: "silver" },
        { field: "bronze" },
        { field: "total" }
    ], []);
    const myInput = useRef<HTMLInputElement>(null);

    const onGridReady = (params: GridReadyEvent) => {
        setGridApi(params.api);
        setGridColumnApi(params.columnApi);

        const updateData = (data: any[]) => {
            setRowData(data);
        };

        fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
            .then(resp => resp.json())
            .then(data => updateData(data));
    };

    useEffect(() => {
        if (!myInput.current || !gridApi || !gridColumnApi) { return; }

        myInput.current?.addEventListener('keydown', function (event: KeyboardEvent) {
            if (event.key !== 'Tab') { return; }

            event.preventDefault();
            gridApi.ensureIndexVisible(0);

            const firstCol = gridColumnApi.getAllDisplayedColumns()[0];

            gridApi.ensureColumnVisible(firstCol);
            gridApi.setFocusedCell(0, firstCol);
        }, true);

    }, [myInput, gridApi, gridColumnApi]);

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
                <div id="myGrid" style={{ height: '100%', width: '100%' }} className="ag-theme-alpine">
                    <AgGridReact
                        rowData={rowData}
                        columnDefs={columnDefs}
                        defaultColDef={{
                            editable: true,
                            sortable: true,
                            flex: 1,
                            minWidth: 100,
                            filter: true,
                            resizable: true,
                        }}
                        onGridReady={onGridReady}
                    >
                    </AgGridReact>
                </div>
                <div className="form-container">
                    <label>Tab into the grid with Shift-Tab (Default Behavior)</label>
                    <input type="text" />
                </div>
            </div>
        </div>
    );
}

render(<GridExample></GridExample>, document.querySelector('#root'))
