import type { INoRowsOverlayComp, INoRowsOverlayParams } from 'ag-grid-community';

type CustomNoRowsOverlayParams = INoRowsOverlayParams & { noRowsMessageFunc: () => string };

export class CustomNoRowsOverlay implements INoRowsOverlayComp {
    eGui!: HTMLElement;

    init(params: CustomNoRowsOverlayParams) {
        this.eGui = document.createElement('div');
        this.refresh(params);
    }

    getGui() {
        return this.eGui;
    }

    refresh(params: CustomNoRowsOverlayParams): void {
        this.eGui.innerHTML = `
            <div role="presentation" class="ag-overlay-loading-center" style="background-color: #b4bebe;">
                <i class="far fa-frown" aria-live="polite" aria-atomic="true"> ${params.noRowsMessageFunc()} </i>
            </div>
        `;
    }
}
