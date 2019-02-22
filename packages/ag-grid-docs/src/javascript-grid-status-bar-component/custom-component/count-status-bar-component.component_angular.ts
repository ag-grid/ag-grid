import { Component } from "@angular/core";

import { IStatusBarItem, IStatusBarItemParams } from "ag-grid-community";

@Component({
    selector: 'status-component',
    template: `
        <div class="ag-name-value">
            <span>Row Count Component&nbsp;:</span>
            <span class="ag-name-value-value">{{count}}</span>
        </div>
    `
})
export class CountStatusBarComponent {
    private params: IStatusBarItemParams;
    private count: null;

    agInit(params: IStatusBarItemParams): void {
        this.params = params;

        this.params.api.addEventListener('gridReady', this.onGridReady.bind(this));
    }

    onGridReady() {
        this.count = this.params.api.getModel().rowsToDisplay.length;
    }
}
