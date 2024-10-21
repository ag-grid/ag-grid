import { Component } from '@angular/core';

import type { IStatusPanelAngularComp } from 'ag-grid-angular';
import type { IStatusPanelParams } from 'ag-grid-community';

@Component({
    standalone: true,
    template: `
        <div class="ag-status-name-value">
            <span class="component">
                Status Bar Component
                <input class="status-bar-input" type="button" (click)="onClick()" value="Click Me" />
            </span>
        </div>
    `,
})
export class ClickableStatusBarComponent implements IStatusPanelAngularComp {
    private params!: IStatusPanelParams;

    agInit(params: IStatusPanelParams): void {
        this.params = params;
    }

    onClick(): void {
        alert('Selected Row Count: ' + this.params.api.getSelectedRows().length);
    }
}
