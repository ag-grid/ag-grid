import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';

import type { ICellRendererAngularComp } from 'ag-grid-angular';
import type { ICellRendererParams } from 'ag-grid-community';

@Component({
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <div class="color-cell">
            <span [style.borderLeft]="'10px solid ' + value()" [style.paddingRight]="'5px'"></span>{{ value() }}
        </div>
    `,
    styles: [
        `
            :host {
                overflow: hidden;
            }

            .color-cell {
                overflow: hidden;
                text-overflow: ellipsis;
            }
        `,
    ],
})
export class ColourCellRenderer implements ICellRendererAngularComp {
    params = signal<ICellRendererParams | undefined>(undefined);
    value = computed(() => this.params()?.value);

    agInit(params: ICellRendererParams): void {
        this.params.set(params);
    }

    refresh() {
        return false;
    }
}
