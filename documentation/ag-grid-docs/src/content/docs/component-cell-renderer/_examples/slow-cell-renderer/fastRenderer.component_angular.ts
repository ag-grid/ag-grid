import { ChangeDetectionStrategy, Component, signal } from '@angular/core';

import type { ICellRendererAngularComp } from 'ag-grid-angular';
import type { ICellRendererParams } from 'ag-grid-community';

@Component({
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `<span>{{ value() }}</span>`,
})
export class FastRenderer implements ICellRendererAngularComp {
    value = signal(undefined);
    agInit(params: ICellRendererParams): void {
        this.refresh(params);
    }
    refresh(params: ICellRendererParams) {
        this.value.set(params.value);
        return true;
    }
}
