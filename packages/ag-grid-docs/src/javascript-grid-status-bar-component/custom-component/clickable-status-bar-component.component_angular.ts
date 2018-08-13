import {Component, ViewChild, ViewContainerRef} from "@angular/core";

import {IAfterGuiAttachedParams, IDoesFilterPassParams, RowNode, IStatusBar, IStatusBarParams} from "ag-grid";
import {IFilterAngularComp} from "ag-grid-angular";

@Component({
    selector: 'status-component',
    template: `
        <div class="container">
            <span class="component">Status Bar Component <input type="button" (click)="onClick()" value="Click Me"/></span> 
        </div>
    `, styles: [
        `
            .container {
                margin-right: 5px;
                background-color: lightgrey; 
                padding-left: 5px; 
                padding-right: 5px; 
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

    agInit(params: IStatusBarParams): void {
        this.params = params;
    }

    onClick() : void {
        alert('Selected Row Count: ' + this.params.api.getSelectedRows().length)
    }
}
