'use strict';

import React, { useState } from 'react';
import { render } from 'react-dom';
import { AgGridColumn, AgGridReact } from '@ag-grid-community/react';

import { AllModules } from "@ag-grid-enterprise/all-modules";
import "@ag-grid-community/core/dist/styles/ag-grid.css";
import "@ag-grid-community/core/dist/styles/ag-theme-alpine.css";

const GridExample = () => {
    const [rowData, setRowData] = useState([]);
    const [columns, setColumns] = useState([
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
    ]);

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

    const onBtSortAthlete = () => {
        const defaultState = { sort: null };
        setColumns([
            { ...defaultState, field: 'athlete', sort: 'asc' },
            { ...defaultState, field: 'age' },
            { ...defaultState, field: 'country' },
            { ...defaultState, field: 'sport' },
            { ...defaultState, field: 'year' },
            { ...defaultState, field: 'date' },
            { ...defaultState, field: 'gold' },
            { ...defaultState, field: 'silver' },
            { ...defaultState, field: 'bronze' },
            { ...defaultState, field: 'total' }
        ]);
    };
    const onBtSortCountryThenSportClearOthers = () => {
        const defaultState = { sort: null };
        setColumns([
            { ...defaultState, field: 'athlete' },
            { ...defaultState, field: 'age' },
            { ...defaultState, field: 'country', sort: 'asc', sortIndex: 0 },
            { ...defaultState, field: 'sport', sort: 'asc', sortIndex: 1 },
            { ...defaultState, field: 'year' },
            { ...defaultState, field: 'date' },
            { ...defaultState, field: 'gold' },
            { ...defaultState, field: 'silver' },
            { ...defaultState, field: 'bronze' },
            { ...defaultState, field: 'total' }
        ]);
    };

    const onBtClearAllSorting = () => {
        const defaultState = { sort: null };
        setColumns([
            { ...defaultState, field: 'athlete' },
            { ...defaultState, field: 'age' },
            { ...defaultState, field: 'country' },
            { ...defaultState, field: 'sport' },
            { ...defaultState, field: 'year' },
            { ...defaultState, field: 'date' },
            { ...defaultState, field: 'gold' },
            { ...defaultState, field: 'silver' },
            { ...defaultState, field: 'bronze' },
            { ...defaultState, field: 'total' }
        ]);
    };

    const onBtRowGroupCountryThenSport = () => {
        const defaultState = { rowGroup: false };
        setColumns([
            { ...defaultState, field: 'athlete' },
            { ...defaultState, field: 'age' },
            { ...defaultState, field: 'country', rowGroup: true, rowGroupIndex: 0 },
            { ...defaultState, field: 'sport', rowGroup: true, rowGroupIndex: 1 },
            { ...defaultState, field: 'year' },
            { ...defaultState, field: 'date' },
            { ...defaultState, field: 'gold' },
            { ...defaultState, field: 'silver' },
            { ...defaultState, field: 'bronze' },
            { ...defaultState, field: 'total' }
        ]);
    };

    const onBtRemoveCountryRowGroup = () => {
        const defaultState = {};
        setColumns([
            { ...defaultState, field: 'athlete' },
            { ...defaultState, field: 'age' },
            { ...defaultState, field: 'country', rowGroup: false },
            { ...defaultState, field: 'sport' },
            { ...defaultState, field: 'year' },
            { ...defaultState, field: 'date' },
            { ...defaultState, field: 'gold' },
            { ...defaultState, field: 'silver' },
            { ...defaultState, field: 'bronze' },
            { ...defaultState, field: 'total' }
        ]);
    };

    const onBtClearAllRowGroups = () => {
        const defaultState = { rowGroup: false };
        setColumns([
            { ...defaultState, field: 'athlete' },
            { ...defaultState, field: 'age' },
            { ...defaultState, field: 'country', rowGroup: false },
            { ...defaultState, field: 'sport' },
            { ...defaultState, field: 'year' },
            { ...defaultState, field: 'date' },
            { ...defaultState, field: 'gold' },
            { ...defaultState, field: 'silver' },
            { ...defaultState, field: 'bronze' },
            { ...defaultState, field: 'total' }
        ]);
    };

    const onBtOrderColsMedalsFirst = () => {
        setColumns([
            { field: 'gold' },
            { field: 'silver' },
            { field: 'bronze' },
            { field: 'total' },
            { field: 'athlete' },
            { field: 'age' },
            { field: 'country' },
            { field: 'sport' },
            { field: 'year' },
            { field: 'date' }
        ]);
    };

    const onBtOrderColsMedalsLast = () => {
        setColumns([
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
        ]);
    };

    const onBtHideMedals = () => {
        const newColumns = [...columns];
        const medals = ['gold', 'silver', 'bronze', 'total'];
        newColumns.forEach(column => {
            if (medals.includes(column.field)) {
                column.hide = true;
            }
        });
        setColumns(newColumns);
    };

    const onBtShowMedals = () => {
        const newColumns = [...columns];
        const medals = ['gold', 'silver', 'bronze', 'total'];
        newColumns.forEach(column => {
            if (medals.includes(column.field)) {
                column.hide = false;
            }
        });
        setColumns(newColumns);
    };

    return (
        <div style={{ width: '100%', height: '100%' }}>
            <div className="test-container">
                <div className="test-header">
                    <table>
                        <tr>
                            <td>
                                Sort:
                            </td>
                            <td>
                                <button onClick={onBtSortAthlete}>Sort Athlete</button>
                                <button onClick={onBtSortCountryThenSportClearOthers}>Sort Country, then Sport - Clear Others</button>
                                <button onClick={onBtClearAllSorting}>Clear All Sorting</button>
                            </td>
                        </tr>
                        <tr>
                            <td>
                                Column Order:
                            </td>
                            <td>
                                <button onClick={onBtOrderColsMedalsFirst}>Show Medals First</button>
                                <button onClick={onBtOrderColsMedalsLast}>Show Medals Last</button>
                            </td>
                        </tr>
                        <tr>
                            <td>
                                Column Visibility:
                            </td>
                            <td>
                                <button onClick={onBtHideMedals}>Hide Medals</button>
                                <button onClick={onBtShowMedals}>Show Medals</button>
                            </td>
                        </tr>
                        <tr>
                            <td>
                                Row Group:
                            </td>
                            <td>
                                <button onClick={onBtRowGroupCountryThenSport}>Group Country then Sport</button>
                                <button onClick={onBtRemoveCountryRowGroup}>Remove Country</button>
                                <button onClick={onBtClearAllRowGroups}>Clear All Groups</button>
                            </td>
                        </tr>
                    </table>
                </div>
                <div
                    style={{
                        height: '100%',
                        width: '100%'
                    }}
                    className="ag-theme-alpine test-grid">
                    <AgGridReact
                        modules={AllModules}
                        rowData={rowData}
                        onGridReady={onGridReady}
                        defaultColDef={{
                            sortable: true,
                            resizable: true,
                            width: 150,
                            enableRowGroup: true,
                            enablePivot: true,
                            enableValue: true
                        }}
                        sideBar={{
                            toolPanels: ['columns']
                        }}
                        rowGroupPanelShow="always"
                        pivotPanelShow="always"
                        applyColumnDefOrder={true}>
                        {columns.map(column => (<AgGridColumn {...column} key={column.field} />))}
                    </AgGridReact>
                </div>
            </div>
        </div>
    );
};

render(
    <GridExample />,
    document.querySelector('#root')
);
