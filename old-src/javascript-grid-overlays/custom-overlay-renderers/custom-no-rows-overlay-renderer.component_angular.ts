import { Component } from '@angular/core';
import {ICellRendererAngularComp} from "ag-grid-angular";

@Component({
    selector: 'app-no-rows-overlay',
    template: `<div>No Rows</div>`
})
export class CustomNoRowsOverlayRenderer implements ICellRendererAngularComp {
    agInit(params: any): void {}

    refresh(params: any): boolean {
        return false;
    }
}