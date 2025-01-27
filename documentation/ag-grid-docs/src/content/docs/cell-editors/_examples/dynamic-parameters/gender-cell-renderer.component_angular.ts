import { ChangeDetectionStrategy, Component, signal } from '@angular/core';

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
export class GenderCellRenderer implements ICellRendererAngularComp {
    iconClass = signal('');
    value = signal(undefined);

    agInit(params: ICellRendererParams): void {
        this.iconClass.set(params.value === 'Male' ? 'fa fa-male' : 'fa fa-female');
        this.value.set(params.value);
    }

    refresh(params: ICellRendererParams) {
        return false;
    }
}
