import { Component } from '@angular/core';

import { AgGridAngular } from 'ag-grid-angular';
import type { CellClassRules, ColDef, ValueFormatterParams } from 'ag-grid-community';
import {
    CellStyleModule,
    ClientSideRowModelModule,
    ModuleRegistry,
    NumberFilterModule,
    RowSelectionModule,
    TextFilterModule,
    iconSetMaterial,
    themeQuartz,
} from 'ag-grid-community';

import type { IProduct } from './data';
import { getData } from './data';
import './styles.css';

ModuleRegistry.registerModules([
    CellStyleModule,
    RowSelectionModule,
    TextFilterModule,
    NumberFilterModule,
    ClientSideRowModelModule,
]);

// Cell class rules for status column
const statusCellClassRules: CellClassRules = {
    'status-delivered': (params) => params.value === 'Delivered',
    'status-pending': (params) => params.value === 'Pending',
    'status-cancelled': (params) => params.value === 'Cancelled',
};

@Component({
    standalone: true,
    imports: [AgGridAngular],
    selector: 'my-app',
    template: `
        <div style="height: 100%; display: flex; flex-direction: column">
            <p style="flex: 0 1 0%">
                <button class="ag-toggleButton" (click)="setThemeMode()">
                    {{ themeMode === 'dark' ? 'Enable Light Mode' : 'Enable Dark Mode' }}
                </button>
            </p>
            <div style="flex: 1 1 0%">
                <ag-grid-angular
                    style="height: 100%;"
                    [theme]="theme"
                    [rowData]="rowData"
                    [columnDefs]="columnDefs"
                    [defaultColDef]="defaultColDef"
                    [rowSelection]="rowSelection"
                />
            </div>
        </div>
    `,
})
export class AppComponent {
    themeMode: 'light' | 'dark' = 'light';

    // Create a theme with light and dark modes
    theme = themeQuartz
        .withPart(iconSetMaterial)
        .withParams(
            {
                backgroundColor: '#ffffff',
                foregroundColor: '#1a1a1a',
                headerBackgroundColor: '#faf8f5',
                selectedRowBackgroundColor: 'rgba(14, 68, 145, 0.15)',
                spacing: 10,
                fontSize: 12,
                headerFontSize: 14,
            },
            'light'
        )
        .withParams(
            {
                backgroundColor: '#1e1e2f',
                foregroundColor: '#e2e8f0',
                headerBackgroundColor: '#2d2d44',
                selectedRowBackgroundColor: 'rgba(110, 168, 254, 0.2)',
                spacing: 10,
                fontSize: 12,
                headerFontSize: 14,
            },
            'dark'
        );

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
        {
            field: 'status',
            cellClassRules: statusCellClassRules,
        },
    ];

    defaultColDef: ColDef = {
        flex: 1,
        minWidth: 100,
        filter: true,
    };

    rowSelection = { mode: 'multiRow' as const };

    ngOnInit() {
        document.body.dataset.agThemeMode = this.themeMode;
    }

    setThemeMode() {
        this.themeMode = this.themeMode === 'dark' ? 'light' : 'dark';
        document.body.dataset.agThemeMode = this.themeMode;
    }
}
