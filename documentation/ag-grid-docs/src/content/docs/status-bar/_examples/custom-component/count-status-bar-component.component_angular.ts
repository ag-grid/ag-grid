import { ChangeDetectionStrategy, Component, signal } from '@angular/core';

import type { IStatusPanelAngularComp } from 'ag-grid-angular';
import type { IStatusPanelParams } from 'ag-grid-community';

@Component({
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <div class="ag-status-name-value">
            <span>Row Count Component&nbsp;:</span>
            <span class="ag-status-name-value-value">{{ count() }}</span>
        </div>
    `,
})
export class CountStatusBarComponent implements IStatusPanelAngularComp {
    count = signal<number | undefined>(undefined);

    agInit(params: IStatusPanelParams): void {
        params.api.addEventListener('rowDataUpdated', (event) => {
            this.count.set(event.api.getDisplayedRowCount());
        });
    }
}
