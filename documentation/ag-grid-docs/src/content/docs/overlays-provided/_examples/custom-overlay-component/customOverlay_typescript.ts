import type { IOverlayComp, IOverlayParams } from 'ag-grid-community';

type CustomOverlayParams = IOverlayParams & { loadingMessage: string; noRowsMessage: string };

export class CustomOverlay implements IOverlayComp {
    eGui!: HTMLElement;
    private messageEl!: HTMLElement;

    init(params: CustomOverlayParams) {
        this.eGui = document.createElement('div');
        const overlay = document.createElement('div');
        overlay.className = 'overlay-center';
        overlay.setAttribute('role', 'presentation');

        if (params.overlayType === 'loading') {
            const spinner = document.createElement('div');
            spinner.setAttribute('role', 'presentation');
            spinner.style.height = '100px';
            spinner.style.width = '100px';
            spinner.style.background =
                'url(https://www.ag-grid.com/images/ag-grid-loading-spinner.svg) center / contain no-repeat';
            spinner.style.margin = '0 auto';
            overlay.appendChild(spinner);
        }

        const message = document.createElement('div');
        message.setAttribute('aria-live', 'polite');
        message.setAttribute('aria-atomic', 'true');

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

        let message = '';
        if (params.overlayType === 'loading') {
            message = params.loadingMessage;
        } else if (params.overlayType === 'noRows') {
            message = params.noRowsMessage;
        }

        this.messageEl.textContent = message;
    }
}
