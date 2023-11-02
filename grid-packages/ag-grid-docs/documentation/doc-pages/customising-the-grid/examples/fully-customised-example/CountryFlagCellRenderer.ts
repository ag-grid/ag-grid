import { ICellRendererComp, ICellRendererParams } from '@ag-grid-community/core';

export class CountryFlagCellRenderer implements ICellRendererComp{
    eGui!: HTMLImageElement;

    init(params: ICellRendererParams) {
        this.eGui = document.createElement('img');
        this.eGui.src = this.getFlagForCountry(params.value);
    }

    getGui() { 
        return this.eGui;
    }

    refresh(params: ICellRendererParams): boolean {
        return false
    }

    getFlagForCountry = (country: string): string => {
        if (country === 'USA') {
            return 'https://downloads.jamesswinton.com/flags/us-flag.png'
        }

        if (country === 'China') {
            return 'https://downloads.jamesswinton.com/flags/cn-flag.png'
        }

        if (country === 'Kazakhstan') {
            return 'https://downloads.jamesswinton.com/flags/kz-flag.png'
        }

        return '';
    }
}