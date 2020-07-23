'use strict';

import React, {useState} from 'react';
import {render} from 'react-dom';
import {AgGridColumn, AgGridReact} from '@ag-grid-community/react';

import {AllModules} from "@ag-grid-enterprise/all-modules";
import '@ag-grid-community/all-modules/dist/styles/ag-grid.css';
import '@ag-grid-community/all-modules/dist/styles/ag-theme-alpine.css';

const GridExample = () => {
    const [rowData, setRowData] = useState([]);
    const [columns, setColumns] = useState([
        {field: 'athlete'},
        {field: 'age'},
        {field: 'country'},
        {field: 'sport'},
        {field: 'year'},
        {field: 'date'},
        {field: 'gold'},
        {field: 'silver'},
        {field: 'bronze'},
        {field: 'total'}
    ]);

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

    const onBtSortAthlete = () => {
        const defaultState = {sort: null};
        setColumns([
            {...defaultState, field: 'athlete', sort: 'asc' },
            {...defaultState, field: 'age'},
            {...defaultState, field: 'country'},
            {...defaultState, field: 'sport'},
            {...defaultState, field: 'year'},
            {...defaultState, field: 'date'},
            {...defaultState, field: 'gold'},
            {...defaultState, field: 'silver'},
            {...defaultState, field: 'bronze'},
            {...defaultState, field: 'total'}
        ]);
    };
    const onBtSortCountryThenSportClearOthers = () => {
        const defaultState = {sort: null};
        setColumns([
            {...defaultState, field: 'athlete'},
            {...defaultState, field: 'age'},
            {...defaultState, field: 'country', sort: 'asc', sortIndex: 0},
            {...defaultState, field: 'sport', sort: 'asc', sortIndex: 1},
            {...defaultState, field: 'year'},
            {...defaultState, field: 'date'},
            {...defaultState, field: 'gold'},
            {...defaultState, field: 'silver'},
            {...defaultState, field: 'bronze'},
            {...defaultState, field: 'total'}
        ]);
    };

    const onBtClearAllSorting = () => {
        // setColumnState({
        //     defaultState: {sort: null}
        // });
    };

    const onBtRowGroupCountryThenSport = () => {
        // setColumnState({
        //     state: [
        //         {colId: 'country', rowGroupIndex: 0},
        //         {colId: 'sport', rowGroupIndex: 1}
        //     ],
        //     defaultState: {rowGroup: false}
        // });
    };

    const onBtRemoveCountryRowGroup = () => {
        // setColumnState({
        //     state: [
        //         {colId: 'country', rowGroup: false}
        //     ]
        // });
    };

    const onBtClearAllRowGroups = () => {
        // setColumnState({
        //     defaultState: {rowGroup: false}
        // });
    };

    const onBtOrderColsMedalsFirst = () => {
        // setColumnState({
        //     state: [
        //         {colId: 'gold'},
        //         {colId: 'silver'},
        //         {colId: 'bronze'},
        //         {colId: 'total'},
        //         {colId: 'athlete'},
        //         {colId: 'age'},
        //         {colId: 'country'},
        //         {colId: 'sport'},
        //         {colId: 'year'},
        //         {colId: 'date'}
        //     ],
        //     applyOrder: true
        // });
    };

    const onBtOrderColsMedalsLast = () => {
        // setColumnState({
        //     state: [
        //         {colId: 'athlete'},
        //         {colId: 'age'},
        //         {colId: 'country'},
        //         {colId: 'sport'},
        //         {colId: 'year'},
        //         {colId: 'date'},
        //         {colId: 'gold'},
        //         {colId: 'silver'},
        //         {colId: 'bronze'},
        //         {colId: 'total'}
        //     ],
        //     applyOrder: true
        // });
    };

    const onBtHideMedals = () => {
        // setColumnState({
        //     state: [
        //         {colId: 'gold', hide: true},
        //         {colId: 'silver', hide: true},
        //         {colId: 'bronze', hide: true},
        //         {colId: 'total', hide: true}
        //     ]
        // });
    };

    const onBtShowMedals = () => {
        // setColumnState({
        //     state: [
        //         {colId: 'gold', hide: false},
        //         {colId: 'silver', hide: false},
        //         {colId: 'bronze', hide: false},
        //         {colId: 'total', hide: false}
        //     ]
        // });
    };

    return (
        <div style={{width: '100%', height: '100%'}}>
            <div className="test-container">
                <div className="test-header">
                    <table>
                        <tr>
                            <td>
                                Sort:
                            </td>
                            <td>
                                <button onClick={onBtSortAthlete}>Sort Athlete</button>
                                <button onClick={onBtSortCountryThenSportClearOthers}>Sort Athlete - Clear
                                    Others
                                </button>
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
                        pivotPanelShow="always">
                        {columns.map(column => (<AgGridColumn {...column} key={column.field}/>))}
                    </AgGridReact>
                </div>
            </div>
        </div>
    );
};

render(
    <GridExample/>,
    document.querySelector('#root')
);
