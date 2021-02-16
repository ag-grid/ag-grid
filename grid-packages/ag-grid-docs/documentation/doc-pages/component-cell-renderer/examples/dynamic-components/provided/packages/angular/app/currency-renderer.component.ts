import {Component} from "@angular/core";

import {ICellRendererParams} from "ag-grid-community";
import {AgRendererComponent} from "ag-grid-angular";

@Component({
    selector: 'currency-cell',
    template: `{{params.value | currency:'EUR'}}`
})
export class CurrencyRenderer implements AgRendererComponent {
    public params: ICellRendererParams;

    agInit(params: ICellRendererParams): void {
        this.params = params;
    }

    refresh(): boolean {
        return false;
    }
}
