import { Component } from '@angular/core';
import { ICellRendererAngularComp } from "@ag-grid-community/angular";
import { ColDef, GridApi, GridReadyEvent, ICellRendererParams } from '@ag-grid-community/core';

@Component({
    selector: 'app-detail-cell-renderer',
    template: `
        <div class="full-width-panel">
             <div class="full-width-details">
                <div class="full-width-detail"><b>Name: </b>{{params.data.name}}</div>
                <div class="full-width-detail"><b>Account: </b>{{params.data.account}}</div>
              </div>
             <ag-grid-angular
                 #agGrid 
                 style="height: 100%;"
                 id="detailGrid"
                 class="full-width-grid ag-theme-alpine"
                 [columnDefs]="colDefs"
                 [defaultColDef]="defaultColDef"
                 [rowData]="rowData"
                 (gridReady)="onGridReady($event)"
             >
            </ag-grid-angular>
        </div>`
})
export class DetailCellRenderer implements ICellRendererAngularComp {
    params!: ICellRendererParams;
    masterGridApi!: GridApi;
    rowId!: string;
    colDefs!: ColDef[];
    defaultColDef!: ColDef;
    rowData!: any[];

    // called on init
    agInit(params: ICellRendererParams): void {
        this.params = params;

        this.masterGridApi = params.api;
        this.rowId = params.node.id!;

        this.colDefs = [
            { field: 'callId' },
            { field: 'direction' },
            { field: 'number' },
            { field: 'duration', valueFormatter: "x.toLocaleString() + 's'" },
            { field: 'switchCode' }
        ];

        this.defaultColDef = {
            flex: 1,
            minWidth: 120
        };

        this.rowData = params.data.callRecords;
    }

    // called when the cell is refreshed
    refresh(params: ICellRendererParams): boolean {
        return false;
    }

    onGridReady(params: GridReadyEvent) {
        var gridInfo = {
            id: this.rowId,
            api: params.api,
            columnApi: params.columnApi
        };

        console.log("adding detail grid info with id: ", this.rowId);
        this.masterGridApi.addDetailGridInfo(this.rowId, gridInfo);
    }

    ngOnDestroy(): void {
        // detail grid is automatically destroyed as it is an Angular component

        console.log("removing detail grid info with id: ", this.rowId);
        this.masterGridApi.removeDetailGridInfo(this.rowId);
    }
}
