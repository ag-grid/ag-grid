import {Component} from "@angular/core";

import {IStatusPanelParams} from "@ag-grid-community/all-modules";

@Component({
    selector: 'status-component',
    template: `
        <div class="ag-name-value">
            <span class="component">Status Bar Component <input type="button" (click)="onClick()"
                                                                value="Click Me"/></span>
        </div>
    `
})
export class ClickableStatusBarComponent {
    private params: IStatusPanelParams;

    agInit(params: IStatusPanelParams): void {
        this.params = params;
    }

    onClick(): void {
        alert('Selected Row Count: ' + this.params.api.getSelectedRows().length)
    }
}
