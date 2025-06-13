import type { ICellRendererParams } from 'ag-grid-community';

export class FastRenderer {
    eGui!: HTMLDivElement;

    init(params: ICellRendererParams) {
        this.eGui = document.createElement('div');
        this.refresh(params);
    }

    getGui() {
        return this.eGui;
    }

    refresh(params: ICellRendererParams) {
        this.eGui.textContent = params.value;
        return true;
    }

    destroy() {}
}
