import React, {Component} from 'react';
import {AgGridReact} from '@ag-grid-community/react';

import {AllCommunityModules} from "@ag-grid-community/all-modules";

import "@ag-grid-community/all-modules/dist/styles/ag-grid.css";
import "@ag-grid-community/all-modules/dist/styles/ag-theme-alpine.css";

export default class extends Component {
    constructor(props) {
        super(props);

        this.state = {
            columnDefs: this.createColumnDefs(),
            rowData: null,
            style: {
                width: '100%',
                height: '100%'
            },
            modules: AllCommunityModules
        };
    }

    onGridReady(params) {
        this.gridApi = params.api;

        var httpRequest = new XMLHttpRequest();
        httpRequest.open('GET', 'https://raw.githubusercontent.com/ag-grid/ag-grid/master/grid-packages/ag-grid-docs/src/olympicWinnersSmall.json');
        httpRequest.send();
        httpRequest.onreadystatechange = function() {
            if (httpRequest.readyState === 4 && httpRequest.status === 200) {
                var httpResult = JSON.parse(httpRequest.responseText);
                this.setState(function(previous) {
                    return Object.assign(previous, {rowData: httpResult});
                });
            }
        }.bind(this);
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
        this.gridApi.doLayout();
    }

    setWidthAndHeight(width, height) {
        this.setState(function(oldState) {
            return Object.assign(oldState, {
                style: {
                    width: width,
                    height: height
                }
            });
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
                <div style={{height: 'calc(100% - 25px)'}} className="ag-theme-alpine">
                    <div style={this.state.style}>
                        <AgGridReact
                            columnDefs={this.state.columnDefs}
                            rowData={this.state.rowData}
                            modules={this.state.modules}
                            onGridReady={this.onGridReady.bind(this)}
                        />
                    </div>
                </div>
            </div>
        );
    }
}
