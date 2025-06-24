import { ChangeDetectionStrategy, Component } from '@angular/core';

import type { ICellRendererAngularComp } from 'ag-grid-angular';
import type { ICellRendererParams } from 'ag-grid-community';

@Component({
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `<button (click)="buttonClicked()">
        {{ data?.company ? 'Launch ' + data.company + '!' : 'Launch!' }}
    </button>`,
})
export class CustomButtonComponent implements ICellRendererAngularComp {
    data: any;
    agInit(params: ICellRendererParams): void {
        this.data = params.data;
    }
    refresh(params: ICellRendererParams) {
        return true;
    }
    buttonClicked() {
        console.log('Software Launched');
    }
}
