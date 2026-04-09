import { Component } from '@angular/core';

import { AgGridAngular } from 'ag-grid-angular';
import type { ColDef, SideBarDef, Toolbar } from 'ag-grid-community';
import {
    ClientSideRowModelModule,
    ColumnAutoSizeModule,
    CsvExportModule,
    ModuleRegistry,
    QuickFilterModule,
    TextFilterModule,
    ValidationModule,
} from 'ag-grid-community';
import {
    ColumnMenuModule,
    ColumnsToolPanelModule,
    ExcelExportModule,
    FiltersToolPanelModule,
    FindModule,
    NewFiltersToolPanelModule,
    PivotModule,
    RowGroupingModule,
    RowGroupingPanelModule,
    SideBarModule,
    ToolbarModule,
} from 'ag-grid-enterprise';

import { OverflowMenu } from './overflow-menu.component';
import './styles.css';

ModuleRegistry.registerModules([
    TextFilterModule,
    ClientSideRowModelModule,
    ColumnAutoSizeModule,
    CsvExportModule,
    QuickFilterModule,
    ColumnMenuModule,
    ColumnsToolPanelModule,
    ExcelExportModule,
    FiltersToolPanelModule,
    FindModule,
    NewFiltersToolPanelModule,
    PivotModule,
    RowGroupingModule,
    RowGroupingPanelModule,
    SideBarModule,
    ToolbarModule,
    ...(process.env.NODE_ENV !== 'production' ? [ValidationModule] : []),
]);

@Component({
    selector: 'my-app',
    standalone: true,
    imports: [AgGridAngular],
    template: `
        <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px">
            <label for="widthSlider">Grid width:</label>
            <input
                type="range"
                id="widthSlider"
                min="30"
                max="100"
                [value]="widthValue"
                style="flex: 1"
                (input)="onWidthSliderChange($event)"
            />
            <span>{{ widthValue }}%</span>
        </div>
        <div id="myGrid" [style.max-width]="widthValue + '%'" style="height: calc(100% - 40px)">
            <ag-grid-angular
                style="width: 100%; height: 100%"
                [columnDefs]="columnDefs"
                [defaultColDef]="defaultColDef"
                [enableFilterHandlers]="true"
                [sideBar]="sideBar"
                [toolbar]="toolbar"
                [rowData]="rowData"
            />
        </div>
    `,
})
export class AppComponent {
    widthValue = '100';
    rowData: any[] = [];

    columnDefs: ColDef[] = [
        { field: 'athlete', minWidth: 200 },
        { field: 'country', minWidth: 200 },
        { field: 'sport', minWidth: 200 },
        { field: 'year' },
        { field: 'gold', enableValue: true },
        { field: 'silver', enableValue: true },
        { field: 'bronze', enableValue: true },
        { field: 'total' },
    ];

    defaultColDef: ColDef = {
        flex: 1,
        minWidth: 100,
        filter: true,
        enableRowGroup: true,
        enablePivot: true,
    };

    sideBar: SideBarDef = {
        toolPanels: ['columns', 'filters-new'],
        defaultToolPanel: '',
    };

    toolbar: Toolbar = {
        items: [
            'rowGroupPanel',
            'pivotPanel',
            'separator',
            'columnChooser',
            'autoSizeAll',
            { component: 'quickFilter', alignment: 'right' },
            { component: 'find', alignment: 'right' },
            'separator',
            { component: 'columnsPanel', alignment: 'right' },
            { component: 'filtersPanel', alignment: 'right' },
            'separator',
            { component: 'export', alignment: 'right' },
            'separator',
            { component: 'resetColumns', alignment: 'right' },
            { component: OverflowMenu, key: 'overflowMenu', alignment: 'right' },
        ],
    };

    constructor() {
        fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
            .then((response) => response.json())
            .then((data) => (this.rowData = data));
    }

    onWidthSliderChange(event: Event): void {
        this.widthValue = (event.target as HTMLInputElement).value;
    }
}
