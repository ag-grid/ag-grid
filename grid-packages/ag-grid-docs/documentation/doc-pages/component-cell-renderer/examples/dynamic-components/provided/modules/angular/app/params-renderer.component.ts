import {Component} from "@angular/core";

import {ICellRendererParams} from "@ag-grid-community/core";
import {AgRendererComponent} from "@ag-grid-community/angular";

@Component({
    selector: 'params-cell',
    template: `Field: {{params.colDef.field}}, Value: {{params.value}}`
})
export class ParamsRenderer implements AgRendererComponent {
    public params: ICellRendererParams;

    agInit(params: ICellRendererParams): void {
        this.params = params;
    }

    refresh(): boolean {
        return false;
    }
}
