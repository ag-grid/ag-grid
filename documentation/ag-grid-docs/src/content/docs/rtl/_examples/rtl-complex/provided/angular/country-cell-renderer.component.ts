import { Component, signal } from '@angular/core';

import type { ICellRendererAngularComp } from 'ag-grid-angular';
import type { ICellRendererParams } from 'ag-grid-community';

@Component({
    standalone: true,
    template: `<span style="cursor: default; overflow: hidden; text-overflow: ellipsis">
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
    </span>`,
})
export class CountryCellRenderer implements ICellRendererAngularComp {
    public readonly textValue = signal<string | undefined>(undefined);
    public readonly flagCode = signal<string | undefined>(undefined);

    public agInit(params: ICellRendererParams): void {
        this.flagCode.set(undefined);

        const value = params.value;
        // Blank, empty or the set-filter "Select All" entry: show the raw value with no flag.
        if (value == null || value === '' || value === '(Select All)') {
            this.textValue.set(value);
            return;
        }

        // Only render a flag when a country code resolves; the localised Arabic/Hebrew names have no
        // entry in COUNTRY_CODES, so guarding here avoids requesting undefined.png (404s).
        const code = params.context.COUNTRY_CODES[value];
        if (code) {
            this.flagCode.set(code);
        }
        this.textValue.set(value);
    }

    public refresh(): boolean {
        return false;
    }
}
