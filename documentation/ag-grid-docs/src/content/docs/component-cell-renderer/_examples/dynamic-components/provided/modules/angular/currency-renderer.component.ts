import { CurrencyPipe } from '@angular/common';
import { Component } from '@angular/core';

import type { ICellRendererAngularComp } from 'ag-grid-angular';
import type { ICellRendererParams } from 'ag-grid-community';

@Component({
    standalone: true,
    imports: [CurrencyPipe],
    selector: 'currency-cell',
    template: `{{ params.value | currency: 'EUR' }}`,
})
export class CurrencyRenderer implements ICellRendererAngularComp {
    public params!: ICellRendererParams;

    agInit(params: ICellRendererParams): void {
        this.params = params;
    }

    refresh(): boolean {
        return false;
    }
}
