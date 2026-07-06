import type { INoRowsOverlayComp, INoRowsOverlayParams } from 'ag-grid-community';

type CustomNoRowsOverlayParams = INoRowsOverlayParams & {
    noRows: { overlayText: string };
};

export class CustomNoRowsOverlay implements INoRowsOverlayComp {
    eGui!: HTMLElement;
    private messageEl!: HTMLElement;
    private message = '';
    private attached = false;

    init(params: CustomNoRowsOverlayParams) {
        this.eGui = document.createElement('div');
        const overlay = document.createElement('div');
        overlay.className = 'overlay-loading-center';
        overlay.setAttribute('role', 'presentation');
        overlay.style.backgroundColor = '#b4bebe';

        const icon = document.createElement('i');
        icon.className = 'far fa-frown';
        icon.setAttribute('aria-hidden', 'true');

        const message = document.createElement('span');
        message.setAttribute('role', 'status');

        this.messageEl = message;

        overlay.append(icon, ' ', message);
        this.eGui.appendChild(overlay);

        this.refresh(params);
    }

    getGui() {
        return this.eGui;
    }

    refresh(params: CustomNoRowsOverlayParams): void {
        this.message = params.noRows.overlayText;
        if (this.attached) {
            this.messageEl.textContent = this.message;
        }
    }

    afterGuiAttached(): void {
        this.attached = true;
        this.messageEl.textContent = this.message;
    }
}
