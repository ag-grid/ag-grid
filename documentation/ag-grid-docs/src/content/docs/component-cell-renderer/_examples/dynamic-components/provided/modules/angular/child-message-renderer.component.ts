import { Component } from '@angular/core';

import type { ICellRendererAngularComp } from 'ag-grid-angular';
import type { ICellRendererParams } from 'ag-grid-community';

@Component({
    standalone: true,
    selector: 'child-cell',
    template: `<span
        ><button style="height: 20px" (click)="invokeParentMethod()" class="btn btn-info">Invoke Parent</button></span
    >`,
    styles: [
        `
            .btn {
                line-height: 0.5;
            }
        `,
    ],
})
export class ChildMessageRenderer implements ICellRendererAngularComp {
    public params!: ICellRendererParams;

    agInit(params: ICellRendererParams): void {
        this.params = params;
    }

    public invokeParentMethod() {
        this.params.context.componentParent.methodFromParent(
            `Row: ${this.params.node.rowIndex}, Col: ${this.params.colDef?.headerName}`
        );
    }

    refresh(): boolean {
        return false;
    }
}
