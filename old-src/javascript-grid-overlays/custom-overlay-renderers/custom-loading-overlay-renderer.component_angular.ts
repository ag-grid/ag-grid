import { Component } from '@angular/core';
import {ICellRendererAngularComp} from "ag-grid-angular";

@Component({
    selector: 'app-loading-overlay',
    template: `<div>Loading...</div>`
})
export class CustomLoadingOverlayRenderer implements ICellRendererAngularComp {
    agInit(params: any): void {}

    refresh(params: any): boolean {
        return false;
    }
}