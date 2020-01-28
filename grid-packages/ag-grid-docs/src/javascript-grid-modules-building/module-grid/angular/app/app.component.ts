import {Component} from '@angular/core';

import {ModuleRegistry, GridApi} from '@ag-grid-community/core';
import {ClientSideRowModelModule} from '@ag-grid-community/client-side-row-model';
import {MenuModule} from '@ag-grid-enterprise/menu';
import {ExcelExportModule} from '@ag-grid-enterprise/excel-export';

ModuleRegistry.registerModules([ClientSideRowModelModule, MenuModule, ExcelExportModule]);

import "@ag-grid-community/core/dist/styles/ag-grid.css";
import "@ag-grid-community/core/dist/styles/ag-theme-balham.css";

@Component({
    selector: 'my-app',
    template: `
        <ag-grid-angular
                style="width: 100%; height: 150px;"
                class="ag-theme-balham"
                [rowData]="rowData"
                [columnDefs]="columnDefs"
                (gridReady)="onGridReady($event)">
        </ag-grid-angular>
    `
})
export class AppComponent {
    columnDefs = [
        {field: 'make'},
        {field: 'model'},
        {field: 'price'}
    ];

    rowData = [
        {make: 'Toyota', model: 'Celica', price: 35000},
        {make: 'Ford', model: 'Mondeo', price: 32000},
        {make: 'Porsche', model: 'Boxter', price: 72000}
    ];

    onGridReady(params: GridApi) {
        params.api.sizeColumnsToFit();
    }
}
