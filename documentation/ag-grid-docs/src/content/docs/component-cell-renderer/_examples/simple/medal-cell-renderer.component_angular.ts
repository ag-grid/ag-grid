import { ICellRendererAngularComp } from '@ag-grid-community/angular';
import { ICellRendererParams } from '@ag-grid-community/core';
import { Component } from '@angular/core';

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
