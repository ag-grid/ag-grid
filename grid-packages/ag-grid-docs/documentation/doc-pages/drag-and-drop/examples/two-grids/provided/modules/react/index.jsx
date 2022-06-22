import React, { Component } from 'react';
import { render } from 'react-dom';
import { AgGridReact } from '@ag-grid-community/react';
import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';

import "@ag-grid-community/styles/ag-grid.css";
import "@ag-grid-community/styles/ag-theme-alpine.css";

import { ModuleRegistry } from '@ag-grid-community/core';
// Register the required feature modules with the Grid
ModuleRegistry.registerModules([ClientSideRowModelModule]);

class GridExample extends Component {
    constructor(props) {
        super(props);

        this.state = {
            rowIdSequence: 100,

            leftGridOptions: {
                defaultColDef: {
                    width: 80,
                    sortable: true,
                    filter: true,
                    resizable: true
                },
                rowClassRules: {
                    "red-row": 'data.color == "Red"',
                    "green-row": 'data.color == "Green"',
                    "blue-row": 'data.color == "Blue"',
                },
                getRowId: (params) => {
                    return params.data.id
                },
                rowDragManaged: true,
                columnDefs: [
                    { field: "id", dndSource: true },
                    { field: "color" },
                    { field: "value1" },
                    { field: "value2" }
                ],
                animateRows: true
            },

            rightGridOptions: {
                defaultColDef: {
                    width: 80,
                    sortable: true,
                    filter: true,
                    resizable: true
                },
                rowClassRules: {
                    "red-row": 'data.color == "Red"',
                    "green-row": 'data.color == "Green"',
                    "blue-row": 'data.color == "Blue"',
                },
                getRowId: (params) => {
                    return params.data.id
                },
                rowData: [],
                rowDragManaged: true,
                columnDefs: [
                    { field: "id", dndSource: true },
                    { field: "color" },
                    { field: "value1" },
                    { field: "value2" }
                ],
                animateRows: true
            },
        };
    }

    createLeftRowData() {
        let data = [];
        ['Red', 'Green', 'Blue'].forEach((color) => {
            data.push(this.createDataItem(color));
        });
        return data;
    }

    createDataItem(color) {
        let newDataItem = {
            id: this.state.rowIdSequence,
            color: color,
            value1: Math.floor(Math.random() * 100),
            value2: Math.floor(Math.random() * 100)
        };

        this.setState({
            rowIdSequence: this.state.rowIdSequence + 1
        });
        return newDataItem;
    }

    binDragOver = (event) => {
        const dragSupported = event.dataTransfer.types.indexOf('application/json') >= 0;
        if (dragSupported) {
            event.dataTransfer.dropEffect = "move";
            event.preventDefault();
        }
    };

    binDrop = (event) => {
        event.preventDefault();
        const jsonData = event.dataTransfer.getData("application/json");
        const data = JSON.parse(jsonData);

        // if data missing or data has no id, do nothing
        if (!data || data.id == null) {
            return;
        }

        const transaction = {
            remove: [data]
        };

        const rowIsInLeftGrid = !!this.state.leftGridOptions.api.getRowNode(data.id);
        if (rowIsInLeftGrid) {
            this.state.leftGridOptions.api.applyTransaction(transaction);
        }

        const rowIsInRightGrid = !!this.state.rightGridOptions.api.getRowNode(data.id);
        if (rowIsInRightGrid) {
            this.state.rightGridOptions.api.applyTransaction(transaction);
        }
    };

    dragStart(color, event) {
        const newItem = this.createDataItem(color);
        const jsonData = JSON.stringify(newItem);

        event.dataTransfer.setData('application/json', jsonData);
    };

    gridDragOver = (event) => {
        const dragSupported = event.dataTransfer.types.length;

        if (dragSupported) {
            event.dataTransfer.dropEffect = 'copy';
            event.preventDefault();
        }
    };

    gridDrop = (grid, event) => {
        event.preventDefault();

        const jsonData = event.dataTransfer.getData('application/json');
        const data = JSON.parse(jsonData);

        // if data missing or data has no it, do nothing
        if (!data || data.id == null) {
            return;
        }

        const gridApi = grid === 'left' ? this.state.leftGridOptions.api : this.state.rightGridOptions.api;

        // do nothing if row is already in the grid, otherwise we would have duplicates
        const rowAlreadyInGrid = !!gridApi.getRowNode(data.id);
        if (rowAlreadyInGrid) {
            console.log('not adding row to avoid duplicates in the grid');
            return;
        }

        const transaction = {
            add: [data]
        };
        gridApi.applyTransaction(transaction);
    };

    onGridReady = (params) => {
        params.api.setRowData(this.createLeftRowData());
    };

    render() {
        return (
            <div className="outer">
                <div style={{ height: "100%" }} className="inner-col ag-theme-alpine" onDragOver={this.gridDragOver}
                    onDrop={this.gridDrop.bind(this, 'left')}>
                    <AgGridReact gridOptions={this.state.leftGridOptions} onGridReady={this.onGridReady} />
                </div>

                <div className="inner-col factory-panel">
                    <span id="eBin" onDragOver={this.binDragOver} onDrop={this.binDrop.bind(this)}
                        className="factory factory-bin">
                        <i className="far fa-trash-alt"><span className="filename"> Trash - </span></i>
                        Drop target to destroy row
                    </span>
                    <span draggable="true" onDragStart={this.dragStart.bind(this, 'Red')} className="factory factory-red">
                        <i className="far fa-plus-square"><span className="filename"> Create - </span></i>
                        Drag source for new red item
                    </span>
                    <span draggable="true" onDragStart={this.dragStart.bind(this, 'Green')}
                        className="factory factory-green">
                        <i className="far fa-plus-square"><span className="filename"> Create - </span></i>
                        Drag source for new green item
                    </span>
                    <span draggable="true" onDragStart={this.dragStart.bind(this, 'Blue')} className="factory factory-blue">
                        <i className="far fa-plus-square"><span className="filename"> Create - </span></i>
                        Drag source for new blue item
                    </span>
                </div>

                <div style={{ height: "100%" }} className="inner-col ag-theme-alpine" onDragOver={this.gridDragOver}
                    onDrop={this.gridDrop.bind(this, 'right')}>
                    <AgGridReact gridOptions={this.state.rightGridOptions} />
                </div>
            </div>
        );
    }
}

render(
    <GridExample></GridExample>,
    document.querySelector('#root')
)
