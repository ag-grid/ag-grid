import { AgGridAngular } from '@ag-grid-community/angular';
import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import { ColDef, CommunityFeaturesModule, ModuleRegistry } from '@ag-grid-community/core';
import '@ag-grid-community/styles/ag-grid.css';
import '@ag-grid-community/styles/ag-theme-quartz.css';
import { GridChartsModule } from '@ag-grid-enterprise/charts-enterprise';
import { ClipboardModule } from '@ag-grid-enterprise/clipboard';
import { ExcelExportModule } from '@ag-grid-enterprise/excel-export';
import { MenuModule } from '@ag-grid-enterprise/menu';
import { SetFilterModule } from '@ag-grid-enterprise/set-filter';
import { Component } from '@angular/core';

import './styles.css';

// Register shared Modules globally
ModuleRegistry.registerModules([CommunityFeaturesModule, ClientSideRowModelModule, MenuModule, GridChartsModule]);

@Component({
    selector: 'my-app',
    standalone: true,
    imports: [AgGridAngular],
    template: `
        <div class="example-wrapper">
            <div class="inner-col">
                <ag-grid-angular
                    [class]="themeClass"
                    [defaultColDef]="defaultColDef"
                    [rowData]="leftRowData"
                    [modules]="leftModules"
                    [columnDefs]="columns"
                    enableRangeSelection
                    enableCharts
                />
            </div>

            <div class="inner-col">
                <ag-grid-angular
                    [class]="themeClass"
                    [defaultColDef]="defaultColDef"
                    [rowData]="leftRowData"
                    [modules]="rightModules"
                    [columnDefs]="columns"
                    enableRangeSelection
                    enableCharts
                />
            </div>
        </div>
    `,
})
export class AppComponent {
    themeClass =
        /** DARK MODE START **/ document.documentElement?.dataset.defaultTheme ||
        'ag-theme-quartz' /** DARK MODE END **/;
    leftModules = [SetFilterModule, ClipboardModule];
    rightModules = [ExcelExportModule];
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
}

let rowIdSequence = 100;
const createRowBlock = () =>
    ['Red', 'Green', 'Blue'].map((color) => ({
        id: rowIdSequence++,
        color: color,
        value1: Math.floor(Math.random() * 100),
    }));
