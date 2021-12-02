'use strict'

import React, {useCallback, useRef, useState} from 'react';
import {render} from 'react-dom';
import {AgGridColumn, AgGridReact} from 'ag-grid-react';
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-alpine.css';

const GridExample = () => {
    const [gridApi, setGridApi] = useState(null);
    const [gridColumnApi, setGridColumnApi] = useState(null);
    const [rowData, setRowData] = useState(null);

    // see www.ag-grid.com/react/react-hooks/#avoiding-state-closures-ie-old-props-values
    function useDynamicCallback(callback) {
        const ref = useRef()
        ref.current = callback
        return useCallback((...args) => ref.current.apply(this, args), [])
    }

    const onGridReady = (params) => {
        setGridApi(params.api);
        setGridColumnApi(params.columnApi);

        const httpRequest = new XMLHttpRequest();
        const updateData = (data) => {
            setRowData(data);
        };

        httpRequest.open('GET', 'https://www.ag-grid.com/example-assets/olympic-winners.json');
        httpRequest.send();
        httpRequest.onreadystatechange = () => {
            if (httpRequest.readyState === 4 && httpRequest.status === 200) {
                updateData(JSON.parse(httpRequest.responseText));
            }
        };
    }

    const navigateToNextHeader = (params) => {
        var nextHeader = params.nextHeaderPosition;
        var processedNextHeader;
        if (params.key !== "ArrowDown" && params.key !== "ArrowUp") {
            return nextHeader;
        }
        processedNextHeader = moveHeaderFocusUpDown(params.previousHeaderPosition, params.headerRowCount, params.key === "ArrowDown");
        return processedNextHeader === nextHeader ? null : processedNextHeader;
    }

    const tabToNextHeader = (params) => {
        return moveHeaderFocusUpDown(params.previousHeaderPosition, params.headerRowCount, params.backwards);
    }

    // see www.ag-grid.com/react/react-hooks/#avoiding-state-closures-ie-old-props-values
    const tabToNextCell = useDynamicCallback((params) => {
        var previousCell = params.previousCellPosition, lastRowIndex = previousCell.rowIndex,
            nextRowIndex = params.backwards ? lastRowIndex - 1 : lastRowIndex + 1,
            renderedRowCount = gridApi.getModel().getRowCount(), result;
        if (nextRowIndex < 0) {
            nextRowIndex = -1;
        }
        if (nextRowIndex >= renderedRowCount) {
            nextRowIndex = renderedRowCount - 1;
        }
        result = {
            rowIndex: nextRowIndex,
            column: previousCell.column,
            floating: previousCell.floating
        };
        return result;
    })

    // see www.ag-grid.com/react/react-hooks/#avoiding-state-closures-ie-old-props-values
    const navigateToNextCell = useDynamicCallback((params) => {
        var previousCell = params.previousCellPosition, suggestedNextCell = params.nextCellPosition, nextRowIndex,
            renderedRowCount;
        switch (params.key) {
            case KEY_DOWN:
                nextRowIndex = previousCell.rowIndex - 1;
                if (nextRowIndex < -1) {
                    return null;
                }
                return {
                    rowIndex: nextRowIndex,
                    column: previousCell.column,
                    floating: previousCell.floating
                };
            case KEY_UP:
                nextRowIndex = previousCell.rowIndex + 1;
                renderedRowCount = gridApi.getModel().getRowCount();
                if (nextRowIndex >= renderedRowCount) {
                    return null;
                }
                return {
                    rowIndex: nextRowIndex,
                    column: previousCell.column,
                    floating: previousCell.floating
                };
            case KEY_LEFT:
            case KEY_RIGHT:
                return suggestedNextCell;
            default:
                throw "this will never happen, navigation is always one of the 4 keys above";
        }
    })

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
                    rowData={rowData}
                    defaultColDef={{
                        editable: true,
                        sortable: true,
                        flex: 1,
                        minWidth: 100,
                        filter: true,
                        resizable: true
                    }}
                    navigateToNextHeader={navigateToNextHeader}
                    tabToNextHeader={tabToNextHeader}
                    tabToNextCell={tabToNextCell}
                    navigateToNextCell={navigateToNextCell}
                    onGridReady={onGridReady}
                >
                    <AgGridColumn headerName="Athlete"><AgGridColumn field="athlete" headerName="Name" minWidth={170}/>
                        <AgGridColumn field="age"/>
                        <AgGridColumn field="country"/></AgGridColumn><AgGridColumn field="year"/><AgGridColumn
                    field="sport"/><AgGridColumn headerName="Medals"><AgGridColumn field="gold"/>
                    <AgGridColumn field="silver"/>
                    <AgGridColumn field="bronze"/>
                    <AgGridColumn field="total"/></AgGridColumn>
                </AgGridReact>
            </div>
        </div>
    );

}

var KEY_LEFT = 'ArrowLeft';
var KEY_UP = 'ArrowUp';
var KEY_RIGHT = 'ArrowRight';
var KEY_DOWN = 'ArrowDown';

function moveHeaderFocusUpDown(previousHeader, headerRowCount, isUp) {
    var previousColumn = previousHeader.column, lastRowIndex = previousHeader.headerRowIndex,
        nextRowIndex = isUp ? lastRowIndex - 1 : lastRowIndex + 1, nextColumn, parentColumn;
    if (nextRowIndex === -1) {
        return previousHeader;
    }
    if (nextRowIndex === headerRowCount) {
        nextRowIndex = -1;
    }
    parentColumn = previousColumn.getParent();
    if (isUp) {
        nextColumn = parentColumn || previousColumn;
    } else {
        nextColumn = previousColumn.children ? previousColumn.children[0] : previousColumn;
    }
    return {
        headerRowIndex: nextRowIndex,
        column: nextColumn
    };
}

render(<GridExample></GridExample>, document.querySelector('#root'))
