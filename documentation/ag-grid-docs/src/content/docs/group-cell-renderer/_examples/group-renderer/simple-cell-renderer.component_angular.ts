import { Component } from '@angular/core';

import type { ICellRendererAngularComp } from 'ag-grid-angular';
import type { ICellRendererParams } from 'ag-grid-community';

@Component({
    standalone: true,
    template: ` <span [style.backgroundColor]="color" style="padding: 2px">{{ params.value }}</span> `,
})
export class SimpleCellRenderer implements ICellRendererAngularComp {
    public params!: ICellRendererParams;
    public color!: string;
    agInit(params: ICellRendererParams): void {
        this.params = params;
        this.color = this.params.node.group ? '#CC222244' : '#33CC3344';
    }

    refresh(params: ICellRendererParams) {
        return false;
    }
}
