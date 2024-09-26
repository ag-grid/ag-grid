import { ICellRendererAngularComp } from '@ag-grid-community/angular';
import { ICellRendererParams } from '@ag-grid-community/core';
import { Component } from '@angular/core';

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
        this.arr = new Array(params.value ?? 0).fill('');
        return true;
    }
}
