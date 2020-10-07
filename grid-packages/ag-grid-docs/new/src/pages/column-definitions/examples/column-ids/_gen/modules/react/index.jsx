'use strict';

import React, { Component } from 'react';
import { render } from 'react-dom';
import { AgGridReact } from '@ag-grid-community/react';
import { AllCommunityModules } from '@ag-grid-community/all-modules';
import '@ag-grid-community/all-modules/dist/styles/ag-grid.css';
import '@ag-grid-community/all-modules/dist/styles/ag-theme-alpine.css';

class GridExample extends Component {
  constructor(props) {
    super(props);

    this.state = {
      modules: AllCommunityModules,
      columnDefs: [
        {
          headerName: 'Col 1',
          colId: 'firstCol',
          field: 'height',
        },
        {
          headerName: 'Col 2',
          colId: 'firstCol',
          field: 'height',
        },
        {
          headerName: 'Col 3',
          field: 'height',
        },
        {
          headerName: 'Col 4',
          field: 'height',
        },
        {
          headerName: 'Col 5',
          valueGetter: 'data.width',
        },
        {
          headerName: 'Col 6',
          valueGetter: 'data.width',
        },
      ],
      rowData: this.createRowData(),
    };
  }

  onGridReady = (params) => {
    this.gridApi = params.api;
    this.gridColumnApi = params.columnApi;

    var cols = params.columnApi.getAllColumns();
    cols.forEach(function (col) {
      var colDef = col.getUserProvidedColDef();
      console.log(
        colDef.headerName + ', Column ID = ' + col.getId(),
        JSON.stringify(colDef)
      );
    });
  };

  createRowData = () => {
    var data = [];
    for (var i = 0; i < 20; i++) {
      data.push({
        height: Math.floor(Math.random() * 100),
        width: Math.floor(Math.random() * 100),
        depth: Math.floor(Math.random() * 100),
      });
    }
    return data;
  };

  render() {
    return (
      <div style={{ width: '100%', height: '100%' }}>
        <div style={{ height: '100%', boxSizing: 'border-box' }}>
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
              onGridReady={this.onGridReady}
            />
          </div>
        </div>
      </div>
    );
  }
}

render(<GridExample></GridExample>, document.querySelector('#root'));
