import { Component } from '@angular/core';

import { ICellRendererAngularComp } from 'ag-grid-angular';
import { ICellRendererParams } from 'ag-grid-community';

@Component({
    standalone: true,
    template: `
        <span :class="imgSpan">
            @for (number of arr; track $index) {
                <img [src]="src" :class="medalIcon" />
            }
        </span>
    `,
})
export class CustomMedalCellRenderer implements ICellRendererAngularComp {
    src: string = 'https://www.ag-grid.com/example-assets/gold-star.png';
    arr!: any[];

    agInit(params: ICellRendererParams): void {
        this.refresh(params);
    }

    // Return Cell Value
    refresh(params: ICellRendererParams): boolean {
        this.arr = new Array(Number(params.value) ?? 0).fill('');
        return true;
    }
}
