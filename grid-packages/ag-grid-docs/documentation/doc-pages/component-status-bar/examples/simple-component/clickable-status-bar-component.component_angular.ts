import { Component } from "@angular/core";
import { IStatusPanelParams } from "@ag-grid-community/core";

@Component({
    selector: 'status-component',
    template: `<input type="button" (click)="onClick()" value="Click Me For Selected Row Count"/>`,
    styles: ['input { padding: 5px; margin: 5px }']
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
