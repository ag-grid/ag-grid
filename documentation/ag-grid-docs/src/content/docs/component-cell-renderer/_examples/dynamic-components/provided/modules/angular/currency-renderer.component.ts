import { Component } from "@angular/core";
import { CurrencyPipe } from "@angular/common";

import { ICellRendererParams } from "@ag-grid-community/core";
import { ICellRendererAngularComp } from "@ag-grid-community/angular";

@Component({
    standalone: true,
    imports: [CurrencyPipe],
    selector: 'currency-cell',
    template: `{{params.value | currency:'EUR'}}`
})
export class CurrencyRenderer implements ICellRendererAngularComp {
    public params!: ICellRendererParams;

    agInit(params: ICellRendererParams): void {
        this.params = params;
    }

    refresh(): boolean {
        return false;
    }
}
