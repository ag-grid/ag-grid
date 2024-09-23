import { Component, OnDestroy } from '@angular/core';

import { ICellRendererAngularComp } from 'ag-grid-angular';
import { ICellRendererParams } from 'ag-grid-community';

@Component({
    standalone: true,
    selector: 'square-cell',
    template: `{{ valueSquared() }}`,
})
export class SquareRenderer implements ICellRendererAngularComp, OnDestroy {
    private params!: ICellRendererParams;

    agInit(params: ICellRendererParams): void {
        this.params = params;
    }

    public valueSquared(): number {
        return this.params.value * this.params.value;
    }

    ngOnDestroy() {
        console.log(`Destroying SquareComponent`);
    }

    refresh(): boolean {
        return false;
    }
}
