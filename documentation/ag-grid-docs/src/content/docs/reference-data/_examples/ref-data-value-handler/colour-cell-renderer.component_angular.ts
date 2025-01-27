import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';

import type { ICellRendererAngularComp } from 'ag-grid-angular';
import type { ICellRendererParams } from 'ag-grid-community';

@Component({
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        @if (value() === '(Select All)') {
            <div>{{ value() }}</div>
        } @else {
            <span [style.color]="valueNoSpaces()">{{ valueFormatted() }}</span>
        }
    `,
})
export class ColourCellRenderer implements ICellRendererAngularComp {
    params = signal<ICellRendererParams | undefined>(undefined);

    value = computed(() => this.params()?.value);
    valueFormatted = computed(() => this.params()?.valueFormatted);
    valueNoSpaces = computed(() => this.valueFormatted()?.replace(/\s/g, ''));

    agInit(params: ICellRendererParams): void {
        this.params.set(params);
    }

    refresh() {
        return false;
    }
}
