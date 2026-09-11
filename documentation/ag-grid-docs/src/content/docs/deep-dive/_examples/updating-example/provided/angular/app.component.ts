import { httpResource } from '@angular/common/http';
import { Component } from '@angular/core';

import { AgGridAngular } from 'ag-grid-angular';
import type { ColDef } from 'ag-grid-community';
import { AllCommunityModule, ModuleRegistry, enableDevValidations } from 'ag-grid-community';

if (process.env.NODE_ENV !== 'production') {
    // Enable extended validations only for development
    enableDevValidations();
}

ModuleRegistry.registerModules([AllCommunityModule]);

// Row Data Interface
interface IRow {
    mission: string;
    company: string;
    location: string;
    date: string;
    time: string;
    rocket: string;
    price: number;
    successful: boolean;
}

@Component({
    standalone: true,
    imports: [AgGridAngular],
    selector: 'my-app',
    template: `
        <div class="content">
            <!-- The AG Grid component, with Dimensions, CSS Theme, Row Data, and Column Definition -->
            <ag-grid-angular style="width: 100%; height: 550px;" [rowData]="rowData.value()" [columnDefs]="colDefs" />
        </div>
    `,
})
export class AppComponent {
    // Row Data: The data to be displayed.
    rowData = httpResource<IRow[]>(() => 'https://www.ag-grid.com/example-assets/space-mission-data.json');

    // Column Definitions: Defines & controls grid columns.
    colDefs: ColDef[] = [
        { field: 'mission' },
        { field: 'company' },
        { field: 'location' },
        { field: 'date' },
        { field: 'price' },
        { field: 'successful' },
        { field: 'rocket' },
    ];
}
