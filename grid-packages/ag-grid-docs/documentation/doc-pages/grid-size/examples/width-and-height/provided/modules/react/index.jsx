
'use strict';

import React, { Component } from 'react';
import { render } from 'react-dom';
import { AgGridReact } from '@ag-grid-community/react';
import '@ag-grid-community/styles/ag-grid.css';
import "@ag-grid-community/styles/ag-theme-alpine.css";
import { ModuleRegistry } from '@ag-grid-community/core';
import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';

// Register the required feature modules with the Grid
ModuleRegistry.registerModules([ClientSideRowModelModule])

class GridExample extends Component {
    constructor(props) {
        super(props);

        this.state = {
            columnDefs: this.createColumnDefs(),
            rowData: null,
            style: {
                width: '100%',
                height: '100%'
            },
        };
    }

    onGridReady(params) {
        this.gridApi = params.api;

        fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
            .then(resp => resp.json())
            .then(data => {
                this.setState({ rowData: data });
            });
    }

    createColumnDefs() {
        return [
            { field: "athlete", width: 150 },
            { field: "age", width: 90 },
            { field: "country", width: 150 },
            { field: "year", width: 90 },
            { field: "date", width: 150 },
            { field: "sport", width: 150 },
            { field: "gold", width: 100 },
            { field: "silver", width: 100 },
            { field: "bronze", width: 100 },
            { field: "total", width: 100 },
        ];
    }

    fillLarge() {
        this.setWidthAndHeight('100%', '100%');
    }

    fillMedium() {
        this.setWidthAndHeight('60%', '60%');
    }

    fillExact() {
        this.setWidthAndHeight('400px', '400px');
    }

    componentDidUpdate() {
    }

    setWidthAndHeight(width, height) {
        this.setState({
            style: {
                width: width,
                height: height
            }
        });
    }

    render() {
        return (
            <div style={{ height: '100%' }}>
                <div style={{ marginBottom: '5px' }}>
                    <button onClick={this.fillLarge.bind(this)}>Fill 100%</button>
                    <button onClick={this.fillMedium.bind(this)}>Fill 60%</button>
                    <button onClick={this.fillExact.bind(this)}>Exactly 400 x 400 pixels</button>
                </div>
                <div style={{ height: 'calc(100% - 25px)' }} className="ag-theme-alpine">
                    <div style={this.state.style}>
                        <AgGridReact
                            columnDefs={this.state.columnDefs}
                            rowData={this.state.rowData}
                            onGridReady={this.onGridReady.bind(this)}
                        />
                    </div>
                </div>
            </div>
        );
    }
}

render(
    <GridExample></GridExample>,
    document.querySelector('#root')
);
