import { Component } from '@angular/core';

import { AgGridAngular } from 'ag-grid-angular';
import type { ColDef } from 'ag-grid-community';
import { ModuleRegistry } from 'ag-grid-community';

/** __CHARTS_PLACEHOLDER__START__ */  /** __CHARTS_PLACEHOLDER__END__ */

import {
    /** __PLACEHOLDER__START__ */  /** __PLACEHOLDER__END__ */
} from 'ag-grid-community';
import {
    /** __ENTERPRISE_PLACEHOLDER__START__ */  /** __ENTERPRISE_PLACEHOLDER__END__ */
} from 'ag-grid-enterprise';

ModuleRegistry.registerModules([
    /** __PLACEHOLDER__START__ */  /** __PLACEHOLDER__END__ */
]);

ModuleRegistry.registerModules([
    /** __ENTERPRISE_PLACEHOLDER__START__ */  /** __ENTERPRISE_PLACEHOLDER__END__ */
]);

@Component({
    selector: 'grid-wrapper',
    standalone: true,
    imports: [AgGridAngular],
    template: /*html*/ `HELLO<ag-grid-angular
            style="width: 100%; height: 100%;"
            [rowData]="rowData"
            [columnDefs]="columnDefs"
        /> `,
})
export class GridWrapperComponent {
    public rowData: any[] | null = [{ make: 'Tesla', model: 'Model Y', price: 64950, electric: true, month: 'June' }];
    public columnDefs: ColDef[] = [
        {
            field: 'make',
        },
        { field: 'model' },
        { field: 'price' },
    ];
}
