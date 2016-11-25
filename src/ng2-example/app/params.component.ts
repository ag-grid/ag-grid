import {Component, OnDestroy} from '@angular/core';

import {AgRendererComponent} from 'ag-grid-ng2/main';

@Component({
    selector: 'params-cell',
    template: `Field: {{params.colDef.field}}, Value: {{params.value}}`
})
export class ParamsComponent implements AgRendererComponent {
    public params: any;

    agInit(params: any): void {
        this.params = params;
    }
}
