import { Component, ViewChild } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ExcelExportModule, exportMultipleSheetsAsExcel } from '@ag-grid-enterprise/excel-export';
import { ModuleRegistry, ColDef, ColumnApi, GetRowIdParams, GridApi, GridReadyEvent, ICellRendererComp, ICellRendererParams } from '@ag-grid-community/core';
import { ICellRendererAngularComp } from '@ag-grid-community/angular';

import "@ag-grid-community/styles/ag-grid.css";
import "@ag-grid-community/styles/ag-theme-alpine.css";

import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import { MenuModule } from '@ag-grid-enterprise/menu';

// Register the required feature modules with the Grid
ModuleRegistry.registerModules([ClientSideRowModelModule, ExcelExportModule, MenuModule])

@Component({
    selector: 'simple-component',
    template: `
        <i class="far fa-trash-alt" style="cursor: pointer" (click)="applyTransaction()"></i>
    `
})
export class SportRenderer implements ICellRendererAngularComp {
    private params!: ICellRendererParams;
    private value!: string;

    agInit(params: ICellRendererParams): void {
        this.params = params;
    }

    applyTransaction() {
        console.log("here!!");
        this.params.api.applyTransaction({ remove: [this.params.node.data] });
    }

    refresh() {
        return false
    }
}

@Component({
    selector: 'my-app',
    template: /*html */ `
        <div class="top-container">
            <div>
                <button type="button" class="btn btn-default excel" style="margin-right: 5px;" (click)="onExcelExport()">
                    <i class="far fa-file-excel" style="margin-right: 5px; color: green;"></i>Export to Excel
                </button>
                <button type="button" class="btn btn-default reset" (click)="reset()">
                    <i class="fas fa-redo" style="margin-right: 5px;"></i>Reset
                </button>
            </div>
            <div class="grid-wrapper ag-theme-alpine">
                <div class="panel panel-primary" style="margin-right: 10px;">
                    <div class="panel-heading">Athletes</div>
                    <div class="panel-body">
                        <div id="eLeftGrid">
                            <ag-grid-angular
                                    style="height: 100%;"
                                    [defaultColDef]="defaultColDef"
                                    rowSelection="multiple"
                                    [rowDragMultiRow]="true"
                                    [getRowId]="getRowId"
                                    [rowDragManaged]="true"
                                    [suppressMoveWhenRowDragging]="true"
                                    [animateRows]="true"
                                    [rowData]="leftRowData"
                                    [columnDefs]="leftColumns"
                                    (gridReady)="onGridReady($event, 0)"
                                    >
                            </ag-grid-angular>
                        </div>
                    </div>
                </div>
                <div class="panel panel-primary" style="margin-left: 10px;">
                    <div class="panel-heading">Selected Athletes</div>
                    <div class="panel-body">
                        <div id="eRightGrid">
                            <ag-grid-angular
                                    style="height: 100%;"
                                    [defaultColDef]="defaultColDef"
                                    [getRowId]="getRowId"
                                    [rowDragManaged]="true"
                                    [animateRows]="true"
                                    [rowData]="rightRowData"
                                    [columnDefs]="rightColumns"
                                    (gridReady)="onGridReady($event, 1)"
                                    >
                            </ag-grid-angular>
                        </div>
                    </div>
                </div>
            </div>
        </div>`
})
export class AppComponent {

    rawData: any[] = [];
    leftRowData: any[] = [];
    rightRowData: any[] = []
    leftApi!: GridApi;
    leftColumnApi!: ColumnApi;
    rightApi!: GridApi;

    defaultColDef: ColDef = {
        flex: 1,
        minWidth: 100,
        sortable: true,
        filter: true,
        resizable: true
    };

    leftColumns: ColDef[] = [
        {
            rowDrag: true,
            maxWidth: 50,
            suppressMenu: true,
            rowDragText: (params, dragItemCount) => {
                if (dragItemCount > 1) {
                    return dragItemCount + ' athletes';
                }
                return params.rowNode!.data.athlete;
            },
        },
        { field: "athlete" },
        { field: "sport" }
    ];

    rightColumns: ColDef[] = [
        {
            rowDrag: true,
            maxWidth: 50,
            suppressMenu: true,
            rowDragText: (params, dragItemCount) => {
                if (dragItemCount > 1) {
                    return dragItemCount + ' athletes';
                }
                return params.rowNode!.data.athlete;
            },
        },
        { field: "athlete" },
        { field: "sport" },
        {
            suppressMenu: true,
            maxWidth: 50,
            cellRenderer: SportRenderer
        }
    ]

    @ViewChild('eLeftGrid') eLeftGrid: any;
    @ViewChild('eRightGrid') eRightGrid: any;

    constructor(private http: HttpClient) {
        this.http.get('https://www.ag-grid.com/example-assets/olympic-winners.json').subscribe(data => {
            const athletes: any[] = [];
            let i = 0;
            const dataArray = data as any[];
            while (athletes.length < 20 && i < dataArray.length) {
                var pos = i++;
                if (athletes.some(rec => rec.athlete === dataArray[pos].athlete)) {
                    continue;
                }
                athletes.push(dataArray[pos]);
            }
            this.rawData = athletes;
            this.loadGrids();
        });
    }

    loadGrids = () => {
        this.leftRowData = [...this.rawData.slice(0, this.rawData.length / 2)];
        this.rightRowData = [...this.rawData.slice(this.rawData.length / 2)];
    }

    reset = () => {
        this.loadGrids();
    }

    getRowId = (params: GetRowIdParams) => params.data.athlete;

    onGridReady(params: GridReadyEvent, side: number) {
        if (side === 0) {
            this.leftApi = params.api
            this.leftColumnApi = params.columnApi;
        }

        if (side === 1) {
            this.rightApi = params.api;
            this.addGridDropZone();
        }
    }

    addGridDropZone() {
        const dropZoneParams = this.rightApi.getRowDropZoneParams({
            onDragStop: params => {
                var nodes = params.nodes;

                this.leftApi.applyTransaction({
                    remove: nodes.map(function (node) {
                        return node.data;
                    })
                });
            }
        });

        this.leftApi.addRowDropZone(dropZoneParams);
    }

    onExcelExport() {
        var spreadsheets = [];

        spreadsheets.push(
            this.leftApi.getSheetDataForExcel({ sheetName: 'Athletes' })!,
            this.rightApi.getSheetDataForExcel({ sheetName: 'Selected Athletes' })!
        );

        exportMultipleSheetsAsExcel({
            data: spreadsheets,
            fileName: 'ag-grid.xlsx'
        });
    }

}
