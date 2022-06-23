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

        this.topGrid = React.createRef();
        this.bottomGrid = React.createRef();
    
        this.state = {
            data: undefined,
        };
    }

    defaultColDef = {
        editable: true,
        sortable: true,
        resizable: true,
        filter: true,
        flex: 1,
        minWidth: 100
    };

    columnDefs = [
        { field: 'athlete' },
        { field: 'age' },
        { field: 'country' },
        { field: 'year' },
        { field: 'date' },
        { field: 'sport' },
        {
            headerName: 'Medals',
            children: [
                {
                    columnGroupShow: 'closed', field: "total",
                    valueGetter: "data.gold + data.silver + data.bronze", width: 200
                },
                { columnGroupShow: 'open', field: "gold", width: 100 },
                { columnGroupShow: 'open', field: "silver", width: 100 },
                { columnGroupShow: 'open', field: "bronze", width: 100 }
            ]
        }
    ];

    onGridReady(params) {
        fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
            .then(resp => resp.json())
            .then(data => {
                this.setState({ data });
            });
    }

    onCbAthlete(event) {
        // we only need to update one grid, as the other is a slave
        if(this.topGrid.current) {
            this.topGrid.current.columnApi.setColumnVisible('athlete', event.target.checked);
        }
    }

    onCbAge(event) {
        // we only need to update one grid, as the other is a slave
        if(this.topGrid.current) {
            this.topGrid.current.columnApi.setColumnVisible('age', event.target.checked);
        }
    }

    onCbCountry(event) {
        // we only need to update one grid, as the other is a slave
        if(this.topGrid.current) {
            this.topGrid.current.columnApi.setColumnVisible('country', event.target.checked);
        }
    }

    render() {
        return (
            <div className="container">
                <div className="header">
                    <label>
                        <input
                            type="checkbox"
                            defaultChecked={true}
                            onChange={this.onCbAthlete.bind(this)} />Athlete
                    </label>
                    <label>
                        <input
                            type="checkbox"
                            defaultChecked={true}
                            onChange={this.onCbAge.bind(this)} />Age
                    </label>
                    <label>
                        <input
                            type="checkbox"
                            defaultChecked={true}
                            onChange={this.onCbCountry.bind(this)} />Country
                    </label>
                </div>

                <div className="grid ag-theme-alpine">
                    <AgGridReact
                        ref={this.topGrid}
                        alignedGrids={this.bottomGrid.current ? [this.bottomGrid.current] : undefined}
                        rowData={this.state.data}
                        defaultColDef={this.defaultColDef}
                        columnDefs={this.columnDefs}
                        onGridReady={this.onGridReady.bind(this)}
                    />
                </div>

                <div className="grid ag-theme-alpine">
                    <AgGridReact
                        ref={this.bottomGrid}
                        alignedGrids={this.topGrid.current ? [this.topGrid.current] : undefined}
                        rowData={this.state.data}
                        defaultColDef={this.defaultColDef}
                        columnDefs={this.columnDefs}
                    />
                </div>
            </div>
        );
    }
}

render(
    <GridExample></GridExample>,
    document.querySelector('#root')
)
