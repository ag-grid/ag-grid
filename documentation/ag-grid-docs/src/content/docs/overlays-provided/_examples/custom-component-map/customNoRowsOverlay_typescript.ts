import type { INoRowsOverlayComp, INoRowsOverlayParams } from 'ag-grid-community';

type CustomNoRowsOverlayParams = INoRowsOverlayParams & { noRowsMessageFunc: () => string };

export class CustomNoRowsOverlay implements INoRowsOverlayComp {
    eGui!: HTMLElement;
    private messageEl!: HTMLElement;

    init(params: CustomNoRowsOverlayParams) {
        this.eGui = document.createElement('div');
        const overlay = document.createElement('div');
        overlay.className = 'overlay-loading-center';
        overlay.setAttribute('role', 'presentation');
        overlay.style.backgroundColor = '#b4bebe';

        const icon = document.createElement('i');
        icon.className = 'far fa-frown';
        icon.setAttribute('aria-live', 'polite');
        icon.setAttribute('aria-atomic', 'true');

        this.messageEl = icon;

        overlay.appendChild(icon);
        this.eGui.appendChild(overlay);

        this.refresh(params);
    }

    getGui() {
        return this.eGui;
    }

    refresh(params: CustomNoRowsOverlayParams): void {
        if (!this.messageEl) {
            return;
        }

        this.messageEl.textContent = params.noRowsMessageFunc();
    }
}
