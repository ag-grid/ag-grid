import type { ICellRendererComp, ICellRendererParams } from 'ag-grid-community';

import type { CountryData, ImageContext } from './interfaces';

export class CountryCellRenderer implements ICellRendererComp {
    private readonly eGui = document.createElement('div');

    public init(params: ICellRendererParams<CountryData, string, ImageContext>): void {
        const data = params.data;
        const image = document.createElement('img');
        image.alt = data ? `${data.country} flag` : '';
        image.className = 'country-flag';
        image.src = data ? `data:image/png;base64,${params.context.flagImages[data.countryCode]}` : '';

        this.eGui.append(image, document.createTextNode(params.value ?? ''));
    }

    public getGui(): HTMLElement {
        return this.eGui;
    }

    public refresh(): boolean {
        return false;
    }
}
