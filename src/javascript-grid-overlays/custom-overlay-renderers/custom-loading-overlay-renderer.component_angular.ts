import { Component } from '@angular/core';
import { ICellRendererAngularComp } from "ag-grid-angular";

@Component({
    selector: 'app-loading-overlay',
    template: `<div class="ag-overlay-loading-center" style="background-color: lightsteelblue; height: 9%">` +
              `   <i class="fa fa-hourglass-1"> One moment please...</i>` +
              `</div>`
})
export class CustomLoadingOverlayRenderer implements ICellRendererAngularComp {
    agInit(params: any): void {}
    refresh(): boolean {
        return false;
    }
}