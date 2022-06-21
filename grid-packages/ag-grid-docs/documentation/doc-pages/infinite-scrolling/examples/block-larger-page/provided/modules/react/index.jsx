'use strict';

import React, { Component } from 'react';
import { render } from 'react-dom';
import { AgGridReact } from '@ag-grid-community/react';
import { InfiniteRowModelModule } from '@ag-grid-community/infinite-row-model';
import { SetFilterModule } from '@ag-grid-enterprise/set-filter';
import { MenuModule } from '@ag-grid-enterprise/menu';
import { ColumnsToolPanelModule } from '@ag-grid-enterprise/column-tool-panel';
import '@ag-grid-community/styles/ag-grid.css';
import "@ag-grid-community/styles/ag-theme-alpine.css";

import { ModuleRegistry } from '@ag-grid-community/core';
// Register the required feature modules with the Grid
ModuleRegistry.registerModules([InfiniteRowModelModule, SetFilterModule, MenuModule, ColumnsToolPanelModule]);

class GridExample extends Component {
    constructor(props) {
        super(props);

        this.state = {
            columnDefs: [
                // this row just shows the row index, doesn't use any data from the row
                {
                    headerName: 'ID',
                    maxWidth: 100,
                    valueGetter: 'node.id',
                    cellRenderer: props => {
                        if (props.value !== undefined) {
                            return props.value;
                        } else {
                            return <img src="https://www.ag-grid.com/example-assets/loading.gif" />;
                        }
                    },
                    // we don't want to sort by the row index, this doesn't make sense as the point
                    // of the row index is to know the row index in what came back from the server
                    sortable: false,
                    suppressMenu: true,
                },
                { headerName: 'Athlete', field: 'athlete', suppressMenu: true },
                {
                    field: 'age',
                    filter: 'agNumberColumnFilter',
                    filterParams: {
                        filterOptions: ['equals', 'lessThan', 'greaterThan'],
                    },
                },
                {
                    field: 'country',
                    filter: 'agSetColumnFilter',
                    filterParams: filterParams,
                },
                {
                    field: 'year',
                    filter: 'agSetColumnFilter',
                    filterParams: { values: ['2000', '2004', '2008', '2012'] },
                },
                { field: 'date' },
                { field: 'sport', suppressMenu: true },
                { field: 'gold', suppressMenu: true },
                { field: 'silver', suppressMenu: true },
                { field: 'bronze', suppressMenu: true },
                { field: 'total', suppressMenu: true },
            ],
            defaultColDef: {
                flex: 1,
                minWidth: 150,
                sortable: true,
                resizable: true,
                floatingFilter: true,
            },
            rowSelection: 'multiple',
            rowModelType: 'infinite',
            cacheBlockSize: 100,
            cacheOverflowSize: 2,
            maxConcurrentDatasourceRequests: 2,
            infiniteInitialRowCount: 1,
            maxBlocksInCache: 2,
            getRowId: (params) => {
                return params.data.id;
            }
        };


    }

    onGridReady = params => {
        this.gridApi = params.api;
        this.gridColumnApi = params.columnApi;

        const updateData = (data) => {
            data.forEach(function (d, index) {
                d.id = 'R' + (index + 1);
            });
            const dataSource = {
                rowCount: undefined,
                getRows: (params) => {
                    console.log('asking for ' + params.startRow + ' to ' + params.endRow);
                    // At this point in your code, you would call the server.
                    // To make the demo look real, wait for 500ms before returning
                    setTimeout(function () {
                        // take a slice of the total rows
                        const dataAfterSortingAndFiltering = sortAndFilter(data, params.sortModel, params.filterModel);
                        const rowsThisPage = dataAfterSortingAndFiltering.slice(params.startRow, params.endRow);
                        // if on or after the last page, work out the last row.
                        let lastRow = -1;
                        if (dataAfterSortingAndFiltering.length <= params.endRow) {
                            lastRow = dataAfterSortingAndFiltering.length;
                        }
                        // call the success callback
                        params.successCallback(rowsThisPage, lastRow);
                    }, 500);
                },
            };
            params.api.setDatasource(dataSource);
        };

        fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
            .then(resp => resp.json())
            .then(data => updateData(data));
    }


    render() {
        return (
            <div style={{ width: '100%', height: '100%' }}>
                <div

                    style={{
                        height: '100%',
                        width: '100%'
                    }}
                    className="ag-theme-alpine">
                    <AgGridReact
                        columnDefs={this.state.columnDefs}
                        defaultColDef={this.state.defaultColDef}
                        rowSelection={this.state.rowSelection}
                        rowModelType={this.state.rowModelType}
                        cacheBlockSize={this.state.cacheBlockSize}
                        cacheOverflowSize={this.state.cacheOverflowSize}
                        maxConcurrentDatasourceRequests={this.state.maxConcurrentDatasourceRequests}
                        infiniteInitialRowCount={this.state.infiniteInitialRowCount}
                        maxBlocksInCache={this.state.maxBlocksInCache}
                        pagination={true}
                        paginationAutoPageSize={true}
                        getRowId={this.state.getRowId}
                        onGridReady={this.onGridReady}
                    />
                </div>

            </div>
        );
    }
}

const filterParams = { values: countries() };

function sortAndFilter(allOfTheData, sortModel, filterModel) {
    return sortData(sortModel, filterData(filterModel, allOfTheData));
}

function sortData(sortModel, data) {
    const sortPresent = sortModel && sortModel.length > 0;
    if (!sortPresent) {
        return data;
    }
    // do an in memory sort of the data, across all the fields
    const resultOfSort = data.slice();
    resultOfSort.sort(function (a, b) {
        for (let k = 0; k < sortModel.length; k++) {
            const sortColModel = sortModel[k];
            const valueA = a[sortColModel.colId];
            const valueB = b[sortColModel.colId];
            // this filter didn't find a difference, move onto the next one
            if (valueA == valueB) {
                continue;
            }
            const sortDirection = sortColModel.sort === 'asc' ? 1 : -1;
            if (valueA > valueB) {
                return sortDirection;
            } else {
                return sortDirection * -1;
            }
        }
        // no filters found a difference
        return 0;
    });
    return resultOfSort;
}

function filterData(filterModel, data) {
    const filterPresent = filterModel && Object.keys(filterModel).length > 0;
    if (!filterPresent) {
        return data;
    }
    const resultOfFilter = [];
    for (let i = 0; i < data.length; i++) {
        const item = data[i];
        if (filterModel.age) {
            const age = item.age;
            const allowedAge = parseInt(filterModel.age.filter);
            // EQUALS = 1;
            // LESS_THAN = 2;
            // GREATER_THAN = 3;
            if (filterModel.age.type == 'equals') {
                if (age !== allowedAge) {
                    continue;
                }
            } else if (filterModel.age.type == 'lessThan') {
                if (age >= allowedAge) {
                    continue;
                }
            } else {
                if (age <= allowedAge) {
                    continue;
                }
            }
        }
        if (filterModel.year) {
            if (filterModel.year.values.indexOf(item.year.toString()) < 0) {
                // year didn't match, so skip this record
                continue;
            }
        }
        if (filterModel.country) {
            if (filterModel.country.values.indexOf(item.country) < 0) {
                continue;
            }
        }
        resultOfFilter.push(item);
    }
    return resultOfFilter;
}

render(
    <GridExample></GridExample>,
    document.querySelector('#root')
)
