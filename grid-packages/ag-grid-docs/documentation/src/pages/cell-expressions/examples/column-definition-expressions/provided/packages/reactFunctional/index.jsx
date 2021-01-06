'use strict';

import React, { useState } from 'react';
import { render } from 'react-dom';
import { AgGridReact, AgGridColumn } from 'ag-grid-react';
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-alpine-dark.css';

const GridExample = () => {
  const [gridApi, setGridApi] = useState(null);
  const [gridColumnApi, setGridColumnApi] = useState(null);

  const onGridReady = (params) => {
    setGridApi(params.api);
    setGridColumnApi(params.columnApi);

    params.api.sizeColumnsToFit();
  };

  const onCellValueChanged = (event) => {
    console.log('data after changes is: ', event.data);
  };

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <div
        id="myGrid"
        style={{
          height: '100%',
          width: '100%',
        }}
        className="ag-theme-alpine-dark"
      >
        <AgGridReact
          defaultColDef={{
            flex: 1,
            minWidth: 200,
            resizable: true,
          }}
          enableRangeSelection={true}
          rowData={createRowData()}
          onGridReady={onGridReady}
          onCellValueChanged={onCellValueChanged}
        >
          <AgGridColumn
            headerName="String (editable)"
            field="simple"
            editable={true}
          ></AgGridColumn>
          <AgGridColumn
            headerName="Bad Number (editable)"
            field="numberBad"
            editable={true}
          ></AgGridColumn>
          <AgGridColumn
            headerName="Good Number (editable)"
            field="numberGood"
            editable={true}
            valueFormatter="'£' + Math.floor(value).toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')"
            valueParser="Number(newValue)"
          ></AgGridColumn>
          <AgGridColumn
            headerName="Name (editable)"
            editable={true}
            valueGetter="data.firstName + ' ' + data.lastName"
            valueSetter={
              'var nameSplit = newValue.split(" ");' +
              'var newFirstName = nameSplit[0];' +
              'var newLastName = nameSplit[1];' +
              'if (data.firstName !== newFirstName || data.lastName !== newLastName) {' +
              '  data.firstName = newFirstName;' +
              '  data.lastName = newLastName;' +
              '  return true;' +
              '} else {' +
              '  return false;' +
              '}'
            }
          ></AgGridColumn>
          <AgGridColumn headerName="A" field="a" maxWidth={120}></AgGridColumn>
          <AgGridColumn headerName="B" field="b" maxWidth={120}></AgGridColumn>
          <AgGridColumn
            headerName="A + B"
            valueGetter="data.a + data.b"
            maxWidth={120}
          ></AgGridColumn>
        </AgGridReact>
      </div>
    </div>
  );
};

function createRowData() {
  var rowData = [];
  var words = [
    'One',
    'Apple',
    'Moon',
    'Sugar',
    'Grid',
    'Banana',
    'Sunshine',
    'Stars',
    'Black',
    'White',
    'Salt',
    'Beach',
  ];
  var firstNames = ['Niall', 'John', 'Rob', 'Alberto', 'Bas', 'Dimple', 'Sean'];
  var lastNames = [
    'Pink',
    'Black',
    'White',
    'Brown',
    'Smith',
    'Smooth',
    'Anderson',
  ];
  for (var i = 0; i < 100; i++) {
    var randomWords =
      words[i % words.length] + ' ' + words[(i * 17) % words.length];
    rowData.push({
      simple: randomWords,
      numberBad: Math.floor(((i + 2) * 173456) % 10000),
      numberGood: Math.floor(((i + 2) * 476321) % 10000),
      a: Math.floor(i % 4),
      b: Math.floor(i % 7),
      firstName: firstNames[i % firstNames.length],
      lastName: lastNames[i % lastNames.length],
    });
  }
  return rowData;
}

render(<GridExample></GridExample>, document.querySelector('#root'));
