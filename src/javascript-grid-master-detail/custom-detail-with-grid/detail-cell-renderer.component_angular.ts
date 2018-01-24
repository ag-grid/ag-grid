import { Component } from '@angular/core';
import { ICellRendererAngularComp } from "ag-grid-angular";

@Component({
    selector: 'app-detail-cell-renderer',
    template: `<div class="full-width-panel">` +
            `  <div class="full-width-details">` +
            `    <div class="full-width-detail"><b>Name: </b>{{params.data.name}}</div>` +
            `    <div class="full-width-detail"><b>Account: </b>{{params.data.account}}</div>` +
            `  </div>`+
            ` <ag-grid-angular`+
                ` #agGrid ` +
                ` style="width: 100%; height: 100%;"` +
                ` id="detailGrid"` +
                ` class="full-width-grid"` +
                ` [columnDefs]="colDefs"` +
                ` [rowData]="rowData">`+
            `</ag-grid-angular>` +
            `  <div class="full-width-grid-toolbar">` +
            `       <img class="full-width-phone-icon" src="https://raw.githubusercontent.com/ag-grid/ag-grid-docs/master/src/images/phone.png"/>` +
            `       <button><img src="https://raw.githubusercontent.com/ag-grid/ag-grid-docs/master/src/images/fire.png"/></button>` +
            `       <button><img src="https://raw.githubusercontent.com/ag-grid/ag-grid-docs/master/src/images/frost.png"/></button>` +
            `       <button><img src="https://raw.githubusercontent.com/ag-grid/ag-grid-docs/master/src/images/sun.png"/></button>` +
            `  </div>`+
            `</div>`
})
export class DetailCellRenderer implements ICellRendererAngularComp {
    // called on init
    agInit(params: any): void {
        this.params = params;
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
}