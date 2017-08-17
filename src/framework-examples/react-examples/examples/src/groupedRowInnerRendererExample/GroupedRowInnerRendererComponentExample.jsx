import React, {Component} from "react";

import {AgGridReact} from "ag-grid-react";
import MedalRenderer from "./MedalRenderer";

import "ag-grid-enterprise";

export default class GroupedRowInnerRendererComponentExample extends Component {
    constructor(props) {
        super(props);

        this.state = {
            gridOptions: {},

            rowData: this.createRowData(),
            columnDefs: this.createColumnDefs(),
        };

        this.onGridReady = this.onGridReady.bind(this);
    }

    onGridReady(params) {
        this.gridApi = params.api;
        this.columnApi = params.columnApi;

        this.gridApi.sizeColumnsToFit();
    }

    createColumnDefs() {
        return [
            {
                headerName: "Country",
                field: "country",
                width: 100,
                rowGroupIndex: 0
            },
            {
                headerName: "Name",
                field: "name",
                width: 100
            },
            {
                headerName: "Gold",
                field: "gold",
                width: 100,
                aggFunc: 'sum'
            },
            {
                headerName: "Silver",
                field: "silver",
                width: 100,
                aggFunc: 'sum'
            },
            {
                headerName: "Bronze",
                field: "bronze",
                width: 100,
                aggFunc: 'sum'
            },
        ];
    }

    createRowData() {
        return [
            {country: "United States", name: "Bob", gold: 1, silver: 0, bronze: 0},
            {country: "United States", name: "Jack", gold: 0, silver: 1, bronze: 1},
            {country: "United States", name: "Sue", gold: 1, silver: 0, bronze: 1},
            {country: "United Kingdom", name: "Mary", gold: 1, silver: 1, bronze: 0},
            {country: "United Kingdom", name: "Tess", gold: 0, silver: 1, bronze: 1},
            {country: "United Kingdom", name: "John", gold: 0, silver: 2, bronze: 1},
            {country: "Jamaica", name: "Bob", gold: 1, silver: 1, bronze: 0},
            {country: "Jamaica", name: "Jack", gold: 1, silver: 1, bronze: 0},
            {country: "Jamaica", name: "Mary", gold: 1, silver: 1, bronze: 0},
            {country: "South Africa", name: "Bob", gold: 1, silver: 0, bronze: 1},
            {country: "South Africa", name: "Jack", gold: 1, silver: 0, bronze: 1},
            {country: "South Africa", name: "Mary", gold: 1, silver: 0, bronze: 1},
            {country: "South Africa", name: "John", gold: 1, silver: 0, bronze: 1},
            {country: "New Zealand", name: "Bob", gold: 1, silver: 0, bronze: 0},
            {country: "New Zealand", name: "Jack", gold: 0, silver: 1, bronze: 1},
            {country: "New Zealand", name: "Sue", gold: 1, silver: 0, bronze: 1},
            {country: "Australia", name: "Mary", gold: 1, silver: 1, bronze: 0},
            {country: "Australia", name: "Tess", gold: 0, silver: 1, bronze: 1},
            {country: "Australia", name: "John", gold: 0, silver: 2, bronze: 1},
            {country: "Canada", name: "Bob", gold: 1, silver: 1, bronze: 0},
            {country: "Canada", name: "Jack", gold: 1, silver: 1, bronze: 0},
            {country: "Canada", name: "Mary", gold: 1, silver: 1, bronze: 0},
            {country: "Switzerland", name: "Bob", gold: 1, silver: 0, bronze: 1},
            {country: "Switzerland", name: "Jack", gold: 1, silver: 0, bronze: 1},
            {country: "Switzerland", name: "Mary", gold: 1, silver: 0, bronze: 1},
            {country: "Switzerland", name: "John", gold: 1, silver: 0, bronze: 1},
            {country: "Spain", name: "Bob", gold: 1, silver: 0, bronze: 0},
            {country: "Spain", name: "Jack", gold: 0, silver: 1, bronze: 1},
            {country: "Spain", name: "Sue", gold: 1, silver: 0, bronze: 1},
            {country: "Portugal", name: "Mary", gold: 1, silver: 1, bronze: 0},
            {country: "Portugal", name: "Tess", gold: 0, silver: 1, bronze: 1},
            {country: "Portugal", name: "John", gold: 0, silver: 2, bronze: 1},
            {country: "Zimbabwe", name: "Bob", gold: 1, silver: 1, bronze: 0},
            {country: "Zimbabwe", name: "Jack", gold: 1, silver: 1, bronze: 0},
            {country: "Zimbabwe", name: "Mary", gold: 1, silver: 1, bronze: 0},
            {country: "Brazil", name: "Bob", gold: 1, silver: 0, bronze: 1},
            {country: "Brazil", name: "Jack", gold: 1, silver: 0, bronze: 1},
            {country: "Brazil", name: "Mary", gold: 1, silver: 0, bronze: 1},
            {country: "Brazil", name: "John", gold: 1, silver: 0, bronze: 1}
        ];
    }

    render() {
        return (
            <div style={{height: 400, width: 945}}
                 className="ag-fresh">
                <h1>Group Row Renderer Example</h1>
                <AgGridReact
                    // properties
                    columnDefs={this.state.columnDefs}
                    rowData={this.state.rowData}

                    groupUseEntireRow
                    groupRowInnerRendererFramework={MedalRenderer}

                    // events
                    onGridReady={this.onGridReady}>
                </AgGridReact>
            </div>
        );
    }
};
