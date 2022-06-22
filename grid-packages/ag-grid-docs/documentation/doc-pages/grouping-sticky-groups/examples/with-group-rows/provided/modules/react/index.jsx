'use strict';

import React, { Component } from 'react';
import { render } from 'react-dom';
import { AgGridReact } from '@ag-grid-community/react';
import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import { RowGroupingModule } from '@ag-grid-enterprise/row-grouping';
import '@ag-grid-community/styles/ag-grid.css';
import '@ag-grid-community/styles/ag-theme-alpine.css';

import { ModuleRegistry } from '@ag-grid-community/core';
// Register the required feature modules with the Grid
ModuleRegistry.registerModules([ClientSideRowModelModule, RowGroupingModule]);

class GridExample extends Component {
    constructor(props) {
        super(props);

        this.state = {
            columnDefs: [
                { field: 'country', rowGroup: true, hide: true },
                { field: 'year', rowGroup: true, hide: true },
                {
                    field: 'athlete',
                    minWidth: 250,
                    cellRenderer: (params) => {
                        return <span style={{ marginLeft: 60 }}>{params.value}</span>;
                    },
                },
                { field: 'sport', minWidth: 200 },
                { field: 'gold' },
                { field: 'silver' },
                { field: 'bronze' },
            ],
            defaultColDef: {
                flex: 1,
                minWidth: 100,
                sortable: true,
                resizable: true,
            },
            groupDisplayType: 'groupRows',
            rowData: null,
            groupRowsSticky: true
        };
    }

    onGridReady = (params) => {
        this.gridApi = params.api;
        this.gridColumnApi = params.columnApi;

        const updateData = (data) => {
            this.setState({ rowData: data });
        };

        fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
            .then((resp) => resp.json())
            .then((data) => updateData(data));
    };

    render() {
        return (
            <div style={{ width: '100%', height: '100%' }}>
                <div
                    style={{
                        height: '100%',
                        width: '100%',
                    }}
                    className="ag-theme-alpine"
                >
                    <AgGridReact
                        columnDefs={this.state.columnDefs}
                        defaultColDef={this.state.defaultColDef}
                        groupDisplayType={this.state.groupDisplayType}
                        groupRowsSticky={this.state.groupRowsSticky}
                        animateRows={true}
                        onGridReady={this.onGridReady}
                        rowData={this.state.rowData}
                    />
                </div>
            </div>
        );
    }
}

render(<GridExample></GridExample>, document.querySelector('#root'));
