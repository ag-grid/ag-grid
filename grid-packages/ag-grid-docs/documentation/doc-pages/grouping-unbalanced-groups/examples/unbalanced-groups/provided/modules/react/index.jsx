'use strict';

import React, { Component } from 'react';
import { render } from 'react-dom';
import { AgGridReact } from '@ag-grid-community/react';
import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import { RowGroupingModule } from '@ag-grid-enterprise/row-grouping';
import '@ag-grid-community/styles/ag-grid.css';
import "@ag-grid-community/styles/ag-theme-alpine.css";

import { ModuleRegistry } from '@ag-grid-community/core';
// Register the required feature modules with the Grid
ModuleRegistry.registerModules([ClientSideRowModelModule, RowGroupingModule]);

const COUNTRY_CODES = {
    Ireland: 'ie',
    'United Kingdom': 'gb',
    USA: 'us',
};

function numberParser(params) {
    return parseInt(params.newValue);
}

function countryCellRenderer(params) {
    if (params.value === undefined || params.value === null) {
        return null;
    } else {
        return (
            <React.Fragment>
                <img border="0" width="15" height="10" src={`https://flagcdn.com/h20/${COUNTRY_CODES[params.value]}.png`} />
                {params.value}
            </React.Fragment>)
    }
}

function stateCellRenderer(params) {
    if (params.value === undefined || params.value === null) {
        return null;
    } else {
        return (
            <React.Fragment>
                <img border="0" width="15" height="10" src="https://www.ag-grid.com/example-assets/gold-star.png" />
                {params.value}
            </React.Fragment>
        )
    }
}

function cityCellRenderer(params) {
    if (params.value === undefined || params.value === null) {
        return null;
    } else {
        return (
            <React.Fragment>
                <img border="0" height="10" src="https://www.ag-grid.com/example-assets/weather/sun.png" width="15" />
                {params.value}
            </React.Fragment>
        )
    }
}

class GridExample extends Component {
    constructor(props) {
        super(props);

        this.state = {
            columnDefs: [
                { field: 'city', type: 'dimension', cellRenderer: cityCellRenderer },
                {
                    field: 'country',
                    type: 'dimension',
                    cellRenderer: countryCellRenderer,
                    minWidth: 200,
                },
                {
                    field: 'state',
                    type: 'dimension',
                    cellRenderer: stateCellRenderer,
                    rowGroup: true,
                },
                { field: 'val1', type: 'numberValue' },
                { field: 'val2', type: 'numberValue' },
            ],
            defaultColDef: {
                flex: 1,
                minWidth: 150,
                resizable: true,
            },
            autoGroupColumnDef: {
                field: 'city',
                minWidth: 200,
            },
            columnTypes: {
                numberValue: {
                    enableValue: true,
                    aggFunc: 'sum',
                    editable: true,
                    valueParser: numberParser,
                },
                dimension: {
                    enableRowGroup: true,
                    enablePivot: true,
                },
            },
            rowData: getData(),
            groupDefaultExpanded: -1,
            rowGroupPanelShow: 'always'
        };


    }

    onGridReady = params => {
        this.gridApi = params.api;
        this.gridColumnApi = params.columnApi;

    }


    render() {
        return (
            <div style={{ width: '100%', height: '100%' }}>


                <div

                    style={{
                        height: '98%',
                        width: '100%'
                    }}
                    className="ag-theme-alpine">
                    <AgGridReact
                        columnDefs={this.state.columnDefs}
                        defaultColDef={this.state.defaultColDef}
                        autoGroupColumnDef={this.state.autoGroupColumnDef}
                        columnTypes={this.state.columnTypes}
                        rowData={this.state.rowData}
                        groupDefaultExpanded={this.state.groupDefaultExpanded}
                        rowGroupPanelShow={this.state.rowGroupPanelShow}
                        animateRows={true}
                        onGridReady={this.onGridReady}
                    />
                </div>
            </div>
        );
    }
}

render(
    <GridExample></GridExample>,
    document.querySelector('#root')
)
