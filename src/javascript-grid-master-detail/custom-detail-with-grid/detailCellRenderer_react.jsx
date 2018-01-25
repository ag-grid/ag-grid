import React, {Component} from 'react';
import { AgGridReact } from "ag-grid-react";
import "ag-grid-enterprise";

export default class DetailCellRenderer extends Component {
    constructor(props) {
        super(props);

        this.state = {
            name: props.data.name,
            account: props.data.account,
            colDefs: [
                {field: 'callId'},
                {field: 'direction'},
                {field: 'number'},
                {field: 'duration', valueFormatter: "x.toLocaleString() + 's'"},
                {field: 'switchCode'}
            ],
                rowData: props.data.callRecords
            }
    }

    render() {
        return (
            <div className="full-width-panel">
              <div className="full-width-details">
                <div className="full-width-detail"><b>Name: </b>{this.state.name}</div>
                <div className="full-width-detail"><b>Account: </b>{this.state.account}</div>
              </div>
              <AgGridReact
                id="detailGrid"
                columnDefs={this.state.colDefs}
                rowData={this.state.rowData}
              />
            </div>
        );
    }
}