import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject } from '@angular/core';

import type { IToolbarItemAngularComp } from 'ag-grid-angular';
import type { IToolbarItemParams } from 'ag-grid-community';

@Component({
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <div class="ag-toolbar-item">
            <button class="ag-button ag-standard-button" (click)="onClick()">
                {{ active ? 'Clear Analysis' : 'Analyse by Country' }}
            </button>
        </div>
    `,
})
export class CustomToolbarItem implements IToolbarItemAngularComp {
    private params!: IToolbarItemParams;
    private cdr = inject(ChangeDetectorRef);
    active = false;

    agInit(params: IToolbarItemParams): void {
        this.params = params;
    }

    onClick(): void {
        const { api } = this.params;
        this.active = !this.active;

        if (this.active) {
            api.setRowGroupColumns(['country']);
            api.setFilterModel({ year: { filterType: 'number', type: 'equals', filter: 2008 } });
        } else {
            api.setRowGroupColumns([]);
            api.setFilterModel(null);
        }

        this.cdr.markForCheck();
    }
}
