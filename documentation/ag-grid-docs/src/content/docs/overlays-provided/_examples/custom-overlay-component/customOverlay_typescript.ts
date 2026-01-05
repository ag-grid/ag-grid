import type { IOverlayComp, IOverlayParams } from 'ag-grid-community';

type CustomOverlayParams = IOverlayParams & { loadingMessage: string; noRowsMessage: string };

export class CustomOverlay implements IOverlayComp {
    eGui!: HTMLElement;
    private messageEl!: HTMLElement;

    init(params: CustomOverlayParams) {
        this.eGui = document.createElement('div');
        const overlay = document.createElement('div');
        overlay.className = 'overlay-center';

        const message = document.createElement('div');

        this.messageEl = message;

        overlay.appendChild(message);
        this.eGui.appendChild(overlay);

        this.refresh(params);
    }

    getGui() {
        return this.eGui;
    }

    refresh(params: CustomOverlayParams): void {
        if (!this.messageEl) {
            return;
        }

        let message = 'Default Message';
        if (params.overlayType === 'loading') {
            message = params.loadingMessage;
        } else if (params.overlayType === 'noRows') {
            message = params.noRowsMessage;
        }

        this.messageEl.textContent = message;
    }
}
