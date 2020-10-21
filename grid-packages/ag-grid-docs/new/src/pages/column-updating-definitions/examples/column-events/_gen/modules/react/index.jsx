'use strict';

import React, { Component } from 'react';
import { render } from 'react-dom';
import { AgGridReact } from '@ag-grid-community/react';
import { AllModules } from '@ag-grid-enterprise/all-modules';
import '@ag-grid-community/all-modules/dist/styles/ag-grid.css';
import '@ag-grid-community/all-modules/dist/styles/ag-theme-alpine.css';

class GridExample extends Component {
  constructor(props) {
    super(props);

    this.state = {
      modules: AllModules,
      defaultColDef: {
        sortable: true,
        resizable: true,
        width: 150,
        enableRowGroup: true,
        enablePivot: true,
        enableValue: true,
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

  onSortChanged = (e) => {
    console.log('Event Sort Changed', e);
  };

  onColumnResized = (e) => {
    console.log('Event Column Resized', e);
  };

  onColumnVisible = (e) => {
    console.log('Event Column Visible', e);
  };

  onColumnPivotChanged = (e) => {
    console.log('Event Pivot Changed', e);
  };

  onColumnRowGroupChanged = (e) => {
    console.log('Event Row Group Changed', e);
  };

  onColumnValueChanged = (e) => {
    console.log('Event Value Changed', e);
  };

  onColumnMoved = (e) => {
    console.log('Event Column Moved', e);
  };

  onColumnPinned = (e) => {
    console.log('Event Column Pinned', e);
  };

  onBtSortOn = () => {
    var columnDefs = getColumnDefs();
    columnDefs.forEach(function (colDef) {
      if (colDef.field === 'age') {
        colDef.sort = 'desc';
      }
      if (colDef.field === 'athlete') {
        colDef.sort = 'asc';
      }
    });
    this.gridApi.setColumnDefs(columnDefs);
  };

  onBtSortOff = () => {
    var columnDefs = getColumnDefs();
    columnDefs.forEach(function (colDef) {
      colDef.sort = null;
    });
    this.gridApi.setColumnDefs(columnDefs);
  };

  onBtWidthNarrow = () => {
    var columnDefs = getColumnDefs();
    columnDefs.forEach(function (colDef) {
      if (colDef.field === 'age' || colDef.field === 'athlete') {
        colDef.width = 100;
      }
    });
    this.gridApi.setColumnDefs(columnDefs);
  };

  onBtWidthNormal = () => {
    var columnDefs = getColumnDefs();
    columnDefs.forEach(function (colDef) {
      colDef.width = 200;
    });
    this.gridApi.setColumnDefs(columnDefs);
  };

  onBtHide = () => {
    var columnDefs = getColumnDefs();
    columnDefs.forEach(function (colDef) {
      if (colDef.field === 'age' || colDef.field === 'athlete') {
        colDef.hide = true;
      }
    });
    this.gridApi.setColumnDefs(columnDefs);
  };

  onBtShow = () => {
    var columnDefs = getColumnDefs();
    columnDefs.forEach(function (colDef) {
      colDef.hide = false;
    });
    this.gridApi.setColumnDefs(columnDefs);
  };

  onBtPivotOn = () => {
    this.gridColumnApi.setPivotMode(true);
    var columnDefs = getColumnDefs();
    columnDefs.forEach(function (colDef) {
      if (colDef.field === 'country') {
        colDef.pivot = true;
      }
    });
    this.gridApi.setColumnDefs(columnDefs);
  };

  onBtPivotOff = () => {
    this.gridColumnApi.setPivotMode(false);
    var columnDefs = getColumnDefs();
    columnDefs.forEach(function (colDef) {
      colDef.pivot = false;
    });
    this.gridApi.setColumnDefs(columnDefs);
  };

  onBtRowGroupOn = () => {
    var columnDefs = getColumnDefs();
    columnDefs.forEach(function (colDef) {
      if (colDef.field === 'sport') {
        colDef.rowGroup = true;
      }
    });
    this.gridApi.setColumnDefs(columnDefs);
  };

  onBtRowGroupOff = () => {
    var columnDefs = getColumnDefs();
    columnDefs.forEach(function (colDef) {
      colDef.rowGroup = false;
    });
    this.gridApi.setColumnDefs(columnDefs);
  };

  onBtAggFuncOn = () => {
    var columnDefs = getColumnDefs();
    columnDefs.forEach(function (colDef) {
      if (
        colDef.field === 'gold' ||
        colDef.field === 'silver' ||
        colDef.field === 'bronze'
      ) {
        colDef.aggFunc = 'sum';
      }
    });
    this.gridApi.setColumnDefs(columnDefs);
  };

  onBtAggFuncOff = () => {
    var columnDefs = getColumnDefs();
    columnDefs.forEach(function (colDef) {
      colDef.aggFunc = null;
    });
    this.gridApi.setColumnDefs(columnDefs);
  };

  onBtPinnedOn = () => {
    var columnDefs = getColumnDefs();
    columnDefs.forEach(function (colDef) {
      if (colDef.field === 'athlete') {
        colDef.pinned = 'left';
      }
      if (colDef.field === 'age') {
        colDef.pinned = 'right';
      }
    });
    this.gridApi.setColumnDefs(columnDefs);
  };

  onBtPinnedOff = () => {
    var columnDefs = getColumnDefs();
    columnDefs.forEach(function (colDef) {
      colDef.pinned = null;
    });
    this.gridApi.setColumnDefs(columnDefs);
  };

  render() {
    return (
      <div style={{ width: '100%', height: '100%' }}>
        <div className="test-container">
          <div className="test-header">
            <div className="test-button-row">
              <div className="test-button-group">
                <button onClick={() => this.onBtSortOn()}>Sort On</button>
                <br />
                <button onClick={() => this.onBtSortOff()}>Sort Off</button>
              </div>
              <div className="test-button-group">
                <button onClick={() => this.onBtWidthNarrow()}>
                  Width Narrow
                </button>
                <br />
                <button onClick={() => this.onBtWidthNormal()}>
                  Width Normal
                </button>
              </div>
              <div className="test-button-group">
                <button onClick={() => this.onBtHide()}>Hide Cols</button>
                <br />
                <button onClick={() => this.onBtShow()}>Show Cols</button>
              </div>
              <div className="test-button-group">
                <button onClick={() => this.onBtPivotOn()}>Pivot On</button>
                <br />
                <button onClick={() => this.onBtPivotOff()}>Pivot Off</button>
              </div>
              <div className="test-button-group">
                <button onClick={() => this.onBtRowGroupOn()}>
                  Row Group On
                </button>
                <br />
                <button onClick={() => this.onBtRowGroupOff()}>
                  Row Group Off
                </button>
              </div>
              <div className="test-button-group">
                <button onClick={() => this.onBtAggFuncOn()}>
                  Agg Func On
                </button>
                <br />
                <button onClick={() => this.onBtAggFuncOff()}>
                  Agg Func Off
                </button>
              </div>
              <div className="test-button-group">
                <button onClick={() => this.onBtPinnedOn()}>Pinned On</button>
                <br />
                <button onClick={() => this.onBtPinnedOff()}>Pinned Off</button>
              </div>
            </div>
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
              modules={this.state.modules}
              defaultColDef={this.state.defaultColDef}
              debug={true}
              columnDefs={this.state.columnDefs}
              rowData={this.state.rowData}
              onGridReady={this.onGridReady}
              onSortChanged={this.onSortChanged.bind(this)}
              onColumnResized={this.onColumnResized.bind(this)}
              onColumnVisible={this.onColumnVisible.bind(this)}
              onColumnPivotChanged={this.onColumnPivotChanged.bind(this)}
              onColumnRowGroupChanged={this.onColumnRowGroupChanged.bind(this)}
              onColumnValueChanged={this.onColumnValueChanged.bind(this)}
              onColumnMoved={this.onColumnMoved.bind(this)}
              onColumnPinned={this.onColumnPinned.bind(this)}
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
    { field: 'gold' },
    { field: 'silver' },
    { field: 'bronze' },
  ];
}

render(<GridExample></GridExample>, document.querySelector('#root'));
