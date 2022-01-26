import { ICellRendererParams, ICellRendererComp } from "@ag-grid-community/core";

export class ColourCellRenderer implements ICellRendererComp {
    eGui!: HTMLDivElement;

    init(params: ICellRendererParams) {
        this.eGui = document.createElement('div');
        if (params.value === '(Select All)') {
            this.eGui.innerText = params.value;
        } else {
            this.eGui.innerText = params.valueFormatted;
            this.eGui.style.color = this.removeSpaces(params.valueFormatted);
        }
    }

    removeSpaces(str: string) {
        return str ? str.replace(/\s/g, '') : str
    }

    getGui() {
        return this.eGui;
    }

    refresh() {
        return false
    }
}

