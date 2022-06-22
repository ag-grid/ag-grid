import React, { Component } from 'react';
import { render } from 'react-dom';
import { AgGridReact } from '@ag-grid-community/react';
import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import { CsvExportModule } from '@ag-grid-community/csv-export';
import { ExcelExportModule, exportMultipleSheetsAsExcel } from '@ag-grid-enterprise/excel-export';

import "@ag-grid-community/styles/ag-grid.css";
import "@ag-grid-community/styles/ag-theme-alpine.css";

import { ModuleRegistry } from '@ag-grid-community/core';
// Register the required feature modules with the Grid
ModuleRegistry.registerModules([ClientSideRowModelModule, CsvExportModule, ExcelExportModule]);

const SportRenderer = props => {
    return (
        <i className="far fa-trash-alt"
            style={{ cursor: 'pointer' }}
            onClick={() => props.api.applyTransaction({ remove: [props.node.data] })}>
        </i>
    )
}

const leftColumns = [
    {
        rowDrag: true,
        maxWidth: 50,
        suppressMenu: true,
        rowDragText: (params, dragItemCount) => {
            if (dragItemCount > 1) {
                return dragItemCount + ' athletes';
            }
            return params.rowNode.data.athlete;
        },
    },
    { field: "athlete" },
    { field: "sport" }
];

const rightColumns = [
    {
        rowDrag: true,
        maxWidth: 50,
        suppressMenu: true,
        rowDragText: (params, dragItemCount) => {
            if (dragItemCount > 1) {
                return dragItemCount + ' athletes';
            }
            return params.rowNode.data.athlete;
        },
    },
    { field: "athlete" },
    { field: "sport" },
    {
        suppressMenu: true,
        maxWidth: 50,
        cellRenderer: SportRenderer
    }
]

const defaultColDef = {
    flex: 1,
    minWidth: 100,
    sortable: true,
    filter: true,
    resizable: true
};

class GridExample extends Component {

    constructor(props) {
        super(props);

        this.state = {
            leftApi: null,
            leftColumnApi: null,
            rightApi: null,
            rawData: [],
            leftRowData: null,
            rightRowData: null,
        };
    }

    componentDidMount() {
        fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
            .then(resp => resp.json())
            .then(data => {
                const athletes = [];
                let i = 0;

                while (athletes.length < 20 && i < data.length) {
                    var pos = i++;
                    if (athletes.some(rec => rec.athlete === data[pos].athlete)) {
                        continue;
                    }
                    athletes.push(data[pos]);
                }
                this.setState({ rawData: athletes });
            });
    }

    componentDidUpdate(prevProps, prevState) {
        if (!prevState.rawData.length && this.state.rawData.length) {
            this.loadGrids();
        }
    }

    loadGrids = () => {
        this.setState({
            leftRowData: [...this.state.rawData.slice(0, this.state.rawData.length)],
            rightRowData: [...this.state.rawData.slice(this.state.rawData.length / 2)]
        });
        this.state.leftApi.deselectAll();
    }

    reset = () => {
        this.loadGrids();
    }

    getRowId = params => params.data.athlete


    addGridDropZone = () => {
        const dropZoneParams = this.state.rightApi.getRowDropZoneParams({
            onDragStop: params => {
                var nodes = params.nodes;

                this.state.leftApi.applyTransaction({
                    remove: nodes.map(function (node) {
                        return node.data;
                    })
                });
            }
        });

        this.state.leftApi.addRowDropZone(dropZoneParams);
    }

    onGridReady(params, side) {
        if (side === 0) {
            this.setState({
                leftApi: params.api,
                leftColumnApi: params.columnApi
            });
        }

        if (side === 1) {
            this.setState({
                rightApi: params.api,
            });
            this.addGridDropZone();
        }
    }

    getTopToolBar = () => (
        <div>
            <button type="button" className="btn btn-default reset" style={{ marginRight: 5 }} onClick={this.onExcelExport}>
                <i className="far fa-file-excel" style={{ marginRight: 5, color: 'green' }}></i>Export to Excel
            </button>
            <button type="button" className="btn btn-default reset" onClick={this.reset}>
                <i className="fas fa-redo" style={{ marginRight: 5 }}></i>Reset
            </button>
        </div>
    );

    getGridWrapper = (id) => (
        <div className="panel panel-primary" style={{ marginRight: '10px' }}>
            <div className="panel-heading">{id === 0 ? 'Athletes' : 'Selected Athletes'}</div>
            <div className="panel-body">
                <AgGridReact
                    style={{ height: '100%;' }}
                    defaultColDef={defaultColDef}
                    getRowId={this.getRowId}
                    rowDragManaged={true}
                    animateRows={true}
                    rowSelection={id === 0 ? "multiple" : undefined}
                    rowDragMultiRow={id === 0}
                    suppressMoveWhenRowDragging={id === 0}

                    rowData={id === 0 ? this.state.leftRowData : this.state.rightRowData}
                    columnDefs={id === 0 ? leftColumns : rightColumns}
                    onGridReady={(params) => this.onGridReady(params, id)}
                >
                </AgGridReact>
            </div>
        </div>
    )

    render = () => (
        <div className="top-container">
            {this.getTopToolBar()}
            <div class="grid-wrapper ag-theme-alpine">
                {this.getGridWrapper(0)}
                {this.getGridWrapper(1)}
            </div>
        </div>
    );

    onExcelExport = () => {
        var spreadsheets = [];

        spreadsheets.push(
            this.state.leftApi.getSheetDataForExcel({ sheetName: 'Athletes' }),
            this.state.rightApi.getSheetDataForExcel({ sheetName: 'Selected Athletes' })
        );

        exportMultipleSheetsAsExcel({
            data: spreadsheets,
            fileName: 'ag-grid.xlsx'
        });
    }
}

render(
    <GridExample></GridExample>,
    document.querySelector('#root')
)
