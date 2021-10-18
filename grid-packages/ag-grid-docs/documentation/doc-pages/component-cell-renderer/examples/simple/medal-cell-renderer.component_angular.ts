import {Component} from "@angular/core";

import {AgRendererComponent} from "@ag-grid-community/angular";
import {ICellRendererParams} from "@ag-grid-community/all-modules";

@Component({
    selector: 'medal-component',
    template: `<span>{{this.displayValue}}</span>`
})
export class MedalCellRenderer implements AgRendererComponent {
    private displayValue: string;

    agInit(params: ICellRendererParams): void {
        this.displayValue = new Array(parseInt(params.value, 10)).fill('#').join('');
    }
}
