import { Component, ViewChild } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';

import "@ag-grid-community/styles/ag-grid.css";
import "@ag-grid-community/styles/ag-theme-alpine.css";
import { ModuleRegistry, ColDef, ColumnApi, GetRowIdParams, GridApi, GridReadyEvent, ICellRendererParams } from '@ag-grid-community/core';
import { ICellRendererAngularComp } from '@ag-grid-community/angular';

// Register the required feature modules with the Grid
ModuleRegistry.registerModules([ClientSideRowModelModule]);
@Component({
    selector: 'simple-component',
    template: `
        <i class="far fa-trash-alt" style="cursor: pointer" (click)="applyTransaction()"></i>`
})
export class SportRenderer implements ICellRendererAngularComp {
    private params!: ICellRendererParams;
    private value!: string;

    agInit(params: ICellRendererParams): void {
        this.params = params;
    }

    applyTransaction() {
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
            <div class="example-toolbar panel panel-default">
                <div class="panel-body">
                    <input type="radio" id="move" name="radio" checked #eMoveRadio>
                    <label for="move">Remove Source Rows</label>
                    <input type="radio" id="deselect" name="radio" #eDeselectRadio>
                    <label for="deselect">Only Deselect Source Rows</label>
                    <input type="radio" id="none" name="radio">
                    <label for="none">None</label>
                    <input type="checkbox" id="toggleCheck" checked #eSelectCheckbox (change)="checkboxSelectChange()">
                    <label for="toggleCheck">Checkbox Select</label>
                    <span class="input-group-button">
                        <button type="button" class="btn btn-default reset" style="margin-left: 5px;" (click)="reset()">
                            <i class="fas fa-redo" style="margin-right: 5px;"></i>Reset
                        </button>
                    </span>
                </div>
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
                                    [suppressRowClickSelection]="true"
                                    [getRowId]="getRowId"
                                    [rowDragManaged]="true"
                                    [suppressMoveWhenRowDragging]="true"
                                    [animateRows]="true"
                                    [rowData]="leftRowData"
                                    [columnDefs]="leftColumns"
                                    (gridReady)="onGridReady($event, 0)">
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
                                    (gridReady)="onGridReady($event, 1)">
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
        {
            colId: 'checkbox',
            maxWidth: 50,
            checkboxSelection: true,
            suppressMenu: true,
            headerCheckboxSelection: true
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
    @ViewChild('eMoveRadio') eMoveRadio: any;
    @ViewChild('eDeselectRadio') eDeselectRadio: any;
    @ViewChild('eSelectCheckbox') eSelectCheckbox: any;

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
        this.leftRowData = [...this.rawData];
        this.rightRowData = [];
    }

    reset = () => {
        this.eMoveRadio.nativeElement.checked = true;

        if (!this.eSelectCheckbox.nativeElement.checked) {
            this.eSelectCheckbox.nativeElement.click();
        }

        this.loadGrids();
    }

    checkboxSelectChange = () => {
        const checked = this.eSelectCheckbox.nativeElement.checked;
        this.leftColumnApi.setColumnVisible('checkbox', checked);
        this.leftApi.setSuppressRowClickSelection(checked);
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
                var deselectCheck = this.eDeselectRadio.nativeElement.checked;
                var moveCheck = this.eMoveRadio.nativeElement.checked;
                var nodes = params.nodes;

                if (moveCheck) {
                    this.leftApi.applyTransaction({
                        remove: nodes.map(function (node) {
                            return node.data;
                        })
                    });
                } else if (deselectCheck) {
                    nodes.forEach(function (node) {
                        node.setSelected(false);
                    });
                }
            }
        });

        this.leftApi.addRowDropZone(dropZoneParams);
    }

}
