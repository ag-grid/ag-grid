'use strict';

import React, { useState } from 'react';
import { render } from 'react-dom';
import { AgGridReact, AgGridColumn } from 'ag-grid-react';
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-alpine.css';

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
            defaultColDef={{
              width: 150,
              editable: true,
              filter: 'agTextColumnFilter',
              floatingFilter: true,
              resizable: true,
            }}
            defaultColGroupDef={{ marryChildren: true }}
            columnTypes={{
              numberColumn: {
                width: 130,
                filter: 'agNumberColumnFilter',
              },
              medalColumn: {
                width: 100,
                columnGroupShow: 'open',
                filter: false,
              },
              nonEditableColumn: { editable: false },
              dateColumn: {
                filter: 'agDateColumnFilter',
                filterParams: {
                  comparator: function (filterLocalDateAtMidnight, cellValue) {
                    var dateParts = cellValue.split('/');
                    var day = Number(dateParts[0]);
                    var month = Number(dateParts[1]) - 1;
                    var year = Number(dateParts[2]);
                    var cellDate = new Date(year, month, day);
                    if (cellDate < filterLocalDateAtMidnight) {
                      return -1;
                    } else if (cellDate > filterLocalDateAtMidnight) {
                      return 1;
                    } else {
                      return 0;
                    }
                  },
                },
              },
            }}
            rowData={rowData}
            onGridReady={onGridReady}
          >
            <AgGridColumn headerName="Athlete" field="athlete" />
            <AgGridColumn headerName="Sport" field="sport" />
            <AgGridColumn headerName="Age" field="age" type="numberColumn" />
            <AgGridColumn headerName="Year" field="year" type="numberColumn" />
            <AgGridColumn
              headerName="Date"
              field="date"
              type={['dateColumn', 'nonEditableColumn']}
              width={220}
            />
            <AgGridColumn headerName="Medals" groupId="medalsGroup">
              <AgGridColumn headerName="Gold" field="gold" type="medalColumn" />
              <AgGridColumn
                headerName="Silver"
                field="silver"
                type="medalColumn"
              />
              <AgGridColumn
                headerName="Bronze"
                field="bronze"
                type="medalColumn"
              />
              <AgGridColumn
                headerName="Total"
                field="total"
                type="medalColumn"
                columnGroupShow="closed"
              />
            </AgGridColumn>
          </AgGridReact>
        </div>
      </div>
    </div>
  );
};

render(<GridExample></GridExample>, document.querySelector('#root'));
