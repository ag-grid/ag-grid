import { ChangeDetectionStrategy, Component, signal } from '@angular/core';

import type { ICellRendererAngularComp } from 'ag-grid-angular';
import type { ICellRendererParams } from 'ag-grid-community';

@Component({
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: ` <a [href]="value()" target="_blank">{{ parsedValue() }}</a> `,
})
export class CompanyRenderer implements ICellRendererAngularComp {
    value = signal('');
    parsedValue = signal('');

    agInit(params: ICellRendererParams): void {
        this.refresh(params);
    }

    refresh(params: ICellRendererParams): boolean {
        this.value.set(params.value);
        this.parsedValue.set(new URL(params.value).hostname);
        return true;
    }
}
