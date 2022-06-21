import React, { Component } from 'react';
import { AgGridReact } from '@ag-grid-community/react';

import { ModuleRegistry } from '@ag-grid-community/core';
import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import { MenuModule } from '@ag-grid-enterprise/menu';
import { ExcelExportModule } from '@ag-grid-enterprise/excel-export';

ModuleRegistry.registerModules([ClientSideRowModelModule, MenuModule, ExcelExportModule]);

import '@ag-grid-community/styles/ag-grid.css';
import '@ag-grid-community/styles/ag-theme-alpine.css';

export default class App extends Component {
    constructor(props) {
        super(props);
        this.state = {
            columnDefs: [
                { headerName: 'Make', field: 'make' },
                { headerName: 'Model', field: 'model' },
                { headerName: 'Price', field: 'price' }
            ],
            rowData: [
                { make: 'Toyota', model: 'Celica', price: 35000 },
                { make: 'Ford', model: 'Mondeo', price: 32000 },
                { make: 'Porsche', model: 'Boxster', price: 72000 }
            ]
        };
    }

    render() {
        return (
            <div className='ag-theme-alpine'
                style={{
                    width: '100%',
                    height: '100%'
                }}>
                <AgGridReact
                    columnDefs={this.state.columnDefs}
                    rowData={this.state.rowData}
                    onGridReady={params => params.api.sizeColumnsToFit()}>
                </AgGridReact>
            </div>
        );
    }
}
