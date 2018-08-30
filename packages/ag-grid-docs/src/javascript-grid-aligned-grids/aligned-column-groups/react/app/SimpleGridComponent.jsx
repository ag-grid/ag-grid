import React, {Component} from 'react';
import {AgGridReact} from 'ag-grid-react';

export default class extends Component {
    constructor(props) {
        super(props);

        this.athleteVisible = true;
        this.ageVisible = true;
        this.countryVisible = true;
        this.rowData = null;

        this.state = this.createState();
    }

    createState = () => {
        const topOptions = {alignedGrids: []};
        const bottomOptions = {alignedGrids: []};

        topOptions.alignedGrids.push(bottomOptions);
        bottomOptions.alignedGrids.push(topOptions);

        return {
            topOptions,
            bottomOptions,
            columnDefs: [
                {
                    headerName: "<span style='background-color: lightblue'>Group 1</span>",
                    groupId: 'Group1',
                    children: [
                        {headerName: 'AAA', field: 'athlete', pinned: true, width: 100},
                        {headerName: 'BBB', field: 'age', pinned: true, columnGroupShow: 'open', width: 100},
                        {headerName: 'CCC', field: 'country', width: 100},
                        {headerName: 'DDD', field: 'year', columnGroupShow: 'open', width: 100},
                        {headerName: 'EEE', field: 'date', width: 100},
                        {headerName: 'FFF', field: 'sport', columnGroupShow: 'open', width: 100},
                        {headerName: 'GGG', field: 'date', width: 100},
                        {headerName: 'HHH', field: 'sport', columnGroupShow: 'open', width: 100}
                    ]
                },
                {
                    headerName: "<span style='background-color: lightgreen'>Group 2</span>",
                    groupId: 'Group2',
                    children: [
                        {headerName: 'AAA', field: 'athlete', pinned: true, width: 100},
                        {headerName: 'BBB', field: 'age', pinned: true, columnGroupShow: 'open', width: 100},
                        {headerName: 'CCC', field: 'country', width: 100},
                        {headerName: 'DDD', field: 'year', columnGroupShow: 'open', width: 100},
                        {headerName: 'EEE', field: 'date', width: 100},
                        {headerName: 'FFF', field: 'sport', columnGroupShow: 'open', width: 100},
                        {headerName: 'GGG', field: 'date', width: 100},
                        {headerName: 'HHH', field: 'sport', columnGroupShow: 'open', width: 100}
                    ]
                }
            ],
            rowData: this.rowData
        };
    };

    onGridReady = (params) => {
        this.topGrid = params;
        var httpRequest = new XMLHttpRequest();
        httpRequest.open('GET', 'https://raw.githubusercontent.com/ag-grid/ag-grid/master/packages/ag-grid-docs/src/olympicWinnersSmall.json');
        httpRequest.send();
        httpRequest.onreadystatechange = () => {
            if (httpRequest.readyState === 4 && httpRequest.status === 200) {
                this.rowData = JSON.parse(httpRequest.responseText);
                this.setState(this.createState());
                setTimeout(() => {
                    // mix up some columns
                    this.topGrid.columnApi.moveColumnByIndex(11, 4);
                    this.topGrid.columnApi.moveColumnByIndex(11, 4);
                }, 100);
            }
        }
    };

    onFirstDataRendered = (params) => {
        this.topGrid.api.sizeColumnsToFit();
    };

    render() {
        return (
            <div>
                <div style={{width: '100%', height: '45%'}} className="ag-theme-balham">
                    <AgGridReact rowData={this.state.rowData} gridOptions={this.state.topOptions}
                                 columnDefs={this.state.columnDefs}
                                 onGridReady={this.onGridReady.bind(this)}
                                 onFirstDataRendered={this.onFirstDataRendered.bind(this)}/>
                </div>

                <div style={{height: '5%'}}/>

                <div style={{width: '100%', height: '45%'}} className="ag-theme-balham">
                    <AgGridReact rowData={this.state.rowData} gridOptions={this.state.bottomOptions}
                                 columnDefs={this.state.columnDefs}/>
                </div>
            </div>
        );
    }
}
