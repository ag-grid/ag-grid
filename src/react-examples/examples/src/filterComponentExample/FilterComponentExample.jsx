import React, {Component} from "react";

import {AgGridReact} from "ag-grid-react";

import "ag-grid-enterprise";

import PartialMatchFilter from "./PartialMatchFilter";

export default class FilterComponentExample extends Component {
    constructor(props) {
        super(props);

        this.state = {
            gridOptions: {},

            rowData: this.createRowData(),
            columnDefs: this.createColumnDefs(),
        };

        this.onGridReady = this.onGridReady.bind(this);
        this.onClicked = this.onClicked.bind(this);
    }

    onGridReady(params) {
        this.gridApi = params.api;
        this.columnApi = params.columnApi;

        this.gridApi.sizeColumnsToFit();
    }

    onClicked() {
        this.gridApi.getFilterInstance("name").getFrameworkComponentInstance().componentMethod("Hello World!");
    }

    createColumnDefs() {
        return [
            {headerName: "Row", field: "row", width: 400},
            {
                headerName: "Filter Component",
                field: "name",
                filterFramework: PartialMatchFilter,
                width: 400,
                menuTabs:['filterMenuTab']
            }
        ];
    }

    createRowData() {
        return [
            {"row": "Row 1", "name": "Michael Phelps"},
            {"row": "Row 2", "name": "Natalie Coughlin"},
            {"row": "Row 3", "name": "Aleksey Nemov"},
            {"row": "Row 4", "name": "Alicia Coutts"},
            {"row": "Row 5", "name": "Missy Franklin"},
            {"row": "Row 6", "name": "Ryan Lochte"},
            {"row": "Row 7", "name": "Allison Schmitt"},
            {"row": "Row 8", "name": "Natalie Coughlin"},
            {"row": "Row 9", "name": "Ian Thorpe"},
            {"row": "Row 10", "name": "Bob Mill"},
            {"row": "Row 11", "name": "Willy Walsh"},
            {"row": "Row 12", "name": "Sarah McCoy"},
            {"row": "Row 13", "name": "Jane Jack"},
            {"row": "Row 14", "name": "Tina Wills"}
        ];
    }

    render() {
        return (
            <div style={{height: 400, width: 945}}
                 className="ag-fresh">
                <h1>Filter Component Example</h1>
                <button style={{marginBottom: 10}} onClick={this.onClicked}>Filter Instance Method</button>
                <AgGridReact
                    // properties
                    columnDefs={this.state.columnDefs}
                    rowData={this.state.rowData}

                    enableFilter

                    // events
                    onGridReady={this.onGridReady}>
                </AgGridReact>
            </div>
        );
    }
};
