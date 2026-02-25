import { Component } from '@angular/core';

import { AgGridAngular } from 'ag-grid-angular';
import type { ColDef, ValueFormatterParams } from 'ag-grid-community';
import {
    ClientSideRowModelModule,
    ModuleRegistry,
    NumberFilterModule,
    RowSelectionModule,
    TextFilterModule,
    themeQuartz,
} from 'ag-grid-community';

import type { IProduct } from './data';
import { getData } from './data';

ModuleRegistry.registerModules([RowSelectionModule, TextFilterModule, NumberFilterModule, ClientSideRowModelModule]);

@Component({
    standalone: true,
    imports: [AgGridAngular],
    selector: 'my-app',
    template: `
        <div style="height: 100%">
            <ag-grid-angular
                style="height: 100%;"
                [theme]="theme"
                [rowData]="rowData"
                [columnDefs]="columnDefs"
                [defaultColDef]="defaultColDef"
                [rowSelection]="rowSelection"
            />
        </div>
    `,
})
export class AppComponent {
    // Customise the theme with parameters
    theme = themeQuartz.withParams({
        backgroundColor: '#ffffff',
        foregroundColor: '#1a1a1a',
        headerBackgroundColor: '#faf8f5',
        spacing: 10,
        fontSize: 12,
        headerFontSize: 14,
    });

    rowData: IProduct[] = getData();

    columnDefs: ColDef<IProduct>[] = [
        { field: 'productName', headerName: 'Product', minWidth: 180 },
        {
            field: 'salesRevenue',
            headerName: 'Revenue',
            valueFormatter: (params: ValueFormatterParams) =>
                params.value != null ? `$${params.value.toLocaleString()}` : '',
        },
        {
            field: 'profitMargin',
            headerName: 'Margin',
            valueFormatter: (params: ValueFormatterParams) =>
                params.value != null ? `${(params.value * 100).toFixed(0)}%` : '',
        },
        { field: 'status' },
    ];

    defaultColDef: ColDef = {
        flex: 1,
        minWidth: 100,
        filter: true,
    };

    rowSelection = { mode: 'multiRow' as const };
}
