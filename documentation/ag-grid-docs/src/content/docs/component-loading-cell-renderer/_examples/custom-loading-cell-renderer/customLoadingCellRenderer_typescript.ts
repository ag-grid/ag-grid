import type { ILoadingCellRendererComp, ILoadingCellRendererParams } from 'ag-grid-community';

export class CustomLoadingCellRenderer implements ILoadingCellRendererComp {
    eGui!: HTMLElement;

    init(params: ILoadingCellRendererParams & { loadingMessage: string }) {
        this.eGui = document.createElement('div');
        this.eGui.innerHTML = `
            <div class="ag-custom-loading-cell" style="padding-left: 10px; line-height: 25px;">  
                <i class="fas fa-spinner fa-pulse"></i> 
                <span>${params.loadingMessage} </span>
            </div>
        `;
    }

    getGui() {
        return this.eGui;
    }
}
