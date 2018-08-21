import {Component, ViewChild, ViewContainerRef} from "@angular/core";

import {IAfterGuiAttachedParams, IDoesFilterPassParams, RowNode, IStatusBar, IStatusBarParams} from "ag-grid";
import {IFilterAngularComp} from "ag-grid-angular";

@Component({
    selector: 'status-component',
    template: `
        <div class="container" *ngIf="visible">
            <div>
                <span class="component">Status Bar Component <input type="button" (click)="onClick()" value="Click Me"/></span>
            </div>
        </div>
    `, styles: [
        `
            .container {
                display: flex; 
                justify-content: center; 
                flex-direction: column;
                margin: 5px;
                background-color: lightgrey; 
                padding: 3px 5px 3px 5px; 
                border-radius: 5px
            }
            
            .component {
                margin-left: 5px; 
                padding-top: 0; 
                padding-bottom: 0
            }
        `
    ]
})
export class ClickableStatusBarComponent implements IStatusBar {
    private params: IStatusBarParams;
    private visible = true;

    agInit(params: IStatusBarParams): void {
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
