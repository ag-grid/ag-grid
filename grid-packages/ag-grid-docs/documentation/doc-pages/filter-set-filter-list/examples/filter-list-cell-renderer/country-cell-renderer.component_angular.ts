import {Component} from "@angular/core";
import {ICellRendererParams} from "@ag-grid-community/core";
import {ICellRendererAngularComp} from "@ag-grid-community/angular";

@Component({
    selector: 'simple-component',
    template: `
        <div [innerHTML]="value"></div>`
})
export class CountryCellRenderer implements ICellRendererAngularComp {
    private params!: ICellRendererParams;
    private value!: string;

    agInit(params: ICellRendererParams): void {
        this.params = params;

        if (!params.value || params.value === '(Select All)') {
            this.value = params.value;
        } else {

            const url = `https://flags.fmcdn.net/data/flags/mini/${params.context.COUNTRY_CODES[params.value]}.png`;
            const flagImage = `<img class="flag" border="0" width="15" height="10" src="${url}">`;

            this.value = `${flagImage} ${params.value}`;
        }
    }

    refresh() {
        return false
    }
}
