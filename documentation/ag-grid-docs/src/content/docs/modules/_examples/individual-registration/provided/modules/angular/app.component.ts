import { Component } from '@angular/core';

import { AgGridAngular } from 'ag-grid-angular';
import { ClientSideRowModelModule } from 'ag-grid-community';
import type { ColDef } from 'ag-grid-community';
import { ModuleRegistry } from 'ag-grid-community';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-quartz.css';
import { ClipboardModule } from 'ag-grid-enterprise';
import { ExcelExportModule } from 'ag-grid-enterprise';
import { MenuModule } from 'ag-grid-enterprise';
import { SetFilterModule } from 'ag-grid-enterprise';

import './styles.css';

// Register shared Modules globally
ModuleRegistry.registerModules([ClientSideRowModelModule, MenuModule]);

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
                />
            </div>

            <div class="inner-col">
                <ag-grid-angular
                    [class]="themeClass"
                    [defaultColDef]="defaultColDef"
                    [rowData]="leftRowData"
                    [modules]="rightModules"
                    [columnDefs]="columns"
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

const pRandom = (() => {
    // From https://stackoverflow.com/a/3062783
    let seed = 123_456_789;
    const m = 2 ** 32;
    const a = 1_103_515_245;
    const c = 12_345;

    return () => {
        seed = (a * seed + c) % m;
        return seed / m;
    };
})();

let rowIdSequence = 100;
const createRowBlock = () =>
    ['Red', 'Green', 'Blue'].map((color) => ({
        id: rowIdSequence++,
        color: color,
        value1: Math.floor(pRandom() * 100),
    }));
