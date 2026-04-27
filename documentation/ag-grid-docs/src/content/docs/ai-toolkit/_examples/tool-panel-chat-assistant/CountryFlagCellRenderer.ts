import type { ICellRendererComp, ICellRendererParams } from 'ag-grid-community';

export class CountryFlagCellRenderer implements ICellRendererComp {
    eGui!: HTMLDivElement;

    init(params: ICellRendererParams) {
        this.eGui = document.createElement('div');
        this.eGui.style.display = 'flex';
        this.eGui.style.alignItems = 'center';
        this.eGui.style.gap = '6px';

        if (!params.value) {
            this.eGui.textContent = '';
            return;
        }

        const countryCode = params.value.toLowerCase();
        const flagUrl = `https://flags.fmcdn.net/data/flags/mini/${countryCode}.png`;
        const flagImage = document.createElement('img');
        flagImage.src = flagUrl;
        flagImage.width = 15;
        flagImage.height = 10;
        flagImage.style.border = '0';

        const countryText = document.createElement('span');
        countryText.textContent = params.value;

        this.eGui.appendChild(flagImage);
        this.eGui.appendChild(countryText);
    }

    getGui() {
        return this.eGui;
    }

    refresh() {
        return false;
    }
}
