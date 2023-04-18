import { ICellRendererComp, ICellRendererParams } from 'ag-grid-community';

export class ActionsCellRenderer implements ICellRendererComp {
    eGui!: HTMLDivElement;

    init(params: ICellRendererParams) {
        this.eGui = document.createElement('div');
        this.eGui.innerHTML = `<button class="font-size-small">Do it</button>`;
    }

    getGui() {
        return this.eGui;
    }

    refresh(params) {
        return true;
    }
}
