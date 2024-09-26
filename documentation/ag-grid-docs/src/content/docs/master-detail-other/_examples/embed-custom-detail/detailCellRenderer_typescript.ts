import type { ICellRendererComp, ICellRendererParams } from 'ag-grid-community';

export class DetailCellRenderer implements ICellRendererComp {
    eGui!: HTMLElement;

    init(params: ICellRendererParams) {
        this.eGui = document.createElement('div');
        this.eGui.innerHTML =
            '<h1 class="custom-detail" style="padding: 20px;">' + (params.pinned ? params.pinned : 'center') + '</h1>';
    }

    getGui() {
        return this.eGui;
    }

    refresh(params: ICellRendererParams): boolean {
        return false;
    }
}
