import type { ILoadingCellRendererComp, ILoadingCellRendererParams } from 'ag-grid-community';

export class CustomLoadingCellRenderer implements ILoadingCellRendererComp {
    private eGui!: HTMLElement;

    init(params: ILoadingCellRendererParams & { loadingMessage: string }) {
        this.eGui = document.createElement('div');
        this.eGui.className = 'ag-custom-loading-cell';
        this.eGui.innerHTML = `<i class="fas fa-spinner fa-pulse"></i> <span>${params.loadingMessage}</span>`;
    }

    getGui() {
        return this.eGui;
    }
}
