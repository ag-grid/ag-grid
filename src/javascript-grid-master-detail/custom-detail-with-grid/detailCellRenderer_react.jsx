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
    };

    this.state.rowIndex = props.rowIndex;
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
          columnDefs={this.state.colDefs}
          rowData={this.state.rowData}
          debug={true}
          onGridReady={this.onGridReady}
        />
      </div>
    );
  }

  onGridReady = params => {
    let detailGridId = this.createDetailGridId();

    let gridInfo = {
      id: detailGridId,
      api: params.api,
      columnApi: params.columnApi
    };

    console.log("adding detail grid info with id: ", detailGridId);
    this.state.masterGridApi.addDetailGridInfo(detailGridId, gridInfo);
  };

  componentWillUnmount = () => {
    let detailGridId = this.createDetailGridId();

    // ag-Grid is automatically destroyed

    console.log("removing detail grid info with id: ", detailGridId);
    this.state.masterGridApi.removeDetailGridInfo(detailGridId);
  };

  createDetailGridId = () => {
    return "detail_" + this.state.rowIndex;
  }
}