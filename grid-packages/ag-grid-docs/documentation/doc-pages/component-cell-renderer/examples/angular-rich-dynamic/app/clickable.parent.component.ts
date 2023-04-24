import { Component } from "@angular/core";
import { ICellRendererParams } from "@ag-grid-community/core";
import { ICellRendererAngularComp } from "@ag-grid-community/angular";

// both this and the parent component could be folded into one component as they're both simple, but it illustrates how
// a fuller example could work
@Component({
    selector: 'clickable-cell',
    template: `
        <ag-clickable (onClicked)="clicked($event)" [cell]="cell"></ag-clickable>
    `
})
export class ClickableParentComponent implements ICellRendererAngularComp {
    public cell: any;

    agInit(params: ICellRendererParams): void {
        this.cell = { row: params.value, col: params.colDef?.headerName };
    }

    public clicked(cell: any): void {
        console.log("Child Cell Clicked: " + JSON.stringify(cell));
    }

    refresh(): boolean {
        return false;
    }
}

