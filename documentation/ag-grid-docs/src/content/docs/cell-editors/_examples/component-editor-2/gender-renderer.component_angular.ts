import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';

import type { ICellRendererAngularComp } from 'ag-grid-angular';
import type { ICellRendererParams } from 'ag-grid-community';

@Component({
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        @if (value()) {
            <span> <i [class]="iconClass()"> </i> {{ value() }} </span>
        }
    `,
})
export class GenderRenderer implements ICellRendererAngularComp {
    value = signal(undefined);
    iconClass = computed(() => (this.value() === 'Male' ? 'fa fa-male' : 'fa fa-female'));

    agInit(params: ICellRendererParams): void {
        this.value.set(params.value);
    }

    refresh(params: ICellRendererParams) {
        return false;
    }
}
