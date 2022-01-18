import { ICellRendererComp, ICellRendererParams } from "@ag-grid-community/core";

export class CustomLoadingCellRenderer implements ICellRendererComp {
    eGui!: HTMLElement;

    init(params: ICellRendererParams & { loadingMessage: string }) {
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

    refresh(params: ICellRendererParams): boolean {
        return false;
    }
}

