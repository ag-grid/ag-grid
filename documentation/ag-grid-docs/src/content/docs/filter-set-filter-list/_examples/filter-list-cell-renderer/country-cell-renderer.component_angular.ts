import { ICellRendererAngularComp } from '@ag-grid-community/angular';
import { ICellRendererParams } from '@ag-grid-community/core';
import { Component } from '@angular/core';

@Component({
    standalone: true,
    template: ` <div [innerHTML]="value"></div>`,
})
export class CountryCellRenderer implements ICellRendererAngularComp {
    public value!: string;

    agInit(params: ICellRendererParams & { isFilterRenderer?: boolean }): void {
        if (!params.value) {
            this.value = params.isFilterRenderer ? '(Blanks)' : params.value;
        } else if (params.value === '(Select All)') {
            this.value = params.value;
        } else {
            const url = `https://flags.fmcdn.net/data/flags/mini/${params.context.COUNTRY_CODES[params.value]}.png`;
            const flagImage = `<img class="flag" border="0" width="15" height="10" src="${url}">`;

            this.value = `${flagImage} ${params.value}`;
        }
    }

    refresh() {
        return false;
    }
}
