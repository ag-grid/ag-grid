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
            data: undefined,
        };

        this.topGrid = React.createRef();
        this.bottomGrid = React.createRef();
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
        { field: 'athlete', width: 200 },
        { field: 'age', width: 150 },
        { field: 'country', width: 150 },
        { field: 'year', width: 120 },
        { field: 'date', width: 150 },
        { field: 'sport', width: 150 },
        // in the total col, we have a value getter, which usually means we don't need to provide a field
        // however the master/slave depends on the column id (which is derived from the field if provided) in
        // order ot match up the columns
        {
            headerName: 'Total',
            field: 'total',
            valueGetter: 'data.gold + data.silver + data.bronze',
            width: 200
        },
        { field: 'gold', width: 100 },
        { field: 'silver', width: 100 },
        { field: 'bronze', width: 100 }
    ];

    bottomData = [
        {
            athlete: 'Total',
            age: '15 - 61',
            country: 'Ireland',
            year: '2020',
            date: '26/11/1970',
            sport: 'Synchronised Riding',
            gold: 55,
            silver: 65,
            bronze: 12
        }
    ];

    onGridReady(params) {
        fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
            .then(resp => resp.json())
            .then(data => {
                this.setState({ data });
            });
    }

    render() {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }} className="ag-theme-alpine">
                <div style={{ flex: '1 1 auto' }}>
                    <AgGridReact
                        ref={this.topGrid}
                        alignedGrids={this.bottomGrid.current ? [this.bottomGrid.current] : undefined}
                        suppressHorizontalScroll
                        defaultColDef={this.defaultColDef}
                        columnDefs={this.columnDefs}
                        rowData={this.state.data}
                        onGridReady={this.onGridReady.bind(this)}
                    />
                </div>

                <div style={{ flex: 'none', height: '60px' }}>
                    <AgGridReact
                        ref={this.bottomGrid}
                        alignedGrids={this.topGrid.current ? [this.topGrid.current] : undefined}
                        defaultColDef={this.defaultColDef}
                        columnDefs={this.columnDefs}
                        rowData={this.bottomData}
                        headerHeight={0}
                        rowStyle={{ fontWeight: 'bold' }}
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
