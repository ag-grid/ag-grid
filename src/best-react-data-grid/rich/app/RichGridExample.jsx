import React, {Component} from "react";
import {AgGridReact} from "ag-grid-react";
import RowDataFactory from "./RowDataFactory";
import ColDefFactory from "./ColDefFactory.jsx";
import DateComponent from "./DateComponent.jsx";
import SortableHeaderComponent from "./SortableHeaderComponent";
// take this line out if you do not want to use ag-Grid-Enterprise
import "ag-grid-enterprise";

export default class RichGridExample extends Component {

    constructor() {
        super();

        this.state = {
            columnDefs: new ColDefFactory().createColDefs(),
            rowData: new RowDataFactory().createRowData(),
            icons: {
                columnRemoveFromGroup: '<i class="fa fa-remove"/>',
                filter: '<i class="fa fa-filter"/>',
                sortAscending: '<i class="fa fa-long-arrow-down"/>',
                sortDescending: '<i class="fa fa-long-arrow-up"/>',
                groupExpanded: '<i class="fa fa-minus-square-o"/>',
                groupContracted: '<i class="fa fa-plus-square-o"/>',
                columnGroupOpened: '<i class="fa fa-minus-square-o"/>',
                columnGroupClosed: '<i class="fa fa-plus-square-o"/>'
            }
        };

        // the grid options are optional, because you can provide every property
        // to the grid via standard React properties
        // this.gridOptions = {
        //     // We register the react date component that ag-grid will use to render
        //     dateComponentFramework: DateComponent,
        //     defaultColDef: {
        //         headerComponentFramework: SortableHeaderComponent,
        //         headerComponentParams: {
        //             menuIcon: 'fa-bars'
        //         }
        //     }
        // };

        this.onGridReady = this.onGridReady.bind(this);
    }

    onGridReady(params) {
        this.api = params.api;
        this.columnApi = params.columnApi;
    }

    render() {
        return (
            <div style={{height: 400, width: 945}} className="ag-fresh">
                <AgGridReact
                    // gridOptions is optional - it's possible to provide
                    // all values as React props
                    gridOptions={this.gridOptions}

                    // listening for events
                    onGridReady={this.onGridReady}

                    // binding to an object property
                    icons={this.state.icons}

                    // binding to array properties
                    columnDefs={this.state.columnDefs}
                    rowData={this.state.rowData}

                    // no binding, just providing hard coded strings for the properties
                    suppressRowClickSelection="true"
                    rowSelection="multiple"
                    enableColResize="true"
                    enableSorting="true"
                    enableFilter="true"
                    groupHeaders="true"
                    rowHeight="22"
                />
            </div>
        );
    }
}
