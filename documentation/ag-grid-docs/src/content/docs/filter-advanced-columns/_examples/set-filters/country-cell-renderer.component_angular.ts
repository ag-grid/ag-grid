import { Component, signal } from '@angular/core';

import type { ICellRendererAngularComp } from 'ag-grid-angular';
import type { ICellRendererParams } from 'ag-grid-community';

import { COUNTRY_CODES } from './countryCodes';

@Component({
    standalone: true,
    template: `<div>
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

    agInit(params: ICellRendererParams): void {
        this.textValue.set(params.value ?? '');
        this.flagCode.set(params.value ? COUNTRY_CODES[params.value] : undefined);
    }

    refresh() {
        return false;
    }
}
