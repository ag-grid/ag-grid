import type { ICellRendererComp, ICellRendererParams } from 'ag-grid-community';

export class CountryCellRenderer implements ICellRendererComp {
    eGui!: HTMLSpanElement;

    init(params: ICellRendererParams) {
        this.eGui = document.createElement('span');
        this.eGui.style.cursor = 'default';
        this.eGui.style.overflow = 'hidden';
        this.eGui.style.textOverflow = 'ellipsis';

        if (params.value == null || params.value === '' || params.value === '(Select All)') {
            this.eGui.innerHTML = params.value;
            return;
        }

        const code = params.context.COUNTRY_CODES[params.value];
        if (code) {
            const flag = `<img class="flag" border="0" width="15" height="10" src="https://flags.fmcdn.net/data/flags/mini/${code}.png">`;
            this.eGui.innerHTML = `${flag} ${params.value}`;
        } else {
            this.eGui.innerHTML = params.value;
        }
    }

    getGui() {
        return this.eGui;
    }

    refresh() {
        return false;
    }
}
