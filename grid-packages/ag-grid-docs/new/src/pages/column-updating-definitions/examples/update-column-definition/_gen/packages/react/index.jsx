'use strict';

import React, { Component } from 'react';
import { render } from 'react-dom';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-alpine.css';

class GridExample extends Component {
  constructor(props) {
    super(props);

    this.state = {
      defaultColDef: {
        initialWidth: 100,
        sortable: true,
        resizable: true,
        filter: true,
      },
      columnDefs: getColumnDefs(),
      rowData: null,
    };
  }

  onGridReady = (params) => {
    this.gridApi = params.api;
    this.gridColumnApi = params.columnApi;

    const httpRequest = new XMLHttpRequest();
    const updateData = (data) => {
      this.setState({ rowData: data });
    };

    httpRequest.open(
      'GET',
      'https://raw.githubusercontent.com/ag-grid/ag-grid/master/grid-packages/ag-grid-docs/src/olympicWinnersSmall.json'
    );
    httpRequest.send();
    httpRequest.onreadystatechange = () => {
      if (httpRequest.readyState === 4 && httpRequest.status === 200) {
        updateData(JSON.parse(httpRequest.responseText));
      }
    };
  };

  setHeaderNames = () => {
    var columnDefs = getColumnDefs();
    columnDefs.forEach(function (colDef, index) {
      colDef.headerName = 'C' + index;
    });
    this.gridApi.setColumnDefs(columnDefs);
  };

  removeHeaderNames = () => {
    var columnDefs = getColumnDefs();
    columnDefs.forEach(function (colDef, index) {
      colDef.headerName = undefined;
    });
    this.gridApi.setColumnDefs(columnDefs);
  };

  setValueFormatters = () => {
    var columnDefs = getColumnDefs();
    columnDefs.forEach(function (colDef, index) {
      colDef.valueFormatter = function (params) {
        return '[ ' + params.value + ' ]';
      };
    });
    this.gridApi.setColumnDefs(columnDefs);
    this.gridApi.refreshCells({ force: true });
  };

  removeValueFormatters = () => {
    var columnDefs = getColumnDefs();
    columnDefs.forEach(function (colDef, index) {
      colDef.valueFormatter = undefined;
    });
    this.gridApi.setColumnDefs(columnDefs);
    this.gridApi.refreshCells({ force: true });
  };

  render() {
    return (
      <div style={{ width: '100%', height: '100%' }}>
        <div className="test-container">
          <div className="test-header">
            <button onClick={() => this.setHeaderNames()}>
              Set Header Names
            </button>
            <button onClick={() => this.removeHeaderNames()}>
              Remove Header Names
            </button>
            <button onClick={() => this.setValueFormatters()}>
              Set Value Formatters
            </button>
            <button onClick={() => this.removeValueFormatters()}>
              Remove Value Formatters
            </button>
          </div>
          <div
            id="myGrid"
            style={{
              height: '100%',
              width: '100%',
            }}
            className="ag-theme-alpine"
          >
            <AgGridReact
              defaultColDef={this.state.defaultColDef}
              columnDefs={this.state.columnDefs}
              onGridReady={this.onGridReady}
              rowData={this.state.rowData}
            />
          </div>
        </div>
      </div>
    );
  }
}

function getColumnDefs() {
  return [
    { field: 'athlete' },
    { field: 'age' },
    { field: 'country' },
    { field: 'sport' },
    { field: 'year' },
    { field: 'date' },
    { field: 'gold' },
    { field: 'silver' },
    { field: 'bronze' },
    { field: 'total' },
  ];
}

render(<GridExample></GridExample>, document.querySelector('#root'));
