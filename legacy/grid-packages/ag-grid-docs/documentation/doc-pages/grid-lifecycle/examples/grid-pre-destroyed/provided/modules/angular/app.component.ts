import {Component} from '@angular/core';
import {NgFor, NgIf} from '@angular/common';
// NOTE: Angular CLI does not support component CSS imports: angular-cli/issues/23273
import '@ag-grid-community/styles/ag-grid.css';
import "@ag-grid-community/styles/ag-theme-quartz.css";
import {AgGridAngular} from '@ag-grid-community/angular';
import {ColDef, GridApi, GridOptions, GridPreDestroyedEvent, GridReadyEvent} from '@ag-grid-community/core';
import {TAthlete, getDataSet} from './data';
import './styles.css';

import { ModuleRegistry } from '@ag-grid-community/core';
import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
ModuleRegistry.registerModules([ClientSideRowModelModule])

interface ColumnWidth {
    field: string;
    width: number;
}

@Component({
    standalone: true,
    imports: [AgGridAngular, NgIf, NgFor],
    selector: 'my-app',
    template: `
        <div class="test-container">
            <div class="test-header">
                <div *ngIf="isVisible" id="exampleButtons" style="margin-bottom: 1rem;">
                    <button (click)="updateColumnWidth()">Change Columns Width</button>
                    <button (click)="destroyGrid()">Destroy Grid</button>
                </div>
                <div *ngIf="showPreDestroyState" id="gridPreDestroyedState">
                    State captured on grid pre-destroyed event:<br/>
                    <strong>Column fields and widths</strong>
                    <div className="values">
                        <ul>
                            <li *ngFor="let item of columnsWidthOnPreDestroyed">
                                Field: {{item.field}} | Width: {{item.width}}px
                            </li>
                        </ul>
                    </div>
                    <button (click)="reloadGrid()">Reload Grid</button>
                </div>
            </div>
            <ag-grid-angular
                style="width: 100%; height: 100%;"
                *ngIf="isVisible"
                [class]="themeClass"
                [columnDefs]="columnDefs"
                [defaultColDef]="defaultColDef"
                [rowData]="rowData"
                [gridOptions]="gridOptions"
                (gridReady)="onGridReady($event)"
            ></ag-grid-angular>
        </div>
    `
})

export class AppComponent {
    themeClass = /** DARK MODE START **/document.documentElement?.dataset.defaultTheme || 'ag-theme-quartz'/** DARK MODE END **/;
    public isVisible = true;
    public showPreDestroyState = false;
    private gridApi!: GridApi;

    private gridOptions: GridOptions = {
        onGridPreDestroyed: (params: GridPreDestroyedEvent<TAthlete>) => this.onGridPreDestroyed(params),
    };

    public columnDefs: ColDef[] = [
        {field: 'name', headerName: 'Athlete'},
        {field: 'medals.gold', headerName: 'Gold Medals'},
        {field: 'person.age', headerName: 'Age'},
    ];

    public columnsWidthOnPreDestroyed: ColumnWidth[] = [];

    public defaultColDef: ColDef = {
        editable: true,
    };

    public rowData: any[] | null = getDataSet()

    onGridPreDestroyed(params: GridPreDestroyedEvent<TAthlete>) {
        const allColumns = params.api?.getColumns();
        if (!allColumns) {
            return;
        }
        const currentColumnWidths = allColumns.map(column => ({
            field: column?.getColDef().field || '-',
            width: column?.getActualWidth(),
        }));

        this.columnsWidthOnPreDestroyed = currentColumnWidths;
    }

    updateColumnWidth() {
        if (!this.gridApi) {
            return;
        }
        const newWidths = this.gridApi.getColumns()!.map(column => {
            return { key: column.getColId(), newWidth: Math.round((150 + Math.random() * 100) * 100) / 100 };
        })
        this.gridApi?.setColumnWidths(newWidths);
    }

    destroyGrid() {
        this.isVisible = false;
        this.showPreDestroyState = true;
    }

    reloadGrid() {
        const updatedColDefs = this.columnDefs && this.columnsWidthOnPreDestroyed ?
            this.columnDefs.map(val => {
                const colDef = val as ColDef;
                const result: ColDef = {
                    ...colDef,
                };
                if (colDef.field || colDef.width) {
                    const width = colDef.field
                        ? this.columnsWidthOnPreDestroyed.find(i => i.field == colDef.field)?.width
                        : undefined;

                    result.width = typeof width === 'number' ? width : colDef.width;
                }
                return result;
            }) : this.columnDefs;

        this.columnDefs = updatedColDefs;
        this.columnsWidthOnPreDestroyed = [];
        this.isVisible = true;
        this.showPreDestroyState = false;
    }

    onGridReady(params: GridReadyEvent) {
        this.gridApi = params.api;
    }
}
