import { Component } from "@angular/core";

import { IStatusPanelParams } from "@ag-grid-community/all-modules";

@Component({
    selector: 'status-component',
    template: `
        <div class="ag-status-name-value">
            <span>Row Count Component&nbsp;:</span>
            <span class="ag-status-name-value-value">{{count}}</span>
        </div>
    `
})
export class CountStatusBarComponent {
    private params: IStatusPanelParams;
    private count: null;

    agInit(params: IStatusPanelParams): void {
        this.params = params;

        this.params.api.addEventListener('gridReady', this.onGridReady.bind(this));
    }

    onGridReady() {
        this.count = this.params.api.getModel().rowsToDisplay.length;
    }
}
