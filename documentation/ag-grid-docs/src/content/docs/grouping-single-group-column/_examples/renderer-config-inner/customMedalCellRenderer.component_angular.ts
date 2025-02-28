import { ChangeDetectionStrategy, Component, signal } from '@angular/core';

import type { ICellRendererAngularComp } from 'ag-grid-angular';
import type { ICellRendererParams } from 'ag-grid-community';

@Component({
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <span :class="imgSpan">
            @for (number of arr(); track $index) {
                <img [src]="src" :class="medalIcon" />
            }
        </span>
    `,
})
export class CustomMedalCellRenderer implements ICellRendererAngularComp {
    src: string = 'https://www.ag-grid.com/example-assets/gold-star.png';
    arr = signal<any[]>([]);

    agInit(params: ICellRendererParams): void {
        this.refresh(params);
    }

    refresh(params: ICellRendererParams): boolean {
        this.arr.set(Array(Number(params.value ?? 0)).fill(''));
        return true;
    }
}
