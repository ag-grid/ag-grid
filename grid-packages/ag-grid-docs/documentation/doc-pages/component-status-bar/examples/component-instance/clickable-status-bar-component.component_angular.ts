import { IStatusPanelParams } from "@ag-grid-community/core";
import { Component } from "@angular/core";
import { IStatusPanelAngularComp } from "@ag-grid-community/angular";

@Component({
    selector: 'status-component',
    template: `
        <div class="container" *ngIf="visible">
            <div>
                <span class="component">Status Bar Component <input type="button" (click)="onClick()" value="Click Me"/></span>
            </div>
        </div>
    `
})
export class ClickableStatusBarComponent implements IStatusPanelAngularComp {
    private params!: IStatusPanelParams;
    private visible = true;

    agInit(params: IStatusPanelParams): void {
        this.params = params;
    }

    onClick(): void {
        alert('Selected Row Count: ' + this.params.api.getSelectedRows().length)
    }

    setVisible(visible: boolean) {
        this.visible = visible;
    }

    isVisible(): boolean {
        return this.visible;
    }
}
