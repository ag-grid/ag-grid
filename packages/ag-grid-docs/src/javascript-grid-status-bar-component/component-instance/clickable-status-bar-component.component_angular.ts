import {Component, ViewChild, ViewContainerRef} from "@angular/core";

import {IAfterGuiAttachedParams, IDoesFilterPassParams, RowNode, IStatusBarItem, IStatusBarItemParams} from "ag-grid-community";
import {IFilterAngularComp} from "ag-grid-angular";

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
export class ClickableStatusBarComponent {
    private params: IStatusBarItemParams;
    private visible = true;

    agInit(params: IStatusBarItemParams): void {
        this.params = params;
    }

    onClick() : void {
        alert('Selected Row Count: ' + this.params.api.getSelectedRows().length)
    }

    setVisible(visible: boolean) {
        this.visible = visible;
    }

    isVisible(): boolean {
        return this.visible;
    }
}
