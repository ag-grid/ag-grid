'use strict';

import React, { useMemo, useRef, useState } from 'react';
import { render } from 'react-dom';
import { AgGridReact } from '@ag-grid-community/react';
import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import "@ag-grid-community/styles/ag-grid.css";
import "@ag-grid-community/styles/ag-theme-alpine.css";

import { ModuleRegistry } from '@ag-grid-community/core';
// Register the required feature modules with the Grid
ModuleRegistry.registerModules([ClientSideRowModelModule]);

const SquareRenderer = props => {
    const valueSquared = (value) => {
        return value * value;
    };

    return <span>{valueSquared(props.value)}</span>;
};

const CubeRenderer = props => {
    const valueCubed = (value) => {
        return value * value * value;
    };

    return <span>{valueCubed(props.value)}</span>;
};

const ParamsRenderer = props => {
    return <span>Field: {props.colDef.field}, Value: {props.value}</span>;
};

const CurrencyRenderer = props => {
    const value = useMemo(() => props.value, [props.value]);

    const formatValueToCurrency = (currency, value) => {
        return `${currency}${value.toFixed(2)}`;
    };

    return <span>{formatValueToCurrency('EUR', value)}</span>;
};

const ChildMessageRenderer = props => {
    const invokeParentMethod = () => {
        props.context.methodFromParent(`Row: ${props.node.rowIndex}, Col: ${props.colDef.field}`);
    };

    return <span><button style={{ height: 20, lineHeight: 0.5 }} onClick={invokeParentMethod} className="btn btn-info">Invoke Parent</button></span>;
};

const createRowData = () => {
    const rowData = [];
    for (let i = 0; i < 15; i++) {
        rowData.push({
            row: "Row " + i,
            value: i,
            currency: i + Number(Math.random().toFixed(2))
        });
    }
    return rowData;
};

const GridExample = () => {
    const [rowData, setRowData] = useState(createRowData());
    const gridRef = useRef();

    const columnDefs = useMemo(() => [
        {
            headerName: "Row",
            field: "row",
            width: 150
        },
        {
            headerName: "Square",
            field: "value",
            cellRenderer: SquareRenderer,
            editable: true,
            colId: "square",
            width: 150
        },
        {
            headerName: "Cube",
            field: "value",
            cellRenderer: CubeRenderer,
            colId: "cube",
            width: 150
        },
        {
            headerName: "Row Params",
            field: "row",
            cellRenderer: ParamsRenderer,
            colId: "params",
            width: 150
        },
        {
            headerName: "Currency (Pipe)",
            field: "currency",
            cellRenderer: CurrencyRenderer,
            colId: "currency",
            width: 120
        },
        {
            headerName: "Child/Parent",
            field: "value",
            cellRenderer: ChildMessageRenderer,
            colId: "params",
            editable: false,
            minWidth: 150
        }
    ], []);

    const refreshEvenRowsCurrencyData = () => {
        gridRef.current.api.forEachNode(rowNode => {
            if (rowNode.data.value % 2 === 0) {
                rowNode.setDataValue('currency', rowNode.data.value + Number(Math.random().toFixed(2)));
            }
        });

        gridRef.current.api.refreshCells({ columns: ['currency'] })
    };

    const methodFromParent = cell => {
        alert('Parent Component Method from ' + cell + '!');
    };

    return (
        <div style={{ width: '100%', height: '100%' }}>
            <div className="example-wrapper">
                <button onClick={() => refreshEvenRowsCurrencyData()} style={{ "marginBottom": "10px" }}
                    className="btn btn-primary">
                    Refresh Even Row Currency Data
                </button>
                <div
                    id="myGrid"
                    style={{
                        height: '100%',
                        width: '100%'
                    }}
                    className="ag-theme-alpine">
                    <AgGridReact
                        ref={gridRef}
                        rowData={rowData}
                        columnDefs={columnDefs}
                        getRowId={params => params.data.row}
                        context={{
                            methodFromParent
                        }}
                        defaultColDef={{
                            editable: true,
                            sortable: true,
                            flex: 1,
                            minWidth: 100,
                            filter: true,
                            resizable: true
                        }}>
                    </AgGridReact>
                </div>
            </div>
        </div>
    );
};

render(
    <GridExample />,
    document.querySelector('#root')
);
