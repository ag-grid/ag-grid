'use strict';

import React, {useEffect, useState} from 'react';
import {render} from 'react-dom';
import {AgGridColumn, AgGridReact} from 'ag-grid-react';

import 'ag-grid-enterprise';
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-alpine.css';

const athleteColumn = {
    headerName: 'Athlete',
    valueGetter: function(params) { return params.data.athlete; }
};

const colDefsMedalsIncluded = [
    athleteColumn,
    {colId: 'myAgeCol', headerName: 'Age', valueGetter: function(params) { return params.data.age; }},
    {headerName: 'Country', headerClass: 'country-header', valueGetter: function(params) { return params.data.country; }},
    {field: 'sport'},
    {field: 'year'},
    {field: 'date'},
    {field: 'gold'},
    {field: 'silver'},
    {field: 'bronze'},
    {field: 'total'}
];

const colDefsMedalsExcluded = [
    athleteColumn,
    {colId: 'myAgeCol', headerName: 'Age', valueGetter: function(params) { return params.data.age; }},
    {headerName: 'Country', headerClass: 'country-header', valueGetter: function(params) { return params.data.country; }},
    {field: 'sport'},
    {field: 'year'},
    {field: 'date'}
];

const GridExample = () => {
    const [rowData, setRowData] = useState([]);
    const [columns, setColumns] = useState(colDefsMedalsIncluded);

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

    const onBtIncludeMedalColumns = () => {
        setColumns(colDefsMedalsIncluded);
    }

    const onBtExcludeMedalColumns = () => {
        setColumns(colDefsMedalsExcluded);
    }

    return (
        <div style={{width: '100%', height: '100%'}}>
            <div className="test-container">
                <div className="test-header">
                    <button onClick={onBtIncludeMedalColumns}>Include Medal Columns</button>
                    <button onClick={onBtExcludeMedalColumns}>Exclude Medal Columns</button>
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
