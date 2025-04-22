import { Component } from '@angular/core';

import { AgGridAngular } from 'ag-grid-angular';
import type { AgModuleName, ColDef, GridReadyEvent } from 'ag-grid-community';
import {
    ClientSideRowModelModule,
    CsvExportModule,
    ModuleRegistry,
    NumberFilterModule,
    TextFilterModule,
    ValidationModule,
} from 'ag-grid-community';
import {
    ClipboardModule,
    ColumnMenuModule,
    ContextMenuModule,
    ExcelExportModule,
    SetFilterModule,
} from 'ag-grid-enterprise';

import './styles.css';

const sharedModules = [
    ClientSideRowModelModule,
    ColumnMenuModule,
    ContextMenuModule,
    ...(process.env.NODE_ENV !== 'production' ? [ValidationModule] : []),
];
const leftModules = [SetFilterModule, ClipboardModule, CsvExportModule];
const rightModules = [TextFilterModule, NumberFilterModule, CsvExportModule, ExcelExportModule];

// Register shared Modules globally
ModuleRegistry.registerModules(sharedModules);

@Component({
    selector: 'my-app',
    standalone: true,
    imports: [AgGridAngular],
    template: `
        <div class="example-wrapper">
            <div class="inner-col">
                <ag-grid-angular
                    [gridId]="'Left'"
                    [defaultColDef]="defaultColDef"
                    [rowData]="leftRowData"
                    [modules]="leftModules"
                    [columnDefs]="columns"
                    (gridReady)="onGridReady($event)"
                />
            </div>

            <div class="inner-col">
                <ag-grid-angular
                    [gridId]="'Right'"
                    [defaultColDef]="defaultColDef"
                    [rowData]="leftRowData"
                    [modules]="rightModules"
                    [columnDefs]="columns"
                    (gridReady)="onGridReady($event)"
                />
            </div>
        </div>
    `,
})
export class AppComponent {
    leftModules = leftModules;
    rightModules = rightModules;
    leftRowData: any[] = [];
    rightRowData: any[] = [];

    defaultColDef: ColDef = {
        flex: 1,
        minWidth: 100,
        filter: true,
        floatingFilter: true,
    };

    columns: ColDef[] = [{ field: 'id' }, { field: 'color' }, { field: 'value1' }];

    constructor() {
        this.leftRowData = createRowBlock();
        this.rightRowData = createRowBlock();
    }

    onGridReady(event: GridReadyEvent) {
        const api = event.api;
        const moduleNames: AgModuleName[] = [
            'ClipboardModule',
            'ClientSideRowModelModule',
            'ColumnMenuModule',
            'ContextMenuModule',
            'CsvExportModule',
            'ExcelExportModule',
            'NumberFilterModule',
            'SetFilterModule',
            'TextFilterModule',
            'IntegratedChartsModule', // Not registered in this example
        ];
        const registered = moduleNames.filter((name) => api.isModuleRegistered(name));
        console.log(api.getGridId(), 'registered:', registered.join(', '));
    }
}

let rowIdSequence = 100;
const createRowBlock = () =>
    ['Red', 'Green', 'Blue'].map((color) => ({
        id: rowIdSequence++,
        color: color,
        value1: Math.floor(Math.random() * 100),
    }));
