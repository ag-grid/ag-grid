import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';

import { AgGridAngular } from 'ag-grid-angular';
import {
    ClientSideRowModelModule,
    ColDef,
    FirstDataRenderedEvent,
    GetFindTextParams,
    GridReadyEvent,
    ModuleRegistry,
    enableDevValidations,
} from 'ag-grid-community';
import { FindModule, ToolbarModule } from 'ag-grid-enterprise';

import { FindRenderer } from './find-renderer.component';
import './styles.css';

// Enable extended validations only for development
if (process.env.NODE_ENV !== 'production') {
    enableDevValidations();
}

ModuleRegistry.registerModules([FindModule, ToolbarModule, ClientSideRowModelModule]);

@Component({
    selector: 'my-app',
    standalone: true,
    imports: [AgGridAngular, FindRenderer],
    template: `<ag-grid-angular
        style="width: 100%; height: 100%;"
        [columnDefs]="columnDefs"
        [rowData]="rowData"
        [findSearchValue]="findSearchValue"
        [toolbar]="toolbar"
        (gridReady)="onGridReady($event)"
        (firstDataRendered)="onFirstDataRendered($event)"
    /> `,
})
export class AppComponent {
    columnDefs: ColDef[] = [
        { field: 'athlete' },
        { field: 'country' },
        {
            field: 'year',
            cellRenderer: FindRenderer,
            getFindText: (params: GetFindTextParams) => {
                const cellValue = params.getValueFormatted() ?? params.value?.toString();
                if (!cellValue?.length) {
                    return null;
                }
                return `Year is ${cellValue}`;
            },
        },
    ];
    rowData!: any[];

    findSearchValue: string = 'e';

    toolbar = {
        items: ['agFindToolbarItem' as const],
    };

    constructor(private http: HttpClient) {}

    onFirstDataRendered(event: FirstDataRenderedEvent) {
        event.api.findNext();
    }

    onGridReady(params: GridReadyEvent) {
        this.http
            .get<any[]>('https://www.ag-grid.com/example-assets/olympic-winners.json')
            .subscribe((data) => (this.rowData = data));
    }
}
