import { ICellRendererAngularComp } from '@ag-grid-community/angular';
import { ICellRendererParams } from '@ag-grid-community/core';
import { Component } from '@angular/core';

@Component({
    standalone: true,
    template: ` <div [class]="cssClass">
        <button (click)="clicked()">Click</button>
        {{ message }}
    </div>`,
})
export class FullWidthCellRenderer implements ICellRendererAngularComp {
    public cssClass!: string;
    public message!: string;

    agInit(params: ICellRendererParams): void {
        this.cssClass = params.node.rowPinned ? 'example-full-width-pinned-row' : 'example-full-width-row';
        this.message = params.node.rowPinned
            ? `Pinned full width row at index ${params.node.rowIndex}`
            : `Normal full width row at index ${params.node.rowIndex}`;
    }

    clicked() {
        alert('button clicked');
    }

    refresh() {
        return false;
    }
}
