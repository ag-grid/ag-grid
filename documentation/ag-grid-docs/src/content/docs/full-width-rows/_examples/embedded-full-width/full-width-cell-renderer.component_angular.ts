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
        this.cssClass = params.pinned ? 'example-full-width-pinned' : 'example-full-width-row';
        this.message = params.pinned
            ? `Pinned full width on ${params.pinned} - index ${params.node.rowIndex}`
            : `Non pinned full width row at index ${params.node.rowIndex}`;
    }

    clicked() {
        alert('button clicked');
    }

    refresh() {
        return false;
    }
}
