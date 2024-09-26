import type { ICellRendererParams } from 'ag-grid-community';

interface CustomButtonParams extends ICellRendererParams {
    onClick: () => void;
}

export class CustomButtonComponent {
    eGui!: HTMLDivElement;
    eButton: any;
    eventListener!: () => void;

    init(params: CustomButtonParams) {
        this.eGui = document.createElement('div');
        const eButton = document.createElement('button');
        eButton.className = 'btn-simple';
        eButton.textContent = 'Launch!';
        this.eventListener = params.onClick;
        eButton.addEventListener('click', this.eventListener);
        this.eGui.appendChild(eButton);
    }

    getGui() {
        return this.eGui;
    }

    refresh() {
        return true;
    }

    destroy() {
        if (this.eButton) {
            this.eButton.removeEventListener('click', this.eventListener);
        }
    }
}
