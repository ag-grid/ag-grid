import { ICellRendererComp, ICellRendererParams } from "@ag-grid-community/core";

export class CustomLoadingOverlay implements ICellRendererComp {
    eGui!: HTMLElement;

    init(params: ICellRendererParams & { loadingMessage: string }) {
        this.eGui = document.createElement('div');
        this.eGui.innerHTML =
            '<div class="ag-overlay-loading-center" style="background-color: lightsteelblue;">' +
            '   <i class="fas fa-hourglass-half"> ' + params.loadingMessage + ' </i>' +
            '</div>';
    }

    getGui() {
        return this.eGui;
    }

    refresh(params: ICellRendererParams): boolean {
        return false;
    }
}