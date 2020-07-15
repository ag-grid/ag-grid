'use strict'

import React, {useState} from 'react';
import {render} from 'react-dom';
import {AgGridColumn, AgGridReact} from '@ag-grid-community/react';
import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import '@ag-grid-community/all-modules/dist/styles/ag-grid.css';
import '@ag-grid-community/all-modules/dist/styles/ag-theme-alpine.css';

const alphabet = () => {
    return 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
}

const createData = (count, prefix) => {
    var rowData = [];
    for (var i = 0; i < count; i++) {
        var item = {};
        item.fullWidth = i % 3 === 2;
        alphabet().forEach(function (letter) {
            item[letter] = prefix + ' (' + letter + ',' + i + ')';
        });
        rowData.push(item);
    }
    return rowData;
}

const getColumnDefs = () => {
    var columnDefs = [];
    alphabet().forEach(function (letter) {
        var colDef = {
            headerName: letter,
            field: letter,
            width: 150
        };
        if (letter === 'A') {
            colDef.pinned = 'left';
        }
        if (letter === 'Z') {
            colDef.pinned = 'right';
        }
        columnDefs.push(colDef);
    });
    return columnDefs;
}

const fullWidthCellRenderer = (params) => {
    var cssClass;
    var message;
    if (params.node.rowPinned) {
        cssClass = "example-full-width-pinned-row";
        message = "Pinned full width row at index " + params.rowIndex;
    } else {
        cssClass = "example-full-width-row";
        message = "Normal full width row at index" + params.rowIndex;
    }
    var eDiv = document.createElement("div");
    eDiv.innerHTML = "<div class=\"" + cssClass + "\"><button>Click</button> " + message + "</div>";
    var eButton = eDiv.querySelector("button");
    eButton.addEventListener("click", function () {
        alert("button clicked");
    });
    return eDiv.firstChild;
}

const GridExample = () => {
    const [gridApi, setGridApi] = useState(null);
    const [gridColumnApi, setGridColumnApi] = useState(null);
    const [rowData, setRowData] = [createData(100, "body")];
    const [pinnedTopRowData, setPinnedTopRowData] = [createData(3, "pinned")];
    const [pinnedBottomRowData, setPinnedBottomRowData] = [createData(3, "pinned")];
    const [columns, setColumns] = useState(getColumnDefs());

    const onGridReady = (params) => {
        setGridApi(params.api);
        setGridColumnApi(params.columnApi);
    };

    return (
        <div style={{width: '100%', height: '100%'}}>
            <div
                id="myGrid"
                style={{
                    height: '100%',
                    width: '100%'
                }}
                className="ag-theme-alpine">
                <AgGridReact
                    modules={[ClientSideRowModelModule]}
                    rowData={rowData}
                    onGridReady={onGridReady}
                    pinnedTopRowData={pinnedTopRowData}
                    pinnedBottomRowData={pinnedBottomRowData}
                    isFullWidthCell={(rowNode) => rowNode.data.fullWidth}
                    fullWidthCellRenderer={fullWidthCellRenderer}
                    getRowHeight={(params) => {
                        const isBodyRow = params.node.rowPinned === undefined;
                        const isFullWidth = params.node.data.fullWidth;
                        if (isBodyRow && isFullWidth) {
                            return 75;
                        }
                    }}>
                    {columns.map(column => <AgGridColumn {...column} />)}
                </AgGridReact>
            </div>
        </div>
    );
}

render(
    <GridExample></GridExample>,
    document.querySelector('#root')
)


