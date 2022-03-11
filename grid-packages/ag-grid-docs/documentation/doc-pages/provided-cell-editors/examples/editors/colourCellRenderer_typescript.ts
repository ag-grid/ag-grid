import { ICellRendererParams, ICellRendererComp } from "@ag-grid-community/core";

export class ColourCellRenderer implements ICellRendererComp {
    eGui!: HTMLDivElement;

    init(params: ICellRendererParams) {
        this.eGui = document.createElement('div');
        this.eGui.innerText = params.value;
        this.eGui.style.borderLeft = '10px solid ' + params.value;
        this.eGui.style.paddingLeft = '5px';
    }

    getGui() {
        return this.eGui;
    }

    refresh() {
        return false
    }
}

