import { ICellRendererComp, ICellRendererParams } from "@ag-grid-community/core";

export class MedalCellRenderer implements ICellRendererComp {
    eGui!: HTMLElement;
    params!: ICellRendererParams;

    // init method gets the details of the cell to be renderer
    init(params: ICellRendererParams) {
        this.params = params;
        this.eGui = document.createElement('span');
        this.eGui.innerHTML = new Array(params.value).fill('#').join('');
    }

    getGui() {
        return this.eGui;
    }

    medalUserFunction() {
        console.log(`user function called for medal column: row = ${this.params.rowIndex}, column = ${this.params.column?.getId()}`);
    }

    refresh(params: ICellRendererParams): boolean {
        return false;
    }
}

