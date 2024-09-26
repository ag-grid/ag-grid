import { Component } from '@angular/core';

import type { ICellRendererAngularComp } from 'ag-grid-angular';
import type { ICellRendererParams } from 'ag-grid-community';

@Component({
    standalone: true,
    template: `<span>{{ this.displayValue }}</span>`,
})
export class MedalCellRenderer implements ICellRendererAngularComp {
    public displayValue!: string;

    agInit(params: ICellRendererParams<IOlympicData, number>): void {
        this.displayValue = new Array(params.value!).fill('#').join('');
    }

    refresh(params: ICellRendererParams) {
        return false;
    }
}
