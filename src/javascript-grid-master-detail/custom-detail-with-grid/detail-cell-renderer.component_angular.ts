import {Component} from '@angular/core';
import {ICellRendererAngularComp} from "ag-grid-angular";

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
                 style="width: 100%; height: 100%;"
                 id="detailGrid"
                 class="full-width-grid"
                 [columnDefs]="colDefs"
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
        this.masterRowIndex = params.rowIndex;

        this.colDefs = [
            {field: 'callId'},
            {field: 'direction'},
            {field: 'number'},
            {field: 'duration', valueFormatter: "x.toLocaleString() + 's'"},
            {field: 'switchCode'}
        ];
        this.rowData = params.data.callRecords;
    }

    // called when the cell is refreshed
    refresh(params: any): boolean {
        return false;
    }

    onGridReady(params) {
        var detailGridId = "detail_" + this.masterRowIndex;

        var gridInfo = {
            id: detailGridId,
            api: params.api,
            columnApi: params.columnApi
        };

        console.log("adding detail grid info with id: ", detailGridId);
        this.masterGridApi.addDetailGridInfo(detailGridId, gridInfo);
    }

    ngOnDestroy(): void {
        var detailGridId = "detail_" + this.masterRowIndex;

        // ag-Grid is automatically destroyed

        console.log("removing detail grid info with id: ", detailGridId);
        this.masterGridApi.removeDetailGridInfo(detailGridId);
    }
}