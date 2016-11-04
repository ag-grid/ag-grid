import {Component} from '@angular/core';

import {AgRendererComponent} from 'ag-grid-ng2/main';

// both this and the parent component could be folded into one component as they're both simple, but it illustrates how
// a fuller example could work
@Component({
    selector: 'clickable-cell',
    template: `
    <ag-clickable (onClicked)="clicked($event)" [cell]="cell"></ag-clickable>
    `
})
export class ClickableParentComponent implements AgRendererComponent {
    private params:any;
    private cell:any;

    agInit(params:any):void {
        this.params = params;
        this.cell = {row: params.value, col: params.colDef.headerName};
    }

    clicked(cell:any):void {
        console.log("Child Cell Clicked: " + JSON.stringify(cell));
    }
}

