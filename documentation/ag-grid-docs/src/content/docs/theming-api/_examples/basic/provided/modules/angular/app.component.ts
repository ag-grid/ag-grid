import { AgGridAngular } from '@ag-grid-community/angular';
import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import type { ColDef } from '@ag-grid-community/core';
import { ModuleRegistry } from '@ag-grid-community/core';
import { themeQuartz } from '@ag-grid-community/theming';
import { ColumnsToolPanelModule } from '@ag-grid-enterprise/column-tool-panel';
import { FiltersToolPanelModule } from '@ag-grid-enterprise/filter-tool-panel';
import { SideBarModule } from '@ag-grid-enterprise/side-bar';
import { Component } from '@angular/core';

ModuleRegistry.registerModules([
    ClientSideRowModelModule,
    SideBarModule,
    ColumnsToolPanelModule,
    FiltersToolPanelModule,
]);

@Component({
    standalone: true,
    imports: [AgGridAngular],
    selector: 'my-app',
    template: `
        <ag-grid-angular
            style="height: 100%;"
            [columnDefs]="columnDefs"
            [defaultColDef]="defaultColDef"
            [rowData]="rowData"
            [theme]="theme"
        />
    `,
})
export class AppComponent {
    theme = themeQuartz;

    columnDefs: ColDef[] = [{ field: 'make' }, { field: 'model' }, { field: 'price' }];

    defaultColDef: ColDef = {
        editable: true,
        flex: 1,
        minWidth: 100,
        filter: true,
    };

    rowData: any[] = (() => {
        const rowData: any[] = [];
        for (let i = 0; i < 10; i++) {
            rowData.push({ make: 'Toyota', model: 'Celica', price: 35000 + i * 1000 });
            rowData.push({ make: 'Ford', model: 'Mondeo', price: 32000 + i * 1000 });
            rowData.push({ make: 'Porsche', model: 'Boxster', price: 72000 + i * 1000 });
        }
        return rowData;
    })();
}
