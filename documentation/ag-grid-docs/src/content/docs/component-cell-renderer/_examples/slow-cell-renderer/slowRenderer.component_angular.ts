import { ChangeDetectionStrategy, Component, signal } from '@angular/core';

import type { ICellRendererAngularComp } from 'ag-grid-angular';
import type { ICellRendererParams } from 'ag-grid-community';

@Component({
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `<span>{{ value() }}</span>`,
})
export class SlowRenderer implements ICellRendererAngularComp {
    value = signal(undefined);
    agInit(params: ICellRendererParams): void {
        this.refresh(params);
    }
    refresh(params: ICellRendererParams) {
        this.value.set(params.value);
        const delay = 50;
        const start = Date.now();
        while (Date.now() - start < delay) {
            // Busy-waiting loop to simulate a delay
        }
        return true;
    }
}
