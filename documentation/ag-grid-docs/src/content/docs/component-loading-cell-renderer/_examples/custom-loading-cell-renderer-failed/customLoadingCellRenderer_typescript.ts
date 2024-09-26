import type { ILoadingCellRendererComp, ILoadingCellRendererParams } from 'ag-grid-community';

export class CustomLoadingCellRenderer implements ILoadingCellRendererComp {
    eGui!: HTMLElement;

    init(params: ILoadingCellRendererParams & { loadingMessage: string }) {
        this.eGui = document.createElement('div');
        if (params.node.failedLoad) {
            this.eGui.innerHTML = `
                <div class="ag-custom-loading-cell" style="padding-left: 10px; line-height: 25px;">
                    <i class="fas fa-times"></i>
                    <span>Data failed to load</span>
                </div>
            `;
            return;
        }
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
