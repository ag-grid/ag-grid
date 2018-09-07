import React, {Component} from 'react';
import {AgGridReact} from 'ag-grid-react';

export default class extends Component {
    constructor(props) {
        super(props);

        this.athleteVisible = true;
        this.ageVisible = true;
        this.countryVisible = true;
        this.rowData = null;
        this.bottomData = [
            {
                athlete: 'Total',
                age: '15 - 61',
                country: 'Ireland',
                year: '2020',
                date: '26/11/1970',
                sport: 'Synchronised Riding',
                gold: 55,
                silver: 65,
                bronze: 12
            }
        ];

        this.state = this.createState();
    }

    createState() {
        const topOptions = {alignedGrids: []};
        const bottomOptions = {alignedGrids: []};

        topOptions.alignedGrids.push(bottomOptions);
        bottomOptions.alignedGrids.push(topOptions);

        return {
            topOptions,
            bottomOptions,
            columnDefs: [
                {headerName: 'Athlete', field: 'athlete', width: 200, hide: !this.athleteVisible},
                {headerName: 'Age', field: 'age', width: 150, hide: !this.ageVisible},
                {headerName: 'Country', field: 'country', width: 150, hide: !this.countryVisible},
                {headerName: 'Year', field: 'year', width: 120},
                {headerName: 'Date', field: 'date', width: 150},
                {headerName: 'Sport', field: 'sport', width: 150}
            ],
            bottomData: this.bottomData,
            rowData: this.rowData
        };
    }

    btSizeColsToFix() {
        this.topGrid.api.sizeColumnsToFit();
        console.log('btSizeColsToFix ');
    }

    onGridReady(params) {
        this.topGrid = params;
        var httpRequest = new XMLHttpRequest();
        httpRequest.open('GET', 'https://raw.githubusercontent.com/ag-grid/ag-grid/master/packages/ag-grid-docs/src/olympicWinnersSmall.json');
        httpRequest.send();
        httpRequest.onreadystatechange = function() {
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
                <div style={{paddingBottom: '2px'}}>
                    <button onClick={this.btSizeColsToFix.bind(this)}>Size Cols to Fit</button>
                </div>

                <div style={{width: '100%', height: '420px'}} className="ag-theme-balham">
                    <AgGridReact rowData={this.state.rowData} gridOptions={this.state.topOptions} columnDefs={this.state.columnDefs} onGridReady={this.onGridReady.bind(this)} />
                </div>

                <div style={{width: '100%', height: '40px'}} className="ag-theme-balham">
                    <AgGridReact
                        rowData={this.state.bottomData}
                        gridOptions={this.state.bottomOptions}
                        columnDefs={this.state.columnDefs}
                        headerHeight="0"
                        rowStyle={{fontWeight: 'bold'}}
                    />
                </div>
            </div>
        );
    }
}
