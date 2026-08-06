import { ChangeDetectionStrategy, Component, signal } from '@angular/core';

import type { ICellRendererAngularComp } from 'ag-grid-angular';
import type { ICellRendererParams } from 'ag-grid-community';

import type { CountryData, ImageContext } from './interfaces';

@Component({
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `<img alt="{{ country() }} flag" class="country-flag" src="{{ imageSource() }}" />{{ country() }}`,
})
export class CountryCellRenderer implements ICellRendererAngularComp {
    public country = signal('');
    public imageSource = signal('');

    public agInit(params: ICellRendererParams<CountryData, string, ImageContext>): void {
        const data = params.data;
        this.country.set(params.value ?? '');
        this.imageSource.set(data ? `data:image/png;base64,${params.context.flagImages[data.countryCode]}` : '');
    }

    public refresh(): boolean {
        return false;
    }
}
