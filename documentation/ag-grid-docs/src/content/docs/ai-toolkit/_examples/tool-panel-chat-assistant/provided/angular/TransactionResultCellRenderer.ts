import { Component } from '@angular/core';

import { ICellRendererAngularComp } from 'ag-grid-angular';
import { ICellRendererParams } from 'ag-grid-community';

@Component({
    selector: 'transaction-result-cell-renderer',
    standalone: true,
    template: `
        <span style="display: flex; justify-content: center; height: 100%; align-items: center">
            <img [src]="iconUrl" style="width: auto; height: auto" [alt]="value" />
        </span>
    `,
})
export class TransactionResultCellRenderer implements ICellRendererAngularComp {
    value: string = '';
    iconUrl: string = '';

    agInit(params: ICellRendererParams): void {
        this.value = params.value || '';
        const iconName = this.value === 'Completed' ? 'tick-in-circle' : 'cross-in-circle';
        this.iconUrl = `https://www.ag-grid.com/example-assets/icons/${iconName}.png`;
    }

    refresh(params: ICellRendererParams): boolean {
        this.agInit(params);
        return true;
    }
}
