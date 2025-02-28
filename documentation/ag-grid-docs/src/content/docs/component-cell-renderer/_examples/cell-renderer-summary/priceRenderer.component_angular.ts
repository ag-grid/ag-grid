import { ChangeDetectionStrategy, Component, signal } from '@angular/core';

import type { ICellRendererAngularComp } from 'ag-grid-angular';
import type { ICellRendererParams } from 'ag-grid-community';

@Component({
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <span :class="imgSpan">
            @for (number of arr(); track $index) {
                <img [src]="src" :class="priceIcon" />
            }
        </span>
    `,
})
export class PriceRenderer implements ICellRendererAngularComp {
    src: string = 'https://www.ag-grid.com/example-assets/icons/pound-coin-color-icon.svg';
    arr = signal<any[]>([]);

    agInit(params: ICellRendererParams): void {
        this.refresh(params);
    }

    refresh(params: ICellRendererParams): boolean {
        let priceMultiplier = 1;

        if (params.value > 300_000_000_000) {
            priceMultiplier = 5;
        } else if (params.value > 20_000_000_000) {
            priceMultiplier = 4;
        } else if (params.value > 10_000_000_000) {
            priceMultiplier = 3;
        } else if (params.value > 5_000_000_000) {
            priceMultiplier = 2;
        }
        this.arr.set(Array(priceMultiplier).fill(''));
        return true;
    }
}
