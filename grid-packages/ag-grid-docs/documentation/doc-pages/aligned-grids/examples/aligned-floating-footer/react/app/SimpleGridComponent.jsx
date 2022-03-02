import React, { Component } from 'react';
import { AgGridReact } from '@ag-grid-community/react';
import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';

import "@ag-grid-community/core/dist/styles/ag-grid.css";
import "@ag-grid-community/core/dist/styles/ag-theme-alpine.css";

import { ModuleRegistry } from '@ag-grid-community/core';
// Register the required feature modules with the Grid
ModuleRegistry.registerModules([ClientSideRowModelModule]);

export default class extends Component {
    constructor(props) {
        super(props);

        this.athleteVisible = true;
        this.ageVisible = true;
        this.countryVisible = true;
        this.rowData = null;
        this.bottomData = [
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

        this.state = this.createState();
    }

    createState() {
        const topOptions = {
            alignedGrids: [],
            defaultColDef: {
                editable: true,
                sortable: true,
                resizable: true,
                filter: true,
                flex: 1,
                minWidth: 100
            },
            suppressHorizontalScroll: true
        };
        const bottomOptions = {
            alignedGrids: [],
            defaultColDef: {
                editable: true,
                sortable: true,
                resizable: true,
                filter: true,
                flex: 1,
                minWidth: 100
            }
        };

        topOptions.alignedGrids.push(bottomOptions);
        bottomOptions.alignedGrids.push(topOptions);

        return {
            topOptions,
            bottomOptions,
            columnDefs: [
                { field: 'athlete', width: 200, hide: !this.athleteVisible },
                { field: 'age', width: 150, hide: !this.ageVisible },
                { field: 'country', width: 150, hide: !this.countryVisible },
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

            ],
            bottomData: this.bottomData,
            rowData: this.rowData
        };
    }

    onGridReady(params) {
        this.topGrid = params;
        fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
            .then(resp => resp.json())
            .then(data => {
                this.rowData = data
                this.setState(this.createState.bind(this));
            });
    }

    onFirstDataRendered() {
        this.topGrid.columnApi.autoSizeAllColumns();
    }

    render() {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }} className="ag-theme-alpine">
                <div style={{ flex: '1 1 auto' }}>
                    <AgGridReact rowData={this.state.rowData}
                        gridOptions={this.state.topOptions}
                        columnDefs={this.state.columnDefs}
                        onGridReady={this.onGridReady.bind(this)}
                        onFirstDataRendered={this.onFirstDataRendered.bind(this)} />
                </div>

                <div style={{ flex: 'none', height: '60px' }}>
                    <AgGridReact
                        rowData={this.state.bottomData}
                        gridOptions={this.state.bottomOptions}
                        columnDefs={this.state.columnDefs}
                        headerHeight="0"
                        rowStyle={{ fontWeight: 'bold' }}
                    />
                </div>
            </div>
        );
    }
}
