import { ChangeDetectionStrategy, Component } from '@angular/core';

import type { IToolbarItemAngularComp } from 'ag-grid-angular';
import type { IToolbarItemParams } from 'ag-grid-community';

@Component({
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <div class="ag-toolbar-item">
            <button class="ag-button ag-standard-button" (click)="onClick()">Log Selected Rows</button>
        </div>
    `,
})
export class CustomToolbarItem implements IToolbarItemAngularComp {
    private params!: IToolbarItemParams;

    agInit(params: IToolbarItemParams): void {
        this.params = params;
    }

    onClick(): void {
        const selectedRows = this.params.api.getSelectedRows();
        console.log('Selected Rows:', selectedRows.length);
    }
}
