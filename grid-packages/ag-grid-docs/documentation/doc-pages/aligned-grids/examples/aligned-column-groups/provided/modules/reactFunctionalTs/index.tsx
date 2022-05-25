import React, { useMemo, useRef, useState } from 'react';
import { render } from 'react-dom';
import { AgGridReact } from '@ag-grid-community/react';
import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';

import "@ag-grid-community/core/dist/styles/ag-grid.css";
import "@ag-grid-community/core/dist/styles/ag-theme-alpine.css";

import { ColDef, ColGroupDef, GridReadyEvent, ModuleRegistry } from '@ag-grid-community/core';
// Register the required feature modules with the Grid
ModuleRegistry.registerModules([ClientSideRowModelModule]);

const GridExample = () => {
    const topGridRef = useRef<AgGridReact>(null);
    const bottomGridRef = useRef<AgGridReact>(null);

    const defaultColDef = useMemo(() => ({
        editable: true,
        sortable: true,
        resizable: true,
        filter: true,
        flex: 1,
        minWidth: 100,
        width: 100,
    }), []);

    const columnDefs = useMemo<(ColDef | ColGroupDef)[]>(() => [
        {
            headerName: 'Group 1',
            headerClass: 'blue',
            groupId: 'Group1',
            children: [
                { field: 'athlete', pinned: true },
                { field: 'age', pinned: true, columnGroupShow: 'open' },
                { field: 'country' },
                { field: 'year', columnGroupShow: 'open' },
                { field: 'date' },
                { field: 'sport', columnGroupShow: 'open' },
                { field: 'date' },
                { field: 'sport', columnGroupShow: 'open' }
            ]
        },
        {
            headerName: 'Group 2',
            headerClass: 'green',
            groupId: 'Group2',
            children: [
                { field: 'athlete', pinned: true },
                { field: 'age', pinned: true, columnGroupShow: 'open' },
                { field: 'country' },
                { field: 'year', columnGroupShow: 'open' },
                { field: 'date' },
                { field: 'sport', columnGroupShow: 'open' },
                { field: 'date' },
                { field: 'sport', columnGroupShow: 'open' }
            ]
        }
    ], []);

    const [rowData, setRowData] = useState<any[]>([]);

    const onGridReady = (params: GridReadyEvent) => {
        fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
            .then(resp => resp.json())
            .then(data => {
                setRowData(data);
            });
    }

    return (
        <div className="container">
            <div className="grid ag-theme-alpine">
                <AgGridReact
                    ref={topGridRef}
                    rowData={rowData}
                    columnDefs={columnDefs}
                    defaultColDef={defaultColDef}
                    onGridReady={params => onGridReady(params)}
                    alignedGrids={bottomGridRef.current ? [bottomGridRef.current] : undefined}
                />
            </div>

            <div className="divider"></div>

            <div className="grid ag-theme-alpine">
                <AgGridReact
                    ref={bottomGridRef}
                    rowData={rowData}
                    columnDefs={columnDefs}
                    defaultColDef={defaultColDef}
                    alignedGrids={topGridRef.current ? [topGridRef.current] : undefined}
                />
            </div>
        </div>
    );
}


render(
    <GridExample></GridExample>,
    document.querySelector('#root')
)