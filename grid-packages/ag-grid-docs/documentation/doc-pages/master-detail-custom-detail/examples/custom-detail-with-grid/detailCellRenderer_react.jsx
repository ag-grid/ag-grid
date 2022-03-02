import React, { Component } from 'react';
import { AgGridReact } from "@ag-grid-community/react";
import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';

import { ModuleRegistry } from '@ag-grid-community/core';
// Register the required feature modules with the Grid
ModuleRegistry.registerModules([ClientSideRowModelModule]);

export default class DetailCellRenderer extends Component {
  constructor(props) {
    super(props);

    this.state = {
      colDefs: [
        { field: 'callId' },
        { field: 'direction' },
        { field: 'number' },
        { field: 'duration', valueFormatter: "x.toLocaleString() + 's'" },
        { field: 'switchCode' }
      ],
      defaultColDef: {
        flex: 1,
        minWidth: 120
      },
      rowId: props.node.id,
      masterGridApi: props.api
    };
  }

  render() {
    const { data } = this.props;

    return (
      <div className="full-width-panel">
        <div className="full-width-details">
          <div className="full-width-detail"><b>Name: </b>{data.name}</div>
          <div className="full-width-detail"><b>Account: </b>{data.account}</div>
        </div>
        <AgGridReact
          id="detailGrid"
          className="full-width-grid ag-theme-alpine"
          columnDefs={this.state.colDefs}
          defaultColDef={this.state.defaultColDef}
          rowData={data.callRecords}
          onGridReady={this.onGridReady}
        />
      </div>
    );
  }

  onGridReady = params => {
    const gridInfo = {
      id: this.state.rowId,
      api: params.api,
      columnApi: params.columnApi
    };

    console.log("adding detail grid info with id: ", this.state.rowId);

    this.state.masterGridApi.addDetailGridInfo(this.state.rowId, gridInfo);
  };

  componentWillUnmount = () => {
    console.log("removing detail grid info with id: ", this.state.rowId);

    // the detail grid is automatically destroyed as it is a React component
    this.state.masterGridApi.removeDetailGridInfo(this.state.rowId);
  };
}
