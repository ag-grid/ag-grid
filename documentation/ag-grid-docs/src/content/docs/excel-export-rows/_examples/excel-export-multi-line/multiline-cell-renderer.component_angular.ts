import { ChangeDetectionStrategy, Component, signal } from '@angular/core';

import type { ICellRendererAngularComp } from 'ag-grid-angular';
import type { ICellRendererParams } from 'ag-grid-community';

@Component({
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,
    // using innerHTML to preserve the line breaks
    template: `<div [innerHTML]="value()"></div>`,
})
export class MultilineCellRenderer implements ICellRendererAngularComp {
    value = signal<string>('');

    agInit(params: ICellRendererParams): void {
        this.value.set(params.value.replace('\n', '<br/>'));
    }

    refresh() {
        return false;
    }
}
