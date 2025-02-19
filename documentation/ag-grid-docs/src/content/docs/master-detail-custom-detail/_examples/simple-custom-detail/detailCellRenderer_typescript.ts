import type { ICellRendererComp, ICellRendererParams } from 'ag-grid-community';

export class DetailCellRenderer implements ICellRendererComp {
    eGui!: HTMLElement;

    init(params: ICellRendererParams) {
        this.eGui = document.createElement('div');
        this.eGui.setAttribute('role', 'gridcell');
        this.eGui.innerHTML = '<h1 style="padding: 20px;">My Custom Detail</h1>';
    }

    getGui() {
        return this.eGui;
    }

    refresh(params: ICellRendererParams): boolean {
        return false;
    }
}
