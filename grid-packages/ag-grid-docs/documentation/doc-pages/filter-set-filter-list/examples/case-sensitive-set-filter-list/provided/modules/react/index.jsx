'use strict';

import React, { Component } from 'react';
import { render } from 'react-dom';
import { AgGridReact } from '@ag-grid-community/react';
import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import { SetFilterModule } from '@ag-grid-enterprise/set-filter';
import { MenuModule } from '@ag-grid-enterprise/menu';
import { ColumnsToolPanelModule } from '@ag-grid-enterprise/column-tool-panel';
import { FiltersToolPanelModule } from '@ag-grid-enterprise/filter-tool-panel';
import '@ag-grid-community/styles/ag-grid.css';
import "@ag-grid-community/styles/ag-theme-alpine.css";

import { ModuleRegistry } from '@ag-grid-community/core';
// Register the required feature modules with the Grid
ModuleRegistry.registerModules([ClientSideRowModelModule, SetFilterModule, MenuModule, ColumnsToolPanelModule, FiltersToolPanelModule]);

const colourCellRenderer = props => {
    if (!props.value || props.value === '(Select All)') {
        return props.value;
    }

    const styles = {
        verticalAlign: "middle",
        border: "1px solid black",
        margin: 3,
        display: "inline-block",
        width: 10,
        height: 10,
        backgroundColor: props.value.toLowerCase()
    };
    return <React.Fragment><div style={styles} />{props.value}</React.Fragment>;
}

class GridExample extends Component {
    constructor(props) {
        super(props);

        this.state = {
            columnDefs: [
                {
                    headerName: 'Case Insensitive (default)',
                    field: 'colour',
                    filter: 'agSetColumnFilter',
                    filterParams: {
                        caseSensitive: false,
                        cellRenderer: colourCellRenderer,
                    },
                },
                {
                    headerName: 'Case Sensitive',
                    field: 'colour',
                    filter: 'agSetColumnFilter',
                    filterParams: {
                        caseSensitive: true,
                        cellRenderer: colourCellRenderer,
                    },
                },
            ],
            defaultColDef: {
                flex: 1,
                minWidth: 225,
                cellRenderer: colourCellRenderer,
                resizable: true,
                floatingFilter: true,
            },
            sideBar: 'filters',
            rowData: [
                { colour: 'Black' },
                { colour: 'BLACK' },
                { colour: 'black' },
                { colour: 'Red' },
                { colour: 'RED' },
                { colour: 'red' },
                { colour: 'Orange' },
                { colour: 'ORANGE' },
                { colour: 'orange' },
                { colour: 'White' },
                { colour: 'WHITE' },
                { colour: 'white' },
                { colour: 'Yellow' },
                { colour: 'YELLOW' },
                { colour: 'yellow' },
                { colour: 'Green' },
                { colour: 'GREEN' },
                { colour: 'green' },
                { colour: 'Purple' },
                { colour: 'PURPLE' },
                { colour: 'purple' },
            ]
        };
    }

    onGridReady = params => {
        this.gridApi = params.api;
        this.gridColumnApi = params.columnApi;

    }

    onFirstDataRendered = (params) => {
        ((params.api.getToolPanelInstance('filters'))).expandFilters();
    }

    render() {
        return (
            <div style={{ width: '100%', height: '100%' }}>
                <div style={{ "display": "flex", "flexDirection": "column", "height": "100%" }}>
                    <div

                        style={{
                            height: '100%',
                            width: '100%'
                        }}
                        className="ag-theme-alpine">
                        <AgGridReact
                            columnDefs={this.state.columnDefs}
                            defaultColDef={this.state.defaultColDef}
                            sideBar={this.state.sideBar}
                            rowData={this.state.rowData}
                            onGridReady={this.onGridReady}
                            onFirstDataRendered={this.onFirstDataRendered.bind(this)}
                        />
                    </div>
                </div>
            </div>
        );
    }
}

render(
    <GridExample></GridExample>,
    document.querySelector('#root')
)
