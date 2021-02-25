import {Component} from "@angular/core";

import {ICellRendererParams} from "@ag-grid-community/core";
import {AgRendererComponent} from "@ag-grid-community/angular";

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
