import { Component } from '@angular/core';

import { ICellRendererAngularComp } from 'ag-grid-angular';
import { ICellRendererParams } from 'ag-grid-community';

@Component({
    standalone: true,
    template: `<span>{{ this.displayValue }}</span>`,
})
export class MedalCellRenderer implements ICellRendererAngularComp {
    displayValue!: string;

    agInit(params: ICellRendererParams): void {
        console.log('renderer created');
        this.updateDisplayValue(params);
    }

    refresh(params: ICellRendererParams): boolean {
        console.log('renderer refreshed');
        this.updateDisplayValue(params);
        return true;
    }

    private updateDisplayValue(params: ICellRendererParams): void {
        this.displayValue = new Array(params.value!).fill('#').join('');
    }
}
