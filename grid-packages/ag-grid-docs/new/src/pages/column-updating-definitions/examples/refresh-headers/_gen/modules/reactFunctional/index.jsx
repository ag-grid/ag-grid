'use strict';

import React, { useState } from 'react';
import { render } from 'react-dom';
import { AgGridReact, AgGridColumn } from '@ag-grid-community/react';
import { AllCommunityModules } from '@ag-grid-community/all-modules';
import '@ag-grid-community/all-modules/dist/styles/ag-grid.css';
import '@ag-grid-community/all-modules/dist/styles/ag-theme-alpine.css';
import CustomHeader from './customHeader.jsx';

const GridExample = () => {
  const [gridApi, setGridApi] = useState(null);
  const [gridColumnApi, setGridColumnApi] = useState(null);
  const [rowData, setRowData] = useState(null);

  const onGridReady = (params) => {
    setGridApi(params.api);
    setGridColumnApi(params.columnApi);

    const httpRequest = new XMLHttpRequest();
    const updateData = (data) => {
      setRowData(data);
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

  const onBtUpperNames = () => {
    var columnDefs = getColumnDefs();
    columnDefs.forEach(function (c) {
      c.headerName = c.field.toUpperCase();
    });
    gridApi.setColumnDefs(columnDefs);
  };

  const onBtLowerNames = () => {
    var columnDefs = getColumnDefs();
    columnDefs.forEach(function (c) {
      c.headerName = c.field;
    });
    gridApi.setColumnDefs(columnDefs);
  };

  const onBtFilterOn = () => {
    var columnDefs = getColumnDefs();
    columnDefs.forEach(function (c) {
      c.filter = true;
    });
    gridApi.setColumnDefs(columnDefs);
  };

  const onBtFilterOff = () => {
    var columnDefs = getColumnDefs();
    columnDefs.forEach(function (c) {
      c.filter = false;
    });
    gridApi.setColumnDefs(columnDefs);
  };

  const onBtResizeOn = () => {
    var columnDefs = getColumnDefs();
    columnDefs.forEach(function (c) {
      c.resizable = true;
    });
    gridApi.setColumnDefs(columnDefs);
  };

  const onBtResizeOff = () => {
    var columnDefs = getColumnDefs();
    columnDefs.forEach(function (c) {
      c.resizable = false;
    });
    gridApi.setColumnDefs(columnDefs);
  };

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <div className="test-container">
        <div className="test-header">
          <button onClick={() => onBtUpperNames()}>Upper Header Names</button>
          <button onClick={() => onBtLowerNames()}>Lower Lower Names</button>
          &nbsp;&nbsp;&nbsp;
          <button onClick={() => onBtFilterOn()}>Filter On</button>
          <button onClick={() => onBtFilterOff()}>Filter Off</button>
          &nbsp;&nbsp;&nbsp;
          <button onClick={() => onBtResizeOn()}>Resize On</button>
          <button onClick={() => onBtResizeOff()}>Resize Off</button>
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
            modules={AllCommunityModules}
            columnDefs={getColumnDefs()}
            rowData={rowData}
            frameworkComponents={{ CustomHeader: CustomHeader }}
            defaultColDef={{ headerComponent: 'CustomHeader' }}
            onGridReady={onGridReady}
          ></AgGridReact>
        </div>
      </div>
    </div>
  );
};

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
