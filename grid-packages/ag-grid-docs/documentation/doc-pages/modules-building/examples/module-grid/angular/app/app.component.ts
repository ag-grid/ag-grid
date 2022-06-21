import { Component } from '@angular/core';

import { ModuleRegistry, GridApi, ColDef, GridReadyEvent } from '@ag-grid-community/core';
import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import { MenuModule } from '@ag-grid-enterprise/menu';
import { ExcelExportModule } from '@ag-grid-enterprise/excel-export';

ModuleRegistry.registerModules([ClientSideRowModelModule, MenuModule, ExcelExportModule]);

import "@ag-grid-community/styles/ag-grid.css";
import "@ag-grid-community/styles/ag-theme-alpine.css";

@Component({
    selector: 'my-app',
    template: `
        <ag-grid-angular
                style="width: 100%; height: 100%;"
                class="ag-theme-alpine"
                [rowData]="rowData"
                [columnDefs]="columnDefs"
                (gridReady)="onGridReady($event)">
        </ag-grid-angular>
    `
})
export class AppComponent {
    columnDefs: ColDef[] = [
        { field: 'make' },
        { field: 'model' },
        { field: 'price' }
    ];

    rowData = [
        { make: 'Toyota', model: 'Celica', price: 35000 },
        { make: 'Ford', model: 'Mondeo', price: 32000 },
        { make: 'Porsche', model: 'Boxster', price: 72000 }
    ];

    onGridReady(params: GridReadyEvent) {
        params.api!.sizeColumnsToFit();
    }
}
