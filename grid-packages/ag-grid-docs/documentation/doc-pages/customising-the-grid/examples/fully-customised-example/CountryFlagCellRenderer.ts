import { ICellRendererComp, ICellRendererParams } from '@ag-grid-community/core';

export class CountryFlagCellRenderer implements ICellRendererComp{
    eGui!: HTMLImageElement;

    init(params: ICellRendererParams) {
        let flagIcon = this.getFlagForCountry(params.value);
        console.log(flagIcon);
        this.eGui = document.createElement('img');
        this.eGui.src = flagIcon;
    }

    getGui() { 
        return this.eGui;
    }

    refresh(params: ICellRendererParams): boolean {
        return false
    }

    getFlagForCountry = (country: String): String => {
        if (country === 'USA') {
            return 'https://www.ag-grid.com/example-assets/flags/us-flag.png'
        }

        if (country === 'China') {
            return 'https://www.ag-grid.com/example-assets/flags/cn-flag.png'
        }

        if (country === 'Kazakhstan') {
            return 'https://www.ag-grid.com/example-assets/flags/kz-flag.png'
        }

        return '';
    }
}