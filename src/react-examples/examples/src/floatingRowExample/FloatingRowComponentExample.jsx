import React, {Component} from "react";

import {AgGridReact} from "ag-grid-react";
import StyledRenderer from "./StyledRenderer";

export default class FloatingRowComponentExample extends Component {
    constructor(props) {
        super(props);

        this.state = {
            gridOptions: {},

            rowData: this.createRowData(),
            columnDefs: this.createColumnDefs(),

            topFloatingRowData: [{row: "Top Row", number: "Top Number"}],
            bottomFloatingRowData: [{row: "Bottom Row", number: "Bottom Number"}]
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
                headerName: "Row",
                field: "row",
                width: 400,
                floatingCellRendererFramework: StyledRenderer,
                floatingCellRendererParams: {
                    style: {'fontWeight': 'bold'}
                }
            },
            {
                headerName: "Number",
                field: "number",
                width: 399,
                floatingCellRendererFramework: StyledRenderer,
                floatingCellRendererParams: {
                    style: {'fontStyle': 'italic'}
                }
            },
        ];
    }

    createRowData() {
        let rowData = [];

        for (let i = 0; i < 15; i++) {
            rowData.push({
                row: "Row " + i,
                number: Math.round(Math.random() * 100)
            });
        }

        return rowData;
    }

    render() {
        return (
            <div style={{height: 400, width: 945}}
                 className="ag-fresh">
                <h1>Floating Row Renderer Example</h1>
                <AgGridReact
                    // properties
                    columnDefs={this.state.columnDefs}
                    rowData={this.state.rowData}

                    floatingTopRowData={this.state.topFloatingRowData}
                    floatingBottomRowData={this.state.bottomFloatingRowData}

                    // events
                    onGridReady={this.onGridReady}>
                </AgGridReact>
            </div>
        );
    }
};
