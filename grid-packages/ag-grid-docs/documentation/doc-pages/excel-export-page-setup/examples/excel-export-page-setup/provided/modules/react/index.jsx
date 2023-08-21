
'use strict';

import React, { Component } from 'react';
import { createRoot } from 'react-dom/client';
import { AgGridReact } from '@ag-grid-community/react';
import '@ag-grid-community/styles/ag-grid.css';
import "@ag-grid-community/styles/ag-theme-alpine.css";
import './styles.css';
import { ModuleRegistry } from '@ag-grid-community/core';
import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import { MenuModule } from '@ag-grid-enterprise/menu';
import { ExcelExportModule } from '@ag-grid-enterprise/excel-export';

// Register the required feature modules with the Grid
ModuleRegistry.registerModules([ClientSideRowModelModule, MenuModule, ExcelExportModule])

class GridExample extends Component {
    constructor(props) {
        super(props);

        this.state = {
            columnDefs: [
                { field: 'athlete', minWidth: 200 },
                { field: 'country', minWidth: 200 },
                { field: 'sport', minWidth: 150 },
                { field: 'gold' },
                { field: 'silver' },
                { field: 'bronze' },
                { field: 'total' },
            ],
            defaultColDef: {
                sortable: true,
                filter: true,
                resizable: true,
                minWidth: 100,
                flex: 1,
            },
            popupParent: document.body,
            rowData: null
        };

    }

    onFormSubmit = e => {
        e.preventDefault();
        const { pageSetup, margins } = getSheetConfig();
        this.gridApi.exportDataAsExcel({ pageSetup, margins });
    }

    onGridReady = params => {
        this.gridApi = params.api;
        this.gridColumnApi = params.columnApi;
        
        const updateData = (data) => params.api.setRowData(data.filter((rec) => rec.country != null));
        
        fetch('https://www.ag-grid.com/example-assets/small-olympic-winners.json')
            .then(resp => resp.json())
            .then(data => updateData(data));
    }

    render() {
        return (
            <div style={{ width: '100%', height: '100%' }}>
                <div className="container">
                    <form onSubmit={e => this.onFormSubmit(e)}>
                        <div className="columns">
                            <div className="column">
                                <label className="option" htmlFor="pageOrientation">
                                    Page Orientation =
                                    <select id="pageOrientation">
                                        <option value="Portrait">Portrait</option>
                                        <option value="Landscape">Landscape</option>
                                    </select>
                                </label>
                                <label className="option" htmlFor="pageSize">
                                    Page Size =
                                    <select id="pageSize">
                                        <option value="Letter">Letter</option>
                                        <option value="Letter Small">Letter Small</option>
                                        <option value="Tabloid">Tabloid</option>
                                        <option value="Ledger">Ledger</option>
                                        <option value="Legal">Legal</option>
                                        <option value="Statement">Statement</option>
                                        <option value="Executive">Executive</option>
                                        <option value="A3">A3</option>
                                        <option value="A4">A4</option>
                                        <option value="A4 Small">A4 Small</option>
                                        <option value="A5">A5</option>
                                        <option value="A6">A6</option>
                                        <option value="B4">B4</option>
                                        <option value="B5">B5</option>
                                        <option value="Folio">Folio</option>
                                        <option value="Envelope">Envelope</option>
                                        <option value="Envelope DL">Envelope DL</option>
                                        <option value="Envelope C5">Envelope C5</option>
                                        <option value="Envelope B5">Envelope B5</option>
                                        <option value="Envelope C3">Envelope C3</option>
                                        <option value="Envelope C4">Envelope C4</option>
                                        <option value="Envelope C6">Envelope C6</option>
                                        <option value="Envelope Monarch">Envelope Monarch</option>
                                        <option value="Japanese Postcard">Japanese Postcard</option>
                                        <option value="Japanese Double Postcard">Japanese Double Postcard</option>
                                    </select>
                                </label>
                            </div>
                            <div className="column margin-container">
                                <div>Margins</div>
                                <label htmlFor="top">Top = <input type="number" id="top" defaultValue="0.75" min="0" step="0.05" /></label>
                                <label htmlFor="right">Right = <input type="number" id="right" defaultValue="0.7" min="0" step="0.05" /></label>
                                <label htmlFor="bottom">Bottom = <input type="number" id="bottom" defaultValue="0.75" min="0" step="0.05" /></label>
                                <label htmlFor="left">Left = <input type="number" id="left" defaultValue="0.7" min="0" step="0.05" /></label>
                                <label htmlFor="header">Header = <input type="number" id="header" defaultValue="0.3" min="0" step="0.05" /></label>
                                <label htmlFor="footer">Footer = <input type="number" id="footer" defaultValue="0.3" min="0" step="0.05" /></label>
                            </div>
                        </div>
                        <div>
                            <input type="submit" style={{"margin":"5px 0px","fontWeight":"bold"}} value="Export to Excel" />
                        </div>
                    </form>
                    <div className="grid-wrapper">
                        <div
                            style={{
                                height: '100%',
                                width: '100%'
                            }}
                            className="ag-theme-alpine"
                        >
                            <AgGridReact
                                columnDefs={this.state.columnDefs}
                                defaultColDef={this.state.defaultColDef}
                                popupParent={this.state.popupParent}
                                onGridReady={this.onGridReady}
                                rowData={this.state.rowData}
                            />
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

function getNumber(id) {
    var el = document.querySelector(id);
    if (!el || isNaN(el.value)) {
        return 0;
    }
    return parseFloat(el.value);
}

function getValue(id) {
    return (document.querySelector(id)).value;
}

function getSheetConfig() {
    return {
        pageSetup: {
            orientation: getValue('#pageOrientation'),
            pageSize: getValue('#pageSize'),
        },
        margins: {
            top: getNumber('#top'),
            right: getNumber('#right'),
            bottom: getNumber('#bottom'),
            left: getNumber('#left'),
            header: getNumber('#header'),
            footer: getNumber('#footer'),
        },
    };
}

const root = createRoot(document.getElementById('root'));
root.render(<GridExample />);
