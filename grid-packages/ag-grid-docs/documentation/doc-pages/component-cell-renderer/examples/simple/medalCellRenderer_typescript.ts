import { ICellRendererComp, ICellRendererParams } from "@ag-grid-community/core";

export class MedalCellRenderer implements ICellRendererComp {
    eGui!: HTMLSpanElement;

    // init method gets the details of the cell to be renderer
    init(params: ICellRendererParams) {
        this.eGui = document.createElement('span');
        this.eGui.innerHTML = new Array(parseInt(params.value, 10)).fill('#').join('');
    }

    getGui() {
        return this.eGui;
    }

    refresh(params: ICellRendererParams): boolean {
        return false;
    }
}

