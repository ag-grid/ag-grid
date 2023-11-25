import {Component} from '@angular/core';
// NOTE: Angular CLI does not support component CSS imports: angular-cli/issues/23273
import '@ag-grid-community/styles/ag-grid.css';
import "@ag-grid-community/styles/ag-theme-quartz.css";
import {ColDef, GridApi, GridOptions, GridPreDestroyedEvent, GridReadyEvent} from '@ag-grid-community/core';
import {TAthlete, getDataSet} from './data';
import '../styles.css';

// Required feature modules are registered in app.module.ts

interface ColumnWidth {
    field: string;
    width: number;
}

@Component({
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
        this.gridApi.getColumns()!.forEach(column => {
            const newRandomWidth = Math.round((150 + Math.random() * 100) * 100) / 100;
            this.gridApi?.setColumnWidth(column, newRandomWidth);
        });
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
