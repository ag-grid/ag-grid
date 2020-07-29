'use strict';

import React, {forwardRef, useImperativeHandle, useState} from 'react';
import {render} from 'react-dom';
import {AgGridColumn, AgGridReact} from 'ag-grid-react';

import 'ag-grid-enterprise';
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-alpine.css';

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
    return <span>Field: {props.colDef.field}, Value: {props.value}</span>
};

const CurrencyRenderer = forwardRef((props, ref) => {
    const [value, setValue] = useState(props.value);

    const formatValueToCurrency = (currency, value) => {
        return `${currency}${value.toFixed(2)}`
    };

    useImperativeHandle(ref, () => {
        return {
            refresh: (params) => {
                if (params.value !== value) {
                    setValue(params.value)
                }
                return true;
            }
        };
    });

    return <span>{formatValueToCurrency('EUR', value)}</span>
});

const ChildMessageRenderer = props => {
    const invokeParentMethod = () => {
        props.context.methodFromParent(`Row: ${props.node.rowIndex}, Col: ${props.colDef.field}`)
    };

    return <span><button style={{height: 20, lineHeight: 0.5}} onClick={invokeParentMethod} className="btn btn-info">Invoke Parent</button></span>;
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

    const refreshEvenRowsCurrencyData = () => {
        const newRowData = [];
        for (const data of rowData) {
            let newData = {...data};
            if (newData.value % 2 === 0) {
                newData.currency = newData.value + Number(Math.random().toFixed(2));
            }
            newRowData.push(newData);
        }
        setRowData(newRowData);
    };

    const methodFromParent = cell => {
        alert('Parent Component Method from ' + cell + '!');
    };

    return (
        <div style={{width: '100%', height: '100%'}}>
            <div className="test-container">
                <div className="test-header">
                    <button onClick={refreshEvenRowsCurrencyData} style={{marginBottom: 10}}
                            className="btn btn-primary">
                        Refresh Even Row Currency Data
                    </button>
                    <div
                        style={{
                            height: '100%',
                            width: '100%'
                        }}
                        className="ag-theme-alpine test-grid">
                        <AgGridReact
                            rowData={rowData}
                            // we use immutableData here to ensure that we only re-render what has changed in the grid
                            // see https://www.ag-grid.com/javascript-grid-immutable-data/ for more information
                            immutableData={true}
                            getRowNodeId={data => data.row}
                            context={{
                                methodFromParent
                            }}
                            frameworkComponents={{
                                squareRenderer: SquareRenderer,
                                cubeRenderer: CubeRenderer,
                                paramsRenderer: ParamsRenderer,
                                currencyRenderer: CurrencyRenderer,
                                childMessageRenderer: ChildMessageRenderer
                            }}
                            defaultColDef={{
                                editable: true,
                                sortable: true,
                                flex: 1,
                                minWidth: 100,
                                filter: true,
                                resizable: true
                            }}>
                            <AgGridColumn field="row" width={150}/>
                            <AgGridColumn field="value" cellRenderer='squareRenderer' editable={true} colId="square"/>
                            <AgGridColumn field="value" cellRenderer='cubeRenderer' colId="cube"/>
                            <AgGridColumn field="row" cellRenderer='paramsRenderer' colId="params"/>
                            <AgGridColumn field="currency" cellRenderer='currencyRenderer' colId="currency"/>
                            <AgGridColumn field="value" cellRenderer='childMessageRenderer' colId="params"/>
                        </AgGridReact>
                    </div>
                </div>
            </div>
        </div>
    );
};

render(
    <GridExample/>,
    document.querySelector('#root')
);
