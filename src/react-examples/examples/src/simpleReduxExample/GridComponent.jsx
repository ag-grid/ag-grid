import React, {Component} from "react";

import {AgGridReact} from "ag-grid-react";
import {connect} from "react-redux";
// take this line out if you do not want to use ag-Grid-Enterprise
import "ag-grid-enterprise";

import {updateRowSelection} from "./gridDataActions";

/*
 * This component serves to display the row data (provided by redux)
 */
class GridComponent extends Component {
    constructor(props) {
        super(props);

        this.state = {
            columnDefs: [
                {headerName: 'Symbol', field: 'symbol'},
                {headerName: 'Price', field: 'price'},
                {headerName: 'Group', field: 'group'}
            ]
        };

        this.onGridReady = this.onGridReady.bind(this);
        this.onSelectionChanged = this.onSelectionChanged.bind(this);
        this.setGroupingEnabled = this.setGroupingEnabled.bind(this);
    }

    onGridReady(params) {
        this.gridApi = params.api;
        this.columnApi = params.columnApi;

        this.gridApi.sizeColumnsToFit();

        // set the initial group state
        this.setGroupingEnabled(false);
    }

    // on selection publish selected row ids
    onSelectionChanged() {
        let selectedRowNodes = this.gridApi.getSelectedNodes();
        let selectedIds = selectedRowNodes.map((rowNode) => rowNode.id);

        this.props.dispatch(updateRowSelection(selectedIds));
    }

    setGroupingEnabled(enabled) {
        if (enabled) {
            this.columnApi.addRowGroupColumn('group');
            this.columnApi.setColumnVisible('group', false);
            this.columnApi.setColumnVisible('symbol', false);
        } else {
            this.columnApi.removeRowGroupColumn('group');
            this.columnApi.setColumnVisible('group', true);
            this.columnApi.setColumnVisible('symbol', true);
        }
    }

    // row data will be provided via redux on this.props.rowData
    // we bind to this and using "deltaRowDataMode" the grid will only re-render rows that have changed
    // this requires each row to have a uniquely identifying property - in this case the row data "symbol" (see getRowNodeId)
    render() {
        return (
            <div style={{height: 400, width: 945, marginTop: 15}}
                 className="ag-fresh">
                <AgGridReact
                    // properties
                    columnDefs={this.state.columnDefs}
                    rowData={this.props.rowData}

                    deltaRowDataMode
                    enableStatusBar
                    animateRows
                    enableColResize
                    rowSelection="multiple"
                    enableRangeSelection
                    groupColumnDef={{
                        headerName: 'Symbol',
                        cellRenderer: 'group',
                        field: 'symbol'
                    }}
                    groupDefaultExpanded="1"
                    enableSorting
                    getRowNodeId={(data) => data.symbol}

                    // events
                    onGridReady={this.onGridReady}
                    onSelectionChanged={this.onSelectionChanged}>
                </AgGridReact>
            </div>
        )
    }
}

// pull off row data changes
export default connect(
    (state) => {
        return {
            rowData: state.rowData
        }
    },
    null,
    null,
    {withRef: true}
)(GridComponent);