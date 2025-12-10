import { ChangeDetectionStrategy, Component, signal } from '@angular/core';

import type { ICellRendererAngularComp } from 'ag-grid-angular';
import type { ICellRendererParams } from 'ag-grid-community';

interface CustomButtonParams extends ICellRendererParams {
    onClick: () => void;
}

@Component({
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `<button class="btn-simple" (click)="onClick()">
        {{ 'Launch ' + company() + '!' }}
    </button>`,
})
export class CustomButtonComponent implements ICellRendererAngularComp {
    onClick!: () => void;
    company = signal('');
    agInit(params: CustomButtonParams): void {
        this.onClick = params.onClick;
        this.refresh(params);
    }
    refresh(params: CustomButtonParams) {
        this.company.set(params.data?.company ?? '');
        return true;
    }
}
