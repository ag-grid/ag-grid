'use strict';

import React, { useState } from 'react';
import { render } from 'react-dom';
import { AgGridColumn, AgGridReact } from '@ag-grid-community/react';

import { AllCommunityModules } from "@ag-grid-community/all-modules";
import '@ag-grid-community/core/dist/styles/ag-grid.css';
import '@ag-grid-community/core/dist/styles/ag-theme-alpine.css';

const colDefsMedalsIncluded = [
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

const colDefsMedalsExcluded = [
    { field: 'athlete' },
    { field: 'age' },
    { field: 'country' },
    { field: 'sport' },
    { field: 'year' },
    { field: 'date' }
];

const GridExample = () => {
    const [rowData, setRowData] = useState([]);
    const [columns, setColumns] = useState(colDefsMedalsIncluded);

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

    const onBtExcludeMedalColumns = () => {
        setColumns(colDefsMedalsExcluded);
    };

    const onBtIncludeMedalColumns = () => {
        setColumns(colDefsMedalsIncluded);
    };

    return (
        <div style={{ width: '100%', height: '100%' }}>
            <div className="test-container">
                <div className="test-header">
                    <button onClick={onBtExcludeMedalColumns}>Exclude Medal Columns</button>
                    <button onClick={onBtIncludeMedalColumns}>Include Medal Columns</button>
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
                            }}>
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
