import { Component, viewChild } from '@angular/core';

import { AgGridAngular } from 'ag-grid-angular';
import { AllCommunityModule, ColDef, ModuleRegistry } from 'ag-grid-community';

ModuleRegistry.registerModules([AllCommunityModule]);

@Component({
    selector: 'app-root',
    imports: [AgGridAngular],
    template: ` <ag-grid-angular style="height: 200px;" [rowData]="rowData" [columnDefs]="columnDefs" /> `,
})
export class App {
    rowData: any[] = [{ name: 'Test Name', number: 42 }];
    columnDefs: ColDef[] = [{ field: 'name' }, { field: 'number' }];
    public agGrid = viewChild(AgGridAngular);
}
