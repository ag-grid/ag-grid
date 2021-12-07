import { Component } from "@angular/core";

import { AgRendererComponent } from "@ag-grid-community/angular";
import { ICellRendererParams } from "@ag-grid-community/core";

@Component({
    selector: 'medal-component',
    template: `<span>{{this.displayValue}}</span>`
})
export class MedalCellRenderer implements AgRendererComponent {
    public displayValue!: string;

    agInit(params: ICellRendererParams): void {
        this.displayValue = new Array(parseInt(params.value, 10)).fill('#').join('');
    }
}
