import { Component, ViewChild } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AllCommunityModules } from '@ag-grid-community/all-modules';
import { ExcelExportModule, exportMultipleSheetsAsExcel } from '@ag-grid-enterprise/excel-export';

import "@ag-grid-community/core/dist/styles/ag-grid.css";
import "@ag-grid-community/core/dist/styles/ag-theme-alpine.css";

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
                                [getRowNodeId]="getRowNodeId"
                                [rowDragManaged]="true"
                                [suppressMoveWhenRowDragging]="true"
                                [animateRows]="true"
                                [rowData]="leftRowData"
                                [columnDefs]="leftColumns"
                                (gridReady)="onGridReady($event, 0)"
                                [modules]="modules">
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
                                [getRowNodeId]="getRowNodeId"
                                [rowDragManaged]="true"
                                [animateRows]="true"
                                [rowData]="rightRowData"
                                [columnDefs]="rightColumns"
                                (gridReady)="onGridReady($event, 1)"
                                [modules]="modules">
                            </ag-grid-angular>
                        </div>
                    </div>
                </div>
            </div>
        </div>`
})
export class AppComponent {

    modules = [...AllCommunityModules, ExcelExportModule];

    rawData = [];
    leftRowData;
    rightRowData = []
    leftApi;
    leftColumnApi;
    rightApi;

    defaultColDef = {
        flex: 1,
        minWidth: 100,
        sortable: true,
        filter: true,
        resizable: true
    };

    leftColumns = [
        {
            rowDrag: true,
            maxWidth: 50,
            suppressMenu: true,
            rowDragText: function (params, dragItemCount) {
                if (dragItemCount > 1) {
                    return dragItemCount + ' athletes';
                }
                return params.rowNode.data.athlete;
            },
        },
        { field: "athlete" },
        { field: "sport" }
    ];

    rightColumns = [
        {
            rowDrag: true,
            maxWidth: 50,
            suppressMenu: true,
            rowDragText: function (params, dragItemCount) {
                if (dragItemCount > 1) {
                    return dragItemCount + ' athletes';
                }
                return params.rowNode.data.athlete;
            },
        },
        { field: "athlete" },
        { field: "sport" },
        {
            suppressMenu: true,
            maxWidth: 50,
            cellRenderer: (params) => {
                var button = document.createElement('i');

                button.addEventListener('click', function () {
                    params.api.applyTransaction({ remove: [params.node.data] });
                });

                button.classList.add('far', 'fa-trash-alt');
                button.style.cursor = 'pointer';

                return button;
            }
        }
    ]

    @ViewChild('eLeftGrid') eLeftGrid;
    @ViewChild('eRightGrid') eRightGrid;

    constructor(private http: HttpClient) {
        this.http.get('https://www.ag-grid.com/example-assets/olympic-winners.json').subscribe(data => {
            const athletes = [];
            let i = 0;

            while (athletes.length < 20 && i < (data as any).length) {
                var pos = i++;
                if (athletes.some(rec => rec.athlete === data[pos].athlete)) { continue; }
                athletes.push(data[pos]);
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

    getRowNodeId = data => data.athlete;

    onGridReady(params, side) {
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
                    remove: nodes.map(function (node) { return node.data; })
                });
            }
        });

        this.leftApi.addRowDropZone(dropZoneParams);
    }

    onExcelExport() {
        var spreadsheets = [];

        spreadsheets.push(
            this.leftApi.getSheetDataForExcel({ sheetName: 'Athletes' }),
            this.rightApi.getSheetDataForExcel({ sheetName: 'Selected Athletes' })
        );

        exportMultipleSheetsAsExcel({
            data: spreadsheets,
            fileName: 'ag-grid.xlsx'
        });
    }

}
