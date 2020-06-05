import React, {Component} from 'react';
import { AgGridReact } from "@ag-grid-community/react";
import {AllModules} from "@ag-grid-enterprise/all-modules";
import '@ag-grid-community/all-modules/dist/styles/ag-grid.css';
import '@ag-grid-community/all-modules/dist/styles/ag-theme-alpine.css';

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
      defaultColDef: {
        flex: 1,
        minWidth: 150
      },
      rowData: props.data.callRecords
    };

    this.state.rowId = props.node.id;
    this.state.masterGridApi = props.api;
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
          class="full-width-grid ag-theme-alpine"
          columnDefs={this.state.colDefs}
          defaultColDef={this.state.defaultColDef}
          rowData={this.state.rowData}
          modules={AllModules}
          onGridReady={this.onGridReady}
        />
      </div>
    );
  }

  onGridReady = params => {

    let gridInfo = {
      id: this.state.rowId,
      api: params.api,
      columnApi: params.columnApi
    };

    console.log("adding detail grid info with id: ", this.state.rowId);
    this.state.masterGridApi.addDetailGridInfo(this.state.rowId, gridInfo);
  };

  componentWillUnmount = () => {
    // the detail grid is automatically destroyed as it is a React component

    console.log("removing detail grid info with id: ", this.state.rowId);
    this.state.masterGridApi.removeDetailGridInfo(this.state.rowId);
  };
}
