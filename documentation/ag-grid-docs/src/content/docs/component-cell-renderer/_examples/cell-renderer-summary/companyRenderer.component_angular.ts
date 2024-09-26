import { Component } from '@angular/core';

import type { ICellRendererAngularComp } from 'ag-grid-angular';
import type { ICellRendererParams } from 'ag-grid-community';

@Component({
    standalone: true,
    template: ` <a [href]="value" target="_blank">{{ parsedValue }}</a> `,
})
export class CompanyRenderer implements ICellRendererAngularComp {
    // Init Cell Value
    public value!: string;
    public parsedValue!: string;
    agInit(params: ICellRendererParams): void {
        this.refresh(params);
    }

    // Return Cell Value
    refresh(params: ICellRendererParams): boolean {
        this.value = params.value;
        this.parsedValue = new URL(params.value).hostname;
        return true;
    }
}
