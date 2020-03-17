import React, {Component} from 'react';
import {AgGridReact} from '@ag-grid-community/react';
import {AllCommunityModules} from '@ag-grid-community/all-modules';

import "@ag-grid-community/all-modules/dist/styles/ag-grid.css";
import "@ag-grid-community/all-modules/dist/styles/ag-theme-alpine.css";

export default class extends Component {
    constructor(props) {
        super(props);

        this.athleteVisible = true;
        this.ageVisible = true;
        this.countryVisible = true;
        this.rowData = null;

        this.state = this.createState();
    }

    createState() {
        const topOptions = {
            alignedGrids: [],
            defaultColDef: {
                editable: true,
                sortable: true,
                resizable: true,
                filter: true,
                flex: 1,
                minWidth: 100
            }
        };
        const bottomOptions = {
            alignedGrids: [],
            defaultColDef: {
                editable: true,
                sortable: true,
                resizable: true,
                filter: true,
                flex: 1,
                minWidth: 100
            }
        };

        topOptions.alignedGrids.push(bottomOptions);
        bottomOptions.alignedGrids.push(topOptions);

        return {
            topOptions,
            bottomOptions,
            columnDefs: [
                {field: 'athlete', hide: !this.athleteVisible},
                {field: 'age', hide: !this.ageVisible},
                {field: 'country', hide: !this.countryVisible},
                {field: 'year'},
                {field: 'date'},
                {field: 'sport'},
                {
                    headerName: 'Medals',
                    children: [
                        {
                            columnGroupShow: 'closed', field: "total",
                            valueGetter: "data.gold + data.silver + data.bronze"
                        },
                        {columnGroupShow: 'open', field: "gold"},
                        {columnGroupShow: 'open', field: "silver"},
                        {columnGroupShow: 'open', field: "bronze"}
                    ]
                }
            ],
            rowData: this.rowData
        };
    }

    onGridReady(params) {
        this.topGrid = params;
        var httpRequest = new XMLHttpRequest();
        httpRequest.open('GET', 'https://raw.githubusercontent.com/ag-grid/ag-grid/master/grid-packages/ag-grid-docs/src/olympicWinnersSmall.json');
        httpRequest.send();
        httpRequest.onreadystatechange = function () {
            if (httpRequest.readyState === 4 && httpRequest.status === 200) {
                var httpResult = JSON.parse(httpRequest.responseText);
                this.rowData = httpResult;
                this.setState(this.createState.bind(this));
            }
        }.bind(this);
    }

    // Warning - mutating the state is not recommended from react, doing it for example purposes
    onCbAthlete(e) {
        this.athleteVisible = !this.athleteVisible;
        this.setState(this.createState.bind(this));
    }

    onCbAge(e) {
        this.ageVisible = !this.ageVisible;
        this.setState(this.createState.bind(this));
    }

    onCbCountry(e) {
        this.countryVisible = !this.countryVisible;
        this.setState(this.createState.bind(this));
    }

    render() {
        return (
            <div>
                <div className="test-header" style={{height: '5%'}}>
                    <label>
                        <input type="checkbox" onChange={this.onCbAthlete.bind(this)}
                               checked={!this.state.columnDefs[0].hide}/>Athlete
                    </label>
                    <label>
                        <input type="checkbox" onChange={this.onCbAge.bind(this)}
                               checked={!this.state.columnDefs[1].hide}/>Age
                    </label>
                    <label>
                        <input type="checkbox" onChange={this.onCbCountry.bind(this)}
                               checked={!this.state.columnDefs[2].hide}/>Country
                    </label>
                </div>

                <div style={{width: '100%', height: '45%'}} className="ag-theme-alpine">
                    <AgGridReact rowData={this.state.rowData} gridOptions={this.state.topOptions}
                                 columnDefs={this.state.columnDefs} onGridReady={this.onGridReady.bind(this)}
                                 modules={AllCommunityModules}/>
                </div>

                <div style={{width: '100%', height: '45%'}} className="ag-theme-alpine">
                    <AgGridReact rowData={this.state.rowData} gridOptions={this.state.bottomOptions}
                                 columnDefs={this.state.columnDefs} modules={AllCommunityModules}/>
                </div>
            </div>
        );
    }
}
