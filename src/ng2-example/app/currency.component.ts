import {Component,OnDestroy} from '@angular/core';

import {ICellRendererAngularComp} from 'ag-grid-ng2/main';

@Component({
    selector: 'currency-cell',
    template: `{{params.value | currency:'EUR'}}`
})
export class CurrencyComponent implements ICellRendererAngularComp {
    public params:any;

    agInit(params:any):void {
        this.params = params;
    }
}