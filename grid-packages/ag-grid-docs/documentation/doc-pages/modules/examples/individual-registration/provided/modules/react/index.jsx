import React, { Component } from 'react';
import { createRoot } from 'react-dom/client';
import { AgGridReact } from '@ag-grid-community/react';

import "@ag-grid-community/styles/ag-grid.css";
import "@ag-grid-community/styles/ag-theme-alpine.css";

import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import { ClipboardModule } from '@ag-grid-enterprise/clipboard';
import { SetFilterModule } from '@ag-grid-enterprise/set-filter';
import { MenuModule } from '@ag-grid-enterprise/menu';
import { ExcelExportModule } from '@ag-grid-enterprise/excel-export';
import { GridChartsModule } from '@ag-grid-enterprise/charts';

import { ModuleRegistry } from '@ag-grid-community/core';
// Register shared Modules globally
ModuleRegistry.registerModules([
    ClientSideRowModelModule,
    MenuModule,
    GridChartsModule,
]);

const columns = [
    { field: "id" },
    { field: "color" },
    { field: "value1" }
];


const defaultColDef = {
    flex: 1,
    minWidth: 80,
    filter: true,
    floatingFilter: true,
    resizable: true,
};

class GridExample extends Component {

    constructor(props) {
        super(props);

        this.state = {
            leftRowData: [],
            rightRowData: [],
        };

        this.rowIdSequence = 100;
    }

    componentDidMount() {

        const createRowBlock = () =>
            ['Red', 'Green', 'Blue'].map((color) =>
            ({
                id: this.rowIdSequence++,
                color: color,
                value1: Math.floor(Math.random() * 100),
            })
            );


        this.setState({
            leftRowData: createRowBlock(),
            rightRowData: createRowBlock()
        });
    }

    render = () => (
        <div className="example-wrapper ag-theme-alpine">
            <div className="inner-col">
                <AgGridReact
                    defaultColDef={defaultColDef}
                    rowData={this.state.leftRowData}
                    modules={[SetFilterModule, ClipboardModule]}
                    columnDefs={[...columns]}
                    enableRangeSelection
                    enableCharts
                />
            </div>

            <div className="inner-col">
                <AgGridReact
                    defaultColDef={defaultColDef}
                    rowData={this.state.rightRowData}
                    modules={[ExcelExportModule]}
                    columnDefs={[...columns]}
                    enableRangeSelection
                    enableCharts
                />
            </div>
        </div>
    );
}

const root = createRoot(document.getElementById('root'));
root.render(<GridExample />);
