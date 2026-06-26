import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';

import { AgGridAngular } from 'ag-grid-angular';
import {
    ClientSideRowModelModule,
    ColDef,
    FindDetailCellRendererParams,
    FindOptions,
    FirstDataRenderedEvent,
    GetFindMatchesParams,
    GridReadyEvent,
    ModuleRegistry,
    RowApiModule,
    enableDevValidations,
} from 'ag-grid-community';
import { FindModule, MasterDetailModule, ToolbarModule } from 'ag-grid-enterprise';

import { DetailCellRenderer } from './detail-cell-renderer.component';
import './styles.css';

// Enable extended validations only for development
if (process.env.NODE_ENV !== 'production') {
    enableDevValidations();
}

ModuleRegistry.registerModules([FindModule, ToolbarModule, ClientSideRowModelModule, MasterDetailModule, RowApiModule]);

@Component({
    selector: 'my-app',
    standalone: true,
    imports: [AgGridAngular],
    template: `<ag-grid-angular
        style="width: 100%; height: 100%;"
        [columnDefs]="columnDefs"
        [rowData]="rowData"
        [masterDetail]="true"
        [detailCellRenderer]="detailCellRenderer"
        [detailCellRendererParams]="detailCellRendererParams"
        [detailRowHeight]="100"
        [findOptions]="findOptions"
        [toolbar]="toolbar"
        (firstDataRendered)="onFirstDataRendered($event)"
        (gridReady)="onGridReady($event)"
    /> `,
})
export class AppComponent {
    columnDefs: ColDef[] = [
        // group cell renderer needed for expand / collapse icons
        { field: 'name', cellRenderer: 'agGroupCellRenderer' },
        { field: 'account' },
        { field: 'calls' },
    ];
    rowData!: any[];

    detailCellRenderer = DetailCellRenderer;

    detailCellRendererParams: FindDetailCellRendererParams = {
        getFindMatches: (params: GetFindMatchesParams) => {
            return params.getMatchesForValue('My Custom Detail');
        },
    };

    toolbar = {
        items: ['agFindToolbarItem' as const],
    };

    findOptions: FindOptions = {
        searchDetail: true,
    };

    constructor(private http: HttpClient) {}

    onFirstDataRendered(event: FirstDataRenderedEvent) {
        event.api.getDisplayedRowAtIndex(0)?.setExpanded(true);
    }

    onGridReady(params: GridReadyEvent) {
        this.http
            .get<any[]>('https://www.ag-grid.com/example-assets/master-detail-data.json')
            .subscribe((data) => (this.rowData = data));
    }
}
