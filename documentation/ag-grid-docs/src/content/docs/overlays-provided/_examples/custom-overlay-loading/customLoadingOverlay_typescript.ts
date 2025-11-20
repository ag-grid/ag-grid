import type { ILoadingOverlayComp, ILoadingOverlayParams } from 'ag-grid-community';

type CustomLoadingOverlayParams = ILoadingOverlayParams & { loadingMessage: string };

export class CustomLoadingOverlay implements ILoadingOverlayComp {
    eGui!: HTMLElement;
    private messageEl!: HTMLElement;

    init(params: CustomLoadingOverlayParams) {
        this.eGui = document.createElement('div');
        const overlay = document.createElement('div');
        overlay.className = 'overlay-loading-center';
        overlay.setAttribute('role', 'presentation');

        const spinner = document.createElement('div');
        spinner.setAttribute('role', 'presentation');
        spinner.style.height = '100px';
        spinner.style.width = '100px';
        spinner.style.background =
            'url(https://www.ag-grid.com/images/ag-grid-loading-spinner.svg) center / contain no-repeat';
        spinner.style.margin = '0 auto';

        const message = document.createElement('div');
        message.setAttribute('aria-live', 'polite');
        message.setAttribute('aria-atomic', 'true');

        this.messageEl = message;

        overlay.appendChild(spinner);
        overlay.appendChild(message);
        this.eGui.appendChild(overlay);

        this.refresh(params);
    }

    getGui() {
        return this.eGui;
    }

    refresh(params: CustomLoadingOverlayParams): void {
        if (!this.messageEl) {
            return;
        }

        this.messageEl.textContent = params.loadingMessage;
    }
}
