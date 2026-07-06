import type { ILoadingOverlayComp, ILoadingOverlayParams } from 'ag-grid-community';

type CustomLoadingOverlayParams = ILoadingOverlayParams & {
    loading: { overlayText: string };
};

export class CustomLoadingOverlay implements ILoadingOverlayComp {
    eGui!: HTMLElement;
    messageEl!: HTMLElement;
    message = '';
    attached = false;

    init(params: CustomLoadingOverlayParams) {
        this.eGui = document.createElement('div');

        const overlay = document.createElement('div');
        overlay.className = 'overlay-loading-center';

        const spinner = document.createElement('div');
        spinner.setAttribute('aria-hidden', 'true');
        spinner.style.cssText =
            'height:100px; width:100px; background: url(https://www.ag-grid.com/images/ag-grid-loading-spinner.svg) center / contain no-repeat; margin: 0 auto;';

        const message = document.createElement('div');
        message.setAttribute('role', 'status');
        this.messageEl = message;

        overlay.append(spinner, message);
        this.eGui.appendChild(overlay);

        this.refresh(params);
    }

    getGui() {
        return this.eGui;
    }

    refresh(params: CustomLoadingOverlayParams): void {
        this.message = params.loading.overlayText;
        if (this.attached) {
            this.messageEl.textContent = this.message;
        }
    }

    afterGuiAttached(): void {
        this.attached = true;
        this.messageEl.textContent = this.message;
    }
}
