import { ICellRendererComp, ICellRendererParams } from "@ag-grid-community/core";

export class CustomLoadingOverlay implements ICellRendererComp {
    eGui!: HTMLElement;

    init(params: ICellRendererParams & { loadingMessage: string }) {
        this.eGui = document.createElement('div');
        this.eGui.innerHTML =
            `<div class="ag-overlay-loading-center">
               <div style="height:100px; width:100px; background: url(https://ag-grid.com/images/ag-grid-loading-spinner.svg) center / contain no-repeat; margin: 0 auto;" aria-label="loading"></div>
               <div>${params.loadingMessage}</div>
            </div>`;
    }

    getGui() {
        return this.eGui;
    }

    refresh(params: ICellRendererParams): boolean {
        return false;
    }
}