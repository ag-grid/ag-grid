import type { ICellRendererComp, ICellRendererParams } from 'ag-grid-community';

export class CountryCellRenderer implements ICellRendererComp {
    eGui!: HTMLDivElement;

    init(params: ICellRendererParams & { isFilterRenderer?: boolean }) {
        this.eGui = document.createElement('div');

        if (!params.value) {
            this.eGui.innerHTML = params.isFilterRenderer ? '(Blanks)' : params.value;
        } else if (params.value === '(Select All)') {
            this.eGui.innerHTML = params.value;
        } else {
            const url = `https://flags.fmcdn.net/data/flags/mini/${params.context.COUNTRY_CODES[params.value]}.png`;
            const flagImage = `<img class="flag" border="0" width="15" height="10" src="${url}">`;

            this.eGui.innerHTML = `${flagImage} ${params.value}`;
        }
    }

    getGui() {
        return this.eGui;
    }

    refresh() {
        return false;
    }
}
