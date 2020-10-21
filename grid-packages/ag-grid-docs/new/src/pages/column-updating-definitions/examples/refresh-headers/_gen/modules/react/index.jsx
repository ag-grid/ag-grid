'use strict';

import React, { Component } from 'react';
import { render } from 'react-dom';
import { AgGridReact } from '@ag-grid-community/react';
import { AllCommunityModules } from '@ag-grid-community/all-modules';
import '@ag-grid-community/all-modules/dist/styles/ag-grid.css';
import '@ag-grid-community/all-modules/dist/styles/ag-theme-alpine.css';
import CustomHeader from './customHeader.jsx';

class GridExample extends Component {
  constructor(props) {
    super(props);

    this.state = {
      modules: AllCommunityModules,
      columnDefs: getColumnDefs(),
      rowData: null,
      frameworkComponents: { CustomHeader: CustomHeader },
      defaultColDef: { headerComponent: 'CustomHeader' },
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

  onBtUpperNames = () => {
    var columnDefs = getColumnDefs();
    columnDefs.forEach(function (c) {
      c.headerName = c.field.toUpperCase();
    });
    this.gridApi.setColumnDefs(columnDefs);
  };

  onBtLowerNames = () => {
    var columnDefs = getColumnDefs();
    columnDefs.forEach(function (c) {
      c.headerName = c.field;
    });
    this.gridApi.setColumnDefs(columnDefs);
  };

  onBtFilterOn = () => {
    var columnDefs = getColumnDefs();
    columnDefs.forEach(function (c) {
      c.filter = true;
    });
    this.gridApi.setColumnDefs(columnDefs);
  };

  onBtFilterOff = () => {
    var columnDefs = getColumnDefs();
    columnDefs.forEach(function (c) {
      c.filter = false;
    });
    this.gridApi.setColumnDefs(columnDefs);
  };

  onBtResizeOn = () => {
    var columnDefs = getColumnDefs();
    columnDefs.forEach(function (c) {
      c.resizable = true;
    });
    this.gridApi.setColumnDefs(columnDefs);
  };

  onBtResizeOff = () => {
    var columnDefs = getColumnDefs();
    columnDefs.forEach(function (c) {
      c.resizable = false;
    });
    this.gridApi.setColumnDefs(columnDefs);
  };

  render() {
    return (
      <div style={{ width: '100%', height: '100%' }}>
        <div className="test-container">
          <div className="test-header">
            <button onClick={() => this.onBtUpperNames()}>
              Upper Header Names
            </button>
            <button onClick={() => this.onBtLowerNames()}>
              Lower Lower Names
            </button>
            &nbsp;&nbsp;&nbsp;
            <button onClick={() => this.onBtFilterOn()}>Filter On</button>
            <button onClick={() => this.onBtFilterOff()}>Filter Off</button>
            &nbsp;&nbsp;&nbsp;
            <button onClick={() => this.onBtResizeOn()}>Resize On</button>
            <button onClick={() => this.onBtResizeOff()}>Resize Off</button>
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
              columnDefs={this.state.columnDefs}
              rowData={this.state.rowData}
              frameworkComponents={this.state.frameworkComponents}
              defaultColDef={this.state.defaultColDef}
              onGridReady={this.onGridReady}
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
    { field: 'year' },
    { field: 'date' },
    { field: 'sport' },
    { field: 'gold' },
    { field: 'silver' },
    { field: 'bronze' },
    { field: 'total' },
  ];
}

render(<GridExample></GridExample>, document.querySelector('#root'));
