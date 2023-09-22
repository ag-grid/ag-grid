import { ICellRendererComp, ICellRendererParams } from "@ag-grid-community/core";

export class CustomLoadingOverlay implements ICellRendererComp {
    eGui!: HTMLElement;

    init(params: ICellRendererParams & { loadingMessage: string }) {
        this.eGui = document.createElement('div');
        this.eGui.innerHTML =
            `<div class="ag-overlay-loading-center">
               <object style="height:100px; width:100px" type="image/svg+xml" data="https://ag-grid.com/images/ag-grid-loading-spinner.svg" aria-label="loading"></object>
               <div>  ${params.loadingMessage} </div>
            </div>`;
    }

    getGui() {
        return this.eGui;
    }

    refresh(params: ICellRendererParams): boolean {
        return false;
    }
}