import {Component} from "@angular/core";
import {ICellRendererParams} from "@ag-grid-community/core";
import {ICellRendererAngularComp} from "@ag-grid-community/angular";

@Component({
    selector: 'simple-component',
    template: `
        <div [class]="cssClass">
            <button (click)="clicked()">Click</button>
            {{message}}
        </div>`
})
export class FullWidthCellRenderer implements ICellRendererAngularComp {
    private cssClass!: string;
    private message!: string;

    agInit(params: ICellRendererParams): void {
        this.cssClass = params.node.rowPinned ? 'example-full-width-pinned-row' :
            'example-full-width-row';
        this.message = params.node.rowPinned ? `Pinned full width row at index ${params.rowIndex}` :
            `Normal full width row at index${params.rowIndex}`;
    }

    clicked() {
        alert('button clicked')
    }

    refresh() {
        return false
    }
}
