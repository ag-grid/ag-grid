import {Component} from "@angular/core";
import {ICellRendererParams} from "@ag-grid-community/core";
import {ICellRendererAngularComp} from "@ag-grid-community/angular";

// simple cell renderer returns dummy buttons. in a real application, a component would probably
// be used with operations tied to the buttons. in this example, the cell renderer is just for
// display purposes.
@Component({
    selector: 'simple-component',
    template: `<img alt="{{params.data.country}}" src="{{params.context.base64flags[params.context.countryCodes[params.data.country]]}}">`
})
export class CountryCellRenderer implements ICellRendererAngularComp {
    private params!: ICellRendererParams;

    agInit(params: ICellRendererParams): void {
        this.params = params;
    }

    refresh() {
        return false
    }
}
