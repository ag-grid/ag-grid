import { Component } from '@angular/core';

import { ICellRendererAngularComp } from 'ag-grid-angular';
import { ICellRendererParams } from 'ag-grid-community';

interface CustomButtonParams extends ICellRendererParams {
    onClick: () => void;
}

@Component({
    standalone: true,
    template: `<button (click)="onClick()">Launch!</button>`,
})
export class CustomButtonComponent implements ICellRendererAngularComp {
    onClick!: () => void;
    agInit(params: CustomButtonParams): void {
        this.onClick = params.onClick;
    }
    refresh(params: CustomButtonParams) {
        return true;
    }
}
