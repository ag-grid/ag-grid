import { Component } from "@angular/core";

import { ICellRendererAngularComp } from "@ag-grid-community/angular";
import { ICellRendererParams } from "@ag-grid-community/core"

@Component({
    selector: 'medal-component',
    template: `<span>{{this.displayValue}}</span>`
})
export class MedalCellRenderer implements ICellRendererAngularComp {
    private params!: ICellRendererParams;
    public displayValue!: string;

    agInit(params: ICellRendererParams): void {
        this.params = params;
        this.displayValue = new Array(params.value).fill('#').join('');
    }

    medalUserFunction() {
        console.log(`user function called for medal column: row = ${this.params.rowIndex}, column = ${this.params.column!.getId()}`);
    }
    refresh(params: ICellRendererParams) {
        return false;
    }
}
