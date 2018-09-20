import React, {Component} from 'react';
import {AgGridReact} from 'ag-grid-react';

export default class extends Component {
    constructor(props) {
        super(props);

        this.state = {
            columnDefs: this.createColumnDefs(),
            rowData: null,
            style: {
                width: '100%',
                height: '100%'
            }
        };
    }

    onGridReady(params) {
        this.gridApi = params.api;

        var httpRequest = new XMLHttpRequest();
        httpRequest.open('GET', 'https://raw.githubusercontent.com/ag-grid/ag-grid/master/packages/ag-grid-docs/src/olympicWinnersSmall.json');
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
            {headerName: 'Athlete', field: 'athlete', width: 150},
            {headerName: 'Age', field: 'age', width: 90},
            {headerName: 'Country', field: 'country', width: 120},
            {headerName: 'Year', field: 'year', width: 90},
            {headerName: 'Date', field: 'date', width: 110},
            {headerName: 'Sport', field: 'sport', width: 110},
            {headerName: 'Gold', field: 'gold', width: 100},
            {headerName: 'Silver', field: 'silver', width: 100},
            {headerName: 'Bronze', field: 'bronze', width: 100},
            {headerName: 'Total', field: 'total', width: 100}
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
            <div style={{height: '100%'}}>
                <div style={{boxSizing: 'border-box', paddingTop: '30px', height: '100%'}} className="ag-theme-balham">
                    <div style={this.state.style}>
                        <AgGridReact
                            columnDefs={this.state.columnDefs}
                            rowData={this.state.rowData}
                            onGridReady={this.onGridReady.bind(this)}
                        />
                    </div>
                </div>
                <div style={{position: 'absolute', top: 0, left: 0}}>
                    <button onClick={this.fillLarge.bind(this)}>Fill 100%</button>
                    <button onClick={this.fillMedium.bind(this)}>Fill 60%</button>
                    <button onClick={this.fillExact.bind(this)}>Exactly 400 x 400 pixels</button>
                </div>
            </div>
        );
    }
}
