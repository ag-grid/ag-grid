import { Component } from "@angular/core";

import { IStatusPanelParams } from "@ag-grid-community/core";
import { IStatusPanelAngularComp } from "@ag-grid-community/angular";

@Component({
    selector: 'status-component',
    template: `
        <div class="ag-status-name-value">
            <span class="component">Status Bar Component <input type="button" (click)="onClick()"
                                                                value="Click Me"/></span>
        </div>
    `
})
export class ClickableStatusBarComponent implements IStatusPanelAngularComp {
    private params!: IStatusPanelParams;

    agInit(params: IStatusPanelParams): void {
        this.params = params;
    }

    onClick(): void {
        alert('Selected Row Count: ' + this.params.api.getSelectedRows().length)
    }
}
