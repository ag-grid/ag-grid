import {Component} from '@angular/core';
import {ICellRendererAngularComp} from "@ag-grid-community/angular";

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
    // called on init
    agInit(params: any): void {
        this.params = params;

        this.masterGridApi = params.api;
        this.rowId = params.node.id;

        this.colDefs = [
            {field: 'callId'},
            {field: 'direction'},
            {field: 'number'},
            {field: 'duration', valueFormatter: "x.toLocaleString() + 's'"},
            {field: 'switchCode'}
        ];

        this.defaultColDef = {
            flex: 1,
            minWidth: 150
        };

        this.rowData = params.data.callRecords;
    }

    // called when the cell is refreshed
    refresh(params: any): boolean {
        return false;
    }

    onGridReady(params) {
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
