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

        this.topGridRef = React.createRef();
        this.bottomGridRef = React.createRef();
        this.state = {
            rowData: [],
        };
    }

    defaultColDef = {
        editable: true,
        sortable: true,
        resizable: true,
        filter: true,
        flex: 1,
        minWidth: 100,
        width: 100,
    };

    columnDefs = [
        {
            headerName: 'Group 1',
            headerClass: 'blue',
            groupId: 'Group1',
            children: [
                { field: 'athlete', pinned: true },
                { field: 'age', pinned: true, columnGroupShow: 'open' },
                { field: 'country' },
                { field: 'year', columnGroupShow: 'open' },
                { field: 'date' },
                { field: 'sport', columnGroupShow: 'open' },
                { field: 'date' },
                { field: 'sport', columnGroupShow: 'open' }
            ]
        },
        {
            headerName: 'Group 2',
            headerClass: 'green',
            groupId: 'Group2',
            children: [
                { field: 'athlete', pinned: true },
                { field: 'age', pinned: true, columnGroupShow: 'open' },
                { field: 'country' },
                { field: 'year', columnGroupShow: 'open' },
                { field: 'date' },
                { field: 'sport', columnGroupShow: 'open' },
                { field: 'date' },
                { field: 'sport', columnGroupShow: 'open' }
            ]
        }
    ];

    onGridReady = () => {
        fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
            .then(resp => resp.json())
            .then(data => {
                this.setState({ rowData: data });
            });
    };

    onFirstDataRendered = (params) => {
        // mix up some columns
        params.columnApi.moveColumnByIndex(11, 4);
        params.columnApi.moveColumnByIndex(11, 4);
    }

    render() {
        return (
            <div className="container">
                <div className="grid ag-theme-alpine">
                    <AgGridReact
                        ref={this.topGridRef}
                        defaultColDef={this.defaultColDef}
                        columnDefs={this.columnDefs}
                        rowData={this.state.rowData}
                        onGridReady={this.onGridReady}
                        onFirstDataRendered={this.onFirstDataRendered}
                        alignedGrids={this.bottomGridRef.current ? [this.bottomGridRef.current] : undefined}
                    />
                </div>

                <div className="divider"></div>

                <div className="grid ag-theme-alpine">
                    <AgGridReact
                        ref={this.bottomGridRef}
                        defaultColDef={this.defaultColDef}
                        columnDefs={this.columnDefs}
                        rowData={this.state.rowData}
                        alignedGrids={this.topGridRef.current ? [this.topGridRef.current] : undefined}/>
                </div>
            </div>
        );
    }
}

render(
    <GridExample></GridExample>,
    document.querySelector('#root')
)
