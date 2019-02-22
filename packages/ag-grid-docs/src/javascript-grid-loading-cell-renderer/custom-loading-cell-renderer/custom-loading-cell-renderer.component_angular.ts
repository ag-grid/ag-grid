import { Component } from '@angular/core';
import { ICellRenderer } from "ag-grid-angular";

@Component({
    selector: 'app-loading-cell-renderer',
    template: `<div class="ag-custom-loading-cell" style="padding-left: 10px; line-height: 25px;">` +
              `   <i class="fas fa-spinner fa-pulse"></i> <span> {{this.params.loadingMessage}} </span>` +
              `</div>`
})
export class CustomLoadingCellRenderer implements ICellRenderer {

    private params: any;

    agInit(params): void {
        this.params = params;
    }
}