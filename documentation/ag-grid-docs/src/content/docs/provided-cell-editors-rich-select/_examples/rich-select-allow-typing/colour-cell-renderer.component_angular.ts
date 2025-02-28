import { Component, signal } from '@angular/core';

import type { ICellRendererAngularComp } from 'ag-grid-angular';
import type { ICellRendererParams } from 'ag-grid-community';

@Component({
    standalone: true,
    template: `
        <div [style.overflow]="'hidden'" [style.textOverflow]="'ellipsis'">
            <span [style.borderLeft]="'10px solid ' + value()" [style.paddingRight]="'5px'"></span>{{ value() }}
        </div>
    `,
    styles: [
        `
            :host {
                overflow: hidden;
            }
        `,
    ],
})
export class ColourCellRenderer implements ICellRendererAngularComp {
    value = signal<string>('');

    agInit(params: ICellRendererParams): void {
        this.value.set(params.value);
    }

    refresh() {
        return false;
    }
}
