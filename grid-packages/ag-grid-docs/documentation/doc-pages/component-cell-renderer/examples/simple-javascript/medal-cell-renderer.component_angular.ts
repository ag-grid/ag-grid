import {Component} from "@angular/core";

import {ICellRendererParams} from "@ag-grid-community/all-modules";

@Component({
    selector: 'medal-component',
    template: `<span>{{this.displayValue}}</span>`
})
export class MedalCellRenderer {
    private displayValue: string;

    agInit(params: ICellRendererParams): void {
        this.displayValue = new Array(params.value).fill('#').join('');
    }
}
