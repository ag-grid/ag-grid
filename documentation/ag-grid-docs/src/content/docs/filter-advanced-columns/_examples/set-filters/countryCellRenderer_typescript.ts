import type { ICellRendererComp, ICellRendererParams } from 'ag-grid-community';

import { COUNTRY_CODES } from './countryCodes';

export class CountryCellRenderer implements ICellRendererComp {
    eGui!: HTMLDivElement;

    init(params: ICellRendererParams) {
        this.eGui = document.createElement('div');
        const code = params.value ? COUNTRY_CODES[params.value] : undefined;
        const flag = code
            ? `<img class="flag" border="0" width="15" height="10" src="https://flags.fmcdn.net/data/flags/mini/${code}.png"> `
            : '';
        this.eGui.innerHTML = `${flag}${params.value ?? ''}`;
    }

    getGui() {
        return this.eGui;
    }

    refresh() {
        return false;
    }
}
