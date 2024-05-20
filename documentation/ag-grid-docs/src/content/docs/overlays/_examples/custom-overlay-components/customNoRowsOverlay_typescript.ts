import { ICellRendererComp, ICellRendererParams } from '@ag-grid-community/core';

export class CustomNoRowsOverlay implements ICellRendererComp {
    eGui!: HTMLElement;

    init(params: ICellRendererParams & { noRowsMessageFunc: () => string }) {
        this.eGui = document.createElement('div');
        this.eGui.innerHTML = `
            <div role="presentation" class="ag-overlay-loading-center" style="background-color: #b4bebe;">
                <i class="far fa-frown" aria-live="polite" aria-atomic="true"> ${params.noRowsMessageFunc()} </i>
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
