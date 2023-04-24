import { Component } from "@angular/core";

import { ICellRendererAngularComp } from "@ag-grid-community/angular";
import { ICellRendererParams } from "@ag-grid-community/core"

@Component({
    selector: 'cell-renderer',
    template: `<span>
        <button style="height: 30px;" (click)="onClick()">✎</button>
        <span style="padding-left: 4px;">{{this.displayValue}}</span>
    </span>`
})
export class CellRenderer implements ICellRendererAngularComp {
    private params!: ICellRendererParams<IOlympicData, string>;
    public displayValue!: string;

    agInit(params: ICellRendererParams<IOlympicData, string>): void {
        this.params = params;
        this.displayValue = params.value
    }

    onClick() {
        this.params.api.startEditingCell({
          rowIndex: this.params.rowIndex,
          colKey: this.params.column!.getId(),
        });
    }

    refresh(params: ICellRendererParams) {
        return false;
    }
}

