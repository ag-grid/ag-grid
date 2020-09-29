import {Component} from '@angular/core';
import {ICellRendererAngularComp} from "@ag-grid-community/angular";

@Component({
    selector: 'app-detail-cell-renderer',
    template: `<h1 class="custom-detail" style="padding: 20px;">{{pinned}}</h1>`
})
export class DetailCellRenderer implements ICellRendererAngularComp {

    pinned: string;

    agInit(params: any): void {
        this.pinned = params.pinned ? params.pinned : 'center';
    }

    refresh(params: any): boolean { return false; }
}
