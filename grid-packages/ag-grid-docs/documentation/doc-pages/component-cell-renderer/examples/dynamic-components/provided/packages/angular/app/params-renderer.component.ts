import {Component} from "@angular/core";

import {ICellRendererAngularComp} from "ag-grid-angular";

@Component({
    selector: 'params-cell',
    template: `Field: {{params.colDef.field}}, Value: {{params.value}}`
})
export class ParamsRenderer implements ICellRendererAngularComp {
    public params: any;

    agInit(params: any): void {
        this.params = params;
    }

    refresh(): boolean {
        return false;
    }
}
