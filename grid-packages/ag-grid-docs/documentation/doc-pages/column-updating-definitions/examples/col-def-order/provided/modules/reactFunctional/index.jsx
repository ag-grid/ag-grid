'use strict';

import React, { useState } from 'react';
import { render } from 'react-dom';
import { AgGridColumn, AgGridReact } from '@ag-grid-community/react';

import { AllCommunityModules } from "@ag-grid-community/all-modules";
import '@ag-grid-community/core/dist/styles/ag-grid.css';
import '@ag-grid-community/core/dist/styles/ag-theme-alpine.css';

const colsA = [
    { field: 'athlete' },
    { field: 'age' },
    { field: 'country' },
    { field: 'sport' },
    { field: 'year' },
    { field: 'date' },
    { field: 'gold' },
    { field: 'silver' },
    { field: 'bronze' },
    { field: 'total' }
];

const colsB = [
    { field: 'athlete', headerName: 'ATHLETE' },
    { field: 'age', headerName: 'AGE' },
    { field: 'country', headerName: 'COUNTRY' },
    { field: 'sport', headerName: 'SPORT' },
    { field: 'year', headerName: 'YEAR' },
    { field: 'date', headerName: 'DATE' },
    { field: 'gold', headerName: 'GOLD' },
    { field: 'silver', headerName: 'SILVER' },
    { field: 'bronze', headerName: 'BRONZE' },
    { field: 'total', headerName: 'TOTAL' }
];

const GridExample = () => {
    const [rowData, setRowData] = useState([]);
    const [columns, setColumns] = useState(colsA);

    const onGridReady = (params) => {
        const httpRequest = new XMLHttpRequest();
        httpRequest.open('GET', 'https://www.ag-grid.com/example-assets/olympic-winners.json');
        httpRequest.send();
        httpRequest.onreadystatechange = () => {
            if (httpRequest.readyState === 4 && httpRequest.status === 200) {
                setRowData(JSON.parse(httpRequest.responseText));
            }
        };
    };

    const onBtNormal = () => {
        setColumns(colsA);
    };

    const onBtUppercase = () => {
        setColumns(colsB);
    };

    const onBtClear = () => {
        setColumns([]);
    };

    return (
        <div style={{ width: '100%', height: '100%' }}>
            <div className="test-container">
                <div className="test-header">
                    <button onClick={onBtNormal}>Normal</button>
                    <button onClick={onBtUppercase}>Uppercase</button>
                    <button onClick={onBtClear}>Clear</button>
                    <div
                        style={{
                            height: '100%',
                            width: '100%'
                        }}
                        className="ag-theme-alpine test-grid">
                        <AgGridReact
                            modules={AllCommunityModules}
                            rowData={rowData}
                            onGridReady={onGridReady}
                            defaultColDef={{
                                initialWidth: 100,
                                sortable: true,
                                resizable: true
                            }}
                            maintainColumnOrder={true}>
                            {columns.map(column => (<AgGridColumn {...column} key={column.field} />))}
                        </AgGridReact>
                    </div>
                </div>
            </div>
        </div>
    );
};

render(
    <GridExample />,
    document.querySelector('#root')
);
