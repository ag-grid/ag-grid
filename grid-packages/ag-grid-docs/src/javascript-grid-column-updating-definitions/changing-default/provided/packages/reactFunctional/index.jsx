'use strict';

import React, {useEffect, useState} from 'react';
import {render} from 'react-dom';
import {AgGridColumn, AgGridReact} from 'ag-grid-react';

import 'ag-grid-enterprise';
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-alpine.css';

const columnsWithDefaults = [
    {field: 'athlete', initialWidth: 100, initialSort: 'asc'},
    {field: 'age'},
    {field: 'country', initialPinned: 'left'},
    {field: 'sport'},
    {field: 'year'},
    {field: 'date'},
    {field: 'gold'},
    {field: 'silver'},
    {field: 'bronze'},
    {field: 'total'}
];

const GridExample = () => {
    const [rowData, setRowData] = useState([]);
    const [columns, setColumns] = useState(columnsWithDefaults);

    const onGridReady = (params) => {
        const httpRequest = new XMLHttpRequest();
        httpRequest.open('GET', 'https://raw.githubusercontent.com/ag-grid/ag-grid/master/grid-packages/ag-grid-docs/src/olympicWinnersSmall.json');
        httpRequest.send();
        httpRequest.onreadystatechange = () => {
            if (httpRequest.readyState === 4 && httpRequest.status === 200) {
                setRowData(JSON.parse(httpRequest.responseText));
            }
        };
    };

    const onBtWithDefault = () => {
        setColumns(columnsWithDefaults);
    }

    const onBtRemove = () => {
        setColumns([]);
    }

    return (
        <div style={{width: '100%', height: '100%'}}>
            <div className="test-container">
                <div className="test-header">
                    <button onClick={onBtWithDefault}>Set Definitions with Defaults</button>
                    <button onClick={onBtRemove}>Remove Columns</button>
                    <div
                        style={{
                            height: '100%',
                            width: '100%'
                        }}
                        className="ag-theme-alpine test-grid">
                        <AgGridReact
                            rowData={rowData}
                            onGridReady={onGridReady}
                            defaultColDef={{
                                initialWidth: 100,
                                sortable: true,
                                resizable: true
                            }}>
                            {columns.map(column => (<AgGridColumn {...column} key={column.field}/>))}
                        </AgGridReact>
                    </div>
                </div>
            </div>
        </div>
    );
};

render(
    <GridExample/>,
    document.querySelector('#root')
);
