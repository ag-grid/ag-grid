import { Component } from '@angular/core';

import { ICellRendererAngularComp } from 'ag-grid-angular';
import { ICellRendererParams } from 'ag-grid-community';

// simple cell renderer returns dummy buttons. in a real application, a component would probably
// be used with operations tied to the buttons. in this example, the cell renderer is just for
// display purposes.
@Component({
    standalone: true,
    template: `<div [innerHTML]="value"></div>`,
})
export class MultilineCellRenderer implements ICellRendererAngularComp {
    private params!: ICellRendererParams;
    public value: any;

    agInit(params: ICellRendererParams): void {
        this.params = params;
        this.value = params.value.replace('\n', '<br/>');
    }

    refresh() {
        return false;
    }
}
