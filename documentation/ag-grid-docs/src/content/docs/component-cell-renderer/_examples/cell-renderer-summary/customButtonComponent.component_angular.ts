import { Component } from '@angular/core';

import { ICellRendererAngularComp } from 'ag-grid-angular';
import { ICellRendererParams } from 'ag-grid-community';

@Component({
    standalone: true,
    template: `<button (click)="buttonClicked()">Launch!</button>`,
})
export class CustomButtonComponent implements ICellRendererAngularComp {
    agInit(params: ICellRendererParams): void {}
    refresh(params: ICellRendererParams) {
        return true;
    }
    buttonClicked() {
        alert('Software Launched');
    }
}
