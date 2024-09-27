import type { ICellRendererComp, ICellRendererParams } from 'ag-grid-community';

export class ColourCellRenderer implements ICellRendererComp {
    eGui!: HTMLDivElement;

    init(params: ICellRendererParams) {
        this.eGui = document.createElement('div');
        if (params.value === '(Select All)') {
            this.eGui.textContent = params.value;
        } else {
            this.eGui.textContent = params.valueFormatted || '';
            this.eGui.style.color = this.removeSpaces(params.valueFormatted || '');
        }
    }

    removeSpaces(str: string) {
        return str ? str.replace(/\s/g, '') : str;
    }

    getGui() {
        return this.eGui;
    }

    refresh() {
        return false;
    }
}
