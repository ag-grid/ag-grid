import { Component, signal } from '@angular/core';

import type { ICellRendererAngularComp } from 'ag-grid-angular';
import type { ICellRendererParams } from 'ag-grid-community';

@Component({
    standalone: true,
    template: ` <div>
        @if (flagCode()) {
            <img
                class="flag"
                border="0"
                width="15"
                height="10"
                src="https://flags.fmcdn.net/data/flags/mini/{{ flagCode() }}.png"
            />
        }
        {{ textValue() }}
    </div>`,
})
export class CountryCellRenderer implements ICellRendererAngularComp {
    textValue = signal<string | undefined>(undefined);
    flagCode = signal<string | undefined>(undefined);

    agInit(params: ICellRendererParams & { isFilterRenderer?: boolean }): void {
        this.flagCode.set(undefined);

        if (!params.value) {
            this.textValue.set(params.isFilterRenderer ? '(Blanks)' : params.value);
        } else if (params.value === '(Select All)') {
            this.textValue.set(params.value);
        } else {
            this.flagCode.set(params.context.COUNTRY_CODES[params.value]);
            this.textValue.set(params.value);
        }
    }

    refresh() {
        return false;
    }
}
