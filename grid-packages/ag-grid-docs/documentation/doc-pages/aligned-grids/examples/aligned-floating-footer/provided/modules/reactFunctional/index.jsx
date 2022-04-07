import React, { useState } from 'react';
import { render } from 'react-dom';
import { AgGridReact } from '@ag-grid-community/react';
import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';

import "@ag-grid-community/core/dist/styles/ag-grid.css";
import "@ag-grid-community/core/dist/styles/ag-theme-alpine.css";

import { ModuleRegistry } from '@ag-grid-community/core';
// Register the required feature modules with the Grid
ModuleRegistry.registerModules([ClientSideRowModelModule]);

const topOptions = {
    alignedGrids: [],
    defaultColDef: {
        editable: true,
        sortable: true,
        resizable: true,
        filter: true,
        flex: 1,
        minWidth: 100
    },
    suppressHorizontalScroll: true
};

const bottomOptions = {
    alignedGrids: [],
    defaultColDef: {
        editable: true,
        sortable: true,
        resizable: true,
        filter: true,
        flex: 1,
        minWidth: 100
    }
};

topOptions.alignedGrids.push(bottomOptions);
bottomOptions.alignedGrids.push(topOptions);

const columnDefs = [
    { field: 'athlete', width: 200 },
    { field: 'age', width: 150 },
    { field: 'country', width: 150 },
    { field: 'year', width: 120 },
    { field: 'date', width: 150 },
    { field: 'sport', width: 150 },
    // in the total col, we have a value getter, which usually means we don't need to provide a field
    // however the master/slave depends on the column id (which is derived from the field if provided) in
    // order ot match up the columns
    {
        headerName: 'Total',
        field: 'total',
        valueGetter: 'data.gold + data.silver + data.bronze',
        width: 200
    },
    { field: 'gold', width: 100 },
    { field: 'silver', width: 100 },
    { field: 'bronze', width: 100 }
];

const bottomData = [
    {
        athlete: 'Total',
        age: '15 - 61',
        country: 'Ireland',
        year: '2020',
        date: '26/11/1970',
        sport: 'Synchronised Riding',
        gold: 55,
        silver: 65,
        bronze: 12
    }
];

const GridExample = () => {
    const [rowData, setRowData] = useState(null);
    const [topGrid, setTopGrid] = useState(null);

    const onGridReady = (params) => {
        setTopGrid(params);
        fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
            .then(resp => resp.json())
            .then(data => setRowData(data));
    }

    const onFirstDataRendered = () => {
        topGrid.columnApi.autoSizeAllColumns();
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }} className="ag-theme-alpine">
            <div style={{ flex: '1 1 auto' }} >
                <AgGridReact rowData={rowData}
                    gridOptions={topOptions}
                    columnDefs={columnDefs}
                    onGridReady={onGridReady}
                    onFirstDataRendered={onFirstDataRendered} />
            </div>

            <div style={{ flex: 'none', height: '60px' }}>
                <AgGridReact
                    rowData={bottomData}
                    gridOptions={bottomOptions}
                    columnDefs={columnDefs}
                    headerHeight="0"
                    rowStyle={{ fontWeight: 'bold' }}
                />
            </div>
        </div>
    );
}

render(<GridExample></GridExample>, document.querySelector('#root'))
