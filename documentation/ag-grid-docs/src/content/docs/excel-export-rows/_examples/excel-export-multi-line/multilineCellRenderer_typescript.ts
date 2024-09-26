import type { ICellRendererComp, ICellRendererParams } from 'ag-grid-community';

export class MultilineCellRenderer implements ICellRendererComp {
    eGui!: HTMLDivElement;

    init(params: ICellRendererParams) {
        this.eGui = document.createElement('div');
        this.eGui.innerHTML = params.value.replace('\n', '<br/>');
    }

    getGui() {
        return this.eGui;
    }

    refresh() {
        return false;
    }
}
