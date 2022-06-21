'use strict';

import React, { Component } from 'react';
import { render } from 'react-dom';
import { AgGridReact } from '@ag-grid-community/react';
import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import '@ag-grid-community/styles/ag-grid.css';
import '@ag-grid-community/styles/ag-theme-alpine.css';

import { ModuleRegistry } from '@ag-grid-community/core';
// Register the required feature modules with the Grid
ModuleRegistry.registerModules([ClientSideRowModelModule]);

class GridExample extends Component {
    constructor(props) {
        super(props);

        this.state = {
            columnDefs: [
                { field: 'athlete' },
                {
                    field: 'age',
                    maxWidth: 90,
                    valueParser: numberParser,
                    cellClassRules: {
                        'rag-green': 'x < 20',
                        'rag-amber': 'x >= 20 && x < 25',
                        'rag-red': 'x >= 25',
                    },
                },
                { field: 'country' },
                {
                    field: 'year',
                    maxWidth: 90,
                    valueParser: numberParser,
                    cellClassRules: ragCellClassRules,
                    cellRenderer: ragRenderer,
                },
                { field: 'date', cellClass: 'rag-amber' },
                {
                    field: 'sport',
                    cellClass: cellClass,
                },
                {
                    field: 'gold',
                    valueParser: numberParser,
                    cellStyle: {
                        // you can use either came case or dashes, the grid converts to whats needed
                        backgroundColor: '#aaffaa', // light green
                    },
                },
                {
                    field: 'silver',
                    valueParser: numberParser,
                    // when cellStyle is a func, we can have the style change
                    // dependent on the data, eg different colors for different values
                    cellStyle: cellStyle,
                },
                {
                    field: 'bronze',
                    valueParser: numberParser,
                    // same as above, but demonstrating dashes in the style, grid takes care of converting to/from camel case
                    cellStyle: cellStyle,
                },
            ],
            defaultColDef: {
                flex: 1,
                minWidth: 150,
                editable: true,
            },
            rowData: null
        };


    }

    onGridReady = params => {
        this.gridApi = params.api;
        this.gridColumnApi = params.columnApi;

        const updateData = (data) => params.api.setRowData(data);

        fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
            .then(resp => resp.json())
            .then(data => updateData(data));
    }


    render() {
        return (
            <div style={{ width: '100%', height: '100%' }}>
                <div

                    style={{
                        height: '100%',
                        width: '100%'
                    }}
                    className="ag-theme-alpine">
                    <AgGridReact
                        columnDefs={this.state.columnDefs}
                        defaultColDef={this.state.defaultColDef}
                        onGridReady={this.onGridReady}
                        rowData={this.state.rowData}
                    />
                </div>
            </div>
        );
    }
}

const ragCellClassRules = {
    'rag-green-outer': params => params.value === 2008,
    'rag-amber-outer': params => params.value === 2004,
    'rag-red-outer': params => params.value === 2000,
};

function cellStyle(params) {
    const color = numberToColor(params.value);
    return {
        backgroundColor: color,
    };
}

function cellClass(params) {
    return params.value === 'Swimming' ? 'rag-green' : 'rag-amber';
}

function numberToColor(val) {
    if (val === 0) {
        return '#ffaaaa';
    } else if (val == 1) {
        return '#aaaaff';
    } else {
        return '#aaffaa';
    }
}

function ragRenderer(params) {
    return <span class="rag-element">{params.value}</span>;
}

function numberParser(params) {
    const newValue = params.newValue;
    let valueAsNumber;
    if (newValue === null || newValue === undefined || newValue === '') {
        valueAsNumber = null;
    } else {
        valueAsNumber = parseFloat(params.newValue);
    }
    return valueAsNumber;
}

render(
    <GridExample></GridExample>,
    document.querySelector('#root')
)
