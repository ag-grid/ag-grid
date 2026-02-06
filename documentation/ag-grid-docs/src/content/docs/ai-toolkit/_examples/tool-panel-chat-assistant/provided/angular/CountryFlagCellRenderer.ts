import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

import { ICellRendererAngularComp } from 'ag-grid-angular';
import { ICellRendererParams } from 'ag-grid-community';

@Component({
    selector: 'country-flag-cell-renderer',
    standalone: true,
    imports: [CommonModule],
    template: `
        <div *ngIf="value" style="display: flex; align-items: center; gap: 6px;">
            <img [src]="flagUrl" width="15" height="10" style="border: 0" [alt]="value" />
            <span>{{ value }}</span>
        </div>
    `,
})
export class CountryFlagCellRenderer implements ICellRendererAngularComp {
    value: string = '';
    flagUrl: string = '';

    agInit(params: ICellRendererParams): void {
        this.value = params.value || '';
        if (this.value) {
            const countryCode = this.value.toLowerCase();
            this.flagUrl = `https://flags.fmcdn.net/data/flags/mini/${countryCode}.png`;
        }
    }

    refresh(params: ICellRendererParams): boolean {
        this.agInit(params);
        return true;
    }
}
