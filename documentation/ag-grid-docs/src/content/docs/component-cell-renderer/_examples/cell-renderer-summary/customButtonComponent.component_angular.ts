import { ChangeDetectionStrategy, Component, signal } from '@angular/core';

import type { ICellRendererAngularComp } from 'ag-grid-angular';
import type { ICellRendererParams } from 'ag-grid-community';

@Component({
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `<button (click)="buttonClicked()">
        {{ 'Launch ' + company() + '!' }}
    </button>`,
})
export class CustomButtonComponent implements ICellRendererAngularComp {
    data: any;
    company = signal('');
    agInit(params: ICellRendererParams): void {
        this.data = params.data;
        this.refresh(params);
    }
    refresh(params: ICellRendererParams) {
        this.company.set(params.data?.company ?? '');
        return true;
    }
    buttonClicked() {
        console.log('Software Launched');
    }
}
