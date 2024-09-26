import type { ICellRendererComp, ICellRendererParams } from 'ag-grid-community';

export class MedalCellRenderer implements ICellRendererComp {
    eGui!: HTMLSpanElement;

    // init method gets the details of the cell to be renderer
    init(params: ICellRendererParams<IOlympicData, number>) {
        this.eGui = document.createElement('span');
        this.eGui.textContent = new Array(params.value!).fill('#').join('');
    }

    getGui() {
        return this.eGui;
    }

    refresh(params: ICellRendererParams): boolean {
        return false;
    }
}
