import { ICellRendererComp, ICellRendererParams } from "@ag-grid-community/core";

export class CustomNoRowsOverlay implements ICellRendererComp {
    eGui!: HTMLElement;

    init(params: ICellRendererParams & { noRowsMessageFunc: () => string }) {
        this.eGui = document.createElement('div');
        this.eGui.innerHTML = `
            <div class="ag-overlay-loading-center" style="background-color: lightcoral;">   
                <i class="far fa-frown"> ${params.noRowsMessageFunc()} </i>
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

