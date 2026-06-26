import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';

import { AgGridAngular } from 'ag-grid-angular';
import {
    ClientSideRowModelModule,
    ColDef,
    GridReadyEvent,
    ModuleRegistry,
    enableDevValidations,
} from 'ag-grid-community';
import { FindModule, ToolbarModule } from 'ag-grid-enterprise';

import './styles.css';

// Enable extended validations only for development
if (process.env.NODE_ENV !== 'production') {
    enableDevValidations();
}

ModuleRegistry.registerModules([FindModule, ToolbarModule, ClientSideRowModelModule]);

@Component({
    selector: 'my-app',
    standalone: true,
    imports: [AgGridAngular],
    template: `<ag-grid-angular
        style="width: 100%; height: 100%;"
        [columnDefs]="columnDefs"
        [rowData]="rowData"
        [toolbar]="toolbar"
        (gridReady)="onGridReady($event)"
    /> `,
})
export class AppComponent {
    columnDefs: ColDef[] = [
        { field: 'athlete' },
        { field: 'country' },
        { field: 'sport' },
        { field: 'year' },
        { field: 'age', minWidth: 100 },
        { field: 'gold', minWidth: 100 },
        { field: 'silver', minWidth: 100 },
        { field: 'bronze', minWidth: 100 },
    ];
    rowData!: any[];

    toolbar = {
        items: ['agFindToolbarItem' as const],
    };

    constructor(private http: HttpClient) {}

    onGridReady(params: GridReadyEvent) {
        this.http
            .get<any[]>('https://www.ag-grid.com/example-assets/olympic-winners.json')
            .subscribe((data) => (this.rowData = data));
    }
}
