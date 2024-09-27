import type { ICellRendererComp, ICellRendererParams } from 'ag-grid-community';

export class CountryFlagCellRenderer implements ICellRendererComp {
    eGui!: HTMLImageElement;

    init(params: ICellRendererParams) {
        this.eGui = document.createElement('img');
        this.eGui.src = this.getFlagForCountry(params.value);
    }

    getGui() {
        return this.eGui;
    }

    refresh(params: ICellRendererParams): boolean {
        return false;
    }

    getFlagForCountry = (country: string): string => {
        if (country === 'USA') {
            return 'https://www.ag-grid.com/example-assets/flags/us-flag.png';
        }

        if (country === 'China') {
            return 'https://www.ag-grid.com/example-assets/flags/cn-flag.png';
        }

        if (country === 'Kazakhstan') {
            return 'https://www.ag-grid.com/example-assets/flags/kz-flag.png';
        }

        return '';
    };
}
