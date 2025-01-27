import { ChangeDetectionStrategy, Component, signal } from '@angular/core';

import type { ICellRendererAngularComp } from 'ag-grid-angular';
import type { ICellRendererParams } from 'ag-grid-community';

import type { FlagContext, IOlympicData } from './interfaces';

@Component({
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `<img alt="{{ country() }}" src="{{ base64flags()[countryCodes()[country()]] }}" /> {{ country() }}`,
})
export class CountryCellRenderer implements ICellRendererAngularComp {
    country = signal<string>('');
    base64flags = signal<Record<string, string>>({});
    countryCodes = signal<Record<string, string>>({});

    agInit(params: ICellRendererParams<IOlympicData, any, FlagContext>): void {
        this.country.set(params.data?.country ?? '');
        this.base64flags.set(params.context.base64flags);
        this.countryCodes.set(params.context.countryCodes);
    }

    refresh() {
        return false;
    }
}
