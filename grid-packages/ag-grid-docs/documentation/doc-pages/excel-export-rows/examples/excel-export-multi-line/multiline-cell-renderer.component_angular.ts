import {Component} from "@angular/core";
import {ICellRendererParams} from "@ag-grid-community/core";
import {ICellRendererAngularComp} from "@ag-grid-community/angular";

// simple cell renderer returns dummy buttons. in a real application, a component would probably
// be used with operations tied to the buttons. in this example, the cell renderer is just for
// display purposes.
@Component({
    selector: 'simple-component',
    template: `<div [innerHTML]="value"></div>`
})
export class MultilineCellRenderer implements ICellRendererAngularComp {
    private params!: ICellRendererParams;
    private value: any;

    agInit(params: ICellRendererParams): void {
        this.params = params;
        this.value = params.value.replace('\n', '<br/>')
    }

    refresh() {
        return false
    }
}
