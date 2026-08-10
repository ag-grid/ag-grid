import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';

import { AgGridAngular } from 'ag-grid-angular';
import type { ColDef, GridReadyEvent } from 'ag-grid-community';
import { ModuleRegistry, enableDevValidations } from 'ag-grid-community';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import 'ag-grid-community/styles/ag-theme-balham.css';
import 'ag-grid-community/styles/ag-theme-material.css';
import 'ag-grid-community/styles/ag-theme-quartz.css';
import { AllEnterpriseModule } from 'ag-grid-enterprise';

import './styles.css';

if (process.env.NODE_ENV !== 'production') {
    // Enable extended validations only for development
    enableDevValidations();
}

ModuleRegistry.registerModules([AllEnterpriseModule]);

@Component({
    standalone: true,
    imports: [AgGridAngular],
    selector: 'my-app',
    template: `
        <div class="example-wrapper">
            <div class="example-header">
                <span class="button-group">
                    <button (click)="applyTheme('quartz', false)">Quartz</button>
                    <button (click)="applyTheme('quartz', true)">Quartz Dark</button>
                    <button (click)="applyTheme('alpine', false)">Alpine</button>
                    <button (click)="applyTheme('alpine', true)">Alpine Dark</button>
                    <button (click)="applyTheme('balham', false)">Balham</button>
                    <button (click)="applyTheme('balham', true)">Balham Dark</button>
                    <button (click)="applyTheme('material', false)">Material</button>
                    <button (click)="applyTheme('material', true)">Material Dark</button>
                </span>
            </div>
            <div id="myGrid" [class]="themeClass">
                <ag-grid-angular
                    style="height: 100%"
                    [theme]="'legacy'"
                    [columnDefs]="columnDefs"
                    [rowData]="rowData"
                    (gridReady)="onGridReady($event)"
                />
            </div>
        </div>
    `,
})
export class AppComponent {
    themeClass = 'ag-theme-quartz';

    columnDefs: ColDef[] = [
        { field: 'athlete' },
        { field: 'country' },
        { field: 'sport' },
        { field: 'year' },
        { field: 'total' },
    ];

    rowData!: IOlympicData[];

    constructor(private http: HttpClient) {}

    applyTheme(theme: string, isDark: boolean) {
        this.themeClass = `ag-theme-${theme}${isDark ? '-dark' : ''}`;
    }

    onGridReady(_params: GridReadyEvent<IOlympicData>) {
        this.http
            .get<IOlympicData[]>('https://www.ag-grid.com/example-assets/olympic-winners.json')
            .subscribe((data) => (this.rowData = data));
    }
}
